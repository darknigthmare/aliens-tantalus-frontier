import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { CINEMATICS_V188, CINEMATIC_IDS_V188, CINEMATIC_IMAGES_V188, NORTH_QUAY_NAMES_V188, cinematicDurationV188,
  cinematicShotAtV188, drawCinematicFrameV188, CinematicPlayerV188 } from '../src/story-cinematics-v188.js';
import { getNpcDialoguePortraitV168 } from '../src/npc-dialogue-portraits-v168.js';
import { getColonyPortraitV188 } from '../src/colony-portraits-v188.js';
import { createDefaultSave, migrateSave } from '../src/save.js';
import { markStoryCinematicSeenV188, normalizeStoryCampaignV188 } from '../src/story-campaign-v188.js';
import { BIOLOGICAL_ART_V188, BIOLOGICAL_NEW_ART_IDS_V188, BIOLOGICAL_CINEMATIC_ART_BY_ID_V188,
  BIOLOGICAL_ART_BY_CONSUMER_V188, BIOLOGICAL_HELMET_V188, biologicalCinematicSourcesV188,
  biologicalConsumerSourcesV188, prepareBiologicalArtV188, biologicalArtFitV188,
  biologicalManifestCountV188 } from '../src/biological-art-v188.js';
import { PROLOGUE_ART_V188, PROLOGUE_CINEMATIC_ART_BY_ID_V188, prologueCinematicSourcesV188 } from '../src/prologue-art-v188.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
function recorder() {
  const calls = { text: [], images: 0 };
  const ctx = new Proxy({ measureText: value => ({ width: String(value).length * 9 }), createLinearGradient: () => ({ addColorStop() {} }),
    fillText(value) { calls.text.push(String(value)); }, drawImage() { calls.images++; } }, { get: (object, key) => key in object ? object[key] : () => {} });
  return { ctx, calls };
}

test('durations follow bible §10 and every shot is bilingual', () => {
  assert.deepEqual(CINEMATIC_IDS_V188, ['cin-00', 'cin-01', 'cin-p2', 'cin-02', 'cin-03', 'cin-p3-wren', 'cin-p3-ferro', 'cin-20', 'cin-10', 'cin-11', 'cin-qz17-retour', 'cin-doyenne', 'cin-31', 'cin-50', 'cin-51', 'cin-40', 'cin-41', 'cin-60', 'cin-61', 'cin-90-relay', 'cin-90-freight', 'cin-90-living', 'cin-92', 'cin-99-credits', 'cin-20-rook', 'cin-70', 'cin-71', 'cin-72']); // V188 spec 006: + Act V and endings; spec 007: + the station cinematics
  assert.equal(cinematicDurationV188('cin-40'), 30); assert.equal(cinematicDurationV188('cin-41'), 45);
  assert.equal(cinematicDurationV188('cin-31'), 30); assert.equal(cinematicDurationV188('cin-50'), 35); assert.equal(cinematicDurationV188('cin-51'), 25);
  const d = cinematicDurationV188; assert.ok(d('cin-00') >= 60 && d('cin-00') <= 75); assert.equal(d('cin-01'), 20);
  assert.ok(Math.abs(d('cin-02') - 45) <= 5); assert.equal(d('cin-20'), 40); assert.equal(d('cin-10'), 30); assert.equal(d('cin-11'), 25);
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
    'Priorité cargaison maintenue, conformément à la clause d’acheminement.',
    'Quatre accès. Aucun ne répond. Le détecteur est calme. Trop calme.', 'Ne concluez pas. Rapportez.',
    'S’ils nous déclarent non viables, ils reprennent tout, nous compris.', 'Bon retour. Cette fois, je l’écris.'];
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
  assert.match(app, /void playStoryCinematicV188\('cin-02'\)\.then\(\(\) => playStoryCinematicV188\('cin-03'\)\)\.then\(\(\) => boardPortMeridienV90\(\)\)/);
  assert.match(app, /if \(!seenV188\.includes\('cin-03'\)\) \{ void playStoryCinematicV188\('cin-03'\)\.then\(\(\) => boardPortMeridienV90\(\)\); return true; \}/);
  assert.match(app, /void playStagedBeatV188\('beat-port-arrival'\)\.then\(\(\) => playStoryCinematicV188\('cin-p3-wren'\)\)/); assert.match(app, /if \(action === 'triage'\) void playStoryCinematicV188\('cin-p3-ferro'\)/);
  assert.match(app, /void playStoryCinematicV188\('cin-20'\)\.then\(\(\) => playStoryCinematicV188\('cin-20-rook'\)\);/);
  assert.match(app, /if \(\['operations', 'command'\]\.includes\(name\)\) queueMicrotask\(markStoryDebriefOnViewV188\);/);
  assert.match(app, /event\.type === 'special-operation-started' && event\.campaignId === 'special-narrative-qz17'\) void playStoryCinematicV188\('cin-10'\)/);
  assert.match(app, /event\.choiceId === 'follow-maintenance-trace'\) void playStoryCinematicV188\('cin-11'\)/);
  assert.match(app, /void playStoryCinematicV188\('cin-qz17-retour'\)/);
  assert.match(app, /void playStoryCinematicV188\('cin-doyenne'\)\.then\(\(\) => showView\('operations'\)\)/);
  assert.match(app, /if \(resumeMission\) engine\.togglePause\(\);/);
  assert.match(read('index.html'), /id="setting-cinematics-v188"/); assert.match(read('sw.js'), /'\/src\/story-cinematics-v188\.js'/);
});

