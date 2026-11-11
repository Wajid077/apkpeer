"use client";

import { useEffect, useState } from "react";
import { md5 } from "@/lib/md5";
import { CopyButton, ErrorNote, Panel, btnPrimary, btnSecondary, fieldClass, labelClass } from "./ui";

export type DevKind = "hash" | "uuid" | "timestamp" | "base" | "color" | "roman" | "random" | "picker" | "lorem";

/** Unbiased crypto-random integer in [0, max). */
function rand(max: number): number {
  const limit = Math.floor(0x100000000 / max) * max;
  const b = new Uint32Array(1);
  do crypto.getRandomValues(b);
  while (b[0] >= limit);
  return b[0] % max;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-3">
      <dt className="w-36 shrink-0 text-sm font-semibold">{label}</dt>
      <dd className="min-w-0 flex-1 break-all font-mono text-sm">{value || "—"}</dd>
      <CopyButton text={value} />
    </div>
  );
}
const Rows = ({ children }: { children: React.ReactNode }) => <dl className="divide-y divide-border rounded-[var(--radius)] border border-border">{children}</dl>;

// ---------- hash ----------
function HashText() {
  const [text, setText] = useState("hello world");
  const [h, setH] = useState<Record<string, string>>({});
  useEffect(() => {
    let live = true;
    (async () => {
      const data = new TextEncoder().encode(text);
      const out: Record<string, string> = { MD5: md5(text) };
      for (const a of ["SHA-1", "SHA-256", "SHA-512"]) {
        const buf = await crypto.subtle.digest(a, data);
        out[a] = Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
      }
      if (live) setH(out);
    })();
    return () => {
      live = false;
    };
  }, [text]);
  return (
    <div className="space-y-4">
      <label className={labelClass}>
        Text to hash
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} className={`${fieldClass} font-mono text-sm`} />
      </label>
      <Rows>
        {["MD5", "SHA-1", "SHA-256", "SHA-512"].map((k) => (
          <Row key={k} label={k} value={h[k] ?? ""} />
        ))}
      </Rows>
      <p className="text-sm text-muted">MD5 and SHA-1 are fine for checksums but are no longer safe for passwords or signatures.</p>
    </div>
  );
}

// ---------- uuid ----------
function Uuid() {
  const [count, setCount] = useState(5);
  const [upper, setUpper] = useState(false);
  const [noDash, setNoDash] = useState(false);
  const [list, setList] = useState<string[]>([]);
  const gen = () => setList(Array.from({ length: Math.min(500, Math.max(1, count)) }, () => crypto.randomUUID()));
  useEffect(gen, []); // eslint-disable-line react-hooks/exhaustive-deps
  const shown = list.map((u) => (noDash ? u.replace(/-/g, "") : u)).map((u) => (upper ? u.toUpperCase() : u));
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <label className={labelClass}>
          How many (max 500)
          <input type="number" min={1} max={500} value={count} onChange={(e) => setCount(Number(e.target.value))} className={`${fieldClass} w-32`} />
        </label>
        <label className="inline-flex min-h-11 items-center gap-2"><input type="checkbox" checked={upper} onChange={(e) => setUpper(e.target.checked)} />Uppercase</label>
        <label className="inline-flex min-h-11 items-center gap-2"><input type="checkbox" checked={noDash} onChange={(e) => setNoDash(e.target.checked)} />No hyphens</label>
        <button type="button" onClick={gen} className={btnPrimary}>Generate</button>
      </div>
      <textarea readOnly value={shown.join("\n")} rows={Math.min(12, shown.length + 1)} className={`${fieldClass} bg-surface font-mono text-sm`} />
      <CopyButton text={shown.join("\n")} label="Copy all" />
    </div>
  );
}

