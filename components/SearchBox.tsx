"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import type { SearchItem } from "@/app/search-index.json/route";
import { SearchIcon } from "./icons";

/** Client-side search over /search-index.json, fetched the first time the box gets focus. */
export default function SearchBox({ autoFocusId }: { autoFocusId?: string }) {
  const [index, setIndex] = useState<SearchItem[] | null>(null);
  const [query, setQuery] = useState("");
  const loading = useRef(false);
  const listId = useId();

  function load() {
    if (index || loading.current) return;
    loading.current = true;
    fetch("/search-index.json")
      .then((r) => r.json())
      .then((data: SearchItem[]) => setIndex(data))
      .catch(() => setIndex([]))
      .finally(() => (loading.current = false));
  }

  const q = query.trim().toLowerCase();
  const terms = q.split(/\s+/).filter(Boolean);
  const results =
    index && terms.length
      ? index
          .filter((it) => {
            const hay = `${it.n} ${it.d} ${it.c} ${it.k}`.toLowerCase();
            return terms.every((t) => hay.includes(t));
          })
          .slice(0, 8)
      : [];

  return (
    <div className="relative" role="search">
      <label htmlFor={autoFocusId ?? listId + "-input"} className="sr-only">
        Search apps and games
      </label>
      <div className="flex items-center gap-2 rounded-full border border-border-strong bg-card px-5 shadow-card focus-within:border-accent">
        <SearchIcon className="shrink-0 text-muted" />
        <input
          id={autoFocusId ?? listId + "-input"}
          type="search"
          value={query}
          onFocus={load}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search apps and games, e.g. Brave"
          autoComplete="off"
          aria-controls={terms.length > 0 ? listId : undefined}
          className="min-h-12 w-full bg-transparent text-base outline-none focus-visible:outline-none placeholder:text-muted"
        />
      </div>
      {terms.length > 0 && (
        <div id={listId} aria-live="polite" className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-[var(--radius)] border border-border bg-card shadow-raised">
          {index === null ? (
            <p className="p-4 text-muted">Loading…</p>
          ) : results.length === 0 ? (
            <p className="p-4 text-muted">No apps match “{query}”.</p>
          ) : (
            <ul className="divide-y divide-border">
              {results.map((r) => (
                <li key={r.p}>
                  <Link href={r.p} prefetch={false} className="flex items-center gap-3 p-3 hover:bg-surface">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {r.i ? (
                      <img src={r.i} alt="" width={36} height={36} className="rounded-lg border border-border bg-surface" />
                    ) : (
                      <span aria-hidden="true" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-xs font-bold text-accent-text">
                        Tool
                      </span>
                    )}
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{r.n}</span>
                      <span className="block truncate text-sm text-muted">
                        {r.d} · {r.c}{r.v ? ` · v${r.v}` : ""}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
