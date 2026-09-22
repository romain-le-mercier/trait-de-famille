# Roadmap — trait-de-famille.fr

Écrit par le PM (`pm-lead`) à chaque revue. Le dev le lit, ne l'édite jamais.
Objectif business : **Packs de crédits Stripe ; carte cadeau et livre PDF en phase 3**

## Contexte

Conversion de photos en coloriages (aperçu gratuit filigrané, connexion Google, packs 2,99 / 6,99 / 14,99 €, PDF A4 331 ppp). 14 jours d'historique GSC, 24 pages indexées sur 76, zéro clic, Umami en profil robot. Tout le plan était calé sur Noël : ~~offre en ligne au 1er novembre~~ (**jalon retiré le 2026-09-14 par décision de Romain**, voir « Décisions » — la saison se fait sans offre payante), gel des déploiements mi-décembre inchangé. **Ce qui reste du plan de Noël est donc du trafic, pas de la vente** : le thème Noël (T-002) sert l'indexation et la bibliothèque gratuite. Le pilotage est produit avant d'être SEO : aucune vente n'est aujourd'hui possible de façon prouvée, ni visible si elle avait lieu.

Baseline posée au branchement (2026-09-12) depuis les exports Search Console : voir `KPIS.md`.

## État du produit (revue du 2026-09-12)

- Dernier commit sur `origin/main` : 2026-08-28 (22 commits du 06/08 au 28/08). Rien de versionné depuis 15 jours.
- **Travail hors dépôt** dans l'arbre de travail : paywall côté serveur (`migrations/004_oeuvres.sql`, `src/lib/server/{oeuvres,stockage,visiteur,filigrane}.ts`, `src/app/api/oeuvres/`, ~250 lignes modifiées sur 8 fichiers). Le README (lui aussi non commité) le décrit comme fait. **Romain, interrogé le 2026-09-12 : « je pense que oui, je n'ai pas testé. » Son état réel est donc inconnu — ni le pilotage ni lui ne peuvent dire si ce code fonctionne.** Tant qu'il n'est pas livré, la production sert le fichier propre dans le navigateur **avant** paiement : ce qu'on vend est déjà donné.
- Aucune vue des ventes : `purchases` n'est lue que par `/api/me` pour le compte connecté. Ni le PM ni Romain ne peuvent constater un achat sans ouvrir Stripe.
- **Stripe : répondu le 2026-09-12 — codé, mais pas configuré en production.** Ni clés live, ni webhook déclaré. Ce n'est donc pas une inconnue, c'est un fait : **aucune vente n'est possible aujourd'hui, quel que soit l'état du code.** Le reste de la configuration de production (`GOOGLE_CLIENT_ID`, `ADMIN_EMAILS`, `STOCKAGE_DIR` monté) demeure invisible depuis le pilotage et non vérifié.
- CGV et confidentialité : champs `[à compléter]` signalés par le README (non vérifié en ligne).
- Bibliothèque : 58 coloriages publiés les 26-28/08 sur 2 thèmes (Animaux, Dinosaures). Aucun thème ni sujet Noël. Le seul guide proche est `/guides/cadeau-grands-parents`.
- **Correction du 2026-09-17** : `themes.ts` déclare **63 sujets**, et non 67 comme écrit ici depuis le branchement. Pour 58 publiés, cela ferait **5 dessins générés et jamais publiés** — déduction de code, la base n'étant pas lisible depuis le pilotage. Si elle est juste, **la publication un par un par Romain est déjà le goulot**, avant même que T-002 ajoute 12 sujets.
- **Corpus servi, arrêté le 2026-09-17** : le sitemap sert **73 URL** (vérifiées en ligne le 12/09, avant le blocage Cloudflare), reconstituées terme à terme par `src/app/sitemap.ts`. `76 connues = 73 sitemap + 2 noindex + 1 redirect` ; `73 sitemap = 43 indexées + 29 Discovered + 1 Crawled`. **Le dénominateur qui fait foi est 73, pas 76, pas 90.**

## Horizons

### H0 — Paywall en production ; offre payante repoussée sans date (statut au 2026-09-14)
- Pourquoi : le paywall serveur est en production et fonctionne ; ce qui reste à H0 ne dépend plus d'une
  date de saison mais de ce que Romain a explicitement choisi de reporter (voir décision ci-dessous).
- **Le jalon « offre en ligne au 1er novembre » n'existe plus, et le butoir du 25/10 tombe avec lui**
  — décision de Romain du 2026-09-14, voir « Décisions » ci-dessous. **La saison de Noël se fera sans
  offre payante : c'est un choix assumé, pas un retard.**
