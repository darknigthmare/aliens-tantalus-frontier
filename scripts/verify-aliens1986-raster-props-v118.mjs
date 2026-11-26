#!/usr/bin/env node
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {installRasterRendererV116} from '../modules/aliens-1986/v116/raster-renderer-v116.mjs';
import {installRasterPropsV118,propSelectionV118,sentrySelectionV118} from '../modules/aliens-1986/v118/raster-props-v118.mjs';

const entry=(id,extra={})=>({id,path:'assets/test/'+id+'.png',width:100,height:100,bbox:[10,10,90,90],pivot:[50,90],runtimeEligible:true,...extra});
function frozen(value) {
  if(value && typeof value==='object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(frozen);Object.freeze(value);
  }
  return value;
}
function context() {
  const calls=[],stack=[];
  return {calls,globalAlpha:1,save(){stack.push(this.globalAlpha);},restore(){this.globalAlpha=stack.pop();},
    translate(...args){calls.push(['translate',...args]);},scale(...args){calls.push(['scale',...args]);},
    drawImage(...args){calls.push(['drawImage',...args]);},fillText(...args){calls.push(['fillText',...args]);},
    beginPath(){},ellipse(){},fill(){},stroke(){},arc(){},fillRect(){},strokeRect(){},rect(){},clip(){}};
}
const imageId=call=>call[1].src.split('/').at(-1).replace(/\.png$/,'');
const draws=renderer=>renderer.c.calls.filter(call=>call[0]==='drawImage');

/** These placements and expected directions are independent fixtures, not
 * expectations derived from the selectors that are being checked. */
