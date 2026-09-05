// Measured alpha extents from hub-commercial-art-report-v71.json. These are
// source-space crops, never invented masks or a replacement for orthographic art.
export const HUB_ANNEX_ALPHA_BOUNDS_V72 = Object.freeze({
  'arrival-airlock': { prop: [75, 43, 565, 469], foreground: [591, 40, 1329, 680], door: [30, 98, 354, 482] },
  logistics: { prop: [50, 42, 596, 470], foreground: [587, 41, 1332, 679], door: [31, 89, 353, 481] },
  'mire-archives': { prop: [32, 102, 608, 469], foreground: [622, 40, 1298, 680], door: [27, 95, 354, 481] },
  'synthetic-bay': { prop: [45, 43, 583, 469], foreground: [619, 40, 1301, 680], door: [24, 113, 353, 481] },
  cctv: { prop: [73, 42, 560, 470], foreground: [598, 40, 1322, 680], door: [24, 103, 353, 481] },
  'proving-ground': { prop: [106, 42, 534, 470], foreground: [558, 41, 1361, 679], door: [31, 104, 353, 481] },
  morgue: { prop: [43, 132, 608, 469], foreground: [580, 42, 1340, 678], door: [28, 114, 353, 481] },
  'escape-pods': { prop: [101, 42, 548, 470], foreground: [592, 41, 1328, 679], door: [24, 133, 360, 482] },
  durandal: { prop: [82, 41, 558, 471], foreground: [601, 41, 1318, 679], door: [24, 144, 360, 482] },
  bioforge: { prop: [59, 43, 581, 469], foreground: [578, 41, 1342, 679], door: [53, 29, 330, 483] }
});

export function fitHubBitmapV72(sourceBounds, box) {
  const [x, y, right, bottom] = sourceBounds;
  const scale = Math.min(box.w / (right - x), box.h / (bottom - y));
  const w = (right - x) * scale;
  const h = (bottom - y) * scale;
  return { x: box.x + (box.w - w) / 2, y: box.y + box.h - h, w, h };
}
