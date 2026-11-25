/** Shared vector art. Costumes follow referenced layers, not face scans.
 * All drawing is pure and uses native world coordinates from the owning objects. */
import {costumeV113,bindPortalsV113,compileEvidencePropsV113} from './alien3-fidelity-v113.js';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number.isFinite(n)?n:a));
const rect=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
const stroke=(c,x,y,X,Y,col,w=1)=>{c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(X,Y);c.stroke();};
const path=(c,points,col,edge=null)=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=col;c.fill();if(edge){c.strokeStyle=edge;c.lineWidth=.7;c.stroke();}};
function ellipse(c,x,y,w,h,col){c.fillStyle=col;c.beginPath();c.ellipse(x,y,w,h,0,0,Math.PI*2);c.fill();}
export function drawPersonV113(c,a,time=0,options={}){
 if(!a?.alive)return;const id=options.id||(options.player?'ripley':a.id),look=costumeV113(id,options),d=clamp(a.depth??1,0,2),scale=.88+d*.08,dy=(d-1)*23,foot=a.y+a.h,cx=a.x+a.w/2;
 const moving=a.moving||Math.abs(a.vx||0)>2,walk=moving&&!options.reducedMotion?Math.sin(time*9.5)*9:0,crouch=a.crouching?17:0,wide=look.shape==='broad'?1.28:look.shape==='stocky'?1.14:look.shape==='lean'?.90:1;
 c.save();c.translate(cx,foot+dy);c.scale((a.facing||1)*scale,scale);c.lineJoin='round';c.lineCap='round';ellipse(c,0,1,24*wide,4,'rgba(0,5,3,.54)');
 const skin=look.skin,cloth=look.cloth,crash=look.variant==='crash';
 // Legs retain the same foot reference. The collider is never resized for costume variation.
 for(const side of [-1,1]){const xx=side*6,ankle=side*8-side*walk;stroke(c,xx,-35+crouch*.3,xx-side*walk*.55,-18,crash?skin:'#4b4035',10);stroke(c,xx-side*walk*.55,-18,ankle,-4,crash?skin:cloth,8);if(crash){stroke(c,ankle,-3,ankle+8,-2,skin,5);}else{path(c,[[ankle-5,-14],[ankle+4,-14],[ankle+5,-6],[ankle+13,-4],[ankle+13,-1],[ankle-5,-1]],'#242622','#696753');stroke(c,ankle-3,-11,ankle+3,-11,'#8d8871',.65);stroke(c,ankle-3,-8,ankle+3,-8,'#8d8871',.65);}}
 // Far arm, folded hood and torso; a broad vest differs from the narrow Ripley jacket.
 stroke(c,-11*wide,-67+crouch,-18*wide-walk*.2,-48+crouch,cloth,8);stroke(c,-18*wide-walk*.2,-48+crouch,-14*wide-walk*.4,-37+crouch,skin,5);
 if(!crash){path(c,[[-12*wide,-75+crouch],[1,-80+crouch],[13*wide,-70+crouch],[7,-63+crouch],[-12*wide,-64+crouch]],look.coat,'#a19371');}
 const grad=c.createLinearGradient(-17,-70,18,-32);grad.addColorStop(0,crash?'#747871':'#514838');grad.addColorStop(.55,cloth);grad.addColorStop(1,crash?'#b4b3a1':'#8a7860');c.fillStyle=grad;c.beginPath();c.moveTo(-13*wide,-70+crouch);c.lineTo(11*wide,-70+crouch);c.lineTo(16*wide,-37+crouch*.35);c.lineTo(-13*wide,-35+crouch*.35);c.closePath();c.fill();
 if(look.id==='dillon'){path(c,[[-14*wide,-69+crouch],[-2,-64+crouch],[-3,-35+crouch*.3],[-15*wide,-35+crouch*.3]],'#403e32','#8b785b');path(c,[[2,-64+crouch],[12*wide,-69+crouch],[16*wide,-36+crouch*.3],[4,-35+crouch*.3]],'#655b47','#9a8260');}
 if(look.coatVisible){path(c,[[-14*wide,-70+crouch],[-3,-62+crouch],[-5,-17],[-18*wide,-19],[-14*wide,-40]],look.coat,'#938770');path(c,[[6,-66+crouch],[12*wide,-70+crouch],[19*wide,-20],[7,-18],[4,-39]],look.coat,'#7a7860');}
 if(crash){for(let x=-9;x<10;x+=3)stroke(c,x,-66+crouch,x+2,-40+crouch*.3,'rgba(201,199,176,.35)',.7);rect(c,-7,-59+crouch,9,12,'rgba(39,41,31,.44)');}else{
  // Cross-stitch pattern is a design cue from the documented Ripley jacket.
  if(look.id==='ripley')for(let y=-66+crouch;y<-37+crouch*.35;y+=9)for(let x=-9;x<12;x+=9){stroke(c,x,y,x+6,y+7,'rgba(189,163,129,.43)',.5);stroke(c,x+6,y,x,y+7,'rgba(189,163,129,.28)',.5);}
  stroke(c,0,-66+crouch,2,-37+crouch*.35,'#b1a07d',.85);rect(c,-9*wide,-54+crouch,9,10,'#645a47');stroke(c,-8*wide,-53+crouch,-1,-53+crouch,'#ad9977',.65);
 }
 stroke(c,10*wide,-66+crouch,17*wide+walk*.22,-49+crouch,look.coatVisible?look.coat:cloth,8);stroke(c,17*wide+walk*.22,-49+crouch,23*wide+walk*.35,-41+crouch,skin,5);
 rect(c,-3,-80+crouch,7,9,skin);const hw=look.shape==='broad'?9.4:look.shape==='stocky'?9:7.8,hh=look.shape==='lean'?11.5:10.6;const face=c.createLinearGradient(-8,-95,9,-76);face.addColorStop(0,skin);face.addColorStop(.6,skin);face.addColorStop(1,look.id==='dillon'?'#4b372b':'#8e7c64');ellipse(c,0,-86+crouch,hw,hh,face);ellipse(c,-6,-85+crouch,2.3,3,skin);
 if(look.hair==='short-brown'){path(c,[[-8,-86+crouch],[-8,-94+crouch],[-2,-99+crouch],[7,-94+crouch],[8,-89+crouch],[2,-93+crouch],[-5,-91+crouch]],'#4b3d2d');}
 if(look.hair==='cap'){ellipse(c,-1,-95+crouch,10,4,'#6b705b');rect(c,-10,-96+crouch,18,5,'#5a614f');rect(c,2,-92+crouch,12,2,'#363f32');}
 if(look.id==='dillon'){path(c,[[-6,-81+crouch],[7,-81+crouch],[5,-76+crouch],[-3,-75+crouch]],'#382d25');}
 if(look.hair==='shaved-stubble'){stroke(c,-4,-78+crouch,5,-78+crouch,'#73634f',1.3);}
 stroke(c,4,-88+crouch,8,-87+crouch,'#383c2d',1);stroke(c,7,-83+crouch,10,-82+crouch,'#7d6d55',.8);stroke(c,4,-79+crouch,8,-79+crouch,'#65523f',.8);
 // Tiny costume marking, no floating nameplate or development tag.
 if(!crash&&look.id==='ripley'){rect(c,11*wide,-65+crouch,4,6,'#803f31');}
 c.restore();
}
export function drawPortalV113(c,p,d){if(!p?.valid)return false;const {x,y,w,h}=p.opening,frac=clamp(d.progress??(d.open?1:0),0,1),medical=p.wall==='medical';c.save();
 // Returns belong to the rear separation plane. Only the old door owns collision.
 for(const r of [p.leftReturn,p.rightReturn]){const g=c.createLinearGradient(r.x,r.y,r.x+r.w,r.y);g.addColorStop(0,'#1b2420');g.addColorStop(.5,medical?'#626b5a':'#4b4b3a');g.addColorStop(1,'#28392e');c.fillStyle=g;c.fillRect(r.x,r.y,r.w,r.h);for(let yy=r.y+17;yy<r.y+r.h;yy+=22){stroke(c,r.x,yy,r.x+r.w,yy,'rgba(174,152,117,.27)',.7);for(let xx=r.x+((Math.floor(yy/22)%2)*18);xx<r.x+r.w;xx+=36)stroke(c,xx,yy,xx,yy+21,'rgba(31,40,32,.55)',1);}}
 for(const r of [p.leftPier,p.rightPier]){rect(c,r.x,r.y,r.w,r.h,'#56604a');stroke(c,r.x+2,r.y,r.x+2,r.y+r.h,'#a59d7c',1.3);stroke(c,r.x+r.w-2,r.y,r.x+r.w-2,r.y+r.h,'#1d2c21',2);for(let yy=r.y+12;yy<r.y+r.h;yy+=29)ellipse(c,r.x+r.w/2,yy,1.6,1.6,'#b1a784');}
 const b=p.housing;rect(c,b.x,b.y,b.w,b.h,'#3c4939');rect(c,b.x+2,b.y+3,b.w-4,8,'#747560');stroke(c,b.x,b.y+b.h,b.x+b.w,b.y+b.h,'#d0bc91',1.5);for(let xx=b.x+9;xx<b.x+b.w-6;xx+=13)stroke(c,xx,b.y+4,xx,b.y+b.h-3,'#27372a',2);
 // Segmented folding shutter: visible rows disappear into the upper housing.
 c.save();c.beginPath();c.rect(x,y,w,h);c.clip();const height=h*(1-frac);if(height>.001){const end=y+height;rect(c,x,y,w,height,'#3c4a3d');for(let yy=y;yy<end;yy+=10){const hh=Math.min(8,end-yy);rect(c,x+1,yy,w-2,hh,'#59604c');stroke(c,x+2,yy,x+w-2,yy,'#919077',1);}rect(c,x+2,end-9,w-4,9,'#b5a87a');for(let xx=x+4;xx<x+w-4;xx+=9)stroke(c,xx,end-8,Math.min(x+w-2,xx+5),end-2,'#3c3f2f',2);}c.restore();
 const t=p.threshold;rect(c,t.x,t.y,t.w,t.h,'#948b68');stroke(c,t.x,t.y,t.x+t.w,t.y,'#c0b18c',1);rect(c,x+w+22,y+44,11,24,'#212e25');rect(c,x+w+25,y+48,5,4,d.open?'#bdd4a5':'#c2925e');stroke(c,x+w+27,y+58,x+w+28,y+64,'#c1b284',2);c.restore();return true;}
