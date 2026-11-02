import test from 'node:test';
import assert from 'node:assert/strict';
import { XENO_TRIALS_FIGHTERS_V96 as fighters, getXenoTrialsFighterV96, getXenoTrialsArtV96 } from '../src/xeno-trials-data-v96.js';
import { filterXenoTrialsRosterV97 } from '../src/xeno-trials-selection-v97.js';
import { getXenoTrialsSignatureV147 } from '../src/xeno-trials-signatures-v147.js';
import { getXenoTrialsRigV154 } from '../src/xeno-trials-rig-v154.js';
import { getEnemyImportAnimationV107 } from '../src/enemy-import-animation-v107.js';
import { getEnemyImportAttackV109 } from '../src/enemy-import-attacks-v109.js';
import { XENO_TRIALS_ROSTER_PAGE_SIZE_V179, getXenoTrialsRosterPageV179, getXenoTrialsRosterProfileV179 } from '../src/xeno-trials-roster-v179.js';

test('every admitted fighter remains reachable exactly once through batches of forty', () => {
  const first = getXenoTrialsRosterPageV179(fighters), seen = [];
  assert.equal(XENO_TRIALS_ROSTER_PAGE_SIZE_V179, 40);
  for (let page = 0; page < first.pageCount; page++) {
    const result = getXenoTrialsRosterPageV179(fighters, { page });
    assert.equal(result.page, page);
    assert.equal(result.size, 40);
    assert.equal(result.total, fighters.length);
    assert.equal(result.hasPrevious, page > 0);
    assert.equal(result.hasNext, page < first.pageCount - 1);
    assert.equal(result.start, page * 40 + 1);
    assert.equal(result.end, Math.min(fighters.length, (page + 1) * 40));
    assert.ok(result.fighters.length <= 40);
    seen.push(...result.fighters);
  }
  assert.deepEqual(seen, fighters);
  assert.equal(new Set(seen.map(fighter => fighter.id)).size, fighters.length);
  assert.ok(Object.isFrozen(first));
  assert.ok(Object.isFrozen(first.fighters));
});

test('a selected fighter can be revealed after sorting without changing selection or ownership', () => {
  const selected = fighters.at(-1).id;
  const sorted = filterXenoTrialsRosterV97(fighters, { sort: 'name' });
  const before = JSON.stringify(sorted);
  const visible = getXenoTrialsRosterPageV179(sorted, { page: 0, selectedId: selected, revealSelected: true });
  assert.ok(visible.fighters.some(fighter => fighter.id === selected));
  assert.equal(visible.page, Math.floor(sorted.findIndex(fighter => fighter.id === selected) / 40));
  const manual = getXenoTrialsRosterPageV179(fighters, { page: 0, selectedId: selected });
  assert.equal(manual.page, 0, 'ordinary navigation is not forced back to the selection');
  assert.equal(JSON.stringify(sorted), before);
  assert.equal(getXenoTrialsFighterV96(selected).id, selected);
});

test('filter contraction clamps an old page and never injects a hidden selected fighter', () => {
  const selected = fighters.at(-1).id;
  const filtered = filterXenoTrialsRosterV97(fighters, { query: 'Warrior', sort: 'speed' });
  assert.ok(filtered.length > 0 && filtered.length < 40);
  const result = getXenoTrialsRosterPageV179(filtered, { page: 4, selectedId: selected, revealSelected: true });
  assert.equal(result.page, 0);
  assert.deepEqual(result.fighters, filtered);
  assert.equal(result.hasNext, false);
  assert.equal(result.hasPrevious, false);
});

