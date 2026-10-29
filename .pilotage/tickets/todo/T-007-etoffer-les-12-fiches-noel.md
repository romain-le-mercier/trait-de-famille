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

- [ ] En local, les 12 fiches affichent les nouvelles sections ; une fiche animaux et une fiche dinosaures sont inchangées (HTML identique hors liens Noël).
- [ ] Nombre de mots de texte propre par fiche, avant / après, pour les 12 (avant ≈ 30-40).
- [ ] Les 12 textes avant / après joints au « Retour dev » (ou le diff de `themes.ts` cité), avec, pour chacun, une ligne de relecture : ce qui a été corrigé du jet, et la confirmation que « Ce que montre le dessin » a été écrit image sous les yeux.
- [ ] `<title>`, meta description, canonical, JSON-LD `ImageObject` des 12 fiches inchangés.
- [ ] Sitemap : 86 URL, inchangé.

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

## Validation PM
