/** Shared, pure drawing. All timing comes from the simulation, never Date.now(). */
import {OPERATIONS_V107,operatorFittingsV107,operationDrawingAnchorV107} from './alien3-operations-v107.js';
import {drawHudV104} from './alien3-art-v104.js';
import {drawEncounterHudV105} from './alien3-art-v105.js';
import {drawSensesHintV106} from './alien3-art-v106.js';
import {stationV105} from './alien3-encounter-v105.js';
export function drawOperationWorldV107(c,engine){const work=engine.alien3OperationsV107?.active;if(!work)return false;const def=OPERATIONS_V107.find(d=>d.id===work.id),station=stationV105(engine.alien3NavV105,def.station);const anchor=operationDrawingAnchorV107(engine.alien3NavV105,def);if(!station||!anchor)return false;const {x,y}=anchor,ratio=Math.max(0,Math.min(1,work.elapsed/def.seconds));
 c.save();c.strokeStyle='#ddc28a';c.lineWidth=2;c.fillStyle='rgba(11,23,16,.88)';c.beginPath();c.arc(x,y,anchor.r,0,Math.PI*2);c.fill();c.stroke();
 if(def.id==='report'){c.strokeStyle='#c2c9ad';c.strokeRect(x-6,y-7,12,15);c.beginPath();c.moveTo(x-3,y-3);c.lineTo(x+4,y-3);c.moveTo(x-3,y+1);c.lineTo(x+4,y+1);c.stroke();}
 else {const angle=engine.alien3V104?.settings?.reducedMotion?0:ratio*Math.PI*2.7;for(let i=0;i<4;i++){c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.cos(angle+i*Math.PI/2)*11,y+Math.sin(angle+i*Math.PI/2)*11);c.stroke();}}
 c.restore();return true;}
export function drawOperationHudV107(c,engine){const s=engine.alien3OperationsV107,w=s?.active;if(!w||engine.alien3MapOpenV103||engine.alien3V98?.codexUi?.open||engine.paused)return false;const def=OPERATIONS_V107.find(d=>d.id===w.id);if(!def)return false;const ratio=Math.max(0,Math.min(1,w.elapsed/def.seconds));
 c.save();c.fillStyle='rgba(7,18,13,.97)';c.fillRect(368,579,544,76);c.fillStyle='#b59e6e';c.fillRect(368,579,2,76);c.font='600 14px sans-serif';c.fillStyle='#d9ddbf';c.textAlign='left';c.fillText(def.label,387,602);c.font='11px sans-serif';c.fillStyle='#a7b69c';c.fillText(s.inputMode==='toggle'?'E  Annuler · Bouger pour lâcher la commande':'Gardez E enfoncé · Relâchez pour lâcher la commande',387,623);c.fillStyle='#304837';c.fillRect(387,638,504,4);c.fillStyle='#d5bf89';c.fillRect(387,638,504*ratio,4);c.restore();return true;}

export function drawOperatorFittingsV107(c,engine){if(engine.alien3EncounterV105?.mode!=='rabattage')return;for(const p of operatorFittingsV107(engine.alien3NavV105)){if(p.x+p.w<engine.camera.x||p.x>engine.camera.x+1280)continue;c.save();c.lineWidth=1.5;c.strokeStyle='#a0aa87';c.fillStyle='#263d2e';
 if(p.kind==='housing'||p.kind==='pipe'){c.fillRect(p.x,p.y,p.w,p.h);c.strokeRect(p.x,p.y,p.w,p.h);if(p.kind==='housing'){c.fillStyle='#8d9d79';c.fillRect(p.x+5,p.y+8,p.w-10,4);}}
 else {const x=p.x+p.w/2,y=p.y+p.h/2;c.beginPath();c.arc(x,y,p.w*.46,0,Math.PI*2);c.fill();c.stroke();if(p.kind==='gauge'){c.fillStyle='#aab394';c.beginPath();c.arc(x,y,p.w*.33,0,Math.PI*2);c.fill();c.strokeStyle='#4a563e';const ready=engine.alien3EncounterV105.flags.waterPrimed;const w=engine.alien3OperationsV107?.active,ratio=w?.id==='prime'?Math.min(1,w.elapsed/1.8):ready?1:0;const angle=-Math.PI*.80+ratio*Math.PI*.95;c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.cos(angle)*p.w*.28,y+Math.sin(angle)*p.h*.28);c.stroke();}else{for(let i=0;i<4;i++){c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.cos(i*Math.PI/2)*p.w*.41,y+Math.sin(i*Math.PI/2)*p.h*.41);c.stroke();}}}c.restore();}}
export function drawWorkingHudV107(c,engine){
 // A read-only view prevents duplicate dialogue/help panels during the gesture.
 const view=Object.create(engine);view.alien3EncounterV105={...engine.alien3EncounterV105,notice:{speaker:'',text:'',remaining:0}};view.getInteractionPrompt=()=>'';
 drawHudV104(c,view);drawEncounterHudV105(c,view);drawSensesHintV106(c,view);drawOperationHudV107(c,engine);
}
