"use client";

import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";
import { CopyButton, ErrorNote, Panel, btnPrimary, btnSecondary, fieldClass, labelClass } from "./ui";

type Kind = "text" | "wifi";
type Level = "L" | "M" | "Q" | "H";

/** Wi-Fi QR payload format understood by Android and iOS cameras. Special characters must be escaped. */
function wifiPayload(ssid: string, password: string, security: "WPA" | "WEP" | "nopass", hidden: boolean): string {
  const esc = (s: string) => s.replace(/([\\;,:"])/g, "\\$1");
  return `WIFI:T:${security};S:${esc(ssid)};${security === "nopass" ? "" : `P:${esc(password)};`}${hidden ? "H:true;" : ""};`;
}

export default function QrGenerator() {
  const [kind, setKind] = useState<Kind>("text");
  const [text, setText] = useState("https://apkpeer.com");
  const [ssid, setSsid] = useState("");
  const [wifiPass, setWifiPass] = useState("");
  const [security, setSecurity] = useState<"WPA" | "WEP" | "nopass">("WPA");
  const [hidden, setHidden] = useState(false);
  const [size, setSize] = useState(512);
  const [fg, setFg] = useState("#111114");
  const [bg, setBg] = useState("#ffffff");
  const [level, setLevel] = useState<Level>("M");
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");
  const canvas = useRef<HTMLCanvasElement>(null);

  const payload = kind === "wifi" ? (ssid ? wifiPayload(ssid, wifiPass, security, hidden) : "") : text;

  useEffect(() => {
    if (!payload) {
      setSvg("");
      setError("");
      return;
    }
    const opts = { errorCorrectionLevel: level, margin: 2, color: { dark: fg, light: bg } };
    let cancelled = false;
    (async () => {
      try {
        if (canvas.current) {
          await QRCode.toCanvas(canvas.current, payload, { ...opts, width: size });
          // The library sets a fixed inline pixel width; let CSS scale the preview to its box instead.
          canvas.current.style.width = "100%";
          canvas.current.style.height = "auto";
        }
        const s = await QRCode.toString(payload, { ...opts, type: "svg", width: size });
        if (!cancelled) {
          setSvg(s);
          setError("");
        }
      } catch {
        if (!cancelled) setError("That's too much content for one QR code. Shorten the text or use a lower error correction level.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [payload, size, fg, bg, level]);

  function downloadPng() {
    const url = canvas.current?.toDataURL("image/png");
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = "qr-code.png";
    a.click();
  }
  function downloadSvg() {
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "qr-code.svg";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <Panel>
      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,260px)]">
        <div className="space-y-5">
          <div role="tablist" aria-label="QR code type" className="flex gap-2">
            {(["text", "wifi"] as const).map((k) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={kind === k}
                onClick={() => setKind(k)}
                className={kind === k ? btnPrimary : btnSecondary}
              >
                {k === "text" ? "Link or text" : "Wi-Fi"}
              </button>
            ))}
          </div>

          {kind === "text" ? (
            <label className={labelClass}>
              Link or text
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={2000} className={fieldClass} placeholder="https://example.com" />
            </label>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Network name (SSID)
                <input value={ssid} onChange={(e) => setSsid(e.target.value)} className={fieldClass} autoComplete="off" />
              </label>
              <label className={labelClass}>
                Security
                <select value={security} onChange={(e) => setSecurity(e.target.value as typeof security)} className={fieldClass}>
                  <option value="WPA">WPA / WPA2 / WPA3</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">None (open network)</option>
                </select>
              </label>
              {security !== "nopass" && (
                <label className={labelClass}>
                  Password
                  <input value={wifiPass} onChange={(e) => setWifiPass(e.target.value)} className={fieldClass} autoComplete="off" />
                </label>
              )}
              <label className="inline-flex min-h-11 items-center gap-2 self-end">
                <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} />
                Hidden network
              </label>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              Size: {size} px
              <input type="range" min={128} max={1024} step={32} value={size} onChange={(e) => setSize(Number(e.target.value))} className="mt-3 block w-full accent-[var(--accent)]" />
            </label>
            <label className={labelClass}>
              Error correction
              <select value={level} onChange={(e) => setLevel(e.target.value as Level)} className={fieldClass}>
                <option value="L">Low (7%), smallest code</option>
                <option value="M">Medium (15%), recommended</option>
                <option value="Q">Quartile (25%)</option>
                <option value="H">High (30%), for printed logos</option>
              </select>
            </label>
            <label className={labelClass}>
              Code color
              <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="mt-1 block h-11 w-16 rounded border border-border bg-bg" />
            </label>
            <label className={labelClass}>
              Background
              <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="mt-1 block h-11 w-16 rounded border border-border bg-bg" />
            </label>
          </div>
          {error && <ErrorNote>{error}</ErrorNote>}
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="w-full max-w-[260px] rounded-[var(--radius)] border border-border bg-white p-2">
            {/* The canvas holds the full-size PNG; CSS scales the preview down. */}
            <canvas ref={canvas} aria-label="QR code preview" role="img" className={`h-auto w-full ${payload ? "" : "hidden"}`} />
            {!payload && <p className="p-8 text-center text-sm text-muted">Your QR code appears here</p>}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" onClick={downloadPng} disabled={!payload || !!error} className={btnPrimary}>
              Download PNG
            </button>
            <button type="button" onClick={downloadSvg} disabled={!svg || !!error} className={btnSecondary}>
              SVG
            </button>
            {kind === "text" && <CopyButton text={text} label="Copy text" />}
          </div>
        </div>
      </div>
    </Panel>
  );
}
