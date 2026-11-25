/** A paused flight resumes from its world pose, without re-emitting the previous impact. */
import {makeSaveV107,parseSaveV107} from './alien3-save-v107.js';
import {fnv104} from './alien3-dlc-v104.js';
import {createDiversionV108,snapshotDiversionV108,validateDiversionV108} from './alien3-diversion-v108.js';
const physicalDoors=(model,statuses=[])=>model.scene.gates.map(g=>({...g,open:statuses.find(d=>d.id===g.id)?.open===true,progress:statuses.find(d=>d.id===g.id)?.open===true?1:0}));
const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x),fail=reason=>({ok:false,reason});
function envelope(body){return {schema:108,kind:'fiorina-echos-metal',checksum:fnv104(JSON.stringify(body)),...body};}
export function makeSaveV108(e){return envelope({base:makeSaveV107(e),diversion:snapshotDiversionV108(e.alien3DiversionV108)||createDiversionV108(e.alien3EncounterV105,e.alien3NavV105),safePoint:e.alien3SafePointV108||null});}
export function parseSaveV108(text,model){if(typeof text!=='string'||new TextEncoder().encode(text).length>1048576)return fail('size');let raw;try{raw=JSON.parse(text);}catch{return fail('json');}if(!object(raw))return fail('format');
 if([105,106,107].includes(raw.schema)){const old=parseSaveV107(text,model);if(!old.ok)return old;const diversion=createDiversionV108(old.encounter,model);let safe=null;
  if(old.safePoint107){const body={base:old.safePoint107.base,operations:old.safePoint107.operations,safePoint:null};const legacy={schema:107,kind:'fiorina-manoeuvres',checksum:fnv104(JSON.stringify(body)),...body};const check=parseSaveV107(JSON.stringify(legacy),model);if(!check.ok)return fail('migration-safe-'+check.reason);safe={base:legacy,diversion:createDiversionV108(check.encounter,model)};}
  return {...old,diversion,safePoint108:safe,migrated:true};
 }
 if(raw.schema!==108||raw.kind!=='fiorina-echos-metal')return fail('identity');const body={base:raw.base,diversion:raw.diversion,safePoint:raw.safePoint||null};if(fnv104(JSON.stringify(body))!==raw.checksum)return fail('checksum');
 const prior=parseSaveV107(JSON.stringify(raw.base),model);if(!prior.ok)return fail('base-'+prior.reason);const checked=validateDiversionV108(raw.diversion,prior.encounter,model,physicalDoors(model,prior.base.doors));if(!checked.ok)return fail('diversion-'+checked.reason);
 if(raw.safePoint){if(!object(raw.safePoint)||raw.safePoint.safePoint)return fail('safe-recursive');const earlier=parseSaveV107(JSON.stringify(raw.safePoint.base),model);if(!earlier.ok)return fail('safe-'+earlier.reason);if(!earlier.encounter||earlier.encounter.status!=='active'||earlier.base.pose.health<=0)return fail('safe-life');if(earlier.encounter.mode!==prior.encounter?.mode||earlier.encounter.stage>prior.encounter.stage)return fail('safe-sequence');const v=validateDiversionV108(raw.safePoint.diversion,earlier.encounter,model,physicalDoors(model,earlier.base.doors));if(!v.ok)return fail('safe-diversion-'+v.reason);}
 return {...prior,diversion:checked.state,safePoint108:raw.safePoint?structuredClone(raw.safePoint):null};
}
export function storeSafePointV108(e){if(!e.alien3EncounterV105||e.alien3EncounterV105.status!=='active'||e.player.health<=0||e.alien3OperationsV107?.active)return false;const current=makeSaveV108(e);e.alien3SafePointV108={base:current.base,diversion:current.diversion};return true;}
export function safePointFileV108(e){const p=e.alien3SafePointV108;return p?JSON.stringify(envelope({base:p.base,diversion:p.diversion,safePoint:p})):null;}