import { ECHO8_LOCKER_V188, echo8LockerNotesV188, withHubEcho8LockerV188 } from '../src/hub-echo8-locker-v188.js';

test('the ECHO-8 locker reveals what the campaign has established, in both languages, and only by contact', () => {
  const save = createDefaultSave();
  assert.deepEqual(echo8LockerNotesV188(save).map(note => note.id), ['sealed']);
  save.storyCampaignV188.cinematicsSeen.push('cin-02', 'cin-20-rook');
  assert.deepEqual(echo8LockerNotesV188(save, 'en').map(note => note.id), ['sealed', 'quarantine', 'signature']);
  assert.match(echo8LockerNotesV188(save, 'en')[0].text, /thirty-one hours/);
  assert.equal(ECHO8_LOCKER_V188.roomId, 'cryo-bay'); assert.ok(ECHO8_LOCKER_V188.x >= 3840 && ECHO8_LOCKER_V188.x + ECHO8_LOCKER_V188.w <= 5120, 'inside the cryo bay');
  class Base { interact() { return 'base'; } drawInteractionProp() { return 'drawn'; } }
  const Hub = withHubEcho8LockerV188(Base), hub = new Hub(); const actions = [];
  Object.assign(hub, { running: true, onAction: a => actions.push(a), state: { deck: 0 }, currentRoom: () => ({ id: 'cryo-bay' }),
    player: { alive: true, x: ECHO8_LOCKER_V188.x, w: 40 } });
  hub.interact(); assert.deepEqual(actions, [{ action: 'story:echo8-locker', roomId: 'cryo-bay' }]);
  hub.player.x += 400; assert.equal(hub.interact(), 'base', 'away from the locker, the normal interaction runs');
  hub.onboardingActiveV84 = () => true; hub.onboardingV84 = { phase: 'wake' }; hub.player.x = ECHO8_LOCKER_V188.x;
  assert.equal(hub.interact(), 'base', 'no locker contact before the wake-up');
  const app = read('src/app.js');
  assert.match(app, /withHubEcho8LockerV188\(NativeHubGame\)/); assert.match(app, /interaction\.action === 'story:echo8-locker'/);
});

import { M577_MANIFEST_V188, m577ManifestFromContainersV188, resolveM577ManifestV188 } from '../src/story-campaign-v188.js';

