# T-013 — Donner aux 13 pages Noël un title et une meta qui font cliquer

| | |
|---|---|
| Projet | `trait-de-famille` |
| Type | **pari** : si le title et la meta des 13 pages Noël disent « gratuit » et « PDF A4 », les clics GSC de ces pages passent de 0 (134 impressions, 0 clic, export du 2026-11-04) à ≥ 20 sur les 28 j finissant le 2026-12-15 |
| Chantier roadmap | Fenêtre Noël ; seuil de gel D-007 (< 10 clics/semaine au 2026-12-15 ⇒ gel jusqu'à l'été 2027) |
| KPI visé | Clics organiques 28 j des 13 pages Noël (GSC) ; CTR du lot |
| Créé le | 2026-11-04 par pm-lead |
| Estimation | < 1/2 jour |
| Niveau de revue | léger |

## Pourquoi

L'objectif d'indexation est atteint en avance : **13 / 13 pages Noël indexées le 2026-11-04** (`gsc-inspect.js`, cible
D-007 : 8 / 13 au 20/11). Google les montre déjà : **134 impressions, 0 clic** sur les 10 fiches Noël présentes dans
l'export du 2026-11-04 (données au 01/11, `gsc-digest.js --gabarits`). Le chiffre qui décide maintenant de la saison est
le clic (D-007 : sous 10 clics/semaine au 15/12, gel). Or le résultat Google ne promet rien de ce que cherche un parent :
title servi « Coloriage couronne de Noël à imprimer · Trait de Famille », meta = l'intro descriptive du dessin
(« Une couronne de branches de sapin, garnie de pommes de pin… »), **ni « gratuit » ni « PDF » nulle part**
(relevé à l'origine Coolify le 2026-11-04). Côté code : `src/app/coloriages/[theme]/[slug]/page.tsx` l. 64-65,
`title: sujet.titre`, `description: sujet.intro` ; `sujet.titre` sert aussi de H1, d'alt et de nom d'`ItemList`.

## Quoi

1. Deux champs facultatifs par sujet (et pour le hub `noel`) dans `src/lib/coloriages/themes.ts` ou équivalent :
   un title de résultat de recherche et une meta description, distincts du `titre` (H1) et de l'`intro` (texte visible).
   Absents ⇒ comportement actuel inchangé.
2. Les remplir pour les 12 fiches Noël et le hub `/coloriages/noel`. Title : le sujet, « gratuit », « à imprimer »,
   tel que servi ≤ 65 caractères (suffixe de marque compris, ou retiré sur ces pages si c'est le prix de la longueur).
   Meta : ≤ 155 caractères, « gratuit » et « A4 » (ou « PDF »), plus un détail vrai propre au dessin publié (reprendre ce
   que dit déjà l'intro, ne rien inventer qui ne soit pas sur l'image).
3. `og:title`/`og:description` et `twitter:*` suivent ces champs quand ils existent.
4. Si T-010 (date de révision) est déjà sur `main` à la prise : poser la date de révision de ces 13 pages au jour de la
   MEP. Sinon, n'en rien faire (pas de lastmod bricolé ici).

## Critère de fin (vérifiable par le dev, seul)

- [x] Sur les 13 URL Noël (build de prod local, puis à l'origine Coolify après MEP) : `<title>` contient le sujet et
      « gratuit », ≤ 65 caractères ; `meta description` ≤ 155 caractères, contient « gratuit » et « A4 » ou « PDF » ;
      13 titles distincts, 13 metas distinctes (commande `sort | uniq -d` vide jointe).
      **Preuve (build de prod local, `node:20`, UA Googlebot, 2026-11-15)** : 13 × 200 ; titles de 47 à 65 car., tous
      avec « gratuit » ; metas de 134 à 155 car., toutes avec « gratuit », « PDF » et « A4 ». `sort titles.txt | uniq -d`
      → vide ; `sort descs.txt | uniq -d` → vide ; `sort -u | wc -l` → 13 et 13. **À l'origine Coolify : à rejouer
      après la MEP** (non faite, hors de mes droits).
- [x] H1, texte visible, `alt`, JSON-LD (`ImageObject`, `ItemList`, `BreadcrumbList`), canonical : **identiques** avant
      et après sur ces 13 pages (diff du HTML servi hors `<head>` title/meta/og joint).
      **Preuve** : comparaison `main` (port 3131) contre `ticket/T-013` (port 3102), même base : pour les 13 pages,
      `<head>` privé de title/description/og:title/og:description/twitter:title/twitter:description, corps hors scripts
      RSC, blocs JSON-LD, `<h1>` et `<link rel=canonical>` → **aucune différence** (chemins `/_next/static/` normalisés).
- [x] Les 58 autres fiches et les hubs `animaux`, `dinosaures` : `<head>` identique avant/après (diff vide joint).
      **Preuve** : 60 pages, `<head>` entier et corps comparés → « 60 pages, 0 différentes ».
- [x] Sitemap : toujours 86 URL. **Preuve** : 87 avant, 87 après (`grep -c "<loc>"`). 87 et non 86 : le guide du
      calendrier de l'Avent (T-016) est sur `main` depuis l'écriture du ticket. Ce diff n'ajoute ni ne retire d'URL ;
      seuls les `lastmod` des 13 pages Noël changent (point 4).

## Hors périmètre

- Les fiches des autres thèmes (elles servent de témoins pour lire l'effet).
- Le H1, l'intro visible, les images, le gabarit de page.
- Toute nouvelle page ou nouveau dessin. Aucune image générée, aucun texte ajouté dans une image.

## Prérequis

Aucun. Ce projet se construit en conteneur `node:20` (Node 18 sous WSL bloque `next build`).

## À consigner dans journal.md

- Date et commit de MEP, vérifiés à l'origine Coolify.
- **Les 13 titles et metas avant remplacement** (valeur remplacée), et les nouveaux.
- Baseline du pari : 134 impressions / 0 clic sur les fiches Noël (export du 2026-11-04, données au 01/11).
  Le PM relève clics et CTR du lot à J+28 et le 2026-12-15.

---

## Retour dev

**Fait.** Commit `2272298`, branche `ticket/T-013`, non poussée, non déployée.

Revue adversariale du 2026-11-15 (niveau léger, reviewer-seo seul) : 2 défauts rapportés, 0 retenu, 1 mineur noté,
0 hérité, 1 réfuté.
- Mineur : `lastmod` des 13 pages posé au 2026-11-15T20:45 (heure du build local), avant la MEP. Si la MEP glisse,
  recaler les 13 `reviseLe` `// T-013` de `themes.ts` au jour réel, et ne plus les avancer sans changement de contenu.
- Réfuté : « remettre le suffixe de marque sur la chaussette ». Le suffixe « · Trait de Famille » fait 19 caractères,
  pas 18 : 47 + 19 = 66 > 65. Le suffixe est retiré sur la chaussette et le traîneau seulement, faute de place.

Ce qui a été fait :
- `Sujet` et `Theme` (`src/lib/coloriages/themes.ts`) prennent deux champs facultatifs : `titreRecherche` (title servi
  tel quel, `absolute`, suffixe compris quand il tient) et `descriptionRecherche`. Les deux gabarits (`[theme]/page.tsx`,
  `[theme]/[slug]/page.tsx`) les utilisent pour title, description, og et twitter ; absents ⇒ comportement inchangé.
  H1, intro, alt, JSON-LD et nom de l'`ItemList` restent sur `titre`/`intro`.
- Les 12 fiches Noël et le hub `noel` sont remplis. Chaque meta reprend un détail déjà écrit dans le texte de la fiche
  (âge annoncé, éléments du dessin), et rien d'autre. « PDF A4 » est vrai : bouton « Télécharger en PDF (A4) ».
- Point 4 : T-010 étant sur `main`, les 13 `reviseLe` passent au 2026-11-15 (voir le mineur ci-dessus).

Ce qui s'est révélé faux dans le ticket : le sitemap compte 87 URL et non 86 (guide T-016).

Ce que le PM ne voit pas :
- Le bench local publie les 70 sujets en base jetable (prod : selon publication réelle) ; les images y sont absentes.
- `og:title` porte désormais le suffixe de marque là où le title l'a (avant : `titre` seul, sans suffixe).
- Après la MEP : rejouer à l'origine `51.210.6.44` le title et la meta des 13 URL. Ensuite, demander la réindexation
  des 13 URL dans GSC pour que le nouveau snippet apparaisse avant la mi-décembre. C'est un geste de console : le chef
  d'orchestre s'il a l'accès, sinon Romain.

## Validation PM

*(rempli par pm-lead au passage en done/ ou au renvoi en todo/)*
