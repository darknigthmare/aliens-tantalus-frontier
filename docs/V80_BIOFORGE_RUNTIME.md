# V80 — Contrat runtime BIOFORGE

## Statut

BIOFORGE V80 est un **vertical slice jouable et isolé**. Il fait passer la conversation ChatGPT `6a98c871-61ac-83ed-be5c-600c473690e2` de `MISSING` à `PARTIAL`, jamais à `DONE`.

Le cœur promis est présent : accès depuis le sas physique du Tantalus, sélection d’un type et d’une quantité, impression, combat confiné, résultat, purge puis retour. L’extension au roster ennemi total et au corpus artistique complet annoncé reste une dette explicite.

## Accès et séparation

1. Le joueur rejoint physiquement l’annexe BIOFORGE depuis la quarantaine du hub.
2. La station V71 exécute uniquement `seal-entry`, incrémente son compteur de confinement et garantit `organismsInHub: 0`.
3. L’application ouvre la vue BIOFORGE séparée. Aucune liste de spécimens, quantité ou file d’impression n’est écrite dans `hub.annexOperationsV71`.
4. Toute la progression du mode vit sous la racine de sauvegarde `bioforgeV80`.
5. Quitter n’est autorisé qu’en phase `return`, après purge complète.

Cette séparation est intentionnelle : une partie BIOFORGE ne modifie ni les ressources de la galaxie, ni l’opération stratégique courante, ni l’équipage, ni les statistiques de campagne, ni la crise du hub.

## Machine de session

La machine déterministe utilise les phases suivantes :

`configuration → sealing → printing → combat → result → purging → return`

- `configuration` fixe exactement un profil et une quantité valide ;
- `sealing` verrouille les sas ;
- `printing` matérialise une entrée de file déterministe à la fois ;
- `combat` n’accepte que les spécimens imprimés de la session ;
- `result` enregistre `cleared`, `failed` ou `aborted` ;
- `purging` détruit les résidus du runtime ;
- `return` n’est atteint que lorsque les cinq compteurs de purge valent zéro.

Les identifiants de session suivent `bioforge-v80-sNNNNNNNNN`. La file dérive de cet identifiant et d’un index stable ; elle peut donc être reconstruite à la migration sans accepter d’entité forgée.

## Roster initial et budget

Le roster V80 est volontairement fermé à 11 profils terrestres dont l’identité et l’atlas dédié sont déjà validés :

| Profil | Coût | Quantité maximale |
|---|---:|---:|
| Ovomorph | 2 | 6 |
| Facehugger | 1 | 12 |
| Chestburster | 1 | 12 |
| Drone Big Chap | 3 | 4 |
| Warrior | 3 | 4 |
| Runner | 2 | 6 |
| Prowler | 3 | 4 |
| Burster | 3 | 4 |
| K-Series Yellow Xenomorph | 3 | 4 |
| Korari Stalker | 2 | 6 |
| Albino Chestburster | 1 | 12 |

Le budget total vaut 12 et le plafond simultané absolu vaut 12. Une quantité doit être un entier sûr supérieur à zéro, inférieur au plafond et compatible avec le coût du profil. Un identifiant absent, aquatique, royal, `legacy` ou placeholder est refusé.

## Niveau physique

Le plan auteur `bioforge-experimental-level-v80` mesure 2 880 × 720 pour une caméra 1 280 × 720. Il sépare six volumes :

- salle de contrôle ;
- sas intérieur ;
- sas extérieur ;
- baie d’impression ;
- arène de confinement ;
- sas retour.

Cinq portes assurent l’interverrouillage. La sortie de l’arène et la porte du hub restent fermées pendant `sealing`, `printing`, `combat`, `result` et `purging`. Les douze points d’apparition sont tous à l’intérieur de l’arène et orientent le spécimen vers l’opérateur placé à gauche.

Le niveau n’injecte ni véhicule, ni pickup, ni boss implicite, ni récompense de campagne. Les deux passerelles et leurs échelles donnent un vrai espace de déplacement vertical sans changer la perspective latérale.

## Purge atomique et récupération

La fin de purge reçoit cinq compteurs stricts :

- entités restantes ;
- projectiles restants ;
- dangers/acide restants ;
- effets restants ;
- timers restants.

Chaque valeur doit être un entier égal à zéro. Dans tout autre cas, la porte de retour reste verrouillée. Une sauvegarde corrompue ou une purge interrompue positionne `recovery.purgeRequired` ; une purge de récupération est alors obligatoire avant de démarrer une nouvelle session.

L’historique est borné à 64 sessions. Les compteurs de records sont bornés et seuls les 11 identifiants canoniques sont restaurés.

## Art modulaire V80

Le contrat artistique n’emploie pas une image monolithique. Il réserve six fichiers indépendants :

- `far/bioforge-far-industrial-shell-v80.png` ;
- `mid/bioforge-mid-process-modules-v80.png` ;
- `foreground/bioforge-foreground-service-frame-v80.png` ;
- `props/bioforge-tissue-printer-v80.png` ;
- `props/bioforge-bulkhead-cycle-v80.png` ;
- `vfx/bioforge-purge-cycle-v80.png`.

Les sources/reçus OpenAI restent sous `docs/references/v80-bioforge-art/` et ne sont pas des assets runtime. La présence de ces six fichiers ne clôt pas la promesse des centaines d’entrées artistiques.

## Preuves de code

- `src/bioforge-session-v80.js` : sélection, budget, file, transitions, résultats, purge, migration et records ;
- `src/bioforge-level-v80.js` : topologie, sas, plateformes, échelles, points de spawn et confinement ;
- `src/bioforge-runtime-v80.js` : combat, synchronisation de la session et nettoyage du monde ;
- `src/bioforge-ui-v80.js` : terminal accessible et commandes de session ;
- `tests/bioforge-session-v80.test.mjs` ;
- `tests/bioforge-level-v80.test.mjs` ;
- `tests/bioforge-runtime-v80.test.mjs` ;
- `tests/bioforge-save-v80.test.mjs`.

## Dette restante

BIOFORGE reste `PARTIAL` tant que les points suivants ne sont pas fermés :

- roster complet des profils ennemis éligibles, avec règles dédiées aux castes royales, aquatiques et géantes ;
- atlas et animations dédiés pour tout le corpus promis ;
- QA artistique systématique des tailles, pivots, orientations et transitions d’animation ;
- preuve navigateur finale clavier, tactile, manette, mobile et reprise ;
- mesure de performance sous budget maximal sur les navigateurs cibles.
