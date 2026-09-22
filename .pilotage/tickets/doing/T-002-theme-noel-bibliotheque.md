# T-002 — Ouvrir un thème Noël dans la bibliothèque de coloriages

| | |
|---|---|
| Projet | `trait-de-famille` |
| Chantier roadmap | H1 — Pages Noël indexées avant le 15 novembre / Thème Noël dans la bibliothèque |
| KPI visé | Pages indexées |
| Créé le | 2026-09-12 par pm-lead |
| Estimation | < 1 jour côté dev (la génération et la validation des dessins en admin sont le temps de Romain) |

## Pourquoi

Coverage du 2026-09-12 (relevé du 04/09) : 24 pages indexées sur 76, les 58 pages coloriage publiées les 26-28/08 en sont à 7-9 jours d'âge et 42 URL sont encore « discovered, not indexed ». À ce rythme, une page publiée en novembre ne sera pas indexée pour Noël : le contenu saisonnier doit être en ligne le **2026-10-05 au plus tard**. Aujourd'hui `src/lib/coloriages/themes.ts` ne contient que Animaux et Dinosaures, aucun sujet Noël ; c'est la seule porte d'entrée saisonnière disponible et elle nourrit l'argument « cadeau » de l'offre payante.

## Quoi

- Ajouter un thème `noel` (nom, titre, description, extrait) dans `src/lib/coloriages/themes.ts`, avec au moins **12 sujets** : sapin, Père Noël, renne, bonhomme de neige, cadeau, boule de Noël, bonnet, traîneau, lutin, bûche, couronne, chaussette (liste indicative, à ajuster).
- Chaque sujet a une `intro` **propre à ce dessin** (ce qu'il montre, pour quel âge, une idée de couleur ou d'usage) : pas de phrase gabarit répétée. Le README l'exige et pm-seo le confirme : 58 pages qui ne se distinguent que par l'image sont le premier suspect des 7 « crawled, not indexed ».
- Titre et description de chaque page distincts entre eux (vérifiable au `curl`).
- Générer les 12 dessins depuis `/admin/coloriages` et les laisser en brouillon ; **la publication un par un est faite par Romain**, après regard sur chaque image. Le dev ne publie pas.
- Livrer le code sur `main` ; la MEP du code peut précéder la publication des dessins (le thème n'apparaît dans le sitemap qu'une fois un dessin publié).

## Critère de fin (vérifiable par le dev, seul)

- [ ] `themes.ts` contient le thème `noel` avec ≥ 12 sujets, chacun avec une `intro` distincte (aucune `intro` dupliquée : à prouver par une commande).
- [ ] En production, `/admin/coloriages` liste les 12 sujets Noël avec un dessin généré en brouillon pour chacun (capture ou décompte consigné, pas l'image).
- [ ] Après publication par Romain d'au moins un dessin : `curl -s https://trait-de-famille.fr/sitemap.xml` contient `/coloriages/noel` ; chaque URL `/coloriages/noel/<slug>` publiée répond 200 avec `<title>` et meta description distincts des autres.
- [ ] `npm run typecheck` et `npm run lint` passent.
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

## Validation PM

*(rempli par pm-lead au passage en done/ ou au renvoi en todo/)*
