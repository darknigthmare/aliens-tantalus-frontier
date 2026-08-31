# Provenance graphique V66 — lot 001

Fournisseur réel : outil intégré OpenAI ImageGen. Aucune API de génération, aucun achat de crédits ni interpolation de poses.

20 sources retenues, 160 poses demandées, cinq identités standard. Les essais rejetés et les copies de comparaison ne sont pas recomptés comme de nouvelles animations.

## Références et prompts

- [Œuf et Chestburster : appels, prompts et rejets](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/codex/v52-physical-worlds/docs/references/V66_OVOMORPH_CHESTBURSTER_IMAGEGEN.md)
- [Drone / Big Chap et Warrior : appels, prompts et rejets](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/codex/v52-physical-worlds/docs/references/V66_DRONE_WARRIOR_IMAGEGEN.md)
- [Runner : appels, prompts et limites du conditionnement](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/codex/v52-physical-worlds/docs/references/V66_RUNNER_IMAGEGEN.md)
- [Verrous des cinq références](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/codex/v52-physical-worlds/docs/references/V66_ENEMY_BATCH_REFERENCES.json)
- [Événements de production et SHA-256](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/codex/v52-physical-worlds/docs/references/V66_ENEMY_BATCH_STATE.json)
- [Revue d'échelle inter-clips](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/codex/v52-physical-worlds/docs/references/V66_BATCH_001_SCALE_REVIEW.md)
- [Revue des racines physiques par pose](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/codex/v52-physical-worlds/docs/references/V66_BATCH_001_ANCHOR_REVIEW.json)

Les sources PNG sélectionnées sont RGB sur fond magenta, pas de faux PNG « transparents ». La préparation enlève le fond de manière contrôlée, conserve les pixels des fragments attribués à leur pose, applique les facteurs d'échelle revus et place les corps sur un pivot fixe. Les atlas runtime sont WebP RGBA sans perte, à grille 4 × 8 de cellules 256 × 256.

Aucune frame dupliquée ni interpolation optique n'est comptée comme une pose dessinée. Les images source restent intactes. Les originaux, références de travail, prompts et contacts QA restent hors de `dist` et hors du déploiement ; les preuves détaillées sont consultables dans le dépôt GitHub ci-dessus.

Les photos NECA sont des documents de référence, pas des sprites publiés. Leurs copies de travail restent locales et ignorées par Git ; leurs URLs sont conservées dans le verrou de référence. La reproduction générative est déclarée `canonExact: false`. Certaines références ont été conditionnées par une image distante affichée ; le Runner conserve explicitement sa limite de guidage textuel après échec des chemins locaux. Les détails sont séparés par appel dans les documents ci-dessus.

## Échelle dans le monde

La proposition initiale d'œuf à 70–90 px a été revue. Le rectangle logique du marine fait 92 px de haut, mais sa première pose réellement affichée mesure 111,6 px : il ne fallait pas confondre ces deux repères. [La réplique grandeur nature NECA](https://store.necaonline.com/products/aliens-life-size-xenomorph-egg-replica-with-led-light) indique une hauteur proche de 36 pouces, soit environ 91 cm. Avec un humain conventionnel de 1,80 m, l'œuf final mesure donc 56,1 px. Il s'agit d'une adaptation de jeu fondée sur cette référence, pas d'une mesure universelle de tous les accessoires des films.

La première pose du Chestburster mesure 16,9 px de haut, le Drone 146,5 px, le Warrior 136,3 px et le Runner 82 px. Les cinq canevas sont carrés : 78, 188, 282, 218 et 256 px respectivement. Les racines restent au sol ; la taille du canevas transparent n'est pas celle du corps ni celle de sa collision. La comparaison technique est conservée dans `docs/references/v66-world-scale-review/` du dépôt, et ne constitue pas une capture du jeu dans un navigateur.

Le fond magenta enfermé entre des membres et les boucles de queue a été nettoyé après inspection, avec une extension de contour bornée à deux pixels source. Chaque masque et compte de pixels est conservé ; aucune couleur de corps n'est repeinte ni anatomie reconstruite. De petites variations de dessin et de reflets restent possibles entre poses, en particulier sur le Warrior : ce lot n'est pas une copie pixel pour pixel certifiée.
