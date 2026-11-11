"use client";

import { useEffect, useRef, useState } from "react";
import { CopyButton, ErrorNote, Panel, btnPrimary, btnSecondary, fieldClass, labelClass } from "./ui";

export type DeviceKind = "screen" | "device" | "stopwatch" | "tts";

function Grid({ items }: { items: [string, string][] }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2" aria-live="polite">
      {items.map(([k, v]) => (
        <div key={k} className="rounded-[var(--radius)] border border-border p-3">
          <dt className="text-sm text-muted">{k}</dt>
          <dd className="break-words text-lg font-semibold">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

// ---------- screen resolution ----------
function Screen() {
  const [s, setS] = useState<Record<string, string> | null>(null);
  useEffect(() => {
    const read = () => {
      const dpr = window.devicePixelRatio || 1;
      setS({
        "Screen size (CSS pixels)": `${screen.width} × ${screen.height}`,
        "Screen resolution (physical pixels)": `${Math.round(screen.width * dpr)} × ${Math.round(screen.height * dpr)}`,
        "Device pixel ratio": String(Math.round(dpr * 100) / 100),
        "Browser window (viewport)": `${window.innerWidth} × ${window.innerHeight}`,
        "Available screen space": `${screen.availWidth} × ${screen.availHeight}`,
        Orientation: screen.orientation?.type?.replace("-primary", "").replace("-secondary", " (flipped)") ?? (window.innerWidth > window.innerHeight ? "landscape" : "portrait"),
        "Color depth": `${screen.colorDepth}-bit`,
        "Touch points": String(navigator.maxTouchPoints ?? 0),
      });
    };
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);
  if (!s) return <p className="text-muted">Reading your screen…</p>;
  return (
    <div className="space-y-4">
      <div className="rounded-[var(--radius)] border border-accent bg-surface p-4">
        <p className="text-sm text-muted">Your screen resolution</p>
        <p className="text-3xl font-bold">{s["Screen resolution (physical pixels)"]}</p>
      </div>
      <Grid items={Object.entries(s)} />
      <p className="text-sm text-muted">Resize or rotate your device and the values update live.</p>
    </div>
  );
}

// ---------- device & which APK ----------
type UAData = { getHighEntropyValues: (k: string[]) => Promise<Record<string, unknown>>; platform?: string; mobile?: boolean; brands?: { brand: string; version: string }[] };

function abiFor(arch: string, bitness: string): string | null {
  if (arch === "arm") return bitness === "64" ? "arm64-v8a" : "armeabi-v7a";
  if (arch === "x86") return bitness === "64" ? "x86_64" : "x86";
  return null;
}
function parseUa(ua: string) {
  const android = ua.match(/Android\s([\d.]+)/)?.[1];
  const model = ua.match(/Android[^;]*;\s*([^;)]+?)(?:\sBuild|\))/)?.[1];
  const browser =
    ua.match(/(SamsungBrowser|EdgA?|OPR|Firefox|FxiOS|CriOS|Chrome|Version)\/([\d.]+)/) ?? null;
  const name = browser ? ({ SamsungBrowser: "Samsung Internet", Edg: "Edge", EdgA: "Edge", OPR: "Opera", FxiOS: "Firefox", CriOS: "Chrome", Version: "Safari" } as Record<string, string>)[browser[1]] ?? browser[1] : "Unknown";
  const os = android ? `Android ${android}` : /iPhone|iPad/.test(ua) ? "iOS / iPadOS" : /Windows/.test(ua) ? "Windows" : /Mac OS X/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "Unknown";
  return { os, model: model && model !== "K" ? model : null, browser: browser ? `${name} ${browser[2].split(".")[0]}` : name };
}
function Device() {
  const [info, setInfo] = useState<Record<string, string> | null>(null);
  const [abi, setAbi] = useState<string | null>(null);
  const [isAndroid, setIsAndroid] = useState(false);
  useEffect(() => {
    (async () => {
      const ua = navigator.userAgent;
      const p = parseUa(ua);
      const out: Record<string, string> = { "Operating system": p.os, Browser: p.browser };
      setIsAndroid(/Android/.test(ua));
      const uad = (navigator as Navigator & { userAgentData?: UAData }).userAgentData;
      if (uad?.getHighEntropyValues) {
        try {
          const h = await uad.getHighEntropyValues(["architecture", "bitness", "model", "platformVersion"]);
          if (h.model) out["Device model"] = String(h.model);
          if (h.platform === "Android" && h.platformVersion) out["Operating system"] = `Android ${String(h.platformVersion).split(".")[0]}`;
          if (h.architecture) {
            out["Processor architecture"] = `${h.architecture} (${h.bitness}-bit)`;
            setAbi(abiFor(String(h.architecture), String(h.bitness)));
          }
        } catch {
          /* high-entropy hints refused: fall back to the user agent */
        }
      }
      if (!out["Device model"] && p.model) out["Device model"] = p.model;
      if (navigator.hardwareConcurrency) out["CPU cores"] = String(navigator.hardwareConcurrency);
      const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
      if (mem) out["RAM (approximate)"] = `${mem} GB or more`;
      out.Language = navigator.language;
      out["Cookies enabled"] = navigator.cookieEnabled ? "Yes" : "No";
      out["User agent"] = ua;
      setInfo(out);
    })();
  }, []);
  if (!info) return <p className="text-muted">Detecting your device…</p>;
  const { "User agent": ua, ...rest } = info;
  return (
    <div className="space-y-4">
      <div className="rounded-[var(--radius)] border border-accent bg-surface p-4">
        <p className="text-sm text-muted">APK version to download</p>
        <p className="text-2xl font-bold">{abi ?? (isAndroid ? "Couldn't detect (try Chrome)" : "Open this page on your Android phone")}</p>
        {abi && (
          <p className="mt-1 text-[15px] text-muted">
            When a developer offers several APKs, pick the one marked <strong className="text-fg">{abi}</strong>
            {abi === "arm64-v8a" ? ". If there isn't one, a \"universal\" APK works too." : "."}
          </p>
        )}
      </div>
      <Grid items={Object.entries(rest)} />
      <div>
        <p className="text-sm text-muted">User agent string</p>
        <p className="mt-1 break-all rounded-[var(--radius)] border border-border bg-surface p-3 font-mono text-xs">{ua}</p>
        <div className="mt-2"><CopyButton text={ua} label="Copy user agent" /></div>
      </div>
    </div>
  );
}

// ---------- stopwatch ----------
const clock = (ms: number) => {
  const h = Math.floor(ms / 3_600_000), m = Math.floor(ms / 60_000) % 60, s = Math.floor(ms / 1000) % 60, cs = Math.floor(ms / 10) % 100;
  return `${h ? `${h}:` : ""}${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
};
function Stopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const start = useRef(0), base = useRef(0), raf = useRef(0);
  useEffect(() => {
    if (!running) return;
    start.current = performance.now();
    const tick = () => {
      setElapsed(base.current + performance.now() - start.current);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [running]);
  const toggle = () => {
    if (running) base.current += performance.now() - start.current;
    setRunning(!running);
  };
  const reset = () => { setRunning(false); base.current = 0; setElapsed(0); setLaps([]); };
  return (
    <div className="space-y-5 text-center">
      <p className="font-mono text-6xl font-bold tabular-nums sm:text-7xl" aria-live="off">{clock(elapsed)}</p>
      <div className="flex justify-center gap-3">
        <button type="button" onClick={toggle} className={btnPrimary}>{running ? "Stop" : elapsed ? "Resume" : "Start"}</button>
        <button type="button" onClick={() => setLaps([elapsed, ...laps])} disabled={!running} className={btnSecondary}>Lap</button>
        <button type="button" onClick={reset} disabled={!elapsed} className={btnSecondary}>Reset</button>
      </div>
      {laps.length > 0 && (
        <ol className="mx-auto max-w-sm divide-y divide-border rounded-[var(--radius)] border border-border text-left">
          {laps.map((t, i) => (
            <li key={laps.length - i} className="flex justify-between p-3 font-mono tabular-nums">
              <span>Lap {laps.length - i}</span>
              <span className="text-muted">+{clock(t - (laps[i + 1] ?? 0))}</span>
              <span>{clock(t)}</span>
            </li>
          ))}
        </ol>
      )}
      <p className="text-sm text-muted">Keyboard: Space to start or stop.</p>
      <KeySpace onSpace={toggle} />
    </div>
  );
}
function KeySpace({ onSpace }: { onSpace: () => void }) {
  const cb = useRef(onSpace);
  cb.current = onSpace;
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.code === "Space" && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLButtonElement)) {
        e.preventDefault();
        cb.current();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);
  return null;
}

// ---------- text to speech ----------
function Tts() {
  const [text, setText] = useState("Welcome to APKPeer. This text is read aloud by your device.");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voice, setVoice] = useState("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);
  useEffect(() => {
    if (!("speechSynthesis" in window)) return setSupported(false);
    const load = () => {
      const v = speechSynthesis.getVoices();
      setVoices(v);
      setVoice((cur) => cur || v.find((x) => x.default)?.voiceURI || v[0]?.voiceURI || "");
    };
    load();
    speechSynthesis.addEventListener("voiceschanged", load);
    return () => {
      speechSynthesis.removeEventListener("voiceschanged", load);
      speechSynthesis.cancel();
    };
  }, []);
  function speak() {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = voices.find((x) => x.voiceURI === voice);
    if (v) { u.voice = v; u.lang = v.lang; }
    u.rate = rate;
    u.pitch = pitch;
    u.onend = u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    speechSynthesis.speak(u);
  }
  if (!supported) return <ErrorNote>Your browser doesn&apos;t support text to speech. Try Chrome, Edge, Safari or Samsung Internet.</ErrorNote>;
  return (
    <div className="space-y-4">
      <label className={labelClass}>
        Text to read aloud
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} className={fieldClass} />
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className={labelClass}>
          Voice
          <select value={voice} onChange={(e) => setVoice(e.target.value)} className={fieldClass}>
            {voices.map((v) => <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>)}
          </select>
        </label>
        <label className={labelClass}>
          Speed: {rate}×
          <input type="range" min={0.5} max={2} step={0.1} value={rate} onChange={(e) => setRate(Number(e.target.value))} className="mt-3 block w-full accent-[var(--accent)]" />
        </label>
        <label className={labelClass}>
          Pitch: {pitch}
          <input type="range" min={0.5} max={2} step={0.1} value={pitch} onChange={(e) => setPitch(Number(e.target.value))} className="mt-3 block w-full accent-[var(--accent)]" />
        </label>
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={speak} disabled={!text.trim()} className={btnPrimary}>{speaking ? "Restart" : "Speak"}</button>
        <button type="button" onClick={() => speechSynthesis.pause()} disabled={!speaking} className={btnSecondary}>Pause</button>
        <button type="button" onClick={() => speechSynthesis.resume()} disabled={!speaking} className={btnSecondary}>Resume</button>
        <button type="button" onClick={() => { speechSynthesis.cancel(); setSpeaking(false); }} disabled={!speaking} className={btnSecondary}>Stop</button>
      </div>
      {voices.length === 0 && <p className="text-sm text-muted">Loading voices… On Android, voices come from your phone&apos;s text-to-speech engine (Settings → Accessibility → Text-to-speech).</p>}
    </div>
  );
}

const MAP: Record<DeviceKind, () => React.ReactElement> = { screen: Screen, device: Device, stopwatch: Stopwatch, tts: Tts };

export default function DeviceTools({ kind }: { kind: DeviceKind }) {
  const C = MAP[kind];
  return (
    <Panel>
      <C />
    </Panel>
  );
}
