/**
 * Link checker for the static export (brief §5.6). Runs after every build (`postbuild`).
 * - every internal href in /out must resolve to an exported page or file
 * - every indexable page must have at least one internal inlink (no orphans)
 * - every page has exactly one <h1>
 */
import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "out");
if (!fs.existsSync(OUT)) {
  console.error("check-links: /out not found. Run `next build` first.");
  process.exit(1);
}

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? walk(p) : [p];
  });
}

const files = walk(OUT);
const rel = (f: string) => "/" + path.relative(OUT, f).split(path.sep).join("/");
const htmlFiles = files.filter((f) => f.endsWith(".html") && !rel(f).startsWith("/_next/"));

// Map exported files to the clean URLs .htaccess serves.
const pageUrl = (f: string) => {
  const r = rel(f).replace(/\.html$/, "");
  if (r === "/index") return "/";
  return r.replace(/\/index$/, "");
};
const pages = new Map(htmlFiles.map((f) => [pageUrl(f), f]));
const assets = new Set(files.map(rel));
const SKIP = new Set(["/404", "/_not-found"]);

const resolves = (url: string) => pages.has(url) || assets.has(url);

const inlinks = new Map<string, number>();
const broken: string[] = [];
const h1Problems: string[] = [];

for (const [url, file] of pages) {
  const html = fs.readFileSync(file, "utf8");
  if (SKIP.has(url)) continue;

  const h1s = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1s !== 1) h1Problems.push(`${url}: ${h1s} <h1> elements`);

  const seen = new Set<string>();
  for (const m of html.matchAll(/<a\s[^>]*href="([^"]+)"/g)) {
    let href = m[1].replace(/&amp;/g, "&");
    if (!href.startsWith("/") || href.startsWith("//")) continue;
    href = href.split("#")[0].split("?")[0] || "/";
    if (href.length > 1) href = href.replace(/\/$/, "");
    if (!resolves(href)) broken.push(`${url} → ${href}`);
    if (href !== url && !seen.has(href)) {
      seen.add(href);
      inlinks.set(href, (inlinks.get(href) ?? 0) + 1);
    }
  }
}

const orphans = [...pages.entries()]
  .filter(([url, file]) => url !== "/" && !SKIP.has(url) && !/<meta name="robots" content="noindex/.test(fs.readFileSync(file, "utf8")))
  .filter(([url]) => !inlinks.get(url))
  .map(([url]) => url);

const report = (title: string, list: string[]) => {
  const unique = [...new Set(list)].sort();
  if (!unique.length) return;
  console.log(`\n${title} (${unique.length})`);
  for (const l of unique) console.log(`  ✖ ${l}`);
};
report("Broken internal links", broken);
report("Orphan pages (no internal inlinks)", orphans);
report("Pages without exactly one <h1>", h1Problems);

const failed = broken.length + orphans.length + h1Problems.length;
console.log(`\ncheck-links: ${pages.size} pages, ${new Set(broken).size} broken links, ${orphans.length} orphans, ${h1Problems.length} h1 problems`);
if (failed) process.exit(1);
