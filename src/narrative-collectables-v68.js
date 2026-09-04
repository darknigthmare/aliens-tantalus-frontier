export const NARRATIVE_ARCHIVE_SCHEMA_V68 = 1;

export const NARRATIVE_OPERATION_V68 = Object.freeze({
  id: 'qz17-ghost-cargo',
  specialOperationId: 'narrative-collectables',
  campaignId: 'special-narrative-qz17',
  collectionId: 'qz17-ghost-cargo',
  title: 'QZ-17 — LA CARGAISON FANTÔME',
  provenance: 'tantalus-frontier-project-authored-v68',
  canonStatus: 'project-fiction-not-franchise-canon',
  analysisUnlockFlag: 'qz17-route-analysis-complete',
  unlockCondition: Object.freeze({
    type: 'all-authored-evidence',
    requiredCollectableIds: Object.freeze([
      'qz17-pda-loading-chief',
      'qz17-email-logistics-denial',
      'qz17-black-box-forklift',
      'qz17-cargo-seal-fragment'
    ]),
    requiredContradictions: 2,
    requiredCorroborations: 2,
    grantsFlag: 'qz17-route-analysis-complete'
  })
});

const MAX_LEDGER_EVENTS = 256;
const MAX_LEDGER_FLAGS = 64;
const MAX_ID_LENGTH = 120;
const NARRATIVE_FORMATS_V68 = new Set(['text']);
const NARRATIVE_TYPES_V68 = new Set(['pda', 'email', 'black-box', 'cargo-seal']);
const RELATION_TYPES_V68 = new Set(['corroborates', 'contradicts', 'qualifies']);
const CLAIM_STANCES_V68 = new Set(['supports', 'denies']);

const isRecord = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const clone = (value) => structuredClone(value);
const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
const integer = (value, fallback = 0, minimum = 0, maximum = Number.MAX_SAFE_INTEGER) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? clamp(Math.floor(parsed), minimum, maximum) : fallback;
};
const number = (value, fallback = 0, minimum = 0, maximum = Number.MAX_SAFE_INTEGER) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? clamp(parsed, minimum, maximum) : fallback;
};
const text = (value, fallback = '', maximum = MAX_ID_LENGTH) => typeof value === 'string'
  ? value.trim().slice(0, maximum)
  : fallback;
const uniqueStrings = (value, maximum = MAX_LEDGER_EVENTS) => Array.isArray(value)
  ? [...new Set(value.filter((entry) => typeof entry === 'string').map((entry) => entry.trim().slice(0, MAX_ID_LENGTH)).filter(Boolean))].slice(-maximum)
  : [];

function freezeDeep(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) freezeDeep(child);
  return Object.freeze(value);
}

const collectable = (definition) => freezeDeep({
  collectionId: NARRATIVE_OPERATION_V68.collectionId,
  format: 'text',
  authored: true,
  provenance: NARRATIVE_OPERATION_V68.provenance,
  canonStatus: NARRATIVE_OPERATION_V68.canonStatus,
  ...definition
});

/**
 * Les quatre pièces constituent un dossier original du projet. La boîte noire
 * expose une transcription de mémoire statique : aucun fichier audio ou vidéo
 * n'est annoncé tant qu'un média jouable n'existe pas dans le dépôt.
 */
