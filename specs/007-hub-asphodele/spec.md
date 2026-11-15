# Feature Specification: Hub Asphodèle (première version atteignable), missions de la station, contrats « Relais en dérive », CIN-70 à CIN-72

**Feature Branch**: branche de travail existante (spec `007-hub-asphodele`), partie 2 du front Asphodèle après `specs/005-front-asphodele-quetes/` (commit `b6f2d14`).

**Created**: 2026-11-15

**Status**: Draft — première version jouable, art en placeholders Canvas.

**Input**: point n° 1 du « reste à faire » de §7.5 et de `docs/development/AUDIT_CONTENU_V188.md` ; options **(Recommandé)** du questionnaire : Q22 (A : construire les modules directement dans le moteur du hub), Q23 (A : anneau et rayons en couloirs de profondeur V2, modules en V1, tout parcouru à pied), Q30 (A, différé : commerce par l'économie existante), Q59 (A : la Forge reste en attente). Bible : §7.2, §7.3, §7.4, §10, §42, §56.12.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Rejoindre Asphodèle et la parcourir (Priority: P1)

Après S4, au hangar du Tantalus, devant l'UD-4L, le dialogue d'embarquement propose « NAVETTE · STATION ASPHODÈLE ». Echo-9 arrive au sas 1 des quais d'arrimage, traverse l'anneau extérieur et le rayon A jusqu'au pont de contrôle, entre dans les modules ouverts, puis revient à l'UD-4L et rentre au hangar du Tantalus.

**Why this priority**: §7.1 fait d'Asphodèle le second hub ; §42.1 exige qu'aucun module ne soit atteint par un simple menu.

**Independent Test**: sauvegarde « S4 terminée, Tantalus en orbite de Cocyte » ; aller, parcours de chaque porte, rechargement à bord de la station, retour.

**Acceptance Scenarios**:

1. **Given** S4 non terminée, **When** j'ouvre le dialogue d'embarquement, **Then** aucune navette n'est proposée.
2. **Given** S4 terminée et le Tantalus hors de Cocyte (ou un saut en charge, ou une opération en cours), **Then** le bouton de navette est grisé avec sa raison.
3. **Given** la navette, **When** je la prends, **Then** j'arrive centré sur le sas 1, l'UD-4L visible derrière le hublot, et la pose du hangar est conservée pour le retour.
4. **Given** une porte ouverte, **When** j'appuie sur E devant elle, **Then** j'arrive centré sur la porte correspondante de la pièce cible, au mur, et la même porte me ramène.
5. **Given** une porte scellée, **When** j'appuie sur E, **Then** je reste dans la pièce et sa raison est affichée (invite et message).
6. **Given** que je recharge à bord, **Then** je reprends dans la même pièce, à la même position et à la même profondeur.
7. **Given** le sas 1, **When** j'appuie sur E, **Then** je reviens au hangar du Tantalus, à la pose d'avant le départ.

### User Story 2 - Missions de la station et contrats (Priority: P1)

Au pont de contrôle, la carte du réseau QZ liste les sept missions annexes de §7.2 et les six contrats locaux ; une mission ouverte se planifie et part, comme toute opération, du hangar du Tantalus. Chaque contrat réussi est compté ; trois « Relais en dérive » ouvrent la salle des relais.

**Acceptance Scenarios**:

1. **Given** S4 non terminée, **Then** aucune de ces missions n'est proposée dans les listes ni lançable.
2. **Given** CASSIUS bridé ou effacé, **Then** « Ce que CASSIUS a vu » est fermé ; effacé, « Accès administrateur » aussi.
3. **Given** deux contrats « Relais en dérive » réussis, **Then** la salle des relais reste scellée ; au troisième, elle s'ouvre.
4. **Given** « Les journaux de l'équipage », « La serre », « Le pacte de l'anneau » (pacte accepté auprès de Grue aux quais), **Then** le mémorial, la serre et le marché s'ouvrent.

### User Story 3 - « Transmettre » devient possible (Priority: P1)

Dans la salle des relais, E sur les baies de transmission met le relais en ligne. Le prédicat `asphodeleRelayReadyV188(save)` devient vrai ; l'option finale *Transmettre* (Acte V, spec 006) le lit. Cette feature ne construit ni le choix final ni les fins.

### User Story 4 - CIN-70 à CIN-72 et la plaque de Kessler (Priority: P2)

CIN-70 suit la quête « Six heures » de Rook ; CIN-71 précède la décision CASSIUS ; CIN-72 précède la scène de retour de S3. Une sauvegarde qui a dépassé ces moments n'y est pas renvoyée. Après S3, le casier d'Echo-8 du Tantalus propose « DÉPOSER LA PLAQUE DE KESSLER » (§7.4).

### Edge Cases

- Ancienne sauvegarde sans `asphodeleHubV188` : chargée à bord du Tantalus, aucun contrat.
- Sauvegarde éditée « à bord de la station » sans S4, ou dans un module scellé : ramenée au Tantalus, ou aux quais.
- Opération lancée depuis la station : l'UD-4L rentre d'abord au Tantalus [PROPOSÉ].
- Écriture refusée pendant le parcours : « SAUVEGARDE BLOQUÉE · E pour réessayer », comme au quai de Port-Méridien.
- Profil Forge, playtest ou créateur : le hub Asphodèle reste inactif.

## Requirements *(mandatory)*

- **FR-001**: Le hub s'ouvre après S4 ; la navette part du hangar du Tantalus quand le Tantalus est dans le système de Cocyte.
- **FR-002**: Neuf pièces : quais (V2), anneau (V2), rayon A (V2), pont de contrôle, salle des relais, laboratoire de transit, mémorial, serre, marché (V1). Les autres modules de §42.2 sont des portes scellées visibles (quartiers, infirmerie, ponts inférieurs, hangar de réparation).
- **FR-003**: Chaque porte correspond à une porte dessinée, à une interaction E au mur et à une porte de retour ; une porte scellée donne sa raison.
- **FR-004**: Sept missions annexes et six contrats ajoutés au catalogue, sans changer aucun identifiant existant ; contrats rejouables et comptés.
- **FR-005**: `asphodeleRelayReadyV188(save)` exporté ; `finalChoiceOptionsV188` l'utilise par défaut.
- **FR-006**: CIN-70, CIN-71 et CIN-72 dans le système de cinématiques existant, passables et rejouables, sans récompense.
- **FR-007**: Champ de sauvegarde additif `asphodeleHubV188` ; aucun format existant modifié.
- **FR-008**: Textes joueur en FR et EN ; art via emplacements nommés (`src/asphodele-hub-slots-v188.js`), 1 m ≈ 51 px.
- **FR-009**: Aucun module Forge épinglé modifié ; aucun `scripts/audit-*.mjs` modifié.

## Success Criteria *(mandatory)*

- **SC-001**: Parcours clavier Chromium : aller, toutes les portes ouvertes franchies, retour, reprise après rechargement.
- **SC-002**: `scripts/verify-asphodele-hub-v188.mjs` passe, dont une traversée physique de chaque porte avec la physique d'annexe réelle.
- **SC-003**: Temps de trame (mise à jour + dessin) mesuré dans deux pièces de la station et comparé à des pièces du Tantalus sur la même machine.

## Assumptions

- La navette n'a pas de coût en temps ni en carburant [PROPOSÉ] : la station est dans l'orbite de Cocyte.
- Les missions annexes et les contrats utilisent le gabarit d'intérieur de vaisseau et des objectifs existants ; leur décor n'est pas encore celui de la station.
