import test from 'node:test';
import assert from 'node:assert/strict';
import { XENO_TRIALS_GRAPPLE_V153 as config, hasXenoTrialsGrappleV153 as has, isXenoTrialsGrappleTargetV153 as target,
  canXenoTrialsGrappleV153 as can, getXenoTrialsGrappleViewV153 as view, drawXenoTrialsGrappleV153 as draw } from '../src/xeno-trials-grapple-v153.js';
import { XENO_TRIALS_FIGHTERS_V96 as roster, getXenoTrialsFighterV96 as def } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsMatchV96 as create, stepXenoTrialsMatchV96 as step, nextXenoTrialsRoundV96 as next,
  setXenoTrialsPausedV96 as pause, XENO_TRIALS_ATTACKS_V96 as base } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsSignatureV147 as signature, getXenoTrialsAttackV147 as spec } from '../src/xeno-trials-signatures-v147.js';
import { getXenoTrialsSuperV148 as superProfile } from '../src/xeno-trials-supers-v148.js';
import { getXenoTrialsBodyBoundsV105 as bounds, resolveXenoTrialsBodiesV105 as resolve } from '../src/xeno-trials-geometry-v105.js';
import { stepXenoTrialsBrainV119 as brain } from '../src/xeno-trials-ai-v119.js';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
// Explicit UNIT boundary fixtures set initial position/HP to isolate transitions.
// They are separate from the native browser host's unmodified match execution.
const DT=1/120, HUMAN='dd-darwin-era-cultist';
const make=(extra={})=>create({playerId:'prowler',opponentId:HUMAN,introSeconds:0,holdRoundTransition:true,...extra});
const ticks=(m,n,a={},b={})=>{for(let i=0;i<n;i++)step(m,DT,a,b);return m;};
const copy=m=>JSON.parse(JSON.stringify(m));
function close(m,gap=4){const[a,b]=m.fighters; b.x+=bounds(a).right+gap-bounds(b).left;resolve(a,b,1);}
function latch(extra={},side=0){
  const m=make(extra);close(m);const a=side?{}:{special:true},b=side?{special:true}:{};
  for(let i=0;i<150&&!m.grappleV153;i++)step(m,DT,a,b);
  assert.ok(m.grappleV153,'A real accepted leap must reach contact before the fixture continues.');return m;
}
const ended=m=>m.events.filter(e=>e.type==='grapple-end-v153');

