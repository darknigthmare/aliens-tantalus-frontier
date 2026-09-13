import test from 'node:test';
import assert from 'node:assert/strict';
import { EQUIPMENT } from '../src/content-core-v50.js';
import { PLACEABLE_CATALOG_V86, PLACEABLE_DEFINITIONS_V86, PLACEABLE_RULES_V86,
  getPlaceableDefinitionV86, isPlaceableEquipmentV86, createPlaceablesStateV86,
  restorePlaceablesStateV86, capturePlaceablesStateV86, validatePlaceablePlacementV86,
  deployPlaceableV86, recoverPlaceableV86 } from '../src/placeables-state-v86.js';

const ids = { sentry: 'equipment-020-portable-sentry', 'cryo-trap': 'equipment-024-cryo-mine',
  'shock-trap': 'equipment-026-electroshock-trap', containment: 'equipment-028-portable-quarantine' };
const equipment = (kind = 'sentry', changes = {}) => {
  const item = EQUIPMENT.find(entry => entry.id === ids[kind]);
  return { ...item, action: PLACEABLE_DEFINITIONS_V86[kind].action, magnitude: 20,
    maxCharges: item.charges, remaining: item.charges, uses: 0, ...changes };
};
const stock = (...items) => new Map((items.length ? items : [equipment()]).map(item => [item.id, item]));
const make = (kind = 'sentry', changes = {}) => createPlaceablesStateV86(stock(equipment(kind, changes)));
const actor = changes => ({ id: 'player', x: 120, y: 208, w: 36, h: 92, alive: true, grounded: true, ...changes });
const floor = changes => ({ id: 'floor-1', x: 0, y: 300, w: 1000, h: 30, floor: true, ...changes });
const world = changes => ({ platforms: [floor()], bounds: { width: 1000, height: 600 }, ...changes });
const placement = (instance, changes = {}) => validatePlaceablePlacementV86({ instance, actor: actor(),
  x: 190, y: 300 - instance.h, facing: 1, world: world(), ...changes });
const checkpoint = state => JSON.parse(JSON.stringify(capturePlaceablesStateV86(state)));

test('explicit twelve-entry catalogue matches authored IDs/names and all four kinds', () => {
  assert.equal(PLACEABLE_CATALOG_V86.length, 12);
  assert.deepEqual([...new Set(PLACEABLE_CATALOG_V86.map(entry => entry.kind))].sort(), Object.keys(ids).sort());
  for (const entry of PLACEABLE_CATALOG_V86) {
    assert.equal(EQUIPMENT.find(item => item.id === entry.catalogId).name, entry.name);
    assert.equal(getPlaceableDefinitionV86(entry.catalogId), entry);
    assert.ok(isPlaceableEquipmentV86(entry.catalogId));
  }
  assert.equal(getPlaceableDefinitionV86('equipment-999-portable-sentry'), null);
});

test('cyclic utilities, fuzzy names, foreign IDs and wrong actions never mint placeables', () => {
  for (const forged of [
    { ...equipment(), id: 'equipment-001-motion-tracker', name: 'Motion Tracker', utility: 'defense' },
    { ...equipment(), name: 'Portable Sentry clone' }, { ...equipment(), action: 'medical' },
    { ...equipment(), id: 'equipment-999-portable-sentry' }, { utility: 'defense', charges: 99 }
  ]) { assert.equal(isPlaceableEquipmentV86(forged), false); assert.deepEqual(createPlaceablesStateV86([forged]).instances, []); }
  assert.equal(isPlaceableEquipmentV86({ ...equipment(), utility: 'medical' }), true);
});

