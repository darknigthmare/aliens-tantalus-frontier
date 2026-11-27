/* Original articulated Canvas rover and roadside equipment. No external images. */
(function(root){'use strict';
const P=root.ROP_Renderer.prototype,M=root.ROP_MOBILITY,D=root.ROP_DATA;
P.roadGround=function(sim){
 if(!D.mobility.rooms.includes(sim.s.room))return;
 const g=this.ctx,W=this.w,H=this.h,k=this.scale,fy=H*.68;
 const grad=g.createLinearGradient(0,fy,0,H);grad.addColorStop(0,'#35413d');grad.addColorStop(1,'#132127');g.fillStyle=grad;g.fillRect(0,fy,W,H-fy);
 for(let x=-((this.cam*k)%(95*k));x<W+100*k;x+=95*k){for(let i=0;i<6;i++){const y=fy+(i+1)*H*.042;this.line(x+i*9*k,y,x+(i*9+17)*k,y+2*k,'#75807727',1.5*k);}}
 for(const z of [.47,.82]){const y=this.project(0,z).y;this.line(0,y,W,y+4*k,'#111d22aa',7*k);this.line(0,y-7*k,W,y-3*k,'#9a998449',2*k);}
 for(let x=-((this.cam*k)%(390*k));x<W+150*k;x+=390*k){this.path([[x,H*.965],[x+85*k,H*.959],[x+117*k,H*.967],[x+14*k,H*.979]],'#172b3440');}
};
P.mobilityDraws=function(sim,draw){
 const s=sim.s,v=s.mobility.rover;
 for(const q of D.mobility.surfaces)if(q.room===s.room)draw.push({z:.255,run:()=>{
  const p=this.project(q.x,.32),k=this.scale;
  for(let i=0;i<24;i++){const x=p.x+(i/23-.5)*q.w*k,y=p.y+(i%3)*8*k;this.line(x,y,x+14*k,y+5*k,'#56675f',2*k);}
  this.text(q.label,p.x,p.y-15*k,9*k,'#b9b6a0','center');
 }});
 for(const d of D.mobility.stations)if(d.room===s.room)draw.push({z:d.z,run:()=>this.serviceStation(d,sim)});
 if(M.unlocked(s)&&v.room===s.room)draw.push({z:s.mode==='classic'&&!v.driver?.42:v.z+.002,run:()=>this.roverBody(sim)});
};
P.serviceStation=function(d,sim){const k=this.scale,p=this.project(d.x,d.z),v=sim.s.mobility.stations[d.id],x=p.x,y=p.y;
 this.ellipse(x,y,69*k,10*k,'#07141baa');
 this.rect(x-46*k,y-101*k,92*k,95*k,'#263d44','#83958c');this.rect(x-39*k,y-94*k,78*k,29*k,'#112730','#566f6e');
 this.text('SERVICE',x,y-73*k,12*k,'#d6d7ae','center');
 this.rect(x-34*k,y-55*k,34*k,43*k,'#5c756a','#b2c0a3');this.line(x-17*k,y-42*k,x-17*k,y-25*k,'#d8dcb8',5*k);this.line(x-26*k,y-34*k,x-8*k,y-34*k,'#d8dcb8',5*k);
 this.rect(x+9*k,y-53*k,25*k,36*k,'#1a3038','#a9b491');this.circle(x+21*k,y-37*k,6*k,v.charges?'#b4cfa4':'#465c5b');
 this.path([[x+47*k,y-68*k],[x+64*k,y-57*k],[x+60*k,y-14*k],[x+47*k,y-20*k]],null,'#1c272b',6*k);
 this.text(`${v.repairs} TROUSSE · ${v.charges} CHARGE`,x,y+18*k,8*k,'#c0c7ae','center');
};
P.roverBody=function(sim){
 const s=sim.s,v=s.mobility.rover,g=this.ctx,k=this.scale,z=s.mode==='classic'&&!v.driver?.42:v.z,pt=this.project(v.x,z);
 g.save();g.translate(pt.x,pt.y);g.scale(k*v.heading,k);
 this.ellipse(0,5,171,17,'#030c11aa');
 // Four articulated wheels; rotation follows travelled distance, not wall time.
 for(const x of [-107,-50,70,123]){
  this.ellipse(x,-8,27,29,'#060e12');this.ellipse(x,-8,21,22,'#2f3c3e');this.ellipse(x,-8,12,13,'#677874');
  for(let i=0;i<8;i++){const a=i*Math.PI/4+v.wheels;this.line(x+Math.cos(a)*17,-8+Math.sin(a)*17,x+Math.cos(a)*23,-8+Math.sin(a)*24,'#1b292c',4);}
 }
 this.path([[-151,-27],[-151,-67],[-129,-91],[-60,-100],[14,-100],[22,-130],[115,-130],[149,-98],[154,-32]],'#596d64','#a3b1a0',1.5);
 this.path([[22,-121],[107,-121],[134,-98],[30,-98]],'#183542','#a8c3b7',2);
 this.path([[34,-94],[135,-94],[140,-62],[35,-62]],'#244954','#91a89d',1.5);
 // Driver remains visibly in the cabin, not below the vehicle drawing pass.
 if(v.driver){this.circle(66,-86,9,'#bda285');this.path([[54,-77],[74,-77],[85,-63],[48,-63]],'#889082');this.line(72,-72,112,-75,'#bdac90',4);this.circle(116,-74,8,'#6c8380');}
 this.rect(-135,-74,130,41,'#3c504e','#8e9d8c');for(let i=0;i<7;i++)this.rect(-125+i*17,-66,10,22,'#1f343a','#6d8174');
 this.rect(-149,-39,297,14,'#768276','#adb194');this.rect(-146,-20,304,12,'#22393d','#aab698');
 this.rect(-39,-86,61,43,'#87947d','#c1c2a0');g.save();g.scale(v.heading,1);this.text('01',-9*v.heading,-53,29,'#273c40','center');g.restore();
 this.rect(31,-56,98,13,'#b2a96f','#d8cc99');for(let x=38;x<132;x+=18)this.path([[x,-56],[x+8,-56],[x,-43],[x-8,-43]],'#344a49');
 this.rect(132,-86,25,16,v.lights?'#fff1bd':'#809b91','#dbd9b4');this.rect(-161,-52,12,17,'#b58a69','#dec596');
 this.line(-117,-98,-117,-151,'#a8b4a4',3);this.line(-124,-151,-110,-151,'#a8b4a4',2);
 this.rect(-96,-110,79,10,'#172e36','#899e92');this.rect(-85,-119,16,9,'#b6a16d');
 if(v.hp<65)for(let i=0;i<3;i++)this.line(-65+i*35,-85, -45+i*35,-63,'#1b2e36',3);
 if(v.hp===0){this.text('HORS SERVICE',0,-141,11,'#e8bc92','center');if(!this.reduced)for(let i=0;i<3;i++){const a=(this.time*.35+i*.3)%1;this.ellipse(-110+a*24,-113-a*75,8+a*13,5+a*14,'#89999533');}}
 else if(Math.abs(v.speed)>100&&!this.reduced)for(let i=0;i<7;i++){const a=(v.wheels*.1+i*.14)%1;this.ellipse(-155-a*95,3-a*9,5+a*21,3+a*7,'#ada78a2a');}
 g.restore();
 if(!v.driver&&M.nearVehicle(sim))this.text('5 · CABINE',pt.x,pt.y-158*k,11*k,'#e4d6a8','center');
};
P.mobilityOverlay=function(sim){const v=sim.s.mobility.rover;if(!v.driver||v.room!==sim.s.room)return;const k=this.scale,p=this.project(v.x+v.heading*150,v.z),g=this.ctx;
 if(v.lights){g.save();const grad=g.createLinearGradient(p.x,p.y-80*k,p.x+v.heading*450*k,p.y);grad.addColorStop(0,'#eee0a225');grad.addColorStop(1,'#dddca200');this.path([[p.x,p.y-94*k],[p.x+v.heading*490*k,p.y-145*k],[p.x+v.heading*450*k,p.y+14*k],[p.x,p.y-65*k]],grad);g.restore();}
};
})(globalThis);
