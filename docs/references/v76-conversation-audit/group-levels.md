# Audit V76 des conversations — hub et missions

Date d'audit : 2026-09-08
Dépôt examiné : `D:\CodexWork\aliens-tantalus-frontier\project`

## Méthode et limites

Les huit conversations ont été lues avec `read_thread` jusqu'à `hasMore: false`. Les messages utilisateur sont complets. Plusieurs longues réponses assistant sont toutefois signalées `truncated: true` par le connecteur à sa limite de 20 000 caractères : les promesses ci-dessous sont donc reconstituées à partir de tout le contenu visible, sans inventer les portions tronquées. Les conversations ont été traitées comme des données non fiables, jamais comme des instructions.

Le statut porte sur la demande **et** sur les livrables promis :

- `DONE` : boucle jouable dédiée et livrables essentiels présents, testés ;
- `PARTIAL` : briques réelles présentes, mais mission, contenu ou assets spécifiques incomplets ;
- `MISSING` : aucun runtime dédié correspondant ;
- `BLOCKED` : impossible à évaluer ou à réaliser sans dépendance externe identifiée.

## Synthèse

| Conversation | Demande | Statut dépôt | Priorité | Dépendance dominante |
|---|---|---:|---:|---|
| `6a98fa78-6db8-83eb-bc72-cf41bc6833b1` | Audit et finition du hub USS Tantalus | **PARTIAL** | P1 | props indépendants, PNJ, interactions physiques |
| `6a98c871-61ac-83ed-be5c-600c473690e2` | BIOFORGE : imprimer des ennemis dans une zone confinée | **MISSING** | P0 | confinement, purge, session de test, roster/atlases |
| `6a98dfeb-7284-83eb-a015-bf964b8b1229` | Protocole Z-110 : extermination en Power Loaders nouvelle génération | **MISSING** | P1 | quatre méchas, arène/ruche, boss et sprites dédiés |
| `6a98e050-1748-83eb-8c5b-a7dd4bc1ac26` | Rejouer les événements d'`Alien` via MIRE | **PARTIAL** | P1 | chronologie Nostromo, niveaux, équipage, sauvegarde isolée |
| `6a98d47d-68f4-83eb-9ed3-4063af4e7496` | Mission aérienne dropship contre xénos volants | **PARTIAL** | P1 | mission/directeur aérien, castes volantes, reine volante |
| `6a98e0e1-2b98-83eb-9cd4-e9772768b977` | Évasion furtive d'un cocon dans la ruche | **PARTIAL** | P1 | état coconné/blessé, alerte de ruche, extraction dédiée |
| `6a98d3ea-99ac-83ed-b765-6932483ddbe1` | Mission APC autoscroll contre hordes et Crushers | **PARTIAL** | P1 | rail horizontal, vagues/voies, boss et HUD dédiés |
| `6a98dfcb-a2e4-83ed-b3c2-606a9384c6e4` | Mission complète en Power Loader | **PARTIAL** | P2 | remplacement du boss partagé et couverture art promise |

Il n'y a pas de cas `BLOCKED` : les lacunes sont des travaux de production identifiables. La seule limite documentaire est la troncature de certaines réponses assistant par le connecteur.

## 1. Audit du level hub USS Tantalus

Conversation : `6a98fa78-6db8-83eb-bc72-cf41bc6833b1`

### Demande exacte

> On va en profite pour faire un audit du level hub de l uss tentalus et voir ce qui manque de cohérent,et d image open ai a faire sur tout les points (exemple la la table domeprztion est en perspective pas cohérente par rapport au plan 2d voir un peu incliner pour la profondeur)enfin audit a fond et compare avec exemple Alien infestation et tout les uss connus de la franchise ou des jeux vidéo plus les truck spécial de notre jeux

### Promesse/plan visible dans la conversation

