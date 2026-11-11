import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import VerifiedBadge from "@/components/VerifiedBadge";
import { DownloadIcon, PlayStoreIcon } from "@/components/icons";
import { getAllApps, getApp, isVerified } from "@/lib/content";
import type { Crumb } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/site";
import { PLACEHOLDER, orPlaceholder } from "@/lib/static-params";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

// Only apps with a verified self-hosted file get a download page (brief §3).
export function generateStaticParams() {
  return orPlaceholder(getAllApps().filter(isVerified).map((a) => ({ slug: a.slug })), ["slug"]);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const app = getApp((await params).slug);
  if (!app) return {};
  return pageMetadata({
    title: `Download ${app.shortName} APK ${app.latest.version} | APKPeer`,
    description: `Direct download of the original ${app.name} APK ${app.latest.version}, with its SHA-256 and signing certificate fingerprint so you can verify the file.`,
    path: `/app/${app.slug}/download`,
    noindex: true,
  });
}

function Hash({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-3">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-1 break-all font-mono text-sm">{value}</dd>
    </div>
  );
}

export default async function DownloadPage({ params }: Props) {
  const slug = (await params).slug;
  if (slug === PLACEHOLDER) notFound();
  const app = getApp(slug);
  if (!app || !isVerified(app)) notFound();

  const v = app.latest;
  const fileName = `${app.slug}-${v.version}.apk`;
  const crumbs: Crumb[] = [
    { name: "Home", path: "/" },
    { name: app.shortName, path: `/app/${app.slug}` },
    { name: "Download", path: `/app/${app.slug}/download` },
  ];

  return (
    <div className="container-site pt-6">
      <Breadcrumbs items={crumbs} />
      <div className="mx-auto max-w-[var(--content-w)]">
        <h1 className="mt-6 text-[28px] font-bold tracking-tight">
          Download {app.shortName} APK {v.version}
        </h1>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-muted">
          Original build by {app.developer.name} · released <time dateTime={v.releaseDate}>{formatDate(v.releaseDate)}</time>
          <VerifiedBadge />
        </p>

        <dl className="mt-8 divide-y divide-border rounded-[var(--radius)] border border-border px-4">
          <Hash label="File name" value={fileName} />
          {v.size && <Hash label="Size" value={v.size} />}
          <Hash label="SHA-256 of the file" value={v.sha256!} />
          <Hash label="Signing certificate SHA-256" value={v.certSha256!} />
        </dl>

        {/* A plain link: no countdown, no interstitial, no lookalike ad buttons (brief §3). */}
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={v.fileUrl!}
            download={fileName}
            className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius)] bg-accent px-5 font-semibold text-accent-contrast hover:bg-accent-hover"
          >
            <DownloadIcon width={18} height={18} />
            Download APK ({fileName})
          </a>
          {app.playStoreUrl && <a href={app.playStoreUrl} rel="noopener" className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius)] border border-border px-5 font-semibold hover:bg-surface">
            <PlayStoreIcon width={18} height={18} />
            Google Play instead
          </a>}
        </div>

        <section aria-labelledby="install" className="prose mt-12">
          <h2 id="install">How to install it</h2>
          <ol>
            <li>Download the file above. Your browser may warn that APK files can harm your device; that warning appears for every APK.</li>
            <li>
              Optional but recommended: check that the file&apos;s SHA-256 matches the one on this page. On a computer, run{" "}
              <code>sha256sum {fileName}</code> (Linux/macOS) or <code>certutil -hashfile {fileName} SHA256</code> (Windows).
            </li>
            <li>Open the file from your notifications or the Downloads app.</li>
            <li>If Android asks, allow your browser or file manager to <strong>Install unknown apps</strong>, then tap <strong>Install</strong>.</li>
            <li>
              Turn the permission back off afterwards: <strong>Settings → Apps → Special app access → Install unknown apps</strong>, pick the
              app you used, and switch it off.
            </li>
          </ol>
          <p>
            Because the signing certificate matches {app.developer.name}&apos;s, Android will treat this as the same app as the Play Store
            version, so future updates from Google Play install over it normally.{" "}
            <Link href={`/app/${app.slug}`}>Back to the {app.shortName} page</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
