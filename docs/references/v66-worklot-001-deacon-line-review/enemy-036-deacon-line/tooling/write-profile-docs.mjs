import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';

const profileId = 'enemy-036-deacon-line';
const batchId = 'batch-003';
const root = `assets/openai/sprites/frames/v66/${batchId}/${profileId}`;
const promptDir = `docs/references/v66-worklot-001-prompts/${profileId}`;
const reviewDir = `docs/references/v66-worklot-001-deacon-line-review/${profileId}`;
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
const json = (value) => JSON.stringify(value, null, 2) + '\n';
const fileInfo = async (path) => { const bytes = await readFile(path); return { path, bytes: bytes.length, sha256: sha(bytes) }; };
const queue = JSON.parse(await readFile('docs/references/V66_ENEMY_BATCH_QUEUE.json', 'utf8'));
const job = queue.jobs.find((entry) => entry.profileId === profileId);
if (!job) throw new Error('Profile 036 missing from V66 queue');
await mkdir(promptDir, { recursive: true });
await mkdir(reviewDir, { recursive: true });

const sources = Object.fromEntries(await Promise.all(['idle','move','attack','death'].map(async (clip) => [clip, await fileInfo(`${root}/${clip}.png`)])));
const raw = {
  move: await fileInfo(`${root}/rejected/derived/move-r1-imagegen-raw-before-flatten.png`),
  attack: await fileInfo(`${root}/rejected/derived/attack-r1-imagegen-raw-before-flatten.png`),
  death: await fileInfo(`${root}/rejected/derived/death-r3-imagegen-repair-raw-selected.png`),
};
const flats = {
  move: await fileInfo(`${root}/rejected/derived/move-r1-flat-before-ground-alignment.png`),
  attack: await fileInfo(`${root}/rejected/derived/attack-r1-flat-before-safe-component-recompose.png`),
  death: await fileInfo(`${root}/rejected/derived/death-r3-flat-before-safe-component-recompose.png`),
};
const promptTextSha = Object.fromEntries(job.clips.map((clip) => [clip.id, sha(Buffer.from(clip.prompt, 'utf8'))]));
for (const clip of job.clips.filter((entry) => entry.id !== 'idle')) {
  await writeFile(`${promptDir}/${clip.id}.prompt-integrity.json`, json({
    schema: 1, profileId, clip: clip.id, exactPromptPath: `${promptDir}/${clip.id}.txt`,
    queueDeclaredSha256: clip.promptSha256, recomputedQueueTextSha256: promptTextSha[clip.id],
    matchesQueueDeclaration: clip.promptSha256 === promptTextSha[clip.id],
    discrepancyDisposition: 'Recorded locally only; the global queue is intentionally not modified by this profile-scoped task.'
  }));
}

