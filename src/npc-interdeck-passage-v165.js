import { HUB_DECKS } from './hub-game.js';
import { HUB_NPC_ANNEX_WORKPOST_ROUTES_V165 } from './npc-annex-workpost-routes-v165.js';
import { getNpcAnnexLeaseRouteV163 } from './npc-annex-leases-v163.js';

const DAVID = 'david-durandal', ROOK = 'rook-cctv', ECHO = 'echo-escape';
const ids = { [DAVID]: 'crew-10-david-8r', [ROOK]: 'crew-06-rook', [ECHO]: 'crew-14-echo-a' };
const source = 'observed-interdeck-passing-places-v165';
const finite = Number.isFinite, copy = value => value == null ? value : JSON.parse(JSON.stringify(value));
const near = (a, b) => finite(a) && finite(b) && Math.abs(a - b) < .26;
const main = actor => HUB_DECKS[0].rooms.some(room => room.id === actor?.roomId);
const phases = ['drain-echo', 'clear-cctv', 'outbound-escape', 'return-escape', 'echo-west', 'david-west', 'rook-home', 'echo-home'];
const room = id => HUB_DECKS[0].rooms.find(entry => entry.id === id);
const cctvFace = HUB_NPC_ANNEX_WORKPOST_ROUTES_V165[0].faces.parent;
const escapeFace = getNpcAnnexLeaseRouteV163(ECHO, 'combat-information').faces.parent;
const socket = face => face.opening.x + (face.opening.w - 44) / 2;

/** These are floor goals beside the authored doors, never replacement poses.
 * The 68px spacing retains the controllers' 44px body and 12px peer margin. */
export const NPC_INTERDECK_PASSAGE_GEOMETRY_V165 = Object.freeze({
  cctvX: socket(cctvFace), escapeX: socket(escapeFace),
  echoWestX: socket(cctvFace) - 136, davidWestX: socket(cctvFace) - 68,
  davidFarWestX: socket(cctvFace) - 204,
  escapeClearX: escapeFace.opening.x + escapeFace.opening.w + 12
});
const geo = NPC_INTERDECK_PASSAGE_GEOMETRY_V165;
function bookmark(value, crewId, allowed) {
  const r = room(value?.roomId);
  return value?.crewId === crewId && value.deck === 0 && allowed.includes(value.roomId) && r
    && finite(value.x) && value.x >= r.xStart + 24 && value.x <= r.xEnd - 68
    && value.y === 532 && [-1, 1].includes(value.facing)
    ? { crewId, deck: 0, roomId: value.roomId, x: value.x, y: 532, facing: value.facing } : null;
}
const observedBookmark = actor => actor && ({ crewId: actor.crewId, deck: 0,
  roomId: actor.roomId, x: actor.x, y: actor.y, facing: actor.facing });
