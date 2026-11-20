import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { getCategory } from "./categories";

const CONTENT_DIR = path.join(process.cwd(), "content", "apps");
const PUBLIC_DIR = path.join(process.cwd(), "public");

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "lowercase-hyphen slug");
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD");
const sha256 = z.string().regex(/^[a-f0-9]{64}$/, "lowercase hex SHA-256");
const wordCount = (s: string) => s.trim().split(/\s+/).length;

const VersionSchema = z
  .object({
    version: z.string().min(1),
    versionCode: z.number().int().nullable(),
    size: z.string().nullable(),
    releaseDate: isoDate,
    sha256: sha256.nullable(),
    certSha256: sha256.nullable(),
    selfHosted: z.boolean(),
    /** Direct file URL for self-hosted builds, e.g. https://dl.apkpeer.com/brave-browser/1.98.60.apk */
    fileUrl: z.string().url().nullable().optional(),
    changelog: z.array(z.string().min(1)),
    /** Where the version + changelog were verified. */
    source: z.string().url().optional(),
  })
  .refine((v) => !v.selfHosted || (v.sha256 && v.certSha256 && v.fileUrl), {
    message: "selfHosted builds need sha256, certSha256 and fileUrl",
  });

export const AppSchema = z.object({
  slug,
  name: z.string().min(1),
  shortName: z.string().min(1),
  packageName: z.string().regex(/^[a-zA-Z][\w]*(\.[a-zA-Z_][\w]*)+$/),
  type: z.enum(["app", "game"]),
  category: slug.refine((c) => !!getCategory(c), "unknown category (add it to lib/categories.ts)"),
  developer: z.object({ name: z.string().min(1), slug, url: z.string().url() }),
  /** null for apps that aren't on Google Play (e.g. F-Droid); the main button then uses officialUrl. */
  playStoreUrl: z.string().url().nullable(),
  officialUrl: z.string().url(),
  price: z.string().min(1),
  // null = not verified yet; the template hides unverified rows instead of guessing.
  containsAds: z.boolean().nullable(),
  inAppPurchases: z.boolean().nullable(),
  minAndroid: z.string().nullable(),
  latest: VersionSchema,
  versions: z.array(VersionSchema),
  permissions: z.array(z.object({ name: z.string(), reason: z.string() })),
  screenshots: z.array(
    z.object({ src: z.string(), alt: z.string().min(10), width: z.number(), height: z.number() }),
  ),
  icon: z.string().startsWith("/"),
  summary: z
    .string()
    .refine((s) => wordCount(s) >= 40 && wordCount(s) <= 65, "quick answer should be 45–60 words"),
  metaDescription: z.string().min(120).max(160),
  primaryKeyword: z.string().min(1),
  secondaryKeywords: z.array(z.string()),
  alternatives: z.array(slug),
  faq: z.array(z.object({ q: z.string().min(5), a: z.string().min(20) })).min(1),
  published: isoDate,
  updated: isoDate,
  reviewedBy: z.string().min(1),
  sources: z.array(z.string().url()).min(1),
  oldUrls: z.array(z.string()),
});

export type App = z.infer<typeof AppSchema>;
export type AppVersion = z.infer<typeof VersionSchema>;

let cache: App[] | null = null;

/**
 * The icon file to show at a given display size. `icon.webp` (512px) has smaller
 * siblings made by scripts/icon-variants.ts; SVG and other formats are used as is.
 * Display size × 2 covers high-density screens: ≤64px → 128px file, larger → 192px file.
 */
export function iconSrc(icon: string, displaySize: number): string {
  if (!icon.endsWith("/icon.webp")) return icon;
  return icon.replace(/icon\.webp$/, displaySize <= 64 ? "icon-128.webp" : "icon-192.webp");
}

function loadApp(dir: string): App {
  const file = path.join(CONTENT_DIR, dir, "data.json");
  const raw = fs.readFileSync(file, "utf8");
  if (raw.includes("TBD_")) {
    throw new Error(`${file}: contains a TBD_ placeholder. Replace it with verified data before publishing.`);
  }
  const parsed = AppSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`${file} failed validation:\n${issues}`);
  }
  if (parsed.data.slug !== dir) throw new Error(`${file}: slug "${parsed.data.slug}" must match folder "${dir}"`);
  if (!fs.existsSync(path.join(PUBLIC_DIR, parsed.data.icon))) {
    throw new Error(`${file}: icon ${parsed.data.icon} not found in /public`);
  }
  for (const size of [128, 192]) {
    const variant = iconSrc(parsed.data.icon, size);
    if (variant !== parsed.data.icon && !fs.existsSync(path.join(PUBLIC_DIR, variant))) {
      throw new Error(`${file}: ${variant} missing. Run: node scripts/icon-variants.ts ${parsed.data.slug}`);
    }
  }
  return parsed.data;
}

export function getAllApps(): App[] {
  if (cache) return cache;
  const dirs = fs.existsSync(CONTENT_DIR)
    ? fs.readdirSync(CONTENT_DIR, { withFileTypes: true }).filter((d) => d.isDirectory())
    : [];
  cache = dirs.map((d) => loadApp(d.name)).sort((a, b) => b.updated.localeCompare(a.updated));
  return cache;
}

export function getApp(slug: string): App | undefined {
  return getAllApps().find((a) => a.slug === slug);
}

export function appExists(slug: string): boolean {
  return getAllApps().some((a) => a.slug === slug);
}

export function getAppBody(slug: string): string {
  return fs.readFileSync(path.join(CONTENT_DIR, slug, "body.mdx"), "utf8");
}

/** Same category first, then same type, newest first. */
export function getRelatedApps(app: App, limit = 6): App[] {
  const others = getAllApps().filter((a) => a.slug !== app.slug);
  const sameCat = others.filter((a) => a.category === app.category);
  const sameType = others.filter((a) => a.category !== app.category && a.type === app.type);
  return [...sameCat, ...sameType].slice(0, limit);
}

/** Developer pages only exist when a developer has 2+ apps (brief §5.7). */
export function developerHasPage(devSlug: string): boolean {
  return getAllApps().filter((a) => a.developer.slug === devSlug).length >= 2;
}

/** Version archive only exists with 3+ versions that have changelogs (brief §5.7). */
export function hasVersionArchive(app: App): boolean {
  const all = [app.latest, ...app.versions];
  return all.filter((v) => v.changelog.length > 0).length >= 3;
}

/**
 * Play shows "Varies with device" for some apps. Templates leave the version out of
 * titles, headings and schema when it isn't an actual number.
 */
export function hasVersionNumber(app: App): boolean {
  return /\d/.test(app.latest.version);
}

/** Where the main download button goes, and how it's labelled. */
export function primaryDownload(app: App): { href: string; label: string } {
  if (app.playStoreUrl) return { href: app.playStoreUrl, label: "Download from Google Play" };
  return { href: app.officialUrl, label: `Download from ${new URL(app.officialUrl).hostname.replace(/^www\./, "")}` };
}

/** "Verified original" requires a self-hosted file with both hashes recorded. */
export function isVerified(app: App): boolean {
  return app.latest.selfHosted && !!app.latest.sha256 && !!app.latest.certSha256;
}
