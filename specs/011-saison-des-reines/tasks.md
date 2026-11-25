# Tâches : « La Saison des Reines »

## Premier lot (cadre de campagne et arc 1, 2026-11-22)

- [x] T001 Règles et données de la campagne, arc 1 (`src/side-campaign-queens-v188.js`)
- [x] T002 Neuf missions de l'arc 1 dans `CAMPAIGNS` (cible 511) ; catalogue anglais revu et delta Tantalus
- [x] T003 Déplacement additif d'Opération Abysse Noir vers Nacre-7 ; reçu V131 accepté sur l'ancien monde pour un déploiement en cours
- [x] T004 Champ de sauvegarde additif `sideCampaignsV188`
- [x] T005 Appel après l'Acte V, message en retard, CQ-01, briefing et acceptation
- [x] T006 Arrivée à Nacre-7 par le saut existant (carburant, 14 jours, message de Navarre, une fois)
- [x] T007 Verrous (appel, orbite, ordre, annexes après 1.1, une fois par campagne ; contrats rejouables)
- [x] T008 Roster de la lignée récifale ; boss aquatique réservé au chapitre
- [x] T009 Scènes de retour, CQ-02, choix de l'œuf de Rask, compte rendu de l'arc 1
- [x] T010 CQ-01 à CQ-06 dans le lecteur Canvas (primitives)
- [x] T011 Panneau de la table de briefing (FR/EN)
- [x] T012 Suite Node et parcours Chromium ; bible, audit, questions du propriétaire

## Second lot (arcs 2 et 3, décisions du propriétaire du 2026-11-23)

- [x] T101 Arc 2 Echo Basin (§14.5) : 2.1, 2.2, 2.4, 2.5 sur gabarits existants ; 2.3 = Broodstorm, déplacé de `world-01-acheron-lv-426` vers `world-27-echo-basin` (`legacyWorldIdsV188`) ; annexes `queens-a-mineurs`, `queens-a-rask` (œuf laissé à Rask), `queens-a-sorensen`, `queens-a-grue` (Grue alliée) ; contrats `queens-l-galerie`, `queens-l-falaise`, `queens-l-chargeur` ; CQ-03 au retour de 2.4 ; compte rendu de l'arc 2. **Reste** : niveaux dédiés (T106), rencontre en hauteur de la Reine volante (2.4 joue au sol sur `planet-exterior` avec la caste royale du catalogue).
- [x] T102 Arc 3 TR-0 (§14.6) : monde `world-65-tr-0` créé (65e monde, `project-canon`, caché jusqu'à l'arc 3) ; 3.1, 3.2 sur gabarits existants ; 3.3-3.4 = « Le chant de la Reine-Mère », 3.5 = « TR-0 · la Ruche-monde », déplacés de `world-05-lethe` vers TR-0 (`legacyWorldIdsV188`) ; annexes `queens-a-ombelle`, `queens-a-echantillon` et son choix Inez / BISHOP-9 ; CQ-04 à l'arrivée, CQ-05 et CQ-06 au retour des chapitres ; fin unique nuancée (§14.8) au retour au Tantalus. **Reste** : niveaux dédiés (T106), alerte planétaire au bruit de 3.1 (aucune mécanique de silence sur le gabarit).
- [x] T103 Quêtes du Tantalus liées (§14.9) : `ship-q-doyle`, `ship-q-orlov`, `ship-q-harlow` (`src/queens-crew-quests-v188.js`), offertes après l'arc 2 avec les règles des quêtes d'équipage. **Reste** : effet en mission des réglages du smartgun (Doyle) et de l'amélioration du Cheyenne (Orlov), seulement enregistrés.
- [x] T104 Récompenses (§14.10), partie faisable : bestiaire des adaptations (table de briefing, ouvert par `ship-q-harlow`) ; recherche +15 ou confiance de BISHOP-9 +10 selon le choix du Praetorian. **Reste** : voir T109.
- [x] T105 Crise biologique de l'œuf saisi : risque enregistré à l'arc 1, crise du hub (pont 2, quarantaine, API `createHubCrisis`) au réveil en orbite de TR-0, deux issues, l'arc 3 attend. **Reste** : difficulté +1 de la campagne 5 (œuf laissé) et Rask informateur (campagne 5 non produite), seulement enregistrés.
- [x] T110 Outils de développement : une entrée de lanceur par mission, choix, compte rendu, arrivée et crise des arcs 2 et 3 (`devtools/dev-catalog-v188.js`, `devtools/dev-fixtures-v188.js`).

## Reste (non livré, à ne pas déclarer terminé)

- [ ] T106 Niveaux dédiés : toutes les missions propres à la campagne jouent sur les gabarits génériques (`colony-multiroute`, `ship-interior-vertical`, `planet-exterior`) avec leur objectif de base. À construire : quai sur pilotis, bassins, plate-forme d'envol, laboratoire inondé, filets, phare (§30.1) ; tour relais et faux signaux du détecteur, dalles renforcées et sol qui s'ouvre, aiguille et aire en hauteur (vent, chutes), puits 7, route des crêtes, épave Crucible (§30.2) ; croûte de résine et alerte au bruit, Base Ombelle sous la résine, chambre froide, capture du Praetorian (§30.3).
- [ ] T107 Art : emplacements `queens-*` et `queens-cin-*` en primitives Canvas ; aucune image produite. Variantes de castes propres aux lignées (carapace lisse, fouisseurs, membranes de planage) **[À CRÉER]** : les rosters utilisent les castes existantes du catalogue.
- [ ] T108 Vieillissement de l'équipage pendant le voyage (§13.6, §13.7, reste du lot précédent).
- [ ] T109 Récompenses non produites (§14.10) : arme ou munitions anti-Reine (recherche ouverte si Inez garde le spécimen, aucune arme au catalogue), statistiques du Cheyenne et du smartgun, scaphandre HADAL hors chapitre, recrutement du Dr Navarre (seulement proposé au compte rendu).
- [ ] T111 Biomes d'Echo Basin : le monde généré porte `cryogenic` / `reactor`, la bible décrit des canyons rouges ; correction de biome à valider par le propriétaire (comme §22.17).
- [ ] T112 Vie du monde TR-0 après la campagne : le monde reste sur la carte avec son état simulé ; aucun état « effondré » n'est appliqué.
