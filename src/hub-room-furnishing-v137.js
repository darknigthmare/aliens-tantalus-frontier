import { getHubSpatialPlanV136, hubSpatialPlacementClearV136 } from './hub-spatial-design-v136.js';
import { getHubRoomParallaxPlanV134, getHubRearEquipmentLayoutV134 } from './hub-room-parallax-v134.js';
import { HUB_ENVIRONMENT_ATLAS_V134 } from './hub-environment-atlas-v134.js';
import { HUB_PROP_ATLAS_V136, getHubPropAtlasCellV136 } from './hub-prop-atlas-v136.js';
import { HUB_FURNISHING_ATLAS_V137, getHubFurnishingCellV137 } from './hub-furnishing-atlas-v137.js';
import { getHubRoomIdentityReservationsV137 } from './hub-room-identity-v137.js';
import { getHubCirculationSolidReservationsV138 } from './hub-circulation-v137.js';
import { HUB_FURNISHING_CRITICAL_OVERRIDES_V138 } from './hub-furnishing-critical-v138.js';
import { HUB_FURNITURE_ATLAS_V139, getHubFurnitureCellV139 } from './hub-furniture-atlas-v139.js';
import { getHubFurnishingFootSourceV139, getHubFurnishingPlacementBoundsV139 } from './hub-furnishing-contact-v139.js';
import { getHubAnnexRuntimeGeometryV139 } from './hub-annex-runtime-geometry-v139.js';
import { reviseHubAnnexFurnishingsV139 } from './hub-furnishing-annex-revisions-v139.js';
import { getHubClinicalBayReservationsV139 } from './hub-clinical-bay-v139.js';
import { extendHubRoomFurnishingsV142 } from './hub-room-composition-v142.js';

const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
};
const overlap = (a,b) => a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
const finite = (value,fallback=0) => Number.isFinite(value) ? value : fallback;
const furnishing = (cell,x,width,role,{y=null,support='rear-floor',atlas=137}={}) => ({cell,x,width,role,y,support,atlas});
const wall = (cell,x,y,width,role,atlas=137) => furnishing(cell,x,width,role,{y,support:'rear-wall',atlas});
const equipment = (kind,x,width,height,role,{y=null,support='rear-floor'}={}) => ({kind,x,width,height,role,y,support});
const group = (task,items,replaceKinds=[]) => ({task,items,replaceKinds});

/** Local sockets describe a job, never a seeded scatter. Large silhouettes
 * belong to their native station. This layer supplies small related storage,
 * work surfaces and service fittings behind the standing walking plane. */
