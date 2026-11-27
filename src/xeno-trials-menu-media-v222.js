import { XENO_TRIALS_MENU_ATLASES_V222 } from './xeno-trials-menu-atlases-v222.js';

const indexed = Object.fromEntries(Object.entries(XENO_TRIALS_MENU_ATLASES_V222).map(([kind, atlas]) => [kind, {
  ...atlas, indices: new Map(atlas.ids.map((id, index) => [id, index])),
}]));

export function getXenoTrialsMenuTileV222(kind, id, variant = null) {
  const atlas = Object.hasOwn(indexed, kind) ? indexed[kind] : null;
  const key = variant ? `${id}:${variant}` : id;
  const index = atlas?.indices.get(key);
  if (index === undefined) return null;
  const rows = Math.ceil(atlas.ids.length / atlas.columns);
  return { path: atlas.path, width: atlas.width, height: atlas.height, columns: atlas.columns, rows,
    x: index % atlas.columns, y: Math.floor(index / atlas.columns) };
}

export const XENO_TRIALS_MENU_ASSETS_V222 = Object.freeze(Object.values(XENO_TRIALS_MENU_ATLASES_V222).map(atlas => atlas.path));
