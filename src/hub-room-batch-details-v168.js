import { HUB_COMMAND_DETAILS_V168 } from './hub-batch-command-v168.js';
import { HUB_HABITAT_DETAILS_V168 } from './hub-batch-habitat-v168.js';
import { HUB_INDUSTRIAL_DETAILS_V168 } from './hub-batch-industrial-v168.js';
import { HUB_ENGINEERING_DETAILS_V168 } from './hub-batch-engineering-v168.js';
import { HUB_PROP_ATLAS_V136 } from './hub-prop-atlas-v136.js';
import { HUB_FURNISHING_ATLAS_V137 } from './hub-furnishing-atlas-v137.js';
import { resolveSpriteDrawableV134 } from './sprite-alpha-policy-v134.js';

const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
};
export const HUB_BATCH_DETAIL_KINDS_V168 = freeze([
  'clock-bank', 'comms-rack', 'patch-bay', 'reel-recorder', 'map-case', 'camera-dome',
  'sterile-cabinet', 'medical-stock', 'hygiene-dispenser', 'lab-sample-rack', 'hazard-monitor',
  'ration-shelf', 'utensil-rail', 'linen-cabinet', 'laundry-bins', 'personal-shelf',
  'coat-hooks', 'animal-supply', 'muster-kit', 'tool-board', 'parts-bins', 'battery-charger',
  'electrical-isolator', 'data-cabinet', 'ammo-shelf', 'weapons-cleaning', 'cargo-manifest',
  'air-filter', 'pipe-manifold', 'valve-box', 'pressure-gauges', 'hydraulic-accumulator',
  'coolant-loop', 'sensor-calibration', 'emergency-cabinet', 'service-conduits', 'flight-kit', 'oxygen-locker'
]);
export const HUB_BATCH_SECTORS_V168 = freeze({ command: HUB_COMMAND_DETAILS_V168,
  habitat: HUB_HABITAT_DETAILS_V168, industrial: HUB_INDUSTRIAL_DETAILS_V168,
  engineering: HUB_ENGINEERING_DETAILS_V168 });
export const HUB_ROOM_BATCH_DETAILS_V168 = freeze(Object.entries(HUB_BATCH_SECTORS_V168)
  .flatMap(([sector, entries]) => entries.map(entry => ({ ...entry, bounds: { ...entry.bounds }, sector }))));
const valid = b => b && [b.x,b.y,b.w,b.h].every(Number.isFinite) && b.w > 0 && b.h > 0;
const expanded = (b, n) => ({x:b.x-n,y:b.y-n,w:b.w+n*2,h:b.h+n*2});
const overlap = (a,b) => a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
const kinds = new Set(HUB_BATCH_DETAIL_KINDS_V168);

/** Explicit room-local installations. No gap search, seeded scatter, floor
 * collider or new interaction is allowed to manufacture an admitted prop. */
export function getHubRoomBatchDetailPlanV168(room, composition, { entries = HUB_ROOM_BATCH_DETAILS_V168 } = {}) {
  const spatial = composition?.spatial;
  if (!room?.id || !valid(spatial?.bounds)) return null;
  const reservations = [...spatial.reservations, ...composition.items,
    ...(composition.workstationDetailsV139?.items || []).map(item => item.target),
    ...(composition.clinicalBayV139?.parts || []).map(part => part.bounds),
    ...(composition.serviceDetailsV165?.items || []).map(item => item.clearanceBounds)] .filter(valid);
  const plan = {schema:168,roomId:room.id,batchSize:100,scope:'authored-rear-wall-installations',
    projection:spatial.projection.kind,projectionDxPerY:spatial.projection.dxPerY,
    items:[],omitted:[],collidable:false,interactive:false,geometryPreserved:true};
  const seen = new Set();
  for (const entry of entries.filter(item => item.roomId === room.id)) {
    const target = valid(entry.bounds) ? {...entry.bounds,x:spatial.bounds.x+entry.bounds.x} : null;
    const envelope = target && expanded(target,4);
    const conflicts = envelope ? reservations.filter(b => overlap(envelope,b)) : [];
    const inWall = target && target.x >= spatial.bounds.x+112
      && target.x+target.w <= spatial.bounds.x+spatial.bounds.w-112
      && target.y >= spatial.planes.ceilingY+4 && target.y+target.h <= 510
      && target.w >= 40 && target.w <= 128 && target.h >= 24 && target.h <= 84;
    const other = envelope && plan.items.some(item => overlap(expanded(envelope,4),item.clearanceBounds));
    if (!inWall || !kinds.has(entry.kind) || entry.mount !== 'rear-wall' || !entry.purpose || seen.has(entry.id) || conflicts.length || other) {
      plan.omitted.push({id:entry.id,kind:entry.kind,bounds:target,reason:!inWall?'outside-wall-or-scale':
        conflicts.length?'existing-reservation':other?'batch-neighbour':'invalid-installation',
        conflicts:conflicts.map(item => item.role || item.id || 'existing-furniture')});
      continue;
    }
    seen.add(entry.id);
    const native=atlasKinds[entry.kind],cell=native&&native[0].cells[native[1]];
    plan.items.push({...entry,bounds:target,clearanceBounds:envelope,support:'flush-rear-wall',
      ...(cell?{asset:native[0].asset,source:{...cell.source}}:{}),
      plane:'rear',projection:plan.projection,projectionDxPerY:plan.projectionDxPerY,
      collidable:false,interactive:false});
  }
  return plan;
}

