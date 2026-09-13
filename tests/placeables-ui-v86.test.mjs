import test from 'node:test';
import assert from 'node:assert/strict';
import { PlaceablesDockV86, buildPlaceableDockModelV86, renderPlaceableDockMarkupV86, placeableResourceLabelV86 } from '../src/placeables-ui-v86.js';
const fixture = () => ({ running: true, mission: { state: 'active' }, player: { crewId: 'one', x: 0, y: 0, w: 30, h: 60, alive: true }, coop: { crewId: 'two', x: 500, y: 0, w: 30, h: 60, alive: true }, equipmentActions: new Map([['sentry', { id: 'sentry', name: 'Sentry', remaining: 0, maxCharges: 1 }]]), getPlaceablesSnapshotV86: () => ({ instances: [{ instanceId: 'sentry:1', catalogId: 'sentry', status: 'carried', health: 17, ammo: 0 }], previews: [], tasks: [] }) });
test('V86 initial empty engine keeps J1 selected before actors are constructed', () => {
  const before = buildPlaceableDockModelV86({});
  assert.equal(before.role, 'player'); assert.equal(before.canAct, false);
  const engine = fixture(); engine.coopEnabled = true;
  const after = buildPlaceableDockModelV86(engine, before.role);
  assert.equal(after.role, 'player'); assert.equal(after.actorId, 'one');
  assert.match(renderPlaceableDockMarkupV86(after), /value="player" selected/);
  assert.equal(buildPlaceableDockModelV86({ coopEnabled: true }, 'coop').role, 'player');
});
test('V86 recovered empty equipment remains selectable even with zero historical charges', () => {
  const model = buildPlaceableDockModelV86(fixture());
  assert.equal(model.items[0].available, 1); assert.equal(model.items[0].disabled, false);
  assert.match(renderPlaceableDockMarkupV86(model), /1 porté\(s\)/);
});
test('V86 UI blocks installation while paused and labels invalid support', () => {
  const engine = fixture(); engine.paused = true;
  engine.placeablePreviewsV86 = new Map([['one', { instanceId: 'sentry:1', valid: false, reason: '<support absent>' }]]);
  const markup = renderPlaceableDockMarkupV86(buildPlaceableDockModelV86(engine));
  assert.match(markup, /&lt;support absent&gt;/); assert.match(markup, /data-placeable-action="confirm" disabled/);
});
test('V86 operators have independent previews and nearby recovery is spatial', () => {
  const engine = fixture(); engine.coopEnabled = true;
  engine.getPlaceablesSnapshotV86 = () => ({ instances: [{ instanceId: 'a', catalogId: 'sentry', status: 'deployed', onGround: true, health: 17, ammo: 0, x: 20, y: 0, w: 50, h: 60 }], previews: [{ actorCrewId: 'two', valid: true }], tasks: [] });
  assert.equal(buildPlaceableDockModelV86(engine).nearby.length, 1);
  const second = buildPlaceableDockModelV86(engine, 'coop');
  assert.equal(second.nearby.length, 0); assert.equal(second.preview.valid, true);
  engine.coopEnabled = false; assert.equal(buildPlaceableDockModelV86(engine, 'coop').role, 'player');
});
test('V86 spent ground boxes remain recoverable without making missing or destroyed inventory selectable', () => {
  const engine = fixture();
  const base = { catalogId: 'sentry', status: 'spent', onGround: true, health: 17, x: 20, y: 0, w: 50, h: 60, kind: 'cryo-trap', armed: false };
  engine.getPlaceablesSnapshotV86 = () => ({ instances: [{ ...base, instanceId: 'valid' }, { ...base, instanceId: 'missing', onGround: false }, { ...base, instanceId: 'destroyed', health: 0 }], previews: [], tasks: [] });
  const model = buildPlaceableDockModelV86(engine);
  assert.deepEqual(model.nearby.map(item => item.instanceId), ['valid']);
  assert.match(renderPlaceableDockMarkupV86(model), /Consommé · boîtier inerte/);
});
test('V86 resources are labelled by actual family, not a fictional zero-round counter on armed mines', () => {
  assert.equal(placeableResourceLabelV86({ kind: 'sentry', ammo: 0 }), '0 coups');
  assert.equal(placeableResourceLabelV86({ kind: 'cryo-trap', ammo: 0, armed: true }), 'Armé');
  assert.equal(placeableResourceLabelV86({ kind: 'containment', ammo: 0, duration: 2.5 }), '3 s restantes');
});
test('V86 stock reserved by J2 cannot be selected by J1, but J2 can still select its own preview', () => {
  const engine = fixture(); engine.coopEnabled = true;
  engine.getPlaceablesSnapshotV86 = () => ({ instances: [{ instanceId: 'reserved', catalogId: 'sentry', status: 'carried' }], previews: [{ instanceId: 'reserved', actorCrewId: 'two' }], tasks: [] });
  assert.equal(buildPlaceableDockModelV86(engine).items[0].available, 0);
  assert.equal(buildPlaceableDockModelV86(engine, 'coop').items[0].available, 1);
});

