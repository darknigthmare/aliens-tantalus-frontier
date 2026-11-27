#!/usr/bin/env node
/**
 * Render the repository's canonical bible table payload with ArtifactTool.
 * First run build-covenant-bible-v017.py --tables-out <tables.json> in a clone.
 * Copy this builder to a writable OS temporary directory containing a
 * node_modules symlink to CODEX_PRIMARY_RUNTIME_NODE_MODULES. Execute it with
 * CODEX_PRIMARY_RUNTIME_NODE: builder.mjs <tables.json> <output-directory>.
 * On memory-limited hosts, run --export-only then --render-only in separate
 * processes. Both stages use ArtifactTool and the same exported workbook.
 * The builder reads no private research inputs and changes no source PNGs.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { FileBlob, Workbook, SpreadsheetFile } from '@oai/artifact-tool';

const [inputArg, outputArg, modeArg, sheetFilterArg] = process.argv.slice(2);
if (!inputArg || !outputArg) throw new Error('Usage: builder.mjs <tables.json> <output-directory>');
if (modeArg && !['--export-only','--render-only'].includes(modeArg)) throw new Error('Unknown mode: '+modeArg);
if (sheetFilterArg && (modeArg!=='--render-only' || !sheetFilterArg.startsWith('--sheet='))) throw new Error('A sheet filter requires --render-only --sheet=<name>');
const sheetFilter=sheetFilterArg?.slice('--sheet='.length);
const inputPath = path.resolve(inputArg);
const outputDir = path.resolve(outputArg);
const sourceBytes = await fs.readFile(inputPath);
const data = JSON.parse(sourceBytes.toString('utf8'));
if (data.tables.length !== 15) throw new Error('Expected the 15 complete bible tables');
if (sheetFilter && !['Synthèse',...data.tables.map(t=>t.name)].includes(sheetFilter)) throw new Error('Unknown render sheet: '+sheetFilter);
await fs.mkdir(outputDir, { recursive: true });
const previewDir = path.join(outputDir, 'xlsx-previews');
await fs.mkdir(previewDir, { recursive: true });
const outputPath=path.join(outputDir,'BIBLE_COVENANT_V017.xlsx');
if (modeArg==='--render-only') {
  const receipt=JSON.parse(await fs.readFile(path.join(outputDir,'xlsx-receipt.json'),'utf8'));
  const inputSha=crypto.createHash('sha256').update(sourceBytes).digest('hex');
  const outputSha=crypto.createHash('sha256').update(await fs.readFile(outputPath)).digest('hex');
  if(receipt.inputSha256!==inputSha||receipt.sha256!==outputSha) throw new Error('Render inputs differ from the exported workbook receipt');
  const imported=await SpreadsheetFile.importXlsx(await FileBlob.load(outputPath));
  receipt.renders=await renderWorkbook(imported);
  receipt.renderSource='Reimport of final exported XLSX with @oai/artifact-tool';
  await fs.writeFile(path.join(outputDir,'xlsx-receipt.json'),JSON.stringify(receipt,null,2)+'\n');
  console.log(JSON.stringify({outputPath,renders:receipt.renders.length,sha256:outputSha}));
  process.exit(0);
}

const palette = { ink:'#22343F', dim:'#5C6E78', header:'#283F4A', line:'#CFD9DE', pale:'#F0F4F6', white:'#FFFFFF', gold:'#9B7B40' };
const font = 'Arial';
const workbook = Workbook.create();
const summary = workbook.worksheets.add('Synthèse');
const sheets = new Map();
for (const t of data.tables) sheets.set(t.name, workbook.worksheets.add(t.name));

function colName(n) {
  let s=''; for (let i=n+1;i>0;i=Math.floor((i-1)/26)) s=String.fromCharCode(65+(i-1)%26)+s;
  return s;
}
function safeName(s) { return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9]+/g,'-').replace(/^-|-$/g,'').toLowerCase(); }
function plainCell(v, sources=false) {
  if (v === undefined || v === null) return '';
  if (typeof v === 'number' || typeof v === 'boolean') return v;
  let s=String(v);
  // Preserve every word while using natural paragraphs instead of object dumps.
  if (!sources) s=s.replace(/\s*\n\s*/g,' ');
  if (s.length>32767) throw new Error('Excel cell limit exceeded; preserve the text through a structural split before export');
  return s.startsWith('=') ? "'"+s : s;
}
function baseFormat(sheet, address) {
  sheet.showGridLines=false;
  sheet.getRange(address).format = { font:{name:font,size:10,color:palette.ink}, verticalAlignment:'center', fill:palette.white };
}
function header(sheet, address) {
  sheet.getRange(address).format = { fill:palette.header, font:{name:font,size:10,bold:true,color:palette.white},
    horizontalAlignment:'center',verticalAlignment:'center',wrapText:true,
    borders:{bottom:{style:'thin',color:palette.line},insideVertical:{style:'thin',color:palette.white}},rowHeight:30 };
}

