import { validateMissionPhysicalTopologyV57, validateMissionTopologyV52 } from './mission-levels-v52.js';
import { validateMissionTopologyV58 } from './topology-coherence-v58.js';

const list = value => Array.isArray(value) ? value : [];

// Explicit elevations keep authored objectives, patrol routes and deck joins on
// the same floor. Terrain, arena, editor and DLC geometries use their own rules.
export const VERTICAL_LEVEL_PROFILES_V130 = Object.freeze({
  'ship-interior-vertical': Object.freeze({ id: 'ship-three-decks-v130', height: 1100,
    elevations: Object.freeze([[190, 140], [330, 504], [470, 868]]),
    shafts: Object.freeze([
      Object.freeze({ id: 'ship-e14', label: 'AMARRAGE', nodeIds: ['ship-dock-high', 'ship-dock-mid', 'ship-dock'], w: 144 }),
      Object.freeze({ id: 'ship-engineering-lift-v130', label: 'INGÉNIERIE', nodeIds: ['ship-shaft-high', 'ship-shaft-mid', 'ship-shaft-low'], w: 144 })
    ]),
    rearNodes: Object.freeze(['ship-cargo', 'ship-service', 'ship-crew', 'ship-bridge', 'ship-aft-low']),
    scenery: Object.freeze([
      Object.freeze({ nodeId: 'ship-hull', offsetX: 70, material: 'glass', w: 18, h: 106, hp: 24 }),
      Object.freeze({ nodeId: 'ship-service', offsetX: 70, material: 'panel', w: 24, h: 64, hp: 46 }),
      Object.freeze({ nodeId: 'ship-aft-low', offsetX: -90, material: 'crate', w: 56, h: 42, hp: 54 })
    ])
  }),
  'colony-multiroute': Object.freeze({ id: 'colony-three-storeys-v130', height: 1080,
    elevations: Object.freeze([[300, 160], [470, 636], [570, 916]]),
    shafts: Object.freeze([
      Object.freeze({ id: 'colony-habitat-lift-v130', label: 'HABITAT', x: 1040, nodeIds: ['colony-hab-high', 'colony-street-a', 'colony-utility-a'], w: 144 }),
      Object.freeze({ id: 'colony-security-lift-v130', label: 'SÉCURITÉ', nodeIds: ['colony-security-high', 'colony-security', 'colony-security-low'], w: 144 })
    ]),
    rearNodes: Object.freeze(['colony-street-a', 'colony-hab-high', 'colony-med-high', 'colony-tunnels', 'colony-security-high']),
    scenery: Object.freeze([
      Object.freeze({ nodeId: 'colony-comms-high', offsetX: 65, material: 'glass', w: 18, h: 106, hp: 24 }),
      Object.freeze({ nodeId: 'colony-utility-a', offsetX: 72, material: 'panel', w: 24, h: 64, hp: 46 }),
      Object.freeze({ nodeId: 'colony-security-low', offsetX: -95, material: 'crate', w: 56, h: 42, hp: 54 })
    ])
  })
});

export function verticalElevationV130(profile, y) {
  if (!Number.isFinite(y) || !profile) return y;
  const points = profile.elevations;
  let pair = 0;
  while (pair < points.length - 2 && y > points[pair + 1][0]) pair++;
  const [a, b] = [points[pair], points[pair + 1]];
  return a[1] + (y - a[0]) * (b[1] - a[1]) / (b[0] - a[0]);
}

export function isStandardVerticalMissionV130(plan, options = {}) {
  const profile = VERTICAL_LEVEL_PROFILES_V130[plan?.templateId];
  if (!profile || options.verticalWorldV130 === false || options.editorProject || options.qaMode || options.testMode
    || plan?.verticalWorldV130?.enabled === false || /qa|fixture|editor|custom|cargo-brutal/i.test(`${plan?.campaign?.id || ''}:${plan?.signature || ''}`)) return false;
  if (plan?.verticalWorldV130?.schema === 130) return true;
  return plan?.schemaVersion === 52 && plan.validation?.valid && plan.routeRuntime?.source === 'mission-template-v52'
    && plan.dimensions?.width === 5200 && plan.dimensions?.height <= 650
    && String(plan.signature).split(':').length === 2
    && profile.shafts.every(shaft => shaft.nodeIds.every(id => list(plan.graph?.nodes).some(node => node.id === id)));
}

