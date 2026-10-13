import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GameEngine } from '../src/game-production-runtime.js';
import { WORLDS, WEAPONS, ENEMIES } from '../src/content.js';
import { HIVE_CAMPAIGNS_V131, buildHiveMissionV131 } from '../src/hive-missions-v131.js';
import { renderHiveCommandMarkupV131, hiveCommandReasonV131 } from '../src/hive-command-ui-v131.js';

function fixture(index = 0) {
  const windowEvents = new EventTarget();
  for (const method of ['addEventListener', 'removeEventListener', 'dispatchEvent']) globalThis[method] = windowEvents[method].bind(windowEvents);
  globalThis.document = Object.assign(new EventTarget(), { hidden: false, activeElement: null, hasFocus: () => true });
  globalThis.Image = class extends EventTarget {
    complete = true; naturalWidth = 1024; naturalHeight = 1024; width = 1024; height = 1024;
    async decode() {}
    set src(value) { this._src = value; queueMicrotask(() => { this.dispatchEvent(new Event('load')); this.onload?.(); }); }
    get src() { return this._src; }
  };
  globalThis.requestAnimationFrame = () => 1; globalThis.cancelAnimationFrame = () => {};
  const context = new Proxy({ measureText: value => ({ width: String(value).length * 7 }),
    createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }) },
  { get: (target, property) => property in target ? target[property] : () => {} });
  const canvas = Object.assign(new EventTarget(), { width: 1280, height: 720, getContext: () => context,
    focus() { document.activeElement = this; }, getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }) });
  const engine = new GameEngine(canvas), campaign = HIVE_CAMPAIGNS_V131[index], world = WORLDS.find(item => item.id === campaign.worldId);
  const plan = buildHiveMissionV131({ campaign, world, seed: 131 });
  engine.start({ campaign, world, missionLevel: plan, weapon: WEAPONS[0], enemyCatalog: ENEMIES, crew: [], equipment: [], seed: 131 });
  return engine;
}

function commission(engine) {
  const station = engine.hiveManifestV131.stations.find(item => item.id === 'commission');
  Object.assign(engine.player, { x: station.x - engine.player.w / 2, y: station.floorY - engine.player.h, vx: 0, vy: 0, grounded: true });
  engine.keys.add('KeyE'); assert.equal(engine.interact(), true);
  for (let frame = 0; frame < 260; frame++) engine.update(1 / 120);
  engine.keys.delete('KeyE'); assert.equal(engine.hiveV131.commissioned, true);
}

function renderedButton(markup, action, id) {
  return markup.match(new RegExp(`<button[^>]*data-hive-command-action="${action}"[^>]*data-hive-command-value="${id}"[^>]*>`))?.[0];
}

test('real Jeri commissioning and profile spending produce the live action state and exact disabled reason', () => {
  const engine = fixture();
  let markup = renderHiveCommandMarkupV131(engine.getHiveCommandModelV131());
  assert.match(renderedButton(markup, 'profile', 'nurse'), / disabled/);
  assert.match(markup, /Initialiser le pupitre/); assert.doesNotMatch(markup, /data-hive-command-action="consciousness"/);
  commission(engine);
  markup = renderHiveCommandMarkupV131(engine.getHiveCommandModelV131());
  assert.doesNotMatch(renderedButton(markup, 'profile', 'nurse'), / disabled/);
  const charge = engine.hiveV131.charge; assert.equal(engine.performHiveActionV131('profile', 'nurse').applied, true);
  assert.equal(engine.hiveV131.charge, charge - 5);
  markup = renderHiveCommandMarkupV131(engine.getHiveCommandModelV131());
  assert.match(renderedButton(markup, 'profile', 'nurse'), /disabled.*aria-pressed="true"/);
  assert.match(markup, /Profil déjà actif/);
});

