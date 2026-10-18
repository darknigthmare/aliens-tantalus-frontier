import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { XENO_TRIALS_SEQUENCES_V155 as sequences, getXenoTrialsSequenceV155 as entry,
 sampleXenoTrialsSequenceV155 as sample, createXenoTrialsOutroV155 as createOutro,
 advanceXenoTrialsOutroV155 as advance, skipXenoTrialsOutroV155 as skipOutro,
 getXenoTrialsSequenceCueV155 as cue, skipXenoTrialsIntroV155 as skipIntro } from '../src/xeno-trials-sequences-v155.js';
import { XENO_TRIALS_RIGS_V154 as rigs, getXenoTrialsRigMeshV154 as mesh,
 sampleXenoTrialsSequenceAnglesV155 as skin, drawXenoTrialsRigV154 as draw,
 xenoTrialsTriangleAreaV154 as area } from '../src/xeno-trials-rig-v154.js';
import { XENO_TRIALS_FIGHTERS_V96 as roster } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsMatchV96 as create, stepXenoTrialsMatchV96 as step } from '../src/xeno-trials-engine-v96.js';
import { createXenoTrialsRuntimeV96 as runtime } from '../src/xeno-trials-runtime-v96.js';
const copy = x => JSON.parse(JSON.stringify(x));
const close = (a,b) => assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
const HUMAN = 'dd-darwin-era-cultist';
const image = r => ({naturalWidth:r.sourceWidth,naturalHeight:r.sourceHeight,complete:true});
const metrics = r => ({width:r.sourceWidth*.25,height:r.sourceHeight*.25,pivotX:.5,bottom:1});
function target(props={}) {
 const handlers=new Map();
 return Object.assign({addEventListener(k,f){if(!handlers.has(k))handlers.set(k,new Set());handlers.get(k).add(f);},
 removeEventListener(k,f){handlers.get(k)?.delete(f);},
 emit(k,e={}){for(const f of [...handlers.get(k)||[]])f({preventDefault(){},stopPropagation(){},...e});}},props);
}
function host(extra={}) {
 const window=target(),document=target({hidden:false,focused:true,hasFocus(){return this.focused;}});
 const text=[],ctx=new Proxy({fillText:s=>text.push(String(s)),measureText:s=>({width:String(s).length*7}),createLinearGradient:()=>({addColorStop(){}})}, {get:(o,k)=>o[k]||(()=>{})});
 const canvas=target({tagName:'CANVAS',width:1000,height:560,getContext:()=>ctx,setAttribute(){},closest:()=>null,focus(){document.activeElement=this;}});
 const queue=new Map(),results=[];let serial=0,time=0;
 const r=runtime({canvas,window,document,config:{playerId:HUMAN,opponentId:'prowler',seed:155,difficulty:'hard',roundSeconds:30,rulesV119:{initialHp:1}},
  loadImage:async path=>image(rigs.find(r=>r.path===path)||{sourceWidth:1000,sourceHeight:560}),
  requestAnimationFrame:f=>{queue.set(++serial,f);return serial;},cancelAnimationFrame:id=>queue.delete(id),onResult:x=>results.push(copy(x)),...extra});
 const frames=(n=1,ms=100)=>{for(let i=0;i<n;i++){time+=ms;const calls=[...queue.values()];queue.clear();for(const f of calls)f(time);assert.ok(queue.size<=1,'at most one scheduled frame');}};
 return {r,canvas,window,document,queue,results,text,frames,
  key(code,down=true){window.emit(down?'keydown':'keyup',{code,target:canvas});},
  async start(){assert.equal(await r.start(),true);},
  terminal(){for(let i=0;i<2000&&r.getState().phase!=='match-over';i++)frames();assert.equal(r.getState().phase,'match-over');}
 };
}
const physical = s => copy({tick:s.tick,time:s.timeRemaining,result:s.result,fighters:s.fighters,events:s.events,wins:s.wins,rng:s.rng,projectiles:s.projectiles});
test('twenty exact-identity sequences map four native rigs and never grant new fighter powers',()=>{
 assert.equal(sequences.length,20);assert.equal(new Set(sequences.map(s=>s.id)).size,20);assert.equal(roster.length,189);
 assert.ok(Object.isFrozen(sequences));for(const r of rigs){assert.equal(sequences.filter(s=>s.rigId===r.id).length,5);assert.equal(entry({...r},'intro'),null);}
 for(const s of sequences){assert.equal(s.canonExact,false);assert.equal(s.evidence,'original-versus-presentation');assert.ok(Object.isFrozen(s.keys));assert.equal(s.keys.length,5);}
});
for(const r of rigs) {
 test(r.fighterId+': all sequence samples retain nonfolding triangles, native supports and finite keyed timing',()=>{
  for(const seq of sequences.filter(s=>s.rigId===r.id)) {
   assert.equal(seq.keys[0].at,0);assert.equal(seq.keys.at(-1).at,1);assert.equal(new Set(seq.keys.map(k=>k.at)).size,5);
   for(let i=0;i<=120;i++) {
    const f=sample(r,{clip:seq.kind,progress:i/120,elapsed:i/120*seq.durationMs/1000});
    assert.ok(f.vertices.flat().every(Number.isFinite));
    for(const t of mesh(r).triangles)assert.ok(area(...t.map(j=>f.vertices[j]))>=area(...t.map(j=>mesh(r).vertices[j].source))*.2,seq.id);
    for(const k of ['footNear','footFar']){close(f.contacts[k][0],r.contacts[k].point[0]);close(f.contacts[k][1],r.contacts[k].point[1]);}
   }
  }
 });
 test(r.fighterId+': neutral R1/intro boundaries, final held posture and exact reduced-motion geometry',()=>{
  for(const kind of ['intro','round-win','round-loss'])for(const p of [0,1])assert.equal(sample(r,{clip:kind,progress:p,elapsed:p*1.8}).active,false);
  for(const kind of ['outro-win','outro-loss'])assert.equal(sample(r,{clip:kind,progress:1,elapsed:1.8}).active,true);
  for(const s of sequences.filter(s=>s.rigId===r.id)) {
   const f=sample(r,{clip:s.kind,progress:.5,elapsed:.7},true);assert.equal(f.active,false);
   f.vertices.forEach((p,i)=>p.forEach((v,k)=>close(v,mesh(r).vertices[i].source[k])));
  }
 });
 test(r.fighterId+': multi-beat curves differ from a single scalar pose and mirror without game writes',()=>{
  const a=sample(r,{clip:'intro',progress:.22,elapsed:.264}),b=sample(r,{clip:'intro',progress:.52,elapsed:.624});
  assert.notDeepEqual(a.angles,b.angles);const m=create({playerId:r.fighterId,opponentId:'warrior',introSeconds:0}),before=copy(m);
  const ctx=new Proxy({},{get:()=>()=>{}}),f=sample(r,{clip:'outro-win',progress:.24,elapsed:.432});
  const right=draw(ctx,r,image(r),f,metrics(r),500,450,1),left=draw(ctx,r,image(r),f,metrics(r),500,450,-1);
  assert.ok(right&&left);for(const k of Object.keys(right.contacts)){close(right.contacts[k][0]+left.contacts[k][0],1000);close(right.contacts[k][1],left.contacts[k][1]);}
  assert.deepEqual(m,before);
 });
}
test('foreign angles, unsupported clips, support rotations and malformed progress fail closed',()=>{
 for(const value of [NaN,Infinity,undefined])assert.equal(sample(rigs[0],{clip:'intro',progress:value,elapsed:0}),null);
 for(const kind of ['constructor','__proto__','other'])assert.equal(sample(rigs[0],{clip:kind,progress:.5,elapsed:.5}),null);
 for(const angles of [{head:9},{hips:1},{secret:1},{head:NaN}])assert.equal(skin(rigs[0],{clip:'intro',progress:.5,elapsed:.5},angles),null);
 assert.equal(skin({...rigs[0]},{clip:'intro',progress:0,elapsed:0},{head:1}),null);
});
test('R1 is reversible and belongs to the actual winner, without inventing final sequences',()=>{
 const m=create({playerId:HUMAN,opponentId:'prowler',introSeconds:0});m.phase='round-over';m.phaseTime=.9;m.roundWinner='opponent';
 const before=copy(m);assert.equal(cue(rigs[0],m,m.fighters[1],null,null).clip,'round-win');assert.equal(cue(rigs[1],m,m.fighters[0],null,null).clip,'round-loss');
 assert.equal(createOutro(m),null);assert.deepEqual(m,before);m.roundWinner='draw';assert.equal(cue(rigs[1],m,m.fighters[0],null,null),null);
});
test('a terminal timeline refuses draws, double KO, unknown rigs and airborne winners',()=>{
 const m=create({playerId:HUMAN,opponentId:'prowler',introSeconds:0});m.phase='match-over';
 for(const result of [null,{completed:false,winner:'player'},{completed:true,winner:'draw'},{completed:true,winner:'player',reason:'double-ko'}]){m.result=result;assert.equal(createOutro(m),null);}
 m.result={completed:true,winner:'player',reason:'time'};m.fighters[0].y=8;m.fighters[1].y=8;assert.equal(createOutro(m),null);
 m.fighters[0].y=0;m.fighters[0].hp=0;assert.equal(createOutro(m),null);
 const other=create({playerId:'warrior',opponentId:'runner'});other.phase='match-over';other.result={completed:true,winner:'opponent'};assert.equal(createOutro(other),null);
});
test('outro admission is detached and resolves time-limit survivors without changing health',()=>{
 const m=create({playerId:HUMAN,opponentId:'prowler'});m.phase='match-over';m.result={completed:true,winner:'opponent',reason:'time'};
 const before=copy(m),o=createOutro(m);assert.equal(o.participants.length,2);assert.equal(o.participants[0].kind,'outro-loss');assert.equal(o.participants[1].kind,'outro-win');assert.deepEqual(m,before);
 const wrong={...o,matchId:'different'};assert.equal(cue(rigs[1],m,m.fighters[0],null,wrong),null);
});
test('presentation clock has a stall bound and freezes for pause, invalid dt and background',()=>{
 const o={phase:'playing',elapsedMs:0,durationMs:1800,paused:false};assert.equal(advance(o,10000).elapsedMs,100);
 for(const dt of [NaN,Infinity,-1,0])assert.equal(advance(o,dt),o);
 assert.equal(advance(o,50,true),o);const paused={...o,paused:true};assert.equal(advance(paused,50),paused);
 for(const hz of [30,60,120]){let s=o;for(let i=0;i<hz*3;i++)s=advance(s,1000/hz);assert.equal(s.phase,'complete');close(s.elapsedMs,1800);assert.equal(advance(s,100),s);}
});
test('entrance skipping preserves the second specimen and mandatory countdown',async()=>{
 const h=host();await h.start();h.frames();const before=physical(h.r.getState());
 assert.equal(h.r.skipSequence(),true);assert.equal(h.r.getState().presentation.phase,'intro-opponent');assert.deepEqual(physical(h.r.getState()),before);
 assert.equal(h.r.skipSequence(),true);assert.equal(h.r.getState().presentation.phase,'countdown');assert.equal(h.r.skipSequence(),false);
 h.frames(10);assert.equal(h.r.getState().tick,0);h.r.stop();
 for(const phase of ['fight','active','countdown']){const s={phase,elapsedMs:0};assert.equal(skipIntro(s),s);}
});
test('held combat input cannot cross a skipped intro or create an early attack',async()=>{
 const h=host();await h.start();h.key('KeyJ');h.r.skipSequence();h.r.skipSequence();h.frames(40);
 assert.equal(h.r.getState().fighters[0].stats.hits,0);assert.equal(h.r.getState().fighters[0].previousInput.light,false);h.key('KeyJ',false);h.r.stop();
});
test('native outcome is emitted immediately once, then outro alone advances with frozen combat',async()=>{
 const h=host();await h.start();h.terminal();const s=h.r.getState();assert.equal(s.outroV155.phase,'playing');assert.equal(h.results.length,1);assert.equal(h.queue.size,1);
 const before=physical(s);h.frames(5);const after=h.r.getState();assert.ok(after.outroV155.elapsedMs>0);assert.deepEqual(physical(after),before);
 assert.ok(after.rigViewsV154.some(r=>r.sequenceIdV155?.endsWith('outro-win')));h.frames(160);assert.equal(h.queue.size,0);assert.equal(h.results.length,1);assert.deepEqual(physical(h.r.getState()),before);
 assert.equal(h.r.resume(),false);h.r.stop();
});
test('terminal pause, resume and hidden-window freeze never reopen the combat engine',async()=>{
 const h=host();await h.start();h.terminal();h.frames(4);assert.equal(h.r.pause(),true);const paused=h.r.getState();h.frames(50);assert.deepEqual(h.r.getState(),paused);
 h.document.focused=false;assert.equal(h.r.resume(),false);h.document.focused=true;assert.equal(h.r.resume(),true);assert.equal(h.r.resume(),false);assert.equal(h.queue.size,1);
 h.frames(4);assert.deepEqual(physical(h.r.getState()),physical(paused));h.document.hidden=true;h.frames();assert.equal(h.r.getState().paused,true);h.r.stop();
});
test('skip snaps to a final pose, cancels its frame and cannot pay or play again',async()=>{
 const h=host();await h.start();h.terminal();const s=physical(h.r.getState());assert.equal(h.r.skipSequence(),true);assert.equal(h.queue.size,0);assert.equal(h.r.getState().outroV155.skipped,true);
 assert.equal(h.r.skipSequence(),false);assert.equal(h.r.resume(),false);h.frames(30);assert.equal(h.results.length,1);assert.deepEqual(physical(h.r.getState()),s);h.r.stop();
});
test('result callbacks can pause, resume, skip or close without duplicate scheduling or receipts',async()=>{
 for(const action of ['pause','skip','stop']) {
  let h,count=0;h=host({onResult(){count++;if(action==='pause')h.r.pause();if(action==='skip')h.r.skipSequence();if(action==='stop')h.r.stop();}});
  await h.start();h.terminal();assert.equal(count,1);
  if(action==='pause'){assert.equal(h.queue.size,0);assert.equal(h.r.resume(),true);h.frames(160);}
  assert.equal(h.queue.size,0);h.frames(50);assert.equal(count,1);h.r.stop();
 }
});
test('a state owner closing on terminal admission still prevents a late result callback',async()=>{
 let h,count=0;h=host({onState:s=>{if(s.phase==='match-over')h.r.stop();},onResult:()=>count++});await h.start();h.terminal();assert.equal(count,0);assert.equal(h.queue.size,0);h.r.stop();
});
test('unsupported opponents keep instantaneous static results and zero extra frames',async()=>{
 const h=host({config:{playerId:'warrior',opponentId:'runner',seed:145,roundSeconds:30,rulesV119:{initialHp:1}}});await h.start();h.terminal();assert.equal(h.r.getState().outroV155,null);assert.equal(h.queue.size,0);h.r.stop();
});
test('reduced motion omits the outro wait and restoring the preference cannot resurrect it',async()=>{
 let reduced=true;const h=host();h.window.matchMedia=()=>({matches:reduced});await h.start();h.terminal();assert.equal(h.r.getState().outroV155.phase,'complete');assert.equal(h.queue.size,0);assert.equal(h.results.length,1);
 reduced=false;h.frames(20);assert.equal(h.r.resume(),false);assert.equal(h.queue.size,0);h.r.stop();
});
test('enabling reduced motion during the sequence terminates it without altering the verdict',async()=>{
 const h=host();await h.start();h.terminal();const before=physical(h.r.getState());h.window.matchMedia=()=>({matches:true});h.frames();assert.equal(h.queue.size,0);assert.deepEqual(physical(h.r.getState()),before);assert.equal(h.results.length,1);h.r.stop();
});
test('returned clip/participant/contact snapshots cannot alter the renderer or final pose',async()=>{
 const h=host();await h.start();h.terminal();h.frames(4);const a=h.r.getState(),b=h.r.getState();a.outroV155.participants[0].kind='other';a.rigViewsV154[0].contacts.head[0]=999;
 assert.deepEqual(h.r.getState(),b);h.r.stop();const stopped=h.r.getState();assert.equal(stopped.outroV155,null);assert.deepEqual(stopped.rigViewsV154,[]);h.frames(20);assert.deepEqual(h.r.getState(),stopped);
});
test('both match stats and final poses reject fresh combat controls during outro',async()=>{
 const h=host();await h.start();h.terminal();const before=physical(h.r.getState());for(const action of ['right','jump','heavy','special','super'])h.r.setInput(action,true);
 h.key('KeyL');h.key('ArrowRight');h.frames(8);assert.deepEqual(physical(h.r.getState()),before);assert.equal(h.results.length,1);h.r.stop();
});

