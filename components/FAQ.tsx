import type { App } from "@/lib/content";
import { ChevronIcon } from "./icons";

/** No JS: native <details>. Answers stay in the HTML so crawlers see them. */
export default function FAQ({ items }: { items: App["faq"] }) {
  return (
    <section aria-labelledby="faq">
      <h2 id="faq" className="text-[24px] font-semibold">
        Frequently asked questions
      </h2>
      <div className="mt-4 divide-y divide-border rounded-[var(--radius)] border border-border">
        {items.map((f) => (
          <details key={f.q} className="group">
            <summary className="flex min-h-11 items-center justify-between gap-4 p-4 font-semibold">
              <h3 className="text-[17px]">{f.q}</h3>
              <ChevronIcon className="shrink-0 text-muted transition-transform group-open:rotate-180" />
            </summary>
            <p className="px-4 pb-4 text-[16px] text-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