export function buildVerticalMissionV130(plan, options = {}) {
  if (!isStandardVerticalMissionV130(plan, options) || plan.verticalWorldV130?.schema === 130) return plan;
  const profile = VERTICAL_LEVEL_PROFILES_V130[plan.templateId];
  const point = value => ({ ...value, y: verticalElevationV130(profile, value.y) });
  const bottomRect = value => ({ ...value, y: verticalElevationV130(profile, value.y + value.h) - value.h });
  const nodes = plan.graph.nodes.map(point), nodeMap = new Map(nodes.map(node => [node.id, node]));
  const platforms = plan.geometry.platforms.map(point);
  const ladders = plan.geometry.ladders.map(connector => ({ ...connector, y: verticalElevationV130(profile, connector.y),
    h: verticalElevationV130(profile, connector.y + connector.h - 22) - verticalElevationV130(profile, connector.y) + 22 }));
  const geometry = { ...plan.geometry, platforms, ladders, doors: list(plan.geometry.doors).map(bottomRect),
    vents: list(plan.geometry.vents).map(bottomRect) };
  const shafts = profile.shafts.map(shaft => {
    const stopNodes = shaft.nodeIds.map(id => nodeMap.get(id));
    const centerX = shaft.x ?? Math.round(stopNodes.reduce((sum, node) => sum + node.x, 0) / stopNodes.length);
    return { ...shaft, x: centerX - shaft.w / 2, stops: stopNodes.map(node => ({ id: node.id, y: node.y, zoneId: node.zoneId })) };
  });
  const hazards = plan.hazards.map(bottomRect);
  const routeNodes = list(plan.routeRuntime.routeNodes).map(point);
  const rearEntrancesV130 = profile.rearNodes.map(id => nodeMap.get(id)).map(node => ({
    id: `${node.id}-rear-v130`, nodeId: node.id, zoneId: node.zoneId,
    x: node.x - 38, y: node.y - 116, w: 76, h: 116, floorY: node.y
  }));
  const destructibleSceneryV130 = profile.scenery.map((scenery, index) => {
    const node = nodeMap.get(scenery.nodeId);
    return { ...scenery, id: `${profile.id}-scenery-${index + 1}`, zoneId: node.zoneId,
      x: node.x + scenery.offsetX, y: node.y - scenery.h, plane: 'gameplay' };
  });
  // A back-wall doorway and a breakable prop belong beside a shaft, never in
  // its swept opening. These placements fit the explicit 150px landings.
  for (const rectangle of [...rearEntrancesV130, ...destructibleSceneryV130]) {
    for (const shaft of shafts) {
      if (rectangle.x + rectangle.w > shaft.x && rectangle.x < shaft.x + shaft.w)
        rectangle.x = shaft.x - rectangle.w - 36;
    }
  }
  const result = { ...plan, dimensions: { ...plan.dimensions, height: profile.height }, graph: { ...plan.graph, nodes }, geometry,
    anchors: Object.fromEntries(Object.entries(plan.anchors).map(([id, anchor]) => [id, point(anchor)])), hazards,
    // Water volumes keep their depth and remain attached to their supporting deck.
    aquaticHabitats: list(plan.aquaticHabitats).map(habitat => ({ ...habitat, y: bottomRect(habitat).y })),
    routeRuntime: { ...plan.routeRuntime, platforms, ladders, hazards, routeNodes,
      verticalSpan: profile.elevations.at(-1)[1] - profile.elevations[0][1], maxTier: profile.elevations.length },
    verticalWorldV130: { schema: 130, enabled: true, profileId: profile.id, shafts,
      elevations: profile.elevations.map(([, elevation]) => elevation), originalSignature: plan.signature,
      originalPlatforms: plan.geometry.platforms, originalProfile: profile }, rearEntrancesV130, destructibleSceneryV130 };
  const checks = [validateMissionTopologyV52(result), validateMissionPhysicalTopologyV57(result), validateMissionTopologyV58(result)];
  const errors = checks.flatMap(check => check.errors || []);
  if (errors.length) throw new Error(`Vertical mission V130: ${errors.join('; ')}`);
  result.validation = { ...plan.validation, valid: true, physicalValid: true, roomCoherenceValid: true,
    verticalWorldV130: { valid: true, floors: profile.elevations.length, verticalSpan: result.routeRuntime.verticalSpan } };
  return result;
}
