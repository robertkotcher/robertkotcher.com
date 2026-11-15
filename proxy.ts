import { NextResponse, type NextRequest } from "next/server";
import { budgetLink } from "./app/nyc-budget/budget-auth";

export function proxy(request: NextRequest) {
  if (process.env.VERCEL_ENV !== "production") return NextResponse.next();

  const path = request.nextUrl.pathname;
  const response = path === budgetLink()
    ? NextResponse.redirect(new URL("/nyc-budget", request.url))
    : path.startsWith("/budget/")
      ? new NextResponse(null, { status: 404 })
      : NextResponse.next();
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Robots-Tag", "noindex");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}

export const config = { matcher: ["/nyc-budget", "/api/nyc-budget/prompts", "/budget/:path*"] };
