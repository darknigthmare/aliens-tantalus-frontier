/** Drawing is a read-only view of the bolt simulation. No synthetic screenshots. */
import {pocketCountV108,nearbyBoltV108} from './alien3-diversion-v108.js';
import {effectiveLaneV107} from './alien3-operations-v107.js';
function plane(lane){return {scale:.88+lane*.08,offset:(lane-1)*24};}
export function drawBoltsV108(c,engine){const state=engine.alien3DiversionV108;if(!state)return 0;const camera=engine.camera||{x:0,y:0};let drawn=0;c.save();
 for(const b of state.bolts){if(!['flying','rest'].includes(b.state)||b.x<camera.x-20||b.x>camera.x+1300)continue;const d=plane(b.depth),x=b.x,y=b.y+d.offset;c.save();c.translate(x,y);c.scale(d.scale,d.scale);c.rotate(b.state==='flying'?b.age*12*(b.vx<0?-1:1):.15);c.strokeStyle='#e0ceb0';c.fillStyle='#8a8b73';c.lineWidth=1.3;c.fillRect(-6,-1.8,10,3.6);c.strokeRect(-6,-1.8,10,3.6);c.fillStyle='#d6cfaf';c.fillRect(3,-3.5,3,7);c.restore();
 if(b.state==='flying'&&!engine.alien3V104?.settings?.reducedMotion){c.strokeStyle='rgba(194,202,177,.36)';c.lineWidth=1;c.beginPath();c.moveTo(x,y);c.lineTo(x-b.vx*.034,y-b.vy*.034);c.stroke();}
 if(b.impactWait>.07&&!engine.alien3V104?.settings?.reducedMotion){const age=.12-b.impactWait;c.strokeStyle='rgba(227,214,174,.55)';c.lineWidth=1;c.beginPath();c.arc(x,y,4+age*100,0,Math.PI*2);c.stroke();}drawn++;
 }
 c.restore();return drawn;}
export function drawDiversionHudV108(c,engine){const s=engine.alien3DiversionV108;if(!s?.bolts.length||engine.alien3MapOpenV103||engine.alien3V98?.codexUi?.open||engine.paused||engine.alien3EncounterV105?.status!=='active'||engine.alien3OperationsV107?.active)return false;
 const close=nearbyBoltV108(s,engine.player,engine.alien3BoltGeometryV108,engine.doors||[],effectiveLaneV107(engine));const count=pocketCountV108(s);
 c.save();c.fillStyle='rgba(8,18,13,.95)';c.fillRect(1035,70,222,54);c.strokeStyle='#59664f';c.lineWidth=1;c.beginPath();c.moveTo(1035,70);c.lineTo(1035,124);c.stroke();c.fillStyle='#c5cfb2';c.font='600 11px sans-serif';c.fillText(close?'Y  Ramasser le boulon':count?'T  Lancer un boulon':'Aucun boulon en poche',1048,91);c.font='11px sans-serif';c.fillStyle='#a6b397';c.fillText(`${count} en poche${close?' · à vos pieds':''}`,1048,110);c.restore();return true;}
