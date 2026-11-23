// Developer tools (spec 012): the dev session bridge, loaded after the game's scripts on
// `/?atf-dev=v188` by the isolated-storage bootstrap (dev-storage-v188.js). It drives the real
// page through its existing entry points (title buttons, showView, launchCampaign, the
// dedicated levels' own phase transitions, the story cinematic player) and adds dev
// overlays (colliders, places, spawn zones, foot line) and toggles (god mode, infinite
// ammo, reveal, time scale, frame step, no spawns). Everything it changes lives in the
// isolated dev storage (dev-storage-v188.js); « Quitter » discards the session.
import { CAMPAIGNS } from '/src/content.js';
import { expectedLandedV188 } from './dev-catalog-v188.js';

const session = globalThis.__ATF_DEV_SESSION_V188__ || { active: false, toggles: {} };
// The launcher lives next to this module, whatever the directory is called in a build.
const DEV_LAUNCHER_URL = new URL('./', import.meta.url).pathname;
const byId = id => document.getElementById(id);
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function waitFor(test, { timeout = 45000, step = 100, label = 'condition' } = {}) {
  const until = performance.now() + timeout;
  for (;;) {
    let value = null; try { value = test(); } catch { value = null; }
    if (value) return value;
    if (performance.now() > until) throw new Error(`dev session: timeout waiting for ${label}`);
    await wait(step);
  }
}
const visible = element => Boolean(element && !element.hidden && element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden');
const activeView = () => document.querySelector('.view.active')?.dataset.panel || null;

const state = {
  status: session.active ? 'booting' : 'no-session', entryId: session.entryId, launch: session.launch,
  landed: null, error: null, log: [], toggles: { godMode: false, infiniteAmmo: false, reveal: false, timeScale: 1, colliders: false,
    places: false, spawnZones: false, footLine: false, noSpawns: false, ...(session.toggles || {}) }
};
try { state.expected = session.launch ? expectedLandedV188(session.launch, JSON.parse(globalThis.localStorage.getItem('atf-v47-profile-1') || 'null')) : null; } catch { state.expected = null; }
const log = (type, detail = {}) => { state.log.push({ t: Math.round(performance.now()), type, ...detail }); if (state.log.length > 400) state.log.shift(); };

// —— Boot and title ——
async function skipIntro() {
  const intro = byId('intro-v188');
  if (!intro || !document.contains(intro)) return;
  for (let tries = 0; tries < 20 && document.contains(intro) && visible(intro); tries += 1) {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }));
    await wait(250);
  }
}
async function continueFromTitle() {
  await waitFor(() => visible(byId('title-start')) || visible(byId('title-menu')), { label: 'title screen' });
  if (visible(byId('title-start'))) byId('title-start').click();
  await waitFor(() => visible(byId('title-continue')), { label: 'title menu' });
  byId('title-continue').click();
  await waitFor(() => !visible(byId('title-screen')), { label: 'title closed' });
}
async function skipCinematics(max = 8) {
  for (let i = 0; i < max && document.querySelector('.cinematic-v188'); i += 1) {
    document.querySelector('.cinematic-skip-v188')?.click(); await wait(250);
  }
}

