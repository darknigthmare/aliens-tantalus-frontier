import test from 'node:test';
import assert from 'node:assert/strict';
import { ARBITER_PROGRAMS_V191, getArbiterArchiveAccessV191 } from '../src/xeno-arbiter-protocols-v191.js';
import { ARBITER_MISSIONS_V190, createArbiterReceiptV190 } from '../src/xeno-arbiter-campaign-v190.js';
import { beginXenoTrialsV96, createXenoTrialsProgressV96, normalizeXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';
import { createXenoTrialsModesProgressV119, normalizeXenoTrialsModesProgressV119 } from '../src/xeno-trials-modes-v119.js';
import { XenoTrialsUiV96 } from '../src/xeno-trials-ui-v96.js';
import { createBuildAssetFilter } from './build-asset-filter.mjs';
import { PUBLIC_XENO_SPRITE_PATHS_V191, publicXenoSpritePathAdmissionV191, verifyXenoSpriteAdmissionsV191 } from './public-xeno-sprite-admissions-v191.mjs';
import { resolve } from 'node:path';

// Return-shaped fixtures isolate the access policy. The browser QA obtains
// and exports all six actual returns through the physical campaign instead.
function archiveFixture(count = 6) {
  const missions = ARBITER_MISSIONS_V190.slice(0, count);
  return { schema: 190, completedCampaignIds: missions.map(m => m.campaignId),
    returns: missions.map((m, i) => ({ campaignId: m.campaignId,
      operationId: `operation-${i + 1}-${m.campaignId}`, receipt: createArbiterReceiptV190(m) })) };
}
const progress = () => normalizeXenoTrialsProgressV96(createXenoTrialsProgressV96());

test('only the eight reviewed sprite sheets pass source admission and the actual release-copy predicate', async () => {
  const root = process.cwd(), prefix = 'assets/openai/sprites/xeno-trials-v191', filter = createBuildAssetFilter(root);
  assert.equal(filter(resolve(root, prefix)), true);
  for (const path of PUBLIC_XENO_SPRITE_PATHS_V191) {
    assert.equal(publicXenoSpritePathAdmissionV191(path), true); assert.equal(filter(resolve(root, path)), true);
  }
  for (const name of ['candidate.png', 'queen-combat-sheet.png', 'defender-special-sheet.png', 'nested/warrior-special-sheet.png']) {
    const path = `${prefix}/${name}`; assert.equal(publicXenoSpritePathAdmissionV191(path), false);
    assert.equal(filter(resolve(root, path)), false);
  }
  assert.deepEqual(await verifyXenoSpriteAdmissionsV191(root), { images: 8, poses: 80, bytes: 11618259 });
});

test('all forty new tickets require the six ordered returns before consuming a serial or touching the simulation economy', () => {
  const before = progress();
  for (const program of ARBITER_PROGRAMS_V191) {
    for (const raw of [undefined, archiveFixture(0), archiveFixture(5), { schema: 190,
      completedCampaignIds: ARBITER_MISSIONS_V190.map(m => m.campaignId), returns: [] }]) {
      const result = beginXenoTrialsV96(before, { playerId: 'warrior', activityV119: { branch: program.branch, id: program.id } },
        { arbiterProgressV190: raw });
      assert.equal(result.applied, false, program.id); assert.equal(result.reason, 'arbiter-archives-locked');
      assert.deepEqual(result.state, before); assert.equal(before.serial, 0); assert.equal(before.pending, null);
    }
  }
});

test('each of forty admitted tickets resolves its own canonical native branch, arena, pressure and stable checkpoint identity', () => {
  const arc = archiveFixture(), base = progress();
  for (const program of ARBITER_PROGRAMS_V191) {
    const result = beginXenoTrialsV96(base, { playerId: 'warrior', stageId: 'containment-deck',
      activityV119: { branch: program.branch, id: program.id } }, { arbiterProgressV190: arc });
    assert.equal(result.applied, true, program.id); assert.equal(result.config.stageId, program.stageId);
    assert.equal(result.config.activityV119.branch, program.branch);
    assert.equal(result.config.hordeV180.protocolId, program.hordeProtocolId || program.id);
    assert.equal(result.state.credits, base.credits); assert.equal(result.state.serial, 1);
    assert.deepEqual(normalizeXenoTrialsProgressV96(JSON.parse(JSON.stringify(result.state))).pending, result.state.pending);
  }
  const wrong = beginXenoTrialsV96(base, { activityV119: { branch: 'on-demand', id: ARBITER_PROGRAMS_V191[0].id } },
    { arbiterProgressV190: arc });
  assert.equal(wrong.applied, false); assert.equal(wrong.reason, 'activity-unavailable');
});

test('legacy programs keep their access and archive completion IDs survive normalization without granting credits', () => {
  for (const activityV119 of [{ branch: 'on-demand', id: 'on-demand' }, { branch: 'horde', id: 'xth180-incoming-1' }]) {
    assert.equal(beginXenoTrialsV96(progress(), { playerId: 'warrior', activityV119 }).applied, true);
  }
  const modes = createXenoTrialsModesProgressV119();
  modes.hordeCleared = ARBITER_PROGRAMS_V191.filter(p => p.branch === 'horde').map(p => p.id);
  modes.operationsCleared = ARBITER_PROGRAMS_V191.filter(p => p.branch === 'operations').map(p => p.id);
  const kept = normalizeXenoTrialsModesProgressV119(JSON.parse(JSON.stringify(modes)));
  assert.deepEqual(kept.hordeCleared, modes.hordeCleared); assert.deepEqual(kept.operationsCleared, modes.operationsCleared);
  const input = progress(), credits = input.credits; input.modesV119 = kept;
  assert.equal(normalizeXenoTrialsProgressV96(input).credits, credits);
});

// Minimal DOM paint/select targets are declared doubles. The actual production
// terminal methods own filtering, paging, access and canonical branch choice.
function terminal(arc = archiveFixture(0), state = progress()) {
  const nodes = new Map(), messages = [], el = key => {
    if (!nodes.has(key)) nodes.set(key, { value: '', hidden: false, disabled: false, innerHTML: '', textContent: '',
      focus() {}, setAttribute() {}, append() {}, replaceChildren() {} });
    return nodes.get(key);
  };
  const ui = Object.create(XenoTrialsUiV96.prototype);
  Object.assign(ui, { active: true, runtime: null, selected: 'warrior', branchV119: 'arbiter-archives',
    selectionStep: 'activities', activityV119: null, programPageV186: 0, unsavedResult: null,
    getProgress: () => state, getCampaignProgress: () => arc, el, root: { querySelector: () => null },
    form: { elements: new Proxy({}, { get: (_, key) => el('select-' + String(key)) }) },
    updateOpponents() {}, updateVariants() {}, renderPreviews() {}, render() {}, closeRuntime() {},
    message: message => messages.push(message) });
  return { ui, el, state, messages };
}

test('the archive directory exposes forty exact IDs in four bounded pages while locked cards cannot select or create a ticket', () => {
  const h = terminal(), seen = [], before = structuredClone(h.state);
  for (let page = 0; page < 4; page++) {
    h.ui.programPageV186 = page; h.ui.renderActivitiesV119(h.state);
    const ids = [...h.el('activity-board').innerHTML.matchAll(/data-xt-activity="([^"]+)"/g)].map(m => m[1]);
    assert.ok(ids.length <= 12); seen.push(...ids);
    for (const id of ids) assert.equal(h.ui.chooseActivityV119(id), false);
    assert.match(h.el('activity-board').innerHTML, /SCELLÉS · TERMINER L’ENQUÊTE ARBITER/);
  }
  assert.deepEqual(seen, ARBITER_PROGRAMS_V191.map(p => p.id)); assert.equal(new Set(seen).size, 40);
  assert.equal(h.ui.activityV119, null); assert.deepEqual(h.state, before);
  assert.equal(getArbiterArchiveAccessV191(archiveFixture(5)).available, false);
});

test('selection and pending restoration keep the archive directory transient while the real ticket remains horde or operations', () => {
  for (const branch of ['horde', 'operations']) {
    const program = ARBITER_PROGRAMS_V191.find(p => p.branch === branch), h = terminal(archiveFixture());
    assert.equal(h.ui.chooseActivityV119(program.id), true); assert.equal(h.ui.branchV119, 'arbiter-archives');
    assert.deepEqual(h.ui.activityV119, { branch, id: program.id });
    const begun = beginXenoTrialsV96(h.state, { playerId: 'warrior', activityV119: h.ui.activityV119 },
      { arbiterProgressV190: archiveFixture() });
    const resumed = terminal(archiveFixture(), begun.state); resumed.ui.restorePendingSelection();
    assert.equal(resumed.ui.branchV119, 'arbiter-archives'); assert.deepEqual(resumed.ui.activityV119, { branch, id: program.id });
    assert.equal(resumed.state.credits, h.state.credits);
  }
});
