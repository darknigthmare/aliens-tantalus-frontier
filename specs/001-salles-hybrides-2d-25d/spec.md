# Feature Specification: Salles hybrides 2D / 2,5D — prototype du hangar

**Feature Branch**: `claude/nifty-shannon-qpy1hl` (branche de travail existante)

**Created**: 2026-11-13

**Status**: Draft

**Input**: User description: "Salles hybrides 2D / 2,5D dans Aliens: Tantalus Frontier. Certaines salles passent en 2,5D (déplacement au sol en profondeur, en plus de gauche/droite) pour tirer parti de la profondeur ; les autres restent en 2D de profil pour la hauteur (échelles, coursives, conduits, ascenseurs). Premier prototype : le hangar du dropship du hub USS Tantalus, sans combat. Décisions du propriétaire : (1) premier prototype = hangar du dropship ; (2) dans une salle 2,5D, W/S avancent et reculent en profondeur ; échelles et ascenseurs de ces salles s'utilisent avec E à leur pied ; le mode est annoncé à la porte ; (3) pour les futures salles 2,5D avec combat, tir horizontal avec alignement automatique sur une bande de profondeur proche ; (4) pas de mise à l'échelle des sprites : décalage vertical, tri par profondeur, ombre au sol, léger assombrissement au fond."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Traverser le hangar en profondeur (Priority: P1)

Le joueur entre dans le hangar du dropship depuis une salle de profil. Il se déplace à gauche et à droite comme ailleurs, et aussi vers le fond et vers l'avant du hangar avec W/S. Il contourne le dropship, les caisses et les chariots par devant ou par derrière, et rejoint le poste d'embarquement.

**Why this priority**: c'est la raison d'être de la fonctionnalité. Sans déplacement au sol en profondeur, il n'y a pas de salle 2,5D à évaluer.

**Independent Test**: charger une partie au hub, entrer dans le hangar et parcourir la salle dans ses quatre directions, en contournant au moins un obstacle par l'avant et un par l'arrière, sans jamais traverser un objet.

**Acceptance Scenarios**:

1. **Given** le joueur dans le hangar, **When** il maintient W, **Then** il recule vers le fond du hangar jusqu'à la limite du sol praticable, puis s'arrête.
2. **Given** le joueur devant une caisse, **When** il avance vers elle, **Then** il est bloqué par son emprise au sol et doit la contourner par l'avant ou par l'arrière.
3. **Given** le joueur derrière le dropship, **When** il se déplace, **Then** le dropship le masque à l'écran (il est plus près de la caméra) et sa silhouette reste repérable.
4. **Given** le joueur au fond, **When** il compare avec un PNJ au premier plan, **Then** les deux sprites gardent la même taille ; seuls leur hauteur à l'écran, leur ombre et leur luminosité indiquent la profondeur.

---

### User Story 2 - Entrer et sortir sans rupture (Priority: P1)

Le joueur passe d'une salle de profil au hangar 2,5D, puis en ressort. À la porte, le mode de la salle est annoncé. Le changement de vue se fait par un court raccord, sans saut sec. Les commandes de la salle s'appliquent dès l'entrée.

**Why this priority**: la cohérence des transitions conditionne l'idée même de mélanger les deux modes.

**Independent Test**: faire dix allers-retours entre le hangar et les salles voisines, par chaque accès, en vérifiant l'annonce, le raccord, la position d'arrivée et le retour à la bonne salle.

**Acceptance Scenarios**:

1. **Given** le joueur dans la salle voisine, **When** il approche de l'accès du hangar, **Then** une indication annonce « SALLE EN PROFONDEUR · W/S : AVANCER / RECULER ».
2. **Given** le joueur qui franchit l'accès, **When** il arrive dans le hangar, **Then** il apparaît sur le sol praticable, devant l'accès emprunté, sans chevaucher un obstacle ni un PNJ.
3. **Given** le joueur qui ressort, **When** il revient dans la salle de profil, **Then** W/S retrouvent leur rôle d'échelle et d'ascenseur, et il se trouve devant la porte qu'il a prise.

---

### User Story 3 - Un hangar vivant en profondeur (Priority: P2)

Les membres d'équipage affectés au hangar, comme Maksim Orlov, s'y déplacent aussi en profondeur : ils vont d'un poste à l'autre en contournant les obstacles, s'arrêtent à leurs postes et restent dans la bonne profondeur quand on leur parle.

