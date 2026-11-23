/** V188 secondary fire (spec 014, lot C — T106/T107/T210, owner decision of 2026-11-23).
 *
 * One dedicated, rebindable action « tir secondaire » (default key N, `secondaryFire`
 * in accessibility-v188.js; touch button shown only while the held weapon has a
 * secondary; gamepad left-stick press) fires the documented second mode of the
 * primary weapon. A secondary has its OWN feed and counter (second HUD counter),
 * or spends the primary feed when the documented mode is another way of firing
 * the same rounds (both barrels, single shot).
 *
 * Fidelity, never a 1:1 claim:
 *  - documented: that the mode exists and what the cited source says about it;
 *  - adapted [PROPOSÉ]: every number below (capacity when the source gives none,
 *    reserve, damage, radius, cadence, pump and reload times);
 *  - to define: what the source does not settle.
 * The M41A launcher runs on the reviewed V174 pure contract (tube, chamber, pump,
 * interruptible reload, save). The other modes use the small generic feed below.
 * `actor.shots` is NOT incremented by a secondary with its own feed: the primary
 * native feed (weapon-arsenal-runtime-v188.js) spends one unit per shot serial.
 */
import { WEAPONS } from './content-core-v50.js';
import { arsenalBaseIdV188, ARSENAL_STATUS_CARRIER_V188 } from './weapon-arsenal-v188.js';
import { resolveWeaponActionProfileV131 } from './weapon-actions-v131.js';
import { collectProjectileCollisionsV83 } from './projectile-collision-v83.js';
import { M41A_UNDERBARREL_HOST_V174, M41A_UNDERBARREL_SOURCE_V174, createM41AUnderbarrelV174, fireM41AUnderbarrelV174,
  pumpM41AUnderbarrelV174, beginM41AUnderbarrelReloadV174, advanceM41AUnderbarrelReloadV174, cancelM41AUnderbarrelReloadV174,
  captureM41AUnderbarrelV174, restoreM41AUnderbarrelV174 } from './weapon-underbarrel-v174.js';

export const SECONDARY_FIRE_SCHEMA_V188 = 188;
/** Default key of the `secondaryFire` action (the game listens for this code; the remap layer translates). */
export const SECONDARY_FIRE_CODE_V188 = 'KeyN';
/** Standard-mapping gamepad button: left-stick press. It is also the speed-reload modifier of the opt-in
 * physical magazines pilot; while that pilot is on the button keeps that role only. */
export const SECONDARY_FIRE_GAMEPAD_BUTTON_V188 = 10;
export const SECONDARY_FIRE_LABEL_V188 = Object.freeze({ fr: 'TIR SEC.', en: 'ALT FIRE' });
export const SECONDARY_FIRE_STATUS_V188 = Object.freeze({
  pump: Object.freeze({ fr: 'POMPE', en: 'PUMP' }), reload: Object.freeze({ fr: 'RECHARGE', en: 'RELOAD' }),
  empty: Object.freeze({ fr: 'VIDE', en: 'EMPTY' }), ready: Object.freeze({ fr: 'PRÊT', en: 'READY' })
});
const freeze = value => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) freeze(child);
  return Object.freeze(value);
};
const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const whole = value => Number.isSafeInteger(value) && value >= 0;
const list = value => Array.isArray(value) ? value : [];
const P = '[PROPOSÉ]';
const AVP2010 = 'https://www.avpgalaxy.net/games/aliens-vs-predator-2010/marine-weapons-equipment/';
const DARK_DESCENT = 'https://www.avpgalaxy.net/games/aliens-dark-descent/weapons/';
/** A burn status needs a V131 profile to tick: the M240 (the incinerator Ripley tapes to her rifle) carries
 * it. The flame jet of the combination and its burn are therefore booked under the M240 id. */
export const SECONDARY_STATUS_CARRIER_V188 = ARSENAL_STATUS_CARRIER_V188;

const grenade = extra => ({ kind: 'grenade', feed: 'tube', interval: 0.9, damage: 58, radius: 130, speed: 470, gravity: 260, life: 3.5,
  reloadPerRound: 0.7, supply: 1, cue: 'weapon-m41a-grenade', label: { fr: 'LG', en: 'GL' }, ...extra });

