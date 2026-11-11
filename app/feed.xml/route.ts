import { getAllApps } from "@/lib/content";
import { SITE, absoluteUrl } from "@/lib/site";
import { escapeXml, xmlResponse } from "@/lib/xml";

export const dynamic = "force-static";

const rfc822 = (iso: string) => new Date(`${iso}T00:00:00Z`).toUTCString();

/** RSS 2.0, latest 30 updates (brief §8.7). Dates come from content, not the build clock. */
export function GET() {
  const apps = getAllApps().slice(0, 30);
  const items = apps
    .map((a) => {
      const url = absoluteUrl(`/app/${a.slug}`);
      return `<item>
<title>${escapeXml(/\d/.test(a.latest.version) ? `${a.name} ${a.latest.version}` : a.name)}</title>
<link>${url}</link>
<guid isPermaLink="false">${escapeXml(`${url}#${a.updated}`)}</guid>
<pubDate>${rfc822(a.updated)}</pubDate>
<category>${escapeXml(a.type === "game" ? "Games" : "Apps")}</category>
<description>${escapeXml(a.summary)}</description>
</item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${escapeXml(`${SITE.name} – latest app updates`)}</title>
<link>${SITE.url}</link>
<description>${escapeXml(SITE.description)}</description>
<language>en</language>
<atom:link href="${SITE.url}/feed.xml" rel="self" type="application/rss+xml"/>
${apps[0] ? `<lastBuildDate>${rfc822(apps[0].updated)}</lastBuildDate>\n` : ""}${items}
</channel>
</rss>
`;
  return xmlResponse(xml, "application/rss+xml");
}
