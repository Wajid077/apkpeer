import type { Developer } from "./taxonomy";

/**
 * Optional hand-written intros for developer pages, keyed by developer slug.
 * Without one, the page gets a short factual line and is usually noindex (thin-page guard).
 * Write one (100–150 words, from the developer's own site) for big publishers.
 */
export const DEVELOPER_INTROS: Record<string, string> = {};

export function developerIntro(d: Developer): string {
  return (
    DEVELOPER_INTROS[d.slug] ??
    `${d.name} publishes ${d.apps.length} of the Android ${d.apps.every((a) => a.type === "game") ? "games" : "apps"} listed on APKPeer. Each link below goes to our page for that app, with the latest version, release notes, install steps and safety notes. Downloads go to Google Play or ${d.name}'s official site.`
  );
}
