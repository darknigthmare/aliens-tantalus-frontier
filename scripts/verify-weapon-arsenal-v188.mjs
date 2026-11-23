// Spec 014 — arsenal completion: catalogue integrity, feed policy, native
// special-feed reloads, VFX/audio hooks and saves. Fixtures: the shared
// Forge-native mission host (forge-native-host-v136.mjs) started with the
// weapon under test; the reserve is raised by direct assignment where noted.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { WEAPONS, CONTENT_COUNTS, validateContent } from '../src/content-core-v50.js';
import { WEAPON_CATALOG_ADDITIONS_V188, WEAPON_ADDITION_IDS_V188 } from '../src/weapon-catalog-additions-v188.js';
import { WEAPON_RESEARCH_SUPPLEMENT_V188 } from '../src/weapon-catalog-franchise-v188.js';
import { WEAPON_ARSENAL_PROFILES_V188, ARSENAL_SOURCE_ROWS_V188, ARSENAL_BRIDGED_WEAPON_IDS_V188,
  ARSENAL_LOT_A_BASE_IDS_V188, getArsenalProfileV188, listArsenalProfilesV188, arsenalBaseIdV188 } from '../src/weapon-arsenal-v188.js';
import { inspectDetachableFeedV193 } from '../src/weapon-feed-admission-v193.js';
import { resolveWeaponVisualProfileV63 } from '../src/weapon-visual-runtime-v63.js';
import { WEAPON_RESEARCH_INDEX_V171 } from '../src/weapon-research-index-v171.js';
import { WEAPON_FIDELITY_DOSSIERS_V170 } from '../src/weapon-fidelity-ledger-v170.js';
import { AUDIO_CUE_IDS_V188 } from '../src/audio-cues-v188.js';
import { cancelTacticalReloadV77 } from '../src/tactical-reload-v77.js';
import { ARSENAL_PLACEHOLDER_SLOTS_V188 } from '../src/weapon-arsenal-runtime-v188.js';
import { missionV136 } from './forge-native-host-v136.mjs';

const named = id => WEAPONS.find(weapon => weapon.id === id);
const STEP = 1 / 60;
function mission(id, extra = {}) {
  const fixture = missionV136({ weapon: named(id), ...extra });
  fixture.engine.player.ammoReserve = Math.max(fixture.engine.player.ammoReserve, 20); // declared injection
  return fixture;
}
const run = (engine, frames) => { for (let i = 0; i < frames; i++) engine.update(STEP); };
const total = actor => actor.ammo + actor.ammoReserve;
function fireUntil(engine, count, limit = 600) {
  const actor = engine.player; let fired = 0;
  for (let i = 0; i < limit && fired < count; i++) { if (engine.fire(actor)) fired++; engine.update(STEP); }
  return fired;
}
function parseCsv(text) {
  const rows = []; let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) { if (c === '"' && text[i + 1] === '"') { field += '"'; i++; } else if (c === '"') quoted = false; else field += c; }
    else if (c === '"') quoted = true; else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field.replace(/\r$/, '')); rows.push(row); row = []; field = ''; } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

test('catalogue integrity: 178 historical ids unchanged, append-only additions (three Lot-A, then the franchise lot B)', () => {
  assert.equal(WEAPONS.length, 178 + WEAPON_ADDITION_IDS_V188.length); assert.equal(CONTENT_COUNTS.weapons, WEAPONS.length); assert.deepEqual(validateContent?.() ?? [], validateContent?.() ?? []);
  assert.deepEqual(WEAPONS.slice(178).map(weapon => weapon.id), WEAPON_ADDITION_IDS_V188);
  assert.equal(new Set(WEAPONS.map(weapon => weapon.id)).size, WEAPONS.length);
  assert.equal(WEAPONS[0].id, 'weapon-001-m41a-pulse-rifle'); assert.equal(WEAPONS[177].id, 'weapon-177-8a7-dambulla-machine-pistol');
  for (const weapon of WEAPON_CATALOG_ADDITIONS_V188) {
    assert.match(weapon.id, /^weapon-(19[4-9]|2\d\d)-[a-z0-9-]+$/);
    assert.equal(weapon.canonExact, false); assert.ok(weapon.sourceUrl && weapon.sourceWork && weapon.description && /proposed/.test(weapon.statsPolicy));
    assert.equal(resolveWeaponVisualProfileV63(weapon), null, 'no plaque: the armory keeps procurement closed');
    assert.ok([...WEAPON_RESEARCH_INDEX_V171, ...WEAPON_RESEARCH_SUPPLEMENT_V188].some(row => row.id === weapon.researchId), weapon.researchId);
    if (weapon.fidelityDossierId) assert.ok(WEAPON_FIDELITY_DOSSIERS_V170.some(row => row.id === weapon.fidelityDossierId));
    assert.ok(Object.isFrozen(weapon));
  }
});

