/**
 * Type badge. Labels are APP or GAME only: APKPeer lists original apps, so there is no third type.
 * The label text carries the meaning; color is a secondary cue.
 */
export default function Badge({ type }: { type: "app" | "game" }) {
  return <span className={`ap-badge ap-badge--${type} shrink-0`}>{type === "game" ? "Game" : "App"}</span>;
}
