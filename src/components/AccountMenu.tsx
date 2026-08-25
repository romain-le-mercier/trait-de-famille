"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn, signOut } from "next-auth/react";
import { Coins, LogIn, LogOut, User } from "lucide-react";
import { useAccount } from "@/lib/store";
import { cx } from "@/lib/cx";

export function CreditsBadge({ className }: { className?: string }) {
  const account = useAccount();
  if (!account.loaded || !account.signedIn || account.credits <= 0) return null;

  return (
    <Link
      href="/mes-coloriages"
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full bg-tangerine px-3 py-1.5 text-sm font-bold text-ink transition-transform hover:scale-105",
        className,
      )}
      title="Voir mes coloriages"
    >
      <Coins className="h-4 w-4" strokeWidth={2.2} />
      {account.credits}
      <span className="hidden sm:inline">
        {account.credits > 1 ? "crédits" : "crédit"}
      </span>
    </Link>
  );
}

/** Connexion Google, ou avatar + déconnexion si déjà connecté. */
export function AccountMenu({ compact = false }: { compact?: boolean }) {
  const account = useAccount();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!account.loaded) {
    return <span className="h-9 w-9 animate-pulse rounded-full bg-line" />;
  }

  if (!account.authConfigured) {
    return (
      <span
        className="rounded-full border-2 border-line px-3 py-1.5 text-xs font-bold text-muted"
        title="Renseigne GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET et AUTH_SECRET"
      >
        SSO non configuré
      </span>
    );
  }

  if (!account.signedIn) {
    return (
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          setBusy(true);
          void signIn("google");
        }}
        className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-white px-3 py-1.5 text-sm font-bold transition-colors hover:bg-paper disabled:opacity-50"
      >
        <LogIn className="h-4 w-4" strokeWidth={2.2} />
        <span className={compact ? "hidden sm:inline" : ""}>Se connecter</span>
      </button>
    );
  }

  const label = account.user?.name ?? account.user?.email ?? "Mon compte";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full border-2 border-ink bg-white py-1 pl-1 pr-3 text-sm font-bold transition-colors hover:bg-paper"
      >
        {account.user?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={account.user.image}
            alt=""
            className="h-7 w-7 rounded-full"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-grape-soft">
            <User className="h-4 w-4 text-grape" strokeWidth={2.2} />
          </span>
        )}
        <span className="hidden max-w-[10rem] truncate sm:inline">{label}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-tile border-2 border-ink bg-canvas shadow-[0_12px_30px_-12px_rgba(32,27,46,0.4)]"
        >
          <div className="border-b-2 border-line px-4 py-3">
            <p className="truncate font-bold">{label}</p>
            <p className="mt-0.5 text-xs text-muted">
              {account.credits} {account.credits > 1 ? "crédits" : "crédit"}
            </p>
          </div>
          <Link
            href="/mes-coloriages"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-sm font-semibold hover:bg-paper"
          >
            Mes coloriages
          </Link>
          <Link
            href="/debloquer"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-sm font-semibold hover:bg-paper"
          >
            Acheter des crédits
          </Link>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              void signOut({ redirectTo: "/" });
            }}
            className="flex w-full items-center gap-2 border-t-2 border-line px-4 py-3 text-left text-sm font-semibold hover:bg-paper"
          >
            <LogOut className="h-4 w-4" strokeWidth={2.2} />
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}
