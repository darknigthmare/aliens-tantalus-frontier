/** Original frontal ship furnishings, measured in the unchanged RGBA source.
 * Crops isolate complete silhouettes. Contact is the final opaque alpha192
 * row, independent of the faint original fringe that remains in each crop. */
const freeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
const cell = (id, x, y, w, h, width, footSourceY, maximumWidth=width, metadata={}) => freeze({ id,
  source: Object.freeze({ x, y, w, h }), width, maximumWidth, height: width * h / w,
  footSourceY, projection: 'strict-side-elevation', ...metadata,
  collidable: false, interactive: false });

export const HUB_FURNISHING_ATLAS_V137 = Object.freeze({
  asset: '/assets/openai/hub/props/v139/ship-front-atlas.png',
  width: 1536, height: 1024,
  sha256: 'd5c1129bc7244f5f2e818ce920f3c9e30430691f89a5a8fe45ba9ad511e2be1b',
  sourceStatus: 'reviewed-original-frontal-ship-furnishings', exact: false,
  alphaPolicy: 'original-rgba-no-pixel-editing',
  cropPolicy: 'measured-alpha16-silhouettes',
  footPolicy: 'opaque-alpha192-contact-bottom-relative-to-crop',
  cells: Object.freeze({
    'crew-berth': cell('crew-berth', 45, 64, 496, 272, 154, 271, 154, {
      usefulSurfaceSource: { x: 28, y: 141, w: 356, h: 3, kind: 'mattress' }
    }),
    'galley-unit': cell('galley-unit', 608, 67, 486, 272, 180, 271),
    'food-refrigerator': cell('food-refrigerator', 1190, 29, 283, 321, 88, 320),
    'sanitary-unit': cell('sanitary-unit', 79, 367, 397, 317, 162, 316, 162, {
      interiorSource: { x: 63, y: 28, w: 146, h: 255, kind: 'standing-clearance' }
    }),
    'engine-pump': cell('engine-pump', 536, 408, 565, 281, 180, 280),
    'filtration-skid': cell('filtration-skid', 1133, 389, 378, 301, 148, 300),
    'cockpit-seat': cell('cockpit-seat', 80, 696, 360, 290, 72, 288, 72, { facing: 'right' }),
    'service-conduits': cell('service-conduits', 480, 770, 664, 167, 146, 166, 240),
    'emergency-cabinet': cell('emergency-cabinet', 1231, 717, 197, 258, 44, 256)
  })
});

export function getHubFurnishingCellV137(id) {
  return Object.hasOwn(HUB_FURNISHING_ATLAS_V137.cells, id) ? HUB_FURNISHING_ATLAS_V137.cells[id] : null;
}
