# T-007 — Étoffer les 12 fiches Noël : ce que montre le dessin, comment le colorier, quoi en faire à Noël

| | |
|---|---|
| Projet | `trait-de-famille` |
| Type | **pari** : si chaque fiche Noël passe de deux phrases à 150-250 mots vrais et propres au dessin, alors (1) aucune des 12 fiches n'est en « Explorée, actuellement non indexée » au **2026-11-20** (URL Inspection), et l'objectif D-007 **8 / 13 pages Noël indexées** au 20/11 (baseline **0 / 13** au 2026-10-25) n'est pas manqué pour cause de contenu ; (2) les 12 fiches cumulent **≥ 150 impressions sur 28 j au 2026-12-15** (baseline 0, export du 2026-10-21). Confiance faible sur (1) : les 37 fiches animaux, aussi minces, sont indexées ; le pari porte surtout sur le classement pendant le pic de décembre. **Règle d'arrêt** : D-007 s'applique tel quel (0 / 13 au 20/11 ⇒ plus aucun ticket cette saison) ; si des fiches étoffées sont « Explorées, non indexées » au 20/11, le contenu n'était pas le levier et on ne l'étend pas aux autres thèmes |
| Chantier roadmap | H1 — Pages Noël indexées avant le 20/11 (D-007) ; fenêtre de Noël |
| Objectif servi | Pages Noël indexées : **0 / 13 au 2026-10-25 → 8 / 13 au 2026-11-20** (cible retenue, D-007) |
| Créé le | 2026-10-29 par pm-lead |
| Estimation | < 1 jour (rédaction et relecture comprises) |
| Niveau de revue | léger |

## Pourquoi

Les 12 fiches Noël sont en ligne depuis la mi-octobre, maillées depuis l'accueil et les autres thèmes depuis le 25/10 (T-006), leur indexation demandée en console les 25-26/10. Ce qui les attend quand Googlebot viendra : un titre gabarit, **deux phrases** (`intro` dans `src/lib/coloriages/themes.ts`), une image, des boutons. Sur « coloriage sapin de Noël » ou « coloriage Père Noël », les pages en place proposent bien plus (pm-seo, 14/10). Le site ne peut pas ajouter de pages avant le 20/11 (T-005 gelé : publiées maintenant, elles entreraient en index trop tard) ; il peut rendre celles qui existent dignes d'être gardées et classées pendant le pic de décembre. Une fiche réécrite ne change pas d'URL et n'attend aucune publication de Romain.

## Quoi

