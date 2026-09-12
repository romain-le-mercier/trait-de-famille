# Roadmap — trait-de-famille.fr

Écrit par le PM (`pm-lead`) à chaque revue. Le dev le lit, ne l'édite jamais.
Objectif business : **Packs de crédits Stripe ; carte cadeau et livre PDF en phase 3**

## Contexte

Conversion de photos en coloriages (aperçu gratuit filigrané, connexion Google, packs 2,99 / 6,99 / 14,99 €, PDF A4 331 ppp). 14 jours d'historique GSC, 24 pages indexées sur 76, zéro clic, Umami en profil robot. Tout le plan est calé sur Noël : offre en ligne au 1er novembre, gel des déploiements mi-décembre. Le pilotage est produit avant d'être SEO : aucune vente n'est aujourd'hui possible de façon prouvée, ni visible si elle avait lieu.

Baseline posée au branchement (2026-09-12) depuis les exports Search Console : voir `KPIS.md`.

## État du produit (revue du 2026-09-12)

- Dernier commit sur `origin/main` : 2026-08-28 (22 commits du 06/08 au 28/08). Rien de versionné depuis 15 jours.
- **Travail hors dépôt** dans l'arbre de travail : paywall côté serveur (`migrations/004_oeuvres.sql`, `src/lib/server/{oeuvres,stockage,visiteur,filigrane}.ts`, `src/app/api/oeuvres/`, ~250 lignes modifiées sur 8 fichiers). Le README (lui aussi non commité) le décrit comme fait. **Romain, interrogé le 2026-09-12 : « je pense que oui, je n'ai pas testé. » Son état réel est donc inconnu — ni le pilotage ni lui ne peuvent dire si ce code fonctionne.** Tant qu'il n'est pas livré, la production sert le fichier propre dans le navigateur **avant** paiement : ce qu'on vend est déjà donné.
- Aucune vue des ventes : `purchases` n'est lue que par `/api/me` pour le compte connecté. Ni le PM ni Romain ne peuvent constater un achat sans ouvrir Stripe.
- **Stripe : répondu le 2026-09-12 — codé, mais pas configuré en production.** Ni clés live, ni webhook déclaré. Ce n'est donc pas une inconnue, c'est un fait : **aucune vente n'est possible aujourd'hui, quel que soit l'état du code.** Le reste de la configuration de production (`GOOGLE_CLIENT_ID`, `ADMIN_EMAILS`, `STOCKAGE_DIR` monté) demeure invisible depuis le pilotage et non vérifié.
- CGV et confidentialité : champs `[à compléter]` signalés par le README (non vérifié en ligne).
- Bibliothèque : 58 coloriages publiés les 26-28/08 sur 2 thèmes (Animaux, Dinosaures), 67 sujets déclarés. Aucun thème ni sujet Noël. Le seul guide proche est `/guides/cadeau-grands-parents`.

## Horizons

### H0 — Offre payante en ligne et prouvée au 1er novembre (jusqu'au 2026-11-01)
- Pourquoi : c'est la seule date qui compte ; sans vente possible, prouvée et visible, la saison de Noël ne se pilote pas.
- Fait quand : (1) paywall serveur livré sur `origin/main` et en production, MEP datée au journal ; (2) un achat de bout en bout constaté (Stripe live, compte crédité, PDF livré), consigné au journal avec la date ; (3) `/admin/ventes` en production et premier relevé transcrit par Romain dans `retours-romain.md` ; (4) CGV / confidentialité sans `[à compléter]` ; (5) cible retenue pour le KPI nord.

> **Dépendance datée, hors de portée du dev — arbitrage du 2026-09-12.**
> Romain : « Stripe est codé mais **pas configuré en prod**. Je le ferai quand j'aurai un peu de
> traction. » Conséquence directe et non négociable par un ticket : **l'offre ne peut pas être en
> ligne au 1er novembre sans que Romain pose les clés live et déclare le webhook
> `/api/stripe/webhook`.** Aucun développement ne lève ce point ; c'est lui qui le détient.
> Il y a de plus une **boucle** à dire telle quelle : il attend « un peu de traction » pour
> configurer Stripe, mais la traction se mesure en ventes, et aucune vente n'est possible sans
> Stripe. Le site fait 0 clic sur 28 jours ; le signal qu'il attend ne peut pas arriver.
> **Date au plus tard pour que H0 tienne : 2026-10-25**, une semaine avant le 1er novembre, pour
> laisser le temps de l'achat de preuve. Passé cette date sans configuration, H0 est manqué et la
> saison de Noël se pilote sans offre payante — à acter explicitement, pas à constater en décembre.

