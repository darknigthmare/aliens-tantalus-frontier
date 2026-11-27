export const XENO_TRIALS_PARRY_V208 = Object.freeze({ cost: 9, activeTicks: 8, cooldownTicks: 36, openingTicks: 42 });

const instanceOf = fighter => fighter.instanceIdV180 || fighter.side;
const createState = () => ({ held: false, rearm: false, started: 0, readyTick: 0, openingId: 0 });

export function gateXenoTrialsParryV208(fighter, controls) {
  if (!controls) {
    if (fighter.parryV208?.held) fighter.parryV208.rearm = true;
    return;
  }
  const held = controls.parry === true;
  if (!fighter.parryV208 && held) fighter.parryV208 = createState();
  if (fighter.parryV208) {
    fighter.parryV208.held = held;
    fighter.parryV208.rearm = held;
  }
}

export function releaseXenoTrialsParryV208(fighter, controls) {
  if (!fighter.parryV208 || controls.parry === true) return;
  fighter.parryV208.held = false;
  fighter.parryV208.rearm = false;
}

export function clearXenoTrialsParryV208(fighter, resetCooldown = false) {
  if (!fighter.parryV208) return;
  fighter.parryV208.started = 0;
  fighter.parryV208.openingId = 0;
  if (resetCooldown) fighter.parryV208.readyTick = 0;
}

export function isXenoTrialsParryingV208(match, fighter) {
  const started = fighter.parryV208?.started;
  return Boolean(started && match.tick >= started && match.tick < started + XENO_TRIALS_PARRY_V208.activeTicks);
}

export function validXenoTrialsParryEventV208(match, event) {
  if (!event || event.type !== 'parry-v208' || !Number.isSafeInteger(event.id) || event.id < 2 || event.id > match.serial
    || !Number.isSafeInteger(event.tick) || event.tick < 1 || event.tick > match.tick
    || !Number.isSafeInteger(event.attackIdV208) || event.attackIdV208 < 1 || event.attackIdV208 >= event.id
    || event.damage !== 0 || !['player', 'opponent'].includes(event.side)
    || !['player', 'opponent'].includes(event.attacker) || event.side === event.attacker
    || Object.keys(event).length !== (match.hordeV180 ? 9 : 7) || !Array.isArray(match.events)) return false;
  const witnessId = event.attackIdV208 + 1;
  if (witnessId >= event.id) return false;
  const witness = match.events.find(row => row?.id === witnessId);
  if (match.events[0]?.id <= witnessId) {
    if (witness?.type !== 'attack' || witness.side !== event.attacker || witness.tick > event.tick) return false;
  }
  if (!match.hordeV180) return event.targetInstanceV180 === undefined && event.attackerInstanceV180 === undefined;
  const instanceMatches = (side, instance) => side === 'player' ? instance === 'player'
    : /^horde-[1-9]\d*$/.test(instance) && Number(instance.slice(6)) <= match.hordeV180.serial;
  return instanceMatches(event.side, event.targetInstanceV180) && instanceMatches(event.attacker, event.attackerInstanceV180)
    && (witness?.attackerInstanceV180 === undefined || witness.attackerInstanceV180 === event.attackerInstanceV180);
}

export function getXenoTrialsParryReceiptV208(match, fighter) {
  const id = fighter.parryV208?.openingId;
  if (!id || match.phase !== 'active' || fighter.hp <= 0 || !Array.isArray(match.events)) return null;
  const receipt = match.events.find(event => event?.id === id);
  if (!validXenoTrialsParryEventV208(match, receipt) || receipt.side !== fighter.side
    || match.hordeV180 && receipt.targetInstanceV180 !== instanceOf(fighter)
    || match.tick - receipt.tick >= XENO_TRIALS_PARRY_V208.openingTicks) return null;
  return receipt;
}

const findAttacker = (match, receipt) => match.fighters.find(source => source.hp > 0 && source.side === receipt.attacker
  && (!match.hordeV180 || instanceOf(source) === receipt.attackerInstanceV180)) || null;

export function getXenoTrialsParryOpeningV208(match, fighter) {
  const receipt = getXenoTrialsParryReceiptV208(match, fighter);
  return receipt ? findAttacker(match, receipt) : null;
}

export function consumeXenoTrialsParryOpeningV208(fighter) {
  if (fighter.parryV208) fighter.parryV208.openingId = 0;
}

