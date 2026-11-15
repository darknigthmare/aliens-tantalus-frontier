# Tasks: Front station Asphodèle, premières quêtes et temps de voyage

## Phase 1: Audit
- [x] T001 Écrire `docs/development/AUDIT_CONTENU_V188.md` et l'admettre (source uniquement).

## Phase 2: Foundational
- [x] T002 `src/station-asphodele-v188.js` : missions, verrous, CASSIUS, scènes, résumé.
- [x] T003 `src/crew-quests-v188.js` : Rook, Vega, Harlow, DAVID-8R.
- [x] T004 `src/galaxy-travel-v188.js` : 14 jours par saut.
- [x] T005 `src/content-gap-slots-v188.js` et `src/content-gap-ui-v188.js` : six emplacements, dialogue de scène.
- [x] T006 `src/save.js` : `stationV188`, `crewQuestsV188` additifs ; `src/content.js` : 459 campagnes.

## Phase 3: US1 — Station (P1)
- [x] T007 Filtre des listes, verrou au lancement, panneau du Commandement.
- [x] T008 Décision CASSIUS et scènes de retour (S1, S3, S4) à l'ouverture du Commandement.
- [x] T009 Pièce CASSIUS du dossier et `asphodeleRetaken` par défaut.

## Phase 4: US2 — Quêtes (P1)
- [x] T010 Boutons de quête dans la conversation du hub ; panneau des quêtes au Commandement.
- [x] T011 Composants de DAVID-8R dans `finalizeOperation`.

## Phase 5: US3 — Voyage (P2)
- [x] T012 Texte de route et temps appliqué à l'arrivée.

## Phase 6: Polish
- [x] T013 Anglais : bloc du catalogue fusionné ; dictionnaires FR/EN.
- [x] T014 `scripts/verify-content-gaps-v188.mjs` dans `test:priorities:v188`, admis.
- [x] T015 `sw.js` : cinq modules.
- [x] T016 Bible §7.5, §8.4, §13.6 et §56 ; suivi `PRIORITIES_P0_P1_V188.md`.
- [x] T017 QA Chromium : panneaux, quête de Rook, lancement de S1, décision CASSIUS (fixture déclarée).

## Reporté
- Hub Asphodèle (modules, Q22-Q23), annexes et contrats de la station, salle des relais.
- Les 12 autres quêtes de l'équipage, vie à bord, recrues.
- Messages en retard pendant le voyage (§13.2).
