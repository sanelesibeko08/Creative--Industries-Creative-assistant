"use client";

import { useState } from "react";
import { Sparkles, BookOpen, PenLine, ImageIcon, Settings } from "lucide-react";
import clsx from "clsx";
import BrainstormPanel from "./BrainstormPanel";
import OutlinePanel from "./OutlinePanel";
import DraftPanel from "./DraftPanel";
import VisualPanel from "./VisualPanel";
import MessageHistory from "../MessageHistory";
import PreferencesPanel from "../PreferencesPanel";
import ExportButton from "../ExportButton";
import type { Session, Message } from "@/lib/supabase";
import type { OutlineData } from "@/app/api/outline/route";

type Mode = "brainstorm" | "outline" | "draft" | "visual";

interface WorkspaceShellProps {
  session: Session;
  initialMessages: Message[];
}

const TABS: { id: Mode; label: string; Icon: React.ElementType }[] = [
  { id: "brainstorm", label: "Brainstorm", Icon: Sparkles },
  { id: "outline", label: "Outline", Icon: BookOpen },
  { id: "draft", label: "Draft", Icon: PenLine },
  { id: "visual", label: "Visual", Icon: ImageIcon },
];

export default function WorkspaceShell({ session, initialMessages }: WorkspaceShellProps) {
  const [activeMode, setActiveMode] = useState<Mode>(session.mode);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [showPrefs, setShowPrefs] = useState(false);

  // Carry ideas from Brainstorm → Outline
  const [selectedIdeas, setSelectedIdeas] = useState<string[]>([]);
  // Carry outline from Outline → Draft
  const [outline, setOutline] = useState<OutlineData | null>(null);

  function addMessage(msg: Message) {
    setMessages((prev) => [...prev, msg]);
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Top bar */}
      <header
        className="flex items-center justify-between border-b border-border bg-surface px-4 py-3"
        data-print-hide
      >
        <div className="flex items-center gap-2">
          <h1 className="truncate max-w-xs font-semibold text-foreground">{session.title}</h1>
        </div>

        {/* Mode tabs */}
        <nav className="flex items-center gap-1">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveMode(id)}
              className={clsx(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                activeMode === id
                  ? "bg-accent text-white"
                  : "text-muted hover:bg-surface-raised hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </nav>

        {/* Right-side actions */}
        <div className="flex items-center gap-2" data-print-hide>
          <ExportButton messages={messages} sessionTitle={session.title} />
          <button
            onClick={() => setShowPrefs(true)}
            className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-raised hover:text-foreground"
            title="Creative Preferences"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Active mode panel */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeMode === "brainstorm" && (
            <BrainstormPanel
              sessionId={session.id}
              onIdeasGenerated={(ideas, msgs) => {
                setSelectedIdeas(ideas);
                msgs.forEach(addMessage);
              }}
            />
          )}
          {activeMode === "outline" && (
            <OutlinePanel
              sessionId={session.id}
              preloadedIdeas={selectedIdeas}
              onOutlineGenerated={(o, msgs) => {
                setOutline(o);
                msgs.forEach(addMessage);
              }}
            />
          )}
          {activeMode === "draft" && (
            <DraftPanel
              sessionId={session.id}
              outline={outline}
              onDraftSaved={addMessage}
            />
          )}
          {activeMode === "visual" && (
            <VisualPanel sessionId={session.id} onResultSaved={addMessage} />
          )}
        </div>

        {/* Message history */}
        <MessageHistory messages={messages} />
      </div>

      {/* Preferences panel overlay */}
      {showPrefs && <PreferencesPanel onClose={() => setShowPrefs(false)} />}
    </div>
  );
}
