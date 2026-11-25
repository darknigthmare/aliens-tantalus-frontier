/** Run the delivered DLC suites in a temporary copy, preserving all historical evidence. */
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { openSync, closeSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { verifyHorsDesOmbresV010 } from './hors-des-ombres-admission-v010.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const output=resolve(root,process.env.ATF_HORS_DES_OMBRES_QA||'../audit/hors-des-ombres');
await mkdir(output,{recursive:true});
await verifyHorsDesOmbresV010(root);
const work=await mkdtemp(join(tmpdir(),'atf-hors-des-ombres-'));
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const report={schemaVersion:1,testedAt:new Date().toISOString(),node:process.version,scope:'Recovered V0.10 engine and installer; host integration is a separate suite.',commands:[],suites:[]};
try {
 await cp(join(root,'archives/dlc-hors-des-ombres-v010/original'),work,{recursive:true});
 const original=await readFile(join(work,'JOUER_HORS_DES_OMBRES.html'));
 for(const script of ['build','check']){
  const logfile=join(output,script+'.log'),fd=openSync(logfile,'w'),started=Date.now();let run;
  try{run=spawnSync('npm',['run',script],{cwd:work,stdio:['ignore',fd,fd]});}finally{closeSync(fd);}
  report.commands.push({command:'npm run '+script,exitCode:run.status,durationMs:Date.now()-started,log:logfile,error:run.error?.message||null});
  if(run.status!==0)throw new Error('DLC '+script+' failed; see '+logfile);
 }
 const rebuilt=await readFile(join(work,'JOUER_HORS_DES_OMBRES.html'));
 report.bundle={sizeBytes:rebuilt.length,sha256:digest(rebuilt),originalSha256:digest(original),identical:rebuilt.equals(original)};
 if(!report.bundle.identical)throw new Error('Rebuilt standalone differs from the preserved delivery.');
 const filenames=['results.json','results-v02.json','delivery-results-v02.json',...['03','04','05','06','07','08','09','010'].map(v=>'results-v'+v+'.json')];
 for(const file of filenames){const s=JSON.parse(await readFile(join(work,'qa',file),'utf8'));report.suites.push({file,suite:s.suite,tests:s.tests,passed:s.passed,failed:s.failed});}
 for(const key of ['tests','passed','failed'])report[key]=report.suites.reduce((sum,s)=>sum+s[key],0);
 if(report.failed||report.tests!==772)throw new Error('Unexpected DLC test total.');
 report.ok=true;
}catch(error){report.ok=false;report.error=error.message;process.exitCode=1;}
finally{await writeFile(join(output,'engine-results.json'),JSON.stringify(report,null,2)+'\n');await rm(work,{recursive:true,force:true});}
console.log(JSON.stringify(report,null,2));
