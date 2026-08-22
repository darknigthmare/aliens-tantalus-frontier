import {
  NPC_MISSION_CLIP_SETS_V55,
  resolveNpcMissionAnimationV55
} from './npc-mission-runtime-v55.js';

const freezeList = (items) => Object.freeze(items.map((item) => Object.freeze({
  ...item,
  frames: Object.freeze([...item.frames]),
  events: Object.freeze((item.events || []).map((event) => Object.freeze({ ...event })))
})));

export const SPRITE_GRID = Object.freeze({ columns: 4, rows: 4, cellWidth: 256, cellHeight: 256, guard: 16 });

export const SPRITE_PIVOTS = Object.freeze({
  'humanoid-feet': Object.freeze({ kind: 'feet', x: 128, y: 240 }),
  'creature-ground': Object.freeze({ kind: 'ground-contact', x: 128, y: 240 }),
  'vehicle-ground': Object.freeze({ kind: 'wheel-contact', x: 128, y: 240 }),
  'weapon-grip': Object.freeze({ kind: 'grip', x: 96, y: 144 })
});

export const SPRITE_HITBOXES = Object.freeze({
  'player-standing': Object.freeze({ x: 84, y: 34, width: 88, height: 206 }),
  'npc-standing': Object.freeze({ x: 88, y: 34, width: 80, height: 206 }),
  'xenomorph-standing': Object.freeze({ x: 50, y: 56, width: 156, height: 184 }),
  'runner-ground': Object.freeze({ x: 28, y: 134, width: 200, height: 106 }),
  'pathogen-mimic-large': Object.freeze({ x: 24, y: 52, width: 208, height: 188 }),
  'pale-crucible-hunter-large': Object.freeze({ x: 32, y: 42, width: 192, height: 198 }),
  'queen-standing': Object.freeze({ x: 32, y: 38, width: 192, height: 202 }),
  'facehugger-ground': Object.freeze({ x: 38, y: 142, width: 180, height: 98 }),
  'apc-hull': Object.freeze({ x: 18, y: 106, width: 220, height: 134 }),
  'weapon-pickup': Object.freeze({ x: 18, y: 94, width: 220, height: 96 }),
  'praetorian-large': Object.freeze({ x: 44, y: 48, width: 168, height: 192 }),
  'spitter-medium': Object.freeze({ x: 28, y: 132, width: 200, height: 108 }),
  'ovomorph-small': Object.freeze({ x: 82, y: 92, width: 92, height: 148 }),
  'chestburster-small': Object.freeze({ x: 54, y: 168, width: 148, height: 72 }),
  'crusher-large': Object.freeze({ x: 24, y: 100, width: 216, height: 140 }),
  'lurker-medium': Object.freeze({ x: 32, y: 138, width: 192, height: 102 }),
  'carrier-large': Object.freeze({ x: 30, y: 58, width: 196, height: 182 }),
  'ravager-large': Object.freeze({ x: 38, y: 48, width: 180, height: 192 }),
  'm577-command-hull': Object.freeze({ x: 20, y: 104, width: 216, height: 136 }),
  'm22a3-tank-hull': Object.freeze({ x: 16, y: 108, width: 224, height: 132 }),
  'p5000-loader-frame': Object.freeze({ x: 64, y: 42, width: 128, height: 198 }),
  'ud4l-dropship-hull': Object.freeze({ x: 18, y: 112, width: 220, height: 128 })
});

