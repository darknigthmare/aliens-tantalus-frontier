import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  ARMORY_ART_CANVAS_V169, ARMORY_SPRITE_CROPS_V169,
  ARMORY_STOREFRONT_VARIANTS_V169, ARMORY_STOREFRONT_SOURCE_V169,
  validateArmoryStorefrontV169, getArmoryStorefrontPlanV169,
  drawArmoryStorefrontV169, getArmoryStoreContactV169
} from '../src/hub-armory-storefront-v169.js';
const repo = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const fixture = () => {
  const calls = [];
  const ctx = { save() { calls.push(['save']); }, restore() { calls.push(['restore']); },
    drawImage(...args) { calls.push(['draw', ...args]); } };
  return { ctx, calls };
};

test('V169 includes three independent concept variants and 32 distinct source crops', () => {
  assert.deepEqual(Object.keys(ARMORY_STOREFRONT_VARIANTS_V169), ['tantalus','colony','station']);
  assert.equal(ARMORY_SPRITE_CROPS_V169.length, 32);
  assert.deepEqual(validateArmoryStorefrontV169(), { valid:true, failures:[], variants:3, crops:32 });
  for (const crop of ARMORY_SPRITE_CROPS_V169) {
    assert.ok(crop.source.x >= 0 && crop.source.y >= 0);
    assert.ok(crop.source.x + crop.source.w <= ARMORY_ART_CANVAS_V169.w);
    assert.ok(crop.source.y + crop.source.h <= ARMORY_ART_CANVAS_V169.h);
  }
});

test('V169 does not relabel project concept art as canon 1:1', () => {
  for (const key of ['tantalus','colony','station']) {
    const plan = getArmoryStorefrontPlanV169(ARMORY_STOREFRONT_VARIANTS_V169[key].roomId);
    assert.equal(plan.variant, key);
    assert.equal(plan.collision, 'none');
    assert.equal(plan.gameplayChanges, false);
    assert.match(plan.sourceStatus, /not-1to1$/);
    assert.equal(plan.atlas, ARMORY_STOREFRONT_SOURCE_V169[key]);
  }
});

test('V169 keeps the native armorer, rather than duplicating a concept NPC', () => {
  const plan = getArmoryStorefrontPlanV169('armory');
  assert.equal(plan.vendorIdentity, 'sanaa-doyle-existing-native-npc');
  assert.equal(plan.assets.some(asset => asset.id.startsWith('vendor-')), false);
});

test('V169 does not substitute another historical room or legacy door', () => {
  assert.equal(getArmoryStorefrontPlanV169('briefing'), null);
  assert.equal(getArmoryStorefrontPlanV169('frontier-civil-counter'), null);
  assert.equal(getArmoryStorefrontPlanV169('dropship-hangar'), null);
});

test('V169 handles missing or wrongly-sized art without altering the canvas', () => {
  const { ctx, calls } = fixture();
  const plan = getArmoryStorefrontPlanV169('armory');
  for(const asset of [null,{complete:false,naturalWidth:1448,naturalHeight:1086},
    {complete:true,naturalWidth:1024,naturalHeight:1024}]) {
    const result=drawArmoryStorefrontV169(ctx,asset,plan);
    assert.equal(result.drawn,0);
  }
  assert.deepEqual(calls,[]);
});

test('V169 renders only authored crop rectangles when full atlas is admitted', () => {
  const {ctx,calls}=fixture(), image={complete:true,naturalWidth:1448,naturalHeight:1086};
  const plan=getArmoryStorefrontPlanV169('armory');
  const back=drawArmoryStorefrontV169(ctx,image,plan,{originX:1280,phase:'back'});
  const front=drawArmoryStorefrontV169(ctx,image,plan,{originX:1280,phase:'front'});
  assert.equal(back.drawn+front.drawn,plan.assets.length);
  assert.equal(calls.filter(entry=>entry[0]==='draw').length,plan.assets.length);
  assert.ok(calls.filter(entry=>entry[0]==='draw').every(entry=>entry[6] >= 1280));
});

test('V169 colony merchant is gated behind the real rescue mission receipt', () => {
  const location={roomId:'port-meridien-quay',x:2088,y:624,alive:true};
  assert.equal(getArmoryStoreContactV169({...location,missionPhase:'report'}),null);
  assert.equal(getArmoryStoreContactV169({...location,missionPhase:'escort'}),null);
  assert.equal(getArmoryStoreContactV169({...location,missionPhase:'complete'})?.variant,'colony');
  assert.equal(getArmoryStoreContactV169({...location,missionPhase:'complete',gameplayBlocked:true}),null);
});

test('V169 station supply merchant keeps the logistics annex and true floor', () => {
  const contact=getArmoryStoreContactV169({roomId:'logistics',x:528,y:624,alive:true});
  assert.equal(contact?.variant,'station');
  assert.equal(contact?.source,'native-contact-v169');
  assert.equal(contact?.action,'armory:open-shop-v169');
  assert.equal(getArmoryStoreContactV169({roomId:'logistics',x:528,y:400,alive:true}),null);
});

test('V169 refuses distant, dead and unregistered merchant interaction', () => {
  assert.equal(getArmoryStoreContactV169({roomId:'logistics',x:20,y:624,alive:true}),null);
  assert.equal(getArmoryStoreContactV169({roomId:'logistics',x:528,y:624,alive:false}),null);
  assert.equal(getArmoryStoreContactV169({roomId:'unknown',x:528,y:624,alive:true}),null);
  assert.equal(getArmoryStoreContactV169({roomId:'armory',x:650,y:930,alive:true}),null);
});

test('V169 production integration keeps existing shop transactions and native merchant controls', () => {
  const app=repo('src/app.js');
  assert.match(app,/withHubArmoryStorefrontV169/);
  assert.match(app,/interaction\.action === 'armory:open-shop-v169'/);
  assert.match(app,/hubEngine\.armoryShopContactV169/);
  assert.match(app,/interaction\.contactId !== contact\.contactId/);
  assert.match(app,/return openHubStation\('armory'\)/);
  assert.match(app,/procureCatalogItem\(saveSystem\.data/);
  const port=repo('src/hub-port-meridien-v90.js');
  assert.match(port,/portArmoryShopContactV169/);
  assert.match(port,/drawArmoryStorefrontV169/);
});

test('V169 adds no phantom collider, free currency or route to unowned equipment', () => {
  const module=repo('src/hub-armory-storefront-v169.js');
  assert.doesNotMatch(module, /actor\.ammo\s*[+-]=|strategy\.inventory\s*=|player\.credits\s*[+-]=/);
  assert.doesNotMatch(module,/HUB_DECKS\s*=|doorStates\.push|colliders\.push/);
  assert.equal(Object.values(ARMORY_STOREFRONT_VARIANTS_V169).filter(v=>v.shopContact).length,2);
});