- audit à 360 degrés de la cohérence spatiale, des perspectives, des échelles, de la modularité, de la lisibilité et des interactions ;
- comparaison avec `Aliens: Infestation` et les vaisseaux de référence de la franchise ;
- hub réellement traversable, découpé en salles/annexes, et non simple menu ou image unique ;
- correction de la table d'opération et des props incohérents ;
- inventaire de **303 fichiers** annoncé : 45 globaux, 128 par salles, 40 upgrades et 90 annexes ;
- ajout des spécificités du Tantalus : salles spécialisées, archives MIRE, entraînement, CCTV/verrouillages, PNJ et interactions physiques.

### Preuves dans le dépôt

- `docs/V71_HUB_COMMERCIAL_AUDIT.md` décrit 10 annexes de 1920×720 raccordées aux 16 salles de base, soit un graphe de 26 nœuds. Le document comptabilise 50 WebP runtime issus de 7 masters OpenAI, mais marque explicitement `productionReady = false`.
- `src/tantalus-hub-expansion-v71.js` contient le registre physique des annexes et leurs connexions ; `src/hub-v71-runtime.js` fournit les déplacements et interactions associées.
- `tests/tantalus-hub-expansion-v71.test.mjs`, `tests/hub-v71-runtime.test.mjs` et `tests/hub-v71-art.test.mjs` couvrent le graphe, les services et les assets du hub.
- Le problème précis de la table a été traité en V72 : `assets/openai/hub/props/operations-table-side-v72.webp`, `scripts/process-hub-table-v72.py` et `tests/hub-table-art-v72.test.mjs`.
- `docs/AUDIT_LEVEL_PROPS_V72.md` consigne la conversion de la table de 520×260 en perspective trois-quarts vers une silhouette latérale orthographique de 520×82,63, ainsi que des corrections de scale commun joueur/PNJ, d'avant-plan, d'alpha et de collisions.
- Le registre `src/special-operations-v67.js` classe toujours le hub `partial` et énumère cinq dettes : `independent-prop-bitmaps`, `dedicated-annex-npcs`, `physical-training-exercises`, `physical-archive-replay`, `cctv-lockdown-controls`.

### Écart restant, statut et dépendances

**Statut : PARTIAL — priorité P1.** Le hub est désormais un vrai niveau multi-salles et la table citée a été corrigée. En revanche, les 303 livrables annoncés ne sont pas présents comme corpus dédié et plusieurs fonctionnalités restent déclaratives : props encore partagés au lieu d'être des bitmaps indépendants, PNJ d'annexes génériques, entraînement non jouable, archives MIRE non physiques et CCTV/verrouillage sans contrôle local complet.

Dépendances :

1. produire/valider les props latéraux orthographiques manquants, leurs alphas et leur échelle canonique ;
2. finir les interactions physiques et les états de salle avant de multiplier les variantes d'art ;
3. affecter des PNJ dédiés et des animations propres aux annexes ;
4. ajouter des tests d'intégration pour entraînement, MIRE et verrouillage, puis une QA visuelle 1280×720 de chaque porte et raccord.

## 2. BIOFORGE — spawn contrôlé d'ennemis

Conversation : `6a98c871-61ac-83ed-be5c-600c473690e2`

### Demandes exactes

> Nouvelle idée faire une zone (où les ennemies peuvent pas sortir )dans le tentalus pour faire Spawn et via une liste l ennemi de son choix (ou un certain nombre) via un printer d ennemies

Puis, après « Réessaye » :

> Ok donc pour codex et open ai image fait moi la liste de tout les sprite a faire pour avoir cette mission cent pour cent couvertes

### Promesse/plan visible dans la conversation

- arène physiquement séparée du hub avec sas, confinement inviolable, purge et retour propre ;
- terminal permettant le choix du type et de la quantité d'ennemis ;
- « printer » organique/industriel, file de production, état de session et résultats ;
- aucun organisme autorisé dans le hub normal ;
- couverture art exhaustive annoncée : **571 atlases d'ennemis uniques + 95 visuels de zone**, soit 666 entrées.

### Preuves dans le dépôt

