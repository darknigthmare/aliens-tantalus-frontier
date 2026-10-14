/** Rendering-only correction for the measured white/purple edge matte in
 * existing cutouts. Source PNGs, alpha, atlas cells and physical feet are intact.
 * No global white/magenta key: opaque highlights, uniforms and interior colors
 * are never candidates. Only measured assets and a two-pixel exterior rim pass.
 */
export const SPRITE_ALPHA_POLICY_V134 = Object.freeze({
  schema: 134, maxExteriorDistance: 2, maxCoreDistance: 4,
  maxCandidateAlpha: 223, minCoreAlpha: 224,
  cacheBytes: 64 * 1024 * 1024, cacheEntries: 48,
  sourceStatus: 'measured-existing-cutouts-rendering-only', alphaChanges: false
});
export const SPRITE_ALPHA_ASSETS_V134 = Object.freeze([
  {
    "path": "/assets/openai/hub/props/bridge-terminal.png",
    "width": 239,
    "height": 157
  },
  {
    "path": "/assets/openai/hub/props/sensor-console.png",
    "width": 215,
    "height": 188
  },
  {
    "path": "/assets/openai/hub/props/cryopod.png",
    "width": 241,
    "height": 131
  },
  {
    "path": "/assets/openai/hub/props/bunk-module.png",
    "width": 228,
    "height": 170
  },
  {
    "path": "/assets/openai/hub/props/mess-table.png",
    "width": 220,
    "height": 139
  },
  {
    "path": "/assets/openai/hub/props/medical-bed.png",
    "width": 225,
    "height": 174
  },
  {
    "path": "/assets/openai/hub/props/lab-console.png",
    "width": 223,
    "height": 164
  },
  {
    "path": "/assets/openai/hub/props/quarantine-unit.png",
    "width": 189,
    "height": 186
  },
  {
    "path": "/assets/openai/hub/props/armory-counter-v61.png",
    "width": 1024,
    "height": 512
  },
  {
    "path": "/assets/openai/hub/props/workbench.png",
    "width": 232,
    "height": 175
  },
  {
    "path": "/assets/openai/hub/props/vehicle-lift.png",
    "width": 235,
    "height": 199
  },
  {
    "path": "/assets/openai/hub/props/reactor-column.png",
    "width": 186,
    "height": 205
  },
  {
    "path": "/assets/openai/hub/props/life-support-scrubber.png",
    "width": 226,
    "height": 179
  },
  {
    "path": "/assets/openai/sprites/normalized/vehicles/m577-apc-action-sheet.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/hub/props/bulkhead-door.png",
    "width": 195,
    "height": 186
  },
  {
    "path": "/assets/openai/hub/props/lift-door.png",
    "width": 187,
    "height": 191
  },
  {
    "path": "/assets/openai/sprites/normalized/vehicles/ud-4l-cheyenne-dropship-action-sheet.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/metroidvania/props/overhead-catwalk.png",
    "width": 232,
    "height": 146
  },
  {
    "path": "/assets/openai/metroidvania/props/drop-platform.png",
    "width": 180,
    "height": 84
  },
  {
    "path": "/assets/openai/metroidvania/props/short-ledge.png",
    "width": 196,
    "height": 86
  },
  {
    "path": "/assets/openai/metroidvania/props/wall-ladder.png",
    "width": 169,
    "height": 232
  },
  {
    "path": "/assets/openai/metroidvania/props/vent-entrance.png",
    "width": 146,
    "height": 146
  },
  {
    "path": "/assets/openai/metroidvania/props/maintenance-pipe.png",
    "width": 146,
    "height": 232
  },
  {
    "path": "/assets/openai/metroidvania/props/ceiling-cables.png",
    "width": 190,
    "height": 142
  },
  {
    "path": "/assets/openai/metroidvania/props/foreground-pipes.png",
    "width": 163,
    "height": 148
  },
  {
    "path": "/assets/openai/metroidvania/props/supply-crates.png",
    "width": 175,
    "height": 160
  },
  {
    "path": "/assets/openai/ship-animals/v87/habitat-props.png",
    "width": 1536,
    "height": 1024
  },
  {
    "path": "/assets/openai/ship-animals/v87/port-props.png",
    "width": 1536,
    "height": 1024
  },
  {
    "path": "/assets/openai/ship-animals/v87/port-vendor-atlas.png",
    "width": 1536,
    "height": 1024
  },
  {
    "path": "/assets/openai/refuge/v87/refuge-props-atlas.png",
    "width": 1774,
    "height": 887
  },
  {
    "path": "/assets/openai/sprites/normalized/enemies/weyland-yutani-commando-action-sheet-v56.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/normalized/enemies/seegson-security-action-sheet-v56.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/normalized/enemies/upp-vanguard-action-sheet-v56.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/normalized/enemies/cult-host-action-sheet-v56.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/normalized/enemies/colonial-raider-action-sheet-v56.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/normalized/enemies/atarax-controller-action-sheet-v56.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/normalized/enemies/working-joe-combat-sheet.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/normalized/npcs/mara-vega-locomotion-sheet.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/normalized/npcs/tamsin-velez-locomotion-sheet.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/normalized/npcs/idris-kwan-locomotion-sheet.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/normalized/npcs/noor-okafor-locomotion-sheet.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/normalized/npcs/bishop-9-locomotion-sheet.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/normalized/npcs/rook-locomotion-sheet.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/normalized/npcs/sanaa-doyle-locomotion-sheet.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/normalized/npcs/maksim-orlov-locomotion-sheet.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/normalized/npcs/inez-harlow-locomotion-sheet.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/normalized/npcs/david-8r-locomotion-sheet.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/normalized/npcs/jun-park-locomotion-sheet.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/normalized/npcs/asha-mbaye-locomotion-sheet.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/normalized/npcs/pablo-reyes-locomotion-sheet.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/normalized/npcs/echo-a-locomotion-sheet.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/normalized/npcs/leila-s-rensen-locomotion-sheet.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/normalized/npcs/cal-mercer-locomotion-sheet.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/normalized/npcs/mara-vega-mission-sheet.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/normalized/npcs/tamsin-velez-mission-sheet.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/normalized/npcs/idris-kwan-mission-sheet.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/normalized/npcs/noor-okafor-mission-sheet.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/normalized/npcs/bishop-9-mission-sheet.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/normalized/npcs/rook-mission-sheet.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/normalized/npcs/sanaa-doyle-mission-sheet.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/normalized/npcs/maksim-orlov-mission-sheet.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/normalized/npcs/inez-harlow-mission-sheet.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/normalized/npcs/david-8r-mission-sheet.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/normalized/npcs/jun-park-mission-sheet.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/normalized/npcs/asha-mbaye-mission-sheet.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/normalized/npcs/pablo-reyes-mission-sheet.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/normalized/npcs/echo-a-mission-sheet.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/normalized/npcs/leila-s-rensen-mission-sheet.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/normalized/npcs/cal-mercer-mission-sheet.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/human-factions-animation-sheet.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/synthetic-android-animation-sheet.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/normalized/player/echo9-marine-locomotion-sheet.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/normalized/player/echo9-marine-combat-sheet.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/normalized/player/echo9-marine-melee-sheet.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/normalized/player/echo9-marine-interaction-sheet.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/normalized/player/echo9-marine-tool-use-sheet.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/player/costumes-v119/nostromo-crew/locomotion.png",
    "width": 1254,
    "height": 1254
  },
  {
    "path": "/assets/openai/sprites/player/costumes-v119/nostromo-crew/combat.png",
    "width": 1254,
    "height": 1254
  },
  {
    "path": "/assets/openai/sprites/player/costumes-v119/nostromo-crew/melee.png",
    "width": 1254,
    "height": 1254
  },
  {
    "path": "/assets/openai/sprites/player/costumes-v119/nostromo-crew/interaction.png",
    "width": 1254,
    "height": 1254
  },
  {
    "path": "/assets/openai/sprites/player/costumes-v119/nostromo-crew/tool-use.png",
    "width": 1254,
    "height": 1254
  },
  {
    "path": "/assets/openai/sprites/player/rig-v126/echo9-upper-parts-v126.png",
    "width": 1254,
    "height": 1254
  },
  {
    "path": "/assets/openai/sprites/player/rig-v126/echo9-lower-parts-v126.png",
    "width": 1254,
    "height": 1254
  },
  {
    "path": "/assets/openai/sprites/player/rig-v126/echo9-head-back-parts-v126.png",
    "width": 1254,
    "height": 1254
  },
  {
    "path": "/assets/openai/sprites/player/rig-v125/echo9-body-locomotion-v125.png",
    "width": 1254,
    "height": 1254
  },
  {
    "path": "/assets/openai/sprites/player/rig-v125/echo9-body-combat-v125.png",
    "width": 1254,
    "height": 1254
  },
  {
    "path": "/assets/openai/sprites/player/rig-v125/echo9-arm-parts-v125.png",
    "width": 1254,
    "height": 1254
  },
  {
    "path": "/assets/openai/sprites/player/colonial-v129/uscm-torso-right-v129.png",
    "width": 1086,
    "height": 1448
  },
  {
    "path": "/assets/openai/sprites/player/colonial-v129/uscm-torso-left-v129.png",
    "width": 1086,
    "height": 1448
  },
  {
    "path": "/assets/openai/sprites/player/colonial-v129/uscm-arms-v129.png",
    "width": 1254,
    "height": 1254
  },
  {
    "path": "/assets/openai/sprites/player/colonial-v129/uscm-legs-v129.png",
    "width": 1254,
    "height": 1254
  },
  {
    "path": "/assets/openai/sprites/player/colonial-v129/uscm-head-back-v129.png",
    "width": 1536,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/static-enemy-v94/game-afe-synth-trooper.png",
    "width": 1024,
    "height": 1536
  },
  {
    "path": "/assets/openai/sprites/static-enemy-v94/game-afe-synth-guard.png",
    "width": 1024,
    "height": 1536
  },
  {
    "path": "/assets/openai/sprites/static-enemy-v94/game-afe-synth-sniper.png",
    "width": 1024,
    "height": 1536
  },
  {
    "path": "/assets/openai/sprites/static-enemy-v94/game-afe-synth-heavy.png",
    "width": 1024,
    "height": 1536
  },
  {
    "path": "/assets/openai/sprites/static-enemy-v95/human-xeno-armor-female-queen.png",
    "width": 1254,
    "height": 1254
  },
  {
    "path": "/assets/openai/sprites/static-enemy-v95/human-xeno-armor-female.png",
    "width": 1254,
    "height": 1254
  },
  {
    "path": "/assets/openai/sprites/static-enemy-v95/human-xeno-armor-male-full.png",
    "width": 1254,
    "height": 1254
  },
  {
    "path": "/assets/openai/sprites/static-enemy-v95/human-xeno-armor-male.png",
    "width": 1254,
    "height": 1254
  },
  {
    "path": "/assets/openai/sprites/static-enemy-v95/ref-16-humanoide-armure-bronze.png",
    "width": 1254,
    "height": 1254
  },
  {
    "path": "/assets/openai/sprites/static-import-v103/synth-workingjoe-classic.png",
    "width": 1671,
    "height": 941
  },
  {
    "path": "/assets/openai/sprites/animated-import-v108/synth-workingjoe-classic-walk.png",
    "width": 1254,
    "height": 1254
  },
  {
    "path": "/assets/openai/sprites/static-import-v103/synth-workingjoe-battle.png",
    "width": 1024,
    "height": 1536
  },
  {
    "path": "/assets/openai/sprites/animated-import-v118/synth-workingjoe-battle-walk.png",
    "width": 1247,
    "height": 1261
  },
  {
    "path": "/assets/openai/sprites/static-import-v103/synth-workingjoe-hazmat.png",
    "width": 1024,
    "height": 1536
  },
  {
    "path": "/assets/openai/sprites/static-import-v103/synth-workingjoe-tactical.png",
    "width": 1024,
    "height": 1535
  },
  {
    "path": "/assets/openai/sprites/static-import-v106/synth-eloise.png",
    "width": 1024,
    "height": 1536
  },
  {
    "path": "/assets/openai/sprites/static-import-v106/synth-jerri-1.png",
    "width": 1254,
    "height": 1254
  },
  {
    "path": "/assets/openai/sprites/static-import-v106/synth-jerri-2.png",
    "width": 1254,
    "height": 1254
  },
  {
    "path": "/assets/openai/sprites/static-import-v106/wy-apesuit.png",
    "width": 1102,
    "height": 1427
  },
  {
    "path": "/assets/openai/sprites/static-import-v106/wy-covenant-david.png",
    "width": 1198,
    "height": 1313
  },
  {
    "path": "/assets/openai/sprites/static-game-v106/game-afe-synth-warden.png",
    "width": 1024,
    "height": 1536
  },
  {
    "path": "/assets/openai/sprites/animated-import-v107/game-afe-synth-warden-walk.png",
    "width": 1536,
    "height": 1024
  },
  {
    "path": "/assets/openai/sprites/static-game-v106/game-dd-wy-commando.png",
    "width": 1024,
    "height": 1536
  },
  {
    "path": "/assets/openai/sprites/static-game-v106/game-dd-synthetic.png",
    "width": 1024,
    "height": 1536
  },
  {
    "path": "/assets/openai/sprites/animated-import-v108/game-dd-synthetic-walk.png",
    "width": 1254,
    "height": 1254
  },
  {
    "path": "/assets/openai/sprites/static-game-v106/game-dd-guardian.png",
    "width": 1024,
    "height": 1536
  },
  {
    "path": "/assets/openai/sprites/static-game-v110/game-afe-synth-incinerator.png",
    "width": 1024,
    "height": 1536
  },
  {
    "path": "/assets/openai/sprites/animated-import-v122/synth-incinerator-walk.png",
    "width": 1254,
    "height": 1254
  },
  {
    "path": "/assets/openai/sprites/static-game-v110/game-afe-synth-detonator.png",
    "width": 1024,
    "height": 1536
  },
  {
    "path": "/assets/openai/sprites/static-game-v110/game-afe-synth-containment.png",
    "width": 1024,
    "height": 1536
  },
  {
    "path": "/assets/openai/sprites/animated-import-v122/synth-containment-walk.png",
    "width": 1254,
    "height": 1254
  },
  {
    "path": "/assets/openai/sprites/static-game-v111/game-afe-synth-enforcer.png",
    "width": 1024,
    "height": 1536
  },
  {
    "path": "/assets/openai/sprites/animated-import-v122/synth-enforcer-walk.png",
    "width": 1254,
    "height": 1254
  },
  {
    "path": "/assets/openai/sprites/static-game-v118/darwin-era-cultist.png",
    "width": 1024,
    "height": 1536
  },
  {
    "path": "/assets/user/drive-v123/enemies/game-working-joe-hazard.png",
    "width": 1024,
    "height": 1536
  },
  {
    "path": "/assets/user/drive-v123/enemies/game-working-joe-standard.png",
    "width": 1024,
    "height": 1536
  },
  {
    "path": "/assets/user/drive-v123/enemies/game-combat-synthetic-avp2.png",
    "width": 1024,
    "height": 1536
  },
  {
    "path": "/assets/openai/sprites/static-enemy-v97/enemy-093-albino-working-joe.png",
    "width": 1225,
    "height": 1284
  },
  {
    "path": "/assets/openai/sprites/static-enemy-v97/enemy-094-albino-combat-synthetic.png",
    "width": 1227,
    "height": 1282
  },
  {
    "path": "/assets/openai/sprites/static-enemy-v97/enemy-095-albino-weyland-yutani-commando.png",
    "width": 1246,
    "height": 1263
  },
  {
    "path": "/assets/openai/sprites/static-enemy-v97/enemy-096-albino-upp-vanguard.png",
    "width": 1226,
    "height": 1283
  },
  {
    "path": "/assets/openai/sprites/static-enemy-v97/enemy-097-albino-seegson-security.png",
    "width": 1230,
    "height": 1278
  },
  {
    "path": "/assets/openai/sprites/static-enemy-v97/enemy-098-albino-colonial-raider.png",
    "width": 1222,
    "height": 1287
  },
  {
    "path": "/assets/openai/sprites/static-enemy-v97/enemy-099-albino-atarax-controller.png",
    "width": 1192,
    "height": 1320
  },
  {
    "path": "/assets/openai/sprites/static-enemy-v97/enemy-100-albino-cult-host.png",
    "width": 1180,
    "height": 1333
  },
  {
    "path": "/assets/openai/sprites/static-enemy-v96/armored-working-joe.png",
    "width": 1024,
    "height": 1536
  },
  {
    "path": "/assets/openai/sprites/static-enemy-v96/armored-combat-synthetic.png",
    "width": 1205,
    "height": 1306
  },
  {
    "path": "/assets/openai/sprites/static-enemy-v96/armored-weyland-yutani-commando.png",
    "width": 1254,
    "height": 1254
  },
  {
    "path": "/assets/openai/sprites/static-enemy-v98/enemy-148-armored-upp-vanguard.png",
    "width": 1254,
    "height": 1254
  },
  {
    "path": "/assets/openai/sprites/static-enemy-v98/enemy-149-armored-seegson-security.png",
    "width": 1254,
    "height": 1254
  },
  {
    "path": "/assets/openai/sprites/static-enemy-v98/enemy-150-armored-colonial-raider.png",
    "width": 1254,
    "height": 1254
  },
  {
    "path": "/assets/openai/sprites/static-enemy-v98/enemy-151-armored-atarax-controller.png",
    "width": 1024,
    "height": 1536
  },
  {
    "path": "/assets/openai/sprites/static-enemy-v98/enemy-152-armored-cult-host.png",
    "width": 1024,
    "height": 1536
  },
  {
    "path": "/assets/openai/sprites/static-enemy-v99/enemy-197-acid-blooded-working-joe.png",
    "width": 1332,
    "height": 1181
  },
  {
    "path": "/assets/openai/sprites/static-enemy-v99/enemy-198-acid-blooded-combat-synthetic.png",
    "width": 1312,
    "height": 1199
  },
  {
    "path": "/assets/openai/sprites/static-enemy-v99/enemy-199-acid-blooded-weyland-yutani-commando.png",
    "width": 1254,
    "height": 1254
  },
  {
    "path": "/assets/openai/sprites/static-enemy-v99/enemy-200-acid-blooded-upp-vanguard.png",
    "width": 1374,
    "height": 1145
  },
  {
    "path": "/assets/openai/sprites/static-enemy-v99/enemy-201-acid-blooded-seegson-security.png",
    "width": 1254,
    "height": 1254
  },
  {
    "path": "/assets/openai/sprites/static-enemy-v99/enemy-202-acid-blooded-colonial-raider.png",
    "width": 1213,
    "height": 1296
  },
  {
    "path": "/assets/openai/sprites/static-enemy-v99/enemy-204-acid-blooded-cult-host.png",
    "width": 1226,
    "height": 1283
  },
  {
    "path": "/assets/openai/sprites/static-enemy-v99/enemy-249-cryo-adapted-working-joe.png",
    "width": 1024,
    "height": 1536
  },
  {
    "path": "/assets/openai/sprites/static-enemy-v99/enemy-250-cryo-adapted-combat-synthetic.png",
    "width": 1206,
    "height": 1305
  },
  {
    "path": "/assets/openai/sprites/static-enemy-v99/enemy-251-cryo-adapted-weyland-yutani-commando.png",
    "width": 1254,
    "height": 1254
  },
  {
    "path": "/assets/openai/sprites/static-enemy-v99/enemy-252-cryo-adapted-upp-vanguard.png",
    "width": 1225,
    "height": 1284
  },
  {
    "path": "/assets/openai/sprites/static-enemy-v99/enemy-253-cryo-adapted-seegson-security.png",
    "width": 1254,
    "height": 1254
  },
  {
    "path": "/assets/openai/sprites/static-enemy-v99/enemy-254-cryo-adapted-colonial-raider.png",
    "width": 1254,
    "height": 1254
  },
  {
    "path": "/assets/openai/hub/props/v134/rear-equipment-atlas.png",
    "width": 1774,
    "height": 887
  },
  {
    "path": "/assets/openai/sprites/normalized/vehicles/p-5000-powered-work-loader-action-sheet.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/hub/proving-ground/v81/proving-ground-range-console-v81.png",
    "width": 1024,
    "height": 1024
  },
  {
    "path": "/assets/openai/hub/proving-ground/v82/proving-ground-ceiling-beam-v82.png",
    "width": 1536,
    "height": 450
  },
  {
    "path": "/assets/openai/metroidvania/props/floor-segment.png",
    "width": 218,
    "height": 135
  }
].map(Object.freeze));
const admitted = new Map(SPRITE_ALPHA_ASSETS_V134.map(asset => [asset.path, asset]));
const cache = new Map();
const stats = { preparations: 0, cacheHits: 0, drawRequests: 0, evictions: 0, failures: 0,
  changedPixels: 0, whitePixels: 0, purplePixels: 0, retainedBytes: 0, correctedDrawRequests: 0 };
