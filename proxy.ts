import { NextResponse, type NextRequest } from "next/server";
import { budgetAuthChallenge, budgetAuthorized } from "./app/nyc-budget/budget-auth";

export function proxy(request: NextRequest) {
  if (process.env.VERCEL_ENV !== "production") return NextResponse.next();
  if (!budgetAuthorized(request.headers)) return budgetAuthChallenge();

  const response = NextResponse.next();
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Robots-Tag", "noindex");
  return response;
}

export const config = { matcher: "/nyc-budget/:path*" };
