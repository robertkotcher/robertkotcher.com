import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { inboxCookie, isInboxSession, resendGet } from "@/app/lib/inbox";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  if (!isInboxSession(cookieStore.get(inboxCookie)?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const [message, attachments] = await Promise.all([
      resendGet(`/emails/receiving/${encodeURIComponent(id)}`),
      resendGet(`/emails/receiving/${encodeURIComponent(id)}/attachments`),
    ]);
    return NextResponse.json({ message, attachments });
  } catch (error) {
    console.error("Inbox message failed:", error);
    return NextResponse.json({ error: "Could not load that message." }, { status: 502 });
  }
}
