"use client";

import { useState } from "react";
import { Download, FileText, Printer, ChevronDown } from "lucide-react";
import type { Message } from "@/lib/supabase";
import { toMarkdown } from "@/lib/export/toMarkdown";
import { downloadFile } from "@/lib/export/downloadFile";

interface ExportButtonProps {
  messages: Message[];
  sessionTitle?: string;
}

export default function ExportButton({
  messages,
  sessionTitle = "Creative Session",
}: ExportButtonProps) {
  const [open, setOpen] = useState(false);

  function handleMarkdown() {
    const md = toMarkdown(messages, "all", sessionTitle);
    const slug = sessionTitle.toLowerCase().replace(/\s+/g, "-").slice(0, 40);
    downloadFile(md, `${slug}.md`);
    setOpen(false);
  }

  function handlePDF() {
    setOpen(false);
    window.print();
  }

  return (
    <div className="relative" data-print-hide>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:bg-surface-raised hover:text-foreground"
      >
        <Download className="h-3.5 w-3.5" />
        Export
        <ChevronDown className="h-3 w-3" />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          {/* Dropdown */}
          <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-border bg-surface shadow-lg">
            <button
              onClick={handleMarkdown}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-foreground transition-colors hover:bg-surface-raised"
            >
              <FileText className="h-4 w-4 text-accent" />
              Download Markdown
            </button>
            <div className="mx-3 border-t border-border" />
            <button
              onClick={handlePDF}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-foreground transition-colors hover:bg-surface-raised"
            >
              <Printer className="h-4 w-4 text-accent" />
              Export as PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}