test('source quantities and catalogId:ordinal identities are deterministic, not regenerated on reads', () => {
  const first = equipment(); const second = equipment('cryo-trap');
  const a = createPlaceablesStateV86(stock(first, second));
  const b = createPlaceablesStateV86(stock(second, first));
  assert.deepEqual(a, b); assert.equal(a.instances.length, first.charges + second.charges);
  assert.equal(new Set(a.instances.map(item => item.instanceId)).size, a.instances.length);
  for (const item of a.instances) { assert.equal(item.instanceId, item.id); assert.equal(item.status, 'carried'); assert.equal(item.sourceUseRecorded, false); }
  assert.deepEqual(createPlaceablesStateV86([first, first]).instances, make().instances);
  assert.equal(createPlaceablesStateV86(stock(first), { legacyDeployables: [] }).migration, undefined);
});

test('dotation is bounded to 64 globally and never multiplied by charges or uses', () => {
  const inputs = PLACEABLE_CATALOG_V86.map(entry => ({ id: entry.catalogId, name: entry.name, action: entry.action,
    charges: 99, maxCharges: 99, remaining: 99, uses: 0, magnitude: 20 }));
  const state = createPlaceablesStateV86(inputs);
  assert.equal(state.instances.length, 64);
  assert.equal(state.sourceIssued.reduce((n, entry) => n + entry.quantity, 0), 64);
  for (const value of [-1, NaN, Infinity, null, '4']) assert.equal(make('sentry', { charges: value }).instances.length, 0);
  assert.equal(make('sentry', { charges: 4, maxCharges: 2 }).instances.length, 2);
  assert.equal(PLACEABLE_RULES_V86.maxInstances, 64);
});

test('T01 source numbers and provisional physical contracts are explicit', () => {
  const sentry = make().instances[0]; const definition = getPlaceableDefinitionV86(sentry.catalogId);
  assert.equal(sentry.ammo, 150); assert.equal(sentry.maxAmmo, 150); assert.equal(sentry.fireInterval, 0.2);
  assert.equal(definition.installSeconds, 2.5); assert.equal(definition.foldSeconds, 2);
  assert.equal(definition.range, 620); assert.equal(definition.coneHalfAngle, Math.PI / 3);
  assert.deepEqual(Object.values(ids).map(id => {
    const d = getPlaceableDefinitionV86(id); return [d.w, d.h, d.maxHealth];
  }), [[72,70,100],[64,34,20],[64,48,30],[96,84,60]]);
});

test('legacy remaining/uses contradictions consume the larger recorded count, not the smaller', () => {
  const state = make('sentry', { uses: 1, remaining: 1 });
  assert.deepEqual(state.instances.map(item => item.status), ['spent', 'spent', 'spent', 'carried']);
  assert.ok(state.instances.slice(0, 3).every(item => item.ammo === 0 && item.sourceUseRecorded));
  assert.ok(make('sentry', { uses: 99999, remaining: 4 }).instances.every(item => item.status === 'spent'));
});

test('explicit V72 migration preserves old magazines and remaining ammunition, anchored to old feet', () => {
  const issued = stock(equipment('sentry', { uses: 2, remaining: 2 }));
  const id = `${ids.sentry}:1`;
  const legacy = [{ id, kind: 'sentry', x: 190, y: 258, w: 38, h: 42, ammo: 3, cooldown: .23 }];
  const state = createPlaceablesStateV86(issued, { legacyV72: true, legacyDeployables: legacy });
  const instance = state.instances[0];
  assert.equal(state.migration, 'legacy-v72'); assert.equal(instance.status, 'deployed');
  assert.equal(instance.ammo, 3); assert.equal(instance.maxAmmo, 22); assert.equal(instance.cooldown, .23);
  assert.equal(instance.onGround, true); assert.equal(state.instances[1].onGround, false);
  assert.equal(instance.y + instance.h, 300); assert.equal(instance.x + instance.w / 2, 209);
  assert.equal(state.instances[1].status, 'spent'); assert.equal(state.instances[2].status, 'carried');
  assert.deepEqual(restorePlaceablesStateV86(checkpoint(state), issued).instances, state.instances);
});

