/** Pure authoring operations: no executable project data and no native runtime changes. */
import { LAYERS, TILE_TYPES, LABELS, decorative, keyOf, clone } from './forge-model-v130.js';
import { selectionBoundsV133 } from './forge-authoring-v133.js';

const fail = message => { throw new Error(message); };
const stable = (a, b) => a.y - b.y || a.x - b.x || LAYERS.indexOf(a.layer) - LAYERS.indexOf(b.layer) || a.id.localeCompare(b.id);
const normalized = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr');
export const ARRANGEMENTS_V134 = Object.freeze({
  left: 'Aligner à gauche', centerX: 'Centrer horizontalement', right: 'Aligner à droite',
  top: 'Aligner en haut', centerY: 'Centrer verticalement', bottom: 'Aligner en bas',
  distributeX: 'Espacer horizontalement', distributeY: 'Espacer verticalement', snap: 'Aligner sur le pas'
});

/** Connected islands include stacked layers and orthogonal neighbours, never diagonal contact. */
export function selectionGroupsV134(cells, grouping = 'islands') {
  if (!['islands', 'cells'].includes(grouping)) fail('Mode de regroupement inconnu.');
  const sorted = [...cells].sort(stable);
  if (grouping === 'cells') return sorted.map(cell => ({ cells: [cell], bounds: selectionBoundsV133([cell]) }));
  const positions = new Map();
  for (const cell of sorted) {
    const key = `${cell.x}:${cell.y}`;
    if (!positions.has(key)) positions.set(key, []);
    positions.get(key).push(cell);
  }
  const visited = new Set(), groups = [];
  for (const cell of sorted) {
    const origin = `${cell.x}:${cell.y}`;
    if (visited.has(origin)) continue;
    const queue = [[cell.x, cell.y]], members = []; visited.add(origin);
    for (let i = 0; i < queue.length; i++) {
      const [x, y] = queue[i]; members.push(...positions.get(`${x}:${y}`));
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const key = `${x + dx}:${y + dy}`;
        if (visited.has(key) || !positions.has(key)) continue;
        visited.add(key); queue.push([x + dx, y + dy]);
      }
    }
    groups.push({ cells: members, bounds: selectionBoundsV133(members) });
  }
  return groups;
}

