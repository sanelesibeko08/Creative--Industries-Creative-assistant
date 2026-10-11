"use client";

import { useState } from "react";
import { Sparkles, ChevronRight } from "lucide-react";
import type { Message } from "@/lib/supabase";

interface BrainstormPanelProps {
  sessionId: string;
  onIdeasGenerated: (ideas: string[], messages: Message[]) => void;
}

export default function BrainstormPanel({ sessionId, onIdeasGenerated }: BrainstormPanelProps) {
  const [theme, setTheme] = useState("");
  const [ideas, setIdeas] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!theme.trim()) return;
    setLoading(true);
    setError(null);
    setIdeas([]);
    setSelected(new Set());

    try {
      const res = await fetch("/api/brainstorm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, theme }),
      });

      const data = (await res.json()) as { ideas?: string[]; error?: string };

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      setIdeas(data.ideas ?? []);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  function toggleIdea(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) {
        next.delete(i);
      } else {
        next.add(i);
      }
      return next;
    });
  }

  function handleSendToOutline() {
    const picked = ideas.filter((_, i) => selected.has(i));
    if (picked.length === 0) return;
    onIdeasGenerated(picked, []);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h2 className="mb-1 text-lg font-semibold text-foreground">Brainstorm</h2>
        <p className="text-sm text-muted">Enter a theme and get 5 creative directions.</p>
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void handleGenerate()}
          placeholder="e.g. a detective who can rewind time"
          className="flex-1 rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent"
          disabled={loading}
        />
        <button
          onClick={() => void handleGenerate()}
          disabled={loading || !theme.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          <Sparkles className="h-4 w-4" />
          {loading ? "Generating…" : "Generate"}
        </button>
      </div>

      {error && (
        <p className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}

      {/* Idea cards */}
      {ideas.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Select ideas to outline →
          </p>
          {ideas.map((idea, i) => (
            <button
              key={i}
              onClick={() => toggleIdea(i)}
              className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                selected.has(i)
                  ? "border-accent bg-accent/10 text-foreground"
                  : "border-border bg-surface-raised text-foreground hover:border-accent/50"
              }`}
            >
              {idea}
            </button>
          ))}

          {selected.size > 0 && (
            <button
              onClick={handleSendToOutline}
              className="flex items-center gap-1.5 rounded-lg border border-accent/40 px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/10"
            >
              Send {selected.size} idea{selected.size > 1 ? "s" : ""} to Outline
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Empty state */}
      {!loading && ideas.length === 0 && !error && (
        <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted">
          Your ideas will appear here.
        </div>
      )}
    </div>
  );
}