test('the embedded source table is the arsenal CSV verbatim for every catalogue identity it records', () => {
  const rows = parseCsv(readFileSync(new URL('../docs/arsenal/data/tantalus_arsenal_master_v1.csv', import.meta.url), 'utf8').replace(/^﻿/, ''));
  const header = rows[0], col = name => header.indexOf(name);
  const csv = rows.slice(1).filter(row => /^weapon-/.test(row[0])).map(row => [row[0], row[col('Alimentation')], row[col('Munition / calibre')],
    row[col('Œuvre principale')], row[col('Crédibilité')], row[col('Capacité canon')], row[col('Rôle')]]);
  assert.deepEqual(ARSENAL_SOURCE_ROWS_V188.map(row => [...row]), csv);
  for (const [id] of csv) assert.ok(named(id), id);
});

test('every catalogue weapon exposes one frozen, range-readable profile without 1:1 claims', () => {
  assert.equal(WEAPON_ARSENAL_PROFILES_V188.length, WEAPONS.length);
  for (const weapon of WEAPONS) {
    const profile = getArsenalProfileV188(weapon.id);
    assert.ok(profile && Object.isFrozen(profile) && Object.isFrozen(profile.feed), weapon.id);
    assert.equal(getArsenalProfileV188({ id: weapon.id }), profile); assert.equal(getArsenalProfileV188({ weaponId: weapon.id }), profile);
    assert.equal(profile.fidelity.canonExact, false); assert.equal(profile.fidelity.visualFidelity1to1, false);
    assert.ok(profile.feed.kind && profile.reload.transaction && profile.vfx.muzzle && profile.fire.roundsPerSecond > 0, weapon.id);
    assert.ok(profile.audio.shot === null || AUDIO_CUE_IDS_V188.includes(profile.audio.shot));
    assert.ok(profile.feed.runtimeCapacity >= 1);
  }
  for (const bad of ['weapon-191', 'weapon-001', 'M41A Pulse Rifle', 'weapon-999-m41a-pulse-rifle', null, {}, 7]) assert.equal(getArsenalProfileV188(bad), null);
  // Finish variants share their base through the generator, not by name.
  assert.equal(arsenalBaseIdV188('weapon-047-m37a2-pump-shotgun-field'), 'weapon-007-m37a2-pump-shotgun');
  assert.equal(arsenalBaseIdV188(WEAPONS[145]), WEAPONS[25].id, 'id 146 is seed (146 - 1) % 40');
  assert.equal(arsenalBaseIdV188('weapon-194-hicks-ithaca-37-shotgun'), 'weapon-194-hicks-ithaca-37-shotgun');
  assert.equal(listArsenalProfilesV188({ lotA: true }).length, ARSENAL_LOT_A_BASE_IDS_V188.reduce((n, id) =>
    n + WEAPONS.filter(weapon => arsenalBaseIdV188(weapon) === id).length, 0));
});

test('feed policy: physical detachable magazines stay limited to the reviewed M41A and (V188, decision A6) VP70 ids', () => {
  const detachable = WEAPON_ARSENAL_PROFILES_V188.filter(profile => profile.feed.detachableMagazine).map(profile => profile.weaponId);
  assert.deepEqual(detachable, WEAPONS.filter(weapon => inspectDetachableFeedV193(weapon).detachable).map(weapon => weapon.id));
  assert.deepEqual(detachable, ['weapon-001-m41a-pulse-rifle', 'weapon-004-vp70-combat-pistol', 'weapon-041-m41a-pulse-rifle-field',
    'weapon-044-vp70-combat-pistol-field', 'weapon-081-m41a-pulse-rifle-veteran', 'weapon-084-vp70-combat-pistol-veteran',
    'weapon-121-m41a-pulse-rifle-prototype', 'weapon-124-vp70-combat-pistol-prototype']);
  for (const profile of WEAPON_ARSENAL_PROFILES_V188) {
    assert.equal(profile.feed.worldPickup !== 'none-non-detachable-or-unreviewed', profile.feed.detachableMagazine, profile.weaponId);
    if (profile.feed.nativeBridge) {
      assert.equal(profile.feed.detachableMagazine, false);
      assert.equal(profile.feed.kind, profile.feed.nativeBridge, 'the bridge follows the recorded feed: ' + profile.weaponId);
    }
  }
  assert.equal(ARSENAL_BRIDGED_WEAPON_IDS_V188.length, 75); // 31 Lot-A ids + lot B (T104 bases with finishes, bridged franchise rows)
  assert.equal(getArsenalProfileV188('weapon-011-m83-sadar').feed.runtimeCapacity, 1);
  assert.equal(getArsenalProfileV188('weapon-021-357-magnum-revolver').feed.runtimeCapacity, 6);
  assert.equal(getArsenalProfileV188('weapon-005-m56-smartgun').vfx.ejection, 'none-caseless');
  assert.equal(getArsenalProfileV188('weapon-007-m37a2-pump-shotgun').vfx.ejection, 'pump-cycle');
  assert.equal(getArsenalProfileV188('weapon-194-hicks-ithaca-37-shotgun').vfx.ejection, 'pump-cycle');
  assert.equal(getArsenalProfileV188('weapon-021-357-magnum-revolver').vfx.ejection, 'retained-until-reload');
  assert.equal(getArsenalProfileV188('weapon-196-sevastopol-flamethrower').vfx.ejection, 'none');
});

