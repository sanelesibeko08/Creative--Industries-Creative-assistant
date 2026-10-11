import { NextRequest, NextResponse } from "next/server";
import { OutlineRequestSchema } from "@/lib/validators";
import { generateText } from "@/lib/ai";
import { buildOutlinePrompt } from "@/lib/prompts/outline";
import { getPreferences } from "@/lib/db/preferences";
import { createMessage } from "@/lib/db/messages";

// ── Types matching the prompt's expected JSON shape ──────────

export interface OutlineScene {
  scene: string;
  description: string;
}

export interface OutlineAct {
  act: string;
  scenes: OutlineScene[];
}

export interface OutlineData {
  title: string;
  acts: OutlineAct[];
}

export async function POST(req: NextRequest) {
  // 1. Validate
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = OutlineRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 },
    );
  }

  const { sessionId, ideas } = parsed.data;

  // 2. Preferences
  const prefs = await getPreferences().catch(() => ({
    preferred_genre: "fantasy",
    preferred_tone: "neutral",
    preferred_style: "descriptive",
  }));

  // 3. Save user message
  const userContent = ideas.join("\n");
  await createMessage(sessionId, "user", userContent, { mode: "outline", ideas });

  // 4. Generate outline
  const systemPrompt = buildOutlinePrompt(prefs);
  const userMessage = `Create an outline for a story based on these ideas:\n${userContent}`;
  const { text } = await generateText(systemPrompt, userMessage);

  // 5. Parse JSON outline
  let outline: OutlineData;
  try {
    const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
    outline = JSON.parse(cleaned) as OutlineData;
  } catch {
    // Return a minimal fallback outline so the UI doesn't crash
    outline = {
      title: "Untitled Story",
      acts: [
        {
          act: "Act 1 — Setup",
          scenes: [{ scene: "Opening", description: text.trim().slice(0, 200) }],
        },
      ],
    };
  }

  // 6. Save assistant message
  await createMessage(sessionId, "assistant", JSON.stringify(outline), {
    mode: "outline",
    outline,
  });

  return NextResponse.json({ outline });
}
