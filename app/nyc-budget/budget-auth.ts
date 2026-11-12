import { createHash, timingSafeEqual } from "node:crypto";

export function matchesSecret(actual: string | null, expected: string | undefined) {
  if (!actual || !expected) return false;
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(actual), digest(expected));
}

export function budgetAuthorized(headers: Headers) {
  const password = process.env.NYC_BUDGET_PASSWORD;
  return Boolean(password && matchesSecret(headers.get("authorization"),
    `Basic ${Buffer.from(`budget:${password}`).toString("base64")}`));
}

export function budgetAuthChallenge() {
  return new Response("Sign in to view the budget.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="NYC budget", charset="UTF-8"',
      "Cache-Control": "private, no-store",
    },
  });
}
