import { resolveVehicleVisualAnimationV56 } from './vehicle-visual-overrides-v56.js';
import {
  NPC_MISSION_CLIP_SETS_V56,
  resolveNpcMissionAnimationV55
} from './npc-mission-runtime-v55.js';
import { WEAPON_VISUAL_PROFILES_ALL_V63 } from './weapon-visual-runtime-v63.js';
import {
  EQUIPMENT_SHEET_GRID_V56,
  EQUIPMENT_VISUAL_PROFILES_V56
} from './equipment-visual-runtime-v56.js';
import { resolveVehicleAccessAnimationV59 } from './vehicle-access-runtime-v59.js';
import { V65_ENEMY_PROFILE_SPRITE_SHEETS } from './enemy-profile-registry-v65.js';
import { V66_ENEMY_PROFILE_SPRITE_SHEETS } from './enemy-profile-registry-v66.js';
import { getEnemyBatchAttackFrameV66 } from './enemy-batch-combat-v66.js';
import { getOvomorphAnimationV66 } from './enemy-ovomorph-cycle-v66.js';
import { buildEnemyBodyHitboxesV66 } from './enemy-profile-geometry-v66.js';

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
  'weapon-grip': Object.freeze({ kind: 'grip', x: 96, y: 144 }),
  'equipment-center': Object.freeze({ kind: 'center', x: 128, y: 128 })
});

export const SPRITE_HITBOXES = Object.freeze({
  ...buildEnemyBodyHitboxesV66(),
  'player-standing': Object.freeze({ x: 84, y: 34, width: 88, height: 206 }),
  'npc-standing': Object.freeze({ x: 88, y: 34, width: 80, height: 206 }),
  'xenomorph-standing': Object.freeze({ x: 50, y: 56, width: 156, height: 184 }),
  'runner-ground': Object.freeze({ x: 28, y: 134, width: 200, height: 106 }),
  'pathogen-mimic-large': Object.freeze({ x: 24, y: 52, width: 208, height: 188 }),
  'pale-crucible-hunter-large': Object.freeze({ x: 32, y: 42, width: 192, height: 198 }),
  'queen-standing': Object.freeze({ x: 32, y: 38, width: 192, height: 202 }),
  'newborn-tall': Object.freeze({ x: 72, y: 24, width: 112, height: 216 }),
  'offspring-tall': Object.freeze({ x: 78, y: 16, width: 100, height: 224 }),
  'predalien-large': Object.freeze({ x: 38, y: 40, width: 180, height: 200 }),
  'facehugger-ground': Object.freeze({ x: 38, y: 142, width: 180, height: 98 }),
  'apc-hull': Object.freeze({ x: 18, y: 106, width: 220, height: 134 }),
  'weapon-pickup': Object.freeze({ x: 18, y: 94, width: 220, height: 96 }),
  'equipment-pickup': Object.freeze({ x: 34, y: 34, width: 188, height: 188 }),
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
  'ud4l-dropship-hull': Object.freeze({ x: 18, y: 112, width: 220, height: 128 }),
  'm40-ridgeway-hull': Object.freeze({ x: 12, y: 98, width: 232, height: 142 }),
  'ud4b-dropship-hull': Object.freeze({ x: 8, y: 98, width: 240, height: 142 }),
  'narcissus-lifeboat-hull': Object.freeze({ x: 12, y: 104, width: 232, height: 130 }),
  'lander-one-hull': Object.freeze({ x: 8, y: 88, width: 240, height: 152 }),
  'rt01-transport-hull': Object.freeze({ x: 10, y: 112, width: 236, height: 128 }),
  'nr9-euv01-hull': Object.freeze({ x: 18, y: 90, width: 220, height: 150 }),
  'daihotai-tractor-hull': Object.freeze({ x: 18, y: 80, width: 220, height: 160 }),
  'eva7c-pressure-pod-hull': Object.freeze({ x: 24, y: 60, width: 208, height: 180 }),
  'trilobite-sprawl': Object.freeze({ x: 20, y: 126, width: 216, height: 114 }),
  'boar-ground': Object.freeze({ x: 24, y: 140, width: 208, height: 100 }),
  'combat-power-loader-frame': Object.freeze({ x: 60, y: 36, width: 136, height: 204 }),
  'ua571-carrier-hull': Object.freeze({ x: 18, y: 120, width: 220, height: 120 }),
  'seegson-tram-hull': Object.freeze({ x: 10, y: 112, width: 236, height: 128 }),
  'crucible-crawler-hull': Object.freeze({ x: 8, y: 104, width: 240, height: 136 }),
  'assault-gunship-hull': Object.freeze({ x: 10, y: 112, width: 236, height: 128 }),
  'orbital-lifeboat-hull': Object.freeze({ x: 12, y: 116, width: 232, height: 124 }),
  'cargo-lifter-hull': Object.freeze({ x: 14, y: 118, width: 228, height: 122 }),
  'executive-shuttle-hull': Object.freeze({ x: 10, y: 108, width: 236, height: 132 }),
  'upp-aerodyne-hull': Object.freeze({ x: 10, y: 116, width: 236, height: 124 }),
  'hyperdyne-carrier-hull': Object.freeze({ x: 12, y: 116, width: 232, height: 124 }),
  'processor-elevator-cage': Object.freeze({ x: 30, y: 18, width: 196, height: 222 }),
  'maglev-car-hull': Object.freeze({ x: 8, y: 152, width: 240, height: 88 }),
  'ripper-siege-loader-frame': Object.freeze({ x: 48, y: 34, width: 160, height: 206 }),
  'neuro-xeno-ground': Object.freeze({ x: 20, y: 126, width: 216, height: 114 }),
  'atarax-ripper-ground': Object.freeze({ x: 24, y: 116, width: 216, height: 124 }),
  'korari-stalker-ground': Object.freeze({ x: 20, y: 144, width: 216, height: 96 }),
  'ceto-reef-predator-water': Object.freeze({ x: 16, y: 150, width: 224, height: 90 }),
  'tantalus-tunnel-vermin-ground': Object.freeze({ x: 16, y: 156, width: 224, height: 84 }),
  'ceto-patrol-boat-hull': Object.freeze({ x: 8, y: 110, width: 240, height: 130 }),
  'tantalus-command-skiff-hull': Object.freeze({ x: 10, y: 118, width: 236, height: 122 }),
  'echo9-recon-bike-frame': Object.freeze({ x: 36, y: 78, width: 184, height: 162 }),
  'neuro-xeno-transport-rig-hull': Object.freeze({ x: 12, y: 90, width: 232, height: 150 }),
  'mining-bore-crawler-hull': Object.freeze({ x: 8, y: 120, width: 240, height: 120 }),
  'ice-driller-hull': Object.freeze({ x: 8, y: 116, width: 240, height: 124 }),
  'reef-hydrofoil-hull': Object.freeze({ x: 8, y: 128, width: 240, height: 112 }),
});

