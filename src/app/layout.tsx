import type { Metadata, Viewport } from "next";
import { Baloo_2, Caveat, Nunito_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SITE_NAME, SITE_URL } from "@/lib/site";

/**
 * Mesure d'audience — Umami auto-hébergé, sans cookie ni donnée personnelle :
 * pas de bandeau de consentement à afficher.
 *
 * On ne charge la sonde que si le site tourne sur son vrai domaine. Le
 * développement local ne pollue donc pas les statistiques, et on évite le
 * filtrage par nom d'hôte côté Umami, qui échouerait en silence — or une
 * mesure qui ne mesure rien sans le dire est pire qu'une mesure absente.
 */
const MESURE_AUDIENCE = !SITE_URL.includes("localhost");

const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-baloo",
  display: "swap",
});

const nunito = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-nunito",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  // Sans base, les URL canoniques et les images de partage resteraient
  // relatives : ni Google ni les messageries ne sauraient les résoudre.
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Trait de Famille — transforme tes photos en coloriages",
    template: "%s · Trait de Famille",
  },
  description:
    "Envoie une photo de famille, on la transforme en dessin au trait prêt à colorier. À imprimer à la maison en 2 minutes.",
  applicationName: SITE_NAME,
  openGraph: {
    title: "Trait de Famille",
    description:
      "Transforme tes photos en coloriages à imprimer. Aperçu gratuit, sans abonnement.",
    siteName: SITE_NAME,
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Trait de Famille",
    description:
      "Transforme tes photos en coloriages à imprimer. Aperçu gratuit, sans abonnement.",
  },
};

export const viewport: Viewport = {
  themeColor: "#7b61ff",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" data-scroll-behavior="smooth">
      <body
        className={`${baloo.variable} ${nunito.variable} ${caveat.variable} bg-canvas text-ink`}
      >
        {children}
        {MESURE_AUDIENCE && (
          <Script
            strategy="afterInteractive"
            src="https://analytics.lmphoenix.fr/script.js"
            data-website-id="e50f9753-1aa1-45db-9c5c-f51ee86239db"
          />
        )}
      </body>
    </html>
  );
}
