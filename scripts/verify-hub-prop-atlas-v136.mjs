import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { auditWeaponPngV120 } from './audit-weapon-png-v120.mjs';
import { HUB_PROP_ATLAS_V136, getHubPropAtlasCellV136 } from '../src/hub-prop-atlas-v136.js';

const atlas = HUB_PROP_ATLAS_V136;
const png = auditWeaponPngV120(fileURLToPath(new URL(`..${atlas.asset}`, import.meta.url)));

test('the original prop image has the admitted bytes, real alpha and six isolated source modules', () => {
  assert.equal(png.sha256, atlas.sha256);
  assert.equal(png.width, atlas.width); assert.equal(png.height, atlas.height);
  assert.ok(png.transparentPixels > png.width * png.height * .4);
  for (const [x, y] of [[0,0], [1535,0], [0,1023], [1535,1023]]) assert.ok(png.pixelAlpha(x,y) <= 1);
  const crops = Object.values(atlas.cells).map(entry => entry.source), counts = crops.map(() => 0);
  for (let y = 0; y < png.height; y++) for (let x = 0; x < png.width; x++) {
    if (png.pixelAlpha(x,y) <= 32) continue;
    const indices = crops.flatMap((c,i) => x >= c.x && x < c.x+c.w && y >= c.y && y < c.y+c.h ? [i] : []);
    assert.equal(indices.length, 1, `Clipped module or overlapping crop at ${x},${y}`);
    counts[indices[0]]++;
  }
  for (const count of counts) assert.ok(count > 40000);
  // The image's actual empty gutters are not an equal 512px grid: a few
  // complete silhouettes cross that notional line. Each crop stays in its own
  // measured bay and keeps two pixels beyond its alpha>=16 silhouette.
  for (const entry of Object.values(atlas.cells)) {
    const c=entry.source,t=entry.sourceTile,b=[t.x+t.w,t.y+t.h,t.x,t.y];
    let lastOpaqueRow=-1;
    assert.ok(c.x>=t.x&&c.y>=t.y&&c.x+c.w<=t.x+t.w&&c.y+c.h<=t.y+t.h);
    for(let y=t.y;y<t.y+t.h;y++)for(let x=t.x;x<t.x+t.w;x++) {
      if(png.pixelAlpha(x,y)>=16){b[0]=Math.min(b[0],x);b[1]=Math.min(b[1],y);b[2]=Math.max(b[2],x+1);b[3]=Math.max(b[3],y+1);}
      if(png.pixelAlpha(x,y)>=192)lastOpaqueRow=Math.max(lastOpaqueRow,y);
    }
    assert.deepEqual(c,{x:b[0]-2,y:b[1]-2,w:b[2]-b[0]+4,h:b[3]-b[1]+4},entry.id);
    assert.equal(entry.footSourceY,lastOpaqueRow+1-c.y,`${entry.id}: alpha192 contact edge`);
    assert.ok(entry.footSourceY<c.h,`${entry.id}: padding is not a physical foot`);
  }
});

test('all furnishings preserve native proportions at modest human scale without granting an interaction', () => {
  for (const [id, entry] of Object.entries(atlas.cells)) {
    assert.equal(getHubPropAtlasCellV136(id), entry);
    assert.ok(entry.width >= 40 && entry.width <= 96.5);
    assert.ok(entry.height > 20 && entry.height < 96.5);
    assert.ok(Math.abs(entry.width / entry.height - entry.source.w / entry.source.h) < 1e-12);
    assert.equal(entry.collidable, false); assert.equal(entry.interactive, false);
    assert.equal(entry.projection,'strict-side-elevation');
  }
  assert.deepEqual(Object.fromEntries(Object.values(atlas.cells).map(cell=>[cell.id,cell.width])),{
    'sterile-cabinet':80,'medical-trolley':48,'galley-rack':84,'personal-shelf':66,'tool-board':72,'data-cabinet':80
  });
  const trolley=atlas.cells['medical-trolley'];
  assert.equal(trolley.usefulSurfaceSource,undefined,'Painted instruments must not become another free worktop.');
  assert.deepEqual(trolley.occupiedSource,[{x:0,y:0,w:trolley.source.w,h:trolley.source.h}]);
  assert.equal(getHubPropAtlasCellV136('unknown'), null);
  assert.equal(getHubPropAtlasCellV136('__proto__'), null);
});