export const SPRITE_CLIP_SETS = Object.freeze({
  ...Object.fromEntries(Object.entries(NPC_MISSION_CLIP_SETS_V55).map(([id, clips]) => [
    id, freezeList(Object.values(clips))
  ])),
  'player-locomotion': freezeList([
    { id: 'idle', frames: [0, 1, 2, 3], fps: 4, loop: true, events: [{ frame: 2, type: 'body:breath' }] },
    { id: 'walk-run', frames: [4, 5, 6, 7], fps: 10, loop: true, events: [{ frame: 4, type: 'audio:footstep-right' }, { frame: 6, type: 'audio:footstep-left' }] },
    { id: 'jump-fall', frames: [8, 9, 10, 11], fps: 8, loop: false, events: [{ frame: 8, type: 'movement:takeoff' }, { frame: 10, type: 'movement:apex' }, { frame: 11, type: 'movement:land-ready' }] },
    { id: 'crouch', frames: [12, 13], fps: 5, loop: true, events: [{ frame: 12, type: 'stance:crouch' }] },
    { id: 'climb', frames: [14, 15], fps: 8, loop: true, events: [{ frame: 15, type: 'movement:climb-contact' }] }
  ]),
  'player-combat': freezeList([
    { id: 'aim-ready', frames: [0, 1, 2, 3], fps: 5, loop: true, events: [{ frame: 1, type: 'weapon:aim-ready' }] },
    { id: 'primary-fire', frames: [4, 5, 6, 7], fps: 13, loop: false, events: [{ frame: 4, type: 'weapon:shot' }, { frame: 5, type: 'weapon:recoil' }] },
    { id: 'reload', frames: [8, 9, 10, 11], fps: 9, loop: false, events: [{ frame: 9, type: 'weapon:magazine-out' }, { frame: 10, type: 'weapon:magazine-in' }, { frame: 11, type: 'weapon:chamber' }] },
    { id: 'hurt-death', frames: [12, 13, 14, 15], fps: 7, loop: false, events: [{ frame: 12, type: 'state:hurt' }, { frame: 15, type: 'state:death-lock' }] }
  ]),
  'npc-locomotion': freezeList([
    { id: 'idle', frames: [0, 1, 2, 3], fps: 4, loop: true, events: [{ frame: 2, type: 'body:breath' }] },
    { id: 'walk', frames: [4, 5, 6, 7], fps: 8, loop: true, events: [{ frame: 4, type: 'audio:footstep-right' }, { frame: 6, type: 'audio:footstep-left' }] },
    { id: 'role-work', frames: [8, 9, 10, 11], fps: 6, loop: false, events: [{ frame: 10, type: 'interaction:work' }] },
    { id: 'alert-reaction', frames: [12, 13, 14, 15], fps: 7, loop: false, events: [{ frame: 12, type: 'state:alert' }, { frame: 15, type: 'state:recover' }] }
  ]),
  'xenomorph-locomotion': freezeList([
    { id: 'idle', frames: [0, 1, 2, 3], fps: 4, loop: true, events: [{ frame: 2, type: 'creature:breathe' }] },
    { id: 'stalk-run', frames: [4, 5, 6, 7], fps: 9, loop: true, events: [{ frame: 4, type: 'audio:step-right' }, { frame: 6, type: 'audio:step-left' }] },
    { id: 'leap', frames: [8, 9, 10, 11], fps: 9, loop: false, events: [{ frame: 8, type: 'movement:takeoff' }, { frame: 10, type: 'combat:leap-window' }] },
    { id: 'crawl', frames: [12, 13, 14, 15], fps: 8, loop: true, events: [{ frame: 14, type: 'audio:claw-contact' }] }
  ]),
  'xenomorph-combat': freezeList([
    { id: 'threat-idle', frames: [0, 1, 2, 3], fps: 4, loop: true, events: [{ frame: 2, type: 'state:threat' }] },
    { id: 'claw-attack', frames: [4, 5, 6, 7], fps: 11, loop: false, events: [{ frame: 6, type: 'combat:claw-hit' }] },
    { id: 'tail-attack', frames: [8, 9, 10, 11], fps: 10, loop: false, events: [{ frame: 10, type: 'combat:tail-hit' }] },
    { id: 'hurt-death', frames: [12, 13, 14, 15], fps: 7, loop: false, events: [{ frame: 12, type: 'state:hurt' }, { frame: 15, type: 'state:death-lock' }] }
  ]),
  'runner-action': freezeList([
    { id: 'idle-prowl', frames: [0, 1, 2, 3], fps: 5, loop: true, events: [{ frame: 2, type: 'creature:breath' }] },
    { id: 'sprint', frames: [4, 5, 6, 7], fps: 12, loop: true, events: [{ frame: 4, type: 'audio:claw-step-right' }, { frame: 6, type: 'audio:claw-step-left' }] },
    { id: 'pounce-bite', frames: [8, 9, 10, 11], fps: 11, loop: false, events: [{ frame: 9, type: 'movement:takeoff' }, { frame: 10, type: 'combat:pounce-window' }, { frame: 11, type: 'combat:bite-hit' }] },
    { id: 'hurt-death', frames: [12, 13, 14, 15], fps: 8, loop: false, events: [{ frame: 12, type: 'state:hurt' }, { frame: 15, type: 'state:death-lock' }] }
  ]),
  'enemy-action-v54': freezeList([
    { id: 'idle', row: 0, frames: [0, 1, 2, 3], fps: 4, loop: true, events: [{ frame: 2, type: 'creature:breathe' }] },
    { id: 'chase', row: 1, frames: [4, 5, 6, 7], fps: 10, loop: true, events: [{ frame: 4, type: 'audio:step-right' }, { frame: 6, type: 'audio:step-left' }] },
    { id: 'attack', row: 2, frames: [8, 9, 10, 11], fps: 10, loop: false, events: [{ frame: 10, type: 'combat:attack-hit' }] },
    { id: 'death', row: 3, frames: [12, 13, 14, 15], fps: 7, loop: false, events: [{ frame: 12, type: 'state:hurt' }, { frame: 15, type: 'state:death-lock' }] }
  ]),
  'facehugger-locomotion': freezeList([
    { id: 'idle', frames: [0, 1, 2, 3], fps: 5, loop: true, events: [{ frame: 2, type: 'creature:twitch' }] },
    { id: 'scuttle', frames: [4, 5, 6, 7], fps: 12, loop: true, events: [{ frame: 5, type: 'audio:scuttle' }] },
    { id: 'leap-attach', frames: [8, 9, 10, 11], fps: 12, loop: false, events: [{ frame: 8, type: 'movement:takeoff' }, { frame: 10, type: 'combat:attach-window' }] },
    { id: 'hurt-death', frames: [12, 13, 14, 15], fps: 8, loop: false, events: [{ frame: 12, type: 'state:hurt' }, { frame: 15, type: 'state:death-lock' }] }
  ]),
  'neomorph-locomotion': freezeList([
    { id: 'idle', frames: [0, 1, 2, 3], fps: 5, loop: true, events: [{ frame: 2, type: 'creature:breathe' }] },
    { id: 'run', frames: [4, 5, 6, 7], fps: 12, loop: true, events: [{ frame: 4, type: 'audio:step-right' }, { frame: 6, type: 'audio:step-left' }] },
    { id: 'leap', frames: [8, 9, 10, 11], fps: 11, loop: false, events: [{ frame: 8, type: 'movement:takeoff' }, { frame: 10, type: 'combat:leap-window' }] },
    { id: 'hurt-death', frames: [12, 13, 14, 15], fps: 8, loop: false, events: [{ frame: 12, type: 'state:hurt' }, { frame: 15, type: 'state:death-lock' }] }
  ]),
  'working-joe-combat': freezeList([
    { id: 'idle-walk', frames: [0, 1, 2, 3], fps: 6, loop: true, events: [{ frame: 2, type: 'audio:synthetic-step' }] },
    { id: 'grab-punch', frames: [4, 5, 6, 7], fps: 9, loop: false, events: [{ frame: 5, type: 'combat:grab-window' }, { frame: 7, type: 'combat:punch-hit' }] },
    { id: 'hurt', frames: [8, 9, 10, 11], fps: 7, loop: false, events: [{ frame: 8, type: 'state:hurt' }] },
    { id: 'damaged-death', frames: [12, 13, 14, 15], fps: 7, loop: false, events: [{ frame: 12, type: 'state:damaged' }, { frame: 15, type: 'state:death-lock' }] }
  ]),
  'queen-combat': freezeList([
    { id: 'idle', frames: [0, 1, 2, 3], fps: 4, loop: true, events: [{ frame: 2, type: 'creature:crown-lift' }] },
    { id: 'advance', frames: [4, 5, 6, 7], fps: 7, loop: true, events: [{ frame: 4, type: 'audio:heavy-step-right' }, { frame: 6, type: 'audio:heavy-step-left' }] },
    { id: 'claw-tail', frames: [8, 9, 10, 11], fps: 9, loop: false, events: [{ frame: 9, type: 'combat:claw-hit' }, { frame: 11, type: 'combat:tail-hit' }] },
    { id: 'roar-hurt', frames: [12, 13, 14, 15], fps: 7, loop: false, events: [{ frame: 13, type: 'audio:roar' }, { frame: 14, type: 'state:hurt' }] }
  ]),
  'ripper-queen-action': freezeList([
    { id: 'threat-idle', frames: [0, 1, 2, 3], fps: 4, loop: true, events: [{ frame: 2, type: 'creature:crown-lift' }] },
    { id: 'royal-advance', frames: [4, 5, 6, 7], fps: 7, loop: true, events: [{ frame: 4, type: 'audio:heavy-step-right' }, { frame: 6, type: 'audio:heavy-step-left' }] },
    { id: 'claw-tail', frames: [8, 9, 10, 11], fps: 9, loop: false, events: [{ frame: 9, type: 'combat:claw-hit' }, { frame: 11, type: 'combat:tail-hit' }] },
    { id: 'wounded-death', frames: [12, 13, 14, 15], fps: 7, loop: false, events: [{ frame: 12, type: 'state:hurt' }, { frame: 13, type: 'audio:roar' }, { frame: 15, type: 'state:death-lock' }] }
  ]),
  'apc-action': freezeList([
    { id: 'idle', frames: [0, 1, 2, 3], fps: 2, loop: true, events: [{ frame: 2, type: 'vehicle:engine-idle' }] },
    { id: 'roll', frames: [4, 5, 6, 7], fps: 9, loop: true, events: [{ frame: 6, type: 'vehicle:wheel-cycle' }] },
    { id: 'turret', frames: [8, 9, 10, 11], fps: 7, loop: false, events: [{ frame: 10, type: 'vehicle:turret-ready' }] },
    { id: 'damage', frames: [12, 13, 14, 15], fps: 6, loop: false, events: [{ frame: 12, type: 'state:hurt' }, { frame: 15, type: 'vehicle:critical' }] }
  ]),
  'npc-mission-v55': freezeList([
    { id: 'ready', frames: [0, 1, 2, 3], fps: 5, loop: true, events: [{ frame: 2, type: 'state:mission-ready' }] },
    { id: 'traversal', frames: [4, 5, 6, 7], fps: 9, loop: true, events: [{ frame: 4, type: 'audio:footstep-right' }, { frame: 6, type: 'audio:footstep-left' }] },
    { id: 'role-action', frames: [8, 9, 10, 11], fps: 9, loop: false, events: [{ frame: 10, type: 'interaction:role-action' }] },
    { id: 'wounded-death', frames: [12, 13, 14, 15], fps: 7, loop: false, events: [{ frame: 12, type: 'state:hurt' }, { frame: 15, type: 'state:death-lock' }] }
  ]),
  'ovomorph-cycle-v55': freezeList([
    { id: 'sealed', frames: [0, 1, 2, 3], fps: 3, loop: true, events: [{ frame: 2, type: 'creature:egg-pulse' }] },
    { id: 'opening', frames: [4, 5, 6, 7], fps: 6, loop: false, events: [{ frame: 6, type: 'creature:egg-open' }] },
    { id: 'hatch', frames: [8, 9, 10, 11], fps: 9, loop: false, events: [{ frame: 10, type: 'combat:hatch-window' }] },
    { id: 'destroyed', frames: [12, 13, 14, 15], fps: 6, loop: false, events: [{ frame: 12, type: 'state:hurt' }, { frame: 15, type: 'state:death-lock' }] }
  ]),
  'm577-command-action-v55': freezeList([
    { id: 'command-idle', frames: [0, 1, 2, 3], fps: 3, loop: true, events: [{ frame: 2, type: 'vehicle:sensor-mast' }] },
    { id: 'roll', frames: [4, 5, 6, 7], fps: 9, loop: true, events: [{ frame: 5, type: 'vehicle:wheel-cycle' }] },
    { id: 'command-action', frames: [8, 9, 10, 11], fps: 7, loop: false, events: [{ frame: 10, type: 'vehicle:defensive-shot' }] },
    { id: 'damage', frames: [12, 13, 14, 15], fps: 6, loop: false, events: [{ frame: 12, type: 'state:hurt' }, { frame: 15, type: 'vehicle:wreck-lock' }] }
  ]),
  'm22a3-tank-action-v55': freezeList([
    { id: 'idle', frames: [0, 1, 2, 3], fps: 3, loop: true, events: [{ frame: 1, type: 'vehicle:engine-start' }] },
    { id: 'roll', frames: [4, 5, 6, 7], fps: 9, loop: true, events: [{ frame: 6, type: 'vehicle:track-cycle' }] },
    { id: 'cannon', frames: [8, 9, 10, 11], fps: 7, loop: false, events: [{ frame: 10, type: 'vehicle:cannon-shot' }] },
    { id: 'damage', frames: [12, 13, 14, 15], fps: 6, loop: false, events: [{ frame: 12, type: 'state:hurt' }, { frame: 15, type: 'vehicle:wreck-lock' }] }
  ]),
  'p5000-loader-action-v55': freezeList([
    { id: 'idle', frames: [0, 1, 2, 3], fps: 4, loop: true, events: [{ frame: 2, type: 'vehicle:hydraulic-idle' }] },
    { id: 'walk', frames: [4, 5, 6, 7], fps: 8, loop: true, events: [{ frame: 4, type: 'audio:loader-step-right' }, { frame: 6, type: 'audio:loader-step-left' }] },
    { id: 'work', frames: [8, 9, 10, 11], fps: 7, loop: false, events: [{ frame: 10, type: 'vehicle:load-lift' }] },
    { id: 'damage', frames: [12, 13, 14, 15], fps: 6, loop: false, events: [{ frame: 12, type: 'state:hurt' }, { frame: 15, type: 'vehicle:wreck-lock' }] }
  ]),
  'ud4l-dropship-action-v55': freezeList([
    { id: 'hangar', frames: [0, 1, 2, 3], fps: 3, loop: true, events: [{ frame: 3, type: 'vehicle:boarding-ready' }] },
    { id: 'launch', frames: [4, 5, 6, 7], fps: 7, loop: false, events: [{ frame: 7, type: 'vehicle:gear-retract' }] },
    { id: 'flight', frames: [8, 9, 10, 11], fps: 9, loop: true, events: [{ frame: 10, type: 'vehicle:boost' }] },
    { id: 'damage', frames: [12, 13, 14, 15], fps: 6, loop: false, events: [{ frame: 12, type: 'state:hurt' }, { frame: 15, type: 'vehicle:wreck-lock' }] }
  ]),
  'rifle-action': freezeList([
    { id: 'idle', frames: [0, 1, 2, 3], fps: 4, loop: true, events: [{ frame: 2, type: 'weapon:idle' }] },
    { id: 'recoil', frames: [4, 5, 6, 7], fps: 13, loop: false, events: [{ frame: 5, type: 'weapon:shot' }, { frame: 6, type: 'weapon:recoil' }] },
    { id: 'reload', frames: [8, 9, 10, 11], fps: 9, loop: false, events: [{ frame: 9, type: 'weapon:magazine-out' }, { frame: 10, type: 'weapon:magazine-in' }, { frame: 11, type: 'weapon:chamber' }] },
    { id: 'jam-inspect', frames: [12, 13, 14, 15], fps: 7, loop: false, events: [{ frame: 12, type: 'weapon:jam' }, { frame: 15, type: 'weapon:inspection-complete' }] }
  ])
});

