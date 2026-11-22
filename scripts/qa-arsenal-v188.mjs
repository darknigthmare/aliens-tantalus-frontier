// V188 arsenal completion (spec 014) — Chromium QA: every Lot-A weapon fired and reloaded in a real mission.
// Fixture (declared): a profile built from createDefaultSave(), imported through the Options screen
// (#save-import), with these injected fields only: needsPlayerCreationV84 = false, scene = hub, and the
// pending-plaque Hicks Ithaca 37 (weapon-194) added to player.weaponIds and strategy.inventory.weaponIds
// (it cannot be bought: no native plaque), so the first mission is deployed with it by the real loadout path.
// Injections (declared): (1) after that first weapon, each next Lot-A weapon is assigned to the running engine
// as a loadout change would (`weaponRuntime` from the page's own buildWeaponRuntime, magazineSize = catalogue
// magazine, ammo = magazine, ammoReserve = 40, previous feed and reload state cleared; the arsenal layer then
// applies its mechanism capacity); (2) the marine's health is restored between weapons and nearby hostiles
// are removed with the engine's own defeatEnemy, so a death does not end the run (no combat outcome claimed).
// Firing uses the real held F key, reloading the real R key. The sentry (deployable) is excluded.
// Usage: PORT=4731 node scripts/dev.mjs & ; BASE_URL=http://127.0.0.1:4731/ node scripts/qa-arsenal-v188.mjs <out-dir>
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { createDefaultSave } from '../src/save.js';
import { listArsenalProfilesV188 } from '../src/weapon-arsenal-v188.js';

const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4731/';
const out = process.argv[2] || 'qa-arsenal-v188';
await mkdir(out, { recursive: true });
const report = { checks: [], pageErrors: [], consoleErrors: [], shots: [], weapons: [] };
const check = (label, condition, evidence = null) => { report.checks.push({ label, passed: Boolean(condition), evidence }); console.log(JSON.stringify({ check: label, passed: Boolean(condition), evidence })); };
const FIRST = 'weapon-194-hicks-ithaca-37-shotgun';
const weapons = listArsenalProfilesV188({ lotA: true }).filter(p => p.weaponId === p.baseId && p.family !== 'sentry')
  .map(p => p.weaponId).sort((a, b) => (a === FIRST ? -1 : b === FIRST ? 1 : a.localeCompare(b)));

const save = createDefaultSave(); save.needsPlayerCreationV84 = false; save.scene = 'hub';
save.player.weaponIds = [...new Set([...save.player.weaponIds.filter(id => id !== FIRST), FIRST])];
save.strategy.inventory.weaponIds = [...new Set([...save.strategy.inventory.weaponIds, FIRST])];

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 1440, height: 900 } });
const page = await context.newPage(); page.setDefaultTimeout(30000);
page.on('pageerror', error => report.pageErrors.push(error.message));
page.on('console', message => { if (message.type() === 'error') report.consoleErrors.push(message.text().slice(0, 300)); });
const game = (fn, arg) => page.evaluate(fn, arg);
const shot = async name => { const file = join(out, `${name}.png`); await page.screenshot({ path: file }); report.shots.push(file); };
async function navigate(view) {
  if (await page.locator('#menu-toggle').isVisible() && !(await page.locator('.rail').getAttribute('class')).split(/\s+/).includes('open')) await page.locator('#menu-toggle').click();
  await page.locator(`[data-view="${view}"]`).click(); await page.waitForTimeout(300);
}
async function closeDialogs(max = 8) {
  for (let i = 0; i < 6 && await page.locator('.cinematic-v188').count(); i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(250); }
  for (let i = 0; i < max; i++) { const dialog = page.locator('dialog.content-scene-v188'); if (!(await dialog.count())) break; await dialog.locator('button').last().click(); await page.waitForTimeout(200); }
}

