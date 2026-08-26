# Trait de Famille

Web app qui transforme une photo en dessin au trait prêt à colorier, avec aperçu
gratuit filigrané, paywall et téléchargement PDF A4.

## Démarrer

```bash
nvm use            # Node 20.9+ requis (voir .nvmrc)
npm install

# Une base est nécessaire, même en local : c'est là que vivent les crédits.
docker run -d --name traitdefamille-pg --restart unless-stopped \
  -e POSTGRES_USER=traitdefamille \
  -e POSTGRES_PASSWORD=traitdefamille \
  -e POSTGRES_DB=traitdefamille \
  -p 55432:5432 -v traitdefamille-pgdata:/var/lib/postgresql/data \
  postgres:16-alpine

npm run dev        # applique les migrations, puis http://localhost:3000
```

Scripts : `dev`, `build`, `start`, `migrate`, `lint`, `typecheck`.
`dev` et `start` appliquent les migrations avant de démarrer.

> Ne pas lancer `npm run build` pendant que `npm run dev` tourne : les deux
> écrivent dans `.next` et le serveur de dev renvoie alors des erreurs 500.

## Variables d'environnement

Copie `.env.example` en `.env.local` (ou `.env`) — il documente chaque variable
et ce qui casse quand elle manque. **Une clé de moteur de rendu est
indispensable**, le reste dépend de ce que tu veux tester.

| Variable | Rôle | Sans elle |
| --- | --- | --- |
| `DATABASE_URL` | Postgres : comptes, crédits, achats | Le serveur refuse de démarrer |
| `LITELLM_BASE_URL` + `LITELLM_API_KEY` + `LITELLM_MODEL` | Moteur de génération, via le proxy LiteLLM | Aucun dessin n'est produit |
| `NEXT_PUBLIC_SITE_URL` | Base des canoniques, du sitemap et de l'image de partage | Retombe sur `localhost` — à renseigner en production |
| `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` | Connexion Google | Personne ne peut acheter |
| `AUTH_SECRET` | Signature des sessions (`openssl rand -base64 32`) | Le SSO est désactivé |
| `AUTH_URL` | Force l'origine OAuth ; sinon dérivée de `NEXT_PUBLIC_SITE_URL` | Rien — c'est le cas normal |
| `STRIPE_SECRET_KEY` | Active le Checkout Stripe | L'écran de déblocage annonce « Paiement indisponible » |
| `STRIPE_WEBHOOK_SECRET` | Signature du webhook | Aucun compte n'est crédité après paiement |

Aucune clé publiable Stripe (`pk_...`) n'est nécessaire : le paiement passe par
une redirection côté serveur.

Après toute modification d'un `.env`, **redémarrer le serveur** : les variables
ne sont lues qu'au démarrage.

Côté Google Cloud, les URI de redirection à autoriser sont
`http://localhost:3000/api/auth/callback/google` et
`https://TON-DOMAINE/api/auth/callback/google`.

Cette URI est construite à partir de `NEXT_PUBLIC_SITE_URL` : elle ne peut donc
pas diverger de l'adresse du site. Le serveur la journalise au démarrage
(`[auth] origine : … · rappel OAuth : …`) — en cas de `redirect_uri_mismatch`,
c'est la première chose à lire, avant de soupçonner la console Google.

⚠️ Une clé `sk_live_` déclenche de vrais débits. Pour la mise au point, utilise
une clé `sk_test_` : l'écran de paiement affiche un avertissement quand il
détecte le mode réel.

Sans `STRIPE_SECRET_KEY`, il n'existe aucun moyen de débloquer un coloriage :
l'écran de déblocage annonce « Paiement indisponible ». C'est délibéré — un
mode démo qui accorde des crédits sans paiement donnerait le produit s'il
était mal configuré en production.

## Comptes et crédits

Connexion par compte Google (Auth.js, session JWT). Le solde de crédits vit
**côté serveur** — `src/lib/server/accounts.ts` — et c'est la seule source de
vérité :

- `/api/checkout` refuse de créer un paiement sans compte connecté et inscrit
  l'identifiant du compte dans les métadonnées Stripe ;
- le webhook et la vérification au retour de paiement créditent tous les deux,
  via la même fonction idempotente sur l'identifiant de session : celui qui
  arrive le premier crédite, l'autre constate que c'est fait. L'affichage est
  donc immédiat sans dépendre du délai du webhook ;
- un crédit n'est débité qu'**après** que le fichier est prêt, et rendu
  automatiquement si l'enregistrement échoue.

Les images, elles, restent dans le navigateur (IndexedDB) : un compte retrouve
ses crédits partout, mais sa galerie est locale à l'appareil.

### Base de données et migrations

Deux tables seulement, dans `migrations/` : `accounts` et `purchases`. La
sûreté vient du schéma plutôt que du code applicatif :

- **le débit tient en une instruction** —
  `UPDATE … SET credits = credits - 1 WHERE id = $1 AND credits >= 1 RETURNING credits`.
  La condition et l'écriture sont évaluées sous le même verrou de ligne :
  aucune course possible, même avec plusieurs instances. Zéro ligne renvoyée
  signifie solde insuffisant ;
- **l'idempotence Stripe est une clé primaire.** `purchases.stripe_session_id`
  est unique : le second appel — webhook ou retour de paiement, dans n'importe
  quel ordre — n'insère rien et ne crédite rien ;
