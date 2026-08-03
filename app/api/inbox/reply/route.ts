import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ensureInboxSchema, storeOutboundEmail } from "@/app/lib/inbox-db";
import { inboxCookie, isInboxSession, resendPost } from "@/app/lib/inbox";

type SendEmailResponse = {
  id?: string;
};

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
    const from = process.env.RESEND_FROM_EMAIL || "Robert Kotcher <hello@robertkotcher.com>";
    await ensureInboxSchema();

    const headers: Record<string, string> = {};
    if (typeof messageId === "string" && messageId.trim()) {
      headers["In-Reply-To"] = messageId;
      headers.References = messageId;
    }

    const result = await resendPost<SendEmailResponse>("/emails", {
      from,
      headers,
      reply_to: from,
      subject: subject.trim(),
      text: body.trim(),
      to: [to.trim()],
    });

    await storeOutboundEmail({
      from,
      inReplyTo: typeof messageId === "string" ? messageId : null,
      resendEmailId: result.id || null,
      subject: subject.trim(),
      text: body.trim(),
      to: to.trim(),
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Inbox reply failed:", error);
    return NextResponse.json({ error: "Reply could not be sent." }, { status: 502 });
  }
}
