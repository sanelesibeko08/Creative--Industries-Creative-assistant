"use client";

import { useState } from "react";
import { BookOpen, ChevronRight } from "lucide-react";
import type { Message } from "@/lib/supabase";
import type { OutlineData } from "@/app/api/outline/route";

interface OutlinePanelProps {
  sessionId: string;
  preloadedIdeas: string[];
  onOutlineGenerated: (outline: OutlineData, messages: Message[]) => void;
}

export default function OutlinePanel({
  sessionId,
  preloadedIdeas,
  onOutlineGenerated,
}: OutlinePanelProps) {
  const [ideasText, setIdeasText] = useState(preloadedIdeas.join("\n"));
  const [outline, setOutline] = useState<OutlineData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    const ideas = ideasText.split("\n").map((l) => l.trim()).filter(Boolean);
    if (ideas.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, ideas }),
      });

      const data = (await res.json()) as { outline?: OutlineData; error?: string };

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      const o = data.outline!;
      setOutline(o);
      onOutlineGenerated(o, []);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h2 className="mb-1 text-lg font-semibold text-foreground">Outline</h2>
        <p className="text-sm text-muted">Structure your ideas into a three-act story.</p>
      </div>

      {/* Ideas input */}
      <div>
        <label className="mb-1 block text-xs font-medium text-muted">
          Ideas (one per line)
        </label>
        <textarea
          value={ideasText}
          onChange={(e) => setIdeasText(e.target.value)}
          rows={3}
          placeholder="Paste your ideas here, one per line…"
          className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent"
          disabled={loading}
        />
      </div>

      <button
        onClick={() => void handleGenerate()}
        disabled={loading || !ideasText.trim()}
        className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
      >
        <BookOpen className="h-4 w-4" />
        {loading ? "Generating Outline…" : "Generate Outline"}
      </button>

      {error && (
        <p className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}

      {/* Outline tree */}
      {outline && (
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-foreground">{outline.title}</h3>
          {outline.acts.map((act) => (
            <div key={act.act} className="rounded-xl border border-border bg-surface-raised p-4">
              <p className="mb-3 text-sm font-semibold text-accent">{act.act}</p>
              <ul className="space-y-2">
                {act.scenes.map((scene, si) => (
                  <li key={si} className="flex gap-3">
                    <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{scene.scene}</p>
                      <p className="text-xs text-muted">{scene.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {!loading && !outline && !error && (
        <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted">
          Your outline will appear here.
        </div>
      )}
    </div>
  );
}
