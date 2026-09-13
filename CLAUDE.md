# Trait de Famille — règles de travail

# Cadre dev — pilotage par tickets

Ce projet est piloté depuis le dossier parent par des agents PM. Le seul canal entre eux et moi
est `.pilotage/`, versionné dans ce dépôt. **Aucun artefact, aucun dossier externe ne fait foi.**

```
.pilotage/ROADMAP.md      PM. Je lis, je n'édite jamais.
.pilotage/KPIS.md         PM. Idem.
.pilotage/tickets/todo/   PM écrit. Je prends le premier (ordre alphabétique) sauf consigne de Romain.
.pilotage/tickets/doing/  Moi. Un seul ticket à la fois.
.pilotage/tickets/review/ Moi, à la livraison, section « Retour dev » remplie.
.pilotage/tickets/done/   Moi, via /valider (verdict du valideur). Le PM relit après coup.
.pilotage/journal.md      Moi, append-only. Date de MEP, commit, chiffre, valeur remplacée.
```

Quatre commandes : `/ticket [T-xxx]` pour prendre, `/review` avant de rendre (cinq reviewers adversariaux + un contre-expert), `/livrer` pour rendre, `/valider` pour clore (le valideur rejoue les critères de fin ; si c'est bon le ticket part en `done/` et devient déployable). Elles font les déplacements et le journal.



## Pas de ticket, pas de code

- Je lis `ROADMAP.md` (au moins « Ne pas faire » et « Arbitrages ») puis le ticket, en entier.
- Je déplace le ticket : `git mv .pilotage/tickets/todo/T-xxx… .pilotage/tickets/doing/`.
- Branche `ticket/T-xxx`. Chaque commit commence par `T-xxx:`. Je ne commite que si Romain le demande.
- Je fais **ce que dit le ticket, et rien de la section « Hors périmètre »**. Ce que je remarque en passant va dans « Retour dev », pas dans le code.
- Si le ticket est faux, impossible, ou si son critère de fin n'est pas vérifiable : je l'écris dans « Retour dev », je le passe en `review/`, je m'arrête. Je ne corrige pas la roadmap, je ne réinterprète pas.
- Une demande de Romain hors ticket : je la fais si elle est petite et je la consigne au journal avec `T-000` ; sinon je lui demande un ticket.

## Livrer

1. Chaque case du critère de fin est cochée avec la preuve (sortie de commande, URL, chiffre).
2. « Retour dev » rempli : fait / partiel / bloqué / abandonné, ce qui s'est révélé faux, ce que le PM ne peut pas voir.
3. `git mv .pilotage/tickets/doing/T-xxx… .pilotage/tickets/review/`.
4. Une ligne en bas de `journal.md` : `| date | T-xxx | livré | commit | chiffre | note |`.
5. Après mise en production, une seconde ligne avec la **date réelle de MEP vérifiée en ligne** et la valeur remplacée s'il y en a une.

Une tâche est « Faite » avec sa preuve, sinon elle est « partielle » avec ce qui reste.
Ce qui incombe à Romain reste ouvert tant qu'il ne l'a pas confirmé.

Les gardes (`.claude/hooks/dev-guard.js`, `dev-stop.js`) refusent l'écriture sur la partie PM,
le commit sans ticket, et l'arrêt avec un ticket en `doing/` non journalisé. Elles ne se contournent pas.

## Règles générales

- Ne jamais commiter de soi-même. Attendre la demande.
- Ne pas dépasser une étape sans avoir vérifié son critère de fin.
- Pas de rapport en markdown spontané : le canal de compte rendu, c'est une réponse courte
  dans la conversation.