test('exact identity and three explicitly reviewed targets; no family/name inheritance',()=>{
  assert.ok(Object.isFrozen(config)&&Object.isFrozen(config.targets));assert.equal(config.targets.length,3);
  assert.equal(has(def('prowler')),true);assert.equal(config.canonExact,false);assert.equal(config.animation,'existing-static-pose');
  assert.equal(has({...def('prowler'),profileId:'wrong'}),false);assert.equal(has(def('drive-v123-afe-prowler')),false);
  for(const t of config.targets){assert.equal(def(t.id).profileId,t.profileId);assert.equal(target(def(t.id)),true);assert.equal(target({...def(t.id),profileId:'wrong'}),false);}
  for(const f of roster)if(!config.targets.some(t=>t.id===f.id))assert.equal(target(f),false,f.id);
  assert.equal(target(def('import-wy-apesuit')),false);
  assert.equal(roster.filter(f=>signature(f)).length,9);assert.equal(roster.filter(f=>superProfile(f)).length,5);
});
for(const t of config.targets)for(const side of [0,1])test(`${t.id} side ${side}: physical latch without relocation, extra cost or changed body scale`,()=>{
  const opts=side?{playerId:t.id,opponentId:'prowler'}:{opponentId:t.id};
  const m=make(opts);close(m);const actor=m.fighters[side],victim=m.fighters[1-side],size=bounds(victim);
  let previous;for(let i=0;i<150&&!m.grappleV153;i++){previous=copy(m);step(m,DT,side?{}:{special:true},side?{special:true}:{});}
  assert.ok(m.grappleV153);assert.equal(m.grappleV153.attacker,side?'opponent':'player');
  assert.ok(Math.abs(actor.x-previous.fighters[side].x)<=3.01);assert.ok(Math.abs(victim.x-previous.fighters[1-side].x)<=3.01);
  assert.equal(bounds(victim).width,size.width);assert.equal(bounds(victim).height,size.height);
  assert.equal(actor.stats.specials,1);assert.equal(actor.stats.grapplesV153,1);assert.equal(actor.stamina,100-signature(def('prowler')).spec.cost);
  assert.equal(actor.attack,null);assert.equal(victim.attack,null);assert.equal(victim.y,0);
});
test('the leap closes to the physical contact gap instead of restraining at generic reach',()=>{
  const m=make();close(m,65);let latchGap=null;
  for(let i=0;i<140;i++){step(m,DT,{special:true},{});if(m.grappleV153){latchGap=bounds(m.fighters[1]).left-bounds(m.fighters[0]).right;break;}}
  assert.notEqual(latchGap,null);assert.ok(latchGap<=config.contactGap && latchGap>=0);
});
test('a ranged miss neither creates a grapple nor delays an unrelated round',()=>{
  const m=make();m.fighters[1].x=1500;ticks(m,200,{special:true});
  assert.equal(m.grappleV153,undefined);assert.equal(m.fighters[0].stats.grapplesV153,undefined);assert.equal(m.fighters[1].hp,def(HUMAN).hp);
});
test('a xenomorph takes the existing Prowler impact, never a human restraint',()=>{
  const m=make({opponentId:'warrior'});close(m);ticks(m,120,{special:true});
  assert.equal(m.grappleV153,undefined);assert.equal(m.fighters[0].stats.hits,1);assert.equal(m.fighters[0].stats.grapplesV153,undefined);
});
test('frontal guard prevents a restraint and keeps its original chip/cost contract',()=>{
  const m=make();close(m);ticks(m,100,{special:true},{guard:true});
  assert.equal(m.grappleV153,undefined);assert.equal(m.fighters[1].stats.blocks,1);assert.ok(m.fighters[1].hp>def(HUMAN).hp-10);
});
test('an airborne human cannot be held on the floor by a remote grab',()=>{
  const m=make();close(m);ticks(m,100,{special:true},{jump:true});assert.equal(m.grappleV153,undefined);
});
test('a real light contact interrupts the preparation before a restraint begins',()=>{
  const m=make();close(m);ticks(m,28,{special:true},{light:true});
  assert.equal(m.grappleV153,undefined);assert.equal(m.fighters[0].attack,null);assert.equal(m.fighters[0].stats.specials,1);
});
test('a lethal initial contact ends the round, without restraining a corpse',()=>{
  const m=make({roundsToWin:1});close(m);m.fighters[1].hp=1;ticks(m,140,{special:true});
  assert.equal(m.phase,'match-over');assert.equal(m.grappleV153,undefined);assert.equal(m.result.playerStats.hits,1);assert.equal(m.result.playerStats.damage,1);
});
test('one restraint causes three bounded DOT ticks, not four direct hits or endless damage',()=>{
  const m=latch(),before=m.fighters[1].hp;
  ticks(m,config.durationTicks+100);
  assert.equal(m.grappleV153,undefined);assert.equal(before-m.fighters[1].hp,config.damage*3);
  assert.equal(m.fighters[0].stats.hits,1);assert.equal(m.fighters[0].stats.grappleTicksV153,3);
  assert.equal(ended(m).length,1);assert.equal(ended(m)[0].reason,'timeout');
  const hp=m.fighters[1].hp;ticks(m,500);assert.equal(m.fighters[1].hp,hp);
});
test('held actions cannot move either actor, attack, jump, refill stamina or create a super while restrained',()=>{
  const m=latch(),before=m.fighters.map(f=>({x:f.x,stamina:f.stamina,hits:f.stats.hits}));
  ticks(m,60,{left:true,jump:true,light:true,heavy:true,special:true,super:true},{right:true,jump:true,light:true,heavy:true,special:true,super:true});
  assert.ok(m.grappleV153);m.fighters.forEach((f,i)=>{assert.equal(f.x,before[i].x);assert.equal(f.stamina,before[i].stamina);assert.equal(f.stats.hits,before[i].hits);assert.equal(f.attack,null);});
});
test('holding guard escapes without mash, stamina costs or damage immunity',()=>{
  const m=latch(),f=m.fighters[1];f.stamina=0;const hp=f.hp;ticks(m,config.escapeTicks,{}, {guard:true});
  assert.equal(m.grappleV153,undefined);assert.equal(ended(m)[0].reason,'escaped');assert.equal(f.stats.grappleEscapesV153,1);
  assert.equal(f.stamina,0);assert.equal(hp-f.hp,config.damage);assert.ok(f.stun>0);
});
test('releasing guard resets incomplete escape progress',()=>{
  const m=latch();ticks(m,35,{}, {guard:true});assert.equal(m.grappleV153.escapeProgress,35);
  step(m,DT,{},{});assert.equal(m.grappleV153.escapeProgress,0);
  ticks(m,config.escapeTicks-1,{}, {guard:true});assert.ok(m.grappleV153);step(m,DT,{}, {guard:true});assert.equal(m.grappleV153,undefined);
});
test('pause freezes restraint, damage and escape; the held guard must rearm after resume',()=>{
  const m=latch();ticks(m,20,{}, {guard:true});pause(m,true);const before=copy(m);ticks(m,240,{}, {guard:true});assert.deepEqual(copy(m),before);
  pause(m,false);ticks(m,30,{}, {guard:true});assert.equal(m.grappleV153.escapeProgress,0);
  step(m,DT,{},{});ticks(m,config.escapeTicks,{}, {guard:true});assert.equal(ended(m)[0].reason,'escaped');
});
test('controls held during escape do not replay as an opening attack or movement afterwards',()=>{
  const m=latch();const held={guard:true,light:true,special:true,jump:true,right:true};ticks(m,config.escapeTicks,{},held);
  const x=m.fighters[1].x,hits=m.fighters[1].stats.hits;ticks(m,70,{},held);
  assert.equal(m.fighters[1].x,x);assert.equal(m.fighters[1].attack,null);assert.equal(m.fighters[1].y,0);assert.equal(m.fighters[1].stats.hits,hits);
  step(m,DT,{},{});step(m,DT,{}, {right:true,light:true});assert.ok(m.fighters[1].x>x);assert.equal(m.fighters[1].attack.kind,'light');
});
test('a projectile in flight can hit the captor and release both actors without refund',()=>{
  const m=latch(),[a,b]=m.fighters,ab=bounds(a),stamina=a.stamina;
  m.projectiles.push({id:++m.serial,owner:'opponent',x:ab.right+1,y:ab.bottom+ab.height*.5,vx:-560,vy:0,direction:-1,life:1,spec:base.light,power:1,style:'pulse'});
  step(m,DT,{},{});assert.equal(m.grappleV153,undefined);assert.equal(ended(m)[0].reason,'interrupted');assert.equal(a.stamina,stamina);assert.equal(a.stats.specials,1);assert.ok(b.stun>0);
});
test('external physical separation releases a restraint rather than snapping the target back',()=>{
  const m=latch();m.fighters[1].x+=80;const x=m.fighters[1].x;step(m,DT,{},{});
  assert.equal(m.grappleV153,undefined);assert.equal(m.fighters[1].x,x);assert.equal(ended(m)[0].reason,'separated');
});
test('an already dead captor releases without any further DOT or corpse damage',()=>{
  const m=latch(),hp=m.fighters[1].hp;m.fighters[0].hp=0;ticks(m,1);
  assert.equal(m.grappleV153,undefined);assert.equal(m.fighters[1].hp,hp);assert.equal(m.phase,'round-over');
});
test('DOT overkill counts only the remaining HP and cannot pay a second round',()=>{
  const m=latch({roundsToWin:1});m.fighters[1].hp=1;const damage=m.fighters[0].stats.damage;
  ticks(m,48);assert.equal(m.phase,'match-over');assert.equal(m.result.playerStats.damage,damage+1);assert.equal(m.result.playerStats.hits,1);
  const before=JSON.stringify(m);ticks(m,300,{special:true});assert.equal(JSON.stringify(m),before);
});
test('no-special disables admission and releases an existing restraint',()=>{
  const m=make({rulesV119:{noSpecial:true}});close(m);ticks(m,120,{special:true});assert.equal(m.grappleV153,undefined);
  const active=latch();active.config.rulesV119.noSpecial=true;ticks(active,1);assert.equal(active.grappleV153,undefined);assert.equal(ended(active)[0].reason,'interrupted');
});
test('round timeout removes restraints and the next round rebuilds independent actors',()=>{
  const m=latch();m.timeRemaining=DT;ticks(m,1);assert.equal(m.phase,'round-over');assert.equal(m.grappleV153,undefined);
  assert.equal(next(m),true);assert.equal(m.grappleV153,undefined);assert.equal(m.fighters[0].stats.grapplesV153,1);assert.equal(m.fighters[1].hp,def(HUMAN).hp);
});
test('CPU gains a real restraint from the default starting positions',()=>{
  const m=make({playerId:HUMAN,opponentId:'prowler',difficulty:'hard',seed:153,roundSeconds:120});let found=false;
  for(let i=0;i<5400&&m.phase!=='match-over';i++){step(m,DT,{});if(m.grappleV153){found=true;break;}}
  assert.equal(found,true);assert.equal(m.grappleV153.target,'player');assert.equal(m.fighters[1].stats.grapplesV153,1);
});
test('CPU victim reads the visible hold and escapes through the same guard input',()=>{
  const m=latch();const before=m.fighters.map(f=>[f.hp,f.x,f.y]);const controls=brain(m,DT,base,()=>.5);
  assert.equal(controls.guard,true);assert.deepEqual(m.fighters.map(f=>[f.hp,f.x,f.y]),before);
  for(let i=0;i<175&&m.grappleV153;i++)step(m,DT,{},null);
  assert.equal(ended(m)[0].reason,'escaped');assert.equal(m.fighters[1].stats.grappleEscapesV153,1);
});
test('the complete restraint serializes identically at 30/60/120Hz',()=>{
  const out=[30,60,120].map(rate=>{const m=make();close(m);for(let i=0;i<rate*3;i++)step(m,1/rate,{special:i<rate},i>=rate?{guard:true}:{});return JSON.stringify(m);});
  assert.equal(out[0],out[1]);assert.equal(out[1],out[2]);
});
test('a JSON snapshot resumes a bounded restraint without new damage/capture IDs',()=>{
  const original=latch();ticks(original,21,{}, {guard:true});const restored=copy(original);
  ticks(original,130,{}, {guard:true});ticks(restored,130,{}, {guard:true});assert.deepEqual(copy(original),restored);
});
test('rendering and accessible view never mutate the authoritative simulation',()=>{
  const m=latch();ticks(m,30,{}, {guard:true});const before=JSON.stringify(m),calls=[];
  const ctx=new Proxy({},{get:(_,k)=>(...args)=>calls.push([k,...args]),set:()=>true});
  draw(ctx,m,bounds,450);assert.equal(JSON.stringify(m),before);assert.ok(calls.some(c=>c[0]==='fillText'&&c[1].includes('GARDE')));
  assert.equal(view(m).animation,'existing-static-pose');assert.equal(view(m).canonExact,false);assert.equal(view(m).escapeRatio,30/72);
  const detached=view(m);detached.escapeProgress=999;assert.equal(m.grappleV153.escapeProgress,30);assert.equal(view({}),null);
});
test('existing historical attack numerics and super admission are not rewritten for the roster',()=>{
  assert.equal(spec(def('prowler'),'special',base.special).cost,34);assert.equal(spec(def('prowler'),'special',base.special).damage,30);
  for(const f of roster)for(const kind of ['light','heavy','special'])assert.ok(spec(f,kind,base[kind]));
  assert.equal(superProfile(def('prowler')),null);assert.equal(superProfile(def(HUMAN)),null);
});

