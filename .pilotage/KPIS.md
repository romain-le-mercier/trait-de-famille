# KPIs — trait-de-famille.fr

Écrit par le PM. Une cible « retenue » est un arbitrage de Romain ; « proposée » n'engage rien.
Sans cible retenue, aucun statut de trajectoire n'est posé.

| KPI | Source | Baseline | Période baseline | Cible proposée | Cible retenue | Échéance | Fréquence |
|---|---|---|---|---|---|---|---|
| Ventes Stripe 28 j (nb achats, € encaissés) — **KPI nord** | à créer : page `/admin/ventes` (agrégats Postgres `purchases`), relevée par Romain dans `retours-romain.md` | 0 / 0 € (aucune vente connue, aucune source) | au 2026-09-12 | 10 achats entre le 01/11 et le 15/12 | **10 achats — retenue par Romain le 2026-09-12, SUSPENDUE le 2026-09-14** | 2026-11-01 → 2026-12-15 (**inatteignable par construction, voir note**) | Hebdo à partir du 01/11 |
| Pages indexées | GSC Indexation > Pages | 24 / 76 connues (sitemap : 73 URL vérifiées en ligne le 2026-09-12) | relevé du 2026-09-04 | 60 / 90 (dont thème Noël) | **60 / 90 — retenue par Romain le 2026-09-12** ; **dénominateur corrigé le 2026-09-17, voir note** | 2026-11-15 | Hebdo |
| Clics organiques 28 j | GSC Performance | 0 | 28 j au 2026-09-06 | | | | Hebdo |
| Position moyenne 28 j | GSC Performance | 18.9 (fenêtre de 14 j, 26 requêtes — **non comparable**, voir note du 2026-09-17) | idem | | | | Hebdo |
| Coût modèle 28 j (LiteLLM `spend`) | LiteLLM Usage, relevé par Romain → `_pilotage/finance/couts.csv` | **0 €** (aucun appel) | au 2026-09-12, Romain | | | | Mensuel |

**2026-09-12 — mise à jour : Romain a validé en bloc (« 15 cibles : je valide tout »).** Les deux cibles sont
désormais **retenues** : **10 achats entre le 01/11 et le 15/12** (baseline 0), et **60 / 90 pages indexées
au 2026-11-15** (baseline 24 / 76). Un statut de trajectoire pourra donc se poser sur ces deux KPI — étant
rappelé que ce site est à 0 clic, 0 vente et moins de 30 jours de série : même avec une cible, aucune tendance
ne se juge encore aujourd'hui, ni à la revue du 19/09 si le volume reste nul.

**2026-09-13 — mise à jour : paywall en production, ce qui devient mesurable et ce qui ne l'est pas.**
Le paywall serveur est livré (commit `3461e05`, MEP constatée à 13:31:31 UTC) : le déblocage, le quota et
la non-fuite de l'original sont désormais des faits observables en production, pas des promesses de code.
Ceci dit, **le KPI nord (ventes Stripe) reste à 0 par construction** : Stripe n'est pas configuré en
production (clés live et webhook absents), donc **zéro achat n'est pas un échec de trajectoire, c'est une
dépendance ouverte sur Romain**, inchangée depuis le 2026-09-12. Nouveau point à surveiller, hors cible
chiffrée : le filigrane de l'aperçu gratuit ne se dessine pas en production (0,00 % de couverture contre
10,68 % en local) — la dissuasion à ne pas payer a disparu tant que le correctif prêt (T-000) n'est pas
poussé (arbitrage attendu de Romain, voir `ROADMAP.md`).

**2026-09-14 — mise à jour : le KPI nord est suspendu, pas jugé.** Romain, verbatim : « je m'occuperai de
Stripe quand on aura de la visite, pour l'instant une page où on ne peut pas commander ça me va bien. »
Conséquence : Stripe ne sera pas configuré cette saison, sans date de reprise. **La cible « 10 achats entre
le 01/11 et le 15/12 » devient inatteignable par construction** — ce n'est pas un décrochage de trajectoire,
c'est la conséquence directe d'une décision assumée. Elle n'est **pas supprimée** : elle reste inscrite,
marquée **suspendue depuis le 2026-09-14**, pour qu'on sache plus tard pourquoi elle n'a pas été tenue. La
cible « pages indexées 60/90 au 15/11 » n'est pas concernée et reste en l'état. Les CGV / confidentialité
(`[à compléter]`) passent en **basse priorité assumée** (« pas prioritaire du tout ») : aucun ticket dev ne
les attend, voir `ROADMAP.md`.

