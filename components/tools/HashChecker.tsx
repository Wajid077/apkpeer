"use client";

import { useState } from "react";
import { formatBytes } from "@/lib/image-tools";
import { CopyButton, ErrorNote, FileDrop, Panel, fieldClass, labelClass } from "./ui";

const ALGOS = ["SHA-256", "SHA-1", "SHA-512"] as const;
type Algo = (typeof ALGOS)[number];

const hex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
/** Accepts hashes pasted with spaces, colons or uppercase (as apksigner and some sites print them). */
const normalize = (s: string) => s.toLowerCase().replace(/[^0-9a-f]/g, "");

export default function HashChecker() {
  const [file, setFile] = useState<File | null>(null);
  const [hashes, setHashes] = useState<Partial<Record<Algo, string>>>({});
  const [expected, setExpected] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function hashFile(files: File[]) {
    const f = files[0];
    setFile(f);
    setHashes({});
    setError("");
    if (!crypto?.subtle) {
      setError("Your browser can only calculate hashes on secure (https) pages.");
      return;
    }
    setBusy(true);
    try {
      const data = await f.arrayBuffer();
      const out: Partial<Record<Algo, string>> = {};
      for (const a of ALGOS) out[a] = hex(await crypto.subtle.digest(a, data));
      setHashes(out);
    } catch {
      setError("This file is too large for your browser's memory. Try a computer, or a smaller file.");
    } finally {
      setBusy(false);
    }
  }

  const want = normalize(expected);
  const match = want ? ALGOS.find((a) => hashes[a] === want) : undefined;

  return (
    <Panel>
      <FileDrop accept="*/*" onFiles={hashFile} label="Choose an APK or any file" hint="The file is read in your browser and never uploaded." />

      <label className={`${labelClass} mt-6`}>
        Expected hash (optional)
        <input
          value={expected}
          onChange={(e) => setExpected(e.target.value)}
          placeholder="Paste the SHA-256 published by the developer"
          className={`${fieldClass} font-mono text-sm`}
          autoComplete="off"
          spellCheck={false}
        />
      </label>

      <div aria-live="polite" className="mt-6 space-y-4">
        {busy && <p className="text-muted">Calculating…</p>}
        {error && <ErrorNote>{error}</ErrorNote>}

        {file && Object.keys(hashes).length > 0 && (
          <>
            <p className="text-[15px] text-muted">
              <strong className="text-fg">{file.name}</strong> · {formatBytes(file.size)}
            </p>
            {want && (
              <p
                className={`rounded-[var(--radius)] border p-3 font-semibold ${match ? "border-accent text-accent-text" : "border-danger text-danger"}`}
              >
                {match
                  ? `Match: the ${match} is identical to the one you pasted.`
                  : "No match. This file is different from the one the hash belongs to. Don't install it."}
              </p>
            )}
            <dl className="divide-y divide-border rounded-[var(--radius)] border border-border">
              {ALGOS.map((a) => (
                <div key={a} className="flex flex-wrap items-center gap-3 p-3">
                  <dt className="w-20 shrink-0 text-sm font-semibold">{a}</dt>
                  <dd className="min-w-0 flex-1 break-all font-mono text-sm">{hashes[a]}</dd>
                  <CopyButton text={hashes[a] ?? ""} />
                </div>
              ))}
            </dl>
          </>
        )}
      </div>
    </Panel>
  );
}
