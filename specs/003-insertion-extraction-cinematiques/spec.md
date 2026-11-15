# Feature Specification: Insertion et extraction cinématiques — Tantalus ↔ dropship ↔ sol

**Feature Branch**: `worktree-agent-a05e3b511f604fc7e` (branche de travail de l'agent)

**Created**: 2026-11-15

**Status**: Draft — partie application livrée ; atterrissage et embarquement dans le niveau confiés au moteur (autre agent)

**Input**: Demande du propriétaire : « améliorer grandement les insertions, en cinématique et en cinématique en jeu ». Depuis le Tantalus, le dropship est largué en orbite, entre dans l'atmosphère ; les écrans du cockpit et de navigation sont visibles comme dans *Aliens*. La séquence dépend du dropship et de l'APC. L'extraction fait l'inverse. Visible en jeu, dynamique, cinématographique, fidèle à la franchise et au lieu de la mission.

Décisions du propriétaire (2026-11-15) :

1. Séquence complète (≈ 45–60 s) la première fois sur chaque monde, puis courte (≈ 12–15 s). Échap passe à tout moment. Option « toujours la version complète ». Mondes vus suivis dans la sauvegarde par un champ additif.
2. Type de lieu tiré des données du monde : planète avec atmosphère (entrée atmosphérique, échauffement, plasma, turbulences, nuages, météo du monde) ; lune ou astéroïde sans air (descente propulsée) ; vaisseau ou station (approche et amarrage). Un monde sans indicateur clair reçoit une correspondance additive [PROPOSÉ].
3. Rendu mixte : plans extérieurs, plans cockpit et soute avec écrans animés, puis passage au jeu à l'atterrissage (autre agent).
4. APC : si la mission déploie le M577, le dropship le porte sous son ventre et le largue à l'atterrissage ; sinon, les marines descendent par la rampe. L'extraction fait le miroir.
5. Art : pas de génération d'image. Primitives Canvas comme placeholders, chaque visuel passant par un emplacement nommé, documenté pour un générateur futur.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Première insertion sur un monde à atmosphère (Priority: P1)

Le joueur lance une opération sur Acheron. Après le plan d'insertion habituel, une séquence plein écran montre la baie de largage du Tantalus, le cockpit avant largage, le largage, l'orbite, l'entrée atmosphérique (plasma, échauffement, secousses), la soute de troupe, le cockpit en descente dans la tempête, puis la zone d'atterrissage. Le jeu reprend la main à l'atterrissage.

**Why this priority**: c'est le cœur de la demande, et le cas le plus fréquent (45 mondes sur 64).

**Independent Test**: lancer une opération sur un monde à atmosphère jamais visité ; la séquence complète dure entre 45 et 60 s ; le niveau démarre ensuite.

**Acceptance Scenarios**:

1. **Given** un monde jamais visité, **When** l'opération démarre, **Then** la séquence complète joue, avec le nom et les coordonnées du monde sur l'écran NAV et sa météo à l'écran.
2. **Given** la séquence en cours, **When** l'altitude baisse, **Then** l'altimètre, la vitesse, l'assiette, le terrain filaire et les alertes suivent la même descente.
3. **Given** la séquence terminée, **When** le niveau démarre, **Then** `engine.start` reçoit `insertionHandoverV188 = { mode, placeType, dropshipId: 'ud4l', short }`.

---

### User Story 2 - Version courte et option (Priority: P1)

Sur un monde déjà vu, la séquence courte (≈ 13 s) joue. L'option « Insertions : toujours la version complète » rejoue la version longue.

**Independent Test**: lancer deux opérations sur le même monde ; la seconde est courte ; cocher l'option ; la troisième est complète.

**Acceptance Scenarios**:

1. **Given** un monde dans `insertionSeenWorldIdsV188`, **When** l'opération démarre, **Then** la version courte joue.
2. **Given** l'option activée, **When** l'opération démarre, **Then** la version complète joue.
3. **Given** une ancienne sauvegarde sans ces champs, **When** elle est chargée, **Then** elle se charge, sans monde vu et option désactivée.

---

### User Story 3 - Sans atmosphère et dans l'espace (Priority: P1)

Sur une lune sans air, pas d'entrée atmosphérique : descente propulsée, ciel noir. Sur un vaisseau ou une station : approche, réticule d'amarrage et amarrage par la rampe arrière, sans descente.

**Independent Test**: lancer une opération sur Hiémale (sans air) puis sur l'USCSS Nostromo (espace).

**Acceptance Scenarios**:

1. **Given** un monde `vacuum` hors station, **When** la séquence joue, **Then** aucun plasma, nuage ni pluie n'apparaît et l'alerte « RÉTROFUSÉES » s'affiche.
2. **Given** une station ou un vaisseau, **When** la séquence joue, **Then** l'écran affiche une distance à la cible au lieu d'une altitude et se termine par l'amarrage.

---

### User Story 4 - Le M577 sous le ventre (Priority: P2)

Si la mission déploie le M577, il est visible sous le dropship dans les plans extérieurs, dans la soute ventrale depuis la soute de troupe, puis largué au contact.

**Acceptance Scenarios**:

1. **Given** le M577 sélectionné et un gabarit qui le déploie, **When** la séquence joue, **Then** `mode = 'apc'`, l'alerte « M577 ARRIMÉ » s'affiche et l'APC est largué à l'atterrissage.
2. **Given** un gabarit de vaisseau, une opération solo ou un autre véhicule, **Then** `mode = 'foot'` et les marines descendent par la rampe.

---

### User Story 5 - Extraction (Priority: P2)

Quand le moteur signale la fin de l'embarquement (`extraction-boarding-complete-v188`), la séquence de montée joue (décollage, montée, retour à la baie du Tantalus), courte si le monde a déjà été vu en extraction, puis le bilan s'affiche. Sans cet événement, le déroulement actuel est inchangé.

**Acceptance Scenarios**:

1. **Given** l'événement d'embarquement, **When** il arrive, **Then** la mission est mise en pause et la séquence d'extraction joue avant la reprise.
2. **Given** aucune émission de l'événement, **When** la mission se termine, **Then** le bilan suit le flux existant.

---

### User Story 6 - Accessibilité (Priority: P1)

Sous-titres toujours affichés (FR/EN) ; mouvements réduits : pas de secousse ni d'éclair, mouvements de caméra adoucis ; alertes lisibles en mode daltonien (forme + couleur) ; Échap, Entrée ou bouton tactile de 44 px pour passer.

### Edge Cases

- Reprise d'une mission en cours : aucune séquence, aucun atterrissage (`insertionHandoverV188 = null`).
- Changement de profil pendant la séquence : le lancement est annulé.
- QZ-17 (CIN-10 non vue) : la séquence reste courte avant la cinématique d'approche du chapitre.
- Forge et playtest : aucune séquence.
- Opération à moteur sans dropship (événement jamais émis) : flux d'extraction actuel.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Le type de lieu DOIT être dérivé de chaque monde (atmosphère, biome, objectif d'abordage), avec une table additive [PROPOSÉ] pour les mondes sans indicateur.
- **FR-002**: La séquence DOIT afficher le monde, ses coordonnées, sa météo, ses couleurs de ciel et de terrain et son heure locale.
- **FR-003**: Les écrans DOIVENT être alimentés par un unique état de vol.
- **FR-004**: Version complète au premier passage sur un monde, courte ensuite, option « toujours complète » ; suivis séparés insertion/extraction dans des champs additifs.
- **FR-005**: Chaque visuel DOIT passer par un emplacement d'art nommé ; une image n'est demandée que si son fichier est déclaré présent.
- **FR-006**: Le contrat `insertionHandoverV188` DOIT être passé à `engine.start` ; l'événement d'embarquement DOIT déclencher l'extraction, sinon rien ne change.
- **FR-007**: Les modules du moteur de mission ne DOIVENT pas être modifiés par ce travail ; ni les modules Forge épinglés.
- **FR-008**: Textes joueur en FR et EN.
- **FR-009**: Aucune affirmation de fidélité « 1:1 » ; tableau de fidélité dans la bible.

