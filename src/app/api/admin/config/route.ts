import { NextResponse } from "next/server";
import { z } from "zod";
import { checkAdminPassword, getConfig, saveConfig } from "@/lib/store";
import { createSeedConfig } from "@/lib/seed";
import type { EventConfig } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function auth(request: Request): boolean {
  const header = request.headers.get("x-admin-password");
  return checkAdminPassword(header);
}

const personSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  photoUrl: z.string().min(1),
  silhouette: z.boolean(),
  clues: z.array(z.string()),
  aliases: z.array(z.string()),
});

const giftSchema = z.object({
  id: z.string().min(1),
  slot: z.number().int().min(1).max(40),
  displayNumber: z.number().int().positive(),
  question: z.string().min(1),
  label: z.string().min(1),
  description: z.string(),
  claimedBy: z.string().nullable(),
  claimedAt: z.string().nullable(),
});

const configSchema = z.object({
  title: z.string().min(1),
  welcomeText: z.string(),
  people: z.array(personSchema),
  gifts: z.array(giftSchema).min(1).max(40),
});

export async function GET(request: Request) {
  if (!auth(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const config = await getConfig();
  return NextResponse.json({ ok: true, config });
}

export async function PUT(request: Request) {
  if (!auth(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const parsed = configSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Cấu hình chưa hợp lệ (kiểm tra người / quà).", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const displayNumbers = parsed.data.gifts.map((g) => g.displayNumber);
  if (new Set(displayNumbers).size !== displayNumbers.length) {
    return NextResponse.json(
      { ok: false, error: "Đáp án số (displayNumber) trên quà phải không trùng nhau." },
      { status: 400 },
    );
  }

  const next: EventConfig = {
    ...parsed.data,
    updatedAt: new Date().toISOString(),
  };
  await saveConfig(next);
  return NextResponse.json({ ok: true, config: next });
}

export async function POST(request: Request) {
  if (!auth(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let action = "reset-claims";
  try {
    const body = (await request.json()) as { action?: string };
    if (body.action) action = body.action;
  } catch {
    // default
  }

  if (action === "reseed") {
    const seed = createSeedConfig();
    await saveConfig(seed);
    return NextResponse.json({ ok: true, config: seed });
  }

  const config = await getConfig();
  config.gifts = config.gifts.map((g) => ({
    ...g,
    claimedBy: null,
    claimedAt: null,
  }));
  await saveConfig(config);
  return NextResponse.json({ ok: true, config });
}
