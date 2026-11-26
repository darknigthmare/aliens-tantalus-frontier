/* Authored crawl-space cutaways. All motion and rotor state comes from core. */
(function(root){'use strict';
const {clamp}=root.CovenantCore;
class CovenantMaintenanceRenderer extends root.CovenantRenderer {
 background(){
  const r=this.engine.room;if(!r.crawl)return super.background();
  const c=this.c,W=this.W,t=this.engine.state.time,variant=r.visual.architecture,blue=variant.includes('coolant'),filter=variant.includes('filter');
  this.rect(0,0,W,760,this.grad(0,0,0,760,[[0,'#08151c'],[.6,'#23383c'],[1,'#05121a']]));
  // Machinery extends above and below the accessible low channel; not blank padding.
  for(let i=-1;i<W/390+3;i++){
   const x=i*390-(this.camera*.35)%390;
   this.rect(x+16,65,346,290,'#14262f');this.line([[x+18,65],[x+357,65],[x+357,352]],'#587578',3);
   if(blue){for(let j=0;j<4;j++){this.line([[x+24,95+j*57],[x+330,95+j*57]],j%2?'#3c6770':'#63828a',24);this.line([[x+40,86+j*57],[x+312,86+j*57]],'#91beb457',3);this.rect(x+130,81+j*57,16,29,'#142b35');}}
   else if(filter){for(let j=0;j<7;j++){this.rect(x+32+j*44,100,33,209,'#52635b');for(let k=0;k<14;k++)this.line([[x+34+j*44,107+k*14],[x+59+j*44,114+k*14]],'#132831',3);}}
   else{for(let j=0;j<8;j++)this.line([[x+35,94+j*28],[x+110,94+j*28],[x+197,174+j*14],[x+333,174+j*14]],j%3?'#455964':'#8f825f',7);}
   this.text(blue?'REFROIDISSEMENT / AUX':filter?'FILTRATION / HAB':'EXTRACTION / FRET',x+30,332,12,'#9bad9e');
  }
  this.rect(0,360,W,43,'#091b24');for(let x=-this.camera*.45;x<W+400;x+=300){this.line([[x,365],[x+210,365],[x+250,393],[x+305,393]],'#667b7966',8);}
  this.text(r.name.toUpperCase(),34,440,20,'#acbfb6');this.text('PASSAGE DE MAINTENANCE  /  ACCÈS BAS',35,465,11,'#849e98');
  this.rect(0,500,W,145,this.grad(0,500,0,645,[[0,'#071923'],[.55,blue?'#14353e':filter?'#2a342e':'#192b38'],[1,'#294443']]));
  this.line([[0,501],[W,501]],'#afbbac',5);this.line([[0,510],[W,510]],'#4b656e',5);
  this.line([[0,645],[W,645]],'#b5c1ac',4);this.rect(0,650,W,16,'#111f2b');
  for(let x=-(this.camera%160);x<W+200;x+=160){this.line([[x,671],[x+64,735],[x+139,672]],'#506b71',7);this.line([[x+8,675],[x+62,727]],'#91b3a350',2);for(let n=0;n<5;n++)this.rect(x+n*31,648,17,3,'#bec6aa55');}
  if(!this.reduceFX)for(let i=0;i<28;i++){const x=(i*107-this.camera*.8+t*(blue?8:15))%(W+120);this.ellipse(x,526+(i*17)%100,blue?1.3:1.7,blue?3:1,'#d1d8b235');}
 }
 prop(o){
  const types=['duct-rib','filter-bank','cable-tray','maintenance-fan','isolation-box','maintenance-tag','duct-mouth'];if(!types.includes(o.kind))return super.prop(o);
  if(o.kind==='duct-mouth')return; // portal draws this mouth once, from its actual threshold.
  const c=this.c,p=this.project(o.x,o.z),E=this.engine;if(p.x<-200||p.x>this.W+200)return;c.save();c.translate(p.x,p.y);c.scale(p.s,p.s);const w=o.w,h=o.h;
  if(o.kind==='duct-rib'){this.rect(-w/2,-142,w,8,'#637c7c');this.rect(-w/2+7,-134,7,121,'#7a8f832b');this.line([[-w/2,-142],[-w/2+6,-10],[w/2,-10]],'#80988e75',3);}
  if(o.kind==='filter-bank'){this.rect(-w/2,-132,w,47,'#59665a');for(let j=0;j<12;j++)this.line([[-w/2+7+j*14,-128],[-w/2+7+j*14,-89]],'#122b31',3);}
  if(o.kind==='cable-tray'){for(let j=0;j<4;j++)this.line([[-w/2,-130+j*8],[w/2,-130+j*8]],j%2?'#586e78':'#8a7f5f',5);this.rect(-w*.22,-136,9,39,'#253843');}
  if(o.kind==='maintenance-tag'){this.rect(-17,-67,34,37,'#7d8e80');this.rect(-12,-62,24,26,'#c2c3a2');for(let j=0;j<4;j++)this.line([[-9,-57+j*5],[9,-57+j*5]],'#536b67',1);}
  if(o.kind==='isolation-box'){const v=E.state.maintenance.fans[o.fanId];this.rect(-19,-66,38,49,'#668782');this.rect(-15,-62,30,30,'#142b36');this.line([[-5,-52],[7,v.isolated?-44:-57]],'#c7baa0',4);this.ellipse(0,-25,4,4,v.isolated?'#b7d9a5':'#d4ad6e');}
  if(o.kind==='maintenance-fan'){
   const v=E.state.maintenance.fans[o.fanId],open=v.spin<=.08;
   this.rect(-69,-143,138,7,'#8caaac');this.rect(-69,-5,138,9,'#789991');
   this.ellipse(0,-73,55,66,'#091a24');this.ellipse(0,-73,51,62,'#496871');this.ellipse(0,-73,45,55,'#091c29');
   c.save();c.translate(0,-73);c.scale(.82,1);c.rotate(v.angle);for(let j=0;j<5;j++){c.rotate(Math.PI*2/5);this.poly([[3,-9],[13,-49],[38,-37],[26,-9],[9,5]],'#9aa99b','#c3c9b070',1);this.line([[15,-42],[27,-31],[17,-13]],'#243f48',2);}c.restore();this.ellipse(0,-73,11,13,'#8fa7a1');
   // Guard surrounds the rotor; no visual collision claim without state.
   this.line([[-62,-143],[-62,0]],'#95b8b2',5);this.line([[62,-143],[62,0]],'#95b8b2',5);
   this.text(open?'LIBRE':v.isolated?'ARRÊT…':'ROTOR ACTIF',0,-158,11,open?'#c8e3b0':'#e2c195','center');
   this.rect(-52,-150,104,3,'#1b3540');this.rect(-52,-150,104*(1-v.spin),3,'#b6d3ac');
   if(!open){this.line([[-62,-8],[62,-8]],'#d8b671',3);}
  }
  c.restore();
 }
 portal(exit){if(!exit.crawl)return super.portal(exit);const c=this.c,E=this.engine,p=this.project(exit.x,exit.z),d=E.state.doors[exit.doorId],amount=d?.amount||0,ok=E.exitPermitted(exit);if(p.x<-140||p.x>this.W+140)return;
  c.save();c.translate(p.x,p.y);c.scale(p.s,p.s);this.rect(-57,-81,114,80,'#344d55');this.rect(-49,-74,98,68,'#061a26');this.line([[-58,-82],[58,-82],[58,0]],ok?'#8bada2':'#b39c72',3);
  for(let i=0;i<7;i++){const y=-68+i*9-amount*73;if(y>-75)this.line([[-45,y],[45,y]],'#9ea99a',4);}
  this.ellipse(0,6,47,6,'#c1d0b02b');this.text(ok?'GAINE':'VERROUILLÉ',0,-99,10,ok?'#b3c6ad':'#b9a783','center');if(E.distance(exit)<145)this.text('E / G',0,-115,11,'#d6dfbc','center');c.restore();
 }
 human(actor,role='daniels',moving=false){if(!this.engine.room.crawl||role!=='daniels')return super.human(actor,role,moving);const c=this.c,p=this.project(actor.x,actor.z),E=this.engine,t=E.state.time,move=E.motion.moving&&!E.paused,a=move?Math.sin(t*8):0;if(p.x<-130||p.x>this.W+130)return;
  const pr=E.appearance?E.appearance(actor,role):{coat:'#969172',pants:'#43555c',skin:'#baa98b',hair:'#4b5147'};
  this.ellipse(p.x,p.y+3,49,5,'#010e16a0');c.save();c.translate(p.x,p.y);c.scale(actor.facing||1,1);
  this.line([[-19,-27],[-40,-13],[-49,-4],[-65,-5]],pr.pants,9);this.line([[1,-25],[-13+a*12,-12],[-25+a*14,-5]],pr.pants,10);
  this.poly([[-26,-29],[-22,-49],[10,-45],[23,-29],[7,-22]],pr.coat,'#c0b89a',1.2);this.rect(-27,-56,24,12,'#475e5f');this.line([[-48,-49],[11,-49]],'#233a44',6);
  this.line([[13,-39],[29+a*10,-22],[42+a*13,-5],[52+a*13,-5]],pr.coat,7);this.ellipse(29,-44,10,11,pr.skin);this.ellipse(24,-52,11,6,pr.hair);
  this.line([[30,-46],[39,-43]],'#ceb69a',3);if(E.state.flashlight){this.ellipse(38,-40,3,3,'#d5e5c1');this.poly([[39,-39],[170,-58],[170,-16]],'#c4dfb31a');}
  c.restore();
 }
 creature(e){if(!this.engine.room.crawl||e.kind==='facehugger')return super.creature(e);const p=this.project(e.x,e.z),c=this.c;c.save();c.translate(p.x,p.y);c.scale(1,.53);c.translate(-p.x,-p.y);super.creature(e);c.restore();}
 frame(dt,input){super.frame(dt,input);const E=this.engine,c=this.c;if(!E.room.crawl)return;
  const target=E.nearestIsolation();if(target){const p=this.project(target.x,target.z),v=E.state.maintenance.fans[target.fan];this.text(E.isolating?'CONSIGNATION '+Math.floor(v.progress*100)+' %':'E · SECTIONNEUR',clamp(p.x,105,this.W-105),p.y-85,11,'#e3d7b1','center');if(E.isolating){this.rect(p.x-38,p.y-79,76,3,'#273d45');this.rect(p.x-38,p.y-79,76*v.progress,3,'#d6dba5');}}
 }
}
root.CovenantRenderer=CovenantMaintenanceRenderer;
})(globalThis);
