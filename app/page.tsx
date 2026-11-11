import Link from "next/link";
import { AppGrid } from "@/components/AppCard";
import SearchBox from "@/components/SearchBox";
import { ToolGrid } from "@/components/ToolCard";
import { getTool } from "@/lib/tools";
import { getAllApps, type App } from "@/lib/content";
import { popularApps, popularGames } from "@/lib/featured";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { appsInCategory, usedCategories, usedTypeHubs } from "@/lib/taxonomy";

export const metadata = pageMetadata({
  title: `${SITE.name} – Original Android APKs, Verified at the Source`,
  description:
    "Download original Android apps and games from the official source. Verified versions, install guides and honest safety notes for every app on APKPeer.",
  path: "/",
});

function SectionHead({ id, title, href, linkLabel }: { id: string; title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <h2 id={id} className="text-[24px] font-semibold leading-[1.3]">
        {title}
      </h2>
      {href && (
        <Link href={href} prefetch={false} className="text-[15px] font-medium text-accent-text hover:underline">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

function Section({ id, title, href, linkLabel, apps }: { id: string; title: string; href?: string; linkLabel?: string; apps: App[] }) {
  if (!apps.length) return null;
  return (
    <section aria-labelledby={id} className="container-site mt-12 lg:mt-16">
      <SectionHead id={id} title={title} href={href} linkLabel={linkLabel} />
      <div className="mt-5">
        <AppGrid apps={apps} heading="h3" />
      </div>
    </section>
  );
}

const HOME_TOOLS = ["qr-code-generator", "image-converter", "image-compressor", "apk-hash-checker", "png-to-jpg", "password-generator"];

export default function HomePage() {
  const all = getAllApps();
  const latest = all.slice(0, 12);
  const shown = new Set(latest.map((a) => a.slug));
  // Skip a "popular" block when every app in it is already in Latest updates — no repeated grids.
  const notAllShown = (apps: App[]) => (apps.every((a) => shown.has(a.slug)) ? [] : apps);
  const hubs = new Set(usedTypeHubs().map((h) => h.slug));
  const categories = usedCategories();

  return (
    <>
      {/* Hero band: surface-warm with decorative brand shapes (aria-hidden, no layout impact). */}
      <section className="ap-band relative overflow-hidden border-b border-border">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand opacity-25" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 right-40 hidden h-40 w-40 rounded-[40px] bg-brand opacity-15 rotate-12 md:block" />
        <div className="container-site relative py-12 lg:py-16">
          <h1 className="max-w-[18ch] text-[clamp(2rem,5vw,3rem)] font-bold leading-[1.1] tracking-tight">Original Android apps, verified at the source</h1>
          <p className="mt-4 max-w-[60ch] text-[17px] leading-[1.7] text-body">
            Version info, install guides and safety notes for popular Android apps and games. Every download goes to Google Play or the
            developer, never a modified build.
          </p>
          <div id="search" className="mt-8 max-w-xl scroll-mt-[var(--header-offset)]">
            <SearchBox autoFocusId="home-search" />
          </div>
        </div>
      </section>

      <Section id="latest" title="Latest updates" apps={latest} />
      <Section id="popular-apps" title="Popular apps" href={hubs.has("apps") ? "/category/apps" : undefined} linkLabel="All apps →" apps={notAllShown(popularApps())} />
      <Section id="popular-games" title="Popular games" href={hubs.has("games") ? "/category/games" : undefined} linkLabel="All games →" apps={notAllShown(popularGames())} />

      <section aria-labelledby="tools" className="ap-band mt-12 border-y border-border py-12 lg:mt-16 lg:py-16">
        <div className="container-site">
          <SectionHead id="tools" title="Free tools" href="/tools" linkLabel="All tools →" />
          <p className="mt-1 text-[15px] text-muted">They run in your browser, so your files never leave your device.</p>
          <div className="mt-5">
            <ToolGrid tools={HOME_TOOLS.map((s) => getTool(s)!).filter(Boolean)} />
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section aria-labelledby="categories" className="container-site mt-12 lg:mt-16">
          <SectionHead id="categories" title="Browse by category" />
          <ul className="mt-5 flex flex-wrap gap-2">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/category/${c.slug}`} prefetch={false} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-4 text-[15px] font-medium text-fg shadow-card hover:border-border-strong">
                  {c.name}
                  <span className="text-[13px] text-muted">{appsInCategory(c.slug).length}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="container-site mt-12 lg:mt-16">
        <section aria-labelledby="how" className="rounded-[var(--radius)] border border-border bg-card p-6 shadow-card sm:p-8">
          <h2 id="how" className="text-[24px] font-semibold leading-[1.3]">
            How APKPeer checks apps
          </h2>
          <p className="mt-2 max-w-[70ch] text-body">
            We list the original app only. Version numbers, release dates and requirements come from the developer or Google Play, and
            anything we can&apos;t confirm is left out instead of guessed. When we host an APK ourselves, its signing certificate has to
            match the developer&apos;s.{" "}
            <Link href="/editorial-policy" prefetch={false} className="text-accent-text underline underline-offset-2">
              Read the editorial policy
            </Link>
            .
          </p>
        </section>
      </div>
    </>
  );
}
