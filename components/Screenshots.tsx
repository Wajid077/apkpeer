import Image from "next/image";
import type { App } from "@/lib/content";

export default function Screenshots({ app }: { app: App }) {
  if (app.screenshots.length === 0) return null;
  return (
    <section aria-labelledby="screenshots">
      <h2 id="screenshots" className="text-[24px] font-semibold">
        Screenshots
      </h2>
      <div className="mt-4 flex snap-x gap-3 overflow-x-auto pb-3">
        {app.screenshots.map((s) => (
          <Image
            key={s.src}
            src={s.src}
            alt={s.alt}
            width={s.width}
            height={s.height}
            loading="lazy"
            sizes="(max-width: 640px) 60vw, 220px"
            className="h-[400px] w-auto shrink-0 snap-start rounded-[var(--radius)] border border-border"
            style={{ aspectRatio: `${s.width} / ${s.height}` }}
          />
        ))}
      </div>
    </section>
  );
}
