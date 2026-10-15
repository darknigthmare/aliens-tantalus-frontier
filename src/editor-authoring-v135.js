export const EDITOR_TILE_TYPES_V135 = Object.freeze(['floor', 'platform', 'wall', 'door', 'vent', 'ladder', 'lift', 'spawn', 'objective', 'enemy', 'vehicle', 'terminal', 'hazard']);
export const EDITOR_BRUSH_MODES_V135 = Object.freeze(['paint', 'erase', 'rectangle', 'fill', 'select']);
export const EDITOR_LIMITS_V135 = Object.freeze({ minColumns: 8, maxColumns: 128, minRows: 8, maxRows: 72, tiles: 9216 });
const tileTypes = new Set(EDITOR_TILE_TYPES_V135);
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);

export function assertEditorDimensionsV135(columns, rows) {
  if (!Number.isInteger(columns) || columns < 8 || columns > 128 || !Number.isInteger(rows) || rows < 8 || rows > 72) {
    throw new Error('Dimensions invalides : 8 à 128 colonnes et 8 à 72 lignes entières.');
  }
  return [columns, rows];
}

/** Validate before altering a live workspace. The existing Forge schema stays 2. */
export function normalizeEditorProjectV135(project) {
  if (!record(project) || !Array.isArray(project.tiles) || project.tiles.length > EDITOR_LIMITS_V135.tiles
    || project.schema !== undefined && ![1, 2].includes(project.schema)
    || project.kind !== undefined && !['mission', 'ship'].includes(project.kind)) throw new Error('Projet éditeur invalide ou format non pris en charge.');
  const size = project.size === undefined ? [32, 18] : project.size;
  if (!Array.isArray(size) || size.length !== 2) throw new Error('Dimensions du projet invalides.');
  const [columns, rows] = assertEditorDimensionsV135(size[0], size[1]), tiles = new Map();
  for (const tile of project.tiles) {
    const match = record(tile) && typeof tile.position === 'string' && /^(\d{1,3}):(\d{1,3})$/u.exec(tile.position);
    if (!match || !tileTypes.has(tile.type)) throw new Error('Le projet contient une tuile invalide. Aucune modification appliquée.');
    const x = Number(match[1]), y = Number(match[2]);
    if (x >= columns || y >= rows) throw new Error('Une tuile dépasse les dimensions du projet. Aucune modification appliquée.');
    tiles.set(`${x}:${y}`, tile.type);
  }
  return { kind: project.kind === 'ship' ? 'ship' : 'mission', size: [columns, rows], tiles: [...tiles] };
}

/** Bresenham keeps a quick pointer stroke continuous even between sparse events. */
export function editorLineCellsV135(from, to) {
  if (!Array.isArray(from) || !Array.isArray(to) || from.length !== 2 || to.length !== 2) throw new Error('Trait hors grille.');
  let [x, y] = from; const [endX, endY] = to, cells = [];
  if (![x, y, endX, endY].every(Number.isInteger) || Math.min(x, endX) < 0 || Math.max(x, endX) > 127 || Math.min(y, endY) < 0 || Math.max(y, endY) > 71) throw new Error('Trait hors grille.');
  const dx = Math.abs(endX - x), sx = x < endX ? 1 : -1, dy = -Math.abs(endY - y), sy = y < endY ? 1 : -1;
  let difference = dx + dy;
  while (true) {
    cells.push([x, y]); if (x === endX && y === endY) return cells;
    const doubled = 2 * difference;
    if (doubled >= dy) { difference += dy; x += sx; }
    if (doubled <= dx) { difference += dx; y += sy; }
  }
}

export function editorRectangleCellsV135(from, to) {
  if (!Array.isArray(from) || !Array.isArray(to) || from.length !== 2 || to.length !== 2 || ![...from, ...to].every(Number.isInteger)) throw new Error('Rectangle hors grille.');
  const left = Math.min(from[0], to[0]), right = Math.max(from[0], to[0]);
  const top = Math.min(from[1], to[1]), bottom = Math.max(from[1], to[1]);
  if (left < 0 || top < 0 || right > 127 || bottom > 71) throw new Error('Rectangle hors grille.');
  const cells = [];
  for (let y = top; y <= bottom; y += 1) for (let x = left; x <= right; x += 1) cells.push([x, y]);
  return cells;
}

/** Flood selection uses the original connected region, never its new colour. */
export function editorFloodCellsV135(tiles, columns, rows, origin, replacement) {
  assertEditorDimensionsV135(columns, rows);
  const [startX, startY] = origin;
  if (!Number.isInteger(startX) || !Number.isInteger(startY) || startX < 0 || startY < 0 || startX >= columns || startY >= rows) throw new Error('Point de remplissage hors grille.');
  if (replacement !== undefined && !tileTypes.has(replacement)) throw new Error('Tuile de remplissage invalide.');
  const target = tiles.get(`${startX}:${startY}`); if (target === replacement) return [];
  const visited = new Uint8Array(columns * rows), queue = [startY * columns + startX], cells = [];
  visited[queue[0]] = 1;
  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index], x = current % columns, y = Math.floor(current / columns);
    if (tiles.get(`${x}:${y}`) !== target) continue;
    cells.push([x, y]);
    for (const next of [x > 0 ? current - 1 : -1, x + 1 < columns ? current + 1 : -1, y > 0 ? current - columns : -1, y + 1 < rows ? current + columns : -1]) {
      if (next >= 0 && !visited[next]) { visited[next] = 1; queue.push(next); }
    }
  }
  return cells;
}
