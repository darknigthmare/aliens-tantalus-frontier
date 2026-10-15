import { assertEditorDimensionsV135 } from './editor-authoring-v135.js';

export function editorSelectionV140(from, to = from) {
  if (![from, to].every(point => Array.isArray(point) && point.length === 2 && point.every(Number.isInteger))) throw new Error('Sélection hors grille.');
  return { left: Math.min(from[0], to[0]), top: Math.min(from[1], to[1]), right: Math.max(from[0], to[0]), bottom: Math.max(from[1], to[1]) };
}

export function editorSelectionTilesV140(tiles, selection) {
  if (!selection) return [];
  return [...tiles].filter(([position]) => {
    const [x, y] = position.split(':').map(Number);
    return x >= selection.left && x <= selection.right && y >= selection.top && y <= selection.bottom;
  });
}

/** Plan the entire operation before changing any tile, including insertion order.
 * Forge consumes the first spawn/objective, so moving them must retain priority. */
export function planEditorModuleV140(tiles, size, selection, destination, mode) {
  const [columns, rows] = assertEditorDimensionsV135(...size);
  if (!['move', 'copy'].includes(mode)) throw new Error('Opération de sélection invalide.');
  if (!selection || !Object.values(selection).every(Number.isInteger)
    || selection.left < 0 || selection.top < 0 || selection.right < selection.left || selection.bottom < selection.top
    || selection.right >= columns || selection.bottom >= rows
    || !Array.isArray(destination) || destination.length !== 2 || !destination.every(Number.isInteger)) throw new Error('Sélection ou destination hors grille.');
  const chosen = editorSelectionTilesV140(tiles, selection);
  if (!chosen.length) throw new Error('La sélection ne contient aucune tuile.');
  const dx = destination[0] - selection.left, dy = destination[1] - selection.top;
  const nextSelection = { left: selection.left + dx, right: selection.right + dx, top: selection.top + dy, bottom: selection.bottom + dy };
  if (nextSelection.left < 0 || nextSelection.top < 0 || nextSelection.right >= columns || nextSelection.bottom >= rows) throw new Error('Le module dépasse le plan. Choisissez une destination plus éloignée du bord.');
  const sourceKeys = new Set(chosen.map(([key]) => key));
  const shifted = chosen.map(([key, type]) => {
    const [x, y] = key.split(':').map(Number); return [`${x + dx}:${y + dy}`, type];
  });
  if (shifted.some(([key]) => tiles.has(key) && !(mode === 'move' && sourceKeys.has(key)))) throw new Error('Destination occupée : aucune tuile n’a été déplacée ou remplacée.');
  const translated = new Map(chosen.map(([key], index) => [key, shifted[index]]));
  const result = mode === 'copy' ? new Map([...tiles, ...shifted])
    : new Map([...tiles].map(entry => translated.get(entry[0]) || entry));
  return { tiles: result, selection: nextSelection, count: chosen.length };
}
