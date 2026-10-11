import { supabase } from "../supabase";
import type { Message, MessageRole } from "../supabase";

// ── Create ────────────────────────────────────────────────────

export async function createMessage(
  sessionId: string,
  role: MessageRole,
  content: string,
  metadata: Record<string, unknown> | null = null,
): Promise<Message> {
  const { data, error } = await supabase
    .from("messages")
    .insert({ session_id: sessionId, role, content, metadata })
    .select()
    .single();

  if (error) throw new Error(`createMessage: ${error.message}`);
  return data;
}

// ── Read ──────────────────────────────────────────────────────

export async function getMessagesBySession(sessionId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select()
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`getMessagesBySession: ${error.message}`);
  return data ?? [];
}

// ── Delete ────────────────────────────────────────────────────

export async function deleteMessage(id: string): Promise<void> {
  const { error } = await supabase.from("messages").delete().eq("id", id);
  if (error) throw new Error(`deleteMessage: ${error.message}`);
}

export async function deleteMessagesBySession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from("messages")
    .delete()
    .eq("session_id", sessionId);
  if (error) throw new Error(`deleteMessagesBySession: ${error.message}`);
}