const sheet = (id, imageKey, path, clipSet, pivot, hitbox, renderWidth, renderHeight, family, sourceFacing = 1, releaseReady = true, identityVerified = true) => Object.freeze({
  id, imageKey, path, clipSet, pivot, hitbox, renderWidth, renderHeight, family,
  sourceFacing: sourceFacing < 0 ? -1 : 1,
  releaseReady,
  identityVerified
});

const NPC_SHEETS = [
  ['crew-01-mara-vega', 'mara-vega'], ['crew-02-tamsin-velez', 'tamsin-velez'], ['crew-03-idris-kwan', 'idris-kwan'],
  ['crew-04-noor-okafor', 'noor-okafor'], ['crew-05-bishop-9', 'bishop-9'], ['crew-06-rook', 'rook'],
  ['crew-07-sanaa-doyle', 'sanaa-doyle'], ['crew-08-maksim-orlov', 'maksim-orlov'], ['crew-09-inez-harlow', 'inez-harlow'],
  ['crew-10-david-8r', 'david-8r'], ['crew-11-jun-park', 'jun-park'], ['crew-12-asha-mbaye', 'asha-mbaye'],
  ['crew-13-pablo-reyes', 'pablo-reyes'], ['crew-14-echo-a', 'echo-a'], ['crew-15-leila-s-rensen', 'leila-s-rensen'],
  ['crew-16-cal-mercer', 'cal-mercer']
];

