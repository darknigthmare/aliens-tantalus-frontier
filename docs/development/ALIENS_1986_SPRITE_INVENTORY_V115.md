# Sprites Aliens (1986) V115 — inventaire rapproché

État de preuve : **preparatory-snapshot**. Instantané UTC : 2026-11-25T21:20:23.929801+00:00.

Les fichiers produits, les candidats existants, les poses, les états secondaires et le raccordement au jeu sont distingués. Les nouveaux assets ne sont pas chargés par le runtime V114 ; la fidélité 1:1 reste à valider visuellement.

[Galerie de revue](aliens-1986-sprites-v115/index.html) · [Manifeste des fichiers](aliens-1986-sprites-v115/manifest.json) · [Inventaire complet JSON](ALIENS_1986_SPRITE_INVENTORY_V115.json) · [Revue d’intégration](ALIENS_1986_RASTER_INTEGRATION_REVIEW_V115.md)

## Fichiers et périmètre

| Mesure | Valeur |
|---|---:|
| Entrées stables de l’inventaire | 81 |
| Essais consignés dans le ledger | 92 |
| Sujets produits en PNG transparents | 70 |
| Fichiers distincts reliés aux 81 entrées | 69 |
| Suppléments distincts hors inventaire | 1 |
| Fichiers existants audités | 26 |
| Bases existantes retenues pour une portée statique précise | 10 |
| Assets déclarés par le manifeste assemblé | 70 |

Les 81 entrées comprennent 16 personnages, 24 équipements, 26 décors, 5 créatures et 10 variantes. Ce total n’est pas un nombre de fichiers : une entrée peut demander plusieurs composants ; un même fichier peut servir au récepteur ou au moniteur référencé par plusieurs entrées. Les fichiers sont dédupliqués par SHA-256.

| Statut des besoins | Entrées | Signification |
|---|---:|---|
| `generated` | 48 | Les images fixes explicitement requises à ce niveau ont été produites ; aucun statut de fidélité ou intégration n’est inféré. |
| `partial` | 22 | Au moins une base/composante existe, mais des poses, états, éléments ou corrections explicites restent à fournir. |
| `existing-candidate` | 6 | Un candidat existant est identifié, avec état d’audit explicite ; il n’est pas déclaré généré dans ce lot. |
| `missing` | 0 | Aucune image suffisante ; distinguer planifié, en cours et non planifié. |
| `blocked` | 5 | Production explicitement bloquée ou échec sans alternative recevable ; pas de contournement automatique. |

## Contrat de rendu

- PNG avec alpha réel ; un sujet complet par image de base. Une planche de poses est une source distincte, jamais un ensemble de PNG individuels déjà exportés.
- Vue latérale droite, peinture 2D mate et proportions réalistes ; projection adaptée aux supports architecturaux.
- Dimensions natives mesurées ; aucune promesse UHD. Marquages asymétriques à revoir avant un miroir vers la gauche.
- Le pivot proposé dans le manifeste reste à caler dans le moteur. Préserver taille enfant de Newt, appuis des props, profondeur et passe de lumière.
- Une arme peinte sur un personnage ne valide pas l’arme comme asset séparé. Un râtelier vide ne fournit pas son contenu.

## Les 81 entrées

La colonne « couvert » porte uniquement sur les besoins explicitement définis. `baseStatus: generated` peut coexister avec `status: partial` quand les autres poses, états ou composants manquent.