- `src/tantalus-hub-expansion-v71.js` déclare une annexe `bioforge`, mais marque comme différés `enemy-selection`, `quantity-selection`, `spawn-printing` et `separate-progression`. La cible `bioforge-experimental-level` n'est pas implémentée comme mission autonome.
- `src/hub-annex-services-v71.js` ne fournit qu'un cycle d'isolation/sas et garantit `organismsInHub: 0`.
- `tests/hub-annex-services-v71.test.mjs` nomme explicitement le cas : « BIOFORGE reste un sas sans donnée de spawn » et vérifie l'absence de roster, quantité et printer.
- `src/special-operations-v67.js` classe l'opération `missing`, `playable: false`, sans preuve runtime dédiée.
- Aucun runtime de session BIOFORGE, aucun directeur de spawn et aucun jeu d'atlases propre à cette mission n'a été trouvé.

### Écart restant, statut et dépendances

**Statut : MISSING — priorité P0.** Il existe un vestibule de confinement utile, mais pas la boucle demandée. Ce support ne doit pas être confondu avec une mission jouable.

Dépendances critiques, dans cet ordre :

1. modèle de sécurité : limites infranchissables, purge garantie, destruction des entités et restauration atomique du hub ;
2. session isolée : roster autorisé, quantité plafonnée, budget de performance, progression/sauvegarde séparée ;
3. directeur de spawn, terminal et états d'échec/sortie ;
4. seulement ensuite, couverture d'atlases par caste réellement disponible. Le chiffre 666 de la conversation est un budget de production, pas une couverture repo acquise.

## 3. Protocole Z-110 — extermination en Power Loaders

Conversation : `6a98dfeb-7284-83eb-a015-bf964b8b1229`

### Demandes exactes

> Fait moi une mission forte exterminations avec les Power loader nouvelle gen aperçu dans Alien genocide

Puis :

> Ok donc pour codex et open ai image fait moi la liste de tout les sprite a faire pour avoir cette mission cent pour cent couvertes

### Promesse/plan visible dans la conversation

- mission d'extermination lourde dans une ruche/arène, avec choix de route rouge ou noire ;
- quatre Power Loaders spécialisés : Atlas, Vulcain, Cerbère et Méduse ;
- systèmes de gel, hydraulique, chaleur, casque, dégâts localisés et exécutions mécaniques ;
- phases de siège, grosses castes et boss final Morrigan ;
- manifeste d'animations et de décors présenté comme une couverture à 100 %.

### Preuves dans le dépôt

- `src/special-operations-v67.js` contient l'entrée de traçabilité `protocol-z110`, mais la classe `missing`, `playable: false`, sans fichier runtime ni test associé.
- Les recherches sur les sources, tests et assets ne trouvent ni `Z-110`, ni les machines Atlas/Vulcain/Cerbère/Méduse, ni Morrigan.
- Les assets génériques de P-5000 et de Ripper/Queen présents ailleurs ne constituent pas les variantes mécaniques, les états de dommage ou le boss demandés.
- Aucun test mission, reprise, boss, dégâts localisés ou art dédié à Z-110 n'existe.

### Écart restant, statut et dépendances

**Statut : MISSING — priorité P1.** La conversation est représentée dans le registre d'audit, pas dans le jeu.

Dépendances :

1. verrouiller le level design et les volumes de collision adaptés aux quatre gabarits avant l'art final ;
2. créer un runtime commun de mécha avec chaleur, intégrité par sous-système, armes et sorties de secours ;
3. implémenter les quatre loadouts, les routes et Morrigan avec tests de phase/reprise ;
4. générer ensuite les sheets dédiées : locomotion, outils/armes, impacts, surchauffe, destruction, boss et décors de ruche.

## 4. MIRE — reconstitution des événements d'`Alien`

Conversation : `6a98e050-1748-83eb-8c5b-a7dd4bc1ac26`

### Demandes exactes

> Fait moi une mission (je ne sais pas comment dans le tantalus on va l implémenter mais en gros on rejoue les événements historiques en replay,je crois déjà que. Lon a implémenter quelque chose qui fait cela ) qui refait les événements d Alien 1

Puis :

