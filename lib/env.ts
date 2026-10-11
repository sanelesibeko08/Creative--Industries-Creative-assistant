import { z } from "zod";

const envSchema = z.object({
  // AI provider routing
  AI_PROVIDER: z.enum(["openai", "watsonx"]).default("openai"),

  // OpenAI
  OPENAI_API_KEY: z.string().optional(),

  // IBM watsonx.ai
  WATSONX_API_KEY: z.string().optional(),
  WATSONX_PROJECT_ID: z.string().optional(),
  WATSONX_URL: z.string().url().optional(),

  // Hugging Face
  HF_API_TOKEN: z.string().optional(),

  // Supabase
  SUPABASE_URL: z.string().url({ message: "SUPABASE_URL must be a valid URL" }),
  SUPABASE_ANON_KEY: z.string().min(1, { message: "SUPABASE_ANON_KEY is required" }),
});

// Validate at module load time so missing vars fail fast at startup.
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const formatted = parsed.error.issues
    .map((e) => `  • ${e.path.join(".")}: ${e.message}`)
    .join("\n");
  throw new Error(
    `\n\n❌  Environment variable validation failed:\n${formatted}\n\n` +
      `Copy .env.local.example → .env.local and fill in all required values.\n`,
  );
}

export const env = parsed.data;

// Convenience re-exports for the most-used vars
export const AI_PROVIDER = env.AI_PROVIDER;
