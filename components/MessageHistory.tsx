"use client";

import { useEffect, useRef } from "react";
import { User, Bot } from "lucide-react";
import type { Message } from "@/lib/supabase";

interface MessageHistoryProps {
  messages: Message[];
}

export default function MessageHistory({ messages }: MessageHistoryProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (messages.length === 0) return null;

  return (
    <div
      className="border-t border-border bg-surface"
      data-print-hide
    >
      <details>
        <summary className="cursor-pointer select-none px-4 py-2 text-xs font-medium text-muted hover:text-foreground">
          Session history ({messages.length} message{messages.length !== 1 ? "s" : ""})
        </summary>
        <div className="max-h-56 overflow-y-auto px-4 pb-3">
          <div className="space-y-2 pt-2">
            {messages.map((msg) => (
              <div key={msg.id} className="flex gap-2 text-xs">
                <span className="mt-0.5 flex-shrink-0">
                  {msg.role === "user" ? (
                    <User className="h-3.5 w-3.5 text-teal" />
                  ) : (
                    <Bot className="h-3.5 w-3.5 text-accent" />
                  )}
                </span>
                <p className="line-clamp-2 text-muted">
                  {msg.content.length > 200 ? msg.content.slice(0, 200) + "…" : msg.content}
                </p>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </div>
      </details>
    </div>
  );
}
