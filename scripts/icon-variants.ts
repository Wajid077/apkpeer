/**
 * Builds the small icon sizes the site actually displays, next to each 512px icon.webp:
 *   icon-128.webp  cards, lists, search results (shown at 36–64px, 2x for retina)
 *   icon-192.webp  app page header (shown at 96px, 2x for retina)
 * The 512px original stays for OG images, schema and the image sitemap.
 *
 *   node scripts/icon-variants.ts           # all apps
 *   node scripts/icon-variants.ts <slug>    # one app
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const APPS = path.join(process.cwd(), "public", "apps");
const only = process.argv[2];
const SIZES = [128, 192];

const slugs = only ? [only] : fs.readdirSync(APPS).filter((d) => fs.existsSync(path.join(APPS, d, "icon.webp")));
for (const slug of slugs) {
  const src = path.join(APPS, slug, "icon.webp");
  if (!fs.existsSync(src)) {
    console.log(`${slug}: no icon.webp, skipped`);
    continue;
  }
  const out: string[] = [];
  for (const size of SIZES) {
    const dest = path.join(APPS, slug, `icon-${size}.webp`);
    const info = await sharp(src).resize(size, size, { fit: "inside", withoutEnlargement: true }).webp({ quality: 82, effort: 6 }).toFile(dest);
    out.push(`${size}px ${(info.size / 1024).toFixed(1)} KB`);
  }
  console.log(`${slug}: ${out.join(", ")}`);
}
