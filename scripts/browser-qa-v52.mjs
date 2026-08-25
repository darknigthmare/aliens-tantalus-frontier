import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const endpoint = process.env.CDP_ENDPOINT || 'http://127.0.0.1:9225';
const appUrl = process.env.APP_URL || 'http://127.0.0.1:4173/';
const screenshotDir = process.env.QA_SCREENSHOT_DIR
  || path.resolve('.qa', 'browser-v58');
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const requireThat = (condition, message) => { if (!condition) throw new Error(message); };

await mkdir(screenshotDir, { recursive: true });

const browserInfo = await fetch(`${endpoint}/json/version`).then(async (response) => {
  if (!response.ok) throw new Error(`Impossible de joindre Chrome : HTTP ${response.status}`);
  return response.json();
});
const socket = new WebSocket(browserInfo.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});
let browserContextId = null;
let targetId = null;
let pageSessionId = null;

let sequence = 0;
const pending = new Map();
const exceptions = [];
const consoleErrors = [];
const failedRequests = [];
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const request = pending.get(message.id);
    pending.delete(message.id);
    message.error ? request.reject(new Error(message.error.message)) : request.resolve(message.result);
  }
  if (message.method === 'Runtime.exceptionThrown') {
    exceptions.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
  }
  if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
    consoleErrors.push(message.params.args.map((argument) => argument.value || argument.description || argument.type).join(' '));
  }
  if (message.method === 'Network.loadingFailed' && !message.params.canceled) {
    failedRequests.push(`${message.params.type}:${message.params.errorText}`);
  }
});

