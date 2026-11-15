// V188 — Act V « Non viable » save state (bible §5.6-§5.8, spec 006). Pure, no
// imports: `story-campaign-v188.js` keeps it under `storyCampaignV188.act5`, an
// additive sub-field that older saves simply do not have. Everything that other
// records already hold (missions done, crew loyalty, dossier pieces, CASSIUS) is
// read from them; only what the Act itself decides is stored here.

export const ACT5_PHASES_V188 = Object.freeze(['council', 'final', 'ending', 'epilogue', 'credits', 'complete']);
export const ACT5_OPTION_IDS_V188 = Object.freeze(['transmit', 'hold', 'cede']);
export const ACT5_ENDING_IDS_V188 = Object.freeze(['relay-speaks', 'freight-first', 'living-without-proof']);
export const ACT5_ADVANTAGE_IDS_V188 = Object.freeze(['turrets', 'armour', 'window', 'route']);
export const ACT5_BRIDGE_IDS_V188 = Object.freeze(['freight', 'colonists']);
export const ACT5_STANDOFF_IDS_V188 = Object.freeze(['transmitted', 'withdrawn', 'held']);
const CREW_ID = /^crew-\d{2}-[a-z0-9-]{1,40}$/;
const MAX_TALKED = 16;

const pick = (list, value) => list.includes(value) ? value : null;
const count = (value, max) => Math.max(0, Math.min(max, Math.floor(Number(value) || 0)));

export function createAct5V188() {
  return { schema: 188, phase: null, recommended: null, decision: null, advantages: [], bridge: null, bridgeTimedOut: false,
    standoff: null, epilogueTalked: [], lockerRead: false };
}

function normalizeDecision(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const option = pick(ACT5_OPTION_IDS_V188, raw.option), ending = pick(ACT5_ENDING_IDS_V188, raw.ending);
  if (!option || !ending) return null;
  return { option, ending, decidedBy: raw.decidedBy === 'echo-9' ? 'echo-9' : 'vega', dossierCount: count(raw.dossierCount, 7),
    signerEstablished: raw.signerEstablished === true, restitution: raw.restitution === true, recoveryAttempt: raw.recoveryAttempt === true };
}

/** Returns null when the save holds nothing for Act V (older saves, before the threshold). */
export function normalizeAct5V188(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const state = createAct5V188();
  state.phase = pick(ACT5_PHASES_V188, raw.phase);
  state.recommended = pick(ACT5_OPTION_IDS_V188, raw.recommended);
  state.decision = normalizeDecision(raw.decision);
  // A phase past the council without its decision (hand-edited or truncated save) goes back to the council.
  if (state.phase && state.phase !== 'council' && !state.decision) state.phase = 'council';
  if (state.phase === 'council') state.decision = null;
  state.advantages = Array.isArray(raw.advantages) ? ACT5_ADVANTAGE_IDS_V188.filter(id => raw.advantages.includes(id)) : [];
  state.bridge = pick(ACT5_BRIDGE_IDS_V188, raw.bridge);
  state.bridgeTimedOut = Boolean(state.bridge && raw.bridgeTimedOut === true);
  state.standoff = pick(ACT5_STANDOFF_IDS_V188, raw.standoff);
  state.epilogueTalked = Array.isArray(raw.epilogueTalked) ? [...new Set(raw.epilogueTalked.filter(id => typeof id === 'string' && CREW_ID.test(id)))].slice(0, MAX_TALKED) : [];
  state.lockerRead = raw.lockerRead === true;
  if (!state.phase) return null;
  return state;
}
