# Lot V188 : priorités P0 et P1 de la bible

Document de développement, uniquement dans les sources. Les priorités et les valeurs proposées se trouvent au [§56 de la bible](../narrative/CAMPAGNE_PRINCIPALE.md). Ce document décrit ce qui a été raccordé, comment le vérifier et ce qui reste ouvert.

## Cadre

- Décisions du propriétaire du 2026-11-12 :
  - classement P0/P1 validé ;
  - levée de la protection de `src/save.js` ;
  - valeurs chiffrées proposées par Claude, marquées **[PROPOSÉ]** ;
  - outils IA commités dans un commit séparé.
- Chaîne d'audit : `scripts/audit-tantalus-priorities-v188.mjs` prolonge V183 → V187.
  - Chaque fichier existant modifié reçoit un reçu exact (prédécesseur à `803db26`, successeur actuel).
  - Les préservations de V187 passent maintenant par cette chaîne.
- Sauvegarde : tous les nouveaux champs sont **additifs**. Une sauvegarde ancienne reçoit une valeur par défaut et ne perd rien. Le `saveSchema` reste 52. Les nouveaux champs sont :
  - `storyCampaignV188` ;
  - `reactiveLinesV188` ;
  - `player.originV188` ;
  - dans `settings` : `crewPermadeathV188`, `customDifficultyV188`, `colorblindV188`, `textScaleV188` et `keyBindingsV188`.
- Outils IA :
  - Spec Kit et Claude Code Game Studios ont été adoptés aux révisions de `.ai-tools/sources.json`.
  - Leurs 644 fichiers sont listés avec leur empreinte dans `.ai-tools/adopted-v188.json`. Ils restent source uniquement et sont refusés dans un build.
  - Superpowers est un plugin du client : il a été chargé pour la session à la révision vérifiée, sans être commité.

## Ce qui est raccordé

| # | Module | Raccordement |
| --- | --- | --- |
| P0-1 | `src/story-campaign-v188.js` | Étape de la première heure dérivée des machines existantes. QZ-18 est planifié après Port-Méridien. Objectif du hub. Compte rendu marqué lu aux Opérations. |
| P0-2 | `src/audio-cues-v188.js`, `scripts/generate-audio-v188.mjs` | 40 bruitages WAV synthétisés hors ligne, branchés aux événements, aux pas selon le sol, au tir par arme et au clic à vide. |
| P0-3 | `src/audio.js`, `src/audio-assets-v77.js` | Ambiances alerte, boss, fins et calme pilotées par le directeur de tension et les boss. Repli sur les musiques existantes. |
| P0-4 | `src/mission-objective-panel-v188.js` | Objectifs en pause et avec la touche M (O sert au tir de J2 en coop), en FR et EN. |
| P0-5 | `src/combat-feel-v188.js` | Secousse par tir, marqueur d'impact, recul de 4 px et confirmation d'élimination, tous soumis au réglage de secousses. |
| P0-6 | `src/tension-director-v188.js` | Intensité, pic et relâche garantie. Les vagues de horde attendent la phase de montée. |
| P0-7 | `src/tension-director-v188.js` | Faux échos du détecteur en Horreur et en Tension, avec leur source révélée à l'approche. |
| P0-8 | `src/mission-register-v188.js` | Registre par mission. Sauvegarde libre hors combat ou terminal de 3 s selon le registre. |
| P1-1 | `src/caste-behaviors-v188.js` | Drone qui recule devant l'arme, rôdeur qui attend puis contourne, embusqué immobile puis bondissant. |
| P1-2 | `src/run-options-v188.js`, `src/save.js` | Mort définitive au choix : blessure grave de 3 jours au lieu du mémorial. Elle peut être désactivée, jamais réactivée. |
| P1-3 | `src/run-options-v188.js`, créateur | 20 origines, `origin-20` par défaut. Capacités raccordées : `origin-13` et `origin-18`. |
| P1-4 | `src/run-options-v188.js`, `src/game-runtime.js` | Difficulté `custom` : six valeurs bornées et récompense calculée. |
| P1-5 | `src/accessibility-v188.js` | Mode daltonien, taille du texte, sous-titres de 17 sons, remappage de 14 actions. |
| P1-6 | `src/reactive-lines-v188.js` | Répliques après une mission ratée, une perte de colons ou un retour blessé, sans répétition pendant 3 jours. |