export const HUB_ROOM_FURNISHING_V137 = freeze(extendHubRoomFurnishingsV142({
  bridge: group('watch-seat-and-reference',[
    furnishing('seat-side',1027,40,'watch-officer-seat',{atlas:139}),wall('emergency-cabinet',1110,535,44,'bridge-fire-safety')
  ],['chair','chart-cart','case']),
  briefing: group('meeting-material-and-seating',[
    equipment('bench',660,88,36,'meeting-waiting-bench'),wall('emergency-cabinet',900,535,40,'briefing-fire-safety')
  ],['chair']),
  'combat-information': group('signal-service-and-watch-safety',[
    equipment('radio-rack',850,58,80,'signal-spare-receiver'),wall('emergency-cabinet',1120,535,40,'signal-fire-safety'),
    furnishing('seat-side',650,40,'tactical-watch-seat',{atlas:139})
  ],['handset','cable-spool']),
  'cryo-bay': group('stasis-service-and-emergency-oxygen',[
    equipment('cylinder',550,22,76,'stasis-oxygen-reserve'),wall('emergency-cabinet',650,535,40,'stasis-emergency-kit'),
    equipment('work-counter',715,56,46,'stasis-clean-linen-cart')
  ],['cable-run']), // The existing stasis manifold and reachable kit replace the loose line fragment.
  'crew-quarters': group('bolted-berth-and-personal-storage',[
    {...wall('crew-berth',440,376,154,'upper-crew-berth'),mountKindV139:'cantilever-berth'},
    wall('emergency-cabinet',1100,520,38,'quarters-fire-safety'),equipment('stool',1100,28,32,'crew-bedside-table')
  ],['shelf','stool']),
  mess: group('galley-return-and-shared-dining',[
    furnishing('galley-unit',565,166,'galley-return-counter'),furnishing('food-refrigerator',930,78,'chilled-drink-storage')
  ],['galley','chair']),
  medical: group('bedside-care-and-sterile-preparation',[
    equipment('medical-cabinet',490,58,106,'bedside-sterile-cabinet'),
    wall('sterile-cabinet',500,420,80,'bedside-preparation-supply',136),
    wall('emergency-cabinet',1110,470,38,'clinical-emergency-kit')
  ]),
  'science-lab': group('clean-preparation-and-sample-safety',[
    equipment('lab-bench',730,120,70,'sample-preparation-counter'),equipment('sample-fridge',200,54,106,'sample-cold-storage'),
    wall('emergency-cabinet',500,475,40,'laboratory-emergency-kit')
  ],['sample-fridge']),
  quarantine: group('decontamination-and-sealed-service',[
    equipment('medical-cabinet',500,58,106,'sealed-clean-storage'),wall('emergency-cabinet',1090,475,40,'containment-emergency-kit')
  ]),
  armory: group('secure-issue-and-inspection',[
    equipment('tool-chest',600,70,54,'armorer-service-chest'),wall('emergency-cabinet',950,535,40,'armory-fire-safety')
  ]),
  workshop: group('bench-stock-and-safe-repair',[
    equipment('tool-chest',575,68,62,'shop-service-chest'),wall('emergency-cabinet',710,535,40,'shop-fire-safety')
  ],['cylinder','cable-spool','parts-bin']),
  'vehicle-bay': group('inspection-supplies-outside-vehicle-bay',[
    wall('emergency-cabinet',820,372,40,'vehicle-fire-safety'),wall('service-conduits',600,250,146,'vehicle-service-feed')
  ]),
  'dropship-hangar': group('flight-safety-outside-aircraft-silhouette',[
    wall('emergency-cabinet',900,248,40,'hangar-fire-safety')
  ]),
  reactor: group('electrical-isolation-and-mechanical-feed',[
    wall('service-conduits',1020,275,170,'power-service-feed'),wall('emergency-cabinet',315,535,40,'electrical-fire-safety'),
    equipment('tool-chest',650,62,48,'reactor-service-chest')
  ]),
  'life-support': group('air-treatment-and-replaceable-filters',[
    wall('service-conduits',1060,260,146,'air-treatment-feed'),wall('emergency-cabinet',530,535,40,'air-service-emergency-kit'),
    equipment('work-counter',410,76,46,'air-filter-service-counter')
  ],['filter-stack']),
  'sensor-array': group('array-service-and-signal-spares',[
    wall('service-conduits',1030,265,146,'array-service-feed'),equipment('radio-rack',650,54,66,'array-spare-receiver')
  ],['case']),
  'arrival-airlock': group('clean-arrival-and-emergency-support',[
    wall('emergency-cabinet',400,535,42,'airlock-fire-safety'),equipment('bench',900,86,36,'arrival-equipment-bench')
  ]),
  logistics: group('classified-freight-and-handling-support',[
    equipment('cargo-rack',690,102,108,'classified-spare-freight'),wall('emergency-cabinet',1280,535,42,'freight-fire-safety')
  ]),
  'mire-archives': group('evidence-handling-and-reading-support',[
    equipment('chart-cart',680,62,46,'evidence-sorting-cart'),wall('emergency-cabinet',1270,535,42,'archive-fire-safety')
  ],['case']),
  'synthetic-bay': group('component-cleaning-and-repair-stock',[
    wall('emergency-cabinet',1530,535,42,'synthetic-fire-safety'),wall('service-conduits',1420,444,146,'synthetic-service-feed')
  ],['tool-board']),
  cctv: group('security-watch-and-recording-backup',[
    equipment('archive-rack',1250,70,108,'security-recording-backup'),wall('emergency-cabinet',1050,535,42,'security-fire-safety')
  ]),
  'proving-ground': group('range-safety-and-protective-stock',[
    wall('emergency-cabinet',1600,535,42,'range-emergency-kit')
  ]),
  morgue: group('forensic-preparation-and-clean-return',[
    equipment('medical-cabinet',700,58,106,'forensic-clean-storage'),wall('emergency-cabinet',1480,535,42,'forensic-emergency-kit')
  ]),
  'escape-pods': group('evacuation-readiness-and-reserves',[
    wall('emergency-cabinet',1530,535,44,'evacuation-emergency-kit'),equipment('bench',1100,80,36,'evacuation-ready-bench')
  ]),
  durandal: group('processor-cooling-and-safe-isolation',[
    wall('service-conduits',1020,260,160,'computer-cooling-feed'),wall('emergency-cabinet',1545,535,42,'computer-fire-safety')
  ]),
  bioforge: group('clean-entry-and-isolation-support',[
    wall('emergency-cabinet',1470,535,42,'biological-emergency-kit')
  ]),
  'animal-care': group('habitat-hygiene-and-emergency-stock',[
    wall('emergency-cabinet',1520,470,38,'habitat-emergency-kit'),
    equipment('work-counter',1000,74,46,'habitat-clean-preparation'),
    {...furnishing('wall-handwash',1070,40,'habitat-handwash',{support:'rear-wall',atlas:139}),workSurfaceHeightV139:52}
  ]),
  'frontier-civil-counter': group('waiting-comfort-and-emergency-access',[
    wall('emergency-cabinet',2330,535,42,'port-fire-safety'),wall('service-conduits',2350,350,146,'port-service-feed'),
    equipment('work-counter',1570,80,46,'civil-records-counter')
  ]),
  'personal-refuge': group('private-rest-and-reading',[
    {...wall('crew-berth',1350,450,154,'private-bolted-berth'),mountKindV139:'cantilever-berth'},
    equipment('stool',1170,42,32,'private-reading-table')
  ]),
  'flight-control-cockpit': group('flight-instruments-and-service-records',[
    equipment('radio-rack',350,60,106,'flight-spare-receiver'),equipment('chart-cart',560,62,46,'flight-checklist-cart'),
    equipment('capsule-readout',1005,84,50,'pilot-forward-instrument-console',{y:530,support:'rear-wall'}),
    wall('data-cabinet',350,405,80,'flight-instrument-records',136),
    wall('service-conduits',900,290,170,'flight-instrument-feed'),wall('emergency-cabinet',1110,535,42,'cockpit-fire-safety')
  ]),
  'galley-service': group('cold-storage-cleaning-and-preparation',[
    furnishing('food-refrigerator',550,88,'galley-cold-storage'),equipment('parts-bin',330,84,64,'dry-food-locker'),
    wall('galley-rack',700,475,84,'galley-clean-tableware',136),wall('galley-rack',1060,470,84,'galley-preparation-supplies',136),
    equipment('bin',1090,28,42,'galley-sorted-waste'),wall('emergency-cabinet',1050,535,42,'galley-fire-safety'),
    equipment('work-counter',680,110,46,'galley-preparation-counter')
  ]),
  'sanitary-bay': group('clean-linen-lockers-and-wet-service',[
    equipment('locker',370,54,106,'sanitary-personal-locker-west'),equipment('locker',500,54,106,'sanitary-personal-locker-east'),
    equipment('bin',730,30,42,'used-linen-hamper'),wall('sterile-cabinet',650,470,80,'sanitary-clean-linen',136),
    equipment('work-counter',640,74,48,'sanitary-clean-linen-counter'),
    wall('service-conduits',910,300,170,'sanitary-water-feed'),wall('emergency-cabinet',1100,535,42,'sanitary-emergency-kit')
  ]),
  'engine-room': group('mechanical-drive-service-and-isolation',[
    equipment('electrical-cabinet',330,70,112,'engine-drive-controller'),equipment('tool-chest',850,72,62,'engine-service-chest'),
    equipment('parts-bin',1270,86,64,'engine-spare-fittings'),equipment('cylinder',1760,24,76,'engine-service-cylinder'),
    wall('service-conduits',650,450,220,'engine-inlet-feed'),wall('service-conduits',1370,290,220,'engine-return-feed'),
    wall('tool-board',1350,490,72,'engine-service-tools',136),wall('emergency-cabinet',1720,535,42,'engine-fire-safety')
  ]),
  'water-recycling': group('filter-service-clean-spares-and-flow-control',[
    equipment('cylinder',350,24,76,'water-service-reservoir'),equipment('cylinder',430,24,76,'water-clean-reservoir'),
    equipment('tool-chest',590,68,62,'water-service-chest'),wall('sterile-cabinet',500,470,80,'water-clean-filter-stock',136),
    wall('service-conduits',900,443,146,'water-return-feed'),wall('emergency-cabinet',1100,535,42,'water-emergency-kit')
  ]),
  'maintenance-spine': group('through-route-distribution-and-service-stock',[
    equipment('tool-chest',380,70,62,'maintenance-west-service-chest'),equipment('parts-bin',1100,76,64,'maintenance-central-spares'),
    equipment('electrical-cabinet',1960,68,112,'maintenance-distribution-cabinet'),equipment('cable-spool',2130,42,42,'maintenance-cable-reserve'),
    wall('service-conduits',390,290,220,'maintenance-west-feed'),wall('service-conduits',1120,290,220,'maintenance-center-feed'),
    wall('service-conduits',2110,290,220,'maintenance-east-feed'),wall('tool-board',2175,465,72,'maintenance-east-tools',136),
    wall('emergency-cabinet',620,535,42,'maintenance-west-emergency-kit'),wall('emergency-cabinet',2240,535,42,'maintenance-east-emergency-kit')
  ])
}));

