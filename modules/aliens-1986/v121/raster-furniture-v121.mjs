/* Four industrial images cover five explicit V114 bodies.
 * Presentation only: original geometry, actors, supports and saves are read,
 * never replaced or reordered in the simulation. Install after V120. */
import {createSpriteStoreV116} from '../v116/sprite-loader-v116.mjs';

const PLACEMENTS = new Map([
  ['v106-hadley/generator', {id:'hadley-service-generator',w:100,d:62,h:84}],
  ['v107-service/pump-foundation', {id:'service-pump-unit',w:151,d:98,h:94}],
  ['v112-conduit/exchanger-west', {id:'conduit-heat-exchanger',w:181,d:84,h:127}],
  ['v112-conduit/exchanger-east', {id:'conduit-heat-exchanger',w:194,d:82,h:134}],
  ['v112-conduit/valve-plinth', {id:'conduit-valve-plinth',w:125,d:65,h:73}],
]);
const SUPPORTED_PROPS = new Map([
  ['v112-conduit/valve-indicator', {bodyId:'valve-plinth',type:'console'}],
]);

export function furnitureSelectionV121(body,world) {
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
  if (!furnitureSelectionV121(body,world) || prop.elevation!==body.h ||
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
  // The two exchangers share one native image, fitted to each existing body.
  return store.draw(renderer.c,selection.id,{x:front.x,y:front.y,width:body.w,height});
}

export function installRasterFurnitureV121(Renderer,entries) {
  if (Renderer.prototype.rasterVersionV121===121) return Renderer;
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
  Object.defineProperty(Renderer.prototype,'rasterVersionV121',{value:121});
  Renderer.prototype.rasterStatusV121=function(){return {...sprites(this).status(),extensionVersion:121};};
  Renderer.prototype.render=function(world,...args) {
    const parent=contexts.get(this),context={world,deferred:new Map(),drawn:new Set()};
    contexts.set(this,context);
    try {
      const result=previousRender.call(this,world,...args);
      // A foreign renderer skipping the admitted body must not lose the valve indicator.
      for (const body of [...context.deferred.keys()]) flush(this,context,body);
      return result;
    } finally {
      if (parent) contexts.set(this,parent);else contexts.delete(this);
    }
  };
  Renderer.prototype.box=function(body,palette) {
    const context=contexts.get(this),selection=context&&furnitureSelectionV121(body,context.world);
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
      const selection=furnitureSelectionV121(body,world);
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
