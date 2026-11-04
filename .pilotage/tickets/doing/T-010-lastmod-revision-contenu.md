# T-010 — Le lastmod suit la révision du contenu, pas seulement la publication de l'image

| | |
|---|---|
| Projet | `trait-de-famille` |
| Type | **pari** (même pari que T-007/T-008 : aucune des 12 fiches Noël « Explorée, non indexée » au 20/11, hub indexé au 20/11, ≥ 150 impressions/28 j au 15/12) : un lastmod qui dit « changé le 30/10 » fait recrawler les 13 pages refaites avant la fenêtre |
| Chantier roadmap | Fenêtre Noël (T-007, T-008, T-009) |
| KPI visé | Impressions/28 j des pages Noël |
| Créé le | 2026-10-30 par le chef d'orchestre (vérification en ligne de T-008) |
| Estimation | < 1/2 jour |
| Niveau de revue | léger |

## Pourquoi

Relevé en ligne le 30/10 après la MEP de T-008 : `sitemap.xml` donne `2026-10-05` pour `/coloriages/noel` et pour
`/coloriages/noel/sapin-de-noel`, alors que les 12 fiches ont été réécrites le 29-30/10 (T-007, T-009) et le hub le 30/10
(T-008). `src/app/sitemap.ts` : fiche = `dessin.publieLe` (l. 32), hub = la plus récente des fiches (l. 53). Google ne
voit donc aucun changement.

## Quoi

1. Une date de révision du contenu (`reviseLe`, ISO) portée par les données des fiches et des hubs là où vit leur texte
   (`src/lib/coloriages/themes.ts` ou équivalent), facultative.
2. `lastModified` = la plus récente de `publieLe` et `reviseLe` pour une fiche ; pour un hub, la plus récente de sa
   propre `reviseLe` et de celles de ses fiches.
3. Renseigner `reviseLe` pour les 12 fiches Noël (date du commit de T-007 ou T-009 qui a changé leur texte) et le hub
   Noël (date du commit de T-008). Pas de date inventée pour les autres pages : sans révision, rien ne change.

## Critère de fin (vérifiable par le dev, seul)

- [ ] Build local : `sitemap.xml` donne pour `/coloriages/noel` et les 12 fiches une date du 29 ou 30/10/2026 (= commits
      cités) ; `/coloriages/animaux` et `/coloriages/dinosaures` inchangés par rapport à la prod du 30/10.
- [ ] Aucune autre URL du sitemap ne change de lastmod (diff des deux sitemaps, prod et local, joint).

## Hors périmètre

Le contenu des pages, `changefreq`, `priority`, d'autres sections du site.

## À consigner dans journal.md

- Date et commit de MEP, lastmod du hub et d'une fiche relus en ligne ; le chef resoumet le sitemap à Google.
