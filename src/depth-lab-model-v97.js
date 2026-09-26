import { getSpecialOperationV67 } from './special-operations-v67.js';

// Pure, ephemeral visual model. No campaign actor, combat, progression or persistence.
export const DEPTH_LAB_WORLD_V97 = Object.freeze({ minX: 0, maxX: 2400, minDepth: 0, maxDepth: 1 });
const art = '/assets/openai/metroidvania/';
const layers = prefix => Object.freeze(['far', 'mid', 'foreground'].map(layer => `${art}${prefix}-${layer}.png`));
const zone = (id, name, operationId, prefix, accent, note, props) => Object.freeze({
  id, name, operationId, operationTitle: getSpecialOperationV67(operationId)?.promisedTitle || '',
  layers: layers(prefix), accent, note, prototypeOnly: true, playableDlc: false,
  props: Object.freeze(props.map(p => Object.freeze(p)))
});
export const DEPTH_LAB_ZONES_V97 = Object.freeze([
  zone('tantalus-command', 'Tantalus · Commandement', 'tantalus-hub-expansion', 'zones/ship-command', '#74d9e7',
    'Étude de la passerelle avec les trois plans existants. Les volumes au sol sont des repères de profondeur, pas des obstacles de campagne.',
    [{ id: 'console-a', x: 980, depth: .50, width: 130, height: 85 }, { id: 'console-b', x: 1420, depth: .24, width: 115, height: 85 }]),
  zone('tantalus-cargo', 'Tantalus · Soute', 'tantalus-hub-expansion', 'zones/ship-cargo', '#e2b56b',
    'Étude de circulation dans la soute. Le déplacement libre en profondeur est expérimental et ne remplace pas le gameplay 2D.',
    [{ id: 'crate-a', x: 900, depth: .65, width: 150, height: 110 }, { id: 'crate-b', x: 1330, depth: .38, width: 140, height: 110 }]),
  zone('cargo-brutal', 'DLC · Cargo Brutal', 'cargo-brutal', 'zones/ship-cargo', '#ed9563',
    'Maquette de mise en scène liée à Cargo Brutal. Réutilise la soute existante ; aucun Loader, objectif, combat ou DLC jouable ajouté ici.',
    [{ id: 'heavy-cargo', x: 1080, depth: .53, width: 190, height: 125 }, { id: 'convoy-marker', x: 1550, depth: .18, width: 130, height: 90 }]),
  zone('hive-world', 'DLC · Ruche-monde', 'hive-world', 'planet-exterior', '#b3d39b',
    'Maquette de profondeur pour LV-XENO. Habillage extérieur planétaire existant utilisé comme référence de volume, pas comme décor final de la Ruche-monde.',
    [{ id: 'volume-a', x: 920, depth: .60, width: 145, height: 110 }, { id: 'volume-b', x: 1410, depth: .27, width: 170, height: 130 }])
]);
export const DEPTH_LAB_ACTORS_V97 = Object.freeze([
  Object.freeze({ id: 'commando', name: 'Commando · pose témoin',
    path: '/assets/openai/sprites/static-enemy-v96/armored-weyland-yutani-commando.png',
    width: 1254, height: 1254, bounds: Object.freeze([320, 148, 994, 1152]), pivotX: .50, relativeHeight: 1 }),
  Object.freeze({ id: 'siege-royal', name: 'Siege Royal · pose témoin',
    path: '/assets/openai/sprites/static-enemy-v97/enemy-081-albino-siege-royal.png',
    width: 1361, height: 1156, bounds: Object.freeze([90, 67, 1276, 1107]), pivotX: .70, relativeHeight: 1.18 })
]);
export const DEPTH_LAB_ASSETS_V97 = Object.freeze([...new Set([
  ...DEPTH_LAB_ZONES_V97.flatMap(z => z.layers), ...DEPTH_LAB_ACTORS_V97.map(a => a.path)
])]);
export const clampDepthLabV97 = (value, min, max) => Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
export function createDepthLabStateV97() {
  return { zoneId: 'tantalus-command', actorId: 'commando', mode: 'compare', x: 1120, depth: .42,
    camera: 1120, facing: 1, grid: true, occlusion: true, parallax: 1, follow: true, paused: false, demo: false, demoTime: 0 };
}
export function getDepthLabZoneV97(id) {
  return DEPTH_LAB_ZONES_V97.find(z => z.id === id) || DEPTH_LAB_ZONES_V97[0];
}
/** Depth 0 is near; 1 is far. Scale and foot plane share the same perspective factor. */
export function projectDepthLabV97(point, viewport, mode = '2.5d', camera = 1120) {
  const width = Math.max(1, Number(viewport.width) || 1), height = Math.max(1, Number(viewport.height) || 1);
  const depth = clampDepthLabV97(Number(point.depth), 0, 1);
  const scale = mode === '2d' ? .86 : .54 + .62 * (1 - depth);
  return { x: width / 2 + (point.x - camera) * width / 1100 * scale,
    y: height * (mode === '2d' ? .84 : .56 + .35 * (1 - depth)), scale, depth };
}
export function unprojectDepthLabV97(point, viewport, mode = '2.5d', camera = 1120, previousDepth = .42) {
  const width = Math.max(1, Number(viewport.width) || 1), height = Math.max(1, Number(viewport.height) || 1);
  const depth = mode === '2d' ? clampDepthLabV97(previousDepth, 0, 1) : clampDepthLabV97(1 - (point.y / height - .56) / .35, 0, 1);
  const scale = projectDepthLabV97({ x: camera, depth }, { width, height }, mode, camera).scale;
  return { x: clampDepthLabV97(camera + (point.x - width / 2) * 1100 / width / scale, 0, 2400), depth };
}
export function stepDepthLabV97(state, input, seconds) {
  const next = { ...state }, dt = clampDepthLabV97(seconds, 0, .05);
  if (next.paused) return next;
  let dx = clampDepthLabV97(Number(input.x) || 0, -1, 1), dz = clampDepthLabV97(Number(input.depth) || 0, -1, 1);
  if (dx || dz) next.demo = false;
  if (next.demo) {
    next.demoTime += dt;
    next.x = 1120 + Math.sin(next.demoTime * .48) * 470;
    next.depth = .5 + Math.sin(next.demoTime * .78) * .44;
    next.facing = Math.cos(next.demoTime * .48) < 0 ? -1 : 1;
  } else {
    const norm = Math.max(1, Math.hypot(dx, dz)); dx /= norm; dz /= norm;
    next.x = clampDepthLabV97(next.x + dx * 330 * dt, 0, 2400);
    next.depth = clampDepthLabV97(next.depth + dz * .62 * dt, 0, 1);
    if (dx) next.facing = dx < 0 ? -1 : 1;
  }
  if (next.follow) next.camera += (next.x - next.camera) * Math.min(1, dt * 3);
  return next;
}
/** Stable painter order: far objects first, nearest feet last. Does not mutate inputs. */
export function sortDepthLabV97(objects, mode = '2.5d', occlusion = true) {
  if (mode === '2d' || !occlusion) return [...objects].sort((a, b) => Number(a.kind === 'actor') - Number(b.kind === 'actor'));
  return [...objects].sort((a, b) => b.depth - a.depth || String(a.id).localeCompare(String(b.id)));
}
export function depthLabParallaxV97(camera, layer, width, strength = 1, mode = '2.5d') {
  const rates = { far: .035, mid: .13, foreground: .23 };
  return -(camera - 1120) * width / 1100 * (rates[layer] || 0) * clampDepthLabV97(strength, 0, 1.5) * (mode === '2d' ? .38 : 1);
}
