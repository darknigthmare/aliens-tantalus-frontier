import { getVentTransitPositionV62 } from './vent-network-v62.js';

// A local cutaway of the existing physical graph. No save or travel rule lives here.
export const HUB_VENT_SCENE_SCHEMA_V142 = 142;
export const HUB_VENT_GRAPH_SCALE_V142 = 0.42;
export const HUB_VENT_CROSS_SECTION_V142 = Object.freeze({ width: 132, height: 132, wall: 12 });
export const HUB_VENT_TEXTURE_CROPS_V142 = Object.freeze({
  wall: Object.freeze({ x: 696, y: 568, w: 268, h: 162 }),
  service: Object.freeze({ x: 489, y: 568, w: 178, h: 162 }),
  ladder: Object.freeze({ x: 1033, y: 66, w: 47, h: 386 })
});
const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));
const point = value => ({ x: Number(value?.x) || 0, y: Number(value?.y) || 0 });
const hash = value => [...String(value)].reduce((sum, letter) => Math.imul(sum ^ letter.codePointAt(0), 16777619) >>> 0, 2166136261);
const copy = value => JSON.parse(JSON.stringify(value));
const axis = (from, to) => Math.abs(to.x - from.x) >= Math.abs(to.y - from.y) ? 'horizontal' : 'vertical';
const direction = (from, to) => axis(from, to) === 'horizontal' ? to.x < from.x ? 'left' : 'right' : to.y < from.y ? 'up' : 'down';
const nodeLabel = (node, labels) => String(labels?.rooms?.[node?.roomId] || 'SECTION DE SERVICE').toUpperCase();
const portalLabel = mount => mount?.orientation === 'front' ? 'GRILLE DE PAROI' : 'SERVICE';

export function buildHubVentMountsV142(decks, geometryByDeck) {
  return Object.fromEntries(decks.flatMap((deck, index) => deck.rooms.map(room => {
    // Native exit dispatch selects the first physical grille in that room.
    const hatch = geometryByDeck[index]?.vents?.find(vent => vent.roomId === room.id);
    return hatch ? [room.id, { orientation: 'front', plane: 'back-wall', source: 'native-traversal-geometry',
      hatchId: hatch.id, roomId: room.id, deckId: deck.id, bounds: { x: hatch.x, y: hatch.y, w: hatch.w, h: hatch.h } }] : null;
  }).filter(Boolean)));
}

