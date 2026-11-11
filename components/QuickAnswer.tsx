export default function QuickAnswer({ children }: { children: string }) {
  return (
    <section aria-label="Quick answer" className="rounded-[var(--radius)] border border-border bg-surface p-5">
      <p className="text-sm font-semibold uppercase tracking-wide text-muted">Quick answer</p>
      <p className="mt-2 text-[17px] leading-relaxed">{children}</p>
    </section>
  );
}
