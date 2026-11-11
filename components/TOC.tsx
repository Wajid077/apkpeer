import type { Heading } from "@/lib/mdx";
import { ChevronIcon } from "./icons";

/** Native <details> instead of a client component: collapsible on every screen, zero JS. */
export default function TOC({ headings }: { headings: Heading[] }) {
  if (headings.length < 3) return null;
  return (
    <details className="group rounded-[var(--radius)] border border-border">
      <summary className="flex min-h-11 items-center justify-between px-4 font-semibold">
        On this page
        <ChevronIcon className="text-muted transition-transform group-open:rotate-180" />
      </summary>
      <nav aria-label="Table of contents" className="px-4 pb-4">
        <ol className="space-y-1 text-[15px]">
          {headings.map((h) => (
            <li key={h.id}>
              <a href={`#${h.id}`} className="inline-block py-1 text-muted hover:text-fg hover:underline">
                {h.text}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </details>
  );
}
