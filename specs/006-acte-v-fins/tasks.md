# Tasks: Acte V « Non viable », conseil de guerre, fins et épilogue

## Phase 1: Foundational
- [x] T001 `src/story-act5-state-v188.js` : état additif `storyCampaignV188.act5`, normalisation pure.
- [x] T002 `src/story-campaign-v188.js` : `act5` conservé par la normalisation, absent des anciennes sauvegardes.
- [x] T003 `src/story-act5-v188.js` : missions, verrous, conseil, décision, avantages, pont, quai, fins, épilogue, objectif.
- [x] T004 `src/act5-slots-v188.js` : 15 emplacements d'art en primitives.
- [x] T005 `src/content.js` : cinq missions (464 campagnes).

## Phase 2: US1 — Conseil et choix final (P1)
- [x] T006 Conseil à la table tactique : ordre de Halloran, conseillers, CASSIUS, origines, dossier, options, décision de Vega.
- [x] T007 CIN-60 après la décision ; objectif et recommandation (★) de la première mission.

## Phase 3: US2 — Missions finales (P1)
- [x] T008 Filtre des listes, verrou au lancement, avantages au départ.
- [x] T009 Pont chronométré au premier checkpoint ; défaut à la résolution.
- [x] T010 Relais en dérive comptés dans `finalizeOperation`.

## Phase 4: US3 — Fins, épilogue, suite (P1)
- [x] T011 Face-à-face au quai, CIN-61, CIN-90 (trois fins).
- [x] T012 Épilogue : derniers mots dans la conversation du hub, casier d'Echo-8, CIN-92.
- [x] T013 Générique (style du crédit d'ouverture) puis partie libre.

## Phase 5: Polish
- [x] T014 Anglais : bloc du catalogue fusionné ; dictionnaires FR/EN.
- [x] T015 `scripts/verify-act5-endings-v188.mjs` dans `test:priorities:v188`, admis (source uniquement).
- [x] T016 `sw.js` : trois modules ; `index.html` : panneau « Acte V ».
- [x] T017 Bible §5.6-§5.8, §5.11, §10, §56.14 ; suivi `PRIORITIES_P0_P1_V188.md` ; audit.
- [x] T018 QA Chromium sur fixture importée (fin *Transmettre* de bout en bout, reprises).

## Reporté
- Course APC dédiée (remorques, pont physique, poursuite de la Reine) sur le moteur de `apc-convoy-runtime-v121.js` (Q1 A au sens strict).
- Sprite de la Reine du dépôt ; art des 15 emplacements.
- Hub Asphodèle et sa salle des relais visitable (chantier parallèle) ; palier *Libre* de la colonie après « Le relais parle ».
- Démission d'Inez et relève de Vega en partie libre (racontées, sans effet sur l'équipage).
- Nouvelle partie + (§45.2).
