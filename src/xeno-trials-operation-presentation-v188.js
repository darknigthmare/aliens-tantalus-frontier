import { getXenoTrialsOperationV188, getXenoTrialsOperationViewV188 } from './xeno-trials-operations-v188.js';
import { getXenoTrialsBodyBoundsV105 } from './xeno-trials-geometry-v105.js';

const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const kinds = Object.freeze({ escort: 'ESCORTE', relay: 'RELAIS', purge: 'PURGE', beacon: 'BALISE', extraction: 'EXTRACTION' });

export function getXenoTrialsOperationHudV188(match) {
  const view = getXenoTrialsOperationViewV188(match);
  if (!view) return null;
  const phase = view.status === 'completed' ? 'OBJECTIF ATTEINT' : view.status === 'failed' ? 'OBJECTIF PERDU'
    : view.carrying >= 0 ? 'CAISSON EN TRANSIT' : 'OPÉRATION ACTIVE';
  const player = match.fighters?.[0], target = view.status === 'active' ? view.target : null;
  const body = player ? getXenoTrialsBodyBoundsV105(player) : null;
  let instruction = view.status === 'completed' ? 'Objectifs validés.' : view.status === 'failed' ? 'Évaluation interrompue.' : view.instruction;
  if (target && body) {
    const contact = player.y === 0 && body.left <= target.x + target.radius && body.right >= target.x - target.radius;
    instruction = contact ? `${target.label} · MAINTENEZ INTERAGIR` : target.x < body.center ? `← ${target.label}` : `${target.label} →`;
  }
  return { ...view, phase, orders: view.instruction, instruction };
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
    waveLabel: kinds[operation.kind] || 'OPÉRATION', populationLabel: 'OBJECTIF PHYSIQUE',
    healthLabel: `${activity.enemyHpMin}–${activity.enemyHpMax} PV`,
    pressureLabel: 'INTERACTION AU SOL · E / L3 / TACTILE',
    orders: `${operation.description} Maintenez E, L3 ou INTERAGIR au contact de la cible indiquée. La réussite dépend de l’objectif, même si des contacts restent actifs.` });
}

/** Objects share combat world coordinates. Rear props and floor-only front
 * markings cannot change hitboxes or conceal a standing combatant. */
export function drawXenoTrialsOperationV188(ctx, match, arena, { plane = 'rear' } = {}) {
  const view = getXenoTrialsOperationViewV188(match);
  if (!view) return null;
  const floor = arena.floor;
  ctx.save();
  for (const entity of view.entities) {
    if (!Number.isFinite(entity.x) || !Number.isFinite(entity.radius)) continue;
    const color = entity.completed ? '#91bd8c' : entity.active ? '#ecd08c' : '#8a9d98';
    const x = entity.x, width = entity.kind === 'cargo' ? 84 : entity.kind === 'depot' || entity.kind === 'exit' ? 100 : 42;
    ctx.strokeStyle = color; ctx.fillStyle = '#142124'; ctx.lineWidth = 2;
    if (plane === 'front') {
      ctx.globalAlpha = entity.active ? .95 : .55;
      ctx.beginPath(); ctx.moveTo(x - entity.radius, floor + 9); ctx.lineTo(x + entity.radius, floor + 9); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, floor + 9); ctx.lineTo(x - 6, floor + 17); ctx.lineTo(x + 6, floor + 17); ctx.closePath();
      ctx.fillStyle = color; ctx.fill();
      if (entity.active) {
        ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
        ctx.fillText(entity.label, x, floor + 34, 210);
      }
      continue;
    }
    ctx.globalAlpha = entity.completed ? .6 : 1;
    const height = entity.kind === 'terminal' || entity.kind === 'beacon' ? 62 : 32;
    ctx.fillRect(x - width / 2, floor - height, width, height - 2);
    ctx.strokeRect(x - width / 2, floor - height, width, height - 2);
    ctx.fillStyle = color;
    if (entity.kind === 'cargo' || entity.kind === 'supply') {
      ctx.fillRect(x - width / 2 + 7, floor - height + 6, 5, height - 14);
      ctx.fillRect(x + width / 2 - 12, floor - height + 6, 5, height - 14);
    } else if (entity.kind === 'vent') {
      for (let offset = -12; offset <= 12; offset += 8) ctx.fillRect(x + offset, floor - 25, 3, 18);
    } else {
      ctx.fillRect(x - width / 2 + 7, floor - height + 8, width - 14, 9);
      ctx.fillStyle = entity.windowOpen === false ? '#bd7658' : '#a9d79b';
      ctx.fillRect(x - 4, floor - height + 27, 8, 8);
    }
    if (entity.requiredTicks > 0 && entity.progress > 0) {
      const fraction = clamp(entity.progress / entity.requiredTicks, 0, 1);
      ctx.fillStyle = '#071015'; ctx.fillRect(x - 28, floor - height - 10, 56, 5);
      ctx.fillStyle = color; ctx.fillRect(x - 28, floor - height - 10, 56 * fraction, 5);
    }
  }
  ctx.restore();
  return { id: view.id, plane, entities: view.entities.length };
}
