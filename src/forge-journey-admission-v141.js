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

function objectiveRouteConflict(project, reachableRoomIds) {
  const paths = new Map(reachableRoomIds.map(id => [id, new Set([id])]));
  for (const id of reachableRoomIds) for (const link of outgoingForgeLinksV141(project, id)) paths.get(id).add(link.to.roomId);
  for (const via of reachableRoomIds) for (const from of reachableRoomIds) if (paths.get(from).has(via)) {
    for (const to of paths.get(via)) paths.get(from).add(to);
  }
  const goalRooms = new Map(project.rooms.flatMap(room => objectives(room).map(cell => [cell.id, room.id])));
  const remoteRewards = new Set();
  for (const room of project.rooms.filter(room => paths.has(room.id))) for (const cell of room.cells) {
    if (!cell.narrative || decorative(cell)) continue;
    const nodes = new Map(cell.narrative.nodes.map(node => [node.id, node]));
    const pending = [cell.narrative.start], seen = new Set();
    for (let i = 0; i < pending.length; i++) {
      if (seen.has(pending[i])) continue;
      seen.add(pending[i]);
      for (const choice of nodes.get(pending[i]).choices) {
        if (choice.rewardObjectiveId && goalRooms.get(choice.rewardObjectiveId) !== room.id) remoteRewards.add(choice.rewardObjectiveId);
        if (choice.next !== null) pending.push(choice.next);
      }
    }
  }
  // Remote narrative rewards can replace a physical visit. Their conditions
  // stay with the runtime; unlinked draft pages cannot grant a reward.
  const required = project.rooms.filter(room => paths.has(room.id)
    && objectives(room).some(cell => !remoteRewards.has(cell.id)));
  // Required rooms must be comparable in the directed graph. Cycles and
  // ordered one-way routes work; incomparable branches cannot both be visited.
  for (let i = 0; i < required.length; i++) for (let j = i + 1; j < required.length; j++) {
    if (!paths.get(required[i].id).has(required[j].id) && !paths.get(required[j].id).has(required[i].id)) return [required[i], required[j]];
  }
  return null;
}

