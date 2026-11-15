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

Preuves rejouées le 2026-11-15 sur le build de `934ee3a` (`next start`, base Postgres jetable semée avec les 48
dessins animaux + Noël publiés en production, relevés dans `/sitemap.xml` servi à l'origine `51.210.6.44` le même jour).
**À rejouer à l'origine après la MEP** : je n'ai ni poussé ni déployé.

- [x] `/guides/calendrier-de-l-avent-coloriage` répond **200**, **1** `<h1`, **24** liens fiches distincts
      (`grep -oE 'href="/coloriages/[a-z]+/[^"]*"' | sort -u | wc -l` → 24), dont **12** `/coloriages/noel/<slug>`.
      ⚠️ Le compte du ticket, `grep -o 'href="/coloriages/…"'` sans exiger le slug, donne **25** : le pied de page commun
      (`SiteFooter.tsx:15`) lie `/coloriages/noel` sur toutes les pages. Compter `/coloriages/<thème>/<slug>`.
- [x] Les 24 cibles répondent 200 (boucle `curl` sur les 24 hrefs : 24 × 200). Les 24 fiches sont publiées en
      production (présentes au sitemap de l'origine le 2026-11-15). Une fiche dépubliée perd son lien et son entrée
      ItemList (testé : écureuil passé en brouillon → 23 liens, `numberOfItems` 23, le texte du jour reste sans lien).
- [x] 24 phrases, 24 distinctes, aucune demi-phrase (de part et d'autre du « : ») répétée (contrôle Python sur le
      source). Chaque phrase est tirée de l'`intro` et, pour les 12 Noël, du champ `dessin` de la fiche ; les idées
      (prénom sur le revers, cadeau rêvé sur les paquets, atelier du lutin) reprennent l'`ideeNoel` de la fiche.
- [x] Sitemap local : 64 URL = 86 de l'origine − 23 URL dinosaures (non semées dans ma base) + **1**, la nouvelle
      (`diff` des chemins : seule `/guides/calendrier-de-l-avent-coloriage` en plus), `lastmod` 2026-11-15. `/guides` la liste.
- [x] `/coloriages/noel` et `/coloriages/noel/sapin-de-noel` contiennent `href="/guides/calendrier-de-l-avent-coloriage"`,
      posé sur la phrase existante « comme un calendrier de l'Avent fait main » (et aussi, sur toutes les pages, dans
      la liste des guides du pied de page, qui lit `guides.ts`).
- [x] `<title>` servi : « Coloriage calendrier de l'Avent : 24 dessins · Trait de Famille », **63** caractères ; meta
      description présente (162 car.) ; `tsc --noEmit`, `eslint .` et `next build` verts.

## Hors périmètre

- **Aucun nouveau dessin, aucune image générée par IA, aucun texte incrusté dans une image** : on ne réutilise que
  les PNG déjà servis. Le sujet « calendrier de l'Avent » comme dessin à part appartient à T-005, **gelé** : ne pas y toucher.
- Pas de PDF des 24 dessins (le pack Noël est T-015), pas de nouveau thème, pas de page hors `/guides`.
- Pas de modification des title/meta des fiches Noël (T-013) ni des blocs de liens dinosaures (T-014).
- Pas de compte à rebours ni de contenu qui change selon la date du jour (page statique, la même pour Google et le visiteur).

## Prérequis

Aucun.

## À consigner dans journal.md

- Date et commit de MEP, vérifiés à l'origine (statut, nombre de liens, sitemap +1).
- La liste des 24 fiches retenues, dans l'ordre.
- Title et meta servis.
- Rappel du pari : page à indexer avant le 2026-12-01 (`gsc-inspect.js`), ≥ 60 impressions sur les 28 j finissant le 2026-12-15.

---

## Retour dev

**Fait.** Commits `f66d7b6` (guide, liens) et `934ee3a` (corrections de revue), branche `ticket/T-016`, non poussée.

Revue adversariale du 2026-11-15 (niveau léger, reviewer-seo seul) : 3 défauts rapportés, 3 corrigés (tous mineurs),
0 hérité, 0 réfuté. Corrigés : base muette → la page lève l'erreur (5xx, comme le hub et les fiches) au lieu de lier
24 fiches non vérifiées ; `position` de l'ItemList = numéro du jour même si une fiche manque ; correspondance des
dessins publiés sur `thème/slug` et non sur le slug seul.

Les 24 jours : 1 chat · 2 bonnet-de-noel · 3 lapin · 4 herisson · 5 ecureuil · 6 bonhomme-de-neige · 7 pingouin ·
8 chien · 9 renard · 10 chaussette-de-noel · 11 hibou · 12 mouton · 13 ours · 14 boule-de-noel · 15 loup · 16 cheval ·
17 couronne-de-noel · 18 cadeau-de-noel · 19 renne-de-noel · 20 lutin-de-noel · 21 sapin-de-noel · 22 buche-de-noel ·
23 pere-noel · 24 traineau-du-pere-noel (le seul dessin de nuit, pour la nuit de Noël).

Title servi : « Coloriage calendrier de l'Avent : 24 dessins · Trait de Famille » (63). Meta : « 24 coloriages gratuits
à imprimer, un par jour du 1er au 24 décembre : du chat du premier soir au traîneau de la nuit de Noël, un calendrier
de l'Avent fait main. » H1 : « Un calendrier de l'Avent à colorier, un dessin par jour ».

Ce que le PM ne voit pas :
- **`updated` = 2026-11-15** dans `guides.ts`, date supposée de MEP. Si la MEP glisse, la date affichée et le
  `lastmod` resteront au 15/11 : à corriger au moment du merge si l'écart compte.
- Le compte « 24 liens `/coloriages/…` » du critère donne 25 à cause du pied de page (voir critère 1).
- Le nouveau guide entre aussi dans la liste des guides du **pied de page** (comportement existant de `guides.ts`) :
  il est donc lié depuis toutes les pages, pas seulement depuis le hub et la fiche sapin.
- Mécanisme ajouté : `LienDansTexte` (`themes.ts`) + `TexteAvecLien` pose un lien sur un passage existant d'un texte
  sans le réécrire ; si l'ancre disparaît du texte, le texte s'affiche sans lien. Les `reviseLe` du hub et de la
  fiche sapin n'ont pas bougé (texte inchangé, un lien en plus).
- Les vignettes renvoient 404 en local (pas de stockage d'images) ; elles pointent vers les PNG déjà servis en ligne.
- À la MEP : `curl --resolve trait-de-famille.fr:443:51.210.6.44` sur le guide (200, 24 fiches, 1 h1), sitemap 87,
  puis demander l'indexation du guide dans GSC (pari : indexé avant le 2026-12-01).

## Validation PM

**VALIDÉ** le 2026-11-15 par /valider (agent valideur), commit 934ee3a.

Critères rejoués :
- Page en 200, un seul h1, 24 liens fiches distincts dont 12 Noël : atteint. Les 24 couples thème/slug sont extraits du source, distincts et présents dans `themes.ts`. Le h1 et le 200 sont recoupés par le source, sans rendu.
- Les 24 cibles répondent 200 : non vérifiable sans base peuplée ni déploiement. À rejouer après la MEP.
- 24 phrases distinctes : atteint (20 lues dans le source).
- Sitemap 86 → 87 : non vérifiable en local. L'entrée existe dans `guides.ts` avec `updated: 2026-11-15`.
- Liens depuis le hub Noël et la fiche sapin : atteint (`lienIdeeNoel` pour la fiche sapin, `guide.idees.lien` pour le hub).
- Title et meta : atteint. Title de 63 caractères avec le gabarit. Meta commençant par « 24 coloriages gratuits à imprimer ». ItemList présent.
- `tsc --noEmit` et `eslint` : sortie vide, code 0.

Réserves du valideur (recopiées) :
- `updated` et `lastmod` sont fixés au 2026-11-15. Si la MEP glisse, la date affichée sera fausse.
- Après la MEP, rejouer à l'origine `51.210.6.44` : 200, 24 liens, un `<h1`, sitemap à 87 URL. Demander ensuite l'indexation dans GSC.
- Les 24 URL de fiches et les vignettes n'ont pas été testées en ligne. Elles sont censées exister d'après le sitemap de production relevé par le dev.
