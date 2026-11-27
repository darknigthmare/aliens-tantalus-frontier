import { getXenoTrialsFighterV96, getXenoTrialsArtV96 } from './xeno-trials-data-v96.js';
import { getXenoTrialsGroundSupportLockV210, getXenoTrialsFixtureSupportLockV210 } from './xeno-trials-capture-v163.js';
import { XENO_TRIALS_ARENA_V105 } from './xeno-trials-geometry-v105.js';
import { getXenoTrialsRigV154, getXenoTrialsRuntimeArticulatedRig, getXenoTrialsRuntimeDefenseRig } from './xeno-trials-rig-v154.js';
import { getXenoTrialsStageHazardV188 } from './xeno-trials-stage-hazards-v188.js';

const motions = new Map([
  ['prowler', ['claw', 'handFar', ['footNear', 'footFar']]],
  ['user-skeletal-quadruped', ['paw', 'foreFar', ['foreNear', 'rearNear', 'rearFar']]],
  ['albino-runner', ['paw', 'frontFar', ['frontNear', 'rearNear', 'rearFar']]],
  ['cryo-burster', ['paw', 'foreFar', ['foreNear', 'hindNear', 'hindFar']]],
  ['combat-synth', ['boot', 'footFar', ['footNear']]],
  ['albino-combat-synth', ['boot', 'forwardBoot', ['rearBoot']]],
  ['import-synth-eloise', ['boot', 'footFar', ['footNear']]],
  ['user-rhino', ['paw', 'foreFar', ['foreNear', 'rearNear', 'rearFar']]],
  ['user-bulbous-quadruped', ['paw', 'frontPad', ['frontHeel', 'rearPad', 'rearHeel']]],
  ['user-spiker', ['paw', 'footFar', ['footNear']]],
  ['armored-red', ['paw', 'forwardFoot', ['rearFoot']]],
  ['armored-joe', ['boot', 'farBoot', ['nearBoot']]],
  ['albino-crusher', ['paw', 'frontFar', ['frontNear', 'rearNear', 'rearFar']]],
  ['import-game-afe2-exploder', ['paw', 'frontFar', ['frontNear', 'rearNear', 'rearFar']]],
  ['afe2-huntsman', ['paw', 'frontFar', ['frontNear', 'rearNear', 'rearFar']]]
]);
const groundContacts = new Map([
  ['prowler', { ravager: 2 }],
  ['user-skeletal-quadruped', { ravager: 2 }],
  ['albino-runner', { ravager: 2 }],
  ['cryo-burster', { ravager: 2 }],
  ['combat-synth', { ravager: 2 }],
  ['albino-combat-synth', { ravager: 2 }],
  ['import-synth-eloise', { ravager: 2 }],
  ['user-rhino', { 'crusher-acm': 3 }],
  ['user-bulbous-quadruped', { 'crusher-acm': 3 }],
  ['user-spiker', { 'crusher-acm': 3, ravager: 2 }],
  ['armored-red', { 'crusher-acm': 3, ravager: 3 }],
  ['armored-joe', { ravager: 2 }],
  ['albino-crusher', { 'crusher-acm': 3 }],
  ['import-game-afe2-exploder', { ravager: 2 }],
  ['afe2-huntsman', { ravager: 2 }]
]);
// These stages use exactly the existing V188 footprints for the closed hatches
// and the fluid return circuit. Their plates are painted throughout the duel.
const floor = XENO_TRIALS_ARENA_V105.floor;
const hardware = [
  ['xt179-ship-docking', 'debris', 'shutter', ['combat-synth', 'albino-combat-synth', 'import-synth-eloise']],
  ['xt179-quarantine', 'corrosive', 'drain', ['albino-runner', 'cryo-burster', 'user-skeletal-quadruped']]
];
const fixtures = new Map(hardware.map(([stageId, sourceKind, kind, actors]) => {
  const source = getXenoTrialsStageHazardV188(stageId);
  const stations = source?.kind === sourceKind ? source.anchors.map((x, index) => {
    const left = x - source.width / 2, right = x + source.width / 2;
    return Object.freeze({ id: source.id + '-' + kind + '-' + (index + 1), source: source.id, stageId, kind, revision: 210, x, left, right,
      pads: Object.freeze([Object.freeze([left - 2, floor - 9]), Object.freeze([right + 2, floor - 9])]) });
  }) : [];
  return [stageId, { actors, stations: Object.freeze(stations) }];
}));
const timings = Object.freeze({
  claw: { approachMs: 270, holdMs: 430, retreatMs: 360 },
  paw: { approachMs: 340, holdMs: 460, retreatMs: 450 },
  boot: { approachMs: 310, holdMs: 350, retreatMs: 360 },
  shutter: { approachMs: 340, holdMs: 700, retreatMs: 460 },
  drain: { approachMs: 380, holdMs: 610, retreatMs: 460 }
});
const empty = Object.freeze([]);
export const getXenoTrialsFinisherFixturesV210 = stageId => fixtures.get(stageId)?.stations || empty;
export const XENO_TRIALS_FINISHER_COPY_V210 = Object.freeze({
  shutter: Object.freeze({ button: 'F · VERROUILLER LE VOLET', offered: 'Victoire confirmée. Verrouillage du volet disponible avec F.', playing: 'Verrouillage du volet en cours.' }),
  drain: Object.freeze({ button: 'F · OUVRIR LE DRAIN', offered: 'Victoire confirmée. Ouverture du drain disponible avec F.', playing: 'Ouverture du drain en cours.' })
});