function arrivalGridVolume(room, bounds, arrivals) {
  // Same sealed-volume test as the authoring model, seeded by supported
  // native arrivals instead of the unused insertion. This is not pathfinding.
  const solid = new Set(room.cells.filter(cell => !decorative(cell)
    && ['floor', 'platform', 'wall', 'lift'].includes(cell.type)).map(cell => `${cell.x}:${cell.y}`));
  const queue = [], seen = new Set();
  const visit = (x, y) => {
    const key = `${x}:${y}`;
    if (x < 0 || y < 0 || x >= room.size[0] || y >= room.size[1] || solid.has(key) || seen.has(key)) return;
    seen.add(key); queue.push([x, y]);
  };
  for (const arrival of arrivals) visit(
    Math.floor((arrival.x + bounds.actorWidth / 2) * room.size[0] / bounds.width),
    Math.floor((arrival.y + bounds.actorHeight / 2) * room.size[1] / bounds.height));
  for (let i = 0; i < queue.length; i++) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    visit(queue[i][0] + dx, queue[i][1] + dy);
  }
  return seen;
}

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
      if (!entry && (issue.code.startsWith('native-spawn-')
        || ['unsupported', 'unsafe-spawn'].includes(issue.code)
          && room.cells.some(cell => cell.id === issue.cellId && cell.type === 'spawn'))) return [{ ...issue, severity: 'warning' }];
      return [{ ...issue }];
    });
    const geometry = [...report.geometry];
    if (project.kind === 'ship') {
      const compiled = compileShipProject({ schema: 2, kind: 'ship', size: room.size, tiles: nativeTiles(room) });
      const cells = room.cells.filter(cell => cell.type === 'vent' && !decorative(cell));
      if (!geometry.some(shape => shape.type === 'vent')) geometry.push(...compiled.vents.map((vent, index) => ({ ...vent, type: 'vent',
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
  const conflict = objectiveRouteConflict(project, reachableRoomIds);
  if (conflict) add('error', 'journey-objective-route-conflict',
    `Les objectifs de ${conflict[0].name} et ${conflict[1].name} imposent des branches incompatibles : ajoutez un passage entre ces salles ou un retour.`,
    conflict[1].id, objectives(conflict[1])[0].id);
  for (const room of project.rooms.filter(room => !reached.has(room.id))) {
    add('warning', 'journey-unreachable-room',
      `${room.name} ne sera pas chargée : aucun passage ne la relie au départ.`, room.id);
  }
  const reports = new Map(roomReports.map(report => [report.roomId, report]));
  const arrivals = [], volumeStarts = new Map();
  for (const roomId of reachableRoomIds) for (const link of outgoingForgeLinksV141(project, roomId)) {
    const destination = reports.get(link.to.roomId);
    const door = destination.geometry.find(shape => shape.cellId === link.to.cellId && shape.type === 'door');
    const options = { door,
      actor: { w: destination.bounds.actorWidth, h: destination.bounds.actorHeight, facing: 1 },
      bounds: destination.bounds,
      surfaces: destination.geometry.filter(shape => ['floor', 'platform'].includes(shape.type)),
      // Mission vents provide PNJ placement volumes, not arrival colliders.
      // Ship vents are actual native traversal obstacles and remain solid.
      solids: [...destination.geometry.filter(shape => ['floor', 'platform', 'wall', 'door'].includes(shape.type)
        || shape.type === 'vent' && project.kind === 'ship'),
        ...(project.kind === 'ship' ? [{ x: 0, y: 0, w: 24, h: destination.bounds.height },
          { x: destination.bounds.width - 24, y: 0, w: 24, h: destination.bounds.height }] : [])],
      hazards: destination.geometry.filter(shape => shape.type === 'hazard'),
      occupied: destination.geometry.filter(shape => shape.type === 'npc') };
    const arrival = findForgeArrivalV141(options);
    arrivals.push({ linkId: link.id, from: link.from, to: link.to, ...arrival });
    if (arrival.ok && link.to.roomId !== project.activeRoomId
      && destination.issues.some(issue => issue.code === 'sealed-objective')) {
      if (!volumeStarts.has(link.to.roomId)) volumeStarts.set(link.to.roomId, []);
      const opposite = findForgeArrivalV141({ ...options, actor: { ...options.actor, facing: -1 } });
      volumeStarts.get(link.to.roomId).push(arrival, ...(opposite.ok ? [opposite] : []));
    }
    if (!arrival.ok) add('error', 'journey-blocked-arrival',
      `Le sas vers ${destination.roomName} ne dispose pas d'une arrivée libre et supportée.`, link.to.roomId, link.to.cellId);
    if (!link.bidirectional) add('warning', 'journey-one-way',
      'Ce passage est à sens unique. En jeu, il sera refusé s’il rend un objectif restant inaccessible.', roomId, link.from.cellId);
  }
  for (const [roomId, starts] of volumeStarts) {
    const report = reports.get(roomId), room = project.rooms.find(room => room.id === roomId);
    const connected = arrivalGridVolume(room, report.bounds, starts);
    for (const issue of report.issues) if (issue.code === 'sealed-objective' && connected.has(`${issue.x}:${issue.y}`)) issue.severity = 'warning';
    report.ok = !report.issues.some(issue => issue.severity === 'error');
    report.errors = report.issues.filter(issue => issue.severity === 'error').map(issue => issue.message);
    report.warnings = report.issues.filter(issue => issue.severity === 'warning').map(issue => issue.message);
  }
  const ok = !issues.some(issue => issue.severity === 'error');
  return { ...active, schema: 141, kind: 'forge-journey-audit', scope: 'reachable-rooms',
    ok, issues, errors: issues.filter(issue => issue.severity === 'error').map(issue => issue.message),
    warnings: issues.filter(issue => issue.severity === 'warning').map(issue => issue.message),
    reachableRoomIds, roomReports, arrivals, totalObjectiveCount,
    navigation: 'static-arrivals-and-runtime-obstructions',
    progress: 'session-only',
    limits: ['Les sauts ne sont pas simulés.', 'Les conditions des récompenses narratives ne sont pas simulées.',
      'Les corps mobiles sont recontrôlés au moment du passage.'] };
}

export function admittedForgeJourneyV141(input) {
  const project = parseProject(input), audit = inspectForgeJourneyV141(project);
  if (!audit.ok) throw new Error(`Parcours Forge refusé : ${audit.errors.join(' ')}`);
  const room = project.rooms.find(entry => entry.id === project.activeRoomId);
  return { ...project, size: [...room.size], tiles: nativeTiles(room),
    validation: { ok: true, errors: [], warnings: [...audit.warnings], scope: audit.scope } };
}