**Why this priority**: un hangar en profondeur vide de vie paraîtrait une démo technique ; la circulation des PNJ montre l'intérêt du mode.

**Independent Test**: observer le hangar pendant deux minutes de jeu : chaque PNJ change de poste au moins une fois sans traverser d'obstacle ni le joueur, et reste interrogeable avec E.

**Acceptance Scenarios**:

1. **Given** un PNJ qui change de poste, **When** un obstacle est sur sa route, **Then** il le contourne.
2. **Given** le joueur à portée d'un PNJ dans la même bande de profondeur, **When** il appuie sur E, **Then** le dialogue existant s'ouvre comme dans une salle de profil.
3. **Given** un PNJ et le joueur à des profondeurs différentes mais à la même position horizontale, **When** le joueur appuie sur E, **Then** il ne parle pas au PNJ éloigné en profondeur.

---

### User Story 4 - Reprise et sauvegarde (Priority: P2)

Le joueur sauvegarde ou quitte la partie dans le hangar, puis reprend. Il retrouve sa position, y compris sa profondeur. Une ancienne sauvegarde, faite avant l'existence du mode 2,5D, se charge normalement.

**Why this priority**: AGENTS.md exige de préserver les sauvegardes existantes et la reprise.

**Independent Test**: sauvegarder au fond du hangar, recharger et comparer la position ; charger une sauvegarde antérieure dont le joueur était dans le hangar.

**Acceptance Scenarios**:

1. **Given** une sauvegarde faite au fond du hangar, **When** elle est rechargée, **Then** le joueur réapparaît au même endroit et à la même profondeur.
2. **Given** une ancienne sauvegarde sans profondeur, **When** elle est chargée, **Then** le joueur est placé sur une profondeur par défaut praticable et rien d'autre ne change.

---

### User Story 5 - Échelles et ascenseurs dans une salle en profondeur (Priority: P3)

Dans le hangar, une échelle ou un ascenseur s'utilise en se plaçant à son pied et en appuyant sur E, puisque W/S servent à la profondeur.

**Why this priority**: c'est nécessaire à la cohérence de la règle, mais le hangar en compte peu.

**Independent Test**: utiliser l'ascenseur du hangar avec E depuis son pied, puis vérifier que W/S, au même endroit, déplacent seulement en profondeur.

**Acceptance Scenarios**:

1. **Given** le joueur au pied de l'ascenseur du hangar, **When** il appuie sur E, **Then** l'ascenseur fonctionne comme dans une salle de profil.
2. **Given** le joueur au pied de l'ascenseur, **When** il appuie sur W, **Then** il recule en profondeur et l'ascenseur n'est pas appelé.

### Edge Cases

- Le joueur maintient une direction en franchissant l'accès : le mouvement ne doit pas le pousser hors du sol praticable à l'arrivée.
- Un PNJ occupe le point d'arrivée : le joueur apparaît à la position libre la plus proche.
- Une mise en scène en jeu (`ingame-staging-v188`) se déclenche dans le hangar : les entrées sont retenues de la même manière.
- La fenêtre est redimensionnée ou passe en plein écran : la correspondance entre profondeur et position à l'écran reste juste.
- Mouvement réduit : le raccord de porte se fait sans animation de caméra.
- Manette et commandes tactiles : la profondeur est accessible (stick vertical ; boutons ↑/↓ en salle 2,5D).
- Le remappage des touches (accessibilité V188) : les actions « monter » et « descendre » remappées pilotent la profondeur en salle 2,5D.
- Les crises du hub (créatures à bord) dans le hangar : hors périmètre du prototype ; aucune crise n'est placée dans une salle 2,5D tant que le combat en profondeur n'existe pas.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Le jeu MUST permettre de déclarer, salle par salle, un mode « profil » (2D, comportement actuel) ou « profondeur » (2,5D) ; toutes les salles existantes restent en profil, sauf le hangar du dropship.
- **FR-002**: En salle « profondeur », le joueur MUST pouvoir se déplacer à gauche/droite et vers le fond/l'avant avec les actions « monter »/« descendre » (W/S par défaut), dans les limites d'un sol praticable défini pour la salle.
- **FR-003**: Les objets du décor qui gênent le passage (dropship, caisses, chariots, piliers) MUST avoir une emprise au sol qui bloque le joueur et les PNJ.
- **FR-004**: L'affichage MUST trier les personnages et objets par profondeur : ce qui est plus près de la caméra passe devant.
- **FR-005**: Les sprites MUST garder leur taille à toute profondeur. La profondeur se lit par la hauteur à l'écran, une ombre au sol et un assombrissement léger vers le fond.
- **FR-006**: Le mode d'une salle « profondeur » MUST être annoncé à l'approche de son accès, avec la commande à utiliser.
- **FR-007**: Le passage entre une salle de profil et une salle en profondeur MUST se faire par un raccord visuel court, sans changement d'image instantané. Avec le mouvement réduit, le raccord est un simple fondu.
- **FR-008**: En salle « profondeur », échelles et ascenseurs MUST s'utiliser avec l'action « utiliser » (E) à leur pied ; W/S n'y appellent jamais un ascenseur.
- **FR-009**: Les interactions (E) MUST ne viser qu'un PNJ ou un objet situé dans une bande de profondeur proche du joueur.
- **FR-010**: Les PNJ affectés au hangar MUST circuler en profondeur entre leurs postes en contournant les obstacles et le joueur.
- **FR-011**: La position du joueur dans une salle « profondeur », profondeur comprise, MUST être sauvegardée et restaurée ; une sauvegarde antérieure MUST se charger avec une profondeur par défaut praticable, sans autre changement.
- **FR-012**: Les mises en scène en jeu et la pause MUST retenir aussi le déplacement en profondeur.
- **FR-013**: Le clavier remappé, la manette et les commandes tactiles MUST donner accès au déplacement en profondeur.
- **FR-014**: La règle de tir future en salle « profondeur » MUST être consignée : tir horizontal, cible touchée si elle est dans une bande de profondeur proche, léger recalage du joueur sur cette bande. Elle n'est pas réalisée dans ce prototype, qui n'a pas de combat.
- **FR-015**: Les documents de profondeur existants, qui décrivent une profondeur purement visuelle, MUST être complétés par l'exception des salles « profondeur », sans modifier le comportement des salles de profil.

