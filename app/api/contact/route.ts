import { NextResponse } from "next/server";

const resendEndpoint = "https://api.resend.com/emails";
const contactEmail = "rkotcher@gmail.com";
const maxAttachmentBytes = 40 * 1024 * 1024;

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

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail =
    process.env.RESEND_FROM_EMAIL ?? "Robert Kotcher <contact@robertkotcher.com>";

  if (!apiKey) {
    return NextResponse.json(
      { error: "Email is not configured yet." },
      { status: 500 },
    );
  }

  const formData = await request.formData();
  const name = getField(formData, "name");
  const email = getField(formData, "email");
  const phone = getField(formData, "phone");
  const subject = getField(formData, "subject");
  const message = getField(formData, "body");
  const files = formData.getAll("files").filter((file) => file instanceof File);

  if (!email || !subject || !message) {
    return NextResponse.json(
      { error: "Email, subject, and message are required." },
      { status: 400 },
    );
  }

  const totalAttachmentBytes = files.reduce((total, file) => total + file.size, 0);

  if (totalAttachmentBytes > maxAttachmentBytes) {
    return NextResponse.json(
      { error: "Attachments must be under 40MB total." },
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

  const safeName = escapeHtml(name || "Not provided");
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone || "Not provided");
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

  const response = await fetch(resendEndpoint, {
    body: JSON.stringify({
      attachments,
      from: fromEmail,
      html: `
        <h1>New robertkotcher.com inquiry</h1>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Phone:</strong> ${safePhone}</p>
        <p><strong>Subject:</strong> ${safeSubject}</p>
        <hr />
        <p>${safeMessage}</p>
      `,
      reply_to: email,
      subject: `Website inquiry: ${subject}`,
      to: [contactEmail],
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Resend contact email failed:", errorText);

    return NextResponse.json(
      { error: "Message could not be sent. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
