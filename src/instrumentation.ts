/**
 * Exécuté une fois au démarrage du serveur, avant toute requête.
 */
export async function register() {
  // Seul le runtime Node a une pile DNS ; l'edge n'a rien à régler ici.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // `webpackIgnore` est indispensable : ce fichier est aussi compilé pour le
  // runtime edge, où webpack essaie de résoudre « node:dns » et fait échouer
  // toute la compilation (« UnhandledSchemeError »). Le garde ci-dessus
  // empêche l'exécution, pas le regroupement. Ignoré ici, l'import est laissé
  // tel quel et c'est Node qui le résout à l'exécution.
  const { setDefaultResultOrder } = await import(/* webpackIgnore: true */ "node:dns");

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

  /**
   * Origine d'Auth.js, alignée sur celle du site.
   *
   * Auth.js construit l'URI de rappel OAuth à partir de `AUTH_URL`, ou à
   * défaut des en-têtes de la requête. `trustHost` autorise l'hôte annoncé
   * mais ne le fixe pas : il suffit d'une variable mal renseignée, ou d'un
   * en-tête inattendu, pour envoyer à Google une URI qu'il rejettera
   * (`redirect_uri_mismatch`) — c'est arrivé avec `https://localhost:3000`.
   *
   * On la dérive donc de `NEXT_PUBLIC_SITE_URL`, déjà indispensable par
   * ailleurs, pour n'avoir qu'une seule source de vérité. Une `AUTH_URL`
   * explicite reste prioritaire.
   */
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const explicite = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;

  if (site && !explicite) process.env.AUTH_URL = site;

  const origine = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
  console.log(
    `[auth] origine : ${origine ?? "(déduite des en-têtes)"}` +
      (origine ? ` · rappel OAuth : ${origine}/api/auth/callback/google` : ""),
  );

  // Une origine explicite qui contredit l'adresse du site est presque
  // toujours un reliquat de configuration, et elle provoque un
  // `redirect_uri_mismatch` que Google renvoie sans expliquer d'où il vient.
  if (site && explicite && explicite.replace(/\/$/, "") !== site) {
    console.warn(
      `[auth] ATTENTION : AUTH_URL/NEXTAUTH_URL vaut « ${explicite} » alors que ` +
        `le site est « ${site} ». C'est cette valeur qui sera envoyée à Google, ` +
        `et elle provoquera une erreur redirect_uri_mismatch. Retire la variable ` +
        `pour qu'elle soit déduite de NEXT_PUBLIC_SITE_URL.`,
    );
  }
}
