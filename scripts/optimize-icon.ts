/**
 * Converts an app icon to the format the site serves: square WebP, max 512px (brief §2).
 *
 *   node scripts/optimize-icon.ts <slug> <source-file>
 *
 * Writes public/apps/<slug>/icon.webp and prints the size. Point data.json "icon" at it.
 * Source files can be PNG, JPEG, WebP or SVG. Smaller sources are kept at their own size, never upscaled.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const [slug, src] = process.argv.slice(2);
if (!slug || !src) {
  console.error("usage: node scripts/optimize-icon.ts <slug> <source-file>");
  process.exit(1);
}

const outDir = path.join(process.cwd(), "public", "apps", slug);
fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, "icon.webp");

const info = await sharp(src)
  .resize(512, 512, { fit: "inside", withoutEnlargement: true })
  .webp({ quality: 86, effort: 6 })
  .toFile(out);

console.log(`${slug}: ${info.width}x${info.height}, ${(info.size / 1024).toFixed(1)} KB → ${path.relative(process.cwd(), out)}`);

// Display-size variants (cards, header) — see scripts/icon-variants.ts.
for (const size of [128, 192]) {
  await sharp(out).resize(size, size, { fit: "inside", withoutEnlargement: true }).webp({ quality: 82, effort: 6 }).toFile(path.join(outDir, `icon-${size}.webp`));
}
