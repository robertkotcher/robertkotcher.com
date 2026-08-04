import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { archiveInboxThread } from "@/app/lib/inbox-db";
import { inboxCookie, isInboxSession } from "@/app/lib/inbox";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  if (!isInboxSession(cookieStore.get(inboxCookie)?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const archived = await archiveInboxThread(id);
    if (!archived) return NextResponse.json({ error: "Thread not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Inbox archive failed:", error);
    return NextResponse.json({ error: "Could not archive that thread." }, { status: 502 });
  }
}
