import { CATEGORIES, categoryLabel, type Category } from "./categories";
import { getAllApps, type App } from "./content";
import { formatDate } from "./site";

/** Category archives paginate at 24 apps per page (brief §5.6). Page 2+ is indexed and self-canonical. */
export const PER_PAGE = 24;

/** Brief §5.7: a generated page with < 250 words of unique content is noindex,follow. */
export const THIN_WORDS = 250;
/** Rough unique words each listed card contributes (name, developer, category, version, date). */
const WORDS_PER_CARD = 12;

export type TypeHub = { slug: "apps" | "games"; type: App["type"]; name: string; intro: string };

export const TYPE_HUBS: TypeHub[] = [
  {
    slug: "apps",
    type: "app",
    name: "Apps",
    intro:
      "These are the Android apps APKPeer covers: browsers, messengers, VPNs, editors, players and everyday tools. Each one is the original build from its developer. We don't list modified or repackaged versions, and every download button goes to Google Play or the developer's official site. Each app page shows the latest version and release date, the minimum Android version where we've been able to confirm it, the release notes, install steps for phones without Play Store, and a plain-language look at whether the app is safe and what it does with your data. Browse by category below or scroll through every app, newest updates first. If a version number looks out of date, the page footer shows when we last checked it and the sources we used.",
  },
  {
    slug: "games",
    type: "game",
    name: "Games",
    intro:
      "These are the Android games APKPeer covers, from quick casual runners to competitive shooters, football and cricket sims, racing and strategy. Every listing is the original game from its publisher. APKPeer doesn't list modified APKs or cheat tools: they're a common way to spread malware, and online games regularly ban accounts that use them. Each game page gives you the latest version and release date, what changed in the update, the download size and Android version where the publisher states them, whether the game has ads or in-app purchases, and how to install it if Play Store isn't available on your phone. Browse by genre below or see every game, most recently updated first.",
  },
];

export type Archive = {
  slug: string;
  name: string;
  kind: "hub" | "category";
  /** Heading text, e.g. "Android Apps" or "Web browsers for Android". */
  heading: string;
  /** Lowercase noun for descriptions, e.g. "apps" or "web browsers". */
  noun: string;
  intro: string;
  apps: App[];
  /** For hubs: the categories under it that have apps. */
  children: Category[];
};

export function appsOfType(type: App["type"]): App[] {
  return getAllApps().filter((a) => a.type === type);
}

export function appsInCategory(slug: string): App[] {
  return getAllApps().filter((a) => a.category === slug);
}

/** Only categories with at least one published app get a page — no empty archives. */
export function usedCategories(): Category[] {
  const used = new Set(getAllApps().map((a) => a.category));
  const cats = CATEGORIES.filter((c) => used.has(c.slug));
  const missing = cats.filter((c) => !c.intro);
  if (missing.length) {
    throw new Error(`Add an intro in lib/categories.ts for: ${missing.map((c) => c.slug).join(", ")}`);
  }
  return cats;
}

export function usedTypeHubs(): TypeHub[] {
  return TYPE_HUBS.filter((h) => appsOfType(h.type).length > 0);
}

export function getArchives(): Archive[] {
  const cats = usedCategories();
  return [
    ...usedTypeHubs().map<Archive>((h) => ({
      slug: h.slug,
      name: h.name,
      kind: "hub",
      heading: `Android ${h.name}`,
      noun: h.name.toLowerCase(),
      intro: h.intro,
      apps: appsOfType(h.type),
      children: cats.filter((c) => c.type === h.type),
    })),
    ...cats.map<Archive>((c) => ({
      slug: c.slug,
      name: c.name,
      kind: "category",
      heading: `${categoryLabel(c)} for Android`,
      noun: categoryLabel(c).toLowerCase(),
      intro: c.intro!,
      apps: appsInCategory(c.slug),
      children: [],
    })),
  ];
}

export function getArchive(slug: string): Archive | undefined {
  return getArchives().find((a) => a.slug === slug);
}

const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

/** True when an archive page would be thin (brief §5.7) → noindex,follow and kept out of the sitemap. */
export function isThinArchive(intro: string, appsOnPage: number, extraWords = 0): boolean {
  return wordCount(intro) + extraWords + appsOnPage * WORDS_PER_CARD < THIN_WORDS;
}

export type Developer = { slug: string; name: string; url: string; apps: App[] };

/** Developer pages only exist for developers with 2+ published apps (brief §5.7). */
export function getDevelopers(): Developer[] {
  const map = new Map<string, Developer>();
  for (const app of getAllApps()) {
    const d = map.get(app.developer.slug) ?? { ...app.developer, apps: [] };
    d.apps.push(app);
    map.set(app.developer.slug, d);
  }
  return [...map.values()].filter((d) => d.apps.length >= 2);
}

export function pageCount(total: number): number {
  return Math.max(1, Math.ceil(total / PER_PAGE));
}

export function paginate<T>(items: T[], page: number): T[] {
  return items.slice((page - 1) * PER_PAGE, page * PER_PAGE);
}

