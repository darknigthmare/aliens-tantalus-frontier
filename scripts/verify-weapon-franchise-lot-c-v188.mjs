// Spec 014, lot C — the remaining franchise weapons (catalogue rows 236–301), the thrown-device class and the
// secondary fire (T106, T107, T210): every new weapon is fired and reloaded (or thrown) in the shared
// Forge-native mission host, and every secondary mode is fired through the dedicated action.
// Fixture: forge-native-host-v136.mjs started with the weapon under test.
// Declared injections: the primary reserve is raised to at least 40 by direct assignment; the secondary fire is
// requested through the engine's own action or by holding its key code in `engine.keys` (what the keyboard,
// the touch button and the gamepad do); enemies used as blast targets are placed next to the marine by direct
// assignment of their position. No hostile is removed.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { WEAPONS } from '../src/content-core-v50.js';
import { WEAPON_CATALOG_FRANCHISE_V188, WEAPON_CATALOG_FRANCHISE_LOT_C_V188, WEAPON_FRANCHISE_LOT_C_IDS_V188, WEAPON_FRANCHISE_LEDGER_V188,
  WEAPON_RESEARCH_SUPPLEMENT_V188, WEAPON_FRANCHISE_DESCRIPTIONS_EN_V188 } from '../src/weapon-catalog-franchise-v188.js';
import { FRANCHISE_LOT_C_ROWS_V188, FRANCHISE_LOT_C_RESEARCH_V188 } from '../src/weapon-catalog-franchise-c-v188.js';
import { WEAPON_ADDITION_IDS_V188 } from '../src/weapon-catalog-additions-v188.js';
import { getArsenalProfileV188, ARSENAL_LOT_C_IDS_V188, ARSENAL_LOT_B_IDS_V188, listArsenalProfilesV188, ARSENAL_THROWN_DEVICES_V188,
  ARSENAL_PLACEHOLDER_CATEGORIES_V188, ARSENAL_STATUS_CARRIER_V188 } from '../src/weapon-arsenal-v188.js';
import { ARSENAL_PLACEHOLDER_SLOTS_V188, hasProvisionalPlaqueV188, drawProvisionalPlaqueV188, provisionalPlaqueSlotV188 } from '../src/weapon-provisional-plaque-v188.js';
import { WEAPON_RESEARCH_INDEX_V171, getWeaponResearchIndexV171 } from '../src/weapon-research-index-v171.js';
import { resolveWeaponVisualProfileV63 } from '../src/weapon-visual-runtime-v63.js';
import { resolveHeldWeaponProfileV125 } from '../src/held-weapon-profiles-v125.js';
import { inspectDetachableFeedV193 } from '../src/weapon-feed-admission-v193.js';
import { resolveWeaponActionProfileV130 } from '../src/weapon-actions-v130.js';
import { resolveWeaponActionProfileV131 } from '../src/weapon-actions-v131.js';
import { AUDIO_CUE_IDS_V188 } from '../src/audio-cues-v188.js';
import { EN_CATALOG_V185 } from '../src/i18n-en-catalog-v185.js';
import { KEY_ACTIONS_V188, defaultKeyBindingsV188, buildKeyTranslationV188 } from '../src/accessibility-v188.js';
import { createDefaultSave, getProcurementQuote, procureCatalogItem, canAfford } from '../src/save.js';
import { WEAPON_SECONDARY_MODES_V188, SECONDARY_FIRE_WEAPON_IDS_V188, SECONDARY_FIRE_CODE_V188, SECONDARY_FIRE_GAMEPAD_BUTTON_V188,
  resolveSecondaryModeV188, SECONDARY_FIRE_LABEL_V188, SECONDARY_FIRE_STATUS_V188 } from '../src/weapon-secondary-fire-v188.js';
import { MissionGamepadInputV77 } from '../src/mission-input-v77.js';
import { missionV136 } from './forge-native-host-v136.mjs';

const named = id => WEAPONS.find(weapon => weapon.id === id);
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const STEP = 1 / 60;
function mission(id, extra = {}) {
  const fixture = missionV136({ weapon: named(id), ...extra });
  fixture.engine.player.ammoReserve = Math.max(fixture.engine.player.ammoReserve, 40); // declared injection
  return fixture;
}
const run = (engine, frames) => { for (let i = 0; i < frames; i++) engine.update(STEP); };
const total = actor => actor.ammo + actor.ammoReserve;
function fireUntil(engine, count, limit = 900) {
  const actor = engine.player, start = actor.shots; let frames = 0;
  while (actor.shots - start < count && frames++ < limit) { engine.fire(actor); engine.update(STEP); }
  return actor.shots - start;
}
/** A fresh press of the secondary-fire action, then `frames` of simulation. */
function press(engine, frames = 1) { const done = engine.requestSecondaryFireV188(engine.player); run(engine, frames); return done; }
const NAME_ONLY = FRANCHISE_LOT_C_ROWS_V188.filter(row => row.evidence === 'index-name-only').map(row => 'weapon-' + row.n + '-' + row.slug);

