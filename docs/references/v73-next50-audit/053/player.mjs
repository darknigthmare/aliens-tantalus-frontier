import { playbackFrame, frameRectangle } from '../../v66-batch-002-player/timeline.mjs';
import { clipScaleSummary } from '../../v66-batch-002-player/calibration.mjs';

const profileId = 'enemy-053-albino-ovomorph';
const elements = Object.fromEntries(['clip', 'speed', 'facing', 'play', 'restart', 'previous', 'next', 'status', 'stage', 'details', 'poses', 'metadata'].map((id) => [id, document.getElementById(id)]));
const tiles = [];
let metadata, atlas, selectedClip, frame = 0, elapsed = 0, lastTime = null, playing = false;
function pause() { playing = false; elements.play.textContent = 'Lire'; }
function paint(canvas, index) {
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  if (!atlas) return;
  const source = frameRectangle(index, metadata.grid);
  const mirrored = elements.facing.value === '-1';
  context.imageSmoothingEnabled = false;
  context.save();
  if (mirrored) { context.translate(256, 0); context.scale(-1, 1); }
  context.drawImage(atlas, source.x, source.y, source.width, source.height, 0, 0, 256, 256);
  context.restore();
  const x = mirrored ? 256 - metadata.pivot.x : metadata.pivot.x;
  const y = metadata.pivot.y;
  context.strokeStyle = '#5eedc0'; context.beginPath();
  context.moveTo(x - 5, y); context.lineTo(x + 5, y); context.moveTo(x, y - 5); context.lineTo(x, y + 5); context.stroke();
}
function render() {
  if (!selectedClip) return;
  paint(elements.stage, selectedClip.frames[frame]);
  Object.assign(elements.stage.dataset, { frame: String(frame), clip: selectedClip.id, profile: profileId });
  tiles.forEach((canvas, index) => { paint(canvas, selectedClip.frames[index]); canvas.classList.toggle('active', index === frame); });
  elements.details.textContent = `Albino Ovomorph\n${selectedClip.id} · pose${frame + 1}/8 · ${selectedClip.fps}fps · ${selectedClip.loop ? 'boucle' : 'fin maintenue'}\nAncrages : ${metadata.physicalAnchorReview?.status}\n${clipScaleSummary(metadata, selectedClip.id)}\nStatut : ${metadata.acceptanceStatus}\nNon intégré par cette page.`;
}
function selectClip() {
  pause(); frame = 0; elapsed = 0; lastTime = null;
  selectedClip = metadata.clips.find((clip) => clip.id === elements.clip.value);
  render();
}
elements.clip.addEventListener('change', selectClip);
elements.facing.addEventListener('change', render);
elements.play.addEventListener('click', () => { if (playing) pause(); else { playing = true; lastTime = null; elements.play.textContent = 'Pause'; } });
elements.restart.addEventListener('click', () => { frame = 0; elapsed = 0; lastTime = null; render(); });
for (const [id, delta] of [['previous', -1], ['next', 1]]) elements[id].addEventListener('click', () => { pause(); frame = (frame + delta + 8) % 8; elapsed = frame * 1000 / selectedClip.fps; render(); });
document.addEventListener('visibilitychange', () => { lastTime = null; });
function tick(time) {
  if (playing && selectedClip && !document.hidden) {
    if (lastTime !== null) elapsed += Math.min(time - lastTime, 250) * Number(elements.speed.value);
    const next = playbackFrame(elapsed, selectedClip.fps, 8, selectedClip.loop);
    if (next.frame !== frame) { frame = next.frame; render(); }
    if (next.ended) pause();
  }
  lastTime = time; requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
try {
  const path = `/assets/openai/sprites/metadata/v66/${profileId}.json`;
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Métadonnées non disponibles : HTTP${response.status}`);
  metadata = await response.json();
  if (metadata.profileId !== profileId || metadata.frameCount !== 32 || metadata.clips.length !== 4 || metadata.grid.cellWidth !== 256 || metadata.grid.cellHeight !== 256) throw new Error('Contrat du profil incohérent');
  atlas = new Image(); atlas.src = '/' + metadata.normalized + '?sha=' + metadata.normalizedSha256; await atlas.decode();
  if (atlas.width !== 1024 || atlas.height !== 2048) throw new Error('Dimensions atlas incorrectes');
  elements.metadata.href = path;
  elements.clip.replaceChildren(...metadata.clips.map((clip) => new Option(clip.id, clip.id)));
  for (let index = 0; index < 8; index++) {
    const figure = document.createElement('figure'), canvas = document.createElement('canvas'), caption = document.createElement('figcaption');
    canvas.width = canvas.height = 256; caption.textContent = `Pose${index + 1}`; figure.append(canvas, caption); elements.poses.append(figure); tiles.push(canvas);
  }
  for (const id of ['play', 'restart', 'previous', 'next']) elements[id].disabled = false;
  selectClip(); elements.status.textContent = `${profileId} :32 poses chargées depuis l’atlas signé.`;
} catch (error) { elements.status.textContent = error.message; elements.status.dataset.error = 'true'; }
