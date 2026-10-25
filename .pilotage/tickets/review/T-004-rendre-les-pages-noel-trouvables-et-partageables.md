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

- [x] `curl -s` sur `/coloriages`, `/coloriages/noel`, `/coloriages/animaux` : exactement un `<h1` chacun.
      Preuve (local, build de prod, base jetable) : `grep -o '<h1' | wc -l` → 1 / 1 / 1 (et 1 sur `/coloriages/dinosaures`) ; sur main : 0 / 0 / 0.
- [x] `curl -s https://<local ou préprod>/` contient `href="/coloriages/noel"`.
      Preuve : `curl -s localhost:3004/ | grep -o 'href="/coloriages/noel"'` → 1 occurrence (main : 0). Lien texte « 🎄 Coloriages de Noël gratuits à imprimer » sous les boutons du Hero.
- [x] `curl -s …/coloriages/noel` : `og:image` différente de celle de l'accueil, `og:description` contient « Noël ».
      Preuve : og:image `https://trait-de-famille.fr/coloriages/image/coloriage-sapin-de-noel-a-imprimer.png` (accueil : `/opengraph-image?0a942744ab49338d`) ; og:description et twitter:description « Des coloriages de Noël gratuits à imprimer en A4 : sapin, Père Noël… ».
- [x] Une fiche Noël sert les liens Pinterest (`pinterest.com/pin/create`… avec `media` et `url` encodés),
      WhatsApp et le bouton copier ; aucun nouveau domaine tiers chargé (liste des requêtes réseau avant/après).
      Preuve : `/coloriages/noel/sapin-de-noel` sert `https://www.pinterest.com/pin/create/button/?url=https%3A%2F%2Ftrait-de-famille.fr%2Fcoloriages%2Fnoel%2Fsapin-de-noel&media=https%3A%2F%2Ftrait-de-famille.fr%2Fcoloriages%2Fimage%2Fcoloriage-sapin-de-noel-a-imprimer.png&description=…`, `https://wa.me/?text=…`, et « Copier le lien » (Chromium headless : presse-papiers = l'URL de la fiche, bouton passé à « Lien copié »). Domaines tiers demandés par la page (Chromium, PDF + PNG cliqués) : avant `[analytics.lmphoenix.fr]`, après `[analytics.lmphoenix.fr]` — identiques.
- [x] Un clic PDF en local envoie l'événement Umami attendu (preuve : requête réseau ou appel mocké).
      Preuve (umami mocké, aucun envoi réel) : `coloriage-telecharge {format: pdf, slug: sapin-de-noel}`, puis `{format: png}`, `coloriage-partage {canal: pinterest|whatsapp|lien, slug: sapin-de-noel}` ; sur main : aucun événement.
- [x] Les fiches animaux et dinosaures gardent title et meta description identiques avant/après (diff joint).
      Preuve : `<title>` et `<meta name="description">` extraits des 58 fiches (36 animaux + 22 dinosaures) sur main et sur la branche, `diff` vide.

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

**État : fait.** Commits `bd58da8`, `304a9c5` sur `ticket/T-004` (non poussés).

- H1 : `SectionTitle` prend `as="h1"` ; `/coloriages` et les pages de thème l'utilisent. Les autres usages restent en h2.
- Accueil : un lien texte vers `/coloriages/noel` dans le Hero, sans rien d'autre de changé.
- Thèmes : og/twitter title, description et image propres au thème. L'image est le **premier sujet publié dans l'ordre
  éditorial** (Noël : le sapin), avec dimensions et alt. Fiches : `twitter:*` alignés sur title et intro ; l'openGraph
  des fiches garde désormais `og:site_name`, `og:locale` et `og:type`, qu'il perdait déjà sur main (bloc qui remplace
  celui du layout racine au lieu de s'y fondre).
- Partage : `PartagerColoriage`, trois liens simples (Pinterest, WhatsApp, copier). Aucun script tiers.
- Umami : `coloriage-telecharge {format, slug}` (compté au clic, pas à la réussite) et `coloriage-partage {canal, slug}`.
  Format « png » = extension réelle du fichier (`jpg` pour un dessin que le modèle a rendu en JPEG).

Ce que le PM ne peut pas voir :
- Preuves rejouées **en local** (build de prod, base Postgres jetable où tous les sujets sont publiés avec une image
  factice de 10×10, `NEXT_PUBLIC_SITE_URL=https://trait-de-famille.fr`), pas en ligne. Umami mocké dans le navigateur,
  requêtes externes bloquées : rien n'est parti vers le serveur de mesure.
- `og:description` avant sur `/coloriages/noel` : « Transforme tes photos en coloriages à imprimer. Aperçu gratuit, sans
  abonnement. » ; og:image avant : `/opengraph-image` (l'avant/après de l'accueil).
- Les dessins sont en portrait A4 : Facebook et WhatsApp recadreront la vignette. Pinterest, lui, aime le portrait.

Revue adversariale du 2026-10-25 (niveau léger, reviewer-seo seul) : 2 défauts rapportés, 1 corrigé (og:image sans
dimensions ni alt), 1 mineur noté, 0 hérité, 0 réfuté.
- Mineur, hors lettre du ticket : `/coloriages` (la bibliothèque) garde og:title, og:description et og:image génériques
  du site. Si Romain partage le hub, l'aperçu montrera l'avant/après photo. Correctif simple sur le modèle des thèmes :
  à prendre dans un prochain ticket si le PM le juge utile.

## Validation PM

**VALIDÉ** le 2026-10-25 par /valider (agent valideur). Reste en `review/` : passage en `done/`, merge, push et MEP reviennent au chef d'orchestre.

Critères rejoués (local, branche `ticket/T-004`, build de prod, Postgres jetable peuplé des 70 sujets) :
- [atteint] Un seul `<h1` sur `/coloriages`, `/coloriages/noel`, `/coloriages/animaux` (1/1/1, et 1 sur `/coloriages/dinosaures`). Le « 0 sur main » non rejoué, plausible au diff (`SectionTitle` rendait un h2 en dur).
- [atteint] L'accueil contient `href="/coloriages/noel"` (1 occurrence, `Hero.tsx`).
- [atteint] `/coloriages/noel` : og:image = `…/coloriages/image/coloriage-sapin-de-noel-a-imprimer.png` avec width/height/alt (accueil : `/opengraph-image?…`) ; og:description et twitter:description contiennent « Noël ».
- [atteint] Fiche `/coloriages/noel/sapin-de-noel` : lien Pinterest (url, media, description encodés), `wa.me/?text=…`, « Copier le lien » ; aucun `<script src>` hors `/_next/`. Requêtes réseau et presse-papiers non rejoués (pas de Chromium), code cohérent.
- [atteint, lecture du code] Événements Umami au clic : `coloriage-telecharge` {format, slug}, `coloriage-partage` {canal, slug} via `window.umami.track`. Clic non exécuté en navigateur.
- [atteint, lecture du diff] Fiches animaux/dinosaures : title et description intacts ; seuls `twitter` et `openGraph` enrichis. `npx tsc --noEmit` sans erreur.

Périmètre respecté (9 fichiers `src`, ni sitemap, ni `force-dynamic`, ni dessins, ni refonte de l'accueil).

Réserves du valideur, telles quelles :
- Toutes les preuves sont locales. Rien n'a été vérifié en ligne, ce qui est normal avant la MEP. Après la MEP, il faudra contrôler que l'og:image de Noël est bien servie en prod, avec les vraies dimensions.
- La revue adversariale est de niveau léger, alors que le cadre prévoit le niveau complet dans le doute. Elle est tolérée ici, mais le périmètre est large.
- `/coloriages` (le hub) garde l'aperçu de partage générique. Le dev le signale lui-même et propose un futur ticket.
- Les dessins sont en portrait A4 : Facebook et WhatsApp recadreront la vignette.
