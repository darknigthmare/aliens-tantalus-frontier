# Feature Specification: Acte V « Non viable », conseil de guerre, fins et épilogue

**Feature Branch**: branche de travail existante (spec `006-acte-v-fins`)

**Created**: 2026-11-15

**Status**: Draft

**Input**: audit du contenu `docs/development/AUDIT_CONTENU_V188.md` (manque n° 3 : « Acte V et fins ») et décisions par défaut du questionnaire `docs/development/QUESTIONS_PROPRIETAIRE_V188.md` (une question sans réponse prend l'option recommandée) : Q1 A (course construite à partir de l'existant, avec son état propre), Q2 A (pont : choix chronométré sans pause), Q3 A (Vega tient la colonie avec 5 pièces sans canal sûr), Q4 A (face-à-face gagné avec 5 pièces), Q5 A (épilogue jouable au Tantalus, plans fixes ailleurs), Q12 A (lecteur Canvas du prologue, décors en primitives), Q79 A (primitives Canvas pour tout nouvel élément). Bible : §5.6, §5.7, §5.7.1, §5.8, §10, §11, §19, §45, §45.2 (« Fins », « Après la fin »), §48, §56, §7.5, §8.4, §56.13.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Le conseil de guerre et le choix final (Priority: P1)

Après l'Acte IV et le contrôle biologique (CIN-51), la table tactique ouvre le conseil de guerre. Halloran déclare Port-Méridien non viable. Chaque membre de l'équipage en confiance *solide* propose son avantage ; CASSIUS et certaines origines d'Echo-9 ajoutent une réplique. Le dossier QZ17 et les options ouvertes sont affichés. Echo-9 recommande une ligne ; Vega la suit si sa loyauté est d'au moins 55, sinon elle décide selon le dossier.

**Why this priority**: la logique du choix final existait sans écran ; aucune fin n'était atteignable.

**Independent Test**: sauvegarde au seuil de l'Acte V ; ouvrir le Commandement ; recharger pendant le conseil ; recommander chaque option ; Vega sous 55.

**Acceptance Scenarios**:

1. **Given** les quatre chapitres de Cocyte et le retour de l'Acte IV, **When** j'ouvre le Commandement, **Then** le conseil s'ouvre et ne peut pas être fermé sans décision.
2. **Given** Asphodèle reprise, la salle des relais prête (hub Asphodèle) et 5 pièces, **Then** *Transmettre* est proposé ; sinon le conseil dit pourquoi il ne l'est pas.
3. **Given** le conseil ouvert, **When** je recharge, **Then** il se rouvre et aucune décision n'est enregistrée.
4. **Given** Vega sous 55, **When** je recommande une option, **Then** Vega décide : tenir avec 5 pièces sans canal sûr, transmettre avec le canal, céder sous 5 pièces.

### User Story 2 - Les missions finales (Priority: P1)

La ligne décidée ouvre trois missions dans l'ordre : *Dernier départ* (escorte du convoi, pont qui cède), *La Reine du dépôt*, puis *Les portes du port* (transmettre, tenir) ou *L'évacuation* (céder). Les avantages du conseil s'appliquent au départ. Au premier checkpoint de *Dernier départ*, le pont cède : lâcher le fret ou les colons en retard, en 15 secondes sans pause (21 avec la fenêtre d'Orlov).

**Acceptance Scenarios**:

1. **Given** la décision prise, **Then** CIN-60 est jouée et *Dernier départ* est recommandée (★) ; les missions suivantes ne sont pas proposées.
2. **Given** le choix du pont fait, **When** je recharge pendant la mission, **Then** elle reprend et le pont n'est pas redemandé.
3. **Given** la mission terminée sans checkpoint atteint, **Then** l'attelage arrière (fret) cède par défaut.

### User Story 3 - Les fins, l'épilogue et la suite (Priority: P1)

Après la dernière mission, la table tactique montre le face-à-face au quai (sauf si le dépôt est cédé), puis CIN-61 (appel des arrivés, somme réelle des sauvetages) et la cinématique de la fin. L'épilogue se joue au Tantalus : chaque membre principal de l'équipage a un dernier mot selon la fin ; le casier d'Echo-8 porte `RETOUR CONFIRMÉ` ou `POSTE LIBÉRÉ`. Le lire joue CIN-92 (plans fixes de Port-Méridien, d'Asphodèle et de la baie cryo, puis les faits de la partie) et le générique « A fan game by Darknigthmare ». La partie continue ensuite sur la même sauvegarde.

**Acceptance Scenarios**:

1. **Given** chaque ligne, **Then** sa fin est atteinte : *Transmettre* → « Le relais parle », *Tenir* → « Les vivants, sans preuve », *Céder* → « Le fret d'abord ».
2. **Given** la fin en cours, **When** je recharge, **Then** CIN-61 et la fin sont rejouées ; pendant le générique, le générique est rejoué.
3. **Given** la campagne terminée, **Then** aucun objectif d'histoire n'est affiché, les missions restent proposées et un rechargement ne rejoue rien.

### Edge Cases

- Ancienne sauvegarde : pas de clé `act5` ; au seuil, le conseil est simplement dû.
- Sauvegarde éditée avec une phase sans décision : retour au conseil.
- Mission finale déjà terminée : rejouable, sans effet d'histoire.
- Créature capturée et *Tenir* : tentative de récupération à bord, racontée au quai et dans la fin.

## Requirements *(mandatory)*

