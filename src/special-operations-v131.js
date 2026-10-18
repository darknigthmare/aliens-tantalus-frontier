import { SPECIAL_OPERATIONS_V67 } from './special-operations-v67.js';
import { BLACK_COCOON_CAMPAIGN_V121 } from './black-cocoon-state-v121.js';
import { APC_CONVOY_CAMPAIGN_V121 } from './apc-convoy-state-v121.js';
import { C12_HORDE_CAMPAIGN_V121 } from './c12-horde-state-v121.js';
import { ARCHIVE_RELAY_CAMPAIGN_V122 } from './archive-relay-state-v122.js';
import { HIVE_CAMPAIGNS_V131 } from './hive-missions-v131.js';
import { MECHA_CAMPAIGNS_V131 } from './mecha-missions-v131.js';
import { ECOSYSTEM_CAMPAIGNS_V131 } from './ecosystem-missions-v131.js';
import { LEGACY_CAMPAIGNS_V131 } from './legacy-operations-v131.js';

export const NEW_SPECIAL_CAMPAIGNS_V131 = Object.freeze([
  ...HIVE_CAMPAIGNS_V131, ...MECHA_CAMPAIGNS_V131, ...ECOSYSTEM_CAMPAIGNS_V131, ...LEGACY_CAMPAIGNS_V131
]);
const routes = new Map(NEW_SPECIAL_CAMPAIGNS_V131.map(c => [c.specialOperationId, c]));
routes.set('black-cocoon', BLACK_COCOON_CAMPAIGN_V121);
routes.set('last-course-tantalus', APC_CONVOY_CAMPAIGN_V121);
const limitations = {
  'queen-mother-song': ['dedicated-queen-mother-animation', 'complete-royal-cast'],
  'hive-world': ['dedicated-planet-queen-art', 'complete-organ-biomes'],
  'titan-equalizer': ['dedicated-talos-titan-art', 'canonical-mega-loader-corpus'],
  'eloise-uncrowned-queen': ['dedicated-eloise-animation', 'hush-six-and-mother-hunter-art'],
  'pangaea-second-extinction': ['dedicated-dinosaur-and-sauria-art', 'complete-prehistoric-corpus'],
  'atax-false-queen': ['dedicated-regina-animation', 'complete-seven-sector-campaign'],
  'jeri-false-son': ['dedicated-jeri-and-saint-animation', 'complete-segmented-synthetic-art'],
  'protocol-z110': ['dedicated-z110-and-morrigan-art', 'complete-mecha-animation-corpus'],
  'black-abyss': ['dedicated-hadal-manta-art', 'complete-aquatic-bestiary'],
  'mire-archive-001': ['complete-nostromo-cast', 'complete-historical-campaign'],
  broodstorm: ['dedicated-flying-queen-art', 'complete-modular-dropship-corpus'],
  'black-cocoon': ['dedicated-cocoon-bitmap-corpus', 'extended-survivor-campaign'],
  'last-course-tantalus': ['local-convoy-coop'],
  'cargo-brutal': ['dedicated-cargo-matriarch-art']
};
const freeze = entry => Object.freeze({ ...entry, canonExact: false,
  requiredMechanics: Object.freeze([...entry.requiredMechanics]),
  remainingMechanics: Object.freeze([...(entry.remainingMechanics || [])]) });
export const SPECIAL_OPERATIONS_V131 = Object.freeze([
  ...SPECIAL_OPERATIONS_V67.map(original => {
    const route = routes.get(original.id);
    return freeze({ ...original,
      ...(route ? { playable: true, implementationStatus: 'partial', campaignId: route.id, campaign: route,
        adaptationNotice: 'Chapitre jouable. Les règles sont une adaptation originale ; le corpus visuel dédié reste incomplet.' } : {}),
      ...(limitations[original.id] ? { implementationStatus: 'partial', remainingMechanics: limitations[original.id] } : {}) });
  }),
  freeze({ id: 'c12-horde', promisedTitle: 'SAS C-12 · DÉFENSE', kind: 'mission', productionOrder: 20,
    playable: true, implementationStatus: 'partial', campaignId: C12_HORDE_CAMPAIGN_V121.id, campaign: C12_HORDE_CAMPAIGN_V121,
    promiseSummary: C12_HORDE_CAMPAIGN_V121.summary, requiredMechanics: ['horde-defense', 'physical-extraction'],
    remainingMechanics: ['extended-horde-campaign'] }),
  freeze({ id: 'archive-relay', promisedTitle: 'ARCHIVES QZ-18 · RELAIS', kind: 'mission', productionOrder: 21,
    playable: true, implementationStatus: 'partial', campaignId: ARCHIVE_RELAY_CAMPAIGN_V122.id, campaign: ARCHIVE_RELAY_CAMPAIGN_V122,
    promiseSummary: ARCHIVE_RELAY_CAMPAIGN_V122.summary, requiredMechanics: ['six-department-documents', 'evidence-confrontation'],
    remainingMechanics: ['recorded-media-corpus'] })
]);
export const SPECIAL_OPERATION_COUNTS_V131 = Object.freeze({ total: SPECIAL_OPERATIONS_V131.length,
  effective: SPECIAL_OPERATIONS_V131.filter(o=>o.implementationStatus==='effective').length,
  partial: SPECIAL_OPERATIONS_V131.filter(o=>o.implementationStatus==='partial').length,
  missing: SPECIAL_OPERATIONS_V131.filter(o=>o.implementationStatus==='missing').length,
  playable: SPECIAL_OPERATIONS_V131.filter(o=>o.playable).length });
const byCampaign = new Map(SPECIAL_OPERATIONS_V131.filter(o=>o.campaignId).map(o=>[o.campaignId,o]));
export function getSpecialOperationByCampaignIdV131(id) { return byCampaign.get(id) || null; }
export function isSoloSpecialOperationV131(id) {
  return [BLACK_COCOON_CAMPAIGN_V121.id, APC_CONVOY_CAMPAIGN_V121.id, C12_HORDE_CAMPAIGN_V121.id, ARCHIVE_RELAY_CAMPAIGN_V122.id,
    ...MECHA_CAMPAIGNS_V131.map(c=>c.id), ...ECOSYSTEM_CAMPAIGNS_V131.map(c=>c.id), ...LEGACY_CAMPAIGNS_V131.map(c=>c.id)].includes(id);
}
export function validateSpecialOperationsV131(campaigns) {
  const failures=[];
  if(NEW_SPECIAL_CAMPAIGNS_V131.length!==11) failures.push('Eleven new chapters are required.');
  if(new Set(SPECIAL_OPERATIONS_V131.map(o=>o.id)).size!==SPECIAL_OPERATIONS_V131.length) failures.push('Duplicate operation id.');
  if(new Set(SPECIAL_OPERATIONS_V131.map(o=>o.productionOrder)).size!==SPECIAL_OPERATIONS_V131.length) failures.push('Duplicate production order.');
  for(const operation of SPECIAL_OPERATIONS_V131) {
    if(operation.canonExact!==false) failures.push(`${operation.id}: adaptation disclosure missing`);
    if(!operation.playable) continue;
    if(operation.accessSurface==='hub') continue;
    const matches=campaigns.filter(c=>c.id===operation.campaignId);
    if(matches.length!==1) failures.push(`${operation.id}: route must resolve exactly once`);
    if(matches.length===1 && !matches[0].specialOperationId) failures.push(`${operation.id}: runtime identity missing`);
  }
  return Object.freeze({ok:failures.length===0,failures:Object.freeze(failures),counts:SPECIAL_OPERATION_COUNTS_V131});
}
