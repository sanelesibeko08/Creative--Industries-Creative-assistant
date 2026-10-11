import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env";

// ── Domain types matching the DB schema ───────────────────────

export type SessionMode = "brainstorm" | "outline" | "draft" | "visual";
export type MessageRole = "user" | "assistant";

export interface Session {
  id: string;
  title: string;
  mode: SessionMode;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface Preference {
  id: string;
  key: string;
  value: unknown;
  updated_at: string;
}

// ── Singleton client ──────────────────────────────────────────
// Using the untyped client avoids needing to satisfy the full GenericSchema
// constraint at the cost of explicit return-type casting in the DB helpers.
// This is the recommended pattern when not using `supabase gen types`.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _client: SupabaseClient<any> | null = null;

export function getSupabaseClient() {
  if (!_client) {
    _client = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
  }
  return _client;
}

// Convenience default export for the common case.
export const supabase = getSupabaseClient();
