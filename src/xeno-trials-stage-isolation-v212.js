const instruction = 'Coupez les deux circuits dans l’ordre indiqué, puis validez la mise en sécurité au dernier poste.';

const layouts = [
  {
    suffix: 'pressure', stageId: 'containment-deck', title: 'ISOLEMENT DES CIRCUITS DE PRESSION',
    kind: 'steam', label: 'DÉCHARGE DE VAPEUR', hint: 'Quittez le conduit balisé avant la décharge.',
    color: '#b5d5d7', height: 150, damage: 6, activeTicks: 60,
    anchors: [405, 900], terminals: [620, 770, 1150], startX: 170, protocol: 'incoming'
  },
  {
    suffix: 'coolant', stageId: 'reactor-ring', title: 'ISOLEMENT DU REFROIDISSEMENT',
    kind: 'cryo', label: 'PURGE CRYOGÉNIQUE', hint: 'Franchissez la purge après le signal.',
    color: '#a2c4ec', height: 22, damage: 5, activeTicks: 84,
    anchors: [935, 410], terminals: [730, 570, 160], startX: 1190, protocol: 'blackout'
  }
];

const freeze = value => {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

function contract(layout) {
  const id = `xto212-${layout.suffix}-isolation`;
  return {
    id, kind: 'relay', title: layout.title, label: layout.title, stageId: layout.stageId,
    hordeProtocolId: `xth180-${layout.protocol}-1`, difficulty: 'easy', factionId: 'containment',
    instruction, description: instruction, roundSeconds: 125, reward: 350, startX: layout.startX,
    cargoStartX: layout.startX, cargoEndX: layout.startX, isolationV212: true,
    objectives: layout.terminals.map((x, index) => ({
      id: `isolation-${index + 1}`, kind: 'terminal', label: ['Circuit A', 'Circuit B', 'Validation de sécurité'][index],
      x, y: 0, radius: 76, requiredTicks: [108, 120, 72][index]
    })),
    revision: 212, canonExact: false, canonStatus: 'original-tantalus-simulation'
  };
}

export const XENO_TRIALS_ISOLATION_OPERATIONS_V212 = freeze(layouts.map(contract));
const operations = new Map(XENO_TRIALS_ISOLATION_OPERATIONS_V212.map(operation => [operation.id, operation]));
export const getXenoTrialsIsolationOperationV212 = id => operations.get(id) || null;

export const XENO_TRIALS_ISOLATION_HAZARDS_V212 = freeze(layouts.map((layout, index) => ({
  id: `xhz212-${layout.suffix}-isolation`, stageId: layout.stageId,
  operationId: XENO_TRIALS_ISOLATION_OPERATIONS_V212[index].id,
  kind: layout.kind, label: layout.label, hint: layout.hint, color: layout.color,
  anchors: layout.anchors, width: 120, bottom: 0, height: layout.height,
  damage: layout.damage, activeTicks: layout.activeTicks, hitIntervalTicks: 120,
  graceTicks: 72, warningTicks: 480, periodTicks: 900,
  affectsCombat: true, canonExact: false, canonStatus: 'original-tantalus-simulation'
})));

// Reconstruct which physical circuits are isolated from the existing relay
// receipt. The clock and contact ledger retain their original meanings.
export function applyXenoTrialsStageIsolationV212(view, definition, operation, stageHazards) {
  if (!view || !definition?.operationId || operation?.operationId !== definition.operationId) return view;
  const circuits = definition.anchors.map((anchor, index) => ({
    id: index === 0 ? 'A' : 'B', isolated: operation.completed[index] === true,
    left: anchor - definition.width / 2, right: anchor + definition.width / 2
  }));
  const scheduled = circuits[(view.cycle + stageHazards.seed % circuits.length) % circuits.length];
  const isolationV212 = { circuits, isolated: circuits.filter(circuit => circuit.isolated).length, scheduled: scheduled.id };
  return scheduled.isolated
    ? { ...view, phase: 'idle', zones: [], remainingTicks: 0, warningProgress: 0, activeProgress: 0, isolationV212 }
    : { ...view, isolationV212 };
}