function assetPath(image) {
  const source = image?.currentSrc || image?.src;
  if (typeof source !== 'string' || !source) return null;
  try { return new URL(source, 'http://sprite.invalid').pathname; } catch { return null; }
}
function exteriorDistance(data, width, height, x, y) {
  for (let distance = 1; distance <= SPRITE_ALPHA_POLICY_V134.maxExteriorDistance; distance++) {
    for (let dy = -distance; dy <= distance; dy++) for (let dx = -distance; dx <= distance; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== distance) continue;
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height || data[(ny * width + nx) * 4 + 3] === 0) return distance;
    }
  }
  return 0;
}
function nearestCore(data, width, height, x, y) {
  for (let distance = 1; distance <= SPRITE_ALPHA_POLICY_V134.maxCoreDistance; distance++) {
    let best = -1, bestDistance = Infinity, bestAlpha = 0;
    for (let dy = -distance; dy <= distance; dy++) for (let dx = -distance; dx <= distance; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== distance) continue;
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const at = (ny * width + nx) * 4, alpha = data[at + 3], squared = dx * dx + dy * dy;
      if (alpha >= SPRITE_ALPHA_POLICY_V134.minCoreAlpha
        && (squared < bestDistance || squared === bestDistance && alpha > bestAlpha)) {
        best = at; bestDistance = squared; bestAlpha = alpha;
      }
    }
    if (best >= 0) return best;
  }
  return -1;
}
/** Pure RGBA operation. Original alpha and all non-candidate pixels are exact.
 * RGB from the nearest solid material removes a white-matted antialias rim;
 * it does not erode the silhouette or turn pale clothes into transparency.
 */