## Mesure du tir (P0-5)

Scène commune : `scripts/verify-combat-feel-v188.mjs`. Une cible est placée à 260 px et le joueur tire en continu pendant 1,5 s, avec la passe désactivée puis activée.

| Mesure | Avant | Après |
| --- | --- | --- |
| Tirs acceptés | 12 | 12 |
| Santé restante de la cible | 200 | 200 |
| Secousse maximale | 0 | 0,07 (amplitude ≈ 0,5 px au réglage par défaut) |
| Confirmations d'impact | 0 | 10 |
| Recul cumulé de la cible | 0 px | 40 px |

Avec la réduction des mouvements activée, aucune secousse n'est produite et les marqueurs d'impact restent. Ces chiffres décrivent la quantité de retours ajoutés. Ils ne prouvent pas une meilleure sensation : celle-ci reste à juger en test de jeu (§53.11).

## Vérifications

Toutes les suites listées ci-dessous ont été exécutées.

- Suites V188 dans `npm run test:priorities:v188` :
  - audit et outils ;
  - registre, tension et faux échos ;
  - tranche et objectifs ;
  - audio ;
  - tir ;
  - options de partie ;
  - accessibilité ;
  - répliques ;
  - castes.
- Elles s'appuient sur le vrai `GameEngine`, avec seulement les API du navigateur remplacées (`scripts/engine-host-v188.mjs`). Elles appellent aussi les vrais `beginOperation` et `resolveOperation`.
- Suite complète de référence `npm run test:all` :

  | Commit | Tests | Réussis | Échecs | Ignorés |
  | --- | --- | --- | --- | --- |
  | `main` (`803db26`) | 4 103 | 4 102 | 0 | 1 |
  | `e485f0a` | 4 130 | 4 129 | 0 | 1 |

  Le résultat de la tête finale figure dans la description de la branche.
- `npm run check`, `npm run build` et `npm run check:built` réussissent. Les 11 nouveaux modules d'exécution sont ajoutés à la coquille hors ligne de `sw.js`. `npm run i18n:check` donne 6 074 textes exacts et 441 modèles.
- Chromium, sur le serveur `scripts/dev.mjs` :
  - chargement de l'app sans erreur de console ;
  - présence des réglages ;
  - nouvelle partie par le créateur : l'origine choisie et la mort définitive désactivée sont enregistrées dans la sauvegarde ;
  - libellés anglais affichés après le changement de langue.

## Passe 2 (2026-11-12)

| Point | Résultat |
| --- | --- |
| Plafond (P1-1) | Un drone éligible sur trois s'accroche sous une vraie plateforme située 200 à 420 px au-dessus de son sol. Il reste immobile, donc invisible au détecteur, et il est dessiné à l'envers. Il se laisse tomber sur le joueur qui passe dessous ou quand il est touché. Il quitte le plafond si un autre système le déplace. Pas de plafond dans les missions Ruche ni dans les chapitres `special-`. |
| Terminal (P0-8) | Une console de remplacement est dessinée en primitives Canvas, sans image, au checkpoint sécurisé, avec l'invite « TERMINAL · SAUVEGARDER » à portée. |
| Fins (P0-3) | L'ambiance `ending` joue au Commandement une fois les quatre chapitres jouables de Cocyte terminés. |
| Touche des objectifs (P0-4) | C'est maintenant M, car O sert au tir de J2 en coop locale. Le remappage couvre 14 actions, avec Viser (Maj) et S'accroupir (Z). |
| Tranche (P0-1) | Les joueurs passent par le Commandement (table tactique), où QZ-18 était 112ᵉ sur 121 ordres. Il est désormais en tête, marqué ★ et présélectionné. Les objectifs nomment la table tactique de la salle de briefing. |
| Origines (P1-3) | 16 capacités sur 19 sont raccordées : 01, 02, 04 à 10, 12 à 15, 17 à 19. |
| Taille du texte (P1-5) | Les 108 tailles en `px` des écrans du joueur suivent le réglage. |
| Répliques (P1-6) | La réplique récente est reprise pendant 3 jours dans « La dernière sortie » du panneau d'équipage. |

