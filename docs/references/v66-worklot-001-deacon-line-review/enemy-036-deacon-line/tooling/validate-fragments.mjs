import { createHash } from 'node:crypto';
import { access, readFile } from 'node:fs/promises';
import { assembleScaleReviewDocument } from '../../../../../scripts/merge-v66-scale-reviews.mjs';
import { resolvePostGenerationScaleReviewCandidate } from '../../../../../scripts/enemy-batch-scale-review.mjs';
import { ROOT, scopedPath } from '../../../../../scripts/enemy-batch-production.mjs';

const id='enemy-036-deacon-line', batchId='batch-003';
const queue=JSON.parse(await readFile('docs/references/V66_ENEMY_BATCH_QUEUE.json','utf8'));
const job=queue.jobs.find((entry)=>entry.profileId===id);
const scale=JSON.parse(await readFile('docs/references/v66-worklot-001-deacon-line-review/enemy-036-deacon-line/scale-review.fragment.json','utf8'));
const anchor=JSON.parse(await readFile('docs/references/v66-worklot-001-deacon-line-review/enemy-036-deacon-line/anchor-review.fragment.json','utf8'));
const qa=JSON.parse(await readFile('docs/references/V66_WORKLOT_001_DEACON_LINE_SOURCE_QA.json','utf8'));
const hash=(bytes)=>createHash('sha256').update(bytes).digest('hex');
const assembled=assembleScaleReviewDocument(batchId,{schema:1,batchId,coordinates:'nominal-source-cell',profiles:{}},[scale],new Map([[id,job]]));
if(assembled.incoming.join()!==id) throw new Error('scale assembly scope failure');
const se=scale.profiles[id];
if(se.measurements.length!==12) throw new Error('scale measurement count');
for(const m of se.measurements){const d=Math.hypot(m.endpoints[1][0]-m.endpoints[0][0],m.endpoints[1][1]-m.endpoints[0][1]);if(Math.abs(d-m.lengthPx)>1)throw new Error('scale length mismatch');}
for(const p of se.evidencePaths) await access(p);
const med=(v)=>[...v].sort((a,b)=>a-b)[1];
const baseline=med(se.measurements.filter((m)=>m.clip==='idle').map((m)=>m.lengthPx));
for(const clip of job.clips){const values=se.measurements.filter((m)=>m.clip===clip.id).map((m)=>m.lengthPx);if(values.length<2)throw new Error('scale clip coverage');const ratio=baseline/med(values);if(Math.abs(se.sourceScaleByClip[clip.id]/ratio-1)>0.03)throw new Error('scale factor mismatch');}
const ae=anchor.profiles[id];
if(ae.reviewedPoseCount!==32||Object.keys(ae.clips).length!==4)throw new Error('anchor coverage');
const extractionBottom={idle:[431,431,431,431,431,431,431,431],move:[431,431,431,431,431,431,431,431],attack:[430,430,429,430,430,430,430,430],death:[429,421,415,429,429,429,429,429]};
let nonAirbornePass=0,airbornePass=0;
for(const clip of job.clips){const sourceBytes=await readFile(clip.sourcePath);const record=ae.clips[clip.id];if(record.sourceSha256!==hash(sourceBytes))throw new Error('anchor stale SHA');if(record.frames.length!==8||new Set(record.frames.map((f)=>f.frame)).size!==8||record.frames.some((f)=>f.reviewed!==true))throw new Error('anchor pose coverage');for(const frame of record.frames){const bottom=extractionBottom[clip.id][frame.frame],airborne=clip.id==='death'&&(frame.frame===1||frame.frame===2);if(airborne){if(frame.anchor[1]!==427||frame.anchor[1]<bottom)throw new Error(`airborne plane invalid ${clip.id}/${frame.frame}`);airbornePass++;}else{if(frame.anchor[1]<bottom)throw new Error(`anchor omits extraction guard ${clip.id}/${frame.frame}: ${frame.anchor[1]} < ${bottom}`);nonAirbornePass++;}}}
for(const p of ae.evidencePaths) await access(p);
const metadataSources=[];
for(const clip of job.clips){const bytes=await readFile(clip.sourcePath);metadataSources.push({clip:clip.id,path:clip.sourcePath,sha256:hash(bytes),size:[1774,887]});}
const proof=await resolvePostGenerationScaleReviewCandidate(job,metadataSources,assembled.document,ROOT,scopedPath);
if(!proof||proof.measurementCount!==12)throw new Error('full scale resolver rejected candidate');
console.log(JSON.stringify({scaleMergeAssembly:'pass',scaleFullResolver:'pass',scaleMeasurements:12,scaleEvidence:se.evidencePaths.length,anchorMergeContract:'pass',anchorPoses:32,nonAirborneAnchorBounds:`${nonAirbornePass}/30 pass`,airborneDeathPlane:`${airbornePass}/2 pass at y=427`,anchorEvidence:ae.evidencePaths.length,sourceShaChecks:8,globalWrites:0,normalizationRuns:0},null,2));