export function repairSpriteAlphaPixelsV134({ data, width, height } = {}, policy) {
  if (!policy || !Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0
    || !data || data.length !== width * height * 4) return null;
  let repaired = null, whitePixels = 0, purplePixels = 0, maxDistance = 0;
  for (let at = 0; at < data.length; at += 4) {
    const alpha = data[at + 3];
    if (!alpha || alpha > SPRITE_ALPHA_POLICY_V134.maxCandidateAlpha) continue;
    const r = data[at], g = data[at + 1], b = data[at + 2];
    const white = Math.min(r, g, b) >= 220 && Math.max(r, g, b) - Math.min(r, g, b) <= 24;
    const purple = alpha <= 96 && r >= 240 && b >= 240 && g <= 20;
    if (!white && !purple) continue;
    const pixel = at / 4, x = pixel % width, y = Math.floor(pixel / width);
    const distance = exteriorDistance(data, width, height, x, y);
    if (!distance) continue;
    const core = nearestCore(data, width, height, x, y);
    if (core < 0) continue;
    // A pale/white solid core indicates real light material, not a white matte.
    if (white && Math.min(data[core], data[core + 1], data[core + 2]) >= 200) continue;
    // An opaque purple core means authored purple clothing/paint: retain it.
    if (purple && data[core] >= 200 && data[core + 2] >= 200 && data[core + 1] <= 80) continue;
    if (r === data[core] && g === data[core + 1] && b === data[core + 2]) continue;
    repaired ||= new Uint8ClampedArray(data);
    repaired[at] = data[core]; repaired[at + 1] = data[core + 1]; repaired[at + 2] = data[core + 2];
    if (white) whitePixels++; else purplePixels++;
    maxDistance = Math.max(maxDistance, distance);
  }
  return { data: repaired || data, changedPixels: whitePixels + purplePixels, whitePixels, purplePixels,
    maxDistance, alphaUnchanged: true };
}
function makeCanvas(width, height) {
  const canvas = globalThis.document?.createElement?.('canvas');
  if (!canvas?.getContext) return null;
  canvas.width = width; canvas.height = height;
  return canvas;
}
function touchCache(key, entry) { cache.delete(key); cache.set(key, entry); }
function admitCache(key, entry) {
  cache.set(key, entry); stats.retainedBytes += entry.bytes;
  while (cache.size > SPRITE_ALPHA_POLICY_V134.cacheEntries || stats.retainedBytes > SPRITE_ALPHA_POLICY_V134.cacheBytes) {
    const oldest = cache.keys().next().value, victim = cache.get(oldest);
    cache.delete(oldest); stats.retainedBytes -= victim.bytes; stats.evictions++;
  }
}
/** Returns a CanvasImageSource, never a replacement for the native Image.
 * Consumers keep readiness/source geometry on the original HTMLImageElement.
 * Drawables are shared by exact path/native size and bounded by LRU memory.
 */
