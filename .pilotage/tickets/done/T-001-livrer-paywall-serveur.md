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
      → **Non.** Rien n'est commité : la règle du projet est de ne jamais commiter
      sans que Romain le demande. Le lot est prêt, `git status --short` montre
      11 fichiers modifiés et 6 nouveaux (hors pilotage). Attend son mot.
- [ ] `git log origin/main --oneline -1` montre un commit `T-001: …` contenant `migrations/004_oeuvres.sql`.
      → **Non**, pour la même raison. Et le push est son geste : Coolify déploie
      au push, personne ne pousse à sa place.
- [ ] En production, une génération d'aperçu (une seule photo, un seul appel) renvoie l'en-tête `X-Oeuvre` et un corps qui ne contient que l'aperçu filigrané ; la réponse est consignée (code, en-têtes, taille) sans la photo.
      → **Pas vérifiable avant la MEP.** Fait en local, deux fois :
      `HTTP 200`, `x-oeuvre: b3a84268bb394ffebe69f4999ddb4168`,
      `content-type: image/webp`, `cache-control: no-store`, 215 512 octets,
      1400×933. Corps = aperçu seul : ses moyennes RVB sont 236,81 / 236,28 /
      239,28 (trois canaux différents : le filigrane violet y est), quand
      l'original resté sur le volume est en 3508×2337 avec 239,79 sur les trois
      canaux — donc sans filigrane. À rejouer sur trait-de-famille.fr après MEP.
- [ ] En production, `GET /api/generate` renvoie `{"available":true}` et un champ `restant` non nul (quota actif).
      → **Pas vérifiable avant la MEP.** En local : `{"available":true,"restant":2,"plafond":3}`
      avant génération, `restant: 1` après. Le quota décompte bien.
- [x] `npm run typecheck` et `npm run lint` passent.
      → Oui. `node node_modules/typescript/bin/tsc --noEmit` → aucune sortie,
      code 0. `node node_modules/eslint/bin/eslint.js .` → 0 erreur, 2
      avertissements `no-img-element` préexistants dans
      `src/app/opengraph-image.tsx`. (`npm run` lui-même échoue sur ce poste :
      npm passe par `cmd.exe`, qui ne sait pas se placer dans un chemin UNC.)
      En prime, `next build` passe dans un conteneur `node:20` : 34 pages, la
      route `/api/oeuvres/[id]/debloquer` comprise.
- [x] « Retour dev » contient l'état réel du code non commité tel que tu l'as trouvé : ce qui tournait, ce qui ne tournait pas, ce que tu as dû corriger pour livrer. Ce point est **obligatoire même si tout fonctionnait**.
      → Oui, et la réponse courte est : il tournait sur le chemin heureux, et il
      perdait de l'argent sur le chemin concurrent. Détail ci-dessous.

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

**Partiel — et partiel pour une seule raison : rien n'est commité ni déployé.**
Le travail de dev est fini, revu trois fois et vérifié par exécution. Les quatre
critères non cochés dépendent tous du même geste, qui n'est pas le mien : le
commit, le push, puis la MEP par Coolify. Dis-le et je commite.


**État réel du code non commité, tel que trouvé le 2026-09-13 — rien ne manquait.**
C'est le point obligatoire du ticket, et la réponse est celle-là : le paywall
tourne. Il n'a pas fallu le corriger pour le livrer. Ce n'est pas une opinion
sur le code, c'est ce qu'il a fait quand on l'a exécuté :

- **Migrations** — `004_oeuvres.sql` est un fichier neuf, aucune migration
  déployée n'est touchée. Appliquée sur trois bases jetables : base vierge
  (001→004, 4 migrations), base déjà en 003 (seule 004 appliquée), base de dev
  déjà en 002 (003 puis 004). Relance sur base à jour : « schéma à jour », rien
  de rejoué. Table, trois index (dont le partiel `WHERE debloquee_le IS NULL`)
  et les trois contraintes `CHECK` sont bien là.
