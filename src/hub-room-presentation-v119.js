/** Presentation decisions, not a second map or collision registry. Historical
 * room IDs, walk rails and interactable coordinates are owned by V53/V71/V87.
 * A room without a reviewed profile stays orthographic rather than silently
 * acquiring depth. Layers name existing renderer responsibilities, not assets
 * claimed to have been created. */
const profile = (roomId, presentationMode, depthProfile, reason, farFactor = .025) => Object.freeze({
  roomId, presentationMode, depthProfile, reason,
  gameplayPlane: '2d', coordinatePolicy: 'preserve-existing',
  layers: Object.freeze(['far', 'architecture', 'gameplay', 'light', 'foreground']),
  perspectiveFloor: presentationMode === '2.5d',
  foreground: 'below-walk-rail-only',
  cameraProfile: Object.freeze({ farFactor: presentationMode === '2.5d' ? farFactor : 0,
    maximumDrift: presentationMode === '2.5d' ? 18 : 0, gameplayFactor: 1, interactionFactor: 1 }),
  referenceStatus: 'project-authored-presentation', canonStatus: 'project-adaptation'
});
const reviewed = [
  profile('bridge', '2.5d', 'command-observation', 'Grande passerelle : baie lointaine et plateforme de commande.', .022),
  profile('briefing', '2.5d', 'command-planning', 'Architecture profonde derrière la table ; interaction sur le plan historique.', .018),
  profile('combat-information', '2.5d', 'command-cic', 'Centre tactique et baies techniques superposées.', .020),
  profile('cryo-bay', '2.5d', 'cryo-vault', 'Baie de pods en profondeur ; aucune translation des pods physiques.', .018),
  profile('crew-quarters', '2d', 'compact-habitat', 'Dortoir compact : couchettes et personnel doivent rester lisibles.'),
  profile('mess', '2d', 'compact-social', 'Interactions frontales autour des tables.'),
  profile('medical', '2d', 'compact-medical', 'Lits, soins et personnel partagent un plan frontal.'),
  profile('science-lab', '2d', 'compact-science', 'Petite salle technique et station d’analyse frontale.'),
  profile('quarantine', '2d', 'compact-containment', 'Accès au confinement immédiatement lisible.'),
  profile('armory', '2d', 'compact-armory', 'Comptoir étroit et rack : priorité à l’interaction.'),
  profile('workshop', '2d', 'compact-workshop', 'Établi frontal et circulation technique compacte.'),
  profile('vehicle-bay', '2.5d', 'industrial-vehicle-bay', 'Volume de maintenance des véhicules et rails au sol.'),
  profile('dropship-hangar', '2.5d', 'flight-hangar', 'Grand hangar : coque lointaine, dropship et passerelle.', .030),
  profile('reactor', '2.5d', 'reactor-core', 'Hauteur et profondeur du cœur énergétique.', .021),
  profile('life-support', '2d', 'compact-life-support', 'Filtres et équipement de support-vie proches.'),
  profile('sensor-array', '2d', 'compact-sensors', 'Console de balayage frontal et salle technique compacte.'),
  profile('arrival-airlock', '2.5d', 'arrival-lock', 'Grand sas : architecture derrière le seuil physique.', .022),
  profile('logistics', '2.5d', 'cargo-vault', 'Soute ample ; piles de fret et catwalks conservent leurs coordonnées.'),
  profile('mire-archives', '2d', 'compact-archive', 'Lecture et consoles d’archive sur un plan frontal.'),
  profile('synthetic-bay', '2.5d', 'synthetic-maintenance', 'Volume de maintenance des unités manufacturées.', .018),
  profile('cctv', '2d', 'compact-security', 'Moniteurs et station de sécurité restent frontaux.'),
  profile('proving-ground', '2d', 'orthographic-range', 'Les vraies cibles physiques ne doivent pas être confondues avec un décor en perspective.'),
  profile('morgue', '2d', 'compact-autopsy', 'Tables médicales et terminal frontal.'),
  profile('escape-pods', '2.5d', 'escape-launch-bay', 'Baie de lancement des capsules et structure extérieure.', .020),
  profile('durandal', '2.5d', 'computation-core', 'Architecture verticale du noyau ; terminal inchangé.', .016),
  profile('bioforge', '2d', 'isolated-access', 'Sas d’accès technique, pas une conversion du niveau BIOFORGE.'),
  profile('animal-care', '2d', 'orthographic-animal-care', 'Logements, animaux et interactions au sol doivent rester visibles.'),
  profile('frontier-civil-counter', '2d', 'orthographic-civil-counter', 'Comptoir civil modulaire avec objets physiques rapprochés.'),
  profile('personal-refuge', '2d', 'authored-refuge', 'Composition dédiée du refuge et stations personnelles conservées.')
];
export const HUB_ROOM_PRESENTATIONS_V119 = Object.freeze(Object.fromEntries(reviewed.map(row => [row.roomId, row])));
export const HUB_ROOM_PRESENTATION_IDS_V119 = Object.freeze(reviewed.map(row => row.roomId));

export function getHubRoomPresentationV119(room, enabled = true) {
  const id = typeof room === 'string' ? room : room?.id;
  const entry = HUB_ROOM_PRESENTATIONS_V119[id] || profile(id || 'unknown', '2d', 'unreviewed', 'Présentation de cette salle à définir.');
  if (enabled) return entry;
  return Object.freeze({ ...entry, presentationMode: '2d', perspectiveFloor: false,
    cameraProfile: Object.freeze({ ...entry.cameraProfile, farFactor: 0, maximumDrift: 0 }) });
}

export function hubRoomPresentationReportV119(rooms = []) {
  const rows = rooms.map(room => getHubRoomPresentationV119(room));
  return Object.freeze({ total: rows.length, layered: rows.filter(row => row.presentationMode === '2.5d').length,
    orthographic: rows.filter(row => row.presentationMode === '2d').length,
    unreviewed: Object.freeze(rows.filter(row => row.depthProfile === 'unreviewed').map(row => row.roomId)),
    gameplayPlane: '2d', coordinatePolicy: 'preserve-existing' });
}
