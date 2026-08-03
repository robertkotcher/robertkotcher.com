import { createHmac, timingSafeEqual } from "node:crypto";

const fiveMinutes = 5 * 60;

function header(headers: Headers, name: string) {
  return headers.get(name) || headers.get(`webhook-${name.replace(/^svix-/, "")}`);
}

function signatureMatches(expected: string, signatureHeader: string) {
  return signatureHeader.split(" ").some((candidate) => {
    const signature = candidate.includes(",") ? candidate.split(",")[1] : candidate;
    const expectedBuffer = Buffer.from(expected);
    const signatureBuffer = Buffer.from(signature);
    return expectedBuffer.length === signatureBuffer.length && timingSafeEqual(expectedBuffer, signatureBuffer);
  });
}

export function verifyResendWebhook(payload: string, headers: Headers) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) throw new Error("RESEND_WEBHOOK_SECRET is not configured.");

  const id = header(headers, "svix-id");
  const timestamp = header(headers, "svix-timestamp");
  const signature = header(headers, "svix-signature");
  if (!id || !timestamp || !signature) throw new Error("Missing webhook signature headers.");

  const timestampSeconds = Number(timestamp);
  if (!Number.isFinite(timestampSeconds) || Math.abs(Date.now() / 1000 - timestampSeconds) > fiveMinutes) {
    throw new Error("Webhook timestamp is outside the accepted window.");
  }

  const encodedSecret = secret.startsWith("whsec_") ? secret.slice("whsec_".length) : secret;
  const expected = createHmac("sha256", Buffer.from(encodedSecret, "base64"))
    .update(`${id}.${timestamp}.${payload}`)
    .digest("base64");

  if (!signatureMatches(expected, signature)) throw new Error("Webhook signature mismatch.");
  return id;
}
