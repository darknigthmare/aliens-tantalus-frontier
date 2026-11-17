# Tasks: Insertion et extraction cinématiques

## Phase 1: Setup / Foundational
- [x] T001 Lire les systèmes réutilisés : `story-cinematics-v188.js`, `mission-insertion*-v62.js`, `launchCampaign`, `AudioDirector`, palette daltonienne, hangar du hub.
- [x] T002 Créer `src/insertion-asset-slots-v188.js` : 19 emplacements (id, usage, taille, couche, brief), chargeur image/primitive, liste des fichiers présents (vide).
- [x] T003 Créer `src/insertion-cinematic-v188.js` : type de lieu, profil de monde, mode pied/APC, séquences complètes et courtes, état de vol, modèle d'écran, alertes.

## Phase 2: US1/US3 — Rendu (P1)
- [x] T004 [US1] Plans extérieurs : baie du Tantalus, largage, orbite, entrée (plasma, échauffement), approche (météo, terrain, piste) ; parallaxe étoiles/nuages/terrain.
- [x] T005 [US1] Cockpit : NAV, TERRAIN filaire, TÉLÉMÉTRIE (assiette), SYSTÈMES (alertes forme + couleur), compte à rebours, radio.
- [x] T006 [US1] Soute de troupe : sièges à harnais, éclairage rouge, écran d'état, soute ventrale avec M577.
- [x] T007 [US3] Descente propulsée sans air ; approche et amarrage d'un vaisseau.
- [x] T008 [US5] Plans d'extraction : décollage, montée, sortie d'atmosphère, ascension, désamarrage, retour à la baie.

## Phase 3: Intégration (P1)
- [x] T009 [US1] `app.js` : séquence entre le plan V62 et `engine.start` ; option `insertionHandoverV188` ; aucune séquence en reprise ou Forge.
- [x] T010 [US2] Champs additifs `insertionSeenWorldIdsV188` / `extractionSeenWorldIdsV188` et option `insertionAlwaysFullV188` (save.js, réglages, index.html).
- [x] T011 [US5] Événement `extraction-boarding-complete-v188` : pause, séquence, reprise ; repli sur le flux actuel.
- [x] T012 [US6] Mouvements réduits, daltonisme, sous-titres FR/EN, Échap/Entrée/bouton 44 px.
- [x] T013 Repères audio procéduraux dans `AudioDirector.insertionCueV188`.
- [x] T014 `sw.js`, traduction anglaise par `i18n-catalog-maintenance-v186.mjs merge`, bloc ajouté en fin d'objet.

## Phase 4: Vérification
- [x] T015 `scripts/verify-insertion-cinematic-v188.mjs` dans `test:priorities:v188` ; admission source-only.
- [x] T016 QA Chromium : captures (facteur 2) de chaque type de plan, trois lieux, insertion et extraction ; parcours réel `launchCampaign` ; temps d'image.
- [x] T017 Documentation : `INSERTION_ART_SLOTS_V188.md`, bible §10.1 (tableau de fidélité).

## Phase 5: Restant (hors de ce lot)
- [ ] T018 Atterrissage et embarquement dans le niveau (agent moteur) : dropship posé, rampe, marines ou APC, prise de contrôle ; émission de l'événement d'embarquement.
- [ ] T019 Production des images des emplacements, puis observation en jeu et mise à jour de `INSERTION_ASSET_FILES_PRESENT_V188`.
- [ ] T020 Sons enregistrés pour remplacer les repères procéduraux.
- [ ] T021 Validation par le propriétaire des valeurs [PROPOSÉ] (mondes sans indicateur, météo, heures, répliques).

## Phase 6 : Bilan après l'embarquement défendu — 17 novembre 2026

- [x] T022 Finaliser le bilan APC après les tirs de couverture et avant les callbacks, avec la formule existante, sans rejouer `completeMission` ni modifier `save.js`.
- [x] T023 Reproduire le refus du bilan 20 → 21 victimes, vérifier pause, reprise sanitisée, saut, abandon et émission/paiement uniques : cinq régressions rouges puis vertes ; groupe embarquement, récit et historique **55/55**. Preuves et limites dans `docs/development/BIOLOGICAL_ART_QA_20261117.md` et son reçu commun. La release et la nouvelle CI sont attestées séparément sur le SHA publié dans la PR #49.

## Phase 7 : Raccord des cinématiques du prologue — 17 novembre 2026

- [x] T024 Produire et intégrer les onze PNG du prologue/Port-Méridien, réemployer les 32 images appropriées et conserver les portraits : onze CIN et 35 plans, quantités et dimensions natives, corps complets et accessoires séparés.
- [x] T025 Vérifier les contacts du triage, la main après 45 %, les huit balises, les quatre caissons et la baie de secours ; rendre les 37 messages et COCYTE visibles ; conserver le globe entier et proportionné dans les deux orbites. Les deux suites cinématiques passent **39/39** ; la revue Canvas et ses limites sont dans `docs/development/PROLOGUE_ART_QA_20261117.md`.
- [x] T026 Raccorder le chargeur, les replis, le rejeu après erreur et la fermeture ; admettre onze chemins runtime exacts et un module de shell. Audit du cache et sauvegardes : **132/132**. Comparer les 17 CIN / 46 plans hors lot au rendu de la base.
- [x] T027 Confirmer le retour APC dans la CI Chromium de `d54f13cc` : 21 victimes, 1 310 crédits, aucun second paiement. Adapter le pilote campagne au bouton public de la cinématique d’extraction ; les régressions du pilote, de pause Broodstorm et du terminal Cocon sont documentées dans la même QA (**68/68**, dont six nouvelles).
- [ ] T028 Qualifier sur la nouvelle CI les trois pilotes corrigés et les deux traces clavier ajoutées pour les échecs Forge/menu mobile. Les anciens succès et les hôtes locaux ne remplacent pas cette exécution.
