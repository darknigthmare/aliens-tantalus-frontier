import { getXenoTrialsArtV96, getXenoTrialsFighterV96, XENO_TRIALS_FIGHTERS_V96, XENO_TRIALS_STAGES_V96 } from './xeno-trials-data-v96.js';
import { getXenoTrialsBodyBoundsV105, XENO_TRIALS_ARENA_V105 } from './xeno-trials-geometry-v105.js';
import { getXenoTrialsGroundSupportLockV210 } from './xeno-trials-capture-v163.js';
import { getXenoTrialsRuntimeArticulatedRig, getXenoTrialsRuntimeDefenseRig, getXenoTrialsRigV154 } from './xeno-trials-rig-v154.js';

const roster = new Set(XENO_TRIALS_FIGHTERS_V96.map(fighter => fighter.id));
const stages = new Set(XENO_TRIALS_STAGES_V96.map(stage => stage.id));
const floor = XENO_TRIALS_ARENA_V105.floor;
const supports = new Map([
  ['synth-sniper', 'boot', 'rightBoot', ['leftBoot'], { 'user-brute': 3, prowler: 3 }],
  ['synth-heavy', 'boot', 'frontBoot', ['rearBoot'], { ravager: 2 }],
  ['import-joe-classic', 'boot', 'frontBoot', ['backBoot'], { 'user-brute': 3, prowler: 3 }],
  ['import-joe-tactical', 'boot', 'frontBoot', ['backBoot'], { ravager: 2 }],
  ['import-engineer-armorsuit', 'boot', 'nearBoot', ['farBoot'], { 'crusher-acm': 3 }],
  ['import-engineer-spacejokey', 'boot', 'frontBoot', ['backBoot'], { ravager: 2 }],
  ['import-engineer-woman', 'boot', 'nearBoot', ['farBoot'], { 'crusher-acm': 3 }],
  ['import-synth-jerri-1', 'boot', 'frontFoot', ['backFoot'], { 'crusher-acm': 3 }],
  ['synth-enforcer', 'boot', 'frontBoot', ['backBoot'], { ravager: 2 }],
  ['xenoborg', 'paw', 'frontFoot', ['rearFoot'], { 'crusher-acm': 3, ravager: 3 }],
  ['stalker-arcade', 'paw', 'forwardFoot', ['rearFoot'], { 'crusher-acm': 3, ravager: 3 }],
  ['user-black-fin', 'paw', 'foreFar', ['foreNear', 'hindNear', 'hindFar'], { ravager: 2 }],
  ['grid', 'paw', 'forwardFoot', ['rearFoot'], { 'crusher-acm': 3, ravager: 2 }],
  ['royal-guard', 'paw', 'frontFoot', ['rearFoot'], { 'crusher-acm': 3, ravager: 3 }],
  ['albino-six', 'paw', 'frontFoot', ['rearFoot'], { 'crusher-acm': 3 }],
  ['acid-combat-synth', 'boot', 'frontBoot', ['rearBoot'], { ravager: 2 }],
  ['cryo-combat-synth', 'boot', 'forwardBoot', ['rearBoot'], { ravager: 2 }]
].map(([id, motion, contactKey, supportKeys, targets]) => [id, { motion, contactKey, supportKeys, targets }]));
const supportTimings = Object.freeze({
  boot: Object.freeze({ approachMs: 310, holdMs: 350, retreatMs: 360 }),
  paw: Object.freeze({ approachMs: 340, holdMs: 420, retreatMs: 420 }),
  knuckle: Object.freeze({ approachMs: 400, holdMs: 510, retreatMs: 430 })
});
const isolationStages = new Map([
  ['containment-deck', [390, 680]],
  ['reactor-ring', [356, 718]],
  ['hive-vault', [405, 692]],
  ['tantalus-bridge', [365, 729]],
  ['tantalus-cargo', [410, 710]],
  ['planet-surface', [372, 695]],
  ['xt198-nostromo-maintenance', [412, 692]],
  ['xt192-sulaco-hangar', [357, 718]],
  ['xt198-hadleys-hope-service-corridor', [395, 695]],
  ['xt192-fury161-leadworks', [398, 727]],
  ['xt192-auriga-clone-laboratory', [360, 675]],
  ['xt198-sevastopol-synthetic-line', [395, 720]],
  ['xt192-lv223-orrery', [407, 718]],
  ['xt198-covenant-maintenance-workshop', [374, 685]],
  ['xt192-renaissance-cryo-chamber', [395, 713]],
  ['xt198-arcade-containment-laboratory', [422, 688]]
].map(([stageId, anchors]) => [stageId, Object.freeze(anchors.map((x, index) => Object.freeze({
  id: `${stageId}-mire-isolation-${index + 1}`, kind: 'isolation',
  x, left: x - 65, right: x + 65
})))]));

const sealTiming = Object.freeze({ approachMs: 280, holdMs: 420, retreatMs: 280 });
const isolationTiming = Object.freeze({ approachMs: 250, holdMs: 650, retreatMs: 350 });
const noFixtures = Object.freeze([]);
export const XENO_TRIALS_ISOLATION_REACH_V211 = 168;
export const getXenoTrialsIsolationFixturesV211 = stageId => isolationStages.get(stageId) ?? noFixtures;
export const getXenoTrialsIsolationFixtureV211 = (stageId, targetX, center) =>
  getXenoTrialsIsolationFixturesV211(stageId).find(({ left, right }) =>
    targetX >= left && targetX <= right && center >= left && center <= right);
