/* Original procedural figures. Inspired by documented costume/prop cues,
   not scanned actor likenesses or production sprites. */
import {appearance} from '../src/fidelity-v114.mjs';
import {WEAPONS} from '../src/arsenal-v114.mjs';
const rect=(c,x,y,w,h,f,st)=>{c.fillStyle=f;c.fillRect(x,y,w,h);if(st){c.strokeStyle=st;c.lineWidth=1;c.strokeRect(x+.5,y+.5,w-1,h-1);}};
const line=(c,x,y,xx,yy,col,n=1)=>{c.beginPath();c.strokeStyle=col;c.lineWidth=n;c.moveTo(x,y);c.lineTo(xx,yy);c.stroke();};
const el=(c,x,y,rx,ry,col)=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=col;c.fill();};
const text=(c,t,x,y,size=9,col='#d5d6c5')=>{c.font=`600 ${size}px ui-monospace,monospace`;c.fillStyle=col;c.textAlign='center';c.fillText(t,x,y);};
export function weapon(c,id,x,y,scale=1,flip=1,ammo=null){c.save();c.translate(x,y);c.scale(scale*flip,scale);c.lineJoin='round';
 if(id==='flame'){rect(c,-8,-6,44,13,'#667055','#b3b299');rect(c,-15,3,17,11,'#3b4037');rect(c,16,7,14,13,'#737953','#b4ae8d');line(c,33,0,70,0,'#191f1e',6);rect(c,56,-5,11,11,'#879080');line(c,-6,-9,30,-9,'#c2c0a0',3);}
 else if(id==='smartgun'){rect(c,-10,-8,48,16,'#292e2c','#89917e');rect(c,-24,-5,16,10,'#586249');line(c,34,0,94,0,'#171e1a',8);for(let i=0;i<5;i++)line(c,50+i*7,-5,50+i*7,5,'#879180',2);rect(c,9,6,18,18,'#4b5045','#9d9f87');line(c,13,-11,34,-11,'#768778',3);line(c,17,10,-5,35,'#6a725f',5);}
 else if(id==='shotgun'){rect(c,-24,-1,26,10,'#6c573f','#ae9263');line(c,0,-3,64,-3,'#1c2520',5);rect(c,21,-3,19,10,'#473f30','#8b7e5d');line(c,5,4,13,17,'#242a24',5);}
 else if(id==='pistol'){rect(c,-4,-5,24,8,'#202727','#b9b8a2');line(c,0,0,-4,17,'#514c3b',7);}
 else if(id==='knife'){line(c,-7,0,7,0,'#6b5c41',7);c.beginPath();c.moveTo(7,-4);c.lineTo(39,0);c.lineTo(7,4);c.closePath();c.fillStyle='#c6d4d3';c.fill();}
 else if(id==='grenade'){el(c,5,0,8,12,'#788068');rect(c,1,-18,7,10,'#394b40');line(c,7,-15,15,-12,'#c9c4a8',2);}
 else{rect(c,-17,-5,51,14,'#695d42','#afb093');rect(c,-28,-2,14,12,'#404b3a');rect(c,10,7,11,18,'#27362c');rect(c,22,8,25,7,'#1b2c25');line(c,34,-1,64,-1,'#151e18',5);line(c,-2,-13,31,-13,'#9aab8d',3);line(c,-2,-13,-2,-5,'#697e62',3);line(c,31,-13,31,-5,'#697e62',3);rect(c,3,-2,12,5,id==='launcher'?'#cb943f':'#b7423b');text(c,id==='launcher'?'GL':ammo===null?'--':String(Math.min(99,ammo)).padStart(2,'0'),9,2,4,'#fd6953');}
 c.restore();}
