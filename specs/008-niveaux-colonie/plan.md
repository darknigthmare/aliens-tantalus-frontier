# Plan : niveaux dédiés C1-C4

**Spec** : [spec.md](spec.md)

## Résumé technique

Un mixin `withColonyMissionLevelsV188` (`src/colony-mission-levels-v188.js`) est composé juste sous les repères de pas, entre `withFootstepCuesV188(` et `withMissionObjectivePanelV188(` ; l'ordre des autres couches et les contrôles d'adjacence (dropship, profondeur, échelle des créatures, matte) sont inchangés. Au démarrage d'une mission C1-C4 générée, il :

- retire le roster générique (reine comprise), consomme les événements du gabarit, cache les nœuds d'objectif génériques ;
- sur la rue de colonie : gare les deux ascenseurs au niveau de la rue (rue continue, échelles conservées), ouvre les portes nécessaires (C4 : volet de sécurité scellé de l'intérieur) ;
- C2 : la console de relance prend le nœud d'énergie auxiliaire ; l'extraction passe sur le pont haut.

Les lieux sont mesurés sur la géométrie générée (`src/colony-level-places-v188.js`). Le couloir V2 de C1 est la quatrième définition des cales de profondeur (`colony-c1-port-corridor`, `src/depth-hold-sections-v188.js`) : bornes propres (`bounds`), objets placés par `placeHoldPropsV188` sur les emplacements de cale déjà livrés, règles de couloir et de passage de la spec 004. C2 est exclu de la cale de cargo procédurale (intérieur V1, §43.1).

L'objectif de campagne existant reste celui qui valide l'extraction : défense (C1) et conduits (C4) sont marqués accomplis par leurs phases, l'énergie (C2) par la console, le sauvetage (C3) par la remise du porteur.

## Persistance

Champ additif de reprise `colonyLevelV188` : `{ schema: 188, campaignId, phase, progress, checkpoint }`, instantané pris au début de la phase, avant l'événement `checkpoint` qui écrit la reprise. La sauvegarde de campagne n'a aucun nouveau champ. Le coût de stabilité de C4 est appliqué une fois, au règlement de l'opération réussie (`applyColonyLevelResultV188`, `src/app.js`).

## Vérification

`scripts/verify-colony-levels-v188.mjs` (moteur réel, `test:priorities:v188`) ; parcours Chromium `scripts/qa-colony-levels-v188.mjs` (fixtures et injections déclarées en tête du script).