const descriptors = {
  Personnages:`${data.summary.sourceCharacterEntries} références de personnages et une variante EVA d’Ankor. Identités et costumes restent distincts.`,
  Profils:`${data.summary.characterProfiles} profils d’apparence pour ${data.summary.humanIdentitiesInProfiles} personnages nommés. Le portrait de Shaw reste un ajout de catalogue.`,
  Lieux:'56 fiches de campagne et un tableau autonome. Les plans et mesures sont ceux de l’adaptation.',
  Armes:'Familles visuelles et usages du jeu. Aucune caractéristique réelle déduite des paramètres de gameplay.',
  Props:`${data.summary.propFamilies} familles, ${data.summary.supplementalObjectCandidates} pistes d’objets et ${data.summary.documentaryObjectRecordsV015} dossiers V015. Ces vues ne s’additionnent pas en entités canoniques.`,
  Véhicules:'Lander, cargo lifter et rover. Leurs périmètres cinéma et promotion sont séparés.',
  Vaisseaux:'Comprend les groupes non résolus et une revendication de navette restant à vérifier.',
  Composants:'Voiles, cabine, espace d’amarrage et matériel de terraformation. Ce ne sont pas quatre vaisseaux.',
  Terrains:'Surfaces, biomes et extensions adaptées. Chaque famille conserve son périmètre de preuve.',
  Planètes:'Planet 4 visitée, Origae-6 destination non visitée, Terre comme contexte d’archive.',
  Biologie:'49 références de stades, effets, anatomie, objets et bonus. Ce ne sont pas 49 espèces ou PNG.',
  Références:'315 identifiants uniques. Les descriptions héritées sont distinguées des corrections documentées.',
  Seuils:'134 sorties orientées, pour 67 liaisons. Coordonnées en unités de jeu, sans géométrie filmique certifiée.',
  Occurrences:'630 instances de décor. La présence d’un PNG ne supprime pas les conditions du rendu natif.',
  Production:`${data.summary.pngs} PNG cumulés. Dimensions, taille et SHA256 relus depuis les fichiers originaux.`
};

const sheetReceipts=[];
let maximumCellLength=0;
for (let ti=0;ti<data.tables.length;ti++) {
  const table=data.tables[ti], sheet=sheets.get(table.name);
  const n=table.headers.length, end=table.rows.length+5, last=colName(n-1);
  const matrix=table.rows.map(row=>row.map((v,i)=>plainCell(v,table.headers[i]==='Sources')));
  if (matrix.some(row=>row.length!==n)) throw new Error('Ragged table: '+table.name);
  for (const row of matrix) for (const value of row) if (typeof value==='string') maximumCellLength=Math.max(maximumCellLength,value.length);
  baseFormat(sheet,`A1:${last}${end}`);
  sheet.getRange('A2').values=[[table.name]];
  sheet.getRange('A2').format.font={name:font,size:14,color:palette.ink};
  sheet.getRange('A3').values=[[descriptors[table.name]||'']];
  sheet.getRange('A3').format.font={name:font,size:10,italic:true,color:palette.dim};
  sheet.getRange(`A4:${last}4`).format.borders={bottom:{style:'thin',color:palette.line}};
  sheet.getRange(`A5:${last}5`).values=[table.headers];
  sheet.getRange(`A6:${last}${end}`).values=matrix;
  const nativeTable=sheet.tables.add(`A5:${last}${end}`,true,'Covenant_'+safeName(table.name).replaceAll('-','_'));
  nativeTable.style='TableStyleLight8';
  nativeTable.showFilterButton=true;
  header(sheet,`A5:${last}5`);
  const standard=[27,43,34,61,64,94,94,64,94,72,92];
  const widths=table.name==='Production'?[35,22,28,75,18,18,22,74,48,92,20]:
    table.name==='Seuils'?[38,24,24,52,23,25,22,20,20,88,88]:
    table.name==='Occurrences'?[35,28,26,19,19,23,23,18,38,34,94]:standard;
  // Increase only dense text columns; never trim text or exceed Excel row limits.
  if (!['Production','Seuils','Occurrences'].includes(table.name)) {
    for (const j of [3,4,5,6,8,9,10]) {
      const longest=Math.max(...matrix.map(row=>String(row[j]??'').length));
      widths[j]=Math.min(160,Math.max(widths[j],Math.ceil(longest/31)+4));
    }
  }
  for (let j=0;j<n;j++) {
    const c=colName(j);
    sheet.getRange(`${c}1:${c}${end}`).format.columnWidth=widths[j];
  }
  sheet.getRange(`A6:${last}${end}`).format.wrapText=true;
  sheet.getRange(`A6:${last}${end}`).format.verticalAlignment='top';
  for (let i=0;i<matrix.length;i++) {
    let lines=1;
    for (let j=0;j<n;j++) {
      const value=String(matrix[i][j]);
      const needed=value.split('\n').reduce((count,line)=>count+Math.max(1,Math.ceil(line.length/(widths[j]-4))),0);
      lines=Math.max(lines,needed);
    }
    const row=i+6;
    const height=Math.max(34,lines*12+10);
    if (height>409) throw new Error('Row exceeds Excel visible height, adjust widths without losing text: '+table.name+' '+row+' ('+height+')');
    sheet.getRange(`A${row}:${last}${row}`).format.rowHeight=height;
    if (i%2===1) sheet.getRange(`A${row}:${last}${row}`).format.fill=palette.pale;
  }
  if (table.name==='Production') {
    sheet.getRange(`E6:G${end}`).setNumberFormat('#,##0');
    sheet.getRange(`E6:G${end}`).format.horizontalAlignment='right';
  }
  if (table.name==='Occurrences') {
    sheet.getRange(`D6:G${end}`).setNumberFormat('0.##');
    sheet.getRange(`D6:G${end}`).format.horizontalAlignment='right';
  }
  if (table.name==='Seuils') {
    sheet.getRange(`H6:I${end}`).setNumberFormat('0.##');
    sheet.getRange(`H6:I${end}`).format.horizontalAlignment='right';
  }
  sheet.freezePanes.freezeRows(5);
  sheet.freezePanes.freezeColumns(2);
  sheetReceipts.push({name:table.name,rows:matrix.length,columns:n,tableRange:`A5:${last}${end}`,freezeRows:5,freezeColumns:2});
}

