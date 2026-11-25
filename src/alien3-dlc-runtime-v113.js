import {CAMPAIGN_V104} from './alien3-dlc-v104.js';
import {bindPortalsV113,compileEvidencePropsV113,coverageAuditV113,costumeV113} from './alien3-fidelity-v113.js';
import {drawPersonV113,drawPortalV113,drawEvidencePropV113,drawCompanyV113} from './alien3-art-v113.js';
export function withAlien3DlcRuntimeV113(Base){return class Alien3DlcRuntimeV113 extends Base{
 start(o={}){this.alien3FidelityActiveV113=o.campaign?.id===CAMPAIGN_V104;const out=super.start(o);this.alien3FidelityAuditV113=this.alien3FidelityActiveV113&&this.alien3SceneV103?coverageAuditV113(this.alien3SceneV103):null;return out;}
 isAlien3FidelityV113(){return !!(this.alien3FidelityActiveV113&&this.alien3SceneV103);}
 alien3CostumeContextV113(){return {phase:this.alien3V88?.phase||'',encounter:this.alien3EncounterV105?.mode||null,reducedMotion:this.alien3V104?.settings?.reducedMotion===true};}
 drawActor(c,a){if(!this.isAlien3FidelityV113()||a!==this.player||!this.alien3VectorActorsV105)return super.drawActor?.(c,a);return drawPersonV113(c,a,this.alien3ArtTimeV102?.()||0,{...this.alien3CostumeContextV113(),player:true,id:'ripley'});}
 drawAlien3ParticipantsV113(c,enc,time){if(!this.isAlien3FidelityV113()||!this.alien3VectorActorsV105)return false;for(const a of [...enc.participants].sort((a,b)=>(a.depth??1)-(b.depth??1)))if(a.alive)drawPersonV113(c,a,time,{...this.alien3CostumeContextV113(),id:a.id});return true;}
 drawDoor(c,d){if(!this.isAlien3FidelityV113())return super.drawDoor?.(c,d);const p=bindPortalsV113(this.alien3SceneV103,[d]).find(p=>p.id===d.id);return p?.valid?drawPortalV113(c,p,d):super.drawDoor?.(c,d);}
 drawAlien3FidelitySceneryV113(c,scene,{flags={},time=0}={}){if(!this.isAlien3FidelityV113())return;const cam=this.camera||{x:0};for(const p of compileEvidencePropsV113(scene))if(p.x+p.w>=cam.x-30&&p.x<=cam.x+1310)drawEvidencePropV113(c,p,{flags,time});
  // Only explicit arrival visuals, never inserted into actors/enemies or inventories.
  if(flags.companyArrived&&!this.alien3EncounterV105&&this.alien3VectorActorsV105){const n=scene.nodes.find(n=>n.id==='f161-company');if(n)for(const [i,offset]of [-42,63].entries()){const a={id:'arrival-guard-'+i,alive:true,x:n.x+offset,y:n.y-105,w:44,h:105,facing:-1};if(a.x+44>=cam.x&&a.x<cam.x+1300)drawCompanyV113(c,a,time);}}
 }
 getSnapshot(){return {...super.getSnapshot(),...(this.isAlien3FidelityV113()?{fidelityAuditV113:this.alien3FidelityAuditV113}: {})};}
};}
