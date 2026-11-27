import test from 'node:test';import assert from 'node:assert/strict';
import { persistEarthProgress } from '../src/alien-earth-storage-v2.js';
import { newState,SAVE_KEY } from '../src/alien-earth-core.js';
class FixtureStorage{
 constructor(){this.data=new Map();this.writes=[];this.failOn=null;}
 getItem(k){return this.data.get(k)??null;}
 setItem(k,v){if(k===this.failOn)throw new Error('quota fixture');this.data.set(k,String(v));this.writes.push(k);}
}
test('stockage : écriture et relecture exacte du snapshot',()=>{const s=new FixtureStorage(),state=newState(),raw=persistEarthProgress(s,state,null);assert.deepEqual(JSON.parse(s.getItem(SAVE_KEY)),state);assert.equal(raw,s.getItem(SAVE_KEY));});
test('stockage : une sauvegarde V1 est recopiée avant remplacement',()=>{const s=new FixtureStorage(),legacy=JSON.stringify({...newState(),schema:1});s.data.set(SAVE_KEY,legacy);persistEarthProgress(s,newState(),legacy);assert.equal(s.getItem(SAVE_KEY+'.backup-v1'),legacy);assert.deepEqual(s.writes,[SAVE_KEY+'.backup-v1',SAVE_KEY]);});
test('stockage : la première copie V1 n’est jamais écrasée',()=>{const s=new FixtureStorage(),raw=JSON.stringify({...newState(),schema:1});s.data.set(SAVE_KEY,raw);s.data.set(SAVE_KEY+'.backup-v1','première copie');persistEarthProgress(s,newState(),raw);assert.equal(s.getItem(SAVE_KEY+'.backup-v1'),'première copie');});
test('stockage : une modification concurrente détectée interdit toute écriture',()=>{const s=new FixtureStorage();s.data.set(SAVE_KEY,'autre onglet');assert.throws(()=>persistEarthProgress(s,newState(),null),e=>e.code==='EARTH_SAVE_CONFLICT');assert.equal(s.getItem(SAVE_KEY),'autre onglet');assert.equal(s.writes.length,0);});
test('stockage : échec de la copie V1 conserve intégralement l’original',()=>{const s=new FixtureStorage(),raw=JSON.stringify({...newState(),schema:1});s.data.set(SAVE_KEY,raw);s.failOn=SAVE_KEY+'.backup-v1';assert.throws(()=>persistEarthProgress(s,newState(),raw));assert.equal(s.getItem(SAVE_KEY),raw);});
test('stockage : échec de l’écriture principale conserve original et copie',()=>{const s=new FixtureStorage(),raw=JSON.stringify({...newState(),schema:1});s.data.set(SAVE_KEY,raw);s.failOn=SAVE_KEY;assert.throws(()=>persistEarthProgress(s,newState(),raw));assert.equal(s.getItem(SAVE_KEY),raw);assert.equal(s.getItem(SAVE_KEY+'.backup-v1'),raw);});
test('stockage : une sauvegarde V2 n’engendre pas une fausse copie V1',()=>{const s=new FixtureStorage(),raw=JSON.stringify(newState());s.data.set(SAVE_KEY,raw);persistEarthProgress(s,newState(),raw);assert.equal(s.getItem(SAVE_KEY+'.backup-v1'),null);});
test('stockage : aucune lecture ou écriture sur les autres profils ou DLC',()=>{const s=new FixtureStorage();s.data.set('host-save','à conserver');s.data.set('other-dlc','autre');persistEarthProgress(s,newState(),null);assert.equal(s.getItem('host-save'),'à conserver');assert.equal(s.getItem('other-dlc'),'autre');assert.deepEqual(s.writes,[SAVE_KEY]);});
