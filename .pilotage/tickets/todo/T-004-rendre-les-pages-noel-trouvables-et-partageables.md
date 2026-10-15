# T-004 — Rendre les pages Noël trouvables et partageables

| | |
|---|---|
| Projet | `trait-de-famille` |
| Chantier roadmap | Visites avant Noël (décision de Romain du 14/10 : « sans visite, il n'y aura jamais de vente. Focus visites ») |
| KPI visé | Visites humaines Umami avec référent (0 sur 28 j au 14/10) ; clics GSC 28 j (0 au 11/10) |
| Créé le | 2026-10-15 par le PM, sur demande de Romain (« oui écris A et B ») |
| Estimation | < 1 jour |

## Pourquoi

Constaté en ligne le 14/10 par pm-seo et pm-market :
- `/coloriages` et les pages de thème, dont `/coloriages/noel`, n'ont **aucun H1** : leur titre passe par
  `SectionTitle`, qui rend un h2 (`src/app/coloriages/[theme]/page.tsx:57`).
- L'accueil ne fait aucun lien vers `/coloriages/noel` (seulement vers `/coloriages`, via le menu).
- Partagée, la page Noël affiche l'image et la description génériques du site (« Transforme tes photos… ») :
  aucun sapin sur Facebook, WhatsApp ou Pinterest.
- Aucun bouton de partage. Les téléchargements PDF/PNG ne sont pas comptés dans Umami : on ne saura pas en
  décembre si un canal a marché.

Romain va épingler les fiches sur Pinterest et poster dans des groupes de parents et d'assistantes maternelles :
ces pages doivent s'afficher correctement quand on les partage, et Google doit trouver Noël depuis l'accueil.

## Quoi

1. Un H1 unique sur `/coloriages` et sur chaque page de thème (le titre visible actuel peut devenir ce H1).
2. Sur l'accueil, un lien visible vers `/coloriages/noel` (« Coloriages de Noël gratuits à imprimer » ou
   équivalent), sans refondre l'accueil.
3. Pages de thème : `og:image`, `og:description` et `twitter:description` propres au thème (pour Noël : une image
   tirée des coloriages Noël, une description qui parle de Noël). Fiches : `twitter:description` alignée sur la
   meta description de la fiche.
4. Sur chaque fiche : boutons « Épingler » (Pinterest, avec l'image du coloriage et l'URL de la fiche), WhatsApp,
   et copier le lien. Pas de script tiers qui charge un traceur : des liens de partage simples suffisent.
5. Événements Umami sur les boutons PDF, PNG et sur chaque bouton de partage (nom d'événement + slug).

## Critère de fin (vérifiable par le dev, seul)

- [ ] `curl -s` sur `/coloriages`, `/coloriages/noel`, `/coloriages/animaux` : exactement un `<h1` chacun.
- [ ] `curl -s https://<local ou préprod>/` contient `href="/coloriages/noel"`.
- [ ] `curl -s …/coloriages/noel` : `og:image` différente de celle de l'accueil, `og:description` contient « Noël ».
- [ ] Une fiche Noël sert les liens Pinterest (`pinterest.com/pin/create`… avec `media` et `url` encodés),
      WhatsApp et le bouton copier ; aucun nouveau domaine tiers chargé (liste des requêtes réseau avant/après).
- [ ] Un clic PDF en local envoie l'événement Umami attendu (preuve : requête réseau ou appel mocké).
- [ ] Les fiches animaux et dinosaures gardent title et meta description identiques avant/après (diff joint).

## Hors périmètre

- Nouveaux dessins ou nouveaux sujets (T-005).
- Refonte de l'accueil, capture d'e-mail, pack PDF global, Stripe.
- Le sitemap et le rendu (`force-dynamic`).

## Prérequis

T-002 est en `doing/` depuis le 22/09, ses dessins sont publiés depuis le 05/10 : le dev le clôt d'abord
(mise en production et publication à consigner au journal, qui s'arrête au 22/09).

## À consigner dans journal.md

- Date et commit de mise en production, vérifiés en ligne.
- Les `og:*` de `/coloriages/noel` avant/après.
- Le PM relèvera les événements Umami et les visites par référent à J+14 et J+28.

---

## Retour dev

*(rempli par le dev)*

## Validation PM

*(rempli au passage en done/ ou au renvoi en todo/)*
