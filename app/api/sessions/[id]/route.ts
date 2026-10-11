import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/db/sessions";
import { getMessagesBySession } from "@/lib/db/messages";

// GET /api/sessions/[id] — fetch a session with its full message history
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const session = await getSession(id).catch(() => null);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const messages = await getMessagesBySession(id).catch(() => []);

  return NextResponse.json({ session, messages });
}
