/**
 * Exécuté une fois au démarrage du serveur, avant toute requête.
 */
export async function register() {
  // Seul le runtime Node a une pile DNS ; l'edge n'a rien à régler ici.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { setDefaultResultOrder } = await import("node:dns");

  /**
   * Priorité à l'IPv4 pour la résolution de noms.
   *
   * Les réseaux Docker de l'hébergeur ont l'IPv6 activée : le DNS interne
   * annonce donc un AAAA en plus du A. Node tente alors l'IPv6 en premier,
   * alors que les services voisins — LiteLLM derrière gunicorn, par exemple —
   * n'écoutent que sur 0.0.0.0, c'est-à-dire en IPv4 seulement. La connexion
   * est refusée sur *tous* les ports, ce qui donne un `ECONNREFUSED`
   * trompeur : il ressemble à un mauvais port alors que c'est la mauvaise
   * famille d'adresses.
   */
  setDefaultResultOrder("ipv4first");
}