const NPC_MISSION_SHEETS = [
  ['crew-01-mara-vega', 'mara-vega'], ['crew-02-tamsin-velez', 'tamsin-velez'],
  ['crew-03-idris-kwan', 'idris-kwan'], ['crew-04-noor-okafor', 'noor-okafor'],
  ['crew-05-bishop-9', 'bishop-9'], ['crew-06-rook', 'rook'],
  ['crew-07-sanaa-doyle', 'sanaa-doyle'], ['crew-08-maksim-orlov', 'maksim-orlov']
];

export const SPRITE_SHEETS = Object.freeze({
  'player.echo9-marine.locomotion': sheet('player.echo9-marine.locomotion', 'playerLocomotion', '/assets/openai/sprites/normalized/player/echo9-marine-locomotion-sheet.png', 'player-locomotion', 'humanoid-feet', 'player-standing', 110, 148, 'player'),
  'player.echo9-marine.combat': sheet('player.echo9-marine.combat', 'playerCombat', '/assets/openai/sprites/normalized/player/echo9-marine-combat-sheet.png', 'player-combat', 'humanoid-feet', 'player-standing', 110, 148, 'player'),
  'enemy.xenomorph-drone.locomotion': sheet('enemy.xenomorph-drone.locomotion', 'xenoLocomotion', '/assets/openai/sprites/normalized/enemies/xenomorph-drone-locomotion-sheet.png', 'xenomorph-locomotion', 'creature-ground', 'xenomorph-standing', 142, 106, 'enemy'),
  'enemy.xenomorph-drone.combat': sheet('enemy.xenomorph-drone.combat', 'xenoCombat', '/assets/openai/sprites/normalized/enemies/xenomorph-drone-combat-sheet.png', 'xenomorph-combat', 'creature-ground', 'xenomorph-standing', 142, 106, 'enemy', -1),
  'enemy.xenomorph-warrior.combat': sheet('enemy.xenomorph-warrior.combat', 'xenoWarrior', '/assets/openai/sprites/normalized/enemies/xenomorph-warrior-combat-sheet.png', 'xenomorph-combat', 'creature-ground', 'xenomorph-standing', 158, 120, 'enemy'),
  'enemy.xenomorph-runner.action': sheet('enemy.xenomorph-runner.action', 'xenoRunner', '/assets/openai/sprites/normalized/enemies/xenomorph-runner-action-sheet.png', 'runner-action', 'creature-ground', 'runner-ground', 168, 100, 'enemy'),
  'enemy.xenomorph-queen.combat': sheet('enemy.xenomorph-queen.combat', 'xenoQueen', '/assets/openai/sprites/normalized/enemies/xenomorph-queen-combat-sheet.png', 'queen-combat', 'creature-ground', 'queen-standing', 224, 170, 'enemy'),
  'enemy.ripper-queen.action': sheet('enemy.ripper-queen.action', 'ripperQueen', '/assets/openai/sprites/normalized/enemies/ripper-queen-action-sheet.png', 'ripper-queen-action', 'creature-ground', 'queen-standing', 224, 170, 'enemy'),
  'enemy.pathogen-mimic.action': sheet('enemy.pathogen-mimic.action', 'pathogenMimic', '/assets/openai/sprites/normalized/enemies/pathogen-mimic-action-sheet.png', 'enemy-action-v54', 'creature-ground', 'pathogen-mimic-large', 132, 96, 'enemy'),
  'enemy.pale-crucible-hunter.action': sheet('enemy.pale-crucible-hunter.action', 'paleCrucibleHunter', '/assets/openai/sprites/normalized/enemies/pale-crucible-hunter-action-sheet.png', 'enemy-action-v54', 'creature-ground', 'pale-crucible-hunter-large', 142, 106, 'enemy'),
  'enemy.xenomorph-praetorian.action': sheet('enemy.xenomorph-praetorian.action', 'xenoPraetorian', '/assets/openai/sprites/normalized/enemies/xenomorph-praetorian-action-sheet.png', 'enemy-action-v54', 'creature-ground', 'praetorian-large', 196, 150, 'enemy'),
  'enemy.xenomorph-spitter.action': sheet('enemy.xenomorph-spitter.action', 'xenoSpitter', '/assets/openai/sprites/normalized/enemies/xenomorph-spitter-action-sheet.png', 'enemy-action-v54', 'creature-ground', 'spitter-medium', 176, 104, 'enemy'),
  'enemy.ovomorph.cycle': sheet('enemy.ovomorph.cycle', 'ovomorph', '/assets/openai/sprites/normalized/enemies/ovomorph-cycle-sheet.png', 'ovomorph-cycle-v55', 'creature-ground', 'ovomorph-small', 92, 122, 'enemy'),
  'enemy.chestburster.action': sheet('enemy.chestburster.action', 'chestburster', '/assets/openai/sprites/normalized/enemies/chestburster-action-sheet.png', 'enemy-action-v54', 'creature-ground', 'chestburster-small', 104, 52, 'enemy'),
  'enemy.xenomorph-crusher.action': sheet('enemy.xenomorph-crusher.action', 'xenoCrusher', '/assets/openai/sprites/normalized/enemies/xenomorph-crusher-action-sheet.png', 'enemy-action-v54', 'creature-ground', 'crusher-large', 216, 132, 'enemy'),
  'enemy.xenomorph-lurker.action': sheet('enemy.xenomorph-lurker.action', 'xenoLurker', '/assets/openai/sprites/normalized/enemies/xenomorph-lurker-action-sheet.png', 'enemy-action-v54', 'creature-ground', 'lurker-medium', 174, 92, 'enemy'),
  'enemy.xenomorph-carrier.action': sheet('enemy.xenomorph-carrier.action', 'xenoCarrier', '/assets/openai/sprites/normalized/enemies/xenomorph-carrier-action-sheet.png', 'enemy-action-v54', 'creature-ground', 'carrier-large', 198, 144, 'enemy'),
  'enemy.xenomorph-ravager.action': sheet('enemy.xenomorph-ravager.action', 'xenoRavager', '/assets/openai/sprites/normalized/enemies/xenomorph-ravager-action-sheet.png', 'enemy-action-v54', 'creature-ground', 'ravager-large', 202, 158, 'enemy'),
  'enemy.facehugger.locomotion': sheet('enemy.facehugger.locomotion', 'facehugger', '/assets/openai/sprites/normalized/enemies/facehugger-locomotion-sheet.png', 'facehugger-locomotion', 'creature-ground', 'facehugger-ground', 112, 72, 'enemy'),
  'enemy.neomorph.locomotion': sheet('enemy.neomorph.locomotion', 'neomorph', '/assets/openai/sprites/normalized/enemies/neomorph-locomotion-sheet.png', 'neomorph-locomotion', 'creature-ground', 'xenomorph-standing', 146, 112, 'enemy'),
  'enemy.working-joe.combat': sheet('enemy.working-joe.combat', 'workingJoe', '/assets/openai/sprites/normalized/enemies/working-joe-combat-sheet.png', 'working-joe-combat', 'humanoid-feet', 'npc-standing', 88, 116, 'enemy'),
  'vehicle.m577-apc.action': sheet('vehicle.m577-apc.action', 'apc', '/assets/openai/sprites/normalized/vehicles/m577-apc-action-sheet.png', 'apc-action', 'vehicle-ground', 'apc-hull', 250, 140, 'vehicle'),
  'vehicle.m577-command-apc.action': sheet('vehicle.m577-command-apc.action', 'm577Command', '/assets/openai/sprites/normalized/vehicles/m577-command-apc-action-sheet.png', 'm577-command-action-v55', 'vehicle-ground', 'm577-command-hull', 250, 148, 'vehicle'),
  'vehicle.m22a3-jackson-tank.action': sheet('vehicle.m22a3-jackson-tank.action', 'm22a3Jackson', '/assets/openai/sprites/normalized/vehicles/m22a3-jackson-tank-action-sheet.png', 'm22a3-tank-action-v55', 'vehicle-ground', 'm22a3-tank-hull', 292, 150, 'vehicle'),
  'vehicle.p5000-powered-work-loader.action': sheet('vehicle.p5000-powered-work-loader.action', 'p5000Loader', '/assets/openai/sprites/normalized/vehicles/p-5000-powered-work-loader-action-sheet.png', 'p5000-loader-action-v55', 'vehicle-ground', 'p5000-loader-frame', 150, 192, 'vehicle'),
  'vehicle.ud4l-cheyenne-dropship.action': sheet('vehicle.ud4l-cheyenne-dropship.action', 'ud4lCheyenne', '/assets/openai/sprites/normalized/vehicles/ud-4l-cheyenne-dropship-action-sheet.png', 'ud4l-dropship-action-v55', 'vehicle-ground', 'ud4l-dropship-hull', 320, 154, 'vehicle'),
  'weapon.m41a-pulse-rifle.action': sheet('weapon.m41a-pulse-rifle.action', 'rifle', '/assets/openai/sprites/normalized/weapons/m41a-pulse-rifle-action-sheet.png', 'rifle-action', 'weapon-grip', 'weapon-pickup', 126, 72, 'weapon'),
  ...Object.fromEntries(NPC_SHEETS.map(([crewId, slug]) => {
    const id = `npc.${slug}.locomotion`;
    return [id, sheet(id, `squad:${crewId}`, `/assets/openai/sprites/normalized/npcs/${slug}-locomotion-sheet.png`, 'npc-locomotion', 'humanoid-feet', 'npc-standing', 92, 140, 'npc')];
  })),
  ...Object.fromEntries(NPC_MISSION_SHEETS.map(([crewId, slug]) => {
    const id = `npc.${slug}.mission`;
    return [id, sheet(id, `squad-mission:${crewId}`, `/assets/openai/sprites/normalized/npcs/${slug}-mission-sheet.png`, `npc-${slug}-mission-v55`, 'humanoid-feet', 'npc-standing', 104, 148, 'npc')];
  }))
});

