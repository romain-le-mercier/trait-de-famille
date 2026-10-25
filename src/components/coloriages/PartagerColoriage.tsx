"use client";

import { useState } from "react";
import { Check, Link2, MessageCircle, Pin } from "lucide-react";
import { suivre } from "@/lib/analytics";

/**
 * Partage d'un coloriage de la bibliothèque.
 *
 * De simples liens, aucun script de Pinterest ni de Meta : un bouton officiel
 * chargerait leur traceur sur chaque fiche, pour un clic que la plupart des
 * visiteurs ne feront pas.
 */
export function PartagerColoriage({
  slug,
  titre,
  url,
  image,
}: {
  slug: string;
  titre: string;
  /** Adresse absolue de la fiche. */
  url: string;
  /** Adresse absolue du dessin : c'est lui qu'on épingle. */
  image: string;
}) {
  const [copie, setCopie] = useState(false);

  // encodeURIComponent plutôt qu'URLSearchParams : ce dernier code l'espace en
  // « + », que wa.me laisse tel quel dans le message.
  const enc = encodeURIComponent;
  const pinterest = `https://www.pinterest.com/pin/create/button/?url=${enc(url)}&media=${enc(image)}&description=${enc(titre)}`;
  const whatsapp = `https://wa.me/?text=${enc(`${titre} ${url}`)}`;

  const copier = async () => {
    suivre("coloriage-partage", { canal: "lien", slug });
    try {
      await navigator.clipboard.writeText(url);
      setCopie(true);
      window.setTimeout(() => setCopie(false), 2000);
    } catch {
      // Presse-papiers refusé (contexte non sécurisé, permission) : on montre
      // l'adresse, qu'on puisse au moins la copier à la main.
      window.prompt("Copie ce lien :", url);
    }
  };

  const bouton =
    "inline-flex h-10 items-center gap-1.5 rounded-full border-2 border-ink bg-white px-4 text-sm font-bold text-ink transition-all hover:-translate-y-0.5 hover:bg-paper";

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-muted">Partager ce coloriage</p>
      <div className="flex flex-wrap gap-2">
        <a
          href={pinterest}
          target="_blank"
          rel="noopener noreferrer"
          className={bouton}
          onClick={() => suivre("coloriage-partage", { canal: "pinterest", slug })}
        >
          <Pin className="h-4 w-4" strokeWidth={2.2} />
          Épingler
        </a>
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className={bouton}
          onClick={() => suivre("coloriage-partage", { canal: "whatsapp", slug })}
        >
          <MessageCircle className="h-4 w-4" strokeWidth={2.2} />
          WhatsApp
        </a>
        <button type="button" onClick={() => void copier()} className={bouton}>
          {copie ? (
            <Check className="h-4 w-4" strokeWidth={2.2} />
          ) : (
            <Link2 className="h-4 w-4" strokeWidth={2.2} />
          )}
          {copie ? "Lien copié" : "Copier le lien"}
        </button>
      </div>
    </div>
  );
}
