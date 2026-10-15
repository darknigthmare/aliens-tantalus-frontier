import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { ForgeModel, LAYERS, serializeProject, clone } from '../src/forge-model-v130.js';
import { ForgeSaveSystemV62, FORGE_LEGACY_SAVE_KEY_V62 as FORGE_SAVE_KEY_V62, FORGE_SAVE_KEY_V134, ForgeWorkspaceV133 } from '../src/forge-save-v62.js';
import { ForgeSaveSystemV62 as LegacyStore } from '../src/forge-save-v62-base.js';
import { LevelEditor } from '../src/editor.js';
import { selectionGroupsV134, planArrangementV134, applyArrangementV134, exploreForgeV134,
  labelForgeCellsV134, diagramForgeV134, forgeSearchReportV134 } from '../src/forge-layout-v134.js';
const transaction=(m,fn)=>m.transaction('fixture',fn);
const create=()=>{const m=new ForgeModel();transaction(m,()=>{for(const [x,y] of [[2,2],[2,3],[10,5],[20,8]])m.paint(x,y,'wall','structure');});return m;};
const ids=m=>m.room.cells.map(c=>c.id), snapshot=m=>JSON.stringify(m.data);
const storage=()=>{const map=new Map();return {map,getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,String(v))};};
const record=m=>({...serializeProject(m.data),id:'forge-a'});
function linked() {const m=create();transaction(m,()=>{m.room.cells=[];m.paint(3,3,'door','gameplay');const a=m.room.cells[0].id;m.addRoom();m.paint(6,5,'door','gameplay');m.link(m.room.cells[0].id,'room-1',a,true);});return m;}
class Canvas extends EventTarget {
 constructor(){super();this.width=1280;this.height=720;this.style={};this.ownerDocument=null;this.ctx=new Proxy({}, {get:(t,k)=>t[k]??(()=>{}),set:(t,k,v)=>(t[k]=v,true)});}
 getContext(){return this.ctx;}getBoundingClientRect(){return {left:0,top:0,width:1280,height:720};}setAttribute(){}focus(){}
}

