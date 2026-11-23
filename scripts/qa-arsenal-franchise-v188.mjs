// V188 franchise arsenal (spec 014, lot B) — Chromium QA: the armory shows the provisional drawn plaque, the first
// franchise weapon is bought and equipped through the real armory buttons, then every lot-B weapon is fired with the
// held F key and reloaded with R in a real mission, ammunition conserved, 0 page/console error.
// Fixture (declared): a profile built from createDefaultSave(), imported through the Options screen (#save-import),
// with these injected fields only: needsPlayerCreationV84 = false, scene = hub, galaxy.resources.credits = 500000
// (so the purchase is affordable; no price is asserted).
// Injections (declared): (1) after the first weapon (bought, equipped and deployed by the real path), each next
// lot-B weapon is assigned to the running engine as a loadout change would (`weaponRuntime` from the page's own
// buildWeaponRuntime, magazineSize = catalogue magazine, ammo = magazine, ammoReserve = 40, previous feed and reload
// state cleared); (2) the marine's health is restored between weapons and nearby hostiles are removed with the
// engine's own defeatEnemy, so a death does not end the run (no combat outcome is claimed).
// The contact weapon (Nostromo electric prod) spends no ammunition: only its action and the absence of errors are checked.
// Usage: PORT=4751 node scripts/dev.mjs & ; BASE_URL=http://127.0.0.1:4751/ node scripts/qa-arsenal-franchise-v188.mjs <out-dir>
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { createDefaultSave } from '../src/save.js';
import { listArsenalProfilesV188 } from '../src/weapon-arsenal-v188.js';

const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4751/';
const out = process.argv[2] || 'qa-arsenal-franchise-v188';
await mkdir(out, { recursive: true });
const report = { checks: [], pageErrors: [], consoleErrors: [], shots: [], weapons: [] };
const check = (label, condition, evidence = null) => { report.checks.push({ label, passed: Boolean(condition), evidence }); console.log(JSON.stringify({ check: label, passed: Boolean(condition), evidence })); };
const profiles = listArsenalProfilesV188({ lotB: true });
const weapons = profiles.map(p => p.weaponId), FIRST = weapons[0];
const SHOTS = new Set([FIRST, 'weapon-199-nostromo-laser-pistol', 'weapon-201-lacrima-99-shockrifle', 'weapon-219-morrow-kel-tec-ksg', 'weapon-235-m-90-minigun']);

