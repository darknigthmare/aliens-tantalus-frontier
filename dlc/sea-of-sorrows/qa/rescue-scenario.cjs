'use strict';
/* Targeted rescue test starting from an unmodified full-run save. All subsequent
   changes use gameplay inputs. The hazardous wait is deliberate; HP is never set. */
const fs=require('node:fs'),path=require('node:path'),A=require('node:assert/strict'),C=require('../src/core.js');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'qa/tactical-fixtures'),g=new C.Game();g.importSave(fs.readFileSync(path.join(dir,'convoy.json'),'utf8'));
const outDir=path.join(root,'qa/rescue-rerun-fixtures');fs.mkdirSync(outDir,{recursive:true});
const initial=g.exportSave(),log=[];let ticks=0;
function tick(input={}){
 if(++ticks>10000)throw Error('Budget dépassé');
 if(g.state.failed)throw Error(g.state.failed);
 if(g.p.hp<45&&g.p.medkits)g.useMedkit();
 const e=g.rs.enemies.find(e=>e.hp>0&&g.distance(g.p,e)<700&&g.visible(g.p,e));
 if(e){g.setWeapon('pistol');if(g.p.ammo===0)g.reload();else g.shoot(e);}
 g.step(.05,input);g.drainEvents();if(!g.validate(g.state))throw Error('État invalide');
}
function walk(x){for(let n=0;n<1600&&Math.abs(g.p.x-x)>18;n++)tick({right:g.p.x<x,left:g.p.x>x});A.ok(Math.abs(g.p.x-x)<20);}
walk(550);for(let i=0;i<150;i++)tick();g.toggleConvoy();
const a=g.state.rescue.actors[1],before=a.integrity,h=g.room.hazards[0];
A.ok(g.inHazard(a,h));log.push({event:'halt-in-hazard',time:g.state.stats.time,integrity:a.integrity,x:a.x});
for(let i=0;i<260&&a.integrity===before;i++)tick();A.ok(a.integrity<before);log.push({event:'steam-damage',time:g.state.stats.time,integrity:a.integrity});
for(let i=0;i<220&&g.hazardStatus(h).phase!=='safe';i++)tick();
walk(a.x-74);
const parts=g.p.parts;log.push({event:"before-repair",time:g.state.stats.time,integrity:a.integrity,parts});for(let i=0;i<30;i++)tick({repair:true});
A.ok(g.state.repair.progress>1);fs.writeFileSync(path.join(outDir,'repair-played.json'),g.exportSave());
for(let i=0;i<100&&g.state.stats.repairs<1;i++)tick({repair:true});
A.equal(g.state.stats.repairs,1);A.equal(g.p.parts,parts-1);A.equal(a.integrity,100);log.push({event:'repair-completed',time:g.state.stats.time,integrity:a.integrity,parts:g.p.parts});
fs.writeFileSync(path.join(outDir,'repair-completed.json'),g.exportSave());
fs.writeFileSync(path.join(root,'reports/rescue-scenario.json'),JSON.stringify({version:require('../data/campaign.json').meta.version,passed:true,source:'convoy.json from continuous HYBRID / survival run',scope:'Targeted scenario: deliberate pause of the convoy on live steam, then field repair through movement and repair inputs. No placement or HP injection.',ticks,log},null,2));console.log('PASS',log);
