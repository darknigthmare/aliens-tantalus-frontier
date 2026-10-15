/** Six original frontal wall materials. Runtime samples the rectangular inner
 * faces; transparent gutters and the detached outer shadows are not wall bays.
 * The admitted RGBA file is unchanged. Always paint a solid backing beneath
 * the source, whose original alpha reaches 254 rather than 255. */
const material = (id, x, y, w, h, backing) => Object.freeze({ id,
  source: Object.freeze({ x, y, w, h }), backing,
  projection: 'frontal-wall-elevation', maximumScale: 1,
  containsFloor: false, containsExterior: false, interactive: false, collidable: false
});

export const HUB_INTERIOR_WALL_ATLAS_V138 = Object.freeze({
  asset: '/assets/openai/hub/layers/v138/interior-wall-atlas.png',
  width: 1536, height: 1024,
  sha256: '059f10b591b318f0081f7e15164d7abb01ab76ddf4de0b928bcf4ee094841033',
  sourceStatus: 'original-generated-frontal-ship-wall-materials', exact: false,
  alphaPolicy: 'unchanged-original-rgba-with-solid-runtime-backing',
  cropPolicy: 'inner-rectangular-material-face-without-transparent-gutters',
  cells: Object.freeze({
    command: material('command', 27, 54, 462, 399, '#28343b'),
    habitat: material('habitat', 539, 54, 459, 399, '#534f43'),
    clinical: material('clinical', 1047, 54, 463, 399, '#70766a'),
    industrial: material('industrial', 27, 545, 462, 414, '#2c2e2b'),
    cargo: material('cargo', 539, 545, 459, 414, '#3b3d32'),
    archive: material('archive', 1047, 545, 463, 414, '#243432')
  })
});

export function getHubInteriorWallCellV138(id) {
  return Object.hasOwn(HUB_INTERIOR_WALL_ATLAS_V138.cells, id)
    ? HUB_INTERIOR_WALL_ATLAS_V138.cells[id] : null;
}
