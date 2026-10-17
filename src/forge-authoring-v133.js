import { remapForgeNarrativeObjectivesV156 } from './forge-narrative-v156.js';
/** Authoring operations only. No runtime compilation or campaign writes. */
import { ForgeModel, parseProject, clone, keyOf, LAYERS, TILE_TYPES, decorative } from './forge-model-v130.js';

export const ASSEMBLY_LIMITS_V133 = Object.freeze({ entries: 64, cells: 1024, totalCells: 8192, bytes: 2 * 1024 * 1024 });
export const ASSEMBLY_KEY_V133 = 'atf-forge-assemblies-v133';
const reject = message => { throw new Error(message); };
const integer = (n, min, max) => Number.isInteger(n) && n >= min && n <= max;
const title = value => typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 80) : '';
const uniqueId = (prefix, ids) => { let n = 1; while (ids.has(`${prefix}-${n}`)) n++; return `${prefix}-${n}`; };
export function selectionBoundsV133(cells) {
  if (!cells.length) return null;
  let x = Infinity, y = Infinity, right = 0, bottom = 0;
  for (const cell of cells) { x = Math.min(x, cell.x); y = Math.min(y, cell.y); right = Math.max(right, cell.x + 1); bottom = Math.max(bottom, cell.y + 1); }
  return { x, y, w: right - x, h: bottom - y };
}
export function normalizeAssemblyV133(input) {
  if (!input || typeof input !== 'object' || !Array.isArray(input.cells) || !input.cells.length || input.cells.length > ASSEMBLY_LIMITS_V133.cells) reject('Assemblage : 1 à 1 024 blocs requis.');
  if (!title(input.name)) reject('Donnez un nom à cet assemblage.');
  const bounds = selectionBoundsV133(input.cells);
  if (![bounds.x, bounds.y, bounds.w, bounds.h].every(Number.isInteger) || bounds.x < 0 || bounds.y < 0 || bounds.w > 128 || bounds.h > 72) reject('Dimensions d’assemblage invalides.');
  const cells = input.cells.map((cell, index) => ({ ...clone(cell), id: `cell-${index + 1}`, x: cell.x - bounds.x, y: cell.y - bounds.y, locked: false }));
  const mapping = new Map(input.cells.map((cell, index) => [cell.id, cells[index].id]));
  remapForgeNarrativeObjectivesV156(cells, mapping);
  const model = parseProject({ schema: 3, kind: 'mission', name: 'Assemblage', activeRoomId: 'room-1', links: [], rooms: [{ id: 'room-1', name: 'Assemblage', size: [Math.max(8, bounds.w), Math.max(8, bounds.h)], cells }] });
  return { id: typeof input.id === 'string' && /^[a-z0-9][a-z0-9_-]{0,79}$/.test(input.id) ? input.id : 'assembly', name: title(input.name), cells: model.rooms[0].cells, size: [bounds.w, bounds.h] };
}
export function captureAssemblyV133(model, ids, name) {
  const selected = new Set(ids);
  return normalizeAssemblyV133({ name, cells: model.room.cells.filter(cell => selected.has(cell.id)) });
}
export function transformAssemblyV133(input, { turns = 0, flipX = false } = {}) {
  const result = normalizeAssemblyV133(input);
  if (!integer(turns, 0, 3)) reject('Rotation invalide.');
  let [w, h] = result.size;
  if (flipX) result.cells = result.cells.map(c => ({ ...c, x: w - 1 - c.x }));
  for (let n = 0; n < turns; n++) { result.cells = result.cells.map(c => ({ ...c, x: h - 1 - c.y, y: c.x })); [w, h] = [h, w]; }
  // Rotation changes cell positions, never the visual orientation of actors/doors.
  return normalizeAssemblyV133(result);
}
export function placementPreviewV133(model, input, x, y, { locked = new Set(), visible = new Set(LAYERS) } = {}) {
  const assembly = normalizeAssemblyV133(input);
  if (![x, y].every(Number.isInteger)) reject('Choisissez une case de pose.');
  const occupied = new Set(model.room.cells.map(keyOf)), physical = new Set(model.room.cells.filter(c => !decorative(c)).map(c => `${c.x}:${c.y}`));
  const staged = new Set();
  const cells = assembly.cells.map(source => {
    const cell = { ...source, x: source.x + x, y: source.y + y };
    const reason = !integer(cell.x, 0, model.room.size[0] - 1) || !integer(cell.y, 0, model.room.size[1] - 1) ? 'hors limites'
      : locked.has(cell.layer) || !visible.has(cell.layer) ? 'calque masqué ou verrouillé'
        : occupied.has(keyOf(cell)) ? 'case occupée'
          : !decorative(cell) && (physical.has(`${cell.x}:${cell.y}`) || staged.has(`${cell.x}:${cell.y}`)) ? 'chevauchement physique' : '';
    if (!decorative(cell)) staged.add(`${cell.x}:${cell.y}`);
    return { cell, reason };
  });
  return { ok: cells.every(entry => !entry.reason), cells, errors: [...new Set(cells.map(entry => entry.reason).filter(Boolean))] };
}
export function stampAssemblyV133(model, input, x, y, options = {}) {
  const preview = placementPreviewV133(model, input, x, y, options);
  if (!preview.ok) reject(`Pose refusée : ${preview.errors.join(', ')}.`);
  let ids;
  model.transaction('Poser un assemblage', () => { ids = model.paste({ cells: preview.cells.map(({ cell }) => ({ ...cell, x: cell.x - x, y: cell.y - y })) }, x, y); });
  return ids;
}
/** Transform the selected cells as one atomic command, preserving linked door IDs. */
export function editSelectionV133(model, ids, command, value, { locked = new Set(), visible = new Set(LAYERS) } = {}) {
  const selected = new Set(ids), cells = model.room.cells.filter(cell => selected.has(cell.id));
  if (!cells.length) reject('Sélectionnez au moins un bloc.');
  if (cells.some(c => locked.has(c.layer) || !visible.has(c.layer))) reject('Un calque sélectionné est masqué ou verrouillé.');
  if (command !== 'unlock' && cells.some(c => c.locked)) reject('Déverrouillez les blocs sélectionnés.');
  const bounds = selectionBoundsV133(cells);
  return model.transaction(`Sélection : ${command}`, () => {
    if (command === 'lock' || command === 'unlock') { for (const c of cells) c.locked = command === 'lock'; return; }
    if (command === 'layer') {
      if (!LAYERS.includes(value) || locked.has(value) || !visible.has(value)) reject('Calque de destination indisponible.');
      if (['background', 'foreground'].includes(value) && cells.some(c => model.data.links.some(l => l.from.cellId === c.id || l.to.cellId === c.id))) reject('Déliez le sas avant de le convertir en décor.');
      model.transform(ids, () => ({ layer: value }));
    } else if (command === 'type') {
      if (!TILE_TYPES.includes(value)) reject('Type inconnu.');
      const linked = cells.filter(c => c.type === 'door' && value !== 'door').map(c => c.id);
      if (linked.some(id => model.data.links.some(l => l.from.cellId === id || l.to.cellId === id))) reject('Déliez les sas avant de remplacer leur type.');
      for (const c of cells) c.type = value;
    } else if (command === 'rotate') model.transform(ids, c => ({ x: bounds.x + bounds.h - 1 - (c.y - bounds.y), y: bounds.y + c.x - bounds.x }));
    else if (command === 'array') {
      if (!integer(value?.count, 1, 12) || !integer(value.dx, -128, 128) || !integer(value.dy, -72, 72) || !(value.dx || value.dy)) reject('Répétition : 1–12 copies, avec un décalage non nul.');
      const clip = model.copy(ids);
      for (let n = 1; n <= value.count; n++) model.paste(clip, bounds.x + value.dx * n, bounds.y + value.dy * n);
    } else reject('Commande inconnue.');
    // Physical overlaps are not meaningful in the current native contract. Decorative layers may overlap.
    const positions = new Set();
    for (const c of model.room.cells.filter(c => !decorative(c))) { const k = `${c.x}:${c.y}`; if (positions.has(k)) reject('Deux blocs physiques partageraient la même case.'); positions.add(k); }
  });
}
export function roomGraphV133(project) {
  const seen = new Set([project.activeRoomId]), queue = [project.activeRoomId];
  for (let i = 0; i < queue.length; i++) for (const link of project.links) {
    const next = link.from.roomId === queue[i] ? link.to.roomId : link.bidirectional && link.to.roomId === queue[i] ? link.from.roomId : null;
    if (next && !seen.has(next)) { seen.add(next); queue.push(next); }
  }
  return project.rooms.map(room => ({ id: room.id, name: room.name, active: room.id === project.activeRoomId, reachable: seen.has(room.id), blocks: room.cells.length,
    doors: room.cells.filter(c => c.type === 'door' && !decorative(c)).map(cell => ({ id: cell.id, label: cell.label || `${cell.x}, ${cell.y}`, linked: project.links.some(l => l.from.cellId === cell.id || l.to.cellId === cell.id) })),
    exits: project.links.flatMap(link => link.from.roomId === room.id ? [{ id: link.id, to: link.to.roomId, both: link.bidirectional }] : link.bidirectional && link.to.roomId === room.id ? [{ id: link.id, to: link.from.roomId, both: true }] : []) }));
}
const builtin = (id, name, build) => { const m = new ForgeModel(); m.transaction(name, () => build((x, y, type, layer) => m.paint(x, y, type, layer || (['floor','platform','wall','ladder','lift','vent'].includes(type) ? 'structure' : 'gameplay')))); return { ...captureAssemblyV133(m, m.room.cells.map(c => c.id), name), id: `builtin-${id}`, builtin: true }; };
export const BUILTIN_ASSEMBLIES_V133 = Object.freeze([
  builtin('corridor', 'Coursive · 8 dalles', put => { for(let x=0;x<8;x++)put(x,4,'floor'); }),
  builtin('airlock', 'Sas encadré', put => { for(let x=0;x<5;x++)put(x,4,'floor'); put(2,3,'door'); put(1,3,'wall'); put(3,3,'wall'); }),
  builtin('terminal', 'Poste de contrôle', put => { for(let x=0;x<5;x++)put(x,3,'floor'); put(2,2,'terminal'); }),
  builtin('catwalk', 'Passerelle suspendue', put => { for(let x=0;x<8;x++)put(x,4,'platform'); for(let y=0;y<4;y++)put(0,y,'wall','background'); }),
  builtin('ladder', 'Accès de maintenance', put => { for(let y=0;y<5;y++)put(2,y,'ladder'); for(let x=0;x<6;x++)put(x,5,'floor'); for(let x=3;x<6;x++)put(x,1,'platform'); }),
  builtin('objective', 'Poste de mission', put => { for(let x=0;x<7;x++)put(x,3,'floor'); put(2,2,'terminal'); put(5,2,'objective'); }),
  builtin('vents', 'Conduits appariés', put => { for(let x=0;x<8;x++)put(x,4,'floor'); put(1,3,'vent'); put(6,3,'vent'); }),
  builtin('encounter', 'Rencontre · deux menaces', put => { for(let x=0;x<8;x++)put(x,3,'floor'); put(2,2,'enemy'); put(5,2,'enemy'); }),
  builtin('insertion', 'Insertion sécurisée', put => { for(let x=0;x<5;x++)put(x,4,'floor'); put(2,3,'spawn'); }),
  builtin('balcony', 'Balcon technique', put => { for(let x=0;x<6;x++)put(x,3,'platform'); put(0,2,'wall'); put(5,2,'wall'); })
]);
export function parseAssemblyLibraryV133(raw) {
  if (typeof raw === 'string') { if (new TextEncoder().encode(raw).length > ASSEMBLY_LIMITS_V133.bytes) reject('Bibliothèque trop volumineuse (2 Mio).'); raw = JSON.parse(raw); }
  if (raw?.schema !== 1 || !Array.isArray(raw.entries) || raw.entries.length > ASSEMBLY_LIMITS_V133.entries) reject('Bibliothèque d’assemblages invalide.');
  const ids = new Set(); let total = 0;
  const entries = raw.entries.map(input => { const entry = normalizeAssemblyV133(input); if (entry.id.startsWith('builtin-') || ids.has(entry.id)) reject('Identifiant d’assemblage dupliqué ou réservé.'); ids.add(entry.id); total += entry.cells.length; return entry; });
  if (total > ASSEMBLY_LIMITS_V133.totalCells) reject('Budget de bibliothèque dépassé (8 192 blocs).');
  const result = { schema: 1, entries };
  if (new TextEncoder().encode(JSON.stringify(result)).length > ASSEMBLY_LIMITS_V133.bytes) reject('Bibliothèque trop volumineuse (2 Mio).');
  return result;
}
export class ForgeAssemblyLibraryV133 {
  constructor(storage) { this.storage = storage; this.data = { schema: 1, entries: [] }; this.raw = null; this.error = ''; this.protected = false; this.persisted = false; this.revision = 0; }
  load() {
    try { this.raw = this.storage?.getItem(ASSEMBLY_KEY_V133) ?? null; if(this.raw !== null) this.data = parseAssemblyLibraryV133(this.raw); this.persisted = Boolean(this.storage); }
    catch(error) { this.error = error.message; this.protected = true; }
    return this.data;
  }
  write(candidate) {
    const parsed = parseAssemblyLibraryV133(candidate);
    if(!this.storage?.getItem || !this.storage?.setItem) reject('Stockage indisponible. Exportez la sélection comme plan.');
    if(this.protected) reject('Bibliothèque protégée. Exportez les données originales avant toute récupération.');
    if (this.storage?.getItem(ASSEMBLY_KEY_V133) !== this.raw) reject('Bibliothèque modifiée dans un autre onglet. Exportez puis rechargez.');
    const raw = JSON.stringify(parsed);
    try { if(!this.storage?.setItem) reject('Stockage indisponible.'); this.storage.setItem(ASSEMBLY_KEY_V133, raw); }
    catch(error) { this.persisted = false; this.error = error.message; throw error; }
    this.raw = raw; this.data = parsed; this.persisted = true; this.error = ''; this.revision++; return this.data;
  }
  add(input) { const entry = normalizeAssemblyV133(input); entry.id = uniqueId('assembly', new Set(this.data.entries.map(e => e.id))); this.write({ schema: 1, entries: [...this.data.entries, entry] }); return entry; }
  remove(id) { if (!this.data.entries.some(e => e.id === id)) return false; this.write({schema:1,entries:this.data.entries.filter(e=>e.id!==id)}); return true; }
  merge(raw) { const input = parseAssemblyLibraryV133(raw), ids = new Set(this.data.entries.map(e => e.id)); const entries = input.entries.map(entry => { const id = uniqueId('assembly', ids); ids.add(id); return { ...entry, id }; }); this.write({schema:1,entries:[...this.data.entries,...entries]}); return entries.length; }
  export() { return JSON.stringify(this.data, null, 2); }
}
