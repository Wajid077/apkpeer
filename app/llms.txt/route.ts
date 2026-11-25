import { getAllApps } from "@/lib/content";
import { TRUST_PAGES } from "@/lib/pages";
import { TOOLS } from "@/lib/tools";
import { SITE, absoluteUrl } from "@/lib/site";
import { appsInCategory, usedCategories, usedTypeHubs } from "@/lib/taxonomy";

export const dynamic = "force-static";

/** Plain-text site overview for AI answer engines (brief §6). */
export function GET() {
  const apps = getAllApps();
  const line = (title: string, path: string, note?: string) => `- [${title}](${absoluteUrl(path)})${note ? `: ${note}` : ""}`;

  const text = `# ${SITE.name}

> ${SITE.description}

## Content policy

- APKPeer lists original, unmodified Android apps and games only.
- It never lists or links to altered or repackaged APKs, cracked builds, cheats, cheat menus, piracy streaming apps, or unofficial clones of social apps.
- Download buttons go to Google Play or the developer's official site. A self-hosted APK is offered only when its SHA-256 and signing certificate match the developer's official build.
- Version numbers, sizes, release dates and Android requirements come from the developer or Google Play. Facts that can't be verified are left out rather than estimated.
- No ratings, download counts or test results are invented.

## Sections

${[
  ...usedTypeHubs().map((h) => line(h.name, `/category/${h.slug}`)),
  ...usedCategories().map((c) => line(c.name, `/category/${c.slug}`, `${appsInCategory(c.slug).length} listed`)),
].join("\n")}

## App and game pages

${apps.map((a) => line(`${a.name} APK`, `/app/${a.slug}`, `${a.developer.name}${/\d/.test(a.latest.version) ? `, version ${a.latest.version}` : ""}, updated ${a.updated}`)).join("\n")}

## Free browser tools (files never leave the device)

${TOOLS.map((t) => line(t.name, `/tools/${t.slug}`, t.tagline)).join("\n")}

## About this site

${TRUST_PAGES.map((p) => line(p.title, p.path)).join("\n")}
`;
  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
