import { EDITOR_BRUSH_MODES_V135 } from './editor-authoring-v135.js';
const MODES = Object.freeze({ paint: 'Pinceau', erase: 'Gomme', rectangle: 'Rectangle plein', fill: 'Remplissage' });
function element(documentRef, tag, text, attributes = {}) {
  const node = documentRef.createElement(tag); if (text !== undefined) node.textContent = text;
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
  if (tag === 'button' || tag === 'input') node.style.minHeight = '44px';
  return node;
}

export function mountEditorAuthoringUiV135(editor, { parent = editor.canvas.parentElement, getPersistenceStatus = () => null } = {}) {
  if (!parent?.ownerDocument) throw new TypeError('Le panneau éditeur nécessite un conteneur.');
  const documentRef = parent.ownerDocument;
  const root = element(documentRef, 'section', undefined, { 'data-editor-authoring-v135': '', 'aria-label': 'Outils de construction du niveau' });
  root.style.cssText = 'padding:.8rem;border:1px solid #395849;margin-bottom:.75rem;min-width:0';
  const tools = element(documentRef, 'div', undefined, { role: 'group', 'aria-label': 'Outil de dessin' });
  tools.style.cssText = 'display:flex;flex-wrap:wrap;gap:.5rem';
  const modeButtons = EDITOR_BRUSH_MODES_V135.map(mode => {
    const button = element(documentRef, 'button', MODES[mode], { type: 'button', class: 'button compact', 'data-editor-brush-v135': mode, 'aria-pressed': 'false' });
    button.addEventListener('click', () => editor.setBrushMode(mode)); tools.append(button); return button;
  });
  const dimensions = element(documentRef, 'form', undefined, { 'aria-label': 'Dimensions du niveau' });
  dimensions.style.cssText = 'display:flex;flex-wrap:wrap;gap:.65rem;align-items:end;margin:.75rem 0';
  const columnsLabel = element(documentRef, 'label', 'Colonnes '), rowsLabel = element(documentRef, 'label', 'Lignes ');
  const columns = element(documentRef, 'input', undefined, { type: 'number', min: 8, max: 128, step: 1, inputmode: 'numeric', required: '', 'data-editor-columns-v135': '', 'aria-label': 'Nombre de colonnes' });
  const rows = element(documentRef, 'input', undefined, { type: 'number', min: 8, max: 72, step: 1, inputmode: 'numeric', required: '', 'data-editor-rows-v135': '', 'aria-label': 'Nombre de lignes' });
  columns.style.cssText = rows.style.cssText = 'width:6rem;min-width:0;max-width:100%'; columnsLabel.append(columns); rowsLabel.append(rows);
  const resize = element(documentRef, 'button', 'Appliquer les dimensions', { type: 'submit', class: 'button compact', 'data-editor-resize-v135': '' });
  const cropLabel = element(documentRef, 'label'); cropLabel.style.cssText = 'display:flex;align-items:center;gap:.5rem;min-height:44px';
  const crop = element(documentRef, 'input', undefined, { type: 'checkbox', 'data-editor-crop-v135': '' });
  crop.style.cssText = 'width:1.25rem;height:1.25rem;min-width:0;min-height:0;padding:0;flex:0 0 auto';
  cropLabel.append(crop, element(documentRef, 'span', 'Autoriser la suppression des tuiles hors du nouveau cadre'));
  dimensions.append(columnsLabel, rowsLabel, resize, cropLabel);
  const status = element(documentRef, 'p', '', { role: 'status', 'aria-live': 'polite', 'data-editor-authoring-status-v135': '' });
  const spatial = element(documentRef, 'details', undefined, { 'data-editor-spatial-v136': '' });
  const spatialTitle = element(documentRef, 'summary', 'Dégagement et volumes physiques');
  spatialTitle.style.minHeight = '44px';
  const spatialToggleLabel = element(documentRef, 'label'); spatialToggleLabel.style.cssText = 'display:flex;align-items:center;gap:.5rem;min-height:44px';
  const spatialToggle = element(documentRef, 'input', undefined, { type: 'checkbox', 'data-editor-spatial-overlay-v136': '' });
  spatialToggle.style.cssText = 'width:1.25rem;height:1.25rem;min-width:0;min-height:0;padding:0;flex:0 0 auto';
  spatialToggleLabel.append(spatialToggle, element(documentRef, 'span', 'Afficher les silhouettes et encombrements réels'));
  const spatialNote = element(documentRef, 'p', '', { 'data-editor-spatial-note-v136': '' });
  const spatialIssues = element(documentRef, 'ul', undefined, { 'data-editor-spatial-issues-v136': '', 'aria-label': 'Points à vérifier dans le plan' });
  spatial.append(spatialTitle, spatialToggleLabel, spatialNote, spatialIssues);
  spatialToggle.addEventListener('change', () => editor.setSpatialOverlayV136(spatialToggle.checked));
  const help = element(documentRef, 'p', 'Un tracé = une annulation. Maj ou clic droit : gommer. Clavier sur la grille : flèches, Entrée/Espace pour poser, Suppr pour gommer, Ctrl/Cmd+Z pour annuler. Le playtest vérifie les déplacements réels.');
  help.className = 'hint';
  const helpId = `${editor.canvas.id || 'editor'}-authoring-help-v135`; help.id = helpId;
  const previousDescription = editor.canvas.getAttribute('aria-describedby') || '';
  editor.canvas.setAttribute('aria-describedby', `${previousDescription} ${helpId}`.trim());
  root.append(tools, dimensions, status, spatial, help); parent.insertBefore(root, editor.canvas);
  let destroyed = false, message = '';
  const refresh = () => {
    if (destroyed) return;
    const snapshot = editor.getSnapshot();
    for (const button of modeButtons) { const selected = button.dataset.editorBrushV135 === snapshot.brushMode; button.setAttribute('aria-pressed', String(selected)); button.classList.toggle('active', selected); }
    if (documentRef.activeElement !== columns) columns.value = String(snapshot.size[0]);
    if (documentRef.activeElement !== rows) rows.value = String(snapshot.size[1]);
    const persistence = getPersistenceStatus();
    const storage = persistence?.persisted === false ? ' · stockage local indisponible : exportez votre plan avant de quitter.' : '';
    status.textContent = `${message || `${snapshot.size[0]} × ${snapshot.size[1]} · ${snapshot.tiles.length} tuiles · ${MODES[snapshot.brushMode]}`} · curseur ${snapshot.cursor[0] + 1}, ${snapshot.cursor[1] + 1}${storage}`;
    const review = snapshot.spatialV136;
    spatialTitle.textContent = `Dégagement et volumes physiques${review.supported ? ` · ${review.issues.length} point(s) à vérifier` : ''}`;
    spatialToggle.disabled = !review.supported; spatialToggle.checked = review.visible;
    spatialNote.textContent = review.note;
    spatialIssues.replaceChildren(...review.issues.slice(0, 8).map(issue => element(documentRef, 'li', `Colonne ${issue.column + 1}, ligne ${issue.row + 1} : ${issue.message}`)));
    if (review.issues.length > 8) spatialIssues.append(element(documentRef, 'li', `${review.issues.length - 8} autre(s) point(s) signalé(s) sur la grille.`));
  };
  const unsubscribe = editor.subscribe(() => { message = ''; refresh(); });
  dimensions.addEventListener('submit', event => {
    event.preventDefault();
    try {
      editor.resize(Number(columns.value), Number(rows.value), { crop: crop.checked });
      message = 'Dimensions appliquées. Annuler restaure le cadre et toutes ses tuiles.'; crop.checked = false;
    } catch (cause) { message = cause.message; }
    refresh();
  });
  for (const input of [columns, rows]) input.addEventListener('input', () => { message = ''; });
  for (const button of modeButtons) button.addEventListener('click', () => { message = ''; refresh(); });
  refresh();
  return { refresh, destroy() { if (destroyed) return; destroyed = true; unsubscribe(); root.remove();
      if (previousDescription) editor.canvas.setAttribute('aria-describedby', previousDescription); else editor.canvas.removeAttribute('aria-describedby'); } };
}