baseFormat(summary,'A1:C35');
summary.tabColor=palette.header;
summary.getRange('A1:A35').format.columnWidth=52;
summary.getRange('B1:B35').format.columnWidth=24;
summary.getRange('C1:C35').format.columnWidth=92;
summary.getRange('A2').values=[['Alien: Covenant']];
summary.getRange('A2').format.font={name:font,size:14,color:palette.ink};
summary.getRange('A3').values=[['Bible du jeu V0.17 — 26 novembre 2026']];
summary.getRange('A3').format.font={name:font,size:10,italic:true,color:palette.dim};
summary.getRange('A4:C4').format.borders={bottom:{style:'thin',color:palette.line}};
summary.getRange('A5:C5').values=[['Indicateur','Nombre','Portée']];
header(summary,'A5:C5');
function rangeFor(name,column='A') {const t=data.tables.find(t=>t.name===name);return "'"+name.replaceAll("'","''")+"'!$"+column+'$6:$'+column+'$'+(t.rows.length+5);}
const metrics=[
  ['Références du registre',`=COUNTA(${rangeFor('Références')})`,'Identifiants ACOV uniques. Les vues thématiques ne s’additionnent pas.'],
  ['PNG cumulés',`=COUNTA(${rangeFor('Production')})`,'Images des versions présentes dans le registre, jusqu’à V017.'],
  ['Nouveaux PNG V017',`=COUNTIFS(${rangeFor('Production','K')},"v017")`,'Images du lot V017, filtrables dans la table Production.'],
  ['PNG admis dans le rendu',`=COUNTA(${rangeFor('Production')})-COUNTIFS(${rangeFor('Production','C')},"catalogue-only")`,'Admission de source soumise aux états, salles et acteurs définis.'],
  ['PNG de catalogue',`=COUNTIFS(${rangeFor('Production','C')},"catalogue-only")`,'Images consultables sans consommateur de jeu autorisé.'],
  ['Fiches spatiales',`=COUNTA(${rangeFor('Lieux')})`,'56 fiches de campagne et un tableau blanc autonome. 55 clés de site distinctes.'],
  ['Références biologiques',`=COUNTA(${rangeFor('Biologie')})`,'Stades, effets, formes, contenants et bonus restent distincts.'],
  ['Occurrences de props',`=COUNTA(${rangeFor('Occurrences')})`,'Chaque occurrence conserve son identifiant et ses conditions.'],
  ['Familles de props',data.summary.propFamilies,`Référentiel des familles. La vue Props ajoute ${data.summary.supplementalObjectCandidates} pistes documentaires d’objets.`],
  ['Profils d’apparence',`=COUNTA(${rangeFor('Profils')})`,'23 profils couvrent les tenues et états de 17 personnages nommés.'],
  ['Identités nommées dans les profils',data.summary.humanIdentitiesInProfiles,'Le libellé Walter / David ne constitue pas une identité supplémentaire.'],
  ['Identités avec le portrait de Shaw',data.summary.namedIdentitiesIncludingSeparateShawPortrait,'Shaw est au catalogue du bonus The Crossing, hors des 23 profils de jeu.'],
  ['Cycles admis dans le rendu',data.summary.playerWalkCycles+data.summary.npcWalkCycles,`${data.summary.playerWalkCycles} cycles joueur et ${data.summary.npcWalkCycles} cycles PNJ, soit ${data.summary.animationPhases} phases. Autres poses et cycles restent à couvrir.`],
  ['Cycles complets publiés',data.summary.publishedWalkCycles,`${data.summary.publishedAnimationPhases} phases publiées. Les ensembles de catalogue ne sont pas jouables par leur seule présence.`],
  ['Cycles publiés hors runtime',data.summary.availableUnintegratedNpcCycles,`${data.summary.availableUnintegratedNpcPhases} phases attendent leur revue d’animation et d’admission. Ricks et Oram restent au catalogue.`],
  ['PNG d’animation publiés',data.summary.animationImagesIncludingIncomplete,`${data.summary.publishedAnimationPhases} phases de cycles complets et ${data.summary.incompleteCharacterSequencePngs} poses de séquences incomplètes.`],
  ['Images certifiées identiques à 1:1',0,'Les images sont des reconstructions documentées. Aucune certification pixel par pixel.']
];
for(let i=0;i<metrics.length;i++) {
  const r=i+6,[label,value,meaning]=metrics[i];
  summary.getRange(`A${r}`).values=[[label]];
  if(typeof value==='string'&&value.startsWith('=')) summary.getRange(`B${r}`).formulas=[[value]];
  else summary.getRange(`B${r}`).values=[[value]];
  summary.getRange(`C${r}`).values=[[meaning]];
  summary.getRange(`A${r}:C${r}`).format.rowHeight=34;
  summary.getRange(`C${r}`).format.wrapText=true;
  if(i%2===1) summary.getRange(`A${r}:C${r}`).format.fill=palette.pale;
}
summary.getRange('B6:B22').setNumberFormat('#,##0');
summary.getRange('B6:B22').format.horizontalAlignment='right';
summary.getRange('A25').values=[['Lecture des fiches']];
summary.getRange('A25').format.font={name:font,size:12,bold:true,color:palette.ink};
summary.getRange('A26:C30').values=[
  ['Géographie','67 liaisons / 134 seuils','Le réseau de l’adaptation est conservé. Les coordonnées de jeu ne sont pas des cotes de décor de film.'],
  ['Transport','12 fiches au total','Vaisseaux, véhicules, composants, groupe non résolu et espace d’amarrage sont distingués.'],
  ['Planet 4 / Origae-6','Visite / destination','Planet 4 porte les lieux visités. Aucun sol visitable d’Origae-6 n’est inventé.'],
  ['Sources','Dans chaque fiche','Sources filmiques, bonus, production et données du jeu sont qualifiés. Les assertions héritées restent à recouper.'],
  ['Consultation','15 tables détaillées','Les filtres et les volets figés permettent de suivre un identifiant. Le texte complet reste dans chaque cellule.']
];
summary.getRange('A26:C30').format.wrapText=true;
summary.getRange('A26:C30').format.rowHeight=42;

