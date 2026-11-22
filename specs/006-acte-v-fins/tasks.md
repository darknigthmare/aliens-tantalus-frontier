# Tasks: Acte V « Non viable », conseil de guerre, fins et épilogue

## Phase 1: Foundational
- [x] T001 `src/story-act5-state-v188.js` : état additif `storyCampaignV188.act5`, normalisation pure.
- [x] T002 `src/story-campaign-v188.js` : `act5` conservé par la normalisation, absent des anciennes sauvegardes.
- [x] T003 `src/story-act5-v188.js` : missions, verrous, conseil, décision, avantages, pont, quai, fins, épilogue, objectif.
- [x] T004 `src/act5-slots-v188.js` : 15 emplacements d'art en primitives à la livraison initiale ; continuation artistique en phase 6.
- [x] T005 `src/content.js` : quatre missions (463 campagnes).

## Phase 2: US1 — Conseil et choix final (P1)
- [x] T006 Conseil à la table tactique : ordre de Halloran, conseillers, CASSIUS, origines, dossier, options, décision de Vega.
- [x] T007 CIN-60 après la décision ; objectif et recommandation (★) de la première mission.

## Phase 3: US2 — Missions finales (P1)
- [x] T008 Filtre des listes, verrou au lancement, avantages au départ.
- [x] T009 Pont chronométré au premier checkpoint ; défaut à la résolution.
- [x] T010 Salle des relais : lue par défaut dans `finalChoiceOptionsV188` (hub Asphodèle, chantier parallèle) ; aucun relais reconstruit par l'Acte V.

## Phase 4: US3 — Fins, épilogue, suite (P1)
- [x] T011 Face-à-face au quai, CIN-61, CIN-90 (trois fins).
- [x] T012 Épilogue : derniers mots dans la conversation du hub, casier d'Echo-8, CIN-92.
- [x] T013 Générique (style du crédit d'ouverture) puis partie libre.

## Phase 5: Polish
- [x] T014 Anglais : bloc du catalogue fusionné ; dictionnaires FR/EN.
- [x] T015 `scripts/verify-act5-endings-v188.mjs` dans `test:priorities:v188`, admis (source uniquement).
- [x] T016 `sw.js` : trois modules ; `index.html` : panneau « Acte V ».
- [x] T017 Bible §5.6-§5.8, §5.11, §10, §56.14 ; suivi `PRIORITIES_P0_P1_V188.md` ; audit.
- [x] T018 QA Chromium sur fixture importée (fin *Tenir* de bout en bout, reprises ; FR et EN).

## Phase 6: Art intégré — 17 novembre 2026

- [x] T019 Neuf PNG livrés dans `assets/act5/v188/` (20 244 249 octets), complétés par 23 réemplois : catalogue de 32 ressources, quatorze emplacements actifs illustrés. Le quinzième, `relay-room`, est inutilisé et reste sans PNG ni requête.
- [x] T020 Raccorder les cinq scènes de dialogue et les sept CIN / dix-sept plans, y compris les dialogues CIN-60 et CIN-61, avec préchargement par consommateur et replis partiels.
- [x] T021 Mesurer les fenêtres, pieds, pneus et attelages : M577 corrigé → quatre colons → fret ; quatre occupants composés dans les fenêtres avec les atlas existants ; silhouettes proportionnées.
- [x] T022 Animer la fermeture avec les vrais vantaux et masquer leur position de repos ; ouvrir les quatre caissons en deux rangées autour de leurs charnières ; conserver la lisibilité de la plaque ECHO-8 et le cadrage de la navette pendant la caméra.
- [x] T023 Préserver les overlays FR/EN et les états issus de la sauvegarde, le compteur cumulatif, le mouvement réduit, les durées, choix et récompenses ; redessiner après chargement tardif et détacher les callbacks à la fermeture.
- [x] T024 Valider 69/69 tests d'intégration, 132/132 tests audit/sauvegarde et 37/37 contrôles indépendants du cycle de vie.
- [x] T025 Produire la QA de 166 captures PNG sous Canvas natif : neuf contributions visibles, six contacts de pneus, quatre passagers et quatre couvercles ; 29 comparaisons raster hors périmètre sans différence et 256 traces Canvas identiques. Fixtures et doubles déclarés ; aucun nouveau parcours navigateur revendiqué par ce lot.
- [x] T026 Relier [provenance](../../docs/development/ACT5_ART_PROVENANCE_20261117.json), [QA et limites](../../docs/development/ACT5_ART_QA_20261117.md), [planche intégrée](../../docs/development/ACT5_ART_OVERVIEW_20261117.png) et [reçu de rendu](../../docs/development/ACT5_ART_RENDER_RECEIPT_20261117.json) ; actualiser l'audit en conservant les bilans historiques.

## Phase 7 — Course du convoi (Q1 A au sens strict, 2026-11-21)

- [x] T027 Règles pures : chaîne d'attelage à ressort amorti, largage, pont qui s'affaisse puis s'effondre, coureurs bloqués par une remorque, Reine admise puis machine à états explicite (`src/act5-convoy-race-v188.js`).
- [x] T028 Runtime de mission pour `act5-last-run` et `act5-depot-queen`, composé sous les couches V188 sans changer leur ordre ; un checkpoint par phase ; reprise et redémarrage (`src/act5-convoy-race-runtime-v188.js`).
- [x] T029 Raccordement : M577 attribué, remorques lues dans le manifeste, largage = décision du pont, conséquences additives `act5.convoyV188`, sons V188, VFX V188, radio FR/EN (`src/app.js`, `src/story-act5-v188.js`, `src/story-act5-state-v188.js`).
- [x] T030 Tests `scripts/verify-act5-convoy-race-v188.mjs` (dans `test:priorities:v188`) et parcours navigateur `scripts/qa-act5-convoy-race-v188.mjs`.

## Phase 8 — Décisions du propriétaire (2026-11-22)

- [x] T031 M577 à l'échelle (8,8 m [À VÉRIFIER] = 449 px) dans la course et le convoi de l'Acte III, substitut Canvas derrière `m577-mission-side-scale`, attelage, tourelle, collisions et cadrage (`src/m577-scale-v188.js`).
- [x] T032 Fret perdu : conteneurs retirés du compte, plus de « restitution », coût moral une fois, fin et épilogue FR/EN (`src/story-act5-v188.js`, champ additif `act5.restitutionLostV188`).
- [x] T033 La Reine atteint toujours le carrefour : plancher de santé et état `recoil` pendant la poursuite, mort seulement au carrefour.
- [ ] T034 Sprite de mission du M577 et longueur documentée — ouvert.
- [x] T035 (second tour, 2026-11-22) Cadrage de la poursuite : silhouette entière de la Reine à courte portée, tourelle du M577 dans la vue (décalage puis recul jusqu'à 0,78, `ACT5_CHASE_FRAMING_V188` [PROPOSÉ]) ; recul de la Reine observé en QA navigateur (rejeu, deux remorques maintenues attachées, injection déclarée).

## Reporté

- Sprite de la Reine du dépôt en poursuite : emplacement `act5-queen-chase-side` déclaré, substitut Canvas à 245 px en attendant ; l'art des quatorze emplacements actifs est couvert en phase 6, et `relay-room` reste volontairement sans image faute de consommateur.
- Hub Asphodèle et sa salle des relais visitable (chantier parallèle) ; palier *Libre* de la colonie après « Le relais parle ».
- Démission d'Inez et relève de Vega en partie libre (racontées, sans effet sur l'équipage).
- Nouvelle partie + (§45.2).