function normalizeSession(raw) {
  if (!raw || raw.source !== source || !phases.includes(raw.phase)
    || !['outbound', 'return'].includes(raw.direction) || !['echo-first', 'david-first'].includes(raw.order)
    || raw.drainOnly != null && typeof raw.drainOnly !== 'boolean'
    || typeof raw.echoBorrowed !== 'boolean' || typeof raw.echoParked !== 'boolean'
    || typeof raw.davidPassedEscape !== 'boolean' || typeof raw.rookVisited !== 'boolean'
    || !finite(raw.waitX) || raw.waitX < 24 || raw.waitX > 5052
    || !finite(raw.elapsed) || raw.elapsed < 0 || raw.elapsed > 1e9
    || ![null, 'active-crisis', 'infestation', 'interaction'].includes(raw.pausedReason)) return null;
  const davidOrigin = bookmark(raw.davidOrigin, ids[DAVID], ['combat-information', 'cryo-bay']);
  const rookOrigin = bookmark(raw.rookOrigin, ids[ROOK], ['combat-information']);
  const echoOrigin = raw.echoOrigin == null ? null : bookmark(raw.echoOrigin, ids[ECHO], ['briefing', 'combat-information']);
  if (!davidOrigin || !rookOrigin || raw.echoOrigin != null && !echoOrigin
    || raw.echoBorrowed && !echoOrigin) return null;
  const drainOnly = raw.drainOnly === true;
  if (drainOnly && (raw.direction !== 'outbound' || !echoOrigin || echoOrigin.x > geo.echoWestX + .26
    || raw.waitX < geo.escapeX + 56 || !['drain-echo', 'rook-home', 'echo-home'].includes(raw.phase))) return null;
  return { source, phase: raw.phase, direction: raw.direction, order: raw.order,
    drainOnly,
    davidOrigin, rookOrigin, echoOrigin, waitX: raw.waitX, elapsed: raw.elapsed,
    echoBorrowed: raw.echoBorrowed, echoParked: raw.echoParked,
    davidPassedEscape: raw.davidPassedEscape, rookVisited: raw.rookVisited,
    pausedReason: raw.pausedReason };
}
function normalizeRetention(raw) {
  const davidOrigin = bookmark(raw?.davidOrigin, ids[DAVID], ['combat-information']);
  const rookOrigin = bookmark(raw?.rookOrigin, ids[ROOK], ['combat-information']);
  return raw?.source === source && raw.routeId === DAVID && raw.crewId === ids[ROOK]
    && davidOrigin && rookOrigin && davidOrigin.x < rookOrigin.x - 56
    ? { source, routeId: DAVID, crewId: ids[ROOK], davidOrigin, rookOrigin } : null;
}
export function normalizeNpcInterdeckPassageV165(value) {
  return { schema: 165, session: value?.schema === 165 ? normalizeSession(value.session) : null,
    retention: value?.schema === 165 ? normalizeRetention(value.retention) : null };
}

/** Coordinates belong exclusively to the existing physical controllers.
 * This owner arbitrates only their durable duty, hold and floor-goal inputs. */