function command(method, params = {}, { browser = false } = {}) {
  const id = ++sequence;
  const payload = { id, method, params };
  if (pageSessionId && !browser) payload.sessionId = pageSessionId;
  socket.send(JSON.stringify(payload));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

({ browserContextId } = await command('Target.createBrowserContext', {}, { browser: true }));
({ targetId } = await command('Target.createTarget', { url: 'about:blank', browserContextId }, { browser: true }));
({ sessionId: pageSessionId } = await command('Target.attachToTarget', { targetId, flatten: true }, { browser: true }));

async function evaluate(expression) {
  const result = await command('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result.value;
}

async function waitFor(expression, label, timeout = 12000) {
  const started = Date.now();
  let lastValue;
  while (Date.now() - started < timeout) {
    try {
      lastValue = await evaluate(expression);
      if (lastValue) return lastValue;
    } catch (error) {
      lastValue = error.message;
    }
    await wait(100);
  }
  throw new Error(`${label} (délai ${timeout} ms, dernière valeur ${JSON.stringify(lastValue)}, diagnostics ${JSON.stringify({ exceptions, consoleErrors, failedRequests })})`);
}

async function click(selector) {
  return evaluate(`(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) throw new Error('Élément introuvable: ' + ${JSON.stringify(selector)});
    if (element.disabled) throw new Error('Élément désactivé: ' + ${JSON.stringify(selector)});
    element.click();
    return { text: element.textContent.trim(), id: element.id || null, dataset: { ...element.dataset } };
  })()`);
}

async function selectFirstRealOption(selector) {
  return evaluate(`(() => {
    const select = document.querySelector(${JSON.stringify(selector)});
    if (!select) throw new Error('Sélecteur introuvable: ' + ${JSON.stringify(selector)});
    const option = [...select.options].find((entry) => entry.value);
    if (!option) throw new Error('Aucune option réelle: ' + ${JSON.stringify(selector)});
    select.value = option.value;
    select.dispatchEvent(new Event('input', { bubbles: true }));
    select.dispatchEvent(new Event('change', { bubbles: true }));
    return { value: option.value, text: option.textContent.trim() };
  })()`);
}

async function selectValue(selector, value) {
  return evaluate(`(() => {
    const select = document.querySelector(${JSON.stringify(selector)});
    if (!select) throw new Error('Sélecteur introuvable: ' + ${JSON.stringify(selector)});
    select.value = ${JSON.stringify(value)};
    select.dispatchEvent(new Event('input', { bubbles: true }));
    select.dispatchEvent(new Event('change', { bubbles: true }));
    return select.value;
  })()`);
}

async function key(code, keyValue = code) {
  await command('Input.dispatchKeyEvent', { type: 'keyDown', code, key: keyValue });
  await wait(80);
  await command('Input.dispatchKeyEvent', { type: 'keyUp', code, key: keyValue });
  await wait(120);
}

async function hold(code, keyValue, milliseconds) {
  await command('Input.dispatchKeyEvent', { type: 'keyDown', code, key: keyValue });
  await wait(milliseconds);
  await command('Input.dispatchKeyEvent', { type: 'keyUp', code, key: keyValue });
  await wait(160);
}

async function capture(name) {
  const screenshot = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  const destination = path.join(screenshotDir, name);
  await writeFile(destination, Buffer.from(screenshot.data, 'base64'));
  return destination;
}

async function paintEditorTile(tool, column, row) {
  await click(`[data-editor-tool="${tool}"]`);
  return evaluate(`(() => {
    const canvas = document.querySelector('#editor-canvas');
    const rect = canvas.getBoundingClientRect();
    const clientX = rect.left + ((${column} + 0.5) / 32) * rect.width;
    const clientY = rect.top + ((${row} + 0.5) / 18) * rect.height;
    canvas.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, buttons: 1, clientX, clientY }));
    globalThis.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, button: 0, clientX, clientY }));
    return globalThis.__ATF_V51__.editor.getSnapshot();
  })()`);
}

const report = { screenshots: [], checkpoints: [] };
try {
  await command('Page.enable');
  await command('Runtime.enable');
  await command('Network.enable');
  await command('Network.setCacheDisabled', { cacheDisabled: true });
  await command('Network.setBypassServiceWorker', { bypass: true });
  await command('Emulation.setDeviceMetricsOverride', { width: 1440, height: 980, deviceScaleFactor: 1, mobile: false });
  await command('Page.navigate', { url: `${appUrl}${appUrl.includes('?') ? '&' : '?'}qa=v52-${Date.now()}` });

  await waitFor(`Boolean(globalThis.__ATF_V51__ && !document.querySelector('#boot') && !document.querySelector('#app').hidden)`, 'Le boot v51 ne se termine pas', 20000);
  const shell = await evaluate(`(() => ({
    title: document.title,
    release: globalThis.__ATF_V51__.saveSystem.data.release,
    schema: globalThis.__ATF_V51__.saveSystem.data.schema,
    activePanel: document.querySelector('.view.active')?.dataset.panel,
    worlds: document.querySelectorAll('.world-node').length,
    campaigns: document.querySelectorAll('#campaign-list [data-plan-campaign]').length,
    editorTools: document.querySelectorAll('[data-editor-tool]').length,
    appVisible: !document.querySelector('#app').hidden,
    overlay: Boolean(document.querySelector('[data-nextjs-dialog], .vite-error-overlay, #webpack-dev-server-client-overlay'))
  }))()`);
  requireThat(shell.title.includes('v58') && shell.release === '58.0.0' && shell.schema === 51, `Version publique incorrecte: ${JSON.stringify(shell)}`);
  requireThat(shell.appVisible && !shell.overlay && shell.worlds === 64 && shell.campaigns === 436 && shell.editorTools === 13, `Shell v52 incomplet: ${JSON.stringify(shell)}`);
  report.shell = shell;
  report.checkpoints.push('boot-v52');

  await evaluate(`(() => {
    const api = globalThis.__ATF_V51__;
    api.hubEngine.stop(false);
    api.saveSystem.newGame(1);
    Object.assign(api.saveSystem.data.galaxy.resources, { credits: 250000, alloy: 5000, fuel: 500, medical: 500, research: 500, pathogen: 500 });
    Object.assign(api.saveSystem.data.hub.systems, { supplies: 100, power: 100 });
    api.saveSystem.data.hub.activeCrisis = null;
    api.saveSystem.commit();
    api.renderAll();
    return true;
  })()`);
  await click('[data-view="settings"]');
  await selectValue('#setting-aim-assist', 'high');
  await selectValue('#setting-screen-shake', '0.8');
  await evaluate(`(() => {
    const motion = document.querySelector('#setting-motion');
    const subtitles = document.querySelector('#setting-subtitles');
    if (!motion.checked) motion.click();
    if (!subtitles.checked) subtitles.click();
    return true;
  })()`);
  const accessibilitySettings = await evaluate(`({ ...globalThis.__ATF_V51__.saveSystem.data.settings })`);
  requireThat(accessibilitySettings.aimAssist === 'high' && accessibilitySettings.screenShake === 0.8 && accessibilitySettings.reducedMotion && accessibilitySettings.subtitles, `Réglages accessibilité UI non persistés: ${JSON.stringify(accessibilitySettings)}`);
  report.accessibilitySettings = accessibilitySettings;

  await click('[data-view="command"]');
  const strategyBefore = await evaluate(`(() => { const save = globalThis.__ATF_V51__.saveSystem.data; return { clock: { ...save.clock }, actions: save.statistics.strategicActions, log: save.strategy.log.length, resources: { ...save.galaxy.resources } }; })()`);
  const strategyButton = await click('[data-strategy-action]:not([disabled])');
  await waitFor(`globalThis.__ATF_V51__.saveSystem.data.statistics.strategicActions > ${strategyBefore.actions}`, 'Action stratégique sans effet');
  const strategyAfter = await evaluate(`(() => { const save = globalThis.__ATF_V51__.saveSystem.data; return { clock: { ...save.clock }, actions: save.statistics.strategicActions, log: save.strategy.log.length, resources: { ...save.galaxy.resources }, latest: save.strategy.log[0] }; })()`);
  requireThat(JSON.stringify(strategyAfter.clock) !== JSON.stringify(strategyBefore.clock) && strategyAfter.log > strategyBefore.log, `Action stratégique non matérialisée: ${JSON.stringify({ strategyBefore, strategyAfter })}`);
  report.strategy = { action: strategyButton.dataset.strategyAction, before: strategyBefore, after: strategyAfter };
  report.checkpoints.push('strategy-ui');

  await click('[data-view="galaxy"]');
  const diplomacyBefore = await evaluate(`(() => {
    const save = globalThis.__ATF_V51__.saveSystem.data;
    return { clock: { ...save.clock }, credits: save.galaxy.resources.credits, supplies: save.hub.systems.supplies, fuel: save.galaxy.resources.fuel };
  })()`);
  await click('[data-diplomacy="trade"]:not([disabled])');
  await waitFor(`globalThis.__ATF_V51__.saveSystem.data.galaxy.resources.credits === ${diplomacyBefore.credits + 220}`, 'Commerce diplomatique sans transaction');
  const diplomacyAfter = await evaluate(`(() => {
    const save = globalThis.__ATF_V51__.saveSystem.data;
    const button = document.querySelector('[data-diplomacy="trade"]');
    return { clock: { ...save.clock }, credits: save.galaxy.resources.credits, supplies: save.hub.systems.supplies, fuel: save.galaxy.resources.fuel, disabled: button.disabled };
  })()`);
  requireThat(JSON.stringify(diplomacyAfter.clock) !== JSON.stringify(diplomacyBefore.clock) && diplomacyAfter.fuel === diplomacyBefore.fuel + 2 && diplomacyAfter.disabled, `Cooldown diplomatique absent: ${JSON.stringify({ diplomacyBefore, diplomacyAfter })}`);
  await evaluate(`document.querySelector('[data-diplomacy="trade"]').click()`);
  await wait(180);
  const diplomacyFrozen = await evaluate(`(() => { const save = globalThis.__ATF_V51__.saveSystem.data; return { clock: { ...save.clock }, credits: save.galaxy.resources.credits, supplies: save.hub.systems.supplies, fuel: save.galaxy.resources.fuel }; })()`);
  requireThat(JSON.stringify(diplomacyFrozen) === JSON.stringify({ clock: diplomacyAfter.clock, credits: diplomacyAfter.credits, supplies: diplomacyAfter.supplies, fuel: diplomacyAfter.fuel }), `Commerce répétable pendant cooldown: ${JSON.stringify({ diplomacyAfter, diplomacyFrozen })}`);
  report.diplomacy = { before: diplomacyBefore, after: diplomacyAfter };

  await click('[data-view="armory"]');
  await selectValue('#armory-kind', 'equipment');
  const equipmentVisual = await evaluate(`(async () => {
    const image = document.querySelector('#armory-list .catalog-sprite-frame img');
    if (!image) return null;
    image.loading = 'eager';
    await image.decode();
    return { src: image.getAttribute('src'), naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight, displayWidth: image.style.width, displayHeight: image.style.height };
  })()`);
  requireThat(equipmentVisual?.src?.includes('/sprites/normalized/tools/') && equipmentVisual.naturalWidth === 512 && equipmentVisual.naturalHeight === 512 && equipmentVisual.displayWidth === '224px' && equipmentVisual.displayHeight === '224px', `Plaque équipement v56 non chargée: ${JSON.stringify(equipmentVisual)}`);
  await selectValue('#armory-kind', 'weapon');
  const pathogenVisual = await evaluate(`(async () => {
    const image = document.querySelector('#armory-list img[src$="/pathogen-containment-projector-action-sheet.png"]');
    if (!image) return null;
    image.loading = 'eager';
    await image.decode();
    return { src: image.getAttribute('src'), naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight };
  })()`);
  requireThat(pathogenVisual?.src?.includes('/sprites/normalized/weapons/') && pathogenVisual.naturalWidth === 1024 && pathogenVisual.naturalHeight === 1024, `Plaque Pathogen v56 non chargée: ${JSON.stringify(pathogenVisual)}`);
  report.armoryVisuals = { equipment: equipmentVisual, pathogen: pathogenVisual };
  report.checkpoints.push('armory-v56-bitmaps');
  await selectValue('#armory-kind', 'equipment');
  const equipmentProcurement = await click('[data-procure-kind="equipment"]:not([disabled])');
  const equipmentId = equipmentProcurement.dataset.procureId;
  await waitFor(`globalThis.__ATF_V51__.saveSystem.data.strategy.inventory.equipmentIds.includes(${JSON.stringify(equipmentId)})`, 'Acquisition équipement non persistée');
  await click(`[data-equip-id="${equipmentId}"][data-equip-kind="equipment"]`);
  await waitFor(`globalThis.__ATF_V51__.saveSystem.data.player.equipmentIds.includes(${JSON.stringify(equipmentId)})`, 'Équipement non affecté');

  await click('[data-view="vehicles"]');
  const vehicleProcurement = await click('[data-procure-kind="vehicle"]:not([disabled])');
  const vehicleId = vehicleProcurement.dataset.procureId;
  await waitFor(`globalThis.__ATF_V51__.saveSystem.data.strategy.inventory.vehicleIds.includes(${JSON.stringify(vehicleId)})`, 'Acquisition véhicule non persistée');
  await click(`[data-select-vehicle="${vehicleId}"]`);
  await waitFor(`globalThis.__ATF_V51__.saveSystem.data.strategy.selectedVehicleId === ${JSON.stringify(vehicleId)}`, 'Véhicule non affecté');

  await click('[data-view="crew"]');
  const removedCrew = await click('[data-crew-assign]:not([disabled])');
  const removedCrewId = removedCrew.dataset.crewAssign;
  await waitFor(`!globalThis.__ATF_V51__.saveSystem.data.strategy.selectedCrewIds.includes(${JSON.stringify(removedCrewId)})`, 'Retrait équipier sans effet');
  const assignedCrewId = await evaluate(`(() => {
    const selected = globalThis.__ATF_V51__.saveSystem.data.strategy.selectedCrewIds;
    return [...document.querySelectorAll('[data-crew-assign]:not([disabled])')].map((button) => button.dataset.crewAssign).find((id) => !selected.includes(id));
  })()`);
  requireThat(assignedCrewId, 'Aucun remplaçant Echo-9 affectable via UI.');
  await click(`[data-crew-assign="${assignedCrewId}"]`);
  await waitFor(`globalThis.__ATF_V51__.saveSystem.data.strategy.selectedCrewIds.includes(${JSON.stringify(assignedCrewId)})`, 'Affectation équipier sans effet');
  const costumeChoice = await click('[data-costume-id]:not([disabled])');
  const costumeId = costumeChoice.dataset.costumeId;
  await waitFor(`globalThis.__ATF_V51__.saveSystem.data.player.costumeId === ${JSON.stringify(costumeId)}`, 'Costume non appliqué');

  await click('[data-view="operations"]');
  const neuroValue = await selectValue('#neuro-profile-select', 'neuro-002');
  const neuro = { value: neuroValue, text: await evaluate(`document.querySelector('#neuro-profile-select').selectedOptions[0]?.textContent.trim()`) };
  requireThat(neuro.value === 'neuro-002', `Profil Facehugger neuro-002 indisponible: ${JSON.stringify(neuro)}`);
  await waitFor(`globalThis.__ATF_V51__.saveSystem.data.strategy.selectedNeuroProfileId === ${JSON.stringify(neuro.value)}`, 'Profil Neuro-Xeno non sélectionné');
  const apex = await selectFirstRealOption('#apex-dossier-select');
  await waitFor(`globalThis.__ATF_V51__.saveSystem.data.strategy.selectedApexDossierId === ${JSON.stringify(apex.value)}`, 'Dossier Apex non sélectionné');
  report.loadout = { equipmentId, vehicleId, removedCrewId, assignedCrewId, costumeId, neuroId: neuro.value, apexId: apex.value };
  report.checkpoints.push('loadout-ui');

  const campaignChoice = await click('[data-plan-campaign]:not([disabled])');
  const campaignId = campaignChoice.dataset.planCampaign;
  await waitFor(`globalThis.__ATF_V51__.saveSystem.data.strategy.plannedCampaignId === ${JSON.stringify(campaignId)}`, 'Campagne non planifiée');
  await click('#operation-launch');
  await waitFor(`Boolean(globalThis.__ATF_GAME__?.getSnapshot().running && document.querySelector('[data-panel="play"]').classList.contains('active'))`, 'Mission non lancée', 20000);
  await waitFor(`globalThis.__ATF_GAME__.getAssetReport().missing.length === 0`, 'Assets de mission manquants', 30000);
  await waitFor(`Object.keys(globalThis.__ATF_GAME__.getSnapshot().animationRuntime?.activeClips || {}).some((key) => key.startsWith('player:'))`, 'Clip joueur Neuro non échantillonné');
  const missionStart = await evaluate(`globalThis.__ATF_GAME__.getSnapshot()`);
  requireThat(missionStart.routeRuntime && missionStart.encounterRuntime && missionStart.ballistics && missionStart.accessibility, `Runtime production absent: ${JSON.stringify(missionStart)}`);
  requireThat(missionStart.accessibility.reducedMotion && missionStart.accessibility.subtitles && missionStart.accessibility.aimAssist === 'high' && missionStart.accessibility.screenShake === 0, `Accessibilité UI non consommée par la mission: ${JSON.stringify(missionStart.accessibility)}`);
  requireThat(missionStart.selectedVehicle?.id === vehicleId, `Véhicule UI absent du runtime: ${JSON.stringify(missionStart.selectedVehicle)}`);
  requireThat(missionStart.costumeRuntime?.id === costumeId, `Costume UI absent du runtime: ${JSON.stringify(missionStart.costumeRuntime)}`);
  requireThat(missionStart.neuro?.profileId === neuro.value, `Neuro UI absent du runtime: ${JSON.stringify(missionStart.neuro)}`);
  requireThat(missionStart.apexEligibility?.requested === true && missionStart.apexEligibility.dossierId === apex.value, `Dossier Apex UI non évalué: ${JSON.stringify(missionStart.apexEligibility)}`);
  requireThat(missionStart.catalogRuntime?.apex === (missionStart.apexEligibility.eligible ? apex.value : null) && (missionStart.apexEligibility.eligible || missionStart.apexEligibility.reason), `Gate Apex incohérente: ${JSON.stringify({ catalog: missionStart.catalogRuntime, eligibility: missionStart.apexEligibility })}`);
  requireThat(missionStart.equipmentRuntime.some((entry) => entry.id === equipmentId), `Équipement UI absent du runtime: ${JSON.stringify(missionStart.equipmentRuntime)}`);
  requireThat(missionStart.neuroCounterplay?.active && missionStart.neuroCounterplay.pulses > 0, `Contre-jeu Neuro absent: ${JSON.stringify(missionStart.neuroCounterplay)}`);
  requireThat(missionStart.missionLevelRuntime?.schemaVersion === 52 && missionStart.missionLevelRuntime.routes.length >= 2 && missionStart.missionLevelRuntime.zones.length >= 4, `Niveau multi-routes v52 absent: ${JSON.stringify(missionStart.missionLevelRuntime)}`);
  requireThat(missionStart.missionLevelRuntime.artLayers?.far && missionStart.missionLevelRuntime.artLayers?.mid && missionStart.missionLevelRuntime.artLayers?.foreground, `Couches v52 non branchées: ${JSON.stringify(missionStart.missionLevelRuntime?.artLayers)}`);
  const activeColonyLayers = Object.values(missionStart.missionLevelRuntime.activeArtLayers || {});
  requireThat(
    missionStart.missionLevelRuntime.templateId === 'colony-multiroute'
      && activeColonyLayers.length === 3
      && activeColonyLayers.every((asset) => asset.includes('/zones/colony-multiroute/')),
    `Mission coloniale V58 ou triplet zoné absent: ${JSON.stringify(missionStart.missionLevelRuntime)}`);
  requireThat(missionStart.squadRuntime?.configured >= 2 && missionStart.squadRuntime.members.every((member) => member.spriteId && Number.isFinite(member.x) && Number.isFinite(member.y)), `Escouade IA physique absente: ${JSON.stringify(missionStart.squadRuntime)}`);
  requireThat(missionStart.animationRuntime?.sheets === 178 && missionStart.animationRuntime.runtimeReady === 178 && missionStart.animationRuntime.invalid.length === 0, `Contrat animation runtime v56 incomplet: ${JSON.stringify(missionStart.animationRuntime)}`);
  const neuroPlayerClip = Object.entries(missionStart.animationRuntime.activeClips).find(([key]) => key.startsWith('player:'));
  const neuroPlayerContract = missionStart.animationRuntime.neuroPlayerContract;
  requireThat(
    neuroPlayerContract?.profileId === 'neuro-002'
      && neuroPlayerContract.enemyId === 'enemy-002-facehugger'
      && neuroPlayerContract.spriteKey === 'facehugger'
      && neuroPlayerContract.sheetId === 'enemy.facehugger.locomotion'
      && neuroPlayerContract.exact === true
      && neuroPlayerClip?.[1]?.startsWith(`${neuroPlayerContract.sheetId}:`)
      && !neuroPlayerClip[1].includes('xenomorph-drone'),
    `Identité joueur Neuro Facehugger divergente: ${JSON.stringify({ neuroPlayerContract, neuroPlayerClip })}`
  );
  report.neuroVisualIdentity = { contract: neuroPlayerContract, activeClip: neuroPlayerClip };
  const squadCombat = await evaluate(`(() => {
    const game = globalThis.__ATF_GAME__;
    const ally = game.activeSquadActors().find((member) => member.alive && !member.inVehicle);
    game.refreshSpriteCollisionProfiles();
    const enemy = game.enemies
      .filter((entry) => entry.alive && !entry.isBoss)
      .sort((first, second) => (second.spriteHitbox?.local?.h || second.h) - (first.spriteHitbox?.local?.h || first.h))[0];
    if (!ally || !enemy) throw new Error('Scène de combat alliée impossible à isoler.');

    const original = {
      squadActors: game.squadActors,
      enemies: game.enemies,
      walls: game.walls,
      doors: game.doors,
      covers: game.covers,
      hazards: game.hazards,
      bullets: game.bullets,
      particles: game.particles,
      onEvent: game.onEvent,
      ally: { ...ally },
      enemy: { ...enemy },
      squadTelemetry: { ...game.squadTelemetry },
      penetrationTelemetry: { ...game.penetrationTelemetry }
    };
    const restoreEntity = (entity, state) => {
      for (const key of Object.keys(entity)) if (!(key in state)) delete entity[key];
      Object.assign(entity, state);
    };
    const events = [];
    let result;
    try {
      const floor = game.platforms.find((platform) => platform.floor)
        || [...game.platforms].sort((first, second) => second.w - first.w)[0];
      const floorY = Number(floor?.y) || ally.y + ally.h;
      game.squadActors = [ally];
      game.enemies = [enemy];
      game.walls = [];
      game.doors = [];
      game.covers = [];
      game.hazards = [];
      game.bullets = [];
      game.particles = [];
      game.onEvent = (event) => events.push(event);
      Object.assign(ally, { x: 640, y: floorY - ally.h, vx: 0, vy: 0, facing: 1, grounded: true, climbing: false, crouching: false, inVehicle: false, downed: false, alive: true, fireClock: 0, supportClock: 99 });
      Object.assign(enemy, { x: 772, y: floorY - enemy.h, facing: -1, dormant: false, alive: true, alert: true, revealed: 1, speed: 0, attackClock: 99, rangedClock: 99, staggerClock: 99, health: Math.max(100, enemy.health) });
      game.refreshSpriteCollisionProfiles();

      const before = enemy.health;
      const shotsBefore = game.squadTelemetry.shots;
      const hitsBefore = game.penetrationTelemetry.hits;
      game.updateMissionSquad(1 / 60);
      for (let frame = 0; frame < 20 && enemy.health === before; frame += 1) game.updateBullets(1 / 60);
      const squadFire = events.filter((event) => event.type === 'squad-fire');
      const snapshot = game.getSnapshot();
      result = {
        allyId: ally.crewId,
        targetId: enemy.id,
        before,
        after: enemy.health,
        damage: before - enemy.health,
        shots: game.squadTelemetry.shots - shotsBefore,
        hits: game.penetrationTelemetry.hits - hitsBefore,
        squadFire: squadFire.map((event) => ({ crewId: event.crewId, targetId: event.targetId, damage: event.damage })),
        squad: snapshot.squadRuntime,
        animation: snapshot.animationRuntime
      };
    } finally {
      game.squadActors = original.squadActors;
      game.enemies = original.enemies;
      game.walls = original.walls;
      game.doors = original.doors;
      game.covers = original.covers;
      game.hazards = original.hazards;
      game.bullets = original.bullets;
      game.particles = original.particles;
      game.onEvent = original.onEvent;
      restoreEntity(ally, original.ally);
      restoreEntity(enemy, original.enemy);
      Object.assign(game.squadTelemetry, original.squadTelemetry);
      Object.assign(game.penetrationTelemetry, original.penetrationTelemetry);
    }
    return result;
  })()`);
  requireThat(
    squadCombat.shots === 1
      && squadCombat.hits === 1
      && squadCombat.squadFire.length === 1
      && squadCombat.squadFire[0].crewId === squadCombat.allyId
      && squadCombat.squadFire[0].targetId === squadCombat.targetId
      && squadCombat.damage > 0
      && squadCombat.after < squadCombat.before,
    `Allié IA sans tir ciblé ni dégâts physiques: ${JSON.stringify(squadCombat)}`
  );
  report.squadCombat = squadCombat;
  report.checkpoints.push('v52-level-squad-animation');
  await key('KeyX', 'x');
  const afterNeuroCounter = await evaluate(`globalThis.__ATF_GAME__.getSnapshot()`);
  requireThat(afterNeuroCounter.neuroCounterplay.pulses === missionStart.neuroCounterplay.pulses - 1 && afterNeuroCounter.neuroCounterplay.pulseCooldown > 0, `Contre-impulsion X sans effet: ${JSON.stringify({ before: missionStart.neuroCounterplay, after: afterNeuroCounter.neuroCounterplay })}`);

  const beforeInput = afterNeuroCounter;
  await hold('KeyD', 'd', 460);
  const afterMove = await evaluate(`globalThis.__ATF_GAME__.getSnapshot()`);
  requireThat(afterMove.player.x > beforeInput.player.x, `Déplacement mission sans effet: ${JSON.stringify({ before: beforeInput.player, after: afterMove.player })}`);
  await evaluate(`(() => {
    globalThis.__qaSaveEvents = 0;
    globalThis.addEventListener('atf:saved', () => { globalThis.__qaSaveEvents += 1; });
    return true;
  })()`);
  await key('KeyF', 'f');
  const afterFire = await evaluate(`globalThis.__ATF_GAME__.getSnapshot()`);
  const fireApplied = afterMove.neuro?.active ? afterFire.neuro.signal < afterMove.neuro.signal : afterFire.player.ammo < afterMove.player.ammo;
  requireThat(fireApplied, `Action offensive mission sans effet: ${JSON.stringify({ before: { player: afterMove.player, neuro: afterMove.neuro }, after: { player: afterFire.player, neuro: afterFire.neuro } })}`);
  const captionAfterFire = await evaluate(`({ text: document.querySelector('#mission-log').textContent, saves: globalThis.__qaSaveEvents })`);
  requireThat(/SOUS-TITRE/.test(captionAfterFire.text) && captionAfterFire.saves === 0, `Caption invisible ou commit par tir: ${JSON.stringify(captionAfterFire)}`);
  await key('KeyF', 'f');
  await key('KeyF', 'f');
  const fireBurst = await evaluate(`({ saves: globalThis.__qaSaveEvents, text: document.querySelector('#mission-log').textContent })`);
  requireThat(fireBurst.saves === 0 && /SOUS-TITRE/.test(fireBurst.text), `Rafale sérialise localStorage ou perd les sous-titres: ${JSON.stringify(fireBurst)}`);
  const equipmentBefore = afterFire.equipmentRuntime.find((entry) => entry.id === equipmentId);
  await click(`[data-use-equipment="${equipmentId}"]`);
  const equipmentAfter = await evaluate(`globalThis.__ATF_GAME__.getSnapshot().equipmentRuntime.find((entry) => entry.id === ${JSON.stringify(equipmentId)})`);
  requireThat(equipmentAfter.remaining === equipmentBefore.remaining - 1 && equipmentAfter.uses === equipmentBefore.uses + 1, `Utilisation équipement sans effet: ${JSON.stringify({ equipmentBefore, equipmentAfter })}`);
  report.screenshots.push(await capture('alien-tantalus-v58-colony-mission-desktop.png'));
  report.mission = { campaignId, start: missionStart, afterNeuroCounter, afterMove, afterFire, captionAfterFire, fireBurst, equipmentBefore, equipmentAfter };
  report.checkpoints.push('production-mission-input');

  const resumeBefore = await evaluate(`(() => {
    const game = globalThis.__ATF_GAME__;
    game.setCheckpoint('power', Math.round(game.player.x), Math.round(game.player.y));
    game.powerNode.active = true;
    game.supplies[0].used = true;
    game.player.health = 77;
    const victim = game.enemies.find((entry) => entry.alive && !entry.isBoss);
    game.defeatEnemy(victim, game.player);
    const drop = game.drops.find((entry) => entry.id === 'salvage-' + victim.id);
    drop.taken = true;
    game.inventory.salvage += drop.amount;
    document.querySelector('#quick-save').click();
    const stored = globalThis.__ATF_V51__.saveSystem.data.strategy.currentOperation.resumeState;
    return { victimId: victim.id, dropId: drop.id, schema: stored.schema, identity: stored.identity, checkpoint: stored.checkpoint, health: stored.player.health, squad: stored.squad };
  })()`);
  requireThat(resumeBefore.schema === 1 && resumeBefore.identity && resumeBefore.checkpoint.id === 'power' && resumeBefore.squad?.schema === 1 && resumeBefore.squad.members.length >= 2, `Snapshot natif escouade/niveau non persisté avant reload: ${JSON.stringify(resumeBefore)}`);
  await command('Page.reload', { ignoreCache: true });
  await wait(900);
  await waitFor(`Boolean(globalThis.__ATF_V51__ && !document.querySelector('#boot') && globalThis.__ATF_V51__.saveSystem.data.strategy.currentOperation?.resumeState?.schema === 1)`, 'Snapshot opération absent après reload', 20000);
  const persistedResume = await evaluate(`structuredClone(globalThis.__ATF_V51__.saveSystem.data.strategy.currentOperation.resumeState)`);
  await click('#continue-operation');
  await waitFor(`Boolean(globalThis.__ATF_GAME__?.running && globalThis.__ATF_GAME__.lastResumeResult?.applied)`, 'Reprise native non appliquée', 20000);
  const resumeAfter = await evaluate(`(() => {
    const game = globalThis.__ATF_GAME__;
    return { result: { ...game.lastResumeResult }, state: game.captureResumeState(), snapshot: game.getSnapshot() };
  })()`);
  requireThat(resumeAfter.result.applied && resumeAfter.result.squadRestored >= 2 && resumeAfter.state.checkpoint.id === 'power' && resumeAfter.state.player.health === persistedResume.player.health, `Checkpoint/joueur/escouade non repris: ${JSON.stringify({ persistedResume, resumeAfter })}`);
  requireThat(resumeAfter.state.supplies[0].used, `Ravitaillement déjà pris réapparu: ${JSON.stringify(resumeAfter.state.supplies[0])}`);
  const resumedEnemy = resumeAfter.state.enemies.find((entry) => entry.id === resumeBefore.victimId);
  const resumedDrop = resumeAfter.state.drops.find((entry) => entry.id === resumeBefore.dropId);
  requireThat(resumedEnemy && !resumedEnemy.alive && resumedDrop?.taken, `Ressource ou ennemi refarmé après reprise: ${JSON.stringify({ resumedEnemy, resumedDrop })}`);
  report.resume = { before: resumeBefore, persisted: persistedResume, after: resumeAfter.result };
  report.checkpoints.push('native-mission-resume');

  const retreatBefore = await evaluate(`(() => { const save = globalThis.__ATF_V51__.saveSystem.data; const operation = save.strategy.currentOperation; return { operationId: operation.id, worldId: operation.worldId, world: { ...save.galaxy.worldState[operation.worldId] }, retreats: save.statistics.retreats }; })()`);
  await click('#retreat-mission');
  await waitFor(`Boolean(!globalThis.__ATF_V51__.saveSystem.data.strategy.currentOperation && document.querySelector('[data-panel="hub"]').classList.contains('active'))`, 'Retraite non finalisée');
  const retreatAfter = await evaluate(`(() => { const save = globalThis.__ATF_V51__.saveSystem.data; return { lastOperation: { ...save.strategy.lastOperation }, world: { ...save.galaxy.worldState[${JSON.stringify(retreatBefore.worldId)}] }, retreats: save.statistics.retreats }; })()`);
  requireThat(retreatAfter.lastOperation.id === retreatBefore.operationId && retreatAfter.lastOperation.reason === 'retreat', `Conséquence de retraite absente: ${JSON.stringify(retreatAfter)}`);
  requireThat(JSON.stringify(retreatAfter.world) !== JSON.stringify(retreatBefore.world), `Monde inchangé après retraite: ${JSON.stringify({ retreatBefore, retreatAfter })}`);
  requireThat(retreatAfter.retreats === retreatBefore.retreats + 1, `Retraite comptée plusieurs fois: ${JSON.stringify({ retreatBefore, retreatAfter })}`);
  report.retreat = { before: retreatBefore, after: retreatAfter };
  report.checkpoints.push('retreat-persistence');

  await click('[data-view="operations"]');
  await selectValue('#neuro-profile-select', '');
  await waitFor(`globalThis.__ATF_V51__.saveSystem.data.strategy.selectedNeuroProfileId === null`, 'Retour Marine standard non persisté');
  await click('[data-plan-campaign="signature-01"]:not([disabled])');
  await waitFor(`globalThis.__ATF_V51__.saveSystem.data.strategy.plannedCampaignId === 'signature-01'`, 'Campagne holdout v55 non planifiée');
  await click('#operation-launch');
  await waitFor(`Boolean(globalThis.__ATF_GAME__?.getSnapshot().running && document.querySelector('[data-panel="play"]').classList.contains('active'))`, 'Mission holdout v55 non lancée', 20000);
  await waitFor(`globalThis.__ATF_GAME__.getAssetReport().missing.length === 0`, 'Assets de mission holdout v55 manquants', 30000);
  await waitFor(`Object.entries(globalThis.__ATF_GAME__.getSnapshot().animationRuntime?.activeClips || {}).some(([key, clip]) => key.startsWith('player:') && clip.startsWith('player.'))`, 'Clip Marine standard non échantillonné');
  const standardPlayerAnimation = await evaluate(`(() => {
    const animation = globalThis.__ATF_GAME__.getSnapshot().animationRuntime;
    return {
      contract: animation.neuroPlayerContract,
      activeClip: Object.entries(animation.activeClips).find(([key]) => key.startsWith('player:'))
    };
  })()`);
  requireThat(
    standardPlayerAnimation.contract === null && standardPlayerAnimation.activeClip?.[1]?.startsWith('player.echo9-marine.'),
    `Marine standard contaminé par une famille ennemie: ${JSON.stringify(standardPlayerAnimation)}`
  );
  report.standardPlayerAnimation = standardPlayerAnimation;
  const extractionHoldout = await evaluate(`(() => {
    const game = globalThis.__ATF_GAME__;
    const playerOrigin = { x: game.player.x, y: game.player.y, vx: game.player.vx, vy: game.player.vy };
    game.mission.objectives.boss = true;
    Object.assign(game.player, { x: game.archiveTerminal.x, y: game.archiveTerminal.y, vx: 0, vy: 0 });
    const beaconInteraction = game.interact(game.player);
    const timer = game.missionLevelTimers.get('extraction');
    const wave = game.missionLevelSpawns.get('planet-evac-wave');
    const waveEnemies = game.enemies.filter((enemy) => enemy.levelSpawnId === 'planet-evac-wave');
    Object.assign(game.mission.objectives, { power: true, route: true, boss: true, archive: true, extract: false });
    Object.assign(game.objectiveState, { started: true, complete: true });
    Object.assign(game.player, { x: game.objective.x, y: game.objective.y, vx: 0, vy: 0 });
    const blockedInteraction = game.interact(game.player);
    const blockedRequirement = game.missingExtractionRequirement();
    const runningSnapshot = game.getSnapshot().missionLevelRuntime.timers.find((entry) => entry.id === 'extraction');
    const persistedTimer = game.captureResumeState().missionLevel.timers.find((entry) => entry.id === 'extraction');
    const phaseLabel = game.phaseLabel();
    const remainingInZone = timer.remaining;
    const spawn = game.missionLevelRuntime.anchors.spawn;
    Object.assign(game.player, { x: spawn.x - game.player.w / 2, y: spawn.y - game.player.h, vx: 0, vy: 0 });
    game.updateMissionLevelTimers(2);
    const pausedSnapshot = game.getSnapshot().missionLevelRuntime.timers.find((entry) => entry.id === 'extraction');
    const persistedPaused = game.captureResumeState().missionLevel.timers.find((entry) => entry.id === 'extraction');
    Object.assign(game.player, { x: game.objective.x + game.objective.w / 2 - game.player.w / 2, y: game.objective.y + game.objective.h - game.player.h, vx: 0, vy: 0 });
    game.updateMissionLevelTimers(0.5);
    const resumedSnapshot = game.getSnapshot().missionLevelRuntime.timers.find((entry) => entry.id === 'extraction');
    game.updateMissionLevelTimers(timer.remaining + 0.01);
    const completedSnapshot = game.getSnapshot().missionLevelRuntime.timers.find((entry) => entry.id === 'extraction');
    const unlockedRequirement = game.missingExtractionRequirement();
    Object.assign(game.player, playerOrigin);
    return {
      templateId: game.missionLevelRuntime.templateId,
      beaconInteraction,
      blockedInteraction,
      blockedRequirement,
      unlockedRequirement,
      phaseLabel,
      waveActive: Boolean(wave?.active),
      waveEnemies: waveEnemies.length,
      runningSnapshot,
      persistedTimer,
      remainingInZone,
      pausedSnapshot,
      persistedPaused,
      resumedSnapshot,
      completedSnapshot,
      extractionUnlocked: game.missionLevelExtractionUnlocked
    };
  })()`);
  requireThat(
    extractionHoldout.templateId === 'planet-exterior'
      && extractionHoldout.beaconInteraction
      && extractionHoldout.blockedInteraction === false
      && /TENIR LA ZONE/.test(extractionHoldout.blockedRequirement)
      && extractionHoldout.unlockedRequirement === ''
      && /TENIR LA BALISE/.test(extractionHoldout.phaseLabel)
      && extractionHoldout.waveActive
      && extractionHoldout.waveEnemies > 0
      && extractionHoldout.runningSnapshot?.state === 'running'
      && extractionHoldout.persistedTimer?.state === 'running'
      && extractionHoldout.pausedSnapshot?.state === 'paused'
      && extractionHoldout.persistedPaused?.state === 'paused'
      && extractionHoldout.pausedSnapshot?.remaining === extractionHoldout.remainingInZone
      && extractionHoldout.resumedSnapshot?.state === 'running'
      && extractionHoldout.resumedSnapshot?.remaining < extractionHoldout.remainingInZone
      && extractionHoldout.completedSnapshot?.state === 'complete'
      && extractionHoldout.extractionUnlocked,
    `Holdout extraction v55 non fonctionnel: ${JSON.stringify(extractionHoldout)}`
  );
  report.extractionHoldout = extractionHoldout;
  await click('#retreat-mission');
  await waitFor(`Boolean(!globalThis.__ATF_V51__.saveSystem.data.strategy.currentOperation && document.querySelector('[data-panel="hub"]').classList.contains('active'))`, 'Sortie mission holdout v55 non finalisée');

  await evaluate(`(() => {
    const api = globalThis.__ATF_V51__;
    api.hubEngine.stop(false);
    api.showView('command');
    api.saveSystem.data.hub.activeCrisis = { id: 'qa-v52-xeno-crisis', kind: 'xenomorph', count: 1, deck: 0, roomId: 'bridge', resolved: false };
    api.saveSystem.data.hub.deck = 0;
    api.saveSystem.data.hub.roomId = 'bridge';
    api.saveSystem.data.hub.positionX = 180;
    api.saveSystem.data.hub.playerHealth = 100;
    api.saveSystem.commit();
    api.renderAll();
    return true;
  })()`);
  await click('[data-open-hub]');
  await waitFor(`globalThis.__ATF_HUB__.getSnapshot().running && globalThis.__ATF_HUB__.getSnapshot().threats === 1`, 'Crise physique du hub non démarrée');
  await evaluate(`(() => {
    const hub = globalThis.__ATF_HUB__;
    const enemy = hub.enemies.find((entry) => entry.alive);
    Object.assign(hub.player, { x: enemy.x - 155, y: enemy.y + enemy.h - hub.player.h, vx: 0, vy: 0, grounded: true, facing: 1 });
    return hub.getSnapshot();
  })()`);
  report.screenshots.push(await capture('alien-tantalus-v58-hub-crisis-desktop.png'));
  for (let shot = 0; shot < 4; shot += 1) {
    await key('KeyF', 'f');
    if (await evaluate(`globalThis.__ATF_HUB__.getSnapshot().threats === 0`)) break;
  }
  await waitFor(`globalThis.__ATF_HUB__.getSnapshot().threats === 0`, 'La menace du hub résiste aux tirs physiques');
  const crisisResolved = await waitFor(`(() => { const save = globalThis.__ATF_V51__.saveSystem.data; return save.hub.activeCrisis?.resolved ? { crisis: { ...save.hub.activeCrisis }, alerts: save.galaxy.alerts.filter((entry) => entry.type === 'hub-crisis-resolved').length, hub: globalThis.__ATF_HUB__.getSnapshot() } : null; })()`, 'Résolution de crise non persistée');
  requireThat(crisisResolved.alerts > 0, `Alerte de résolution absente: ${JSON.stringify(crisisResolved)}`);
  report.crisis = crisisResolved;
  report.checkpoints.push('hub-crisis-combat');
  const hubNpc = await evaluate(`(() => {
    const api = globalThis.__ATF_V51__;
    const hub = globalThis.__ATF_HUB__;
    const npc = hub.npcs[0];
    const before = api.saveSystem.data.hub.npcInteractions?.[npc.crewId]?.count || 0;
    Object.assign(hub.player, { x: npc.x, y: npc.y, vx: 0, vy: 0, grounded: true });
    hub.interact();
    const after = api.saveSystem.data.hub.npcInteractions?.[npc.crewId]?.count || 0;
    return { crewId: npc.crewId, before, after, roster: hub.getSnapshot().npcRosterCount };
  })()`);
  requireThat(hubNpc.roster === 16 && hubNpc.after === hubNpc.before + 1, `PNJ hub v52 sans interaction persistée: ${JSON.stringify(hubNpc)}`);
  report.hubNpc = hubNpc;
  report.checkpoints.push('hub-npc-interaction');

  await evaluate(`(() => {
    const api = globalThis.__ATF_V51__;
    const hub = globalThis.__ATF_HUB__;
    if (hub.running) return hub.getSnapshot();
    api.showView('hub');
    hub.start({ deck: 0, roomId: 'bridge', positionX: 180, playerHealth: 100, activeCrisis: null });
    return hub.getSnapshot();
  })()`);
  await waitFor(`globalThis.__ATF_HUB__.getSnapshot().running`, 'Hub non relancé après l interaction PNJ');

  const hubTraversal = await evaluate(`(() => {
    const hub = globalThis.__ATF_HUB__;
    const ladder = hub.v51Ladders[0];
    const startY = ladder.bottom - hub.player.h;
    Object.assign(hub.player, {
      x: ladder.x - hub.player.w / 2,
      y: startY,
      vx: 0,
      vy: 0,
      grounded: true,
      climbing: false
    });
    hub.keys.add('KeyW');
    for (let index = 0; index < 8; index += 1) hub.update(0.08);
    hub.keys.delete('KeyW');
    return {
      startY,
      endY: hub.player.y,
      snapshot: hub.getSnapshot(),
      assets: hub.getAssetReport()
    };
  })()`);
  requireThat(
    hubTraversal.snapshot.platformCount === 8
      && hubTraversal.snapshot.ladderCount === 8
      && hubTraversal.snapshot.ventCount === 4
      && hubTraversal.snapshot.route.verticalLinks === 8
      && hubTraversal.snapshot.route.crawlLinks === 4
      && hubTraversal.assets.traversalArtReady === 4
      && hubTraversal.snapshot.roomLayerAssetsReady === 62
      && hubTraversal.endY < hubTraversal.startY - 40,
    `Traversal verticale bitmap du hub invalide: ${JSON.stringify(hubTraversal)}`
  );
  report.screenshots.push(await capture('alien-tantalus-v58-hub-traversal-desktop.png'));

  const hubCoherence = await evaluate(`(() => {
    const hub = globalThis.__ATF_HUB__;
    const before = hub.getSnapshot();
    const lift = hub.doorStates.find((entry) => entry.lift && entry.destinations.some((destination) => destination.deckIndex === 1));
    if (!lift) return { before, error: 'lift-missing' };
    const target = lift.destinations.find((destination) => destination.deckIndex === 1);
    Object.assign(hub.player, { x: lift.x - hub.player.w / 2, y: 624 - hub.player.h, vx: 0, vy: 0, grounded: true });
    const shaftId = lift.shaftId;
    hub.useLift(1);
    const after = hub.getSnapshot();
    return {
      before,
      after,
      shaftId,
      target,
      doorIds: hub.doorStates.map((entry) => entry.id),
      bulkheads: hub.doorStates.filter((entry) => !entry.lift).length,
      lifts: hub.doorStates.filter((entry) => entry.lift).length
    };
  })()`);
  requireThat(
    !hubCoherence.error
      && hubCoherence.before.running
      && hubCoherence.before.doorNetworkCount === 5
      && hubCoherence.after.doorNetworkCount === 5
      && hubCoherence.bulkheads === 3
      && hubCoherence.lifts === 2
      && hubCoherence.after.deck === 1
      && hubCoherence.after.roomId === hubCoherence.target.roomId
      && Math.abs(hubCoherence.after.x - hubCoherence.target.destinationX) <= 2
      && hubCoherence.after.activeLiftShaftId === hubCoherence.shaftId
      && new Set(hubCoherence.doorIds).size === 5,
    `Réseau salles/portes/ascenseurs V58 incohérent: ${JSON.stringify(hubCoherence)}`
  );
  report.hubCoherence = hubCoherence;
  report.hubTraversal = hubTraversal;
  report.checkpoints.push('hub-v58-room-coherence');

  const hubRoomAudit = [];
  const hubRoomIds = [
    ['bridge', 'briefing', 'combat-information', 'cryo-bay'],
    ['crew-quarters', 'mess', 'medical', 'science-lab'],
    ['quarantine', 'armory', 'workshop', 'vehicle-bay'],
    ['dropship-hangar', 'reactor', 'life-support', 'sensor-array']
  ];
  for (const [deckIndex, roomIds] of hubRoomIds.entries()) {
    for (const [roomIndex, roomId] of roomIds.entries()) {
      await evaluate(`(() => {
        const api = globalThis.__ATF_V51__;
        const hub = globalThis.__ATF_HUB__;
        api.showView('hub');
        hub.stop(false);
        hub.start({
          deck: ${deckIndex},
          roomId: '${roomId}',
          positionX: ${roomIndex * 1280 + 640},
          playerHealth: 100,
          activeCrisis: null
        });
        return hub.getSnapshot();
      })()`);
      const snapshot = await waitFor(
        `(() => { const state = globalThis.__ATF_HUB__.getSnapshot(); return state.running && state.deck === ${deckIndex} && state.roomId === '${roomId}' && state.roomLayerAssetsReady === 62 && state.doorNetworkCount === 5 ? state : null; })()`,
        `Salle V58 ${roomId} non prête`,
        20000
      );
      await wait(120);
      const screenshot = await capture(`alien-tantalus-v58-room-${deckIndex + 1}-${roomId}.png`);
      report.screenshots.push(screenshot);
      hubRoomAudit.push({ deck: deckIndex, roomId, composition: snapshot.roomComposition, screenshot });
    }
  }
  requireThat(hubRoomAudit.length === 16, `Audit visuel incomplet des salles: ${JSON.stringify(hubRoomAudit)}`);
  report.hubRoomAudit = hubRoomAudit;
  report.checkpoints.push('hub-v58-16-room-visual-audit');

  await evaluate(`(() => {
    const api = globalThis.__ATF_V51__;
    const hub = globalThis.__ATF_HUB__;
    api.showView('hub');
    hub.stop(false);
    hub.start({ deck: 3, roomId: 'dropship-hangar', positionX: 80, playerHealth: 100, activeCrisis: null });
    return hub.getSnapshot();
  })()`);
  await waitFor(`(() => {
    const snapshot = globalThis.__ATF_HUB__.getSnapshot();
    return snapshot.running && snapshot.roomComposition === 'modular-v55' && snapshot.hubArtAssetsReady === 4;
  })()`, 'Hangar modulaire v55 ou ses quatre bitmaps indisponibles', 30000);
  const modularHangar = await evaluate(`(() => {
    const hub = globalThis.__ATF_HUB__;
    const before = hub.getSnapshot();
    Object.assign(hub.player, { x: 930, y: 624 - hub.player.h, vx: 80, vy: 0, grounded: true });
    hub.hangarHazardCooldown = 0;
    hub.update(0.016);
    const after = hub.getSnapshot();
    return { before, after, assets: hub.getAssetReport() };
  })()`);
  requireThat(
    modularHangar.before.roomBackground === null
      && modularHangar.before.roomComposition === 'modular-v55'
      && modularHangar.after.hubIntegrity < modularHangar.before.hubIntegrity
      && modularHangar.after.shockHits === modularHangar.before.shockHits + 1
      && modularHangar.assets.npcMissionSpriteAssetsReady === 16,
    `Hangar v55 non physique/modulaire: ${JSON.stringify(modularHangar)}`
  );
  report.screenshots.push(await capture('alien-tantalus-v58-hangar-desktop.png'));
  report.modularHangar = modularHangar;
  report.checkpoints.push('hub-modular-v55');

  await click('[data-view="editor"]');
  await click('#editor-clear');
  await selectValue('#editor-mode', 'mission');
  await paintEditorTile('floor', 3, 15);
  await paintEditorTile('spawn', 4, 14);
  await paintEditorTile('objective', 22, 14);
  let forge = await evaluate(`globalThis.__ATF_V51__.editor.getSnapshot()`);
  requireThat(forge.validation.ok && forge.tiles.length === 3, `Forge mission invalide: ${JSON.stringify(forge)}`);
  await click('#editor-undo');
  const forgeUndo = await evaluate(`globalThis.__ATF_V51__.editor.getSnapshot()`);
  requireThat(!forgeUndo.validation.ok && forgeUndo.canRedo, `Undo Forge non fonctionnel: ${JSON.stringify(forgeUndo)}`);
  await click('#editor-redo');
  forge = await evaluate(`globalThis.__ATF_V51__.editor.getSnapshot()`);
  requireThat(forge.validation.ok && forge.tiles.length === 3, `Redo Forge non fonctionnel: ${JSON.stringify(forge)}`);
  await click('#editor-validate');
  await click('#editor-play');
  await waitFor(`globalThis.__ATF_GAME__.getSnapshot().running && globalThis.__ATF_GAME__.getSnapshot().editorMode`, 'Playtest Forge mission non compilé', 20000);
  const forgeMission = await evaluate(`globalThis.__ATF_GAME__.getSnapshot()`);
  requireThat(forgeMission.editorTileCount === 3 && forgeMission.editorTileCounts.spawn === 1 && forgeMission.editorTileCounts.objective === 1, `Blocs Forge absents du runtime mission: ${JSON.stringify(forgeMission)}`);
  await click('#retreat-mission');
  await waitFor(`document.querySelector('[data-panel="hub"]').classList.contains('active')`, 'Retour du playtest mission impossible');

  await click('[data-view="editor"]');
  await selectValue('#editor-mode', 'ship');
  await click('#editor-validate');
  await click('#editor-play');
  await waitFor(`globalThis.__ATF_HUB__.getSnapshot().running && globalThis.__ATF_HUB__.getSnapshot().editorPlaytest`, 'Playtest Forge vaisseau non compilé', 16000);
  const forgeShip = await evaluate(`globalThis.__ATF_HUB__.getSnapshot()`);
  requireThat(forgeShip.editorPlaytest && forgeShip.objectiveCount === 1 && forgeShip.platformCount >= 1, `Blocs Forge absents du runtime vaisseau: ${JSON.stringify(forgeShip)}`);
  await click('#quick-save');
  report.forge = { editor: forge, undo: forgeUndo, mission: forgeMission, ship: forgeShip };
  report.checkpoints.push('forge-mission-ship');

  const persistenceBeforeReload = await evaluate(`(() => {
    const save = globalThis.__ATF_V51__.saveSystem.data;
    return {
      release: save.release,
      equipment: [...save.player.equipmentIds],
      vehicle: save.strategy.selectedVehicleId,
      crew: [...save.strategy.selectedCrewIds],
      costume: save.player.costumeId,
      neuro: save.strategy.selectedNeuroProfileId,
      apex: save.strategy.selectedApexDossierId,
      lastOperationId: save.strategy.lastOperation?.id,
      lastOperationReason: save.strategy.lastOperation?.reason,
      strategicActions: save.statistics.strategicActions,
      projects: save.editor.projects.map((project) => ({ id: project.id, kind: project.kind, tiles: project.tiles.length }))
    };
  })()`);
  await command('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true, screenWidth: 390, screenHeight: 844 });
  await command('Page.reload', { ignoreCache: true });
  await wait(900);
  await waitFor(`Boolean(globalThis.__ATF_V51__ && !document.querySelector('#boot') && !document.querySelector('#app').hidden)`, 'Reload mobile v52 incomplet', 20000);
  const mobile = await evaluate(`(() => {
    const save = globalThis.__ATF_V51__.saveSystem.data;
    const hub = globalThis.__ATF_HUB__.getSnapshot();
    const controls = document.querySelector('.hub-touch-controls');
    const canvas = document.querySelector('#hub-canvas');
    const canvasRect = canvas.getBoundingClientRect();
    const controlsRect = controls.getBoundingClientRect();
    return {
      width: innerWidth,
      activePanel: document.querySelector('.view.active')?.dataset.panel,
      canvasWidth: Math.round(canvasRect.width),
      canvasTop: Math.round(canvasRect.top),
      canvasBottom: Math.round(canvasRect.bottom),
      controlsTop: Math.round(controlsRect.top),
      viewportHeight: innerHeight,
      controlsDisplay: getComputedStyle(controls).display,
      controlCount: controls.querySelectorAll('button').length,
      hubRunning: hub.running,
      editorPlaytest: hub.editorPlaytest,
      npcRosterCount: hub.npcRosterCount,
      persisted: {
        release: save.release,
        equipment: [...save.player.equipmentIds], vehicle: save.strategy.selectedVehicleId,
        crew: [...save.strategy.selectedCrewIds], costume: save.player.costumeId,
        neuro: save.strategy.selectedNeuroProfileId, apex: save.strategy.selectedApexDossierId,
        lastOperationId: save.strategy.lastOperation?.id, lastOperationReason: save.strategy.lastOperation?.reason,
        strategicActions: save.statistics.strategicActions,
        projects: save.editor.projects.map((project) => ({ id: project.id, kind: project.kind, tiles: project.tiles.length }))
      }
    };
  })()`);
  requireThat(mobile.width === 390 && mobile.activePanel === 'hub' && mobile.canvasWidth <= 390 && mobile.canvasWidth >= 300 && mobile.canvasTop >= 180 && mobile.canvasTop < mobile.viewportHeight * 0.55 && mobile.canvasBottom < mobile.controlsTop && mobile.controlsDisplay !== 'none' && mobile.controlCount === 6 && mobile.hubRunning && mobile.npcRosterCount === 16, `Runtime mobile V58 mal cadré ou incomplet: ${JSON.stringify(mobile)}`);
  requireThat(JSON.stringify(mobile.persisted) === JSON.stringify(persistenceBeforeReload), `Persistance divergente après reload: ${JSON.stringify({ persistenceBeforeReload, mobile: mobile.persisted })}`);
  report.screenshots.push(await capture('alien-tantalus-v58-hub-mobile.png'));
  report.mobile = mobile;
  report.persistence = persistenceBeforeReload;
  report.checkpoints.push('reload-mobile-v58-layout-persistence');

  await command('Network.setBypassServiceWorker', { bypass: false });
  await command('Network.setCacheDisabled', { cacheDisabled: false });
  await evaluate(`navigator.serviceWorker.ready.then(() => true)`);
  await command('Page.reload', { ignoreCache: false });
  await wait(900);
  await waitFor(`Boolean(globalThis.__ATF_V51__ && navigator.serviceWorker.controller && !document.querySelector('#boot'))`, 'Service worker non contrôleur', 20000);
  const offlineFailureStart = failedRequests.length;
  await command('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0, connectionType: 'none' });
  await command('Page.reload', { ignoreCache: false });
  await wait(900);
  await waitFor(`Boolean(globalThis.__ATF_V51__ && globalThis.__ATF_V51__.saveSystem.data.release === '58.0.0' && !document.querySelector('#boot'))`, 'Boot hors-ligne v58 impossible', 20000);
  const offline = await evaluate(`({ release: globalThis.__ATF_V51__.saveSystem.data.release, controlled: Boolean(navigator.serviceWorker.controller), appVisible: !document.querySelector('#app').hidden, overlay: Boolean(document.querySelector('[data-nextjs-dialog], .vite-error-overlay, #webpack-dev-server-client-overlay')) })`);
  await command('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1, connectionType: 'wifi' });
  const criticalOfflineFailures = failedRequests.slice(offlineFailureStart).filter((entry) => /^(Document|Script|Stylesheet):/.test(entry));
  requireThat(offline.controlled && offline.appVisible && !offline.overlay && criticalOfflineFailures.length === 0, `PWA hors-ligne incomplète: ${JSON.stringify({ offline, criticalOfflineFailures })}`);
  report.offline = { ...offline, criticalFailures: criticalOfflineFailures };
  report.checkpoints.push('offline-pwa');

  const meaningfulConsoleErrors = consoleErrors.filter((entry) => !/favicon\.ico/i.test(entry));
  requireThat(exceptions.length === 0 && meaningfulConsoleErrors.length === 0, `Erreurs navigateur: ${JSON.stringify({ exceptions, consoleErrors: meaningfulConsoleErrors })}`);
  report.ok = true;
  report.exceptions = exceptions;
  report.consoleErrors = meaningfulConsoleErrors;
  report.failedRequests = failedRequests;
  console.log(JSON.stringify(report, null, 2));
} finally {
  try { await command('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1, connectionType: 'wifi' }); } catch {}
  try {
    if (targetId) await command('Target.closeTarget', { targetId }, { browser: true });
    if (browserContextId) await command('Target.disposeBrowserContext', { browserContextId }, { browser: true });
  } catch {}
  socket.close();
}
