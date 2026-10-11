// ── AI provider router ────────────────────────────────────────
// Reads AI_PROVIDER from the validated env and re-exports the correct
// generateText implementation. All API routes import from here.
//
//   AI_PROVIDER=openai   → lib/ai/openai.ts   (GPT-4o — dev stand-in)
//   AI_PROVIDER=watsonx  → lib/ai/watsonx.ts  (IBM Granite — production)

import { AI_PROVIDER } from "../env";
import { generateText as openaiGenerate } from "./openai";
import { generateText as watsonxGenerate } from "./watsonx";
import type { GenerateTextFn } from "./types";

export const generateText: GenerateTextFn =
  AI_PROVIDER === "watsonx" ? watsonxGenerate : openaiGenerate;

export type { GenerateTextFn, GenerateTextOptions, GenerateTextResult } from "./types";
