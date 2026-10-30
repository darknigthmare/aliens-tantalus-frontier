import test from 'node:test';
import assert from 'node:assert/strict';
import {
 WEAPON_SPECIAL_FEED_PROFILES_V171,getSpecialFeedProfileV171,createSpecialFeedV171,
 validateSpecialFeedV171,fireSpecialFeedV171,cycleSpecialFeedV171,
 beginSpecialReloadV171,advanceSpecialReloadV171,cancelSpecialReloadV171,
 specialFeedTotalV171,captureSpecialFeedV171,restoreSpecialFeedV171
} from '../src/weapon-special-feeds-v171.js';
const ids={
 tube:'weapon-007-m37a2-pump-shotgun',cylinder:'weapon-021-357-magnum-revolver',
 belt:'weapon-005-m56-smartgun',tank:'weapon-006-m240-incinerator-unit',
 single:'weapon-011-m83-sadar'
};
function make(kind,loaded=5,reserve=40){
 const weaponDefinitionId=ids[kind];
 return createSpecialFeedV171({ownerId:'player',weaponInstanceId:'player:'+weaponDefinitionId,
  weaponDefinitionId,loaded:kind==='single'?Math.min(loaded,1):loaded,
  reserve,capacity:kind==='single'?1:8});
}
test('V171 explicit model list has no guessed sequel source admission',()=>{
 assert.equal(WEAPON_SPECIAL_FEED_PROFILES_V171.length,5);
 for(const [kind,id] of Object.entries(ids)){
  const profile=getSpecialFeedProfileV171(id);
  assert.equal(profile.kind,kind);
  assert.equal(profile.sourceMeasured,false);
  assert.match(profile.projectPolicy,/awaiting-native-QA/);
 }
 assert.equal(getSpecialFeedProfileV171('proposed-l56a3-smartgun'),null);
});
test('V171 source tube: accepted shot demands pump; only pump ejects a single spent shell',()=>{
 const s=make('tube',4,11),total=s.loaded+s.reserve;
 assert.equal(fireSpecialFeedV171(s,'shot-1')?.shellEjected,false);
 assert.equal(s.needsCycle,true);assert.equal(s.spentCases,1);
 assert.equal(fireSpecialFeedV171(s,'shot-2'),null);
 assert.equal(beginSpecialReloadV171(s,'reload-1'),false);
 assert.deepEqual(cycleSpecialFeedV171(s,'pump-1'),{ejected:1,needsCycle:false});
 assert.equal(s.spentCases,0);
 assert.equal(fireSpecialFeedV171(s,'shot-1'),null);
 assert.equal(specialFeedTotalV171(s),total-1);
});
test('V171 revolver retains empty cases until explicit cylinder eject on reload',()=>{
 const s=make('cylinder',6,12);
 assert.equal(fireSpecialFeedV171(s,'r1')?.shellEjected,false);
 assert.equal(fireSpecialFeedV171(s,'r2')?.shellEjected,false);
 assert.equal(s.spentCases,2);
 assert.equal(beginSpecialReloadV171(s,'rel'),true);
 const total=specialFeedTotalV171(s);
 assert.equal(advanceSpecialReloadV171(s,'rel',.36),true);
 assert.equal(s.spentCases,0);
 assert.equal(specialFeedTotalV171(s),total);
 assert.equal(cancelSpecialReloadV171(s,'rel'),true);
 assert.equal(specialFeedTotalV171(s),total);
});
test('V171 tube inserts one round at a time; interruption cannot conjure uninserted shells',()=>{
 const s=make('tube',2,6),total=specialFeedTotalV171(s);
 assert.equal(beginSpecialReloadV171(s,'rel'),true);
 assert.equal(advanceSpecialReloadV171(s,'rel',.34),true);
 assert.equal(s.loaded,4);
 assert.equal(s.reserve,4);
 assert.equal(cancelSpecialReloadV171(s,'rel'),true);
 assert.equal(specialFeedTotalV171(s),total);
 assert.equal(beginSpecialReloadV171(s,'rel'),false);
});
test('V171 five feed families conserve total carried ammunition across interruption and completion',()=>{
 for(const kind of Object.keys(ids)){
  const s=make(kind), start=specialFeedTotalV171(s);
  assert.equal(fireSpecialFeedV171(s,'f')!==null,true,kind);
  if(kind==='tube')cycleSpecialFeedV171(s,'pump');
  const after=specialFeedTotalV171(s);
  assert.equal(after,start-1);
  assert.equal(beginSpecialReloadV171(s,'r'),true,kind);
  for(const p of [.46,.79,1])assert.equal(advanceSpecialReloadV171(s,'r',p),true,kind+':'+p);
  assert.equal(specialFeedTotalV171(s),after,kind);
  assert.equal(beginSpecialReloadV171(s,'r'),false,kind);
  assert.equal(validateSpecialFeedV171(s),true,kind);
 }
});
test('V171 snapshot restore is owner/definition/total-bound with no duplicate receipts',()=>{
 const s=make('belt',5,50);
 assert.ok(fireSpecialFeedV171(s,'s1'));
 const snap=captureSpecialFeedV171(s);
 assert.deepEqual(restoreSpecialFeedV171(snap,{ownerId:'player',expectedTotal:54}),snap);
 assert.equal(restoreSpecialFeedV171(snap,{ownerId:'coop'}),null);
 assert.equal(restoreSpecialFeedV171(snap,{expectedTotal:55}),null);
 assert.equal(restoreSpecialFeedV171(snap,{weaponDefinitionId:ids.tank}),null);
 const forged=structuredClone(snap);
 forged.receipts.push('fire:s1');
 assert.equal(restoreSpecialFeedV171(forged),null);
});
test('V171 fail-closed validations reject unsafe IDs and non-bullet feed swaps',()=>{
 const s=make('tank');
 const before=JSON.stringify(s);
 assert.equal(fireSpecialFeedV171(s,'../invalid'),null);
 assert.equal(JSON.stringify(s),before);
 const alt=structuredClone(s);alt.kind='tube';
 assert.equal(validateSpecialFeedV171(alt),false);
 assert.equal(createSpecialFeedV171({ownerId:'player',weaponInstanceId:'player:x',
   weaponDefinitionId:'proposed-unknown',loaded:1,reserve:2,capacity:8}),null);
});

