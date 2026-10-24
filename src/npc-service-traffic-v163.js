import { HUB_DECKS, HUB_WORLD, buildHubObstacleGeometryV87 } from './hub-game.js';
import { HubGame as RoutineHubV62 } from './hub-v62-runtime.js';
import { annexNpcDutiesV141 } from './hub-annex-npc-life-v141.js';
import { spreadNpcStationSpawnsV136, moveNpcAgainstGeometryV136 } from './npc-life-v136.js';
import { buildHubDoorNetworkV58 } from './topology-coherence-v58.js';
import { NPC_IDENTITIES_V62 } from './npc-dialogue-v62.js';
import { getHubBulkheadColliderV134 } from './hub-bulkhead-depth-v134.js';

const finite = Number.isFinite, clone = value => JSON.parse(JSON.stringify(value));
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const mainRoom = (deck, x) => HUB_DECKS[deck]?.rooms.find(room => x + 22 >= room.xStart && x + 22 < room.xEnd);
const nativeIds = new Set(NPC_IDENTITIES_V62.map(identity => identity.crewId));
const blocks = box => box.collisionMode !== 'one-way-top';
const phases = ['clearing', 'holding', 'returning'];
const actorRoom = actor => HUB_DECKS.findIndex(deck => deck.rooms.some(room => room.id === actor.roomId));
const doorsFor = deck => buildHubDoorNetworkV58(HUB_DECKS, HUB_WORLD, deck).filter(door => !door.lift);
// A saved courtesy reservation is bound to one shipped physical circuit. An
// arbitrary native crew ID or a valid timetable key cannot authorize another
// deck, another owner's route or a fictitious corridor.
const circuit = (ownerCrewId, deck, roomIds) => ({ ownerCrewId, deck, roomIds,
  minX: Math.min(...HUB_DECKS[deck].rooms.filter(r => roomIds.includes(r.id)).map(r => r.xStart)) + 24,
  maxX: Math.max(...HUB_DECKS[deck].rooms.filter(r => roomIds.includes(r.id)).map(r => r.xEnd)) - 68 });
export const HUB_NPC_SERVICE_TRAFFIC_CIRCUITS_V163 = Object.freeze({
  'maksim-arrival': circuit('crew-08-maksim-orlov', 3, ['dropship-hangar']),
  'inez-bioforge': circuit('crew-09-inez-harlow', 2, ['quarantine']),
  'asha-refuge': circuit('crew-12-asha-mbaye', 1, ['crew-quarters']),
  'jun-water': circuit('crew-11-jun-park', 3, ['life-support']),
  'mara-archives': circuit('crew-01-mara-vega', 0, ['bridge', 'briefing']),
  'noor-animal': circuit('crew-04-noor-okafor', 1, ['crew-quarters', 'mess', 'medical']),
  'echo-escape': circuit('crew-14-echo-a', 0, ['briefing', 'combat-information', 'cryo-bay']),
  'jun-maintenance': circuit('crew-11-jun-park', 3, ['life-support', 'sensor-array'])
});

/** Durable courtesy only for an existing native timetable body. Never admit
 * a second route-owned crew or manufacture a cross-deck arrival. */
