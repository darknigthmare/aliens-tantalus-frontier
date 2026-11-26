/* v0.9 original vector art. Position and wheel angles read the load state.
 * This renderer also serves CCTV through the fully-derived renderer facade.
 */
(function(root){'use strict';
class CovenantFreightRenderer extends root.CovenantRenderer {
 prop(o){
  if(!['freight-cart','freight-rail','freight-dock'].includes(o.kind))return super.prop(o);
  const E=this.engine,c=this.c,def=E.data.freight.carts.find(v=>v.id===o.cart);if(!def)return;
  const load=E.freightCarts().find(v=>v.id===def.id);if(!load)return;const parked=E.freightParked(load),p=this.propPoint({...o,x:o.kind==='freight-cart'?load.x:o.x});
  if(p.x<-650||p.x>this.W+650)return;c.save();c.translate(p.x,p.y);c.scale(p.s,p.s);
  const w=o.w,h=o.h;
  if(o.kind==='freight-rail'){
   for(const y of [-6,7]){this.line([[-w/2,y],[w/2,y]],'#0a1b1c',7);this.line([[-w/2,y-1],[w/2,y-1]],'#91a3a05e',2);}
   for(let x=-w/2;x<w/2;x+=52)this.line([[x,-9],[x,11]],'#60736b87',3);
   this.line([[-w/2,-11],[-w/2,13]],'#b7a777',7);this.line([[w/2,-11],[w/2,13]],'#b7a777',7);
  }else if(o.kind==='freight-dock'){
   this.poly([[-w/2,-13],[w/2,-13],[w/2+13,12],[-w/2-13,12]],parked?'#a5cfa03b':'#ccaa5a20',parked?'#c5d1a3':'#b8a06c',1.5);
   for(let x=-w/2+8;x<w/2-7;x+=22)this.line([[x,-11],[x+9,10]],'#aa9d685c',3);
   this.text(parked?'PARCAGE ATTEINT':'ZONE DE PARCAGE',0,30,10,parked?'#c0d6ad':'#c2b08a','center');
  }else{
   this.ellipse(0,7,w*.61,12,'#000b0ab0');
   // Wheels rotate with actual translation, never with idle time.
   for(const xx of[-w*.34,w*.34]){this.ellipse(xx,-8,13,13,'#122329','#9bac9b',2);const a=(load.x-def.x)/13;this.line([[xx-9*Math.cos(a),-8-9*Math.sin(a)],[xx+9*Math.cos(a),-8+9*Math.sin(a)]],'#b8bda1',2);}
   this.poly([[-w*.51,-28],[w*.45,-28],[w*.54,-11],[-w*.46,-11]],'#435951','#bcbb9380',2);
   this.line([[-w*.48,-23],[w*.48,-23]],'#c6af79',5);
   this.poly([[-w*.43,-h+12],[w*.33,-h+12],[w*.44,-h+29],[w*.44,-30],[-w*.43,-30]],this.grad(-w*.4,-h,w*.5,0,[[0,'#708477'],[.55,'#4a625b'],[1,'#243a35']]),'#b6c0a380',2);
   this.poly([[-w*.43,-h+12],[-w*.31,-h],[w*.40,-h],[w*.46,-h+15],[w*.33,-h+12]],'#9aa489','#ced0aa66',1.5);
   this.poly([[w*.33,-h+12],[w*.46,-h+15],[w*.46,-30],[w*.33,-30]],'#293f38','#849e7a66',1.5);
   if(def.variant==='filters'){
    for(let i=0;i<3;i++){const x=-w*.29+i*w*.21;this.rect(x-11,-h+29,23,h-67,'#183735');for(let y=-h+37;y<-39;y+=9)this.line([[x-7,y],[x+8,y]],'#abc2b181',2);}
   }else if(def.variant==='tools'){
    for(let i=0;i<3;i++){this.rect(-w*.33,-h+27+i*29,w*.59,24,'#273d37','#9daa917b',1.5);this.line([[-14,-h+40+i*29],[8,-h+40+i*29]],'#d0c491',3);}
   }else{
    this.poly([[-w*.26,-h+37],[w*.20,-h+37],[w*.24,-h+101],[-w*.30,-h+101]],'#223d36','#a6ac86',2);this.text('SCELLÉ',-5,-h+77,11,'#bcc6a8','center');
    this.line([[-w*.3,-h+29],[w*.24,-36]],'#b5a975',6);this.line([[w*.25,-h+29],[-w*.31,-36]],'#8d9476',5);
   }
   this.rect(-35,-h+3,66,20,'#122d2b');this.text(def.name.split(' · ')[0],-3,-h+17,12,'#e5d3aa','center');
   for(const side of[-1,1]){this.line([[side*w*.43,-36],[side*(w/2+15),-54],[side*(w/2+15),-69]],'#b0bba7',4);this.line([[side*(w/2+10),-69],[side*(w/2+23),-69]],'#c9d4b5',5);}
   const held=E.grip?.id===load.id;this.ellipse(w*.40,-h+40,4,4,held?'#deb96b':parked?'#bcdcb3':'#879d97');
   this.text(held?'EN MANŒUVRE':'FREIN AUTO',0,-34,8,held?'#e7c995':'#b9c6b4','center');
  }
  c.restore();
 }
 human(actor,role='daniels',moving=false){const E=this.engine;if(role!=='daniels'||!E.grip)return super.human(actor,role,moving);
  const p=this.project(actor.x,actor.z),c=this.c;if(p.x<-130||p.x>this.W+130)return;
  this.ellipse(p.x,p.y+6,24*p.s,6*p.s,'#011414c0');c.save();c.translate(p.x,p.y);c.scale(p.s*actor.facing,p.s);
  const pr=E.appearance?E.appearance(actor,role):{coat:'#9a9270',pants:'#43584f',skin:'#cabc9d',hair:'#35412f'};
  const stride=E.motion.haulMoving?Math.sin(E.state.time*11)*9:0;
  this.line([[-10,-43],[-20-stride*.5,-25],[-24+stride,-3]],pr.pants,12);this.line([[8,-43],[10+stride*.5,-24],[22-stride,-3]],pr.pants,12);
  this.line([[-24+stride,-3],[-35+stride,-3]],'#102922',8);this.line([[22-stride,-3],[32-stride,-3]],'#182e25',8);
  this.poly([[-11,-86],[10,-94],[20,-78],[17,-46],[-13,-43],[-19,-66]],this.grad(-20,-90,24,-40,[[0,pr.coat],[1,'#354b4c']]),'#c4c39d6b',1.5);
  this.line([[-12,-84],[-10,-53]],'#d1cfad',3);this.rect(-14,-52,32,6,'#2e493b');this.rect(-17,-80,8,25,'#405c47');
  this.ellipse(9,-105,11,14,pr.skin);this.poly([[-3,-108],[0,-120],[13,-121],[21,-113],[19,-106],[5,-111]],pr.hair);
  this.line([[-8,-81],[4,-66],[27,-68]],pr.coat,9);this.line([[17,-83],[24,-66],[30,-67]],pr.coat,8);this.ellipse(31,-67,5,4,pr.skin);
  if(pr.head==='eva'){this.ellipse(9,-105,20,25,'#3c66688c');c.beginPath();c.ellipse(9,-105,20,25,0,0,Math.PI*2);c.strokeStyle='#bbcfc7';c.lineWidth=4;c.stroke();this.line([[-8,-87],[27,-87]],'#d2dac7',4);this.line([[-7,-86],[-9,-50],[13,-51],[15,-85]],'#c9c8a3',3);this.rect(-8,-134,12,6,'#d1e4d4');}
  c.restore();
 }
 frame(dt,input){super.frame(dt,input);const E=this.engine,h=E.nearestFreight();
  if(!h||E.busy||E.state.hidden)return;const cart=E.freightCarts().find(c=>c.id===h.id),p=this.project(cart.x,cart.z);
  this.text(E.grip?'P · RELÂCHER':'P · SAISIR LA POIGNÉE',Math.max(95,Math.min(this.W-95,p.x)),p.y-cart.h*p.s-22,11,'#d8cfac','center');
 }
}
root.CovenantRenderer=CovenantFreightRenderer;
})(globalThis);
