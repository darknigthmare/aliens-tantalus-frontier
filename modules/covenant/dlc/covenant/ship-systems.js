/* Covenant v0.5 — authored ship circuits and live surveillance.
 * No DOM, no host save, no enemy spawning from a camera, no global tracking.
 * The camera is a bounded observation of the same physical state.
 */
(function (root) {
'use strict';
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(v) ? v : lo));
const distance = (a, b) => Math.hypot(a.x - b.x, (a.z - b.z) * 510);
const DEFAULT_POWER = Object.freeze({lights: true, cameras: true, speakers: false});
const fieldNames = ['lights', 'cameras', 'speakers'];
const uniqueKnown = (list, defs) => [...new Set(Array.isArray(list) ? list.filter(id => defs.some(d => d.id === id)) : [])];
const cost = (engine, power) => fieldNames.reduce((n, key) => n + (power[key] ? engine.systemDefs.costs[key] : 0), 0);
const definition = (engine, type, id) => engine.systemDefs[type].find(d => d.id === id);
function fresh(engine) {
 return {version: 1,
  circuits: Object.fromEntries(engine.systemDefs.circuits.map(d => [d.id, {...DEFAULT_POWER}])),
  cooldowns: {}, signals: [], viewed: [], terminals: [], log: []};
}
function sanitize(engine, input, base) {
 const out = fresh(engine), s = input && typeof input === 'object' ? input : {};
 for (const d of engine.systemDefs.circuits) {
  const v = s.circuits?.[d.id];
  if (v && fieldNames.every(k => typeof v[k] === 'boolean')) {
   const power = Object.fromEntries(fieldNames.map(k => [k, v[k]]));
   // An over-budget imported circuit resets to the documented safe default.
   if (cost(engine, power) <= engine.systemDefs.capacity) out.circuits[d.id] = power;
  }
 }
 for (const d of engine.systemDefs.speakers) {
  out.cooldowns[d.id] = clamp(+s.cooldowns?.[d.id], 0, d.cooldown);
  const v = Array.isArray(s.signals) && s.signals.find(v => v && v.id === d.id);
  if (v && out.circuits[d.circuit].speakers && (!d.requiresAction || base.actions.includes(d.requiresAction))) {
   const remaining = clamp(+v.remaining, 0, d.duration);
   if (remaining > 0) {
    out.signals.push({id: d.id, remaining, nextPulse: clamp(+v.nextPulse, .01, 2)});
    // A forged missing cooldown cannot replay a saved ongoing signal for free.
    out.cooldowns[d.id] = Math.max(out.cooldowns[d.id], remaining + d.cooldown - d.duration);
   }
  }
 }
 out.viewed = uniqueKnown(s.viewed, engine.systemDefs.cameras);
 out.terminals = uniqueKnown(s.terminals, engine.systemDefs.terminals);
 for (const v of (Array.isArray(s.log) ? s.log.slice(-40) : [])) {
  if (!v || !['access', 'power', 'speaker'].includes(v.kind)) continue;
  const type = v.kind === 'access' ? 'terminals' : v.kind === 'power' ? 'circuits' : 'speakers';
  if (!definition(engine, type, v.ref)) continue;
  if (v.kind === 'power' && (!fieldNames.includes(v.setting) || typeof v.enabled !== 'boolean')) continue;
  out.log.push({at: clamp(+v.at, 0, base.time), kind: v.kind, ref: v.ref,
   ...(v.kind === 'power' ? {setting: v.setting, enabled: v.enabled} : {})});
 }
 return out;
}
function sanitizeSoundRoutes(engine, base) {
 for (const e of Object.values(base.enemies)) {
  if (e.pursuit?.reason !== 'sound') continue;
  const q = e.pursuit, speaker = definition(engine, 'speakers', q.speaker);
  const exit = engine.rooms.get(e.room)?.exits.find(x => x.id === q.exitId);
  const door = exit?.doorId && base.doors[exit.doorId];
  if (!speaker || speaker.room !== q.to || (speaker.requiresAction && !base.actions.includes(speaker.requiresAction)) ||
      (door && (!door.open || door.amount < .94))) {
   e.pursuit = null; e.phase = 'search'; e.search = 3.3;
  }
 }
}
function ensureIntruder(engine) {
 // The return-to-ship report, not opening a feed, initializes this single specimen.
 if (!engine.done('infirmary-a1') || engine.state.enemies['xeno-cargo']) return;
 const d = engine.enemyDefs.get('xeno-cargo');
 if (d) engine.state.enemies[d.id] = engine.enemy(d);
}
function log(engine, kind, ref, extra = {}) {
 const n = engine.state.network;
 n.log.push({at: Math.floor(engine.state.time), kind, ref, ...extra});
 if (n.log.length > 40) n.log.splice(0, n.log.length - 40);
}
function pulse(engine, speaker) {
 if (engine.room.id === speaker.room) {
  engine.noise(speaker.x, speaker.z, 1450, 'speaker');
  engine.emit('speakerPulse', 'L’appel technique résonne dans la pièce.', {speaker: speaker.id, x: speaker.x, z: speaker.z});
 }
 for (const group of engine.data.huntGroups || []) {
  const e = engine.state.enemies[group.enemy];
  if (!e || !e.alive || e.phase === 'captured' || !group.rooms.includes(speaker.room) || !group.rooms.includes(e.room)) continue;
  if (e.room === engine.room.id && engine.sees(e)) continue;
  if (['windup', 'lunge'].includes(e.phase) || (e.pursuit && e.pursuit.reason !== 'sound')) continue;
  const source = engine.rooms.get(e.room);
  if (e.room === speaker.room) {
   if (distance(e, speaker) > 1450) continue;
   e.pursuit = null; e.lastSeen = {x: speaker.x, z: speaker.z}; e.phase = 'investigate';
   e.notice = 0; e.search = 0; e.nav = []; e.navClock = 0;
  } else {
   // One physical, open threshold only. No multi-hop radio telepathy.
   const exit = source.exits.find(x => x.to === speaker.room && !x.travel);
   const reverse = exit && engine.rooms.get(speaker.room).exits.find(x => x.to === e.room);
   if (!exit || !reverse || !engine.exitPermitted(exit)) continue;
   const door = exit.doorId && engine.state.doors[exit.doorId];
   if (door && (!door.open || door.amount < .94)) continue;
   if (distance(e, exit) + distance(reverse, speaker) > 3000) continue;
   e.pursuit = {from: e.room, to: speaker.room, exitId: exit.id, reverseId: reverse.id,
    reason: 'sound', speaker: speaker.id};
   e.lastSeen = {x: exit.x, z: exit.z}; e.phase = 'investigate'; e.attack = null; e.nav = []; e.navClock = 0;
  }
 }
}
function tick(engine, dt) {
 const n = engine.state.network;
 if (!n) return;
 for (const d of engine.systemDefs.speakers) n.cooldowns[d.id] = Math.max(0, (n.cooldowns[d.id] || 0) - dt);
 for (const s of n.signals) {
  s.remaining = Math.max(0, s.remaining - dt); s.nextPulse -= dt;
  const d = definition(engine, 'speakers', s.id);
  if (!d || !n.circuits[d.circuit].speakers) {s.remaining = 0; continue;}
  if (s.remaining > 0 && s.nextPulse <= 0) {pulse(engine, d); s.nextPulse = 2;}
 }
 n.signals = n.signals.filter(s => s.remaining > 0);
}
function updateRemote(engine, dt) {
 for (const group of engine.data.huntGroups || []) {
  const e = engine.state.enemies[group.enemy];
  if (!e || !e.alive || e.room === engine.room.id || e.pursuit || e.phase === 'captured') continue;
  const room = engine.rooms.get(e.room); if (!room || !group.rooms.includes(room.id)) continue;
  e.y = Math.max(0, (e.y || 0) - dt * 240); e.stun = Math.max(0, (e.stun || 0) - dt);
  if (e.stun > 0) continue;
  if (['windup', 'lunge'].includes(e.phase)) {e.phase = 'recover'; e.timer = .9; e.attack = null;}
  if (e.phase === 'recover') {e.timer -= dt; if (e.timer > 0) continue; e.phase = e.lastSeen ? 'investigate' : 'idle';}
  if (['chase', 'investigate'].includes(e.phase) && e.lastSeen) {
   e.phase = 'investigate';
   if (distance(e, e.lastSeen) > 28) engine.moveEnemy(e, e.lastSeen, 115, dt, room);
   else {e.phase = 'search'; e.search = 3.3; e.timer = 0;}
  } else if (e.phase === 'search') {
   e.search -= dt; e.timer += dt;
   if (e.timer > .65) {e.facing *= -1; e.timer = 0;}
   if (e.search <= 0) {e.phase = 'idle'; e.lastSeen = null; e.nav = [];}
  } else {
   e.phase = 'idle';
   const target = {x: clamp(e.homeX + Math.sin(engine.state.time * .33) * (e.patrol || 130), 55, room.width - 55), z: e.homeZ};
   engine.moveEnemy(e, target, 45, dt, room);
  }
 }
}
const methods = {
 roomPower(room = this.state.room) {
  const d = this.systemDefs.circuits.find(c => c.rooms.includes(room));
  return d && this.state.network?.circuits[d.id] || DEFAULT_POWER;
 },
 powerCost(id) {const p = this.state.network.circuits[id]; return p ? cost(this, p) : 0;},
 nearestTerminal() {
  return this.systemDefs.terminals.filter(t => t.room === this.state.room && this.distance(t) < t.radius && this.lineClear(this.state.player, t, 80))
   .sort((a, b) => this.distance(a) - this.distance(b))[0] || null;
 },
 validNetworkSession() {
  const t = definition(this, 'terminals', this.networkSession?.terminal);
  return !!t && t.room === this.state.room && this.distance(t) <= t.radius && this.grounded() &&
   !this.state.hidden && !this.dead && !this.busy && (!t.requiresAction || this.done(t.requiresAction)) && this.lineClear(this.state.player, t, 80);
 },
 beginNetwork(id = null) {if(this.grip)return false;
  if (this.dead || this.paused || this.busy || this.state.hidden || !this.grounded()) return false;
  const t = id ? definition(this, 'terminals', id) : this.nearestTerminal();
  if (!t || t.room !== this.state.room || this.distance(t) >= t.radius || !this.lineClear(this.state.player, t, 80)) return false;
  if (t.requiresAction && !this.done(t.requiresAction)) {
   this.emit('hint', 'Le contrôle local doit être rétabli avant l’accès au réseau.'); return false;
  }
  this.stowDetector(); this.cancelWork(); this.cancelSurvey(); this.healing = 0; this.reloadTime = 0; this.clearAim();
  this.networkSession = {terminal: t.id, camera: t.cameras[0]};
  if (!this.state.network.terminals.includes(t.id)) this.state.network.terminals.push(t.id);
  log(this, 'access', t.id); this.unlock('surveillance'); this.unlock('network-flight'); this.unlock('network-log');
  this.selectCamera(t.cameras[0]); this.emit('network', 'Connexion en direct. Votre corps reste devant la console.'); return true;
 },
 endNetwork(reason = '') {
  if (!this.networkSession) return false;
  this.networkSession = null; this.clearAim(); this.motion = {moving: false, crouch: false, run: false};
  this.emit('networkClosed', reason); return true;
 },
 selectCamera(id) {
  if (this.paused || !this.validNetworkSession()) return false;
  const terminal = definition(this, 'terminals', this.networkSession.terminal);
  if (!terminal.cameras.includes(id)) return false;
  this.networkSession.camera = id;
  const camera = definition(this, 'cameras', id);
  if (this.state.network.circuits[camera.circuit].cameras && !this.state.network.viewed.includes(id)) this.state.network.viewed.push(id);
  this.unlock('cctv-blind'); return true;
 },
 cameraView(id = this.networkSession?.camera) {
  const terminal = definition(this, 'terminals', this.networkSession?.terminal), d = definition(this, 'cameras', id);
  if (!d || !terminal || !this.validNetworkSession() || !terminal.cameras.includes(id)) return {available: false, reason: 'Accès au capteur indisponible.', enemies: [], player: null};
  if (!this.state.network.circuits[d.circuit].cameras) return {available: false, reason: 'Caméras hors tension sur ce circuit.', camera: d, enemies: [], player: null};
  const room = this.rooms.get(d.room);
  const visible = v => v.x >= d.left && v.x <= d.left + d.span && v.z >= d.minZ && v.z <= d.maxZ && this.lineClear(d, v, 80, room);
  const enemies = Object.values(this.state.enemies).filter(e => e.room === d.room && e.alive && e.phase !== 'captured' && visible(e));
  const player = this.state.room === d.room && !this.state.hidden && visible(this.state.player) ? this.state.player : null;
  return {available: true, camera: d, room, enemies, player, time: this.state.time};
 },
 setCircuit(id, setting, enabled) {
  if (this.paused || !this.validNetworkSession() || !fieldNames.includes(setting) || typeof enabled !== 'boolean') return false;
  const terminal = definition(this, 'terminals', this.networkSession.terminal);
  if (!terminal.circuits.includes(id)) return false;
  const current = this.state.network.circuits[id]; if (current[setting] === enabled) return false;
  const next = {...current, [setting]: enabled};
  if (cost(this, next) > this.systemDefs.capacity) {
   this.emit('hint', 'Capacité dépassée. Coupez un autre service avant de réallouer ce circuit.'); return false;
  }
  this.state.network.circuits[id] = next;
  if (setting === 'speakers' && !enabled) this.state.network.signals = this.state.network.signals.filter(s => definition(this, 'speakers', s.id)?.circuit !== id);
  log(this, 'power', id, {setting, enabled}); this.unlock('power-budget'); this.unlock('network-persistence');
  this.emit('network', 'Répartition électrique modifiée. Les commandes physiques de secours restent disponibles.', {circuit: id}); return true;
 },
 triggerSpeaker(id) {
  if (this.paused || !this.validNetworkSession()) return false;
  const terminal = definition(this, 'terminals', this.networkSession.terminal), d = definition(this, 'speakers', id);
  if (!d || !terminal.speakers.includes(id)) return false;
  if (d.requiresAction && !this.done(d.requiresAction)) {this.emit('hint', 'Préparez d’abord le trajet de confinement dans la coursive.'); return false;}
  if (!this.state.network.circuits[d.circuit].speakers) {this.emit('hint', 'Le circuit des haut-parleurs est hors tension.'); return false;}
  if ((this.state.network.cooldowns[id] || 0) > 0) {this.emit('hint', 'Le haut-parleur doit terminer son cycle de récupération.'); return false;}
  this.state.network.cooldowns[id] = d.cooldown;
  this.state.network.signals = this.state.network.signals.filter(s => s.id !== id);
  this.state.network.signals.push({id, remaining: d.duration, nextPulse: 2});
  pulse(this, d); log(this, 'speaker', id); this.unlock('local-speakers'); this.unlock('ship-sound-route');
  this.emit('network', 'Appel technique lancé. Une cible qui vous voit ne l’abandonnera pas pour cet appel.', {speaker: id}); return true;
 }
};
const api = {fresh, sanitize, sanitizeSoundRoutes, ensureIntruder, tick, updateRemote, methods};
if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.CovenantShipSystems = api;
})(globalThis);
