import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { ReceivedEmail, storeInboundEmail } from "@/app/lib/inbox-db";
import { resendPost } from "@/app/lib/inbox";

const contactEmail = "rkotcher@gmail.com";
const maxAttachmentBytes = 3 * 1024 * 1024;

type ResendAttachment = {
  content: string;
  content_type?: string;
  filename: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getField(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function isUploadedFile(value: FormDataEntryValue): value is File {
  return value instanceof File && value.size > 0;
}

function textBody(input: {
  body: string;
  email: string;
  name: string;
  phone: string;
  subject: string;
}) {
  return [
    `Name: ${input.name || "Not provided"}`,
    `Email: ${input.email}`,
    `Phone: ${input.phone || "Not provided"}`,
    `Subject: ${input.subject}`,
    "",
    input.body,
  ].join("\n");
}

function htmlBody(input: {
  body: string;
  email: string;
  name: string;
  phone: string;
  subject: string;
}) {
  return `
    <h1>New robertkotcher.com inquiry</h1>
    <p><strong>Name:</strong> ${escapeHtml(input.name || "Not provided")}</p>
    <p><strong>Email:</strong> ${escapeHtml(input.email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(input.phone || "Not provided")}</p>
    <p><strong>Subject:</strong> ${escapeHtml(input.subject)}</p>
    <hr />
    <p>${escapeHtml(input.body).replace(/\n/g, "<br />")}</p>
  `;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const name = getField(formData, "name");
  const email = getField(formData, "email");
  const phone = getField(formData, "phone");
  const subject = getField(formData, "subject");
  const body = getField(formData, "body");
  const files = formData.getAll("files").filter(isUploadedFile);

  if (!email || !subject || !body) {
    return NextResponse.json(
      { error: "Email, subject, and message are required." },
      { status: 400 },
    );
  }

  const totalAttachmentBytes = files.reduce((total, file) => total + file.size, 0);

  if (totalAttachmentBytes > maxAttachmentBytes) {
    return NextResponse.json(
      { error: "Attachments must be under 3MB total." },
      { status: 400 },
    );
  }

  const attachments: ResendAttachment[] = await Promise.all(
    files.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer());

      return {
        content: buffer.toString("base64"),
        content_type: file.type || undefined,
        filename: file.name,
      };
    }),
  );

  const messageText = textBody({ body, email, name, phone, subject });
  const messageHtml = htmlBody({ body, email, name, phone, subject });
  const createdAt = new Date().toISOString();
  const id = `contact_${randomUUID()}`;
  const from = name ? `${name} <${email}>` : email;

  const inboxMessage: ReceivedEmail = {
    attachments: attachments.map((attachment) => ({
      content: attachment.content,
      content_type: attachment.content_type,
      filename: attachment.filename,
      size: Buffer.byteLength(attachment.content, "base64"),
    })),
    created_at: createdAt,
    from,
    headers: {
      from,
      "x-source": "robertkotcher.com/contact",
    },
    html: messageHtml,
    id,
    message_id: `<${id}@robertkotcher.com>`,
    subject,
    text: messageText,
    to: ["hello@robertkotcher.com"],
  };

  try {
    await storeInboundEmail(inboxMessage);
    await resendPost("/emails", {
      attachments,
      from: process.env.RESEND_FROM_EMAIL || "Robert Kotcher <hello@robertkotcher.com>",
      html: messageHtml,
      reply_to: email,
      subject: `Website inquiry: ${subject}`,
      text: messageText,
      to: [contactEmail],
    });
  } catch (error) {
    console.error("Contact form failed:", error);

    return NextResponse.json(
      { error: "Message could not be sent. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
