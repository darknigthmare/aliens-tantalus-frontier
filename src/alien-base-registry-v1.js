/* Sourced from an allowlisted, offline snapshot of darknigthmare/alien_base.
 * Never contacts private GitHub at runtime or admits enemies or researched weapons. */
import { ALIEN_BASE_PUBLIC_SNAPSHOT_V1 as snapshot } from './alien-base-public-v1.js';
const deepFreeze=value=>{if(value&&typeof value==='object'){for(const item of Object.values(value))deepFreeze(item);if(!Object.isFrozen(value))Object.freeze(value)}return value};
deepFreeze(snapshot);
const collections=snapshot.records;
const lookup=Object.freeze(Object.fromEntries(Object.entries(collections).map(([name,rows])=>[name,new Map(rows.map(row=>[row.id,row]))])));
export const ALIEN_BASE_PUBLIC_VERSION=Object.freeze({format:snapshot.format,version:snapshot.version,sourceCommits:snapshot.sourceCommits});
export const ALIEN_BASE_REFERENCE_COUNTS=Object.freeze(Object.fromEntries(Object.entries(collections).map(([key,value])=>[key,value.length])));
export function getAlienBaseRecord(category,id){return typeof id==='string'&&Object.hasOwn(lookup,category)?lookup[category].get(id)??null:null}
export function getAlienBaseProfile(id){if(typeof id!=='string')return null;return getAlienBaseRecord('profiles',id.startsWith('yhw:')?id:'yhw:'+id)}
export function getAlienBaseWeapon(id){if(typeof id!=='string')return null;return getAlienBaseRecord('weapons',id.startsWith('tantalus:')?id:'tantalus:'+id)}
export function validateAlienBaseSnapshot(){const errors=[];if(snapshot.format!=='alien-base-public-v1')errors.push('Unsupported schema');for(const[cat,rows]of Object.entries(collections)){if(new Set(rows.map(x=>x.id)).size!==rows.length)errors.push(cat+': duplicate ID');if(rows.some(x=>!x.id||!x.name))errors.push(cat+': invalid row')}for(const row of collections.weapons)if(row.legacyId.startsWith('proposed-')&&row.admission!=='research-only')errors.push(row.id+': inadmissible research');for(const row of collections.profiles)if(row.visual1to1!==false)errors.push(row.id+': misleading 1:1');return{valid:errors.length===0,errors,counts:ALIEN_BASE_REFERENCE_COUNTS}}
