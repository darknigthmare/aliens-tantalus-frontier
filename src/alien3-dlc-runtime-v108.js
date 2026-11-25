import {CAMPAIGN_V104} from './alien3-dlc-v104.js';
import {center105,feet105} from './alien3-navigation-v105.js';
import {emitNoiseV105,tellV105} from './alien3-encounter-v105.js';
import {effectiveLaneV107} from './alien3-operations-v107.js';
import {createDiversionV108,compileBoltGeometryV108,throwBoltV108,recoverBoltV108,advanceBoltsV108,snapshotDiversionV108,validateDiversionV108} from './alien3-diversion-v108.js';
import {drawBoltsV108,drawDiversionHudV108} from './alien3-art-v108.js';
const editing=t=>Boolean(t?.closest?.('input,textarea,select,button,a,[contenteditable]:not([contenteditable="false"])'));
/** Optional local diversion owner. No historical stage, damage or roster is replaced. */
export function withAlien3DlcRuntimeV108(Base){return class Alien3DlcRuntimeV108 extends Base{
 start(options={}){this.alien3InputAbortV108?.abort();this.alien3DiversionV108=null;this.alien3BoltGeometryV108=null;this.alien3SafePointV108=null;const out=super.start(options);if(options.campaign?.id===CAMPAIGN_V104){this.alien3BoltGeometryV108=compileBoltGeometryV108(this.alien3NavV105);this.alien3DiversionV108 ||=createDiversionV108(this.alien3EncounterV105,this.alien3NavV105);this.bindAlien3InputV108();}return out;}
 beginAlien3EncounterV105(mode,options){const result=super.beginAlien3EncounterV105(mode,options);if(result){this.alien3DiversionV108=createDiversionV108(this.alien3EncounterV105,this.alien3NavV105);this.alien3BoltGeometryV108=compileBoltGeometryV108(this.alien3NavV105);this.alien3SafePointV108=null;}return result;}
 alien3CanUseDiversionV108(){return !!(this.alien3DiversionV108&&this.alien3EncounterV105&&!this.alien3BlockedV105()&&!this.alien3OperationsV107?.active);}
 throwAlien3BoltV108(){if(!this.alien3CanUseDiversionV108())return false;const out=throwBoltV108(this.alien3DiversionV108,this.player,this.alien3BoltGeometryV108,this.doors||[],effectiveLaneV107(this));if(!out.ok&&out.message)tellV105(this.alien3EncounterV105,'',out.message,2.2);return out.ok;}
 recoverAlien3BoltV108(){if(!this.alien3CanUseDiversionV108())return false;return recoverBoltV108(this.alien3DiversionV108,this.player,this.alien3BoltGeometryV108,this.doors||[],effectiveLaneV107(this)).ok;}
 update(dt){if(this.alien3DiversionV108&&this.alien3EncounterV105&&!this.alien3BlockedV105()){
  const events=advanceBoltsV108(this.alien3DiversionV108,this.alien3BoltGeometryV108,this.doors||[],dt,{hotLead:this.alien3EncounterV105.flags.poured&&!this.alien3EncounterV105.flags.cooled});
  for(const e of events)if(e.type==='impact'){
   const source={x:e.x,y:e.foot,w:0,h:0,depth:e.depth};emitNoiseV105(this.alien3EncounterV105,this.alien3NavV105,source,e.power,`bolt:${e.id}:${e.flight}`);
   this.alien3EncounterV105.audioEvents.push({type:'metal',x:e.x,foot:e.foot});
  }
 }
 return super.update(dt);}
 updateAlien3PursuitV106(enc,dt,options){const before=enc.pursuit.stats.sounds;const out=super.updateAlien3PursuitV106(enc,dt,options);const trace=enc.pursuit.trace;
 if(this.alien3DiversionV108&&enc.pursuit.stats.sounds>before&&trace?.kind==='noise'&&(enc.noises||[]).some(n=>String(n.source).startsWith('bolt:')&&n.x===trace.x&&n.foot===trace.foot))this.alien3DiversionV108.stats.heard++;
 return out;}
 bindAlien3InputV108(){if(typeof globalThis.addEventListener!=='function')return;this.alien3InputAbortV108=new AbortController();globalThis.addEventListener('keydown',event=>{
  if(!['KeyT','KeyY'].includes(event.code)||event.repeat||event.isComposing||event.metaKey||event.altKey||event.ctrlKey||editing(event.target)||!this.alien3CanUseDiversionV108())return;
  event.preventDefault();event.stopImmediatePropagation();if(event.code==='KeyT')this.throwAlien3BoltV108();else this.recoverAlien3BoltV108();
 },{capture:true,signal:this.alien3InputAbortV108.signal});}
 drawWorld(c){const out=super.drawWorld(c);if(this.alien3DiversionV108)drawBoltsV108(c,this);return out;}
 drawHud(c){super.drawHud(c);drawDiversionHudV108(c,this);}
 captureResumeState(){const base=super.captureResumeState();if(!this.alien3DiversionV108)return base;return {...base,specialOperation:{...base.specialOperation,alien3V108:snapshotDiversionV108(this.alien3DiversionV108)}};}
 applyResumeState(raw){if(raw?.specialOperation?.alien3V108&&!this.isAlien3MissionV105())return {applied:false,reason:'inactive'};let bolts=null;if(raw?.specialOperation?.alien3V108){const physicalDoors=(this.doors||[]).map(d=>{const saved=Array.isArray(raw.doors)?raw.doors.find(x=>x.id===d.id):null;return saved?{...d,open:saved.open===true,progress:saved.open===true?1:0}:d;});const check=validateDiversionV108(raw.specialOperation.alien3V108,raw?.specialOperation?.alien3V105,this.alien3NavV105,physicalDoors);if(!check.ok)return {applied:false,reason:'V108-'+check.reason};bolts=check.state;}
 const out=super.applyResumeState(raw);if(out?.applied&&this.isAlien3MissionV105()){this.alien3BoltGeometryV108=compileBoltGeometryV108(this.alien3NavV105);this.alien3DiversionV108=bolts||createDiversionV108(this.alien3EncounterV105,this.alien3NavV105);}return out;}
 stop(...args){this.alien3InputAbortV108?.abort();return super.stop?.(...args);}
};}