test('published tracker keeps the original presentation/task IDs, source cells and honest completion counts',async()=>{
 const {execFileSync}=await import('node:child_process');
 const {isPublicDistributionPathV86}=await import('./verify-public-release-v86.mjs');
 const prefix='docs/forge/xeno-trials/',read=n=>readFileSync(new URL('../'+prefix+n,import.meta.url));
 const d=JSON.parse(read('progress-v155.json')),p=JSON.parse(read('xeno-trials-plan-v146.json')),old=JSON.parse(read('progress-v154.json'));
 assert.deepEqual(d.rosterIds,roster.map(f=>f.id));assert.deepEqual(d.sequenceIds,sequences.map(s=>s.id));assert.equal(d.keyframes,100);assert.equal(d.approved1to1,0);
 assert.deepEqual(d.tables['03_ART153'],old.tables['03_Production']);assert.equal(d.tables['02_Production'].rows.length,40);
 const ids=new Set(p.tables['09_Presentations'].rows.map(r=>r[0]));for(const r of d.tables['02_Production'].rows)assert.ok(ids.has(r[0]));
 assert.equal(d.tables['02_Production'].rows.filter(r=>r[4]).length,20);assert.equal(d.tables['02_Production'].rows.reduce((n,r)=>n+r[6]+r[7],0),0);
 assert.equal(createHash('sha256').update(read(d.workbook)).digest('hex'),d.workbookSha256);
 for(const name of [d.workbook,'progress-v155.json','V155-SEQUENCES.md']){assert.equal(isPublicDistributionPathV86(prefix+name),true);assert.equal(isPublicDistributionPathV86(prefix+name,{built:true}),false);}
 assert.equal(isPublicDistributionPathV86(prefix+'unreviewed-v155.xlsx'),false);
 const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');assert.equal(sw.split('/src/xeno-trials-sequences-v155.js').length-1,1);
 const script=`import sys,json,zipfile,xml.etree.ElementTree as E
p=json.load(open(sys.argv[1]));ns={'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
with zipfile.ZipFile(sys.argv[2]) as z:
 strings=[]
 if 'xl/sharedStrings.xml' in z.namelist():
  strings=[''.join(x.itertext()) for x in E.fromstring(z.read('xl/sharedStrings.xml'))]
 def value(c):
  if c is None:return None
  t=c.get('t');v=c.find('m:v',ns)
  if t=='s':return strings[int(v.text)]
  if t=='inlineStr':return ''.join(c.find('m:is',ns).itertext())
  if v is None or v.text is None:return None
  if t=='b':return v.text=='1'
  try:return float(v.text)
  except ValueError:return v.text
 sheets=E.fromstring(z.read('xl/workbook.xml')).find('m:sheets',ns)
 assert len(sheets)==8
 assert len([n for n in z.namelist() if n.startswith('xl/tables/') and n.endswith('.xml')])==7
 for n in z.namelist():
  if n.startswith('xl/worksheets/sheet') and n.endswith('.xml'):assert not E.fromstring(z.read(n)).findall('.//m:c[@t="e"]',ns),n
 root=E.fromstring(z.read('xl/worksheets/sheet1.xml'));cells={c.get('r'):c for c in root.findall('.//m:c',ns)}
 assert [value(cells['E'+str(i)]) for i in range(7,16)]==[189,4,20,100,40,20,28,0,0]
 assert len(root.findall('.//m:f',ns))==9
 count=0
 for i,(name,table) in enumerate(p['tables'].items(),2):
  assert sheets[i-1].get('name')==name
  cells={c.get('r'):c for c in E.fromstring(z.read('xl/worksheets/sheet%d.xml'%i)).findall('.//m:c',ns)}
  for row,values in enumerate([table['headers']]+table['rows'],5):
   for col,expected in enumerate(values):
    actual=value(cells.get(chr(65+col)+str(row)));assert actual==expected,(name,row,col,actual,expected);count+=1
 print('Excel verified:',count,'source cells; 9 formula caches; zero errors')`;
 const base=new URL('../'+prefix,import.meta.url);
 assert.match(execFileSync('python3',['-c',script,new URL('progress-v155.json',base).pathname,new URL(d.workbook,base).pathname],{encoding:'utf8'}),/Excel verified/);
});
