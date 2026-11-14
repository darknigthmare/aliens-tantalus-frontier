// V188 — Port-Méridien reconstruction (bible §6.3). Seven sites with three
// levels, each tied to a charter viability criterion. Pure rules; the save
// field `colonyV188` is additive. Values marked [PROPOSÉ] are in bible §56.8.

const t = (fr, en) => Object.freeze({ fr, en });
const canAfford = (save, cost) => Object.entries(cost).every(([key, value]) => Number(save?.galaxy?.resources?.[key]) >= value);
const site = (id, criterion, levels, leads) => Object.freeze({ id, criterion, levels: Object.freeze(levels), leads });

export const COLONY_SITES_V188 = Object.freeze([
  site('atmosphere', t('Air', 'Air'), [t('Air respirable au port', 'Breathable air in the port'), t('Serres pressurisées', 'Pressurised greenhouses'), t('Exportation d’air vers les hameaux', 'Air exported to the hamlets')], 'Jun Park'),
  site('infirmary', t('Santé', 'Health'), [t('Triage stable', 'Stable triage'), t('Bloc et contrôle biologique', 'Theatre and biological screening'), t('Isolement complet', 'Full isolation')], 'Lucia Ferro, Noor Okafor'),
  site('walls', t('Sécurité', 'Security'), [t('Sas soudés', 'Welded airlocks'), t('Mur nord', 'North wall'), t('Tourelles sentinelles', 'Sentry turrets')], 'Sanaa Doyle, Pablo Reyes'),
  site('power', t('Énergie', 'Power'), [t('Générateurs de secours', 'Backup generators'), t('Réseau du port', 'Port grid'), t('Réseau partagé avec Asphodèle', 'Grid shared with Asphodèle')], 'Idris Kwan'),
  site('comms', t('Contact', 'Contact'), [t('Balise locale', 'Local beacon'), t('Relais indépendant du réseau QZ', 'Relay independent of the QZ network'), t('Liaison directe hors compagnie', 'Direct link outside the company')], 'Rook, Asha Mbaye'),
  site('docks', t('Ravitaillement', 'Supply'), [t('Une plate-forme', 'One platform'), t('Dépôt de ravitaillement', 'Supply depot'), t('Port ouvert aux convois civils', 'Port open to civilian convoys')], 'Cal Mercer, Maksim Orlov'),
  site('habitat', t('Population', 'Population'), [t('Dortoirs', 'Dormitories'), t('Quartiers familiaux', 'Family quarters'), t('Accueil de nouveaux colons', 'Welcoming new colonists')], 'Adèle Sarrazin')
]);
export const COLONY_SITE_IDS_V188 = Object.freeze(COLONY_SITES_V188.map(entry => entry.id));
export const COLONY_WORLD_ID_V188 = 'world-05-lethe'; // Cocyte, where Port-Méridien and the QZ relays stand

// [PROPOSÉ] costs per level, paid from existing strategic resources and time.
export const COLONY_LEVEL_COSTS_V188 = Object.freeze([
  Object.freeze({ cost: Object.freeze({ credits: 400, alloy: 20 }), hours: 6 }),
  Object.freeze({ cost: Object.freeze({ credits: 900, alloy: 45, research: 5 }), hours: 12 }),
  Object.freeze({ cost: Object.freeze({ credits: 1600, alloy: 80, research: 12 }), hours: 24 })
]);
export const COLONY_TIERS_V188 = Object.freeze([
  Object.freeze({ id: 'survival', label: t('Survie', 'Survival') }),
  Object.freeze({ id: 'restored', label: t('Rétablie', 'Restored') }),
  Object.freeze({ id: 'autonomous', label: t('Autonome', 'Autonomous') }),
  Object.freeze({ id: 'free', label: t('Libre', 'Free') })
]);
export const COLONY_STABILITY_PER_LEVEL_V188 = 3;
export const COLONY_AUTONOMOUS_STIPEND_V188 = Object.freeze({ credits: 150, alloy: 10 });

export function createColonyV188() {
  return { schema: 188, sites: Object.fromEntries(COLONY_SITE_IDS_V188.map(id => [id, { invested: 0, validated: 0 }])) };
}
export function normalizeColonyV188(raw) {
  const base = createColonyV188();
  if (!raw || typeof raw !== 'object' || !raw.sites || typeof raw.sites !== 'object') return base;
  for (const id of COLONY_SITE_IDS_V188) {
    const entry = raw.sites[id] || {}, invested = Math.max(0, Math.min(3, Math.floor(Number(entry.invested) || 0)));
    base.sites[id] = { invested, validated: Math.max(0, Math.min(invested, Math.floor(Number(entry.validated) || 0))) };
  }
  return base;
}

/** Opens after Act II (C2 is placed "after Act II"; C2 itself is not playable yet) [PROPOSÉ]. */
export function colonyReconstructionOpenV188(save) {
  return Array.isArray(save?.galaxy?.completedCampaignIds) && save.galaxy.completedCampaignIds.includes('special-archive-relay');
}

