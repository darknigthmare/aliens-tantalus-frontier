# V56 — matrice de réconciliation des assets hors ennemis et nouveaux véhicules

Audit initial du 22 août 2026, réconcilié avec les fichiers V56 présents le 24 août 2026. Le fichier compagnon [`V56_REMAINING_ASSET_MATRIX.json`](./V56_REMAINING_ASSET_MATRIX.json) est la source normative pour les identifiants, chemins, références, contrats, statuts de fidélité et interdits. Cette vue Markdown distingue désormais une cible historique, un asset accepté, un alias volontaire et une entrée bloquée sans fichier.

## Verdict quantifié

| Domaine | Entrées | Plaquettes/fichiers physiques prévus au maximum | État V56 déterminant |
|---|---:|---:|---|
| PNJ de mission | 8 | 8 | **8/8 feuilles mission 4x4 présentes et acceptées** sous `normalized/npcs` |
| Armes | 39 | 39 | **25 atlas V56 acceptés**, dont le Pathogen Containment Projector original désormais validé; 14 modèles canoniques restent gated |
| Outils et équipements | 30 | 29 | **30 profils acceptés**: 29 atlas physiques `normalized/tools` + 1 alias explicite vers le Cutting Torch 4x4 déjà accepté |
| Hazards | 6 | 8 | **8/8 fichiers de production présents** |
| Resource drops | 5 | 5 | **5/5 feuilles de production présentes** |
| Terminaux d'archive | 3 | 3 | **3/3 feuilles contextualisées présentes** |
| Couches de salles du hub | 15 | 30 | **30/30 couches présentes**, en plus des 2 couches contrôle du hangar |
| Couches de zones de mission | 18 | 54 | **18 couches/6 zones navire présentes**; les 12 zones colonie/planète conservent leur contrat restant de 36 couches |
| Extensions accès/sortie/dégâts véhicules | 5 | 10 | les châssis et leurs lignes de dégâts existent; accès/sortie et overlays de fit restent absents |
| **Total** | **129** | **186** | maximum physique corrigé: seul l'alias Cutting Torch ne crée pas d'atlas supplémentaire |

Répartition de provenance: 43 entrées `CANON_REFERENCE`, 57 `PROJECT_ADAPTATION`, 29 `PROJECT_ORIGINAL`.

### Vérité de release verrouillée au 24 août 2026

- Équipement: 30/30 profils acceptés; 29 feuilles physiques 512x512 RGBA en grille 2x2 et un alias manifeste vers `assets/openai/sprites/normalized/weapons/cutting-torch-action-sheet.png` (4x4). L'alias ne crée ni fichier `tools/cutting-torch-use-sheet.png` ni atlas supplémentaire.
- Identités corrigées par le classeur et les références: `Motion Tracker` = **M314 Motion Tracker d'Aliens**; `APE Suit` = **APEsuit Mk.3 d'Aliens: Fireteam Elite**. Cette dernière n'est pas déclarée turnaround exacte: seules les vues publiées face/trois-quarts sont revendiquées.
- `weapon.pathogen-containment-projector.action`: `PROJECT_ORIGINAL_VALIDATED`; atlas OpenAI réel 1024x1024 RGBA, 16/16 cellules, garde nulle, présent en source publique et normalisée. Il est ready dans le manifeste: aucune URL fictive ni 404.
- Véhicules non résolus: M570 reste `BLOCKED_NO_PUBLISHED_SILHOUETTE`; le M292A2 généré a été rejeté au contrôle de grille et n'a aucun fichier de production; le Bearcat C/D est uniquement une plaque famille en quarantaine, jamais un AD-19D exact ni un turnaround.

## Règle de résolution et statuts

Chaque ligne se résout comme `entrée + contrat`. Le contrat porte le framing, la perspective, l'échelle et les interdits communs; la ligne porte l'ancre d'identité et l'interdit spécifique. Aucun générateur ne doit interpréter un nom seul.

- `CANON_REFERENCE`: forme ou objet identifiable de la franchise/licence. La référence sert à verrouiller le modèle; aucune capture, texture, interface, marque ou key art officiel ne doit être copié.
- `PROJECT_ADAPTATION`: fonction issue du runtime ou du vocabulaire Alien, adaptée au langage visuel déjà établi par le projet.
- `PROJECT_ORIGINAL`: identité propre à Echo-9/Tantalus, ATARAX, Crucible ou Ceto; elle ne doit jamais être présentée comme canon officiel.

## Contrats communs de production

| Contrat | Framing et états | Perspective | Échelle/runtime | Interdits communs |
|---|---|---|---|---|
| `NPC_MISSION_4X4` | 1024x1024 RGBA, grille exacte 4x4, cellules 256, garde transparente 16 px. 0 prêt; 1–2 tir; 3 action de rôle; 4–7 couverture; 8–10 traversée; 11 escalade; 12 blessé; 13–14 à terre; 15 mort. | profil latéral orthographique strict, vers la droite | pivot pieds x128/y240; cible 104x148 | identité, visage, anatomie, tenue, palette et équipement du master de locomotion inchangés; aucun décor, sol, texte, logo, UI, watermark, gore ou chevauchement |
| `WEAPON_FIREARM_4X4` | 1024x1024 RGBA, 4x4; repos, recul, rechargement, inspection/enrayage | profil orthographique droit | pivot de poignée; enveloppe indiquée par ligne | aucun acteur/main; aucun marquage lisible, décor, UI ou grille; flash, projectile, rayon et impact séparés |
| `WEAPON_LAUNCHER_4X4` | 1024x1024 RGBA, 4x4; port, visée/tir, recharge, sécurité/inspection | profil orthographique droit | 140–150x78–84 | aucun opérateur, projectile ou backblast intégré; aucun texte/logo/décor |
| `WEAPON_THROWABLE_4X4` | 1024x1024 RGBA, 4x4; ramassage sûr, armement, rotation contenue, état dépensé/retour | axe d'inventaire orthographique constant | 44–68 px | aucune main, explosion, longue traînée, UI, texte/logo ou trajectoire inter-cellule |
| `WEAPON_MELEE_4X4` | 1024x1024 RGBA, 4x4; repos/dégainé, armé, frappe, récupération | profil orthographique droit | 58–150 px selon longueur | aucun porteur, sang, gore, texte/logo, décor ou chevauchement |
| `WEAPON_TOOL_4X4` | 1024x1024 RGBA, 4x4; repos, activation, usage, arrêt/service | profil orthographique droit | 54–130 px selon la ligne | aucune main/cible; étincelles, flamme, rayon et débris séparés; aucun texte/logo/UI |
| `WEAPON_DEPLOYABLE_4X4` | 1024x1024 RGBA, 4x4; plié/déploiement, suivi, action, endommagé/hors-ligne | profil orthographique droit | pivot bas-centre, env. 112x92 | aucun opérateur ni VFX de bouche, texte/logo, décor ou chevauchement |
| `TOOL_EQUIPMENT_2X2` | 512x512 RGBA, 2x2 exact; ramassage emballé, prêt, usage/déploiement, dépensé/replié | profil latéral/inventaire, caméra fixe | 44–96 px; vêtements toujours emballés sans mannequin | un seul objet de base; aucun personnage, texte/logo/UI, décor, sous-pièces flottantes ou effet inter-cellule; les grades réutilisent la base |
| `HAZARD_VFX_4X4` | 1024x1024 RGBA, boucle 4x4; empreinte de contact stable | plan latéral strict | largeur 160–400, collision haute 20–76; dépassement VFX vertical seulement | aucun personnage/créature, pictogramme UI, texte, géométrie de collision ou fond opaque |
| `HAZARD_TWO_LAYER` | deux RGBA coordonnés: monde/contact et atmosphère/foreground non collidable | caméra latérale stricte | répétable sur 160–400 à 1280x720 | aucun remplacement de scène opaque, sol, acteur, créature, UI ou texte |
| `RESOURCE_DROP_2X2` | 512x512 RGBA, 2x2; repos, scintillement, compression de collecte, vide/fondu | profil inventaire orthographique | empreinte 24–58 px, lisible sans couleur seule | aucune scène de caisse, étiquette, symbole monétaire, logo, carte UI ou acteur |
| `ARCHIVE_TERMINAL_2X2` | 512x512 RGBA, 2x2; veille, réveil, transfert, récupéré/éteint; terminal complet par cellule | profil orthographique droit | env. 58x76, pivot bas-centre | aucun texte écran lisible, logo, capture copiée, acteur ou fond; silhouette distincte d'un nœud d'énergie |
| `HUB_ROOM_2_LAYER` | deux RGBA 1774x887: plafond/arrière et bord/avant, large ouverture transparente de gameplay | élévation latérale, horizon/échelle exactement ceux du room master | runtime 1280x720, `floorY=624`, ratio du profil | ne pas remplacer le master ni l'architecture; aucun sol collidable continu, porte, acteur, créature, véhicule, pickup, hazard, UI ou texte intégré |
| `MISSION_ZONE_3_LAYER` | trois 1600x900: far opaque, mid RGBA, foreground RGBA; bords répétables | caméra side-scroller latérale, hauteur d'œil fixe du template | monde 5200, `floorY=510`; parallaxes far 0,075, mid 0,32, foreground 1,12 | aucun sol/plateforme jouable, porte, échelle, terminal, pickup, hazard, acteur, créature ou véhicule; aucune perspective isométrique/point de fuite central, key art, UI ou collage |
| `VEHICLE_ACCESS_DAMAGE` | 1 feuille 1024x1024 4x4 accès/dégâts + 1 overlay transparent 1024x512 4x2 par châssis; ouvrir/accéder, sécuriser/occupé, sortir/fermer, critique/épave | profil droit, pivot sol et caméra strictement identiques au master | cible et hitbox exactes indiquées par ligne | aucun redraw/rescale du châssis, passager intégré ou nouveau hardpoint; fumée/feu/étincelles séparés; les fits n'altèrent jamais la silhouette |

