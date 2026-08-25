import Link from "next/link";
import { LogoMark } from "./Logo";

const LEGAL = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/cgv", label: "CGV" },
  { href: "/confidentialite", label: "Confidentialité" },
  { href: "/contact", label: "Contact" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t-2 border-ink bg-paper">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-6">
        <div className="flex items-center gap-2 font-display text-lg font-bold">
          <LogoMark className="h-7 w-7" />
          Trait de Famille
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-muted">
          {LEGAL.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-grape"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="text-sm text-muted">
          Fait avec <span className="text-error">❤</span> en France
        </p>
      </div>
    </footer>
  );
}