export function human(renderer,a,world){const c=renderer.c,p=renderer.project(a),s=renderer.session,info=appearance(a.appearanceId||a.id)||appearance('hicks'),id=info.id,child=id==='newt',h=child?66:101,face=a.facing||1,walk=a.route?.length&&!renderer.reducedMotion?Math.sin(world.time*10)*5:0,skin=info.skin,hair=info.hair,wear=info.wear;
 c.save();c.translate(p.x,p.y);const marine=wear.startsWith('marine'),smart=wear.startsWith('smartgun'),flight=wear.startsWith('pilot'),ripley=id==='ripley',bishop=id==='bishop',civil=id==='burke'||id==='gorman';const cloth=child?'#9c9785':ripley?'#6d929e':bishop?'#a3ada1':civil?'#827f69':flight?'#82947d':smart?'#536e4e':'#687959';
 line(c,-8,-h*.37,-10+walk,-5,cloth,child?8:12);line(c,8,-h*.37,12-walk,-5,cloth,child?8:12);rect(c,-17+walk,-8,14,8,'#26342d');rect(c,5-walk,-8,16,8,'#26342d');
 rect(c,-16,-h*.79,32,h*.46,cloth,'#344d46');line(c,0,-h*.78,0,-h*.35,'#d0d3b255',1);rect(c,-18,-h*.39,36,7,'#3c4435');
 if(marine||smart){rect(c,-19,-h*.79,38,35,smart?'#485b3e':'#69794d','#a0ad82');for(let i=0;i<7;i++)rect(c,-16+(i*13)%28,-h*.78+(i*11)%28,6,4,i%2?'#384635':'#a7a477');rect(c,-16,-h*.43,11,13,'#394b36','#87977b');rect(c,6,-h*.43,12,13,'#384b36','#a4ad7f');line(c,-14,-h*.8,17,-h*.45,'#2d3c31',4);}
 if(id==='hicks'){c.fillStyle='#bd7878';c.beginPath();c.moveTo(-9,-69);c.bezierCurveTo(-22,-82,-20,-59,-9,-55);c.bezierCurveTo(2,-61,1,-82,-9,-69);c.fill();for(let i=0;i<5;i++)rect(c,13,-72+i*5,8,3,'#c9b989');}
 if(id==='hudson'){text(c,'LOUISE',0,-61,5,'#eee0ac');rect(c,-24,-51,9,17,'#263e33','#8ab7a1');rect(c,-22,-49,5,6,'#b1dc79');}
 if(id==='dietrich'){rect(c,-24,-54,12,19,'#b7b9a4','#364c3a');rect(c,-21,-51,5,13,'#884d44');rect(c,-24,-47,11,4,'#884d44');}
 const hy=-h+12;el(c,0,hy,child?10:11,child?12:14,skin);el(c,-face*6,hy+2,5,6,skin);line(c,face*4,hy-1,face*9,hy-1,'#292b28',1.4);line(c,face*4,hy+9,face*8,hy+9,'#826454',1);
 if(ripley){for(let i=0;i<10;i++){const angle=Math.PI+i*Math.PI/8;el(c,Math.cos(angle)*12,hy-3+Math.sin(angle)*13,5,5,hair);}el(c,-11,hy+7,5,15,hair);line(c,-12,-h*.66,-19,-h*.38,'#bbd6d766',2);}
 else if(child){el(c,0,hy-6,12,8,hair);for(let i=0;i<5;i++)line(c,-12+i*5,hy-2,-15+i*7,hy+20,hair,4);rect(c,-12,-38,24,25,'#89938b');el(c,18,-29,7,9,'#bea28d');el(c,18,-35,7,5,'#746546');line(c,8,-40,17,-26,skin,5);}
 else if(id==='vasquez'){el(c,0,hy-10,12,7,hair);rect(c,-13,hy-10,27,5,'#a53738');line(c,-12,hy-7,-22,hy+5,'#9f3c36',4);}
 else if(id==='drake'||id==='apone'){el(c,0,hy-10,15,7,'#697950');rect(c,-14,hy-9,34,4,'#8e9a71');if(id==='apone')line(c,8,hy+8,20,hy+10,'#8a613f',3);}
 else if(flight){el(c,0,hy-3,15,18,'#9ca89b');rect(c,-12,hy-7,25,12,'#273e3f');line(c,12,hy+4,18,hy+13,'#ccd0b8',2);}
 else if(id==='hudson'){el(c,0,hy-7,15,10,'#6c7d58');rect(c,-14,hy-10,26,4,'#8f9a71');rect(c,11,hy-10,9,9,'#313d31','#b9c4a7');line(c,-13,hy-1,-16,hy+16,'#819080',2);}
 else{el(c,0,hy-11,12,6,hair);line(c,-10,hy-10,-11,hy+2,hair,4);}
 if(smart){rect(c,8,hy-3,11,9,'#272e2a','#a5b79e');line(c,15,hy-2,17,-h*.71,'#889984',2);line(c,-12,-78,-23,-16,'#767e68',5);}
 if(marine){text(c,info.name.split(' ').at(-1).toUpperCase().slice(0,10),0,-72,4,'#e5dcc0');rect(c,-22,-88,6,12,'#556a52','#a9b595');}
 let held=s?.arsenal?.selected[a.id]||info.equipment?.[0];if(!WEAPONS[held])held=null;
 if(child||bishop||id==='burke'||id==='gorman'||flight||world.scene.id.startsWith('v114-gateway'))held=null;
 if(held){line(c,-12,-h*.67,face*19,-h*.55,smart?skin:cloth,7);line(c,13,-h*.7,face*39,-h*.55,smart?skin:cloth,7);weapon(c,held,face*25,-h*.57,held==='smartgun'?.65:.63,face,WEAPONS[held]?.resource==='pulse'?a.ammo:s?.arsenal?.remaining?.[a.id]?.[WEAPONS[held]?.resource]??null);}
 else if(!child){line(c,-15,-h*.7,-23,-h*.4,cloth,7);line(c,14,-h*.7,21,-h*.42,cloth,7);}
 if(a.kind==='player'&&s?.action){line(c,0,-62,face*23,-49,cloth,7);rect(c,face*23-3,-53,7,13,'#bbc3a8');}
 c.restore();if(a.kind==='player'){c.strokeStyle='#d3dcbd';c.lineWidth=1.2;c.beginPath();c.ellipse(p.x,p.y+3,23,7,0,0,Math.PI*2);c.stroke();}}