test('Act III manifest: each container removes two of six seats; colonists join the port once', () => {
  assert.deepEqual([0, 1, 2, 3].map(n => m577ManifestFromContainersV188(n).colonists), [6, 4, 2, 0]);
  assert.equal(m577ManifestFromContainersV188(9).containers, 3); assert.equal(M577_MANIFEST_V188.seats, 6);
  const save = createDefaultSave(); const world = Object.keys(save.galaxy.worldState)[0];
  assert.equal(resolveM577ManifestV188(save, world), false, 'no manifest, no consequence');
  save.storyCampaignV188.m577Manifest = m577ManifestFromContainersV188(1); const before = save.galaxy.worldState[world].population;
  assert.equal(resolveM577ManifestV188(save, world), true); assert.equal(save.galaxy.worldState[world].population, before + 4);
  assert.equal(resolveM577ManifestV188(save, world), false, 'applied once'); assert.equal(save.galaxy.worldState[world].population, before + 4);
  assert.deepEqual(migrateSave({ schema: 52, storyCampaignV188: { m577Manifest: { containers: 2, resolved: true } } }).storyCampaignV188.m577Manifest,
    { containers: 2, colonists: 2, resolved: true });
  for (const containers of [0, 3]) for (const kind of ['ramp', 'sealed-crates']) {
    const { ctx, calls } = recorder(); const at = CINEMATICS_V188['cin-31'].shots.findIndex(entry => entry.kind === kind);
    const start = CINEMATICS_V188['cin-31'].shots.slice(0, at).reduce((sum, entry) => sum + entry.seconds, 0);
    drawCinematicFrameV188(ctx, 'cin-31', start + 5, { context: { m577: m577ManifestFromContainersV188(containers) } });
    const expected = kind === 'ramp' ? (containers === 3 ? 'AUCUNE PLACE DONNÉE' : '6 / 6') : (containers === 0 ? 'AUCUN CONTENEUR À BORD' : '3 / 3');
    assert.ok(calls.text.includes(expected), `${kind} with ${containers}: ${calls.text.join('|')}`);
  }
  const app = read('src/app.js');
  assert.match(app, /campaign\.id === 'special-apc-convoy' && !normalizeStoryCampaignV188\(saveSystem\.data\.storyCampaignV188\)\.m577Manifest/);
  assert.match(app, /event\.type === 'c12-horde-radio' && event\.id === 'swarm-breach'/); assert.match(app, /audio\.cue\('container-knock'\)/);
  assert.match(app, /void playStoryCinematicV188\('cin-31', \{ context: \{ m577: manifestV188 \} \}\)/);
  assert.match(app, /event\.campaignId === 'special-black-cocoon'\) void playStoryCinematicV188\('cin-50'\)/);
  assert.match(app, /void playStoryCinematicV188\('cin-51'\)/);
});

import { interludeDueV188, startInterludeV188, interludeCrisisClearedV188, resolveInterludeV188, INTERLUDE_CRISIS_V188, deriveStoryCampaignV188, rescueJunParkV188, interludeChoicePendingV188, INTERLUDE_JUN_VENT_NODE_V188 } from '../src/story-campaign-v188.js';
import { resolveNpcRoutineV62, NPC_IDENTITIES_V62 } from '../src/npc-dialogue-v62.js';
import { HUB_VENT_NETWORK_V62 } from '../src/vent-network-v62.js';
import { resolveHubCrisisEvent } from '../src/world-crisis.js';
import { createHubCrisis } from '../src/world-crisis-core.js';

test('interlude: a real forced quarantine crisis, cleared by the real crisis resolver, then the choice and BISHOP-9 trust', () => {
  const save = createDefaultSave(); save.needsPlayerCreationV84 = false;
  assert.equal(interludeDueV188(save), false, 'not before Act III');
  save.storyCampaignV188.m577Manifest = { containers: 1, colonists: 4, resolved: true };
  assert.equal(interludeDueV188(save), true);
  const crisis = startInterludeV188(save, createHubCrisis);
  assert.equal(crisis.kind, 'xenomorph'); assert.equal(save.hub.activeCrisis.roomId, INTERLUDE_CRISIS_V188.roomId); assert.equal(save.hub.activeCrisis.deck, 2);
  assert.equal(deriveStoryCampaignV188(save, { language: 'fr' }).step, 'interlude');
  assert.match(deriveStoryCampaignV188(save, { language: 'en' }).objective, /Jun Park is not answering/);
  assert.equal(startInterludeV188(save, createHubCrisis), null, 'started once');
  const result = resolveHubCrisisEvent(save, { action: 'crisis:resolved', crisisId: crisis.id, kind: crisis.kind });
  assert.equal(result.handled, true); assert.equal(result.outcome, 'resolved');
  assert.equal(interludeCrisisClearedV188(save, 'other-crisis'), false);
  assert.equal(interludeCrisisClearedV188(save, crisis.id), true);
  assert.equal(interludeCrisisClearedV188(save, crisis.id), false, 'cleared once');
  assert.equal(interludeChoicePendingV188(save), false, 'no choice while Jun Park is missing');
  assert.match(deriveStoryCampaignV188(save, { language: 'fr' }).objective, /support-vie, pont 3/);
  assert.equal(rescueJunParkV188(save, 'hub-mess'), false, 'only his duct');
  assert.equal(rescueJunParkV188(save, INTERLUDE_JUN_VENT_NODE_V188), true);
  assert.equal(interludeChoicePendingV188(save), true);
  assert.equal(rescueJunParkV188(save, INTERLUDE_JUN_VENT_NODE_V188), false, 'rescued once');
  const bishop = save.crew.find(member => member.id === 'crew-05-bishop-9'), before = bishop.loyalty;
  assert.equal(resolveInterludeV188(save, 'eaten'), false);
  assert.equal(resolveInterludeV188(save, 'captured'), true);
  assert.equal(bishop.loyalty, Math.max(0, before - 20)); assert.equal(save.storyCampaignV188.interlude.outcome, 'captured');
  assert.equal(resolveInterludeV188(save, 'destroyed'), false, 'decided once');
  assert.deepEqual(migrateSave(JSON.parse(JSON.stringify(save))).storyCampaignV188.interlude, { phase: 'resolved', crisisId: crisis.id, outcome: 'captured' });
  const app = read('src/app.js');
  assert.match(app, /void playStoryCinematicV188\('cin-31', \{ context: \{ m577: manifestV188 \} \}\)\.then\(startInterludeFlowV188\)/);
  assert.match(app, /interludeCrisisClearedV188\(saveSystem\.data, interaction\.crisisId\)\) \{ saveSystem\.commit\(\); continueInterludeV188\(\); \}/);
  assert.match(app, /interaction\.action === 'hub:vent-node' && rescueJunParkV188\(saveSystem\.data, interaction\.nodeId\)/);
  assert.match(app, /if \(interludeChoicePendingV188\(saveSystem\.data\)\) chooseInterludeOutcomeV188\(\);/);
  assert.match(app, /void playStoryCinematicV188\('cin-41'\)/); assert.match(app, /startInterludeV188\(candidate, createForcedHubCrisisV188\)/);
});