export const SPRITE_CLIP_SETS = Object.freeze({
  'enemy-action-v66': freezeList([
    { id: 'idle', frames: [0, 1, 2, 3, 4, 5, 6, 7], fps: 6, loop: true },
    { id: 'move', frames: [8, 9, 10, 11, 12, 13, 14, 15], fps: 12, loop: true },
    { id: 'attack', frames: [16, 17, 18, 19, 20, 21, 22, 23], fps: 12, loop: false },
    { id: 'death', frames: [24, 25, 26, 27, 28, 29, 30, 31], fps: 10, loop: false }
  ]),
  'ovomorph-cycle-v66': freezeList([
    { id: 'sealed', frames: [0, 1, 2, 3, 4, 5, 6, 7], fps: 6, loop: true },
    { id: 'opening', frames: [8, 9, 10, 11, 12, 13, 14, 15], fps: 8, loop: false },
    { id: 'hatch', frames: [16, 17, 18, 19, 20, 21, 22, 23], fps: 10, loop: false },
    { id: 'destroyed', frames: [24, 25, 26, 27, 28, 29, 30, 31], fps: 10, loop: false }
  ]),
  ...Object.fromEntries(Object.entries(NPC_MISSION_CLIP_SETS_V56).map(([id, clips]) => [
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
  'player-melee-v56': freezeList([
    { id: 'knife-ready', frames: [0, 1, 2, 3], fps: 6, loop: true, events: [{ frame: 1, type: 'combat:melee-ready' }] },
    { id: 'knife-attack', frames: [4, 5, 6, 7], fps: 12, loop: false, events: [{ frame: 6, type: 'combat:knife-hit' }] },
    { id: 'rifle-bash', frames: [8, 9, 10, 11], fps: 11, loop: false, events: [{ frame: 10, type: 'combat:rifle-bash-hit' }] },
    { id: 'melee-defense', frames: [12, 13, 14, 15], fps: 8, loop: false, events: [{ frame: 13, type: 'combat:deflect-window' }] }
  ]),
  'player-interaction-v56': freezeList([
    { id: 'control-use', frames: [0, 1, 2, 3], fps: 7, loop: false, events: [{ frame: 2, type: 'interaction:control' }] },
    { id: 'lift-carry', frames: [4, 5, 6, 7], fps: 7, loop: true, events: [{ frame: 6, type: 'interaction:carry' }] },
    { id: 'ground-interact', frames: [8, 9, 10, 11], fps: 8, loop: false, events: [{ frame: 10, type: 'interaction:pickup' }] },
    { id: 'force-interact', frames: [12, 13, 14, 15], fps: 9, loop: false, events: [{ frame: 14, type: 'interaction:force' }] }
  ]),
  'player-tool-use-v56': freezeList([
    { id: 'motion-tracker', frames: [0, 1, 2, 3], fps: 7, loop: false, events: [{ frame: 2, type: 'tool:tracker-pulse' }] },
    { id: 'cutting-torch', frames: [4, 5, 6, 7], fps: 9, loop: true, events: [{ frame: 6, type: 'tool:cutting-spark' }] },
    { id: 'access-tuner', frames: [8, 9, 10, 11], fps: 8, loop: false, events: [{ frame: 10, type: 'tool:access-confirm' }] },
    { id: 'maintenance-jack', frames: [12, 13, 14, 15], fps: 9, loop: false, events: [{ frame: 14, type: 'tool:jack-impact' }] }
  ]),
  'enemy-action-v56': freezeList([
    { id: 'idle', frames: [0, 1, 2, 3], fps: 4, loop: true, events: [{ frame: 2, type: 'creature:breathe' }] },
    { id: 'chase', frames: [4, 5, 6, 7], fps: 10, loop: true, events: [{ frame: 4, type: 'audio:step-right' }, { frame: 6, type: 'audio:step-left' }] },
    { id: 'attack', frames: [8, 9, 10, 11], fps: 10, loop: false, events: [{ frame: 10, type: 'combat:attack-hit' }] },
    { id: 'death', frames: [12, 13, 14, 15], fps: 7, loop: false, events: [{ frame: 12, type: 'state:hurt' }, { frame: 15, type: 'state:death-lock' }] }
  ]),
  'facehugger-action-v65': freezeList([
    { id: 'idle', frames: [0, 1, 2, 3, 4, 5, 6, 7], fps: 6, loop: true, events: [{ frame: 3, type: 'creature:twitch' }] },
    { id: 'chase', frames: [8, 9, 10, 11, 12, 13, 14, 15], fps: 12, loop: true, events: [{ frame: 9, type: 'audio:scuttle' }, { frame: 13, type: 'audio:scuttle' }] },
    { id: 'attack', frames: [16, 17, 18, 19, 20, 21, 22, 23], fps: 12, loop: false, events: [{ frame: 18, type: 'movement:takeoff' }, { frame: 21, type: 'combat:attach-window' }] },
    { id: 'death', frames: [24, 25, 26, 27, 28, 29, 30, 31], fps: 10, loop: false, events: [{ frame: 31, type: 'state:death-lock' }] }
  ]),
  'newborn-action-v64': freezeList([
    { id: 'idle', frames: [0, 1, 2, 3], fps: 4, loop: true, events: [{ frame: 2, type: 'newborn:breath' }] },
    { id: 'chase', frames: [4, 5, 6, 7], fps: 9, loop: true, events: [{ frame: 4, type: 'audio:step-right' }, { frame: 6, type: 'audio:step-left' }] },
    { id: 'attack', frames: [8, 9, 10, 11], fps: 9, loop: false, events: [{ frame: 10, type: 'combat:grapple-hit' }] },
    { id: 'death', frames: [12, 13, 14, 15], fps: 6, loop: false, events: [{ frame: 12, type: 'state:hurt' }, { frame: 15, type: 'state:death-lock' }] }
  ]),
  'offspring-action-v64': freezeList([
    { id: 'idle', frames: [0, 1, 2, 3], fps: 4, loop: true, events: [{ frame: 2, type: 'offspring:tremor' }] },
    { id: 'chase', frames: [4, 5, 6, 7], fps: 10, loop: true, events: [{ frame: 4, type: 'audio:step-right' }, { frame: 6, type: 'audio:step-left' }] },
    { id: 'attack', frames: [8, 9, 10, 11], fps: 10, loop: false, events: [{ frame: 10, type: 'combat:reach-hit' }] },
    { id: 'death', frames: [12, 13, 14, 15], fps: 6, loop: false, events: [{ frame: 12, type: 'state:hurt' }, { frame: 15, type: 'state:death-lock' }] }
  ]),
  'predalien-action-v64': freezeList([
    { id: 'idle', frames: [0, 1, 2, 3], fps: 4, loop: true, events: [{ frame: 2, type: 'predalien:mandible-threat' }] },
    { id: 'chase', frames: [4, 5, 6, 7], fps: 9, loop: true, events: [{ frame: 4, type: 'audio:heavy-step-right' }, { frame: 6, type: 'audio:heavy-step-left' }] },
    { id: 'attack', frames: [8, 9, 10, 11], fps: 10, loop: false, events: [{ frame: 9, type: 'combat:mandible-window' }, { frame: 10, type: 'combat:tail-hit' }] },
    { id: 'death', frames: [12, 13, 14, 15], fps: 6, loop: false, events: [{ frame: 12, type: 'state:hurt' }, { frame: 15, type: 'state:death-lock' }] }
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
  'vehicle-action-v56': freezeList([
    { id: 'idle', frames: [0, 1, 2, 3], fps: 3, loop: true, events: [{ frame: 2, type: 'vehicle:systems-idle' }] },
    { id: 'move', frames: [4, 5, 6, 7], fps: 8, loop: true, events: [{ frame: 6, type: 'vehicle:propulsion-cycle' }] },
    { id: 'action', frames: [8, 9, 10, 11], fps: 8, loop: false, events: [{ frame: 10, type: 'vehicle:primary-action' }] },
    { id: 'damage', frames: [12, 13, 14, 15], fps: 6, loop: false, events: [{ frame: 12, type: 'state:hurt' }, { frame: 15, type: 'vehicle:wreck-lock' }] }
  ]),
  'vehicle-access-damage-v59': freezeList([
    { id: 'access-open', frames: [0, 1, 2, 3], fps: 7, loop: false, events: [{ frame: 1, type: 'vehicle:access-unlock' }, { frame: 3, type: 'vehicle:access-open' }] },
    { id: 'secure-occupied', frames: [4, 5, 6, 7], fps: 7, loop: false, events: [{ frame: 5, type: 'vehicle:occupant-secure' }, { frame: 7, type: 'vehicle:access-sealed' }] },
    { id: 'exit-close', frames: [8, 9, 10, 11], fps: 7, loop: false, events: [{ frame: 8, type: 'vehicle:access-release' }, { frame: 11, type: 'vehicle:access-closed' }] },
    { id: 'critical-wreck', frames: [12, 13, 14, 15], fps: 5, loop: false, events: [{ frame: 12, type: 'vehicle:critical' }, { frame: 15, type: 'vehicle:wreck-lock' }] }
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
  'equipment-use-v56': freezeList([
    { id: 'packed', frames: [0], fps: 1, loop: true },
    { id: 'ready', frames: [1], fps: 1, loop: true },
    { id: 'use', frames: [2], fps: 1, loop: false, events: [{ frame: 2, type: 'equipment:use' }] },
    { id: 'spent', frames: [3], fps: 1, loop: false, events: [{ frame: 3, type: 'equipment:spent' }] }
  ]),
  'weapon-action-v56': freezeList([
    { id: 'idle', frames: [0, 1, 2, 3], fps: 4, loop: true, events: [{ frame: 2, type: 'weapon:idle' }] },
    { id: 'action', frames: [4, 5, 6, 7], fps: 11, loop: false, events: [{ frame: 6, type: 'weapon:action' }] },
    { id: 'reload', frames: [8, 9, 10, 11], fps: 8, loop: false, events: [{ frame: 10, type: 'weapon:reload' }] },
    { id: 'service', frames: [12, 13, 14, 15], fps: 7, loop: false, events: [{ frame: 15, type: 'weapon:service-complete' }] }
  ]),
  'rifle-action': freezeList([
    { id: 'idle', frames: [0, 1, 2, 3], fps: 4, loop: true, events: [{ frame: 2, type: 'weapon:idle' }] },
    { id: 'recoil', frames: [4, 5, 6, 7], fps: 13, loop: false, events: [{ frame: 5, type: 'weapon:shot' }, { frame: 6, type: 'weapon:recoil' }] },
    { id: 'reload', frames: [8, 9, 10, 11], fps: 9, loop: false, events: [{ frame: 9, type: 'weapon:magazine-out' }, { frame: 10, type: 'weapon:magazine-in' }, { frame: 11, type: 'weapon:chamber' }] },
    { id: 'jam-inspect', frames: [12, 13, 14, 15], fps: 7, loop: false, events: [{ frame: 12, type: 'weapon:jam' }, { frame: 15, type: 'weapon:inspection-complete' }] }
  ])
});

const sheet = (
  id, imageKey, path, clipSet, pivot, hitbox, renderWidth, renderHeight, family,
  sourceFacing = 1, releaseReady = true, identityVerified = true, grid = SPRITE_GRID
) => Object.freeze({
  id, imageKey, path, clipSet, pivot, hitbox, renderWidth, renderHeight, family,
  columns: grid.columns,
  rows: grid.rows,
  cellWidth: grid.cellWidth,
  cellHeight: grid.cellHeight,
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
  ['crew-07-sanaa-doyle', 'sanaa-doyle'], ['crew-08-maksim-orlov', 'maksim-orlov'],
  ['crew-09-inez-harlow', 'inez-harlow'], ['crew-10-david-8r', 'david-8r'],
  ['crew-11-jun-park', 'jun-park'], ['crew-12-asha-mbaye', 'asha-mbaye'],
  ['crew-13-pablo-reyes', 'pablo-reyes'], ['crew-14-echo-a', 'echo-a'],
  ['crew-15-leila-s-rensen', 'leila-s-rensen'], ['crew-16-cal-mercer', 'cal-mercer']
];

export const SPRITE_SHEETS = Object.freeze({
  'player.echo9-marine.locomotion': sheet('player.echo9-marine.locomotion', 'playerLocomotion', '/assets/openai/sprites/normalized/player/echo9-marine-locomotion-sheet.png', 'player-locomotion', 'humanoid-feet', 'player-standing', 110, 148, 'player'),
  'player.echo9-marine.combat': sheet('player.echo9-marine.combat', 'playerCombat', '/assets/openai/sprites/normalized/player/echo9-marine-combat-sheet.png', 'player-combat', 'humanoid-feet', 'player-standing', 110, 148, 'player'),
  'player.echo9-marine.melee': sheet('player.echo9-marine.melee', 'playerMeleeV56', '/assets/openai/sprites/normalized/player/echo9-marine-melee-sheet.png', 'player-melee-v56', 'humanoid-feet', 'player-standing', 110, 148, 'player'),
  'player.echo9-marine.interaction': sheet('player.echo9-marine.interaction', 'playerInteractionV56', '/assets/openai/sprites/normalized/player/echo9-marine-interaction-sheet.png', 'player-interaction-v56', 'humanoid-feet', 'player-standing', 110, 148, 'player'),
  'player.echo9-marine.tool-use': sheet('player.echo9-marine.tool-use', 'playerToolUseV56', '/assets/openai/sprites/normalized/player/echo9-marine-tool-use-sheet.png', 'player-tool-use-v56', 'humanoid-feet', 'player-standing', 110, 148, 'player'),
  'enemy.xenomorph-big-chap.action.v56': sheet('enemy.xenomorph-big-chap.action.v56', 'xenoBigChapV56', '/assets/openai/sprites/normalized/enemies/xenomorph-big-chap-action-sheet-v56.png', 'enemy-action-v56', 'creature-ground', 'xenomorph-standing', 148, 116, 'enemy'),
  'enemy.xenomorph-warrior.action.v56': sheet('enemy.xenomorph-warrior.action.v56', 'xenoWarriorV56', '/assets/openai/sprites/normalized/enemies/xenomorph-warrior-action-sheet-v56.png', 'enemy-action-v56', 'creature-ground', 'xenomorph-standing', 162, 124, 'enemy'),
  'enemy.xenomorph-queen.action.v56': sheet('enemy.xenomorph-queen.action.v56', 'xenoQueenV56', '/assets/openai/sprites/normalized/enemies/xenomorph-queen-action-sheet-v56.png', 'enemy-action-v56', 'creature-ground', 'queen-standing', 224, 170, 'enemy'),
  'enemy.xenoborg.action.v56': sheet('enemy.xenoborg.action.v56', 'xenoborgV56', '/assets/openai/sprites/normalized/enemies/xenoborg-action-sheet-v56.png', 'enemy-action-v56', 'creature-ground', 'xenomorph-standing', 164, 136, 'enemy'),
  'enemy.weyland-yutani-commando.action.v56': sheet('enemy.weyland-yutani-commando.action.v56', 'weylandYutaniCommandoV56', '/assets/openai/sprites/normalized/enemies/weyland-yutani-commando-action-sheet-v56.png', 'enemy-action-v56', 'humanoid-feet', 'npc-standing', 96, 132, 'enemy'),
  'enemy.seegson-security.action.v56': sheet('enemy.seegson-security.action.v56', 'seegsonSecurityV56', '/assets/openai/sprites/normalized/enemies/seegson-security-action-sheet-v56.png', 'enemy-action-v56', 'humanoid-feet', 'npc-standing', 96, 132, 'enemy'),
  'enemy.xenomorph-boiler.action.v56': sheet('enemy.xenomorph-boiler.action.v56', 'xenoBoilerV56', '/assets/openai/sprites/normalized/enemies/xenomorph-boiler-action-sheet-v56.png', 'enemy-action-v56', 'creature-ground', 'xenomorph-standing', 152, 110, 'enemy'),
  'enemy.xenomorph-prowler.action.v56': sheet('enemy.xenomorph-prowler.action.v56', 'xenoProwlerV56', '/assets/openai/sprites/normalized/enemies/xenomorph-prowler-action-sheet-v56.png', 'enemy-action-v56', 'creature-ground', 'runner-ground', 174, 96, 'enemy'),
  'enemy.xenomorph-burster.action.v56': sheet('enemy.xenomorph-burster.action.v56', 'xenoBursterV56', '/assets/openai/sprites/normalized/enemies/xenomorph-burster-action-sheet-v56.png', 'enemy-action-v56', 'creature-ground', 'runner-ground', 162, 92, 'enemy'),
  'enemy.monica-line.action.v56': sheet('enemy.monica-line.action.v56', 'monicaLineV56', '/assets/openai/sprites/normalized/enemies/monica-line-action-sheet-v56.png', 'enemy-action-v56', 'creature-ground', 'xenomorph-standing', 164, 126, 'enemy'),
  'enemy.specimen-six-line.action.v56': sheet('enemy.specimen-six-line.action.v56', 'specimenSixLineV56', '/assets/openai/sprites/normalized/enemies/specimen-six-line-action-sheet-v56.png', 'enemy-action-v56', 'creature-ground', 'xenomorph-standing', 160, 122, 'enemy'),
  'enemy.dust-runner.action.v56': sheet('enemy.dust-runner.action.v56', 'dustRunnerV56', '/assets/openai/sprites/normalized/enemies/dust-runner-action-sheet-v56.png', 'enemy-action-v56', 'creature-ground', 'runner-ground', 170, 88, 'enemy'),
  'enemy.trilobite-echo.action.v56': sheet('enemy.trilobite-echo.action.v56', 'trilobiteEchoV56', '/assets/openai/sprites/normalized/enemies/trilobite-echo-action-sheet-v56.png', 'enemy-action-v56', 'creature-ground', 'trilobite-sprawl', 184, 104, 'enemy'),
  'enemy.deacon-line.action.v56': sheet('enemy.deacon-line.action.v56', 'deaconLineV56', '/assets/openai/sprites/normalized/enemies/deacon-line-action-sheet-v56.png', 'enemy-action-v56', 'creature-ground', 'xenomorph-standing', 148, 136, 'enemy'),
  'enemy.protomorph.action.v56': sheet('enemy.protomorph.action.v56', 'protomorphV56', '/assets/openai/sprites/normalized/enemies/protomorph-action-sheet-v56.png', 'enemy-action-v56', 'creature-ground', 'xenomorph-standing', 164, 136, 'enemy'),
  'enemy.abomination-pathogen-brute.action.v56': sheet('enemy.abomination-pathogen-brute.action.v56', 'pathogenAbominationV56', '/assets/openai/sprites/normalized/enemies/abomination-pathogen-brute-action-sheet-v56.png', 'enemy-action-v56', 'creature-ground', 'crusher-large', 190, 132, 'enemy'),
  'enemy.upp-vanguard.action.v56': sheet('enemy.upp-vanguard.action.v56', 'uppVanguardV56', '/assets/openai/sprites/normalized/enemies/upp-vanguard-action-sheet-v56.png', 'enemy-action-v56', 'humanoid-feet', 'npc-standing', 98, 134, 'enemy'),
  'enemy.wild-boar-host.action.v56': sheet('enemy.wild-boar-host.action.v56', 'wildBoarHostV56', '/assets/openai/sprites/normalized/enemies/wild-boar-host-action-sheet-v56.png', 'enemy-action-v56', 'creature-ground', 'boar-ground', 158, 88, 'enemy'),
  'enemy.foundry-drone.action.v56': sheet('enemy.foundry-drone.action.v56', 'foundryDroneV56', '/assets/openai/sprites/normalized/enemies/foundry-drone-action-sheet-v56.png', 'enemy-action-v56', 'creature-ground', 'xenomorph-standing', 164, 126, 'enemy'),
  'enemy.foundry-crusher.action.v56': sheet('enemy.foundry-crusher.action.v56', 'foundryCrusherV56', '/assets/openai/sprites/normalized/enemies/foundry-crusher-action-sheet-v56.png', 'enemy-action-v56', 'creature-ground', 'crusher-large', 190, 128, 'enemy'),
  'enemy.reef-stalker.action.v56': sheet('enemy.reef-stalker.action.v56', 'reefStalkerV56', '/assets/openai/sprites/normalized/enemies/reef-stalker-action-sheet-v56.png', 'enemy-action-v56', 'creature-ground', 'lurker-medium', 174, 92, 'enemy'),
  'enemy.reef-spitter.action.v56': sheet('enemy.reef-spitter.action.v56', 'reefSpitterV56', '/assets/openai/sprites/normalized/enemies/reef-spitter-action-sheet-v56.png', 'enemy-action-v56', 'creature-ground', 'spitter-medium', 172, 120, 'enemy'),
  'enemy.siege-royal.action.v56': sheet('enemy.siege-royal.action.v56', 'siegeRoyalV56', '/assets/openai/sprites/normalized/enemies/siege-royal-action-sheet-v56.png', 'enemy-action-v56', 'creature-ground', 'praetorian-large', 180, 142, 'enemy'),
  'enemy.salvage-hive-brute.action.v56': sheet('enemy.salvage-hive-brute.action.v56', 'salvageHiveBruteV56', '/assets/openai/sprites/normalized/enemies/salvage-hive-brute-action-sheet-v56.png', 'enemy-action-v56', 'creature-ground', 'crusher-large', 184, 124, 'enemy'),
  'enemy.arcology-lurker.action.v56': sheet('enemy.arcology-lurker.action.v56', 'arcologyLurkerV56', '/assets/openai/sprites/normalized/enemies/arcology-lurker-action-sheet-v56.png', 'enemy-action-v56', 'creature-ground', 'lurker-medium', 166, 96, 'enemy'),
  'enemy.caravan-stalker.action.v56': sheet('enemy.caravan-stalker.action.v56', 'caravanStalkerV56', '/assets/openai/sprites/normalized/enemies/caravan-stalker-action-sheet-v56.png', 'enemy-action-v56', 'creature-ground', 'runner-ground', 174, 92, 'enemy'),
  'enemy.cult-host.action.v56': sheet('enemy.cult-host.action.v56', 'cultHostV56', '/assets/openai/sprites/normalized/enemies/cult-host-action-sheet-v56.png', 'enemy-action-v56', 'humanoid-feet', 'npc-standing', 98, 140, 'enemy'),
  'enemy.neuro-xeno-drone.action.v56': sheet('enemy.neuro-xeno-drone.action.v56', 'neuroXenoDroneV56', '/assets/openai/sprites/normalized/enemies/neuro-xeno-drone-action-sheet-v56.png', 'enemy-action-v56', 'creature-ground', 'neuro-xeno-ground', 176, 104, 'enemy'),
  'enemy.atarax-ripper.action.v56': sheet('enemy.atarax-ripper.action.v56', 'ataraxRipperV56', '/assets/openai/sprites/normalized/enemies/atarax-ripper-action-sheet-v56.png', 'enemy-action-v56', 'creature-ground', 'atarax-ripper-ground', 184, 112, 'enemy'),
  'enemy.colonial-raider.action.v56': sheet('enemy.colonial-raider.action.v56', 'colonialRaiderV56', '/assets/openai/sprites/normalized/enemies/colonial-raider-action-sheet-v56.png', 'enemy-action-v56', 'humanoid-feet', 'npc-standing', 98, 138, 'enemy'),
  'enemy.atarax-controller.action.v56': sheet('enemy.atarax-controller.action.v56', 'ataraxControllerV56', '/assets/openai/sprites/normalized/enemies/atarax-controller-action-sheet-v56.png', 'enemy-action-v56', 'humanoid-feet', 'npc-standing', 100, 142, 'enemy'),
  'enemy.korari-stalker.action.v56': sheet('enemy.korari-stalker.action.v56', 'korariStalkerV56', '/assets/openai/sprites/normalized/enemies/korari-stalker-action-sheet-v56.png', 'enemy-action-v56', 'creature-ground', 'korari-stalker-ground', 176, 88, 'enemy'),
  'enemy.ceto-reef-predator.action.v56': sheet('enemy.ceto-reef-predator.action.v56', 'cetoReefPredatorV56', '/assets/openai/sprites/normalized/enemies/ceto-reef-predator-action-sheet-v56.png', 'enemy-action-v56', 'creature-ground', 'ceto-reef-predator-water', 186, 82, 'enemy'),
  'enemy.tantalus-tunnel-vermin.action.v56': sheet('enemy.tantalus-tunnel-vermin.action.v56', 'tantalusTunnelVerminV56', '/assets/openai/sprites/normalized/enemies/tantalus-tunnel-vermin-action-sheet-v56.png', 'enemy-action-v56', 'creature-ground', 'tantalus-tunnel-vermin-ground', 180, 76, 'enemy'),
  'enemy.newborn.action.v64': sheet('enemy.newborn.action.v64', 'newbornV64', '/assets/openai/sprites/normalized/enemies/newborn-action-sheet-v64.png', 'newborn-action-v64', 'creature-ground', 'newborn-tall', 150, 184, 'enemy'),
  'enemy.offspring.action.v64': sheet('enemy.offspring.action.v64', 'offspringV64', '/assets/openai/sprites/normalized/enemies/offspring-action-sheet-v64.png', 'offspring-action-v64', 'creature-ground', 'offspring-tall', 144, 190, 'enemy'),
  'enemy.predalien.action.v64': sheet('enemy.predalien.action.v64', 'predalienV64', '/assets/openai/sprites/normalized/enemies/predalien-action-sheet-v64.png', 'predalien-action-v64', 'creature-ground', 'predalien-large', 205, 165, 'enemy'),
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
  ...V65_ENEMY_PROFILE_SPRITE_SHEETS,
  ...V66_ENEMY_PROFILE_SPRITE_SHEETS,
  'vehicle.m577-apc.action': sheet('vehicle.m577-apc.action', 'apc', '/assets/openai/sprites/normalized/vehicles/m577-apc-action-sheet.png', 'apc-action', 'vehicle-ground', 'apc-hull', 250, 140, 'vehicle'),
  'vehicle.m577-command-apc.action': sheet('vehicle.m577-command-apc.action', 'm577Command', '/assets/openai/sprites/normalized/vehicles/m577-command-apc-action-sheet.png', 'm577-command-action-v55', 'vehicle-ground', 'm577-command-hull', 250, 148, 'vehicle'),
  'vehicle.m22a3-jackson-tank.action': sheet('vehicle.m22a3-jackson-tank.action', 'm22a3Jackson', '/assets/openai/sprites/normalized/vehicles/m22a3-jackson-tank-action-sheet.png', 'm22a3-tank-action-v55', 'vehicle-ground', 'm22a3-tank-hull', 292, 150, 'vehicle'),
  'vehicle.p5000-powered-work-loader.action': sheet('vehicle.p5000-powered-work-loader.action', 'p5000Loader', '/assets/openai/sprites/normalized/vehicles/p-5000-powered-work-loader-action-sheet.png', 'p5000-loader-action-v55', 'vehicle-ground', 'p5000-loader-frame', 150, 192, 'vehicle'),
  'vehicle.m577-apc.access-damage': sheet('vehicle.m577-apc.access-damage', 'm577AccessV59', '/assets/openai/sprites/normalized/vehicles/m577-apc-access-damage-sheet.png', 'vehicle-access-damage-v59', 'vehicle-ground', 'apc-hull', 250, 140, 'vehicle'),
  'vehicle.m577-command-apc.access-damage': sheet('vehicle.m577-command-apc.access-damage', 'm577CommandAccessV59', '/assets/openai/sprites/normalized/vehicles/m577-command-apc-access-damage-sheet.png', 'vehicle-access-damage-v59', 'vehicle-ground', 'm577-command-hull', 250, 148, 'vehicle'),
  'vehicle.p5000-powered-work-loader.access-damage': sheet('vehicle.p5000-powered-work-loader.access-damage', 'p5000AccessV59', '/assets/openai/sprites/normalized/vehicles/p-5000-powered-work-loader-access-damage-sheet.png', 'vehicle-access-damage-v59', 'vehicle-ground', 'p5000-loader-frame', 150, 192, 'vehicle'),
  'vehicle.ud4l-cheyenne-dropship.access-damage': sheet('vehicle.ud4l-cheyenne-dropship.access-damage', 'ud4lAccessV59', '/assets/openai/sprites/normalized/vehicles/ud-4l-cheyenne-dropship-access-damage-sheet.png', 'vehicle-access-damage-v59', 'vehicle-ground', 'ud4l-dropship-hull', 320, 154, 'vehicle'),
  'vehicle.ud4l-cheyenne-dropship.action': sheet('vehicle.ud4l-cheyenne-dropship.action', 'ud4lCheyenne', '/assets/openai/sprites/normalized/vehicles/ud-4l-cheyenne-dropship-action-sheet.png', 'ud4l-dropship-action-v55', 'vehicle-ground', 'ud4l-dropship-hull', 320, 154, 'vehicle'),
  'vehicle.m40-ridgeway-heavy-tank.action.v56': sheet('vehicle.m40-ridgeway-heavy-tank.action.v56', 'm40RidgewayV56', '/assets/openai/sprites/normalized/vehicles/m40-ridgeway-heavy-tank-action-sheet.png', 'vehicle-action-v56', 'vehicle-ground', 'm40-ridgeway-hull', 292, 150, 'vehicle'),
  'vehicle.ud4b-cheyenne-dropship.action.v56': sheet('vehicle.ud4b-cheyenne-dropship.action.v56', 'ud4bCheyenneV56', '/assets/openai/sprites/normalized/vehicles/ud-4b-cheyenne-dropship-action-sheet.png', 'vehicle-action-v56', 'vehicle-ground', 'ud4b-dropship-hull', 300, 154, 'vehicle'),
  'vehicle.narcissus-lifeboat.action.v56': sheet('vehicle.narcissus-lifeboat.action.v56', 'narcissusV56', '/assets/openai/sprites/normalized/vehicles/narcissus-lifeboat-action-sheet.png', 'vehicle-action-v56', 'vehicle-ground', 'narcissus-lifeboat-hull', 286, 130, 'vehicle'),
  'vehicle.lander-one-class-e.action.v56': sheet('vehicle.lander-one-class-e.action.v56', 'landerOneV56', '/assets/openai/sprites/normalized/vehicles/lander-one-class-e-action-sheet.png', 'vehicle-action-v56', 'vehicle-ground', 'lander-one-hull', 300, 164, 'vehicle'),
  'vehicle.rt01-group-transport.action.v56': sheet('vehicle.rt01-group-transport.action.v56', 'rt01V56', '/assets/openai/sprites/normalized/vehicles/rt01-group-transport-action-sheet.png', 'vehicle-action-v56', 'vehicle-ground', 'rt01-transport-hull', 286, 142, 'vehicle'),
  'vehicle.nr9-euv01-atv.action.v56': sheet('vehicle.nr9-euv01-atv.action.v56', 'nr9Euv01V56', '/assets/openai/sprites/normalized/vehicles/nr-9-euv01-atv-action-sheet.png', 'vehicle-action-v56', 'vehicle-ground', 'nr9-euv01-hull', 250, 160, 'vehicle'),
  'vehicle.daihotai-tractor.action.v56': sheet('vehicle.daihotai-tractor.action.v56', 'daihotaiV56', '/assets/openai/sprites/normalized/vehicles/daihotai-tractor-action-sheet.png', 'vehicle-action-v56', 'vehicle-ground', 'daihotai-tractor-hull', 270, 176, 'vehicle'),
  'vehicle.eva7c-pressure-pod.action.v56': sheet('vehicle.eva7c-pressure-pod.action.v56', 'eva7cV56', '/assets/openai/sprites/normalized/vehicles/eva-7c-pressure-pod-action-sheet.png', 'vehicle-action-v56', 'vehicle-ground', 'eva7c-pressure-pod-hull', 240, 190, 'vehicle'),
  'vehicle.combat-power-loader.action.v56': sheet('vehicle.combat-power-loader.action.v56', 'combatPowerLoaderV56', '/assets/openai/sprites/normalized/vehicles/combat-power-loader-action-sheet.png', 'vehicle-action-v56', 'vehicle-ground', 'combat-power-loader-frame', 156, 194, 'vehicle'),
  'vehicle.ua571-remote-sentry-carrier.action.v56': sheet('vehicle.ua571-remote-sentry-carrier.action.v56', 'ua571CarrierV56', '/assets/openai/sprites/normalized/vehicles/ua-571-remote-sentry-carrier-action-sheet.png', 'vehicle-action-v56', 'vehicle-ground', 'ua571-carrier-hull', 214, 128, 'vehicle'),
  'vehicle.seegson-maintenance-tram.action.v56': sheet('vehicle.seegson-maintenance-tram.action.v56', 'seegsonTramV56', '/assets/openai/sprites/normalized/vehicles/seegson-maintenance-tram-action-sheet.png', 'vehicle-action-v56', 'vehicle-ground', 'seegson-tram-hull', 268, 142, 'vehicle'),
  'vehicle.crucible-caravan-crawler.action.v56': sheet('vehicle.crucible-caravan-crawler.action.v56', 'crucibleCrawlerV56', '/assets/openai/sprites/normalized/vehicles/crucible-caravan-crawler-action-sheet.png', 'vehicle-action-v56', 'vehicle-ground', 'crucible-crawler-hull', 300, 160, 'vehicle'),
  'vehicle.uscm-assault-gunship.action.v56': sheet('vehicle.uscm-assault-gunship.action.v56', 'uscmAssaultGunshipV56', '/assets/openai/sprites/normalized/vehicles/uscm-assault-gunship-action-sheet.png', 'vehicle-action-v56', 'vehicle-ground', 'assault-gunship-hull', 290, 146, 'vehicle'),
  'vehicle.orbital-lifeboat.action.v56': sheet('vehicle.orbital-lifeboat.action.v56', 'orbitalLifeboatV56', '/assets/openai/sprites/normalized/vehicles/orbital-lifeboat-action-sheet.png', 'vehicle-action-v56', 'vehicle-ground', 'orbital-lifeboat-hull', 280, 136, 'vehicle'),
  'vehicle.colony-cargo-lifter.action.v56': sheet('vehicle.colony-cargo-lifter.action.v56', 'colonyCargoLifterV56', '/assets/openai/sprites/normalized/vehicles/colony-cargo-lifter-action-sheet.png', 'vehicle-action-v56', 'vehicle-ground', 'cargo-lifter-hull', 270, 142, 'vehicle'),
  'vehicle.weyland-yutani-executive-shuttle.action.v56': sheet('vehicle.weyland-yutani-executive-shuttle.action.v56', 'executiveShuttleV56', '/assets/openai/sprites/normalized/vehicles/weyland-yutani-executive-shuttle-action-sheet.png', 'vehicle-action-v56', 'vehicle-ground', 'executive-shuttle-hull', 286, 148, 'vehicle'),
  'vehicle.upp-combat-aerodyne.action.v56': sheet('vehicle.upp-combat-aerodyne.action.v56', 'uppCombatAerodyneV56', '/assets/openai/sprites/normalized/vehicles/upp-combat-aerodyne-action-sheet.png', 'vehicle-action-v56', 'vehicle-ground', 'upp-aerodyne-hull', 286, 134, 'vehicle'),
  'vehicle.hyperdyne-synthetic-carrier.action.v56': sheet('vehicle.hyperdyne-synthetic-carrier.action.v56', 'hyperdyneCarrierV56', '/assets/openai/sprites/normalized/vehicles/hyperdyne-synthetic-carrier-action-sheet.png', 'vehicle-action-v56', 'vehicle-ground', 'hyperdyne-carrier-hull', 280, 130, 'vehicle'),
  'vehicle.atmospheric-processor-elevator.action.v56': sheet('vehicle.atmospheric-processor-elevator.action.v56', 'processorElevatorV56', '/assets/openai/sprites/normalized/vehicles/atmospheric-processor-elevator-action-sheet.png', 'vehicle-action-v56', 'vehicle-ground', 'processor-elevator-cage', 190, 220, 'vehicle'),
  'vehicle.maglev-personnel-car.action.v56': sheet('vehicle.maglev-personnel-car.action.v56', 'maglevPersonnelCarV56', '/assets/openai/sprites/normalized/vehicles/maglev-personnel-car-action-sheet.png', 'vehicle-action-v56', 'vehicle-ground', 'maglev-car-hull', 288, 108, 'vehicle'),
  'vehicle.ripper-siege-loader.action.v56': sheet('vehicle.ripper-siege-loader.action.v56', 'ripperSiegeLoaderV56', '/assets/openai/sprites/normalized/vehicles/ripper-siege-loader-action-sheet.png', 'vehicle-action-v56', 'vehicle-ground', 'ripper-siege-loader-frame', 170, 200, 'vehicle'),
  'weapon.m41a-pulse-rifle.action': sheet('weapon.m41a-pulse-rifle.action', 'rifle', '/assets/openai/sprites/normalized/weapons/m41a-pulse-rifle-action-sheet.png', 'rifle-action', 'weapon-grip', 'weapon-pickup', 126, 72, 'weapon'),
  ...Object.fromEntries(WEAPON_VISUAL_PROFILES_ALL_V63
    .filter((entry) => entry.sheetId !== 'weapon.m41a-pulse-rifle.action')
    .map((entry) => [entry.sheetId, sheet(
      entry.sheetId, entry.imageKey, entry.path, entry.clipSet, entry.pivot, entry.hitbox, entry.width, entry.height, 'weapon'
    )])),
  ...Object.fromEntries(EQUIPMENT_VISUAL_PROFILES_V56
    .filter((entry) => !entry.manifestAlias)
    .map((entry) => [entry.sheetId, sheet(
      entry.sheetId, entry.imageKey, entry.path, entry.clipSet, entry.pivot, entry.hitbox,
      entry.renderWidth, entry.renderHeight, 'equipment', 1, true, entry.identityVerified,
      EQUIPMENT_SHEET_GRID_V56
    )])),
  'vehicle.ceto-patrol-boat.action.v56': sheet('vehicle.ceto-patrol-boat.action.v56', 'cetoPatrolBoatV56', '/assets/openai/sprites/normalized/vehicles/ceto-patrol-boat-action-sheet.png', 'vehicle-action-v56', 'vehicle-ground', 'ceto-patrol-boat-hull', 300, 154, 'vehicle'),
  'vehicle.tantalus-command-skiff.action.v56': sheet('vehicle.tantalus-command-skiff.action.v56', 'tantalusCommandSkiffV56', '/assets/openai/sprites/normalized/vehicles/tantalus-command-skiff-action-sheet.png', 'vehicle-action-v56', 'vehicle-ground', 'tantalus-command-skiff-hull', 286, 142, 'vehicle'),
  'vehicle.echo-9-recon-bike.action.v56': sheet('vehicle.echo-9-recon-bike.action.v56', 'echo9ReconBikeV56', '/assets/openai/sprites/normalized/vehicles/echo-9-recon-bike-action-sheet.png', 'vehicle-action-v56', 'vehicle-ground', 'echo9-recon-bike-frame', 224, 164, 'vehicle'),
  'vehicle.neuro-xeno-transport-rig.action.v56': sheet('vehicle.neuro-xeno-transport-rig.action.v56', 'neuroXenoTransportRigV56', '/assets/openai/sprites/normalized/vehicles/neuro-xeno-transport-rig-action-sheet.png', 'vehicle-action-v56', 'vehicle-ground', 'neuro-xeno-transport-rig-hull', 270, 166, 'vehicle'),
  'vehicle.mining-bore-crawler.action.v56': sheet('vehicle.mining-bore-crawler.action.v56', 'miningBoreCrawlerV56', '/assets/openai/sprites/normalized/vehicles/mining-bore-crawler-action-sheet.png', 'vehicle-action-v56', 'vehicle-ground', 'mining-bore-crawler-hull', 294, 140, 'vehicle'),
  'vehicle.ice-driller.action.v56': sheet('vehicle.ice-driller.action.v56', 'iceDrillerV56', '/assets/openai/sprites/normalized/vehicles/ice-driller-action-sheet.png', 'vehicle-action-v56', 'vehicle-ground', 'ice-driller-hull', 288, 144, 'vehicle'),
  'vehicle.reef-hydrofoil.action.v56': sheet('vehicle.reef-hydrofoil.action.v56', 'reefHydrofoilV56', '/assets/openai/sprites/normalized/vehicles/reef-hydrofoil-action-sheet.png', 'vehicle-action-v56', 'vehicle-ground', 'reef-hydrofoil-hull', 286, 130, 'vehicle'),
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

const NEURO_XENOMORPH_SHEETS = Object.freeze(new Set([
  'enemy.xenomorph-drone.locomotion',
  'enemy.xenomorph-drone.combat'
]));

export function isExplicitXenomorphAnimationEntity(actor = {}, neuroActive = false) {
  if (actor.visualForm !== 'xenomorph') return false;
  return Boolean(
    neuroActive
    || actor.neuroActive === true
    || actor.playerClass === 'neuro-xeno'
    || actor.biology === 'xenomorph'
    || actor.species === 'xenomorph'
  );
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
  if (isExplicitXenomorphAnimationEntity(actor, neuroActive)) {
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
  if ((actor.meleeClock || 0) > 0) return {
    sheetId: 'player.echo9-marine.melee',
    clipId: actor.meleeKind === 'rifle-bash' ? 'rifle-bash' : actor.meleeKind === 'defense' ? 'melee-defense' : 'knife-attack'
  };
  if ((actor.toolUseClock || 0) > 0) {
    const toolClip = { cutter: 'cutting-torch', 'cutting-torch': 'cutting-torch', tuner: 'access-tuner', 'access-tuner': 'access-tuner', jack: 'maintenance-jack', 'maintenance-jack': 'maintenance-jack' }[actor.toolId] || 'motion-tracker';
    return { sheetId: 'player.echo9-marine.tool-use', clipId: toolClip };
  }
  if ((actor.interactionClock || 0) > 0) {
    const interactionClip = ['control-use', 'lift-carry', 'ground-interact', 'force-interact'].includes(actor.interactionKind)
      ? actor.interactionKind
      : 'control-use';
    return { sheetId: 'player.echo9-marine.interaction', clipId: interactionClip };
  }
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
  const allowedSheetIds = new Set([
    CREW_SPRITE_IDS[actor.crewId],
    CREW_MISSION_SPRITE_IDS[actor.crewId]
  ].filter(Boolean));
  if (dedicatedV55 && allowedSheetIds.has(dedicatedV55.sheetId)) {
    const dedicatedSheet = resolveSpriteSheet(dedicatedV55.sheetId);
    if (dedicatedSheet?.family === 'npc') return { sheetId: dedicatedV55.sheetId, clipId: dedicatedV55.clipId };
  }
  const sheetId = CREW_SPRITE_IDS[actor.crewId];
  if (!sheetId) return null;
  if (!actor.alive || actor.alertClock > 0 || actor.downed) return { sheetId, clipId: 'alert-reaction' };
  if (actor.workClock > 0 || actor.fireClock > 0 || actor.supportClock > 0) return { sheetId, clipId: 'role-work' };
  if (Math.abs(actor.vx || 0) > 8 || actor.climbing) return { sheetId, clipId: 'walk' };
  return { sheetId, clipId: 'idle' };
}

export function enforceHumanoidAnimationIdentity(actor = {}, request = null, { role = 'player', neuroActive = false } = {}) {
  const requestedSheet = resolveSpriteSheet(request?.sheetId);
  const explicitXenomorph = isExplicitXenomorphAnimationEntity(actor, neuroActive);
  const contractedSheetId = typeof actor.neuroVisualContract?.sheetId === 'string'
    ? actor.neuroVisualContract.sheetId
    : null;
  if (requestedSheet?.family === 'enemy' && explicitXenomorph) {
    if (contractedSheetId && requestedSheet.id === contractedSheetId) return request;
    if (!contractedSheetId && NEURO_XENOMORPH_SHEETS.has(requestedSheet.id)) return request;
  }
  if (role === 'player' && explicitXenomorph && contractedSheetId) {
    // A known Neuro identity must never silently borrow another enemy or marine sheet.
    return null;
  }

  if (role === 'npc') {
    const allowedSheetIds = new Set([
      CREW_SPRITE_IDS[actor.crewId],
      CREW_MISSION_SPRITE_IDS[actor.crewId]
    ].filter(Boolean));
    if (requestedSheet?.family === 'npc' && allowedSheetIds.has(requestedSheet.id)) return request;
    const fallback = resolveNpcAnimation(actor);
    return fallback ? { ...fallback, degraded: 'npc-animation-identity-rejected' } : null;
  }

  if (requestedSheet?.family === 'player') return request;
  return { ...resolvePlayerAnimation(actor, false), degraded: 'player-animation-identity-rejected' };
}

const DEDICATED_ENEMY_ACTION_CLIP_SETS = new Set([
  'enemy-action-v54',
  'enemy-action-v56',
  'facehugger-action-v65',
  'newborn-action-v64',
  'offspring-action-v64',
  'predalien-action-v64'
]);

export function resolveEnemyAnimation(enemy = {}) {
  const hurt = (enemy.hurtClock || 0) > 0 || (enemy.v52HurtClock || 0) > 0;
  const dead = !enemy.alive;
  const attacking = Boolean(enemy.attacking);
  const moving = Math.abs(enemy.vx || 0) > 8 || Boolean(enemy.alert);
  const v54ActionClip = dead ? 'death' : hurt ? 'idle' : attacking ? 'attack' : moving ? 'chase' : 'idle';
  const dedicatedClipSet = typeof enemy.visualSheetId === 'string'
    ? SPRITE_SHEETS[enemy.visualSheetId]?.clipSet
    : null;
  if (dedicatedClipSet === 'ovomorph-cycle-v66') {
    return { sheetId: enemy.visualSheetId, ...getOvomorphAnimationV66(enemy) };
  }
  if (dedicatedClipSet === 'enemy-action-v66') {
    const clipId = dead ? 'death' : hurt ? 'idle' : attacking ? 'attack' : Math.abs(enemy.vx || 0) > 8 ? 'move' : 'idle';
    const localAttackFrame = clipId === 'attack' ? getEnemyBatchAttackFrameV66(enemy) : null;
    return { sheetId: enemy.visualSheetId, clipId,
      ...(localAttackFrame === null ? {} : { frame: 16 + localAttackFrame }),
      ...(hurt && !dead ? { reaction: 'hurt' } : {}) };
  }
  const dedicatedActionSheet = DEDICATED_ENEMY_ACTION_CLIP_SETS.has(dedicatedClipSet)
    ? enemy.visualSheetId
    : null;
  if (dedicatedActionSheet) {
    // No injury row exists on these atlases: keep the actor alive visually.
    if (hurt && !dead) {
      return { sheetId: dedicatedActionSheet, clipId: 'idle', reaction: 'hurt' };
    }
    return { sheetId: dedicatedActionSheet, clipId: v54ActionClip };
  }
  if (enemy.spriteKey === 'ovomorph') return { sheetId: 'enemy.ovomorph.cycle', clipId: dead ? 'destroyed' : attacking ? 'hatch' : moving ? 'opening' : 'sealed' };
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
VEHICLE_SPRITE_FITS_V55.slice(1).forEach((fit, index) => {
  const fitIndex = index + 1;
  const suffix = vehicleFitSlug(fit);
  vehicleSpriteById.set(
    `vehicle-${String(1 + fitIndex * 36).padStart(3, '0')}-m577-armored-personnel-carrier-${suffix}`,
    'vehicle.m577-apc.action'
  );
  vehicleSpriteByName.set(`${VEHICLE_STANDARD_M577_NAME} — ${fit}`, 'vehicle.m577-apc.action');
});



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
  const v56 = resolveVehicleVisualAnimationV56(vehicle);
  const sheetId = v56?.sheetId || resolveExactVehicleSpriteSheet(vehicle);
  if (!sheetId) return null;
  const damaged = vehicle.destroyed || (vehicle.v52HurtClock || 0) > 0 || (vehicle.maxHull > 0 && vehicle.hull < vehicle.maxHull * 0.28);
  const access = resolveVehicleAccessAnimationV59(vehicle, sheetId);
  if (access) return access;
  if (v56) return v56;
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
    // A combat/lifecycle clock can own a reviewed frame. Reject requests
    // outside the selected clip so an actor can never sample another action.
    const explicitFrameIndex = Number.isInteger(request?.frame) ? clip.frames.indexOf(request.frame) : -1;
    const rawStep = explicitFrameIndex >= 0 ? explicitFrameIndex : Math.floor(elapsed * effectiveFps);
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
      column: frame % (sheetEntry.columns || SPRITE_GRID.columns),
      row: Math.floor(frame / (sheetEntry.columns || SPRITE_GRID.columns)),
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
