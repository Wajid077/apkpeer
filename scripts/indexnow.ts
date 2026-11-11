/**
 * IndexNow ping (brief §8.3). Run AFTER the new /out has been uploaded to Hostinger,
 * because search engines fetch the URLs (and the key file) straight away.
 *
 *   npm run indexnow             # submit URLs whose lastmod changed since the last ping
 *   npm run indexnow -- --all    # submit every URL in the sitemaps (launch day)
 *   npm run indexnow -- --dry    # show what would be sent
 *
 * State lives in .indexnow-state.json (url → lastmod last submitted).
 * One POST to api.indexnow.org reaches Bing, Yandex, Seznam, Naver and the other members.
 * Never use the Google Indexing API for this site (brief §8.4).
 */
import fs from "node:fs";
import path from "node:path";

const HOST = "apkpeer.com";
const KEY = "ec02420d83261dfc99a082f9aeff71a6";
const OUT = path.join(process.cwd(), "out");
const STATE = path.join(process.cwd(), ".indexnow-state.json");

const all = process.argv.includes("--all");
const dry = process.argv.includes("--dry");

if (!fs.existsSync(path.join(OUT, "sitemap.xml"))) {
  console.error("indexnow: out/sitemap.xml not found. Run `npm run build` first.");
  process.exit(1);
}
if (!fs.existsSync(path.join(OUT, `${KEY}.txt`))) {
  console.error(`indexnow: key file ${KEY}.txt missing from /out.`);
  process.exit(1);
}

const read = (f: string) => fs.readFileSync(path.join(OUT, f), "utf8");
const children = [...read("sitemap.xml").matchAll(/<loc>https:\/\/[^/]+\/([^<]+)<\/loc>/g)].map((m) => m[1]);

const current = new Map<string, string>();
for (const file of children) {
  for (const m of read(file).matchAll(/<url><loc>([^<]+)<\/loc>(?:<lastmod>([^<]+)<\/lastmod>)?/g)) {
    current.set(m[1].replace(/&amp;/g, "&"), m[2] ?? "");
  }
}

const previous: Record<string, string> = fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, "utf8")) : {};
const changed = [...current].filter(([url, lastmod]) => all || previous[url] !== lastmod).map(([url]) => url);

if (!changed.length) {
  console.log("indexnow: nothing changed since the last ping.");
  process.exit(0);
}

console.log(`indexnow: ${changed.length} URL(s)${dry ? " (dry run)" : ""}`);
for (const u of changed) console.log(`  ${u}`);
if (dry) process.exit(0);

// The API accepts up to 10,000 URLs per request.
for (let i = 0; i < changed.length; i += 10000) {
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: changed.slice(i, i + 10000) }),
  });
  // 200 = accepted, 202 = accepted, key validation pending.
  if (res.status !== 200 && res.status !== 202) {
    console.error(`indexnow: HTTP ${res.status} ${await res.text()}`);
    process.exit(1);
  }
  console.log(`indexnow: HTTP ${res.status}`);
}

fs.writeFileSync(STATE, JSON.stringify(Object.fromEntries(current), null, 2) + "\n");
console.log("indexnow: state saved.");
