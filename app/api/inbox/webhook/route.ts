import { NextResponse } from "next/server";
import { ReceivedEmail, storeInboundEmail, storeWebhookEvent } from "@/app/lib/inbox-db";
import { resendGet } from "@/app/lib/inbox";
import { verifyResendWebhook } from "@/app/lib/resend-webhook";

type ResendWebhookEvent = {
  type?: string;
  created_at?: string;
  data?: {
    email_id?: string;
  };
};

export async function POST(request: Request) {
  const payload = await request.text();
  let webhookId: string;
  try {
    webhookId = verifyResendWebhook(payload, request.headers);
  } catch (error) {
    console.error("Inbound webhook verification failed:", error);
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  let event: ResendWebhookEvent;
  try {
    event = JSON.parse(payload) as ResendWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }
  if (!event || event.type !== "email.received") {
    return NextResponse.json({ ok: true });
  }

  const emailId = event.data?.email_id;
  if (!emailId) return NextResponse.json({ error: "Missing email_id." }, { status: 400 });

  try {
    const email = await resendGet<ReceivedEmail>(`/emails/receiving/${encodeURIComponent(emailId)}`);
    await storeInboundEmail(email);
    await storeWebhookEvent({ eventCreatedAt: event.created_at, id: webhookId, payload: event, status: "processed", type: event.type });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Inbound email storage failed:", error);
    await storeWebhookEvent({
      errorText: error instanceof Error ? error.message : "Unknown webhook processing error.",
      eventCreatedAt: event.created_at,
      id: webhookId,
      payload: event,
      status: "failed",
      type: event.type,
    }).catch((storeError) => console.error("Failed to record webhook failure:", storeError));
    return NextResponse.json({ error: "Could not store inbound email." }, { status: 500 });
  }
}