/** Preview only. Apply revalidates the exact model revision to avoid stale placements. */
export function planArrangementV134(model, ids, command, options = {}) {
  const { grouping = 'islands', reference = 'selection', step = 2,
    locked = new Set(), visible = new Set(LAYERS) } = options;
  if (!Object.hasOwn(ARRANGEMENTS_V134, command)) fail('Commande de disposition inconnue.');
  if (!['selection', 'room'].includes(reference)) fail('Cadre de référence inconnu.');
  const wanted = new Set(ids), cells = model.room.cells.filter(c => wanted.has(c.id));
  const originalById = new Map(cells.map(c => [c.id, c]));
  if (!cells.length || cells.length !== wanted.size) fail('Sélection vide ou devenue obsolète.');
  if (cells.some(c => c.locked || locked.has(c.layer) || !visible.has(c.layer))) fail('La sélection contient un bloc ou un calque verrouillé/masqué.');
  if (!Number.isInteger(step) || step < 1 || step > 16) fail('Le pas doit être compris entre 1 et 16 cases.');
  const groups = selectionGroupsV134(cells, grouping), selection = selectionBoundsV133(cells);
  const frame = reference === 'room' ? { x: 0, y: 0, w: model.room.size[0], h: model.room.size[1] } : selection;
  const targets = new Map(groups.map(g => [g, { x: g.bounds.x, y: g.bounds.y }]));
  if (command.startsWith('distribute')) {
    if (groups.length < 3) fail('Sélectionnez au moins trois groupes distincts pour les espacer.');
    const axis = command === 'distributeX' ? 'x' : 'y', dimension = axis === 'x' ? 'w' : 'h';
    const ordered = [...groups].sort((a, b) => a.bounds[axis] - b.bounds[axis] || stable(a.cells[0], b.cells[0]));
    const used = ordered.reduce((sum, g) => sum + g.bounds[dimension], 0);
    const gap = (frame[dimension] - used) / (ordered.length - 1);
    if (gap < 0) fail('Le cadre est trop petit pour espacer les groupes sans recouvrement.');
    let offset = frame[axis];
    for (const group of ordered) { targets.get(group)[axis] = Math.round(offset); offset += group.bounds[dimension] + gap; }
  } else {
    for (const group of groups) {
      const b = group.bounds, target = targets.get(group);
      if (command === 'left') target.x = frame.x;
      if (command === 'right') target.x = frame.x + frame.w - b.w;
      if (command === 'centerX') target.x = Math.round(frame.x + (frame.w - b.w) / 2);
      if (command === 'top') target.y = frame.y;
      if (command === 'bottom') target.y = frame.y + frame.h - b.h;
      if (command === 'centerY') target.y = Math.round(frame.y + (frame.h - b.h) / 2);
      if (command === 'snap') { target.x = Math.round(b.x / step) * step; target.y = Math.round(b.y / step) * step; }
    }
  }
  const moves = groups.flatMap(g => g.cells.map(c => ({ ...clone(c), x: c.x + targets.get(g).x - g.bounds.x, y: c.y + targets.get(g).y - g.bounds.y })));
  const other = model.room.cells.filter(c => !wanted.has(c.id));
  const occupied = new Set(other.map(keyOf));
  const physical = new Set(other.filter(c => !decorative(c)).map(c => `${c.x}:${c.y}`));
  const errors = [], add = (code, cell) => errors.push({ code, cellId: cell.id, x: cell.x, y: cell.y });
  for (const cell of moves) {
    if (cell.x < 0 || cell.y < 0 || cell.x >= model.room.size[0] || cell.y >= model.room.size[1]) add('hors limites', cell);
    const key = keyOf(cell), position = `${cell.x}:${cell.y}`;
    if (occupied.has(key)) add('case occupée', cell);
    if (!decorative(cell) && physical.has(position)) add('chevauchement physique', cell);
    occupied.add(key); if (!decorative(cell)) physical.add(position);
  }
  return { ok: !errors.length, command, groups: groups.length, moves, errors, changed: moves.some(c => {
    const original = originalById.get(c.id); return original.x !== c.x || original.y !== c.y;
  }), roomId: model.room.id, revision: model.revision, source: model.data, model,
    ids: [...wanted], options: { grouping, reference, step } };
}

export function applyArrangementV134(model, plan, access = {}) {
  if (!plan || plan.model !== model || plan.source !== model.data || plan.revision !== model.revision || plan.roomId !== model.room.id || model.pending)
    fail('Aperçu obsolète : recalculez la disposition avant de l’appliquer.');
  const checked = planArrangementV134(model, plan.ids, plan.command, { ...plan.options, ...access });
  if (!checked.ok) fail(`Disposition refusée : ${[...new Set(checked.errors.map(e => e.code))].join(', ')}.`);
  const targets = new Map(checked.moves.map(c => [c.id, c]));
  return model.transaction(ARRANGEMENTS_V134[plan.command], () => model.transform(plan.ids, c => ({ x: targets.get(c.id).x, y: targets.get(c.id).y })));
}

/** Search returns a bounded page; the complete hit count is kept separately. */
function matchingCells(project, { query = '', roomId = '', type = '', layer = '', state = '' } = {}) {
  if (type && !TILE_TYPES.includes(type)) fail('Filtre de type inconnu.');
  if (layer && !LAYERS.includes(layer)) fail('Filtre de calque inconnu.');
  if (!['', 'locked', 'unlocked', 'unlinked'].includes(state)) fail('Filtre d’état inconnu.');
  if (roomId && !project.rooms.some(r => r.id === roomId)) fail('Salle du filtre introuvable.');
  const words = normalized(query).trim().split(/\s+/).filter(Boolean);
  const linked = new Set(project.links.flatMap(l => [l.from.cellId, l.to.cellId]));
  const hits = [];
  for (const room of project.rooms) {
    if (roomId && room.id !== roomId) continue;
    for (const cell of room.cells) {
      if (type && cell.type !== type || layer && cell.layer !== layer || state === 'locked' && !cell.locked || state === 'unlocked' && cell.locked) continue;
      if (state === 'unlinked' && (cell.type !== 'door' || decorative(cell) || linked.has(cell.id))) continue;
      const search = normalized(`${room.name} ${room.id} ${cell.label} ${cell.id} ${cell.type} ${LABELS[cell.type]}`);
      if (!words.every(word => search.includes(word))) continue;
      hits.push({ ...clone(cell), roomId: room.id, roomName: room.name, linked: linked.has(cell.id) });
    }
  }
  return hits;
}
export function exploreForgeV134(project, options = {}) {
  const { page = 0, pageSize = 50 } = options;
  if (!Number.isInteger(page) || page < 0 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) fail('Pagination invalide.');
  const hits = matchingCells(project, options);
  const pages = Math.max(1, Math.ceil(hits.length / pageSize)), actualPage = Math.min(page, pages - 1);
  return { total: hits.length, pages, page: actualPage, pageSize, items: hits.slice(actualPage * pageSize, (actualPage + 1) * pageSize) };
}