- Chantiers :
  - **Livrer le paywall serveur resté hors dépôt** → T-001 (cette revue). État réel du code **non établi** : voir la décision du 2026-09-12.
  - **Rendre les ventes lisibles (`/admin/ventes`)** → ticket pressenti T-003 à la revue du 2026-09-19, une fois T-001 livré (il lit la table `oeuvres`).
  - **Prouver le tunnel par un achat réel de 2,99 €** → **accepté par Romain le 2026-09-12**. Dépend de la configuration Stripe live ci-dessus. Date de l'achat à écrire par Romain dans `retours-romain.md`.
  - **Solder les textes légaux** → dépend de Romain (contenu). Ticket dev seulement si le texte est fourni. **Contrainte ajoutée le 2026-09-12 : les prix sont TTC** (Romain assujetti à la TVA), donc les mentions de prix du site et les CGV doivent être cohérentes avec un affichage TTC.

### H1 — Pages Noël indexées avant le 15 novembre (jusqu'au 2026-11-15)
- Pourquoi : les 58 pages coloriage publiées fin août sont à 24 indexées sur 76 après 7-9 jours ; le délai d'indexation observé impose de publier le contenu Noël début octobre au plus tard, pas en novembre.
- Fait quand : thème `noel` avec ≥ 12 sujets publiés en production le 2026-10-05 au plus tard ; au relevé Coverage du 2026-11-15, ≥ 8 de ces URL indexées.
- Chantiers :
  - **Thème Noël dans la bibliothèque** → T-002 (cette revue). Les dessins sont générés et validés un par un en admin par Romain : son temps est le chemin critique.
  - Accroche « cadeau de Noël » sur l'accueil et l'aperçu : après T-001, pas avant (pas de promesse cadeau sur un paywall troué).

### H2 — Saison (2026-11-01 → 2026-12-15, gel ensuite)
- Aucun développement prévu hors correctifs. Revues hebdo sur `/admin/ventes` et le coût LiteLLM. Acquisition hors SEO (Pinterest sur les 67 coloriages gratuits, 0 €) : à décider à la revue du 2026-10-10 selon l'état de H0.

## Hypothèses à surveiller

- « 42 pages *discovered, not indexed* = âge du domaine, pas un défaut de code » (pm-seo, code des pages et sitemap relus). Se vérifie au relevé Coverage du 2026-09-30 : si les 42 n'ont pas bougé à un mois d'âge, le sujet devient la minceur des pages sujet (titre gabarit + deux phrases), pas le sitemap.
- « Un aperçu gratuit coûte ~0,04 € » (pm-finance, hypothèse non vérifiée). Si c'est juste, une vente solo finance ~67 aperçus, un pack 10 ~353 ; les plafonds (3/jour/IP, 30/jour/compte) bornent la casse à 12 €/jour pour 100 IP hostiles.

## Ne pas faire

Décisions écrites. Ne se discutent pas dans un ticket ; se contestent dans `_pilotage/retours-romain.md`.
- 2026-09-09 — Gel des déploiements à partir de mi-décembre.
- 2026-09-12 — Pas de nouvelles pages coloriage hors thème Noël avant d'avoir mesuré le taux de clic des 58 existantes vers `/creer` (règle du README, reprise ici).
- 2026-09-12 — Pas de publicité payante avant que `/admin/ventes` existe : on n'achète pas un trafic qu'on ne peut pas lire.

## Décisions arbitrées le 2026-09-12 (Romain)

Réponses reportées depuis `_pilotage/arbitrages.md`. Elles sortent des « Arbitrages attendus ».

- 2026-09-12 (Romain) — **Stripe n'est pas configuré en production** : « codé mais pas configuré,
  je le ferai quand j'aurai un peu de traction. » Conséquence : **dépendance datée sur Romain**, pas
  un ticket dev. Sans clés live et webhook déclaré avant le **2026-10-25**, l'offre ne peut pas être
  en ligne au 1er novembre et H0 est manqué. Détail et boucle logique en H0 ci-dessus.
- 2026-09-12 (Romain) — **Le paywall serveur non commité n'est pas vérifié** : « je pense que oui,
  je n'ai pas testé. » Conséquence : ce n'est **pas** un feu vert à livrer tel quel. T-001 commence
  désormais par **établir l'état réel de ce code** avant toute livraison, et son « Retour dev » doit
  dire ce qui manquait. Ticket modifié, pas réécrit.
- 2026-09-12 (Romain) — **Achat réel de 2,99 € accepté** pour prouver le tunnel (« sans souci »).
  Conséquence : le critère (2) de H0 est atteignable dès que Stripe est en live ; la date de l'achat
  est à écrire par Romain dans `retours-romain.md`.