QA Chromium de la passe 2, à partir d'une sauvegarde injectée « Port-Méridien terminé » :
- objectif du hub correct ;
- sortie vers le Commandement : « ★ QZ-18 · LE DERNIER RELAIS » en tête et présélectionné ;
- plan opérationnel affiché ;
- `plannedCampaignId` enregistré ;
- aucune erreur de console.

## Prologue (2026-11-13)

Le §4 et le retour de QZ-18 (§5.2) sont joués par `src/story-cinematics-v188.js`. C'est un lecteur Canvas 2D aux plans scriptés, avec les portraits relus de l'équipage, passable et revisible depuis Système → Cinématiques. Les décors sont des placeholders en primitives ; aucune image n'a été générée. Les déclencheurs sont détaillés au §56.7 de la bible.

| Vérification | Résultat |
| --- | --- |
| `scripts/verify-story-cinematics-v188.mjs` | Durées conformes au §10. Textes FR et EN. Textes de la bible repris à l'identique. Chaque plan est dessiné dans les deux langues, avec et sans réduction des mouvements. Le lecteur est testé : Échap passe, Espace avance, la fin arrive au temps prévu. Les séquences vues sont enregistrées de façon additive, et l'ordre des déclencheurs est vérifié. |
| Chromium, nouvelle partie | CIN-00 → Échap → créateur → réveil → CIN-01, avec le portrait de DAVID-8R, enregistrée dans la sauvegarde. 19 images clés relues visuellement. |
| Chromium, retour de QZ-18 | L'objectif du hub demande le compte rendu. CIN-20, puis « La signature », se jouent seulement à l'ouverture du Commandement. Cette passe a corrigé un défaut : la séquence démarrait sur l'écran titre. |

