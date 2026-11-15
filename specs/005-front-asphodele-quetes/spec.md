# Feature Specification: Front station Asphodèle, premières quêtes de l'équipage et temps de voyage

**Feature Branch**: branche de travail existante (spec `005-front-asphodele-quetes`)

**Created**: 2026-11-15

**Status**: Draft

**Input**: audit du contenu `docs/development/AUDIT_CONTENU_V188.md` (manques 1, 2 et 5) et décisions par défaut du questionnaire : Q6 (S1-S4 comme missions, avant le hub), Q7 (choix CASSIUS définitif), Q9 (quêtes de DAVID-8R, Harlow, Rook et Vega d'abord), Q21 (coût fixe par saut, en carburant et en jours, affiché avant le départ), Q79 (art provisoire en primitives Canvas), Q103 (feature Spec Kit pour la station). Bible : §7.2, §7.4, §5.7.1, §8, §13.2.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reprendre la station Asphodèle (Priority: P1)

Après l'Acte II, Echo-9 écoute avec Rook l'enregistrement d'Echo-8, puis lance depuis la table de briefing les quatre missions de la station, dans l'ordre. Après S2, il décide une fois du sort de CASSIUS. Après S4, la station est reprise.

**Why this priority**: une pièce du dossier QZ17 et la condition « Asphodèle reprise » de l'option finale *Transmettre* étaient injouables.

**Independent Test**: sauvegarde de fin d'Acte II ; quête de Rook ; S1 à S4 ; choix CASSIUS ; rechargement entre chaque étape.

**Acceptance Scenarios**:

1. **Given** l'Acte II non terminé, **When** j'ouvre le Commandement, **Then** aucune mission de station n'est proposée et le panneau indique « Ouvre après l'Acte II ».
2. **Given** l'Acte II terminé sans la quête de Rook, **When** je lance S1, **Then** le lancement est refusé avec l'indication de la quête.
3. **Given** S2 réussie, **When** j'ouvre le Commandement, **Then** la décision CASSIUS s'affiche, ne peut pas être fermée sans choix, et la pièce « Ordres de livraison archivés par CASSIUS » est acquise.
4. **Given** une mission de station en cours, **When** je recharge, **Then** elle reprend (elle reste listée même si son verrou s'appliquerait).

### User Story 2 - Quêtes de l'équipage (Priority: P1)

Dans la conversation du hub, Rook, Vega, Harlow et DAVID-8R proposent leur quête après leur acte. Une quête d'analyse se résout en lisant les éléments ; une mauvaise lecture ne coûte rien et ne paie rien. DAVID-8R attend trois composants ramenés d'opérations réussies sur Cocyte.

**Acceptance Scenarios**:

1. **Given** la quête de Rook terminée, **Then** « Six heures de silence » est jouée et S1 s'ouvre.
2. **Given** la quête de Vega terminée, **Then** sa loyauté monte (seuil de 55 de l'Acte V).
3. **Given** une quête en cours, **When** je recharge, **Then** elle reprend à la même étape.

### User Story 3 - Voyager coûte du temps (Priority: P2)

Avant un saut, la carte galactique affiche le carburant et 14 jours d'hypersommeil. À l'arrivée, l'horloge avance de 14 jours et la simulation des mondes tourne pour cette durée.

### Edge Cases

- Ancienne sauvegarde sans `stationV188` ni `crewQuestsV188` : valeurs par défaut, rien perdu.
- Rechargement pendant la décision CASSIUS : la décision est redemandée.
- Rechargement après l'arrivée d'un saut : les jours ne sont pas comptés deux fois.

## Requirements *(mandatory)*

- **FR-001**: Les missions `station-s1` à `station-s4` existent dans le catalogue de campagnes, sur Cocyte, avec le gabarit intérieur de vaisseau, les objectifs et les registres de la bible (§7.2, §0.3).
- **FR-002**: Ordre d'accès : Acte II → quête de Rook → S1 → S2 → décision CASSIUS → S3 → S4, contrôlé dans les listes et au lancement.
- **FR-003**: Le choix CASSIUS est unique et définitif ; il modifie la quarantaine et la stabilité de Cocyte [PROPOSÉ].
- **FR-004**: S2 donne la pièce CASSIUS du dossier ; S4 rend `asphodeleRetaken` vrai dans le choix final.
- **FR-005**: Les quêtes sont proposées dans la conversation existante, sans modifier ses six choix de rapport ; aucune récompense avant la dernière étape prouvée.
- **FR-006**: Le saut ajoute 14 jours [PROPOSÉ], affichés avant le départ.
- **FR-007**: Les images passent par six emplacements nommés dessinés en primitives Canvas.
- **FR-008**: Tous les textes joueur existent en français et en anglais.
- **FR-009**: Champs de sauvegarde additifs ; identifiants existants inchangés.

## Fidélité à la franchise

Aucune fidélité « 1:1 » n'est revendiquée. Trois catégories sont séparées.

| Élément | Apparence documentée (source) | Adaptation du projet | À définir |
| --- | --- | --- | --- |
| Détecteur de mouvement trompé par la ventilation (quête de Rook, S1) | Le détecteur M314 signale tout mouvement, y compris de l'air ou de l'eau : *Aliens* (1986), scène des ventilateurs et de la condensation dans le complexe de Hadley's Hope (« It's moving. »). | Le battement régulier de la ventilation d'Asphodèle sert d'indice ; le détecteur reste muet quand rien ne bouge. | Son et écran du détecteur d'Echo-8. |
| Enregistrement casque d'une escouade perdue | Caméras de casque suivies depuis l'APC pendant la descente dans la ruche : *Aliens* (1986). | Piste audio de six heures, horodatée, d'Echo-8 (bible §7.2). | Visage de Kessler (CIN-72). |
| Consigne de la compagnie contre la vie de l'équipage (quête de Vega) | « Special Order 937 », priorité au spécimen, équipage sacrifiable : *Alien* (1979), scène de MU/TH/UR. | Deux ordres écrits du projet (Administration coloniale, compagnie) dont le joueur relève les contradictions. | Texte complet des deux ordres. |
| Système de gestion Seegson (CASSIUS) | Seegson et l'IA APOLLO de Sevastopol qui applique ses consignes : *Alien: Isolation* (2014). | CASSIUS est un personnage original (bible §7.1) ; il ne reprend ni le nom, ni l'interface d'APOLLO. | Interface vocale, voix. |
| Dropship UD-4L amarré, conteneurs et berceaux | UD-4L : *Aliens* (1986). | Dropship d'Echo-8 au sas, berceaux QZ17 du projet (bible §7.4). | Toute l'image de la station. |

## Success Criteria *(mandatory)*

- **SC-001**: Depuis une sauvegarde de fin d'Acte II, un joueur atteint « Asphodèle reprise » en suivant uniquement les textes du jeu.
- **SC-002**: Le dossier QZ17 passe de 5/7 à 6/7 pièces possibles.
- **SC-003**: `scripts/verify-content-gaps-v188.mjs` passe (accès, sauvegarde, reprise, i18n pour chaque élément).
