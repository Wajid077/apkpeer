/**
 * Content validator (brief §4, §11). Runs before every build (`prebuild`).
 * Schema validation itself happens in lib/content.ts during the build; this script
 * checks the writing rules a schema can't: banned phrases, mod/cheat language,
 * stray H1s, placeholders, internal links, length.
 *
 *   node scripts/validate-content.ts          # errors fail, warnings print
 *   node scripts/validate-content.ts --strict # warnings fail too (use before publishing a batch)
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const APPS_DIR = path.join(ROOT, "content", "apps");
const strict = process.argv.includes("--strict");

const BANNED = [
  "in today's digital world", "in today's fast-paced world", "seamless", "seamlessly", "game-changer",
  "dive into", "delve", "unleash", "elevate", "look no further", "in conclusion", "it's worth noting",
  "plethora", "robust", "cutting-edge", "revolutionize", "revolutionise", "embark", "navigate the world of",
  "a testament to", "boasts",
];
// "whether you're a … or a …"
const BANNED_RE = [/whether you['’]re an? [^.]{1,40}? or an? /i];

// Hard fail: these never belong on the site, in any context.
const FORBIDDEN = [
  /premium unlocked/i, /unlimited (money|coins|gems|diamonds)/i, /\bcracked\b/i, /free in-app purchases/i,
  /\bmod menu/i, /\bvip panel/i, /\binjector\b/i, /\bgb ?whatsapp\b/i, /\binsta ?pro\b/i,
  // Owner rule (2026-11-25): no gambling or "mod" wording anywhere in page text.
  /\bcasinos?\b/i, /\bmods?\b/i,
];
// Warn: allowed only inside a safety section explaining that mod builds are risky.
const CAUTION = [/\bmod(ded)? (apk|version|build)s?\b/i, /\bhack(s|ed)?\b/i, /\bcheats?\b/i];

type Issue = { level: "error" | "warn"; msg: string };

const plain = (s: string) => s.replace(/[’]/g, "'");
const words = (s: string) => s.replace(/```[\s\S]*?```/g, "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;

function sectionOf(lines: string[], idx: number): string {
  for (let i = idx; i >= 0; i--) {
    const m = /^##\s+(.+)/.exec(lines[i]);
    if (m) return m[1];
  }
  return "";
}

function checkApp(slug: string, published: Set<string>): Issue[] {
  const issues: Issue[] = [];
  const dir = path.join(APPS_DIR, slug);
  const jsonRaw = fs.readFileSync(path.join(dir, "data.json"), "utf8");
  const bodyPath = path.join(dir, "body.mdx");
  if (!fs.existsSync(bodyPath)) return [{ level: "error", msg: "body.mdx is missing" }];
  const body = fs.readFileSync(bodyPath, "utf8");
  const data = JSON.parse(jsonRaw);

  // Placeholders
  for (const [name, text] of [["data.json", jsonRaw], ["body.mdx", body]] as const) {
    if (/TBD_/.test(text)) issues.push({ level: "error", msg: `${name} contains a TBD_ placeholder` });
    if (/lorem ipsum|\bTODO\b|\bFIXME\b/i.test(text)) issues.push({ level: "error", msg: `${name} contains placeholder text` });
  }

  // Banned phrases: body + the reader-facing JSON fields.
  const reader = plain([body, data.summary, data.metaDescription, ...(data.faq ?? []).flatMap((f: { q: string; a: string }) => [f.q, f.a])].join("\n"));
  for (const p of BANNED) {
    const re = new RegExp(`\\b${p.replace(/[-]/g, "[- ]")}\\b`, "i");
    if (re.test(reader)) issues.push({ level: "error", msg: `banned phrase "${p}"` });
  }
  for (const re of BANNED_RE) if (re.test(reader)) issues.push({ level: "error", msg: `banned pattern ${re}` });

  // Mod / cheat language
  for (const re of FORBIDDEN) if (re.test(reader)) issues.push({ level: "error", msg: `forbidden term ${re}` });
  const lines = body.split(/\r?\n/);
  lines.forEach((line, i) => {
    for (const re of CAUTION) {
      if (!re.test(line)) continue;
      const section = sectionOf(lines, i);
      if (!/safe/i.test(section)) issues.push({ level: "error", msg: `line ${i + 1}: ${re} outside the safety section ("${section || "intro"}")` });
    }
  });

  // Structure
  let inFence = false;
  lines.forEach((line, i) => {
    if (line.startsWith("```")) inFence = !inFence;
    if (!inFence && /^#\s/.test(line)) issues.push({ level: "error", msg: `line ${i + 1}: H1 in body (the template adds the only H1)` });
  });
  const h2s = lines.filter((l) => /^##\s/.test(l)).map((l) => l.slice(3).trim());
  for (const want of [/^What is /, /^What's new/, /^Key features/, /^How to install /, /^Is .+ safe\?/]) {
    if (!h2s.some((h) => want.test(h))) issues.push({ level: "warn", msg: `missing H2 matching ${want}` });
  }

  // Length (brief §11: 900–1,400 words)
  const wc = words(body);
  if (wc < 900) issues.push({ level: "warn", msg: `body is ${wc} words (target 900–1,400)` });
  if (wc > 1600) issues.push({ level: "warn", msg: `body is ${wc} words (target 900–1,400)` });

  // Internal links: markdown /app|/category|/developer links + <AppLink slug>
  const mdLinks = [...body.matchAll(/\]\((\/[^)\s#]*)/g)].map((m) => m[1]);
  const appLinks = [...body.matchAll(/<AppLink\s+slug="([^"]+)"/g)].map((m) => m[1]);
  for (const href of mdLinks) {
    const m = /^\/app\/([^/]+)$/.exec(href);
    if (m && !published.has(m[1])) issues.push({ level: "error", msg: `link ${href} points to an unpublished app (use <AppLink slug="${m[1]}">)` });
  }
  const liveInternal = mdLinks.length + appLinks.filter((s) => published.has(s)).length;
  if (mdLinks.length + appLinks.length < 3) issues.push({ level: "warn", msg: `only ${mdLinks.length + appLinks.length} internal links in body (need 3+)` });
  else if (liveInternal < 3) issues.push({ level: "warn", msg: `only ${liveInternal} internal links resolve today; the rest become links when those apps publish` });

  // Data rules
  if (/placeholder/i.test(String(data.icon))) issues.push({ level: "warn", msg: `placeholder icon (${data.icon}): replace with the official icon before publishing` });
  if ((data.faq ?? []).length < 4) issues.push({ level: "warn", msg: `${data.faq?.length ?? 0} FAQs (target 4–6)` });
  if ((data.screenshots ?? []).length < 3) issues.push({ level: "warn", msg: `${data.screenshots?.length ?? 0} screenshots (need 3 before publishing)` });
  for (const s of data.screenshots ?? []) {
    if (/screenshot[-_ ]?\d|IMG_|\d{8}/i.test(path.basename(s.src))) issues.push({ level: "error", msg: `screenshot filename "${s.src}" is not descriptive` });
    if (!fs.existsSync(path.join(ROOT, "public", s.src))) issues.push({ level: "error", msg: `screenshot ${s.src} not found in /public` });
  }
  for (const k of ["minAndroid", "containsAds", "inAppPurchases"] as const) {
    if (data[k] === null) issues.push({ level: "warn", msg: `${k} not verified yet (row hidden)` });
  }
  if (data.latest?.size === null) issues.push({ level: "warn", msg: "latest.size not verified yet (row hidden)" });
  const desc: string = data.metaDescription ?? "";
  if (desc.length < 140 || desc.length > 155) issues.push({ level: "warn", msg: `metaDescription is ${desc.length} chars (target 140–155)` });
  // Compare without punctuation: "Score! Hero APK" satisfies "score hero apk".
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  if (!norm(reader).includes(norm(String(data.primaryKeyword)))) {
    issues.push({ level: "warn", msg: `primary keyword "${data.primaryKeyword}" not found in the text` });
  }
  return issues;
}

const slugs = fs.existsSync(APPS_DIR)
  ? fs.readdirSync(APPS_DIR, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()
  : [];
const published = new Set(slugs);

let errors = 0;
let warnings = 0;

// Site-level settings the trust pages depend on (AdSense requires a real contact address).
const siteTs = fs.readFileSync(path.join(ROOT, "lib", "site.ts"), "utf8");
if (/contactEmail:\s*null/.test(siteTs) && /contactFormKey:\s*null/.test(siteTs)) {
  console.log("\nsite\n  ⚠ neither SITE.contactEmail nor SITE.contactFormKey is set in lib/site.ts (no way to contact the site)");
  warnings++;
}
// Free tools: metadata in lib/tools.ts (no imports, so Node can load it directly) + article in content/tools.
{
  const { TOOLS } = (await import(new URL("../lib/tools.ts", import.meta.url).href)) as {
    TOOLS: { slug: string; title: string; description: string; summary: string; faq: { q: string; a: string }[]; related: string[] }[];
  };
  const slugs = new Set(TOOLS.map((t) => t.slug));
  for (const t of TOOLS) {
    const issues: Issue[] = [];
    const mdxPath = path.join(ROOT, "content", "tools", `${t.slug}.mdx`);
    if (!fs.existsSync(mdxPath)) issues.push({ level: "error", msg: "content/tools article missing" });
    const body = fs.existsSync(mdxPath) ? fs.readFileSync(mdxPath, "utf8") : "";
    const reader = plain([body, t.summary, t.description, ...t.faq.flatMap((f) => [f.q, f.a])].join("\n"));
    for (const p of BANNED) if (new RegExp(`\\b${p.replace(/[-]/g, "[- ]")}\\b`, "i").test(reader)) issues.push({ level: "error", msg: `banned phrase "${p}"` });
    for (const re of [...BANNED_RE, ...FORBIDDEN]) if (re.test(reader)) issues.push({ level: "error", msg: `forbidden term ${re}` });
    if (/^#\s/m.test(body)) issues.push({ level: "error", msg: "H1 in article (the template adds the only H1)" });
    const wc = words(body);
    if (wc < 250) issues.push({ level: "warn", msg: `article is ${wc} words (aim for 250+ so the page isn't thin)` });
    if (t.title.length > 60) issues.push({ level: "warn", msg: `title is ${t.title.length} chars (≤ 60)` });
    if (t.description.length < 140 || t.description.length > 155) issues.push({ level: "warn", msg: `description is ${t.description.length} chars (140–155)` });
    const sw = words(t.summary);
    if (sw < 40 || sw > 65) issues.push({ level: "error", msg: `summary is ${sw} words (40–65)` });
    if (t.faq.length < 3) issues.push({ level: "warn", msg: `${t.faq.length} FAQs (3+)` });
    for (const r of t.related) if (!slugs.has(r)) issues.push({ level: "error", msg: `related tool "${r}" doesn't exist` });
    if (issues.length) {
      console.log(`\ntools/${t.slug}`);
      for (const i of issues) {
        console.log(`  ${i.level === "error" ? "✖" : "⚠"} ${i.msg}`);
        if (i.level === "error") errors++;
        else warnings++;
      }
    }
  }
}

// Category and hub intros are reader-facing too.
for (const lib of ["categories.ts", "taxonomy.ts"]) {
  const src = plain(fs.readFileSync(path.join(ROOT, "lib", lib), "utf8"));
  const hits = [...FORBIDDEN, ...BANNED.map((p) => new RegExp(`\\b${p.replace(/[-]/g, "[- ]")}\\b`, "i"))].filter((re) => re.test(src));
  for (const re of hits) {
    console.log(`\nlib/${lib}\n  ✖ banned or forbidden term ${re}`);
    errors++;
  }
}
for (const f of fs.readdirSync(path.join(ROOT, "content", "pages"))) {
  const t = fs.readFileSync(path.join(ROOT, "content", "pages", f), "utf8");
  if (/^#\s/m.test(t)) {
    console.log(`\npages/${f}\n  ✖ H1 in body (the template adds the only H1)`);
    errors++;
  }
}
for (const slug of slugs) {
  const issues = checkApp(slug, published);
  if (!issues.length) continue;
  console.log(`\n${slug}`);
  for (const i of issues) {
    console.log(`  ${i.level === "error" ? "✖" : "⚠"} ${i.msg}`);
    if (i.level === "error") errors++;
    else warnings++;
  }
}
console.log(`\nvalidate-content: ${slugs.length} apps, ${errors} errors, ${warnings} warnings${strict ? " (strict)" : ""}`);
if (errors > 0 || (strict && warnings > 0)) process.exit(1);
