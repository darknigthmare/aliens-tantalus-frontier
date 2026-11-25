import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {XENO_TRIALS_FIGHTERS_V96 as FIGHTERS,getXenoTrialsArtV96} from '../src/xeno-trials-data-v96.js';
import {getXenoTrialsAnimationCoverageV189 as get,getXenoTrialsAnimationCoverageListV189 as list,
 getXenoTrialsAnimationCoverageSummaryV189 as summary,XENO_TRIALS_ANIMATION_ACTIONS_V189 as ACTIONS} from '../src/xeno-trials-animation-coverage-v189.js';
import {getXenoTrialsSpriteAtlasV188,sampleXenoTrialsSpriteAtlasV188} from '../src/xeno-trials-sprite-atlas-v188.js';
import {XENO_TRIALS_SPRITE_ATLASES_V189,getXenoTrialsSpriteAtlasV189,sampleXenoTrialsSpriteAtlasV189} from '../src/xeno-trials-sprite-atlas-v189.js';
import {getEnemyImportAnimationV107} from '../src/enemy-import-animation-v107.js';
import {getEnemyImportAttackV109} from '../src/enemy-import-attacks-v109.js';
import {getXenoTrialsRigV154} from '../src/xeno-trials-rig-v154.js';

test('the coverage view resolves all 189 canonical identities once without changing the admitted roster or media',()=>{
 const before=JSON.stringify(FIGHTERS),rows=list();assert.equal(rows.length,189);assert.equal(new Set(rows.map(row=>row.id)).size,189);
 assert.deepEqual(rows.map(row=>row.id),FIGHTERS.map(f=>f.id));assert.equal(JSON.stringify(FIGHTERS),before);
 assert.equal(get('not-a-fighter'),null);assert.equal(get({id:'warrior',profileId:'another-identity'}),null);
 assert.equal(Object.isFrozen(rows),true);assert.equal(Object.isFrozen(rows[0].states),true);
});

for(const fighter of FIGHTERS)test(`${fighter.id}: ten visible-action records retain exact source identity and never claim full or canonical animation`,()=>{
 const row=get(fighter.id),art=getXenoTrialsArtV96(fighter.id);
 assert.equal(row.id,fighter.id);assert.equal(row.profileId,fighter.profileId);assert.equal(row.artPath,art.path);
 assert.deepEqual(Object.keys(row.states),ACTIONS);assert.equal(row.canonExact,false);assert.equal(row.fullAnimation,false);
 for(const[action,state]of Object.entries(row.states)){
  assert.ok(['drawn','mesh','static'].includes(state.renderKind));assert.equal(typeof state.supported,'boolean');
  assert.equal(state.motionSupported,state.supported&&state.renderKind!=='static');assert.ok(state.sources.length>0);
  assert.equal(state.sources.at(-1).path,art.path,'Every action retains its exact native-plate fallback');
  for(const media of state.sources){assert.ok(media.id&&media.path);assert.ok(existsSync(new URL(`..${media.path}`,import.meta.url)),`${action}/${media.path}`);}
 }
 const rig=getXenoTrialsRigV154(fighter,art);
 assert.equal(row.states.presentation.renderKind,rig?'mesh':'static');
 assert.equal(row.hasDrawnGestures,row.drawnStates.some(action=>action!=='idle'));
});

test('the actual V188 sampler agrees with drawn coverage and does not admit an acid/leap/super drawing',()=>{
 const spec={startup:.2,active:.1,recovery:.4};
 for(const fighter of FIGHTERS){const art=getXenoTrialsArtV96(fighter.id),atlas=getXenoTrialsSpriteAtlasV188(fighter,art);if(!atlas)continue;
  const row=get(fighter.id),base={id:fighter.id,x:400,y:0,hp:100,stun:0,guard:false,facing:1};
  for(const[action,prepared,options]of [
   ['idle',base,{}],['walk',base,{moving:true,distance:20,metrics:{visibleHeight:100}}],
   ['light',{...base,attack:{kind:'light',age:.25}},{spec}],['heavy',{...base,attack:{kind:'heavy',age:.25}},{spec}],
   ['guard',{...base,guard:true},{}],['hurt',base,{cue:{state:'hurt',progress:.5}}],['ko',{...base,hp:0},{cue:{state:'ko',progress:1}}]
  ]){const selected=sampleXenoTrialsSpriteAtlasV188(atlas,prepared,options);assert.ok(selected);assert.equal(row.states[action].renderKind,'drawn');
   assert.ok(row.states[action].sources.some(source=>source.path===atlas.texture.path&&source.frameIds.includes(selected.frame.id)));}
  assert.equal(sampleXenoTrialsSpriteAtlasV188(atlas,{...base,attack:{kind:'special',age:.25}},{spec}),null);
  assert.equal(row.states.special.renderKind==='drawn',false);assert.equal(row.states.presentation.renderKind==='drawn',false);
 }
});