### Key Entities

- **Mode de salle**: propriété d'une salle (`profil` ou `profondeur`), lue à l'entrée de la salle.
- **Sol praticable**: zone de la salle où le joueur et les PNJ peuvent se tenir ; bornes horizontales et de profondeur.
- **Emprise au sol**: empreinte d'un objet du décor sur le sol praticable, qui bloque les déplacements.
- **Position en profondeur**: coordonnée de profondeur du joueur ou d'un PNJ dans une salle en profondeur ; elle s'ajoute à la position horizontale existante.
- **Poste de PNJ**: point du sol praticable où un PNJ du hangar s'arrête et travaille.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un joueur qui découvre le hangar rejoint le poste d'embarquement en moins de 30 secondes, en contournant au moins un obstacle, sans consigne autre que l'annonce de porte.
- **SC-002**: Sur 10 allers-retours par chacun des accès du hangar, 100 % des arrivées se font sur le sol praticable, sans chevauchement, devant l'accès emprunté.
- **SC-003**: Aucune salle de profil ne change de comportement : l'ensemble des suites automatisées existantes du hub et du jeu passent sans modification de leurs attentes.
- **SC-004**: Une sauvegarde faite dans le hangar se recharge à la même position (écart nul) ; 100 % des sauvegardes de test antérieures se chargent sans erreur.
- **SC-005**: Sur deux minutes d'observation, chaque PNJ du hangar change de poste au moins une fois et n'interpénètre jamais un obstacle, un autre PNJ ou le joueur.
- **SC-006**: Le hangar reste aussi fluide qu'avant sur la même machine et la même configuration : écart de temps d'image moyen mesuré avant/après inférieur à 10 %.

## Assumptions

- Le prototype concerne seulement le hangar du dropship du hub (`dropship-hangar`) ; le quai de Port-Méridien et les cales de mission suivront après évaluation.
- Le hangar ne contient pas de combat pendant le prototype ; aucune crise du hub n'y est placée.
- Les sprites existants (vue de profil) conviennent en salle profondeur, à la manière des jeux à défilement sur sol ; aucune image n'est générée. Les nouveaux éléments de décor nécessaires sont dessinés en primitives (placeholders).
- Les PNJ conservés sont ceux que le hub place déjà dans le hangar ; leurs routines horaires restent la source de leurs déplacements.
- Les annonces et textes nouveaux sont fournis en français et en anglais.
- La profondeur de la salle est assez courte pour que le personnage reste lisible au fond : le sol praticable occupe environ le tiers inférieur de l'image.
- Frontier Forge (éditeur) n'édite pas les salles en profondeur dans ce prototype.
