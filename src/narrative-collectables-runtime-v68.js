import {
  NARRATIVE_COLLECTABLES_V68,
  createNarrativeArchivesV68,
  discoverNarrativeCollectableV68,
  getNarrativeInvestigationV68,
  normalizeNarrativeArchivesV68
} from './narrative-collectables-v68.js';
import {
  QZ17_COLLECTABLES_SHEET_V68,
  resolveQz17CollectableCellV68
} from './narrative-collectables-visuals-v68.js';

export const NARRATIVE_COLLECTABLES_RUNTIME_SCHEMA_V68 = 68;
export const QZ17_OPERATION_ID_V68 = 'qz17-ghost-cargo';
export const QZ17_CAMPAIGN_ID_V68 = 'special-narrative-qz17';
export const QZ17_SPECIAL_OPERATION_ID_V68 = 'narrative-collectables';
export const QZ17_ROUTE_FLAG_V68 = 'qz17-route-analysis-complete';
export const QZ17_ROUTE_CHOICE_FLAGS_V68 = Object.freeze(['qz17-maintenance-bypass', 'qz17-quarantine-lock']);
export const QZ17_ROUTE_DECISION_ID_V68 = 'qz17-route-verdict';
export const QZ17_ROUTE_CONSEQUENCES_V68 = Object.freeze({
  'follow-maintenance-trace': Object.freeze({
    choiceId: 'follow-maintenance-trace',
    flag: 'qz17-maintenance-bypass',
    routeId: 'ship-service-route',
    accessKind: 'vent',
    accessId: 'ship-command-depth-entrance',
    exitId: 'ship-airlock-wall-exit',
    blockedDoorId: 'aft-bulkhead',
    label: 'CONDUIT DE MAINTENANCE VERS LE SAS ARRIÈRE'
  }),
  'secure-quarantine-evidence': Object.freeze({
    choiceId: 'secure-quarantine-evidence',
    flag: 'qz17-quarantine-lock',
    routeId: 'ship-spine',
    accessKind: 'door',
    accessId: 'aft-bulkhead',
    exitId: 'outer-airlock',
    blockedVentId: 'ship-command-depth-entrance',
    label: 'COULOIR PRESSURISÉ DE QUARANTAINE'
  })
});

export const QZ17_COLLECTABLE_ATLAS_V68 = QZ17_COLLECTABLES_SHEET_V68;

const PHYSICAL_LAYOUT_V68 = Object.freeze([
  Object.freeze({ id: 'qz17-pda-loading-chief', kind: 'pda', nodeId: 'ship-dock', ratio: 0.12, offsetX: -54, w: 54, h: 38 }),
  Object.freeze({ id: 'qz17-email-logistics-denial', kind: 'data-slate', nodeId: 'ship-cargo', ratio: 0.28, offsetX: 44, w: 58, h: 42 }),
  Object.freeze({ id: 'qz17-black-box-forklift', kind: 'black-box', nodeId: 'ship-reactor', ratio: 0.5, offsetX: -58, w: 66, h: 52 }),
  Object.freeze({ id: 'qz17-cargo-seal-fragment', kind: 'cargo-seal', nodeId: 'ship-bridge', ratio: 0.63, offsetX: 52, w: 50, h: 44 })
]);

export const QZ17_PHYSICAL_COLLECTABLES_V68 = Object.freeze(PHYSICAL_LAYOUT_V68.map((layout) => {
  const record = NARRATIVE_COLLECTABLES_V68.find((entry) => entry.id === layout.id);
  if (!record) throw new Error(`QZ-17: collectable narratif absent du catalogue: ${layout.id}`);
  const visual = resolveQz17CollectableCellV68(layout.id);
  if (!visual) throw new Error(`QZ-17: cellule visuelle absente du registre: ${layout.id}`);
  return Object.freeze({
    ...layout,
    label: String(record.physical?.interactionLabel || record.title || layout.id).toUpperCase(),
    visual
  });
}));

const COLLECTABLE_IDS = Object.freeze(QZ17_PHYSICAL_COLLECTABLES_V68.map((entry) => entry.id));
const COLLECTABLE_ID_SET = new Set(COLLECTABLE_IDS);
const INTERACTION_RANGE = 118;
const isRecord = (value) => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const asList = (value) => Array.isArray(value) ? value : [];
const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

function entityDistance(first, second) {
  const ax = (Number(first?.x) || 0) + (Number(first?.w) || 0) / 2;
  const ay = (Number(first?.y) || 0) + (Number(first?.h) || 0) / 2;
  const bx = (Number(second?.x) || 0) + (Number(second?.w) || 0) / 2;
  const by = (Number(second?.y) || 0) + (Number(second?.h) || 0) / 2;
  return Math.hypot(ax - bx, ay - by);
}

function safeCollectedIds(value) {
  return [...new Set(asList(value).map(String).filter((id) => COLLECTABLE_ID_SET.has(id)))];
}

