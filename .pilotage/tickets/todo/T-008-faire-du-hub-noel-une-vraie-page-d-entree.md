# T-008 — Faire de `/coloriages/noel` une vraie page d'entrée : texte par âge, liste structurée, date de mise à jour

| | |
|---|---|
| Projet | `trait-de-famille` |
| Type | **pari** : si le hub Noël porte un texte utile (par âge, impression, idées pour l'Avent), une liste structurée de ses 12 dessins et une date de mise à jour réelle dans le sitemap, alors `/coloriages/noel` est **indexé au 2026-11-20** (URL Inspection ; non indexé au 2026-10-25) et fait **≥ 100 impressions sur 28 j au 2026-12-15** (0 à l'export du 2026-10-21). **Règle d'arrêt** : non indexé au 20/11 ⇒ D-007 s'applique (plus aucun ticket cette saison) ; indexé mais < 30 impressions au 15/12 ⇒ on ne reproduit pas le gabarit sur les hubs animaux et dinosaures |
| Chantier roadmap | H1 — Pages Noël indexées avant le 20/11 (D-007) ; fenêtre de Noël |
| Objectif servi | Pages Noël indexées : **0 / 13 au 2026-10-25 → 8 / 13 au 2026-11-20** (cible retenue, D-007) — le hub est la 13ᵉ |
| Créé le | 2026-10-29 par pm-lead |
| Estimation | < 1 jour |
| Niveau de revue | léger |

## Pourquoi

Le hub `/coloriages/noel` est la page qui vise la requête de tête (« coloriage Noël à imprimer ») et celle que l'accueil, `/creer`, `/guides` et les fiches des autres thèmes lient depuis le 25/10 (T-006). Il sert aujourd'hui un H1, deux phrases (`theme.description`) et une grille d'images : rien que Google ne trouve mieux ailleurs. Il n'a pas non plus de `lastModified` dans le sitemap (`src/app/sitemap.ts` n'en donne qu'aux fiches et aux guides), alors que c'est la page qui change à chaque publication. Rendre ce hub substantiel est le seul geste de contenu qui touche les 13 URL de l'objectif à la fois : chaque fiche y est listée et décrite.

## Quoi

1. **Texte du hub** (300 à 450 mots, rédigé par le dev, LiteLLM permis, **relu**), rendu sous la grille ou entre le titre et la grille au choix du dev :
   - **Par âge** : les dessins regroupés selon leur `difficulte` réelle (aujourd'hui 5 « tout-petit », 5 « enfant », 2 « ado » — à recompter dans `themes.ts`), chaque groupe liant ses fiches ;
   - **Imprimer** : ce que le bouton de téléchargement donne réellement (format, taille, vérifié dans `TelechargerColoriage`), sans promesse non tenue ;
   - **Pendant l'Avent** : 3 ou 4 idées d'usage concrètes et vraies (un dessin par semaine, cartes, décoration de table).
   Le texte vit dans le dépôt (`themes.ts` ou un fichier de données du thème) ; seuls les hubs qui en ont un l'affichent — animaux et dinosaures inchangés.
2. **Données structurées** du hub : `CollectionPage` avec un `ItemList` des fiches publiées (nom, URL, image), généré depuis la même liste que la grille.
3. **Sitemap** : `lastModified` de chaque hub de thème = date de publication la plus récente de ses fiches (`publieLe`), absente si aucune ; rien d'autre ne change.

## Critère de fin (vérifiable par le dev, seul)

- [ ] En local, `/coloriages/noel` affiche le texte ; nombre de mots avant / après consigné ; `/coloriages/animaux` et `/coloriages/dinosaures` sans texte ajouté.
- [ ] Le JSON-LD du hub est valide (`JSON.parse` du script) et liste autant d'éléments que la grille affiche de dessins (nombre consigné).
- [ ] `/sitemap.xml` en local : 86 URL (inchangé), `<lastmod>` présent sur `/coloriages/noel` et égal au plus récent `publieLe` des fiches Noël de la base locale ; aucun autre `<lastmod>` modifié.
- [ ] Texte avant / après joint au « Retour dev », avec la ligne de relecture (ce qui a été corrigé du jet).
- [ ] `<title>`, meta description et canonical du hub inchangés.

## Hors périmètre

- Les 12 fiches (T-007), les nouvelles fiches (T-005 gelé).
- Le hub `/coloriages` (aperçu générique, réserve de T-004).
- Les offres `InStock` (question 4 ouverte au conseil), la vente, Stripe.
- Toute accroche « cadeau » qui renverrait vers un achat impossible.

## Prérequis

Aucun. **À mettre en ligne avant le 2026-11-05.**

## À consigner dans journal.md

- Date et commit de mise en production, vérifiés en ligne (à l'origine Coolify si le domaine est en défi).
- Le `<lastmod>` servi en production pour `/coloriages/noel`.
- Rappel de la baseline : hub non indexé au 2026-10-25, 0 impression à l'export du 2026-10-21.

---

## Règle de rédaction — secrets

On nomme la variable, jamais sa valeur. Voir `_pilotage/templates/ticket.md`.

---

## Retour dev

## Validation PM