export const CREW_SPRITE_IDS = Object.freeze(Object.fromEntries(NPC_SHEETS.map(([crewId, slug]) => [crewId, `npc.${slug}.locomotion`])));
export const CREW_MISSION_SPRITE_IDS = Object.freeze(Object.fromEntries(NPC_MISSION_SHEETS.map(([crewId, slug]) => [crewId, `npc.${slug}.mission`])));

const sheetByImageKey = new Map(Object.values(SPRITE_SHEETS).map((entry) => [entry.imageKey, entry]));
const clipBySet = new Map(Object.entries(SPRITE_CLIP_SETS).map(([id, clips]) => [id, new Map(clips.map((clip) => [clip.id, clip]))]));

export function resolveSpriteSheet(idOrImageKey) {
  return SPRITE_SHEETS[idOrImageKey] || sheetByImageKey.get(idOrImageKey) || null;
}

export function resolveSpriteClip(sheetId, clipId) {
  const resolvedSheet = resolveSpriteSheet(sheetId);
  return resolvedSheet ? clipBySet.get(resolvedSheet.clipSet)?.get(clipId) || null : null;
}

export function shouldFlipSprite(sheetOrId, actorFacing = 1) {
  const resolvedSheet = typeof sheetOrId === 'string' ? resolveSpriteSheet(sheetOrId) : sheetOrId;
  const sourceFacing = Number(resolvedSheet?.sourceFacing) < 0 ? -1 : 1;
  const targetFacing = Number(actorFacing) < 0 ? -1 : 1;
  return sourceFacing !== targetFacing;
}