- Fait quand (H0 restreint à ce qui ne dépend pas de Stripe) : **(1) FAIT — paywall serveur livré sur
  `origin/main` et en production** (commit `3461e05`, MEP constatée en ligne le 2026-09-13 à
  13:31:31 UTC, `GET /api/oeuvres/…/debloquer` passé de 404 à 405) ; (2) achat de bout en bout,
  `/admin/ventes` et cible du KPI nord : **suspendus sans date**, dépendance Romain (voir « Décisions »
  et `KPIS.md`) ; (3) CGV / confidentialité : **suspendu, basse priorité assumée**, aucun ticket dev
  n'attend ce texte (voir « Décisions »).

- Chantiers :
  - **Paywall serveur : livré, revu et en production.** T-001 clos (`done/`), validé le 2026-09-13. Trois défauts sur le chemin de l'argent trouvés et corrigés avant MEP : double débit sur déblocages concurrents, livraison gratuite introduite par le premier correctif, pool de connexions qui se serait figé sous dix comptes à zéro crédit simultanés. Le tunnel de paiement n'est toujours pas prouvé de bout en bout, et ne le sera pas cette saison — Stripe reste non configuré, sans date (décision de Romain).
  - **Régression trouvée en production, non prévue : le filigrane ne se dessine plus.** 10,68 % de pixels filigranés en local, 0,00 % en ligne — l'aperçu servi est un trait propre, la dissuasion a disparu (l'original reste protégé). Cause inconnue (texte SVG qui ne rend pas sur ce serveur) → T-003 (cette revue), diagnostic seul. Un correctif de conséquence (bandes diagonales, sans texte) est prêt hors dépôt, non commité, en attente d'un feu vert de Romain (voir Arbitrages). Ce chantier reste valable indépendamment de Stripe : un site sans paywall prouvé garde intérêt à protéger l'original.
    **Mise à jour du 2026-09-17 — la réparation ne clôt pas le diagnostic.** Le correctif à bandes est **déployé** (T-000, commit `e31c103`, merge `dadc448` du 13/09 à 21:58) et **vérifié à l'œil par Romain sur le site**. Deux choses restent vraies et doivent être écrites comme telles : (1) **la couverture n'a JAMAIS été mesurée en production** — les 30,19 % sont une mesure locale, le poste ne peut pas la rejouer (403 `Cf-Mitigated: challenge`), **le critère est déclaré non prouvé, il n'est pas coché** ; (2) **la cause racine du non-rendu du texte SVG reste inconnue**, seule sa conséquence est bouchée. **T-003 n'est donc PAS clos par la réparation** — c'est le diagnostic, et il garde sa raison d'être : sans lui, le prochain qui ajoutera du texte à une image refera le même défaut sans le savoir. **Mais sa priorité passe derrière T-002** (verdict du 2026-09-17) : il ne sert aucune cible chiffrée, et la dissuasion qu'il protège n'a **rien à dissuader tant qu'il n'y a rien à acheter**. Ordre arrêté : **T-002 puis T-003**.
  - **Rendre les ventes lisibles (`/admin/ventes`)** → sans urgence : plus de ticket pressenti tant que Stripe n'est pas configuré, puisqu'il n'y aura aucune vente à lire cette saison.
  - **Prouver le tunnel par un achat réel de 2,99 €** → toujours accepté par Romain sur le principe (2026-09-12), mais **suspendu sans date** : dépend de la configuration Stripe, elle-même repoussée à « quand on aura de la visite » (décision du 2026-09-14, sans date).
  - **Solder les textes légaux** → **basse priorité assumée** (décision du 2026-09-14 : « on s'en passe pour le moment, pas prioritaire du tout »). Les `[à compléter]` des CGV et de la confidentialité restent tels quels. Aucun ticket dev ne les attend. La contrainte TTC posée le 2026-09-12 reste vraie si et quand ce texte est un jour écrit.

### H1 — Pages Noël indexées avant le 15 novembre (jusqu'au 2026-11-15)
- Pourquoi : les 58 pages coloriage publiées fin août sont à **43 indexées sur 73 au sitemap** (relevé du 14/09) après environ trois semaines ; le délai d'indexation observé impose de publier le contenu Noël début octobre au plus tard, pas en novembre.
- **Délai d'indexation mesuré sur ce site, et c'est la seule donnée qui doit calibrer le butoir** (relevé du 2026-09-14) : pages publiées les 26-28/08, première vague d'indexation **entre le 05 et le 09/09**, soit **8 à 14 jours** — et **30 des 73 URL du sitemap ne sont toujours pas indexées à J+18**. Autrement dit : une page publiée met **deux semaines à entrer, et une part notable n'entre pas du tout à trois semaines.**
- Fait quand : thème `noel` avec ≥ 12 sujets, **code en production le 2026-10-05 au plus tard** ; **dessins publiés par Romain le 2026-10-15 au plus tard** (butoir ajouté le 2026-09-17 : au-delà, 8 à 14 jours d'indexation reportent l'entrée après le 29/10 et la page manque le début des recherches de Noël) ; au relevé Coverage du 2026-11-15, ≥ 8 de ces URL indexées.
- Chantiers :
  - **Thème Noël dans la bibliothèque** → T-002, écrit le 12/09, **toujours pas pris cinq jours plus tard**. **Verdict tranché le 2026-09-17 : on le prend maintenant, c'est le seul chantier du site qui serve encore une cible jugeable.** Sa valeur ne dépend pas de Stripe — il sert l'indexation (seul KPI encore jugeable) et la bibliothèque gratuite, pas la vente. Butoir : code au 05/10, publication au 15/10. **Le temps de Romain est le chemin critique** : le dev livre le code et génère les brouillons, mais **c'est Romain qui publie un par un**, et la déduction des 5 brouillons déjà en attente suggère que ce goulot est réel et non théorique.
  - Accroche « cadeau de Noël » sur l'accueil et l'aperçu : après T-001, pas avant (pas de promesse cadeau sur un paywall troué).

### H2 — Saison (2026-11-01 → 2026-12-15, gel ensuite)
- Aucun développement prévu hors correctifs. Revues hebdo sur `/admin/ventes` et le coût LiteLLM. Acquisition hors SEO (Pinterest sur les 67 coloriages gratuits, 0 €) : à décider à la revue du 2026-10-10 selon l'état de H0.

## Hypothèses à surveiller

- ~~« 42 pages *discovered, not indexed* = âge du domaine, pas un défaut de code »~~ — **CONFIRMÉE EN PARTIE le 2026-09-17, et c'est le fait majeur de cette revue.** 13 des 42 sont passées indexées **sans qu'on touche à rien** (corpus constant à 76 connues, aucune page publiée depuis le 28/08, saut antérieur à toute MEP), et 6 des 7 « crawled, not indexed » avec elles. **Ce n'était pas un défaut de code : c'était l'âge du domaine**, et l'hypothèse tenait. **Ce qu'elle ne dit pas** : les 29 restantes. Le mouvement s'est arrêté net — série plate à 43 du 09 au 14/09. Lecture retenue : **une file qui se traite par vagues espacées**, pas une pente, pas un fond mort. **Ce qui la tranche** : le relevé Coverage du **2026-09-30**, échéance inchangée. Encore 29 à un mois d'âge des pages ⇒ le sujet redevient la minceur des pages sujet (titre gabarit + deux phrases), et la cible 60 passe décrochée.
- **Nouvelle, 2026-09-17** : « la position 33,3 est un artefact d'élargissement de l'export (26 → 58 requêtes), pas une dégradation ». **Non prouvée** : le digest ne rend pas la position par requête, donc la décomposition est impossible. Se vérifiera au premier export **de 30 jours ou plus** à nombre de requêtes stable. D'ici là, **aucune conclusion de position n'est écrite ailleurs que comme hypothèse.**
- « Un aperçu gratuit coûte ~0,04 € » (pm-finance, hypothèse non vérifiée). Si c'est juste, une vente solo finance ~67 aperçus, un pack 10 ~353 ; les plafonds (3/jour/IP, 30/jour/compte) bornent la casse à 12 €/jour pour 100 IP hostiles.

## Ne pas faire

Décisions écrites. Ne se discutent pas dans un ticket ; se contestent dans `_pilotage/retours-romain.md`.
- 2026-09-09 — Gel des déploiements à partir de mi-décembre.
- 2026-09-12 — Pas de nouvelles pages coloriage hors thème Noël avant d'avoir mesuré le taux de clic des 58 existantes vers `/creer` (règle du README, reprise ici).
- 2026-09-12 — Pas de publicité payante avant que `/admin/ventes` existe : on n'achète pas un trafic qu'on ne peut pas lire.

## Décisions arbitrées le 2026-09-12 (Romain)

Réponses reportées depuis `_pilotage/arbitrages.md`. Elles sortent des « Arbitrages attendus ».

- 2026-09-13 (Romain) — **Le correctif du filigrane (T-000) est en production.** Commit `e31c103`, merge
  `dadc448` (PR #2), poussé à 21:58. Romain a donné son accord **dans la session du projet**, après avoir
  refusé de le faire sur un feu vert que je relayais depuis le pilotage — c'est la règle, et elle a bien
  fonctionné : pousser sur `main` déclenche le déploiement, ce geste lui appartient.
  **Reste dû : la mesure.** Le filigrane est constaté à l'œil sur le site, mais sa couverture n'a jamais été
  chiffrée en production (30,19 % attendus ; si 41 %, le texte rend aussi en ligne et T-003 change de nature).
  Bloqué par Cloudflare, voir l'arbitrage ci-dessous.
- 2026-09-13 (Romain, déclaré — **non vérifié**) — **Le volume persistant sur `STOCKAGE_DIR` serait monté**
  côté hébergeur : « le volume persistant est bien configuré ». Inscrit comme déclaration, pas comme fait :
  personne ne l'a rejoué. Les deux preuves à portée sont un `ls` sur le chemin hôte, ou un original débloqué
  avec succès **après** un redéploiement. T-001 a montré ce que vaut un « ça doit marcher » non rejoué — trois
  défauts d'argent que la lecture de code n'avait pas vus. **À vérifier au prochain déploiement**, pas avant.
- 2026-09-12 (Romain) — **Stripe n'est pas configuré en production** : « codé mais pas configuré,
  je le ferai quand j'aurai un peu de traction. » Conséquence : **dépendance datée sur Romain**, pas
  un ticket dev. Sans clés live et webhook déclaré avant le **2026-10-25**, l'offre ne peut pas être
  en ligne au 1er novembre et H0 est manqué. Détail et boucle logique en H0 ci-dessus.
  **Périmée depuis le 2026-09-14** : le butoir du 25/10 et le jalon du 1er novembre sont retirés,
  remplacés par la décision datée du 2026-09-14 (voir « Décisions arbitrées le 2026-09-14 »
  ci-dessus) — Stripe est repoussé sans date, la boucle qu'annonçait ce point est tranchée, pas levée.
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

## Décisions arbitrées le 2026-09-14 (Romain)

- 2026-09-14 (Romain, verbatim) — **« Je m'occuperai de Stripe quand on aura de la visite, pour
  l'instant une page où on ne peut pas commander ça me va bien. »** Conséquence, non négociable par un
  ticket : le jalon « offre en ligne au 1er novembre » et le butoir du 25/10 (arbitrage du 2026-09-12,
  ci-dessus) **n'existent plus** — Romain répond à la boucle qu'ils décrivaient en choisissant de ne pas
  la lever cette saison. **La saison de Noël se fera sans offre payante : c'est un choix assumé, pas un
  retard.** Le KPI nord (10 achats, 01/11–15/12) devient inatteignable par construction ; il est
  **suspendu, pas supprimé** — voir `KPIS.md`. Aucune date de reprise n'est fixée.
- 2026-09-14 (Romain, verbatim) — **« On s'en passe pour le moment, pas prioritaire du tout »** au sujet
  des textes légaux. Conséquence : les `[à compléter]` des CGV et de la confidentialité restent tels
  quels, **basse priorité assumée**, et aucun ticket dev n'attend ce texte.

## Arbitrages attendus de Romain

### ✅ 2026-09-22 — boucle de redirection : cause identifiée par Romain, correction en cours

**Réponse de Romain le 2026-09-22, le jour même du constat : « un bug de config Coolify, en cours de
fix ».** La question du domaine canonique posée ci-dessous **est donc close avant d'avoir été
instruite** — la cause n'était pas un désaccord entre deux couches à arbitrer, mais une configuration
Coolify erronée. Le constat ci-dessous est conservé parce qu'il documente l'effet, qui reste à vérifier
une fois le correctif passé.

**Ce qui reste à faire, et qui n'est pas automatique :**

- **Reconstater en ligne que la boucle est fermée** avant de juger quoi que ce soit sur ce site — un
  `curl -sIL` sur l'accueil et sur `/sitemap.xml` doit se terminer en 200, sans aller-retour.
- **Le troisième critère de fin de T-002 redevient vérifiable** à ce moment-là, et pas avant. Le dev a
  pour consigne de le déclarer non vérifiable jusque-là ; il pourra le rejouer une fois le fix passé.
- **Le butoir du 05/10 recommence à avoir du sens** : les 8 à 14 jours d'indexation ne courent qu'à
  partir d'un domaine qui répond.
- **Les chiffres d'indexation antérieurs sont à relire avec prudence** : 43 pages indexées au relevé du
  14/09 pour un domaine qui bouclait le 22/09 — on ignore depuis quand la boucle durait, donc on ignore
  ce que ces 43 décrivent. **Ne pas construire de trajectoire dessus** tant qu'un relevé postérieur au
  correctif n'existe pas.

### 🔴 Contrainte de publication sur T-002 — pour Romain, avant de publier les dessins de Noël

**La description du thème Noël nomme HUIT sujets.** Tant qu'un seul d'entre eux n'est pas publié, **la
page affirme quelque chose de faux** — et définitivement si l'un est rejeté. C'est la même famille de
défaut que le marqueur `VERIRL` resté quatre mois en production sur plan2table ou la page qui promettait
un export inexistant : une page publique qui ment. Ça se traite avant, pas après.

**Les huit à publier obligatoirement**, relevés par le dev dans la description (chiffre corrigé de six à
huit par lui-même) :

`sapin-de-noel` · `pere-noel` · `renne-de-noel` · `bonhomme-de-neige` · `buche-de-noel` ·
`chaussette-de-noel` · `bonnet-de-noel` · `couronne-de-noel`

*(Les deux derniers viennent de la seconde phrase — « Du bonnet pour les tout-petits à la couronne pour
les grands » — et sont faciles à manquer en relisant vite.)*

**Les quatre libres**, que Romain peut rejeter sans conséquence sur le texte : `cadeau`, `boule`,
`traineau`, `lutin`.

**Deux issues, pas de demi-mesure** : ou bien les huit sont publiés, ou bien la description change. Le
dev n'a **pas** touché à la description, et c'est la bonne décision — elle est juste pour le cas
nominal, la rendre vague par précaution l'affaiblirait pour rien. **C'est une contrainte de
publication, pas un défaut de code.**

### Correction à reporter dans T-002 par le dev — 2026-09-22

**Le ticket T-002 se trompe sur un chiffre, et la déduction qu'il en tire tombe avec.** Relevé par le
dev pendant la prise ; le PM le confirme et l'inscrit ici **parce qu'un ticket en `doing/` appartient au
dev et que le PM n'y écrit pas** — c'est au dev de reporter cette ligne dans son ticket, comme le
prévoit la charte.

- **Le ticket annonce 63 sujets dans `themes.ts` avant le chantier. Il y en avait 58**
  (36 + 22), et 70 après l'ajout des 12 sujets de Noël.
- **Conséquence : la déduction du ticket sur « 5 brouillons en attente » n'a plus d'objet.** Elle
  reposait entièrement sur l'écart entre 63 et 58. Le code ne suggère aucun brouillon en attente, et
  rien n'est à aller chercher de ce côté.
- **Aucun critère de fin n'est affecté** : ils portent sur le thème `noel`, ses 12 sujets et leurs
  `intro` distinctes, pas sur le total du fichier. Le périmètre ne bouge pas.

---

### Le constat d'origine, conservé pour mémoire — 2026-09-22

**Constaté en ligne ce jour par pm-lead, sur la page d'accueil comme sur le sitemap :**

```
https://trait-de-famille.fr/      → 301 → https://www.trait-de-famille.fr/
https://www.trait-de-famille.fr/  → 307 → https://trait-de-famille.fr/   → 301 → … à l'infini
```

**Ni un visiteur ni Googlebot n'obtiennent quoi que ce soit.** C'est très probablement l'explication du
fait central de ce site — **il n'a jamais eu un seul clic** — et cela relativise tout ce que la ROADMAP
a écrit jusqu'ici sur son indexation : les 43 pages indexées au relevé du 14/09 décrivent un état
antérieur ou intermittent, pas la situation actuelle.

**Ce n'est pas réparable depuis le dépôt, et aucun ticket dev n'y changera rien.** Vérifié :
`next.config.ts` ne déclare aucune redirection, et il n'existe aucun middleware dans `src/`. Le **301**
vient de Cloudflare (apex → `www`), le **307** de la couche d'hébergement (`www` → apex). Les deux
couches se contredisent sur le domaine canonique, et **aucune des deux n'est dans le code**.

**Question du domaine canonique : le PM l'avait fermée trop vite, elle est ROUVERTE le 2026-09-22.**

Première lecture, erronée : « configuration Coolify erronée, corrigée — il n'y avait pas de décision à
prendre ». **C'est faux, et c'est le dev de T-002 qui l'a relevé.** La boucle était bien un défaut de
configuration, et elle est corrigée — mais **une seconde anomalie, de nature différente, subsiste et
demande bien un arbitrage.** Le PM avait confondu les deux.

**Vérifié en ligne par pm-lead le 2026-09-22, après le correctif de Romain :**

- La boucle est **fermée** : apex → 301 → `www` → **200**. Un seul saut. ✅
- **Mais le `sitemap.xml` déclare ses 73 URL sur l'APEX** (`https://trait-de-famille.fr/creer`,
  `/guides`…), alors que Cloudflare redirige l'apex vers `www`. **Chacune des 73 URL soumises à Google
  est donc une redirection**, jamais une page finale.
- **Et la balise `rel="canonical"` de l'accueil pointe elle aussi sur l'apex**
  (`href="https://trait-de-famille.fr"`), c'est-à-dire sur une URL qui renvoie un 301 — **alors que
  l'hôte réellement servi est `www`**. Le site déclare donc comme canonique une adresse qui n'est pas
  celle qu'il sert.

**C'est un vrai défaut SEO, sur un site qui n'a jamais eu un clic**, et il est antérieur à T-002 comme
à la boucle. Un sitemap entièrement composé de redirections et un canonique qui contredit l'hôte servi
sont deux signaux contradictoires envoyés à Google sur chaque page.

**➜ TRANCHÉ ET CORRIGÉ PAR ROMAIN LE 2026-09-22, le jour même. Le domaine canonique est l'APEX.**
Réponse littérale : « trait de famille dois rediriger vers l'apex, pas le www ». La règle Cloudflare a
été inversée dans la foulée.

**Vérifié en ligne par pm-lead après le correctif — les trois signaux sont désormais d'accord :**

| Contrôle | Résultat |
|---|---|
| `https://www.trait-de-famille.fr/` | **301** vers l'apex, puis **200**. Un seul saut |
| `https://trait-de-famille.fr/` | **200** directement |
| `https://trait-de-famille.fr/creer` (URL du sitemap) | **200** directement, plus de redirection |
| `https://trait-de-famille.fr/sitemap.xml` | **200** |
| `rel="canonical"` de l'accueil | `https://trait-de-famille.fr` — **conforme à l'hôte servi** |

**Les 73 URL du sitemap ne sont donc plus des redirections**, et le canonique ne contredit plus l'hôte.
Le défaut est fermé sans aucun changement de code : `NEXT_PUBLIC_SITE_URL` reste sur l'apex, c'était la
couche Cloudflare qui avait tort. **Aucun ticket à écrire.**

**Deux enseignements à garder, parce qu'ils ont coûté un aller-retour dans la même journée :**

1. **Le PM avait d'abord clos cette question à tort**, en confondant la boucle de redirection (défaut
   de configuration Coolify, corrigé le matin) avec le désaccord apex/`www` (question de politique,
   réelle et distincte). Une cause identifiée n'en épuise pas une seconde qui produit des symptômes
   voisins. **C'est le dev de T-002 qui l'a rattrapé** en refusant de considérer le sujet comme clos.
