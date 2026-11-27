/* Reference-card illustrations only. No scene, session, save or physics edits. */
import {createSpriteStoreV116,validateSpriteEntriesV116} from '../v116/sprite-loader-v116.mjs';

const illustration=(id,folder,label)=>Object.freeze({id,path:`assets/dlc/aliens-1986/v122/${folder}/${id}.png`,label});
export const ATLAS_ASSETS_V122=Object.freeze({
  'uss-sulaco':illustration('uss-sulaco','exteriors','USS Sulaco · vue extérieure'),
  'jorden-survey-tractor':illustration('jorden-survey-tractor','exteriors','Tracteur d’exploration Jorden · Special Edition'),
  'sulaco-deck-tile':illustration('sulaco-deck-tile','environments','Dalle de pont du Sulaco · motif'),
  'atmosphere-processor-facade':illustration('atmosphere-processor-facade','environments','Processeur atmosphérique · façade'),
  'hadley-colony-building':illustration('hadley-colony-building','environments','Hadley’s Hope · bâtiment de la colonie'),
  'gateway-orbital-backdrop':illustration('gateway-orbital-backdrop','environments','Gateway · station en orbite terrestre'),
  'narcissus-shuttle':illustration('narcissus-shuttle','exteriors','Narcissus · navette de secours'),
  'hadley-uplink-tower':illustration('hadley-uplink-tower','environments','Hadley’s Hope · tour de liaison'),
  'hadley-colony-wall-panel':illustration('hadley-colony-wall-panel','environments','Hadley’s Hope · panneau de façade'),
});
const locations=Object.freeze(Object.fromEntries(Object.entries({
  'sulaco-hangar':['uss-sulaco','sulaco-deck-tile'],
  jorden:['jorden-survey-tractor'],
  'processor-entry':['atmosphere-processor-facade'],
  'hadley-main':['hadley-colony-building','hadley-colony-wall-panel'],
  'colony-exterior':['hadley-colony-building','hadley-uplink-tower'],
  'gateway-medical':['gateway-orbital-backdrop'],
  'gateway-inquiry':['gateway-orbital-backdrop'],
  narcissus:['narcissus-shuttle'],
}).map(([id,assets])=>[id,Object.freeze(assets.map(asset=>ATLAS_ASSETS_V122[asset]))])));
const empty=Object.freeze([]),installed=new WeakMap();
export function atlasIllustrationsV122(locationId) {return Object.hasOwn(locations,locationId)?locations[locationId]:empty;}

/** Contain the measured alpha bounds, preserving the native aspect ratio. */
export function atlasImageRectV122(asset,width=640,height=360,padding=16) {
  const b=asset?.bbox;
  if(!Array.isArray(b)||b.length!==4||!b.every(Number.isFinite)||b[2]<=b[0]||b[3]<=b[1]||
     ![width,height,padding].every(Number.isFinite)||padding<0||width<=padding*2||height<=padding*2)return null;
  const [sx,sy,r,bottom]=b,sw=r-sx,sh=bottom-sy,scale=Math.min((width-2*padding)/sw,(height-2*padding)/sh),dw=sw*scale,dh=sh*scale;
  return {sx,sy,sw,sh,dx:(width-dw)/2,dy:(height-dh)/2,dw,dh,scale};
}

