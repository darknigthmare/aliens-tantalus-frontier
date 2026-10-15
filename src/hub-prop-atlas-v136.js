/** Six original small furnishings. Source crops are measured in the unchanged
 * generated RGBA image; they are never enlarged into a complete room. */
const cell = (id, x, y, w, h, width, footSourceY, tile) => Object.freeze({ id,
  source: Object.freeze({ x, y, w, h }), width, height: width * h / w,
  footSourceY, projection: 'strict-side-elevation',
  sourceTile: Object.freeze(tile),
  ...(id === 'medical-trolley' ? {
    occupiedSource: Object.freeze([Object.freeze({ x: 0, y: 0, w, h })]),
    surfaceStatus: 'painted-stock-no-admitted-free-worktop'
  } : {}),
  collidable: false, interactive: false });

export const HUB_PROP_ATLAS_V136 = Object.freeze({
  asset: '/assets/openai/hub/props/v139/service-front-atlas.png',
  width: 1536, height: 1024,
  sha256: '6153418ca83b7bc2dc24ad283874ed55d12217defde6bd71dc5a9bebd6b017fb',
  sourceStatus: 'original-generated-project-prop-atlas', exact: false,
  alphaPolicy: 'original-rgba-no-pixel-editing',
  cells: Object.freeze({
    'sterile-cabinet': cell('sterile-cabinet', 47, 109, 469, 366, 80, 363, {x:0,y:0,w:539,h:512}),
    'medical-trolley': cell('medical-trolley', 563, 87, 414, 425, 48, 422, {x:539,y:0,w:450,h:512}),
    'galley-rack': cell('galley-rack', 1001, 141, 488, 323, 84, 320, {x:989,y:0,w:547,h:512}),
    'personal-shelf': cell('personal-shelf', 40, 649, 474, 202, 66, 199, {x:0,y:512,w:532,h:512}),
    'tool-board': cell('tool-board', 551, 562, 435, 362, 72, 359, {x:532,y:512,w:470,h:512}),
    'data-cabinet': cell('data-cabinet', 1019, 571, 476, 342, 80, 339, {x:1002,y:512,w:534,h:512})
  })
});

export function getHubPropAtlasCellV136(id) {
  return Object.hasOwn(HUB_PROP_ATLAS_V136.cells, id) ? HUB_PROP_ATLAS_V136.cells[id] : null;
}
