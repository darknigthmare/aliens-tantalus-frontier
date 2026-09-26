// Project-authored realization of the source's "interrupted exercise", not recovered dialogue.
export const OPENING_EXERCISE_SECONDS_V89 = 3;
const phases = ['pending', 'console', 'return', 'complete'];
const validSession = value => typeof value === 'string' && /^m41a-qualification-v81:session-[1-9]\d{0,5}$/.test(value);

export function createOpeningExerciseV89() { return { schema: 89, phase: 'pending', sessionId: null }; }
export function normalizeOpeningExerciseV89(raw) {
  if (!raw || raw.schema !== 89 || !phases.includes(raw.phase)) return null;
  if (raw.phase !== 'pending' && !validSession(raw.sessionId)) return null;
  return { schema: 89, phase: raw.phase, sessionId: raw.phase === 'pending' ? null : raw.sessionId };
}

export function advanceOpeningExerciseV89(raw, event, proof = {}) {
  const state = normalizeOpeningExerciseV89(raw);
  const fail = reason => ({ ok: false, state, reason });
  if (!state || proof.onboardingComplete !== true || proof.openingPhase !== 'qualification') return fail('inactive-opening');
  const session = proof.session;
  if (!session || !validSession(session.sessionId) || proof.inProvingGround !== true) return fail('wrong-session');
  if (event === 'restart') {
    if (session.phase !== 'armed' || state.phase === 'complete') return fail('phase-order');
    return { ok: true, state: createOpeningExerciseV89(), reason: 'restarted' };
  }
  if (session.phase !== 'active' || session.hits < 3) return fail('three-real-hits-required');
  if (event === 'interrupt') {
    if (state.phase === 'complete' || (state.phase !== 'pending' && state.sessionId === session.sessionId)) return fail('phase-order');
    return { ok: true, state: { schema: 89, phase: 'console', sessionId: session.sessionId }, reason: 'interrupted' };
  }
  if (state.sessionId !== session.sessionId) return fail('stale-session');
  if (event === 'repair' && state.phase === 'console') {
    if (proof.consoleContact !== true || !Number.isFinite(proof.repairSeconds) || proof.repairSeconds < OPENING_EXERCISE_SECONDS_V89) return fail('physical-repair-required');
    return { ok: true, state: { ...state, phase: 'return' }, reason: 'link-restored' };
  }
  if (event === 'resume' && state.phase === 'return' && proof.firingPadContact === true) {
    return { ok: true, state: { ...state, phase: 'complete' }, reason: 'resumed' };
  }
  return fail('phase-order');
}

export function getOpeningExerciseObjectiveV89(raw, opening, onboarding) {
  const state = normalizeOpeningExerciseV89(raw);
  if (!state || state.phase === 'complete' || opening?.phase !== 'qualification' || onboarding?.phase !== 'complete') return null;
  const text = state.phase === 'console'
    ? 'EXERCICE INTERROMPU · Liaison prioritaire perdue. Descendez de la passerelle par son échelle et rejoignez la console à gauche. E : rétablir, immobile 3 s. Cibles et chrono sont suspendus.'
    : state.phase === 'return'
      ? 'LIAISON RÉTABLIE · Remontez par l’échelle jusqu’au pas de tir. E : reprendre les cibles restantes. Vos tirs et munitions sont conservés.'
      : 'EXERCICE · Armurerie : deux échelles (W, puis ESPACE au palier) vers le Proving Ground. Armez la console puis rejoignez le pas de tir : neuf cibles, trois directions et une recharge.';
  return { phase: state.phase, roomId: 'proving-ground', text };
}
