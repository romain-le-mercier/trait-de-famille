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

Preuves sur un build de prod local (`next build` puis `next start` en conteneur `node:20`). La base Postgres jetable
contient les 36 animaux, les 22 dinosaures et les 12 fiches Noël, tous publiés, avec des images factices. « Avant » est
`main` (d09cb6a), « après » est `d76e999`.

- [x] HTML servi (build de prod local, puis origine Coolify après MEP) : chaque fiche Noël porte 4 à 6 liens
      `href="/coloriages/dinosaures/<slug>"` vers des fiches publiées ; décompte par fiche joint.
      → Décompte : sapin 4, père-noël 4, renne 4, bonhomme-de-neige 4, cadeau 4, boule 4, bonnet 4, traîneau 4, lutin 4,
      bûche 4, couronne 4, chaussette 4. Avant : 0 partout. **Reste à rejouer à l'origine Coolify après la MEP.**
- [x] Sur l'ensemble des 12 fiches Noël, les 22 slugs dinosaures apparaissent chacun au moins 2 fois (tableau joint) ;
      aucun lien vers une fiche non publiée ou en 404.
      → Les 22 slugs sont liés au total 48 fois. 18 le sont 2 fois. 4 le sont 3 fois : `dinosaure`, `diplodocus`, `t-rex`
      et `triceratops`. Les 22 URL liées répondent 200. Une fois `t-rex` passé en brouillon, il ne figure plus dans les
      liens.
- [x] Le hub `/coloriages/noel` lie `/coloriages/dinosaures` et `/coloriages/animaux`.
      → `href="/coloriages/dinosaures"` et `href="/coloriages/animaux"` figurent dans le HTML servi (bloc « D'autres
      coloriages ») ; ils en étaient absents avant.
- [x] Title, meta, H1, canonical et JSON-LD des pages touchées inchangés ; sitemap toujours 86 URL.
      → La comparaison automatique du HTML servi avant/après, sur les 12 fiches et le hub, donne des valeurs identiques.
      Le sitemap compte **88 URL avant et 88 après** : ce ticket ne le modifie pas. Le chiffre de 86 est daté, car T-016
      et T-017 ont depuis ajouté leurs guides.
- [x] Temps de réponse de la fiche Noël à l'origine : pas plus de 100 ms de plus qu'avant (mesure avant/après jointe).
      → Mesure locale sur `/coloriages/noel/couronne-de-noel`, 50 requêtes après 5 requêtes de chauffe. Avant : médiane
      17,9 ms, p90 24,6 ms. Après : médiane 18,2 ms, p90 21,1 ms. **La mesure à l'origine reste à faire après la MEP.**

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

**Fait** (2026-11-16). Commits `b0526e1` et `d76e999` sur `ticket/T-014`. Rien n'est poussé ni déployé.

- **Fiche Noël.** J'ai ajouté un bloc « D'autres coloriages : les dinosaures » : 4 vignettes en `<a href>`, présentes dans le
  HTML servi, qui reprennent les images déjà publiées. Le H2 du bloc lie le hub dinosaures.
  Le choix des dinosaures ne doit rien au hasard. La fiche de rang i, dans l'ordre éditorial du thème Noël tel qu'il est
  écrit dans le dépôt, prend n dinosaures consécutifs à partir du n° i × n. Ici n = 4. En règle générale,
  n = max(4, ⌈2 × nombre de dinosaures / nombre de fiches Noël⌉), plafonné à 6.
- **Hub Noël.** J'ai ajouté un bloc « D'autres coloriages » avec les deux liens, vers le hub dinosaures et vers le hub animaux.
- **Code partagé.** `listerFichesNoel` devient `listerFichesTheme(theme)`. La fonction garde le même repli quand la base
  tarde plus de 1,5 s, avec un cache par thème. `listerFichesNoel` existe toujours, et l'accueil n'a pas changé.
- **Ce qui était faux dans le ticket.** Le sitemap compte 88 URL, pas 86 : T-016 et T-017 y ont ajouté leurs guides. Ce
  ticket ne touche pas au sitemap.
- **Ce que le PM ne voit pas.**
  - Les dinosaures sont lus en base. Si la base ne répond pas au premier rendu après un démarrage, la réponse sort sans le
    bloc, toujours en 200.
  - Si une fiche Noël est dépubliée, sa tranche de 4 dinosaures disparaît avec elle. Ces 4 dinosaures tombent alors à 1 ou
    2 liens. Les tranches des autres fiches ne bougent pas.
- **À rejouer à l'origine Coolify après la MEP (chef d'orchestre).** Les critères 1 à 5, dont le temps de réponse
  avant/après.

Revue adversariale du 2026-11-16 (niveau léger, reviewer-seo seul) : 3 défauts rapportés, 2 retenus et corrigés, 0 mineur noté, 0 hérité remonté au PM, 1 réfuté.
- Corrigé : le rang de chaque fiche venait de la liste des fiches Noël publiées, si bien que ses liens changeaient dès qu'une
  fiche était dépubliée ou que la base tardait. Il vient maintenant de l'ordre éditorial du dépôt, et la page fait une
  lecture de base de moins. Vérifié : avec `pere-noel` dépubliée, `renne-de-noel` garde les mêmes 4 liens.
- Corrigé : les vignettes ont maintenant `alt=""`, pour que le texte du lien ne soit plus doublé.
- Réfuté : « deux H2 identiques ». Les titres diffèrent : « D'autres coloriages de noël » et « D'autres coloriages : les
  dinosaures ».

## Validation PM

*(rempli par pm-lead au passage en done/ ou au renvoi en todo/)*

**VALIDÉ** le 2026-11-16 par /valider (agent valideur). Reste en review/ : done/, merge, push et MEP au chef d'orchestre.

Critères rejoués :
- 4 à 6 liens dinosaures par fiche Noël : atteint (algorithme `choisirFichesDinosaures` rejoué sur `themes.ts` : 12 fiches × 4 slugs distincts ; rendu `Link` serveur, `force-dynamic`), HTML servi non relu.
- Chaque dinosaure ≥ 2 liens : atteint (dinosaure, t-rex, diplodocus, triceratops 3 ; 18 autres 2), slugs publiés en base.
- Hub Noël → /coloriages/dinosaures et /coloriages/animaux : atteint (bloc `AUTRES_THEMES`, lecture du diff).
- Title/meta/H1/canonical/JSON-LD/sitemap inchangés : atteint (lecture du diff ; 86 vs 88 déclaré).
- Temps de réponse ≤ +100 ms : non vérifiable sans build (mesure locale du ticket 17,9 → 18,2 ms ; une lecture de base cachée par thème).
- `tsc --noEmit` et eslint : atteint, sans erreur.
- Rejeux à l'origine Coolify : non vérifiables avant MEP.

Réserves du valideur (recopiées) :
- Je n'ai pas rejoué le build de prod. La preuve repose sur la reproduction de l'algorithme, sur le typecheck et sur la lecture du diff, pas sur le HTML servi.
- Après la MEP, le chef d'orchestre doit rejouer à l'origine : les 4 liens par fiche, les 200 sur les 22 URL, le hub Noël et le temps de réponse.
- Si la base ne répond pas au premier rendu après un démarrage, la page sort sans le bloc dinosaures, en 200. Le ticket le dit.
- Le critère évoque « les 13 pages Noël » alors que le code compte 12 fiches et un hub. Le ticket est cohérent sur ce point.
