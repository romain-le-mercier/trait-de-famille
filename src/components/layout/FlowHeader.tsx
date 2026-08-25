import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AccountMenu, CreditsBadge } from "@/components/AccountMenu";
import { LogoMark } from "./Logo";

/** En-tête minimal pour les écrans du parcours : on ne distrait pas. */
export function FlowHeader({
  backTo = "/",
  backLabel = "Retour",
}: {
  backTo?: string;
  backLabel?: string;
}) {
  return (
    <header className="border-b-2 border-ink bg-canvas">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
        <Link
          href={backTo}
          className="group flex items-center gap-2 font-semibold text-ink transition-colors hover:text-grape"
        >
          <ArrowLeft
            className="h-5 w-5 transition-transform group-hover:-translate-x-1"
            strokeWidth={2.2}
          />
          <span className="hidden sm:inline">{backLabel}</span>
        </Link>

        <Link
          href="/"
          className="flex items-center gap-2 font-display text-lg font-bold"
        >
          <LogoMark className="h-7 w-7" />
          <span className="hidden sm:inline">Trait de Famille</span>
        </Link>

        <div className="flex min-w-[72px] items-center justify-end gap-2">
          <CreditsBadge />
          <AccountMenu compact />
        </div>
      </div>
    </header>
  );
}
