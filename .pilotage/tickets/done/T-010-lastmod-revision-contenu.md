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

- [x] Build local : `sitemap.xml` donne pour `/coloriages/noel` et les 12 fiches une date du 29 ou 30/10/2026 (= commits
      cités) ; `/coloriages/animaux` et `/coloriages/dinosaures` inchangés par rapport à la prod du 30/10.
      Preuve : `next build` + `next start` de `main` (:3191) et de `ticket/T-010` d55a986 (:3192), même Postgres jetable
      (70 fiches publiées : animaux 2026-08-26, dinosaures 2026-08-28, Noël 2026-10-05 sauf une au 2026-10-21).
      Hub `/coloriages/noel` 2026-10-21T09:15Z → **2026-10-30T00:32:37Z** (T-008, 33ca5e6). 9 fiches →
      **2026-10-29T11:45:38Z** (T-007, 0cf10f8) ; pere-noel, cadeau-de-noel, buche-de-noel → **2026-10-30T00:09:39Z**
      (T-009, 480e6c5). `/coloriages/animaux` 2026-08-26T10:00Z = 2026-08-26T10:00Z, `/coloriages/dinosaures`
      2026-08-28T10:00Z = 2026-08-28T10:00Z.
- [x] Aucune autre URL du sitemap ne change de lastmod (diff des deux sitemaps, prod et local, joint).
      Preuve : 86 URL de chaque côté, même ensemble ; **13 lastmod changés** (le hub Noël et les 12 fiches), 73
      identiques. Le diff est en bas de « Retour dev ». La prod n'a pas pu être lue (Cloudflare renvoie « Just a moment… »
      à `curl`), donc la référence est `main` buildé en local : `git diff 33ca5e6 main` (MEP de T-008) est vide sur
      `sitemap.ts`, `themes.ts`, `server/coloriages.ts` et `guides`. Le code du sitemap est donc celui de la prod.

## Hors périmètre

Le contenu des pages, `changefreq`, `priority`, d'autres sections du site.

## À consigner dans journal.md

- Date et commit de MEP, lastmod du hub et d'une fiche relus en ligne ; le chef resoumet le sitemap à Google.

## Retour dev

**Fait.** Commit d55a986 sur `ticket/T-010`, non poussé, non déployé.

- `Sujet.reviseLe` et `Theme.reviseLe` sont des ISO facultatifs dans `src/lib/coloriages/themes.ts`. Ils sont renseignés
  pour les 12 fiches Noël et le hub avec l'heure exacte du dernier commit qui a changé leur texte : 0cf10f8 (T-007),
  480e6c5 (T-009, uniquement pour pere-noel, cadeau-de-noel et buche-de-noel) et 33ca5e6 (T-008, hub).
- `src/app/sitemap.ts` : la date d'une fiche est la plus récente entre `publieLe` et `reviseLe`. Celle d'un hub est la plus
  récente entre son `reviseLe` et la date de ses fiches. Une date absente ou illisible ne compte pas.
- **Ce que le PM ne voit pas** : les dates de prod dépendent de la base de prod. Si une fiche Noël y a été republiée
  après le 30/10, sa `publieLe` l'emporte, ce qui est voulu. Le hub prendra 2026-10-30T00:32:37Z sauf publication
  plus récente.
- **À la prochaine retouche** d'un texte de fiche ou de hub, il faut mettre `reviseLe` à jour à la main : rien ne le
  force (voir Mineurs).

Revue adversariale du 2026-11-04 (niveau léger, reviewer-seo seul, sans contre-expert) : 3 défauts rapportés, 0 retenu
à corriger, 1 mineur noté, 1 hérité remonté au PM, 1 sans action (constat de cohérence).
- Mineur : `reviseLe` est saisi à la main. Une retouche future du texte sans mise à jour laisse un lastmod périmé.
  Piste : un test qui lie le texte à sa date.
- Hérité (`sitemap.ts:27`, ligne non touchée) : si Postgres échoue, `listerPublies().catch(() => [])` sert en 200 un
  sitemap sans les 70 fiches ni les hubs. Le commentaire en fait un choix assumé (« mieux vaut perdre la bibliothèque
  qu'une 500 ») ; le reviewer recommande une 5xx pour que Google garde l'ancien sitemap. C'est au PM d'arbitrer.

Diff des lastmod (main → branche) :
```
/coloriages/noel                       2026-10-21T09:15:00Z → 2026-10-30T00:32:37Z
/coloriages/noel/chaussette-de-noel    2026-10-21T09:15:00Z → 2026-10-29T11:45:38Z
/coloriages/noel/pere-noel             2026-10-05T10:00:00Z → 2026-10-30T00:09:39Z
/coloriages/noel/cadeau-de-noel        2026-10-05T10:00:00Z → 2026-10-30T00:09:39Z
/coloriages/noel/buche-de-noel         2026-10-05T10:00:00Z → 2026-10-30T00:09:39Z
/coloriages/noel/{renne-de-noel, bonhomme-de-neige, boule-de-noel, sapin-de-noel, traineau-du-pere-noel,
  lutin-de-noel, couronne-de-noel, bonnet-de-noel}  2026-10-05T10:00:00Z → 2026-10-29T11:45:38Z
73 autres URL : identiques.
```


## Validation PM

**VALIDÉ** le 2026-11-04 par /valider (agent valideur), sur d55a986.

Critères rejoués :
- [atteint] Hub Noël et 12 fiches datés du 29 ou 30/10 ; `animaux` (0/36) et `dinosaures` (0/22) sans `reviseLe`, lastmod inchangé. Lu dans `sitemap.ts` et `themes.ts` chargé sous node ; dates recoupées au `git log` (0cf10f8 le 29/10, 480e6c5 et 33ca5e6 le 30/10) ; `npx tsc --noEmit` sans erreur.
- [atteint, avec réserve] Aucune autre URL ne change : le diff ne touche que le calcul fiche/hub, comportement identique à `main` sans `reviseLe` ; comparaison des deux sitemaps non rejouée.

Réserves du valideur :
- Je n'ai pas relancé le build comparatif. Les chiffres du ticket (13 changés, 73 identiques, 86 URL) viennent du dev, et ils sont cohérents avec le code et les données que j'ai lus.
- La prod n'est pas lisible depuis `curl` (Cloudflare, comme l'a vu le dev). La référence est donc `main` buildé en local. Le lastmod en ligne reste à relire après la mise en production, ce que le ticket prévoit déjà.
- `reviseLe` est saisi à la main et rien ne le force. Une retouche future du texte sans mise à jour laissera un lastmod périmé.
- Hérité, non lié à ce ticket : `sitemap.ts:27` sert un sitemap vide de fiches en 200 si Postgres échoue. C'est à arbitrer par le PM.
- Les heures de `reviseLe` (12:45:38, 01:09:39, 01:32:37) ne sont pas toutes l'heure de commit visible dans `git log`. Pour T-007, le commit est à 12:51:01 et `reviseLe` à 12:45:38. Le jour est le même, donc le critère tient.