/** Path for page N of an archive: page 1 is the bare URL, never /page/1. */
export function archivePath(base: string, page: number): string {
  return page <= 1 ? base : `${base}/page/${page}`;
}

/** Newest `updated` date in a list — the honest lastmod for an archive page. */
export function newestUpdate(apps: App[]): string | undefined {
  return apps.reduce<string | undefined>((max, a) => (!max || a.updated > max ? a.updated : max), undefined);
}

/* ---------------------------------------------------------------------------
 * Data-driven category content (programmatic SEO / AEO).
 * Built only from verified fields in each app's data.json; unknown values are skipped, never guessed.
 * ------------------------------------------------------------------------- */
export type ArchiveFaq = { q: string; a: string };

const list = (names: string[]) =>
  names.length <= 1 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
const androidNum = (v: string | null) => (v ? parseFloat(v) : NaN);

export function archiveFaqs(ar: Archive): ArchiveFaq[] {
  if (ar.kind !== "category" || ar.apps.length < 2) return [];
  const apps = ar.apps;
  const noun = ar.noun;
  const faqs: ArchiveFaq[] = [];

  const free = apps.filter((a) => a.price === "Free").map((a) => a.shortName);
  const paid = apps.filter((a) => a.price !== "Free").map((a) => `${a.shortName} (${a.price})`);
  faqs.push({
    q: `Which ${noun} on APKPeer are free?`,
    a: paid.length
      ? `${list(free)} ${free.length === 1 ? "is" : "are"} free to install. ${list(paid)} ${paid.length === 1 ? "is a paid download" : "are paid downloads"} on Google Play. Free apps may still show ads or sell optional in-app purchases; each app page lists both.`
      : `${apps.length === 2 ? "Both" : `All ${apps.length}`} ${noun} listed here are free to install: ${list(free)}. Some show ads or sell optional in-app purchases, which each app page lists.`,
  });

  const withReq = apps.filter((a) => !isNaN(androidNum(a.minAndroid))).sort((a, b) => androidNum(a.minAndroid) - androidNum(b.minAndroid));
  if (withReq.length >= 2) {
    const lo = androidNum(withReq[0].minAndroid);
    const hi = androidNum(withReq[withReq.length - 1].minAndroid);
    const lows = withReq.filter((a) => androidNum(a.minAndroid) === lo).slice(0, 4).map((a) => a.shortName);
    const highs = withReq.filter((a) => androidNum(a.minAndroid) === hi).slice(0, 3).map((a) => a.shortName);
    faqs.push({
      q: `Which ${noun} work on older Android phones?`,
      a:
        lo === hi
          ? `${withReq.length === 2 ? "Both" : `All ${withReq.length}`} ${noun} with a confirmed requirement need Android ${withReq[0].minAndroid} or newer: ${list(withReq.map((a) => a.shortName))}. Where Google Play says "Varies with device", Play only offers the install on compatible phones.`
          : `${list(lows)} ${lows.length === 1 ? "supports" : "support"} the oldest phones, from Android ${withReq[0].minAndroid}. ${list(highs)} ${highs.length === 1 ? "needs" : "need"} the newest, Android ${withReq[withReq.length - 1].minAndroid} or later. Where Google Play says "Varies with device", Play only offers the install on compatible phones.`,
    });
  }

  const noAds = apps.filter((a) => a.containsAds === false).map((a) => a.shortName);
  const ads = apps.filter((a) => a.containsAds === true).map((a) => a.shortName);
  if (noAds.length || ads.length) {
    faqs.push({
      q: `Which ${noun} have no ads?`,
      a: noAds.length
        ? `According to their Google Play listings, ${list(noAds)} ${noAds.length === 1 ? "doesn't" : "don't"} contain ads.${ads.length ? ` ${list(ads)} ${ads.length === 1 ? "shows" : "show"} ads.` : ""} Apps whose ad status Play doesn't confirm aren't included.`
        : `Every ${noun.replace(/s$/, "")} here with a Google Play ads label shows ads: ${list(ads)}. Paid plans or in-app purchases often remove them; each app page explains how.`,
    });
  }

  const recent = [...apps].sort((a, b) => b.latest.releaseDate.localeCompare(a.latest.releaseDate)).slice(0, 3);
  faqs.push({
    q: `Which ${noun} were updated most recently?`,
    a: `${list(recent.map((a) => `${a.shortName}${/\d/.test(a.latest.version) ? ` ${a.latest.version}` : ""} (${formatDate(a.latest.releaseDate)})`))} ${recent.length === 1 ? "has" : "have"} the newest releases on Google Play. Each app page lists what changed in its latest version.`,
  });
  return faqs;
}

/** Words of unique, data-driven text an archive page renders besides cards: comparison table + FAQs. */
export function archiveExtraWords(ar: Archive, appsOnPage: App[], page: number): number {
  if (page !== 1 || ar.kind !== "category") return 0;
  const faqWords = archiveFaqs(ar).reduce((n, f) => n + wordCount(f.q) + wordCount(f.a), 0);
  const tableWords = appsOnPage.length * 10; // name, developer, version, date, Android, price
  return faqWords + tableWords;
}
