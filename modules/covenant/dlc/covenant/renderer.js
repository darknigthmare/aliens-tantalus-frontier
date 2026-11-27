(function(root){'use strict';
const {clamp}=root.CovenantCore;
const seeded=(s)=>{let n=2166136261;for(const c of s)n=Math.imul(n^c.charCodeAt(0),16777619);return()=>{n^=n<<13;n^=n>>>17;n^=n<<5;return(n>>>0)/4294967296}};
class CovenantRenderer{
 constructor(canvas,engine){this.canvas=canvas;this.c=canvas.getContext('2d',{alpha:false});this.engine=engine;this.W=1440;this.H=760;this.camera=0;this.effects=[];this.reduceFX=false;this.contrast=false;this.cache=new Map();this.lastRoom='';this.texture=this.makeTexture();this.resize();}
 makeTexture(){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d'),rng=seeded('covenant-surface');for(let i=0;i<3700;i++){x.fillStyle=rng()>.5?'#e8e1c1':'#000';x.globalAlpha=rng()*.2;x.fillRect(rng()*256,rng()*256,1+rng()*2,1+rng()*2);}return c;}
 resize(){const box=this.canvas.getBoundingClientRect();this.cssW=box.width;this.cssH=box.height;const ratio=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.max(2,Math.round(box.width*ratio));this.canvas.height=Math.max(2,Math.round(box.height*ratio));this.scale=this.canvas.height/this.H;this.W=this.canvas.width/this.scale;this.needsRedraw=true;}
 scene(room){if(this.cache.has(room.id))return this.cache.get(room.id);const rng=seeded(room.id);const d={stars:[],mountains:[],trees:[],stones:[],dust:[]};for(let i=0;i<130;i++)d.stars.push([rng()*3000,rng()*440,rng()*1.8]);for(let j=0;j<3;j++){const pts=[];for(let i=0;i<24;i++)pts.push([i*180,160+rng()*165+j*65]);d.mountains.push(pts)}for(let i=0;i<62;i++)d.trees.push([i*67,100+rng()*150,rng()]);for(let i=0;i<65;i++)d.stones.push([rng()*room.width,rng(),3+rng()*22]);for(let i=0;i<60;i++)d.dust.push([rng()*3000,rng()*760,rng()]);this.cache.set(room.id,d);return d;}
 grad(x,y,x2,y2,stops){const g=this.c.createLinearGradient(x,y,x2,y2);stops.forEach(([p,c])=>g.addColorStop(p,c));return g;}
 poly(points,fill,stroke=null,lw=1){const c=this.c;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke()}}
 line(points,color,width=1){const c=this.c;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}
 rect(x,y,w,h,color){this.c.fillStyle=color;this.c.fillRect(x,y,w,h)}
 ellipse(x,y,rx,ry,color){const c=this.c;c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2);c.fillStyle=color;c.fill()}
 text(s,x,y,size=12,color='#bec7b1',align='left'){const c=this.c;c.font=`${size<14?'500':'400'} ${size}px "Courier New",monospace`;c.fillStyle=color;c.textAlign=align;c.fillText(s,x,y);}
 glow(x,y,rad,color,opacity=1){const c=this.c;const g=c.createRadialGradient(x,y,0,x,y,rad);g.addColorStop(0,color);g.addColorStop(1,'#0000');c.globalAlpha=opacity;c.fillStyle=g;c.fillRect(x-rad,y-rad,rad*2,rad*2);c.globalAlpha=1;}
 foot(z){return this.engine.room.view==='side'?644:525+z*150}
 project(x,z){return{x:x-this.camera,y:this.foot(z),s:this.engine.room.view==='side'?1:.78+z*.30}}
 addEvent(e){if(['shot','flare','setpiece','hurt'].includes(e.type))this.effects.push({...e,life:e.type==='shot'?.12:e.type==='hurt'?.32:1.6});}
 sky(d,night=false){const c=this.c,W=this.W;c.fillStyle=this.grad(0,0,0,540,[[0,night?'#08121c':'#263737'],[.46,night?'#213038':'#718078'],[1,night?'#3f514e':'#a8ae95']]);c.fillRect(0,0,W,560);
  if(night)for(const [x,y,r]of d.stars){this.ellipse((x-this.camera*.04)%(W+100),y,r*.7,r*.7,'#9eab9870')}
  this.glow(W*.66,190,300,night?'#61767936':'#d3d5b052');
  for(let j=0;j<3;j++){const shift=-this.camera*(.07+j*.095),pts=[[-300,580],...d.mountains[j].map(([x,y])=>[x+shift,y+(night?20:0)]),[4600,580]];this.poly(pts,['#455552','#394843','#293c36'][j]);for(let i=1;i<d.mountains[j].length-1;i+=2){const [x,y]=d.mountains[j][i];this.poly([[x+shift,y],[x-32+shift,y+35],[x+30+shift,y+17]],j===0?'#85918466':'#81938423')}}
  for(let i=0;i<5;i++){c.globalAlpha=.10;this.ellipse(i*340-this.camera*.02,100+i%2*40,330,50,'#d4dec2');}c.globalAlpha=1;
 }
 tree(x,y,h,col='#172822',seed=0){const c=this.c;this.poly([[x-8,y],[x-4,y-h],[x+5,y-h],[x+13,y]],col);for(let i=0;i<7;i++){const yy=y-h+i*h*.12;const ww=(i+1)*h*.054;this.poly([[x,yy-38],[x-ww,yy+50],[x-ww*.28,yy+38],[x+ww*1.3,yy+53]],col);}this.line([[x-6,y-h*.32],[x-h*.12,y-h*.50]],col,4);}
 stoneHead(x,y,h){const c=this.c;const w=h*.42;this.poly([[x-w*.5,y],[x-w*.7,y-h*.65],[x-w*.55,y-h*.97],[x+w*.28,y-h],[x+w*.67,y-h*.77],[x+w*.5,y]],this.grad(x-w,y,x+w,y,[[0,'#263b35'],[.5,'#556358'],[1,'#263a34']]),'#8892783c');this.poly([[x-w*.15,y-h*.72],[x+w*.05,y-h*.84],[x+w*.23,y-h*.50],[x-w*.08,y-h*.5]],'#293d34');this.line([[x-w*.41,y-h*.75],[x-w*.05,y-h*.71]],'#11291f',5);this.line([[x+w*.12,y-h*.72],[x+w*.39,y-h*.76]],'#14291f',5);this.line([[x-w*.17,y-h*.36],[x+w*.3,y-h*.38]],'#14281f',5);this.line([[x-w*.48,y-h*.6],[x-w*.35,y-h*.29],[x-w*.12,y-h*.2]],'#6c756244',3);}
 ship(d,theme){const c=this.c,W=this.W;this.rect(0,0,W,550,this.grad(0,0,0,550,[[0,'#111d20'],[.6,'#344441'],[1,'#1b2b28']]));
  // The space windows live inside the room wall, not in a HUD overlay.
  if(theme==='bridge'){
   for(let xx=-440-this.camera*.36;xx<W+500;xx+=540){this.poly([[xx,90],[xx+440,90],[xx+485,360],[xx-30,360]],'#08171f','#566860',6);c.save();c.beginPath();c.rect(xx+8,101,416,245);c.clip();for(const[sx,sy,rad]of d.stars)this.ellipse(xx+(sx%420),90+(sy%260),rad,rad,'#b7c7b99a');this.ellipse(W*.78-this.camera*.10,247,290,290,this.grad(W*.58-this.camera*.10,130,W*.98-this.camera*.10,360,[[0,'#7c938a'],[.6,'#345d62'],[1,'#0d2635']]));this.ellipse(W*.78-25-this.camera*.10,227,264,270,'#5f7e723d');c.restore();this.line([[xx-20,362],[xx+485,362]],'#90a59a',4);}
  }
  for(let x=-this.camera*.6-120;x<W+340;x+=310){this.poly([[x,0],[x+70,0],[x+49,415],[x+92,520],[x-38,520],[x+18,405]],this.grad(x,0,x+70,0,[[0,'#172c2c'],[.45,'#748075'],[.56,'#43574e'],[1,'#142927']]),'#9ba28a33');this.line([[x+32,30],[x+35,405]],'#bed0a326',3);if(theme!=='bridge'){this.rect(x+83,132,185,192,'#263b36');this.rect(x+102,148,143,122,'#42554a');for(let n=0;n<7;n++)this.line([[x+103,157+n*15],[x+247,157+n*15]],'#182f2a',3);this.rect(x+95,328,160,36,'#142c27');this.text('COV / '+String(Math.abs(Math.floor(x/310))).padStart(2,'0'),x+99,351,12,'#8f9d85');}}
  this.rect(0,0,W,50,this.grad(0,0,0,50,[[0,'#060e12'],[1,'#1a2c2a']]));this.rect(0,57,W,3,'#c0c29a55');this.rect(0,482,W,31,'#0b1c1c');for(let x=-this.camera*.6;x<W+150;x+=185){this.rect(x+20,492,90,6,'#a3bba244');}
  for(let x=-this.camera*.4+130;x<W+450;x+=410){this.rect(x,59,176,5,'#c3deca');this.glow(x+80,110,175,'#cce2ba16');}
 }
 temple(d,theme){const c=this.c,W=this.W;const outside=['necropolis','garden'].includes(theme);if(outside)this.sky(d,theme==='necropolis');else this.rect(0,0,W,570,this.grad(0,0,0,570,[[0,'#111e1b'],[.7,'#344b3e'],[1,'#142921']]));
  if(outside){for(let x=-300-this.camera*.14;x<W+500;x+=310){const h=200+(Math.sin(x)*.5+.5)*150;this.poly([[x,480],[x+45,480-h],[x+80,420-h],[x+145,480-h],[x+200,480]],'#243d32','#465c4944');this.ellipse(x+95,430-h,65,37,'#294236');for(let j=0;j<4;j++)this.rect(x+36+j*29,385-h,6,100,'#142d27')};}
  for(let x=-180-this.camera*.51;x<W+520;x+=430){
   if(!outside){this.poly([[x-12,517],[x-12,200],[x+54,82],[x+178,26],[x+310,93],[x+369,219],[x+369,518]],'#132b24','#6e7a5e42',8);this.poly([[x+45,517],[x+45,234],[x+98,143],[x+181,103],[x+255,149],[x+302,247],[x+302,517]],'#071b18','#3d55422f',10);this.stoneHead(x+178,419,238);}
   this.poly([[x-34,526],[x-31,70],[x-7,47],[x+16,70],[x+24,526]],this.grad(x-40,0,x+25,0,[[0,'#122b24'],[.5,'#69745a'],[1,'#243b2d']]),'#c9c49a18');for(let j=0;j<5;j++)this.line([[x-27+j*9,80],[x-23+j*9,515]],'#9a9d7022',2);this.rect(x-50,507,96,20,'#526047');
  }
  if(theme==='workshop'){for(let x=60-this.camera*.55;x<W+380;x+=380){this.rect(x,328,290,12,'#647451');this.rect(x,403,290,12,'#566247');for(let j=0;j<5;j++){this.ellipse(x+27+j*53,319,17,8,'#7c8260');this.rect(x+13+j*53,270+j%2*17,28,48-j%2*17,'#7789653a');this.line([[x+14+j*53,270],[x+38+j*53,270]],'#a2ad8180',2);}}}
  if(theme==='crypt')for(let x=0-this.camera*.25;x<W+250;x+=260){this.line([[x,30],[x+40,240],[x+23,490]],'#56604435',5);this.line([[x+25,20],[x+60,190],[x+43,380]],'#1c3522',5)}
  for(let x=-this.camera*.42+180;x<W+500;x+=650)this.glow(x,350,220,'#d3b7711c');
 }
 background(){const r=this.engine.room,d=this.scene(r),c=this.c,W=this.W;
  if(['planet','forest','night','burning','juggernaut','lifter'].includes(r.theme)){
   this.sky(d,['night','burning'].includes(r.theme));
   if(['forest','planet','night','burning'].includes(r.theme))for(const[x,h,ss]of d.trees){const xx=x-this.camera*.36;if(xx<-200||xx>W+200)continue;this.tree(xx,522,h+100,['night','burning'].includes(r.theme)?'#142723':'#213930',ss);}
   if(r.theme==='juggernaut'){this.poly([[-100,530],[-100,190],[200,30],[640,-40],[1130,70],[W+100,330],[W+100,530]],'#132e2b','#74816a',18);for(let i=0;i<16;i++){let x=i*220-this.camera*.55;this.line([[x,550],[x+45,305],[x+180,132],[x+280,100]],'#536451',30);this.line([[x+8,550],[x+60,300],[x+190,144]],'#1e3932',17)}this.stoneHead(W*.65-this.camera*.08,467,240);}
   if(r.theme==='planet'&&r.id==='landing'){this.rect(0,442,W,85,this.grad(0,442,0,527,[[0,'#7c9184'],[1,'#2e5145']]));for(let i=0;i<16;i++)this.line([[0,445+i*5],[W,445+i*5]],'#b1bb901b',1)}
   if(r.theme==='lifter'){this.poly([[-100,477],[W+100,477],[W+100,595],[-100,595]],'#334a42');for(let i=0;i<9;i++){const x=i*310-this.camera*.55;this.line([[x,540],[x,324],[x+85,180]],'#586c5d',14);this.line([[x,325],[x+208,325]],'#586c5d',9);}}
  }else if(['temple','workshop','garden','crypt','necropolis'].includes(r.theme))this.temple(d,r.theme);
  else{this.ship(d,r.theme==='cargo'?'ship':r.theme);if(r.theme==='cargo'){for(let x=-this.camera*.26;x<W+500;x+=700){this.poly([[x,466],[x+25,198],[x+200,90],[x+470,118],[x+565,268],[x+565,466]],'#12272c','#59766c',7);this.line([[x+34,198],[x+537,268]],'#8ea08a4f',3);}}}
  // Floor begins at the physical back edge. No opaque black mask over scenery.
  const natural=['planet','forest','night','burning','necropolis','garden'].includes(r.theme);
  c.fillStyle=this.grad(0,509,0,760,[[0,natural?'#35493b':'#34453e'],[.48,natural?'#20372b':'#233833'],[1,'#0b201d']]);c.fillRect(0,514,W,246);
  if(!natural){for(let x=-this.camera;x<W+180;x+=150){this.line([[x,521],[x-110,760]],'#71827532',1);this.line([[x+4,521],[x-106,760]],'#081e194f',2)}for(let y=533;y<760;y+=(y-490)*.33)this.line([[0,y],[W,y]],'#87988030',1);this.line([[0,652],[W,652]],'#c1b78534',2);}else{for(const [x,z,size]of d.stones){const pt=this.project(x,z);if(pt.x>-80&&pt.x<W+80)this.ellipse(pt.x,pt.y+25,size*1.8,size*.19,'#c1ba8b14')}}
  const pat=c.createPattern(this.texture,'repeat');c.fillStyle=pat;c.globalAlpha=.25;c.fillRect(0,0,W,760);c.globalAlpha=1;
 }
 prop(o){const c=this.c,pt=this.project(o.x,o.z),x=pt.x,y=pt.y,w=o.w,h=o.h;
  if(x<-w-300||x>this.W+w+300)return;
  c.save();c.translate(x,y);c.scale(pt.s,pt.s);
  if(o.kind!=='fire'&&o.kind!=='lamp')this.ellipse(6,6,w*.52,Math.min(20,w*.12),'#02110c60');
  const metal=this.grad(-w/2,-h,w/2,0,[[0,'#657060'],[.4,'#43574a'],[1,'#20382e']]);
  switch(o.kind){
   case'crate':this.poly([[-w/2,0],[-w/2,-h],[w/2-16,-h-14],[w/2,-h],[w/2,0]],metal,'#879477',2);this.poly([[-w/2,-h],[w/2-16,-h-14],[w/2,-h],[-w/2+18,-h+8]],'#75806a');this.rect(-w/2+15,-h+14,w-30,h-29,'#314c3c');this.line([[-w/2+20,-h+20],[w/2-20,-14]],'#78866b',5);this.line([[w/2-20,-h+20],[-w/2+20,-14]],'#78866b',5);for(const xx of[-w/2+6,w/2-8])this.rect(xx,-h+6,5,h-12,'#abaf7e');this.text('COV',0,-h*.48,12,'#b8bd98','center');break;
   case'console':this.poly([[-w*.4,0],[-w*.32,-h*.58],[w*.36,-h*.58],[w*.47,0]],metal,'#6b8370');this.poly([[-w*.48,-h*.58],[-w*.40,-h],[w*.38,-h],[w*.50,-h*.58]],'#283d34','#819783',2);this.rect(-w*.30,-h*.90,w*.56,h*.23,'#0b2421');for(let j=0;j<4;j++)this.rect(-w*.26,-h*.87+j*5,w*(.3+j%2*.14),2,'#b5d2a782');for(let i=0;i<6;i++)this.rect(-w*.27+i*w*.09,-h*.59,4,3,i%2?'#e0af66':'#8bbd9a');this.glow(0,-h*.8,45,'#a0d8b824');break;
   case'cryopod':
    this.line([[-w*.34,-3],[-w*.34,-h*.35],[w*.34,-h*.35],[w*.34,-3]],'#789085',10);
    this.poly([[-w*.54,-h*.35],[-w*.53,-h*.66],[-w*.40,-h*.98],[w*.34,-h],[w*.55,-h*.64],[w*.50,-h*.30]],this.grad(0,-h,0,0,[[0,'#b4c5b2'],[.35,'#739187'],[1,'#263e37']]),'#c5d4bd',2);
    this.poly([[-w*.39,-h*.91],[-w*.47,-h*.66],[w*.46,-h*.60],[w*.30,-h*.91]],'#315454','#93b3a499',2);
    this.ellipse(-w*.24,-h*.71,10,8,'#9ead9b90');this.poly([[-w*.16,-h*.78],[w*.18,-h*.79],[w*.34,-h*.66],[-w*.16,-h*.66]],'#a1b39a88');
    this.line([[-w*.40,-h*.9],[w*.28,-h*.91]],'#d7e7ce95',3);this.line([[-w*.43,-h*.45],[w*.43,-h*.41]],'#16392f',4);this.rect(w*.28,-h*.46,18,5,'#91d2bb');
    this.line([[-w*.42,-h*.48],[-w*.42,-h*.36]],'#dde0bd',3);break;
   case'medical':case'bench':this.line([[-w*.38,0],[-w*.38,-h*.67],[w*.38,-h*.67],[w*.38,0]],'#829079',8);this.poly([[-w*.54,-h*.67],[-w*.44,-h],[w*.40,-h],[w*.55,-h*.74]],o.kind==='medical'?'#9aa796':'#7b8060','#b5b895',2);if(o.kind==='medical'){this.rect(-w*.26,-h-8,w*.33,13,'#bec5ae');this.line([[-w*.56,-h*.48],[-w*.5,-h*1.55],[-w*.35,-h*1.55]],'#91a99b',3);this.rect(-w*.4,-h*1.48,19,33,'#7cb8a060')}break;
   case'vent':this.rect(-w/2,-h,w,h,'#536458');for(let j=0;j<8;j++)this.rect(-w/2+6,-h+6+j*(h-12)/8,w-12,4,'#102b26');break;
   case'generator':this.poly([[-w/2,0],[-w/2,-h+15],[-w*.32,-h],[w*.33,-h],[w/2,-h+14],[w/2,0]],metal,'#8e9e7a',2);for(let i=0;i<5;i++)this.rect(-w*.30,-h*.8+i*19,w*.61,7,'#122c27');this.rect(-w*.34,-h*.23,w*.18,h*.12,'#98c69c');this.line([[w/2,-h*.8],[w*.65,-h*.8],[w*.65,-10]],'#78917b',8);break;
   case'cable':for(let i=0;i<5;i++)this.line([[-w/2,-h+i*5],[-w*.26,-h*.2+i*2],[w*.10,-h*.14+i],[w/2,-h+i*5]],i%2?'#667660':'#142d24',7);break;
   case'lamp':this.line([[0,0],[0,-h]],'#5f6d53',5);this.rect(-9,-h-10,18,23,'#a09d70');this.rect(-5,-h-6,10,14,'#d9c087');this.glow(0,-h,95,'#e7c48228');break;
   case'antenna':this.line([[-w*.32,0],[0,-h*.27],[w*.32,0]],'#8d9b7d',5);this.line([[0,-5],[0,-h]],'#92a181',4);this.line([[-w*.33,-h*.78],[w*.33,-h*.78]],'#9cad8b',4);this.rect(-w*.16,-h*.44,w*.32,h*.22,'#172e26');this.ellipse(0,-h,4,4,'#d4c483');break;
   case'tree':this.tree(0,0,h,'#192d24');this.line([[0,-40],[-w*.30,-80],[-w*.45,-70]],'#233f2e',10);break;
   case'rock':this.poly([[-w/2,0],[-w*.51,-h*.4],[-w*.29,-h*.86],[w*.06,-h],[w*.42,-h*.64],[w/2,-h*.15],[w*.35,4]],this.grad(-w/2,-h,w/2,0,[[0,'#5f6a55'],[.6,'#3b513a'],[1,'#243b2d']]),'#85917142');this.line([[-w*.28,-h*.8],[w*.03,-h*.68],[w*.27,-h*.32]],'#84947566',2);break;
   case'wheat':for(let i=0;i<24;i++){let xx=-w/2+i*w/24,hh=h*(.5+((i*13)%17)/34),sway=Math.sin(this.engine.state.time*1.1+i)*4;if(this.reduceFX)sway=0;this.line([[xx,0],[xx+sway,-hh]],'#838763',2);for(let j=0;j<4;j++)this.line([[xx+sway,-hh+j*7],[xx+sway+(j%2?7:-7),-hh+j*7-8]],'#b4ac76',3);}break;
   case'spore':for(let i=0;i<7;i++){let xx=-w*.4+i*w*.13;this.ellipse(xx,-h*.4,12,22,'#172d1c');this.ellipse(xx,-h*.8,9,9,'#839466');this.line([[xx-5,-h*.6],[xx+3,-h*.42]],'#405838',2)}for(let i=0;i<12;i++){const t=(this.engine.state.time*.35+i*.31)%1;this.ellipse(-w*.4+i*w/13+Math.sin(i)*12,-h-t*85,1.3,1.3,'#c9d0a480')}break;
   case'fire':for(let i=0;i<8;i++){let f=this.reduceFX?.5:(Math.sin(this.engine.state.time*12+i)*.2+.7),xx=-w*.4+i*w*.1;this.poly([[xx-15,0],[xx-13,-h*.38],[xx+3,-h*f],[xx+15,-h*.30],[xx+23,0]],i%2?'#df8c2cbb':'#e8b64caa');this.glow(xx,-h*.25,75,'#dd6e2545')}break;
   case'column':this.poly([[-w*.55,0],[-w*.35,-h],[-w*.19,-h-8],[w*.28,-h-8],[w*.40,-h],[w*.55,0]],metal,'#8d997551');for(let i=0;i<7;i++){const xx=-w*.33+i*w*.11;this.line([[xx,-h+8],[xx*1.23,-10]],i%2?'#91a17740':'#19352799',4)}this.rect(-w*.62,-13,w*1.24,15,'#717b56');break;
   case'urn':this.poly([[-w*.28,0],[-w*.44,-h*.38],[-w*.29,-h*.88],[-w*.13,-h],[w*.14,-h],[w*.32,-h*.88],[w*.45,-h*.4],[w*.28,0]],metal,'#b7b18560',2);for(let i=0;i<5;i++)this.line([[-w*.25,-h*.70+i*12],[w*.25,-h*.70+i*12]],'#a9a87737',2);this.ellipse(0,-h,w*.18,5,'#101f16');break;
   case'drawing':this.poly([[-w/2,0],[-w*.49,-h],[w*.50,-h*.98],[w*.48,0]],'#a19c7273','#d0c8a048');this.line([[-w*.17,-h*.3],[0,-h*.71],[w*.25,-h*.80],[w*.3,-h*.70],[0,-h*.64],[-w*.03,-h*.25],[w*.22,-h*.10]],'#303d28c0',2);for(let j=0;j<7;j++)this.line([[-w*.03,-h*.28-j*7],[w*.12,-h*.30-j*7]],'#293e29a0');this.line([[-w*.03,-h*.25],[-w*.27,-h*.07]],'#243520b0',2);break;
   case'specimen':this.ellipse(0,0,w*.4,8,'#7f8763');this.rect(-w*.35,-h,w*.70,h,'#819f6c33');this.ellipse(0,-h,w*.36,7,'#adac7d');this.ellipse(0,-h*.5,w*.15,h*.21,'#818b68a0');this.line([[-w*.1,-h*.40],[w*.12,-h*.29],[-w*.07,-h*.12]],'#b1ac77aa',4);this.line([[-w*.25,-h+10],[-w*.25,-10]],'#c5d3a675',3);this.line([[w*.36,-h],[w*.36,-3]],'#bdc29a55');break;
   case'egg':this.poly([[-w*.39,0],[-w*.53,-h*.25],[-w*.45,-h*.6],[-w*.2,-h*.94],[0,-h*.80],[w*.2,-h],[w*.47,-h*.62],[w*.5,-h*.27],[w*.36,0]],this.grad(-w/2,-h,w/2,0,[[0,'#3c502d'],[.5,'#82936a'],[1,'#334a32']]),'#b4ac7155',2);this.line([[0,-h*.04],[w*.06,-h*.49],[0,-h*.8]],'#bdac7355',5);for(let i=0;i<8;i++)this.line([[-w*.22,-h*.12-i*12],[w*.23,-h*.17-i*12]],'#203a2b66',2);this.glow(0,-h*.3,85,'#a9b25a17');break;
   case'corpse':this.ellipse(-w*.31,-14,w*.12,11,'#657057');this.poly([[-w*.19,-21],[w*.19,-23],[w*.48,-10],[w*.45,-3],[w*.05,-13],[-w*.15,-8]],'#526247');this.line([[-w*.15,-14],[-w*.03,-1],[w*.22,2]],'#748365',5);break;
   case'lander':this.poly([[-w*.5,0],[-w*.46,-h*.40],[-w*.28,-h*.44],[-w*.12,-h*.90],[w*.17,-h],[w*.32,-h*.75],[w*.40,-h*.35],[w*.55,-h*.18],[w*.55,0]],this.grad(0,-h,0,0,[[0,'#7e8a73'],[.5,'#536951'],[1,'#293f32']]),'#9ba182',3);this.poly([[-w*.09,-h*.74],[w*.14,-h*.85],[w*.24,-h*.68],[w*.26,-h*.55],[-w*.13,-h*.55]],'#0f2b2c','#8faaa0',3);for(const xx of[-w*.36,w*.38]){this.ellipse(xx,-h*.26,w*.095,h*.22,'#18312c');this.ellipse(xx,-h*.26,w*.068,h*.155,'#79917f');this.ellipse(xx,-h*.26,w*.054,h*.13,'#09231f');this.line([[xx,-10],[xx+20,30]],'#697b62',14);this.rect(xx-10,27,70,10,'#6f8068')}this.text('COVENANT',0,-h*.26,18,'#c0c5a4','center');break;
   case'crane':this.line([[-w*.35,0],[-w*.35,-h*.9],[w*.15,-h],[w*.48,-h*.83]],'#80916b',23);this.line([[-w*.35,-h*.75],[w*.16,-h*.9],[w*.48,-h*.83]],'#b7b084',9);this.line([[w*.48,-h*.83],[w*.48,-h*.31]],'#121d19',3);this.line([[w*.46,-h*.3],[w*.31,-h*.16],[w*.40,-h*.04]],'#9fa880',12);this.line([[w*.50,-h*.3],[w*.65,-h*.16],[w*.56,-h*.04]],'#9fa880',12);this.rect(-w*.47,-25,w*.4,28,'#445d45');break;
   case'terraformer':this.poly([[-w*.44,0],[-w*.47,-h*.3],[-w*.37,-h*.68],[-w*.08,-h*.72],[w*.03,-h],[w*.29,-h],[w*.4,-h*.41],[w*.49,-h*.3],[w*.46,0]],this.grad(0,-h,0,0,[[0,'#858c61'],[.5,'#5e744e'],[1,'#243d32']]),'#a7ad85',3);for(const xx of[-w*.24,w*.27]){this.ellipse(xx,-h*.1,w*.23,h*.15,'#0c2625');for(let j=0;j<5;j++)this.ellipse(xx-w*.15+j*w*.07,-h*.1,w*.028,h*.075,'#658374')}this.poly([[w*.03,-h*.82],[w*.22,-h*.82],[w*.3,-h*.53],[w*.03,-h*.53]],'#0d2c2e','#93ad91',4);this.line([[-w*.4,-h*.5],[-w*.65,-h*.37],[-w*.65,-h*.05]],'#9ca97b',18);this.poly([[-w*.75,0],[-w*.73,-h*.35],[-w*.54,-h*.3],[-w*.51,0]],'#78946b','#c2c398',3);break;
   case'window':this.rect(-w/2,-h,w,h,'#132f2c');this.rect(-w/2+8,-h+8,w-16,h-16,'#608f8433');this.line([[-w/2,-h/2],[w/2,-h/2]],'#9bb3a2',5);break;
  }
  c.restore();
 }
 human(actor,role='daniels',moving=false){const c=this.c,pt=this.project(actor.x,actor.z);if(pt.x<-150||pt.x>this.W+150)return;const t=this.engine.state.time,walk=moving?Math.sin(t*13)*15:Math.sin(t*1.4)*1.4;this.ellipse(pt.x,pt.y+7,23*pt.s,6*pt.s,'#020f0ba0');c.save();c.translate(pt.x,pt.y-(actor.y||0));c.scale(pt.s*(actor.facing||1),pt.s);const coat=role==='david'?'#76806b':role==='walter'?'#97a99a':role==='lope'?'#5b6e58':role==='oram'?'#536675':'#8c8767';
  this.line([[-7,-43],[-11-walk*.35,-24],[-12+walk*.72,-5]],'#293b36',12);this.line([[6,-43],[10+walk*.40,-22],[11-walk*.64,-5]],'#415347',12);this.line([[-12+walk*.72,-3],[-22+walk*.72,-3]],'#111f1c',8);this.line([[11-walk*.64,-3],[20-walk*.64,-3]],'#1b2b25',8);
  this.poly([[-14,-86],[12,-86],[20,-46],[8,-40],[-15,-42],[-19,-59]],this.grad(-20,-80,20,-45,[[0,coat],[.7,coat],[1,'#374637']]),'#b4b79665',1.5);this.rect(-12,-52,28,5,'#293c31');this.rect(-20,-79,7,29,'#4d6856');this.line([[-9,-85],[-4,-58]],'#c5c5a0',3);this.line([[12,-82],[18,-64],[37,-70]],coat,9);
  this.ellipse(0,-100,11,14,role==='walter'?'#cecdb5':'#c4b897');this.poly([[-12,-101],[-9,-114],[4,-116],[12,-109],[10,-103],[-5,-105],[-8,-93]],role==='walter'?'#a7ad95':'#3c3d2f');this.line([[9,-100],[14,-98],[9,-96]],'#d0c1a0',2);
  if(role==='daniels'&&this.engine.state.weapon&&!this.engine.detector&&!this.engine.work&&!this.engine.healing&&!this.engine.scanning){this.drawWeapon?.(actor,pt,()=>{this.poly([[19,-76],[57,-76],[63,-73],[89,-73],[89,-69],[60,-68],[47,-62],[22,-67]],'#263b37','#9dab8b',1);this.rect(43,-65,9,15,'#526757');this.rect(50,-81,12,4,'#819580');this.line([[-6,-76],[6,-65],[32,-68]],coat,9);});}else this.line([[-11,-80],[-19,-64],[-17,-46]],coat,8);
  if(role==='david')this.poly([[-17,-86],[-23,-10],[8,-18],[25,-5],[16,-82]],'#89907760');
  this.line([[-15,-80],[-17,-60]],'#d2d6b770',2);c.restore();
 }
 creature(e){const c=this.c,pt=this.project(e.x,e.z);if(pt.x<-200||pt.x>this.W+200)return;const s=this.engine.state,t=s.time,face=s.player.x>=e.x?1:-1,breathe=Math.sin(t*6)*2;this.ellipse(pt.x,pt.y+7,34*pt.s,e.kind==='facehugger'?4:9,'#000d09ad');c.save();c.translate(pt.x,pt.y-(e.y||0));c.scale(pt.s*face,pt.s);
  if(!e.alive){c.globalAlpha=.5;this.line([[-45,-8],[-12,-15],[24,-7],[55,-10]],e.kind==='neomorph'?'#909d85':'#16382e',12);c.restore();return;}
  if(e.kind==='facehugger'){this.ellipse(0,-14,20,9,'#b5ac7f');for(let i=0;i<4;i++){let a=i*8-12;this.line([[a,-16],[a+14,-28+i*3],[a+23,-2+Math.sin(t*18+i)*2]],'#c2b887',3);this.line([[a,-14],[a-17,-30+i*4],[a-26,-2+Math.cos(t*18+i)*2]],'#b6b487',3)}this.line([[-15,-15],[-34,-8],[-49,-16],[-65,-12]],'#b1aa7b',4);c.restore();return;}
  const neo=e.kind==='neomorph',body=neo?'#c1c6b0':'#254640',light=neo?'#e0dac2':'#819589',dark=neo?'#727f6c':'#0b2622',stride=e.phase==='chase'?Math.sin(t*(neo?14:10))*18:Math.sin(t*2)*3,by=-70+breathe;
  this.line([[-11,by+12],[-40,by+28],[-79,-28],[-126,-34+Math.sin(t*2)*10]],dark,11);this.line([[-12,by+12],[-40,by+28],[-79,-28],[-126,-34+Math.sin(t*2)*10]],body,6);
  this.line([[-11,by+13],[-28,-29],[-8+stride,-14],[-19+stride,-3]],body,11);this.line([[8,by+10],[23,-31],[30-stride,-13],[45-stride,-3]],body,12);
  this.poly([[-14,by+20],[-25,by-19],[-7,by-49],[13,by-37],[24,by-8],[8,by+18]],this.grad(-26,by,24,by,[[0,dark],[.4,body],[1,dark]]),light,1);
  for(let i=0;i<7;i++)this.line([[-15,by-18+i*5],[0,by-14+i*5],[14,by-19+i*5]],light,2);
  this.line([[-16,by-26],[-39,by-6],[-29,-20],[-41,-8]],body,9);this.line([[15,by-27],[41,by-5],[48,-30],[66,-23]],body,9);
  for(let i=0;i<3;i++){this.line([[66,-24],[78+i*5,-17+i*3]],light,2);this.line([[-41,-8],[-53-i*3,-3-i]],light,2)}
  if(!neo){for(let i=0;i<4;i++)this.line([[-12,by-25+i*6],[-37-i*5,by-39+i*6],[-42-i*5,by-27+i*7]],'#50776c',6);this.poly([[-39,by-44],[-58,by-64],[-38,by-87],[13,by-87],[46,by-68],[43,by-48],[7,by-42]],this.grad(-45,by-85,33,by-45,[[0,'#163b36'],[.4,'#799087'],[.62,'#254a41'],[1,'#08221e']]),'#8faa974d',2);this.line([[-32,by-78],[12,by-80],[35,by-68]],'#c4ceba65',3)}
  else{this.poly([[-21,by-43],[-29,by-69],[-4,by-91],[29,by-80],[47,by-55],[27,by-44]],this.grad(0,by-90,40,by-42,[[0,'#e3decd'],[.5,'#bfc5b0'],[1,'#8e9f88']]),'#e3ddc299');this.line([[-17,by-75],[3,by-84],[26,by-76]],'#fbedd581',2)}
  this.line([[13,by-45],[32,by-40],[44,by-49]],dark,9);for(let i=0;i<5;i++)this.line([[19+i*5,by-48],[21+i*5,by-42]],'#ded7bd',1.5);
  if(e.phase==='windup'){this.ellipse(34,by-46,9,8,'#0a1510');this.line([[28,by-40],[44,by-36]],'#ead7b4',2);this.glow(0,-50,125,'#d9ad5330');}
  c.restore();
 }
 portal(e){const c=this.c,r=this.engine.room,pt=this.project(e.x,e.z),ok=this.engine.exitAvailable(e);if(pt.x<-130||pt.x>this.W+130)return;const annex=e.kind==='annex',w=annex?74:95,h=annex?155:185;
  if(['planet','forest','night','burning','necropolis','garden'].includes(r.theme)){
   // Outdoor connections are paths, never freestanding metal doors.
   c.save();c.translate(pt.x,pt.y);c.scale(pt.s,pt.s);
   this.poly([[-36,25],[-20,-42],[18,-42],[39,25]],ok?'#a8bd9b15':'#8f795b16');
   for(let j=0;j<4;j++){this.ellipse(-27-j*2,20-j*15,6+j,3,'#506650');this.ellipse(30+j*2,12-j*16,7+j,4,'#394e3b');}
   this.text(e.kind==='back'?'‹':e.kind==='annex'?'↗':'›',0,-38,26,ok?'#c3cfac':'#ae8464','center');
   this.line([[-8,-24],[0,-16],[8,-24]],ok?'#9ab58990':'#a8866790',2);c.restore();return;
  }
  c.save();c.translate(pt.x,pt.y);c.scale(pt.s,pt.s);this.poly([[-w/2,0],[-w/2,-h+18],[-w/2+15,-h],[w/2-15,-h],[w/2,-h+18],[w/2,0]],'#071e1c',ok?'#8eaa8665':'#926c5b70',4);this.poly([[-w/2+9,-2],[-w/2+11,-h+22],[w/2-15,-h+22],[w/2-13,-2]],this.grad(0,0,0,-h,[[0,'#294a3b'],[1,'#092825']]));this.line([[-w*.38,-h*.2],[-w*.38,-h*.8]],ok?'#a4c9a1':'#936b4d',3);this.line([[w*.38,-h*.2],[w*.38,-h*.8]],ok?'#719b7a':'#936b4d',3);this.text(annex?'↗':e.kind==='forward'?'›':'‹',0,-h*.44,32,ok?'#d0dcb7':'#947854','center');this.ellipse(0,4,35,6,ok?'#a3c09421':'#74614621');c.restore();
 }
 frame(dt=1/60,input={}){const c=this.c,r=this.engine.room,s=this.engine.state,p=s.player;
  if(this.lastRoom!==r.id){this.camera=clamp(p.x-this.W*.32,0,Math.max(0,r.width-this.W));this.lastRoom=r.id;}
  const target=clamp(p.x-this.W*.43,0,Math.max(0,r.width-this.W));this.camera+=(target-this.camera)*Math.min(1,dt*6);
  c.setTransform(this.scale,0,0,this.scale,0,0);c.globalAlpha=1;this.background();
  const elements=[...(r.shelters||[]).map(h=>({z:h.z,draw:()=>this.shelter?.(h)})),...(r.supplies||[]).map(o=>({z:o.z,draw:()=>this.supply?.(o)})),...r.props.map(o=>({z:o.z,draw:()=>this.prop(o)})),...r.exits.map(e=>({z:e.z-.03,draw:()=>this.portal(e)})),...this.engine.enemies().map(e=>({z:e.z,draw:()=>this.creature(e)})),{z:p.z,draw:()=>this.human(p,'daniels',!!(input.left||input.right||input.up||input.down))}];
  for(const actor of this.engine.crew())elements.push({z:actor.z,draw:()=>this.drawCrew(actor)});
  elements.sort((a,b)=>a.z-b.z);elements.forEach(e=>e.draw());
  for(const a of r.actions){if(this.engine.done(a.id))continue;const pt=this.project(a.x,a.z),near=this.engine.distance(a)<115;this.ellipse(pt.x,pt.y+4,near?23:12,near?5:3,near?'#d2ddb488':'#a6b39255');this.poly([[pt.x,pt.y-145],[pt.x+5,pt.y-139],[pt.x,pt.y-133],[pt.x-5,pt.y-139]],near?'#e2dba7':'#a2b99a88');}
  for(const e of this.effects){e.life-=dt;if(e.type==='shot'){const pt=this.project(e.x,e.z);const end=this.project(e.to,e.toZ??e.z);const ey=end.y-(e.targetHeight||72)*end.s,angle=clamp(Math.atan2(ey-(pt.y-72*pt.s),Math.max(35,(end.x-pt.x)*e.face)),-.7,.7),mx=pt.x+e.face*(21+68*Math.cos(angle))*pt.s,my=pt.y+(-72+68*Math.sin(angle))*pt.s;this.line([[mx,my],[end.x,ey]],'#f5d191aa',2);this.glow(mx,my,55,'#ffc26a65');}else if(e.type==='flare'){this.glow(this.W*.77,190,650,'#e7b88b5c',Math.max(0,e.life/1.6));}else if(e.type==='setpiece'){this.glow(this.W*.8,450,700,'#c4e0b448',Math.max(0,e.life/1.6));}}
  this.effects=this.effects.filter(e=>e.life>0);
  if(!this.reduceFX&&['planet','forest','night','necropolis','burning','lifter'].includes(r.theme)){const d=this.scene(r);for(const[x,y,v]of d.dust){const xx=(x-this.camera*.1+s.time*(18+v*35))%(this.W+60)-30,yy=(y+s.time*23)%(this.H);this.line([[xx,yy],[xx-3,yy+12]],'#a9c5b318',1)}}
  // Edge shading is deliberately shallow; it never covers the playable centre.
  const vign=c.createLinearGradient(0,0,this.W,0);vign.addColorStop(0,'#05131048');vign.addColorStop(.12,'#0000');vign.addColorStop(.87,'#0000');vign.addColorStop(1,'#04130f40');c.fillStyle=vign;c.fillRect(0,0,this.W,760);
  this.rect(0,739,this.W,21,this.grad(0,739,0,760,[[0,'#08201a00'],[1,'#09231bc0']]));
  if(this.contrast){c.globalCompositeOperation='screen';this.rect(0,0,this.W,760,'#7a91801c');c.globalCompositeOperation='source-over'}
  if(this.engine.damageGrace>.4&&this.effects.some(e=>e.type==='hurt')){c.strokeStyle='#cd715d80';c.lineWidth=8;c.strokeRect(4,4,this.W-8,752)}
 }
}
root.CovenantRenderer=CovenantRenderer;
})(globalThis);
