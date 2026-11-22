// Spec 012 — browser QA of the hidden developer tools (launcher, isolated dev session, shooting range).
// Fixtures (declared): every session is built by the launcher itself (devtools/dev-fixtures-v188.js:
// createDefaultSave + game rules + migrateSave + inspectSaveSlotV78). The page's real localStorage is
// seeded with a sentinel "player profile" before anything runs; it must be byte-identical at the end.
// Injections (declared): the range API (`__ATF_DEV_V188__.range`) is called for the auto-fire, the
// measures and the tuning export; everything else uses the launcher and HUD buttons (real clicks).
// Usage: PORT=4711 node scripts/dev.mjs & ; BASE_URL=http://127.0.0.1:4711/ node scripts/qa-dev-tools-v188.mjs <out-dir> [ids]
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const baseUrl = (process.env.BASE_URL || 'http://127.0.0.1:4711/').replace(/\/$/, '');
const out = process.argv[2] || 'qa-dev-tools';
await mkdir(out, { recursive: true });
const report = { baseUrl, checks: [], pageErrors: [], consoleErrors: [], shots: [] };
const check = (label, condition, evidence = null) => { report.checks.push({ label, passed: Boolean(condition), evidence }); console.log(JSON.stringify({ check: label, passed: Boolean(condition), evidence })); };

// At least one entry per category; language EN for one of them.
const SAMPLE = [
  ['start-title', 'fr'], ['start-creator', 'fr'], ['prologue-p2-qualification', 'fr'], ['prologue-p3-triage', 'en'], ['hub-armory', 'fr'], ['asphodele-asph-ring', 'fr'],
  ['main-act1-qz17', 'fr'], ['main-council', 'fr'], ['ending-relay-speaks', 'en'], ['colony-c1', 'fr'], ['station-cassius-choice', 'fr'], ['queens-arrival', 'fr'],
  ['checkpoint-station-s1-control', 'fr'], ['cinematic-cin-cq-01', 'fr'], ['special-special-alpha-bravo-doctrine', 'fr'], ['trials-xeno', 'fr'], ['campaign-pair-001-mire', 'fr']
];
const only = process.argv[3] ? process.argv[3].split(',') : null;
const SENTINEL = JSON.stringify({ sentinel: 'real player profile', day: 42 });

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 1440, height: 900 } });
const page = await context.newPage(); page.setDefaultTimeout(30000);
page.on('pageerror', error => report.pageErrors.push(`${page.url()} :: ${error.message}`));
page.on('console', message => { if (message.type() === 'error' && !/Service Worker registration blocked|Failed to load resource/.test(message.text())) report.consoleErrors.push(message.text().slice(0, 300)); });
const shot = async name => { const file = join(out, `${name}.png`); await page.screenshot({ path: file }); report.shots.push(file); };

// The player's real profile on this origin, written before the launcher runs.
await page.goto(`${baseUrl}/devtools/`, { waitUntil: 'domcontentloaded' });
await page.evaluate(sentinel => { localStorage.clear(); localStorage.setItem('atf-v47-profile-1', sentinel); localStorage.setItem('atf-language-v185', 'fr'); }, SENTINEL);
const realBefore = await page.evaluate(() => JSON.stringify(Object.fromEntries(Object.keys(localStorage).sort().map(key => [key, localStorage.getItem(key)]))));

async function launchFromLauncher(id, language) {
  await page.goto(`${baseUrl}/devtools/`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => globalThis.__ATF_DEV_LAUNCHER_V188__);
  await page.selectOption('[data-dev-language]', language);
  await page.fill('[data-dev-search]', id);
  const button = page.locator(`[data-dev-launch="${id}"]`);
  await button.click();
  await page.waitForURL(/atf-dev=v188/);
  await page.waitForFunction(() => ['ready', 'error'].includes(globalThis.__ATF_DEV_V188__?.status), null, { timeout: 150000 });
  return page.evaluate(() => globalThis.__ATF_DEV_V188__.snapshot());
}

for (const [id, language] of SAMPLE.filter(([id]) => !only || only.includes(id))) {
  let snap;
  try { snap = await launchFromLauncher(id, language); } catch (error) { check(`${id}: launched`, false, error.message); continue; }
  check(`${id}: landed on ${snap.expected}`, snap.status === 'ready' && snap.landed === snap.expected, snap);
  const lang = await page.evaluate(() => document.documentElement.lang);
  check(`${id}: language ${language}`, lang === language, lang);
  if (id === 'colony-c1') {
    // HUD toggles (real clicks): god mode, colliders, places, foot line; slow motion and frame step.
    for (const key of ['godMode', 'colliders', 'places', 'spawnZones', 'footLine', 'reveal']) await page.locator(`[data-dev-toggle="${key}"]`).check();
    await page.selectOption('[data-dev-timescale]', '0.25');
    await page.waitForTimeout(1500);
    const health = await page.evaluate(() => { const e = globalThis.__ATF_V51__.engine; e.player.health = 5; return new Promise(resolve => setTimeout(() => resolve(e.player.health), 400)); });
    check('HUD: god mode restores health', health >= 100, health);
    await page.locator('[data-dev-pause]').click();
    const before = await page.evaluate(() => globalThis.__ATF_V51__.engine.animationTime);
    await page.locator('[data-dev-step]').click();
    const after = await page.evaluate(() => globalThis.__ATF_V51__.engine.animationTime);
    check('HUD: frame step advances one scaled frame (×0.25) while paused', Math.abs(after - before - 0.25 / 60) < 0.001, { before, after });
    await shot('colony-c1-overlays');
    await page.locator('[data-dev-pause]').click();
  }
  if (['hub-armory', 'asphodele-asph-ring', 'main-council', 'cinematic-cin-cq-01', 'checkpoint-station-s1-control', 'ending-relay-speaks', 'start-creator', 'trials-xeno'].includes(id)) await shot(id);
}

