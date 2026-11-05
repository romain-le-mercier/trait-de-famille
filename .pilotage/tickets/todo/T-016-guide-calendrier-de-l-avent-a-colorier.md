# T-016 — Publier un guide « calendrier de l'Avent à colorier » avec les 24 dessins existants

| | |
|---|---|
| Projet | `trait-de-famille` |
| Type | **pari** : si une page `/guides/calendrier-de-l-avent-coloriage` propose un coloriage par jour du 1er au 24 décembre (24 dessins déjà publiés), elle est indexée au 2026-12-01 et passe de 0 (page inexistante, 404 le 2026-11-05) à ≥ 60 impressions GSC sur les 28 j finissant le 2026-12-15 |
| Chantier roadmap | H1/H2 fenêtre Noël ; seuil de gel D-007 (< 10 clics/semaine au 2026-12-15 ⇒ gel jusqu'à l'été 2027) |
| KPI visé | Indexation de la page (`gsc-inspect.js`) ; impressions et clics 28 j de la page (GSC) |
| Créé le | 2026-11-05 par pm-lead |
| Estimation | < 1 jour |
| Niveau de revue | léger |

## Pourquoi

Les 13 pages Noël sont indexées (13 / 13 au 2026-11-04) mais le site reste à **0 clic** (export du 2026-11-04, données
au 01/11 : 139 impressions sur 7 j). Elles visent des requêtes courtes tenues par des sites installés ; « calendrier de
l'Avent à colorier / coloriage » est une requête saisonnière distincte, qui monte fin novembre, et à laquelle aucune
page du site ne répond : l'idée n'existe qu'en une phrase dans la fiche sapin et dans le hub (« Pendant l'Avent »).
Le site a déjà les dessins pour la faire sans rien générer : 12 Noël + des animaux d'hiver (pingouin, ours, renard,
hibou, écureuil, hérisson, loup…). Délai d'indexation mesuré sur ce site : 8 à 14 jours ; en ligne vers le 15/11, la
page entre en index avant le 1er décembre, au moment où la requête culmine.

## Quoi

1. Un guide `/guides/calendrier-de-l-avent-coloriage` déclaré dans `src/lib/guides.ts` (il entre ainsi dans
   `/guides` et le sitemap, `updated` = date de MEP), corps dans `src/app/guides/<slug>/page.tsx` sur le modèle des
   guides existants (`GuideArticle`).
2. Le corps : une courte introduction (comment s'en servir : imprimer d'avance, un dessin par soir, l'afficher), puis
   **24 jours numérotés, du 1er au 24 décembre**, chacun = un lien `<a href>` vers une fiche existante, sa vignette
   (l'image déjà servie, `alt` existant) et une phrase propre au dessin (pourquoi ce jour-là, ou une idée concrète).
   Les 12 fiches Noël y sont toutes ; les 12 autres jours sont des fiches animaux choisies pour l'hiver, au choix du
   dev (liste en tête de « Pourquoi », à compléter). Ordre qui monte vers Noël : traîneau, père Noël ou cadeau en fin
   de liste, le 24 sur la nuit de Noël.
3. Un lien vers ce guide depuis le bloc « Pendant l'Avent » du hub `/coloriages/noel` et depuis la fiche sapin (phrase
   « comme un calendrier de l'Avent fait main »).
4. Title ≤ 65 caractères servi, avec « calendrier de l'Avent » et « coloriage » ; meta description qui dit « 24
   coloriages gratuits à imprimer ». H1 cohérent. Données structurées : `Article` comme les autres guides, plus un
   `ItemList` des 24 fiches si le gabarit le permet sans tordre `GuideArticle`.

## Critère de fin (vérifiable par le dev, seul)

- [ ] À l'origine (`curl --resolve trait-de-famille.fr:443:<IP origine>`), `/guides/calendrier-de-l-avent-coloriage`
      répond 200, un seul `<h1`, et le HTML servi contient 24 liens distincts `href="/coloriages/…"`, dont les 12
      `/coloriages/noel/<slug>` (compte rejoué par `grep -o | sort -u | wc -l`).
- [ ] Les 24 cibles répondent 200 (aucun lien vers une fiche non publiée).
- [ ] Le texte des 24 jours est propre à chaque dessin : aucune phrase identique entre deux jours, et chaque phrase
      ne décrit que ce que montre le dessin servi (relu contre l'`intro` / le texte de la fiche, pas inventé).
- [ ] `/sitemap.xml` sert 87 URL (86 au 2026-11-05) dont la nouvelle, avec un `lastmod` ; `/guides` la liste.
- [ ] Le hub `/coloriages/noel` et `/coloriages/noel/sapin-de-noel` contiennent `href="/guides/calendrier-de-l-avent-coloriage"`.
- [ ] `<title>` servi ≤ 65 caractères ; `meta description` présente ; build et lint verts.

## Hors périmètre

- **Aucun nouveau dessin, aucune image générée par IA, aucun texte incrusté dans une image** : on ne réutilise que
  les PNG déjà servis. Le sujet « calendrier de l'Avent » comme dessin à part appartient à T-005, **gelé** : ne pas y toucher.
- Pas de PDF des 24 dessins (le pack Noël est T-015), pas de nouveau thème, pas de page hors `/guides`.
- Pas de modification des title/meta des fiches Noël (T-013) ni des blocs de liens dinosaures (T-014).
- Pas de compte à rebours ni de contenu qui change selon la date du jour (page statique, la même pour Google et le visiteur).

## Prérequis

Aucun.

## À consigner dans journal.md

- Date et commit de MEP, vérifiés à l'origine (statut, nombre de liens, sitemap 86 → 87).
- La liste des 24 fiches retenues, dans l'ordre.
- Title et meta servis.
- Rappel du pari : page à indexer avant le 2026-12-01 (`gsc-inspect.js`), ≥ 60 impressions sur les 28 j finissant le 2026-12-15.

---

## Retour dev

## Validation PM
