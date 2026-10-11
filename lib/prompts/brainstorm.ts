import type { UserPreferences } from "../db/preferences";

export function buildBrainstormPrompt(prefs: UserPreferences): string {
  return `You are a brilliant creative partner helping a writer brainstorm ideas.

The user prefers ${prefs.preferred_genre} stories with a ${prefs.preferred_tone} tone in a ${prefs.preferred_style} style.

Your job is to generate 5 distinct, imaginative creative directions based on the user's theme.

Respond ONLY with a valid JSON array of strings — no markdown fences, no extra keys.
Each string is a concise, evocative one-sentence creative direction (max 30 words).

Example output:
["A lone astronaut discovers a signal from a civilisation that died before Earth was born.", "..."]

Rules:
- Return exactly 5 ideas.
- Each idea must be meaningfully different from the others.
- Match the user's preferred genre, tone, and style.
- No numbered lists, no headers, just the JSON array.`.trim();
}