export const XENO_TRIALS_FINISHER_COPY_V211 = Object.freeze({
  seal: Object.freeze({ button: 'F · CONFIRMER LA NEUTRALISATION',
    offered: 'Victoire confirmée. Vérification du spécimen disponible avec F.', playing: 'Vérification du spécimen en cours.' }),
  isolation: Object.freeze({ button: 'F · ISOLER LE SECTEUR',
    offered: 'Victoire confirmée. Balises d’isolement disponibles avec F.', playing: 'Fermeture du périmètre de sécurité.' })
});

export function getXenoTrialsContactFinisherV211(attacker, target, images) {
  return getXenoTrialsMeasuredContactFinisherV211(attacker, target, images, supports.get(attacker.id), 211);
}

export function getXenoTrialsMeasuredContactFinisherV211(attacker, target, images, profile, revision) {
  const anchor = profile?.targets[target.id];
  if (!Number.isInteger(anchor)) return null;
  const fighter = getXenoTrialsFighterV96(attacker.id);
  const art = getXenoTrialsArtV96(attacker.id, attacker.variant);
  const rig = getXenoTrialsRuntimeArticulatedRig(fighter, art) || getXenoTrialsRuntimeDefenseRig(fighter, art)
    || getXenoTrialsRigV154(fighter, art);
  if (!rig || rig.profileId !== fighter?.profileId) return null;
  const { motion, contactKey, supportKeys } = profile;
  const lock = getXenoTrialsGroundSupportLockV210(attacker, target, images, rig,
    { motion, contactKey, supportKeys, liftHeight: 6, range: 15, revision }, anchor);
  return lock && { id: `${attacker.id}::fin1`, kind: motion, timing: supportTimings[motion], lock };
}

/** Safe control from the Bible's compatibility table. The scanner observes
 * the terminal position through either caster; it never poses either body. */
export function getXenoTrialsNeutralFinishersV211(match, attacker, target) {
  const stage = match.config.stageId;
  if (match.result.stageId !== stage || !stages.has(stage) || !roster.has(attacker.id) || !roster.has(target.id)) return [];
  const source = getXenoTrialsBodyBoundsV105(attacker), body = getXenoTrialsBodyBoundsV105(target);
  const lock = { neutral: true, target, attacker, left: body.left, right: body.right };
  const fin1 = { id: `${attacker.id}::fin1`, kind: 'seal', timing: sealTiming, lock };
  const fixture = getXenoTrialsIsolationFixtureV211(stage, target.x, body.center);
  const inRange = fixture && source.right >= fixture.left - XENO_TRIALS_ISOLATION_REACH_V211
    && source.left <= fixture.right + XENO_TRIALS_ISOLATION_REACH_V211;
  return inRange ? [fin1, { id: `${attacker.id}::fin2`, kind: 'isolation', timing: isolationTiming,
    lock: { ...lock, fixture } }] : [fin1];
}

export function drawXenoTrialsNeutralFinisherV211(ctx, stageId, view, reducedMotion) {
  const lock = view?.lock.neutral ? view.lock : null;
  const active = lock && !reducedMotion && view.gain > 0 && (!lock.approachV212 || view.contact) ? lock : null;
  const fixtures = getXenoTrialsIsolationFixturesV211(stageId);
  for (const fixture of fixtures) {
    const engaged = active?.fixture === fixture;
    ctx.save();
    ctx.fillStyle = '#193038';
    ctx.fillRect(fixture.left, floor - 4, 9, 6);
    ctx.fillRect(fixture.right - 9, floor - 4, 9, 6);
    ctx.fillStyle = engaged ? '#abdce2' : '#477480';
    ctx.fillRect(fixture.left + 2, floor - 5, 5, 2);
    ctx.fillRect(fixture.right - 7, floor - 5, 5, 2);
    ctx.restore();
  }
  if (!active) return null;

  const { fixture, target } = active;
  const left = fixture?.left ?? active.left;
  const right = fixture?.right ?? active.right;
  const height = fixture ? 43 : 15;
  const rise = height * view.gain;
  ctx.save();
  ctx.globalAlpha *= .7 * view.gain;
  ctx.fillStyle = fixture ? '#3f7c85' : '#447786';
  ctx.fillRect(left, floor - 2, right - left, 3);
  ctx.strokeStyle = fixture ? '#a9d2d7' : '#80b5c5';
  ctx.beginPath();
  ctx.moveTo(left, floor); ctx.lineTo(left, floor - rise); ctx.lineTo(left + 8, floor - rise);
  ctx.moveTo(right, floor); ctx.lineTo(right, floor - rise); ctx.lineTo(right - 8, floor - rise);
  ctx.stroke();
  if (view.contact && fixture) {
    ctx.globalAlpha *= .32;
    ctx.fillRect(left, floor - rise, right - left, rise);
  }
  ctx.restore();
  return { targetId: target.id, targetX: target.x, left, right, floor, contact: view.contact, fixtureId: fixture?.id ?? null };
}
