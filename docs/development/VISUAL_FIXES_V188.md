# Corrections de l’audit graphique (V188, éléments 12 à 17)

Document source uniquement, exclu du build public. Tests : [`scripts/verify-visual-fixes-v188.mjs`](../../scripts/verify-visual-fixes-v188.mjs) (`npm run test:priorities:v188`). Rendu seulement : aucune règle de combat, aucun identifiant de contenu ni format de sauvegarde n’est modifié.

| # | Constat | Cause | Correction |
| --- | --- | --- | --- |
| 12 | Cales en profondeur (QZ-17, cargo, Léthé) : pont inférieur vide, objets flottant sous le caillebotis | La bande de profondeur `floorY … floorY − zMin` n’avait qu’un dégradé à 22 % ; seul le treillis du rail était dessiné | [`src/depth-hold-deck-v188.js`](../../src/depth-hold-deck-v188.js) : pont dessiné juste après la plateforme du sol de la cale (tôles, caillebotis le long de la paroi, joints en perspective vers un point de fuite, lèvre avant), puis ombres de contact couvrant la profondeur de l’empreinte de chaque objet |
| 13 | « TERMINAL · SAUVEGARDER » sur le marine au départ | Texte fixe à `pied − 70`, à travers le torse | [`src/world-label-layout-v188.js`](../../src/world-label-layout-v188.js) : l’étiquette monte au-dessus des sprites qu’elle couvrirait, sur une plaque sombre |
| 14 | Xénomorphe de ~5,3 m dans la colonie pair-001 | Variante « Acid-Blooded K-Series » (caste `rival-hive`, ni reine ni boss) dessinée à la hauteur de son lot d’auteur (268 px) au lieu de la stature projet de sa caste (156 px, `ENEMY_DISPLAY_STATURES_V110`) | [`src/enemy-mission-stature-v188.js`](../../src/enemy-mission-stature-v188.js) : en mission, une pose de variante plus grande que la stature de sa caste de base est dessinée à cette stature ; reines (`royal`) et humains inchangés ; hitbox inchangée |
| 15 | Halo clair autour des rochers de la planète | Calques `mid`/`foreground` : bord semi-transparent chargé de la matte claire, et bande de brume peinte opaque coupée net par le masque | [`src/mission-layer-matte-v188.js`](../../src/mission-layer-matte-v188.js) : copie corrigée à l’exécution (saignée de couleur des voisins opaques, brume claire fondue près du bord) ; fichiers PNG intacts |
| 16 | Rectangle translucide sur le mur haut de la colonie | Bandes de brume de zone tracées en `fillRect` 120 × 14 | Volutes à dégradé radial sans bord (`game-v52-level-runtime.js`) |
| 17 | Échelles par-dessus « GAINE DE SERVICE » et « PASSERELLE DISPONIBLE » | Étiquettes de circulation peintes avec la plateforme, avant les échelles ; statut de passerelle sans fond | Étiquettes différées après les échelles (`hub-circulation-v137.js`) ; plaque derrière le statut (`ship-port-room-v87.js`) |

## Images des cales — suite du 16 novembre 2026

La demande de reprise du propriétaire du 16 novembre autorise la production des images manquantes. Les cinq PNG sont désormais présents dans `assets/depth-holds/v188/`, admis dans les registres et ajoutés au cache de `sw.js` : le pont `hold-deck-plating`, les deux objets de fret et les deux objets de quarantaine. Leurs octets de génération sont conservés sans réencodage.

Les quatre objets sont recadrés à leur silhouette utile puis dessinés proportionnellement, centrés et alignés au bas de leurs boîtes physiques existantes. Les codes des piles de caisses sont ajoutés selon leur instance. Le pont reçoit une matière orthographique répétée et projetée ; le caillebotis arrière, les joints, la lèvre et les ombres restent calculés par le moteur. Les primitives restent disponibles en cas d’image non chargée.

La [recette du lot](DEPTH_HOLD_ART_QA_20261116.md), les [prompts et empreintes](DEPTH_HOLD_ART_PROVENANCE_20261116.json) et la [planche avant/après](DEPTH_HOLD_ART_OVERVIEW_20261116.png) distinguent les rendus natifs, les tests automatisés et la validation navigateur.

## Échelle et franchise

Échelle projet : 1 m ≈ 51 px. Les statures de `ENEMY_DISPLAY_STATURES_V110` sont des unités de mise en scène du projet, non certifiées : le K-Series de base y vaut 156 px (≈ 3 m), au-dessus des 2,1–2,5 m d’un guerrier ; la reine de base vaut 298 px (≈ 5,8 m) et les variantes de reine 340 px. Ces valeurs de caste ne sont pas modifiées ici et restent à arbitrer. Aucune fidélité 1:1 à la franchise n’est revendiquée.

Suite (décision du propriétaire du 2026-11-16) : l’arbitrage est fait dans [`src/creature-scale-v188.js`](../../src/creature-scale-v188.js) — guerrier 118 px (2,3 m), reine 245 px (4,8 m), autres castes au même rapport au guerrier, appliqué au dessin de mission, aux boîtes de collision et au catalogue. Tableau avant → après, fidélité et mesures : bible §56.4, « Échelle des créatures » [PROPOSÉ]. La table V110 et la règle de l’item 14 restent en place ; la nouvelle couche s’applique par-dessus.

## Limites

- 25 poses de variantes systémiques sont réduites (coureurs, bombardiers, broyeurs, K-Series, ovomorphes, facehuggers, chestbursters) ; leurs hitbox restent celles des données : un facehugger ou un chestburster dessiné à 20–22 px garde une hitbox plus grande que le sprite.
- Les variantes de ravageur (158 px pour une caste à 194 px) ne sont pas agrandies.
- La correction de matte coûte ≈ 55 ms par calque, une fois, au premier affichage de chaque zone planétaire (tâche différée).
- Le statut de passerelle affiche l’identifiant de phase brut (`UNDOCKED`) quand le port n’est pas accessible ; ce texte n’est pas traduit (antérieur à ce lot).
