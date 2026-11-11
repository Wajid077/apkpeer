import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdSlot from "@/components/AdSlot";
import AppHeader from "@/components/AppHeader";
import { AppGrid } from "@/components/AppCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQ from "@/components/FAQ";
import InfoTable from "@/components/InfoTable";
import JsonLd from "@/components/JsonLd";
import QuickAnswer from "@/components/QuickAnswer";
import Screenshots from "@/components/Screenshots";
import TOC from "@/components/TOC";
import VersionList from "@/components/VersionList";
import { getCategory } from "@/lib/categories";
import { getAllApps, getApp, getAppBody, getRelatedApps } from "@/lib/content";
import { extractHeadings, renderMdx } from "@/lib/mdx";
import { appPageSchema, type Crumb } from "@/lib/schema";
import { appTitle, ogImagePath, pageMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllApps().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const app = getApp((await params).slug);
  if (!app) return {};
  return pageMetadata({
    title: appTitle(app),
    description: app.metaDescription,
    path: `/app/${app.slug}`,
    image: ogImagePath(app.slug),
  });
}

export default async function AppPage({ params }: Props) {
  const app = getApp((await params).slug);
  if (!app) notFound();

  const category = getCategory(app.category)!;
  const crumbs: Crumb[] = [
    { name: "Home", path: "/" },
    { name: app.type === "game" ? "Games" : "Apps", path: `/category/${app.type === "game" ? "games" : "apps"}` },
    { name: category.name, path: `/category/${category.slug}` },
    { name: app.shortName, path: `/app/${app.slug}` },
  ];
  const source = getAppBody(app.slug);
  const headings = extractHeadings(source);
  const body = await renderMdx(source);
  const related = getRelatedApps(app);

  return (
    <div className="container-site pt-6">
      <JsonLd data={appPageSchema(app, appTitle(app), crumbs)} />
      <Breadcrumbs items={crumbs} />

      <div className="mt-6 grid gap-12 lg:grid-cols-[minmax(0,720px)_300px] lg:justify-between">
        <article className="min-w-0">
          <AppHeader app={app} />

          <div className="mt-8 space-y-8">
            <QuickAnswer>{app.summary}</QuickAnswer>
            <section aria-label={`${app.shortName} details`}>
              <InfoTable app={app} />
            </section>
          </div>

          {/* No ads beside real-money gambling content (Google publisher restrictions). */}
          {app.category !== "casino" && <AdSlot slot="app-after-info" variant="in-content" />}

          <div className="mt-10 space-y-10">
            <Screenshots app={app} />
            <TOC headings={headings} />
          </div>

          <div className="prose mt-4">{body}</div>

          <div className="mt-12 space-y-12">
            <VersionList app={app} />
            <FAQ items={app.faq} />
          </div>

          <footer className="mt-12 border-t border-border pt-6 text-[15px] text-muted">
            <p>
              Last reviewed by {app.reviewedBy} on{" "}
              <time dateTime={app.updated}>{formatDate(app.updated)}</time>. Read how we verify apps in our{" "}
              <Link href="/editorial-policy" className="underline underline-offset-2 hover:text-fg">
                editorial policy
              </Link>
              .
            </p>
            <p className="mt-2">
              Sources:{" "}
              {app.sources.map((s, i) => (
                <span key={s}>
                  {i > 0 && ", "}
                  <a href={s} rel="noopener" className="underline underline-offset-2 hover:text-fg">
                    {new URL(s).hostname.replace(/^www\./, "")}
                  </a>
                </span>
              ))}
            </p>
          </footer>
        </article>

        <aside className="hidden lg:block" aria-label="App summary">
          <div className="sticky top-20 space-y-8">
            <div className="rounded-[var(--radius)] border border-border p-4">
              <p className="font-semibold">{app.shortName} at a glance</p>
              <div className="mt-2">
                <InfoTable app={app} compact />
              </div>
            </div>
            {related.length > 0 && (
              <div>
                <p className="mb-3 font-semibold">Similar apps</p>
                <AppGrid apps={related.slice(0, 4)} compact />
              </div>
            )}
            {app.category !== "casino" && <AdSlot slot="app-sidebar" variant="sidebar" />}
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related" className="mt-16">
          <h2 id="related" className="text-[24px] font-semibold">
            More {category.name.toLowerCase()} like {app.shortName}
          </h2>
          <div className="mt-4">
            <AppGrid apps={related} />
          </div>
        </section>
      )}
    </div>
  );
}
