/** Checks the production compilers against the read-only admission report.
 * DOM/images/RAF use explicit doubles; production gameplay classes remain real.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {ForgeModel,applyTemplate,serializeProject} from '../src/forge-model-v130.js';
import {inspectForgePlaytestV136,admittedForgeProjectV136} from '../src/forge-playtest-v136.js';
import {missionV136,hostV136} from './forge-native-host-v136.mjs';
import {HubGame} from '../src/hub-opening-v88.js';
const project=(kind='mission',size=[32,18])=>{const m=new ForgeModel({schema:2,kind,size,tiles:[]});m.transaction('room',()=>applyTemplate(m,'corridor'));return m;};
for(const size of [[32,18],[64,36],[128,72]])test(`admitted Mission projection and native static geometry agree at ${size}`,()=>{
 const m=project('mission',size);m.transaction('platform',()=>m.paint(8,10,'platform','structure'));
 const report=inspectForgePlaytestV136(m.data);assert.equal(report.ok,true);
 const {engine}=missionV136({editorProject:admittedForgeProjectV136(m.data)});
 assert.equal(engine.editorTileCount,m.room.cells.length);
 const p=report.geometry.find(g=>g.type==='platform'),actual=engine.platforms.find(p=>!p.floor);
 assert.equal(p.x,actual.x);assert.equal(p.y,actual.y);assert.equal(p.w,actual.w);assert.equal(p.h,actual.h);
 assert.ok(Math.abs(report.geometry.find(g=>g.type==='spawn').x-engine.player.x)<.01);engine.stop();
});
test('maximum-grid Mission is admitted and all authored cells reach the production compiler',()=>{
 const m=project('mission',[128,72]),{engine}=missionV136({editorProject:serializeProject(m.data)});
 assert.equal(m.room.cells.length,131);assert.equal(engine.editorTileCount,131);
 assert.equal(inspectForgePlaytestV136(m.data).ok,true);assert.equal(admittedForgeProjectV136(m.data).tiles.length,131);engine.stop();
});
test('admission of a lossy plan cannot mutate an already running engine',()=>{
 const {engine}=missionV136({editorProject:serializeProject(project().data)}),actor=engine.player,mission=engine.mission;
 const lossy=project('mission',[128,72]);lossy.transaction('extra objective',()=>lossy.paint(6,69,'objective','gameplay'));
 assert.throws(()=>admittedForgeProjectV136(lossy.data));assert.equal(engine.player,actor);assert.equal(engine.mission,mission);assert.equal(engine.running,true);engine.stop();
});
for(const size of [[32,18],[128,72]])test(`Ship admission matches published insertion geometry at ${size}`,()=>{
 const m=project('ship',size),input=admittedForgeProjectV136(m.data),report=inspectForgePlaytestV136(m.data),host=hostV136();let writes=0;
 const engine=new HubGame(host.canvas,{onPersist:()=>writes++});engine.start({},{editorProject:input});
 assert.equal(engine.editorPlaytest,true);assert.equal(engine.v51Objectives.length,1);
 const spawn=report.geometry.find(g=>g.type==='spawn');assert.equal(engine.player.x,spawn.x);assert.equal(engine.player.y,spawn.y);
 engine.stop(false);assert.equal(writes,0);
});
test('production Mission isolation removes unrelated reference-campaign objectives',()=>{
 const m=project(),{engine}=missionV136({editorProject:admittedForgeProjectV136(m.data)});
 assert.equal(engine.campaign.id,'forge-authored-v136');assert.equal(engine.objectiveRuntime.id,'forge-authored-objective-v136');
 assert.deepEqual(engine.objectiveNodes,[]);assert.ok(engine.powerNode);assert.equal(engine.archiveTerminal,null);
 assert.deepEqual(engine.objectiveRuntime.requirements,['power']);
 assert.ok(!inspectForgePlaytestV136(m.data).issues.some(i=>i.code==='native-reference-scenario'));engine.stop();
});
test('extra markers rejected by admission correspond to native singular capacities',()=>{
 const m=project();m.transaction('extra',()=>m.paint(6,15,'objective','gameplay'));
 const {engine}=missionV136({editorProject:serializeProject(m.data)});assert.ok(engine.objective);assert.equal(Array.isArray(engine.objective),false);
 assert.equal(inspectForgePlaytestV136(m.data).ok,false);engine.stop();
});
