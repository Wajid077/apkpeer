# APKPeer launch checklist

Status as of 2026-11-03. Based on `APKPEER_BUILD_BRIEF.md` §12 (AdSense readiness) and §13 (launch).
✅ done and verified · ⏳ owner action needed · ⚠️ partly done (see note)

## 1. Before uploading

| | Item | Status |
|---|---|---|
| ✅ | 50 app pages built and passing the content validator (0 errors) | `npm run validate` |
| ✅ | No broken internal links, no orphan pages, one `<h1>` per page | `npm run check-links` (87 pages) |
| ⏳ | **3 real screenshots per app page** (brief §11 quality checklist) | 0 of 50 pages have them |
| ⏳ | Contact email in `lib/site.ts` → `contactEmail` (optional; the contact form already works) | |
| ⏳ | Social profile URLs in `lib/site.ts` → `sameAs` | |
| ⏳ | Verification and tracking IDs in a `.env.production` file, then rebuild: `NEXT_PUBLIC_GSC_VERIFICATION`, `NEXT_PUBLIC_BING_VERIFICATION`, `NEXT_PUBLIC_GA_ID` | |
| ✅ | `npm run build` (validates content, exports `/out`, checks links) | |

## 2. Upload (Hostinger hPanel)

1. Back up the current WordPress site (Files + database) from hPanel.
2. hPanel → File Manager → `public_html`: move the WordPress files out (to a backup folder), don't just delete them.
3. Zip the **contents** of `/out` (not the folder itself), upload to `public_html`, extract.
4. Check that `public_html/.htaccess` is the one from `/out`; it holds every redirect.

## 3. Right after upload

| | Item | How to check |
|---|---|---|
| ⏳ | Redirect map live: every old URL returns 301 to its new page | `curl -I https://apkpeer.com/brave-browser-2026/` (repeat for the 13 in `.htaccess`) |
| ⏳ | Removed mod pages return 410 | `curl -I https://apkpeer.com/happymod-apk-v3-4-1/` (8 URLs) |
| ⏳ | http → https and www → non-www redirect | `curl -I http://www.apkpeer.com/` |
| ⏳ | 404 page returns a real 404 status | `curl -I https://apkpeer.com/no-such-page` |
| ⏳ | Contact form delivers to your inbox | Send one test message from /contact |
| ⏳ | OG previews render | Paste an app URL into a link-preview checker or a chat app |
| ⏳ | Rich Results Test passes for an app, a game, breadcrumbs and FAQ | search.google.com/test/rich-results with `/app/brave-browser` and `/app/clash-of-clans` |

## 4. Search engines

| | Item |
|---|---|
| ⏳ | Verify the domain in Google Search Console (DNS) and import it into Bing Webmaster Tools |
| ⏳ | Submit `https://apkpeer.com/sitemap.xml` in both, and `feed.xml` as an extra sitemap in GSC |
| ⏳ | Run `npm run indexnow -- --all` once (after upload), then plain `npm run indexnow` after each later upload |
| ⏳ | GSC URL Inspection → Request indexing: homepage, `/category/apps`, `/category/games`, and the top 10 app pages |
| ✅ | robots.txt allows everything important (CSS, JS, images, `/_next/`) and points to the sitemap |
| ✅ | Sitemap `lastmod` uses real content dates, never the build time |

## 5. Old content clean-up

| | Item |
|---|---|
| ⏳ | Delete the modded APK files from the Backblaze `APKPeerapks` bucket (brief §10) |
| ⏳ | If any solidapks.com posts were used as references for these pages, make sure they aren't duplicates (brief §9) |

## 6. Performance and accessibility (verified locally)

Lighthouse 12, mobile, simulated slow 4G, against `npx serve out`. Performance 95–97, Accessibility 100, Best practices 100, SEO 100 on all six tested pages; full table in DECISIONS.md.

| | Item |
|---|---|
| ✅ | CLS 0 on all tested templates (ad slots reserve their height once enabled) |
| ✅ | Theme (light/dark) has no flash on load (inline script before paint) |
| ✅ | Text contrast meets WCAG AA in light and dark mode |
| ✅ | Tap targets ≥ 44px for buttons, nav and footer links |
| ⚠️ | Brief targets LCP < 2.0 s. Locally it's 2.3–2.6 s under Lighthouse's slow-4G simulation. Recheck on the live site, where Hostinger's caching and compression apply |
| ⚠️ | JS budget < 100 KB: app pages ship about 113 KB, of which 103 KB is the shared React/Next.js runtime |

## 7. AdSense (apply only when all of this is true)

| | Item |
|---|---|
| ✅ | 50 original, substantial pages; no mod/cheat/piracy content (validator-enforced) |
| ✅ | Old mod URLs return 410 or 301 to clean pages |
| ✅ | Trust pages live and in the footer: About, Contact (working form), Privacy (AdSense and cookie wording), Terms, Disclaimer, DMCA, Editorial policy |
| ⏳ | Site live and publishing steadily for a few weeks before applying |
| ⏳ | Set up Google's own consent message (Privacy & messaging) for EEA/UK/Switzerland in AdSense |
| ⏳ | After approval: set `NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-…`, rebuild, and add `public/ads.txt` with the line Google gives you |
| ✅ | Ad slots never sit next to download buttons and reserve space to avoid layout shift |
