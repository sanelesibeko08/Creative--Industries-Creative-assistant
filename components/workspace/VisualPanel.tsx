"use client";

import { useState } from "react";
import { ImageIcon, Copy, Check } from "lucide-react";
import type { Message } from "@/lib/supabase";

interface VisualPanelProps {
  sessionId: string;
  onResultSaved: (message: Message) => void;
}

interface VisualResult {
  sdPrompt: string;
  negativePrompt?: string;
  imageDataUrl: string | null;
  imageError?: string;
}

export default function VisualPanel({ sessionId, onResultSaved }: VisualPanelProps) {
  const [concept, setConcept] = useState("");
  const [result, setResult] = useState<VisualResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    if (!concept.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/visual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, concept }),
      });

      const data = (await res.json()) as VisualResult & { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      setResult(data);

      // Add synthetic message to history
      const syntheticMsg: Message = {
        id: crypto.randomUUID(),
        session_id: sessionId,
        role: "assistant",
        content: data.sdPrompt,
        metadata: {
          mode: "visual",
          sdPrompt: data.sdPrompt,
          imageDataUrl: data.imageDataUrl,
        },
        created_at: new Date().toISOString(),
      };
      onResultSaved(syntheticMsg);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copyPrompt() {
    if (!result?.sdPrompt) return;
    await navigator.clipboard.writeText(result.sdPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h2 className="mb-1 text-lg font-semibold text-foreground">Visual Concepts</h2>
        <p className="text-sm text-muted">
          Describe a scene or concept and get a generated image + SD prompt.
        </p>
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void handleGenerate()}
          placeholder="e.g. a neon-lit cyberpunk market at midnight"
          className="flex-1 rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent"
          disabled={loading}
        />
        <button
          onClick={() => void handleGenerate()}
          disabled={loading || !concept.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          <ImageIcon className="h-4 w-4" />
          {loading ? "Generating…" : "Generate"}
        </button>
      </div>

      {error && (
        <p className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-2/3 rounded bg-surface-raised" />
          <div className="aspect-video rounded-xl bg-surface-raised" />
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="space-y-4">
          {/* SD Prompt */}
          <div className="rounded-xl border border-border bg-surface-raised p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Stable Diffusion Prompt
              </p>
              <button
                onClick={() => void copyPrompt()}
                className="flex items-center gap-1 rounded px-2 py-1 text-xs text-muted transition-colors hover:bg-border hover:text-foreground"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-sm text-foreground">{result.sdPrompt}</p>
            {result.negativePrompt && (
              <p className="mt-2 text-xs text-muted">
                <span className="font-medium">Negative:</span> {result.negativePrompt}
              </p>
            )}
          </div>

          {/* Generated image */}
          {result.imageDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={result.imageDataUrl}
              alt={result.sdPrompt}
              className="w-full rounded-xl border border-border object-cover"
            />
          ) : result.imageError ? (
            <div className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
              Image generation unavailable: {result.imageError}
            </div>
          ) : null}
        </div>
      )}

      {!loading && !result && !error && (
        <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted">
          Your generated image will appear here.
        </div>
      )}
    </div>
  );
}