const PLAYER_COMBAT_FALLBACKS = Object.freeze({
  'primary-fire': 'idle',
  reload: 'idle',
  'hurt-death': 'jump-fall'
});

export function resolveVerifiedPlayerCombat(clipId) {
  const combatSheet = resolveSpriteSheet('player.echo9-marine.combat');
  if (combatSheet?.identityVerified) return { sheetId: combatSheet.id, clipId };
  return {
    sheetId: 'player.echo9-marine.locomotion',
    clipId: PLAYER_COMBAT_FALLBACKS[clipId] || 'idle',
    degraded: 'combat-identity-unverified'
  };
}

export function resolvePlayerAnimation(actor = {}, neuroActive = false) {
  if (neuroActive && actor.visualForm === 'xenomorph') {
    if (!actor.alive) return { sheetId: 'enemy.xenomorph-drone.combat', clipId: 'hurt-death' };
    if ((actor.v52HurtClock || 0) > 0) return { sheetId: 'enemy.xenomorph-drone.combat', clipId: 'hurt-death' };
    if ((actor.v52FireClock || 0) > 0) return { sheetId: 'enemy.xenomorph-drone.combat', clipId: 'claw-attack' };
    if (!actor.grounded) return { sheetId: 'enemy.xenomorph-drone.locomotion', clipId: 'leap' };
    if (actor.crouching) return { sheetId: 'enemy.xenomorph-drone.locomotion', clipId: 'crawl' };
    if (Math.abs(actor.vx || 0) > 12) return { sheetId: 'enemy.xenomorph-drone.locomotion', clipId: 'stalk-run' };
    return { sheetId: 'enemy.xenomorph-drone.locomotion', clipId: 'idle' };
  }
  if (!actor.alive) return resolveVerifiedPlayerCombat('hurt-death');
  if ((actor.v52HurtClock || 0) > 0) return resolveVerifiedPlayerCombat('hurt-death');
  if (actor.reloading) return resolveVerifiedPlayerCombat('reload');
  if ((actor.v52FireClock || 0) > 0) return resolveVerifiedPlayerCombat('primary-fire');
  if (actor.climbing) return { sheetId: 'player.echo9-marine.locomotion', clipId: 'climb' };
  if (actor.crouching) return { sheetId: 'player.echo9-marine.locomotion', clipId: 'crouch' };
  if (!actor.grounded) return { sheetId: 'player.echo9-marine.locomotion', clipId: 'jump-fall' };
  if (Math.abs(actor.vx || 0) > 12) return { sheetId: 'player.echo9-marine.locomotion', clipId: 'walk-run' };
  return { sheetId: 'player.echo9-marine.locomotion', clipId: 'idle' };
}

export function resolveNpcAnimation(actor = {}) {
  const dedicatedV55 = resolveNpcMissionAnimationV55(actor);
  if (dedicatedV55) return { sheetId: dedicatedV55.sheetId, clipId: dedicatedV55.clipId };
  const sheetId = CREW_SPRITE_IDS[actor.crewId];
  if (!sheetId) return null;
  if (!actor.alive || actor.alertClock > 0 || actor.downed) return { sheetId, clipId: 'alert-reaction' };
  if (actor.workClock > 0 || actor.fireClock > 0 || actor.supportClock > 0) return { sheetId, clipId: 'role-work' };
  if (Math.abs(actor.vx || 0) > 8 || actor.climbing) return { sheetId, clipId: 'walk' };
  return { sheetId, clipId: 'idle' };
}