/** One row per secondary mode. `hosts`: exact catalogue ids; `hostBase`: a base id whose finish variants share it. */
export const WEAPON_SECONDARY_MODES_V188 = freeze([
  grenade({ id: 'm41a-u1-30mm-pump', hostBase: M41A_UNDERBARREL_HOST_V174, engine: 'v174', capacity: 4, startReserve: 4, maxReserve: 8, pump: 0.5,
    label: { fr: 'LG 30 MM', en: '30 MM GL' }, task: 'T106',
    sources: [M41A_UNDERBARREL_SOURCE_V174, DARK_DESCENT, 'https://www.avpcentral.com/aliens-fireteam-2-weapons'],
    documented: ['lance-grenades 30 mm à pompe superposé au fusil 10 mm (Royal Armouries, accessoire du film)',
      'U1 à pompe, magasin de quatre coups (liste AvPGalaxy d’Aliens: Dark Descent — valeur de jeu vidéo, source secondaire)'],
    proposed: ['capacité 4 retenue comme valeur de jeu', 'réserve 4 (8 au plus)', 'dégâts 58, rayon 130 px', 'pompe 0,5 s, cadence 0,9 s', 'rechargement 0,7 s par grenade'],
    toDefine: ['types de grenades M40', 'étui de 30 mm (aucun étui n’apparaît)', 'animation de pompe'] }),
  grenade({ id: 'm41a2-avp2010-grenade', hosts: ['weapon-227-m41a-2-pulse-rifle'], capacity: 4, startReserve: 2, maxReserve: 6,
    sources: [AVP2010], documented: ['lance-grenades en tir secondaire (liste AvPGalaxy d’Aliens vs Predator 2010)'],
    proposed: ['capacité 4, réserve 2 (6 au plus)', 'dégâts 58, rayon 130 px', 'cadence 0,9 s', 'rechargement 0,7 s par grenade'],
    toDefine: ['capacité et rechargement du jeu d’origine', 'pompe éventuelle'] }),
  grenade({ id: 'f90-sl40-grenade', hosts: ['weapon-212-covenant-thales-f90-sl40'], capacity: 1, startReserve: 4, maxReserve: 6, damage: 60, reloadPerRound: 1.4,
    label: { fr: 'SL40', en: 'SL40' }, sources: ['https://www.imfdb.org/wiki/Alien:_Covenant'],
    documented: ['Thales F90 équipé d’un lance-grenades Thales SL40 (IMFDB, extrait de recherche)'],
    proposed: ['un coup par chargement', 'réserve 4 (6 au plus)', 'dégâts 60, rayon 130 px', 'rechargement 1,4 s'],
    toDefine: ['calibre et capacité de l’arme réelle non consultés [À VÉRIFIER]'] }),
  grenade({ id: 'draco-grenade', hosts: ['weapon-202-draco-double-burner'], capacity: 3, startReserve: 3, maxReserve: 6, damage: 56,
    sources: ['https://www.imfdb.org/wiki/Alien:_Resurrection'],
    documented: ['le Draco Double Burner est vu en lance-flammes, en lance-grenades et en fusil (IMFDB, extrait de recherche)'],
    proposed: ['capacité 3, réserve 3 (6 au plus)', 'dégâts 56, rayon 130 px', 'cadence 0,9 s', 'rechargement 0,7 s par grenade'],
    toDefine: ['mode fusil non implémenté', 'alimentation du lance-grenades'] }),
  { id: 'ripley-m240-flame', hosts: ['weapon-266-ripley-m41a-m240-combination'], kind: 'stream', feed: 'tank', capacity: 40, startReserve: 40, maxReserve: 80,
    interval: 0.1, damage: 30, range: 190, spread: 0.12, status: 'burn', reloadSeconds: 2.4, supply: 20, cue: 'weapon-flamethrower',
    label: { fr: 'M240', en: 'M240' }, task: 'T107', sources: ['https://avpcentral.com/colonial-marine-weapons-uscm-arsenal', 'https://www.imfdb.org/wiki/Aliens'],
    documented: ['M41A attaché à un lance-flammes M240 (page AVP Central ; IMFDB cité par le suivi, non relu)'],
    proposed: ['réservoir 40, réserve 40 (80 au plus)', 'dégâts 30 par jet, portée 190 px', 'remplacement du réservoir 2,4 s'],
    toDefine: ['lance-grenades du M41A non jouable sur la combinaison', 'contenance réelle'] },
  { id: 'zx76-both-barrels', hosts: ['weapon-226-zx-76-shotgun'], kind: 'primary-volley', rounds: 2, recovery: 1.1, cue: null,
    label: { fr: '2 CANONS', en: '2 BARRELS' }, sources: [AVP2010],
    documented: ['tir secondaire des deux canons (liste AvPGalaxy d’Aliens vs Predator 2010)'],
    proposed: ['deux cartouches du chargeur principal en une pression', 'récupération 1,1 s'], toDefine: ['recul et dispersion du jeu d’origine'] },
  { id: 'vp78-single-shot', hosts: ['weapon-225-vp78-pistol'], kind: 'primary-volley', rounds: 1, recovery: 0.22, cue: null,
    label: { fr: 'COUP/COUP', en: 'SINGLE' }, sources: [AVP2010],
    documented: ['coup par coup ou rafale de trois (liste AvPGalaxy d’Aliens vs Predator 2010)'],
    proposed: ['un coup du chargeur principal par pression', 'récupération 0,22 s'], toDefine: ['sélecteur de tir du jeu d’origine'] }
]);
const modesById = new Map(WEAPON_SECONDARY_MODES_V188.map(mode => [mode.id, mode]));
const modeByWeapon = new Map();
for (const weapon of WEAPONS) {
  const base = arsenalBaseIdV188(weapon);
  const mode = WEAPON_SECONDARY_MODES_V188.find(entry => entry.hosts?.includes(weapon.id) || entry.hostBase && entry.hostBase === base);
  if (mode) modeByWeapon.set(weapon.id, mode);
}
export const SECONDARY_FIRE_WEAPON_IDS_V188 = Object.freeze([...modeByWeapon.keys()]);
/** Exact catalogue id (or descriptor) → its secondary mode, or null. */
export function resolveSecondaryModeV188(weaponOrId) {
  const id = typeof weaponOrId === 'string' ? weaponOrId : weaponOrId && typeof weaponOrId === 'object' ? weaponOrId.id || weaponOrId.weaponId : null;
  return typeof id === 'string' ? modeByWeapon.get(id) || null : null;
}
export const getSecondaryModeV188 = id => modesById.get(id) || null;

