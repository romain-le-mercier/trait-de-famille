# T-003 — Établir pourquoi le texte SVG du filigrane ne rend pas en production

| | |
|---|---|
| Projet | `trait-de-famille` |
| Chantier roadmap | H0 — Offre payante en ligne / régression filigrane trouvée en production |
| KPI visé | Aucun KPI chiffré (dissuasion de l'aperçu gratuit, pas un KPI suivi) |
| Créé le | 2026-09-13 par pm-lead |
| Estimation | < 1 jour (sinon découper) |

## Pourquoi

Le filigrane mesuré sur l'aperçu servi est passé de 10,68 % de pixels filigranés en local à **0,00 % en production** (constat du 2026-09-13, vérifié à l'œil sur les deux images) : le motif est un SVG `<text>`, et ce texte ne se dessine pas sur le serveur de production. Un correctif de conséquence (bandes diagonales `<rect>`, sans texte) a déjà été fait hors ticket et attend un feu vert de Romain pour être poussé — mais il bouche l'effet, pas la cause. On attend de ce ticket une **explication reproductible** de pourquoi le texte ne rend pas, pas une nouvelle rustine.

## Quoi

- Établir la cause du non-rendu du `<text>` SVG dans l'environnement de production (candidats à vérifier, liste non limitative) : absence de police dans l'image du conteneur de production, bibliothèque de rendu SVG différente de celle utilisée en local (ou une de ses dépendances système, ex. `librsvg`, `resvg`, `sharp`/`libvips` et sa configuration de rendu texte), variable d'environnement ou option de build qui change de comportement entre local et production.
- Reproduire le défaut de façon isolée (le plus petit cas possible : un SVG `<text>` seul, converti dans les mêmes conditions que la production) pour ne pas dépendre du reste du pipeline de génération.
- Consigner la cause trouvée avec la preuve qui la confirme (sortie de commande, diff de configuration, comparaison d'image).
- Dire, une fois la cause connue, si le correctif à bandes diagonales (T-000, non commité) reste nécessaire ou si le texte peut être restauré directement.

## Critère de fin (vérifiable par le dev, seul)

- [ ] La cause du non-rendu est identifiée et reproduite dans un cas isolé (pas seulement observée en aval).
- [ ] La preuve de la cause est consignée (commande, config, ou comparaison d'image) — une hypothèse non vérifiée ne clôt pas le ticket.
- [ ] « Retour dev » dit explicitement si le correctif à bandes (T-000) reste nécessaire une fois la cause connue, ou s'il peut être retiré/remplacé.

## Hors périmètre

- Ne pas retoucher au paywall (T-001, déjà en production).
- Ne pas revenir sur les bandes diagonales (T-000, non commité) tant que la cause n'est pas établie : ni les enlever, ni les modifier, ni les pousser.
- Pas de nouvelle fonctionnalité de filigrane : ce ticket diagnostique, il ne redessine pas.

## Prérequis

**Ce projet ne se construit qu'en conteneur `node:20`.** Node 18 sous WSL bloque `next build` (reste bloqué sur « Creating an optimized production build » sans consommer de CPU, constaté trois fois sur T-001) — le savoir avant de commencer évite une perte de temps garantie.

## À consigner dans journal.md

- La cause identifiée, avec sa preuve.
- Si le correctif T-000 reste nécessaire ou non, et pourquoi.
- Toute différence d'environnement (image de base, paquets système, variables) trouvée entre local et production.

---

## Retour dev

*(rempli par le dev, en doing/ ou review/ — fait, partiellement fait, bloqué, abandonné ; ce qui s'est révélé faux dans le ticket ; ce que le PM ne peut pas voir)*

## Validation PM

*(rempli par pm-lead au passage en done/ ou au renvoi en todo/)*
