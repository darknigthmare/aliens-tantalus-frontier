# Audit level design V57

Date de l’audit : 25 août 2026
Périmètre : missions générées `ship-interior-vertical`, `colony-multiroute`, `planet-exterior`, hub Tantalus, cadrage desktop et mobile, cohérence des collisions et des couches bitmap.

## Verdict

La V56 proposait déjà un runtime jouable, mais plusieurs règles physiques contredisaient le graphe de niveau : un sol de sécurité permettait de contourner les routes, certains connecteurs verticaux étaient inaccessibles, les ascenseurs étaient simulés comme des échelles, les vents n’étaient pas réversibles et le compte à rebours d’extraction progressait hors de la zone à défendre. Le hub restait trop proche d’un couloir plat malgré ses salles illustrées.

La V57 corrige ces blocages de level design, ajoute une traversée verticale bitmap au hub et livre les 18 couches dédiées des six zones planète. Elle ne clôt pas la production artistique : les couches dédiées de la colonie, plusieurs parallaxes du hub et certaines plaques véhicules restent à produire et à valider. La release ne doit donc pas être décrite comme visuellement exhaustive.

## Méthode

- Captures runtime en 1280 × 720 sur mission, hub et hangar, plus contrôle du cadrage mobile portrait.
- Lecture croisée du graphe de mission, des plateformes compilées, des collisions, des ancres d’objectif et des événements.
- Contrôle de chaque route verticale, porte, raccourci, danger et zone de défense par un test exécutable.
- Comparaison de structure avec les principes lisibles d’un metroidvania d’action comme *Aliens: Infestation* : silhouette du sol immédiatement lisible, alternance des hauteurs, portes et raccourcis physiquement situés, premier plan non bloquant et objectifs incarnés dans l’espace. Cette comparaison sert de référence de level design, pas de copie d’assets.

## Audit priorisé

| Priorité | Problème constaté | Impact joueur | État V57 |
| --- | --- | --- | --- |
| P0 | Sol continu `v52-safety-floor` sous les plateformes | Toutes les routes pouvaient être contournées en restant en bas du niveau | Corrigé : seules les surfaces authored sont compilées |
| P0 | Dimensions runtime 6200 × 1080 alors que les plans mesurent 5200 × 620/640/650 | Environ 1000 px de monde mort, caméra et chute incohérentes | Corrigé : largeur, hauteur, caméra, acteurs et véhicules suivent les dimensions du plan ; le vide réinitialise au checkpoint |
| P0 | Échelles et ascenseurs placés au milieu d’arêtes diagonales | Connecteurs hors d’atteinte depuis une ou deux plateformes | Corrigé : plateformes d’approche aux deux niveaux et validation physique bloquante |
| P0 | Ascenseurs compilés comme échelles | Route annoncée mais action de déplacement absente | Corrigé : plateformes mobiles avec bornes haute/basse et prise en charge de la navigation ennemie |
| P0 | Vents uniquement aller | Le graphe annonçait un raccourci bidirectionnel impossible à rejouer en retour | Corrigé : paire aller/retour, destination sur l’ancre exacte et priorité d’interaction |
| P0 | Détection de boss liée à `x >= 4200` et verrou arrière persistant | Boss inactif dans certains templates et soft-lock après sa mort | Corrigé : alerte par distance et déverrouillage des portes `boss` à la défaite |
| P0 | Compte à rebours d’extraction global | Le joueur pouvait déclencher la défense puis fuir | Corrigé : rayon de défense spatial, pause/reprise observable et persistance de l’état |
| P0 | Dangers détachés du sol ; tous provoquaient un rebond | Collisions incohérentes et réactions identiques pour feu, obscurité ou électricité | Corrigé : projection sur la plateforme de support et réaction dépendante du type |
| P0 | Ennemis sans route verticale fiable | Chutes, flottement et poursuite bloquée entre étages | Corrigé : suivi de surface, choix d’échelle/ascenseur, garde-fou de bord et remise sur dernière position sûre |
| P0 | Hub normal réduit à une ligne de sol et des interactions | Navigation assimilable à un menu horizontal, sans vraie lecture de niveau | Corrigé : chaîne praticable sol → passerelle basse → passerelle haute dans chaque salle, vents, collisions et quatre bitmaps de traversée |
| P1 | Décors de mission dédiés uniquement au vaisseau | Répétition des trois couches génériques dans colonie et planète | Corrigé pour la planète : 18 bitmaps dédiés couvrent les six zones ; ouvert pour les 18 couches de colonie |
| P1 | Parallaxes du hub incomplets | Grand vide central et profondeur identique entre plusieurs salles | Ouvert : 12 fonds lointains uniques et 15 couches intermédiaires restent à produire |
| P1 | Couches de pièce mal proportionnées sur certains écrans | Plafond monumental, acteurs trop petits et centre vide | Corrigé sur les scènes représentatives par bounds mesurés, parcours en deux paliers et cadrage ; revue des 16 salles encore requise |
| P1 | Props dessinés et colliders de tailles différentes | Collision invisible ou interaction décalée | Corrigé pour les bounds de rendu, collision et interaction du hub ; contrôle navigateur conservé |
| P2 | Portrait mobile laisse une zone noire inutile | Jeu comprimé en haut de l’écran et commandes éloignées | Corrigé dans la grille runtime mobile ; à revalider sur appareil tactile réel |
| P2 | Art de véhicules et variantes d’état incomplet | Embarquement, dégâts ou silhouettes génériques | Ouvert : 10 plaques accès/dégâts restent identifiées, avec production conditionnée par les références disponibles |

