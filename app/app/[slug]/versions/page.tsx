import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import { getCategory } from "@/lib/categories";
import { getAllApps, getApp, hasVersionArchive } from "@/lib/content";
import { breadcrumbSchema, type Crumb } from "@/lib/schema";
import { ogImagePath, pageMetadata } from "@/lib/seo";
import { absoluteUrl, formatDate } from "@/lib/site";
import { PLACEHOLDER, orPlaceholder } from "@/lib/static-params";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

// Brief §5.7: only when 3+ versions with changelogs exist.
export function generateStaticParams() {
  return orPlaceholder(getAllApps().filter(hasVersionArchive).map((a) => ({ slug: a.slug })), ["slug"]);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const app = getApp((await params).slug);
  if (!app) return {};
  return pageMetadata({
    title: `${app.shortName} APK Version History – All Versions | APKPeer`,
    description: `Every ${app.name} release we've verified, with dates and the developer's release notes. The latest ${app.shortName} APK is ${app.latest.version}.`,
    path: `/app/${app.slug}/versions`,
    image: ogImagePath(app.slug),
  });
}

export default async function VersionsPage({ params }: Props) {
  const slug = (await params).slug;
  if (slug === PLACEHOLDER) notFound();
  const app = getApp(slug);
  if (!app || !hasVersionArchive(app)) notFound();

  const category = getCategory(app.category)!;
  const path = `/app/${app.slug}/versions`;
  const crumbs: Crumb[] = [
    { name: "Home", path: "/" },
    { name: category.name, path: `/category/${category.slug}` },
    { name: app.shortName, path: `/app/${app.slug}` },
    { name: "Versions", path },
  ];
  const all = [app.latest, ...app.versions];

  return (
    <div className="container-site pt-6">
      <JsonLd data={{ "@context": "https://schema.org", ...breadcrumbSchema(crumbs, `${absoluteUrl(path)}#breadcrumb`) }} />
      <Breadcrumbs items={crumbs} />
      <div className="mx-auto max-w-[var(--content-w)]">
        <h1 className="mt-6 text-[28px] font-bold sm:text-[32px]">{app.shortName} APK version history</h1>
        <p className="mt-3 text-[17px] text-muted">
          {all.length} versions of {app.name} by {app.developer.name}, newest first. Release notes are the developer&apos;s own.{" "}
          <Link href={`/app/${app.slug}`} className="text-accent-text underline underline-offset-2">
            Back to {app.shortName}
          </Link>
        </p>
        <ol className="mt-8 space-y-8">
          {all.map((v, i) => (
            <li key={v.version} className="border-b border-border pb-8">
              <h2 className="text-[24px] font-semibold">
                {app.shortName} {v.version}
                {i === 0 && <span className="ml-2 align-middle text-sm font-medium text-muted">Latest</span>}
              </h2>
              <p className="mt-1 text-sm text-muted">
                Released <time dateTime={v.releaseDate}>{formatDate(v.releaseDate)}</time>
                {v.size ? ` · ${v.size}` : ""}
                {v.source && (
                  <>
                    {" · "}
                    <a href={v.source} rel="noopener" className="underline underline-offset-2">
                      source
                    </a>
                  </>
                )}
              </p>
              {v.changelog.length > 0 ? (
                <ul className="mt-3 list-disc space-y-1 pl-5">
                  {v.changelog.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-muted">The developer didn&apos;t publish release notes for this version.</p>
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
