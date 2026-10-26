import { createServiceRouteV161 } from './npc-service-routes-v161.js';
import { annexNpcDutiesV141 } from './hub-annex-npc-life-v141.js';

/** These two origins are real native work posts on the portal's deck.
 * The native roster station is elsewhere: retaining the work body does not
 * establish, simulate or count a journey from that other deck. */
export const HUB_NPC_ANNEX_WORKPOST_ROUTE_DEFINITIONS_V165 = Object.freeze([
  { id: 'rook-cctv', crewId: 'crew-06-rook', deck: 0, nativeTemplateDeck: 3,
    parentRoomId: 'combat-information', annexRoomId: 'cctv', targetX: 480,
    duty: 'camera-watch-review' },
  { id: 'tamsin-proving', crewId: 'crew-02-tamsin-velez', deck: 2, nativeTemplateDeck: 0,
    parentRoomId: 'armory', annexRoomId: 'proving-ground', targetX: 850,
    duty: 'range-safety-inspection' }
].map(Object.freeze));

export const HUB_NPC_ANNEX_WORKPOST_ROUTES_V165 = Object.freeze(
  HUB_NPC_ANNEX_WORKPOST_ROUTE_DEFINITIONS_V165.map(definition => createServiceRouteV161(definition, {
    schema: 165, stateField: 'npcAnnexWorkpostRoutesV165',
    nativeTemplateDeck: definition.nativeTemplateDeck, originPhase: 'work'
  })));

const rookRoute = HUB_NPC_ANNEX_WORKPOST_ROUTES_V165[0];
const rookId = 'rook-cctv', echoId = 'echo-escape';
const sourceGoalX = rookRoute.faces.parent.opening.x + rookRoute.faces.parent.opening.w / 2 - 22;
const passageSource = 'same-deck-cctv-passage-arbitration-v165';

function normalizePassage(value, routes) {
  const rook = routes?.[rookId]?.actor;
  if (!rook || value?.schema !== 165 || value.source !== passageSource
    || value.crewId !== 'crew-14-echo-a' || value.deck !== 0 || value.workpostHomeX !== rook.homeX
    || !['outbound', 'release-echo', 'return'].includes(value.mode)) return null;
  const goalX = value.mode === 'outbound' ? sourceGoalX - 136 : value.mode === 'return' ? rook.homeX + 68 : null;
  const priorityRouteId = value.mode === 'release-echo' ? echoId : rookId;
  if (value.goalX !== goalX || value.priorityRouteId !== priorityRouteId) return null;
  return { schema: 165, source: passageSource, crewId: 'crew-14-echo-a', deck: 0,
    mode: value.mode, workpostHomeX: rook.homeX, goalX, priorityRouteId };
}

export function normalizeNpcAnnexWorkpostRoutesV165(value) {
  const source = value?.schema === 165 ? value.routes : null;
  const routes = Object.fromEntries(HUB_NPC_ANNEX_WORKPOST_ROUTES_V165.map(route =>
    [route.definition.id, route.normalize(source?.[route.definition.id])]));
  return { schema: 165, routes, passage: normalizePassage(value?.schema === 165 ? value.passage : null, routes) };
}

