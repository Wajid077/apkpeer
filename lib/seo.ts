import type { Metadata } from "next";
import { hasVersionNumber, type App } from "./content";
import { SITE, absoluteUrl } from "./site";

const SUFFIX = ` | ${SITE.name}`;

/** Brief §5.1: "{Name} APK {version} – Download for Android | APKPeer", ≤ 60 chars, drop version if it overflows. */
export function appTitle(app: App): string {
  const withVersion = `${app.shortName} APK ${app.latest.version} – Download for Android${SUFFIX}`;
  if (hasVersionNumber(app) && withVersion.length <= 60) return withVersion;
  return `${app.shortName} APK – Download for Android${SUFFIX}`;
}

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  image?: string;
  type?: "website" | "article";
};

/** 1200×630 card generated at build time by app/og/[file]/route.tsx. */
export const ogImagePath = (slug = "default") => `/og/${slug}.png`;

export function pageMetadata({ title, description, path, noindex, image = ogImagePath(), type = "website" }: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  const img = absoluteUrl(image);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: { title, description, url, siteName: SITE.name, type, locale: SITE.locale, images: [{ url: img, width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title, description, images: [img] },
  };
}