## Corrections techniques présentes

### Missions

- `mission-levels-v52.js` compile les surfaces d’approche des connecteurs et rattache chaque danger à une plateforme réelle.
- `validateMissionPhysicalTopologyV57` refuse un plan si un connecteur n’a pas ses appuis, si un danger est hors surface ou si une ancre jouable n’est pas soutenue.
- `game-v52-level-runtime.js` supprime le sol artificiel, respecte les dimensions authored, crée les vrais ascenseurs, rend les vents réversibles et borne acteurs, caméra et véhicules.
- La navigation ennemie conserve une surface sûre, peut rejoindre un connecteur vertical et n’avance plus aveuglément dans un vide.
- Le verrou d’événement lié au boss est levé à sa défaite et la zone active publie son vrai libellé.
- L’extraction exige qu’au moins un défenseur vivant reste dans le rayon de l’objectif. Son état `paused` ou `running`, sa cible et son rayon sont sauvegardés.

### Hub

- Le hub normal utilise maintenant une route physique par pont : huit plateformes, huit échelles et quatre vents au lieu du seul sol global.
- Les plateformes, échelles et entrées de ventilation utilisent les bitmaps indépendants `overhead-catwalk`, `drop-platform`, `wall-ladder` et `vent-entrance`.
- Les bounds d’affichage, de collision et d’interaction des props sont séparés afin que le sprite ne crée plus une collision disproportionnée.
- Le rapport d’assets expose le nombre de bitmaps de traversée réellement chargés et la QA navigateur vérifie la montée sur plateforme.

### Cohérence des acteurs

- Les contrôleurs d’animation utilisent des identifiants séparés `player:`, `coop:`, `npc:`, `enemy:` et `vehicle:` ; un membre humain ne peut plus consommer une plaque ennemie.
- Le Neuro-Xeno explicite peut conserver `visualForm: xenomorph`; le retour marine restaure `visualForm: marine`, sans contaminer la télémétrie ni les plaques des membres d’équipage.
- Les dangers renseignent leur type réel ; le stun et le recul électrique ne sont plus appliqués indistinctement à tous les volumes.

## Production artistique restante

### Niveaux de mission

- Colonie : 6 zones × 3 couches = 18 bitmaps dédiés manquants.
- Planète : 6 zones × 3 couches = 18 bitmaps dédiés terminés, branchés au registre V57 et au cache hors ligne.
- Chaque zone utilise un fond opaque, un plan intermédiaire RGBA et un premier plan RGBA ; les transitions appliquent un fondu court entre deux triplets.

### Hub et véhicules

- 12 parallaxes lointains uniques du hub et 15 couches intermédiaires de salle.
- Modules physiques supplémentaires pour portes, seuils, cages d’ascenseur, conduites et occultants de premier plan.
- 10 plaques véhicules d’accès, d’usage ou de dégâts déjà inventoriées.
- Rigs de costumes et variantes d’état non encore couverts par une plaque dédiée.

Les armes ou véhicules sans référence canonique fiable restent explicitement bloqués : une illustration spéculative ne doit pas être présentée comme une reproduction exacte.

## Preuves et gates de release

Tests ciblés ajoutés ou renforcés :

- `tests/mission-physical-topology-v57.test.mjs`
- `tests/mission-hold-zone-v57.test.mjs`
- `tests/enemy-surface-navigation-v57.test.mjs`
- `tests/level-runtime-regressions-v57.test.mjs`
- `tests/animation-identity-v57.test.mjs`
- `tests/mission-zone-art-v57.test.mjs`
- `tests/hub-gameplay-v51.test.mjs`
- `tests/hub-proportions-v53.test.mjs`
- `scripts/browser-qa-v52.mjs`, avec checkpoints holdout spatial et traversée verticale du hub

La publication V57 reste conditionnée au passage complet de `npm run qa`, de la QA navigateur locale, puis de la même QA contre le déploiement de production. Une image présente sur disque n’est comptée comme terminée que si elle est branchée au registre runtime, chargée sans erreur, visible au bon plan de profondeur et validée par capture.
