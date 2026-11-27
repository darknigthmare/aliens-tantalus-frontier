import { getXenoTrialsFighterV96, XENO_TRIALS_STAGES_V96 } from './xeno-trials-data-v96.js';

const drill = (id, title, briefing, objectives, options) => Object.freeze({ id, title, briefing,
  objectives: Object.freeze(objectives), ...options });

export const XENO_TRIALS_NEW_DRILLS_V208 = Object.freeze([
  drill('draw', 'Égalité au gong', 'Le contact reproduit vos gestes en miroir. Engagez une frappe simultanée au contact ou attendez le gong à santé égale.',
    ['Obtenir une manche nulle', 'Terminer sur une égalité confirmée'],
    { opponentId: 'warrior', behavior: 'mirror', roundSeconds: 15, singleHit: true }),
  drill('rounds', 'Reprendre après une manche', 'Remportez la manche d’ouverture. Laissez ensuite la cible prendre sa revanche, puis retrouvez vos appuis en troisième manche.',
    ['Remporter la première manche', 'Perdre la deuxième manche', 'Reprendre le combat en troisième manche'],
    { roundsToWin: 2, roundSeconds: 30, singleHit: true }),
  drill('interrupt', 'Interrompre l’armement', 'Le Warrior arme sa percussion de queue. Restez à portée et placez une frappe légère pendant l’anticipation.',
    ['Observer l’armement de la percussion', 'Interrompre la frappe avant le contact'],
    { opponentId: 'warrior', pressure: 'signature2' }),
  drill('parry', 'Parade de précision', 'Laissez le contact avancer. Déclenchez Parade juste avant sa frappe lourde, puis ripostez pendant son ouverture.',
    ['Dévier une frappe lourde', 'Toucher pendant l’ouverture'],
    { pressure: 'heavy' }),
  drill('riposte', 'Super de riposte', 'Le Warden est prêté avec sa jauge pleine. Parez la frappe lourde, puis maintenez Garde et déclenchez Super pendant l’ouverture.',
    ['Créer une ouverture par une parade', 'Dépenser la jauge en riposte', 'Toucher avec le Heurt de contention'],
    { playerId: 'import-game-afe2-warden', pressure: 'heavy' })
]);

export const XENO_TRIALS_SANDBOX_ID_V208 = 'sandbox';
export const XENO_TRIALS_SANDBOX_BEHAVIORS_V208 = Object.freeze([
  Object.freeze({ id: 'cpu', label: 'Intelligence native' }),
  Object.freeze({ id: 'idle', label: 'Cible immobile' }),
  Object.freeze({ id: 'guard', label: 'Garde haute' }),
  Object.freeze({ id: 'jump', label: 'Sauts répétés' }),
  Object.freeze({ id: 'mirror', label: 'Miroir de vos commandes' })
]);

const stages = new Set(XENO_TRIALS_STAGES_V96.map(stage => stage.id));
export function normalizeXenoTrialsSandboxV208(value) {
  return {
    playerId: getXenoTrialsFighterV96(value?.playerId)?.id || 'warrior',
    opponentId: getXenoTrialsFighterV96(value?.opponentId)?.id || 'runner',
    stageId: stages.has(value?.stageId) ? value.stageId : 'containment-deck',
    behavior: XENO_TRIALS_SANDBOX_BEHAVIORS_V208.some(entry => entry.id === value?.behavior) ? value.behavior : 'cpu',
    roundSeconds: [30, 60, 99, 120].includes(value?.roundSeconds) ? value.roundSeconds : 60,
    roundsToWin: [1, 2, 3].includes(value?.roundsToWin) ? value.roundsToWin : 2,
    difficulty: ['easy', 'normal', 'hard'].includes(value?.difficulty) ? value.difficulty : 'normal',
    readySupers: value?.readySupers === true,
    noSpecial: value?.noSpecial === true,
  };
}

export function getXenoTrialsSandboxConfigV208(value) {
  const { playerId, opponentId, stageId, roundSeconds, roundsToWin, difficulty, noSpecial } = normalizeXenoTrialsSandboxV208(value);
  return { playerId, opponentId, stageId, roundSeconds, roundsToWin, difficulty, factionId: 'containment',
    matchId: 'practice-sandbox', rulesV119: { noSpecial } };
}

export function getMirroredXenoTrialsInputV208(input) {
  return { ...input, left: input?.right === true, right: input?.left === true };
}
