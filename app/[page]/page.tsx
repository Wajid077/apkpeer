import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import { renderMdx } from "@/lib/mdx";
import { TRUST_PAGES, getTrustPage } from "@/lib/pages";
import { webPageSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";
import { SITE, formatDate } from "@/lib/site";

type Props = { params: Promise<{ page: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return TRUST_PAGES.map((p) => ({ page: p.path.slice(1) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getTrustPage((await params).page);
  if (!p) return {};
  const title = p.seoTitle ?? (p.title.includes(SITE.name) ? p.title : `${p.title} | ${SITE.name}`);
  return pageMetadata({ title, description: p.description, path: p.path });
}

export default async function TrustPage({ params }: Props) {
  const slug = (await params).page;
  const p = getTrustPage(slug);
  if (!p) notFound();
  const source = fs.readFileSync(path.join(process.cwd(), "content", "pages", `${slug}.mdx`), "utf8");

  return (
    <div className="container-site pt-12">
      <JsonLd data={webPageSchema({ name: p.title, path: p.path, dateModified: p.updated, type: p.schemaType })} />
      <article className="mx-auto max-w-[var(--content-w)]">
        <h1 className="text-[28px] font-bold sm:text-[32px]">{p.title}</h1>
        <p className="mt-2 text-sm text-muted">
          Last updated <time dateTime={p.updated}>{formatDate(p.updated)}</time>
        </p>
        <div className="prose mt-8">{await renderMdx(source)}</div>
      </article>
    </div>
  );
}