| Identifiant | Sujet | Statut | Couvert | Fichiers produits / reste |
|---|---|---|---:|---|
| `character.ripley` | Ellen Ripley | `partial` | 1/3 | ripley_idle_right_v2; walk-right (planned-or-running); interact-right (planned-or-running) |
| `character.hicks` | Dwayne Hicks | `blocked` | 0/3 | idle-right (blocked-scope); walk-right (blocked-scope); interact-right (blocked-scope) |
| `character.hudson` | William Hudson | `partial` | 1/3 | hudson_idle_right; walk-right (planned-or-running); interact-right (planned-or-running) |
| `character.newt` | Rebecca Newt Jorden | `partial` | 1/3 | newt_idle_right_v2; walk-right (planned-or-running); interact-right (planned-or-running) |
| `character.bishop` | Bishop | `partial` | 1/3 | bishop_idle_right_v2; walk-right (planned-or-running); interact-right (planned-or-running) |
| `character.vasquez` | Jenette Vasquez | `blocked` | 0/3 | idle-right (blocked-scope); walk-right (blocked-scope); interact-right (blocked-scope) |
| `character.drake` | Mark Drake | `partial` | 1/3 | drake_idle_right_v2; walk-right (planned-or-running); interact-right (planned-or-running) |
| `character.apone` | Al Apone | `partial` | 1/3 | apone_idle_right; walk-right (planned-or-running); interact-right (planned-or-running) |
| `character.gorman` | Scott Gorman | `partial` | 1/3 | gorman_idle_right; walk-right (planned-or-running); interact-right (planned-or-running) |
| `character.burke` | Carter Burke | `partial` | 1/3 | burke_idle_right_v2; walk-right (planned-or-running); interact-right (planned-or-running) |
| `character.ferro` | Colette Ferro | `partial` | 1/3 | ferro_idle_right; walk-right (planned-or-running); interact-right (planned-or-running) |
| `character.spunkmeyer` | Daniel Spunkmeyer | `partial` | 1/3 | spunkmeyer_idle_right; walk-right (planned-or-running); interact-right (planned-or-running) |
| `character.dietrich` | Cynthia Dietrich | `partial` | 1/3 | dietrich_idle_right; walk-right (planned-or-running); interact-right (planned-or-running) |
| `character.frost` | Ricco Frost | `partial` | 1/3 | frost_idle_right; walk-right (planned-or-running); interact-right (planned-or-running) |
| `character.crowe` | Trevor Crowe | `partial` | 1/3 | crowe_idle_right; walk-right (planned-or-running); interact-right (planned-or-running) |
| `character.wierzbowski` | Tim Wierzbowski | `partial` | 1/3 | wierzbowski_idle_right_v3; walk-right (planned-or-running); interact-right (planned-or-running) |
| `equipment.pulse` | M41A, fusil à impulsion | `existing-candidate` | 1/1 | Base existante ; revue détaillée dans le JSON |
| `equipment.shotgun` | Shotgun de Hicks | `partial` | 1/1 | hicks_shotgun; correction hicks_shotgun_v2 |
| `equipment.flame` | M240, incinerator | `existing-candidate` | 1/1 | Base existante ; revue détaillée dans le JSON |
| `equipment.smartgun` | M56 avec harnais | `generated` | 3/3 | smartgun_harness, smartgun_eyepiece |
| `equipment.pistol` | Pistolet USCM | `existing-candidate` | 0/1 | base (candidate-review) |
| `equipment.launcher` | Lance-grenades sous le M41A | `existing-candidate` | 1/1 | Base existante ; revue détaillée dans le JSON |
| `equipment.grenade` | Grenade USCM | `existing-candidate` | 1/1 | Base existante ; revue détaillée dans le JSON |
| `equipment.knife` | Couteau de service | `generated` | 1/1 | combat_knife |
| `equipment.tracker` | Détecteur de mouvement | `generated` | 1/1 | m314_tracker |
| `equipment.torch` | Lampe de torse | `generated` | 1/1 | shoulder_lamp_v2 |
| `equipment.welder` | Soudeur / découpe | `generated` | 1/1 | welder |
| `equipment.medical` | Matériel médical | `generated` | 1/1 | medical_kit |
| `equipment.sentry` | Sentinelle automatisée | `partial` | 1/2 | oriented-states (planned-or-running) |
| `equipment.beacon` | Balises / fusées de secours | `generated` | 1/1 | beacon |
| `equipment.comms` | Radio / liaisons de section | `generated` | 1/1 | comms |
| `equipment.camera` | Caméra de casque et moniteurs APC | `generated` | 2/2 | helmet_camera, apc_monitors |
| `equipment.armor` | Armure, casque et lampe USCM | `generated` | 3/3 | uscm_armor, uscm_helmet, shoulder_lamp_v2 |
| `equipment.uplink` | Liaison distante de Bishop | `generated` | 1/1 | bishop_uplink |
| `equipment.casey` | Casey, tête de poupée | `generated` | 1/1 | casey_head_v2 |
| `equipment.loader` | P-5000 | `generated` | 1/1 | p5000_right |
| `equipment.apc` | M577 APC | `existing-candidate` | 1/1 | Base existante ; revue détaillée dans le JSON |
| `equipment.dropship` | UD-4L dropship | `generated` | 2/2 | ud4l_landed_right |
| `equipment.locator` | Balise de localisation / bracelet | `generated` | 2/2 | locator_wrist, locator_receiver |
| `equipment.specimen` | Cuve à facehugger | `generated` | 1/1 | specimen_jar |
| `decor.cryo-pod` | Caisson de cryostase Sulaco | `generated` | 1/1 | cryopod_sulaco |
| `decor.gun-rack` | Râtelier USCM | `generated` | 1/1 | gun_rack_retry1 |
| `decor.armor-rack` | Cadre de stockage d’armures | `generated` | 1/1 | armor_rack_retry1 |
| `decor.smartgun-bench` | Banc de préparation M56 | `generated` | 1/1 | smartgun_bench |
| `decor.cryo-pillow` | Oreiller / literie médicale | `generated` | 1/1 | gateway_pillow |
| `decor.gateway-photo` | Photo encadrée Gateway | `generated` | 1/1 | gateway_photo |
| `decor.meal-tray` | Plateau repas Sulaco/Hadley | `partial` | 1/2 | meal_tray; food (planned-or-running) |
| `decor.flight-display` | Tableau de bord dropship | `generated` | 1/1 | flight_console |
| `decor.apc-monitors` | Baie de moniteurs M577 | `generated` | 1/1 | apc_monitors |
| `decor.operations-console` | Console Operations | `generated` | 1/1 | operations_console |
| `decor.cargo-crate` | Caisse de fret Sulaco | `generated` | 1/1 | cargo_crate |
| `decor.industrial-pipe` | Module de conduites du processeur | `generated` | 1/1 | industrial_pipe |
| `decor.drain-grate` | Grille de drainage | `generated` | 1/1 | drain_grate |
| `decor.colonist-cocoon` | Colon coconné | `generated` | 1/1 | colonist_cocoon |
| `decor.resin-column` | Colonne de résine ruche | `generated` | 1/1 | resin_column |
| `decor.ovipositor` | Ovipositeur de la Reine | `generated` | 1/1 | ovipositor |
| `decor.egg-cluster` | Œufs de la nurserie | `generated` | 1/1 | egg_cluster |
| `decor.armament-case-closed` | Caisse M240 fermée | `generated` | 1/1 | armament_case_closed |
| `decor.armament-case-open` | Caisse M240 ouverte / vide | `generated` | 1/1 | armament_case_open |
| `decor.supply-case` | Caisse de réserve | `partial` | 1/4 | supply_case; medical-empty (planned-or-running); ammo-closed (planned-or-running); ammo-empty (planned-or-running) |
| `decor.beacon-case` | Coffret de balises | `generated` | 2/2 | beacon_case_v2, beacon_case_closed |
| `decor.alarm-unit` | Sirène / diagnostic | `generated` | 1/1 | alarm_unit |
| `decor.wall-light` | Luminaire mural | `generated` | 1/1 | wall_light |
| `decor.industrial-tug` | Tracteur de service | `generated` | 1/1 | industrial_tug_v2 |
| `decor.door-leaf` | Battant de porte | `partial` | 1/4 | door_leaf; damaged (planned-or-running); reinforced (planned-or-running); breached (planned-or-running) |
| `decor.door-jambs` | Encadrement de porte | `generated` | 1/1 | door_frame_v2 |
| `creature.warrior` | Warrior Aliens 1986 | `partial` | 1/4 | movement (planned-or-running); attack (planned-or-running); death (planned-or-running) |
| `creature.facehugger` | Facehugger | `partial` | 1/4 | facehugger_idle_right; movement (planned-or-running); attack (planned-or-running); death (planned-or-running) |
| `creature.egg` | Œuf / ovomorphe | `generated` | 2/2 | egg_open |
| `creature.queen` | Reine Aliens 1986 | `partial` | 1/4 | movement (planned-or-running); attack (planned-or-running); death (planned-or-running) |
| `creature.chestburster` | Chestburster | `blocked` | 0/4 | idle-right (blocked-scope); movement (blocked-scope); attack (blocked-scope); death (blocked-scope) |
| `variant.ripley-gateway` | Ripley à Gateway, désarmée | `generated` | 1/1 | ripley_gateway |
| `variant.ripley-hive-rescue` | Ripley au sauvetage, ensemble M41A/M240 | `generated` | 1/1 | ripley_hive_rescue |
| `variant.ripley-loader` | Ripley aux commandes P-5000 | `generated` | 1/1 | ripley_loader |
| `variant.hicks-wounded` | Hicks blessé, extraction et final | `blocked` | 0/1 | base (blocked-scope) |
| `variant.bishop-damaged` | Bishop endommagé au final | `generated` | 1/1 | bishop_damaged |
| `variant.gorman-wounded` | Gorman après sa blessure | `generated` | 1/1 | gorman_wounded |
| `variant.newt-drain` | Newt au drainage | `generated` | 1/1 | newt_drain |
| `variant.locator-receiver` | Récepteur de localisation séparé | `generated` | 1/1 | locator_receiver |
| `variant.m41a-m240-assembly` | Assemblage fusil/incinerator de Ripley | `blocked` | 0/1 | base (blocked-scope) |
| `variant.smartgun-harness-eyepiece` | Harnais M56 et oculaire | `generated` | 2/2 | smartgun_harness, smartgun_eyepiece |

