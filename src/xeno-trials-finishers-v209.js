import { getXenoTrialsFighterV96, getXenoTrialsArtV96 } from './xeno-trials-data-v96.js';
import { getXenoTrialsCircuitLockV208, getXenoTrialsSupportLockV209 } from './xeno-trials-capture-v163.js';
import { XENO_TRIALS_ARENA_V105 } from './xeno-trials-geometry-v105.js';
import { hasXenoTrialsGrappleV153 } from './xeno-trials-grapple-v153.js';
import { getXenoTrialsRuntimeArticulatedRig, getXenoTrialsRuntimeDefenseRig } from './xeno-trials-rig-v154.js';
import { getXenoTrialsStageHazardV188 } from './xeno-trials-stage-hazards-v188.js';

const cultist = 'dd-darwin-era-cultist';
const commando = 'import-game-dd-wy-commando';
const guardian = 'import-game-dd-guardian';
const allTargets = [cultist, commando, guardian];
const profiles = new Map([
  ['user-skeletal-quadruped', ['pose-v95-user-quadrupede-squelettique', 'paw', 'foreFar', ['foreNear', 'rearNear', 'rearFar'], [cultist, commando]]],
  ['albino-runner', ['enemy-058-albino-runner', 'paw', 'frontFar', ['frontNear', 'rearNear', 'rearFar'], allTargets]],
  ['cryo-lurker', ['enemy-219-cryo-adapted-lurker', 'paw', 'frontFar', ['frontNear', 'hindNear', 'hindFar'], [cultist, commando]]],
  ['cryo-burster', ['enemy-224-cryo-adapted-burster', 'paw', 'foreFar', ['foreNear', 'hindNear', 'hindFar'], [cultist]]],
  ['import-xeno-gorillaxeno', ['pose-v106-import-xeno-gorillaxeno', 'knuckle', 'knucklesFar', ['knucklesNear', 'footNear', 'footFar'], [cultist, commando]]],
  ['combat-synth', ['enemy-146-armored-combat-synthetic', 'boot', 'footFar', ['footNear'], [cultist]]],
  ['albino-combat-synth', ['enemy-094-albino-combat-synthetic', 'boot', 'forwardBoot', ['rearBoot'], [cultist, commando]]],
  ['import-synth-eloise', ['pose-v106-import-synth-eloise', 'boot', 'footFar', ['footNear'], [cultist, commando]]]
]);
const timings = Object.freeze({
  paw: { approachMs: 370, holdMs: 460, retreatMs: 420 },
  knuckle: { approachMs: 400, holdMs: 510, retreatMs: 430 },
  boot: { approachMs: 320, holdMs: 300, retreatMs: 360 },
  steam: { approachMs: 300, holdMs: 590, retreatMs: 420 },
  cryo: { approachMs: 340, holdMs: 640, retreatMs: 460 }
});
const floor = XENO_TRIALS_ARENA_V105.floor;
const stageKinds = new Map([['xt179-ship-engineering', 'steam'], ['xt190-specimen-transfer', 'cryo']]);
const empty = Object.freeze([]);
const fixtures = new Map([...stageKinds].map(([stageId, kind]) => {
  const hazard = getXenoTrialsStageHazardV188(stageId);
  const lanes = hazard?.kind === kind ? hazard.anchors.map((x, index) => {
    const left = x - hazard.width / 2, right = x + hazard.width / 2;
    return Object.freeze({ id: hazard.id + '-isolation-' + (index + 1), source: hazard.id, stageId, kind, revision: 209, x, left, right,
      pads: Object.freeze([Object.freeze([left - 2, floor - 9]), Object.freeze([right + 2, floor - 9])]) });
  }) : [];
  return [stageId, Object.freeze(lanes)];
}));