export const NARRATIVE_COLLECTABLES_V68 = freezeDeep([
  collectable({
    id: 'qz17-pda-loading-chief',
    type: 'pda',
    title: 'PDA de quai — Relève 02:00',
    shortTitle: 'PDA de quai',
    source: {
      name: 'Léonie Harrow',
      role: 'cheffe de quai QZ-17',
      recordId: 'PDA-QZ17-07',
      recordedAt: '2204-09-17T02:31:00Z'
    },
    summary: 'La cheffe de quai consigne un transfert effectué malgré une validation de sécurité incomplète.',
    body: '02:14 — FL-09 a pris la caisse QZ17-04 au poste trois. Le bon de mouvement porte la signature de Venn, mais pas le contreseing sécurité. J’ai laissé partir le chariot : le voyant du sceau était vert et le superviseur insistait sur le retard de la chambre froide.\n\n02:26 — La caisse n’apparaît toujours pas dans l’inventaire froid. Si elle a changé de destination, personne ne m’a transmis l’ordre. Je garde cette note hors du réseau logistique jusqu’à la relève.',
    physical: {
      propKey: 'qz17-pda',
      zoneId: 'cargo-loading-control',
      anchorId: 'qz17-loading-desk',
      surfaceKind: 'platform',
      interactionLabel: 'CONSULTER LE PDA DE QUAI'
    },
    rewards: { intel: 1 },
    claims: [
      {
        id: 'qz17-claim-transfer-executed-pda',
        subject: 'cargo-transfer-qz17-04',
        value: 'executed-at-02-14',
        stance: 'supports',
        confidence: 76,
        statement: 'La caisse QZ17-04 a quitté le poste trois à 02:14 sur le chariot FL-09.'
      },
      {
        id: 'qz17-claim-seal-intact-pda',
        subject: 'cargo-seal-qz17-04',
        value: 'intact-at-dispatch',
        stance: 'supports',
        confidence: 58,
        statement: 'Le voyant du sceau était vert au départ du quai.'
      }
    ]
  }),
  collectable({
    id: 'qz17-email-logistics-denial',
    type: 'email',
    title: 'Courriel logistique — Annulation QZ17-04',
    shortTitle: 'Courriel contradictoire',
    source: {
      name: 'Malik Venn',
      role: 'coordinateur logistique',
      recordId: 'MAIL-LOG-4471',
      recordedAt: '2204-09-17T03:06:00Z'
    },
    summary: 'Le responsable cité par le PDA affirme que le transfert a été annulé avant tout déplacement.',
    body: 'À : Sécurité de pont\nObjet : correction du registre QZ17-04\n\nLe transfert demandé à 01:39 a été annulé à 01:52 faute de contreseing. Aucune caisse n’a quitté le poste trois cette nuit et je n’ai signé aucun bon de mouvement. L’absence d’images entre 02:00 et 02:30 correspond à la maintenance planifiée des caméras C-12 à C-16. Merci de clore l’alerte d’inventaire et de ne pas immobiliser le quai pour un doublon administratif.',
    physical: {
      propKey: 'qz17-email-terminal',
      zoneId: 'cargo-supervision',
      anchorId: 'qz17-supervisor-terminal',
      surfaceKind: 'platform',
      interactionLabel: 'OUVRIR LE COURRIEL LOGISTIQUE'
    },
    rewards: { intel: 1 },
    claims: [
      {
        id: 'qz17-claim-transfer-cancelled-email',
        subject: 'cargo-transfer-qz17-04',
        value: 'cancelled-no-movement',
        stance: 'denies',
        confidence: 72,
        statement: 'Le transfert a été annulé à 01:52 et aucune caisse n’a quitté le poste trois.'
      },
      {
        id: 'qz17-claim-camera-outage-planned-email',
        subject: 'camera-outage-c12-c16',
        value: 'planned-maintenance-02-00-02-30',
        stance: 'supports',
        confidence: 64,
        statement: 'La coupure des caméras C-12 à C-16 était une maintenance planifiée.'
      }
    ]
  }),
  collectable({
    id: 'qz17-black-box-forklift',
    type: 'black-box',
    title: 'Boîte noire FL-09 — Mémoire de trajet',
    shortTitle: 'Boîte noire FL-09',
    source: {
      name: 'Chariot autonome FL-09',
      role: 'mémoire de trajet non réinscriptible',
      recordId: 'FL09-CORE-22040917',
      recordedAt: '2204-09-17T02:23:41Z'
    },
    summary: 'La mémoire matérielle confirme le déplacement, sa masse anormale et une destination absente du bon officiel.',
    body: 'TRANSCRIPTION DE DONNÉES — aucun flux audio joint\n\n02:13:48 — Prise de charge : QZ17-04. Masse mesurée : 612 kg. Masse déclarée : 480 kg.\n02:14:02 — Autorisation locale reçue : transpondeur SABLE-4, identifiant absent de la liste d’équipage.\n02:18:33 — Route officielle chambre froide interrompue. Nouvelle destination : monte-charge de service B.\n02:23:41 — Arrêt d’urgence. Mémoire extraite avant effacement distant.',
    physical: {
      propKey: 'qz17-black-box',
      zoneId: 'cargo-loader-wreck',
      anchorId: 'qz17-fl09-memory-port',
      surfaceKind: 'platform',
      interactionLabel: 'EXTRAIRE LA BOÎTE NOIRE FL-09'
    },
    rewards: { intel: 2 },
    claims: [
      {
        id: 'qz17-claim-transfer-executed-black-box',
        subject: 'cargo-transfer-qz17-04',
        value: 'executed-at-02-14',
        stance: 'supports',
        confidence: 98,
        statement: 'FL-09 a pris la caisse QZ17-04 et s’est déplacé à 02:14.'
      },
      {
        id: 'qz17-claim-route-service-lift-black-box',
        subject: 'cargo-route-qz17-04',
        value: 'service-lift-b',
        stance: 'supports',
        confidence: 96,
        statement: 'La destination a été remplacée par le monte-charge de service B.'
      },
      {
        id: 'qz17-claim-transponder-unauthorized-black-box',
        subject: 'transfer-authorization-qz17-04',
        value: 'unauthorized-transponder-sable-4',
        stance: 'supports',
        confidence: 94,
        statement: 'Le transpondeur SABLE-4 ne correspond à aucun membre d’équipage autorisé.'
      }
    ]
  }),
  collectable({
    id: 'qz17-cargo-seal-fragment',
    type: 'cargo-seal',
    title: 'Sceau QZ17-04 — Fragment intérieur',
    shortTitle: 'Sceau cargo brisé',
    source: {
      name: 'Analyse terrain Echo-9',
      role: 'preuve matérielle',
      recordId: 'E9-EVIDENCE-QZ17-04',
      recordedAt: '2204-09-17T05:12:00Z'
    },
    summary: 'Un fragment du sceau est retrouvé après le monte-charge, coupé avant l’arrivée annoncée en chambre froide.',
    body: 'Le numéro moulé correspond à la caisse QZ17-04. La rupture ne vient pas d’un choc : deux entailles parallèles ont traversé le polymère depuis la face interne, puis un solvant industriel a neutralisé la boucle de contrôle.\n\nDes fibres de gaine orange prises dans l’attache correspondent au balisage du monte-charge de service B. Le fragment était coincé côté maintenance, au-delà du lecteur de badge du quai.',
    physical: {
      propKey: 'qz17-cargo-seal',
      zoneId: 'service-bulkhead',
      anchorId: 'qz17-seal-floor-mark',
      surfaceKind: 'platform',
      interactionLabel: 'PRÉLEVER LE SCEAU CARGO'
    },
    rewards: { intel: 1 },
    claims: [
      {
        id: 'qz17-claim-seal-breached-fragment',
        subject: 'cargo-seal-qz17-04',
        value: 'breached-before-cold-storage',
        stance: 'supports',
        confidence: 92,
        statement: 'Le sceau a été neutralisé avant toute arrivée en chambre froide.'
      },
      {
        id: 'qz17-claim-route-service-lift-seal',
        subject: 'cargo-route-qz17-04',
        value: 'service-lift-b',
        stance: 'supports',
        confidence: 88,
        statement: 'La caisse ou son sceau a franchi le monte-charge de service B.'
      }
    ]
  })
]);

