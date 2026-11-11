import Link from "next/link";
import { ShieldCheckIcon } from "./icons";

export default function VerifiedBadge() {
  return (
    <Link
      href="/editorial-policy#verification"
      title="SHA-256 and signing certificate match the developer's official build"
      className="inline-flex items-center gap-1 rounded-full border border-accent/40 px-2.5 py-0.5 text-sm font-medium text-accent-text"
    >
      <ShieldCheckIcon width={15} height={15} />
      Verified original
    </Link>
  );
}
