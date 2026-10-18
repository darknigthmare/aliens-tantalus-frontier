import { resolveHumanAtlasGeometryV133, drawHumanAtlasV133 } from './human-visual-contract-v133.js';

/** Authored, stationary conversation partners. These local characters reuse
 * shipped colonial personnel art; they never become campaign crew/operators. */
export const FORGE_NPC_LIMITS_V158 = Object.freeze({ room: 16, project: 64, name: 80, height: 92 });
export const FORGE_NPC_PRESETS_V158 = Object.freeze([
  Object.freeze({ id: 'colonial-officer', label: 'Personnel colonial · officier', sheetId: 'npc.mara-vega.locomotion',
    path: '/assets/openai/sprites/normalized/npcs/mara-vega-locomotion-sheet.png', sourceFacing: 1 }),
  Object.freeze({ id: 'colonial-technician', label: 'Personnel colonial · technicien', sheetId: 'npc.idris-kwan.locomotion',
    path: '/assets/openai/sprites/normalized/npcs/idris-kwan-locomotion-sheet.png', sourceFacing: 1 }),
  Object.freeze({ id: 'colonial-medic', label: 'Personnel colonial · médecin', sheetId: 'npc.noor-okafor.locomotion',
    path: '/assets/openai/sprites/normalized/npcs/noor-okafor-locomotion-sheet.png', sourceFacing: 1 })
]);
const presets = new Map(FORGE_NPC_PRESETS_V158.map(entry => [entry.id, entry]));
const fail = message => { throw new Error(`Personnage Forge : ${message}`); };
const physical = cell => !['background', 'foreground'].includes(cell.layer);
const overlaps = (a, b) => a.x < b.x + b.w - .01 && a.x + a.w > b.x + .01
  && a.y < b.y + b.h - .01 && a.y + a.h > b.y + .01;

export function parseForgeNpcV158(raw, type, layer) {
  if (type !== 'npc') { if (raw !== undefined) fail('les propriétés de personnage exigent un bloc PNJ.'); return undefined; }
  if (!['structure', 'gameplay'].includes(layer)) fail('un PNJ doit être dans un calque physique.');
  if (raw === undefined) raw = { schema: 1, name: 'Personnel', presetId: 'colonial-officer', facing: 1 };
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) || raw.schema !== 1
    || Object.keys(raw).some(key => !['schema', 'name', 'presetId', 'facing'].includes(key))
    || typeof raw.name !== 'string' || !raw.name.trim() || raw.name.length > FORGE_NPC_LIMITS_V158.name
    || /[\u0000-\u001f\u007f]/.test(raw.name) || !presets.has(raw.presetId) || ![-1, 1].includes(raw.facing)) fail('nom, apparence ou orientation invalide.');
  return { schema: 1, name: raw.name.trim(), presetId: raw.presetId, facing: raw.facing };
}

export function validateForgeNpcsV158(rooms) {
  let total = 0;
  for (const room of rooms) {
    const count = room.cells.filter(cell => cell.type === 'npc').length;
    if (count > FORGE_NPC_LIMITS_V158.room) fail('16 PNJ maximum par salle.');
    total += count;
  }
  if (total > FORGE_NPC_LIMITS_V158.project) fail('64 PNJ maximum par projet.');
}

/** Derived from the document, never imported from a checkpoint actor graph.
 * A Mission platform has its surface half a cell below its authored top. */
export function forgeNpcActorsV158(room, kind) {
  const width = kind === 'ship' ? 5120 : 6200, height = kind === 'ship' ? 720 : 1080;
  const cw = width / room.size[0], ch = height / room.size[1], w = kind === 'ship' ? 44 : 42, h = 92;
  return room.cells.filter(cell => cell.type === 'npc' && physical(cell)).map(cell => {
    const support = room.cells.find(entry => physical(entry) && entry.x === cell.x && entry.y === cell.y + 1);
    const foot = (cell.y + 1) * ch + (kind === 'mission' && support?.type === 'platform' ? ch * .5 : 0);
    return { id: `forge-npc:${cell.id}`, cellId: cell.id, ...cell.npc,
      x: (cell.x + .5) * cw - w / 2, y: foot - h, w, h };
  });
}

/** Admission uses the two real compilers' bodies/surfaces. It does not claim
 * pathfinding or reachable jumps, and a moving lift cannot support a PNJ. */
export function inspectForgeNpcsV158(room, kind, geometry) {
  const actors = forgeNpcActorsV158(room, kind), issues = [], width = kind === 'ship' ? 5120 : 6200,
    height = kind === 'ship' ? 720 : 1080;
  const solids = geometry.filter(box => ['floor', 'platform', 'wall', 'door', 'vent'].includes(box.type));
  const surfaces = geometry.filter(box => ['floor', 'platform'].includes(box.type) && !box.dynamic);
  const add = (code, message, actor) => issues.push({ severity: 'error', code, message,
    roomId: room.id, cellId: actor.cellId, x: null, y: null });
  for (const actor of actors) {
    if (actor.x < (kind === 'ship' ? 24 : 0) || actor.y < 0 || actor.x + actor.w > width - (kind === 'ship' ? 24 : 0)
      || actor.y + actor.h > height) add('npc-body-bounds', 'Le corps du PNJ dépasse les limites physiques de la salle.', actor);
    if (solids.some(box => overlaps(actor, box))) add('npc-body-blocked', 'Le corps du PNJ rencontre une cloison, un sas, un conduit ou une plateforme.', actor);
    if (geometry.some(box => box.type === 'hazard' && overlaps(actor, box))) add('npc-body-hazard', 'Le PNJ est placé dans un danger.', actor);
    const spans = surfaces.filter(box => Math.abs(box.y - actor.y - actor.h) < .02)
      .map(box => [box.x, box.x + box.w]).sort((a, b) => a[0] - b[0]);
    let right = actor.x;
    for (const [left, end] of spans) if (left <= right + .01 && end > right) right = end;
    if (right < actor.x + actor.w - .01) add('npc-body-support', 'Les deux pieds du PNJ doivent reposer sur un sol ou une passerelle fixe.', actor);
    if (geometry.some(box => box.type === 'spawn' && overlaps(actor, box))
      || actors.some(other => other !== actor && overlaps(actor, other))) add('npc-body-overlap', 'Le PNJ recouvre l’insertion ou un autre personnage.', actor);
  }
  return { actors, issues };
}

const images = new Map();
export function drawForgeNpcsV158(ctx, engine) {
  const actors = engine.forgeNpcsV158 || [], result = [];
  if (!engine.forgeSessionV141) return result;
  for (const actor of actors) {
    const sheet = presets.get(actor.presetId);
    if (!sheet) continue;
    let image = images.get(sheet.path);
    if (!image && typeof globalThis.Image === 'function') {
      image = new Image(); image.src = sheet.path; images.set(sheet.path, image);
    }
    const column = engine.reducedMotion || engine.accessibilityRuntime?.reducedMotion ? 0
      : Math.floor((engine.animationTime || 0) * 3) % 4;
    const human = resolveHumanAtlasGeometryV133({ actor, sheet, column, row: 0,
      surface: engine.forgeSessionV141.kind === 'ship' ? 'hub' : 'mission' });
    const drawn = drawHumanAtlasV133(ctx, image, human);
    result.push({ cellId: actor.cellId, presetId: actor.presetId, drawn, geometry: human });
  }
  engine.forgeNpcRenderV158 = result;
  return result;
}
