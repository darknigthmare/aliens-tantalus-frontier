// Regression tests for the special-mode playthrough bug hunt (2026-11-15): APC
// convoy, C-12, mecha, ecosystem, legacy, cargo-brutal, black cocoon and
// Alpha/Bravo played in Chromium to extraction, debrief, hub, reload and the
// next launch. Scope excludes the deferred Forge.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createDefaultSave, migrateSave, beginOperation } from '../src/save.js';
import { advanceGalaxy } from '../src/world-crisis.js';
import { CAMPAIGNS, WORLDS } from '../src/content.js';
import { rebindDeploymentOperationV188 } from '../src/mission-debrief-v188.js';

const campaign = id => CAMPAIGNS.find(entry => entry.id === id);
const worldOf = entry => WORLDS.find(world => world.id === entry.worldId) || WORLDS[0];
const appSource = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
const functionBody = (source, name) => {
  const start = source.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `${name} exists`);
  return source.slice(start, source.indexOf('\n}\n', start));
};

// P0 (Talos contre le Titan, and every V131 chapter): the extraction screen read
// « BILAN NON VALIDÉ · operation-terminal-identity-v131 » and nothing was paid.
// launchCampaign wrote the level seed and signature on the operation returned by
// beginOperation, but simulateElapsed → advanceGalaxy had rebuilt the save root,
// so that record was detached and the saved operation never carried them.
test('launch: the level signature is written on the live operation after deployment time elapses', () => {
  const save = migrateSave(createDefaultSave(1), 1);
  const entry = campaign('special-titan-v131');
  let deployment = beginOperation(save, entry, worldOf(entry));
  advanceGalaxy(save, { hours: 3, advanceClock: false });
  assert.notEqual(deployment.operation, save.strategy.currentOperation, 'the galaxy step detaches the returned record (cause)');
  deployment = rebindDeploymentOperationV188(deployment, save);
  Object.assign(deployment.operation, { levelSeedId: 'seed', missionLevelSignature: 'signature' });
  assert.equal(save.strategy.currentOperation.missionLevelSignature, 'signature');
  assert.equal(save.strategy.currentOperation.levelSeedId, 'seed');
  // A different operation is never adopted.
  const other = { operation: { id: 'operation-99-other' } };
  assert.equal(rebindDeploymentOperationV188(other, save), other);

  const body = functionBody(appSource, 'launchCampaign');
  const elapsed = body.indexOf('simulateElapsed(before)'), rebind = body.indexOf('rebindDeploymentOperationV188(deployment, saveSystem.data)');
  const assign = body.indexOf('Object.assign(deployment.operation');
  assert.ok(elapsed >= 0 && rebind > elapsed && assign > rebind, 'launchCampaign rebinds between the clock step and the signature write');
});
