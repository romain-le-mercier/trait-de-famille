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

- [ ] Le PDF produit (build de prod local, base jetable avec les 12 dessins Noël) a 12 pages A4, une par dessin, dans
      l'ordre de la grille ; taille du fichier consignée ; temps de fabrication consigné (Chrome desktop, et en
      émulation mobile).
- [ ] L'événement part avec `format=pack` au clic (capture de l'appel `umami.track` mocké jointe).
- [ ] Les boutons des fiches (PDF et image) : comportement et événement inchangés (diff limité à l'ajout).
- [ ] Après MEP, à l'origine Coolify : le bouton est présent dans le HTML de `/coloriages/noel` ; title, meta, H1,
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

*(rempli par le dev, en doing/ ou review/ — fait, partiellement fait, bloqué, abandonné ; ce qui s'est révélé faux dans le ticket ; ce que le PM ne peut pas voir)*

## Validation PM

*(rempli par pm-lead au passage en done/ ou au renvoi en todo/)*
