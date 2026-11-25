import {CAMPAIGN_V104} from './alien3-dlc-v104.js';
import {delta105,center105,feet105,closedBetweenV105} from './alien3-navigation-v105.js';
import {tellV105,emitNoiseV105} from './alien3-encounter-v105.js';
import {SENSE_RULES_V106} from './alien3-senses-v106.js';
import {fieldsV109} from './alien3-steam-v109.js';
import {TRAFFIC_RULES_V110} from './alien3-traffic-v110.js';
import {ROUTE_RULES_V111} from './alien3-routing-v111.js';
import {SPACING_RULES_V112,createSpacingV112,spacedCrewMoveV112,crewUpdateOrderV112,snapshotSpacingV112,validateSpacingV112} from './alien3-spacing-v112.js';
import {drawSpacingV112} from './alien3-art-v112.js';
export function withAlien3DlcRuntimeV112(Base){return class Alien3DlcRuntimeV112 extends Base{
 start(o={}){this.alien3SpacingV112=null;this.alien3SafePointV112=null;const out=super.start(o);if(o.campaign?.id===CAMPAIGN_V104)this.alien3SpacingV112 ||=createSpacingV112(this.alien3EncounterV105,this.alien3NavV105);return out;}
 beginAlien3EncounterV105(mode,options){const out=super.beginAlien3EncounterV105(mode,options);if(out){this.alien3SpacingV112=createSpacingV112(this.alien3EncounterV105,this.alien3NavV105);this.alien3SafePointV112=null;}return out;}
 updateAlien3ParticipantsV106(enc,dt){const spacing=this.alien3SpacingV112,s=this.alien3TrafficV110,routes=this.alien3RoutesV111,sense=this.alien3SensesV106;if(!spacing||!s||!routes||!sense||!this.alien3SteamV109)return super.updateAlien3ParticipantsV106(enc,dt);
  const sec=delta105(dt);if(!sec)return;const fields=fieldsV109(this.alien3SteamV109,this.alien3SteamGeometryV109,this.doors||[]).filter(f=>f.hot);
  spacing.noticeClock=Math.max(0,spacing.noticeClock-sec);routes.noticeClock=Math.max(0,routes.noticeClock-sec);sense.captionClock=Math.max(0,sense.captionClock-sec);sense.callClock=Math.max(0,sense.callClock-sec);this.alien3OrdersCooldownV106=Math.max(0,this.alien3OrdersCooldownV106-sec);
  const visible=(a,distance,height)=>Math.abs(center105(a)-center105(this.player))<distance&&Math.abs(feet105(a)-feet105(this.player))<height&&Math.abs((a.depth??1)-(this.player.depth??1))<=.4&&!closedBetweenV105({x:center105(a),y:a.y+a.h*.5},{x:center105(this.player),y:this.player.y+this.player.h*.5},this.doors||[]);
  for(const p of crewUpdateOrderV112(enc.participants,this.alien3NavV105)){
   if(!p.alive||!p.goal){delete spacing.waiting[p.id];continue;}
   const r=spacedCrewMoveV112(spacing,routes,p,p.goal,this.alien3NavV105,this.doors||[],sec,fields,enc.participants,{speed:p.id==='dillon'?105:112,held:!!sense.holds[p.id]});
   if(r.held){p.blocked=false;continue;}
   if(r.yielding){delete s.waiting[p.id];sense.blockedTime[p.id]=0;if(spacing.noticeClock<=0&&visible(p,SPACING_RULES_V112.noticeDistance,SPACING_RULES_V112.noticeHeight)){const other=enc.participants.find(a=>a.id===r.companionId);tellV105(enc,p.name,other?`Je laisse passer ${other.name}.`:'Je vous laisse passer.',2.8);spacing.noticeClock=SPACING_RULES_V112.noticeCooldown;}continue;}
   if(r.waiting){if(!s.waiting[p.id])s.stats.waitingStarts++;s.waiting[p.id]=r.siteId;s.stats.waitingSeconds+=sec;sense.blockedTime[p.id]=0;
    if(s.noticeClock===0&&visible(p,TRAFFIC_RULES_V110.noticeDistance,TRAFFIC_RULES_V110.noticeHeight)){tellV105(enc,p.name,'Ça brûle. Je passe après le jet.',3.4);s.noticeClock=TRAFFIC_RULES_V110.noticeCooldown;}continue;}
   if(s.waiting[p.id]&&(r.moved>0||r.arrived)){delete s.waiting[p.id];s.stats.resumed++;}
   if(r.detouring&&routes.noticeClock<=0&&visible(p,ROUTE_RULES_V111.noticeDistance,ROUTE_RULES_V111.noticeHeight)){tellV105(enc,p.name,r.decision==='return-to-junction'?'C’est fermé. Je reviens au carrefour.':'Je prends l’autre passage. Gardez la commande.',3.4);routes.noticeClock=ROUTE_RULES_V111.noticeCooldown;}
   if(r.arrived){p.order='hold';p.moving=false;}
   sense.blockedTime[p.id]=p.blocked?(sense.blockedTime[p.id]||0)+sec:0;
   if(p.blocked&&sense.blockedTime[p.id]>1.2&&sense.callClock===0&&visible(p,480,205)){tellV105(enc,p.name,'Le passage est fermé. Il faut l’ouvrir.',3.5);sense.callClock=SENSE_RULES_V106.noticeCooldown;}
   if(r.moved>0&&this.alien3OperationsV107){this.alien3CrewStrideV107[p.id]=(this.alien3CrewStrideV107[p.id]||0)+r.moved;if(this.alien3CrewStrideV107[p.id]>=62){this.alien3CrewStrideV107[p.id]%=62;if(emitNoiseV105(enc,this.alien3NavV105,p,.23,'crew-steps')){this.alien3OperationsV107.stats.crewSteps++;enc.audioEvents.push({type:'steps',x:center105(p),foot:feet105(p)});}}}
  }
 }
 drawWorld(c){const changed=[];for(const id of Object.keys(this.alien3SpacingV112?.waiting||{})){const mem=this.alien3RoutesV111?.memory[id];if(mem?.active){changed.push(mem);mem.active=false;}}let out;try{out=super.drawWorld(c);}finally{for(const mem of changed)mem.active=true;}drawSpacingV112(c,this);return out;}
 captureResumeState(){const out=super.captureResumeState();return this.alien3SpacingV112?{...out,specialOperation:{...out.specialOperation,alien3V112:snapshotSpacingV112(this.alien3SpacingV112)}}:out;}
 applyResumeState(raw){let spacing=null;if(raw?.specialOperation?.alien3V112){if(!this.isAlien3MissionV105())return{applied:false,reason:'inactive'};const v=validateSpacingV112(raw.specialOperation.alien3V112,raw.specialOperation.alien3V105,this.alien3NavV105);if(!v.ok)return{applied:false,reason:'V112-'+v.reason};spacing=v.state;}const out=super.applyResumeState(raw);if(out?.applied&&this.isAlien3MissionV105())this.alien3SpacingV112=spacing||createSpacingV112(this.alien3EncounterV105,this.alien3NavV105);return out;}
};}
