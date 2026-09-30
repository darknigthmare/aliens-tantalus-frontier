import { ENEMY_ENCYCLOPEDIA_CATALOG_V88 } from './enemy-user-campaign-v88.js';
const IDS = new Set(ENEMY_ENCYCLOPEDIA_CATALOG_V88.map(entry => entry.id));
const text = value => typeof value === 'string' ? value.slice(0, 160) : '';
const count = value => Math.max(0, Math.min(999999, Math.trunc(Number(value) || 0)));
export function sanitizeEnemyDiscoveryV88(raw) {
  const entries = {};
  if (raw?.schema === 88 && raw.entries && typeof raw.entries === 'object' && !Array.isArray(raw.entries)) {
    for (const [id, entry] of Object.entries(raw.entries).slice(0, IDS.size)) {
      if (!IDS.has(id) || !entry || typeof entry !== 'object') continue;
      entries[id] = { seen: true, defeated: count(entry.defeated), firstWorldId: text(entry.firstWorldId),
        firstCampaignId: text(entry.firstCampaignId), lastWorldId: text(entry.lastWorldId),
        specimenReceipts: [...new Set((Array.isArray(entry.specimenReceipts) ? entry.specimenReceipts : []).filter(v => typeof v === 'string').map(text))].slice(-64) };
    }
  }
  return { schema: 88, entries };
}
/** Campaign events only. The caller owns persistence; BIOFORGE never records a discovery. */
export function recordEnemyDiscoveryV88(save, event) {
  if (!save || event?.scope !== 'campaign' || !IDS.has(event.profileId)
    || !['enemy-discovered-v88', 'enemy-defeated-v88'].includes(event.type)) return false;
  const state = sanitizeEnemyDiscoveryV88(save.enemyDiscoveryV88), existing = state.entries[event.profileId];
  const entry = existing || { seen: true, defeated: 0, firstWorldId: text(event.worldId),
    firstCampaignId: text(event.campaignId), lastWorldId: text(event.worldId), specimenReceipts: [] };
  const receipt = text(event.receipt);
  if (event.type === 'enemy-defeated-v88' && receipt && !entry.specimenReceipts.includes(receipt)) {
    entry.defeated = count(entry.defeated + 1); entry.specimenReceipts = [...entry.specimenReceipts, receipt].slice(-64);
  } else if (existing && event.type === 'enemy-discovered-v88') return false;
  entry.lastWorldId = text(event.worldId); state.entries[event.profileId] = entry; save.enemyDiscoveryV88 = state;
  return true;
}
export function getEnemyDiscoveryV88(state, id) {
  const entry = sanitizeEnemyDiscoveryV88(state).entries[id];
  return entry ? { ...entry, status: entry.defeated ? 'neutralized' : 'observed' } : { seen: false, defeated: 0, status: 'undiscovered' };
}
