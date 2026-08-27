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
| `ADMIN_EMAILS` | Adresses autorisées sur `/admin` | L'administration répond 404 pour tout le monde |
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

### Essais et déblocage différé

Un dessin entre dans « Mes coloriages » **dès sa génération**, verrouillé : la
galerie contient les essais filigranés autant que les coloriages payés, et
`unlocked` les distingue.

C'est ce qui rend le paiement possible après coup. Un modèle génératif ne
produit pas deux fois la même image : si l'essai était jeté, payer plus tard
donnerait un autre dessin que celui qu'on a aimé. Le fichier est donc conservé
tel quel, et le déblocage ne fait que remplacer sa vignette filigranée — aucun
nouvel appel au modèle, aucun coût supplémentaire.

Deux conséquences dans le code (`src/lib/artworks.ts`) :

- **régénérer les mêmes réglages remplace l'essai précédent, jamais un
  coloriage payé.** Ce fichier-là a été vendu, il ne nous appartient plus ;
- **les essais sont plafonnés** (`MAX_TESTS`) et les plus anciens sont oubliés.
  Une image pèse près d'un mégaoctet : sans plafond, le quota du navigateur
  finirait par empêcher d'enregistrer ce qui vient d'être payé.

Quand l'utilisateur n'a pas de crédit, l'essai visé est mémorisé
(`pendingUnlockId`, persisté) avant la redirection vers Stripe : au retour,
`/merci` livre exactement ce dessin.

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

Pour ajouter une migration : un nouveau fichier `migrations/00N_*.sql`. Ils
sont appliqués par ordre alphabétique, une seule fois, et enregistrés dans
`schema_migrations`. Ne jamais modifier un fichier déjà déployé — il ne sera
pas rejoué.

### Quota d'aperçus gratuits

L'aperçu est la seule porte du site qui dépense de l'argent sans en gagner :
chaque appel est facturé par le fournisseur du modèle. `quotas_apercu` borne
la casse — **3 par jour et par IP** pour un visiteur anonyme, **30 par jour et
par compte** une fois connecté. La connexion Google fait office de second
palier : elle coûte assez d'efforts pour qu'on puisse être généreux derrière,
et un client qui a payé ne se heurte jamais au mur des anonymes.

Le décompte tient dans une seule instruction, sur le modèle du débit de
crédit :

```sql
INSERT INTO quotas_apercu (cle, jour, utilisees) VALUES ($1, CURRENT_DATE, 1)
ON CONFLICT (cle, jour) DO UPDATE
  SET utilisees = quotas_apercu.utilisees + 1
  WHERE quotas_apercu.utilisees < $2
RETURNING utilisees
```

Zéro ligne renvoyée signifie plafond atteint, et le compteur n'est pas gonflé
par les refus. Vérifié sur une base jetable : dix requêtes simultanées avec un
plafond de trois donnent exactement trois acceptations.

Trois choix à connaître :

- **le décompte passe avant l'appel au modèle**, après la validation de la
  photo : une requête malformée ne coûte rien, donc ne consomme rien ;
- **il est rendu si le modèle échoue** — personne ne perd son tour pour une
  panne qui n'est pas la sienne ;
- **base injoignable, on laisse passer.** Le garde protège un budget, pas une
  donnée : un client qui a payé ne doit pas être bloqué par une panne
  d'infrastructure. L'incident part dans les journaux.

`GET /api/generate` renvoie `restant` et `plafond`. `restant: null` signifie
qu'aucun garde n'est en place — développement local, ou base injoignable.
C'est délibérément visible de l'extérieur : un quota inactif doit se constater,
pas se supposer.

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

**Le cache du proxy est explicitement désactivé** (`cache: {"no-cache", "no-store"}`).
LiteLLM indexe ses réponses sur le corps de la requête, et nos prompts sont
déterministes : deux générations de suite pour le même sujet, ou pour la même
photo avec les mêmes réglages, renvoyaient l'image précédente en quatre
dixièmes de seconde. « Générer une autre version » et « Régénérer » n'ont de
sens que s'ils redessinent — un cache les rend silencieusement inopérants et
donne l'impression que le bouton est cassé.

**Il n'y a aucun fournisseur de secours, et c'est voulu.** Un appel direct au
modèle en cas de panne du proxy échapperait à ces relevés, ce qui viderait le
dispositif de son intérêt. Si LiteLLM est absent ou muet, l'app le dit et ne
génère rien. `GET /api/generate` renvoie `{"available":true}` quand le moteur
est joignable.

