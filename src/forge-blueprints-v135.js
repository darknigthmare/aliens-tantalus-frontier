/** Deterministic authoring recipes. Produces schema-3 blocks, never executable data or native levels. */
import { LAYERS, DEFAULT_LAYER, decorative, keyOf, clone, parseProject, LIMITS } from './forge-model-v130.js';

export const BLUEPRINTS_V135 = Object.freeze({
  corridor: Object.freeze({ name: 'Coursive technique', terminals: 1, prop: 'Panneau de maintenance', note: 'Circulation basse continue ; les passerelles restent optionnelles.' }),
  reception: Object.freeze({ name: 'Réception de transit', terminals: 1, prop: 'Comptoir de réception', note: 'Insertion et sortie séparées du poste de contrôle.' }),
  laboratory: Object.freeze({ name: 'Laboratoire de confinement', terminals: 2, prop: 'Paillasse de laboratoire', note: 'Deux postes de contrôle ; les paillasses sont des repères décoratifs.' }),
  quarters: Object.freeze({ name: 'Quartiers de relève', terminals: 1, prop: 'Casier de relève', note: 'Casiers sur le plan de fond, sans bloquer la circulation.' }),
  hangar: Object.freeze({ name: 'Hangar logistique', terminals: 1, prop: 'Caisses logistiques', note: 'Emplacement véhicule optionnel en Mission ; aucun véhicule ajouté en Vaisseau.' }),
  reactor: Object.freeze({ name: 'Salle des machines', terminals: 2, prop: 'Conduite technique', note: 'Postes de commande et structures ; aucun réacteur fonctionnel n’est inventé.' }),
  maintenance: Object.freeze({ name: 'Maintenance et conduits', terminals: 1, prop: 'Conduite de service', note: 'Deux conduits avec support, à relier selon le comportement du moteur installé.' }),
  shaft: Object.freeze({ name: 'Puits et passerelles', terminals: 1, prop: 'Renfort de passerelle', note: 'Accès verticaux par échelles continues. Les étages ne sont pas des salles séparées.' })
});
export const BLUEPRINT_SHAPES_V135 = Object.freeze({ rectangle: 'Rectangulaire', leftWing: 'Aile haute en L', twinWings: 'Deux ailes hautes', stepped: 'Plafond en gradins' });
const fail = message => { throw new Error(message); };
const integer = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;
const text = value => typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g, '').trim() : '';
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);

export function normalizeBlueprintV135(input = {}) {
  if (!record(input)) fail('Paramètres de construction invalides.');
  const p = { schema: 1, profile: input.profile ?? 'corridor', shape: input.shape ?? 'rectangle',
    width: input.width ?? 32, height: input.height ?? 18, levels: input.levels ?? 1,
    seed: input.seed ?? 426, density: input.density ?? 2, entry: input.entry ?? 'left',
    threats: input.threats ?? 0, vehicle: input.vehicle ?? false, name: text(input.name) };
  if (input.schema !== undefined && input.schema !== 1) fail('Version de recette inconnue.');
  if (!Object.hasOwn(BLUEPRINTS_V135, p.profile) || !Object.hasOwn(BLUEPRINT_SHAPES_V135, p.shape)) fail('Programme ou silhouette inconnu.');
  if (!integer(p.width, 16, 64) || !integer(p.height, 12, 36)) fail('Construction : 16–64 colonnes et 12–36 lignes.');
  if (!integer(p.levels, 1, 3) || !integer(p.seed, 0, 999999) || !integer(p.density, 0, 3) || !integer(p.threats, 0, 6)) fail('Étages, variante ou densité hors limites.');
  if (!['left', 'right'].includes(p.entry) || typeof p.vehicle !== 'boolean') fail('Entrée ou option véhicule invalide.');
  if (p.vehicle && p.profile !== 'hangar') fail('L’emplacement véhicule est réservé au programme Hangar.');
  if (p.name.length > 100) fail('Nom de salle trop long (100 caractères).');
  if (!p.name) p.name = BLUEPRINTS_V135[p.profile].name;
  return p;
}
function randomSource(seed) { let state = seed >>> 0; return () => { state = (Math.imul(1664525, state) + 1013904223) >>> 0; return state / 4294967296; }; }
const surface = cell => cell && ['floor', 'platform', 'lift'].includes(cell.type);

