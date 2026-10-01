// Developer visibility is session-only convenience, never an authentication boundary.
export function isDeveloperShortcutV110(event) {
  const target = event?.target;
  return Boolean(event && !event.repeat && !event.isComposing && event.ctrlKey && event.altKey && event.shiftKey
    && event.code === 'KeyP' && !target?.isContentEditable
    && !['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName));
}

export function resolvePlayerViewV110(view, developerMode = false) {
  return view === 'operations' && !developerMode ? 'command' : view;
}

const PLAYER_STATS = new Set(['health', 'damage', 'armor', 'speed', 'acid', 'role', 'behavior', 'utility',
  'fireRate', 'penetration', 'magazine', 'reload', 'mass', 'hull', 'seats', 'cargo', 'charges']);
export function playerCatalogStatsV110(stats = {}) {
  return Object.fromEntries(Object.entries(stats).filter(([key]) => PLAYER_STATS.has(key)));
}

// Presentation only: retain identity and Altered variants, not import-batch receipts.
export function playerCatalogNameV110(name) {
  return String(name || '').replace(/\s+—\s+Pack\s+\d+.*$/i, '')
    .replace(/\s+—\s+Aliens: Fireteam Elite\s+—\s+adaptation de synthétique$/i, '')
    .replace(/\s+—\s+(?:adaptation (?:2D|du projet)|design utilisateur).*$/i, '');
}

export function getCommandMissionsV110(save, campaigns, worldId = '') {
  const unlocked = new Set(save?.galaxy?.unlockedWorldIds || []);
  const activeId = save?.strategy?.currentOperation?.campaignId;
  return campaigns.filter(campaign => (campaign.id === activeId || unlocked.has(campaign.worldId))
    && (!worldId || campaign.worldId === worldId || campaign.id === activeId));
}

export function commandMetricsV110(save) {
  const systems = save?.hub?.systems || {};
  return [['COQUE', `${Math.round(systems.hull || 0)}%`], ['ÉNERGIE', `${Math.round(systems.power || 0)}%`],
    ['ROUTES OUVERTES', save?.galaxy?.unlockedWorldIds?.length || 0],
    ['SORTIES ACCOMPLIES', save?.galaxy?.completedCampaignIds?.length || 0]];
}
