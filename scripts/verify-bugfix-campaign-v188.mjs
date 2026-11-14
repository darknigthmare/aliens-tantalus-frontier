// V188 bug hunt, zone "campaign continuation and robustness": regression tests.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fixture } from './engine-host-v188.mjs';
import { QZ17_CAMPAIGN_ID_V188 } from '../src/mission-depth-v188.js';
import { createDefaultSave, migrateSave } from '../src/save.js';
import { resolveM577ManifestV188, interludeDueV188, startInterludeV188, normalizeStoryCampaignV188 } from '../src/story-campaign-v188.js';
import { colonySnapshotV188, investColonySiteV188, createColonyV188 } from '../src/colony-reconstruction-v188.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const app = read('src/app.js');
const functionBody = name => { const start = app.indexOf(`function ${name}(`); assert.ok(start >= 0, name); return app.slice(start, app.indexOf('\nfunction ', start + 10)); };

test('Act III: a tab closed during CIN-31 leaves the interlude due; the briefing table resumes CIN-31 then the interlude', () => {
  const save = createDefaultSave(1);
  save.galaxy.completedCampaignIds.push('special-archive-relay', 'special-apc-convoy', 'special-c12-horde');
  save.storyCampaignV188.m577Manifest = { containers: 1, colonists: 4, resolved: false };
  assert.equal(resolveM577ManifestV188(save, 'world-05-lethe'), true);
  // Reload here: the resolved manifest is durable but no interlude was recorded.
  const reloaded = migrateSave(JSON.parse(JSON.stringify(save)));
  assert.equal(interludeDueV188(reloaded), true, 'the interlude is still due after a reload');
  const body = functionBody('markStoryDebriefOnViewV188');
  const resume = body.indexOf('if (interludeDueV188(saveSystem.data))');
  assert.ok(resume > body.indexOf("doneV188.includes('special-c12-horde')"), 'checked after the first-time manifest resolution');
  assert.ok(resume < body.indexOf("doneV188.includes('special-black-cocoon')"), 'and before Act IV, which must not replace it');
  assert.match(body.slice(resume, resume + 400), /playStoryCinematicV188\('cin-31'[^]*\.then\(startInterludeFlowV188\)/);
  assert.match(body, /interludeResumePendingV188 = true;[^]*cin-31/, 'a second view switch during CIN-31 does not start it twice');
  // Starting it once makes it no longer due (no second CIN-40).
  const crisis = startInterludeV188(reloaded, (target, options) => (target.hub.activeCrisis = { id: 'crisis-test', kind: options.kind, deck: options.deck, roomId: options.roomId, resolved: false }));
  assert.equal(crisis.id, 'crisis-test');
  assert.equal(interludeDueV188(reloaded), false);
  assert.equal(normalizeStoryCampaignV188(reloaded.storyCampaignV188).interlude.phase, 'alert');
});

test('Ending reached: the ending theme survives the cinematic that closes on the briefing table', () => {
  assert.match(app, /function viewAudioSceneV188\(name\) \{\s*return \['operations', 'command'\]\.includes\(name\) && storyEndingReachedV188\(saveSystem\.data\) \? 'ending'/);
  assert.match(functionBody('playStoryCinematicV188'), /audio\.setScene\(viewAudioSceneV188\(activeView\)\)/);
  assert.doesNotMatch(functionBody('playStoryCinematicV188'), /resolveViewAudioSceneV77\(activeView\)/);
});

test('Reconstruction table: a pending site shows the level being validated, costs and toasts use player labels', () => {
  const save = createDefaultSave(1);
  save.galaxy.completedCampaignIds.push('special-archive-relay');
  Object.assign(save.galaxy.resources, { credits: 5000, alloy: 500, research: 50 });
  save.colonyV188 = createColonyV188();
  assert.equal(investColonySiteV188(save, 'infirmary').ok, true);
  const infirmary = colonySnapshotV188(save, 'fr').sites.find(entry => entry.id === 'infirmary');
  assert.equal(infirmary.pending, true);
  assert.equal(infirmary.pendingLabel, 'Triage stable', 'the paid level, not the next unpaid one');
  assert.equal(colonySnapshotV188(save, 'en').sites.find(entry => entry.id === 'infirmary').pendingLabel, 'Stable triage');
  assert.equal(colonySnapshotV188(save, 'fr').sites.find(entry => entry.id === 'walls').pendingLabel, null);
  const render = functionBody('renderColonyReconstructionV188');
  assert.match(render, /entry\.pending \? `\$\{en \? 'AWAITING' : 'EN ATTENTE'\} · \$\{entry\.pendingLabel\}`/);
  assert.match(render, /formatCost\(entry\.next\.cost\)/, 'resource names are the game labels, not save keys');
  assert.match(app, /colonySiteV188\(colonyChangeV188\.validated\)/);
  assert.match(app, /colonySiteV188\(colonyChangeV188\.damaged\)/);
});

test('Mission resume: a damaged depthV188 record (null enemy entries) never throws', async () => {
  const { engine } = await fixture({ campaign: { id: QZ17_CAMPAIGN_ID_V188, templateId: 'ship-interior-vertical', worldId: 'world-05-lethe' }, seed: 7 });
  const state = engine.captureResumeState();
  assert.equal(state.depthV188.section, 'qz17-cargo-hold');
  for (const enemies of [[null], [null, 'x', 4, { id: 'none', z: -20 }], 'garbage', null]) {
    assert.doesNotThrow(() => engine.applyResumeState({ ...state, depthV188: { ...state.depthV188, enemies } }), JSON.stringify(enemies));
  }
  assert.doesNotThrow(() => engine.applyResumeState({ ...state, depthV188: 'garbage' }));
});

test('migrateSave: every V188 additive field missing or malformed gives sane defaults without throwing', () => {
  const garbage = [undefined, null, 0, -1, NaN, '', 'x', true, [], [null], {}, { a: null }];
  const valid = createDefaultSave(1);
  const paths = [['storyCampaignV188'], ['storyCampaignV188', 'interlude'], ['storyCampaignV188', 'm577Manifest'], ['storyCampaignV188', 'cinematicsSeen'],
    ['colonyV188'], ['colonyV188', 'sites'], ['colonyV188', 'sites', 'walls'], ['hub', 'depthV188'], ['portMeridienV90'], ['portMeridienV90', 'z'],
    ['settings', 'colorblindV188'], ['settings', 'textScaleV188'], ['settings', 'keyBindingsV188'], ['settings', 'customDifficultyV188'],
    ['settings', 'crewPermadeathV188'], ['player', 'originV188'], ['reactiveLinesV188']];
  for (const path of paths) for (const value of garbage) {
    const save = structuredClone(valid); let target = save;
    for (const key of path.slice(0, -1)) { if (!target[key] || typeof target[key] !== 'object') target[key] = {}; target = target[key]; }
    if (value === undefined) delete target[path.at(-1)]; else target[path.at(-1)] = value;
    let out; assert.doesNotThrow(() => { out = migrateSave(save); }, `${path.join('.')}=${JSON.stringify(value)}`);
    assert.equal(out.storyCampaignV188.schema, 188); assert.ok(Array.isArray(out.storyCampaignV188.cinematicsSeen));
    assert.equal(Object.keys(out.colonyV188.sites).length, 7);
    assert.ok(['off', 'protanopia', 'deuteranopia', 'tritanopia'].includes(out.settings.colorblindV188) || typeof out.settings.colorblindV188 === 'string');
    assert.ok(Number.isFinite(out.settings.textScaleV188));
    assert.equal(typeof out.settings.crewPermadeathV188, 'boolean');
    assert.ok(out.hub.depthV188 === null || Number.isFinite(out.hub.depthV188.z));
    assert.doesNotThrow(() => JSON.stringify(out));
  }
  for (const value of [null, undefined, 1, 'save', [], {}]) assert.doesNotThrow(() => migrateSave(value));
});
