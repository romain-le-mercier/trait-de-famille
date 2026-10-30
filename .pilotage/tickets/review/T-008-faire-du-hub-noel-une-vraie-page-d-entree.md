# T-008 — Faire de `/coloriages/noel` une vraie page d'entrée : texte par âge, liste structurée, date de mise à jour

| | |
|---|---|
| Projet | `trait-de-famille` |
| Type | **pari** : si le hub Noël porte un texte utile (par âge, impression, idées pour l'Avent), une liste structurée de ses 12 dessins et une date de mise à jour réelle dans le sitemap, alors `/coloriages/noel` est **indexé au 2026-11-20** (URL Inspection ; non indexé au 2026-10-25) et fait **≥ 100 impressions sur 28 j au 2026-12-15** (0 à l'export du 2026-10-21). **Règle d'arrêt** : non indexé au 20/11 ⇒ D-007 s'applique (plus aucun ticket cette saison) ; indexé mais < 30 impressions au 15/12 ⇒ on ne reproduit pas le gabarit sur les hubs animaux et dinosaures |
| Chantier roadmap | H1 — Pages Noël indexées avant le 20/11 (D-007) ; fenêtre de Noël |
| Objectif servi | Pages Noël indexées : **0 / 13 au 2026-10-25 → 8 / 13 au 2026-11-20** (cible retenue, D-007) — le hub est la 13ᵉ |
| Créé le | 2026-10-29 par pm-lead |
| Estimation | < 1 jour |
| Niveau de revue | léger |

## Pourquoi

Le hub `/coloriages/noel` est la page qui vise la requête de tête (« coloriage Noël à imprimer ») et celle que l'accueil, `/creer`, `/guides` et les fiches des autres thèmes lient depuis le 25/10 (T-006). Il sert aujourd'hui un H1, deux phrases (`theme.description`) et une grille d'images : rien que Google ne trouve mieux ailleurs. Il n'a pas non plus de `lastModified` dans le sitemap (`src/app/sitemap.ts` n'en donne qu'aux fiches et aux guides), alors que c'est la page qui change à chaque publication. Rendre ce hub substantiel est le seul geste de contenu qui touche les 13 URL de l'objectif à la fois : chaque fiche y est listée et décrite.

## Quoi

