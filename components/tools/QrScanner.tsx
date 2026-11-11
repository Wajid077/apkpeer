"use client";

import { useEffect, useRef, useState } from "react";
import { CopyButton, ErrorNote, FileDrop, Panel, btnPrimary, btnSecondary } from "./ui";

type JsQR = typeof import("jsqr").default;

/** jsQR is loaded only when the user actually scans, keeping the page light. */
async function loadJsQR(): Promise<JsQR> {
  const mod = await import("jsqr");
  return mod.default;
}

function decodeFrom(source: CanvasImageSource, w: number, h: number, jsQR: JsQR): string | null {
  const canvas = document.createElement("canvas");
  // Scale big photos down: faster and just as reliable for QR codes.
  const scale = Math.min(1, 1600 / Math.max(w, h));
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return jsQR(data.data, data.width, data.height, { inversionAttempts: "attemptBoth" })?.data ?? null;
}

function isUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function QrScanner() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [camera, setCamera] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const raf = useRef(0);

  function stopCamera() {
    cancelAnimationFrame(raf.current);
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    setCamera(false);
  }
  useEffect(() => stopCamera, []);

  async function scanFile(files: File[]) {
    setError("");
    setResult(null);
    const file = files[0];
    try {
      const jsQR = await loadJsQR();
      const bmp = await createImageBitmap(file);
      const text = decodeFrom(bmp, bmp.width, bmp.height, jsQR);
      bmp.close();
      if (text) setResult(text);
      else setError("No QR code found. Try a sharper image where the whole code is visible.");
    } catch {
      setError("This image couldn't be read. Try a JPG or PNG screenshot.");
    }
  }

  async function startCamera() {
    setError("");
    setResult(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Your browser doesn't allow camera access here. Use Scan an image instead.");
      return;
    }
    try {
      const jsQR = await loadJsQR();
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      stream.current = s;
      setCamera(true);
      const v = video.current!;
      v.srcObject = s;
      await v.play();
      const tick = () => {
        if (v.readyState >= 2) {
          const text = decodeFrom(v, v.videoWidth, v.videoHeight, jsQR);
          if (text) {
            setResult(text);
            stopCamera();
            return;
          }
        }
        raf.current = requestAnimationFrame(tick);
      };
      raf.current = requestAnimationFrame(tick);
    } catch {
      stopCamera();
      setError("Camera access was blocked or isn't available. Allow camera access in your browser settings, or scan an image instead.");
    }
  }

  return (
    <Panel>
      <div className="grid gap-4 sm:grid-cols-2">
        <FileDrop accept="image/*" onFiles={scanFile} label="Scan an image" hint="Photo or screenshot. Nothing is uploaded." />
        <div className="flex flex-col items-center justify-center gap-3 rounded-[var(--radius)] border border-border px-4 py-10 text-center">
          {camera ? (
            <button type="button" onClick={stopCamera} className={btnSecondary}>
              Stop camera
            </button>
          ) : (
            <button type="button" onClick={startCamera} className={btnPrimary}>
              Use camera
            </button>
          )}
          <p className="text-sm text-muted">Point it at a QR code</p>
        </div>
      </div>

      <video ref={video} playsInline muted className={`mt-4 w-full rounded-[var(--radius)] bg-black ${camera ? "" : "hidden"}`} aria-label="Camera preview" />

      <div aria-live="polite" className="mt-4">
        {error && <ErrorNote>{error}</ErrorNote>}
        {result !== null && (
          <div className="rounded-[var(--radius)] border border-border bg-surface p-4">
            <p className="text-sm font-medium text-muted">QR code content</p>
            <p className="mt-1 break-all font-mono text-[15px]">{result || "(empty)"}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <CopyButton text={result} />
              {isUrl(result) && (
                <a href={result} target="_blank" rel="noopener noreferrer nofollow" className={btnSecondary}>
                  Open link
                </a>
              )}
            </div>
            {isUrl(result) && (
              <p className="mt-3 text-sm text-muted">
                Check the address before opening: <strong className="text-fg">{new URL(result).hostname}</strong>. Never enter passwords on a site
                reached from an unknown QR code.
              </p>
            )}
          </div>
        )}
      </div>
    </Panel>
  );
}
