import { getAllApps, hasVersionArchive, type App } from "./content";
import { TRUST_PAGES } from "./pages";
import {
  archivePath,
  getArchives,
  getDevelopers,
  isThinArchive,
  archiveExtraWords,
  newestUpdate,
  pageCount,
  paginate,
  appsOfType,
} from "./taxonomy";
import { developerIntro } from "./developers";
import { TOOLS } from "./tools";
import type { SitemapEntry } from "./xml";

function appEntries(apps: App[]): SitemapEntry[] {
  return apps.flatMap((a) => {
    const main: SitemapEntry = {
      path: `/app/${a.slug}`,
      lastmod: a.updated,
      images: [
        { src: a.icon, title: `${a.shortName} icon` },
        ...a.screenshots.map((s) => ({ src: s.src, title: s.alt })),
      ],
    };
    // Download pages are noindex, so they never appear here (brief §5.3).
    const versions: SitemapEntry[] = hasVersionArchive(a) ? [{ path: `/app/${a.slug}/versions`, lastmod: a.updated }] : [];
    return [main, ...versions];
  });
}

/** Archive pages that pass the thin-content guard. Noindex pages stay out of sitemaps. */
function archiveEntries(): SitemapEntry[] {
  return getArchives().flatMap((ar) => {
    const lastmod = newestUpdate(ar.apps);
    return Array.from({ length: pageCount(ar.apps.length) }, (_, i) => i + 1)
      .filter((p) => !isThinArchive(ar.intro, paginate(ar.apps, p).length, archiveExtraWords(ar, paginate(ar.apps, p), p)))
      .map((p) => ({ path: archivePath(`/category/${ar.slug}`, p), lastmod }));
  });
}

/** Each child sitemap of the index. Empty ones are left out of the index. */
export const SITEMAPS: Record<string, () => SitemapEntry[]> = {
  "sitemap-apps.xml": () => appEntries(appsOfType("app")),
  "sitemap-games.xml": () => appEntries(appsOfType("game")),
  "sitemap-tools.xml": () => [
    { path: "/tools", lastmod: TOOLS.reduce((m, t) => (t.updated > m ? t.updated : m), "") },
    ...TOOLS.map((t) => ({ path: `/tools/${t.slug}`, lastmod: t.updated })),
  ],
  // Guides arrive in phase 2; the sitemap appears in the index as soon as one exists.
  "sitemap-guides.xml": () => [],
  "sitemap-pages.xml": () => [
    { path: "/", lastmod: newestUpdate(getAllApps()) },
    ...TRUST_PAGES.map((p) => ({ path: p.path, lastmod: p.updated })),
  ],
  "sitemap-taxonomies.xml": () => [
    ...archiveEntries(),
    ...getDevelopers()
      .filter((d) => !isThinArchive(developerIntro(d), d.apps.length))
      .map((d) => ({ path: `/developer/${d.slug}`, lastmod: newestUpdate(d.apps) })),
  ],
};

export function lastmodOf(entries: SitemapEntry[]): string | undefined {
  return entries.reduce<string | undefined>((m, e) => (e.lastmod && (!m || e.lastmod > m) ? e.lastmod : m), undefined);
}
