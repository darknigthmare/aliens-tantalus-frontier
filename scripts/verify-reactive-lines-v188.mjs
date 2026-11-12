import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CAMPAIGNS, WORLDS } from '../src/content.js';
import { createDefaultSave, migrateSave, beginOperation, resolveOperation } from '../src/save.js';
import { applyCampaignConsequence } from '../src/campaign-consequences.js';
import { REACTIVE_TRIGGERS_V188, REACTIVE_LINES_V188, detectReactiveTriggersV188, selectReactiveLinesV188,
  normalizeReactiveLinesV188 } from '../src/reactive-lines-v188.js';

test('three triggers, two profiles, two languages', () => {
  assert.deepEqual(REACTIVE_TRIGGERS_V188, ['mission-failed', 'colonist-dead', 'returned-injured']);
  for (const trigger of REACTIVE_TRIGGERS_V188) for (const profile of ['human', 'synthetic']) for (const language of ['fr', 'en'])
    assert.ok(REACTIVE_LINES_V188[trigger][profile][language].length > 20, `${trigger}/${profile}/${language}`);
});

function failedRelay() {
  const save = createDefaultSave(); save.needsPlayerCreationV84 = false;
  const campaign = CAMPAIGNS.find(entry => entry.id === 'special-archive-relay');
  const world = WORLDS.find(entry => entry.id === campaign.worldId);
  const { operation } = beginOperation(save, campaign, world);
  const before = structuredClone(save);
  assert.equal(resolveOperation(save, { success: false, reason: 'failure' }).ok, true);
  applyCampaignConsequence(save, campaign, world, { success: false });
  return { before, after: save, operation };
}

test('the real failed operation fires mission-failed and returned-injured; lines are not repeated within 3 days', () => {
  const { before, after, operation } = failedRelay();
  const triggers = detectReactiveTriggersV188(before, after, operation, { success: false });
  assert.ok(triggers.some(entry => entry.trigger === 'mission-failed'));
  assert.ok(triggers.some(entry => entry.trigger === 'returned-injured'), 'the lead returns injured');
  const lines = selectReactiveLinesV188(after, triggers, { operation, language: 'en' });
  assert.ok(lines.length >= 2); assert.ok(lines.every(line => /[a-z]/.test(line.text)));
  assert.equal(after.reactiveLinesV188.said.length, lines.length);
  assert.equal(selectReactiveLinesV188(after, triggers.filter(entry => entry.crewId), { operation }).length, 0, 'same member, same trigger, same day');
  after.clock.day += 3;
  assert.equal(selectReactiveLinesV188(after, triggers.filter(entry => entry.crewId), { operation }).length, 1, 'allowed again after 3 days');
});

test('colonist loss is the population drop of the operation world; synthetic profile is used', () => {
  const operation = { crewIds: ['a'], worldId: 'w' };
  const before = { galaxy: { worldState: { w: { population: 500 } } }, crew: [{ id: 'a', status: 'active' }] };
  const after = { galaxy: { worldState: { w: { population: 420 } } }, crew: [{ id: 'a', status: 'active' }], clock: { day: 4 } };
  const triggers = detectReactiveTriggersV188(before, after, operation, { success: true });
  assert.deepEqual(triggers, [{ trigger: 'colonist-dead' }]);
  const [line] = selectReactiveLinesV188(after, triggers, { operation, isSynthetic: () => true });
  assert.equal(line.profile, 'synthetic'); assert.equal(line.text, REACTIVE_LINES_V188['colonist-dead'].synthetic.fr);
});

test('memory migrates additively and drops malformed entries; app wires the lines', () => {
  assert.deepEqual(createDefaultSave().reactiveLinesV188, { schema: 188, said: [] });
  assert.deepEqual(migrateSave({ schema: 52 }).reactiveLinesV188, { schema: 188, said: [] });
  assert.deepEqual(normalizeReactiveLinesV188({ said: [{ crewId: 'x', trigger: 'mission-failed', day: 2 }, { crewId: 1 }] }).said,
    [{ crewId: 'x', trigger: 'mission-failed', day: 2 }]);
  const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  assert.match(app, /detectReactiveTriggersV188\(saveSystem\.data, candidate, operation/);
});