workbook.recalculate();
const checks={
  summary:await workbook.inspect({kind:'table',range:'Synthèse!A5:C22',include:'values,formulas',tableMaxRows:19,tableMaxCols:3,maxChars:10000}),
  errors:await workbook.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:300},summary:'final formula error scan',maxChars:5000})
};
const expected=[data.summary.referenceEntries,data.summary.pngs,data.summary.newPngs,data.summary.runtimePngs,data.summary.catalogueOnlyPngs,data.summary.spatialRecords,data.summary.biologyReferenceEntries,data.summary.propInstances,data.summary.propFamilies,data.summary.characterProfiles,data.summary.humanIdentitiesInProfiles,data.summary.namedIdentitiesIncludingSeparateShawPortrait,data.summary.playerWalkCycles+data.summary.npcWalkCycles,data.summary.publishedWalkCycles,data.summary.availableUnintegratedNpcCycles,data.summary.animationImagesIncludingIncomplete,0];
const actual=summary.getRange('B6:B22').values.map(row=>row[0]);
if(JSON.stringify(actual)!==JSON.stringify(expected)) throw new Error('Summary recalculation mismatch: '+JSON.stringify(actual));
await fs.writeFile(path.join(outputDir,'xlsx-inspection.json'),JSON.stringify({summary:checks.summary.ndjson,errors:checks.errors.ndjson,expected,actual},null,2));

