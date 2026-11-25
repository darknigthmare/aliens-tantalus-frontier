import {CAMPAIGN_V104} from './alien3-dlc-v104.js';
import {center105,feet105,delta105,closedBetweenV105} from './alien3-navigation-v105.js';
import {tellV105,emitNoiseV105} from './alien3-encounter-v105.js';
import {SENSE_RULES_V106} from './alien3-senses-v106.js';
import {closestSteamV109,steamCircuitV109,fieldsV109,STEAM_RULES_V109} from './alien3-steam-v109.js';
import {TRAFFIC_RULES_V110,createTrafficV110,beginClosingV110,cancelClosingV110,closingValidV110,advanceClosingV110,safeCrewMoveV110,snapshotTrafficV110,validateTrafficV110} from './alien3-traffic-v110.js';
import {drawTrafficV110,contextHintsV110} from './alien3-art-v110.js';
const editing=t=>Boolean(t?.closest?.('input,textarea,select,button,a,[contenteditable]:not([contenteditable="false"])'));
export function withAlien3DlcRuntimeV110(Base){return class Alien3DlcRuntimeV110 extends Base{
 start(o={}){this.alien3TrafficV110=null;this.alien3SafePointV110=null;const out=super.start(o);if(o.campaign?.id===CAMPAIGN_V104)this.alien3TrafficV110 ||=createTrafficV110(this.alien3EncounterV105,this.alien3NavV105);return out;}
 beginAlien3EncounterV105(mode,options){const out=super.beginAlien3EncounterV105(mode,options);if(out){this.alien3TrafficV110=createTrafficV110(this.alien3EncounterV105,this.alien3NavV105);this.alien3SafePointV110=null;}return out;}
 useAlien3PurgeV109(){const s=this.alien3TrafficV110;if(!s)return super.useAlien3PurgeV109();if(!this.alien3EncounterV105||this.alien3BlockedV105())return false;
  if(s.closing){if(this.alien3OperationsV107?.inputMode==='toggle')cancelClosingV110(s);return true;}
  const site=closestSteamV109(this),c=site&&steamCircuitV109(this.alien3SteamV109,site.id);
  if(c?.remaining>STEAM_RULES_V109.tailSeconds){const r=beginClosingV110(this,site);if(r.ok)tellV105(this.alien3EncounterV105,'','Je referme la vanne.',1.5);return r.ok;}
  return super.useAlien3PurgeV109();
 }
 cancelAlien3PurgeV109(){const a=cancelClosingV110(this.alien3TrafficV110),b=super.cancelAlien3PurgeV109();return a||b;}
 update(dt){const s=this.alien3TrafficV110;if(!s||!this.alien3EncounterV105)return super.update(dt);
  if(this.alien3BlockedV105()){cancelClosingV110(s);return super.update(dt);}if(s.closing&&!closingValidV110(this).ok)cancelClosingV110(s);
  s.noticeClock=Math.max(0,s.noticeClock-delta105(dt));const out=super.update(dt);
  if(!this.alien3BlockedV105()){const event=advanceClosingV110(this,dt);if(event?.type==='closed'){
   const site=event.site;emitNoiseV105(this.alien3EncounterV105,this.alien3NavV105,{x:site.controlX,y:site.foot,w:0,h:0,depth:site.depth},.32,'valve-close:'+site.id);
   this.alien3EncounterV105.audioEvents.push({type:'metal',x:site.controlX,foot:site.foot});tellV105(this.alien3EncounterV105,'','Le jet tombe. Laissez-le refroidir.',2.7);
  }}return out;
 }
 updateAlien3ParticipantsV106(enc,dt){const s=this.alien3TrafficV110,sense=this.alien3SensesV106;if(!s||!sense||!this.alien3SteamV109)return super.updateAlien3ParticipantsV106(enc,dt);
  const sec=delta105(dt);if(!sec)return;const fields=fieldsV109(this.alien3SteamV109,this.alien3SteamGeometryV109,this.doors||[]).filter(f=>f.hot);
  if(!fields.length){const out=super.updateAlien3ParticipantsV106(enc,dt);for(const p of enc.participants)if(s.waiting[p.id]&&!sense.holds[p.id]&&(p.moving||p.nav.nodeId===p.goal&&!p.nav.nextId)){delete s.waiting[p.id];s.stats.resumed++;}return out;}
  sense.captionClock=Math.max(0,sense.captionClock-sec);sense.callClock=Math.max(0,sense.callClock-sec);this.alien3OrdersCooldownV106=Math.max(0,this.alien3OrdersCooldownV106-sec);
  for(const p of enc.participants){if(!p.alive||!p.goal)continue;if(sense.holds[p.id]){p.vx=0;p.vy=0;p.moving=false;p.blocked=false;continue;}
   const r=safeCrewMoveV110(p,p.goal,this.alien3NavV105,this.doors||[],sec,fields,{speed:p.id==='dillon'?105:112});
   if(r.waiting){if(!s.waiting[p.id])s.stats.waitingStarts++;s.waiting[p.id]=r.siteId;s.stats.waitingSeconds+=sec;sense.blockedTime[p.id]=0;
    const inRange=Math.abs(center105(p)-center105(this.player))<TRAFFIC_RULES_V110.noticeDistance&&Math.abs(feet105(p)-feet105(this.player))<TRAFFIC_RULES_V110.noticeHeight;
    const visible=inRange&&!closedBetweenV105({x:center105(p),y:p.y+p.h*.5},{x:center105(this.player),y:this.player.y+this.player.h*.5},this.doors||[]);
    if(s.noticeClock===0&&visible){tellV105(enc,p.name,'Ça brûle. Je passe après le jet.',3.4);s.noticeClock=TRAFFIC_RULES_V110.noticeCooldown;}
    continue;
   }
   if(s.waiting[p.id]&&(r.moved>0||r.arrived)){delete s.waiting[p.id];s.stats.resumed++;}
   if(r.arrived){p.order='hold';p.moving=false;}
   sense.blockedTime[p.id]=p.blocked?(sense.blockedTime[p.id]||0)+sec:0;
   if(p.blocked&&sense.blockedTime[p.id]>1.2&&sense.callClock===0&&Math.abs(center105(p)-center105(this.player))<480&&Math.abs(feet105(p)-feet105(this.player))<205){tellV105(enc,p.name,'Le passage est fermé. Il faut l’ouvrir.',3.5);sense.callClock=SENSE_RULES_V106.noticeCooldown;}
   if(r.moved>0&&this.alien3OperationsV107){this.alien3CrewStrideV107[p.id]=(this.alien3CrewStrideV107[p.id]||0)+r.moved;if(this.alien3CrewStrideV107[p.id]>=62){this.alien3CrewStrideV107[p.id]%=62;if(emitNoiseV105(enc,this.alien3NavV105,p,.23,'crew-steps')){this.alien3OperationsV107.stats.crewSteps++;enc.audioEvents.push({type:'steps',x:center105(p),foot:feet105(p)});}}}
  }
 }
 interact(a=this.player){return this.alien3TrafficV110?.closing?false:super.interact(a);}
 alien3CanUseDiversionV108(){return !this.alien3TrafficV110?.closing&&super.alien3CanUseDiversionV108();}
 makeAlien3NoiseV105(){return this.alien3TrafficV110?.closing?false:super.makeAlien3NoiseV105();}
 useAlien3UtilityV103(){return this.alien3TrafficV110?.closing?false:super.useAlien3UtilityV103();}
 commandCompanionV106(){return this.alien3TrafficV110?.closing?false:super.commandCompanionV106();}
 setAlien3InteractionModeV107(mode){cancelClosingV110(this.alien3TrafficV110);return super.setAlien3InteractionModeV107(mode);}
 damagePlayer(p,n,options={}){const before=p?.health,out=super.damagePlayer(p,n,options);if(p===this.player&&p.health<before)cancelClosingV110(this.alien3TrafficV110);return out;}
 bindSteamInputV109(){if(typeof globalThis.addEventListener!=='function')return;this.alien3SteamAbortV109?.abort();this.alien3SteamAbortV109=new AbortController();const signal=this.alien3SteamAbortV109.signal;
  globalThis.addEventListener('keydown',ev=>{if(!this.alien3SteamV109||editing(ev.target)||ev.isComposing||ev.ctrlKey||ev.metaKey||ev.altKey)return;if(['Escape','KeyC','KeyM'].includes(ev.code))this.cancelAlien3PurgeV109();if(ev.code!=='KeyV'||ev.repeat||!this.alien3EncounterV105||this.alien3BlockedV105())return;ev.preventDefault();ev.stopImmediatePropagation();this.keys?.add('KeyV');this.useAlien3PurgeV109();},{capture:true,signal});
  globalThis.addEventListener('keyup',ev=>{if(ev.code==='KeyV'){this.keys?.delete('KeyV');if(this.alien3OperationsV107?.inputMode!=='toggle')this.cancelAlien3PurgeV109();}},{capture:true,signal});globalThis.addEventListener('blur',()=>this.cancelAlien3PurgeV109(),{signal});
 }
 getInteractionPrompt(a=this.player){if(this.alien3TrafficV110?.closing)return 'Déplacez-vous pour interrompre la manœuvre.';return super.getInteractionPrompt(a);}
 drawWorld(c){const out=super.drawWorld(c);drawTrafficV110(c,this);return out;}
 drawHud(c){return this.alien3TrafficV110?super.drawHud(contextHintsV110(c,this)):super.drawHud(c);}
 captureResumeState(){const out=super.captureResumeState();return this.alien3TrafficV110?{...out,specialOperation:{...out.specialOperation,alien3V110:snapshotTrafficV110(this.alien3TrafficV110)}}:out;}
 applyResumeState(raw){let traffic=null;if(raw?.specialOperation?.alien3V110){if(!this.isAlien3MissionV105())return {applied:false,reason:'inactive'};const v=validateTrafficV110(raw.specialOperation.alien3V110,raw.specialOperation.alien3V105,raw.specialOperation.alien3V109,this.alien3NavV105);if(!v.ok)return{applied:false,reason:'V110-'+v.reason};traffic=v.state;}
  const out=super.applyResumeState(raw);if(out?.applied&&this.isAlien3MissionV105())this.alien3TrafficV110=traffic||createTrafficV110(this.alien3EncounterV105,this.alien3NavV105);return out;
 }
 stop(...args){cancelClosingV110(this.alien3TrafficV110);return super.stop(...args);}
};}
