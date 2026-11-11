import Link from "next/link";
import type { App } from "@/lib/content";
import { getCategory } from "@/lib/categories";
import { formatDate } from "@/lib/site";

function yesNo(v: boolean | null) {
  return v === null ? null : v ? "Yes" : "No";
}

/** Real <table> with row headers: answer engines quote these directly. Unverified rows are omitted, never guessed. */
export default function InfoTable({ app, compact }: { app: App; compact?: boolean }) {
  const category = getCategory(app.category);
  const rows: [string, React.ReactNode | null][] = [
    ["App name", app.name],
    ["Developer", app.developer.name],
    ["Latest version", app.latest.version],
    ["Updated", formatDate(app.latest.releaseDate)],
    ["Requires Android", app.minAndroid ? `${app.minAndroid} and up` : null],
    ["Size", app.latest.size],
    ["Package name", <code key="pkg" className="break-all text-[0.9em]">{app.packageName}</code>],
    ["Category", <Link key="cat" href={`/category/${app.category}`} className="underline underline-offset-2">{category?.name}</Link>],
    ["Price", app.price],
    ["Contains ads", yesNo(app.containsAds)],
    ["In-app purchases", yesNo(app.inAppPurchases)],
  ];
  const shown = compact ? rows.filter(([k]) => !["App name", "Package name", "Category"].includes(k)) : rows;

  return (
    <table className="w-full border-collapse text-[15px]">
      {!compact && <caption className="sr-only">{app.shortName} app information</caption>}
      <tbody>
        {shown
          .filter(([, v]) => v !== null && v !== undefined)
          .map(([label, value]) => (
            <tr key={label} className="border-b border-border last:border-0">
              <th scope="row" className="w-[42%] py-2.5 pr-4 text-left align-top font-medium text-muted">
                {label}
              </th>
              <td className="py-2.5 align-top">{value}</td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}
