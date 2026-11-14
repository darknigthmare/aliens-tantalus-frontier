// Regression tests, bug hunt "hub USS Tantalus et interfaces de gestion" (2026-11-14).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { installKeyRemapV188, mountKeyBindingsUiV188 } from '../src/accessibility-v188.js';
import { withHubDepthRoomsV188 } from '../src/hub-depth-runtime-v188.js';
import { NPC_CAL_LOGISTICS_GEOMETRY_V165, createNpcCalLogisticsStateV165, clearParentDoorwayV188,
  normalizeNpcCalLogisticsRouteV165 } from '../src/npc-cal-logistics-route-v165.js';
import { colonySnapshotV188, investColonySiteV188 } from '../src/colony-reconstruction-v188.js';
import { createDefaultSave } from '../src/save.js';
import { EN_CATALOG_V185, EN_PATTERNS_V185 } from '../src/i18n-en-catalog-v185.js';
import { autoTranslateV185, useCatalogV185 } from '../src/i18n-auto-v185.js';
import { setLanguageV185, currentLanguageV185 } from '../src/i18n-v185.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

// —— Key remapping UI ——
class FakeKeyboardEvent extends Event {
  constructor(type, init = {}) { super(type, init); Object.assign(this, { code: init.code, key: init.key, repeat: init.repeat }); }
}
class FakeElement {
  constructor() { this.dataset = {}; this.children = []; this.textContent = ''; }
  replaceChildren(...children) { this.children = children; }
}
// Minimal capture-phase target (Node's EventTarget does not honour removeEventListener(type, fn, true)).
class FakeTarget {
  constructor() { this.listeners = []; }
  addEventListener(type, fn) { this.listeners.push({ type, fn }); }
  removeEventListener(type, fn) { this.listeners = this.listeners.filter(entry => entry.type !== type || entry.fn !== fn); }
  dispatch(event) {
    for (const entry of [...this.listeners]) {
      if (entry.type !== event.type || !this.listeners.includes(entry)) continue;
      entry.fn(event); if (event.stopped) return true;
    }
    return false;
  }
  dispatchEvent(event) { this.dispatch(event); return true; }
}
const keyEvent = code => ({ type: 'keydown', code, stopped: false, preventDefault() {}, stopImmediatePropagation() { this.stopped = true; } });
function fakeKeyboardPage(bindingsRef, language) {
  // A browser runs the capture listeners of window first, then those of document.
  const win = new FakeTarget(), doc = new FakeTarget();
  doc.createElement = () => new FakeElement();
  const press = code => { const event = keyEvent(code); if (!win.dispatch(event)) doc.dispatch(event); };
  installKeyRemapV188(win, () => bindingsRef.value, { KeyboardEventCtor: FakeKeyboardEvent });
  const container = new FakeElement();
  const ui = mountKeyBindingsUiV188(container, { document: doc, language, getBindings: () => bindingsRef.value, onChange: next => { bindingsRef.value = next; } });
  const button = id => container.children.find(child => child.dataset.actionV188 === id);
  return { press, ui, container, button };
}

test('key remap UI: a key freed by an earlier remap can be assigned again (not swallowed, capture ends)', () => {
  const bindings = { value: null };
  const page = fakeKeyboardPage(bindings, 'fr');
  page.button('up').onclick(); page.press('KeyI');
  assert.equal(bindings.value.up, 'KeyI');
  page.button('jump').onclick(); page.press('KeyW');
  assert.equal(bindings.value.jump, 'KeyW', 'the freed W reaches the capture instead of being swallowed');
  assert.match(page.button('jump').textContent, /KeyW$/, 'the capture ended and the list re-rendered');
});

test('key remap UI: a key already used swaps with the action, never refused or left unbound', () => {
  const bindings = { value: null };
  const page = fakeKeyboardPage(bindings, 'fr');
  page.button('interact').onclick(); page.press('KeyF');
  assert.equal(bindings.value.interact, 'KeyF'); assert.equal(bindings.value.fire, 'KeyE', 'fire takes the old E');
  page.button('left').onclick(); page.press('KeyD');
  assert.equal(bindings.value.left, 'KeyD'); assert.equal(bindings.value.right, 'KeyA');
  assert.ok(Object.values(bindings.value).every(Boolean), 'no action is left unbound');
});