Pour chacun des 12 sujets Noël (`sapin-de-noel`, `pere-noel`, `renne-de-noel`, `bonhomme-de-neige`, `cadeau-de-noel`, `boule-de-noel`, `bonnet-de-noel`, `traineau-du-pere-noel`, `lutin-de-noel`, `buche-de-noel`, `couronne-de-noel`, `chaussette-de-noel`), ajouter au sujet, sous l'intro existante, deux ou trois courtes sections rendues sur la fiche :
- **Ce que montre le dessin** : décrit d'après **l'image publiée**, regardée par le dev, pas d'après le prompt (`nom`) — le modèle n'a pas forcément dessiné ce qu'on lui demandait ;
- **Pour le colorier** : les zones (grandes, fines), l'âge annoncé par `difficulte` et pourquoi, des idées de couleurs ;
- **Une idée pour Noël** : un usage concret du dessin imprimé (carte, étiquette de cadeau, décoration de table, calendrier de l'Avent…), sans promettre un produit que le site ne vend pas (Stripe est fermé).

Le texte vit dans `themes.ts` (champs optionnels du `Sujet`, les autres thèmes inchangés). Rédaction par le dev, LiteLLM permis, **relecture obligatoire** : aucune affirmation sur le dessin qui ne se voie pas sur l'image, aucun chiffre, aucune promesse de délai ou de prix. `title` et `description` de la fiche restent ceux d'aujourd'hui.

## Critère de fin (vérifiable par le dev, seul)

- [x] En local, les 12 fiches affichent les nouvelles sections ; une fiche animaux et une fiche dinosaures sont inchangées (HTML identique hors liens Noël).
      Preuve (build de prod de `ticket/T-007` et de `main` côte à côte, même Postgres jetable peuplé des 70 fiches du sitemap de prod) : 3 sections (`<h2>` + `<p>`) sur chacune des 12 fiches, 0 sur main. `/coloriages/animaux/chat` et
      `/coloriages/dinosaures/stegosaure` : HTML identique à main une fois retirés les `<script>`/`<link>` `/_next/` (hashes de build).
- [x] Nombre de mots de texte propre par fiche, avant / après, pour les 12 (avant ≈ 30-40).
      Compté sur le HTML rendu (intro + sections) : sapin 33 → 209 · pere-noel 34 → 203 · renne 32 → 213 ·
      bonhomme-de-neige 37 → 202 · cadeau 34 → 205 · boule 30 → 199 · bonnet 31 → 171 · traineau 30 → 216 ·
      lutin 30 → 198 · buche 35 → 203 · couronne 38 → 195 · chaussette 28 → 163.
- [x] Les 12 textes avant / après joints au « Retour dev » (ou le diff de `themes.ts` cité), avec, pour chacun, une ligne de relecture.
      Diff : `git diff main...ticket/T-007 -- src/lib/coloriages/themes.ts` (avant = l'intro seule, inchangée). Relecture : voir « Retour dev ».
- [x] `<title>`, meta description, canonical, JSON-LD `ImageObject` des 12 fiches inchangés.
      Preuve : extraits du HTML rendu branche et main, comparés fiche par fiche → identiques pour les 12.
- [x] Sitemap : 86 URL, inchangé.
      Preuve : `curl -s localhost:3071/sitemap.xml | grep -o '<loc>' | wc -l` → 86 ; sitemap branche et main identiques octet pour octet (`cmp`).

## Hors périmètre

- Nouvelles fiches, nouveaux sujets (T-005 gelé).
- Le hub `/coloriages/noel` (T-008).
- Les titres et descriptions (on mesure l'effet du contenu seul).
- Les offres `InStock` des données structurées (question 4 ouverte au conseil).
- Toute modification d'image.

## Prérequis

Aucun. **À mettre en ligne avant le 2026-11-05** : au-delà, l'effet ne se lit plus au 20/11.

## À consigner dans journal.md

- Date et commit de mise en production, vérifiés en ligne (à l'origine Coolify si le domaine est en défi).
- Les 12 URL et leur nombre de mots avant / après.
- Rappel de la baseline : 0 / 13 indexées au 2026-10-25, 0 impression Noël à l'export du 2026-10-21.

---

## Règle de rédaction — secrets

On nomme la variable, jamais sa valeur. Voir `_pilotage/templates/ticket.md`.

---

## Retour dev

**État : fait** (preuves locales ; MEP au chef d'orchestre après /valider, **avant le 2026-11-05**). Commits `9668109`,
`c78b325` sur `ticket/T-007`, non poussés.

- `Sujet` reçoit trois champs optionnels (`dessin`, `colorier`, `ideeNoel`), remplis pour les 12 sujets Noël seulement.
  La fiche les rend en un bloc de trois colonnes (`<h2>` + paragraphe) **sous la grille image / intro / boutons**, avant
  « D'autres coloriages » : sous l'intro dans l'ordre du document, sans repousser le bouton de téléchargement.
- Rédaction faite à la main par le dev (pas de LiteLLM), **chaque image publiée regardée** (téléchargée depuis
  `/coloriages/image/…` en prod, lecture seule). Aucun prix, aucun délai, aucune date en chiffres ; les seuls nombres sont
  les âges de `difficulte` (« dès cinq ans ») et des quantités en lettres.

Relecture, fiche par fiche (« Ce que montre le dessin » écrit image sous les yeux pour les 12) :
- sapin-de-noel : ajouté ce que le prompt ne disait pas (guirlande d'ampoules, bonbons, sucres d'orge, étiquettes vides).
- pere-noel : **c'est un sac, pas une hotte** ; barbe sur la poitrine, pas « jusqu'à la ceinture ». Corrigé en revue : le
  visage et la boucle sont aussi de petites zones.
- renne-de-noel : herbe au sol ; corrigé en revue : une sangle barre le flanc (absente du prompt).
- bonhomme-de-neige : conforme au prompt ; ajouté bouche en charbon, deux boutons, ruban du chapeau.
- cadeau-de-noel : **un seul nœud, au sommet** (le prompt en voulait un par paquet).
- boule-de-noel : ajouté la frise de losanges feuillagés, les arcs et la clochette en pointe.
- bonnet-de-noel : conforme ; ni fond ni décor.
- traineau-du-pere-noel : scène de nuit (lune, étoiles, sapins), lanterne, coussins, sac ficelé — rien de tout ça dans le prompt.
- lutin-de-noel : le « cheval de bois » est un cheval à bascule ; bonnet rayé, collant rayé, grelots aux chaussons.
- buche-de-noel : corrigé en revue : biscuit, crème et meringue retirés (ne se voient pas) ; spirale, stries, champignons.
- couronne-de-noel : conforme ; corrigé en revue : retiré « le plus fin de la série » (invérifiable).
- chaussette-de-noel : un troisième objet dépasse à côté de l'ourson et du sucre d'orge, illisible : non nommé.

**Faux dans les intros existantes (hors périmètre : l'intro est aussi la meta description, que le ticket fige)** :
- `cadeau-de-noel` : « chacun avec son ruban et son nœud » — un seul paquet porte un nœud. La fiche se contredit
  désormais (intro contre « Ce que montre le dessin ») : **à corriger par un ticket PM**.
- `pere-noel` : « la hotte » est un sac ; « la barbe jusqu'à la ceinture » est exagéré.
- `buche-de-noel` : « champignons en meringue » ne se voit pas ; « le 25 » est une date en chiffres.

Ce que le PM ne voit pas : rien en prod n'est changé tant que la MEP n'est pas faite ; le texte vit dans le code, aucune
publication de Romain n'est nécessaire. Vérification en ligne à faire à la MEP : les trois `<h2>` sur
`/coloriages/noel/sapin-de-noel` et un `<title>` inchangé.

Revue adversariale du 2026-10-29 (niveau léger, `reviewer-seo`, deux tours) : 5 défauts rapportés, 4 retenus et corrigés,
0 mineur noté, 1 hérité remonté au PM, 0 réfuté.
- Hérité : intros fausses de `cadeau-de-noel` (contradiction interne), `pere-noel`, `buche-de-noel` — hors périmètre (meta description figée).

## Validation PM

**VALIDÉ** le 2026-10-29 par /valider (agent `valideur`), sur `ticket/T-007` @ `fc52a84` contre `main`.

Critères rejoués :
- 12 fiches avec les nouvelles sections, les autres thèmes inchangés : atteint, avec une limite. Rendu conditionnel dans `page.tsx`, 36 champs ajoutés (12 × 3), aucune ligne supprimée dans `themes.ts`. Le HTML identique à main n'a pas été rejoué.
- Mots par fiche : atteint par recoupement. Environ 2067 mots ajoutés, soit environ 172 par fiche plus l'intro, environ 205, cohérent avec les 163 à 216 annoncés.
- Textes consultables avec une relecture par fiche : atteint (diff de `themes.ts` et Retour dev).
- `title`, meta description, canonical et JSON-LD inchangés : atteint, aucune métadonnée dans le diff.
- Sitemap à 86 URL inchangé : atteint, aucun sujet ajouté.
- Aucun chiffre ni prix dans les textes ajoutés : atteint.
- `npx tsc --noEmit` : sans erreur.

Périmètre respecté.

Réserves du valideur, recopiées :
- La description « d'après l'image » ne peut pas être contrôlée sans regarder les 12 images. Je me fie à la déclaration du dev.
- `cadeau-de-noel` se contredit : l'intro dit « chacun avec son ruban et son nœud », alors que la section « Ce que montre le dessin » dit qu'un seul paquet porte un nœud. Le dev l'a remonté au PM, la meta description étant figée par le ticket.
- Les critères restants sont à rejouer en ligne à la MEP, avant le 2026-11-05 : les trois `<h2>` sur `/coloriages/noel/sapin-de-noel` et le `<title>` inchangé. Je n'ai pas vu la page en production.

Reste en `review/` : le passage en `done/`, le merge, le push et la MEP reviennent au chef d'orchestre.
