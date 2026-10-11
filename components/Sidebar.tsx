"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { Plus, Sparkles, Clock } from "lucide-react";
import { useSession } from "@/context/SessionContext";
import type { Session } from "@/lib/supabase";
import clsx from "clsx";

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const MODE_LABELS: Record<Session["mode"], string> = {
  brainstorm: "Brainstorm",
  outline: "Outline",
  draft: "Draft",
  visual: "Visual",
};

const MODE_COLOURS: Record<Session["mode"], string> = {
  brainstorm: "bg-accent/20 text-accent",
  outline: "bg-teal/20 text-teal",
  draft: "bg-success/20 text-success",
  visual: "bg-warning/20 text-warning",
};

export default function Sidebar() {
  const { sessions, refreshSessions } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  async function handleNewSession() {
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Untitled Session", mode: "brainstorm" }),
    });
    if (res.ok) {
      const data = (await res.json()) as { session: Session };
      await refreshSessions();
      router.push(`/session/${data.session.id}`);
    }
  }

  return (
    <aside className="flex h-full w-64 flex-shrink-0 flex-col border-r border-border bg-surface">
      {/* Logo */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-4">
        <Sparkles className="h-5 w-5 text-accent" />
        <span className="font-semibold text-foreground">Creative Assistant</span>
      </div>

      {/* New session button */}
      <div className="px-3 py-3">
        <button
          onClick={() => void handleNewSession()}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          <Plus className="h-4 w-4" />
          New Session
        </button>
      </div>

      {/* Session list */}
      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {sessions.length === 0 ? (
          <div className="px-2 py-8 text-center text-sm text-muted">
            No sessions yet.
            <br />
            Click &quot;New Session&quot; to start.
          </div>
        ) : (
          <ul className="space-y-1">
            {sessions.map((s) => {
              const isActive = pathname === `/session/${s.id}`;
              return (
                <li key={s.id}>
                  <Link
                    href={`/session/${s.id}`}
                    className={clsx(
                      "flex flex-col gap-1 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-surface-raised text-foreground"
                        : "text-muted hover:bg-surface-raised hover:text-foreground",
                    )}
                  >
                    <span className="truncate font-medium">{s.title}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={clsx(
                          "rounded px-1.5 py-0.5 text-xs font-medium",
                          MODE_COLOURS[s.mode],
                        )}
                      >
                        {MODE_LABELS[s.mode]}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted">
                        <Clock className="h-3 w-3" />
                        {relativeTime(s.updated_at)}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-border px-4 py-3">
        <p className="text-xs text-muted">Powered by IBM Granite · watsonx.ai</p>
      </div>
    </aside>
  );
}
