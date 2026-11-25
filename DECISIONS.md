# DECISIONS

Judgement calls and deviations from `APKPEER_BUILD_BRIEF.md`, newest at the bottom of each section.

## Hosting and architecture

- **Hostinger hPanel instead of Vercel/Cloudflare (2026-11-03).** The owner uploads the site through hPanel, so the site is a Next.js **static export** (`output: "export"` → `/out`). What that changes:
  - **No ISR.** `revalidate: 86400` can't run on static hosting. Updating a version means editing `data.json`, rebuilding and re-uploading `/out`. It's a few minutes of work and keeps the server as simple as it gets.
  - **No middleware and no `next.config` `redirects()`** (neither runs on static hosting). All 301s, 410s, https/non-www, trailing-slash stripping and clean URLs live in `public/.htaccess`, which Next copies into `/out`. LiteSpeed on Hostinger reads it.
  - **`images.unoptimized: true`.** The Next image optimizer needs a server. Icons and screenshots must be added already converted to WebP/AVIF at the right size, using the brief's limits (512px icons, 1080px max screenshots).
  - Hostinger's Node.js hosting (Business/Cloud plans) could run full Next.js with ISR. We can switch later without changing the content model.
- **Deploy:** `npm run build` → zip the contents of `/out` → hPanel → File Manager → `public_html` → upload and extract. Delete the old WordPress files first, but keep a backup.

## SEO infrastructure (step 2)

- **Sitemaps, RSS and `llms.txt` are `force-static` route handlers**, so they export as plain files. The index only lists child sitemaps that have URLs (`sitemap-games.xml` and `sitemap-guides.xml` appear once a game or guide exists). Every `lastmod` comes from content `updated` dates. Static pages take theirs from `lib/pages.ts`, so **bump that date by hand when you edit a trust page**.
- **OG images** are built at export time by `app/og/[file]/route.tsx` → `/og/{slug}.png` (1200×630). Satori can't read WebP/AVIF, so an app whose icon is WebP gets a letter tile on its card. Keep an SVG or PNG icon if you want the real icon on the card.
- **IndexNow key** is `ec02420d83261dfc99a082f9aeff71a6` (key file in `/public`). Run `npm run indexnow` **after** uploading `/out`, because engines fetch the URLs straight away. Use `--all` on launch day. Already-submitted URLs are tracked in `.indexnow-state.json`, so keep that file.
- **Build gates:** `prebuild` runs `scripts/validate-content.ts`, which errors on banned phrases, forbidden mod terms, H1s in the body, placeholders and links to unpublished apps. Missing screenshots and unverified fields are warnings, and `npm run validate:strict` turns them into errors before a batch goes live. `postbuild` runs `scripts/check-links.ts` over `/out` and fails on broken internal links, orphan pages, or pages without exactly one `<h1>`.
- **Mod/cheat wording** ("mod APK", "hack", "cheat") is allowed only under an H2 containing "safe". This matches the brief's rule that the safety section may warn about mod builds.
- **Analytics:** GA4 loads `lazyOnload` only when `NEXT_PUBLIC_GA_ID` is set. Consent Mode v2 defaults ad storage to denied until the Google CMP updates it.
- **Lighthouse CI** isn't wired up because there's no CI pipeline yet (manual hPanel uploads). Run Lighthouse locally against `npm start` during the step-5 performance pass.

## Pages (step 3)

