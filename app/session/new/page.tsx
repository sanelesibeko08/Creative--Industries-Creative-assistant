import { redirect } from "next/navigation";
import { createSession } from "@/lib/db/sessions";

// Force dynamic rendering — this page creates a DB record on every request,
// so it must never be statically pre-rendered at build time.
export const dynamic = "force-dynamic";

export default async function NewSessionPage() {
  const session = await createSession("Untitled Session", "brainstorm");
  redirect(`/session/${session.id}`);
}
