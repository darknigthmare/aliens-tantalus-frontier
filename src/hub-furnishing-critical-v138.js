const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
};

/** Local centres are authored around the actual service decks and stations.
 * Floor furniture uses the shared rear-service support plane. Upper stock is reachable
 * from a real landing; emergency equipment belongs at standing hand height.
 * The mess returns trays and serves chilled drinks; cooking has its own room. */
export const HUB_FURNISHING_CRITICAL_OVERRIDES_V138 = freeze({
  medical: {
    task: 'bedside-care-and-accessible-sterile-stock',
    replaceKinds: ['bitmap'],
    items: [
      { kind: 'medical-cabinet', x: 994, width: 58, height: 95,
        role: 'bedside-sterile-cabinet', support: 'rear-floor' },
      { kind: 'work-counter', x: 605, width: 112, height: 48,
        role: 'clinical-preparation-counter', support: 'rear-floor' },
      { cell: 'medical-trolley', x: 697, width: 48, atlas: 136,
        role: 'mobile-bedside-preparation', support: 'rear-floor' },
      { cell: 'sterile-cabinet', x: 754, width: 44, y: 280, atlas: 136,
        role: 'upper-sterile-preparation-supply', support: 'rear-wall' },
      { cell: 'emergency-cabinet', x: 1110, width: 38, y: 535, atlas: 137,
        role: 'clinical-emergency-kit', support: 'rear-wall' },
      { cell: 'wall-handwash', x: 940, width: 40, atlas: 139, workSurfaceHeightV139: 52,
        role: 'clinical-handwash', support: 'rear-wall' }
    ]
  },
  mess: {
    task: 'shared-dining-tray-return-and-chilled-drinks',
    replaceKinds: ['galley', 'chair', 'bench'],
    items: [
      { kind: 'work-counter', x: 365, width: 82, height: 52,
        role: 'mess-tray-return-counter', support: 'rear-floor' },
      { cell: 'galley-rack', x: 365, width: 64, y: 524, atlas: 136,
        role: 'mess-tray-return-stock', support: 'rear-wall' },
      { cell: 'food-refrigerator', x: 936, width: 78, atlas: 137,
        role: 'chilled-drink-storage', support: 'rear-floor' },
      { cell: 'seat-side', x: 520, width: 40, atlas: 139, mirroredV139: true,
        role: 'mess-west-dining-seat', support: 'rear-floor' },
      { cell: 'seat-side', x: 744, width: 40, atlas: 139,
        role: 'mess-east-dining-seat', support: 'rear-floor' }
    ]
  },
  'science-lab': {
    task: 'clean-preparation-and-accessible-sample-stock',
    replaceKinds: ['lab-bench', 'sample-fridge', 'bitmap'],
    items: [
      { kind: 'work-counter', x: 700, width: 80, height: 46,
        role: 'sample-preparation-counter', support: 'rear-floor' },
      { kind: 'sample-fridge', x: 200, width: 54, height: 106,
        role: 'sample-cold-storage', support: 'rear-floor' },
      { cell: 'emergency-cabinet', x: 490, width: 36, y: 535, atlas: 137,
        role: 'laboratory-emergency-kit', support: 'rear-wall' },
      { cell: 'medical-trolley', x: 600, width: 48, atlas: 136,
        role: 'mobile-sample-preparation', support: 'rear-floor' },
      { cell: 'sterile-cabinet', x: 710, width: 70, y: 420, atlas: 136,
        role: 'catwalk-sterile-preparation-stock', support: 'rear-wall' }
    ]
  },
  quarantine: {
    task: 'reachable-decontamination-and-sealed-service',
    replaceKinds: ['medical-cabinet', 'bitmap'],
    items: [
      { kind: 'medical-cabinet', x: 700, width: 58, height: 106,
        role: 'sealed-clean-storage', support: 'rear-floor' },
      { cell: 'emergency-cabinet', x: 1050, width: 40, y: 535, atlas: 137,
        role: 'containment-emergency-kit', support: 'rear-wall' },
      { kind: 'valves', x: 995, width: 50, height: 72, y: 522,
        role: 'decontamination-flow-controls', support: 'rear-wall' },
      { cell: 'wall-handwash', x: 640, width: 40, atlas: 139, workSurfaceHeightV139: 52,
        role: 'containment-handwash', support: 'rear-wall' },
      { kind: 'work-counter', x: 480, width: 90, height: 46,
        role: 'containment-clean-preparation', support: 'rear-floor' }
    ]
  }
});