export const NARRATIVE_RELATIONS_V68 = freezeDeep([
  {
    id: 'qz17-relation-pda-email-transfer',
    type: 'contradicts',
    fromClaimId: 'qz17-claim-transfer-executed-pda',
    toClaimId: 'qz17-claim-transfer-cancelled-email',
    explanation: 'Le PDA décrit un départ à 02:14 ; le courriel nie tout mouvement après l’annulation.'
  },
  {
    id: 'qz17-relation-blackbox-email-transfer',
    type: 'contradicts',
    fromClaimId: 'qz17-claim-transfer-executed-black-box',
    toClaimId: 'qz17-claim-transfer-cancelled-email',
    explanation: 'La mémoire non réinscriptible enregistre précisément le mouvement que le courriel nie.'
  },
  {
    id: 'qz17-relation-blackbox-pda-transfer',
    type: 'corroborates',
    fromClaimId: 'qz17-claim-transfer-executed-black-box',
    toClaimId: 'qz17-claim-transfer-executed-pda',
    explanation: 'L’heure et l’identifiant du chariot recoupent la note de la cheffe de quai.'
  },
  {
    id: 'qz17-relation-seal-pda-integrity',
    type: 'qualifies',
    fromClaimId: 'qz17-claim-seal-breached-fragment',
    toClaimId: 'qz17-claim-seal-intact-pda',
    explanation: 'Le sceau a pu être intact au quai puis rompu côté maintenance ; le voyant vert observé qualifie la preuve sans établir une contradiction temporelle.'
  },
  {
    id: 'qz17-relation-seal-blackbox-route',
    type: 'corroborates',
    fromClaimId: 'qz17-claim-route-service-lift-seal',
    toClaimId: 'qz17-claim-route-service-lift-black-box',
    explanation: 'Les fibres de balisage confirment la destination inscrite dans la mémoire FL-09.'
  }
]);

