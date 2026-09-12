# V81 — Vague ennemie Crusher et Spitter

## Statut du lot

V81 promeut deux profils qui disposaient de sources de production mais pas encore d’un contrat runtime final : `enemy-009-crusher` et `enemy-010-spitter`. Chacun possède maintenant un atlas dédié, des pivots physiques revus, une géométrie propre, deux orientations et un comportement synchronisé à ses images d’action.

Ce lot ajoute deux profils, pas cinquante ni cinq cents. Il ne clôt pas le corpus ennemi global.

## Atlas livrés

| Profil | Grille | Poses uniques | Clips | Rendu | Hitbox acteur |
|---|---:|---:|---|---:|---:|
| Crusher 009 | 4 × 10, cellules 256 × 256 | 40 | idle, move, attack, death, charge | 320 × 320 | 116 × 100 |
| Spitter 010 | 4 × 8, cellules 256 × 256 | 32 | idle, move, attack, death | 240 × 240 | 60 × 132 |

Chaque clip contient huit poses. Le Crusher utilise les indices 32–39 pour sa charge ; le Spitter utilise les indices 16–23 pour le tir acide. Les sources regardent à droite : le runtime ne retourne l’atlas que lorsque la cible se trouve à gauche.

## Comportements branchés

### Crusher

Le Crusher choisit une charge terrestre blindée, avec amorce, déplacement balayé en sous-pas, collision avec portes/murs et impact unique. La charge s’annule si sa progression est bloquée ; aucun dégât fantôme n’est appliqué derrière un collider. Sa portée d’arrêt est de 108, sa distance de charge de 320 et son cooldown de 2,2 s. La classe finale de production applique un override strict par `profileId`/`id`, afin qu’aucune heuristique générique ne le réécrase en `stalker`.

### Spitter

Le Spitter tente de maintenir une plage de 180 à 480 px, vérifie la ligne de tir, joue l’amorce puis libère un projectile acide réel sur la pose d’impact. Le vecteur 2D est normalisé vers la hauteur réelle du corps ciblé ; le projectile avance sur X et Y avec sa propre vitesse, durée de vie et collision. La pose d’attaque n’applique aucun dégât instantané. Une perte de ligne de vue annule le tir et une reprise ne recrée jamais un projectile déjà amorcé. Son cooldown est de 1,65 s.

## Normalisation et contrôle d’image

Les deux WebP runtime sont produits par `scripts/process-v81-enemy-wave.py` depuis les planches OpenAI de production V66. Le pipeline vérifie :

- le SHA-256 de chaque source et de chaque atlas normalisé ;
- 40/40 et 32/32 cellules uniques ;
- le pivot physique `creature-ground` pour chaque pose ;
- les dimensions de grille ;
- les corrections d’échelle inter-clips du Spitter ;
- zéro pixel magenta strict restant ;
- l’absence de placeholder ou d’approximation dans le registre exact de ces deux identifiants.

Les aperçus GIF et clips WebP de revue restent séparés de l’atlas gameplay.
Le build et Vercel excluent métadonnées, aperçus, clips de revue et tout futur profil V81 non accepté ; seuls Crusher et Spitter sont réadmis par allowlist exacte.

## Provenance et fidélité

Les visuels sont des adaptations originales du projet générées avec OpenAI ImageGen à partir de références publiques verrouillées. Le manifeste déclare explicitement :

- `provider: openai-imagegen` ;
- `identityStatus: source-locked-project-adaptation` ;
- `referenceStatus: CANON_REFERENCE_ADAPTATION` ;
- `canonExact: false`.

L’acceptation runtime confirme l’identité, l’échelle, le pivot et l’usage gameplay. Elle ne signifie ni extraction d’un jeu officiel, ni copie de pixels 1:1, ni certification artistique officielle. Les preuves sont consignées dans `assets/openai/sprites/metadata/v81/` et `docs/references/v81-enemy-wave-review/`.

## Preuves de code

- `src/enemy-profile-assets-v81.js` : registre et provenance ;
- `src/enemy-profile-registry-v66.js` : résolution exacte des deux profils ;
- `src/enemy-profile-geometry-v66.js` : dimensions et hitboxes ;
- `src/enemy-batch-combat-v66.js` : charge, tir acide et reprise ;
- `src/sprite-animation-runtime.js` : grilles, clips et facing ;
- `tests/enemy-crusher-spitter-v81.test.mjs` : hashes, cellules, géométrie, animation, collisions, projectile et sauvegarde.

## Dette conservée

- les centaines de profils encore sans silhouette et animation propres ;
- les variations de dégâts, effets acides et transitions avancées par caste ;
- la QA navigateur des deux profils dans plusieurs topologies et contre un véhicule réel ;
- l’art des boss, castes royales, aquatiques, volantes et géantes encore manquants ;
- toute revendication de corpus ennemi complet.
