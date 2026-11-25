import {
  ALIEN3_CAMPAIGN_ID_V101,
  ALIEN3_LEVEL_DESIGN_LAYOUTS_V101,
  ALIEN3_LEVEL_DESIGN_SECTORS_V101,
  ALIEN3_PROP_ARCHETYPES_V101,
  auditAlien3LevelDesignV101,
  createAlien3StateV101,
  sanitizeAlien3StateV101
} from './alien3-dlc-v101.js';

const isRecord=(v)=>Boolean(v&&typeof v==='object'&&!Array.isArray(v));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
const propById=new Map(ALIEN3_PROP_ARCHETYPES_V101.map(p=>[p.id,p]));
const specById=new Map(ALIEN3_LEVEL_DESIGN_SECTORS_V101.map(s=>[s.id,s]));

function colorFor(family,alpha=1){const map={structure:[46,52,49],utility:[58,72,66],detention:[52,58,54],medical:[73,86,79],foundry:[93,66,44],storage:[63,62,54],signage:[126,112,73],environment:[80,91,84],company:[143,151,143]};const c=map[family]||[58,65,61];return `rgba(${c[0]},${c[1]},${c[2]},${alpha})`;}
function line(ctx,x1,y1,x2,y2,stroke,width=2,alpha=1){ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.restore();}
function rect(ctx,x,y,w,h,fill,stroke=null){ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);if(stroke){ctx.strokeStyle=stroke;ctx.strokeRect(x+.5,y+.5,w-1,h-1);}}

