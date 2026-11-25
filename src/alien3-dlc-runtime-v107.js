import {CAMPAIGN_V104} from './alien3-dlc-v104.js';
import {center105,feet105,delta105,nearStationV105} from './alien3-navigation-v105.js';
import {stationV105,tellV105,emitNoiseV105} from './alien3-encounter-v105.js';
import {OPERATIONS_V107,createOperationsV107,operationsSnapshotV107,validateOperationsV107,completedForV107,operationForV107,operationAccessV107,operationStillValidV107} from './alien3-operations-v107.js';
import {drawOperationWorldV107,drawOperatorFittingsV107,drawWorkingHudV107} from './alien3-art-v107.js';
const editing=t=>Boolean(t?.closest?.('input,textarea,select,button,a,[contenteditable]:not([contenteditable="false"])'));
/** Owns sustained gestures only. The original stage owner still commits flags/checkpoints. */
export function withAlien3DlcRuntimeV107(Base){return class Alien3DlcRuntimeV107 extends Base{
 start(options={}){this.alien3InputAbortV107?.abort();this.alien3OperationsV107=null;this.alien3SafePointV107=null;this.alien3CrewStrideV107={};this.alien3WorkNoiseClockV107=0;this.alien3InteractionSettingV107='hold';const out=super.start(options);if(options.campaign?.id===CAMPAIGN_V104){if(!this.alien3OperationsV107)this.alien3OperationsV107=createOperationsV107(this.alien3EncounterV105);this.bindAlien3InputV107();}return out;}
 beginAlien3EncounterV105(mode,options){const result=super.beginAlien3EncounterV105(mode,options);if(result){this.alien3OperationsV107=createOperationsV107(this.alien3EncounterV105,this.alien3InteractionSettingV107);this.alien3CrewStrideV107={};this.alien3WorkNoiseClockV107=0;}return result;}
 setAlien3InteractionModeV107(mode){if(!['hold','toggle'].includes(mode)||!this.alien3OperationsV107)return false;this.cancelAlien3OperationV107('setting',false);this.alien3InteractionSettingV107=mode;this.alien3OperationsV107.inputMode=mode;return true;}
 cancelAlien3OperationV107(reason='release',notice=true){const s=this.alien3OperationsV107;if(!s?.active)return false;s.active=null;s.stats.cancelled++;if(notice&&this.alien3EncounterV105?.status==='active'&&!this.alien3BlockedV105())tellV105(this.alien3EncounterV105,'','La manœuvre est interrompue.',2.1);return true;}
 startAlien3OperationV107(def){if(!this.alien3OperationsV107||this.alien3OperationsV107.active)return false;const access=operationAccessV107(this,def);if(!access.ok){if(access.message)tellV105(this.alien3EncounterV105,'',access.message,3);return false;}
 const s=this.alien3OperationsV107;s.active={id:def.id,stage:def.stage,elapsed:0,noiseRemaining:0,origin:{x:center105(this.player),foot:feet105(this.player)},health:this.player.health};s.stats.started++;tellV105(this.alien3EncounterV105,'',def.working,2.2);return true;}
 interact(actor=this.player){if(!this.alien3OperationsV107||!this.alien3EncounterV105||actor!==this.player)return super.interact?.(actor);if(this.alien3BlockedV105())return false;
 const s=this.alien3OperationsV107;if(s.active){if(s.inputMode==='toggle')this.cancelAlien3OperationV107('toggle');return true;}
 const def=operationForV107(this.alien3EncounterV105);if(def){const station=stationV105(this.alien3NavV105,def.station);if(nearStationV105(actor,station,this.doors||[],{range:85,height:40,depth:1.05}))return this.startAlien3OperationV107(def);}
 return super.interact?.(actor);}
 update(dt){const s=this.alien3OperationsV107;if(!s||!this.alien3EncounterV105)return super.update(dt);
 if(this.alien3BlockedV105()){this.cancelAlien3OperationV107('blocked',false);return super.update(dt);}
 if(s.active){const check=operationStillValidV107(this,s.active);if(!check.ok)this.cancelAlien3OperationV107(check.reason);}
 this.alien3WorkNoiseClockV107=Math.max(0,(this.alien3WorkNoiseClockV107||0)-delta105(dt));const out=super.update(dt),work=s.active;if(!work)return out;
 const check=operationStillValidV107(this,work);if(!check.ok){this.cancelAlien3OperationV107(check.reason);return out;}
 const def=OPERATIONS_V107.find(d=>d.id===work.id),sec=delta105(dt);if(!sec)return out;
 work.elapsed=Math.min(def.seconds,work.elapsed+sec);s.stats.workSeconds+=sec;
 if(this.alien3WorkNoiseClockV107<=0){const station=check.station;emitNoiseV105(this.alien3EncounterV105,this.alien3NavV105,station,def.power,'work-'+def.id);s.stats.machinePulses++;this.alien3EncounterV105.audioEvents.push({type:def.sound==='paper'?'steps':def.sound,x:center105(station),foot:feet105(station)});this.alien3WorkNoiseClockV107=.55;}
 if(work.elapsed+1e-8>=def.seconds){
  // The ownership stays with V105. Prepare the stable record before its checkpoint callback.
  const previous=[...s.completed],counter=s.stats.completed;s.active=null;s.completed=completedForV107({...this.alien3EncounterV105,stage:def.stage+1});s.stats.completed++;this.alien3ActionClockV105=0;
  const result=super.interact(this.player);if(!result||this.alien3EncounterV105.stage!==def.stage+1){s.completed=previous;s.stats.completed=counter;s.stats.cancelled++;}
 }
 return out;
 }
 updateAlien3ParticipantsV106(enc,dt){const before=new Map(enc.participants.map(p=>[p.id,{x:center105(p),foot:feet105(p)}]));super.updateAlien3ParticipantsV106(enc,dt);if(!this.alien3OperationsV107)return;
 for(const p of enc.participants){const b=before.get(p.id),d=Math.hypot(center105(p)-b.x,feet105(p)-b.foot);if(d<=.001||!p.alive)continue;this.alien3CrewStrideV107[p.id]=(this.alien3CrewStrideV107[p.id]||0)+d;
  if(this.alien3CrewStrideV107[p.id]>=62){this.alien3CrewStrideV107[p.id]%=62;if(emitNoiseV105(enc,this.alien3NavV105,p,.23,'crew-steps')){this.alien3OperationsV107.stats.crewSteps++;enc.audioEvents.push({type:'steps',x:center105(p),foot:feet105(p)});}}
 }
 }
 commandCompanionV106(){if(this.alien3OperationsV107?.active)return false;const p=this.nearbyCompanionV106?.();const result=super.commandCompanionV106();if(result&&p&&this.alien3OperationsV107){emitNoiseV105(this.alien3EncounterV105,this.alien3NavV105,p,.46,'crew-call');this.alien3OperationsV107.stats.crewCalls++;}return result;}
 useAlien3UtilityV103(){return this.alien3OperationsV107?.active?false:super.useAlien3UtilityV103?.();}
 makeAlien3NoiseV105(){return this.alien3OperationsV107?.active?false:super.makeAlien3NoiseV105?.();}
 damagePlayer(actor,n,options={}){const before=actor?.health,out=super.damagePlayer(actor,n,options);if(actor===this.player&&actor.health<before)this.cancelAlien3OperationV107('damage');return out;}
 getInteractionPrompt(actor=this.player){const enc=this.alien3EncounterV105,def=operationForV107(enc),s=this.alien3OperationsV107;if(s?.active){const d=OPERATIONS_V107.find(d=>d.id===s.active.id);return `${s.inputMode==='hold'?'Maintenir E':'E  Annuler'} · ${d.label}`;}
 if(s&&def){const station=stationV105(this.alien3NavV105,def.station);if(nearStationV105(actor,station,this.doors||[],{range:85,height:22,depth:.4}))return `${s.inputMode==='hold'?'Maintenir E':'E'}  ${def.label}`;}return super.getInteractionPrompt?.(actor)||'';}
 bindAlien3InputV107(){if(typeof globalThis.addEventListener!=='function')return;this.alien3InputAbortV107=new AbortController();const signal=this.alien3InputAbortV107.signal;
 globalThis.addEventListener('keydown',event=>{if(!this.alien3OperationsV107||!this.alien3EncounterV105||event.isComposing||event.ctrlKey||event.altKey||event.metaKey||editing(event.target))return;
  if(['Escape','KeyC','KeyM'].includes(event.code)&&this.alien3OperationsV107.active)this.cancelAlien3OperationV107('modal',false);
  if(event.code!=='KeyE'||this.alien3BlockedV105())return;
  const def=operationForV107(this.alien3EncounterV105),station=def&&stationV105(this.alien3NavV105,def.station);const belongs=this.alien3OperationsV107.active||station&&nearStationV105(this.player,station,this.doors||[],{range:85,height:40,depth:1.05});if(!belongs)return;
  event.preventDefault();event.stopImmediatePropagation();this.keys?.add('KeyE');if(!event.repeat)this.interact(this.player);
 },{capture:true,signal});
 globalThis.addEventListener('keyup',event=>{if(event.code==='KeyE'){this.keys?.delete('KeyE');if(this.alien3OperationsV107?.inputMode==='hold')this.cancelAlien3OperationV107('release');}},{capture:true,signal});
 globalThis.addEventListener('blur',()=>this.cancelAlien3OperationV107('blur',false),{signal});
 }
 drawWorld(c){const out=super.drawWorld(c);if(this.alien3OperationsV107){drawOperatorFittingsV107(c,this);drawOperationWorldV107(c,this);}return out;}
 drawHud(c){if(this.alien3OperationsV107?.active&&!this.alien3BlockedV105())return drawWorkingHudV107(c,this);return super.drawHud(c);}
 captureResumeState(){const base=super.captureResumeState();if(!this.alien3OperationsV107)return base;return {...base,specialOperation:{...base.specialOperation,alien3V107:operationsSnapshotV107(this.alien3OperationsV107,this.alien3EncounterV105)}};}
 applyResumeState(raw){const enc=raw?.specialOperation?.alien3V105;let op=null;if(raw?.specialOperation?.alien3V107){const v=validateOperationsV107(raw.specialOperation.alien3V107,enc);if(!v.ok)return {applied:false,reason:'V107-'+v.reason};op=v.state;}
 const out=super.applyResumeState(raw);if(out?.applied&&this.isAlien3MissionV105()){this.alien3OperationsV107=op||createOperationsV107(this.alien3EncounterV105);this.alien3InteractionSettingV107=this.alien3OperationsV107.inputMode;this.alien3CrewStrideV107={};this.alien3WorkNoiseClockV107=.55;}return out;}
 stop(...args){this.cancelAlien3OperationV107('stop',false);this.alien3InputAbortV107?.abort();return super.stop?.(...args);}
};}