test('islands group orthogonal contact and stacked layers, not diagonal neighbours',()=>{
 const m=create();transaction(m,()=>{m.paint(2,2,'terminal','background');m.paint(3,4,'wall','structure');});
 const groups=selectionGroupsV134(m.room.cells);assert.deepEqual(groups.map(g=>g.cells.length),[3,1,1,1]);
 assert.equal(selectionGroupsV134(m.room.cells,'cells').length,6);
});
test('group detection is deterministic under cell order permutations',()=>{const m=create();assert.deepEqual(selectionGroupsV134(m.room.cells),selectionGroupsV134([...m.room.cells].reverse()));});
test('preview is read-only and uses separate target cell objects',()=>{const m=create(),before=snapshot(m),history=m.history.length,p=planArrangementV134(m,ids(m),'left');p.moves[0].label='changed only in preview';assert.equal(snapshot(m),before);assert.equal(m.history.length,history);});
for (const command of ['left','right','centerX']) test(`${command} aligns islands without changing their shape`,()=>{
 const m=create(),p=planArrangementV134(m,ids(m),command);assert.equal(p.ok,true);applyArrangementV134(m,p);
 assert.equal(new Set(m.room.cells.map(c=>c.x)).size,1);assert.equal(m.room.cells[1].y-m.room.cells[0].y,1);
});
for (const command of ['top','bottom','centerY']) test(`${command} aligns separated single-cell groups vertically`,()=>{
 const m=create();transaction(m,()=>m.room.cells.splice(1,1));const p=planArrangementV134(m,ids(m),command);assert.equal(p.ok,true);applyArrangementV134(m,p);assert.equal(new Set(m.room.cells.map(c=>c.y)).size,1);
});
test('room reference can move a group to the right edge, never resize it',()=>{const m=create(),wanted=m.room.cells.slice(0,2).map(c=>c.id);const p=planArrangementV134(m,wanted,'right',{reference:'room'});applyArrangementV134(m,p);assert.equal(m.room.cells[0].x,31);assert.equal(m.room.cells[1].x,31);});
test('horizontal spacing keeps edge groups anchored and rounds only grid positions',()=>{const m=create(),p=planArrangementV134(m,ids(m),'distributeX');assert.equal(p.ok,true);applyArrangementV134(m,p);assert.deepEqual(m.room.cells.map(c=>c.x),[2,2,11,20]);});
test('vertical spacing accounts for each group height',()=>{const m=create(),p=planArrangementV134(m,ids(m),'distributeY');assert.equal(p.ok,true);applyArrangementV134(m,p);assert.deepEqual(m.room.cells.map(c=>c.y),[2,3,6,8]);});
test('spacing refuses fewer than three groups',()=>{const m=create();assert.throws(()=>planArrangementV134(m,ids(m).slice(0,3),'distributeX'),/trois/);});
test('single-cell alignment cannot silently collapse cells in same layer',()=>{const m=create(),p=planArrangementV134(m,ids(m),'top',{grouping:'cells'});assert.equal(p.ok,false);assert.throws(()=>applyArrangementV134(m,p));});
test('grid step is deterministic and can be undone as one action',()=>{const m=create(),before=snapshot(m),h=m.history.length;const p=planArrangementV134(m,ids(m),'snap',{step:3});assert.equal(p.ok,true);applyArrangementV134(m,p);assert.equal(m.history.length,h+1);m.undo();assert.equal(snapshot(m),before);m.redo();assert.equal(m.room.cells[0].x,3);});
test('alignment no-op does not consume history',()=>{const m=create();const first=m.room.cells.slice(0,2).map(c=>c.id),p=planArrangementV134(m,first,'left'),h=m.history.length;assert.equal(p.changed,false);assert.equal(applyArrangementV134(m,p),false);assert.equal(m.history.length,h);});
test('unselected same-layer destination blocks whole operation',()=>{const m=create();transaction(m,()=>m.paint(2,5,'wall','structure'));const before=snapshot(m),p=planArrangementV134(m,[m.room.cells[2].id],'left',{reference:'room'}); // x=0 allowed
 assert.equal(p.ok,true);
 const clash=planArrangementV134(m,ids(m).slice(0,4),'left');assert.equal(clash.ok,false);assert.throws(()=>applyArrangementV134(m,clash));assert.equal(snapshot(m),before);
});
test('physical destination in another layer is still a conflict',()=>{const m=create();transaction(m,()=>m.paint(0,5,'terminal','gameplay'));const p=planArrangementV134(m,[m.room.cells[2].id],'left',{reference:'room'});assert.equal(p.ok,false);assert.ok(p.errors.some(e=>e.code==='chevauchement physique'));});
test('decorative destination permits structural overlap',()=>{const m=create();transaction(m,()=>m.paint(0,5,'terminal','background'));const p=planArrangementV134(m,[m.room.cells[2].id],'left',{reference:'room'});assert.equal(p.ok,true);});
test('locked or hidden selected content blocks preview',()=>{for(const opts of [{locked:new Set(['structure'])},{visible:new Set(['background'])}])assert.throws(()=>planArrangementV134(create(),ids(create()),'left',opts));const m=create();transaction(m,()=>m.room.cells[0].locked=true);assert.throws(()=>planArrangementV134(m,ids(m),'left'));});
test('access rights are checked again at apply time',()=>{const m=create(),p=planArrangementV134(m,ids(m),'left'),before=snapshot(m);assert.throws(()=>applyArrangementV134(m,p,{locked:new Set(['structure'])}));assert.equal(snapshot(m),before);});
test('preview becomes stale after another command',()=>{const m=create(),p=planArrangementV134(m,ids(m),'left');transaction(m,()=>m.room.name='Later');assert.throws(()=>applyArrangementV134(m,p),/obsolète/);});
test('preview is bound to the model as well as its revision',()=>{const a=create(),b=create(),p=planArrangementV134(a,ids(a),'left');assert.throws(()=>applyArrangementV134(b,p),/obsolète/);});
test('pending pointer gesture prevents applying preview',()=>{const m=create(),p=planArrangementV134(m,ids(m),'left');m.begin();assert.throws(()=>applyArrangementV134(m,p));m.cancel();});
test('linked door keeps stable endpoint after alignment',()=>{const m=linked(),before=clone(m.data.links),p=planArrangementV134(m,ids(m),'right',{reference:'room'});applyArrangementV134(m,p);assert.deepEqual(m.data.links,before);});
for(const options of [{grouping:'unknown'},{reference:'unknown'},{step:0},{step:17},{step:2.5}])test(`invalid layout options rejected ${JSON.stringify(options)}`,()=>{const m=create();assert.throws(()=>planArrangementV134(m,ids(m),'left',options));});
test('stale selection IDs fail closed',()=>{const m=create();assert.throws(()=>planArrangementV134(m,['no-longer-there'],'left'));});
test('out-of-bounds snapped group is rejected without clipping',()=>{const m=new ForgeModel();transaction(m,()=>m.paint(31,17,'wall','structure'));const p=planArrangementV134(m,ids(m),'snap',{step:16});assert.equal(p.ok,false);assert.throws(()=>applyArrangementV134(m,p));});

