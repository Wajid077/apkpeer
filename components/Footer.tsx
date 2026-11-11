import Link from "next/link";
import { TRUST_PAGES } from "@/lib/pages";
import { TOOLS, getTool } from "@/lib/tools";

/** A short list keeps the footer usable; /tools links to every tool. */
const FOOTER_TOOLS = [
  "qr-code-generator",
  "image-converter",
  "image-compressor",
  "what-is-my-device",
  "apk-hash-checker",
  "password-generator",
  "age-calculator",
  "percentage-calculator",
];
import { usedCategories } from "@/lib/taxonomy";

const TRUST = TRUST_PAGES.map((p) => ({ href: p.path, label: p.title.replace(/^About APKPeer$/, "About") }));

export default function Footer() {
  // Only link categories that have at least one published app — no empty pages.
  const cats = usedCategories();

  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="container-site grid gap-10 py-12 text-[15px] sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-bold">APKPeer</p>
          <p className="mt-2 max-w-xs text-muted">
            An Android app directory that lists original, unmodified apps only. Downloads point to Google Play or the
            developer.
          </p>
        </div>
        <nav aria-label="Site information">
          <p className="font-semibold">Site</p>
          <ul className="mt-2 space-y-1">
            {TRUST.map((l) => (
              <li key={l.href}>
                <Link href={l.href} prefetch={false} className="inline-flex min-h-11 items-center text-muted hover:text-fg">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Free tools">
          <p className="font-semibold">
            <Link href="/tools" prefetch={false} className="hover:underline">
              Free tools
            </Link>
          </p>
          <ul className="mt-2 space-y-1">
            {FOOTER_TOOLS.map((slug) => getTool(slug)!).map((t) => (
              <li key={t.slug}>
                <Link href={`/tools/${t.slug}`} prefetch={false} className="inline-flex min-h-11 items-center text-muted hover:text-fg">
                  {t.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/tools" prefetch={false} className="inline-flex min-h-11 items-center font-medium text-accent-text hover:underline">
                All {TOOLS.length} tools →
              </Link>
            </li>
          </ul>
        </nav>
        {cats.length > 0 && (
          <nav aria-label="Categories">
            <p className="font-semibold">Categories</p>
            <ul className="mt-2 space-y-1">
              {cats.map((c) => (
                <li key={c.slug}>
                  <Link href={`/category/${c.slug}`} prefetch={false} className="inline-flex min-h-11 items-center text-muted hover:text-fg">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
      <div className="container-site border-t border-border py-6 text-sm text-muted">
        © {new Date().getFullYear()} APKPeer. App names and icons are trademarks of their owners. APKPeer is not
        affiliated with Google Play or the developers listed.
      </div>
    </footer>
  );
}
