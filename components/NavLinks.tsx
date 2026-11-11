"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Main nav with the design system's active state: ink text over a brand-orange underline. */
export default function NavLinks({ items }: { items: { href: string; label: string }[] }) {
  const path = usePathname() ?? "/";
  return (
    <nav aria-label="Main" className="flex items-center gap-1 text-[15px] font-medium">
      {items.map((n) => {
        const active = path === n.href || path.startsWith(n.href + "/");
        return (
          <Link
            key={n.href}
            href={n.href}
            prefetch={false}
            aria-current={active ? "page" : undefined}
            className={`relative inline-flex min-h-11 items-center rounded-md px-2.5 ${
              active
                ? "text-fg after:absolute after:inset-x-2.5 after:bottom-1 after:h-[3px] after:rounded-full after:bg-brand"
                : "text-muted hover:text-fg"
            }`}
          >
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}
