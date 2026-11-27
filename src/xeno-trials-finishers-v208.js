import { getXenoTrialsFighterV96 } from './xeno-trials-data-v96.js';
import { getXenoTrialsBootLockV208, getXenoTrialsCircuitLockV208 } from './xeno-trials-capture-v163.js';
import { XENO_TRIALS_ARENA_V105 } from './xeno-trials-geometry-v105.js';
import { hasXenoTrialsGrappleV153 } from './xeno-trials-grapple-v153.js';
import { getXenoTrialsStageHazardV188 } from './xeno-trials-stage-hazards-v188.js';

const cultist = 'dd-darwin-era-cultist';
const commando = 'import-game-dd-wy-commando';
const guardian = 'import-game-dd-guardian';
const bootContacts = new Map([
  [cultist, { profileId: 'pose-v118-dd-darwin-era-cultist', key: 'footNear', targets: [commando, guardian] }],
  [commando, { profileId: 'pose-v106-import-game-dd-wy-commando', key: 'footFar', targets: [cultist] }]
]);

// The duel uses the two physical arc channels already authored for each sector.
// Their circuit isolation plates remain visible in the idle state from frame one.
const floor = XENO_TRIALS_ARENA_V105.floor;
const fixtures = new Map(['xt179-reactor', 'xt179-ship-extraction'].map(stageId => {
  const hazard = getXenoTrialsStageHazardV188(stageId);
  const lanes = hazard?.kind === 'arc' ? hazard.anchors.map((x, index) => {
    const left = x - hazard.width / 2, right = x + hazard.width / 2;
    return Object.freeze({ id: `${hazard.id}-isolation-${index + 1}`, source: hazard.id, stageId, left, right,
      pads: Object.freeze([Object.freeze([left - 2, floor - 9]), Object.freeze([right + 2, floor - 9])]) });
  }) : [];
  return [stageId, Object.freeze(lanes)];
}));
const empty = Object.freeze([]);
const arcTiming = Object.freeze({ approachMs: 300, holdMs: 570, retreatMs: 440 });
const bootTiming = Object.freeze({ approachMs: 320, holdMs: 300, retreatMs: 360 });
const copy = Object.freeze({
  claw: Object.freeze({ button: 'F · VERROU FINAL', offered: 'Victoire confirmée. Verrou final disponible avec F.', playing: 'Verrou final en cours.' }),
  boot: Object.freeze({ button: 'F · APPUI DE CONTRÔLE', offered: 'Victoire confirmée. Appui de contrôle disponible avec F.', playing: 'Appui de contrôle en cours.' }),
  circuit: Object.freeze({ button: 'F · ISOLER LE CIRCUIT', offered: 'Victoire confirmée. Isolation du circuit disponible avec F.', playing: 'Isolation du circuit en cours.' })
});

export const getXenoTrialsFinisherFixturesV208 = stageId => fixtures.get(stageId) || empty;
export const getXenoTrialsFinisherCopyV208 = kind => Object.hasOwn(copy, kind) ? copy[kind] : copy.claw;

export function getXenoTrialsExtendedFinisherV208(match, attacker, target, images) {
  const definition = getXenoTrialsFighterV96(attacker.id);
  if (hasXenoTrialsGrappleV153(definition)) {
    const stageId = match.config.stageId;
    if (match.result.stageId !== stageId) return null;
    for (const fixture of getXenoTrialsFinisherFixturesV208(stageId)) {
      const lock = getXenoTrialsCircuitLockV208(attacker, target, images, fixture);
      if (lock) return { id: 'prowler::fin2', kind: 'circuit', timing: arcTiming, lock };
    }
    return null;
  }
  const boot = bootContacts.get(attacker.id);
  if (!boot || definition?.profileId !== boot.profileId || !boot.targets.includes(target.id)) return null;
  const lock = getXenoTrialsBootLockV208(attacker, target, images, boot.key);
  return lock && { id: `${attacker.id}::fin1`, kind: 'boot', timing: bootTiming, lock };
}

export function drawXenoTrialsFinisherFixturesV208(ctx, stageId, view) {
  const drawn = [];
  for (const fixture of getXenoTrialsFinisherFixturesV208(stageId)) {
    const { left, right, pads } = fixture;
    const active = view?.lock.fixture === fixture && view.contact;
    ctx.save();
    ctx.fillStyle = '#162a31'; ctx.fillRect(left - 8, floor - 7, right - left + 16, 10);
    ctx.strokeStyle = '#508694'; ctx.lineWidth = 1; ctx.strokeRect(left - 8, floor - 7, right - left + 16, 10);
    ctx.fillStyle = active ? '#9de7ff' : '#628b91';
    for (const [x, y] of pads) {
      ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(x - 2, y + 4, 4, 5);
    }
    for (let x = left + 6; x < right - 3; x += 12) ctx.fillRect(x, floor - 4, 4, 2);
    if (active) {
      ctx.fillStyle = '#9de7ff'; ctx.globalAlpha = .14; ctx.fillRect(left, floor - 39, right - left, 37);
      ctx.globalAlpha = .65; ctx.strokeStyle = '#b2eaff';
      ctx.beginPath(); ctx.moveTo(left, floor - 6); ctx.lineTo(left, floor - 39);
      ctx.lineTo(right, floor - 39); ctx.lineTo(right, floor - 6); ctx.stroke();
    }
    ctx.restore();
    drawn.push({ ...fixture, active: Boolean(active) });
  }
  return drawn;
}