export function forgeSearchReportV134(project, filters = {}) {
  const items = matchingCells(project, filters);
  return { schema: 1, kind: 'forge-search-report', project: project.name, total: items.length, items };
}

/** Labels only: keeps stable IDs, room topology and native roles unchanged. */
export function labelForgeCellsV134(model, ids, prefix, start = 1, access = {}) {
  const name = typeof prefix === 'string' ? prefix.replace(/[\u0000-\u001f\u007f]/g, '').trim() : '';
  if (!name || name.length > 100) fail('Le préfixe doit contenir entre 1 et 100 caractères.');
  if (!Number.isInteger(start) || start < 0 || start > 999999) fail('Numéro de départ invalide.');
  const selected = new Set(ids), cells = model.data.rooms.flatMap(r => [...r.cells].sort(stable)).filter(c => selected.has(c.id));
  if (!cells.length || cells.length !== selected.size) fail('Sélection vide ou obsolète.');
  if (cells.some(c => c.locked || access.locked?.has(c.layer) || access.visible && !access.visible.has(c.layer))) fail('Un bloc ciblé est verrouillé ou masqué.');
  return model.transaction('Numéroter les repères', () => cells.forEach((cell, i) => { cell.label = `${name} ${String(start + i).padStart(3, '0')}`; }));
}

/** Logical BFS layout. Not geographical coordinates and not a physics reachability proof. */
export function diagramForgeV134(project) {
  const distance = new Map([[project.activeRoomId, 0]]), queue = [project.activeRoomId], adjacency = new Map();
  for (const r of project.rooms) adjacency.set(r.id, []);
  for (const link of project.links) {
    adjacency.get(link.from.roomId).push(link.to.roomId);
    if (link.bidirectional) adjacency.get(link.to.roomId).push(link.from.roomId);
  }
  for (let i = 0; i < queue.length; i++) for (const target of adjacency.get(queue[i])) {
    if (!distance.has(target)) { distance.set(target, distance.get(queue[i]) + 1); queue.push(target); }
  }
  const unreachableColumn = Math.max(0, ...distance.values()) + 1, rows = new Map();
  const nodes = project.rooms.map(room => {
    const column = distance.get(room.id) ?? unreachableColumn, row = rows.get(column) || 0; rows.set(column, row + 1);
    return { id: room.id, name: room.name, x: 24 + column * 256, y: 24 + row * 128, w: 208, h: 84,
      active: room.id === project.activeRoomId, reachable: distance.has(room.id), blocks: room.cells.length };
  });
  const byId = new Map(nodes.map(n => [n.id, n]));
  const edges = project.links.slice(0, 160).map(link => {
    const from = byId.get(link.from.roomId), to = byId.get(link.to.roomId);
    const sameColumn = from.x === to.x;
    const x1 = from.x + from.w + 5, y1 = from.y + from.h / 2;
    const x2 = sameColumn ? to.x + to.w + 5 : to.x - 7, y2 = to.y + to.h / 2;
    const bend = sameColumn ? x1 + 22 : (x1 + x2) / 2;
    return { id: link.id, from: link.from.roomId, to: link.to.roomId, both: link.bidirectional, d: `M ${x1} ${y1} C ${bend} ${y1}, ${bend} ${y2}, ${x2} ${y2}` };
  });
  return { nodes, edges, omittedEdges: project.links.length - edges.length,
    width: Math.max(280, ...nodes.map(n => n.x + n.w + 40)), height: Math.max(140, ...nodes.map(n => n.y + n.h + 24)) };
}
