"use client";

import { useEffect, useRef, useState } from "react";
import {
  ACCEPT,
  FORMAT_LABEL,
  convertImage,
  formatBytes,
  readDimensions,
  type ConvertResult,
  type OutFormat,
} from "@/lib/image-tools";
import { ErrorNote, FileDrop, Panel, btnPrimary, btnSecondary, fieldClass, labelClass } from "./ui";

type Mode = "convert" | "compress" | "resize" | "rotate" | "grayscale";

type Props = {
  mode: Mode;
  /** convert: preselected output format. */
  defaultFormat?: OutFormat;
  /** convert: hide the format picker (e.g. the PNG to JPG page). */
  lockFormat?: boolean;
  /** convert: what the file picker should accept. */
  accept?: string;
  dropLabel?: string;
};

type Row = ConvertResult | { name: string; error: string };

const OUT_FORMATS: OutFormat[] = ["image/jpeg", "image/png", "image/webp"];

/** Compress keeps JPG/WebP as they are; lossless or old formats become WebP so they actually shrink. */
function compressFormat(type: string, choice: "keep" | OutFormat): OutFormat {
  if (choice !== "keep") return choice;
  if (type === "image/jpeg" || type === "image/webp") return type;
  return "image/webp";
}
/** Resize keeps the original format where the browser can write it. */
function resizeFormat(type: string): OutFormat {
  return type === "image/jpeg" || type === "image/webp" ? type : "image/png";
}