export function drawEvidencePropV113(c,p,{time=0,flags={}}={}){if(p.condition==='fire'&&!flags.fire)return false;c.save();c.translate(p.x,p.y);const w=p.w,h=p.h;
 if(p.kind==='recorder'){rect(c,0,5,w,h-5,'#454a3d');rect(c,2,2,w-4,5,'#8c8c72');rect(c,5,8,w*.52,h-15,'#1b2922');stroke(c,7,12,w*.5,12,'#8fa580',1);for(let j=0;j<3;j++){rect(c,w*.65,9+j*5,13,2,'#b1a476');}rect(c,4,h-3,w-8,3,'#676d57');}
 else if(p.kind==='medical-kit'){rect(c,0,h-7,w,7,'#6c7869');rect(c,3,4,w-6,h-9,'#929d85');stroke(c,5,6,w-5,h-11,'#c7c9ab',1);ellipse(c,11,8,4,4,'#526e61');rect(c,w-12,0,6,14,'#c1baa2');rect(c,w-12,0,6,3,'#586653');}
 else if(p.kind==='bishop'){rect(c,0,h-6,w,6,'#526047');path(c,[[10,h-9],[23,17],[60,22],[78,h-8]],'#bbb7a0','#d8ceb2');ellipse(c,24,11,11,10,'#c4b9a1');stroke(c,14,10,32,17,'#71694f',1);rect(c,30,8,3,2,'#28342a');for(let i=0;i<6;i++)stroke(c,61+i*3,26,76+i*2,h-8,['#858c68','#c4b887','#625e49'][i%3],1);stroke(c,23,22,0,h-7,'#c4bca5',6);}
 else if(p.kind==='flare'){rect(c,w*.4,h*.30,w*.26,h*.70,'#bca773');const pulse=.9+.1*Math.sin(time*5);const g=c.createRadialGradient(w*.52,h*.2,1,w*.52,h*.2,35);g.addColorStop(0,'rgba(255,206,128,.7)');g.addColorStop(1,'rgba(220,97,40,0)');c.fillStyle=g;c.fillRect(-28,-22,w+56,h+12);path(c,[[w*.25,h*.3],[w*.36,h*.11],[w*.5,-3*pulse],[w*.8,h*.16],[w*.7,h*.31]],'#edbf6c');}c.restore();return true;}