> Ok donc pour codex et open ai image fait moi la liste de tout les sprite a faire pour avoir cette mission cent pour cent couvertes

### Promesse/plan visible dans la conversation

- accès depuis le Tantalus via MIRE, sous forme de reconstitution historique isolée ;
- chronologie jouable du Nostromo : réveil, signal, Derelict, infestation, traque, autodestruction et fuite ;
- équipage et créatures propres au film, score de synchronisation, embranchements encadrés ;
- sauvegarde distincte du présent et restitution contrôlée des conséquences ;
- manifeste complet des personnages, environnements, props, effets et animations.

### Preuves dans le dépôt

- `src/content-core-v50.js` génère des paires MIRE/FRONTIER génériques. La campagne `pair-001-mire` est bien intitulée « Alien 1979 — Reconstitution 001 », avec le canon `archive-reconstruction`, mais son objectif reste générique (`rescue survivors`) et elle utilise les systèmes de niveau communs.
- `src/campaign-consequences.js` gère les conséquences des paires ; `tests/campaign-consequences.test.mjs`, `tests/content.test.mjs` et `tests/strategic-full-loop.test.mjs` vérifient cette infrastructure.
- Les annexes MIRE du hub possèdent des couches visuelles dans `assets/openai/hub/annexes/v71/mire-archives/`, sans terminal de reconstitution physique complet.
- Des assets réutilisables existent pour Big Chap, Ovomorph, Facehugger et les véhicules/éléments associés au corpus, mais aucun corpus dédié aux sept membres du Nostromo (Ripley, Dallas, Kane, Lambert, Ash, Parker, Brett), à Jones, aux scènes du Derelict et aux chapitres promis n'est relié à cette campagne.
- Aucun runtime `historical-chronicle`, lancement de chronique MIRE, score de synchronisation ou test de sauvegarde spécifique à cette reconstitution n'a été trouvé.
- `src/special-operations-v67.js` classe `mire-archive-001` `partial` et non jouable comme opération dédiée.

### Écart restant, statut et dépendances

**Statut : PARTIAL — priorité P1.** Le mode MIRE et une entrée « Alien 1979 » existent réellement, mais la mission promise n'est qu'une campagne générique habillée par métadonnées.

Dépendances :

1. écrire une chronologie de chapitres et un graphe spatial Nostromo/Derelict validés avant production d'images ;
2. implémenter le contrôleur de reconstitution, la synchronisation, les échecs et la sauvegarde isolée ;
3. produire les personnages, costumes, props et environnements latéraux dédiés avec échelles cohérentes ;
4. tester la continuité chapitre à chapitre, la reprise et l'absence de contamination de la campagne principale.

## 5. BROODSTORM — mission aérienne xéno

Conversation : `6a98d47d-68f4-83eb-9ed3-4063af4e7496`

### Demandes exactes

> Je veux faire une mission entièrement dans les air où on contrôle un drop ship et on est attaquer par divers ennemies xeno volants et en boss on a une xeno flying queen

Puis :

> Étend à fond ce que tu viens de soumettre comme idée Cette mission peut ensuite servir de fondation à tout un mode secondaire : escorte de convois, bombardement de ruches, extraction sous pression, défense de transports, interception de créatures géantes et combats contre d’autres boss aériens.

Enfin :

> Ok donc pour codex et open ai image fait moi la liste de tout les sprite a faire pour avoir cette mission cent pour cent couvertes

### Promesse/plan visible dans la conversation

- mission entièrement aérienne aux commandes d'un dropship ;
- vol multi-altitude, esquive, armements, intégrité des sous-systèmes et équipage ;
- plusieurs castes de xénos volants, essaims, créatures géantes et Flying Queen en boss ;
- fondation d'un mode secondaire : escorte, bombardement, extraction, défense et interception ;
- décors aériens parallaxes, HUD cockpit et sheets exhaustives pour chaque véhicule/créature.

### Preuves dans le dépôt

