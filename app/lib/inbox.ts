import { createHmac, timingSafeEqual } from "node:crypto";

export const inboxCookie = "rk_inbox_session";
const resendEndpoint = "https://api.resend.com";

function secret() {
  return process.env.INBOX_SESSION_SECRET || process.env.INBOX_PASSWORD || "development-only-secret";
}

export function createInboxSession() {
  const value = "authenticated";
  const signature = createHmac("sha256", secret()).update(value).digest("hex");
  return `${value}.${signature}`;
}

export function isInboxSession(value: string | undefined) {
  if (!value) return false;
  const [session, signature] = value.split(".");
  if (!session || !signature) return false;
  const expected = createHmac("sha256", secret()).update(session).digest("hex");
  return signature.length === expected.length && timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export function isInboxPassword(value: string) {
  const password = process.env.INBOX_PASSWORD;
  return Boolean(password && value && value === password);
}

export function resendHeaders() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured.");
  return { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" };
}

export async function resendGet<T>(path: string): Promise<T> {
  const response = await fetch(`${resendEndpoint}${path}`, {
    headers: resendHeaders(),
    cache: "no-store",
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend request failed: ${response.status} ${detail}`);
  }
  return response.json() as Promise<T>;
}

export async function resendPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${resendEndpoint}${path}`, {
    body: JSON.stringify(body),
    headers: resendHeaders(),
    method: "POST",
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend request failed: ${response.status} ${detail}`);
  }
  return response.json() as Promise<T>;
}