/** Reserve the complete camera drift, not only the current screenshot. A small
 * cabinet must never be pasted onto the monitors/pipes of a rear equipment bay. */
export function getHubRearEquipmentReservationsV137(room, options={}) {
  const clip=room.id==='personal-refuge'?{x:finite(room.xStart),y:334,w:room.world.width,h:270}:null;
  const model=getHubRoomParallaxPlanV134(room,finite(room.xStart),{enabled:false,clip});
  if(!model)return [];
  const atlas={complete:true,naturalWidth:HUB_ENVIRONMENT_ATLAS_V134.width,naturalHeight:HUB_ENVIRONMENT_ATLAS_V134.height};
  return getHubRearEquipmentLayoutV134(room,model,atlas,options).map(({target,driftEnvelope})=>{
    const bounds=driftEnvelope||{...target,x:target.x-40,w:target.w+80};
    return{x:bounds.x-4,y:bounds.y-4,w:bounds.w+8,h:bounds.h+14,role:'rear-equipment-drift-envelope'};
  });
}

function materialize(definition,spatial) {
  const x=spatial.bounds.x+definition.x,support=definition.support;
  let entry;
  if(definition.cell){
    const cell=definition.atlas===139?getHubFurnitureCellV139(definition.cell):definition.atlas===136?getHubPropAtlasCellV136(definition.cell):getHubFurnishingCellV137(definition.cell);
    if(!cell)return null;
    const w=Math.min(definition.width,cell.source.w,definition.atlas===139?cell.width:Infinity),scale=w/cell.source.w,h=cell.source.h*scale;
    const footSourceY=getHubFurnishingFootSourceV139(definition.atlas,cell),surfaceSource=definition.usefulSurfaceSourceV139||cell.usefulSurfaceSource;
    const y=definition.y??(definition.workSurfaceHeightV139!=null&&surfaceSource
      ?spatial.planes.rearServiceY-definition.workSurfaceHeightV139-surfaceSource.y*scale
      :spatial.planes.rearServiceY-footSourceY*scale);
    entry={kind:'bitmap',cell:cell.id,asset:definition.atlas===139?HUB_FURNITURE_ATLAS_V139.asset:definition.atlas===136?HUB_PROP_ATLAS_V136.asset:HUB_FURNISHING_ATLAS_V137.asset,
      source:{...cell.source},x:x-w/2,y,w,h,footSourceYV139:footSourceY,contactYV139:y+footSourceY*scale,
      artProjectionV139:cell.projection||'original-measured-sprite'};
    if(surfaceSource){const b={x:entry.x+surfaceSource.x*scale,y:entry.y+surfaceSource.y*scale,w:surfaceSource.w*scale,h:surfaceSource.h*scale};
      entry.usefulSurfaceV139={id:`${definition.role}-useful-surface`,kind:surfaceSource.kind||'worktop',bounds:b,supportY:b.y,
        side:'visible-front',occupied:[],sourceStatus:'measured-original-source-surface'};}
  }else{
    entry={kind:definition.kind,x:x-definition.width/2,y:definition.y??spatial.planes.rearServiceY-definition.height,
      w:definition.width,h:definition.height,contactYV139:spatial.planes.rearServiceY,cleanSurfaceV139:!!definition.cleanSurfaceV139};
  }
  if(definition.mountKindV139==='cantilever-berth')entry.mountBoundsV139={x:entry.x,y:entry.y-6,w:entry.w,h:entry.h+24};
  if(definition.mountKindV142==='floor-pedestal-console'){
    entry.mountBoundsV139={x:entry.x,y:entry.y,w:entry.w,h:spatial.planes.rearServiceY-entry.y};
    entry.consoleSupportV142={kind:'floor-pedestal',footY:spatial.planes.rearServiceY,
      panelBottomY:entry.y+entry.h,projection:'strict-side-elevation'};
  }
  return {...entry,role:definition.role,support,plane:'rear',collidable:false,interactive:false,
    mirroredV139:!!definition.mirroredV139,mountKindV139:definition.mountKindV139||null,
    ...(definition.mountKindV142?{mountKindV142:definition.mountKindV142}:{}),
    furnishingV137:true,perspective:spatial.projection.kind,projectionDxPerY:spatial.projection.dxPerY};
}

