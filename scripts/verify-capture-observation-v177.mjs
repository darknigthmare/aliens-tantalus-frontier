import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

// Exercise the exact read-only browser observer, not a second implementation.
// These are callback fixtures; native menu duels remain a separate browser QA.
const python=readFileSync(new URL('./qa-xeno-trials-capture-v163.py',import.meta.url),'utf8');
const source=python.match(/PLAYER_STARTUP_OBSERVER_V177 = r'''([\s\S]*?)'''/)[1];
function fixture(){
  const frames=[],copies=[],encodings=[],floorArms=[];let now=0;
  const match={config:{matchId:'qa-match'},round:1,tick:10,phase:'active',grappleV153:null,
    fighters:[{id:'prowler',side:'player',stats:{specials:0},attack:null},
      {id:'guardian',side:'cpu',stats:{specials:0},attack:null}],events:[],rigViewsV154:[]};
  const state={match},canvas={width:1000,height:560};
  const context={structuredClone,performance:{now:()=>now},requestAnimationFrame:fn=>frames.push(fn),
    __ATF_XENO_TRIALS_V96__:{snapshot:()=>state},document:{querySelector:()=>canvas,
      createElement:()=>({getContext:()=>({drawImage:(...a)=>copies.push(a)}),
        toDataURL:()=>{encodings.push(true);return 'recorded-png';}})}};
  context.__ATF_ARM_CAPTURE_FLOOR_V179__=config=>{
    floorArms.push(structuredClone(config));
    context.__ATF_CAPTURE_OBSERVER_V163__={floor:{expected:config,ready:false,cancelled:false}};
    return{armed:true};
  };
  const arm=runInNewContext('('+source+')',context);
  const config={matchId:'qa-match',round:1,playerId:'prowler',targetId:'guardian',
    attemptNumber:1,lastEventId:2,specialsBefore:0,specialStartup:.29,after:true,timeoutMs:55000};
  return{state,match,canvas,context,config,copies,encodings,floorArms,
    arm:extra=>arm({...config,...extra}),step:()=>{const fn=frames.shift();assert.ok(fn);fn();},
    advance:ms=>{now+=ms;},out:()=>context.__ATF_PLAYER_STARTUP_PROOF_V177__};
}
function startup(f){
  f.match.tick=11;f.match.fighters[0].attack={id:3,kind:'special',age:.06};
  f.match.fighters[0].stats.specials=1;
  f.match.events=[{id:4,type:'attack',side:'player',kind:'special',tick:11}];
  f.match.rigViewsV154=[{side:'player',preparationV163:true,clip:'special-windup'}];
}
test('a native startup bitmap is frozen before delayed PNG encoding and later hold observation',()=>{
  const f=fixture();f.arm();startup(f);const original=structuredClone(f.state);f.step();
  assert.equal(f.out().ready,true);assert.equal(f.copies.length,1);assert.equal(f.encodings.length,0);
  assert.deepEqual(f.state,original,'The observer may not change combat state');
  f.match.tick=40;f.match.fighters[0].attack=null;f.match.grappleV153={id:'hold'};
  assert.equal(f.out().frame.state.match.tick,11);assert.equal(f.out().frame.state.match.fighters[0].attack.age,.06);
  assert.equal(f.out().frame.preparationProof.attackEventId,4);
  assert.equal(f.out().frame.bitmap.toDataURL(), 'recorded-png');assert.equal(f.encodings.length,1);
});
test('a hold without a rendered preparation cannot acquire a fabricated startup proof',()=>{
  const f=fixture();f.arm();startup(f);f.match.rigViewsV154=[];f.match.grappleV153={id:'hold'};f.step();
  assert.equal(f.out().ready,false);assert.equal(f.out().frame,null);assert.match(f.out().error,/without an observed startup/);
  assert.equal(f.copies.length,0);
});
test('a stale or foreign attack and unchanged native counter cannot be bound to a key attempt',()=>{
  for(const change of [f=>{f.match.events[0].id=2;},f=>{f.match.events[0].side='cpu';},
    f=>{f.match.fighters[0].stats.specials=0;}]){
    const f=fixture();f.arm();startup(f);change(f);f.step();
    assert.equal(f.out().accepted,null);assert.equal(f.out().ready,false);assert.equal(f.copies.length,0);
  }
});
test('an accepted event cannot borrow a preparation from a different native attack serial',()=>{
  const f=fixture();f.arm();startup(f);f.match.fighters[0].attack.id=9;
  f.match.grappleV153={id:'hold'};f.step();
  assert.equal(f.out().ready,false);assert.equal(f.out().frame,null);assert.equal(f.copies.length,0);
  assert.match(f.out().error,/without an observed startup/);
});
test('match, round and participants are immutable observer ownership boundaries',()=>{
  for(const change of [f=>{f.match.config.matchId='other';},f=>{f.match.round=2;},
    f=>{f.match.fighters[0].id='other';},f=>{f.match.fighters[1].id='other';}]){
    const f=fixture();f.arm();startup(f);change(f);f.step();
    assert.equal(f.out().done,true);assert.equal(f.out().ready,false);assert.match(f.out().error,/cannot replace/);
  }
});
test('the original remaining time budget and attempt replacement cancel stale callbacks',()=>{
  const f=fixture();f.arm({timeoutMs:20});f.advance(21);f.step();
  assert.equal(f.out().done,true);assert.match(f.out().error,/remaining original acquisition budget/);
  const g=fixture();g.arm();const first=g.out();g.arm({attemptNumber:2});g.step();
  assert.equal(first.cancelled,true);assert.equal(g.copies.length,0);startup(g);g.step();
  assert.equal(g.out().frame.preparationProof.attackEventId,4);assert.equal(g.out().accepted.attemptNumber,2);
});

