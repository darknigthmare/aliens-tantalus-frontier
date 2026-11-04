import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { execFileSync } from 'node:child_process';

// Exercise the exact read-only browser observer, not a second implementation.
// These are callback fixtures; native menu duels remain a separate browser QA.
const python=readFileSync(process.env.ATF_CAPTURE_DRIVER_SOURCE||new URL('./qa-xeno-trials-capture-v163.py',import.meta.url),'utf8');
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
  context.__ATF_ARM_CAPTURE_FLOOR_V207__=config=>{
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

test('accepted startup arms exactly its first floor before returning to a delayed client',()=>{
 const f=fixture(),calls=[];
 f.context.__ATF_ARM_CAPTURE_FLOOR_V207__=binding=>{calls.push(binding);return{armed:true};};
 f.arm({captureFloor:true});startup(f);f.step();
 assert.equal(f.out().ready,true);assert.equal(calls.length,1);assert.equal(f.encodings.length,0);
 const binding=JSON.parse(JSON.stringify(calls[0]));
 assert.deepEqual(binding,{stage:'floor',timeoutMs:45000,matchId:'qa-match',round:1,
  fighterIds:['prowler','guardian'],sides:['player','cpu'],attackerSide:'player',targetSide:'cpu',
  targetId:'guardian',holdId:null,sinceTick:11,after:true,attackEventId:4,startupAttemptNumber:1});
 f.advance(200);f.match.tick=35;f.match.grappleV153={id:'later-hold'};
 assert.equal(calls.length,1,'A delayed client cannot replace the observer for the first accepted special.');
 assert.equal(f.out().frame.state.match.tick,11);
 for(const mode of ['missing','rejected']){
  const g=fixture();delete g.context.__ATF_ARM_CAPTURE_FLOOR_V207__;
  if(mode==='rejected')g.context.__ATF_ARM_CAPTURE_FLOOR_V207__=()=>({error:'wrong-first-floor'});
  g.arm({captureFloor:true});startup(g);g.step();
  assert.equal(g.out().ready,false);assert.ok(g.out().error);assert.equal(g.encodings.length,0);
 }
});

test('deferred PNG belongs to the accepted startup bitmap, never later floor pixels or a changed global',()=>{
 const literal=python.match(/PLAYER_STARTUP_EXPORT_V179 = r'''([\s\S]*?)'''/);
 // The before/after regression also executes the original inline export,
 // rather than failing merely because its new named literal did not exist.
 const exportSource=literal?literal[1]:JSON.parse(execFileSync('python3',['-B','-c',String.raw`
import ast,json,sys
from pathlib import Path
tree=ast.parse(Path(sys.argv[1]).read_text())
expressions=[n.value for n in ast.walk(tree) if isinstance(n,ast.Constant) and isinstance(n.value,str)
 and '__ATF_PLAYER_STARTUP_PROOF_V177__' in n.value and '.bitmap.toDataURL(' in n.value]
assert len(expressions)==1
print(json.dumps(expressions[0]))
`,process.env.ATF_CAPTURE_DRIVER_SOURCE||new URL('./qa-xeno-trials-capture-v163.py',import.meta.url).pathname],{encoding:'utf8'}));
 const make=()=>{
  const f=fixture();f.arm();startup(f);f.step();
  const frame=f.out().frame;
  const expected={matchId:frame.state.match.config.matchId,round:frame.state.match.round,
   participants:frame.state.match.fighters.map(v=>[v.id,v.side]),proof:structuredClone(frame.preparationProof)};
  f.match.tick=90;f.match.grappleV153={id:'floor-hold'};f.match.fighters[0].attack=null;
  f.canvas.toDataURL=()=>assert.fail('The live floor canvas cannot supply a startup image.');
  return{f,expected,exportFrame:runInNewContext('('+exportSource+')',f.context)};
 };
 const good=make(),frame=good.exportFrame(good.expected);
 assert.equal(frame.png,'recorded-png');assert.equal(frame.state.match.tick,11);
 assert.equal(frame.state.match.grappleV153,null);assert.equal(good.f.encodings.length,1);
 for(const change of [
  o=>{o.ready=false;},o=>{o.frame=null;},o=>{o.frame.state.match.config.matchId='other';},
  o=>{o.frame.state.match.round=2;},o=>{o.frame.state.match.fighters[1].id='other';},
  o=>{o.frame.state.match.fighters[1].side='player';},o=>{o.accepted.attackEventId++;},
  ...['attackId','attackEventId','attackEventTick','frameTick','attackAge','clip']
   .map(key=>o=>{o.frame.preparationProof[key]=key==='clip'?'floor-pin':o.frame.preparationProof[key]+1;})]){
  const c=make();change(c.f.out());assert.equal(c.exportFrame(c.expected),null);
  assert.equal(c.f.encodings.length,0,'Rejected ownership must not encode an unrelated bitmap.');
 }
});

test('pose read arms only evidence atomically without a second transport or a control action',async()=>{
 const modules={};for(const name of ['xeno-trials-geometry-v105.js','xeno-trials-signatures-v147.js','xeno-trials-data-v96.js','xeno-trials-engine-v96.js'])
  modules[name]=await import(new URL('../src/'+name,import.meta.url));
 const literal=python.match(/read_contact = r\x27\x27\x27([\s\S]*?)\x27\x27\x27/)[1]
  .replace(/await import\('\/src\/([^']+)'\)/g,(_all,name)=>'modules['+JSON.stringify(name)+']');
 const initial=()=>{const m=modules['xeno-trials-engine-v96.js'].createXenoTrialsMatchV96({playerId:'prowler',opponentId:'import-game-dd-wy-commando',introSeconds:0,seed:96001,difficulty:'hard'});
  m.presentation={blocksSimulation:false};return m;};
 const make=change=>{const m=initial();change?.(m);const before=structuredClone(m),arms=[];let reads=0;
  const context={modules,__ATF_XENO_TRIALS_V96__:{snapshot:()=>{reads++;return{match:structuredClone(m)};}},
   __ATF_ARM_PLAYER_STARTUP_V181__:c=>{arms.push(c);context.__ATF_PLAYER_STARTUP_PROOF_V177__={expected:c,ready:false,accepted:null};},
   document:new Proxy({},{get(){throw Error('A pose read must not emit controls or compress pixels');}})};
  return{m,before,arms,context,reads:()=>reads,read:runInNewContext('('+literal+')',context)};};
 const c={attemptNumber:1,after:true,timeoutMs:54900},f=make();
 const value=await f.read(c);assert.equal(f.reads(),1);assert.equal(f.arms.length,1);
 const arm=JSON.parse(JSON.stringify(f.arms[0]));
 assert.equal(arm.matchId,value.match.config.matchId);assert.equal(arm.round,value.match.round);
 assert.equal(arm.playerId,value.match.fighters[0].id);assert.equal(arm.targetId,value.match.fighters[1].id);
 assert.equal(arm.attemptNumber,1);assert.equal(arm.specialsBefore,value.match.fighters[0].stats.specials);
 assert.equal(arm.captureFloor,true);assert.equal(arm.timeoutMs,54900);
 assert.equal(value.startupObservation.attemptNumber,1);assert.equal(value.startupObservation.round,value.match.round);
 await f.read(c);assert.equal(f.arms.length,1,'Repeated poses must not replace an already prepared attempt.');
 await f.read({...c,attemptNumber:2});assert.equal(f.arms.length,2);
 assert.deepEqual(f.m,f.before,'Only detached QA evidence may change.');
 for(const change of [m=>m.phase='round-over',m=>m.paused=true,m=>m.presentation.blocksSimulation=true,
  m=>m.grappleV153={id:7},m=>m.fighters[0].attack={kind:'light',age:0},m=>m.fighters[0].stun=.1,
  m=>m.fighters[0].y=1,m=>m.fighters[0].specialCooldown=.1,m=>m.fighters[0].stamina=0]){
  const g=make(change);await g.read(c);assert.equal(g.arms.length,0);assert.deepEqual(g.m,g.before);
 }
 const g=make(),proof={attackId:4,attackEventId:5,attackEventTick:140,frameTick:142,attackAge:.02,clip:'special-windup'};
 g.context.__ATF_PLAYER_STARTUP_PROOF_V177__={expected:arm,ready:true,accepted:{attemptNumber:1,attackEventId:5},
  frame:{state:{match:{tick:142}},preparationProof:proof,bitmap:{toDataURL(){throw Error('PNG must wait for the real floor pause');}}}};
 const metadata=(await g.read(c)).startupObservation;assert.equal(metadata.frame.preparationProof.attackEventId,5);
 assert.equal(metadata.frame.state.match.tick,142);assert.equal(metadata.frame.deferredStartupBitmapV177,true);
 assert.equal(g.arms.length,0);
});

test('actual Python keys preserve their special reserve, anticipate threats and release for a fatigued recovering target with one pose RPC',()=>{
 // Declared pose replay tests the real Python policy and RPC order. It does not
 // claim a second native combat, browser rendering or latency qualification.
 const result=JSON.parse(execFileSync('python3',['-B','-c',String.raw`
import ast,json,sys,time
from pathlib import Path
tree=ast.parse(Path(sys.argv[1]).read_text());scope={'json':json,'time':time}
for n in tree.body:
 if isinstance(n,ast.Assign) and isinstance(n.value,ast.Constant) and isinstance(n.value.value,str):
  for target in n.targets:
   if isinstance(target,ast.Name):scope[target.id]=n.value.value
functions=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name in ['acquire_player_capture','get_frame']]
exec(compile(ast.Module(body=functions,type_ignores=[]),'<actual-python-driver-rpc-and-policy>','exec'),scope)
def observation(tick,cooldown=0,threat=False,hold=False,stamina=100,recovery=False):
 player={'id':'prowler','side':'player','x':419.66,'y':0,'vy':0,'hp':185,'stamina':stamina,'stun':0,'guard':False,'attack':None,'specialCooldown':cooldown,'stats':{'specials':int(hold)}}
 target={'id':'import-game-dd-wy-commando','side':'opponent','x':574.5,'y':0,'vy':0,'hp':220,'stamina':20 if recovery else 80,'stun':0,'guard':False,'attack':{'kind':'light','age':.06 if threat else .25} if threat or recovery else None}
 m={'config':{'matchId':'declared-policy-replay'},'tick':tick,'round':1,'phase':'active','paused':False,'presentation':{'blocksSimulation':False},'fighters':[player,target],'events':[]}
 startup={'ready':False,'accepted':None,'matchId':m['config']['matchId'],'round':1,'attemptNumber':1,'frame':None}
 if hold:
  m['grappleV153']={'id':7,'attacker':'player','target':'opponent'}
  m['events']=[{'id':5,'type':'attack','kind':'special','side':'player','tick':172},{'id':8,'type':'grapple-start-v153','grappleId':7}]
  startup.update({'ready':True,'accepted':{'attemptNumber':1,'attackEventId':5,'observedTick':174},'frame':{'state':{'match':{'tick':174}},'preparationProof':{'attackId':4,'attackEventId':5},'deferredStartupBitmapV177':True}})
 return {'match':m,'direction':1,'gap':4,'playerBody':{'center':400},'targetBody':{'center':500},'targetAhead':True,'verticalOverlap':True,'specialCost':34,'specialStartup':.32,'specialLeapSpeed':360,'specialActive':.44,'targetRecoveryRemaining':.12 if recovery else 0,'targetMeleeReach':81.7,'guardReserve':22.96,'targetPressureReserve':25,'playerStaminaMaximum':100,'playerSpeed':300,'targetSpeed':210,'targetThreat':threat,'targetRecovery':recovery,'startupObservation':startup}
class Page:
 def __init__(self):self.reads=0;self.events=[];self.keyboard=self
 def evaluate(self,code,arg=None):
  if 'const G=await import(' in code:
   self.reads+=1;self.events.append('read')
   rows=[observation(100,stamina=2),observation(124,threat=True),observation(148),observation(172,recovery=True),observation(204,hold=True)]
   assert self.reads<=len(rows),'A second post-action read or metadata transfer is unnecessary'
   return rows[self.reads-1]
  assert code.startswith('()=>{globalThis.__ATF_ARM_CAPTURE_FLOOR_V207__=') or 'o.cancelled=true' in code,'No separate evidence or pixel RPC during combat'
  return {'armed':True}
 def up(self,key):self.events.append('up:'+key)
 def down(self,key):self.events.append('down:'+key)
 def press(self,key,delay=0):
  assert delay==40 and self.reads==4,'Only the observed recovery may trigger the real special key'
  self.events.append('press:'+key)
 def wait_for_timeout(self,ms):assert ms==20
p=Page();trace={};proof=scope['acquire_player_capture'](p,True,trace)
assert p.reads==5 and p.events==['read','read','down:KeyS','read','read','up:KeyS','press:KeyL','read'],p.events
assert len(trace['attempts'])==1 and trace['attempts'][0]['nativeSpecialAccepted']
assert trace['attempts'][0]['before']['targetRecovery']==True
assert trace['attempts'][0]['after']['tick']==204
assert trace['successfulSpecial']['attackEvent']['id']==proof['preparationProof']['attackEventId']==5
assert trace['timeLimitSeconds']==55 and trace['attemptLimit']==32
print(json.dumps({'events':p.events,'attempts':len(trace['attempts']),'proof':proof['preparationProof']}))
`,process.env.ATF_CAPTURE_DRIVER_SOURCE||new URL('./qa-xeno-trials-capture-v163.py',import.meta.url).pathname],{encoding:'utf8'}));
 assert.equal(result.attempts,1);assert.equal(result.proof.attackEventId,5);
});

test('declared client delay defaults to zero and scopes 200ms to evaluate only, including failures',()=>{
 const out=JSON.parse(execFileSync('python3',['-B','-c',String.raw`
import argparse,ast,contextlib,io,json,sys
from pathlib import Path
tree=ast.parse(Path(sys.argv[1]).read_text())
helper=next(n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=='delay_client_reads')
main=next(n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=='main')
option=next(n for n in ast.walk(main) if isinstance(n,ast.Expr) and isinstance(n.value,ast.Call) and n.value.args and isinstance(n.value.args[0],ast.Constant) and n.value.args[0].value=='--client-read-delay-ms')
p=argparse.ArgumentParser();exec(compile(ast.Module(body=[option],type_ignores=[]),'<actual-delay-cli>', 'exec'),{'p':p})
assert p.parse_args([]).client_read_delay_ms==0
assert p.parse_args(['--client-read-delay-ms','200']).client_read_delay_ms==200
for invalid in ['-1','1','199','201','400','foo']:
 with contextlib.redirect_stderr(io.StringIO()):
  try:p.parse_args(['--client-read-delay-ms',invalid])
  except SystemExit as e:assert e.code==2
  else:raise AssertionError('Undeclared latency accepted')
class Clock:
 def __init__(self):self.now=0;self.waits=[]
 def monotonic(self):return self.now
 def sleep(self,seconds):self.waits.append(seconds);self.now+=seconds
class Page:
 def __init__(self):self.calls=[];self.keyboard=object()
 def evaluate(self,expression,*args,**kwargs):
  self.calls.append((expression,args,kwargs))
  if expression=='fail':raise RuntimeError('observed failure')
  return {'expression':expression,'args':args,'kwargs':kwargs}
 def wait_for_function(self,*args):return 'native wait unchanged'
for delay in (0,200):
 clock=Clock();scope={'time':clock};exec(compile(ast.Module(body=[helper],type_ignores=[]),'<actual-client-delay>','exec'),scope)
 page=Page();keyboard=page.keyboard;wait=page.wait_for_function.__func__
 receipt=scope['delay_client_reads'](page,delay)
 for repeated in (0,200):
  try:scope['delay_client_reads'](page,repeated)
  except ValueError as e:assert 'only once' in str(e)
  else:raise AssertionError('Double installation would conceal an extra delay')
 assert clock.waits==[] and receipt['evaluateCalls']==0
 value=page.evaluate('pose',arg={'attemptNumber':3});assert value['kwargs']=={'arg':{'attemptNumber':3}}
 assert page.keyboard is keyboard and page.wait_for_function.__func__ is wait
 assert page.wait_for_function('ready')=='native wait unchanged'
 try:page.evaluate('fail')
 except RuntimeError as e:assert str(e)=='observed failure'
 else:raise AssertionError('The wrapper swallowed an evaluate failure')
 assert receipt['evaluateCalls']==len(page.calls)==2
 assert receipt['beforeMs']==receipt['afterMs']==delay//2
 assert receipt['totalRequestedSleepMs']==delay*2
 assert abs(receipt['measuredSleepSeconds']-delay*2/1000)<1e-12
 assert clock.waits==([.1]*4 if delay else [])
 assert not receipt['runtimeFieldsWritten'] and not receipt['schedulerPatched'] and not receipt['injectedController']
 for invalid in (-1,1,199,201,400,0.0,200.0,True,False,'200'):
  try:scope['delay_client_reads'](Page(),invalid)
  except ValueError:pass
  else:raise AssertionError('Undeclared latency accepted')
print(json.dumps({'defaultDelayMs':0,'stressDelayMs':200,'onlyPageEvaluate':True,'errorsPreserved':True}))
`,new URL('./qa-xeno-trials-capture-v163.py',import.meta.url).pathname],{encoding:'utf8'}));
 assert.equal(out.defaultDelayMs,0);assert.equal(out.stressDelayMs,200);assert.equal(out.onlyPageEvaluate,true);
});

test('fixture cache reuses exact ordinary Save-picker bytes and rejects all changes except valid root dates',()=>{
 const out=JSON.parse(execFileSync('python3',['-B','-c',String.raw`
import ast,json,subprocess,sys,tempfile
from pathlib import Path
tree=ast.parse(Path(sys.argv[1]).read_text());helper=next(n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=='fixture')
repo=Path(sys.argv[1]).resolve().parents[1];scope={'Path':Path,'REPO':repo,'json':json,'subprocess':subprocess}
exec(compile(ast.Module(body=[helper],type_ignores=[]),'<actual-save-fixture-cache>','exec'),scope)
ids=['import-game-dd-wy-commando','import-game-dd-guardian','dd-darwin-era-cultist','prowler'];name='declared-fixture-cache-test'
with tempfile.TemporaryDirectory(prefix='atf-capture-fixture-') as tmp:
 directory=Path(tmp);raw,roster=scope['fixture'](ids,name,directory);path=directory/(name+'.json')
 assert path.read_bytes()==raw
 cached,again=scope['fixture'](ids,name,directory);assert cached==raw and again==roster
 original=json.loads(raw);dated=json.loads(raw);dated['createdAt']-=12345;dated['updatedAt']-=123
 dated_raw=json.dumps(dated).encode();path.write_bytes(dated_raw)
 assert scope['fixture'](ids,name,directory)[0]==dated_raw
 dated['createdAt']=0;dated['updatedAt']=8640000000000000
 dated_raw=json.dumps(dated).encode();path.write_bytes(dated_raw)
 assert scope['fixture'](ids,name,directory)[0]==dated_raw
 changes=[lambda x:x['player'].update(health=1),lambda x:x['player']['weaponIds'].append('unearned-weapon'),
  lambda x:x['player']['equipmentIds'].append('unearned-equipment'),lambda x:x['player'].update(name='foreign-id'),
  lambda x:x['xenoTrialsV96'].update(credits=999999),lambda x:x['xenoTrialsV96'].update(serial=1),
  lambda x:x['xenoTrialsV96'].update(serial=False),lambda x:x['xenoTrialsV96'].update(seed=1),
  lambda x:x['xenoTrialsV96'].update(hp=1),lambda x:x['xenoTrialsV96']['unlocked'].pop(),
  lambda x:x['xenoTrialsV96']['ledger'].append({'fake':'reward'}),lambda x:x.update(createdAt='foreign'),
  lambda x:x.update(updatedAt=True),lambda x:x.update(createdAt=float('nan')),
  lambda x:x.update(createdAt=9000000000000000),lambda x:x.update(createdAt=1.5),
  lambda x:x.update(updatedAt=-1)]
 for change in changes:
  modified=json.loads(raw);change(modified);path.write_text(json.dumps(modified))
  try:scope['fixture'](ids,name,directory)
  except ValueError:pass
  else:raise AssertionError('Foreign Save-picker state was admitted')
 path.write_text('[]')
 try:scope['fixture'](ids,name,directory)
 except ValueError:pass
 else:raise AssertionError('Non-object save admitted')
 try:scope['fixture'](ids,name,repo)
 except ValueError:pass
 else:raise AssertionError('Fixture cache inside source was admitted')
 try:scope['fixture'](ids,'../escape',directory)
 except ValueError:pass
 else:raise AssertionError('Fixture cache escaped its directory')
print(json.dumps({'exactBytesReused':True,'allowedChanges':['createdAt','updatedAt'],'mutationsRejected':len(changes)+3}))
`,new URL('./qa-xeno-trials-capture-v163.py',import.meta.url).pathname],{encoding:'utf8'}));
 assert.equal(out.exactBytesReused,true);assert.equal(out.mutationsRejected,20);
});

test('the actual CI error print preserves bounded acquisition, input reset and terminal diagnostics without image payloads',()=>{
 const out=JSON.parse(execFileSync('python3',['-B','-c',String.raw`
import ast,json,sys
from pathlib import Path
tree=ast.parse(Path(sys.argv[1]).read_text());helper=next(n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=='capture_acquisition_diagnostic')
prints=[n for n in ast.walk(tree) if isinstance(n,ast.Expr) and isinstance(n.value,ast.Call) and isinstance(n.value.func,ast.Name) and n.value.func.id=='print' and any(isinstance(c,ast.Constant) and c.value=='CAPTURE_ACQUISITION_DIAGNOSTIC ' for c in ast.walk(n))]
assert len(prints)==1
scope={'json':json};exec(compile(ast.Module(body=[helper],type_ignores=[]),'<actual-compact-ci-diagnostic>','exec'),scope)
pixel='unrelated-pixel-payload'*10000
row={'tick':2792,'round':2,'phase':'match-over','gap':42,'targetThreat':False,'targetRecovery':False,'player':{'x':115,'y':0,'hp':0,'stamina':30,'stun':.13,'guard':False,'stats':{'specials':3},'attack':None,'png':pixel},'target':{'x':300,'y':0,'hp':220,'attack':{'kind':'light','age':.4,'png':pixel}}}
trace={'profile':'qa-trials-capture-v163-wy-commando-player-captor','status':'failed','elapsedSeconds':26.16,'timeLimitSeconds':55,'attemptLimit':32,'observations':[row]*1000,'attempts':[{'number':3,'nativeSpecialAccepted':True,'attackEventId':39,'before':{'tick':1005,'round':1,'gap':4},'after':{'tick':1061,'round':1,'gap':70.5},'png':pixel}]*32,'inputResets':[{'tick':1493,'round':2,'phase':'active','presentationBlocked':True,'releasedMove':'ArrowRight','releasedGuard':False,'png':pixel}]*10,'terminalBeforeCapture':{'tick':2792,'round':2,'winner':'opponent','reason':'ko'},'png':pixel}
lines=[];scope.update({'acquisition':trace,'print':lambda value,**kwargs:lines.append(value)})
exec(compile(ast.Module(body=prints,type_ignores=[]),'<actual-ci-error-print>','exec'),scope)
assert len(lines)==1 and lines[0].startswith('CAPTURE_ACQUISITION_DIAGNOSTIC ')
encoded=lines[0].split(' ',1)[1];assert len(encoded)<=3000 and 'unrelated-pixel-payload' not in encoded
data=json.loads(encoded);assert data['terminal']==trace['terminalBeforeCapture']
assert len(data['observations'])==3 and len(data['attempts'])==2 and len(data['inputResets'])==3
assert data['attemptsTotal']==32 and data['inputResets'][-1]['releasedMove']=='ArrowRight'
trace['terminalBeforeCapture']['reason']='x'*10000
assert len(scope['capture_acquisition_diagnostic'](trace))<=3000
print(json.dumps({'bytes':len(encoded),'diagnostic':data}))
`,new URL('./qa-xeno-trials-capture-v163.py',import.meta.url).pathname],{encoding:'utf8'}));
 assert.ok(out.bytes<=3000);assert.equal(out.diagnostic.terminal.reason,'ko');
});


test('actual Python acquisition reissues native keys after a CPU-earned round and countdown',{timeout:20000},async t=>{
 const {spawn}=await import('node:child_process');
 const {createInterface}=await import('node:readline');
 const {createContext,runInContext}=await import('node:vm');
 const {pathToFileURL,fileURLToPath}=await import('node:url');
 // The declared long client read straddles a naturally CPU-earned round.
 // DOM/images/RAF are doubles; runtime, keyboard handlers and Python policy
 // are real. No HP, RNG, result, position or simulation method is assigned.
const repo=fileURLToPath(new URL('../',import.meta.url)).replace(/\/$/,'');
const source=process.env.ATF_CAPTURE_DRIVER_SOURCE||repo+'/scripts/qa-xeno-trials-capture-v163.py';
const runtime=await import(pathToFileURL(repo+'/src/xeno-trials-runtime-v96.js'));
const ui=await import(pathToFileURL(repo+'/src/xeno-trials-ui-v96.js'));
const atlases=(await import(pathToFileURL(repo+'/src/xeno-trials-capture-data-v163.js'))).XENO_TRIALS_CAPTURE_ATLASES_V163;
const rigs=(await import(pathToFileURL(repo+'/src/xeno-trials-rig-v154.js'))).XENO_TRIALS_RIGS_V154;
const images=new Map([...atlases,...rigs].map(a=>[a.path,{naturalWidth:a.sourceWidth,naturalHeight:a.sourceHeight,complete:true}]));
const verifier=readFileSync(repo+'/scripts/verify-xeno-trials-capture-v163.mjs','utf8');
let fixtureSource=verifier.slice(verifier.indexOf('function captureEventTarget('),verifier.indexOf('async function nativePlayerCaptureForPause('));
assert.match(fixtureSource,/seed:153/);assert.match(fixtureSource,/roundSeconds:120/);
fixtureSource=fixtureSource.replace('seed:153','seed:96001').replace('roundSeconds:120','roundSeconds:99');
const fixtureContext=createContext({assert,images,XenoTrialsUiV96:ui.XenoTrialsUiV96,createXenoTrialsRuntimeV96:runtime.createXenoTrialsRuntimeV96});
const createHost=runInContext('(()=>{'+fixtureSource+';return captureRuntimeHost;})()',fixtureContext);
const h=createHost();await h.start();
assert.equal(h.runtime.getState().config.seed,96001);assert.equal(h.runtime.getState().config.roundSeconds,99);
const modules={};for(const name of ['xeno-trials-geometry-v105.js','xeno-trials-signatures-v147.js','xeno-trials-data-v96.js','xeno-trials-engine-v96.js'])modules[name]=await import(pathToFileURL(repo+'/src/'+name));
const context=createContext({structuredClone,modules,performance:{now:h.now},requestAnimationFrame:h.requestAnimationFrame,
 __ATF_XENO_TRIALS_V96__:{snapshot:()=>({match:h.runtime.getState()})},
 document:{querySelector:s=>s==='[data-xt="canvas"]'?h.canvas:h.element('pause'),
 createElement:()=>({getContext:()=>({drawImage(){}}),toDataURL:()=> 'data:image/png;base64,declared-dom-image-double'})}});
context.globalThis=context;h.canvas.toDataURL=()=> 'data:image/png;base64,declared-dom-image-double';
function advance(ms){h.frame(Math.ceil(ms/(1000/120)));}
const keyEvents=[],states=[];let reads=0,atProbe=null;
const python=String.raw`
import ast,json,sys
from pathlib import Path
tree=ast.parse(Path(sys.argv[1]).read_text());scope={'json':json}
for n in tree.body:
 if isinstance(n,ast.Assign) and isinstance(n.value,ast.Constant) and isinstance(n.value.value,str):
  for target in n.targets:
   if isinstance(target,ast.Name):scope[target.id]=n.value.value
now=0
def rpc(method,**data):
 global now
 print(json.dumps({'method':method,**data}),flush=True)
 response=json.loads(sys.stdin.readline());now=response['now']
 return response.get('value')
class Clock:
 def monotonic(self):return now/1000
class Keyboard:
 def down(self,key):return rpc('key',key=key,type='keydown')
 def up(self,key):return rpc('key',key=key,type='keyup')
 def press(self,key,delay=0):self.down(key);rpc('advance',ms=delay);self.up(key)
class Page:
 keyboard=Keyboard()
 def evaluate(self,expression,arg=None):
  value=rpc('evaluate',expression=expression,arg=arg)
  if value=='probe-complete':raise RuntimeError('probe-complete')
  return value
 def wait_for_timeout(self,ms):return rpc('advance',ms=ms)
page=Page();scope['time']=Clock()
helpers=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name in ['get_frame','acquire_player_capture']]
assert len(helpers)==2
exec(compile(ast.Module(body=helpers,type_ignores=[]),'<actual-python-native-capture-driver>','exec'),scope)
rpc('ready');trace={}
try:scope['acquire_player_capture'](page,True,trace)
except RuntimeError as error:assert str(error)=='probe-complete'
print(json.dumps({'method':'complete','trace':trace}),flush=True)
`;
const child=spawn('python3',['-B','-c',python,source],{stdio:['pipe','pipe','pipe']});
let stderr='';child.stderr.on('data',c=>stderr+=c);let outcome;
const done=new Promise(resolve=>child.on('exit',(code,signal)=>resolve({code,signal})));
const timer=setTimeout(()=>child.kill('SIGKILL'),15000);
try{
for await(const line of createInterface({input:child.stdout})){
 const request=JSON.parse(line);let value=null;
 if(request.method==='complete'){outcome=request.trace;continue;}
 if(request.method==='evaluate'){
  const isRead=request.expression.includes('const G=await import(');
  if(isRead){reads++;
   if(reads===2){for(let i=0;i<7200&&h.runtime.getState().round===1;i++)h.frame();assert.equal(h.runtime.getState().round,2,'The round must end through native CPU combat.');}
   if(reads===3){for(let i=0;i<1800;i++){const s=h.runtime.getState();if(s.phase==='active'&&!s.presentation.blocksSimulation)break;h.frame();}}
   // The countdown read is deliberately long. Permit one fresh pose to retire
   // the latency-aware defensive guard before measuring native movement.
   if(reads===5){advance(20);atProbe=h.runtime.getState();value='probe-complete';}
  }
  if(value!=='probe-complete'){
   const expression=request.expression.replace(/await import\('\/src\/([^']+)'\)/g,(_all,name)=>'modules['+JSON.stringify(name)+']');
   value=await runInContext('('+expression+')',context)(request.arg);
  }
  if(isRead&&value!=='probe-complete')states.push({tick:value.match.tick,round:value.match.round,phase:value.match.phase,blocked:value.match.presentation.blocksSimulation,x:value.match.fighters[0].x});
 }else if(request.method==='key'){
  const s=h.runtime.getState();keyEvents.push({key:request.key,type:request.type,round:s.round,tick:s.tick,blocked:s.presentation.blocksSimulation});h.key(request.key,request.type);
 }else if(request.method==='advance')advance(request.ms);
 child.stdin.write(JSON.stringify({now:h.now(),value})+'\n');
}
const exit=await done;assert.equal(exit.code,0,stderr);
assert.ok(atProbe&&outcome);const moved=atProbe.fighters[0].x>310;
assert.equal(outcome.timeLimitSeconds,55);assert.equal(outcome.attemptLimit,32);
assert.equal(states[1].round,2);assert.equal(states[1].blocked,true);assert.equal(states[2].blocked,false);
t.diagnostic(JSON.stringify({method:'Actual Python acquire helper with native UI/runtime, fresh menu seed96001, declared DOM/images/RAF; native CPU ends round1, no match field/RNG/HP/result assigned.',
 source,states,keyEvents,atProbe:{round:atProbe.round,tick:atProbe.tick,x:atProbe.fighters[0].x},inputResets:outcome.inputResets||[],movedAfterNativeRoundReset:moved},null,2));
assert.equal(moved,true,'The actual Python helper must release the old native key and press again after the new countdown.');

assert.ok(keyEvents.some(e=>e.key==='ArrowRight'&&e.type==='keyup'&&e.round===2&&e.blocked));
assert.ok(keyEvents.some(e=>e.key==='ArrowRight'&&e.type==='keydown'&&e.round===2&&!e.blocked));
}finally{clearTimeout(timer);if(child.exitCode===null)child.kill('SIGKILL');h.runtime.stop();}
});

// Run the actual Python controls and its actual 0/200ms delay wrapper against
// native CPU combat. Only DOM, image pixels, transport and RAF are declared
// doubles. A transport delay advances real runtime frames; it never pauses,
// edits a fighter, replaces the CPU or manufactures an accepted attack.
async function delayedNativeAcquisitionV182({phaseTicks=0,readDelayMs=200,opponentId='import-game-dd-wy-commando',transportOverheadMs=0,lateCaptureDeliveryMs=0}={}){
 const {spawn}=await import('node:child_process');
 const {createInterface}=await import('node:readline');
 const {createContext,runInContext}=await import('node:vm');
 const {pathToFileURL,fileURLToPath}=await import('node:url');
 const repo=fileURLToPath(new URL('../',import.meta.url)).replace(/\/$/,'');
 const driver=process.env.ATF_CAPTURE_DRIVER_SOURCE||repo+'/scripts/qa-xeno-trials-capture-v163.py';
 const runtime=await import(pathToFileURL(repo+'/src/xeno-trials-runtime-v96.js'));
 const ui=await import(pathToFileURL(repo+'/src/xeno-trials-ui-v96.js'));
 const atlases=(await import(pathToFileURL(repo+'/src/xeno-trials-capture-data-v163.js'))).XENO_TRIALS_CAPTURE_ATLASES_V163;
 const rigs=(await import(pathToFileURL(repo+'/src/xeno-trials-rig-v154.js'))).XENO_TRIALS_RIGS_V154;
 const images=new Map([...atlases,...rigs].map(a=>[a.path,{naturalWidth:a.sourceWidth,naturalHeight:a.sourceHeight,complete:true}]));
 const verifier=readFileSync(repo+'/scripts/verify-xeno-trials-capture-v163.mjs','utf8');
 let fixtureSource=verifier.slice(verifier.indexOf('function captureEventTarget('),verifier.indexOf('async function nativePlayerCaptureForPause('));
 assert.match(fixtureSource,/seed:153/);assert.match(fixtureSource,/roundSeconds:120/);
 fixtureSource=fixtureSource.replace('seed:153','seed:96001').replace('roundSeconds:120','roundSeconds:99')
  .replace("opponentId:'import-game-dd-wy-commando'","opponentId:"+JSON.stringify(opponentId));
 const fixtureContext=createContext({assert,images,XenoTrialsUiV96:ui.XenoTrialsUiV96,createXenoTrialsRuntimeV96:runtime.createXenoTrialsRuntimeV96});
 const h=runInContext('(()=>{'+fixtureSource+';return captureRuntimeHost;})()',fixtureContext)();
 await h.start();h.frame(55+phaseTicks);
 const initial=h.runtime.getState();
 assert.equal(initial.config.seed,96001);assert.equal(initial.config.roundSeconds,99);
 assert.equal(initial.fighters[0].id,'prowler');assert.equal(initial.fighters[1].id,opponentId);
 const modules={};
 for(const name of ['xeno-trials-geometry-v105.js','xeno-trials-signatures-v147.js','xeno-trials-data-v96.js','xeno-trials-engine-v96.js'])
  modules[name]=await import(pathToFileURL(repo+'/src/'+name));
 let wallTime=h.now(),nextFrame=wallTime+1000/60;
 const advance=ms=>{
  assert.ok(Number.isFinite(ms)&&ms>=0);
  const target=wallTime+ms;
  while(nextFrame<=target+1e-7){wallTime=nextFrame;h.frame(1,1000/60);nextFrame+=1000/60;}
  wallTime=target;
 };
 const context=createContext({structuredClone,modules,performance:{now:()=>wallTime},requestAnimationFrame:h.requestAnimationFrame,
  __ATF_XENO_TRIALS_V96__:{snapshot:()=>({match:h.runtime.getState()})},
  document:{querySelector:s=>s==='[data-xt="canvas"]'?h.canvas:h.element('pause'),
   createElement:()=>({getContext:()=>({drawImage(){}}),toDataURL:()=> 'data:image/png;base64,declared-dom-image-double'})}});
 context.globalThis=context;h.canvas.toDataURL=()=> 'data:image/png;base64,declared-dom-image-double';
 const worker=[
  'import ast,json,sys',
  'from pathlib import Path',
  'tree=ast.parse(Path(sys.argv[1]).read_text());scope={"json":json}',
  'for n in tree.body:',
  ' if isinstance(n,ast.Assign) and isinstance(n.value,ast.Constant) and isinstance(n.value.value,str):',
  '  for target in n.targets:',
  '   if isinstance(target,ast.Name):scope[target.id]=n.value.value',
  'now=0',
  'def rpc(method,**data):',
  ' global now',
  ' print(json.dumps({"method":method,**data}),flush=True)',
  ' response=json.loads(sys.stdin.readline());now=response["now"]',
  ' return response.get("value")',
  'class Clock:',
  ' def monotonic(self):return now/1000',
  ' def sleep(self,seconds):rpc("advance",ms=seconds*1000)',
  'class Keyboard:',
  ' def down(self,key):return rpc("key",key=key,type="keydown")',
  ' def up(self,key):return rpc("key",key=key,type="keyup")',
  ' def press(self,key,delay=0):self.down(key);rpc("advance",ms=delay);self.up(key)',
  'class Page:',
  ' keyboard=Keyboard()',
  ' def evaluate(self,expression,arg=None):return rpc("evaluate",expression=expression,arg=arg)',
  ' def wait_for_timeout(self,ms):return rpc("advance",ms=ms)',
  'page=Page();scope["time"]=Clock()',
  'helpers=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name in ["get_frame","acquire_player_capture","delay_client_reads"]]',
  'assert len(helpers)==3',
  'exec(compile(ast.Module(body=helpers,type_ignores=[]),"<actual-python-delayed-acquisition>","exec"),scope)',
  'rpc("ready");trace={};error=None',
  'receipt=scope["delay_client_reads"](page,int(sys.argv[2]))',
  'try:scope["acquire_player_capture"](page,True,trace)',
  'except Exception as exc:error=type(exc).__name__+": "+str(exc)',
  'print(json.dumps({"method":"complete","trace":trace,"error":error,"delay":receipt}),flush=True)'
 ].join('\n');
 const child=spawn('python3',['-B','-c',worker,driver,String(readDelayMs)],{stdio:['pipe','pipe','pipe']});
 let stderr='',outcome,delayedCapture=null;const keyEvents=[];
 child.stderr.on('data',c=>stderr+=c);
 const done=new Promise(resolve=>child.on('exit',(code,signal)=>resolve({code,signal})));
 const timer=setTimeout(()=>child.kill('SIGKILL'),30000);
 try{
  for await(const line of createInterface({input:child.stdout})){
   const request=JSON.parse(line);let value=null;
   if(request.method==='complete'){outcome=request;continue;}
   if(request.method==='evaluate'){
    advance(transportOverheadMs/2);
    const expression=request.expression.replace(/await import\('\/src\/([^']+)'\)/g,(_all,name)=>'modules['+JSON.stringify(name)+']');
    value=await runInContext('('+expression+')',context)(request.arg);
    advance(transportOverheadMs/2);
    if(lateCaptureDeliveryMs&&!delayedCapture&&value?.match?.grappleV153){
     delayedCapture={tick:value.match.tick,holdId:value.match.grappleV153.id,wallTime};
     advance(lateCaptureDeliveryMs);
    }
   }else if(request.method==='key'){
    const m=h.runtime.getState();
    keyEvents.push({key:request.key,type:request.type,tick:m.tick,round:m.round,phase:m.phase,wallTime});
    h.key(request.key,request.type);
   }else if(request.method==='advance')advance(request.ms);
   child.stdin.write(JSON.stringify({now:wallTime,value})+'\n');
  }
  const exit=await done;assert.equal(exit.code,0,stderr);assert.ok(outcome);
  return{...outcome,initial,final:h.runtime.getState(),keyEvents,phaseTicks,transportOverheadMs,delayedCapture,
   floor:context.__ATF_CAPTURE_OBSERVER_V163__?.floor,
   method:'Actual Python acquisition/delay wrapper and native CPU/UI/runtime; declared 60Hz RAF/DOM/transport doubles, no Chromium or pixel claim.'};
 }finally{
  clearTimeout(timer);if(child.exitCode===null)child.kill('SIGKILL');h.runtime.stop();
 }
}

test('native player acquisition survives 200ms client reads across nearby RAF phases',{timeout:120000},async t=>{
 for(const options of [
  {phaseTicks:3,transportOverheadMs:4},
  {phaseTicks:3,transportOverheadMs:12},
  {phaseTicks:1,transportOverheadMs:16},
  {phaseTicks:2,transportOverheadMs:16},
  {phaseTicks:0,transportOverheadMs:4},
  {phaseTicks:0,transportOverheadMs:0},
  {opponentId:'import-game-dd-guardian',readDelayMs:0,phaseTicks:3,transportOverheadMs:4},
  {opponentId:'import-game-dd-guardian',readDelayMs:200,phaseTicks:3,transportOverheadMs:4},
  {opponentId:'dd-darwin-era-cultist',readDelayMs:0,phaseTicks:3,transportOverheadMs:4},
  {opponentId:'dd-darwin-era-cultist',readDelayMs:200,phaseTicks:3,transportOverheadMs:4}
 ]){
  const out=await delayedNativeAcquisitionV182(options);
  t.diagnostic(JSON.stringify({...options,status:out.trace.status,error:out.error,elapsedSeconds:out.trace.elapsedSeconds,
   firstTick:out.trace.observations?.[0]?.tick,attempts:out.trace.attempts?.map(a=>({tick:a.before.tick,accepted:a.nativeSpecialAccepted})),
   finalTick:out.final.tick,hp:out.final.fighters.map(f=>f.hp),delay:out.delay}));
  assert.equal(out.error,null,'The actual delayed keyboard policy must earn its capture for '+JSON.stringify(options)+'.');
  assert.equal(out.trace.status,'captured');assert.equal(out.trace.timeLimitSeconds,55);assert.equal(out.trace.attemptLimit,32);
  assert.ok(out.trace.elapsedSeconds<=55);
  assert.equal(out.trace.grapple.attacker,'player');assert.equal(out.final.opponentInputSourceV163,'cpu');
  assert.ok(out.trace.successfulSpecial.preparationProof);
  assert.equal(out.delay.delayMsPerEvaluate,options.readDelayMs??200);
  assert.equal(out.delay.totalRequestedSleepMs,(options.readDelayMs??200)*out.delay.evaluateCalls);
  assert.ok(out.delay.measuredSleepSeconds>=out.delay.totalRequestedSleepMs/1000-1e-6);
 }
});

test('a native capture delivered after the unchanged acquisition deadline remains an explicit failure',{timeout:30000},async t=>{
 const out=await delayedNativeAcquisitionV182({phaseTicks:3,transportOverheadMs:4,lateCaptureDeliveryMs:56000});
 assert.ok(out.delayedCapture,'The delayed response must contain a real CPU-earned hold.');
 assert.equal(out.trace.timeLimitSeconds,55);assert.equal(out.trace.attemptLimit,32);
 assert.equal(out.trace.status,'failed');assert.match(out.error,/deadline|budget/i);
 assert.equal(out.trace.successfulSpecial,undefined);
 assert.ok(out.keyEvents.filter(e=>e.wallTime>out.delayedCapture.wallTime+55000)
  .every(e=>e.type==='keyup'),'Only input cleanup is allowed after the transport overruns the budget.');
 t.diagnostic(JSON.stringify({status:out.trace.status,error:out.error,delayedCapture:out.delayedCapture,
  elapsedSeconds:out.trace.elapsedSeconds,terminal:out.trace.terminalBeforeCapture||null}));
});

// Complementary PR36 ownership regressions retained during consolidation.
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