/** Open rails may occlude a rear-wall fitting; a solid deck or wall console
 * cannot pass through it. Reserve both depth settings from the actual renderer. */
export function getHubFurnishingStructuralReservationsV138(room,options={}){
  const result=[],seen=new Set();
  for(const platform of options.platforms||room.platforms||[]){
    if(!room.world&&platform.roomId!==room.id)continue;
    for(const depthEnabled of [true,false])for(const bounds of getHubCirculationSolidReservationsV138(platform,{
      room,ladders:options.ladders||room.ladders||[],vents:options.vents||room.vents||[],
      platforms:options.platforms||room.platforms||[],centeredLadders:!room.world,depthEnabled
    })){
      const key=[bounds.x,bounds.y,bounds.w,bounds.h,bounds.role].join(':');
      if(!seen.has(key)){seen.add(key);result.push(bounds);}
    }
  }
  return result;
}

export function enrichHubRoomCompositionV137(room, basePlan=null, options={}) {
  room=getHubAnnexRuntimeGeometryV139(room);
  // The explicit override is also used by authoring review to evaluate a
  // complete proposed group against the live native geometry before saving it.
  const originalDefinition=HUB_ROOM_FURNISHING_V137[room?.id];
  const definition=originalDefinition&&reviseHubAnnexFurnishingsV139(room,
    {...originalDefinition,...HUB_FURNISHING_CRITICAL_OVERRIDES_V138[room?.id],...options.furnishingDefinition});
  if(!definition)return basePlan;
  const spatial=getHubSpatialPlanV136(room,{...options,platforms:[]});
  if(!spatial)return basePlan;
  const equipmentReservations=getHubRearEquipmentReservationsV137(room,options);
  const identityReservations=getHubRoomIdentityReservationsV137(room,options);
  const structuralReservations=getHubFurnishingStructuralReservationsV138(room,options);
  const plan={...spatial,reservations:[...spatial.reservations,...equipmentReservations,...identityReservations,...structuralReservations,...getHubClinicalBayReservationsV139(room)]};
  const legacyOmissionsV138=[...basePlan?.legacyOmissionsV138||[]];
  const items=(basePlan?.items||[]).filter(item=>{
    const replaced=definition.replaceKinds.includes(item.kind);
    const accepted=!replaced&&hubSpatialPlacementClearV136(getHubFurnishingPlacementBoundsV139(item),plan,{margin:3});
    if(!accepted)legacyOmissionsV138.push({kind:item.kind,role:item.role,
      bounds:{x:item.x,y:item.y,w:item.w,h:item.h},reason:replaced?'replaced-by-reviewed-functional-group':'native-or-architectural-clearance',
      task:definition.task,reservations:plan.reservations.filter(reservation=>overlap(item,reservation)).map(reservation=>reservation.role)});
    return accepted;
  });
  const added=[],rejected=[];
  for(const source of definition.items){
    const entry=materialize(source,plan);
    if(!entry||!hubSpatialPlacementClearV136(getHubFurnishingPlacementBoundsV139(entry),plan,{margin:3})||items.some(item=>overlap(item,entry))){
      rejected.push({role:source.role,bounds:entry&&{x:entry.x,y:entry.y,w:entry.w,h:entry.h}});continue;
    }
    items.push(entry);added.push(entry);
  }
  const supplies=(basePlan?.supplies||[]).filter(entry=>items.includes(entry));
  const linkDefinition={ 'engine-room':{role:'engine-inlet-feed',input:.74},'water-recycling':{role:'water-return-feed',input:.76} }[room.id];
  const feed=linkDefinition&&added.find(item=>item.role===linkDefinition.role),station=room.station?.bounds;
  const links=feed&&station?[{role:`${room.id}-connected-feed`,from:feed.role,to:room.station.id,
    points:[[station.x+station.w*linkDefinition.input,feed.y+feed.h-7],[station.x+station.w*linkDefinition.input,station.y+16]],
    plane:'rear-service',collidable:false,interactive:false}]:[];
  if(room.id==='flight-control-cockpit'){
    const feed=added.find(item=>item.role==='flight-instrument-feed'),console=added.find(item=>item.role==='pilot-forward-instrument-console');
    if(feed&&console){const x=feed.x+feed.w*.94;links.push({role:'cockpit-linked-instruments',from:feed.role,to:console.role,
      points:[[x,feed.y+feed.h-7],[x,console.y+12]],plane:'rear-service',collidable:false,interactive:false});}
  }
  return {...basePlan,schema:137,roomId:room.id,task:definition.task,theme:basePlan?.theme||room.theme||'industrial',
    accent:basePlan?.accent||'#97aaa0',start:plan.bounds.x,width:plan.bounds.w,
    floorY:plan.planes.walkY,top:plan.planes.ceilingY,items,supplies,spatial:plan,legacyOmissionsV138,
    furnishingV137:{task:definition.task,added:added.map(item=>({role:item.role,cell:item.cell||null,
      bounds:{x:item.x,y:item.y,w:item.w,h:item.h},support:item.support,
      ...(item.consoleSupportV142?{consoleSupportV142:{...item.consoleSupportV142},mountBoundsV139:{...item.mountBoundsV139}}:{})})),rejected,
      rearEquipmentReservations:equipmentReservations,structuralReservations,links,authored:true},
    collidable:false,interactive:false,gameplayPlane:'2d',sourceStatus:'authored-task-groups-and-original-separated-ship-furnishings'};
}

