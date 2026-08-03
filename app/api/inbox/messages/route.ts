import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { listInboxThreads } from "@/app/lib/inbox-db";
import { inboxCookie, isInboxSession } from "@/app/lib/inbox";

export async function GET() {
  const cookieStore = await cookies();
  if (!isInboxSession(cookieStore.get(inboxCookie)?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const threads = await listInboxThreads();
    return NextResponse.json({ data: threads });
  } catch (error) {
    console.error("Inbox list failed:", error);
    return NextResponse.json({ error: "Could not load inbox threads." }, { status: 502 });
  }
}
