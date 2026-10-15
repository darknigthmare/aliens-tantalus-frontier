const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
};

/** Local centres are authored around the actual service decks and stations.
 * Floor furniture rests at the rear service foot600. Upper stock is reachable
 * from a real landing; emergency equipment belongs at standing hand height.
 * The mess returns trays and serves chilled drinks; cooking has its own room. */
export const HUB_FURNISHING_CRITICAL_OVERRIDES_V138 = freeze({
  medical: {
    task: 'bedside-care-and-accessible-sterile-stock',
    replaceKinds: ['bitmap'],
    items: [
      { kind: 'medical-cabinet', x: 994, width: 58, height: 95,
        role: 'bedside-sterile-cabinet', support: 'rear-floor' },
      { cell: 'medical-trolley', x: 644, width: 48, atlas: 136,
        role: 'mobile-bedside-preparation', support: 'rear-floor' },
      { cell: 'sterile-cabinet', x: 754, width: 80, y: 292, atlas: 136,
        role: 'upper-sterile-preparation-supply', support: 'rear-wall' },
      { cell: 'emergency-cabinet', x: 1110, width: 38, y: 535, atlas: 137,
        role: 'clinical-emergency-kit', support: 'rear-wall' }
    ]
  },
  mess: {
    task: 'shared-dining-tray-return-and-chilled-drinks',
    replaceKinds: ['galley', 'chair'],
    items: [
      { kind: 'bench', x: 620, width: 88, height: 36,
        role: 'mess-tray-return-bench', support: 'rear-floor' },
      { cell: 'galley-rack', x: 620, width: 64, y: 420, atlas: 136,
        role: 'mess-tray-return-stock', support: 'rear-wall' },
      { cell: 'food-refrigerator', x: 936, width: 78, atlas: 137,
        role: 'chilled-drink-storage', support: 'rear-floor' }
    ]
  },
  'science-lab': {
    task: 'clean-preparation-and-accessible-sample-stock',
    replaceKinds: ['lab-bench', 'sample-fridge'],
    items: [
      { kind: 'lab-bench', x: 682, width: 100, height: 70,
        role: 'sample-preparation-counter', support: 'rear-floor' },
      { kind: 'sample-fridge', x: 200, width: 54, height: 106,
        role: 'sample-cold-storage', support: 'rear-floor' },
      { cell: 'emergency-cabinet', x: 490, width: 36, y: 535, atlas: 137,
        role: 'laboratory-emergency-kit', support: 'rear-wall' },
      { cell: 'medical-trolley', x: 570, width: 48, atlas: 136,
        role: 'mobile-sample-preparation', support: 'rear-floor' },
      { cell: 'sterile-cabinet', x: 712, width: 80, y: 420, atlas: 136,
        role: 'catwalk-sterile-preparation-stock', support: 'rear-wall' }
    ]
  },
  quarantine: {
    task: 'reachable-decontamination-and-sealed-service',
    replaceKinds: ['medical-cabinet'],
    items: [
      { kind: 'medical-cabinet', x: 730, width: 58, height: 106,
        role: 'sealed-clean-storage', support: 'rear-floor' },
      { cell: 'emergency-cabinet', x: 1050, width: 40, y: 535, atlas: 137,
        role: 'containment-emergency-kit', support: 'rear-wall' },
      { kind: 'valves', x: 995, width: 50, height: 72, y: 522,
        role: 'decontamination-flow-controls', support: 'rear-wall' }
    ]
  }
});
