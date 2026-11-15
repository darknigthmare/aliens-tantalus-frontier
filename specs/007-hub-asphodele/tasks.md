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

## Reporté
- Modules scellés : quartiers (colonie *Autonome*), infirmerie, ponts inférieurs (missions de nuit §39.2), hangar de réparation.
- Commerce Crucible du marché (Q30).
- Décors propres de la station pour les missions annexes et les contrats (gabarit d'intérieur de vaisseau).
- Effets des contrats autres que « Relais en dérive » (sécurité, infestation, main-d'œuvre) : comptés, sans effet.
- Choix final et fins (spec 006, autre chantier).
- Art final de tous les emplacements `asph-*`.