export function createHubVentSceneV142(network, actor, { width = 1280, height = 720, heldDirection = null, playerWidth = 44, playerHeight = 92, labels = null, portalMounts = null } = {}) {
  const transit = actor?.ventTransit;
  if (!transit || !network?.nodes?.length) return null;
  const nodes = new Map(network.nodes.map(node => [node.id, node]));
  const currentNode = nodes.get(transit.currentNodeId || transit.entryNodeId || transit.fromNodeId);
  if (!currentNode) return null;
  const from = nodes.get(transit.fromNodeId), to = nodes.get(transit.toNodeId);
  const inEdge = Boolean(transit.phase === 'moving' && from && to);
  const physical = inEdge ? point(getVentTransitPositionV62(network, actor)) : point(currentNode.position);
  const projection = value => ({ x: value.x * HUB_VENT_GRAPH_SCALE_V142, y: value.y * HUB_VENT_GRAPH_SCALE_V142 });
  const projected = projection(physical);
  const camera = { x: projected.x - width / 2, y: projected.y - height * 0.55 };
  const screen = value => { const p = projection(point(value)); return { x: p.x - camera.x, y: p.y - camera.y }; };
  const focus = new Set(inEdge ? [from.id, to.id] : [currentNode.id]);
  const relevantEdges = network.edges.filter(edge => edge.enabled !== false && (!edge.allowedKinds || edge.allowedKinds.includes('player')) && (focus.has(edge.from) || focus.has(edge.to)));
  const visibleNodes = new Set([...focus, ...relevantEdges.flatMap(edge => [edge.from, edge.to])]);
  const edges = relevantEdges.map(edge => {
    const start = nodes.get(edge.from), end = nodes.get(edge.to), a = screen(start.position), b = screen(end.position);
    return { id: edge.id, from: edge.from, to: edge.to, a, b, axis: axis(a, b), active: transit.edgeId === edge.id && inEdge,
      direction: direction(a, b), length: edge.length, color: ['#80a990', '#bca36d', '#8cabb5', '#ad906d'][hash(edge.id) % 4] };
  });
  const junctions = [...visibleNodes].map(id => {
    const node = nodes.get(id), center = screen(node.position);
    const branches = network.edges.filter(edge => edge.enabled !== false && (!edge.allowedKinds || edge.allowedKinds.includes('player')) && (edge.from === id || edge.to === id)).map(edge => {
      const other = nodes.get(edge.from === id ? edge.to : edge.from);
      return { edgeId: edge.id, nodeId: other.id, direction: direction(point(node.position), point(other.position)), label: nodeLabel(other, labels), bidirectional: edge.bidirectional !== false };
    }).filter(branch => branch.bidirectional || network.edges.find(edge => edge.id === branch.edgeId).from === id);
    const exit = network.exits.find(portal => portal.nodeId === id && portal.enabled !== false && portal.usable !== false && !portal.blocked);
    return { id, center, label: nodeLabel(node, labels), deck: String(labels?.decks?.[node.deckId] || 'PONT DE SERVICE').toUpperCase(), branches, signature: hash(id),
      exit: exit ? { id: exit.id, legacyType: exit.type, visualMount: portalMounts?.[node.roomId] ? copy(portalMounts[node.roomId]) : null, roomId: exit.destination?.roomId || node.roomId, label: nodeLabel(node, labels) } : null,
      current: id === currentNode.id && !inEdge };
  });
  const previousNode = nodes.get(transit.routeNodeIds?.at(-2));
  const arrivalDirection = previousNode ? direction(point(previousNode.position), point(currentNode.position)) : null;
  const travelDirection = inEdge ? direction(point(from.position), point(to.position)) : arrivalDirection;
  const moving = Boolean(inEdge && heldDirection === travelDirection);
  const vertical = inEdge && axis(point(from.position), point(to.position)) === 'vertical';
  const base = { x: width / 2, y: height * 0.55 }, footY = base.y + (vertical ? 44 : 54);
  const actorPlan = { x: base.x - playerWidth / 2, y: footY - playerHeight, w: playerWidth, h: playerHeight,
    footY, facing: ['left', 'up'].includes(travelDirection) ? -1 : ['right', 'down'].includes(travelDirection) ? 1 : null,
    crouching: !vertical, climbing: Boolean(vertical), moving, vx: moving && !vertical ? travelDirection === 'left' ? -70 : 70 : 0,
    vy: moving && vertical ? travelDirection === 'up' ? -70 : 70 : 0 };
  return { schema: HUB_VENT_SCENE_SCHEMA_V142, key: inEdge ? `edge:${transit.edgeId}` : `node:${currentNode.id}`, phase: transit.phase,
    nodeId: currentNode.id, edgeId: inEdge ? transit.edgeId : null, progress: clamp(transit.progress, 0, 1), camera,
    scale: HUB_VENT_GRAPH_SCALE_V142, edges, nodes: junctions, actor: actorPlan,
    texturePolicy: 'local-uniform-crops', sourceCrops: copy(HUB_VENT_TEXTURE_CROPS_V142) };
}