test('interlude: Jun Park first, then the crisis; the crew follows the alert routine while the crisis is active', () => {
  const save = createDefaultSave(); save.needsPlayerCreationV84 = false;
  save.storyCampaignV188.m577Manifest = { containers: 0, colonists: 6, resolved: true };
  const crisis = startInterludeV188(save, createHubCrisis);
  assert.ok(HUB_VENT_NETWORK_V62.nodes.some(node => node.id === INTERLUDE_JUN_VENT_NODE_V188 && node.roomId === 'life-support'), 'a real duct node');
  const routines = NPC_IDENTITIES_V62.map(identity => resolveNpcRoutineV62(identity.crewId, { save, hub: save.hub, crisis: save.hub.activeCrisis, clock: save.clock }));
  assert.ok(routines.length > 0 && routines.every(routine => routine.phase === 'alert' && routine.reason === 'active-crisis'));
  assert.equal(rescueJunParkV188(save, INTERLUDE_JUN_VENT_NODE_V188), true);
  assert.match(deriveStoryCampaignV188(save, { language: 'en' }).objective, /Jun Park is safe/);
  const reloaded = migrateSave(JSON.parse(JSON.stringify(save))).storyCampaignV188.interlude;
  assert.deepEqual(reloaded, { phase: 'alert', crisisId: crisis.id, outcome: null, crisisCleared: false, junRescued: true }, 'survives a reload');
  resolveHubCrisisEvent(save, { action: 'crisis:resolved', crisisId: crisis.id, kind: crisis.kind });
  assert.equal(interludeCrisisClearedV188(save, crisis.id), true); assert.equal(interludeChoicePendingV188(save), true);
  const calm = NPC_IDENTITIES_V62.map(identity => resolveNpcRoutineV62(identity.crewId, { save, hub: save.hub, crisis: save.hub.activeCrisis, clock: save.clock }));
  assert.ok(calm.every(routine => routine.reason !== 'active-crisis'), 'the alert ends with the crisis');
});

// Header-derived dimensions and Canvas operation records are fixtures, not a
// browser screenshot. The separate native-raster QA decodes the same files.
function biologicalImages(paths = Object.values(BIOLOGICAL_ART_V188).map(entry => entry.path)) {
  return Object.fromEntries(paths.map(path => {
    const bytes = readFileSync(new URL(`..${path}`, import.meta.url));
    assert.equal(bytes.subarray(1, 4).toString(), 'PNG', path);
    return [path, { src: path, complete: true, naturalWidth: bytes.readUInt32BE(16), naturalHeight: bytes.readUInt32BE(20) }];
  }));
}
function biologicalRecorder() {
  const calls = [], gradient = { addColorStop() {} };
  const ctx = new Proxy({ globalAlpha: 1, measureText: value => ({ width: String(value).length * 17 }),
    createLinearGradient: () => gradient, createRadialGradient: () => gradient,
    fillText(value, ...args) { calls.push({ op: 'text', value: String(value), args }); },
    drawImage(image, ...args) { calls.push({ op: 'image', path: image.src, args }); },
    fillRect(...args) { calls.push({ op: 'fillRect', args }); } },
  { get: (object, key) => key in object ? object[key] : () => {} });
  return { ctx, calls };
}

