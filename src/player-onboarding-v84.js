// Original Tantalus Frontier dialogue, not a franchise transcript or medical simulation.
export const PLAYER_ONBOARDING_SCHEMA_V84 = 84;
const PLAYER_ID = 'player-echo9';
const CANON_STATUS = 'project-fiction-not-franchise-canon';
const PROVENANCE = 'tantalus-frontier-project-authored-v84';
const PHASES = ['wake', 'medical', 'briefing', 'complete'];
const EVENT_ORDER = Object.freeze([
  'wake-confirmed', 'medical-next:0', 'medical-next:1', 'medical-complete',
  'briefing-next:0', 'briefing-next:1', 'briefing-complete'
]);
const EVENT_TYPES = new Set(['wake-confirmed', 'medical-next', 'medical-complete', 'briefing-next', 'briefing-complete']);
const isRecord = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const hasControl = (value) => /[\u0000-\u001f\u007f-\u009f]/u.test(value);
const commandLike = (value) => /^(?:sudo|powershell|pwsh|cmd|bash|sh|zsh|python|python3|node|curl|wget|invoke-expression|invoke-webrequest|iex|remove-item|start-process)(?: |$)/i.test(value)
  || /^(?:rm|del|erase|format|chmod|chown|git|npm|npx|net|sc|reg) +-/i.test(value);
const characterCount = (value) => Array.from(value).length;

function freezeDeep(value) {
  for (const child of Object.values(value)) if (child && typeof child === 'object') freezeDeep(child);
  return Object.freeze(value);
}

function dialogue(title, roomId, speaker, lines) {
  return { title, roomId, speaker, lines, provenance: PROVENANCE, canonStatus: CANON_STATUS, isTranscript: false };
}

export const ONBOARDING_DIALOGUES_V84 = freezeDeep({
  wake: dialogue('Relève Echo-9', 'cryo-bay', { crewId: null, name: 'Système du Tantalus', role: 'journal de bord' }, [
    'Tantalus. Relève Echo-9. Le poste de cryostase attend votre confirmation de réveil. DAVID-8R vous attend dans la baie cryogénique.'
  ]),
  // "medical" is the persisted phase ID, not a diagnosis, heal or fitness clearance.
  medical: dialogue('Accueil après cryostase', 'cryo-bay', { crewId: 'crew-10-david-8r', name: 'DAVID-8R', role: 'renseignement synthétique' }, [
    'DAVID-8R. Vous êtes à bord du Tantalus, dans la baie cryogénique. La relève Echo-9 reprend son service auprès des Marines coloniaux.',
    'Je peux vous orienter, pas établir votre état médical. Si vous ressentez un malaise, rejoignez Noor Okafor au bloc médical, pont 1.',
    'Lorsque vous êtes prêt, rejoignez Tamsin Velez dans la salle de briefing, sur ce même pont. Elle vous donnera les consignes avant le départ.'
  ]),
  briefing: dialogue('Consignes de la relève', 'briefing', { crewId: 'crew-02-tamsin-velez', name: 'Tamsin Velez', role: 'sergente, préparation tactique' }, [
    'Velez. Vous rejoignez Echo-9 à bord du Tantalus. Avant une sortie avec les Marines coloniaux, on identifie l’objectif et la voie de retour.',
    'Un tracker signale un contact, pas une identité. Confirmez ce qu’il y a devant et derrière votre ligne de tir. Vérifiez votre dotation avec l’armurerie avant l’embarquement.',
    'Le point d’accueil est terminé. Consultez la passerelle pour la prochaine opération. L’armurerie et le hangar sont vos postes de préparation ; gardez les coursives dégagées.'
  ])
});

