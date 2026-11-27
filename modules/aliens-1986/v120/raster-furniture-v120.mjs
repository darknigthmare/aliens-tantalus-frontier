/* Four new images and the preserved V119 rack cover six explicit V114 bodies.
 * Presentation only: original geometry, actors, supports and saves are read,
 * never replaced or reordered in the simulation. Install after V119. */
import {createSpriteStoreV116} from '../v116/sprite-loader-v116.mjs';

const PLACEMENTS = new Map([
  ['v109-reserve/medical-counter', {id:'reserve-medical-counter',w:188,d:90,h:67}],
  ['v109-reserve/reserve-cabinet', {id:'utility-storage-cabinet',w:157,d:67,h:119}],
  ['v112-workshop/optics-bench', {id:'optics-workbench',w:184,d:83,h:65}],
  ['v112-workshop/optics-cabinet', {id:'utility-storage-cabinet',w:136,d:65,h:98}],
  ['v106-hadley/service-rack', {id:'operations-storage-rack',w:94,d:62,h:130}],
  ['v107-operations/ops-display', {id:'operations-display-bank',w:174,d:71,h:103}],
]);
const SUPPORTED_PROPS = new Map([
  ['v109-reserve/reserve-monitor', {bodyId:'medical-counter',type:'console'}],
  ['v112-workshop/optics-console', {bodyId:'optics-bench',type:'console'}],
]);

export function furnitureSelectionV120(body,world) {
  const scene=world?.scene;
  if (!body || !scene || !Array.isArray(scene.solids)) return null;
  const placement=PLACEMENTS.get(scene.id+'/'+body.id);
  if (!placement || body.visual!==undefined || body.material!==undefined ||
      !['x','z','w','d','h'].every(key=>Number.isFinite(body[key])) ||
      ['w','d','h'].some(key=>body[key]!==placement[key])) return null;
  const matching=scene.solids.filter(item=>item.id===body.id);
  if (matching.length!==1 || matching[0]!==body) return null;
  return {id:placement.id,width:body.w,height:body.h+body.d*.86};
}

function supportBody(prop,world) {
  const scene=world?.scene,placement=SUPPORTED_PROPS.get(scene?.id+'/'+prop?.id);
  if (!placement || prop.type!==placement.type || prop.bodyId!=null || prop.supportId!==placement.bodyId ||
      !Array.isArray(scene.props) || !Array.isArray(scene.solids) || !scene.props.includes(prop) ||
      scene.props.filter(item=>item.id===prop.id).length!==1) return null;
  const body=scene.solids.find(item=>item.id===placement.bodyId);
  if (!furnitureSelectionV120(body,world) || prop.elevation!==body.h ||
      !Number.isFinite(prop.x) || !Number.isFinite(prop.z) ||
      prop.x<body.x || prop.x>body.x+body.w || prop.z<body.z || prop.z>body.z+body.d) return null;
  return body;
}

function drawFurniture(renderer,body,selection,store) {
  const front=renderer.project({x:body.x+body.w/2,z:body.z+body.d});
  const rear=renderer.project({x:body.x+body.w/2,z:body.z});
  const height=body.h+front.y-rear.y;
  if (![front.x,front.y,rear.x,rear.y,height].every(Number.isFinite) || height<=0 ||
      Math.abs(front.x-rear.x)>.001) return false;
  // One uniform fit preserves source proportions and the measured floor pivot.
  // The reused V119 rack remains the same image at its second native placement.
  return store.draw(renderer.c,selection.id,{x:front.x,y:front.y,width:body.w,height});
}

export function installRasterFurnitureV120(Renderer,entries) {
  if (Renderer.prototype.rasterVersionV120===120) return Renderer;
  const previousRender=Renderer.prototype.render,previousBox=Renderer.prototype.box,previousProp=Renderer.prototype.prop;
  const contexts=new WeakMap();
  function sprites(renderer) {
    return renderer.rasterSpritesV116||(renderer.rasterSpritesV116=createSpriteStoreV116(entries));
  }
  function flush(renderer,context,body) {
    const pending=context.deferred.get(body);
    if (!pending) return;
    context.deferred.delete(body);
    for (const item of pending) {
      renderer.c.save();
      try {
        renderer.c.globalAlpha=Math.min(renderer.c.globalAlpha,item.alpha);
        previousProp.apply(renderer,item.args);
      } finally {renderer.c.restore();}
    }
  }
  Object.defineProperty(Renderer.prototype,'rasterVersionV120',{value:120});
  Renderer.prototype.rasterStatusV120=function(){return {...sprites(this).status(),extensionVersion:120};};
  Renderer.prototype.render=function(world,...args) {
    const parent=contexts.get(this),context={world,deferred:new Map(),drawn:new Set()};
    contexts.set(this,context);
    try {
      const result=previousRender.call(this,world,...args);
      // A foreign renderer skipping the admitted body must not lose a terminal.
      for (const body of [...context.deferred.keys()]) flush(this,context,body);
      return result;
    } finally {
      if (parent) contexts.set(this,parent);else contexts.delete(this);
    }
  };
  Renderer.prototype.box=function(body,palette) {
    const context=contexts.get(this),selection=context&&furnitureSelectionV120(body,context.world);
    if (!selection) return previousBox.call(this,body,palette);
    const store=sprites(this);
    if (!store.get(selection.id) || !drawFurniture(this,body,selection,store)) {
      const result=previousBox.call(this,body,palette);
      flush(this,context,body);
      return result;
    }
    context.drawn.add(body);
    flush(this,context,body);
  };
  Renderer.prototype.prop=function(prop,world,palette) {
    const context=contexts.get(this),body=context?.world===world&&supportBody(prop,world);
    if (body && !context.drawn.has(body)) {
      const selection=furnitureSelectionV120(body,world);
      if (sprites(this).get(selection.id)) {
        const pending=context.deferred.get(body)||[];
        pending.push({args:[prop,world,palette],alpha:this.c.globalAlpha});
        context.deferred.set(body,pending);
        return;
      }
    }
    return previousProp.call(this,prop,world,palette);
  };
  return Renderer;
}
