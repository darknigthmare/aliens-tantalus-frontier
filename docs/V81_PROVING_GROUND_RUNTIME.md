# V81 — Proving Ground physique et qualification M41A

## Verdict

V81 remplace le service abstrait du Proving Ground par une première boucle d’entraînement réellement jouable dans l’annexe du hub. Le joueur entre depuis l’Armory, active physiquement la console, rejoint le repère de tir, vise et tire sur neuf cibles, effectue au moins un rechargement, puis reçoit ou non une qualification calculée depuis ses actions.

Ce lot couvre uniquement la qualification M41A. Il ne livre ni exercice P-5000, ni tutoriels avancés, ni certification Power Loader. La conversation hub #19 reste donc `PARTIAL`.

## Parcours physique

Le parcours ne passe pas par un menu de boutons :

`Armory → porte est réciproque → annexe Proving Ground → console de sécurité → passerelle de tir → neuf cibles → résultat → retour Armory`

L’annexe conserve le gabarit V71 de 1 920 × 720. Son sol principal est à `y = 624`. La ligne de tir est une passerelle indépendante placée à `x = 748`, `y = 438`, avec une surface marchable à `y = 468`. Après armement à portée de la console, la session démarre uniquement lorsque le joueur atteint cette zone. Pendant l’épreuve, le Marine est maintenu sur le repère et orienté vers les cibles ; sortir de l’annexe abandonne proprement la session active.

Le premier parcours navigateur a révélé deux caisses collidables sur la liaison échelle–pad. Elles ont été déplacées dans l’alcôve de service au sol et le gabarit des dix annexes possède maintenant une régression `catwalkRouteClear`.

## Contrat de session

La machine persistante accepte six phases :

`idle → armed → active → completed | failed | aborted`

Les règles sont déterministes :

- durée maximale : 75 secondes ;
- exposition maximale de chaque cible : 5,5 secondes ;
- neuf cibles, réparties exactement en trois hauteurs `high`, `level` et `low` ;
- chargeur initial volontairement limité à 4 cartouches, réserve de 95 et capacité de 99 ;
- rechargement physique de 1,45 seconde ;
- qualification : au moins 7 cibles touchées, au moins une cible dans chaque hauteur et au moins un rechargement terminé ;
- score : 100 points par cible, 10 points retirés par tir manqué et bonus de temps uniquement après réussite.

Chaque cible progresse de `queued` à `active`, puis `hit` ou `missed`. Une cible rangée n’est pas un mur invisible : seule la cible active peut recevoir un projectile.

## Tir et visée

La visée dispose de trois rayons normalisés : horizontal, +20 degrés et -20 degrés. Le tir crée un projectile local réel, déplacé par sous-pas jusqu’à 1/120 s pour ne pas traverser une cible entre deux images. La collision valide l’identifiant de la cible active avant de comptabiliser l’impact. Les projectiles et VFX transitoires ne sont jamais sérialisés et sont détruits à la fin ou à l’abandon de la session.

Le HUD du hub affiche la phase, le score, le nombre de cibles, le temps, la visée et les munitions. Les commandes tactiles dédiées ne sont visibles que dans cette annexe.

La caméra active cadre le milieu entre Echo-9 et la cible, conserve son easing, puis garantit 36 px de marge autour de la cible. Les neuf cibles et le joueur sont donc simultanément visibles ; les cibles 04, 07 et 08 possèdent des captures de régression dédiées.

## Assets OpenAI modulaires

Trois bitmaps originaux, indépendants et transparents sont branchés par `src/proving-ground-assets-v81.js` :

| Asset runtime | Format | Usage |
|---|---:|---|
| `proving-ground-target-cycle-v81.png` | 2 048 × 1 024, grille 4 × 2, 8 images | cible rangée, levée, prête, touchée, endommagée et rabattue |
| `proving-ground-impact-cycle-v81.png` | 2 048 × 1 024, grille 4 × 2, 8 images | contact, étincelle, éclat, fragments, braises et fumée |
| `proving-ground-range-console-v81.png` | 1 024 × 1 024 | console de sécurité indépendante |

Le contrat impose `strict-side-on-orthographic`, un alpha transparent et une référence Marine de 92 px. Les sources, prompts et reçus restent dans `docs/references/v81-proving-ground-art/` et sont exclus du site publié. Ces images sont des créations de projet générées avec OpenAI ImageGen ; elles ne sont ni des extractions officielles, ni une revendication de pixels 1:1.

## Sauvegarde, reçu et bonus

L’état de la session est enregistré sous `hub.provingGroundV81`. La reprise reconstruit la cible active, le temps, les munitions, la recharge, le score, les hauteurs touchées et l’historique de qualification ; aucun projectile n’est recréé.

Une réussite produit un reçu canonique `m41a-qualification-v81:session-N:qualification`. Le service du hub vérifie son schéma, son type, le parcours, le résultat et son identifiant avant d’armer `nextOperationCharge`. Les identifiants consommés sont gardés dans un historique borné à 32 : une visite de console, un ancien drapeau V71 ou le rejeu d’un reçu ne peut pas attribuer le bonus. La prochaine opération consomme ce soutien et applique la réduction de risque prévue par le service V71.

Les champs `powerLoaderCertified` et `advancedTutorialsComplete` restent forcés à `false`.

## Contrôles

- `E` : armer la qualification près de la console ou quitter par la porte ;
- marcher et grimper avec les contrôles du hub jusqu’au repère ;
- `F` : tirer ;
- `W` / flèche haut : viser haut ;
- `S` / flèche bas : viser bas ;
- aucune touche de visée : tir horizontal ;
- `R` : recharger ;
- tactile : `HAUT`, `BAS`, `TIR` et `R` lorsque le Proving Ground est actif.

## Preuves de code

- `src/tantalus-proving-ground-v81.js` : géométrie, cible, rayons et validation du placement ;
- `src/proving-ground-session-v81.js` : session, score, qualification, reçus et migration ;
- `src/hub-v81-runtime.js` : entrée physique, tir, collisions, HUD, rendu, reprise et sortie ;
- `src/hub-annex-services-v71.js` : validation idempotente du reçu et consommation du soutien ;
- `src/proving-ground-assets-v81.js` : registre des trois assets ;
- suites `tests/proving-ground-*-v81.test.mjs`, `tests/hub-v81-runtime.test.mjs` et `tests/hub-annex-services-v71.test.mjs`.

## Dette conservée

- exercice P-5000 physique et certification associée ;
- tutoriels avancés et leurs parcours ;
- props bitmap autonomes et variations d’état pour toutes les autres annexes ;
- PNJ dédiés des annexes ;
- replay MIRE et commandes CCTV/verrouillage physiques ;
- preuve navigateur de production, à consigner seulement après déploiement ; la preuve locale est verte avec 14 captures, 1 147 échantillons d’identité et zéro erreur navigateur/réseau.
