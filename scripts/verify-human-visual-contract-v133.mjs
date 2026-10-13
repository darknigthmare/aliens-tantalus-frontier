import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import { HUMAN_VISUAL_CONTRACT_V133, HUMAN_ATLAS_METRICS_V133, HUMAN_POSE_IDS_V133,
  resolveHumanAtlasGeometryV133, resolveHumanPoseGeometryV133, drawHumanAtlasV133 } from '../src/human-visual-contract-v133.js';
import { SPRITE_SHEETS, SPRITE_PIVOTS } from '../src/sprite-animation-runtime.js';
import { PLAYER_VISUAL_CONTRACT_V81, validatePlayerSpriteSampleV81, drawEcho9FallbackV81 } from '../src/player-visual-contract-v81.js';
import { resolvePlayerBodyRigV125 } from '../src/player-body-rig-v125.js';
import { resolvePlayerCostumeSampleV119, PLAYER_COSTUME_SKIN_V119 } from '../src/player-costume-skins-v119.js';
import { ENEMY_STATIC_POSES_V96 } from '../src/enemy-static-poses-v96.js';
import { ENEMY_DEDICATED_POSES_V99, drawEnemyDedicatedPoseV99 } from '../src/enemy-dedicated-poses-v99.js';
import { drawUserCastePoseV87, getUserPoseVisibleBoundsV95 } from '../src/enemy-user-pose-runtime-v87.js';
import { getEnemyImportAnimationV107 } from '../src/enemy-import-animation-v107.js';
import { GameEngine } from '../src/game-production-runtime.js';
import { CREW, WORLDS, CAMPAIGNS, WEAPONS, ENEMIES } from '../src/content.js';
import { buildSpriteHitboxRuntime } from '../src/game-v52-runtime.js';
import { USER_EQUIPMENT_V95, getUserArmorTransformV95, getUserWeaponTransformV95,
  resolveUserEquipmentMuzzleV95 } from '../src/user-equipment-v95.js';

const HEIGHT = HUMAN_VISUAL_CONTRACT_V133.standingHeight;
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-7, `${a} != ${b}`);
const actor = extra => ({ x: 100, y: 200, w: 42, h: 92, alive: true, grounded: true, facing: 1,
  vx: 0, vy: 0, costumeId: 'costume-001', health: 100, maxHealth: 100, ...extra });
function context() {
  const calls = [], transforms = [], stack = [], rectangles = [];
  const ctx = new Proxy({ calls, transforms, save() { stack.push(1); }, restore() { assert.ok(stack.pop()); },
    translate(...v) { transforms.push(v); }, drawImage(...v) { calls.push(v); }, fillRect(...v) { rectangles.push(v); },
    measureText: text => ({ width: String(text).length * 8 }),
    createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }) },
  { get(target, key) { return key in target ? target[key] : () => {}; } });
  return { ctx, calls, transforms, stack, rectangles };
}
const image = definition => ({ complete: true, naturalWidth: definition.sourceWidth, naturalHeight: definition.sourceHeight });

test('every shipped human atlas matches the real PNG alpha bounds, including every sole', () => {
  assert.equal(HUMAN_ATLAS_METRICS_V133.length, 41);
  let verifiedCells = 0;
  for (const declared of HUMAN_ATLAS_METRICS_V133) {
    const bytes = readFileSync(new URL(`..${declared.path}`, import.meta.url));
    assert.deepEqual(bytes.subarray(0,8),Buffer.from([137,80,78,71,13,10,26,10]));
    const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);
    assert.equal(width,declared.sourceWidth);assert.equal(height,declared.sourceHeight);
    assert.equal(bytes[24],8);assert.equal(bytes[25],6,'Only true RGBA8 shipped art is admitted.');assert.equal(bytes[28],0);
    const chunks=[];
    for(let at=8;at<bytes.length;){assert.ok(at+12<=bytes.length);const size=bytes.readUInt32BE(at);
      assert.ok(at+12+size<=bytes.length);const kind=bytes.subarray(at+4,at+8).toString();
      if(kind==='IDAT')chunks.push(bytes.subarray(at+8,at+8+size));at+=12+size;}
    const packed=inflateSync(Buffer.concat(chunks)),stride=width*4,pixels=Buffer.alloc(stride*height);
    assert.equal(packed.length,(stride+1)*height);
    const paeth=(a,b,c)=>{const p=a+b-c,da=Math.abs(p-a),db=Math.abs(p-b),dc=Math.abs(p-c);return da<=db&&da<=dc?a:db<=dc?b:c;};
    for(let y=0;y<height;y++){const row=y*stride,source=y*(stride+1),filter=packed[source];assert.ok(filter<=4);
      for(let x=0;x<stride;x++){const left=x>=4?pixels[row+x-4]:0,up=y?pixels[row+x-stride]:0,ul=y&&x>=4?pixels[row+x-stride-4]:0;
        const prediction=filter===0?0:filter===1?left:filter===2?up:filter===3?Math.floor((left+up)/2):paeth(left,up,ul);
        pixels[row+x]=(packed[source+1+x]+prediction)&255;}}
    const bounds=[];
    for(let row=0;row<declared.rows;row++)for(let col=0;col<declared.cols;col++){
      const cw=declared.cellWidth,ch=declared.cellHeight;let left=cw,top=ch,right=0,bottom=0;
      for(let y=0;y<ch;y++)for(let x=0;x<cw;x++)if(pixels[((row*ch+y)*width+col*cw+x)*4+3]>32){
        left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x+1);bottom=Math.max(bottom,y+1);}
      bounds.push(right? [left,top,right,bottom] : null);verifiedCells++;
    }
    assert.deepEqual(bounds,declared.frames,declared.id);
  }
  assert.equal(verifiedCells,656);
});

