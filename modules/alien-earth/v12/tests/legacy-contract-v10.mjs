import fs from 'node:fs';import assert from 'node:assert/strict';import {EARTH_DATA as D} from '../src/alien-earth-data.js';
/** The V10 request explicitly corrects door positions and two scene descriptions.
 * Replace stale byte-equality of those fields with strict preservation of gameplay and gate authority.
 * Original test fixtures remain unedited in data/base-v1..v9.json. */
export function assertLegacyEarthV10(){
 const old=JSON.parse(fs.readFileSync(new URL('../data/base-v9.json',import.meta.url)));
 for(const r of old.rooms){const n=D.rooms.find(q=>q.id===r.id);assert(n);for(const k of ['props','enemies','interactables','spawn','floorRegions'])assert.deepEqual(n[k],r[k],r.id+' '+k);
  for(const k of Object.keys(r.task))if(k!=='dialogue')assert.deepEqual(n.task[k],r.task[k],r.task.id+' '+k);
  for(const k of Object.keys(r.archive))if(k!=='text')assert.deepEqual(n.archive[k],r.archive[k]);
  if(!['R11','R12'].includes(r.id)){assert.equal(n.task.dialogue,r.task.dialogue);assert.equal(n.archive.text,r.archive.text);}
  for(const d of r.portals){const p=n.portals.find(p=>p.id===d.id);assert(p);for(const k of ['id','to','reverse','requires','hatchKey','shortcut','kind'])assert.deepEqual(p[k],d[k],d.id+' '+k);}
 }
 for(const k of ['creatures','networks','cameras','containmentPads','investigations','securityStations'])assert.deepEqual(D[k],old[k],k);
 assert.deepEqual(D.chapters.map(c=>c.goals),old.chapters.map(c=>c.goals));
 for(const p of old.characters){const n=D.characters.find(c=>c.id===p.id);for(const k of Object.keys(p))assert.deepEqual(n[k],p[k]);}
 assert.equal(D.rooms.filter(r=>Number(r.id.slice(1))<=62).length,62);assert.ok(D.links.length>=176);assert.equal(D.rooms.filter(r=>Number(r.id.slice(1))<=62).flatMap(r=>r.props).length,854);
}
