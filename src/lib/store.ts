import { promises as fs } from "fs";
import path from "path";
import {
  BlobNotFoundError,
  BlobPreconditionFailedError,
  get as blobGet,
  put as blobPut,
} from "@vercel/blob";
import { createSeedConfig, ensureGiftQuestions } from "./seed";
import type { EventConfig, PublicEvent } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "event-store.json");
const TMP_STORE = path.join("/tmp", "womens-day-event-store.json");
/** Durable pathname in Vercel Blob (private store). */
const BLOB_PATHNAME = "event-store.json";
const MAX_MUTATE_RETRIES = 4;

type GlobalStore = {
  __womensDayStore?: EventConfig;
};

type LoadedConfig = {
  config: EventConfig;
  /** Blob ETag for conditional writes; null when using disk/memory. */
  etag: string | null;
};

function memory(): GlobalStore {
  return globalThis as unknown as GlobalStore;
}

function isVercel(): boolean {
  return process.env.VERCEL === "1" || process.env.VERCEL === "true";
}

/** Prefer Blob whenever a token or store id is configured (prod + local). */
function useBlobStore(): boolean {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN?.trim() ||
      process.env.BLOB_STORE_ID?.trim(),
  );
}

function candidatePaths(): string[] {
  if (isVercel()) return [TMP_STORE];
  return [STORE_FILE, TMP_STORE];
}

function normalizeConfig(config: EventConfig): EventConfig {
  return {
    ...config,
    gifts: ensureGiftQuestions(config.gifts ?? []),
  };
}

async function streamToText(stream: ReadableStream<Uint8Array>): Promise<string> {
  return new Response(stream).text();
}

async function readFromBlob(): Promise<LoadedConfig | null> {
  try {
    const result = await blobGet(BLOB_PATHNAME, {
      access: "private",
      useCache: false,
    });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    const raw = await streamToText(result.stream);
    const parsed = JSON.parse(raw) as EventConfig;
    if (!parsed?.people || !parsed?.gifts) return null;
    return {
      config: normalizeConfig(parsed),
      etag: result.blob.etag,
    };
  } catch (err) {
    if (err instanceof BlobNotFoundError) return null;
    throw err;
  }
}

async function writeToBlob(
  config: EventConfig,
  etag: string | null,
): Promise<string> {
  const payload = JSON.stringify(config, null, 2);
  const options = {
    access: "private" as const,
    contentType: "application/json",
    addRandomSuffix: false,
    cacheControlMaxAge: 60,
    ...(etag
      ? { ifMatch: etag }
      : { allowOverwrite: true }),
  };
  const result = await blobPut(BLOB_PATHNAME, payload, options);
  return result.etag;
}

async function readFromDisk(): Promise<EventConfig | null> {
  for (const file of candidatePaths()) {
    try {
      const raw = await fs.readFile(file, "utf8");
      const parsed = JSON.parse(raw) as EventConfig;
      if (parsed?.people && parsed?.gifts) return normalizeConfig(parsed);
    } catch {
      // try next
    }
  }
  return null;
}

async function writeToDisk(config: EventConfig): Promise<void> {
  const payload = JSON.stringify(config, null, 2);
  const targets = candidatePaths();
  let lastError: unknown;
  for (const file of targets) {
    try {
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, payload, "utf8");
      return;
    } catch (err) {
      lastError = err;
    }
  }
  if (lastError && process.env.NODE_ENV !== "production") {
    console.warn("Could not persist event store to disk:", lastError);
  }
}

async function loadConfig(): Promise<LoadedConfig> {
  if (useBlobStore()) {
    const fromBlob = await readFromBlob();
    if (fromBlob) {
      memory().__womensDayStore = fromBlob.config;
      return fromBlob;
    }

    // First boot: seed durable store (prefer local file if present, else seed).
    const fromDisk = await readFromDisk();
    const seed = fromDisk ?? createSeedConfig();
    const etag = await writeToBlob(seed, null);
    memory().__womensDayStore = seed;
    return { config: seed, etag };
  }

  const mem = memory();
  if (mem.__womensDayStore) {
    mem.__womensDayStore = normalizeConfig(mem.__womensDayStore);
    return { config: mem.__womensDayStore, etag: null };
  }

  const fromDisk = await readFromDisk();
  if (fromDisk) {
    mem.__womensDayStore = fromDisk;
    return { config: fromDisk, etag: null };
  }

  const seed = createSeedConfig();
  mem.__womensDayStore = seed;
  await writeToDisk(seed);
  return { config: seed, etag: null };
}

