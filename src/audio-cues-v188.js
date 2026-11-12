// V188 — 40 priority sound cues (bible §53.2, list §56.4). Original offline
// synthesis for Tantalus Frontier: no samples, no melody or sound taken from a
// film, game or commercial library. Deterministic, rendered by
// scripts/generate-audio-v188.mjs into assets/audio/sfx/<id>.wav.

const cue = (id, family, seconds, seed, params = {}) => Object.freeze({ id, family, seconds, seed, ...params });

export const AUDIO_CUES_V188 = Object.freeze([
  // Motion tracker (4)
  cue('tracker-pulse', 'tracker', .22, 18801, { f: 760 }),
  cue('tracker-near', 'tracker', .14, 18802, { f: 1180 }),
  cue('tracker-far', 'tracker', .3, 18803, { f: 620 }),
  cue('tracker-false-echo', 'tracker', .36, 18804, { f: 700, warble: 1 }),
  // Footsteps (5)
  cue('step-metal', 'step', .16, 18811, { f: 240, ring: .5 }),
  cue('step-grating', 'step', .18, 18812, { f: 330, ring: .8 }),
  cue('step-concrete', 'step', .13, 18813, { f: 140, ring: 0 }),
  cue('step-water', 'step', .24, 18814, { f: 90, ring: 0, wet: 1 }),
  cue('step-resin', 'step', .22, 18815, { f: 70, ring: 0, wet: .6 }),
  // Doors and airlocks (6)
  cue('door-open', 'door', .7, 18821, { f: 120, rise: 1 }),
  cue('door-close', 'door', .62, 18822, { f: 130, rise: -1, thud: 1 }),
  cue('door-locked', 'door', .3, 18823, { f: 180, buzz: 1 }),
  cue('airlock-pressurize', 'airlock', 1.6, 18824, { rise: 1 }),
  cue('airlock-depressurize', 'airlock', 1.6, 18825, { rise: -1 }),
  cue('door-forced', 'door', .9, 18826, { f: 95, grind: 1 }),
  // Lifts (2)
  cue('lift-depart', 'lift', 1.2, 18831, { f: 55, rise: 1 }),
  cue('lift-arrive', 'lift', .9, 18832, { f: 60, rise: -1, thud: 1 }),
  // Alarms (3)
  cue('alarm-general', 'alarm', 1.4, 18841, { f: 420, period: .7 }),
  cue('alarm-quarantine', 'alarm', 1.6, 18842, { f: 300, period: .4 }),
  cue('alarm-countdown', 'alarm', 1, 18843, { f: 880, period: 1, beep: 1 }),
  // Ambience (4) — short loopable beds
  cue('ambience-rain', 'ambience', 4, 18851, { tone: 'rain' }),
  cue('ambience-rain-roof', 'ambience', 4, 18852, { tone: 'roof' }),
  cue('ambience-ventilation', 'ambience', 4, 18853, { tone: 'vent' }),
  cue('ambience-relay-hum', 'ambience', 4, 18854, { tone: 'hum' }),
  // Caste cries (8)
  cue('cry-drone', 'cry', .9, 18861, { f: 520, hiss: .6 }),
  cue('cry-warrior', 'cry', .8, 18862, { f: 380, hiss: .7 }),
  cue('cry-runner', 'cry', .55, 18863, { f: 720, hiss: .5 }),
  cue('cry-spitter', 'cry', .7, 18864, { f: 460, hiss: .9, gurgle: 1 }),
  cue('cry-crusher', 'cry', 1.1, 18865, { f: 140, hiss: .4 }),
  cue('cry-queen', 'cry', 1.6, 18866, { f: 210, hiss: .5 }),
  cue('cry-facehugger', 'cry', .45, 18867, { f: 1400, hiss: .3, skitter: 1 }),
  cue('cry-chestburster', 'cry', .6, 18868, { f: 1700, hiss: .2 }),
  // Main weapons (8)
  cue('weapon-m41a-burst', 'weapon', .42, 18871, { f: 150, rounds: 3 }),
  cue('weapon-m41a-grenade', 'weapon', .6, 18872, { f: 70, thump: 1 }),
  cue('weapon-pistol', 'weapon', .2, 18873, { f: 210, rounds: 1 }),
  cue('weapon-shotgun', 'weapon', .5, 18874, { f: 90, rounds: 1, spread: 1 }),
  cue('weapon-smartgun', 'weapon', .45, 18875, { f: 120, rounds: 4 }),
  cue('weapon-flamethrower', 'weapon', .8, 18876, { roar: 1 }),
  cue('weapon-reload', 'weapon', .5, 18877, { clack: 2 }),
  cue('weapon-dry-fire', 'weapon', .12, 18878, { clack: 1 })
]);