2. **Les relevés d'indexation antérieurs au 2026-09-22 restent à relire avec prudence** : entre la
   boucle et le sitemap intégralement redirigé, on ignore ce que Google a réellement pu explorer.
   Le premier relevé interprétable sera **postérieur au 22/09**. Ne pas construire de trajectoire sur
   les 43 pages indexées du 14/09.

**Pourquoi c'est la première chose à traiter sur ce site, avant même T-002** : T-002 a un butoir au
05/10 et sa valeur est réelle, mais publier un thème de Noël sur un domaine qui ne sert rien ne produit
aucune indexation. Le code de T-002 peut s'écrire en parallèle — il ne dépend pas du site en ligne — et
c'est ce que le dev a pour consigne de faire. Mais **le butoir du 05/10 ne vaut que si la boucle est
fermée avant**, sinon les 8 à 14 jours d'indexation ne commencent jamais à courir.

*(Conséquence déjà portée au dev : le troisième critère de fin de T-002 — `curl` sur le sitemap et les
pages publiées en 200 — est déclaré non vérifiable tant que la boucle dure, et ne se coche pas.)*

---

*(Les arbitrages du 2026-09-13 sont rendus. Le Stripe/25-10 du 2026-09-12 a été tranché le 2026-09-14 :
les quatre questions ci-dessous sont neuves et n'en rouvrent aucune — elles datent une décision déjà prise
et lèvent un dénominateur faux.)*

