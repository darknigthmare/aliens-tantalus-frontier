import {CAMPAIGN_V104} from './alien3-dlc-v104.js';
import {auditWorldV114,fidelityMatrixV114,CUTS_V114} from './alien3-world-v114.js';
import {fidelityInventoryV114} from './alien3-fidelity-v114.js';
import {drawSupplementalWorldV114,drawCommandoUpgradeV114} from './alien3-art-v114.js';
export function withAlien3DlcRuntimeV114(Base){return class Alien3DlcRuntimeV114 extends Base{
 start(o={}){this.alien3FidelityActiveV114=o.campaign?.id===CAMPAIGN_V104;this.alien3CutV114=['theatrical','assembly'].includes(o.alien3CutV114)?o.alien3CutV114:'theatrical';this.alien3InspectionRoomV114=null;const out=super.start(o);if(this.alien3FidelityActiveV114&&this.alien3SceneV103)this.refreshAlien3FidelityV114();return out;}
 refreshAlien3FidelityV114(){this.alien3WorldAuditV114=auditWorldV114(this.alien3SceneV103,this.alien3CutV114);this.alien3FidelityMatrixV114=fidelityMatrixV114(this.alien3SceneV103);this.alien3InventoryV114=fidelityInventoryV114(this.alien3CutV114);return this.alien3WorldAuditV114;}
 setAlien3CutV114(cut){if(!CUTS_V114[cut])return false;this.alien3CutV114=cut;this.alien3InspectionRoomV114=null;this.refreshAlien3FidelityV114();return true;}
 setAlien3InspectionRoomV114(id=null){this.alien3InspectionRoomV114=id||null;return true;}
 drawAlien3FidelitySceneryV113(c,scene,opts={}){super.drawAlien3FidelitySceneryV113(c,scene,opts);if(!this.alien3FidelityActiveV114)return;drawSupplementalWorldV114(c,scene,{cut:this.alien3CutV114,camera:this.camera||{x:0},inspectionRoom:this.alien3InspectionRoomV114,flags:opts.flags||{},time:opts.time||0});if((opts.flags||{}).companyArrived&&!this.alien3EncounterV105&&this.alien3VectorActorsV105){const n=scene.nodes.find(n=>n.id==='f161-company');if(n)for(const [i,offset]of [-42,63].entries())drawCommandoUpgradeV114(c,{x:n.x+offset,y:n.y-105,w:44,h:105,facing:-1,id:'v114-company-'+i});}}
 drawCompanyV114Overlay(c,scene){if(!this.alien3FidelityActiveV114||!this.alien3V89?.company?.visible||this.alien3EncounterV105)return;const n=scene.nodes.find(n=>n.id==='f161-company');if(!n)return;for(const [i,offset]of [-42,63].entries())drawCommandoUpgradeV114(c,{x:n.x+offset,y:n.y-105,w:44,h:105,facing:-1,id:'v114-company-'+i});}
 getSnapshot(){return {...super.getSnapshot(),...(this.alien3FidelityActiveV114?{fidelityV114:{cut:this.alien3CutV114,audit:this.alien3WorldAuditV114,inventory:this.alien3InventoryV114}}:{})};}
};}
