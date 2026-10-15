/** Admission of the reachable Forge journey. Physics remains owned by the
 * two native compilers; moving bodies are checked again at each doorway. */
import { parseProject, nativeTiles, validateProject, decorative } from './forge-model-v130.js';
import { inspectForgeRoomPhysicsV141 } from './forge-playtest-v136.js';
import { reachableForgeRoomsV141, outgoingForgeLinksV141, findForgeArrivalV141,
  forgeBoxesOverlapV141 } from './forge-journey-v141.js';
import { compileShipProject } from './hub-v51-runtime.js';

const obsolete = new Set(['native-decoration-omitted', 'native-active-room-only',
  'native-ship-context', 'native-ship-objective', 'links-authoring', 'decor-preview']);
const objectives = room => room.cells.filter(cell => cell.type === 'objective' && !decorative(cell));

export function inspectForgeJourneyV141(input) {
  const project = parseProject(input), validation = validateProject(project);
  const reachableRoomIds = reachableForgeRoomsV141(project);
  const reached = new Set(reachableRoomIds);
  const roomReports = reachableRoomIds.map(roomId => {
    const report = inspectForgeRoomPhysicsV141(project, roomId, validation);
    const room = project.rooms.find(entry => entry.id === roomId);
    const entry = roomId === project.activeRoomId;
    const issues = report.issues.flatMap(issue => {
      if (obsolete.has(issue.code) || issue.code === 'missing-objective'
        || !entry && issue.code === 'missing-spawn') return [];
      // Only the starting insertion is used. Later arrivals use their linked
      // door, so an unused spawn remains a warning rather than a false veto.
      if (!entry && issue.code.startsWith('native-spawn-')) return [{ ...issue, severity: 'warning' }];
      return [{ ...issue }];
    });
    const geometry = [...report.geometry];
    if (project.kind === 'ship') {
      const compiled = compileShipProject({ schema: 2, kind: 'ship', size: room.size, tiles: nativeTiles(room) });
      const cells = room.cells.filter(cell => cell.type === 'vent' && !decorative(cell));
      geometry.push(...compiled.vents.map((vent, index) => ({ ...vent, type: 'vent',
        id: cells[index].id, cellId: cells[index].id })));
      const spawn = entry && geometry.find(shape => shape.type === 'spawn');
      if (spawn && compiled.vents.some(vent => forgeBoxesOverlapV141(spawn, vent))) issues.push({
        severity: 'error', code: 'journey-spawn-vent', message: 'Le conduit bloque le corps debout à l’insertion.',
        roomId, cellId: spawn.cellId, x: null, y: null });
    }
    return { ...report, geometry, issues, ok: !issues.some(issue => issue.severity === 'error'),
      errors: issues.filter(issue => issue.severity === 'error').map(issue => issue.message),
      warnings: issues.filter(issue => issue.severity === 'warning').map(issue => issue.message) };
  });
  const active = roomReports[0], issues = roomReports.flatMap(report => report.issues);
  const add = (severity, code, message, roomId = project.activeRoomId, cellId = null) =>
    issues.push({ severity, code, message, roomId, cellId, x: null, y: null });
  const totalObjectiveCount = project.rooms.filter(room => reached.has(room.id))
    .reduce((sum, room) => sum + objectives(room).length, 0);
  if (!totalObjectiveCount) add('error', 'journey-missing-objective',
    'Ajoutez au moins un objectif dans les salles accessibles du parcours.');
  for (const room of project.rooms.filter(room => !reached.has(room.id))) {
    add('warning', 'journey-unreachable-room',
      `${room.name} ne sera pas chargée : aucun passage ne la relie au départ.`, room.id);
  }
  const reports = new Map(roomReports.map(report => [report.roomId, report]));
  const arrivals = [];
  for (const roomId of reachableRoomIds) for (const link of outgoingForgeLinksV141(project, roomId)) {
    const destination = reports.get(link.to.roomId);
    const door = destination.geometry.find(shape => shape.cellId === link.to.cellId && shape.type === 'door');
    const arrival = findForgeArrivalV141({ door,
      actor: { w: destination.bounds.actorWidth, h: destination.bounds.actorHeight, facing: 1 },
      bounds: destination.bounds,
      surfaces: destination.geometry.filter(shape => ['floor', 'platform'].includes(shape.type)),
      solids: [...destination.geometry.filter(shape => ['floor', 'platform', 'wall', 'door', 'vent'].includes(shape.type)),
        ...(project.kind === 'ship' ? [{ x: 0, y: 0, w: 24, h: destination.bounds.height },
          { x: destination.bounds.width - 24, y: 0, w: 24, h: destination.bounds.height }] : [])],
      hazards: destination.geometry.filter(shape => shape.type === 'hazard') });
    arrivals.push({ linkId: link.id, from: link.from, to: link.to, ...arrival });
    if (!arrival.ok) add('error', 'journey-blocked-arrival',
      `Le sas vers ${destination.roomName} ne dispose pas d'une arrivée libre et supportée.`, link.to.roomId, link.to.cellId);
    if (!link.bidirectional) add('warning', 'journey-one-way',
      'Ce passage est à sens unique. En jeu, il sera refusé s’il rend un objectif restant inaccessible.', roomId, link.from.cellId);
  }
  const ok = !issues.some(issue => issue.severity === 'error');
  return { ...active, schema: 141, kind: 'forge-journey-audit', scope: 'reachable-rooms',
    ok, issues, errors: issues.filter(issue => issue.severity === 'error').map(issue => issue.message),
    warnings: issues.filter(issue => issue.severity === 'warning').map(issue => issue.message),
    reachableRoomIds, roomReports, arrivals, totalObjectiveCount,
    navigation: 'static-arrivals-and-runtime-obstructions',
    progress: 'session-only',
    limits: ['Les sauts ne sont pas simulés.', 'Les corps mobiles sont recontrôlés au moment du passage.'] };
}

export function admittedForgeJourneyV141(input) {
  const project = parseProject(input), audit = inspectForgeJourneyV141(project);
  if (!audit.ok) throw new Error(`Parcours Forge refusé : ${audit.errors.join(' ')}`);
  const room = project.rooms.find(entry => entry.id === project.activeRoomId);
  return { ...project, size: [...room.size], tiles: nativeTiles(room),
    validation: { ok: true, errors: [], warnings: [...audit.warnings], scope: audit.scope } };
}
