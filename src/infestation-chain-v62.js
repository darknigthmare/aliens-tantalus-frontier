export const INFESTATION_STAGES_V62 = Object.freeze([
  'exposure',
  'anomaly',
  'clues',
  'confirmation',
  'containment',
  'infestation'
]);

export const INFESTATION_SOURCE_TYPES_V62 = Object.freeze([
  'cargo-return',
  'survivor-evacuation',
  'live-specimen',
  'wreck-salvage',
  'contaminated-equipment',
  'airlock-breach',
  'vent-breach',
  'synthetic-intrusion',
  'pathogen-sample'
]);

export const INFESTATION_ENTRY_POINTS_V62 = Object.freeze({
  'cargo-return': Object.freeze({ id: 'cargo-airlock', deck: 2, roomId: 'vehicle-bay', x: 6100, type: 'airlock' }),
  'survivor-evacuation': Object.freeze({ id: 'medical-airlock', deck: 1, roomId: 'medical', x: 4200, type: 'airlock' }),
  'live-specimen': Object.freeze({ id: 'quarantine-transfer', deck: 2, roomId: 'quarantine', x: 8900, type: 'cargo' }),
  'wreck-salvage': Object.freeze({ id: 'hangar-recovery-lock', deck: 3, roomId: 'dropship-hangar', x: 2700, type: 'airlock' }),
  'contaminated-equipment': Object.freeze({ id: 'armory-freight-lock', deck: 0, roomId: 'armory', x: 11100, type: 'cargo' }),
  'airlock-breach': Object.freeze({ id: 'hangar-breach', deck: 3, roomId: 'dropship-hangar', x: 10200, type: 'breach' }),
  'vent-breach': Object.freeze({ id: 'life-support-vent', deck: 3, roomId: 'life-support', x: 7600, type: 'vent' }),
  'synthetic-intrusion': Object.freeze({ id: 'combat-information-uplink', deck: 0, roomId: 'combat-information', x: 5200, type: 'uplink' }),
  'pathogen-sample': Object.freeze({ id: 'science-sample-lock', deck: 1, roomId: 'science-lab', x: 6900, type: 'cargo' })
});

export const INFESTATION_ACTIONS_V62 = Object.freeze({
  scan: 'sensor-scan',
  quarantine: 'raise-quarantine',
  security: 'security-sweep',
  seal: 'seal-entry'
});

const STAGE_INDEX = Object.freeze(Object.fromEntries(INFESTATION_STAGES_V62.map((stage, index) => [stage, index])));
const SOURCE_KIND = Object.freeze({
  'synthetic-intrusion': 'synthetic',
  'pathogen-sample': 'pathogen'
});
const EVIDENCE_WEIGHT = Object.freeze({ trace: 13, audio: 10, motion: 16, biological: 26, visual: 34, breach: 22, system: 12 });

const clone = (value) => structuredClone(value);
const isRecord = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const clamp = (value, minimum = 0, maximum = 100) => Math.max(minimum, Math.min(maximum, Number(value) || 0));
const round = (value, precision = 2) => {
  const factor = 10 ** precision;
  return Math.round((Number(value) || 0) * factor) / factor;
};

