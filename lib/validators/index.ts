import { z } from "zod";

// ── Brainstorm ────────────────────────────────────────────────

export const BrainstormRequestSchema = z.object({
  sessionId: z.string().uuid(),
  theme: z.string().min(1, "theme is required").max(500),
});

export type BrainstormRequest = z.infer<typeof BrainstormRequestSchema>;

// ── Outline ───────────────────────────────────────────────────

export const OutlineRequestSchema = z.object({
  sessionId: z.string().uuid(),
  ideas: z.array(z.string().min(1)).min(1, "At least one idea is required"),
});

export type OutlineRequest = z.infer<typeof OutlineRequestSchema>;

// ── Draft ─────────────────────────────────────────────────────

export const DraftRequestSchema = z.object({
  sessionId: z.string().uuid(),
  sceneTitle: z.string().min(1, "sceneTitle is required").max(200),
  sceneDescription: z.string().min(1, "sceneDescription is required").max(1000),
});

export type DraftRequest = z.infer<typeof DraftRequestSchema>;

// ── Visual ────────────────────────────────────────────────────

export const VisualRequestSchema = z.object({
  sessionId: z.string().uuid(),
  concept: z.string().min(1, "concept is required").max(500),
});

export type VisualRequest = z.infer<typeof VisualRequestSchema>;

// ── Sessions ──────────────────────────────────────────────────

export const CreateSessionSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  mode: z.enum(["brainstorm", "outline", "draft", "visual"]).optional(),
});

export type CreateSessionRequest = z.infer<typeof CreateSessionSchema>;

// ── Preferences ───────────────────────────────────────────────

export const UpdatePreferencesSchema = z.object({
  preferred_genre: z.string().min(1).max(100).optional(),
  preferred_tone: z.string().min(1).max(100).optional(),
  preferred_style: z.string().min(1).max(100).optional(),
});

export type UpdatePreferencesRequest = z.infer<typeof UpdatePreferencesSchema>;
