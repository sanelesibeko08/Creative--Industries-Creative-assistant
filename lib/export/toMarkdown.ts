import type { Message } from "@/lib/supabase";

// ── Helpers ───────────────────────────────────────────────────

function parseJSON<T>(content: string): T | null {
  try {
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

// ── Markdown formatters per mode ──────────────────────────────

function formatBrainstorm(messages: Message[]): string {
  const lines: string[] = ["# Brainstorm Ideas\n"];
  for (const msg of messages) {
    if (msg.role === "assistant") {
      const ideas = parseJSON<string[]>(msg.content);
      if (Array.isArray(ideas)) {
        ideas.forEach((idea) => lines.push(`- ${idea}`));
      } else {
        lines.push(msg.content);
      }
    }
  }
  return lines.join("\n");
}

function formatOutline(messages: Message[]): string {
  const lines: string[] = [];
  for (const msg of messages) {
    if (msg.role === "assistant" && msg.metadata?.mode === "outline") {
      const outline = parseJSON<{
        title: string;
        acts: Array<{ act: string; scenes: Array<{ scene: string; description: string }> }>;
      }>(msg.content);
      if (outline) {
        lines.push(`# ${outline.title}\n`);
        for (const act of outline.acts) {
          lines.push(`## ${act.act}\n`);
          for (const scene of act.scenes) {
            lines.push(`### ${scene.scene}`);
            lines.push(`${scene.description}\n`);
          }
        }
        break; // export the most recent outline only
      }
    }
  }
  return lines.join("\n") || "# Outline\n\nNo outline generated yet.";
}

function formatDraft(messages: Message[]): string {
  const lines: string[] = ["# Draft\n"];
  for (const msg of messages) {
    if (msg.role === "assistant" && msg.metadata?.mode === "draft") {
      const sceneTitle = msg.metadata.sceneTitle as string | undefined;
      if (sceneTitle) lines.push(`## ${sceneTitle}\n`);
      lines.push(msg.content);
      lines.push("");
    }
  }
  return lines.join("\n");
}

function formatVisual(messages: Message[]): string {
  const lines: string[] = ["# Visual Concepts\n"];
  for (const msg of messages) {
    if (msg.role === "assistant" && msg.metadata?.mode === "visual") {
      const sdPrompt = msg.metadata.sdPrompt as string | undefined;
      lines.push(`## Concept\n`);
      lines.push("```");
      lines.push(sdPrompt ?? msg.content);
      lines.push("```\n");
    }
  }
  return lines.join("\n");
}

// ── Main export ───────────────────────────────────────────────

export type ExportMode = "brainstorm" | "outline" | "draft" | "visual" | "all";

export function toMarkdown(
  messages: Message[],
  mode: ExportMode = "all",
  sessionTitle = "Creative Session",
): string {
  const header = `# ${sessionTitle}\n\n---\n\n`;

  if (mode === "all") {
    const modes = ["brainstorm", "outline", "draft", "visual"] as const;
    const sections = modes
      .map((m) => {
        const relevant = messages.filter((msg) => msg.metadata?.mode === m);
        if (relevant.length === 0) return "";
        return toMarkdown(relevant, m, sessionTitle).replace(header, "");
      })
      .filter(Boolean)
      .join("\n---\n\n");
    return header + sections;
  }

  switch (mode) {
    case "brainstorm":
      return header + formatBrainstorm(messages);
    case "outline":
      return header + formatOutline(messages);
    case "draft":
      return header + formatDraft(messages);
    case "visual":
      return header + formatVisual(messages);
  }
}