test('explorer finds accent-insensitive labels and French type names',()=>{const m=create();transaction(m,()=>{m.room.name='Ingénierie';m.room.cells[0].label='Accès sécurisé';});assert.equal(exploreForgeV134(m.data,{query:'ingenierie acces'}).total,1);assert.equal(exploreForgeV134(m.data,{query:'cloison'}).total,4);});
test('explorer combines type, layer, state and room filters',()=>{const m=linked();transaction(m,()=>{m.paint(10,5,'door','gameplay');m.room.cells[1].locked=true;});assert.equal(exploreForgeV134(m.data,{state:'unlinked'}).total,1);assert.equal(exploreForgeV134(m.data,{roomId:'room-1',type:'door',layer:'gameplay'}).total,1);assert.equal(exploreForgeV134(m.data,{state:'locked'}).total,1);});
test('large result sets are paginated without omitting exported matches',()=>{const m=new ForgeModel();transaction(m,()=>m.fill(0,0,'floor','structure'));const page=exploreForgeV134(m.data,{page:1});assert.equal(page.items.length,50);assert.equal(page.total,576);assert.equal(new Set([...exploreForgeV134(m.data).items,...page.items].map(c=>c.id)).size,100);const report=forgeSearchReportV134(m.data);assert.equal(report.items.length,576);});
test('empty explorer results keep a usable first page',()=>{const p=exploreForgeV134(create().data,{query:'unfindable',page:7});assert.equal(p.page,0);assert.equal(p.pages,1);assert.equal(p.total,0);});
test('out-of-range page clamps after filtering',()=>assert.equal(exploreForgeV134(create().data,{page:1000}).page,0));
test('explorer snapshots cannot modify authored data',()=>{const m=create(),before=snapshot(m),p=exploreForgeV134(m.data);p.items[0].x=999;assert.equal(snapshot(m),before);});
for(const filters of [{type:'code'},{layer:'unknown'},{state:'invalid'},{roomId:'missing'},{page:-1},{pageSize:1000}])test(`invalid search filters rejected ${JSON.stringify(filters)}`,()=>assert.throws(()=>exploreForgeV134(create().data,filters)));
test('numbering works across rooms and retains links',()=>{const m=linked(),before=snapshot(m),links=clone(m.data.links),chosen=m.data.rooms.flatMap(r=>r.cells.map(c=>c.id));labelForgeCellsV134(m,chosen,'Sas réseau',7);assert.deepEqual(m.data.rooms.flatMap(r=>r.cells.map(c=>c.label)),['Sas réseau 007','Sas réseau 008']);assert.deepEqual(m.data.links,links);m.undo();assert.equal(snapshot(m),before);});
test('numbering rejects locked targeted cells with no partial change',()=>{const m=create();transaction(m,()=>m.room.cells[1].locked=true);const before=snapshot(m);assert.throws(()=>labelForgeCellsV134(m,ids(m),'Fixture'));assert.equal(snapshot(m),before);});
test('numbering validates name and counter before mutation',()=>{const m=create(),before=snapshot(m);assert.throws(()=>labelForgeCellsV134(m,ids(m),' '));assert.throws(()=>labelForgeCellsV134(m,ids(m),'Prefix',-1));assert.equal(snapshot(m),before);});
test('diagram has finite non-overlapping cards and directed connections',()=>{const m=linked();transaction(m,()=>m.addRoom());const data=diagramForgeV134(m.data);assert.equal(data.nodes.length,3);assert.equal(data.edges.length,1);assert.equal(data.nodes.filter(n=>n.reachable).length,1);for(const a of data.nodes){assert.ok([a.x,a.y,a.w,a.h].every(Number.isFinite));for(const b of data.nodes)if(a!==b)assert.ok(a.x+a.w<=b.x||b.x+b.w<=a.x||a.y+a.h<=b.y||b.y+b.h<=a.y);}});
test('diagram layout is read-only and deterministic',()=>{const m=linked(),before=snapshot(m);assert.deepEqual(diagramForgeV134(m.data),diagramForgeV134(m.data));assert.equal(snapshot(m),before);});

