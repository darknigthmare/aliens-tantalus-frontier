// V188 — mission register (bible §0.3, §55.3, §55.7, values §56.4 [PROPOSÉ]).
// Pure data and rules: no DOM, no save mutation. The register is a field of
// the mission sheet; the player cannot change it (difficulty stays separate).

export const MISSION_REGISTERS_V188 = Object.freeze(['horror', 'tension', 'action', 'calm']);

export const MISSION_REGISTER_PROFILES_V188 = Object.freeze({
  horror: Object.freeze({ id: 'horror', label: 'Horreur', spawnMultiplier: .5, relaxSeconds: 30, falseEchoes: true,
    save: Object.freeze({ checkpoint: true, terminal: true, free: false }), music: 'silence-then-alert' }),
  tension: Object.freeze({ id: 'tension', label: 'Tension', spawnMultiplier: .8, relaxSeconds: 20, falseEchoes: true,
    save: Object.freeze({ checkpoint: true, terminal: true, free: true }), music: 'alert' }),
  action: Object.freeze({ id: 'action', label: 'Action', spawnMultiplier: 1.2, relaxSeconds: 10, falseEchoes: false,
    save: Object.freeze({ checkpoint: true, terminal: false, free: true }), music: 'early-alert' }),
  calm: Object.freeze({ id: 'calm', label: 'Calme', spawnMultiplier: 0, relaxSeconds: 0, falseEchoes: false,
    save: Object.freeze({ checkpoint: false, terminal: false, free: true }), music: 'calm' })
});

// Existing chapter identifiers keep their ids; only the register is attached.
export const CAMPAIGN_REGISTERS_V188 = Object.freeze({
  'special-narrative-qz17': 'horror',   // Acte I — La cargaison fantôme
  'special-archive-relay': 'tension',   // Acte II — Le dernier relais (QZ-18)
  'special-apc-convoy': 'action',       // Acte III A — Ramener le blindé
  'special-c12-horde': 'tension',       // Acte III B — C-12
  'special-black-cocoon': 'horror'      // Acte IV — Cocon noir
});

export const SAVE_RULES_V188 = Object.freeze({
  threatRadius: 640,       // px, about one screen width
  damageQuietSeconds: 8,   // free save refused after recent damage
  terminalSeconds: 3,      // exposed interaction at a terminal
  terminalReach: 120       // px from the secured checkpoint/terminal
});

export function resolveMissionRegisterV188(campaign) {
  const id = typeof campaign === 'string' ? campaign : campaign?.id;
  const explicit = typeof campaign === 'object' ? campaign?.registerV188 : null;
  if (MISSION_REGISTERS_V188.includes(explicit)) return explicit;
  if (id && Object.hasOwn(CAMPAIGN_REGISTERS_V188, id)) return CAMPAIGN_REGISTERS_V188[id];
  const text = `${id || ''} ${typeof campaign === 'object' ? campaign?.kind || '' : ''}`.toLowerCase();
  if (/horde|survival|defen[cs]e|siege|convoy/.test(text)) return 'action';
  return 'tension';
}

export function missionRegisterProfileV188(register) {
  return MISSION_REGISTER_PROFILES_V188[MISSION_REGISTERS_V188.includes(register) ? register : 'tension'];
}

const center = actor => ({ x: (Number(actor?.x) || 0) + (Number(actor?.w) || 0) / 2, y: (Number(actor?.y) || 0) + (Number(actor?.h) || 0) / 2 });

export function enemyIsAlertedV188(enemy) {
  if (!enemy || enemy.alive === false || enemy.dormant) return false;
  const mode = enemy.tacticsV130?.mode;
  if (mode) return mode === 'pursuit';
  return enemy.alert === true;
}

/** Threat picture used by the save rules and the tension director. */
export function measureThreatV188(enemies = [], player, radius = SAVE_RULES_V188.threatRadius) {
  const origin = center(player);
  let alerted = 0, near = 0, nearest = Infinity;
  for (const enemy of Array.isArray(enemies) ? enemies : []) {
    if (!enemy || enemy.alive === false || enemy.dormant || enemy.hordeV132 && enemy.rearEntryV130?.phase && enemy.rearEntryV130.phase !== 'active') continue;
    const p = center(enemy), distance = Math.hypot(p.x - origin.x, p.y - origin.y);
    nearest = Math.min(nearest, distance);
    if (distance < radius) near++;
    if (enemyIsAlertedV188(enemy)) alerted++;
  }
  return Object.freeze({ alerted, near, nearest: Number.isFinite(nearest) ? nearest : null });
}

/** §55.3 / §56.4 — free save outside combat, decided from the register. */
export function evaluateFreeSaveV188({ register, enemies, player, secondsSinceDamage = Infinity } = {}) {
  const profile = missionRegisterProfileV188(register);
  if (!profile.save.free) return Object.freeze({ allowed: false, reason: 'register', mode: profile.save.terminal ? 'terminal' : 'checkpoint',
    message: 'Sauvegarde libre indisponible : trouvez un terminal de sauvegarde.' });
  const threat = measureThreatV188(enemies, player);
  if (threat.alerted > 0 || threat.near > 0) return Object.freeze({ allowed: false, reason: 'threat', mode: 'free', threat,
    message: 'Impossible de sauvegarder : menace à proximité.' });
  if (secondsSinceDamage < SAVE_RULES_V188.damageQuietSeconds) return Object.freeze({ allowed: false, reason: 'recent-damage', mode: 'free', threat,
    message: 'Impossible de sauvegarder : menace à proximité.' });
  return Object.freeze({ allowed: true, reason: 'clear', mode: 'free', threat, message: '' });
}

/** Terminal save: near the secured checkpoint, no threat inside the radius. */
export function evaluateTerminalSaveV188({ register, enemies, player, terminal } = {}) {
  const profile = missionRegisterProfileV188(register);
  if (!profile.save.terminal) return Object.freeze({ allowed: false, reason: 'register', message: 'Aucun terminal de sauvegarde dans cette opération.' });
  if (!terminal || !Number.isFinite(terminal.x) || !Number.isFinite(terminal.y)) return Object.freeze({ allowed: false, reason: 'no-terminal',
    message: 'Aucun terminal sécurisé à portée.' });
  const p = center(player), distance = Math.hypot(p.x - terminal.x, (Number(player?.y) || 0) - terminal.y);
  if (distance > SAVE_RULES_V188.terminalReach) return Object.freeze({ allowed: false, reason: 'out-of-reach',
    message: 'Rejoignez le dernier terminal sécurisé pour sauvegarder.' });
  const threat = measureThreatV188(enemies, player);
  if (threat.alerted > 0 || threat.near > 0) return Object.freeze({ allowed: false, reason: 'threat', threat,
    message: 'Impossible de sauvegarder : menace à proximité.' });
  return Object.freeze({ allowed: true, reason: 'clear', threat, message: '' });
}
