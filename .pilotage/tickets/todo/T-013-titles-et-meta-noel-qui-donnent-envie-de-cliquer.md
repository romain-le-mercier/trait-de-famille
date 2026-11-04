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

- [ ] Sur les 13 URL Noël (build de prod local, puis à l'origine Coolify après MEP) : `<title>` contient le sujet et
      « gratuit », ≤ 65 caractères ; `meta description` ≤ 155 caractères, contient « gratuit » et « A4 » ou « PDF » ;
      13 titles distincts, 13 metas distinctes (commande `sort | uniq -d` vide jointe).
- [ ] H1, texte visible, `alt`, JSON-LD (`ImageObject`, `ItemList`, `BreadcrumbList`), canonical : **identiques** avant
      et après sur ces 13 pages (diff du HTML servi hors `<head>` title/meta/og joint).
- [ ] Les 58 autres fiches et les hubs `animaux`, `dinosaures` : `<head>` identique avant/après (diff vide joint).
- [ ] Sitemap : toujours 86 URL.

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

*(rempli par le dev, en doing/ ou review/ — fait, partiellement fait, bloqué, abandonné ; ce qui s'est révélé faux dans le ticket ; ce que le PM ne peut pas voir)*

## Validation PM

*(rempli par pm-lead au passage en done/ ou au renvoi en todo/)*
