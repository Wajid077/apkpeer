"use client";

import { useMemo, useState } from "react";
import { Panel, btnSecondary, fieldClass } from "./ui";

function minutes(words: number, wpm: number): string {
  if (!words) return "0 sec";
  const secs = Math.round((words / wpm) * 60);
  return secs < 60 ? `${secs} sec` : `${Math.floor(secs / 60)} min ${secs % 60 ? `${secs % 60} sec` : ""}`.trim();
}

export default function WordCounter() {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const sentences = trimmed ? (trimmed.match(/[^.!?…]+[.!?…]+(?=\s|$)|[^.!?…]+$/g) ?? []).length : 0;
    const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter((p) => p.trim()).length : 0;
    return {
      words,
      chars: text.length,
      charsNoSpaces: text.replace(/\s/g, "").length,
      sentences,
      paragraphs,
      reading: minutes(words, 200),
      speaking: minutes(words, 130),
    };
  }, [text]);

  const items: [string, string | number][] = [
    ["Words", stats.words],
    ["Characters", stats.chars],
    ["Characters (no spaces)", stats.charsNoSpaces],
    ["Sentences", stats.sentences],
    ["Paragraphs", stats.paragraphs],
    ["Reading time", stats.reading],
    ["Speaking time", stats.speaking],
  ];

  return (
    <Panel>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-live="polite">
        {items.map(([k, v]) => (
          <div key={k} className="rounded-[var(--radius)] border border-border bg-surface p-3">
            <dt className="text-sm text-muted">{k}</dt>
            <dd className="text-xl font-bold">{v}</dd>
          </div>
        ))}
      </dl>
      <label className="mt-5 block">
        <span className="sr-only">Your text</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          placeholder="Type or paste your text here…"
          className={`${fieldClass} min-h-60`}
        />
      </label>
      <div className="mt-3">
        <button type="button" onClick={() => setText("")} className={btnSecondary} disabled={!text}>
          Clear
        </button>
      </div>
    </Panel>
  );
}
