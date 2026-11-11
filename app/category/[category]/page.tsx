import type { Metadata } from "next";
import ArchiveView, { archiveMetadata } from "@/components/ArchiveView";
import { getArchives } from "@/lib/taxonomy";

type Props = { params: Promise<{ category: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getArchives().map((a) => ({ category: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return archiveMetadata((await params).category, 1);
}

export default async function CategoryPage({ params }: Props) {
  return <ArchiveView slug={(await params).category} page={1} />;
}