/** Conservative grid-headroom report. Not collision simulation or proof of traversable jumps. */
export function inspectBlueprintV135(room, kind = 'mission') {
  const physical = room.cells.filter(c => !decorative(c)), map = new Map(), issues = [];
  const add = (code, message, cell, severity = 'error') => issues.push({ code, message, cellId: cell?.id ?? null, severity });
  for (const cell of physical) { const key = `${cell.x}:${cell.y}`; if (map.has(key)) add('overlap', 'Deux blocs physiques partagent une case.', cell); map.set(key, cell); }
  const height = kind === 'ship' ? 720 : 1080, headCells = Math.ceil(92 / (height / room.size[1]));
  for (const cell of physical.filter(c => ['spawn', 'objective', 'terminal', 'door', 'enemy', 'vehicle'].includes(c.type))) {
    if (!surface(map.get(`${cell.x}:${cell.y + 1}`))) add('support', 'Support manquant sous cet élément.', cell);
    const clearance = cell.type === 'door' ? Math.max(headCells, 3) : headCells;
    for (let n = 0; n < clearance; n++) {
      const obstacle = map.get(`${cell.x}:${cell.y - n}`);
      if (cell.y - n < 0 || (obstacle && obstacle.id !== cell.id && ['wall', 'floor', 'platform', 'lift', 'hazard'].includes(obstacle.type))) {
        add('headroom', 'Dégagement vertical insuffisant dans la grille.', cell); break;
      }
    }
  }
  for (const type of ['spawn', 'objective']) if (physical.filter(c => c.type === type).length !== 1) add(`count-${type}`, 'Une insertion et un objectif sont requis.');
  const spawn = physical.find(c => c.type === 'spawn'), goal = physical.find(c => c.type === 'objective');
  if (spawn && goal && spawn.y === goal.y) {
    for (let x = Math.min(spawn.x, goal.x); x <= Math.max(spawn.x, goal.x); x++) {
      if (!surface(map.get(`${x}:${spawn.y + 1}`))) { add('main-route', 'Le chemin bas ne possède pas de support continu.'); break; }
    }
  }
  if (physical.some(c => c.type === 'enemy')) add('enemy-runtime', 'Les marqueurs de menace utilisent le catalogue natif, pas une espèce choisie dans cet atelier.', null, 'warning');
  if (physical.some(c => c.type === 'vehicle')) add('vehicle-runtime', 'Vérifier le gabarit réel du véhicule dans le test Mission.', null, 'warning');
  return { ok: !issues.some(i => i.severity === 'error'), issues, scope: 'authored-grid', headCells,
    physicsVerified: false, decorations: room.cells.length - physical.length,
    counts: Object.fromEntries([...new Set(physical.map(c => c.type))].map(type => [type, physical.filter(c => c.type === type).length])) };
}