**2026-09-17 — première revue de ce site disposant d'un export frais ; le dénominateur de la cible d'indexation est corrigé.**
Exports déposés par Romain le 2026-09-17 (Performance arrêtée au 14/09, Coverage relevée au 14/09).

*Le mouvement du relevé, et d'où il vient.* **43 indexées / 76 connues contre 24 / 76 dix jours plus tôt, soit +19.**
La décomposition se ferme à l'unité : *Crawled - currently not indexed* 7 → 1 (**+6**) et *Discovered - currently
not indexed* 42 → 29 (**+13**), soit exactement +19. Le corpus n'a pas bougé (**76 connues aux deux relevés**) et
**aucune page n'a été publiée depuis le 2026-08-28** (`git log` : les seuls commits du 13-14/09 sont le paywall et
le filigrane, aucun contenu). **C'est donc bien une file dormante que Google a traitée à corpus constant**, pas un
effet d'une livraison du dispositif. Le saut a eu lieu **entre le 05/09 et le 09/09** — la série de l'export
commence le 09/09 déjà à 43, les jours du 05 au 08 ne sont pas couverts, donc la date exacte n'est pas datable
plus finement. Il est **antérieur à toute MEP** (paywall le 13/09) : rien de ce qu'on a livré ne l'explique.
**Ce n'est pas une pente : la série est plate à 43 du 09/09 au 14/09**, six jours sans un mouvement. On a un
**événement unique, pas un rythme** — et on ne juge pas une trajectoire sur un seul point de vitesse.

*Le dénominateur qui fait foi est 73, pas 76, et certainement pas 90.* Le sitemap sert **73 URL** (vérifiées en
ligne le 2026-09-12, avant le blocage Cloudflare), reconstituées terme à terme par `src/app/sitemap.ts` :
3 statiques (`/`, `/creer`, `/guides`) + 5 guides + `/coloriages` + 2 thèmes + **58 coloriages publiés** +
4 pages légales. **L'arithmétique se ferme deux fois** : `76 connues = 73 sitemap + 2 noindex + 1 redirect`, et
`73 sitemap = 43 indexées + 29 Discovered + 1 Crawled`. Conséquences :
- **Le « 90 » de la cible n'est relié à aucun corpus mesuré.** Il vaudrait 73 aujourd'hui, et **86** si le thème
  Noël livrait 12 sujets + 1 page thème (T-002). Le 90 était un chiffre rond posé au branchement.
- **Le numérateur (60), lui, reste jugeable en valeur absolue** — c'est lui qu'on suit. Lire **43 / 73 (58,9 %)**,
  jamais 43 / 90.
- **Les 2 « Excluded by noindex » sont VOLONTAIRES, vérifié dans le code** : six pages portent
  `robots: { index: false }` (`/connexion`, `/merci`, `/mes-coloriages`, `/apercu`, `/debloquer`,
  `/admin/coloriages`), aucune n'est au sitemap. Google n'en a découvert que 2. **Aucun accident, aucun ticket.**
- Le « 1 Page with redirect » n'est pas identifié (le digest ne nomme aucune URL) et **n'est pas vérifiable en
  ligne** : 403 `Cf-Mitigated: challenge` depuis ce poste. Non prouvé, et sans enjeu à une unité.

*La position 33,3 n'est PAS une dégradation prouvée.* L'export précédent couvrait **14 jours et 26 requêtes**,
celui-ci **22 jours et 58 requêtes** : le nombre de requêtes **double**. Élargir la couverture fait entrer des
requêtes de traîne en position profonde et **recule mécaniquement la moyenne** ; l'indexation passée de 24 à 43
pages produit exactement cet élargissement. La lecture « artefact d'élargissement » est retenue comme
l'explication la plus probable, **mais elle n'est pas prouvée** : le digest ne rend pas la position par requête,
donc on ne peut pas décomposer. De toute façon **la série ne fait que 22 jours (seuil : 30) : aucune tendance ne
se juge**, ni sur la position, ni sur les impressions (33 contre 49 sur 7 j). **Et le site est à 0 clic : aucun
pourcentage de clics ne se commente.** La baseline 18,9 est marquée non comparable dans le tableau ci-dessus.

