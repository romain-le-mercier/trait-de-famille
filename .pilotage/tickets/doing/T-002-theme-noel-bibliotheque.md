# T-002 — Ouvrir un thème Noël dans la bibliothèque de coloriages

| | |
|---|---|
| Projet | `trait-de-famille` |
| Chantier roadmap | H1 — Pages Noël indexées avant le 15 novembre / Thème Noël dans la bibliothèque |
| KPI visé | Pages indexées |
| Créé le | 2026-09-12 par pm-lead |
| Estimation | < 1 jour côté dev (la génération et la validation des dessins en admin sont le temps de Romain) |

## Pourquoi

**Actualisé le 2026-09-17 — priorité 1 sur 2, ce ticket passe devant T-003 : c'est le seul chantier du site qui serve encore une cible jugeable.** Coverage du **2026-09-14** : **43 pages indexées sur 73 URL au sitemap** (24 dix jours plus tôt), 29 encore « discovered, not indexed ». **Le délai d'indexation est désormais mesuré sur ce site, et c'est lui qui fixe le butoir** : les pages publiées les 26-28/08 sont entrées **entre le 05 et le 09/09, soit 8 à 14 jours**, et **30 des 73 URL ne sont toujours pas indexées à J+18**. Une page publiée en novembre ne sera donc pas indexée pour Noël : le code doit être en production le **2026-10-05 au plus tard**, et **les dessins publiés par Romain le 2026-10-15 au plus tard** (butoir ajouté le 17/09 ; au-delà, l'entrée en index tombe après le 29/10 et manque le début des recherches de Noël). **La valeur de ce ticket ne dépend PAS de Stripe** : il sert l'indexation — seul KPI encore jugeable, Stripe étant suspendu par décision de Romain du 14/09 — et la bibliothèque gratuite, pas la vente.

**Correction reportée le 2026-09-22 depuis ROADMAP (« Correction à reporter dans T-002 par le dev ») : `themes.ts` comptait 58 sujets avant ce chantier, pas 63 ; la déduction des « 5 brouillons en attente » n'a plus d'objet. Aucun critère de fin n'est affecté. Le paragraphe suivant est conservé tel qu'écrit, et il est périmé sur ces deux points.**

**Deux corrections au ticket d'origine, à connaître avant de commencer :** (1) `themes.ts` déclare **63 sujets**, et non 67 ; (2) pour 58 publiés, **5 dessins semblent déjà générés et jamais publiés** — déduction de code, la base n'est pas lisible depuis le pilotage. Si elle se confirme, **le goulot n'est pas le code mais la publication un par un par Romain**, et le dev doit le signaler dans son « Retour dev » plutôt que d'attendre.