export const AUDIO_CUE_IDS_V188 = Object.freeze(AUDIO_CUES_V188.map(entry => entry.id));
export const AUDIO_CUE_PROVENANCE_V188 = Object.freeze({ origin: 'Original offline synthesis for Tantalus Frontier',
  samples: 'None', renderer: 'renderAudioCueV188', revision: 188, sampleRate: 22050 });

const tau = Math.PI * 2;
const env = (t, duration, attack = .004) => t < 0 || t >= duration ? 0
  : Math.min(1, t / attack) * Math.min(1, (duration - t) / Math.min(.25, duration * .3));

export function renderAudioCueV188(id, sampleRate = 22050) {
  const score = AUDIO_CUES_V188.find(entry => entry.id === id);
  if (!score || !Number.isSafeInteger(sampleRate) || sampleRate < 8000 || sampleRate > 96000) throw new Error('Invalid audio cue');
  const frames = Math.round(score.seconds * sampleRate), samples = new Float32Array(frames);
  let seed = score.seed, low = 0, previous = 0;
  const noise = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2147483648 - 1; };
  const d = score.seconds, f = score.f || 200;
  for (let i = 0; i < frames; i++) {
    const t = i / sampleRate, n = noise(), high = n - previous; previous = n; low += (n - low) * .06;
    let v = 0;
    switch (score.family) {
      case 'tracker': {
        const warble = score.warble ? 1 + .04 * Math.sin(tau * 9 * t) : 1;
        v = (.5 * Math.sin(tau * f * warble * t) + .14 * Math.sin(tau * f * 2.01 * t)) * Math.exp(-t * (score.warble ? 7 : 14))
          + (score.warble ? .08 * low * Math.exp(-t * 5) : 0);
        break;
      }
      case 'step': {
        v = (.6 * high * Math.exp(-t * 60) + .4 * Math.sin(tau * f * t) * Math.exp(-t * 30)
          + score.ring * .25 * Math.sin(tau * f * 4.3 * t) * Math.exp(-t * 18)
          + (score.wet || 0) * .4 * low * Math.sin(tau * 3 * t / d) * Math.exp(-t * 9));
        break;
      }
      case 'door': {
        const sweep = score.rise > 0 ? t / d : 1 - t / d;
        v = .3 * low * (.6 + .4 * Math.sin(tau * 31 * t)) * env(t, d, .05)
          + .22 * Math.sin(tau * (f + 60 * sweep) * t) * env(t, d, .05)
          + (score.thud && t > d - .14 ? .7 * Math.sin(tau * 52 * (t - d + .14)) * Math.exp(-(t - d + .14) * 30) : 0)
          + (score.buzz ? .35 * Math.sign(Math.sin(tau * f * t)) * Math.exp(-t * 8) : 0)
          + (score.grind ? .3 * high * (.5 + .5 * Math.sin(tau * 13 * t)) * env(t, d, .02) : 0);
        break;
      }
      case 'airlock': {
        const sweep = score.rise > 0 ? t / d : 1 - t / d;
        v = (.55 * (sweep * high + (1 - sweep) * low) * env(t, d, .2)) + .12 * Math.sin(tau * 48 * t) * env(t, d, .1);
        break;
      }
      case 'lift': {
        const sweep = score.rise > 0 ? Math.min(1, t / .5) : Math.max(0, 1 - t / .6);
        v = .35 * Math.sin(tau * (f + 25 * sweep) * t) * env(t, d, .08) + .18 * low * env(t, d, .1)
          + (score.thud && t > d - .2 ? .6 * Math.sin(tau * 46 * (t - d + .2)) * Math.exp(-(t - d + .2) * 22) : 0);
        break;
      }
      case 'alarm': {
        const phase = t % score.period, on = score.beep ? phase < .12 : phase < score.period * .65;
        v = on ? (.32 * Math.sin(tau * (f + (score.beep ? 0 : 60 * Math.sin(tau * t / score.period))) * t)
          + .12 * Math.sin(tau * f * 2 * t)) * env(phase, score.beep ? .12 : score.period * .65, .01) : 0;
        break;
      }
      case 'ambience': {
        // Integer-cycle components keep the 4 s loop seamless.
        const cycles = hzValue => Math.round(hzValue * d) / d;
        if (score.tone === 'rain') v = .45 * high * (.7 + .3 * Math.sin(tau * cycles(.5) * t)) + .1 * low;
        if (score.tone === 'roof') v = .3 * high + (n > .985 ? .8 * n : 0) + .12 * low;
        if (score.tone === 'vent') v = .5 * low + .08 * Math.sin(tau * cycles(60) * t) + .05 * Math.sin(tau * cycles(120) * t);
        if (score.tone === 'hum') v = .25 * Math.sin(tau * cycles(50) * t) + .12 * Math.sin(tau * cycles(150) * t)
          + .06 * Math.sin(tau * cycles(1210) * t) * (.5 + .5 * Math.sin(tau * cycles(.75) * t)) + .05 * low;
        break;
      }
      case 'cry': {
        const shape = Math.sin(Math.PI * Math.min(1, t / d)) ** .7;
        const pitch = f * (1 + .25 * Math.sin(tau * 2.5 * t / d) - .2 * t / d);
        v = shape * (.32 * Math.sin(tau * pitch * t + 2 * Math.sin(tau * pitch * .5 * t))
          + score.hiss * .45 * high + (score.gurgle ? .2 * low * Math.sin(tau * 23 * t) : 0)
          + (score.skitter ? .3 * high * (Math.sin(tau * 38 * t) > .6 ? 1 : 0) : 0));
        break;
      }
      case 'weapon': {
        if (score.roar) { v = (.55 * low + .25 * high) * env(t, d, .06) * (.8 + .2 * Math.sin(tau * 17 * t)); break; }
        if (score.clack) {
          const hits = score.clack === 2 ? [0, .28] : [0];
          for (const start of hits) { const a = t - start; if (a >= 0) v += .8 * high * Math.exp(-a * 90) + .3 * Math.sin(tau * 1800 * a) * Math.exp(-a * 70); }
          break;
        }
        const gap = d / (score.rounds + 1);
        for (let round = 0; round < score.rounds; round++) {
          const a = t - round * gap; if (a < 0) continue;
          v += (.5 * high * Math.exp(-a * (score.spread ? 22 : 45)) + .45 * Math.sin(tau * (f - 80 * a) * a) * Math.exp(-a * 24));
        }
        if (score.thump) v += .6 * Math.sin(tau * (f - 30 * t) * t) * Math.exp(-t * 7) + .3 * low * Math.exp(-t * 5);
        break;
      }
      default: break;
    }
    samples[i] = v;
  }
  let peak = 0; for (const value of samples) peak = Math.max(peak, Math.abs(value));
  const target = score.family === 'ambience' ? .42 : score.family === 'step' ? .5 : .76;
  const gain = target / Math.max(peak, .01);
  for (let i = 0; i < samples.length; i++) samples[i] = Math.max(-.84, Math.min(.84, samples[i] * gain));
  return { samples, sampleRate, channels: 1, frames, seconds: score.seconds };
}