### Key Entities

- **Profil de monde** : nom, secteur, type de lieu, météo, heure, couleurs, coordonnées.
- **Séquence** : direction, type de lieu, mode (pied/APC), longueur, plans.
- **État de vol** : progression de descente, altitude ou distance, vitesse, assiette, échauffement, turbulence, compte à rebours, alertes.
- **Emplacement d'art** : id, usage, taille, couche, brief, chemin.

## Success Criteria *(mandatory)*

- **SC-001**: 100 % des mondes reçoivent un type de lieu ; les trois types sont représentés.
- **SC-002**: Versions complètes entre 45 et 60 s, courtes entre 12 et 15 s, pour les trois types et les deux directions.
- **SC-003**: Passer la séquence ramène au jeu en moins d'une image.
- **SC-004**: Le temps de dessin d'une image reste sous 4 ms au 95e centile dans le navigateur de test ; intervalle moyen proche de 16,7 ms.
- **SC-005**: Les anciennes sauvegardes se chargent sans erreur.

## Assumptions

- L'atterrissage dans le niveau (dropship posé, rampe, marines ou APC qui sortent, prise de contrôle) et l'embarquement d'extraction sont réalisés par l'agent moteur.
- Les images définitives seront produites plus tard par un autre outil.
- Le pilote est Maksim Orlov (CIN-03) ; les répliques radio sont [PROPOSÉ].
