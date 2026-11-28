// V188 franchise arsenal (spec 014, lot C) — Chromium QA: the armory shows the provisional drawn plaque of every lot-C
// weapon, the first one is bought and equipped through the real armory buttons, then every lot-C weapon and every
// weapon that hosts a secondary fire is fired in a real mission: primary with the held F key (reload with R), secondary
// with the N key (default binding of the « tir secondaire » action). Ammunition is conserved, the second HUD counter
// and the touch button follow the held weapon, 0 page/console error.
// Fixture (declared): a profile built from createDefaultSave(), imported through the Options screen (#save-import),
// with these injected fields only: needsPlayerCreationV84 = false, scene = hub, galaxy.resources.credits = 500000
// (so the purchase is affordable; no price is asserted).
// Injections (declared): (1) after the first weapon (bought, equipped and deployed by the real path), each next weapon
// is assigned to the running engine as a loadout change would (`weaponRuntime` from the page's own buildWeaponRuntime,
// magazineSize = catalogue magazine, ammo = magazine, ammoReserve = 40, previous primary feed, secondary feed and reload
// state cleared); (2) the marine's health is restored between weapons and nearby hostiles are removed with the engine's
// own defeatEnemy, so a death does not end the run (no combat outcome is claimed).
// A thrown device is thrown with F (one device per throw, nothing to reload).
// Usage: PORT=4821 node scripts/dev.mjs & ; BASE_URL=http://127.0.0.1:4821/ node scripts/qa-arsenal-lot-c-v188.mjs <out-dir>
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { createDefaultSave } from '../src/save.js';
import { listArsenalProfilesV188, getArsenalProfileV188 } from '../src/weapon-arsenal-v188.js';
import { SECONDARY_FIRE_WEAPON_IDS_V188, resolveSecondaryModeV188 } from '../src/weapon-secondary-fire-v188.js';

