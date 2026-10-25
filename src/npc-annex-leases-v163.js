import { HUB_DECKS, HUB_WORLD, buildHubObstacleGeometryV87 } from './hub-game.js';
import { createServiceRouteV161 } from './npc-service-routes-v161.js';
import { annexNpcDutiesV141, createAnnexNpcsV141 } from './hub-annex-npc-life-v141.js';
import { HUB_ANNEX_BY_ID_V137 } from './hub-annex-registry-v137.js';
import { getHubAnnexRuntimeGeometryV139 } from './hub-annex-runtime-geometry-v139.js';
import { buildHubDoorNetworkV58 } from './topology-coherence-v58.js';
import { getHubBulkheadColliderV134 } from './hub-bulkhead-depth-v134.js';
import { getHubRoomPresentationV119 } from './hub-room-presentation-v119.js';
import { advanceNpcLifeV136 } from './npc-life-v136.js';
import { drawHumanAtlasV133 } from './human-visual-contract-v133.js';

const finite = Number.isFinite, copy = value => value == null ? value : JSON.parse(JSON.stringify(value));
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const crossing = state => ['opening', 'covering', 'revealing'].includes(state?.stage);
export const HUB_NPC_ANNEX_LEASE_DEFINITIONS_V163 = Object.freeze([
  { id: 'noor-animal', crewId: 'crew-04-noor-okafor', deck: 1, parentRoomId: 'crew-quarters',
    annexRoomId: 'animal-care', originRoomIds: ['medical'], targetX: 2060,
    duty: 'companion-welfare-inspection', primaryAnnex: 'morgue', legacyRouteId: 'noor-morgue' },
  { id: 'echo-escape', crewId: 'crew-14-echo-a', deck: 0, parentRoomId: 'cryo-bay',
    annexRoomId: 'escape-pods', originRoomIds: ['briefing', 'combat-information'], targetX: 1220,
    duty: 'evacuation-readiness' },
  { id: 'jun-maintenance', crewId: 'crew-11-jun-park', deck: 3, parentRoomId: 'sensor-array',
    annexRoomId: 'maintenance-spine', originRoomIds: ['life-support'], targetX: 1470,
    duty: 'service-round', primaryAnnex: 'water-recycling', legacyRouteId: 'jun-water' }
].map(d => Object.freeze({ ...d, originRoomIds: Object.freeze(d.originRoomIds) })));
const byId = new Map(HUB_NPC_ANNEX_LEASE_DEFINITIONS_V163.map(d => [d.id, d]));
const routeCache = new Map();
export function getNpcAnnexLeaseRouteV163(id, originRoomId) {
  const d = byId.get(id);
  if (!d || !d.originRoomIds.includes(originRoomId)) return null;
  const key = id + ':' + originRoomId;
  if (!routeCache.has(key)) routeCache.set(key, createServiceRouteV161({ ...d, homeRoomId: originRoomId }, {
    schema: 163, stateField: 'npcAnnexLeasesV163', homeRoomId: originRoomId }));
  return routeCache.get(key);
}
const empty = () => ({ schema: 163, originRoomId: null, actor: null, returned: null, nativeHandoff: null });
function normalizeOccupation(d, life, actor) {
  if (!actor || actor.roomId !== d.annexRoomId || actor.stage !== 'service' || life?.schema !== 136
    || life.context !== 'annex-lease-occupation:' + d.id || life.x !== actor.x || life.y !== 532) return null;
  const post = createAnnexNpcsV141([{ ...d, roomId: d.annexRoomId,
    ...(d.id === 'noor-animal' ? { serviceVisitV157: true } : {}) }], new Map())[0];
  if (!post || ![life.time, life.velocity, life.actualVelocity, life.dwell, life.homeX, life.tripClock, life.tripDelay].every(finite)
    || life.time < 0 || life.time > 1e9 || life.tripClock < 0 || life.tripClock > 1e9 || life.tripDelay < 0 || life.tripDelay > 60
    || Math.abs(life.velocity) > 27.000001 || Math.abs(life.actualVelocity) > 27.000001 || life.dwell < 0 || life.dwell > 5
    || life.homeX < post.min || life.homeX > post.max || life.workX != null && (!finite(life.workX) || life.workX < post.min || life.workX > post.max)
    || ![-1, 1].includes(life.direction) || ![-1, 1].includes(life.facing) || !Number.isInteger(life.seed)
    || life.seed < 0 || life.seed > 0xffffffff || !['rest', 'approach', 'work', 'return'].includes(life.tripPhase)
    || !['idle', 'turn', 'moving', 'yielding', 'interaction', 'alert', 'blocked'].includes(life.mode)) return null;
  return { schema: 136, context: life.context, seed: life.seed, x: life.x, y: 532,
    time: life.time, velocity: life.velocity, actualVelocity: life.actualVelocity,
    direction: life.direction, facing: life.facing, mode: life.mode, dwell: life.dwell,
    homeX: life.homeX, workX: life.workX ?? null, tripPhase: life.tripPhase,
    tripClock: life.tripClock, tripDelay: life.tripDelay, passive: null, previousPassive: null, blend: 1 };
}
function normalizeEntry(d, value) {
  if (value?.schema !== 163 || !d.originRoomIds.includes(value.originRoomId)) return empty();
  const route = getNpcAnnexLeaseRouteV163(d.id, value.originRoomId), room = HUB_DECKS[d.deck].rooms.find(r => r.id === value.originRoomId);
  const actor = route.normalize({ schema: 163, actor: value.actor }).actor;
  const r = value.returned, h = value.nativeHandoff;
  const returned = !actor && r?.crewId === d.crewId && r.roomId === value.originRoomId && r.y === 532
    && [r.x, r.originX, r.distance].every(finite) && Math.abs(r.x - r.originX) < .26
    && r.originX >= room.xStart + 96 && r.originX <= room.xEnd - 140 && r.crossings === 2 && r.arrivals >= 2
    && r.distance > 0 && r.distance < 1e9 && r.observedTravel === true && r.owner === 'native-physical-owner-return-v163'
    ? { crewId: d.crewId, roomId: r.roomId, x: r.x, y: 532, originX: r.originX,
      distance: r.distance, crossings: 2, arrivals: r.arrivals, observedTravel: true, owner: r.owner } : null;
  const nativeHandoff = !actor && h?.crewId === d.crewId && h.observedTravel === false
    && [...route.mainRooms.map(r => r.id), d.annexRoomId].includes(h.fromRoomId)
    && ['medical-recovery', 'mission-assignment', 'unavailable'].includes(h.reason)
    ? { crewId: d.crewId, fromRoomId: h.fromRoomId, toRoomId: h.toRoomId || null, reason: h.reason, observedTravel: false } : null;
  return { schema: 163, originRoomId: value.originRoomId, actor, returned, nativeHandoff,
    occupation: normalizeOccupation(d, value.occupation, actor) };
}
export function normalizeNpcAnnexLeasesV163(value) {
  return { schema: 163, routes: Object.fromEntries(HUB_NPC_ANNEX_LEASE_DEFINITIONS_V163.map(d =>
    [d.id, normalizeEntry(d, value?.schema === 163 ? value.routes?.[d.id] : null)])) };
}

