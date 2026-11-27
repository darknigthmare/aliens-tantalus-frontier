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

export function createXenoTrialsStageEventsV211(stageId, match, arena) {
  const profile = profilesByStage.get(stageId);
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
      if (Number.isFinite(progress)) opening = reducedMotion ? 0 : clamp((progress - .45) / .5, 0, 1);
    } else if (phase === 'intermission' && !reducedMotion && Number.isFinite(match.phaseTime) && !match.hordeV180) {
      opening = clamp(match.phaseTime / 1.8, 0, 1);
    }
    const impactAge = recentImpact ? observedTick - recentImpact.tick : impactLifetime;
    const impact = phase === 'combat' && !reducedMotion && impactAge < impactLifetime
      ? { ...recentImpact, progress: impactAge / impactLifetime } : null;
    const moving = phase === 'combat' && !reducedMotion;
    return {
      ...profile, round, tick: observedTick, phase, opening, moving, impact,
      reducedMotion, affectsCombat: false,
      time: moving ? observedTick / 120 + (match.config.seed % 41) * .07 : 0,
      degraded: [...degraded]
    };
  };
}

function drawFixture(ctx, view, stage, x, y, side) {
  const { opening, time, machinery, atmosphere, moving } = view;
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
  ctx.globalAlpha = damaged ? .16 : .21 + (moving ? Math.sin(time * .8) * .05 : 0);
  ctx.fillStyle = floorLight;
  ctx.fillRect(x - 11, y - height - 9, 22, 3);
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

export function drawXenoTrialsStageEventsV211(ctx, stage, camera, view) {
  if (!view || view.stageId !== stage.id) return;
  const floor = clamp(camera.floor, 180, 530);
  const offset = (camera.center - 500) * .18;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, 1000, floor);
  ctx.clip();
  ctx.lineWidth = 1;
  drawFixture(ctx, view, stage, 105 - offset, floor - 30, 'left');
  drawFixture(ctx, view, stage, 895 - offset, floor - 30, 'right');
  ctx.restore();
}
