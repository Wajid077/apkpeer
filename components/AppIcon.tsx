import Image from "next/image";
import { iconSrc } from "@/lib/content";

type Props = { src: string; name: string; size: number; priority?: boolean };

export default function AppIcon({ src, name, size, priority }: Props) {
  return (
    <Image
      // Serve the small variant that matches the display size, not the 512px original.
      src={iconSrc(src, size)}
      alt={`${name} icon`}
      width={size}
      height={size}
      priority={priority}
      fetchPriority={priority ? "high" : undefined}
      loading={priority ? undefined : "lazy"}
      // Transparent SVG logos get breathing room; full-bleed store icons fill the frame.
      className={`shrink-0 rounded-[22%] border border-border bg-surface ${src.endsWith(".svg") ? "object-contain p-[8%]" : "object-cover"}`}
      style={{ width: size, height: size }}
    />
  );
}