- **Site operator is "APKPeer Dev Team"** (`SITE.operator`). **Contact runs through a Web3Forms form** on `/contact` (`SITE.contactFormKey`; Web3Forms keys are public by design, they can only deliver to the owner's inbox). Trust pages say "contact us through the contact form" via `<Reach />`; once `SITE.contactEmail` is set, "or by email at …" is added automatically. The privacy policy names Web3Forms as a processor. Social profiles go in `SITE.sameAs` when they exist.
- **Trust pages** are MDX in `content/pages/`, rendered by `app/[page]/page.tsx`. `<Email />` and `<Operator />` pull from `lib/site.ts`. Commitments written on the owner's behalf, which they can change: replies within **five working days** (contact, DMCA), data requests within **30 days**. The editorial policy says drafts may use AI writing tools and that every fact is human-checked.
- **Terms have no governing-law clause** because no country was given. Add one if needed.
- **Privacy policy describes AdSense as active** (AdSense review expects that). It also covers GA4, the Google CMP for EEA/UK/CH, the DoubleClick cookie, and the required Google links.
- **Empty dynamic routes:** static export refuses a dynamic route with zero params. Routes that can be empty (category page 2+, developer, versions, download) emit a `__none__` placeholder that renders 404, and `scripts/prune-export.ts` deletes it from `/out` after the build.
- **Thin-page guard:** an archive page is `noindex,follow` and kept out of the sitemap when intro words + 12 × apps on the page < 250. With a ~125-word intro, a category becomes indexable at about 11 apps. Developer pages use a short generated line unless an intro is added in `lib/developers.ts`, so most stay noindex until one is written.
- **Category intros are required:** the build fails if a category with a published app has no `intro` in `lib/categories.ts`. Write each one when its first app ships in step 4. Optional `label` sets the plural heading ("Web browsers").
- **Header nav shows only hubs that have apps.** "Games" appears with the first game. "Guides" is left out until `/guides` exists in phase 2, so the header never has a dead link.
- **"Popular" on the homepage is an editorial list** (`lib/featured.ts`), not a ranking. There's no download data. A popular block is hidden when every app in it is already in Latest updates.
- **Self-hosted files** need `latest.fileUrl` (e.g. on `dl.apkpeer.com`) along with both hashes, or the schema rejects `selfHosted: true`.
- **JS budget:** app pages ship ~112 kB first-load JS (gzipped), of which 103 kB is the shared React/Next runtime. That's slightly over the brief's 100 kB. Revisit in the step-5 performance pass.

## Content model

- Added `summary` (quick answer, 40–65 words enforced) and `metaDescription` (120–160 chars) to `data.json`. The master prompt produces both, and keeping them in data keeps the template free of hardcoded text.
- `minAndroid`, `containsAds`, `inAppPurchases` and `latest.size` are **nullable**. `null` means "not verified yet": the info table hides the row and the schema omits the property. This follows the "leave it out, never guess" rule.
- The loader fails the build on any `TBD_` string, an invalid field, an unknown category, a slug/folder mismatch or a missing icon file.

## Template

- **TOC and FAQ use native `<details>`**, not client components. They stay collapsible with zero JS, which leaves the theme toggle as the only client component so far.
- **Developer link:** developer pages exist only when a developer has 2+ apps (§5.7). Until then the app header links the developer name to the developer's official site, and switches to `/developer/{slug}` automatically once a second app ships.
- **Alternative links** in MDX use `<AppLink slug="…">`, which renders plain text until that app page exists. This prevents broken internal links during the batched rollout and turns them into links automatically when the target is published.
- **AdSlot renders nothing** until `NEXT_PUBLIC_ADSENSE_CLIENT` is set. Empty reserved boxes during the AdSense review look like a broken page. Once ads are on, it reserves 280px (in-content) or 250px (sidebar).
- **"Download APK" button and "Verified original" badge** only appear when `latest.selfHosted` is true *and* both `sha256` and `certSha256` are recorded.

## Brave (sample page)

- The Play Store listing returned no readable content to the fetcher. **Min Android, size, ads and in-app purchases are unverified** and hidden until someone checks them manually on Play Store.
- Version 1.98.60 (2026-10-27) and the changelog come from https://brave.com/latest/. GitHub tags 1.98.63/1.98.64 are later desktop builds. brave.com lists 1.98.60 as the newest Android release.
- Icon: Brave lion SVG (Wikimedia Commons copy of the official mark). **No screenshots yet.** The quality checklist needs 3 real screenshots before publishing.
- The FAQ questions are common real queries but haven't been checked against a live "People also ask" export. Confirm them with GSC/PAA data before launch.

## App pages (step 4)

### Batch 1 (2026-11-03)

- **Batch order follows the redirect map, not the brief's table order.** The 13 old WordPress URLs 301 to specific app pages, and a redirect to a missing page loses that URL's ranking. Batch 1 = Brave + F-Droid, Turbo VPN, iQIYI, invideo, WhatsApp, Roblox, DLS 26, Stumble Guys, Temple Run 2. **Batch 2 must start with car-parking-multiplayer, score-hero and minecraft-trial**, the last three redirect targets.
- **Facts come from the Play listing rendered in a browser.** Plain fetches of play.google.com return an empty shell, so version, update date, Android requirement, ads and IAP were read from the rendered listing's "About this app" panel on 2026-11-03. Play's website no longer shows download size, so `latest.size` stays null (hidden) unless a developer publishes it.
- **Brave updated to 1.98.63** (Play, Oct 31). 1.98.60 moved to `versions`. The Play listing also gave the missing facts: Android 10+, contains ads (Brave Rewards' opt-in ads) and in-app purchases. Its `name` now matches Play exactly: "Brave Private Web Browser, VPN".
- **F-Droid isn't on Google Play**, so `playStoreUrl` is now nullable and the main button becomes "Download from f-droid.org". Its listed version is the **stable 1.23.2** that f-droid.org marks "suggested", not the 2.0.x betas. Ads and IAP are recorded as `false` because the f-droid.org listing shows no Anti-Features.
- **Roblox shows "Varies with device"** on Play. Templates now leave a non-numeric version out of the title, H1, cards, feed, OG card and `softwareVersion`, and the info table shows it verbatim.
- **WhatsApp version 2.26.32.84 and Android 6.0+ come from whatsapp.com/android.** Play shows "Varies with device". `releaseDate` is the Play "Updated on" date (2026-10-31), and the page says so. `containsAds` is null because Play doesn't flag ads, but Meta announced Updates-tab ads in June 2025. The FAQ explains this.
- **Turbo VPN safety section** cites the 2025 Tech Transparency Project findings (via Malwarebytes coverage and TTP's follow-up) linking Innovative Connecting to Qihoo 360, and states that the developer disputes them.
- **New categories:** `adventure` (Roblox) and `arcade` (Temple Run 2), matching their Play categories. Intros were written for vpn, communication, video-editors, entertainment, tools, action, sports, adventure and arcade.
- **Icons:** the owner approved downloading official icons (2026-11-03). Play icons are taken from the listing's `og:image` at `=s512`, F-Droid's from f-droid.org, and all of them are converted to WebP with `npm run optimize-icon -- <slug> <file>` (≤512px, 3–70 KB). The OG generator turns WebP into PNG via `sharp`, now a direct dependency. Store icons are full-bleed, so `AppIcon` pads only SVG logos.
- **Still open for every page:** 3 real screenshots each, and `latest.size`.

### Batch 2 (2026-11-03)

- **Pages:** Car Parking Multiplayer, Score! Hero and Minecraft Trial (the last three redirect targets), plus Proton VPN, WhatsApp Business, CapCut, InShot, Among Us, Subway Surfers and eFootball. The last seven were picked because batch-1 pages already name them as alternatives, so those `<AppLink>`s now resolve.
- **Score! Hero's Play package changed.** `com.firsttouchgames.score` returns "Not Found", and the live game is `com.firsttouchgames.story` (version 4.730, First Touch Games, released Nov 2015). The redirect target `/app/score-hero` still points to the right game.
- **Telegram deferred, eFootball swapped in.** telegram.org is unreachable from this network (fetch, curl and Chrome all fail). The Play listing shows "Varies with device" for both version and Android requirement and has no "What's new". A Telegram page now would have almost no verified facts. Pick it up when someone can open telegram.org/android.
- **Minecraft Trial:** `inAppPurchases` is null. Play doesn't show an IAP label for the trial, but its content rating lists in-game purchases (which covers the full game). The page says the trial is time-limited and survival-only and that worlds don't transfer, all quoted from Play. It doesn't give a specific time limit because Play doesn't state one.
- **WhatsApp Business `containsAds` is null**, the same reasoning as WhatsApp (Updates-tab ads).
- **New category:** `simulation` (Car Parking Multiplayer), with its intro.
- **Developer pages are live** for First Touch Games (DLS 26, Score! Hero) and WhatsApp LLC (WhatsApp, WhatsApp Business). Both are noindex under the thin-page guard until an intro is added to `lib/developers.ts`.
- **The validator's keyword check ignores punctuation**, so "Score! Hero APK" matches "score hero apk".

### Batch 3 (2026-11-03)

- **Pages:** ChatGPT, Canva, VLC for Android, Instagram, Snapchat, TikTok, Geometry Dash Lite, Free Fire, PUBG Mobile, Clash of Clans. All 10 were already named as alternatives on earlier pages.
- **Instagram and TikTok show "Varies with device"** for both version and Android requirement on Play, and Instagram has no "What's new". Neither publishes an APK or a minimum Android version on an official page. The only figures found were on third-party APK mirrors, which the brief doesn't accept as a source. Their pages give the Play update date and leave version and Android rows out. (Telegram could now get a page on the same basis. It was deferred in batch 2 mainly because telegram.org is unreachable here.)
- **VLC version data comes from F-Droid** (3.7.2, Oct 16, Android 4.2+, 47–49 MiB by processor), because Play shows "Varies with device". The changelog is Play's current release notes. The page explains that the F-Droid and Play builds are signed differently.
- **Free Fire's Play title is temporarily "Free Fire x NARUTO SHIPPUDEN"** (crossover event). `name` uses the lasting name "Free Fire", and the page explains the event title. Recheck after the event.
- **ChatGPT `containsAds: true`** because Play marks it so. The page says only that, without guessing which plans show ads.
- **Geometry Dash Lite `inAppPurchases: false`:** Play shows no IAP label (the IARC "In-Game Purchases" note covers the RobTop family). Minecraft Trial uses null for the same situation because its listing is less clear-cut. Recheck both if the listings change.
- **New categories with intros:** photo-editors, social, productivity, video-players and strategy.
- **The validator now checks category and hub intros too.** It caught "unlimited coins" in the Sports and Arcade intros, "mod menus" in Adventure, "unlimited-money" in the Games hub and "premium unlocked" in the Apps hub, all written in earlier steps and now reworded.

### Batch 4 (2026-11-03)

- **Pages:** Telegram, Snapseed, Facebook Lite, MX Player, Spotify, Shazam, Truecaller, Google Lens, Candy Crush Saga, Ludo King.
- **Signal was proposed but replaced by Facebook Lite,** because Signal isn't in the brief's list of 50. The site is on track to exactly the brief's list. Pages still name Signal as an alternative, as plain text.
- **Telegram written on the Instagram basis** (owner approved): Play update date, IAP and rating only. Version and Android requirement are "varies" and there's no "What's new". `containsAds` is null because Play doesn't flag ads but Telegram shows sponsored messages in large public channels.
- **Snapseed version "4.1"** comes from its Play release notes ("Welcome to Snapseed 4.1!") because the Play version field says "Varies with device".
- **Google Lens's standalone app was last updated 2025-08-06.** Lens now mostly ships inside the Google app, and the page says so. Recheck whether Google retires the standalone listing.
- **MX Player is now published by Amazon Mobile LLC** (per Play). Amazon's 2024 acquisition is stated on the page.
- **Developer page added:** Google LLC (Snapseed, Google Lens). It's noindex until it gets an intro.
- **New categories with intros:** music-audio, puzzle, board.
- **Remaining 10 from the brief:** xapk-installer, mobile-legends, rope-hero, bitlife, super-mario-run, asphalt-legends, hill-climb-racing, real-cricket-24, wcc3, 8-ball-pool.

### Batch 5 (2026-11-03) — 50 pages complete

- **Pages:** XAPK Installer, Mobile Legends, Rope Hero: Vice Town, BitLife, Super Mario Run, Asphalt Legends, Hill Climb Racing, Real Cricket, WCC3, 8 Ball Pool. With these, all 50 apps from the brief are published (Signal → Facebook Lite swap in batch 4).
- **XAPK Installer** is `com.wuliang.xapkinstaller` by TarrySoft: the top Play result and 10M+ installs. Several similarly named installers exist. The page explains what XAPK files are and that the installer is only as safe as the files it installs. Its Play "What's new" still mentions Android 11 even though the update is from 2026, and the page points that out.
- **Real Cricket 24 → `real-cricket`.** The game is now "Real Cricket™: Cricket Games" by KRAFTON, Inc. (package `com.nautilus.realcricket`, v5.4). The slug drops the year per brief §5.5, and the page and FAQ explain the name change for "real cricket 24" searchers. No WordPress URL pointed here, so no redirect is needed.
- **Mobile Legends** uses the global MOONTON listing `com.mobile.legends`, which isn't offered in the US Play store. Facts were read through `gl=PH`. The IAP range is shown only in PHP there, so the page states no dollar range. Its rating there is "16+", and the page says ratings vary by country. The US build (`com.mobile.legends.usa`, Skystone Games) is mentioned in the FAQ.
- **Super Mario Run `price` is "Free"** (free download). The $9.99 one-time unlock appears as an in-app purchase and is explained in the summary, a table and the FAQ. `price` stays "Free" so the schema Offer doesn't claim $9.99 for the download.
- **Rope Hero and BitLife are rated Mature 17+** on Play. Both are legitimate games, and both pages state the rating prominently.
- **Asphalt Legends:** the same package as Asphalt 9: Legends / Asphalt Legends Unite. The page explains the renames.
- **New category with intro:** `racing`.
- **The validator caught "unlimited tokens"** (Asphalt) before it shipped. It was reworded.

## Performance and accessibility (step 5)

- **Accent green darkened to `#15803d`** (hover `#166534`) in light mode. White button text on the brief's `#16a34a` measured 3.30:1, which fails WCAG AA for 16px text. `#15803d` gives 5.02:1. Dark mode is unchanged (8.46:1). OG cards keep the brighter green, since they're images, not UI text.
- **Small icon files.** Cards displayed 64px icons from 512px files (up to 68 KB each), which slowed the homepage on mobile. `scripts/icon-variants.ts` now makes `icon-128.webp` (cards, lists, search) and `icon-192.webp` (app header), and `iconSrc()` picks one per display size. The build fails if a variant is missing, and `optimize-icon` creates them automatically. The 512px original remains for OG images, schema and the image sitemap.
- **No viewport prefetch** on cards, header, footer and breadcrumb links (`prefetch={false}`). Next.js was downloading data for every visible link on load, which wastes mobile bandwidth on a static site where pages load quickly anyway.
- **AdSense loader added** (`components/AdSense.tsx`). Before this, `AdSlot` rendered `<ins>` tags but nothing loaded `adsbygoogle.js` or requested ads, so ads would never have appeared after approval. It loads `lazyOnload` and refills slots after each client-side navigation. It's still inert until `NEXT_PUBLIC_ADSENSE_CLIENT` is set.
- **Tap targets:** footer links and the header logo are now at least 44px tall (brief §3).
- **Search box:** `aria-controls` is only set while the results list exists, which fixes Lighthouse's `aria-valid-attr-value` failure, and `aria-expanded` was added.
- **Compression:** brotli rules were added beside gzip in `.htaccess`.
- **Lighthouse is run locally** (`npx lighthouse@12`, mobile, simulated throttling) against `npx serve out`, because there's no CI. `serve` doesn't send the long cache headers from `.htaccess`, so production should score the same or better.
- **CSS element rules moved into `@layer base`.** The unlayered `a { color: inherit }` beat Tailwind's layered utilities, so download buttons never got `text-accent-contrast`, leaving dark-on-green text in light mode and 2.03:1 in dark mode. The unlayered `:focus-visible` also overrode `focus-visible:outline-none` and forced a 4px radius on round buttons. **Rule for future CSS: element selectors go in `@layer base`.**
- **Font `display: "optional"`** instead of `swap`. On long text pages, Inter arriving late re-wrapped the text and caused CLS 0.221 on `/privacy-policy`. With `optional`, the preloaded font is used if it arrives within about 100 ms, otherwise the metric-matched fallback stays for that page view. CLS is now 0 on every tested page. This deviates from the brief's suggested `swap` in favour of its CLS < 0.05 target.

### Lighthouse results (mobile, simulated slow 4G, local `serve`)

| Page | Before | After | LCP | CLS | Accessibility |
|---|---|---|---|---|---|
| `/` | 84 | 97 | 2.6 s | 0 | 95 → 100 |
| `/app/brave-browser` | 92 | 95 (median of 4: 93–96) | 2.4 s | 0 | 96 → 100 |
| `/app/clash-of-clans` | — | 96 | 2.4 s | 0 | 100 |
| `/category/apps` | 94 | 96 | 2.6 s | 0 | 100 |
| `/privacy-policy` | 86 (CLS 0.22) | 96 | 2.3 s | 0 | 100 |
| `/contact` | — | 95 | 2.3 s | 0 | 100 |

Best practices and SEO are 100 on every page. LCP is 2.3–2.6 s, above the brief's 2.0 s target under Lighthouse's slow-4G simulation. It's text that's limited by the 103 KB React/Next.js runtime and the font, not by images. Recheck field data in Search Console once the site is live.

## Free tools section (2026-11-03, owner request)

- **Scope:** 11 browser-based tools under `/tools`: QR code generator, QR code scanner, image converter, PNG to JPG, JPG to PNG, WebP to JPG, image compressor, image resizer, APK/file SHA-256 checker, password generator and word counter. These are among the most-searched utility tools. The hash checker ties into the site's "verify your APK" message.
- **Everything runs client-side.** The hosting is static (no server), and "files never leave your device" is a real privacy and trust selling point. Image work uses the browser's own decoders and `<canvas>`, hashing uses Web Crypto, and passwords use `crypto.getRandomValues` with unbiased sampling. The privacy policy now states that tool data is processed locally.
- **Each tool is a full page, not a bare widget:** a quick answer, a 330–415 word article (how to use it, how it works, tips) and 4 FAQs, plus `WebApplication` + `FAQPage` + breadcrumb schema. This keeps the pages well clear of thin content for Google and AdSense. The validator checks tool articles, titles, descriptions, summaries and related links too.
- **Structure:** metadata lives in `lib/tools.ts`, articles in `content/tools/{slug}.mdx`, and widgets in `components/tools/registry.tsx`. To add a tool, add an entry, an article and a widget mapping. Widgets load through `next/dynamic`, so each page only downloads its own tool's code.
- **New dependencies** (pinned, mature, permissive licences): `qrcode@1.5.4` (MIT), `jsqr@1.4.0` (Apache-2.0, loaded only when a scan starts) and `@types/qrcode@1.5.6` (dev).
- **No JFIF-specific page.** The owner runs a separate JFIF-to-JPG site, so APKPeer doesn't compete with it. The general converter and JPG-to-PNG still accept `.jfif`.
- **Wired into:** header nav ("Tools"), a footer column, a homepage "Free tools" section (6 tools), site search, `sitemap-tools.xml` (12 URLs), `llms.txt`, and OG cards (`/og/tool-{slug}.png`).
- **AdSense placement** on tool pages sits below the article, well away from the tools' own Download buttons (accidental-click policy).
- **Tested in Chrome** with real files: QR scan round-trip, PNG→JPG, WebP→JPG, PNG→WebP, compress (−89%), resize (aspect kept), SHA-256 matching `sha256sum` (including an uppercase, colon-separated paste) and a one-character mismatch, password options, and word/sentence/paragraph counts. One bug was fixed: the `qrcode` library's inline canvas width made the preview overflow its column.
- **npm audit:** existing advisories in build-time dependencies (PostCSS inside Next.js, Zod) predate the tools. Fixing them needs major upgrades (Next 16, Zod 4), and none of that code ships to visitors. Revisit when upgrading Next.js.

### 50 more tools (2026-11-03, owner request) — 61 in total

- **Built on six shared engines instead of 50 separate widgets:** `TextTool` (14 text/encoding tools, chosen by `kind`), `DevTools` (hash, UUID, timestamp, number base, color, Roman, random number, name picker, lorem ipsum), `Calculators` (9), `UnitConverter` (6 unit sets), `ImageExtras` (Base64, favicon, color picker) and `DeviceTools` (screen, device/APK, stopwatch, text to speech). `ImageTool` gained `rotate` and `grayscale` modes. Each engine is its own chunk, so a page loads only its engine. Tool pages pass a serializable `kind` string, because functions can't cross the server/client boundary.
- **Same page standard as the first 11:** a quick answer, 283–383 word article, 3 FAQs and WebApplication/FAQ schema. Metadata lives in `lib/tools-more.ts`, which `lib/tools.ts` concatenates. Articles are in `content/tools/`. The validator's article threshold for tools is 250 words.
- **No new dependencies.** MD5 (not in Web Crypto) is a small in-house implementation in `lib/md5.ts`, verified against Node's `crypto` on 8 vectors, including the 55/56/64-byte padding boundaries and multi-byte UTF-8.
- **Worked examples in articles were checked by computation** (EMI, compound growth, age totals, unit factors). One error was found and fixed: the next-birthday example said 46 days instead of 73.
- **Hydration:** anything time- or random-based (current Unix time, today's date in age/date tools, lorem ipsum, UUIDs) is generated in `useEffect`, not during render, so build-time HTML and the browser don't disagree.
- **Device tool "Which APK do I need?"** maps `navigator.userAgentData` architecture + bitness to an ABI (arm+64 → arm64-v8a, arm+32 → armeabi-v7a, x86 variants). It falls back gracefully where the API is missing (Firefox, iOS). This is the most on-brand of the new tools.
- **Area converter** deliberately leaves out regional land units (marla, kanal, bigha) because their size varies by region. The page explains why.
- **`tsconfig.json` now has `allowImportingTsExtensions`.** `lib/tools.ts` imports `./tools-more.ts` with its extension so plain Node (the validator) can load it.
- **Footer** shows 8 popular tools plus "All 61 tools →" instead of every tool, to avoid 61 links on every page.

## Design system: APK Peer (2026-11-04, owner request)

The owner supplied the APK Peer brand book (README). Its `tokens.md` and `components.md` were not provided, so the exact values it states are used as given (`brand` #EC8B57, `brand-strong` #B4521C, Poppins 400–700, type scale, 4px spacing, 1200px container, 4/2/1 grid). The remaining tokens were derived from its rules and contrast-checked.

- **Tokens** live in `app/globals.css` as CSS custom properties, light first, with `[data-theme="dark"]` plus a `prefers-color-scheme` fallback. The old names (`--bg`, `--accent`, `--text`…) are now aliases, so the tool widgets and pages that use them picked up the new palette without edits.
- **Contrast (WCAG AA), measured:**
  - Light: ink 14.6–16.6:1, body 10.4–11.8:1, muted 6.1–7.0:1 and link 5.3–6.1:1 on every surface. White on brand-strong is 5.04:1.
  - Dark: every text pair is 7.2:1 or higher. on-brand on brand-strong is 8.7:1.
  - Badges: 6.3:1 or higher. border-strong is 3.1:1 or higher; star is 3.5:1 or higher.
  - White on `brand` is 2.5:1, so `brand` is used only for decoration: hero shapes, the active-nav underline, list markers, blockquote rules and the logo dot.
- **Brand constraint (deliberately not adopted):** the brand book describes a catalogue of "games, apps and MODs" with a MOD badge. APKPeer lists original, unmodified apps only (the build brief's original-only rule), so `Badge` has only APP and GAME. No MOD styles, copy or categories were added. The `{App} {version} APK – …` title pattern is already in use.
- **Type:** Poppins via `next/font` (self-hosted WOFF2, metric-adjusted fallback, `display: optional` to keep CLS near 0). Display H1 `clamp(2rem, 5vw, 3rem)`, H1 32, H2 24/600, article body 17/1.7 at a 70ch measure. UI body stays at 16px rather than 15px for readability on phones.
- **Components:**
  - `AppCard`: `ap-card`, 64px icon, type badge, version · date. It stacks vertically at 1024px+ so the real meta isn't truncated in 4 columns.
  - `Badge`, plus `NavLinks` (active state: ink text with a brand underline, `aria-current`).
  - Search bar: pill, card background, border-strong.
  - Category chips: pill.
  - Homepage: warm hero band, alternating bands.
  - Header: card background, "APK Peer" wordmark, because no logo file exists yet.
  - Favicon, manifest and OG images were recolored.
- **Responsive:** on phones the header nav moves to a second row; at 360px the wordmark, three links and two icons didn't fit, and the page overflowed by about 100px. Grid and flex cards get `min-w-0` so long meta can't widen the page. Prose links wrap long URLs, and prose tables scroll inside themselves below 640px. Anchor offsets follow the header height (`--header-offset`: 112px on phones, 80px from 640px up).

## 50 more apps and games (2026-11-04, owner request) — 100 in total

- **Selection:** "trending on Google" was read as apps and games that combine high 2025–2026 download charts with heavy name search: AI assistants, Meta and Google apps, streaming, shopping, and the biggest live games. Apps already on the site were skipped. Where earlier pages already named a slug as an alternative (google-gemini, claude, perplexity, signal, threads, facebook, netflix, picsart, adobe-lightroom, youtube-music, google-translate, royal-match, brawl-stars, clash-royale, call-of-duty-mobile, fc-mobile, terraria, carrom-pool), that slug was reused, so those `<AppLink>`s now resolve. The owner approved the list and the icon downloads.
- **Microsoft Copilot was replaced by Grok.** `com.microsoft.copilot` returns "Not Found" on Play, and a Play search for "microsoft copilot" now leads to the Microsoft 365 Copilot app (`com.microsoft.office.officehubrow`). A page about the consumer Copilot app couldn't be verified.
- **Facts come from each Play listing rendered in Chrome on 2026-11-04** (version, update date, Android requirement, downloads, ads and IAP labels, IAP range, content rating, "What's new"). The extraction script polls the "About this app" dialog because it opens asynchronously. Regions: US, except JioHotstar and Indian Bikes Driving 3D (read from gl=IN, their main market) and TikTok Lite (gl=ID, because it isn't offered in the US). The region is recorded in `latest.source`.
- **`containsAds: null`** where Play shows no ads label but the service is known to show ads or sponsored content: Threads, Messenger, Discord (sponsored Quests) and Netflix (ad-supported plans). Each page explains this. The convention is the same as WhatsApp's.
- **Paid games** (Minecraft $6.99, GTA: San Andreas $6.99, Terraria $4.99, Stardew Valley $4.99) use `price` from Play, so the schema Offer shows the real price. Their install sections say to buy on Play, and that free APKs of paid games are pirated.
- **Genshin Impact's version is shown as 7.2.0.** Play's version string is `7.2.0_48751704_49008628`; the suffix is internal build numbers, and the title would have been unreadable.
- **Developer names follow Play exactly.** That includes Pokémon GO → "Scopely Explore, Inc." (Niantic sold its games to Scopely in 2025) and Grok → "SpaceX Super Intelligence". Shared developers reuse existing slugs: google, meta-platforms, instagram, supercell, miniclip, mojang, scopely and tiktok-pte-ltd.
- **Indian Bikes Driving 3D:** several games share the name. The page covers the original by Rohit Gaming Studio (`com.Rohit.IndianBikes`, 100M+). It's rated 18+ for extreme violence in India, and the page says so. Its in-game number codes are an official feature; the page calls them "vehicle codes" because the validator reserves "cheat" for safety sections.
- **New categories with intros:** education, shopping, role-playing and card. The existing `casual` category got its intro now that it has games.
- **Homepage popular lists** now include the new trending titles and show 8 per list (two full rows in the 4-column grid).
- **Length:** the new articles are about 700–1,030 words. Most of them, like 14 of the original 50, are under the brief's 900-word target (validator warning only). Batches 1, 2 and 5 got an extra practical section (settings, free vs paid, tips). Batches 3 and 4 have tips sections in the main body. Extend the shortest pages first if more depth is needed.
- **Still open for every new page:** 3 real screenshots each and `latest.size`, the same as the first 50.

## Betty Casino (2026-11-04, owner request) — first real-money casino page

- **The owner asked for a page targeting** "Betty Casino app download / login / Canada / games / Manitoba real money / Quebec / Saskatchewan / app login for Android".
- **Facts come from the Google Play listing** (`ca.betty.app`, gl=CA, read 2026-11-04): Betty Canada, v1.187.1, Oct 29 2026, Android 8.0+, 100,000+ downloads, Adults only 18+ (Real Gambling). Licensing per the listing: AGCO and iGaming Ontario, plus AGLC and Alberta iGaming Corporation. It's licensed only in Ontario and Alberta.
- **Province keywords are answered truthfully, not exploited.** The page says plainly that Betty isn't licensed in Manitoba, Quebec or Saskatchewan. It lists each province's regulated option (PlayNow.com for Manitoba with MBLL, Loto-Québec, PlayNow.com for Saskatchewan) and the minimum ages (ON 19, AB 18, MB 18, QC 18, SK 19). Writing "how to play Betty in Manitoba for real money" would promote unlicensed gambling, so the page doesn't.
- **It warns about lookalike Betty domains.** Several sites use the Betty name and claim to serve every province; the official site is betty.ca.
- **Responsible gambling:** limits and self-exclusion tools are described, with ConnexOntario (1-866-531-2600) and Alberta's Addiction Helpline (1-866-332-2322).
- **New `casino` category** with an intro. **AdSense:** the manual ad slots are switched off on casino-category app pages, because Google restricts ads on gambling content. Auto ads, if enabled later in the AdSense dashboard, should exclude /app/betty-casino and /category/casino.
- No alternatives are listed (no other casino pages). The page mentions the provincial sites and free social-casino-style games (Coin Master, Monopoly GO!) as no-real-money options.

## Affiliate download buttons, OLG and BET99 (2026-11-04, owner request)

- **`affiliateUrl` (optional) added to the app schema.** When it's set, the main button on the app page links there with `rel="sponsored nofollow noopener"`, a "Get {App}" label and a visible disclosure line (commission, adults only, ConnexOntario). The JSON-LD `installUrl` keeps the official URL.
- **The owner sent the programs' sign-up pages** (olg.ca/en/affiliates.html, bet99affiliates.com, towercasino.ca/en-ca/affiliates/), not personal tracking links. Players sent to those pages would land on affiliate application forms, so `affiliateUrl` is `null` on betty-casino, olg and bet99 until the owner pastes the tracking URLs. Until then the buttons go to Google Play.
- **OLG page** (`com.olg.ewma`, read on Play gl=CA): targets login, app, games, real money, locations and Fallsview. "No deposit bonus" is deliberately not targeted: the AGCO's standards ban public advertising of inducements by operators and affiliates (BetMGM was fined C$110,000 in 2025 over an affiliate).
- **BET99 page** (`com.bet99.sports`): the only BET99 app on Play says "Not available to persons in Ontario". The page explains that it's the rest-of-Canada product (reported Kahnawake licence) and that Ontario players must use BET99's separate AGCO-registered product.
- **Tower Casino was not added.** No evidence of an Ontario or other provincial licence was found. The AGCO's standards bar affiliates of Ontario-registered operators (OLG, Betty) from also advertising unregistered sites operating in Ontario. The supplied Tower keyword CSV is also about land-based casino hotels (Foxwoods, Crown, Turning Stone), not towercasino.ca.
- **Editorial policy and About page** now disclose affiliate commissions from licensed gambling operators.

## Pre-deploy SEO / AEO / GEO pass (2026-11-06)

- **Audited all 217 built pages** (titles, descriptions, canonicals, H1s, OG/Twitter tags, html lang, image alt text, JSON-LD validity, sitemap vs noindex consistency). All pages have a self-canonical, one H1, OG and Twitter tags, and parseable JSON-LD. No noindex page is in a sitemap, and no indexable page is missing from one.
- **Category pages were all noindex** under the brief's thin-page rule (intro + 12 words per card < 250). They now render real, data-driven content from verified app fields: a comparison table (app, developer, version, updated, Android, price) and up to 4 generated FAQs (free vs paid, oldest/newest Android requirement, ads per the Play label, most recent updates), with FAQPage JSON-LD. `isThinArchive` counts those words. 23 categories became indexable (the sitemap went from 178 to 201 URLs). Browsers, Card and Education (one app each) correctly stay noindex.
- **Fixed:** category titles over 65 characters drop "– Original APKs"; category descriptions shortened (they were up to 181 characters); paginated archives get "Page N of M" in the description (they had duplicates); trust pages got descriptive `seoTitle`s; the Disclaimer gained an "Affiliate links" section.
- **Already in place:** robots.txt allows search engines and AI crawlers (GPTBot, OAI-SearchBot, ChatGPT-User, PerplexityBot, ClaudeBot, Google-Extended, Applebot-Extended), points to the sitemap index, and blocks /api, /search and /go. llms.txt lists all 103 apps and the content policy. Each app page has a 45–60-word quick answer, an info table, FAQs, and MobileApplication or VideoGame plus FAQPage and BreadcrumbList schema. Tools use WebApplication. .htaccess forces https and the non-www host, removes trailing slashes and .html, and handles 301/410s.

## Gambling content removed (2026-11-20, owner request)

- **Removed:** the Betty Casino, OLG and BET99 pages (content and icons), the `casino` category, the `affiliateUrl` field and sponsored-button code, and the affiliate wording on the About, Editorial policy and Disclaimer pages. Earlier, Hostinger's malware scanner had emptied the live `category/casino.html` (a false positive on gambling-heavy content), and the owner decided against gambling content on the site.
- **301s** in `.htaccess`: `/category/casino` and `/app/(betty-casino|olg|bet99)` → `/category/games`.
- **Kept:** factual mentions inside game pages, such as Coin Master's "simulated gambling" rating and GTA's in-game casino. They describe the games, not gambling services.

## iSkills rewrite, 20 new pages, word rules (2026-11-25, owner request)

- **Word rule:** the validator now rejects "casino" and "mod(s)" anywhere in page text. Existing safety warnings were reworded ("unofficial APK", "altered APK"). Old WordPress slugs in `oldUrls` still contain "mod" because they're redirect data, not page text.
- **Keyword research used free sources only** (owner choice): Google autocomplete (gl=us) for each app across 11 seed patterns ("X apk", "is X safe", "X not working", "X vs" and so on), with mod/hack/cracked variants filtered out. Volumes are **UNVERIFIED**; autocomplete order was used to pick primary/secondary/tertiary keywords. Primary = "X apk", secondary = "X apk download", tertiary = "X for android"; the questions became FAQs and fix tables.
- **Competitor heading research wasn't possible.** Ahrefs is blocked for the Chrome extension, Semrush wasn't logged in, and Softonic and Uptodown block plain fetches and the extension. The pages follow the iSkills APK outline instead: direct answer → what is → details + pros/cons table → features → what's new → install → PC/iPhone → not-working fixes → safety → alternatives → final thoughts.
- **Top 20 rewritten** (WhatsApp, Instagram, TikTok, YouTube, Facebook, ChatGPT, Telegram, Snapchat, Spotify, CapCut, Free Fire, Roblox, PUBG Mobile, Minecraft, Subway Surfers, Candy Crush, Clash of Clans, Netflix, Gemini, Block Blast). Facts were re-read from Google Play on 2026-11-25, and the previous versions moved into `versions`. Free Fire's Play title is now "Free Fire: Storm Arena". WhatsApp now shows "Varies with device" because Play does.
- **20 new pages,** chosen because existing pages already named them as alternatives (so plain-text mentions became links): Chrome, Firefox, DuckDuckGo, Google Photos, Google Maps, Musixmatch, Deezer, SoundCloud, Windscribe, 1.1.1.1 + WARP, Free Fire MAX, Candy Crush Soda, Homescapes, Hill Climb Racing 2, Geometry Dash ($3.99), Sonic Dash (Play title "Sonic Dash Run"), UNO!, Goose Goose Duck, Honor of Kings, BGMI (read from gl=IN).
- **Length:** rewritten pages are about 700–1,000 words. New pages are about 550–775 words, below the brief's 900. Extend the shortest pages with competitor data once Ahrefs/Semrush is available.
- **Off-page:** `docs/OFFPAGE-PLAN.md` (phased iSkills plan) and `docs/offpage-tracker.csv`. Audit metrics are UNVERIFIED until a backlink tool is available.
