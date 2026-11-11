import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppGrid } from "./AppCard";
import Breadcrumbs from "./Breadcrumbs";
import JsonLd from "./JsonLd";
import { collectionSchema, type Crumb } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";
import { TYPE_HUBS, archiveExtraWords, archiveFaqs, archivePath, getArchive, isThinArchive, newestUpdate, pageCount, paginate, type Archive } from "@/lib/taxonomy";
import { formatDate } from "@/lib/site";
import FAQ from "./FAQ";

function crumbsFor(ar: Archive, page: number): Crumb[] {
  const base = `/category/${ar.slug}`;
  const crumbs: Crumb[] = [{ name: "Home", path: "/" }];
  if (ar.kind === "category") {
    const hub = TYPE_HUBS.find((h) => h.type === ar.apps[0]?.type);
    if (hub) crumbs.push({ name: hub.name, path: `/category/${hub.slug}` });
  }
  crumbs.push({ name: ar.name, path: base });
  if (page > 1) crumbs.push({ name: `Page ${page}`, path: archivePath(base, page) });
  return crumbs;
}

function titleFor(ar: Archive, page: number): string {
  const suffix = `${page > 1 ? ` (Page ${page})` : ""} | APKPeer`;
  const full = `${ar.heading} – Original APKs${suffix}`;
  // Keep titles within ~65 characters so search results don't truncate them.
  return full.length <= 65 ? full : `${ar.heading}${suffix}`;
}

function descriptionFor(ar: Archive, page = 1): string {
  const base = `Original Android ${ar.noun}: verified versions, release notes, install guides and safety notes. Downloads go to Google Play or the developer.`;
  return page > 1 ? `${base} Page ${page} of ${pageCount(ar.apps.length)}.` : base;
}

export function archiveMetadata(slug: string, page: number): Metadata {
  const ar = getArchive(slug);
  if (!ar) return {};
  return pageMetadata({
    title: titleFor(ar, page),
    description: descriptionFor(ar, page),
    path: archivePath(`/category/${ar.slug}`, page),
    noindex: isThinArchive(ar.intro, paginate(ar.apps, page).length, archiveExtraWords(ar, paginate(ar.apps, page), page)),
  });
}

export default function ArchiveView({ slug, page }: { slug: string; page: number }) {
  const ar = getArchive(slug);
  if (!ar) notFound();
  const pages = pageCount(ar.apps.length);
  if (page < 1 || page > pages) notFound();

  const base = `/category/${ar.slug}`;
  const items = paginate(ar.apps, page);
  const crumbs = crumbsFor(ar, page);
  const h1 = ar.heading;
  const faqs = page === 1 ? archiveFaqs(ar) : [];
  const showTable = page === 1 && ar.kind === "category";

  return (
    <div className="container-site pt-6">
      <JsonLd
        data={collectionSchema({
          name: titleFor(ar, page),
          description: descriptionFor(ar, page),
          path: archivePath(base, page),
          apps: items,
          crumbs,
          dateModified: newestUpdate(ar.apps),
        })}
      />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-[28px] font-bold sm:text-[32px]">
        {h1}
        {page > 1 && <span className="text-muted"> · page {page}</span>}
      </h1>
      {page === 1 && <p className="mt-4 max-w-[70ch] text-[17px] text-muted">{ar.intro}</p>}

      {ar.children.length > 0 && (
        <nav aria-label="Categories" className="mt-8">
          <ul className="flex flex-wrap gap-2">
            {ar.children.map((c) => (
              <li key={c.slug}>
                <Link href={`/category/${c.slug}`} className="inline-flex min-h-11 items-center rounded-full border border-border px-4 hover:bg-surface">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <section aria-labelledby="list" className="mt-10">
        <h2 id="list" className="text-[24px] font-semibold">
          {ar.apps.length} {ar.apps.length === 1 ? (ar.apps[0].type === "game" ? "game" : "app") : ar.apps[0]?.type === "game" ? "games" : "apps"}, latest updates first
        </h2>
        <div className="mt-4">
          <AppGrid apps={items} />
        </div>
      </section>

      {showTable && (
        <section aria-labelledby="compare" className="mt-12">
          <h2 id="compare" className="text-[24px] font-semibold">
            {ar.name} {ar.apps[0]?.type === "game" ? "games" : "apps"} compared
          </h2>
          <p className="mt-1 text-[15px] text-muted">From each app's Google Play listing or developer site. Blank cells weren't verified.</p>
          <div className="mt-4 overflow-x-auto rounded-[var(--radius)] border border-border bg-card">
            <table className="w-full min-w-[640px] border-collapse text-[15px]">
              <caption className="sr-only">Comparison of {ar.noun}</caption>
              <thead>
                <tr className="border-b border-border text-left">
                  {["App", "Developer", "Latest version", "Updated", "Android", "Price"].map((h) => (
                    <th key={h} scope="col" className="px-3 py-2.5 font-semibold text-fg">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((a) => (
                  <tr key={a.slug} className="border-b border-border last:border-0">
                    <th scope="row" className="px-3 py-2.5 text-left font-medium">
                      <Link href={`/app/${a.slug}`} prefetch={false} className="text-accent-text hover:underline">{a.shortName}</Link>
                    </th>
                    <td className="px-3 py-2.5">{a.developer.name}</td>
                    <td className="px-3 py-2.5">{a.latest.version}</td>
                    <td className="px-3 py-2.5">{formatDate(a.latest.releaseDate)}</td>
                    <td className="px-3 py-2.5">{a.minAndroid ? `${a.minAndroid}+` : ""}</td>
                    <td className="px-3 py-2.5">{a.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <div className="mt-12 max-w-[75ch]">
          <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }} />
          <FAQ items={faqs} />
        </div>
      )}

      {pages > 1 && (
        <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center gap-2">
          {page > 1 && (
            <Link href={archivePath(base, page - 1)} rel="prev" className="inline-flex min-h-11 items-center rounded-md border border-border px-4 hover:bg-surface">
              ← Previous
            </Link>
          )}
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) =>
            p === page ? (
              <span key={p} aria-current="page" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md bg-accent font-semibold text-accent-contrast">
                {p}
              </span>
            ) : (
              <Link key={p} href={archivePath(base, p)} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border hover:bg-surface">
                {p}
              </Link>
            ),
          )}
          {page < pages && (
            <Link href={archivePath(base, page + 1)} rel="next" className="inline-flex min-h-11 items-center rounded-md border border-border px-4 hover:bg-surface">
              Next →
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