- 2026-09-12 (Romain) — **Assujetti à la TVA : les prix affichés sont TTC.** Conséquence : toutes les
  mentions de prix du site (2,99 / 6,99 / 14,99 €) et les CGV doivent être cohérentes avec un
  affichage TTC, et la facturation Stripe doit l'être aussi. À vérifier avant toute mise en vente ;
  pas de ticket dev tant que le texte légal n'est pas fourni par Romain.
- 2026-09-12 (Romain) — **Coût LiteLLM nul aujourd'hui** : « y'a personne donc pas d'appel, ce sera
  un problème pour plus tard. » Conséquence : le coût variable de ce site est **0 €**, cohérent avec
  0 clic sur 28 jours ; `finance/couts.csv` reste sans ligne d'appel modèle. L'hypothèse
  pm-finance « ~0,04 €/appel » reste **non vérifiée** et le restera tant qu'il n'y a pas de trafic —
  donc le coût d'un aperçu gratuit offert à un visiteur hostile n'est toujours pas borné par une
  mesure, seulement par les quotas (3/jour/IP, 30/jour/compte).

## Arbitrages attendus de Romain

- 2026-09-12 — Cible retenue pour le KPI nord : 10 achats entre le 01/11 et le 15/12 (proposée), ou quel chiffre ? **Sans réponse au 2026-09-12 : la trajectoire de ce site ne se juge pas.**
- 2026-09-12 — Cible retenue pour « Pages indexées » au 15/11 : 60 / 90 (proposée), ou quel chiffre ? **Sans réponse au 2026-09-12.**
- 2026-09-12 — **Quand poses-tu les clés Stripe live et le webhook en production ?** Tu dis attendre « un peu de traction » : aucune traction n'est mesurable sans vente, et aucune vente n'est possible sans cette configuration. Confirmes-tu la date butoir du **2026-10-25**, ou acte-t-on dès maintenant que la saison de Noël se fera **sans offre payante** — 25/10 / sans offre ?

## Journal des revues

### 2026-09-12 (soir) — report des arbitrages de Romain

- **H0 est désormais suspendu à Romain, pas au dev** : Stripe est codé mais **pas configuré en
  production**, et il attend « un peu de traction » — laquelle suppose des ventes, impossibles sans
  Stripe. Boucle écrite telle quelle, date butoir proposée au **25/10** ou renoncement acté.
- **Le paywall n'est pas validé** : « je pense que oui, je n'ai pas testé ». T-001 est modifié — il
  commence par établir l'état réel du code non commité, il ne le livre plus sur parole.
- Achat de preuve à 2,99 € accepté ; **prix TTC confirmés**, donc mentions de prix et CGV à mettre
  en cohérence ; coût LiteLLM nul faute d'appels (0 clic / 28 j).
- **Les deux cibles restent sans réponse** (10 achats 01/11–15/12, 60/90 pages indexées) : aucune
  trajectoire n'est jugée, ni aujourd'hui ni le 19/09 si la colonne reste vide.
- Aucun ticket créé : rien d'autre n'a été ordonné, et ce qui manque relève de Romain ou de textes
  qu'il n'a pas fournis.

### 2026-09-12 — première revue
- Statut : **données insuffisantes (cible non définie)** ; trajectoire H0 non jugeable mais **à risque** : rien de livré depuis le 28/08, paywall hors dépôt, aucune vente visible.
- Chiffre qui compte : 0 vente connue, 0 clic 28 j (Performance du 2026-09-09), 24 / 76 indexées (Coverage du 2026-09-12), 250 lignes de paywall non commitées.
- Tickets : aucun en review. Créés : T-001 (livrer le paywall serveur), T-002 (thème Noël, 12 sujets, MEP ≤ 05/10). Pressenti T-003 (`/admin/ventes`) le 19/09.
- Retours de Romain transcrits : aucun concernant ce projet.
- Non vérifié : configuration de production (Stripe, Google, admin, volume), textes légaux en ligne, coût réel par appel modèle, prix concurrents, les 7 URL « crawled, not indexed ».

### 2026-09-12 — branchement
- Statut : **données insuffisantes (cible non définie)**
- Chiffre qui compte : clics 28 j 0, clics 7 j 0 vs 0 (export Performance du 2026-09-09) ; pages indexées 24 / 76 connues (Coverage du 2026-09-12).
- Tickets : aucun. La première `/revue` en écrira au plus deux.
- Retours de Romain transcrits : aucun.
- Non vérifié : dates de mise en production passées (aucune dans le journal) ; moins de 30 jours de série : aucune tendance ne se juge là-dessus.