## Blocages conservés

- **character.hicks** : Character generation explicitly blocked by image service; do not retry by changing identity/phrasing.
- **character.vasquez** : Character generation explicitly blocked by image service; do not retry by changing identity/phrasing.
- **creature.chestburster** : Generation explicitly blocked by image service.
- **variant.hicks-wounded** : No separate attempt: same Hicks scope held after parent instruction, not an invented tool rejection.
- **variant.m41a-m240-assembly** : Combined M41A/M240 generation explicitly blocked by the image service, per parent update. Do not rephrase or attempt a workaround.

## États et animations restant à traiter

| Entrée | Besoin sans job prévu dans le plan reçu | Validation procédurale possible |
|---|---|---|

L’inventaire conserve **44 groupes d’animation**. Les poses de base ne les couvrent pas automatiquement. Le plan des planches et les reçus de poses sont distincts des boucles, timings et animations effectivement raccordés au jeu.

Une grille prévue, même accompagnée d’un fichier, doit être revue par cellule : sujet complet, pose distincte, alpha, orientation, continuité du costume et ligne de sol. Les dimensions ne doivent pas être supposées divisibles par la grille ; conserver les rectangles natifs mesurés. Aucune boucle fluide ou animation runtime n’est annoncée ici.

## Réutilisations et réserves de sujet

