# T-015 — Proposer les 12 coloriages de Noël en un seul PDF sur le hub

| | |
|---|---|
| Projet | `trait-de-famille` |
| Type | **pari** : si le hub `/coloriages/noel` propose les 12 dessins en un PDF A4 de 12 pages, les téléchargements (`coloriage-telecharge`, conversion suivie dans `sites.yml`) passent de 4 sur 28 j (2026-11-04) à ≥ 20 sur les 28 j finissant le 2026-12-15, dont ≥ 5 du pack |
| Chantier roadmap | Fenêtre Noël, bibliothèque gratuite (H1/H2) |
| KPI visé | Événement Umami `coloriage-telecharge` sur 28 j (`conversions.js`) |
| Créé le | 2026-11-04 par pm-lead |
| Estimation | < 1 jour |
| Niveau de revue | léger |

## Pourquoi

Les 13 pages Noël sont indexées (13 / 13 le 2026-11-04) et commencent à recevoir des visites : Umami sur 28 j au 04/11,
40 visites dont 19 venues de google.com, 5 fiches Noël parmi les 8 pages les plus vues ; **4 `coloriage-telecharge`** et
2 `generation-reussie` sur la même période (`conversions.js`). Le téléchargement est la seule conversion que la
bibliothèque gratuite peut produire tant que Stripe est fermé. Aujourd'hui il faut ouvrir 12 fiches pour imprimer la
série ; un parent qui prépare les vacances veut le cahier entier en un geste. Le code sait déjà faire un PDF A4 dans
le navigateur (`src/lib/pdf.ts`, `buildColoringPdf` ; `src/components/coloriages/TelechargerColoriage.tsx` compte
l'événement au clic). Images servies de 155 à 573 Ko (relevé à l'origine le 04/11), soit quelques Mo pour 12.

## Quoi

1. Sur `/coloriages/noel`, un bouton « Télécharger les 12 coloriages (PDF A4) » qui produit un PDF d'une page par
   dessin publié du thème, dans l'ordre de la grille, avec la même mise en page que le PDF d'une fiche.
2. Fabrication dans le navigateur à partir des images déjà servies (aucun stockage serveur), une image décodée à la
   fois puis libérée, état « en cours » visible, message d'erreur si une image manque (sans PDF partiel silencieux).
3. Mesure : `suivre("coloriage-telecharge", { format: "pack", slug: "noel" })` au clic, comme le bouton d'une fiche.

## Critère de fin (vérifiable par le dev, seul)

- [x] Le PDF produit (build de prod local, base jetable avec les 12 dessins Noël) a 12 pages A4, une par dessin, dans
      l'ordre de la grille ; taille du fichier consignée ; temps de fabrication consigné (Chrome desktop, et en
      émulation mobile).
      **Preuve** (2026-11-16, `next build` + `next start` en `node:20`, Postgres 16 jetable semée avec les 12 PNG servis
      en prod, Chrome 1366×900 piloté par Playwright) : `coloriages-noel-a-imprimer.pdf`, **12 pages, toutes
      595,3 × 841,9 pt (A4 portrait)**, **3 721 086 octets (3,7 Mo)**. Temps clic → téléchargement : **1,6 à 2,0 s
      desktop**, **5,3 s en émulation Pixel 7 avec CPU ralenti ×4**. Ordre et mise en page : pour chaque page i, l'image
      embarquée et le flux de contenu (position, taille, pied de page) sont **identiques** à ceux du PDF de la fiche
      i de la grille, fabriqué par son bouton : **12/12, dans l'ordre sapin, père Noël, renne, bonhomme de neige,
      cadeau, boule, bonnet, traîneau, lutin, bûche, couronne, chaussette**.
- [x] L'événement part avec `format=pack` au clic (capture de l'appel `umami.track` mocké jointe).
      **Preuve** : `window.umami.track` remplacé avant chargement, appels capturés après le clic, desktop et mobile :
      `[["coloriage-telecharge",{"format":"pack","slug":"noel"}]]` (un seul appel).
