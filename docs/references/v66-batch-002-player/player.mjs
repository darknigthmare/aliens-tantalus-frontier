import { playbackFrame, frameRectangle } from './timeline.mjs';

const element = (id) => document.getElementById(id);
const controls = Object.fromEntries(['profile','clip','speed','facing','play','restart','previous','next','status','details','stage','poses','source','metadata'].map((id) => [id, element(id)]));
let jobs = [], job = null, metadata = null, atlas = null, selectedClip = null;
let frame = 0, elapsed = 0, lastTime = null, playing = false, revision = 0;
const tiles = [];

function status(text, error = false) { controls.status.textContent = text; controls.status.dataset.error = String(error); }
function buttons(ready) { for (const id of ['clip','play','restart','previous','next']) controls[id].disabled = !ready; }
function pause() { playing = false; controls.play.textContent = 'Lire'; }
function paint(canvas, index, markers) {
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  if (!atlas || !metadata) return;
  const source = frameRectangle(index, metadata.grid);
  const scale = canvas.width / source.width;
  const mirrored = controls.facing.value === '-1';
  context.imageSmoothingEnabled = false;
  context.save();
  if (mirrored) { context.translate(canvas.width, 0); context.scale(-1, 1); }
  context.drawImage(atlas, source.x, source.y, source.width, source.height, 0, 0, canvas.width, canvas.height);
  context.restore();
  if (markers) {
    const x = (mirrored ? source.width - metadata.pivot.x : metadata.pivot.x) * scale;
    const y = metadata.pivot.y * scale;
    context.strokeStyle = '#55dabb'; context.beginPath();
    context.moveTo(x - 7, y); context.lineTo(x + 7, y); context.moveTo(x, y - 7); context.lineTo(x, y + 7); context.stroke();
  }
}
function render() {
  if (!selectedClip || !metadata) return;
  paint(controls.stage, selectedClip.frames[frame], true);
  controls.stage.dataset.frame = String(frame);
  controls.stage.dataset.clip = selectedClip.id;
  controls.stage.dataset.profile = job.profileId;
  tiles.forEach((tile, index) => { paint(tile, selectedClip.frames[index], true); tile.classList.toggle('active', index === frame); });
  controls.details.textContent = `${job.name}\n${selectedClip.id} · pose ${frame + 1}/${selectedClip.frames.length} · ${selectedClip.fps} fps · ${selectedClip.loop ? 'boucle' : 'fin maintenue'}\nAncrages : ${metadata.physicalAnchorReview?.status || 'pending'}\nÉchelle commune : ${metadata.scale}\nStatut : ${metadata.acceptanceStatus} — non intégré par cette page`;
}
function selectClip() {
  if (!metadata) return;
  pause(); frame = 0; elapsed = 0; lastTime = null;
  selectedClip = metadata.clips.find((entry) => entry.id === controls.clip.value);
  controls.source.href = '/' + job.clips.find((entry) => entry.id === selectedClip.id).sourcePath;
  render();
}
async function selectProfile() {
  const current = ++revision;
  pause(); buttons(false); selectedClip = null; metadata = null; atlas = null;
  const requestedJob = jobs.find((entry) => entry.profileId === controls.profile.value);
  for (const canvas of [controls.stage, ...tiles]) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  controls.details.textContent = ''; controls.source.removeAttribute('href'); controls.metadata.removeAttribute('href');
  status('Chargement du candidat…');
  try {
    const response = await fetch('/' + requestedJob.metadataPath, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Métadonnées indisponibles : HTTP ${response.status}`);
    const nextMetadata = await response.json();
    if (nextMetadata.profileId !== requestedJob.profileId || nextMetadata.frameCount !== requestedJob.clips.length * 8) throw new Error('Identité ou nombre de poses incohérent');
    const nextAtlas = new Image(); nextAtlas.src = '/' + requestedJob.normalizedPath + '?sha=' + nextMetadata.normalizedSha256;
    await nextAtlas.decode();
    if (current !== revision) return;
    if (nextAtlas.naturalWidth !== nextMetadata.grid.columns * nextMetadata.grid.cellWidth || nextAtlas.naturalHeight !== nextMetadata.grid.rows * nextMetadata.grid.cellHeight) throw new Error('Dimensions atlas incohérentes');
    job = requestedJob; metadata = nextMetadata; atlas = nextAtlas;
    controls.clip.replaceChildren(...metadata.clips.map((entry) => new Option(entry.id, entry.id)));
    controls.metadata.href = '/' + job.metadataPath;
    buttons(true); selectClip(); status(`${job.profileId} : ${metadata.frameCount} poses chargées. Revue artistique requise.`);
  } catch (error) { if (current === revision) { status(error.message, true); controls.stage.getContext('2d').clearRect(0, 0, 512, 512); } }
}
for (let index = 0; index < 8; index++) {
  const figure = document.createElement('figure'); const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 256; canvas.setAttribute('aria-label', `Pose ${index + 1}`);
  const label = document.createElement('figcaption'); label.textContent = `Pose ${index + 1}`;
  figure.append(canvas, label); controls.poses.append(figure); tiles.push(canvas);
}
controls.profile.addEventListener('change', selectProfile);
controls.clip.addEventListener('change', selectClip);
controls.facing.addEventListener('change', render);
controls.play.addEventListener('click', () => { if (!selectedClip) return; if (playing) pause(); else { playing = true; lastTime = null; controls.play.textContent = 'Pause'; } });
controls.restart.addEventListener('click', () => { frame = 0; elapsed = 0; lastTime = null; render(); });
for (const [id, delta] of [['previous', -1], ['next', 1]]) controls[id].addEventListener('click', () => { pause(); frame = (frame + delta + selectedClip.frames.length) % selectedClip.frames.length; elapsed = frame * 1000 / selectedClip.fps; render(); });
document.addEventListener('visibilitychange', () => { lastTime = null; });
function tick(time) {
  if (playing && selectedClip && !document.hidden) {
    if (lastTime !== null) elapsed += Math.min(time - lastTime, 250) * Number(controls.speed.value);
    const next = playbackFrame(elapsed, selectedClip.fps, selectedClip.frames.length, selectedClip.loop);
    if (next.frame !== frame) { frame = next.frame; render(); }
    if (next.ended) pause();
  }
  lastTime = time; requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
try {
  const response = await fetch('../V66_ENEMY_BATCH_QUEUE.json', { cache: 'no-store' });
  if (!response.ok) throw new Error('File de production indisponible');
  const queue = await response.json(); jobs = queue.jobs.filter((entry) => entry.batchId === 'batch-002');
  controls.profile.replaceChildren(...jobs.map((entry) => new Option(`${entry.profileId} · ${entry.name}`, entry.profileId)));
  await selectProfile();
} catch (error) { status(error.message, true); }