export function runPropsUnitChecksV118() {
  let checks=0;
  const previousImage=globalThis.Image,previousDocument=globalThis.document;
  const modes=new Map(),images=[];
  const ids=['engineering-case-stocked','gateway-inquiry-display','service-control-pedestal',
    'medical-counter-terminal','optics-calibration-terminal','valve-indicator-panel',
    'sulaco-briefing-terminal','operations-table-terminal','sentry-aim-front-right',
    'sentry-aim-rear-right','sentry-aim-rear','sentry-idle-right','operations-console',
    'meal-tray-food','newt-idle-right'];
  const entries=[...ids.map(id=>entry(id)),entry('supply-case-ammo-empty',{bbox:[10,30,90,90]})];
  const fixtures=[
    ['engineering-case-stocked','v107-service',{id:'service-crate',type:'crate',x:837,z:314,supportId:'cable-rack',elevation:69},52,60,0],
    ['gateway-inquiry-display','v114-gateway-inquiry',{id:'v114-gateway-inquiry-prop-1',type:'display',x:1150,z:28},150,90,-80],
    ['service-control-pedestal','v109-logistics',{id:'quay-console',type:'console',x:525,z:224},44,74,0],
    ['service-control-pedestal','v109-reserve',{id:'reserve-switch',type:'console',x:754,z:293},44,74,0],
    ['service-control-pedestal','v112-workshop',{id:'optics-control',type:'console',x:542,z:294},44,74,0],
    ['service-control-pedestal','v112-conduit',{id:'conduit-control',type:'console',x:550,z:280},44,74,0],
    ['medical-counter-terminal','v109-reserve',{id:'reserve-monitor',type:'console',x:922,z:111,supportId:'medical-counter',elevation:67},78,48,0],
    ['optics-calibration-terminal','v112-workshop',{id:'optics-console',type:'console',x:398,z:103,supportId:'optics-bench',elevation:65},84,50,0],
    ['valve-indicator-panel','v112-conduit',{id:'valve-indicator',type:'console',x:431,z:316,supportId:'valve-plinth',elevation:73},54,48,0],
    ['sulaco-briefing-terminal','v114-sulaco-mess',{id:'v114-sulaco-mess-prop-2',type:'console',x:1135,z:300,supportId:'v114-sulaco-mess-body-1',elevation:49},94,48,0],
    ['operations-table-terminal','v107-operations',{id:'ops-screen',type:'console',x:570,z:142,supportId:'ops-table',elevation:49},96,52,0],
  ];
  function makeRenderer(selectedEntries=entries) {
    class Renderer {
      constructor(){this.c=context();this.camera=70;this.session={};this.fallbackActors=0;this.fallbackProps=0;}
      project(point){return {x:point.x-this.camera,y:265+point.z*.86};}
      actor(){this.fallbackActors++;}
      prop(){this.fallbackProps++;}
      door(){}
    }
    installRasterRendererV116(Renderer,selectedEntries);
    installRasterPropsV118(Renderer,selectedEntries);
    return new Renderer();
  }
  const makeWorld=room=>({scene:{id:room,solids:[]},actors:[],circuits:{},doors:{}});
  try {
    globalThis.document={baseURI:'https://example.invalid/dlc/aliens-1986/game.html'};
    globalThis.Image=class {
      constructor(){this.naturalWidth=100;this.naturalHeight=100;this.complete=false;images.push(this);}
      set src(value){
        this._src=value;
        const mode=modes.get(value.split('/').at(-1).replace(/\.png$/,''));
        if(mode==='pending')return;
        if(mode==='error'){this.onerror();return;}
        if(mode==='wrong-size')this.naturalWidth=99;
        this.onload();
      }
      get src(){return this._src;}
    };
    const renderer=makeRenderer();
    for(const [id,room,prop,width,height,offsetY] of fixtures) {
      const world=frozen(makeWorld(room)),placed=frozen(prop),session=frozen({engineering:{collected:false}});
      renderer.session=session;renderer.c.calls.length=0;
      const snapshot=JSON.stringify({placed,world,session});
      const selection=propSelectionV118(placed,world,session);
      assert.equal(selection.id,id);assert.equal(selection.width,width);assert.equal(selection.height,height);assert.equal(selection.offsetY,offsetY);
      renderer.prop(placed,world,{});
      assert.equal(draws(renderer).length,1);assert.equal(imageId(draws(renderer)[0]),id);
      assert.deepEqual(renderer.c.calls.find(call=>call[0]==='translate'),['translate',prop.x-70,265+prop.z*.86-(prop.elevation||0)+offsetY]);
      const expectedSize=Math.min(width,height);
      assert.equal(draws(renderer)[0][8],expectedSize);assert.equal(draws(renderer)[0][9],expectedSize);
      assert.equal(JSON.stringify({placed,world,session}),snapshot);assert.equal(renderer.fallbackProps,0);checks++;
      for(const [changedProp,changedWorld] of [
        [{...prop,type:'unrelated'},world],[{...prop,id:'unrelated'},world],[prop,makeWorld('unrelated-room')],
      ]) assert.equal(propSelectionV118(changedProp,changedWorld,session),null);
    }
    checks++;

    // Even a coincident bodyId must not replace an explicitly placed support
    // anchor with the body's front edge.
    const attached=frozen({...fixtures[6][2],bodyId:'medical-counter'});
    const attachedWorld=frozen({...makeWorld('v109-reserve'),scene:{id:'v109-reserve',solids:[{id:'medical-counter',x:835,z:65,w:188,d:90,h:67}]}});
    renderer.c.calls.length=0;renderer.prop(attached,attachedWorld,{});
    assert.deepEqual(renderer.c.calls.find(call=>call[0]==='translate'),['translate',852,265+111*.86-67]);checks++;

    const stock=fixtures[0][2],stockWorld=frozen(makeWorld('v107-service'));
    renderer.session=frozen({engineering:{collected:false}});renderer.c.calls.length=0;renderer.prop(stock,stockWorld,{});
    const fullDraw=draws(renderer)[0],fullLabel=renderer.c.calls.find(call=>call[0]==='fillText');
    renderer.session=frozen({engineering:{collected:true}});renderer.c.calls.length=0;renderer.prop(stock,stockWorld,{});
    const emptyDraw=draws(renderer)[0],emptyLabel=renderer.c.calls.find(call=>call[0]==='fillText');
    assert.equal(imageId(fullDraw),'engineering-case-stocked');assert.equal(imageId(emptyDraw),'supply-case-ammo-empty');
    assert.equal(fullDraw[8],52);assert.equal(emptyDraw[8],52);
    assert.equal(fullLabel[1],'RENFORTS × 3');assert.equal(emptyLabel[1],'PLAQUES · VIDE');
    const stockBase=265+314*.86-69;
    assert.equal(fullLabel[3],stockBase-fullDraw[9]-10);assert.equal(emptyLabel[3],stockBase-emptyDraw[9]-10);checks++;

    const actor=frozen({id:'sentry-a',role:'sentry',kind:'ally',alive:true,hp:100,ammo:500,x:500,z:220});
    const world=frozen(makeWorld('v107-operations'));
    const directions=[
      [0,'sentry-idle-right',false,0],[Math.PI/4,'sentry-aim-front-right',false,1],
      [Math.PI/2,'sentry-aim-front',false,2],[Math.PI*3/4,'sentry-aim-front-right',true,3],
      [Math.PI,'sentry-idle-right',true,4],[-Math.PI*3/4,'sentry-aim-rear-right',true,5],
      [-Math.PI/2,'sentry-aim-rear',false,6],[-Math.PI/4,'sentry-aim-rear-right',false,7],
    ];
    for(const [angle,id,flip,sector] of directions) {
      renderer.session=frozen({tactics:{sentries:{'sentry-a':{angle}}}});renderer.c.calls.length=0;
      const snapshot=JSON.stringify({actor,world,session:renderer.session}),oldFallbacks=renderer.fallbackActors;
      const oldRequests=renderer.rasterStatusV118().requested;
      assert.deepEqual(sentrySelectionV118(actor,renderer.session),{id,height:75,flip,angle,sector});
      renderer.actor(actor,world);
      if(sector===2) {
        assert.equal(draws(renderer).length,0);assert.equal(renderer.fallbackActors,oldFallbacks+1);
        assert.equal(renderer.rasterStatusV118().requested,oldRequests,'Unavailable frontal PNG must not start a request.');
      } else {
        assert.equal(draws(renderer).length,1);assert.equal(imageId(draws(renderer)[0]),id);
        assert.equal(draws(renderer)[0][9],75);assert.equal(renderer.fallbackActors,oldFallbacks);
        assert.equal(renderer.c.calls.some(call=>call[0]==='scale'&&call[1]===-1),flip);
        assert.deepEqual(renderer.c.calls.find(call=>call[0]==='translate'),['translate',430,454.2]);
      }
      assert.equal(JSON.stringify({actor,world,session:renderer.session}),snapshot);checks++;
    }

    // A half-finished turn draws its existing interpolated angle, not the final
    // orientation. Across the ±pi boundary it takes the original shortest arc.
    for(const [start,target,elapsed,expectedId,expectedAngle] of [
      [0,Math.PI/2,.575,'sentry-aim-front-right',Math.PI/4],
      [Math.PI*170/180,-Math.PI*170/180,.575,'sentry-idle-right',Math.PI],
      [0,-Math.PI/2,2,'sentry-aim-rear',-Math.PI/2],
    ]) {
      renderer.session=frozen({tactics:{sentries:{'sentry-a':{angle:start}}},action:{kind:'sentry-orient',id:'sentry-a',angle:target,elapsed,duration:1.15}});
      const before=JSON.stringify(renderer.session);renderer.c.calls.length=0;renderer.actor(actor,world);
      assert.equal(draws(renderer).length,1);assert.equal(imageId(draws(renderer)[0]),expectedId);
      assert.ok(Math.abs(sentrySelectionV118(actor,renderer.session).angle-expectedAngle)<1e-12);
      assert.equal(JSON.stringify(renderer.session),before);checks++;
    }
    assert.equal(sentrySelectionV118(actor,{tactics:{sentries:{'sentry-a':{angle:Math.PI*2}}}}).sector,0);
    assert.equal(sentrySelectionV118(actor,{action:{kind:'sentry-orient',id:'another-sentry',angle:Math.PI/2,elapsed:.575,duration:1.15}}).sector,0);
    assert.equal(sentrySelectionV118({...actor,alive:false},{}),null);
    assert.equal(sentrySelectionV118({...actor,role:'warrior'},{}),null);
    assert.equal(sentrySelectionV118(actor,{tactics:{sentries:{'sentry-a':{angle:NaN}}}}),null);checks++;

    // The existing humans, generic consoles and V117 props continue through
    // V116, using exactly the same cache and loader counters as new V118 props.
    const shared=renderer.rasterSpritesV116,oldDraws=renderer.rasterStatusV116().draws;
    renderer.session=frozen({});renderer.c.calls.length=0;
    renderer.prop({id:'other-console',type:'console',x:10,z:20},world,{});
    renderer.prop({type:'meal',x:10,z:20},makeWorld('v114-sulaco-mess'),{});
    renderer.actor({id:'newt',kind:'escort',alive:true,x:10,z:20},world);
    assert.deepEqual(draws(renderer).map(imageId),['operations-console','meal-tray-food','newt-idle-right']);
    assert.equal(renderer.rasterSpritesV116,shared);
    const v116Status=renderer.rasterStatusV116(),{extensionVersion,...v118Status}=renderer.rasterStatusV118();
    assert.equal(extensionVersion,118);assert.deepEqual(v118Status,v116Status);assert.equal(v116Status.draws,oldDraws+3);
    assert.ok(v116Status.used.includes('engineering-case-stocked'));assert.ok(v116Status.used.includes('meal-tray-food'));
    assert.equal(images.filter(image=>image.src.endsWith('/sentry-idle-right.png')).length,1);checks++;

    const originalProp=renderer.constructor.prototype.prop;
    installRasterPropsV118(renderer.constructor,entries);
    assert.equal(renderer.constructor.prototype.prop,originalProp);checks++;

    for(const mode of ['pending','error','wrong-size']) {
      modes.set('engineering-case-stocked',mode);
      const delayed=makeRenderer(),beforeImages=images.length;
      delayed.prop(stock,stockWorld,{});
      assert.equal(delayed.fallbackProps,1);assert.equal(draws(delayed).length,0);
      const firstImage=images[beforeImages];delayed.prop(stock,stockWorld,{});
      assert.equal(delayed.fallbackProps,2);assert.equal(images.length,beforeImages+1);
      if(mode==='pending') {
        firstImage.onload();delayed.prop(stock,stockWorld,{});
        assert.equal(draws(delayed).length,1);assert.equal(delayed.fallbackProps,2);
      } else assert.equal(delayed.rasterStatusV118().failed,1);
      modes.delete('engineering-case-stocked');checks++;
    }
    const missing=makeRenderer(entries.filter(asset=>asset.id!=='medical-counter-terminal'));
    missing.prop(fixtures[6][2],makeWorld('v109-reserve'),{});
    assert.deepEqual(draws(missing).map(imageId),['operations-console']);assert.equal(missing.rasterStatusV118().failed,0);checks++;

    for(const mode of ['pending','error']) {
      modes.set('sentry-aim-rear',mode);
      const unavailable=makeRenderer();unavailable.session=frozen({tactics:{sentries:{'sentry-a':{angle:-Math.PI/2}}}});
      unavailable.actor(actor,world);
      assert.equal(unavailable.fallbackActors,1);assert.equal(draws(unavailable).length,0);
      modes.delete('sentry-aim-rear');checks++;
    }
    const dead=makeRenderer();dead.actor({...actor,alive:false},world);
    assert.equal(dead.fallbackActors,1);assert.equal(draws(dead).length,0);assert.equal(dead.rasterStatusV118().requested,0);checks++;
  } finally {
    if(previousImage===undefined)delete globalThis.Image;else globalThis.Image=previousImage;
    if(previousDocument===undefined)delete globalThis.document;else globalThis.document=previousDocument;
  }
  return checks;
}

if(process.argv[1] && import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
  process.stdout.write(JSON.stringify({ok:true,unitChecks:runPropsUnitChecksV118(),version:118})+'\n');
}
