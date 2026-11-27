/* Room-scale art and original prop drawings. All geometry is runtime canvas, not a background image. */
(function(root){'use strict';const P=root.ROP_Renderer.prototype,S=root.ROP_COLONY,C=root.ROP_CORE;
const sets={medical:['#243838','#658581','#afc7b5'],laboratory:['#182f38','#4c777e','#98bbb2'],domestic:['#353b37','#777e65','#c4bfa0'],residential:['#293839','#5f7772','#b4b79b'],canteen:['#303d36','#7b8670','#ccbd93'],industrial:['#1d3033','#537378','#b7ac75'],hangar:['#172c36','#466c73','#a6b0a0'],hive:['#152925','#455848','#89907b'],archive:['#142d30','#3a6a69','#a2b7a0']};
P.architecture=function(r,s){
 const W=this.w,H=this.h,k=this.scale,g=this.ctx,a=r.architecture,style=a.style,live=S.isPowered(s,r),t=this.reduced?0:this.time;
 if(r.kind==='exterior'){this.exteriorDetails(r,s);return;}if(['vent','refuge','derelict','hive'].includes(style)){if(style==='hive')this.hiveArchitecture(r,s);return;}
 const palette=sets[style]||sets[['power','maintenance','shaft'].includes(style)?'industrial':'residential'];
 const fy=H*.681,top=H*a.ceilingRatio;const wall=g.createLinearGradient(0,top,0,fy);wall.addColorStop(0,palette[0]);wall.addColorStop(.5,palette[1]);wall.addColorStop(1,palette[0]);g.fillStyle=wall;g.fillRect(0,top,W,fy-top);
 // Bay modules share manufactured dimensions but function-specific profiles and material treatment.
 const span=r.width/a.wallModules*k,offset=this.cam*k%span;
 for(let x=-span-offset,i=0;x<W+span;x+=span,i++){
  this.path([[x+13,top+18*k],[x+span-20,top+18*k],[x+span-9,fy-26*k],[x+7,fy-26*k]],'#0b20272c',palette[1],1);
  this.line(x+14,fy-40*k,x+span-17,fy-40*k,'#d3ddd229',1);
  // Riveted support joins extend continuously to the real floor.
  this.rect(x,top,10*k,fy-top,'#152a2c',palette[1]);for(let y=top+30*k;y<fy;y+=65*k)this.circle(x+5*k,y,1.8*k,'#a6bbb477');
  if(['medical','laboratory'].includes(style)){
   const ww=span*.74,wy=top+(fy-top)*.20,wh=(fy-top)*.59;this.rect(x+span*.13,wy,ww,wh,'#061e29',palette[2]);
   // Furnished observation space, behind mullioned glass. It is scenery, not a traversable room.
   for(let n=0;n<3;n++){const xx=x+span*.19+n*span*.22;this.rect(xx,wy+wh*.6,span*.15,10*k,'#849d8d99');this.rect(xx+7*k,wy+wh*.6+10*k,4*k,wh*.27,'#6a8a8499');this.rect(xx,wy+wh*.14,span*.12,wh*.28,'#22575b','#5b908255');}
   const glass=g.createLinearGradient(x,wy,x+ww,wy+wh);glass.addColorStop(0,'#86c1ad29');glass.addColorStop(.52,'#315d5919');glass.addColorStop(1,'#060d2444');g.fillStyle=glass;g.fillRect(x+span*.13,wy,ww,wh);
   for(let n=1;n<3;n++)this.rect(x+span*.13+ww*n/3,wy,5*k,wh,'#afc0ae88');this.line(x+span*.16,wy+wh*.1,x+span*.41,wy+wh*.8,'#b3d7ca24',2*k);
   this.rect(x+span*.14,wy-18*k,span*.40,13*k,live?'#aedac499':'#c7866188');
   this.text(style==='medical'?'OBSERVATION / '+String(i+1).padStart(2,'0'):'CONFINEMENT / '+String(i+1).padStart(2,'0'),x+span*.15,wy-24*k,9*k,'#c4d7c8');
  }else if(['domestic','residential','leisure','canteen'].includes(style)){
   this.rect(x+15*k,top+12*k,span-25*k,(fy-top)*.36,'#465c5033');
   this.rect(x+17*k,fy-72*k,span-29*k,39*k,'#1b302e','#95a99155');
   this.rect(x+22*k,top+33*k,span*.26,(fy-top)*.31,'#142f32','#a8b4a17a');
   this.rect(x+span*.39,top+38*k,span*.44,(fy-top)*.30,style==='domestic'?'#8a8c6c33':'#2c59624a','#a3b8995c');
   this.line(x+span*.6,top+40*k,x+span*.6,top+(fy-top)*.4,'#c4d0b36a',2*k);
   if(style==='canteen'){this.rect(x+span*.35,fy-122*k,span*.56,14*k,'#9aa78b');this.rect(x+span*.36,fy-177*k,span*.52,45*k,'#071b22','#8ba38f');for(let n=0;n<3;n++)this.ellipse(x+span*(.45+n*.15),fy-124*k,13*k,3*k,'#c3b78d');}
   this.rect(x+span*.4,top+10*k,span*.27,6*k,live?'#e6dfb899':'#cd806256');
  }else if(['hangar','warehouse','industrial','maintenance','shaft'].includes(style)){
   const bh=fy-top;this.path([[x+8*k,top+14*k],[x+span-8*k,top+14*k],[x+span-8*k,top+37*k],[x+8*k,top+37*k]],'#183038','#70898c');
   this.line(x+span*.06,top+bh*.15,x+span*.94,fy-25*k,'#0b1f25',12*k);this.line(x+span*.06,top+bh*.15,x+span*.94,fy-25*k,'#83958b3a',2*k);
   if(style==='shaft'){for(let n=0;n<4;n++)this.line(x+span*.4+n*8*k,top,x+span*.4+n*8*k,fy,'#97a69288',3*k);this.rect(x+span*.42,top+bh*.5,span*.28,80*k,'#243942','#7e8e85');}
   else if(style==='industrial'||style==='maintenance'){for(let n=0;n<3;n++){const yy=top+bh*(.32+n*.17);this.line(x+5*k,yy,x+span-6*k,yy,'#102128',16*k);this.line(x+5*k,yy-3*k,x+span-6*k,yy-3*k,'#6d8c87',5*k);this.rect(x+span*.22,yy-13*k,12*k,26*k,'#445f5f','#c3b87a77');}}
   else{this.rect(x+span*.14,top+bh*.29,span*.7,bh*.48,'#071e29','#405c64');for(let n=0;n<5;n++)this.line(x+span*.16,top+bh*.33+n*bh*.084,x+span*.82,top+bh*.33+n*bh*.084,'#516b6e55',2*k);}
   const light=live?'#dce8ba':'#d6a06a';this.rect(x+span*.36,top+45*k,span*.24,7*k,light);this.path([[x+span*.36,top+52*k],[x+span*.15,fy],[x+span*.85,fy],[x+span*.6,top+52*k]],live?'#c6dfb907':'#d0835508');
  }else if(['command','archive','barracks','decontamination','concourse','shuttle','utility'].includes(style)){
   this.rect(x+span*.12,top+(fy-top)*.18,span*.75,(fy-top)*.42,'#092932','#8aa99566');
   const lineCount=style==='archive'?14:6;for(let n=0;n<lineCount;n++){const yy=top+(fy-top)*.22+n*(fy-top)*.34/lineCount;this.rect(x+span*.18,yy,span*(.32+(n%3)*.12),2*k,live?'#87bb9d66':'#48696055');this.circle(x+span*.79,yy+1*k,2*k,live?'#a6d0a8':'#6a6150');}
   if(style==='concourse'){this.line(x+span*.48,top+40*k,x+span*.48,fy-97*k,'#b1c5b65c',4*k);this.path([[x+span*.19,top+69*k],[x+span*.35,top+69*k],[x+span*.75,fy-142*k],[x+span*.59,fy-142*k]],'#a3c7b113');}
   this.rect(x+span*.12,fy-68*k,span*.75,14*k,'#879b8455');
  }
 }
 // A continuous ceiling arch, service conduits and cornices instead of an empty top band.
 this.rect(0,top-12*k,W,12*k,'#091d24','#597876');this.path([[0,top-12*k],[W,top-12*k],[W,top+17*k],[0,top+17*k]],'#1c3034','#677f7c');
 const ceiling=g.createLinearGradient(0,0,0,top);ceiling.addColorStop(0,'#04151c');ceiling.addColorStop(1,'#20373b');g.fillStyle=ceiling;g.fillRect(0,0,W,Math.max(1,top-12*k));
 for(let n=0;n<4;n++){const y=10*k+n*14*k;this.line(0,y,W,y,'#526b645a',3*k);}
 this.rect(0,fy-18*k,W,18*k,'#152b2b','#5c777365');
 if(!live){g.fillStyle='#030c193f';g.fillRect(0,0,W,fy);}
 const signX=this.project(r.width*.52,.25).x;this.rect(signX-145*k,top+29*k,290*k,27*k,'#14282fc9','#869c7655');this.text(r.name.toUpperCase(),signX,top+47*k,11*k,'#c4d1b4','center');
};
P.exteriorDetails=function(r,s){const g=this.ctx,W=this.w,H=this.h,k=this.scale;
 if(r.id==='aerial'){
  // Rooftop parapet anchored to the rear edge, not overhead pipes suspended in the sky.
  const y=H*.678;this.rect(0,y-14*k,W,14*k,'#253d43','#7d9183');
  for(let x=-((this.cam*k)%(175*k));x<W+175*k;x+=175*k){this.line(x,y,x,y-83*k,'#4c6968',6*k);this.line(x,y-81*k,x+175*k,y-81*k,'#869c8b',4*k);this.line(x,y-44*k,x+175*k,y-44*k,'#435f62',2*k);}
  for(let n=0;n<3;n++){const y=H*(.42+n*.075),fog=g.createLinearGradient(0,y,0,y+H*.1);fog.addColorStop(0,'transparent');fog.addColorStop(.5,'#a2c4b309');fog.addColorStop(1,'transparent');g.fillStyle=fog;g.fillRect(0,y,W,H*.1);}return;
 }
 // Forecourt modules beyond the actual floor; distant rock slopes do not create invisible walls.
 const step=450*k,offset=(this.cam*.46*k)%step;
 for(let x=-step-offset,i=0;x<W+step;x+=step,i++){
  if(['pad','approach'].includes(r.id)){this.path([[x,H*.66],[x,H*.4],[x+step*.16,H*.32],[x+step*.84,H*.32],[x+step,H*.4],[x+step,H*.66]],'#172b31','#4b6469');for(let n=0;n<5;n++)this.rect(x+step*(.14+n*.15),H*.41,step*.07,H*.22,'#0b1d26','#596f7555');this.rect(x+step*.16,H*.345,step*.68,3*k,'#b8c3a444');}
  else this.path([[x,H*.68],[x+step*.08,H*.56],[x+step*.25,H*.50],[x+step*.36,H*.58],[x+step*.58,H*.49],[x+step,H*.66]],'#21343a','#55717555');
 }
 for(let n=0;n<3;n++){const y=H*(.44+n*.075),fog=g.createLinearGradient(0,y,0,y+H*.08);fog.addColorStop(0,'transparent');fog.addColorStop(.5,'#a2c4b309');fog.addColorStop(1,'transparent');g.fillStyle=fog;g.fillRect(0,y,W,H*.08);}
};
P.hiveArchitecture=function(r,s){const g=this.ctx,k=this.scale,H=this.h;
 for(let x=-((this.cam*k)%(430*k));x<this.w+430*k;x+=430*k){this.rect(x,H*.09,12*k,H*.58,'#132c2a','#587c6666');for(let n=0;n<7;n++){g.beginPath();g.moveTo(x-70*k,H*.68);g.bezierCurveTo(x+(n-3)*15*k,H*.35,x+70*k,H*.10,x+130*k,H*.03);g.strokeStyle=n%2?'#687d542a':'#50664d66';g.lineWidth=(3+n%3)*k;g.stroke();}this.line(x+4*k,H*.24,x+240*k,H*.24,'#627d6044',3*k);}
};
const extra=new Set(['photo','mug','hanging-coat','bed-lamp','vent-cover','door-plaque','fire-cabinet','pipe-elbow','ceiling-light','noticeboard','privacy-screen','oxygen','medical-cross','wall-clock','gurney','glass-cabinet','lab-bench','warning-board','chair','radio-mast','kitchen-hood','tray','gauge','pump-motor','cable-tray','chain-hoist','hose-reel','tool-board','hand-truck','server','tape-reel','rifle-case','survey-stake','floodlight','cable-spool','barrier','rock-fragment','duct-junction','bolt-panel','trace-mark','hide-locker']);
P.extraProp=function(p,r,s){if(!extra.has(p.kind))return false;const v=this.project(p.x,p.z),g=this.ctx,base=this.scale*(.8+p.z*.28);g.save();g.translate(v.x,v.y);const widths={'lab-bench':155,'pump-motor':132};g.scale(p.footprint?p.footprint.w*this.scale/(widths[p.kind]||100):base,base);
 const rect=(...x)=>this.rect(...x),line=(...x)=>this.line(...x),ellipse=(...x)=>this.ellipse(...x),circle=(...x)=>this.circle(...x),metal='#7f9890',dark='#193139',edge='#adc0a0';
 if(p.collidable&&Math.abs(p.x-s.player.x)<160&&s.player.z<p.z)g.globalAlpha=.35;
 switch(p.kind){
 case 'hide-locker':
   rect(-48,-149,96,149,'#1c3339','#8ca597');this.path([[-49,-149],[-40,-158],[56,-158],[48,-149]],'#54726b','#a0ac8c');rect(-37,-137,72,130,'#051922','#4b6c67');for(let i=0;i<6;i++)rect(-30,-125+i*8,60,3,'#4f79716a');rect(18,-72,6,21,'#a6b395');this.text('SERVICE',0,-17,8,'#96aa8e','center');if(s.systems.hiding===p.id){rect(-35,-134,68,117,'#07111cbc');this.circle(23,-47,2,'#c7d8ac');}break;
 case 'photo':case 'door-plaque':case 'noticeboard':case 'warning-board':case 'bolt-panel':case 'trace-mark':
   rect(-36,-148,72,49,'#314c4a',metal);rect(-30,-142,60,37,p.kind==='warning-board'?'#b6a777':'#919e8066');
   if(p.kind==='photo'){circle(-10,-126,7,'#ceb995');circle(11,-128,6,'#e0c9a1');rect(-18,-121,17,10,'#4d6c71');rect(4,-121,16,10,'#7a6950');}
   else if(p.kind==='warning-board'){this.path([[-16,-110],[0,-136],[16,-110]],'#28383b');this.text('!',0,-115,17,'#daca8c','center');}
   else if(p.kind==='trace-mark'){for(let i=0;i<4;i++)line(-20+i*10,-134,-15+i*10,-111,'#d5c78f',2);}
   else for(let i=0;i<4;i++)rect(-23,-136+i*7,43-i%2*12,2,'#c4d3b0a6');break;
 case 'mug':case 'tray':
   if(p.kind==='tray'){this.path([[-35,-5],[-29,-13],[32,-13],[38,-5]],'#a5af99','#cad0b1');rect(-17,-16,16,5,'#85785a');}else{rect(-9,-20,18,20,'#bfbea0',edge);ellipse(0,-20,9,3,'#475d51');g.strokeStyle=metal;g.lineWidth=3;g.strokeRect(9,-16,8,10);}break;
 case 'hanging-coat':
   line(-31,-145,32,-145,metal,4);line(0,-145,0,-130,metal,2);this.path([[-9,-134],[-26,-120],[-36,-72],[-21,-67],[-15,-88],[-18,-33],[19,-33],[14,-91],[22,-67],[36,-73],[27,-118],[10,-134]],'#546b5b','#98a08a');line(1,-127,1,-38,'#bcc0a16b',2);break;
 case 'bed-lamp':case 'floodlight':case 'ceiling-light':case 'radio-mast':case 'survey-stake':
   const tall=p.kind==='radio-mast'?202:p.kind==='floodlight'?156:p.kind==='survey-stake'?60:99;line(0,0,0,-tall,metal,5);rect(-22,-tall-13,44,16,dark,edge);rect(-17,-tall-9,34,8,S.isPowered(s,r)?'#e4deb2':'#9d7454');for(const d of [-1,1])line(0,-14,d*22,0,metal,4);if(p.kind==='radio-mast'){line(-40,-170,40,-170,metal,3);line(-27,-193,27,-193,metal,2);}if(S.isPowered(s,r))this.glow(0,-tall,64,'#dbd3a411');break;
 case 'vent-cover':case 'duct-junction':case 'cable-tray':case 'pipe-elbow':case 'kitchen-hood':
   if(p.kind==='pipe-elbow'){g.beginPath();g.moveTo(-60,-136);g.lineTo(17,-136);g.quadraticCurveTo(38,-136,38,-114);g.lineTo(38,-24);g.lineWidth=18;g.strokeStyle=dark;g.stroke();g.lineWidth=9;g.strokeStyle=metal;g.stroke();for(const yy of [-110,-52])rect(24,yy,28,8,'#a1ac8d');}
   else {rect(-63,-171,126,48,dark,metal);for(let i=0;i<11;i++)rect(-57+i*11,-166,4,37,'#718f804d');rect(-66,-175,132,5,'#acb29999');}break;
 case 'fire-cabinet':case 'oxygen':case 'hose-reel':case 'gauge':case 'medical-cross':case 'wall-clock':
   if(p.kind==='oxygen'){rect(-13,-77,26,70,'#7e9690',edge);ellipse(0,-77,13,7,'#a0b6a1');rect(-4,-99,8,14,metal);circle(8,-88,9,dark);circle(8,-88,6,'#c4c1a0');line(8,-88,10,-92,'#23393e',1);rect(-18,-5,36,6,dark);}
   else if(p.kind==='fire-cabinet'){rect(-31,-128,62,102,'#64483e','#b2a184');rect(-25,-120,50,85,'#182d32');rect(-12,-94,25,50,'#b48d68');line(0,-103,17,-105,metal,3);this.text('FIRE',0,-112,8,'#c0cbaa','center');}
   else if(p.kind==='medical-cross'){rect(-25,-142,50,52,'#c0cab0','#c6d5c2');rect(-5,-133,10,33,'#4c8a7d');rect(-16,-122,32,10,'#4c8a7d');}
   else if(p.kind==='hose-reel'){circle(0,-70,37,metal);for(let i=0;i<5;i++){g.beginPath();g.arc(0,-70,12+i*5,0,Math.PI*2);g.strokeStyle='#273d36';g.lineWidth=3;g.stroke();}line(32,-70,32,-4,'#758460',4);}
   else{circle(0,-134,25,metal);circle(0,-134,21,'#c1c6aa');for(let i=0;i<12;i++){const a=i*Math.PI/6;line(Math.cos(a)*17,-134+Math.sin(a)*17,Math.cos(a)*20,-134+Math.sin(a)*20,'#233e36',1);}line(0,-134,12,-142,'#293b36',2);line(0,-134,-3,-122,'#293b36',2);}break;
 case 'privacy-screen':case 'glass-cabinet':case 'gurney':case 'lab-bench':case 'chair':case 'hand-truck':
   if(p.kind==='privacy-screen'||p.kind==='glass-cabinet'){rect(-43,-149,86,123,p.kind==='glass-cabinet'?'#638c8744':'#889e847a',metal);for(let i=0;i<6;i++)line(-32+i*13,-145,-32+i*13,-28,'#cfdfb12a',2);for(const x of [-42,42]){line(x,-154,x,-4,metal,4);line(x-15,-3,x+15,-3,metal,3);circle(x-12,0,3,dark);circle(x+12,0,3,dark);}}
   else if(p.kind==='chair'){rect(-24,-43,48,9,'#85987f',edge);rect(-23,-86,45,34,'#2d5250',metal);for(const x of [-19,19])line(x,-42,x+(x<0?-5:5),0,metal,4);line(-21,-37,-21,-77,metal,3);}
   else if(p.kind==='hand-truck'){line(-25,0,-25,-100,metal,5);line(25,0,25,-100,metal,5);line(-25,-100,25,-100,metal,5);rect(-28,-5,60,8,'#8a9c7a');for(const x of [-26,27])circle(x,0,11,dark);}
   else{rect(-77,-68,154,12,'#9ea991',edge);for(const x of [-65,65]){line(x,-56,x,-3,metal,5);if(p.kind==='gurney')circle(x,-1,6,dark);}rect(-61,-82,120,13,'#647e69');if(p.kind==='lab-bench'){rect(-48,-114,25,32,'#83b09c88',edge);rect(16,-106,20,24,'#a9c3a870',edge);}}break;
 case 'pump-motor':case 'server':case 'cable-spool':case 'chain-hoist':case 'tape-reel':case 'rifle-case':case 'tool-board':case 'barrier':case 'rock-fragment':
   if(p.kind==='pump-motor'){rect(-64,-83,128,71,dark,metal);for(let i=0;i<14;i++)rect(-58+i*8,-78,3,59,'#6f897a');ellipse(62,-46,14,35,'#92a38a');circle(69,-46,10,dark);rect(-70,-12,144,12,metal);}
   else if(p.kind==='server'){rect(-47,-189,94,189,dark,metal);for(let i=0;i<10;i++){rect(-40,-180+i*17,80,13,'#244747','#739278');circle(25,-174+i*17,2,S.isPowered(s,r)?'#d4d69c':'#726251');}}
   else if(p.kind==='cable-spool'||p.kind==='tape-reel'){const y=p.kind==='tape-reel'?-113:-38;circle(-22,y,29,metal);circle(22,y,29,metal);for(const x of [-22,22]){circle(x,y,22,dark);for(let n=0;n<3;n++){const a=n*Math.PI*2/3;circle(x+Math.cos(a)*13,y+Math.sin(a)*13,5,'#96a28c');}}}
   else if(p.kind==='chain-hoist'){for(let i=0;i<22;i++){g.strokeStyle=i%2?metal:dark;g.lineWidth=2;g.strokeRect(-3,-220+i*7,6,10);}g.beginPath();g.arc(9,-52,11,-Math.PI,Math.PI*.1);g.strokeStyle=metal;g.lineWidth=5;g.stroke();rect(-25,-225,50,22,dark,metal);}
   else if(p.kind==='rock-fragment')this.path([[-25,0],[-14,-27],[5,-32],[35,0]],'#445b52','#7b8775');
   else if(p.kind==='barrier'){for(const x of [-50,50])line(x,0,x,-68,metal,5);rect(-59,-67,118,17,'#b6b089');for(let i=0;i<6;i++)this.path([[-52+i*20,-66],[-40+i*20,-66],[-50+i*20,-51],[-62+i*20,-51]],'#334c43');}
   else{rect(-53,-139,106,61,dark,metal);for(let i=0;i<6;i++){line(-40+i*16,-129,-36+i*16,-90,'#a4b19c',4);circle(-39+i*16,-122,4,dark);}}break;
 }
 g.restore();return true;
};
P.colonyOverlays=function(sim){const s=sim.s,r=sim.room,g=this.ctx,k=this.scale,W=this.w,H=this.h,a=s.systems;
 for(const m of a.markers.filter(v=>v.room===r.id)){const p=this.project(m.x,m.z);this.path([[p.x-12*k,p.y],[p.x,p.y-8*k],[p.x+12*k,p.y],[p.x,p.y+5*k]],'#ccd5a96b','#e9e6bc');}
 for(const h of S.activeHazards(s)){const p=this.project(h.x,this.classic?.7:h.z);this.ellipse(p.x,p.y,60*k,13*k,h.active?'#c8d7d030':'#d7b86d19');this.line(p.x-50*k,p.y,p.x+50*k,p.y,'#b4a77b66',2*k);if(h.active){for(let i=0;i<8;i++){const f=(s.elapsed*1.5+i/8)%1;this.ellipse(p.x+Math.sin(i*2.8+f*2)*24*k,p.y-f*155*k,(12+f*29)*k,(15+f*33)*k,'#c4e0dc16');}}this.text(h.active?'PRESSION':'PURGE',p.x,p.y-13*k,8*k,'#c8c8a5','center');}
 for(const q of r.phaseDressing.filter(p=>s.phase>=p.fromPhase)){const p=this.project(q.x,q.z);if(q.kind==='paper-trail'){for(let n=0;n<5;n++)this.path([[p.x+n*13*k,p.y+n%2*6*k],[p.x+(n*13+10)*k,p.y-5*k],[p.x+(n*13+18)*k,p.y],[p.x+(n*13+4)*k,p.y+5*k]],'#c3c8a633');}
  else if(q.kind==='emergency-arrow'){this.path([[p.x-32*k,p.y],[p.x+20*k,p.y],[p.x+11*k,p.y-7*k],[p.x+37*k,p.y+3*k],[p.x+10*k,p.y+10*k],[p.x+20*k,p.y+4*k],[p.x-32*k,p.y+4*k]],'#b8c19e38');}
  else if(q.kind==='broken-light'){this.line(p.x,p.y-180*k,p.x+14*k,p.y-108*k,'#314b50',2*k);g.save();g.translate(p.x+14*k,p.y-108*k);g.rotate(.28);this.rect(-30*k,-5*k,60*k,10*k,'#223c43','#728d82');this.rect(-24*k,-2*k,21*k,3*k,'#a8ac86');g.restore();}  else if(q.kind==='scorch')this.ellipse(p.x,p.y,65*k,15*k,'#090a0888');}
 if(a.flashlight){const p=this.project(s.player.x,s.player.z),x=p.x+s.player.facing*15*k,y=p.y-56*k,range=420*k,dir=s.player.facing;g.save();const cone=g.createRadialGradient(x,y,2,x,y,range);cone.addColorStop(0,'#e0edc71f');cone.addColorStop(.35,'#d9e8cc13');cone.addColorStop(1,'transparent');this.path([[x,y],[x+dir*range,y-range*.32],[x+dir*range,y+range*.25]],cone);g.restore();}
 for(const p of r.portals){const id=S.key(r.id,p.to);if(s.doors[id]!=='sealed')continue;const v=this.project(p.x,this.classic?.7:p.z),hp=a.doorIntegrity[id]??100;this.rect(v.x-33*k,v.y+22*k,66*k,3*k,'#172e37');this.rect(v.x-33*k,v.y+22*k,66*k*hp/100,3*k,hp<35?'#d48c69':'#bab991');}
};
})(globalThis);
