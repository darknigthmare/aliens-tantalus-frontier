// Spec 014, lot B — franchise arsenal: catalogue rows 197+, provisional drawn
// plaque (purchasable), native feeds outside Lot A (T104) and every new weapon
// fired and reloaded in the shared Forge-native mission host.
// Fixture: forge-native-host-v136.mjs started with the weapon under test.
// Declared injections: the reserve is raised to at least 40 by direct
// assignment; nearby hostiles are not touched; a melee contact weapon is only
// asked to perform its action (no ammunition).
import test from 'node:test';
import assert from 'node:assert/strict';
import { WEAPONS } from '../src/content-core-v50.js';
import { WEAPON_CATALOG_FRANCHISE_V188, WEAPON_FRANCHISE_IDS_V188, WEAPON_FRANCHISE_LEDGER_V188,
  WEAPON_RESEARCH_SUPPLEMENT_V188, WEAPON_FRANCHISE_DESCRIPTIONS_EN_V188 } from '../src/weapon-catalog-franchise-v188.js';
import { WEAPON_ADDITION_IDS_V188 } from '../src/weapon-catalog-additions-v188.js';
import { getArsenalProfileV188, ARSENAL_BRIDGED_WEAPON_IDS_V188, ARSENAL_UNBRIDGED_SPECIAL_FEEDS_V188,
  ARSENAL_PLACEHOLDER_CATEGORIES_V188, ARSENAL_LOT_B_IDS_V188, listArsenalProfilesV188, arsenalDocumentedRateV188 } from '../src/weapon-arsenal-v188.js';
import { ARSENAL_PLACEHOLDER_SLOTS_V188, hasProvisionalPlaqueV188, drawProvisionalPlaqueV188, mountProvisionalPlaqueV188,
  provisionalPlaqueSlotV188, PROVISIONAL_PLAQUE_LABEL_V188 } from '../src/weapon-provisional-plaque-v188.js';
import { WEAPON_RESEARCH_INDEX_V171, getWeaponResearchIndexV171 } from '../src/weapon-research-index-v171.js';
import { resolveWeaponVisualProfileV63 } from '../src/weapon-visual-runtime-v63.js';
import { resolveHeldWeaponProfileV125 } from '../src/held-weapon-profiles-v125.js';
import { inspectDetachableFeedV193, WEAPON_FEED_EVIDENCE_V188 } from '../src/weapon-feed-admission-v193.js';
import { AUDIO_CUE_IDS_V188 } from '../src/audio-cues-v188.js';
import { EN_CATALOG_V185, EN_PATTERNS_V185 } from '../src/i18n-en-catalog-v185.js';
import { cancelTacticalReloadV77 } from '../src/tactical-reload-v77.js';
import { createDefaultSave, getProcurementQuote, procureCatalogItem, canAfford } from '../src/save.js';
import { missionV136 } from './forge-native-host-v136.mjs';

const named = id => WEAPONS.find(weapon => weapon.id === id);
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