const INVESTIGATION_REQUIREMENTS_V68 = freezeDeep([
  'qz17-claim-transfer-executed-pda',
  'qz17-claim-transfer-cancelled-email',
  'qz17-claim-transfer-executed-black-box',
  'qz17-claim-seal-breached-fragment'
]);

export const NARRATIVE_DECISIONS_V68 = freezeDeep([
  {
    id: 'qz17-route-verdict',
    label: 'Choisir la piste QZ-17',
    requirements: INVESTIGATION_REQUIREMENTS_V68,
    options: [
      {
        id: 'follow-maintenance-trace',
        label: 'Suivre la trace par la maintenance',
        description: 'Ouvrir le passage de maintenance révélé par le sceau et poursuivre la cargaison.',
        routeUnlockFlag: 'qz17-maintenance-bypass'
      },
      {
        id: 'secure-quarantine-evidence',
        label: 'Sécuriser la preuve en quarantaine',
        description: 'Verrouiller la chaîne de preuve et autoriser l’accès contrôlé au sas de quarantaine.',
        routeUnlockFlag: 'qz17-quarantine-lock'
      }
    ]
  }
]);

const COLLECTABLE_BY_ID_V68 = new Map(NARRATIVE_COLLECTABLES_V68.map((entry) => [entry.id, entry]));
const CLAIM_TO_COLLECTABLE_V68 = new Map(NARRATIVE_COLLECTABLES_V68.flatMap((entry) => entry.claims.map((claim) => [claim.id, entry.id])));
const CLAIM_BY_ID_V68 = new Map(NARRATIVE_COLLECTABLES_V68.flatMap((entry) => entry.claims.map((claim) => [claim.id, claim])));
const DECISION_BY_ID_V68 = new Map(NARRATIVE_DECISIONS_V68.map((entry) => [entry.id, entry]));
const OPTION_TO_DECISION_V68 = new Map(NARRATIVE_DECISIONS_V68.flatMap((decision) => decision.options.map((option) => [option.id, decision.id])));
function validateNarrativeCatalogueV68() {
  const errors = [];
  const collectableIds = new Set();
  const claimIds = new Set();
  for (const entry of NARRATIVE_COLLECTABLES_V68) {
    if (!/^[a-z0-9-]{1,120}$/.test(entry.id) || collectableIds.has(entry.id)) errors.push(`collectable-id:${entry.id}`);
    collectableIds.add(entry.id);
    if (!NARRATIVE_TYPES_V68.has(entry.type)) errors.push(`collectable-type:${entry.id}`);
    if (!NARRATIVE_FORMATS_V68.has(entry.format)) errors.push(`collectable-format:${entry.id}`);
    if (!entry.authored || entry.body.length < 180 || entry.summary.length < 40) errors.push(`collectable-content:${entry.id}`);
    if (!entry.physical?.propKey || !entry.physical?.zoneId || !entry.physical?.anchorId) errors.push(`collectable-physical:${entry.id}`);
    if (!Number.isInteger(entry.rewards?.intel) || entry.rewards.intel < 1) errors.push(`collectable-reward:${entry.id}`);
    if (!Array.isArray(entry.claims) || entry.claims.length < 2) errors.push(`collectable-claims:${entry.id}`);
    for (const claim of entry.claims || []) {
      if (!/^[a-z0-9-]{1,120}$/.test(claim.id) || claimIds.has(claim.id)) errors.push(`claim-id:${claim.id}`);
      claimIds.add(claim.id);
      if (!CLAIM_STANCES_V68.has(claim.stance) || !claim.subject || !claim.value || claim.statement.length < 30) errors.push(`claim-content:${claim.id}`);
      if (!Number.isInteger(claim.confidence) || claim.confidence < 1 || claim.confidence > 100) errors.push(`claim-confidence:${claim.id}`);
    }
    const serialized = JSON.stringify(entry).toLowerCase();
    if (/\b(?:placeholder|todo|tbd|lorem ipsum)\b/.test(serialized)) errors.push(`collectable-placeholder:${entry.id}`);
    if (Object.hasOwn(entry, 'audioPath') || Object.hasOwn(entry, 'videoPath') || entry.format !== 'text') errors.push(`collectable-media:${entry.id}`);
  }
  for (const relation of NARRATIVE_RELATIONS_V68) {
    if (!RELATION_TYPES_V68.has(relation.type)) errors.push(`relation-type:${relation.id}`);
    if (!claimIds.has(relation.fromClaimId) || !claimIds.has(relation.toClaimId)) errors.push(`relation-claim:${relation.id}`);
    if (relation.fromClaimId === relation.toClaimId) errors.push(`relation-self:${relation.id}`);
  }
  for (const decision of NARRATIVE_DECISIONS_V68) {
    if (!decision.requirements.every((claimId) => claimIds.has(claimId))) errors.push(`decision-requirement:${decision.id}`);
    if (!decision.options.length) errors.push(`decision-options:${decision.id}`);
    if (new Set(decision.options.map((option) => option.id)).size !== decision.options.length) errors.push(`decision-option-id:${decision.id}`);
  }
  if (NARRATIVE_OPERATION_V68.unlockCondition.requiredCollectableIds.length !== collectableIds.size
    || !NARRATIVE_OPERATION_V68.unlockCondition.requiredCollectableIds.every((id) => collectableIds.has(id))) {
    errors.push('operation-unlock-collectables');
  }
  if (NARRATIVE_OPERATION_V68.unlockCondition.requiredContradictions > NARRATIVE_RELATIONS_V68.filter((entry) => entry.type === 'contradicts').length
    || NARRATIVE_OPERATION_V68.unlockCondition.requiredCorroborations > NARRATIVE_RELATIONS_V68.filter((entry) => entry.type === 'corroborates').length) {
    errors.push('operation-unlock-relations');
  }
  return errors;
}

