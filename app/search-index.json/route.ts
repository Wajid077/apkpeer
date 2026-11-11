import { getCategory } from "@/lib/categories";
import { getAllApps, iconSrc } from "@/lib/content";
import { TOOLS } from "@/lib/tools";

export const dynamic = "force-static";

/** p = page path, n = name, d = developer or tagline, c = category, v = version, i = icon (empty for tools), k = extra match terms. */
export type SearchItem = { p: string; n: string; d: string; c: string; v: string; i: string; k: string };

/** Tiny static index fetched by SearchBox on first focus (brief §3). */
export function GET() {
  const items: SearchItem[] = getAllApps().map((a) => ({
    p: `/app/${a.slug}`,
    n: a.name,
    d: a.developer.name,
    c: getCategory(a.category)?.name ?? "",
    v: /\d/.test(a.latest.version) ? a.latest.version : "",
    i: iconSrc(a.icon, 36),
    // Extra match terms: short name, package, keywords.
    k: [a.shortName, a.packageName, a.primaryKeyword, ...a.secondaryKeywords].join(" ").toLowerCase(),
  }));
  for (const t of TOOLS) {
    items.push({ p: `/tools/${t.slug}`, n: t.name, d: t.tagline, c: "Free tool", v: "", i: "", k: `${t.slug.replace(/-/g, " ")} tool online free` });
  }
  return Response.json(items);
}
