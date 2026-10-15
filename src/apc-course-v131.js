// Original three-lane rules layered over the reviewed M577 convoy mission.
// This keeps the existing finite course and adds an explicitly selected endless mode.
const LANES = Object.freeze([406, 478, 550]);
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const copy = value => structuredClone(value);
const roles = new Set(['horde', 'crusher-1', 'crusher-2', 'queen']);
const profiles = new Set(['enemy-004-drone-big-chap', 'enemy-005-warrior', 'enemy-006-runner', 'enemy-008-queen', 'enemy-009-crusher']);
export const APC_COURSE_LANES_V131 = LANES;
export function createApcCourseV131() {
  return { schema: 131, mode: 'finite', lane: 1, roadY: LANES[1], score: 0, lap: 1,
    totalDistance: 0, kills: 0, enemies: [], previousKeys: [], lastServicedLap: 0 };
}
export function validateApcCourseV131(raw, convoy, actors) {
  if (!raw || raw.schema !== 131 || !['finite', 'endless'].includes(raw.mode)
    || !Number.isInteger(raw.lane) || raw.lane < 0 || raw.lane > 2
    || !Number.isFinite(raw.roadY) || raw.roadY < LANES[0] || raw.roadY > LANES[2]
    || !Number.isInteger(raw.lap) || raw.lap < 1 || raw.lap > 100000
    || !Number.isInteger(raw.lastServicedLap) || raw.lastServicedLap < 0 || raw.lastServicedLap >= raw.lap
    || !Number.isInteger(raw.kills) || raw.kills < 0 || raw.kills > 1e7
    || !Number.isFinite(raw.score) || raw.score < 0 || raw.score > 1e10
    || !Number.isFinite(raw.totalDistance) || raw.totalDistance < 0 || raw.totalDistance > 3.2e8
    || Math.abs(raw.totalDistance - ((raw.lap - 1) * 3200 + Number(convoy?.distance || 0))) > .01
    || raw.lastServicedLap !== raw.lap - 1
    || raw.score > raw.totalDistance * .5 + raw.kills * 1200 + (raw.lap - 1) * 840 + 1
    || (raw.mode === 'finite' && (raw.lap !== 1 || raw.lastServicedLap !== 0))
    || !Array.isArray(raw.enemies) || raw.enemies.length > 64
    || new Set(raw.enemies.map(e => e.id)).size !== raw.enemies.length
    || raw.enemies.some(e => !/^apcv121-\d{1,2}$/.test(e.id) || !Number.isInteger(e.lane) || e.lane < 0 || e.lane > 2
      || !Number.isFinite(e.roadY) || e.roadY < LANES[0] || e.roadY > LANES[2]
      || !Number.isFinite(e.recoil) || e.recoil < 0 || e.recoil > 240)
    || raw.enemies.length !== (actors || []).length
    || raw.enemies.some(e => !actors.some(a => a.id === e.id))) return { valid: false, reason: 'apc-course-inconsistent' };
  const state = copy(raw); state.previousKeys = [];
  return { valid: true, state };
}