test('empty, invalid and boundary page requests produce a safe bounded view', () => {
  for (const input of [[], null, undefined]) {
    const result = getXenoTrialsRosterPageV179(input === undefined ? [] : input, { page: 999 });
    assert.deepEqual(result.fighters, []);
    assert.deepEqual([result.page, result.pageCount, result.start, result.end], [0, 1, 0, 0]);
  }
  for (const page of [-100, NaN, Infinity, -Infinity, '4'])
    assert.equal(getXenoTrialsRosterPageV179(fighters, { page }).page, 0);
  assert.equal(getXenoTrialsRosterPageV179(fighters, { page: 1.9 }).page, 1);
  assert.equal(getXenoTrialsRosterPageV179(fighters, { page: 999 }).page, Math.ceil(fighters.length / 40) - 1);
});

test('the complete roster has truthful source-bound presentation notes and useful player tips', () => {
  const before = JSON.stringify(fighters);
  for (const fighter of fighters) {
    const profile = getXenoTrialsRosterProfileV179(fighter), art = getXenoTrialsArtV96(fighter.id);
    assert.equal(profile.id, fighter.id);
    assert.equal(profile.profileId, fighter.profileId);
    assert.equal(profile.artPath, art.path);
    for (const key of ['label', 'roleLabel', 'tactic', 'specialLabel', 'specialDescription', 'visualLabel']) {
      assert.equal(typeof profile[key], 'string', `${fighter.id}: ${key}`);
      assert.ok(profile[key].length > 0 && !profile[key].includes('undefined'), `${fighter.id}: ${key}`);
    }
    assert.equal(profile.rigId, getXenoTrialsRigV154(fighter, art)?.id || null);
    assert.equal(profile.walkId, getEnemyImportAnimationV107(art)?.id || null);
    assert.equal(profile.lightAttackId, getEnemyImportAttackV109(art)?.id || null);
    assert.equal(profile.canonExact, false);
    assert.equal(profile.fullAnimation, false);
    assert.ok(Object.isFrozen(profile));
  }
  assert.equal(JSON.stringify(fighters), before);
});

test('exact capabilities stay bound to the admitted identity rather than a name or edited object', () => {
  const warden = getXenoTrialsFighterV96('import-game-afe2-warden');
  const signature = getXenoTrialsSignatureV147(warden);
  const profile = getXenoTrialsRosterProfileV179(warden);
  assert.equal(profile.specialLabel, signature.label);
  assert.equal(profile.specialDescription, signature.description);
  assert.equal(profile.superLabel, 'Barrage de contrôle');
  assert.equal(getXenoTrialsRosterProfileV179(getXenoTrialsFighterV96('queen')).superLabel, null);
  assert.equal(getXenoTrialsRosterProfileV179({ ...warden, profileId: 'other' }), null);
  assert.equal(getXenoTrialsRosterProfileV179({ ...warden, id: 'unknown' }), null);
  assert.equal(getXenoTrialsRosterProfileV179(null), null);
  assert.deepEqual(getXenoTrialsRosterProfileV179({ ...warden, special: 'detonation', label: 'spoofed' }), profile);
});

test('a sparse presentation rig never acquires walking or attack animation from a related fighter', () => {
  const profiles = fighters.map(getXenoTrialsRosterProfileV179);
  const fixed = profiles.filter(profile => !profile.rigId && !profile.walkId && !profile.lightAttackId);
  const articulated = profiles.filter(profile => profile.rigId);
  assert.ok(articulated.length > 0);
  assert.ok(profiles.some(profile => !profile.walkId));
  assert.ok(profiles.some(profile => profile.walkId));
  for (const profile of fixed) {
    assert.equal(profile.visualLabel, 'Pose fixe dédiée');
    assert.equal(profile.visualStatus, 'admitted-static-pose');
  }
  for (const profile of articulated) assert.ok(profile.visualLabel.includes('Présentation articulée'));
  for (const profile of profiles) {
    assert.equal(profile.visualLabel.includes('Marche animée'), Boolean(profile.walkId));
    assert.equal(profile.visualLabel.includes('Frappe légère animée'), Boolean(profile.lightAttackId));
    assert.equal(profile.fullAnimation, false);
  }
});
