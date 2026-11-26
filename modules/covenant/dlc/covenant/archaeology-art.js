/* Original stonework, shared glyphs and state-driven hydraulics. No image composites.
 * Ground pools use the same x/z extents as slow/noise zones. Gate derives from core.
 */
(function(root){'use strict';
const {clamp}=root.CovenantCore;
class CovenantArchaeologyRenderer extends root.CovenantRenderer{
 glyph(index,x,y,size,color='#e0d5ae'){
  const c=this.c;c.save();c.translate(x,y);c.scale(size/30,size/30);
  if(index===0){this.line([[-13,-4],[-10,9],[0,14],[10,9],[13,-4]],color,2.5);this.line([[-6,-8],[-6,1]],color,2);this.line([[6,-8],[6,1]],color,2);}
  if(index===1){c.beginPath();c.moveTo(0,-15);c.bezierCurveTo(-17,0,-7,9,0,7);c.bezierCurveTo(8,9,16,0,0,-15);c.fillStyle=color;c.fill();for(let j=0;j<3;j++)this.line([[-13+j*2,11+j*4],[13-j*2,11+j*4]],color,1.5);}
  if(index===2){this.line([[-12,13],[-12,-11],[12,-11],[12,13]],color,3);this.line([[-17,14],[17,14]],color,2);this.line([[0,-6],[0,11]],color,1);}
  if(index===3){for(let j=-1;j<=1;j++)this.line([[j*10,-15],[j*10,-7],[j*10-3,2],[j*10,10]],color,2.3);this.line([[-17,15],[17,15]],color,2.5);}
  c.restore();
 }
 masonry(x,y,w,h,shade='#52625b'){
  this.rect(x,y,w,h,shade);this.line([[x+3,y+4],[x+w-3,y+4],[x+w-3,y+h-3]],'#a9b5a02b',2);
  for(let j=0;j<Math.floor(h/54);j++){const yy=y+45+j*54;this.line([[x+2,yy],[x+w-2,yy]],'#122b2c66',2);const xx=x+w*(j%2?.68:.30);this.line([[xx,yy],[xx,yy+Math.min(52,h-j*54-45)]],'#112a2d55',1.5);}
 }
 stoneArch(x,y,w,h,thick,fill='#334c49'){
  const c=this.c;c.save();c.translate(x,y);c.beginPath();c.moveTo(-w/2,0);c.lineTo(-w/2,-h*.64);c.bezierCurveTo(-w/2,-h*1.1,w/2,-h*1.1,w/2,-h*.64);c.lineTo(w/2,0);c.lineTo(w/2-thick,0);c.lineTo(w/2-thick,-h*.63);c.bezierCurveTo(w/2-thick,-h*.93,-w/2+thick,-h*.93,-w/2+thick,-h*.63);c.lineTo(-w/2+thick,0);c.closePath();c.fillStyle=fill;c.fill();c.strokeStyle='#aeb7a04d';c.lineWidth=3;c.stroke();
  for(let j=0;j<9;j++){const a=Math.PI+j*Math.PI/8;this.line([[Math.cos(a)*(w*.5-thick),-h*.63+Math.sin(a)*h*.3],[Math.cos(a)*w*.5,-h*.64+Math.sin(a)*h*.37]],'#152d3099',2);}
  c.restore();
 }
 background(){
  const E=this.engine,r=E.room;if(!r.archaeology)return super.background();
  const c=this.c,W=this.W,t=E.state.time,arch=r.visual.architecture,stat=E.archaeologyStatus();
  if(arch==='aqueduct'){
   this.sky(this.scene(r),false);
   for(let i=-1;i<W/410+2;i++){const x=i*410-(this.camera*.11)%410;this.stoneArch(x+160,495,365,255,29,'#58746b');this.masonry(x-15,230,50,270,'#45625d');}
   this.rect(0,211,W,20,'#6d8073');this.line([[0,210],[W,210]],'#b2b8a070',3);
   for(let i=-1;i<W/570+2;i++){const x=i*570-(this.camera*.43)%570;this.stoneArch(x+230,525,510,490,53,'#293e3d');this.masonry(x-55,68,106,461,'#344d45');this.line([[x-23,115],[x-26,230],[x-8,294],[x-28,412]],'#a6b08a3d',3);}
   this.rect(0,32,W,36,this.grad(0,32,0,68,[[0,'#77877a'],[1,'#1c393c']]));this.line([[0,38],[W,38]],'#b5c2a455',3);
  }else{
   this.rect(0,0,W,550,this.grad(0,0,0,550,[[0,'#081d27'],[.48,arch==='reliquary'?'#506058':'#2f4b4a'],[1,'#172f31']]));
   for(let i=-1;i<W/460+2;i++){const x=i*460-(this.camera*.24)%460;this.stoneArch(x+190,537,385,490,45,arch==='reliquary'?'#4e655a':'#2c4945');this.masonry(x-25,165,48,370,'#334d43');}
   if(arch==='effigybasin'){
    for(let i=0;i<5;i++){const x=i*425-this.camera*.11;this.stoneHead(x+155,412,290);this.line([[x+58,470],[x+257,470]],'#c8cc9a2a',2);}
    for(let i=0;i<3;i++)this.poly([[W*.17+i*440,0],[W*.21+i*440,0],[W*.48+i*430,570],[W*.3+i*390,570]],'#b7d1b40b');
   }
   if(arch==='sluiceworks'){
    // One continuous high water course and drain lip behind the player plane.
    this.masonry(0,345,W,103,'#344f4c');this.rect(0,365,W,22,'#09252f');this.rect(0,377,W,Math.max(1,10*stat.water),'#81aa9b6e');
    for(let x=-(this.camera*.56%380);x<W+380;x+=380){this.masonry(x,416,58,108,'#486154');this.line([[x+70,470],[x+340,470]],'#95ad8c42',5);}
   }
   if(arch==='reliquary')for(let x=-(this.camera*.18%280);x<W+280;x+=280){this.rect(x+40,256,110,143,'#102d32');this.glyph(Math.abs(Math.floor(x/280))%4,x+96,325,50,'#a1b99b44');this.line([[x+45,418],[x+153,418]],'#c2caaa44',3);}
  }
  // The local plane continues below every interaction. It never becomes a menu background.
  const horizon=r.view==='side'?549:525;
  this.rect(0,horizon,W,760-horizon,this.grad(0,horizon,0,760,[[0,'#435b50'],[.45,'#2c4640'],[1,'#102c30']]));
  for(let row=0;row<6;row++){const yy=horizon+10+row*37;this.line([[0,yy],[W,yy]],'#81927a35',2);for(let x=-(this.camera%180)-(row%2)*90;x<W+200;x+=180)this.line([[x,yy],[x+9,yy+36]],'#95a48726',1);}
  for(const w of E.data.archaeology.water.filter(w=>w.room===r.id)){
   const p=this.project(w.x-w.w/2,w.z-w.depth),q=this.project(w.x+w.w/2,w.z+w.depth),height=r.view==='side'?38:q.y-p.y;
   const yy=r.view==='side'?628:p.y;
   this.rect(p.x,yy,w.w,height,'#0a2933');this.line([[p.x,yy],[p.x+w.w,yy]],'#98b5a17b',3);
   if(stat.water>.02){this.rect(p.x+3,yy+height*(1-stat.water),w.w-6,Math.max(1,height*stat.water),this.grad(0,yy,0,yy+height,[[0,'#548877bc'],[1,'#739b8275']]));
    for(let j=0;j<10;j++){const x=p.x+20+j*(w.w-40)/10+Math.sin(t*1.4+j)*12;this.line([[x,yy+height*.56],[x+38+stat.water*40,yy+height*.56]],'#d1debd40',1);}
   }else for(let j=0;j<12;j++)this.line([[p.x+j*w.w/12,yy+height*.5],[p.x+j*w.w/12+27,yy+height*.55]],'#a4ad8270',2);
   if(r.view==='side')this.line([[p.x,645],[p.x+w.w,645]],'#a6b18a88',2);
  }
  this.rect(0,722,W,38,this.grad(0,722,0,760,[[0,'#112d2b00'],[1,'#081b25']]));
  if(!this.reduceFX)for(let j=0;j<30;j++){const x=(j*163-this.camera*.45+t*9)%(W+70);this.ellipse(x,130+(j*79)%470,1,1,'#dde3b72b');}
 }
 prop(o){
  const types=['relief-tablet','aqueduct-pier','spillway','stone-crown','counterweight','hydraulic-lever','sluice-gauge','weathered-face','imprint-slab'];if(!types.includes(o.kind))return super.prop(o);
  const E=this.engine,c=this.c,p=o.kind==='stone-crown'||o.kind==='hydraulic-lever'?this.project(o.x,o.z):this.propPoint(o);if(p.x<-260||p.x>this.W+260)return;
  c.save();c.translate(p.x,p.y);c.scale(p.s,p.s);const stat=E.archaeologyStatus();
  if(o.kind==='aqueduct-pier'){this.masonry(-o.w/2,-o.h,o.w,o.h,'#4b6455');this.poly([[-o.w*.64,-o.h],[-o.w*.64,-o.h-24],[o.w*.64,-o.h-24],[o.w*.64,-o.h]],'#7f8c71');for(let j=-1;j<=1;j++)this.line([[j*28,-o.h+30],[j*28-5,-35]],'#afba912b',3);}
  if(o.kind==='relief-tablet'){this.masonry(-83,-174,166,158,'#465e4f');this.rect(-62,-151,124,113,'#233f3c');this.glyph(o.symbol,0,-105,65,'#d0d2a6');this.text(['','I','II','III'][o.ordinal],0,-194,21,'#dedbb7','center');this.text(E.data.archaeology.symbols[o.symbol].toUpperCase(),0,-22,12,'#d0d5ad','center');this.line([[-55,-52],[55,-52]],'#b5bf954f',2);}
  if(o.kind==='spillway'){this.masonry(-o.w/2,-o.h,o.w,o.h,'#354e46');this.poly([[-o.w*.3,-o.h+20],[o.w*.3,-o.h+20],[o.w*.22,-10],[-o.w*.22,-10]],'#092a30');if(stat.water>.05){for(let j=-2;j<=2;j++){const y=-o.h+26+((E.state.time*35+j*7)%(o.h-34));this.line([[j*12,y],[j*12+3,Math.min(-12,y+20)]],'#9bb9a453',2);}}}
  if(o.kind==='stone-crown'){
   const v=E.state.archaeology.rings[o.ringId];this.masonry(-66,-85,132,84,'#496452');this.ellipse(0,-128,82,82,'#122f33');this.ellipse(0,-128,76,76,'#a0a783');this.ellipse(0,-128,70,70,'#294a48');
   c.save();c.translate(0,-128);c.rotate(-(v.index+v.progress)*Math.PI/2);for(let i=0;i<4;i++){const angle=-Math.PI/2+i*Math.PI/2;this.glyph(i,Math.cos(angle)*46,Math.sin(angle)*46,26,i===v.index?'#e4dcae':'#b6c5a2');}c.restore();
   this.ellipse(0,-128,18,18,'#6f846d');this.ellipse(0,-128,9,9,'#122f35');this.poly([[-8,-219],[8,-219],[0,-204]],'#eee1b6');
   this.text(['','I','II','III'][o.ordinal],0,-239,23,'#ded8aa','center');this.text(v.progress?'CRAN ENGAGÉ':E.data.archaeology.symbols[v.index].toUpperCase(),0,-26,12,'#dfddb4','center');
   if(v.progress){this.rect(-45,-12,90,3,'#243d35');this.rect(-45,-12,90*v.progress,3,'#e1d293');}
  }
  if(o.kind==='counterweight'){
   const drop=stat.gate*85;this.line([[-18,-o.h],[ -18,-95+drop]],'#a0b098',4);this.line([[18,-o.h],[18,-95+drop]],'#738b7a',3);
   for(let j=0;j<Math.floor(o.h/23);j++)this.ellipse(-18,-o.h+j*23+(drop%23),3.2,7,'#85947b');
   this.masonry(-o.w*.45,-95+drop,o.w*.9,82,'#7b8e70');this.line([[-o.w*.42,-88+drop],[o.w*.42,-88+drop]],'#c7c89b66',2);
  }
  if(o.kind==='hydraulic-lever'){
   this.masonry(-38,-82,76,81,'#7e8e72');this.ellipse(0,-84,23,16,'#233d3e');this.line([[0,-84],[stat.phase==='idle'?-21:37,stat.phase==='idle'?-156:-109]],'#c1c4a0',9);this.ellipse(stat.phase==='idle'?-21:37,stat.phase==='idle'?-156:-109,11,7,'#667e6a');this.text('DÉVERSOIR',0,-183,12,'#d4d7b8','center');
  }
  if(o.kind==='sluice-gauge'){this.masonry(-35,-210,70,200,'#3f594c');this.rect(-12,-184,24,150,'#102e35');this.rect(-9,-34-144*stat.water,18,144*stat.water,'#88b29a');for(let j=0;j<6;j++)this.line([[18,-36-j*29],[28,-36-j*29]],'#cdd0a48c',2);this.text('EAU',0,-224,11,'#d5d3a9','center');}
  if(o.kind==='weathered-face'){this.stoneHead(0,-15,o.h);for(let i=0;i<4;i++)this.line([[-o.w*.2+i*9,-o.h*.28],[o.w*.24,-o.h*.34-i*12]],'#a2b28b26',2);}
  if(o.kind==='imprint-slab'){this.masonry(-o.w/2,-o.h,o.w,o.h,'#778970');this.rect(-o.w*.39,-o.h+23,o.w*.78,o.h-50,'#3b5750');for(let j=0;j<3;j++){this.glyph(j,-45+j*43,-o.h+62,25,'#bfcca784');for(let i=0;i<7;i++)this.line([[-66,-o.h+97+i*13],[55-((i*17)%31),-o.h+97+i*13]],'#a8ba9455',1.3);}}
  c.restore();
 }
 portal(exit){
  if(!exit.hydraulicGate)return super.portal(exit);const E=this.engine,s=E.archaeologyStatus(),p=this.project(exit.x,exit.z),c=this.c;if(p.x<-200||p.x>this.W+200)return;
  c.save();c.translate(p.x,p.y);c.scale(p.s,p.s);this.masonry(-95,-284,190,282,'#566e5b');this.rect(-64,-251,128,249,'#061f28');
  c.save();c.beginPath();c.rect(-63,-252,126,252);c.clip();this.masonry(-61,-249-254*s.gate,122,249,'#7d8f70');for(let j=-1;j<=1;j++)this.line([[j*30,-229-254*s.gate],[j*30,-22-254*s.gate]],'#344f4388',6);this.glyph(2,0,-116-254*s.gate,48,'#c9cd9c88');c.restore();
  this.text(s.open?'PASSAGE LIBRE':s.phase==='idle'?'DALLE RETENUE':s.phase==='draining'?'VIDANGE EN COURS':'CONTREPOIDS EN MOUVEMENT',0,-301,11,s.open?'#cfdfb6':'#dfc69c','center');this.line([[-99,2],[99,2]],'#c6cea474',3);c.restore();
 }
 drawWeapon(actor,pt,draw){if(this.engine.rotating)return;return super.drawWeapon(actor,pt,draw);}
 human(actor,role='daniels',moving=false){super.human(actor,role,moving);if(role!=='daniels'||!this.engine.rotating)return;
  const c=this.c,p=this.project(actor.x,actor.z),v=this.engine.state.archaeology.rings[this.engine.rotating],a=Math.sin(v.progress*Math.PI);
  c.save();c.translate(p.x,p.y);c.scale(p.s*(actor.facing||1),p.s);this.line([[10,-80],[25,-96-a*5],[38,-111+a*12]],'#c5b99a',7);this.line([[-3,-82],[9,-96],[25,-117+a*8]],'#9a9e7f',6);c.restore();
 }
 frame(dt,input){super.frame(dt,input);const E=this.engine;if(!E.room.archaeology)return;
  const target=E.nearestArchaeology();if(target){const p=this.project(target.x,target.z);this.text(E.rotating?'ROTATION '+Math.floor(E.state.archaeology.rings[E.rotating].progress*100)+' %':target.type==='stone-ring'?'E · UN CRAN':'E · DÉVERSOIR',clamp(p.x,100,this.W-100),p.y-270,12,'#e4d7b5','center');}
 }
}
root.CovenantRenderer=CovenantArchaeologyRenderer;
})(globalThis);