try {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' }); await page.locator('#title-start').click({ timeout: 45000 });
  await page.locator('#title-options').click();
  await page.locator('#save-import').setInputFiles({ name: 'arsenal.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(save)) });
  await page.getByText('Sauvegarde importée et migrée.', { exact: true }).last().waitFor();
  await navigate('command'); await page.waitForTimeout(400); await closeDialogs();
  const mission = await page.locator('#command-mission-v110 option').first().getAttribute('value');
  await page.locator('#operation-launch').click(); await page.waitForTimeout(1200);
  for (let i = 0; i < 50; i++) {
    const live = await game(() => globalThis.__ATF_GAME__?.mission?.state === 'active' && globalThis.__ATF_GAME__?.running && !globalThis.__ATF_GAME__?.handoverV188?.blocking);
    if (live) break;
    if (await page.locator('.cinematic-v188').count()) { await page.keyboard.press('Escape'); await page.waitForTimeout(500); continue; }
    const action = page.locator('[data-insertion-action]').first();
    if (await action.count() && await action.isVisible()) { await action.click(); await page.waitForTimeout(500); continue; }
    await page.keyboard.press('KeyE'); await page.waitForTimeout(600);
  }
  await page.waitForFunction(() => (globalThis.__ATF_GAME__?.mission?.elapsed || 0) > .3, null, { timeout: 30000 }).catch(() => {});
  await page.locator('#game-canvas').focus().catch(() => {});
  const deployed = await game(() => globalThis.__ATF_GAME__?.weaponRuntime?.id);
  check('mission deployed with the pending-plaque Hicks Ithaca 37 through the loadout', deployed === FIRST, { mission, deployed });

  for (const id of weapons) {
    if (id !== FIRST) {
      await game(async weaponId => { // Injection (1)
        const { WEAPONS } = await import('/src/content-core-v50.js'), { buildWeaponRuntime } = await import('/src/game-runtime.js');
        const e = globalThis.__ATF_GAME__, p = e.player, w = WEAPONS.find(entry => entry.id === weaponId);
        e.weaponRuntime = buildWeaponRuntime(w); delete p.arsenalFeedV188; p.tacticalReload = null; p.reloading = false;
        p.weaponMode = 'rifle'; p.magazineSize = e.weaponRuntime.magazine; p.ammo = p.magazineSize; p.ammoReserve = 40; p.fireClock = 0;
      }, id);
    }
    await game(() => { const e = globalThis.__ATF_GAME__, p = e.player; // Injection (2)
      p.health = p.maxHealth; p.alive = true; p.downed = false;
      for (const enemy of [...e.enemies]) if (enemy.alive && Math.abs(enemy.x - p.x) < 900) e.defeatEnemy(enemy, p); });
    await page.waitForTimeout(250);
    const before = await game(() => { const e = globalThis.__ATF_GAME__, p = e.player; return { shots: p.shots, total: p.ammo + p.ammoReserve, mag: p.magazineSize,
      state: e.getArsenalStateV188(), fx: e.weaponEffectsSnapshotV124()?.stats || null, vfx: e.getVfxSnapshotV188?.()?.stats?.byKind || {} }; });
    await page.keyboard.down('KeyF'); await page.waitForTimeout(1300); await page.keyboard.up('KeyF');
    await page.waitForTimeout(500);
    if (id === FIRST || id === 'weapon-011-m83-sadar' || id === 'weapon-196-sevastopol-flamethrower') {
      await shot(id);
      // Close-up of the marine (logical 1280×720 canvas mapped onto its on-screen box).
      const clip = await game(() => { const e = globalThis.__ATF_GAME__, p = e.player, box = document.querySelector('#game-canvas').getBoundingClientRect();
        const k = box.width / 1280, x = box.left + (p.x - (e.camera?.x || 0)) * k, y = box.top + (p.y - (e.camera?.y || 0)) * k;
        return { x: Math.max(0, x - 140 * k), y: Math.max(0, y - 90 * k), width: 340 * k, height: 240 * k }; });
      const file = join(out, `${id}-closeup.png`); await page.screenshot({ path: file, clip }); report.shots.push(file);
    }
    await page.keyboard.press('KeyR');
    await page.waitForTimeout(Math.min(6000, 600 + 1000 * (await game(() => globalThis.__ATF_GAME__.player.tacticalReload?.completeAt || 0))));
    const after = await game(() => { const e = globalThis.__ATF_GAME__, p = e.player; return { shots: p.shots, total: p.ammo + p.ammoReserve, ammo: p.ammo, mag: p.magazineSize,
      phase: p.tacticalReload?.phase || null, state: e.getArsenalStateV188(), fx: e.weaponEffectsSnapshotV124()?.stats || null, vfx: e.getVfxSnapshotV188?.()?.stats?.byKind || {} }; });
    const fired = after.shots - before.shots;
    const row = { id, fired, conserved: before.total - after.total === fired, kind: after.state.kind, bridged: after.state.bridged,
      mag: after.mag, ammoAfterReload: after.ammo, reloadPhase: after.phase, stats: after.state.stats };
    report.weapons.push(row);
    check(`${id}: fired with the held F key and ammunition conserved through the R reload`, fired > 0 && row.conserved, row);
  }
  check('0 page errors', report.pageErrors.length === 0, report.pageErrors.slice(0, 5));
  check('0 console errors', report.consoleErrors.length === 0, report.consoleErrors.slice(0, 5));
} catch (error) {
  check('QA script completed', false, error.stack);
} finally {
  await writeFile(join(out, 'report.json'), JSON.stringify(report, null, 2));
  await browser.close();
  const failed = report.checks.filter(entry => !entry.passed).length;
  console.log(JSON.stringify({ checks: report.checks.length, failed, pageErrors: report.pageErrors.length, consoleErrors: report.consoleErrors.length }));
  process.exitCode = failed ? 1 : 0;
}
