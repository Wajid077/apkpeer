"use client";

import { useEffect, useRef, useState } from "react";
import { formatBytes } from "@/lib/image-tools";
import { CopyButton, ErrorNote, FileDrop, Panel, btnPrimary, btnSecondary } from "./ui";

export type ImageExtraKind = "base64" | "favicon" | "colorpicker";

const readDataUrl = (f: File) =>
  new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = () => rej(r.error);
    r.readAsDataURL(f);
  });

// ---------- image to Base64 ----------
function ToBase64() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState<"data" | "raw" | "css" | "html">("data");
  async function load(files: File[]) {
    setFile(files[0]);
    setUrl(await readDataUrl(files[0]));
  }
  const raw = url.replace(/^data:[^,]+,/, "");
  const out = format === "raw" ? raw : format === "css" ? `background-image: url("${url}");` : format === "html" ? `<img src="${url}" alt="">` : url;
  return (
    <div className="space-y-4">
      <FileDrop accept="image/*" onFiles={load} label="Choose an image" hint="Small images (icons, logos) work best. Nothing is uploaded." />
      {file && url && (
        <>
          <div className="flex flex-wrap items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-16 w-16 rounded-lg border border-border bg-surface object-contain" />
            <p className="text-[15px] text-muted">
              {file.name} · {formatBytes(file.size)} → {formatBytes(out.length)} as text (+{Math.round((out.length / file.size - 1) * 100)}%)
            </p>
          </div>
          <div role="radiogroup" aria-label="Output format" className="flex flex-wrap gap-2">
            {([["data", "Data URL"], ["raw", "Base64 only"], ["css", "CSS"], ["html", "HTML <img>"]] as const).map(([v, l]) => (
              <button key={v} type="button" role="radio" aria-checked={format === v} onClick={() => setFormat(v)} className={format === v ? btnPrimary : btnSecondary}>{l}</button>
            ))}
          </div>
          <textarea readOnly value={out} rows={8} className="block w-full rounded-[var(--radius)] border border-border bg-surface p-3 font-mono text-xs" />
          <CopyButton text={out} />
          {file.size > 100 * 1024 && <p className="text-sm text-muted">Base64 makes files about a third larger. For images over ~100 KB, linking to the file is usually better than embedding it.</p>}
        </>
      )}
    </div>
  );
}

// ---------- favicon generator ----------
const SIZES = [16, 32, 48, 180, 192, 512];
async function squarePng(img: ImageBitmap, size: number): Promise<Blob> {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  const s = Math.min(img.width, img.height); // centre-crop to a square
  ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
  return new Promise((r) => c.toBlob((b) => r(b!), "image/png"));
}
/** ICO file holding PNG images (supported by all modern browsers and Windows Vista+). */
async function buildIco(pngs: { size: number; blob: Blob }[]): Promise<Blob> {
  const datas = await Promise.all(pngs.map((p) => p.blob.arrayBuffer()));
  const header = new DataView(new ArrayBuffer(6 + 16 * pngs.length));
  header.setUint16(2, 1, true);
  header.setUint16(4, pngs.length, true);
  let offset = header.byteLength;
  pngs.forEach((p, i) => {
    const o = 6 + i * 16;
    header.setUint8(o, p.size >= 256 ? 0 : p.size);
    header.setUint8(o + 1, p.size >= 256 ? 0 : p.size);
    header.setUint16(o + 4, 1, true);
    header.setUint16(o + 6, 32, true);
    header.setUint32(o + 8, datas[i].byteLength, true);
    header.setUint32(o + 12, offset, true);
    offset += datas[i].byteLength;
  });
  return new Blob([header.buffer, ...datas], { type: "image/x-icon" });
}
function Favicon() {
  const [items, setItems] = useState<{ size: number; url: string; name: string }[]>([]);
  const [ico, setIco] = useState("");
  const [err, setErr] = useState("");
  const urls = useRef<string[]>([]);
  useEffect(() => () => urls.current.forEach(URL.revokeObjectURL), []);
  async function load(files: File[]) {
    setErr("");
    try {
      urls.current.forEach(URL.revokeObjectURL);
      const img = await createImageBitmap(files[0]);
      const pngs = await Promise.all(SIZES.map(async (size) => ({ size, blob: await squarePng(img, size) })));
      img.close();
      const icoBlob = await buildIco(pngs.filter((p) => p.size <= 48));
      const out = pngs.map((p) => ({
        size: p.size,
        url: URL.createObjectURL(p.blob),
        name: p.size === 180 ? "apple-touch-icon.png" : p.size >= 192 ? `icon-${p.size}.png` : `favicon-${p.size}x${p.size}.png`,
      }));
      const icoUrl = URL.createObjectURL(icoBlob);
      urls.current = [...out.map((o) => o.url), icoUrl];
      setItems(out);
      setIco(icoUrl);
    } catch {
      setErr("This image couldn't be read. Try a PNG or JPG.");
    }
  }
  const snippet = `<link rel="icon" href="/favicon.ico" sizes="any">\n<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">\n<link rel="apple-touch-icon" href="/apple-touch-icon.png">`;
  return (
    <div className="space-y-5">
      <FileDrop accept="image/*" onFiles={load} label="Choose a logo or image" hint="A square image at least 512 × 512 px works best. Nothing is uploaded." />
      {err && <ErrorNote>{err}</ErrorNote>}
      {items.length > 0 && (
        <>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <li className="flex items-center gap-3 rounded-[var(--radius)] border border-accent p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={items[1].url} alt="" width={32} height={32} />
              <span className="flex-1 text-[15px] font-semibold">favicon.ico <span className="font-normal text-muted">(16, 32, 48)</span></span>
              <a href={ico} download="favicon.ico" className={btnSecondary}>Download</a>
            </li>
            {items.map((i) => (
              <li key={i.size} className="flex items-center gap-3 rounded-[var(--radius)] border border-border p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={i.url} alt="" width={32} height={32} className="rounded" />
                <span className="flex-1 text-[15px]">{i.name} <span className="text-muted">{i.size}px</span></span>
                <a href={i.url} download={i.name} className={btnSecondary}>Download</a>
              </li>
            ))}
          </ul>
          <div>
            <p className="text-[15px] font-medium">Add this to your page&apos;s &lt;head&gt;:</p>
            <pre className="mt-2 overflow-x-auto rounded-[var(--radius)] border border-border bg-surface p-3 text-xs">{snippet}</pre>
            <div className="mt-2"><CopyButton text={snippet} label="Copy HTML" /></div>
          </div>
        </>
      )}
    </div>
  );
}

