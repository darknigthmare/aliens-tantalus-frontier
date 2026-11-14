// V188 (owner decision, 2026-11-14: "short labels + tap for details").
// On a phone the 64 full world names overlapped on the star map. Narrow
// screens show a short code per world on a snapped chart grid (each cell keeps
// a 44 px touch target) and open the world detail as a bottom sheet. Desktop
// keeps the spiral positions and full names. Pure helpers, no DOM, no save.

export const GALAXY_PHONE_QUERY_V188 = '(max-width: 760px)';
export const GALAXY_PHONE_COLUMNS_V188 = 7;

const words = text => String(text || '').split(/[\s/]+/).filter(Boolean);
const letters = token => token.replace(/[^\p{L}]/gu, '');

function baseCode(base) {
  // "Acheron / LV-426" → the designation after the slash.
  const part = base.includes('/') ? base.split('/').pop().trim() : base.trim();
  const tokens = words(part);
  const numbered = tokens.findIndex(token => /\d/.test(token));
  if (numbered >= 0) {
    const token = tokens[numbered];
    const digits = token.replace(/\D/g, '');
    const own = letters(token);
    const alpha = own || letters(tokens[numbered - 1] || '');
    const prefix = alpha === alpha.toUpperCase() && alpha.length <= 4 ? alpha : alpha.slice(0, 3);
    return (prefix + digits).toUpperCase();
  }
  if (tokens.length === 1) return letters(tokens[0]).slice(0, 3).toUpperCase();
  return (letters(tokens[0]).slice(0, 1) + letters(tokens[1]).slice(0, 2)).toUpperCase();
}

/** Short code of a world name: "Acheron / LV-426 — Prime" → "LV426·P". */
export function worldShortCodeV188(name) {
  const [base, qualifier] = String(name || '').split(/\s+—\s+/);
  const code = baseCode(base || '') || '?';
  const suffix = qualifier ? letters(qualifier).slice(0, 1).toUpperCase() : '';
  return suffix ? `${code}·${suffix}` : code;
}

/**
 * Snap spiral positions (percent of the map) to a phone chart grid.
 * Inner worlds are placed first, each in the free cell nearest to its spiral
 * position, so the rough geography survives and no two buttons share a cell.
 * @param {{id:string,left:number,top:number}[]} points
 * @returns {{cells: Map<string,{col:number,row:number}>, columns:number, rows:number}}
 */
export function snapWorldsToPhoneGridV188(points, columns = GALAXY_PHONE_COLUMNS_V188) {
  const rows = Math.max(1, Math.ceil(points.length / columns) + (points.length > columns ? 1 : 0));
  const taken = new Set(), cells = new Map();
  for (const point of points) {
    const x = (point.left / 100) * columns - .5, y = (point.top / 100) * rows - .5;
    let best = null;
    for (let row = 0; row < rows; row++) for (let col = 0; col < columns; col++) {
      if (taken.has(`${col}:${row}`)) continue;
      const distance = (col - x) ** 2 + (row - y) ** 2;
      if (!best || distance < best.distance) best = { col, row, distance };
    }
    if (!best) break;
    taken.add(`${best.col}:${best.row}`);
    cells.set(point.id, { col: best.col, row: best.row });
  }
  return { cells, columns, rows };
}