export function validatePlayerIdentityV84(raw) {
  const input = isRecord(raw) ? raw : {};
  const errors = {};
  const rawName = typeof input.name === 'string' ? input.name : '';
  const rawCallsign = typeof input.callsign === 'string' ? input.callsign : '';
  const name = rawName.normalize('NFC').replace(/[’‘]/gu, "'").replace(/[‐‑]/gu, '-').replace(/\s+/gu, ' ').trim();
  const callsign = rawCallsign.trim().toUpperCase();
  if (rawName.length > 256 || hasControl(rawName) || characterCount(name) < 2 || characterCount(name) > 40
    || !/^[\p{L}\p{M}\p{N} '\-]+$/u.test(name) || !/[\p{L}\p{N}]/u.test(name) || commandLike(name)) {
    errors.name = 'Le nom doit contenir 2 à 40 caractères : lettres, chiffres, espaces, apostrophes ou traits d’union, sans commande ni balisage.';
  } else {
    const reservedKey = name.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[ '\-]/g, '');
    if (reservedKey === 'maravega') errors.name = 'Mara Vega est un PNJ de l’équipage. Choisissez une identité distincte pour le joueur.';
  }
  // Check the source alphabet too: uppercasing must not turn Unicode lookalikes into ASCII.
  if (rawCallsign.length > 256 || hasControl(rawCallsign) || !/^[A-Za-z0-9-]+$/.test(rawCallsign.trim())
    || callsign.length < 2 || callsign.length > 16 || !/[A-Z0-9]/.test(callsign) || commandLike(callsign)) {
    errors.callsign = 'L’indicatif doit contenir 2 à 16 lettres ASCII, chiffres ou traits d’union.';
  }
  if (Object.keys(errors).length) return { ok: false, identity: null, errors };
  return { ok: true, identity: {
    id: PLAYER_ID, schema: PLAYER_ONBOARDING_SCHEMA_V84, name, callsign, canonStatus: CANON_STATUS
  }, errors };
}

export function createPlayerOnboardingV84(identity) {
  const result = validatePlayerIdentityV84(identity);
  if (!result.ok) return null;
  return { schema: PLAYER_ONBOARDING_SCHEMA_V84, identity: result.identity, phase: 'wake', dialogueNode: 0, choices: [], completedEvents: [] };
}

function progressIndex(state) {
  if (state.phase === 'complete') return EVENT_ORDER.length;
  if (state.phase === 'briefing') return 4 + state.dialogueNode;
  if (state.phase === 'medical') return 1 + state.dialogueNode;
  return 0;
}

export function normalizePlayerOnboardingV84(raw) {
  // No marker, old/future schema, or unknown phase: never invent a new wake-up for an old save.
  if (!isRecord(raw) || raw.schema !== PLAYER_ONBOARDING_SCHEMA_V84 || !PHASES.includes(raw.phase)
    || !isRecord(raw.identity) || raw.identity.id !== PLAYER_ID || raw.identity.schema !== PLAYER_ONBOARDING_SCHEMA_V84
    || raw.identity.canonStatus !== CANON_STATUS) return null;
  const validation = validatePlayerIdentityV84(raw.identity);
  if (!validation.ok) return null;
  const dialogueNode = raw.phase === 'medical' || raw.phase === 'briefing'
    ? Math.max(0, Math.min(2, Number.isFinite(raw.dialogueNode) ? Math.floor(raw.dialogueNode) : 0)) : 0;
  const normalized = { schema: PLAYER_ONBOARDING_SCHEMA_V84, identity: validation.identity, phase: raw.phase, dialogueNode };
  // Phase + node own progress. A forged future event must not skip the current dialogue.
  const completedEvents = EVENT_ORDER.slice(0, progressIndex(normalized));
  // Choices record acknowledgements only; no invented branches, stats or inventory rewards.
  const choices = Array.isArray(raw.choices)
    ? [...new Set(raw.choices.slice(0, 64).filter((choice) => typeof choice === 'string' && completedEvents.includes(choice)))] : [];
  return { ...normalized, choices, completedEvents };
}

export function advancePlayerOnboardingV84(rawState, event) {
  const state = normalizePlayerOnboardingV84(rawState);
  if (!state) return { ok: false, state: null, reason: 'invalid-state' };
  const type = typeof event === 'string' ? event : isRecord(event) ? event.type : null;
  if (!EVENT_TYPES.has(type)) return { ok: false, state, reason: 'unknown-event' };
  const isNext = type.endsWith('-next');
  const suppliedNode = isRecord(event) ? event.dialogueNode : undefined;
  // Node-stamped events are required for Next: a repeated click cannot consume two lines.
  if (isNext && suppliedNode === undefined) return { ok: false, state, reason: 'dialogue-node-required' };
  if (suppliedNode !== undefined && (!Number.isInteger(suppliedNode) || suppliedNode < 0 || suppliedNode > 2)) {
    return { ok: false, state, reason: 'invalid-dialogue-node' };
  }
  const key = isNext ? `${type}:${suppliedNode}` : type;
  if (state.completedEvents.includes(key)) return { ok: true, state, reason: 'already-completed' };
  const requiredPhase = type === 'wake-confirmed' ? 'wake' : type.startsWith('medical-') ? 'medical' : 'briefing';
  if (state.phase !== requiredPhase) return { ok: false, state, reason: 'phase-order' };
  if (suppliedNode !== undefined && suppliedNode !== state.dialogueNode) return { ok: false, state, reason: 'stale-dialogue-node' };
  if (isNext) {
    if (state.dialogueNode >= 2) return { ok: false, state, reason: 'dialogue-complete' };
    state.dialogueNode += 1;
  } else if (type === 'wake-confirmed') {
    state.phase = 'medical';
    state.dialogueNode = 0;
  } else {
    if (state.dialogueNode !== 2) return { ok: false, state, reason: 'dialogue-incomplete' };
    state.phase = requiredPhase === 'medical' ? 'briefing' : 'complete';
    state.dialogueNode = 0;
  }
  if (!state.choices.includes(key)) state.choices.push(key);
  state.completedEvents = EVENT_ORDER.slice(0, progressIndex(state));
  return { ok: true, state, reason: 'advanced' };
}

export function getPlayerOnboardingObjectiveV84(rawState) {
  const state = normalizePlayerOnboardingV84(rawState);
  if (!state) return null;
  const texts = {
    wake: 'Confirmez votre réveil dans la baie cryogénique du Tantalus.',
    medical: 'Écoutez les consignes de DAVID-8R dans la baie cryogénique.',
    briefing: 'Rejoignez Tamsin Velez en salle de briefing et écoutez ses consignes.',
    complete: 'Accueil terminé. Rejoignez l’équipage du Tantalus.'
  };
  const dialogue = ONBOARDING_DIALOGUES_V84[state.phase];
  return {
    id: `player-onboarding-v84-${state.phase}`, phase: state.phase, roomId: dialogue?.roomId || null,
    crewId: dialogue?.speaker.crewId || null, text: texts[state.phase], completed: state.phase === 'complete'
  };
}