- Le M41A existant couvre son lance-grenades inférieur visible. Une arme flottante séparée n’est pas requise.
- La M40 auditée représente l’état sans capuchon ; l’état de transport reste distinct.
- Les bases VP70 et couteau restent candidates pour leurs détails ; leur existence n’est pas une certification de modèle filmique.
- Le soudeur blanc/laiton historique diffère du prop original ; une nouvelle base ne doit pas lui attribuer rétrospectivement une validation film.
- Les planches historiques détecteur/médical/soudure ont un vrai alpha, mais leurs cellules ne sont pas des PNG individuels exportés.
- Le cockpit frontal complet ne couvre pas le petit prop de console latérale. L’appui-tête de cryosommeil ne couvre pas l’oreiller du lit Gateway.
- Harnais et viseur du smartgun sont deux composants séparés. Le P5000 vide et Ripley dans le P5000 sont deux états distincts.

## Reproductibilité de l’instantané

- SHA-256 du ledger : `d00ef8db7f01abdc5b62fb69582626616f42a6902a35a68ccd5b02bf34dba64b`.
- SHA-256 du mapping : `670e0cfc9e289faad1f67fa2df9d113bb3fc73f45bcb80c162107d9dad65f179`.
- Manifeste correspondant à ce ledger : **True**.
- Tailles et SHA des fichiers déclarés vérifiés : **True**.
- Sujets du ledger sans mapping : **0**.

Le JSON conserve les preuves par fichier et par besoin. Les fichiers proposés et les tests d’admission ne démontrent ni le chargement raster en jeu ni la ressemblance 1:1.