test('all 16 crew identities share neutral stature across hub and mission, facing and floor heights', () => {
  const npcSheets = Object.values(SPRITE_SHEETS).filter(d => d.family === 'npc');
  assert.equal(npcSheets.length, 32);
  for (const sheet of npcSheets) for (const surface of ['mission', 'hub', 'bioforge'])
    for (const facing of [-1, 1]) for (const floor of [140, 504, 868]) for (let column = 0; column < 4; column++) {
      const subject = actor({ facing, y: floor - 92 });
      const before = structuredClone(subject);
      const g = resolveHumanAtlasGeometryV133({ actor: subject, sheet, column, row: 0, surface });
      assert.ok(g); near(g.visible.y + g.visible.height, floor);
      // Neutral action cells include a raised arm or a bowed head. Keep one
      // reference scale per atlas rather than resizing every pose or its gun.
      assert.ok(Math.abs(g.visible.height - HEIGHT) < 6, `${sheet.id}: ${g.visible.height}`);
      near(g.sprite.width / g.source.width, g.sprite.height / g.source.height);
      assert.deepEqual(subject, before, 'Sizing never moves or resizes an actor.');
    }
});

test('crouches retain shorter bodies instead of being enlarged to neutral standing height', () => {
  const sheet = SPRITE_SHEETS['npc.mara-vega.mission'];
  const standing = resolveHumanAtlasGeometryV133({ actor: actor(), sheet, row: 0, column: 0 });
  const crouch = resolveHumanAtlasGeometryV133({ actor: actor({ crouching: true }), sheet, row: 1, column: 0 });
  near(standing.scale, crouch.scale); assert.ok(crouch.visible.height < standing.visible.height * .75);
  near(crouch.visible.y + crouch.visible.height, standing.pivot.y);
});

test('J1/J2, legacy fallback and dedicated costume use the same grounded, isotropic human reference', () => {
  const sheet = SPRITE_SHEETS['player.echo9-marine.locomotion'];
  for (const surface of ['mission', 'hub', 'bioforge']) for (const operatorId of ['echo-9', 'echo-9-coop']) {
    const subject = actor({ operatorId });
    const g = validatePlayerSpriteSampleV81({ sheet, image: image({sourceWidth:1024,sourceHeight:1024}),
      sample: { column: 0, row: 0 }, pivot: SPRITE_PIVOTS[sheet.pivot], entity: subject, surface });
    assert.equal(g.ok, true); near(g.sprite.width / 256, g.sprite.height / 256);
    near(193 * g.sprite.height / 256, HEIGHT); near(g.pivot.y, subject.y + subject.h);
    const rig = resolvePlayerBodyRigV125({ actor: subject, surface, timeSeconds: 0 });
    assert.equal(rig.eligible, true); near(rig.standingHeight, HEIGHT);
    near(Math.abs(rig.matrix.a), rig.matrix.d); near(rig.pivot.y, subject.y + subject.h);
    const images = new Map(PLAYER_COSTUME_SKIN_V119.atlases.map(d => [d.imageKey, image(d)]));
    const costume = resolvePlayerCostumeSampleV119({ costumeId: 'franchise-nostromo-crew', imageStore: images,
      sheetId: sheet.id, column: 0, row: 0, entity: subject, metrics: PLAYER_VISUAL_CONTRACT_V81.surfaces[surface] });
    assert.equal(costume.ok, true);
    const native = PLAYER_COSTUME_SKIN_V119.atlases[0].frames[0];
    near((native.alphaBounds[3] - native.alphaBounds[1]) * costume.sprite.height / costume.source.height, HEIGHT);
  }
});

