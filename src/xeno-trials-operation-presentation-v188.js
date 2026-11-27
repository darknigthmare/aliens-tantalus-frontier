import { getXenoTrialsOperationV188, getXenoTrialsOperationViewV188, XENO_TRIALS_OPERATION_LIMITS_V188 } from './xeno-trials-operations-v188.js';
import { getXenoTrialsBodyBoundsV105, XENO_TRIALS_ARENA_V105 } from './xeno-trials-geometry-v105.js';
import { drawXenoTrialsExtractionV203 } from './xeno-trials-extraction-presentation-v203.js';
import { drawXenoTrialsPurgeV204, getXenoTrialsPurgeTelemetryV204 } from './xeno-trials-purge-presentation-v204.js';

const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const kinds = Object.freeze({ escort: 'ESCORTE', relay: 'RELAIS', purge: 'PURGE', beacon: 'BALISE', extraction: 'EXTRACTION' });
const bypassPhases = Object.freeze({ locked: 'POSTE VERROUILLÉ', ready: 'DÉRIVATION DISPONIBLE',
  opening: 'VOLET EN OUVERTURE', open: 'VOLET OUVERT' });

export function getXenoTrialsOperationHudV188(match) {
  const view = getXenoTrialsOperationViewV188(match);
  if (!view) return null;
  let phase = view.status === 'completed' ? 'OBJECTIF ATTEINT' : view.status === 'failed' ? 'OBJECTIF PERDU'
    : view.carrying >= 0 ? 'CAISSON EN TRANSIT' : 'OPÉRATION ACTIVE';
  const battery = view.batteryV219;
  if (battery) {
    if (battery.depleted) phase = 'BATTERIE ÉPUISÉE';
    else if (view.status === 'active') {
      const seconds = Math.ceil(battery.remainingTicks / XENO_TRIALS_OPERATION_LIMITS_V188.ticksPerSecond);
      phase = battery.armed ? `BATTERIE · ${seconds} s` : 'BATTERIE EN VEILLE';
    }
  }
  const relief = view.status === 'active' ? view.reliefV220 : null;
  if (relief?.phase === 'combat') phase = 'POSTES VERROUILLÉS';
  if (relief?.phase === 'secured') phase = 'SECTEUR SÉCURISÉ';
  if (relief?.phase === 'relief') {
    const tenths = Math.ceil(relief.remainingTicks * 10 / XENO_TRIALS_OPERATION_LIMITS_V188.ticksPerSecond);
    phase = `RELÈVE · ${(tenths / 10).toFixed(1).replace('.', ',')} s`;
  }
  const bypass = view.status === 'active' ? view.bypassV221 : null;
  if (bypass) phase = bypassPhases[bypass.phase];
  const player = match.fighters?.[0], target = view.status === 'active' ? view.target : null;
  const body = player ? getXenoTrialsBodyBoundsV105(player) : null;
  let instruction = view.status === 'completed' ? 'Objectifs validés.' : view.status === 'failed' ? 'Évaluation interrompue.' : view.instruction;
  let beaconWindow = null;
  let extractionWorkV203 = null;
  const purgeV204 = getXenoTrialsPurgeTelemetryV204(match, view, XENO_TRIALS_ARENA_V105);
  if (target && body) {
    const contact = player.y === 0 && body.left <= target.x + target.radius && body.right >= target.x - target.radius;
    const label = contact ? target.label : target.x < body.center ? `← ${target.label}` : `${target.label} →`;
    if (view.kind === 'beacon') {
      const open = target.windowOpen;
      const phase = open ? 'FENÊTRE VERTE' : 'FENÊTRE FERMÉE';
      const seconds = Math.ceil(target.windowRemainingTicks / XENO_TRIALS_OPERATION_LIMITS_V188.ticksPerSecond);
      instruction = `${phase} · ${label}${contact && open ? ' · MAINTENEZ INTERAGIR' : ''}`;
      beaconWindow = { id: target.id, open, contact, remainingTicks: target.windowRemainingTicks, seconds };
    } else {
      instruction = contact ? `${label} · MAINTENEZ INTERAGIR` : label;
      if (contact && view.isolationV212) instruction += ` · ${Math.floor(target.progress * 100 / target.requiredTicks)} %`;
      if (view.relayPressureV218) {
        if (target.contested) instruction = `${label} · PÉRIMÈTRE CONTESTÉ`;
        else if (contact) instruction += ` · ${Math.floor(target.progress * 100 / target.requiredTicks)} %`;
      }
      if (relief && contact) {
        instruction = relief.open ? `${instruction} · ${Math.floor(target.progress * 100 / target.requiredTicks)} %`
          : `${label} · PRÉPAREZ LA RELÈVE`;
      }
      if (bypass) {
        if (bypass.phase === 'locked') instruction = `${label} · NEUTRALISEZ LE VIGILE`;
        else if (bypass.phase === 'opening') instruction = `${label} · VOLET EN OUVERTURE · ${Math.floor(bypass.opening * 100)} %`;
        else if (contact) instruction += ` · ${Math.floor(target.progress * 100 / target.requiredTicks)} %`;
      }
      if (view.kind === 'extraction' || purgeV204) {
        const work = { id: target.id, kind: target.kind, contact, progress: target.progress,
          requiredTicks: target.requiredTicks, percent: Math.floor(target.progress * 100 / target.requiredTicks) };
        if (purgeV204) purgeV204.work = work;
        else extractionWorkV203 = work;
      }
    }
  }
  return { ...view, phase, orders: view.instruction, instruction, beaconWindow, extractionWorkV203, purgeV204 };
}