function drawProp(ctx,p,screenX,baseY,alpha=1){
  const a=propById.get(p.archetypeId);if(!a)return 0;const h=p.height*p.scale;const w=Math.max(12,h*(a.shape==='beam'?.12:a.shape==='column'?.16:a.shape==='bars'?.48:a.shape==='pipes'?.62:a.shape==='furnace'?.72:a.shape==='recovery'?.62:.44));const x=screenX-w/2,y=baseY-h;const c=colorFor(a.family,alpha);const edge=colorFor(a.family,Math.min(1,alpha+.16));ctx.save();ctx.globalAlpha=alpha;
  if(a.shape==='beam'||a.shape==='column'){rect(ctx,x,y,w,h,c,edge);line(ctx,x+w*.2,y,x+w*.8,y+h,edge,2,.45);}
  else if(a.shape==='truss'){line(ctx,x,y+h,x+w,y,edge,7,.85);line(ctx,x,y,x+w,y+h,edge,5,.5);line(ctx,x,y+h*.5,x+w,y+h*.5,edge,3,.5);}
  else if(a.shape==='gantry'||a.shape==='bulkhead'||a.shape==='arch'){line(ctx,x,y+h,x,y,edge,7,.85);line(ctx,x+w,y+h,x+w,y,edge,7,.85);line(ctx,x,y,x+w,y,edge,7,.85);if(a.shape==='gantry')line(ctx,x,y+h*.22,x+w,y+h*.22,edge,3,.6);}
  else if(a.shape==='pipes'||a.shape==='steam-pipe'||a.shape==='rack'){for(let i=0;i<3;i++)line(ctx,x,y+h*(.22+i*.24),x+w,y+h*(.22+i*.24),edge,5-i,.75);}
  else if(a.shape==='cables'||a.shape==='chains'){for(let i=0;i<4;i++){const xx=x+w*(.12+i*.22);line(ctx,xx,y,xx+(i%2?8:-8),y+h,edge,a.shape==='chains'?2:3,.7);}}
  else if(a.shape==='duct'){rect(ctx,x,y,w,h*.48,c,edge);for(let i=1;i<4;i++)line(ctx,x+w*i/4,y,x+w*i/4,y+h*.48,edge,2,.45);}
  else if(a.shape==='valves'){for(let i=0;i<3;i++){const cx=x+w*(.2+i*.3),cy=y+h*(.45+(i%2)*.16);ctx.strokeStyle=edge;ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx,cy,Math.max(6,w*.14),0,Math.PI*2);ctx.stroke();}}
  else if(a.shape==='fan'){ctx.strokeStyle=edge;ctx.lineWidth=4;ctx.beginPath();ctx.arc(x+w/2,y+h/2,Math.min(w,h)*.42,0,Math.PI*2);ctx.stroke();for(let i=0;i<4;i++)line(ctx,x+w/2,y+h/2,x+w/2+Math.cos(i*Math.PI/2)*w*.35,y+h/2+Math.sin(i*Math.PI/2)*w*.35,edge,4,.7);}
  else if(a.shape==='bars'||a.shape==='gate'||a.shape==='cage'){rect(ctx,x,y,w,h,'rgba(10,14,13,.30)',edge);for(let i=1;i<6;i++)line(ctx,x+w*i/6,y,x+w*i/6,y+h,edge,2,.75);}
  else if(a.shape==='bunks'){for(let i=0;i<2;i++){rect(ctx,x,y+h*(.16+i*.44),w,h*.16,c,edge);line(ctx,x+w*.1,y+h*(.16+i*.44),x+w*.1,y+h*(.55+i*.28),edge,3,.7);}}
  else if(a.shape==='ring'){ctx.strokeStyle=edge;ctx.lineWidth=4;ctx.beginPath();ctx.arc(x+w/2,y+h/2,Math.min(w,h)*.35,0,Math.PI*2);ctx.stroke();}
  else if(['cabinet','monitor','box','lockers','board','case'].includes(a.shape)){rect(ctx,x,y,w,h,c,edge);if(a.shape==='monitor'){for(let i=0;i<4;i++)rect(ctx,x+6,y+7+i*(h-12)/4,w-12,Math.max(5,(h-18)/5),'rgba(96,129,112,.35)');}else line(ctx,x+w*.5,y,x+w*.5,y+h,edge,2,.45);}
  else if(a.shape==='gurney'){rect(ctx,x,y+h*.45,w,h*.18,c,edge);line(ctx,x+w*.15,y+h*.63,x+w*.1,y+h,edge,3,.7);line(ctx,x+w*.85,y+h*.63,x+w*.9,y+h,edge,3,.7);}
  else if(a.shape==='curtain'){rect(ctx,x,y,w,h,'rgba(84,92,77,.24)',edge);for(let i=1;i<4;i++)line(ctx,x+w*i/4,y,x+w*i/4,y+h,edge,1,.35);}
  else if(a.shape==='sink'){rect(ctx,x,y+h*.52,w,h*.26,c,edge);line(ctx,x+w*.7,y+h*.52,x+w*.7,y+h*.25,edge,3,.7);}
  else if(a.shape==='crucible'){ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w,y);ctx.lineTo(x+w*.82,y+h);ctx.lineTo(x+w*.18,y+h);ctx.closePath();ctx.fill();ctx.strokeStyle=edge;ctx.stroke();}
  else if(a.shape==='mold'||a.shape==='piston'){rect(ctx,x,y,w,h,c,edge);for(let i=1;i<4;i++)line(ctx,x,y+h*i/4,x+w,y+h*i/4,edge,2,.45);}
  else if(a.shape==='hoist'){line(ctx,x+w*.5,y,x+w*.5,y+h*.72,edge,4,.8);ctx.strokeStyle=edge;ctx.beginPath();ctx.arc(x+w*.5,y+h*.82,w*.18,0,Math.PI*1.7);ctx.stroke();}
  else if(a.shape==='bin'||a.shape==='crates'||a.shape==='barrels'||a.shape==='pallet'){for(let i=0;i<3;i++){const ww=w*(.42+(i%2)*.1),hh=h*.28;rect(ctx,x+(i%2)*w*.35,y+h-hh*(i+1),ww,hh,c,edge);}}
  else if(a.shape==='ladle'){line(ctx,x+w*.2,y+h,x+w*.72,y+h*.15,edge,7,.8);ctx.strokeStyle=edge;ctx.beginPath();ctx.arc(x+w*.72,y+h*.18,w*.25,0,Math.PI*2);ctx.stroke();}
  else if(a.shape==='furnace'){rect(ctx,x,y,w,h,c,edge);ctx.fillStyle='rgba(205,96,35,.32)';ctx.beginPath();ctx.arc(x+w/2,y+h*.64,w*.29,0,Math.PI*2);ctx.fill();}
  else if(a.shape==='stencil'||a.shape==='stripe'){ctx.fillStyle=colorFor('signage',alpha*.75);for(let i=0;i<5;i++)ctx.fillRect(x+i*w/5,y+(i%2)*h*.3,w*.12,h*(a.shape==='stripe'?.72:.35));}
  else if(a.shape==='drain'||a.shape==='puddle'){rect(ctx,x,y+h*.75,w,h*.18,colorFor('environment',alpha*.42));}
  else if(a.shape==='steam'||a.shape==='rain'||a.shape==='ash'||a.shape==='grime'){for(let i=0;i<8;i++){const xx=x+(i%4)*w/4,yy=y+((i*19)%Math.max(1,h));line(ctx,xx,yy,xx+(a.shape==='rain'?-12:5),Math.min(y+h,yy+24),edge,a.shape==='rain'?1:2,.25);}}
  else if(a.shape==='lamp'){line(ctx,x+w*.5,y,x+w*.5,y+h*.55,edge,4,.8);ctx.fillStyle='rgba(215,226,190,.38)';ctx.beginPath();ctx.arc(x+w*.5,y+h*.64,w*.22,0,Math.PI*2);ctx.fill();}
  else if(a.shape==='recovery'){rect(ctx,x,y,w,h,'rgba(128,139,132,.32)',edge);line(ctx,x,y,x+w,y+h,edge,3,.45);line(ctx,x+w,y,x,y+h,edge,3,.45);}
  else rect(ctx,x,y,w,h,c,edge);
  ctx.restore();return 1;
}

