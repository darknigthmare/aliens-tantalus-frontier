const id = 'xto213-load-balancing';
const stageId = 'tantalus-cargo';
const instruction = 'Rapportez les caissons au dépôt. Chaque caisson arme la rampe de sa voie jusqu’à sa livraison. Traversez entre les décharges ou sautez par-dessus.';
const supply = (number, x) => Object.freeze({ id: `transfer-${number}`, kind: 'supply', label: `Caisson ${number}`,
  x, y: 0, radius: 82, requiredTicks: 48 });

export const XENO_TRIALS_CARGO_OPERATION_V213 = Object.freeze({
  id, stageId, kind: 'extraction', title: 'TRANSFERT SOUS TENSION', label: 'TRANSFERT SOUS TENSION',
  description: instruction, instruction, hordeProtocolId: 'xth180-extraction-1', difficulty: 'easy', factionId: 'containment',
  roundSeconds: 150, reward: 420, startX: 110, cargoStartX: 110, cargoEndX: 110,
  depot: Object.freeze({ id: 'depot', kind: 'depot', label: 'Dépôt de récupération', x: 650, y: 0, radius: 82, requiredTicks: 66 }),
  exit: Object.freeze({ id: 'exit', kind: 'exit', label: 'Sas d’extraction', x: 1460, y: 0, radius: 96, requiredTicks: 108 }),
  objectives: Object.freeze([supply(1, 145), supply(2, 1240), supply(3, -210)]),
  canonExact: false, canonStatus: 'original-tantalus-simulation', revision: 213
});

export const XENO_TRIALS_CARGO_HAZARD_V213 = Object.freeze({
  id: 'xhz213-cargo-interlock', stageId, operationId: id, kind: 'arc',
  label: 'RAMPE DE TRANSFERT', hint: 'Sautez la bande au sol ou attendez hors de sa portée.', color: '#91d7ed',
  anchors: Object.freeze([350, 955]), width: 126, bottom: 0, height: 38,
  graceTicks: 96, warningTicks: 225, activeTicks: 96, periodTicks: 480, hitIntervalTicks: 120, damage: 7,
  affectsCombat: true, canonExact: false, canonStatus: 'original-tantalus-simulation'
});

const circuitIndexByCrate = [0, 1, 0];

/** A cradle powers its nearby ramp only while its crate is in transport.
 * Delivery releases the interlock. The validated cargo ledger supplies the
 * entire switch state on resume and the native hazard clock never resets. */
export function applyXenoTrialsCargoInterlockV213(view, definition, operation) {
  if (!view || definition !== XENO_TRIALS_CARGO_HAZARD_V213 || operation?.operationId !== id) return view;
  const activeIndex = circuitIndexByCrate[operation.carrying];
  const circuits = definition.anchors.map((anchor, index) => ({
    id: index === 0 ? 'A' : 'B', armed: activeIndex === index,
    left: anchor - definition.width / 2, right: anchor + definition.width / 2
  }));
  const circuit = circuits[activeIndex];
  const cargoInterlockV213 = { circuits, armed: circuit?.id ?? null };
  if (!circuit) return { ...view, phase: 'idle', zones: [], remainingTicks: 0, warningProgress: 0, activeProgress: 0, cargoInterlockV213 };
  const zones = view.phase === 'idle' ? []
    : [{ left: circuit.left, right: circuit.right, bottom: definition.bottom, top: definition.height }];
  return { ...view, zones, cargoInterlockV213 };
}
