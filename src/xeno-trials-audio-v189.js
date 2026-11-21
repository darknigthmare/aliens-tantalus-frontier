/** Original procedural MIRE cues, never extracted film/game recordings.
 * Observation only: this controller owns its nodes, never gameplay, timers,
 * animation frames, a shared director's context, or a persistent music scene. */
export const XENO_TRIALS_AUDIO_LIMITS_V189 = Object.freeze({ maxVoices: 8, maxCuesPerObservation: 3,
  maxCuesPerSecond: 10, eventAgeTicks: 36, ticksPerSecond: 120 });
const limits = XENO_TRIALS_AUDIO_LIMITS_V189;
const level = (value, fallback) => Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : fallback;
const integer = value => Number.isSafeInteger(value) && value >= 0;
const gestures = new Set(['pointerdown', 'keydown', 'click', 'touchstart']);
const recipes = Object.freeze({
  fight: { priority: 65, cooldown: 60, tones: [[310, .075, 'sine', .045, 90]] },
  light: { priority: 20, cooldown: 12, tones: [[155, .045, 'triangle', .045, -75]] },
  heavy: { priority: 25, cooldown: 16, tones: [[91, .075, 'triangle', .06, -43]] },
  special: { priority: 30, cooldown: 20, tones: [[205, .11, 'sine', .045, 145]] },
  super: { priority: 70, cooldown: 36, tones: [[130, .18, 'sawtooth', .035, -55], [390, .15, 'sine', .025, 135]] },
  hit: { priority: 60, cooldown: 9, tones: [[118, .065, 'triangle', .085, -68]] },
  hurt: { priority: 75, cooldown: 12, tones: [[66, .11, 'triangle', .095, -32]] },
  block: { priority: 62, cooldown: 12, tones: [[470, .055, 'square', .035, -170]] },
  guardBreak: { priority: 82, cooldown: 24, tones: [[84, .17, 'sawtooth', .055, -40], [317, .075, 'triangle', .035, -190]] },
  boss: { priority: 88, cooldown: 90, tones: [[103, .22, 'triangle', .065, 44], [226, .16, 'sine', .035, -46]] },
  warning: { priority: 85, cooldown: 60, tones: [[675, .10, 'sine', .035, -115]] },
  hazard: { priority: 76, cooldown: 18, tones: [[147, .10, 'sawtooth', .035, -93]] },
  objective: { priority: 90, cooldown: 20, tones: [[365, .11, 'sine', .045, 125], [705, .12, 'triangle', .025, -60]] },
  victory: { priority: 100, cooldown: 120, tones: [[294, .23, 'sine', .045, 115], [620, .19, 'triangle', .025, 73]] },
  defeat: { priority: 100, cooldown: 120, tones: [[178, .24, 'triangle', .055, -105]] },
  draw: { priority: 100, cooldown: 120, tones: [[220, .14, 'triangle', .035, 0]] }
});

function cueFor(event, snapshot) {
  switch (event.type) {
    case 'fight': return 'fight';
    case 'attack': return ['light', 'heavy', 'special', 'super'].includes(event.kind) ? event.kind : null;
    case 'hit': return event.damage > 0 ? event.side === 'player' ? 'hurt' : 'hit' : null;
    case 'block': return 'block';
    case 'guard-break': return 'guardBreak';
    case 'horde-boss-incoming-v186': case 'horde-boss-spawn-v186': return 'boss';
    case 'horde-boss-telegraph-v186': case 'stage-hazard-warning-v188': return 'warning';
    case 'stage-hazard-contact-v188': return event.damage > 0 ? event.actorId === 'player' ? 'hurt' : 'hazard' : null;
    case 'operation-objective-v188': case 'operation-delivery-v188': return 'objective';
    case 'match-end': return snapshot?.phase === 'match-over' && snapshot.result?.completed === true
      && snapshot.result.winner === event.winner ? event.winner === 'player' ? 'victory' : event.winner === 'draw' ? 'draw' : 'defeat' : null;
    default: return null;
  }
}
function identityFor(snapshot) {
  return snapshot?.config && typeof snapshot.config.matchId === 'string' && integer(snapshot.tick) && integer(snapshot.serial)
    ? `${snapshot.config.matchId}:${snapshot.config.seed}:${snapshot.config.stageId}` : null;
}

