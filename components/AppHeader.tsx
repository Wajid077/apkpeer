import Link from "next/link";
import type { App } from "@/lib/content";
import { developerHasPage, hasVersionNumber, isVerified, primaryDownload } from "@/lib/content";
import { getCategory } from "@/lib/categories";
import AppIcon from "./AppIcon";
import VerifiedBadge from "./VerifiedBadge";
import { DownloadIcon, PlayStoreIcon } from "./icons";

export default function AppHeader({ app }: { app: App }) {
  const category = getCategory(app.category);
  const devHref = developerHasPage(app.developer.slug) ? `/developer/${app.developer.slug}` : null;
  const verified = isVerified(app);
  const dl = primaryDownload(app);

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
      <AppIcon src={app.icon} name={app.shortName} size={96} priority />
      <div className="min-w-0 flex-1">
        <h1 className="text-[28px] font-bold leading-[1.2] sm:text-[32px]">
          {app.name} APK{hasVersionNumber(app) && <span className="text-muted"> {app.latest.version}</span>}
        </h1>
        <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] text-muted">
          {devHref ? (
            <Link href={devHref} className="font-medium text-accent-text hover:underline">
              {app.developer.name}
            </Link>
          ) : (
            <a href={app.developer.url} rel="noopener" className="font-medium text-accent-text hover:underline">
              {app.developer.name}
            </a>
          )}
          <span aria-hidden="true">·</span>
          <Link href={`/category/${app.category}`} className="hover:text-fg hover:underline">
            {category?.name}
          </Link>
          {verified && <VerifiedBadge />}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href={dl.href}
            rel="noopener"
            className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius)] bg-accent px-5 font-semibold text-accent-contrast hover:bg-accent-hover"
          >
            <PlayStoreIcon width={18} height={18} />
            {dl.label}
          </a>
          {verified && (
            <Link
              href={`/app/${app.slug}/download`}
              className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius)] border border-border px-5 font-semibold hover:bg-surface"
            >
              <DownloadIcon width={18} height={18} />
              Download APK
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
