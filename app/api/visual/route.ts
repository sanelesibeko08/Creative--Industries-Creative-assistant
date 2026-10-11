import { NextRequest, NextResponse } from "next/server";
import { VisualRequestSchema } from "@/lib/validators";
import { generateText } from "@/lib/ai";
import { buildVisualPrompt } from "@/lib/prompts/visual";
import { generateImage } from "@/lib/huggingface";
import { getPreferences } from "@/lib/db/preferences";
import { createMessage } from "@/lib/db/messages";

interface VisualPromptPayload {
  sdPrompt: string;
  negativePrompt?: string;
}

export async function POST(req: NextRequest) {
  // 1. Validate
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = VisualRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 },
    );
  }

  const { sessionId, concept } = parsed.data;

  // 2. Preferences
  const prefs = await getPreferences().catch(() => ({
    preferred_genre: "fantasy",
    preferred_tone: "neutral",
    preferred_style: "descriptive",
  }));

  // 3. Save user message
  await createMessage(sessionId, "user", concept, { mode: "visual" });

  // 4. Generate SD prompt via AI
  const systemPrompt = buildVisualPrompt(prefs);
  const { text } = await generateText(systemPrompt, `Concept: ${concept}`);

  let sdPrompt = concept;
  let negativePrompt: string | undefined;

  try {
    const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
    const payload = JSON.parse(cleaned) as VisualPromptPayload;
    sdPrompt = payload.sdPrompt ?? concept;
    negativePrompt = payload.negativePrompt;
  } catch {
    // AI didn't return valid JSON — use the raw text as the SD prompt
    sdPrompt = text.trim().slice(0, 500);
  }

  // 5. Generate image via Hugging Face
  let imageDataUrl: string | null = null;
  let imageError: string | null = null;

  try {
    const generated = await generateImage(sdPrompt, negativePrompt);
    imageDataUrl = generated.dataUrl;
  } catch (err) {
    // Image generation is best-effort — return SD prompt even if image fails
    imageError = err instanceof Error ? err.message : String(err);
  }

  // 6. Save assistant message
  await createMessage(
    sessionId,
    "assistant",
    sdPrompt,
    {
      mode: "visual",
      sdPrompt,
      negativePrompt,
      imageDataUrl,
      imageError,
    },
  );

  return NextResponse.json({
    sdPrompt,
    negativePrompt,
    imageDataUrl,
    ...(imageError ? { imageError } : {}),
  });
}