/** Rear-mounted furnishings need a visible attachment. These narrow supports
 * sit under their own object; they never become floor-to-ceiling foreground posts. */
export function drawHubFurnishingMountsV137(ctx,composition) {
  if(!ctx||!composition?.furnishingV137)return;
  ctx.save();
  for(const link of composition.furnishingV137.links){
    for(const [color,width]of [['#122b2e',7],['#5c7772',4],['#8a9a88',1]]){
      ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();
      link.points.forEach(([x,y],index)=>index?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();
    }
    const [[x,startY],[,endY]]=link.points;
    for(let y=startY+9;y<endY-5;y+=58){
      ctx.fillStyle='#38514e';ctx.fillRect(x-5,y,10,4);ctx.fillStyle='#a19d78';ctx.fillRect(x-4,y+1,8,1);
    }
  }
  for(const entry of composition.items.filter(item=>item.furnishingV137)){
    const {x,y,w,h}=entry;
    if(entry.support==='rear-floor'){
      ctx.fillStyle='rgba(1,8,10,.5)';
      if(entry.projectionDxPerY===0)ctx.fillRect(x,(entry.contactYV139??y+h)-1,w,1);
      else{ctx.beginPath();ctx.ellipse(x+w/2,(entry.contactYV139??y+h)-1,w*.49,3,0,0,Math.PI*2);ctx.fill();}
    }else if(entry.mountKindV139==='cantilever-berth'){
      // Two bolted wall plates and steel gussets distinguish this berth from
      // a bed resting on cut-off legs in front of a distant wall light.
      for(const bx of [x+14,x+w-24]){
        ctx.fillStyle='#243e42';ctx.fillRect(bx-4,y-6,8,h+18);
        ctx.fillStyle='#8c9b8c';for(const by of [y-3,y+h+8])ctx.fillRect(bx-1,by,2,2);
        ctx.fillStyle='#344f52';ctx.beginPath();ctx.moveTo(bx,y+h-2);ctx.lineTo(bx,y+h+18);ctx.lineTo(bx+18,y+h-2);ctx.closePath();ctx.fill();
        ctx.strokeStyle='#708881';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(bx,y+h+17);ctx.lineTo(bx+17,y+h-1);ctx.stroke();
      }
      ctx.fillStyle='#405c60';ctx.fillRect(x+5,y+h-3,w-10,5);
    }else if(entry.consoleSupportV142?.kind==='floor-pedestal'){
      const footY=entry.consoleSupportV142.footY,panelBottomY=entry.consoleSupportV142.panelBottomY;
      const columnW=Math.max(12,Math.min(28,w*.38)),columnX=x+(w-columnW)/2;
      ctx.fillStyle='#172b2e';ctx.fillRect(columnX,panelBottomY-1,columnW,Math.max(0,footY-panelBottomY+1));
      ctx.fillStyle='#58716d';ctx.fillRect(columnX+1,panelBottomY,columnW-2,Math.max(0,footY-panelBottomY-5));
      ctx.fillStyle='#2c4446';ctx.fillRect(columnX+4,panelBottomY+2,Math.max(1,columnW-8),Math.max(0,footY-panelBottomY-9));
      ctx.fillStyle='#263d40';ctx.fillRect(x+6,footY-5,w-12,5);
      ctx.fillStyle='#82918a';ctx.fillRect(x+7,footY-5,w-14,1);
    }else{
      ctx.fillStyle='#172d31';ctx.fillRect(x+3,y+h-2,w-6,4);
      ctx.fillStyle='#536a66';ctx.fillRect(x+5,y+h-1,w-10,1);
      for(const bx of [x+w*.17,x+w*.83]){
        ctx.fillStyle='#263e41';ctx.fillRect(bx-2,y+h-2,4,8);
        ctx.fillStyle='#8a9a8d';ctx.fillRect(bx-1,y+h+1,1,1);
      }
    }
  }
  ctx.restore();
}
