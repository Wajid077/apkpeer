import { absoluteUrl } from "./site";

export function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export type SitemapEntry = {
  path: string;
  /** Real content date (YYYY-MM-DD). Never the build time — brief §5.3. */
  lastmod?: string;
  images?: { src: string; title?: string }[];
};

export function urlset(entries: SitemapEntry[]): string {
  const body = entries
    .map((e) => {
      const images = (e.images ?? [])
        .map(
          (img) =>
            `<image:image><image:loc>${escapeXml(absoluteUrl(img.src))}</image:loc>${
              img.title ? `<image:title>${escapeXml(img.title)}</image:title>` : ""
            }</image:image>`,
        )
        .join("");
      return `<url><loc>${escapeXml(absoluteUrl(e.path))}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ""}${images}</url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${body}
</urlset>
`;
}

export function sitemapIndex(maps: { path: string; lastmod?: string }[]): string {
  const body = maps
    .map(
      (m) =>
        `<sitemap><loc>${escapeXml(absoluteUrl(m.path))}</loc>${m.lastmod ? `<lastmod>${m.lastmod}</lastmod>` : ""}</sitemap>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</sitemapindex>
`;
}

export function xmlResponse(xml: string, type = "application/xml"): Response {
  return new Response(xml, { headers: { "Content-Type": `${type}; charset=utf-8` } });
}
