import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdSlot from "@/components/AdSlot";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQ from "@/components/FAQ";
import JsonLd from "@/components/JsonLd";
import QuickAnswer from "@/components/QuickAnswer";
import { ToolGrid, ToolIcon } from "@/components/ToolCard";
import { TOOL_WIDGETS } from "@/components/tools/registry";
import { renderMdx } from "@/lib/mdx";
import { toolPageSchema, type Crumb } from "@/lib/schema";
import { ogImagePath, pageMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/site";
import { TOOLS, getTool } from "@/lib/tools";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tool = getTool((await params).slug);
  if (!tool) return {};
  return pageMetadata({ title: tool.title, description: tool.description, path: `/tools/${tool.slug}`, image: ogImagePath(`tool-${tool.slug}`) });
}

export default async function ToolPage({ params }: Props) {
  const tool = getTool((await params).slug);
  if (!tool) notFound();
  const Widget = TOOL_WIDGETS[tool.slug];
  if (!Widget) throw new Error(`No widget registered for tool "${tool.slug}" in components/tools/registry.tsx`);

  const source = fs.readFileSync(path.join(process.cwd(), "content", "tools", `${tool.slug}.mdx`), "utf8");
  const body = await renderMdx(source);
  const crumbs: Crumb[] = [
    { name: "Home", path: "/" },
    { name: "Tools", path: "/tools" },
    { name: tool.name, path: `/tools/${tool.slug}` },
  ];
  const related = tool.related.map(getTool).filter((t): t is NonNullable<typeof t> => !!t);

  return (
    <div className="container-site pt-6">
      <JsonLd data={toolPageSchema(tool, tool.title, crumbs)} />
      <Breadcrumbs items={crumbs} />

      <div className="mx-auto max-w-[880px]">
        <div className="mt-6 flex items-center gap-4">
          <ToolIcon category={tool.category} />
          <h1 className="text-[28px] font-bold leading-[1.2] sm:text-[32px]">{tool.name}</h1>
        </div>
        <p className="mt-2 text-[15px] text-muted">Free · runs in your browser · nothing uploaded</p>

        <div className="mt-6">
          <QuickAnswer>{tool.summary}</QuickAnswer>
        </div>

        <div className="mt-8">
          <Widget />
        </div>

        <article className="prose mt-12">{body}</article>

        {/* Ad placement sits well below the tool's own download buttons (AdSense policy). */}
        <AdSlot slot="tool-after-article" variant="in-content" />

        <div className="mt-12">
          <FAQ items={tool.faq} />
        </div>

        <footer className="mt-12 border-t border-border pt-6 text-[15px] text-muted">
          <p>
            Last updated <time dateTime={tool.updated}>{formatDate(tool.updated)}</time> by the APKPeer Editorial Team. Read our{" "}
            <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-fg">
              privacy policy
            </Link>{" "}
            for how the site handles data.
          </p>
        </footer>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related" className="mt-16">
          <h2 id="related" className="text-[24px] font-semibold">
            More free tools
          </h2>
          <div className="mt-4">
            <ToolGrid tools={related} />
          </div>
        </section>
      )}
    </div>
  );
}