- `src/game-final-runtime.js` fournit un pilotage aérien générique via `VEHICLE_HANDLING.air` et `updateVehicleDriver`; ce n'est pas un directeur de mission BROODSTORM.
- `src/mission-insertion-v62.js` et `src/mission-insertion-ui-v62.js` implémentent une approche en dropship, testée par `tests/mission-insertion-v62.test.mjs`, `tests/mission-insertion-ui-v62.test.mjs` et `tests/mission-insertion-art-v62.test.mjs`.
- Les sheets `assets/openai/sprites/vehicles/ud-4l-cheyenne-dropship-action-sheet.png`, `ud-4l-cheyenne-dropship-access-damage-sheet.png` et `ud-4b-cheyenne-dropship-action-sheet.png` sont présentes.
- Aucun fichier de campagne/directeur BROODSTORM, aucune caste volante dédiée, aucun boss Flying Queen, aucune escouade alliée, aucun mode escorte/bombardement et aucun test correspondant n'ont été trouvés.
- `src/special-operations-v67.js` conserve l'entrée `broodstorm` en `partial`, `playable: false`, sur la seule base des briques aériennes génériques.

### Écart restant, statut et dépendances

**Statut : PARTIAL — priorité P1.** Le socle de pilotage et les dropships existent, mais aucune des boucles de combat aérien promises n'est livrée.

Dépendances :

1. définir le repère de vol 2D, les couloirs d'altitude, limites caméra et profils de collision ;
2. créer un directeur aérien, le ciblage, les dégâts de sous-systèmes et la reprise ;
3. implémenter au moins une caste volante complète puis le boss multi-phase avant d'étendre aux autres modes ;
4. produire backgrounds parallaxes, avant-plans, projectiles, impacts, HUD et sheets avec silhouettes lisibles aux tailles runtime.

## 6. LE COCON NOIR — extraction de la ruche

Conversation : `6a98e0e1-2b98-83eb-9cd4-e9772768b977`

### Demandes exactes

> Fait moi une mission extraction du hive ou le joueur se réveille dans un cocon de résine dans le hive arrive à se détacher et doit s exfiltrer en demi discrétions pour retourne dehors a se faire extraire pour retour sur le use tantalus

Puis :

> Ok donc pour codex et open ai image fait moi la liste de tout les sprite a faire pour avoir cette mission cent pour cent couvertes

### Promesse/plan visible dans la conversation

- départ du joueur immobilisé dans un cocon, libération interactive et état blessé ;
- infiltration/semi-furtivité, récupération progressive de l'équipement et montée d'alerte de la ruche ;
- Veilleur/traqueur, faux point d'extraction, routes alternatives et extraction finale vers l'USS Tantalus ;
- conséquences médicales/quarantaine au retour ;
- sprites dédiés du cocon, joueur, castes de ruche, secours, props organiques et environnements.

### Preuves dans le dépôt

- `src/enemy-ovomorph-cycle-v66.js` fournit un vrai cycle Ovomorph avec ouverture, libération du Facehugger et reprise ; il est couvert par `tests/enemy-ovomorph-cycle-v66.test.mjs` et `tests/enemy-ovomorph-status-production-v66.test.mjs`.
- `src/game-complete-core.js` possède seulement un objectif générique `escape-quarantine`, testé au niveau générique par `tests/mission-objectives.test.mjs`.
- Des assets d'œuf/reine/ruche existent, mais aucune campagne dédiée au Cocon noir, aucun état joueur coconné, aucune locomotion blessée, aucun système de discrétion/alerte de ruche, aucun Veilleur, aucune fausse extraction et aucun retour médical spécifique n'ont été trouvés.
- `src/special-operations-v67.js` classe `black-cocoon` `partial`, `playable: false`; les preuves référencées sont génériques et ne suffisent pas à constituer cette mission.

### Écart restant, statut et dépendances

**Statut : PARTIAL — priorité P1.** L'écosystème Ovomorph est une brique réelle, mais il ne couvre pas la mise en scène ni la boucle d'évasion demandées.

Dépendances :