test('catalogue: 64 append-only lot-C rows after lot B, wrapping ids skipped, no art borrowed, lot B untouched', () => {
  assert.equal(WEAPON_CATALOG_FRANCHISE_LOT_C_V188.length, 64);
  assert.equal(WEAPONS.length, 283);
  assert.deepEqual(WEAPONS.slice(-64).map(weapon => weapon.id), WEAPON_FRANCHISE_LOT_C_IDS_V188);
  assert.deepEqual(WEAPON_ADDITION_IDS_V188.slice(-64), WEAPON_FRANCHISE_LOT_C_IDS_V188);
  assert.equal(new Set(WEAPONS.map(weapon => weapon.id)).size, WEAPONS.length);
  assert.equal(new Set(WEAPONS.slice(-105).map(weapon => weapon.name)).size, 105, 'no duplicate name among the additions');
  const numbers = WEAPON_FRANCHISE_LOT_C_IDS_V188.map(id => Number(id.slice(7, 10)));
  assert.deepEqual(numbers, Array.from({ length: 66 }, (_, i) => 236 + i).filter(n => n !== 256 && n !== 296));
  // 256 and 296 wrap onto the Heavy Pulse Rifle plate through the historical resolver, exactly like 216.
  for (const n of [216, 256, 296]) assert.ok(resolveWeaponVisualProfileV63({ id: `weapon-${n}-probe`, name: 'Probe', family: 'ballistic' }), String(n));
  assert.equal(WEAPON_CATALOG_FRANCHISE_V188.length, 38, 'lot B is unchanged');
  assert.equal(ARSENAL_LOT_B_IDS_V188.length, 38); assert.deepEqual(ARSENAL_LOT_C_IDS_V188, WEAPON_FRANCHISE_LOT_C_IDS_V188);
  assert.deepEqual(listArsenalProfilesV188({ lotC: true }).map(p => p.weaponId), WEAPON_FRANCHISE_LOT_C_IDS_V188);
  const research = new Set([...WEAPON_RESEARCH_INDEX_V171, ...WEAPON_RESEARCH_SUPPLEMENT_V188].map(row => row.id));
  assert.equal(WEAPON_RESEARCH_INDEX_V171.length, 129, 'the V170 projection is not rewritten');
  for (const weapon of WEAPON_CATALOG_FRANCHISE_LOT_C_V188) {
    assert.match(weapon.id, /^weapon-\d{3}-[a-z0-9-]+$/);
    assert.ok(Object.isFrozen(weapon) && weapon.canonExact === false && /proposed/.test(weapon.statsPolicy) && weapon.lotV188 === 'C', weapon.id);
    assert.equal(weapon.admissionV188, 'provisional-plaque-purchasable'); assert.equal(weapon.plaqueStatus, 'provisional-drawn');
    assert.match(weapon.sourceUrl, /^https:\/\//); assert.ok(weapon.sourceWork && weapon.identityEvidence && weapon.description, weapon.id);
    assert.ok(research.has(weapon.researchId), weapon.researchId);
    assert.equal(resolveWeaponVisualProfileV63(weapon), null, 'no borrowed plate: ' + weapon.id);
    assert.equal(resolveHeldWeaponProfileV125(weapon), null, 'no borrowed held PNG: ' + weapon.id);
    assert.equal(inspectDetachableFeedV193(weapon).detachable, false, 'no physical magazine without model evidence: ' + weapon.id);
    assert.ok(Number.isSafeInteger(weapon.magazine) && weapon.magazine >= 1 && weapon.damage > 0 && weapon.fireRate > 0 && weapon.reload > 0, weapon.id);
    assert.equal(weapon.magazine, weapon.feedV188.capacity);
    assert.equal(weapon.feedV188.capacityDocumented, typeof weapon.feedV188.capacitySource === 'string');
    assert.ok(!/1:1|fidèle à l’identique/.test(weapon.description), weapon.id);
    assert.ok(!/predator/i.test(weapon.name + weapon.sourceWork.replace(/Aliens versus Predator: Extinction/, '')), 'Predator weapons stay excluded: ' + weapon.id);
  }
  for (const [id, , , url] of FRANCHISE_LOT_C_RESEARCH_V188) {
    assert.match(id, /^proposed-v188-[a-z0-9-]+$/); assert.match(url, /^https:\/\//);
    assert.ok(WEAPON_CATALOG_FRANCHISE_LOT_C_V188.some(weapon => weapon.researchId === id), 'supplement row is cited: ' + id);
  }
  const promoted = getWeaponResearchIndexV171().filter(row => row.promotedCatalogIdV188).map(row => row.promotedCatalogIdV188);
  for (const weapon of WEAPON_CATALOG_FRANCHISE_LOT_C_V188) if (!weapon.researchId.startsWith('proposed-v188-')) assert.ok(promoted.includes(weapon.id), 'research view reports ' + weapon.id);
});

test('ledger: three statuses kept apart; a name-only row documents nothing; capacities are documented only with a source', () => {
  const rows = WEAPON_FRANCHISE_LEDGER_V188.filter(row => row.lot === 'C');
  assert.equal(rows.length, 64); assert.equal(WEAPON_FRANCHISE_LEDGER_V188.filter(row => row.lot === 'B').length, 38);
  for (const row of rows) {
    const weapon = named(row.weaponId);
    assert.ok(weapon && row.canonExact === false && row.visualFidelity1to1 === false && row.plaque === 'provisional-drawn', row.weaponId);
    assert.ok(row.adapted.length >= 4 && row.adapted.every(text => text.endsWith('[PROPOSÉ]')), row.weaponId);
    assert.ok(row.toDefine.includes('plaque native'), row.weaponId);
    assert.equal(row.documented.some(text => text.startsWith('capacité ')), weapon.feedV188.capacityDocumented, row.weaponId);
    if (weapon.identityEvidence === 'index-name-only') {
      assert.deepEqual(row.documented, [], 'nothing is called documented when no page was read: ' + row.weaponId);
      assert.equal(weapon.identityVerified, false); assert.match(weapon.description, /aucune fiche n’a pu être relue/);
      assert.match(row.toDefine[0], /aucune source relue/);
    } else assert.ok(row.documented.length >= 1, row.weaponId);
    const profile = getArsenalProfileV188(row.weaponId);
    assert.equal(profile.fidelity.status, 'source-identity-provisional-plaque');
    assert.equal(profile.lotA, false); assert.equal(profile.lotB, false); assert.equal(profile.lotC, true);
    assert.equal(profile.feed.runtimeCapacity, weapon.magazine, row.weaponId);
  }
  assert.deepEqual(NAME_ONLY.map(id => Number(id.slice(7, 10))), [238, 250, 257, 258, 259, 277, 278, 280, 281, 282, 284, 287, 291, 294, 295, 299, 300]);
  const documented = WEAPON_CATALOG_FRANCHISE_LOT_C_V188.filter(weapon => weapon.feedV188.capacityDocumented).map(weapon => [weapon.id, weapon.magazine]);
  assert.deepEqual(documented, [['weapon-252-m4ra-battle-rifle', 15], ['weapon-253-nsg-23-assault-rifle', 30], ['weapon-255-88-mod-4-combat-pistol', 27],
    ['weapon-269-bd-48-daittyo-heavy-rifle', 200]]);
});

test('texts: every French description has its reviewed English entry; secondary-fire labels are in the catalogue', () => {
  for (const weapon of WEAPON_CATALOG_FRANCHISE_LOT_C_V188) {
    const english = WEAPON_FRANCHISE_DESCRIPTIONS_EN_V188[weapon.description];
    assert.ok(english && english !== weapon.description, weapon.id);
    assert.equal(EN_CATALOG_V185[weapon.description], english, weapon.id);
  }
  assert.equal(EN_CATALOG_V185['Tir secondaire'], 'Secondary fire');
  assert.equal(EN_CATALOG_V185['TIR 2'], 'ALT');
});

test('provisional plaque and purchase: every lot-C weapon is drawn with Canvas primitives and bought through the save functions', () => {
  const calls = [];
  const ctx = new Proxy({}, { get: (target, key) => key in target ? target[key] : (...args) => { calls.push(key); }, set: (t, k, v) => (t[k] = v, true) });
  const save = createDefaultSave(); save.galaxy.resources.credits = 1e7; // declared injection: funds
  for (const weapon of WEAPON_CATALOG_FRANCHISE_LOT_C_V188) {
    assert.equal(hasProvisionalPlaqueV188(weapon), true, weapon.id);
    const slot = provisionalPlaqueSlotV188(weapon), profile = getArsenalProfileV188(weapon.id);
    assert.equal(profile.held.placeholderSlot, slot); assert.equal(profile.held.art, 'canvas-placeholder');
    assert.equal(typeof ARSENAL_PLACEHOLDER_SLOTS_V188[slot], 'function', slot);
    assert.equal(ARSENAL_PLACEHOLDER_CATEGORIES_V188[weapon.placeholderCategoryV188][0], slot);
    calls.length = 0;
    assert.equal(drawProvisionalPlaqueV188(ctx, weapon), true);
    assert.ok(calls.filter(key => key === 'fillRect').length >= 3 && !calls.includes('drawImage'), weapon.id + ' primitives only');
    assert.ok(profile.audio.shot === null || AUDIO_CUE_IDS_V188.includes(profile.audio.shot));
    const quote = getProcurementQuote(save, 'weapon', weapon);
    assert.ok(quote.credits > 0 && canAfford(save, quote), weapon.id);
    assert.equal(procureCatalogItem(save, 'weapon', weapon).ok, true, weapon.id);
    assert.ok(save.strategy.inventory.weaponIds.includes(weapon.id), weapon.id);
  }
  assert.equal(provisionalPlaqueSlotV188(named('weapon-288-sevastopol-molotov')), 'held-weapon-placeholder-device');
});

test('thrown devices: only the eight declared rows get the thrown action; each throw spends one device and explodes with its status', () => {
  const devices = Object.keys(ARSENAL_THROWN_DEVICES_V188);
  assert.deepEqual(devices, ['weapon-260-m20-claymore-mine', 'weapon-285-g2-electroshock-grenade', 'weapon-286-u4-firebomb', 'weapon-288-sevastopol-molotov',
    'weapon-289-sevastopol-pipe-bomb', 'weapon-290-sevastopol-emp-mine', 'weapon-291-sevastopol-flashbang', 'weapon-293-gem-80-mine']);
  for (const weapon of WEAPONS) {
    const thrown = resolveWeaponActionProfileV130(weapon)?.kind === 'grenade';
    assert.equal(thrown, devices.includes(weapon.id) || weapon.name.split(' — ')[0] === 'M40 HEDP Grenade', weapon.id);
  }
  // A field alone does not admit another weapon: both the field and the exact mechanism are required.
  assert.equal(resolveWeaponActionProfileV130({ id: 'weapon-999-x', name: 'X', family: 'explosive', thrownDeviceV188: { radius: 100, fuse: 1 } }), null);
  for (const id of devices) {
    const { engine, messages } = mission(id);
    try {
      const actor = engine.player, device = ARSENAL_THROWN_DEVICES_V188[id], profile = getArsenalProfileV188(id);
      assert.equal(profile.fire.actionKind, 'grenade'); assert.equal(profile.feed.kind, 'carried'); assert.equal(profile.feed.nativeBridge, null);
      assert.equal(resolveWeaponActionProfileV130(id).radius, device.radius); assert.equal(resolveWeaponActionProfileV130(id).fuse, device.fuse);
      const before = total(actor);
      // Declared injection: one hostile is placed two metres in front of the marine so the blast has a target.
      const enemy = engine.enemies.find(entry => entry.alive);
      if (enemy) { enemy.x = actor.x + 110; enemy.y = actor.y + actor.h - enemy.h; enemy.dormant = false; }
      engine.keys.add('ShiftLeft'); // aim on the spot: the trigger throws instead of a contextual melee
      let frames = 0; while (total(actor) === before && frames++ < 240) { engine.fire(actor); engine.update(STEP); }
      engine.keys.delete('ShiftLeft');
      assert.equal(before - total(actor), 1, id + ' one device per throw');
      run(engine, 240);
      const exploded = messages.filter(event => event.type === 'grenade-exploded-v130' && event.weaponId === id);
      assert.equal(exploded.length, 1, id + ' explodes once');
      const statuses = messages.filter(event => event.type === 'weapon-status-v131' && event.weaponId === ARSENAL_STATUS_CARRIER_V188);
      if (device.status && enemy && exploded[0].affected > 0) assert.ok(statuses.some(event => event.status === device.status), id + ' applies ' + device.status);
      if (!device.status) assert.equal(statuses.length, 0, id + ' applies no status');
    } finally { engine.dispose?.(); }
  }
});

test('every lot-C weapon is playable in a mission: fires, spends exactly its shots, reloads, draws its placeholder', () => {
  for (const weapon of WEAPON_CATALOG_FRANCHISE_LOT_C_V188) {
    if (weapon.thrownDeviceV188) continue; // covered by the thrown-device test
    const { engine } = mission(weapon.id);
    try {
      const actor = engine.player, profile = getArsenalProfileV188(weapon.id);
      assert.equal(engine.weaponRuntime?.id || engine.weapon?.id, weapon.id);
      let strokes = 0; const ctx = new Proxy({}, { get: (target, key) => key in target ? target[key] : () => { strokes++; }, set: (t, k, v) => (t[k] = v, true) });
      engine.drawArsenalPlaceholdersV188(ctx);
      assert.ok(strokes >= 3, weapon.id + ' draws its named Canvas slot');
      assert.equal(actor.magazineSize, weapon.magazine, weapon.id);
      assert.equal(engine.getArsenalStateV188().bridged, Boolean(profile.feed.nativeBridge), weapon.id);
      const start = total(actor), shots0 = actor.shots, want = Math.min(3, actor.ammo);
      assert.ok(fireUntil(engine, want) >= want, weapon.id + ' fires');
      run(engine, 120);
      const fired = actor.shots - shots0, spent = start - total(actor);
      assert.equal(spent, fired, weapon.id + ' spends exactly its accepted shots');
      const afterFire = total(actor), shots = actor.shots;
      if (actor.ammo < actor.magazineSize) assert.equal(engine.reload(actor), true, weapon.id + ' reload accepted');
      run(engine, 700);
      assert.equal(actor.shots, shots);
      assert.equal(actor.ammo, Math.min(actor.magazineSize, afterFire), weapon.id + ' reloaded');
      assert.equal(total(actor), afterFire, weapon.id + ' ammunition conserved by the reload');
      if (profile.feed.nativeBridge === 'tube') assert.ok(engine.getArsenalStateV188().stats.pumps >= 1, weapon.id + ' pumped');
    } finally { engine.dispose?.(); }
  }
});

test('secondary fire: the mode table cites its sources and keeps documented / proposed / to define apart', () => {
  assert.deepEqual(WEAPON_SECONDARY_MODES_V188.map(mode => mode.id), ['m41a-u1-30mm-pump', 'm41a2-avp2010-grenade', 'f90-sl40-grenade', 'draco-grenade',
    'ripley-m240-flame', 'zx76-both-barrels', 'vp78-single-shot']);
  for (const mode of WEAPON_SECONDARY_MODES_V188) {
    assert.ok(Object.isFrozen(mode) && mode.sources.every(url => /^https:\/\//.test(url)) && mode.documented.length && mode.proposed.length && mode.toDefine.length, mode.id);
    assert.ok(!/1:1/.test(JSON.stringify(mode)), mode.id);
    assert.ok(mode.cue === null || AUDIO_CUE_IDS_V188.includes(mode.cue), mode.id);
    for (const text of [mode.label.fr, mode.label.en]) assert.ok(text && text.length <= 10, mode.id);
  }
  // The four reviewed M41A identities (base and finishes) host the 30 mm launcher; no other weapon gets it by name.
  const m41a = SECONDARY_FIRE_WEAPON_IDS_V188.filter(id => resolveSecondaryModeV188(id).id === 'm41a-u1-30mm-pump');
  assert.deepEqual(m41a, ['weapon-001-m41a-pulse-rifle', 'weapon-041-m41a-pulse-rifle-field', 'weapon-081-m41a-pulse-rifle-veteran', 'weapon-121-m41a-pulse-rifle-prototype']);
  assert.equal(resolveSecondaryModeV188('weapon-002-m41a2-pulse-rifle'), null);
  assert.equal(resolveSecondaryModeV188('weapon-262-hudson-pulse-rifle-legendary'), null);
  assert.deepEqual(SECONDARY_FIRE_WEAPON_IDS_V188.filter(id => !m41a.includes(id)), ['weapon-202-draco-double-burner', 'weapon-212-covenant-thales-f90-sl40',
    'weapon-225-vp78-pistol', 'weapon-226-zx-76-shotgun', 'weapon-227-m41a-2-pulse-rifle', 'weapon-266-ripley-m41a-m240-combination']);
  assert.equal(getArsenalProfileV188('weapon-001-m41a-pulse-rifle').fire.modes.includes('underbarrel-30mm-native-secondary-fire-v188'), true);
});

test('T106 — M41A 30 mm underbarrel launcher: four grenades, pump after each, own counter, primary feed untouched', () => {
  const { engine, messages } = mission('weapon-001-m41a-pulse-rifle');
  try {
    const actor = engine.player, primary = total(actor), shots = actor.shots;
    let state = engine.getSecondaryFireStateV188();
    assert.equal(state.available, true); assert.equal(state.loaded, 4); assert.equal(state.reserve, 4); assert.equal(state.capacity, 4);
    assert.match(state.hud, /^TIR SEC\. \[N\] LG 30 MM 4\/4 · PRÊT$/);
    assert.equal(press(engine), true, 'first grenade');
    state = engine.getSecondaryFireStateV188();
    assert.equal(state.loaded, 3); assert.equal(state.needsPump, true); assert.equal(state.projectiles, 1);
    assert.match(state.hud, /POMPE$/);
    assert.equal(press(engine), false, 'no second grenade before the pump stroke');
    run(engine, 60);
    assert.equal(engine.getSecondaryFireStateV188().needsPump, false, 'pumped automatically after 0,5 s');
    for (let i = 0; i < 3; i++) { assert.equal(press(engine), true, 'grenade ' + (i + 2)); run(engine, 70); }
    state = engine.getSecondaryFireStateV188();
    assert.equal(state.loaded, 0); assert.equal(state.reserve, 4); assert.match(state.hud, /VIDE$/);
    assert.equal(state.stats.grenades, 4); assert.ok(state.stats.pumps >= 3);
    run(engine, 300);
    assert.equal(messages.filter(event => event.type === 'secondary-impact-v188').length, 4, 'four explosions');
    assert.equal(messages.filter(event => event.type === 'grenade-exploded-v130' && event.weaponId === 'weapon-001-m41a-pulse-rifle').length, 4);
    assert.equal(total(actor), primary, 'the 10 mm feed is untouched'); assert.equal(actor.shots, shots, 'no primary shot serial is consumed');
    // Empty tube: the same action reloads it, grenade by grenade; firing the rifle interrupts and keeps the grenades already inserted.
    assert.equal(press(engine), true, 'reload begins');
    assert.match(engine.getSecondaryFireStateV188().hud, /RECHARGE$/);
    run(engine, Math.ceil(0.7 * 2 / STEP) + 2);
    assert.equal(engine.getSecondaryFireStateV188().loaded, 2);
    engine.fire(actor); run(engine, 2);
    state = engine.getSecondaryFireStateV188();
    assert.equal(state.reloading, false); assert.equal(state.loaded, 2); assert.equal(state.reserve, 2); assert.equal(state.stats.interrupted, 1);
    run(engine, 60); // cold chamber after a reload from empty: one stroke
    assert.equal(press(engine), true, 'fires again after the interrupted reload');
    assert.equal(engine.getSecondaryFireStateV188().loaded, 1);
    // An ammunition crate tops the reserve up, within the ceiling.
    engine.collectSupply(actor, { type: 'ammo', amount: 10, used: false });
    assert.equal(engine.getSecondaryFireStateV188().reserve, 3);
  } finally { engine.dispose?.(); }
});

test('secondary fire by key: held code N (keyboard, touch button, gamepad) fires one grenade per press; a held key does not repeat', () => {
  const { engine } = mission('weapon-227-m41a-2-pulse-rifle');
  try {
    assert.equal(SECONDARY_FIRE_CODE_V188, 'KeyN');
    engine.keys.add('KeyN'); run(engine, 90);
    assert.equal(engine.getSecondaryFireStateV188().stats.grenades, 1, 'one grenade for one held press');
    engine.keys.delete('KeyN'); run(engine, 2); engine.keys.add('KeyN'); run(engine, 2); engine.keys.delete('KeyN');
    assert.equal(engine.getSecondaryFireStateV188().stats.grenades, 2);
    assert.equal(engine.getSecondaryFireStateV188().loaded, 2);
    // Paused: nothing fires and the press made during the pause is not replayed.
    engine.paused = true; engine.keys.add('KeyN'); run(engine, 5); engine.paused = false; run(engine, 5); engine.keys.delete('KeyN');
    assert.equal(engine.getSecondaryFireStateV188().stats.grenades, 2);
  } finally { engine.dispose?.(); }
  // Gamepad: the left-stick press holds the action code, except while it is the speed-reload modifier.
  const source = read('src/mission-input-v77.js');
  assert.match(source, /secondary: 'KeyN'/); assert.match(source, /secondary: buttons\[10\] && !this\.engine\.experimentalPhysicalMagazinesV167/);
  assert.equal(SECONDARY_FIRE_GAMEPAD_BUTTON_V188, 10); assert.equal(typeof MissionGamepadInputV77, 'function');
});

test('T107 and the documented secondaries: Ripley combination, F90 + SL40, M41A/2, Draco, ZX-76, VP78', () => {
  // Ripley: rifle primary, M240 flames on the secondary with their own tank.
  let fixture = mission('weapon-266-ripley-m41a-m240-combination');
  try {
    const { engine } = fixture, actor = engine.player, primary = total(actor);
    assert.match(engine.getSecondaryFireStateV188().hud, /M240 40\/40 · PRÊT$/);
    engine.keys.add('KeyN'); run(engine, 60); engine.keys.delete('KeyN');
    const state = engine.getSecondaryFireStateV188();
    assert.ok(state.stats.streams >= 8 && state.loaded === 40 - state.stats.streams, 'a held key sustains the flame, one unit per jet');
    assert.equal(total(actor), primary, 'the rifle feed is untouched by the flames');
    assert.ok(fireUntil(engine, 3) >= 3, 'the rifle still fires'); assert.equal(primary - total(actor), actor.shots);
    // Empty tank → the action replaces it from the reserve in one piece.
    while (engine.getSecondaryFireStateV188().loaded > 0) { engine.keys.add('KeyN'); run(engine, 30); }
    engine.keys.delete('KeyN'); run(engine, 2);
    assert.equal(press(engine), true); run(engine, Math.ceil(2.4 / STEP) + 4);
    assert.equal(engine.getSecondaryFireStateV188().loaded, 40); assert.equal(engine.getSecondaryFireStateV188().reserve, 0);
  } finally { fixture.engine.dispose?.(); }
  // F90 + SL40: one round per load.
  fixture = mission('weapon-212-covenant-thales-f90-sl40');
  try {
    const { engine } = fixture;
    assert.match(engine.getSecondaryFireStateV188().hud, /SL40 1\/4/);
    assert.equal(press(engine, 70), true); assert.equal(engine.getSecondaryFireStateV188().loaded, 0);
    assert.equal(press(engine), true, 'reload'); run(engine, Math.ceil(1.4 / STEP) + 4);
    assert.equal(engine.getSecondaryFireStateV188().loaded, 1); assert.equal(engine.getSecondaryFireStateV188().reserve, 3);
  } finally { fixture.engine.dispose?.(); }
  for (const [id, capacity] of [['weapon-227-m41a-2-pulse-rifle', 4], ['weapon-202-draco-double-burner', 3]]) {
    fixture = mission(id);
    try {
      const { engine } = fixture, actor = engine.player, primary = total(actor);
      assert.equal(engine.getSecondaryFireStateV188().loaded, capacity, id);
      assert.equal(press(engine, 70), true, id); assert.equal(engine.getSecondaryFireStateV188().loaded, capacity - 1, id);
      assert.equal(total(actor), primary, id + ' primary untouched');
    } finally { fixture.engine.dispose?.(); }
  }
  // ZX-76: both barrels spend two primary shells at once. VP78: one round instead of the burst of three.
  for (const [id, rounds, pellets] of [['weapon-226-zx-76-shotgun', 2, 12], ['weapon-225-vp78-pistol', 1, 1]]) {
    fixture = mission(id);
    try {
      const { engine } = fixture, actor = engine.player, before = total(actor), shots = actor.shots;
      const state = engine.getSecondaryFireStateV188();
      assert.equal(state.ownFeed, false, id); assert.ok(state.hud.includes(`${actor.ammo}/${rounds}`), id);
      assert.equal(press(engine, 0), true, id);
      assert.equal(engine.weaponProjectilesV131.length, pellets, id + ' projectiles in the same frame');
      run(engine, 60);
      assert.equal(before - total(actor), rounds, id); assert.equal(actor.shots - shots, rounds, id);
      assert.ok(resolveWeaponActionProfileV131(id));
    } finally { fixture.engine.dispose?.(); }
  }
  // A weapon without a secondary: the action does nothing and no counter is drawn.
  fixture = mission('weapon-252-m4ra-battle-rifle');
  try {
    const { engine } = fixture;
    assert.equal(engine.getSecondaryFireStateV188().available, false); assert.equal(engine.getSecondaryFireStateV188().hud, null);
    assert.equal(press(engine), false);
  } finally { fixture.engine.dispose?.(); }
});

test('save and resume: the secondary feed is captured additively, restored exactly, refused when tampered; old saves start full', () => {
  const first = mission('weapon-001-m41a-pulse-rifle');
  let saved;
  try {
    const { engine } = first;
    press(engine, 70); press(engine, 70);
    saved = JSON.parse(JSON.stringify(engine.captureResumeState()));
    assert.equal(saved.player.secondaryFireV188.schema, 188); assert.equal(saved.player.secondaryFireV188.modeId, 'm41a-u1-30mm-pump');
    assert.equal(saved.player.secondaryFireV188.feed.v174.tube + saved.player.secondaryFireV188.feed.v174.chamber, 2);
  } finally { first.engine.dispose?.(); }
  const resume = raw => {
    const { engine } = mission('weapon-001-m41a-pulse-rifle');
    try { const result = engine.applyResumeState(raw); return { result, state: engine.getSecondaryFireStateV188(), fire: press(engine, 70), after: engine.getSecondaryFireStateV188() }; }
    finally { engine.dispose?.(); }
  };
  const exact = resume(saved);
  assert.equal(exact.result.applied, true); assert.equal(exact.result.secondaryFireRestoredV188, true);
  assert.equal(exact.state.loaded, 2); assert.equal(exact.state.reserve, 4); assert.equal(exact.fire, true); assert.equal(exact.after.loaded, 1);
  // Tampered counters (more grenades than the tube or the ceiling hold) are refused: the mode's own start values apply.
  const forged = JSON.parse(JSON.stringify(saved)); forged.player.secondaryFireV188.feed.v174.reserve = 500;
  const refused = resume(forged);
  assert.equal(refused.result.secondaryFireRestoredV188, false); assert.equal(refused.state.loaded, 4); assert.equal(refused.state.reserve, 4);
  const forgedTube = JSON.parse(JSON.stringify(saved)); forgedTube.player.secondaryFireV188.feed.v174.tube = 9;
  assert.equal(resume(forgedTube).result.secondaryFireRestoredV188, false);
  // A save made before this lot has no field: the weapon starts with its full secondary.
  const old = JSON.parse(JSON.stringify(saved)); delete old.player.secondaryFireV188;
  const legacy = resume(old);
  assert.equal(legacy.result.applied, true); assert.equal(legacy.result.secondaryFireRestoredV188, false); assert.equal(legacy.state.loaded, 4);
  // A record of another weapon never restores onto this one.
  const other = JSON.parse(JSON.stringify(saved)); other.player.secondaryFireV188.weaponId = 'weapon-227-m41a-2-pulse-rifle';
  assert.equal(resume(other).result.secondaryFireRestoredV188, false);
  // Generic feed (Ripley's tank).
  const ripley = mission('weapon-266-ripley-m41a-m240-combination');
  let tank;
  try { ripley.engine.keys.add('KeyN'); run(ripley.engine, 30); ripley.engine.keys.delete('KeyN'); tank = JSON.parse(JSON.stringify(ripley.engine.captureResumeState())); }
  finally { ripley.engine.dispose?.(); }
  const again = mission('weapon-266-ripley-m41a-m240-combination');
  try {
    assert.equal(again.engine.applyResumeState(tank).secondaryFireRestoredV188, true);
    assert.equal(again.engine.getSecondaryFireStateV188().loaded, tank.player.secondaryFireV188.feed.loaded);
    tank.player.secondaryFireV188.feed.loaded = 41;
    assert.equal(again.engine.applyResumeState(tank).secondaryFireRestoredV188, false);
  } finally { again.engine.dispose?.(); }
  // Opt-out for hosts and tests.
  const off = missionV136({ weapon: named('weapon-001-m41a-pulse-rifle'), secondaryFireV188: false });
  try { assert.equal(off.engine.getSecondaryFireStateV188().available, false); assert.equal(off.engine.requestSecondaryFireV188(), false); }
  finally { off.engine.dispose?.(); }
});

test('input and wiring: one rebindable action on a free default key, touch button hidden by default, composition order, dev range', () => {
  const action = KEY_ACTIONS_V188.find(entry => entry.id === 'secondaryFire');
  assert.deepEqual(action, { id: 'secondaryFire', code: 'KeyN', fr: 'Tir secondaire', en: 'Secondary fire' });
  assert.equal(KEY_ACTIONS_V188.filter(entry => entry.code === 'KeyN').length, 1, 'the default key is free in the bindings table');
  assert.equal(defaultKeyBindingsV188().secondaryFire, 'KeyN');
  const moved = buildKeyTranslationV188({ ...defaultKeyBindingsV188(), secondaryFire: 'KeyG' });
  assert.equal(moved.get('KeyG'), 'KeyN'); assert.equal(moved.get('KeyN'), null);
  const html = read('index.html');
  assert.match(html, /<button id="mission-secondary-v188" data-mission-key="KeyN" aria-label="Tir secondaire" hidden>TIR 2<\/button>/);
  const app = read('src/app.js');
  assert.match(app, /engine\.secondaryInputV188 = \{/); assert.match(app, /byId\('mission-secondary-v188'\); if \(button\) button\.hidden = !available/);
  const runtime = read('src/game-production-runtime.js');
  assert.match(runtime, /withMagazineRecoveryWorldV168\(withSecondaryFireV188\(withArsenalFeedsV188\(withMotionTrackerV160\(/);
  const range = read('devtools/dev-range-v188.js');
  assert.match(range, /secondaryFire\(/); assert.match(range, /getSecondaryFireStateV188/);
  for (const text of [...Object.values(SECONDARY_FIRE_STATUS_V188), SECONDARY_FIRE_LABEL_V188]) assert.ok(text.fr && text.en);
  // The availability callback drives the touch button.
  const seen = [];
  const { engine } = missionV136({ weapon: named('weapon-001-m41a-pulse-rifle') });
  try { engine.secondaryInputV188 = { onAvailability: available => seen.push(available), keyLabel: () => 'G', language: () => 'en' }; engine.secondaryAvailabilityV188 = null; run(engine, 2);
    assert.deepEqual(seen, [true]); assert.match(engine.getSecondaryFireStateV188().hud, /^ALT FIRE \[G\] 30 MM GL 4\/4 · READY$/); }
  finally { engine.dispose?.(); }
});
