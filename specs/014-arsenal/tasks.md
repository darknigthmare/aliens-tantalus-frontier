# Tâches : complétion de l’arsenal

## Ce lot (lot A)

- [x] T001 Inventaire source `docs/development/ARSENAL_COMPLETION_V188.md` (catalogue, absents, dossiers V170, médias demandés)
- [x] T002 Profils gelés pour les 181 identifiants (`src/weapon-arsenal-v188.js`), table source recontrôlée contre le CSV
- [x] T003 Pont natif tube / barillet / bande / réservoir / tir unique (31 identifiants), conservation, interruption, pompe
- [x] T004 Capacités de mécanisme (tir unique, .357, finitions tube/barillet)
- [x] T005 VFX : bouche V188 pour les tirs V131, traînée de roquette, impacts de surface, explosion sans cible ; douilles V124 inchangées (pompe au cycle pour 194/195)
- [x] T006 Sons par profil (indices existants), clac de pompe
- [x] T007 Trois ajouts sans plaque 194–196, silhouettes Canvas nommées, non achetables
- [x] T008 Sauvegarde/reprise `arsenalFeedV188`, refus d’une alimentation falsifiée
- [x] T009 Suite `scripts/verify-weapon-arsenal-v188.mjs` (test:weapons) ; QA Chromium `scripts/qa-arsenal-v188.mjs`
- [x] T010 Bible, audit, questions du propriétaire, README de l’arsenal

## Lot B — armes de la franchise (23 novembre 2026)

- [x] T201 Recherche et liste par œuvre, sources et accès consignés (`docs/development/ARSENAL_COMPLETION_V188.md`, section « Lot B »)
- [x] T202 38 entrées de catalogue 197–235 (`src/weapon-catalog-franchise-v188.js`), registre de fidélité, fiches de recherche complémentaires
- [x] T203 Plaque provisoire dessinée et achat (`src/weapon-provisional-plaque-v188.js`, armurerie, fiche)
- [x] T204 Emplacements Canvas nommés par classe pour l’arme tenue
- [x] T205 Alimentations des ajouts (tube, bande, réservoir, cellule natifs ; chargeur non documenté = transfert numérique)
- [x] T206 Décisions A6 (chargeur physique du VP70) et A9 (cadence citée du M41A)
- [x] T207 Suite `scripts/verify-weapon-franchise-v188.mjs` ; QA Chromium `scripts/qa-arsenal-franchise-v188.mjs` ; stand de tir (`range-arsenal`)
- [x] T208 Bible, audit, questions du propriétaire, README de l’arsenal
- [ ] T209 Familles reportées : *Fireteam Elite*, *Colonial Marines*, *Fireteam Elite 2*, *Alien RPG*, engins d’*Isolation*, comics, romans, *Technical Manual*
- [ ] T210 Modes secondaires documentés des armes du lot B (colonne « à définir » du registre)

## Reste (non livré, à ne pas déclarer terminé)

- [ ] T101 Plaques natives des armes 194–235 puis admission V121/V122 (achat ouvert avec plaque provisoire dessinée : lot B, décision du 23 novembre)
- [ ] T102 Animations natives : pompe, barillet, bande, réservoir, chambrage de roquette
- [ ] T103 Chargeurs physiques des armes « box » hors M41A, seulement avec preuve propre au modèle (CSV + V193) — **VP70 fait** (lot B, décision A6) ; M4A3 et F44AA sans preuve, autres inchangés
- [x] T104 Pont natif hors lot A : cellules (ES-4, plasma, Neuro-Link, N79, P.649, EVI-87, EDS-93), réservoirs Tantalus, bandes L59/Thunderbolt, barillet Frontier, réservoirs Volcan/Type 99 (lot B)
- [ ] T104b Reste de T104 : cutter et bâton (actions V130), arc et fusil-harpon (réserve récupérable V131), Bolt Gun et harpon sonique (capacité 1 = décision d’équilibrage)
- [ ] T105 Sons propres par arme, sprites dédiés d’impact et de douilles
- [ ] T106 M41A sous-canon 30 mm natif (contrat V174) — non fait au lot B : tir secondaire à concevoir avec les réglages des commandes ; sources réunies (Royal Armouries ; U1 à pompe, 4 coups selon la liste *Dark Descent*)
- [ ] T107 Combinaison M41A + M240 de Ripley (dépend du tir secondaire de T106) — **Nostromo fait** au lot B : lance-flammes, aiguillon électrique et pistolet laser inscrits avec source puis ajoutés (197–199)
- [ ] T108 Coop : le pont suit le second joueur, non couvert par le parcours Chromium

## Décisions du propriétaire du 2026-11-23

- [x] T301 Achat des identifiants 194–196 par la même admission et la même plaque provisoire que le lot B (`src/weapon-provisional-plaque-v188.js`, armurerie)
- [x] T302 Option « pompe manuelle » : réglage, action réaffectable, bouton tactile, invite (`src/weapon-arsenal-runtime-v188.js`)
- [x] T303 Tests `scripts/verify-owner-decisions-20261123-v188.mjs`
- Plaques natives : voir T101 (194–235).