- une contrainte `CHECK (credits >= 0)` interdit un solde négatif même en cas
  de bug applicatif.

**Les migrations s'appliquent au démarrage**, dans `npm start`, avant
`next start` (`scripts/migrate.mjs`). C'est nécessaire parce que la base de
production n'est joignable que depuis le réseau interne de l'hébergeur : on ne
peut pas migrer depuis un poste de dev. Le script prend un verrou consultatif
Postgres — deux instances qui démarrent ensemble n'appliquent pas deux fois la
même migration —, exécute chaque fichier dans sa propre transaction, et **sort
en erreur si quoi que ce soit échoue**, pour que le déploiement s'arrête au
lieu de démarrer sur un schéma incomplet.

Pour ajouter une migration : un nouveau fichier `migrations/002_*.sql`. Ils
sont appliqués par ordre alphabétique, une seule fois, et enregistrés dans
`schema_migrations`. Ne jamais modifier un fichier déjà déployé — il ne sera
pas rejoué.

## Comment ça marche

Le coloriage est produit par un modèle de génération d'images
(`src/app/api/generate/route.ts`). Les réglages *épaisseur du trait* et *niveau
de détail* sont traduits en modificateurs de prompt (`PROMPTS`, dans ce même
fichier) — c'est le seul endroit à toucher pour ajuster le rendu ou ajouter des
styles.

L'appel passe par **LiteLLM**, un proxy devant le modèle d'images : les appels,
les jetons et le coût sont journalisés au même endroit. Le proxy est interrogé
au format OpenAI (`/v1/chat/completions`) et non par sa route de pass-through
Gemini : celle-ci attend un nom de modèle sans préfixe alors que les clés sont
autorisées sur `gemini/<modèle>`, et répond 403. L'image générée revient dans
`message.images[]`, sous forme d'URL `data:`.

**Il n'y a aucun fournisseur de secours, et c'est voulu.** Un appel direct au
modèle en cas de panne du proxy échapperait à ces relevés, ce qui viderait le
dispositif de son intérêt. Si LiteLLM est absent ou muet, l'app le dit et ne
génère rien. `GET /api/generate` renvoie `{"available":true}` quand le moteur
est joignable.

**Une génération = une image livrée.** Un modèle génératif ne produit pas deux
fois la même chose : régénérer en « haute définition » après paiement
donnerait un autre dessin que celui validé. Donc :

1. l'aperçu appelle le modèle une seule fois et garde le résultat dans
   IndexedDB (`draft:master`) ;
2. cette image survit à l'aller-retour vers Stripe ;
3. le déblocage ne fait que l'empaqueter (PDF + vignette) — aucun second appel.

Conséquence : changer un réglage ne relance pas la génération automatiquement.
L'interface signale que le dessin n'est plus à jour et propose un bouton
explicite — chaque appel coûte, autant qu'il soit voulu.

**Chaque version générée est mise en cache** dans IndexedDB, indexée par
signature de réglages (`settingsKey`). Revenir sur une combinaison déjà
essayée — Enfant → Ado → Enfant — la réaffiche instantanément et sans nouvel
appel. Le cache est purgé quand on change de photo.

## Architecture

```
src/app/                 routes (landing, creer, apercu, debloquer, merci, mes-coloriages, légal)
src/app/api/generate/    le moteur : prompts + appel au modèle via LiteLLM
src/app/api/             checkout Stripe, vérification de session, webhook
src/lib/lineart/         appel du moteur côté client + types de réglages
src/lib/server/          comptes et crédits dans Postgres
src/lib/store.ts         état persisté (brouillon, historique local)
src/lib/storage.ts       images en IndexedDB (photo, dessin généré, galerie)
src/components/          design system, sections marketing, écrans du parcours
migrations/              schéma SQL, appliqué au démarrage
scripts/migrate.mjs      exécuteur de migrations
```

## À compléter avant mise en production

- **Résolution d'impression.** Le fichier livré fait la taille que renvoie le
  modèle. Vérifier ce que ça donne en A4 et, si besoin, ajouter un
  agrandissement ou une vectorisation avant le PDF.
- **RGPD.** La photo part chez un tiers : compléter la politique de
  confidentialité (prestataire, localisation, conservation, non-réutilisation
  pour l'entraînement) et utiliser une offre payante du fournisseur, pas une
  offre gratuite qui réutilise les données.
- **Anti-abus.** L'aperçu gratuit déclenche un appel facturé : prévoir un quota
  par session/IP.
- **Sauvegardes de la base.** C'est le seul endroit où vit de l'argent :
  activer les sauvegardes planifiées côté hébergeur, et vérifier une
  restauration au moins une fois.
- **Retirer la sonde de réseau.** `src/app/api/diagnostic/route.ts` sert à
  trouver l'adresse interne du proxy LiteLLM depuis le conteneur. Elle
  n'existe que si `DIAGNOSTIC_TOKEN` est définie : vider la variable la
  désactive, mais autant supprimer le fichier une fois la config arrêtée.
- Mentions légales, CGV, politique de confidentialité : les pages existent, les
  champs `[à compléter]` attendent les infos de la société.
- Illustrations de la landing : ce sont des SVG de démonstration, pas de vraies
  photos clients.
- La galerie est locale à l'appareil : si on veut qu'elle suive le compte, il
  faut un stockage d'objets (S3, R2…) pour les PNG.