// ---------- color picker from image ----------
const hex = (r: number, g: number, b: number) => "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
function ColorPicker() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [picked, setPicked] = useState<{ hex: string; rgb: string } | null>(null);
  const [palette, setPalette] = useState<string[]>([]);
  async function load(files: File[]) {
    const img = await createImageBitmap(files[0]);
    const c = canvas.current!;
    const scale = Math.min(1, 1200 / Math.max(img.width, img.height));
    c.width = Math.round(img.width * scale);
    c.height = Math.round(img.height * scale);
    const ctx = c.getContext("2d", { willReadFrequently: true })!;
    ctx.drawImage(img, 0, 0, c.width, c.height);
    img.close();
    // Palette: bucket colors at 4 bits per channel, keep the most common.
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    const counts = new Map<number, [number, number, number, number]>();
    for (let i = 0; i < d.length; i += 16) {
      if (d[i + 3] < 128) continue;
      const key = ((d[i] >> 4) << 8) | ((d[i + 1] >> 4) << 4) | (d[i + 2] >> 4);
      const e = counts.get(key) ?? [0, 0, 0, 0];
      e[0] += d[i]; e[1] += d[i + 1]; e[2] += d[i + 2]; e[3]++;
      counts.set(key, e);
    }
    const top = [...counts.values()].sort((a, b) => b[3] - a[3]).slice(0, 8).map(([r, g, b, n]) => hex(Math.round(r / n), Math.round(g / n), Math.round(b / n)));
    setPalette(top);
    setLoaded(true);
    setPicked(null);
  }
  function pick(e: React.MouseEvent<HTMLCanvasElement>) {
    const c = canvas.current!;
    const r = c.getBoundingClientRect();
    const x = Math.floor(((e.clientX - r.left) / r.width) * c.width), y = Math.floor(((e.clientY - r.top) / r.height) * c.height);
    const [R, G, B] = c.getContext("2d")!.getImageData(x, y, 1, 1).data;
    setPicked({ hex: hex(R, G, B), rgb: `rgb(${R}, ${G}, ${B})` });
  }
  return (
    <div className="space-y-4">
      <FileDrop accept="image/*" onFiles={load} label="Choose an image" hint="Then tap anywhere on it to pick a color. Nothing is uploaded." />
      <canvas ref={canvas} onClick={pick} className={`max-h-[480px] w-full cursor-crosshair rounded-[var(--radius)] border border-border object-contain ${loaded ? "" : "hidden"}`} aria-label="Your image. Click to pick a color." />
      {picked && (
        <div aria-live="polite" className="flex flex-wrap items-center gap-3 rounded-[var(--radius)] border border-border bg-surface p-3">
          <span className="h-10 w-10 rounded-lg border border-border" style={{ background: picked.hex }} aria-hidden="true" />
          <span className="font-mono">{picked.hex}</span>
          <CopyButton text={picked.hex} label="Copy HEX" />
          <span className="font-mono text-muted">{picked.rgb}</span>
          <CopyButton text={picked.rgb} label="Copy RGB" />
        </div>
      )}
      {palette.length > 0 && (
        <div>
          <p className="text-[15px] font-medium">Main colors in this image</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {palette.map((c) => (
              <li key={c}>
                <button type="button" onClick={() => navigator.clipboard?.writeText(c)} className="flex min-h-11 items-center gap-2 rounded-full border border-border py-1 pl-1 pr-3 hover:bg-surface" title="Copy">
                  <span className="h-8 w-8 rounded-full border border-border" style={{ background: c }} aria-hidden="true" />
                  <span className="font-mono text-sm">{c}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const MAP: Record<ImageExtraKind, () => React.ReactElement> = { base64: ToBase64, favicon: Favicon, colorpicker: ColorPicker };

export default function ImageExtras({ kind }: { kind: ImageExtraKind }) {
  const C = MAP[kind];
  return (
    <Panel>
      <C />
    </Panel>
  );
}
