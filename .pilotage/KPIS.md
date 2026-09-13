# KPIs — trait-de-famille.fr

Écrit par le PM. Une cible « retenue » est un arbitrage de Romain ; « proposée » n'engage rien.
Sans cible retenue, aucun statut de trajectoire n'est posé.

| KPI | Source | Baseline | Période baseline | Cible proposée | Cible retenue | Échéance | Fréquence |
|---|---|---|---|---|---|---|---|
| Ventes Stripe 28 j (nb achats, € encaissés) — **KPI nord** | à créer : page `/admin/ventes` (agrégats Postgres `purchases`), relevée par Romain dans `retours-romain.md` | 0 / 0 € (aucune vente connue, aucune source) | au 2026-09-12 | 10 achats entre le 01/11 et le 15/12 | **10 achats — retenue par Romain le 2026-09-12** | 2026-11-01 → 2026-12-15 | Hebdo à partir du 01/11 |
| Pages indexées | GSC Indexation > Pages | 24 / 76 connues (sitemap : 73 URL vérifiées en ligne le 2026-09-12) | relevé du 2026-09-04 | 60 / 90 (dont thème Noël) | **60 / 90 — retenue par Romain le 2026-09-12** | 2026-11-15 | Hebdo |
| Clics organiques 28 j | GSC Performance | 0 | 28 j au 2026-09-06 | | | | Hebdo |
| Position moyenne 28 j | GSC Performance | 18.9 | idem | | | | Hebdo |
| Coût modèle 28 j (LiteLLM `spend`) | LiteLLM Usage, relevé par Romain → `_pilotage/finance/couts.csv` | **0 €** (aucun appel) | au 2026-09-12, Romain | | | | Mensuel |

**2026-09-12 — mise à jour : Romain a validé en bloc (« 15 cibles : je valide tout »).** Les deux cibles sont
désormais **retenues** : **10 achats entre le 01/11 et le 15/12** (baseline 0), et **60 / 90 pages indexées
au 2026-11-15** (baseline 24 / 76). Un statut de trajectoire pourra donc se poser sur ces deux KPI — étant
rappelé que ce site est à 0 clic, 0 vente et moins de 30 jours de série : même avec une cible, aucune tendance
ne se juge encore aujourd'hui, ni à la revue du 19/09 si le volume reste nul.

Note : Umami est en profil robot (pages/visite 1,2 ; 100 % sans référent ; 49 visites US sur 64) : il ne mesure pas l'audience de ce site. Ses événements de tunnel (`generation-reussie`, `paiement-reussi`) ne sont pas exposés par `umami-digest.js` ; ils ne servent pas de source KPI.

## Relevés

Le plus récent en haut. Date de l'export lu, pas de la revue.

| Date export | KPI | Valeur | Écart cible | Statut | Note |
|---|---|---|---|---|---|
| 2026-09-12 (Romain) | Ventes Stripe 28 j | 0 / 0 € | cible non définie | **impossible par construction** | **Réponse de Romain : Stripe est codé mais pas configuré en production** — ni clés live, ni webhook `/api/stripe/webhook` déclaré. Le 0 de ce relevé n'est donc pas un signal de marché : **aucune vente ne peut avoir lieu**, quel que soit l'état du produit. Ce chiffre ne deviendra interprétable qu'après configuration (dépendance Romain, butoir proposé au 2026-10-25). |
| 2026-09-12 (Romain) | Coût modèle 28 j | **0 €** | | **mesuré** | « Y'a personne donc pas d'appel. » Cohérent avec 0 clic sur 28 j. Le coût variable de ce site est nul aujourd'hui. L'hypothèse pm-finance « ~0,04 €/appel » **n'est ni confirmée ni infirmée** : elle le restera tant qu'aucun appel n'a lieu, donc le coût d'un abus d'aperçus gratuits reste borné par les quotas (3/j/IP, 30/j/compte) et non par une mesure. |
| 2026-09-12 (Romain) | Régime de prix | **TTC** | — | **fixé** | Romain est assujetti à la TVA : les prix affichés (2,99 / 6,99 / 14,99 €) sont TTC. Les mentions de prix du site, les CGV et la facturation Stripe doivent être cohérentes avec cet affichage avant toute mise en vente. |
| 2026-09-12 (Umami, 28 j) | Visites | 64 (58 visiteurs) | | inutilisable | Profil robot probable, ne pas lire comme audience. |
| 2026-09-12 (Coverage) | Pages indexées | 24 / 76 | cible non définie | | Discovered - currently not indexed 42 · Crawled - currently not indexed 7 · Excluded by ‘noindex’ tag 2 · Page with redirect 1. Stable du 30/08 au 04/09 ; les 58 pages coloriage ont 7-9 jours d'âge au relevé. |
| 2026-09-09 (Performance) | Clics 7 j | 0 (vs 0) | cible non définie | sous 10 clics/sem : pas de % | 14 jours de série (moins de 30 : pas de tendance). Impressions 7 j : 33 vs 5. |
| 2026-09-09 (Performance) | Clics 28 j | 0 | cible non définie | | |
| 2026-09-09 (Performance) | Position 28 j | 18.9 | | | 26 requêtes dans l'export, 7 jours à 0 impression. |