export function createXenoTrialsAudioV189({ audioDirector = null, audioContext = null,
  AudioContextCtor = globalThis.AudioContext || globalThis.webkitAudioContext,
  getSettings = () => ({ enabled: true, master: 1, effects: .7 }), ambience = true, initialSnapshot = null } = {}) {
  let context = audioDirector?.context || audioContext || null, ownedContext = false, bus = null;
  let enabled = true, stopped = false, paused = false, active = false, focused = true, status = 'locked';
  let identity = null, primed = false, consumedSerial = 0, lastTick = 0, emittedCues = 0, suppressedCues = 0;
  let generation = 0, pendingUnlock = null, cancelUnlock = null, windowTick = 0, windowCount = 0;
  const voices = new Set(), cooldowns = new Map(), counts = Object.fromEntries(Object.keys(recipes).map(key => [key, 0]));

  function settings() {
    if (audioDirector) return { enabled: audioDirector.enabled !== false && !audioDirector.disposed,
      master: level(audioDirector.volumes?.master, 1), effects: level(audioDirector.volumes?.effects, .7) };
    let value;
    try { value = getSettings() || {}; } catch { value = { enabled: false }; }
    return { enabled: value.enabled !== false, master: level(value.master, 1), effects: level(value.effects, .7) };
  }
  function refreshContext() { if (audioDirector) context = audioDirector.context || null; return context; }
  function audible() {
    const value = settings(); refreshContext();
    return enabled && value.enabled && value.master > 0 && value.effects > 0 && context?.state === 'running';
  }
  function release(voice) {
    if (!voices.delete(voice)) return;
    voice.source.onended = null;
    try { voice.source.stop(); } catch {}
    try { voice.source.disconnect(); } catch {}
    try { voice.gain.disconnect(); } catch {}
    audioDirector?.effectVoices?.delete?.(voice.source);
    if (!voices.size && bus) { try { bus.disconnect(); } catch {} bus = null; }
  }
  function silence(suspendOwned = true) {
    for (const voice of [...voices]) release(voice);
    try { bus?.disconnect(); } catch {}
    bus = null;
    if (suspendOwned && ownedContext && context?.state === 'running') {
      try { context.suspend?.()?.catch?.(() => {}); } catch {}
    }
  }
  function output() {
    if (!audible()) return null;
    if (!bus) {
      const target = audioDirector ? audioDirector.master : context.destination;
      if (!target) return null;
      try { bus = context.createGain(); bus.connect(target); } catch { try { bus?.disconnect(); } catch {} bus = null; return null; }
    }
    const value = settings();
    bus.gain.value = audioDirector ? 1 : value.master * value.effects * .26;
    return bus;
  }
  function reap() {
    for (const voice of [...voices]) if (!voice.hum && voice.endsAt <= (context?.currentTime || 0)) release(voice);
  }
  function tone(parameters, hum = false) {
    const target = output(); if (!target) return false;
    while (voices.size >= limits.maxVoices) {
      const oldest = [...voices].find(voice => !voice.hum);
      if (!oldest) return false;
      release(oldest);
    }
    let source, gain;
    try {
      const [frequency, duration, type, volume, glide] = parameters, now = context.currentTime;
      source = context.createOscillator(); gain = context.createGain();
      source.type = type; source.frequency.setValueAtTime(frequency, now);
      if (!hum && glide) source.frequency.exponentialRampToValueAtTime(Math.max(24, frequency + glide), now + duration);
      gain.gain.setValueAtTime(hum ? volume : .0001, now);
      if (!hum) {
        gain.gain.linearRampToValueAtTime(volume, now + Math.min(.008, duration / 4));
        gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
      }
      source.connect(gain); gain.connect(target);
      const voice = { source, gain, hum, endsAt: hum ? Infinity : now + duration };
      voices.add(voice);
      // Share the director's global voice cap and immediate global mute while
      // retaining ownership of cleanup for this controller's nodes only.
      audioDirector?.trackEffect?.(source);
      source.onended = () => release(voice);
      source.start(now); if (!hum) source.stop(now + duration);
      return true;
    } catch {
      const failed = [...voices].find(voice => voice.source === source);
      if (failed) release(failed);
      else {
        try { source?.disconnect(); gain?.disconnect(); } catch {}
        if (!voices.size && bus) { try { bus.disconnect(); } catch {} bus = null; }
      }
      return false;
    }
  }
  function syncHum(snapshot) {
    const existing = [...voices].find(voice => voice.hum);
    const wanted = ambience && snapshot.phase === 'active' && !snapshot.result;
    if (!wanted && existing) release(existing);
    if (wanted && !existing) tone([43 + ((snapshot.config.seed || 0) % 11), 0, 'sine', .012, 0], true);
  }
  function prime(snapshot) {
    const nextIdentity = identityFor(snapshot); if (!nextIdentity) return false;
    identity = nextIdentity; consumedSerial = snapshot.serial; lastTick = snapshot.tick; primed = true;
    return true;
  }
  function blockedStatus() {
    if (stopped) return 'stopped';
    const value = settings();
    if (!enabled || !value.enabled || value.master <= 0 || value.effects <= 0) return 'muted';
    if (paused || !active || !focused) return 'paused';
    if (!context && !AudioContextCtor && !audioDirector?.unlock) return 'unsupported';
    return 'locked';
  }
  async function unlock(event) {
    if (stopped || event?.isTrusted !== true || !gestures.has(event.type)) return false;
    if (audible()) return true;
    const value = settings(); if (!enabled || !value.enabled || value.master <= 0 || value.effects <= 0) return false;
    if (pendingUnlock) return pendingUnlock;
    const token = generation;
    // Creation/resume executes synchronously in this trusted input's call stack.
    let result;
    try {
      if (audioDirector) result = audioDirector.unlock?.();
      else {
        if (!context && AudioContextCtor) { context = new AudioContextCtor(); ownedContext = true; }
        result = context?.state === 'suspended' ? context.resume() : context?.state === 'running';
      }
    } catch { status = 'locked'; return false; }
    // The public operation belongs to this controller. A shared context's
    // resume promise may remain pending after this owner has already stopped.
    let settle, settled = false;
    const pending = new Promise(resolve => { settle = resolve; });
    const finish = value => {
      if (settled) return;
      settled = true;
      if (pendingUnlock === pending) { pendingUnlock = null; cancelUnlock = null; }
      settle(value);
    };
    pendingUnlock = pending; cancelUnlock = () => finish(false);
    void Promise.resolve(result).then(() => {
      if (stopped || token !== generation) { finish(false); return; }
      refreshContext(); const ready = context?.state === 'running';
      const current = settings();
      if (!enabled || !current.enabled || !current.master || !current.effects || paused || !focused) {
        silence(); status = blockedStatus(); finish(false); return;
      }
      status = ready ? paused || !active || !focused ? 'paused' : 'running' : blockedStatus();
      finish(ready);
    }).catch(() => finish(false));
    return pending;
  }
  function observeState(snapshot, options = {}) {
    if (stopped) return false;
    active = options.active !== false && snapshot?.paused !== true; focused = options.focused !== false;
    const nextIdentity = identityFor(snapshot);
    if (!nextIdentity) { active = false; silence(); status = blockedStatus(); return false; }
    const newMatch = !primed || identity !== nextIdentity || snapshot.tick < lastTick || snapshot.serial < consumedSerial;
    const pending = newMatch ? [] : (Array.isArray(snapshot.events) ? snapshot.events : []).filter(event => integer(event?.id)
      && event.id > consumedSerial && event.id <= snapshot.serial && integer(event.tick) && event.tick <= snapshot.tick);
    if (newMatch) { silence(false); cooldowns.clear(); windowTick = snapshot.tick; windowCount = 0; }
    prime(snapshot); // Muted, blurred and paused events are consumed, never queued.
    if (paused || !active || !focused || !audible()) {
      suppressedCues += pending.filter(event => cueFor(event, snapshot)).length;
      silence(); status = blockedStatus(); return false;
    }
    reap(); status = 'running'; syncHum(snapshot);
    if (snapshot.tick - windowTick >= limits.ticksPerSecond) { windowTick = snapshot.tick; windowCount = 0; }
    const grouped = new Map();
    for (const event of pending) {
      const cue = cueFor(event, snapshot); if (!cue) continue;
      if (snapshot.tick - event.tick > limits.eventAgeTicks) { suppressedCues++; continue; }
      // Crowd contacts share one timbre per observation instead of forty voices.
      if (grouped.has(cue)) suppressedCues++;
      else grouped.set(cue, event);
    }
    let accepted = 0;
    for (const [cue] of [...grouped].sort((a, b) => recipes[b[0]].priority - recipes[a[0]].priority)) {
      const recipe = recipes[cue];
      const budget = limits.maxCuesPerSecond - (recipe.priority === 100 ? 0 : recipe.priority >= 85 ? 1 : 2);
      if (accepted >= limits.maxCuesPerObservation || windowCount >= budget
        || snapshot.tick - (cooldowns.get(cue) ?? -Infinity) < recipe.cooldown) { suppressedCues++; continue; }
      let heard = false;
      for (const parameters of recipe.tones) heard = tone(parameters) || heard;
      if (heard) { accepted++; windowCount++; emittedCues++; counts[cue]++; cooldowns.set(cue, snapshot.tick); }
    }
    return accepted > 0;
  }
  function getState() {
    refreshContext(); const value = settings();
    const gain = bus && context?.state === 'running' && enabled && value.enabled
      ? audioDirector ? bus.gain.value * (audioDirector.master?.gain?.value || 0) : bus.gain.value : 0;
    const diag = { enabled, supported: Boolean(context || AudioContextCtor || audioDirector?.unlock), unlocked: context?.state === 'running',
      activeVoices: voices.size, humActive: [...voices].some(voice => voice.hum), consumedSerial, emittedCues, gain };
    return { ...diag, diag: { ...diag }, status: stopped ? 'stopped' : status, contextState: context?.state || 'uncreated',
      usingSharedContext: Boolean(audioDirector || audioContext), lastTick, suppressedCues, counts: { ...counts }, timers: 0, animationFrames: 0 };
  }
  if (initialSnapshot) prime(initialSnapshot);
  return Object.freeze({ unlock, observeState, getState,
    setEnabled(value) { if (stopped) return false; enabled = value === true; if (!enabled) silence(); status = blockedStatus(); return enabled; },
    pause() { if (stopped) return false; paused = true; silence(); status = blockedStatus(); return true; },
    resume(snapshot) { if (stopped) return false; paused = false; if (snapshot) prime(snapshot); status = blockedStatus(); return true; },
    stop() {
      if (stopped) return false;
      stopped = true; generation++; cancelUnlock?.(); silence(); status = 'stopped';
      if (ownedContext) { try { context?.close?.()?.catch?.(() => {}); } catch {} }
      return true;
    }
  });
}
