import Link from "next/link";
import { Sparkles, BookOpen, PenLine, ImageIcon } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Brainstorm",
    description: "Generate creative directions from a single theme or idea.",
  },
  {
    icon: BookOpen,
    title: "Outline",
    description: "Structure your ideas into acts, chapters, and scenes.",
  },
  {
    icon: PenLine,
    title: "Draft",
    description: "Expand outline sections into polished prose — streamed live.",
  },
  {
    icon: ImageIcon,
    title: "Visual Concepts",
    description: "Generate image prompts and AI visuals for your creative work.",
  },
];

export default function HomePage() {
  return (
    <main className="flex flex-col flex-1 items-center justify-center px-6 py-20 text-center">
      {/* Hero */}
      <div className="mb-12 max-w-2xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-accent">
          Powered by IBM Granite · watsonx.ai
        </p>
        <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
          Your AI Creative Partner
        </h1>
        <p className="text-lg leading-relaxed text-muted">
          Brainstorm ideas, structure stories, write drafts, and generate visual concepts — faster
          than ever.
        </p>
      </div>

      {/* Feature grid */}
      <div className="mb-12 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
        {features.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="rounded-xl border border-border bg-surface p-5 text-left"
          >
            <Icon className="mb-3 h-5 w-5 text-accent" />
            <h2 className="mb-1 font-semibold text-foreground">{title}</h2>
            <p className="text-sm text-muted">{description}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Link
        href="/session/new"
        className="rounded-full bg-accent px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
      >
        Start Creating
      </Link>
    </main>
  );
}