test('tube: one pump per accepted shot, shell-by-shell reload keeps inserted shells when interrupted', () => {
  const { engine } = mission('weapon-194-hicks-ithaca-37-shotgun');
  try {
    const actor = engine.player, start = total(actor);
    assert.equal(engine.getArsenalStateV188().kind, 'tube');
    assert.equal(engine.fire(actor), true);
    assert.equal(engine.getArsenalStateV188().needsCycle, true);
    actor.fireClock = 0; assert.equal(engine.fire(actor), false, 'no second shot before the pump');
    run(engine, 30);
    assert.equal(engine.getArsenalStateV188().needsCycle, false); assert.equal(engine.getArsenalStateV188().stats.pumps, 1);
    assert.equal(fireUntil(engine, 2), 2); run(engine, 40);
    assert.equal(actor.ammo, 1); assert.equal(total(actor), start - 3);
    assert.equal(engine.reload(actor), true);
    run(engine, Math.ceil(actor.tacticalReload.completeAt / STEP * 0.6));
    const inserted = actor.ammo;
    assert.ok(inserted > 1 && inserted < 4, 'some shells inserted: ' + inserted);
    cancelTacticalReloadV77(actor, 'test-interrupt'); run(engine, 2);
    assert.equal(actor.ammo, inserted, 'interruption keeps the inserted shells'); assert.equal(total(actor), start - 3);
    assert.equal(engine.reload(actor), true); run(engine, 300);
    assert.equal(actor.ammo, 4); assert.equal(total(actor), start - 3);
    assert.ok(engine.getArsenalStateV188().stats.interrupted >= 1);
  } finally { engine.dispose?.(); }
});

test('single-shot launcher: mechanism capacity is one rocket, the surplus moves to reserve, total conserved', () => {
  const { engine } = mission('weapon-011-m83-sadar');
  try {
    const actor = engine.player;
    assert.equal(actor.magazineSize, 1); assert.equal(actor.ammo, 1);
    const start = total(actor);
    assert.equal(fireUntil(engine, 1), 1);
    run(engine, 200); assert.equal(actor.ammo, 0); engine.reload(actor); run(engine, 400);
    assert.equal(actor.ammo, 1, 'one rocket re-chambered'); assert.equal(total(actor), start - 1);
    const state = engine.getArsenalStateV188();
    assert.ok(state.stats.trails > 0, 'rocket smoke trail'); assert.ok(state.stats.explosions >= 1, 'explosion VFX on impact');
  } finally { engine.dispose?.(); }
});

test('cylinder, belt and tank reloads conserve ammunition through completion and interruption', () => {
  for (const id of ['weapon-021-357-magnum-revolver', 'weapon-005-m56-smartgun', 'weapon-006-m240-incinerator-unit', 'weapon-196-sevastopol-flamethrower']) {
    const { engine } = mission(id);
    try {
      const actor = engine.player, kind = engine.getArsenalStateV188().kind;
      assert.equal(kind, getArsenalProfileV188(id).feed.nativeBridge, id);
      const fired = fireUntil(engine, 3); const start = total(actor) + fired;
      assert.equal(fired, 3, id);
      assert.equal(engine.reload(actor), true, id);
      run(engine, Math.ceil(actor.tacticalReload.completeAt / STEP * 0.95));
      cancelTacticalReloadV77(actor, 'test-interrupt'); run(engine, 2);
      assert.equal(total(actor), start - 3, id + ' interruption');
      if (actor.ammo < actor.magazineSize) { engine.reload(actor); run(engine, 400); }
      assert.equal(actor.ammo, actor.magazineSize, id); assert.equal(total(actor), start - 3, id + ' complete');
      assert.equal(engine.getArsenalStateV188().pending, null);
    } finally { engine.dispose?.(); }
  }
});

