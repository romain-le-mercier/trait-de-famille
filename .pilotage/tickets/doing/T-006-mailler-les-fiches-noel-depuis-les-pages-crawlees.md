# T-006 — Lier les 12 fiches Noël depuis les pages que Google recrawle

| | |
|---|---|
| Projet | `trait-de-famille` |
| Type | **pari** |
| Chantier roadmap | Objectif du site : pages Noël indexées avant le 20/11 |
| KPI visé | Pages Noël indexées (13 URL : `/coloriages/noel` + 12 fiches) — `KPIS.md` |
| Créé le | 2026-10-25 par pm-lead |
| Estimation | < ½ jour |
| Niveau de revue | léger |

## Pourquoi

**PARI : si les 12 fiches Noël sont liées directement depuis le pied de page, l'accueil et les fiches des autres
thèmes, alors les pages Noël indexées passent de 0 / 13 (URL Inspection du 2026-10-25) à 8 / 13 au 2026-11-20.**

Constat du 2026-10-25 (API URL Inspection, 86 URL du sitemap) : 49 / 86 indexées, **0 / 13 pour Noël**, alors que
Google a lu le sitemap (86 URL) le 22/10. Les fiches Noël sont au mieux « Détectées, non indexées » : Google les
connaît et ne vient pas les chercher. Les pages qu'il recrawle, elles, sont l'accueil (24/10), `/creer` (24/10),
`/guides` et `/coloriages/dinosaures` (23/10), les pages légales (20-25/10). Aujourd'hui **aucune ne lie une fiche
Noël** : l'accueil ne lie que le hub `/coloriages/noel` (depuis T-004, le 25/10), hub que Google ne connaît pas encore,
et les fiches ne lient que leur propre thème (`src/app/coloriages/[theme]/[slug]/page.tsx`, bloc « D'autres
coloriages »). Les 37 fiches animaux indexées ont été recrawlées en septembre pour 32 d'entre elles : elles comptent,
mais lentement. D'où le pied de page, présent sur les pages les plus souvent recrawlées.

## Quoi

Résultat attendu : chaque page servie porte des liens `<a href>` directs vers les fiches Noël publiées.
- Pied de page (`SiteFooter.tsx`) : un lien « Coloriages de Noël » vers `/coloriages/noel`.
- Accueil : les fiches Noël publiées en vignettes ou en liste de liens, sous l'accroche 🎄 existante.
- Fiches des thèmes autres que `noel` : un bloc « Coloriages de Noël » de 4 à 6 fiches Noël publiées
  (source : la base, comme le bloc existant ; pas de liste en dur, un dessin dépublié ne doit pas devenir un lien mort).

## Critère de fin (vérifiable par le dev, seul)

- [ ] En production, `/`, `/creer`, `/guides`, `/mentions-legales` contiennent chacun un `href="/coloriages/noel"` ;
      `/` contient au moins 12 `href="/coloriages/noel/` (décompte `grep -o | wc -l` consigné).
- [ ] En production, `/coloriages/animaux/chat` et `/coloriages/dinosaures/stegosaure` contiennent chacun au moins
      4 `href="/coloriages/noel/`.
- [ ] Le sitemap sert toujours 86 URL ; aucune des 13 pages Noël ne change de title ni de canonical.
- [ ] Le jour de la MEP, ajouter la ligne au journal ; le PM relèvera `gsc-inspect.js` sur les 13 URL à J+14 et le 20/11.

## Hors périmètre

- Nouveaux sujets Noël (T-005, gelé), titres et meta, og:image, Umami (T-004).
- Toute demande d'indexation dans la console : c'est un geste de Romain, pas du code.
- Refonte de l'accueil ou du pied de page au-delà de ces liens.

## Prérequis

Aucun. T-004 est en production depuis le 2026-10-25.

## À consigner dans journal.md

- Date et commit de mise en production, vérifiés en ligne.
- Nombre de liens vers `/coloriages/noel/` sur `/` et sur `/coloriages/animaux/chat`, avant / après.

---

## Retour dev

*(rempli par le dev)*

## Validation PM

*(rempli au passage en done/ ou au renvoi en todo/)*