export async function getConfig(): Promise<EventConfig> {
  // With Blob, always read durable truth so serverless instances never diverge.
  if (useBlobStore()) {
    const loaded = await loadConfig();
    return loaded.config;
  }
  const loaded = await loadConfig();
  return loaded.config;
}

export async function saveConfig(config: EventConfig): Promise<EventConfig> {
  const next = normalizeConfig({
    ...config,
    updatedAt: new Date().toISOString(),
  });

  if (useBlobStore()) {
    // Unconditional overwrite for admin saves; claim path uses mutateConfig.
    await writeToBlob(next, null);
    memory().__womensDayStore = next;
    // Mirror to local disk outside Vercel for offline inspection.
    if (!isVercel()) {
      await writeToDisk(next);
    }
    return next;
  }

  memory().__womensDayStore = next;
  await writeToDisk(next);
  return next;
}

export type MutateOutcome<T> =
  | { save: true; config: EventConfig; result: T }
  | { save: false; result: T };

/**
 * Optimistic concurrency update against Blob (or local disk).
 * Retries when another instance wrote between read and write.
 * Mutator may return `save: false` to abort without writing (e.g. claim conflict).
 */
export async function mutateConfig<T>(
  mutator: (config: EventConfig) => MutateOutcome<T>,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_MUTATE_RETRIES; attempt++) {
    const loaded = await loadConfig();
    const outcome = mutator(structuredClone(loaded.config));

    if (!outcome.save) {
      return outcome.result;
    }

    const next = normalizeConfig({
      ...outcome.config,
      updatedAt: new Date().toISOString(),
    });

    if (useBlobStore()) {
      try {
        await writeToBlob(next, loaded.etag);
        memory().__womensDayStore = next;
        if (!isVercel()) {
          await writeToDisk(next);
        }
        return outcome.result;
      } catch (err) {
        if (err instanceof BlobPreconditionFailedError) {
          lastError = err;
          continue;
        }
        throw err;
      }
    }

    memory().__womensDayStore = next;
    await writeToDisk(next);
    return outcome.result;
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Could not save event store after concurrent updates.");
}

export function toPublicEvent(config: EventConfig): PublicEvent {
  return {
    title: config.title,
    welcomeText: config.welcomeText,
    // Public: clues only — never name, aliases, or photoUrl (photo returns on correct guess)
    people: config.people.map((p) => ({
      id: p.id,
      clues: p.clues,
    })),
    // Claim dropdown: id + display name only — never photoUrl
    claimers: config.people.map((p) => ({
      id: p.id,
      name: p.name,
    })),
    // Public: question + claim state; displayNumber only after claim.
    // Never expose prize label / description.
    gifts: config.gifts
      .slice()
      .sort((a, b) => a.slot - b.slot)
      .map((g) => {
        const claimed = Boolean(g.claimedBy);
        return {
          id: g.id,
          slot: g.slot,
          question: g.question,
          claimed,
          claimedBy: g.claimedBy,
          ...(claimed ? { displayNumber: g.displayNumber } : {}),
        };
      }),
  };
}

/** True if claimedBy refers to this person (by id preferred, else exact normalized name). */
export function claimedByMatchesPerson(
  claimedBy: string | null | undefined,
  person: { id: string; name: string },
): boolean {
  if (!claimedBy) return false;
  const raw = claimedBy.trim();
  if (!raw) return false;
  if (raw === person.id) return true;
  return normalizeAnswer(raw) === normalizeAnswer(person.name);
}

export function normalizeAnswer(value: string): string {
  return value
    .normalize("NFC")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function checkAdminPassword(password: string | null | undefined): boolean {
  const expected = process.env.ADMIN_PASSWORD || "demo2010";
  return Boolean(password) && password === expected;
}

export function persistenceMode(): "blob" | "disk" {
  return useBlobStore() ? "blob" : "disk";
}
