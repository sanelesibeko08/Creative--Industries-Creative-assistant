import OpenAI from "openai";
import { env } from "../env";
import type { GenerateTextFn, GenerateTextResult } from "./types";

const MODEL = "gpt-4o";

// Lazy singleton — only instantiated if AI_PROVIDER=openai
let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    if (!env.OPENAI_API_KEY) {
      throw new Error(
        "OPENAI_API_KEY is not set. Add it to .env.local or switch AI_PROVIDER to watsonx.",
      );
    }
    _client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }
  return _client;
}

export const generateText: GenerateTextFn = async (
  systemPrompt,
  userMessage,
  options = {},
): Promise<GenerateTextResult> => {
  const client = getClient();

  const response = await client.chat.completions.create({
    model: MODEL,
    max_tokens: options.maxTokens ?? 800,
    temperature: options.temperature ?? 0.8,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
  });

  const text = response.choices[0]?.message?.content ?? "";
  return { text, provider: "openai" };
};
