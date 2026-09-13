---
name: valider
description: Valider un ticket livré et le clore sans attendre le PM. Usage : /valider [T-xxx]. Convoque le valideur, qui rejoue lui-même chaque critère de fin ; si c'est bon, le ticket passe en done/ et devient déployable.
---

# /valider [T-xxx]

Ferme la boucle côté projet : le ticket n'attend plus la prochaine revue du PM pour être clos.
Sans argument, prend le premier ticket de `.pilotage/tickets/review/` (ordre alphabétique).

**Tu ne valides pas ton propre travail.** C'est l'agent `valideur` qui tranche, et il rejoue les
critères au lieu de lire les cases cochées. Tu exécutes son verdict, tu ne le discutes pas.

1. Trouve le ticket dans `.pilotage/tickets/review/`. Aucun → rien à valider, dis-le et arrête-toi.
2. Convoque l'agent `valideur` avec : le chemin du ticket, la racine du projet, le nom de la branche
   (`ticket/T-xxx`) et la branche de référence (`main`). Ne lui souffle aucune conclusion, ne lui
   dis pas que le travail est bon, ne résume pas ce que tu as fait : il doit arriver sans a priori.
3. **Verdict VALIDÉ** :
   - `git mv .pilotage/tickets/review/T-xxx-… .pilotage/tickets/done/`
   - Dans le ticket, remplis la section « Validation PM » : `Validé le <date> par /valider`, les
     critères rejoués, et les réserves du valideur s'il en a posé. Recopie ses réserves telles
     quelles — c'est ce que le PM lira à la revue suivante.
   - Ajoute une ligne à `.pilotage/journal.md` (Edit, jamais Write) :
     `| date | T-xxx | validé | commit | — | <réserve éventuelle> |`
   - Dis à Romain que le ticket est déployable, et **ce qu'il doit faire pour le mettre en production**
     (fusionner la branche, pousser, purger un cache, agir en console). La MEP reste son geste.
4. **Verdict REFUSÉ** :
   - **Le ticket ne bouge pas.** Il reste en `review/`.
   - Reporte le verdict dans « Retour dev » : ce qui n'est pas atteint, daté.
   - Corrige, relance `/review` si le code a changé, puis `/valider` à nouveau.
   - Trois refus sur le même ticket : arrête-toi et demande à Romain. Le ticket est probablement faux,
     pas le travail.
5. **Après la mise en production**, une seconde ligne au journal avec la **date réelle vérifiée en ligne**
   et la valeur remplacée s'il y en a une. Cette ligne vaut plus que tout le reste : c'est la seule
   trace que le PM ne peut pas reconstituer.

## Ce que /valider ne fait pas

- Il ne met rien en production : Coolify déploie au push, et le push appartient à Romain.
- Il ne touche ni `ROADMAP.md`, ni `KPIS.md`, ni `tickets/todo/`. Le PM reste seul à écrire les tickets
  et à tenir la roadmap ; il relit `done/` à la revue suivante et peut contester une validation.
- Il ne remplace pas `/review` : un ticket qui n'a pas passé la revue adversariale n'arrive pas ici,
  `/livrer` l'a déjà refusé.
