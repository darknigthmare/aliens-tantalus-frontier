import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { STAGED_BEATS_V188, STAGED_BEAT_IDS_V188, stagedBeatDurationV188, InGameStagingV188 } from '../src/ingame-staging-v188.js';
import { markStoryBeatSeenV188, normalizeStoryCampaignV188 } from '../src/story-campaign-v188.js';
import { createDefaultSave, migrateSave } from '../src/save.js';
import { getNpcDialoguePortraitV168 } from '../src/npc-dialogue-portraits-v168.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
function fakeDom() {
  const make = tag => { const node = { tagName: tag, children: [], dataset: {}, hidden: false, textContent: '', attributes: {}, parent: null,
    setAttribute(key, value) { this.attributes[key] = value; }, append(...nodes) { for (const child of nodes) { child.parent = this; this.children.push(child); } },
    remove() { if (this.parent) this.parent.children = this.parent.children.filter(child => child !== this); this.parent = null; } }; return node; };
  return { createElement: make, documentElement: make('HTML') };
}
function timers() { const queue = []; return { queue, setTimer: (fn, ms) => { queue.push({ fn, ms }); return queue.length; }, clearTimer: id => { if (queue[id - 1]) queue[id - 1].fn = () => {}; },
  run() { const next = queue.find(entry => !entry.done); if (next) { next.done = true; next.fn(); } return Boolean(next); } }; }
const target = () => { const listeners = []; return { listeners, addEventListener: (type, fn, capture) => listeners.push({ type, fn, capture }), removeEventListener: (type, fn) => { const i = listeners.findIndex(e => e.fn === fn); if (i >= 0) listeners.splice(i, 1); } }; };

test('staged beats: bilingual lines, known portraits, sensible durations', () => {
  assert.deepEqual(STAGED_BEAT_IDS_V188, ['beat-wake', 'beat-exercise-interrupt', 'beat-port-arrival', 'beat-port-report']);
  for (const beat of Object.values(STAGED_BEATS_V188)) {
    assert.ok(stagedBeatDurationV188(beat.id) >= 7 && stagedBeatDurationV188(beat.id) <= 14, beat.id);
    if (beat.terminal) assert.ok(beat.terminal.fr && beat.terminal.en);
    for (const line of beat.lines) {
      assert.ok(line.text.fr && line.text.en && line.seconds > 0);
      if (line.crewId) assert.ok(getNpcDialoguePortraitV168(line.crewId), line.crewId);
      if (line.sound) assert.match(line.text.fr, /^\[.*\]$/, 'sounds are captioned in brackets');
    }
  }
  assert.match(STAGED_BEATS_V188['beat-wake'].terminal.fr, /CAPSULE 03/, 'the capsule open in CIN-01');
});

test('staging: holds gameplay keys, Enter advances, Escape skips, chrome and grade are restored', async () => {
  const doc = fakeDom(), host = doc.createElement('DIV'), clock = timers(), keys = target(); let held = 0, released = 0;
  const staging = new InGameStagingV188({ document: doc, setTimer: clock.setTimer, clearTimer: clock.clearTimer, target: keys });
  const run = staging.play('beat-wake', { host, onHold: () => { held += 1; }, onRelease: () => { released += 1; } });
  assert.equal(held, 1); assert.equal(doc.documentElement.dataset.ingameStageV188, 'beat-wake'); assert.equal(host.dataset.stageGradeV188, 'hypersleep-start');
  const root = host.children[0]; assert.equal(root.dataset.phase, 'in');
  clock.run(); assert.equal(root.dataset.phase, 'on'); assert.equal(host.dataset.stageGradeV188, 'hypersleep-mid');
  const listener = keys.listeners.find(entry => entry.type === 'keydown'); assert.equal(listener.capture, true);
  let stopped = 0; const press = code => listener.fn({ code, preventDefault() {}, stopImmediatePropagation() { stopped += 1; } });
  press('KeyD'); assert.equal(stopped, 1, 'movement held');
  const subtitle = root.children.find(child => child.dataset && 'line' in child.dataset);
  press('Enter'); assert.equal(subtitle.dataset.line, '1', 'Enter advances');
  press('Escape'); assert.equal(await run, 'skipped'); assert.equal(released, 1);
  assert.equal(doc.documentElement.dataset.ingameStageV188, undefined, 'chrome back'); assert.equal(root.dataset.phase, 'out');
  while (clock.run()) { /* drain cancelled timers, then the cleanup */ } assert.equal(host.children.length, 0, 'overlay removed'); assert.equal(host.dataset.stageGradeV188, undefined);
  assert.equal(keys.listeners.length, 0);
  const complete = staging.play('beat-port-report', { host });
  while (clock.run()) { /* let every line elapse */ }
  assert.equal(await complete, 'complete');
  assert.equal(await staging.play('nope', { host }), 'unavailable');
});

test('staging: beats are recorded once and survive migration additively', () => {
  const save = createDefaultSave();
  assert.deepEqual(save.storyCampaignV188.beatsSeen, []);
  assert.equal(markStoryBeatSeenV188(save, 'beat-wake'), true); assert.equal(markStoryBeatSeenV188(save, 'beat-wake'), false);
  assert.equal(markStoryBeatSeenV188(save, 'cin-00'), false, 'only beat ids');
  assert.deepEqual(migrateSave(JSON.parse(JSON.stringify(save))).storyCampaignV188.beatsSeen, ['beat-wake']);
  assert.deepEqual(normalizeStoryCampaignV188({ beatsSeen: ['beat-x', 4, 'BAD'] }).beatsSeen, ['beat-x']);
});

test('staging: wired at the prologue moments over the live level', () => {
  const app = read('src/app.js'), css = read('styles.css'), sw = read('sw.js');
  assert.match(app, /saveSystem\.data\.onboardingV84\?\.phase === 'wake'\) void playStagedBeatV188\('beat-wake'\)/);
  assert.match(app, /if \(event === 'interrupt'\) void playStagedBeatV188\('beat-exercise-interrupt'\);/);
  assert.match(app, /void playStagedBeatV188\('beat-port-arrival'\)\.then\(\(\) => playStoryCinematicV188\('cin-p3-wren'\)\)/);
  assert.match(app, /void playStagedBeatV188\('beat-port-report'\);/);
  assert.match(app, /onHold: \(\) => \{ hubEngine\.keys\?\.clear\?\.\(\); if \(hubEngine\.player\) hubEngine\.player\.vx = 0; \}/);
  for (const rule of [/\[data-stage-grade-v188="hypersleep-start"\] #hub-canvas \{ filter: brightness\(0\) blur\(12px\); transition: none; \}/,
    /html\[data-ingame-stage-v188\] \[data-panel="hub"\] > :not\(\.hub-level-shell\)/, /\.ingame-stage-v188\[data-reduced-motion="true"\]::before \{ animation: none; \}/]) assert.match(css, rule);
  assert.ok(sw.includes("'/src/ingame-staging-v188.js'"));
});
