// Developer visibility is session-only convenience, never an authentication boundary.
export function isLocalDeveloperEnvironmentV119(hostname = '') {
  return ['localhost', '127.0.0.1', '[::1]', '::1'].includes(String(hostname).toLowerCase());
}

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
  const original = String(name || '').trim();
  const parts = original.split(/\s+—\s+/);
  const receipt = /^(?:pack\s+\d+\b|lot\s+AlienTentalus\b|référence(?:\s+utilisateur)?(?:\s+\d+\b|$)|adaptation\b|design\s+utilisateur\b)/i;
  // Match source-work segments, not every occurrence of "Alien" in an identity.
  // A supplied descriptive label replaces an anonymous numbered import heading.
  const sourceWork = /^(?:Aliens?(?:\s*(?::|\(\d{4}\)|$)|\s+vs\.?\s+Predator\b)|Prometheus(?:\s*\(\d{4}\))?$|(?:Fireteam Elite|Dark Descent|Colonial Marines|Primal Hunt)\b)/i;
  const identity = parts.filter((part, index) => !receipt.test(part) && (index === 0 || !sourceWork.test(part)));
  // An entirely anonymous reference must still have a recoverable label.
  if (!identity.length) return original;
  const label = identity.join(' — ');
  return receipt.test(parts[0]) ? label.replace(/^./u, letter => letter.toUpperCase()) : label;
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
