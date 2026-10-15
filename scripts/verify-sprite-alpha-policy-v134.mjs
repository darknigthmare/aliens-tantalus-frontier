import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import { SPRITE_ALPHA_POLICY_V134, SPRITE_ALPHA_ASSETS_V134,
  repairSpriteAlphaPixelsV134, resolveSpriteDrawableV134 } from '../src/sprite-alpha-policy-v134.js';
import { HUMAN_ATLAS_METRICS_V133 } from '../src/human-visual-contract-v133.js';

function decodePng(path) {
  const bytes = readFileSync(new URL(`..${path}`, import.meta.url));
  assert.deepEqual(bytes.subarray(0, 8), Buffer.from([137,80,78,71,13,10,26,10]));
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
  assert.equal(bytes[24], 8); assert.equal(bytes[25], 6); assert.equal(bytes[28], 0);
  const chunks = [];
  for (let at = 8; at < bytes.length;) {
    const size = bytes.readUInt32BE(at);
    assert.ok(at + size + 12 <= bytes.length);
    if (bytes.subarray(at + 4, at + 8).toString() === 'IDAT') chunks.push(bytes.subarray(at + 8, at + 8 + size));
    at += size + 12;
  }
  const packed = inflateSync(Buffer.concat(chunks)), stride = width * 4, data = Buffer.alloc(stride * height);
  assert.equal(packed.length, (stride + 1) * height);
  const paeth = (a,b,c) => { const p=a+b-c,da=Math.abs(p-a),db=Math.abs(p-b),dc=Math.abs(p-c); return da<=db&&da<=dc?a:db<=dc?b:c; };
  for (let y = 0; y < height; y++) {
    const row = y * stride, source = y * (stride + 1), filter = packed[source]; assert.ok(filter <= 4);
    for (let x = 0; x < stride; x++) {
      const left=x>=4?data[row+x-4]:0,up=y?data[row+x-stride]:0,ul=y&&x>=4?data[row+x-stride-4]:0;
      const prediction=filter===0?0:filter===1?left:filter===2?up:filter===3?Math.floor((left+up)/2):paeth(left,up,ul);
      data[row+x]=(packed[source+x+1]+prediction)&255;
    }
  }
  return { data, width, height };
}
function fixture(width = 12, height = 12) {
  const data = new Uint8ClampedArray(width * height * 4);
  const set = (x,y,color) => data.set(color,(y*width+x)*4);
  for (let y=3;y<=8;y++) for(let x=3;x<=8;x++) set(x,y,[48,64,72,255]);
  return { data,width,height,set };
}
const policy = SPRITE_ALPHA_ASSETS_V134[0];

test('white and purple matte RGB is repaired only on the thin translucent exterior, with exact alpha', () => {
  const image=fixture(); image.set(2,5,[255,255,255,96]); image.set(2,6,[255,0,255,16]);
  const before=new Uint8ClampedArray(image.data),result=repairSpriteAlphaPixelsV134(image,policy);
  assert.equal(result.whitePixels,1);assert.equal(result.purplePixels,1);assert.equal(result.maxDistance,1);
  assert.deepEqual([...result.data.subarray((5*12+2)*4,(5*12+2)*4+4)],[48,64,72,96]);
  assert.deepEqual([...result.data.subarray((6*12+2)*4,(6*12+2)*4+4)],[48,64,72,16]);
  for(let at=3;at<before.length;at+=4)assert.equal(result.data[at],before[at]);
  assert.deepEqual(image.data,before,'The source is never modified.');
});

test('opaque white shirts, lamps, transparent RGB residue and interior colors are retained byte for byte', () => {
  const image=fixture();image.set(3,5,[255,255,255,255]);image.set(5,5,[255,255,255,120]);
  image.set(6,6,[255,0,255,80]);image.set(1,1,[255,255,255,0]);image.set(8,6,[150,170,190,128]);
  const result=repairSpriteAlphaPixelsV134(image,policy);
  assert.equal(result.changedPixels,0);assert.equal(result.data,image.data);
});

test('a white or purple solid core retains the matching authored translucent outline', () => {
  for (const color of [[242,246,248,255],[250,0,250,255]]) {
    const image=fixture();for(let y=3;y<=8;y++)for(let x=3;x<=8;x++)image.set(x,y,color);
    image.set(2,5,color[1]>200?[255,255,255,128]:[255,0,255,64]);
    assert.equal(repairSpriteAlphaPixelsV134(image,policy).changedPixels,0);
  }
});

