import Link from "next/link";
import type { LienDansTexte } from "@/lib/coloriages/themes";

/**
 * Affiche `texte` en rendant cliquable la première occurrence de `lien.ancre`.
 * Une ancre absente du texte (texte réécrit depuis) laisse le texte intact,
 * sans lien : mieux vaut un lien perdu qu'une phrase déformée.
 */
export function TexteAvecLien({
  texte,
  lien,
}: {
  texte: string;
  lien?: LienDansTexte;
}) {
  const position = lien ? texte.indexOf(lien.ancre) : -1;
  if (!lien || position === -1) return <>{texte}</>;
  const fin = position + lien.ancre.length;
  return (
    <>
      {texte.slice(0, position)}
      <Link
        href={lien.href}
        className="font-semibold text-grape underline decoration-2 underline-offset-2"
      >
        {lien.ancre}
      </Link>
      {texte.slice(fin)}
    </>
  );
}
