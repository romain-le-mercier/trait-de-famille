import type { Metadata, Viewport } from "next";
import { Baloo_2, Caveat, Nunito_Sans } from "next/font/google";
import "./globals.css";

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
  title: {
    default: "Trait de Famille — transforme tes photos en coloriages",
    template: "%s · Trait de Famille",
  },
  description:
    "Envoie une photo de famille, on la transforme en dessin au trait prêt à colorier. À imprimer à la maison en 2 minutes.",
  openGraph: {
    title: "Trait de Famille",
    description:
      "Transforme tes photos en coloriages à imprimer. Aperçu gratuit, sans abonnement.",
    locale: "fr_FR",
    type: "website",
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
      </body>
    </html>
  );
}