// —— Spec 014: every Lot-A arsenal weapon (V188 additions included) is listed by the range and fires there ——
// Injection (declared): `range.setWeapon(id)` and `range.autoFire()` of the range API; the three pending-plaque
// additions are also chosen through the weapon select and its equip button (real clicks).
if (!only || only.includes('range-arsenal')) {
  const snap = await launchFromLauncher('range', 'fr');
  check('range-arsenal: landed', snap.status === 'ready' && snap.landed === 'range', snap);
  const ids = await page.evaluate(async () => (await import('/src/weapon-arsenal-v188.js')).listArsenalProfilesV188({ lotA: true })
    .filter(p => p.weaponId === p.baseId && p.family !== 'sentry').map(p => p.weaponId));
  const listed = await page.locator('[data-range-weapon] option').evaluateAll(nodes => nodes.map(node => node.value));
  check('range-arsenal: every Lot-A weapon and the V188 additions are listed', ids.length === 20 && ids.every(id => listed.includes(id)), { missing: ids.filter(id => !listed.includes(id)) });
  for (const id of ids) {
    if (/weapon-19[4-6]-/.test(id)) {
      await page.locator('[data-range-tab="weapons"]').click();
      await page.selectOption('[data-range-weapon]', id); await page.locator('[data-range-equip-weapon]').click();
    } else await page.evaluate(weaponId => globalThis.__ATF_DEV_V188__.range.setWeapon(weaponId), id);
    await page.waitForTimeout(400);
    await page.evaluate(() => { const r = globalThis.__ATF_DEV_V188__.range; r.resetMeasures(); r.autoFire(1.4); });
    await page.waitForTimeout(1900);
    const m = await page.evaluate(() => globalThis.__ATF_DEV_V188__.range.measures());
    check(`range-arsenal ${id}: equipped, fired, arsenal profile read`, m.weapon.id === id && m.fireRate.shots > 0 && m.arsenal?.feed,
      { fired: m.fireRate.shots, arsenal: m.arsenal && { feed: m.arsenal.feed, bridge: m.arsenal.nativeBridge, capacity: m.arsenal.capacity, live: m.arsenal.live }, magazine: { ammo: m.magazine.ammo, size: m.magazine.size } });
    if (id === 'weapon-194-hicks-ithaca-37-shotgun') { await page.locator('[data-range-tab="measures"]').click(); await page.waitForTimeout(400); await shot('range-arsenal-hicks'); }
  }
  await page.locator('[data-dev-exit]').click().catch(() => {});
}
// —— Shooting range: 3 weapons, an equipment item, a squad order, caste targets, measures, tuning export ——
if (!only || only.includes('range')) {
  const snap = await launchFromLauncher('range', 'fr');
  check('range: landed', snap.status === 'ready' && snap.landed === 'range', snap);
  const weapons = ['weapon-001-m41a-pulse-rifle', 'weapon-003-m4a3-service-pistol'];
  // Three weapons through the panel (select + button): rifle, pistol and a special-family entry.
  const shotgun = await page.evaluate(async () => (await import('/src/content.js')).WEAPONS.find(w => w.id !== 'weapon-001-m41a-pulse-rifle' && w.id !== 'weapon-003-m4a3-service-pistol' && /shotgun|smart|flame|grenade/i.test(`${w.name} ${w.family}`))?.id
    || (await import('/src/content.js')).WEAPONS[5].id);
  weapons.push(shotgun);
  for (const [index, weaponId] of weapons.entries()) {
    await page.locator('[data-range-tab="weapons"]').click();
    await page.selectOption('[data-range-weapon]', weaponId);
    await page.locator('[data-range-equip-weapon]').click();
    await page.waitForTimeout(400);
    await page.locator('[data-range-tab="targets"]').click();
    await page.selectOption('[data-range-caste]', { index: index + 3 });
    await page.fill('[data-range-distance]', String(8 + index * 3));
    await page.locator('[data-range-dummy]').click();
    await page.locator('[data-range-spawn]').click();
    await page.evaluate(() => { globalThis.__ATF_DEV_V188__.range.resetMeasures(); globalThis.__ATF_DEV_V188__.range.autoFire(2.5); });
    await page.waitForTimeout(3200);
    const m = await page.evaluate(() => globalThis.__ATF_DEV_V188__.range.measures());
    check(`range weapon ${index + 1} (${weaponId}): equipped, fired, measured`, m.weapon.id === weaponId && m.fireRate.shots > 0 && (m.dps.damage > 0 || m.projectiles.bullets + m.projectiles.v130 + m.projectiles.v131 + m.projectiles.beams > 0),
      { weapon: m.weapon.id, fireRate: m.fireRate, dps: m.dps, theoretical: m.theoretical, spread: m.spread, magazine: m.magazine, ttk: m.ttkObserved, cues: m.cues.slice(-3) });
    await page.locator('[data-range-tab="measures"]').click(); await page.waitForTimeout(400);
    await shot(`range-weapon-${index + 1}`);
  }
  // Equipment: the motion tracker, equipped (level restart) then used.
  await page.locator('[data-range-tab="equipment"]').click();
  await page.selectOption('[data-range-equipment]', 'equipment-020-portable-sentry');
  await page.locator('[data-range-equip]').click(); await page.waitForTimeout(500);
  await page.selectOption('[data-range-equipment]', 'equipment-001-motion-tracker');
  await page.locator('[data-range-equip]').click(); await page.waitForTimeout(500);
  await page.locator('[data-range-use]').click(); await page.waitForTimeout(400);
  const equipmentLog = await page.evaluate(() => globalThis.__ATF_DEV_V188__.log.filter(entry => entry.type === 'equipment-use' || entry.type === 'range-restart').slice(-3));
  check('range equipment: equipped through a level restart and used', equipmentLog.some(entry => entry.type === 'range-restart' && entry.equipment.includes('equipment-001-motion-tracker'))
    && equipmentLog.some(entry => entry.type === 'equipment-use'), equipmentLog);
  // Squad order (the existing V132 set), through the panel.
  await page.locator('[data-range-tab="squad"]').click();
  await page.locator('[data-range-squad="order"][data-value="hold"]').click();
  const squad = JSON.parse(await page.locator('[data-range-squad-out]').textContent());
  check('range squad: « Tenir la position » applied by performSquadActionV132', squad.applied === true, squad);
  await page.locator('[data-range-squad="marker"]').click();
  await page.locator('[data-range-squad="order"][data-value="move"]').click();
  const move = JSON.parse(await page.locator('[data-range-squad-out]').textContent());
  check('range squad: marker then « Avancer au repère »', move.applied === true, move);
  // Animation readout, slow motion, frame step.
  await page.locator('[data-dev-pause]').click();
  const t0 = await page.evaluate(() => globalThis.__ATF_V51__.engine.animationTime);
  await page.locator('[data-dev-step]').click(); await page.locator('[data-dev-step]').click();
  const t1 = await page.evaluate(() => globalThis.__ATF_V51__.engine.animationTime);
  check('range: frame step while paused', t1 > t0, { t0, t1 });
  await page.locator('[data-dev-pause]').click();
  const rig = await page.evaluate(() => globalThis.__ATF_DEV_V188__.range.measures().rig);
  check('range: marine rig state readout (foot line, muzzle, grip, sheet)', Number.isFinite(rig.footY) && Array.isArray(rig.muzzle) && rig.sheet, rig);
  // Tuning: in memory, exported as a JSON diff.
  await page.locator('[data-range-tab="tuning"]').click();
  await page.locator('[data-range-tune="weapon"] [data-field="damage"]').fill('31');
  const [download] = await Promise.all([page.waitForEvent('download'), page.locator('[data-range-export]').click()]);
  const diff = JSON.parse(await page.locator('[data-range-diff]').textContent());
  check('range tuning: JSON diff exported for review', diff.count >= 1 && Object.values(diff.changes.weapon || {}).some(fields => fields.damage?.to === 31) && /\.json$/.test(download.suggestedFilename()), diff);
  await shot('range-tuning');
  // Exit: the session is dropped, back to the launcher.
  await page.locator('[data-dev-exit]').click();
  await page.waitForURL(/\/devtools\/$/);
  const left = await page.evaluate(() => sessionStorage.getItem('atf-dev-session-v188'));
  check('exit: the dev session is discarded', left === null, left);
}

const realAfter = await page.evaluate(() => JSON.stringify(Object.fromEntries(Object.keys(localStorage).sort().map(key => [key, localStorage.getItem(key)]))));
check('the real localStorage (player profile) is untouched by every dev session', realAfter === realBefore, { before: realBefore.slice(0, 200), after: realAfter.slice(0, 200) });
await browser.close();
check('no page errors', report.pageErrors.length === 0, report.pageErrors.slice(0, 5));
await writeFile(join(out, 'report.json'), JSON.stringify(report, null, 2));
const failed = report.checks.filter(entry => !entry.passed);
console.log(`checks: ${report.checks.length - failed.length}/${report.checks.length} passed; console errors: ${report.consoleErrors.length}`);
if (failed.length) process.exitCode = 1;