test('V86 manual mission save is visible only while a running mission is paused', () => {
  const engine = fixture();
  const markup = () => renderPlaceableDockMarkupV86(buildPlaceableDockModelV86(engine));
  assert.doesNotMatch(markup(), /mission-save-v86/);
  engine.paused = true;
  assert.match(markup(), /id="mission-save-v86"[^>]*>Sauvegarder la mission<\/button>/);
  assert.equal(buildPlaceableDockModelV86(engine).canAct, false, 'saving does not enable gameplay controls during pause');
  engine.equipmentActions.clear();
  assert.match(markup(), /mission-save-v86/, 'saving remains available without any equipment');
  engine.running = false; assert.doesNotMatch(markup(), /mission-save-v86/);
  engine.running = true; engine.mission = null; assert.doesNotMatch(markup(), /mission-save-v86/);
});

function withSaveDock(run, onSave) {
  const engine = fixture(); engine.paused = true;
  const handlers = new Map(), errors = [], activations = [];
  const button = { disabled: false, dataset: { placeableAction: 'save' } };
  const root = { classList: { add() {} }, innerHTML: '',
    addEventListener(type, handler) { handlers.set(type, handler); }, contains: node => node === button,
    querySelector: () => null, querySelectorAll: () => [] };
  const dock = new PlaceablesDockV86(root, engine, { onSave, onError: error => errors.push(error), onActivate: () => activations.push(true) });
  const click = () => handlers.get('click')({ target: { closest: () => button } });
  try { run({ dock, engine, root, button, click, errors, activations }); } finally { dock.dispose(); }
}

test('V86 pause save invokes its callback exactly once per click, never during renders', () => {
  let calls = 0;
  withSaveDock(({ dock, engine, button, click, errors, activations }) => {
    for (let i = 0; i < 10; i++) dock.render();
    assert.equal(calls, 0);
    click(); assert.equal(calls, 1); assert.equal(engine.paused, true);
    assert.deepEqual(errors, []); assert.deepEqual(activations, []);
    button.disabled = true; click(); assert.equal(calls, 1);
    button.disabled = false; engine.paused = false; click(); assert.equal(calls, 1, 'stale pause markup cannot save while unpaused');
    engine.paused = true; engine.running = false; click(); assert.equal(calls, 1);
  }, () => { calls++; return true; });
});

test('V86 save refusal retains the shared handler feedback instead of adding a misleading equipment error', () => {
  withSaveDock(({ click, errors }) => { click(); assert.deepEqual(errors, []); }, () => false);
  withSaveDock(({ click, errors }) => { click(); assert.deepEqual(errors, ['Quota indisponible']); }, () => { throw new Error('Quota indisponible'); });
});
