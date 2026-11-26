/** Portable game prop, drawn at the same floor depth as the actor. No opaque terrain-sized overlay. */
export function drawSensorV6(renderer,engine,d) {
 const c=renderer.c,x=d.x-renderer.camera,y=renderer.foot(d.z),scale=.86+d.z*.00105;
 if(x<-80||x>1360)return;
 const pulse=d.pulseUntil>engine.time,on=d.battery>0,col=pulse?'#e1b77b':on?'#95d6c9':'#758783';
 c.save();c.translate(x,y);c.scale(scale,scale);
 c.fillStyle='#07191c88';c.beginPath();c.ellipse(0,2,31,9,0,0,Math.PI*2);c.fill();
 c.strokeStyle='#778e87';c.lineWidth=3;
 for(const side of [-1,1]){c.beginPath();c.moveTo(side*7,-24);c.lineTo(side*25,1);c.lineTo(side*32,1);c.stroke();}
 c.fillStyle='#244347';c.strokeStyle='#9ab6a8';c.lineWidth=1.5;c.beginPath();c.roundRect(-16,-48,32,31,5);c.fill();c.stroke();
 c.fillStyle='#0b252b';c.fillRect(-11,-40,22,13);
 c.fillStyle=col;c.fillRect(-8,-36,16*d.battery/180,5);
 c.strokeStyle='#bfc9ae';c.lineWidth=2;c.beginPath();c.moveTo(0,-48);c.lineTo(0,-68);c.stroke();
 c.fillStyle=col;c.beginPath();c.arc(0,-69,3.5,0,Math.PI*2);c.fill();
 if(on||pulse){c.strokeStyle=pulse?'#e1b77b88':'#95d6c944';c.lineWidth=1.2;const t=renderer.reduced?.5:(engine.time%1.5)/1.5;
  c.beginPath();c.ellipse(0,2,33+t*18,9+t*6,0,0,Math.PI*2);c.stroke();}
 c.font='9px monospace';c.textAlign='center';c.fillStyle='#d6d6b5';c.fillText(d.id,0,-80);
 if(engine.nearestInteraction()?.id===d.id){c.font='12px monospace';c.fillStyle='#e2cb94';c.fillText('E',0,-98);}
 c.restore();
}
