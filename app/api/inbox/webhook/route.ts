import { NextResponse } from "next/server";
import { ReceivedEmail, storeInboundEmail, storeWebhookEvent } from "@/app/lib/inbox-db";
import { resendGet, resendPost } from "@/app/lib/inbox";
import { verifyResendWebhook } from "@/app/lib/resend-webhook";

const notificationEmail = "rkotcher@gmail.com";

type ResendWebhookEvent = {
  type?: string;
  created_at?: string;
  data?: {
    email_id?: string;
  };
};

type ReceivedAttachmentList = {
  data?: unknown[];
};

type NotificationAttachment = {
  content: string;
  content_type?: string;
  filename: string;
};

function attachmentValue(attachment: unknown, key: string) {
  if (attachment && typeof attachment === "object" && key in attachment) {
    const value = attachment[key as keyof typeof attachment];
    return typeof value === "string" ? value : null;
  }
  return null;
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function preview(email: ReceivedEmail) {
  const body = email.text || (email.html ? stripHtml(email.html) : "");
  return body.length > 600 ? `${body.slice(0, 600)}...` : body;
}

async function notificationAttachments(email: ReceivedEmail): Promise<NotificationAttachment[]> {
  if (!email.attachments?.length) return [];

  const attachments: Array<NotificationAttachment | null> = await Promise.all(
    email.attachments.map(async (attachment) => {
      const filename = attachmentValue(attachment, "filename") || "attachment";
      const contentType = attachmentValue(attachment, "content_type") || undefined;
      const content = attachmentValue(attachment, "content");
      if (content) return { content, content_type: contentType, filename };

      const downloadUrl = attachmentValue(attachment, "download_url");
      if (!downloadUrl) return null;

      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error(`Could not download attachment ${filename}.`);
      const buffer = Buffer.from(await response.arrayBuffer());
      return { content: buffer.toString("base64"), content_type: contentType, filename };
    }),
  );

  return attachments.filter((attachment): attachment is NotificationAttachment => Boolean(attachment));
}

async function sendInboundNotification(email: ReceivedEmail) {
  const from = process.env.RESEND_FROM_EMAIL || "Robert Kotcher <hello@robertkotcher.com>";
  const subject = email.subject?.trim() || "No subject";
  const attachments = await notificationAttachments(email);

  await resendPost("/emails", {
    attachments,
    from,
    reply_to: email.from,
    subject: `New inbox message: ${subject}`,
    text: [
      `From: ${email.from}`,
      `To: ${(email.to || []).join(", ") || "hello@robertkotcher.com"}`,
      `Subject: ${subject}`,
      "",
      preview(email) || "No message preview available.",
      "",
      "Open the inbox: https://www.robertkotcher.com/inbox",
    ].join("\n"),
    to: [notificationEmail],
  });
}

async function enrichAttachments(email: ReceivedEmail) {
  if (!email.attachments?.length) return email;

  const attachments = await resendGet<ReceivedAttachmentList>(`/emails/receiving/${encodeURIComponent(email.id)}/attachments`);
  return { ...email, attachments: attachments.data || email.attachments };
}

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
    const receivedEmail = await resendGet<ReceivedEmail>(`/emails/receiving/${encodeURIComponent(emailId)}`);
    const email = await enrichAttachments(receivedEmail);
    await storeInboundEmail(email);
    await sendInboundNotification(email);
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
