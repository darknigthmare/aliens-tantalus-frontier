import { WORLDS, LEVEL_SEEDS } from './content-core-v50.js';
import { NEW_SPECIAL_CAMPAIGNS_V131 } from './special-operations-v131.js';
import { buildHiveMissionV131 } from './hive-missions-v131.js';
import { validateHiveControlV131 } from './hive-control-v131.js';
import { buildMechaMissionV131, validateMechaMissionStateV131 } from './mecha-missions-v131.js';
import { SAURIA_CASTES_V131, validateEcosystemStateV131 } from './ecosystem-systems-v131.js';
import { buildEcosystemMissionV131 } from './ecosystem-missions-v131.js';
import { validateLegacyOperationStateV131, LEGACY_STATIONS_V131 } from './legacy-operation-state-v131.js';

const record = v => v && typeof v==='object' && !Array.isArray(v);
const equal = (a,b) => {
  if(a===b) return true;
  if(!a || !b || typeof a!=='object' || typeof b!=='object' || Array.isArray(a)!==Array.isArray(b)) return false;
  const keys=Object.keys(a);return keys.length===Object.keys(b).length && keys.every(k=>Object.hasOwn(b,k)&&equal(a[k],b[k]));
};
const integer = (value, maximum = 1e6) => Number.isInteger(value) && value >= 0 && value <= maximum;
const sameIds = (a, b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length
  && new Set(a).size === a.length && new Set(b).size === b.length && a.every(id => b.includes(id));
const actorValid = actor => record(actor) && typeof actor.id === 'string' && typeof actor.alive === 'boolean'
  && Number.isFinite(actor.health) && actor.health >= 0 && actor.health <= 1e6 && actor.alive === (actor.health > 0)
  && Number.isFinite(actor.x) && actor.x >= 0 && actor.x <= 6200
  && Number.isFinite(actor.y) && actor.y >= -200 && actor.y <= 1200;
const actorMatches = (actor, descriptor) => actor && actor.alive === descriptor.alive && actor.health === descriptor.health
  && Math.abs(actor.x - descriptor.x) <= .001 && Math.abs(actor.y - descriptor.y) <= .001;
function ecologicalActorsValid(raw, state, campaign) {
  if (!sameIds(raw.enemies?.map(actor => actor.id), state.actors.map(actor => actor.id))) return false;
  const actor = id => raw.enemies.find(actor => actor.id === id);
  if (state.targets.some((done,index) => done !== !actor(`eco131-target-${index}`)?.alive)
    || !actor('eco131-boss') || actor('eco131-boss').alive || actor('eco131-boss').health !== 0
    || state.population.some(member => ['dead','rescued'].includes(member.status) !== !actor(member.id)?.alive)) return false;
  const plan = buildEcosystemMissionV131({campaign,levelSeeds:LEVEL_SEEDS});
  for (let index = 0; index < state.targets.length; index++) {
    const descriptor = state.actors.find(actor => actor.id === `eco131-target-${index}`), authored = plan.ecosystemV131;
    if (!descriptor || descriptor.role !== 'target' || descriptor.targetIndex !== index
      || !authored || descriptor.x !== [950,1720,2460,3100][index] || descriptor.floorY !== (index % 2 ? 570 : 355)) return false;
  }
  const bossDescriptor = state.actors.find(actor => actor.id === 'eco131-boss');
  if (bossDescriptor?.role !== 'boss' || bossDescriptor.x !== 3780 || bossDescriptor.floorY !== 570) return false;
  const initialIds=['eco131-boss',...state.targets.map((_,index)=>`eco131-target-${index}`)];
  if(state.operationId==='pangaea-second-extinction') {
    if(state.population.length!==14) return false;
    for(let index=0;index<14;index++) {
      const id=`eco131-population-${index}`,member=state.population.find(member=>member.id===id),descriptor=state.actors.find(actor=>actor.id===id);
      if(!member || !descriptor || member.originalHost!==(index<7) || member.caste!==SAURIA_CASTES_V131[index%7].id
        || descriptor.role!==(index<7?'host':'sauria') || descriptor.caste!==member.caste
        || !member.originalHost && ['healthy','rescued'].includes(member.status)) return false;
      initialIds.push(id);
    }
  } else for(let index=0;index<6;index++) {
    const id=`eco131-guard-${index}`,descriptor=state.actors.find(actor=>actor.id===id);
    if(!descriptor || descriptor.role!=='guard' || descriptor.x!==800+index*520 || descriptor.floorY!==(index%2?355:570)) return false;
    initialIds.push(id);
  }
  if(state.actors.some(descriptor=>!initialIds.includes(descriptor.id) && (()=>{
    const match=/^eco131-wave-(boss-phase-[234]|beacon-[012])-([01])$/.exec(descriptor.id);
    if(!match || descriptor.role!=='guard' || descriptor.floorY!==570 || !state.journal.includes(`wave-${match[1]}`))return true;
    if(match[1].startsWith('boss') && state.bossPhase<Number(match[1].at(-1)))return true;
    if(match[1].startsWith('beacon') && (state.operationId!=='queen-mother-song' || state.defenceElapsed<(Number(match[1].at(-1))+1)*7))return true;
    return !(match[1].startsWith('boss')?[3530,3870]:[4680,4880]).some(x=>descriptor.x===x+Number(match[2])*75);
  })()))return false;
  const exit = state.operationId === 'hive-world' ? plan.ecosystemV131.props.insertion : plan.ecosystemV131.props.extraction;
  // Core save bodies retain the production 42x92 marine collision contract.
  if (Math.hypot(raw.player.x + 21 - exit.x, raw.player.y + 92 - exit.floorY) > 140) return false;
  return true;
}
function hiveActorsValid(raw, state, manifest) {
  if (!sameIds(raw.enemies?.map(actor => actor.id),manifest.enemyIds)
    || !sameIds(raw.enemies.filter(actor => !actor.alive).map(actor => actor.id),state.killedIds)
    || raw.enemies.find(actor => actor.id==='hive-boss')?.alive !== false) return false;
  const actors=raw.hiveMissionV131.actors;
  if (!sameIds(actors?.map(actor=>actor.id),manifest.recruitIds)
    || actors.some(actor=>!actorValid(actor) || actor.health>70 || !Number.isFinite(actor.loyalty) || actor.loyalty<0 || actor.loyalty>100
      || typeof actor.lost!=='boolean' || typeof actor.recruited!=='boolean'
      || actor.recruited!==(state.recruitedIds.includes(actor.id)&&!actor.lost))) return false;
  const surviving=actors.filter(actor=>actor.alive&&actor.recruited&&!actor.lost).map(actor=>actor.id);
  if (!sameIds(surviving,state.rewards.survivingRecruits)) return false;
  if (state.operationId==='atax-false-queen' && !surviving.length) return false;
  if (state.operationId==='eloise-uncrowned-queen' && state.ending==='coexistence'
    && (!state.hushSaved || state.choir<45 || !actors.some(actor=>actor.id==='hive-firstborn'&&actor.alive&&actor.loyalty>=50))) return false;
  const exit=manifest.stations.find(station=>station.id==='extraction');
  return Boolean(exit && Math.hypot(raw.player.x+21-exit.x,raw.player.y+92-exit.floorY)<140);
}
function boundedActorProof(raw, state) {
  if (!Array.isArray(raw.enemies) || raw.enemies.length>48 || new Set(raw.enemies.map(actor=>actor.id)).size!==raw.enemies.length
    || raw.enemies.some(actor=>!actorValid(actor)) || !integer(raw.player.kills) || !integer(raw.coop?.kills??0)
    || !integer(raw.mission.casualties,9999) || !integer(raw.mission.retries,9999)
    || !Number.isFinite(raw.mission.elapsed) || raw.mission.elapsed<0 || raw.mission.elapsed>604800) return false;
  if (raw.player.kills+(raw.coop?.kills??0)>raw.enemies.filter(actor=>!actor.alive).length) return false;
  if (state.enemies && (!sameIds(raw.enemies.map(actor=>actor.id),state.enemies.map(actor=>actor.id))
    || state.enemies.some(descriptor=>!actorMatches(raw.enemies.find(actor=>actor.id===descriptor.id),descriptor)))) return false;
  if (state.kind && (!sameIds(raw.enemies.map(actor=>actor.id),state.actors.map(actor=>`legacy-${actor.id}`))
    || state.actors.some(descriptor=>!actorMatches(raw.enemies.find(actor=>actor.id===`legacy-${descriptor.id}`),descriptor)))) return false;
  return true;
}
function vehicleProofValid(raw,state,campaign) {
  if(state.systems) {
    const plan=buildMechaMissionV131({campaign}).mechaMissionV131,scale=state.systems.colossal?1.5:1;
    const width=154*scale,height=204*scale,exit=plan.extraction;
    return raw.coop?.enabled!==true && raw.vehicle?.id===`prototype-mecha-${state.loadoutId}-v131`
    && raw.vehicle.active===true && raw.vehicle.occupied===state.mounted && raw.vehicle.driver==='player'
    && (raw.player.inVehicle===undefined || raw.player.inVehicle===state.mounted) && raw.vehicle.destroyed===false
    && raw.vehicle.hull===state.systems.hull && raw.vehicle.fuel===state.systems.energy
    && raw.vehicle.x===state.vehicle?.x && raw.vehicle.y===state.vehicle?.y
    && Math.hypot(raw.vehicle.x+width/2-(exit.x+exit.w/2),raw.vehicle.y+height/2-(exit.y+exit.h/2))<210
    && Math.abs(raw.player.x-(raw.vehicle.x+width*.42-21))<.01
    && Math.abs(raw.player.y-(raw.vehicle.y+height*.16))<.01;
  }
  if(!state.kind) return true;
  if(raw.coop?.enabled===true || state.kind==='nostromo' && raw.vehicle?.active) return false;
  const exit=LEGACY_STATIONS_V131[state.kind].at(-1), body=state.aboard?raw.vehicle:raw.player;
  const width=state.aboard?180:42,height=state.aboard?86:92;
  if(!body || Math.hypot(body.x+width/2-exit.x,body.y+height/2-exit.y)>=110) return false;
  return state.kind==='nostromo' || raw.vehicle?.active===true && raw.vehicle.destroyed===false
    && raw.vehicle.occupied===state.aboard && raw.vehicle.driver===(state.aboard?'player':null)
    && raw.vehicle.hull===state.hull && raw.vehicle.fuel===state.fuel;
}
export function operationCampaignV131(id) { return NEW_SPECIAL_CAMPAIGNS_V131.find(c=>c.id===id) || null; }

// A completed engine checkpoint, frozen to its strategic deployment, is the
// authority for a chapter result. UI events cannot independently pay a reward.
export function validateOperationCompletionV131(operation,suppliedRewards=null) {
  const campaign=operationCampaignV131(operation?.campaignId);
  if(!campaign) return {valid:false,reason:'unknown-operation-v131'};
  const raw=operation.resumeState,proof=raw?.operationReceiptV131;
  const serial=Number(String(operation.id||'').match(/^operation-(\d+)-/)?.[1]);
  if(!Number.isSafeInteger(serial) || serial<1 || operation.id!==`operation-${serial}-${campaign.id}`
    || operation.specialOperationId!==campaign.specialOperationId || operation.worldId!==campaign.worldId
    || raw?.schema!==1 || raw.identity?.campaignId!==campaign.id || raw.identity?.worldId!==campaign.worldId
    || operation.levelSeedId && raw.identity.levelSeedId!==operation.levelSeedId
    || !operation.missionLevelSignature || raw.missionLevel?.signature!==operation.missionLevelSignature
    || proof?.deploymentId!==operation.id || proof.campaignId!==campaign.id
    || raw.mission?.state!=='complete' || raw.player?.alive!==true || raw.player.downed!==false)
    return {valid:false,reason:'operation-terminal-identity-v131'};
  let checked,state,manifest;
  if(raw.hiveMissionV131) {
    manifest=buildHiveMissionV131({campaign,world:WORLDS.find(w=>w.id===campaign.worldId)}).hiveMissionV131;
    checked=validateHiveControlV131(raw.hiveMissionV131.state,manifest);state=checked.state;
  } else if(raw.specialOperation?.mechaV131) {
    checked=validateMechaMissionStateV131(raw.specialOperation.mechaV131);state=checked.state;
  } else if(raw.specialOperation?.ecosystemV131) {
    checked=validateEcosystemStateV131(raw.specialOperation.ecosystemV131);state=checked.state;
  } else if(raw.specialOperation?.legacyMissionV131) {
    checked=validateLegacyOperationStateV131(raw.specialOperation.legacyMissionV131);state=checked.state;
  }
  if(!checked?.valid || state.operationId!==campaign.specialOperationId || state.complete!==true || state.rewardClaimed!==true
    || !record(state.rewards) || state.rewards.operationId!==campaign.specialOperationId
    || !equal(state.rewards,raw.mission.rewards) || suppliedRewards!==null && !equal(state.rewards,suppliedRewards))
    return {valid:false,reason:'operation-terminal-state-v131'};
  if(!boundedActorProof(raw,state) || !vehicleProofValid(raw,state,campaign) || raw.specialOperation?.ecosystemV131 && !ecologicalActorsValid(raw,state,campaign)
    || raw.hiveMissionV131 && !hiveActorsValid(raw,state,manifest)) return {valid:false,reason:'operation-actor-proof-v131'};
  const rewards=state.rewards;
  if(!['credits','salvage','intel'].every(k=>Number.isInteger(rewards[k])&&rewards[k]>=0&&rewards[k]<=1e6)
    || !record(raw.inventory) || rewards.salvage!==raw.inventory.salvage || rewards.intel!==raw.inventory.intel)
    return {valid:false,reason:'operation-reward-v131'};
  if(rewards.noCasualty!==(raw.mission.casualties===0) || rewards.retries!==raw.mission.retries
    || rewards.elapsedSeconds!==Math.round(raw.mission.elapsed)) return {valid:false,reason:'operation-reward-affinity-v131'};
  if(state.phase==='complete' && (raw.specialOperation?.ecosystemV131 || raw.hiveMissionV131)) {
    const kills=Number(raw.player.kills||0)+Number(raw.coop?.kills||0);
    if(rewards.vehicleRecovered!==false || raw.vehicle?.active || raw.player.inVehicle)
      return {valid:false,reason:'operation-vehicle-reward-v131'};
    const credits=480+kills*12+(raw.mission.casualties===0?120:0);
    if(rewards.credits!==credits) return {valid:false,reason:'operation-reward-mismatch-v131'};
  }
  if(raw.specialOperation?.legacyMissionV131 && rewards.credits!==620) return {valid:false,reason:'operation-reward-mismatch-v131'};
  return {valid:true,serial,state,rewards:structuredClone(rewards),
    strategicReward:{credits:rewards.credits,alloy:rewards.salvage,research:rewards.intel},
    receipt:{schema:131,deploymentId:operation.id,campaignId:campaign.id,operationId:campaign.specialOperationId,
      status:'partial',ending:state.ending||null,chapter:state.kind||null,
      ...(Number.isFinite(state.synchronization)?{synchronization:state.synchronization}:{}),
      ...(Number.isFinite(state.rescued)?{rescued:state.rescued}:{}),rewards:structuredClone(rewards)}};
}
