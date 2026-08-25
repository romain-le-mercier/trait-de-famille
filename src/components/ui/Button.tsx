import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cx } from "@/lib/cx";

type Variant = "primary" | "secondary" | "ink" | "ghost" | "tangerine";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-grape text-white shadow-[0_4px_0_0_var(--color-grape-dark)] hover:bg-grape-dark hover:-translate-y-0.5 active:translate-y-0 active:shadow-[0_1px_0_0_var(--color-grape-dark)]",
  secondary:
    "bg-white text-grape border-2 border-grape hover:bg-grape-soft hover:-translate-y-0.5",
  ink: "bg-white text-ink border-2 border-ink hover:bg-paper hover:-translate-y-0.5",
  tangerine:
    "bg-tangerine text-ink shadow-[0_4px_0_0_#d97e05] hover:-translate-y-0.5 active:translate-y-0",
  ghost: "text-ink hover:text-grape",
};

const SIZES: Record<Size, string> = {
  sm: "h-10 px-4 text-sm gap-1.5",
  md: "h-12 px-5 text-base gap-2",
  lg: "h-14 px-7 text-lg gap-2.5",
};

const BASE =
  "inline-flex items-center justify-center rounded-full font-bold transition-all duration-200 disabled:opacity-45 disabled:pointer-events-none whitespace-nowrap";

interface Common {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  full?: boolean;
}

type ButtonProps = Common & Omit<ComponentProps<"button">, keyof Common>;
type AnchorProps = Common & { href: string } & Omit<
    ComponentProps<typeof Link>,
    keyof Common | "href"
  >;

function classes(variant: Variant, size: Size, full?: boolean, extra?: string) {
  return cx(BASE, VARIANTS[variant], SIZES[size], full && "w-full", extra);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  full,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button className={classes(variant, size, full, className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  full,
  children,
  ...rest
}: AnchorProps) {
  return (
    <Link className={classes(variant, size, full, className)} {...rest}>
      {children}
    </Link>
  );
}
