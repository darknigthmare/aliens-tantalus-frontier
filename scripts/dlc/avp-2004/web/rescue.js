
/* v0.8: local companion wounds and interruptible care. No DOM, no network.
   All economy changes commit once, only after a completed physical action.
   A downed companion can always be raised without a consumable (anti-softlock).
   Canonical departures and boss sequences retain their original authority. */
(function (G) {
  'use strict';
  const D = G.AVP_DATA, C = G.AVP_CORE, P = C.Game.prototype, R = D.rescueRules;
  const finite = (x, fallback = 0) => Number.isFinite(x) ? x : fallback;
  const ids = new Set(D.companions.map(d => d.id));
  const stationIds = new Set(D.careStations.map(s => s.id));
  const counters = ['hits', 'downs', 'rescues', 'treatments', 'stations', 'interruptions'];
  function defaults() { return { vitals: {}, usedStations: [], journal: [], stats: Object.fromEntries(counters.map(k => [k, 0])) }; }
  function ensure(g) {
    g.s.rescue ||= defaults(); g.s.schema = 10;
    for (const id of ids) if (g.s.party?.[id] && !g.s.rescue.vitals[id]) {
      g.s.rescue.vitals[id] = { hp: R[id].maxHp, hitUntil: 0, downAt: null };
    }
    return g.s.rescue;
  }
  function hydrate(s, raw) {
    s.rescue = defaults(); s.schema = 10;
    if (raw.schema >= 8 && raw.rescue && typeof raw.rescue === 'object') {
      const src = raw.rescue;
      for (const id of ids) {
        const v = src.vitals?.[id]; if (!v || !s.flags[D.companions.find(d => d.id === id).start]) continue;
        const hp = C.clamp(finite(v.hp, R[id].maxHp), 0, R[id].maxHp);
        s.rescue.vitals[id] = { hp, hitUntil: C.clamp(finite(v.hitUntil), 0, s.worldTime + R.reviveImmunity), downAt: hp === 0 ? C.clamp(finite(v.downAt, s.worldTime), 0, s.worldTime) : null };
        // Invalid payloads cannot carry an incapacitated actor through a connector.
        if (hp === 0 && s.partyTraversals) delete s.partyTraversals[id];
      }
      s.rescue.usedStations = Array.isArray(src.usedStations) ? [...new Set(src.usedStations.filter(k => stationIds.has(k)))] : [];
      for (const k of counters) s.rescue.stats[k] = C.clamp(Math.floor(finite(src.stats?.[k])), 0, 1e8);
      const codes = new Set(['down', 'raised', 'treated', 'station']);
      s.rescue.journal = Array.isArray(src.journal) ? src.journal.slice(-40).filter(v => v && codes.has(v.code) && C.ROOMS.has(v.room) && !C.ROOMS.get(v.room).sceneOnly && (ids.has(v.id) || stationIds.has(v.id))).map(v => ({ code: v.code, id: v.id, room: v.room, at: C.clamp(finite(v.at), 0, s.worldTime) })) : [];
    }
    for (const id of ids) if (s.party?.[id] && !s.rescue.vitals[id]) s.rescue.vitals[id] = { hp: R[id].maxHp, hitUntil: 0, downAt: null };
    // Validate the identity locked at attack windup. No serialized arbitrary target.
    for (const [id, rt] of Object.entries(s.tracking)) {
      const target = raw.tracking?.[id]?.attackTarget;
      rt.attackTarget = ids.has(target) ? target : 'lex';
    }
    return s;
  }
  G.AVP_RESCUE = { ensure, hydrate, rules: R };
  const place = P.placeAlly;
  P.placeAlly = function () { place.call(this); ensure(this); };
  P.companionVital = function (id) { ensure(this); return this.s.rescue.vitals[id] || null; };
  P.companionDown = function (id) { return this.companionVital(id)?.hp === 0; };
  P.companionBody = function (id) { return this.companionActors().find(a => a.id === id) || null; };
  P.rescueLog = function (code, id) { ensure(this); this.s.rescue.journal.push({ code, id, room: this.s.room, at: this.s.worldTime }); this.s.rescue.journal = this.s.rescue.journal.slice(-40); };
  P.damageCompanion = function (id, amount, source = null) {
    ensure(this); const v = this.s.rescue.vitals[id], a = this.companionBody(id);
    if (!v || !a || this.s.party?.[id]?.room !== this.s.room || !Number.isFinite(amount) || amount <= 0 || this.dead || this.s.completed || this.s.scene || this.s.traversal || this.s.partyTraversals?.[id] || v.hp <= 0 || this.s.worldTime < v.hitUntil) return false;
    if (source && (!this.enemies.includes(source) || source.hp <= 0 || Math.abs(source.x-a.x)>110 || (!this.isSide && Math.abs(source.y-a.y)>48) || !this.los(source, a))) return false;
    const damage = amount * (this.s.difficulty === 'expedition' ? .64 : 1) * R[id].armor;
    v.hp = Math.max(0, v.hp - damage); v.hitUntil = this.s.worldTime + R.hitImmunity;
    this.s.rescue.stats.hits++; this.cancelConversation(false); this._studyTarget = null; this._studyHold = 0;
    if (this._aid?.id === id) this.cancelAid(true);
    this.effect.push({ x: a.x, y: a.y, kind: 'hit', life: .25 });
    if (v.hp === 0) {
      v.downAt = this.s.worldTime; this.s.rescue.stats.downs++; this.rescueLog('down', id);
      a.nav = []; a.navAge = 0; this.s.party[id].crossWait = 0; delete this._partyNav[id];
      this.emit('warning', D.companions.find(d => d.id === id).name + ' est à terre. Rejoignez-le et maintenez I pour le relever.');
      // Persist the wound for a normal resume, without replacing the retry checkpoint.
      this.emit('save');
    } else this.emit('companion-hurt', D.companions.find(d => d.id === id).name + ' est blessé.');
    return true;
  };
  // Only ordinary local enemies change target. Boss choreography is untouched.
  P.chooseVictim = function (e, rt, flare) {
    const lex = this.s.hidden || this.s.traversal ? null : { id: 'lex', body: this.s.player };
    if (e.unique || flare || this.s.scene || this.s.traversal) return lex;
    const ld = lex ? C.dist(e, lex.body) : Infinity;
    if (ld < 115 && this.los(e, lex.body)) return lex;
    const candidates = this.companionActors().filter(a => !this.companionDown(a.id) && !this.s.partyTraversals?.[a.id] && C.dist(e, a) < 325 && ((a.x - e.x) * e.face > -35 || C.dist(e, a) < 95) && this.visualRay(e, a)).sort((a, b) => C.dist(e, a) - C.dist(e, b));
    const a = candidates[0];
    return a && C.dist(e, a) < ld * .78 ? { id: a.id, body: a } : lex;
  };
  P.attackBody = function (id) {
    if (id === 'lex') return this.s.hidden || this.s.traversal ? null : this.s.player;
    if (!ids.has(id) || this.companionDown(id) || this.s.party?.[id]?.room !== this.s.room || this.s.partyTraversals?.[id]) return null;
    return this.companionBody(id);
  };
  P.strikeVictim = function (id, amount, e) { return id === 'lex' ? this.damage(amount, e) : this.damageCompanion(id, amount, e); };
  const store = P.storeRoomState;
  P.storeRoomState = function () {
    store.call(this); ensure(this);
    for (const [id, rt] of Object.entries(this.runtime || {})) if (this.s.tracking[id]) this.s.tracking[id].attackTarget = ids.has(rt.attackTarget) ? rt.attackTarget : 'lex';
  };
  const sync = P.syncEnemies;
  P.syncEnemies = function () {
    const known = new Set(Object.keys(this.runtime)); sync.call(this);
    for (const [id, rt] of Object.entries(this.runtime)) if (!known.has(id)) rt.attackTarget = ids.has(this.s.tracking?.[id]?.attackTarget) ? this.s.tracking[id].attackTarget : 'lex';
  };
  const walk = P.walk;
  P.walk = function (a, target, rt, dt, speed) {
    if (ids.has(a.id)) {
      const vital = this.companionVital(a.id); if (vital?.hp === 0 || this._aid?.id === a.id) return;
      if (vital && vital.hp < R[a.id].woundBelow) speed *= .66;
    }
    return walk.call(this, a, target, rt, dt, speed);
  };
  const advanceOffscreen = P.advanceOffscreenCompanion;
  P.advanceOffscreenCompanion = function (id, dt) { if (this.companionDown(id)) return; return advanceOffscreen.call(this, id, dt * (this.companionVital(id)?.hp < R[id].woundBelow ? .66 : 1)); };
  const status = P.partyStatus;
  P.partyStatus = function (id) {
    const v = this.companionVital(id); if (!this.s.party?.[id]) return status.call(this, id);
    const suffix = ' · ' + Math.ceil(v.hp) + ' / ' + R[id].maxHp;
    return v.hp === 0 ? 'À terre · ' + C.ROOMS.get(this.s.party[id].room).name : (v.hp < R[id].woundBelow ? 'Blessure critique · ' : '') + status.call(this, id) + suffix;
  };
  const order = P.orderCompanion;
  P.orderCompanion = function (id, command) { if (this.companionDown(id)) { this.emit('notice', 'Le compagnon doit être relevé sur place avant de recevoir un ordre.'); return false; } return order.call(this, id, command); };
  const encounterPosition = P.encounterPosition;
  P.encounterPosition = function (t) { return t?.companion && this.companionDown(t.companion) ? null : encounterPosition.call(this, t); };
  const studyStatus = P.studyStatus;
  P.studyStatus = function (s) { return this.companionDown('sebastian') ? 'Sebastian est à terre · I pour porter secours' : studyStatus.call(this, s); };
  const objective = P.completeObjective;
  P.completeObjective = function (fromScene = false) {
    const id = this.objective?.flag === 'ritual' ? 'sebastian' : this.objective?.flag === 'escaped' ? 'scar' : null;
    if (id && !fromScene && this.companionDown(id)) { this.emit('notice', 'Relever ' + D.companions.find(d => d.id === id).name + ' avant de continuer.'); return false; }
    return objective.call(this, fromScene);
  };
  P.careStationAvailable = function (station) { return !!station && station.room === this.s.room && !!this.s.flags[station.after]; };
  P.careRecipients = function (station) {
    const target = { x: station.x, y: this.isSide ? 144 : station.y };
    return this.companionActors().filter(a => !this.companionDown(a.id) && C.dist(a, target) <= 190 && this.los(a, target));
  };
  P.haltReason = function (station) {
    if (this.s.rescue.usedStations.includes(station.id)) return 'Cette réserve a déjà été utilisée';
    if (this.s.bombRemaining !== null) return 'Impossible de faire halte pendant la détonation';
    if (this.s.pursuits.some(p => p.to === this.s.room && p.until > this.s.worldTime)) return 'Un poursuivant se dirige vers la pièce';
    if (this.enemies.some(e => e.hp > 0 && C.dist(e, this.s.player) < 580 && this.visualRay(e, this.s.player))) return 'Écarter la menace avant de déployer la réserve';
    if (this.s.player.hp >= 100 && !this.careRecipients(station).some(a => this.companionVital(a.id).hp < R[a.id].maxHp)) return 'Personne à portée ne nécessite de soin';
    return null;
  };
  P.nearestAid = function () {
    ensure(this); if (this.s.hidden || this.s.scene || this.s.traversal || this.dead || this.s.completed) return null;
    const p = this.s.player;
    const companions = this.companionActors().filter(a => C.dist(a, p) <= R.aidRadius && (this.isSide || Math.abs(a.y - p.y) < 46) && this.los(a, p));
    const down = companions.find(a => this.companionDown(a.id));
    if (down) return { kind: 'revive', id: down.id, body: down, hold: R.reviveTime, label: 'Relever ' + D.companions.find(d => d.id === down.id).name, reason: null };
    const station = D.careStations.find(d => this.careStationAvailable(d) && this.near(d, 84) && this.los(p, { x: d.x, y: this.isSide ? 144 : d.y }));
    if (station) return { kind: 'station', id: station.id, body: station, hold: R.stationTime, label: station.title, reason: this.haltReason(station) };
    const injured = companions.find(a => this.companionVital(a.id).hp < R[a.id].maxHp);
    if (injured) return { kind: 'treat', id: injured.id, body: injured, hold: R.treatTime, label: 'Soigner ' + D.companions.find(d => d.id === injured.id).name, reason: this.s.inventory.medkits < 1 ? 'Une trousse est nécessaire' : null };
    return null;
  };
  P.cancelAid = function (interrupted = false) {
    if (this._aid && interrupted) { this.s.rescue.stats.interruptions++; this.emit('notice', 'Le secours est interrompu. Aucune réserve dépensée.'); }
    this._aid = null;
  };
  P.commitAid = function (action) {
    const current = this.nearestAid();
    if (!current || current.id !== action.id || current.kind !== action.kind || current.reason) return false;
    if (action.kind === 'station') {
      const st = D.careStations.find(d => d.id === action.id);
      this.s.player.hp = Math.min(100, this.s.player.hp + 60);
      for (const a of this.careRecipients(st)) { const v = this.companionVital(a.id); v.hp = Math.min(R[a.id].maxHp, v.hp + 65); }
      this.s.rescue.usedStations.push(action.id); this.s.rescue.stats.stations++; this.rescueLog('station', action.id);
      this.emit('field', 'Les soins sont terminés. La réserve est désormais vide ; aucun compagnon distant n’a été soigné.', { title: st.title });
    } else {
      const v = this.companionVital(action.id);
      if (action.kind === 'revive') {
        v.hp = R[action.id].reviveHp; v.downAt = null; v.hitUntil = this.s.worldTime + R.reviveImmunity;
        this.s.rescue.stats.rescues++; this.rescueLog('raised', action.id);
      } else {
        if (this.s.inventory.medkits < 1) return false;
        this.s.inventory.medkits--; v.hp = Math.min(R[action.id].maxHp, v.hp + R.treatAmount);
        this.s.rescue.stats.treatments++; this.rescueLog('treated', action.id);
      }
      this.emit('field', action.kind === 'revive' ? 'Il peut se remettre en route. La santé reste partielle et les ordres précédents sont conservés.' : 'Une trousse partagée. Le compagnon récupère, sans modifier les ordres.', { title: action.label });
    }
    this.s.stats.interactions++; this._aidLatch = true; this.cancelAid(false); this.saveCheckpoint(); return true;
  };
  const retry = P.retry;
  P.retry = function () { retry.call(this); ensure(this); this.cancelAid(false); this._aidLatch = false; };
  const damage = P.damage;
  P.damage = function (...args) { const hp = this.s.player.hp; const result = damage.apply(this, args); if (this.s.player.hp < hp) this.cancelAid(true); return result; };
  const tick = P.tick;
  P.tick = function (dt, input = {}) {
    ensure(this); const before = this.s.worldTime, room = this.s.room;
    const conflict = !!(input.dx || input.dy || input.attack || input.dodge || input.interact || input.utility || input.seal || input.talk || input.heal || input.flare);
    if (!input.aid) { this.cancelAid(false); this._aidLatch = false; }
    if (conflict) { this.cancelAid(true); if (input.aid) this._aidLatch = true; }
    if (input.aid && !conflict && !this._aidLatch) {
      const action = this.nearestAid();
      if (!action || action.reason) { this.cancelAid(false); if (action?.reason) { this.emit('notice', action.reason); this._aidLatch = true; } }
      else if (!this._aid || this._aid.id !== action.id || this._aid.kind !== action.kind) {
        this.cancelConversation(false); this._studyTarget = null; this._studyHold = 0;
        this._aid = { id: action.id, kind: action.kind, hold: action.hold, progress: 0, room };
      }
    }
    const pending = this._aid;
    const value = pending ? { ...input, dx: 0, dy: 0, attack: false, guard: false, crouch: true, run: false, dodge: false, heal: false, flare: false, utility: false, seal: false, interact: false, talk: false, order: false, listen: false } : input;
    tick.call(this, dt, value); this.s.schema = 10;
    const elapsed = this.s.worldTime - before;
    if (elapsed <= 0) return;
    // Acid is local and physical. Incapacitated companions are not farmed for hits.
    if (!this.dead && !this.s.scene && !this.s.traversal) for (const a of this.companionActors()) {
      if (this.acids.some(v => v.life > 0 && Math.abs(a.x - v.x) < 35 && (this.isSide || Math.abs(a.y - v.y) < 32))) this.damageCompanion(a.id, 8);
    }
    if (!pending || this._aid !== pending) return;
    const now = this.nearestAid();
    if (this.dead || this.s.room !== room || !now || now.reason || now.id !== pending.id || now.kind !== pending.kind) { this.cancelAid(true); return; }
    pending.progress += elapsed;
    if (pending.progress + 1e-7 >= pending.hold) this.commitAid(pending);
  };
})(globalThis);