test('exact human/synthetic fixed poses and their native walk atlases share stature without double scaling', () => {
  assert.equal(HUMAN_POSE_IDS_V133.length, 30);
  for (const id of HUMAN_POSE_IDS_V133) {
    const definition = ENEMY_STATIC_POSES_V96.find(d => d.id === id);
    assert.ok(definition);
    for (const facing of [-1, 1]) {
      const subject = actor({ profileId: id, facing });
      const g = resolveHumanPoseGeometryV133({ actor: subject, definition });
      assert.ok(g); near(g.visible.height, HEIGHT); near(g.visible.y + g.visible.height, subject.y + subject.h);
      near(g.renderWidth / definition.sourceWidth, g.renderHeight / definition.sourceHeight);
      const host = context(); assert.equal(drawUserCastePoseV87(host.ctx, subject, image(definition)), true);
      near(host.calls.at(-1)[3] / definition.sourceWidth, host.calls.at(-1)[4] / definition.sourceHeight);
      assert.deepEqual(getUserPoseVisibleBoundsV95(subject), { x:g.visible.x,y:g.visible.y,w:g.visible.width,h:g.visible.height });
      const animation = getEnemyImportAnimationV107(definition);
      if (animation) {
        host.calls.length = 0;
        const images = new Map([[animation.path, image(animation)]]);
        assert.equal(drawUserCastePoseV87(host.ctx, { ...subject, vx: 40 }, image(definition),
          { imageStore: images, timeSeconds: 0, movementEnabled: true }), true);
        const frame = animation.frames[0], call = host.calls.at(-1), scale = call[8] / frame.rect[3];
        near(scale, HEIGHT / animation.referenceHeight);
        assert.ok(Math.abs((frame.alphaBounds[3] - frame.alphaBounds[1]) * scale - HEIGHT) < 3);
      }
    }
  }
});

test('aliens, machines, royals and unadmitted art retain their native dimensions and pivot', () => {
  for (const definition of ENEMY_STATIC_POSES_V96.filter(d => !HUMAN_POSE_IDS_V133.includes(d.id))) {
    assert.equal(resolveHumanPoseGeometryV133({ actor: actor({ profileId:definition.id }), definition }), null);
  }
  const human = ENEMY_STATIC_POSES_V96.find(d => HUMAN_POSE_IDS_V133.includes(d.id));
  for (const patch of [{isRoyal:true},{mechanical:true},{h:0},{x:NaN}]) {
    assert.equal(resolveHumanPoseGeometryV133({ actor:actor(patch), definition:human }), null);
    assert.equal(resolveHumanAtlasGeometryV133({ actor:actor(patch), sheet:SPRITE_SHEETS['npc.mara-vega.locomotion'] }), null);
  }
  const poses = ENEMY_DEDICATED_POSES_V99;
  for (const definition of [poses.find(d=>d.profileId==='enemy-147-armored-weyland-yutani-commando'),
    poses.find(d=>d.profileId==='enemy-145-armored-working-joe'), poses.find(d=>d.profileId==='enemy-198-acid-blooded-combat-synthetic')]) {
    assert.ok(definition); const subject=actor({profileId:definition.profileId}), host=context();
    assert.equal(drawEnemyDedicatedPoseV99(host.ctx,subject,image(definition)),true);
    near(subject.humanVisualV133.visible.height,HEIGHT);
  }
  const alien = poses.find(d=>d.targetOpaqueHeight>=190 && !d.profileId.includes('human'));
  const host=context();assert.equal(drawEnemyDedicatedPoseV99(host.ctx,actor({profileId:alien.profileId}),image(alien)),true);
  assert.equal(host.calls.at(-1)[3],alien.renderWidth);assert.equal(host.calls.at(-1)[4],alien.renderHeight);
});

