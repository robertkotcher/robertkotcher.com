import { NextResponse } from "next/server";
import { resendPost } from "@/app/lib/inbox";

const notificationEmail = "rkotcher@gmail.com";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function textBody(input: Record<string, unknown>) {
  return [
    "A visitor completed the first website wizard step.",
    "",
    `Craigslist location: ${clean(input.location) || "Not provided"}`,
    `Homepage answer: ${clean(input.currentSite) || "Not provided"}`,
    `Current website URL: ${clean(input.currentWebsiteUrl) || "Not provided"}`,
    `Looking for in new website: ${clean(input.redesignRequest) || "Not provided"}`,
    `Business name: ${clean(input.businessName) || "Not provided"}`,
    `Business type: ${clean(input.businessType) || "Not provided"}`,
  ].join("\n");
}

function htmlBody(input: Record<string, unknown>) {
  const rows = [
    ["Craigslist location", clean(input.location)],
    ["Homepage answer", clean(input.currentSite)],
    ["Current website URL", clean(input.currentWebsiteUrl)],
    ["Looking for in new website", clean(input.redesignRequest)],
    ["Business name", clean(input.businessName)],
    ["Business type", clean(input.businessType)],
  ];

  return `
    <h1>Wizard Step 1 completed</h1>
    <p>A visitor completed the first website wizard step.</p>
    ${rows.map(([label, value]) => (
      `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value || "Not provided")}</p>`
    )).join("")}
  `;
}

export async function POST(request: Request) {
  const input = await request.json().catch(() => ({})) as Record<string, unknown>;
  const bodyText = textBody(input);
  const bodyHtml = htmlBody(input);

  try {
    await resendPost("/emails", {
      from: process.env.RESEND_FROM_EMAIL || "Robert Kotcher <hello@robertkotcher.com>",
      html: bodyHtml,
      subject: "Website wizard step 1 completed",
      text: bodyText,
      to: [notificationEmail],
    });
  } catch (error) {
    console.error("Wizard step notification failed:", error);

    return NextResponse.json({ error: "Notification could not be sent." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