test('accepted startup arms a same-attempt floor child with exact identity before any external read',()=>{
 const f=fixture();f.arm({captureFloor:true});startup(f);const original=structuredClone(f.state);f.step();
 assert.equal(f.floorArms.length,1);const binding=f.floorArms[0];
 assert.equal(binding.matchId,f.config.matchId);assert.equal(binding.round,f.config.round);
 assert.deepEqual(binding.fighterIds,['prowler','guardian']);assert.deepEqual(binding.sides,['player','cpu']);
 assert.equal(binding.attackEventId,4);assert.equal(binding.startupAttemptNumber,1);
 assert.equal(binding.holdId,null);assert.equal(binding.sinceTick,11);assert.equal(binding.timeoutMs,45000);
 assert.equal(f.out().ready,true);assert.equal(f.encodings.length,0);assert.deepEqual(f.state,original);
});
test('foreign or mismatched startup events cannot arm a floor child',()=>{
 for(const change of [f=>{f.match.fighters[0].attack.id=9;},f=>{f.match.fighters[1].id='other';},
  f=>{f.match.events[0].side='cpu';}]){
  const f=fixture();f.arm({captureFloor:true});startup(f);change(f);f.step();
  assert.equal(f.floorArms.length,0);assert.equal(f.out().ready,false);
 }
});
test('attempt replacement cancels its pending floor child and preserves a completed first floor',()=>{
 const f=fixture();f.arm({captureFloor:true});startup(f);f.step();
 const child=f.context.__ATF_CAPTURE_OBSERVER_V163__.floor;
 f.arm({attemptNumber:2,captureFloor:true});assert.equal(child.cancelled,true);
 const g=fixture();g.arm({captureFloor:true});startup(g);g.step();
 const done=g.context.__ATF_CAPTURE_OBSERVER_V163__.floor;done.ready=true;
 const owner=g.out(),result=g.arm({attemptNumber:2,captureFloor:true});
 assert.match(result.error,/completed first native floor/);assert.equal(g.out(),owner);assert.equal(done.cancelled,false);
});
test('startup cancellation retains a successful child and cancels only a failed child owned by this attempt',()=>{
 const cancelSource=python.match(/PLAYER_STARTUP_CANCEL_V179 = r'''([\s\S]*?)'''/)[1];
 for(const keep of [false,true]){
  const f=fixture();f.arm({captureFloor:true});startup(f);f.step();
  const child=f.context.__ATF_CAPTURE_OBSERVER_V163__.floor;
  const cancel=runInNewContext('('+cancelSource+')',f.context);cancel(keep);
  assert.equal(f.out().cancelled,true);assert.equal(child.cancelled,!keep);
 }
 const f=fixture();f.arm({captureFloor:true});startup(f);f.step();
 const child=f.context.__ATF_CAPTURE_OBSERVER_V163__.floor;child.expected={...child.expected,startupAttemptNumber:7};
 runInNewContext('('+cancelSource+')',f.context)(false);assert.equal(child.cancelled,false);
});
