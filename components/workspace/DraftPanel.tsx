"use client";

import { useState, useRef } from "react";
import { PenLine } from "lucide-react";
import type { Message } from "@/lib/supabase";
import type { OutlineData } from "@/app/api/outline/route";

interface DraftPanelProps {
  sessionId: string;
  outline: OutlineData | null;
  onDraftSaved: (message: Message) => void;
}

export default function DraftPanel({ sessionId, outline, onDraftSaved }: DraftPanelProps) {
  const [sceneTitle, setSceneTitle] = useState("");
  const [sceneDescription, setSceneDescription] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const draftRef = useRef<HTMLDivElement>(null);

  // Flatten outline scenes for the quick-select dropdown
  const scenes =
    outline?.acts.flatMap((act) =>
      act.scenes.map((s) => ({ title: s.scene, description: s.description })),
    ) ?? [];

  function selectScene(idx: number) {
    const s = scenes[idx];
    if (s) {
      setSceneTitle(s.title);
      setSceneDescription(s.description);
    }
  }

  async function handleGenerate() {
    if (!sceneTitle.trim()) return;
    setLoading(true);
    setDraft("");
    setError(null);

    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, sceneTitle, sceneDescription }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Something went wrong");
        setLoading(false);
        return;
      }

      // Read SSE stream
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const payload = line.slice(6).trim();
            if (payload === "[DONE]") {
              // Build a synthetic message object for the history panel
              const syntheticMsg: Message = {
                id: crypto.randomUUID(),
                session_id: sessionId,
                role: "assistant",
                content: fullText,
                metadata: { mode: "draft", sceneTitle },
                created_at: new Date().toISOString(),
              };
              onDraftSaved(syntheticMsg);
              break;
            }
            try {
              const word = JSON.parse(payload) as string;
              fullText += word;
              setDraft((prev) => prev + word);
              // Auto-scroll
              draftRef.current?.scrollIntoView({ block: "end" });
            } catch {
              // ignore malformed SSE line
            }
          }
        }
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h2 className="mb-1 text-lg font-semibold text-foreground">Draft</h2>
        <p className="text-sm text-muted">Expand a scene into polished prose, streamed live.</p>
      </div>

      {/* Quick-select from outline */}
      {scenes.length > 0 && (
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            Pick a scene from your outline
          </label>
          <select
            onChange={(e) => selectScene(Number(e.target.value))}
            defaultValue=""
            className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="" disabled>
              Select a scene…
            </option>
            {scenes.map((s, i) => (
              <option key={i} value={i}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Manual input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={sceneTitle}
          onChange={(e) => setSceneTitle(e.target.value)}
          placeholder="Scene title"
          className="flex-1 rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent"
          disabled={loading}
        />
      </div>
      <textarea
        value={sceneDescription}
        onChange={(e) => setSceneDescription(e.target.value)}
        rows={2}
        placeholder="Scene description (optional)"
        className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent"
        disabled={loading}
      />

      <button
        onClick={() => void handleGenerate()}
        disabled={loading || !sceneTitle.trim()}
        className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
      >
        <PenLine className="h-4 w-4" />
        {loading ? "Writing…" : "Write Draft"}
      </button>

      {error && (
        <p className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}

      {/* Draft output */}
      {draft && (
        <div className="rounded-xl border border-border bg-surface-raised p-5">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{draft}</p>
          <div ref={draftRef} />
        </div>
      )}

      {!loading && !draft && !error && (
        <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted">
          Your draft will stream here in real time.
        </div>
      )}
    </div>
  );
}