test('biological art: three new files, exact consumer lists and every source has an active use', () => {
  assert.deepEqual(BIOLOGICAL_NEW_ART_IDS_V188, ['qz17-cradle-breached', 'depot-resin-helmet-corridor', 'human-resin-support']);
  assert.equal(Object.keys(BIOLOGICAL_ART_V188).length, 18);
  assert.deepEqual(Object.keys(BIOLOGICAL_CINEMATIC_ART_BY_ID_V188), ['cin-11', 'cin-31', 'cin-40', 'cin-41', 'cin-50', 'cin-51', 'cin-qz17-retour']);
  const images = biologicalImages(); assert.equal(Object.keys(images).length, 18);
  const used = new Set(Object.values(BIOLOGICAL_ART_BY_CONSUMER_V188).flat());
  assert.deepEqual([...used].sort(), Object.keys(BIOLOGICAL_ART_V188).sort());
  assert.equal(biologicalCinematicSourcesV188('cin-72'), null);
  assert.deepEqual(biologicalConsumerSourcesV188('other'), []);
  for (const id of Object.keys(BIOLOGICAL_ART_V188).filter(key => !key.startsWith('asph-npc-'))) {
    const fit = biologicalArtFitV188(images, id, [10, 20, 500, 300]); assert.ok(fit, id);
    assert.ok(Math.abs(fit.w / fit.h - fit.sw / fit.sh) < 1e-9, `${id} stays proportional`);
    const image = images[BIOLOGICAL_ART_V188[id].path];
    assert.ok(fit.sx >= 0 && fit.sy >= 0 && fit.sx + fit.sw <= image.naturalWidth && fit.sy + fit.sh <= image.naturalHeight);
  }
});

test('biological lazy loading: Object and Map share pending images, retry errors only on entry and leave other consumers alone', () => {
  for (const images of [{}, new Map()]) {
    const requests = [];
    class ImageDouble { complete = false; naturalWidth = 0; naturalHeight = 0; set src(value) { this.path = value; requests.push(value); } }
    const read = path => images instanceof Map ? images.get(path) : images[path];
    const paths = prepareBiologicalArtV188(images, 'qz17-cradle', ImageDouble);
    assert.deepEqual(requests, paths); assert.equal(paths.length, 1);
    prepareBiologicalArtV188(images, 'qz17-cradle', ImageDouble); assert.equal(requests.length, 1, 'pending request reused');
    read(paths[0]).complete = true;
    prepareBiologicalArtV188(images, 'qz17-cradle', ImageDouble); assert.equal(requests.length, 2, 'new entry retries an error');
    Object.assign(read(paths[0]), { complete: true, naturalWidth: 100, naturalHeight: 100 });
    prepareBiologicalArtV188(images, 'qz17-cradle', ImageDouble); assert.equal(requests.length, 2, 'ready image reused');
    prepareBiologicalArtV188(images, 'black-cocoon', ImageDouble); assert.equal(requests.length, 3);
    prepareBiologicalArtV188(images, 'other', ImageDouble); assert.equal(requests.length, 3);
  }
});

test('biological cinema preload requests its own art and portraits, reuses pending files and retries a failed replay', () => {
  for (const id of Object.keys(BIOLOGICAL_CINEMATIC_ART_BY_ID_V188)) {
    const requested = [];
    class ImageDouble { complete = false; naturalWidth = 0; set src(path) { this.path = path; requested.push(path); } }
    const player = new CinematicPlayerV188({ ImageCtor: ImageDouble }), expected = new Set(biologicalCinematicSourcesV188(id));
    for (const shot of CINEMATICS_V188[id].shots) { const portrait = getNpcDialoguePortraitV168(shot.line?.crewId); if (portrait) expected.add(portrait.source); }
    player.preload(id); assert.deepEqual(new Set(requested), expected, id);
    player.preload(id); assert.equal(requested.length, expected.size, 'no duplicate pending load');
    const failed = requested[0]; player.images[failed].complete = true;
    player.preload(id); assert.equal(requested.length, expected.size + 1); assert.equal(requested.at(-1), failed);
    assert.ok(!requested.some(path => Object.values(CINEMATIC_IMAGES_V188).includes(path)), `${id} has no unrelated title image request`);
  }
});