const receipts = {
  move: {
    referenceCount: 1,
    transforms: [
      { operation: 'flat-magenta cleanup', outputSha256: flats.move.sha256, foregroundPixelsPreserved: 157522 },
      { operation: 'lossless per-cell vertical translation to common support y=428', outputSha256: sources.move.sha256, pixelValuesPreserved: true, scaleChanged: false }
    ],
    rejected: []
  },
  attack: {
    referenceCount: 2,
    transforms: [
      { operation: 'flat-magenta cleanup', outputSha256: flats.attack.sha256, foregroundPixelsPreserved: 162787 },
      { operation: 'safe connected-component ownership reassignment plus translation', outputSha256: sources.attack.sha256, pixelValuesPreserved: true, scaleChanged: false,
        safeReassignmentEvidence: { ownerFrame: 4, globalBounds: [144,506,473,810], pixels: 20234, ownerPixels: 19824, ownerShare: 0.9797370762083621, spillByNominalCell: { '4': 19824, '5': 410 }, rationale: 'The single connected body belongs overwhelmingly to frame 4; 410 fingertip pixels entered nominal cell 5. The complete component was reassigned to frame 4, translated left 33px, and every source foreground pixel and RGBA value was retained exactly once.' } }
    ],
    rejected: [
      { path: `${root}/rejected/derived/attack-r2-imagegen-repair-raw-scale-drift.png`, sha256: '841e25aae76676c9c470ac77cddc7dd0bdab63b2904076bd1c03b514be09a4b5', reason: 'Repair improved gutters but shrank standing anatomy by roughly one quarter, violating cross-clip rigid scale.' },
      { path: `${root}/rejected/derived/attack-r2-flat-scale-drift.png`, sha256: '0c9016d8281e99ed2468a62616f48b631b6a111d18bc8965298aa64a2fd8e1f1', reason: 'Derived flattened form of the scale-drift repair; retained as evidence only.' }
    ]
  },
  death: {
    referenceCount: 3,
    transforms: [
      { operation: 'ImageGen cell/limb repair revision 3 selected after two rejected attempts', outputSha256: raw.death.sha256 },
      { operation: 'flat-magenta cleanup', outputSha256: flats.death.sha256, foregroundPixelsPreserved: 145822 },
      { operation: 'safe connected-component ownership reassignment plus contact alignment', outputSha256: sources.death.sha256, pixelValuesPreserved: true, scaleChanged: false,
        safeReassignmentEvidence: [
          { ownerFrame: 6, pixels: 15271, ownerPixels: 15249, ownerShare: 0.9985593608800996, spillByNominalCell: { '5':22, '6':15249 } },
          { ownerFrame: 7, pixels: 13694, ownerPixels: 13673, ownerShare: 0.9984664816708048, spillByNominalCell: { '6':21, '7':13673 } }
        ] }
    ],
    rejected: [
      { path: `${root}/rejected/derived/death-r1-imagegen-raw-debris-cell-contact.png`, sha256: '08da8597e274d5b495370002355697f67745631b7943f47977f8a63cdbb8f30f', reason: 'Debris and ground smear plus cell contacts.' },
      { path: `${root}/rejected/derived/death-r2-imagegen-repair-raw-cell-contact.png`, sha256: '2c689bf9d0b5b8c56e532e177e569d62fc795ee8536a4addc7880c1828ddb31a', reason: 'Cleaner chronology but residual cell-edge contacts.' }
    ]
  }
};
for (const clip of ['move','attack','death']) {
  const queueClip = job.clips.find((entry) => entry.id === clip);
  await writeFile(`${promptDir}/${clip}.event.json`, json({
    schema: 1, release: 'v66', batchId, profileId, clip, status: 'candidate-not-accepted', accepted: false, runtimeIntegrated: false, normalized: false,
    provider: 'OpenAI ImageGen', providerGenerationIdExposed: false, generationId: `sha256:${raw[clip].sha256}`,
    exactPromptPath: `${promptDir}/${clip}.txt`, queueDeclaredPromptSha256: queueClip.promptSha256, recomputedPromptSha256: promptTextSha[clip],
    referenceTransport: { mode: 'recent-conversation-images', numLastImagesToInclude: receipts[clip].referenceCount, reason: 'Local repository image attachment was blocked by the Windows sandbox ACL helper; the visually reviewed idle and prior clip boards were supplied through the ImageGen conversation image context.' },
    imageGenRaw: raw[clip], selectedMaster: sources[clip], grid: { columns:4, rows:2, frameCount:8, sourceSize:[1774,887], facing:'right', background:'#FF00FF opaque' },
    transforms: receipts[clip].transforms, rejected: receipts[clip].rejected,
    identityReview: 'Visually reviewed: midnight/navy-blue organic Deacon, pronounced bishop-mitre cranium, exactly two arms and two legs, no tail, no dorsal tubes, strict right-facing side profile; no Ultramorph drift.',
    promotionNote: 'Promoted only as a profile-local source candidate after 8/8 extraction, anatomy and physical-contact review. No artistic acceptance, normalization or runtime status is granted.'
  }));
}

const qaFrames = {
  idle: [[177,65,295,429],[131,66,261,429],[159,96,296,429],[139,68,281,429],[161,111,318,429],[120,113,267,429],[148,138,306,429],[149,72,273,429]],
  move: [[142,57,269,429],[86,65,275,429],[82,81,278,429],[66,85,274,429],[136,122,284,429],[75,122,306,429],[127,107,233,429],[97,83,214,429]],
  attack: [[152,74,273,428],[68,103,262,428],[9,147,439,428],[41,135,352,428],[111,124,440,428],[125,129,380,428],[129,106,263,428],[72,84,181,428]],
  death: [[159,75,276,427],[18,102,334,420],[14,176,357,413],[14,229,346,427],[83,290,385,427],[39,320,362,427],[14,351,406,427],[14,366,408,427]]
};
const ratios = { idle:0.898977336422762, move:0.8998931071254714, attack:0.8965471440791388, death:0.9073285805617659 };
const widths = [443,443,444,444];
const heights = [444,443];
const clipQa = {};
for (const clip of ['idle','move','attack','death']) {
  clipQa[clip] = {
    source: sources[clip], size:[1774,887], aspectRatio:2, mode:'RGBA', alphaRange:[255,255], dominantRgb:[255,0,255], strictMagentaRatio:ratios[clip], borderMagentaRatio:1,
    distinctNominalCellHashes:8,
    frames: qaFrames[clip].map((bbox, frame) => { const [x0,y0,x1,y1]=bbox; const row=Math.floor(frame/4), col=frame%4; return { frame, bounds:bbox, marginsLTRB:[x0,y0,widths[col]-x1,heights[row]-y1], supportPixelY:y1-1, nonEmpty:true, reviewed:true }; })
  };
}
await writeFile('docs/references/V66_WORKLOT_001_DEACON_LINE_SOURCE_QA.json', json({
  schema:1, release:'v66', batchId, profileId, reviewedAt:'2026-09-01', reviewer:'Codex /root/produce_arcology_lurker', status:'candidate-not-accepted',
  checks:{ exactTwoToOne:true, exactFourByTwo:true, eightDistinctPosesPerClip:true, strictRightFacing:true, identityStable:true, fullBodyContained:true, opaqueFlatMagenta:true, zeroCellContacts:true, crossClipRigidScaleReviewed:true, physicalRootsReviewed:true },
  clips:clipQa,
  reserves:[ 'Attack frames 2 and 4 intentionally retain only 4px right gutter to preserve the rigid anatomical scale; they are extractable and have no cross-cell pixels.', 'Scale factors remain review fragments only until the official grouped merge and normalization.', 'No runtime or artistic acceptance is implied.' ]
}));

