# Feature Specification: Cales de QZ-17 en profondeur, avec combat

**Feature Branch**: `claude/nifty-shannon-qpy1hl` (branche de travail existante)

**Created**: 2026-11-14

**Status**: Draft

**Input**: User description: "Continue à fond" — prochaine salle hybride annoncée après le hangar et le quai (spec 001, bible §56.12) : les cales à conteneurs de QZ-17 (Acte I, « La cargaison fantôme »), cette fois avec combat. Décisions déjà prises par le propriétaire (2026-11-13) :

- W/S avancent et reculent en profondeur ; échelles et ascenseurs s'utilisent avec E à leur pied.
- Tir horizontal avec alignement automatique sur une bande de profondeur proche.
- Pas de mise à l'échelle des sprites.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Explorer la cale entre les rangées de conteneurs (Priority: P1)

En mission QZ-17, Echo-9 entre dans la cale. Il s'y déplace à gauche et à droite et en profondeur, entre des rangées de conteneurs scellés qui bloquent le passage et masquent ce qui se trouve derrière eux. Les autres sections du vaisseau restent de profil.

**Why this priority**: c'est le cœur du mode profondeur appliqué à une mission. Sans lui, pas de cale à évaluer.

**Independent Test**: lancer QZ-17, rejoindre la cale, la traverser dans les deux sens et en profondeur, en contournant au moins deux rangées de conteneurs ; en sortir par un accès au mur.

**Acceptance Scenarios**:

1. **Given** Echo-9 dans la cale, **When** il maintient W ou S, **Then** il se déplace en profondeur dans les bornes du sol et s'arrête contre les conteneurs.
2. **Given** Echo-9 derrière une rangée, **When** on regarde l'écran, **Then** les conteneurs le masquent et son contour reste visible.
3. **Given** Echo-9 hors de la cale, **When** il appuie sur W ou S, **Then** le comportement de profil d'origine s'applique (échelles, ascenseurs).

---

### User Story 2 - Le tir à alignement automatique en profondeur (Priority: P1)

Echo-9 tire à l'horizontale, comme partout. Dans la cale, sa salve touche un xénomorphe s'il se trouve dans une bande de profondeur proche ; Echo-9 se recale alors légèrement vers cette bande. Un conteneur placé entre le tireur et la cible arrête la salve.

**Why this priority**: c'est la règle de tir que le propriétaire a choisie. Sans elle, le combat en profondeur n'est pas lisible.

**Independent Test**: sur une cible fixe de test, tirer depuis la même bande (touché), depuis une bande éloignée (manqué), puis à travers un conteneur (arrêté).

**Acceptance Scenarios**:

1. **Given** une cible à moins de 22 unités de profondeur, **When** Echo-9 tire vers elle, **Then** elle est touchée et Echo-9 se recale de 30 % vers sa profondeur.
2. **Given** une cible à plus de 22 unités de profondeur, **When** Echo-9 tire, **Then** la salve passe sans la toucher.
3. **Given** un conteneur sur la ligne de tir, dans la bande, **When** Echo-9 tire, **Then** la salve s'arrête au conteneur.

---

### User Story 3 - Des xénomorphes qui utilisent la profondeur (Priority: P1)

Dans la cale, les xénomorphes avancent aussi en profondeur. Ils contournent les conteneurs et peuvent surgir de derrière une rangée. Une attaque au corps à corps ne porte que si l'attaquant est dans la bande de profondeur d'Echo-9. Leurs comportements de caste existants (rôdeur, embusqué, drone au plafond) restent valables. Le plafond reste un plan de profil.

**Why this priority**: sans ennemis en profondeur, Echo-9 pourrait éviter tout combat en changeant de bande. La profondeur doit aussi servir la peur (surgir de derrière un conteneur).

**Independent Test**: placer un xénomorphe de chaque caste admissible dans la cale ; vérifier qu'il rejoint la bande d'Echo-9 en contournant les conteneurs, qu'il n'attaque qu'à portée et dans la bande, et qu'il reste masqué derrière un conteneur.

**Acceptance Scenarios**:

1. **Given** un xénomorphe dans une autre bande de profondeur, **When** il poursuit Echo-9, **Then** il rejoint sa bande sans traverser de conteneur.
2. **Given** un xénomorphe à portée horizontale mais hors de la bande, **When** il frappe, **Then** l'attaque ne porte pas.
3. **Given** un xénomorphe derrière une rangée, **When** Echo-9 regarde l'écran, **Then** il ne le voit pas ; le détecteur de mouvement le signale.

---

### User Story 4 - Le détecteur de mouvement en profondeur (Priority: P2)

Dans la cale, le détecteur de mouvement prend en compte la profondeur dans la distance des contacts. Un contact caché derrière un conteneur y apparaît comme un écho, comme ailleurs.

**Why this priority**: l'outil de peur central d'Aliens doit rester juste dans le nouveau mode.

**Independent Test**: un contact fixe à la même position horizontale mais à 60 unités de profondeur apparaît plus loin qu'un contact dans la même bande.

**Acceptance Scenarios**:

1. **Given** deux contacts à la même position horizontale, l'un dans la bande d'Echo-9 et l'autre à 60 unités, **When** le détecteur est actif, **Then** le second apparaît plus loin.

---

### User Story 5 - Reprise de mission (Priority: P2)

Un point de passage ou une sauvegarde de mission pris dans la cale conserve la profondeur d'Echo-9. Une reprise antérieure se charge normalement, au mur.

**Why this priority**: AGENTS.md exige de préserver la reprise de mission.

**Independent Test**: sauvegarder au fond de la cale, recharger, comparer ; charger une reprise antérieure à la fonctionnalité.

**Acceptance Scenarios**:

1. **Given** une reprise prise à 60 unités de profondeur, **When** elle est rechargée, **Then** Echo-9 est à la même position et à la même profondeur.

### Edge Cases

- Un xénomorphe tué derrière un conteneur : son cadavre reste masqué.
- Un projectile ennemi (acide de cracheur) : soumis à la même bande de profondeur que les tirs du joueur.
- Coop locale (P2) : chaque marine a sa propre profondeur ; ses tirs suivent la même règle.
- Aide à la visée : elle ne choisit que des cibles dans la bande de profondeur.
- Mouvement réduit : pas de secousse supplémentaire ; le recalage de tir reste visible mais sans animation.
- Une crise de caste (Reine, Crusher) ne doit pas être placée dans la cale tant que leurs comportements ne sont pas adaptés à la profondeur.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Le moteur de mission MUST pouvoir déclarer une section de niveau « profondeur ». Seule la cale de QZ-17 l'est ; tout le reste du niveau et des autres missions garde le comportement de profil.
- **FR-002**: Dans la cale, Echo-9 MUST se déplacer en profondeur avec les actions « monter »/« descendre », dans les bornes du sol, en étant bloqué par les emprises des conteneurs.
- **FR-003**: Le rendu de la cale MUST trier personnages, xénomorphes et conteneurs par profondeur, sans mise à l'échelle. Le contour d'Echo-9 reste visible quand il est masqué.
- **FR-004**: Un tir d'Echo-9 dans la cale MUST ne toucher qu'une cible à au plus 22 unités de profondeur (bande de tir). Le tireur se recale alors de 30 % vers la cible.
- **FR-005**: Un conteneur situé entre le tireur et la cible, dans la bande de tir, MUST arrêter la salve.
- **FR-006**: Dans la cale, les xénomorphes MUST se déplacer en profondeur pour rejoindre la bande de leur cible en contournant les emprises. Leurs attaques MUST ne porter que dans la bande d'attaque. Les comportements de caste existants sont conservés, et les castes non adaptées sont exclues de la cale.
- **FR-007**: L'aide à la visée et les projectiles ennemis MUST respecter la même bande de profondeur.
- **FR-008**: Dans la cale, le détecteur de mouvement MUST inclure la profondeur dans la distance des contacts.
- **FR-009**: La profondeur d'Echo-9 MUST être sauvegardée avec la reprise de mission, de façon additive. Une reprise antérieure place Echo-9 au mur.
- **FR-010**: À l'approche de la cale, l'annonce du mode MUST s'afficher (« SALLE EN PROFONDEUR · W/S : AVANCER / RECULER »).
- **FR-011**: Les conteneurs de la cale MUST rester cohérents avec l'Acte I : conteneurs scellés, marqués « QZ17 », comme dans CIN-31. Ils sont dessinés en primitives (placeholders), sans génération d'image.

### Key Entities

- **Section profondeur** : plage horizontale d'un niveau de mission, avec bornes de profondeur, emprises et objets.
- **Bande de tir / bande d'attaque** : écart de profondeur maximal pour qu'un tir ou une attaque porte.
- **Profondeur d'un acteur** : coordonnée `z` d'Echo-9, d'un marine coop ou d'un xénomorphe dans la section.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Sur 20 tirs de test, 100 % des cibles dans la bande sont touchées ; aucune cible hors bande ni aucune cible derrière un conteneur ne l'est.
- **SC-002**: Sur 2 minutes d'observation avec trois xénomorphes, aucun ne traverse un conteneur ni ne touche Echo-9 hors de sa bande.
- **SC-003**: Aucune autre mission ni autre section de QZ-17 ne change de comportement : toutes les suites automatisées existantes passent sans modifier leurs attentes.
- **SC-004**: Une reprise prise dans la cale se recharge à la même profondeur ; 100 % des reprises de test antérieures se chargent.
- **SC-005**: Dans la cale, la fluidité reste proche de l'existant : écart de temps d'image < 10 % mesuré dans la même page (même protocole que la spec 001).

## Assumptions

- La section « cale » est choisie dans le niveau généré de QZ-17 parmi les sections existantes, en gardant ses accès, ses échelles et ses portes sur le rail.
- Les castes admissibles dans la cale sont celles dont le comportement est horizontal (drone, guerrier, rôdeur, embusqué). Le drone au plafond reste sur son plan.
- Les règles et valeurs de la spec 001 (bornes −80/0, bande d'interaction 24, bande de tir 22, recalage 30 %) sont reprises.
- Frontier Forge n'édite pas les sections en profondeur.