test('key remap UI: labels follow a later FR/EN switch', () => {
  let lang = 'fr'; const bindings = { value: null };
  const page = fakeKeyboardPage(bindings, () => lang);
  assert.match(page.button('tracker').textContent, /^Détecteur/);
  lang = 'en'; page.ui.render();
  assert.match(page.button('tracker').textContent, /^Tracker/);
  assert.equal(page.container.children.at(-1).textContent, 'Reset controls');
  assert.match(read('src/app.js'), /language: \(\) => document\.documentElement\.lang/);
});

// —— 2.5D hangar ladders ——
class FakeHub {
  constructor() { this.keys = new Set(); this.state = { deck: 3 }; this.player = { x: 120, y: 532, w: 44, h: 92, climbing: false, vx: 0, depthZ: 0 }; this.npcs = []; this.updates = []; }
  update() { this.updates.push(new Set(this.keys)); }
  nearestInteraction() { return { id: 'frontier-civil-counter-parent-door' }; } // the annex door shares the ladder foot
  nearestHubNpc() { return null; }
  nearestTraversalLadder() { return { id: 'hangar-observation-link' }; }
  statusPrompt() { return 'E — ENTRER DANS COMPTOIR PORTUAIRE'; }
  currentRoom() { return { id: 'dropship-hangar' }; }
}

test('hangar: at the wall, W at a ladder foot shared with an annex door reaches the ladder physics', () => {
  const Hub = withHubDepthRoomsV188(FakeHub), hub = new Hub();
  hub.keys.add('KeyW'); hub.update(1 / 60);
  assert.equal(hub.updates[0].has('KeyW'), true, 'W climbs: E stays with the annex door');
  assert.match(hub.statusPrompt(), /E — ENTRER DANS COMPTOIR PORTUAIRE · W — GRIMPER/);
  const front = new Hub(); front.player.depthZ = -40; front.keys.add('KeyW'); front.update(1 / 60);
  assert.equal(front.updates[0].has('KeyW'), false, 'away from the wall W still steps back in depth');
  const top = new Hub(); top.player.y = 300; top.keys.add('KeyS'); top.update(1 / 60);
  assert.equal(top.updates[0].has('KeyS'), true, 'on the catwalk S keeps its ladder role');
  assert.doesNotMatch(top.statusPrompt(), /W — GRIMPER/, 'no climb hint off the floor');
  const floor = new Hub(); floor.keys.add('KeyS'); floor.update(1 / 60);
  assert.equal(floor.updates[0].has('KeyS'), false, 'S on the floor is still depth');
});

// —— Logistics annex door and Cal Mercer ——
test('logistics annex: Cal never takes his vehicle-bay post inside the annex doorway', () => {
  const opening = NPC_CAL_LOGISTICS_GEOMETRY_V165.faces.parent.opening;
  const reserved = x => x <= opening.x + opening.w + 12 && x + 44 >= opening.x - 12;
  const created = createNpcCalLogisticsStateV165({ crewId: 'crew-16-cal-mercer', roomId: 'vehicle-bay', x: 4206, y: 532, facing: 1 });
  assert.equal(reserved(created.x), true, 'the routine anchor of 06:00 lands in the doorway');
  const cleared = clearParentDoorwayV188(created);
  assert.equal(reserved(cleared.x), false); assert.equal(cleared.homeX, cleared.x); assert.equal(cleared.stage, 'service');
  assert.deepEqual(normalizeNpcCalLogisticsRouteV165({ schema: 165, actor: cleared }).actor, cleared, 'a valid saved state');
  const outside = createNpcCalLogisticsStateV165({ crewId: 'crew-16-cal-mercer', roomId: 'vehicle-bay', x: 4400, y: 532, facing: 1 });
  assert.equal(clearParentDoorwayV188(outside), outside, 'a post outside the doorway is untouched');
  assert.equal(clearParentDoorwayV188(null), null);
  assert.match(read('src/npc-cal-logistics-route-v165.js'), /clearParentDoorwayV188\(saved\|\|createNpcCalLogisticsStateV165\(actor\)\)/);
});

