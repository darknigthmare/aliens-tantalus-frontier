import { getXenoTrialsHordeGateCueV213, getXenoTrialsHordeMinigameV213 } from './xeno-trials-horde-minigames-v213.js';
import { getXenoTrialsReinforcementV201 } from './xeno-trials-reinforcements-v201.js';
import { getXenoTrialsBossStageV179 } from './xeno-trials-boss-stages-v179.js';
import { getXenoTrialsGantryConvoyV222, getXenoTrialsGroundingDoorV223, getXenoTrialsHangarBypassV221 } from './xeno-trials-operations-v188.js';

// The V146 proposed rows map to the stage that now represents each room.
// These are scene fixtures drawn behind the fight, not colliders or hazards.
const profiles = [
  ['containment-deck', 'containment-deck', 'glass', 'sliding', 'vapor', 'inspection'],
  ['reactor-ring', 'reactor-ring', 'metal', 'shutter', 'vapor', 'carriage'],
  ['hive-vault', 'hive-vault', 'resin', 'membrane', 'spores', 'filament'],
  ['tantalus-bridge', 'tantalus-bridge', 'glass', 'sliding', 'vapor', 'inspection'],
  ['tantalus-cargo', 'tantalus-cargo', 'metal', 'shutter', 'dust', 'carriage'],
  ['planet-surface', 'planet-surface', 'stone', 'perimeter', 'dust', 'silhouette'],
  ['proposed-nostromo', 'xt198-nostromo-maintenance', 'metal', 'shutter', 'vapor', 'carriage'],
  ['proposed-sulaco', 'xt192-sulaco-hangar', 'metal', 'shutter', 'vapor', 'silhouette'],
  ['proposed-hadleys', 'xt198-hadleys-hope-service-corridor', 'metal', 'sliding', 'vapor', 'inspection'],
  ['proposed-fiorina', 'xt192-fury161-leadworks', 'stone', 'shutter', 'dust', 'carriage'],
  ['proposed-auriga', 'xt192-auriga-clone-laboratory', 'glass', 'sliding', 'vapor', 'inspection'],
  ['proposed-sevastopol', 'xt198-sevastopol-synthetic-line', 'metal', 'shutter', 'vapor', 'carriage'],
  ['proposed-lv223', 'xt192-lv223-orrery', 'stone', 'perimeter', 'dust', 'filament'],
  ['proposed-covenant', 'xt198-covenant-maintenance-workshop', 'metal', 'shutter', 'dust', 'carriage'],
  ['proposed-romulus', 'xt192-renaissance-cryo-chamber', 'glass', 'sliding', 'vapor', 'inspection'],
  ['proposed-capcom', 'xt198-arcade-containment-laboratory', 'glass', 'sliding', 'vapor', 'inspection']
];

export const XENO_TRIALS_STAGE_EVENT_PROFILES_V211 = Object.freeze(profiles.map(
  ([planId, stageId, material, gate, atmosphere, machinery]) => Object.freeze({
    planId, stageId, material, gate, atmosphere, machinery
  })
));
const profilesByStage = new Map(XENO_TRIALS_STAGE_EVENT_PROFILES_V211.map(profile => [profile.stageId, profile]));
const contactTypes = new Set(['hit', 'block', 'guard-break']);
const impactLifetime = 26;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const gateTravelTicks = 24;

function getScenePhase(match, presentation) {
  if (match.result || match.phase === 'match-over') return 'result';
  if (match.phase === 'round-over' || match.hordeV180?.phase === 'intermission') return 'intermission';
  if (match.phase === 'intro' || presentation?.blocksSimulation) return 'introduction';
  return 'combat';
}

function getContactSide(match, event, arena) {
  const target = event.targetInstanceV180 && event.targetInstanceV180 !== 'player'
    ? match.fighters.find(fighter => fighter.instanceIdV180 === event.targetInstanceV180)
    : match.fighters.find(fighter => fighter.side === event.side);
  if (!Number.isFinite(target?.x) || !Number.isFinite(target.y) || target.y > 64) return null;
  // Only a recent contact beside a boundary fixture can disturb that fixture.
  // The native event supplies the receiver, whose current position is sampled.
  if (target.x - arena.left <= 96) return 'left';
  if (arena.right - target.x <= 96) return 'right';
  return null;
}

