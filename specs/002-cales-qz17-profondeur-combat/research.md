# Research: Cales de QZ-17 en profondeur

Source : cartographie en lecture seule du moteur de mission (2026-11-14), puis mesure sur le moteur réel.

- **R1 — Section**:
  - **Decision**: zone `ship-cargo`, pont bas à y = 868 (profil vertical V130). Plage de x entre la sortie du sas `dock-bulkhead` et l'entrée du sas `cargo-bulkhead`, mesurée sur la géométrie générée (les nœuds varient de ±12). Section active seulement pour `special-narrative-qz17`.
  - **Rationale**: c'est le seul sol continu de la soute, environ 590 px.
- **R2 — Commandes**:
  - **Decision**: W/S et les flèches pour Echo-9, I/K pour le marine coop, retirés des touches transmises au moteur quand l'acteur est sur le pont de la cale. Cela retire aussi l'accroupi sur S, la visée haut/bas au clavier et l'appel d'ascenseur ; il n'y a ni échelle ni ascenseur dans la section.
  - **Rationale**: décision (2) du propriétaire. La visée à la souris reste disponible, et le tir est horizontal (décision 3).
- **R3 — Tir**:
  - **Decision**: au tir, chaque balle porte la profondeur du tireur. Pendant `updateBullets`, seuls les ennemis à ±22 de cette profondeur sont présents. Les conteneurs dont l'emprise couvre la bande de la salve sont ajoutés aux murs. Un ennemi blessé recale le tireur de 30 % vers sa profondeur. L'aide à la visée et le corps à corps du joueur sont filtrés de la même façon (modèle `withForegroundEnemiesV130`).
- **R4 — Ennemis**:
  - **Decision**: chaque ennemi éveillé sur le pont de la cale rejoint la profondeur de son marine le plus proche, à 60 % de sa vitesse au sol (au plus 120/s). S'il entre dans une emprise, il en ressort vers la zone libre la plus proche, ce qui le fait contourner les conteneurs.
  - Une attaque au corps à corps ne porte qu'à ±24 : l'ennemi en cours de mise à jour est connu pendant `updateEnemy`, et `damagePlayer` refuse hors bande. Un projectile ennemi porte la profondeur du tireur ; pendant `updateHostileProjectiles`, le projectile le plus proche du joueur décide de la bande.
- **R5 — Détecteur**:
  - **Decision**: le détecteur V160 inclut déjà `actor.depth` dans la distance. Pendant `update`, la profondeur des acteurs de la cale y est recopiée, puis rétablie, sauf si un conduit l'a modifiée entre-temps.
- **R6 — Rendu**:
  - **Decision (révisée à la mesure)**: translation du canvas autour de `drawActor` / `drawEnemy`. Un premier essai décalait `actor.y` : il faussait la pose de l'arme du moteur et coûtait +25 %.
  - Au premier `drawActor` de l'image, les conteneurs sont dessinés (du fond vers l'avant), puis les ennemis placés derrière Echo-9 qui le chevauchent ; ces ennemis sont ensuite ignorés par la boucle de base.
  - Avant `drawObjective`, l'occultation masquée recouvre les acteurs placés derrière un conteneur ; Echo-9 garde un contour.
- **R7 — Reprise**:
  - **Decision**: `depthV188 = { section, player, coop, enemies:[{id,z}] }` dans l'état de reprise ; rétabli si la section correspond.
- **R8 — Castes**:
  - **Decision**: les rôdeurs (`vent-stalker`) de la dépressurisation sont admis : comportement horizontal, inchangé.
  - Les drones au plafond n'existent pas dans les campagnes `special-` (`caste-behaviors-v188.js:79`).
  - Aucune Reine ni aucun Crusher n'est placé dans la cale.