export function drawCompanyV113(c,actor,time=0){if(!actor?.alive)return;c.save();c.translate(actor.x+actor.w/2,actor.y+actor.h);c.scale(actor.facing||-1,1);ellipse(c,0,0,29,5,'rgba(2,8,6,.5)');for(const side of [-1,1]){stroke(c,side*8,-43,side*11,-4,'#b2b8a3',13);rect(c,side*11-6,-8,18,8,'#4a5648');}path(c,[[-19,-77],[15,-77],[19,-41],[-18,-39]],'#c1c5ae','#e1ddc1');ellipse(c,-1,-86,16,15,'#d5d7bc');path(c,[[1,-98],[14,-91],[14,-80],[1,-77]],'#677d72','#e5e4ce');stroke(c,10,-75,28,-53,'#c3c8b1',10);stroke(c,-14,-71,7,-53,'#d5d4bb',10);
 // Film-specific black finish. Visual carrier only; not a new firearm mechanic.
 path(c,[[1,-59],[15,-58],[20,-67],[36,-67],[41,-58],[66,-58],[66,-49],[34,-48],[26,-42],[18,-43],[18,-50],[1,-51]],'#202723','#66715e');stroke(c,27,-65,35,-65,'#b6b29a',1);rect(c,66,-57,11,5,'#171f1b');rect(c,55,-48,13,4,'#2b3228');rect(c,44,-54,5,3,'#a87654');c.restore();}
