import type { NextConfig } from "next";

// En GitHub Pages la web vive en /<nombre-del-repo>. El workflow de despliegue
// define PAGES_BASE_PATH; en local queda vacío.
const basePath = process.env.PAGES_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