function hashText(value) {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function absoluteHours(clock) {
  const day = Math.max(1, Math.floor(Number(clock?.day) || 1));
  const hour = Math.max(0, Number(clock?.hour) || 0);
  return round((day - 1) * 24 + hour);
}

function normalizeSourceType(value) {
  const source = String(value || '').trim().toLowerCase();
  return INFESTATION_SOURCE_TYPES_V62.includes(source) ? source : null;
}

function normalizeKind(value, sourceType) {
  const kind = String(value || SOURCE_KIND[sourceType] || 'xenomorph').toLowerCase();
  return ['xenomorph', 'synthetic', 'pathogen'].includes(kind) ? kind : 'xenomorph';
}

function sanitizeEntry(entry, sourceType) {
  const fallback = INFESTATION_ENTRY_POINTS_V62[sourceType];
  if (!fallback) return null;
  const candidate = isRecord(entry) ? entry : {};
  return {
    id: String(candidate.id || fallback.id).slice(0, 120),
    deck: Math.round(clamp(candidate.deck ?? fallback.deck, 0, 3)),
    roomId: String(candidate.roomId || fallback.roomId).slice(0, 120),
    x: Math.round(clamp(candidate.x ?? fallback.x, 0, 20000)),
    type: String(candidate.type || fallback.type).slice(0, 40)
  };
}

function sanitizeEvidence(candidate, index = 0) {
  if (!isRecord(candidate)) return null;
  const type = Object.hasOwn(EVIDENCE_WEIGHT, candidate.type) ? candidate.type : 'trace';
  return {
    id: String(candidate.id || `evidence-${index + 1}`).slice(0, 160),
    type,
    label: String(candidate.label || type).slice(0, 180),
    confidence: round(clamp(candidate.confidence ?? EVIDENCE_WEIGHT[type], 1, 100)),
    discoveredAtHours: round(Math.max(0, Number(candidate.discoveredAtHours) || 0)),
    source: String(candidate.source || 'ship-sensor').slice(0, 120)
  };
}

function appendHistory(chain, stage, atHours, reason) {
  if (!Array.isArray(chain.history)) chain.history = [];
  if (chain.history.some((event) => event.stage === stage)) return;
  chain.history.push({ stage, atHours: round(atHours), reason: String(reason || stage).slice(0, 180) });
}

function setStage(chain, stage, atHours, reason) {
  if (!Object.hasOwn(STAGE_INDEX, stage)) return;
  if (STAGE_INDEX[stage] < STAGE_INDEX[chain.stage]) return;
  chain.stage = stage;
  chain.stageIndex = STAGE_INDEX[stage];
  chain.updatedAtHours = round(atHours);
  appendHistory(chain, stage, atHours, reason);
}

function systemsSnapshot(save) {
  const systems = save?.hub?.systems || {};
  return {
    quarantine: clamp(systems.quarantine),
    security: clamp(systems.security),
    sensors: clamp(systems.sensors ?? systems.research ?? 50)
  };
}

function evidenceCertainty(chain, systems) {
  const evidence = chain.evidence.reduce((sum, item) => sum + Math.min(item.confidence, EVIDENCE_WEIGHT[item.type] + 12), 0);
  const sensorBonus = systems.sensors * 0.18;
  const anomalyBonus = Math.max(0, chain.stageIndex - 1) * 4;
  return round(clamp(8 + evidence + sensorBonus + anomalyBonus));
}

function containmentStrength(chain, systems) {
  return round(clamp(
    chain.containment.score
    + systems.quarantine * 0.34
    + systems.security * 0.24
    + systems.sensors * 0.12
  ));
}

export function normalizeInfestationChainV62(candidate) {
  if (!isRecord(candidate)) return null;
  const sourceType = normalizeSourceType(candidate.source?.type || candidate.sourceType);
  if (!sourceType) return null;
  const stage = Object.hasOwn(STAGE_INDEX, candidate.stage) ? candidate.stage : 'exposure';
  const startedAtHours = round(Math.max(0, Number(candidate.startedAtHours) || 0));
  const chain = {
    schema: 1,
    id: String(candidate.id || `infestation-${sourceType}-${hashText(`${sourceType}:${startedAtHours}`).toString(36)}`).slice(0, 180),
    kind: normalizeKind(candidate.kind, sourceType),
    stage,
    stageIndex: STAGE_INDEX[stage],
    source: {
      type: sourceType,
      eventId: String(candidate.source?.eventId || candidate.eventId || '').slice(0, 180),
      campaignId: String(candidate.source?.campaignId || '').slice(0, 180),
      worldId: String(candidate.source?.worldId || '').slice(0, 180),
      label: String(candidate.source?.label || sourceType).slice(0, 220)
    },
    entry: sanitizeEntry(candidate.entry, sourceType),
    severity: round(clamp(candidate.severity ?? 45, 1, 100)),
    certainty: round(clamp(candidate.certainty)),
    estimatedThreats: Math.round(clamp(candidate.estimatedThreats ?? 1, 1, 12)),
    startedAtHours,
    updatedAtHours: round(Math.max(startedAtHours, Number(candidate.updatedAtHours) || startedAtHours)),
    confirmedAtHours: candidate.confirmedAtHours == null ? null : round(Math.max(startedAtHours, Number(candidate.confirmedAtHours) || startedAtHours)),
    containmentDeadlineHours: candidate.containmentDeadlineHours == null ? null : round(Math.max(startedAtHours, Number(candidate.containmentDeadlineHours) || startedAtHours)),
    evidence: Array.isArray(candidate.evidence) ? candidate.evidence.map(sanitizeEvidence).filter(Boolean).slice(0, 24) : [],
    containment: {
      score: round(clamp(candidate.containment?.score)),
      attempts: Array.isArray(candidate.containment?.attempts)
        ? candidate.containment.attempts.filter(isRecord).slice(-16).map((attempt) => ({
          action: String(attempt.action || '').slice(0, 80),
          atHours: round(Math.max(0, Number(attempt.atHours) || 0)),
          strength: round(clamp(attempt.strength))
        }))
        : [],
      resolved: Boolean(candidate.containment?.resolved),
      failed: Boolean(candidate.containment?.failed)
    },
    history: Array.isArray(candidate.history)
      ? candidate.history.filter(isRecord).slice(-24).map((event) => ({
        stage: Object.hasOwn(STAGE_INDEX, event.stage) ? event.stage : 'exposure',
        atHours: round(Math.max(0, Number(event.atHours) || 0)),
        reason: String(event.reason || '').slice(0, 180)
      }))
      : [],
    resolved: Boolean(candidate.resolved)
  };
  if (!chain.history.length) appendHistory(chain, chain.stage, chain.startedAtHours, 'Événement causal enregistré');
  return chain;
}

export function createInfestationExposureV62(save, event = {}) {
  if (!isRecord(save?.hub)) throw new Error('État du Tantalus invalide.');
  const sourceType = normalizeSourceType(event.type || event.sourceType);
  if (!sourceType) return null;
  const atHours = round(Math.max(0, Number(event.atHours) || absoluteHours(save.clock)));
  const eventId = String(event.id || `${sourceType}:${event.campaignId || event.worldId || atHours}`);
  const existing = normalizeInfestationChainV62(save.hub.infestationChain);
  if (existing && !existing.resolved) {
    if (existing.source.eventId === eventId) return clone(existing);
    existing.severity = round(clamp(Math.max(existing.severity, event.severity || 0) + 5));
    existing.updatedAtHours = atHours;
    existing.source.label = `${existing.source.label} + ${String(event.label || sourceType)}`.slice(0, 220);
    save.hub.infestationChain = existing;
    return clone(existing);
  }
  const chain = normalizeInfestationChainV62({
    id: `infestation-${hashText(`${eventId}:${save.profile || 1}`).toString(36)}`,
    kind: event.kind,
    stage: 'exposure',
    source: {
      type: sourceType,
      eventId,
      campaignId: event.campaignId,
      worldId: event.worldId,
      label: event.label || sourceType
    },
    entry: event.entry,
    severity: event.severity ?? 45,
    estimatedThreats: event.estimatedThreats ?? 1,
    startedAtHours: atHours,
    updatedAtHours: atHours,
    history: [{ stage: 'exposure', atHours, reason: 'Événement causal enregistré' }]
  });
  save.hub.infestationChain = chain;
  return clone(chain);
}

export function addInfestationEvidenceV62(save, candidate = {}) {
  const chain = normalizeInfestationChainV62(save?.hub?.infestationChain);
  if (!chain || chain.resolved) return null;
  const evidence = sanitizeEvidence({
    ...candidate,
    id: candidate.id || `${chain.id}:${candidate.type || 'trace'}:${chain.evidence.length + 1}`,
    discoveredAtHours: candidate.discoveredAtHours ?? absoluteHours(save.clock)
  }, chain.evidence.length);
  if (!chain.evidence.some((entry) => entry.id === evidence.id)) chain.evidence.push(evidence);
  chain.certainty = evidenceCertainty(chain, systemsSnapshot(save));
  chain.updatedAtHours = round(Math.max(chain.updatedAtHours, evidence.discoveredAtHours));
  save.hub.infestationChain = chain;
  return clone(evidence);
}

function generatedEvidence(chain, type, atHours, label, source) {
  return sanitizeEvidence({
    id: `${chain.id}:${type}`,
    type,
    label,
    confidence: EVIDENCE_WEIGHT[type],
    discoveredAtHours: atHours,
    source
  });
}

function pushEvidence(chain, evidence) {
  if (!chain.evidence.some((entry) => entry.id === evidence.id)) chain.evidence.push(evidence);
}

export function planInfestationAdvanceV62(save, options = {}) {
  const nextSave = clone(save);
  const chain = normalizeInfestationChainV62(nextSave?.hub?.infestationChain);
  if (!chain || chain.resolved) return { save: nextSave, chain, changed: false, crisis: null };
  const atHours = round(Math.max(chain.updatedAtHours, Number(options.atHours) || absoluteHours(nextSave.clock)));
  const elapsed = Math.max(0, atHours - chain.startedAtHours);
  const systems = systemsSnapshot(nextSave);
  const barrier = systems.quarantine * 0.42 + systems.security * 0.24 + systems.sensors * 0.14;
  const effectiveRisk = round(clamp(chain.severity + elapsed * 1.35 - barrier * 0.48));
  const before = JSON.stringify(chain);

  if (chain.stage === 'exposure' && elapsed >= 2 && effectiveRisk >= 26) {
    pushEvidence(chain, generatedEvidence(chain, 'system', atHours, 'Écart de journal de confinement', 'MU/TH/UR'));
    setStage(chain, 'anomaly', atHours, 'Anomalie reliée à l’exposition enregistrée');
  }
  if (chain.stage === 'anomaly' && (elapsed >= 5 || chain.evidence.length >= 2)) {
    pushEvidence(chain, generatedEvidence(chain, 'audio', atHours, 'Bruit structurel non attribué', 'capteur acoustique'));
    pushEvidence(chain, generatedEvidence(chain, 'trace', atHours, 'Trace matérielle sur la route de transfert', 'équipe de quart'));
    setStage(chain, 'clues', atHours, 'Indices matériels et capteurs concordants');
  }

  if (chain.stage === 'clues' && elapsed >= 12) {
    pushEvidence(chain, generatedEvidence(chain, 'breach', atHours, 'Altération physique sur la route de transfert', 'inspection de coque'));
  }
  chain.certainty = evidenceCertainty(chain, systems);
  if (chain.stage === 'clues' && chain.certainty >= 58 && elapsed >= 7) {
    pushEvidence(chain, generatedEvidence(chain, chain.kind === 'synthetic' ? 'system' : 'biological', atHours, 'Signature hostile confirmée', 'analyse de sécurité'));
    chain.certainty = evidenceCertainty(chain, systems);
    chain.confirmedAtHours = atHours;
    setStage(chain, 'confirmation', atHours, 'Présence hostile confirmée par recoupement');
  }
  if (chain.stage === 'confirmation') {
    chain.containmentDeadlineHours = atHours + Math.max(3, round(8 - chain.severity / 20));
    setStage(chain, 'containment', atHours, 'Fenêtre de confinement ouverte');
  }
  if (chain.stage === 'containment') {
    const strength = containmentStrength(chain, systems);
    const required = round(clamp(48 + chain.severity * 0.34, 50, 82));
    if (strength >= required) {
      chain.containment.resolved = true;
      chain.resolved = true;
      chain.updatedAtHours = atHours;
      appendHistory(chain, 'containment', atHours, 'Confinement réussi avant rupture');
    } else if (atHours >= chain.containmentDeadlineHours) {
      chain.containment.failed = true;
      setStage(chain, 'infestation', atHours, 'Rupture physique du confinement');
    }
  }

  nextSave.hub.infestationChain = chain;
  const crisis = chain.stage === 'infestation' && !chain.resolved ? deriveCausalHubCrisisV62(nextSave) : null;
  return { save: nextSave, chain: clone(chain), changed: before !== JSON.stringify(chain), crisis };
}

export function advanceInfestationChainV62(save, options = {}) {
  const result = planInfestationAdvanceV62(save, options);
  for (const key of Object.keys(save)) delete save[key];
  Object.assign(save, result.save);
  return { ...result, save, chain: result.chain ? clone(result.chain) : null };
}

export function applyInfestationActionV62(save, action) {
  const chain = normalizeInfestationChainV62(save?.hub?.infestationChain);
  if (!chain || chain.resolved) return { applied: false, reason: 'no-active-chain', chain };
  const actionId = String(typeof action === 'string' ? action : action?.action || '');
  const systems = systemsSnapshot(save);
  const strengths = {
    [INFESTATION_ACTIONS_V62.scan]: 8 + systems.sensors * 0.12,
    [INFESTATION_ACTIONS_V62.quarantine]: 10 + systems.quarantine * 0.16,
    [INFESTATION_ACTIONS_V62.security]: 9 + systems.security * 0.15,
    [INFESTATION_ACTIONS_V62.seal]: 14 + (systems.quarantine + systems.security) * 0.09
  };
  if (!Object.hasOwn(strengths, actionId)) return { applied: false, reason: 'unknown-action', chain };
  const atHours = absoluteHours(save.clock);
  const strength = round(clamp(strengths[actionId], 1, 40));
  chain.containment.attempts.push({ action: actionId, atHours, strength });
  chain.containment.score = round(clamp(chain.containment.score + strength));
  if (actionId === INFESTATION_ACTIONS_V62.scan) {
    pushEvidence(chain, generatedEvidence(chain, 'motion', atHours, 'Contact de mouvement corrélé', 'capteurs internes'));
    chain.certainty = evidenceCertainty(chain, systems);
  }
  chain.updatedAtHours = Math.max(chain.updatedAtHours, atHours);
  save.hub.infestationChain = chain;
  const advanced = advanceInfestationChainV62(save, { atHours });
  return { applied: true, action: actionId, strength, chain: advanced.chain, crisis: advanced.crisis };
}

export function deriveCausalHubCrisisV62(save) {
  const chain = normalizeInfestationChainV62(save?.hub?.infestationChain);
  if (!chain || chain.resolved || chain.stage !== 'infestation' || !chain.containment.failed) return null;
  const seed = `${chain.id}:${chain.entry.id}:${chain.severity}`;
  return {
    id: `crisis-${chain.kind}-${hashText(seed).toString(36)}`,
    kind: chain.kind,
    count: Math.round(clamp(chain.estimatedThreats + Math.floor(chain.severity / 28), 1, 12)),
    deck: chain.entry.deck,
    roomId: chain.entry.roomId,
    resolved: false
  };
}

export function getInfestationHudStateV62(save) {
  const chain = normalizeInfestationChainV62(save?.hub?.infestationChain);
  if (!chain || chain.resolved) return Object.freeze({ active: false, stage: null, certainty: 0, alertLevel: 'clear', threatDisplay: null });
  const systems = systemsSnapshot(save);
  const countKnown = chain.stage === 'infestation' && chain.certainty >= 90 && systems.sensors >= 65;
  const alertLevel = chain.stageIndex <= 1 ? 'mu-th-ur-watch'
    : chain.stageIndex <= 3 ? 'mu-th-ur-warning'
      : chain.stage === 'containment' ? 'mu-th-ur-containment' : 'mu-th-ur-critical';
  return Object.freeze({
    active: true,
    chainId: chain.id,
    stage: chain.stage,
    certainty: chain.certainty,
    alertLevel,
    sourceKnown: chain.certainty >= 60,
    sourceLabel: chain.certainty >= 60 ? chain.source.label : null,
    locationKnown: chain.certainty >= 72,
    roomId: chain.certainty >= 72 ? chain.entry.roomId : null,
    threatDisplay: countKnown ? String(deriveCausalHubCrisisV62(save)?.count || chain.estimatedThreats) : chain.stage === 'infestation' ? 'présence multiple probable' : 'inconnu',
    exactCountKnown: countKnown,
    evidenceCount: chain.evidence.length,
    containmentDeadlineHours: chain.containmentDeadlineHours
  });
}