// —— Port-Méridien table ——
test('colony table: a pending site names the level already paid for; costs use resource names', () => {
  const save = createDefaultSave(); save.galaxy.completedCampaignIds.push('special-archive-relay');
  Object.assign(save.galaxy.resources, { credits: 10000, alloy: 1000 });
  assert.equal(investColonySiteV188(save, 'atmosphere').ok, true);
  const site = colonySnapshotV188(save, 'fr').sites.find(entry => entry.id === 'atmosphere');
  assert.equal(site.pending, true); assert.equal(site.building, 'Air respirable au port'); assert.equal(site.next.label, 'Serres pressurisées');
  assert.equal(colonySnapshotV188(save, 'en').sites.find(entry => entry.id === 'atmosphere').building, 'Breathable air in the port');
  assert.equal(colonySnapshotV188(save, 'fr').sites.find(entry => entry.id === 'walls').building, null);
  const app = read('src/app.js');
  assert.match(app, /entry\.pending \? `\$\{en \? 'AWAITING' : 'EN ATTENTE'\} · \$\{entry\.building\}`/);
  assert.doesNotMatch(app, /map\(\(\[key, value\]\) => `\$\{value\} \$\{key\}`\)/, 'no raw save keys (credits, alloy) on screen');
});

// —— Language switch and English catalog ——
test('language switch re-renders the bilingual Command blocks; English catalog covers the hub and management texts', () => {
  const app = read('src/app.js');
  assert.match(app, /LANGUAGE_EVENT_V185, \(\) => \{[\s\S]{0,700}renderCommand\(\); renderStrategy\(\); renderOperationPlan\(\);/);
  // Joined cost lines ("4 CARBURANT · 6 RAVIT.") are written in English directly, not through the catalog.
  assert.match(app, /const labels = globalThis\.document\?\.documentElement\?\.lang === 'en' \? COST_LABELS_EN_V188 : COST_LABELS;/);
  for (const label of ['CARBURANT', 'RAVIT.', 'MÉDICAL', 'ÉNERGIE', 'ALLIAGE', 'PATHOGÈNE']) assert.equal(EN_PATTERNS_V185[`{0} ${label}`], undefined, 'a greedy {0} LABEL pattern would swallow a joined line');
  const previous = currentLanguageV185();
  useCatalogV185({ EN_CATALOG_V185, EN_PATTERNS_V185 });
  setLanguageV185('en', { document: null, storage: null, persist: false });
  try {
    assert.equal(autoTranslateV185('Cinématiques'), 'Cutscenes');
    assert.equal(autoTranslateV185('Reconnaissance longue portée'), 'Long-range reconnaissance');
    assert.equal(autoTranslateV185('RAVIT.'), 'SUPPLY');
    assert.equal(autoTranslateV185('4 affectés · 16 disponibles'), '4 assigned · 16 available');
    assert.match(autoTranslateV185('E — SORTIR VERS BAIE VÉHICULES'), /^E — EXIT TO /);
  } finally { setLanguageV185(previous, { document: null, storage: null, persist: false }); }
});

test('annex exit prompt names the parent room, never its id', () => {
  const v71 = read('src/hub-v71-runtime.js');
  assert.match(v71, /SORTIR VERS \$\{\(exit\.parentRoomName \|\| HUB_DECKS\.flatMap/);
  assert.doesNotMatch(read('src/hub-v81-runtime.js'), /SORTIR VERS ARMORY/);
  // Desktop canvas: the lift hint is drawn too (the DOM readout carrying it is hidden there).
  assert.match(v71, /this\.statusPrompt\(\) \|\| \(this\.nearestLift\?\.\(\) && !this\.hubLiftTransitV163\?\.trip \? tV185\('hub\.prompt\.lift'/);
});

// —— Layout (stylesheets) ——
test('layout: archive toolbar, special-equipment selects, creator checkbox and hub objective fit their space', () => {
  const styles = read('styles.css'), command = read('command-v110.css'), onboarding = read('player-onboarding-v84.css');
  assert.match(styles, /\.archive-control-v68 input,\s*\.archive-control-v68 select,\s*\.archive-unread-toggle-v68 input \{ min-width: 0; \}/);
  assert.match(command, /\.command-maintenance-v110 select \{[^}]*min-width:0/);
  assert.match(onboarding, /#player-creator-v84 \.creator-check-v188 input \{[^}]*width: 20px/);
  assert.match(onboarding, /#hub-onboarding-objective-v84 \{[^}]*top: 116px/);
});