test('legacy missing ammo, unissued ordinals, foreign kinds and duplicate IDs fail closed', () => {
  const issued = stock(equipment('sentry', { uses: 2, remaining: 2 }));
  const base = { id: `${ids.sentry}:1`, kind: 'sentry', x: 190, y: 258, w: 38, h: 42 };
  assert.equal(createPlaceablesStateV86(issued, { legacyDeployables: [base] }).instances[0].ammo, 0);
  for (const legacy of [[base, base], [{ ...base, kind: 'containment' }], [{ ...base, id: `${ids.sentry}:3` }], [{ ...base, id: 'foreign:1' }]]) {
    const state = createPlaceablesStateV86(issued, { legacyDeployables: legacy });
    assert.equal(state.instances[0].status, 'spent'); assert.equal(state.instances[1].status, 'spent');
    assert.equal(state.instances[2].status, 'carried');
  }
});

test('used legacy mines and exhausted fields do not become armed or receive fresh duration', () => {
  for (const kind of ['cryo-trap', 'shock-trap', 'containment']) {
    const issued = stock(equipment(kind, { uses: 1, remaining: 0, charges: 1, maxCharges: 1 }));
    const state = restorePlaceablesStateV86(null, issued, { legacyDeployables: [{ id: `${ids[kind]}:1`, kind,
      x: 190, y: 282, armed: false, duration: 0 }] });
    assert.equal(state.instances[0].status, 'spent'); assert.equal(state.instances[0].armed, false);
    assert.equal(state.instances[0].duration, 0);
  }
});

test('deploy, fold and redeploy conserve all consumables and never mutate legacy charge counters', () => {
  const issued = stock(equipment()); const before = JSON.stringify([...issued]);
  const state = createPlaceablesStateV86(issued); const instance = state.instances[0];
  instance.health = 47; instance.ammo = 62; instance.cooldown = .12;
  const first = deployPlaceableV86(state, instance.instanceId, placement(instance), { ownerCrewId: 'player-echo9' });
  assert.equal(first.ok, true); assert.equal(first.firstDeployment, true);
  assert.equal(recoverPlaceableV86(state, instance.instanceId).ok, true);
  const second = deployPlaceableV86(state, instance.instanceId, placement(instance, { facing: -1 }), { ownerCrewId: 'crew-01-mara-vega' });
  assert.equal(second.ok, true); assert.equal(second.firstDeployment, false);
  assert.equal(instance.health, 47); assert.equal(instance.ammo, 62); assert.equal(instance.cooldown, .12);
  assert.equal(instance.facing, -1); assert.equal(instance.ownerCrewId, 'crew-01-mara-vega');
  assert.equal(JSON.stringify([...issued]), before);
});

test('containment recovery preserves remaining duration, and empty sentry recovery never refills ammo', () => {
  for (const kind of ['sentry', 'containment']) {
    const state = make(kind); const instance = state.instances[0];
    deployPlaceableV86(state, instance.instanceId, placement(instance));
    instance.ammo = 0; instance.duration = kind === 'containment' ? 2.25 : 0;
    recoverPlaceableV86(state, instance.instanceId);
    deployPlaceableV86(state, instance.instanceId, placement(instance));
    assert.equal(instance.ammo, 0); assert.equal(instance.duration, kind === 'containment' ? 2.25 : 0);
  }
});

test('a spent physical object can be carried and placed again, without ever rearming or refilling', () => {
  for (const kind of ['cryo-trap', 'shock-trap', 'containment']) {
    const state = make(kind); const instance = state.instances[0];
    deployPlaceableV86(state, instance.instanceId, placement(instance));
    Object.assign(instance, { status: 'spent', armed: false, duration: 0, ammo: 0, health: 11 });
    assert.equal(instance.onGround, true);
    assert.equal(recoverPlaceableV86(state, instance.instanceId).ok, true);
    assert.equal(instance.onGround, false);
    assert.equal(deployPlaceableV86(state, instance.instanceId, placement(instance)).firstDeployment, false);
    assert.equal(instance.onGround, true); assert.equal(instance.armed, false); assert.equal(instance.duration, 0); assert.equal(instance.health, 11);
    const restored = restorePlaceablesStateV86(checkpoint(state), stock(equipment(kind))).instances[0];
    assert.equal(restored.status, 'spent'); assert.equal(restored.onGround, true); assert.equal(restored.armed, false); assert.equal(restored.duration, 0);
  }
});

