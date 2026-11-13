import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { CINEMATICS_V188, CINEMATIC_IDS_V188, CINEMATIC_IMAGES_V188, NORTH_QUAY_NAMES_V188, cinematicDurationV188,
  cinematicShotAtV188, drawCinematicFrameV188, CinematicPlayerV188 } from '../src/story-cinematics-v188.js';
import { getNpcDialoguePortraitV168 } from '../src/npc-dialogue-portraits-v168.js';
import { createDefaultSave, migrateSave } from '../src/save.js';
import { markStoryCinematicSeenV188, normalizeStoryCampaignV188 } from '../src/story-campaign-v188.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
function recorder() {
  const calls = { text: [], images: 0 };
  const ctx = new Proxy({ measureText: value => ({ width: String(value).length * 9 }), createLinearGradient: () => ({ addColorStop() {} }),
    fillText(value) { calls.text.push(String(value)); }, drawImage() { calls.images++; } }, { get: (object, key) => key in object ? object[key] : () => {} });
  return { ctx, calls };
}

test('durations follow bible §10 and every shot is bilingual', () => {
  assert.deepEqual(CINEMATIC_IDS_V188, ['cin-00', 'cin-01', 'cin-p2', 'cin-02', 'cin-p3-wren', 'cin-p3-ferro', 'cin-20', 'cin-20-rook']);
  const d = cinematicDurationV188; assert.ok(d('cin-00') >= 60 && d('cin-00') <= 75); assert.equal(d('cin-01'), 20);
  assert.ok(Math.abs(d('cin-02') - 45) <= 5); assert.equal(d('cin-20'), 40);
  for (const cinematic of Object.values(CINEMATICS_V188)) {
    assert.ok(cinematic.title.fr && cinematic.title.en);
    for (const entry of cinematic.shots) {
      assert.ok(entry.seconds > 0);
      for (const field of ['caption', 'status']) if (entry[field]) assert.ok(entry[field].fr && entry[field].en, `${cinematic.id} ${field}`);
      if (entry.line) {
        assert.ok(entry.line.text.fr && entry.line.text.en && entry.line.speaker);
        if (entry.line.crewId) assert.ok(getNpcDialoguePortraitV168(entry.line.crewId), `${entry.line.crewId} has a reviewed portrait`);
      }
    }
  }
  assert.equal(CINEMATICS_V188['cin-20'].music, null, 'CIN-20 has no music (bible §5.2)');
  for (const source of Object.values(CINEMATIC_IMAGES_V188)) assert.ok(existsSync(new URL('..' + source, import.meta.url)), source);
  assert.equal(NORTH_QUAY_NAMES_V188.length, 5);
});

test('bible texts are carried verbatim', () => {
  const bible = read('docs/narrative/CAMPAGNE_PRINCIPALE.md').replaceAll("'", '’');
  const quoted = ['Vous remplacez l’équipe Echo-8.', 'Personne ne déclenche une quarantaine rouge pour une panne de relais.',
    'Les conteneurs scellés partent avant nous depuis trois semaines.', 'Ramenez-le en quarantaine. Pas au triage.',
    'Priorité cargaison maintenue, conformément à la clause d’acheminement.'];
  const all = JSON.stringify(CINEMATICS_V188);
  for (const text of quoted) { assert.ok(bible.includes(text), `bible: ${text}`); assert.ok(all.includes(text), `cinematic: ${text}`); }
});

test('shot lookup and every frame draws in both languages without throwing', () => {
  assert.equal(cinematicShotAtV188('cin-00', 0).index, 0); assert.equal(cinematicShotAtV188('cin-00', 6.5).index, 1);
  assert.equal(cinematicShotAtV188('cin-00', 1000), null); assert.equal(cinematicShotAtV188('nope', 1), null);
  for (const id of CINEMATIC_IDS_V188) {
    let start = 0;
    for (const entry of CINEMATICS_V188[id].shots) {
      for (const language of ['fr', 'en']) for (const reducedMotion of [false, true]) {
        const { ctx, calls } = recorder();
        const at = drawCinematicFrameV188(ctx, id, start + entry.seconds * .8, { language, reducedMotion });
        assert.equal(at.shot, entry);
        if (entry.caption) assert.ok(calls.text.includes(entry.caption[language]), `${id} caption ${language}`);
        if (entry.line) assert.ok(calls.text.includes(entry.line.speaker));
      }
      start += entry.seconds;
    }
  }
});

