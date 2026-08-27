/**
 * Événements du tunnel, envoyés à Umami.
 *
 * Deux règles tiennent tout ce fichier :
 *
 * 1. **La mesure ne casse jamais le produit.** La sonde est absente en
 *    développement, et bloquée par une partie des navigateurs. Chaque appel
 *    est donc silencieusement sans effet si `window.umami` n'existe pas, et
 *    protégé par un `try`. Un tunnel de paiement ne tombe pas parce qu'une
 *    statistique n'est pas partie.
 * 2. **Rien de personnel ne sort d'ici.** Pas de nom de fichier, pas
 *    d'identifiant de dessin, pas d'adresse e-mail — seulement des libellés
 *    et des réglages choisis dans l'interface.
 */

type Evenement =
  /** Une photo a été acceptée dans le dépose-fichier. Haut du tunnel. */
  | "photo-deposee"
  /** Le modèle a rendu un dessin. C'est l'appel qui coûte de l'argent. */
  | "generation-reussie"
  /** Le modèle a échoué : coût engagé, aucune valeur livrée. */
  | "generation-echouee"
  /** Un aperçu s'affiche, qu'il vienne du modèle ou du cache local. */
  | "apercu-vu"
  /** Redirection vers Stripe. */
  | "paiement-ouvert"
  /** Paiement confirmé au retour de Stripe. */
  | "paiement-reussi"
  /** Un crédit a été dépensé : le coloriage sans filigrane est livré. */
  | "coloriage-debloque";

type Donnees = Record<string, string | number | boolean>;

declare global {
  interface Window {
    umami?: { track: (nom: string, donnees?: Donnees) => void };
  }
}

export function suivre(evenement: Evenement, donnees?: Donnees): void {
  if (typeof window === "undefined") return;
  try {
    window.umami?.track(evenement, donnees);
  } catch {
    // Volontairement muet : voir la règle 1 ci-dessus.
  }
}

/**
 * Vrai la première fois seulement, pour une clé donnée et ce navigateur.
 *
 * Certaines pages du tunnel sont rechargeables — `/merci` en particulier, dont
 * la vérification de paiement est idempotente. Sans garde, un rechargement
 * compterait un paiement de plus : c'est le chiffre qu'il faut le moins
 * gonfler. La clé ne sort jamais du navigateur.
 *
 * Si le stockage est indisponible (navigation privée stricte), on laisse
 * passer : compter deux fois vaut mieux que ne jamais compter.
 */
export function premiereFois(cle: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const stockee = `tdf:vu:${cle}`;
    if (window.localStorage.getItem(stockee)) return false;
    window.localStorage.setItem(stockee, "1");
    return true;
  } catch {
    return true;
  }
}
