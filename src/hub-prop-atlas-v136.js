/** Six original small furnishings. Source crops are measured in the unchanged
 * generated RGBA image; they are never enlarged into a complete room. */
const cell = (id, x, y, w, h, width) => Object.freeze({ id,
  source: Object.freeze({ x, y, w, h }), width, height: width * h / w,
  collidable: false, interactive: false });

export const HUB_PROP_ATLAS_V136 = Object.freeze({
  asset: '/assets/openai/hub/props/v136/service-prop-atlas.png',
  width: 1536, height: 1024,
  sha256: '2bb3f4e4c5d069d9f273119ca4e5becf7861cb16cf7c27fc5a873e4cc2d736a6',
  sourceStatus: 'original-generated-project-prop-atlas', exact: false,
  alphaPolicy: 'original-rgba-no-pixel-editing',
  cells: Object.freeze({
    'sterile-cabinet': cell('sterile-cabinet', 28, 90, 460, 340, 80),
    'medical-trolley': cell('medical-trolley', 563, 79, 402, 400, 48),
    'galley-rack': cell('galley-rack', 1033, 118, 475, 309, 84),
    'personal-shelf': cell('personal-shelf', 28, 662, 479, 197, 66),
    'tool-board': cell('tool-board', 552, 573, 430, 359, 72),
    'data-cabinet': cell('data-cabinet', 1032, 549, 476, 368, 80)
  })
});

export function getHubPropAtlasCellV136(id) {
  return Object.hasOwn(HUB_PROP_ATLAS_V136.cells, id) ? HUB_PROP_ATLAS_V136.cells[id] : null;
}