**Une génération = une image livrée.** Un modèle génératif ne produit pas deux
fois la même chose : régénérer en « haute définition » après paiement
donnerait un autre dessin que celui validé. Donc :

1. l'aperçu appelle le modèle une seule fois et range le résultat dans la
   galerie (`art:hd:<id>`), verrouillé ;
2. cette image survit à l'aller-retour vers Stripe, et même à un changement de
   photo : elle reste dans « Mes coloriages » ;
3. le déblocage ne fait que l'empaqueter (PDF + vignette) — aucun second appel.

Conséquence : changer un réglage ne relance pas la génération automatiquement.
L'interface signale que le dessin n'est plus à jour et propose un bouton
explicite — chaque appel coûte, autant qu'il soit voulu.

**Chaque version générée est retrouvée par photo + signature de réglages.** La
photo est identifiée par l'empreinte SHA-256 de son contenu (`photoFingerprint`,
`Draft.photoKey`), pas par le dépôt : revenir sur une combinaison déjà essayée —
Enfant → Ado → Enfant — *et* redéposer un fichier déjà transformé réaffichent le
dessin instantanément, sans appel au modèle ni doublon dans la galerie. L'aperçu
le signale, sans quoi un résultat immédiat passerait pour un bug.

La comparaison est exacte, à l'octet près. Une photo réenregistrée ou
recompressée est une photo différente, et c'est voulu : mieux vaut redessiner
que risquer de servir le coloriage d'une autre image.

## Bibliothèque de coloriages gratuits

`/coloriages` est une section d'acquisition : des dessins gratuits à imprimer,
qui captent une demande de recherche massive et ancienne en français. Le
public qui la cherche — un parent, une imprimante, un enfant qui colorie — est
exactement l'acheteur du produit payant, d'où l'accroche « et si c'était ton
enfant ? » sur chaque page.

**L'essentiel du trafic vient de Google Images**, pas des résultats classiques.
D'où le nom de fichier descriptif (`coloriage-<sujet>-a-imprimer.<ext>`), le
`alt`, le `ImageObject` en JSON-LD et l'extension qui suit le format réellement
renvoyé par le modèle — une URL en `.png` qui sert du JPEG ment sur son
contenu, et c'est cette URL qui est indexée.

### Une séparation à tenir

- **Les sujets sont dans le dépôt** (`src/lib/coloriages/themes.ts`) : quoi
  dessiner, sous quel titre, avec quelle introduction. C'est de l'éditorial, ça
  se relit en revue de code et ça se versionne.
- **Les dessins sont en base**, produits depuis `/admin/coloriages`.

`intro` doit dire quelque chose de vrai et de particulier à chaque dessin.
Sans ça, mille pages ne se distinguent que par leur image, et Google les traite
pour ce qu'elles sont — du remplissage.

### Rien ne paraît sans relecture

Un dessin généré est un **brouillon**. Il n'existe pour le public qu'une fois
publié depuis l'administration, un par un, avec l'image sous les yeux. Ce n'est
pas une précaution de confort :

- un coloriage aux zones ouvertes, gris ou tramé est inutilisable, et pire que
  pas de page du tout ;
- Google sanctionne depuis 2024 le **contenu produit en masse** sans valeur
  ajoutée. Une bibliothèque générée sans regard humain en a exactement la
  forme, et une sanction toucherait aussi les pages de vente.

Régénérer un dessin déjà publié le **repasse en brouillon** : on ne remplace
pas sans le voir une image déjà en ligne.

### Administration

`/admin/coloriages`, réservée aux adresses de `ADMIN_EMAILS`. **Fermée par
défaut** : sans la variable, elle répond 404 pour tout le monde. Une porte qui
s'ouvre quand la configuration manque est une porte ouverte le jour où la
variable saute.

Le lot est enchaîné **côté client, un sujet à la fois**, avec un bouton
d'arrêt. Chaque appel coûte : une boucle côté serveur rendrait la dépense
invisible et impossible à interrompre. Un échec arrête tout — si le moteur est
en panne, continuer ne ferait qu'aligner trente erreurs.

Publier vide le cache des pages concernées (`revalidatePath`), sinon le dessin
n'apparaîtrait qu'au prochain déploiement.

### Ce qu'il faudra reprendre

- **Les images sont dans Postgres.** Tenable pour quelques centaines de
  dessins, et ça évite de monter du stockage objet pour un lot pilote. Au-delà,
  il faut les sortir vers S3/R2 : les sauvegardes deviendraient énormes.
