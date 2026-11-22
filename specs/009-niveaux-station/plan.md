# Plan : niveaux dédiés S1-S4

**Spec** : [spec.md](spec.md)

## Résumé technique

Un mixin `withStationMissionLevelsV188` (`src/station-mission-levels-v188.js`) est composé juste sous le panneau d'objectif, entre `withMissionObjectivePanelV188(` et `withTensionDirectorV188(` ; l'ordre des autres couches et les contrôles d'adjacence (dropship, profondeur, échelle des créatures, matte, lot colonie `withFootstepCuesV188(withColonyMissionLevelsV188(withMissionObjectivePanelV188(`) sont inchangés. Au démarrage d'une mission S1-S4 générée, il :

- retire le roster générique, consomme les événements du gabarit, cache les nœuds d'objectif génériques ; le circuit auxiliaire et le terminal d'archives du gabarit ne sont plus proposés ;
- reprend les quatre cloisons du pont inférieur (`dock-bulkhead`, `cargo-bulkhead`, `aft-bulkhead`, `outer-airlock`) : leur verrou de gabarit est remplacé par celui du niveau, affiché à la porte (raison FR/EN) ;
- pose deux murs (cadres scellés) sur les ponts supérieurs et scelle les conduits (`beginMissionVentTraversalV62` refusé, entrée informative) ;
- S4 : l'extraction passe au quai ; la tenue de zone générique est remplacée par la tenue du quai.

Le gabarit, lu comme la station [PROPOSÉ] : pont inférieur = collier et sas 1 → section de l'anneau (laboratoire en S3) → cloison de l'anneau → pont du réacteur → section arrière → cloison arrière → sas extérieur → dropship du Tantalus ; pont médian = galerie de l'anneau, habitation, puits de jonction ; pont haut = passerelle de coque et pont de contrôle (« bridge » du gabarit). Lieux mesurés par `src/station-level-places-v188.js`. La cale de cargo procédurale est retirée de S1-S4 (`V1_INTERIOR_CAMPAIGNS`, `src/depth-hold-sections-v188.js`).

L'objectif de campagne existant reste celui qui valide l'extraction : S1 `board` (énergie de secours du pont + un sas ouvert), S2 `restore` (réacteur), S3 `escape` (le minuteur générique est neutralisé pendant le niveau, la sortie marque l'évasion), S4 `hold` (la tenue du quai marque l'action).

## Persistance

Champ additif de reprise `stationLevelV188` : `{ schema: 188, campaignId, phase, progress, checkpoint }`, instantané pris au début de la phase, avant l'événement `checkpoint`. La sauvegarde de campagne n'a aucun nouveau champ ; `stationV188` garde sa forme. Le niveau lit la décision CASSIUS (`stationV188.cassius`) et la décision Grue de la colonie (`colonyMissionsV188.grue`) depuis `narrativeArchiveSave`, déjà passé au moteur par `src/app.js`. `stationLevelResultV188()` résume ce que le niveau a vu (récupérateurs, routage, œufs) sans écriture.

## Vérification

`scripts/verify-station-levels-v188.mjs` (moteur réel, `test:priorities:v188`) ; parcours Chromium `scripts/qa-station-levels-v188.mjs` (fixtures et injections déclarées en tête du script).
