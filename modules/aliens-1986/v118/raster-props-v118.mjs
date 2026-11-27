/* Presentation-only supplement to the preserved V116 renderer.
 * Seven raster directions follow the existing tactical angle and turn timer.
 * The unavailable frontal view retains the procedural fallback. These static
 * views do not add an animation cycle or change the simulation. */
import {createSpriteStoreV116} from '../v116/sprite-loader-v116.mjs';

const PROP_PLACEMENTS = new Map([
  ['v114-gateway-inquiry/v114-gateway-inquiry-prop-1', {type:'display',id:'gateway-inquiry-display',width:150,height:90,offsetY:-80}],
  ['v109-logistics/quay-console', {type:'console',id:'service-control-pedestal',width:44,height:74}],
  ['v109-reserve/reserve-switch', {type:'console',id:'service-control-pedestal',width:44,height:74}],
  ['v112-workshop/optics-control', {type:'console',id:'service-control-pedestal',width:44,height:74}],
  ['v112-conduit/conduit-control', {type:'console',id:'service-control-pedestal',width:44,height:74}],
  ['v109-reserve/reserve-monitor', {type:'console',id:'medical-counter-terminal',width:78,height:48}],
  ['v112-workshop/optics-console', {type:'console',id:'optics-calibration-terminal',width:84,height:50}],
  ['v112-conduit/valve-indicator', {type:'console',id:'valve-indicator-panel',width:54,height:48}],
  ['v114-sulaco-mess/v114-sulaco-mess-prop-2', {type:'console',id:'sulaco-briefing-terminal',width:94,height:48}],
  ['v107-operations/ops-screen', {type:'console',id:'operations-table-terminal',width:96,height:52}],
]);

export function propSelectionV118(prop,world,session) {
  const room=world.scene.id;
  if (room==='v107-service' && prop.id==='service-crate' && prop.type==='crate') {
    const used=Boolean(session?.engineering?.collected);
    return {id:used?'supply-case-ammo-empty':'engineering-case-stocked',width:52,height:60,offsetY:0,
      label:used?'PLAQUES · VIDE':'RENFORTS × 3',labelColor:used?'#8b9d87':'#e0c18d'};
  }
  const selection=PROP_PLACEMENTS.get(room+'/'+prop.id);
  if (!selection || selection.type!==prop.type) return null;
  const {type,...result}=selection;
  return {offsetY:0,...result};
}

const SENTRY_VIEWS = Object.freeze([
  ['sentry-idle-right',false], ['sentry-aim-front-right',false],
  ['sentry-aim-front',false], ['sentry-aim-front-right',true],
  ['sentry-idle-right',true], ['sentry-aim-rear-right',true],
  ['sentry-aim-rear',false], ['sentry-aim-rear-right',false],
]);

export function sentrySelectionV118(actor,session) {
  if (actor.role!=='sentry' || !actor.alive) return null;
  let angle=session?.tactics?.sentries?.[actor.id]?.angle??0;
  if (!Number.isFinite(angle)) return null;
  const turn=session?.action;
  if (turn?.kind==='sentry-orient' && turn.id===actor.id) {
    if (![turn.angle,turn.elapsed,turn.duration].every(Number.isFinite) || turn.duration<=0) return null;
    // The shortest-arc expression and progress are the original V114 renderer's.
    const diff=Math.atan2(Math.sin(turn.angle-angle),Math.cos(turn.angle-angle));
    angle+=diff*Math.min(1,turn.elapsed/turn.duration);
  }
  const sector=((Math.round(angle/(Math.PI/4))%8)+8)%8;
  const [id,flip]=SENTRY_VIEWS[sector];
  return {id,height:75,flip,angle,sector};
}

function drawProp(renderer,prop,world,store) {
  const selection=propSelectionV118(prop,world,renderer.session);
  if (!selection || !store.get(selection.id)) return false;
  // supportId describes the existing top surface. It is deliberately not the
  // bodyId convention, which anchors some V114 props at a body's front edge.
  const position=renderer.project(prop),x=position.x,y=position.y-(prop.elevation||0)+selection.offsetY;
  if (!store.draw(renderer.c,selection.id,{x,y,width:selection.width,height:selection.height})) return false;
  if (selection.label) {
    const asset=store.asset(selection.id),[l,t,r,b]=asset.bbox;
    const scale=Math.min(selection.width/(r-l),selection.height/(b-t));
    const c=renderer.c;
    c.save();c.fillStyle=selection.labelColor;c.font='600 9px ui-monospace,Consolas,monospace';c.textAlign='center';
    c.fillText(selection.label,x,y+(t-asset.pivot[1])*scale-10);c.restore();
  }
  return true;
}

function drawSentry(renderer,actor,store) {
  const selection=sentrySelectionV118(actor,renderer.session);
  if (!selection || !store.get(selection.id)) return false;
  const p=renderer.project(actor),c=renderer.c;
  c.save();c.beginPath();c.ellipse(p.x,p.y+3,27,6,0,0,Math.PI*2);c.fillStyle='#00000068';c.fill();c.restore();
  return store.draw(c,selection.id,{x:p.x,y:p.y,height:selection.height,flip:selection.flip});
}

export function installRasterPropsV118(Renderer,entries) {
  if (Renderer.prototype.rasterVersionV118===118) return Renderer;
  const previousProp=Renderer.prototype.prop,previousActor=Renderer.prototype.actor;
  function sprites(renderer) {
    return renderer.rasterSpritesV116||(renderer.rasterSpritesV116=createSpriteStoreV116(entries));
  }
  Object.defineProperty(Renderer.prototype,'rasterVersionV118',{value:118});
  Renderer.prototype.rasterStatusV118=function(){return {...sprites(this).status(),extensionVersion:118};};
  Renderer.prototype.prop=function(prop,world,palette){
    if (!drawProp(this,prop,world,sprites(this))) return previousProp.call(this,prop,world,palette);
  };
  Renderer.prototype.actor=function(actor,world){
    if (actor.role!=='sentry' || !drawSentry(this,actor,sprites(this))) return previousActor.call(this,actor,world);
  };
  return Renderer;
}