Suite de la refonte (même journée) :
- Acte I : CIN-10 à la prise de contrôle de QZ-17 (vérifiée dans Chromium à travers les cinq phases d'insertion), CIN-11 sur la route de maintenance, et retour avec Inez.
- Casier ECHO-8 dans la baie cryo : vérifié dans Chromium. Les suites du hub restent vertes.
- *La doyenne* jouée en visite guidée à la fin du quai.

Non vérifiés dans le navigateur : CIN-02, `cin-p2` et les répliques du quai. Ils exigent un parcours physique dans le hub ; leurs déclencheurs sont couverts par les tests Node.

## Reconstruction de Port-Méridien (§6.3, §56.8)

- Table dans la vue Commandement : sept chantiers à trois niveaux, coûts en ressources et en heures, limite de chantiers en attente selon les personnes ramenées.
- Une opération réussie sur Cocyte valide le plus ancien niveau en attente (+3 de stabilité) ; une opération ratée retire un niveau validé sans rendre les ressources.
- Sauvegarde additive `colonyV188`.
- Vérifications : `scripts/verify-colony-reconstruction-v188.mjs` (5 tests) ; parcours Chromium sur une sauvegarde après QZ-17 : un chantier lancé débite 400 crédits et 20 alliage, avance l'horloge de 6 h et passe « EN ATTENTE », sans erreur de page.

## Interlude : Jun Park et alerte (§5.4, §56.9)

- Pendant la crise de quarantaine, les seize PNJ suivent la routine `alert` ; une crise résolue y met fin (correction dans `src/npc-dialogue-v62.js`).
- Jun Park est retrouvé dans le conduit du support-vie ; le choix attend la créature neutralisée et Jun ramené.
- Vérifications : `scripts/verify-story-cinematics-v188.mjs` (9 tests) et les 20 suites PNJ/crises (334 tests) ; Chromium sur une sauvegarde après C-12 : 16 routines `alert`, puis l'événement de nœud du hub `hub-life-support`, injecté par `__ATF_HUB__.onAction`, enregistre `junRescued`. Le message s'affiche, sans erreur de page.

## Crédit d'ouverture (demande du propriétaire, 2026-11-13)

- Avant l'écran titre : « A fan game by Darknigthmare » sur les bitmaps d'étoiles du menu (`stars-01-distant-field`, `stars-02-near-sparks`), puis un fondu enchaîné vers le titre.
- Le titre est préparé sous le voile ; ses neuf images sont décodées pendant le crédit (attente plafonnée à 8 s). Le voile est opaque dès le premier affichage. Les étoiles n'apparaissent qu'une fois décodées. Aucun élément ne surgit.
- Crédit complet à la première ouverture d'une session de navigateur. Un rechargement dans la même session ne montre qu'un court fondu étoilé, fixé avant le premier affichage par `src/intro-boot-v188.js`. Une touche, un clic ou un toucher passe au fondu, sans atteindre le menu en dessous.
- Vérifications : `scripts/verify-intro-v188.mjs` (4 tests) ; Chromium : images du titre 9/9 décodées avant le fondu ; captures du crédit et du fondu ; rechargement en mode court sans texte ; Entrée pendant le crédit laisse le titre à l'état `idle` ; aucune erreur de page.
- Le pied de l'écran titre suit la même orthographe, celle du pseudo du propriétaire : « DARKNIGTHMARE ».

## VFX du menu principal (demande du propriétaire, 2026-11-13)

`src/title-vfx-v188.js` ajoute des effets procéduraux, sans nouveau bitmap, et lit la scène déjà affichée :

- **Éclairs d'orage** : uniquement si la planète porte une couche d'orage. Ce sont des salves de 2 à 4 flashs tous les 4,5 à 11 s, dans le banc de nuages, découpés au disque.
- **Débris en entrée atmosphérique** : une traînée tous les 9 à 19 s, le long du bord éclairé.
- **Poussière en parallaxe** : 46 particules, 22 en qualité basse.
- **Grain analogique** : rafraîchi 12 fois par seconde, désactivé en qualité basse.
- **Couche statique** : vignettage et lignes de balayage.

Les effets de planète sont dessinés sur un canvas inséré dans la scène, entre les nuages (z 39) et le vaisseau (z 47). Le vaisseau reste donc toujours devant. Le canvas est réinséré si la scène recompose ses couches.

- **Mouvement réduit** : ni éclair ni traînée ; poussière et grain immobiles.
- **Pause** : quand l'écran titre est masqué ou l'onglet en arrière-plan.
- **Vérifications** :
  - `scripts/verify-title-vfx-v188.mjs` (4 tests).
  - Chromium : orage et traînée forcés par `__ATF_TITLE_VFX_V188__` puis photographiés ; mouvement réduit émulé, 0 pixel allumé malgré un orage forcé ; boucle arrêtée après la sortie du titre ; aucune erreur.
  - Coût mesuré dans Chromium headless : environ 1,4 ms par image, sans mesure sur matériel cible.

## Salles hybrides 2D / 2,5D : prototype du hangar (bible §56.12)

- Cadrage : `specs/001-salles-hybrides-2d-25d/` (spec, plan, recherche, modèle de données, contrat, quickstart, 27 tâches).
- Code : `src/hub-depth-rooms-v188.js` (règles pures) et `src/hub-depth-runtime-v188.js` (mixin sous l'armurerie). La physique du rail reste intacte ; la profondeur `z` sert aux emprises au sol, aux interactions et au rendu trié avec occultation.
- Vérifications :
  - `scripts/verify-hub-depth-rooms-v188.mjs` (7 tests) ; les 64 suites `verify-hub-*` (405 tests) passent.
  - Chromium sur une sauvegarde au hangar :
    - profondeur bornée ; dropship et caisses bloquants, sans traversée même sur un long pas de temps ;
    - passage entre les caisses et le dropship ; invite d'embarquement à la bonne profondeur ; dialogue d'Orlov ouvert avec E ;
    - annonce avant la cloison ; réacteur resté en 2D ; sortie bloquée loin du mur et permise près de lui ;
    - profondeur −60 sauvegardée puis restaurée après rechargement ; aucune erreur.
- Performance : même page, 6 alternances de blocs de 300 images, mixin actif puis inerte (injection de mesure), joueur derrière le dropship (pire cas, calque d'occultation à chaque image) : 28,8 ms contre 27,6 ms (+4,6 %), dans Chromium sans affichage, en rendu logiciel. Sur trois exécutions séparées, la mesure variait trop (26–31 ms) pour conclure ; seule la comparaison dans la même page est retenue.

- **Ordre entre personnages (hangar)** : un PNJ devant le joueur le masque, puisque le joueur est alors dessiné avant l'équipage. Vérifié dans Chromium, Echo-9 placé un pas derrière Orlov (injection de position).

### Extension : quai de Port-Méridien en profondeur

- Le quai (P-3) devient la deuxième salle en profondeur. Le rendu trié est fait dans le dessin propre au quai : objets du sol, trois habitants, Echo-9. Le sas fermé barre tout le quai ; la pluie est fine ; l'invite remonte en haut quand le joueur marche devant.
- Les postes restent au mur : depuis l'avant, `portContactV90` refuse. La caisse de la rampe ne garde son collisionneur que près du mur. Un pas en profondeur annule une tâche immobile.
- Vérifications :
  - `scripts/verify-hub-depth-rooms-v188.mjs` (10 tests) et les suites liées au port (169 tests) passent ;
  - Chromium, escorte en cours : conteneurs bloquants, y compris au premier rang ; habitants en file derrière Echo-9 ; profondeur −80 sauvegardée dans l'état du quai ; aucune erreur.

## Cales de QZ-17 en profondeur, avec combat (spec 002, bible §56.12)

- `src/mission-depth-v188.js` : section mesurée sur le niveau généré (pont bas de `ship-cargo`, y 868, entre `dock-bulkhead` et `cargo-bulkhead`) et mixin `withMissionDepthRoomsV188`, le plus à l'extérieur de `GameEngine`. `src/depth-props-v188.js` regroupe les objets du sol partagés (conteneur QZ17).
- Vérifications :
  - `scripts/verify-mission-depth-v188.mjs` (6 tests sur le moteur réel) : déplacement ; tir dans la bande, hors bande et arrêté par un conteneur ; attaque hors bande ; détecteur ; reprise ; invariance hors de QZ-17.
  - Suites du moteur de mission : 303 tests passent.
  - Chromium : QZ-17 lancée par `launchCampaign`, Echo-9 et un rôdeur placés par injection. Conteneurs, annonce, occultation et dépressurisation visibles ; aucune erreur.
- Performance, même page, ordre alterné : un premier essai par décalage de `actor.y` coûtait +25 %. La pose de l'arme du moteur de mission se calcule à partir de `y`. Le dessin passe désormais par une translation du canvas : +0,4 % à +8 % selon l'essai (17,2–17,4 ms contre 16,1 ms), dans Chromium sans affichage.

## Limites et travail restant






- **Musiques** : les quatre ambiances jouent la musique existante tant que les morceaux Flow du propriétaire manquent (§53.2).
- **Terminal de sauvegarde** : la console est un placeholder en primitives Canvas. L'art définitif reste à produire par le propriétaire.
- **Origines** : les 19 capacités sont raccordées. Les solutions pour 03, 11 et 16 sont décrites au §56.6, encore **[PROPOSÉ]**. Le fil du dossier caviardé (§2.4.3) attend le hub Asphodèle.
- **Origines raccordées par adaptation** :
  - 02 : convoi de survivants, faute d'escorte civile en mission ;
  - 14 : conduit fermé au chalumeau, faute de casiers ;
  - 19 : « couloir étroit » mesuré comme un plafond à moins de 140 px au-dessus de la tête.
- **Castes** : les mouvements ajoutés restent bornés au sol courant.
- **Mode daltonien** : palette Canvas dédiée aux signaux d'état des portes et du guide (§56.10). Le filtre global, qui simulait le daltonisme au lieu de le compenser, est retiré. Les codes couleur des panneaux HTML ne sont pas encore recensés.
- **Répliques** : le texte est repris en français dans la réponse du mess. La réponse complète est dynamique et ne passe donc pas par le catalogue anglais.
- **Frontier Forge** : les tailles de texte de l'outil d'édition ne suivent pas le réglage, car leurs octets sont épinglés.
- **Non mesuré** : le test de la tranche par 3 à 5 joueurs (§53.11), le ressenti du tir, la peur et la durée de la première heure.