const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4821/';
const out = process.argv[2] || 'qa-arsenal-lot-c-v188';
await mkdir(out, { recursive: true });
const report = { checks: [], pageErrors: [], consoleErrors: [], shots: [], weapons: [], secondaries: [] };
const check = (label, condition, evidence = null) => { report.checks.push({ label, passed: Boolean(condition), evidence }); console.log(JSON.stringify({ check: label, passed: Boolean(condition), evidence })); };
const lotC = listArsenalProfilesV188({ lotC: true });
// Every lot-C weapon, then the earlier weapons that received a secondary fire in this lot (finish variants share their base).
const hosts = SECONDARY_FIRE_WEAPON_IDS_V188.filter(id => !lotC.some(p => p.weaponId === id) && getArsenalProfileV188(id).baseId === id).map(getArsenalProfileV188);
const profiles = [...lotC, ...hosts], FIRST = lotC[0].weaponId;
const SHOTS = new Set([FIRST, 'weapon-001-m41a-pulse-rifle', 'weapon-266-ripley-m41a-m240-combination', 'weapon-288-sevastopol-molotov', 'weapon-268-m12a1-rocket-launcher']);

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
  await page.locator('#save-import').setInputFiles({ name: 'arsenal-c.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(save)) });
  await page.getByText('Sauvegarde importée et migrée.', { exact: true }).last().waitFor();

  // —— Options: the secondary fire is one rebindable action ——
  const binding = await page.evaluate(() => { const button = document.querySelector('[data-action-v188="secondaryFire"]'); return button ? button.textContent : null; });
  check('the key bindings list holds the « Tir secondaire » action on its default key N', /Tir secondaire · KeyN/.test(binding || ''), { binding });

  // —— Armory: provisional plaque, purchase and equip through the real buttons ——
  await navigate('armory'); await page.waitForTimeout(500); await closeDialogs();
  const listed = [], plaqued = [];
  for (const profile of lotC) {
    await page.locator('#armory-search').fill(profile.name); await page.waitForTimeout(240);
    const found = await page.evaluate(id => { const card = document.querySelector(`#armory-list [data-catalog-entry-card="${id}"]`);
      return { card: Boolean(card), plaque: Boolean(card?.querySelector(`[data-provisional-plaque-v188="${id}"] canvas`)), images: card ? card.querySelectorAll('img').length : -1 }; }, profile.weaponId);
    if (found.card) listed.push(profile.weaponId); if (found.plaque && found.images === 0) plaqued.push(profile.weaponId);
  }
  check('armory lists every lot-C weapon', listed.length === lotC.length, { missing: lotC.map(p => p.weaponId).filter(id => !listed.includes(id)) });
  check('each lot-C card shows its provisional drawn plaque (Canvas, no image)', plaqued.length === lotC.length, { missing: lotC.map(p => p.weaponId).filter(id => !plaqued.includes(id)) });
  await page.locator('#armory-search').fill('Sevastopol Molotov'); await page.waitForTimeout(300);
  await page.locator('#armory-list [data-catalog-entry="weapon-288-sevastopol-molotov"]').click(); await page.waitForTimeout(400);
  const device = await page.evaluate(() => { const figure = document.querySelector('#armory-catalog-detail [data-provisional-plaque-v188="weapon-288-sevastopol-molotov"]');
    return { figure: Boolean(figure), slot: figure?.dataset.placeholderSlot || null, images: figure ? figure.querySelectorAll('img').length : -1 }; });
  check('a thrown device shows the named device slot, without <img>', device.figure && device.slot === 'held-weapon-placeholder-device' && device.images === 0, device);
  await shot('armory-device-plaque');
  await page.locator('#armory-search').fill(lotC[0].name); await page.waitForTimeout(300);
  await page.locator(`#armory-list [data-catalog-entry="${FIRST}"]`).click(); await page.waitForTimeout(400);
  const procure = page.locator(`#armory-catalog-v62 [data-procure-id="${FIRST}"]`).first();
  check('the first lot-C weapon is purchasable (ACQUÉRIR enabled)', await procure.count() > 0 && await procure.isEnabled(), { label: await procure.textContent().catch(() => null) });
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
  check('mission deployed with the purchased lot-C weapon through the loadout', deployed === FIRST, { mission, deployed });

  const read = () => game(() => { const e = globalThis.__ATF_GAME__, p = e.player; return { weapon: e.weaponRuntime?.id, shots: p.shots, total: p.ammo + p.ammoReserve, ammo: p.ammo, mag: p.magazineSize,
    phase: p.tacticalReload?.phase || null, state: e.getArsenalStateV188(), secondary: e.getSecondaryFireStateV188(),
    touchHidden: document.querySelector('#mission-secondary-v188')?.hidden ?? null }; });
  const clear = () => game(() => { const e = globalThis.__ATF_GAME__, p = e.player; // Injection (2)
    p.health = p.maxHealth; p.alive = true; p.downed = false;
    for (const enemy of [...e.enemies]) if (enemy.alive && Math.abs(enemy.x - p.x) < 900) e.defeatEnemy(enemy, p); });
  const closeup = async name => {
    const clip = await game(() => { const e = globalThis.__ATF_GAME__, p = e.player, box = document.querySelector('#game-canvas').getBoundingClientRect();
      const k = box.width / 1280, x = box.left + (p.x - (e.camera?.x || 0)) * k, y = box.top + (p.y - (e.camera?.y || 0)) * k;
      return { x: Math.max(0, x - 140 * k), y: Math.max(0, y - 90 * k), width: 340 * k, height: 240 * k }; });
    await shot(name, clip);
  };

  for (const profile of profiles) {
    const id = profile.weaponId, thrown = profile.fire.actionKind === 'grenade', mode = resolveSecondaryModeV188(id);
    if (id !== FIRST) {
      await game(async weaponId => { // Injection (1)
        const { WEAPONS } = await import('/src/content-core-v50.js'), { buildWeaponRuntime } = await import('/src/game-runtime.js');
        const e = globalThis.__ATF_GAME__, p = e.player, w = WEAPONS.find(entry => entry.id === weaponId);
        e.weaponRuntime = buildWeaponRuntime(w); delete p.arsenalFeedV188; delete p.secondaryFireV188; p.tacticalReload = null; p.reloading = false;
        p.weaponMode = 'rifle'; p.magazineSize = e.weaponRuntime.magazine; p.ammo = p.magazineSize; p.ammoReserve = 40; p.fireClock = 0;
      }, id);
    }
    await clear(); await page.waitForTimeout(250);
    const before = await read();
    await page.keyboard.down('KeyF'); await page.waitForTimeout(thrown ? 900 : 1500); await page.keyboard.up('KeyF');
    await page.waitForTimeout(thrown ? 2200 : 600);
    if (SHOTS.has(id)) await closeup(`${id}-closeup`);
    const mid = await read();
    if (!thrown) {
      for (let attempt = 0; attempt < 4; attempt++) {
        if (await game(() => { const p = globalThis.__ATF_GAME__.player; return p.tacticalReload?.phase === 'reloading' || p.ammo >= Math.min(p.magazineSize, p.ammo + p.ammoReserve); })) break;
        await page.keyboard.press('KeyR'); await page.waitForTimeout(450);
      }
      await page.waitForFunction(() => globalThis.__ATF_GAME__.player.tacticalReload?.phase !== 'reloading', null, { timeout: 14000 }).catch(() => {});
      await page.waitForTimeout(250);
    }
    const after = await read();
    const fired = after.shots - before.shots;
    const row = { id, fired, spent: before.total - after.total, conserved: before.total - after.total === fired, kind: after.state.kind, bridged: after.state.bridged,
      mag: after.mag, ammoAfterFire: mid.ammo, ammoAfterReload: after.ammo, reloadPhase: after.phase, placeholder: after.state.stats.placeholders, slot: profile.held.placeholderSlot,
      secondaryAvailable: after.secondary.available, touchHidden: after.touchHidden };
    report.weapons.push(row);
    const held = profile.held.art === 'canvas-placeholder' ? row.placeholder > 0 : true;
    if (thrown) check(`${id}: thrown with the F key, one device per throw, placeholder drawn`, after.weapon === id && fired > 0 && row.conserved && held, row);
    else check(`${id}: primary fired with the held F key, ammunition conserved through the R reload`,
      after.weapon === id && fired > 0 && row.conserved && held && after.ammo === Math.min(after.mag, after.total) && row.bridged === Boolean(profile.feed.nativeBridge), row);
    check(`${id}: secondary availability and touch button follow the weapon`, row.secondaryAvailable === Boolean(mode) && row.touchHidden === !mode, { mode: mode?.id || null, available: row.secondaryAvailable, touchHidden: row.touchHidden });
    if (!mode) continue;

    // —— Secondary fire with the N key ——
    await clear(); await page.waitForTimeout(700);
    const s0 = await read();
    if (id === 'weapon-001-m41a-pulse-rifle') await shot('m41a-second-counter', { x: 0, y: 0, width: 760, height: 220 });
    if (mode.kind === 'stream') { await page.keyboard.down('KeyN'); await page.waitForTimeout(900); await page.keyboard.up('KeyN'); }
    else { await page.keyboard.press('KeyN'); }
    await page.waitForTimeout(mode.kind === 'grenade' ? 400 : 250);
    if (SHOTS.has(id)) await closeup(`${id}-secondary`);
    await page.waitForTimeout(mode.kind === 'grenade' ? 3600 : 400);
    const s1 = await read();
    const sec = { id, mode: mode.id, kind: mode.kind, hudBefore: s0.secondary.hud, hudAfter: s1.secondary.hud, loadedBefore: s0.secondary.loaded, loadedAfter: s1.secondary.loaded,
      primarySpent: s0.total - s1.total, primaryShots: s1.shots - s0.shots, stats: s1.secondary.stats };
    report.secondaries.push(sec);
    if (mode.kind === 'grenade') check(`${id}: secondary N fires one grenade from its own counter, it explodes, the primary feed is untouched`,
      sec.loadedBefore - sec.loadedAfter === 1 && sec.stats.grenades >= 1 && sec.stats.explosions >= 1 && sec.primarySpent === 0 && sec.primaryShots === 0 && /\d+\/\d+/.test(sec.hudBefore || ''), sec);
    else if (mode.kind === 'stream') check(`${id}: held N sustains the flame from its own tank, the primary feed is untouched`,
      sec.loadedBefore - sec.loadedAfter >= 4 && sec.stats.streams >= 4 && sec.primarySpent === 0 && sec.primaryShots === 0, sec);
    else check(`${id}: secondary N fires ${mode.rounds} primary round(s) at once`, sec.primarySpent === mode.rounds && sec.primaryShots === mode.rounds && sec.stats.volleys >= 1, sec);
  }
  check('0 page errors', report.pageErrors.length === 0, report.pageErrors.slice(0, 5));
  check('0 console errors', report.consoleErrors.length === 0, report.consoleErrors.slice(0, 5));
} catch (error) {
  check('QA script completed', false, error.stack);
} finally {
  await writeFile(join(out, 'report.json'), JSON.stringify(report, null, 2));
  await browser.close();
  const failed = report.checks.filter(entry => !entry.passed).length;
  console.log(JSON.stringify({ checks: report.checks.length, failed, weapons: report.weapons.length, secondaries: report.secondaries.length, pageErrors: report.pageErrors.length, consoleErrors: report.consoleErrors.length }));
  process.exitCode = failed ? 1 : 0;
}