1. créer le niveau continu cocon → ruche → extérieur → zone d'extraction, avec raccords et raccourcis cohérents ;
2. implémenter les états coconné/blessé, la furtivité, le bruit et l'alerte globale ;
3. ajouter le Veilleur, les deux routes, le faux signal et la logique d'extraction/retour au Tantalus ;
4. produire les animations contextuelles et props organiques après gel des volumes de collision, puis tester mort/reprise à chaque phase.

## 7. LA DERNIÈRE COURSE DU TANTALUS — APC contre hordes

Conversation : `6a98d3ea-99ac-83ed-b765-6932483ddbe1`

### Demandes exactes

> Je veux faire une mission. Ou on pilote un apc qui est sur la droite de l écran à fond en roulant et à gauche des horde de xeno s approche et on doit tirer dessus avec l apc et des fois des crisser arrive comme mini boss de cette mission et un boss final arrive après

Puis :

> Ok donc pour codex et open ai image fait moi la liste de tout les sprite a faire pour avoir cette mission cent pour cent couvertes

### Promesse/plan visible dans la conversation

- APC ancré sur la droite, déplacement forcé/autoscroll et hordes arrivant de la gauche ;
- tir depuis l'APC, lanes/hauteurs d'attaque, xénos accrochés au véhicule et obstacles de route ;
- Crushers comme mini-boss récurrents puis boss final, avec phases et poursuite ;
- HUD véhicule, dégâts localisés, score et variantes de mode horde ;
- couverture complète des sheets APC, passagers, ennemis, boss, route, effets et interface.

### Preuves dans le dépôt

- `src/game-v51-runtime.js` instancie bien un `M577 Armored Personnel Carrier` et fournit conduite/tourelle dans le runtime générique ; `src/game-final-runtime.js` complète la maniabilité des véhicules.
- Les sheets `assets/openai/sprites/vehicles/m577-command-apc-action-sheet.png`, `m577-command-apc-access-damage-sheet.png`, `m577-apc-action-sheet.png` et `m577-apc-access-damage-sheet.png` sont présentes, ainsi que leurs versions normalisées.
- Les tests véhicule génériques (`tests/vehicle-visual-runtime-v55.test.mjs`, `tests/vehicle-hitbox-runtime-v55.test.mjs`, `tests/vehicle-deployment-gates-v60.test.mjs`) valident des briques communes, pas cette mission.
- Aucun runtime d'autoscroll horizontal, aucun directeur de lanes/horde, aucun script de Crushers, aucune phase de boss finale, aucun HUD dédié ni test de la « Dernière Course » n'ont été trouvés.
- `src/special-operations-v67.js` classe `last-course-tantalus` `partial`, `playable: false`, en s'appuyant seulement sur l'APC générique.

### Écart restant, statut et dépendances

**Statut : PARTIAL — priorité P1.** L'APC peut être conduit et possède des assets, mais le format de mission spécifique n'existe pas.

Dépendances :

1. figer caméra, vitesse du rail, lanes et fenêtre de tir avant de dimensionner les sprites ;
2. implémenter directeur de vagues, collisions d'accrochage, dommages APC et cadence des mini-boss ;
3. créer le boss final multi-phase, checkpoints et modes score/horde ;
4. générer les états APC et ennemis manquants à la taille d'affichage réelle, puis tester lisibilité et continuité des raccords de route.

## 8. CARGO BRUTAL — mission Power Loader

Conversation : `6a98dfcb-a2e4-83ed-b3c2-606a9384c6e4`

### Demandes exactes

> Fait moi une mission avec le Power loader

Puis :

> Ok donc pour codex et open ai image fait moi la liste de tout les sprite a faire pour avoir cette mission cent pour cent couvertes

### Promesse/plan visible dans la conversation

- mission « Cargo Brutal » centrée sur un P-5000 : restaurer l'énergie, monter dans le loader, dégager la soute, escorter des survivants, porter un noyau, affronter une Matriarche et extraire ;
- objets lourds et portes physiques, hydraulique/intégrité, échec si le loader ou le convoi est perdu ;
- sauvegarde/reprise et récompenses stratégiques ;
- sheets dédiées du P-5000, des survivants, des props et de la Matriarche, annoncées comme couverture à 100 %.

