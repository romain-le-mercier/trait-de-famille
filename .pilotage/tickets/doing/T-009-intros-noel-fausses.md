# T-009 — Corriger les trois intros Noël qui décrivent mal leur dessin

| | |
|---|---|
| Projet | `trait-de-famille` |
| Type | **pari** (suite de T-007, même pari : aucune des 12 fiches Noël « Explorée, non indexée » au 20/11, ≥ 150 impressions/28 j au 15/12) : une fiche dont l'intro (= meta description) contredit sa propre section « Ce que montre le dessin » est le signal de faible qualité que T-007 veut retirer |
| Chantier roadmap | Fenêtre Noël (T-007, T-008) |
| KPI visé | Impressions/28 j des 12 fiches Noël |
| Créé le | 2026-10-29 par le chef d'orchestre (remontée du dev de T-007) |
| Estimation | < 1 h |
| Niveau de revue | léger |

## Pourquoi

Le dev de T-007 a regardé les images publiées : trois intros existantes (`intro` dans `src/lib/coloriages/themes.ts`,
servie aussi en meta description) décrivent le prompt, pas le dessin.
- `cadeau-de-noel` : « chacun avec son ruban et son nœud » ; un seul paquet porte un nœud, au sommet. La fiche se
  contredit depuis T-007.
- `pere-noel` : « la hotte » est un sac ; « la barbe jusqu'à la ceinture » est exagéré (barbe sur la poitrine).
- `buche-de-noel` : « champignons en meringue » ne se voient pas ; « le 25 » est une date en chiffres.

## Quoi

Réécrire ces trois `intro` d'après l'image publiée (la regarder), même longueur (≈ 30-40 mots, 150-160 caractères
utiles pour la meta description), même ton. Rien d'autre.

## Critère de fin (vérifiable par le dev, seul)

- [ ] Les trois intros avant / après dans le Retour dev, chacune avec la phrase de l'image qui la justifie.
- [ ] Rendu HTML des trois fiches : `<meta name="description">` = nouvelle intro ; aucun « hotte », « ceinture » (pour la
      barbe), « meringue », « chacun avec son ruban » ; aucune contradiction avec « Ce que montre le dessin ».
- [ ] Les 9 autres intros, `<title>`, canonical, JSON-LD : inchangés (`git diff` limité aux trois lignes).

## Hors périmètre

Les sections de T-007, les `nom` (prompts), les images, les autres fiches.

## Prérequis

T-007 sur main.

## À consigner dans journal.md

- Date et commit de MEP, vérifiés en ligne (meta description des trois fiches).