test('biological cinema: all seven source lists are actually drawn across eighteen unchanged bilingual plans', () => {
  const portraits = Object.keys(BIOLOGICAL_CINEMATIC_ART_BY_ID_V188).flatMap(id => CINEMATICS_V188[id].shots
    .map(shot => getNpcDialoguePortraitV168(shot.line?.crewId)?.source).filter(Boolean));
  const images = biologicalImages([...new Set([...Object.values(BIOLOGICAL_ART_V188).map(entry => entry.path), ...portraits])]);
  const context = { m577: { colonists: 6, containers: 3 } }, before = structuredClone(context);
  let plans = 0;
  for (const [id, ids] of Object.entries(BIOLOGICAL_CINEMATIC_ART_BY_ID_V188)) {
    const used = new Set(); let start = 0;
    for (const entry of CINEMATICS_V188[id].shots) {
      for (const language of ['fr', 'en']) for (const reducedMotion of [false, true]) {
        const { ctx, calls } = biologicalRecorder();
        drawCinematicFrameV188(ctx, id, start + entry.seconds * .8, { images, language, reducedMotion, context });
        calls.filter(call => call.op === 'image').forEach(call => used.add(call.path));
        assert.deepEqual(context, before, 'drawing cannot mutate the manifest');
      }
      start += entry.seconds; plans++;
    }
    const expected = new Set([...ids.map(key => BIOLOGICAL_ART_V188[key].path), ...CINEMATICS_V188[id].shots
      .map(shot => getNpcDialoguePortraitV168(shot.line?.crewId)?.source).filter(Boolean)]);
    assert.deepEqual([...used].sort(), [...expected].sort(), id);
  }
  assert.equal(plans, 18);
});

test('CIN31: zero through six survivors and zero through three containers remain native with art, partial art and fallback', () => {
  const loaded = biologicalImages(), cratesPath = BIOLOGICAL_ART_V188['quarantine-crate'].path;
  for (const images of [loaded, { [cratesPath]: loaded[cratesPath] }, {}]) for (const language of ['fr', 'en']) {
    for (let colonists = 0; colonists <= 6; colonists++) {
      const { ctx, calls } = biologicalRecorder(); drawCinematicFrameV188(ctx, 'cin-31', 8, { images, language, context: { m577: { colonists } } });
      const expected = colonists ? `${colonists} / 6` : language === 'en' ? 'NO SEAT GIVEN' : 'AUCUNE PLACE DONNÉE';
      assert.ok(calls.some(call => call.op === 'text' && call.value === expected));
      if (images === loaded) assert.equal(calls.filter(call => call.op === 'image' && /asph-npc-/.test(call.path)).length, colonists);
    }
    for (let containers = 0; containers <= 3; containers++) {
      const { ctx, calls } = biologicalRecorder(); drawCinematicFrameV188(ctx, 'cin-31', 18, { images, language, context: { m577: { containers } } });
      const expected = containers ? `${containers} / 3` : language === 'en' ? 'NO CONTAINER ABOARD' : 'AUCUN CONTENEUR À BORD';
      assert.ok(calls.some(call => call.op === 'text' && call.value === expected));
      if (images[cratesPath]) assert.equal(calls.filter(call => call.op === 'image' && call.path === cratesPath).length, containers);
    }
  }
  assert.deepEqual([-2, '3.8', Infinity, undefined, 99].map(value => biologicalManifestCountV188(value, 6)), [0, 3, 0, 0, 6]);
});

test('CIN50: the existing ceiling drone appears only after 55 percent and REC is drawn after the camera and letterbox', () => {
  const images = biologicalImages(), path = BIOLOGICAL_ART_V188['ceiling-drone'].path;
  for (const reducedMotion of [false, true]) for (const progress of [.01, .55, .55001, .99]) {
    const { ctx, calls } = biologicalRecorder(); drawCinematicFrameV188(ctx, 'cin-50', 22 * progress, { images, reducedMotion });
    assert.equal(calls.filter(call => call.op === 'image' && call.path === path).length, progress > .55 ? 1 : 0);
    const rec = calls.findIndex(call => call.op === 'text' && call.value === '● REC');
    const bars = calls.findLastIndex(call => call.op === 'fillRect' && call.args.join() === '0,628,1280,92');
    assert.ok(rec > bars && bars >= 0); assert.deepEqual(calls[rec].args.slice(0, 2), BIOLOGICAL_HELMET_V188.rec);
  }
});

