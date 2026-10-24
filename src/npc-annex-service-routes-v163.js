import { createServiceRouteV161 } from './npc-service-routes-v161.js';
import { withHubNpcServiceTrafficV163 } from './npc-service-traffic-v163.js';

/** Five additional native watches share the same durable physical owner.
 * Four have a portal in their actual station. Mara first crosses the real
 * command-deck bulkhead from bridge to briefing, then uses the archive door.
 * Other watches retain priority and explicitly unobserved native handoffs;
 * these routes do not pretend that cross-deck/lift travel was observed. */
export const HUB_NPC_ANNEX_SERVICE_ROUTE_DEFINITIONS_V163 = Object.freeze([
  { id: 'maksim-arrival', crewId: 'crew-08-maksim-orlov', deck: 3,
    parentRoomId: 'dropship-hangar', annexRoomId: 'arrival-airlock', targetX: 1220,
    duty: 'arrival-flight-safety', alternateAnnexRoomIds: ['flight-control-cockpit'] },
  { id: 'inez-bioforge', crewId: 'crew-09-inez-harlow', deck: 2,
    parentRoomId: 'quarantine', annexRoomId: 'bioforge', targetX: 1205,
    duty: 'isolated-specimen-review', alternateAnnexRoomIds: ['morgue', 'frontier-civil-counter'] },
  { id: 'asha-refuge', crewId: 'crew-12-asha-mbaye', deck: 1,
    parentRoomId: 'crew-quarters', annexRoomId: 'personal-refuge', targetX: 960,
    duty: 'habitat-welfare-visit', alternateAnnexRoomIds: [] },
  { id: 'jun-water', crewId: 'crew-11-jun-park', deck: 3,
    parentRoomId: 'life-support', annexRoomId: 'water-recycling', targetX: 700,
    duty: 'water-treatment-inspection', alternateAnnexRoomIds: ['maintenance-spine', 'sanitary-bay'] },
  { id: 'mara-archives', crewId: 'crew-01-mara-vega', deck: 0,
    homeRoomId: 'bridge', parentRoomId: 'briefing', annexRoomId: 'mire-archives', targetX: 1360,
    duty: 'command-record-review', alternateAnnexRoomIds: [] }
].map(definition => Object.freeze({ ...definition,
  alternateAnnexRoomIds: Object.freeze(definition.alternateAnnexRoomIds) })));

export const HUB_NPC_ANNEX_SERVICE_ROUTES_V163 = Object.freeze(HUB_NPC_ANNEX_SERVICE_ROUTE_DEFINITIONS_V163
  .map(definition => createServiceRouteV161(definition, { schema: 163, stateField: 'npcAnnexRoutesV163',
    homeRoomId: definition.homeRoomId || definition.parentRoomId,
    alternateAnnexRoomIds: definition.alternateAnnexRoomIds })));

export function normalizeNpcAnnexServiceRoutesV163(value) {
  const source = value?.schema === 163 ? value.routes : null;
  return { schema: 163, routes: Object.fromEntries(HUB_NPC_ANNEX_SERVICE_ROUTES_V163.map(route => [route.definition.id,
    route.normalize(source?.[route.definition.id])])) };
}

export function withHubNpcAnnexServiceRoutesV163(Base) {
  const Routed = HUB_NPC_ANNEX_SERVICE_ROUTES_V163.reduce((Current, route) => route.withHub(Current), Base);
  return class HubNpcAnnexServiceRoutesV163 extends withHubNpcServiceTrafficV163(Routed) {
    getNpcAnnexServiceActorV163(routeId) { return this.getNpcServiceActorV161(routeId); }
    /** Pure occupancy probe: never rebuild routines, cohorts or route owners. */
    getNpcAnnexServiceActorsV163(deck = null) {
      return HUB_NPC_ANNEX_SERVICE_ROUTES_V163.filter(route => deck == null || route.definition.deck === deck)
        .map(route => this.getNpcAnnexServiceActorV163(route.definition.id)).filter(Boolean);
    }
  };
}
