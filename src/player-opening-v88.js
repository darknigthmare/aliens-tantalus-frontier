// Project-authored continuation of the V84 welcome; not a recovered dialogue transcript.
export const OPENING_SCHEMA_V88 = 88;
export const OPENING_RELAY_SECONDS_V88 = 3;
export const OPENING_STEPS_V88 = Object.freeze([
  'berth', 'armory', 'qualification', 'relay', 'signal', 'manifest', 'ready', 'deployed', 'complete'
]);
export const OPENING_POSTS_V88 = Object.freeze({
  berth: Object.freeze({ roomId: 'crew-quarters', deck: 1, label: 'ATTRIBUER LA COUCHETTE' }),
  armory: Object.freeze({ roomId: 'armory', deck: 2, label: 'CONTRÔLER LA DOTATION' }),
  relay: Object.freeze({ roomId: 'reactor', deck: 3, label: 'RÉTABLIR LE RELAIS · RESTER IMMOBILE 3 S' }),
  signal: Object.freeze({ roomId: 'bridge', deck: 0, label: 'ÉCOUTER LE SIGNAL DE DÉTRESSE' }),
  manifest: Object.freeze({ roomId: 'dropship-hangar', deck: 3, label: 'CHARGER LE FRET DE SECOURS' }),
  ready: Object.freeze({ roomId: 'briefing', deck: 0, label: 'PRÉPARER LA PREMIÈRE SORTIE' })
});
export const OPENING_SIGNAL_V88 = Object.freeze([
  'Relais auxiliaire rétabli. Un appel de Port-Méridien traverse enfin les réponses automatiques : plusieurs quartiers ne répondent plus.',
  'La colonie demande des secours. Ses balises annoncent pourtant un fonctionnement normal. Echo-9 conserve les deux messages : cette contradiction devra être vérifiée sur place.',
  'Avant votre première sortie, chargez un lot de secours au hangar. Médicaments : deux trousses supplémentaires sur le terrain. Énergie : deux unités de carburant économisées au départ. Un seul lot peut embarquer.'
]);
const record = value => !!value && typeof value === 'object' && !Array.isArray(value);
const validId = value => typeof value === 'string' && /^[a-zA-Z0-9:_-]{1,160}$/.test(value);

export function createPlayerOpeningV88() {
  return { schema: OPENING_SCHEMA_V88, phase: 'berth', signalNode: 0, freight: null,
    qualificationId: null, operationId: null, completedOperationId: null, outcome: null };
}

export function normalizePlayerOpeningV88(raw) {
  // Missing markers stay missing: old campaigns are never forced through a new tutorial.
  if (!record(raw) || raw.schema !== OPENING_SCHEMA_V88 || !OPENING_STEPS_V88.includes(raw.phase)) return null;
  const index = OPENING_STEPS_V88.indexOf(raw.phase);
  const state = createPlayerOpeningV88();
  state.phase = raw.phase;
  state.signalNode = raw.phase === 'signal' ? Math.max(0, Math.min(2, Number.isInteger(raw.signalNode) ? raw.signalNode : 0)) : 0;
  if (index >= 3) {
    if (typeof raw.qualificationId !== 'string' || !/^m41a-qualification-v81:session-\d+:qualification$/.test(raw.qualificationId)) return null;
    state.qualificationId = raw.qualificationId;
  }
  if (index >= 6) {
    if (!['medical', 'energy'].includes(raw.freight)) return null;
    state.freight = raw.freight;
  }
  if (index >= 7) {
    if (!validId(raw.operationId)) return null;
    state.operationId = raw.operationId;
  }
  if (raw.phase === 'complete') {
    if (raw.completedOperationId !== raw.operationId || !['success', 'retreat'].includes(raw.outcome)) return null;
    state.completedOperationId = raw.completedOperationId;
    state.outcome = raw.outcome;
  }
  return state;
}

