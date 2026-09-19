import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { collectMissionDeckRunsV87, buildMissionSupportSpansV87 } from '../src/mission-structure-layout-v87.js';
import { buildMissionLevelV52, MISSION_LEVEL_TEMPLATES_V52, stableMissionHashV52 } from '../src/mission-levels-v52.js';

const deck = (id, x, y, w = 160, h = 20, extra = {}) => ({ id, x, y, w, h, art: 'catwalk', ...extra });
const freezeRecords = records => Object.freeze(records.map(record => Object.freeze(record)));
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

function seededOptions(templateId, seed) {
  return {
    templateId,
    campaign: { id: 'structure-regression', mode: 'FRONTIER', objective: 'recover data', worldId: 'structure-world' },
    world: { id: 'structure-world', danger: 5, biomes: ['industrial'] },
    levelSeed: { id: `structure-seed-${seed}`, seed, worldId: 'structure-world', objective: 'recover data' }
  };
}

// Historical V86 draws: consume both random samples even when the new authored
// ship/colony elevation no longer uses the second sample. No runtime mutation.
function legacyNodes(template, seed) {
  let state = stableMissionHashV52(`${seed.seed}:${seed.id}:${template.id}`) || 0x9e3779b9;
  const random = () => {
    state += 0x6d2b79f5;
    let value = Math.imul(state ^ state >>> 15, state | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
  return template.nodes.map(node => {
    const fixed = node.anchor === 'spawn' || node.anchor === 'extraction';
    return { ...node,
      x: node.x + (fixed ? 0 : Math.round((random() - 0.5) * 24)),
      y: node.y + (fixed ? 0 : Math.round((random() - 0.5) * 10)) };
  });
}

function identityFingerprint(plan) {
  // V87 intentionally replaces the two ambiguous planet evacuation slopes
  // with separated ladders. Undo exactly that reviewed authoring change only
  // for comparison with the historical random/gameplay fingerprint below.
  const edges = plan.graph.edges.map(edge => {
    if (plan.templateId !== 'planet-exterior' || !['planet-e12', 'planet-e17'].includes(edge.id)) return edge;
    const { connectorOffsetFromTo, ...historical } = edge;
    return { ...historical, kind: 'slope' };
  });
  const edgeSignature = edges.map(edge => `${edge.from}>${edge.to}:${edge.kind}`).sort().join('|');
  const routeSignature = plan.graph.routes.map(route => route.nodeIds.join('>')).sort().join('|');
  return {
    signature: plan.signature,
    topologySignature: plan.templateId === 'planet-exterior'
      ? `${plan.templateId}:${stableMissionHashV52(`${edgeSignature}::${routeSignature}`).toString(36)}`
      : plan.topologySignature,
    levelSeed: plan.levelSeed,
    nodes: plan.graph.nodes.map(({ id, x, width, anchor, zoneId }) => ({ id, x, width, anchor, zoneId })),
    edges,
    routes: plan.graph.routes,
    // The supporting platform may change when formerly stepped surfaces become
    // coplanar. Its attachment is checked separately, never silently discarded.
    hazards: plan.hazards.map(({ y, surfacePlatformId, ...gameplay }) => gameplay),
    events: plan.events,
    spawns: plan.spawns
  };
}

test('V87 fusionne les recouvrements coplanaires sans changer les colliders sources', () => {
  const platforms = freezeRecords([
    deck('right', 160, 200, 180, 22), deck('left', 20, 200, 190, 20),
    deck('inside', 80, 200, 30, 16), deck('touching', 340, 200, 100, 24)
  ]);
  const before = structuredClone(platforms);
  const runs = collectMissionDeckRunsV87(platforms);
  assert.equal(runs.length, 1);
  assert.deepEqual({ x: runs[0].x, y: runs[0].y, w: runs[0].w, h: runs[0].h }, { x: 20, y: 200, w: 420, h: 24 });
  assert.deepEqual(platforms, before);
  assert.ok(platforms.every(platform => platform !== runs[0]));
  runs[0].w = 1;
  assert.deepEqual(platforms, before, 'the render run must not alias a physics record');
});

test('V87 ne crée ni pont sur un trou, ni raccord entre étages, matériaux ou ascenseur', () => {
  const platforms = freezeRecords([
    deck('left', 0, 200, 100), deck('gap-right', 101, 200, 100),
    deck('other-height', 40, 201, 100), deck('other-art', 20, 200, 100, 20, { art: 'ledge' }),
    deck('moving', 95, 200, 20, 20, { kind: 'lift' }),
    deck('floor', 0, 500, 500, 80, { floor: true })
  ]);
  const runs = collectMissionDeckRunsV87(platforms);
  assert.equal(runs.length, 4);
  assert.deepEqual(runs.filter(run => run.y === 200 && run.art === 'catwalk').map(run => [run.x, run.w]), [[0, 100], [101, 100]]);
  assert.ok(!runs.some(run => run.id === 'moving' || run.floor));
  assert.equal(runs.find(run => run.id === 'other-height').y, 201);
  assert.equal(runs.find(run => run.id === 'other-art').art, 'ledge');
});

test('V87 ignore les rectangles invalides et préserve les entrées immuables', () => {
  const platforms = freezeRecords([
    deck('valid', 0, 100), deck('nan', NaN, 100), deck('infinite', 0, Infinity),
    deck('zero-width', 0, 100, 0), deck('negative-height', 0, 100, 20, -1)
  ]);
  assert.deepEqual(collectMissionDeckRunsV87(platforms).map(run => run.id), ['valid']);
  assert.deepEqual(buildMissionSupportSpansV87(platforms), []);
  assert.deepEqual(collectMissionDeckRunsV87([]), []);
  assert.deepEqual(buildMissionSupportSpansV87([]), []);
});

test('V87 les montants relient le dessous d’un pont au premier support fixe réel', () => {
  const platforms = freezeRecords([
    deck('upper', 0, 100, 800), deck('middle', 0, 300, 400, 24),
    deck('floor', 0, 600, 800, 80, { floor: true }),
    deck('moving', 0, 180, 800, 20, { kind: 'lift' })
  ]);
  const before = structuredClone(platforms);
  const spans = buildMissionSupportSpansV87(platforms);
  assert.ok(spans.length >= 4);
  const sources = new Map(platforms.map(platform => [platform.id, platform]));
  for (const span of spans) {
    const upper = sources.get(span.upperId);
    const lower = sources.get(span.lowerId);
    assert.ok(upper && lower);
    assert.notEqual(upper.kind, 'lift');
    assert.notEqual(lower.kind, 'lift');
    assert.equal(span.y, upper.y + upper.h);
    assert.equal(span.y + span.h, lower.y);
    assert.equal(span.w, 18);
    assert.ok(span.x >= upper.x && span.x + span.w <= upper.x + upper.w);
    assert.ok(span.x >= lower.x && span.x + span.w <= lower.x + lower.w);
    assert.ok(span.h >= 28 && ['x', 'y', 'w', 'h'].every(key => Number.isFinite(span[key])));
  }
  assert.equal(spans.find(span => span.upperId === 'upper' && span.x === 19).lowerId, 'middle');
  assert.ok(spans.some(span => span.upperId === 'upper' && span.lowerId === 'floor'));
  assert.deepEqual(platforms, before);
});

test('V87 aucun montant flottant quand le support est absent, décalé ou trop proche', () => {
  const platforms = freezeRecords([
    deck('unsupported', 0, 100, 120), deck('distant', 500, 300, 120),
    deck('too-close', 0, 139, 120), deck('moving', 0, 500, 120, 20, { kind: 'lift' })
  ]);
  assert.deepEqual(buildMissionSupportSpansV87(platforms), []);
});

test('V87 cinquante graines par carte artificielle gardent les étages auteurs et un déplacement ancien de cinq pixels maximum', () => {
  for (const templateId of ['ship-interior-vertical', 'colony-multiroute']) {
    const template = MISSION_LEVEL_TEMPLATES_V52[templateId];
    const authored = new Map(template.nodes.map(node => [node.id, node]));
    for (let seed = 1; seed <= 50; seed++) {
      const options = seededOptions(templateId, seed);
      const plan = buildMissionLevelV52(options);
      const legacy = new Map(legacyNodes(template, plan.levelSeed).map(node => [node.id, node]));
      assert.equal(plan.validation.valid, true, `${templateId}:${seed}`);
      assert.equal(plan.signature, `${templateId}:${plan.levelSeed.id}`);
      assert.deepEqual(plan, buildMissionLevelV52(options));
      for (const node of plan.graph.nodes) {
        assert.equal(node.y, authored.get(node.id).y, `${templateId}:${seed}:${node.id}`);
        assert.equal(node.x, legacy.get(node.id).x, 'horizontal placement must retain the same random draw');
        assert.ok(Math.abs(node.y - legacy.get(node.id).y) <= 5);
      }
      for (const hazard of plan.hazards) {
        const surface = plan.geometry.platforms.find(platform => platform.id === hazard.surfacePlatformId);
        assert.ok(surface, `${hazard.id} still has a physical support`);
        assert.equal(hazard.y + hazard.h, surface.y);
      }
      const platforms = plan.geometry.platforms;
      const runs = collectMissionDeckRunsV87(platforms);
      const supports = buildMissionSupportSpansV87(platforms);
      assert.ok(supports.length > 0);
      for (const span of supports) {
        const upper = runs.find(run => run.id === span.upperId);
        const lower = runs.find(run => run.id === span.lowerId);
        assert.ok(upper && lower);
        assert.equal(span.y, upper.y + upper.h);
        assert.equal(span.y + span.h, lower.y);
        assert.ok(span.x >= 0 && span.x + span.w <= plan.dimensions.width);
        assert.ok(span.y >= 0 && span.y + span.h <= plan.dimensions.height);
      }
    }
  }
});

test('V87 les cinquante graines de planète conservent intégralement les anciennes coordonnées', () => {
  const templateId = 'planet-exterior';
  const template = MISSION_LEVEL_TEMPLATES_V52[templateId];
  let displacedNodes = 0;
  for (let seed = 1; seed <= 50; seed++) {
    const plan = buildMissionLevelV52(seededOptions(templateId, seed));
    assert.deepEqual(plan.graph.nodes, legacyNodes(template, plan.levelSeed));
    displacedNodes += plan.graph.nodes.filter((node, index) => node.y !== template.nodes[index].y).length;
  }
  assert.ok(displacedNodes > 0, 'the terrain must not be flattened along with artificial decks');
});

test('V87 les deux raccords de la balise planétaire sont des échelles distinctes et supportées', () => {
  for (let seed = 1; seed <= 50; seed++) {
    const plan = buildMissionLevelV52(seededOptions('planet-exterior', seed));
    const beacon = plan.graph.nodes.find(node => node.id === 'planet-beacon');
    const centers = [];
    for (const [id, expectedOffset] of [['planet-e12', -70], ['planet-e17', 70]]) {
      const edge = plan.graph.edges.find(entry => entry.id === id);
      assert.equal(edge.kind, 'ladder');
      assert.equal(edge.connectorOffsetFromTo, expectedOffset);
      const ladder = plan.geometry.ladders.find(entry => entry.id === id);
      assert.ok(ladder);
      const center = ladder.x + ladder.w / 2;
      assert.equal(center, beacon.x + expectedOffset);
      centers.push(center);
      for (const y of [ladder.y, ladder.y + ladder.h - 22]) {
        assert.ok(plan.geometry.platforms.some(platform => platform.y === y && center >= platform.x && center <= platform.x + platform.w));
      }
      assert.ok(!plan.geometry.platforms.some(platform => platform.edgeId === id && platform.kind === 'terrain-step'));
    }
    assert.equal(centers[1] - centers[0], 140);
  }
});

test('V87 conserve identités de reprise et hasard V86, hors les deux raccords planétaires explicitement corrigés', () => {
  // Captured from git HEAD before this structural patch, not from a rewritten
  // fixture produced by the implementation under test.
  const historical = {
    'ship-interior-vertical': 'baa7eac58573f8134ba48a96c437e6f8f38afa68232536461124ed906dbacc32',
    'colony-multiroute': '8e9328b723432c93a5ee82582607e4acfedad623475a572de2440d3240090fdd',
    'planet-exterior': '41ec3015befea35e7bfe1629bec0a41b243ff65a9cb821dc6903f1dadc1869f1'
  };
  for (const [templateId, expected] of Object.entries(historical)) {
    const fingerprints = Array.from({ length: 50 }, (_, index) => identityFingerprint(buildMissionLevelV52(seededOptions(templateId, index + 1))));
    assert.equal(digest(fingerprints), expected, templateId);
  }
});
