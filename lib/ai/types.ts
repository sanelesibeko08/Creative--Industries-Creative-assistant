// ── Shared AI client interface ────────────────────────────────
// Both the OpenAI and watsonx.ai implementations satisfy this contract,
// so API routes can call `generateText` without knowing which provider is active.

export interface GenerateTextOptions {
  /** Maximum number of tokens to generate. */
  maxTokens?: number;
  /** Sampling temperature (0 = deterministic, 1 = creative). */
  temperature?: number;
}

export interface GenerateTextResult {
  /** The generated text content. */
  text: string;
  /** Which provider produced this result. */
  provider: "openai" | "watsonx";
}

export type GenerateTextFn = (
  systemPrompt: string,
  userMessage: string,
  options?: GenerateTextOptions,
) => Promise<GenerateTextResult>;