test('biological monitors: status thresholds, bilingual evidence and quarantine header stay native inside either bezel or fallback', () => {
  for (const images of [biologicalImages(), {}]) for (const language of ['fr', 'en']) for (const reducedMotion of [false, true]) {
    for (const [id, index, start] of [['cin-31', 2, 20], ['cin-51', 0, 0]]) {
      const entry = CINEMATICS_V188[id].shots[index], words = entry.status[language].split(' ');
      for (const progress of [.4, .8]) {
        const { ctx, calls } = biologicalRecorder(); drawCinematicFrameV188(ctx, id, start + entry.seconds * progress, { images, language, reducedMotion });
        const rendered = calls.filter(call => call.op === 'text').map(call => call.value).join(' ');
        assert.equal(words.every(word => rendered.includes(word)), progress > .45);
      }
    }
    const { ctx, calls } = biologicalRecorder(); drawCinematicFrameV188(ctx, 'cin-41', 12.8, { images, language, reducedMotion });
    const lines = calls.filter(call => call.op === 'text').map(call => call.value);
    assert.ok(lines.some(value => value.includes(language === 'en' ? 'QUARANTINE LOG' : 'JOURNAL DE QUARANTAINE') && value.includes('02:31')));
    assert.ok(!lines.some(value => value.includes('QZ-18')));
    for (const row of CINEMATICS_V188['cin-41'].shots[0].lines) assert.ok(lines.includes(row[language]));
  }
});

function prologueImages() {
  return Object.fromEntries(Object.values(PROLOGUE_ART_V188).map(({ path }) => {
    const bytes = readFileSync(new URL(`..${path}`, import.meta.url)); let naturalWidth, naturalHeight;
    if (bytes.subarray(1, 4).toString() === 'PNG') { naturalWidth = bytes.readUInt32BE(16); naturalHeight = bytes.readUInt32BE(20); }
    else { assert.equal(bytes.subarray(8, 16).toString(), 'WEBPVP8L', path); const bits = bytes.readUInt32LE(21);
      naturalWidth = (bits & 0x3fff) + 1; naturalHeight = ((bits >>> 14) & 0x3fff) + 1; }
    return [path, { src: path, complete: true, naturalWidth, naturalHeight }];
  }));
}

test('opening art preload is scoped, includes the actual speaker portraits, and retries only failed entries on replay', () => {
  for (const id of Object.keys(PROLOGUE_CINEMATIC_ART_BY_ID_V188)) {
    const requests = [];
    class ImageDouble { complete = false; naturalWidth = 0; set src(path) { this.path = path; requests.push(path); } }
    const player = new CinematicPlayerV188({ ImageCtor: ImageDouble }); player.preload(id);
    const expected = new Set(prologueCinematicSourcesV188(id));
    for (const entry of CINEMATICS_V188[id].shots) {
      const portrait = entry.line?.crewId ? getNpcDialoguePortraitV168(entry.line.crewId) : getColonyPortraitV188(entry.line?.speaker);
      if (portrait) expected.add(portrait.source);
    }
    assert.deepEqual(new Set(requests), expected, id);
    assert.ok(!requests.some(path => /biological|asph-cin-helmet|ceiling-drone/.test(path)), 'no later evidence or threat is requested');
    player.preload(id); assert.equal(requests.length, expected.size, 'in-flight loads are shared');
    const failed = requests[0]; player.images[failed].complete = true;
    player.preload(id); assert.equal(requests.length, expected.size + 1); assert.equal(requests.at(-1), failed);
    Object.assign(player.images[failed], { complete: true, naturalWidth: 100, naturalHeight: 100 });
    player.preload(id); assert.equal(requests.length, expected.size + 1, 'successful replay reuses its image');
  }
  assert.equal(prologueCinematicSourcesV188('cin-31'), null);
});