export function resolveEnemyAnimation(enemy = {}) {
  const hurt = (enemy.v52HurtClock || 0) > 0;
  const dead = !enemy.alive;
  const attacking = Boolean(enemy.attacking);
  const moving = Math.abs(enemy.vx || 0) > 8 || Boolean(enemy.alert);
  const v54ActionClip = dead || hurt ? 'death' : attacking ? 'attack' : moving ? 'chase' : 'idle';
  if (enemy.spriteKey === 'ovomorph') return { sheetId: 'enemy.ovomorph.cycle', clipId: dead || hurt ? 'destroyed' : attacking ? 'hatch' : moving ? 'opening' : 'sealed' };
  const v55Enemies = {
    xenoPraetorian: 'enemy.xenomorph-praetorian.action',
    xenoSpitter: 'enemy.xenomorph-spitter.action',
    chestburster: 'enemy.chestburster.action',
    xenoCrusher: 'enemy.xenomorph-crusher.action',
    xenoLurker: 'enemy.xenomorph-lurker.action',
    xenoCarrier: 'enemy.xenomorph-carrier.action',
    xenoRavager: 'enemy.xenomorph-ravager.action'
  };
  if (v55Enemies[enemy.spriteKey]) return { sheetId: v55Enemies[enemy.spriteKey], clipId: v54ActionClip };
  if (enemy.spriteKey === 'pathogenMimic') return { sheetId: 'enemy.pathogen-mimic.action', clipId: v54ActionClip };
  if (enemy.spriteKey === 'paleCrucibleHunter') return { sheetId: 'enemy.pale-crucible-hunter.action', clipId: v54ActionClip };
  if (enemy.spriteKey === 'ripperQueen') return { sheetId: 'enemy.ripper-queen.action', clipId: dead || hurt ? 'wounded-death' : attacking ? 'claw-tail' : moving ? 'royal-advance' : 'threat-idle' };
  if (enemy.spriteKey === 'xenoQueen') return { sheetId: 'enemy.xenomorph-queen.combat', clipId: dead || hurt ? 'roar-hurt' : attacking ? 'claw-tail' : moving ? 'advance' : 'idle' };
  if (enemy.spriteKey === 'xenoRunner') return { sheetId: 'enemy.xenomorph-runner.action', clipId: dead || hurt ? 'hurt-death' : attacking ? 'pounce-bite' : moving ? 'sprint' : 'idle-prowl' };
  if (enemy.spriteKey === 'facehugger') return { sheetId: 'enemy.facehugger.locomotion', clipId: dead || hurt ? 'hurt-death' : attacking ? 'leap-attach' : moving ? 'scuttle' : 'idle' };
  if (enemy.spriteKey === 'neomorph') return { sheetId: 'enemy.neomorph.locomotion', clipId: dead || hurt ? 'hurt-death' : attacking ? 'leap' : moving ? 'run' : 'idle' };
  if (enemy.spriteKey === 'workingJoe') return { sheetId: 'enemy.working-joe.combat', clipId: dead ? 'damaged-death' : hurt ? 'hurt' : attacking ? 'grab-punch' : 'idle-walk' };
  if (enemy.spriteKey === 'xenoWarrior') {
    if (dead || hurt || attacking) return { sheetId: 'enemy.xenomorph-warrior.combat', clipId: dead || hurt ? 'hurt-death' : 'tail-attack' };
    return { sheetId: 'enemy.xenomorph-drone.locomotion', clipId: moving ? 'stalk-run' : 'idle' };
  }
  if (enemy.spriteKey === 'xenoDrone') {
    if (dead || hurt || attacking) return { sheetId: 'enemy.xenomorph-drone.combat', clipId: dead || hurt ? 'hurt-death' : 'claw-attack' };
    return { sheetId: 'enemy.xenomorph-drone.locomotion', clipId: moving ? 'stalk-run' : 'idle' };
  }
  return null;
}

const VEHICLE_SPRITE_FITS_V55 = Object.freeze(['Standard', 'Recon', 'Assault', 'Rescue', 'Colonial', 'Frontier', 'Prototype', 'Apex']);
const VEHICLE_SPRITE_IDENTITIES_V55 = Object.freeze([
  Object.freeze({ baseNumber: 2, slug: 'm577-command-apc', name: 'M577 Command APC', sheetId: 'vehicle.m577-command-apc.action' }),
  Object.freeze({ baseNumber: 4, slug: 'm22a3-jackson-tank', name: 'M22A3 Jackson Tank', sheetId: 'vehicle.m22a3-jackson-tank.action' }),
  Object.freeze({ baseNumber: 7, slug: 'p-5000-powered-work-loader', name: 'P-5000 Powered Work Loader', sheetId: 'vehicle.p5000-powered-work-loader.action' }),
  Object.freeze({ baseNumber: 9, slug: 'ud-4l-cheyenne-dropship', name: 'UD-4L Cheyenne Dropship', sheetId: 'vehicle.ud4l-cheyenne-dropship.action' })
]);
const VEHICLE_STANDARD_M577_ID = 'vehicle-001-m577-armored-personnel-carrier';
const VEHICLE_STANDARD_M577_NAME = 'M577 Armored Personnel Carrier';
const vehicleFitSlug = (value) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-');
const vehicleSpriteById = new Map([[VEHICLE_STANDARD_M577_ID, 'vehicle.m577-apc.action']]);
const vehicleSpriteByName = new Map([[VEHICLE_STANDARD_M577_NAME, 'vehicle.m577-apc.action']]);

for (const identity of VEHICLE_SPRITE_IDENTITIES_V55) {
  VEHICLE_SPRITE_FITS_V55.forEach((fit, fitIndex) => {
    const number = identity.baseNumber + fitIndex * 36;
    const suffix = fitIndex === 0 ? '' : `-${vehicleFitSlug(fit)}`;
    const name = fitIndex === 0 ? identity.name : `${identity.name} — ${fit}`;
    vehicleSpriteById.set(`vehicle-${String(number).padStart(3, '0')}-${identity.slug}${suffix}`, identity.sheetId);
    vehicleSpriteByName.set(name, identity.sheetId);
  });
}

