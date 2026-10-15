/** Original separated ship furnishings, measured in the unchanged RGBA source.
 * Crops isolate a complete object; runtime scales both axes uniformly. */
const cell = (id, x, y, w, h, width, maximumWidth=width) => Object.freeze({ id,
  source: Object.freeze({ x, y, w, h }), width, maximumWidth, height: width * h / w,
  collidable: false, interactive: false });

export const HUB_FURNISHING_ATLAS_V137 = Object.freeze({
  asset: '/assets/openai/hub/props/v137/ship-service-prop-atlas.png',
  width: 1536, height: 1024,
  sha256: 'c7ba59eef67e4c01000522796f67a3e3a3f7456aaafe80bffa5e93a17e8f556f',
  sourceStatus: 'original-generated-separated-ship-furnishings', exact: false,
  alphaPolicy: 'original-rgba-no-pixel-editing',
  cells: Object.freeze({
    'crew-berth': cell('crew-berth', 43, 70, 478, 243, 152),
    'galley-unit': cell('galley-unit', 599, 70, 460, 258, 180),
    'food-refrigerator': cell('food-refrigerator', 1184, 21, 274, 314, 88),
    'sanitary-unit': cell('sanitary-unit', 82, 355, 386, 304, 162),
    'engine-pump': cell('engine-pump', 535, 404, 521, 257, 180),
    'filtration-skid': cell('filtration-skid', 1126, 394, 376, 277, 148),
    'cockpit-seat': cell('cockpit-seat', 74, 674, 376, 317, 72),
    'service-conduits': cell('service-conduits', 501, 764, 601, 160, 146, 240),
    'emergency-cabinet': cell('emergency-cabinet', 1226, 718, 195, 244, 44)
  })
});

export function getHubFurnishingCellV137(id) {
  return Object.hasOwn(HUB_FURNISHING_ATLAS_V137.cells, id) ? HUB_FURNISHING_ATLAS_V137.cells[id] : null;
}