function discoveredIds(ledger) {
  const discovered = ledger?.discovered;
  if (Array.isArray(discovered)) return safeCollectedIds(discovered.map((entry) => typeof entry === 'string' ? entry : entry?.id));
  if (!isRecord(discovered)) return [];
  return safeCollectedIds(Object.entries(discovered).filter(([, entry]) => entry != null && entry !== false).map(([id]) => id));
}

function sanitizeRuntime(value = {}) {
  const source = isRecord(value) ? value : {};
  const routeChoiceId = Object.hasOwn(QZ17_ROUTE_CONSEQUENCES_V68, source.route?.choiceId)
    ? source.route.choiceId
    : null;
  const routeConsequence = routeChoiceId ? QZ17_ROUTE_CONSEQUENCES_V68[routeChoiceId] : null;
  return {
    schema: NARRATIVE_COLLECTABLES_RUNTIME_SCHEMA_V68,
    operationId: QZ17_OPERATION_ID_V68,
    campaignId: QZ17_CAMPAIGN_ID_V68,
    collectedIds: safeCollectedIds(source.collectedIds),
    gate: {
      doorId: typeof source.gate?.doorId === 'string' ? source.gate.doorId.slice(0, 120) : null,
      opened: Boolean(source.gate?.opened),
      openedAt: Number.isFinite(Number(source.gate?.openedAt)) ? Math.max(0, Number(source.gate.openedAt)) : null
    },
    route: {
      choiceId: routeChoiceId,
      routeId: routeConsequence?.routeId || null,
      accessKind: routeConsequence?.accessKind || null,
      accessId: routeConsequence?.accessId || null,
      exitId: routeConsequence?.exitId || null,
      applied: Boolean(routeConsequence && source.route?.applied),
      appliedAt: Number.isFinite(Number(source.route?.appliedAt)) ? Math.max(0, Number(source.route.appliedAt)) : null
    },
    telemetry: {
      discoveries: clamp(Math.round(Number(source.telemetry?.discoveries) || 0), 0, COLLECTABLE_IDS.length),
      duplicateAttempts: clamp(Math.round(Number(source.telemetry?.duplicateAttempts) || 0), 0, 9999),
      outOfRangeAttempts: clamp(Math.round(Number(source.telemetry?.outOfRangeAttempts) || 0), 0, 9999)
    }
  };
}

export function createNarrativeCollectablesRuntimeStateV68() {
  return sanitizeRuntime();
}

export function validateNarrativeCollectablePlacementV68(engine) {
  if (!engine?.narrativeCollectablesV68) return Object.freeze({ valid: false, errors: Object.freeze(['runtime missing']), count: 0 });
  const errors = [];
  const platforms = new Map(asList(engine.platforms).map((entry) => [entry.id, entry]));
  const ids = new Set();
  for (const collectable of asList(engine.narrativeCollectableActorsV68)) {
    if (ids.has(collectable.id)) errors.push(`duplicate collectable ${collectable.id}`);
    ids.add(collectable.id);
    const surface = platforms.get(collectable.surfacePlatformIdV68);
    if (!surface) errors.push(`${collectable.id} has no physical surface`);
    else {
      if (collectable.x < surface.x || collectable.x + collectable.w > surface.x + surface.w) errors.push(`${collectable.id} leaves ${surface.id}`);
      if (Math.abs(collectable.y + collectable.h - surface.y) > 1) errors.push(`${collectable.id} floats above ${surface.id}`);
    }
    if (collectable.x < 0 || collectable.x + collectable.w > Number(engine.missionLevelBounds?.width || 0)) errors.push(`${collectable.id} outside level bounds`);
  }
  if (ids.size !== COLLECTABLE_IDS.length) errors.push(`physical collectable count ${ids.size}/${COLLECTABLE_IDS.length}`);
  return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors), count: ids.size });
}

function normalizeLedger(value) {
  return normalizeNarrativeArchivesV68(value || createNarrativeArchivesV68());
}