export function withHubNpcAnnexWorkpostRoutesV165(Base) {
  const Routed = HUB_NPC_ANNEX_WORKPOST_ROUTES_V165.reduce((Current, route) => route.withHub(Current), Base);
  return class HubNpcAnnexWorkpostRoutesV165 extends Routed {
    start(save = {}, options = {}) {
      this.npcWorkpostPassageV165 = normalizeNpcAnnexWorkpostRoutesV165(save.npcAnnexWorkpostRoutesV165).passage;
      return super.start(save, options);
    }

    getNpcAnnexWorkpostActorV165(routeId) { return this.getNpcServiceActorV161(routeId); }

    /** Existing physical owners only; never rebuild a sampled native body. */
    getNpcAnnexWorkpostActorsV165(deck = null) {
      return HUB_NPC_ANNEX_WORKPOST_ROUTES_V165.filter(route => deck == null || route.definition.deck === deck)
        .map(route => this.getNpcAnnexWorkpostActorV165(route.definition.id)).filter(Boolean);
    }

    /** Two floor owners cannot pass through each other. Rook's rear-wall
     * portal is the real passing place: ECHO and its courteous native peer
     * first withdraw west, then regain their eastbound itinerary after Rook
     * has entered CCTV. During Rook's return ECHO waits beyond its bookmark.
     * Every actor still spends bounded distance through its own controller. */
    planNpcWorkpostPassageV165() {
      const rook = this.getNpcAnnexWorkpostActorV165(rookId);
      // A later transport controller may own a durable, explicitly phased
      // passing assignment. Do not issue a second conflicting ECHO goal.
      const externalPassing = this.getNpcServicePassingDutyV165?.(rookId, rook);
      if (typeof externalPassing === 'boolean') { this.npcWorkpostPassageV165 = null; return; }
      const state = this.getNpcServicePhysicalStateV165?.(rookId);
      const echoEntry = this.npcAnnexLeasesStateV163?.routes?.[echoId];
      const echo = echoEntry?.actor && this.getNpcAnnexLeaseActorV163?.(echoId);
      if (!rook || !state || !echo || rook.alive === false || echo.alive === false || rook.downed || echo.downed) {
        this.npcWorkpostPassageV165 = null; return;
      }
      const watch = annexNpcDutiesV141(this.npcRoutineResolutionsV62, this)
        .some(duty => duty.crewId === rook.crewId && duty.roomId === 'cctv');
      let mode = null;
      if (watch && rook.roomId === 'combat-information' && echo.roomId === 'combat-information'
        && echo.x < rook.x) mode = 'outbound';
      else if (watch && rook.roomId === 'cctv') mode = 'release-echo';
      else if (!watch && (rook.roomId === 'cctv' || rook.roomId === 'combat-information')
        && (echo.roomId === 'escape-pods' || ['combat-information', 'cryo-bay'].includes(echo.roomId)
          && echo.x > Math.max(rook.x, state.homeX))) mode = 'return';
      this.npcWorkpostPassageV165 = mode ? { schema: 165, source: passageSource,
        crewId: echo.crewId, deck: 0, mode, workpostHomeX: state.homeX,
        goalX: mode === 'outbound' ? sourceGoalX - 136 : mode === 'return' ? state.homeX + 68 : null,
        priorityRouteId: mode === 'release-echo' ? echoId : rookId } : null;
    }

    getNpcServiceOwnerYieldGoalV165(routeId, actor) {
      const passage = this.npcWorkpostPassageV165;
      if (routeId === echoId && actor?.crewId === passage?.crewId && Number.isFinite(passage.goalX)) return passage.goalX;
      return super.getNpcServiceOwnerYieldGoalV165?.(routeId, actor) ?? null;
    }

    canPreemptNpcServiceCourtesyV165(intent, saved) {
      const passage = this.npcWorkpostPassageV165;
      if (!passage || !saved || saved.deck !== 0 || saved.homeRoomId !== 'combat-information'
        || saved.roomId !== 'combat-information' || intent.routeId !== passage.priorityRouteId) return false;
      return passage.mode === 'outbound' && saved.routeId === echoId && saved.ownerCrewId === 'crew-14-echo-a'
        || passage.mode === 'release-echo' && saved.routeId === rookId && saved.ownerCrewId === 'crew-06-rook';
    }

    getNpcServiceTrafficIntentsV163() {
      const inherited = super.getNpcServiceTrafficIntentsV163?.() || [];
      const passage = this.npcWorkpostPassageV165;
      if (!passage) return inherited;
      return inherited.map(intent => intent.routeId === echoId && Number.isFinite(passage.goalX)
        ? { ...intent, goalX: passage.goalX } : intent)
        .sort((a, b) => Number(b.routeId === passage.priorityRouteId) - Number(a.routeId === passage.priorityRouteId));
    }

    update(delta) {
      if (this.running && Number.isFinite(delta) && delta > 0) this.planNpcWorkpostPassageV165();
      return super.update(delta);
    }

    persist() {
      const original = this.onPersist; let patch;
      this.onPersist = value => { patch = value; };
      try { super.persist(); } finally { this.onPersist = original; }
      if (patch) original({ ...patch, npcAnnexWorkpostRoutesV165: normalizeNpcAnnexWorkpostRoutesV165({
        ...patch.npcAnnexWorkpostRoutesV165, passage: this.npcWorkpostPassageV165 }) });
    }

    getSnapshot() {
      const snapshot = super.getSnapshot();
      const state = snapshot.npcAnnexWorkpostRoutesV165;
      if (!state) return snapshot;
      return { ...snapshot, npcAnnexWorkpostRoutesV165: { ...state,
        passage: normalizePassage(this.npcWorkpostPassageV165, state.routes),
        routes: Object.fromEntries(HUB_NPC_ANNEX_WORKPOST_ROUTE_DEFINITIONS_V165.map(definition => {
          const route = state.routes?.[definition.id];
          return [definition.id, { ...route, scope: 'same-deck-native-workpost-annex-round-trip',
            originKind: 'native-workpost', originRoomId: definition.parentRoomId,
            nativeRosterDeck: definition.nativeTemplateDeck,
            originCondition: route?.initialCondition === definition.parentRoomId ? 'native-workpost-body'
              : route?.initialCondition === definition.annexRoomId ? 'annex-initial-condition' : null,
            stationToWorkTravelObserved: false, npcLiftTransportImplemented: false }];
        })) } };
    }
  };
}