// —— Feed (own counter). V174 contract for the M41A, generic tube/tank otherwise ——
function createFeed(mode, role, weaponId, loaded = mode.capacity, reserve = mode.startReserve) {
  if (mode.kind === 'primary-volley') return null;
  if (!whole(loaded) || !whole(reserve) || loaded > mode.capacity || reserve > mode.maxReserve) return null;
  if (mode.engine === 'v174') {
    const state = createM41AUnderbarrelV174({ ownerId: role, weaponInstanceId: role + ':' + weaponId, capacity: mode.capacity,
      chamber: loaded > 0 ? 1 : 0, tube: Math.max(0, loaded - 1), reserve, mode: 'launcher' });
    return state ? { engine: 'v174', v174: state, serial: 0 } : null;
  }
  return { engine: 'generic', loaded, reserve, capacity: mode.capacity, needsPump: false, pending: null, serial: 0 };
}
const loadedOf = feed => feed.v174 ? feed.v174.tube + feed.v174.chamber : feed.loaded;
const reserveOf = feed => feed.v174 ? feed.v174.reserve : feed.reserve;
const pendingOf = feed => feed.v174 ? feed.v174.pending : feed.pending;
/** A stroke is owed: a spent round, or a V174 cold chamber after a reload from empty. */
const pumpOwed = feed => feed.v174 ? feed.v174.needsPump || feed.v174.chamber === 0 && feed.v174.tube > 0 : feed.needsPump;
const receipt = feed => 's' + (++feed.serial);
function fireFeed(feed, mode) {
  if (pendingOf(feed) || pumpOwed(feed) || loadedOf(feed) < 1) return false;
  if (feed.v174) return Boolean(fireM41AUnderbarrelV174(feed.v174, receipt(feed)));
  feed.loaded -= 1; if (mode.pump) feed.needsPump = true;
  return true;
}
function pumpFeed(feed) {
  if (pendingOf(feed) || !pumpOwed(feed)) return false;
  if (feed.v174) return Boolean(pumpM41AUnderbarrelV174(feed.v174, receipt(feed)));
  feed.needsPump = false; return true;
}
function beginReloadFeed(feed) {
  if (pendingOf(feed) || reserveOf(feed) < 1) return false;
  if (feed.v174) {
    if (feed.v174.needsPump && !pumpM41AUnderbarrelV174(feed.v174, receipt(feed))) return false;
    feed.reloadReceipt = receipt(feed);
    return beginM41AUnderbarrelReloadV174(feed.v174, feed.reloadReceipt);
  }
  if (feed.loaded >= feed.capacity) return false;
  feed.needsPump = false;
  feed.pending = { planned: Math.min(feed.reserve, feed.capacity - feed.loaded), inserted: 0, progress: 0 };
  return true;
}
/** Rounds enter one by one for a tube (already inserted rounds survive an interruption); a tank is replaced at the end. */
function advanceReloadFeed(feed, mode, progress) {
  const value = Math.max(0, Math.min(1, progress));
  if (feed.v174) return feed.v174.pending ? advanceM41AUnderbarrelReloadV174(feed.v174, feed.reloadReceipt, Math.max(feed.v174.pending.progress, value)) : false;
  const tx = feed.pending; if (!tx) return false;
  tx.progress = Math.max(tx.progress, value);
  const desired = mode.feed === 'tank' ? (tx.progress >= 1 ? tx.planned : 0) : Math.min(tx.planned, Math.floor(tx.progress * tx.planned + 1e-9));
  const delta = desired - tx.inserted;
  if (delta > 0) { feed.loaded += delta; feed.reserve -= delta; tx.inserted += delta; }
  if (tx.progress >= 1) feed.pending = null;
  return true;
}
function cancelReloadFeed(feed) {
  if (!pendingOf(feed)) return false;
  if (feed.v174) return cancelM41AUnderbarrelReloadV174(feed.v174, feed.reloadReceipt);
  feed.pending = null; return true;
}
function addReserveFeed(feed, mode, amount) {
  const add = Math.max(0, Math.min(amount, mode.maxReserve - reserveOf(feed)));
  if (!add || pendingOf(feed)) return 0;
  if (feed.v174) feed.v174.reserve += add; else feed.reserve += add;
  return add;
}
function captureFeed(feed) {
  if (feed.v174) { const state = captureM41AUnderbarrelV174(feed.v174); return state ? { engine: 'v174', v174: state, serial: feed.serial } : null; }
  return { engine: 'generic', loaded: feed.loaded, reserve: feed.reserve, capacity: feed.capacity, needsPump: feed.needsPump, serial: feed.serial };
}
/** Refuses anything outside the mode's own bounds: a tampered counter never restores. */
function restoreFeed(raw, mode, role, weaponId) {
  if (!raw || typeof raw !== 'object' || mode.kind === 'primary-volley') return null;
  if (mode.engine === 'v174') {
    if (raw.engine !== 'v174') return null;
    const state = restoreM41AUnderbarrelV174(raw.v174, { ownerId: role, instanceId: role + ':' + weaponId });
    if (!state || state.capacity !== mode.capacity || state.reserve > mode.maxReserve || state.mode !== 'launcher') return null;
    // An interrupted reload is not resumed: the grenades already inserted are in the tube.
    if (state.pending) cancelM41AUnderbarrelReloadV174(state, state.pending.id.split(':reload:')[1]);
    return { engine: 'v174', v174: state, serial: whole(raw.serial) ? raw.serial + 1000 : 1000 };
  }
  if (raw.engine !== 'generic' || !whole(raw.loaded) || !whole(raw.reserve) || raw.capacity !== mode.capacity
    || raw.loaded > mode.capacity || raw.reserve > mode.maxReserve || typeof raw.needsPump !== 'boolean') return null;
  return { engine: 'generic', loaded: raw.loaded, reserve: raw.reserve, capacity: mode.capacity, needsPump: Boolean(mode.pump) && raw.needsPump,
    pending: null, serial: whole(raw.serial) ? raw.serial : 0 };
}

