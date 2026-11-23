// Developer tools (spec 012; shipped hidden, see scripts/build-dev-tools-v188.mjs): the shooting range. It is NOT a separate
// simulation: it runs inside the real GameEngine (src/game-production-runtime.js) on a
// normal FRONTIER mission level (lighting, VFX, weapon effects, squad doctrine and
// placeables are the live layers). A loadout change restarts that same level with the
// engine's own `start` (the options captured from launchCampaign) and another weapon /
// equipment; targets are created with the engine's own `createEnemy`; measurements come
// from the outermost accepted actions (`fire`, `applyEnemyDamage`, `reload`, `onEvent`).
// Tuning is in memory only; « Exporter » produces a JSON diff for review.
import { WEAPONS, EQUIPMENT, ENEMIES } from '/src/content.js';
import { SQUAD_ORDERS_V132, SQUAD_FORMATIONS_V132, SQUAD_DOCTRINES_V132 } from '/src/squad-doctrine-v132.js';
import { PLACEABLE_CATALOG_V86, PLACEABLE_EXTENSION_CATALOG_V132 } from '/src/placeables-state-v86.js';
import { observedFireRateV188, windowDpsV188, theoreticalDpsV188, theoreticalTtkV188, ttkByCasteV188, spreadStatsV188,
  reloadStatsV188, rangeDistancePxV188, rangeDistanceMetresV188, applyTuningV188, tuningDiffV188, TUNABLE_FIELDS_V188 } from './dev-range-metrics-v188.js';

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const round = (value, digits = 2) => Number.isFinite(value) ? Math.round(value * 10 ** digits) / 10 ** digits : '—';
const CASTE_REPRESENTATIVES = (() => {
  const byCaste = new Map();
  for (const enemy of ENEMIES) if (!byCaste.has(enemy.caste)) byCaste.set(enemy.caste, enemy);
  return [...byCaste.values()];
})();
const AUDIO_SKIP = new Set(['constructor', 'prepare', 'unlock', 'setScene', 'update', 'tick']);

