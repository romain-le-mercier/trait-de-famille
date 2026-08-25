import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Les photos ne quittent jamais le navigateur en mode "canvas" : rien à
  // whitelister côté next/image, tout est local (blob:) ou inline (SVG).
  images: { remotePatterns: [] },
};

export default nextConfig;