export function withNarrativeCollectablesRuntimeV68(BaseEngine) {
  return class NarrativeCollectablesRuntimeV68 extends BaseEngine {
    start(options = {}) {
      const campaignId = String(options.campaign?.id || '');
      const operationId = String(options.specialOperationId || options.operation?.specialOperationId || options.operation?.id || '');
      this.narrativeCollectablesActiveV68 = campaignId === QZ17_CAMPAIGN_ID_V68
        || operationId === QZ17_SPECIAL_OPERATION_ID_V68
        || operationId === QZ17_OPERATION_ID_V68;
      this.narrativeCollectablesV68 = this.narrativeCollectablesActiveV68 ? createNarrativeCollectablesRuntimeStateV68() : null;
      this.narrativeCollectableActorsV68 = [];
      this.narrativeCollectablesPendingResumeV68 = null;
      this.onNarrativeArchivesChangeV68 = typeof options.onNarrativeArchivesChange === 'function' ? options.onNarrativeArchivesChange : null;
      this.narrativeArchiveSaveV68 = isRecord(options.narrativeArchiveSave)
        ? options.narrativeArchiveSave
        : { narrativeArchives: normalizeLedger(options.narrativeArchives) };
      this.narrativeArchiveSaveV68.narrativeArchives = normalizeLedger(this.narrativeArchiveSaveV68.narrativeArchives);
      const snapshot = super.start(options);
      if (!this.isNarrativeCollectablesV68()) return snapshot;
      this.loadNarrativeCollectableVisualsV68();
      this.configureNarrativeCollectablesWorldV68();
      this.syncNarrativeEvidenceGateV68({ emit: false });
      this.onEvent({ type: 'special-operation-started', operationId: QZ17_OPERATION_ID_V68, campaignId: QZ17_CAMPAIGN_ID_V68, phase: 'investigate-cargo-records', collectableCount: COLLECTABLE_IDS.length });
      return { ...snapshot, ...this.getNarrativeCollectablesSnapshotV68() };
    }

    isNarrativeCollectablesV68() {
      return Boolean(this.narrativeCollectablesActiveV68 || this.campaign?.id === QZ17_CAMPAIGN_ID_V68 || this.missionPlan?.campaign?.id === QZ17_CAMPAIGN_ID_V68);
    }

    loadNarrativeCollectableVisualsV68() {
      if (!this.images || typeof globalThis.Image !== 'function') return false;
      if (this.images.has(QZ17_COLLECTABLE_ATLAS_V68.imageKey)) return true;
      const image = new globalThis.Image();
      image.decoding = 'async';
      image.src = QZ17_COLLECTABLE_ATLAS_V68.path;
      this.images.set(QZ17_COLLECTABLE_ATLAS_V68.imageKey, image);
      return true;
    }

    narrativeLedgerV68() {
      this.narrativeArchiveSaveV68 ||= { narrativeArchives: createNarrativeArchivesV68() };
      this.narrativeArchiveSaveV68.narrativeArchives = normalizeLedger(this.narrativeArchiveSaveV68.narrativeArchives);
      return this.narrativeArchiveSaveV68.narrativeArchives;
    }

    setNarrativeArchivesV68(ledger, { emit = true } = {}) {
      this.narrativeArchiveSaveV68 ||= {};
      this.narrativeArchiveSaveV68.narrativeArchives = normalizeLedger(ledger);
      if (!this.isNarrativeCollectablesV68() || !this.narrativeCollectablesV68) return false;
      const collected = new Set(discoveredIds(this.narrativeLedgerV68()));
      this.narrativeCollectablesV68.collectedIds = safeCollectedIds([...collected]);
      for (const actor of this.narrativeCollectableActorsV68) actor.collected = collected.has(actor.id);
      this.narrativeCollectablesV68.telemetry.discoveries = this.narrativeCollectablesV68.collectedIds.length;
      this.syncNarrativeEvidenceGateV68({ emit });
      return true;
    }

    narrativeRouteChoiceV68() {
      const choiceId = this.narrativeLedgerV68().decisions?.[QZ17_ROUTE_DECISION_ID_V68];
      return Object.hasOwn(QZ17_ROUTE_CONSEQUENCES_V68, choiceId) ? choiceId : null;
    }

    narrativeRouteConsequenceV68() {
      const choiceId = this.narrativeRouteChoiceV68();
      return choiceId ? QZ17_ROUTE_CONSEQUENCES_V68[choiceId] : null;
    }

    nearestNarrativeVentEntranceV68(actor = this.player) {
      if (!this.isNarrativeCollectablesV68() || !actor) return null;
      return asList(this.vents)
        .filter((portal) => portal.portalRole === 'entrance')
        .map((portal) => ({ portal, distance: entityDistance(actor, portal) }))
        .filter(({ distance }) => distance <= 135)
        .sort((left, right) => left.distance - right.distance)[0]?.portal || null;
    }

    applyNarrativeRouteConsequenceV68() {
      const state = this.narrativeCollectablesV68;
      const door = this.narrativeEvidenceDoorV68();
      if (!state || !door) return { changed: false, authorized: false, consequence: null, door: null };
      const consequence = this.narrativeRouteConsequenceV68();
      const flags = asList(this.narrativeLedgerV68().unlockedFlags);
      const authorized = Boolean(this.narrativeEvidenceAnalyzedV68() && consequence && flags.includes(consequence.flag));
      const before = JSON.stringify({
        gate: state.gate,
        route: state.route,
        door: { open: door.open, progress: door.progress, levelLocked: door.levelLocked, lockedBy: door.lockedBy },
        vents: asList(this.vents).map((portal) => ({ id: portal.id, open: portal.open, requiresTool: portal.requiresTool, narrativeRouteLockedV68: portal.narrativeRouteLockedV68 }))
      });
      const maintenanceSelected = authorized && consequence.accessKind === 'vent';
      const quarantineSelected = authorized && consequence.accessKind === 'door';
      const selectedVentId = maintenanceSelected ? consequence.accessId : null;
      const selectedExitId = maintenanceSelected ? consequence.exitId : null;
      for (const portal of asList(this.vents)) {
        if (portal.portalRole === 'entrance') {
          const selected = maintenanceSelected && (portal.id === selectedVentId || portal.portalId === selectedVentId);
          portal.narrativeRouteLockedV68 = !selected;
          portal.narrativeRouteAccessV68 = selected;
          portal.requiresTool = !selected;
          portal.open = selected;
        }
        if (portal.portalRole === 'exit') {
          const selected = maintenanceSelected && (portal.id === selectedExitId || portal.portalId === selectedExitId);
          portal.narrativeRouteExitV68 = selected;
          portal.open = selected;
        }
      }
      if (quarantineSelected) {
        door.levelLocked = false;
        door.lockedBy = null;
        door.open = true;
        door.progress = 1;
        state.gate.opened = true;
        state.gate.openedAt ??= Math.max(0, Number(this.mission?.elapsed) || 0);
      } else {
        door.levelLocked = true;
        door.lockedBy = maintenanceSelected ? 'qz17-maintenance-route' : 'qz17-evidence';
        door.open = false;
        door.progress = 0;
        state.gate.opened = false;
        state.gate.openedAt = null;
      }
      const previousAppliedAt = state.route?.choiceId === consequence?.choiceId && state.route?.applied
        ? state.route.appliedAt
        : null;
      state.route = consequence && authorized ? {
        choiceId: consequence.choiceId,
        routeId: consequence.routeId,
        accessKind: consequence.accessKind,
        accessId: consequence.accessId,
        exitId: consequence.exitId,
        applied: true,
        appliedAt: previousAppliedAt ?? Math.max(0, Number(this.mission?.elapsed) || 0)
      } : {
        choiceId: null,
        routeId: null,
        accessKind: null,
        accessId: null,
        exitId: null,
        applied: false,
        appliedAt: null
      };
      const after = JSON.stringify({
        gate: state.gate,
        route: state.route,
        door: { open: door.open, progress: door.progress, levelLocked: door.levelLocked, lockedBy: door.lockedBy },
        vents: asList(this.vents).map((portal) => ({ id: portal.id, open: portal.open, requiresTool: portal.requiresTool, narrativeRouteLockedV68: portal.narrativeRouteLockedV68 }))
      });
      return { changed: before !== after, authorized, consequence, door };
    }

    narrativeSurfaceCandidatesV68() {
      return asList(this.platforms)
        .filter((platform) => platform?.kind !== 'lift' && Number.isFinite(Number(platform?.x)) && Number.isFinite(Number(platform?.y)) && Number(platform?.w) >= 90)
        .sort((left, right) => Number(left.x) - Number(right.x) || Number(left.y) - Number(right.y));
    }

    narrativeSurfaceForSpecV68(spec) {
      const surfaces = this.narrativeSurfaceCandidatesV68();
      const named = surfaces.find((surface) => surface.nodeId === spec.nodeId || surface.id === `node-platform-${spec.nodeId}`);
      if (named) return named;
      const targetX = Math.max(1, Number(this.missionLevelBounds?.width) || 6200) * spec.ratio;
      const used = new Set(this.narrativeCollectableActorsV68.map((entry) => entry.surfacePlatformIdV68));
      return [...surfaces].sort((left, right) => {
        const leftScore = Math.abs(left.x + left.w / 2 - targetX) + (used.has(left.id) ? 10000 : 0);
        const rightScore = Math.abs(right.x + right.w / 2 - targetX) + (used.has(right.id) ? 10000 : 0);
        return leftScore - rightScore;
      })[0] || null;
    }

    buildNarrativeCollectableActorV68(spec, collected) {
      const surface = this.narrativeSurfaceForSpecV68(spec);
      if (!surface) throw new Error(`QZ-17: aucune surface physique pour ${spec.id}`);
      const margin = spec.w / 2 + 4;
      const center = clamp(surface.x + surface.w / 2 + spec.offsetX, surface.x + margin, surface.x + surface.w - margin);
      return {
        ...spec,
        x: Math.round(center - spec.w / 2), y: Math.round(surface.y - spec.h),
        collected: collected.has(spec.id), surfacePlatformIdV68: surface.id,
        zoneId: surface.zoneId || null, nodeId: surface.nodeId || spec.nodeId,
        operationId: QZ17_OPERATION_ID_V68, imageKey: QZ17_COLLECTABLE_ATLAS_V68.imageKey
      };
    }

    configureNarrativeCollectablesWorldV68() {
      if (!this.isNarrativeCollectablesV68() || !this.narrativeCollectablesV68 || !this.missionLevelRuntime) return false;
      if (this.narrativeCollectablesPendingResumeV68) this.narrativeCollectablesV68 = sanitizeRuntime(this.narrativeCollectablesPendingResumeV68);
      const collected = new Set(discoveredIds(this.narrativeLedgerV68()));
      this.narrativeCollectablesV68.collectedIds = safeCollectedIds([...collected]);
      this.narrativeCollectablesV68.telemetry.discoveries = this.narrativeCollectablesV68.collectedIds.length;
      this.narrativeCollectableActorsV68 = [];
      for (const spec of QZ17_PHYSICAL_COLLECTABLES_V68) this.narrativeCollectableActorsV68.push(this.buildNarrativeCollectableActorV68(spec, collected));
      this.configureNarrativeEvidenceGateV68();
      const placement = validateNarrativeCollectablePlacementV68(this);
      if (!placement.valid) throw new Error(`QZ-17: placement physique invalide: ${placement.errors.join('; ')}`);
      this.narrativeCollectablesPendingResumeV68 = null;
      return true;
    }

    narrativeEvidenceAnalyzedV68() {
      if (!this.narrativeCollectablesV68) return false;
      const ledger = this.narrativeLedgerV68();
      const persistedIds = new Set(discoveredIds(ledger));
      const investigation = getNarrativeInvestigationV68(this.narrativeArchiveSaveV68);
      return COLLECTABLE_IDS.every((id) => persistedIds.has(id))
        && Boolean(investigation?.analysisComplete || asList(ledger.unlockedFlags).includes(QZ17_ROUTE_FLAG_V68));
    }

    narrativeEvidenceCompleteV68() {
      if (!this.narrativeCollectablesV68) return false;
      const flags = asList(this.narrativeLedgerV68().unlockedFlags);
      const consequence = this.narrativeRouteConsequenceV68();
      return Boolean(this.narrativeEvidenceAnalyzedV68() && consequence && flags.includes(consequence.flag));
    }

    configureNarrativeEvidenceGateV68() {
      const state = this.narrativeCollectablesV68;
      if (!state) return null;
      const maxEvidenceX = Math.max(...this.narrativeCollectableActorsV68.map((entry) => entry.x + entry.w));
      const preferredIds = ['aft-bulkhead', 'security-gate', 'outer-airlock', 'colony-main-gate'];
      const authored = asList(this.doors).find((door) => door.id === 'aft-bulkhead');
      const preferred = preferredIds.map((id) => asList(this.doors).find((door) => door.id === id)).find((door) => door && door.x > maxEvidenceX);
      const afterEvidence = asList(this.doors).filter((door) => door.x > maxEvidenceX + 100).sort((left, right) => left.x - right.x)[0];
      const door = authored || preferred || afterEvidence || asList(this.doors).at(-1);
      if (!door) throw new Error('QZ-17: aucune porte physique disponible pour la confrontation des preuves');
      state.gate.doorId = door.id;
      door.narrativeEvidenceGateV68 = true;
      this.applyNarrativeRouteConsequenceV68();
      return door;
    }

    narrativeEvidenceDoorV68() {
      return asList(this.doors).find((door) => door.id === this.narrativeCollectablesV68?.gate?.doorId) || null;
    }

    nearestNarrativeCollectableV68(actor = this.player) {
      if (!this.isNarrativeCollectablesV68() || !actor?.alive) return null;
      return this.narrativeCollectableActorsV68
        .filter((entry) => !entry.collected)
        .map((entry) => ({ entry, distance: entityDistance(actor, entry) }))
        .filter(({ distance }) => distance <= INTERACTION_RANGE)
        .sort((left, right) => left.distance - right.distance)[0]?.entry || null;
    }

    collectNarrativeCollectableV68(actor = this.player, collectableOrId = this.nearestNarrativeCollectableV68(actor)) {
      if (!this.isNarrativeCollectablesV68() || !actor?.alive || this.mission?.state !== 'active') return false;
      const collectable = typeof collectableOrId === 'string'
        ? this.narrativeCollectableActorsV68.find((entry) => entry.id === collectableOrId)
        : collectableOrId;
      if (!collectable || !COLLECTABLE_ID_SET.has(collectable.id)) return false;
      if (collectable.collected || this.narrativeCollectablesV68.collectedIds.includes(collectable.id)) {
        this.narrativeCollectablesV68.telemetry.duplicateAttempts += 1;
        return false;
      }
      if (entityDistance(actor, collectable) > INTERACTION_RANGE) {
        this.narrativeCollectablesV68.telemetry.outOfRangeAttempts += 1;
        return false;
      }
      const mutation = discoverNarrativeCollectableV68(this.narrativeArchiveSaveV68, collectable.id, {
        operationId: QZ17_OPERATION_ID_V68, campaignId: QZ17_CAMPAIGN_ID_V68,
        zoneId: collectable.zoneId, nodeId: collectable.nodeId,
        surfacePlatformId: collectable.surfacePlatformIdV68,
        missionElapsed: Math.max(0, Number(this.mission?.elapsed) || 0)
      });
      if (!mutation?.applied) {
        if (mutation?.reason === 'already-discovered' || discoveredIds(this.narrativeLedgerV68()).includes(collectable.id)) {
          collectable.collected = true;
          this.narrativeCollectablesV68.collectedIds = safeCollectedIds([...this.narrativeCollectablesV68.collectedIds, collectable.id]);
          this.narrativeCollectablesV68.telemetry.duplicateAttempts += 1;
        }
        return false;
      }
      if (mutation.ledger) this.narrativeArchiveSaveV68.narrativeArchives = normalizeLedger(mutation.ledger);
      collectable.collected = true;
      this.narrativeCollectablesV68.collectedIds = safeCollectedIds([...this.narrativeCollectablesV68.collectedIds, collectable.id]);
      this.narrativeCollectablesV68.telemetry.discoveries = this.narrativeCollectablesV68.collectedIds.length;
      const intelReward = clamp(Math.floor(Number(mutation.rewards?.intel) || 0), 0, 99999999);
      if (this.inventory && intelReward > 0) {
        this.inventory.intel = clamp(Math.floor(Number(this.inventory.intel) || 0) + intelReward, 0, 99999999);
      }
      this.setInteractionAnimation?.(actor, 'ground-interact', 0.55);
      this.audio?.ui?.();
      this.onNarrativeArchivesChangeV68?.(clone(this.narrativeLedgerV68()), clone(mutation));
      this.onEvent({ type: 'narrative-collectable-discovered', operationId: QZ17_OPERATION_ID_V68, campaignId: QZ17_CAMPAIGN_ID_V68, collectableId: collectable.id, rewards: clone(mutation.rewards || {}), unlockedFlags: clone(mutation.unlockedFlags || []) });
      this.onEvent({ type: 'archive-reader-open', operationId: QZ17_OPERATION_ID_V68, collectableId: collectable.id });
      this.syncNarrativeEvidenceGateV68({ emit: true });
      return true;
    }

    syncNarrativeEvidenceGateV68({ emit = false } = {}) {
      const resolution = this.applyNarrativeRouteConsequenceV68();
      if (emit && resolution.changed && resolution.authorized) {
        this.onEvent({
          type: 'narrative-route-unlocked',
          operationId: QZ17_OPERATION_ID_V68,
          flag: resolution.consequence.flag,
          choiceId: resolution.consequence.choiceId,
          routeId: resolution.consequence.routeId,
          accessKind: resolution.consequence.accessKind,
          accessId: resolution.consequence.accessId,
          doorId: resolution.consequence.accessKind === 'door' ? resolution.door.id : null,
          physicalDoorOpen: resolution.consequence.accessKind === 'door' && Boolean(resolution.door.open),
          physicalVentOpen: resolution.consequence.accessKind === 'vent'
        });
      }
      return resolution.changed;
    }

    triggerMissionLevelEvent(eventId, source = 'runtime') {
      const result = super.triggerMissionLevelEvent(eventId, source);
      if (this.isNarrativeCollectablesV68() && result) this.syncNarrativeEvidenceGateV68({ emit: false });
      return result;
    }

    narrativeVentRequirementV68(entrance) {
      if (!this.isNarrativeCollectablesV68() || !entrance) return '';
      if (!this.narrativeEvidenceAnalyzedV68()) {
        return `PREUVES QZ-17 INCOMPLÈTES (${this.narrativeCollectablesV68?.collectedIds?.length || 0}/${COLLECTABLE_IDS.length})`;
      }
      const consequence = this.narrativeRouteConsequenceV68();
      if (!this.narrativeEvidenceCompleteV68() || !consequence) return 'VERDICT QZ-17 REQUIS DANS LES ARCHIVES';
      if (consequence.accessKind !== 'vent') return 'ITINÉRAIRE DE MAINTENANCE NON RETENU';
      const entranceId = entrance.portalId || entrance.id;
      if (entranceId !== consequence.accessId) return 'CONDUIT HORS ITINÉRAIRE QZ-17 AUTORISÉ';
      return '';
    }

    enterMissionVentV62(actor = this.player) {
      if (!this.isNarrativeCollectablesV68() || actor !== this.player && actor !== this.coop) {
        return super.enterMissionVentV62(actor);
      }
      const entrance = this.nearestNarrativeVentEntranceV68(actor);
      if (entrance && this.narrativeVentRequirementV68(entrance)) return null;
      return super.enterMissionVentV62(actor);
    }

    interact(actor = this.player) {
      const collectable = this.nearestNarrativeCollectableV68(actor);
      if (collectable && this.collectNarrativeCollectableV68(actor, collectable)) return true;
      const ventEntrance = this.nearestNarrativeVentEntranceV68(actor);
      const ventRequirement = this.narrativeVentRequirementV68(ventEntrance);
      if (ventRequirement) return this.locked(ventRequirement);
      return super.interact(actor);
    }

    doorRequirement(door) {
      if (this.isNarrativeCollectablesV68() && door?.id === this.narrativeCollectablesV68?.gate?.doorId) {
        if (!this.narrativeEvidenceAnalyzedV68()) return `PREUVES QZ-17 INCOMPLÈTES (${this.narrativeCollectablesV68.collectedIds.length}/${COLLECTABLE_IDS.length})`;
        const consequence = this.narrativeRouteConsequenceV68();
        if (!this.narrativeEvidenceCompleteV68() || !consequence) return 'VERDICT QZ-17 REQUIS DANS LES ARCHIVES';
        if (consequence.accessKind === 'vent') return 'ROUTE DÉVIÉE PAR LE CONDUIT DE MAINTENANCE';
      }
      return super.doorRequirement(door);
    }

    missingExtractionRequirement() {
      const inherited = super.missingExtractionRequirement();
      if (!this.isNarrativeCollectablesV68()) return inherited;
      if (!this.narrativeEvidenceAnalyzedV68()) return `PREUVES QZ-17 INCOMPLÈTES (${this.narrativeCollectablesV68?.collectedIds?.length || 0}/${COLLECTABLE_IDS.length})`;
      if (!this.narrativeEvidenceCompleteV68()) return 'VERDICT QZ-17 NON ENREGISTRÉ';
      return inherited;
    }

    completeMission(actor = this.player) {
      if (this.isNarrativeCollectablesV68() && this.missingExtractionRequirement()) return false;
      return super.completeMission(actor);
    }

    getInteractionPrompt(actor = this.player) {
      const collectable = this.nearestNarrativeCollectableV68(actor);
      if (collectable) return `E  RÉCUPÉRER — ${collectable.label}`;
      const ventEntrance = this.nearestNarrativeVentEntranceV68(actor);
      const ventRequirement = this.narrativeVentRequirementV68(ventEntrance);
      if (ventRequirement) return `E  VERROUILLÉ — ${ventRequirement}`;
      return super.getInteractionPrompt(actor);
    }

    drawNarrativeCollectableFallbackV68(ctx, collectable) {
      const { x, y, w, h } = collectable;
      ctx.save();
      ctx.fillStyle = collectable.kind === 'black-box' ? '#8b512e' : collectable.kind === 'cargo-seal' ? '#b4a15f' : '#263c38';
      ctx.strokeStyle = '#b8d8c3'; ctx.lineWidth = 2;
      ctx.fillRect(x + 4, y + 4, w - 8, h - 6); ctx.strokeRect(x + 4.5, y + 4.5, w - 9, h - 7);
      ctx.fillStyle = '#7ed4ad'; ctx.fillRect(x + w * 0.24, y + h * 0.28, w * 0.52, Math.max(3, h * 0.12));
      ctx.restore();
    }

    drawNarrativeCollectableV68(ctx, collectable) {
      if (!ctx || collectable.collected) return false;
      const image = this.images?.get(QZ17_COLLECTABLE_ATLAS_V68.imageKey);
      const ready = Boolean(image?.complete && (image.naturalWidth || image.width) > 0 && (image.naturalHeight || image.height) > 0);
      const bob = this.accessibilityRuntime?.reducedMotion || this.reducedMotion ? 0 : Math.sin((Number(this.animationTime) || 0) * 3.4 + collectable.visual.row * 0.8 + collectable.visual.column) * 1.5;
      if (!ready) this.drawNarrativeCollectableFallbackV68(ctx, { ...collectable, y: collectable.y + bob });
      else {
        const sw = (image.naturalWidth || image.width) / QZ17_COLLECTABLE_ATLAS_V68.columns;
        const sh = (image.naturalHeight || image.height) / QZ17_COLLECTABLE_ATLAS_V68.rows;
        const destination = {
          x: collectable.x - 10,
          y: collectable.y - 12 + bob,
          w: collectable.w + 20,
          h: collectable.h + 18
        };
        const scale = Math.min(destination.w / sw, destination.h / sh);
        const drawWidth = sw * scale;
        const drawHeight = sh * scale;
        const drawX = destination.x + (destination.w - drawWidth) / 2;
        const drawY = destination.y + (destination.h - drawHeight) / 2;
        ctx.drawImage(image, collectable.visual.column * sw, collectable.visual.row * sh, sw, sh, drawX, drawY, drawWidth, drawHeight);
      }
      return true;
    }

    drawWorld(ctx) {
      super.drawWorld(ctx);
      if (this.isNarrativeCollectablesV68() && ctx) for (const collectable of this.narrativeCollectableActorsV68) this.drawNarrativeCollectableV68(ctx, collectable);
    }

    drawHud(ctx) {
      super.drawHud(ctx);
      if (!this.isNarrativeCollectablesV68() || !this.narrativeCollectablesV68 || !ctx) return;
      ctx.save();
      ctx.fillStyle = 'rgba(3, 9, 8, .9)'; ctx.fillRect(914, 94, 348, 58);
      ctx.strokeStyle = this.narrativeEvidenceCompleteV68() ? '#78c9a0' : '#b69358'; ctx.strokeRect(914.5, 94.5, 347, 57);
      ctx.fillStyle = '#d9c27b'; ctx.font = 'bold 11px monospace'; ctx.fillText('QZ-17 · LA CARGAISON FANTÔME', 928, 114);
      ctx.fillStyle = '#c7d5ca'; ctx.fillText(`PREUVES PHYSIQUES ${this.narrativeCollectablesV68.collectedIds.length}/${COLLECTABLE_IDS.length}`, 928, 134);
      ctx.restore();
    }

    captureResumeState() {
      const base = super.captureResumeState();
      if (!this.isNarrativeCollectablesV68() || !this.narrativeCollectablesV68) return base;
      return { ...base, specialOperation: { ...(isRecord(base.specialOperation) ? base.specialOperation : {}), operationId: QZ17_OPERATION_ID_V68, narrativeCollectablesV68: sanitizeRuntime(this.narrativeCollectablesV68) } };
    }

    applyResumeState(rawState) {
      const source = rawState?.specialOperation?.narrativeCollectablesV68 || rawState?.narrativeCollectablesV68;
      const result = super.applyResumeState(rawState);
      if (!this.isNarrativeCollectablesV68() || !result?.applied || !isRecord(source)) return result;
      if (Number(source.schema) !== NARRATIVE_COLLECTABLES_RUNTIME_SCHEMA_V68) return { ...result, narrativeCollectablesRestoredV68: false, narrativeCollectablesReasonV68: 'schema-mismatch' };
      this.narrativeCollectablesV68 = sanitizeRuntime(source);
      this.narrativeCollectablesPendingResumeV68 = this.narrativeCollectablesV68;
      if (this.missionLevelRuntime && asList(this.platforms).length) {
        this.configureNarrativeCollectablesWorldV68();
        this.syncNarrativeEvidenceGateV68({ emit: false });
      }
      return { ...result, restored: (Number(result.restored) || 0) + 1, specialOperationRestored: true, narrativeCollectablesRestoredV68: true };
    }

    getNarrativeCollectablesSnapshotV68() {
      if (!this.isNarrativeCollectablesV68() || !this.narrativeCollectablesV68) return {};
      const state = sanitizeRuntime(this.narrativeCollectablesV68);
      const door = this.narrativeEvidenceDoorV68();
      const consequence = this.narrativeRouteConsequenceV68();
      const routePortal = consequence?.accessKind === 'vent'
        ? asList(this.vents).find((portal) => portal.portalId === consequence.accessId || portal.id === consequence.accessId)
        : null;
      return { narrativeCollectablesV68: {
        ...state, total: COLLECTABLE_IDS.length, remaining: COLLECTABLE_IDS.length - state.collectedIds.length,
        physicalActors: this.narrativeCollectableActorsV68.map((entry) => ({ id: entry.id, collected: entry.collected, x: entry.x, y: entry.y, w: entry.w, h: entry.h, nodeId: entry.nodeId, zoneId: entry.zoneId, surfacePlatformId: entry.surfacePlatformIdV68 })),
        placement: validateNarrativeCollectablePlacementV68(this),
        physicalGate: door ? { id: door.id, open: Boolean(door.open), progress: Number(door.progress) || 0, locked: Boolean(this.doorRequirement(door)) } : null,
        routeConsequence: consequence && this.narrativeEvidenceCompleteV68() ? {
          choiceId: consequence.choiceId,
          routeId: consequence.routeId,
          accessKind: consequence.accessKind,
          accessId: consequence.accessId,
          exitId: consequence.exitId,
          applied: Boolean(state.route.applied),
          physicalAccessOpen: consequence.accessKind === 'door' ? Boolean(door?.open) : Boolean(routePortal?.open),
          blockedAlternative: consequence.accessKind === 'door' ? consequence.blockedVentId : consequence.blockedDoorId
        } : null
      } };
    }

    getGameplayReport() {
      const report = super.getGameplayReport();
      return this.isNarrativeCollectablesV68() ? { ...report, narrativeInvestigation: this.getNarrativeCollectablesSnapshotV68().narrativeCollectablesV68 } : report;
    }

    getSnapshot() {
      return { ...super.getSnapshot(), ...this.getNarrativeCollectablesSnapshotV68() };
    }
  };
}
