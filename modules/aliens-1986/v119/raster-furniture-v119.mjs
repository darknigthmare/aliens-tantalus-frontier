/* Six furniture images cover seven explicitly identified V114 bodies.
 * This layer changes presentation only. Physical boxes, depth sorting of
 * actors, supports, coordinates and saves remain owned by V114. */
import {createSpriteStoreV116} from '../v116/sprite-loader-v116.mjs';

const PLACEMENTS = new Map([
  ['v106-medlab/bed-west', {id:'medlab-bed',w:160,d:74,h:42,material:'medical'}],
  ['v106-medlab/bed-east', {id:'medlab-bed',w:145,d:82,h:42,material:'medical'}],
  ['v106-medlab/med-cabinet', {id:'medlab-storage-cabinet',w:94,d:83,h:124,material:'medical'}],
  ['v109-reserve/service-locker', {id:'reserve-service-locker',w:110,d:91,h:128}],
  ['v107-operations/ops-rack', {id:'operations-storage-rack',w:133,d:75,h:126}],
  ['v114-sulaco-mess/v114-sulaco-mess-body-0', {id:'sulaco-mess-table',w:238,d:85,h:49,material:'metal'}],
  ['v107-operations/ops-table', {id:'operations-command-table',w:238,d:93,h:49}],
]);
const SUPPORTED_PROPS = new Map([
  ['v114-sulaco-mess/v114-sulaco-mess-prop-0', {bodyId:'v114-sulaco-mess-body-0',type:'meal'}],
  ['v114-sulaco-mess/v114-sulaco-mess-prop-1', {bodyId:'v114-sulaco-mess-body-0',type:'knife'}],
  ['v107-operations/ops-screen', {bodyId:'ops-table',type:'console'}],
]);

export function furnitureSelectionV119(body,world) {
  const scene=world?.scene;
  if (!body || !scene || !Array.isArray(scene.solids)) return null;
  const placement=PLACEMENTS.get(scene.id+'/'+body.id);
  if (!placement || body.visual || body.material!==placement.material ||
      !['x','z','w','d','h'].every(key=>Number.isFinite(body[key])) ||
      ['w','d','h'].some(key=>body[key]!==placement[key])) return null;
  // A colliding name in another body or room cannot opt into this presentation.
  const matching=scene.solids.filter(item=>item.id===body.id);
  if (matching.length!==1 || matching[0]!==body) return null;
  return {id:placement.id,width:body.w,height:body.h+body.d*.86};
}

function supportBody(prop,world) {
  const scene=world?.scene,placement=SUPPORTED_PROPS.get(scene?.id+'/'+prop?.id);
  if (!placement || prop.type!==placement.type || prop.bodyId || prop.supportId!==placement.bodyId ||
      !Array.isArray(scene.props) || !scene.props.includes(prop)) return null;
  const body=scene.solids.find(item=>item.id===placement.bodyId);
  if (!furnitureSelectionV119(body,world) || prop.elevation!==body.h ||
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
  // A single uniform scale fits the measured alpha bounds in the native
  // projected envelope. Never stretch one axis, crop furniture, move a collider
  // or turn a medical cabinet into a bed because both have medical material.
  return store.draw(renderer.c,selection.id,{x:front.x,y:front.y,width:body.w,height});
}

export function installRasterFurnitureV119(Renderer,entries) {
  if (Renderer.prototype.rasterVersionV119===119) return Renderer;
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
        // Furniture and its small attachments share the native occlusion fade.
        renderer.c.globalAlpha=Math.min(renderer.c.globalAlpha,item.alpha);
        previousProp.apply(renderer,item.args);
      } finally {renderer.c.restore();}
    }
  }
  Object.defineProperty(Renderer.prototype,'rasterVersionV119',{value:119});
  Renderer.prototype.rasterStatusV119=function(){return {...sprites(this).status(),extensionVersion:119};};
  Renderer.prototype.render=function(world,...args) {
    const parent=contexts.get(this),context={world,deferred:new Map(),drawn:new Set()};
    contexts.set(this,context);
    try {
      const result=previousRender.call(this,world,...args);
      // A foreign renderer that skips a body must not lose a queued attachment.
      for (const body of [...context.deferred.keys()]) flush(this,context,body);
      return result;
    } finally {
      if (parent) contexts.set(this,parent);else contexts.delete(this);
    }
  };
  Renderer.prototype.box=function(body,palette) {
    const context=contexts.get(this),selection=context&&furnitureSelectionV119(body,context.world);
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
      const selection=furnitureSelectionV119(body,world);
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