export function withHubNpcInterdeckPassageV165(Base) {
  return class HubNpcInterdeckPassageV165 extends Base {
    start(save = {}, options = {}) {
      this.npcInterdeckPassageSandboxV165 = Boolean(options.editorProject || options.forgeJourneyV141 || this.forgeSessionV141);
      this.npcInterdeckPassageStateV165 = normalizeNpcInterdeckPassageV165(this.npcInterdeckPassageSandboxV165 ? null : save.npcInterdeckPassageV165);
      this.npcInterdeckPassageRestoringV165 = true;
      const result = super.start(save, options);
      this.npcInterdeckPassageRestoringV165 = false;
      this.planNpcInterdeckPassageV165(0);
      return result;
    }

    npcInterdeckPassageObservedV165() {
      const davidEntry = this.npcInterdeckStateV165?.routes?.[DAVID];
      const david = this.getNpcInterdeckActorsV165?.().find(actor => actor.crewId === ids[DAVID]);
      const rook = this.getNpcAnnexWorkpostActorV165?.(ROOK);
      const rookState = this.getNpcServicePhysicalStateV165?.(ROOK);
      const echoEntry = this.npcAnnexLeasesStateV163?.routes?.[ECHO];
      const echo = this.getNpcAnnexLeaseActorV163?.(ECHO);
      return { davidEntry, david, rook, rookState, echoEntry, echo };
    }

    npcInterdeckPassagePriorityV165(observed) {
      for (const id of [DAVID, ROOK, ECHO]) {
        const actor = observed[id === DAVID ? 'david' : id === ROOK ? 'rook' : 'echo'];
        const r = this.npcRoutineResolutionsV62?.get(ids[id]);
        if (!actor || actor.alive === false || actor.downed || !r) return 'unavailable';
        if (r.needsCare) return 'medical-recovery';
        if (r.missionAssigned) return 'mission-assignment';
        if (r.alert) return r.reason === 'active-crisis' ? 'active-crisis' : 'infestation';
        if (actor.workClock > 0 || actor.supportClock > 0) return 'interaction';
      }
      return null;
    }

    planNpcInterdeckPassageV165(delta = 0) {
      if (this.npcInterdeckPassageSandboxV165 || this.npcInterdeckPassageRestoringV165) return;
      const state = this.npcInterdeckPassageStateV165;
      if (!state) return;
      const o = this.npcInterdeckPassageObservedV165(), a = o.davidEntry?.actor;
      let s = state.session;
      const retained = state.retention;
      const retentionInterrupted = [o.david, o.rook].some(actor => !actor || actor.alive === false || actor.downed
        || this.npcRoutineResolutionsV62?.get(actor.crewId)?.needsCare
        || this.npcRoutineResolutionsV62?.get(actor.crewId)?.missionAssigned);
      if (retained && (!a || retentionInterrupted || !o.rookState || o.davidEntry.origin?.roomId !== retained.davidOrigin.roomId
        || o.davidEntry.origin?.x !== retained.davidOrigin.x
        || o.rookState && o.rookState.homeX !== retained.rookOrigin.x)) state.retention = null;
      if (!state.retention && !retentionInterrupted && a && o.davidEntry.origin?.roomId === 'combat-information' && o.rookState && o.rook) {
        state.retention = normalizeRetention({ source, routeId: DAVID, crewId: ids[ROOK],
          davidOrigin: o.davidEntry.origin,
          rookOrigin: { ...observedBookmark(o.rook), roomId: 'combat-information', x: o.rookState.homeX } });
      }
      if (s && (!o.davidEntry?.origin || o.davidEntry.origin.roomId !== s.davidOrigin.roomId
        || o.davidEntry.origin.x !== s.davidOrigin.x || o.davidEntry.origin.y !== s.davidOrigin.y
        || o.rookState && o.rookState.homeX !== s.rookOrigin.x
        || o.echoEntry?.actor && s.echoOrigin && (o.echoEntry.actor.homeX !== s.echoOrigin.x
          || o.echoEntry.originRoomId !== s.echoOrigin.roomId))) {
        // A valid-looking reservation cannot attach itself to a different
        // restored owner, native bookmark or later ECHO lease.
        state.session = null; return;
      }
      if (!s) {
        if (!a || a.deck !== 0 || !main(a) || !['retained', 'walking-lift', 'waiting-lift', 'walking-home'].includes(a.stage)
          || !o.davidEntry.origin || !o.rook || !o.rookState || !o.echo || this.npcInterdeckPassagePriorityV165(o)) return;
        const returning = a.direction === 'return';
        // A cross-zero visit has not reached its annex yet. Reuse that same
        // lease for a real full passing visit; never invent a returned ledger
        // with two crossings for an aborted walk on the parent floor.
        const oldReturn = Boolean(o.echoEntry?.actor && o.echoEntry.actor.crossings > 0
          && o.echoEntry.actor.targetRoomId !== 'escape-pods');
        const needsDavidPass = returning ? o.davidEntry.origin.x < o.rookState.homeX - 56
          : a.x < o.rookState.homeX + 56 && o.davidEntry.origin.x < o.rookState.homeX + 56;
        // An old westbound ECHO still needs the occupied CCTV pocket even
        // when its previous courtesy has already put David east of escape.
        // That is a drain of the old lease, never a new ECHO trip.
        const drainOnly = !needsDavidPass && !returning && oldReturn && o.rook.roomId === 'cctv'
          && a.x >= geo.escapeX + 56 && o.echoEntry.actor.homeX <= geo.echoWestX + .26;
        if (!needsDavidPass && !drainOnly) return;
        const echoResolution = this.npcRoutineResolutionsV62?.get(ids[ECHO]);
        const echoNativeTarget = echoResolution?.phase === 'route' ? echoResolution.toRoomId : echoResolution?.roomId;
        // A body still west can have an eastbound native intention after a
        // watch change. Only a real briefing body staying in briefing may
        // remain outside a return passing loan.
        const echoStaysWest = o.echo.roomId === 'briefing' && echoNativeTarget === 'briefing'
          && o.echo.x < geo.echoWestX - 56;
        const echoOrigin = o.echoEntry?.actor ? { ...observedBookmark(o.echo),
          roomId: o.echoEntry.originRoomId, x: o.echoEntry.actor.homeX } : observedBookmark(o.echo);
        s = normalizeSession({ source, phase: oldReturn ? 'drain-echo' : 'clear-cctv',
          direction: returning ? 'return' : 'outbound', order: o.echo.x < a.x ? 'david-first' : 'echo-first',
          drainOnly,
          davidOrigin: o.davidEntry.origin, rookOrigin: { ...observedBookmark(o.rook), roomId: 'combat-information', x: o.rookState.homeX },
          echoOrigin, waitX: a.x, elapsed: 0, echoBorrowed: Boolean(o.echoEntry?.actor) || !returning || !echoStaysWest,
          echoParked: false, davidPassedEscape: false, rookVisited: false, pausedReason: null });
        if (!s) return;
        state.session = s;
      }
      const priority = this.npcInterdeckPassagePriorityV165(o);
      if (['unavailable', 'medical-recovery', 'mission-assignment'].includes(priority)) {
        // Their owners perform the existing priority handoff. A passing
        // reservation must not survive a missing or reassigned singleton.
        state.session = null; state.retention = null; return;
      }
      s.pausedReason = priority;
      if (priority) return;
      s.elapsed = Math.min(1e9, s.elapsed + Math.max(0, delta));
      const atCctv = o.rook?.roomId === 'cctv' && o.rookState?.stage === 'service' && o.rookState.doorProgress === 0;
      const atEscape = o.echo?.roomId === 'escape-pods' && o.echoEntry?.actor?.stage === 'service'
        && o.echoEntry.actor.doorProgress === 0;
      const echoHome = !o.echoEntry?.actor && o.echoEntry?.returned?.observedTravel === true
        && o.echoEntry.returned.crossings === 2 && near(o.echoEntry.returned.x, s.echoOrigin?.x)
        && o.echoEntry.returned.roomId === s.echoOrigin?.roomId;
      const rookHome = o.rookState?.stage === 'service' && o.rookState.roomId === 'combat-information'
        && o.rookState.doorProgress === 0 && near(o.rookState.x, s.rookOrigin.x);
      if (atCctv) s.rookVisited = true;
      const echoHomeEast = s.echoBorrowed && s.echoOrigin.x > s.davidOrigin.x;
      const davidBay = echoHomeEast && s.direction === 'return' ? geo.davidFarWestX : geo.davidWestX;
      const davidAtBay = a?.deck === 0 && main(a) && near(a.x, davidBay);
      if (a && (a.deck !== 0 || main(a) && a.x >= geo.escapeClearX)) s.davidPassedEscape = true;
      if (s.phase === 'drain-echo' && echoHome) {
        // The next lease is admitted from the exact returned body, only
        // after the old lease has recorded its own two physical crossings.
        s.echoOrigin = observedBookmark(o.echo);
        if (s.drainOnly) {
          s.echoBorrowed = false; s.echoParked = true; s.phase = 'rook-home'; return;
        }
        const resolution = this.npcRoutineResolutionsV62?.get(ids[ECHO]);
        const target = resolution?.phase === 'route' ? resolution.toRoomId : resolution?.roomId;
        s.echoBorrowed = s.direction === 'outbound' || o.echo.roomId !== 'briefing' || target !== 'briefing';
        s.phase = 'clear-cctv'; s.order = o.echo.x < (a?.x ?? s.waitX) ? 'david-first' : 'echo-first';
      } else if (s.phase === 'clear-cctv' && atCctv) {
        s.phase = s.direction === 'outbound' ? 'outbound-escape' : s.echoBorrowed ? 'return-escape' : 'david-west';
      } else if (s.phase === 'outbound-escape' && atEscape && s.davidPassedEscape) {
        s.phase = 'echo-west';
      } else if (s.phase === 'return-escape' && atEscape) {
        s.phase = echoHomeEast ? 'david-west' : 'echo-west';
      } else if (s.phase === 'echo-west' && main(o.echo) && o.echo.x <= geo.echoWestX + .26) {
        s.echoParked = true; s.phase = s.direction === 'return' && !davidAtBay ? 'david-west' : 'rook-home';
      } else if (s.phase === 'david-west' && davidAtBay) {
        s.phase = s.echoBorrowed && !s.echoParked ? 'echo-west' : 'rook-home';
      } else if (s.phase === 'rook-home' && rookHome) {
        s.phase = 'echo-home';
      } else if (s.phase === 'echo-home' && (!s.echoBorrowed || echoHome)
        && (s.direction === 'outbound' || o.davidEntry?.returned?.observedTravel === true
          && near(o.davidEntry.returned.x, s.davidOrigin.x))) {
        state.session = null;
      }
    }

    getNpcServicePassingDutyV165(routeId, actor) {
      const s = this.npcInterdeckPassageStateV165?.session;
      if (!s || ![ROOK, ECHO].includes(routeId) || actor?.crewId !== ids[routeId])
        return super.getNpcServicePassingDutyV165?.(routeId, actor);
      if (s.pausedReason) return false;
      if (routeId === ROOK) return !['rook-home', 'echo-home'].includes(s.phase);
      if (!s.echoBorrowed || s.phase === 'drain-echo') return false;
      if (s.phase === 'david-west' && s.direction === 'return' && s.echoOrigin.x > s.davidOrigin.x && !s.echoParked) return true;
      return ['clear-cctv', 'outbound-escape', 'return-escape'].includes(s.phase);
    }

    shouldRetainNpcServiceOwnerV165(routeId, actor, physicalState) {
      const retained = this.npcInterdeckPassageStateV165?.retention;
      const david = this.npcInterdeckStateV165?.routes?.[DAVID];
      if (routeId !== ROOK || actor?.crewId !== ids[ROOK] || !retained || !david?.actor
        || david.origin?.roomId !== retained.davidOrigin.roomId || david.origin?.x !== retained.davidOrigin.x
        || physicalState?.homeX !== retained.rookOrigin.x)
        return super.shouldRetainNpcServiceOwnerV165?.(routeId, actor, physicalState);
      return true;
    }

    shouldHoldNpcServiceOwnerV165(routeId, actor, physicalState) {
      const s = this.npcInterdeckPassageStateV165?.session;
      if (!s || ![ROOK, ECHO].includes(routeId) || actor?.crewId !== ids[routeId])
        return super.shouldHoldNpcServiceOwnerV165?.(routeId, actor, physicalState);
      return !s.pausedReason && (routeId === ROOK ? !['rook-home', 'echo-home'].includes(s.phase)
        : ['clear-cctv', 'outbound-escape', 'return-escape'].includes(s.phase)
          || s.phase === 'david-west' && s.direction === 'return' && s.echoOrigin.x > s.davidOrigin.x && !s.echoParked);
    }

    getNpcServiceOwnerYieldGoalV165(routeId, actor) {
      const s = this.npcInterdeckPassageStateV165?.session;
      if (!s || ![DAVID, ROOK, ECHO].includes(routeId) || actor?.crewId !== ids[routeId])
        return super.getNpcServiceOwnerYieldGoalV165?.(routeId, actor) ?? null;
      if (s.pausedReason) return null;
      if (routeId === ROOK) return null;
      if (routeId === ECHO) {
        if (s.phase === 'drain-echo' || !s.echoBorrowed || s.phase === 'echo-home') return null;
        if (s.phase === 'clear-cctv' && (s.order === 'david-first' || s.direction === 'return')
          || ['echo-west', 'david-west', 'rook-home'].includes(s.phase))
          return main(actor) ? geo.echoWestX : null;
        return null;
      }
      if (s.drainOnly) return Math.max(s.waitX, geo.escapeClearX + 68);
      if (s.phase === 'drain-echo') {
        if (s.direction === 'return') return Math.max(s.waitX, geo.escapeClearX + 68);
        const echo = this.getNpcAnnexLeaseActorV163?.(ECHO);
        // A returning body already west of David finishes first. Asking
        // David to reach a bay behind it would oppose an eastbound final
        // return to its bookmark. The old lease's return is the only event
        // advancing this phase; reaching a temporary goal is never assumed.
        if (main(echo) && echo.x < actor.x) return Math.max(s.waitX, (s.echoOrigin?.x ?? s.waitX) + 56);
        return Math.min(geo.davidWestX, (s.echoOrigin?.x ?? geo.davidWestX) - 68);
      }
      if (s.direction === 'return') {
        const eastHome = s.echoBorrowed && s.echoOrigin.x > s.davidOrigin.x;
        const bay = eastHome ? geo.davidFarWestX : geo.davidWestX;
        if (eastHome && s.phase === 'echo-west') return bay;
        if (['clear-cctv', 'return-escape', 'echo-west'].includes(s.phase)) return Math.max(s.waitX, geo.escapeClearX + 68);
        if (['david-west', 'rook-home'].includes(s.phase)) return bay;
        if (eastHome && s.phase === 'echo-home') {
          const echo = this.npcAnnexLeasesStateV163?.routes?.[ECHO];
          if (echo?.actor || !near(echo?.returned?.x, s.echoOrigin.x)) return bay;
        }
        return null;
      }
      if (s.phase === 'clear-cctv' || s.phase === 'outbound-escape' && s.order === 'echo-first'
        && this.getNpcAnnexLeaseActorV163?.(ECHO)?.roomId !== 'escape-pods') return geo.davidWestX;
      return null;
    }

    getNpcServiceTrafficIntentsV163() {
      const inherited = super.getNpcServiceTrafficIntentsV163?.() || [];
      if (!this.npcInterdeckPassageStateV165?.session) return inherited;
      return inherited.map(intent => {
        const id = intent.routeId?.startsWith(DAVID + ':deck-') ? DAVID : intent.routeId;
        const goal = this.getNpcServiceOwnerYieldGoalV165(id, intent.actor);
        return finite(goal) ? { ...intent, goalX: goal } : intent;
      });
    }

    update(delta) {
      const active = this.running && finite(delta) && delta > 0;
      const previous = this.npcInterdeckPassageStateV165?.session;
      const previousKey = (previous ? previous.phase + ':' + previous.pausedReason : '')
        + ':' + Boolean(this.npcInterdeckPassageStateV165?.retention);
      if (active) this.planNpcInterdeckPassageV165(Math.min(delta, .1));
      const result = super.update(delta);
      if (active && this.running) this.planNpcInterdeckPassageV165(0);
      const current = this.npcInterdeckPassageStateV165?.session;
      const currentKey = (current ? current.phase + ':' + current.pausedReason : '')
        + ':' + Boolean(this.npcInterdeckPassageStateV165?.retention);
      if (active && previousKey !== currentKey) this.persist();
      return result;
    }

    persist() {
      const original = this.onPersist; let patch;
      this.onPersist = value => { patch = value; };
      try { super.persist(); } finally { this.onPersist = original; }
      if (patch) original({ ...patch, npcInterdeckPassageV165: normalizeNpcInterdeckPassageV165(this.npcInterdeckPassageStateV165) });
    }

    getSnapshot() {
      return { ...super.getSnapshot(), npcInterdeckPassageV165: {
        ...normalizeNpcInterdeckPassageV165(this.npcInterdeckPassageStateV165), geometry: copy(geo),
        policy: 'same-physical-owners-observed-passing-places-no-overtake', bodiesMovedByPlanner: false } };
    }
  };
}