export default function ImageTool({ mode, defaultFormat = "image/jpeg", lockFormat, accept = ACCEPT, dropLabel }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState<OutFormat>(defaultFormat);
  const [compressTo, setCompressTo] = useState<"keep" | OutFormat>("keep");
  const [quality, setQuality] = useState(mode === "compress" ? 80 : 90);
  const [background, setBackground] = useState("#ffffff");
  const [sizeMode, setSizeMode] = useState<"px" | "percent">("px");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [percent, setPercent] = useState("50");
  const [lockRatio, setLockRatio] = useState(true);
  const [rotate, setRotate] = useState<0 | 90 | 180 | 270>(90);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [firstSize, setFirstSize] = useState<{ width: number; height: number } | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const urls = useRef<string[]>([]);

  // Free the object URLs of previous results.
  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);

  async function addFiles(list: File[]) {
    const images = list.filter((f) => f.type.startsWith("image/") || /\.(jfif|jpe?g|png|webp|gif|bmp)$/i.test(f.name));
    setFiles(images);
    setRows([]);
    if (mode === "resize" && images[0]) {
      try {
        const d = await readDimensions(images[0]);
        setFirstSize(d);
        setWidth(String(d.width));
        setHeight(String(d.height));
      } catch {
        setFirstSize(null);
      }
    }
  }

  function onWidth(v: string) {
    setWidth(v);
    if (lockRatio && firstSize && Number(v) > 0) setHeight(String(Math.round((Number(v) * firstSize.height) / firstSize.width)));
  }
  function onHeight(v: string) {
    setHeight(v);
    if (lockRatio && firstSize && Number(v) > 0) setWidth(String(Math.round((Number(v) * firstSize.width) / firstSize.height)));
  }

  async function run() {
    setBusy(true);
    urls.current.forEach((u) => URL.revokeObjectURL(u));
    urls.current = [];
    const out: Row[] = [];
    for (const file of files) {
      try {
        let fmt: OutFormat = format;
        let w: number | undefined;
        let h: number | undefined;
        if (mode === "compress") fmt = compressFormat(file.type, compressTo);
        if (mode === "rotate" || mode === "grayscale") fmt = resizeFormat(file.type);
        if (mode === "resize") {
          fmt = resizeFormat(file.type);
          const d = await readDimensions(file);
          if (sizeMode === "percent") {
            const p = Math.max(1, Number(percent) || 100) / 100;
            w = d.width * p;
            h = d.height * p;
          } else {
            const tw = Number(width) || 0;
            const th = Number(height) || 0;
            // Each image keeps its own proportions when the ratio is locked.
            if (lockRatio && tw) {
              w = tw;
              h = (tw * d.height) / d.width;
            } else {
              w = tw || d.width;
              h = th || d.height;
            }
          }
        }
        const r = await convertImage(file, {
          format: fmt,
          quality: quality / 100,
          background,
          width: w,
          height: h,
          ...(mode === "rotate" ? { rotate, flipH, flipV } : {}),
          ...(mode === "grayscale" ? { grayscale: true } : {}),
        });
        urls.current.push(r.url);
        out.push(r);
      } catch (e) {
        out.push({ name: file.name, error: e instanceof Error ? e.message : "This image couldn't be processed." });
      }
      setRows([...out]);
    }
    setBusy(false);
  }

  const showQuality =
    (mode === "convert" && format !== "image/png") || mode !== "convert";
  const action =
    mode === "compress" ? "Compress" : mode === "resize" ? "Resize" : mode === "rotate" ? "Rotate / flip" : mode === "grayscale" ? "Make black and white" : `Convert to ${FORMAT_LABEL[format]}`;

  return (
    <Panel>
      <FileDrop
        accept={accept}
        multiple
        onFiles={addFiles}
        label={dropLabel ?? "Choose images"}
        hint="or drag and drop them here. Nothing is uploaded."
      />

      {files.length > 0 && (
        <div className="mt-6 space-y-5">
          <p className="text-[15px] text-muted">
            {files.length} {files.length === 1 ? "image" : "images"} selected
            {firstSize && mode === "resize" ? ` (first: ${firstSize.width} × ${firstSize.height} px)` : ""}
          </p>

          <div className="grid gap-5 sm:grid-cols-2">
            {mode === "convert" && !lockFormat && (
              <label className={labelClass}>
                Convert to
                <select value={format} onChange={(e) => setFormat(e.target.value as OutFormat)} className={fieldClass}>
                  {OUT_FORMATS.map((f) => (
                    <option key={f} value={f}>
                      {FORMAT_LABEL[f]}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {mode === "compress" && (
              <label className={labelClass}>
                Save as
                <select value={compressTo} onChange={(e) => setCompressTo(e.target.value as "keep" | OutFormat)} className={fieldClass}>
                  <option value="keep">Same format (PNG becomes WebP)</option>
                  <option value="image/jpeg">JPG</option>
                  <option value="image/webp">WebP</option>
                </select>
              </label>
            )}

            {mode === "resize" && (
              <fieldset className="sm:col-span-2">
                <legend className={labelClass}>Resize by</legend>
                <div className="mt-2 flex flex-wrap gap-4">
                  {(["px", "percent"] as const).map((m) => (
                    <label key={m} className="inline-flex min-h-11 items-center gap-2">
                      <input type="radio" name="sizeMode" checked={sizeMode === m} onChange={() => setSizeMode(m)} />
                      {m === "px" ? "Pixels" : "Percentage"}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            {mode === "resize" && sizeMode === "px" && (
              <>
                <label className={labelClass}>
                  Width (px)
                  <input type="number" min={1} inputMode="numeric" value={width} onChange={(e) => onWidth(e.target.value)} className={fieldClass} />
                </label>
                <label className={labelClass}>
                  Height (px)
                  <input type="number" min={1} inputMode="numeric" value={height} onChange={(e) => onHeight(e.target.value)} className={fieldClass} />
                </label>
                <label className="inline-flex min-h-11 items-center gap-2 sm:col-span-2">
                  <input type="checkbox" checked={lockRatio} onChange={(e) => setLockRatio(e.target.checked)} />
                  Lock aspect ratio
                </label>
              </>
            )}

            {mode === "resize" && sizeMode === "percent" && (
              <label className={labelClass}>
                Scale (%)
                <input type="number" min={1} max={400} inputMode="numeric" value={percent} onChange={(e) => setPercent(e.target.value)} className={fieldClass} />
              </label>
            )}

            {mode === "rotate" && (
              <>
                <label className={labelClass}>
                  Rotate
                  <select value={rotate} onChange={(e) => setRotate(Number(e.target.value) as 0 | 90 | 180 | 270)} className={fieldClass}>
                    <option value={0}>Don't rotate</option>
                    <option value={90}>90° clockwise</option>
                    <option value={180}>180°</option>
                    <option value={270}>90° counter-clockwise</option>
                  </select>
                </label>
                <div className="flex flex-col justify-end gap-1">
                  <label className="inline-flex min-h-11 items-center gap-2">
                    <input type="checkbox" checked={flipH} onChange={(e) => setFlipH(e.target.checked)} />
                    Flip horizontally (mirror)
                  </label>
                  <label className="inline-flex min-h-11 items-center gap-2">
                    <input type="checkbox" checked={flipV} onChange={(e) => setFlipV(e.target.checked)} />
                    Flip vertically
                  </label>
                </div>
              </>
            )}

            {showQuality && (
              <label className={labelClass}>
                Quality: {quality}%
                <input
                  type="range"
                  min={30}
                  max={100}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="mt-3 block w-full accent-[var(--accent)]"
                />
                {mode !== "convert" && mode !== "compress" && <span className="mt-1 block text-sm text-muted">Applies to JPG and WebP files.</span>}
              </label>
            )}

            {mode === "convert" && format === "image/jpeg" && (
              <label className={labelClass}>
                Background for transparent areas
                <span className="mt-1 flex items-center gap-3">
                  <input type="color" value={background} onChange={(e) => setBackground(e.target.value)} className="h-11 w-14 rounded border border-border bg-bg" />
                  <span className="font-mono text-sm text-muted">{background}</span>
                </span>
              </label>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={run} disabled={busy} className={btnPrimary}>
              {busy ? "Working…" : action}
            </button>
            <button
              type="button"
              className={btnSecondary}
              onClick={() => {
                setFiles([]);
                setRows([]);
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {rows.length > 0 && (
        <ul className="mt-6 divide-y divide-border rounded-[var(--radius)] border border-border" aria-live="polite">
          {rows.map((r, i) =>
            "error" in r ? (
              <li key={i} className="p-4">
                <p className="font-medium">{r.name}</p>
                <ErrorNote>{r.error}</ErrorNote>
              </li>
            ) : (
              <li key={i} className="flex flex-wrap items-center gap-4 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.url} alt="" width={56} height={56} className="h-14 w-14 rounded-lg border border-border bg-surface object-contain" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{r.name}</p>
                  <p className="text-sm text-muted">
                    {r.width} × {r.height} px · {formatBytes(r.originalSize)} → {formatBytes(r.blob.size)}{" "}
                    <span className={r.blob.size <= r.originalSize ? "text-accent-text" : ""}>
                      ({r.blob.size <= r.originalSize ? "−" : "+"}
                      {Math.abs(Math.round((1 - r.blob.size / r.originalSize) * 100))}%)
                    </span>
                  </p>
                </div>
                <a href={r.url} download={r.name} className={btnSecondary}>
                  Download
                </a>
              </li>
            ),
          )}
        </ul>
      )}
    </Panel>
  );
}
