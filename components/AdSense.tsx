"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Loads AdSense after the page is idle (lazyOnload, brief §7) and fills every <AdSlot>.
 * Runs again on each client-side navigation, because Next.js swaps pages without a reload.
 * Renders nothing until NEXT_PUBLIC_ADSENSE_CLIENT (ca-pub-…) is set at build time.
 */
export default function AdSense() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const pathname = usePathname();

  useEffect(() => {
    if (!client) return;
    // The queue works before the library loads; it processes pushes once it arrives.
    const queue = (window.adsbygoogle = window.adsbygoogle || []);
    document.querySelectorAll("ins.adsbygoogle:not([data-adsbygoogle-status])").forEach(() => {
      try {
        queue.push({});
      } catch {
        /* a slot that can't be filled shouldn't break the page */
      }
    });
  }, [client, pathname]);

  if (!client) return null;
  return (
    <Script
      id="adsense"
      strategy="lazyOnload"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
    />
  );
}
