import { securityAngleV9 } from './alien-earth-security-v9.js';

/** Clip each projected ground ray against the same solid footprints used by perception. */
export function securityRayV9(room,origin,angle,range){
 const dx=Math.cos(angle),dz=Math.sin(angle)/3.2;
 let result={x:origin.x,z:origin.z};
 for(let r=0;r<=range;r+=8){
  const p={x:origin.x+dx*r,z:origin.z+dz*r};
  if(p.x<35||p.x>room.width-35||p.z<25||p.z>225||room.props.some(o=>o.solid&&p.x>o.x&&p.x<o.x+o.w&&p.z>o.z&&p.z<o.z+o.d))break;
  result=p;
 }
 return result;
}
export function drawSecurityGroundV9(renderer,engine){
 const d=engine.localSecurity;if(!d)return;
 const mode=engine.securityMode(d.id);if(!['scan','alarm','cooldown'].includes(mode))return;
 const c=renderer.c,o=d.sensor,a=securityAngleV9(d,engine.state.playSeconds),x=o.x-renderer.camera,y=renderer.foot(o.z),alarm=mode==='alarm';
 c.save();c.beginPath();c.moveTo(x,y);
 for(let i=0;i<=30;i++){const p=securityRayV9(engine.room,o,a-o.halfAngle+i*o.halfAngle*2/30,o.range);c.lineTo(p.x-renderer.camera,renderer.foot(p.z));}
 c.closePath();c.fillStyle=alarm?'#ea836626':'#caba7922';c.fill();c.strokeStyle=alarm?'#ed9c6c60':'#b2cda54a';c.lineWidth=1;c.stroke();
 const end=securityRayV9(engine.room,o,a,o.range);c.beginPath();c.moveTo(x,y);c.lineTo(end.x-renderer.camera,renderer.foot(end.z));c.strokeStyle=alarm?'#f0b08da0':'#c8dbaa90';c.stroke();c.restore();
}
export function drawSecurityDeviceV9(renderer,engine){
 const d=engine.localSecurity;if(!d)return;
 const c=renderer.c,u=engine.securityUnit(d.id),mode=engine.securityMode(d.id),x=d.sensor.x-renderer.camera,y=renderer.foot(d.sensor.z),a=securityAngleV9(d,engine.state.playSeconds);
 const col={off:'#687777',scan:'#c9d6a5',alarm:'#ee9c79',cooldown:'#aeaaa1',stunned:'#82bed0',isolated:'#759d89',broken:'#846a61'}[mode];
 c.save();c.translate(x,y);c.fillStyle='#051416aa';c.beginPath();c.ellipse(0,2,29,9,0,0,Math.PI*2);c.fill();
 // No collision: a narrow service pedestal, not an invisible cabinet across the floor.
 c.fillStyle='#182d31';c.strokeStyle='#5c7778';c.lineWidth=2;c.fillRect(-18,-16,36,18);c.strokeRect(-18,-16,36,18);c.fillStyle='#4c6764';c.fillRect(-5,-104,10,89);
 c.fillStyle='#314b4b';c.fillRect(-9,-61,18,9);c.strokeStyle='#18282a';c.lineWidth=3;c.beginPath();c.moveTo(8,-20);c.bezierCurveTo(24,-35,5,-70,9,-105);c.stroke();
 c.save();c.translate(0,-106);if(mode==='broken')c.rotate(.32);
 c.fillStyle=mode==='broken'?'#493f37':'#607870';c.fillRect(-24,-19,48,33);c.strokeStyle='#a7b1a0';c.lineWidth=1;c.strokeRect(-24,-19,48,33);
 c.fillStyle='#112022';c.fillRect(-19,-13,38,23);c.fillStyle=col;c.beginPath();c.ellipse(Math.cos(a)*8,-2,mode==='broken'?3:7,7,0,0,Math.PI*2);c.fill();
 if(mode==='isolated'){c.strokeStyle='#d6c789';c.lineWidth=4;c.beginPath();c.moveTo(-22,-17);c.lineTo(22,11);c.stroke();}
 if(mode==='broken'){c.strokeStyle='#b79a79';c.beginPath();c.moveTo(-14,-14);c.lineTo(3,2);c.lineTo(-2,12);c.stroke();}
 c.restore();c.textAlign='center';c.font='10px ui-monospace,monospace';c.fillStyle='#d8dbbd';c.fillText(d.id,0,-143);
 const labels={off:'HORS TENSION',scan:'VEILLE OPTIQUE',alarm:'ALARME LOCALE',cooldown:'RÉARMEMENT',stunned:'AVEUGLÉ',isolated:'CONSIGNÉ',broken:'HORS SERVICE'};
 c.fillStyle=col;c.font='9px ui-monospace,monospace';c.fillText(labels[mode],0,-155);
 const work=engine.securityReading;if(work?.id===d.id&&work.time>0){c.fillStyle='#142326';c.fillRect(-38,-135,76,5);c.fillStyle='#e0ac81';c.fillRect(-38,-135,Math.min(76,work.time/d.acquisition*76),5);}
 if(u.integrity<100&&u.integrity>0){c.fillStyle='#112324';c.fillRect(-22,17,44,3);c.fillStyle='#d4b086';c.fillRect(-22,17,44*u.integrity/100,3);}
 c.restore();
}