/** Installs once per renderer. Requests begin only for visible location cards. */
export function installRasterAtlasV122(renderer,entries,{
  requestFrame=globalThis.requestAnimationFrame?.bind(globalThis),
  cancelFrame=globalThis.cancelAnimationFrame?.bind(globalThis),
  now=()=>globalThis.performance.now(),maximumWaitMs=15000,storeOptions,
}={}) {
  if(!renderer||typeof renderer!=='object')throw new TypeError('The atlas requires a renderer instance.');
  if(installed.has(renderer))return installed.get(renderer);
  if(!Number.isFinite(maximumWaitMs)||maximumWaitMs<=0)throw new TypeError('Invalid atlas loading deadline.');
  const records=validateSpriteEntriesV116(entries),owned=new WeakMap();
  let root=null,views=[],frame=null,generation=0,disposed=false,deadline=0;
  const visible=node=>Boolean(node&&node.isConnected!==false&&!node.closest?.('[hidden]'));
  const live=view=>view.figure.parentNode===view.card&&root?.contains(view.card);
  const sprites=()=>renderer.rasterSpritesV116||(renderer.rasterSpritesV116=createSpriteStoreV116(records,storeOptions));
  function cancel(){generation++;if(frame!==null&&cancelFrame)cancelFrame(frame);frame=null;}
  function state(view,value) {
    view.state=value;view.figure.dataset.atlasState=value;
    view.canvas.hidden=value!=='ready';view.canvas.style.display=value==='ready'?'block':'none';view.message.hidden=value==='ready';
    view.message.textContent=value==='pending'?'Chargement de l’illustration…':'Illustration indisponible. La fiche reste consultable.';
  }
  function makeView(card,spec,locationId) {
    const document=card.ownerDocument,figure=document.createElement('figure'),canvas=document.createElement('canvas'),caption=document.createElement('figcaption'),message=document.createElement('p');
    figure.dataset.atlasAsset=spec.id;figure.style.margin='14px 0';figure.style.padding='8px';figure.style.background='#0b1918';figure.style.border='1px solid #415b50';
    canvas.width=640;canvas.height=360;canvas.style.width='100%';canvas.style.height='auto';canvas.style.display='block';canvas.setAttribute('role','img');canvas.setAttribute('aria-label',spec.label);
    caption.textContent=spec.label;caption.style.font='12px/1.5 ui-monospace, monospace';caption.style.color='#c5d5be';
    message.style.fontSize='12px';message.style.margin='8px 0';
    figure.append(canvas,caption,message);card.insertBefore(figure,[...card.children].find(child=>child.tagName==='P')||null);
    const view={spec,locationId,card,figure,canvas,message,state:'pending',rect:null};state(view,'pending');return view;
  }
  function update(token) {
    if(disposed||token!==generation)return;
    frame=null;
    if(!visible(root))return;
    views=views.filter(live);
    if(!views.length)return;
    const store=sprites();let pending=false;
    for(const view of views) {
      if(view.state!=='pending')continue;
      const asset=store.asset(view.spec.id);
      if(!asset){state(view,'missing');continue;}
      if(asset.path!==view.spec.path){state(view,'invalid');continue;}
      const record=store.get(view.spec.id);
      if(record) {
        const rect=atlasImageRectV122(record.asset),context=view.canvas.getContext('2d');
        if(!rect||!context){state(view,'unavailable');continue;}
        context.clearRect(0,0,640,360);
        const b=record.asset.bbox,drawn=store.draw(context,view.spec.id,{x:320,y:180,width:608,height:328,pivot:[(b[0]+b[2])/2,(b[1]+b[3])/2]});
        if(!drawn){state(view,'unavailable');continue;}
        view.rect=rect;state(view,'ready');continue;
      }
      if(Object.hasOwn(store.status().errors,view.spec.id)){state(view,'error');continue;}
      if(now()>=deadline){state(view,'timeout');continue;}
      pending=true;
    }
    if(pending&&typeof requestFrame==='function')frame=requestFrame(()=>update(token));
  }
  const controller=Object.freeze({
    enhance(nextRoot,tab='places') {
      if(disposed)return controller.status();
      cancel();
      if(tab!=='places') {for(const view of views)if(live(view))view.figure.remove();views=[];root=null;return controller.status();}
      root=nextRoot;views=[];
      if(!visible(root)||typeof root.querySelectorAll!=='function')return controller.status();
      for(const card of root.querySelectorAll('.atlas-card[data-atlas-location]')) {
        const locationId=card.dataset.atlasLocation;
        for(const spec of atlasIllustrationsV122(locationId)) {
          let cardViews=owned.get(card);if(!cardViews){cardViews=new Map();owned.set(card,cardViews);}
          let view=cardViews.get(spec.id);
          if(!view||view.figure.parentNode!==card){view=makeView(card,spec,locationId);cardViews.set(spec.id,view);}
          if(view.state!=='ready'){view.rect=null;state(view,'pending');}
          views.push(view);
        }
      }
      deadline=now()+maximumWaitMs;update(generation);return controller.status();
    },
    status() {
      const placements=views.filter(live).map(v=>({locationId:v.locationId,assetId:v.spec.id,state:v.state,rect:v.rect?{...v.rect}:null}));
      return {version:122,active:!disposed&&visible(root),pendingFrame:frame!==null,placements,
        ready:placements.filter(v=>v.state==='ready').length,pending:placements.filter(v=>v.state==='pending').length,
        unavailable:placements.filter(v=>!['ready','pending'].includes(v.state)).length,
        cache:renderer.rasterSpritesV116?.status()||null};
    },
    dispose(){if(disposed)return;cancel();for(const view of views)if(live(view))view.figure.remove();views=[];root=null;disposed=true;installed.delete(renderer);},
  });
  installed.set(renderer,controller);return controller;
}