/** People brought back during the campaign: the three quay civilians and the M577 colonists. */
export function colonyRescuedV188(save) {
  const quay = save?.portMeridienV90?.phase === 'complete' ? 3 : 0;
  const manifest = save?.storyCampaignV188?.m577Manifest;
  return quay + (manifest?.resolved ? Math.max(0, Number(manifest.colonists) || 0) : 0);
}
/** Active sites (invested above validated) allowed: 1 + one per two rescued [PROPOSÉ]. */
export function colonyActiveLimitV188(save) { return 1 + Math.floor(colonyRescuedV188(save) / 2); }

export function colonyTierV188(colony) {
  const sites = Object.values(normalizeColonyV188(colony).sites);
  const atLeast = level => sites.filter(entry => entry.validated >= level).length;
  // "Libre" also needs the ending "Le relais parle", which is not playable yet.
  if (atLeast(2) >= 5) return 'autonomous';
  if (atLeast(1) >= 3) return 'restored';
  return 'survival';
}

export function colonySnapshotV188(save, language = 'fr') {
  const lang = language === 'en' ? 'en' : 'fr', colony = normalizeColonyV188(save?.colonyV188);
  const active = Object.values(colony.sites).filter(entry => entry.invested > entry.validated).length;
  return Object.freeze({
    open: colonyReconstructionOpenV188(save), tier: colonyTierV188(colony), rescued: colonyRescuedV188(save),
    active, activeLimit: colonyActiveLimitV188(save),
    sites: COLONY_SITES_V188.map(definition => {
      const state = colony.sites[definition.id], next = state.invested < 3 ? COLONY_LEVEL_COSTS_V188[state.invested] : null;
      return Object.freeze({ id: definition.id, criterion: definition.criterion[lang], leads: definition.leads,
        invested: state.invested, validated: state.validated, pending: state.invested > state.validated,
        current: state.validated ? definition.levels[state.validated - 1][lang] : null,
        // The level paid for and awaiting validation (shown instead of the next, unpaid one).
        pendingLabel: state.invested > state.validated ? definition.levels[state.invested - 1][lang] : null,
        next: next ? Object.freeze({ label: definition.levels[state.invested][lang], cost: next.cost, hours: next.hours }) : null });
    })
  });
}

/** Mutates a candidate save. Never during a mission; respects the active-site limit. */
export function investColonySiteV188(save, siteId) {
  if (!COLONY_SITE_IDS_V188.includes(siteId)) return { ok: false, reason: 'unknown-site' };
  if (!colonyReconstructionOpenV188(save)) return { ok: false, reason: 'locked' };
  if (save?.strategy?.currentOperation) return { ok: false, reason: 'operation-active' };
  const colony = normalizeColonyV188(save.colonyV188), state = colony.sites[siteId];
  if (state.invested >= 3) return { ok: false, reason: 'complete' };
  if (state.invested > state.validated) return { ok: false, reason: 'awaiting-validation' };
  const active = Object.values(colony.sites).filter(entry => entry.invested > entry.validated).length;
  if (active >= colonyActiveLimitV188(save)) return { ok: false, reason: 'population-limit' };
  const step = COLONY_LEVEL_COSTS_V188[state.invested];
  if (!canAfford(save, step.cost)) return { ok: false, reason: 'resources' };
  for (const [key, value] of Object.entries(step.cost)) save.galaxy.resources[key] = Math.round((save.galaxy.resources[key] - value) * 100) / 100;
  const total = (save.clock.day - 1) * 24 + save.clock.hour + step.hours;
  save.clock.day = Math.floor(total / 24) + 1; save.clock.hour = Math.round((total % 24) * 100) / 100;
  state.invested += 1; save.colonyV188 = colony;
  return { ok: true, siteId, level: state.invested };
}

/** After an operation on Cocyte: a success validates the oldest pending level
 * (stability +3); a failure damages the highest site by one functioning level,
 * investment kept (bible rule). Returns what changed. */
export function applyColonyOperationResultV188(save, { success, worldId } = {}) {
  if (worldId !== COLONY_WORLD_ID_V188 || !save?.colonyV188) return null;
  const colony = normalizeColonyV188(save.colonyV188);
  if (success) {
    // "Autonome": regular resources [PROPOSÉ] +150 credits, +10 alloy per successful operation on Cocyte.
    const stipend = colonyTierV188(colony) === 'autonomous' ? COLONY_AUTONOMOUS_STIPEND_V188 : null;
    if (stipend) for (const [key, value] of Object.entries(stipend)) save.galaxy.resources[key] = (Number(save.galaxy.resources[key]) || 0) + value;
    const pending = COLONY_SITE_IDS_V188.find(id => colony.sites[id].invested > colony.sites[id].validated);
    if (!pending) return stipend ? { stipend } : null;
    colony.sites[pending].validated += 1; save.colonyV188 = colony;
    const world = save.galaxy?.worldState?.[COLONY_WORLD_ID_V188];
    if (world && Number.isFinite(world.stability)) world.stability = Math.min(100, world.stability + COLONY_STABILITY_PER_LEVEL_V188);
    return { validated: pending, level: colony.sites[pending].validated, stipend };
  }
  const damaged = [...COLONY_SITE_IDS_V188].sort((a, b) => colony.sites[b].validated - colony.sites[a].validated)[0];
  if (!colony.sites[damaged].validated) return null;
  colony.sites[damaged].validated -= 1; save.colonyV188 = colony;
  return { damaged, level: colony.sites[damaged].validated };
}