export async function startDevRangeV188({ engine, api, session, log }) {
  const range = {
    weaponId: engine.weaponRuntime?.id || WEAPONS[0].id, equipmentIds: [], physicalMagazines: false,
    targets: [], records: [], shots: [], damage: [], reloads: [], spread: [], events: [], cues: [], trails: new Map(), autoFireUntil: 0, serial: 0,
    overrides: { weapon: {}, equipment: {}, enemy: {} }, lastSquadResult: null, restarts: 0
  };
  const now = () => engine.animationTime || 0;
  const player = () => engine.player;
  const catalogWeapon = id => WEAPONS.find(entry => entry.id === id);
  const tunedWeapon = id => applyTuningV188('weapon', catalogWeapon(id), range.overrides.weapon[id] || {});
  const tunedEquipment = id => applyTuningV188('equipment', EQUIPMENT.find(entry => entry.id === id), range.overrides.equipment[id] || {});
  const tunedEnemy = enemy => applyTuningV188('enemy', enemy, range.overrides.enemy[enemy.id] || {});

  // —— Instrumentation of the accepted actions (installed once on the engine instance) ——
  if (!engine.devRangeInstrumentedV188) {
    engine.devRangeInstrumentedV188 = true;
    const fire = engine.fire.bind(engine), damage = engine.applyEnemyDamage.bind(engine), reload = engine.reload.bind(engine);
    engine.fire = (actor = engine.player) => {
      const before = Number(actor?.shots) || 0;
      const result = fire(actor);
      if (actor === engine.player && Number(actor.shots) > before) {
        for (let n = before; n < Number(actor.shots); n += 1) range.shots.push(now());
        const pose = engine.resolvePlayerWeaponPoseV125?.(actor, actor.combatAimV83);
        const projectile = [...(engine.weaponProjectilesV131 || []), ...(engine.weaponProjectilesV130 || []), ...(engine.bullets || [])].at(-1);
        const angle = projectile && Number.isFinite(projectile.vx) ? Math.atan2(projectile.vy || 0, projectile.vx) : pose?.angle;
        const aim = Number.isFinite(pose?.angle) ? pose.angle : (actor.facing < 0 ? Math.PI : 0);
        if (Number.isFinite(angle)) range.spread.push({ angle, aim, t: now() });
        if (range.shots.length > 2000) range.shots.splice(0, 1000);
        if (range.spread.length > 400) range.spread.splice(0, 200);
      }
      return result;
    };
    engine.applyEnemyDamage = (enemy, amount, source = {}) => {
      const applied = damage(enemy, amount, source);
      if (Number.isFinite(applied) && applied > 0) {
        const owner = source?.owner === engine.player ? 'player' : source?.owner?.squadMember ? `squad:${source.owner.crewId}` : source?.owner === engine.coop ? 'coop' : 'other';
        range.damage.push({ t: now(), enemyId: enemy?.id, caste: enemy?.caste, applied, weaponId: source?.weaponId || null, owner });
        const record = enemy?.devRangeV188; if (record && !Number.isFinite(record.firstHit)) record.firstHit = now();
        if (range.damage.length > 4000) range.damage.splice(0, 2000);
      }
      return applied;
    };
    engine.reload = (actor = engine.player) => {
      const result = reload(actor);
      if (result && actor === engine.player) range.reloads.push({ start: now(), end: null, ammo: actor.ammo });
      return result;
    };
    const publish = engine.onEvent;
    engine.onEvent = event => {
      if (event?.type) { range.events.push({ t: round(now(), 3), type: event.type }); if (range.events.length > 300) range.events.splice(0, 150); }
      return publish?.(event);
    };
    const audio = engine.audio;
    if (audio) for (const name of Object.getOwnPropertyNames(Object.getPrototypeOf(audio))) {
      if (AUDIO_SKIP.has(name) || typeof audio[name] !== 'function' || Object.hasOwn(audio, name)) continue;
      const original = audio[name];
      audio[name] = function devCueV188(...args) {
        range.cues.push({ t: round(now(), 3), cue: name, arg: typeof args[0] === 'string' ? args[0].slice(0, 40) : '' });
        if (range.cues.length > 300) range.cues.splice(0, 150);
        return original.apply(this, args);
      };
    }
  }

  // —— Restart the same level with another loadout (engine.start, as launchCampaign does) ——
  function restart() {
    const base = engine.devLastStartOptionsV188;
    if (!base) throw new Error('range: no captured start options');
    const weapon = tunedWeapon(range.weaponId);
    const equipment = range.equipmentIds.map(tunedEquipment).filter(Boolean);
    engine.stop();
    engine.start({ ...base, weapon, equipment: equipment.length ? equipment : base.equipment, resumeState: null, insertionHandoverV188: null,
      experimentalPhysicalMagazinesV167: range.physicalMagazines, userEquipmentV95: null });
    range.restarts += 1; range.trails.clear();
    clearHostiles();
    for (const target of range.targets.splice(0)) spawn(target);
    log('range-restart', { weapon: weapon.id, equipment: equipment.map(item => item.id) });
  }
  function clearHostiles() {
    engine.enemies = (engine.enemies || []).filter(enemy => enemy.devRangeV188);
    if (engine.hordeDirectorV132) engine.hordeDirectorV132.phase = 'exhausted';
  }
  function groundAt(x) {
    const actor = player();
    const support = engine.missionLevelSurfaceFor?.({ x, y: actor.y, w: 44, h: actor.h }, { tolerance: 400 });
    return Number.isFinite(support?.y) ? support.y : actor.y + actor.h;
  }
  /** Adds a target: an enemy of the catalogue at a distance (m) along the marine's facing. */
  function spawn({ enemyId, distance = 10, behaviour = false, motion = 'static', dummy = false } = {}) {
    const source = ENEMIES.find(entry => entry.id === enemyId) || CASTE_REPRESENTATIVES[0];
    const actor = player(), direction = actor.facing || 1;
    const x = actor.x + actor.w / 2 + direction * rangeDistancePxV188(distance);
    const tuned = dummy ? { ...tunedEnemy(source), damage: 1 } : tunedEnemy(source);
    const enemy = engine.createEnemy(tuned, engine.enemies.length, x, groundAt(x), { boss: false, keyCarrier: false });
    enemy.x = x - enemy.w / 2; // the distance is measured centre to centre
    // A training dummy keeps the caste's body but soaks damage (the engine caps catalogue health at creation).
    if (dummy) { enemy.health = 5000; enemy.maxHealth = 5000; }
    enemy.id = `dev-range-${++range.serial}-${source.id}`;
    enemy.devRangeV188 = { enemyId: source.id, caste: source.caste, distance, behaviour, motion, dummy, anchorX: enemy.x, anchorY: enemy.y, spawnedAt: now(), firstHit: null, death: null };
    enemy.dormant = false; enemy.alert = behaviour;
    engine.enemies.push(enemy);
    range.targets.push({ enemyId: source.id, distance, behaviour, motion, dummy });
    return enemy;
  }
  function frame() {
    const t = now();
    clearHostiles();
    for (const enemy of engine.enemies) {
      const record = enemy.devRangeV188; if (!record) continue;
      if (!enemy.alive && !Number.isFinite(record.death)) { record.death = t; range.records.push({ caste: record.caste, enemyId: record.enemyId, firstHit: record.firstHit, death: t, distance: record.distance }); }
      if (!enemy.alive || record.behaviour) continue;
      enemy.x = record.motion === 'patrol' ? record.anchorX + Math.sin((t - record.spawnedAt) * 1.2) * 102 : record.anchorX; // patrol: ±2 m
      enemy.y = record.anchorY; enemy.vx = 0; enemy.vy = 0;
      enemy.alert = false; enemy.attacking = false; enemy.pendingMelee = false; enemy.attackClock = Math.max(enemy.attackClock || 0, 1); enemy.rangedClock = Math.max(enemy.rangedClock || 0, 1);
    }
    const last = range.reloads.at(-1);
    if (last && last.end === null && !player()?.reloading) last.end = t;
    if (range.autoFireUntil > t) engine.fire(player());
    for (const list of [engine.bullets, engine.weaponProjectilesV130, engine.weaponProjectilesV131]) for (const projectile of list || []) {
      if (!Number.isFinite(projectile?.x)) continue;
      const trail = range.trails.get(projectile) || []; trail.push([projectile.x + (projectile.w || 0) / 2, projectile.y + (projectile.h || 0) / 2]);
      if (trail.length > 40) trail.shift(); range.trails.set(projectile, trail);
    }
    if (range.trails.size > 200) for (const key of [...range.trails.keys()].slice(0, 100)) range.trails.delete(key);
  }
  engine.devFrameHooksV188?.push(frame);

  // —— Overlay: distance ruler (1 m = 51 px), projectile paths, target labels ——
  range.overlay = ctx => {
    const actor = player(); if (!actor) return;
    const foot = actor.y + actor.h, origin = actor.x + actor.w / 2, direction = actor.facing || 1;
    ctx.strokeStyle = 'rgba(127,224,168,.55)'; ctx.fillStyle = 'rgba(127,224,168,.9)'; ctx.font = '11px monospace';
    for (let metre = 0; metre <= 40; metre += 5) { const x = origin + direction * rangeDistancePxV188(metre); ctx.beginPath(); ctx.moveTo(x, foot); ctx.lineTo(x, foot - (metre % 10 ? 10 : 18)); ctx.stroke(); ctx.fillText(`${metre} m`, x + 2, foot - 20); }
    ctx.strokeStyle = 'rgba(255,210,90,.75)';
    for (const trail of range.trails.values()) { if (trail.length < 2) continue; ctx.beginPath(); ctx.moveTo(...trail[0]); for (const point of trail.slice(1)) ctx.lineTo(...point); ctx.stroke(); }
    let row = 0;
    for (const enemy of engine.enemies) { const record = enemy.devRangeV188; if (!record) continue; row += 1;
      ctx.fillStyle = enemy.alive ? 'rgba(255,120,120,.95)' : 'rgba(160,160,160,.8)';
      ctx.fillText(`${record.caste} ${Math.max(0, Math.round(enemy.health))}/${Math.round(enemy.maxHealth)} · ${rangeDistanceMetresV188(enemy.x + enemy.w / 2 - origin)} m`, enemy.x - 10, enemy.y - 16 - (row % 3) * 13); }
  };

  // —— Readouts ——
  function measures() {
    const t = now(), weapon = tunedWeapon(range.weaponId), actor = player() || {};
    const pose = engine.resolvePlayerWeaponPoseV125?.(actor, actor.combatAimV83) || {};
    const feed = actor.weaponFeedV167;
    const castes = Object.fromEntries(CASTE_REPRESENTATIVES.map(enemy => [enemy.caste, theoreticalTtkV188(weapon, engine.createEnemy ? tunedEnemy(enemy).health : enemy.health)]));
    return {
      t: round(t, 3), weapon: { id: weapon.id, name: weapon.name, family: weapon.family, tags: weapon.tags || [], damage: weapon.damage, fireRate: weapon.fireRate, magazine: weapon.magazine, reload: weapon.reload, penetration: weapon.penetration },
      descriptor: engine.reloadWeaponV77?.(actor)?.id || null, actionProfile: engine.weaponActionProfileV130?.(actor) || null,
      fireRate: observedFireRateV188(range.shots), dps: windowDpsV188(range.damage.filter(event => event.owner === 'player'), { now: t, window: 3 }),
      squadDps: windowDpsV188(range.damage.filter(event => event.owner.startsWith('squad:')), { now: t, window: 3 }), theoretical: theoreticalDpsV188(weapon),
      ttkObserved: ttkByCasteV188(range.records), ttkTheoretical: castes, spread: spreadStatsV188(range.spread.slice(-60)), reloads: reloadStatsV188(range.reloads),
      magazine: { ammo: actor.ammo, size: actor.magazineSize, reserve: actor.ammoReserve, reloading: Boolean(actor.reloading), reloadPhase: pose.reloadPhase || null,
        feed: feed ? { feed: feed.feed, chamber: feed.chamber, mounted: feed.magazines?.find(m => m.location === 'mounted')?.rounds ?? null, magazines: feed.magazines?.length || 0, loose: feed.looseRounds } : null,
        thermal: engine.weaponThermalV131?.player ?? null, status: engine.weaponStatusesV131?.player ?? null },
      // Spec 014: the arsenal contract (feed, capacity source, VFX/audio choices) and the live native feed.
      arsenal: (() => { const state = engine.getArsenalStateV188?.('player'), profile = state?.profile;
        return state ? { feed: profile?.feed.kind || null, nativeBridge: profile?.feed.nativeBridge || null, capacity: profile?.feed.runtimeCapacity ?? null,
          capacitySource: profile?.feed.capacitySource || null, detachable: Boolean(profile?.feed.detachableMagazine), ejection: profile?.vfx.ejection || null,
          tracer: profile?.vfx.tracer || null, shotCue: profile?.audio.shot || null, heldArt: profile?.held.art || null, fidelity: profile?.fidelity.status || null,
          live: { bridged: state.bridged, loaded: state.loaded, reserve: state.reserve, needsCycle: state.needsCycle, spentCases: state.spentCases, pending: Boolean(state.pending) },
          stats: state.stats } : null; })(),
      projectiles: { bullets: engine.bullets?.length || 0, v130: engine.weaponProjectilesV130?.length || 0, v131: engine.weaponProjectilesV131?.length || 0, beams: engine.weaponBeamsV131?.length || 0 },
      effects: engine.weaponEffectsSnapshotV124?.()?.stats || null,
      rig: { weaponMode: actor.weaponMode, grounded: actor.grounded, crouching: actor.crouching, climbing: actor.climbing, aiming: actor.aimingV124, fireClock: round(actor.fireClock, 3),
        actionClock: round(actor.actionClock, 3), angle: round(pose.angle, 3), recoil: pose.recoil ?? null, reloadProgress: round(pose.reloadProgress, 2), spriteKey: actor.spriteKey, sheet: actor.visualSheetId,
        weaponImage: pose.imageKey || null, footY: round(actor.y + actor.h, 1), muzzle: pose.muzzle ? [round(pose.muzzle.x, 1), round(pose.muzzle.y, 1)] : null, grip: pose.grip ? [round(pose.grip.x, 1), round(pose.grip.y, 1)] : null },
      squad: (engine.activeSquadActors?.() || []).map(member => ({ crewId: member.crewId, team: member.squadTeamV132 || null, x: Math.round(member.x), alive: member.alive, downed: Boolean(member.downed),
        reloading: Boolean(member.reloading), fireClock: round(member.fireClock, 2), weapon: member.crewV85?.weaponRuntime?.id || null })),
      doctrine: engine.getSquadDoctrineSnapshotV132?.() || null, placeables: engine.getPlaceablesSnapshotV86?.() || null,
      targets: engine.enemies.filter(enemy => enemy.devRangeV188).map(enemy => ({ id: enemy.id, caste: enemy.devRangeV188.caste, health: Math.round(enemy.health), alive: enemy.alive,
        distance: rangeDistanceMetresV188(enemy.x + enemy.w / 2 - ((actor.x || 0) + (actor.w || 0) / 2)), behaviour: enemy.devRangeV188.behaviour, motion: enemy.devRangeV188.motion })),
      events: range.events.slice(-20), cues: range.cues.slice(-20), lastSquadResult: range.lastSquadResult
    };
  }

  // —— Squad orders (the existing V132 set) ——
  function squad(action, value) {
    let result;
    if (action === 'marker') { const actor = player(); result = engine.performSquadActionV132?.('marker', { x: actor.x + (actor.facing || 1) * rangeDistancePxV188(Number(value) || 6), y: actor.y }); }
    else result = engine.performSquadActionV132?.(action, value);
    range.lastSquadResult = { action, value, ...(result || { applied: false, reason: 'unavailable' }) };
    log('squad-order', range.lastSquadResult);
    return range.lastSquadResult;
  }
  function exportDiff(note = '') {
    return tuningDiffV188({ weapon: WEAPONS, equipment: EQUIPMENT, enemy: ENEMIES }, range.overrides, { note });
  }

  const api2 = {
    get state() { return range; }, measures, restart, spawn, squad, exportDiff, overlay: range.overlay,
    setWeapon(id) { if (!catalogWeapon(id)) throw new Error(`range: unknown weapon ${id}`); range.weaponId = id; restart(); return engine.weaponRuntime?.id; },
    setEquipment(ids, { physicalMagazines = range.physicalMagazines } = {}) { range.equipmentIds = ids.filter(id => EQUIPMENT.some(entry => entry.id === id)); range.physicalMagazines = Boolean(physicalMagazines); restart(); },
    useEquipment(id) { const used = engine.useEquipment?.(id); log('equipment-use', { id, used: Boolean(used) }); return used; },
    autoFire(seconds = 2) { range.autoFireUntil = now() + Math.max(0, Number(seconds) || 0); },
    reload() { return engine.reload(player()); },
    clearTargets() { engine.enemies = engine.enemies.filter(enemy => !enemy.devRangeV188); range.targets.length = 0; },
    resetMeasures() { for (const key of ['records', 'shots', 'damage', 'reloads', 'spread', 'events', 'cues']) range[key].length = 0; range.trails.clear(); },
    tune(kind, id, values) { if (!TUNABLE_FIELDS_V188[kind]) throw new Error('range: unknown tuning kind'); range.overrides[kind][id] = { ...(range.overrides[kind][id] || {}), ...values }; }
  };
  // Start: same level, no landing sequence, no hostiles; the marine keeps the mission's own loadout.
  restart();
  session.toggles.noSpawns = true;
  mountPanel(api2);
  return api2;
}

