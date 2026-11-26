/* Static raster keys augment the preserved V114 simulation.
   A change of key (idle / walk / gesture) is not a completed animation cycle. */
import {createSpriteStoreV116} from './sprite-loader-v116.mjs';
const PEOPLE = new Set(['ripley','hicks','hudson','newt','bishop','vasquez','drake','apone','gorman','burke','ferro','spunkmeyer','dietrich','frost','crowe','wierzbowski']);
const UNARMED = new Set(['newt','bishop','burke','gorman','ferro','spunkmeyer']);
const WEAPONS = {pulse:'m41a-pulse-rifle',launcher:'m41a-pulse-rifle',shotgun:'hicks-shotgun',flame:'m240-incinerator',smartgun:'m56-smartgun',pistol:'vp70-pistol',grenade:'m40-grenade',knife:'combat-knife'};
const WEAPON_WIDTH = {pulse:61,launcher:61,shotgun:61,flame:66,smartgun:87,pistol:21,grenade:8,knife:26};
const identity = actor => actor.appearanceId || actor.id;
const isGateway = world => String(world.scene.id).startsWith('v114-gateway');
const clamp = x => Math.max(0,Math.min(1,x));
const first = (store,ids) => ids.find(id=>id && store.has(id)) || null;
const text = (c,value,x,y,color='#d4d6bd') => {c.fillStyle=color;c.font='600 9px ui-monospace,Consolas,monospace';c.textAlign='center';c.fillText(value,x,y);};
const ellipse = (c,x,y,rx,ry,color) => {c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();};
export function humanAssetIdV116(store,actor,world,session,{moving=false}={}) {
  const id=identity(actor);
  if (!PEOPLE.has(id)) return null;
  if (!actor.alive) return first(store,[id+'-death-right']);
  if (id==='ripley' && isGateway(world)) return first(store,['ripley-gateway']);
  const interacting=actor.kind==='player' && session?.action;
  return first(store,[interacting?id+'-interact-right':null,!interacting&&(moving||actor.route?.length)?id+'-walk-right':null,id+'-idle-right']);
}
export function creatureAssetIdV116(store,actor) {
  const role=actor.role==='facehugger'?'facehugger':actor.role==='queen'?'queen':actor.role==='chestburster'?'chestburster':'warrior';
  if (!actor.alive) return first(store,[role+'-death-right']);
  return first(store,[actor.phase==='windup'?role+'-attack-right':null,actor.route?.length?role+'-walk-right':null,role+'-idle-right']);
}
export function propSelectionV116(prop,world,session) {
  const room=world.scene.id, type=prop.type;
  if (prop.id==='service-crate' && room==='v107-service') return null;
  if (type==='supply') {
    const used=session?.logistics?.collected?.includes(prop.stockId),medical=prop.stockId?.includes('medical');
    return {ids:used?[medical?'supply-case-medical-empty':'supply-case-ammo-empty']:[medical?'supply-case':'supply-case-ammo-closed','supply-case'],height:44,width:76,label:used?'VIDE':medical?'SECOURS':'RÉSERVE'};
  }
  if (type==='armament-case') return {ids:[session?.arsenal?.collected?.includes(prop.arsenalId)?'armament-case-open':'armament-case-closed'],height:46,width:83,label:session?.arsenal?.collected?.includes(prop.arsenalId)?'VIDE':'M240 / M41A-GL'};
  if (type==='beacon-case') return {ids:[session?.beacons?.collected?'beacon-case':'beacon-case-closed'],height:62,width:82,label:session?.beacons?.collected?'BALISES · VIDE':'SECOURS · 4 BALISES'};
  if (type==='meal') return {ids:[room.startsWith('v114-sulaco')?'meal-tray-food':'meal-tray'],height:15,width:51};
  if (type==='display' && !/apc|dropship/.test(room)) return null;
  if (['display','console','flight-console'].includes(type)) return {ids:[room.includes('apc')?'apc-monitors':room.includes('dropship')||type==='flight-console'?'flight-console':'operations-console'],height:type==='console'?74:85,width:type==='console'?104:132};
  const definitions = {
    'gun-rack':['gun-rack',124,208],'smartgun-bench':['smartgun-bench',35,208],smartgun:['smartgun-bench',35,208],
    'armor-rack':['armor-rack',132,115],cryo:['cryopod-sulaco',91,83],
    resin:['resin-column',132,98],ovipositor:['ovipositor',110,238],cocoon:['colonist-cocoon',128,92],
    eggs:['egg-cluster',65,164],'egg-cluster':['egg-cluster',65,164],egg:['egg-closed',52,46],
    photo:['gateway-photo',30,27],pillow:[room.startsWith('v114-gateway')?'gateway-pillow':'cryo-pillow',19,47],
    knife:['combat-knife',10,31],drain:['drain-grate',37,132],grate:['drain-grate',37,132],
    tug:['industrial-tug',96,172],tank:['specimen-jar',116,55],loader:['p5000-right',152,175],
    'ammo-case':['supply-case',28,68],cargo:['cargo-crate',73,113],crate:['cargo-crate',73,113],lamp:['wall-light',17,60],
    pipe:['industrial-pipe',178,76],alarm:['alarm-unit',99,66]
  };
  const d=definitions[type];
  return d?{ids:[d[0]],height:d[1],width:d[2],offsetY:type==='lamp'?-174:0}:null;
}
function shadow(c,p,r=23) {ellipse(c,p.x,p.y+3,r,6,'#00000068');}
function drawHuman(renderer,actor,world,store,fallbackWeapon,moving=false) {
  const id=humanAssetIdV116(store,actor,world,renderer.session,{moving});
  if (!id || !store.get(id)) return false;
  const person=identity(actor),p=renderer.project(actor),height=person==='newt'?66:101,flip=(actor.facing||1)<0,c=renderer.c;
  shadow(c,p,person==='newt'?17:23);
  store.draw(c,id,{x:p.x,y:p.y,height,flip});
  const session=renderer.session,asset=store.asset(id);
  let weapon=session?.arsenal?.selected?.[actor.id];
  if (!weapon) weapon=['vasquez','drake'].includes(person)?'smartgun':['dietrich','frost'].includes(person)?'flame':'pulse';
  const armed=actor.alive && !UNARMED.has(person) && !isGateway(world) && !asset.heldWeapon && !(actor.kind==='player' && session?.action) && WEAPONS[weapon];
  if (armed) {
    const weaponId=WEAPONS[weapon],record=store.get(weaponId),handX=p.x+(flip?-12:12),handY=p.y-43;
    if (record) {
      const [l,t,r,b]=record.asset.bbox;
      store.draw(c,weaponId,{x:handX,y:handY,width:WEAPON_WIDTH[weapon],flip,pivot:[l+(r-l)*.28,t+(b-t)*.63]});
    } else if (fallbackWeapon) fallbackWeapon(c,weapon,handX,handY,weapon==='smartgun'?.65:.63,flip?-1:1,actor.ammo??null);
  }
  if (actor.kind==='player') {c.strokeStyle='#d3dcbd';c.lineWidth=1.2;c.beginPath();c.ellipse(p.x,p.y+3,23,7,0,0,Math.PI*2);c.stroke();}
  return true;
}
function drawCreature(renderer,actor,world,store) {
  const id=creatureAssetIdV116(store,actor);
  if (!id || !store.get(id)) return false;
  const role=actor.role==='facehugger'?'facehugger':actor.role==='queen'?'queen':actor.role==='chestburster'?'chestburster':'warrior';
  const baseId=role+'-idle-right';
  if(store.has(baseId) && !store.get(baseId))return false;
  const asset=store.asset(id),base=store.asset(baseId)||asset;
  const standingHeight={facehugger:33,warrior:118,queen:219,chestburster:31}[role];
  // Preserve source scale across keys, so a horizontal death image is not stretched to standing height.
  const scale=standingHeight/(base.bbox[3]-base.bbox[1])*Math.max(base.width,base.height)/Math.max(asset.width,asset.height);
  const height=(asset.bbox[3]-asset.bbox[1])*scale,p=renderer.project(actor),c=renderer.c;
  const player=world.actors.find(a=>a.kind==='player'),target=actor.aim?.x??player?.x??(actor.x+1),flip=(actor.facing||Math.sign(target-actor.x)||1)<0;
  let pivot=asset.pivot;
  // Existing long-tail reference PNGs locate the feet to the right of the overall bounds.
  if (id==='warrior-idle-right' && asset.width===1536 && asset.height===1024) pivot=[1090,asset.bbox[3]];
  if (id==='facehugger-idle-right' && asset.width===1774 && asset.height===887) pivot=[1080,asset.bbox[3]];
  shadow(c,p,role==='facehugger'?17:role==='queen'?43:29);
  store.draw(c,id,{x:p.x,y:p.y,height,flip,pivot});
  if (actor.alive) {
    const pressure=renderer.session?.engineering?.attacks?.[actor.id];
    if (pressure) {c.strokeStyle=pressure.phase==='windup'?'#e7b477':'#778981';c.lineWidth=2;c.beginPath();c.arc(p.x,p.y,31,Math.PI,Math.PI+Math.PI*Math.max(.1,pressure.phase==='windup'?1-pressure.remaining/.8:0));c.stroke();if(pressure.phase==='windup')text(c,'FRAPPE DU SAS',p.x,p.y-125,'#d5ab7d');}
    if (actor.phase==='windup') {c.strokeStyle='#db956b';c.lineWidth=2;c.beginPath();c.arc(p.x,p.y,27,Math.PI,Math.PI+Math.PI*Math.max(.1,actor.clock/.65));c.stroke();}
  }
  return true;
}
function drawSentry(renderer,actor,store) {
  if (!actor.alive) return false;
  const session=renderer.session,turn=session?.action?.kind==='sentry-orient'&&session.action.id===actor.id,angle=session?.tactics?.sentries?.[actor.id]?.angle??0;
  // A single side image cannot truthfully depict arbitrary turret headings.
  if (turn || Math.abs(Math.sin(angle))>.05 || !store.get('sentry-idle-right')) return false;
  const p=renderer.project(actor);shadow(renderer.c,p,27);
  return store.draw(renderer.c,'sentry-idle-right',{x:p.x,y:p.y,height:75,flip:Math.cos(angle)<0});
}
function drawProp(renderer,prop,world,pal,store) {
  const selection=propSelectionV116(prop,world,renderer.session);
  if (!selection) return false;
  const id=first(store,selection.ids);
  if (!id || !store.get(id)) return false;
  const body=world.scene.solids.find(b=>b.id===prop.bodyId),position=renderer.project(body?{x:prop.x,z:body.z+body.d}:prop),x=position.x,y=position.y-(prop.elevation||0)+(selection.offsetY||0),c=renderer.c;
  const alpha=prop.type==='lamp'&&world.circuits[prop.circuit]===false?.4:1;
  store.draw(c,id,{x,y,height:selection.height,width:selection.width,alpha});
  if (selection.label) text(c,selection.label,x,y-selection.height-10);
  const action=renderer.session?.action;
  if (prop.type==='supply' && action?.id===prop.stockId) {c.fillStyle='#172b21';c.fillRect(x-32,y+8,64,5);c.fillStyle='#d9d7a1';c.fillRect(x-32,y+8,64*clamp(action.elapsed/action.duration),5);}
  if (prop.type==='alarm') {
    const alarm=renderer.session?.logistics?.alarms?.[prop.alarmId],active=alarm?.remaining>0;
    text(c,active?'TEST ACTIF':alarm?.cooldown>0?Math.ceil(alarm.cooldown)+' s':'E · DIAGNOSTIC',x,y+15);
    if (active) {c.strokeStyle='#d4b776';c.lineWidth=2;c.beginPath();c.arc(x,y-85,21,0,Math.PI*2);c.stroke();}
  }
  return true;
}
function drawDoorSurface(renderer,door,world,store) {
  if (world.doors[door.id]?.open || !store.get('door-leaf')) return;
  const p=renderer.project({x:door.x,z:door.z+door.d}),back=renderer.project(door),height=door.h||170,top=back.y-height,c=renderer.c;
  // Fit only the established physical face; jambs and collision dimensions remain V114.
  store.surface(c,'door-leaf',{x:p.x+2,y:top+2,width:Math.max(1,door.w-4),height:p.y-top-4});
  const action=renderer.session?.action,active=action?.id===door.id&&action?.roomId===world.scene.id;
  if (active) {c.fillStyle='#071b12';c.fillRect(p.x-10,p.y-21,Math.max(50,door.w+20),9);c.strokeStyle='#839272';c.strokeRect(p.x-10,p.y-21,Math.max(50,door.w+20),9);c.fillStyle='#d7cb9c';c.fillRect(p.x-8,p.y-19,Math.max(48,door.w+16)*clamp(action.elapsed/action.duration),5);}
}
function hatchSurface(renderer,box,{structural,linkOpen,opening},store) {
  const id=first(store,[structural?.breached?'door-leaf-breached':structural?.brace>0?'door-leaf-reinforced':structural?.hp<100?'door-leaf-damaged':null,'door-leaf']);
  if (!id || !store.get(id) || linkOpen&&!structural?.breached) return false;
  const a=renderer.project(box),b=renderer.project({x:box.x+box.w,z:box.z+box.d}),top=a.y-box.h,c=renderer.c;
  if (linkOpen) {
    // Damage may mark the jambs, never cover an open traversable aperture.
    c.save();c.beginPath();c.rect(a.x-4,top,5,b.y-top);c.rect(b.x-1,top,5,b.y-top);c.clip();
    const drawn=store.surface(c,id,{x:a.x-4,y:top,width:box.w+8,height:b.y-top});c.restore();return drawn;
  }
  const progress=opening?clamp(renderer.session.action.elapsed/renderer.session.action.duration):0;
  return store.surface(c,id,{x:a.x+1,y:top+1,width:Math.max(1,box.w-2),height:Math.max(1,b.y-top-box.h*progress-2)});
}
export function installRasterRendererV116(Renderer,entries,{fallbackWeapon=null} = {}) {
  if (Renderer.prototype.rasterVersionV116===116) return Renderer;
  const actor=Renderer.prototype.actor,prop=Renderer.prototype.prop,door=Renderer.prototype.door;
  const positions=new WeakMap();
  function playerMoved(renderer,a,world) {
    if(a.kind!=='player')return false;
    let samples=positions.get(renderer);
    if(!samples){samples=new WeakMap();positions.set(renderer,samples);}
    const previous=samples.get(a);
    samples.set(a,{x:a.x,z:a.z,roomId:world.scene.id});
    return Boolean(previous && previous.roomId===world.scene.id && Math.hypot(a.x-previous.x,a.z-previous.z)>.01);
  }
  function sprites(renderer) {return renderer.rasterSpritesV116||(renderer.rasterSpritesV116=createSpriteStoreV116(entries));}
  Object.defineProperty(Renderer.prototype,'rasterVersionV116',{value:116});
  Renderer.prototype.rasterStatusV116=function(){return sprites(this).status();};
  Renderer.prototype.actor=function(a,world){
    const moving=playerMoved(this,a,world),store=sprites(this),drawn=a.role==='sentry'?drawSentry(this,a,store):a.kind==='enemy'?drawCreature(this,a,world,store):drawHuman(this,a,world,store,fallbackWeapon,moving);
    if (!drawn) return actor.call(this,a,world);
  };
  Renderer.prototype.prop=function(p,world,pal){if(!drawProp(this,p,world,pal,sprites(this)))return prop.call(this,p,world,pal);};
  Renderer.prototype.door=function(d,world,pal){door.call(this,d,world,pal);drawDoorSurface(this,d,world,sprites(this));};
  Renderer.prototype.rasterHatchSurfaceV116=function(box,state){return hatchSurface(this,box,state,sprites(this));};
  return Renderer;
}
