import { notFound } from "next/navigation";
import { getSession } from "@/lib/db/sessions";
import { getMessagesBySession } from "@/lib/db/messages";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SessionPage({ params }: PageProps) {
  const { id } = await params;

  const session = await getSession(id).catch(() => null);
  if (!session) notFound();

  const messages = await getMessagesBySession(id).catch(() => []);

  return <WorkspaceShell session={session} initialMessages={messages} />;
}
