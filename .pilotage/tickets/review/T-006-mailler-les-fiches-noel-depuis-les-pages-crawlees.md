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

- [x] En production, `/`, `/creer`, `/guides`, `/mentions-legales` contiennent chacun un `href="/coloriages/noel"` ;
      `/` contient au moins 12 `href="/coloriages/noel/` (décompte `grep -o | wc -l` consigné).
      Preuve **locale** (build de prod, Postgres jetable, 70 sujets publiés), `curl -s | grep -o | wc -l` :
      `href="/coloriages/noel"` → `/` 2, `/creer` 1, `/guides` 1, `/mentions-legales` 1 ; `href="/coloriages/noel/` sur `/` → 12
      (main : 0). **La mesure en production se rejoue à la MEP** : le dev ne déploie pas.
- [x] En production, `/coloriages/animaux/chat` et `/coloriages/dinosaures/stegosaure` contiennent chacun au moins
      4 `href="/coloriages/noel/`.
      Preuve **locale** : 6 et 6 (main : 0 et 0, `git grep 'coloriages/noel/' main -- src` ne trouve que `themes.ts`).
      Prod à rejouer à la MEP.
- [x] Le sitemap sert toujours 86 URL ; aucune des 13 pages Noël ne change de title ni de canonical.
      Preuve locale : `grep -o '<loc>' | wc -l` → 86. `/coloriages/noel` : title « Coloriages de Noël à imprimer · Trait
      de Famille », canonical `https://trait-de-famille.fr/coloriages/noel` ; `/noel/sapin-de-noel` idem, inchangés.
      Le diff ne touche ni `sitemap.ts` ni les `generateMetadata`.
- [ ] (au chef d'orchestre) Le jour de la MEP, ajouter la ligne au journal ; le PM relèvera `gsc-inspect.js` sur les 13 URL à J+14 et le 20/11.

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

**État : fait** (preuves locales ; MEP et mesure en prod au chef d'orchestre). Commits `37d999f`, `443153c`, `0716a39`
sur `ticket/T-006`, non poussés.

- Pied de page : « Coloriages de Noël » → `/coloriages/noel` (colonne Ressources), donc sur `/coloriages/*`, `/guides*`,
  pages légales, 404, `/mes-coloriages`.
- **Faux dans le ticket : `/creer` n'a pas de pied de page** (`FlowHeader` seul). Plutôt que d'y greffer le footer
  (refonte hors périmètre), une ligne « 🎄 Coloriages de Noël gratuits à imprimer » sous le formulaire.
- Accueil : les 12 fiches Noël publiées en liste de liens texte sous l'accroche 🎄 du Hero (lues en base, ordre
  éditorial). **L'accueil passe de statique à `force-dynamic`** : une requête SQL par affichage. Garde-fous : lecture
  bornée à 1,5 s et dernière liste lue servie en cas d'échec (base gelée : 200 en 1,53 s, 12 liens ; base coupée :
  200 en 0,03 s, 12 liens). Avant la toute première lecture d'un processus, une base en panne donne l'accueil sans liste.
- Fiches hors Noël : bloc « Coloriages de Noël » de 6 vignettes, après « D'autres coloriages … ». Les 6 fiches sont
  consécutives à partir d'un décalage tiré du slug : chaque page lie toujours les mêmes, et toutes sont couvertes.
  Liens entrants par fiche Noël depuis les 58 fiches hors Noël (local) : de 20 (bonhomme-de-neige) à 38 (bûche).
- Les fiches Noël elles-mêmes ne reçoivent pas ce bloc (elles lient déjà leur thème : 8 fiches).
- Ce que le PM ne voit pas : en prod, le domaine public répond 403 `cf-mitigated: challenge` depuis le poste : le
  valideur et la MEP devront compter les liens à l'origine (`--resolve`, comme pour T-004).

Revue adversariale du 2026-10-25 (niveau léger, `reviewer-seo`, deux tours) : 5 défauts rapportés, 2 retenus et
corrigés, 3 mineurs notés, 0 hérité, 0 réfuté.
- Corrigé : base en panne ⇒ accueil en 200 sans lien Noël (dernière liste lue gardée en mémoire).
- Corrigé : base qui pend ⇒ accueil sans délai maximal (lecture bornée à 1,5 s).
- Mineur : ISR (`revalidate`) plutôt que `force-dynamic` sur l'accueil, pour le TTFB ; non fait, il faudrait revalider à la
  publication depuis l'admin, hors périmètre.
- Mineur : bloc Noël en `<h2>` sur ~58 fiches hors sujet ; laissé en h2, comme le bloc voisin.
- Mineur : couverture de la rotation non garantie ; mesurée ci-dessus (20 à 38 liens par fiche).

## Validation PM

**VALIDÉ** le 2026-10-25 par /valider (agent `valideur`). Le ticket reste en `review/` : le passage en `done/`, le
merge, le push et la MEP reviennent au chef d'orchestre.

Critères rejoués (build de prod de `ticket/T-006`, worktree et Postgres jetables, 70 sujets publiés) :
- NON VÉRIFIABLE en prod (403 Cloudflare, branche non déployée). En local : `href="/coloriages/noel"` → `/` 2,
  `/creer` 1, `/guides` 1, `/mentions-legales` 1 ; `href="/coloriages/noel/` sur `/` → 12.
- NON VÉRIFIABLE en prod. En local : `/coloriages/animaux/chat` 6, `/coloriages/dinosaures/stegosaure` 6.
- Atteint en local : sitemap 86 `<loc>` ; title de `/coloriages/noel` inchangé ; ni `sitemap.ts`, ni `themes.ts`, ni les
  `generateMetadata` touchés ; `npx tsc --noEmit` sans erreur.
- NON VÉRIFIABLE : journal de MEP et relevés `gsc-inspect` (J+14, 20/11), à venir (chef d'orchestre, PM).

Périmètre respecté. Déviation déclarée et mineure : `/creer` n'a pas de pied de page, un lien a été ajouté sous le formulaire.

Réserves du valideur :
- L'accueil passe de statique à `force-dynamic` : une requête SQL par affichage. La lecture est bornée à 1,5 s, avec repli sur la dernière liste lue. Une base en panne avant la toute première lecture donne un accueil sans liste de liens. Le dev l'a déclaré.
- Les critères de prod sont à rejouer à la MEP, à l'origine Coolify et non via le domaine public.