const save = createDefaultSave(); save.needsPlayerCreationV84 = false; save.scene = 'hub'; save.galaxy.resources.credits = 500000;

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 1440, height: 900 } });
const page = await context.newPage(); page.setDefaultTimeout(30000);
page.on('pageerror', error => report.pageErrors.push(error.message));
page.on('console', message => { if (message.type() === 'error') report.consoleErrors.push(message.text().slice(0, 300)); });
const game = (fn, arg) => page.evaluate(fn, arg);
const shot = async (name, clip = null) => { const file = join(out, `${name}.png`); await page.screenshot(clip ? { path: file, clip } : { path: file }); report.shots.push(file); };
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
  await page.locator('#save-import').setInputFiles({ name: 'arsenal-b.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(save)) });
  await page.getByText('Sauvegarde importée et migrée.', { exact: true }).last().waitFor();

  // —— Armory: provisional plaque, purchase and equip through the real buttons ——
  await navigate('armory'); await page.waitForTimeout(500); await closeDialogs();
  // The armory list is windowed: each weapon is looked up through the real search field.
  const listed = [], plaqued = [];
  for (const profile of profiles) {
    await page.locator('#armory-search').fill(profile.name); await page.waitForTimeout(260);
    const found = await page.evaluate(id => { const card = document.querySelector(`#armory-list [data-catalog-entry-card="${id}"]`);
      return { card: Boolean(card), plaque: Boolean(card?.querySelector(`[data-provisional-plaque-v188="${id}"] canvas`)), images: card ? card.querySelectorAll('img').length : -1 }; }, profile.weaponId);
    if (found.card) listed.push(profile.weaponId); if (found.plaque && found.images === 0) plaqued.push(profile.weaponId);
  }
  check('armory lists every franchise weapon', listed.length === weapons.length, { missing: weapons.filter(id => !listed.includes(id)) });
  check('each franchise card shows its provisional drawn plaque (Canvas, no image)', plaqued.length === weapons.length, { missing: weapons.filter(id => !plaqued.includes(id)) });
  await page.locator('#armory-search').fill(profiles[0].name); await page.waitForTimeout(300);
  await page.locator(`#armory-list [data-catalog-entry="${FIRST}"]`).click(); await page.waitForTimeout(400);
  const detail = await page.evaluate(id => { const figure = document.querySelector(`#armory-catalog-detail [data-provisional-plaque-v188="${id}"]`), canvas = figure?.querySelector('canvas');
    const data = canvas?.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data; let painted = 0;
    if (data) for (let i = 0; i < data.length; i += 4) if (data[i] > 40 || data[i + 1] > 40 || data[i + 2] > 44) painted++;
    return { figure: Boolean(figure), slot: figure?.dataset.placeholderSlot || null, caption: figure?.querySelector('figcaption')?.textContent || null, painted, images: figure ? figure.querySelectorAll('img').length : -1 }; }, FIRST);
  check('dossier plaque is a painted Canvas behind a named slot, without <img>', detail.figure && detail.painted > 500 && detail.images === 0 && /^held-weapon-placeholder-/.test(detail.slot || ''), detail);
  await page.locator('#armory-catalog-detail').scrollIntoViewIfNeeded().catch(() => {});
  await shot('armory-provisional-plaque');
  const procure = page.locator(`#armory-catalog-v62 [data-procure-id="${FIRST}"]`).first();
  check('the franchise weapon is purchasable (ACQUÉRIR enabled, no « plaquette requise » lock)', await procure.count() > 0 && await procure.isEnabled(), { label: await procure.textContent().catch(() => null) });
  await procure.click(); await page.waitForTimeout(500);
  const equip = page.locator(`#armory-catalog-v62 [data-equip-id="${FIRST}"]`).first();
  check('after the purchase the weapon can be equipped', await equip.count() > 0 && await equip.isEnabled(), { label: await equip.textContent().catch(() => null) });
  await equip.click(); await page.waitForTimeout(500);
  await shot('armory-equipped');

  // —— Mission ——
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
  check('mission deployed with the purchased franchise weapon through the loadout', deployed === FIRST, { mission, deployed });

  for (const profile of profiles) {
    const id = profile.weaponId, contact = profile.family === 'melee';
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
    const read = () => game(() => { const e = globalThis.__ATF_GAME__, p = e.player; return { weapon: e.weaponRuntime?.id, shots: p.shots, total: p.ammo + p.ammoReserve, ammo: p.ammo, mag: p.magazineSize,
      phase: p.tacticalReload?.phase || null, state: e.getArsenalStateV188() }; });
    const before = await read();
    await page.keyboard.down('KeyF'); await page.waitForTimeout(1500); await page.keyboard.up('KeyF');
    await page.waitForTimeout(600);
    if (SHOTS.has(id)) {
      const clip = await game(() => { const e = globalThis.__ATF_GAME__, p = e.player, box = document.querySelector('#game-canvas').getBoundingClientRect();
        const k = box.width / 1280, x = box.left + (p.x - (e.camera?.x || 0)) * k, y = box.top + (p.y - (e.camera?.y || 0)) * k;
        return { x: Math.max(0, x - 140 * k), y: Math.max(0, y - 90 * k), width: 340 * k, height: 240 * k }; });
      await shot(`${id}-closeup`, clip);
    }
    const mid = await read();
    if (!contact) {
      // R is pressed again if the first press arrived during a pump stroke or a firing cooldown; then the real reload is awaited.
      for (let attempt = 0; attempt < 4; attempt++) {
        await page.keyboard.press('KeyR'); await page.waitForTimeout(450);
        if (await game(() => { const p = globalThis.__ATF_GAME__.player; return p.tacticalReload?.phase === 'reloading' || p.ammo >= Math.min(p.magazineSize, p.ammo + p.ammoReserve); })) break;
      }
      await page.waitForFunction(() => globalThis.__ATF_GAME__.player.tacticalReload?.phase !== 'reloading', null, { timeout: 12000 }).catch(() => {});
      await page.waitForTimeout(250);
    }
    const after = await read();
    const fired = after.shots - before.shots;
    const row = { id, fired, spent: before.total - after.total, conserved: before.total - after.total === fired, kind: after.state.kind, bridged: after.state.bridged,
      mag: after.mag, ammoAfterFire: mid.ammo, ammoAfterReload: after.ammo, reloadPhase: after.phase, placeholder: after.state.stats.placeholders, slot: profile.held.placeholderSlot };
    report.weapons.push(row);
    if (contact) check(`${id}: contact action performed, no ammunition spent`, after.weapon === id && row.spent === 0 && row.placeholder > 0, row);
    else check(`${id}: fired with the held F key, ammunition conserved through the R reload, placeholder drawn`,
      after.weapon === id && fired > 0 && row.conserved && row.placeholder > 0 && after.ammo === Math.min(after.mag, after.total)
        && row.bridged === Boolean(profile.feed.nativeBridge), row);
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