- **FR-001**: Quatre missions sur Cocyte (`act5-last-run`, `act5-depot-queen`, `act5-port-walls`, `act5-evacuation`) construites sur des gabarits existants, avec registre et objectif connus.
- **FR-002**: L'Acte V s'ouvre après `special-archive-relay`, `special-apc-convoy`, `special-c12-horde`, `special-black-cocoon` et le retour de l'Acte IV, jamais pendant l'Interlude.
- **FR-003**: Les options finales viennent de `finalChoiceOptionsV188` (§5.7.1)  ; la salle des relais vient du hub Asphodèle (`asphodeleRelayReadyV188`, `src/asphodele-hub-v188.js`), lue par défaut par `finalChoiceOptionsV188` ; l'Acte V ne la reconstruit pas.
- **FR-004**: La décision est unique, prise par `resolveFinalChoiceV188` ; elle est enregistrée avec le nombre de pièces, la restitution et la tentative de récupération.
- **FR-005**: Avantages des conseillers en confiance solide (loyauté ≥ 75) [PROPOSÉ] : munitions +120 (Sanaa), blindage 100 (Cal), +6 s au pont (Orlov), deux colons sur quatre sauvés par la route de Leila.
- **FR-006**: Pont : 15 s sans pause ; faute de choix, le fret cède [PROPOSÉ].
- **FR-007**: Face-à-face : transmis (ICC saisie) ; tenu avec 5 pièces → retrait des commandos ; sinon siège jusqu'à l'aube.
- **FR-008**: Fins et épilogue lus de la sauvegarde : choix CASSIUS, palier de la colonie, confiance de l'équipage, dossier, plaque de Kessler, issue de l'Interlude, origine d'Echo-9 ; aucun avantage accordé par une cinématique.
- **FR-009**: Reprise à chaque étape : conseil, mission, quai, fin, épilogue, générique.
- **FR-010**: Champ additif `storyCampaignV188.act5`, absent des anciennes sauvegardes ; aucun identifiant existant modifié.
- **FR-011**: Images par 15 emplacements nommés (`src/act5-slots-v188.js`), en primitives Canvas.
- **FR-012**: Tous les textes joueur en français et en anglais.

## Fidélité à la franchise

Aucune fidélité « 1:1 » ni certifiée n'est revendiquée. Trois catégories sont séparées ; les scènes citées sont des repères de lecture, pas des reproductions.

| Élément | Apparence documentée (source) | Adaptation du projet | À définir |
| --- | --- | --- | --- |
| Colonie cofinancée et administration coloniale | Burke rappelle que la compagnie a cofinancé la colonie avec l'Administration coloniale : *Aliens* (1986), scène du briefing de Gateway. | Charte de Port-Méridien et clause de non-viabilité déclarée par Halloran (bible §5.6) ; texte de la clause inventé [PROPOSÉ]. | Texte complet de la charte. |
| ICC | L'ICC retire sa licence à Ripley à l'issue de l'enquête : *Aliens* (1986), scène de l'audience. | Le dossier QZ17 est transmis à l'ICC et aux Marshals coloniaux (§5.7). | Procédure de saisie. |
| Marshals coloniaux | Les Marshals coloniaux de Sevastopol : *Alien: Isolation* (2014). | Institution du récit, sans faction jouable (§45). | Leur réponse après la fin. |
| Équipe de récupération de la compagnie | Une équipe de la compagnie arrive pour récupérer l'« actif » et demande qu'on le lui remette : *Alien 3* (1992), dernière scène avec Michael Bishop. | Commandos Weyland-Yutani du catalogue au quai de Port-Méridien ; personne ne tire ; le dossier décide (§5.6, étape 8). | Apparence des commandos dans cette scène. |
| Consigne de la compagnie contre l'équipage | « Special Order 937 » : *Alien* (1979), scène de MU/TH/UR. | La restitution des conteneurs et la créature réclamées par Halloran (§5.7.1). | — |
| M577 qui quitte la zone sous la pluie | Le M577 entre dans le processeur et en ressort sous la pluie et le vent de LV-426 : *Aliens* (1986). | CIN-60 et *Dernier départ* : convoi avec deux remorques (bible §5.6, étapes 3-5) ; mission sur le gabarit `planet-exterior`. | Remorques, pont, tracé de course dédié (Q1). |
| La Reine | La Reine pondeuse et sa poursuite jusqu'à la plate-forme : *Aliens* (1986). | « Reine du dépôt », boss générique du gabarit (`track an apex specimen`) ; elle n'a pas encore de sprite dédié. | Sprite, comportements de poursuite. |
| Retour en hypersommeil | Fin d'*Aliens* (1986) : l'équipe survivante entre en hypersommeil à bord du *Sulaco*. | Épilogue : la baie cryo du Tantalus rouvre ses caissons ; casier d'Echo-8 `RETOUR CONFIRMÉ` / `POSTE LIBÉRÉ` (§5.8, §7.4). | Plan de la baie. |
| Générique | — | Même présentation que le crédit d'ouverture (`intro-sequence-v188.js`) : « A fan game by Darknigthmare », projet non officiel. | — |
| Pont qui cède, appel des arrivés, conseil de guerre, répliques finales | — (inventions du projet) | Toutes les répliques et valeurs nouvelles sont marquées [PROPOSÉ] dans le code et la bible (§5.11). | Validation des textes par le propriétaire. |

## Success Criteria *(mandatory)*

- **SC-001**: Depuis une sauvegarde au seuil, chaque fin est atteinte en suivant les textes du jeu (tests Node) ; la fin *Tenir* (« Les vivants, sans preuve ») est jouée de bout en bout dans Chromium ; *Transmettre* l'a été avec la première version du relais, retirée depuis.
- **SC-002**: Un rechargement à chaque étape reprend au bon endroit.
- **SC-003**: `scripts/verify-act5-endings-v188.mjs` passe (accès, fins, épilogue, sauvegarde, reprise, anciennes sauvegardes, i18n).
