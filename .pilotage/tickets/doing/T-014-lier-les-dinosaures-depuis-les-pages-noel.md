# T-014 — Lier les 22 fiches dinosaures depuis les pages Noël, que Google visite en ce moment

| | |
|---|---|
| Projet | `trait-de-famille` |
| Type | **pari** : si les 13 pages Noël (recrawlées du 25/10 au 03/11) lient les fiches dinosaures, les dinosaures indexés passent de 3 / 22 (2026-11-04) à ≥ 12 / 22 au 2026-12-15 |
| Chantier roadmap | Indexation du site ; seuil de gel D-007 (< 10 clics/semaine au 2026-12-15) |
| KPI visé | Fiches dinosaures indexées (`gsc-inspect.js`, verdict PASS) ; pages indexées du site |
| Créé le | 2026-11-04 par pm-lead |
| Estimation | < 1/2 jour |
| Niveau de revue | léger |

## Pourquoi

Relevé `gsc-inspect.js` des 86 URL du sitemap le 2026-11-04 : **64 / 86 indexées**. Les animaux sont à **36 / 36**, Noël
à **13 / 13**, les dinosaures à **3 / 22** : 15 en « Erreur liée à des redirections » (dernier crawl du 15 au 21/09,
pendant la boucle corrigée le 22/09), 3 inconnues de Google, 1 « Détectée, non indexée ». Elles répondent 200 sans
redirection à l'origine Coolify (vérifié le 04/11 sur `allosaure`, `spinosaure`). Google ne revient pas les voir : seul le
hub `/coloriages/dinosaures` les lie, et il n'a pas été recrawlé depuis le 23/10. Le même levier a marché pour Noël :
T-006 a lié les fiches Noël depuis les pages que Google recrawle, 0 / 13 → 13 / 13 en dix jours (avec les demandes
d'indexation de Romain, donc effet non isolé). Aujourd'hui, une fiche Noël ne lie **aucune** fiche dinosaure ni animal
(relevé du HTML servi de `/coloriages/noel/couronne-de-noel`, 04/11) ; ce sont pourtant les pages que Google visite le
plus en ce moment (crawls du 01 au 03/11).

## Quoi

1. Sur chacune des 12 fiches Noël, un bloc « D'autres coloriages » de 4 à 6 liens vers des fiches dinosaures (lien
   `<a href>` en HTML servi, pas de chargement client), avec une répartition déterministe telle que **chacune des 22
   fiches dinosaures reçoive au moins 2 liens** depuis l'ensemble des 12 fiches Noël.
2. Sur le hub `/coloriages/noel`, un lien vers `/coloriages/dinosaures` et un vers `/coloriages/animaux`.
3. Les vignettes réutilisent les images déjà publiées (aucune nouvelle image).

## Critère de fin (vérifiable par le dev, seul)

- [ ] HTML servi (build de prod local, puis origine Coolify après MEP) : chaque fiche Noël porte 4 à 6 liens
      `href="/coloriages/dinosaures/<slug>"` vers des fiches publiées ; décompte par fiche joint.
- [ ] Sur l'ensemble des 12 fiches Noël, les 22 slugs dinosaures apparaissent chacun au moins 2 fois (tableau joint) ;
      aucun lien vers une fiche non publiée ou en 404.
- [ ] Le hub `/coloriages/noel` lie `/coloriages/dinosaures` et `/coloriages/animaux`.
- [ ] Title, meta, H1, canonical et JSON-LD des pages touchées inchangés ; sitemap toujours 86 URL.
- [ ] Temps de réponse de la fiche Noël à l'origine : pas plus de 100 ms de plus qu'avant (mesure avant/après jointe).

## Hors périmètre

- Toute redirection, désindexation, changement d'URL des dinosaures.
- Le contenu des fiches dinosaures, les fiches animaux (déjà 36 / 36).
- Nouveaux dessins, images générées, texte dans les images.

## Prérequis

Aucun. Construire en conteneur `node:20`.

## À consigner dans journal.md

- Date et commit de MEP, vérifiés à l'origine Coolify.
- Baseline : dinosaures indexés 3 / 22, site 64 / 86 (`gsc-inspect.js`, 2026-11-04). Le PM relève à J+14 et au 15/12.
- Si Romain redemande l'indexation de fiches dinosaures dans la console pendant le test, la date (l'effet ne sera plus
  isolé).

---

## Retour dev

*(rempli par le dev, en doing/ ou review/ — fait, partiellement fait, bloqué, abandonné ; ce qui s'est révélé faux dans le ticket ; ce que le PM ne peut pas voir)*

## Validation PM

*(rempli par pm-lead au passage en done/ ou au renvoi en todo/)*
