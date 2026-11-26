import { PASSAGE_NAMES, portalApproach } from './spatial.js';
/** Architectural rendering using the exact local portal descriptors.
 * This is a cutaway projection: facade/backdrop pixels are not new playable rooms.
 */
export function drawSpatialArchitecture(v){
 const r=v.engine.room,c=v.c,b=r.shell.bounds,base=r.view==='SIDE'?520:410;
 if(!r.shell.closed)return;
 for(const [wx,direction] of [[b.left,1],[b.right,-1]]){
  const x=wx-v.camera,y=v.project(wx,300).y;
  if(x<-200||x>1640)continue;
  if(r.kit==='derelict'||r.kit==='hive'){
   c.strokeStyle='#243e32';c.lineWidth=38;c.beginPath();c.moveTo(x-direction*28,100);c.bezierCurveTo(x+direction*90,260,x-direction*70,440,x,y+58);c.stroke();
   v.line(x,102,x,y+51,'#80977755',3);continue;
  }
  // The full-height side return links the rear wall to the visible end bulkhead.
  c.fillStyle='#162c23';c.strokeStyle='#61796a';c.lineWidth=2;c.beginPath();c.moveTo(x-direction*66,95);c.lineTo(x+direction*27,128);c.lineTo(x+direction*27,y+24);c.lineTo(x-direction*66,y+45);c.closePath();c.fill();c.stroke();
  v.line(x+direction*17,131,x+direction*17,y+16,'#aec4a166',5);
  v.line(x-direction*66,base,x+direction*27,y+24,'#adb89455',3);
 }
 // A labelled raised sill makes the rear plane readable, including CLASSIC.
 v.line(35-v.camera,base,v.engine.room.w-35-v.camera,base,'#d0d1ad66',3);
}
export function drawMountedPortal(v,e){
 const engine=v.engine,s=engine.s,r=engine.room,c=v.c,m=e.portal,q=v.project(e.point.x,e.point.y),base=r.view==='SIDE'?520:410;
 const p={x:q.x,y:e.point.wall==='N'&&m.mount!=='open'&&m.mount!=='narrative'?base:q.y};
 if(p.x<-180||p.x>1620)return;
 const unlocked=s.chapter>=e.min&&(!e.flag||s.flags[e.flag])&&(!e.deny||!s.flags[e.deny])&&!(e.blockedTo===e.destination&&s.flags[e.blockFlag]);
 const open=unlocked&&!engine.sealed(e.id),ink=open?'#b7d3aa':'#d4ae75',near=Math.hypot(s.x-e.point.x,s.y-e.point.y)<108;
 const label=e.spatial.labelId+' · '+PASSAGE_NAMES[e.kind];
 if(m.mount==='narrative'){
  v.rect(p.x-42,p.y-58,84,57,'#28483b','#9dae83',2);v.rect(p.x-32,p.y-47,44,20,'#071d17','#849b74');
  for(let i=0;i<3;i++)v.rect(p.x+19,p.y-45+i*12,9,6,'#aab99a');
  v.text('RÉCIT · PAS UNE PORTE',p.x,p.y-84,11,ink,'center');v.text(e.spatial.labelId,p.x,p.y+22,10,ink,'center');return;
 }
 if(m.mount==='open'){
  if(e.kind==='passage'){
   // The arch belongs to a visible rock/hull mass, never a free-standing frame.
   if(r.exterior){c.fillStyle='#24372a';c.strokeStyle='#6d795755';c.lineWidth=3;c.beginPath();c.moveTo(p.x-171,p.y+11);c.bezierCurveTo(p.x-162,p.y-99,p.x-122,p.y-287,p.x-13,p.y-294);c.bezierCurveTo(p.x+84,p.y-309,p.x+148,p.y-112,p.x+171,p.y+11);c.closePath();c.fill();c.stroke();for(let i=0;i<4;i++){c.beginPath();c.moveTo(p.x-153+i*7,p.y-i*23);c.bezierCurveTo(p.x-118,p.y-255+i*18,p.x+116,p.y-250+i*18,p.x+152-i*5,p.y-i*23);c.stroke();}}
   c.fillStyle='#06110b';c.beginPath();c.moveTo(p.x-62,p.y+4);c.bezierCurveTo(p.x-101,p.y-215,p.x+84,p.y-241,p.x+63,p.y+4);c.closePath();c.fill();
   c.strokeStyle='#415e45';c.lineWidth=28;c.beginPath();c.moveTo(p.x-65,p.y+4);c.bezierCurveTo(p.x-120,p.y-220,p.x+90,p.y-260,p.x+66,p.y+4);c.stroke();
   c.strokeStyle='#8d9e7255';c.lineWidth=3;c.stroke();
  }else{
   v.rect(p.x-74,p.y-4,148,19,'#647a62','#afba8f',2);
   v.line(p.x-62,p.y-55,p.x-62,p.y,'#91a88b',4);v.line(p.x+62,p.y-55,p.x+62,p.y,'#91a88b',4);
   v.line(p.x-62,p.y-55,p.x+62,p.y-55,'#aec2a4',3);
   v.text(e.point.wall==='L'?'←':'→',p.x,p.y-14,25,ink,'center');
  }
  v.text(label,p.x,p.y-(e.kind==='passage'?230:79),10,ink,'center');v.text(e.destinationName,p.x,p.y+37,10,ink,'center');return;
 }
 // This uninterrupted wall/bulkhead is the physical support for the opening.
 const ww=e.kind==='stairs'?198:174;
 if(m.mount==='hull'){
  v.rect(p.x-132,196,264,p.y-184,'#263f33','#869d7c',3);v.rect(p.x-147,180,294,25,'#132920','#829c7b',2);
  for(const dx of [-119,110])v.rect(p.x+dx,207,9,p.y-193,'#5e7860');
 }else{
  v.rect(p.x-ww/2,97,ww,p.y-87,'#263c31','#697f6955',2);
  for(const dx of [-ww/2,ww/2-8])v.rect(p.x+dx,97,8,p.y-87,'#526b56');
 }
 if(e.kind==='stairs'){
  v.rect(p.x-78,p.y-178,156,180,'#071913','#8ea484',3);
  const up=e.destinationDeck>r.deck;
  for(let i=0;i<8;i++){
   const y=up?p.y-5-i*17:p.y-133+i*16;
   const left=up?p.x-65+i*9:p.x-13-i*7;
   v.rect(left,y-8,up?127-i*11:66+i*8,10,i%2?'#617b61':'#829474','#152d21');
  }
  v.line(p.x-67,p.y-53,p.x+43,p.y-172,'#c9d0aa',3);v.line(p.x-67,p.y-54,p.x-67,p.y-5,'#9eb18e',3);
  v.text((up?'MONTER':'DESCENDRE')+' · PONT '+e.destinationDeck,p.x,p.y-199,10,ink,'center');
 }else if(e.kind==='vent'){
  v.rect(p.x-62,p.y-77,124,80,'#132a21','#92a67d',4);v.rect(p.x-52,p.y-67,104,61,'#07140f');
  for(let i=0;i<7;i++)v.line(p.x-48,p.y-61+i*8,p.x+48,p.y-61+i*8,'#5d7760',4);
  v.text('CONDUIT · C + E',p.x,p.y-93,10,ink,'center');
 }else{
  const slide=open&&near?24:0;
  v.rect(p.x-57,p.y-178,114,181,'#122b20','#a0b78c',3);v.rect(p.x-45,p.y-166,90,165,'#030e0a');
  c.save();c.beginPath();c.rect(p.x-45,p.y-166,90,165);c.clip();
  v.rect(p.x-43-slide,p.y-163,41,160,'#415b46','#738767');v.rect(p.x+2+slide,p.y-163,41,160,'#304a3c','#69846a');
  if(slide>0){v.line(p.x,p.y-157,p.x,p.y-5,'#78876544');v.line(p.x-17,p.y-5,p.x+19,p.y-5,'#a9b58a');}c.restore();
  v.rect(p.x-48,p.y-188,96,6,ink);v.rect(p.x+60,p.y-78,12,34,'#203e2b',ink);v.rect(p.x+63,p.y-72,6,8,ink);
  v.text(label,p.x,p.y-202,10,ink,'center');
 }
 v.rect(p.x-54,p.y+2,108,6,'#a5af8177');
 // Rear openings have a visible approach apron down to the walkable band.
 if(e.point.wall==='N'){
  c.fillStyle='#c0b07519';c.beginPath();c.moveTo(p.x-50,p.y+8);c.lineTo(p.x+50,p.y+8);c.lineTo(q.x+64,q.y+7);c.lineTo(q.x-64,q.y+7);c.closePath();c.fill();
  v.line(p.x-50,p.y+9,q.x-60,q.y+7,'#a7b78566');v.line(p.x+50,p.y+9,q.x+60,q.y+7,'#a7b78566');
 }
 v.text(e.destinationName.length>26?e.destinationName.slice(0,25)+'…':e.destinationName,p.x,p.y+24,10,ink,'center');
 if(e.kind==='stairs'||e.kind==='vent')v.text(e.spatial.labelId,p.x,p.y+39,9,ink,'center');
 if(engine.sealed(e.id))v.text('FERMÉ / CONFINEMENT',p.x,p.y-118,9,'#e9bd88','center');
 if(near&&open&&portalApproach(r.id,s,e))v.text('E · FRANCHIR',p.x,p.y-102,9,'#d9e4b3','center');
}