export function advancePlayerOpeningV88(raw, event, evidence = {}) {
  const state = normalizePlayerOpeningV88(raw);
  const fail = reason => ({ ok: false, state, reason });
  if (!state) return fail('invalid-state');
  if (evidence.onboardingComplete !== true) return fail('welcome-incomplete');
  const type = typeof event === 'string' ? event : event?.type;
  if (type === 'qualified') {
    if (state.phase !== 'qualification') return fail('phase-order');
    const receipt = evidence.qualificationId;
    if (!/^m41a-qualification-v81:session-\d+:qualification$/.test(receipt || '')
      || !evidence.qualificationReceiptIds?.includes(receipt)) return fail('qualification-required');
    state.qualificationId = receipt; state.phase = 'relay';
  } else if (type === 'deploy') {
    if (state.phase === 'deployed' && state.operationId === evidence.operationId) return { ok: true, state, reason: 'already-applied' };
    if (state.phase !== 'ready' || !validId(evidence.operationId)) return fail('phase-order');
    state.operationId = evidence.operationId; state.phase = 'deployed';
  } else if (type === 'resolve') {
    if (state.phase === 'complete' && state.completedOperationId === evidence.operationId) return { ok: true, state, reason: 'already-applied' };
    if (state.phase !== 'deployed' || state.operationId !== evidence.operationId || typeof evidence.success !== 'boolean') return fail('operation-mismatch');
    state.completedOperationId = state.operationId;
    state.outcome = evidence.success ? 'success' : 'retreat'; state.phase = 'complete';
  } else {
    const post = OPENING_POSTS_V88[state.phase];
    if (!post || evidence.roomId !== post.roomId || evidence.physicalContact !== true) return fail('physical-contact-required');
    if (type === 'berth' && state.phase === 'berth') state.phase = 'armory';
    else if (type === 'armory' && state.phase === 'armory') {
      if (!evidence.weaponIds?.includes('weapon-001-m41a-pulse-rifle')) return fail('m41a-required');
      state.phase = 'qualification';
    } else if (type === 'relay' && state.phase === 'relay') {
      if (!Number.isFinite(evidence.relaySeconds) || evidence.relaySeconds < OPENING_RELAY_SECONDS_V88) return fail('repair-incomplete');
      state.phase = 'signal';
    } else if (type === 'signal-next' && state.phase === 'signal') {
      if (event.node !== state.signalNode) return fail('stale-signal-node');
      if (state.signalNode < 2) state.signalNode += 1;
      else { state.signalNode = 0; state.phase = 'manifest'; }
    } else if (type === 'freight' && state.phase === 'manifest') {
      if (!['medical', 'energy'].includes(event.freight)) return fail('invalid-freight');
      state.freight = event.freight; state.phase = 'ready';
    } else return fail('phase-order');
  }
  return { ok: true, state, reason: 'advanced' };
}

export function getPlayerOpeningObjectiveV88(raw, onboarding) {
  const state = normalizePlayerOpeningV88(raw);
  if (!state || onboarding?.phase !== 'complete' || state.phase === 'complete') return null;
  const texts = {
    berth: 'UN LIT ET UN NOM · Pont Habitat : attribuez votre couchette dans les quartiers.',
    armory: 'DOTATION · Pont Industriel : contrôlez votre M41A au comptoir de l’armurerie.',
    qualification: 'EXERCICE · Armurerie : deux échelles vers le sas supérieur du Proving Ground. W pour monter, ESPACE pour franchir chaque palier. Puis neuf cibles, trois directions et une recharge.',
    relay: 'APPEL INTERROMPU · Pont Ingénierie : rétablissez le relais au réacteur. Restez immobile pendant la réparation.',
    signal: 'LA VOIX DE PORT-MÉRIDIEN · Pont Commandement : écoutez le message au terminal de la passerelle.',
    manifest: 'LE MANIFESTE · Ingénierie : échelles du réacteur, passerelle vers la gauche, C dans le conduit. Rejoignez le pupitre du hangar au-dessus de l’arc électrique.',
    ready: `PRÊT AU DÉPART · Fret ${state.freight === 'medical' ? 'médical' : 'énergétique'} chargé. Salle de briefing : choisissez votre première opération, puis embarquez.`,
    deployed: 'PREMIÈRE SORTIE · Votre fret a été engagé. Accomplissez l’objectif ou utilisez la retraite ; la reprise conserve votre progression.'
  };
  return { phase: state.phase, roomId: OPENING_POSTS_V88[state.phase]?.roomId || null, text: texts[state.phase] };
}

export function getOpeningDeploymentSupportV88(raw) {
  const state = normalizePlayerOpeningV88(raw);
  return state?.phase === 'ready' ? { medical: state.freight === 'medical', energy: state.freight === 'energy' }
    : { medical: false, energy: false };
}

export function applyOpeningMissionSuppliesV88(engine, operation, resumed) {
  // The ordinary inventory snapshot owns consumption on resume, not a second supply ledger.
  if (resumed || operation?.flags?.['v88-opening-medical'] !== true || !engine.inventory
    || (engine.openingFreightOperationV88 === operation.id && engine.openingFreightInventoryV88 === engine.inventory)) return false;
  engine.inventory.medkits += 2;
  engine.openingFreightOperationV88 = operation.id;
  engine.openingFreightInventoryV88 = engine.inventory;
  return true;
}
