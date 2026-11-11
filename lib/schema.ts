import type { App } from "./content";
import { getCategory } from "./categories";
import { SITE, absoluteUrl } from "./site";

export type Crumb = { name: string; path: string };

const ORG_ID = `${SITE.url}/#organization`;
const SITE_ID = `${SITE.url}/#website`;

export function siteSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORG_ID,
        name: SITE.name,
        url: SITE.url,
        logo: absoluteUrl(SITE.logo),
        ...(SITE.sameAs.length ? { sameAs: SITE.sameAs } : {}),
      },
      {
        "@type": "WebSite",
        "@id": SITE_ID,
        name: SITE.name,
        url: SITE.url,
        description: SITE.description,
        publisher: { "@id": ORG_ID },
        inLanguage: "en",
      },
    ],
  };
}

export function breadcrumbSchema(crumbs: Crumb[], id: string) {
  return {
    "@type": "BreadcrumbList",
    "@id": id,
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

/** Category, hub and developer pages: CollectionPage + ItemList of the apps on that page. */
export function collectionSchema(opts: { name: string; description: string; path: string; apps: App[]; crumbs: Crumb[]; dateModified?: string }) {
  const url = absoluteUrl(opts.path);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": url,
        url,
        name: opts.name,
        description: opts.description,
        ...(opts.dateModified ? { dateModified: opts.dateModified } : {}),
        isPartOf: { "@id": SITE_ID },
        publisher: { "@id": ORG_ID },
        breadcrumb: { "@id": `${url}#breadcrumb` },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: opts.apps.length,
          itemListElement: opts.apps.map((a, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: absoluteUrl(`/app/${a.slug}`),
            name: a.name,
          })),
        },
        inLanguage: "en",
      },
      breadcrumbSchema(opts.crumbs, `${url}#breadcrumb`),
    ],
  };
}

/** Free browser tools: WebApplication + WebPage + breadcrumbs + FAQ. */
export function toolPageSchema(tool: { slug: string; name: string; description: string; updated: string; faq: { q: string; a: string }[] }, title: string, crumbs: Crumb[]) {
  const url = absoluteUrl(`/tools/${tool.slug}`);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${url}#app`,
        name: tool.name,
        url,
        description: tool.description,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Any (web browser)",
        browserRequirements: "Requires JavaScript",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        publisher: { "@id": ORG_ID },
      },
      {
        "@type": "WebPage",
        "@id": url,
        url,
        name: title,
        dateModified: tool.updated,
        isPartOf: { "@id": SITE_ID },
        about: { "@id": `${url}#app` },
        publisher: { "@id": ORG_ID },
        breadcrumb: { "@id": `${url}#breadcrumb` },
        inLanguage: "en",
      },
      breadcrumbSchema(crumbs, `${url}#breadcrumb`),
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: tool.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    ],
  };
}

/** Trust/info pages. */
export function webPageSchema(opts: { name: string; path: string; dateModified: string; type?: "WebPage" | "AboutPage" | "ContactPage" }) {
  const url = absoluteUrl(opts.path);
  return {
    "@context": "https://schema.org",
    "@type": opts.type ?? "WebPage",
    "@id": url,
    url,
    name: opts.name,
    dateModified: opts.dateModified,
    isPartOf: { "@id": SITE_ID },
    publisher: { "@id": ORG_ID },
    inLanguage: "en",
  };
}

function priceValue(price: string): string {
  if (/^free$/i.test(price)) return "0";
  const n = price.replace(/[^0-9.]/g, "");
  return n || "0";
}

export function appPageSchema(app: App, title: string, crumbs: Crumb[]) {
  const pageUrl = absoluteUrl(`/app/${app.slug}`);
  const appId = `${pageUrl}#app`;
  const crumbId = `${pageUrl}#breadcrumb`;
  const category = getCategory(app.category);

  const mobileApp: Record<string, unknown> = {
    "@type": app.type === "game" ? ["VideoGame", "MobileApplication"] : "MobileApplication",
    "@id": appId,
    name: app.name,
    operatingSystem: app.minAndroid ? `Android ${app.minAndroid}+` : "Android",
    applicationCategory: category?.schemaCategory ?? "MobileApplication",
    datePublished: app.published,
    dateModified: app.updated,
    author: { "@type": "Organization", name: app.developer.name, url: app.developer.url },
    offers: { "@type": "Offer", price: priceValue(app.price), priceCurrency: "USD" },
    installUrl: app.playStoreUrl ?? app.officialUrl,
    image: absoluteUrl(app.icon),
  };
  if (/\d/.test(app.latest.version)) mobileApp.softwareVersion = app.latest.version;
  if (app.latest.size) mobileApp.fileSize = app.latest.size;
  if (app.screenshots.length) mobileApp.screenshot = app.screenshots.map((s) => absoluteUrl(s.src));
  if (app.type === "game") mobileApp.gamePlatform = "Android";

  return {
    "@context": "https://schema.org",
    "@graph": [
      mobileApp,
      {
        "@type": "WebPage",
        "@id": pageUrl,
        url: pageUrl,
        name: title,
        datePublished: app.published,
        dateModified: app.updated,
        isPartOf: { "@id": SITE_ID },
        about: { "@id": appId },
        publisher: { "@id": ORG_ID },
        breadcrumb: { "@id": crumbId },
        inLanguage: "en",
      },
      breadcrumbSchema(crumbs, crumbId),
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: app.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
}
