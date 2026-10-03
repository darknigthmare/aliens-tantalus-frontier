import { getCostumeV119 } from './franchise-costumes-v119.js';
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
// Native atlas dimensions are 1254, NOT the requested 1280. Logical frame IDs
// remain 4x4, but sources are 80 individually measured rectangles: never sample
// a nominal uniform grid (it would include the preceding row's boots).
const atlas = (kind, sha256, standingHeight, boxes, feet) => freeze({
  id: `player.nostromo-crew-v119.${kind}`, family: 'player', kind,
  imageKey: `playerCostumeV119:nostromo-crew:${kind}`,
  path: `/assets/openai/sprites/player/costumes-v119/nostromo-crew/${kind}.png`,
  sha256, sourceWidth: 1254, sourceHeight: 1254, sourceFacing: 1,
  frames: boxes.map(([left, top, right, bottom], index) => ({
    index, column: index % 4, row: Math.floor(index / 4), alphaBounds: [left, top, right, bottom],
    source: { x: left - 8, y: top - 8, width: right - left + 16, height: bottom - top + 16 },
    pivot: { kind: 'feet', x: feet[index] - left + 8, y: bottom - top + 8 },
    standingHeight, supportMethod: 'opaque-bottom-support-bottom-six-row-mean',
    semanticStatus: kind === 'interaction' && index === 15 ? 'adapted-kneeling-force-pose' : 'adapted-gameplay-pose'
  }))
});
export const PLAYER_COSTUME_SKIN_V119 = freeze({
  id: 'player.nostromo-crew-v119', costumeId: 'franchise-nostromo-crew', family: 'player',
  operator: 'echo-9', exact: false, visualStatus: 'adapted-dedicated-atlas',
  animationStatus: '80-adapted-pose-cells-not-motion-capture',
  // Precomposited outfit. Layer metadata does not claim separate swappable PNGs.
  layerContract: ['operator-body', 'underlayer', 'outfit-and-accessories-precomposited', 'external-equipped-weapon', 'foreground'],
  layerMode: 'dedicated-precomposited-outfit',
  atlases: [
    atlas('locomotion', '9e6c51ee2bded69e197545901870e289377f885aed544c202012f95907cdc3f7', 239,
      [[98,58,226,297],[412,58,539,297],[725,58,853,297],[1039,58,1166,297],[69,379,242,608],[385,379,554,609],[697,379,869,609],[1013,380,1182,608],[96,757,225,923],[388,737,550,922],[711,661,853,869],[1040,707,1166,894],[95,1072,225,1235],[393,1059,547,1235],[711,999,865,1235],[1037,999,1172,1234]],
      [145.283,459.299,772.372,1086.126,190.461,501.962,765.961,1126.404,135.472,426.812,739.221,1073.93,146.18,458.458,770.686,1145.888]),
    atlas('combat', '7e0c4c3ab4353293bf01ef5545d90866d3f83e188249bf10f71f81835c75db5d', 258,
      [[81,54,226,312],[392,55,554,312],[711,65,884,312],[1022,66,1195,312],[62,389,286,626],[405,386,572,626],[711,396,872,626],[1014,398,1229,626],[78,707,218,945],[394,709,541,945],[723,706,863,945],[1030,719,1180,945],[81,1001,243,1229],[392,1023,544,1229],[654,1096,881,1229],[935,1159,1234,1229]],
      [140.776,453.025,776.423,1090.102,127.142,491.995,774.637,1081.741,141.006,461.374,785.72,1093.934,169.611,461.617,776.692,1083.933]),
    atlas('melee', '89ce3efec85180426c1cf22b813c2e64d45ef686ee6a27cb96516d9a0f3ff5a6', 274,
      [[95,44,222,318],[387,45,574,318],[700,63,862,318],[988,65,1243,319],[70,372,241,638],[350,385,623,638],[658,389,945,638],[985,389,1221,638],[63,692,250,949],[352,695,623,949],[693,694,910,949],[1012,696,1196,949],[65,988,225,1238],[384,986,552,1237],[702,1014,854,1237],[1016,999,1180,1238]],
      [156.623,452.386,779.354,1059.281,156.666,433.898,746.61,1078.256,139.1,438.426,773.553,1090.139,144.491,463.606,775.935,1096.447]),
    atlas('interaction', 'bca3a38586fae812ad29d9dec42ff6f9e85f4d3d7ab9d9859158c67f28a497e7', 275,
      [[73,31,213,306],[378,32,577,306],[692,32,895,306],[1018,32,1169,306],[77,418,214,625],[375,362,576,625],[692,362,871,625],[1023,418,1177,625],[70,728,217,907],[382,740,561,907],[692,745,883,907],[1019,694,1175,906],[68,971,241,1223],[362,969,578,1223],[704,955,862,1223],[1008,1108,1225,1223]],
      [139.27,448.498,762.335,1092.929,141.395,448.609,765.286,1087.447,138.727,455.213,754.494,1101.362,152.216,448.188,776.599,1107.136]),
    atlas('tool-use', 'afffa701cd8a1e2c30ddc06420aacfe783e4941065fcf5a1f3f00492e36ae540', 278,
      [[79,46,250,322],[384,44,569,322],[706,45,886,322],[1025,46,1194,322],[64,356,258,635],[374,356,606,635],[693,356,962,635],[1023,356,1192,635],[72,663,234,942],[388,664,561,942],[709,665,882,943],[1029,664,1184,943],[45,974,282,1227],[351,978,625,1227],[697,974,900,1227],[1006,977,1238,1228]],
      [152.435,459.407,775.981,1101.055,140.521,443.121,768.15,1097.184,147.864,462.163,782.953,1105.216,123.227,492.275,800.977,1082.433])
  ]
});
export const PLAYER_COSTUME_ASSETS_V119 = PLAYER_COSTUME_SKIN_V119.atlases;
export function getPlayerCostumeSkinV119(costumeId) {
  return getCostumeV119(costumeId)?.skinId === PLAYER_COSTUME_SKIN_V119.id ? PLAYER_COSTUME_SKIN_V119 : null;
}
export function loadPlayerCostumeAssetsV119(imageStore, costumeId, ImageClass = globalThis.Image) {
  const skin = getPlayerCostumeSkinV119(costumeId);
  if (!skin || !imageStore?.get || !imageStore?.set || typeof ImageClass !== 'function') return [];
  for (const asset of skin.atlases) {
    if (imageStore.has(asset.imageKey)) continue;
    const image = new ImageClass(); image.decoding = 'async'; image.src = asset.path;
    imageStore.set(asset.imageKey, image);
  }
  return skin.atlases;
}
export function resolvePlayerCostumeSampleV119({ costumeId, imageStore, sheetId, column, row, entity, metrics } = {}) {
  const skin = getPlayerCostumeSkinV119(costumeId);
  if (!skin) return { ok: false, reason: getCostumeV119(costumeId)?.visualStatus === 'missing' ? 'costume-art-missing' : 'costume-not-dedicated' };
  if (!/^player\.echo9-marine\.(locomotion|combat|melee|interaction|tool-use)$/.test(String(sheetId))) return { ok: false, reason: 'costume-player-sheet-rejected' };
  const asset = skin.atlases.find(entry => entry.kind === sheetId.split('.').at(-1));
  if (!Number.isInteger(column) || !Number.isInteger(row) || column < 0 || column > 3 || row < 0 || row > 3) return { ok: false, reason: 'costume-cell-invalid' };
  const frame = asset.frames[row * 4 + column];
  const image = imageStore?.get?.(asset.imageKey);
  if (!image?.complete || Number(image.naturalWidth || image.width) !== asset.sourceWidth || Number(image.naturalHeight || image.height) !== asset.sourceHeight) return { ok: false, reason: 'costume-native-image-unavailable' };
  if (![entity?.x, entity?.y, entity?.w, entity?.h, metrics?.height].every(value => Number.isFinite(value)) || entity.w <= 0 || entity.h <= 0 || metrics.height <= 0) return { ok: false, reason: 'costume-geometry-invalid' };
  // Match the original idle head-to-foot height (193px in the 256px cell).
  // Uniform source-to-world scale preserves proportions; crouches stay shorter.
  const scale = metrics.height * (193 / 256) / frame.standingHeight;
  const flip = Number(entity.facing) < 0;
  const anchor = { x: entity.x + entity.w / 2, y: entity.y + entity.h };
  const pivotX = flip ? frame.source.width - frame.pivot.x : frame.pivot.x;
  return { ok: true, image, source: frame.source,
    sprite: { x: anchor.x - pivotX * scale, y: anchor.y - frame.pivot.y * scale, width: frame.source.width * scale, height: frame.source.height * scale },
    pivot: { id: 'humanoid-feet', ...anchor }, flip, facing: flip ? -1 : 1,
    sheetId: asset.id, costumeId, skinId: skin.id, frameIndex: frame.index, visualStatus: skin.visualStatus, exact: false, reason: null };
}
