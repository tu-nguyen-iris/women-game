import { NextResponse } from "next/server";
import { z } from "zod";
import { getConfig, saveConfig } from "@/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bodySchema = z.object({
  displayNumber: z.coerce.number().int().positive(),
  claimerName: z.string().min(1).max(80),
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
      { ok: false, error: "Nhập số trên thẻ và tên của bạn." },
      { status: 400 },
    );
  }

  const config = await getConfig();
  const gift = config.gifts.find((g) => g.displayNumber === parsed.data.displayNumber);

  if (!gift) {
    return NextResponse.json({
      ok: false,
      error: "Không có món quà nào khớp số này. Kiểm tra lại đáp án trên thẻ nhé.",
    }, { status: 404 });
  }

  if (gift.claimedBy) {
    return NextResponse.json({
      ok: false,
      error: `Số ${gift.displayNumber} đã được ${gift.claimedBy} nhận rồi.`,
      gift: {
        id: gift.id,
        displayNumber: gift.displayNumber,
        claimedBy: gift.claimedBy,
      },
    }, { status: 409 });
  }

  const claimer = parsed.data.claimerName.trim();
  gift.claimedBy = claimer;
  gift.claimedAt = new Date().toISOString();
  await saveConfig(config);

  return NextResponse.json({
    ok: true,
    message: `Chúc mừng ${claimer}! Bạn đã nhận quà số ${gift.displayNumber}. Mở hộp thật để xem món quà nhé!`,
    gift: {
      id: gift.id,
      displayNumber: gift.displayNumber,
      claimedBy: gift.claimedBy,
    },
  });
}
