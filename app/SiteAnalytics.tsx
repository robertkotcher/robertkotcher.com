"use client";

import { Analytics } from "@vercel/analytics/next";

export function SiteAnalytics() {
  return <Analytics beforeSend={(event) => {
    const path = new URL(event.url).pathname;
    return path === "/nyc-budget" || path.startsWith("/budget/") ? null : event;
  }} />;
}
