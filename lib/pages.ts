/**
 * Static (non-app) pages. Text lives in content/pages/{slug}.mdx.
 * `updated` is the date the page text last changed — bump it by hand when you edit a page,
 * because it feeds the sitemap lastmod and the "Last updated" line.
 */
export type StaticPage = {
  path: string;
  title: string;
  /** Longer <title> for search results; the H1 keeps the short title. */
  seoTitle?: string;
  description: string;
  updated: string;
  schemaType?: "AboutPage" | "ContactPage";
};

export const TRUST_PAGES: StaticPage[] = [
  {
    path: "/about",
    title: "About APKPeer",
    seoTitle: "About APKPeer – Who We Are and How We Check Android Apps",
    description: "Who runs APKPeer, what the site does, how we choose which Android apps to list, and how to get in touch with the APKPeer Dev Team.",
    updated: "2026-11-03",
    schemaType: "AboutPage",
  },
  {
    path: "/contact",
    title: "Contact",
    seoTitle: "Contact APKPeer – Questions, Corrections and Removal Requests",
    description: "How to contact APKPeer about corrections, outdated versions, removal requests, privacy questions or anything else about the site.",
    updated: "2026-11-03",
    schemaType: "ContactPage",
  },
  {
    path: "/editorial-policy",
    title: "Editorial policy",
    description: "How APKPeer verifies Android apps: where version facts come from, how APK signatures are checked, what we never list, and how pages are updated.",
    updated: "2026-11-03",
  },
  {
    path: "/privacy-policy",
    title: "Privacy policy",
    seoTitle: "Privacy Policy – How APKPeer Handles Your Data",
    description: "What data APKPeer collects, how Google AdSense and Google Analytics use cookies on this site, your choices, and how to make a data request.",
    updated: "2026-11-03",
  },
  {
    path: "/terms",
    title: "Terms of use",
    seoTitle: "Terms of Use – Rules for Using APKPeer",
    description: "The terms for using APKPeer, including how app information and downloads are provided, links to third-party sites, and limits of liability.",
    updated: "2026-11-03",
  },
  {
    path: "/disclaimer",
    title: "Disclaimer",
    seoTitle: "Disclaimer – Trademarks, Downloads and Affiliate Links",
    description: "APKPeer is not affiliated with Google Play or the developers listed. App names, icons and trademarks belong to their owners.",
    updated: "2026-11-03",
  },
  {
    path: "/dmca",
    title: "DMCA and removal requests",
    description: "How copyright and trademark owners can ask APKPeer to remove content, what to include in a notice, and how quickly we respond.",
    updated: "2026-11-03",
  },
];

export const getTrustPage = (slug: string) => TRUST_PAGES.find((p) => p.path === `/${slug}`);