test('unadmitted art, unloaded images and wrong native dimensions bypass the cache and renderer', () => {
  const native={src:'/assets/arbitrary-white-shirt.png',complete:true,naturalWidth:10,naturalHeight:10};
  assert.equal(resolveSpriteDrawableV134(native),native);
  for(const patch of [{complete:false},{naturalWidth:1},{naturalHeight:1}]) {
    const image={...native,src:policy.path,naturalWidth:policy.width,naturalHeight:policy.height,...patch};
    assert.equal(resolveSpriteDrawableV134(image),image);
  }
  assert.equal(repairSpriteAlphaPixelsV134(fixture(),null),null);
  assert.equal(repairSpriteAlphaPixelsV134({data:new Uint8Array(1),width:1,height:1},policy),null);
});

test('the exact V141 Hudson atlas retains native antialiasing without admitting a white or magenta background', () => {
  const path='/assets/openai/sprites/player/v141/hudson-torso-candidate-v141.png';
  const policies=SPRITE_ALPHA_ASSETS_V134.filter(asset=>asset.path===path);
  assert.equal(policies.length,1);assert.deepEqual([policies[0].width,policies[0].height],[1536,1024]);
  const bytes=readFileSync(new URL(`..${path}`,import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),
    '7089fb04de1587661f6bb53a89647cdd6fe01d0e183e4da0191a87165dfb43de');
  const source=decodePng(path),{data,width,height}=source;
  let transparent=0,core=0,antialiased=0,paleCore=0,paleTranslucent=0,visibleMagenta=0,borderResidue=0;
  for(let at=0;at<data.length;at+=4){
    const [r,g,b,a]=data.subarray(at,at+4),pixel=at/4,x=pixel%width,y=Math.floor(pixel/width);
    if(a===0)transparent++;else if(a<224)antialiased++;else core++;
    const pale=Math.min(r,g,b)>=220&&Math.max(r,g,b)-Math.min(r,g,b)<=24;
    if(a>0&&pale){if(a>=224)paleCore++;else paleTranslucent++;}
    if(a>0&&r>=150&&b>=130&&g<=105&&Math.min(r,b)-g>=55)visibleMagenta++;
    if(x<8||x>=width-8||y<8||y>=height-8){
      assert.ok(a<=1,'The outer border must remain effectively empty; alpha 1 is natural native residue.');
      assert.ok(!a||!pale,'No visible white border/backdrop.');
      if(a)borderResidue++;
    }
  }
  assert.equal(transparent,646250);assert.ok(transparent>width*height*.4);
  assert.equal(core,870813);assert.ok(antialiased>50000,'Natural antialiasing is retained rather than rejected.');
  assert.equal(paleCore,16962,'Pale calendar/lettering/highlights are legitimate solid material.');
  assert.equal(paleTranslucent,0);assert.equal(visibleMagenta,0);assert.equal(borderResidue,210);
  const result=repairSpriteAlphaPixelsV134(source,policies[0]);
  assert.equal(result.changedPixels,0);assert.equal(result.whitePixels,0);assert.equal(result.purplePixels,0);
  assert.equal(result.alphaUnchanged,true);assert.equal(result.data,source.data,'The native RGBA pixels need no rendering correction.');
});

test('all admitted real PNGs preserve alpha, opaque and interior pixels; all 656 human cells retain their soles', () => {
  assert.equal(new Set(SPRITE_ALPHA_ASSETS_V134.map(asset=>asset.path)).size,SPRITE_ALPHA_ASSETS_V134.length);
  const humans=new Map(HUMAN_ATLAS_METRICS_V133.map(asset=>[asset.path,asset]));
  let correctedAssets=0, correctedPixels=0, verifiedHumanCells=0, verifiedHumanAtlases=0;
  for(const asset of SPRITE_ALPHA_ASSETS_V134) {
    const source=decodePng(asset.path);assert.equal(source.width,asset.width);assert.equal(source.height,asset.height);
    const repaired=repairSpriteAlphaPixelsV134(source,asset),{data:before,width,height}=source;
    assert.equal(repaired.alphaUnchanged,true);assert.ok(repaired.maxDistance<=2);
    if(repaired.changedPixels){correctedAssets++;correctedPixels+=repaired.changedPixels;}
    for(let at=0;at<before.length;at+=4) {
      assert.equal(repaired.data[at+3],before[at+3],asset.path);
      if(before[at+3]>=224 || before[at+3]===0) {
        if(repaired.data[at]!==before[at]||repaired.data[at+1]!==before[at+1]||repaired.data[at+2]!==before[at+2])
          assert.fail(`Solid/transparent material changed at ${at}: ${asset.path}`);
      }
    }
    const atlas=humans.get(asset.path);if(!atlas)continue;verifiedHumanAtlases++;
    const cells=[];
    for(let row=0;row<atlas.rows;row++)for(let col=0;col<atlas.cols;col++){
      let left=atlas.cellWidth,top=atlas.cellHeight,right=0,bottom=0;
      for(let y=0;y<atlas.cellHeight;y++)for(let x=0;x<atlas.cellWidth;x++){
        if(repaired.data[((row*atlas.cellHeight+y)*width+col*atlas.cellWidth+x)*4+3]>32){
          left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x+1);bottom=Math.max(bottom,y+1);
        }
      }
      cells.push(right?[left,top,right,bottom]:null);verifiedHumanCells++;
    }
    assert.deepEqual(cells,atlas.frames,atlas.id);
  }
  assert.equal(verifiedHumanAtlases,41);assert.equal(verifiedHumanCells,656);
  assert.ok(correctedAssets>40,correctedAssets);assert.ok(correctedPixels>1000,correctedPixels);
});

