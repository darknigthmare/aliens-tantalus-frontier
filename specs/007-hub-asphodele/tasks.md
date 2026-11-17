# Tasks: Hub Asphodèle, missions de la station, contrats, CIN-70 à CIN-72

## Phase 1: Foundational
- [x] T001 `src/asphodele-missions-v188.js` : 7 missions annexes (§7.2), 6 contrats, verrous, compteurs.
- [x] T002 `src/asphodele-hub-v188.js` : 9 pièces, portes et retours, verrous, champ `asphodeleHubV188`, voyage, prédicat.
- [x] T003 `src/save.js` (champ additif), `src/content.js` (472 campagnes), `src/station-asphodele-v188.js` (filtre).

## Phase 2: US1 — Rejoindre et parcourir (P1)
- [x] T004 `src/hub-asphodele-v188.js` : mixin, physique d'annexe, profondeur V2, portes E, invites, points de sauvegarde.
- [x] T005 `app.js` : navette au dialogue d'embarquement du hangar, retour au sas 1, garde de la pose du Tantalus.
- [x] T006 `src/asphodele-hub-slots-v188.js` : 20 emplacements, placeholders en primitives.

## Phase 3: US2 — Missions et contrats (P1)
- [x] T007 Carte du réseau QZ au pont de contrôle (planification) ; compteurs dans `finalizeOperation`.
- [x] T008 Pacte de Grue aux quais ; mémorial, serre, marché ouverts par leurs missions.

## Phase 4: US3 — Transmettre (P1)
- [x] T009 Baies de transmission ; `asphodeleRelayReadyV188` ; `finalChoiceOptionsV188` le lit par défaut.

## Phase 5: US4 — Cinématiques et plaque (P2)
- [x] T010 `src/station-cinematics-v188.js` : CIN-70, CIN-71, CIN-72 ; déclenchement unique.
- [x] T011 Plaque de Kessler au casier d'Echo-8.

## Phase 6: Polish
- [x] T012 Anglais : bloc de 39 entrées fusionné par `i18n-catalog-maintenance-v186` et ajouté en fin d'objet.
- [x] T013 `scripts/verify-asphodele-hub-v188.mjs` dans `test:priorities:v188`, admis ; `sw.js` : cinq modules.
- [x] T014 QA Chromium au clavier (`scripts/qa-asphodele-hub-v188.mjs`, fixtures déclarées), mesures de trame.
- [x] T015 Bible §7.5, §7.6, §10, §42.4, §56.13 ; audit `AUDIT_CONTENU_V188.md`.

## Phase 7: Suite (2026-11-16)
- [x] T016 Quatre modules rouverts, portes à retour, interactions : quartiers (palier *Autonome*, installation des volontaires, moral +4), infirmerie (S4, soins par `treatCrewMember`, scanner), ponts inférieurs (S3, barricades d'Echo-8, ronde de nuit `orig-asphodele-2` de §39.2), hangar de réparation (V2, ouvert par une *Remise en pression d'un module*, révision du Cheyenne : −1/−2 carburant par déploiement).
- [x] T017 Effets des cinq autres contrats, additifs et visibles (toast de compte rendu, carte du réseau QZ) : sécurité de la station (conduits, rondes de nuit ; −1 risque des opérations de station par 10), infestation de la station et de Cocyte (nid), main-d'œuvre (synthétique ; stock du marché), alliage et carburant (épave), module remis en pression (hangar). Garde par identifiant d'opération.
- [x] T018 Marché Crucible (Q30 A) : quatre offres sur les ressources existantes, stock par cycle (jour stratégique), refus au format de `strategicCostRefusalV188`, aucune boucle rentable, aucune ressource négative.
- [x] T019 Habillage de station des missions annexes, contrats et ronde de nuit (`asphodele-mission-dressing-v188.js`), 9 emplacements `asph-msn-*`.
- [x] T020 Foules de §42.2 (dockers, marchands, techniciens) sur `advanceNpcLifeV136`, portes et sas dégagés (règle de `clearRoomDoorwayPostV188`).
- [x] T021 Corrections : objectif du Tantalus masqué à bord de la station, bande de danger arrêtée aux portes, libellé FR/EN de la passerelle, noms « ★ » traduits.
- [x] T022 `scripts/verify-asphodele-hub-2-v188.mjs` et `scripts/qa-asphodele-hub-2-v188.mjs`, admis ; `sw.js` : trois modules ; bloc anglais revu.

## Phase 8: Images produites et intégrées (2026-11-16 et 2026-11-17)

- [x] T023 Neuf objets `asph-msn-*` de mission, libellés FR/EN et animations natives ; provenance et QA du 16 novembre.
- [x] T024 Treize parois `asph-wall-*`, indépendantes et opaques, dans les treize salles ; PNG générés conservés octet pour octet.
- [x] T025 Proportions réelles, répétition ancrée au monde, découpage du fond et séparation des portes/bandes ; correction du filet de raccord fractionnel.
- [x] T026 Cache runtime explicite, 39 tests Asphodèle et contrôle raster des treize salles ; QA/provenance du 17 novembre. Parcours Chromium non exécuté : lancement bloqué par l'environnement.

## Reporté
- Choix final et fins (spec 006, autre chantier).
- Art des vingt emplacements `asph-*` restants : treize accessoires, trois éléments intermédiaires et quatre acteurs. Vingt-deux des 42 emplacements disposent de PNG ; la fidélité canonique et les animations ne sont pas certifiées par cette seule génération.
- Plan V3 de la station (Q23 B, non retenu) et rotation visuelle de l'anneau.
- Commerce d'armes du marché (seules pièces et ressources sont échangées), médecin, jardiniers et mécaniciens nommés.
- Autres lieux de §39.2 : `orig-asphodele-1`, `-3`, `-4`.