function getDirectedGates(protocol, match, phase, opening, reducedMotion) {
  const firstWave = protocol.waves[0];
  let contacts;
  let openingFraction = 0;
  let status = 'locked';
  if (phase === 'introduction' && opening > 0) {
    contacts = getXenoTrialsHordeGateCueV213(firstWave, 0, firstWave.concurrent)?.counts;
    openingFraction = opening;
    status = 'armed';
  } else if (phase === 'combat' || phase === 'intermission') {
    const cue = getXenoTrialsReinforcementV201(match);
    const elapsed = match.tick - Math.ceil(match.config.introSeconds * 120);
    if (cue?.phase === 'incoming') {
      contacts = cue.gateContactsV213;
      openingFraction = clamp(1 - cue.remainingTicks / gateTravelTicks, 0, 1);
      status = 'armed';
    } else {
      // The first batch exists before the combat presentation. Later batches
      // use the same saved director clocks as the other reinforcement cues.
      const initial = match.hordeV180.wave === 1 && elapsed < gateTravelTicks;
      const age = initial ? elapsed : match.tick - cue?.arrivalTick;
      if (age >= 0 && age < gateTravelTicks) {
        contacts = initial ? getXenoTrialsHordeGateCueV213(firstWave, 0, firstWave.concurrent)?.counts : cue?.gateContactsV213;
        openingFraction = clamp(1 - (age - 6) / (gateTravelTicks - 6), 0, 1);
        status = 'open';
      }
    }
  }
  const gate = side => contacts?.[side] > 0
    ? { status, opening: reducedMotion ? 0 : openingFraction }
    : { status: 'locked', opening: 0 };
  return { left: gate('left'), right: gate('right') };
}

export function createXenoTrialsStageEventsV211(stageId, match, arena) {
  const minigame = getXenoTrialsHordeMinigameV213(match.hordeV180?.protocolId);
  const directedGates = minigame?.stageId === stageId;
  const baseStageId = directedGates && getXenoTrialsBossStageV179(stageId)?.motionBaseStageId;
  const baseProfile = profilesByStage.get(baseStageId);
  const profile = profilesByStage.get(stageId) || (baseProfile && { ...baseProfile, stageId });
  if (!profile) return () => null;
  let round = match.round;
  let lastEventId = match.serial;
  let observedTick = match.tick;
  let recentImpact = null;
  const degraded = new Set();

  return function observe({ presentation, paused = false, reducedMotion = false } = {}) {
    const tick = match.tick;
    const phase = getScenePhase(match, presentation);
    if (!paused) {
      if (match.round !== round || tick < observedTick) {
        round = match.round;
        recentImpact = null;
        degraded.clear();
        const start = match.events.findLast(event => event.type === 'round-start' && event.round === round);
        // Do not replay hits from a previous round or from a restored save.
        lastEventId = start?.id ?? match.serial;
      }
      for (const event of match.events) {
        if (event.id <= lastEventId) continue;
        lastEventId = event.id;
        if (phase === 'introduction' || !contactTypes.has(event.type) || tick - event.tick > 18) continue;
        const side = getContactSide(match, event, arena);
        if (!side) continue;
        recentImpact = { side, tick: event.tick, id: event.id, material: profile.material };
        if (event.type === 'guard-break' || event.type === 'hit' && event.damage >= 20) degraded.add(side);
      }
      observedTick = tick;
    }

    let opening = Number(phase === 'combat');
    if (phase === 'introduction' && presentation?.phase === 'countdown') {
      const progress = presentation.elapsedMs / presentation.durationMs;
      if (Number.isFinite(progress)) opening = clamp((progress - .45) / .5, 0, 1);
    } else if (phase === 'intermission' && !reducedMotion && Number.isFinite(match.phaseTime) && !match.hordeV180) {
      opening = clamp(match.phaseTime / 1.8, 0, 1);
    }
    const impactAge = recentImpact ? observedTick - recentImpact.tick : impactLifetime;
    const impact = phase === 'combat' && !reducedMotion && impactAge < impactLifetime
      ? { ...recentImpact, progress: impactAge / impactLifetime } : null;
    const moving = phase === 'combat' && !reducedMotion;
    const gates = directedGates ? getDirectedGates(minigame, match, phase, opening, reducedMotion) : null;
    const bypass = getXenoTrialsHangarBypassV221(match);
    const gantry = getXenoTrialsGantryConvoyV222(match);
    const grounding = getXenoTrialsGroundingDoorV223(match);
    if (gates) opening = Math.max(gates.left.opening, gates.right.opening);
    if (reducedMotion && phase === 'introduction') opening = 0;
    return {
      ...profile, round, tick: observedTick, phase, opening, moving, impact,
      ...(gates ? { gates } : {}),
      ...(bypass ? { hangarBypassV221: bypass } : {}),
      ...(gantry ? { logisticsGantriesV222: gantry.gantries } : {}),
      ...(grounding ? { reactorGroundingV223: grounding } : {}),
      reducedMotion, affectsCombat: false,
      time: moving ? observedTick / 120 + (match.config.seed % 41) * .07 : 0,
      degraded: [...degraded]
    };
  };
}

