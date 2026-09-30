import { USER_SPECIMEN_GROUPS_V106, getSpecimenPlacementV106 } from './user-specimens-v106.js';

/** Isolated, interactive 2D specimen bench. Never mutates a save or combat registry.
 * Multiple cocoon views remain one specimen. No inferred hatch/evolution chain. */
export function createUserSpecimenBenchV106(documentRef) {
  const node = (tag, text) => {
    const element = documentRef.createElement(tag);
    if (text) element.textContent = text;
    return element;
  };
  const section = node('section'); section.id = 'user-specimen-bench-v106'; section.className = 'panel specimen-bench-v106';
  section.setAttribute('aria-label', 'Banc de confinement des imports');
  section.append(node('p', 'WEYLAND-YUTANI // OBSERVATION SOUS CONFINEMENT'), node('h3', 'Banc de confinement 2D'));
  section.append(node('p', 'Découpes natives intégrées au banc : œufs, cocons, parasites et équipements. Poses fixes, sans animation ni éclosion simulée. Les tailles affichées sont des réglages de présentation, pas des mesures canoniques.'));
  const controls = node('div'); controls.className = 'specimen-bench-v106__controls';
  const field = (label, control) => { const wrapper = node('label'); wrapper.append(node('span', label), control); controls.append(wrapper); return control; };
  const select = field('Spécimen ou équipement', node('select')); select.dataset.specimenSelect = 'true';
  for (const group of USER_SPECIMEN_GROUPS_V106) {
    const option = node('option', group.id === 'pack-v100-xeno-cocoon' ? 'Cocon — Romulus (3 vues)' : group.views[0].name); option.value = group.id; select.append(option);
  }
  const view = field('Vue conservée', node('select')); view.dataset.specimenView = 'true';
  const position = field('Position sur le banc', node('input')); position.type = 'range'; position.min = '0'; position.max = '100'; position.value = '50'; position.dataset.specimenPosition = 'true';
  const scan = node('button', 'Analyser le spécimen'); scan.type = 'button'; scan.className = 'button'; scan.dataset.specimenScan = 'true'; controls.append(scan);
  const reset = node('button', 'Recentrer'); reset.type = 'button'; reset.className = 'button'; controls.append(reset);
  section.append(controls);
  const canvas = node('canvas'); canvas.width = 800; canvas.height = 380; canvas.tabIndex = 0;
  canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', 'Banc 2D : utiliser les flèches pour déplacer le spécimen'); canvas.dataset.specimenCanvas = 'true';
  section.append(canvas);
  const status = node('p'); status.setAttribute('aria-live', 'polite'); status.dataset.specimenStatus = 'true'; section.append(status);
  const facts = node('p'); facts.dataset.specimenFacts = 'true'; section.append(facts);
  const note = node('p'); note.className = 'specimen-bench-v106__note'; section.append(note);
  const source = node('a', 'Ouvrir l’original conservé'); source.target = '_blank'; source.rel = 'noopener'; section.append(source);
  let art = null, image = null, serial = 0;
  const ctx = canvas.getContext('2d');
  function render() {
    if (!ctx || !art) return;
    const aquatic = art.role === 'aquatic-specimen';
    ctx.fillStyle = '#0a1b21'; ctx.fillRect(0, 0, 800, 380);
    ctx.strokeStyle = '#193a42'; ctx.lineWidth = 1;
    for (let x = 0; x <= 800; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 380); ctx.stroke(); }
    for (let y = 0; y <= 380; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(800, y); ctx.stroke(); }
    if (aquatic) { ctx.fillStyle = '#144b6155'; ctx.fillRect(12, 92, 776, 244); }
    ctx.strokeStyle = '#63bcb0'; ctx.beginPath(); ctx.moveTo(12, 336); ctx.lineTo(788, 336); ctx.stroke();
    ctx.fillStyle = '#b8ded8'; ctx.font = '12px monospace'; ctx.fillText(aquatic ? 'BASSIN // SPÉCIMEN AQUATIQUE' : 'BANC ISOLÉ // OBSERVATION', 18, 25);
    if (image) {
      const placement = getSpecimenPlacementV106(art, Number(position.value) / 100);
      ctx.drawImage(image, placement.x, placement.y, placement.width, placement.height);
      canvas.dataset.specimenBounds = JSON.stringify(placement.bounds);
      canvas.dataset.specimenRendered = art.referenceId;
    }
  }
  async function loadArt() {
    const group = USER_SPECIMEN_GROUPS_V106.find(entry => entry.id === select.value);
    art = group?.views.find(entry => entry.referenceId === view.value) || group?.views[0];
    if (!art) return;
    const token = ++serial; image = null; delete canvas.dataset.specimenRendered;
    canvas.dataset.specimenId = art.referenceId; canvas.dataset.specimenHabitat = art.role === 'aquatic-specimen' ? 'aquatic' : 'contained';
    source.href = art.sourcePath; note.textContent = art.reviewNote;
    facts.textContent = `${art.name} · ${art.lineage} · ${art.stage} · ${art.biology}`;
    status.textContent = 'Chargement de la découpe native…'; render();
    try {
      const loaded = new documentRef.defaultView.Image(); loaded.src = art.path; await loaded.decode();
      if (serial !== token) return;
      image = loaded; status.textContent = 'Spécimen prêt. Cliquer sur le banc ou utiliser les flèches pour le positionner.'; render();
    } catch {
      if (serial !== token) return;
      status.textContent = 'Découpe indisponible : aucun visuel de remplacement. L’original reste accessible.';
    }
  }
  function selectGroup() {
    const group = USER_SPECIMEN_GROUPS_V106.find(entry => entry.id === select.value);
    view.replaceChildren();
    for (const entry of group?.views || []) { const option = node('option', entry.name); option.value = entry.referenceId; view.append(option); }
    view.disabled = group?.views.length === 1;
    void loadArt();
  }
  select.addEventListener('change', selectGroup); view.addEventListener('change', () => { void loadArt(); });
  position.addEventListener('input', render);
  reset.addEventListener('click', () => { position.value = '50'; render(); });
  scan.addEventListener('click', () => {
    if (!art || !image) return;
    status.textContent = `Analyse : ${art.name}. Lignée fournie : ${art.lineage}. Stade fourni : ${art.stage}. Vue fixe ; aucune évolution ni parenté déduite. Original inchangé et variante séparée.`;
  });
  canvas.addEventListener('pointerdown', event => {
    const rect = canvas.getBoundingClientRect(); if (!rect.width) return;
    position.value = String(Math.round(100 * Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)))); render();
  });
  canvas.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    position.value = String(event.key === 'Home' ? 0 : event.key === 'End' ? 100 : Math.max(0, Math.min(100, Number(position.value) + (event.key === 'ArrowLeft' ? -3 : 3)))); render();
  });
  select.value = USER_SPECIMEN_GROUPS_V106[0]?.id || ''; selectGroup();
  return section;
}
