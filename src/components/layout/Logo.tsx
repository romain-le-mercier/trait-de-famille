import Link from "next/link";
import { cx } from "@/lib/cx";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cx("h-8 w-8 shrink-0", className)}
      aria-hidden="true"
    >
      {/* crayon dessiné au trait, avec sa mine violette */}
      <path
        d="M7 25 L9.5 18.5 L21 7 L25 11 L13.5 22.5 Z"
        fill="#fff"
        stroke="#201b2e"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M9.5 18.5 L13.5 22.5" stroke="#201b2e" strokeWidth="2" />
      <path d="M7 25 L9.5 18.5 L13.5 22.5 Z" fill="#7b61ff" stroke="#201b2e" strokeWidth="2" strokeLinejoin="round" />
      <path
        d="M20 27 Q23.5 23.5 27 27"
        fill="none"
        stroke="#ff9f1c"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cx(
        "flex items-center gap-2 whitespace-nowrap font-display text-xl font-bold text-ink transition-transform hover:scale-[1.03]",
        className,
      )}
    >
      <LogoMark />
      <span>Trait de Famille</span>
    </Link>
  );
}