/** Same recipe + kind => byte-identical blueprint. All geometry uses existing editor types. */
export function generateBlueprintV135(input = {}, kind = 'mission') {
  const recipe = normalizeBlueprintV135(input);
  if (!['mission', 'ship'].includes(kind)) fail('Mode de projet inconnu.');
  if (kind === 'ship' && recipe.vehicle) fail('Le test Vaisseau ne pilote pas les véhicules ; décochez cette option.');
  const { width: w, height: h, levels, shape } = recipe, ground = h - 2;
  const clearance = Math.max(3, Math.ceil(132 / ((kind === 'ship' ? 720 : 1080) / h)));
  const spacing = Math.floor((ground - 3) / levels);
  if (levels > 1 && spacing < clearance + 1) fail('Hauteur insuffisante pour ces étages. Augmentez les lignes ou réduisez les étages.');
  const random = randomSource(recipe.seed), profile = BLUEPRINTS_V135[recipe.profile];
  const cells = new Map(), physical = new Map(); let serial = 0;
  const put = (x, y, type, label = '', layer = DEFAULT_LAYER(type)) => {
    const cell = { id: `draft-${++serial}`, x, y, type, layer, label, locked: false }, key = keyOf(cell);
    if (x < 0 || x >= w || y < 0 || y >= h || cells.has(key) || (!decorative(cell) && physical.has(`${x}:${y}`))) return null;
    cells.set(key, cell); if (!decorative(cell)) physical.set(`${x}:${y}`, cell); return cell;
  };
  const roof = Array.from({ length: w }, (_, x) => {
    const low = Math.min(ground - clearance - 2, Math.floor(h * .46));
    if (shape === 'leftWing') return x < Math.floor(w * .55) ? 2 : low;
    if (shape === 'twinWings') return x >= Math.floor(w * .35) && x < Math.ceil(w * .65) ? low : 2;
    if (shape === 'stepped') return Math.min(ground - clearance - 2, 2 + Math.floor(x * 3 / w) * Math.max(1, Math.floor((h - 8) / 6)));
    return 2;
  });
  for (let x = 1; x < w - 1; x++) {
    put(x, ground, 'floor', 'Pont inférieur'); put(x, roof[x], 'wall', 'Plafond');
    if (x > 1 && roof[x] !== roof[x - 1]) for (let y = Math.min(roof[x], roof[x - 1]); y <= Math.max(roof[x], roof[x - 1]); y++) put(x, y, 'wall', 'Retour de plafond');
  }
  // Leave a full-height recess for each portal; do not put a door in a solid cell.
  for (const x of [1, w - 2]) for (let y = roof[x] + 1; y < ground - clearance; y++) put(x, y, 'wall', 'Montant du sas');
  // Side jambs are supported by the deck, outside the main walking lane.
  for (const x of [0, w - 1]) {
    put(x, ground, 'floor', 'Appui du sas');
    for (let y = ground - clearance - 1; y < ground; y++) put(x, y, 'wall', 'Jambage extérieur');
  }
  const left = put(1, ground - 1, 'door', 'Sas gauche'), right = put(w - 2, ground - 1, 'door', 'Sas droit');
  const decks = [{ y: ground, spans: [[1, w - 2]] }];
  for (let level = 1; level < levels; level++) {
    const y = ground - level * spacing, spans = []; let begin = null;
    // Only build in volumes with enough headroom. Each wing receives its own ladder.
    for (let x = 3; x <= w - 3; x++) {
      const valid = x < w - 3 && roof[x] + clearance < y && !physical.has(`${x}:${y}`);
      if (valid && begin === null) begin = x;
      if ((!valid || x === w - 3) && begin !== null) { if (x - begin >= 5) spans.push([begin, x - 1]); begin = null; }
    }
    if (!spans.length) fail('La silhouette ne laisse pas assez de place pour cet étage. Choisissez une autre forme ou réduisez les étages.');
    for (const [start, end] of spans) {
      const shaft = start;
      for (let x = start + 1; x <= end; x++) put(x, y, 'platform', `Passerelle ${level}`);
      for (let ly = y; ly < ground; ly++) {
        const existing = physical.get(`${shaft}:${ly}`);
        if (existing?.type === 'platform') { cells.delete(keyOf(existing)); physical.delete(`${shaft}:${ly}`); }
        put(shaft, ly, 'ladder', `Échelle ${level}`);
      }
    }
    decks.push({ y, spans });
  }
  const fromLeft = recipe.entry === 'left', spawnX = fromLeft ? 4 : w - 5, goalX = fromLeft ? w - 5 : 4;
  put(spawnX, ground - 1, 'spawn', 'Insertion'); put(goalX, ground - 1, 'objective', 'Objectif du secteur');
  const reserved = new Set([1, 2, w - 3, w - 2, spawnX, goalX]);
  // Resolve slots deterministically against supports, ladders and the actual grid-headroom budget.
  const available = x => x > 2 && x < w - 3 && !reserved.has(x) && !physical.has(`${x}:${ground - 1}`)
    && Array.from({ length: clearance }, (_, n) => physical.get(`${x}:${ground - 1 - n}`)).every(c => !c || !['wall', 'platform', 'floor', 'ladder'].includes(c.type));
  const slot = (desired, type, label, reserve = 0) => {
    const choices = Array.from({ length: w }, (_, x) => x).filter(available).sort((a, b) => Math.abs(a - desired) - Math.abs(b - desired) || a - b);
    const x = choices.find(x => Array.from({ length: 2 * reserve + 1 }, (_, n) => x - reserve + n).every(available));
    if (x === undefined) fail('Le programme est trop dense pour cette largeur. Réduisez les menaces ou agrandissez la salle.');
    const placed = put(x, ground - 1, type, label); for (let n = -reserve; n <= reserve; n++) reserved.add(x + n); return placed;
  };
  for (let i = 0; i < profile.terminals; i++) slot(Math.round(w * (i + 1) / (profile.terminals + 1)), 'terminal', `Commande ${i + 1}`);
  if (recipe.profile === 'maintenance') { slot(Math.round(w * .25), 'vent', 'Conduit A'); slot(Math.round(w * .75), 'vent', 'Conduit B'); }
  if (recipe.vehicle) slot(Math.round(w / 2), 'vehicle', 'Emplacement de véhicule', 1);
  for (let i = 0; i < recipe.threats; i++) {
    for (let x = spawnX - 3; x <= spawnX + 3; x++) reserved.add(x);
    slot(4 + Math.floor(random() * (w - 8)), 'enemy', `Contact ${i + 1}`);
  }
  if (recipe.density) {
    for (const deck of decks) for (const [start, end] of deck.spans) {
      let x = start + 2 + Math.floor(random() * 2);
      for (; x < end - 1; x += Math.max(2, 6 - recipe.density) + Math.floor(random() * 2)) {
        if (roof[x] + 2 < deck.y && !reserved.has(x)) put(x, deck.y - 1, 'terminal', profile.prop, 'background');
      }
    }
    for (let x = 5; x < w - 4; x += 7 + Math.floor(random() * 4)) {
      if (roof[x] + 1 < ground - clearance) put(x, roof[x] + 1, 'vent', 'Réseau supérieur', 'background');
    }
  }
  const room = { id: 'blueprint-room', name: recipe.name, size: [w, h], cells: [...cells.values()].sort((a, b) => a.y - b.y || a.x - b.x || LAYERS.indexOf(a.layer) - LAYERS.indexOf(b.layer)) };
  const normalized = parseProject({ schema: 3, kind, name: recipe.name, rooms: [room], activeRoomId: room.id, links: [] }).rooms[0];
  const report = inspectBlueprintV135(normalized, kind);
  if (!report.ok) fail(`Construction refusée : ${[...new Set(report.issues.filter(i => i.severity === 'error').map(i => i.message))].join(' ')}`);
  return { recipe, room: normalized, report, decks: decks.map(d => ({ y: d.y, spans: d.spans })),
    entranceId: fromLeft ? left.id : right.id, exitId: fromLeft ? right.id : left.id, note: profile.note };
}