export function withApcCourseV131(BaseEngine) {
  if (BaseEngine.apcCourseV131 === true) return BaseEngine;
  return class ApcCourseV131 extends BaseEngine {
    static apcCourseV131 = true;
    start(options = {}) {
      this.apcCourseStateV131 = options.campaign?.id === 'special-apc-convoy' ? createApcCourseV131() : null;
      const result = super.start(this.apcCourseStateV131 ? { ...options, destructibleSceneryV130: false } : options);
      if (this.apcCourseStateV131) {
        // Lane markings are paint on one road, never floors across the turret
        // ray. The dedicated driver/contact controllers own lane elevation.
        this.platforms = [{ id: 'apc131-road', x: 0, y: 580, w: 1280, h: 38, floor: true }];
        this.pinApcConvoyDriverV121();
      }
      return this.apcCourseStateV131 ? this.getSnapshot() : result;
    }
    setApcCourseModeV131(mode) {
      if (!this.isApcConvoyV121() || !this.canApcConvoyActV121() || this.apcConvoyV121.briefed
        || !['finite', 'endless'].includes(mode)) return false;
      this.apcCourseStateV131.mode = mode; return true;
    }
    changeApcCourseLaneV131(direction) {
      if (!this.isApcConvoyV121() || !this.canApcConvoyActV121() || !this.apcConvoyV121.briefed
        || this.apcConvoyV121.phase === 'evacuation' || ![-1, 1].includes(direction)) return false;
      const state = this.apcCourseStateV131, lane = clamp(state.lane + direction, 0, 2);
      if (lane === state.lane) return false;
      state.lane = lane; this.onEvent({ type: 'apc-lane-change', lane, operationId: 'apc-convoy' }); return true;
    }
    pinApcConvoyDriverV121() {
      super.pinApcConvoyDriverV121();
      if (this.apcCourseStateV131 && this.vehicle) {
        this.vehicle.y = this.apcCourseStateV131.roadY - this.vehicle.h;
        this.vehicle.groundY = this.vehicle.y; this.player.y = this.vehicle.y + 10;
      }
    }
    update(delta) {
      if (!this.isApcConvoyV121() || !this.apcCourseStateV131) return super.update(delta);
      if (!this.canApcConvoyActV121()) return super.update(delta);
      if (!Number.isFinite(delta) || delta <= 0) return;
      const state = this.apcCourseStateV131, dt = Math.min(delta, .1), old = new Set(state.previousKeys);
      const pressed = key => this.keys.has(key) && !old.has(key);
      if (!this.apcConvoyV121.briefed) {
        if (pressed('Digit1')) this.setApcCourseModeV131('finite');
        if (pressed('Digit2')) this.setApcCourseModeV131('endless');
      } else {
        if (pressed('KeyW') || pressed('ArrowUp')) this.changeApcCourseLaneV131(-1);
        if (pressed('KeyS') || pressed('ArrowDown')) this.changeApcCourseLaneV131(1);
      }
      if (state.mode === 'endless' && this.apcConvoyV121.phase === 'evacuation' && pressed('Space')) this.nextApcCourseLapV131();
      state.previousKeys = [...this.keys].filter(key => ['Digit1', 'Digit2', 'KeyW', 'KeyS', 'ArrowUp', 'ArrowDown', 'Space'].includes(key));
      const dy = LANES[state.lane] - state.roadY;
      state.roadY += Math.sign(dy) * Math.min(Math.abs(dy), dt * 260);
      this.pinApcConvoyDriverV121();
      const before = this.apcConvoyV121.distance;
      // S now changes lanes; braking uses B so these controls cannot conflict.
      const down = this.keys.has('KeyS'), arrow = this.keys.has('ArrowDown'), brake = this.keys.has('KeyB');
      this.keys.delete('KeyS'); this.keys.delete('ArrowDown'); if (brake) this.keys.add('KeyS');
      try { super.update(dt); } finally {
        this.keys.delete('KeyS'); if (down) this.keys.add('KeyS'); if (arrow) this.keys.add('ArrowDown');
      }
      const distance = Math.max(0, this.apcConvoyV121.distance - before);
      state.totalDistance += distance; state.score += distance * .5;
      this.pinApcConvoyDriverV121();
    }
    nextApcCourseLapV131() {
      const state = this.apcCourseStateV131, convoy = this.apcConvoyV121;
      if (!this.canApcConvoyActV121() || state?.mode !== 'endless' || convoy.phase !== 'evacuation'
        || !convoy.queenDefeated || state.lastServicedLap === state.lap || state.lap >= 100000) return false;
      state.score += 500 + Math.floor(this.vehicle.hull); state.lastServicedLap = state.lap; state.lap += 1;
      this.enemies = []; state.enemies = [];
      Object.assign(convoy, { distance: 0, enemies: [], enemySequence: 0, waves: 0, crushersDefeated: [false, false],
        queenDefeated: false, stageBossId: null, extractionProgress: 0, nextWaveAt: convoy.elapsed + 3, journal: ['orders', 'depart'] });
      // One earned service after a cleared lap; never replenishes on ordinary reload.
      this.vehicle.hull = Math.min(340, this.vehicle.hull + 55); this.vehicle.fuel = Math.min(100, this.vehicle.fuel + 35);
      this.vehicle.turretReserve = Math.min(120, this.vehicle.turretReserve + 90);
      this.syncApcConvoyWorldV121(); this.apcConvoyCheckpointV121 = this.captureApcConvoyCheckpointV121();
      this.onEvent({ type: 'apc-course-lap', lap: state.lap, score: Math.floor(state.score), operationId: 'apc-convoy' }); return true;
    }
    apcConvoySpawnV121(profileId, role = 'horde', descriptor = null) {
      if (!this.apcCourseStateV131) return super.apcConvoySpawnV121(profileId, role, descriptor);
      if (!profiles.has(profileId) || !roles.has(role)) return null;
      const convoy = this.apcConvoyV121, state = this.apcCourseStateV131;
      if (!descriptor) {
        // Retire dead contacts so an endless course never reaches the old 64-actor lifetime cap.
        const liveIds = new Set(this.enemies.filter(e => e.alive).map(e => e.id));
        this.enemies = this.enemies.filter(e => e.alive);
        convoy.enemies = convoy.enemies.filter(e => liveIds.has(e.id)); state.enemies = state.enemies.filter(e => liveIds.has(e.id));
        const occupied = new Set(convoy.enemies.map(e => Number(e.id.split('-')[1])));
        let slot = 1; while (occupied.has(slot) && slot <= 64) slot += 1;
        if (slot > 64) return null;
        descriptor = { id: `apcv121-${slot}`, profileId, role, spawnX: 40 + slot % 3 * 65,
          attackClock: 1.2, chargeClock: .7, chargePhase: 'windup' };
        convoy.enemySequence = Math.max(convoy.enemySequence, slot); convoy.enemies.push(descriptor);
        const lane = role === 'horde' ? (convoy.waves + slot) % 3 : state.lane;
        state.enemies.push({ id: descriptor.id, lane, roadY: LANES[lane], recoil: 0 });
      }
      const enemy = super.apcConvoySpawnV121(profileId, role, descriptor);
      if (enemy) { const entry = state.enemies.find(e => e.id === enemy.id);
        enemy.apcLaneV131 = entry?.lane ?? state.lane; enemy.apcRoadYV131 = entry?.roadY ?? LANES[enemy.apcLaneV131];
        enemy.apcRecoilV131 = entry?.recoil ?? 0; enemy.y = enemy.apcRoadYV131 - enemy.h; }
      return enemy;
    }
    apcConvoyTargetV121() {
      if (!this.apcCourseStateV131) return super.apcConvoyTargetV121();
      return this.enemies.filter(e => e.alive && e.apcConvoyRoleV121 && Math.abs(e.apcRoadYV131 - this.apcCourseStateV131.roadY) < 36
        && e.x + e.w / 2 < this.vehicle.x + 15 && e.x + e.w / 2 > this.vehicle.x - 980).sort((a,b) => b.x - a.x)[0] || null;
    }
    updateEnemy(enemy, delta) {
      if (!this.apcCourseStateV131 || !enemy.apcConvoyRoleV121) return super.updateEnemy(enemy, delta);
      if (!this.canApcConvoyActV121()) return;
      if (!enemy.alive || !this.apcConvoyV121.briefed || this.apcConvoyV121.phase === 'evacuation') return;
      const dt = clamp(Number(delta) || 0, 0, .1), state = this.apcCourseStateV131;
      const laneDelta = LANES[enemy.apcLaneV131] - enemy.apcRoadYV131;
      enemy.apcRoadYV131 += Math.sign(laneDelta) * Math.min(Math.abs(laneDelta), dt * 90);
      enemy.y = enemy.apcRoadYV131 - enemy.h; enemy.facing = 1;
      enemy.hurtClock = Math.max(0, (enemy.hurtClock || 0) - dt); enemy.staggerClock = Math.max(0, (enemy.staggerClock || 0) - dt);
      enemy.apcConvoyAttackClockV121 = Math.max(0, enemy.apcConvoyAttackClockV121 - dt);
      const heavy = enemy.apcConvoyRoleV121.startsWith('crusher'), royal = enemy.apcConvoyRoleV121 === 'queen';
      if (heavy) { enemy.apcConvoyChargeClockV121 = Math.max(0, enemy.apcConvoyChargeClockV121 - dt);
        if (!enemy.apcConvoyChargeClockV121) enemy.apcConvoyChargePhaseV121 = 'charge'; }
      const local = this.vehicle.spriteHitbox?.local;
      const hullLeft = this.vehicle.x + (local?.x || 0), body = enemy.spriteHitbox?.local;
      const contact = hullLeft - (body?.w || enemy.w) - (body?.x || 0) - 4;
      let speed = heavy ? enemy.apcConvoyChargePhaseV121 === 'charge' ? 410 : 35 : clamp(Number(enemy.speed) || 85,60,200);
      speed *= 1 + Math.min(.8, (state.lap - 1) * .08); if (enemy.staggerClock > 0) speed *= .25;
      const aligned = Math.abs(enemy.apcRoadYV131 - state.roadY) < 36;
      const retreat = Math.min(enemy.apcRecoilV131 || 0, dt * 280);
      if (retreat > 0) { enemy.x = Math.max(80, enemy.x - retreat); enemy.apcRecoilV131 -= retreat; enemy.vx = -280; }
      else { enemy.x = aligned ? Math.min(contact, enemy.x + speed * dt) : enemy.x + speed * dt; enemy.vx = speed; }
      if (aligned && enemy.x >= contact - 1 && enemy.apcConvoyAttackClockV121 === 0) {
        this.damageVehicle(enemy.damage * (heavy ? 1.8 : royal ? 1.4 : 1), `${enemy.name}:lane-impact`);
        enemy.apcConvoyAttackClockV121 = heavy ? 2.1 : 1.6;
        if (heavy) { enemy.apcRecoilV131 = 240; enemy.apcConvoyChargeClockV121 = .7; enemy.apcConvoyChargePhaseV121 = 'windup'; }
      }
      // Barrage bosses close to the vehicle can change lanes after a telegraphed windup.
      if ((heavy || royal) && !aligned && enemy.x > 650 && enemy.apcConvoyAttackClockV121 === 0 && enemy.apcLaneV131 !== state.lane) {
        enemy.apcLaneV131 = state.lane; const entry = state.enemies.find(e => e.id === enemy.id); if (entry) entry.lane = state.lane;
        enemy.apcConvoyAttackClockV121 = 1.2;
        this.onEvent({ type: 'apc-boss-lane-warning', lane: state.lane, enemyId: enemy.id, operationId: 'apc-convoy' });
      }
      const entry = state.enemies.find(e=>e.id===enemy.id);
      if (entry) Object.assign(entry,{lane:enemy.apcLaneV131,roadY:enemy.apcRoadYV131,recoil:enemy.apcRecoilV131||0});
      if (!heavy && !royal && enemy.x > 1300) {
        this.enemies = this.enemies.filter(e => e !== enemy); this.apcConvoyV121.enemies = this.apcConvoyV121.enemies.filter(e => e.id !== enemy.id);
        state.enemies = state.enemies.filter(e => e.id !== enemy.id);
      }
    }
    defeatEnemy(enemy, owner = this.player) {
      const award = this.apcCourseStateV131 && enemy?.alive && enemy.apcConvoyRoleV121;
      const result = super.defeatEnemy(enemy, owner);
      if (award && !enemy.alive) { this.apcCourseStateV131.kills += 1;
        this.apcCourseStateV131.score += award === 'queen' ? 1200 : award.startsWith('crusher') ? 600 : 100; }
      return result;
    }
    captureResumeState() {
      const raw = super.captureResumeState(); if (!this.apcCourseStateV131 || !this.isApcConvoyV121()) return raw;
      // Keep V121's documented hull identity intact; lane placement is restored by this extension.
      if (raw.vehicle) raw.vehicle.y = 570 - this.vehicle.h;
      return { ...raw, apcCourseV131: { ...copy(this.apcCourseStateV131), previousKeys: [],
        totalDistance: (this.apcCourseStateV131.lap - 1) * 3200 + this.apcConvoyV121.distance,
        enemies: this.enemies.map(e => ({ id: e.id, lane: e.apcLaneV131 ?? 1,
          roadY: e.apcRoadYV131 ?? LANES[1], recoil: e.apcRecoilV131 || 0 })) } };
    }
    applyResumeState(raw) {
      if (!this.apcCourseStateV131 || !this.isApcConvoyV121()) return super.applyResumeState(raw);
      const legacy = !raw?.apcCourseV131;
      const initial = createApcCourseV131(); initial.totalDistance = raw?.specialOperation?.apcConvoyV121?.distance || 0;
      initial.enemies = (raw?.enemies || []).map(e => ({ id:e.id,lane:1,roadY:LANES[1],recoil:0 }));
      const checked = validateApcCourseV131(legacy ? initial : raw.apcCourseV131, raw?.specialOperation?.apcConvoyV121, raw?.enemies);
      if (!checked.valid) return { applied:false,reason:checked.reason };
      const previous = this.apcCourseStateV131; this.apcCourseStateV131 = checked.state;
      const result = super.applyResumeState(raw);
      if (!result?.applied) { this.apcCourseStateV131 = previous; return result; }
      for (const e of this.enemies) { const entry = checked.state.enemies.find(item=>item.id===e.id);
        e.apcLaneV131 = entry?.lane ?? 1; e.apcRoadYV131 = entry?.roadY ?? LANES[1]; e.apcRecoilV131 = entry?.recoil || 0;
        e.y=e.apcRoadYV131-e.h; }
      this.pinApcConvoyDriverV121(); return {...result,apcCourseRestoredV131:true,legacyCourseMigratedV131:legacy};
    }
    objectiveProgressText() {
      if (!this.isApcConvoyV121() || !this.apcCourseStateV131) return super.objectiveProgressText();
      if (!this.apcConvoyV121.briefed) return '1 course finie · 2 endless · E engager · W/S changer de voie · B freiner · Espace accélérer · F tirer · R recharger';
      if (this.apcConvoyV121.phase === 'evacuation' && this.apcCourseStateV131.mode==='endless') return 'Maintenir E : terminer et archiver le score · Espace : ravitaillement gagné et tour suivant';
      return 'W/S : trois voies · B : freiner · Espace : accélérer · F : tourelle sur la voie · R : bande · esquiver charges et surveiller carburant';
    }
    getSnapshot() {
      const raw=super.getSnapshot(); return this.apcCourseStateV131 && this.isApcConvoyV121() ? {...raw,apcCourseV131:{...copy(this.apcCourseStateV131),
        score:Math.floor(this.apcCourseStateV131.score),lanes:[...LANES],localPlayers:1,adaptation:'Règles originales, M577 existant. Coop encore à produire.'}} : raw;
    }
    drawBackdrop(ctx) {
      super.drawBackdrop(ctx); if (!this.isApcConvoyV121() || !this.apcCourseStateV131) return;
      ctx.save(); ctx.fillStyle='#243137';ctx.fillRect(0,LANES[0]-4,1280,LANES[2]-LANES[0]+30);
      for(const [i,y] of LANES.entries()) { ctx.strokeStyle=i===this.apcCourseStateV131.lane?'#c5d9a2':'#66746e';ctx.setLineDash([50,40]);ctx.beginPath();ctx.moveTo(0,y+9);ctx.lineTo(1280,y+9);ctx.stroke(); }
      ctx.restore();
    }
    drawHud(ctx) {
      super.drawHud(ctx); if (!this.isApcConvoyV121() || !this.apcCourseStateV131) return;
      const s=this.apcCourseStateV131;ctx.save();ctx.fillStyle='#091318';ctx.fillRect(18,208,1150,49);ctx.fillStyle='#d4e5b6';ctx.font='700 13px monospace';
      ctx.fillText(`${s.mode==='endless'?'ENDLESS':'COURSE FINIE'} · TOUR ${s.lap} · VOIE ${s.lane+1}/3 · SCORE ${Math.floor(s.score)} · TOTAL ${Math.floor(s.totalDistance)} M`,32,227);
      ctx.font='11px monospace';ctx.fillText(this.objectiveProgressText(),32,246);ctx.restore();
    }
  };
}
