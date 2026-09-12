import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { commitCrewTransactionV85 } from '../src/crew-transactions-v85.js';
import { buildCrewUiModelV85, CrewUiV85 } from '../src/crew-ui-v85.js';
import { createRecruitmentV85 } from '../src/crew-recruitment-v85.js';
import { CREW } from '../src/content.js';

function harness() {
  const data={clock:{day:1,hour:6},galaxy:{resources:{credits:3200}},crew:[],savedValue:1};
  const state={data,stored:JSON.stringify(data),writes:0,denied:false};
  state.commit=candidate=>{ if(state.denied)throw new Error('quota');state.stored=JSON.stringify(candidate);state.data=structuredClone(candidate);state.writes++; };
  return state;
}
test('V85 native dossier keeps Tab and Shift-Tab inside visible controls',()=>{
  const ui=Object.create(CrewUiV85.prototype);
  let focused=null,prevented=0;
  const control=()=>({hidden:false,tabIndex:0,getClientRects:()=>[{}],focus(){focused=this;}});
  const first=control(),last=control(),hidden={...control(),hidden:true};
  ui.document={activeElement:last};
  ui.dialog={open:true,querySelectorAll:()=>[first,last,hidden],contains:node=>[first,last,hidden].includes(node)};
  ui.trapFocus({key:'Tab',preventDefault(){prevented++;}});assert.equal(focused,first);
  ui.document.activeElement=first;
  ui.trapFocus({key:'Tab',shiftKey:true,preventDefault(){prevented++;}});assert.equal(focused,last);
  ui.document.activeElement={};
  ui.trapFocus({key:'Tab',preventDefault(){prevented++;}});assert.equal(focused,first);
  assert.equal(prevented,3);
  ui.trapFocus({key:'Escape',preventDefault(){throw Error('Native Escape must remain available');}});
});
test('V85 in-flight operations disable both assignment and treatment on actual cards',()=>{
  const save=fixture();save.strategy.currentOperation={id:'mission'};
  const ui=Object.create(CrewUiV85.prototype);ui.model=buildCrewUiModelV85(save,CREW);ui.itemCatalog=[];ui.rules={recruitCost:{credits:600}};
  const html=ui.card(ui.model.active[0]);
  assert.match(html,/data-v85-action="assign"[^>]*disabled/u);
  assert.match(html,/data-v85-action="treat"[^>]*disabled/u);
});
test('V85 roster overrides the legacy 75px portrait grid and fits narrow gear selectors',()=>{
  const css=readFileSync(new URL('../crew-v85.css',import.meta.url),'utf8');
  assert.match(css,/\.crew-roster-v85 \.crew-card\{[^}]*display:flex;[^}]*flex-direction:column;[^}]*min-width:0/u);
  assert.match(css,/\.crew-roster-v85 \.crew-grid\{[^}]*repeat\(auto-fit,minmax\(min\(100%,270px\),1fr\)\)/u);
  assert.match(css,/\.crew-dossier-v85 select\{[^}]*min-width:0/u);
  assert.match(css,/\.customization-filters select\{min-width:0;width:100%;max-width:100%\}/u);
});
test('V85 publishes recruitment state only after storage accepts the complete candidate',()=>{
  const saveSystem=harness(), original=saveSystem.data;
  commitCrewTransactionV85({saveSystem,owner:1,ownsOwner:o=>o===1,action:d=>{d.crew.push({id:'new'});d.galaxy.resources.credits-=600;assert.equal(saveSystem.data,original);assert.equal(original.crew.length,0);return 'hired';}});
  assert.equal(saveSystem.writes,1);assert.equal(saveSystem.data.crew.length,1);assert.equal(saveSystem.data.galaxy.resources.credits,2600);
});
test('V85 quota rejection preserves both memory and old save bytes',()=>{
  const saveSystem=harness(), before=structuredClone(saveSystem.data), bytes=saveSystem.stored;saveSystem.denied=true;
  assert.throws(()=>commitCrewTransactionV85({saveSystem,owner:1,ownsOwner:()=>true,action:d=>{d.savedValue=2;}}),/quota/);
  assert.deepEqual(saveSystem.data,before);assert.equal(saveSystem.stored,bytes);assert.equal(saveSystem.writes,0);
});
test('V85 stale dossier rejects before action and payment',()=>{
  const saveSystem=harness();let ran=false;
  assert.throws(()=>commitCrewTransactionV85({saveSystem,ownsOwner:()=>false,action:()=>{ran=true;}}),/chronologie/);
  assert.equal(ran,false);assert.equal(saveSystem.writes,0);
});
test('V85 ownership is checked again after preparing the candidate',()=>{
  const saveSystem=harness();let owned=true;
  assert.throws(()=>commitCrewTransactionV85({saveSystem,ownsOwner:()=>owned,action:d=>{d.savedValue=2;},prepare:()=>{owned=false;}}),/profil a changé/);
  assert.equal(saveSystem.data.savedValue,1);assert.equal(saveSystem.writes,0);
});
test('V85 elapsed campaign simulation acts on the candidate without double clock advancement',()=>{
  const saveSystem=harness();let hours;
  commitCrewTransactionV85({saveSystem,ownsOwner:()=>true,action:d=>{d.clock.hour+=4;},advanceTime:(d,n)=>{hours=n;assert.notEqual(d,saveSystem.data);d.simulatedHours=n;}});
  assert.equal(hours,4);assert.equal(saveSystem.data.clock.hour,10);assert.equal(saveSystem.data.simulatedHours,4);
});
test('V85 simulation failure cannot consume resources or alter the live timeline',()=>{
  const saveSystem=harness(), before=structuredClone(saveSystem.data);
  assert.throws(()=>commitCrewTransactionV85({saveSystem,ownsOwner:()=>true,action:d=>{d.clock.hour+=4;d.galaxy.resources.credits-=80;},advanceTime:()=>{throw new Error('simulation');}}),/simulation/);
  assert.deepEqual(saveSystem.data,before);assert.equal(saveSystem.writes,0);
});
test('V85 unknown action is rejected without a write',()=>{
  const saveSystem=harness();assert.throws(()=>commitCrewTransactionV85({saveSystem,ownsOwner:()=>true}),/inconnue/);assert.equal(saveSystem.writes,0);
});
function fixture() {
  const recruitmentV85=createRecruitmentV85('ui-regression');
  return {recruitmentV85,clock:{day:1,hour:6},galaxy:{resources:{credits:3200}},strategy:{selectedCrewIds:[CREW[0].id],currentOperation:null},crew:CREW.map(m=>({id:m.id,status:m.status,health:100,stress:0,fatigue:0}))};
}
test('V85 list separates active reserve and candidates without losing legacy names',()=>{
  const model=buildCrewUiModelV85(fixture(),CREW);
  assert.equal(model.active.length,1);assert.equal(model.reserve.length,15);assert.equal(model.candidates.length,4);
  assert.equal(model.active[0].name,'Mara Vega');assert.equal(new Set(model.members.map(m=>m.id)).size,16);
});
test('V85 read model does not regenerate or persist candidate offers',()=>{
  const save=fixture(), before=JSON.stringify(save);
  const first=buildCrewUiModelV85(save,CREW), second=buildCrewUiModelV85(save,CREW);
  assert.deepEqual(first.candidates,second.candidates);assert.equal(JSON.stringify(save),before);
});
test('V85 roster shows the immutable recruited identity plus current transferred gear',()=>{
  const save=fixture(),profile=save.recruitmentV85.candidates.shift();save.crew.push({id:profile.id,recruitV85:profile,gearV85:[],trainingV85:{tir:2},status:'active',health:100});
  const model=buildCrewUiModelV85(save,CREW),member=model.reserve.find(m=>m.id===profile.id);
  assert.equal(member.name,profile.name);assert.equal(member.aptitudesV85.tir,profile.aptitudes.tir+2);assert.deepEqual(member.gearV85,[]);
});
test('V85 prologue and operation lock model is visible before destructive choices',()=>{
  const save=fixture();save.onboardingV84={phase:'medical'};assert.equal(buildCrewUiModelV85(save,CREW).locked,true);
  save.onboardingV84.phase='complete';assert.equal(buildCrewUiModelV85(save,CREW).locked,false);
  save.strategy.currentOperation={id:'mission'};assert.equal(buildCrewUiModelV85(save,CREW).locked,true);
});
test('V85 dossier cards escape narrative content and use real candidate actions',()=>{
  const ui=Object.create(CrewUiV85.prototype);ui.model=buildCrewUiModelV85(fixture(),CREW);ui.itemCatalog=[];ui.rules={recruitCost:{credits:600}};
  const member=structuredClone(ui.model.candidates[0]);member.name='<img src=x onerror=alert(1)>';member.recruitV85.background.summary='<script>boom</script>';
  const html=ui.card(member);assert.ok(html.includes('&lt;img'));assert.ok(html.includes('&lt;script'));assert.ok(!html.includes('<script>'));assert.ok(html.includes('data-v85-action="recruit"'));
});
