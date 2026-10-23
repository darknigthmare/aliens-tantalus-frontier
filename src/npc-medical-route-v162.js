import { createServiceRouteV161 } from './npc-service-routes-v161.js';

/** Noor's existing forensic watch uses the actual medical/morgue connection.
 * Her admitted09h companion-care visit keeps priority after a real return to
 * medical. Only this paired local route is walked; the subsequent animal-care
 * timetable handoff is explicitly unobserved and retains its native owner. */
export const HUB_NPC_MEDICAL_ROUTE_DEFINITION_V162 = Object.freeze({
  id: 'noor-morgue', crewId: 'crew-04-noor-okafor', deck: 1,
  parentRoomId: 'medical', annexRoomId: 'morgue', targetX: 975, duty: 'forensic-care',
  source: 'native-v52-noor-v141-forensic-watch-v157-companion-watch-v138-sockets-v142-paired-doors'
});
export const HUB_NPC_MEDICAL_ROUTE_V162 = createServiceRouteV161(HUB_NPC_MEDICAL_ROUTE_DEFINITION_V162, {
  schema: 162, stateField: 'npcMedicalRouteV162', alternateAnnexRoomIds: Object.freeze(['animal-care'])
});

export function normalizeNpcMedicalRouteV162(value) {
  return { schema: 162, routes: { 'noor-morgue': HUB_NPC_MEDICAL_ROUTE_V162.normalize(
    value?.schema === 162 ? value.routes?.['noor-morgue'] : null) } };
}
export function withHubNpcMedicalRouteV162(Base) {
  return class HubNpcMedicalRouteV162 extends HUB_NPC_MEDICAL_ROUTE_V162.withHub(Base) {
    getNpcMedicalActorV162() { return this.getNpcServiceActorV161('noor-morgue'); }
  };
}