function resolveExactVehicleSpriteSheet(vehicle = {}) {
  const id = typeof vehicle.id === 'string' ? vehicle.id.trim() : '';
  if (id) return vehicleSpriteById.get(id) || null;
  const name = typeof vehicle.name === 'string' ? vehicle.name.trim() : '';
  if (!name) return null;
  if (name === VEHICLE_STANDARD_M577_NAME && vehicle.fit && vehicle.fit !== 'Standard') return null;
  return vehicleSpriteByName.get(name) || null;
}

export function resolveVehicleAnimation(vehicle = {}) {
  const sheetId = resolveExactVehicleSpriteSheet(vehicle);
  if (!sheetId) return null;
  const damaged = vehicle.destroyed || (vehicle.v52HurtClock || 0) > 0 || (vehicle.maxHull > 0 && vehicle.hull < vehicle.maxHull * 0.28);
  const launching = vehicle.launching === true;
  const acting = (vehicle.v52TurretClock || 0) > 0
    || (vehicle.actionClock || 0) > 0
    || vehicle.firing === true
    || vehicle.attacking === true
    || vehicle.sensorDeploying === true;
  const moving = vehicle.moving === true || Math.abs(vehicle.vx || 0) > 8 || Math.abs(vehicle.vy || 0) > 8;

  if (sheetId === 'vehicle.m577-command-apc.action') return {
    sheetId,
    clipId: damaged ? 'damage' : acting || launching ? 'command-action' : moving ? 'roll' : 'command-idle'
  };
  if (sheetId === 'vehicle.m22a3-jackson-tank.action') return {
    sheetId,
    clipId: damaged ? 'damage' : acting || launching ? 'cannon' : moving ? 'roll' : 'idle'
  };
  if (sheetId === 'vehicle.p5000-powered-work-loader.action') return {
    sheetId,
    clipId: damaged ? 'damage' : acting || launching ? 'work' : moving ? 'walk' : 'idle'
  };
  if (sheetId === 'vehicle.ud4l-cheyenne-dropship.action') return {
    sheetId,
    clipId: damaged ? 'damage' : launching ? 'launch' : acting || moving ? 'flight' : 'hangar'
  };
  if (damaged) return { sheetId, clipId: 'damage' };
  if (acting || launching) return { sheetId, clipId: 'turret' };
  if (moving) return { sheetId, clipId: 'roll' };
  return { sheetId, clipId: 'idle' };
}

export class SpriteAnimationController {
  constructor({ onEvent = () => {} } = {}) {
    this.onEvent = onEvent;
    this.states = new Map();
  }

  reset(entityId) {
    if (entityId === undefined) this.states.clear();
    else this.states.delete(String(entityId));
  }

  sample(entityId, request, timeSeconds, { emit = true, reducedMotion = false } = {}) {
    const sheetEntry = resolveSpriteSheet(request?.sheetId);
    const clip = sheetEntry && resolveSpriteClip(sheetEntry.id, request?.clipId);
    if (!sheetEntry || !clip) return null;
    const key = String(entityId);
    const signature = `${sheetEntry.id}:${clip.id}`;
    let state = this.states.get(key);
    const now = Math.max(0, Number(timeSeconds) || 0);
    if (!state || state.signature !== signature || now < state.startedAt) {
      state = { signature, startedAt: now, lastStep: -1, loops: 0 };
      this.states.set(key, state);
    }
    const elapsed = Math.max(0, now - state.startedAt);
    const effectiveFps = reducedMotion && clip.loop ? Math.min(1, clip.fps) : clip.fps;
    const rawStep = Math.floor(elapsed * effectiveFps);
    const lastIndex = clip.frames.length - 1;
    const step = clip.loop ? rawStep : Math.min(rawStep, lastIndex);
    const localIndex = clip.loop ? step % clip.frames.length : step;
    const frame = clip.frames[localIndex];
    const events = [];
    if (emit && step > state.lastStep) {
      const maximumSteps = Math.min(step, state.lastStep + 64);
      for (let absoluteStep = state.lastStep + 1; absoluteStep <= maximumSteps; absoluteStep += 1) {
        const eventIndex = clip.loop ? ((absoluteStep % clip.frames.length) + clip.frames.length) % clip.frames.length : Math.min(absoluteStep, lastIndex);
        const eventFrame = clip.frames[eventIndex];
        if (!clip.loop && absoluteStep > lastIndex) continue;
        for (const event of clip.events) if (event.frame === eventFrame) {
          const payload = Object.freeze({ entityId: key, sheetId: sheetEntry.id, clipId: clip.id, frame: eventFrame, event: event.type, loop: Math.floor(Math.max(0, absoluteStep) / clip.frames.length) });
          events.push(payload);
          this.onEvent(payload);
        }
      }
    }
    state.lastStep = Math.max(state.lastStep, step);
    state.loops = clip.loop ? Math.floor(step / clip.frames.length) : 0;
    return Object.freeze({
      entityId: key,
      sheet: sheetEntry,
      clip,
      frame,
      column: frame % SPRITE_GRID.columns,
      row: Math.floor(frame / SPRITE_GRID.columns),
      complete: !clip.loop && rawStep >= lastIndex,
      elapsed,
      events: Object.freeze(events)
    });
  }

  snapshot() {
    return [...this.states.entries()].map(([entityId, state]) => Object.freeze({ entityId, signature: state.signature, lastStep: state.lastStep, loops: state.loops }));
  }
}

export function spriteRuntimeReport() {
  const sheets = Object.values(SPRITE_SHEETS);
  const invalid = sheets.flatMap((entry) => {
    const clips = SPRITE_CLIP_SETS[entry.clipSet];
    const pivot = SPRITE_PIVOTS[entry.pivot];
    const hitbox = SPRITE_HITBOXES[entry.hitbox];
    return clips?.length && pivot && hitbox ? [] : [entry.id];
  });
  return Object.freeze({
    schema: 1,
    grid: SPRITE_GRID,
    sheets: sheets.length,
    runtimeReady: sheets.filter((entry) => entry.releaseReady).length,
    families: Object.freeze([...new Set(sheets.map((entry) => entry.family))]),
    clipSets: Object.keys(SPRITE_CLIP_SETS).length,
    invalid: Object.freeze(invalid)
  });
}
