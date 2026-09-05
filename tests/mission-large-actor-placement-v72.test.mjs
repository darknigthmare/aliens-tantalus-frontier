import test from 'node:test';
import assert from 'node:assert/strict';
import { CAMPAIGNS, WORLDS, LEVEL_SEEDS } from '../src/content.js';
import { buildMissionLevelV52, MISSION_TEMPLATE_IDS_V52 } from '../src/mission-levels-v52.js';
import { findLargeMissionActorPlacementV72, largeMissionActorFitsV72 } from '../src/mission-large-actor-placement-v72.js';

test('les trois templates offrent une surface royale libre et reliée au graphe, sans réduire336×268px', () => {
  const actor = { w: 336, h: 268.28125 };
  for (const templateId of MISSION_TEMPLATE_IDS_V52) {
    for (let variant = 0; variant < 12; variant += 1) {
      const plan = buildMissionLevelV52({ campaign: CAMPAIGNS[variant], world: WORLDS[variant % WORLDS.length], levelSeeds: LEVEL_SEEDS, templateId, variant });
      const anchor = plan.anchors.boss || plan.anchors['objective-primary'];
      const geometry = { platforms: plan.geometry.platforms, doors: plan.geometry.doors, ...plan.dimensions };
      const placement = findLargeMissionActorPlacementV72(actor, geometry, anchor);
      assert.ok(placement, `${templateId}:${variant}`);
      assert.equal(largeMissionActorFitsV72({ ...actor, ...placement }, geometry), true);
      assert.ok(plan.geometry.platforms.some((platform) => platform.id === placement.surfaceId && (platform.nodeId || platform.edgeId)));
      assert.equal(placement.y + actor.h, placement.groundY);
    }
  }
});

test('une ouverture trop basse est refusée au lieu de réduire la reine ou de la pousser à travers', () => {
  const actor = { x: 200, y: 30, w: 336, h: 268.28125 };
  assert.equal(largeMissionActorFitsV72(actor, { width: 1000, height: 600, doors: [], platforms: [{ x: 0, y: 170, w: 800, h: 20 }] }), false);
  assert.equal(findLargeMissionActorPlacementV72(actor, { width: 1000, height: 190, doors: [], platforms: [{ id: 'low-room', x: 0, y: 180, w: 1000, h: 10 }] }, { x: 350, y: 180 }), null);
});
