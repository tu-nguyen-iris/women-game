import { NextResponse } from "next/server";
import { z } from "zod";
import {
  claimedByMatchesPerson,
  getConfig,
  saveConfig,
} from "@/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bodySchema = z.object({
  giftId: z.string().min(1),
  answer: z.coerce.number().int().positive(),
  /** Must be a known Guess Who person id — free-text names are rejected. */
  claimerId: z.string().min(1),
});

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Chọn hộp quà, nhập câu trả lời và người nhận." },
      { status: 400 },
    );
  }

  const config = await getConfig();
  const person = config.people.find((p) => p.id === parsed.data.claimerId);

  if (!person) {
    return NextResponse.json(
      { ok: false, error: "Người nhận không hợp lệ. Hãy chọn từ danh sách." },
      { status: 400 },
    );
  }

  const alreadyClaimed = config.gifts.find((g) =>
    claimedByMatchesPerson(g.claimedBy, person),
  );
  if (alreadyClaimed) {
    return NextResponse.json(
      {
        ok: false,
        error: `${person.name} đã nhận một món quà rồi.`,
        gift: alreadyClaimed.claimedBy
          ? {
              id: alreadyClaimed.id,
              claimedBy: alreadyClaimed.claimedBy,
            }
          : undefined,
      },
      { status: 409 },
    );
  }

  const gift = config.gifts.find((g) => g.id === parsed.data.giftId);

  if (!gift) {
    return NextResponse.json(
      { ok: false, error: "Không tìm thấy hộp quà này." },
      { status: 404 },
    );
  }

  if (gift.claimedBy) {
    return NextResponse.json(
      {
        ok: false,
        error: `Hộp này đã được ${gift.claimedBy} nhận rồi.`,
        gift: {
          id: gift.id,
          claimedBy: gift.claimedBy,
        },
      },
      { status: 409 },
    );
  }

  if (parsed.data.answer !== gift.displayNumber) {
    return NextResponse.json(
      { ok: false, error: "Chưa đúng — thử lại nhé!" },
      { status: 400 },
    );
  }

  gift.claimedBy = person.name;
  gift.claimedAt = new Date().toISOString();
  await saveConfig(config);

  return NextResponse.json({
    ok: true,
    message: `Chúc mừng ${person.name}! Bạn nhận quà số ${gift.displayNumber}. Mở hộp thật để xem món quà nhé!`,
    gift: {
      id: gift.id,
      displayNumber: gift.displayNumber,
      claimedBy: gift.claimedBy,
      claimerId: person.id,
    },
  });
}