test('opening art dependencies are drawn by their own 35 plans; drawing preserves context and makes no image requests', () => {
  const images = prologueImages(), context = Object.freeze({ m577: Object.freeze({ colonists: 3, containers: 2 }), marker: 'unchanged' });
  const before = JSON.stringify(context), previous = globalThis.Image; let plans = 0;
  globalThis.Image = class { constructor() { throw new Error('draw must never request an image'); } };
  try {
    for (const id of Object.keys(PROLOGUE_CINEMATIC_ART_BY_ID_V188)) {
      let start = 0; const used = new Set();
      for (const entry of CINEMATICS_V188[id].shots) {
        for (const language of ['fr', 'en']) for (const reducedMotion of [false, true]) {
          const trace = biologicalRecorder(); drawCinematicFrameV188(trace.ctx, id, start + entry.seconds * .82, { images, language, reducedMotion, context });
          trace.calls.filter(call => call.op === 'image').forEach(call => used.add(call.path));
          if (entry.caption) assert.ok(trace.calls.some(call => call.op === 'text' && call.value === entry.caption[language]));
          if (entry.line) assert.ok(trace.calls.some(call => call.op === 'text' && call.value === entry.line.speaker));
        }
        start += entry.seconds; plans++;
      }
      const expected = new Set(prologueCinematicSourcesV188(id));
      for (const entry of CINEMATICS_V188[id].shots) {
        const portrait = entry.line?.crewId ? getNpcDialoguePortraitV168(entry.line.crewId) : getColonyPortraitV188(entry.line?.speaker);
        if (portrait && images[portrait.source]) expected.add(portrait.source);
      }
      assert.deepEqual([...used].sort(), [...expected].sort(), `${id}: declared art is actually used`);
    }
  } finally { if (previous === undefined) delete globalThis.Image; else globalThis.Image = previous; }
  assert.equal(plans, 35); assert.equal(JSON.stringify(context), before);
});

test('late prologue art repaints at a fixed clock; skips, replacement and stale frames cannot revive a finished cinematic', async () => {
  let now = 0; const frames = [], listeners = new Map(), overlays = [], requests = [], traces = [];
  const document = {
    body: { append(node) { overlays.push(node); } },
    createElement(kind) { const trace = biologicalRecorder(); if (kind === 'canvas') traces.push(trace);
      return { append(...children) { this.children = children; }, setAttribute() {}, remove() { this.removed = true; }, getContext() { return trace.ctx; } }; },
    addEventListener(type, listener) { listeners.set(type, listener); }, removeEventListener(type, listener) { if (listeners.get(type) === listener) listeners.delete(type); }
  };
  class ImageDouble { complete = false; naturalWidth = 0; naturalHeight = 0;
    set src(path) { this.path = path; requests.push(path); } get src() { return this.path; } }
  const player = new CinematicPlayerV188({ document, now: () => now, requestFrame: frame => frames.push(frame), ImageCtor: ImageDouble });
  const real = prologueImages(), path = PROLOGUE_ART_V188['north-quay-patient'].path;
  const loaded = source => { const { naturalWidth, naturalHeight } = real[source]; Object.assign(player.images[source], { complete: true, naturalWidth, naturalHeight }); };
  const key = code => listeners.get('keydown')({ code, preventDefault() {}, stopImmediatePropagation() {} });
  const first = player.play('cin-p3-ferro', { reducedMotion: true }), state = player.active, requestCount = requests.length;
  now = 2000; frames.shift()(); const beforeLate = traces[0].calls.length;
  assert.ok(!traces[0].calls.some(call => call.op === 'image' && call.path === path));
  loaded(path); frames.shift()();
  assert.ok(traces[0].calls.slice(beforeLate).some(call => call.op === 'image' && call.path === path), 'a paused clock still accepts late art');
  assert.equal(player.active, state); assert.equal(state.offset, 0); assert.equal(requests.length, requestCount);
  key('Escape'); assert.equal(await first, 'skipped'); assert.ok(overlays[0].removed); assert.equal(listeners.size, 0);
  const afterSkip = traces[0].calls.length; frames.shift()(); assert.equal(traces[0].calls.length, afterSkip, 'queued old frame does not draw');
  loaded(PROLOGUE_ART_V188['medical-stretcher'].path); assert.equal(player.active, null); assert.equal(overlays.length, 1, 'late completion creates no overlay');

  const replay = player.play('cin-p3-ferro'), oldFrame = frames.shift(), replacement = player.play('cin-01');
  assert.equal(await replay, 'replaced'); assert.ok(overlays[1].removed); const newState = player.active;
  oldFrame(); assert.equal(player.active, newState); assert.equal(newState.id, 'cin-01'); assert.equal(listeners.size, 1);
  key('Enter'); frames.shift()(); assert.equal(cinematicShotAtV188('cin-01', newState.offset).shot.kind, 'locker');
  now += 21000; frames.shift()(); assert.equal(await replacement, 'complete');
  assert.equal(player.active, null); assert.equal(listeners.size, 0); assert.ok(overlays[2].removed);
});
