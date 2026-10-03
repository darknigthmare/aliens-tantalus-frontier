// Scenery only: the physics plane remains V105 world coordinates. Foreground
// details are restricted below the contact line so low attacks stay readable.
export const XENO_TRIALS_ARENA_LAYERS_V119 = Object.freeze([
  { id: 'sky', parallax: .02 }, { id: 'distant-architecture', parallax: .1 },
  { id: 'middle-architecture', parallax: .23 }, { id: 'near-background', parallax: .42 },
  { id: 'gameplay', parallax: 1 }, { id: 'atmosphere', parallax: .66 }, { id: 'foreground', parallax: 1.16 }
].map(Object.freeze));

export function drawXenoTrialsArenaLayersV119(context, stage, images, camera, tick = 0) {
  const floor = camera.floor, offset = camera.center - 500;
  context.save();
  context.fillStyle = stage.background; context.fillRect(0, 0, 1000, 560);
  const backdrop = images.get(stage.backdrop);
  if (backdrop?.naturalWidth > 0 && backdrop?.naturalHeight > 0) {
    const factor = Math.max(1150 / backdrop.naturalWidth, floor / backdrop.naturalHeight);
    const width = backdrop.naturalWidth * factor, height = backdrop.naturalHeight * factor;
    context.drawImage(backdrop, (1000 - width) / 2 - offset * .02, (floor - height) / 2, width, height);
  }
  const layerRect = (coefficient, spacing, width, height, y, alpha) => {
    context.globalAlpha = alpha; context.strokeStyle = stage.accent; context.lineWidth = 2;
    const start = -spacing - ((offset * coefficient) % spacing);
    for (let x = start; x < 1000 + spacing; x += spacing) context.strokeRect(x, y, width, height);
  };
  layerRect(.1, 230, 155, floor * .52, floor * .22, .12);
  layerRect(.23, 180, 110, floor * .7, floor * .16, .16);
  layerRect(.42, 320, 16, floor, 0, .25);
  context.globalAlpha = 1;
  context.fillStyle = '#06101930'; context.fillRect(0, 0, 1000, floor);
  context.fillStyle = stage.floor; context.fillRect(0, floor, 1000, 560 - floor);
  context.fillStyle = stage.accent; context.fillRect(0, floor, 1000, 2);
  context.strokeStyle = '#bccdd4'; context.globalAlpha = .12;
  for (let x = -150 - offset % 100; x < 1200; x += 100) {
    context.beginPath(); context.moveTo(x, floor + 3); context.lineTo(x - 70, 560); context.stroke();
  }
  context.restore();
}

/** The two final layers are painted after the gameplay plane, before its HUD. */
export function drawXenoTrialsArenaOverlayV119(context, stage, camera, tick = 0) {
  const offset = camera.center - 500;
  context.save();
  // Suspended atmosphere, deliberately low-opacity and never an opaque front wall.
  context.fillStyle = stage.accent; context.globalAlpha = .14;
  for (let i = 0; i < 9; i++) {
    const x = ((i * 137 + tick * .035 - offset * .66) % 1100 + 1100) % 1100;
    context.fillRect(x, 140 + i * 23, 2, 2);
  }
  context.globalAlpha = .32; context.fillStyle = '#02070b';
  for (let x = -160 - (offset * 1.16) % 330; x < 1160; x += 330) context.fillRect(x, 540, 180, 20);
  context.restore();
}