const CATALOGUE_ERRORS_V68 = validateNarrativeCatalogueV68();
if (CATALOGUE_ERRORS_V68.length) throw new Error(`Catalogue narratif V68 invalide : ${CATALOGUE_ERRORS_V68.join(', ')}`);

export const NARRATIVE_COVERAGE_V68 = freezeDeep({
  collectionId: NARRATIVE_OPERATION_V68.collectionId,
  collectableCount: NARRATIVE_COLLECTABLES_V68.length,
  claimCount: CLAIM_BY_ID_V68.size,
  relationCount: NARRATIVE_RELATIONS_V68.length,
  contradictionCount: NARRATIVE_RELATIONS_V68.filter((entry) => entry.type === 'contradicts').length,
  corroborationCount: NARRATIVE_RELATIONS_V68.filter((entry) => entry.type === 'corroborates').length,
  qualificationCount: NARRATIVE_RELATIONS_V68.filter((entry) => entry.type === 'qualifies').length,
  decisionCount: NARRATIVE_DECISIONS_V68.length,
  declaredMediaCount: NARRATIVE_COLLECTABLES_V68.filter((entry) => entry.format !== 'text').length,
  complete: CATALOGUE_ERRORS_V68.length === 0
});

export function createNarrativeArchivesV68() {
  return {
    schema: NARRATIVE_ARCHIVE_SCHEMA_V68,
    discovered: {},
    readIds: [],
    playedIds: [],
    decisions: {},
    unlockedFlags: [],
    handledEventIds: []
  };
}