/** A briefing describes the authored physical objective. It never changes a
 * ticket, a clock, health, or the operation state painted by the runtime. */
export function getXenoTrialsOperationBriefingV188(activity) {
  if (activity?.branch !== 'operations') return null;
  const operation = getXenoTrialsOperationV188(activity.id);
  if (!operation) return null;
  return Object.freeze({ operation: true, title: operation.title,
    waves: activity.waveCount, total: activity.totalEnemies,
    minimum: activity.enemyHpMin, maximum: activity.enemyHpMax, simultaneous: activity.maxConcurrent,
    waveLabel: operation.isolationV212 ? 'ISOLEMENT' : kinds[operation.kind] || 'OPÉRATION', populationLabel: 'OBJECTIF PHYSIQUE',
    healthLabel: `${activity.enemyHpMin}–${activity.enemyHpMax} PV`,
    pressureLabel: 'INTERACTION AU SOL · E / L3 / TACTILE',
    orders: `${operation.description} Maintenez E, L3 ou INTERAGIR au contact de la cible indiquée. La réussite dépend de l’objectif, même si des contacts restent actifs.` });
}

/** Objects share combat world coordinates. Rear props and floor-only front
 * markings cannot change hitboxes or conceal a standing combatant. */
export function drawXenoTrialsOperationV188(ctx, match, arena, { plane = 'rear', reducedMotion = false } = {}) {
  const view = getXenoTrialsOperationViewV188(match);
  if (!view) return null;
  const floor = arena.floor, beacons = [];
  const battery = view.status === 'active' ? view.batteryV219 : null;
  const relief = view.status === 'active' ? view.reliefV220 : null;
  const bypass = view.status === 'active' ? view.bypassV221 : null;
  const extraction = view.kind === 'extraction';
  if (extraction && plane === 'rear') {
    return { id: view.id, plane, entities: view.entities.length,
      extraction: drawXenoTrialsExtractionV203(ctx, match, view, floor, reducedMotion) };
  }
  if (view.kind === 'purge' && plane === 'rear') {
    return { id: view.id, plane, entities: view.entities.length,
      purge: drawXenoTrialsPurgeV204(ctx, match, view, arena, reducedMotion) };
  }
  ctx.save();
  for (const entity of view.entities) {
    if (!Number.isFinite(entity.x) || !Number.isFinite(entity.radius)) continue;
    if (entity.kind === 'supply' && (entity.carried || entity.delivered)) continue;
    const access = !entity.active ? null : relief ? relief.open : bypass ? bypass.phase === 'ready' || bypass.phase === 'open' : null;
    const color = entity.contested ? '#ed997c' : entity.kind === 'beacon' ? beaconColor(entity)
      : entity.completed || access ? '#91bd8c' : entity.active ? '#ecd08c' : '#8a9d98';
    const x = entity.x, width = entity.kind === 'cargo' ? 84 : entity.kind === 'depot' || entity.kind === 'exit' ? 100 : 42;
    ctx.strokeStyle = color; ctx.fillStyle = '#142124'; ctx.lineWidth = 2;
    if (plane === 'front') {
      ctx.globalAlpha = entity.active ? .95 : .55;
      if (entity.active && entity.pressureRadius) {
        const left = x - entity.pressureRadius, right = x + entity.pressureRadius;
        ctx.beginPath(); ctx.moveTo(left, floor + 7); ctx.lineTo(left, floor + 3);
        ctx.lineTo(right, floor + 3); ctx.lineTo(right, floor + 7); ctx.stroke();
      }
      ctx.beginPath(); ctx.moveTo(x - entity.radius, floor + 9); ctx.lineTo(x + entity.radius, floor + 9); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, floor + 9); ctx.lineTo(x - 6, floor + 17); ctx.lineTo(x + 6, floor + 17); ctx.closePath();
      ctx.fillStyle = color; ctx.fill();
      if (entity.active) {
        ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
        const status = entity.contested ? 'CONTESTÉ' : access ? 'OUVERT' : access === false ? 'VERROUILLÉ' : '';
        ctx.fillText(status ? `${entity.label} · ${status}` : entity.label, x, floor + 34, 210);
      }
      continue;
    }
    if (entity.kind === 'beacon' && view.status === 'active') beacons.push(drawBeaconWindow(ctx, entity, floor, reducedMotion));
    ctx.globalAlpha = entity.completed ? .6 : 1;
    const height = entity.kind === 'terminal' || entity.kind === 'beacon' ? 62 : 32;
    ctx.fillRect(x - width / 2, floor - height, width, height - 2);
    ctx.strokeRect(x - width / 2, floor - height, width, height - 2);
    ctx.fillStyle = color;
    if (entity.kind === 'cargo' || entity.kind === 'supply') {
      ctx.fillRect(x - width / 2 + 7, floor - height + 6, 5, height - 14);
      ctx.fillRect(x + width / 2 - 12, floor - height + 6, 5, height - 14);
    } else {
      ctx.fillRect(x - width / 2 + 7, floor - height + 8, width - 14, 9);
      ctx.fillStyle = entity.contested || access === false || entity.windowOpen === false && !entity.completed ? '#bd7658' : '#a9d79b';
      ctx.fillRect(x - 4, floor - height + 27, 8, 8);
    }
    if (entity.requiredTicks > 0 && entity.progress > 0) {
      const fraction = clamp(entity.progress / entity.requiredTicks, 0, 1);
      ctx.fillStyle = '#071015'; ctx.fillRect(x - 28, floor - height - 10, 56, 5);
      ctx.fillStyle = color; ctx.fillRect(x - 28, floor - height - 10, 56 * fraction, 5);
    }
    if (battery) {
      const { armed, remainingTicks, durationTicks } = battery;
      const cells = Math.ceil(5 * remainingTicks / durationTicks);
      const chargeColor = armed ? cells < 3 ? '#e5aa73' : '#99dcab' : '#6b8588';
      for (let index = 0; index < 5; index++) {
        ctx.fillStyle = index < cells ? chargeColor : '#27383c';
        ctx.fillRect(x - 16 + index * 7, floor - 12, 5, 4);
      }
    }
  }
  ctx.restore();
  return { id: view.id, plane, entities: view.entities.length, ...(beacons.length ? { beacons } : {}) };
}

