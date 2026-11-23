# Arsenal — complétion V188 (spec 014, 22 novembre 2026)

Document de développement **source uniquement** (admission exacte dans
`scripts/verify-public-release-v86.mjs`, exclu du build public). Il répond à la
demande du propriétaire « fidélité 1:1 comme le reste : améliorer et compléter
toutes les armes disponibles et manquantes, avec leurs chargeurs, VFX, etc. »
selon la règle du projet : **aucune arme n’est déclarée fidèle 1:1**. Chaque
valeur est rangée en trois statuts :

- **documenté** : relevé dans une source citée — alimentation et munition de la
  colonne `Alimentation` / `Munition / calibre` de
  `docs/arsenal/data/tantalus_arsenal_master_v1.csv` (recopiée telle quelle dans
  `src/weapon-arsenal-v188.js` et recontrôlée contre le CSV par le test), reçus
  de munition V124 (M41A 10 × 24 mm sans étui, M56 M250 sans étui), admission
  V193 (chargeur détachable seulement pour les quatre M41A) ;
- **adapté [PROPOSÉ]** : capacités, cadences, temps et temps forts de
  rechargement, choix VFX et sons — réglages de jeu Tantalus ;
- **à définir [À DÉFINIR] / [À VÉRIFIER]** : ce que les sources ne tranchent pas.

## Ce qui est livré dans le code

| Domaine | Réalisation | Limite |
| --- | --- | --- |
| Contrat lisible (stand de tir) | `src/weapon-arsenal-v188.js` : un profil gelé par arme du catalogue (181) — alimentation + source, capacité de jeu + source, modes/cadence, temps forts de rechargement, transaction, VFX (bouche, éjection, traceur, impact), sons, art tenu, points d’attache, emplacements de modules, maîtrise, fidélité. `getArsenalProfileV188(id)`, `listArsenalProfilesV188()`, et `engine.getArsenalStateV188(role)` pour l’état vivant | Données de jeu, pas mesures de source |
| Alimentations non détachables | `src/weapon-arsenal-runtime-v188.js` (couche `withArsenalFeedsV188`, juste sous `withMagazineRecoveryWorldV168`) : pont natif du contrat V171 pour **tube** (M37A2 + finitions, Hicks Ithaca 37, fusil de Sevastopol), **barillet** (.357 + finitions), **bande** (M56 + finitions), **réservoir** (M240 + finitions, lance-flammes de Sevastopol) et **tir unique** (M6B, M83, M5 + finitions) — 31 identifiants | Le chronomètre et le transfert final restent ceux de V77 |
| Comportement | pompe obligatoire après chaque tir (0,4 s [PROPOSÉ]), étui éjecté au cycle (V124) ; tube rechargé cartouche par cartouche, interruption = cartouches déjà insérées conservées ; barillet : étuis retenus jusqu’au rechargement ; bande/réservoir : remplacement à 88 % du geste ; lanceur : **une** roquette dans le tube, le surplus du chiffre historique passe en réserve (somme conservée) ; .357 : 6 chambres (CSV « Capacité canon ») | Animations natives de pompe, barillet, bande et réservoir absentes |
| Chargeurs physiques | inchangé : seuls les quatre M41A (preuve V193) ont un chargeur détachable et le ramassage au sol V168 ; aucune autre arme ne reçoit de chargeur inventé | Les autres « box » restent sur le transfert numérique V77 jusqu’à preuve propre au modèle |
| VFX | tirs V131 (fusils à pompe, lance-flammes, roquettes, énergie) désormais envoyés au passage de bouche V188 ; traînée de fumée des roquettes ; étincelles/braises quand un projectile V131 frappe une surface ; explosion visible même sans cible touchée. Éclaboussure acide : inchangée, déterminée par la biologie de la cible (vfx-v188) | Aucun sprite nouveau ; primitives Canvas des emplacements nommés |
| Audio | indices existants (synthèse originale V188) choisis par profil : lance-flammes, lanceurs (`weapon-m41a-grenade`), smartgun, fusil à pompe, pistolet ; clac de pompe `weapon-dry-fire` | Aucun nouvel échantillon ; sons propres à chaque arme [À DÉFINIR] |
| Art tenu | 178 armes à plaque native inchangées ; les trois ajouts dessinent une silhouette Canvas derrière les emplacements nommés `held-weapon-placeholder-shotgun` / `held-weapon-placeholder-flamethrower` | Plaques natives requises (pas de génération d’image) |
| Sauvegardes | état du pont sous `player/coop.arsenalFeedV188` (schéma 188) dans la reprise ; une alimentation falsifiée ou absente est reconstruite depuis les nombres ; anciennes sauvegardes intactes ; option `arsenalFeedsV188: false` | Transaction de rechargement en cours non reprise (V77 la relance ou la solde) |

## Armes ajoutées (identifiants nouveaux, rien de renuméroté)

Trois dossiers P0/P1 de l’index de recherche V171 sont promus en entrées de
catalogue **sans plaque** (`src/weapon-catalog-additions-v188.js`). La règle
existante de l’armurerie (« PLAQUETTE DÉDIÉE REQUISE ») les rend **non
achetables** tant qu’une plaque native admise n’existe pas ; elles sont jouables
par chargement (sauvegarde) et lisibles par le stand de tir. Les numéros 194–196
évitent 191, réservé comme numéro inconnu par le test V124.