const endpoints = {
  idle:[[[177,65],[281,114]],[[131,66],[249,107]],[[176,96],[285,139]]],
  move:[[[142,57],[254,105]],[[117,66],[220,112]],[[132,81],[226,123]]],
  attack:[[[152,74],[255,118]],[[99,105],[216,145]],[[209,147],[311,190]]],
  death:[[[171,75],[266,111]],[[18,102],[138,119]],[[14,208],[129,184]]]
};
const lengths = { idle:[114.965212,124.919974,117.175083], move:[121.85237,112.805142,102.956301], attack:[112.004464,123.648696,110.69327], death:[101.592323,121.198185,117.477657] };
const scaleFactors = { idle:1, move:1.038739, attack:1.046164, death:0.997424 };
const measurements=[];
for (const clip of ['idle','move','attack','death']) for (let frame=0;frame<3;frame++) measurements.push({ clip, frame, landmark:'posterior mitre apex to anterior fixed cranial crest tip', endpoints:endpoints[clip][frame], lengthPx:lengths[clip][frame], note:'Manual rigid cranium chord; excludes the mobile mandible and soft neck. Endpoints verified on the marked source overlay.' });
await writeFile(`${reviewDir}/scale-review.fragment.json`, json({ schema:1,batchId,coordinates:'nominal-source-cell',profiles:{ [profileId]:{
  status:'reviewed',reviewer:'Codex /root/produce_arcology_lurker',reviewedAt:'2026-09-01',baselineClip:'idle',sourceScaleByClip:scaleFactors,
  sourceSha256ByClip:Object.fromEntries(Object.entries(sources).map(([clip,info])=>[clip,info.sha256])), measurements,
  evidencePaths:['idle','move','attack','death'].map((clip)=>`${reviewDir}/${clip}-scale-overlay.png`),
  note:'Twelve individually marked rigid mitre chords, three distinct poses per clip. Median idle chord 117.175083px is the baseline; factors are idle median divided by each clip median. No per-frame bounding box rescaling and no runtime acceptance.'
}}}));