// —— Panel (dev page only) ——
function mountPanel(range) {
  const panel = document.createElement('section'); panel.className = 'atf-dev-range-v188'; panel.id = 'atf-dev-range-v188'; panel.setAttribute('aria-label', 'Stand de tir (dev)');
  const tabs = [['weapons', 'Armes'], ['equipment', 'Équipement'], ['squad', 'Escouade'], ['targets', 'Cibles'], ['measures', 'Mesures'], ['tuning', 'Réglages'], ['log', 'Journal']];
  const weaponOptions = WEAPONS.map(entry => `<option value="${entry.id}">${escapeHtml(entry.name)} · ${escapeHtml(entry.family)}${(entry.tags || []).length ? ` · ${escapeHtml(entry.tags.join('/'))}` : ''}</option>`).join('');
  const equipmentOptions = EQUIPMENT.map(entry => `<option value="${entry.id}">${escapeHtml(entry.name)} · ${escapeHtml(entry.grade)} · ${escapeHtml(entry.utility)}</option>`).join('');
  const casteOptions = CASTE_REPRESENTATIVES.map(entry => `<option value="${entry.id}">${escapeHtml(entry.caste)} · ${escapeHtml(entry.name)}</option>`).join('');
  const placeables = [...PLACEABLE_CATALOG_V86, ...PLACEABLE_EXTENSION_CATALOG_V132].map(entry => escapeHtml(entry.catalogId || entry.id || entry.name)).join(', ');
  panel.innerHTML = `<nav role="tablist">${tabs.map(([id, label], index) => `<button type="button" role="tab" data-range-tab="${id}" aria-selected="${index === 0}">${label}</button>`).join('')}<button type="button" data-range-collapse aria-expanded="true" aria-label="Replier ou déplier le stand">▾</button></nav>
    <section data-range-panel="weapons"><label>Arme <select data-range-weapon>${weaponOptions}</select></label> <button type="button" data-range-equip-weapon>Équiper (relance du niveau)</button>
      <div class="atf-dev-row"><button type="button" data-range-fire="0.5">Tir 0,5 s</button><button type="button" data-range-fire="3">Tir 3 s</button><button type="button" data-range-reload>Recharger</button><button type="button" data-range-reset>Remettre les mesures à zéro</button></div>
      <p class="atf-dev-note">Tir clavier/souris normal aussi. Arme sous le canon, alimentations spéciales et accessoires : ceux de l’entrée choisie (étiquettes du catalogue, profil d’action et état d’alimentation affichés dans Mesures).</p></section>
    <section data-range-panel="equipment" hidden><label>Équipement <select data-range-equipment>${equipmentOptions}</select></label>
      <label><input type="checkbox" data-range-physical> Chargeurs physiques (pilote V167)</label> <button type="button" data-range-equip>Équiper (relance)</button> <button type="button" data-range-use>Utiliser</button>
      <p class="atf-dev-note">Posables admis (V86/V132) : ${placeables}. Pose et récupération par le dock de posables du jeu.</p></section>
    <section data-range-panel="squad" hidden><div class="atf-dev-row">${SQUAD_ORDERS_V132.map(o => `<button type="button" data-range-squad="order" data-value="${o.id}">${escapeHtml(o.label)}</button>`).join('')}
      <button type="button" data-range-squad="marker" data-value="6">Repère à 6 m</button></div>
      <div class="atf-dev-row">${['all', 'alpha', 'bravo'].map(team => `<button type="button" data-range-squad="select-team" data-value="${team}">Équipe ${team}</button>`).join('')}</div>
      <div class="atf-dev-row">${SQUAD_FORMATIONS_V132.map(o => `<button type="button" data-range-squad="formation" data-value="${o.id}">${escapeHtml(o.label)}</button>`).join('')}</div>
      <div class="atf-dev-row">${SQUAD_DOCTRINES_V132.map(o => `<button type="button" data-range-squad="doctrine" data-value="${o.id}">${escapeHtml(o.label)}</button>`).join('')}</div>
      <pre data-range-squad-out></pre></section>
    <section data-range-panel="targets" hidden><label>Caste <select data-range-caste>${casteOptions}</select></label> <label>Distance (m) <input type="number" min="1" max="40" step="1" value="10" data-range-distance></label>
      <label><input type="checkbox" data-range-behaviour> Comportement actif</label> <label>Mouvement <select data-range-motion><option value="static">Fixe</option><option value="patrol">Va-et-vient ±2 m</option></select></label>
      <div class="atf-dev-row"><button type="button" data-range-spawn>Ajouter la cible</button><button type="button" data-range-dummy>Mannequin (5000 PV)</button><button type="button" data-range-wave>Une cible par caste</button><button type="button" data-range-clear>Vider</button></div>
      <table data-range-targets></table></section>
    <section data-range-panel="measures" hidden><table data-range-measures></table><canvas width="520" height="120" data-range-spread></canvas><pre data-range-rig></pre></section>
    <section data-range-panel="tuning" hidden><p class="atf-dev-note">Modifications en mémoire seulement. Arme et équipement : appliquées à la relance ; cibles : aux prochaines apparitions.</p>
      <div data-range-tuning></div><div class="atf-dev-row"><button type="button" data-range-apply>Appliquer (relance)</button><button type="button" data-range-export>Exporter le diff JSON</button></div><pre data-range-diff></pre></section>
    <section data-range-panel="log" hidden><pre data-range-log></pre></section>`;
  document.body.append(panel);
  const $ = selector => panel.querySelector(selector);
  $('[data-range-weapon]').value = range.state.weaponId;
  // One bar when folded: the scene and the game's touch controls stay reachable (phone-size screens start folded).
  const setCollapsed = collapsed => {
    panel.classList.toggle('atf-dev-collapsed-v188', collapsed);
    const toggle = $('[data-range-collapse]'); toggle.textContent = collapsed ? '▴' : '▾'; toggle.setAttribute('aria-expanded', String(!collapsed));
  };
  setCollapsed(Boolean(globalThis.matchMedia?.('(max-width: 640px), (max-height: 520px) and (pointer: coarse)').matches));
  panel.addEventListener('click', event => {
    const button = event.target.closest('button'); if (!button) return;
    try {
      if (button.matches('[data-range-collapse]')) { setCollapsed(!panel.classList.contains('atf-dev-collapsed-v188')); return; }
      if (button.dataset.rangeTab) setCollapsed(false);
      if (button.dataset.rangeTab) for (const tab of panel.querySelectorAll('[data-range-tab]')) {
        const on = tab === button; tab.setAttribute('aria-selected', String(on)); panel.querySelector(`[data-range-panel="${tab.dataset.rangeTab}"]`).hidden = !on;
      }
      if (button.matches('[data-range-equip-weapon]')) range.setWeapon($('[data-range-weapon]').value);
      if (button.dataset.rangeFire) range.autoFire(Number(button.dataset.rangeFire));
      if (button.matches('[data-range-reload]')) range.reload();
      if (button.matches('[data-range-reset]')) range.resetMeasures();
      if (button.matches('[data-range-equip]')) range.setEquipment([$('[data-range-equipment]').value], { physicalMagazines: $('[data-range-physical]').checked });
      if (button.matches('[data-range-use]')) range.useEquipment($('[data-range-equipment]').value);
      if (button.dataset.rangeSquad) $('[data-range-squad-out]').textContent = JSON.stringify(range.squad(button.dataset.rangeSquad, button.dataset.value), null, 1);
      const target = () => ({ enemyId: $('[data-range-caste]').value, distance: Number($('[data-range-distance]').value) || 10, behaviour: $('[data-range-behaviour]').checked, motion: $('[data-range-motion]').value });
      if (button.matches('[data-range-spawn]')) range.spawn(target());
      if (button.matches('[data-range-dummy]')) range.spawn({ ...target(), dummy: true, behaviour: false });
      if (button.matches('[data-range-wave]')) CASTE_REPRESENTATIVES.slice(0, 12).forEach((enemy, index) => range.spawn({ enemyId: enemy.id, distance: 6 + index * 2, behaviour: false, motion: 'static' }));
      if (button.matches('[data-range-clear]')) range.clearTargets();
      if (button.matches('[data-range-apply]')) { readTuning(); range.restart(); }
      if (button.matches('[data-range-export]')) { readTuning(); exportJson(range.exportDiff()); }
    } catch (error) { $('[data-range-log]').textContent = `Erreur : ${error.message}`; }
  });
  function tuningForm() {
    const weapon = WEAPONS.find(entry => entry.id === range.state.weaponId), equipment = EQUIPMENT.find(entry => entry.id === $('[data-range-equipment]').value);
    const enemy = ENEMIES.find(entry => entry.id === $('[data-range-caste]').value);
    const block = (kind, item) => item ? `<fieldset data-range-tune="${kind}" data-id="${item.id}"><legend>${escapeHtml(kind)} · ${escapeHtml(item.name)}</legend>${Object.keys(TUNABLE_FIELDS_V188[kind]).map(field =>
      `<label>${field} <input type="number" step="any" data-field="${field}" value="${escapeHtml(range.state.overrides[kind][item.id]?.[field] ?? item[field] ?? '')}"></label>`).join(' ')}</fieldset>` : '';
    $('[data-range-tuning]').innerHTML = block('weapon', weapon) + block('equipment', equipment) + block('enemy', enemy);
  }
  function readTuning() {
    for (const set of panel.querySelectorAll('[data-range-tune]')) {
      const values = {}; for (const input of set.querySelectorAll('[data-field]')) if (input.value !== '') values[input.dataset.field] = Number(input.value);
      range.tune(set.dataset.rangeTune, set.dataset.id, values);
    }
  }
  function exportJson(diff) {
    const text = JSON.stringify(diff, null, 2); $('[data-range-diff]').textContent = text;
    const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    link.download = `tantalus-range-tuning-${Date.now()}.json`; link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }
  panel.querySelector('[data-range-tab="tuning"]').addEventListener('click', tuningForm);
  setInterval(() => {
    if (panel.querySelector('[data-range-panel="measures"]').hidden && panel.querySelector('[data-range-panel="targets"]').hidden
      && panel.querySelector('[data-range-panel="log"]').hidden) return;
    const m = range.measures();
    $('[data-range-targets]').innerHTML = `<tr><th>cible</th><th>PV</th><th>m</th><th>comp.</th></tr>${m.targets.map(target => `<tr><td>${escapeHtml(target.caste)}</td><td>${target.alive ? target.health : '†'}</td><td>${target.distance}</td><td>${target.behaviour ? 'actif' : target.motion}</td></tr>`).join('')}`;
    const rows = [['Arme', `${m.weapon.name} (${m.weapon.id})`], ['Catalogue', `dégâts ${m.weapon.damage} · cadence ${m.weapon.fireRate}/s · chargeur ${m.weapon.magazine} · rechargement ${m.weapon.reload} s`],
      ['Cadence observée', `${m.fireRate.rate ?? '—'} /s (${m.fireRate.shots} tirs)`], ['DPS (3 s)', `marine ${m.dps.dps ?? '—'} · escouade ${m.squadDps.dps ?? '—'} · théorique rafale ${m.theoretical.burst} / soutenu ${m.theoretical.sustained}`],
      ['Rechargement', `${m.reloads.count} · moyen ${m.reloads.mean ?? '—'} s · dernier ${m.reloads.last ?? '—'} s`],
      ['Chargeur', `${m.magazine.ammo}/${m.magazine.size} · réserve ${m.magazine.reserve}${m.magazine.feed ? ` · alimentation ${m.magazine.feed.feed} chambre ${m.magazine.feed.chamber} monté ${m.magazine.feed.mounted}` : ''}${m.magazine.reloading ? ' · en rechargement' : ''}`],
      ['Arsenal', m.arsenal ? `${m.arsenal.feed}${m.arsenal.nativeBridge ? ' (pont natif)' : ''} · capacité ${m.arsenal.capacity} · éjection ${m.arsenal.ejection} · traceur ${m.arsenal.tracer} · art ${m.arsenal.heldArt}${m.arsenal.live.needsCycle ? ' · POMPE' : ''}` : '—'],
      ['Dispersion', `σ ${m.spread.stdDeg ?? '—'}° · max ${m.spread.maxDeg ?? '—'}° · dérive ${m.spread.climbDeg ?? '—'}°/tir`],
      ['Projectiles', JSON.stringify(m.projectiles)], ['TTK observé', JSON.stringify(m.ttkObserved)], ['TTK théorique', Object.entries(m.ttkTheoretical).slice(0, 12).map(([caste, v]) => `${caste} ${v.seconds ?? '—'} s`).join(' · ')]];
    $('[data-range-measures]').innerHTML = rows.map(([k, v]) => `<tr><th>${escapeHtml(k)}</th><td>${escapeHtml(v)}</td></tr>`).join('');
    $('[data-range-rig]').textContent = JSON.stringify({ rig: m.rig, squad: m.squad, doctrine: m.doctrine && { selectedTeam: m.doctrine.selectedTeam, formation: m.doctrine.formation, doctrine: m.doctrine.doctrine, teams: m.doctrine.teams }, effects: m.effects }, null, 1);
    $('[data-range-log]').textContent = [...m.events.map(e => `${e.t} évènement ${e.type}`), ...m.cues.map(c => `${c.t} son ${c.cue} ${c.arg}`)].join('\n');
    const canvas = $('[data-range-spread]'), ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#2c3b3f'; ctx.beginPath(); ctx.moveTo(0, 60); ctx.lineTo(520, 60); ctx.stroke(); ctx.fillStyle = '#ffd25a';
    range.state.spread.slice(-60).forEach((sample, index) => { const deg = Math.atan2(Math.sin(sample.angle - sample.aim), Math.cos(sample.angle - sample.aim)) * 180 / Math.PI; ctx.fillRect(4 + index * 8.5, 60 - Math.max(-55, Math.min(55, deg * 6)), 4, 4); });
  }, 300);
}
