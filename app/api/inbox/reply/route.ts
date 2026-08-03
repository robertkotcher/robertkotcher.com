import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { inboxCookie, isInboxSession, resendPost } from "@/app/lib/inbox";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  if (!isInboxSession(cookieStore.get(inboxCookie)?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { to, subject, body, messageId } = await request.json().catch(() => ({}));
  if (![to, subject, body].every((value) => typeof value === "string" && value.trim())) {
    return NextResponse.json({ error: "Recipient, subject, and message are required." }, { status: 400 });
  }

  try {
    const headers: Record<string, string> = {};
    if (typeof messageId === "string" && messageId.trim()) {
      headers["In-Reply-To"] = messageId;
      headers.References = messageId;
    }

    const result = await resendPost("/emails", {
      from: process.env.INBOX_FROM_EMAIL || "Robert Kotcher <develop@robertkotcher.com>",
      headers,
      reply_to: "develop@robertkotcher.com",
      subject: subject.trim(),
      text: body.trim(),
      to: [to.trim()],
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Inbox reply failed:", error);
    return NextResponse.json({ error: "Reply could not be sent." }, { status: 502 });
  }
}
