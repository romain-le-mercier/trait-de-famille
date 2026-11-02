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

- [ ] Sans session admin, la page et chaque route API qu'elle appelle répondent 404, preuve par `curl -s -o /dev/null -w '%{http_code}'`.
- [ ] Les chiffres de la page égalent des `SELECT count(*)` et `sum(amount)` faits à la main sur la même base (local ou
      préprod), et tirés au Retour dev.
- [ ] Une œuvre non payée n'est accessible par aucune URL hors admin. La route de vignette refuse sans session admin.
- [ ] La page répond en moins de 1 s en local avec la base de développement. Durée relevée au Retour dev.
- [ ] Le lien vers le tableau de bord apparaît dans l'admin existante.

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