test('the player skips with Escape, advances with Space and removes its overlay', async () => {
  let now = 0; const listeners = new Map(), appended = [];
  const element = () => ({ append(...children) { this.children = children; }, setAttribute() {}, remove() { this.removed = true; }, getContext: () => recorder().ctx, set onclick(fn) { this._click = fn; } });
  const document = { body: { append: node => appended.push(node) }, createElement: element,
    addEventListener: (type, fn) => listeners.set(type, fn), removeEventListener: type => listeners.delete(type) };
  const frames = [];
  const player = new CinematicPlayerV188({ document, now: () => now, requestFrame: fn => frames.push(fn), ImageCtor: class { set src(v) { this._src = v; } } });
  const key = code => listeners.get('keydown')({ code, preventDefault() {}, stopImmediatePropagation() {} });
  const skipped = player.play('cin-02'); key('Escape');
  assert.equal(await skipped, 'skipped'); assert.ok(appended[0].removed); assert.equal(listeners.size, 0);
  const done = player.play('cin-p3-wren'); key('Space');
  now = 1; frames.at(-1)(); assert.equal(await done, 'complete');
  const timed = player.play('cin-01'); now = 0; frames.at(-1)(); now = 21000; frames.at(-1)(); assert.equal(await timed, 'complete');
  assert.equal(await player.play('missing'), 'unavailable');
});

test('seen cinematics persist additively and app hooks follow the prologue order', () => {
  assert.deepEqual(createDefaultSave().storyCampaignV188.cinematicsSeen, []);
  assert.deepEqual(migrateSave({ schema: 52, storyCampaignV188: { debriefSeen: [] } }).storyCampaignV188.cinematicsSeen, []);
  const save = createDefaultSave(); assert.equal(markStoryCinematicSeenV188(save, 'cin-01'), true); assert.equal(markStoryCinematicSeenV188(save, 'cin-01'), false);
  assert.equal(markStoryCinematicSeenV188(save, 'bad id'), false);
  assert.deepEqual(normalizeStoryCampaignV188({ cinematicsSeen: ['cin-02', 'x', 4] }).cinematicsSeen, ['cin-02']);
  const app = read('src/app.js');
  assert.match(app, /playStoryCinematicV188\('cin-00', \{ once: false, record: false \}\)\.then\(\(\) => \{ if \(creatorOwnerV84\) playerCreatorUiV84\.open\(profile\); \}\)/);
  assert.match(app, /=== 'wake-confirmed'\) void playStoryCinematicV188\('cin-01'\)/);
  assert.match(app, /if \(event === 'repair'\) void playStoryCinematicV188\('cin-p2'\)/);
  assert.match(app, /void playStoryCinematicV188\('cin-02'\)\.then\(\(\) => boardPortMeridienV90\(\)\)/);
  assert.match(app, /void playStoryCinematicV188\('cin-p3-wren'\)/); assert.match(app, /if \(action === 'triage'\) void playStoryCinematicV188\('cin-p3-ferro'\)/);
  assert.match(app, /void playStoryCinematicV188\('cin-20'\)\.then\(\(\) => playStoryCinematicV188\('cin-20-rook'\)\);/);
  assert.match(app, /if \(\['operations', 'command'\]\.includes\(name\)\) queueMicrotask\(markStoryDebriefOnViewV188\);/);
  assert.match(read('index.html'), /id="setting-cinematics-v188"/); assert.match(read('sw.js'), /'\/src\/story-cinematics-v188\.js'/);
});