- [x] Les boutons des fiches (PDF et image) : comportement et événement inchangés (diff limité à l'ajout).
      **Preuve** : `TelechargerColoriage.tsx` et la page fiche ne sont pas dans le diff (`git diff main...HEAD --stat` :
      `pdf.ts`, `TelechargerPack.tsx` (nouveau), `[theme]/page.tsx`). Sur `/coloriages/noel/sapin-de-noel` : PDF
      `coloriage-sapin-de-noel-a-imprimer.pdf` 1 page, image `…png` ; événements
      `{"format":"pdf","slug":"sapin-de-noel"}` puis `{"format":"png","slug":"sapin-de-noel"}`. `pdf.ts` a changé
      (mise en page extraite dans `dessinerPage`, partagée avec le pack) : le PDF de fiche de la branche a **la même
      image et le même flux de contenu (SHA-1 identiques)** que celui fabriqué par le code en prod sur la même fiche
      (`7c0b7f13…` / `97aee35b…`), relevé à l'origine 51.210.6.44 avec la sonde Umami bloquée (rien compté).
- [ ] *(après MEP, au chef d'orchestre)* Après MEP, à l'origine Coolify : le bouton est présent dans le HTML de `/coloriages/noel` ; title, meta, H1,
      JSON-LD du hub inchangés.

## Hors périmètre

- Page de couverture illustrée, nouveaux dessins, images générées, **texte dans les images** : le PDF n'assemble que les
  dessins déjà publiés (le pied de page texte du PDF existant reste tel quel).
- Packs pour `animaux` et `dinosaures` (on lit d'abord ce pari).
- Collecte d'e-mail, passage par un compte, génération côté serveur.

## Prérequis

Aucun. Construire en conteneur `node:20`.

## À consigner dans journal.md

- Date et commit de MEP, vérifiés à l'origine Coolify.
- Taille du PDF et temps de fabrication.
- Baseline : 4 `coloriage-telecharge` sur 28 j au 2026-11-04 (`conversions.js`). Le PM relève à J+14 et au 15/12,
  en séparant `format=pack` des téléchargements unitaires.

---

## Retour dev

**Fait** (critère 4 = après MEP). Commits `9a4e41c` (pack) et `2f74fc7` (correction de revue), branche `ticket/T-015`,
non poussée, non déployée. `tsc --noEmit` et `eslint` : code 0.

Revue adversariale du 2026-11-16 (niveau léger, reviewer-fiabilite seul) : 5 défauts rapportés, 2 corrigés, 3 notés
(2 hérités du flux des fiches, 1 remonté au PM), 0 réfuté.
- Corrigé : le message d'erreur nommait un dessin (ou « «  » ») même quand la panne venait de jsPDF ou du
  téléchargement → ne nomme le dessin que si son image manque, sinon « Le PDF n'a pas pu être fabriqué », erreur
  journalisée en console. Rejoué : image boule en 404 → « Le dessin « Coloriage boule de Noël à imprimer » n'a pas pu
  être chargé : aucun PDF n'a été créé » ; chunks jsPDF bloqués → message générique ; aucun téléchargement dans les
  deux cas, bouton réactivé.
- Corrigé : commentaire « une image décodée à la fois » précisé (vrai pour le bitmap ; jsPDF garde les 12 fichiers
  compressés jusqu'à la sortie, 3,7 Mo ici).
- Hérité : `addImage(…, "PNG", …)` en dur, comme la fiche ; les 12 images Noël en prod sont des PNG (vérifié), sans
  effet aujourd'hui.
- Hérité (plausible, non testé sur vrai iPhone) : le téléchargement par lien `download` après plusieurs secondes
  d'attente peut être ignoré par Safari iOS ; même mécanisme que le bouton PDF des fiches.
- **Au PM** : l'événement part au clic (voulu par le ticket), donc un clic qui échoue ou un réessai compte. Pour juger
  « ≥ 5 du pack » au 15/12 sur des PDF réellement livrés, il faudrait un second événement (livré / échec) : ticket
  **mesure** à décider, hors périmètre ici.

Ce que le PM ne voit pas :
- Le libellé suit le nombre de dessins publiés du thème (« Télécharger les n coloriages (PDF A4) ») : 12 aujourd'hui ;
  un dessin dépublié ou ajouté change le chiffre et le PDF ensemble. Pendant la fabrication : « Préparation… i / 12 ».
- Le bouton n'apparaît que sur le hub Noël (`THEMES_EN_PACK = {"noel"}` dans `[theme]/page.tsx`) ; animaux et
  dinosaures inchangés. Placé sous le H1/sous-titre, avant la grille. Title, meta, H1, JSON-LD non touchés (pas dans
  le diff) ; à rejouer à l'origine après MEP (critère 4).
- Nom du fichier téléchargé : `coloriages-noel-a-imprimer.pdf`.
- Pendant le test, `/` du WSL était plein à 100 % (96 Ko libres, 93 Go utilisés hors de ce ticket) : j'ai rendu les
  947 Mo de mon build. **À surveiller par le chef** : le prochain build de n'importe quel projet risque d'échouer faute
  de place.

## Validation PM

**VALIDÉ** le 2026-11-16 par /valider (agent valideur). Reste en review/ : done/, merge, push et MEP au chef d'orchestre.

Critères rejoués :
- PDF 12 pages A4 dans l'ordre de la grille : atteint, rejoué en partie — `buildColoringPackPdf` rejoué sous Node 24 avec 12 PNG synthétiques (ordre 0…11, 12 pages, MediaBox A4 595,28 × 841,89) ; `tsc --noEmit` = 0. Build de prod non refait (disque plein) ; taille (3 721 086 o) et temps (1,6–2,0 s desktop, 5,3 s mobile émulé) du dev crus, non remesurés.
- Événement `format=pack` au clic : atteint par lecture du code (`suivre("coloriage-telecharge", { format: "pack", slug: theme })` en tête de `telecharger`) ; capture non rejouée.
- Boutons des fiches inchangés : atteint — `TelechargerColoriage.tsx` et page fiche hors diff ; `dessinerPage` identique ligne à ligne.
- Après MEP, bouton dans le HTML de `/coloriages/noel`, title/meta/H1/JSON-LD inchangés : NON VÉRIFIABLE avant MEP, à faire par le chef d'orchestre.

Périmètre respecté (pas de couverture, pas de pack animaux/dinosaures, pas d'e-mail, pas de génération serveur).

Réserves du valideur (telles quelles) :
- Mon rejeu n'a pas couvert les vraies images, les temps de fabrication, la capture de l'événement ni le comportement sur Safari iOS.
- Le dev signale que le téléchargement par lien `download` après plusieurs secondes d'attente peut être ignoré par Safari iOS. Ce n'est pas testé sur un vrai iPhone.
- L'événement est compté au clic, pas à la livraison du PDF. Le dev l'a remonté au PM : pour juger « ≥ 5 du pack » au 15/12, il faudrait un second événement.
- Le disque `/` du WSL est plein à 100 % (944 Mo libres). Le prochain build, y compris celui de la MEP, risque d'échouer faute de place.
- Le chef d'orchestre doit encore faire la vérification en ligne du critère 4 après MEP.