*(Contexte d'origine, conservé : Coverage du 2026-09-12 (relevé du 04/09), 24 pages indexées sur 76, 42 URL en « discovered, not indexed ».)* Aujourd'hui `src/lib/coloriages/themes.ts` ne contient que Animaux et Dinosaures, aucun sujet Noël ; c'est la seule porte d'entrée saisonnière disponible et elle nourrit l'argument « cadeau » de l'offre payante.

## Quoi

- Ajouter un thème `noel` (nom, titre, description, extrait) dans `src/lib/coloriages/themes.ts`, avec au moins **12 sujets** : sapin, Père Noël, renne, bonhomme de neige, cadeau, boule de Noël, bonnet, traîneau, lutin, bûche, couronne, chaussette (liste indicative, à ajuster).
- Chaque sujet a une `intro` **propre à ce dessin** (ce qu'il montre, pour quel âge, une idée de couleur ou d'usage) : pas de phrase gabarit répétée. Le README l'exige et pm-seo le confirme : 58 pages qui ne se distinguent que par l'image sont le premier suspect des 7 « crawled, not indexed ».
- Titre et description de chaque page distincts entre eux (vérifiable au `curl`).
- Générer les 12 dessins depuis `/admin/coloriages` et les laisser en brouillon ; **la publication un par un est faite par Romain**, après regard sur chaque image. Le dev ne publie pas.
- Livrer le code sur `main` ; la MEP du code peut précéder la publication des dessins (le thème n'apparaît dans le sitemap qu'une fois un dessin publié).

## Critère de fin (vérifiable par le dev, seul)

- [x] `themes.ts` contient le thème `noel` avec ≥ 12 sujets, chacun avec une `intro` distincte (aucune `intro` dupliquée : à prouver par une commande).
  Preuve (22/09) : `sed -n '/^const NOEL/,/^export const THEMES/p' src/lib/coloriages/themes.ts | grep -c '^    slug: '` → `12` ; `grep -A1 '^    intro:' … | sort | uniq -d` → vide sur les 70 sujets (idem pour `titre:` et `slug:`).
- [ ] En production, `/admin/coloriages` liste les 12 sujets Noël avec un dessin généré en brouillon pour chacun (capture ou décompte consigné, pas l'image).
- [ ] Après publication par Romain d'au moins un dessin : `curl -s https://trait-de-famille.fr/sitemap.xml` contient `/coloriages/noel` ; chaque URL `/coloriages/noel/<slug>` publiée répond 200 avec `<title>` et meta description distincts des autres.
- [x] `npm run typecheck` et `npm run lint` passent.
  Preuve (22/09) : `npm run -s typecheck && echo TC_OK && npm run -s lint && echo LINT_OK` → `TC_OK`, `LINT_OK`.
- [ ] Date de MEP du code ≤ 2026-10-05.

## Hors périmètre

- Guide éditorial Noël, page d'atterrissage `/noel`, accroche cadeau sur l'accueil ou l'aperçu (viendront après T-001).
- Modification du gabarit de page sujet ou de page thème, du sitemap, du rendu `force-dynamic`.
- Autres thèmes saisonniers, nouveaux sujets dans Animaux ou Dinosaures (voir « Ne pas faire » dans ROADMAP).
- Publier les dessins : c'est Romain.
- Le paywall (T-001).

## Prérequis

- `ADMIN_EMAILS` renseigné en production avec l'adresse du dev ou de Romain (sinon `/admin` répond 404) : à confirmer par Romain avant la génération.
- Le moteur LiteLLM répond (`GET /api/generate` → `available: true`). Coût attendu : 12 à 24 appels modèle (hypothèse ~0,04 €/appel, non vérifiée) ; le consigner.

## À consigner dans journal.md

- Date et commit de mise en production du code, vérifiés en ligne.
- Nombre de sujets ajoutés, nombre de dessins générés, nombre d'appels modèle (échecs compris).
- Nombre d'URL du sitemap avant / après la première publication (attendu : 73 → ≥ 86 une fois les 12 publiés).
- Date à laquelle Romain a publié le dernier des 12 (si connue du dev ; sinon Romain l'écrit dans `retours-romain.md`).

---

## Retour dev

*(rempli par le dev, en doing/ ou review/ — fait, partiellement fait, bloqué, abandonné ; ce qui s'est révélé faux dans le ticket ; ce que le PM ne peut pas voir)*

**Contrainte de publication — les 8 sujets nommés par la description du thème doivent être publiés, sinon la description change : `sapin-de-noel`, `pere-noel`, `renne-de-noel`, `bonhomme-de-neige`, `buche-de-noel`, `chaussette-de-noel`, `bonnet-de-noel`, `couronne-de-noel`.** (Huit et non six : la seconde phrase cite aussi le bonnet et la couronne.)

**État au 2026-09-22 : partiel — code fait, non commité ; tout ce qui suit dépend de la MEP (geste de Romain).**

- Fait : thème `noel` dans `themes.ts`, 12 sujets (sapin-de-noel, pere-noel, renne-de-noel, bonhomme-de-neige, cadeau-de-noel, boule-de-noel, bonnet-de-noel, traineau-du-pere-noel, lutin-de-noel, buche-de-noel, couronne-de-noel, chaussette-de-noel — slugs définitifs après revue ; ce sont eux que le critère 3 doit interroger), difficultés réparties 5 tout-petit / 5 enfant / 2 ado. Titre = `<title>`, intro = meta description (`generateMetadata`), donc distincts par construction.
- Slugs suffixés `-de-noel` à dessein : le slug est la **clé primaire** de `coloriages` tous thèmes confondus (`migrations/002`), un « sapin » nu bloquerait tout futur sapin hors saison.
- **Faux dans le ticket : « 63 sujets » est inexact, c'était 58.** `grep -c '^    slug: '` = 73 après ajout, dont 3 slugs de thème → 70 sujets = 36 animaux + 22 dinosaures + 12 Noël. **58 déclarés pour 58 publiés : le code ne suggère aucun brouillon en attente.** Le « goulot de publication » déduit du 17/09 n'a pas d'appui dans le code.
- **Boucle de redirection signalée par le PM le 22/09 : non reproduite à 18:00 UTC le même jour.** `curl -sI` : apex → 301 → `www` ; `www` → **200** ; `curl -sL` sur l'apex : 1 redirection, final 200. Sitemap servi (200, 73 URL, 0 `noel`), `/api/generate` → `available: true`.
- **Ce que le PM ne voit pas, hors périmètre, non touché** : le sitemap déclare **toutes ses URL sur l'apex** (`https://trait-de-famille.fr/…`) alors que Cloudflare redirige l'apex vers `www`. Chaque URL du sitemap est donc une redirection, et le canonique du code contredit l'hôte servi. À arbitrer (Cloudflare vers l'apex, ou `SITE_URL` en `www`) — ce n'est pas ce ticket.
- Critère 2 (brouillons en admin) : **bloqué par la MEP**, pas par l'admin. Les 12 sujets n'existent en production qu'une fois `themes.ts` déployé. `/admin/coloriages` répond 404 sans session admin, ce qui est le comportement attendu ; `ADMIN_EMAILS` reste à confirmer par Romain.
- Critère 3 (sitemap / 200) : non vérifiable avant publication d'un dessin par Romain. La boucle de redirection a été corrigée par Romain (config Coolify, confirmé par le PM le 22/09) : le critère se rejouera normalement après publication.
- Critère 5 (MEP ≤ 05/10) : dépend du commit et du push de Romain.
- Reste avant `/livrer` : commit sur demande de Romain, MEP, génération des 12 brouillons.

Revue adversariale du 2026-09-22 : 17 défauts rapportés en deux tours (10 + 7), 2 retenus et corrigés au tour 1, 0 retenu au tour 2 (ses 5 défauts de fond corrigés avant contre-expertise, puis réfutés par elle sur le code corrigé), 6 mineurs notés, 3 hérités remontés au PM, 1 réfuté sur le fond (superlatifs « de la série »).
Reviewers exécutés en agents généralistes appliquant leur définition `~/.claude/agents/*.md` : les types `reviewer-*` ne sont pas chargés dans la session Windows du projet.

- Retenus corrigés : (1) slugs nus `renne`, `lutin` (et `traineau`) → suffixés, un futur sujet homonyme aurait écrasé le dessin Noël via l'upsert `ON CONFLICT (slug) DO UPDATE SET theme` ; (2) des `intro` (donc meta descriptions) affirmaient des détails absents du `nom`, seul texte envoyé au modèle — les 12 `nom` couvrent désormais tout ce que leur `intro` décrit (Père Noël, couronne sans bougies, chaussette à revers uni, cadeau empilé, lutin, boule, traîneau).
- Mineurs :
  - La description du thème nomme huit sujets (voir la contrainte en tête) : fausse tant que la publication un par un n'est pas finie, ou définitivement si l'un d'eux est rejeté. « douze » a été retiré de l'excerpt ; la liste reste.
  - `pere-noel` et `cadeau-de-noel` en `tout-petit` avec un `nom` chargé : à juger sur l'image par Romain à la relecture.
  - `bonhomme-de-neige` non suffixé, exception assumée et commentée (expression exacte cherchée) : un futur thème hiver devra prendre le suffixe.
  - **Procédure de retrait** : pour retirer le thème après publication, passer d'abord les dessins `noel` en `rejete` ou les supprimer depuis `/admin/coloriages`, **puis** seulement retirer le code. Dans l'autre ordre, le sitemap garde des URL en 404 et l'admin ne montre plus les lignes.
  - Romain relit en admin l'image face au `nom`, jamais face à l'`intro` publiée.
- Hérités (pour le PM) :
  - `sitemap.ts` construit les URL de dessins depuis `listerPublies()` sans filtrer par `THEMES` : un sujet retiré du code reste au sitemap en 404.
  - Aucune assertion d'unicité des slugs entre thèmes alors que la clé est globale (`migrations/002`) : la protection ne tient qu'à la discipline de nommage.
  - L'excerpt Dinosaures dit « vingt-deux » en dur, à côté du compteur réel des dessins publiés.

## Validation PM

*(rempli par pm-lead au passage en done/ ou au renvoi en todo/)*
