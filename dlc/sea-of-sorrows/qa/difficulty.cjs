'use strict';
// Exploratory balance evidence. A simulated death is not a JavaScript exception
// or a claim that a difficulty is impossible for a human using other tactics.
const {traverse}=require('./traverse.cjs'),fs=require('node:fs'),path=require('node:path');
const outcomes=[];
for(const presentation of ['HYBRID','CLASSIC'])for(const difficulty of ['exploration','survival','oppression']){
 try{const r=traverse(presentation,false,difficulty);outcomes.push({...r,saves:undefined,outcome:'finished'});}
 catch(e){outcomes.push({presentation,difficulty,outcome:'stopped',finished:false,reason:e.message});}
}
const source_sha256=Object.fromEntries(['src/core.js','src/data.js','qa/traverse.cjs'].map(f=>[f,require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(__dirname,'..',f))).digest('hex')]));
fs.writeFileSync(path.join(__dirname,'../reports/difficulty-traversals.json'),JSON.stringify({version:require('../data/campaign.json').meta.version,source_sha256,scope:'Scripted engine navigation; not a human balance verdict. Deaths kept, not hidden.',outcomes},null,2));
console.log(outcomes.map(r=>`${r.presentation} / ${r.difficulty}: ${r.outcome}${r.reason?' — '+r.reason:''}`).join('\n'));
