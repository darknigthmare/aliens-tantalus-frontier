/** Shared Canvas renderer used by the runtime and the browser bench. */
import {drawAlien3PropV102} from './alien3-art-v102.js';
import {isDecorVisibleV102,sectorAt102} from './alien3-dlc-v102.js';
import {ALIEN3_HYBRID_SECTORS_V97} from './alien3-dlc-v97.js';
import {clamp103,finite103,resolveAlien3SpaceV103,buildAlien3MapV103} from './alien3-dlc-v103.js';
const rect=(c,x,y,w,h,fill)=>{c.fillStyle=fill;c.fillRect(x,y,w,h);};
const line=(c,pts,color,width=1)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();};
const hash=s=>[...s].reduce((a,v)=>Math.imul(a^v.charCodeAt(0),16777619)>>>0,2166136261);
const palette={medical:['#141d1d','#303f3b','#9baba1'],detention:['#1b1815','#3e3326','#b39b70'],chapel:['#1d1813','#453627','#c2a077'],service:['#101b1d','#2c3c3c','#8aaca6'],foundry:['#201711','#4c3320','#d9ac70'],furnace:['#241711','#563620','#e5ac61'],company:['#152020','#303f3b','#b6c6b3'],comms:['#14201c','#303e2d','#b2bc86'],coast:['#122124','#334345','#a2b6b3']};
function backdropPass103(c,{camera={x:0,y:0},width=1280,height=720,time=0,reducedMotion=false,style='service'}={}){
 const x=finite103(camera.x),y=finite103(camera.y),inheritedAlpha=c.globalAlpha;const colors=palette[style]||palette.service;
 c.save();const sky=c.createLinearGradient(0,0,0,height);sky.addColorStop(0,'#070e11');sky.addColorStop(.56,colors[1]);sky.addColorStop(1,'#0a1111');c.fillStyle=sky;c.fillRect(0,0,width,height);
 // Slow distant massing; all wall strips start above the top row.
 c.globalAlpha=.45*inheritedAlpha;const shift=-((x*.12)%260);
 for(let xx=shift-260;xx<width+260;xx+=260){rect(c,xx,0,247,height,colors[0]);
  for(let yy=-((y*.08)%48);yy<height;yy+=48){line(c,[{x:xx,y:yy},{x:xx+247,y:yy}],'#44504a',1);for(let bx=xx+((Math.round(yy/48)%2)*60);bx<xx+247;bx+=120)line(c,[{x:bx,y:yy},{x:bx,y:yy+48}],'#43504a',1);}
  if(style==='coast'){c.fillStyle='#536360';c.beginPath();c.moveTo(xx,260);c.lineTo(xx+61,139);c.lineTo(xx+122,190);c.lineTo(xx+181,145);c.lineTo(xx+247,246);c.lineTo(xx+247,height);c.lineTo(xx,height);c.fill();}
  else if(['foundry','furnace'].includes(style)){rect(c,xx+54,64,125,210,'#776145');c.fillStyle='#b19361';c.beginPath();c.ellipse(xx+116,64,62,17,0,0,Math.PI*2);c.fill();for(let k=0;k<4;k++)rect(c,xx+47,88+k*48,138,7,'#2c2b22');}
  else {c.strokeStyle=colors[2];c.lineWidth=7;c.beginPath();c.moveTo(xx+27,256);c.lineTo(xx+27,124);c.quadraticCurveTo(xx+122,16,xx+219,124);c.lineTo(xx+219,256);c.stroke();}
 }
 c.globalAlpha=inheritedAlpha;
 // Roof structure exists from y=0. Unlike furniture it may move in parallax.
 for(let xx=-((x*.22)%410)-410;xx<width+410;xx+=410){rect(c,xx,0,14,123,'#1c2928');line(c,[{x:xx+6,y:0},{x:xx+6,y:104},{x:xx+135,y:165}],'#707268',2);line(c,[{x:xx+13,y:18},{x:xx+152,y:106},{x:xx+151,y:128}],'#2b3b37',11);}
 rect(c,0,57,width,10,'#172828');line(c,[{x:0,y:57},{x:width,y:57}],'#7b806b');
 if(style==='coast'){c.globalAlpha=.14*inheritedAlpha;c.strokeStyle='#c8d9d4';c.lineWidth=1;const clock=reducedMotion?0:time;for(let i=0;i<100;i++){const px=(i*71.3-x*.3-clock*110)%width,py=(i*113.9+clock*240)%height;c.beginPath();c.moveTo(px,py);c.lineTo(px-11,py+23);c.stroke();}c.globalAlpha=inheritedAlpha;}
 const shade=c.createLinearGradient(0,0,0,height);shade.addColorStop(0,'rgba(0,5,8,.14)');shade.addColorStop(.43,'rgba(0,5,8,.08)');shade.addColorStop(1,'rgba(0,4,6,.36)');c.fillStyle=shade;c.fillRect(0,0,width,height);c.restore();
}
export function drawAlien3BackdropV103(c,options={}){
 const focus=finite103(options.camera?.x)+(options.width||1280)*.4;
 const styles=['coast','medical','detention','service','comms','foundry','foundry','furnace','company'];
 const sectors=ALIEN3_HYBRID_SECTORS_V97;let index=sectors.findIndex(v=>focus>=v.x0&&focus<v.x1);if(index<0)index=sectors.length-1;
 const boundary=sectors.slice(1).find(v=>Math.abs(focus-v.x0)<96);
 if(!boundary)return backdropPass103(c,{...options,style:styles[index]});
 const right=sectors.indexOf(boundary),t=clamp103((focus-boundary.x0+96)/192,0,1);
 backdropPass103(c,{...options,style:styles[right-1]});c.save();c.globalAlpha*=t;backdropPass103(c,{...options,style:styles[right]});c.restore();
}
function shell(c,g,style,active){
 const colors=palette[style]||palette.service;const x=g.x-8,w=g.w+16,base=g.y,h=Math.min(174,Math.max(g.h+17,117));const top=base-h;
 c.save();c.globalAlpha=active?1:.68;
 const gradient=c.createLinearGradient(x,top,x+w,base);gradient.addColorStop(0,colors[0]);gradient.addColorStop(.52,'#15201a');gradient.addColorStop(1,colors[0]);c.fillStyle=gradient;
 c.beginPath();c.moveTo(x,base);c.lineTo(x,top+24);c.quadraticCurveTo(x+w*.5,top-9,x+w,top+24);c.lineTo(x+w,base);c.closePath();c.fill();
 c.strokeStyle=colors[2];c.lineWidth=2;c.globalAlpha*=.55;c.stroke();
 // Rear return surfaces and wall joints, not collision walls.
 rect(c,x+3,top+30,6,h-30,'#465047');rect(c,x+w-9,top+30,6,h-30,'#465047');line(c,[{x:x+8,y:top+27},{x:x+w-8,y:top+27}],colors[2],1);
 const seed=hash(g.id);for(let i=0;i<7;i++){const tx=x+12+(seed%43+i*33)%Math.max(14,w-24);line(c,[{x:tx,y:top+32},{x:tx-3,y:top+54+(i*13)%42}],'#80634a',.8);}
 c.restore();
}
export function drawAlien3SceneryV103(c,scene,{camera={x:0,y:0},player,time=0,state,flags={},detail='high'}={}){
 if(!scene)return {props:0,circuits:0,panels:0};const space=resolveAlien3SpaceV103(scene,player),foot=finite103(player?.y)+finite103(player?.h),visible=g=>g.x+g.w>=camera.x-80&&g.x<=camera.x+1360;
 for(const g of scene.decor.groups){if(!visible(g)||!isDecorVisibleV102(g,flags))continue;const s=scene.spaces.find(s=>s.nodeIds.includes(g.nodeId));shell(c,g,s?.style||'service',Math.abs(foot-g.y)<70);}
 let wireCount=0;for(const wire of scene.circuits){const g=scene.decor.groups.find(g=>g.id===wire.assemblyId);if(!g||!visible(g)||!isDecorVisibleV102(g,flags))continue;line(c,wire.points,'#080f10',5);line(c,wire.points,'#8c7f57',1.8);wireCount++;}
 const powered=id=>{const u=scene.utilities.find(u=>u.targets.includes(id));return !u||state?.lights?.[u.id]!==false;};
 let count=0;for(const p of scene.decor.props){if(p.x+p.w<camera.x-80||p.x>camera.x+1360||!isDecorVisibleV102(p,flags))continue;
  c.save();c.globalAlpha=Math.abs(foot-p.baseline)<90?1:.76;
  drawAlien3PropV102(c,p,{time,flags,detail});
  if(['lamp','lampstand'].includes(p.kind)){
   if(!powered(p.id)){rect(c,p.x+2,p.y+p.h*.27,Math.max(1,p.w-4),p.h*.5,'#414740');}
   else {const radius=75+Math.min(85,p.w),gx=p.x+p.w/2,gy=p.y+p.h;const glow=c.createRadialGradient(gx,gy,1,gx,gy,radius);glow.addColorStop(0,'rgba(236,211,148,.18)');glow.addColorStop(1,'rgba(236,211,148,0)');c.fillStyle=glow;c.fillRect(gx-radius,gy-radius,radius*2,radius*2);}
  }
  c.restore();count++;
 }
 let panels=0;for(const u of scene.utilities){if(u.x<camera.x-24||u.x>camera.x+1304)continue;c.save();const on=state?.lights?.[u.id]!==false;rect(c,u.x,u.y,u.w,u.h,'#7b8071');rect(c,u.x+2,u.y+2,u.w-4,u.h-4,'#1a2524');rect(c,u.x+4,u.y+5,5,3,on?'#c5dba5':'#725340');line(c,[{x:u.x+6,y:u.y+13},{x:u.x+6+(on?2:-2),y:u.y+23}],'#c4b895',3);c.restore();panels++;}
 return {props:count,circuits:wireCount,panels,space:space?.id||null};
}
export function drawAlien3DoorV103(c,d){
 const {x,y,w,h}=d;const p=clamp103(d.progress??(d.open?1:0),0,1);
 c.save();rect(c,x,y,w,h,'rgba(6,14,14,.16)');rect(c,x-8,y-7,7,h+7,'#676957');rect(c,x+w+1,y-7,7,h+7,'#676957');rect(c,x-8,y-9,w+16,9,'#97917a');
 c.beginPath();c.rect(x,y,w,h);c.clip();const leafY=y-h*p;rect(c,x,leafY,w,h,'#434d47');for(let yy=leafY+7;yy<leafY+h;yy+=17){rect(c,x+2,yy,w-4,9,'#2e3b35');line(c,[{x:x+2,y:yy},{x:x+w-2,y:yy}],'#858575');}
 if(p<.85){rect(c,x+4,leafY+h-12,w-8,8,'#aaa178');for(let xx=x+6;xx<x+w-4;xx+=11)line(c,[{x:xx,y:leafY+h-11},{x:xx+6,y:leafY+h-5}],'#333c30',3);}
 c.restore();c.save();rect(c,x+w+11,y+35,9,29,'#545e52');rect(c,x+w+13,y+39,5,4,d.open?'#c1d49e':'#c48855');c.restore();
}
export function drawAlien3PlatformV103(c,p){const y=p.y,h=Math.min(22,Math.max(8,p.h||13));c.save();const grad=c.createLinearGradient(0,y,0,y+h);grad.addColorStop(0,'#888a79');grad.addColorStop(.19,'#46534b');grad.addColorStop(1,'#142320');c.fillStyle=grad;c.fillRect(p.x,y,p.w,h);line(c,[{x:p.x,y},{x:p.x+p.w,y}],'#b2ac91',1.5);for(let x=p.x+8;x<p.x+p.w-4;x+=25)line(c,[{x,y:y+4},{x:x+9,y:y+h-3}],'#728073',.7);c.restore();}
export function drawAlien3MapV103(c,scene,state,actor,doors=[]){
 const model=buildAlien3MapV103(scene,state,actor,doors),x0=78,y0=80,w=1124,h=536;const sx=v=>x0+32+v/6200*(w-64),sy=v=>y0+91+(v-150)/520*337;const nodes=new Map(model.nodes.map(n=>[n.id,n]));
 c.save();rect(c,x0,y0,w,h,'rgba(9,18,18,.98)');c.strokeStyle='#637a6d';c.strokeRect(x0+.5,y0+.5,w-1,h-1);c.fillStyle='#e2d7b7';c.font='25px sans-serif';c.fillText('Plan du complexe',x0+30,y0+45);c.font='12px sans-serif';c.fillStyle='#9aaea1';c.fillText('Passages relevés au cours de l’exploration',x0+31,y0+68);c.fillText('M / Échap  Fermer',x0+w-160,y0+46);
 for(const floor of [190,330,510,630]){line(c,[{x:x0+24,y:sy(floor)},{x:x0+w-24,y:sy(floor)}],'#2b3c36');}
 for(const e of model.edges){const a=nodes.get(e.from),b=nodes.get(e.to);c.setLineDash(['ladder','lift'].includes(e.kind)?[4,4]:[]);line(c,[{x:sx(a.x),y:sy(a.y)},{x:sx(b.x),y:sy(b.y)}],['ladder','lift'].includes(e.kind)?'#ccb989':'#668477',2);}c.setLineDash([]);
 const labels=layoutAlien3MapLabelsV103(model,scene,label=>c.measureText(label).width);
 c.font='10px sans-serif';for(const l of labels){line(c,[{x:l.anchorX,y:l.anchorY-5},{x:l.x+l.w/2,y:l.y+l.h+2}],'#4c665a',.7);rect(c,l.x-3,l.y-2,l.w+6,l.h+4,'#111f1d');c.fillStyle='#c8d0b8';c.fillText(l.text,l.x,l.y+10,l.w);}
 for(const n of model.nodes){rect(c,sx(n.x)-3,sy(n.y)-3,6,6,'#b1c1a7');}
 for(const g of model.gates)rect(c,sx(g.x)-2,sy(g.y+g.h)-6,5,12,g.state==='closed'?'#c98c66':'#d1c39b');
 const px=sx(model.player.x),py=sy(model.player.y);c.fillStyle='#f2ddad';c.beginPath();c.moveTo(px,py-7);c.lineTo(px+6,py+4);c.lineTo(px-6,py+4);c.closePath();c.fill();
 c.font='12px sans-serif';c.fillStyle='#aabdac';c.fillText('▲ Vous êtes ici       ─ Liaison relevée       · · · Passage vertical       ▮ Porte fermée',x0+30,y0+h-29);if(!model.nodes.length)c.fillText('Aucun passage relevé. Explorez le complexe pour compléter le plan.',x0+290,y0+259);c.restore();return {...model,labels};
}

