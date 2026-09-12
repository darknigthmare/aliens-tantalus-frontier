# V81 — Qualification M41A, identité Echo-9 et vague ennemie

## Statut du lot

V81 livre trois corrections liées aux demandes récurrentes : une première activité physique dans le Proving Ground, un contrat d’identité joueur unique sur les surfaces jouables et deux profils ennemis dédiés. Aucun de ces sous-lots ne suffit à déclarer une conversation ChatGPT complète.

La matrice reste strictement à **0 DONE / 17 PARTIAL / 9 MISSING**.

## Proving Ground physique

- annexe 1 920 × 720 conservée dans le graphe du hub ;
- console d’armement à utiliser à portée ;
- ligne de tir à atteindre physiquement ;
- neuf cibles en trois hauteurs et trois distances ;
- M41A à 4/95, rechargement de 1,45 s et 75 s maximum ;
- qualification à 7/9, une touche dans chaque hauteur et un rechargement terminé ;
- projectile, collision, VFX, HUD, tactile, reprise et abandon ;
- reçu idempotent obligatoire avant le bonus de prochaine opération ;
- passerelle débarrassée des caisses bloquantes et caméra garantissant joueur + cible entièrement visibles ;
- P-5000 et tutoriels avancés maintenus à `false`.

## Identité joueur

- cinq feuilles Echo-9 autorisées, 80 cellules contrôlées ;
- grille 4 × 4, pivot pieds et découpe stricte ;
- tailles cohérentes mission 110 × 148, hub 95 × 128 et BIOFORGE 73 × 98 ;
- facing persistant et retournement autour du pivot ;
- repli procédural Echo-9 si l’asset est invalide ;
- métadonnées Neuro-Xeno conservées sans afficher une caste ennemie comme joueur.

## Art Proving Ground

Trois créations OpenAI ImageGen modulaires sont intégrées : cible 8 images, impact 8 images et console autonome. Dimensions, alpha, perspective et SHA-256 sont verrouillés dans le registre V81. Les reçus privés sont exclus du build.

## Vague ennemie

- Crusher 009 : atlas 4 × 10, 40 poses, charge balayée et impact unique ;
- Spitter 010 : atlas 4 × 8, 32 poses, maintien de distance et projectile acide réel ;
- Crusher reste `charger` dans la classe finale de production ; le projectile Spitter vise aussi la hauteur réelle ;
- pivots physiques, échelles, facings, hitboxes et reprises contrôlés ;
- adaptations originales de projet, `canonExact: false`, sans revendication 1:1 ni extraction officielle.

## Validation locale exécutée

`npm.cmd run qa` a été exécuté sur l’état V81 :

- lint : **372 modules validés** ;
- tests : **1 554 au total, 1 553 réussis, 0 échec, 1 ignoré** ;
- build : **81.0.0**, **3 450 entrées catalogue**.

Les contrôles d’assets Proving Ground et ennemis V81 sont inclus dans cette commande. La QA navigateur locale est verte : 14 captures, neuf cibles cadrées, 1 147 échantillons Echo-9 sans fallback, reprise, tactile 390 × 844 et zéro erreur. La publication canonique reste en attente à ce stade.

## Fichiers structurants

- `src/player-visual-contract-v81.js` ;
- `src/proving-ground-assets-v81.js` ;
- `src/proving-ground-session-v81.js` ;
- `src/tantalus-proving-ground-v81.js` ;
- `src/hub-v81-runtime.js` ;
- `src/enemy-profile-assets-v81.js` ;
- `scripts/process-proving-ground-art-v81.py` ;
- `scripts/process-v81-enemy-wave.py` ;
- `scripts/verify-production-v81.mjs`.

## Dettes maintenues

- P-5000 et tutoriels avancés du Proving Ground ;
- prologue, créateur, tir diagonal global et animations d’armes/rechargement dédiées ;
- props autonomes, PNJ d’annexes, replay MIRE et commandes CCTV/verrouillage ;
- corpus artistique complet des ennemis, personnages, véhicules, armes, décors et VFX ;
- QA production, commit, push et publication, à documenter seulement après preuves réelles.
