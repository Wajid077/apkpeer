import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import { ToolGrid } from "@/components/ToolCard";
import { breadcrumbSchema, type Crumb } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { TOOLS, TOOL_CATEGORIES, toolsInCategory, type ToolCategory } from "@/lib/tools";

const title = "Free Online Tools – Image, QR & File Tools | APKPeer";
const description =
  "Free tools that run in your browser: image converter, compressor and resizer, QR code generator and scanner, APK hash checker and more. Nothing uploaded.";

export const metadata = pageMetadata({ title, description, path: "/tools" });

const crumbs: Crumb[] = [
  { name: "Home", path: "/" },
  { name: "Tools", path: "/tools" },
];

export default function ToolsPage() {
  return (
    <div className="container-site pt-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              "@id": absoluteUrl("/tools"),
              url: absoluteUrl("/tools"),
              name: title,
              description,
              breadcrumb: { "@id": `${absoluteUrl("/tools")}#breadcrumb` },
              mainEntity: {
                "@type": "ItemList",
                numberOfItems: TOOLS.length,
                itemListElement: TOOLS.map((t, i) => ({ "@type": "ListItem", position: i + 1, url: absoluteUrl(`/tools/${t.slug}`), name: t.name })),
              },
              inLanguage: "en",
            },
            breadcrumbSchema(crumbs, `${absoluteUrl("/tools")}#breadcrumb`),
          ],
        }}
      />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-[28px] font-bold sm:text-[32px]">Free online tools</h1>
      <p className="mt-4 max-w-[70ch] text-[17px] text-muted">
        Everyday tools for your phone or computer: convert and shrink images, make and read QR codes, check that an APK hasn&apos;t been
        tampered with, and more. Every tool runs entirely in your browser, so your files and text never leave your device. There&apos;s
        nothing to install, no sign-up, no watermark and no daily limit. Pick a tool below; each page explains how it works and answers
        the common questions about it.
      </p>

      {(Object.keys(TOOL_CATEGORIES) as ToolCategory[]).map((c) => (
        <section key={c} aria-labelledby={`cat-${c}`} className="mt-12">
          <h2 id={`cat-${c}`} className="text-[24px] font-semibold">
            {TOOL_CATEGORIES[c]}
          </h2>
          <div className="mt-4">
            <ToolGrid tools={toolsInCategory(c)} />
          </div>
        </section>
      ))}
    </div>
  );
}
