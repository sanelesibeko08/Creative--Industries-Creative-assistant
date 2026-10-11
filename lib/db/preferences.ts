import { supabase } from "../supabase";

// ── Known preference keys ─────────────────────────────────────

export type PreferenceKey = "preferred_genre" | "preferred_tone" | "preferred_style";

export interface UserPreferences {
  preferred_genre: string;
  preferred_tone: string;
  preferred_style: string;
}

// ── Read all preferences as a flat object ─────────────────────

export async function getPreferences(): Promise<UserPreferences> {
  const { data, error } = await supabase
    .from("preferences")
    .select("key, value")
    .in("key", ["preferred_genre", "preferred_tone", "preferred_style"]);

  if (error) throw new Error(`getPreferences: ${error.message}`);

  const defaults: UserPreferences = {
    preferred_genre: "fantasy",
    preferred_tone: "neutral",
    preferred_style: "descriptive",
  };

  if (!data) return defaults;

  for (const row of data) {
    const key = row.key as PreferenceKey;
    if (typeof row.value === "string") {
      defaults[key] = row.value;
    }
  }

  return defaults;
}

// ── Update a single preference ────────────────────────────────

export async function setPreference(key: PreferenceKey, value: string): Promise<void> {
  const { error } = await supabase
    .from("preferences")
    .update({ value })
    .eq("key", key);

  if (error) throw new Error(`setPreference(${key}): ${error.message}`);
}

// ── Update multiple preferences at once ──────────────────────

export async function setPreferences(prefs: Partial<UserPreferences>): Promise<void> {
  const updates = Object.entries(prefs) as [PreferenceKey, string][];
  // Run sequentially to avoid partial writes; preferences table is tiny
  for (const [key, value] of updates) {
    await setPreference(key, value);
  }
}
