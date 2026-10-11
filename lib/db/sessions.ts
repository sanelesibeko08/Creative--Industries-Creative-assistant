import { supabase } from "../supabase";
import type { Session, SessionMode } from "../supabase";

// ── Create ────────────────────────────────────────────────────

export async function createSession(
  title = "Untitled Session",
  mode: SessionMode = "brainstorm",
): Promise<Session> {
  const { data, error } = await supabase
    .from("sessions")
    .insert({ title, mode })
    .select()
    .single();

  if (error) throw new Error(`createSession: ${error.message}`);
  return data;
}

// ── Read ──────────────────────────────────────────────────────

export async function listSessions(): Promise<Session[]> {
  const { data, error } = await supabase
    .from("sessions")
    .select()
    .order("updated_at", { ascending: false });

  if (error) throw new Error(`listSessions: ${error.message}`);
  return data ?? [];
}

export async function getSession(id: string): Promise<Session | null> {
  const { data, error } = await supabase
    .from("sessions")
    .select()
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // not found
    throw new Error(`getSession: ${error.message}`);
  }
  return data;
}

// ── Update ────────────────────────────────────────────────────

export async function updateSession(
  id: string,
  patch: { title?: string; mode?: SessionMode },
): Promise<Session> {
  const { data, error } = await supabase
    .from("sessions")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`updateSession: ${error.message}`);
  return data;
}

// ── Delete ────────────────────────────────────────────────────

export async function deleteSession(id: string): Promise<void> {
  const { error } = await supabase.from("sessions").delete().eq("id", id);
  if (error) throw new Error(`deleteSession: ${error.message}`);
}
