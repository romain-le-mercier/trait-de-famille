# T-012 — Ne plus déclarer d'offre « en stock » à Google quand le paiement est fermé

| | |
|---|---|
| Projet | `trait-de-famille` |
| Type | **obligation** (exactitude des données structurées, information du consommateur) : 3 offres `InStock` déclarées sur l'accueil → 0 tant que le paiement n'est pas configuré |
| Chantier roadmap | « À trancher par le conseil » n° 4 (données structurées qui promettent une vente impossible) ; objectif du site inchangé (pages Noël indexées, D-007) |
| KPI visé | Aucun chiffre de trafic : risque retiré (action manuelle « données structurées trompeuses » sur un site de 86 URL en pleine fenêtre d'indexation Noël) |
| Créé le | 2026-11-02 par pm-lead |
| Estimation | < 1/2 jour |
| Niveau de revue | léger |

## Pourquoi

Constat dans le code au 2026-11-02 (`origin/main`, `b12615f`) : `src/app/page.tsx` l. 38-54 publie un `Product` avec trois
`Offer` (2,99 / 6,99 / 14,99 €, `availability: InStock`, `url: /debloquer`) sans condition, alors que
`src/app/api/checkout/route.ts` répond `stripeMissing` (« Le paiement n'est pas configuré sur ce serveur ») quand
`STRIPE_SECRET_KEY` est vide, et que la ROADMAP tient l'offre payante repoussée sans date depuis le 2026-09-14. Déclarer
à Google un produit achetable qu'on ne peut pas acheter, c'est le motif type d'une action manuelle sur les données
structurées, et ça peut coûter l'indexation que toute la saison cherche (D-007 : 8/13 pages Noël au 2026-11-20).
L'état réel de `STRIPE_SECRET_KEY` en production n'est **pas vérifiable** depuis le poste : le ticket ne le tranche pas,
il rend le balisage conditionnel, donc juste dans les deux cas.

## Quoi

1. Sur l'accueil, n'émettre le JSON-LD `Product` (et donc ses `Offer`) que si le paiement est réellement ouvert,
   c'est-à-dire selon la même condition que `GET /api/checkout` (`enabled`). Paiement fermé : pas de bloc `Product` du
   tout (un `Product` sans `offers` est invalide pour les résultats enrichis, autant ne rien déclarer).
2. Le reste du balisage de l'accueil (FAQPage, etc.) ne change pas.
3. Une seule source pour la condition (réutiliser ou extraire celle de `api/checkout`), pas une seconde lecture de
   variable qui pourrait diverger.

## Critère de fin (vérifiable par le dev, seul)

- [ ] Build de prod, `STRIPE_SECRET_KEY` vide : `curl -s localhost:3000/ | grep -c '"@type":"Offer"'` → 0, et
      `grep -c '"@type":"Product"'` → 0 ; le bloc `FAQPage` est toujours présent (compte avant = compte après).
- [ ] Même build, `STRIPE_SECRET_KEY` renseignée avec une clé de test factice : `"@type":"Offer"` → 3, prix et `url`
      identiques à avant (diff du bloc JSON-LD avant / après : vide).
- [ ] L'accueil reste rendu à la requête (pas figé au build avec la valeur de l'environnement de build) : prouvé en
      relançant le même build avec puis sans la variable, sans rebuild.
- [ ] Typecheck et lint passent.

## Hors périmètre

- Ouvrir, fermer ou configurer Stripe ; toucher à `/api/checkout`, `/debloquer`, aux packs ou aux prix (la reprise de
  Stripe est la question n° 5, ouverte au conseil).
- Retirer la grille tarifaire visible (`Pricing`) ou les CGV : c'est une autre question, pas ce ticket.
- Le JSON-LD des fiches coloriage, des thèmes et des guides (aucune offre n'y est déclarée).

## Prérequis

Aucun.

## À consigner dans journal.md

- Date et commit de MEP ; à la MEP, nombre de `"@type":"Offer"` servis par l'accueil **à l'origine Coolify**
  (défi Cloudflare depuis le poste), avant → après. C'est ce chiffre qui dit, enfin, si Stripe est configuré en prod.
- Valeur remplacée : le bloc `productSchema` tel qu'il était (copie dans le journal ou référence de commit).

---

## Retour dev

## Validation PM