export function layoutAlien3MapLabelsV103(model,scene,measure=text=>text.length*5.5){
 const x0=78,y0=80,w=1124;const sx=v=>x0+32+v/6200*(w-64),sy=v=>y0+91+(v-150)/520*337;
 const labels=[];const used=new Set();
 for(const s of model.spaces.slice().sort((a,b)=>a.x-b.x||a.floor-b.floor)){
  const known=model.nodes.filter(n=>s.id===scene.spaces.find(v=>v.nodeIds.includes(n.id))?.id);if(!known.length||used.has(s.id))continue;used.add(s.id);
  const ax=sx(known.reduce((a,n)=>a+n.x,0)/known.length),ay=sy(s.floor),text=s.label,ww=Math.min(151,Math.ceil(measure(text))+3),hh=13;
  let chosen=null;
  for(const dy of [-31,-59,16,44,-86,71]){for(const dx of [0,-35,35]){const item={text,id:s.id,x:clamp103(ax-ww/2+dx,x0+27,x0+w-27-ww),y:ay+dy,w:ww,h:hh,anchorX:ax,anchorY:ay};if(item.y<154||item.y+hh>562)continue;const overlap=labels.some(p=>item.x<p.x+p.w+9&&item.x+item.w+9>p.x&&item.y<p.y+p.h+7&&item.y+item.h+7>p.y);if(!overlap){chosen=item;break;}}if(chosen)break;}
  if(chosen)labels.push(chosen);
 }
 return labels;
}