async function renderWorkbook(book) {
const renders=[];
for(const name of ['Synthèse',...data.tables.map(t=>t.name)]) {
  if(sheetFilter && name!==sheetFilter) continue;
  const range=name==='Synthèse'?'A1:C30':'A1:D7';
  const preview=await book.render({sheetName:name,range,scale:1,format:'png'});
  const filename=safeName(name)+'.png';
  await fs.writeFile(path.join(previewDir,filename),new Uint8Array(await preview.arrayBuffer()));
  renders.push({sheet:name,file:'xlsx-previews/'+filename,range});
  console.log('Rendered '+name);
}
// Review dense content separately at readable width, preserving the same sheet.
for(const name of ['Biologie','Références']) {
  if(sheetFilter && name!==sheetFilter) continue;
  const preview=await book.render({sheetName:name,range:'F5:G7',scale:1,format:'png'});
  const filename=safeName(name)+'-details.png';
  await fs.writeFile(path.join(previewDir,filename),new Uint8Array(await preview.arrayBuffer()));
  renders.push({sheet:name,file:'xlsx-previews/'+filename,range:'F5:G7'});
}


// Review the V017 contracts and final candidate rows at readable width.
for(const [name,range] of [
  ['Lieux','I5:K7'],['Terrains','I5:K7'],['Profils','F5:J7'],
  ['Personnages','A'+(data.tables.find(t=>t.name==='Personnages').rows.length+5)+':E'+(data.tables.find(t=>t.name==='Personnages').rows.length+5)],
  ['Props','A'+(data.tables.find(t=>t.name==='Props').rows.length+4)+':E'+(data.tables.find(t=>t.name==='Props').rows.length+5)]
]) {
  if(sheetFilter && name!==sheetFilter) continue;
  const preview=await book.render({sheetName:name,range,scale:1,format:'png'});
  const filename=safeName(name)+'-continuation.png';
  await fs.writeFile(path.join(previewDir,filename),new Uint8Array(await preview.arrayBuffer()));
  renders.push({sheet:name,file:'xlsx-previews/'+filename,range});
}
// Inspect the changed availability/admission fields without rendering whole long tables.
for(const [name,id,startColumn,endColumn,suffix='current-state'] of [
  ['Profils','upworth','F','G'], ['Profils','ricks','F','G'], ['Profils','oram','F','G'],
  ['Props','cand-juggernaut-bay-iris','F','G'], ['Occurrences','landing-light2','H','K'],
  ...['walter','david','ricks','oram','upworth'].map(id=>['Profils',id,'H','J','current-contract'])
]) {
  if(sheetFilter && name!==sheetFilter) continue;
  const table=data.tables.find(t=>t.name===name);
  const index=table.rows.findIndex(row=>row[0]===id);
  if(index<0) throw new Error('Missing targeted review row: '+name+'/'+id);
  const row=index+6, range=`${startColumn}${row}:${endColumn}${row}`;
  const preview=await book.render({sheetName:name,range,scale:1,format:'png'});
  const filename=safeName(name+'-'+id)+'-'+suffix+'.png';
  await fs.writeFile(path.join(previewDir,filename),new Uint8Array(await preview.arrayBuffer()));
  renders.push({sheet:name,recordId:id,file:'xlsx-previews/'+filename,range});
}
return renders;
}

const file=await SpreadsheetFile.exportXlsx(workbook);
await file.save(outputPath);
const bytes=await fs.readFile(outputPath);
const renders=modeArg==='--export-only'?[]:await renderWorkbook(workbook);
const receipt={inputSha256:crypto.createHash('sha256').update(sourceBytes).digest('hex'),
  outputFilename:'BIBLE_COVENANT_V017.xlsx',bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),
  authoringEngine:'@oai/artifact-tool',sheets:16,tableCount:15,maximumCellLength,
  sourceTextPreserved:true,recalculated:true,summaryValues:actual,expectedSummaryValues:expected,
  sheetReceipts,renders,visualReview:'pending-human-inspection-of-rendered-sheets'};
await fs.writeFile(path.join(outputDir,'xlsx-receipt.json'),JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify({outputPath,bytes:bytes.length,sha256:receipt.sha256,sheets:16,tables:15,maximumCellLength,summaryValues:actual}));
