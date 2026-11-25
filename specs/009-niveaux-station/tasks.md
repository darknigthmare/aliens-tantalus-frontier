# Tâches : niveaux dédiés S1-S4

- [x] T001 Lieux mesurés sur le gabarit `ship-interior-vertical` (`station-level-places-v188.js`)
- [x] T002 Couche de phases, checkpoints, apparitions avec zone sûre et grâce, interactions maintenues (`station-mission-levels-v188.js`)
- [x] T003 V1 pour S1-S4 (cale de cargo procédurale retirée) ; conduits scellés ; cadres scellés des ponts supérieurs ; accès logique `stationAccessV188`
- [x] T004 S1 : sas manuel, anneau éteint, ventilateurs et détecteur, traces d'Echo-8, récupérateurs (négocier / forcer), alimentation de secours du pont
- [x] T005 S2 : disjoncteurs avec Kwan, réacteur, interrogatoire de CASSIUS (T013), ordres copiés ; décision CASSIUS inchangée (Commandement)
- [x] T006 S3 : sas 3 selon CASSIUS, laboratoire (berceaux, journaux, œufs), routage d'énergie, combat confiné, plaque de Kessler, compte à rebours
- [x] T007 S4 : nid, vannes, tenue du quai (cloison maintenue ouverte), arrivée de l'équipe (et de Grue si alliée), extraction au quai
- [x] T008 Emplacements d'art nommés (PNG Asphodèle réemployés, primitives sinon), textes FR/EN, coque hors ligne, admission des sources
- [x] T009 Tests moteur et parcours Chromium
- [x] T013 S2 : interrogatoire de CASSIUS de la spec 010 raccordé (mission en pause, échanges enregistrés, issue au texte de la décision seulement)
- [ ] T010 Art des emplacements en primitives (manivelle, ventilateur, craie, disjoncteur, panneau du réacteur, scellé du sas 3, œuf, journal, plaque, routeur, cadres scellés) — ouvert
- [ ] T011 Voix de CASSIUS et d'Idris Kwan — ouvert
- [x] T012 Enregistrer l'issue des récupérateurs de S1 (champ additif `stationV188.s1Salvagers`) pour le quai de S4 — décision du 2026-11-23 (S9-2) : `stationGrueAtDockV188`, alliée / hostile / absente, repli pour les sauvegardes antérieures

## Décisions du propriétaire du 2026-11-23

- [x] T014 S9-1 : collier d'arrimage de S1 en couloir de profondeur (`station-s1-docking-collar`, `depth-hold-sections-v188.js`) ; reste de S1 en vue de côté ; monte-charge du collier au repos ; liste de contrôle du niveau (accès, passage, arrivée, aller-retour, reprise) et checkpoint par phase vérifiés
- [x] T015 S9-2 : Grue au quai de S4 selon l'issue de S1 et le prix de la colonie (tenue réduite si alliée, deux récupérateurs armés si hostile)
- [x] T016 S9-5 : colons volontaires de la sauvegarde au quai de S4, à la fin de la tenue (six silhouettes au plus, emplacement `station-volunteer-colonist`)
- [x] T017 Noms de zone propres à la station (plaques, ligne de zone, plan local), FR/EN
- [x] T018 Correction : apparitions de la tenue de S4 abandonnées derrière la cloison de l'anneau fermée
- [x] T019 Tests Node et parcours Chromium étendus (S1, S4, `station-s4@forced`)
- [ ] T020 Art propre au collier (objets d'Echo-8) et silhouette des colons volontaires — ouvert (emplacements des cales réemployés, primitive Canvas)
- [ ] T021 Récupérateurs alliés armés pendant la tenue (aujourd'hui : vague réduite, silhouettes) — question Q-S9-7, ouvert
- [ ] T022 Équilibrage de la tenue complète de S4 après playtest (S9-4) — ouvert
