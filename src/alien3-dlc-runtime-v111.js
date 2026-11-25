import {CAMPAIGN_V104} from './alien3-dlc-v104.js';
import {center105,feet105,delta105,closedBetweenV105} from './alien3-navigation-v105.js';
import {tellV105,emitNoiseV105} from './alien3-encounter-v105.js';
import {SENSE_RULES_V106} from './alien3-senses-v106.js';
import {fieldsV109} from './alien3-steam-v109.js';
import {TRAFFIC_RULES_V110} from './alien3-traffic-v110.js';
import {ROUTE_RULES_V111,createRoutesV111,routedCrewMoveV111,snapshotRoutesV111,validateRoutesV111} from './alien3-routing-v111.js';
import {drawCrewRoutesV111} from './alien3-art-v111.js';
export function withAlien3DlcRuntimeV111(Base){return class Alien3DlcRuntimeV111 extends Base{
 start(o={}){this.alien3RoutesV111=null;this.alien3SafePointV111=null;const out=super.start(o);if(o.campaign?.id===CAMPAIGN_V104)this.alien3RoutesV111 ||=createRoutesV111(this.alien3EncounterV105,this.alien3NavV105);return out;}
 beginAlien3EncounterV105(mode,options){const out=super.beginAlien3EncounterV105(mode,options);if(out){this.alien3RoutesV111=createRoutesV111(this.alien3EncounterV105,this.alien3NavV105);this.alien3SafePointV111=null;}return out;}
 updateAlien3ParticipantsV106(enc,dt){const s=this.alien3TrafficV110,routes=this.alien3RoutesV111,sense=this.alien3SensesV106;if(!s||!routes||!sense||!this.alien3SteamV109)return super.updateAlien3ParticipantsV106(enc,dt);
  const sec=delta105(dt);if(!sec)return;const fields=fieldsV109(this.alien3SteamV109,this.alien3SteamGeometryV109,this.doors||[]).filter(f=>f.hot);

  routes.noticeClock=Math.max(0,routes.noticeClock-sec);
  sense.captionClock=Math.max(0,sense.captionClock-sec);sense.callClock=Math.max(0,sense.callClock-sec);this.alien3OrdersCooldownV106=Math.max(0,this.alien3OrdersCooldownV106-sec);
  for(const p of enc.participants){if(!p.alive||!p.goal)continue;if(sense.holds[p.id]){routedCrewMoveV111(routes,p,p.goal,this.alien3NavV105,this.doors||[],sec,fields,{held:true});p.blocked=false;continue;}
   const r=routedCrewMoveV111(routes,p,p.goal,this.alien3NavV105,this.doors||[],sec,fields,{speed:p.id==='dillon'?105:112});
   if(r.waiting){if(!s.waiting[p.id])s.stats.waitingStarts++;s.waiting[p.id]=r.siteId;s.stats.waitingSeconds+=sec;sense.blockedTime[p.id]=0;
    const inRange=Math.abs(center105(p)-center105(this.player))<TRAFFIC_RULES_V110.noticeDistance&&Math.abs(feet105(p)-feet105(this.player))<TRAFFIC_RULES_V110.noticeHeight;
    const visible=inRange&&!closedBetweenV105({x:center105(p),y:p.y+p.h*.5},{x:center105(this.player),y:this.player.y+this.player.h*.5},this.doors||[]);
    if(s.noticeClock===0&&visible){tellV105(enc,p.name,'Ça brûle. Je passe après le jet.',3.4);s.noticeClock=TRAFFIC_RULES_V110.noticeCooldown;}
    continue;
   }
   if(s.waiting[p.id]&&(r.moved>0||r.arrived)){delete s.waiting[p.id];s.stats.resumed++;}
   if(r.detouring&&routes.noticeClock<=0&&Math.abs(center105(p)-center105(this.player))<ROUTE_RULES_V111.noticeDistance&&Math.abs(feet105(p)-feet105(this.player))<ROUTE_RULES_V111.noticeHeight&&!closedBetweenV105({x:center105(p),y:p.y+p.h*.5},{x:center105(this.player),y:this.player.y+this.player.h*.5},this.doors||[])){tellV105(enc,p.name,r.decision==='return-to-junction'?'C’est fermé. Je reviens au carrefour.':'Je prends l’autre passage. Gardez la commande.',3.4);routes.noticeClock=ROUTE_RULES_V111.noticeCooldown;}
   if(r.arrived){p.order='hold';p.moving=false;}
   sense.blockedTime[p.id]=p.blocked?(sense.blockedTime[p.id]||0)+sec:0;
   if(p.blocked&&sense.blockedTime[p.id]>1.2&&sense.callClock===0&&Math.abs(center105(p)-center105(this.player))<480&&Math.abs(feet105(p)-feet105(this.player))<205){tellV105(enc,p.name,'Le passage est fermé. Il faut l’ouvrir.',3.5);sense.callClock=SENSE_RULES_V106.noticeCooldown;}
   if(r.moved>0&&this.alien3OperationsV107){this.alien3CrewStrideV107[p.id]=(this.alien3CrewStrideV107[p.id]||0)+r.moved;if(this.alien3CrewStrideV107[p.id]>=62){this.alien3CrewStrideV107[p.id]%=62;if(emitNoiseV105(enc,this.alien3NavV105,p,.23,'crew-steps')){this.alien3OperationsV107.stats.crewSteps++;enc.audioEvents.push({type:'steps',x:center105(p),foot:feet105(p)});}}}
  }
 }
 drawWorld(c){const out=super.drawWorld(c);drawCrewRoutesV111(c,this);return out;}
 captureResumeState(){const out=super.captureResumeState();return this.alien3RoutesV111?{...out,specialOperation:{...out.specialOperation,alien3V111:snapshotRoutesV111(this.alien3RoutesV111)}}:out;}
 applyResumeState(raw){let routes=null;if(raw?.specialOperation?.alien3V111){if(!this.isAlien3MissionV105())return{applied:false,reason:'inactive'};const v=validateRoutesV111(raw.specialOperation.alien3V111,raw.specialOperation.alien3V105,this.alien3NavV105);if(!v.ok)return{applied:false,reason:'V111-'+v.reason};routes=v.state;}const out=super.applyResumeState(raw);if(out?.applied&&this.isAlien3MissionV105())this.alien3RoutesV111=routes||createRoutesV111(this.alien3EncounterV105,this.alien3NavV105);return out;}
};}
