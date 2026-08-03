import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getInboxThread } from "@/app/lib/inbox-db";
import { inboxCookie, isInboxSession } from "@/app/lib/inbox";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  if (!isInboxSession(cookieStore.get(inboxCookie)?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const thread = await getInboxThread(id);
    if (!thread) return NextResponse.json({ error: "Thread not found." }, { status: 404 });
    return NextResponse.json(thread);
  } catch (error) {
    console.error("Inbox thread failed:", error);
    return NextResponse.json({ error: "Could not load that thread." }, { status: 502 });
  }
}
