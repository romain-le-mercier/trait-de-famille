---
name: livrer
description: Livrer le ticket en cours (doing/) au PM. Usage : /livrer. Vérifie chaque critère de fin avec sa preuve, remplit la section Retour dev, déplace le ticket en review/, ajoute la ligne au journal.
---

# /livrer

1. Le ticket est dans `.pilotage/tickets/doing/`. Aucun → rien à livrer.
2. **Revue adversariale faite ?** La section « Retour dev » doit contenir une ligne « Revue adversariale du … » datée d'après la dernière modification du code, avec zéro défaut Retenu non corrigé (hors « bloqué par le périmètre »). Sinon, lancer `/review` d'abord. Pas de revue, pas de livraison.
3. **Chaque case du critère de fin** : la cocher seulement avec la preuve à côté (sortie de commande, URL testée, chiffre, chemin du fichier). Une case sans preuve reste vide et le ticket est « partiel ».
3. Remplir « Retour dev » : `fait` / `partiel` / `bloqué` / `abandonné` ; ce qui s'est révélé faux dans le ticket ; ce que le PM ne peut pas voir (valeur remplacée, comportement en prod, ce qui incombe à Romain et attend sa confirmation).
4. Déplacer : `git mv .pilotage/tickets/doing/T-xxx-… .pilotage/tickets/review/`.
5. Ligne en bas de `.pilotage/journal.md` (Edit, jamais Write) :
   `| date | T-xxx | livré (fait/partiel/bloqué) | commit ou « non commité » | chiffre avant/après | note |`
6. Si la mise en production dépend d'un push ou d'une action de Romain : le dire dans la réponse. Après MEP, **une seconde ligne au journal avec la date réelle vérifiée en ligne** et la valeur remplacée s'il y en a une. Cette ligne vaut plus que tout le reste.
7. Ne pas commiter sans que Romain le demande. Ne toucher ni ROADMAP, ni KPIS, ni `todo/`, ni `done/`.
