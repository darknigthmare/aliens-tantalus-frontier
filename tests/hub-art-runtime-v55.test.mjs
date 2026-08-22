import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
  DROPSHIP_HANGAR_ART_V55,
  ELECTRICAL_HAZARD_ART_V55,
  HUB_ART_ASSETS_V55,
  HUB_ART_LEVEL_V55,
  HUB_ART_RENDER_PHASES_V55,
  isInsideHubArtLevelV55,
  requireHubArtRuntimeV55
} from '../src/hub-art-runtime-v55.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

test('le hangar v55 consomme quatre bitmaps dédiés et physiquement présents', () => {
  assert.equal(HUB_ART_ASSETS_V55.length, 4);
  assert.equal(new Set(HUB_ART_ASSETS_V55).size, HUB_ART_ASSETS_V55.length);
  for (const asset of HUB_ART_ASSETS_V55) {
    assert.match(asset, /^\/assets\/openai\//);
    assert.ok(existsSync(path.join(ROOT, asset.slice(1))), asset);
  }
  assert.notEqual(DROPSHIP_HANGAR_ART_V55.overhead.asset, DROPSHIP_HANGAR_ART_V55.foreground.asset);
  assert.notEqual(DROPSHIP_HANGAR_ART_V55.dropship.asset, ELECTRICAL_HAZARD_ART_V55.asset);
});

test('l ordre de rendu est strictement back puis actors puis front', () => {
  assert.deepEqual(DROPSHIP_HANGAR_ART_V55.renderPhases, HUB_ART_RENDER_PHASES_V55);
  const phases = DROPSHIP_HANGAR_ART_V55.renderStack.map((entry) => entry.phase);
  const collapsed = phases.filter((phase, index) => phase !== phases[index - 1]);
  assert.deepEqual(collapsed, ['back', 'actors', 'front']);

  const actorsIndex = DROPSHIP_HANGAR_ART_V55.renderStack.indexOf(DROPSHIP_HANGAR_ART_V55.actors);
  assert.ok(actorsIndex > 0 && actorsIndex < DROPSHIP_HANGAR_ART_V55.renderStack.length - 1);
  assert.ok(DROPSHIP_HANGAR_ART_V55.renderStack.slice(0, actorsIndex).every((entry) => entry.phase === 'back'));
  assert.ok(DROPSHIP_HANGAR_ART_V55.renderStack.slice(actorsIndex + 1).every((entry) => entry.phase === 'front'));
  assert.equal(DROPSHIP_HANGAR_ART_V55.actors.kind, 'runtime-slot');
  assert.ok(!('asset' in DROPSHIP_HANGAR_ART_V55.actors));
});

test('ancres visuelles et collisions physiques restent dans le niveau du hangar', () => {
  const contract = DROPSHIP_HANGAR_ART_V55;
  assert.deepEqual(contract.level, { width: 1280, height: 720, floorY: 624 });

  for (const layer of [contract.overhead, contract.dropship, contract.electricalHazard, contract.foreground]) {
    assert.ok(isInsideHubArtLevelV55(layer.renderBounds), `${layer.id} render bounds`);
    assert.ok(layer.anchor.x >= 0 && layer.anchor.x <= HUB_ART_LEVEL_V55.width, `${layer.id} anchor x`);
    assert.ok(layer.anchor.y >= 0 && layer.anchor.y <= HUB_ART_LEVEL_V55.height, `${layer.id} anchor y`);
  }

  for (const physical of [contract.dropship, contract.electricalHazard]) {
    assert.ok(isInsideHubArtLevelV55(physical.collisionBounds), `${physical.id} collision bounds`);
    assert.equal(physical.collisionBounds.y + physical.collisionBounds.h, HUB_ART_LEVEL_V55.floorY);
    assert.ok(physical.anchor.x >= physical.collisionBounds.x);
    assert.ok(physical.anchor.x <= physical.collisionBounds.x + physical.collisionBounds.w);
    assert.equal(physical.anchor.y, HUB_ART_LEVEL_V55.floorY);
  }

  assert.equal(ELECTRICAL_HAZARD_ART_V55.kind, 'electrical');
  assert.ok(ELECTRICAL_HAZARD_ART_V55.damage > 0);
  assert.ok(ELECTRICAL_HAZARD_ART_V55.stunSeconds > 0);
  assert.ok(ELECTRICAL_HAZARD_ART_V55.damageIntervalSeconds > 0);
});

test('le contrat refuse toute scène monolithique et tout fallback implicite', () => {
  const contract = requireHubArtRuntimeV55('dropship-hangar');
  assert.equal(contract.composition, 'modular');
  assert.equal(contract.allowsMonolith, false);
  assert.equal(contract.allowsFallback, false);
  assert.ok(!('background' in contract));
  assert.ok(!('fallback' in contract));
  for (const asset of HUB_ART_ASSETS_V55) {
    assert.doesNotMatch(asset, /\/hub\/rooms\//);
    assert.doesNotMatch(asset, /tantalus-hub-.*deck|tantalus-base-environment/);
  }
  assert.throws(() => requireHubArtRuntimeV55('bridge'), /No v55 modular hub art contract/);
});
