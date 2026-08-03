import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { inboxCookie, isInboxSession, resendGet } from "@/app/lib/inbox";

type ReceivedMessage = {
  id: string;
  created_at: string;
  from: string;
  to: string[];
  subject: string;
  attachments?: { filename: string }[];
};

export async function GET() {
  const cookieStore = await cookies();
  if (!isInboxSession(cookieStore.get(inboxCookie)?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await resendGet<{ data: ReceivedMessage[] }>("/emails/receiving");
    return NextResponse.json({
      ...result,
      data: result.data.map((message) => ({ ...message, email_id: message.id })),
    });
  } catch (error) {
    console.error("Inbox list failed:", error);
    const message = error instanceof Error ? error.message : "Unknown Resend error.";
    const invalidKey = message.includes("API key is invalid");
    return NextResponse.json(
      { error: invalidKey ? "Resend rejected RESEND_API_KEY. Replace it with a valid API key." : "Could not load messages." },
      { status: 502 },
    );
  }
}
