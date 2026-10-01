import { SYNTH_CAMPAIGN_CONTRACTS_V110 } from './synth-combat-v110.js';

// Reuse the bounded, telegraphed 2D cone only for this reviewed flame unit.
// This is project combat tuning, not a source-game weapon model or OCAP alias.
const igniter = Object.freeze({ ...SYNTH_CAMPAIGN_CONTRACTS_V110.flame,
  label:'Igniter — jet de flamme', sourceGameBehaviorVerified:false });
export function getAutomatonCampaignContractV113(pose) {
  return pose?.id === 'pose-v113-afe2-igniter' && pose.visualRevision === 113
    && pose.combatWeapon === 'flamethrower' ? igniter : null;
}


