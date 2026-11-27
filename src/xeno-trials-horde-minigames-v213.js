const layouts = [
  {
    id: 'xth213-airlock-relay', title: 'BASCULE DES SAS', stageId: 'containment-deck',
    description: 'Trois vagues faibles. Le sas ouest ouvre en premier, puis le sas est. La dernière vague entre par les deux côtés.',
    orders: 'Profitez de la pause entre les vagues pour changer de position. Repliez-vous vers le centre quand les deux sas s’ouvrent.',
    roundSeconds: 150, reward: 320,
    waves: [
      ['left', 'ÉCLAIREURS', ['runner', 'prowler'], 4, 3, 15, .23],
      ['right', 'APPUI À DISTANCE', ['spitter', 'runner', 'warrior'], 5, 3, 18, .25],
      ['split', 'PINCE', ['runner', 'warrior', 'prowler', 'spitter'], 5, 4, 20, .27]
    ]
  },
  {
    id: 'xth213-dock-crossfire', title: 'TENAILLE DU QUAI', stageId: 'tantalus-cargo',
    description: 'Deux accès livrent des éclaireurs, puis l’accès est fournit des tireurs. L’assaut final vient de l’ouest.',
    orders: 'Surveillez les deux accès au départ. Fermez la distance sur les tireurs à l’est avant de vous tourner vers la ligne ouest.',
    roundSeconds: 165, reward: 360,
    waves: [
      ['split', 'ÉCLAIREURS', ['runner', 'prowler', 'runner'], 5, 4, 16, .24],
      ['right', 'APPUI À DISTANCE', ['synth-sniper', 'synth-trooper', 'synth-guard'], 5, 3, 20, .27],
      ['left', 'LIGNE D’ASSAUT', ['warrior', 'runner', 'armored-runner'], 6, 4, 24, .30]
    ]
  },
  {
    id: 'xth213-reactor-switchback', title: 'RELÈVE DU RÉACTEUR', stageId: 'reactor-ring',
    description: 'Quatre vagues fragiles. Les unités de maintenance arrivent à l’est, puis le cordon se divise. Une meute surgit à l’ouest avant l’assaut sur les deux sas.',
    orders: 'Éloignez-vous du sas est avant l’arrivée du cordon. Gardez de l’espace au centre pour éviter d’être pris entre les deux accès.',
    roundSeconds: 180, reward: 420,
    waves: [
      ['right', 'UNITÉS DE MAINTENANCE', ['synth-trooper', 'synth-guard'], 4, 3, 15, .20],
      ['split', 'CORDON DE QUARANTAINE', ['runner', 'synth-sniper', 'prowler'], 6, 4, 17, .22],
      ['left', 'MEUTE DE CONFINEMENT', ['prowler', 'runner', 'warrior'], 5, 3, 19, .24],
      ['split', 'RUPTURE DU CORDON', ['spitter', 'synth-trooper', 'armored-runner'], 6, 4, 23, .25]
    ]
  },
  {
    id: 'xth218-bridge-retake', title: 'REPRISE DE LA PASSERELLE', stageId: 'xt179-bridge',
    description: 'Des unités de sécurité entrent par l’ouest. Le détachement de relève prend le sas est avant un assaut des deux côtés.',
    orders: 'Repoussez le premier détachement, puis quittez le sas est avant l’assaut final. Les unités de tir couvrent les accès au poste central.',
    roundSeconds: 150, reward: 360,
    waves: [
      ['left', 'PATROUILLE DE SÉCURITÉ', ['synth-trooper', 'synth-guard', 'runner'], 4, 3, 15, .20],
      ['right', 'DÉTACHEMENT DE RELÈVE', ['synth-sniper', 'synth-trooper', 'prowler'], 5, 3, 17, .22],
      ['split', 'ASSAUT SUR LA PASSERELLE', ['synth-guard', 'runner', 'spitter'], 5, 4, 21, .24]
    ]
  }
];

export const XENO_TRIALS_HORDE_MINIGAMES_V213 = Object.freeze(layouts.map(layout => {
  const waves = Object.freeze(layout.waves.map(([ingress, label, opponentIds, total, concurrent, hp, damageScale], index) =>
    Object.freeze({ index, label, opponentIds: Object.freeze(opponentIds), total, concurrent, hp, damageScale, ingressV213: ingress })));
  return Object.freeze({ ...layout, label: layout.title, difficulty: 'easy', factionId: 'containment',
    rules: Object.freeze({}), waves, opponentIds: Object.freeze([...new Set(waves.flatMap(wave => wave.opponentIds))]),
    totalEnemies: waves.reduce((sum, wave) => sum + wave.total, 0),
    canonExact: false, canonStatus: 'original-tantalus-simulation' });
}));

const byId = new Map(XENO_TRIALS_HORDE_MINIGAMES_V213.map(protocol => [protocol.id, protocol]));
export const getXenoTrialsHordeMinigameV213 = id => byId.get(id) || null;

const sides = Object.freeze({ left: 'SAS OUEST', right: 'SAS EST' });
export function getXenoTrialsHordeGateV213(wave, slotIndex) {
  if (!wave?.ingressV213 || !Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex >= wave.total) return null;
  const split = wave.ingressV213 === 'split';
  const side = split ? slotIndex % 2 === 0 ? 'left' : 'right' : wave.ingressV213;
  const laneSlot = split ? Math.floor(slotIndex / 2) : slotIndex;
  const spacing = laneSlot % 3 * 96;
  return { side, x: side === 'left' ? -220 - spacing : 1220 + spacing };
}

export function getXenoTrialsHordeGateCueV213(wave, startSlot, contacts) {
  if (!wave?.ingressV213) return null;
  const counts = { left: 0, right: 0 };
  for (let index = startSlot; index < startSlot + contacts; index++) {
    const gate = getXenoTrialsHordeGateV213(wave, index);
    if (gate) counts[gate.side]++;
  }
  const gates = Object.keys(counts).filter(side => counts[side] > 0);
  return { gateLabel: gates.length === 2 ? 'DEUX SAS' : sides[gates[0]], counts, waveRole: wave.label };
}
