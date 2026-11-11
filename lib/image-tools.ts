/**
 * Browser-only image helpers shared by the image tools. Uses the browser's own decoders
 * and <canvas>, so files never leave the device.
 */
export type OutFormat = "image/jpeg" | "image/png" | "image/webp";

export const FORMAT_LABEL: Record<OutFormat, string> = {
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "image/webp": "WebP",
};
export const FORMAT_EXT: Record<OutFormat, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/bmp,.jfif,.jpg,.jpeg,.png,.webp,.gif,.bmp";

export type ConvertOptions = {
  format: OutFormat;
  /** 0–1, used for JPG and WebP. */
  quality: number;
  /** Fill for transparent pixels when the output has no alpha (JPG). */
  background: string;
  /** Target size in pixels; omitted = original size. */
  width?: number;
  height?: number;
  /** Clockwise rotation in degrees. */
  rotate?: 0 | 90 | 180 | 270;
  flipH?: boolean;
  flipV?: boolean;
  grayscale?: boolean;
};

export type ConvertResult = {
  name: string;
  blob: Blob;
  url: string;
  width: number;
  height: number;
  originalSize: number;
};

async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ("createImageBitmap" in window) {
    try {
      return await createImageBitmap(file);
    } catch {
      /* fall back to <img>, which handles a few formats createImageBitmap rejects */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function readDimensions(file: File): Promise<{ width: number; height: number }> {
  const img = await decode(file);
  const size = { width: img.width, height: img.height };
  if ("close" in img) img.close();
  return size;
}

export function outputName(name: string, format: OutFormat): string {
  const base = name.replace(/\.[^.]+$/, "") || "image";
  return `${base}.${FORMAT_EXT[format]}`;
}

export async function convertImage(file: File, opts: ConvertOptions): Promise<ConvertResult> {
  const img = await decode(file);
  const drawW = Math.max(1, Math.round(opts.width ?? img.width));
  const drawH = Math.max(1, Math.round(opts.height ?? img.height));
  const rotate = opts.rotate ?? 0;
  const sideways = rotate === 90 || rotate === 270;
  const width = sideways ? drawH : drawW;
  const height = sideways ? drawW : drawH;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: !!opts.grayscale });
  if (!ctx) throw new Error("Your browser couldn't create an image canvas.");
  if (opts.format === "image/jpeg") {
    ctx.fillStyle = opts.background;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  // Rotate/flip around the centre, then draw the image centred.
  ctx.translate(width / 2, height / 2);
  ctx.rotate((rotate * Math.PI) / 180);
  ctx.scale(opts.flipH ? -1 : 1, opts.flipV ? -1 : 1);
  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if ("close" in img) img.close();

  if (opts.grayscale) {
    // Manual luminance pass (canvas `filter` isn't supported in every browser).
    const data = ctx.getImageData(0, 0, width, height);
    const px = data.data;
    for (let i = 0; i < px.length; i += 4) {
      const y = Math.round(0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]);
      px[i] = px[i + 1] = px[i + 2] = y;
    }
    ctx.putImageData(data, 0, 0);
  }

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, opts.format, opts.format === "image/png" ? undefined : opts.quality),
  );
  if (!blob) throw new Error("Your browser couldn't encode this format.");
  // Some browsers silently fall back to PNG for formats they can't encode (e.g. WebP on old Safari).
  if (blob.type && blob.type !== opts.format) {
    throw new Error(`Your browser can't save ${FORMAT_LABEL[opts.format]} files. Try another format or browser.`);
  }
  return { name: outputName(file.name, opts.format), blob, url: URL.createObjectURL(blob), width, height, originalSize: file.size };
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}