function normalizeDiscoveryV68(id, value) {
  if (!COLLECTABLE_BY_ID_V68.has(id)) return null;
  const candidate = isRecord(value) ? value : {};
  return {
    id,
    discoveredAtDay: integer(candidate.discoveredAtDay, 1, 1, 100000),
    discoveredAtHour: number(candidate.discoveredAtHour, 0, 0, 24),
    campaignId: text(candidate.campaignId) || NARRATIVE_OPERATION_V68.campaignId,
    worldId: text(candidate.worldId),
    levelId: text(candidate.levelId),
    sourceEventId: text(candidate.sourceEventId) || `collectable:${id}`,
    rewardClaimed: true
  };
}

function hasRequiredClaimsV68(ledger, requirementIds) {
  return requirementIds.every((claimId) => {
    const collectableId = CLAIM_TO_COLLECTABLE_V68.get(claimId);
    return Boolean(collectableId && ledger.discovered[collectableId]);
  });
}

function deriveUnlockFlagsV68(ledger) {
  const flags = new Set();
  const allCollected = NARRATIVE_COLLECTABLES_V68.every((entry) => ledger.discovered[entry.id]);
  if (allCollected) flags.add(NARRATIVE_OPERATION_V68.analysisUnlockFlag);
  for (const decision of NARRATIVE_DECISIONS_V68) {
    const optionId = ledger.decisions[decision.id];
    const option = decision.options.find((entry) => entry.id === optionId);
    if (option && hasRequiredClaimsV68(ledger, decision.requirements)) flags.add(option.routeUnlockFlag);
  }
  return [...flags].slice(-MAX_LEDGER_FLAGS);
}

export function normalizeNarrativeArchivesV68(value) {
  const source = isRecord(value) ? value : {};
  const ledger = createNarrativeArchivesV68();
  const discoveries = isRecord(source.discovered) ? source.discovered : {};
  for (const entry of NARRATIVE_COLLECTABLES_V68) {
    if (!Object.hasOwn(discoveries, entry.id)) continue;
    if (discoveries[entry.id] !== true && !isRecord(discoveries[entry.id])) continue;
    ledger.discovered[entry.id] = normalizeDiscoveryV68(entry.id, discoveries[entry.id]);
  }
  const discoveredIds = new Set(Object.keys(ledger.discovered));
  ledger.readIds = uniqueStrings(source.readIds).filter((id) => discoveredIds.has(id));
  ledger.playedIds = uniqueStrings(source.playedIds).filter((id) => {
    const entry = COLLECTABLE_BY_ID_V68.get(id);
    return discoveredIds.has(id) && entry?.format !== 'text';
  });
  const sourceDecisions = isRecord(source.decisions) ? source.decisions : {};
  for (const decision of NARRATIVE_DECISIONS_V68) {
    const optionId = text(sourceDecisions[decision.id]);
    if (decision.options.some((option) => option.id === optionId) && hasRequiredClaimsV68(ledger, decision.requirements)) {
      ledger.decisions[decision.id] = optionId;
    }
  }
  ledger.unlockedFlags = deriveUnlockFlagsV68({ ...ledger, unlockedFlags: source.unlockedFlags });
  const canonicalEvents = [
    ...Object.keys(ledger.discovered).map((id) => `collectable:${id}`),
    ...ledger.readIds.map((id) => `read:${id}`),
    ...Object.entries(ledger.decisions).map(([decisionId, optionId]) => `decision:${decisionId}:${optionId}`)
  ];
  const acceptedEvents = uniqueStrings(source.handledEventIds, MAX_LEDGER_EVENTS)
    .filter((eventId) => canonicalEvents.includes(eventId));
  ledger.handledEventIds = [...new Set([...acceptedEvents, ...canonicalEvents])].slice(-MAX_LEDGER_EVENTS);
  return ledger;
}

