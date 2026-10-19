import { NextResponse } from "next/server";
import { z } from "zod";
import { getConfig, normalizeAnswer } from "@/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bodySchema = z.object({
  personId: z.string().min(1),
  answer: z.string().min(1).max(120),
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
    return NextResponse.json({ ok: false, error: "Thiếu thông tin đoán." }, { status: 400 });
  }

  const config = await getConfig();
  const person = config.people.find((p) => p.id === parsed.data.personId);
  if (!person) {
    return NextResponse.json({ ok: false, error: "Không tìm thấy vòng chơi." }, { status: 404 });
  }

  const answer = normalizeAnswer(parsed.data.answer);
  const aliases = person.aliases.map(normalizeAnswer);
  const correct =
    aliases.includes(answer) || normalizeAnswer(person.name) === answer;

  if (!correct) {
    return NextResponse.json({
      ok: true,
      correct: false,
      message: "Chưa đúng rồi — thử manh mối khác hoặc hỏi thêm đồng nghiệp nhé!",
    });
  }

  return NextResponse.json({
    ok: true,
    correct: true,
    name: person.name,
    photoUrl: person.photoUrl,
    message: `Chính xác! Đó là ${person.name} 🎉`,
  });
}
