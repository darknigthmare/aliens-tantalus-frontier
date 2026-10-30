import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { WEAPONS } from '../src/content-core-v50.js';
import {
  WEAPON_FIDELITY_DOSSIERS_V170, WEAPON_FIDELITY_ATTACHMENT_REFERENCES_V170,
  WEAPON_FIDELITY_SOURCES_V170, validateWeaponFidelityV170,
  getWeaponFidelityDossiersV170, renderWeaponFidelityDossiersV170
} from '../src/weapon-fidelity-ledger-v170.js';

const local = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const live = new Set(WEAPONS.map(x => x.id));

test('V170 distinguishes 12 AFE2 screenshot names and 7 official-name dossiers', () => {
  assert.deepEqual(validateWeaponFidelityV170(), {
    valid:true, errors:[], dossiers:19, secondary:12, firstParty:7,
    attachments:13, approved1to1:0, purchasable:0
  });
  assert.equal(getWeaponFidelityDossiersV170({work:'Aliens: Fireteam Elite 2'}).length,12);
  assert.equal(getWeaponFidelityDossiersV170({work:'Alien: Isolation'}).length,5);
  assert.equal(getWeaponFidelityDossiersV170({work:'Aliens: Fireteam Elite'}).length,1);
  assert.equal(getWeaponFidelityDossiersV170({work:'Aliens: Fireteam Elite 2 — Patch 2026'}).length,1);
});

test('V170 unadmitted models link exactly to their original workbook proposal', () => {
  const csv = local('docs/arsenal/data/tantalus_arsenal_master_v1.csv');
  for (const x of WEAPON_FIDELITY_DOSSIERS_V170.filter(x=>x.id.startsWith('proposed-')))
    assert.ok(csv.includes(x.id + ','), x.id + ' must be a stable original proposal');
});

test('V170 source claims remain falsifiable; no approved 1:1 art or guessed stats', () => {
  for (const d of WEAPON_FIDELITY_DOSSIERS_V170) {
    assert.equal(d.isPurchasable,false);
    assert.equal(d.visuallyAuthenticated,false);
    assert.equal(d.canonExact,false);
    assert.equal(d.mechanicsConfirmed,false);
    assert.equal(d.animationConfirmed,false);
    assert.equal(d.acceptance,'visual-and-action-authentication-required');
    assert.ok(Object.values(WEAPON_FIDELITY_SOURCES_V170).includes(d.sourceUrl));
  }
});

test('V170 comparing an older weapon never invents a new released game weapon', () => {
  for (const dossier of WEAPON_FIDELITY_DOSSIERS_V170) {
    assert.equal(live.has(dossier.id),false);
    if (dossier.comparisonCatalogId)
      assert.equal(live.has(dossier.comparisonCatalogId),true, dossier.id);
  }
});

test('V170 Isolation manual supports weapon classes without manufacturer/model guesses', () => {
  const rows=getWeaponFidelityDossiersV170({work:'Alien: Isolation'});
  assert.equal(rows.length,5);
  assert.ok(rows.every(d=>d.evidence==='first-party-game-manual'));
  assert.ok(rows.some(d=>d.title==='Shotgun — Sevastopol'));
  assert.ok(rows.some(d=>d.title==='Bolt Gun — Sevastopol'));
  assert.ok(rows.some(d=>d.title==='Stun Baton — Sevastopol'));
});

test('V170 official original Fireteam attachments have no invented compatible weapons', () => {
  assert.equal(WEAPON_FIDELITY_ATTACHMENT_REFERENCES_V170.length,13);
  for (const mod of WEAPON_FIDELITY_ATTACHMENT_REFERENCES_V170) {
    assert.deepEqual(mod.weaponCompatibilities,[]);
    assert.equal(mod.gameplayStats,null);
    assert.equal(mod.dedicatedSprite,null);
    assert.equal(mod.status,'not-admitted');
  }
});

test('V170 rejects a forged purchase/fidelity flag and a duplicate source ID', () => {
  const all=structuredClone(WEAPON_FIDELITY_DOSSIERS_V170);
  all[0].isPurchasable=true;
  assert.equal(validateWeaponFidelityV170(all).valid,false);
  all[0].isPurchasable=false;
  all[0].canonExact=true;
  assert.equal(validateWeaponFidelityV170(all).valid,false);
  all[0].canonExact=false;
  all[1].id=all[0].id;
  assert.equal(validateWeaponFidelityV170(all).valid,false);
});

test('V170 armory dossier is a read-only, safely linked detail panel', () => {
  const html=renderWeaponFidelityDossiersV170();
  assert.match(html,/id="armory-fidelity-v170"/);
  assert.match(html,/aria-label="Dossiers des armes non authentifiées"/);
  assert.match(html,/target="_blank" rel="noopener noreferrer"/);
  assert.doesNotMatch(html,/\bdata-(procure|equip|purchase)-/);
  assert.ok(html.indexOf('M41A2 Pulse Rifle')>=0);
});

test('V170 production armory mounts the evidence panel beside unchanged procurement', () => {
  const app=local('src/app.js');
  assert.match(app,/renderWeaponFidelityDossiersV170/);
  assert.match(app,/armory-fidelity-mount-v170/);
  assert.match(app,/procureCatalogItem\(saveSystem\.data/);
  assert.match(app,/getProcurementQuote\(saveSystem\.data/);
});

test('V170 129 proposed models each remain a research row, not a published catalog entry', () => {
  const base=local('docs/arsenal/data/tantalus_arsenal_master_v1.csv');
  const backlog=local('docs/arsenal/data/tantalus_weapon_evidence_backlog_v170.csv');
  const original=[...base.matchAll(/(?:^|\n)(proposed-[a-z0-9-]+),/g)].map(x=>x[1]);
  const tracked=[...backlog.matchAll(/(?:^|\n)(proposed-[a-z0-9-]+),/g)].map(x=>x[1]);
  assert.equal(original.length,129);
  assert.deepEqual(tracked,original);
  assert.equal((backlog.match(/,P0,/g)||[]).length,14);
  assert.equal((backlog.match(/,P1,/g)||[]).length,27);
  assert.equal((backlog.match(/,P2,/g)||[]).length,88);
  assert.equal((backlog.match(/,NOT_ADMITTED,/g)||[]).length,129);
});