test('V171 corrupted reload receipts cannot mint ammunition or mutate on rejection',()=>{
 const s=make('tube',2,1),initial=specialFeedTotalV171(s);
 assert.equal(beginSpecialReloadV171(s,'safe'),true);
 const forged=structuredClone(s);
 forged.pending.planned=6;
 assert.equal(validateSpecialFeedV171(forged),false);
 assert.equal(restoreSpecialFeedV171(forged,{ownerId:'player',expectedTotal:initial}),null);
 const before=JSON.stringify(forged);
 assert.equal(advanceSpecialReloadV171(forged,'safe',1),false);
 assert.equal(JSON.stringify(forged),before,'rejected reload must be atomic');
 assert.equal(advanceSpecialReloadV171(s,'safe',1),true);
 assert.equal(s.loaded,3);
 assert.equal(s.reserve,0);
 assert.equal(specialFeedTotalV171(s),initial);
});
test('V171 restored special-feed geometry rejects fake chambers and retained cases',()=>{
 const single=make('single',1,4),cylinder=make('cylinder',6,10),tube=make('tube',2,10);
 single.capacity=8;
 cylinder.spentCases=3;
 tube.needsCycle=true; // cannot be cycling when no shell was fired
 for(const invalid of [single,cylinder,tube]){
   assert.equal(validateSpecialFeedV171(invalid),false);
   assert.equal(restoreSpecialFeedV171(invalid),null);
   assert.equal(captureSpecialFeedV171(invalid),null);
 }
 const interrupted=make('tube',2,6);
 assert.equal(beginSpecialReloadV171(interrupted,'partial'),true);
 assert.equal(advanceSpecialReloadV171(interrupted,'partial',.5),true);
 const state=captureSpecialFeedV171(interrupted);
 assert.ok(state&&state.pending&&state.pending.inserted>0);
 assert.deepEqual(restoreSpecialFeedV171(state,{ownerId:'player',expectedTotal:8}),state);
 assert.equal(cancelSpecialReloadV171(interrupted,'partial'),true);
 assert.equal(specialFeedTotalV171(interrupted),8);
});
