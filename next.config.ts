import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Les photos ne quittent jamais le navigateur en mode "canvas" : rien à
  // whitelister côté next/image, tout est local (blob:) ou inline (SVG).
  images: { remotePatterns: [] },
  // `sharp` embarque des binaires natifs : il doit rester chargé par Node à
  // l'exécution, pas empaqueté par webpack, sinon la finition d'impression
  // casse au démarrage du conteneur.
  serverExternalPackages: ["sharp"],
};

export default nextConfig;
