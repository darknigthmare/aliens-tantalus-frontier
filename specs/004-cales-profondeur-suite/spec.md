# Feature Specification: Autres cales de mission en profondeur

**Feature Branch**: branche de travail existante (spec `004-cales-profondeur-suite`)

**Created**: 2026-11-15

**Status**: Draft

**Input**: décision Q31 du propriétaire (2026-11-15) : les prochaines salles en profondeur sont d'autres cales et soutes de mission, choisies après une évaluation jouée de la cale de QZ-17 (spec 002), où le combat en profondeur fonctionne déjà. Contraintes reprises des specs 001 et 002 : W/S avancent et reculent en profondeur, le tir s'aligne seul sur une bande proche, les sprites ne sont jamais mis à l'échelle. Les objets du sol sont dessinés en primitives Canvas ; la génération d'image est exclue pour l'instant et passe par des emplacements d'art nommés.

## Choix des cales

L'analyse des gabarits de mission existants (voir [research.md](research.md), R2) retient :

1. **La cale des cargos** (`freighter-cargo-hold`) : le pont bas de la zone `ship-cargo` du gabarit `ship-interior-vertical`, dans les missions procédurales FRONTIER et MIRE dont le gabarit propre est le vaisseau (214 des campagnes de `src/content.js`). Même géométrie que QZ-17, avec une couverture de caisses, une caisse de munitions, un conduit et une porte arrière au mur.
2. **La cale de quarantaine de Léthé** (`lethe-quarantine-hold`) : la même soute dans « Systèmes de survie Alien » (`special-alien-survival-systems`), avec ses portes soudables, sa pression, son acide persistant et sa trousse de soudage.

Écartées :

- **Cargo Brutal** reste en 2D : le P-5000 et ses conteneurs Alpha, Bravo et Charlie occupent le couloir de la soute (voir R2).
- **Colonie** : le gabarit `colony-multiroute` n'a pas d'entrepôt ; ses galeries techniques sont des tunnels à conduits.
- **Missions de ruche** (JERI, A.T.A.X.-Q, Éloïse) : le joueur y est une créature qui marche aux murs et au plafond.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Traverser la cale d'un cargo en profondeur (Priority: P1)

Dans une mission de vaisseau procédurale, Echo-9 entre dans la soute basse. Il s'y déplace en profondeur entre deux piles de caisses et un râtelier de fûts, ressort par les sas au mur et revient sur ses pas.

**Why this priority**: c'est la cale la plus fréquente du jeu ; elle porte la décision Q31.

**Independent Test**: lancer une mission de vaisseau FRONTIER ou MIRE, entrer dans la soute avec les touches réelles, la traverser devant et derrière les objets, en sortir par le sas est puis revenir par le sas ouest.

**Acceptance Scenarios**:

1. **Given** Echo-9 dans la soute, **When** il maintient W ou S, **Then** il change de profondeur et s'arrête contre les objets.
2. **Given** Echo-9 loin du mur, **When** il marche vers un sas, **Then** il s'arrête au bord de la soute ; près du mur, il passe.
3. **Given** une interaction au mur (munitions, porte), **When** Echo-9 est dans une voie avant, **Then** aucune invite n'est proposée.

---

### User Story 2 - Combattre dans ces cales avec les règles de QZ-17 (Priority: P1)

Les tirs, les coups, la recherche de bande des xénomorphes, le détecteur et l'occultation suivent les règles de la spec 002. Les dormeurs de la soute attendent derrière ou devant les objets.

**Independent Test**: cible dans la bande touchée, hors bande manquée, arrêtée par une pile de caisses ; un xénomorphe rejoint la bande d'Echo-9 sans traverser d'objet.

**Acceptance Scenarios**:

1. **Given** une cible à 6 unités, **When** Echo-9 tire, **Then** elle est touchée et Echo-9 se recale de 30 %.
2. **Given** une pile de caisses sur la ligne de tir, dans sa bande, **When** Echo-9 tire, **Then** la salve s'arrête.
3. **Given** une Reine ou une autre caste trop grande pour circuler entre les objets, **When** elle est dans la soute d'une cale de la spec 004, **Then** elle occupe toute la profondeur : elle touche et peut être touchée depuis toutes les voies.

---

### User Story 3 - L'acide de la quarantaine en profondeur (Priority: P2)

