import { promises as fs } from "fs";
import path from "path";
import { createSeedConfig, ensureGiftQuestions } from "./seed";
import type { EventConfig, PublicEvent } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "event-store.json");
const TMP_STORE = path.join("/tmp", "womens-day-event-store.json");

type GlobalStore = {
  __womensDayStore?: EventConfig;
};

function memory(): GlobalStore {
  return globalThis as unknown as GlobalStore;
}

function isVercel(): boolean {
  return process.env.VERCEL === "1" || process.env.VERCEL === "true";
}

function candidatePaths(): string[] {
  // Prefer project data/ locally; on Vercel filesystem is read-only except /tmp
  if (isVercel()) return [TMP_STORE];
  return [STORE_FILE, TMP_STORE];
}

function normalizeConfig(config: EventConfig): EventConfig {
  return {
    ...config,
    gifts: ensureGiftQuestions(config.gifts ?? []),
  };
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
  // Memory still holds truth; disk write is best-effort on serverless
  if (lastError && process.env.NODE_ENV !== "production") {
    console.warn("Could not persist event store to disk:", lastError);
  }
}

export async function getConfig(): Promise<EventConfig> {
  const mem = memory();
  if (mem.__womensDayStore) {
    mem.__womensDayStore = normalizeConfig(mem.__womensDayStore);
    return mem.__womensDayStore;
  }

  const fromDisk = await readFromDisk();
  if (fromDisk) {
    mem.__womensDayStore = fromDisk;
    return fromDisk;
  }

  const seed = createSeedConfig();
  mem.__womensDayStore = seed;
  await writeToDisk(seed);
  return seed;
}

export async function saveConfig(config: EventConfig): Promise<EventConfig> {
  const next = normalizeConfig({
    ...config,
    updatedAt: new Date().toISOString(),
  });
  memory().__womensDayStore = next;
  await writeToDisk(next);
  return next;
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
    // Public: question + claim state only — never answer (displayNumber), label, description
    gifts: config.gifts
      .slice()
      .sort((a, b) => a.slot - b.slot)
      .map((g) => ({
        id: g.id,
        slot: g.slot,
        question: g.question,
        claimed: Boolean(g.claimedBy),
        claimedBy: g.claimedBy,
      })),
  };
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
