import { NextResponse } from "next/server";
import { z } from "zod";
import { checkAdminPassword } from "@/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bodySchema = z.object({
  password: z.string().min(1),
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
    return NextResponse.json({ ok: false, error: "Nhập mật khẩu." }, { status: 400 });
  }

  if (!checkAdminPassword(parsed.data.password)) {
    return NextResponse.json({ ok: false, error: "Mật khẩu không đúng." }, { status: 401 });
  }

  return NextResponse.json({ ok: true, token: parsed.data.password });
}