Dans la cale de Léthé, l'acide d'une créature tuée reste là où elle est tombée, à sa profondeur. Il ne brûle qu'un marine dans sa bande.

**Independent Test**: tuer une créature à −60 ; marcher au mur au-dessus de la flaque (pas de dégâts), puis à −60 (dégâts).

---

### User Story 4 - Sauter et reprendre (Priority: P2)

Un saut dans une voie avant garde la profondeur : Echo-9 reste dessiné à sa profondeur et ses tirs restent dans leur bande. Une reprise prise au milieu d'une cale rend la même profondeur et la profondeur de l'acide.

### Edge Cases

- Un ennemi qui bondit ou tombe du pont de service au-dessus de la soute garde ou reçoit une profondeur pendant le vol.
- Coop locale : deux marines qui tirent depuis deux profondeurs ; chaque salve garde sa bande, et c'est le tireur qui se recale.
- Couverture de caisses du rail : elle reste sautable près du mur et se contourne plus loin, comme dans la spec 002.
- Reprise antérieure à la spec 004 : pas de profondeur d'acide, la flaque reste au rail et brûle comme avant.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Chaque cale MUST être une définition de données : campagnes concernées, mesure de la plage horizontale et du sol sur le niveau généré, bornes de profondeur, objets (nombre, taille, emprise), contraintes de voie et emplacements des dormeurs. Un constructeur unique produit la section.
- **FR-002**: QZ-17 MUST garder exactement la section de la spec 002 et ses tests inchangés.
- **FR-003**: Portes, échelles et interactions MUST rester au rail (z = 0), atteintes depuis la bande de porte (20) ou d'interaction (24).
- **FR-004**: Chaque objet MUST laisser une voie d'au moins 20 unités devant et derrière lui, ou toucher le bord avant.
- **FR-005**: Un objet qui dépasse la ligne du mur MUST se tenir devant un mur nu : ni cadre de porte, ni conduit, ni porte arrière, ni ramassage, ni couverture, ni échelle, ni poste.
- **FR-006**: L'accès logique, le passage physique, l'aller-retour et la reprise MUST fonctionner : les deux sas sont atteints, aucun recoin du sol n'est isolé.
- **FR-007**: Les tailles MUST suivre l'échelle du projet : 1 m ≈ 51 px en largeur et en hauteur, environ 22 unités de profondeur par mètre.
- **FR-008**: Une caste non admise entre les objets (Reine, Crusher, Praetorian, Titan, boss, largeur > 120 px) MUST occuper toute la profondeur dans les cales de la spec 004.
- **FR-009**: Dans la cale de Léthé, une flaque d'acide créée sur le sol de la soute MUST porter la profondeur de sa source et ne brûler que dans la bande de 24.
- **FR-010**: Un acteur en l'air au-dessus du sol de la cale MUST garder sa profondeur pour le dessin, les tirs et les coups.
- **FR-011**: Les objets MUST être dessinés en primitives et passer par des emplacements d'art nommés (`{ id, purpose, width, height, layer, brief }`), avec un repli ; aucun fichier n'est demandé tant qu'il n'est pas livré.
- **FR-012**: Le format de sauvegarde et les identifiants de contenu MUST rester inchangés ; les ajouts de reprise sont additifs.

### Key Entities

- **Définition de cale** : identifiant, campagnes, bornes, objets placés par règle, emplacements des dormeurs, règle des grandes castes.
- **Emplacement d'art** : identifiant, rôle, taille, calque, consigne de production.

## Success Criteria *(mandatory)*

- **SC-001**: Sur six niveaux de cargo générés et la cale de Léthé, aucun objet ne viole la règle de voie ni ne masque un élément du mur ; les deux sas sont atteints.
- **SC-002**: Les suites existantes des specs 001 et 002 passent sans changer leurs attentes.
- **SC-003**: Dans chaque nouvelle cale, l'écart de temps d'image entre mixin actif et inerte reste sous 10 %, mesuré dans la même page en ordre alterné.
- **SC-004**: Une reprise prise au milieu d'une cale se recharge à la même profondeur.

## Assumptions

- Les missions procédurales de vaisseau gardent la même soute ; le gabarit propre de la campagne décide (c'est celui que choisit l'application).
- Le texte joueur n'est pas modifié : les objets portent des codes et pictogrammes (C-21, UN 3373), sans traduction à ajouter.
- Frontier Forge n'édite pas les sections en profondeur.
