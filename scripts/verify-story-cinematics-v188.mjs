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
  assert.deepEqual(CINEMATIC_IDS_V188, ['cin-00', 'cin-01', 'cin-p2', 'cin-02', 'cin-03', 'cin-p3-wren', 'cin-p3-ferro', 'cin-20', 'cin-10', 'cin-11', 'cin-qz17-retour', 'cin-doyenne', 'cin-31', 'cin-50', 'cin-51', 'cin-40', 'cin-41', 'cin-20-rook']);
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