export function withAlien3DlcRuntimeV101(BaseEngine){
  return class Alien3DlcRuntimeV101 extends BaseEngine{
    start(options={}){this.alien3ActiveV101=String(options.campaign?.id||'')===ALIEN3_CAMPAIGN_ID_V101;this.alien3V101=this.alien3ActiveV101?createAlien3StateV101():null;this.pendingAlien3ResumeV101=null;const snap=super.start(options);if(!this.isAlien3MissionV101())return snap;if(this.pendingAlien3ResumeV101)this.alien3V101=sanitizeAlien3StateV101(this.pendingAlien3ResumeV101);this.auditAlien3DecorV101();return{...snap,...this.getAlien3SnapshotV101()};}
    isAlien3MissionV101(){return Boolean(this.alien3ActiveV101||this.isAlien3MissionV100?.());}
    currentAlien3SectorIdV101(){return this.currentAlien3HybridSectorV97?.()?.id||'hybrid-storm-yard';}
    currentAlien3DecorSpecV101(){return specById.get(this.currentAlien3SectorIdV101())||ALIEN3_LEVEL_DESIGN_SECTORS_V101[0];}
    currentAlien3DecorLayoutV101(){return ALIEN3_LEVEL_DESIGN_LAYOUTS_V101[this.currentAlien3SectorIdV101()]||[];}
    auditAlien3DecorV101(){if(!this.alien3V101)return null;this.alien3V101.audit=auditAlien3LevelDesignV101();this.alien3V101.perfectDecor=this.alien3V101.audit.ok&&this.alien3V101.audit.totalProps>=300;return this.alien3V101.audit;}
    update(delta){const result=super.update(delta);if(this.isAlien3MissionV101()&&this.alien3V101){const id=this.currentAlien3SectorIdV101();if(!this.alien3V101.visitedSectors.includes(id))this.alien3V101.visitedSectors.push(id);this.alien3V101.perfectDecor=this.alien3V101.audit.ok&&this.alien3V101.visitedSectors.length===9;}return result;}

    drawAlien3DecorBandV101(ctx,layer){if(!this.alien3V101||!ctx)return 0;const spec=this.currentAlien3DecorSpecV101();const sector=this.currentAlien3HybridSectorV97?.();if(!sector)return 0;const factor=spec.parallax[layer]||1;const span=Math.max(1,sector.x1-sector.x0);const localCam=((Number(this.camera?.x)||0)-sector.x0);let count=0;for(const p of this.currentAlien3DecorLayoutV101()){if(p.layer!==layer)continue;const local=(p.x-sector.x0)/span;const screenX=54+local*1172-localCam*factor*.18;if(screenX<-260||screenX>1540)continue;const baseY=layer==='far'?90+p.yNorm*430:layer==='front'?500+p.yNorm*90:500+p.yNorm*70;count+=drawProp(ctx,p,screenX,baseY,layer==='far'?.48:layer==='front'?.52:.68);}this.alien3V101.decorDraws+=count;if(layer==='far')this.alien3V101.farDraws+=count;if(layer==='mid')this.alien3V101.midDraws+=count;if(layer==='front')this.alien3V101.frontDraws+=count;return count;}
    drawAlien3LandmarksV101(ctx){const spec=this.currentAlien3DecorSpecV101();const sector=this.currentAlien3HybridSectorV97?.();if(!ctx||!sector)return 0;const factor=spec.parallax.far||.1;const sx0=sector.x0-(Number(this.camera?.x)||0)*factor;const span=sector.x1-sector.x0;ctx.save();ctx.globalAlpha=.38;ctx.strokeStyle='rgba(118,113,91,.42)';ctx.lineWidth=4;for(let i=0;i<spec.landmarks.length;i++){const x=sx0+span*(.28+i*.43);ctx.strokeRect(x,96+i*28,110+i*36,255-i*24);line(ctx,x,96+i*28,x+110+i*36,351+i*4,'rgba(118,113,91,.28)',3,.55);}ctx.restore();return spec.landmarks.length;}
    drawBackdrop(ctx){if(!this.isAlien3MissionV101()||!this.alien3V101||!ctx)return super.drawBackdrop(ctx);super.drawBackdrop(ctx);this.drawAlien3DecorBandV101(ctx,'far');this.drawAlien3LandmarksV101(ctx);}
    drawWorld(ctx){if(!this.isAlien3MissionV101()||!this.alien3V101||!ctx)return super.drawWorld(ctx);const before=this.currentAlien3DecorLayoutV101().filter(p=>p.layer==='mid');for(const p of before){const baseY=(this.player?.y||430)+this.player?.h+22+(p.yNorm-.5)*80;drawProp(ctx,p,p.x,baseY,.74);}this.alien3V101.midDraws+=before.length;this.alien3V101.decorDraws+=before.length;return super.drawWorld(ctx);}
    drawForeground(ctx){const result=super.drawForeground?.(ctx);if(this.isAlien3MissionV101()&&this.alien3V101&&ctx)this.drawAlien3DecorBandV101(ctx,'front');return result;}
    captureResumeState(){const base=super.captureResumeState();if(!this.isAlien3MissionV101()||!this.alien3V101)return base;return{...base,specialOperation:{...(isRecord(base.specialOperation)?base.specialOperation:{}),alien3V101:sanitizeAlien3StateV101(this.alien3V101)}};}
    applyResumeState(raw){const src=raw?.specialOperation?.alien3V101||raw?.alien3V101;const result=super.applyResumeState(raw);if(!this.isAlien3MissionV101()||!result?.applied||!isRecord(src)||Number(src.schema)!==101)return result;this.alien3V101=sanitizeAlien3StateV101(src);this.pendingAlien3ResumeV101=this.alien3V101;return{...result,restored:(Number(result.restored)||0)+1,alien3DlcRestoredV101:true};}
    getAlien3SnapshotV101(){if(!this.isAlien3MissionV101()||!this.alien3V101)return{alien3V101:null};return{alien3V101:{...sanitizeAlien3StateV101(this.alien3V101),sectorId:this.currentAlien3SectorIdV101(),sectorProps:this.currentAlien3DecorLayoutV101().length,sectorFamilies:[...new Set(this.currentAlien3DecorLayoutV101().map(p=>p.family))].length}};}
    getGameplayReport(){const r=super.getGameplayReport();return this.isAlien3MissionV101()?{...r,...this.getAlien3SnapshotV101()}:r;}
    getSnapshot(){return{...super.getSnapshot(),...this.getAlien3SnapshotV101()};}
  };
}
