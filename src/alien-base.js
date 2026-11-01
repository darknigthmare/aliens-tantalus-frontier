import { ALIEN_BASE_REGISTRY } from '../vendor/alien-base/catalog.mjs';
const records=new Map(ALIEN_BASE_REGISTRY.records.map(row=>[row.id,row]));
const local=new Map();
for(const record of ALIEN_BASE_REGISTRY.records)
  for(const profileId of record.gameBindings?.['aliens-tantalus-frontier'] || []) {
    if(local.has(profileId))throw new TypeError('Ambiguous Tantalus Alien_base ID '+profileId);
    local.set(profileId,record);
  }
export { ALIEN_BASE_REGISTRY };
export const getAlienBaseRecord = id => typeof id==='string'?records.get(id)||null:null;
export const getAlienBaseByLocalId = id => typeof id==='string'?local.get(id)||null:null;
// No canon stat overrides, gameplay admissions or visual replacements.
export const getAlienBaseIdForProfile = id => getAlienBaseByLocalId(id)?.id || null;