// —— Event → cue mapping (pure). Unknown events give no cue. ——
const CASTE_CUES = [
  [/queen|reine|royal/i, 'cry-queen'], [/crusher|charger|bélier/i, 'cry-crusher'], [/facehugger|parasite|hugger/i, 'cry-facehugger'],
  [/chestburster|juvenile|burster/i, 'cry-chestburster'], [/spitter|acid|cracheur/i, 'cry-spitter'],
  [/runner|rôdeur|pouncer|prowler/i, 'cry-runner'], [/warrior|guerrier|soldier/i, 'cry-warrior'], [/drone|xeno|xénomorphe|alien/i, 'cry-drone']
];
export function casteCueV188(enemy) {
  const text = [enemy?.family, enemy?.profileId, enemy?.behaviorProfile, enemy?.name, enemy?.id].filter(Boolean).join(' ');
  for (const [pattern, id] of CASTE_CUES) if (pattern.test(text)) return id;
  return null;
}

export function weaponCueV188(weaponId = '', weaponClass = '') {
  const text = `${weaponId} ${weaponClass}`.toLowerCase();
  if (/flame|incinerator/.test(text)) return 'weapon-flamethrower';
  if (/smartgun|m56/.test(text)) return 'weapon-smartgun';
  if (/shotgun|pompe|m37|m39/.test(text)) return 'weapon-shotgun';
  if (/pistol|m4a3|revolver/.test(text)) return 'weapon-pistol';
  if (/m41a|pulse|rifle/.test(text)) return 'weapon-m41a-burst';
  return null;
}

