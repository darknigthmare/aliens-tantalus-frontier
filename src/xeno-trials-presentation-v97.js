// Port of the presentation contract inspected in Yautja/The Pit V51:
// 1200 ms per fighter, 3000 ms countdown, 650 ms fight signal. No save ownership.
export const XENO_PRESENTATION_V97 = Object.freeze({ introMs: 1200, countdownMs: 3000, fightMs: 650, maxStepMs: 100 });
export function createXenoPresentationV97(round = 1) {
  return { phase: round === 1 ? 'intro-player' : 'countdown', elapsedMs: 0, round };
}
export function getXenoPresentationViewV97(state) {
  const durations = { 'intro-player': 1200, 'intro-opponent': 1200, countdown: 3000, fight: 650, active: 0 };
  return { ...state, durationMs: durations[state.phase], blocksSimulation: !['fight', 'active'].includes(state.phase),
    fighterSlot: state.phase === 'intro-player' ? 0 : state.phase === 'intro-opponent' ? 1 : null,
    countdown: state.phase === 'countdown' ? Math.max(1, 3 - Math.floor(state.elapsedMs / 1000)) : null };
}
export function advanceXenoPresentationV97(state, elapsedMs, frozen = false) {
  if (frozen || !Number.isFinite(elapsedMs) || elapsedMs <= 0 || state.phase === 'active') return state;
  const view = getXenoPresentationViewV97(state);
  const elapsed = Math.min(view.durationMs, state.elapsedMs + Math.min(100, elapsedMs));
  if (elapsed < view.durationMs) return { ...state, elapsedMs: elapsed };
  return { ...state, elapsedMs: 0, phase: { 'intro-player': 'intro-opponent', 'intro-opponent': 'countdown', countdown: 'fight', fight: 'active' }[state.phase] };
}
