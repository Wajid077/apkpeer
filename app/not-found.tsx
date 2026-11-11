import Link from "next/link";
import { AppGrid } from "@/components/AppCard";
import SearchBox from "@/components/SearchBox";
import { getAllApps } from "@/lib/content";

export const metadata = { title: "Page not found", robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <div className="container-site pt-16">
      <h1 className="text-[28px] font-bold">We couldn’t find that page</h1>
      <p className="mt-3 text-muted">
        It may have moved, or it listed content APKPeer no longer carries. Try one of these apps, or go to the{" "}
        <Link href="/" className="text-accent-text underline underline-offset-2">
          homepage
        </Link>
        .
      </p>
      <div className="mt-8 max-w-xl">
        <SearchBox />
      </div>
      <h2 className="mt-12 text-[24px] font-semibold">Recently updated</h2>
      <div className="mt-4">
        <AppGrid apps={getAllApps().slice(0, 6)} />
      </div>
    </div>
  );
}