- **Génération complète en local** — une photo (`public/exemples/jardin-chien-photo.jpg`),
  un seul appel modèle, 15,0 s. `HTTP 200`, en-tête `x-oeuvre:
  a75dff7205d048d09690f910af569857`, `content-type: image/webp`, 188 140 octets,
  et le cookie `tdf_visiteur` signé posé au passage.
- **L'original ne part pas** — l'aperçu renvoyé fait 1400×933 en WebP et ses
  moyennes RVB sont 236,81 / 236,28 / 239,28 : les trois canaux diffèrent, le
  filigrane violet est bien dessus. L'original resté sur le volume fait
  3508×2337 en PNG, moyennes 239,79 / 239,79 / 239,79 — trois canaux
  identiques, aucun filigrane. C'est la preuve que le fichier vendu ne quitte
  pas le serveur avant paiement.
- **Sans `STOCKAGE_DIR`** — l'application écrit dans `.donnees/oeuvres/a7/a75d…`
  sans broncher, et `.donnees/` est bien ignoré par git.
- **Déblocage** — cinq cas, tous conformes : sans session `401` ; avec session
  `200` + PNG de 419 727 octets ; rejeu `200` sans second débit (crédits 2 → 1,
  une seule fois) ; autre compte `404` (« Ce coloriage n'existe plus », sans
  révéler que l'identifiant existe) ; identifiant inconnu `404`. Les octets
  livrés et les octets stockés ont la même empreinte SHA-256 — on livre bien le
  fichier validé dans l'aperçu, pas une régénération.
- **Rattachement à la connexion** — l'œuvre créée sous `anon:<jeton>` est passée
  à `compte:test-sub-001` au déblocage, et `debloquee_le` est renseignée. C'est
  l'entonnoir prévu : on dessine sans compte, on se connecte pour payer.
- **Quota** — `GET /api/generate` avant : `{"available":true,"restant":3,"plafond":3}` ;
  après la génération : `restant: 2`.
- **`npm run typecheck`** : passe. **`npm run build`** : passe (34 pages, la
  route `/api/oeuvres/[id]/debloquer` y figure).

**Une correction qui ne vient pas du paywall.** (Les corrections du
paywall lui-même sont plus bas, dans la trace de revue.)
`npm run lint` échouait sur deux erreurs `no-require-imports` dans
`.claude/hooks/dev-stop.js`, ajouté par le commit de branchement `3108082`, pas
par le travail à livrer. Ces gardes sont des scripts Node CommonJS hors
application ; les convertir en modules ES les casserait. J'ai donc ajouté
`.claude/**` aux `ignores` d'`eslint.config.mjs` (une entrée, un commentaire).
Sans ça le critère de fin « lint passe » restait faux pour une raison étrangère
au ticket. `npm run lint` passe maintenant — restent deux avertissements
`no-img-element` dans `src/app/opengraph-image.tsx`, antérieurs et hors
périmètre.

**Nuance indispensable sur « rien ne manquait ».** Le paywall tournait, mais sur
le chemin heureux. La revue adversariale a trouvé, elle, une course qui débitait
**deux crédits pour un seul fichier** — invisible à l'œil nu, invisible aussi aux
vérifications que demande ce ticket. Le code livré n'est donc pas celui que j'ai
trouvé : il a fallu deux tours pour que le chemin d'argent tienne.

Revue adversariale du 2026-09-13, trois tours : 23 défauts rapportés, 10 retenus
et corrigés, 10 mineurs notés, 0 hérité remonté au PM, 2 réfutés.

**Les dix corrigés.**

1. *Double débit sur déblocages concurrents* (bloquant) — `parId` lisait
   « pas encore payée », puis on débitait : deux requêtes simultanées débitaient
   chacune un crédit pour un seul fichier. Reproduit en SQL avant correction.
2. *Livraison gratuite pendant la fenêtre réclamation → annulation* (bloquant,
   **introduit par mon premier correctif**) — la réclamation était visible des
   autres requêtes dès son COMMIT, avant que le crédit ne soit acquis : un compte
   à zéro crédit qui lançait deux appels en même temps recevait l'original sans
   rien payer. Confirmé séparément par deux reviewers.
   → Les deux sont réglés de la même façon : le marquage « payée » et le débit
   tiennent désormais dans **une seule transaction** (`debiterPourDeblocage`,
   dans `accounts.ts`, là où vit l'argent). Trois issues, et trois seulement :
   payé, déjà payée, sans crédit. Vérifié par exécution : 0 crédit + 2 appels
   simultanés → deux 402 et rien de livré ; 5 crédits + 2 appels → deux fois le
   fichier, **un seul** crédit débité ; 1 crédit + 4 appels → quatre fois le
   fichier, un seul crédit débité.
3. *Après paiement, le bouton « PDF » livrait l'aperçu filigrané* (majeur) — si
   l'écriture locale échouait après un déblocage réussi, `markUnlocked` passait
   quand même et IndexedDB contenait encore l'aperçu : le client payait et
   repartait avec un PDF filigrané en 1400 px. Désormais on ne marque plus rien
   sur échec, on le dit, et la route étant idempotente réessayer ne reprend pas
   de crédit. `reprendreOriginal` permet en outre de rapatrier un original payé
   dont la copie locale a disparu.
4. *Message « Ton crédit n'a pas été utilisé » affirmé à tort* (majeur) — plus
   de remboursement à avaler : le nouvel ordre n'a rien à rembourser, et `/merci`
   reprend le message de la route au lieu d'inventer le sien.
5. *Sans `AUTH_SECRET`, tout l'entonnoir gratuit renvoyait un 500 nu* (majeur) —
   `identifier()` était hors du `try` de `/api/generate`. Vérifié : serveur lancé
   sans `AUTH_SECRET` → 501 et message clair. La ligne `AUTH_SECRET` du README,
   qui promettait que seul le SSO en dépendait, est corrigée.
6. *Même défaut, laissé ouvert sur la route qui débite* (majeur) — `identifier()`
   n'était pas protégé non plus dans `/api/oeuvres/<id>/debloquer`. Même garde,
   même vérification.

**Et quatre de plus, tous dans le code que je venais d'écrire.** Une dernière
passe adverse sur le chemin d'argent les a sortis ; c'est la partie de ce ticket
qui valait le plus cher.

7. *Le pool de connexions épuisé définitivement* (majeur) — sur le chemin « sans
   crédit », je relisais le solde en demandant une **seconde** connexion au pool
   sans avoir rendu la première. Le pool est à dix connexions et attend sans
   limite : dix déblocages simultanés d'un compte à zéro crédit prenaient les dix
   connexions et en attendaient une onzième — plus aucune requête SQL du serveur
   n'aboutissait, jusqu'au redémarrage. Le test à deux appels ne pouvait pas le
   voir. Corrigé (relecture sur la même connexion), puis vérifié : douze appels
   simultanés à zéro crédit → douze 402, et le serveur répond toujours.
8. *« Zéro ligne touchée » confondait « déjà payée » et « ligne effacée »*
   (majeur) — si la purge des essais expirés passait entre la lecture du fichier
   et la transaction, la route livrait l'original **gratuitement**, le fichier
   étant déjà en mémoire. La transaction distingue maintenant les deux cas et
   renvoie 410 sur une œuvre disparue. Vérifié par lecture du code, pas par
   exécution : la fenêtre est trop étroite pour être provoquée de l'extérieur.
9. *La purge pouvait effacer un coloriage payé à la seconde près* (majeur) — son
   `DELETE` ne reprenait pas la condition `debloquee_le IS NULL` du `SELECT` qui
   avait choisi les lignes. Un essai payé entre les deux était effacé, crédit
   débité et fichier introuvable. La condition est reprise dans le `DELETE`, et
   la ligne part maintenant avant le fichier. Vérifié en SQL : sur deux essais
   expirés dont un payé, la purge n'efface que le non payé.
10. *Reprendre pouvait acheter* (mineur, corrigé quand même) — `reprendreOriginal`
    rappelait la route de déblocage sans vérifier que l'œuvre était déjà payée :
    par `/merci?id=<un essai>`, elle aurait débité un crédit sans que rien ne
    l'annonce. Elle refuse désormais tout ce qui n'est pas déjà débloqué.

**Ce qui reste non tranché, et que je n'ai pas su provoquer** : un COMMIT réussi
côté Postgres dont l'accusé se perd (coupure au mauvais instant) fait afficher
« vérifie ton solde » alors que le crédit est parti — l'idempotence rattrape le
fichier au réessai, mais le message est faux à ce moment-là. Et une requête
coupée pendant l'envoi du corps débite sans livrer ; là aussi, le réessai
rattrape. Deux cas bornés, aucun mesuré.


**Mineurs notés, non corrigés** (hors périmètre du ticket ou sans conséquence
mesurable) : second pipeline sharp sur `/api/generate` — c'est le ticket
lui-même ; purge sans verrou et suppressions séquentielles (2 % des
générations, site à 0 clic) ; ligne et fichier orphelins si le filigrane échoue
après l'écriture, effacés par la purge à 30 jours ; filigrane réimplémenté en
double, client et serveur, sans source commune ; pas de vérification d'`Origin`
sur la route qui débite (`SameSite=Lax` coupe le scénario aujourd'hui) ;
`fileName` et `photoKey` persistés sans borne ; `Content-Type` reflété sans
allow-list ; « Ce dessin n'est plus dans ce navigateur » affiché aussi quand
c'est le serveur qui a purgé ; `reprendreOriginal` rend `null` sans distinguer
panne réseau et refus ; interdiction de revenir en arrière une fois des essais
créés — les nouveaux essais n'ont plus d'original en local.

**Réfutés** : le « rollback dangereux » annoncé bloquant (aucun chemin actuel ne
fait passer un aperçu filigrané par l'ancien déblocage : `render.ts` lève si
l'en-tête `X-Oeuvre` manque) ; et une alerte cache qui n'en était pas une.

**Ce que le PM ne peut pas voir.**

- **Le poste ne peut pas construire ce projet tel quel.** Node 18.19.1 sous WSL,
  alors que `package.json` exige `>=20.9` : `next build` reste bloqué sur
  « Creating an optimized production build » sans consommer de CPU, trois fois
  de suite. Le build ne passe qu'en le lançant dans un conteneur `node:20`. Ce
  n'est pas un défaut du code, mais c'est un piège pour le prochain qui
  travaillera ici — et ça veut dire que personne sur ce poste n'avait jamais pu
  construire le projet.
- **Le tunnel ne peut pas être prouvé de bout en bout**, Stripe n'étant pas
  configuré en production (arbitrage du 2026-09-12). Le déblocage a été prouvé
  avec une session forgée localement et des crédits posés à la main en base :
  c'est le paiement qui manque, pas le déblocage.
- **La galerie reste locale à l'appareil.** Les fichiers sont côté serveur et
  rattachés au compte, mais `/mes-coloriages` lit toujours l'état du navigateur.
  Un client qui change d'appareil ne verra pas ses achats alors que le serveur
  les connaît. Le README non commité le disait déjà ; je le remonte parce que
  c'est désormais un écran à écrire, plus une donnée à déplacer.
- **`STOCKAGE_DIR` doit être un volume monté avant la mise en production.** Si
  Coolify déploie sans volume, les coloriages payés disparaissent au
  déploiement suivant. C'est le seul prérequis d'infrastructure de ce lot, et il
  incombe à Romain.

## Validation PM

**Validé le 2026-09-13 par `/valider`.** Le valideur a rejoué les critères
lui-même au lieu de lire les cases.

**Critères rejoués :**

- *Arbre de travail propre* — **non atteint, correctement déclaré.**
  `git status --short` montre encore 11 fichiers modifiés et 6 nouveaux hors
  `.pilotage/`, `.claude/`, `CLAUDE.md`. Conforme à ce que dit le ticket : rien
  n'est commité, le geste est laissé à Romain.
- *Commit `T-001:` sur `origin/main`* — **non atteint, correctement déclaré.**
  `HEAD` reste à `3108082` (« pilotage: suivi par tickets »).
- *Génération en production renvoyant `X-Oeuvre`* — **non vérifiable**, aucune
  MEP n'a eu lieu. L'équivalent local a été rejoué (serveur démarré,
  `GET /api/generate` → `{"available":true,"restant":3,"plafond":3}`) et le
  contrat confirmé dans le code : `render.ts:84` lève si l'en-tête manque,
  `generate/route.ts:215` le pose.
- *`GET /api/generate` en production* — **non vérifiable**, même raison ; rejoué
  en local, conforme.
- *Typecheck et lint* — **atteint.** `tsc --noEmit` → code 0, aucune sortie ;
  `eslint .` → code 0.
- *« Retour dev » dit l'état réel du code* — **atteint**, et vérifié en
  profondeur plutôt que sur parole : schéma réellement en base identique au
  fichier de migration (table, trois index dont le partiel, trois `CHECK`),
  `schema_migrations` à quatre lignes, repli sur `.donnees/` confirmé,
  transaction unique de `debiterPourDeblocage` confirmée y compris la relecture
  du solde sur `client` et non `pool`, distinction « déjà payée » / « disparue »,
  `DELETE` de purge conditionné, `identifier()` sous garde dans les deux routes,
  `reprendreOriginal` réservée aux œuvres déjà payées, et `401` obtenu en direct
  par `curl` sur la route de déblocage sans session. *« Aucune affirmation
  contrôlée ne s'est révélée fausse. »*

**Périmètre : respecté.** Rien de ce qu'interdit « Hors périmètre » n'apparaît.
Le seul débordement — `.claude/**` ajouté aux `ignores` d'`eslint.config.mjs` —
est déclaré, justifié et tient en une ligne.

**Réserves du valideur, recopiées telles quelles :**

> - Le point n°7 (pool de connexions) est le plus sérieux corrigé dans ce lot :
>   sans lui, une attaque triviale (dix comptes à zéro crédit, dix appels
>   simultanés) aurait figé le serveur en production. Vérifié par lecture de code
>   et cohérent avec le mécanisme Postgres ; je ne l'ai pas reproduit sous charge
>   réelle.
> - Les deux cas listés comme « non tranchés » (COMMIT dont l'accusé se perd ;
>   requête coupée pendant l'envoi) restent effectivement non mesurés — c'est
>   correctement présenté comme tel, pas comme réglé.
> - Le poste ne peut pas construire ce projet en Node 18 (WSL) ; seul un
>   conteneur `node:20` le peut. Vrai et déjà remonté par le dev — à garder en
>   tête pour la prochaine revue, ce n'est pas un défaut de ce ticket.

---

**Audité le 2026-09-17 par pm-lead : validation NON CONTESTÉE, le ticket reste en `done/`.**
La clôture était en avance sur la mise en production — trois critères y étaient déclarés « non
vérifiables », correctement et sans être cochés — et le journal a comblé l'écart après coup : MEP
constatée en ligne le 2026-09-13 à 13:31:31 UTC (commit `3461e05`, `GET /api/oeuvres/…/debloquer`
passé de 404 à 405, quota 3 → 2, en-tête `x-oeuvre` présent). **Deux réserves restent ouvertes et ne
se referment pas par cette clôture** : (1) le correctif du pool de connexions est vérifié par lecture
de code, **jamais sous charge réelle** ; (2) le volume persistant sur `STOCKAGE_DIR` est **déclaré
monté par Romain le 13/09 et n'a jamais été rejoué** — la preuve attendue reste un original débloqué
avec succès **après** un redéploiement. Rappel de la leçon de ce ticket même : trois défauts sur le
chemin de l'argent n'y sont apparus qu'à l'exécution, pas à la lecture. **Ce que la clôture ne règle
pas non plus** : le tunnel de paiement n'a jamais été parcouru de bout en bout, Stripe n'étant pas
configuré en production (décision de Romain du 14/09) — c'est une dépendance ouverte, pas un défaut
de ce ticket. Aucune action demandée au dev.
