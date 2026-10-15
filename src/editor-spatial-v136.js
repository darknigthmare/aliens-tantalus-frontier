import { normalizeEditorProjectV135 } from './editor-authoring-v135.js';

export const EDITOR_MISSION_WORLD_V136 = Object.freeze({ width: 6200, height: 1080, actorWidth: 42, actorHeight: 92 });
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

/** Prevent a selected campaign's bespoke controller from replacing a Forge map. */
export function isolateForgeMissionOptionsV136(options = {}) {
  if (options.editorProject?.kind !== 'mission') return options;
  const normalized = normalizeEditorProjectV135(options.editorProject);
  const objective = 'Atteindre l’objectif du plan Forge';
  return { ...options,
    campaign: { ...options.campaign, id: 'forge-authored-v136', name: 'PLAYTEST FORGE', mode: 'FORGE', objective,
      pairId: null, specialOperationId: null, canon: 'project-authoring', source: 'Frontier Forge' },
    levelSeed: { ...options.levelSeed, id: 'forge-authored-level-v136', name: 'Plan Forge', objective, hazards: [],
      width: normalized.size[0], height: normalized.size[1] },
    missionLevel: null, specialOperationId: null, vehicle: null, apexDossier: null, neuroProfile: null,
    userCasteCampaignV88: false, verticalWorldV130: false, hordeDirectorV132: false };
}

/** Gates refer only to physical entities placed by this project's author. */
export function buildForgeObjectiveV136(engine) {
  const requirements = [];
  if (engine.powerNode) requirements.push('power');
  if (engine.archiveTerminal) requirements.push('archive');
  if (engine.enemies.some(enemy => enemy.isBoss && enemy.alive)) requirements.push('boss');
  return Object.freeze({ id: 'forge-authored-objective-v136', sourceText: 'Atteindre l’objectif du plan Forge', action: 'forge',
    requirements: Object.freeze(requirements), nodeCount: 0, holdSeconds: 0, timeLimit: 0, trackerPulses: 0,
    purgeTarget: 0, doorTarget: 0, ventTarget: 0, waveCount: 0, mode: 'FORGE', routeBudget: 1 });
}

/** One grid contract for authoring and mission playtests, including far edges. */
export function compileEditorGridV136(project, world = EDITOR_MISSION_WORLD_V136) {
  const normalized = normalizeEditorProjectV135(project);
  const width = Number(world.width), height = Number(world.height);
  if (!(width > 0 && height > 0 && Number.isFinite(width) && Number.isFinite(height))) throw new TypeError('Dimensions physiques du niveau invalides.');
  const [columns, rows] = normalized.size, tileWidth = width / columns, tileHeight = height / rows;
  return { kind: normalized.kind, columns, rows, width, height, tileWidth, tileHeight,
    tiles: normalized.tiles.map(([position, type]) => {
      const [column, row] = position.split(':').map(Number);
      return { position, type, column, row, x: column * tileWidth, y: row * tileHeight };
    }) };
}

/** Keep complete physical actors/interactive bounds inside their actual world. */
export function constrainEditorRectV136(rect, world = EDITOR_MISSION_WORLD_V136) {
  const w = Number(rect.w), h = Number(rect.h);
  if (![w, h, rect.x, rect.y].every(Number.isFinite) || w < 0 || h < 0 || w > world.width || h > world.height) throw new TypeError('Dimensions physiques de l’objet invalides.');
  return { ...rect, x: clamp(rect.x, 0, world.width - w), y: clamp(rect.y, 0, world.height - h) };
}

export function editorMissionSpawnV136(grid, player = EDITOR_MISSION_WORLD_V136) {
  const tile = grid.tiles.find(entry => entry.type === 'spawn');
  if (!tile) return null;
  const w = player.w ?? player.actorWidth ?? EDITOR_MISSION_WORLD_V136.actorWidth;
  const h = player.h ?? player.actorHeight ?? EDITOR_MISSION_WORLD_V136.actorHeight;
  const bounds = constrainEditorRectV136({ x: tile.x + grid.tileWidth * .35, y: tile.y + grid.tileHeight - h, w, h }, grid);
  return { x: bounds.x, y: bounds.y };
}

const overlap = (a, b) => a.x < b.x + b.w - .01 && a.x + a.w > b.x + .01 && a.y < b.y + b.h - .01 && a.y + a.h > b.y + .01;
const tileRect = (tile, grid) => ({ x: tile.x, y: tile.y, w: grid.tileWidth, h: grid.tileHeight });

