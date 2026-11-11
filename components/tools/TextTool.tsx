"use client";

import { useMemo, useState } from "react";
import { CopyButton, ErrorNote, Panel, btnPrimary, btnSecondary, fieldClass, labelClass } from "./ui";

/**
 * One engine for every "text in → text out" tool. Each tool page passes a `kind`;
 * functions can't cross the server/client boundary, so transforms are selected here.
 */
export type TextKind =
  | "case"
  | "dedupe"
  | "sort"
  | "linebreaks"
  | "spaces"
  | "reverse"
  | "slug"
  | "findreplace"
  | "repeat"
  | "binary"
  | "morse"
  | "base64"
  | "url"
  | "json";

const lines = (s: string) => s.split(/\r?\n/);

// ---------- transforms ----------
function titleCase(s: string) {
  return s.toLowerCase().replace(/(^|[\s\-_(“"'])(\p{L})/gu, (_, p, c) => p + c.toUpperCase());
}
function sentenceCase(s: string) {
  return s.toLowerCase().replace(/(^\s*|[.!?]\s+)(\p{L})/gu, (_, p, c) => p + c.toUpperCase());
}
function slugify(s: string, sep: string) {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, sep)
    .replace(new RegExp(`^\\${sep}+|\\${sep}+$`, "g"), "");
}
function utf8ToB64(s: string, urlSafe: boolean) {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  const out = btoa(bin);
  return urlSafe ? out.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") : out;
}
function b64ToUtf8(s: string) {
  let clean = s.trim().replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
  while (clean.length % 4) clean += "=";
  const bin = atob(clean);
  return new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}
const MORSE: Record<string, string> = {
  a: ".-", b: "-...", c: "-.-.", d: "-..", e: ".", f: "..-.", g: "--.", h: "....", i: "..", j: ".---", k: "-.-", l: ".-..", m: "--",
  n: "-.", o: "---", p: ".--.", q: "--.-", r: ".-.", s: "...", t: "-", u: "..-", v: "...-", w: ".--", x: "-..-", y: "-.--", z: "--..",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-", "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--", "/": "-..-.", "(": "-.--.", ")": "-.--.-", "&": ".-...",
  ":": "---...", ";": "-.-.-.", "=": "-...-", "+": ".-.-.", "-": "-....-", _: "..--.-", '"': ".-..-.", $: "...-..-", "@": ".--.-.",
};
const MORSE_REV = Object.fromEntries(Object.entries(MORSE).map(([k, v]) => [v, k]));

type Opts = Record<string, string | boolean | number>;

function transform(kind: TextKind, input: string, o: Opts): { out: string; note?: string } {
  switch (kind) {
    case "case": {
      const m = o.mode as string;
      const out =
        m === "upper" ? input.toUpperCase()
        : m === "lower" ? input.toLowerCase()
        : m === "title" ? titleCase(input)
        : m === "sentence" ? sentenceCase(input)
        : Array.from(input.toLowerCase()).map((c, i) => (i % 2 ? c.toUpperCase() : c)).join("");
      return { out };
    }
    case "dedupe": {
      const seen = new Set<string>();
      const kept: string[] = [];
      for (const raw of lines(input)) {
        const line = o.trim ? raw.trim() : raw;
        if (o.dropEmpty && !line) continue;
        const key = o.ignoreCase ? line.toLowerCase() : line;
        if (seen.has(key)) continue;
        seen.add(key);
        kept.push(line);
      }
      const removed = lines(input).length - kept.length;
      return { out: kept.join("\n"), note: `${removed} line${removed === 1 ? "" : "s"} removed` };
    }
    case "sort": {
      const ls = lines(input).filter((l) => (o.dropEmpty ? l.trim() : true));
      const coll = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
      const m = o.mode as string;
      if (m === "random") {
        for (let i = ls.length - 1; i > 0; i--) {
          const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
          [ls[i], ls[j]] = [ls[j], ls[i]];
        }
      } else if (m === "length") ls.sort((a, b) => a.length - b.length || coll.compare(a, b));
      else ls.sort(coll.compare);
      if (m === "za" || o.reverse) ls.reverse();
      return { out: ls.join("\n") };
    }
    case "linebreaks": {
      const out = o.keepParagraphs
        ? input.split(/\r?\n\s*\r?\n/).map((p) => p.replace(/\s*\r?\n\s*/g, " ").trim()).join("\n\n")
        : input.replace(/\s*\r?\n\s*/g, o.joiner === "none" ? "" : " ").trim();
      return { out };
    }
    case "spaces": {
      let out = input.replace(/\t/g, o.tabs ? " " : "\t").replace(/[  ]{2,}/g, " ");
      if (o.trimLines) out = lines(out).map((l) => l.trim()).join("\n");
      if (o.emptyLines) out = out.replace(/(\r?\n){3,}/g, "\n\n");
      return { out: out.trim() };
    }
    case "reverse": {
      const m = o.mode as string;
      const out =
        m === "words" ? lines(input).map((l) => l.split(/(\s+)/).reverse().join("")).join("\n")
        : m === "lines" ? lines(input).reverse().join("\n")
        : Array.from(input).reverse().join("");
      return { out };
    }
    case "slug":
      return { out: lines(input).map((l) => slugify(l, o.sep as string)).join("\n") };
    case "findreplace": {
      const find = o.find as string;
      if (!find) return { out: input };
      let re: RegExp;
      try {
        const src = o.regex ? find : find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        re = new RegExp(o.whole ? `\\b(?:${src})\\b` : src, o.matchCase ? "g" : "gi");
      } catch {
        return { out: input, note: "That regular expression isn't valid." };
      }
      const count = (input.match(re) || []).length;
      return { out: input.replace(re, o.replace as string), note: `${count} replacement${count === 1 ? "" : "s"}` };
    }
    case "repeat": {
      const n = Math.min(10000, Math.max(1, Number(o.times) || 1));
      const sep = o.sep === "newline" ? "\n" : o.sep === "space" ? " " : o.sep === "comma" ? ", " : "";
      return { out: Array(n).fill(input).join(sep) };
    }
    case "binary": {
      if (o.dir === "decode") {
        const bytes = input.trim().split(/\s+/).filter(Boolean);
        if (bytes.some((b) => !/^[01]{1,8}$/.test(b))) return { out: "", note: "Binary must be groups of 0s and 1s (up to 8 digits), separated by spaces." };
        return { out: new TextDecoder().decode(Uint8Array.from(bytes, (b) => parseInt(b, 2))) };
      }
      return { out: Array.from(new TextEncoder().encode(input), (b) => b.toString(2).padStart(8, "0")).join(" ") };
    }
    case "morse": {
      if (o.dir === "decode") {
        const out = input
          .trim()
          .split(/\s*\/\s*|\s{3,}/)
          .map((w) => w.split(/\s+/).map((c) => MORSE_REV[c] ?? (c ? "�" : "")).join(""))
          .join(" ");
        return { out: out.toUpperCase() };
      }
      const out = input
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .map((w) => Array.from(w).map((c) => MORSE[c] ?? "").filter(Boolean).join(" "))
        .join(" / ");
      return { out };
    }
    case "base64": {
      try {
        return { out: o.dir === "decode" ? b64ToUtf8(input) : utf8ToB64(input, !!o.urlSafe) };
      } catch {
        return { out: "", note: "That isn't valid Base64 text, or it decodes to binary data rather than text." };
      }
    }
    case "url": {
      try {
        const out = o.dir === "decode" ? decodeURIComponent(input.replace(/\+/g, " ")) : o.full ? encodeURI(input) : encodeURIComponent(input);
        return { out };
      } catch {
        return { out: "", note: "This text contains a broken percent-encoding sequence (like %E0 on its own)." };
      }
    }
    case "json": {
      if (!input.trim()) return { out: "" };
      try {
        const parsed = JSON.parse(input);
        if (o.mode === "minify") return { out: JSON.stringify(parsed), note: "Valid JSON" };
        return { out: JSON.stringify(parsed, null, o.mode === "tab" ? "\t" : Number(o.mode) || 2), note: "Valid JSON" };
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Invalid JSON";
        return { out: "", note: `Invalid JSON: ${msg}` };
      }
    }
  }
}

// ---------- options UI per kind ----------
const DEFAULTS: Record<TextKind, Opts> = {
  case: { mode: "upper" },
  dedupe: { trim: true, ignoreCase: false, dropEmpty: true },
  sort: { mode: "az", dropEmpty: true },
  linebreaks: { joiner: "space", keepParagraphs: false },
  spaces: { tabs: true, trimLines: true, emptyLines: true },
  reverse: { mode: "chars" },
  slug: { sep: "-" },
  findreplace: { find: "", replace: "", matchCase: false, whole: false, regex: false },
  repeat: { times: 10, sep: "newline" },
  binary: { dir: "encode" },
  morse: { dir: "encode" },
  base64: { dir: "encode", urlSafe: false },
  url: { dir: "encode", full: false },
  json: { mode: "2" },
};

const PLACEHOLDER: Partial<Record<TextKind, string>> = {
  slug: "My Post Title: Here's What's New!",
  json: '{"name":"APKPeer","tools":["qr","image"],"free":true}',
  binary: "Hello",
  morse: "SOS",
  url: "https://example.com/search?q=android apps & games",
};

type Choice = [string, string];

function Segmented({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: Choice[]; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map(([v, l]) => (
        <button key={v} type="button" role="radio" aria-checked={value === v} onClick={() => onChange(v)} className={value === v ? btnPrimary : btnSecondary}>
          {l}
        </button>
      ))}
    </div>
  );
}

function Check({ on, set, children }: { on: boolean; set: (v: boolean) => void; children: string }) {
  return (
    <label className="inline-flex min-h-11 items-center gap-2">
      <input type="checkbox" checked={on} onChange={(e) => set(e.target.checked)} />
      {children}
    </label>
  );
}

export default function TextTool({ kind }: { kind: TextKind }) {
  const [input, setInput] = useState(PLACEHOLDER[kind] ?? "");
  const [o, setO] = useState<Opts>(DEFAULTS[kind]);
  const set = (k: string) => (v: string | boolean | number) => setO((p) => ({ ...p, [k]: v }));
  const { out, note } = useMemo(() => transform(kind, input, o), [kind, input, o]);
  const isError = !!note && /isn't valid|Invalid|must be|broken/.test(note);

  const dirLabels: Record<string, Choice[]> = {
    binary: [["encode", "Text → binary"], ["decode", "Binary → text"]],
    morse: [["encode", "Text → Morse"], ["decode", "Morse → text"]],
    base64: [["encode", "Encode"], ["decode", "Decode"]],
    url: [["encode", "Encode"], ["decode", "Decode"]],
  };

  return (
    <Panel>
      <div className="space-y-4">
        {/* options */}
        {kind === "case" && (
          <Segmented
            label="Case"
            value={o.mode as string}
            onChange={set("mode")}
            options={[["upper", "UPPERCASE"], ["lower", "lowercase"], ["title", "Title Case"], ["sentence", "Sentence case"], ["alt", "aLtErNaTiNg"]]}
          />
        )}
        {kind === "sort" && (
          <Segmented label="Sort order" value={o.mode as string} onChange={set("mode")} options={[["az", "A → Z"], ["za", "Z → A"], ["length", "By length"], ["random", "Shuffle"]]} />
        )}
        {kind === "reverse" && (
          <Segmented label="Reverse" value={o.mode as string} onChange={set("mode")} options={[["chars", "Letters"], ["words", "Word order"], ["lines", "Line order"]]} />
        )}
        {kind === "json" && (
          <Segmented label="Output" value={o.mode as string} onChange={set("mode")} options={[["2", "Format (2 spaces)"], ["4", "4 spaces"], ["tab", "Tabs"], ["minify", "Minify"]]} />
        )}
        {dirLabels[kind] && <Segmented label="Direction" value={o.dir as string} onChange={set("dir")} options={dirLabels[kind]} />}

        <div className="flex flex-wrap gap-x-6">
          {kind === "dedupe" && (
            <>
              <Check on={!!o.trim} set={set("trim")}>Trim spaces</Check>
              <Check on={!!o.ignoreCase} set={set("ignoreCase")}>Ignore case</Check>
              <Check on={!!o.dropEmpty} set={set("dropEmpty")}>Remove empty lines</Check>
            </>
          )}
          {kind === "sort" && <Check on={!!o.dropEmpty} set={set("dropEmpty")}>Remove empty lines</Check>}
          {kind === "linebreaks" && (
            <>
              <Check on={!!o.keepParagraphs} set={set("keepParagraphs")}>Keep paragraph breaks</Check>
              <Check on={o.joiner === "none"} set={(v) => set("joiner")(v ? "none" : "space")}>Join without spaces</Check>
            </>
          )}
          {kind === "spaces" && (
            <>
              <Check on={!!o.tabs} set={set("tabs")}>Convert tabs to spaces</Check>
              <Check on={!!o.trimLines} set={set("trimLines")}>Trim each line</Check>
              <Check on={!!o.emptyLines} set={set("emptyLines")}>Collapse empty lines</Check>
            </>
          )}
          {kind === "base64" && o.dir === "encode" && <Check on={!!o.urlSafe} set={set("urlSafe")}>URL-safe (no + / =)</Check>}
          {kind === "url" && o.dir === "encode" && <Check on={!!o.full} set={set("full")}>Keep URL structure (encode a whole address)</Check>}
          {kind === "findreplace" && (
            <>
              <Check on={!!o.matchCase} set={set("matchCase")}>Match case</Check>
              <Check on={!!o.whole} set={set("whole")}>Whole words</Check>
              <Check on={!!o.regex} set={set("regex")}>Regular expression</Check>
            </>
          )}
        </div>

        {kind === "slug" && (
          <label className={labelClass}>
            Separator
            <select value={o.sep as string} onChange={(e) => set("sep")(e.target.value)} className={`${fieldClass} max-w-xs`}>
              <option value="-">Hyphen ( - )</option>
              <option value="_">Underscore ( _ )</option>
            </select>
          </label>
        )}
        {kind === "findreplace" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              Find
              <input value={o.find as string} onChange={(e) => set("find")(e.target.value)} className={fieldClass} />
            </label>
            <label className={labelClass}>
              Replace with
              <input value={o.replace as string} onChange={(e) => set("replace")(e.target.value)} className={fieldClass} />
            </label>
          </div>
        )}
        {kind === "repeat" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              Repeat how many times? (max 10,000)
              <input type="number" min={1} max={10000} value={o.times as number} onChange={(e) => set("times")(Number(e.target.value))} className={fieldClass} />
            </label>
            <label className={labelClass}>
              Separate with
              <select value={o.sep as string} onChange={(e) => set("sep")(e.target.value)} className={fieldClass}>
                <option value="newline">New line</option>
                <option value="space">Space</option>
                <option value="comma">Comma</option>
                <option value="none">Nothing</option>
              </select>
            </label>
          </div>
        )}

        {/* input / output */}
        <div className="grid gap-4 lg:grid-cols-2">
          <label className={labelClass}>
            Input
            <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={10} spellCheck={false} className={`${fieldClass} font-mono text-sm`} />
          </label>
          <label className={labelClass}>
            Result
            <textarea value={out} readOnly rows={10} className={`${fieldClass} bg-surface font-mono text-sm`} />
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-3" aria-live="polite">
          <CopyButton text={out} label="Copy result" />
          <button type="button" className={btnSecondary} onClick={() => setInput(out)} disabled={!out}>
            Use result as input
          </button>
          <button type="button" className={btnSecondary} onClick={() => setInput("")} disabled={!input}>
            Clear
          </button>
          {note && (isError ? <ErrorNote>{note}</ErrorNote> : <span className="text-sm text-muted">{note}</span>)}
          <span className="ml-auto text-sm text-muted">{out.length.toLocaleString()} characters</span>
        </div>
      </div>
    </Panel>
  );
}