export function getXenoTrialsExtendedFinisherV210(match, attacker, target, images) {
  const motion = motions.get(attacker.id);
  const support = groundContacts.get(attacker.id)?.[target.id];
  const stage = match.config.stageId;
  const station = match.result.stageId === stage && fixtures.get(stage);
  const eligibleStation = station?.actors.includes(attacker.id);
  if (!motion || !Number.isInteger(support) && !eligibleStation) return null;
  const definition = getXenoTrialsFighterV96(attacker.id);
  const art = getXenoTrialsArtV96(attacker.id, attacker.variant);
  const rig = getXenoTrialsRuntimeArticulatedRig(definition, art) || getXenoTrialsRuntimeDefenseRig(definition, art)
    || getXenoTrialsRigV154(definition, art);
  if (!rig || rig.profileId !== definition?.profileId) return null;
  const [kind, contactKey, supportKeys] = motion;
  const profile = { motion: kind, contactKey, supportKeys, liftHeight: kind === 'paw' ? 7 : 6, range: 15, revision: 210 };
  if (eligibleStation) {
    for (const fixture of station.stations) {
      const lock = getXenoTrialsFixtureSupportLockV210(attacker, target, images, rig, profile, fixture);
      if (lock) return { id: attacker.id + '::fin2', kind: fixture.kind, timing: timings[fixture.kind], lock };
    }
  }
  if (!Number.isInteger(support)) return null;
  const lock = getXenoTrialsGroundSupportLockV210(attacker, target, images, rig, profile, support);
  return lock && { id: attacker.id + '::fin1', kind, timing: timings[kind], lock };
}

export function drawXenoTrialsFinisherFixturesV210(ctx, stage, view) {
  return getXenoTrialsFinisherFixturesV210(stage).map(fixture => {
    const { x, left, right, pads } = fixture;
    const shutter = fixture.kind === 'shutter', width = right - left;
    const active = Boolean(view?.lock.fixture === fixture && view.contact);
    ctx.save();
    ctx.fillStyle = shutter ? '#372f27' : '#26372f';
    ctx.strokeStyle = shutter ? '#ba9562' : '#7ba88d';
    ctx.fillRect(left - 7, floor - 6, width + 14, 10);
    ctx.strokeRect(left - 7, floor - 6, width + 14, 10);
    for (const [padX, padY] of pads) {
      ctx.fillStyle = active ? '#ffedaf' : shutter ? '#ba9562' : '#7ba88d';
      ctx.beginPath(); ctx.arc(padX, padY, 5, 0, Math.PI * 2); ctx.fill();
    }
    for (let notch = left + 6; notch < right - 5; notch += 12) ctx.strokeRect(notch, floor - 4, 5, 3);
    if (active && shutter) {
      ctx.fillStyle = '#8d7456'; ctx.globalAlpha = .50;
      ctx.fillRect(left, floor - 57, width, 14);
      ctx.strokeStyle = '#ffdead'; ctx.beginPath();
      ctx.moveTo(left, floor - 42); ctx.lineTo(left, floor - 3);
      ctx.moveTo(right, floor - 42); ctx.lineTo(right, floor - 3); ctx.stroke();
    } else if (active) {
      ctx.strokeStyle = '#b6cc92'; ctx.globalAlpha = .57;
      for (const offset of [-.33, -.17, .17, .33]) {
        const inlet = x + width * offset;
        ctx.beginPath(); ctx.moveTo(inlet, floor - 13); ctx.quadraticCurveTo(inlet, floor - 6, x + width * offset * .6, floor - 3); ctx.stroke();
      }
    }
    ctx.restore();
    return { ...fixture, active };
  });
}