test('final production squad drawing publishes the calibrated visual while preserving combat hitboxes and resources', () => {
  const events=new EventTarget();for(const key of ['addEventListener','removeEventListener','dispatchEvent'])globalThis[key]=events[key].bind(events);
  globalThis.document=Object.assign(new EventTarget(),{hidden:false,activeElement:null,hasFocus:()=>true});
  globalThis.requestAnimationFrame=()=>1;globalThis.cancelAnimationFrame=()=>{};
  globalThis.Image=class extends EventTarget {
    complete=true;naturalWidth=1024;naturalHeight=1024;
    set src(path){this.path=path;try{const b=readFileSync(new URL(`..${path}`,import.meta.url));
      if(b.subarray(1,4).toString()==='PNG'){this.naturalWidth=b.readUInt32BE(16);this.naturalHeight=b.readUInt32BE(20);}}catch{}
      queueMicrotask(()=>this.onload?.());}get src(){return this.path;}async decode(){}
  };
  const host=context(),canvas=Object.assign(new EventTarget(),{width:1280,height:720,getContext:()=>host.ctx,
    focus(){document.activeElement=this;},getBoundingClientRect:()=>({left:0,top:0,width:1280,height:720})});
  const engine=new GameEngine(canvas);engine.start({world:WORLDS[0],campaign:CAMPAIGNS[0],weapon:WEAPONS[0],
    enemyCatalog:ENEMIES.slice(0,1),crew:CREW.slice(0,5),equipment:[],seed:133});
  assert.ok(engine.squadActors.length>=3);
  for(const member of engine.squadActors){
    const before={x:member.x,y:member.y,w:member.w,h:member.h,health:member.health,ammo:member.ammo};
    engine.drawSquadActor(host.ctx,member);assert.ok(member.humanVisualV133);
    near(member.humanVisualV133.pivot.y,member.y+member.h);
    assert.deepEqual(member.spriteHitbox,buildSpriteHitboxRuntime(member,member.spriteHitbox.sheetId));
    assert.deepEqual({x:member.x,y:member.y,w:member.w,h:member.h,health:member.health,ammo:member.ammo},before);
  }
  engine.stop();assert.equal(host.stack.length,0);
});

test('an unloaded or wrongly sized human bitmap never changes the prescribed geometry', () => {
  const atlas=HUMAN_ATLAS_METRICS_V133[0],sheet={path:atlas.path,sourceFacing:1};
  const g=resolveHumanAtlasGeometryV133({actor:actor(),sheet});assert.ok(g);
  const host=context();assert.equal(drawHumanAtlasV133(host.ctx,{...image(atlas),complete:false},g),false);
  assert.equal(drawHumanAtlasV133(host.ctx,{...image(atlas),naturalWidth:1},g),false);
  assert.equal(drawHumanAtlasV133(host.ctx,image(atlas),g),true);assert.equal(host.calls.length,1);
  near(host.calls[0][7]/host.calls[0][3],host.calls[0][8]/host.calls[0][4]);
});

test('optional human armour keeps the shared stature while its actual weapon muzzle follows the same hand', () => {
  const weapons=USER_EQUIPMENT_V95.filter(d=>d.kind==='weapon');
  for(const armor of USER_EQUIPMENT_V95.filter(d=>d.kind==='armor'))for(const facing of [-1,1]) {
    const subject=actor({facing}),before=structuredClone(subject),t=getUserArmorTransformV95(subject,armor);
    const b=armor.alphaBounds;near((b[3]-b[1])*t.height/armor.sourceHeight,HEIGHT);
    near(t.width/armor.sourceWidth,t.height/armor.sourceHeight);assert.deepEqual(subject,before);
    for(const weapon of weapons){const aim={active:true,x:facing,y:0,facing};
      subject.combatAimV83=aim;subject.userEquipmentV95={schema:95,armorId:armor.id,weaponId:weapon.id};
      const held=getUserWeaponTransformV95(subject,aim,weapon,armor),muzzle=resolveUserEquipmentMuzzleV95(subject,aim);
      near(held.pivotX,t.hand.x);near(held.pivotY,t.hand.y);near(held.muzzle.x,muzzle.x);near(held.muzzle.y,muzzle.y);
    }
  }
});

test('a missing player PNG keeps a human-sized fallback with its boots on the same floor', () => {
  for(const surface of ['mission','hub','bioforge'])for(const facing of [-1,1]){
    const subject=actor({facing}),host=context();const render=drawEcho9FallbackV81(host.ctx,subject,{surface});
    assert.equal(render.drawn,true);assert.equal(render.fallback,true);
    const top=Math.min(...host.rectangles.map(r=>r[1]));
    const sole=Math.max(...host.rectangles.map(r=>r[1]+r[3]));
    near(sole-top,HEIGHT);near(render.sprite.y+sole,subject.y+subject.h);
  }
});
