import Link from "next/link";
import type { App } from "@/lib/content";
import { getCategory } from "@/lib/categories";
import { formatDate } from "@/lib/site";
import AppIcon from "./AppIcon";
import Badge from "./Badge";

type Heading = "h2" | "h3" | "p";

/**
 * Design-system AppCard: icon at icon-card size (64px), one-line title, real meta, type badge.
 * `heading` sets the title element so grids under an H2 get H3 names (document order, not looks).
 */
export default function AppCard({ app, compact, heading = "p" }: { app: App; compact?: boolean; heading?: Heading }) {
  const Title = heading;
  const version = /\d/.test(app.latest.version) ? `v${app.latest.version}` : null;
  return (
    <Link href={`/app/${app.slug}`} prefetch={false} className={`ap-card group flex min-w-0 items-center gap-4 p-4 ${compact ? "" : "lg:flex-col lg:items-start lg:gap-3"}`}>
      <AppIcon src={app.icon} name={app.shortName} size={compact ? 48 : 64} />
      <div className={`min-w-0 flex-1 ${compact ? "" : "lg:w-full"}`}>
        <Title className="truncate text-[15px] font-semibold leading-[1.35] text-fg group-hover:underline">{app.shortName}</Title>
        <p className="truncate text-[13px] font-medium text-muted">{app.developer.name}</p>
        {!compact && (
          <div className="mt-1.5 flex min-w-0 items-center gap-2">
            <Badge type={app.type} />
            <p className="truncate text-[13px] font-medium text-muted">
              {[version ?? getCategory(app.category)?.name, formatDate(app.updated)].filter(Boolean).join(" · ")}
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}

export function AppGrid({ apps, compact, heading }: { apps: App[]; compact?: boolean; heading?: Heading }) {
  return (
    <div className={compact ? "grid gap-3" : "grid gap-4 min-[600px]:grid-cols-2 lg:grid-cols-4 lg:gap-6"}>
      {apps.map((a) => (
        <AppCard key={a.slug} app={a} compact={compact} heading={heading} />
      ))}
    </div>
  );
}