export function stepXenoTrialsParryV208(match, fighter, held, canStart) {
  if (!fighter.parryV208 && held) fighter.parryV208 = createState();
  const state = fighter.parryV208;
  if (!state) return false;
  const fresh = held && !state.held && !state.rearm;
  state.held = held;
  if (!held) state.rearm = false;
  if (!canStart || !isXenoTrialsParryingV208(match, fighter)) state.started = 0;
  if (match.tick >= state.readyTick) state.readyTick = 0;
  if (state.openingId && !getXenoTrialsParryReceiptV208(match, fighter)) state.openingId = 0;
  if (fresh && canStart && state.readyTick === 0 && fighter.stamina >= XENO_TRIALS_PARRY_V208.cost) {
    state.started = match.tick;
    state.readyTick = match.tick + XENO_TRIALS_PARRY_V208.cooldownTicks;
    state.openingId = 0;
    fighter.stamina -= XENO_TRIALS_PARRY_V208.cost;
  }
  return state.started !== 0;
}

export function resolveXenoTrialsParryV208(match, impact) {
  const { from, to, direction, spec, meleeAttackIdV208 } = impact;
  if (!meleeAttackIdV208 || to.facing !== -direction || spec.unblockableV151 || to.stun > 0 || to.y !== 0 || to.attack
    || spec.contactBandV207 === 'low' && !to.movesetV207?.low || !isXenoTrialsParryingV208(match, to)) return null;
  to.parryV208.started = 0;
  to.parryV208.openingId = match.serial + 1;
  to.stats.blocks++;
  return { side: to.side, attacker: from.side, damage: 0, attackIdV208: meleeAttackIdV208,
    ...(match.hordeV180 ? { targetInstanceV180: instanceOf(to), attackerInstanceV180: instanceOf(from) } : {}) };
}

export function getXenoTrialsParryViewV208(match, fighter) {
  const cooldownTicks = Math.max(0, (fighter.parryV208?.readyTick || 0) - match.tick);
  const opening = getXenoTrialsParryReceiptV208(match, fighter);
  return { active: isXenoTrialsParryingV208(match, fighter), cooldownTicks,
    openingTicks: opening && findAttacker(match, opening) ? opening.tick + XENO_TRIALS_PARRY_V208.openingTicks - match.tick : 0,
    ready: match.phase === 'active' && !match.paused && !match.grappleV153 && fighter.hp > 0 && fighter.y === 0 && fighter.stun === 0
      && !fighter.attack && !fighter.movesetV207?.evade && cooldownTicks === 0 && fighter.stamina >= XENO_TRIALS_PARRY_V208.cost };
}

export function validXenoTrialsParryStateV208(match, fighter) {
  const state = fighter.parryV208;
  if (state === undefined) return true;
  if (!state || typeof state !== 'object' || Array.isArray(state) || Object.keys(state).length !== 5
    || typeof state.held !== 'boolean' || typeof state.rearm !== 'boolean' || state.rearm && !state.held) return false;
  const integer = (value, min, max) => Number.isSafeInteger(value) && value >= min && value <= max;
  if (!integer(state.started, 0, match.tick) || !integer(state.readyTick, 0, match.tick + XENO_TRIALS_PARRY_V208.cooldownTicks)
    || !integer(state.openingId, 0, match.serial)
    || match.phase !== 'active' && (state.started || state.readyTick || state.openingId)) return false;
  if (state.readyTick !== 0 && state.readyTick <= match.tick) return false;
  if (state.started !== 0 && (!isXenoTrialsParryingV208(match, fighter) || state.openingId !== 0
    || state.readyTick !== state.started + XENO_TRIALS_PARRY_V208.cooldownTicks
    || fighter.y !== 0 || fighter.stun > 0 || fighter.attack || fighter.movesetV207?.evade)) return false;
  if (!state.openingId) return true;
  if (!Array.isArray(match.events)) return false;
  const receipt = getXenoTrialsParryReceiptV208(match, fighter);
  // A busy horde can evict the bounded event ring in the very step that
  // resolved the contact. Such an opening cannot be spent after resumption.
  return Boolean(receipt || match.events.length === 32 && state.openingId < match.events[0]?.id);
}

export function xenoTrialsParryStateV208(fighter) {
  const state = fighter.parryV208;
  return state?.started || state?.readyTick || state?.openingId
    ? { started: state.started, readyTick: state.readyTick, openingId: state.openingId } : null;
}
