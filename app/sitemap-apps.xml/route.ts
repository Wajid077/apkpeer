import { SITEMAPS } from "@/lib/sitemaps";
import { urlset, xmlResponse } from "@/lib/xml";

export const dynamic = "force-static";

export function GET() {
  return xmlResponse(urlset(SITEMAPS["sitemap-apps.xml"]()));
}