test('duplicate transitions, spent/destroyed recovery and unvalidated installation change nothing', () => {
  const state = make(); const instance = state.instances[0];
  for (const [id, position] of [['foreign:1', placement(instance)], [instance.instanceId, { ok: true, x: 1, y: 2 }]]) {
    const before = JSON.stringify(state); assert.equal(deployPlaceableV86(state, id, position).ok, false); assert.equal(JSON.stringify(state), before);
  }
  for (const status of ['carried', 'spent', 'destroyed']) {
    instance.status = status; const before = JSON.stringify(state);
    assert.equal(recoverPlaceableV86(state, instance.instanceId).ok, false); assert.equal(JSON.stringify(state), before);
  }
  instance.status = 'carried'; const valid = placement(instance); deployPlaceableV86(state, instance.instanceId, valid);
  const before = JSON.stringify(state); assert.equal(deployPlaceableV86(state, instance.instanceId, valid).ok, false); assert.equal(JSON.stringify(state), before);
});

test('snapshot cancels pending tasks but preserves committed states and has no aliases or extra keys', () => {
  const state = make(); const instance = state.instances[0];
  state.task = { action: 'install', instanceId: instance.instanceId, progress: .9 };
  instance.task = { action: 'fold', arbitrary: 'must not survive' }; instance.elapsed = 999; instance.invented = { ammo: 999 };
  const snapshot = capturePlaceablesStateV86(state);
  assert.equal(snapshot.task, undefined); assert.equal(snapshot.instances[0].task, undefined);
  assert.equal(snapshot.instances[0].elapsed, undefined); assert.equal(snapshot.instances[0].invented, undefined);
  assert.equal(snapshot.instances[0].status, 'carried');
  snapshot.instances[0].ammo = 0; snapshot.sourceIssued[0].quantity = 0;
  assert.equal(instance.ammo, 150); assert.equal(state.sourceIssued[0].quantity, 4);
});

test('restore derives issued identity set from mission source, ignoring forged counts and strangers', () => {
  const state = make(); const raw = checkpoint(state);
  raw.sourceIssued = [{ catalogId: ids.sentry, quantity: 999 }, { catalogId: ids.containment, quantity: 64 }];
  raw.instances.push({ ...raw.instances[0], instanceId: `${ids.sentry}:99`, id: `${ids.sentry}:99` });
  raw.instances.push({ ...raw.instances[0], instanceId: `${ids.containment}:1`, catalogId: ids.containment, kind: 'containment' });
  const restored = restorePlaceablesStateV86(raw, stock(equipment()));
  assert.deepEqual(restored.sourceIssued, state.sourceIssued); assert.equal(restored.instances.length, 4);
  assert.deepEqual(restored.instances.map(item => item.instanceId), state.instances.map(item => item.instanceId));
});

test('duplicate, missing or foreign-identity snapshot slots are spent, never newly issued', () => {
  for (const alter of [raw => raw.instances.push(clone(raw.instances[0])), raw => raw.instances.shift(),
    raw => { raw.instances[0].catalogId = ids.containment; }, raw => { raw.instances[0].kind = 'shock-trap'; },
    raw => { raw.instances[0].status = 'installing'; }]) {
    const raw = checkpoint(make()); alter(raw);
    const restored = restorePlaceablesStateV86(raw, stock(equipment()));
    assert.equal(restored.instances[0].status, 'spent'); assert.equal(restored.instances[0].ammo, 0);
  }
});
const clone = value => JSON.parse(JSON.stringify(value));

