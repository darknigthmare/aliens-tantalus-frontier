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
- [x] T019 Produire et raccorder les 19 emplacements d'insertion/extraction : 17 PNG et deux réemplois à leur chemin d'origine, catalogue et cache à jour. La livraison du 16 novembre passe 83 tests ciblés et observe 59 plans plus neuf vues complémentaires sous Canvas natif ; voir `docs/development/INSERTION_ART_SLOTS_V188.md` et sa QA. Ce bilan ne qualifie pas un parcours navigateur complet.
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
- [x] T028 Qualifier les pilotes corrigés sur leurs exécutions Chromium réelles : R (`232693f1`) confirme Trials (47 contrôles, 30 captures conservées), Forge NPC (42/12), campagne (28/11) et Cocon (9/7). C (`a3634de7`) confirme le titre corrigé T040 : 128 contrôles, 18 configurations, 36 captures déclarées dans le rapport, aucune erreur de page/requête/HTTP. Le merge de test `f23c5a2a` a C pour parent et le même arbre. Les cinq workflows C sont réussis ; ces résultats ne sont pas attribués au candidat HADAL. Voir la continuation HADAL de l’audit pour les liens et empreintes.

## Phase 8 : Continuité visuelle avec le quai jouable — 17 novembre 2026

- [x] T029 Réemployer dans le quai les quatre PNG Wren, Ferro, patient et brancard du prologue, sans nouvelle génération ; conserver leurs proportions, les appuis natifs, le miroir de Wren, la profondeur et les trois habitants animés.
- [x] T030 Conserver la respiration positive de 0 à 1 px, le mouvement réduit, le chargement à l’entrée et les replis ; faire basculer ensemble patient et brancard. Les 14 contrats existants et cinq contrôles de production supplémentaires passent **19/19**.
- [x] T031 Comparer les 12 conditions du quai à la référence publiée `ee565717` et fournir une vue générale : **66/66 contrôles**, zéro erreur, zéro pixel modifié hors art et repli complet identique. Ajouter le module au shell sans précache d’image, vérifier **132/132** contrôles audit/sauvegarde et documenter les limites dans `docs/development/PORT_QUAY_ART_QA_20261117.md`. Release et CI sont attestées séparément sur le SHA de publication dans la PR #49.
- [x] T032 Attendre le détachement réel de l’introduction avant les trois entrées du titre du pilote Trials, dans le budget de 45 s existant et avant le lancement de mission. Deux régressions de production couvrent les trois sites et l’expiration ; mutant sans attente en échec, suite Legacy **25/25**. Aucun changement de pause, bombe ou sauvegarde ; la qualification Chromium reste dans T028.

## Phase 9 : Parcours révélés par la CI du prologue — 17 novembre 2026

- [x] T033 Attendre le retrait réel de l’introduction avant l’entrée Forge et la reprise de son checkpoint, dans les 45 s existantes. Deux régressions avec l’introduction, le checkpoint et le dialogue natifs ; mutant sans attente en échec ; suite Forge NPC **31/31**, 22 vérifications existantes intactes.
- [x] T034 Suivre CIN-20 puis CIN-20-rook et resélectionner QZ-18 par les contrôles publics avant sa consultation, avec un budget partagé de 30 s. Deux régressions, deux mutants causaux refusés, suite campagne **31/31** ; 21 fonctions et 28 contrôles existants inchangés. Les suites des trois pilotes totalisent **87/87**. Cocon et titre sont confirmés dans la CI P ; la qualification Chromium du candidat final reste dans T028.

## Continuation — Cargo et Abysse Noir, art dédié

