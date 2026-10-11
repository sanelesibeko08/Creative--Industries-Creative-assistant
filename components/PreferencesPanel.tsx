"use client";

import { useState } from "react";
import { X, Save } from "lucide-react";
import { useSession } from "@/context/SessionContext";

const GENRE_OPTIONS = [
  "fantasy", "sci-fi", "thriller", "romance", "horror",
  "mystery", "literary fiction", "historical fiction", "comedy",
];

const TONE_OPTIONS = [
  "neutral", "dark", "light-hearted", "noir", "whimsical",
  "epic", "gritty", "hopeful", "melancholic",
];

interface PreferencesPanelProps {
  onClose: () => void;
}

export default function PreferencesPanel({ onClose }: PreferencesPanelProps) {
  const { preferences, updatePreferences } = useSession();

  const [genre, setGenre] = useState(preferences.preferred_genre);
  const [tone, setTone] = useState(preferences.preferred_tone);
  const [style, setStyle] = useState(preferences.preferred_style);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    await updatePreferences({
      preferred_genre: genre,
      preferred_tone: tone,
      preferred_style: style,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/50 p-4 sm:items-start sm:pt-16 sm:pr-6">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Creative Preferences</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted transition-colors hover:bg-surface-raised hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Genre */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Preferred Genre
            </label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {GENRE_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Tone */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Preferred Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {TONE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Style */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Writing Style
            </label>
            <input
              type="text"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              placeholder="e.g. descriptive, minimalist, poetic..."
              className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={() => void handleSave()}
          disabled={saving}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saved ? "Saved!" : saving ? "Saving…" : "Save Preferences"}
        </button>
      </div>
    </div>
  );
}
