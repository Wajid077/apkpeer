export const SITE = {
  name: "APKPeer",
  url: "https://apkpeer.com",
  tagline: "Original Android apps, verified at the source",
  description:
    "APKPeer is an Android app directory that lists original, unmodified apps with verified version info, install guides and safety notes.",
  logo: "/logo.svg",
  /** Who runs the site — shown on About, Terms, Privacy and in schema. */
  operator: "APKPeer Dev Team",
  /**
   * Public contact address for general, privacy and DMCA requests.
   * Until it's set, trust pages say it's coming soon and `npm run validate:strict` fails.
   */
  contactEmail: null as string | null,
  /**
   * Web3Forms access key for the /contact form. Public by design: Web3Forms keys only
   * allow sending submissions to the owner's inbox, so it's safe in client code.
   */
  contactFormKey: "9772febc-2b38-4be6-b170-c1a756a78e93" as string | null,
  // Add the real profiles once they exist; empty entries are dropped from schema.
  sameAs: [] as string[],
  locale: "en_US",
};

export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http")) return path;
  const clean = path === "/" ? "" : path.replace(/\/+$/, "");
  return `${SITE.url}${clean.startsWith("/") || clean === "" ? clean : `/${clean}`}`;
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