- [x] T035 Produire quatre planches de Matriarche, 16 poses, les raccorder uniquement à l'acteur Cargo et conserver le contrôleur, les événements, la physique, les checkpoints et la reprise. Admission atomique 4/4 après mesure physique ; autres Reines et repli inchangés.
- [x] T036 Produire et raccorder la coque MANTA-6 entière au gabarit 180 × 86, à échelle uniforme et avec miroir ; conserver tir, accès et repli. Préciser la notice FR/EN sans clôturer HADAL ni le bestiaire.
- [x] T037 Vérifier les pixels avec le moteur natif et les vrais PNG : 264/264, 32 rendus des 16 poses, appuis géométriques à 0 px d'écart, cinq replis Cargo identiques à R et aucune différence hors art. Les captures et hôtes sont déclarés ; pas de parcours Chromium.
- [x] T038 Corriger la planche d'attaque pour les impacts natifs 9/11 ; lier son SHA aux cellules revues et vérifier les événements réellement émis face au prélèvement du même instant. Suite corrigée 7/7 ; les 15/15 antérieurs ne sont pas réattribués.
- [x] T039 Clôturer seulement la dette d'art Cargo dans le registre courant 19/2, en préservant les snapshots historiques 20/1 et les dettes Cocon/HADAL ; succession explicite et mutations négatives.
- [x] T040 Attendre le retrait réel de l'introduction avant l'unique Entrée du menu après preview, dans le budget partagé de 30 s. La trace R et la régression causale montrent la capture pendant le fondu ; les deux nouveaux cas passent, le mutant sans attente échoue, la suite Intro passe 6/6. Les douze fonctions et neuf assertions existantes du pilote restent identiques. Hôtes DOM/RAF/transport déclarés ; qualification Chromium du nouveau titre dans T028.
- [x] T041 Produire le scaphandre HADAL modulaire et ses poses avec un contrat partagé entre tête, oxygène, bras et arme : trois PNG, 19 pièces, 15 composées par pose courante. La posture finale passe 151/151 tests ciblés et 1 069/1 069 contrôles Canvas sur 59 conditions. Les deux premiers raccords de stature sont rejetés et conservés dans l'historique. Aucun nouveau cycle de nage n'est déclaré ; voir `HADAL_ART_QA_20261117.md`.
- [x] T042 Préserver le repli atomique HADAL, les six exclusions, le vrai propriétaire du tir, le budget de cache à 16 et le reçu de dessin frais pour la surcouche Legacy ; 77/77 contrôles de distribution/cache, sans précache d'image.
- [x] T043 Faire avancer une seule fois le soin natif dans la branche Legacy : 2,2 secondes actives, +48 santé plafonnée, un kit, pause et interruptions contrôlées. Le propriétaire de l'action et `save.js` sont inchangés ; le mutant retirant le seul appel reproduit le blocage.
- [ ] T044 Produire et vérifier le cycle de nage dédié et les animations aquatiques complémentaires ; la silhouette HADAL et la coque MANTA statique ne clôturent pas cette dette, le bestiaire ni les actes proposés.

## Continuation — Reine ailée de Broodstorm

- [x] T045 Produire trois planches intactes de quatre poses pour la Reine du chapitre, à partir de la seule référence 36 ; raccorder poursuite, repos/réaction et mort au contrôleur natif. Conserver la boîte physique, les collisions, les cadences et les sauvegardes ; calibrer les hanches et l'échelle anatomique par famille. Les suites du rendu et du comportement passent **72/72**, dont neuf tests dédiés.
- [x] T046 Vérifier les douze poses dans les deux directions, les huit disponibilités d'images, les exclusions, la pause/reprise, les bords de caméra et les mises à jour natives de poursuite/mort : **51 captures candidates et trois comparateurs H**, aucun échec final. Les corrections de fixture, l'écart flottant natif de reprise, la couverture unitaire séparée du mouvement réduit et les libellés EN incomplets sont conservés dans `BROODSTORM_QUEEN_ART_QA_20261117.md`.
- [x] T047 Clôturer uniquement `dedicated-flying-queen-art`, maintenir Broodstorm partiel et la dette dropship, puis contrôler la succession exacte depuis HADAL. Les quatre suites du registre et de ses consommateurs passent **47/47** ; 21 opérations restent jouables, avec 19 partielles et deux effectives. Les historiques V157/V158 et Cargo sont préservés.
- [x] T048 Admettre les trois PNG à la demande, le seul helper de shell (730 entrées) et les quatre preuves source-only. Distribution **77/77**, contrôle source réussi sur 3 549 fichiers et 1 598 assets ; les validations release, build et publication sont attribuées séparément au commit exact dans la PR #49, sans fusion.
- [ ] T049 Produire les animations et mécaniques d'atterrissage de la Reine, le corpus dropship modulaire complet et les actes Broodstorm proposés. Les douze poses intégrées au chapitre actuel ne réalisent pas ces extensions.

## Continuation — Reine-Mère adulte