*Plafond de l'export : non atteint.* 58 requêtes contre un plafond de 1 000 — **la longue traîne de ce site est
visible**, elle est simplement quasi inexistante. Ce qui la limite n'est pas l'export, c'est qu'il n'y a que
43 pages indexées et aucun clic.

*Déduction de code, non vérifiable en base :* `themes.ts` déclare **63 sujets** (et non 67 comme l'écrivait la
ROADMAP — corrigé) pour 58 publiés, donc **5 dessins seraient générés mais jamais publiés**. La base n'est pas
lisible d'ici : c'est une déduction, pas un fait. Si elle est juste, elle dit que **la publication un par un par
Romain est déjà le goulot** — ce qui est exactement le chemin critique de T-002.

*Le KPI nord reste suspendu, et ce n'est pas cette revue qui le rouvre.* La décision du 2026-09-14 tient
(« je m'occuperai de Stripe quand on aura de la visite »). Ce que cette revue ajoute, c'est **la date de
non-retour** si Romain voulait rouvrir la fenêtre — voir `ROADMAP.md`, section « Arbitrages ». En deux chiffres :
**2026-10-25** pour tenir toute la fenêtre 01/11 → 15/12, **2026-11-24** comme dernière date au-delà de laquelle
la saison 2026 est vendue à 0 € quoi qu'il arrive.

Note : Umami est en profil robot (pages/visite 1,2 ; 100 % sans référent ; 49 visites US sur 64) : il ne mesure pas l'audience de ce site. Ses événements de tunnel (`generation-reussie`, `paiement-reussi`) ne sont pas exposés par `umami-digest.js` ; ils ne servent pas de source KPI.

## Relevés

Le plus récent en haut. Date de l'export lu, pas de la revue.

| Date export | KPI | Valeur | Écart cible | Statut | Note |
|---|---|---|---|---|---|
| 2026-09-14 (Coverage) | **Pages indexées** | **43 / 73 au sitemap** (43 / 76 connues) | cible 60 au 2026-11-15 : **−17** | **à surveiller** | +19 en dix jours à **corpus constant** (76 connues aux deux relevés, aucune page publiée depuis le 28/08) : c'est une **file dormante traitée par Google**, décomposition exacte Crawled 7→1 (+6) et Discovered 42→29 (+13). **Mais série PLATE à 43 du 09 au 14/09** : un palier, pas une pente — **un seul point de vitesse ne fait pas un rythme**, donc ni « on track » ni « décroché ». 72 % du chemin fait, 59 jours restants. **Dénominateur corrigé : 73 (sitemap), pas 90** — le 90 n'est relié à aucun corpus mesuré (86 au mieux si T-002 livre). **Point de contrôle : encore 43 au relevé du 2026-09-30 ⇒ décroché.** |
| 2026-09-14 (Coverage) | Motifs de non-indexation | Discovered 29 · noindex 2 · redirect 1 · Crawled 1 | — | **instruit** | Les **2 noindex sont VOLONTAIRES**, vérifié dans le code (six pages en `robots: {index:false}`, aucune au sitemap) : aucun accident, aucun ticket. Les **29 Discovered** sont le reste du stock : ni fond mort ni file en cours de vidage — **une file qui se traite par vagues espacées**, un tiers parti en une vague puis six jours sans rien. Le « 1 redirect » n'est pas identifiable (le digest ne nomme aucune URL) et n'est pas vérifiable en ligne (403 Cloudflare). |
| 2026-09-14 (Performance) | Clics 28 j | **0** | cible non définie | **cible non définie — non jugeable** | Le site n'a jamais eu un clic. 22 j de série (< 30) et 0 clic : **aucune tendance, aucun pourcentage**. |
| 2026-09-14 (Performance) | Position 28 j | 33,3 | cible non définie | **cible non définie — non jugeable, et non comparable** | 18,9 auparavant, mais sur **14 j / 26 requêtes** contre **22 j / 58 requêtes** ici : le nombre de requêtes **double**, ce qui recule mécaniquement la moyenne. **Lecture d'élargissement retenue, NON PROUVÉE** (le digest ne rend pas la position par requête). Ne pas lire comme une chute. |
| 2026-09-14 (Performance) | Impressions 7 j | 33 (vs 49) | — | **non jugeable** | 22 jours de série, seuil à 30 : aucune tendance ne se juge. 7 jours à 0 impression. 58 requêtes dans l'export, **plafond de 1 000 très loin** : la traîne est visible, elle est quasi inexistante. |
| 2026-09-17 (Umami, 28 j) | Visites | 72 (65 visiteurs) | — | **inutilisable** | 1,29 page/visite, 100 % sans référent, 85 % de rebond, US 55 / FR 7, pages de scan (`/bankoffayetteville`, `/bitbuy`…). **Profil robot : ne mesure pas l'audience.** Événements `photo-deposee` 4 et `generation-reussie` 2 : très probablement le dev ou Romain, **pas des utilisateurs**. |
| 2026-09-14 (Romain) | Ventes Stripe 28 j (KPI nord) | 0 / 0 € | cible **suspendue** | **suspendue — non jugeable** | Romain, verbatim : « je m'occuperai de Stripe quand on aura de la visite, pour l'instant une page où on ne peut pas commander ça me va bien. » Stripe ne sera pas configuré cette saison, sans date. La cible 10 achats (01/11–15/12) reste inscrite mais ne se juge plus : elle est inatteignable par construction, pas décrochée. |
| 2026-09-12 (Romain) | Ventes Stripe 28 j | 0 / 0 € | cible non définie | **impossible par construction** | **Réponse de Romain : Stripe est codé mais pas configuré en production** — ni clés live, ni webhook `/api/stripe/webhook` déclaré. Le 0 de ce relevé n'est donc pas un signal de marché : **aucune vente ne peut avoir lieu**, quel que soit l'état du produit. Ce chiffre ne deviendra interprétable qu'après configuration (dépendance Romain, butoir proposé au 2026-10-25). |
| 2026-09-12 (Romain) | Coût modèle 28 j | **0 €** | | **mesuré** | « Y'a personne donc pas d'appel. » Cohérent avec 0 clic sur 28 j. Le coût variable de ce site est nul aujourd'hui. L'hypothèse pm-finance « ~0,04 €/appel » **n'est ni confirmée ni infirmée** : elle le restera tant qu'aucun appel n'a lieu, donc le coût d'un abus d'aperçus gratuits reste borné par les quotas (3/j/IP, 30/j/compte) et non par une mesure. |
| 2026-09-12 (Romain) | Régime de prix | **TTC** | — | **fixé** | Romain est assujetti à la TVA : les prix affichés (2,99 / 6,99 / 14,99 €) sont TTC. Les mentions de prix du site, les CGV et la facturation Stripe doivent être cohérentes avec cet affichage avant toute mise en vente. |
| 2026-09-12 (Umami, 28 j) | Visites | 64 (58 visiteurs) | | inutilisable | Profil robot probable, ne pas lire comme audience. |
| 2026-09-12 (Coverage) | Pages indexées | 24 / 76 | cible non définie | | Discovered - currently not indexed 42 · Crawled - currently not indexed 7 · Excluded by ‘noindex’ tag 2 · Page with redirect 1. Stable du 30/08 au 04/09 ; les 58 pages coloriage ont 7-9 jours d'âge au relevé. |
| 2026-09-09 (Performance) | Clics 7 j | 0 (vs 0) | cible non définie | sous 10 clics/sem : pas de % | 14 jours de série (moins de 30 : pas de tendance). Impressions 7 j : 33 vs 5. |
| 2026-09-09 (Performance) | Clics 28 j | 0 | cible non définie | | |
| 2026-09-09 (Performance) | Position 28 j | 18.9 | | | 26 requêtes dans l'export, 7 jours à 0 impression. |
