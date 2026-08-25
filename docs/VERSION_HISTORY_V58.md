# Historique de version — V58

Version applicative : 58.0.0. Date de préparation : 25 août 2026.

## Intention de release

La V58 est la passe « cohérence physique et vérité visuelle ». Elle transforme les raccords de salles, ascenseurs, portes et fonds en contrats explicites au lieu de laisser l’image ou un bouton suggérer une action sans espace jouable correspondant. Elle prolonge les systèmes des versions précédentes; elle ne remet pas à zéro le jeu.

## Changements livrés

### Hub Tantalus

- Le hub reste un monde continu de quatre ponts et 16 salles jouables.
- Chaque pont expose trois bulkheads horizontaux et deux cages d’ascenseur placées à l’intérieur des salles.
- Les puits ont des identifiants, abscisses et salles d’accueil stables entre ponts.
- Le réseau compilé contient 12 liaisons horizontales et 6 liaisons verticales réciproques.
- Les profils de plateformes, échelles, conduits et couvertures varient désormais réellement d’une salle à l’autre.
- Chaque salle reçoit son propre FAR opaque et son propre MID transparent; les anciens overhead, foreground et props restent modulaires.
- Le cadrage portrait centre la scène dans la hauteur disponible et maintient les commandes sous le canvas.
- La Vehicle Bay charge un M577 bitmap autonome, collisionnable et interactif, lié à l’identifiant catalogue exact `vehicle-001-m577-armored-personnel-carrier`.
- Le foreground du hangar est recadré pour ne plus masquer l’UD-4L; overhead, dropship, hazard et premier plan restent quatre contrats indépendants.
- Medical et Life Support reçoivent une ambiance lumineuse dédiée; le bandeau d’interaction inférieur est réduit.

### Identité des personnages et profils Neuro

- `neuro-002` dérive exactement `enemy-002-facehugger` et consomme `enemy.facehugger.locomotion`.
- Le garde runtime interdit la substitution silencieuse d’une plaque Drone lorsque le contrat demande le Facehugger.
- La désactivation du profil Neuro restaure les animations `player.echo9-marine`.

### Missions

- Les portes sont compilées depuis une origine, une destination, deux zones, un sens de retour et un rôle visuel.
- Les serrures publient une condition et un feedback explicites au lieu d’une interaction muette.
- Le HUD de mission représente le graphe réel, y compris branches verticales, conduits et verrous.
- La mission coloniale reçoit six triplets dédiés : Approach, Habitat, Civic, Utility, Security et Landing.
- Les couches zonées V56 du vaisseau et V57 de la planète restent actives; le registre V58 atteint 18 zones et 54 bitmaps.
- Les couches dédiées ne sont pas répétées artificiellement et se fondent lors d’un changement de zone.

### Portes et cohérence d’échelle

- Un atlas V58 de 2048 × 2048 remplace les états visuels disparates par quatre familles : bulkhead de vaisseau, gate coloniale, shutter de sécurité et pressure airlock.
- Chaque ligne contient un état fermé et un état ouvert dans des cellules de 1024 × 512.
- Le crop, le pivot et l’empreinte sont identiques entre les deux états d’une famille.
- La collision et la condition d’ouverture restent pilotées par le runtime; l’atlas ne décide jamais si un passage est praticable.

### Traçabilité artistique

- 51 nouveaux bitmaps V58 sont présents et branchés : 32 couches hub, 18 couches coloniales et un atlas de portes.
- FAR utilise un PNG RGB opaque; MID/foreground et portes utilisent un PNG RGBA.
- Les images sont des créations originales du projet générées avec OpenAI ImageGen; aucun bitmap officiel n’est distribué.
- Les briefs reconstitués sont documentés comme briefs normalisés, sans les présenter comme les prompts bruts exacts.

Documents associés :

- [Audit de cohérence des salles V58](V58_ROOM_COHERENCE_AUDIT.md)
- [Provenance des 51 bitmaps V58](ART_PROVENANCE_V58.md)
- [Matrice de complétude V58](references/V58_ASSET_COMPLETION_MATRIX.md)
- [Snapshot historique V56](references/V56_REMAINING_ASSET_MATRIX.md)

## Compatibilité conservée

| Source | Contrat conservé en V58 |
|---|---|
| V52 | triplets génériques de fallback pour vaisseau, colonie et planète |
| V56 | six triplets dédiés du vaisseau; couches overhead/foreground du hub; registres d’armes, outils et roster |
| V57 | six triplets dédiés de la planète |
| V58 | six triplets dédiés de la colonie, FAR/MID des 16 salles, topologie réciproque et atlas de portes |

Une zone connue utilise son triplet dédié. Une zone inconnue d’un template connu revient au triplet générique V52. Un template inconnu résout `null`; aucune image arbitraire n’est choisie par heuristique.

## Gates de release

La V58 n’est publiable qu’après les quatre niveaux de preuve suivants :

1. `npm run qa` : lint, inventaire, alpha, tests et build.
2. Tests ciblés V58 : hub FAR/MID, zones coloniales, atlas de portes et topologie.
3. QA navigateur locale : mission coloniale, 16 salles du hub, changement de pont, hangar, desktop et portrait, sans exception ni requête asset échouée.
4. Même parcours sur la production, puis vérification HTTP et état de déploiement.

Les fichiers de preuve automatisée principaux sont :

- `tests/hub-art-runtime-v58.test.mjs`;
- `tests/mission-zone-art-v58.test.mjs`;
- `tests/hub-vehicle-art-v58.test.mjs`;
- `tests/animation-identity-v57.test.mjs`;
- `tests/mission-door-art-v58.test.mjs`;
- `tests/topology-coherence-v58.test.mjs`;
- `scripts/browser-qa-v52.mjs`.

La preuve locale du 25 août 2026 est verte : **126 modules**, **236/236 tests**, build **58.0.0 / 3 443 entrées**, puis **16 checkpoints et 21 captures** navigateur couvrant les **16/16 salles**, sans exception, erreur console ni requête échouée.

Ce document décrit les gates et le contenu de release; il ne prétend pas qu’une URL de production les a passés tant que ce résultat n’a pas été consigné après déploiement.

## Dette explicitement non masquée

La V58 ferme les trous de décor et de raccord ciblés, pas toutes les dettes historiques du catalogue. Restent gouvernés par leurs matrices propres :

- les armes canoniques bloquées faute de source-modèle exacte;
- les châssis ou variantes véhicules non résolus;
- les extensions accès/dégâts qui ne disposent pas encore de feuilles acceptées;
- tout personnage, ennemi, véhicule ou objet dont l’inventaire exige encore un art dédié.

Un texte de catalogue, un prompt, un fichier non branché ou un alias générique ne compte pas comme une plaquette terminée.