1. **Texte du hub** (300 à 450 mots, rédigé par le dev, LiteLLM permis, **relu**), rendu sous la grille ou entre le titre et la grille au choix du dev :
   - **Par âge** : les dessins regroupés selon leur `difficulte` réelle (aujourd'hui 5 « tout-petit », 5 « enfant », 2 « ado » — à recompter dans `themes.ts`), chaque groupe liant ses fiches ;
   - **Imprimer** : ce que le bouton de téléchargement donne réellement (format, taille, vérifié dans `TelechargerColoriage`), sans promesse non tenue ;
   - **Pendant l'Avent** : 3 ou 4 idées d'usage concrètes et vraies (un dessin par semaine, cartes, décoration de table).
   Le texte vit dans le dépôt (`themes.ts` ou un fichier de données du thème) ; seuls les hubs qui en ont un l'affichent — animaux et dinosaures inchangés.
2. **Données structurées** du hub : `CollectionPage` avec un `ItemList` des fiches publiées (nom, URL, image), généré depuis la même liste que la grille.
3. **Sitemap** : `lastModified` de chaque hub de thème = date de publication la plus récente de ses fiches (`publieLe`), absente si aucune ; rien d'autre ne change.

## Critère de fin (vérifiable par le dev, seul)

- [x] En local, `/coloriages/noel` affiche le texte ; nombre de mots avant / après consigné ; `/coloriages/animaux` et `/coloriages/dinosaures` sans texte ajouté.
      Preuve : build de prod de `ticket/T-008` (33ca5e6) et de `main` côte à côte, Postgres jetable (70 fiches publiées dont 12 Noël, plus récente Noël le 2026-10-21 09:15 UTC), `curl localhost:3091|3092`. Mots visibles du hub Noël : 266 → 705 (texte ajouté : 438 mots titres et liens compris, ~375 de prose). Animaux 398 → 398, dinosaures 314 → 314, HTML hors `<script>`/`/_next/` identique à main.
- [x] Le JSON-LD du hub est valide (`JSON.parse` du script) et liste autant d'éléments que la grille affiche de dessins (nombre consigné).
      Preuve : `JSON.parse` OK, `CollectionPage` > `ItemList`, 12 éléments, `numberOfItems` 12, 12 cartes dans la grille, mêmes URL dans le même ordre.
- [x] `/sitemap.xml` en local : 86 URL (inchangé), `<lastmod>` présent sur `/coloriages/noel` et égal au plus récent `publieLe` des fiches Noël de la base locale ; aucun autre `<lastmod>` modifié.
      Preuve : 86 URL branche, 86 main. `/coloriages/noel` : absent → `2026-10-21T09:15:00.000Z` (= max `publie_le` Noël de la base). Tous les `<lastmod>` existants identiques. Animaux et dinosaures en reçoivent un (absent → 2026-08-26 / 2026-08-28), comme le demande « Quoi » §3 : voir Retour dev.
- [x] Texte avant / après joint au « Retour dev », avec la ligne de relecture (ce qui a été corrigé du jet).
      Preuve : section « Retour dev » ci-dessous.
- [x] `<title>`, meta description et canonical du hub inchangés.
      Preuve : les trois balises extraites du HTML des deux builds sont identiques sur les trois hubs.

## Hors périmètre

- Les 12 fiches (T-007), les nouvelles fiches (T-005 gelé).
- Le hub `/coloriages` (aperçu générique, réserve de T-004).
- Les offres `InStock` (question 4 ouverte au conseil), la vente, Stripe.
- Toute accroche « cadeau » qui renverrait vers un achat impossible.

## Prérequis

Aucun. **À mettre en ligne avant le 2026-11-05.**

## À consigner dans journal.md

- Date et commit de mise en production, vérifiés en ligne (à l'origine Coolify si le domaine est en défi).
- Le `<lastmod>` servi en production pour `/coloriages/noel`.
- Rappel de la baseline : hub non indexé au 2026-10-25, 0 impression à l'export du 2026-10-21.

---

## Règle de rédaction — secrets

On nomme la variable, jamais sa valeur. Voir `_pilotage/templates/ticket.md`.

---

## Retour dev

**Fait.** Revue adversariale du 2026-10-30 (niveau léger, `reviewer-seo` seul) : 3 défauts rapportés, 1 corrigé, 2 mineurs notés, dont 1 hérité remonté au PM, 0 réfuté.
- Corrigé : « se font avec un grand », lu comme une phrase tronquée → « avec l'aide d'un adulte » (33ca5e6).
- Mineur, non corrigé : les titres des cartes de la grille sont des `<h2>`, au même niveau que les sections ajoutées, et chaque fiche est liée deux fois avec la même ancre (grille, liste par âge). Passer les cartes en `<h3>` changerait aussi les hubs animaux et dinosaures, que la règle d'arrêt du ticket garde intacts.
- **Hérité, pour le PM** : le `<lastmod>` du hub suit les publications (2026-10-21 en prod si c'est la dernière fiche) et **ne bouge pas à la mise en ligne de ce texte**. Le critère l'exige ainsi. Pour que Google voie la refonte comme une mise à jour, il faudrait une date du guide (`max(publieLe, guide.misAJour)`). C'est à ticketer si le recrawl tarde.

**Ce qui était contradictoire dans le ticket.** « Quoi » §3 demande un `lastModified` sur **chaque** hub de thème, et le critère dit « aucun autre `<lastmod>` modifié ». J'ai suivi « Quoi » : aucun `<lastmod>` existant ne change, mais animaux et dinosaures en **gagnent** un. Le valideur peut le lire autrement. Le retirer, c'est filtrer sur `theme.guide` dans `sitemap.ts`, une ligne.

**Choix hors lettre du ticket.** Le JSON-LD `CollectionPage` ne sort que sur les hubs qui ont un `guide` (Noël seul). Il fait partie du gabarit que la règle d'arrêt défend de reproduire avant le 15/12.

**Ce que le PM ne voit pas.**
- Les listes par âge et l'`ItemList` sont calculées depuis `difficulte` et les fiches publiées : une fiche dépubliée disparaît de la liste. Les paragraphes nomment toutefois des dessins (ampoules du sapin, bois du renne…) : ils restent vrais tant que les 12 sont en ligne.
- Recompte des âges dans `themes.ts` : 5 « tout-petit » (Père Noël, bonhomme, cadeau, bonnet, chaussette), 5 « enfant » (sapin, renne, traîneau, lutin, bûche), 2 « ado » (boule, couronne). Le ticket disait juste.
- Le texte sur l'impression a été vérifié dans le code. `TelechargerColoriage` propose deux boutons, PDF et image au format stocké, sans compte. `buildColoringPdf` produit du A4 : orientation selon le dessin, marge de 10 mm, pied de page « Trait de Famille — imprime, colorie, recommence. ».
- LiteLLM n'a pas servi : le texte a été rédigé à la main, à partir des sections « colorier » et « idée Noël » des 12 fiches (T-007).
- Non poussé, non déployé. La MEP revient au chef d'orchestre après `/valider`, **avant le 2026-11-05**.

**Texte avant** : rien sous la grille. Le hub ne portait que `theme.description` (inchangée) et les 12 cartes.

**Texte après** (rendu sous la grille, `themes.ts` → `THEMES[noel].guide`) :

> **Quel coloriage pour quel âge ?**
> *Dès 3 ans* — Traits épais, grandes zones bien fermées, peu de détails : ces dessins se colorient avec des feutres larges ou des craies grasses. Un enfant de trois ans en vient à bout presque seul ; le visage du Père Noël ou les jouets de son sac se font avec l'aide d'un adulte. *(liens : Père Noël, bonhomme de neige, cadeau, bonnet, chaussette)*
> *Dès 5 ans* — Ces dessins mêlent de grandes surfaces et des détails étroits : les ampoules du sapin, les bois du renne, les volutes du traîneau, les stries de la bûche. Il faut suivre un contour fin sans déborder, ce qui vient vers cinq ans, avec des feutres fins. Le traîneau se colorie volontiers en plusieurs fois. *(liens : sapin, renne, traîneau, lutin, bûche)*
> *Dès 8 ans* — Ce sont des coloriages de motifs : des dizaines de petites zones régulières sur la boule, des aiguilles dessinées une à une sur la couronne. Il faut des crayons bien taillés et plusieurs séances ; les adultes s'y mettent aussi. *(liens : boule, couronne)*
>
> **Imprimer** — Chaque fiche propose deux téléchargements gratuits, sans compte. Le PDF est au format A4 : le dessin y est centré avec une marge d'un centimètre, en portrait ou en paysage selon sa forme, et une ligne discrète rappelle le nom du site en bas de page. Le second bouton donne l'image seule, pour l'imprimer à une autre taille ou la glisser dans un document. Pour garder les proportions, on imprime le PDF à 100 %, sans « ajuster à la page » ; un papier de 120 g ou plus évite que les feutres traversent.
>
> **Pendant l'Avent**
> · Un dessin par semaine, du plus simple au plus riche : le bonnet la première semaine, le bonhomme de neige la deuxième, le sapin la troisième et le traîneau la dernière, celle de la nuit de Noël.
> · Le sapin à remplir : affiché sur la porte de la chambre début décembre, il reçoit une boule coloriée chaque soir, comme un calendrier de l'Avent fait main.
> · Des cartes de vœux : la boule ou le Père Noël, coloriés puis découpés, se collent sur un carton plié en deux, l'intérieur libre pour un mot aux grands-parents.
> · La table du réveillon : une feuille sous l'assiette de chaque enfant pour patienter jusqu'au dessert, la bûche coloriée en guise de menu, une chaussette marquée au prénom de chacun.

**Relecture : ce qui a été corrigé du jet.**
1. « Un enfant de trois ans en vient à bout seul » → « presque seul », avec l'exception du Père Noël. Sa fiche dit que le visage, la boucle et les jouets se font avec un grand.
2. « En montant d'un cran chaque semaine » → « du plus simple au plus riche ». Le bonnet et le bonhomme de neige sont au même niveau.
3. « Le traîneau pour finir, la veille de Noël » → « la dernière [semaine], celle de la nuit de Noël ». La quatrième semaine de l'Avent ne tombe pas sur la veille.
4. « Avec un grand » → « avec l'aide d'un adulte » (revue SEO).
5. La marge d'un centimètre a été vérifiée dans `pdf.ts` (`margin = 10` mm) avant d'être écrite.

## Validation PM

**VALIDÉ** le 2026-10-30 par /valider (agent valideur), sur `c3527fc`. Reste en `review/` : passage en `done/`, merge, push et MEP reviennent au chef d'orchestre.

**Critères rejoués**
- Texte du hub Noël, mots avant/après, animaux et dinosaures sans texte : **non vérifiable en rendu**. Lu dans le diff : bloc conditionné par `theme.guide` (Noël seul), texte identique au « Texte après » du ticket, âges recomptés exacts (5 tout-petit, 5 enfant, 2 ado), libellés « Dès 3 / 5 / 8 ans » présents, marge 10 mm dans `src/lib/pdf.ts:18`. Le passage de 266 à 705 mots n'a pas été recompté.
- JSON-LD `CollectionPage` > `ItemList` : **atteint par lecture**. Il est construit depuis le même tableau `sujets` que la grille, avec `numberOfItems = sujets.length`. Pas de `JSON.parse` fait sur un rendu.
- Sitemap : **atteint par lecture**. `lastModified` vaut le max de `publieLe` par thème, ou `undefined` sans fiche datée. Les autres entrées sont intactes. Les 86 URL et la date du 2026-10-21 viennent de la base locale, non relancée.
- `<title>`, meta description et canonical inchangés : **atteint** (`generateMetadata` n'est pas touché).
- Texte avant/après et relecture joints au « Retour dev » : **atteint**.
- `npx tsc --noEmit` : passe.
- Périmètre respecté : trois fichiers de code, aucune exclusion du « Hors périmètre » touchée.

**Réserves du valideur (telles quelles)**
- Contradiction déclarée par le dev, à trancher : « Quoi » §3 demande un `lastmod` sur chaque hub, et le critère dit « aucun autre `<lastmod>` modifié ». Animaux et dinosaures gagnent donc un `<lastmod>` (absent → 2026-08-26 / 2026-08-28). Je suis « Quoi », qui est explicite, mais le retirer tient en une ligne.
- Le `<lastmod>` de Noël (2026-10-21) ne suit pas la refonte du texte. Le dev l'a remonté au PM.
- À vérifier en ligne après MEP, avant le 2026-11-05 : le JSON-LD, le texte et le `<lastmod>` de `/coloriages/noel`.
- Mineur déclaré, non corrigé : les cartes de la grille sont des `<h2>` au même niveau que les sections ajoutées, et chaque fiche est liée deux fois.
