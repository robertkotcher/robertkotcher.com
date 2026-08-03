import { NextResponse } from "next/server";
import { createInboxSession, inboxCookie, isInboxPassword } from "@/app/lib/inbox";

export async function POST(request: Request) {
  const { password } = await request.json().catch(() => ({ password: "" }));
  if (!isInboxPassword(typeof password === "string" ? password : "")) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(inboxCookie, createInboxSession(), {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 14,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(inboxCookie);
  return response;
}