test('V189 coverage is admitted from real exact-ID combat/motion registries and preserves V188 actions as fallbacks',()=>{
 const spec={startup:.2,active:.1,recovery:.4};
 for(const atlas of XENO_TRIALS_SPRITE_ATLASES_V189){
  const fighter=FIGHTERS.find(fighter=>fighter.id===atlas.fighterId),art=getXenoTrialsArtV96(fighter.id),row=get(fighter.id);
  assert.equal(getXenoTrialsSpriteAtlasV189(fighter,art),atlas);
  const base={id:fighter.id,x:400,y:0,hp:100,stun:0,hitFlash:0,guard:false,facing:1};
  const cases=atlas.kind==='motion'
   ?[['walk',base,{moving:true,distance:20,metrics:{visibleHeight:100}}],['air',{...base,y:20,vy:2},{}],['air',{...base,y:20,vy:-2},{}]]
   :[['idle',base,{}],['walk',base,{moving:true,distance:20,metrics:{visibleHeight:100}}],
    ['light',{...base,attack:{kind:'light',age:.25}},{spec}],['heavy',{...base,attack:{kind:'heavy',age:.25}},{spec}],
    ['guard',{...base,guard:true},{}],['hurt',base,{cue:{state:'hurt',progress:.5}}],['ko',{...base,hp:0},{cue:{state:'ko',progress:1}}]];
  for(const[action,prepared,options]of cases){const selected=sampleXenoTrialsSpriteAtlasV189(atlas,prepared,options);assert.ok(selected,`${fighter.id}/${action}`);
   assert.equal(row.states[action].sources[0].path,atlas.texture.path);assert.ok(row.states[action].frameIds.includes(selected.frame.id));}
  for(const action of ['special','presentation'])assert.notEqual(row.states[action].renderKind,'drawn');
  if(atlas.kind==='motion'){
   assert.equal(row.states.walk.frameIds.length,8);assert.equal(row.states.air.frameIds.length,2);
   assert.equal(sampleXenoTrialsSpriteAtlasV189(atlas,base),null,'Motion sheets do not invent a drawn idle');
   for(const action of ['idle','light','heavy','guard','hurt','ko'])assert.ok(row.states[action].sources[0].path.includes('/xeno-trials-v188/'),`${action} keeps the admitted combat sheet`);
   assert.equal(sampleXenoTrialsSpriteAtlasV189(atlas,{...base,y:20,vy:2,attack:{kind:'special',age:.1}}),null);
  }else{
   assert.equal(row.states.air.sources.some(source=>source.path===atlas.texture.path),false,'Grounded combat poses do not create airborne poses');
   assert.equal(sampleXenoTrialsSpriteAtlasV189(atlas,{...base,y:20,vy:2}),null);
   assert.equal(sampleXenoTrialsSpriteAtlasV189(atlas,{...base,attack:{kind:'special',age:.25}},{spec}),null);
  }
 }
});

test('the frozen V189 successor admits eight actual sheets and eighty new poses, keeping forty V188 poses and the partial-animation limit',()=>{
 assert.deepEqual(XENO_TRIALS_SPRITE_ATLASES_V189.map(atlas=>atlas.fighterId).sort(),['burster','crusher-acm','prowler','queen','ravager','runner','spitter','warrior']);
 assert.equal(XENO_TRIALS_SPRITE_ATLASES_V189.reduce((count,atlas)=>count+atlas.frames.length,0),80);
 for(const kind of ['combat','motion'])assert.equal(XENO_TRIALS_SPRITE_ATLASES_V189.filter(atlas=>atlas.kind===kind).length,4);
 const counts=summary();assert.equal(counts.trialsDrawnFrames,120);assert.equal(counts.uniqueAdmittedDrawnFrames,160);
 assert.equal(counts.drawnProfiles,17);assert.equal(counts.fullProneProfiles,8);assert.equal(counts.byAction.air.drawn,4);
 assert.equal(counts.fullyAnimated,0);assert.equal(counts.canonExact,0);
});

