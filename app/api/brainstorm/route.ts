import { NextRequest, NextResponse } from "next/server";
import { BrainstormRequestSchema } from "@/lib/validators";
import { generateText } from "@/lib/ai";
import { buildBrainstormPrompt } from "@/lib/prompts/brainstorm";
import { getPreferences } from "@/lib/db/preferences";
import { createMessage } from "@/lib/db/messages";

export async function POST(req: NextRequest) {
  // 1. Validate request body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = BrainstormRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 },
    );
  }

  const { sessionId, theme } = parsed.data;

  // 2. Fetch user preferences for personalised prompts
  const prefs = await getPreferences().catch(() => ({
    preferred_genre: "fantasy",
    preferred_tone: "neutral",
    preferred_style: "descriptive",
  }));

  // 3. Save user message
  await createMessage(sessionId, "user", theme, { mode: "brainstorm" });

  // 4. Generate ideas via AI
  const systemPrompt = buildBrainstormPrompt(prefs);
  const { text } = await generateText(systemPrompt, `Theme: ${theme}`);

  // 5. Parse the JSON array from the AI response
  let ideas: string[];
  try {
    // Strip potential markdown fences before parsing
    const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    ideas = Array.isArray(parsed) ? parsed.map(String) : [text.trim()];
  } catch {
    // Fallback: split on newlines if not valid JSON
    ideas = text
      .split("\n")
      .map((l) => l.replace(/^[-•\d.]\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 5);
  }

  // 6. Save assistant message
  await createMessage(sessionId, "assistant", JSON.stringify(ideas), {
    mode: "brainstorm",
    ideas,
  });

  return NextResponse.json({ ideas });
}