test('saves: the feed survives a checkpoint, a forged feed is refused and older saves rebuild from numbers', () => {
  const { engine } = mission('weapon-007-m37a2-pump-shotgun');
  try {
    const actor = engine.player;
    assert.equal(engine.fire(actor), true);
    const snapshot = engine.captureResumeState();
    assert.equal(snapshot.player.arsenalFeedV188.feed.needsCycle, true);
    const before = structuredClone(snapshot);
    assert.equal(engine.applyResumeState(snapshot).arsenalFeedRestoredV188.player, true);
    assert.deepEqual(snapshot, before, 'restore does not mutate the save');
    assert.equal(engine.getArsenalStateV188().needsCycle, true, 'the spent shell is still chambered');
    const forged = structuredClone(before); forged.player.arsenalFeedV188.feed.loaded += 2;
    assert.equal(engine.applyResumeState(forged).arsenalFeedRestoredV188.player, false);
    assert.equal(engine.getArsenalStateV188().loaded, actor.ammo, 'rebuilt from the numeric inventory');
    const legacy = structuredClone(before); delete legacy.player.arsenalFeedV188;
    const receipt = engine.applyResumeState(legacy);
    assert.equal(receipt.applied, true); assert.equal(receipt.arsenalFeedRestoredV188.player, false);
    assert.equal(engine.getArsenalStateV188().bridged, true);
    assert.equal(total(actor), before.player.ammo + before.player.ammoReserve);
  } finally { engine.dispose?.(); }
});

test('opt-out and non-bridged weapons keep the historical numeric path', () => {
  for (const [id, extra] of [['weapon-001-m41a-pulse-rifle', {}], ['weapon-007-m37a2-pump-shotgun', { arsenalFeedsV188: false }],
    ['weapon-003-m4a3-service-pistol', {}]]) {
    const { engine } = mission(id, extra);
    try {
      assert.equal(engine.getArsenalStateV188().bridged, false, id);
      assert.equal(engine.player.magazineSize, named(id).magazine, id);
      assert.equal(engine.captureResumeState().player.arsenalFeedV188, undefined);
    } finally { engine.dispose?.(); }
  }
});

test('VFX and audio hooks: V131 shots reach the V188 muzzle pass, pump hulls eject at the cycle, cues are existing ids', () => {
  const { engine } = mission('weapon-195-sevastopol-pump-shotgun');
  try {
    const cues = [], shots = [];
    const audio = { cue: id => cues.push(id), shot() { shots.push(this.nextShotCueV188); this.nextShotCueV188 = null; } };
    engine.audio = new Proxy(audio, { get: (target, key) => key in target ? target[key] : () => false });
    const casings = () => engine.weaponEffectsSnapshotV124()?.counts.casings || 0;
    const muzzle = () => engine.getVfxSnapshotV188?.()?.stats.byKind?.['muzzle-star'] || 0;
    assert.equal(engine.fire(engine.player), true);
    assert.equal(casings(), 0, 'no hull before the pump stroke');
    run(engine, 40);
    assert.equal(casings(), 1, 'one hull at the pump cycle');
    assert.ok(engine.getArsenalStateV188().stats.muzzle >= 1);
    if (engine.vfxV188Enabled) assert.ok(muzzle() >= 1, 'V188 muzzle star for a V131 round');
    assert.deepEqual(shots, ['weapon-shotgun']); assert.ok(cues.includes('weapon-dry-fire'), 'pump clack cue');
    let strokes = 0; const ctx = new Proxy({}, { get: (target, key) => key in target ? target[key] : () => { strokes++; }, set: (t, k, v) => (t[k] = v, true) });
    engine.drawArsenalPlaceholdersV188(ctx);
    assert.ok(strokes > 4, 'Canvas primitives drawn');
    assert.ok(engine.getArsenalStateV188().stats.placeholders >= 1, 'pending plaque draws its named Canvas slot');
    assert.ok(ARSENAL_PLACEHOLDER_SLOTS_V188['held-weapon-placeholder-shotgun'] && ARSENAL_PLACEHOLDER_SLOTS_V188['held-weapon-placeholder-flamethrower']);
  } finally { engine.dispose?.(); }
  const rifle = mission('weapon-001-m41a-pulse-rifle').engine;
  try {
    fireUntil(rifle, 5); run(rifle, 30);
    assert.equal(rifle.weaponEffectsSnapshotV124()?.counts.casings || 0, 0, 'caseless M41A ejects no brass');
  } finally { rifle.dispose?.(); }
});
