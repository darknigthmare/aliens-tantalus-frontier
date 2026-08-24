const asset = (key, path, columns, rows) => Object.freeze({
  key,
  path,
  columns,
  rows,
  frameCount: columns * rows
});

export const MISSION_INTERACTIVE_ART_FILES_V56 = Object.freeze({
  hazardDarkness: '/assets/openai/metroidvania/hazards/darkness-visibility-mask-cycle.png',
  hazardFire: '/assets/openai/metroidvania/hazards/fire-hazard-cycle.png',
  hazardFloodRipple: '/assets/openai/metroidvania/hazards/flood-ripple-splash-cycle.png',
  hazardFloodWaterline: '/assets/openai/metroidvania/hazards/flood-waterline-tiles.png',
  hazardRadiation: '/assets/openai/metroidvania/hazards/radiation-exposure-cycle.png',
  hazardSteam: '/assets/openai/metroidvania/hazards/steam-jet-cycle.png',
  hazardVacuumAirflow: '/assets/openai/metroidvania/hazards/vacuum-breach-airflow-cycle.png',
  hazardVacuumOverlay: '/assets/openai/metroidvania/hazards/vacuum-frost-debris-overlay.png',
  dropAmmo: '/assets/openai/metroidvania/drops/ammo-drop-sheet.png',
  dropArmor: '/assets/openai/metroidvania/drops/armor-drop-sheet.png',
  dropMedkit: '/assets/openai/metroidvania/drops/medkit-drop-sheet.png',
  dropSalvage: '/assets/openai/metroidvania/drops/salvage-drop-sheet.png',
  dropSecurityKey: '/assets/openai/metroidvania/drops/security-key-drop-sheet.png',
  terminalColony: '/assets/openai/metroidvania/terminals/colony-medical-archive-terminal-sheet.png',
  terminalPlanet: '/assets/openai/metroidvania/terminals/planet-field-archive-beacon-sheet.png',
  terminalShip: '/assets/openai/metroidvania/terminals/ship-command-archive-terminal-sheet.png'
});

const file = (key, columns = 4, rows = 4) =>
  asset(key, MISSION_INTERACTIVE_ART_FILES_V56[key], columns, rows);

export const MISSION_HAZARD_ART_V56 = Object.freeze({
  fire: Object.freeze({ world: file('hazardFire'), renderHeight: 112, fps: 9 }),
  steam: Object.freeze({ world: file('hazardSteam'), renderHeight: 148, fps: 10 }),
  radiation: Object.freeze({ world: file('hazardRadiation'), renderHeight: 104, fps: 7 }),
  darkness: Object.freeze({ world: file('hazardDarkness'), renderHeight: 220, fps: 5 }),
  flood: Object.freeze({
    world: file('hazardFloodWaterline', 4, 2),
    accent: file('hazardFloodRipple'),
    renderHeight: 92,
    fps: 8
  }),
  vacuum: Object.freeze({
    world: file('hazardVacuumAirflow'),
    foreground: file('hazardVacuumOverlay', 1, 1),
    renderHeight: 156,
    fps: 9
  })
});

export const MISSION_DROP_ART_V56 = Object.freeze({
  ammo: file('dropAmmo', 2, 2),
  armor: file('dropArmor', 2, 2),
  medkit: file('dropMedkit', 2, 2),
  salvage: file('dropSalvage', 2, 2),
  'security-key': file('dropSecurityKey', 2, 2)
});

export const MISSION_ARCHIVE_ART_V56 = Object.freeze({
  'ship-interior-vertical': file('terminalShip', 2, 2),
  'colony-multiroute': file('terminalColony', 2, 2),
  'planet-exterior': file('terminalPlanet', 2, 2)
});

export const MISSION_INTERACTIVE_ART_ASSET_COUNT_V56 =
  Object.keys(MISSION_INTERACTIVE_ART_FILES_V56).length;

export function resolveMissionHazardArtV56(kind) {
  return MISSION_HAZARD_ART_V56[String(kind || '').trim()] || null;
}

export function resolveMissionDropArtV56(type) {
  return MISSION_DROP_ART_V56[String(type || '').trim()] || null;
}

export function resolveMissionArchiveArtV56(templateId) {
  return MISSION_ARCHIVE_ART_V56[String(templateId || '').trim()]
    || MISSION_ARCHIVE_ART_V56['ship-interior-vertical'];
}