function drawFixture(ctx, view, stage, x, y, side) {
  const { time, machinery, atmosphere, moving } = view;
  const gate = view.gates?.[side];
  const opening = gate?.opening ?? view.opening;
  const damaged = view.degraded.includes(side);
  const organic = view.gate === 'membrane';
  const floorLight = damaged ? '#d9a37a' : stage.accent;
  const direction = side === 'left' ? 1 : -1;
  const width = view.material === 'stone' ? 35 : 54;
  const height = view.material === 'stone' ? 31 : 58;
  const low = view.material === 'stone';

  ctx.globalAlpha = .15;
  ctx.fillStyle = '#061019';
  ctx.fillRect(x - width / 2, y - height, width, height);
  ctx.strokeStyle = stage.accent;
  if (organic) {
    ctx.beginPath();
    ctx.ellipse(x, y - 27, 24, 31, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = stage.accent;
    ctx.beginPath();
    ctx.ellipse(x, y - 27, 21 * (1 - opening * .85), 27, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeRect(x - width / 2, y - height, width, height);
    ctx.fillStyle = stage.accent;
    if (view.gate === 'shutter' || low) {
      ctx.fillRect(x - width / 2 + 3, y - height + 3, width - 6, (height - 6) * (1 - opening));
    } else {
      const panel = (width - 6) / 2 * (1 - opening);
      ctx.fillRect(x - width / 2 + 3, y - height + 3, panel, height - 6);
      ctx.fillRect(x + width / 2 - panel - 3, y - height + 3, panel, height - 6);
    }
  }

  // The opening's indicator also provides a static, steady result cue.
  const lightAlpha = damaged ? .16 : .21 + (moving ? Math.sin(time * .8) * .05 : 0);
  ctx.globalAlpha = lightAlpha;
  ctx.fillStyle = floorLight;
  ctx.fillRect(x - 11, y - height - 9, 22, 3);
  if (gate && gate.status !== 'locked') {
    const admitting = gate.status === 'open';
    const lampCount = admitting ? 3 : 2;
    ctx.globalAlpha = .68;
    ctx.fillStyle = admitting ? stage.accent : '#f5c078';
    // Read the airlock state by the number of lamps as well as their colour.
    for (let lamp = 0; lamp < lampCount; lamp++) {
      ctx.fillRect(x - 9 + lamp * 7, y - height + 5, 4, 3);
    }
    ctx.fillStyle = floorLight;
    ctx.globalAlpha = lightAlpha;
  }
  const machineX = x + direction * (width / 2 + 10);
  ctx.strokeRect(machineX - 5, y - 12, 10, 8);
  if (moving) {
    // A vent mouth or crevice at the installation, away from the contact plane.
    ctx.globalAlpha = .085;
    for (let i = 0; i < 3; i++) {
      const shift = (time / 3 + i / 3) % 1;
      const dx = direction * shift * (atmosphere === 'dust' ? 39 : 23);
      const dy = shift * (atmosphere === 'vapor' ? 26 : 11);
      if (atmosphere === 'vapor') {
        ctx.beginPath();
        ctx.ellipse(machineX + dx, y - 8 - dy, 3 + shift * 9, 2 + shift * 4, 0, 0, Math.PI * 2);
        ctx.fill();
      } else ctx.fillRect(machineX + dx, y - 8 - dy, 2 + shift * 2, 1.5);
    }
  }

  // Distant motion remains inside the backdrop and takes no game action.
  const excursion = moving ? Math.sin(time * .32) : 0;
  ctx.globalAlpha = .10;
  const remoteX = x + direction * (53 + excursion * 17);
  const remoteY = y - 91 - (machinery === 'filament' ? excursion * 14 : 0);
  if (machinery === 'carriage') {
    ctx.fillRect(remoteX - 27, remoteY - 6, 54, 1);
    ctx.fillRect(remoteX - 9, remoteY - 6, 18, 9);
  } else if (machinery === 'filament') {
    ctx.beginPath(); ctx.ellipse(remoteX, remoteY, 4, 11, .2, 0, Math.PI * 2); ctx.fill();
  } else ctx.fillRect(remoteX - 7, remoteY, 14, machinery === 'inspection' ? 3 : 5);

  if (view.impact?.side === side) {
    const progress = view.impact.progress;
    ctx.globalAlpha = .27 * (1 - progress);
    ctx.fillStyle = view.material === 'resin' ? stage.accent : view.material === 'stone' ? '#e0c5a0' : '#e6cab1';
    for (let i = 1; i <= 4; i++) {
      const spread = progress * (i + 4) * 3;
      ctx.fillRect(machineX + direction * (i * 2 + spread), y - 14 - spread / 2, 2 + (view.material === 'metal'), 2);
    }
  }
}

function drawHangarBulkhead(ctx, view, stage, x, y) {
  const state = view.hangarBypassV221;
  const opening = view.reducedMotion && state.phase === 'opening' ? 0 : state.opening;
  const lamp = state.phase === 'locked' ? '#cf8c79' : state.phase === 'open' ? '#9ec7a3' : '#ebba74';
  const width = 144, height = 88;
  const left = x - width / 2, top = y - height;
  ctx.globalAlpha = .8;
  ctx.fillStyle = '#121e23';
  ctx.fillRect(left, top, width, height);
  ctx.globalAlpha = .45;
  ctx.strokeStyle = stage.accent;
  ctx.strokeRect(left, top, width, height);
  ctx.fillStyle = '#4c5d60';
  const panel = (height - 10) * (1 - opening);
  ctx.fillRect(left + 7, top + 5, width - 14, panel);
  ctx.fillStyle = lamp;
  ctx.globalAlpha = .7;
  if (panel > 0) ctx.fillRect(left + 7, top + 4 + panel, width - 14, 3);
  const lamps = state.phase === 'locked' ? 1 : state.phase === 'open' ? 3 : 2;
  for (let index = 0; index < lamps; index++) ctx.fillRect(x - 12 + index * 10, top - 8, 6, 3);
}

function drawLogisticsGantry(ctx, gate, reducedMotion, x, y) {
  const left = x - 59, top = y - 76;
  const opening = reducedMotion && gate.phase === 'authorized' ? 1 : gate.opening;
  const color = gate.phase === 'locked' ? '#cd9180' : gate.phase === 'inspection' ? '#ebba74' : '#9ec7a3';
  ctx.globalAlpha = .48;
  ctx.fillStyle = '#34434a';
  ctx.fillRect(left, top, 118, 9);
  ctx.fillRect(left, top + 9, 8, 67);
  ctx.fillRect(left + 110, top + 9, 8, 67);
  ctx.fillStyle = '#50616a';
  ctx.fillRect(left + 9, top + 9, 100, 63 * (1 - opening));
  ctx.globalAlpha = .72;
  ctx.fillStyle = color;
  const lamps = gate.phase === 'locked' ? 1 : gate.phase === 'inspection' ? 2 : 3;
  for (let index = 0; index < lamps; index++) ctx.fillRect(x - 13 + index * 10, top + 3, 6, 3);
}

function drawReactorShutter(ctx, gate, reducedMotion, x, y) {
  const left = x - 66, top = y - 82;
  const opening = reducedMotion && gate.phase === 'opening' ? 0 : gate.opening;
  const color = gate.phase === 'waiting' ? '#be8077' : gate.phase === 'open' ? '#a4d6bc' : '#d6b278';
  ctx.globalAlpha = .63;
  ctx.fillStyle = '#252a31';
  ctx.fillRect(left, top, 132, 82);
  ctx.strokeStyle = '#796952';
  ctx.strokeRect(left, top, 132, 82);
  const span = 56 * (1 - opening);
  ctx.fillStyle = '#585645';
  ctx.fillRect(left + 10, top + 7, span, 68);
  ctx.fillRect(left + 122 - span, top + 7, span, 68);
  ctx.globalAlpha = .77;
  ctx.fillStyle = color;
  const lamps = gate.phase === 'waiting' ? 1 : gate.phase === 'open' ? 3 : 2;
  for (let index = 0; index < lamps; index++) ctx.fillRect(x - 15 + index * 12, top - 7, 6, 3);
}

export function drawXenoTrialsStageEventsV211(ctx, stage, camera, view) {
  if (!view || view.stageId !== stage.id) return;
  const floor = clamp(camera.floor, 180, 530);
  const offset = (camera.center - 500) * .18;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, 1000, floor);
  ctx.clip();
  ctx.lineWidth = 1;
  if (view.hangarBypassV221) drawHangarBulkhead(ctx, view, stage, 737 - (camera.center - 500) * .26, floor - 52);
  view.logisticsGantriesV222?.forEach((gate, index) =>
    drawLogisticsGantry(ctx, gate, view.reducedMotion, 367 + index * 367 - (camera.center - 500) * .24, floor - 52));
  if (view.reactorGroundingV223) drawReactorShutter(ctx, view.reactorGroundingV223, view.reducedMotion,
    701 - (camera.center - 500) * .22, floor - 56);
  drawFixture(ctx, view, stage, 105 - offset, floor - 30, 'left');
  drawFixture(ctx, view, stage, 895 - offset, floor - 30, 'right');
  ctx.restore();
}