test('real recruitment proximity, charge, ownership and possession are reflected in the rendered commands', () => {
  const engine = fixture(1); commission(engine);
  const recruit = engine.hiveActorsV131[0];
  let markup = renderHiveCommandMarkupV131(engine.getHiveCommandModelV131());
  assert.match(renderedButton(markup, 'recruit', recruit.id), / disabled/); assert.match(markup, /Rejoindre la caste sans obstacle/);
  Object.assign(engine.player, { x: recruit.x - 40, y: recruit.y + recruit.h - engine.player.h });
  markup = renderHiveCommandMarkupV131(engine.getHiveCommandModelV131());
  assert.doesNotMatch(renderedButton(markup, 'recruit', recruit.id), / disabled/);
  const charge = engine.hiveV131.charge; assert.equal(engine.performHiveActionV131('recruit', recruit.id).applied, true);
  assert.equal(engine.hiveV131.charge, charge - 12);
  markup = renderHiveCommandMarkupV131(engine.getHiveCommandModelV131());
  assert.doesNotMatch(markup, new RegExp(`data-hive-command-action="recruit" data-hive-command-value="${recruit.id}"`));
  assert.doesNotMatch(renderedButton(markup, 'possess', recruit.id), / disabled/);
  assert.equal(engine.performHiveActionV131('possess', recruit.id).applied, true);
  markup = renderHiveCommandMarkupV131(engine.getHiveCommandModelV131());
  assert.doesNotMatch(renderedButton(markup, 'release', ''), / disabled/);
  assert.match(markup, /Revenir à l’opérateur/);
  assert.equal(engine.performHiveActionV131('release').applied, true);
  assert.doesNotMatch(renderHiveCommandMarkupV131(engine.getHiveCommandModelV131()), /data-hive-command-action="release"/);
});

test('a paused or busy actual operator disables displayed choices and cannot spend the underlying hive resource', () => {
  const engine = fixture(); commission(engine); const charge = engine.hiveV131.charge;
  engine.togglePause();
  let markup = renderHiveCommandMarkupV131(engine.getHiveCommandModelV131());
  assert.match(renderedButton(markup, 'profile', 'nurse'), / disabled/);
  assert.equal(engine.performHiveActionV131('profile', 'nurse').applied, false); assert.equal(engine.hiveV131.charge, charge);
  engine.togglePause(); engine.player.health = 30; assert.equal(engine.useMedkit(), true);
  markup = renderHiveCommandMarkupV131(engine.getHiveCommandModelV131());
  assert.match(renderedButton(markup, 'profile', 'nurse'), / disabled/);
  assert.equal(engine.performHiveActionV131('profile', 'nurse').applied, false); assert.equal(engine.hiveV131.charge, charge);
});

test('Éloïse exposes her true consciousnesses and unavailable endings without borrowing Jeri profiles', () => {
  const engine = fixture(2); commission(engine);
  let markup = renderHiveCommandMarkupV131(engine.getHiveCommandModelV131());
  assert.doesNotMatch(markup, /data-hive-command-action="profile"/);
  assert.match(markup, /data-hive-command-action="consciousness"/);
  assert.match(renderedButton(markup, 'ending', 'crown'), / disabled/); assert.match(markup, /Pylônes et Chasseur à résoudre/);
  assert.equal(engine.performHiveActionV131('consciousness', 'hybrid').applied, true);
  markup = renderHiveCommandMarkupV131(engine.getHiveCommandModelV131());
  assert.match(renderedButton(markup, 'consciousness', 'hybrid'), /disabled.*aria-pressed="true"/);
});

test('command labels, IDs, instructions and refusal feedback are escaped instead of becoming executable DOM', () => {
  const markup = renderHiveCommandMarkupV131({ schema: 131, canAct: true, operationId: 'jeri-false-son',
    title: '<img src=x onerror=alert(1)>', instruction: '<script>bad()</script>',
    profiles: [{ id: '\" autofocus onfocus=bad()', label: '<b>Profil</b>', reason: '<svg onload=bad()>', canApply: false }] },
  { status: '<iframe src=bad>' });
  assert.doesNotMatch(markup, /<img|<script|<svg|<iframe|<b>/);
  assert.match(markup, /&lt;script&gt;/); assert.match(markup, /&quot; autofocus/);
  assert.equal(hiveCommandReasonV131('charge-empty'), 'Charge insuffisante.');
  assert.equal(renderHiveCommandMarkupV131(null), '');
});
