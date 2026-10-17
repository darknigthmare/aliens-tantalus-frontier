/** Original scenery for the six simulated arenas. Not film recreations.
 * This module reads simulation time only: no wall clock, randomness, gameplay
 * collider, damage, reward or independent animation loop is introduced.
 */
export const XENO_TRIALS_STAGE_MOTION_V147 = Object.freeze({
  'containment-deck': 'pressure-monitors', 'reactor-ring': 'coolant-cycle',
  'hive-vault': 'resin-drops', 'tantalus-bridge': 'sensor-sweep',
  'tantalus-cargo': 'suspended-cables', 'planet-surface': 'windborne-dust'
});
export function getXenoTrialsStageMotionV147(stageId, tick = 0, reducedMotion = false) {
  const kind = Object.hasOwn(XENO_TRIALS_STAGE_MOTION_V147, stageId) ? XENO_TRIALS_STAGE_MOTION_V147[stageId] : null;
  const time = reducedMotion || !Number.isFinite(tick) ? 0 : Math.max(0, tick) / 120;
  return Object.freeze({ stageId, kind, time, reducedMotion: reducedMotion === true, affectsCombat: false });
}
/** Paint before the fighters. All details stay behind the gameplay plane and
 * above the floor; no flashing full-screen lights or solid foreground panels.
 */
export function drawXenoTrialsStageMotionV147(ctx, stage, camera, tick = 0, reducedMotion = false) {
  const state = getXenoTrialsStageMotionV147(stage.id, tick, reducedMotion);
  if (!state.kind) return state;
  const t = state.time, floor = camera.floor, offset = (camera.center - 500) * .12;
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 1000, floor); ctx.clip();
  ctx.strokeStyle = stage.accent; ctx.fillStyle = stage.accent; ctx.lineWidth = 2; ctx.globalAlpha = .22;
  switch (state.kind) {
    case 'pressure-monitors':
      for (let i = 0; i < 4; i++) {
        const x = 80 + i * 260 - offset;
        ctx.strokeRect(x, floor * .32, 78, 42);
        for (let bar = 0; bar < 5; bar++) {
          const height = 5 + (1 + Math.sin(t * .65 + i + bar)) * 11;
          ctx.fillRect(x + 8 + bar * 13, floor * .32 + 35 - height, 7, height);
        }
      }
      break;
    case 'coolant-cycle':
      for (let i = 0; i < 3; i++) {
        const x = 110 + i * 380 - offset, y = floor * .42, radius = 38;
        ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.stroke();
        for (let n = 0; n < 4; n++) {
          const angle = t * .28 + n * Math.PI / 2;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(angle) * radius * .85, y + Math.sin(angle) * radius * .85); ctx.stroke();
        }
      }
      break;
    case 'resin-drops':
      for (let i = 0; i < 9; i++) {
        const x = 50 + i * 121 - offset, start = floor * (.12 + i % 3 * .03);
        const phase = ((t * .14 + i * .19) % 1);
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.quadraticCurveTo(x - 10, start * .6, x, start); ctx.stroke();
        ctx.globalAlpha = .1 + .12 * (1 - phase);
        ctx.beginPath(); ctx.ellipse(x, start + phase * floor * .45, 2, 4, 0, 0, Math.PI * 2); ctx.fill();
      }
      break;
    case 'sensor-sweep':
      for (let i = 0; i < 3; i++) {
        const x = 60 + i * 370 - offset, y = floor * .25, width = 220, height = 70;
        ctx.strokeRect(x, y, width, height);
        const sweep = ((t * .13 + i / 3) % 1) * width;
        ctx.fillRect(x + sweep, y + 2, 3, height - 4);
        for (let n = 0; n < 5; n++) ctx.fillRect(x + 20 + n * 39, y + 10 + ((n * 17 + i * 13) % 50), 3, 3);
      }
      break;
    case 'suspended-cables':
      for (let i = 0; i < 6; i++) {
        const x = 40 + i * 195 - offset, height = floor * (.15 + i % 3 * .035), sway = Math.sin(t * .55 + i) * 7;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.quadraticCurveTo(x + sway, height * .65, x + sway, height); ctx.stroke();
        ctx.fillRect(x - 8 + sway, height, 16, 5);
      }
      break;
    case 'windborne-dust':
      for (let i = 0; i < 24; i++) {
        const x = ((i * 71 + t * (9 + i % 3) - offset) % 1120 + 1120) % 1120 - 60;
        const y = floor * .28 + ((i * 41) % Math.max(1, floor * .6));
        ctx.globalAlpha = .08 + (i % 3) * .025; ctx.fillRect(x, y, 5 + i % 5, 1);
      }
      break;
  }
  ctx.restore(); return state;
}
