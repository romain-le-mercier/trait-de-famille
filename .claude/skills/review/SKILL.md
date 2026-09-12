---
name: review
description: Revue adversariale du ticket en cours avant livraison. Usage : /review. Lance en parallèle cinq reviewers hostiles (architecture, sécurité, performance, SEO, fiabilité) sur le diff du ticket, puis un contre-expert qui tente de réfuter chaque défaut. Ne garde que ce qui résiste. Obligatoire avant /livrer.
---

# /review

Cinq reviewers cherchent à casser le code, un sixième cherche à casser leurs conclusions. Le dev ne corrige que ce qui survit.

## Déroulé

1. **Périmètre** : le ticket est dans `.pilotage/tickets/doing/` (sinon, s'arrêter). Diff à revoir :
   - branche `ticket/T-xxx` : `git diff main...HEAD` plus `git status --short` pour les fichiers non suivis ;
   - dépôt sans commit ou sans branche : `git status --short` et `git diff`, liste explicite des fichiers touchés.
   Note la commande exacte : les reviewers la relanceront eux-mêmes, ne leur colle pas le diff entier.
2. **Reviewers, en parallèle** via l'outil Agent, un appel chacun : `reviewer-archi`, `reviewer-secu`, `reviewer-perf`, `reviewer-seo`, `reviewer-fiabilite`. Chaque prompt contient : le chemin du ticket, la commande de diff, le chemin du `CLAUDE.md` du projet, et la consigne « rends au plus 5 défauts au format demandé, rien d'autre ». Sur un projet sans surface web publique, `reviewer-seo` peut être omis ; le dire.
3. **Contre-expertise** : passe l'ensemble des défauts, verbatim, à `review-verifier` avec la même commande de diff. Il rend Retenus / Mineurs / Hérités / Réfutés.
4. **Corriger** : chaque défaut **Retenu** se corrige maintenant, dans le périmètre du ticket. Un Retenu qui exigerait de sortir du périmètre ne se corrige pas : il passe dans le Retour dev comme « bloqué par le périmètre », et le ticket sera livré « partiel ».
5. **Relancer** uniquement les reviewers dont un défaut a été corrigé, puis le verifier, jusqu'à zéro Retenu ou jusqu'à ce que seuls restent des « bloqués par le périmètre ». Deux tours maximum ; au-delà, livrer partiel et l'écrire.
6. **Tracer** dans la section « Retour dev » du ticket, une ligne :
   `Revue adversariale du <date> : <n> défauts rapportés, <n> retenus et corrigés, <n> mineurs notés, <n> hérités remontés au PM, <n> réfutés.`
   puis les Mineurs et Hérités en liste courte. Les Hérités sont la matière des prochains tickets du PM.

## Règles

- Un reviewer qui rend une liste de conseils sans scénario ni ligne a échoué : ignorer sa sortie et le relancer une fois avec la consigne rappelée.
- Aucun reviewer n'écrit dans le dépôt. Seul le dev corrige.
- `/livrer` refuse un ticket dont la dernière revue laisse un Retenu non corrigé et non marqué « bloqué par le périmètre ».
