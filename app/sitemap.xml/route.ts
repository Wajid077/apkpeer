import { SITEMAPS, lastmodOf } from "@/lib/sitemaps";
import { sitemapIndex, xmlResponse } from "@/lib/xml";

export const dynamic = "force-static";

export function GET() {
  const maps = Object.entries(SITEMAPS)
    .map(([file, build]) => ({ file, entries: build() }))
    .filter((m) => m.entries.length > 0)
    .map((m) => ({ path: `/${m.file}`, lastmod: lastmodOf(m.entries) }));
  return xmlResponse(sitemapIndex(maps));
}
