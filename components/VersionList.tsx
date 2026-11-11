import Link from "next/link";
import type { App } from "@/lib/content";
import { hasVersionArchive } from "@/lib/content";
import { formatDate } from "@/lib/site";

export default function VersionList({ app }: { app: App }) {
  const all = [app.latest, ...app.versions].slice(0, 5);
  return (
    <section aria-labelledby="version-history">
      <h2 id="version-history" className="text-[24px] font-semibold">
        Version history
      </h2>
      <ol className="mt-4 divide-y divide-border rounded-[var(--radius)] border border-border">
        {all.map((v, i) => (
          <li key={v.version} className="p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-semibold">
                {app.shortName} {v.version}
                {i === 0 && (
                  <span className="ml-2 rounded-full bg-surface px-2 py-0.5 text-sm font-medium text-muted">Latest</span>
                )}
              </p>
              <p className="text-sm text-muted">
                <time dateTime={v.releaseDate}>{formatDate(v.releaseDate)}</time>
                {v.size ? ` · ${v.size}` : ""}
              </p>
            </div>
            {v.changelog.length > 0 && (
              <details className="mt-2 text-[15px]">
                <summary className="text-accent-text hover:underline">What changed ({v.changelog.length})</summary>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
                  {v.changelog.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
                {v.source && (
                  <p className="mt-2 text-sm text-muted">
                    Source:{" "}
                    <a href={v.source} rel="noopener" className="underline underline-offset-2">
                      {new URL(v.source).hostname}
                    </a>
                  </p>
                )}
              </details>
            )}
          </li>
        ))}
      </ol>
      {hasVersionArchive(app) && (
        <p className="mt-3">
          <Link href={`/app/${app.slug}/versions`} className="font-medium text-accent-text hover:underline">
            All {app.shortName} versions →
          </Link>
        </p>
      )}
    </section>
  );
}