const world = engine => ({ walls: [...list(engine.walls), ...list(engine.covers)],
  doors: engine.closedDoorColliders?.() || engine.doors || [], platforms: [...new Set([...list(engine.platforms), ...list(engine.lifts)])],
  bounds: engine.missionLevelBounds || { width: 6200, height: 1080 } });
const activeEnemy = actor => actor?.alive && !actor.dormant && !actor.ventTransit
  && (!actor.rearEntryV130 || actor.rearEntryV130.phase === 'active') && (actor.planeV130 || actor.plane || 'gameplay') === 'gameplay';
const STEP = 1 / 120, MAX_PROJECTILES = 24;

export function withSecondaryFireV188(Base) {
  if (Base.secondaryFireRuntimeV188) return Base;
  return class SecondaryFireRuntimeV188 extends Base {
    static secondaryFireRuntimeV188 = true;

    start(options = {}) {
      this.secondaryFireEnabledV188 = options.secondaryFireV188 !== false;
      this.secondaryProjectilesV188 = []; this.secondarySerialV188 = 0;
      this.secondaryStatsV188 = { requests: 0, shots: 0, grenades: 0, streams: 0, volleys: 0, pumps: 0, reloads: 0, interrupted: 0, explosions: 0, resupplied: 0 };
      this.secondaryHeldPrevV188 = false; this.secondaryAvailabilityV188 = null;
      if (this.player) delete this.player.secondaryFireV188;
      const result = super.start(options);
      this.syncSecondaryFireV188(this.player);
      return result;
    }

    /** The secondary mode of the primary weapon the player holds, or null (the player only: see the completion doc). */
    secondaryModeForV188(actor = this.player) {
      if (!this.secondaryFireEnabledV188 || !actor || actor !== this.player || actor.inVehicle || actor.weaponMode !== 'rifle'
        || this.neuro?.active) return null;
      return resolveSecondaryModeV188(this.reloadWeaponV77?.(actor));
    }

    /** Keep the record on the weapon held; a different primary drops it. Never creates rounds on a kept record. */
    syncSecondaryFireV188(actor = this.player) {
      if (!actor || actor !== this.player) return null;
      const mode = this.secondaryModeForV188(actor), weaponId = mode ? this.reloadWeaponV77(actor)?.id || this.reloadWeaponV77(actor) : null;
      const record = actor.secondaryFireV188;
      if (!mode) {
        if (record && actor.weaponMode === 'rifle' && !actor.inVehicle && !this.neuro?.active) delete actor.secondaryFireV188;
        return null;
      }
      if (record && record.weaponId === weaponId && record.modeId === mode.id) return record;
      actor.secondaryFireV188 = { schema: 188, weaponId, modeId: mode.id, feed: createFeed(mode, 'player', weaponId),
        cooldown: 0, pumpDue: null, reload: null };
      return actor.secondaryFireV188;
    }

    secondaryAllowedV188(actor) {
      return Boolean(this.running && !this.paused && this.mission?.state === 'active' && !this.enemyAtlasLoadingPausedV65 && !this.userCasteLoadingV88
        && actor?.alive && !actor.downed && !actor.climbing && !actor.reloading && !(actor.meleeClock > 0) && !(actor.toolUseClock > 0)
        && !(actor.interactionClock > 0) && !(actor.grappledClock > 0) && !(actor.stunClock > 0)
        && (typeof this.canPerformGameplayAction !== 'function' || this.canPerformGameplayAction(actor))
        && !this.isVehicleAccessLockedV59?.(actor) && !actor.vehicleAccessPhase
        // The hive command missions use the same default key to cycle a recruit while the operator can act.
        && !(this.hiveV131 && this.hiveCanActV131?.()));
    }

    /** The dedicated action. `edge`: a fresh press (a held key only repeats a stream). Returns true when something happened. */
    requestSecondaryFireV188(actor = this.player, { edge = true } = {}) {
      const mode = this.secondaryModeForV188(actor), record = mode && this.syncSecondaryFireV188(actor);
      if (!record || !this.secondaryAllowedV188(actor)) return false;
      this.secondaryStatsV188.requests++;
      if (mode.kind === 'primary-volley') return edge ? this.fireSecondaryVolleyV188(actor, mode, record) : false;
      const feed = record.feed;
      if (!feed || record.cooldown > 1e-9) return false;
      if (pendingOf(feed)) return false;
      if (loadedOf(feed) < 1) return edge ? this.beginSecondaryReloadV188(actor, mode, record) : false;
      if (pumpOwed(feed)) return false;
      if (mode.kind === 'grenade') return edge ? this.fireSecondaryGrenadeV188(actor, mode, record) : false;
      return this.fireSecondaryStreamV188(actor, mode, record);
    }

    secondaryAimV188(actor) {
      const aim = this.resolvePlayerCombatAimV83(actor), muzzle = this.resolvePlayerMuzzleV124(actor, aim);
      return muzzle && Number.isFinite(muzzle.x) && Number.isFinite(muzzle.y) ? { aim, muzzle } : null;
    }

    fireSecondaryGrenadeV188(actor, mode, record) {
      if (this.secondaryProjectilesV188.length >= MAX_PROJECTILES) return false;
      const origin = this.secondaryAimV188(actor);
      if (!origin || this.playerWeaponFireBlockedV160?.(actor, origin.aim) || !fireFeed(record.feed, mode)) return false;
      const { aim, muzzle } = origin, angle = Math.atan2(aim.y, aim.x);
      record.cooldown = mode.interval;
      if (pumpOwed(record.feed)) record.pumpDue = finite(this.animationTime) + finite(mode.pump, 0.5);
      actor.actionClock = Math.max(finite(actor.actionClock), 0.22);
      const projectile = { schema: 188, id: 'secondary-v188:' + (++this.secondarySerialV188), weaponId: record.weaponId, modeId: mode.id, kind: 'launcher',
        family: 'explosive', owner: actor, x: muzzle.x - 5, y: muzzle.y - 5, w: 10, h: 10, vx: Math.cos(angle) * mode.speed, vy: Math.sin(angle) * mode.speed,
        age: 0, remaining: mode.life, damage: mode.damage, radius: mode.radius, gravity: mode.gravity, resolved: false };
      this.secondaryProjectilesV188.push(projectile);
      this.secondaryStatsV188.shots++; this.secondaryStatsV188.grenades++;
      this.vfxMuzzleV188?.({ sourceX: muzzle.x, sourceY: muzzle.y, x: muzzle.x, y: muzzle.y, vx: aim.x, vy: aim.y, family: 'explosive' });
      this.emitEnemyNoiseV130?.(actor, 780, 'launcher');
      if (mode.cue) this.audio?.cue?.(mode.cue);
      this.onEvent?.({ type: 'secondary-fire-v188', mode: mode.id, kind: mode.kind, weaponId: record.weaponId, projectileId: projectile.id });
      return true;
    }

    fireSecondaryStreamV188(actor, mode, record) {
      if (typeof this.projectBeamV131 !== 'function') return false;
      const origin = this.secondaryAimV188(actor);
      if (!origin || this.playerWeaponFireBlockedV160?.(actor, origin.aim) || !fireFeed(record.feed, mode)) return false;
      record.cooldown = mode.interval;
      actor.actionClock = Math.max(finite(actor.actionClock), 0.22);
      this.projectBeamV131(actor, { kind: 'stream', family: 'flame', range: mode.range, spread: mode.spread, status: mode.status,
        weaponId: SECONDARY_STATUS_CARRIER_V188 }, origin.muzzle, origin.aim, mode.damage);
      this.secondaryStatsV188.shots++; this.secondaryStatsV188.streams++;
      this.emitEnemyNoiseV130?.(actor, 400, 'stream');
      if (mode.cue && this.secondaryStatsV188.streams % 4 === 1) this.audio?.cue?.(mode.cue);
      this.onEvent?.({ type: 'secondary-fire-v188', mode: mode.id, kind: mode.kind, weaponId: record.weaponId });
      return true;
    }

    /** Another way of firing the primary rounds: the V131 profile of the weapon commits `rounds` rounds at once. */
    fireSecondaryVolleyV188(actor, mode, record) {
      const profile = resolveWeaponActionProfileV131(record.weaponId);
      if (!profile || typeof this.commitWeaponRoundV131 !== 'function' || actor.fireClock > 0 || this.weaponCyclesV131?.has(actor)
        || finite(actor.ammo) < mode.rounds || actor.arsenalFeedV188?.feed.needsCycle) return false;
      const aim = this.resolvePlayerCombatAimV83(actor);
      let fired = 0;
      for (let index = 0; index < mode.rounds; index++) if (this.commitWeaponRoundV131(actor, profile, aim)) fired++; else break;
      if (!fired) return false;
      actor.fireClock = Math.max(finite(actor.fireClock), mode.recovery);
      this.secondaryStatsV188.shots += fired; this.secondaryStatsV188.volleys++;
      this.onEvent?.({ type: 'secondary-fire-v188', mode: mode.id, kind: mode.kind, weaponId: record.weaponId, rounds: fired });
      return true;
    }

    beginSecondaryReloadV188(actor, mode, record) {
      if (!record.feed || record.reload || !beginReloadFeed(record.feed)) return false;
      const planned = pendingOf(record.feed)?.planned || 1;
      record.reload = { elapsed: 0, duration: mode.feed === 'tank' ? mode.reloadSeconds : planned * mode.reloadPerRound };
      record.pumpDue = null;
      this.audio?.cue?.('weapon-reload');
      this.onEvent?.({ type: 'secondary-reload-v188', mode: mode.id, weaponId: record.weaponId, planned });
      return true;
    }

    /** The secondary reload is interruptible: firing or reloading the primary cancels it, inserted rounds stay. */
    cancelSecondaryReloadV188(actor = this.player) {
      const record = actor?.secondaryFireV188;
      if (!record?.reload) return false;
      cancelReloadFeed(record.feed); record.reload = null;
      this.secondaryStatsV188.interrupted++;
      this.onEvent?.({ type: 'secondary-reload-interrupted-v188', mode: record.modeId, weaponId: record.weaponId });
      return true;
    }

    fire(actor = this.player) {
      if (actor === this.player && actor.secondaryFireV188?.reload) this.cancelSecondaryReloadV188(actor);
      return super.fire(actor);
    }

    reload(actor = this.player) {
      const result = super.reload(actor);
      if (result && actor === this.player && actor.secondaryFireV188?.reload) this.cancelSecondaryReloadV188(actor);
      return result;
    }

    collectSupply(actor, supply) {
      const result = super.collectSupply(actor, supply);
      const record = actor === this.player ? actor.secondaryFireV188 : null, mode = record && getSecondaryModeV188(record.modeId);
      // An ammunition crate also tops up the secondary reserve, within the mode's own ceiling.
      if (result && supply?.type === 'ammo' && record?.feed && mode) this.secondaryStatsV188.resupplied += addReserveFeed(record.feed, mode, mode.supply);
      return result;
    }

    advanceSecondaryFireV188(delta) {
      const actor = this.player, record = this.syncSecondaryFireV188(actor);
      const available = Boolean(record);
      if (available !== this.secondaryAvailabilityV188) {
        this.secondaryAvailabilityV188 = available;
        this.secondaryInputV188?.onAvailability?.(available, record ? getSecondaryModeV188(record.modeId) : null);
      }
      const held = Boolean(this.keys?.has(SECONDARY_FIRE_CODE_V188));
      const edge = held && !this.secondaryHeldPrevV188;
      this.secondaryHeldPrevV188 = held;
      if (!record) return;
      const mode = getSecondaryModeV188(record.modeId);
      record.cooldown = Math.max(0, finite(record.cooldown) - Math.max(0, finite(delta)));
      if (record.reload && record.feed) {
        if (!this.secondaryAllowedV188(actor)) this.cancelSecondaryReloadV188(actor);
        else {
          record.reload.elapsed += Math.max(0, finite(delta));
          advanceReloadFeed(record.feed, mode, record.reload.elapsed / record.reload.duration);
          if (!pendingOf(record.feed)) {
            record.reload = null; this.secondaryStatsV188.reloads++;
            if (pumpOwed(record.feed)) record.pumpDue = finite(this.animationTime) + finite(mode.pump, 0.5);
            this.onEvent?.({ type: 'secondary-reload-complete-v188', mode: mode.id, weaponId: record.weaponId });
          }
        }
      }
      if (record.feed && pumpOwed(record.feed) && !record.reload) {
        if (record.pumpDue === null) record.pumpDue = finite(this.animationTime) + finite(mode.pump, 0.5);
        if (finite(this.animationTime) + 1e-9 >= record.pumpDue && this.secondaryAllowedV188(actor) && pumpFeed(record.feed)) {
          record.pumpDue = null; this.secondaryStatsV188.pumps++;
          this.audio?.cue?.('weapon-dry-fire');
          this.onEvent?.({ type: 'secondary-pump-v188', mode: mode.id, weaponId: record.weaponId });
        }
      }
      if (held) this.requestSecondaryFireV188(actor, { edge });
    }

    update(delta) {
      const live = this.running && !this.paused && !this.enemyAtlasLoadingPausedV65 && this.mission?.state === 'active';
      if (live) this.advanceSecondaryFireV188(delta);
      else this.secondaryHeldPrevV188 = Boolean(this.keys?.has(SECONDARY_FIRE_CODE_V188));
      return super.update(delta);
    }

    updateBullets(delta) {
      const result = super.updateBullets(delta);
      const live = this.running && !this.paused && !this.enemyAtlasLoadingPausedV65 && !this.userCasteLoadingV88 && this.mission?.state === 'active';
      if (live && this.secondaryProjectilesV188?.length) {
        const advance = () => this.advanceSecondaryProjectilesV188(delta);
        if (this.withEnemySpriteCollisionGeometry) this.withEnemySpriteCollisionGeometry(advance); else advance();
      }
      return result;
    }

    advanceSecondaryProjectilesV188(delta) {
      for (const projectile of this.secondaryProjectilesV188) {
        let remaining = Math.max(0, finite(delta));
        while (remaining > 1e-9 && !projectile.resolved) {
          const step = Math.min(STEP, remaining, projectile.remaining);
          if (!(step > 1e-9)) { this.explodeSecondaryGrenadeV188(projectile); break; }
          const displacement = { x: projectile.vx * step, y: projectile.vy * step + projectile.gravity * step * step / 2 };
          const contact = collectProjectileCollisionsV83(projectile, displacement, { ...world(this), enemies: list(this.enemies).filter(activeEnemy) })[0];
          if (contact) { projectile.x = contact.x; projectile.y = contact.y; this.explodeSecondaryGrenadeV188(projectile, contact.kind); break; }
          projectile.x += displacement.x; projectile.y += displacement.y; projectile.vy += projectile.gravity * step;
          projectile.age += step; projectile.remaining -= step; remaining -= step;
          if (projectile.remaining <= 1e-9) this.explodeSecondaryGrenadeV188(projectile);
        }
      }
      this.secondaryProjectilesV188 = this.secondaryProjectilesV188.filter(projectile => !projectile.resolved);
    }

    explodeSecondaryGrenadeV188(projectile, surface = 'fuse') {
      if (projectile.resolved) return false;
      this.secondaryStatsV188.explosions++;
      // The shared V130 blast (enemies, operators, vehicle, scenery, noise) with this mode's radius and damage.
      if (typeof this.explodeGrenadeV130 === 'function') this.explodeGrenadeV130(projectile, { weaponId: projectile.weaponId, radius: projectile.radius });
      projectile.resolved = true;
      this.onEvent?.({ type: 'secondary-impact-v188', mode: projectile.modeId, weaponId: projectile.weaponId, surface });
      return true;
    }

    drawWorld(ctx) {
      const result = super.drawWorld(ctx);
      if (ctx && this.secondaryProjectilesV188?.length) {
        ctx.save(); ctx.fillStyle = '#e6b46a';
        for (const projectile of this.secondaryProjectilesV188) ctx.fillRect(projectile.x, projectile.y, projectile.w, projectile.h);
        ctx.restore();
      }
      return result;
    }

    /** Second HUD counter: its own text line under the status block (text and state word, not colour alone). */
    secondaryHudTextV188(actor = this.player) {
      const record = actor?.secondaryFireV188, mode = record && this.secondaryModeForV188(actor);
      if (!record || !mode || mode.id !== record.modeId) return null;
      const en = this.secondaryInputV188?.language?.() === 'en', key = this.secondaryInputV188?.keyLabel?.() || 'N', pick = entry => en ? entry.en : entry.fr;
      const head = `${pick(SECONDARY_FIRE_LABEL_V188)} [${key}] ${pick(mode.label)}`;
      if (!record.feed) return `${head} · ${finite(actor.ammo)}/${mode.rounds}`;
      const state = record.reload ? SECONDARY_FIRE_STATUS_V188.reload : pumpOwed(record.feed) ? SECONDARY_FIRE_STATUS_V188.pump
        : loadedOf(record.feed) < 1 ? SECONDARY_FIRE_STATUS_V188.empty : SECONDARY_FIRE_STATUS_V188.ready;
      return `${head} ${loadedOf(record.feed)}/${reserveOf(record.feed)} · ${pick(state)}`;
    }

    drawHud(ctx) {
      const result = super.drawHud(ctx);
      const text = this.secondaryHudTextV188(this.player);
      if (!ctx || !text || this.player?.alive === false || typeof ctx.fillText !== 'function') return result;
      ctx.save();
      ctx.font = '12px monospace'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      const width = Math.min(440, (ctx.measureText?.(text)?.width || text.length * 7.3) + 32);
      ctx.fillStyle = 'rgba(3, 10, 8, .82)'; ctx.fillRect(18, 112, width, 24);
      ctx.strokeStyle = '#8c7a45'; ctx.lineWidth = 1; ctx.strokeRect(18.5, 112.5, width, 24);
      ctx.fillStyle = '#f2e3a6'; ctx.fillText(text, 34, 129);
      ctx.restore();
      return result;
    }

    // —— persistence (additive: `player.secondaryFireV188` in the mission resume) ——
    captureResumeState() {
      const state = super.captureResumeState();
      const record = this.player?.secondaryFireV188, feed = record?.feed && captureFeed(record.feed);
      if (state?.player && record && feed) state.player.secondaryFireV188 = { schema: 188, weaponId: record.weaponId, modeId: record.modeId, feed };
      return state;
    }

    applyResumeState(rawState) {
      const result = super.applyResumeState(rawState);
      if (!result?.applied) return result;
      const actor = this.player;
      let secondaryFireRestoredV188 = false;
      if (actor) {
        delete actor.secondaryFireV188;
        const record = this.syncSecondaryFireV188(actor), mode = record && getSecondaryModeV188(record.modeId), raw = rawState?.player?.secondaryFireV188;
        if (record?.feed && raw?.schema === 188 && raw.weaponId === record.weaponId && raw.modeId === record.modeId) {
          const feed = restoreFeed(raw.feed, mode, 'player', record.weaponId);
          if (feed) { record.feed = feed; record.pumpDue = pumpOwed(feed) ? finite(this.animationTime) : null; secondaryFireRestoredV188 = true; }
        }
      }
      return { ...result, secondaryFireRestoredV188 };
    }

    /** Read-only state for the HUD, QA and the dev shooting range. */
    getSecondaryFireStateV188() {
      const actor = this.player, record = actor?.secondaryFireV188, mode = record ? getSecondaryModeV188(record.modeId) : null;
      return { available: Boolean(record && this.secondaryModeForV188(actor)), mode, weaponId: record?.weaponId || null, kind: mode?.kind || null,
        ownFeed: Boolean(record?.feed), loaded: record?.feed ? loadedOf(record.feed) : null, reserve: record?.feed ? reserveOf(record.feed) : null,
        capacity: mode?.capacity ?? null, needsPump: Boolean(record?.feed && pumpOwed(record.feed)), reloading: Boolean(record?.reload),
        cooldown: finite(record?.cooldown), projectiles: this.secondaryProjectilesV188?.length || 0, hud: this.secondaryHudTextV188(actor),
        stats: { ...(this.secondaryStatsV188 || {}) } };
    }
  };
}