test('default workspace uses a new namespace inaccessible to old code',()=>{const s=storage(),store=new ForgeSaveSystemV62(s);store.load();assert.equal(store.key,FORGE_SAVE_KEY_V134);assert.equal(s.getItem(FORGE_SAVE_KEY_V62),null);});
test('migration copies every room and leaves legacy bytes intact',()=>{const s=storage(),old=new LegacyStore(s);old.load();old.upsert(record(linked()));const raw=s.getItem(FORGE_SAVE_KEY_V62);const store=new ForgeSaveSystemV62(s);assert.equal(store.load().migratedV134,true);assert.equal(s.getItem(FORGE_SAVE_KEY_V62),raw);assert.equal(store.data.projects[0].rooms.length,2);assert.equal(store.data.projects[0].links.length,1);});
test('changes in an older release cannot overwrite the new workspace',()=>{const s=storage(),old=new LegacyStore(s);old.load();old.upsert(record(linked()));const store=new ForgeSaveSystemV62(s);store.load();const raw=s.getItem(FORGE_SAVE_KEY_V134);old.remove('forge-a');const reread=new ForgeSaveSystemV62(s);reread.load();assert.equal(reread.data.projects[0].rooms.length,2);assert.equal(JSON.parse(raw).projects[0].links.length,1);});
test('existing canonical workspace wins over modified legacy source',()=>{const s=storage(),current=new ForgeSaveSystemV62(s);current.load();current.upsert(record(create()));s.setItem(FORGE_SAVE_KEY_V62,'broken');const next=new ForgeSaveSystemV62(s);assert.equal(next.load().recoveryNeeded,false);assert.equal(next.data.projects[0].rooms.length,1);});
test('corrupt new workspace never silently falls back to an old copy',()=>{const s=storage(),old=new LegacyStore(s);old.load();old.upsert(record(create()));s.setItem(FORGE_SAVE_KEY_V134,'corrupt-new');const current=new ForgeSaveSystemV62(s);assert.equal(current.load().recoveryNeeded,true);assert.equal(s.getItem(FORGE_SAVE_KEY_V134),'corrupt-new');});
test('invalid legacy source is preserved and blocks automatic migration',()=>{const s=storage();s.setItem(FORGE_SAVE_KEY_V62,'broken-old');const current=new ForgeSaveSystemV62(s);assert.equal(current.load().recoveryNeeded,true);assert.equal(s.getItem(FORGE_SAVE_KEY_V134),null);assert.equal(current.exportRawV130(),'broken-old');});
test('migration quota failure leaves original and canonical untouched',()=>{const s=storage(),old=new LegacyStore(s);old.load();old.upsert(record(create()));const raw=s.getItem(FORGE_SAVE_KEY_V62);s.setItem=()=>{throw new Error('quota');};const current=new ForgeSaveSystemV62(s);assert.equal(current.load().migratedV134,false);assert.equal(s.getItem(FORGE_SAVE_KEY_V62),raw);assert.equal(s.getItem(FORGE_SAVE_KEY_V134),null);assert.equal(current.data.projects.length,1);});
test('migration is idempotent on repeated loads',()=>{const s=storage(),old=new LegacyStore(s);old.load();old.upsert(record(create()));const current=new ForgeSaveSystemV62(s);current.load();current.load();assert.equal(current.data.projects.length,1);});
test('explicit custom key preserves storage adapter compatibility',()=>{const s=storage(),current=new ForgeSaveSystemV62(s,'test-custom');current.load();assert.ok(s.getItem('test-custom'));assert.equal(s.getItem(FORGE_SAVE_KEY_V134),null);});

