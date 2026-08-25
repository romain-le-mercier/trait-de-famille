"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Palette, X } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { AccountMenu, CreditsBadge } from "@/components/AccountMenu";
import { Logo } from "./Logo";

const LINKS = [
  { href: "/#exemples", label: "Exemples" },
  { href: "/#comment-ca-marche", label: "Comment ça marche" },
  { href: "/#tarifs", label: "Tarifs" },
  { href: "/guides", label: "Guides" },
  { href: "/mes-coloriages", label: "Mes coloriages" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b-2 border-ink bg-canvas/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
        <Logo />

        <nav className="hidden items-center gap-7 text-[0.95rem] font-semibold text-muted lg:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="border-b-2 border-transparent pb-0.5 transition-colors hover:border-grape hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <CreditsBadge />
          <AccountMenu compact />
          {/* Enveloppe volontaire : appliquer `hidden` directement sur le bouton
              entrerait en conflit avec son `inline-flex` de base. */}
          <span className="hidden lg:block">
            <ButtonLink href="/creer" size="sm">
              <Palette className="h-4 w-4" strokeWidth={2.2} />
              Créer
            </ButtonLink>
          </span>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="rounded-full border-2 border-ink p-2 lg:hidden"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t-2 border-line bg-canvas px-4 pb-4 lg:hidden">
          <ul className="flex flex-col">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-line py-3 font-semibold"
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