function ensureNarrativeArchivesV68(save) {
  if (!isRecord(save)) throw new Error('Sauvegarde narrative invalide.');
  save.narrativeArchives = normalizeNarrativeArchivesV68(save.narrativeArchives);
  return save.narrativeArchives;
}

export function discoverNarrativeCollectableV68(save, collectableId, context = {}) {
  const entry = COLLECTABLE_BY_ID_V68.get(collectableId);
  if (!entry) return { applied: false, reason: 'unknown-collectable', collectableId, rewards: {}, unlockedFlags: [] };
  const ledger = ensureNarrativeArchivesV68(save);
  if (ledger.discovered[collectableId]) {
    return {
      applied: false,
      reason: 'already-discovered',
      collectable: clone(entry),
      ledger: clone(ledger),
      rewards: {},
      unlockedFlags: []
    };
  }
  const flagsBefore = new Set(ledger.unlockedFlags);
  ledger.discovered[collectableId] = normalizeDiscoveryV68(collectableId, {
    discoveredAtDay: context.day ?? context.clock?.day,
    discoveredAtHour: context.hour ?? context.clock?.hour,
    campaignId: context.campaignId,
    worldId: context.worldId,
    levelId: context.levelId,
    sourceEventId: context.eventId
  });
  ledger.handledEventIds.push(`collectable:${collectableId}`);
  save.narrativeArchives = normalizeNarrativeArchivesV68(ledger);
  const unlockedFlags = save.narrativeArchives.unlockedFlags.filter((flag) => !flagsBefore.has(flag));
  return {
    applied: true,
    reason: 'discovered',
    collectable: clone(entry),
    ledger: clone(save.narrativeArchives),
    rewards: clone(entry.rewards),
    unlockedFlags
  };
}

export function markNarrativeCollectableReadV68(save, collectableId) {
  const entry = COLLECTABLE_BY_ID_V68.get(collectableId);
  if (!entry) return { applied: false, reason: 'unknown-collectable', collectableId };
  const ledger = ensureNarrativeArchivesV68(save);
  if (!ledger.discovered[collectableId]) return { applied: false, reason: 'not-discovered', collectable: clone(entry), ledger: clone(ledger) };
  if (ledger.readIds.includes(collectableId)) return { applied: false, reason: 'already-read', collectable: clone(entry), ledger: clone(ledger) };
  ledger.readIds.push(collectableId);
  ledger.handledEventIds.push(`read:${collectableId}`);
  save.narrativeArchives = normalizeNarrativeArchivesV68(ledger);
  return { applied: true, reason: 'read', collectable: clone(entry), ledger: clone(save.narrativeArchives) };
}

function resolveDecisionOptionV68(decisionIdOrOptionId, requestedOptionId) {
  const decisionId = requestedOptionId ? decisionIdOrOptionId : OPTION_TO_DECISION_V68.get(decisionIdOrOptionId);
  const optionId = requestedOptionId || decisionIdOrOptionId;
  const decision = DECISION_BY_ID_V68.get(decisionId);
  const option = decision?.options.find((entry) => entry.id === optionId);
  return { decision, option };
}