| ID | Arme | Source citée | Documenté | Adapté [PROPOSÉ] | À définir |
| --- | --- | --- | --- | --- | --- |
| weapon-194-hicks-ithaca-37-shotgun | Hicks Ithaca 37 Shotgun | *Aliens* (1986) à l’écran ; identification de l’accessoire par l’IMFDB (https://www.imfdb.org/wiki/Aliens, https://www.imfdb.org/wiki/Ithaca_37_%22Stakeout%22) et le wiki AVP — sources **secondaires** | fusil à pompe, alimentation tube (mécanisme de l’arme réelle) | capacité 4, cadence 1,5/s, dégâts, rechargement 2,6 s | Stakeout d’usine ou modèle long recoupé (débattu) ; chambrage 12 ga [À VÉRIFIER] ; plaque native |
| weapon-195-sevastopol-pump-shotgun | Sevastopol Pump Shotgun | Manuel officiel Feral d’*Alien: Isolation* (https://www.feralinteractive.com/en/manuals/alienisolation/latest/steam/ : « Select shotgun ») | la classe « Shotgun » | tube et pompe, capacité 4, cadence 1,3/s | désignation « Model 37 12 Gauge » (wiki secondaire) ; munition ; plaque |
| weapon-196-sevastopol-flamethrower | Sevastopol Flamethrower | Même manuel (« Select flamethrower ») | la classe « Flamethrower » | réservoir 80 unités, débit, dégâts | contenance réelle, apparence ; plaque |

Les dossiers d’origine restent `RESEARCH_ONLY` dans l’index V171 ; la vue de
recherche affiche maintenant leur rapprochement exact (`promotedCatalogIdV188`,
par `researchId`, jamais par nom). Les dossiers V170 correspondants
(`proposed-model-37-12-gauge-pump-action`, `proposed-sevastopol-flamethrower`)
sont inchangés.

Non ajoutées faute de règle de provenance suffisante ou de mécanique propre :
la combinaison M41A + M240 de Ripley (*Aliens*, 1986 — deux alimentations dans
une arme, [À DÉFINIR]), le lance-flammes et l’aiguillon électrique du Nostromo
(*Alien*, 1979 — absents de l’index de recherche, à y inscrire avec source
d’abord), toutes les armes d’*Alien 3* (aucune arme à feu identifiée dans les
documents du dépôt), *Alien: Earth* (une seule fiche non identifiée), et les
lignes Predator/AVP hors périmètre « marine ».

## Inventaire — catalogue (75 identités, 181 identifiants)

Colonnes : alimentation et munition documentées (CSV maître ou fiche V188) ;
capacité du jeu et sa source ; modes et cadence ([PROPOSÉ], catalogue/V131) ;
transaction de rechargement et durée ([PROPOSÉ]) ; VFX : lumière de bouche,
politique d’éjection, traceur, impact ; son de tir et de cycle (indices V188
existants) ; art tenu (plaque native ou emplacement Canvas) et points
d’attache V125 ; chargeur ramassable au sol ; statut de fidélité. Les
variantes de finition (Field, Veteran, Prototype) partagent le mécanisme de leur
base par le générateur du catalogue ; pour un tube ou un barillet, elles
partagent aussi sa capacité (le chiffre historique d’une finition, p. ex. 90
cartouches, n’est pas un mécanisme). **Lot A** = armes vérifiées dans ce lot.

| ID (variantes) | Modèle · rôle · lot | Alimentation (source) | Capacité jeu (source) | Modes · cadence [PROPOSÉ] | Rechargement | Bouche · éjection · traceur · impact | Audio (tir / cycle) | Art tenu · points d’attache | Chargeur au sol | Fidélité |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| weapon-001-m41a-pulse-rifle (041, 081, 121) | M41A Pulse Rifle · Rifle · **lot A** | box · 10x24 caseless (CSV maître) | 99 · [PROPOSÉ] | automatic, underbarrel-30mm-v174-contract-not-native · 7.7/s | v167-physical-magazine-opt-in · 1.45 s | flash · none-caseless · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload | oui (V168) | identité documentée · Aliens (1986) |
| weapon-002-m41a2-pulse-rifle (042, 082, 122) | M41A2 Pulse Rifle · Rifle · **lot A** | box · 10mm caseless (to verify) (CSV maître) | 18 · [PROPOSÉ] | automatic · 3.3/s | v77-numeric-transfer · 1.5 s | flash · none-caseless · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-003-m4a3-service-pistol (043, 083, 123) | M4A3 Service Pistol · Pistol · **lot A** | box · 9mm (verify) (CSV maître) | 35 · [PROPOSÉ] | automatic · 4.6/s | v77-numeric-transfer · 2.2 s | flash · per-shot · none · spark | weapon-pistol | native-plaque · grip/muzzle/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Colonial Marines |
| weapon-004-vp70-combat-pistol (044, 084, 124) | VP70 Combat Pistol · Pistol · **lot A** | box · 9mm (prop real) (CSV maître) | 52 · [PROPOSÉ] | automatic · 5.9/s | v77-numeric-transfer · 2.9000000000000004 s | flash · per-shot · none · spark | weapon-pistol | native-plaque · grip/muzzle/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens (1986) |
| weapon-005-m56-smartgun (045, 085, 125) | M56 Smartgun · Heavy · **lot A** | belt · M250 caseless (variant) (CSV maître) | 69 · [PROPOSÉ] | automatic · 7.2/s | pont natif belt · 0.8 s | flash · none-caseless · smartgun-tracer · spark | weapon-smartgun | native-plaque · grip/muzzle/support/reload | non | identité documentée · Aliens (1986) |
| weapon-006-m240-incinerator-unit (046, 086, 126) | M240 Incinerator Unit · Flamethrower · **lot A** | tank · incinerator fuel (CSV maître) | 86 · [PROPOSÉ] | continuous-stream · 10/s | pont natif tank · 1.5 s | flame · none · flame-stream · burn | weapon-flamethrower | native-plaque · grip/muzzle/support/reload | non | identité documentée · Aliens (1986) |
| weapon-007-m37a2-pump-shotgun (047, 087, 127) | M37A2 Pump Shotgun · Shotgun · **lot A** | tube · 12ga (verify) (CSV maître) | 4 · [PROPOSÉ] | pump-single · 2.222/s | pont natif tube · 2.2 s | flash · pump-cycle · none · spark | weapon-shotgun / weapon-dry-fire | native-plaque · grip/muzzle/support/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Colonial Marines |
| weapon-008-m39-submachine-gun (048, 088, 128) | M39 Submachine Gun · SMG · **lot A** | box · cased_ballistic (CSV maître) | 21 · [PROPOSÉ] | automatic · 11.1/s | v77-numeric-transfer · 2.9000000000000004 s | flash · none · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload | non | identité secondaire [À VÉRIFIER] · Aliens: Colonial Marines |
| weapon-009-m42a-scope-rifle (049, 089, 129) | M42A Scope Rifle · Sniper · **lot A** | box · 10mm caseless (verify) (CSV maître) | 38 · [PROPOSÉ] | automatic · 12.4/s | v77-numeric-transfer · 0.8 s | flash · none · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload | non | identité secondaire [À VÉRIFIER] · Alien RPG / Colonial Marines |
| weapon-010-m6b-rocket-launcher (050, 090, 130) | M6B Rocket Launcher · Launcher · **lot A** | single · rocket_M6B (CSV maître) | 1 (catalogue 55) · mécanisme | single-projectile · 1.818/s | pont natif single · 1.5 s | flash · none · rocket-smoke-trail · explosion | weapon-m41a-grenade | native-plaque · grip/muzzle/support/reload | non | identité secondaire [À VÉRIFIER] · Aliens versus Predator 2 (2001) |
| weapon-011-m83-sadar (051, 091, 131) | M83 SADAR · Launcher · **lot A** | single · rocket_M83 (CSV maître) | 1 (catalogue 72) · mécanisme | single-projectile · 1.818/s | pont natif single · 2.2 s | flash · none · rocket-smoke-trail · explosion | weapon-m41a-grenade | native-plaque · grip/muzzle/support/reload | non | identité secondaire [À VÉRIFIER] · Aliens versus Predator: Extinction |
| weapon-012-m5-rpg (052, 092, 132) | M5 RPG · Launcher · **lot A** | single · rocket_M5 (CSV maître) | 1 (catalogue 89) · mécanisme | single-projectile · 1.818/s | pont natif single · 2.9000000000000004 s | flash · none · rocket-smoke-trail · explosion | weapon-m41a-grenade | native-plaque · grip/muzzle/support/reload | non | identité secondaire [À VÉRIFIER] · Aliens: Colonial Marines |
| weapon-013-m94-impact-grenade (053, 093, 133) | M94 Impact Grenade · Grenade launcher · **lot A** | drum · impact_grenade (CSV maître) | 7 · [PROPOSÉ] | single-projectile · 3.333/s | v77-numeric-transfer · 0.8 s | flash · none · rocket-smoke-trail · explosion | weapon-m41a-grenade | native-plaque · grip/muzzle/support/reload | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-014-m40-hedp-grenade (054, 094, 134) | M40 HEDP Grenade · Grenade · **lot A** | single · 30mm_HE (CSV maître) | 24 · [PROPOSÉ] | grenade · 7.9/s | v77-numeric-transfer · 1.5 s | none · none · none · explosion | shot (historique) | native-plaque · grip/muzzle | non | identité documentée · Aliens (1986) |
| weapon-015-ua-571-c-sentry-gun (055, 095, 135) | UA 571-C Sentry Gun · Sentry · **lot A** | box · sentry_caseless (CSV maître) | 41 · [PROPOSÉ] | automatic · 9.2/s | v77-numeric-transfer · 2.2 s | flash · none · none · spark | shot (historique) | native-plaque · grip/muzzle/support | non | identité documentée · Aliens (1986) |
| weapon-016-heavy-pulse-rifle (056, 096, 136) | Heavy Pulse Rifle · Heavy · **lot A** | box · 10mm caseless (verify) (CSV maître) | 58 · [PROPOSÉ] | automatic · 10.5/s | v77-numeric-transfer · 2.9000000000000004 s | flash · none-caseless · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload | non | identité secondaire [À VÉRIFIER] · Aliens: Dark Descent |
| weapon-017-f44aa-pulse-rifle (057, 097, 137) | F44AA Pulse Rifle · Rifle · **lot A** | box · unknown (film prop) (CSV maître) | 75 · [PROPOSÉ] | automatic · 11.8/s | v77-numeric-transfer · 0.8 s | flash · none-caseless · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload | non | identité documentée · Alien: Romulus (2024) |
| weapon-018-type-88-heavy-assault-rifle (058, 098, 138) | Type 88 Heavy Assault Rifle · Rifle | box · cased_ballistic (CSV maître) | 92 · [PROPOSÉ] | automatic · 2.1/s | v77-numeric-transfer · 1.5 s | flash · per-shot · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-019-ak-4047-pulse-rifle (059, 099, 139) | AK-4047 Pulse Rifle · Rifle | box · unknown (CSV maître) | 10 · [PROPOSÉ] | automatic · 3.4/s | v77-numeric-transfer · 2.2 s | flash · none-caseless · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload | non | identité secondaire [À VÉRIFIER] · Alien RPG / Colonial Marines |
| weapon-020-es-4-electroshock-pistol (060, 100, 140) | ES-4 Electroshock Pistol · Pistol | cell · charge_cell (CSV maître) | 27 · [PROPOSÉ] | automatic · 4.7/s | v77-numeric-transfer · 2.9000000000000004 s | energy · none · energy-bolt · energy-scorch | weapon-pistol | native-plaque · grip/muzzle/reload | non | identité documentée · Prometheus (2012) |
| weapon-021-357-magnum-revolver (061, 101, 141) | .357 Magnum Revolver · Revolver · **lot A** | cylinder · .357 (CSV maître) | 6 (catalogue 44) · CSV « Capacité canon » | automatic · 6/s | pont natif cylinder · 0.8 s | flash · retained-until-reload · none · spark | weapon-pistol | native-plaque · grip/muzzle/reload/ejection | non | identité documentée · Alien: Isolation |
| weapon-022-bolt-gun (062, 102, 142) | Bolt Gun · Industrial | single · bolt (CSV maître) | 61 · [PROPOSÉ] | automatic · 4/s | v77-numeric-transfer · 1.5 s | none · none · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload | non | identité documentée · Alien: Isolation |
| weapon-023-compound-bow (063, 103, 143) | Compound Bow · Bow | single · arrow (CSV maître) | 78 · [PROPOSÉ] | automatic · 2.5/s | v77-numeric-transfer · 2.2 s | none · none · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload | non | création Tantalus · Tantalus original |
| weapon-024-harpoon-gun (064, 104, 144) | Harpoon Gun · Harpoon | single · harpoon (CSV maître) | 95 · [PROPOSÉ] | automatic · 4/s | v77-numeric-transfer · 2.9000000000000004 s | none · none · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload | non | identité secondaire [À VÉRIFIER] · Alien (1979) |
| weapon-025-plasma-rifle (065, 105, 145) | Plasma Rifle · Energy | cell · plasma_cell (CSV maître) | 13 · [PROPOSÉ] | automatic · 11.2/s | v77-numeric-transfer · 0.8 s | energy · none · energy-bolt · energy-scorch | shot (historique) | native-plaque · grip/muzzle/support/reload | non | identité secondaire [À VÉRIFIER] · Aliens versus Predator (1999) |
| weapon-026-combi-stick (066, 106, 146) | Combi-Stick · Melee | none · none (CSV maître) | 30 · [PROPOSÉ] | melee · 12.5/s | none · 1.5 s | none · none · none · melee-contact | shot (historique) | native-plaque · grip/muzzle/support | non | identité documentée · Predator 2 (1990) |
| weapon-027-smart-disc (067, 107) | Smart Disc · Thrown | none · none (CSV maître) | 47 · [PROPOSÉ] | disc · 2.8/s | none · 2.2 s | none · none · none · melee-contact | shot (historique) | native-plaque · grip/muzzle | non | identité documentée · Predator 2 (1990) |
| weapon-028-wrist-blades (068, 108) | Wrist Blades · Melee | none · none (CSV maître) | 64 · [PROPOSÉ] | melee · 4.1/s | none · 2.9000000000000004 s | none · none · none · melee-contact | shot (historique) | native-plaque · grip/muzzle | non | identité documentée · Predator (1987) |
| weapon-029-cutting-torch (069, 109) | Cutting Torch · Tool | tank · torch_fuel (CSV maître) | 81 · [PROPOSÉ] | torch · 5.4/s | v77-numeric-transfer · 0.8 s | flame · none · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload | non | identité secondaire [À VÉRIFIER] · Alien: Isolation |
| weapon-030-maintenance-jack (070, 110) | Maintenance Jack · Melee | none · none (CSV maître) | 98 · [PROPOSÉ] | melee · 6.7/s | none · 1.5 s | none · none · none · melee-contact | shot (historique) | native-plaque · grip/muzzle | non | identité documentée · Alien: Isolation |
| weapon-031-fire-axe (071, 111) | Fire Axe · Melee | none · none (CSV maître) | 16 · [PROPOSÉ] | melee · 8/s | none · 2.2 s | none · none · none · melee-contact | shot (historique) | native-plaque · grip/muzzle/support | non | identité secondaire [À VÉRIFIER] · Alien: Covenant (2017) |
| weapon-032-combat-knife (072, 112) | Combat Knife · Melee | none · none (CSV maître) | 33 · [PROPOSÉ] | melee · 9.3/s | none · 2.9000000000000004 s | none · none · none · melee-contact | shot (historique) | native-plaque · grip/muzzle | non | identité secondaire [À VÉRIFIER] · Aliens versus Predator 2 (2001) |
| weapon-033-stun-baton (073, 113) | Stun Baton · Melee | cell · charge_cell (CSV maître) | 50 · [PROPOSÉ] | stun · 10.6/s | v77-numeric-transfer · 0.8 s | none · none · none · melee-contact | shot (historique) | native-plaque · grip/muzzle | non | identité documentée · Alien: Isolation |
| weapon-034-sonic-harpoon (074, 114) | Sonic Harpoon · Harpoon | single · sonic_bolt (CSV maître) | 67 · [PROPOSÉ] | automatic · 4/s | v77-numeric-transfer · 1.5 s | energy · none · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload | non | création Tantalus · Tantalus original |
| weapon-035-neuro-link-disruptor (075, 115) | Neuro-Link Disruptor · Energy | cell · charge_cell (CSV maître) | 84 · [PROPOSÉ] | automatic · 2.2/s | v77-numeric-transfer · 2.2 s | energy · none · energy-bolt · energy-scorch | weapon-pistol | native-plaque · grip/muzzle/reload | non | création Tantalus · Tantalus original |
| weapon-036-ripper-acid-projector (076, 116) | Ripper Acid Projector · Chemical | tank · acid_canister (CSV maître) | 2 · [PROPOSÉ] | automatic · 3.5/s | v77-numeric-transfer · 2.9000000000000004 s | none · none · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload | non | création Tantalus · Tantalus original |
| weapon-037-reef-caster (077, 117) | Reef Caster · Chemical | tank · acid_canister (CSV maître) | 19 · [PROPOSÉ] | automatic · 4.8/s | v77-numeric-transfer · 0.8 s | none · none · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload | non | création Tantalus · Tantalus original |
| weapon-038-foundry-nailgun (078, 118) | Foundry Nailgun · Industrial | box · nail (CSV maître) | 36 · [PROPOSÉ] | automatic · 4/s | v77-numeric-transfer · 1.5 s | none · none · none · spark | weapon-pistol | native-plaque · grip/muzzle/reload | non | création Tantalus · Tantalus original |
| weapon-039-cryo-lance (079, 119) | Cryo Lance · Chemical | tank · cryo_canister (CSV maître) | 53 · [PROPOSÉ] | automatic · 6.25/s | v77-numeric-transfer · 2.2 s | none · none · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload | non | création Tantalus · Tantalus original |
| weapon-040-pathogen-containment-projector (080, 120) | Pathogen Containment Projector · Chemical | tank · quarantine_agent (CSV maître) | 70 · [PROPOSÉ] | automatic · 6.25/s | v77-numeric-transfer · 2.9000000000000004 s | none · none · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload | non | création Tantalus · Tantalus original |
| weapon-147-ocap-91-volcan | OCAP-91 Volcan · Flamethrower | tank · fuel_canister (CSV maître) | 9 · [PROPOSÉ] | continuous-stream · 10/s | v77-numeric-transfer · 3.1 s | flame · none · flame-stream · burn | weapon-flamethrower | native-plaque · grip/muzzle/support/reload | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-148-type-76-auto-shotgun | Type 76 Auto Shotgun · Shotgun | box · shotgun_shell (CSV maître) | 8 · [PROPOSÉ] | semi-scatter · 2.5/s | v77-numeric-transfer · 2.5 s | flash · per-shot · none · spark | weapon-shotgun | native-plaque · grip/muzzle/support/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-149-m12-rpg | M12 RPG · Launcher | single · rocket_M12 (CSV maître) | 3 · [PROPOSÉ] | single-projectile · 0.6/s | v77-numeric-transfer · 3.5 s | flash · none · rocket-smoke-trail · explosion | weapon-m41a-grenade | native-plaque · grip/muzzle/support/reload | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-150-l59-minigun | L59 Minigun · Heavy | belt · cased_ballistic (CSV maître) | 120 · [PROPOSÉ] | automatic · 12/s | v77-numeric-transfer · 4 s | flash · per-shot · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-151-lem-mp11-stormsurge | LEM MP11 Stormsurge · SMG | box · cased_ballistic (CSV maître) | 32 · [PROPOSÉ] | automatic · 8.5/s | v77-numeric-transfer · 2 s | flash · per-shot · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-152-type-99-incinerator | Type 99 Incinerator · Flamethrower | tank · incinerator_fuel (CSV maître) | 100 · [PROPOSÉ] | continuous-stream · 10/s | v77-numeric-transfer · 3 s | flame · none · flame-stream · burn | weapon-flamethrower | native-plaque · grip/muzzle/support/reload | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-153-am-16-gruppa | AM-16 Gruppa · Rifle | box · cased_ballistic (CSV maître) | 24 · [PROPOSÉ] | burst-3 · 3.125/s | v77-numeric-transfer · 2.5 s | flash · per-shot · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-154-microburst | Microburst · Launcher | box · microgrenade (CSV maître) | 12 · [PROPOSÉ] | single-projectile · 3.2/s | v77-numeric-transfer · 3.2 s | flash · per-shot · rocket-smoke-trail · explosion | weapon-m41a-grenade | native-plaque · grip/muzzle/support/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-155-rapid-responder | Rapid Responder · Shotgun | box · shotgun_shell (CSV maître) | 32 · [PROPOSÉ] | automatic · 8/s | v77-numeric-transfer · 2 s | flash · per-shot · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-156-type-21-tactical-shotgun | Type 21 Tactical Shotgun · Shotgun | box · shotgun_shell (CSV maître) | 8 · [PROPOSÉ] | semi-scatter · 1.8/s | v77-numeric-transfer · 2.8 s | flash · per-shot · none · spark | weapon-shotgun | native-plaque · grip/muzzle/support/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-157-kramer-short-barrel | Kramer Short-Barrel · Shotgun | box · shotgun_shell (CSV maître) | 6 · [PROPOSÉ] | semi-scatter · 1.6/s | v77-numeric-transfer · 2.6 s | flash · per-shot · none · spark | weapon-shotgun | native-plaque · grip/muzzle/support/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-158-n79-eva-laser | N79 EVA Laser · Energy | cell · energy_cell (CSV maître) | 16 · [PROPOSÉ] | automatic · 2.3/s | v77-numeric-transfer · 2.5 s | energy · none · energy-bolt · energy-scorch | weapon-pistol | native-plaque · grip/muzzle/reload | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-159-l33-pike | L33 Pike · Sniper | box · cased_ballistic (CSV maître) | 8 · [PROPOSÉ] | automatic · 0.75/s | v77-numeric-transfer · 3 s | flash · per-shot · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-160-eds-93-zadak | EDS-93 Zadak Plasma Discharger · Shotgun | cell · plasma_cell (CSV maître) | 18 · [PROPOSÉ] | automatic · 2.1/s | v77-numeric-transfer · 3.2 s | energy · none · energy-bolt · energy-scorch | shot (historique) | native-plaque · grip/muzzle/support/reload | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-161-thunderbolt-mk2 | Thunderbolt Mk.2 Autocannon · Heavy | belt · cased_ballistic (CSV maître) | 24 · [PROPOSÉ] | automatic · 2.8/s | v77-numeric-transfer · 4 s | flash · per-shot · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-162-x45-bombard | X45 Bombard · Sniper | box · flechette (CSV maître) | 8 · [PROPOSÉ] | automatic · 0.85/s | v77-numeric-transfer · 3.2 s | flash · per-shot · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-163-svat-92-sokol | SVAT-92 Sokol · Sniper | box · cased_ballistic (CSV maître) | 26 · [PROPOSÉ] | burst-3 · 3.125/s | v77-numeric-transfer · 2.7 s | flash · per-shot · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-164-mark-7-mod2-cqb | Mark 7 Mod 2 CQB Pistol · Pistol | box · cased_ballistic (CSV maître) | 24 · [PROPOSÉ] | automatic · 7.5/s | v77-numeric-transfer · 1.8 s | flash · per-shot · none · spark | weapon-pistol | native-plaque · grip/muzzle/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-165-m51-breaching-scattergun | M51 Breaching Scattergun · Shotgun | box · shotgun_shell (CSV maître) | 6 · [PROPOSÉ] | semi-scatter · 1.4/s | v77-numeric-transfer · 2.7 s | flash · pump-cycle · none · spark | weapon-shotgun | native-plaque · grip/muzzle/support/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-166-p649-hel | P.649 HEL · Energy | cell · energy_cell (CSV maître) | 6 · [PROPOSÉ] | automatic · 0.7/s | v77-numeric-transfer · 3.4 s | energy · none · energy-bolt · energy-scorch | shot (historique) | native-plaque · grip/muzzle/support/reload | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-167-dkt-59-misha | DKT-59 Misha · Pistol | box · cased_ballistic (CSV maître) | 6 · [PROPOSÉ] | semi-scatter · 1.7/s | v77-numeric-transfer · 2.6 s | flash · per-shot · none · spark | weapon-shotgun | native-plaque · grip/muzzle/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-168-evi-87-zvezda | EVI-87 Zvezda Plasma Rifle · Energy | cell · plasma_cell (CSV maître) | 36 · [PROPOSÉ] | automatic · 7.8/s | v77-numeric-transfer · 2.7 s | energy · none · energy-bolt · energy-scorch | shot (historique) | native-plaque · grip/muzzle/support/reload | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-169-ppz-49-vol | PPZ-49 Vol · SMG | box · cased_ballistic (CSV maître) | 40 · [PROPOSÉ] | automatic · 8.2/s | v77-numeric-transfer · 2.5 s | flash · per-shot · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-170-frontier-revolver | Frontier Revolver · Revolver | cylinder · cased_ballistic (CSV maître) | 6 · [PROPOSÉ] | automatic · 1.2/s | v77-numeric-transfer · 3.1 s | flash · retained-until-reload · none · spark | weapon-pistol | native-plaque · grip/muzzle/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-190-type-95-combat-pistol | Type 95 Combat Pistol · ballistic | box · [À DÉFINIR] ([À DÉFINIR]) | 16 · [PROPOSÉ] | automatic · 4/s | v77-numeric-transfer · 2 s | flash · per-shot · none · spark | weapon-pistol | native-plaque · grip/muzzle/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-171-x1-fireball | X1 Fireball · Launcher | box · gel_D17 (CSV maître) | 12 · [PROPOSÉ] | automatic · 1.8/s | v77-numeric-transfer · 3.3 s | flash · none · gel-arc · spark | weapon-m41a-grenade | native-plaque · grip/muzzle/support/reload | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite |
| weapon-172-lem-stg24-storm-rifle | LEM StG24 Storm Rifle · Rifle | box · cased_ballistic (CSV maître) | 36 · [PROPOSÉ] | automatic · 7.8/s | v77-numeric-transfer · 2.5 s | flash · per-shot · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite — Pathogen |
| weapon-173-u1a2-gl-conversion | U1A2 GL Conversion · Grenade launcher | box · grenade_40mm (CSV maître) | 5 · [PROPOSÉ] | single-projectile · 1.6/s | v77-numeric-transfer · 2.8 s | flash · per-shot · rocket-smoke-trail · explosion | weapon-m41a-grenade | native-plaque · grip/muzzle/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite — Pathogen |
| weapon-174-4c2-astra | 4C2 Astra · Rifle | box · cased_ballistic (CSV maître) | 42 · [PROPOSÉ] | burst-3 · 3.125/s | v77-numeric-transfer · 2.7 s | flash · per-shot · none · spark | shot (historique) | native-plaque · grip/muzzle/support/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite — Pathogen |
| weapon-175-2b1-vajra | 2B1 Vajra · Launcher | box · impact_grenade (CSV maître) | 7 · [PROPOSÉ] | single-projectile · 1.2/s | v77-numeric-transfer · 3.9 s | flash · per-shot · rocket-smoke-trail · explosion | weapon-m41a-grenade | native-plaque · grip/muzzle/support/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite — Pathogen |
| weapon-176-6a-jaipur-smg | 6A Jaipur Submachine Gun · SMG | box · flechette (CSV maître) | 44 · [PROPOSÉ] | semi-scatter · 10.5/s | v77-numeric-transfer · 2.3 s | flash · per-shot · none · spark | weapon-shotgun | native-plaque · grip/muzzle/support/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite — Pathogen |
| weapon-177-8a7-dambulla-machine-pistol | 8A7 Dambulla Machine Pistol · Pistol | box · cased_ballistic (CSV maître) | 28 · [PROPOSÉ] | automatic · 9.8/s | v77-numeric-transfer · 2.1 s | flash · per-shot · none · spark | weapon-pistol | native-plaque · grip/muzzle/reload/ejection | non | identité secondaire [À VÉRIFIER] · Aliens: Fireteam Elite — Pathogen |
| weapon-194-hicks-ithaca-37-shotgun | Hicks Ithaca 37 Shotgun · Shotgun · **lot A** | tube · 12 ga shotshell (chambrage de l’arme réelle) [À VÉRIFIER] (fiche V188) | 4 · [PROPOSÉ] | pump-single · 1.5/s | pont natif tube · 2.6 s | flash · pump-cycle · none · spark | weapon-shotgun / weapon-dry-fire | canvas-placeholder `held-weapon-placeholder-shotgun` · grip/muzzle/support/reload/ejection | non | identité citée, sans plaque · Aliens (1986) |
| weapon-195-sevastopol-pump-shotgun | Sevastopol Pump Shotgun · Shotgun · **lot A** | tube · shotshell [À DÉFINIR] (fiche V188) | 4 · [PROPOSÉ] | pump-single · 1.3/s | pont natif tube · 2.8 s | flash · pump-cycle · none · spark | weapon-shotgun / weapon-dry-fire | canvas-placeholder `held-weapon-placeholder-shotgun` · grip/muzzle/support/reload/ejection | non | identité citée, sans plaque · Alien: Isolation |
| weapon-196-sevastopol-flamethrower | Sevastopol Flamethrower · Flamethrower · **lot A** | tank · fuel [À DÉFINIR] (fiche V188) | 80 · [PROPOSÉ] | continuous-stream · 10/s | pont natif tank · 2.4 s | flame · none · flame-stream · burn | weapon-flamethrower | canvas-placeholder `held-weapon-placeholder-flamethrower` · grip/muzzle/support/reload | non | identité citée, sans plaque · Alien: Isolation |


## Inventaire — armes de la franchise absentes du catalogue

Source : index de recherche V171 (129 dossiers, `src/weapon-research-index-v171.js`,
issu de `docs/arsenal/data/tantalus_weapon_evidence_backlog_v170.csv`). Une flèche
indique une promotion V188 en catalogue sans plaque ; « ≈ » un nom identique
à une arme existante (rapprochement à vérifier, pas une preuve).

| Œuvre | Dossiers | Statut V188 |
| --- | --- | --- |
| Alien Resurrection (1997) | Lacrima 99 Shockrifle [P2] ; Draco Double Burner [P2] ; USM Standard Sidearm [P2] ; Call Zip Gun [P2] ; Christie wrist-mounted pistols [P2] ; Vriess collapsible shotgun [P2] ; USM collapsible grenade launcher [P2] ; Okee-Doke Corral Cowboy Pistol [P2] ; Lacrima 99 bayonet assembly [P2] | RESEARCH_ONLY |
| Alien RPG / Colonial Marines | M56A2 Smartgun [P2] ; VP-70MA6 Pistol [P2] ; G2 Electroshock Grenade [P2] ; U4 Firebomb [P2] ; ASSO-400 Harpoon Grappling Gun [P2] | RESEARCH_ONLY |
| Alien: Covenant (2017) | RMC F903WE Assault Rifle [P2] ; CR-553 Carbine [P2] ; M4-AR 556-45 [P2] ; Beretta 92FS [P2] ; Alien Covenant emergency axe [P2] | RESEARCH_ONLY |
| Alien: Earth (2025) | Unknown security carbine — Alien Earth [P2] | RESEARCH_ONLY |
| Alien: Isolation | DV-303 Bolt Gun [P0] ; Model 37-12 Gauge Pump Action → **weapon-195-sevastopol-pump-shotgun** [P0] ; Sevastopol Flamethrower → **weapon-196-sevastopol-flamethrower** [P0] ; Molotov (Sevastopol) [P2] ; Pipe Bomb (Sevastopol) [P2] ; EMP Mine (Sevastopol) [P2] ; Flashbang (Sevastopol) [P2] | promotion partielle sans plaque |
| Aliens (1986) | U1 Grenade Launcher [P1] ; Ripley improvised M41A + M240 [P1] ; Hicks Ithaca 37 shotgun → **weapon-194-hicks-ithaca-37-shotgun** [P1] ; Vasquez service pistol [P1] | promotion partielle sans plaque |
| Aliens novels | Unidentified novel security firearm [P2] | RESEARCH_ONLY |
| Aliens versus Predator 2 (2001) | M4A4 Pistol [P2] ; M240A1 Flamethrower [P2] ; WY-102 Sniper Rifle [P2] ; M92 Grenade Launcher [P2] ; M90 Minigun [P2] ; Speargun (AVP2) [P2] ; Netgun (AVP2) [P2] ; Plasma Pistol (AVP2) [P2] | RESEARCH_ONLY |
| Aliens versus Predator: Extinction | Predator Plasma Glaive [P2] ; Predator Plasma Scythe [P2] ; Predator Blazer [P2] ; Predator Pred-Gun [P2] ; Predator AURORA Weapon [P2] ; Predator Fireliner [P2] ; Electroshock Missile Battery [P2] ; MP9 Submachine Gun [P2] | RESEARCH_ONLY |
| Aliens vs Predator (2010) | M41A/2 Pulse Rifle (AVP2010) [P2] ; VP78 Pistol [P2] ; ZX-76 Shotgun [P2] ; M59/B Smartgun [P2] ; M260B Flamethrower [P2] ; M42C Scoped Rifle [P2] | RESEARCH_ONLY |
| Aliens: Colonial Marines | M4RA Battle Rifle [P2] ; NSG 23 Assault Rifle [P2] ; MK221 Tactical Shotgun [P2] ; 88 Mod 4 Combat Pistol [P2] ; ID23 Incineration Unit [P2] ; P9 Sonic Harpoon Artillery [P2] ; XM99A Phased Plasma Pulse Rifle [P2] ; M20 Claymore Mine [P2] | RESEARCH_ONLY |
| Aliens: Colonial Marines — DLC | Hicks' Shotgun (legendary) [P2] ; Hudson's Pulse Rifle (legendary) [P2] ; Vasquez's Smartgun (legendary) [P2] ; Gorman's Pistol (legendary) [P2] ; Frost's Flamethrower (legendary) [P2] ; Ripley's M41A/M240 combo (DLC) [P2] | RESEARCH_ONLY |
| Aliens: Dark Descent | M41AE3 Heavy Pulse Rifle [P2] ; M39-U Submachine Gun [P2] ; XM99A1 Phased Plasma Pulse Rifle [P2] ; Lacrima A20 Carbine [P2] | RESEARCH_ONLY |
| Aliens: Fireteam Elite | M41A3 Burst Rifle [P1] ; L36 Halberd [P1] ; Kramer Assault Rifle [P1] ; M42A2 Scout Rifle [P1] ; Twilight V.4 DMR [P1] ; M42A3 Sniper Rifle [P1] ; X46 Ballista Flechette Rifle [P1] ; X43 Barrage Flechette SMG [P1] ; DT-57 Medved [P1] ; Heirloom Standoff [P1] ; M37A3 Pump Shotgun [P1] ; Armat M10 Auto Pistol [P1] ; Type 78 Burst Pistol [P1] ; Kramer .50 Magnum [P1] ; Hyperdyne Twinhammer [P1] ; Type 95 Combat Pistol (≈ weapon-190-type-95-combat-pistol) [P1] ; M41E4 Heavy Pulse Rifle [P0] ; M95 Grenade Launcher [P1] | RESEARCH_ONLY |
| Aliens: Fireteam Elite 2 — DLC/bonus | Ripley's Hive Exterminator Rifle [P1] ; Rain's Jackson's Star Pulse Rifle [P1] | RESEARCH_ONLY |
| Aliens: Fireteam Elite 2 — Patch 2026 | Mondo Heat 9000 [P0] | RESEARCH_ONLY |
| Aliens: Fireteam Elite 2 (2026) | L56A3 Smartgun [P0] ; M12A1 Rocket Launcher [P0] ; DB-48 Daittyo Heavy Rifle [P0] ; HNT-1 El Alamein Revolver Rifle [P0] ; BD-03 Djinn Personal Railgun [P0] ; Type 111 Directed Particle Emitter [P0] ; EDS-93 Zadak Plasma Discharger Mk.2 [P0] ; SMB-94 Zephyr Plasma Emitter [P0] ; Type 21 Tactical Shotgun Mk.2 [P0] ; BD-55 Jokkh Burst Shotgun [P1] ; Type 200 Cryo Gun [P1] ; F44AR Pulse Rifle [P1] ; BD-16 Begho [P1] | RESEARCH_ONLY |
| AliensRL | M4A5 Compact Pistol [P2] ; MK88 Combat Pistol [P2] ; M3A Submachine Gun [P2] ; M12 Beretta SMG [P2] | RESEARCH_ONLY |
| AVP (2004) | Predator Shuriken [P2] | RESEARCH_ONLY |
| AVP: Requiem (2007) | Predator Remote Mines [P2] ; Predator Plasma Pistol (Wolf) [P2] ; Predator Whip (Wolf) [P2] | RESEARCH_ONLY |
| AVP2: Primal Hunt | Energy Flechette (Primal Hunt) [P2] | RESEARCH_ONLY |
| Comics Dark Horse / Marvel | Unidentified comic marine sidearm [P2] | RESEARCH_ONLY |
| Predator (1987) | Shoulder Plasmacaster [P2] | RESEARCH_ONLY |
| Predator 2 (1990) | Predator Wristgun [P2] ; Predator Speargun [P2] ; Predator Netgun [P2] ; Predator Sword [P2] | RESEARCH_ONLY |
| Predators (2010) | Predator Axe [P2] | RESEARCH_ONLY |
| Prey (2022) | Predator Wrist Shield [P2] ; Predator Bow / Bolt Caster [P2] ; Predator Laser Discs [P2] | RESEARCH_ONLY |
| Prometheus (2012) | ES-7 Supernova Shockgun [P2] ; Flammenwerfer 3 [P2] | RESEARCH_ONLY |
| The Predator (2018) | Predator Kujhad [P2] ; Predator Killer Suit [P2] | RESEARCH_ONLY |

Dossiers d’identification V170 (non achetables) :

| Dossier | Titre | Œuvre | Alimentation | Comparaison |
| --- | --- | --- | --- | --- |
| proposed-db-48-daittyo-heavy-rifle | DB-48 Daittyo Heavy Rifle | Aliens: Fireteam Elite 2 | unverified | — |
| proposed-l56a3-smartgun | L56A3 Smartgun | Aliens: Fireteam Elite 2 | belt-unverified | — |
| comparison-m41a2-afe2 | M41A2 Pulse Rifle — AFE2 appearance | Aliens: Fireteam Elite 2 | box-unverified | weapon-002-m41a2-pulse-rifle |
| proposed-hnt-1-el-alamein-revolver-rifle | HNT-1 El Alamein Revolver Rifle | Aliens: Fireteam Elite 2 | cylinder-unverified | — |
| proposed-bd-03-djinn-personal-railgun | BD-03 Djinn Personal Railgun | Aliens: Fireteam Elite 2 | charge-unverified | — |
| proposed-type-111-directed-particle-emitter | Type 111 Directed Particle Emitter | Aliens: Fireteam Elite 2 | cell-unverified | — |
| proposed-eds-93-zadak-plasma-discharger-mk-2 | EDS-93 Zadak Plasma Discharger Mk.2 | Aliens: Fireteam Elite 2 | cell-unverified | — |
| proposed-smb-94-zephyr-plasma-emitter | SMB-94 Zephyr Plasma Emitter | Aliens: Fireteam Elite 2 | cell-unverified | — |
| proposed-m12a1-rocket-launcher | M12A1 Rocket Launcher | Aliens: Fireteam Elite 2 | rocket-unverified | — |
| comparison-ocap91-afe2 | OCAP-91 Volcan — AFE2 appearance | Aliens: Fireteam Elite 2 | tank-unverified | weapon-147-ocap-91-volcan |
| proposed-type-21-tactical-shotgun-mk-2 | Type 21 Tactical Shotgun Mk.2 | Aliens: Fireteam Elite 2 | shell-unverified | — |
| comparison-x1-fireball-afe2 | X1 Fireball — AFE2 appearance | Aliens: Fireteam Elite 2 | projectile-unverified | weapon-171-x1-fireball |
| proposed-mondo-heat-9000 | Mondo Heat 9000 | Aliens: Fireteam Elite 2 — Patch 2026 | heat-and-cryo-augment-unverified | — |
| proposed-model-37-12-gauge-pump-action | Shotgun — Sevastopol | Alien: Isolation | tube-unverified | — |
| proposed-sevastopol-flamethrower | Flamethrower — Sevastopol | Alien: Isolation | tank-unverified | — |
| proposed-dv-303-bolt-gun | Bolt Gun — Sevastopol | Alien: Isolation | single-unverified | — |
| comparison-isolation-revolver | Revolver — Sevastopol | Alien: Isolation | cylinder-unverified | weapon-021-357-magnum-revolver |
| comparison-isolation-stun-baton | Stun Baton — Sevastopol | Alien: Isolation | energy-unverified | weapon-033-stun-baton |
| proposed-m41e4-heavy-pulse-rifle | M41E4 Heavy Pulse Rifle | Aliens: Fireteam Elite | unverified | — |

Médias demandés par le propriétaire, état de la couverture : *Alien* (1979) —
fusil-harpon au catalogue (weapon-024, identité secondaire), lance-flammes et
aiguillon électrique du Nostromo [À DÉFINIR, à inscrire à l’index] ; *Aliens*
(1986) — M41A, M56, M240, VP70, M40 et sentinelle au catalogue, U1, fusil de
Hicks (promu) et combinaison de Ripley à l’index ; *Alien 3* — [À DÉFINIR] ;
*Alien Resurrection* — 9 dossiers ; *Prometheus* — ES-4 au catalogue,
2 dossiers ; *Covenant* — 5 dossiers ; *Romulus* — F44AA au catalogue ;
*Alien: Isolation* — revolver, bolt gun, bâton, cutter au catalogue, fusil
et lance-flammes promus, 4 consommables à l’index ; *Colonial Marines* —
M37A2, M39, M4A3, M5 au catalogue, 14 dossiers ; *Fireteam Elite* /
*Pathogen* — 32 armes au catalogue (147–177, 190), 18 + 16 dossiers (AFE2) ; *Dark Descent* —
arme lourde à impulsions au catalogue, 4 dossiers ; *Alien: Earth* —
1 dossier non identifié ; *Colonial Marines Technical Manual* (1995) — cité
par la bible pour la désignation M40 HEDP et la cadence « 900 coups/min »
du M41A, **non consulté ici** : aucune valeur n’en est tirée [À VÉRIFIER].

## Vérifications exécutées

- `node --test scripts/verify-weapon-arsenal-v188.mjs` (dans `npm run test:weapons`) :
  intégrité du catalogue (178 identifiants historiques intacts, 3 ajouts en fin),
  table source = CSV, profil pour chaque arme, politique d’alimentation (seuls les
  quatre M41A détachables), tube (pompe, rechargement interrompu), lanceur
  (capacité 1, total conservé, traînée, explosion), barillet/bande/réservoir
  (conservation à l’achèvement et à l’interruption), sauvegardes (reprise,
  alimentation falsifiée, ancienne sauvegarde), désactivation, VFX/audio/emplacement.
- `scripts/qa-arsenal-v188.mjs` (Chromium, port déclaré) : 20 armes du lot A
  tirées avec la touche F tenue et rechargées avec R dans une mission réelle,
  munitions conservées, 0 erreur de page et de console (fixtures et injections
  déclarées en tête du script).

## Reste à faire (précis)

1. Plaques natives (images admises) des armes 194–196, puis admission V121/V122
   et ouverture à l’achat selon la règle existante.
2. Animations natives : course de pompe, ouverture du barillet, changement de
   bande et de réservoir, chambrage de roquette (le rig V125 garde la pose de
   rechargement partagée).
3. Armes « box » hors M41A : chargeur physique seulement avec une preuve propre au
   modèle consignée dans le CSV et la garde V193 (VP70, M4A3, F44AA… [À VÉRIFIER]).
4. Hors lot A : cellules d’énergie (ES-4, plasma, N79, P.649, EVI-87, EDS-93),
   réservoirs des projecteurs Tantalus et du cutter, tir unique mécanique
   (harpon, bolt gun, arc, harpon sonique), bandes L59 et Thunderbolt, barillet
   du Frontier Revolver, réservoirs Volcan/Type 99 — profils publiés, pont natif
   non activé (transfert numérique V77).
5. Sons propres à chaque arme (aujourd’hui indices partagés), sprites d’impact et
   de douilles dédiés, M41A sous-canon 30 mm natif (contrat V174 non raccordé).
6. Questions propriétaire : voir `docs/development/QUESTIONS_PROPRIETAIRE_V188.md`
   (section du 22 novembre 2026 — arsenal).