- **Les pages sont rendues à la demande** (`force-dynamic`) parce que la base
  n'est pas joignable au build. Le poids réel — les images — est mis en cache
  une journée par sa propre route. Si le trafic grossit, passer en ISR.
- **Ne pas produire mille pages avant d'en avoir mesuré cinquante.** La seule
  métrique qui compte au départ est le taux de clic de ces pages vers `/creer`.
  Si beaucoup de visites ne donnent rien, le problème est l'accroche, pas le
  nombre de pages.

## Mesure d'audience

Umami auto-hébergé, sans cookie ni donnée personnelle : pas de bandeau de
consentement à afficher. La sonde n'est chargée que si le site tourne sur son
vrai domaine (`NEXT_PUBLIC_SITE_URL`), pour que le développement local ne
pollue pas les statistiques.

Sept événements, dans `src/lib/analytics.ts` :

| Événement | Où | Ce qu'il répond |
| --- | --- | --- |
| `photo-deposee` | `UploadFlow` | combien de visiteurs se lancent |
| `generation-reussie` | `PreviewFlow` | combien d'appels au modèle sont facturés |
| `generation-echouee` | `PreviewFlow` | coût engagé sans valeur livrée |
| `apercu-vu` | `PreviewFlow` | valeur livrée ; `reprise: true` = servi sans rappeler le modèle |
| `paiement-ouvert` | `PaywallFlow` | qui va jusqu'à Stripe, et pour quel pack |
| `paiement-reussi` | `SuccessFlow` | la conversion |
| `coloriage-debloque` | `unlockArtwork` | crédit dépensé, fichier livré |

Deux règles tiennent le fichier : **la mesure ne casse jamais le produit** —
chaque appel est sans effet si la sonde est absente ou bloquée, et protégé par
un `try` ; **rien de personnel n'en sort** — pas de nom de fichier, pas
d'identifiant de dessin, pas d'adresse e-mail.

`coloriage-debloque` est posé dans `unlockArtwork` et non dans les écrans :
deux chemins y mènent (l'aperçu, et le retour de paiement), un seul point de
passage les couvre tous les deux. `paiement-reussi` est gardé par
`premiereFois()` : `/merci` est rechargeable et la vérification est
idempotente, donc sans garde un rechargement compterait un paiement de plus.

## Architecture

```
src/app/                 routes (landing, creer, apercu, debloquer, merci, mes-coloriages, légal)
src/app/api/generate/    prompts de conversion d'une photo
src/app/api/             checkout Stripe, vérification de session, webhook
src/app/coloriages/      bibliothèque gratuite (hub, thèmes, dessins, images)
src/app/admin/           génération et relecture de la bibliothèque
src/lib/coloriages/      sujets et prompts de la bibliothèque
src/lib/server/litellm.ts  le seul dialogue avec le moteur d'images
src/lib/lineart/         appel du moteur côté client + types de réglages
src/lib/server/          comptes et crédits dans Postgres
src/lib/server/quotas.ts   quota d'aperçus gratuits
src/lib/analytics.ts     événements du tunnel envoyés à Umami
src/lib/artworks.ts      vie d'un dessin : essai, déblocage, oubli
src/lib/store.ts         état persisté (brouillon, galerie locale)
src/lib/storage.ts       images en IndexedDB (photo, dessins)
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
- **Le filigrane est une barrière d'usage, pas de sécurité.** L'image sans
  filigrane est écrite dans l'IndexedDB du visiteur dès la génération — c'est
  ce qui permet de payer après coup sans redessiner. Quelqu'un d'outillé peut
  l'en extraire. Si ça devient un problème, il faut garder le fichier côté
  serveur et ne servir que le filigrané avant paiement.
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
- **Résolution des coloriages gratuits.** Le modèle renvoie environ 864×1248,
  soit près de trois fois moins qu'un A4 à 300 ppp. C'est acceptable pour du
  gratuit, mais l'agrandissement se voit à l'impression. Il renvoie aussi du
  JPEG, mal adapté à un trait noir sur blanc : convertir en PNG n'y changerait
  rien, la perte est déjà faite. À traiter avec le point « résolution
  d'impression » ci-dessus si ça gêne.
- **Photos de démonstration.** L'avant/après de `EtSiCetaitToi` montre des
  personnes identifiables, dont un enfant, et il apparaît désormais sur chaque
  page de la bibliothèque : la question des droits de publication devient plus
  pressante qu'elle ne l'était sur la seule landing.
- La galerie est locale à l'appareil : si on veut qu'elle suive le compte, il
  faut un stockage d'objets (S3, R2…) pour les PNG.
