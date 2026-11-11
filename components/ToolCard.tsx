import Link from "next/link";
import type { SVGProps } from "react";
import type { Tool, ToolCategory } from "@/lib/tools";

const base = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };

const ICONS: Record<ToolCategory, (p: SVGProps<SVGSVGElement>) => React.ReactElement> = {
  image: (p) => (
    <svg {...base} {...p}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m21 16-5-5-9 9" />
    </svg>
  ),
  qr: (p) => (
    <svg {...base} {...p}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4M20 17v.01" />
    </svg>
  ),
  security: (p) => (
    <svg {...base} {...p}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  developer: (p) => (
    <svg {...base} {...p}>
      <path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" />
    </svg>
  ),
  calculator: (p) => (
    <svg {...base} {...p}>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01" />
    </svg>
  ),
  converter: (p) => (
    <svg {...base} {...p}>
      <path d="M4 8h13l-3-3M20 16H7l3 3" />
    </svg>
  ),
  device: (p) => (
    <svg {...base} {...p}>
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M11 18h2" />
    </svg>
  ),
  text: (p) => (
    <svg {...base} {...p}>
      <path d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  ),
};

export function ToolIcon({ category, className }: { category: ToolCategory; className?: string }) {
  const Icon = ICONS[category];
  return (
    <span className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[22%] border border-border bg-surface text-accent-text ${className ?? ""}`}>
      <Icon />
    </span>
  );
}

export default function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      prefetch={false}
      className="ap-card group flex min-w-0 items-center gap-4 p-4"
    >
      <ToolIcon category={tool.category} />
      <div className="min-w-0">
        <p className="text-[15px] font-semibold text-fg group-hover:underline">{tool.name}</p>
        <p className="text-sm text-muted">{tool.tagline}</p>
      </div>
    </Link>
  );
}

export function ToolGrid({ tools }: { tools: Tool[] }) {
  return (
    <div className="grid gap-4 min-[600px]:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      {tools.map((t) => (
        <ToolCard key={t.slug} tool={t} />
      ))}
    </div>
  );
}
