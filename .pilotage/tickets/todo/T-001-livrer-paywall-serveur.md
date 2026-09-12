# T-001 — Livrer le paywall côté serveur resté hors dépôt

| | |
|---|---|
| Projet | `trait-de-famille` |
| Chantier roadmap | H0 — Offre payante en ligne et prouvée au 1er novembre / Livrer le paywall serveur |
| KPI visé | Ventes Stripe 28 j (KPI nord) |
| Créé le | 2026-09-12 par pm-lead |
| Modifié le | 2026-09-12 par pm-lead — le ticket supposait un paywall complet ; Romain ne l'a pas testé. Une étape d'établissement de l'état réel est ajoutée en tête. Périmètre inchangé. |
| Estimation | < 1 jour (sinon découper) |

## Pourquoi

Au 2026-09-12, `origin/main` s'arrête au commit `300afb8` du 2026-08-28 et l'arbre de travail contient ~250 lignes non commitées sur 8 fichiers plus 7 fichiers nouveaux (`migrations/004_oeuvres.sql`, `src/lib/server/{oeuvres,stockage,visiteur,filigrane}.ts`, `src/app/api/oeuvres/`, `.env.example`, `.gitignore`, README). Le README de l'arbre décrit un paywall où l'original ne quitte plus le serveur avant paiement ; la production, elle, tourne sur l'ancien chemin où le fichier propre part dans IndexedDB dès la génération : une vente au 1er novembre sur ce chemin vend ce qui est déjà donné.

**Modifié le 2026-09-12 : ce code n'est pas réputé fonctionnel.** Le ticket avait été écrit avec la question « ce paywall est-il complet et à livrer tel quel ? » posée à Romain. Sa réponse : **« Je pense que oui, je n'ai pas testé. »** Ce n'est donc pas un feu vert — c'est un état **non vérifié**, et personne, ni lui ni le pilotage, ne sait aujourd'hui si ce code marche. Conséquence pour ce ticket : **il ne commence plus par livrer, il commence par établir.** Le README non commité qui décrit le paywall « comme fait » n'est pas une preuve : il a été écrit par la même main que le code, sans exécution.

Deuxième conséquence, à savoir avant de commencer : **Stripe n'est pas configuré en production** (Romain, 2026-09-12 — codé, mais ni clés live ni webhook déclaré). Le tunnel d'achat ne peut donc **pas** être prouvé de bout en bout à l'issue de ce ticket, et ce n'est pas un défaut du dev. Livrer le paywall reste utile et urgent — il ferme la fuite du fichier propre avant paiement — mais ne rend rien vendable à lui seul.

## Quoi

- **Établir d'abord l'état réel du code non commité, et l'écrire, avant de décider de le livrer.** Concrètement : le faire tourner. Une génération d'aperçu complète en local du début à la fin, la migration `004` appliquée, un déblocage après paiement simulé, le retour `/merci`. Ce qui ne fonctionne pas est listé dans « Retour dev », point par point, **avant** toute décision de fusion. Si le paywall se révèle incomplet, ce ticket s'arrête là (voir le dernier point de cette section) : c'est un résultat valide, pas un échec.
- Passer en revue le travail non commité (c'est le rôle de `/review`) sur une branche `ticket/T-001`. Ne rien y ajouter : le périmètre est ce qui existe déjà dans l'arbre.
- Vérifier que la migration `004_oeuvres.sql` respecte la règle du projet (fichier neuf, jamais de modification d'une migration déployée) et qu'elle passe au démarrage sur une base vierge et sur une base déjà migrée en 003.
- Vérifier que `STOCKAGE_DIR` est documenté comme volume monté obligatoire en production (c'est le cas dans `.env.example` de l'arbre) et que sans variable l'app écrit dans `.donnees/` en local sans planter.
- Livrer sur `main` puis constater la mise en production sur trait-de-famille.fr.
- Si le travail est incomplet ou casse un chemin existant (déblocage des dessins produits avant la migration, retour `/merci`), **le dire dans « Retour dev », passer le ticket en `review/` et s'arrêter** : ne pas finir le paywall dans ce ticket.

## Critère de fin (vérifiable par le dev, seul)

- [ ] `git -C trait-de-famille status --short` ne montre plus aucun fichier modifié ou non suivi hors `.pilotage/`, `.claude/`, `CLAUDE.md`.
- [ ] `git log origin/main --oneline -1` montre un commit `T-001: …` contenant `migrations/004_oeuvres.sql`.
- [ ] En production, une génération d'aperçu (une seule photo, un seul appel) renvoie l'en-tête `X-Oeuvre` et un corps qui ne contient que l'aperçu filigrané ; la réponse est consignée (code, en-têtes, taille) sans la photo.
- [ ] En production, `GET /api/generate` renvoie `{"available":true}` et un champ `restant` non nul (quota actif).
- [ ] `npm run typecheck` et `npm run lint` passent.
- [ ] « Retour dev » contient l'état réel du code non commité tel que tu l'as trouvé : ce qui tournait, ce qui ne tournait pas, ce que tu as dû corriger pour livrer. Ce point est **obligatoire même si tout fonctionnait**.

## Hors périmètre

- Toute fonctionnalité nouvelle : page `/admin/ventes`, thème Noël, accroche cadeau, textes légaux, modification des prix ou des quotas.
- Refactoring de ce qui n'est pas dans le diff existant.
- Configuration Stripe / Google / `ADMIN_EMAILS` en production : c'est à Romain, et ce n'est pas vérifiable par le dev.

## Prérequis

Aucun. La question à Romain « ce paywall est-il complet et à livrer tel quel ? » a été **répondue le 2026-09-12 : « Je pense que oui, je n'ai pas testé. »** Le ticket part donc d'un état non vérifié, et c'est au dev de l'établir en premier (voir « Quoi »). Ne pas attendre d'autre confirmation : elle n'existe pas.

Rappel, hors de portée du dev : **Stripe n'est pas configuré en production**. Ne pas essayer de le configurer, ne pas créer de clés, ne pas déclarer de webhook — c'est à Romain.

## À consigner dans journal.md

- Date et commit de mise en production, vérifiés en ligne (pas supposés).
- Nombre de fichiers et de lignes du diff livré (`git diff --stat` avant commit).
- Résultat de la génération test en production : présence de `X-Oeuvre`, taille de l'aperçu, quota `restant` lu.
- **Ce qui manquait au paywall quand tu l'as pris.** Romain ne l'a jamais testé : ton constat est la première mesure de l'état de ce code. L'écrire même si tout marchait — « rien ne manquait » est une information.
- Si le ticket est arrêté : ce qui manque au paywall, en une ligne par point.

---

## Retour dev

*(rempli par le dev, en doing/ ou review/ — fait, partiellement fait, bloqué, abandonné ; ce qui s'est révélé faux dans le ticket ; ce que le PM ne peut pas voir)*

## Validation PM

*(rempli par pm-lead au passage en done/ ou au renvoi en todo/)*
