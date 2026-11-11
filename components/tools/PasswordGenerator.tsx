"use client";

import { useCallback, useEffect, useState } from "react";
import { CopyButton, Panel, btnPrimary, labelClass } from "./ui";

const SETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.?/",
};
const AMBIGUOUS = /[O0oIl1|]/g;

/** Unbiased random index using rejection sampling over crypto.getRandomValues. */
function randomIndex(max: number): number {
  const limit = Math.floor(0x100000000 / max) * max;
  const buf = new Uint32Array(1);
  do crypto.getRandomValues(buf);
  while (buf[0] >= limit);
  return buf[0] % max;
}

function generate(length: number, sets: string[]): string {
  const all = sets.join("");
  // Guarantee at least one character from each chosen set, then shuffle.
  const chars = sets.map((s) => s[randomIndex(s.length)]);
  while (chars.length < length) chars.push(all[randomIndex(all.length)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

function strength(bits: number): { label: string; pct: number } {
  if (bits < 40) return { label: "Weak", pct: 20 };
  if (bits < 60) return { label: "Fair", pct: 45 };
  if (bits < 80) return { label: "Strong", pct: 70 };
  return { label: "Very strong", pct: 100 };
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(20);
  const [opts, setOpts] = useState({ lower: true, upper: true, digits: true, symbols: true, noAmbiguous: false });
  const [password, setPassword] = useState("");

  const sets = (Object.keys(SETS) as (keyof typeof SETS)[])
    .filter((k) => opts[k])
    .map((k) => (opts.noAmbiguous ? SETS[k].replace(AMBIGUOUS, "") : SETS[k]));
  const pool = sets.join("").length;
  const bits = pool ? Math.round(length * Math.log2(pool)) : 0;
  const s = strength(bits);

  const regenerate = useCallback(() => {
    setPassword(sets.length ? generate(length, sets) : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length, opts]);

  useEffect(regenerate, [regenerate]);

  return (
    <Panel>
      <div className="flex flex-wrap items-center gap-3 rounded-[var(--radius)] border border-border bg-surface p-4">
        <output aria-live="polite" className="min-w-0 flex-1 break-all font-mono text-lg">
          {password || "Pick at least one character type"}
        </output>
        <CopyButton text={password} />
        <button type="button" onClick={regenerate} className={btnPrimary} disabled={!sets.length}>
          New password
        </button>
      </div>

      <div className="mt-3">
        <div className="h-2 overflow-hidden rounded-full bg-surface" aria-hidden="true">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${s.pct}%` }} />
        </div>
        <p className="mt-1 text-sm text-muted">
          {s.label} · about {bits} bits of entropy
        </p>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className={`${labelClass} sm:col-span-2`}>
          Length: {length} characters
          <input type="range" min={8} max={64} value={length} onChange={(e) => setLength(Number(e.target.value))} className="mt-3 block w-full accent-[var(--accent)]" />
        </label>
        {(
          [
            ["upper", "Uppercase (A–Z)"],
            ["lower", "Lowercase (a–z)"],
            ["digits", "Numbers (0–9)"],
            ["symbols", "Symbols (!@#…)"],
            ["noAmbiguous", "Exclude look-alikes (O 0 l 1 I)"],
          ] as const
        ).map(([k, label]) => (
          <label key={k} className="inline-flex min-h-11 items-center gap-2">
            <input type="checkbox" checked={opts[k]} onChange={(e) => setOpts({ ...opts, [k]: e.target.checked })} />
            {label}
          </label>
        ))}
      </div>
    </Panel>
  );
}