test('malformed V86 snapshots consume uncertain slots without minting from invalid state', () => {
  for (const raw of [[], 'invalid', {}, { schema: 99 }, { schema: 86, instances: 'bad' }]) {
    const restored = restorePlaceablesStateV86(raw, stock(equipment()));
    assert.ok(restored.instances.every(item => item.status === 'spent' && item.ammo === 0));
  }
});

test('restore clamps mutable resources and reconstructs all immutable combat fields', () => {
  const raw = checkpoint(make()); Object.assign(raw.instances[0], { health: 9999, maxHealth: 9999, ammo: 9999,
    maxAmmo: 9999, w: 9999, h: 9999, range: 9999, damage: 9999, fireInterval: 0, x: 9999, y: -100,
    cooldown: Infinity, facing: 0, ownerCrewId: '<script>', task: { pending: true } });
  const restored = restorePlaceablesStateV86(raw, stock(equipment()), { bounds: { width: 1000, height: 600 } }).instances[0];
  assert.equal(restored.health, 100); assert.equal(restored.maxHealth, 100); assert.equal(restored.ammo, 150);
  assert.equal(restored.w, 72); assert.equal(restored.h, 70); assert.equal(restored.damage, 17);
  assert.equal(restored.range, 620); assert.equal(restored.fireInterval, .2); assert.equal(restored.x, 928); assert.equal(restored.y, 0);
  assert.equal(restored.ownerCrewId, null); assert.equal(restored.task, undefined);
});

test('resume is stable/idempotent and cannot clear a consumed source-use marker', () => {
  const issued = stock(equipment('sentry', { uses: 1, remaining: 3 })); const raw = checkpoint(make());
  raw.instances[0].sourceUseRecorded = false; raw.instances[0].ammo = 3; raw.instances[0].health = 12;
  const restored = restorePlaceablesStateV86(raw, issued);
  assert.equal(restored.instances[0].sourceUseRecorded, true);
  assert.deepEqual(restorePlaceablesStateV86(checkpoint(restored), issued), restored);
  raw.instances[0].ammo = 100; assert.equal(restored.instances[0].ammo, 3);
});

test('zero health and consumed traps cannot be resurrected by a deployed status', () => {
  for (const kind of Object.keys(ids)) {
    const raw = checkpoint(make(kind)); raw.instances[0].status = 'deployed'; raw.instances[0].health = 0;
    assert.equal(restorePlaceablesStateV86(raw, stock(equipment(kind))).instances[0].status, 'destroyed');
  }
  for (const kind of ['cryo-trap', 'shock-trap']) {
    const raw = checkpoint(make(kind)); raw.instances[0].status = 'deployed'; raw.instances[0].armed = false;
    assert.equal(restorePlaceablesStateV86(raw, stock(equipment(kind))).instances[0].status, 'spent');
  }
});

test('all four footprints rest on full support and return French-readable placement data', () => {
  for (const kind of Object.keys(ids)) {
    const instance = make(kind).instances[0]; const checked = placement(instance);
    assert.equal(checked.ok, true, kind); assert.equal(checked.y + instance.h, 300);
    assert.equal(checked.supportSurface.kind, 'floor'); assert.equal(checked.supportSurface.id, 'floor-1');
  }
});

test('contiguous coplanar supports are legal but a one-unit gap, narrow edge or moving support is not', () => {
  const instance = make().instances[0];
  assert.equal(placement(instance, { world: world({ platforms: [floor({ x: 180, w: 45 }), floor({ x: 225, w: 50 })] }) }).ok, true);
  for (const platforms of [[floor({ x: 180, w: 45 }), floor({ x: 226, w: 50 })], [floor({ x: 200, w: 55 })],
    [floor({ moving: true })], [floor({ isLift: true })], [floor({ kind: 'lift' })], [floor({ destroyed: true })], []]) {
    assert.equal(placement(instance, { world: world({ platforms }) }).code, 'no-support');
  }
});

