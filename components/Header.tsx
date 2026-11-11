import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import NavLinks from "./NavLinks";
import { SearchIcon } from "./icons";
import { usedTypeHubs } from "@/lib/taxonomy";

export default function Header() {
  // Real links only: a hub appears once it has apps; Guides joins in phase 2 when /guides exists.
  const NAV = [...usedTypeHubs().map((h) => ({ href: `/category/${h.slug}`, label: h.name })), { href: "/tools", label: "Tools" }];
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/85">
      {/* Phones: nav drops to its own row so nothing overflows at 360px. */}
      <div className="container-site flex flex-wrap items-center gap-x-4 pt-1.5 sm:h-16 sm:flex-nowrap sm:gap-x-8 sm:pt-0">
        {/* No logo file yet: the wordmark "APK Peer" in Poppins 700, with the brand mark. */}
        <Link href="/" prefetch={false} className="flex min-h-11 shrink-0 items-center gap-2 text-[19px] font-bold tracking-tight text-fg" aria-label="APK Peer home">
          <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="8" fill="var(--brand-strong)" />
            <circle cx="25.5" cy="6.5" r="3.5" fill="var(--brand)" />
            <path d="M10 21.5 16 9l6 12.5M12.3 17h7.4" stroke="var(--on-brand)" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>
            APK <span className="text-accent-text">Peer</span>
          </span>
        </Link>
        <div className="order-last -ml-2.5 w-full sm:order-none sm:ml-0 sm:w-auto">
          <NavLinks items={NAV} />
        </div>
        <div className="ml-auto flex items-center">
          <Link
            href="/#search"
            prefetch={false}
            aria-label="Search apps"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-fg"
          >
            <SearchIcon />
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
