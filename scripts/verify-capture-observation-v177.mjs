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
  const frames=[],copies=[],encodings=[];let now=0;
  const match={config:{matchId:'qa-match'},round:1,tick:10,phase:'active',grappleV153:null,
    fighters:[{id:'prowler',side:'player',stats:{specials:0},attack:null},
      {id:'guardian',side:'cpu',stats:{specials:0},attack:null}],events:[],rigViewsV154:[]};
  const state={match},canvas={width:1000,height:560};
  const context={structuredClone,performance:{now:()=>now},requestAnimationFrame:fn=>frames.push(fn),
    __ATF_XENO_TRIALS_V96__:{snapshot:()=>state},document:{querySelector:()=>canvas,
      createElement:()=>({getContext:()=>({drawImage:(...a)=>copies.push(a)}),
        toDataURL:()=>{encodings.push(true);return 'recorded-png';}})}};
  const arm=runInNewContext('('+source+')',context);
  const config={matchId:'qa-match',round:1,playerId:'prowler',targetId:'guardian',
    attemptNumber:1,lastEventId:2,specialsBefore:0,specialStartup:.29,after:true,timeoutMs:55000};
  return{state,match,canvas,context,config,copies,encodings,
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
  targetId:'guardian',holdId:null,sinceTick:11,after:true,attackEventId:4});
 f.advance(200);f.match.tick=35;f.match.grappleV153={id:'later-hold'};
 assert.equal(calls.length,1,'A delayed client cannot replace the observer for the first accepted special.');
 assert.equal(f.out().frame.state.match.tick,11);
 for(const mode of ['missing','rejected']){
  const g=fixture();if(mode==='rejected')g.context.__ATF_ARM_CAPTURE_FLOOR_V207__=()=>({error:'wrong-first-floor'});
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

test('the actual Python driver rereads contact after arming instead of attacking the pre-transfer recovery pose',()=>{
 // Replay two disclosed observations from the native client200 regression.
 // This tests call ordering, not a second combat simulation or capture claim.
 const result=JSON.parse(execFileSync('python3',['-B','-c',String.raw`
import ast,json,sys,time
from pathlib import Path
tree=ast.parse(Path(sys.argv[1]).read_text());scope={'json':json,'time':time}
for n in tree.body:
 if isinstance(n,ast.Assign) and isinstance(n.value,ast.Constant) and isinstance(n.value.value,str):
  for target in n.targets:
   if isinstance(target,ast.Name):scope[target.id]=n.value.value
functions=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name in ['acquire_player_capture','get_frame']]
exec(compile(ast.Module(body=functions,type_ignores=[]),'<actual-python-driver-order>','exec'),scope)
def observation(tick,gap,recovery):
 player={'id':'prowler','side':'player','x':419.66180577449063,'y':0,'vy':0,'hp':185,'stamina':100,'stun':0,'guard':False,'attack':None,'specialCooldown':0,'stats':{'specials':0}}
 target={'id':'import-game-dd-wy-commando','side':'opponent','x':574.5,'y':0,'vy':0,'hp':220,'stamina':80,'stun':0,'guard':False,'attack':{'kind':'light','age':.366666666666667 if recovery else .06666666666666667}}
 return {'match':{'config':{'matchId':'observed-client-transfer'},'tick':tick,'round':1,'phase':'active','paused':False,'presentation':{'blocksSimulation':False},'fighters':[player,target],'events':[]},'direction':1,'gap':gap,'playerBody':{'center':400},'targetBody':{'center':500},'targetAhead':True,'verticalOverlap':True,'specialCost':40,'specialStartup':.29,'targetThreat':not recovery,'targetRecovery':recovery,'startupObservation':None}
class Page:
 def __init__(self):self.reads=0;self.events=[];self.keyboard=self
 def evaluate(self,code,arg=None):
  if 'const G=await import(' in code:
   self.reads+=1;self.events.append('read')
   if self.reads==1:return observation(205,4,True)
   if self.reads==2:return observation(261,19,False)
   raise RuntimeError('probe-complete')
  if code==scope['PLAYER_STARTUP_OBSERVER_V177']:self.events.append('arm')
  return {'armed':True}
 def up(self,key):self.events.append('up:'+key)
 def down(self,key):self.events.append('down:'+key)
 def press(self,key,delay=0):self.events.append('press:'+key)
 def wait_for_timeout(self,ms):assert ms==20
p=Page();trace={}
try:scope['acquire_player_capture'](p,True,trace)
except RuntimeError as error:assert str(error)=='probe-complete'
assert 'press:KeyL' not in p.events, p.events
assert p.events.index('arm')<p.events.index('read',p.events.index('arm')),p.events
assert trace['timeLimitSeconds']==55 and trace['attemptLimit']==32
print(json.dumps({'events':p.events,'attempts':trace['attempts']}))
`,process.env.ATF_CAPTURE_DRIVER_SOURCE||new URL('./qa-xeno-trials-capture-v163.py',import.meta.url).pathname],{encoding:'utf8'}));
 assert.equal(result.attempts.length,0);assert.ok(result.events.includes('arm'));
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
   if(reads===4){advance(20);atProbe=h.runtime.getState();value='probe-complete';}
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
