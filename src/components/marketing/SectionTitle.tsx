import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

export function SectionTitle({
  eyebrow,
  title,
  subtitle,
  className,
  align = "center",
  as: Heading = "h2",
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  className?: string;
  align?: "center" | "left";
  /** `h1` quand le titre est celui de la page (bibliothèque, thèmes). */
  as?: "h1" | "h2";
}) {
  return (
    <header
      className={cx(
        "mb-10",
        align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl",
        className,
      )}
    >
      {eyebrow && (
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.14em] text-grape">
          {eyebrow}
        </p>
      )}
      <Heading className="font-display text-3xl font-bold sm:text-4xl">{title}</Heading>
      {subtitle && <p className="mt-3 text-lg text-muted">{subtitle}</p>}
    </header>
  );
}