export function cueForGameEventV188(event) {
  switch (event?.type) {
    case 'door': return event.open === false || event.closed ? 'door-close' : 'door-open';
    case 'mission-door-unlocked': return 'door-forced';
    case 'lift-called-v130': return 'lift-depart';
    case 'lift-arrived-v130': return 'lift-arrive';
    case 'lift-blocked-v130': return 'door-locked';
    case 'horde-warning-v132': return 'alarm-general';
    case 'mecha-boss-warning-v131': return 'alarm-general';
    case 'mission-timer-started': return 'alarm-countdown';
    case 'false-echo-v188': return 'tracker-false-echo';
    case 'grenade-exploded-v130': return 'weapon-m41a-grenade';
    case 'squad-fire': return 'weapon-m41a-burst';
    case 'ceiling-drop-v188': return 'cry-drone';
    case 'spotted': return casteCueV188(event.enemy || event);
    case 'mission-vent-exit-start': return 'door-forced';
    default: break;
  }
  if (typeof event?.type === 'string' && event.type.startsWith('reload-')) return 'weapon-reload';
  return null;
}

// Surface from the level/world description: hull interiors are metal or
// grating, colonies concrete, flooded zones water, hives resin.
export function surfaceCueV188({ template = '', biome = '', hive = false, wet = false } = {}) {
  const text = `${template} ${biome}`.toLowerCase();
  if (hive || /hive|ruche|resin|résine|nest|nid/.test(text)) return 'step-resin';
  if (wet || /flood|water|eau|swamp|marais|rain|pluie|ocean/.test(text)) return 'step-water';
  if (/grating|catwalk|vent|relay|relais|industrial|industriel|reactor/.test(text)) return 'step-grating';
  if (/colony|colonie|street|rue|outdoor|surface|port/.test(text)) return 'step-concrete';
  return 'step-metal';
}

/** Single-shot timbre: sidearm for the secondary mode, else the primary class.
 * The M41A keeps the legacy shot; its burst cue serves allied squad fire. */
export function shotCueV188(player, weapon) {
  if (player?.weaponMode === 'secondary') return 'weapon-pistol';
  const id = weaponCueV188(weapon?.id || '', weapon?.class || weapon?.category || '');
  return ['weapon-pistol', 'weapon-shotgun', 'weapon-smartgun'].includes(id) ? id : null;
}

export const FOOTSTEP_STRIDE_V188 = 72; // px of grounded travel between two steps

export function withFootstepCuesV188(Base) {
  if (Base.footstepCuesRuntimeV188) return Base;
  return class FootstepCuesV188 extends Base {
    static footstepCuesRuntimeV188 = true;
    start(options = {}) {
      const result = super.start(options);
      this.footstepTravelV188 = 0; this.footstepLastXV188 = this.player?.x ?? null;
      this.footstepSurfaceV188 = surfaceCueV188({ template: options.missionLevel?.templateId || options.missionLevel?.template || '',
        biome: `${options.world?.biome || ''} ${options.world?.atmosphere || ''}`, hive: Boolean(this.isHiveMissionV131?.()) });
      return result;
    }
    fire(player) {
      const profile = typeof this.weaponProfile === 'function' && player ? this.weaponProfile(player) : null;
      if (player && player === this.player && profile && profile.ammo <= 0 && !(Number(player.ammoReserve) > 0)
        && !player.reloading && !(player.fireClock > 0) && this.running && !this.paused) {
        const now = Number(this.mission?.elapsed) || 0;
        if (!(now - (this.dryFireAtV188 ?? -1) < .3)) { this.dryFireAtV188 = now; this.audio?.cue?.('weapon-dry-fire'); }
      }
      if (this.audio && profile && profile.mode !== 'apc-turret') this.audio.nextShotCueV188 = shotCueV188(player, this.weaponRuntime);
      try { return super.fire(player); } finally { if (this.audio) this.audio.nextShotCueV188 = null; }
    }
    update(delta) {
      const result = super.update(delta), actor = this.player;
      if (!actor || !this.running || this.paused || !Number.isFinite(actor.x)) return result;
      const last = this.footstepLastXV188; this.footstepLastXV188 = actor.x;
      if (last === null || actor.grounded === false || actor.inVehicle || actor.climbing || actor.ventTransit || actor.alive === false) return result;
      const moved = Math.abs(actor.x - last);
      if (moved > 200) return result; // teleports and resumes are not steps
      this.footstepTravelV188 += moved;
      if (this.footstepTravelV188 >= FOOTSTEP_STRIDE_V188) {
        this.footstepTravelV188 %= FOOTSTEP_STRIDE_V188;
        this.footstepsV188 = (this.footstepsV188 || 0) + 1;
        this.audio?.cue?.(this.footstepSurfaceV188);
      }
      return result;
    }
  };
}
