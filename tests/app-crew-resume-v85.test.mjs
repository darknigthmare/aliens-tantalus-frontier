import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const start=app.slice(app.indexOf('function startMissionRuntimeV62(context) {'),app.indexOf('\nfunction handleMissionInsertionHooksV62'));
for (const enabled of [false,true]) for (const nativeResume of [false,true]) {
  test(`V85 app honors coop=${enabled} after ${nativeResume?'native':'compatibility'} operation resume`,()=>{
    const calls=[];
    const log={textContent:''};
    const engine={coopEnabled:false,activeSquadActors(){return Array.from({length:this.coopEnabled?3:4});},setCoop(value){calls.push(['coop',value]);this.coopEnabled=value;},start(){calls.push(['start']);this.coopEnabled=!enabled;this.lastResumeResult={applied:nativeResume};}};
    const scope={engine,ENEMIES:[],profileEpochV78:1,pendingMissionLaunchV62:{},missionOwnerV78:null,
      saveSystem:{profile:1,data:{createdAt:12345,settings:{coop:enabled},strategy:{currentOperation:{id:'operation-v85'}}}},
      getSpecialOperationByCampaignIdV67:()=>null,applyOpeningMissionSuppliesV88:()=>false,
      destroyMissionInsertionUiV62(){},applyMissionResumeState(){calls.push(['compat']);engine.coopEnabled=!enabled;},
      setupAlphaBravoCommandDockV69:()=>({refresh(){calls.push(['dock',engine.coopEnabled]);}}),
      setupAlienSurvivalDockV70:()=>({refresh(){}}),renderMissionEquipment(){},byId:id=>id==='mission-log'?log:{focus(){}},
      context:{campaign:{id:'campaign-v85'},levelSeed:{seed:85},world:{},worldState:{},deployment:{operation:{}},operationLoadout:{resumeState:{schema:2}}}};
    runInNewContext(start+'\nstartMissionRuntimeV62(context);',scope);
    assert.equal(engine.coopEnabled,enabled);
    assert.equal(scope.missionOwnerV78.timeline, scope.saveSystem.data.createdAt, 'Campaign events own the same saved timeline');
    assert.ok(log.textContent.includes(`${enabled?3:4} alliés IA physiques`));
    assert.deepEqual(calls.at(-2),['coop',enabled]);
    assert.deepEqual(calls.at(-1),['dock',enabled]);
    assert.ok(calls.findIndex(call=>call[0]==='start') < calls.length-2);
    if(!nativeResume)assert.deepEqual(calls.at(-3),['compat']);
  });
}