// —— Launch kinds ——
const campaignById = id => CAMPAIGNS.find(entry => entry.id === id);
async function launchMission(launch) {
  const api = await waitFor(() => globalThis.__ATF_V51__, { label: 'app API' });
  instrumentEngine(api.engine);
  const campaign = campaignById(launch.campaignId);
  if (!campaign) throw new Error(`unknown campaign ${launch.campaignId}`);
  await continueFromTitle();
  await skipCinematics();
  closeSceneDialogs();
  const accepted = api.launchCampaign(campaign);
  if (!accepted && !document.querySelector('dialog[open]')) throw new Error(`launchCampaign refused ${campaign.id}`);
  // The insertion (briefing card and in-level landing) is the real one; it is skipped like a player would.
  let lastClick = 0;
  await waitFor(() => {
    const root = byId('mission-insertion-v62');
    if (root && !root.hidden && performance.now() - lastClick > 350) {
      // Same buttons a player presses: skip an insertion already seen, else answer and advance each phase.
      const pick = root.querySelector('[data-insertion-action="skip"]') || root.querySelector('[data-insertion-complete]')
        || root.querySelector('[data-insertion-action="advance"]:not([disabled])')
        || root.querySelector('[data-story-protocol]:not([disabled])') || root.querySelector('[data-insertion-action="resume"]');
      if (pick && visible(pick)) { pick.click(); lastClick = performance.now(); }
    }
    if (document.querySelector('.insertion-cinematic-v188')) document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }));
    const engine = api.engine;
    return engine.running && engine.campaign?.id === campaign.id && engine.mission?.state === 'active';
  }, { timeout: 60000, step: 250, label: `mission ${campaign.id}` });
  if (launch.phase) await jumpToPhase(api.engine, launch.phase);
  return api.engine;
}
/** Reaches a dedicated level's phase through its own transition (the one a cleared objective calls). */
async function jumpToPhase(engine, phase) {
  const level = () => phase.system === 'colony' ? engine.colonyLevelV188 : engine.stationLevelV188;
  await waitFor(() => level(), { label: 'dedicated level' });
  const advance = () => phase.system === 'colony' ? engine.advanceColonyPhaseV188() : engine.advanceStationPhaseV188();
  for (let guard = 0; level().phase < phase.index && guard < 12; guard += 1) if (!advance()) break;
  // Same placement as a resume or retry at this checkpoint.
  if (engine.checkpoint) for (const [index, actor] of [engine.player, engine.coop].entries()) if (actor) {
    actor.x = engine.checkpoint.x - index * 52; actor.y = engine.checkpoint.y; actor.vx = 0; actor.vy = 0;
  }
  log('phase', { phase: phase.id, checkpoint: level().checkpointId });
}
function closeSceneDialogs() { /* Story dialogs stay: an entry targeting them expects them open. */ }

