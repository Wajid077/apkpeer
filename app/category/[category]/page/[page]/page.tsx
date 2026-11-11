import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArchiveView, { archiveMetadata } from "@/components/ArchiveView";
import { PLACEHOLDER, orPlaceholder } from "@/lib/static-params";
import { getArchives, pageCount } from "@/lib/taxonomy";

type Props = { params: Promise<{ category: string; page: string }> };

export const dynamicParams = false;

// Page 1 lives at /category/{slug}; this route only covers page 2+ (self-canonical, brief §5.1).
export function generateStaticParams() {
  const params = getArchives().flatMap((a) =>
    Array.from({ length: pageCount(a.apps.length) - 1 }, (_, i) => ({ category: a.slug, page: String(i + 2) })),
  );
  return orPlaceholder(params, ["category", "page"]);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, page } = await params;
  if (category === PLACEHOLDER) return {};
  return archiveMetadata(category, Number(page));
}

export default async function CategoryPagedPage({ params }: Props) {
  const { category, page } = await params;
  if (category === PLACEHOLDER) notFound();
  return <ArchiveView slug={category} page={Number(page)} />;
}
