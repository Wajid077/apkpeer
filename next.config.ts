import type { NextConfig } from "next";

// Hostinger hPanel serves static files, so the whole site is exported to /out.
// Redirects, 410s and clean URLs live in public/.htaccess (see DECISIONS.md).
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: false,
  images: { unoptimized: true },
  poweredByHeader: false,
};

export default nextConfig;
