# T-005 — Ouvrir une deuxième série Noël sur des requêtes peu disputées

| | |
|---|---|
| Projet | `trait-de-famille` |
| Chantier roadmap | Visites avant Noël (décision de Romain du 14/10 : « Focus visites ») |
| KPI visé | Clics GSC 28 j (0 au 11/10) ; pages Noël indexées |
| Créé le | 2026-10-15 par le PM, sur demande de Romain (« oui écris A et B ») |
| Estimation | < 1 jour de dev, plus le temps de génération et de relecture de Romain |

> **GELÉ le 2026-10-25 par pm-lead — ne pas prendre.** Aucun pari ne tient : publiées au 05/11, ces fiches
> entreraient en index après le 20/11 au mieux, et les 12 premières fiches Noël sont encore à 0 / 13 indexées.
> T-006 passe devant. Rouvert seulement si les pages Noël indexées atteignent 8 / 13 (voir ROADMAP).

## Pourquoi

Les 12 sujets Noël de T-002 visent des requêtes courtes (« coloriage sapin de Noël », « coloriage Père Noël »)
tenues par des sites installés qui proposent des dizaines de dessins par page : un site neuf à un dessin par
fiche n'y passera pas cette saison (déduit par pm-seo le 14/10, aucun outil de volume). Les requêtes où il peut
se placer sont plus longues et moins servies : sujet rare, âge, usage précis.

Butoir : le délai d'indexation mesuré sur ce site est de **8 à 14 jours** (T-002). Publiés le 05/11, les dessins
entrent en index vers le 20/11, au début du pic des recherches de Noël.

## Quoi

Ajouter au thème `noel` de `src/lib/coloriages/themes.ts` **8 à 10 sujets** visant la longue traîne, chacun
avec son `nom`, son `titre` et une `intro` propre. Liste indicative, à ajuster par le dev avec Romain :
- lutin farceur ;
- lettre au Père Noël à colorier ;
- calendrier de l'Avent à colorier ;
- mandala de Noël ;
- étoile de Noël ;
- ange de Noël ;
- Père Noël facile pour la maternelle ;
- sapin de Noël facile pour 3 ans ;
- crèche de Noël ;
- pain d'épices.

Règles de T-002 à respecter : slugs suffixés (`-de-noel` ou équivalent, le slug est la clé primaire tous thèmes
confondus) ; l'`intro` ne décrit rien d'absent du `nom` envoyé au modèle ; l'âge visé apparaît dans le `titre`
quand la requête le porte (« maternelle », « 3 ans »).

## Critère de fin (vérifiable par le dev, seul)

- [ ] `themes.ts` : au moins 20 sujets `noel` ; aucune `intro`, aucun `titre`, aucun `slug` dupliqué sur tout le
      fichier (commande `sort | uniq -d` vide jointe).
- [ ] Aucun slug existant ne change (diff limité à l'ajout).
- [ ] En production, `/admin/coloriages` liste les nouveaux sujets avec un dessin en brouillon pour chacun
      (décompte consigné).
- [ ] Après publication par Romain : `curl -s https://trait-de-famille.fr/sitemap.xml` contient au moins 20 URL
      `/coloriages/noel/` ; chaque nouvelle URL répond 200 avec title et meta description uniques.

## Hors périmètre

- Les gabarits, le H1, le partage, Umami (T-004).
- Les autres thèmes, une page `/noel` d'atterrissage, un pack PDF global.

## Prérequis

- T-002 clos (voir T-004).
- **Romain** génère, relit et publie les dessins depuis `/admin/coloriages` **au plus tard le 05/11**.

## À consigner dans journal.md

- Date et commit de mise en production, vérifiés en ligne.
- Date de publication des dessins par Romain (date du sitemap).
- Le PM relèvera l'indexation et les impressions des nouvelles URL à J+14 et J+28.

---

## Retour dev

*(rempli par le dev)*

## Validation PM

*(rempli au passage en done/ ou au renvoi en todo/)*