test('V153 workbook preserves all IDs, exact target selection, open art and source-only documents',async()=>{
  const root=new URL('../docs/forge/xeno-trials/',import.meta.url),p=JSON.parse(readFileSync(new URL('progress-v153.json',root)));
  assert.equal(p.behaviorTests,32);assert.equal(p.documentTests,1);assert.equal(p.testNames.length,32);
  assert.deepEqual(p.rosterIds,roster.map(f=>f.id));assert.deepEqual(p.mechanic,config);
  assert.equal(p.approved1to1,0);assert.equal(p.newCharacterAnimationClips,0);assert.equal(p.newSupers,0);
  assert.equal(p.openArtTasks.length,28);
  const book=new URL(p.workbook,root);assert.equal(createHash('sha256').update(readFileSync(book)).digest('hex'),p.workbookSha256);
  const code=`import sys,json,zipfile,xml.etree.ElementTree as E
p=json.load(open(sys.argv[2]));z=zipfile.ZipFile(sys.argv[1]);n={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
w=E.fromstring(z.read('xl/workbook.xml'));sheets=w.find('s:sheets',n);assert len(sheets)==7
strings=[]
if 'xl/sharedStrings.xml' in z.namelist():
 strings=[''.join(x.itertext()) for x in E.fromstring(z.read('xl/sharedStrings.xml')).findall('s:si',n)]
def val(c):
 if c is None:return None
 t=c.attrib.get('t');v=c.find('s:v',n)
 if t=='inlineStr':return ''.join(c.find('s:is',n).itertext())
 if v is None:return None
 if t=='s':return strings[int(v.text)]
 if t=='b':return v.text=='1'
 if t in ('str','e'):return v.text
 return float(v.text)
count=0
for i,s in enumerate(sheets,1):
 cs={c.attrib['r']:c for c in E.fromstring(z.read('xl/worksheets/sheet'+str(i)+'.xml')).findall('.//s:c',n)}
 assert not any(c.attrib.get('t')=='e' for c in cs.values())
 if i==1:
  assert [val(cs['E'+str(j)]) for j in range(7,14)]==[189,1,3,32,28,0,0]
  assert all(cs['E'+str(j)].find('s:f',n) is not None for j in range(7,14));continue
 table=p['tables'][s.attrib['name']]
 for ri,row in enumerate([table['headers']]+table['rows'],5):
  for ci,expected in enumerate(row):
   actual=val(cs.get(chr(65+ci)+str(ri)));assert actual==expected or (actual is None and expected==''),(s.attrib['name'],ri,ci,actual,expected);count+=1
print('Seven sheets and seven formula counters; '+str(count)+' source cells agree; no spreadsheet errors')`;
  const result=spawnSync('python3',['-c',code,decodeURIComponent(book.pathname),decodeURIComponent(new URL('progress-v153.json',root).pathname)],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr||result.stdout);
  const {isPublicDistributionPathV86:allowed}=await import('./verify-public-release-v86.mjs');
  for(const name of [p.workbook,'progress-v153.json','V153-PROWLER-RESTRAINT.md']){const path='docs/forge/xeno-trials/'+name;assert.equal(allowed(path),true);assert.equal(allowed(path,{built:true}),false);}
  assert.equal(allowed('docs/forge/xeno-trials/unreviewed-v153.xlsx'),false);
});
