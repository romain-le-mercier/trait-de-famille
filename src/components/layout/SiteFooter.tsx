import Link from "next/link";
import { guidesByDate } from "@/lib/guides";
import { LogoMark } from "./Logo";

const LEGAL = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/cgv", label: "CGV" },
  { href: "/confidentialite", label: "Confidentialité" },
  { href: "/contact", label: "Contact" },
];

/** Liens vers le contenu éditorial : la seule porte d'entrée organique. */
const RESSOURCES = [
  { href: "/guides", label: "Tous les guides" },
  ...guidesByDate()
    .slice(0, 3)
    .map((guide) => ({
      href: `/guides/${guide.slug}`,
      label: guide.heading,
    })),
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t-2 border-ink bg-paper">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="flex items-start gap-2 font-display text-lg font-bold">
            <LogoMark className="h-7 w-7" />
            Trait de Famille
          </div>

          <nav className="text-sm">
            <p className="mb-3 font-display font-bold">Guides</p>
            <ul className="space-y-2 font-semibold text-muted">
              {RESSOURCES.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-grape"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="text-sm">
            <p className="mb-3 font-display font-bold">Informations</p>
            <ul className="space-y-2 font-semibold text-muted">
              {LEGAL.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-grape"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="mt-8 border-t-2 border-line pt-6 text-sm text-muted">
          Fait avec <span className="text-error">❤</span> en France
        </p>
      </div>
    </footer>
  );
}
