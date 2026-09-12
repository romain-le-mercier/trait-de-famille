---
name: ticket
description: Prendre un ticket dev dans ce projet. Usage : /ticket [T-xxx]. Sans argument, prend le premier ticket de .pilotage/tickets/todo/. Lit la roadmap, déplace le ticket en doing/, crée la branche, puis commence le travail dans le périmètre du ticket.
---

# /ticket [T-xxx]

1. **Un seul ticket à la fois.** Si `.pilotage/tickets/doing/` contient déjà un ticket, s'arrêter : le livrer d'abord avec `/livrer`, ou le dire à Romain.
2. Lire `.pilotage/ROADMAP.md`, au moins les sections « Ne pas faire » et « Arbitrages ». Ce qui y est écrit ne se discute pas dans le ticket.
3. Choisir le ticket : celui donné en argument, sinon le premier de `todo/` par ordre alphabétique. `todo/` vide → le dire et s'arrêter, pas de travail sans ticket.
4. Lire le ticket en entier. Vérifier que chaque **critère de fin** est vérifiable seul. Si le ticket est faux, impossible, ou si un prérequis manque : écrire pourquoi dans sa section « Retour dev », le déplacer directement en `review/`, une ligne au journal, s'arrêter.
5. Prendre :
   ```
   git mv .pilotage/tickets/todo/T-xxx-… .pilotage/tickets/doing/
   git checkout -b ticket/T-xxx
   ```
   Si le dépôt n'a aucun commit (cas de jacheteenmagasin.com), rester sur la branche courante et le noter au journal.
6. Ajouter une ligne en bas de `.pilotage/journal.md` : `| date | T-xxx | pris | | | |` (Edit, jamais Write).
7. Faire ce que dit le ticket, **rien de la section « Hors périmètre »**. Ce qu'on remarque en passant va dans « Retour dev », pas dans le code. Chaque commit, si Romain le demande, commence par `T-xxx:`.
8. Quand c'est fini : `/livrer`.
