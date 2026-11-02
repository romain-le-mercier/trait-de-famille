# T-011 — Donner à l'admin un tableau de bord : comptes, dessins générés, achats

| | |
|---|---|
| Projet | `trait-de-famille` |
| Type | **mesure** |
| Chantier roadmap | Rendre l'entonnoir lisible (demande de Romain du 2026-11-02) |
| KPI visé | Entonnoir aperçu → compte → achat (aujourd'hui illisible hors Umami) |
| Créé le | 2026-11-02 par le chef d'orchestre |
| Estimation | < 1 jour |
| Niveau de revue | complet (lecture de données personnelles, page d'admin) |

## Pourquoi

Romain, 02/11 : « l'admin ne me permet de gérer que les bibliothèques d'images, j'aimerais avoir un dashboard des
utilisateurs, dessins générés, etc. ». Toutes les données sont déjà en base : `accounts`, `purchases`, `oeuvres`
(payée quand `debloquee_le` n'est pas nul) et `quotas_apercu`. Seul Umami les montre aujourd'hui, et il ne compte que
des événements : 4 `generation-reussie` et 3 `coloriage-telecharge` sur 28 j au 02/11. Il ne voit ni les comptes, ni
les achats, ni les euros.

**La décision que cette mesure débloque** : savoir où l'entonnoir casse (aperçu sans compte, compte sans achat)
avant de parier sur le prix, les packs ou l'acquisition.

## Quoi

Une page `/admin`, ou `/admin/tableau-de-bord` reliée depuis l'admin existante, sous la même garde que
`/admin/coloriages` : `getAdmin()`, 404 sinon, `noindex`, `force-dynamic`. Elle montre :

1. **Chiffres** sur 24 h, 7 j, 28 j et depuis le début :
   - comptes créés ;
   - œuvres générées, dont celles d'un anonyme (`anon:`) et celles d'un compte (`compte:`) ;
   - œuvres débloquées (payées) ;
   - achats et chiffre d'affaires en euros (`purchases.amount` est en centimes) ;
   - aperçus consommés (`quotas_apercu.utilisees`).
2. **Entonnoir sur 28 j** : œuvres générées → propriétaires distincts → comptes → comptes ayant acheté, avec le taux
   de chaque marche.
3. **Les 50 derniers comptes** : date, e-mail, crédits restants, nombre d'œuvres, nombre et montant d'achats.
   L'e-mail ne s'affiche qu'à l'admin, et ne sort jamais de cette page (ni dans les logs, ni dans une API publique).
4. **Les 50 dernières œuvres** : date, propriétaire (compte ou anonyme, sans jeton complet), payée ou non, et une
   vignette servie par une route admin gardée. Aucun lien public vers un fichier non payé.

Les requêtes sont des agrégats SQL simples sur les index existants, sans lecture de tous les fichiers du volume.

## Critère de fin (vérifiable par le dev, seul)

- [x] Sans session admin, la page et chaque route API qu'elle appelle répondent 404, preuve par `curl -s -o /dev/null -w '%{http_code}'`.
      Preuve (build de prod local, :3011) : `/admin/tableau-de-bord` sans session 404, session Google non admin 404, admin 200 ; `/api/admin/oeuvres/oeuvre00001/vignette` 404 / 404 / 200. La page est rendue côté serveur et n'appelle aucune autre API.
- [x] Les chiffres de la page égalent des `SELECT count(*)` et `sum(amount)` faits à la main sur la même base (local ou
      préprod), et tirés au Retour dev.
      Preuve : Postgres jetable (300 comptes, 3 000 œuvres, 120 achats, 200 lignes de quota), tableau au Retour dev, 0 écart.
- [x] Une œuvre non payée n'est accessible par aucune URL hors admin. La route de vignette refuse sans session admin.
      Preuve : seules deux routes lisent le stockage (`grep lire( src/app`) : la vignette admin (404 sans session) et `/api/oeuvres/[id]/debloquer` (401 sans session sur oeuvre00001 non payée ; 402 sans paiement ; inchangée). Vignette en `Cache-Control: private, no-store`.
- [x] La page répond en moins de 1 s en local avec la base de développement. Durée relevée au Retour dev.
      Preuve : 37 à 51 ms (`curl -w %{time_total}`, trois appels, base de 3 000 œuvres).
- [x] Le lien vers le tableau de bord apparaît dans l'admin existante.
      Preuve : `curl /admin/coloriages` (admin) contient `href="/admin/tableau-de-bord"`.

## Hors périmètre

- Toute écriture : suppression de compte, remboursement, ajout de crédits. Cela fera un autre ticket, si besoin.
- Les graphiques et les bibliothèques de graphiques : des tableaux suffisent.
- Umami et GSC dans la page : ils ont leurs digests.
- Tout export ou envoi de données personnelles hors du serveur.

## Prérequis

Aucun. `ADMIN_EMAILS` est déjà en place, puisque `/admin/coloriages` sert à Romain.

## À consigner dans journal.md

- Date et commit de MEP, vérifiés en ligne (404 sans session).
- Premier relevé de la page en production : comptes, œuvres, payées, achats et CA depuis le début. C'est la
  baseline de l'entonnoir.

## Retour dev

**Fait.** Commits `e61c7cf` et `dd15edb` sur `ticket/T-011`. Page `/admin/tableau-de-bord` (serveur, `force-dynamic`, `noindex`,
404 sans `getAdmin()`), requêtes dans `src/lib/server/tableauDeBord.ts`, vignette réduite à 160 px (WebP) par
`/api/admin/oeuvres/[id]/vignette` (gardée, `no-store`), lien depuis `/admin/coloriages`. Aucune écriture, aucune
migration, aucun e-mail journalisé.

Vérification des chiffres, page contre `SELECT` faits à la main, même base jetable :

| Chiffre | 24 h | 7 j | 28 j | Total | SELECT à la main |
|---|---|---|---|---|---|
| Comptes créés | 4 | 33 | 134 | 300 | 4 / 33 / 134 / 300 |
| Œuvres générées | 47 | 335 | 1343 | 3000 | 47 / 335 / 1343 / 3000 |
| dont anonymes (28 j) | | | 896 | | 896 |
| Payées (total) | | | | 300 | 300 |
| Achats / CA (total) | | | | 120 / 658,80 € | 120 / 65 880 c |
| Achats / CA (28 j) | | | 74 / 406,26 € | | 74 / 40 626 c |
| Aperçus | 51 | 351 | — | — | aujourd'hui 51, total en table 401 |
| Propriétaires distincts 28 j | | | 996 | | 996 |

Ce qui s'est révélé faux ou flou dans le ticket :
- **Aperçus consommés sur 28 j et depuis le début : impossible.** `quotas_apercu` est purgée après 7 jours
  (`quotas.ts`). La page montre « aujourd'hui » (jour calendaire de la base, pas 24 h glissantes) et 7 j, un tiret pour le reste.
- **La baseline demandée au journal (« œuvres … depuis le début ») n'est pas stable.** Les essais non payés de plus de
  30 jours sont effacés par une purge occasionnelle (2 % des générations, 500 lignes max par passage) : ce total peut
  baisser d'un coup. Baseline à relever : œuvres **payées** depuis le début et œuvres générées **sur 28 j** (complètes).
- « Anonymes / d'un compte » suivent le propriétaire **actuel** : un essai réclamé à la connexion passe côté compte. Aucune
  colonne ne garde l'origine ; c'est écrit sous le tableau.
- Marche d'entonnoir « Comptes » renommée **« Comptes ayant généré »** : sous-ensemble des propriétaires, pour que chaque taux
  ait un sens. Les comptes créés sans rien générer sont dans « Comptes créés ».

Revue adversariale du 2026-11-02 : 20 défauts rapportés (deux tours), 1 retenu et corrigé (note de purge), 5 corrigés en
plus parmi les mineurs ou relevés au tour 2 (cache privé 24 h des vignettes → `no-store`, 404 muet → log de l'identifiant,
sharp hors try/catch, tiret des aperçus, libellé d'entonnoir), 4 mineurs notés, 2 hérités remontés au PM, 6 réfutés.
- Mineur : 11 requêtes en parallèle pour un pool de 10 (la 11e attend, sans dommage mesuré : 40 ms au total).
- Mineur : vignettes recalculées par sharp à chaque chargement (`no-store` voulu ; 50 max, en lazy, admin seul).
- Mineur : `alt="fichier introuvable"` est lu aussi sur une vignette valide par un lecteur d'écran.
- Mineur : « aujourd'hui » des aperçus dépend du fuseau de la base de production (non vérifié).
- **Hérité (PM)** : `purchases` est en `ON DELETE CASCADE` sur `accounts` ; supprimer un compte effacerait son CA
  historique. À traiter avant tout ticket « suppression de compte ».
- **Hérité (PM)** : la purge des essais à 30 jours ne tourne presque jamais au volume actuel (≈ 4 générations / 28 j).

Ce que le PM ne peut pas voir : rien n'est vérifié en production. Rien n'a été poussé ni déployé ; la MEP revient au chef
d'orchestre après `/valider`. À la MEP : 404 sans session en ligne, puis premier relevé (comptes, payées, achats, CA depuis
le début, œuvres sur 28 j) au journal.


## Validation PM

**VALIDÉ** le 2026-11-02 par /valider (agent valideur), sur `ticket/T-011` @ 5f36e3a contre `main`. Reste en `review/` : passage en `done/`, merge, push et MEP au chef d'orchestre.

Critères rejoués (build de prod de la branche, Postgres jetable 300 comptes / 3 000 œuvres / 120 achats / 200 lignes de quota, sessions Auth.js forgées) :
- [atteint] 404 sans session admin : `/admin/tableau-de-bord` 404 / 404 / 200 (sans session / non admin / admin) ; `/api/admin/oeuvres/oeuvre1/vignette` 404 / 404 / 200. Page rendue côté serveur, aucune autre API.
- [atteint] Chiffres = SELECT à la main : comptes 28 j 95, œuvres 7 j 33, anonymes 28 j 44, CA total 672,60 €, CA 28 j 268,26 €, aperçus total 401, propriétaires distincts 28 j 134. Zéro écart.
- [atteint] Œuvre non payée inaccessible hors admin : seules deux routes lisent le stockage (vignette admin, `/api/oeuvres/[id]/debloquer` non modifiée) ; vignette 404 hors admin, `Cache-Control: private, no-store` en admin.
- [atteint] Page en moins de 1 s : 44, 37, 45 ms.
- [atteint] Lien depuis l'admin existante : `/admin/coloriages` contient `href="/admin/tableau-de-bord"`.
- En plus : `tsc --noEmit` et eslint sans erreur, page `noindex`, e-mails seulement dans le HTML admin, build OK. Périmètre respecté.

Réserves du valideur (recopiées) :
- **Non vérifiable depuis ma place** : le 404 en ligne et la baseline de production. Ce sont les deux points à consigner au journal à la MEP.
- **Aperçus 28 j et total** : le ticket les demandait, la page affiche un tiret. `quotas_apercu` est purgée après 7 jours, le dev l'a déclaré et la page l'explique sous le tableau.
- **Baseline « œuvres depuis le début »** : le total peut baisser à cause de la purge à 30 jours. Le dev recommande de prendre les œuvres payées et les œuvres sur 28 j. Je suis d'accord.
- **Hérité** : `purchases` est en `ON DELETE CASCADE` sur `accounts`. Le dev l'a remonté au PM. Cela doit être traité avant tout ticket « suppression de compte ».
