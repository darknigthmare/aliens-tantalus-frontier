// V188 — runtime side of the run options: custom difficulty extras (ammo found,
// alert frequency) and the origin abilities already connected to a hook.
import { originV188 } from './run-options-v188.js';
import { measureThreatV188 } from './mission-register-v188.js';

const near = (a, b, reach) => Math.hypot((a.x + (a.w || 0) / 2) - (b.x + (b.w || 0) / 2), (a.y + (a.h || 0) / 2) - (b.y + (b.h || 0) / 2)) < reach;

export function withRunOptionsRuntimeV188(Base) {
  if (Base.runOptionsRuntimeV188) return Base;
  return class RunOptionsRuntimeV188 extends Base {
    static runOptionsRuntimeV188 = true;
    start(options = {}) {
      this.originV188 = originV188(options.originV188);
      const result = super.start(options);
      const tuning = this.difficultyRuntime || {};
      this.ammoFoundV188 = Number.isFinite(tuning.ammoFound) ? tuning.ammoFound : 1;
      this.alertFrequencyV188 = Number.isFinite(tuning.alertFrequency) ? tuning.alertFrequency : 1;
      if (this.alertFrequencyV188 !== 1 && Number.isFinite(this.nextFalseEchoAtV188)) {
        this.nextFalseEchoAtV188 = this.nextFalseEchoAtV188 / this.alertFrequencyV188;
      }
      return result;
    }
    // More frequent alerts shorten the gap to the next false echo and horde wave.
    advanceFalseEchoV188(now) {
      const scheduled = this.nextFalseEchoAtV188, result = super.advanceFalseEchoV188(now);
      if (this.alertFrequencyV188 !== 1 && this.nextFalseEchoAtV188 !== scheduled && this.nextFalseEchoAtV188 > now) {
        this.nextFalseEchoAtV188 = now + (this.nextFalseEchoAtV188 - now) / this.alertFrequencyV188;
      }
      // origin-13 Triangulation: a false echo is identified as soon as it appears.
      const echo = this.falseEchoV188;
      if (echo && !echo.revealed && this.originV188?.value?.falseEchoIdentified) {
        echo.revealed = true; this.pushCaption?.('environment', `Écho filtré : ${echo.source}.`);
        this.onEvent?.({ type: 'false-echo-revealed-v188', source: echo.source, origin: this.originV188.id });
      }
      return result;
    }
    defeatEnemy(enemy, owner) {
      const before = this.drops?.length ?? 0, result = super.defeatEnemy(enemy, owner);
      if (this.ammoFoundV188 !== 1 && Array.isArray(this.drops)) for (const drop of this.drops.slice(before)) {
        if (drop.type === 'ammo') drop.amount = Math.max(1, Math.round(drop.amount * this.ammoFoundV188));
      }
      return result;
    }
    originValueV188(key) { return this.originV188?.value?.[key]; }
    // origin-01 Composure: −15% spread of multi-pellet/stream weapons during an alert.
    weaponActionProfileV131(actor = this.player) {
      const profile = super.weaponActionProfileV131(actor), factor = 1 + (this.originValueV188('alertSpread') || 0);
      if (!profile || actor !== this.player || factor === 1 || !Number.isFinite(profile.spread)) return profile;
      return measureThreatV188(this.enemies, this.player).alerted > 0 ? { ...profile, spread: profile.spread * factor } : profile;
    }
    // origin-02 Calm civilians: the escorted survivor convoy loses 25% less health.
    updateCargoConvoyV67(delta) {
      const convoy = this.cargoBrutalV67?.convoy, before = convoy?.health, result = super.updateCargoConvoyV67(delta);
      const factor = this.originValueV188('civilianPanic');
      if (factor && convoy && Number.isFinite(before) && convoy.health < before) convoy.health += (before - convoy.health) * -factor;
      return result;
    }
    // origin-04 Loader operator: driven power loader +10% speed.
    updateVehicleDriver(player, delta, controls) {
      const bonus = this.originValueV188('loaderSpeed'), vehicle = this.vehicle;
      const loader = bonus && vehicle && /power-?loader|p-5000/i.test(`${vehicle.id || ''} ${vehicle.name || ''}`);
      if (!loader || !Number.isFinite(vehicle.runtimeSpeed)) return super.updateVehicleDriver(player, delta, controls);
      const speed = vehicle.runtimeSpeed; vehicle.runtimeSpeed = speed * (1 + bonus);
      try { return super.updateVehicleDriver(player, delta, controls); } finally { vehicle.runtimeSpeed = speed; }
    }
    // origin-05 Processor (+20% power/atmosphere transfer) and origin-15 Workshop (+20% field repair).
    beginFieldActionV124(actor, plan) {
      const repair = plan?.kind === 'power-transfer' ? this.originValueV188('atmosphericRepair')
        : plan?.kind === 'field-repair' ? this.originValueV188('vehicleRepair') : 0;
      if (actor === this.player && repair && Number.isFinite(plan.duration)) plan = { ...plan, duration: plan.duration / (1 + repair) };
      return super.beginFieldActionV124(actor, plan);
    }
    // origin-06 Shelter reflex: secured checkpoint and pressure airlocks shown on the map.
    missionNavigationMapV121() {
      const map = super.missionNavigationMapV121();
      if (!map || !this.originValueV188('shelters') || !Array.isArray(map.goals)) return map;
      const shelters = [...(this.checkpoint ? [{ id: 'shelter-checkpoint', x: this.checkpoint.x, y: this.checkpoint.y + (this.player?.h || 80) }] : []),
        ...(this.doors || []).filter(door => door.visualRole === 'pressure-airlock').map(door => ({ id: `shelter-${door.id}`, x: door.x + (door.w || 0) / 2, y: door.y + (door.h || 0) }))]
        .filter(entry => Number.isFinite(entry.x) && Number.isFinite(entry.y));
      return { ...map, goals: [...map.goals, ...shelters], sheltersV188: shelters.length };
    }
    // origin-07 Tunnels: +15% movement in ducts.
    updateMissionVentPlayerV62(actor, delta) {
      const bonus = this.originValueV188('ductSpeed');
      return super.updateMissionVentPlayerV62(actor, bonus && actor === this.player && Number.isFinite(delta) ? delta * (1 + bonus) : delta);
    }
    // origin-08 Triage: the player's rescue of a teammate is 20% faster.
    reserveSquadRescueV132(actor, target, kind = 'rescue', helperId = null) {
      const result = super.reserveSquadRescueV132(actor, target, kind, helperId), bonus = this.originValueV188('allyHealing');
      const task = this.squadDoctrineV132?.tasks?.at?.(-1);
      if (result?.reserved && bonus && actor === this.player && task?.kind === 'rescue') task.duration /= 1 + bonus;
      return result;
    }
    // origin-09 Approach: +10 s on a timed escape.
    configureObjectiveRuntime() {
      const result = super.configureObjectiveRuntime(), extra = this.originValueV188('extractionSeconds');
      const runtime = this.objectiveRuntime;
      if (extra && runtime?.timeLimit > 0) this.objectiveRuntime = Object.freeze({ ...runtime, timeLimit: runtime.timeLimit + extra });
      return result;
    }
    // origin-10 Expired codes (one security door) and origin-14 Resourceful (one tool-locked vent without the torch).
    interact(actor) {
      if (actor === this.player && this.originValueV188('companyDoors') && !this.companyDoorClaimV188) {
        const door = (this.doors || []).find(entry => !entry.open && entry.lockedBy === 'security' && near(actor, entry, 140)
          && super.doorRequirement(entry));
        if (door) { this.companyDoorClaimV188 = door.id; this.pushCaption?.('mission', 'Codes périmés : la porte de la compagnie s’ouvre.'); }
      }
      if (actor === this.player && this.originValueV188('lockers') && !this.toolFreeUsedV188 && this.inventory && !this.inventory.cutter) {
        const vent = (this.vents || []).find(entry => entry.requiresTool && !entry.open && near(actor, entry, 125));
        if (vent) {
          this.toolFreeUsedV188 = true; this.inventory.cutter = true;
          try { return super.interact(actor); } finally { this.inventory.cutter = false; }
        }
      }
      return super.interact(actor);
    }
    doorRequirement(door) {
      return door && this.companyDoorClaimV188 && door.id === this.companyDoorClaimV188 ? '' : super.doorRequirement(door);
    }
    // origin-12 Scavenging: +10% per supply crate.
    collectSupply(actor, supply) {
      const bonus = this.originValueV188('salvage');
      if (bonus && supply && Number.isFinite(supply.amount) && !supply.scavengedV188) {
        supply.amount = Math.max(supply.amount + 1, Math.round(supply.amount * (1 + bonus))); supply.scavengedV188 = true;
      }
      return super.collectSupply(actor, supply);
    }
    // origin-17 Discipline: squad members carry out orders 15% faster.
    squadCarrySpeedScaleV132(actor) {
      const scale = super.squadCarrySpeedScaleV132(actor), bonus = this.originValueV188('orderSpeed');
      return bonus && actor?.squadMember ? scale * (1 + bonus) : scale;
    }
    // origin-19 Close quarters: +10% damage when a platform is close above the player's head.
    narrowCorridorV188() {
      const p = this.player; if (!p) return false;
      const cx = p.x + (p.w || 0) / 2, head = p.y;
      return (this.platforms || []).some(surface => !surface.lift && cx >= surface.x && cx <= surface.x + surface.w
        && head - (surface.y + (surface.h || 0)) >= 0 && head - (surface.y + (surface.h || 0)) < 140);
    }
    applyEnemyDamage(enemy, rawDamage, source = {}) {
      const bonus = this.originValueV188('corridorDamage');
      const boosted = bonus && source.owner === this.player && Number.isFinite(rawDamage) && this.narrowCorridorV188();
      return super.applyEnemyDamage(enemy, boosted ? rawDamage * (1 + bonus) : rawDamage, source);
    }
    // origin-18 Convoy formation: the escorted vehicle takes 10% less damage.
    damageVehicle(amount, source) {
      const factor = 1 + (this.originV188?.value?.vehicleDamage || 0);
      return super.damageVehicle(Number.isFinite(amount) ? amount * factor : amount, source);
    }
  };
}