- **2026-09-17 — Date de non-retour de Stripe. Ta décision du 14/09 n'est pas rediscutée ; on la date.**
  Tu as écrit : « je m'occuperai de Stripe quand on aura de la visite ». Le problème n'est pas la décision,
  c'est qu'elle est **réactive dans un calendrier qui exige d'être en avance de phase** : quand la visite
  arrivera — au mieux fin octobre, si T-002 part maintenant — il sera **déjà trop tard pour configurer
  Stripe en réaction**. Il faut les clés live et le webhook, **un achat de preuve à 2,99 €** (que tu as
  accepté le 12/09), et **une marge pour un cycle de correction** : T-001 a produit **trois défauts sur le
  chemin de l'argent** qui n'apparaissaient qu'à l'exécution, et **le tunnel de paiement n'a jamais été
  parcouru de bout en bout**. Deux dates calculées :
  - **2026-10-25** — dernière date pour encaisser dès l'ouverture de la fenêtre (01/11 → 15/12). C'est,
    au jour près, le butoir retiré le 14/09 : il **se recalcule à l'identique** depuis des données neuves.
  - **2026-11-24** — dernière date tout court. Au-delà, il reste moins de trois semaines avant le gel de
    mi-décembre, dont une de marge de correction : **la saison 2026 est vendue à 0 € quoi qu'il arrive.**
    *(pm-market proposait le 08/12 ; écarté : cela ne laisse ni semaine de vente utile ni cycle de
    correction si le tunnel casse.)*
  **Question fermée : confirmes-tu que la saison 2026 se fait sans offre payante — ou inscris-tu
  le 2026-11-24 comme date à laquelle on te repose la question une dernière fois ? (A : saison sacrifiée,
  on n'en reparle plus avant 2027 / B : point de contrôle au 24/11.)**

- **2026-09-17 — Le dénominateur de la cible d'indexation est faux, le numérateur tient.**
  Tu as retenu **60 / 90 au 15/11**. Le **90 n'est relié à aucun corpus mesuré** : le sitemap sert **73 URL**
  (vérifiées en ligne le 12/09) et en servirait **86** si T-002 livrait ses 12 sujets. Aujourd'hui :
  **43 / 73**, soit 58,9 %. **Question fermée : remplaces-tu « 60 / 90 » par « 60 pages indexées en valeur
  absolue, sur les 73 URL du sitemap (86 après T-002) », à échéance inchangée du 2026-11-15 ? Oui / non.**
  *(Sans réponse, KPIS continue de suivre le numérateur 60 et de lire 43 / 73 — le « 90 » n'est plus cité.)*

- **2026-09-17 — Publication des dessins Noël : c'est ton temps, et c'est le chemin critique.**
  Le dev peut livrer le code et générer les brouillons, **mais c'est toi qui publies un par un**. Le code
  déclare déjà **63 sujets pour 58 publiés** : **5 dessins semblent attendre ta validation** (déduction,
  la base n'est pas lisible d'ici). Pour que les pages Noël soient indexées avant les recherches de début
  novembre, il faut **8 à 14 jours d'indexation** mesurés sur ce site. **Question fermée : t'engages-tu à
  publier les 12 dessins Noël avant le 2026-10-15 ? Oui / non.** *(Non ⇒ T-002 n'a plus d'objet cette
  saison et le dev ne doit pas le prendre : autant l'écrire maintenant que le découvrir en novembre.)*

- **2026-09-17 — Pinterest sur les coloriages gratuits (0 €).** La ROADMAP prévoyait d'en décider
  « à la revue du 10/10 selon l'état de H0 ». **La condition est déjà remplie** : le paywall est en
  production depuis le 13/09. Ce n'est **pas** de la publicité payante, donc l'interdit du 12/09 ne s'y
  applique pas ; et c'est le seul levier d'acquisition qui ne dépende ni de Stripe ni de Google.
  **Question fermée : ouvre-t-on le sujet Pinterest maintenant plutôt qu'au 10/10 ? Oui / non.**
  *(Oui ⇒ ce sera un chantier de la revue du 24/09, pas un ticket dev de celle-ci.)*

## Journal des revues

### 2026-09-17 — premier export frais : +19 pages indexées, et c'est une file dormante, pas une pente
- **Chiffre qui compte : 43 indexées / 73 au sitemap** (Coverage du 14/09, contre 24 dix jours plus tôt). Le +19 se décompose exactement — Crawled 7→1 (+6), Discovered 42→29 (+13) — **à corpus constant** (76 connues aux deux relevés, aucune page publiée depuis le 28/08) et **avant toute MEP** : Google a vidé un tiers d'une file dormante, le dispositif n'y est pour rien. **Série plate à 43 du 09 au 14/09 : un palier, pas une dynamique acquise.** Cible 60 au 15/11 : **à surveiller** (−17, 72 % du chemin), point de contrôle au 30/09 — encore 43 ⇒ décroché.
- **Dénominateur arrêté : 73, pas 76, pas 90.** `76 connues = 73 sitemap + 2 noindex + 1 redirect` et `73 = 43 + 29 + 1` : l'arithmétique se ferme deux fois. Le « 90 » de la cible n'est relié à aucun corpus mesuré (86 au mieux après T-002) ; les **2 noindex sont volontaires**, vérifié dans le code (six pages en `index:false`, aucune au sitemap).
- **Position 33,3 contre 18,9 : PAS une dégradation prouvée.** L'export passe de 14 j / 26 requêtes à 22 j / 58 requêtes — le nombre de requêtes double et recule mécaniquement la moyenne. Lecture d'élargissement **retenue mais non prouvée** (pas de position par requête dans le digest). Et **22 jours de série < 30 : aucune tendance ne se juge**, ni là ni ailleurs. **0 clic : aucun pourcentage de clics ne se commente.**
- **Stripe : la décision du 14/09 n'est pas rouverte, elle est datée.** « Quand on aura de la visite » est réactif dans un calendrier qui exige d'être en avance de phase. Dates calculées et posées en arbitrage : **25/10** pour tenir toute la fenêtre, **24/11** comme dernière date avant que la saison 2026 soit vendue à 0 € quoi qu'il arrive. **T-002 tranché : on le prend maintenant** (butoir code 05/10, publication par Romain 15/10) ; **T-003 reste ouvert et passe second** — la réparation du filigrane ne clôt pas le diagnostic, et sa couverture en production **n'a jamais été mesurée** (403 Cloudflare) : critère **déclaré non prouvé, pas coché**.
- **Aucun ticket écrit, volontairement** : les trois spécialistes concluent tous « aucun ticket », T-002 et T-003 couvrent déjà les deux seuls chantiers valables et dorment depuis cinq jours — 32 tickets en `todo/` au portefeuille dont 21 du 12/09 jamais pris. **Retours de Romain transcrits** : un seul concerne ce site (15/09, « déjà tranché avant le 15/09 » sur les cibles du 12/09) — rien de neuf. **Marqueur de `retours-romain.md` NON POSÉ : `pm-guard.js` refuse toute écriture dans ce fichier, blocage de dispositif signalé et non contourné.** **Non vérifié** : couverture du filigrane en production, `STOCKAGE_DIR` monté (déclaré par Romain, jamais rejoué), textes légaux en ligne, identité du « 1 redirect », les 5 brouillons déduits du code — tout ce qui passe par le réseau se heurte au 403 `Cf-Mitigated: challenge`, **et un 403 de défi n'est pas une panne**.

### 2026-09-14 — Stripe repoussé sans date, saison de Noël sans offre payante
- **Décision de Romain, verbatim** : « je m'occuperai de Stripe quand on aura de la visite, pour l'instant une page où on ne peut pas commander ça me va bien. » Le jalon « offre en ligne au 1er novembre » et le butoir du 25/10 tombent, remplacés par cette décision datée, sans échéance de reprise.
- **La saison de Noël se fera sans offre payante** : choix assumé, pas un retard à constater plus tard.
- **KPI nord (10 achats 01/11–15/12) suspendu, pas supprimé** : inatteignable par construction tant que Stripe n'est pas configuré. Voir `KPIS.md`.
- **Textes légaux en basse priorité assumée** (« pas prioritaire du tout ») : `[à compléter]` reste en l'état, aucun ticket dev ne les attend.
- Aucun ticket créé ni modifié cette fois : correction d'horizon et de cible, pas de nouveau travail dev.

### 2026-09-13 — paywall en production, régression filigrane

- **T-001 clos et déployé** : commit `3461e05` sur `main`, MEP constatée en ligne à 13:31:31 UTC. Trois défauts sur le chemin de l'argent trouvés en revue adversariale (23 défauts, 10 corrigés) et réglés avant MEP : double débit concurrent, livraison gratuite introduite par le premier correctif, pool de connexions qui aurait figé le serveur sous dix comptes à zéro crédit.
- **Régression trouvée en production seulement** : le filigrane ne se dessine plus (0,00 % de pixels filigranés en ligne contre 10,68 % en local) — texte SVG qui ne rend pas sur ce serveur, cause inconnue. Le paywall tient (original protégé), la dissuasion a disparu.
- **Correctif de conséquence prêt hors ticket (T-000, bandes diagonales sans texte), non commité** : attend le feu vert de Romain (arbitrage ci-dessus).
- T-003 écrit : établir la cause du non-rendu du texte SVG (diagnostic seul, pas de réécriture).
- Le jalon « offre en ligne au 1er novembre » ne dépend plus du dev : reste Stripe (Romain), `/admin/ventes`, textes légaux.

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
