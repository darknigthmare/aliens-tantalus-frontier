/* v0.8 landscape and instrument. Original Canvas art; no external image assets.
 * No timer, encounter or saved-state mutation is permitted in this renderer.
 */
(function(root){'use strict';
const {clamp}=root.CovenantCore;
class CovenantAtmosphereRenderer extends root.CovenantRenderer{
 background(){
  const E=this.engine,r=E.room;if(!r.atmosphere)return super.background();
  const c=this.c,W=this.W,t=E.state.time,d=this.scene(r),horizon=r.view==='side'?547:525;
  this.sky(d,false);
  // Overlapping rock faces and a low canopy, not an opaque illustration background.
  for(let layer=0;layer<3;layer++){
   const scroll=this.camera*(.10+layer*.13),col=['#425851','#304840','#253d35'][layer];
   for(let i=-1;i<12;i++){const x=i*340-scroll,top=120+(i*61+layer*59)%130;
    if(x<-440||x>W+440)continue;
    this.poly([[x-70,535],[x,top+100],[x+80,top],[x+240,top-23],[x+340,top+110],[x+395,535]],col,'#97a78b1f',2);
    this.line([[x+95,top+25],[x+125,top+105],[x+81,top+245]],'#99a58c23',3);
    if(layer===2)this.ellipse(x+170,top+27,150,26,'#5e715137');
   }
  }
  if(r.id==='windfall'){
   for(let i=0;i<18;i++){const x=i*190-this.camera*.31;this.tree(x,520,290+(i%5)*22,'#19342a');}
   this.poly([[0,0],[W,0],[W,60],[W*.79,24],[W*.52,89],[W*.30,42],[0,98]],'#102a23');
  }else if(r.id==='sporehollow'){
   // Exposed slanting stone, hollow canopy and roots give the depression its silhouette.
   for(let i=-1;i<10;i++){const x=i*290-this.camera*.45;this.line([[x,0],[x+120,100],[x+183,260],[x+150,445]],'#173228',19);this.line([[x+122,99],[x+63,183],[x+34,279]],'#66765a50',6);}
   this.poly([[0,0],[W,0],[W,74],[W*.8,38],[W*.60,97],[W*.40,60],[W*.20,118],[0,82]],'#102921');
  }else{
   this.poly([[-60,0],[W+60,0],[W+60,280],[W*.84,224],[W*.70,162],[W*.52,173],[W*.38,122],[W*.20,110],[-60,245]],this.grad(0,0,0,320,[[0,'#0d211c'],[1,'#33483a']]),'#8391763b',4);
   for(let i=0;i<9;i++){const x=i*250-this.camera*.38;this.line([[x,20],[x+78,90],[x+151,113]],'#abb08b22',4);}
   this.poly([[W*.67,175],[W*.81,222],[W*.93,547],[W*.60,547]],'#c5d3a015');
  }
  this.rect(0,horizon,W,760-horizon,this.grad(0,horizon,0,760,[[0,'#455b40'],[.48,'#2a4434'],[1,'#0d251f']]));
  for(const[x,z,size]of d.stones){const p=this.project(x,z);if(p.x<-40||p.x>W+40)continue;this.ellipse(p.x,p.y+6,size*2.8,size*.26,'#b4c29c20');this.line([[p.x-size,p.y+6],[p.x+size,p.y+9]],'#77896d36',1);}
  for(let i=0;i<12;i++){const x=i*270-this.camera;this.line([[x,736],[x+22,710],[x+61,706]],'#758a5642',3);}
  c.save();c.fillStyle=c.createPattern(this.texture,'repeat');c.globalAlpha=.17;c.fillRect(0,0,W,760);c.restore();
 }
 prop(o){
  const kinds=['air-case','wind-mast','field-awning','spore-colony','trail-marker','tablet'];if(!kinds.includes(o.kind))return super.prop(o);
  const E=this.engine,c=this.c,p=this.propPoint(o),w=o.w,h=o.h;if(p.x<-350||p.x>this.W+350)return;
  c.save();c.translate(p.x,p.y);c.scale(p.s,p.s);
  if(o.kind==='air-case'){
   const open=E.done('windfall-a1')&&E.room.id==='windfall';
   this.poly([[-w/2,-h*.72],[w*.38,-h*.72],[w/2,-h*.4],[w/2,0],[-w/2,0]],'#516554','#b1baa285',2);
   this.poly([[-w/2,-h*.72],[-w*.37,-h],[w*.4,-h],[w*.38,-h*.72]],open?'#132c29':'#87947b','#c3c8a55b',2);
   if(open){this.poly([[-w*.37,-h],[-w*.39,-h*1.4],[w*.40,-h*1.4],[w*.4,-h]],'#647965','#b4c5a4',2);this.rect(-w*.36,-h*.65,w*.66,h*.36,'#142e26');}
   this.rect(-w*.34,-h*.4,10,17,'#bec5a3');this.rect(w*.18,-h*.4,10,17,'#bec5a3');this.text('COV / FIELD',0,-10,8,'#ced5b7','center');
  }
  if(o.kind==='wind-mast'){
   this.line([[0,0],[0,-h]],'#91a28b',4);this.line([[-27,0],[0,-30],[26,0]],'#657961',4);this.ellipse(0,-h,7,4,'#ced4b3');
   const wind=E.atmosphereWind().value,stretch=22+Math.abs(wind)*50,face=wind<0?-1:1;
   this.poly([[0,-h+7],[face*stretch,-h+14+Math.sin(E.state.time*4)*5],[face*(stretch-5),-h+31],[0,-h+24]],'#b8c293','#e2dfb244',1);
   this.rect(-14,-h*.66,28,14,'#24433b');this.rect(-7,-h*.63,14,4,'#b7cead');
  }
  if(o.kind==='field-awning'){
   this.line([[-w*.43,0],[-w*.42,-h*.9],[w*.38,-h*.9],[w*.44,0]],'#8b9d85',4);
   this.poly([[-w*.51,-h*.81],[-w*.18,-h],[w*.48,-h*.8],[w*.38,-h*.60],[-w*.42,-h*.64]],this.grad(0,-h,0,0,[[0,'#9b9f79'],[1,'#455d47']]),'#ccd0a950',2);
   this.line([[-w*.5,-h*.8],[-w*.55,0]],'#acb899',1);this.line([[w*.48,-h*.8],[w*.55,0]],'#acb899',1);
   this.text('RELEVÉS / EXPÉDITION',0,-h*.72,12,'#d4d6b0','center');
  }
  if(o.kind==='trail-marker'){
   this.line([[0,0],[-4,-h]],'#778d6b',3);this.poly([[-4,-h],[-4,-h+28],[27,-h+21],[27,-h+4]],'#c4c799');this.text('↗',8,-h+20,17,'#254333','center');
  }
  if(o.kind==='tablet'){
   this.line([[-15,0],[-14,-h*.8],[16,-h*.8],[22,0]],'#5d7568',4);this.poly([[-w/2,-h],[-w*.43,-h*.47],[w*.47,-h*.40],[w/2,-h*.91]],'#223f3c','#b2c6ad',2);this.rect(-w*.29,-h*.82,w*.55,h*.25,'#8da893');this.line([[-w*.23,-h*.65],[w*.15,-h*.65]],'#d8ddbf',2);
  }
  if(o.kind==='spore-colony'){
   const source=E.data.atmosphere.sources.find(s=>s.prop===o.id),ph=source?E.atmospherePhase(source):'quiet';
   const contraction=ph==='warning'?1+Math.sin(E.state.time*28)*.1:1;
   this.ellipse(0,2,w*.55,8,'#061912b0');
   for(let i=0;i<9;i++){const x=(i-4)*w*.104,hh=h*(.58+(i*3%5)*.12)*contraction;
    this.line([[x,0],[x-4,-hh*.40],[x+3,-hh*.85]],'#647960',3);
    this.poly([[x-10,-hh*.50],[x-14,-hh*.75],[x-5,-hh],[x+5,-hh*1.03],[x+14,-hh*.77],[x+8,-hh*.49]],this.grad(x-10,0,x+13,-hh,[[0,'#0b211b'],[.6,'#3d5140'],[1,'#7e8970']]),'#a4aa8038',1);
    if(ph==='warning')this.line([[x,-hh*.98],[x+1,-hh*.66]],'#dfbc8299',2);
   }
  }
  c.restore();
 }
 human(actor,role='daniels',moving=false){super.human(actor,role,moving);const E=this.engine;if(role!=='daniels'||!E.detector||E.state.hidden)return;
  const p=this.project(actor.x,actor.z),c=this.c;c.save();c.translate(p.x,p.y);c.scale(p.s*(actor.facing||1),p.s*(E.motion.crouch?.72:1));
  this.line([[10,-83],[29,-71],[40,-77]],'#c3b996',8);this.line([[-9,-81],[9,-68],[31,-74]],'#999c78',7);
  this.poly([[28,-88],[57,-86],[61,-69],[30,-67]],'#163535','#adbea6',1.5);this.rect(35,-82,16,8,'#a1c2ac');this.line([[57,-85],[62,-107]],'#c7d7b8',2);this.ellipse(62,-108,4,3,'#bccda9');c.restore();
 }
 hazardEllipse(f,outline=false){const c=this.c,p=this.project(f.x,f.z),rx=f.rx,ry=Math.max(8,f.rz*150),t=this.engine.state.time;
  c.save();this.ellipse(p.x,p.y,rx,ry,f.kind==='core'?'#b3b68012':'#b8cbaa12');
  if(f.kind==='cloud'&&f.density>.015){
   const count=this.reduceFX?8:42;
   for(let i=0;i<count;i++){const a=i*2.399963,r=Math.sqrt(((i*37)%101)/101)*.94,px=p.x+Math.cos(a)*r*rx,py=p.y+Math.sin(a)*r*ry;
    c.globalAlpha=f.density*(this.reduceFX?.19:.28);this.ellipse(px,py-9-(i%4)*6,12+(i%3)*8,10+(i%4)*4,'#b2c0a0');
    if(!this.reduceFX){c.globalAlpha=f.density*.60;this.ellipse(px+Math.sin(t*3+i)*4,py-15-(i%5)*7,1.3,1.1,'#d4d7b6');}
   }
  }
  c.globalAlpha=1;
  if(outline||f.phase==='warning'){
   c.beginPath();c.ellipse(p.x,p.y,rx,ry,0,0,Math.PI*2);c.strokeStyle=f.phase==='warning'?'#ebc389':'#d0d8b9';c.lineWidth=1.5;c.setLineDash([7,5]);c.stroke();c.setLineDash([]);
   if(p.x>70&&p.x<this.W-70)this.text(f.phase==='warning'?'ÉMISSION IMMINENTE':f.kind==='core'?'MASSIF':'PANACHE',p.x,p.y+ry+15,9,'#e3d8ad','center');
  }c.restore();
 }
 frame(dt,input){super.frame(dt,input);const E=this.engine,c=this.c,contrast=!!this.hazardContrast||!!E.detector;
  for(const f of E.atmosphereFields())this.hazardEllipse(f,contrast);
  if(contrast)for(const o of E.room.props.filter(o=>o.kind==='spore'||o.kind==='fire')){
   const p=this.project(o.x,o.z),rx=o.kind==='spore'?o.w/2+25:o.w/2,ry=E.room.view==='side'?15:(o.kind==='spore'?.15:.16)*150;
   c.save();c.setLineDash([6,5]);c.strokeStyle='#ecc795';c.lineWidth=1.5;c.strokeRect(p.x-rx,p.y-ry,rx*2,ry*2);c.restore();this.text(o.kind==='spore'?'SPORES':'FEU',p.x,p.y+ry+14,10,'#ecd5b2','center');
  }
  const reading=E.detectorReadings();if(reading){for(const q of reading.samples){const p=this.project(q.x,q.z);if(p.x<25||p.x>this.W-25)continue;
   this.ellipse(p.x,p.y+5,12,4,q.clear?'#d6e0b957':'#997d5c50');this.line([[p.x,p.y-10],[p.x,p.y-30]],'#e0e4bf80',1);this.text(q.clear?String(q.value):'—',p.x,p.y-38,12,'#e4e4c6','center');}
  }
 }
}
root.CovenantRenderer=CovenantAtmosphereRenderer;
})(globalThis);
