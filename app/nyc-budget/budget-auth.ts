import { createHash, timingSafeEqual } from "node:crypto";

export function matchesSecret(actual: string | null, expected: string | undefined) {
  if (!actual || !expected) return false;
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(actual), digest(expected));
}

export const budgetLinkHeader = "x-budget-link";

export function budgetLink() {
  const slug = process.env.NYC_BUDGET_SLUG;
  return slug && /^[a-zA-Z0-9_-]{24,}$/.test(slug) ? `/budget/${slug}` : undefined;
}

export function budgetAuthorized(headers: Headers) {
  return matchesSecret(headers.get(budgetLinkHeader), budgetLink());
}