export function filmProp(renderer,p,world,pal,x,y){const c=renderer.c;if(p.type==='armament-case'){const used=renderer.session?.arsenal?.collected.includes(p.arsenalId);rect(c,x-31,y-34,62,34,used?'#354b43':'#687752','#b3bc97');rect(c,x-30,y-(used?46:35),60,used?11:5,'#9ea17b');if(used)rect(c,x-25,y-27,50,17,'#0b2620');else{weapon(c,'flame',x-16,y-15,.45);line(c,x-28,y-7,x+28,y-7,'#cfb674',3);}text(c,used?'VIDE':'M240 / M41A-GL',x,y-55,8);return true;}
 if(p.type==='gun-rack'){rect(c,x-100,y-110,200,110,'#283c3c','#859899');for(let i=0;i<4;i++)weapon(c,['pulse','shotgun','flame','pistol'][i],x-60,y-91+i*24,.75);text(c,'USCM · ARMEMENT',x,y-125,10);return true;}
 if(['smartgun-bench','smartgun'].includes(p.type)){rect(c,x-103,y-9,206,20,'#52665b','#91a28b');line(c,x-99,y-8,x+96,y-8,'#b4bc97',2);weapon(c,'smartgun',x-66,y-13,.72);weapon(c,'smartgun',x-42,y+9,.60);text(c,'M56 · BANC DE PRÉPARATION',x,y-34,8);return true;}
 if(p.type==='armor-rack'){rect(c,x-52,y-130,104,130,'#243937','#789389');for(const xx of [-24,24]){el(c,x+xx,y-104,13,10,'#7b865c');rect(c,x+xx-16,y-89,32,51,'#687854','#a7ac7f');line(c,x+xx-16,y-83,x+xx+16,y-40,'#344833',5);}text(c,'PERSONNEL USCM',x,y-143,9);return true;}
 if(p.type==='cryo'){rect(c,x-38,y-82,76,82,'#91a9a6','#d4ddce');rect(c,x-30,y-71,60,60,'#1e3b3d','#a1c3ba');el(c,x,y-44,17,27,'#697e79');rect(c,x-12,y-65,24,8,'#b6c8bd');for(let i=0;i<3;i++)rect(c,x-24+i*17,y-7,10,3,'#99c8b1');return true;}
 if(p.type==='resin'||p.type==='ovipositor'||p.type==='cocoon'||['egg-cluster','eggs'].includes(p.type)){if(['egg-cluster','eggs'].includes(p.type)){for(let i=0;i<5;i++){el(c,x-68+i*32,y-i%2*13-22,18,29,'#616a40');line(c,x-75+i*32,y-i%2*13-41,x-66+i*32,y-i%2*13-23,'#b1a56b',2);}}else if(p.type==='ovipositor'){for(let i=0;i<9;i++)el(c,x-89+i*22,y-48+Math.sin(i*.6)*18,26,22,'#657350');for(let i=0;i<8;i++)line(c,x-90+i*23,y-57,x-84+i*23,y-22,'#9da177',2);text(c,'NURSERIE · OVOPOSITEUR',x,y-102,10);}else{for(let i=0;i<8;i++)line(c,x-54+i*15,y,x-28+Math.sin(i)*30,y-102-i%3*12,'#41584b',7);if(p.type==='cocoon'){el(c,x,y-67,21,42,'#64745d');el(c,x,y-101,9,11,'#af9d7a');for(let i=0;i<6;i++)line(c,x-22,y-99+i*12,x+22,y-95+i*12,'#94a381',3);}}return true;}
 if(['flight-console','display'].includes(p.type)){rect(c,x-50,y-85,100,85,'#334b49','#91aaa2');for(let i=0;i<3;i++){rect(c,x-43+i*29,y-76,24,28,'#102e2b','#73c2a3');for(let j=0;j<3;j++)line(c,x-39+i*29,y-70+j*6,x-22+i*29,y-70+j*6,'#83c7a2');}for(let i=0;i<10;i++)rect(c,x-42+i*9,y-28,5,7,i%3?'#b3b69b':'#a45f43');return true;}
 if(p.type==='photo'||p.type==='knife'||p.type==='meal'||['drain','grate'].includes(p.type)){if(p.type==='knife')weapon(c,'knife',x,y-7,.6);else if(p.type==='photo')rect(c,x-12,y-30,24,30,'#9d9b7a','#d2cfb3');else if(p.type==='meal'){el(c,x,y-6,24,7,'#bdc2af');el(c,x,y-7,16,5,'#897654');}else{el(c,x,y-5,64,21,'#0c201e');for(let i=0;i<7;i++)line(c,x-51+i*17,y-18,x-51+i*17,y+9,'#7e9490',3);}return true;}
 return false;}