/** Local clearance checks, not a claim that a level can be completed. */
export function analyzeEditorSpatialV136(project) {
  const grid = compileEditorGridV136(project), issues = [], footprints = [];
  if (grid.kind !== 'mission') return { supported: false, issues, footprints, columns: grid.columns, rows: grid.rows,
    note: 'Les repères physiques concernent les missions. Testez aussi votre plan de vaisseau dans le hub.' };
  const cells = new Map(grid.tiles.map(tile => [tile.position, tile]));
  const add = (code, tile, message) => issues.push({ code, position: tile.position, column: tile.column, row: tile.row, message });
  const solid = tile => {
    if (!tile || !['floor', 'platform', 'wall'].includes(tile.type)) return null;
    const bounds = tileRect(tile, grid);
    if (tile.type === 'floor') bounds.h = Math.max(24, grid.tileHeight);
    if (tile.type === 'platform') { bounds.y += grid.tileHeight * .5; bounds.h = 24; }
    return bounds;
  };
  const around = bounds => {
    const found = [];
    // Minimum-height floors/platforms can extend into the following grid row.
    const left = Math.max(0, Math.floor(bounds.x / grid.tileWidth));
    const right = Math.min(grid.columns - 1, Math.floor((bounds.x + bounds.w) / grid.tileWidth));
    const top = Math.max(0, Math.floor((bounds.y - 24) / grid.tileHeight));
    const bottom = Math.min(grid.rows - 1, Math.floor((bounds.y + bounds.h) / grid.tileHeight));
    for (let y = top; y <= bottom; y++) for (let x = left; x <= right; x++) {
      const tile = cells.get(`${x}:${y}`), bounds = solid(tile);
      if (bounds) found.push({ tile, bounds });
    }
    return found;
  };
  const spawns = grid.tiles.filter(tile => tile.type === 'spawn');
  if (spawns.length) {
    const tile = spawns[0], point = editorMissionSpawnV136(grid);
    const bounds = { ...point, w: 42, h: 92 };
    footprints.push({ type: 'spawn', position: tile.position, ...bounds });
    if (around(bounds).some(entry => overlap(entry.bounds, bounds))) add('spawn-obstructed', tile, 'Départ encombré : libérez toute la silhouette du personnage.');
    const foot = { x: bounds.x, y: bounds.y + bounds.h - .01, w: bounds.w, h: 3 };
    if (!around(foot).some(entry => entry.bounds.y >= foot.y - .1 && entry.bounds.y <= foot.y + 3
      && entry.bounds.x < foot.x + foot.w && entry.bounds.x + entry.bounds.w > foot.x)) add('spawn-falling', tile, 'Départ en chute : aucun sol ou plateforme directement sous les pieds.');
    for (const extra of spawns.slice(1)) add('extra-spawn', extra, 'Départ supplémentaire ignoré : la mission utilise le premier départ du plan.');
  }
  let objectives = 0, terminals = 0;
  for (const tile of grid.tiles) {
    if (tile.type === 'objective') {
      objectives++;
      const bounds = constrainEditorRectV136({ x: tile.x + grid.tileWidth * .35, y: tile.y, w: Math.max(52, grid.tileWidth * .3), h: grid.tileHeight });
      if (footprints.length < 128) footprints.push({ type: 'objective', position: tile.position, ...bounds });
      if (objectives > 1) add('extra-objective', tile, 'Objectif supplémentaire ignoré : la mission utilise le premier objectif du plan.');
      else if (around(bounds).some(entry => entry.tile.type === 'wall' && overlap(entry.bounds, bounds))) add('objective-obstructed', tile, 'Une paroi recouvre l’objectif : vérifiez son approche pendant le playtest.');
    } else if (tile.type === 'terminal') {
      terminals++;
      if (terminals > 2) add('extra-terminal', tile, 'Terminal supplémentaire ignoré : seuls les deux premiers sont utilisés en mission.');
    } else if (tile.type === 'door') {
      const h = Math.max(132, grid.tileHeight * 2.6);
      if (footprints.length < 128) footprints.push({ type: 'door', position: tile.position,
        ...constrainEditorRectV136({ x: tile.x + grid.tileWidth * .34, y: tile.y + grid.tileHeight - h, w: Math.max(48, grid.tileWidth * .32), h }) });
    } else if (tile.type === 'platform' && footprints.length < 128) footprints.push({ type: 'platform', position: tile.position, ...solid(tile), w: grid.tileWidth + 1 });
  }
  return { supported: true, columns: grid.columns, rows: grid.rows, tileWidth: grid.tileWidth, tileHeight: grid.tileHeight,
    worldWidth: grid.width, worldHeight: grid.height, issues, footprints,
    note: 'Les contours montrent les volumes physiques. Les avertissements portent sur le départ et les marqueurs utilisés ; le playtest reste nécessaire pour vérifier les parcours.' };
}
