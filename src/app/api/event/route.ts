import { NextResponse } from "next/server";
import { getConfig, toPublicEvent } from "@/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const config = await getConfig();
  return NextResponse.json(toPublicEvent(config));
}