export function normalizeNpcServiceTrafficV163(value) {
  const actors = [], seen = new Set();
  if (value?.schema === 163) for (const a of Array.isArray(value.actors) ? value.actors.slice(0, 16) : []) {
    const deck = HUB_DECKS[a?.deck], home = deck?.rooms.find(room => room.id === a.homeRoomId);
    const reservation = HUB_NPC_SERVICE_TRAFFIC_CIRCUITS_V163[a?.routeId];
    if (!reservation || a.deck !== reservation.deck || a.ownerCrewId !== reservation.ownerCrewId
      || !reservation.roomIds.includes(a.homeRoomId) || !reservation.roomIds.includes(a.roomId)
      || a.x < reservation.minX || a.x > reservation.maxX || a.targetX < reservation.minX || a.targetX > reservation.maxX
      || !home || !mainRoom(a.deck, a.x) || a.roomId !== mainRoom(a.deck, a.x).id
      || !nativeIds.has(a.crewId) || seen.has(a.crewId)
      || ![a.x, a.y, a.homeX, a.targetX, a.velocity, a.time, a.distance].every(finite)
      || a.y !== 532 || a.x < 24 || a.x > HUB_WORLD.width - 68
      || a.homeX < home.xStart + 24 || a.homeX > home.xEnd - 68
      || a.targetX < 24 || a.targetX > HUB_WORLD.width - 68
      || Math.abs(a.velocity) > 27.000001 || a.time < 0 || a.distance < 0
      || a.time > 1e9 || a.distance > 1e9 || !phases.includes(a.phase)
      || ![-1, 1].includes(a.facing) || typeof a.routineKey !== 'string'
      || !nativeIds.has(a.ownerCrewId) || typeof a.routeId !== 'string') continue;
    const templates = doorsFor(a.deck), ids = templates.map(door => door.id);
    if (!a.bulkheadProgress || typeof a.bulkheadProgress !== 'object' || Array.isArray(a.bulkheadProgress)
      || Object.entries(a.bulkheadProgress).some(([id, p]) => !ids.includes(id) || !finite(p) || p < 0 || p > 1)
      || templates.some(door => overlap({ x: a.x, y: 532, w: 44, h: 92 }, getHubBulkheadColliderV134(door))
        && (a.bulkheadProgress[door.id] || 0) < .82)
      || buildHubObstacleGeometryV87(a.deck).filter(blocks).some(box => overlap({ x: a.x, y: 532, w: 44, h: 92 }, box))) continue;
    actors.push({ crewId: a.crewId, deck: a.deck, roomId: a.roomId, homeRoomId: a.homeRoomId,
      x: a.x, y: 532, homeX: a.homeX, targetX: a.targetX, velocity: a.velocity,
      time: a.time, distance: a.distance, facing: a.facing, phase: a.phase,
      routineKey: a.routineKey, ownerCrewId: a.ownerCrewId, routeId: a.routeId,
      bulkheadProgress: Object.fromEntries(ids.map(id => [id, a.bulkheadProgress[id] || 0])) });
    seen.add(a.crewId);
  }
  return { schema: 163, actors };
}