/** A lease drives the exact existing singleton. Historical ledgers keep a
 * supported origin bookmark; they never advance while the V163 chart owns
 * that body. Only a measured return to that bookmark restitutes locomotion. */
export function withHubNpcAnnexLeasesV163(Base) {
  return class HubNpcAnnexLeasesV163 extends Base {
    start(save = {}, options = {}) {
      this.npcAnnexLeaseSandboxV163 = Boolean(options.editorProject || options.forgeJourneyV141 || this.forgeSessionV141);
      this.npcAnnexLeasesStateV163 = normalizeNpcAnnexLeasesV163(this.npcAnnexLeaseSandboxV163 ? null : save.npcAnnexLeasesV163);
      this.npcAnnexLeaseDoorsV163 = new Map(); this.npcAnnexLeaseOriginsV163 = new Map();
      this.npcAnnexLeaseRestoringV163 = true;
      for (const d of HUB_NPC_ANNEX_LEASE_DEFINITIONS_V163) {
        const entry = this.npcAnnexLeasesStateV163.routes[d.id];
        const bookmark = d.id === 'echo-escape' ? save.npcCirculationV158?.actor
          : d.id === 'noor-animal' ? save.npcMedicalRouteV162?.routes?.['noor-morgue']?.actor
            : save.npcAnnexRoutesV163?.routes?.['jun-water']?.actor;
        if (entry.actor && (!bookmark || bookmark.roomId !== entry.originRoomId
          || Math.abs(bookmark.x - entry.actor.homeX) > .26 || bookmark.y !== 532))
          this.npcAnnexLeasesStateV163.routes[d.id] = empty();
      }
      const result = super.start(save, options);
      this.reconcileNpcAnnexLeasesV163(); this.npcAnnexLeaseRestoringV163 = false; this.draw?.(); return result;
    }

    getNpcAnnexLeaseActorV163(id) {
      const d = byId.get(id);
      if (!d) return null;
      return d.id === 'echo-escape' ? this.npcCirculationActorV158
        : d.id === 'noor-animal' ? this.getNpcMedicalActorV162?.() : this.getNpcServiceActorV161?.('jun-water');
    }
    hubNpcLeaseOwnerV163(crewId) {
      const d = HUB_NPC_ANNEX_LEASE_DEFINITIONS_V163.find(d => d.crewId === crewId);
      return d && this.npcAnnexLeasesStateV163?.routes[d.id]?.actor ? d.id : super.hubNpcLeaseOwnerV163?.(crewId) || null;
    }
    hubNpcLeaseReentryBlockedV163(crewId) {
      const d = HUB_NPC_ANNEX_LEASE_DEFINITIONS_V163.find(d => d.crewId === crewId);
      return Boolean(d && this.npcAnnexLeasesStateV163?.routes[d.id]?.nativeHandoff?.reason === 'unavailable'
        && this.npcAnnexLeaseDutyV163(d) || super.hubNpcLeaseReentryBlockedV163?.(crewId));
    }
    canRestoreNpcPhysicalLeaseOriginV163(crewId, source) {
      const d = HUB_NPC_ANNEX_LEASE_DEFINITIONS_V163.find(d => d.crewId === crewId);
      const r = this.npcRoutineResolutionsV62?.get(crewId);
      // The native command screen rebuilds routines but does not capture a new
      // hub pose. On re-entry, retain the real supported legacy bookmark until
      // prepareNpcAnnexLeasesV163 can borrow that same restored singleton. A
      // sampled annex post is never an alternative physical origin.
      return Boolean(!this.npcAnnexLeaseSandboxV163 && d && source
        && d.originRoomIds.includes(source.roomId) && this.npcAnnexLeaseDutyV163(d)
        && r && !r.alert && !r.needsCare && !r.missionAssigned);
    }
    npcAnnexLeaseDutyV163(d) {
      return annexNpcDutiesV141(this.npcRoutineResolutionsV62, this).find(duty => duty.crewId === d.crewId && duty.roomId === d.annexRoomId);
    }
    prepareNpcAnnexLeasesV163() {
      if (this.npcAnnexLeaseSandboxV163 || this.editorPlaytest || this.forgeSessionV141 || !this.npcAnnexLeasesStateV163) return;
      for (const d of HUB_NPC_ANNEX_LEASE_DEFINITIONS_V163) {
        const old = this.npcAnnexLeasesStateV163.routes[d.id], actor = this.getNpcAnnexLeaseActorV163(d.id);
        const r = this.npcRoutineResolutionsV62?.get(d.crewId), duty = this.npcAnnexLeaseDutyV163(d);
        if (old.actor || !duty || !actor || !d.originRoomIds.includes(actor.roomId)
          || actor.alive === false || actor.downed || !r || r.alert || r.missionAssigned || r.needsCare
          || d.primaryAnnex && this.npcAnnexDoorReservedV159?.(d.primaryAnnex)) continue;
        const route = getNpcAnnexLeaseRouteV163(d.id, actor.roomId), post = createAnnexNpcsV141([duty], this.npcRoutineResolutionsV62)[0];
        const state = route.create(actor, post);
        if (!state) continue;
        state.velocity = Math.max(-27, Math.min(27, finite(actor.vx) ? actor.vx : 0));
        this.npcAnnexLeasesStateV163.routes[d.id] = { schema: 163, originRoomId: actor.roomId,
          actor: state, returned: null, nativeHandoff: null, occupation: null };
        this.npcAnnexLeaseOriginsV163.set(d.id, this.npcLeaseOriginFlagsV163(actor));
      }
    }
    npcLeaseOriginFlagsV163(actor) {
      return Object.fromEntries(['mobile', 'min', 'max', 'annexNativeV141', 'annexDutyV141', 'annexSupportIdV156', 'annexServiceVisitV157']
        .map(key => [key, actor[key]]));
    }
    reconcileNpcAnnexLeasesV163() {
      for (const d of HUB_NPC_ANNEX_LEASE_DEFINITIONS_V163) {
        const entry = this.npcAnnexLeasesStateV163?.routes[d.id];
        if (!entry?.actor) continue;
        const actor = this.getNpcAnnexLeaseActorV163(d.id);
        const r = this.npcRoutineResolutionsV62?.get(d.crewId);
        const priority = r?.needsCare ? 'medical-recovery' : r?.missionAssigned ? 'mission-assignment'
          : !actor || actor.alive === false || actor.downed ? 'unavailable' : null;
        if (priority) {
          entry.nativeHandoff = { crewId: d.crewId, fromRoomId: entry.actor.roomId,
            toRoomId: r?.roomId, reason: priority, observedTravel: false };
          entry.actor = null; entry.occupation = null;
          this.delegateNpcPhysicalLeaseV163?.(d.crewId); this.npcAnnexLeaseRebuildV163 = true; continue;
        }
        if (!this.npcAnnexLeaseOriginsV163.has(d.id)) this.npcAnnexLeaseOriginsV163.set(d.id, this.npcLeaseOriginFlagsV163(actor));
        Object.assign(actor, { x: entry.actor.x, y: 532, roomId: entry.actor.roomId,
          facing: entry.actor.facing, vx: entry.occupation?.actualVelocity || entry.actor.actualVelocity || entry.actor.velocity || 0, mobile: false });
        if (entry.occupation) actor.lifeV136 = copy(entry.occupation);
        if (this.npcAnnexLeaseRestoringV163) for (const door of this.npcLeaseDoorsV163(d, entry))
          door.progress = Math.max(door.progress, entry.actor.bulkheadProgress?.[door.id] || 0);
        this.refreshNpcAnnexLeaseV163(d, actor);
      }
    }
    refreshNpcAnnexLeaseV163(d, actor) {
      const local = actor.roomId === d.annexRoomId;
      const r = this.npcRoutineResolutionsV62?.get(d.crewId);
      Object.assign(actor, { annexNativeV141: local, annexDutyV141: local ? d.duty : undefined,
        routinePhaseV62: local ? 'work' : 'station', mobile: false, min: actor.x, max: actor.x,
        routineReasonV62: r?.reason, routineDeterministicKeyV62: r?.deterministicKey, alerted: Boolean(r?.alert) });
      if (local) {
        const duty = this.npcAnnexLeaseDutyV163(d) || { roomId: d.annexRoomId, crewId: d.crewId,
          targetX: d.targetX, duty: d.duty, ...(d.id === 'noor-animal' ? { serviceVisitV157: true } : {}) };
        const post = createAnnexNpcsV141([duty], this.npcRoutineResolutionsV62)[0];
        if (post) Object.assign(actor, { min: post.min, max: post.max, mobile: post.mobile,
          annexSupportIdV156: post.annexSupportIdV156, annexServiceVisitV157: post.annexServiceVisitV157 });
      }
    }

    createNpcs(deck) {
      this.prepareNpcAnnexLeasesV163();
      let natives = super.createNpcs(deck);
      this.reconcileNpcAnnexLeasesV163();
      if (this.npcAnnexLeaseRebuildV163) {
        this.npcAnnexLeaseRebuildV163 = false; natives = super.createNpcs(deck);
        this.reconcileNpcAnnexLeasesV163();
      }
      const leased = HUB_NPC_ANNEX_LEASE_DEFINITIONS_V163.filter(d => this.npcAnnexLeasesStateV163?.routes[d.id]?.actor);
      const ids = new Set(leased.map(d => d.crewId));
      for (const d of HUB_NPC_ANNEX_LEASE_DEFINITIONS_V163) if (this.hubNpcLeaseReentryBlockedV163(d.crewId)) ids.add(d.crewId);
      return [...natives.filter(a => !ids.has(a.crewId)), ...leased.filter(d => d.deck === deck)
        .map(d => this.getNpcAnnexLeaseActorV163(d.id)).filter(a => a && HUB_DECKS[deck].rooms.some(r => r.id === a.roomId))];
    }
    ensureAnnexNpcCohortV141() {
      const cohort = super.ensureAnnexNpcCohortV141();
      const leased = HUB_NPC_ANNEX_LEASE_DEFINITIONS_V163.filter(d => this.npcAnnexLeasesStateV163?.routes[d.id]?.actor);
      const ids = new Set(leased.map(d => d.crewId));
      for (const d of HUB_NPC_ANNEX_LEASE_DEFINITIONS_V163) if (this.hubNpcLeaseReentryBlockedV163(d.crewId)) ids.add(d.crewId);
      return [...cohort.filter(a => !ids.has(a.crewId)), ...leased.map(d => this.getNpcAnnexLeaseActorV163(d.id))
        .filter(a => a && HUB_NPC_ANNEX_LEASE_DEFINITIONS_V163.some(d => d.crewId === a.crewId && d.annexRoomId === a.roomId))];
    }
    npcAnnexPhysicalPeersV163() {
      const room = this.currentAnnexV71?.();
      // Native route owners suppress their own tick, not their physical body.
      // The unfiltered cohort retains every exact singleton as a collision
      // peer while another owner alone advances its pose.
      return room ? this.ensureAnnexNpcCohortV141().filter(actor => actor.roomId === room.id) : [];
    }
    getNpcServiceTrafficIntentsV163() {
      const intents = super.getNpcServiceTrafficIntentsV163?.() || [];
      for (const d of HUB_NPC_ANNEX_LEASE_DEFINITIONS_V163) {
        const entry = this.npcAnnexLeasesStateV163?.routes[d.id];
        if (!entry?.actor) continue;
        const intent = getNpcAnnexLeaseRouteV163(d.id, entry.originRoomId).trafficIntent(entry.actor, this.getNpcAnnexLeaseActorV163(d.id));
        if (intent) intents.push(intent);
      }
      return intents;
    }
    npcLeaseDoorsV163(d, entry) {
      if (!this.npcAnnexLeaseDoorsV163.has(d.id)) this.npcAnnexLeaseDoorsV163.set(d.id,
        buildHubDoorNetworkV58(HUB_DECKS, HUB_WORLD, d.deck).filter(door => !door.lift).map(door => ({ ...door,
          progress: entry.actor?.bulkheadProgress?.[door.id] || 0 })));
      const doors = this.npcAnnexLeaseDoorsV163.get(d.id);
      if (this.state?.deck === d.deck) for (let i = 0; i < doors.length; i++) {
        const native = this.doorStates?.find(door => door.id === doors[i].id);
        if (native && native !== doors[i]) { native.progress = Math.max(native.progress, doors[i].progress); doors[i] = native; }
      }
      return doors;
    }
    hubNpcBulkheadDemandV158(door) {
      if (super.hubNpcBulkheadDemandV158?.(door)) return true;
      return HUB_NPC_ANNEX_LEASE_DEFINITIONS_V163.some(d => {
        const entry = this.npcAnnexLeasesStateV163?.routes[d.id], actor = entry?.actor && this.getNpcAnnexLeaseActorV163(d.id);
        return actor && HUB_DECKS[d.deck].rooms.some(r => r.id === actor.roomId)
          && this.npcLeaseDoorsV163(d, entry).some(v => v.id === door.id) && Math.abs(actor.x + 22 - door.x) < 182
          && (!this.hubTrainingV132?.lockedDoorIds?.includes(door.id) || overlap(actor, getHubBulkheadColliderV134(door)));
      });
    }
    npcAnnexDoorDemandV159(id) {
      let demand = super.npcAnnexDoorDemandV159?.(id) || 0;
      for (const d of HUB_NPC_ANNEX_LEASE_DEFINITIONS_V163) if (d.annexRoomId === id)
        demand = Math.max(demand, this.npcAnnexLeasesStateV163?.routes[d.id]?.actor?.doorProgress || 0);
      return demand;
    }
    npcAnnexDoorReservedV159(id) {
      if (super.npcAnnexDoorReservedV159?.(id)) return true;
      const d = HUB_NPC_ANNEX_LEASE_DEFINITIONS_V163.find(d => d.annexRoomId === id), entry = d && this.npcAnnexLeasesStateV163?.routes[d.id];
      if (!entry?.actor) return false;
      const route = getNpcAnnexLeaseRouteV163(d.id, entry.originRoomId), actor = this.getNpcAnnexLeaseActorV163(d.id);
      const face = actor?.roomId === d.annexRoomId ? route.faces.local : actor?.roomId === d.parentRoomId ? route.faces.parent : null;
      return Boolean(crossing(entry.actor) || entry.actor.doorProgress > 0 || face
        && actor.x < face.opening.x + face.opening.w + 12 && actor.x + 44 > face.opening.x - 12);
    }
    hubDoorPairV142(space, endpointId = null) {
      const pair = super.hubDoorPairV142(space, endpointId), d = HUB_NPC_ANNEX_LEASE_DEFINITIONS_V163.find(d => d.annexRoomId === space?.id);
      if (!pair || !d) return pair;
      const route = getNpcAnnexLeaseRouteV163(d.id, d.originRoomIds[0]);
      return { ...pair, parent: { ...pair.parent, ...route.faces.parent }, local: { ...pair.local, ...route.faces.local } };
    }

    update(delta) {
      if (this.running && finite(delta) && delta > 0) this.prepareNpcAnnexLeasesV163();
      const wasRunning = this.running, before = new Map();
      for (const d of HUB_NPC_ANNEX_LEASE_DEFINITIONS_V163) {
        const entry = this.npcAnnexLeasesStateV163?.routes[d.id], actor = entry?.actor && this.getNpcAnnexLeaseActorV163(d.id);
        if (actor) before.set(d.id, { actor, clocks: Object.fromEntries(['workClock', 'supportClock', 'alertClock'].map(k => [k, finite(actor[k]) ? actor[k] : 0])),
          doors: new Map(this.npcLeaseDoorsV163(d, entry).map(door => [door.id, door.progress])) });
      }
      const result = super.update(delta);
      if (!wasRunning || !this.running || this.npcAnnexLeaseSandboxV163 || !finite(delta) || delta <= 0) return result;
      const dt = Math.min(delta, .1);
      for (const d of HUB_NPC_ANNEX_LEASE_DEFINITIONS_V163) {
        const entry = this.npcAnnexLeasesStateV163.routes[d.id], actor = entry.actor && this.getNpcAnnexLeaseActorV163(d.id);
        if (!actor || !entry.actor) continue;
        const r = this.npcRoutineResolutionsV62?.get(d.crewId), previous = entry.actor;
        const priority = actor.alive === false || actor.downed ? 'unavailable' : r?.needsCare ? 'medical-recovery' : r?.missionAssigned ? 'mission-assignment' : null;
        if (priority) {
          entry.nativeHandoff = { crewId: d.crewId, fromRoomId: actor.roomId, toRoomId: r?.roomId, reason: priority, observedTravel: false };
          entry.actor = null; entry.occupation = null;
          this.delegateNpcPhysicalLeaseV163?.(d.crewId);
          this.npcs = this.createNpcs(this.state.deck); continue;
        }
        for (const [key, value] of Object.entries(before.get(d.id)?.clocks || {}))
          actor[key] = finite(actor[key]) && actor[key] > value ? actor[key] : Math.max(0, value - dt);
        const route = getNpcAnnexLeaseRouteV163(d.id, entry.originRoomId), doors = this.npcLeaseDoorsV163(d, entry);
        for (const door of doors) {
          if (door.progress === before.get(d.id)?.doors.get(door.id)) {
            const target = this.hubNpcBulkheadDemandV158(door) ? 1 : 0;
            door.progress += (target - door.progress) * Math.min(1, dt * (this.reducedMotion ? 14 : 7));
          }
          if (this.hubTrainingV132?.lockedDoorIds?.includes(door.id))
            door.progress = overlap(actor, getHubBulkheadColliderV134(door)) ? Math.max(.82, door.progress) : 0;
        }
        const cohort = this.ensureAnnexNpcCohortV141(), peers = [
          ...(this.getNpcServicePeersV163?.(d.deck, d.crewId) || (this.state.deck === d.deck ? this.npcs : [])), ...cohort];
        const local = this.currentAnnexV71?.(), player = !this.ventActorV62 && this.player && { ...this.player,
          roomId: local?.id || (this.state.deck === d.deck ? this.state.roomId : null) };
        const duty = Boolean(this.npcAnnexLeaseDutyV163(d));
        const portalBusy = this.annexTransitionV71?.annexId === d.annexRoomId || this.hubDoorClosingV142?.annexId === d.annexRoomId
          || this.hubTrainingV132?.lockedDoorIds?.some(id => [d.annexRoomId, route.definition.connectionId].includes(id));
        let next = route.advance(previous, actor, dt, { resolution: r, duty, peers, player, doors, portalBusy,
          reducedMotion: this.reducedMotion, returnToOrigin: true, preserveIntentVelocity: true });
        next.bulkheadProgress = Object.fromEntries(route.definition.mainDoorIds.map(id => [id, doors.find(door => door.id === id)?.progress || 0]));
        const changed = next.roomId !== actor.roomId;
        Object.assign(actor, { x: next.x, y: next.y, roomId: next.roomId, facing: next.facing, vx: next.actualVelocity || 0 });
        entry.actor = next; this.refreshNpcAnnexLeaseV163(d, actor);
        if (next.stage === 'service' && next.roomId === d.annexRoomId && duty && next.reason === 'daily-schedule') {
          const annex = getHubAnnexRuntimeGeometryV139(HUB_ANNEX_BY_ID_V137[d.annexRoomId]);
          const life = advanceNpcLifeV136(actor.lifeV136, actor, dt, { room: annex,
            peers: [...peers.filter(peer => peer.roomId === d.annexRoomId),
              ...(player?.roomId === d.annexRoomId ? [player] : [])], colliders: annex.colliders,
            context: 'annex-lease-occupation:' + d.id, reducedMotion: this.reducedMotion });
          if (life) {
            actor.lifeV136 = life; actor.x = life.x; actor.vx = life.actualVelocity; actor.facing = life.facing;
            next = entry.actor = { ...next, x: actor.x, dutyX: actor.x, velocity: 0, facing: actor.facing,
              distance: next.distance + Math.abs(actor.x - next.x) };
            entry.occupation = normalizeOccupation(d, life, next);
          }
        } else { entry.occupation = null; actor.lifeV136 = { schema: 136, context: 'annex-lease-v163', x: actor.x, y: actor.y,
          time: next.time, velocity: next.velocity, actualVelocity: actor.vx, facing: actor.facing,
          mode: Math.abs(actor.vx) > .1 ? 'moving' : next.reason !== 'daily-schedule' ? 'alert' : next.blocked ? 'blocked' : 'idle',
          passive: null, previousPassive: null, blend: 1 }; }
        if (changed) this.npcs = [...this.npcs.filter(a => a.crewId !== d.crewId),
          ...(this.state.deck === d.deck && HUB_DECKS[d.deck].rooms.some(room => room.id === actor.roomId) ? [actor] : [])];
        if (!duty && next.roomId === entry.originRoomId && next.stage === 'service' && next.doorProgress === 0) {
          entry.returned = { crewId: d.crewId, roomId: next.roomId, x: next.x, y: 532, originX: next.homeX,
            crossings: next.crossings, arrivals: next.arrivals, distance: next.distance,
            observedTravel: true, owner: 'native-physical-owner-return-v163' };
          entry.actor = null; entry.occupation = null;
          Object.assign(actor, this.npcAnnexLeaseOriginsV163.get(d.id) || {}, { vx: 0 });
          this.returnNpcPhysicalLeaseV163?.(d.crewId);
        }
        const visible = this.state.deck === d.deck && (actor.roomId === local?.id
          || !local && !this.ventActorV62 && HUB_DECKS[d.deck].rooms.some(room => room.id === actor.roomId));
        if (!visible) this.sampleNpcAnimation?.(actor, { emit: false, discardEvents: true });
      }
      return result;
    }

    npcLeaseClipV163(actor) {
      const d = HUB_NPC_ANNEX_LEASE_DEFINITIONS_V163.find(d => this.getNpcAnnexLeaseActorV163(d.id) === actor);
      const entry = d && this.npcAnnexLeasesStateV163?.routes[d.id];
      return entry?.actor && getNpcAnnexLeaseRouteV163(d.id, entry.originRoomId).occlusion(entry.actor);
    }
    drawSheetCell(ctx, image, ...args) {
      const d = HUB_NPC_ANNEX_LEASE_DEFINITIONS_V163.find(d => this.npcImageCrewIds?.get(image) === d.crewId);
      const actor = d && this.getNpcAnnexLeaseActorV163(d.id), clip = actor && this.npcs?.includes(actor) && this.npcLeaseClipV163(actor);
      if (!clip) return super.drawSheetCell(ctx, image, ...args);
      ctx.save(); ctx.beginPath(); ctx.rect(clip.x, clip.y, clip.w, clip.h); ctx.clip();
      try { return super.drawSheetCell(ctx, image, ...args); } finally { ctx.restore(); }
    }
    drawNpcLifeV136(ctx, image, actor, sample, geometry) {
      const clip = this.npcLeaseClipV163(actor);
      if (!clip) return super.drawNpcLifeV136(ctx, image, actor, sample, geometry);
      ctx.save(); ctx.beginPath(); ctx.rect(clip.x, clip.y, clip.w, clip.h); ctx.clip();
      try { super.drawNpcLifeV136(ctx, image, actor, sample, geometry) || drawHumanAtlasV133(ctx, image, geometry); }
      finally { ctx.restore(); } return true;
    }
    drawDepthContactShadowV116(ctx, actor, supportY) {
      const clip = this.npcLeaseClipV163(actor);
      if (!clip) return super.drawDepthContactShadowV116(ctx, actor, supportY);
      ctx.save(); ctx.beginPath(); ctx.rect(clip.x, clip.y, clip.w, clip.h); ctx.clip();
      try { return super.drawDepthContactShadowV116(ctx, actor, supportY); } finally { ctx.restore(); }
    }
    persist() {
      const original = this.onPersist; let patch;
      this.onPersist = value => { patch = value; };
      try { super.persist(); } finally { this.onPersist = original; }
      if (patch) original({ ...patch, npcAnnexLeasesV163: normalizeNpcAnnexLeasesV163(this.npcAnnexLeasesStateV163) });
    }
    getSnapshot() {
      const snapshot = super.getSnapshot();
      return { ...snapshot, npcAnnexLeasesV163: { schema: 163, routes: Object.fromEntries(HUB_NPC_ANNEX_LEASE_DEFINITIONS_V163.map(d => {
        const entry = this.npcAnnexLeasesStateV163?.routes[d.id] || empty();
        const route = getNpcAnnexLeaseRouteV163(d.id, entry.originRoomId || d.originRoomIds[0]);
        return [d.id, { ...normalizeEntry(d, entry), actualVelocity: this.getNpcAnnexLeaseActorV163(d.id)?.vx || 0,
          sourceRoomId: entry.originRoomId, originX: entry.actor?.homeX || entry.returned?.originX || null,
          sourceFace: copy(route.faces.parent), annexFace: copy(route.faces.local),
          reserved: this.npcAnnexDoorReservedV159(d.annexRoomId), occlusion: route.occlusion(entry.actor),
          preLoadTravelObserved: false, scope: 'same-singleton-same-deck-native-annex-lease',
          presentation: [...route.mainRooms, getHubAnnexRuntimeGeometryV139(HUB_ANNEX_BY_ID_V137[d.annexRoomId])].map(room => ({
            roomId: room.id, mode: getHubRoomPresentationV119(room).presentationMode,
            mixedProjectionAllowed: false, projection: getHubRoomPresentationV119(room).projectionV139.projection })) }];
      })) } };
    }
  };
}
