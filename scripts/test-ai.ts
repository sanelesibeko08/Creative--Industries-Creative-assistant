/**
 * Smoke test for the active AI provider.
 *
 * Usage (from the creative-assistant/ directory):
 *   npx tsx --env-file=.env.local scripts/test-ai.ts
 *
 * Set AI_PROVIDER=openai or AI_PROVIDER=watsonx in .env.local before running.
 * Requires Node 20.6+ for --env-file support (or set env vars manually).
 */

import { generateText } from "../lib/ai/index";
import { AI_PROVIDER } from "../lib/env";

async function main() {
  console.log(`\n🤖  Testing AI provider: ${AI_PROVIDER}\n`);

  const result = await generateText(
    "You are a creative assistant. Respond concisely.",
    'Give me a one-sentence tagline for a sci-fi story about a detective who can rewind time.',
    { maxTokens: 100, temperature: 0.8 },
  );

  console.log(`✅  Provider : ${result.provider}`);
  console.log(`📝  Response : ${result.text.trim()}\n`);
}

main().catch((err) => {
  console.error("\n❌  Smoke test failed:", err);
  process.exit(1);
});