function beaconColor(entity) {
  return entity.completed || entity.windowOpen ? '#99dcab' : '#e5aa73';
}

/** The shutter surrounds the receiver on the real objective anchor. Its beam
 * occupies only the clipped rear plane, and completed receivers are steady.
 */
function drawBeaconWindow(ctx, entity, floor, reducedMotion) {
  const x = entity.x, y = floor - 62;
  const completed = entity.completed, open = entity.windowOpen && !completed;
  const color = beaconColor(entity);
  const phase = completed ? 'synchronized' : open ? 'open' : 'closed';
  const transition = Math.min(entity.windowTicks - entity.windowRemainingTicks + 1, entity.windowRemainingTicks, 18) / 18;
  let opening = .16;
  if (completed) opening = .64;
  else if (open) opening = reducedMotion ? .88 : .25 + transition * .63;
  const clip = { x: x - 72, y: y - 78, width: 144, height: 78 };

  ctx.save();
  ctx.beginPath(); ctx.rect(clip.x, clip.y, clip.width, clip.height); ctx.clip();
  if (open) {
    ctx.globalAlpha = .18; ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(x - 8, y - 16); ctx.lineTo(x - 56 * opening, y - 70);
    ctx.lineTo(x + 56 * opening, y - 70); ctx.lineTo(x + 8, y - 16); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = .38; ctx.strokeStyle = color;
    ctx.beginPath(); ctx.moveTo(x - 54 * opening, y - 62); ctx.lineTo(x + 54 * opening, y - 62); ctx.stroke();
  }
  ctx.globalAlpha = .98; ctx.fillStyle = '#132126'; ctx.strokeStyle = '#687a7b';
  ctx.fillRect(x - 23, y - 20, 46, 20); ctx.strokeRect(x - 23, y - 20, 46, 20);
  ctx.fillStyle = color; ctx.fillRect(x - 18 * opening, y - 15, 36 * opening, 10);
  ctx.restore();
  return { id: entity.id, x, phase, opening, remainingTicks: completed ? 0 : entity.windowRemainingTicks, clip, reducedMotion };
}
