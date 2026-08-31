// Review playback only; never changes sprites or production acceptance.
export function playbackFrame(elapsedMs, fps, count, loop) {
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0 || !Number.isFinite(fps) || fps <= 0 || !Number.isInteger(count) || count <= 0) throw new Error('Invalid playback clock');
  const absolute = Math.floor(elapsedMs * fps / 1000);
  return { frame: loop ? absolute % count : Math.min(absolute, count - 1), ended: !loop && absolute >= count };
}

export function frameRectangle(index, grid) {
  if (!Number.isInteger(index) || index < 0 || index >= grid.columns * grid.rows) throw new Error('Frame outside atlas');
  return { x: index % grid.columns * grid.cellWidth, y: Math.floor(index / grid.columns) * grid.cellHeight, width: grid.cellWidth, height: grid.cellHeight };
}
