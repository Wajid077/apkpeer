import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { getAllApps, getApp } from "@/lib/content";
import { SITE } from "@/lib/site";
import { TOOLS, getTool } from "@/lib/tools";

export const dynamic = "force-static";
export const dynamicParams = false;

// The param carries the extension so the export writes /og/{slug}.png with a real image type.
export function generateStaticParams() {
  return [
    { file: "default.png" },
    ...getAllApps().map((a) => ({ file: `${a.slug}.png` })),
    ...TOOLS.map((t) => ({ file: `tool-${t.slug}.png` })),
  ];
}

const MIME: Record<string, string> = { ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg" };

/** Satori can't decode WebP/AVIF, so those icons are converted to PNG with sharp first. */
async function iconDataUri(icon: string): Promise<string | null> {
  const file = path.join(process.cwd(), "public", icon);
  const ext = path.extname(icon).toLowerCase();
  if (MIME[ext]) return `data:${MIME[ext]};base64,${fs.readFileSync(file).toString("base64")}`;
  if (ext === ".webp" || ext === ".avif") {
    const png = await sharp(file).resize(300, 300, { fit: "inside" }).png().toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  }
  return null;
}

// APK Peer tokens: brand-strong for marks, brand for decoration, surface/ink for the canvas.
const MARK = "#b4521c";
const BRAND = "#ec8b57";

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const slug = (await params).file.replace(/\.png$/, "");
  const tool = slug.startsWith("tool-") ? getTool(slug.slice(5)) : undefined;
  const app = slug === "default" || tool ? undefined : getApp(slug);
  const icon = app ? await iconDataUri(app.icon) : null;

  const title = tool ? tool.name : app ? app.name : "Original Android apps, verified at the source";
  const subtitle = app ? `${/\d/.test(app.latest.version) ? `APK ${app.latest.version}` : "Android APK"} · ${app.developer.name}` : tool ? "Free online tool · runs in your browser" : "Version info, install guides and safety notes";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#fff8f2", padding: 72, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 34, fontWeight: 700, color: "#2b1b12" }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: MARK, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 32 }}>A</div>
          {SITE.name}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 48 }}>
          {app && (
            <div style={{ width: 200, height: 200, borderRadius: 44, border: "2px solid #eedfd2", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {icon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={icon} width={150} height={150} alt="" />
              ) : (
                <div style={{ fontSize: 110, fontWeight: 700, color: MARK }}>{app.shortName[0]}</div>
              )}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
            <div style={{ fontSize: app && app.name.length > 24 ? 60 : 72, fontWeight: 700, lineHeight: 1.1, color: "#2b1b12" }}>{title}</div>
            <div style={{ fontSize: 34, color: "#6b5546" }}>{subtitle}</div>
          </div>
        </div>
        <div style={{ display: "flex", height: 8, width: 160, borderRadius: 4, background: BRAND }} />
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