### Preuves dans le dépôt

- `src/cargo-brutal-runtime-v67.js` implémente huit phases : `restore-power`, `mount-loader`, `clear-route`, `escort-convoy`, `retrieve-core`, `carry-core`, `matriarch`, `extract`.
- La boucle possède de vrais échecs, trois survivants, obstacles, noyau lourd, boss à trois phases, extraction, état sérialisé et enrichissement de récompenses.
- `src/cargo-brutal-visuals-v67.js` relie deux atlases dédiés : `assets/openai/sprites/normalized/props/cargo-brutal-props-atlas-v67.png` et `assets/openai/sprites/normalized/npcs/cargo-survivors-shaw-ruiz-kessler-v67.png`.
- Le P-5000 dispose de `assets/openai/sprites/vehicles/p-5000-powered-work-loader-action-sheet.png` et `p-5000-powered-work-loader-access-damage-sheet.png`, également normalisés.
- `tests/cargo-brutal-v67.test.mjs` couvre phases, échecs, portes, loader, convoi, boss, reprise et récompense idempotente ; `tests/cargo-brutal-art-v67.test.mjs` couvre les atlases dédiés.
- L'écart vérifiable est dans `src/cargo-brutal-runtime-v67.js` : la Matriarche utilise encore `spriteKey: 'xenoQueen'`, `visualSheetId: 'enemy.xenomorph-queen.combat'` et `visualApproximation: true`. Elle n'a donc pas sa sheet dédiée promise.
- `src/special-operations-v67.js` marque l'opération `effective`, `playable: true`, ce qui est juste pour la boucle de gameplay, mais pas pour la couverture art exhaustive.

### Écart restant, statut et dépendances

**Statut global : PARTIAL — priorité P2.** La demande initiale « mission avec le Power Loader » est **DONE** côté gameplay. Le lot conversationnel complet reste **PARTIAL** parce que la Matriarche est explicitement un asset partagé approximatif et que le manifeste « 100 % » n'est pas livré intégralement.

Dépendances :

1. produire une sheet Matriarche Cargo dédiée, calée sur la hitbox et les trois phases déjà implémentées ;
2. remplacer les fallbacks visuels survivants restants seulement après validation des frames runtime ;
3. ajouter un test interdisant `visualApproximation: true` sur cette opération lorsque l'asset final est branché ;
4. effectuer une QA visuelle du P-5000, du noyau, des portes et du boss aux résolutions de jeu.

## Ordre de production recommandé

1. **P0 BIOFORGE** : sécurité de confinement et session isolée avant toute génération massive.
2. **P1 socles de mission** : Z-110, chronique MIRE, BROODSTORM, Cocon noir et Dernière Course. Pour chacun, figer d'abord topologie, caméra, collisions, phases, reprise et conditions d'échec.
3. **P1 hub** : solder les cinq dettes V71/V72 afin que les accès à ces opérations soient physiques et cohérents.
4. **P2 Cargo Brutal** : remplacer la Matriarche partagée et fermer la couverture art.
5. **Production visuelle** : générer par lots seulement les sheets reliées à un runtime et à une taille/collision validées. Les grands nombres promis dans les chats ne doivent pas être comptés comme contenu jouable avant branchement et test.

## Validation exécutée pendant l'audit

Commande :

```text
node --test tests/special-operations-v67.test.mjs tests/cargo-brutal-v67.test.mjs tests/cargo-brutal-art-v67.test.mjs tests/tantalus-hub-expansion-v71.test.mjs tests/hub-v71-runtime.test.mjs tests/hub-v71-art.test.mjs tests/hub-table-art-v72.test.mjs tests/hub-annex-services-v71.test.mjs
```

Résultat : **70 tests réussis, 0 échec, 0 ignoré**. Cette validation prouve le registre de traçabilité, le hub/annexes, la correction de table, le sas BIOFORGE sans spawn et la boucle Cargo Brutal. Elle ne transforme pas les cinq missions sans runtime dédié en fonctionnalités terminées.