test('support height must be physically aligned; tolerance snaps feet without floating', () => {
  const instance = make().instances[0];
  assert.equal(placement(instance, { y: 231 }).y, 230);
  assert.equal(placement(instance, { y: 220 }).code, 'no-support');
  assert.equal(placement(instance, { world: world({ platforms: [floor({ x: 180, w: 45 }), floor({ x: 225, w: 50, y: 301 })] }) }).code, 'no-support');
});

test('airborne, incapacitated, climbing and vehicle operators cannot install', () => {
  const instance = make().instances[0];
  for (const [changes, code] of [[{ grounded: false }, 'actor-airborne'], [{ alive: false }, 'invalid-actor'],
    [{ downed: true }, 'invalid-actor'], [{ climbing: true }, 'actor-busy'], [{ inVehicle: true }, 'actor-busy']])
    assert.equal(placement(instance, { actor: actor(changes) }).code, code);
});

test('placement rejects nonfinite coordinates, all four world boundaries and distance over 120', () => {
  const instance = make().instances[0];
  for (const x of [NaN, Infinity, '190']) assert.equal(placement(instance, { x }).code, 'invalid-position');
  for (const p of [{ x: -1 }, { x: 929 }, { y: -1 }, { y: 531 }]) assert.equal(placement(instance, p).code, 'out-of-bounds');
  assert.equal(placement(instance, { x: 223 }).code, 'too-far');
  assert.equal(placement(instance, { x: 222 }).ok, true);
});

for (const [key, code] of [['doors', 'door-blocked'], ['ladders', 'ladder-blocked'], ['vents', 'vent-blocked'],
  ['lifts', 'lift-blocked'], ['elevators', 'lift-blocked'], ['objectives', 'objective-blocked'],
  ['actors', 'actor-blocked'], ['walls', 'obstacle-blocked'], ['covers', 'obstacle-blocked'],
  ['obstacles', 'obstacle-blocked'], ['placeables', 'placeable-blocked']]) {
  test(`physical ${key} cannot be overlapped during placement`, () => {
    const instance = make().instances[0];
    const box = { id: `${key}-1`, x: 200, y: 250, w: 30, h: 50, open: true, alive: true, status: 'deployed' };
    const checked = placement(instance, { world: world({ [key]: [box] }) });
    assert.equal(checked.code, code); assert.ok(checked.reason.length > 10);
  });
}

test('the operator itself, ceiling platforms and closed OR open doors block placement', () => {
  const instance = make().instances[0];
  assert.equal(placement(instance, { x: 132 }).code, 'actor-blocked');
  assert.equal(placement(instance, { world: world({ platforms: [floor(), { x: 200, y: 210, w: 90, h: 40 }] }) }).code, 'obstacle-blocked');
  for (const open of [true, false]) assert.equal(placement(instance, { world: world({ doors: [{ x: 200, y: 120, w: 60, h: 180, open }] }) }).code, 'door-blocked');
});

test('unsupported or non-carried instances fail before any geometry can be committed', () => {
  const instance = make().instances[0];
  assert.equal(placement({ ...instance, catalogId: 'foreign' }).code, 'invalid-instance');
  assert.equal(placement({ ...instance, status: 'deployed' }).code, 'not-carried');
});

test('spent on-ground props still block placement, but unavailable stock at origin is not a phantom obstacle', () => {
  const instance = make().instances[0];
  const obstacle = { x: 200, y: 250, w: 30, h: 50, status: 'spent', onGround: true };
  assert.equal(placement(instance, { world: world({ placeables: [obstacle] }) }).code, 'placeable-blocked');
  assert.equal(placement(instance, { world: world({ placeables: [{ ...obstacle, onGround: false }] }) }).ok, true);
});