test('catalogue: 38 append-only franchise rows after 196, reserved numbers skipped, no art borrowed', () => {
  assert.equal(WEAPON_CATALOG_FRANCHISE_V188.length, 38);
  assert.deepEqual(WEAPONS.slice(-38).map(weapon => weapon.id), WEAPON_FRANCHISE_IDS_V188);
  assert.deepEqual(WEAPON_ADDITION_IDS_V188.slice(3), WEAPON_FRANCHISE_IDS_V188);
  assert.equal(new Set(WEAPONS.map(weapon => weapon.id)).size, WEAPONS.length);
  const numbers = WEAPON_FRANCHISE_IDS_V188.map(id => Number(id.slice(7, 10)));
  assert.deepEqual(numbers, [...Array.from({ length: 19 }, (_, i) => 197 + i), ...Array.from({ length: 19 }, (_, i) => 217 + i)]);
  assert.ok(!numbers.includes(191) && !numbers.includes(216), '191 test-reserved, 216 wraps onto a V112 plate');
  const research = new Set([...WEAPON_RESEARCH_INDEX_V171, ...WEAPON_RESEARCH_SUPPLEMENT_V188].map(row => row.id));
  assert.equal(WEAPON_RESEARCH_INDEX_V171.length, 129, 'the V170 projection is not rewritten');
  for (const weapon of WEAPON_CATALOG_FRANCHISE_V188) {
    assert.match(weapon.id, /^weapon-\d{3}-[a-z0-9-]+$/);
    assert.ok(Object.isFrozen(weapon) && weapon.canonExact === false && /proposed/.test(weapon.statsPolicy), weapon.id);
    assert.match(weapon.sourceUrl, /^https:\/\//); assert.ok(weapon.sourceWork && weapon.identityEvidence && weapon.description, weapon.id);
    assert.ok(research.has(weapon.researchId), weapon.researchId);
    assert.equal(resolveWeaponVisualProfileV63(weapon), null, 'no borrowed plate: ' + weapon.id);
    assert.equal(resolveHeldWeaponProfileV125(weapon), null, 'no borrowed held PNG: ' + weapon.id);
    assert.equal(inspectDetachableFeedV193(weapon).detachable, false, 'no physical magazine without model evidence: ' + weapon.id);
    assert.ok(Number.isSafeInteger(weapon.magazine) && weapon.magazine >= 1 && weapon.damage > 0 && weapon.fireRate > 0 && weapon.reload > 0);
    assert.equal(weapon.magazine, weapon.feedV188.capacity);
    assert.equal(weapon.feedV188.capacityDocumented, typeof weapon.feedV188.capacitySource === 'string');
    assert.ok(!/1:1|fidèle à l’identique/.test(weapon.description));
  }
  for (const row of WEAPON_RESEARCH_SUPPLEMENT_V188) {
    assert.match(row.id, /^proposed-v188-[a-z0-9-]+$/); assert.match(row.sourceUrl, /^https:\/\//);
    assert.ok(WEAPON_CATALOG_FRANCHISE_V188.some(weapon => weapon.researchId === row.id), 'supplement row is cited: ' + row.id);
  }
  // The research view reports each exact promotion of an index row.
  const promoted = getWeaponResearchIndexV171().filter(row => row.promotedCatalogIdV188);
  assert.equal(promoted.length, 3 + WEAPON_CATALOG_FRANCHISE_V188.filter(weapon => !weapon.researchId.startsWith('proposed-v188-')).length);
});

test('ledger: one row per added weapon, documented / adapted / to define kept apart, capacities only documented with a source', () => {
  assert.equal(WEAPON_FRANCHISE_LEDGER_V188.length, WEAPON_CATALOG_FRANCHISE_V188.length);
  for (const row of WEAPON_FRANCHISE_LEDGER_V188) {
    const weapon = named(row.weaponId);
    assert.ok(weapon && row.canonExact === false && row.visualFidelity1to1 === false && row.plaque === 'provisional-drawn', row.weaponId);
    assert.ok(row.adapted.length >= 4 && row.adapted.every(text => text.endsWith('[PROPOSÉ]')), row.weaponId);
    assert.ok(row.toDefine.includes('plaque native'), row.weaponId);
    assert.equal(row.documented.some(text => text.startsWith('capacité ')), weapon.feedV188.capacityDocumented, row.weaponId);
    if (weapon.identityEvidence === 'index-name-only') assert.deepEqual(row.documented, [], 'nothing is called documented when the page was not re-read');
    const profile = getArsenalProfileV188(row.weaponId);
    assert.equal(profile.fidelity.status, 'source-identity-provisional-plaque');
    assert.equal(profile.fidelity.capacityDocumented, weapon.feedV188.capacityDocumented);
    assert.equal(profile.feed.runtimeCapacity, weapon.magazine);
    assert.equal(profile.lotA, false); assert.equal(profile.lotB, true);
  }
  assert.deepEqual(ARSENAL_LOT_B_IDS_V188, WEAPON_FRANCHISE_IDS_V188);
  assert.deepEqual(listArsenalProfilesV188({ lotB: true }).map(p => p.weaponId), WEAPON_FRANCHISE_IDS_V188);
  assert.equal(listArsenalProfilesV188({ lotA: true }).filter(p => p.weaponId === p.baseId).length, 21, 'Lot A is unchanged');
  const documented = WEAPON_CATALOG_FRANCHISE_V188.filter(weapon => weapon.feedV188.capacityDocumented).map(weapon => [weapon.id, weapon.magazine]);
  assert.deepEqual(documented, [['weapon-222-m39-u-submachine-gun', 48], ['weapon-223-xm99a1-phased-plasma-pulse-rifle', 100],
    ['weapon-231-m-4a4-pistol', 12], ['weapon-233-wy-102-sniper-rifle', 30], ['weapon-235-m-90-minigun', 900]]);
});

test('texts: every French description has its reviewed English entry in the catalogue', () => {
  for (const weapon of WEAPON_CATALOG_FRANCHISE_V188) {
    const english = WEAPON_FRANCHISE_DESCRIPTIONS_EN_V188[weapon.description];
    assert.ok(english && english !== weapon.description, weapon.id);
    assert.equal(EN_CATALOG_V185[weapon.description], english, weapon.id);
  }
  assert.ok(EN_CATALOG_V185[PROVISIONAL_PLAQUE_LABEL_V188]);
  assert.ok(EN_PATTERNS_V185['{0} — plaque provisoire dessinée, illustration à produire']);
});

test('provisional plaque: drawn with Canvas primitives behind named slots, and the weapon is purchasable', () => {
  const calls = [];
  const ctx = new Proxy({}, { get: (target, key) => key in target ? target[key] : (...args) => { calls.push(key); }, set: (t, k, v) => (t[k] = v, true) });
  for (const weapon of WEAPON_CATALOG_FRANCHISE_V188) {
    assert.equal(hasProvisionalPlaqueV188(weapon), true, weapon.id);
    const slot = provisionalPlaqueSlotV188(weapon), profile = getArsenalProfileV188(weapon.id);
    assert.equal(profile.held.placeholderSlot, slot); assert.equal(profile.held.art, 'canvas-placeholder');
    assert.equal(typeof ARSENAL_PLACEHOLDER_SLOTS_V188[slot], 'function', slot);
    assert.equal(ARSENAL_PLACEHOLDER_CATEGORIES_V188[weapon.placeholderCategoryV188][0], slot);
    calls.length = 0;
    assert.equal(drawProvisionalPlaqueV188(ctx, weapon), true);
    assert.ok(calls.filter(key => key === 'fillRect').length >= 3 && !calls.includes('drawImage'), weapon.id + ' primitives only');
    assert.ok(profile.audio.shot === null || AUDIO_CUE_IDS_V188.includes(profile.audio.shot));
  }
  assert.equal(hasProvisionalPlaqueV188(named('weapon-001-m41a-pulse-rifle')), false);
  assert.equal(hasProvisionalPlaqueV188({ id: 'bad', admissionV188: 'provisional-plaque-purchasable' }), false);
  // DOM mount (minimal fake document).
  const element = tag => ({ tag, dataset: {}, style: {}, children: [], attributes: {}, setAttribute(k, v) { this.attributes[k] = v; },
    append(...nodes) { this.children.push(...nodes); }, getContext: tag === 'canvas' ? () => ctx : undefined });
  const document = { createElement: element }, host = element('div');
  const figure = mountProvisionalPlaqueV188(document, host, named('weapon-197-nostromo-flamethrower'), 'Nostromo Flamethrower');
  assert.ok(figure && host.children[0] === figure); assert.equal(figure.dataset.provisionalPlaqueV188, 'weapon-197-nostromo-flamethrower');
  assert.equal(figure.children[1].textContent, PROVISIONAL_PLAQUE_LABEL_V188);
  assert.equal(mountProvisionalPlaqueV188(document, host, named('weapon-001-m41a-pulse-rifle')), null);
  // Procurement through the real strategy functions on a default save with funds (declared injection: resources raised).
  const save = createDefaultSave();
  save.galaxy.resources.credits = 1e7;
  for (const weapon of WEAPON_CATALOG_FRANCHISE_V188) {
    const quote = getProcurementQuote(save, 'weapon', weapon);
    assert.ok(quote.credits > 0 && canAfford(save, quote), weapon.id);
    assert.equal(procureCatalogItem(save, 'weapon', weapon).ok, true, weapon.id);
    assert.ok(save.strategy.inventory.weaponIds.includes(weapon.id), weapon.id);
  }
});

test('T104: native feeds outside Lot A — cells, project tanks, belts and the Frontier cylinder conserve ammunition', () => {
  assert.equal(ARSENAL_BRIDGED_WEAPON_IDS_V188.length, 75);
  const bases = ['weapon-020-es-4-electroshock-pistol', 'weapon-025-plasma-rifle', 'weapon-035-neuro-link-disruptor', 'weapon-158-n79-eva-laser',
    'weapon-160-eds-93-zadak', 'weapon-166-p649-hel', 'weapon-168-evi-87-zvezda', 'weapon-036-ripper-acid-projector', 'weapon-037-reef-caster',
    'weapon-039-cryo-lance', 'weapon-040-pathogen-containment-projector', 'weapon-147-ocap-91-volcan', 'weapon-152-type-99-incinerator',
    'weapon-150-l59-minigun', 'weapon-161-thunderbolt-mk2', 'weapon-170-frontier-revolver'];
  for (const id of bases) {
    const profile = getArsenalProfileV188(id);
    assert.equal(profile.feed.kind, profile.feed.nativeBridge, id); assert.equal(profile.reload.transaction, 'v188-native-special-feed');
    assert.equal(profile.feed.runtimeCapacity, named(id).magazine, id + ' keeps its catalogue capacity');
    const { engine } = mission(id);
    try {
      const actor = engine.player, state = engine.getArsenalStateV188();
      assert.equal(state.bridged, true, id); assert.equal(state.kind, profile.feed.nativeBridge, id);
      const start = total(actor), shots0 = actor.shots, want = Math.min(2, actor.ammo);
      assert.ok(fireUntil(engine, want) >= want, id + ' fires');
      run(engine, 90);
      const fired = actor.shots - shots0;
      assert.equal(start - total(actor), fired, id + ' one unit per accepted shot');
      assert.equal(engine.reload(actor), true, id + ' reload accepted');
      run(engine, Math.ceil(actor.tacticalReload.completeAt / STEP * 0.95));
      cancelTacticalReloadV77(actor, 'test-interrupt'); run(engine, 2);
      assert.equal(total(actor), start - fired, id + ' interruption');
      if (actor.ammo < actor.magazineSize) { engine.reload(actor); run(engine, 500); }
      assert.equal(actor.ammo, actor.magazineSize, id + ' full'); assert.equal(total(actor), start - fired, id + ' complete');
      assert.equal(engine.getArsenalStateV188().pending, null);
    } finally { engine.dispose?.(); }
  }
  for (const [id, reason] of Object.entries(ARSENAL_UNBRIDGED_SPECIAL_FEEDS_V188)) {
    assert.equal(getArsenalProfileV188(id).feed.nativeBridge, null, id); assert.ok(reason);
  }
});

test('every franchise weapon is playable in a mission: fires, spends exactly its shots, reloads, draws its placeholder', () => {
  for (const weapon of WEAPON_CATALOG_FRANCHISE_V188) {
    const { engine } = mission(weapon.id);
    try {
      const actor = engine.player, profile = getArsenalProfileV188(weapon.id);
      assert.equal(engine.weaponRuntime?.id || engine.weapon?.id, weapon.id);
      let strokes = 0; const ctx = new Proxy({}, { get: (target, key) => key in target ? target[key] : () => { strokes++; }, set: (t, k, v) => (t[k] = v, true) });
      engine.drawArsenalPlaceholdersV188(ctx);
      assert.ok(strokes >= 3, weapon.id + ' draws its named Canvas slot');
      if (weapon.family === 'melee') {
        assert.equal(engine.getArsenalStateV188().bridged, false);
        const before = total(actor);
        engine.fire(actor); run(engine, 60);
        assert.equal(total(actor), before, 'a contact weapon spends no ammunition');
        continue;
      }
      assert.equal(actor.magazineSize, weapon.magazine, weapon.id);
      assert.equal(engine.getArsenalStateV188().bridged, Boolean(profile.feed.nativeBridge), weapon.id);
      const start = total(actor), shots0 = actor.shots, want = Math.min(3, actor.ammo);
      assert.ok(fireUntil(engine, want) >= want, weapon.id + ' fires');
      run(engine, 120);
      const fired = actor.shots - shots0, spent = start - total(actor);
      assert.equal(spent, fired, weapon.id + ' spends exactly its accepted shots');
      const afterFire = total(actor), shots = actor.shots;
      assert.equal(engine.reload(actor), true, weapon.id + ' reload accepted');
      run(engine, 700);
      assert.equal(actor.shots, shots);
      assert.equal(actor.ammo, Math.min(actor.magazineSize, afterFire), weapon.id + ' reloaded');
      assert.equal(total(actor), afterFire, weapon.id + ' ammunition conserved by the reload');
      if (profile.feed.nativeBridge === 'tube') assert.ok(engine.getArsenalStateV188().stats.pumps >= 1, weapon.id + ' pumped');
    } finally { engine.dispose?.(); }
  }
});

test('A6: the VP70 gets a physical magazine and its ground pickup on model evidence; M4A3 and F44AA stay numeric', () => {
  for (const id of ['weapon-004-vp70-combat-pistol', 'weapon-124-vp70-combat-pistol-prototype']) {
    const { engine } = missionV136({ weapon: named(id), experimentalPhysicalMagazinesV167: true }); // the existing opt-in
    try {
      const actor = engine.player;
      assert.equal(actor.weaponFeedV167?.weaponDefinitionId, id); assert.equal(actor.weaponFeedV167.feed, 'box');
      assert.equal(actor.magazineSize, named(id).magazine, 'the game capacity is unchanged');
      assert.ok(fireUntil(engine, 3) >= 3); run(engine, 30);
      const before = total(actor), partial = actor.ammo;
      assert.equal(engine.speedReloadWeaponV168(actor), true, 'the partial magazine is dropped');
      run(engine, 400);
      assert.ok(total(actor) < before && total(actor) >= before - partial, 'the dropped rounds left the inventory');
      assert.match(engine.getInteractionPrompt(actor), /CHARGEUR/);
      assert.equal(engine.interact(actor), true);
      assert.equal(total(actor), before, 'the pickup returns exactly the surviving rounds');
    } finally { engine.dispose?.(); }
  }
  for (const id of ['weapon-003-m4a3-service-pistol', 'weapon-017-f44aa-pulse-rifle']) {
    const { engine } = missionV136({ weapon: named(id), experimentalPhysicalMagazinesV167: true });
    try { assert.equal(engine.player.weaponFeedV167 ?? null, null, id); assert.equal(getArsenalProfileV188(id).feed.detachableMagazine, false); }
    finally { engine.dispose?.(); }
  }
  assert.equal(getArsenalProfileV188('weapon-004-vp70-combat-pistol').feed.worldPickup, 'v168-dropped-magazine-recovery');
  assert.equal(WEAPON_FEED_EVIDENCE_V188['weapon-004-vp70-combat-pistol'].documentedCapacity, 18);
});

test('A9: the M41A dossier cites 900 rounds/min as a secondary documented figure; the game cadence is unchanged', () => {
  const rate = arsenalDocumentedRateV188('weapon-001-m41a-pulse-rifle');
  assert.equal(rate.roundsPerMinute, 900); assert.match(rate.status, /secondary/); assert.match(rate.sourceUrl, /^https:\/\//);
  assert.equal(arsenalDocumentedRateV188('weapon-121-m41a-pulse-rifle-prototype'), rate, 'finish variants share the base dossier');
  assert.equal(arsenalDocumentedRateV188('weapon-002-m41a2-pulse-rifle'), null);
  assert.equal(named('weapon-001-m41a-pulse-rifle').fireRate, 7.7); assert.equal(getArsenalProfileV188('weapon-001-m41a-pulse-rifle').fire.roundsPerSecond, 7.7);
  assert.match(getArsenalProfileV188('weapon-001-m41a-pulse-rifle').fire.rateSource, /PROPOSÉ/);
  assert.ok(EN_CATALOG_V185[rate.note]);
});
