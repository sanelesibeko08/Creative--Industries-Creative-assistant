import { NextRequest } from "next/server";
import { DraftRequestSchema } from "@/lib/validators";
import { generateText } from "@/lib/ai";
import { buildDraftPrompt } from "@/lib/prompts/draft";
import { getPreferences } from "@/lib/db/preferences";
import { createMessage } from "@/lib/db/messages";

// Draft mode streams tokens so the user sees output as it is generated.
// We collect the full text on the server, then stream it as SSE-style chunks.

export async function POST(req: NextRequest) {
  // 1. Validate
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsed = DraftRequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: parsed.error.issues.map((i) => i.message).join(", ") }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const { sessionId, sceneTitle, sceneDescription } = parsed.data;

  // 2. Preferences
  const prefs = await getPreferences().catch(() => ({
    preferred_genre: "fantasy",
    preferred_tone: "neutral",
    preferred_style: "descriptive",
  }));

  // 3. Save user message
  await createMessage(sessionId, "user", `${sceneTitle}: ${sceneDescription}`, {
    mode: "draft",
    sceneTitle,
    sceneDescription,
  });

  // 4. Generate draft (non-streaming generation, streamed to client word-by-word)
  const systemPrompt = buildDraftPrompt(prefs);
  const userMessage = `Scene: ${sceneTitle}\n\nDescription: ${sceneDescription}`;
  const { text } = await generateText(systemPrompt, userMessage, {
    maxTokens: 600,
    temperature: 0.85,
  });

  // 5. Stream the result as Server-Sent Events
  //    Each word is sent as a chunk so the frontend can show a typewriter effect.
  const encoder = new TextEncoder();
  const words = text.split(" ");

  const stream = new ReadableStream({
    async start(controller) {
      for (const word of words) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(word + " ")}\n\n`));
        // Yield to the event loop briefly to allow flushing
        await sleep(0);
      }
      // Signal end of stream
      controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
      controller.close();

      // Persist the completed draft after streaming
      await createMessage(sessionId, "assistant", text, {
        mode: "draft",
        sceneTitle,
      }).catch(console.error);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