test('boot load cannot undo into an empty document or rewrite storage',()=>{const s=storage(),store=new ForgeSaveSystemV62(s);store.load();store.upsert(record(create()));const before=s.getItem(store.key);let writes=0;const ed=new LevelEditor(new Canvas(),()=>writes++,{store});ed.load(store.data.projects[0]);assert.equal(ed.history.length,0);assert.equal(ed.undo(),false);assert.equal(ed.room.cells.length,4);assert.equal(writes,0);assert.equal(s.getItem(store.key),before);ed.destroy();});
test('ordinary file import remains undoable within its project',()=>{const ed=new LevelEditor(new Canvas());ed.loadInitialProject(record(create()));const before=JSON.stringify(ed.model.data);ed.load({schema:2,size:[64,36],tiles:[]});assert.equal(ed.cols,64);ed.undo();assert.equal(JSON.stringify(ed.model.data),before);ed.destroy();});
test('validation cache cannot leak mutable diagnostics to callers',()=>{const ed=new LevelEditor(new Canvas());ed.loadInitialProject(record(create()));const v=ed.validate();v.errors.length=0;assert.ok(ed.validate().errors.length>0);ed.edit('spawn',()=>ed.model.paint(6,6,'spawn','gameplay'));assert.equal(ed.validate().counts.spawn,1);ed.undo();assert.equal(ed.validate().counts.spawn,0);ed.destroy();});
test('serialization remains fresh after changing rooms',()=>{const ed=new LevelEditor(new Canvas());ed.loadInitialProject(record(linked()));ed.setRoom('room-1');assert.equal(ed.serialize().activeRoomId,'room-1');assert.equal(ed.serialize().tiles[0].position,'3:3');ed.destroy();});
test('startup supplies the saved object to the explicit initial-document load method',async()=>{for(const [file,pattern] of [['src/app.js',/if \(saved\) editor\.loadInitialProject\(saved\)/],['scripts/fixtures/forge-v130.html',/if\(saved\)ed\.load\(saved\)/]])assert.match(await readFile(new URL('../'+file,import.meta.url),'utf8'),pattern);});
test('service worker contains every local module and stylesheet in Forge closure',async()=>{
 const sw=await readFile(new URL('../sw.js',import.meta.url),'utf8');assert.match(sw,/const CACHE = 'atf-v86-tantalus-forge-v141-\d+';/,'Merged Tantalus/Forge shell must use its V141 cache namespace');
 const pending=['src/editor.js','src/forge-save-v62.js'],seen=new Set();
 while(pending.length){const file=pending.pop();if(seen.has(file))continue;seen.add(file);const code=await readFile(new URL('../'+file,import.meta.url),'utf8');assert.ok(sw.includes(`'/${file}'`),`not precached: ${file}`);for(const match of code.matchAll(/(?:from\s+|import\s+)['"]\.\/([^'"]+)['"]/g))pending.push('src/'+match[1]);}
 for(const file of ['forge-editor-v130.css','forge-workbench-v133.css','forge-navigator-v134.css'])assert.ok(sw.includes(`'/src/${file}'`));
});

test('undefined imported project is rejected rather than mistaken for boot load',()=>{const ed=new LevelEditor(new Canvas());assert.throws(()=>ed.load(undefined));ed.destroy();});
