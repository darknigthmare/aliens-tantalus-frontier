import test from 'node:test';
import assert from 'node:assert/strict';
import { ENEMIES } from '../src/content-core-v50.js';

test('all 35 original imported PNGs retain the audited native bytes and dimensions', async () => {
  const { readFile } = await import('node:fs/promises');
  const { createHash } = await import('node:crypto');
  const receipt = JSON.parse(await readFile(new URL('../docs/references/user-castes-v87-integrity.json', import.meta.url)));
  assert.equal(receipt.count, CASTES.length);
  let total = 0;
  for (const d of ORIGINALS) {
    const row = receipt.files.find(file => file.name === d.filename);
    assert.ok(row, d.filename);
    const bytes = await readFile(new URL('..' + d.path, import.meta.url));
    assert.equal(bytes.length, row.bytes);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), row.sha256);
    assert.equal(bytes.readUInt32BE(16), d.sourceWidth);
    assert.equal(bytes.readUInt32BE(20), d.sourceHeight);
    total += bytes.length;
  }
  assert.equal(total, receipt.bytes);
});

import { ENEMY_USER_CASTES_V87 as CASTES, ENEMY_USER_CASTES_ORIGINALS_V87 as ORIGINALS, getEnemyUserCasteV87, getLegacyEnemyAlteredLabelV87 } from '../src/enemy-user-castes-v87.js';
import { createUserCasteActorV87, drawUserCastePoseV87, isUserCasteImageReadyV87, updateUserCasteActorV87 } from '../src/enemy-user-pose-runtime-v87.js';

test('35 independent identities preserve 571 legacy IDs and qualify old equivalents only', () => {
  assert.equal(ENEMIES.length, 571);
  assert.equal(CASTES.length, 35);
  assert.equal(new Set(CASTES.map(d => d.id)).size, 35);
  for (const d of CASTES) {
    assert.ok(!ENEMIES.some(e => e.id === d.id));
    if (d.legacyCounterpartId) assert.ok(ENEMIES.some(e => e.id === d.legacyCounterpartId));
    assert.equal(d.animationStatus, 'missing');
    assert.equal(d.canonExact, false);
    assert.equal(d.identityVerified, false);
    assert.equal(d.visualMode, 'static-pose');
    assert.equal(d.renderWidth / d.renderHeight, d.sourceWidth / d.sourceHeight);
    assert.ok(d.cost > 0 && d.cost <= 12);
    assert.ok(Object.isFrozen(d));
    assert.equal(getLegacyEnemyAlteredLabelV87(d.id, d.name), d.name);
    assert.equal(getEnemyUserCasteV87(' ' + d.id), null);
    assert.equal(getEnemyUserCasteV87(d.id + ':0'), null);
  }
  assert.equal(getLegacyEnemyAlteredLabelV87('enemy-005-warrior', 'Warrior'), 'Warrior — Altered');
  assert.equal(getLegacyEnemyAlteredLabelV87('enemy-005-warrior', 'Warrior — Altered'), 'Warrior — Altered');
  assert.equal(getLegacyEnemyAlteredLabelV87('enemy-039-abomination', 'Abomination'), 'Abomination');
  assert.equal(getLegacyEnemyAlteredLabelV87('enemy-571-predalien', 'Predalien'), 'Predalien');
  assert.equal(getEnemyUserCasteV87('__proto__'), null);
});

test('different Crushers/Predaliens/Stalkers are not aliased', () => {
  for (const names of [['game_acm_crusher','game_afe_crusher'],
    ['game_abomination_avp2010','game_predalien_avp2_primal_hunt'],
    ['game_afe_pathogen_stalker','game_avp_capcom_stalker']]) {
    const [a,b] = names.map(n => getEnemyUserCasteV87('castes-' + n));
    assert.notEqual(a.id, b.id);
    assert.notEqual(a.path, b.path);
    assert.notEqual(a.work, b.work);
  }
});

test('all native poses draw once, without slicing, preserving ratio and mirrored feet anchor', () => {
  for (const d of CASTES) {
    const actor = createUserCasteActorV87({ id: 'specimen', profileId: d.id }, 642);
    assert.equal(actor.maxHealth, d.health);
    assert.equal(actor.visualSheetId, null);
    assert.equal(actor.spriteKey, 'user-caste-static');
    const calls = [];
    const ctx = Object.fromEntries(['save','restore','translate','scale','drawImage'].map(key => [key, (...args) => calls.push([key, ...args])]));
    const image = { complete: true, naturalWidth: d.sourceWidth, naturalHeight: d.sourceHeight };
    assert.equal(isUserCasteImageReadyV87(image, d), true);
    for (const facing of [-1, 1]) {
      calls.length = 0; actor.facing = facing;
      assert.equal(drawUserCastePoseV87(ctx, actor, image), true);
      assert.deepEqual(calls[1], ['translate', d.bodyWidth / 2, 642]);
      assert.deepEqual(calls[2], ['scale', facing, 1]);
      assert.equal(calls.filter(c => c[0] === 'drawImage').length, 1);
      assert.deepEqual(calls[3], ['drawImage', image, -d.pivot.x * d.renderWidth, -d.pivot.y * d.renderHeight, d.renderWidth, d.renderHeight]);
    }
    calls.length = 0;
    assert.equal(drawUserCastePoseV87(ctx, actor, { complete: false }), false);
    assert.equal(drawUserCastePoseV87(ctx, actor, { complete: true, width: 256, height: 256 }), false);
    assert.equal(calls.length, 0);
  }
});

test('laboratory melee/ranged are physical, idle egg cannot release a borrowed parasite', () => {
  const player = { x: 20, y: 554, w: 40, h: 88, alive: true };
  let damage = 0;
  const engine = { player, hostileProjectiles: [], damagePlayer: (_, amount) => { damage += amount; },
    spawnEnemyProjectile: () => engine.hostileProjectiles.push({ damage: 0 }) };
  for (const role of ['idle','melee','ranged']) {
    const d = CASTES.find(x => x.combatRole === role);
    const actor = createUserCasteActorV87({ id: 'specimen', profileId: d.id }, 642);
    actor.attackClock = 0; actor.rangedClock = 0;
    if (role === 'ranged') actor.x = 300;
    const before = damage;
    assert.equal(updateUserCasteActorV87(engine, actor, .1), true);
    if (role === 'idle') { assert.equal(actor.x, 0); assert.equal(damage, before); }
    if (role === 'melee') assert.equal(damage, before + d.damage);
    if (role === 'ranged') assert.equal(engine.hostileProjectiles.at(-1).damage, d.damage);
    assert.equal(actor.animationStatus, 'missing');
  }
});
