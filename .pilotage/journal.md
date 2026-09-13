# Journal — trait-de-famille.fr

Append-only. Écrit par le dev, lu par le PM. Une ligne par événement, la plus récente **en bas**.
Ce que personne d'autre ne peut relever : la date exacte de mise en production, le chiffre, la valeur remplacée.

| Date | Ticket | Événement | Commit | Chiffre / valeur | Note |
|---|---|---|---|---|---|
| 2026-09-12 | T-000 | Branchement du pilotage par tickets | | | |
| 2026-09-13 | T-001 | pris | | | |
| 2026-09-13 | T-001 | livré (partiel) | non commité | 0 vente possible → paywall prêt, 11 fichiers modifiés + 6 nouveaux, +416/-30 | Paywall serveur vérifié par exécution. Revue adversariale, 3 tours : 23 défauts rapportés, 10 corrigés dont 2 bloquants sur le chemin d'argent. Reste à commiter, pousser, déployer, et monter un volume sur STOCKAGE_DIR. |
| 2026-09-13 | T-001 | validé | non commité | — | Critères vérifiables atteints ; les quatre autres attendent commit, push et MEP. Réserve du valideur : le correctif du pool (n°7) est vérifié par lecture, pas sous charge réelle. |
| 2026-09-13 | T-001 | MEP vérifiée en ligne | 3461e05 | quota 3 → 2, aperçu 203 418 o en 1400×933, en-tête `x-oeuvre: 5219af5ae99a461583589f60eadfa1fa` | Déploiement constaté à 13:31:31 UTC (avant : `GET /api/oeuvres/…/debloquer` = 404 ; après : 405). Génération réelle faite sur le site : l'original ne sort plus, seul l'aperçu est renvoyé. |
| 2026-09-13 | T-001 | régression constatée en production | 3461e05 | 10,68 % de pixels filigranés en local → **0,00 %** en ligne | Le filigrane ne se dessine pas en production. L'aperçu servi est un trait propre en 1400×933. Le paywall tient (l'original 3508×2337 reste sur le serveur), mais la dissuasion a disparu. Cause non établie : le motif est un SVG `<text>`, et le texte ne rend pas sur le serveur. Vérifié à l'œil sur les deux images. Demande un ticket. |
| 2026-09-13 | T-000 | filigrane refait hors ticket | non commité | couverture du filigrane : 0,00 % en production → 30,19 % sans aucun rendu de texte, 41,46 % avec | Demande de Romain hors ticket, pour boucher la régression ci-dessus. Le motif porte désormais des bandes diagonales (`<rect>`) sous le mot : un rectangle ne dépend d'aucune police. Mesuré en retirant le texte du motif, puis rejoué dans un conteneur `node:20` sans police : 30,19 % de couverture dans les deux cas. **Pour les PM** : la cause du non-rendu du texte en production reste inconnue, seule sa conséquence est bouchée. Un ticket serait utile pour l'établir — sinon le prochain qui ajoutera du texte à une image refera la même chose sans le savoir. |
