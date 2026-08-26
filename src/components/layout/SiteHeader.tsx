"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Palette, X } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { AccountMenu, CreditsBadge } from "@/components/AccountMenu";
import { cx } from "@/lib/cx";
import { Logo } from "./Logo";

/**
 * Quatre entrées, pas plus.
 *
 * Au-delà, les libellés passent à la ligne dans une barre haute de 80 px et
 * la navigation ressemble à un fourre-tout. Deux liens ont donc été retirés :
 *
 *   - « Mes coloriages » est déjà dans le menu du compte, et mène à une page
 *     vide tant qu'on n'est pas connecté ;
 *   - « Exemples » fait doublon avec l'avant/après du héros et avec la
 *     section « Comment ça marche », juste à côté.
 *
 * Les deux sections éditoriales restent, elles : un lien présent sur toutes
 * les pages est ce qui leur donne l'autorité interne nécessaire pour être
 * explorées.
 */
const LINKS = [
  { href: "/#comment-ca-marche", label: "Comment ça marche" },
  { href: "/#tarifs", label: "Tarifs" },
  { href: "/coloriages", label: "Coloriages gratuits" },
  { href: "/guides", label: "Guides" },
];

/** Une ancre de la page d'accueil n'est jamais « la page courante ». */
function estActif(href: string, chemin: string): boolean {
  if (href.includes("#")) return false;
  return chemin === href || chemin.startsWith(`${href}/`);
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const chemin = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b-2 border-ink bg-canvas/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
        <Logo />

        {/* `xl` et non `lg` : entre 1024 et 1280 px, la barre complète ne tient
            pas dès que le badge de crédits apparaît, et tout repasse à la
            ligne. Le menu déroulant est plus honnête qu'un tassement. */}
        <nav className="hidden items-center gap-6 text-[0.95rem] font-semibold text-muted xl:flex">
          {LINKS.map((link) => {
            const actif = estActif(link.href, chemin);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={actif ? "page" : undefined}
                className={cx(
                  "whitespace-nowrap border-b-2 pb-0.5 transition-colors hover:border-grape hover:text-ink",
                  actif ? "border-grape text-ink" : "border-transparent",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <CreditsBadge />
          <AccountMenu compact />
          {/* Enveloppe volontaire : appliquer `hidden` directement sur le bouton
              entrerait en conflit avec son `inline-flex` de base. */}
          <span className="hidden xl:block">
            <ButtonLink href="/creer" size="sm">
              <Palette className="h-4 w-4" strokeWidth={2.2} />
              Créer
            </ButtonLink>
          </span>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="rounded-full border-2 border-ink p-2 xl:hidden"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t-2 border-line bg-canvas px-4 pb-4 xl:hidden">
          <ul className="flex flex-col">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={estActif(link.href, chemin) ? "page" : undefined}
                  className={cx(
                    "block border-b border-line py-3 font-semibold",
                    estActif(link.href, chemin) && "text-grape",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <ButtonLink href="/creer" full className="mt-4" onClick={() => setOpen(false)}>
            <Palette className="h-4 w-4" strokeWidth={2.2} />
            Créer mon coloriage
          </ButtonLink>
        </nav>
      )}
    </header>
  );
}
