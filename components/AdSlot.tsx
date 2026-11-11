/**
 * Reserves its height so ads never shift layout (CLS).
 * Renders nothing until NEXT_PUBLIC_ADSENSE_CLIENT is set — empty grey boxes would hurt the AdSense review.
 * Never place directly next to download buttons (AdSense accidental-click policy).
 */
type Props = { slot: string; variant: "in-content" | "sidebar" };

const HEIGHT = { "in-content": 280, sidebar: 250 } as const;

export default function AdSlot({ slot, variant }: Props) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  if (!client) return null;
  return (
    <aside aria-label="Advertisement" className="my-8" style={{ minHeight: HEIGHT[variant] }}>
      <p className="mb-1 text-center text-xs uppercase tracking-wide text-muted">Advertisement</p>
      <ins
        className="adsbygoogle block"
        style={{ display: "block", minHeight: HEIGHT[variant] - 20 }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