function polygon(ctx, points, fill) {
  ctx.beginPath(); points.forEach((p, index) => index ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
}
function corridorRect(edge, half) {
  return edge.axis === 'horizontal' ? { x: Math.min(edge.a.x, edge.b.x) - half, y: edge.a.y - half, w: Math.abs(edge.b.x - edge.a.x) + half * 2, h: half * 2 }
    : { x: edge.a.x - half, y: Math.min(edge.a.y, edge.b.y) - half, w: half * 2, h: Math.abs(edge.b.y - edge.a.y) + half * 2 };
}
function pattern(ctx, image, crop, bounds, opacity = .8) {
  if (!image?.complete || !image.naturalWidth) return;
  const scale = Math.min(0.66, bounds.h / crop.h), tw = crop.w * scale, th = crop.h * scale;
  ctx.save(); ctx.beginPath(); ctx.rect(bounds.x, bounds.y, bounds.w, bounds.h); ctx.clip(); ctx.globalAlpha *= opacity;
  for (let x = bounds.x; x < bounds.x + bounds.w; x += tw)
    for (let y = bounds.y; y < bounds.y + bounds.h; y += th) ctx.drawImage(image, crop.x, crop.y, crop.w, crop.h, x, y, tw, th);
  ctx.restore();
}
function drawArrow(ctx, x, y, directionName, color) {
  const vectors = { left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1] }, [dx, dy] = vectors[directionName];
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - dx * 6, y - dy * 6); ctx.lineTo(x + dx * 6, y + dy * 6);
  ctx.moveTo(x + dx * 6, y + dy * 6); ctx.lineTo(x + dx * 2 + dy * 4, y + dy * 2 - dx * 4);
  ctx.moveTo(x + dx * 6, y + dy * 6); ctx.lineTo(x + dx * 2 - dy * 4, y + dy * 2 + dx * 4); ctx.stroke();
}
export function drawHubVentSceneV142(ctx, image, scene, width, height) {
  if (!scene) return;
  ctx.save();
  ctx.fillStyle = '#050909'; ctx.fillRect(0, 0, width, height);
  // The surrounding hull is opaque; only actual graph connections open into it.
  ctx.strokeStyle = '#0c1515'; ctx.lineWidth = 1;
  const gridX = ((-scene.camera.x % 192) + 192) % 192, gridY = ((-scene.camera.y % 160) + 160) % 160;
  for (let x = gridX; x < width; x += 192) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
  for (let y = gridY; y < height; y += 160) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
  for (const half of [78, 66]) {
    ctx.fillStyle = half === 78 ? '#29342f' : '#0e1916';
    for (const edge of scene.edges) { const r = corridorRect(edge, half); ctx.fillRect(r.x, r.y, r.w, r.h); }
    for (const node of scene.nodes) ctx.fillRect(node.center.x - half, node.center.y - half, half * 2, half * 2);
  }
  for (const edge of scene.edges) {
    const r = corridorRect(edge, 65); pattern(ctx, image, HUB_VENT_TEXTURE_CROPS_V142.wall, r, .82);
    ctx.strokeStyle = '#53634e'; ctx.lineWidth = 3;
    if (edge.axis === 'horizontal') {
      const left = Math.min(edge.a.x, edge.b.x) + 66, right = Math.max(edge.a.x, edge.b.x) - 66;
      ctx.beginPath(); ctx.moveTo(left, edge.a.y - 66); ctx.lineTo(right, edge.a.y - 66); ctx.moveTo(left, edge.a.y + 55); ctx.lineTo(right, edge.a.y + 55); ctx.stroke();
      ctx.fillStyle = '#314038'; ctx.fillRect(left, edge.a.y + 58, Math.max(0, right - left), 7);
      for (let x = Math.ceil((left + scene.camera.x) / 144) * 144 - scene.camera.x; x < right; x += 144) {
        ctx.fillStyle = '#273a2e'; ctx.fillRect(x, edge.a.y - 65, 7, 123); ctx.fillStyle = '#839379'; ctx.fillRect(x, edge.a.y - 65, 7, 3);
        ctx.fillStyle = edge.color; ctx.fillRect(x + 24, edge.a.y - 53, 24, 3);
      }
    } else {
      const top = Math.min(edge.a.y, edge.b.y) + 66, bottom = Math.max(edge.a.y, edge.b.y) - 66;
      ctx.fillStyle = '#26372c'; ctx.fillRect(edge.a.x - 26, top, 5, Math.max(0, bottom - top)); ctx.fillRect(edge.a.x + 21, top, 5, Math.max(0, bottom - top));
      ctx.strokeStyle = '#83917b'; ctx.lineWidth = 4;
      for (let y = Math.ceil((top + scene.camera.y) / 24) * 24 - scene.camera.y; y < bottom; y += 24) { ctx.beginPath(); ctx.moveTo(edge.a.x - 22, y); ctx.lineTo(edge.a.x + 22, y); ctx.stroke(); }
    }
  }
  for (const node of scene.nodes) {
    const { x, y } = node.center, half = 66, directions = new Set(node.branches.map(branch => branch.direction));
    ctx.fillStyle = '#15201a'; ctx.fillRect(x - half, y - half, half * 2, half * 2);
    pattern(ctx, image, node.signature % 2 ? HUB_VENT_TEXTURE_CROPS_V142.wall : HUB_VENT_TEXTURE_CROPS_V142.service, { x: x - half, y: y - half, w: half * 2, h: half * 2 }, .73);
    // Solid end caps exist precisely where there is no navigable branch.
    ctx.fillStyle = '#40513f';
    if (!directions.has('left')) ctx.fillRect(x - half - 1, y - half, 9, half * 2);
    if (!directions.has('right')) ctx.fillRect(x + half - 8, y - half, 9, half * 2);
    if (!directions.has('up')) ctx.fillRect(x - half, y - half - 1, half * 2, 8);
    if (!directions.has('down')) ctx.fillRect(x - half, y + 55, half * 2, 11);
    if (directions.has('up') || directions.has('down')) {
      ctx.strokeStyle = '#72836c'; ctx.lineWidth = 3;
      const top = directions.has('up') ? y - 65 : y - 6, bottom = directions.has('down') ? y + 65 : y + 54;
      ctx.beginPath(); ctx.moveTo(x - 24, top); ctx.lineTo(x - 24, bottom); ctx.moveTo(x + 24, top); ctx.lineTo(x + 24, bottom); ctx.stroke();
      for (let rung = top + 8; rung < bottom; rung += 23) { ctx.beginPath(); ctx.moveTo(x - 24, rung); ctx.lineTo(x + 24, rung); ctx.stroke(); }
    }
    if (node.exit?.visualMount) {
      const native = node.exit.visualMount.bounds, hatchX = x + 17, hatchY = y + 4;
      const w = 42, h = w * native.h / native.w;
      ctx.fillStyle = '#040c0a'; ctx.fillRect(hatchX, hatchY, w, h); ctx.strokeStyle = '#a0ac8a'; ctx.lineWidth = 2; ctx.strokeRect(hatchX, hatchY, w, h);
      ctx.strokeStyle = '#53684f'; ctx.lineWidth = 1;
      for (let hatch = 4; hatch < h; hatch += 4) { ctx.beginPath(); ctx.moveTo(hatchX + 2, hatchY + hatch); ctx.lineTo(hatchX + w - 2, hatchY + hatch); ctx.stroke(); }
      ctx.fillStyle = '#b1c4a3'; ctx.font = '700 9px ui-monospace, monospace'; ctx.textAlign = 'center'; ctx.fillText('E · SORTIE', x + 38, y + 37);
    }
    const plaqueY = y - 104;
    ctx.fillStyle = '#18251e'; ctx.fillRect(x - 96, plaqueY, 192, 30); ctx.strokeStyle = '#52604c'; ctx.strokeRect(x - 95.5, plaqueY + .5, 191, 29);
    ctx.fillStyle = '#b2c0a8'; ctx.textAlign = 'center'; ctx.font = '700 11px ui-monospace, monospace'; ctx.fillText(node.label.slice(0, 25), x, plaqueY + 12);
    ctx.fillStyle = '#7b9076'; ctx.font = '9px ui-monospace, monospace'; ctx.fillText(`${node.deck.replace(/^PONT /, '')} · ${portalLabel(node.exit?.visualMount)}`, x, plaqueY + 24);
    for (const branch of node.branches) {
      const d = branch.direction, dx = d === 'left' ? -1 : d === 'right' ? 1 : 0, dy = d === 'up' ? -1 : d === 'down' ? 1 : 0;
      drawArrow(ctx, x + dx * 104, y + dy * 104, d, '#9caa80');
      if (dx) { ctx.fillStyle = '#a3b494'; ctx.font = '9px ui-monospace, monospace'; ctx.fillText(branch.label.slice(0, 20), x + dx * 174, y - 76); }
    }
    // A fixed, node-specific service identifier makes backtracking recognizable.
    polygon(ctx, [[x - 53, y + 30], [x - 45, y + 30], [x - 52, y + 47], [x - 60, y + 47]], '#9c9561');
    ctx.textAlign = 'left'; ctx.fillStyle = '#a5ad87'; ctx.font = '8px ui-monospace, monospace'; ctx.fillText(`V-${String(node.signature % 1000).padStart(3, '0')}`, x - 58, y + 24);
  }
  ctx.restore();
}