## Références canoniques et ancres locales

Références externes autorisées, uniquement pour la silhouette ou le contexte canonique:

- `REF_WEB_DARK_DESCENT`: [page officielle Aliens: Dark Descent](https://www.focus-entmt.com/en/games/aliens-dark-descent).
- `REF_WEB_DARK_DESCENT_SUPPORT`: [notes officielles Focus du 1er août 2023](https://support.focus-entmt.com/hc/en-us/articles/12816621940754-PC-PLAYSTATION-XBOX-UPDATE-AUGUST-1-2023).
- `REF_WEB_ISOLATION`: [site officiel SEGA Alien: Isolation](https://alienisolation.sega.jp/news.html).
- `REF_WEB_ISOLATION_MANUAL`: [manuel sous licence Feral d'Alien: Isolation](https://www.feralinteractive.com/en/manuals/alienisolation/latest/steam/).
- `REF_WEB_M314_HCG`: [réplique M314 sous licence, Hollywood Collectibles Group](https://www.hollywood-collectibles.com/Aliens-M314-Motion-Tracker.html), quatre angles archivés pour la géométrie.
- `REF_WEB_M3_PROPSTORE`: [armure M3 photo-matched, Propstore](https://propstore.com/product/aliens-1986/lot-12-pvt-frosts-ricco-ross-photo-matched-u-s-colonial-marines-armor-costume-and-corporal-dietrichs-cynthia-dale-scott-uscm-ab-armor/), corroborée par la [collection MoPOP](https://mopop.emuseum.com/objects/130458/colonial-marine-armor-from-the-film-aliens).
- `REF_WEB_APE_FIRETEAM`: [Frontier Freelancer Pack officiel sur Steam](https://store.steampowered.com/app/1643354/Aliens_Fireteam_Elite__Frontier_Freelancer_Pack/) et [Xbox](https://www.xbox.com/en-US/games/store/aliens-fireteam-elite-frontier-freelancer-pack/9P6CHHKZ8F9B); ces médias documentent uniquement face et trois-quarts.

`REF_WEB_ISOLATION` ne prouve pas l'identité du Motion Tracker de cette matrice: le classeur désigne le **M314 d'Aliens**. Il reste réservé à l'Access Tuner, au Maintenance Jack et aux autres outils d'Alien: Isolation.
- `REF_WEB_PREDATOR`: [arsenal officiel Predator: Hunting Grounds](https://predator.illfonic.com/the-predator/).
- `REF_WEB_AVP_MANUAL`: [manuel sous licence Aliens vs. Predator 2010](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/10680/manuals/AVP_G4W_MG_UK_DD.pdf).
- `REF_WEB_USCM_INDEX`, `REF_WEB_M41A`, `REF_WEB_M577`, `REF_WEB_UD4`: index secondaires servant uniquement à retrouver un modèle exact; les entrées obscures restent bloquées tant qu'une image-source précise n'est pas figée.

Ancres techniques principales: `docs/ASSET_RUNTIME_INVENTORY_V55.md`, `src/content-core-v50.js`, `src/sprite-animation-runtime.js`, `src/npc-mission-runtime-v55.js`, `src/hub-profiles-v53.js`, `src/hub-art-runtime-v55.js`, `src/mission-levels-v52.js`, `src/game-v52-level-runtime.js`, `src/game-v51-runtime.js`, `src/vehicle-visual-runtime-v55.js`, `assets/openai/arsenal-props-atlas.png`, `assets/openai/interactive-props-animation-sheet.png` et les masters propres indiqués dans chaque ligne.

## PNJ de mission — 8 feuilles acceptées

Contrat commun: `NPC_MISSION_4X4`. Chaque ligne exige 1 feuille 4x4, batch `B01_NPC_MISSION`.

| ID / identité | Statut | Référence ou master local | Action de rôle frame 3 | Verrou de redesign |
|---|---|---|---|---|
| `npc.inez-harlow.mission` — Inez Harlow | `PROJECT_ORIGINAL` | `normalized/npcs/inez-harlow-locomotion-sheet.png`; `V52_NPC_ART_WAVE_1_PROMPTS.md#inez-harlow` | scan/soutien xénobiologie | visage latina olive chaud, chignon noir compact, tenue science ivoire/teal/charbon, col relevé, valise scellée et bioscanner vierge; aucun spécimen ouvert/tissu alien |
| `npc.david-8r.mission` — DAVID-8R | `PROJECT_ORIGINAL` | `normalized/npcs/david-8r-locomotion-sheet.png`; `V52_NPC_ART_WAVE_1_PROMPTS.md#david-8r` | diagnostic/réparation synthétique | visage humain pâle, cheveux blond foncé tirés, joint tempe droite et point ambre, tenue graphite/gilet pierre; ni crâne robotique, mécanique exposée ou sang rouge |
| `npc.jun-park.mission` — Jun Park | `PROJECT_ORIGINAL` | `normalized/npcs/jun-park-locomotion-sheet.png`; `V52_NPC_WAVE_3_PROMPTS.md#jun-park` | inspection/maintenance | visage coréen, cheveux noirs courts, combinaison graphite/teal, lunettes relevées, sacoche, gants isolants, lampes lime; aucun outil flottant/étincelle intégrée |
| `npc.asha-mbaye.mission` — Asha Mbaye | `PROJECT_ORIGINAL` | `normalized/npcs/asha-mbaye-locomotion-sheet.png`; `V52_NPC_WAVE_3_PROMPTS.md#asha-mbaye` | commandement/liaison | peau brun profond, couronne tressée compacte basse, veste charbon/bleu poussière, pantalon olive, gilet fin, oreillette, folio vierge; ni costume formel, drapeau ou badge |
| `npc.pablo-reyes.mission` — Pablo Reyes | `PROJECT_ORIGINAL` | `normalized/npcs/pablo-reyes-locomotion-sheet.png`; `V52_NPC_WAVE_3_PROMPTS.md#pablo-reyes` | neutralisation explosive | identité latino large/tannée, cheveux courts, moustache/barbe, tenue blast olive/charbon, harnais orange-gris et module inerte; aucune explosion, flamme, UI vive ou long câble |
| `npc.echo-a.mission` — ECHO-A | `PROJECT_ORIGINAL` | `normalized/npcs/echo-a-locomotion-sheet.png`; `V52_ECHO_A_PROMPT.md` | interface/tir synthétique | synthétique féminine, peau brun moyen-foncé, cheveux noirs ras, joints tempe/cou, point cyan, uniforme graphite/olive, carabine compacte exacte; ni armure robot ou autre fusil |
| `npc.leila-s-rensen.mission` — Leila Sørensen | `PROJECT_ORIGINAL` | `normalized/npcs/leila-s-rensen-locomotion-sheet.png`; `V52_LEILA_PROMPT.md` | repérage/escalade | conserver le slug historique `leila-s-rensen`; taches de rousseur, tresse blond cendré rentrée, capuche charbon, tenue mousse/ardoise, ligne et jumelles; ni ranger fantasy, fourrure, arc ou arme longue |
| `npc.cal-mercer.mission` — Cal Mercer | `PROJECT_ORIGINAL` | `normalized/npcs/cal-mercer-locomotion-sheet.png`; `V52_CAL_MERCER_PROMPT.md` | réparation mécanique | mécanicien trapu, cheveux auburn/argent, barbe carrée, combinaison charbon/ocre, lunettes relevées, clé dynamométrique et palet; ni véhicule/cockpit, outil géant ou étincelles intégrées |

## Armes — 25 feuilles V56 acceptées, 14 modèles canoniques gated

Les 18 feuilles B08 et les 7 feuilles B10 sont acceptées. Les 14 lignes `B09` restent **non générables** tant que le modèle exact n'est pas choisi. Les grades de catalogue réutilisent leur base sans être présentés comme variantes dessinées exactes.

| ID / arme | Statut / lot | Référence ou ancre | Contrat / échelle | Verrou de redesign |
|---|---|---|---|---|
| `weapon.m41a2-pulse-rifle.action` — M41A2 | `CANON_REFERENCE` / B08 | `REF_WEB_USCM_INDEX`, `REF_WEB_M41A`; feuille M41A existante comme contrôle | `WEAPON_FIREARM_4X4`; 126x72 | source-modèle obligatoire; ne jamais recolorer/rebaptiser le M41A |
| `weapon.m4a3-service-pistol.action` — M4A3 | `CANON_REFERENCE` / B08 | `REF_WEB_USCM_INDEX`; arsenal atlas | firearm; 72x48 | distinct du VP70; aucune gravure de héros |
| `weapon.vp70-combat-pistol.action` — VP70 | `CANON_REFERENCE` / B08 | `REF_WEB_USCM_INDEX`; arsenal atlas | firearm; 72x48 | distinct du M4A3; pas de variante personnelle à crosse nacrée |
| `weapon.m56-smartgun.action` — M56 Smartgun | `CANON_REFERENCE` / B08 | `REF_WEB_USCM_INDEX`, `REF_WEB_DARK_DESCENT`; arsenal + classes Echo-9 | firearm; 148x84 avec harnais | conserver bras de support et harnais; jamais fusil/minigun tenu librement |
| `weapon.m240-incinerator-unit.action` — M240 | `CANON_REFERENCE` / B08 | `REF_WEB_USCM_INDEX`, `REF_WEB_DARK_DESCENT_SUPPORT`; arsenal + VFX combat | firearm; 132x76 | raccords/réservoirs canoniques; flamme séparée |
| `weapon.m37a2-pump-shotgun.action` — M37A2 | `CANON_REFERENCE` / B08 | `REF_WEB_USCM_INDEX`; arsenal | firearm; 124x68 | silhouette à pompe; aucune inscription de Hicks ni brûlure acide |
| `weapon.m39-submachine-gun.action` — M39 | `CANON_REFERENCE` / **B09** | `REF_WEB_USCM_INDEX`; arsenal | firearm; 104x60 | source-modèle obligatoire; ni SMG moderne générique ni M41A recoloré |
| `weapon.m42a-scope-rifle.action` — M42A | `CANON_REFERENCE` / **B09** | `REF_WEB_USCM_INDEX`; arsenal | firearm; 142x70 | verrouiller boîtier/crosse/optique; aucun clone de fusil moderne |
| `weapon.m6b-rocket-launcher.action` — M6B | `CANON_REFERENCE` / **B09** | `REF_WEB_USCM_INDEX`; arsenal | launcher; 140–150x78–84 | source-modèle obligatoire; aucun bazooka générique |
| `weapon.m83-sadar.action` — M83 SADAR | `CANON_REFERENCE` / **B09** | `REF_WEB_USCM_INDEX`; arsenal | launcher; 140–150x78–84 | ne jamais fusionner avec M6B ou M5 |
| `weapon.m5-rpg.action` — M5 RPG | `CANON_REFERENCE` / **B09** | `REF_WEB_USCM_INDEX`; arsenal | launcher; 140–150x78–84 | pas de silhouette de RPG contemporain |
| `weapon.m94-impact-grenade.action` — M94 | `CANON_REFERENCE` / **B09** | `REF_WEB_USCM_INDEX`; arsenal | throwable; 44–68 | source exacte; pas de grenade « pineapple » générique |
| `weapon.m40-hedp-grenade.action` — M40 HEDP | `CANON_REFERENCE` / B08 | `REF_WEB_USCM_INDEX`, `REF_WEB_M41A`; arsenal | throwable; 46x34 | munition de lance-grenade, jamais réemploi de la grenade à main M94 |
| `weapon.ua-571c-sentry-gun.action` — UA 571-C | `CANON_REFERENCE` / B08 | `REF_WEB_DARK_DESCENT_SUPPORT`, `REF_WEB_USCM_INDEX`; interactive props + arsenal | deployable; env. 112x92 | trépied/tourelle pliée reconnaissables; aucune tourelle générique |
| `weapon.heavy-pulse-rifle.action` — Heavy Pulse Rifle | `CANON_REFERENCE` / **B09** | `REF_WEB_USCM_INDEX`; arsenal | firearm; 142x78 | source-modèle obligatoire; pas de M41A simplement agrandi |
| `weapon.f44aa-pulse-rifle.action` — F44AA | `CANON_REFERENCE` / **B09** | `REF_WEB_USCM_INDEX`; arsenal | firearm; 128x72 | source-modèle; pas de recoloration du M41A |
| `weapon.type-88-heavy-assault-rifle.action` — Type 88 | `CANON_REFERENCE` / **B09** | `REF_WEB_USCM_INDEX`; human factions + arsenal | firearm; 138x76 | identité UPP, aucune pièce USCM ni clone réel |
| `weapon.ak-4047-pulse-rifle.action` — AK-4047 | `CANON_REFERENCE` / **B09** | `REF_WEB_USCM_INDEX`; human factions + arsenal | firearm; 128x72 | le nom ne doit pas devenir un AK contemporain littéral |
| `weapon.es-4-electroshock-pistol.action` — ES-4 | `CANON_REFERENCE` / **B09** | `REF_WEB_ISOLATION`, manuel; arsenal | firearm; 76x50 | source-modèle; ni taser générique, logo Seegson ou arc intégré |
| `weapon.magnum-357-revolver.action` — .357 | `CANON_REFERENCE` / B08 | `REF_WEB_ISOLATION`, manuel; arsenal | firearm; 76x50 | référence Isolation; pas de revolver western surdimensionné |
| `weapon.bolt-gun.action` — Bolt Gun | `CANON_REFERENCE` / B08 | `REF_WEB_ISOLATION`, manuel; arsenal | firearm; 132x78 | outil-arme industriel, jamais fusil conventionnel |
| `weapon.compound-bow.action` — Compound Bow | `CANON_REFERENCE` / **B09** | `REF_WEB_PREDATOR`, manuel Isolation; arsenal | melee; enveloppe 94x92 | continuité-source à choisir; aucun ornement fantasy ou flèche inter-cellule |
| `weapon.harpoon-gun.action` — Harpoon Gun | `CANON_REFERENCE` / **B09** | `REF_WEB_USCM_INDEX`; arsenal | firearm; 132x74 | distinct du Sonic Harpoon original; câble séparé |
| `weapon.plasma-rifle.action` — Plasma Rifle | `CANON_REFERENCE` / **B09** | `REF_WEB_PREDATOR`, `REF_WEB_AVP_MANUAL`; arsenal | firearm; 126x74 | trancher fusil tenu vs plasmacaster d'épaule avant génération; aucune substitution silencieuse |
| `weapon.combi-stick.action` — Combi-Stick | `CANON_REFERENCE` / B08 | `REF_WEB_PREDATOR`, `REF_WEB_AVP_MANUAL`; arsenal | melee; 150x46 | lance télescopique, jamais hallebarde fantasy |
| `weapon.smart-disc.action` — Smart Disc | `CANON_REFERENCE` / B08 | `REF_WEB_PREDATOR`, `REF_WEB_AVP_MANUAL`; arsenal | throwable; 66x66 | disque canonique, jamais shuriken générique |
| `weapon.wrist-blades.action` — Wrist Blades | `CANON_REFERENCE` / B08 | `REF_WEB_PREDATOR`, `REF_WEB_AVP_MANUAL`; arsenal | melee; 82x56 | dispositif seul, ni bras coupé ni corps Yautja |
| `weapon.cutting-torch.action` — Cutting Torch | `CANON_REFERENCE` / B08 | `REF_WEB_ISOLATION`, manuel; arsenal + `toolPickup` | tool; 64x52 | identité industrielle Isolation; aucune conversion en arme ni étincelle intégrée |
| `weapon.maintenance-jack.action` — Maintenance Jack | `CANON_REFERENCE` / B08 | `REF_WEB_ISOLATION`, manuel; arsenal | tool; 82x58 | cric industriel, pas de substitution par clé/hache |
| `weapon.fire-axe.action` — Fire Axe | `CANON_REFERENCE` / B08 | manuel Isolation; arsenal | melee; 88x64 | outil d'urgence naval sobre, pas de hache fantasy |
| `weapon.combat-knife.action` — Combat Knife | `CANON_REFERENCE` / B08 | `REF_WEB_USCM_INDEX`; arsenal | melee; 58x38 | outil USCM pratique, pas de lame fantasy |
| `weapon.stun-baton.action` — Stun Baton | `CANON_REFERENCE` / B08 | `REF_WEB_ISOLATION`, manuel; arsenal + VFX combat | melee; 72x46 | matraque de sécurité utilitaire; pas de sabre énergétique, arc séparé |
| `weapon.sonic-harpoon.action` — Sonic Harpoon | `PROJECT_ORIGINAL` / B10 | human factions + arsenal | firearm; 128x72 | matériaux de récupération Crucible, émetteur sonic sobre; ne pas déclarer canon ni cloner Harpoon Gun |
| `weapon.neuro-link-disruptor.action` — Neuro-Link Disruptor | `PROJECT_ORIGINAL` / B10 | neuro-xeno sheet + arsenal | firearm; 104x62 | matériel de contention ATARAX, signaux ambre/bleu; ni arme organique ni rayon intégré |
| `weapon.ripper-acid-projector.action` — Ripper Acid Projector | `PROJECT_ORIGINAL` / B10 | neuro-xeno sheet + arsenal | firearm; 132x78 | matériel ATARAX scellé; ni tissu vivant ni jet acide intégré |
| `weapon.reef-caster.action` — Reef Caster | `PROJECT_ORIGINAL` / B10 | pathogen-fauna sheet + arsenal | firearm; 120x70 | récupération Ceto étanche; ni corail fantasy ni tissu de créature |
| `weapon.foundry-nailgun.action` — Foundry Nailgun | `PROJECT_ORIGINAL` / B10 | arsenal + maintenance pipe | firearm; 108x66 | outil de fonderie adapté; ni cloueuse de magasin ni carénage pulse-rifle |
| `weapon.cryo-lance.action` — Cryo Lance | `PROJECT_ORIGINAL` / B10 | cryopod + arsenal | tool; 126x72 | matériel cryogénique projet; ni lance de glace fantasy ni cristaux |
| `weapon.pathogen-containment-projector.action` — Pathogen Containment Projector | `PROJECT_ORIGINAL_VALIDATED` / B10 | `assets/openai/sprites/normalized/weapons/pathogen-containment-projector-action-sheet.png`; ImageGen `exec-a52d9ef1-79e9-49a9-8d5e-ae5e61f4069c` | tool; 130x76 | 1024x1024 RGBA, 4x4, 16/16, garde 0; confinement industriel original sans tissu pathogène, glyphe Engineer ni black goo |

## Outils et équipements — 30 profils acceptés

Les 30 bases visuelles des enregistrements 1–30 sont résolues. Le contrat normal est `TOOL_EQUIPMENT_2X2`; seule la base 4 est un alias explicite vers la feuille arme 4x4 `WEAPON_TOOL_4X4`. Les grades Civilian, Field, Military et Research réutilisent la base correspondante et ne sont pas qualifiés de variantes visuelles exactes.

| ID / objet | Fidélité / état | Asset accepté | Provenance et limite revendiquée |
|---|---|---|---|
| `equipment.motion-tracker.use` — **M314 Motion Tracker** | `CANON_REFERENCE_LICENSED_MULTIANGLE` · `ACCEPTED_NORMALIZED` | `assets/openai/sprites/normalized/tools/m314-motion-tracker-use-sheet.png` | 4 vues de la réplique HCG sous licence; ImageGen `exec-10250a93-f3ac-40cf-8886-069f1bc34eb5`; SHA-256 `021536b998dbae4c7e6a17e4e65d3ad26b30877fcb59288a9f80d5b2041c623a`; aucun texte lisible |
| `equipment.access-tuner.use` — **Security Access Tuner** | `CANON_REFERENCE_VISIBLE_ANGLES` · `ACCEPTED_NORMALIZED` | `assets/openai/sprites/normalized/tools/security-access-tuner-use-sheet.png` | captures in-game Alien: Isolation face/quasi-face; ImageGen `exec-88edc4e7-805c-4107-8792-dbfe7b063f17`; SHA-256 `02e03b2a75aff1ee6beb3a366eaf61132e6b42a18243f12bb3c2f4cfe75d2321`; aucun dos exact revendiqué |
| `equipment.maintenance-jack.use` — Maintenance Jack | `CANON_REFERENCE_VISIBLE_ANGLES` · `ACCEPTED_NORMALIZED` | `assets/openai/sprites/normalized/tools/maintenance-jack-use-sheet.png` | captures in-game Alien: Isolation; le mécanisme orange de porte est exclu; ImageGen `exec-a30d3b90-3afb-4ba3-a15d-7bc13cad5581`; SHA-256 `2c7581a49622268a0f4ed4a5ec3126b64448cdd19881d5a637091fe7f38a44cf` |
| `equipment.cutting-torch.use` — Cutting Torch | `CANON_REFERENCE` · `ACCEPTED_ALIAS_EXISTING` | `assets/openai/sprites/normalized/weapons/cutting-torch-action-sheet.png` | alias de l'atlas B08 4x4, états équipement = cellules 0/1/4/12; SHA-256 `2d19014f401c310e716a74c3b3f704be170b0ddc9296946cc27cbb438ab27e80`; aucun doublon tools |
| `equipment.flashlight.use` — Flashlight | `PROJECT_ADAPTATION` · `ACCEPTED_NORMALIZED` | `assets/openai/sprites/normalized/tools/flashlight-use-sheet.png` | OpenAI V56, adaptation navale; cône lumineux séparé |
| `equipment.medkit.use` — Medkit | `PROJECT_ADAPTATION` · `ACCEPTED_NORMALIZED` | `assets/openai/sprites/normalized/tools/medkit-use-sheet.png` | OpenAI V56, coque frontier; sans croix rouge, texte ni gore |
| `equipment.trauma-kit.use` — Trauma Kit | `PROJECT_ADAPTATION` · `ACCEPTED_NORMALIZED` | `assets/openai/sprites/normalized/tools/trauma-kit-use-sheet.png` | OpenAI V56, identité distincte du medkit |
| `equipment.rebreather.use` — Rebreather | `PROJECT_ADAPTATION` · `ACCEPTED_NORMALIZED` | `assets/openai/sprites/normalized/tools/rebreather-use-sheet.png` | OpenAI V56, masque/canister sans tête ni mannequin |
| `equipment.m3-personnel-armor.use` — M3 Personnel Armor | `CANON_REFERENCE` · `ACCEPTED_NORMALIZED` | `assets/openai/sprites/normalized/tools/m3-personnel-armor-use-sheet.png` | quatre vues Propstore photo-matched, corroboration MoPOP; ImageGen `exec-eb735c53-4c7d-46e2-b3fc-ac1470877143`; SHA-256 `eb5b196afd2867f20124b5c1bc5bf61af419baa287e118a84328badef4685681` |
| `equipment.ape-suit.use` — **APEsuit Mk.3 (Aliens: Fireteam Elite)** | `CANON_REFERENCE_VISIBLE_ANGLES` · `ACCEPTED_NORMALIZED` | `assets/openai/sprites/normalized/tools/apesuit-mk3-use-sheet.png` | modèle explicitement retargeté vers Fireteam Elite; vues officielles Steam/Xbox face et trois-quarts; ImageGen remplacement `exec-ecaccb05-23c7-4761-b849-69305d0e2f98`; SHA-256 `cc91d326195553598afb356b903f6d430503ca755d82e5ed4acd57ad1bcf81b5`; aucun dos exact revendiqué |
| `equipment.pressure-suit.use` — Pressure Suit | `PROJECT_ADAPTATION` · `ACCEPTED_NORMALIZED` | `assets/openai/sprites/normalized/tools/pressure-suit-use-sheet.png` | OpenAI V56, combinaison projet distincte de l'APEsuit Mk.3 |
| `equipment.hazmat-suit.use` — Hazmat Suit | `PROJECT_ADAPTATION` · `ACCEPTED_NORMALIZED` | `assets/openai/sprites/normalized/tools/hazmat-suit-use-sheet.png` | OpenAI V56, équipement de quarantaine sans mannequin |
| `equipment.welding-kit.use` — Welding Kit | `PROJECT_ADAPTATION` · `ACCEPTED_NORMALIZED` | `assets/openai/sprites/normalized/tools/welding-kit-use-sheet.png` | OpenAI V56, soudeur et câbles compacts; VFX séparés |
| `equipment.portable-battery.use` — Portable Battery | `PROJECT_ADAPTATION` · `ACCEPTED_NORMALIZED` | `assets/openai/sprites/normalized/tools/portable-battery-use-sheet.png` | OpenAI V56, pack cassette-futuriste sans UI lisible |
| `equipment.seismic-surveyor.use` — Seismic Surveyor | `PROJECT_ORIGINAL` · `ACCEPTED_NORMALIZED` | `assets/openai/sprites/normalized/tools/seismic-surveyor-use-sheet.png` | OpenAI V56, identité Tantalus/Echo-9 originale |
| `equipment.pathogen-scanner.use` — Pathogen Scanner | `PROJECT_ADAPTATION` · `ACCEPTED_NORMALIZED` | `assets/openai/sprites/normalized/tools/pathogen-scanner-use-sheet.png` | OpenAI V56, vocabulaire du bioscanner d'Inez; distinct du Projector bloqué |
| `equipment.neuro-link-helmet.use` — Neuro-Link Helmet | `PROJECT_ORIGINAL` · `ACCEPTED_NORMALIZED` | `assets/openai/sprites/normalized/tools/neuro-link-helmet-use-sheet.png` | OpenAI V56, matériel ATARAX original |
| `equipment.atarax-control-rig.use` — ATARAX Control Rig | `PROJECT_ORIGINAL` · `ACCEPTED_NORMALIZED` | `assets/openai/sprites/normalized/tools/atarax-control-rig-use-sheet.png` | OpenAI V56, cadre de contention original sans créature |
| `equipment.ripper-xenoarmor.use` — Ripper Xenoarmor | `PROJECT_ORIGINAL` · `ACCEPTED_NORMALIZED` | `assets/openai/sprites/normalized/tools/ripper-xenoarmor-use-sheet.png` | OpenAI V56, plaques détachées sans alien vivant ni mannequin |
| `equipment.portable-sentry.use` — Portable Sentry | `PROJECT_ADAPTATION` · `ACCEPTED_NORMALIZED` | `assets/openai/sprites/normalized/tools/portable-sentry-use-sheet.png` | OpenAI V56, distincte de la UA 571-C; VFX séparés |
| `equipment.ammo-satchel.use` — Ammo Satchel | `PROJECT_ADAPTATION` · `ACCEPTED_NORMALIZED` | `assets/openai/sprites/normalized/tools/ammo-satchel-use-sheet.png` | OpenAI V56, sacoche fermée sans munitions libres |
| `equipment.drone-controller.use` — Drone Controller | `PROJECT_ADAPTATION` · `ACCEPTED_NORMALIZED` | `assets/openai/sprites/normalized/tools/drone-controller-use-sheet.png` | OpenAI V56, contrôleur seul sans drone ni UI lisible |
| `equipment.signal-jammer.use` — Signal Jammer | `PROJECT_ADAPTATION` · `ACCEPTED_NORMALIZED` | `assets/openai/sprites/normalized/tools/signal-jammer-use-sheet.png` | OpenAI V56, antenne pliée; aucun rayon intégré |
| `equipment.cryo-mine.use` — Cryo Mine | `PROJECT_ORIGINAL` · `ACCEPTED_NORMALIZED` | `assets/openai/sprites/normalized/tools/cryo-mine-use-sheet.png` | OpenAI V56, matériel cryogénique original; VFX séparés |
| `equipment.incinerator-fuel-pack.use` — Incinerator Fuel Pack | `PROJECT_ADAPTATION` · `ACCEPTED_NORMALIZED` | `assets/openai/sprites/normalized/tools/incinerator-fuel-pack-use-sheet.png` | remplacement OpenAI V56 validé, raccords compatibles M240; SHA-256 `46cec5e543021f8e827eca885d78fc61431911a2178b7838609bd867bca1dbae` |
| `equipment.electroshock-trap.use` — Electroshock Trap | `PROJECT_ADAPTATION` · `ACCEPTED_NORMALIZED` | `assets/openai/sprites/normalized/tools/electroshock-trap-use-sheet.png` | OpenAI V56, arc électrique séparé |
| `equipment.catch-pole.use` — Catch Pole | `PROJECT_ADAPTATION` · `ACCEPTED_NORMALIZED` | `assets/openai/sprites/normalized/tools/catch-pole-use-sheet.png` | remplacement OpenAI V56 validé; SHA-256 `c78d629880a6665302079bf54af2d5b89cd5c87b6d2c399c59162d0de2ff3a8e`; aucune créature intégrée |
| `equipment.portable-quarantine.use` — Portable Quarantine | `PROJECT_ADAPTATION` · `ACCEPTED_NORMALIZED` | `assets/openai/sprites/normalized/tools/portable-quarantine-use-sheet.png` | OpenAI V56, cadre de confinement vide |
| `equipment.synthetic-repair-kit.use` — Synthetic Repair Kit | `PROJECT_ADAPTATION` · `ACCEPTED_NORMALIZED` | `assets/openai/sprites/normalized/tools/synthetic-repair-kit-use-sheet.png` | OpenAI V56, outils compatibles fluide blanc; aucune pièce d'androïde |
| `equipment.colony-beacon.use` — Colony Beacon | `PROJECT_ORIGINAL` · `ACCEPTED_NORMALIZED` | `assets/openai/sprites/normalized/tools/colony-beacon-use-sheet.png` | OpenAI V56, identité frontier originale sans texte/logo |

Les 29 feuilles physiques `tools` ont 4/4 cellules non vides, une garde propre et aucun RGB caché après normalisation. Les masters ImageGen restent des preuves de provenance et ne sont pas des assets de build; le runtime et le manifeste n'emploient que les chemins normalisés ci-dessus, plus l'unique alias Cutting Torch.

## Hazards — 6 entrées, 8 fichiers acceptés

| ID | Statut | Référence ou ancre | Plaquettes / contrat / échelle | Verrou de redesign |
|---|---|---|---|---|
| `hazard.fire` | `PROJECT_ADAPTATION` | support Dark Descent; VFX combat + `colony-hazard-fire` | 1× 4x4 VFX; `HAZARD_VFX_4X4`; largeur 160–400 | feu industriel bas/jet au sol, contact lisible; ni mur de feu ni explosion |
| `hazard.steam` | `PROJECT_ADAPTATION` | Dark Descent; maintenance pipe + `HAZARD_CONTRACTS` | 1× 4x4 VFX; `HAZARD_VFX_4X4` | jet latéral hauteur tuyau et dissipation; tuyau source séparé |
| `hazard.radiation` | `PROJECT_ADAPTATION` | Dark Descent; planet mid + `planet-hazard-radiation` | 1× 4x4 VFX; `HAZARD_VFX_4X4` | particules/distorsion discrètes; ni magie verte ni trèfle radiation |
| `hazard.flood` | `PROJECT_ADAPTATION` | Dark Descent; planet foreground + contracts runtime | 1× tile 4x2 + 1× splash/drag 4x4; `HAZARD_TWO_LAYER` | ligne d'eau industrielle sombre + rides séparées; ni rectangle océan opaque ni personnage |
| `hazard.vacuum` | `PROJECT_ADAPTATION` | Dark Descent + manuel Isolation; Tantalus foreground + `ship-hazard-vacuum` | 1× airflow 4x4 + 1× overlay givre/débris; `HAZARD_TWO_LAYER` | flux/débris/givre seulement; brèche/portes séparées, pas de panorama spatial substitutif |
| `hazard.darkness` | `PROJECT_ADAPTATION` | Isolation; colony foreground + `colony-hazard-dark` | 1× masque alpha 4x4; `HAZARD_VFX_4X4` | occlusion douce/flicker d'urgence; ni rectangle noir, monstre ou cône de lampe intégré |

Le hazard acide et le hazard électrique existants sont des contrôles, pas des cibles de ce lot.

## Resource drops — 5 feuilles acceptées

Contrat commun: `RESOURCE_DROP_2X2`, 1 feuille 2x2, 24–58 px, batch `B03_DROPS_ARCHIVES`.

| ID / drop | Statut | Référence ou ancre | Verrou de redesign |
|---|---|---|---|
| `drop.ammo` — Ammo | `PROJECT_ADAPTATION` | Dark Descent; supply crates + arsenal | chargeurs/munitions fermés; ni cartouches libres, calibre lisible ou identité par couleur seule |
| `drop.medkit` — Medkit | `PROJECT_ADAPTATION` | Dark Descent; supply crates + arsenal | kit compact rigide; ni croix rouge ni texte |
| `drop.armor` — Armor | `PROJECT_ADAPTATION` | Dark Descent; supply crates + Echo-9 | petit paquet de réparation de plaques, pas tenue/casque complet |
| `drop.salvage` — Salvage | `PROJECT_ORIGINAL` | workbench + supply crates | alliage/mécanique compact; ni morceau d'alien ni symbole monétaire |
| `drop.security-key` — Security Key | `PROJECT_ADAPTATION` | Isolation; interactive props + `security-key` runtime | carte/cartouche robuste vierge; ni badge, portrait, code-barres ou logo lisible |

## Terminaux d'archive — 3 feuilles acceptées

Contrat commun: `ARCHIVE_TERMINAL_2X2`, 1 feuille 2x2, cible 58x76, batch `B03_DROPS_ARCHIVES`.

| ID / contexte | Statut | Référence ou ancre | Verrou de redesign |
|---|---|---|---|
| `archive.ship-command` — commande navire | `PROJECT_ADAPTATION` | manuel Isolation; bridge terminal + interactive props + `ship-bridge` | terminal militaire cassette Tantalus; ni logo MU/TH/UR ni écran du film copié |
| `archive.colony-medical` — médical colonie | `PROJECT_ADAPTATION` | Isolation + manuel; lab console + interactive props + `colony-med-high` | langage économique type Seegson sans logo ni écran SevastoLink copié |
| `archive.planet-beacon` — balise terrain | `PROJECT_ORIGINAL` | planet mid + `planet-beacon` | balise Echo-9 robuste/scellée; ni hologramme, monolithe, glyphe Engineer, texte ou logo |

## Hub — 15 salles, 30 couches acceptées

Contrat commun: `HUB_ROOM_2_LAYER`; par salle, 1 overhead/back RGBA + 1 foreground/front RGBA en 1774x887. Le master de salle indiqué est obligatoire. Le hangar du dropship est exclu: il constitue le contrôle déjà complet.

| ID / salle | Statut / lot | Master local | Verrou de redesign |
|---|---|---|---|
| `hub.bridge.layers` — Bridge | `PROJECT_ADAPTATION` / B04 | `hub/rooms/command-bridge.png`; command far; bridge terminal | fenêtres angulaires, postes, horizon et palette froide inchangés; aucun nouveau plan de passerelle |
| `hub.briefing.layers` — Briefing | `PROJECT_ADAPTATION` / B04 | `command-briefing.png`; command far; briefing table | proportions de la salle/table tactique et bande traversable inchangées |
| `hub.combat-information.layers` — CIC | `PROJECT_ADAPTATION` / B04 | `command-cic.png`; command far; sensor console | racks/postes et lueur écran sobres; ne pas créer une seconde passerelle |
| `hub.cryo-bay.layers` — Cryo Bay | `PROJECT_ADAPTATION` / B04 | `command-cryo.png`; command far; cryopod | pods vides, condensation et service existants; aucun occupant |
| `hub.crew-quarters.layers` — Crew Quarters | `PROJECT_ADAPTATION` / B05 | `habitat-quarters.png`; habitat far; bunk module | couchettes/casiers compacts et olive vécu; ni nom personnel ni équipage |
| `hub.mess.layers` — Mess | `PROJECT_ADAPTATION` / B05 | `habitat-mess.png`; habitat far; mess table | hiérarchie galley/tables et sol libre; ni label nourriture, convive ou nouveau plan mobilier |
| `hub.medical.layers` — Medical | `PROJECT_ADAPTATION` / B05 | `habitat-medical.png`; habitat far; medical bed | traitement vide et vert clinique pâle; ni patient, sang ou symbole médical |
| `hub.science-lab.layers` — Science Lab | `PROJECT_ADAPTATION` / B05 | `habitat-lab.png`; habitat far; lab console | instruments/armoires scellées/confinement vide; ni spécimen, œuf ou black goo |
| `hub.quarantine.layers` — Quarantine | `PROJECT_ADAPTATION` / B06 | `industrial-quarantine.png`; industrial far; quarantine unit | verre d'observation/decon et cradle vide; ni captif ni texte biohazard |
| `hub.armory.layers` — Armory | `PROJECT_ADAPTATION` / B06 | `industrial-armory.png`; industrial far; armory rack | racks/casiers sûrs; aucune hero weapon libre dupliquant les pickups |
| `hub.workshop.layers` — Workshop | `PROJECT_ADAPTATION` / B06 | `industrial-workshop.png`; industrial far; workbench | établi/machines/câbles; aucun outil interactif libre au foreground |
| `hub.vehicle-bay.layers` — Vehicle Bay | `PROJECT_ADAPTATION` / B06 | `industrial-vehicle-bay.png`; industrial far; vehicle lift | lift/rails vides; aucun véhicule intégré ni collision de portique monolithique |
| `hub.reactor.layers` — Reactor | `PROJECT_ADAPTATION` / B07 | `engineering-reactor.png`; engineering far; reactor column | colonne blindée et chaleur ambre; ni nouveau cœur ni symbole radiation |
| `hub.life-support.layers` — Life Support | `PROJECT_ADAPTATION` / B07 | `engineering-life-support.png`; engineering far; scrubber | scrubbers/cuves et glow cyan-vert; aucun hazard flood/steam intégré |
| `hub.sensor-array.layers` — Sensor Array | `PROJECT_ADAPTATION` / B07 | `engineering-sensors.png`; engineering far; sensor console | racks/consoles; ni parabole extérieure, UI lisible ou redesign bridge |

## Zones de mission — 6 zones navire acceptées; 12 zones colonie/planète restantes

Contrat commun: `MISSION_ZONE_3_LAYER`; par zone, 1 far opaque + 1 mid RGBA + 1 foreground RGBA en 1600x900. Le triplet sémantique est une contrainte, pas une invitation à intégrer des éléments interactifs.

| ID / zone | Statut / lot | Ancre et triplet far · mid · foreground | Verrou de redesign |
|---|---|---|---|
| `zone.ship-docking.layers` — Tube d'amarrage | `PROJECT_ADAPTATION` / B12 | Tantalus; espace · dock · câbles | vide orbital, hardware distant, câbles proches; ni sas complet ni sol jouable |
| `zone.ship-cargo.layers` — Soutes dépressurisées | `PROJECT_ADAPTATION` / B12 | Tantalus; coque · cargo · chaînes | coque/cargo distant/chaînes coupées; ni caisse pickup ni brèche vacuum intégrée |
| `zone.ship-engineering.layers` — Puits d'ingénierie | `PROJECT_ADAPTATION` / B12 | Tantalus; machines · réacteur · vapeur | silhouettes machines/réacteur; hazard vapeur séparé de l'atmosphère |
| `zone.ship-habitation.layers` — Pont d'habitation | `PROJECT_ADAPTATION` / B12 | Tantalus; bulkhead · crew recesses · verre | espaces vides; ni lits, PNJ ou module de salle complet |
| `zone.ship-command.layers` — Passerelle | `PROJECT_ADAPTATION` / B12 | Tantalus; étoiles · commande · écrans | commande distante, écrans vierges; terminal archive séparé |
| `zone.ship-extraction.layers` — Sas arrière | `PROJECT_ADAPTATION` / B12 | Tantalus; espace · airlock · givre | coque/sas arrière et givre de bord; porte d'extraction/vacuum séparés |
| `zone.colony-approach.layers` — Périmètre | `PROJECT_ADAPTATION` / B13 | Colony; tempête · gate · grillage | gate non collidable et grillage coupé; aucun gate jouable |
| `zone.colony-habitat.layers` — Habitations | `PROJECT_ADAPTATION` / B13 | Colony; hab-blocks · rue · pluie | blocs/rue distants; hazard feu et civils séparés |
| `zone.colony-civic.layers` — Centre civique | `PROJECT_ADAPTATION` / B13 | Colony; tour · plaza · fumée | profondeur seulement; ni signalétique lisible, foule ou fumée de hazard |
| `zone.colony-utility.layers` — Galeries techniques | `PROJECT_ADAPTATION` / B13 | Colony; béton · tuyaux · vapeur | profondeur béton/tuyaux; hazards vapeur/obscurité séparés |
| `zone.colony-security.layers` — Sécurité | `PROJECT_ADAPTATION` / B13 | Colony; bunker · checkpoint · shutters | profondeur et shutters coupés; gate/tourelle/terminal restent interactifs |
| `zone.colony-landing.layers` — Aire d'évacuation | `PROJECT_ADAPTATION` / B13 | Colony; dropship · pad · balises | silhouette lointaine seulement; ni châssis exact, pad jouable, balise interactive ou craft foreground |
| `zone.planet-approach.layers` — Vallée d'insertion | `PROJECT_ORIGINAL` / B14 | Planet master; horizon · vallée · poussière | vallée/tempête minérale projet; ni vaisseau, créature ou terrain jouable |
| `zone.planet-surface.layers` — Plateau exposé | `PROJECT_ORIGINAL` / B14 | Planet master; météo · terrain · débris | profondeur et débris rares; hazard radiation séparé |
| `zone.planet-ridge.layers` — Crête | `PROJECT_ORIGINAL` / B14 | Planet master; nuages · crête · spores | spores projet discrètes; ni flore géante, œuf, créature ou corniche jouable |
| `zone.planet-caves.layers` — Réseau souterrain | `PROJECT_ORIGINAL` / B14 | Planet master; roche · caves · gouttes | caves minérales projet; ni résine hive, masque darkness, créature ou bouche collidable |
| `zone.planet-ruins.layers` — Ruines | `PROJECT_ORIGINAL` / B14 | Planet master; monolithes · ruines · cendre | ruines érodées projet; ni glyphe Engineer, temple canon reconnaissable, black goo ou monolithe jouable |
| `zone.planet-evac.layers` — Balise d'évacuation | `PROJECT_ORIGINAL` / B14 | Planet master; éclaircie · beacon · herbe | contexte lointain; balise archive et marqueur d'extraction séparés |

## Véhicules — gates de fidélité et 5 extensions

### Modèles du classeur non intégrables comme véhicules exacts

| Cible catalogue | Statut de production | Candidat / emplacement | Limite obligatoire |
|---|---|---|---|
| M570 | `BLOCKED_NO_PUBLISHED_SILHOUETTE` | aucun candidat, aucun fichier production/quarantaine | le nom recouvre des usages incompatibles; aucune silhouette exacte publiée retrouvée |
| M292 baseline | `BLOCKED_SINGLE_PROFILE_AND_VARIANT` | candidat M292A2 ImageGen `exec-3d0035b7-b05b-4127-90b4-62bdde52afae`, **rejeté** `REJECTED_SOURCE_GRID`; aucune destination | l'unique profil publié est légendé M292A2 et ne peut pas remplacer silencieusement le M292 baseline; cellules 0–2 à la limite et fragments détectés |
| AD-19D Bearcat | `BLOCKED_VARIANT_AND_REAR_GEOMETRY_UNRESOLVED` | quarantaine build-excluded `.tmp-v56-references/quarantine/vehicles/normalized/ad-19cd-bearcat-family-action-sheet.png`; SHA-256 `c6fcdff4a3a63b7bba740dc28eb75942931dd919ad6d4ea2f3a008bf2985fd5b` | statut de la plaque `CANON_REFERENCE_FAMILY_PROFILE`: famille AD-19C/D, jamais variante D exacte, jamais turnaround; aucun fichier sous `assets/openai/**`, aucun manifeste/runtime/déploiement |

Ces trois lignes restent hors release jouable tant que leurs gates ne sont pas satisfaites. Un PASS mécanique de grille n'est pas une preuve de géométrie canonique.

### Extensions des cinq châssis déjà validés — 10 feuilles

Contrat commun: `VEHICLE_ACCESS_DAMAGE`, batch `B15_VEHICLE_EXTENSIONS`. Il ne s'agit pas de cinq nouveaux véhicules: chaque entrée étend un master exact déjà présent. La feuille 4x4 d'accès/dégâts est validée avant l'overlay 4x2 de fit.

| ID / châssis | Statut | Master local | Échelle/hitbox | Verrou de redesign |
|---|---|---|---|---|
| `vehicle.m577-apc.access-damage` — M577 APC | `CANON_REFERENCE` | `normalized/vehicles/m577-apc-action-sheet.png`; `REF_WEB_M577` | 250x140, `apc-hull` | coque/tourelle/empattement exacts; accès arrière/latéral seulement; aucun marine intégré |
| `vehicle.m577-command-apc.access-damage` — M577 Command | `CANON_REFERENCE` | `m577-command-apc-action-sheet.png`; profil `m577Command`; `REF_WEB_M577` | 250x148, `m577-command-hull` | mât/coque/empattement exacts; ni substitution M577 standard ni hardpoint ajouté |
| `vehicle.m22a3-jackson-tank.access-damage` — M22A3 | `CANON_REFERENCE` | `m22a3-jackson-tank-action-sheet.png`; profil `m22a3Jackson` | 292x150, `m22a3-tank-hull` | tourelle, contact chenilles/roues et longueur exacts; hatch seulement; ni équipage ni canon redessiné |
| `vehicle.p5000-powered-work-loader.access-damage` — P-5000 | `CANON_REFERENCE` | `p-5000-powered-work-loader-action-sheet.png`; profil `p5000Loader`; support Dark Descent | 150x192, `p5000-loader-frame` | cage/bras/pieds/jaune industriel exacts; harnais/cage vides seulement; aucun opérateur |
| `vehicle.ud4l-cheyenne-dropship.access-damage` — UD-4L | `CANON_REFERENCE` | `ud-4l-cheyenne-dropship-action-sheet.png`; profil `ud4lCheyenne`; `REF_WEB_UD4` | 320x154, `ud4l-dropship-hull` | fuselage/ailes/train/rampe exacts; rampe/porte seulement; ni APC, équipage, armement ajouté ou nez redessiné |

## Ordre de lots sans collisions

| Ordre | Lot | Générable | Contenu et garde de collision |
|---:|---|:---:|---|
| 0 | `B00_FREEZE` | non | figer noms, IDs de manifest, hashes des ancres exactes et images-source canoniques; aucune génération avant résolution des entrées canon-gated |
| 1 | `B01_NPC_MISSION` | oui | 8 appels indépendants; un master et une identité par appel; DAVID-8R et ECHO-A jamais ensemble |
| 2 | `B02_HAZARDS` | oui | feu, vapeur, radiation, flood, vacuum, darkness; contact avant overlay; exclure acid/electrical des prompts |
| 3 | `B03_DROPS_ARCHIVES` | oui | 5 drops, puis 3 terminaux contextualisés; une seule sémantique par feuille |
| 4 | `B04_HUB_COMMAND` | oui | bridge, briefing, CIC, cryo; une salle/master à la fois, overhead avant foreground |
| 5 | `B05_HUB_HABITAT` | oui | quarters, mess, medical, lab; aucune duplication des props interactifs |
| 6 | `B06_HUB_INDUSTRIAL` | oui | quarantine, armory, workshop, vehicle bay; exclure contrôle hangar et véhicules intégrés |
| 7 | `B07_HUB_ENGINEERING` | oui | reactor, life-support, sensors; hazards séparés |
| 8 | `B08_CANON_WEAPONS` | oui après freeze | 18 armes dont les silhouettes sont assez verrouillées; une arme/appel; M41A = référence seulement |
| 9 | `B09_CANON_GATED_WEAPONS` | **non** | M39, M42A, M6B, M83, M5, M94, Heavy Pulse Rifle, F44AA, Type 88, AK-4047, ES-4, Compound Bow, Harpoon Gun, Plasma Rifle; débloquer une entrée à la fois après source exacte |
| 10 | `B10_PROJECT_WEAPONS` | oui | 7 armes originales; une faction projet et une arme par appel; jamais étiquetées canon |
| 11 | `B11_TOOLS_EQUIPMENT` | oui | 30 appels 2x2 indépendants; un objet par feuille, protections emballées sans acteur |
| 12 | `B12_ZONE_SHIP` | oui | 6 zones; par zone far validé, puis mid, puis foreground |
| 13 | `B13_ZONE_COLONY` | oui | 6 zones; pluie/fumée d'ambiance ne remplacent pas les hazards dédiés |
| 14 | `B14_ZONE_PLANET` | oui | 6 zones; aucun glyphe canon non approuvé ni silhouette de créature |
| 15 | `B15_VEHICLE_EXTENSIONS` | oui | 5 masters exacts; accès/dégâts avant overlay de fit; un seul châssis par appel |

Règles globales: un personnage, une famille d'arme, un outil, un terminal ou un châssis par appel; jamais plusieurs feuilles nommées dans une image; jamais raw et normalized ensemble; chemins raw uniques; normalisation uniquement après QA alpha/grille; conserver le slug `leila-s-rensen`; hub salle par salle; missions zone par zone; aucun overlay de fit ne remplace une feuille de châssis.

## Portes de validation avant intégration runtime

1. Vérifier dimensions, alpha, garde, nombre de cellules et absence de bleed.
2. Comparer silhouette, pivot et échelle au master local exact, pas à une simple description textuelle.
3. Rejeter tout texte/logo/UI lisible, décor ou entité interactive intégrée dans une plaquette qui doit rester modulaire.
4. Pour `CANON_REFERENCE`, conserver la référence d'identification mais produire une interprétation visuelle originale cohérente avec le projet.
5. Pour les lots B09, ne rien produire tant que la source-modèle et la continuité visuelle ne sont pas explicitement choisies.
6. N'ajouter au manifest/runtime qu'après acceptation de chaque couche/feuille isolée et contrôle à l'échelle 1280x720.
