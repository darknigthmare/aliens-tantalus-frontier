import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createDefaultSave } from '../src/save.js';
import { getShipAnimalHabitatsV87, getShipAnimalRoomInteractionV87, installShipAnimalHabitatV87 } from '../src/ship-animal-habitat-v87.js';
import { SHIP_ANIMAL_ENCLOSURE_ASSET_V87, isShipAnimalEnclosureAtlasReadyV87 } from '../src/ship-animal-enclosure-art-v87.js';

const source=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const handler=source.slice(source.indexOf('function handleShipAnimalRoomActionV87('),source.indexOf('function handleHubAction('));
function fixture(image) {
  let writes=0;const messages=[];
  const saveSystem={data:createDefaultSave(),commit(patch){writes++;this.data={...this.data,...structuredClone(patch)};}};
  const habitat=getShipAnimalHabitatsV87(saveSystem.data).find(h=>h.id==='noisette-cafe-pen-v87');
  const hubEngine={player:{x:habitat.installX-22,y:532,w:44,h:92,alive:true},annexTransitionV71:null,
    currentAnnexV71:()=>({id:'animal-care'}),getAnnexAssetGroupV71:()=>new Map(['far','prop','door'].map(role=>[role,{complete:true,naturalWidth:100,naturalHeight:100}])),
    ensureAnnexAssetsV71:()=>new Map([['enclosure',image]]),hubCommercialStateV71:{},
    npcRoutineContextV62:{save:structuredClone(saveSystem.data)},emitStatus(){},draw(){}};
  const deps={ownsTimelineV84:()=>true,hubOwnerV84:{},activeView:'hub',creatorOwnerV84:null,standaloneContext:null,
    hubEngine,saveSystem,getShipAnimalHabitatsV87,getShipAnimalRoomInteractionV87,installShipAnimalHabitatV87,
    isShipAnimalEnclosureAtlasReadyV87,clone:structuredClone,toast:m=>messages.push(m)};
  const call=new Function(...Object.keys(deps),handler+';return handleShipAnimalRoomActionV87;')(...Object.values(deps));
  return {call,saveSystem,messages,writes:()=>writes,interaction:{action:'ship-animal:install',habitatId:habitat.id}};
}
const ready={complete:true,naturalWidth:1536,naturalHeight:1024,src:SHIP_ANIMAL_ENCLOSURE_ASSET_V87};
test('actual app handler refuses to persist invisible/wrong enclosure equipment before acquisition',()=>{
  for(const image of [undefined,{...ready,complete:false},{...ready,src:'/other.png'},{...ready,naturalWidth:100}]) {
    const f=fixture(image),before=structuredClone(f.saveSystem.data);
    assert.equal(f.call(f.interaction),false);assert.equal(f.writes(),0);assert.deepEqual(f.saveSystem.data,before);
    assert.match(f.messages[0],/Installation impossible/);
  }
});
test('actual app handler installs the visible two-place park once without creating animals or charging credits',()=>{
  const f=fixture(ready),credits=f.saveSystem.data.galaxy.resources.credits;
  assert.equal(f.call(f.interaction),true);assert.equal(f.writes(),1);
  assert.equal(getShipAnimalHabitatsV87(f.saveSystem.data).find(h=>h.id===f.interaction.habitatId).installed,true);
  assert.deepEqual(f.saveSystem.data.shipAnimalsV1.animals,{});assert.equal(f.saveSystem.data.galaxy.resources.credits,credits);
  assert.equal(f.call(f.interaction),false);assert.equal(f.writes(),1);
});