function line(c,points,color='#71837d',width=1) {
  c.strokeStyle=color;c.lineWidth=width;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();
}
function panel(c,x,y,w,h,color='#3e5354') {
  c.fillStyle='#09181c';c.fillRect(x-1,y+1,w+2,h+1);
  c.fillStyle=color;c.fillRect(x,y,w,h);c.fillStyle='#8b9990';c.fillRect(x+1,y+1,w-2,1);
  c.fillStyle='#203437';c.fillRect(x+1,y+h-3,w-2,2);
}
function dial(c,x,y,r,phase=0) {
  c.fillStyle='#0b1b20';c.beginPath();c.arc(x,y,r+1,0,Math.PI*2);c.fill();
  c.fillStyle='#a1aaa0';c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();
  const a=-2.3+phase*2.1;line(c,[[x,y],[x+Math.cos(a)*r*.75,y+Math.sin(a)*r*.75]],'#293c3d');
}
const atlasKinds = {
  'sterile-cabinet':[HUB_PROP_ATLAS_V136,'sterile-cabinet'],
  'personal-shelf':[HUB_PROP_ATLAS_V136,'personal-shelf'],
  'tool-board':[HUB_PROP_ATLAS_V136,'tool-board'],
  'data-cabinet':[HUB_PROP_ATLAS_V136,'data-cabinet'],
  'service-conduits':[HUB_FURNISHING_ATLAS_V137,'service-conduits'],
  'emergency-cabinet':[HUB_FURNISHING_ATLAS_V137,'emergency-cabinet']
};
function mounts(c,b) {
  // Every loose silhouette is visibly supported by two short wall brackets.
  for (const x of [b.x+5,b.x+b.w-8]) {
    c.fillStyle='#182d30';c.fillRect(x,b.y-2,3,b.h+4);
    c.fillStyle='#8a968c';c.fillRect(x+1,b.y-1,1,2);c.fillRect(x+1,b.y+b.h-1,1,2);
  }
}
function drawInstallation(c,item,images) {
  const {bounds:b,kind:k}=item;const {x,y,w,h}=b;
  if (atlasKinds[k]) {
    const [atlas,id]=atlasKinds[k],cell=atlas.cells[id],image=images.get(atlas.asset);
    if (!image?.complete || image.naturalWidth!==atlas.width || image.naturalHeight!==atlas.height) return false;
    const s=cell.source,scale=Math.min(w/s.w,h/s.h,1),ww=s.w*scale,hh=s.h*scale;
    mounts(c,b);c.drawImage(resolveSpriteDrawableV134(image),s.x,s.y,s.w,s.h,x+(w-ww)/2,y+(h-hh)/2,ww,hh);return true;
  }
  mounts(c,b);
  if (k==='camera-dome') {
    line(c,[[x+8,y+5],[x+8,y+h*.45],[x+w*.54,y+h*.45]],'#5c7373',4);
    panel(c,x+w*.35,y+h*.25,w*.48,h*.38);c.fillStyle='#061216';c.beginPath();c.arc(x+w*.59,y+h*.49,h*.18,0,Math.PI);c.fill();
    c.fillStyle='#7b9e96';c.fillRect(x+w*.58,y+h*.45,3,2);
  } else if (k==='clock-bank') {
    panel(c,x,y,w,h,'#2e4648');for(let i=0;i<3;i++)dial(c,x+w*(i+.5)/3,y+h*.48,Math.min(h*.3,w*.12),i*.35);
    c.fillStyle='#97a78e';for(let i=0;i<3;i++)c.fillRect(x+w*(i+.5)/3-5,y+h-7,10,2);
  } else if (['comms-rack','patch-bay','reel-recorder','battery-charger','electrical-isolator','sensor-calibration'].includes(k)) {
    panel(c,x,y,w,h);
    if(k==='reel-recorder') {
      for(const xx of [x+w*.28,x+w*.72]){dial(c,xx,y+h*.36,h*.22,.5);c.fillStyle='#354b4e';c.fillRect(xx-2,y+h*.36-2,4,4);}
      panel(c,x+5,y+h*.67,w-10,h*.22,'#263f42');
    } else if(k==='battery-charger') {
      for(let i=0;i<3;i++){panel(c,x+6+i*(w-12)/3,y+8,(w-20)/3,h-16,'#6b725f');c.fillStyle='#a8b38b';c.fillRect(x+10+i*(w-12)/3,y+12,3,3);}
    } else if(k==='electrical-isolator') {
      panel(c,x+5,y+5,w*.46,h-10,'#596960');line(c,[[x+w*.36,y+12],[x+w*.23,y+h-10]],'#c2b17c',4);
      for(let i=0;i<3;i++)line(c,[[x+w*.66,y+8+i*10],[x+w-7,y+8+i*10]],'#122a30',3);
    } else {
      for(let i=0;i<3;i++){panel(c,x+5,y+4+i*(h-8)/3,w-10,(h-12)/3,'#263c40');
        c.fillStyle=i===1?'#95a488':'#ad9b69';c.fillRect(x+9,y+8+i*(h-8)/3,3,2);
        line(c,[[x+w*.45,y+7+i*(h-8)/3],[x+w-9,y+7+i*(h-8)/3]],'#62776f');}
      if(k==='patch-bay')for(let i=0;i<4;i++)line(c,[[x+16+i*10,y+14],[x+16+i*10,y+h-5],[x+24+i*8,y+h-5]],'#181f20',2);
      if(k==='sensor-calibration')dial(c,x+w*.72,y+h*.52,h*.27,.8);
    }
  } else if (['pipe-manifold','valve-box','pressure-gauges','hydraulic-accumulator','coolant-loop','air-filter','oxygen-locker'].includes(k)) {
    if(k==='air-filter') {
      panel(c,x,y,w,h,'#4a6060');for(let i=0;i<6;i++)line(c,[[x+7,y+7+i*(h-14)/6],[x+w-7,y+7+i*(h-14)/6]],'#162e33',3);
      line(c,[[x+5,y+h-5],[x+w-5,y+h-5]],'#8d9b8e');
    } else if(k==='hydraulic-accumulator'||k==='oxygen-locker') {
      for(let i=0;i<2;i++){const xx=x+w*(.25+i*.45);panel(c,xx-8,y+8,16,h-14,k==='oxygen-locker'?'#73817a':'#596764');
        c.fillStyle='#b9aa78';c.fillRect(xx-9,y+12,18,3);line(c,[[xx,y+8],[xx,y+3],[x+w/2,y+3]],'#627774',2);}
      line(c,[[x+6,y+h-3],[x+w-6,y+h-3]],'#40585a',3);
    } else {
      panel(c,x,y,w,h,'#2b4246');const count=k==='pressure-gauges'?3:2;
      for(let i=0;i<count;i++){const xx=x+w*(i+1)/(count+1);line(c,[[xx,y+h-4],[xx,y+6]],'#8b9383',4);
        if(k==='pressure-gauges')dial(c,xx,y+h*.42,Math.min(h*.24,w*.105),i*.3);
        else{c.strokeStyle=k==='coolant-loop'?'#809b98':'#a59a78';c.lineWidth=2;c.beginPath();c.arc(xx,y+h*.52,7,0,Math.PI*2);c.stroke();line(c,[[xx-7,y+h*.52],[xx+7,y+h*.52]],c.strokeStyle,2);}}
      line(c,[[x+5,y+h-6],[x+w-5,y+h-6]],'#627978',4);
    }
  } else if (['map-case','cargo-manifest','hazard-monitor','lab-sample-rack'].includes(k)) {
    panel(c,x,y,w,h,k==='cargo-manifest'?'#776f57':'#3d5555');
    c.fillStyle=k==='map-case'||k==='cargo-manifest'?'#a5ab91':'#10272b';c.fillRect(x+5,y+5,w-10,h-10);
    if(k==='hazard-monitor') {
      c.strokeStyle='#b4a16c';c.lineWidth=2;c.beginPath();c.moveTo(x+w/2,y+9);c.lineTo(x+w-13,y+h-10);c.lineTo(x+13,y+h-10);c.closePath();c.stroke();
      c.fillStyle='#b4a16c';c.fillRect(x+w/2-1,y+h*.42,2,h*.2);
    } else if(k==='lab-sample-rack') {
      for(let i=0;i<4;i++){panel(c,x+9+i*(w-16)/4,y+9,Math.max(5,(w-28)/4),h-18,'#71938d');c.fillStyle='#c0c8af';c.fillRect(x+9+i*(w-16)/4,y+9,Math.max(5,(w-28)/4),3);}
    } else {
      for(let i=0;i<4;i++)line(c,[[x+10,y+11+i*(h-20)/4],[x+w-12-(i%2)*12,y+11+i*(h-20)/4]],'#637b75');
      if(k==='map-case')line(c,[[x+12,y+h-12],[x+w*.34,y+h*.35],[x+w*.58,y+h*.65],[x+w-12,y+10]],'#3a6361',2);
      else{c.fillStyle='#314b4a';c.fillRect(x+w*.4,y+1,w*.2,5);}
    }
  } else if (['hygiene-dispenser','linen-cabinet','laundry-bins','muster-kit','flight-kit'].includes(k)) {
    const ww=Math.min(w*.76,h*.95),xx=x+(w-ww)/2;panel(c,xx,y,ww,h,'#68766d');
    if(k==='hygiene-dispenser'){panel(c,xx+5,y+7,ww-10,h*.42,'#b0b6a1');c.fillStyle='#1d383b';c.fillRect(xx+8,y+h*.7,ww-16,4);}
    else if(k==='laundry-bins'){for(let i=0;i<3;i++)line(c,[[xx+4,y+7+i*(h-10)/3],[xx+ww-4,y+7+i*(h-10)/3]],'#344c4e',2);}
    else {line(c,[[xx+ww/2,y+3],[xx+ww/2,y+h-3]],'#354c4d');c.fillStyle=k==='muster-kit'?'#b4a16c':'#9ca88c';c.fillRect(xx+ww*.3,y+h*.38,ww*.4,5);}
  } else {
    // Open shelves, restrained stores, tools and personal effects have
    // different silhouettes while sharing a real bolted load-bearing rail.
    const tools=['utensil-rail','coat-hooks','weapons-cleaning'].includes(k);
    line(c,[[x+3,y+7],[x+w-3,y+7]],'#778b83',3);
    if(tools)for(let i=0;i<4;i++){
      const xx=x+12+i*(w-24)/3;line(c,[[xx,y+7],[xx,y+h*.72],[xx+4,y+h*.72]],'#8d9b8d',k==='weapons-cleaning'?3:2);
      if(k==='utensil-rail'){c.strokeStyle='#95a18f';c.beginPath();c.arc(xx,y+h*.78,4,0,Math.PI*2);c.stroke();}
    }else{
      line(c,[[x+2,y+h-4],[x+w-2,y+h-4]],'#738b83',4);
      for(let i=0;i<3;i++){const xx=x+6+i*(w-10)/3,bw=(w-20)/3;
        panel(c,xx,y+h*.28,bw,h*.62,k==='medical-stock'?'#b3bba7':k==='animal-supply'?'#899176':'#647567');
        c.fillStyle=k==='ammo-shelf'?'#b6a16a':'#acb7a0';c.fillRect(xx+3,y+h*.38,bw-6,3);
        if(k==='parts-bins'||k==='ration-shelf')c.fillRect(xx+4,y+h*.7,bw-8,2);}
    }
  }
  return true;
}

export function drawHubRoomBatchDetailsV168(ctx, plan, {images=new Map()}={}) {
  if (!ctx || !plan) return null;
  const report={schema:168,roomId:plan.roomId,admitted:plan.items.length,painted:[],pending:[],
    omitted:plan.omitted.map(item=>({...item})),projection:plan.projection,
    projectionDxPerY:plan.projectionDxPerY,collidable:false,interactive:false};
  for(const item of plan.items){
    ctx.save();ctx.beginPath();const b=item.clearanceBounds;ctx.rect(b.x,b.y,b.w,b.h);ctx.clip();
    if(drawInstallation(ctx,item,images))report.painted.push({id:item.id,kind:item.kind,role:item.purpose,
      source:item.asset||null,sourceRect:item.source?{...item.source}:null,
      bounds:{...item.bounds},support:item.support,sector:item.sector});
    else report.pending.push(item.id);
    ctx.restore();
  }
  return report;
}
