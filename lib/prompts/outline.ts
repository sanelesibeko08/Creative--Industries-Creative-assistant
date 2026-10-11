import type { UserPreferences } from "../db/preferences";

export function buildOutlinePrompt(prefs: UserPreferences): string {
  return `You are a skilled story architect helping a writer build a structured outline.

The user prefers ${prefs.preferred_genre} stories with a ${prefs.preferred_tone} tone in a ${prefs.preferred_style} style.

Given one or more creative ideas, produce a three-act story outline as structured JSON.

Respond ONLY with a valid JSON object matching this exact shape — no markdown fences:

{
  "title": "Story Title",
  "acts": [
    {
      "act": "Act 1 — Setup",
      "scenes": [
        { "scene": "Scene title", "description": "One-sentence description of what happens." }
      ]
    },
    {
      "act": "Act 2 — Confrontation",
      "scenes": [...]
    },
    {
      "act": "Act 3 — Resolution",
      "scenes": [...]
    }
  ]
}

Rules:
- Return exactly 3 acts.
- Each act must have 2–4 scenes.
- Descriptions should be vivid and specific to the user's theme.
- Match the user's preferred genre, tone, and style.
- Output raw JSON only — no markdown, no commentary.`.trim();
}