export function filmBackdrop(renderer,world,pal){const c=renderer.c,s=world.scene,f=s.family,cam=renderer.camera;if(!['gateway','sulaco','armory','cockpit','processor','hive','exterior'].includes(f))return;
 rect(c,0,0,1280,262,pal.bg);if(f==='exterior'){for(let i=0;i<9;i++){c.beginPath();const x=i*178-cam*.13;c.moveTo(x-100,250);c.lineTo(x+20,76+(i%3)*19);c.lineTo(x+144,250);c.fillStyle=i%2?'#314547':'#233e43';c.fill();}for(let i=0;i<50;i++){const t=renderer.reducedMotion?0:world.time*70;const x=(i*131+t)%1380;line(c,x,i*53%260,x-24,i*53%260+45,'#bed1ca25');}return;}
 for(let i=0;i<9;i++){const x=i*168-cam*.25;rect(c,x+4,18,151,219,f==='hive'?'#20392e':pal.wall,'#95aaa23a');if(['gateway','sulaco'].includes(f)){rect(c,x+23,38,116,76,'#284448','#accbc966');for(let j=0;j<9;j++)rect(c,x+32+j*11,130,4,57,'#879d9255');}else if(f==='processor'||f==='hive'){for(let j=0;j<4;j++)line(c,x+29+j*30,18,x+9+j*30,233,f==='hive'?'#526b48':'#7b8b77',f==='hive'?8:14);}else{rect(c,x+20,55,112,87,'#132d2d','#8cafa17f');for(let k=0;k<7;k++)line(c,x+30,69+k*9,x+94+(k%3)*10,69+k*9,'#7fae9255');}line(c,x,8,x,257,pal.trim,6);}
 for(let x=-cam*.45%176;x<1340;x+=176){rect(c,x+22,15,104,7,pal.light);line(c,x,256,x+176,256,pal.trim,3);}}