export function recordNarrativeDecisionV68(save, decisionIdOrOptionId, requestedOptionId = null) {
  const { decision, option } = resolveDecisionOptionV68(decisionIdOrOptionId, requestedOptionId);
  if (!decision || !option) return { applied: false, reason: 'unknown-decision' };
  const ledger = ensureNarrativeArchivesV68(save);
  if (!hasRequiredClaimsV68(ledger, decision.requirements)) {
    return { applied: false, reason: 'requirements-not-met', decisionId: decision.id, optionId: option.id, ledger: clone(ledger) };
  }
  const previousOptionId = ledger.decisions[decision.id];
  if (previousOptionId) {
    return {
      applied: false,
      reason: previousOptionId === option.id ? 'already-applied' : 'decision-locked',
      decisionId: decision.id,
      optionId: previousOptionId,
      ledger: clone(ledger)
    };
  }
  ledger.decisions[decision.id] = option.id;
  ledger.unlockedFlags.push(option.routeUnlockFlag);
  ledger.handledEventIds.push(`decision:${decision.id}:${option.id}`);
  save.narrativeArchives = normalizeNarrativeArchivesV68(ledger);
  return {
    applied: true,
    reason: 'decision-recorded',
    decisionId: decision.id,
    optionId: option.id,
    routeUnlockFlag: option.routeUnlockFlag,
    ledger: clone(save.narrativeArchives)
  };
}

export function getNarrativeInvestigationV68(save) {
  const ledger = normalizeNarrativeArchivesV68(save?.narrativeArchives);
  const discoveredIds = new Set(Object.keys(ledger.discovered));
  const discoveredClaimIds = new Set(NARRATIVE_COLLECTABLES_V68.flatMap((entry) => discoveredIds.has(entry.id) ? entry.claims.map((claim) => claim.id) : []));
  const entries = NARRATIVE_COLLECTABLES_V68.map((entry) => ({
    id: entry.id,
    title: entry.title,
    shortTitle: entry.shortTitle,
    type: entry.type,
    format: entry.format,
    source: `${entry.source.name} · ${entry.source.role}`,
    sourceDetails: clone(entry.source),
    summary: entry.summary,
    body: entry.body,
    physical: clone(entry.physical),
    discovered: discoveredIds.has(entry.id),
    read: ledger.readIds.includes(entry.id),
    claims: entry.claims.map((claim) => ({
      id: claim.id,
      subject: claim.subject,
      value: claim.value,
      stance: claim.stance,
      confidence: claim.confidence,
      statement: claim.statement
    }))
  }));
  const relations = NARRATIVE_RELATIONS_V68.map((relation) => ({
    ...clone(relation),
    active: discoveredClaimIds.has(relation.fromClaimId) && discoveredClaimIds.has(relation.toClaimId)
  }));
  const decisions = NARRATIVE_DECISIONS_V68.flatMap((decision) => decision.options.map((option) => ({
    id: option.id,
    decisionId: decision.id,
    label: option.label,
    description: option.description,
    requirements: [...decision.requirements],
    routeUnlockFlag: option.routeUnlockFlag,
    available: hasRequiredClaimsV68(ledger, decision.requirements) && !ledger.decisions[decision.id],
    selected: ledger.decisions[decision.id] === option.id,
    lockedByChoice: Boolean(ledger.decisions[decision.id] && ledger.decisions[decision.id] !== option.id)
  })));
  return {
    schema: NARRATIVE_ARCHIVE_SCHEMA_V68,
    operation: clone(NARRATIVE_OPERATION_V68),
    entries,
    discoveredCount: discoveredIds.size,
    totalCount: entries.length,
    unreadCount: entries.filter((entry) => entry.discovered && !entry.read).length,
    relations,
    activeContradictionCount: relations.filter((relation) => relation.active && relation.type === 'contradicts').length,
    activeCorroborationCount: relations.filter((relation) => relation.active && relation.type === 'corroborates').length,
    activeQualificationCount: relations.filter((relation) => relation.active && relation.type === 'qualifies').length,
    decisions,
    unlockedFlags: [...ledger.unlockedFlags],
    handledEventIds: [...ledger.handledEventIds],
    analysisComplete: ledger.unlockedFlags.includes(NARRATIVE_OPERATION_V68.analysisUnlockFlag)
  };
}