- [x] T050 Produire et intégrer les huit poses de corps et les quatre bras de la Reine-Mère rouge dans le chapitre existant : trois PNG intacts, 3 492 612 octets, échelle anatomique commune, quatre attaches et appuis au sol. Les deux premières planches complètes et le premier fond B sont refusés et conservés dans l'historique.
- [x] T051 Vérifier propriétaire, admission atomique, salve réelle, expiration privée, pause/reprise et mort : **39/39** dans le groupe corrigé, trois mutants causaux refusés. Le garde visuel respecte la grâce d'insertion qui retient les tirs ; son propriétaire natif reste intact, comme les phases, Chœurs, projectiles, corps physique et sauvegardes.
- [x] T052 Contrôler les huit poses et leurs miroirs : **54 captures candidates, huit comparateurs B2, 14 comparaisons exactes et sept observations de visibilité**, aucun échec. Le complément montre le corps puis sa disparition dans le champ réel ; marges serrées, transparence par composant, occultations, hôtes et fixtures sont déclarés dans `QUEEN_MOTHER_ART_QA_20261117.md`.
- [x] T053 Clôturer seulement `dedicated-queen-mother-animation`, préserver `complete-royal-cast`, les statuts 19/2 et les preuves historiques. Les quatre suites de succession Q→B2→H→Cargo passent **49/49**.
- [x] T054 Admettre les trois PNG à la demande, le seul helper supplémentaire de shell (731 entrées) et les quatre preuves source-only : distribution **77/77**, contrôle source réussi sur 3 558 fichiers et 1 601 assets. Release, build et publication sont attestés séparément sur leur commit exact dans la PR #49, sans fusion.
- [ ] T055 Produire et vérifier les Chœurs et le casting royal complet, ainsi que les lieux, cinématiques et rencontres étendues de TR-0. L'adulte illustrée du chapitre existant ne clôture pas ces extensions.

## Continuation — Gardes de la Reine-Mère

- [x] T056 Examiner les références du rôle garde et calibrer les seize cellules de l'atlas praetorian existant : 32 vues de placement, échelle commune 70/161, appuis Y240 et pivots horizontaux par pose. Le PNG de 540 822 octets reste intact ; le réemploi est une adaptation visuelle déclarée, sans nouvelle attribution de caste.
- [x] T057 Raccorder la présentation aux six gardes et douze renforts possibles, au déplacement final réellement accepté, au contact natif et à la mort : groupe moteur **56/56**, dont dix-sept cas dédiés, trois mutations causales détectées. Les erreurs initiales du chargeur de mutation restent documentées et ne sont pas comptées comme des validations ; les propriétaires du gameplay restent inchangés.
- [x] T058 Vérifier les seize poses dans les deux directions, les deux sols, les vagues, les avertissements, la pause/reprise, la mort visible, les replis et la visibilité : **76 PNG candidates, huit comparateurs Q, 86 observations, douze comparaisons conformes**, aucun échec final. Les 32 poses imposées, les dix-huit instances, les seuils de balise préparés, la transparence et l'occultation par le butin sont distingués des événements natifs dans `QUEEN_MOTHER_GUARD_ART_QA_20261117.md` ; l'arrêt système de l'essai 01 reste hors résultat validé.
- [x] T059 Contrôler la succession R → Q sans fermer de dette : **51/51** dans les quatre suites du registre et de ses consommateurs. Le réemploi paresseux de l'atlas, le helper supplémentaire de shell (732 entrées) et les quatre preuves source-only passent la distribution **77/77**, puis le contrôle source réussit sur **3 564 fichiers et 1 601 assets**, sans document privé. Les gates complètes et la publication restent attribuées séparément au commit exact dans la PR #49, sans fusion.

## Continuation — Chœurs locaux de la Reine-Mère

- [x] T060 Produire une présentation originale explicite pour les trois cibles locales : une planche intacte de quatre états, 1254 × 1254 RGBA, 920 091 octets. Les seize compositions de placement et la revue root acceptent une seule échelle 90/525, les appuis structurels, la vue presque frontale et les écarts de contraction/neutralisé ; aucune anatomie de caste canonique n'est attribuée.
- [x] T061 Raccorder les trois propriétaires, l'horloge native, les vrais coups reçus, la mort après mother-1, le repli et la reprise : groupe **64/64**, dont dix-sept cas C, et deux mutations causales détectées. Aucun nouveau hook GameEngine, champ sauvegardé, mouvement ou attaque ; corps, objectifs et pression natifs conservés.
- [x] T062 Vérifier les quatre états, les deux sens et les trois cibles : **60 PNG candidates, neuf comparateurs R, 82 observations, 24 poses imposées et 30 comparaisons conformes**. Vrais coups, reprise, morts, dernier cadavre et expiration restent natifs. L'erreur initiale d'attribution caméra est conservée et résolue par trois vues complémentaires avec le shake et la tolérance inchangés ; fixtures, occultations et limites sont déclarées dans `QUEEN_MOTHER_CHOIR_ART_QA_20261117.md`.
- [x] T063 Contrôler la succession identité C → R : **54/54** dans les quatre suites, aucun changement de dette ou des statuts 19/2. Distribution **77/77**, puis contrôle source réussi sur **3 571 fichiers et 1 602 assets**, sans document privé. Le seul PNG reste à la demande, le shell compte 733 entrées et les quatre preuves restent source-only. Les cinq gates complètes et la publication sont attribuées séparément au commit exact dans la PR #49 ; complete-royal-cast et T055 restent ouverts.
