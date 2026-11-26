import { EARTH_DATA } from './alien-earth-data.js';

export function drawContainmentPadV5(renderer,prop,engine,drawCreature){
 if(prop.type!=='containment-pad-v5')return false;
 const def=EARTH_DATA.containmentPads.find(p=>p.id===prop.padId);if(!def)return true;
 const p=engine.podState(def.id),c=renderer.c,x=def.x-renderer.camera,y=renderer.foot(def.z);
 const occupied=p.status==='sealed',armed=p.status==='armed',broken=p.status==='broken';
 const ink=broken?'#be8574':occupied?'#91c9be':armed?'#ead39a':'#6d8886';
 const rect=(xx,yy,w,h,fill,r=3)=>{c.fillStyle=fill;c.beginPath();c.roundRect(xx,yy,w,h,r);c.fill();};
 const mark=(label,yy,size=9)=>{c.font=`600 ${size}px monospace`;c.textAlign='center';c.fillStyle=ink;c.fillText(label,x,yy);};
 c.save();c.fillStyle='#0006';c.beginPath();c.ellipse(x,y+9,73,15,0,0,Math.PI*2);c.fill();
 // Floor mechanism remains traversable. The glass is visual, not a hidden navigation wall.
 rect(x-64,y-7,128,21,'#172f32',8);rect(x-55,y-11,110,13,'#536e6b',5);
 for(let n=0;n<8;n++)rect(x-45+n*13,y-7,7,5,'#263e41',1);
 c.strokeStyle=ink;c.lineWidth=1.5;c.beginPath();c.ellipse(x,y-9,49,11,0,0,Math.PI*2);c.stroke();
 if(occupied){
  const rec=engine.state.containment.records[p.sample];
  const g=c.createLinearGradient(x-55,0,x+55,0);g.addColorStop(0,'#8ebfb95c');g.addColorStop(.45,'#153b423b');g.addColorStop(1,'#8ebfb965');
  rect(x-58,y-119,116,112,g,20);c.strokeStyle='#a3d0c182';c.stroke();
  c.save();c.beginPath();c.roundRect(x-50,y-111,100,97,17);c.clip();
  if(rec)drawCreature(c,x,y-23,{kind:rec.kind,mode:'observing',facing:-1,stun:0,patrol:1},renderer.time*.3,.43);
  c.restore();
  rect(x-65,y-122,130,12,'#62837b',5);rect(x-61,y-22,122,13,'#29494b',3);
  rect(x-50,y-108,4,75,'#cfebc75c',2);rect(x+44,y-108,2,75,'#cfebc747',1);
  mark(rec?.studied?'ÉTUDE CONSERVÉE':'SPÉCIMEN CONFINÉ',y-137,9);
  if(p.integrity>=100&&engine.podPressure[def.id])mark('CHOC IMMINENT',y-160,9);
  if(p.integrity<100){rect(x-48,y-153,96,5,'#273c3c');rect(x-48,y-153,96*p.integrity/100,5,'#e5b68b');mark('PRESSION · '+Math.ceil(p.integrity)+' %',y-164,8);}
 }else if(broken){
  c.strokeStyle='#8b9993';c.lineWidth=2;c.beginPath();c.moveTo(x-56,y-18);c.lineTo(x-50,y-53);c.lineTo(x-34,y-24);c.moveTo(x+46,y-15);c.lineTo(x+59,y-65);c.lineTo(x+63,y-17);c.stroke();
  for(let n=0;n<5;n++)rect(x-55+n*22,y+15+(n%2)*8,9,3,'#93b2a67a',1);mark('ENCEINTE ROMPUE',y-73);
 }else{
  for(const direction of [-1,1]){rect(x+direction*59-6,y-36,12,33,'#486d6a',3);rect(x+direction*59-3,y-30,6,16,ink,2);}
  if(armed){
   const remaining=Math.max(0,Math.ceil(p.expiresAt-engine.time));
   const wave=renderer.reduced?8:(renderer.time*33)%40;
   c.strokeStyle='#e3c18370';c.beginPath();c.ellipse(x,y-12,25+wave,7+wave*.23,0,0,Math.PI*2);c.stroke();
   mark((p.preset==='flyer'?'VOLANTS':'RAMPEURS')+' · '+remaining+' S',y-58);
   const dwell=engine.podDwell[def.id];if(dwell){rect(x-43,y-73,86,5,'#264c4c');rect(x-43,y-73,86*Math.min(1,dwell.time/.8),5,'#ecce8e');}
  }else mark(p.status==='spent'?'CARTOUCHE ÉPUISÉE':'CONFINEMENT',y-48);
 }
 mark(def.id,y+35,8);c.restore();return true;
}