const roots = {
  idle:[[221,316,431],[194,316,431],[222,318,431],[206,318,431],[206,326,431],[189,324,431],[213,330,431],[205,318,431]],
  move:[[201,321,431],[184,294,431],[184,292,431],[178,293,431],[190,310,431],[182,300,431],[183,325,431],[171,315,431]],
  attack:[[202,318,430],[176,299,430],[144,287,429],[148,286,430],[152,290,430],[170,300,430],[190,321,430],[135,320,430]],
  death:[[204,314,429],[183,285,427],[207,288,427],[183,305,429],[235,361,429],[213,372,429],[225,390,429],[225,397,429]]
};
const anchorClips={};
for (const clip of ['idle','move','attack','death']) anchorClips[clip]={ sourceSha256:sources[clip].sha256,sourceSize:[1774,887],frames:roots[clip].map(([x,y,ay],frame)=>({
  frame,reviewed:true,anchor:[x,ay],landmark:[x,y],confidence:'medium',uncertaintyPx: clip==='death'&&[1,2].includes(frame)?8:6,
  evidence: clip==='death'&&[1,2].includes(frame) ? `Death pose ${frame+1} source and regenerated marked overlay inspected: pelvis (${x},${y}) projects to the adjacent grounded contact plane y=427, below airborne sourceBounds[3]=${frame===1?421:415} and preserving the visible fall gap.` : `${clip[0].toUpperCase()+clip.slice(1)} pose ${frame+1} source and regenerated marked overlay inspected: pelvis (${x},${y}) projects to complete extracted support/contact guard y=${ay}; runtime audit confirms sourceBounds[3]-anchorY=0.`
}))};
await writeFile(`${reviewDir}/anchor-review.fragment.json`, json({ schema:1,batchId,coordinates:'nominal-source-cell',profiles:{ [profileId]:{
  status:'reviewed',reviewer:'Codex /root/produce_arcology_lurker',reviewedAt:'2026-09-01',reviewedPoseCount:32,
  method:'Manual per-pose pelvis-center landmark at the proximal leg junction, vertically projected to the complete extracted support/contact guard required by runtime pivot y=240. Idle/move grounded anchors use y=431; attack uses y=430 except frame 2 at y=429; grounded/contact death uses y=429. Airborne death frames 1-2 intentionally remain on the adjacent y=427 ground plane to preserve fall height. Every non-airborne anchor is therefore >= sourceBounds[3]. Whole-body extrema and the cranial mitre are never used as roots.',
  visualReview:'All 32 source poses and four regenerated marked overlays inspected after the runtime pivot guard audit. Exactly two legs, pelvis placement, planted/contact support, complete extraction guard and inferred airborne ground plane were reviewed. All 30 non-airborne poses satisfy anchorY >= sourceBounds[3]; death frames 1-2 retain y=427 and remain below their source bounds at 421/415. Physical registration only; no artistic acceptance, scale merge, normalization or runtime integration.',
  evidencePaths:['idle','move','attack','death'].map((clip)=>`${reviewDir}/${clip}-anchor-overlay.png`), clips:anchorClips
}}}));

const derivedDir = `${root}/rejected/derived`;
const derivedNames = (await readdir(derivedDir)).sort();
const derivedFiles = await Promise.all(derivedNames.map(async (name)=>fileInfo(`${derivedDir}/${name}`)));
await writeFile(`${derivedDir}/MANIFEST.json`, json({ schema:1,profileId,scope:'Rejected or derived evidence only; never runtime sources.',files:derivedFiles }));

await writeFile(`${promptDir}/FULL_PRODUCTION_REVIEW.md`, `# V66 Deacon Line full production review\n\nFour profile-local source candidates exist: idle, move, attack and death. All are 1774x887 RGBA boards with a 4x2 grid, eight distinct chronological poses, strict right-facing profile and opaque #FF00FF matte. Identity is stable: midnight/navy organic skin, pronounced bishop-mitre cranium, two arms, two legs, no tail, no dorsal tubes and no Ultramorph drift.\n\nMove uses a lossless ground-line alignment. Attack preserves the original rigid body scale; a smaller repair was rejected. The selected attack keeps 4px right gutters at full extension and uses documented component ownership for 410 fingertip pixels originally crossing into the next nominal cell. Death uses the third clean cell-repair candidate, followed by lossless component ownership and contact alignment. Every retained foreground pixel and RGBA value is written exactly once; no scale is applied in these source masters.\n\nThe local scale fragment contains 12 manual mitre-chord measurements and derives idle-baseline factors: idle 1.000000, move 1.038739, attack 1.046164, death 0.997424. The local anchor fragment contains 32 manually reviewed pelvis-to-support/contact roots and four overlays. These fragments are prepared for official grouped merge only.\n\nStatus: candidate-not-accepted. No global queue/state/reference file, atlas, normalizer, runtime, test or Git state was modified; no normalization or runtime integration was performed.\n`);
await writeFile(`${reviewDir}/SCALE_AND_ROOT_REVIEW.md`, `# Enemy 036 scale and physical-root review\n\nRigid landmark: posterior mitre apex to anterior fixed cranial crest tip, excluding mobile mandible and neck. Three distinct poses were marked per clip (12 total). Median lengths: idle 117.175083px, move 112.805142px, attack 112.004464px, death 117.477657px. Idle-baseline scale factors are 1.000000, 1.038739, 1.046164 and 0.997424 respectively.\n\nAll 32 pelvis landmarks were visually projected to complete extracted support/contact guards after the runtime pivot y=240 audit. Idle and move use y=431. Attack uses y=430 except frame 2 at y=429. Grounded/contact death uses y=429. Death frames 1-2 are airborne and deliberately retain the adjacent y=427 ground plane, below their source bounds at 421/415, so fall height is preserved. All 30 non-airborne records now satisfy sourceBounds[3]-anchorY=0.\n\nEight overlays are retained beside the two merge-compatible fragments. This review certifies physical registration evidence only, not artistic acceptance or runtime readiness.\n`);

console.log(json({ sources, scaleFactors, measurements:measurements.length, roots:Object.values(roots).reduce((n,v)=>n+v.length,0), derivedEvidence:derivedFiles.length }));
