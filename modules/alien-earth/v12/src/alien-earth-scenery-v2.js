/* Separate procedural scenery atlas. All assets are original vector constructions.
   Visual dimensions derive from the same authored props as collision; no external images. */
const v2rect=(c,x,y,w,h,r=3)=>{c.beginPath();c.roundRect(x,y,w,h,r);c.fill();};
const v2line=(c,x,y,x2,y2,color,width=1)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();};
const v2oval=(c,x,y,w,h,color)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,w,h,0,0,Math.PI*2);c.fill();};
const v2label=(c,s,x,y,size=10,color='#c8d6ca')=>{c.font=`${size}px monospace`;c.fillStyle=color;c.fillText(s,x,y);};
const v2bolt=(c,x,y)=>{v2oval(c,x,y,2,2,'#95a99b');v2line(c,x-1,y,x+1,y,'#243b3e');};
export function drawRoomArchitectureV2(c,r,camera,time,powered){
 const theme=r.architecture,mag=r.kit==='maginot',lab=r.kit==='lab',forest=['courtyard','jungle'].includes(r.kit);
 c.save();
 // Background-mounted services continue past screen edges and always move in world space.
 if(mag||lab||['workshop','coolant','pumps','filtration'].includes(theme)){
  for(let j=0;j<3;j++){
   const y=67+j*18;v2line(c,0,y,1280,y,j===1?'#a58d665b':'#506e717d',j===1?8:6);
   for(let x=-(camera%150);x<1330;x+=150){c.fillStyle='#1a3037';v2rect(c,x,y-6,7,12);v2bolt(c,x+3,y-1);}
  }
  for(let x=95-(camera%490);x<1380;x+=490){
   c.fillStyle='#1b3437';v2rect(c,x,160,124,155,7);c.strokeStyle='#7d998577';c.lineWidth=1;c.strokeRect(x+5,165,114,145);
   v2label(c,mag?'ENV. CONTROL':'BIOSECURITY',x+14,187,10,'#b5bf93');
   for(let j=0;j<5;j++){v2line(c,x+16,203+j*14,x+100,203+j*14,'#73928148',2);c.fillStyle=j%2?'#bdab7330':'#8dbbae6b';c.fillRect(x+15,202+j*14,22+j*7,3);}
   v2oval(c,x+95,294,4,4,powered?'#c5d9a1':'#c58a57');
   v2line(c,x+122,165,x+148,150,'#687f7160',4);v2line(c,x+148,150,x+148,90,'#687f7160',4);
  }
 }
 if(['greenhouse','hanging','garden'].includes(theme)){
  for(let x=-(camera%410);x<1420;x+=410){
   c.fillStyle='#a6cbd014';c.beginPath();c.moveTo(x,32);c.lineTo(x+200,75);c.lineTo(x+410,32);c.lineTo(x+370,156);c.lineTo(x+26,156);c.closePath();c.fill();
   v2line(c,x,32,x+200,75,'#bcd9d184',4);v2line(c,x+200,75,x+410,32,'#bcd9d184',4);v2line(c,x+200,75,x+200,300,'#bcd9d163',5);
   for(let j=0;j<4;j++)v2line(c,x+j*102,44,x+55+j*102,156,'#90b2ae58',2);
   v2line(c,x,310,x+410,310,'#5d857655',4);
  }
 }
 if(theme==='triage'){
  for(let x=250-camera;x<1400;x+=900){
   v2line(c,x,162,x-65,416,'#859b9f',7);v2line(c,x+490,162,x+550,416,'#859b9f',7);
   c.fillStyle='#ae9d72bb';c.beginPath();c.moveTo(x-95,164);c.lineTo(x+240,76);c.lineTo(x+580,164);c.lineTo(x+545,184);c.lineTo(x-60,184);c.closePath();c.fill();
   for(let j=0;j<7;j++)v2line(c,x+240,76,x-80+j*106,165,'#efe4ae44',2);
   c.fillStyle='#35494bdc';c.fillRect(x+150,112,180,42);v2label(c,'SECOURS / TRIAGE',x+161,138,14,'#eedbb4');
  }
 }
 if(['shopping','laundry','archive','security'].includes(theme)){
  for(let x=50-camera;x<1350;x+=350){
   if(x<-400)continue;
   c.fillStyle='#12272bb0';v2rect(c,x,124,272,220,3);
   const sign=theme==='shopping'?'SERVICE / NEW SIAM':theme==='laundry'?'CYCLE / ENTRETIEN':theme==='archive'?'REGISTRES MÉDICAUX':'SURVEILLANCE LOCALE';
   c.fillStyle='#778a7550';c.fillRect(x,118,272,27);v2label(c,sign,x+14,137,11,'#d8d5af');
   for(let j=0;j<8;j++)v2line(c,x+9,167+j*20,x+262,167+j*20,'#708a7638',2);
   if(theme==='shopping')v2line(c,x+3,355,x+272,355,'#a09c6c',5);
  }
 }
 if(['stairwell','residential'].includes(theme)&&r.kit==='tower'){
  const x=r.width*.48-camera;
  c.fillStyle='#0d222bd9';c.fillRect(x,72,286,338);c.fillStyle='#48616d';c.fillRect(x,72,12,338);c.fillRect(x+274,72,12,338);
  for(let j=0;j<8;j++){const y=370-j*34;v2line(c,x+24,y,x+257,y-50,'#8aa6a141',5);v2line(c,x+24,y-30,x+257,y-80,'#70989155',2);}
  c.fillStyle='#293d44';c.fillRect(x+25,285,233,33);v2label(c,'CIRCULATION VERTICALE',x+35,307,12,'#d0c499');
 }
 if(['boathouse','maritime','beacon'].includes(theme)){
  const x=r.width*.48-camera;
  v2line(c,x,90,x,401,'#779291',11);v2line(c,x,94,x+380,94,'#779291',13);v2line(c,x,95,x+110,35,'#829c91',7);
  v2line(c,x+305,102,x+305,205,'#b5b09a',2);v2line(c,x+310,102,x+310,205,'#b5b09a',2);
  c.strokeStyle='#a8b5a7';c.lineWidth=8;c.beginPath();c.arc(x+307,225,18,-Math.PI*.5,Math.PI);c.stroke();
  c.fillStyle='#243d3c';v2rect(c,x+29,310,130,68);v2label(c,'MANUTENTION',x+40,332,11,'#d1c39a');
 }
 if(forest&&theme!=='greenhouse'){
  // A shallow wall-mounted irrigation run, not another collidable foreground rectangle.
  v2line(c,0,407,1280,407,'#587c6655',3);
 }
 // Glazed wall reflections are subtle and static; floor belongs to the engine below y=419.
 if(lab){
  for(let x=40-(camera%310);x<1300;x+=310){v2line(c,x,154,x+84,233,'#d2ebe513',12);v2line(c,x+10,155,x+66,206,'#d2ebe526',2);}
 }
 c.restore();
}
export function drawPropV2(c,p,x,y,w,h,engine,time){
 const supported=['workbench','water-pump','filter-bank','coolant-unit','tool-rack','stretcher','medical-cart','counter','vending','washer','linen-cart','wall-map','data-stack','beacon','outboard','rope-reel','supply-case','hide-niche','valve-post','gate-control'];
 if(!supported.includes(p.type))return false;
 c.save();const top=y-h,active=engine.powered;
 const steel='#4d6c70',edge='#9fb3a2',dark='#122b32',amber='#d3b879';
 const box=(bx,by,bw,bh,col,r=3)=>{c.fillStyle=col;v2rect(c,bx,by,bw,bh,r);};
 if(['workbench','counter'].includes(p.type)){
  box(x+7,y-54,w-14,12,edge);box(x+12,y-42,9,54,steel);box(x+w-25,y-42,9,54,steel);v2line(c,x+18,y-10,x+w-20,y-10,'#526d6e',4);
  box(x+15,y-98,w-30,39,dark);for(let j=0;j<5;j++){v2line(c,x+24+j*13,y-87,x+24+j*13,y-65,'#97ad9d',2);v2oval(c,x+24+j*13,y-88,3,3,'#627e78');}
  box(x+w*.65,y-74,23,18,amber);box(x+28,y-67,29,10,'#2e4e57');
 }else if(['water-pump','filter-bank','coolant-unit'].includes(p.type)){
  box(x+4,y-18,w-8,28,'#536e69');box(x+12,top+15,w-24,h-34,dark,12);
  for(let j=0;j<6;j++)v2line(c,x+18,top+36+j*10,x+w-18,top+36+j*10,'#6e9693',3);
  v2oval(c,x+w*.5,top+24,17,17,'#9daf9c');v2oval(c,x+w*.5,top+24,13,13,'#243f42');
  v2line(c,x+w*.5,top+24,x+w*.5+8,top+16,amber,2);
  c.strokeStyle='#77958b';c.lineWidth=12;c.beginPath();c.moveTo(x+8,y-48);c.lineTo(x-5,y-48);c.lineTo(x-5,y-6);c.stroke();
  for(const dx of [2,w-16]){box(x+dx,top+51,14,9,amber);v2bolt(c,x+dx+7,top+55);}
  v2label(c,p.type==='water-pump'?'PUMP':p.type==='filter-bank'?'FILTER':'COOLANT',x+24,y-27,9,edge);
 }else if(p.type==='tool-rack'){
  box(x,top,w,h+6,dark);box(x+4,top+4,w-8,6,steel);
  for(let j=0;j<5;j++){const xx=x+18+j*(w-30)/5;v2line(c,xx,top+27,xx,top+86,'#95a997',5);v2oval(c,xx,top+25,7,7,'#687f78');v2oval(c,xx,top+25,3,3,dark);box(xx-6,top+80,12,24,amber);}
  box(x+10,y-22,w-20,7,steel);for(const xx of [x+7,x+w-7])for(const yy of [top+16,y-5])v2bolt(c,xx,yy);
 }else if(p.type==='stretcher'){
  v2line(c,x+16,y-36,x+w-20,y-1,steel,6);v2line(c,x+w-20,y-36,x+16,y-1,steel,6);
  box(x,y-57,w,21,'#aeb9a4',8);box(x+5,y-74,31,18,'#697e77',6);v2line(c,x+38,y-57,x+38,y-36,'#1d3b40',3);
  for(const xx of [x+17,x+w-18])v2oval(c,xx,y+2,7,7,dark);
 }else if(['medical-cart','linen-cart'].includes(p.type)){
  box(x+8,y-87,w-16,87,'#829c95',6);box(x+1,y-98,w-2,15,steel);box(x+14,y-80,w-28,72,dark);
  for(let j=0;j<3;j++){box(x+18,y-73+j*22,w-36,16,p.type==='linen-cart'?'#9cab97':'#516e68');v2line(c,x+w*.43,y-64+j*22,x+w*.57,y-64+j*22,edge,3);}
  if(p.type==='medical-cart'){box(x+w/2-4,y-125,8,20,amber);box(x+w/2-10,y-119,20,8,amber);}
  for(const xx of [x+16,x+w-16])v2oval(c,xx,y+6,6,6,dark);
 }else if(p.type==='washer'){
  box(x,top,w,h+8,steel,8);box(x+6,top+8,w-12,24,dark);v2oval(c,x+w*.52,y-h*.39,w*.30,w*.30,edge);v2oval(c,x+w*.52,y-h*.39,w*.25,w*.25,'#1c3d45');v2oval(c,x+w*.52,y-h*.39,w*.18,w*.18,'#406370');
  v2oval(c,x+w*.52,y-h*.39,w*.12,w*.12,'#203f44');for(let j=0;j<3;j++)v2oval(c,x+14+j*16,top+19,3,3,j===0?amber:'#7f9c8e');
 }else if(['vending','data-stack'].includes(p.type)){
  box(x,top,w,h+9,dark,8);box(x+5,top+5,w-10,7,steel);box(x+9,top+19,w-18,h-30,'#304f50');
  for(let j=0;j<5;j++){box(x+15,top+25+j*(h-40)/5,w-38,11,p.type==='vending'?'#647c6c':'#536d68');box(x+w-26,top+26+j*(h-40)/5,6,5,active?'#bbd699':'#a77754');}
  v2line(c,x+w-8,top+28,x+w-8,y-9,edge,2);
 }else if(p.type==='beacon'){
  box(x+w*.45,top+20,9,h-10,steel);box(x+w*.27,y-38,w*.47,44,dark);v2line(c,x+w*.2,top+26,x+w*.8,top+26,edge,3);v2line(c,x+w*.49,top+18,x+w*.73,top-14,edge,2);
  v2oval(c,x+w*.49,top+13,6,6,active?'#d5ca8e':'#936956');
 }else if(p.type==='outboard'){
  box(x+15,top+10,w-30,57,steel,16);box(x+22,top+17,w-44,20,dark,4);box(x+w*.42,top+63,w*.17,h-62,edge);v2oval(c,x+w*.52,y-9,24,9,dark);v2line(c,x+w*.52,y-9,x+w*.67,y-25,steel,6);v2line(c,x+w*.52,y-9,x+w*.31,y+5,steel,6);
 }else if(p.type==='rope-reel'){
  box(x+7,y-22,w-14,25,dark);v2oval(c,x+w/2,y-49,w*.42,43,steel);v2oval(c,x+w/2,y-49,w*.32,33,'#a9a180');for(let j=0;j<6;j++){c.strokeStyle='#675f4d';c.lineWidth=1;c.beginPath();c.ellipse(x+w/2,y-49,10+j*4,9+j*4,0,0,Math.PI*2);c.stroke();}v2oval(c,x+w/2,y-49,8,8,edge);
 }else if(p.type==='wall-map'){
  box(x,top,w,h,dark);for(let j=0;j<3;j++){box(x+9+j*30,top+25,19,28,'#5d8177');v2line(c,x+28+j*30,top+39,x+38+j*30,top+39,edge,2);}v2label(c,'ÉVACUATION',x+8,top+15,10,amber);
 }else if(p.type==='supply-case'){
  const opened=engine.state.looted.includes(p.stateId);box(x,y-67,w,68,'#3a5860');box(x+5,y-59,w-10,51,dark);
  if(opened){box(x+3,y-54,w-8,7,'#667d74');c.fillStyle='#718779';c.beginPath();c.moveTo(x+w,y-67);c.lineTo(x+w+26,y-78);c.lineTo(x+w+26,y-12);c.lineTo(x+w,y);c.closePath();c.fill();v2line(c,x+w+22,y-72,x+w+22,y-19,'#263f42',2);}
  else{box(x+3,y-63,w-6,58,'#7a8e7c');box(x+12,y-50,22,16,amber);v2line(c,x+w-11,y-44,x+w-11,y-29,dark,3);}
 }else if(p.type==='hide-niche'){
  box(x-5,top-7,w+10,h+15,steel,7);box(x+3,top+3,w-6,h-3,dark);for(let j=0;j<3;j++)v2line(c,x+9,top+16+j*8,x+w-9,top+16+j*8,'#677e77',2);box(x+w-7,top+40,5,h-47,'#8aa295');
 }else if(['valve-post','gate-control'].includes(p.type)){
  box(x+18,y-44,9,50,steel);box(x+2,y-67,w-4,32,dark);
  if(p.type==='valve-post'){const closed=engine.state.valves.includes(p.stateId);c.strokeStyle=closed?'#86b2a8':amber;c.lineWidth=4;c.beginPath();c.arc(x+w/2,y-54,13,0,Math.PI*2);c.stroke();v2line(c,x+w/2-10,y-54,x+w/2+10,y-54,closed?'#86b2a8':amber,3);}
  else{box(x+9,y-59,w-18,14,engine.state.gates[p.stateId]?'#b28b5f':'#86b2a8');v2line(c,x+12,y-52,x+w-12,y-52,dark,2);}
 }
 c.restore();return true;
}
export function drawGroundSystemsV2(renderer,engine){
 const c=renderer.c,r=engine.room,cam=renderer.camera,foot=z=>renderer.foot(z);
 c.save();
 for(const vent of r.vents||[]){
  const x=vent.x-cam,y=foot(vent.z),closed=engine.state.valves.includes(vent.id),active=engine.ventActive(vent);
  c.fillStyle='#173036';c.fillRect(x-49,y-12,98,24);
  for(let j=0;j<8;j++)v2line(c,x-42+j*12,y-10,x-38+j*12,y+9,'#748d8b',2);
  if(!closed){
   c.strokeStyle=active?'#e8b77ba8':'#d7bb7655';c.lineWidth=2;c.beginPath();c.ellipse(x,y,vent.radius,23,0,0,Math.PI*2);c.stroke();
   if(active)for(let j=0;j<7;j++){const t=renderer.reduced?.4:((renderer.time*.7+j*.17)%1);v2oval(c,x+Math.sin(j*3)*22,y-t*94,8+t*17,12+t*22,`rgba(169,210,204,${.18*(1-t)})`);}
  }
 }
 for(const lure of engine.lures){const x=lure.x-cam,y=foot(lure.z);c.fillStyle='#abc8be';v2rect(c,x-8,y-6,16,8);v2oval(c,x,y-6,3,3,'#e4d693');c.strokeStyle='#99c9ba77';c.lineWidth=1;c.beginPath();c.ellipse(x,y,20+(renderer.time%1)*38,7+(renderer.time%1)*13,0,0,Math.PI*2);c.stroke();}
 for(const def of engine.state?Object.values(engine.state.survivors):[]){
  const s=engine.survivorDef(def.id);if(s.evac!==r.id||def.status==='left')continue;
  const x=s.evacX-cam,y=foot(s.evacZ);v2line(c,x-52,y,x+52,y,'#9dcbb488',4);v2line(c,x-48,y-11,x-48,y+11,'#9dcbb488',2);v2line(c,x+48,y-11,x+48,y+11,'#9dcbb488',2);v2label(c,'SECOURS',x-29,y+24,10,'#bdd5ad');
 }
 c.restore();
}
export function drawGateV2(renderer,engine){
 const g=engine.room.gate;if(!g)return;const c=renderer.c,x=g.x-renderer.camera,back=renderer.foot(25),front=renderer.foot(225),closed=engine.state.gates[g.id];
 c.save();
 const grad=c.createLinearGradient(x,0,x+54,0);grad.addColorStop(0,'#263b40');grad.addColorStop(.4,'#879b90');grad.addColorStop(1,'#23383d');c.fillStyle=grad;
 v2rect(c,x-10,back-254,11,front-back+270);v2rect(c,x+37,back-254,11,front-back+270);
 if(closed){
  c.fillStyle='#476467';c.fillRect(x+1,back-241,36,front-back+248);for(let yy=back-240;yy<front+8;yy+=17){v2line(c,x+1,yy,x+37,yy,'#243e44',2);v2line(c,x+1,yy+2,x+37,yy+2,'#a0b7a244',1);}
  c.fillStyle='#dcc797aa';c.fillRect(x+6,front-49,26,10);
 }else{for(let j=0;j<5;j++)v2line(c,x,back-247+j*8,x+37,back-247+j*8,'#617f80',5);}
 v2line(c,x-7,front+15,x+44,front+15,closed?'#d3ad76':'#91bbaf',4);
 c.restore();
}