// ---------- timestamp ----------
function Timestamp() {
  // Start empty: these pages are pre-rendered at build time, so "now" must come from the browser.
  const [now, setNow] = useState<number | null>(null);
  const [ts, setTs] = useState("");
  const [dt, setDt] = useState("");
  useEffect(() => {
    const tick = () => setNow(Math.floor(Date.now() / 1000));
    tick();
    setTs(String(Math.floor(Date.now() / 1000)));
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  const n = Number(ts.trim());
  const ms = !ts.trim() || Number.isNaN(n) ? null : ts.trim().length >= 13 ? n : n * 1000;
  const date = ms === null ? null : new Date(ms);
  const valid = date && !Number.isNaN(date.getTime());
  const fromDt = dt ? new Date(dt) : null;
  return (
    <div className="space-y-6">
      <p className="rounded-[var(--radius)] border border-border bg-surface p-4">
        Current Unix time: <strong className="font-mono text-lg">{now ?? "…"}</strong>
      </p>
      <div className="space-y-3">
        <label className={labelClass}>
          Unix timestamp (seconds or milliseconds)
          <input value={ts} onChange={(e) => setTs(e.target.value)} inputMode="numeric" className={`${fieldClass} font-mono`} />
        </label>
        {ts && !valid && <ErrorNote>That isn&apos;t a valid timestamp.</ErrorNote>}
        {valid && (
          <Rows>
            <Row label="Your time zone" value={date!.toLocaleString(undefined, { dateStyle: "full", timeStyle: "long" })} />
            <Row label="UTC" value={date!.toUTCString()} />
            <Row label="ISO 8601" value={date!.toISOString()} />
          </Rows>
        )}
      </div>
      <div className="space-y-3">
        <label className={labelClass}>
          Date and time → Unix timestamp
          <input type="datetime-local" value={dt} onChange={(e) => setDt(e.target.value)} className={`${fieldClass} max-w-xs`} />
        </label>
        {fromDt && !Number.isNaN(fromDt.getTime()) && (
          <Rows>
            <Row label="Seconds" value={String(Math.floor(fromDt.getTime() / 1000))} />
            <Row label="Milliseconds" value={String(fromDt.getTime())} />
          </Rows>
        )}
      </div>
    </div>
  );
}

// ---------- number base ----------
const BASES: [number, string][] = [[2, "Binary (base 2)"], [8, "Octal (base 8)"], [10, "Decimal (base 10)"], [16, "Hexadecimal (base 16)"]];
function parseBig(s: string, base: number): bigint | null {
  const clean = s.trim().toLowerCase().replace(/^0[xbo]/, "").replace(/[\s_]/g, "");
  if (!clean) return null;
  const digits = "0123456789abcdef".slice(0, base);
  if ([...clean].some((c) => !digits.includes(c))) return null;
  return [...clean].reduce((acc, c) => acc * BigInt(base) + BigInt(digits.indexOf(c)), 0n);
}
function NumberBase() {
  const [value, setValue] = useState("255");
  const [from, setFrom] = useState(10);
  const n = parseBig(value, from);
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Number
          <input value={value} onChange={(e) => setValue(e.target.value)} className={`${fieldClass} font-mono`} spellCheck={false} />
        </label>
        <label className={labelClass}>
          It&apos;s written in
          <select value={from} onChange={(e) => setFrom(Number(e.target.value))} className={fieldClass}>
            {BASES.map(([b, l]) => <option key={b} value={b}>{l}</option>)}
          </select>
        </label>
      </div>
      {value && n === null && <ErrorNote>That number contains digits that aren&apos;t valid in base {from}.</ErrorNote>}
      {n !== null && <Rows>{BASES.map(([b, l]) => <Row key={b} label={l} value={n.toString(b).toUpperCase()} />)}</Rows>}
    </div>
  );
}

// ---------- color ----------
function hexToRgb(hex: string): [number, number, number] | null {
  let h = hex.trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(h)) h = [...h].map((c) => c + c).join("");
  if (!/^[0-9a-f]{6}$/i.test(h)) return null;
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min, s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [Math.round(h * 60), Math.round(s * 100), Math.round(l * 100)];
}
function parseColor(s: string): [number, number, number] | null {
  const t = s.trim().toLowerCase();
  if (t.startsWith("#") || /^[0-9a-f]{3,6}$/.test(t)) return hexToRgb(t);
  const rgb = t.match(/^rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})/);
  if (rgb) return rgb.slice(1, 4).map((v) => Math.min(255, Number(v))) as [number, number, number];
  const hsl = t.match(/^hsla?\(\s*(\d{1,3})(?:deg)?[\s,]+(\d{1,3})%[\s,]+(\d{1,3})%/);
  if (hsl) {
    const [h, s, l] = [Number(hsl[1]) / 360, Number(hsl[2]) / 100, Number(hsl[3]) / 100];
    const f = (n: number) => {
      const k = (n + h * 12) % 12, a = s * Math.min(l, 1 - l);
      return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))));
    };
    return [f(0), f(8), f(4)];
  }
  return null;
}
function luminance([r, g, b]: number[]) {
  const c = [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
const contrast = (a: number, b: number) => ((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toFixed(2);
function ColorConv() {
  const [value, setValue] = useState("#15803d");
  const rgb = parseColor(value);
  const hex = rgb ? "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("") : "";
  const hsl = rgb ? rgbToHsl(...rgb) : null;
  const L = rgb ? luminance(rgb) : 0;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <label className={`${labelClass} flex-1`}>
          Color (HEX, RGB or HSL)
          <input value={value} onChange={(e) => setValue(e.target.value)} className={`${fieldClass} font-mono`} spellCheck={false} />
        </label>
        <label className={labelClass}>
          Pick
          <input type="color" value={hex || "#000000"} onChange={(e) => setValue(e.target.value)} className="mt-1 block h-11 w-16 rounded border border-border bg-bg" />
        </label>
      </div>
      {!rgb && <ErrorNote>Enter a color like #15803d, rgb(21, 128, 61) or hsl(142, 72%, 29%).</ErrorNote>}
      {rgb && hsl && (
        <>
          <div className="h-16 rounded-[var(--radius)] border border-border" style={{ background: hex }} aria-hidden="true" />
          <Rows>
            <Row label="HEX" value={hex} />
            <Row label="RGB" value={`rgb(${rgb.join(", ")})`} />
            <Row label="HSL" value={`hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`} />
            <Row label="Contrast on white" value={`${contrast(L, 1)}:1 ${Number(contrast(L, 1)) >= 4.5 ? "(passes AA)" : "(fails AA for body text)"}`} />
            <Row label="Contrast on black" value={`${contrast(L, 0)}:1 ${Number(contrast(L, 0)) >= 4.5 ? "(passes AA)" : "(fails AA for body text)"}`} />
          </Rows>
        </>
      )}
    </div>
  );
}

// ---------- roman ----------
const ROMAN: [number, string][] = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
function toRoman(n: number) {
  let out = "";
  for (const [v, s] of ROMAN) while (n >= v) { out += s; n -= v; }
  return out;
}
function fromRoman(s: string): number | null {
  const t = s.trim().toUpperCase();
  if (!/^[MDCLXVI]+$/.test(t)) return null;
  let i = 0, n = 0;
  for (const [v, sym] of ROMAN) while (t.startsWith(sym, i)) { n += v; i += sym.length; }
  return i === t.length && toRoman(n) === t ? n : null; // reject non-standard forms like IIII
}
function Roman() {
  const [value, setValue] = useState("2026");
  const asNum = /^\d+$/.test(value.trim()) ? Number(value) : null;
  const result = asNum !== null ? (asNum >= 1 && asNum <= 3999 ? toRoman(asNum) : null) : fromRoman(value);
  return (
    <div className="space-y-4">
      <label className={labelClass}>
        Number (1–3999) or Roman numeral
        <input value={value} onChange={(e) => setValue(e.target.value)} className={`${fieldClass} font-mono text-lg`} spellCheck={false} />
      </label>
      {value.trim() && result === null ? (
        <ErrorNote>{asNum !== null ? "Standard Roman numerals go from 1 to 3999." : "That isn't a standard Roman numeral (for example, 4 is IV, not IIII)."}</ErrorNote>
      ) : (
        result !== null && <Rows><Row label={asNum !== null ? "Roman numeral" : "Number"} value={String(result)} /></Rows>
      )}
    </div>
  );
}

// ---------- random number ----------
function RandomNumber() {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(1);
  const [unique, setUnique] = useState(true);
  const [out, setOut] = useState<number[]>([]);
  const [err, setErr] = useState("");
  function go() {
    const lo = Math.ceil(Math.min(min, max)), hi = Math.floor(Math.max(min, max));
    const span = hi - lo + 1;
    const n = Math.min(1000, Math.max(1, count));
    if (unique && n > span) return setErr(`There are only ${span} different numbers between ${lo} and ${hi}.`);
    setErr("");
    if (unique) {
      const picked = new Set<number>();
      while (picked.size < n) picked.add(lo + rand(span));
      setOut([...picked]);
    } else setOut(Array.from({ length: n }, () => lo + rand(span)));
  }
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <label className={labelClass}>Minimum<input type="number" value={min} onChange={(e) => setMin(Number(e.target.value))} className={fieldClass} /></label>
        <label className={labelClass}>Maximum<input type="number" value={max} onChange={(e) => setMax(Number(e.target.value))} className={fieldClass} /></label>
        <label className={labelClass}>How many (max 1000)<input type="number" min={1} max={1000} value={count} onChange={(e) => setCount(Number(e.target.value))} className={fieldClass} /></label>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <label className="inline-flex min-h-11 items-center gap-2"><input type="checkbox" checked={unique} onChange={(e) => setUnique(e.target.checked)} />No repeats</label>
        <button type="button" onClick={go} className={btnPrimary}>Generate</button>
      </div>
      {err && <ErrorNote>{err}</ErrorNote>}
      {out.length > 0 && (
        <div aria-live="polite" className="rounded-[var(--radius)] border border-border bg-surface p-4">
          <p className={`break-words font-mono font-bold ${out.length === 1 ? "text-4xl" : "text-lg"}`}>{out.join(", ")}</p>
          <div className="mt-3"><CopyButton text={out.join(", ")} /></div>
        </div>
      )}
    </div>
  );
}

// ---------- name picker ----------
function Picker() {
  const [text, setText] = useState("Ali\nSara\nAhmed\nFatima\nZain");
  const [count, setCount] = useState(1);
  const [out, setOut] = useState<string[]>([]);
  const names = text.split(/\r?\n|,/).map((s) => s.trim()).filter(Boolean);
  function shuffle() {
    const a = [...names];
    for (let i = a.length - 1; i > 0; i--) { const j = rand(i + 1); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  return (
    <div className="space-y-4">
      <label className={labelClass}>
        Names or items (one per line, or separated by commas)
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={7} className={fieldClass} />
      </label>
      <div className="flex flex-wrap items-end gap-3">
        <label className={labelClass}>Winners<input type="number" min={1} max={Math.max(1, names.length)} value={count} onChange={(e) => setCount(Number(e.target.value))} className={`${fieldClass} w-28`} /></label>
        <button type="button" onClick={() => setOut(shuffle().slice(0, Math.max(1, count)))} className={btnPrimary} disabled={!names.length}>Pick winner{count > 1 ? "s" : ""}</button>
        <button type="button" onClick={() => setOut(shuffle())} className={btnSecondary} disabled={!names.length}>Shuffle whole list</button>
        <span className="text-sm text-muted">{names.length} entries</span>
      </div>
      {out.length > 0 && (
        <ol aria-live="polite" className="list-decimal space-y-1 rounded-[var(--radius)] border border-border bg-surface p-4 pl-10 text-lg font-semibold">
          {out.map((n, i) => <li key={i}>{n}</li>)}
        </ol>
      )}
    </div>
  );
}

// ---------- lorem ipsum ----------
const LOREM = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum".split(" ");
function Lorem() {
  const [unit, setUnit] = useState<"paragraphs" | "sentences" | "words">("paragraphs");
  const [count, setCount] = useState(3);
  const [classic, setClassic] = useState(true);
  const [seed, setSeed] = useState(0);
  const [text, setText] = useState("");
  useEffect(() => {
    const word = () => LOREM[rand(LOREM.length)];
    const sentence = () => {
      const w = Array.from({ length: 8 + rand(9) }, word).join(" ");
      return w.charAt(0).toUpperCase() + w.slice(1) + ".";
    };
    const para = () => Array.from({ length: 4 + rand(3) }, sentence).join(" ");
    const n = Math.min(100, Math.max(1, count));
    let out = unit === "words" ? Array.from({ length: n }, word).join(" ") : unit === "sentences" ? Array.from({ length: n }, sentence).join(" ") : Array.from({ length: n }, para).join("\n\n");
    if (classic) out = "Lorem ipsum dolor sit amet, " + out.replace(/^./, (c) => c.toLowerCase());
    setText(out);
  }, [unit, count, classic, seed]);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <label className={labelClass}>How many<input type="number" min={1} max={100} value={count} onChange={(e) => setCount(Number(e.target.value))} className={`${fieldClass} w-28`} /></label>
        <label className={labelClass}>
          Of
          <select value={unit} onChange={(e) => setUnit(e.target.value as typeof unit)} className={fieldClass}>
            <option value="paragraphs">Paragraphs</option>
            <option value="sentences">Sentences</option>
            <option value="words">Words</option>
          </select>
        </label>
        <label className="inline-flex min-h-11 items-center gap-2"><input type="checkbox" checked={classic} onChange={(e) => setClassic(e.target.checked)} />Start with &ldquo;Lorem ipsum dolor sit amet&rdquo;</label>
        <button type="button" onClick={() => setSeed((s) => s + 1)} className={btnSecondary}>Regenerate</button>
      </div>
      <textarea readOnly value={text} rows={12} className={`${fieldClass} bg-surface`} />
      <CopyButton text={text} />
    </div>
  );
}

const MAP: Record<DevKind, () => React.ReactElement> = {
  hash: HashText, uuid: Uuid, timestamp: Timestamp, base: NumberBase, color: ColorConv, roman: Roman, random: RandomNumber, picker: Picker, lorem: Lorem,
};

export default function DevTools({ kind }: { kind: DevKind }) {
  const C = MAP[kind];
  return (
    <Panel>
      <C />
    </Panel>
  );
}