function allocator(prefix, used) { let n = 1; return () => { let id; do { id = `${prefix}-${n++}`; } while (used.has(id)); used.add(id); return id; }; }
function ensureAccess(cells, access) {
  if (cells.some(c => c.locked || access.locked?.has(c.layer) || access.visible && !access.visible.has(c.layer))) fail('Un bloc ou calque concerné est verrouillé ou masqué.');
}
function candidateBlueprint(model, recipe, { destination = 'new', connectFrom = null } = {}, access = {}) {
  if (!['new', 'replace'].includes(destination)) fail('Destination de construction inconnue.');
  if (model.pending) fail('Terminez le geste en cours.');
  const blueprint = generateBlueprintV135(recipe, model.data.kind); ensureAccess(blueprint.room.cells, access);
  if (destination === 'new' && model.data.rooms.length >= LIMITS.rooms) fail('Limite de 32 salles atteinte.');
  if (destination === 'replace' && connectFrom) fail('La liaison de création ne s’applique pas au remplacement.');
  const candidate = clone(model.data), used = new Set(candidate.rooms.flatMap(r => r.cells.map(c => c.id)));
  const nextCell = allocator('cell', used), nextRoom = allocator('room', new Set(candidate.rooms.map(r => r.id)));
  const room = clone(blueprint.room), ids = new Map();
  room.id = destination === 'new' ? nextRoom() : model.room.id;
  for (const c of room.cells) { const old = c.id; c.id = nextCell(); ids.set(old, c.id); }
  let retainedLinks = 0;
  if (destination === 'replace') {
    ensureAccess(model.room.cells, access);
    const endpoints = candidate.links.flatMap(l => [l.from, l.to]).filter(e => e.roomId === room.id);
    for (const endpoint of endpoints) {
      const original = model.room.cells.find(c => c.id === endpoint.cellId);
      const replacement = room.cells.find(c => c.type === 'door' && !decorative(c) && c.x === original?.x && c.y === original?.y);
      if (!replacement) fail('Un sas relié changerait de position. Gardez ses coordonnées ou déliez-le avant le remplacement.');
      const generated = replacement.id; replacement.id = original.id;
      for (const [key, value] of ids) if (value === generated) ids.set(key, original.id);
      retainedLinks++;
    }
    candidate.rooms[candidate.rooms.findIndex(r => r.id === room.id)] = room;
  } else candidate.rooms.push(room);
  if (connectFrom) {
    if (!record(connectFrom)) fail('Sas de départ invalide.');
    const sourceRoom = model.data.rooms.find(r => r.id === connectFrom.roomId);
    const source = sourceRoom?.cells.find(c => c.id === connectFrom.cellId);
    if (!source || source.type !== 'door' || decorative(source)) fail('Le départ doit être un sas physique existant.');
    ensureAccess([source], access);
    if (candidate.links.some(l => l.from.cellId === source.id || l.to.cellId === source.id)) fail('Ce sas est déjà relié.');
    candidate.links.push({ id: allocator('link', new Set(candidate.links.map(l => l.id)))(),
      from: { roomId: sourceRoom.id, cellId: source.id }, to: { roomId: room.id, cellId: ids.get(blueprint.entranceId) }, bidirectional: true });
  }
  candidate.activeRoomId = room.id;
  return { candidate: parseProject(candidate), blueprint, roomId: room.id, retainedLinks };
}
export function planBlueprintV135(model, recipe, options = {}, access = {}) {
  const normalized = normalizeBlueprintV135(recipe), settings = { destination: options.destination ?? 'new', connectFrom: options.connectFrom ? clone(options.connectFrom) : null };
  const result = candidateBlueprint(model, normalized, settings, access);
  return { model, source: model.data, revision: model.revision, recipe: normalized, options: settings, ...result };
}
export function applyBlueprintV135(model, plan, access = {}) {
  if (!plan || plan.model !== model || plan.source !== model.data || plan.revision !== model.revision || model.pending) fail('Aperçu obsolète : prévisualisez de nouveau.');
  // Recompute from the whitelisted recipe. A caller cannot inject its edited candidate into the document.
  const checked = candidateBlueprint(model, plan.recipe, plan.options, access);
  const changed = model.transaction(plan.options.destination === 'new' ? 'Construire un secteur' : 'Reconstruire le secteur', () => { model.data = checked.candidate; });
  return { changed, roomId: checked.roomId, retainedLinks: checked.retainedLinks };
}
export function readBlueprintRecipeV135(raw) {
  if (typeof raw !== 'string' || new TextEncoder().encode(raw).length > 16384) fail('Recette trop volumineuse (16 Kio).');
  let input; try { input = JSON.parse(raw); } catch { fail('Recette JSON illisible.'); }
  if (input?.format !== 'frontier-forge-recipe' || input.version !== 1) fail('Ce fichier n’est pas une recette Frontier Forge.');
  return normalizeBlueprintV135(input.recipe);
}
export const exportBlueprintRecipeV135 = recipe => JSON.stringify({ format: 'frontier-forge-recipe', version: 1, recipe: normalizeBlueprintV135(recipe) }, null, 2);
