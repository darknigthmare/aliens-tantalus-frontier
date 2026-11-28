const orders = 'Choisissez une copie des archives. La copie temporaire à l’ouest expire six secondes après sa prise. Neutralisez la première vague pour accéder à la copie scellée à l’est. Transmettez la copie choisie depuis le terminal central.';
const routes = Object.freeze([
  Object.freeze({ id: 'archive-volatile', kind: 'terminal', label: 'Copie temporaire', x: 205, y: 0, radius: 90, requiredTicks: 84 }),
  Object.freeze({ id: 'archive-sealed', kind: 'terminal', label: 'Copie scellée', x: 1095, y: 0, radius: 90, requiredTicks: 120 })
]);
const terminal = Object.freeze({ id: 'archive-uplink', kind: 'terminal', label: 'Terminal de transmission', x: 650, y: 0, radius: 96, requiredTicks: 90 });
const expiryTicks = 720;
const stableWave = 1;

export const XENO_TRIALS_ARCHIVE_OPERATION_V225 = Object.freeze({
  id: 'xto225-archive-handoff', kind: 'relay', title: 'ARCHIVES SOUS VERROU', label: 'ARCHIVES SOUS VERROU',
  stageId: 'xt179-archives', hordeProtocolId: 'xth225-archive-raid', difficulty: 'easy', factionId: 'containment',
  roundSeconds: 165, reward: 590, instruction: orders, description: orders, startX: 650, cargoStartX: 650, cargoEndX: 650,
  // The shared operation ledger records one acquired copy and its transmission.
  // The actual choice and both candidates' charges belong to the route state.
  objectives: Object.freeze([Object.freeze({ ...routes[0], id: 'archive-copy' }), terminal]), archiveTransferV225: true,
  canonExact: false, canonStatus: 'original-tantalus-simulation', revision: 225
});

const integer = (value, min, max) => Number.isSafeInteger(value) && value >= min && value <= max;
const stableAvailable = match => match?.hordeV180?.protocolId === XENO_TRIALS_ARCHIVE_OPERATION_V225.hordeProtocolId
  && match.hordeV180.wavesCleared >= stableWave;
const remainingAfter = (tick, selectionTick) => Math.max(0, expiryTicks - (tick - selectionTick));
const integrity = remaining => Math.ceil(100 * remaining / expiryTicks);

export function createXenoTrialsArchiveTransferV225() {
  return { route: null, tick: null, charges: [0, 0] };
}

export function advanceXenoTrialsArchiveTransferV225(state, match, contact, complete) {
  const selection = state.archiveTransferV225;
  if (selection.route === null) {
    const stable = stableAvailable(match);
    for (const [index, objective] of routes.entries()) {
      const charging = (index === 0 || stable) && contact(objective);
      selection.charges[index] = charging ? selection.charges[index] + 1 : Math.max(0, selection.charges[index] - 2);
      if (selection.charges[index] === objective.requiredTicks) {
        selection.route = index;
        selection.tick = state.lastTick;
        selection.charges[1 - index] = 0;
        complete(0);
        break;
      }
    }
    return;
  }
  if (selection.route === 0) state.integrity = integrity(remainingAfter(state.lastTick, selection.tick));
  if (state.integrity === 0) return;
  state.progress[1] = contact(terminal) ? state.progress[1] + 1 : Math.max(0, state.progress[1] - 2);
  if (state.progress[1] === terminal.requiredTicks) complete(1);
}

export function validateXenoTrialsArchiveTransferV225(state, match) {
  const selection = state.archiveTransferV225;
  if (!selection || Object.keys(selection).length !== 3 || !Array.isArray(selection.charges) || selection.charges.length !== routes.length
    || selection.charges.some((charge, index) => !integer(charge, 0, Math.min(routes[index].requiredTicks, state.elapsedTicks)))) return false;
  const { route, tick, charges } = selection;
  if (route === null) return tick === null && !state.completed[0] && state.progress[0] === 0 && state.integrity === 100
    && charges.every((charge, index) => charge < routes[index].requiredTicks)
    && charges[0] + charges[1] <= state.elapsedTicks && (charges[1] === 0 || !match || stableAvailable(match));
  if (!integer(route, 0, routes.length - 1) || !state.completed[0] || charges[route] !== routes[route].requiredTicks
    || charges[1 - route] !== 0 || !integer(tick, state.startedTick + routes[route].requiredTicks, state.lastTick)
    || state.progress[1] > state.lastTick - tick) return false;
  if (route === 1) return state.integrity === 100 && (!match || stableAvailable(match));

  // KO and the match clock finish before updating the copy on that last tick.
  const completedBeforeStep = state.status === 'failed' && ['player-ko', 'time'].includes(state.failureReason);
  const sampledTick = Math.max(tick, state.lastTick - Number(completedBeforeStep));
  const remaining = remainingAfter(sampledTick, tick);
  return sampledTick - tick <= expiryTicks && state.integrity === integrity(remaining)
    && (remaining > 0 || state.failureReason === 'structure-destroyed');
}

export function isXenoTrialsArchiveTransferForwardV225(previous, next) {
  const before = previous.archiveTransferV225, after = next.archiveTransferV225;
  if (!after || !Array.isArray(after.charges)) return false;
  if (before.route !== null) return after.route === before.route && after.tick === before.tick
    && after.charges.every((charge, index) => charge === before.charges[index]);
  const lastChargeTick = after.route === null ? next.lastTick : after.tick;
  return (after.route === null || lastChargeTick > previous.lastTick)
    && after.charges.every((charge, index) => charge - before.charges[index] <= lastChargeTick - previous.lastTick);
}

export function getXenoTrialsArchiveTransferV225(match) {
  const state = match?.operationV188;
  if (state?.operationId !== XENO_TRIALS_ARCHIVE_OPERATION_V225.id) return null;
  const { route, tick, charges } = state.archiveTransferV225;
  const stable = stableAvailable(match);
  const remainingTicks = route === 0 ? remainingAfter(state.lastTick, tick) : null;
  return { route, stable, remainingTicks, durationTicks: expiryTicks,
    phases: routes.map((objective, index) => route === index ? 'copied' : route !== null || index === 1 && !stable ? 'locked' : 'ready'),
    progress: routes.map((objective, index) => charges[index] / objective.requiredTicks),
    transmission: state.progress[1] / terminal.requiredTicks };
}

export function getXenoTrialsArchiveTargetsV225(match, view) {
  const state = match.operationV188;
  const entities = routes.map((objective, index) => ({ ...objective, active: view.phases[index] === 'ready',
    locked: view.phases[index] === 'locked', completed: view.route === index, progress: state.archiveTransferV225.charges[index] }));
  const uplink = { ...terminal, active: view.route !== null && state.status === 'active', locked: view.route === null,
    completed: state.completed[1], progress: state.progress[1] };
  const playerX = match.fighters?.[0]?.x;
  const target = view.route === null ? entities[Number(playerX > terminal.x)] : uplink;
  return { entities: [...entities, uplink], target: state.status === 'active' ? target : null };
}
