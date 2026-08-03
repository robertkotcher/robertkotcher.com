import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const event = await request.json().catch(() => null);
  if (!event || event.type !== "email.received") {
    return NextResponse.json({ ok: true });
  }

  console.info("Inbound email received:", event.data?.email_id);
  return NextResponse.json({ ok: true });
}