export function resolveSpriteDrawableV134(image) {
  stats.drawRequests++;
  const path = assetPath(image), policy = admitted.get(path);
  if (!policy || !image?.complete || image.naturalWidth !== policy.width || image.naturalHeight !== policy.height) return image;
  const key = path;
  const existing = cache.get(key);
  if (existing) { stats.cacheHits++; touchCache(key, existing); if (existing.drawable) stats.correctedDrawRequests++; return existing.drawable || image; }
  const canvas = makeCanvas(policy.width, policy.height), ctx = canvas?.getContext?.('2d', { willReadFrequently: true });
  if (!ctx?.getImageData || !ctx?.putImageData) return image;
  try {
    ctx.drawImage(image, 0, 0);
    const pixels = ctx.getImageData(0, 0, policy.width, policy.height);
    const correction = repairSpriteAlphaPixelsV134(pixels, policy);
    if (!correction) return image;
    if (correction.changedPixels) { pixels.data.set(correction.data); ctx.putImageData(pixels, 0, 0); }
    const entry = { path, width: policy.width, height: policy.height,
      drawable: correction.changedPixels ? canvas : null,
      bytes: correction.changedPixels ? policy.width * policy.height * 4 : 0,
      changedPixels: correction.changedPixels, whitePixels: correction.whitePixels,
      purplePixels: correction.purplePixels, maxDistance: correction.maxDistance, alphaUnchanged: true };
    stats.preparations++; stats.changedPixels += correction.changedPixels;
    stats.whitePixels += correction.whitePixels; stats.purplePixels += correction.purplePixels;
    admitCache(key, entry);
    if (entry.drawable) stats.correctedDrawRequests++;
    return entry.drawable || image;
  } catch {
    // A failed/unreadable image retains its native rendering and is not retried
    // every frame. Unknown/test/non-browser image objects never enter this path.
    stats.failures++;
    admitCache(key, { path, width: policy.width, height: policy.height, drawable: null,
      bytes: 0, changedPixels: 0, whitePixels: 0, purplePixels: 0, maxDistance: 0, alphaUnchanged: true });
    return image;
  }
}
/** Read-only diagnostic used by the browser QA; no pixel/engine mutation API. */
export function getSpriteAlphaSnapshotV134() {
  return { schema: 134, ...stats, retainedEntries: cache.size,
    assets: [...cache.values()].map(({ drawable, ...entry }) => ({ ...entry, correctedDrawable: Boolean(drawable) })) };
}
