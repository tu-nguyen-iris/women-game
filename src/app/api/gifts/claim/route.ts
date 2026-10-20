import { NextResponse } from "next/server";
import { z } from "zod";
import { claimedByMatchesPerson, mutateConfig } from "@/lib/store";
import type { Gift } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bodySchema = z.object({
  giftId: z.string().min(1),
  answer: z.coerce.number().int().positive(),
  /** Must be a known Guess Who person id — free-text names are rejected. */
  claimerId: z.string().min(1),
});

type ClaimResponse = {
  status: number;
  body: Record<string, unknown>;
};

function publicClaimedGift(gift: Gift) {
  return {
    id: gift.id,
    claimedBy: gift.claimedBy,
    displayNumber: gift.displayNumber,
  };
}

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

  let response: ClaimResponse;
  try {
    response = await mutateConfig<ClaimResponse>((config) => {
      const person = config.people.find((p) => p.id === parsed.data.claimerId);

      if (!person) {
        return {
          save: false,
          result: {
            status: 400,
            body: {
              ok: false,
              error: "Người nhận không hợp lệ. Hãy chọn từ danh sách.",
            },
          },
        };
      }

      const alreadyClaimed = config.gifts.find((g) =>
        claimedByMatchesPerson(g.claimedBy, person),
      );
      if (alreadyClaimed) {
        return {
          save: false,
          result: {
            status: 409,
            body: {
              ok: false,
              error: `${person.name} đã nhận một món quà rồi.`,
              gift: alreadyClaimed.claimedBy
                ? publicClaimedGift(alreadyClaimed)
                : undefined,
            },
          },
        };
      }

      const gift = config.gifts.find((g) => g.id === parsed.data.giftId);

      if (!gift) {
        return {
          save: false,
          result: {
            status: 404,
            body: { ok: false, error: "Không tìm thấy hộp quà này." },
          },
        };
      }

      if (gift.claimedBy) {
        return {
          save: false,
          result: {
            status: 409,
            body: {
              ok: false,
              error: `Hộp này đã được ${gift.claimedBy} nhận rồi.`,
              gift: publicClaimedGift(gift),
            },
          },
        };
      }

      if (parsed.data.answer !== gift.displayNumber) {
        return {
          save: false,
          result: {
            status: 400,
            body: { ok: false, error: "Chưa đúng — thử lại nhé!" },
          },
        };
      }

      gift.claimedBy = person.name;
      gift.claimedAt = new Date().toISOString();

      return {
        save: true,
        config,
        result: {
          status: 200,
          body: {
            ok: true,
            message: `Chúc mừng ${person.name}! Bạn nhận quà số ${gift.displayNumber}. Mở hộp thật để xem món quà nhé!`,
            gift: {
              id: gift.id,
              displayNumber: gift.displayNumber,
              claimedBy: gift.claimedBy,
              claimerId: person.id,
            },
          },
        },
      };
    });
  } catch (err) {
    console.error("gift claim persist failed:", err);
    return NextResponse.json(
      { ok: false, error: "Không lưu được nhận quà — thử lại sau." },
      { status: 503 },
    );
  }

  return NextResponse.json(response.body, { status: response.status });
}