test('native Images stay untouched while the same corrected drawable is shared and prepared once', async () => {
  const module=await import('../src/sprite-alpha-policy-v134.js?cache-sharing-test');
  const asset=module.SPRITE_ALPHA_ASSETS_V134.find(asset=>asset.path.endsWith('/bridge-terminal.png'));
  const source=decodePng(asset.path),previous=globalThis.document;let readCalls=0,writeCalls=0,drawCalls=0;
  globalThis.document={createElement(){return{width:0,height:0,getContext(){return{
    drawImage(){drawCalls++;},getImageData(){readCalls++;return{...source,data:new Uint8ClampedArray(source.data)};},
    putImageData(){writeCalls++;}
  };}};}};
  try {
    const native=Object.freeze({src:asset.path,complete:true,naturalWidth:asset.width,naturalHeight:asset.height});
    const drawable=module.resolveSpriteDrawableV134(native);assert.notEqual(drawable,native);
    for(let frame=0;frame<120;frame++)assert.equal(module.resolveSpriteDrawableV134(native),drawable);
    assert.equal(module.resolveSpriteDrawableV134({...native}),drawable,'Identical paths share the corrected cutout.');
    assert.equal(native.naturalWidth,source.width);assert.equal(native.complete,true);
    assert.equal(readCalls,1);assert.equal(writeCalls,1);assert.equal(drawCalls,1);
    const snapshot=module.getSpriteAlphaSnapshotV134();assert.equal(snapshot.preparations,1);assert.equal(snapshot.cacheHits,121);
    assert.equal(snapshot.failures,0);assert.equal(snapshot.correctedDrawRequests,122);
    assert.equal(snapshot.assets[0].alphaUnchanged,true);assert.equal(snapshot.assets[0].correctedDrawable,true);
  } finally {globalThis.document=previous;}
});

test('cache obeys its memory limit under an atlas-size working set', async () => {
  const module=await import('../src/sprite-alpha-policy-v134.js?cache-budget-test');
  const previous=globalThis.document;
  globalThis.document={createElement(){return{width:0,height:0,getContext(){return{
    drawImage(){},getImageData(x,y,width,height){const data=new Uint8ClampedArray(width*height*4);
      data.set([64,64,64,255],(width+1)*4);data.set([255,255,255,64],(width+2)*4);return{data,width,height};},putImageData(){}
  };}};}};
  try{
    for(const asset of module.SPRITE_ALPHA_ASSETS_V134.filter(asset=>asset.width>=1024).slice(0,20)){
      module.resolveSpriteDrawableV134({src:asset.path,complete:true,naturalWidth:asset.width,naturalHeight:asset.height});
      const snapshot=module.getSpriteAlphaSnapshotV134();
      assert.ok(snapshot.retainedBytes<=SPRITE_ALPHA_POLICY_V134.cacheBytes);assert.ok(snapshot.retainedEntries<=SPRITE_ALPHA_POLICY_V134.cacheEntries);
    }
    const snapshot=module.getSpriteAlphaSnapshotV134();assert.ok(snapshot.evictions>0);assert.equal(snapshot.failures,0);
  }finally{globalThis.document=previous;}
});

test('unreadable canvas fails safely once without changing the native image', async () => {
  const module=await import('../src/sprite-alpha-policy-v134.js?cache-failure-test');
  const previous=globalThis.document;let attempts=0;
  globalThis.document={createElement(){return{getContext(){return{drawImage(){},getImageData(){attempts++;throw Error('Unreadable');},putImageData(){}};}};}};
  try{
    const asset=module.SPRITE_ALPHA_ASSETS_V134[0],native=Object.freeze({src:asset.path,complete:true,naturalWidth:asset.width,naturalHeight:asset.height});
    for(let frame=0;frame<120;frame++)assert.equal(module.resolveSpriteDrawableV134(native),native);
    assert.equal(attempts,1);assert.equal(module.getSpriteAlphaSnapshotV134().failures,1);
  }finally{globalThis.document=previous;}
});
