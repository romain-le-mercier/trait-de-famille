import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

interface CardProps {
  children: ReactNode;
  className?: string;
  /** `ink` = trait franc (case de coloriage), `soft` = trait discret. */
  tone?: "ink" | "soft" | "grape";
  as?: "div" | "li" | "article" | "section";
}

const TONES = {
  ink: "border-ink",
  soft: "border-line",
  grape: "border-grape",
} as const;

export function Card({
  children,
  className,
  tone = "ink",
  as: Tag = "div",
}: CardProps) {
  return (
    <Tag
      className={cx(
        "rounded-card border-2 bg-canvas",
        TONES[tone],
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function Badge({
  children,
  tone = "tangerine",
  className,
}: {
  children: ReactNode;
  tone?: "tangerine" | "grape" | "success" | "ink";
  className?: string;
}) {
  const tones = {
    tangerine: "bg-tangerine text-ink",
    grape: "bg-grape text-white",
    success: "bg-success text-white",
    ink: "bg-ink text-white",
  } as const;
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Petite annotation manuscrite (Caveat), à utiliser très parcimonieusement. */
export function Scribble({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cx("font-hand text-grape", className)}>{children}</span>
  );
}
