import { NextResponse, type NextRequest } from "next/server";
import { budgetLink, budgetLinkHeader } from "./app/nyc-budget/budget-auth";

export function proxy(request: NextRequest) {
  if (process.env.VERCEL_ENV !== "production") return NextResponse.next();

  const link = budgetLink();
  const path = request.nextUrl.pathname;
  const target = link && (path === link ? "/nyc-budget"
    : path === `${link}/prompts` ? "/api/nyc-budget/prompts" : null);
  if (!link || !target) return new NextResponse(null, { status: 404 });

  const headers = new Headers(request.headers);
  headers.set(budgetLinkHeader, link);
  const url = request.nextUrl.clone();
  url.pathname = target;
  const response = NextResponse.rewrite(url, { request: { headers } });
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Robots-Tag", "noindex");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}

export const config = { matcher: ["/nyc-budget/:path*", "/api/nyc-budget/prompts", "/budget/:path*"] };