export const getXenoTrialsFinisherFixturesV209 = stageId => fixtures.get(stageId) || empty;
export const XENO_TRIALS_FINISHER_COPY_V209 = Object.freeze({
  paw: Object.freeze({ button: 'F · APPUI DE GRIFFE', offered: 'Victoire confirmée. Appui de griffe disponible avec F.', playing: 'Appui de griffe en cours.' }),
  knuckle: Object.freeze({ button: 'F · PRESSION DU POING', offered: 'Victoire confirmée. Pression du poing disponible avec F.', playing: 'Pression du poing en cours.' }),
  steam: Object.freeze({ button: 'F · FERMER LA VANNE', offered: 'Victoire confirmée. Fermeture de la vanne disponible avec F.', playing: 'Fermeture de la vanne en cours.' }),
  cryo: Object.freeze({ button: 'F · ISOLER LA PURGE', offered: 'Victoire confirmée. Isolation de la purge disponible avec F.', playing: 'Isolation de la purge en cours.' })
});

export function getXenoTrialsExtendedFinisherV209(match, attacker, target, images) {
  const definition = getXenoTrialsFighterV96(attacker.id);
  if (hasXenoTrialsGrappleV153(definition)) {
    const stageId = match.config.stageId;
    if (match.result.stageId !== stageId) return null;
    for (const fixture of getXenoTrialsFinisherFixturesV209(stageId)) {
      const lock = getXenoTrialsCircuitLockV208(attacker, target, images, fixture);
      if (lock) return { id: 'prowler::fin2', kind: fixture.kind, timing: timings[fixture.kind], lock };
    }
    return null;
  }
  const profile = profiles.get(attacker.id);
  if (!profile) return null;
  const [profileId, motion, contactKey, supportKeys, targets] = profile;
  if (definition?.profileId !== profileId || !targets.includes(target.id)) return null;
  const art = getXenoTrialsArtV96(attacker.id, attacker.variant);
  const rig = getXenoTrialsRuntimeArticulatedRig(definition, art) || getXenoTrialsRuntimeDefenseRig(definition, art);
  if (!rig) return null;
  const lock = getXenoTrialsSupportLockV209(attacker, target, images, rig, {
    contactKey, supportKeys, motion, liftHeight: motion === 'paw' ? 7 : 6, range: 15, revision: 209
  });
  return lock && { id: attacker.id + '::fin1', kind: motion, timing: timings[motion], lock };
}

/** Hardware sits on the combat plane during the duel. The isolated channel
 * only pulses during the measured contact in the optional presentation. */
export function drawXenoTrialsFinisherFixturesV209(ctx, stageId, view) {
  return getXenoTrialsFinisherFixturesV209(stageId).map(fixture => {
    const { x, left, right, pads, kind } = fixture;
    const steam = kind === 'steam';
    const active = Boolean(view?.lock.fixture === fixture && view.contact);
    ctx.save();
    ctx.fillStyle = steam ? '#382c25' : '#243a4b';
    ctx.strokeStyle = steam ? '#b58b62' : '#79a9c9';
    ctx.lineWidth = 1;
    ctx.fillRect(left - 8, floor - 6, right - left + 16, 10);
    ctx.strokeRect(left - 8, floor - 6, right - left + 16, 10);
    for (const [px, py] of pads) {
      ctx.fillStyle = active ? '#e2f0f5' : steam ? '#ba976c' : '#7bacca';
      ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(px - 1, py + 4, 3, 5);
    }
    for (let notch = left + 5; notch < right - 5; notch += 10) ctx.strokeRect(notch, floor - 4, 4, 4);
    if (active) {
      ctx.fillStyle = steam ? '#d5cbc0' : '#a8d9ee';
      ctx.globalAlpha = .19;
      ctx.beginPath();
      ctx.ellipse(x, floor - (steam ? 32 : 9), (right - left) * .43, steam ? 30 : 8, 0, 0, Math.PI * 2);
      ctx.fill();
      if (!steam) {
        ctx.globalAlpha = .56;
        for (let i = 0; i < 5; i++) {
          const column = left + (right - left) * (i + 1) / 6;
          ctx.beginPath(); ctx.moveTo(column - 4, floor - 8); ctx.lineTo(column, floor - 17);
          ctx.lineTo(column + 4, floor - 8); ctx.stroke();
        }
      }
    }
    ctx.restore();
    return { ...fixture, active };
  });
}
