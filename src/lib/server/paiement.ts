/**
 * Le paiement est-il ouvert sur ce serveur ? Une seule lecture de la condition,
 * partagée par `GET /api/checkout` (ce que voit le client) et le balisage de
 * l'accueil (ce que voit Google) : les deux ne peuvent pas diverger.
 *
 * Lue à chaque appel, jamais figée au build : la clé se pose ou se retire
 * dans l'environnement d'exécution, sans rebuild.
 */
export function paiementOuvert(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