async function runLaunch() {
  const launch = state.launch;
  if (!launch) return;
  state.status = 'launching';
  await waitFor(() => globalThis.__ATF_V61__ && globalThis.__ATF_V51__, { label: 'app boot' });
  if (launch.kind === 'intro') { state.landed = await waitFor(() => visible(byId('intro-v188')) && 'intro', { timeout: 8000, label: 'intro' }).catch(() => 'title'); return; }
  await skipIntro();
  const api = globalThis.__ATF_V51__;
  if (launch.kind === 'title') { await waitFor(() => visible(byId('title-screen')), { label: 'title' }); state.landed = 'title'; return; }
  if (launch.kind === 'creator') {
    await waitFor(() => visible(byId('title-start')) || visible(byId('title-menu')), { label: 'title' });
    if (visible(byId('title-start'))) byId('title-start').click();
    await waitFor(() => visible(byId('title-continue')), { label: 'menu' });
    byId('title-continue').click(); // a profile that needs creation opens CIN-00, then the creator
    await waitFor(() => document.querySelector('.cinematic-v188') || document.querySelector('[data-player-creator-v84], .player-creator-v84, #player-creator-v84'), { label: 'creator' });
    state.landed = 'creator'; return;
  }
  if (launch.kind === 'mission') { const engine = await launchMission(launch); state.landed = `mission:${engine.campaign.id}${launch.phase ? `#${launch.phase.id}` : ''}`; return; }
  if (launch.kind === 'range') {
    const engine = await launchMission(launch);
    const { startDevRangeV188 } = await import('./dev-range-v188.js');
    state.range = await startDevRangeV188({ engine, api, session: state, log });
    state.landed = 'range'; return;
  }
  await continueFromTitle();
  if (launch.kind === 'hub') {
    if (activeView() !== 'hub') api.showView('hub');
    await waitFor(() => activeView() === 'hub' && api.hubEngine.running, { label: 'hub' });
    const hub = api.hubEngine, room = hub.isAsphodeleV188?.() ? hub.currentRoom?.()?.id : hub.currentRoom?.()?.id;
    state.landed = launch.asphodele ? `asphodele:${room}` : `hub:${room}`; return;
  }
  if (launch.kind === 'view') {
    if (launch.view === 'xenotrials') globalThis.__ATF_XENO_TRIALS_V96__?.open(); else api.showView(launch.view);
    await waitFor(() => activeView() === launch.view, { label: `view ${launch.view}` });
    state.landed = `view:${launch.view}`; return;
  }
  if (launch.kind === 'cinematic') {
    const story = await waitFor(() => globalThis.__ATF_STORY_V188__, { label: 'story hook' });
    void story.playCinematic(launch.cinematicId);
    await waitFor(() => document.querySelector('.cinematic-v188'), { timeout: 15000, label: 'cinematic overlay' });
    state.landed = `cinematic:${launch.cinematicId}`; return;
  }
  throw new Error(`unknown launch kind ${launch.kind}`);
}

// —— Toggles applied each frame on the live engines (dev only, never saved) ——
function applyToggles() {
  const api = globalThis.__ATF_V51__; if (!api) return;
  const engine = api.engine, t = state.toggles;
  if (engine?.running) {
    for (const actor of [engine.player, engine.coop].filter(Boolean)) {
      if (t.godMode) { actor.health = Math.max(actor.health || 0, actor.maxHealth || 100); actor.armor = Math.max(actor.armor || 0, actor.maxArmor || 50); actor.downed = false; actor.bleedOut = 0; }
      if (t.infiniteAmmo) {
        if (Number.isFinite(actor.magazineSize) && actor.ammo < actor.magazineSize && !actor.reloading) actor.ammo = actor.magazineSize;
        if (Number.isFinite(actor.ammoReserve)) actor.ammoReserve = Math.max(actor.ammoReserve, 999);
        if (actor.weaponFeedV167) actor.weaponFeedV167 = null; // the physical feed pilot is bypassed while ammo is infinite
      }
    }
    if (t.reveal) for (const enemy of engine.enemies || []) if (enemy.alive) enemy.revealed = Math.max(enemy.revealed || 0, 1);
    if (t.noSpawns) engine.enemies = (engine.enemies || []).filter(enemy => enemy.devRangeV188);
    if (t.noSpawns && engine.hordeDirectorV132) engine.hordeDirectorV132.phase = 'exhausted';
  }
  const hub = api.hubEngine;
  if (t.reveal && hub?.state?.visited && hub.running) {
    const rooms = (hub.decks || []).flatMap(deck => deck.rooms || []).map(room => room.id);
    for (const id of rooms) if (!hub.state.visited.includes(id)) hub.state.visited.push(id);
  }
}
let frameStepPending = 0;
export function instrumentEngine(engine) {
  if (!engine || engine.devInstrumentedV188) return;
  engine.devInstrumentedV188 = true;
  const update = engine.update.bind(engine), draw = engine.draw.bind(engine), start = engine.start.bind(engine);
  engine.devFrameHooksV188 = [];
  // The options of the last real start (launchCampaign): the range restarts the same level with another loadout.
  engine.start = options => { engine.devLastStartOptionsV188 = options; return start(options); };
  engine.update = delta => {
    if (state.devPaused && !state.stepping) return undefined; // dev pause, independent of the game's own pause
    const scaled = delta * (Number(state.toggles.timeScale) || 1);
    const result = update(scaled); applyToggles();
    for (const hook of engine.devFrameHooksV188) { try { hook(scaled); } catch (error) { log('frame-hook-error', { message: error.message }); } }
    return result;
  };
  engine.draw = () => { const result = draw(); try { drawOverlays(engine); } catch (error) { log('overlay-error', { message: error.message }); } return result; };
}
/** Advances one 1/60 s step while paused (frame step). */
export function frameStepV188(steps = 1) {
  const engine = globalThis.__ATF_V51__?.engine; if (!engine?.running) return false;
  state.devPaused = true; state.stepping = true;
  const wasPaused = engine.paused;
  try { for (let i = 0; i < steps; i += 1) { engine.paused = false; engine.update(1 / 60); } }
  finally { engine.paused = wasPaused; state.stepping = false; }
  engine.draw(); frameStepPending += steps; return true;
}
export function setDevPauseV188(paused = !state.devPaused) { state.devPaused = Boolean(paused); return state.devPaused; }

// —— Overlays (world space: the mission draw scales 1280×720 and translates by the camera) ——
function drawOverlays(engine) {
  const t = state.toggles;
  if (!(t.colliders || t.places || t.spawnZones || t.footLine) && !state.range?.overlay) return;
  const ctx = engine.ctx, canvas = engine.canvas, camera = engine.camera || { x: 0, y: 0 };
  ctx.save(); ctx.scale(canvas.width / 1280, canvas.height / 720); ctx.translate(-camera.x, -camera.y);
  ctx.lineWidth = 1.5; ctx.font = '11px monospace';
  if (t.colliders) {
    ctx.strokeStyle = 'rgba(80,200,255,.75)';
    for (const p of engine.platforms || []) ctx.strokeRect(p.x, p.y, p.w, p.h);
    ctx.strokeStyle = 'rgba(255,220,80,.8)';
    for (const l of engine.ladders || []) ctx.strokeRect(l.x, l.y, l.w, l.h);
    ctx.strokeStyle = 'rgba(255,120,60,.85)';
    for (const d of engine.doors || []) { ctx.strokeRect(d.x, d.y, d.w, d.h); }
    ctx.strokeStyle = 'rgba(255,60,90,.9)';
    for (const e of engine.enemies || []) if (e.alive) { ctx.strokeRect(e.x, e.y, e.w, e.h); ctx.fillStyle = 'rgba(255,60,90,.9)'; ctx.fillText(`${e.caste || e.behavior || ''} ${Math.round(e.health)}`, e.x, e.y - 4); }
    ctx.strokeStyle = 'rgba(120,255,140,.95)';
    for (const a of [engine.player, engine.coop, ...(engine.activeSquadActors?.() || [])].filter(Boolean)) ctx.strokeRect(a.x, a.y, a.w, a.h);
  }
  if (t.places) {
    const level = engine.colonyLevelV188 || engine.stationLevelV188;
    ctx.fillStyle = 'rgba(210,140,255,.95)'; ctx.strokeStyle = 'rgba(210,140,255,.7)';
    for (const [name, value] of Object.entries(level?.places || {})) {
      const points = Array.isArray(value) ? value.filter(Number.isFinite).map(x => ({ x, y: level.places.floorY || 600 }))
        : typeof value === 'number' ? (name === 'floorY' ? [] : [{ x: value, y: level.places.floorY || 600 }])
        : value && Number.isFinite(value.x) ? [{ x: value.x, y: Number.isFinite(value.y) ? value.y : level.places.floorY || 600, w: value.w }] : [];
      for (const point of points) { ctx.beginPath(); ctx.arc(point.x, point.y, 5, 0, Math.PI * 2); ctx.fill(); ctx.fillText(name, point.x + 7, point.y - 6); if (point.w) ctx.strokeRect(point.x, point.y - 4, point.w, 8); }
    }
    if (engine.checkpoint) { ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.fillText(`checkpoint ${engine.checkpoint.id}`, engine.checkpoint.x, engine.checkpoint.y - 12); ctx.strokeRect(engine.checkpoint.x, engine.checkpoint.y, 44, 92); }
    if (engine.objective) { ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.strokeRect(engine.objective.x, engine.objective.y, engine.objective.w, engine.objective.h); }
  }
  if (t.spawnZones) {
    ctx.strokeStyle = 'rgba(255,90,40,.9)'; ctx.fillStyle = 'rgba(255,90,40,.18)';
    for (const entrance of engine.rearEntrancesForTacticsV130?.() || []) { ctx.fillRect(entrance.x, entrance.y, entrance.w, entrance.h); ctx.strokeRect(entrance.x, entrance.y, entrance.w, entrance.h); ctx.fillStyle = 'rgba(255,90,40,.95)'; ctx.fillText(entrance.id, entrance.x, entrance.y - 4); ctx.fillStyle = 'rgba(255,90,40,.18)'; }
    // Insertion safe zone (900 px around the landing, 4 s grace).
    const landing = engine.insertionSafeZoneV188 || engine.insertionSafeZone;
    if (landing && Number.isFinite(landing.x)) { ctx.strokeStyle = 'rgba(80,255,200,.8)'; ctx.strokeRect(landing.x - 900, (engine.player?.y || 500) - 200, 1800, 300); }
  }
  if (t.footLine) for (const a of [engine.player, engine.coop, ...(engine.activeSquadActors?.() || [])].filter(Boolean)) {
    ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.beginPath(); ctx.moveTo(a.x - 12, a.y + a.h); ctx.lineTo(a.x + a.w + 12, a.y + a.h); ctx.stroke();
    const pose = engine.resolvePlayerWeaponPoseV125?.(a, a.combatAimV83);
    if (pose?.muzzle) { ctx.fillStyle = '#ffd34d'; ctx.beginPath(); ctx.arc(pose.muzzle.x, pose.muzzle.y, 3, 0, Math.PI * 2); ctx.fill(); ctx.fillText('muzzle', pose.muzzle.x + 4, pose.muzzle.y - 4); }
    for (const [key, point] of Object.entries(pose || {})) if (point && Number.isFinite(point.x) && Number.isFinite(point.y) && key !== 'muzzle') {
      ctx.fillStyle = '#7fd3ff'; ctx.fillRect(point.x - 2, point.y - 2, 4, 4); ctx.fillText(key, point.x + 4, point.y + 10);
    }
  }
  state.range?.overlay?.(ctx);
  ctx.restore();
}

// —— Dev HUD (dev page only; player screens are untouched) ——
const TOGGLE_LABELS = [['godMode', 'Mode dieu'], ['infiniteAmmo', 'Munitions infinies'], ['reveal', 'Révéler (carte, hostiles)'], ['noSpawns', 'Aucune apparition'],
  ['colliders', 'Collisions'], ['places', 'Lieux et checkpoint'], ['spawnZones', 'Zones d’apparition'], ['footLine', 'Ligne des pieds et attaches']];
function mountHud() {
  const style = document.createElement('link'); style.rel = 'stylesheet'; style.href = new URL('./dev-v188.css', import.meta.url).href; document.head.append(style);
  const hud = document.createElement('aside'); hud.id = 'atf-dev-hud-v188'; hud.className = 'atf-dev-hud-v188'; hud.setAttribute('aria-label', 'Outils de développement');
  hud.innerHTML = `<header><b>DEV</b> <span data-dev-entry></span> <span data-dev-status></span>
    <button type="button" data-dev-collapse aria-expanded="true">–</button></header>
    <div data-dev-body>
      <div class="atf-dev-row">${TOGGLE_LABELS.map(([key, label]) => `<label><input type="checkbox" data-dev-toggle="${key}"> ${label}</label>`).join('')}</div>
      <div class="atf-dev-row"><label>Vitesse <select data-dev-timescale>${[0.1, 0.25, 0.5, 1, 1.5, 2].map(v => `<option value="${v}"${v === 1 ? ' selected' : ''}>×${v}</option>`).join('')}</select></label>
        <button type="button" data-dev-pause>Pause</button><button type="button" data-dev-step>Image +1</button></div>
      <div class="atf-dev-row"><button type="button" data-dev-relaunch>Relancer l’entrée</button><button type="button" data-dev-exit>Quitter vers le lanceur</button></div>
      <p class="atf-dev-note">Sauvegarde de session isolée (mémoire de l’onglet) · le profil réel n’est pas touché.</p>
    </div>`;
  document.body.append(hud);
  hud.querySelector('[data-dev-entry]').textContent = state.entryId || '(aucune entrée)';
  for (const input of hud.querySelectorAll('[data-dev-toggle]')) {
    input.checked = Boolean(state.toggles[input.dataset.devToggle]);
    input.onchange = () => { state.toggles[input.dataset.devToggle] = input.checked; persistToggles(); };
  }
  const scale = hud.querySelector('[data-dev-timescale]'); scale.value = String(state.toggles.timeScale || 1);
  scale.onchange = () => { state.toggles.timeScale = Number(scale.value); persistToggles(); };
  hud.querySelector('[data-dev-pause]').onclick = event => { event.currentTarget.textContent = setDevPauseV188() ? 'Reprendre' : 'Pause'; };
  hud.querySelector('[data-dev-step]').onclick = () => frameStepV188(1);
  hud.querySelector('[data-dev-relaunch]').onclick = () => relaunch();
  hud.querySelector('[data-dev-exit]').onclick = () => exitSession();
  const collapse = hud.querySelector('[data-dev-collapse]'), setCollapsed = collapsed => {
    hud.querySelector('[data-dev-body]').hidden = collapsed; collapse.textContent = collapsed ? '+' : '–'; collapse.setAttribute('aria-expanded', String(!collapsed));
  };
  collapse.setAttribute('aria-label', 'Replier ou déplier le panneau DEV');
  collapse.onclick = () => setCollapsed(!hud.querySelector('[data-dev-body]').hidden);
  // Phone-size screens start folded: one bar over the scene.
  setCollapsed(Boolean(globalThis.matchMedia?.('(max-width: 640px), (max-height: 520px) and (pointer: coarse)').matches));
  setInterval(() => { hud.querySelector('[data-dev-status]').textContent = `${state.status}${state.landed ? ` · ${state.landed}` : ''}${state.error ? ` · ${state.error}` : ''}`; }, 400);
}
function persistToggles() {
  try { const raw = JSON.parse(sessionStorage.getItem(session.sessionKey) || 'null'); if (raw) { raw.toggles = { ...state.toggles }; sessionStorage.setItem(session.sessionKey, JSON.stringify(raw)); } } catch { /* ignore */ }
}
/** Relaunch from the fixture the launcher stored (the dev storage is reset to it). */
function relaunch() {
  try { const raw = JSON.parse(sessionStorage.getItem(session.sessionKey) || 'null'); if (raw?.initialStorage) { raw.storage = raw.initialStorage; sessionStorage.setItem(session.sessionKey, JSON.stringify(raw)); } } catch { /* ignore */ }
  location.reload();
}
/** Discards the dev session: the in-memory profile is dropped, the real localStorage was never written. */
export function exitSession() {
  try { session.discard?.(); sessionStorage.removeItem(session.sessionKey); } catch { /* ignore */ }
  location.assign(DEV_LAUNCHER_URL);
}

globalThis.__ATF_DEV_V188__ = {
  get status() { return state.status; }, get landed() { return state.landed; }, get error() { return state.error; },
  get entryId() { return state.entryId; }, get expected() { return state.expected; }, get log() { return state.log.slice(); }, get range() { return state.range || null; },
  toggles: state.toggles, frameStep: frameStepV188, setPause: setDevPauseV188, get paused() { return Boolean(state.devPaused); }, exit: exitSession,
  snapshot: () => ({ status: state.status, landed: state.landed, expected: state.expected, error: state.error, entryId: state.entryId, view: activeView(), toggles: { ...state.toggles } })
};

if (session.active) {
  mountHud();
  waitFor(() => globalThis.__ATF_V51__?.engine, { label: 'engine' }).then(engine => instrumentEngine(engine)).catch(() => {});
  runLaunch().then(() => { state.status = 'ready'; log('landed', { scene: state.landed }); })
    .catch(error => { state.status = 'error'; state.error = error.message; log('error', { message: error.message }); console.warn('[dev session]', error); });
} else {
  state.status = 'no-session';
  const note = document.createElement('p'); note.className = 'atf-dev-empty-v188';
  note.innerHTML = 'Aucune session de développement dans cet onglet : <a data-dev-launcher-link>ouvrir le lanceur</a>. Le stockage est isolé et vide.';
  note.querySelector('[data-dev-launcher-link]').href = DEV_LAUNCHER_URL;
  document.body.append(note);
}
