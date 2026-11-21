# Spécification : niveaux dédiés des missions de colonie C1-C4

**Spec** : `008-niveaux-colonie` | **Date** : 2026-11-21 | **Bible** : §6.2, §6.4, §43.1 (`docs/narrative/CAMPAGNE_PRINCIPALE.md`)

## Contexte

C1-C4 étaient jouables sur des gabarits génériques (`colony-multiroute` pour C1, C3, C4 ; `ship-interior-vertical` pour C2) : la rencontre générique (reine du gabarit, générateur, archives) n'avait aucun rapport avec le résumé de la mission. Le propriétaire demande une couche de niveau dédiée par mission, posée sur ces gabarits, sans toucher aux identifiants, objectifs de campagne, récompenses, à la sauvegarde `colonyMissionsV188`, à la décision `colonyC4DecisionPendingV188` ni aux règles de reconstruction.

## Exigences

- **FR-001** Chaque mission C1-C4 suit des phases écrites ; chaque phase écrit un checkpoint à son début ; reprise et nouvelle tentative y reviennent avec la phase telle qu'elle commençait.
- **FR-002** Tout ennemi apparu par la couche naît derrière une zone sûre de 900 px (jamais plus près d'un marine du même pont) et attend 4 s (grâce). [PROPOSÉ]
- **FR-003** C1 « Tenir le port » se joue en couloir de profondeur V2 (≈ 4 450 px de rue, du quai à la plate-forme) : contenir l'entrepôt QZ17-04 (rideau), évacuer trois patients jusqu'à la plate-forme, souder les sas A (porte de la rue) et B (mur nord) par interaction maintenue de 6 s, mise en pause par un coup sans remise à zéro, étincelles et cordon visibles ; deux sentinelles UA 571-C à poser ; pic au sas B, retour calme vers l'extraction.
- **FR-004** C2 « L'air du port » reste en V1 (intérieur, §43.1) : passerelle (radio de Jun Park, repos), embuscade dans les conduits (détecteur), nid de résine et cocons des échangeurs à purger, salle de contrôle (3 disjoncteurs puis console), surpression au retour, route éclairée, extraction en haut.
- **FR-005** C3 « Le convoi des rescapés » (V1) : quai du M577, couloir de triage, poste de scanner, infirmerie de Noor Okafor ; 5 rescapés contrôlés ; porteur déterministe (graine de mission) conservé dans le checkpoint ; jauge de panique (viser, courir près des civils) qui disperse la foule dans les salles voisines au-delà du seuil, sans échec ; compte à rebours d'éclosion de 240 s depuis la révélation ; conduire le porteur calmement à Noor.
- **FR-006** C4 « Le culte du port » (V1, nuit) : dortoirs en faible lumière, 3 indices ; conduits à embranchements dont un cul-de-sac avec une cache facultative ; rassemblement, un « élu » dans un cocon ; convertis évitables ou maîtrisés sans les tuer ; un converti tué coûte de la stabilité [PROPOSÉ] ; l'extraction mène à la décision C4 existante, inchangée.
- **FR-007** Art : emplacements nommés avec primitives Canvas, aucune image générée ; réemploi déclaré de PNG existants. Textes FR + EN par le catalogue revu.

## Hors périmètre

Art final des emplacements ; voix ; quartiers V2 (Q24), console du quai (Q26) ; C5 (`act5-port-walls`, Acte V) ; annexes et contrats (gabarits génériques inchangés).