test('legacy imported walks and the one light attack are admitted only to the actual exact-ID action',()=>{
 for(const fighter of FIGHTERS){const art=getXenoTrialsArtV96(fighter.id),walk=getEnemyImportAnimationV107(art),light=getEnemyImportAttackV109(art),row=get(fighter.id);
  if(walk){assert.equal(row.states.walk.renderKind,'drawn');assert.ok(row.states.walk.sources.some(source=>source.id===walk.id));}
  if(light){assert.equal(row.states.light.renderKind,'drawn');assert.ok(row.states.light.sources.some(source=>source.id===light.id));}
 }
 assert.equal(get('import-joe-classic').states.light.renderKind,'drawn');assert.equal(get('import-joe-classic').states.heavy.renderKind,'static');
 assert.equal(get('drive-v123-game-working-joe-standard').states.light.renderKind,'static','A namesake never borrows the classic Joe sheet');
});

test('ten action totals each cover the whole roster and reused light/heavy keyframes are counted only once',()=>{
 const counts=summary();assert.equal(counts.roster,189);assert.equal(counts.canonExact,0);assert.equal(counts.fullyAnimated,0);
 for(const action of ACTIONS)assert.equal(counts.byAction[action].drawn+counts.byAction[action].mesh+counts.byAction[action].static,189);
 const keys=new Set(),trials=new Set();for(const row of list())for(const state of Object.values(row.states))for(const media of state.sources)
  if(media.renderKind==='drawn')for(const frame of media.frameIds){const key=media.path+'#'+frame;keys.add(key);if(/\/xeno-trials-v18[89]\//.test(media.path))trials.add(key);}
 assert.equal(counts.uniqueAdmittedDrawnFrames,keys.size);assert.equal(counts.trialsDrawnFrames,trials.size);assert.ok(counts.trialsDrawnFrames>=40);
});

test('the source-only coverage report is the current read-only successor, not a rewrite of the historical V146 plan',()=>{
 const path=new URL('../docs/forge/xeno-trials/animation-coverage-v189.json',import.meta.url),report=JSON.parse(readFileSync(path,'utf8'));
 assert.equal(report.schema,189);assert.equal(report.claims.canonExact,0);assert.equal(report.claims.fullyAnimated,0);
 assert.equal(report.claims.artisticClosure,false);assert.deepEqual(report.summary,summary());
 assert.equal(report.entries.length,189);assert.deepEqual(report.entries.map(row=>row.id),FIGHTERS.map(f=>f.id));
 const drawn=new Map();for(const row of list())for(const state of Object.values(row.states))for(const media of state.sources)if(media.renderKind==='drawn'){
  let frames=drawn.get(media.path);if(!frames){frames=new Set();drawn.set(media.path,frames);}for(const frame of media.frameIds)frames.add(frame);
 }
 assert.equal(report.drawnMedia.length,drawn.size);for(const media of report.drawnMedia){
  assert.deepEqual(media.frameIds,[...drawn.get(media.path)].sort());
  assert.equal(media.sha256,createHash('sha256').update(readFileSync(new URL('..'+media.path,import.meta.url))).digest('hex'));
 }
 for(const row of report.entries){const current=get(row.id);assert.equal(row.profileId,current.profileId);assert.equal(row.artPath,current.artPath);
  assert.equal(row.hasDrawnGestures,current.hasDrawnGestures);assert.equal(row.fullProne,current.fullProne);
  for(const action of ACTIONS){assert.equal(row.states[action].renderKind,current.states[action].renderKind);assert.equal(row.states[action].motionSupported,current.states[action].motionSupported);
   assert.deepEqual(row.states[action].frameIds,current.states[action].frameIds);assert.deepEqual(row.states[action].sourceIds,current.states[action].sources.map(source=>source.id));}}
 const historical=JSON.parse(readFileSync(new URL('../docs/forge/xeno-trials/xeno-trials-plan-v146.json',import.meta.url),'utf8'));
 assert.equal(historical.phase,'preproduction-only');assert.equal(historical.approved1to1,0);
 assert.equal(report.historicalPlan.changed,false);assert.equal(report.historicalPlan.sha256,
  createHash('sha256').update(readFileSync(new URL('../'+report.historicalPlan.path,import.meta.url))).digest('hex'));
});
