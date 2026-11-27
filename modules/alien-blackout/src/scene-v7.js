/* Constructed wall planes and role-readable provisional figures. No official art. */
(()=>{'use strict';const D=BO_DATA;
const rect=(c,x,y,w,h,fill,stroke)=>{c.fillStyle=fill;c.fillRect(x,y,w,h);if(stroke){c.strokeStyle=stroke;c.strokeRect(x,y,w,h);}};
const poly=(c,p,f,s)=>{c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();if(f){c.fillStyle=f;c.fill();}if(s){c.strokeStyle=s;c.stroke();}};
const line=(c,a,b,s,w=1)=>{c.beginPath();c.moveTo(...a);c.lineTo(...b);c.strokeStyle=s;c.lineWidth=w;c.stroke();c.lineWidth=1;};
const text=(c,t,x,y,size=11,col='#c2d3cd',align='left')=>{c.font=`500 ${size}px ui-monospace,monospace`;c.fillStyle=col;c.textAlign=align;c.fillText(t,x,y);c.textAlign='left';};
const colors={engineering:['#30474b','#8b9a8b'],administration:['#53645f','#bdc2a7'],transit:['#2e4c58','#a4b9b2'],laboratory:['#40564b','#a5b595'],habitation:['#5b5e51','#c0b497'],core:['#284652','#a7bcb2'],research:['#3d5053','#aebca9']};
function doorBody(c,r,t,e){const pt=BO.port(r.id,t.side),closed=e.doors[t.edge],side=t.side;
 const short='D'+t.edge.split('-d')[1],destination=BO.rooms.get(t.to).name;
 if(side==='S'){
  // An opening in the near wall. The wall is deliberately sectioned, never a stair/ramp.
  const x=pt.x;rect(c,x-65,489,130,38,'#0a171c','#72887d');rect(c,x-51,492,102,36,closed?'#627872':'#10252b');
  if(closed){for(let q=-45;q<49;q+=18)line(c,[x+q,495],[x+q,525],'#233e44',4);line(c,[x-50,501],[x+50,501],'#c4b477',3);}
  else{rect(c,x-47,493,94,34,'#051014');line(c,[x-46,520],[x+46,520],'#6d8c80',2);}
  rect(c,x+57,485,6,15,closed?'#e1a278':'#aaca9c');text(c,`${short} · ${destination.slice(0,29)}`,x,472,10,'#e1d7ad','center');
  text(c,'ISSUE AVANT · PAROI EN COUPE',x,483,8,'#9ab9b0','center');return;
 }
 const back=side==='N',w=back?86:52,h=back?112:192,x=pt.x-w/2,y=pt.y-h;
 // Door jambs joined to the parent wall, not an isolated portal frame.
 rect(c,x-12,y-12,w+24,h+16,'#516a69','#afbeb0');rect(c,x-7,y-6,w+14,h+9,'#192f35');
 rect(c,x,y,w,h,'#040f15');
 if(closed){const g=c.createLinearGradient(x,0,x+w,0);g.addColorStop(0,'#405654');g.addColorStop(.48,'#9aa79b');g.addColorStop(1,'#3b5352');rect(c,x+2,y+2,w-4,h-3,g);line(c,[pt.x,y+5],[pt.x,pt.y],'#132e30',3);for(let q=0;q<4;q++)line(c,[x+6,y+25+q*h/5],[x+w-6,y+25+q*h/5],'#344b4a',2);}
 else{poly(c,[[x+7,y+7],[x+w-7,y+7],[x+w-12,pt.y-14],[x+12,pt.y-14]],'#0d1e27');rect(c,pt.x-5,y+19,10,h-31,'#06131a');line(c,[x+6,pt.y-4],[x+w-6,pt.y-4],'#a0b99f',3);}
 rect(c,x+w+3,y+h*.53,4,16,closed?'#e2a57e':'#b3d5a2');
 text(c,short,pt.x,y-18,11,'#efddb4','center');
 if(back){text(c,destination.slice(0,29),pt.x,y-32,10,'#b5c8bb','center');}
 else {const tx=side==='W'?pt.x+5:pt.x-5;c.save();c.translate(tx,y-32);text(c,destination.slice(0,19),0,0,9,'#b5c8bb',side==='W'?'left':'right');c.restore();}
}
function background(c,r,e,drawProp,architecture){const pal=colors[e.chapter.theme]||colors.engineering,deep=r.view==='DEPTH',base=deep?340:478;
 const bg=c.createLinearGradient(0,80,0,560);bg.addColorStop(0,'#07151d');bg.addColorStop(1,'#183139');rect(c,0,0,1000,560,bg);
 // Rear wall, ribs, ceiling service band. The walking plane begins at base.
 rect(c,26,91,948,base-91,pal[0]);for(let x=32;x<978;x+=112){rect(c,x+4,115,99,base-129,'#12273188','#5b737066');rect(c,x,93,7,base-93,'#87988b');rect(c,x+1,97,2,base-101,'#b8c2a377');}
 for(let y=65;y<99;y+=10){line(c,[15,y],[985,y+5],'#526b66',5);line(c,[15,y-2],[985,y+3],'#102c32',2);}
 for(const x of [126,448,767]){rect(c,x,111,114,6,'#c0d4b3');const g=c.createRadialGradient(x+58,132,2,x+58,160,158);g.addColorStop(0,'#c8f0c222');g.addColorStop(1,'#c8f0c200');rect(c,x-100,119,313,200,g);}
 architecture(c,r,e);
 if(deep){poly(c,[[26,340],[974,340],[1000,534],[0,534]],'#32494d');for(let x=-250;x<1300;x+=100)line(c,[500+(x-500)*.57,342],[x,532],'#8aa29950');for(let y=352;y<533;y+=22)line(c,[20,y],[980,y],'#10283099');line(c,[25,342],[975,342],'#a5ad81',3);}
 else{rect(c,0,431,1000,47,'#32494d');for(let x=0;x<1000;x+=45)line(c,[x,431],[x-18,478],'#728f8377');line(c,[25,479],[975,479],'#a5ad81',3);}
 // Continuous side-wall returns support the side frames from ceiling to deck.
 poly(c,[[0,74],[106,133],[108,478],[0,533]],'#293e42','#7c9187');poly(c,[[1000,74],[894,133],[892,478],[1000,533]],'#293e42','#7c9187');
 for(const x of [8,985])rect(c,x,102,7,402,'#72877f');
 // The near wall is cut down so actors remain visible; an S opening is physically on this edge.
 rect(c,0,497,1000,35,'#1a3038','#83958b');if(r.ports.S)rect(c,255,488,130,44,'#06131a');
 for(let x=20;x<990;x+=88)if(!r.ports.S||x<255||x>390){line(c,[x,506],[x+44,526],'#858569',4);}
 // Recess facades ground the original fixed interaction points; these are not central props.
 for(const [x,w,caption]of [[137,140,'CASIERS'],[784,114,'F.E.M.S']]){
  rect(c,x-3,deep?329:314,w+6,151, '#233c40','#536f6b');rect(c,x-3,deep?329:314,w+6,8,'#71847a');line(c,[x-2,481],[x+w+2,481],'#a1ac8f',3);text(c,caption,x+w/2,deep?322:307,9,'#a9c0b1','center');
 }
 for(const p of r.props.filter(p=>p.layer==='back'||p.layer==='wall'))drawProp(c,p);
 for(const t of r.construction.thresholds)doorBody(c,r,t,e);
 // Sector transfer has a grounded call-station, rather than a false disconnected door.
 if(e.chapter.exit===r.id){rect(c,365,122,245,31,'#142c34','#607a72');text(c,e.chapterIndex<6?'TRANSFERT → '+D.chapters[e.chapterIndex+1].name.toUpperCase().slice(0,25):'RETOUR → USCSS HALDIN',487,142,10,'#e4d8ad','center');}
}
function human(c,a,scale,selected){const p=D.fidelity.personnel.find(x=>x.id===a.id)||D.fidelity.personnel[0];c.save();c.translate(a.x,a.y);c.scale(scale,scale);c.lineCap='round';
 if(a.hidden){rect(c,-7,-7,14,3,a.color||'#c2cbae');c.restore();return;}
 if(a.incapacitated&&a.alive){if(a.carried)c.translate(0,-35);line(c,[-18,-9],[15,-9],p.jacket,9);line(c,[14,-8],[30,-3],p.pants,6);c.fillStyle=p.skin;c.beginPath();c.ellipse(-25,-11,6,7,-.7,0,Math.PI*2);c.fill();text(c,a.carried?'TRANSPORT':'AU SOL',-30,-27,8,'#e4c794');c.restore();return;}
 c.fillStyle='#020a0daa';c.beginPath();c.ellipse(0,0,17,4,0,0,Math.PI*2);c.fill();if(!a.alive){c.rotate(-Math.PI/2);c.translate(15,-6);c.globalAlpha=.5;}
 const moving=!!a.goal||a.action==='manual'||a.action==='following'||a.action==='evacuating',step=moving?Math.sin(a.walk||0)*4:0,w=p.build;
 line(c,[-6*w,-27],[-8-step,-3],p.pants,8);line(c,[6*w,-27],[8+step,-3],p.pants,8);line(c,[-11-step,-2],[-3-step,-2],'#111c22',4);line(c,[4+step,-2],[15+step,-2],'#111c22',4);
 poly(c,[[-13*w,-54],[12*w,-54],[13*w,-28],[-12*w,-28]],p.jacket,'#24383b');rect(c,-11,-30,22,3,'#283638');rect(c,-3,-30,6,3,'#adb4a1');
 line(c,[-12*w,-50],[-15-step*.5,-34],p.jacket,7);line(c,[12*w,-50],[16+step*.5,-35],p.jacket,7);
 line(c,[-15-step*.5,-34],[-10-step*.5,-28],p.skin,4);line(c,[16+step*.5,-35],[12+step*.5,-29],p.skin,4);
 if(p.collar==='civilian'){poly(c,[[-7,-55],[0,-48],[-3,-37],[-11,-52]],'#d1d1bf');poly(c,[[7,-55],[0,-48],[4,-37],[11,-52]],'#8c9e98');line(c,[0,-45],[0,-32],'#687972',1);for(const y of [-44,-39,-34])rect(c,1,y,1.5,1.5,'#d4d1b6');}
 else {line(c,[0,-53],[0,-30],'#2a4141',1);rect(c,-10,-46,7,7,'#758c82','#293e42');rect(c,4,-46,7,7,'#758c82','#293e42');rect(c,5,-43,5,2,'#c5cba9');}
 if(a.id==='studwick'){rect(c,10,-34,6,10,'#2c4141');line(c,[13,-37],[13,-26],'#a3afa1',2);} // role cue, not a claimed official tool
 rect(c,-4,-60,8,7,p.skin);c.fillStyle=p.skin;c.beginPath();c.ellipse(0,-65,7,10,0,0,Math.PI*2);c.fill();
 c.fillStyle=p.hair;c.beginPath();c.ellipse(-1,-71,7.5,5,-.1,Math.PI,Math.PI*2);c.fill();rect(c,-7,-70,2.4,8,p.hair);
 if(p.cut==='bob'){poly(c,[[-8,-69],[-9,-55],[-4,-56],[-6,-70]],p.hair);poly(c,[[5,-70],[10,-56],[5,-55],[5,-62]],p.hair);}else if(p.cut==='tied'){c.beginPath();c.ellipse(-8,-64,3.5,5,-.1,0,Math.PI*2);c.fill();}
 line(c,[-3,-66],[-1,-66],'#344140',1);line(c,[3,-66],[5,-66],'#344140',1);line(c,[0,-59],[3,-59],'#7f7063',1);
 if(a.work)rect(c,10,-33,13,8,'#829b82','#bed2b1');
 if(selected&&a.alive){line(c,[-18,5],[18,5],'#f3d19b',2);line(c,[-18,1],[-18,5],'#f3d19b',2);line(c,[18,1],[18,5],'#f3d19b',2);}
 c.restore();if(a.alive){text(c,a.name||p.fullName,a.x,a.y+17,10,selected?'#ecd4a9':'#bfd2c8','center');if(a.spotted>0)text(c,'REPÉRÉ',a.x,a.y-scale*84,10,'#eeae8a','center');}
}
// Use the exact state geometry, not a separate hand-drawn map.
function localPlan(canvas,room,e){const r=BO.rooms.get(room),c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);c.save();c.scale(canvas.width/1000,canvas.height/360);rect(c,0,0,1000,360,'#0a1c24');
 const fy=y=>60+(y-340)*1.35;rect(c,50,60,900,219,r.view==='SIDE'?'#162c34':'#263e43','#779889');if(r.view==='SIDE'){rect(c,54,fy(478)-10,892,20,'#38554b');text(c,'PAROI EN ÉLÉVATION / DÉPLACEMENT SUR LA BANDE INFÉRIEURE',500,145,12,'#90aaa2','center');}
 for(let x=50;x<951;x+=50)line(c,[x,60],[x,279],'#51797633');for(let y=60;y<280;y+=27)line(c,[50,y],[950,y],'#51797633');
 // Draw actual boundary walls with voids at the four physical endpoints.
 c.strokeStyle='#99ad9d';c.lineWidth=8;c.strokeRect(50,60,900,219);c.lineWidth=1;
 for(const t of r.construction.thresholds){const [x,y]=t.opening,py=fy(y),horizontal=['N','S'].includes(t.side);rect(c,x-(horizontal?31:6),py-(horizontal?6:17),horizontal?62:12,horizontal?12:34,e.doors[t.edge]?'#e5ac7c':'#081923');line(c,horizontal?[x-31,py]:[x,py-17],horizontal?[x+31,py]:[x,py+17],e.doors[t.edge]?'#dc9a70':'#aad2ac',3);text(c,'D'+t.edge.split('-d')[1],x,py+(t.side==='N'?-15:25),12,'#e4d3a8','center');}
 for(const o of r.obstacles)rect(c,o.x,fy(o.y),o.w,o.h*1.35,'#737f68','#bac29f');
 r.hide.forEach(([x,y],i)=>{rect(c,x-10,fy(y)-7,20,14,'#234b52','#8bb4ad');text(c,String(i+1),x,fy(y)+4,11,'#d0d4ab','center');});
 const [tx,ty]=r.terminal;rect(c,tx-13,fy(ty)-9,26,18,'#7f995b');text(c,'POSTE',tx,fy(ty)-17,10,'#e1dfb9','center');
 const crew=e.crew.filter(a=>a.room===r.id&&a.alive);crew.forEach(a=>{c.beginPath();c.arc(a.x,fy(a.y),5,0,7);c.fillStyle=a.color;c.fill();});
 if(e.chapter.rooms.includes(r.id))for(const contact of e.contacts())if(contact.room===r.id){text(c,contact.kind==='camera'?'CONTACT CAMÉRA':'ÉCHO DE PIÈCE',510,315,11,'#dfb08a','center');}
 text(c,r.view==='SIDE'?'BANDE LATÉRALE y=478':'SOL PROFOND y=340..502',55,27,12,'#b9cbbd');text(c,'UNITÉS DU MOTEUR · PAS UNE ÉCHELLE EN MÈTRES',945,343,10,'#8aa9a2','right');c.restore();}
function sectorPlan(canvas,index,e){const c=canvas.getContext('2d'),ch=D.chapters[index],W=canvas.width,H=canvas.height;c.clearRect(0,0,W,H);c.save();c.scale(W/1000,H/670);rect(c,0,0,1000,670,'#0a1c24');
 const sx=218,sy=172,ox=70,oy=61,bw=160,bh=108;
 const boxes=new Map(ch.rooms.map(id=>{const r=BO.rooms.get(id);return[id,{x:ox+r.map[0]*sx,y:oy+r.map[1]*sy,w:bw,h:bh}];}));
 const point=(id,side)=>{const b=boxes.get(id);return side==='W'?[b.x,b.y+bh/2]:side==='E'?[b.x+bw,b.y+bh/2]:side==='N'?[b.x+bw/2,b.y]:[b.x+bw/2,b.y+bh];};
 const links=[];
 for(const rr of BO_ARCH.routes(index)){const ed=BO.edges.get(rr.edge),pts=rr.points;for(let i=1;i<pts.length;i++){line(c,pts[i-1],pts[i],'#597873',12);line(c,pts[i-1],pts[i],'#122c35',8);}links.push({edge:ed,pts});}
 for(const [id,b]of boxes){const r=BO.rooms.get(id);rect(c,b.x,b.y,b.w,b.h,id===e.camera?'#324f48':'#203a43',id===e.camera?'#d9bc86':'#7e9a8b');rect(c,b.x+5,b.y+5,b.w-10,b.h-10,'#17303b','#3f625d');text(c,String(r.index+1).padStart(2,'0')+' / '+r.view,b.x+12,b.y+20,11,'#afc4b5');
  const words=r.name.split(' ');let row='',lines=[];for(const w of words){if((row+' '+w).length>20){lines.push(row);row=w;}else row+=(row?' ':'')+w;}if(row)lines.push(row);lines.slice(0,3).forEach((s,j)=>text(c,s,b.x+12,b.y+41+15*j,11,'#dae0ca'));
  e.crew.forEach((a,i)=>{if(a.room===id&&a.alive){c.beginPath();c.arc(b.x+15+i*12,b.y+bh-13,4,0,7);c.fillStyle=a.color;c.fill();}});
  if(r.id===ch.entry)text(c,'ENTRÉE',b.x+b.w-10,b.y+bh-12,9,'#99bbba','right');if(r.id===ch.exit)text(c,'TRANSFERT',b.x+b.w-10,b.y+bh-12,9,'#ddbe8b','right');
  for(const [side,p]of Object.entries(r.ports)){const xy=point(id,side);const closed=e.chapterIndex===index?e.doors[p.edge]:false;rect(c,xy[0]-6,xy[1]-6,12,12,closed?'#d5a176':'#b2cda6');}
 }
 for(const {edge:ed,pts}of links){const p=pts.length>2?pts[1]:[(pts[0][0]+pts[1][0])/2,(pts[0][1]+pts[1][1])/2];rect(c,p[0]-13,p[1]-8,26,16,'#0c242d');text(c,'D'+ed.id.split('-d')[1],p[0],p[1]+4,10,'#e2cca0','center');}
 text(c,ch.name.toUpperCase(),45,28,17,'#d2dfcd');text(c,'CONNEXIONS SCHÉMATIQUES · VOLUMES ORIGINAUX TANTALUS · ÉTAT DIRECT UNIQUEMENT DU SECTEUR ACTIF',45,638,10,'#92b1a6');c.restore();
 return{boxes,hit(x,y){x=x*1000/W;y=y*670/H;return [...boxes].find(([id,b])=>x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h)?.[0]||null;},links};}
 globalThis.BO_SCENE7={background,human,localPlan,sectorPlan};
})();
