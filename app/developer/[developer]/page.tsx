import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppGrid } from "@/components/AppCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import { developerIntro } from "@/lib/developers";
import { collectionSchema, type Crumb } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";
import { PLACEHOLDER, orPlaceholder } from "@/lib/static-params";
import { getDevelopers, isThinArchive, newestUpdate } from "@/lib/taxonomy";

type Props = { params: Promise<{ developer: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return orPlaceholder(getDevelopers().map((d) => ({ developer: d.slug })), ["developer"]);
}

const find = (slug: string) => getDevelopers().find((d) => d.slug === slug);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const d = find((await params).developer);
  if (!d) return {};
  return pageMetadata({
    title: `${d.name} Apps for Android – Original APKs | APKPeer`,
    description: `Every ${d.name} app on APKPeer, with the latest versions, release notes, install guides and safety notes. Downloads go to Google Play or the developer.`,
    path: `/developer/${d.slug}`,
    noindex: isThinArchive(developerIntro(d), d.apps.length),
  });
}

export default async function DeveloperPage({ params }: Props) {
  const slug = (await params).developer;
  if (slug === PLACEHOLDER) notFound();
  const d = find(slug);
  if (!d) notFound();

  const path = `/developer/${d.slug}`;
  const crumbs: Crumb[] = [
    { name: "Home", path: "/" },
    { name: d.name, path },
  ];

  return (
    <div className="container-site pt-6">
      <JsonLd
        data={collectionSchema({ name: `${d.name} apps`, description: developerIntro(d), path, apps: d.apps, crumbs, dateModified: newestUpdate(d.apps) })}
      />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-[28px] font-bold sm:text-[32px]">{d.name} apps for Android</h1>
      <p className="mt-4 max-w-[70ch] text-[17px] text-muted">{developerIntro(d)}</p>
      <p className="mt-3">
        <a href={d.url} rel="noopener" className="font-medium text-accent-text hover:underline">
          {d.name} official website →
        </a>
      </p>
      <section aria-labelledby="list" className="mt-10">
        <h2 id="list" className="text-[24px] font-semibold">
          {d.apps.length} apps by {d.name}
        </h2>
        <div className="mt-4">
          <AppGrid apps={d.apps} />
        </div>
      </section>
    </div>
  );
}