export function withHubNpcServiceTrafficV163(Base) {
  return class HubNpcServiceTrafficV163 extends Base {
    start(save = {}, options = {}) {
      this.npcTrafficSandboxV163 = Boolean(options.editorProject || options.forgeJourneyV141 || this.forgeSessionV141);
      this.npcTrafficStateV163 = this.npcTrafficSandboxV163 ? { schema: 163, actors: [] } : normalizeNpcServiceTrafficV163(save.npcServiceTrafficV163);
      this.npcTrafficBodiesV163 = new Map(); this.npcTrafficPeersV163 = new Map();
      this.npcTrafficDoorsV163 = HUB_DECKS.map((_, deck) => doorsFor(deck).map(door => ({ ...door,
        progress: Math.max(0, ...this.npcTrafficStateV163.actors.filter(a => a.deck === deck).map(a => a.bulkheadProgress[door.id] || 0)) })));
      this.npcTrafficHandoffsV163 = [];
      return super.start(save, options);
    }

    getNpcServiceTrafficActorsV163(deck = null) {
      return [...(this.npcTrafficBodiesV163?.values() || [])].filter(actor => deck == null || actorRoom(actor) === deck);
    }

    getNpcServiceOwnedActorsV163() {
      return [this.npcCirculationActorV158, this.npcAnnexActorV159,
        this.getNpcServiceActorV161?.('idris-engine'), this.getNpcServiceActorV161?.('leila-galley'),
        this.getNpcMedicalActorV162?.(), ...(this.getNpcAnnexServiceActorsV163?.() || [])].filter(Boolean);
    }

    /** Read-only native factory, followed by exact actual-owner substitution.
     * No virtual createNpcs call, lifecycle re-admission or sampled duplicate. */
    getNpcServicePeersV163(deck, excludeCrewId = null) {
      const resolutions = this.npcRoutineResolutionsV62;
      const key = [...(resolutions?.values() || [])].map(r => r.deterministicKey).join('|');
      const cached = this.npcTrafficPeersV163?.get(deck);
      let natives = cached?.key === key ? cached.actors : null;
      if (!natives) {
        const context = Object.create(this);
        context.doorStates = this.state?.deck === deck ? this.doorStates : this.npcTrafficDoorsV163?.[deck] || doorsFor(deck);
        const annexIds = new Set(annexNpcDutiesV141(resolutions, this).map(d => d.crewId));
        natives = spreadNpcStationSpawnsV136(RoutineHubV62.prototype.createNpcs.call(context, deck)
          .filter(actor => !annexIds.has(actor.crewId)), HUB_DECKS[deck].rooms);
        this.npcTrafficPeersV163?.set(deck, { key, actors: natives });
      }
      // Visible routine bodies are authoritative after their native life or
      // interaction step. Cached factory templates describe only an initial
      // condition. During a virtual factory rebuild this.npcs is still the
      // previous timetable and must not substitute those old objects.
      const visible = !this.npcTrafficFactoryDepthV163 && this.state?.deck === deck
        ? new Map((this.npcs || []).map(actor => [actor.crewId, actor])) : new Map();
      const actualNatives = natives.map(template => {
        const current = visible.get(template.crewId);
        return current?.routineDeterministicKeyV62 === template.routineDeterministicKeyV62 ? current : template;
      });
      const owners = this.getNpcServiceOwnedActorsV163();
      const owned = new Set(owners.map(actor => actor.crewId));
      this.reconcileNpcServiceTrafficV163(actualNatives, owned);
      const traffic = [...(this.npcTrafficBodiesV163?.values() || [])].filter(actor => actorRoom(actor) === deck);
      const yielding = new Set(traffic.map(actor => actor.crewId));
      return [...actualNatives.filter(actor => !owned.has(actor.crewId) && !yielding.has(actor.crewId)),
        ...owners.filter(actor => actorRoom(actor) === deck), ...traffic].filter(actor => actor.crewId !== excludeCrewId);
    }

    reconcileNpcServiceTrafficV163(natives = [], owned = new Set(this.getNpcServiceOwnedActorsV163().map(a => a.crewId))) {
      const state = this.npcTrafficStateV163;
      if (!state) return;
      state.actors = state.actors.filter(saved => {
        const r = this.npcRoutineResolutionsV62?.get(saved.crewId);
        const body = this.npcTrafficBodiesV163.get(saved.crewId);
        if (!r || r.deterministicKey !== saved.routineKey || r.alert || r.missionAssigned || r.needsCare
          || owned.has(saved.crewId) || body?.alive === false || body?.downed) {
          this.npcTrafficBodiesV163.delete(saved.crewId);
          this.npcTrafficHandoffsV163.push({ crewId: saved.crewId, fromRoomId: saved.roomId,
            toRoomId: r?.roomId || null, reason: r?.reason || 'unavailable', observedTravel: false });
          this.npcTrafficHandoffsV163 = this.npcTrafficHandoffsV163.slice(-16); return false;
        }
        if (!body) {
          const source = natives.find(actor => actor.crewId === saved.crewId);
          if (source && (actorRoom(source) !== saved.deck || source.roomId !== saved.homeRoomId
            || source.routineDeterministicKeyV62 !== saved.routineKey)) {
            this.npcTrafficHandoffsV163.push({ crewId: saved.crewId, fromRoomId: saved.roomId,
              toRoomId: source.roomId, reason: 'unavailable', observedTravel: false });
            this.npcTrafficHandoffsV163 = this.npcTrafficHandoffsV163.slice(-16); return false;
          }
          if (source) this.npcTrafficBodiesV163.set(saved.crewId, { ...source, ...saved, w: 44, h: 92, vx: 0, mobile: false });
        }
        return true;
      });
    }

    createNpcs(deck) {
      this.npcTrafficFactoryDepthV163 = (this.npcTrafficFactoryDepthV163 || 0) + 1;
      try {
        const natives = super.createNpcs(deck);
        if (this.npcTrafficSandboxV163 || this.editorPlaytest || this.forgeSessionV141) return natives;
        this.getNpcServicePeersV163(deck);
        const bodies = [...this.npcTrafficBodiesV163.values()].filter(actor => actorRoom(actor) === deck);
        return [...natives.filter(actor => !bodies.some(body => body.crewId === actor.crewId)), ...bodies];
      } finally { this.npcTrafficFactoryDepthV163--; }
    }

    stepHubNpcLifeV136(actor, delta, options) {
      if (this.npcTrafficBodiesV163?.get(actor?.crewId) === actor) return;
      return super.stepHubNpcLifeV136(actor, delta, options);
    }

    hubNpcBulkheadDemandV158(door) {
      return Boolean(super.hubNpcBulkheadDemandV158?.(door)
        || [...(this.npcTrafficBodiesV163?.values() || [])].some(actor =>
          actorRoom(actor) >= 0 && this.npcTrafficDoorsV163[actorRoom(actor)].some(entry => entry.id === door.id)
          && Math.abs(actor.x + 22 - door.x) < 182
          && (!this.hubTrainingV132?.lockedDoorIds?.includes(door.id)
            || overlap(actor, getHubBulkheadColliderV134(door)))));
    }

    planNpcServiceCourtesyV163() {
      const owners = this.getNpcServiceOwnedActorsV163(), ownedIds = new Set(owners.map(a => a.crewId));
      for (const intent of this.getNpcServiceTrafficIntentsV163?.() || []) {
        const actor = intent.actor, direction = Math.sign(intent.goalX - actor.x);
        if (!direction) continue;
        const peers = this.getNpcServicePeersV163(intent.deck, actor.crewId);
        const blockers = peers.filter(peer => !ownedIds.has(peer.crewId) && !this.npcTrafficBodiesV163.has(peer.crewId)
          && intent.roomIds.includes(peer.roomId) && peer.alive !== false && !peer.downed
          && Math.abs(peer.y + peer.h - 624) < 1
          && direction * (peer.x - actor.x) > 0 && direction * (peer.x - intent.goalX) < 56)
          .sort((a, b) => direction * (a.x - b.x));
        const plans = blockers.map((peer, index) => ({ peer,
          target: intent.goalX + direction * (68 + index * 68) }));
        const boxes = buildHubObstacleGeometryV87(intent.deck).filter(blocks);
        const player = !this.isAnnexActiveV71?.() && this.state?.deck === intent.deck && !this.ventActorV62 ? this.player : null;
        const blocked = plans.some(({ peer, target }) => target < intent.minX || target > intent.maxX
          || boxes.some(box => overlap({ x: target, y: 532, w: 44, h: 92 }, box))
          || [...owners, ...(player ? [player] : []), ...peers.filter(p => !blockers.includes(p))]
            .some(other => other !== actor && other !== peer && (other === player || actorRoom(other) === intent.deck)
              && overlap({ x: target - 12, y: 532, w: 68, h: 92 }, other))
          || this.npcRoutineResolutionsV62?.get(peer.crewId)?.alert
          || this.npcRoutineResolutionsV62?.get(peer.crewId)?.missionAssigned
          || this.npcRoutineResolutionsV62?.get(peer.crewId)?.needsCare
          || peer.workClock > 0 || peer.supportClock > 0);
        if (blocked) continue;
        for (const { peer, target } of plans) {
          const r = this.npcRoutineResolutionsV62.get(peer.crewId);
          const body = peer;
          const state = { crewId: peer.crewId, deck: intent.deck, roomId: peer.roomId, homeRoomId: peer.roomId,
            x: body.x, y: 532, homeX: body.x, targetX: target, velocity: 0, time: 0, distance: 0,
            facing: peer.facing === -1 ? -1 : 1, phase: 'clearing', routineKey: r.deterministicKey,
            ownerCrewId: actor.crewId, routeId: intent.routeId,
            bulkheadProgress: Object.fromEntries(this.npcTrafficDoorsV163[intent.deck].map(door => [door.id, door.progress])) };
          this.npcTrafficStateV163.actors.push(state);
          // Adopt the exact visible native object, not an additional clone.
          this.npcTrafficBodiesV163.set(peer.crewId, body);
        }
      }
    }

    update(delta) {
      const running = this.running;
      if (running && !this.npcTrafficSandboxV163 && finite(delta) && delta > 0) this.planNpcServiceCourtesyV163();
      const clocks = new Map([...(this.npcTrafficBodiesV163?.values() || [])].map(body => [body,
        Object.fromEntries(['workClock', 'supportClock', 'alertClock'].map(key => [key, finite(body[key]) ? body[key] : 0]))]));
      const before = this.npcTrafficDoorsV163?.map(doors => new Map(doors.map(door => [door.id, door.progress])));
      const result = super.update(delta);
      if (!running || !this.running || this.npcTrafficSandboxV163 || !finite(delta) || delta <= 0) return result;
      const dt = Math.min(delta, .1), owners = this.getNpcServiceOwnedActorsV163();
      for (let deck = 0; deck < HUB_DECKS.length; deck++) {
        for (let index = 0; index < this.npcTrafficDoorsV163[deck].length; index++) {
          let door = this.npcTrafficDoorsV163[deck][index];
          const native = this.state?.deck === deck && this.doorStates?.find(d => d.id === door.id);
          if (native && native !== door) { native.progress = Math.max(native.progress, door.progress); door = this.npcTrafficDoorsV163[deck][index] = native; }
          if (door.progress === before[deck].get(door.id)) {
            const target = this.hubNpcBulkheadDemandV158(door) ? 1 : 0;
            door.progress += (target - door.progress) * Math.min(1, dt * (this.reducedMotion ? 14 : 7));
          }
          if (this.hubTrainingV132?.lockedDoorIds?.includes(door.id))
            door.progress = [...this.npcTrafficBodiesV163.values()].some(a => actorRoom(a) === deck && overlap(a, getHubBulkheadColliderV134(door))) ? Math.max(.82, door.progress) : 0;
        }
      }
      for (const saved of this.npcTrafficStateV163.actors) {
        const body = this.npcTrafficBodiesV163.get(saved.crewId);
        if (!body) continue;
        for (const [key, value] of Object.entries(clocks.get(body) || {}))
          body[key] = finite(body[key]) && body[key] > value ? body[key] : Math.max(0, value - dt);
        const owner = owners.find(a => a.crewId === saved.ownerCrewId);
        const intent = (this.getNpcServiceTrafficIntentsV163?.() || []).find(i => i.actor === owner);
        if (!owner || actorRoom(owner) === saved.deck && !intent
          && (owner.x + owner.w + 12 < Math.min(saved.x, saved.homeX)
            || owner.x > Math.max(saved.x, saved.homeX) + 56)) saved.phase = 'returning';
        else if (!intent && saved.phase === 'clearing' && Math.abs(saved.x - saved.targetX) < .25) saved.phase = 'holding';
        const goal = saved.phase === 'returning' ? saved.homeX : saved.targetX;
        const peers = this.getNpcServicePeersV163(saved.deck, saved.crewId);
        const player = this.state?.deck === saved.deck && !this.isAnnexActiveV71?.() && !this.ventActorV62 ? this.player : null;
        const boxes = [...buildHubObstacleGeometryV87(saved.deck),
          ...this.npcTrafficDoorsV163[saved.deck].filter(d => d.blocking !== false && d.progress < .82).map(getHubBulkheadColliderV134),
          ...[...peers, ...(player ? [player] : [])].filter(a => a !== body && a.alive !== false && Math.abs(a.y + a.h - 624) < 16)
            .map(a => ({ x: a.x - 12, y: a.y, w: a.w + 24, h: a.h }))];
        const originalX = body.x;
        const priority = body.alive === false || body.downed || body.workClock > 0 || body.supportClock > 0;
        for (let remaining = priority ? 0 : dt; remaining > 1e-8;) {
          const step = Math.min(1 / 120, remaining); remaining -= step;
          const distance = Math.abs(goal - saved.x), direction = Math.sign(goal - saved.x);
          const speed = Math.min(27, Math.sqrt(2 * 92 * Math.max(0, distance - .1)));
          const velocity = saved.velocity + clamp(direction * speed - saved.velocity, -92 * step, 92 * step);
          const proposed = clamp(saved.x + (saved.velocity + velocity) * .5 * step, Math.min(saved.x, goal), Math.max(saved.x, goal));
          const contact = moveNpcAgainstGeometryV136({ ...body, x: saved.x }, proposed, boxes);
          saved.x = contact.x; saved.velocity = contact.blocked ? 0 : velocity;
          if (distance < .25 && Math.abs(saved.velocity) < 3) { saved.velocity = 0; break; }
        }
        if (priority) saved.velocity = 0;
        saved.roomId = mainRoom(saved.deck, saved.x).id; saved.time += dt;
        saved.distance += Math.abs(saved.x - originalX);
        const vx = (saved.x - originalX) / dt;
        if (Math.abs(vx) > .1) saved.facing = Math.sign(vx);
        saved.bulkheadProgress = Object.fromEntries(this.npcTrafficDoorsV163[saved.deck].map(door => [door.id, door.progress]));
        Object.assign(body, { x: saved.x, y: 532, roomId: saved.roomId, facing: saved.facing, vx, mobile: false });
        body.lifeV136 = { schema: 136, context: 'service-traffic-v163', x: body.x, y: body.y, time: saved.time,
          velocity: saved.velocity, actualVelocity: vx, facing: body.facing, mode: Math.abs(vx) > .1 ? 'moving' : 'yielding',
          passive: null, previousPassive: null, blend: 1 };
        if (saved.phase === 'clearing' && Math.abs(saved.x - goal) < .25) saved.phase = 'holding';
        const visible = this.state?.deck === saved.deck && !this.isAnnexActiveV71?.() && !this.ventActorV62;
        if (visible) this.npcs = [...this.npcs.filter(a => a.crewId !== body.crewId), body];
        else this.sampleNpcAnimation?.(body, { emit: false, discardEvents: true });
      }
      return result;
    }

    persist() {
      const original = this.onPersist; let patch;
      this.onPersist = value => { patch = value; };
      try { super.persist(); } finally { this.onPersist = original; }
      if (patch) original({ ...patch, npcServiceTrafficV163: normalizeNpcServiceTrafficV163(this.npcTrafficStateV163) });
    }

    getSnapshot() {
      return { ...super.getSnapshot(), npcServiceTrafficV163: {
        ...normalizeNpcServiceTrafficV163(this.npcTrafficStateV163),
        handoffs: clone(this.npcTrafficHandoffsV163 || []),
        policy: 'native-unowned-body-continuous-floor-clearance-no-overtake',
        observedCrossDeckTravel: false } };
    }
  };
}
