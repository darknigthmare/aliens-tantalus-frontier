// Measured alpha silhouettes in the unchanged 1024px source PNGs (alpha >=16).
// A square registration preserves native aspect; all spherical layers then share
// one world-space limb instead of treating transparent padding as planet surface.
export const TITLE_SPHERE_REGISTRATION_V87 = Object.freeze(Object.fromEntries(Object.entries({
  'planet-01-acheron': { x: 74, y: 71.5, size: 876 },
  'planet-02-ceto-basin': { x: 62, y: 66, size: 887 },
  'planet-03-mire-9': { x: 105, y: 101.5, size: 820 },
  'atmosphere-01-ceto-cyan': { x: 137, y: 118, size: 791 },
  'atmosphere-02-acheron-storm': { x: 146.5, y: 110, size: 796 },
  'atmosphere-03-mire-9': { x: 118, y: 102.5, size: 805 },
  'clouds-01-acheron-storm': { x: 75.5, y: 65, size: 900 }
}).map(([id, bounds]) => [id, Object.freeze({ ...bounds, sourceSize: 1024 })])));

const ready = (asset) => Object.freeze({
  ...asset, status: 'ready', worldIds: Object.freeze(asset.worldIds ?? []),
  sphereRegistration: TITLE_SPHERE_REGISTRATION_V87[asset.id] || null
});

export const TITLE_SCENE_READY_ASSETS_V79 = Object.freeze([
  ready({ id: 'space-01-deep-frontier', runtimeId: 'title.v79.space.deep-frontier', role: 'space', layerHint: 'deep-space', src: '/assets/openai/ui/title/v79/space/space-01-deep-frontier.png', sha256: '5393ac4e5ef8900e0988e2585d808c54dbf227b2dda2b4febb7d268940734e8e' }),
  ready({ id: 'stars-01-distant-field', runtimeId: 'title.v79.stars.distant-field', role: 'stars', layerHint: 'stars-far', src: '/assets/openai/ui/title/v79/stars/stars-01-distant-field.png', sha256: '8c6c5915d3820c4ba80f1e072b97e0440bd0f2f230d09e15574affbbdc408b02' }),
  ready({ id: 'stars-02-near-sparks', runtimeId: 'title.v79.stars.near-sparks', role: 'stars', layerHint: 'stars-near', src: '/assets/openai/ui/title/v79/stars/stars-02-near-sparks.png', sha256: 'b6e4437713b73b10f61c74bd3a09fbf7b8384d496f72ddfbeec41aa6f2f51a75' }),
  ready({ id: 'nebula-01-cold-ion', runtimeId: 'title.v79.nebula.cold-ion', role: 'nebula', layerHint: 'frontier-nebula', src: '/assets/openai/ui/title/v79/nebula/nebula-01-cold-ion.png', sha256: 'a8289650791ebd4121f98ed3b2585c6ce709fc169ec7dc3e52f01f864249eb42' }),
  ready({ id: 'planet-01-acheron', runtimeId: 'title.v79.planet.acheron', role: 'planet', layerHint: 'frontier-world', worldIds: ['world-01-acheron-lv-426'], src: '/assets/openai/ui/title/v79/planet/planet-01-acheron.png', sha256: '22d356eddc04943096fe45e8dc9dfd9babe16e40bcdc747995c570a323cd64df' }),
  ready({ id: 'planet-02-ceto-basin', runtimeId: 'title.v79.planet.ceto-basin', role: 'planet', layerHint: 'frontier-world', worldIds: ['world-10-ceto'], src: '/assets/openai/ui/title/v79/planet/planet-02-ceto-basin.png', sha256: '3bfa14220945a74207b1f3fc48d1037fff7777b41e18eafd9742c36d990e6b17' }),
  ready({ id: 'planet-03-mire-9', runtimeId: 'title.v79.planet.mire-9', role: 'planet', layerHint: 'frontier-world', worldIds: ['world-26-mire-9'], src: '/assets/openai/ui/title/v79/planet/planet-03-mire-9.png', sha256: 'a7013c5e8eee60a0cdf7dd51f1df5559b16ff17a08ba940e1bffa0934967742e' }),
  ready({ id: 'atmosphere-01-ceto-cyan', runtimeId: 'title.v79.atmosphere.ceto-cyan', role: 'atmosphere', layerHint: 'terminator-glow', worldIds: ['world-10-ceto'], src: '/assets/openai/ui/title/v79/atmosphere/atmosphere-01-ceto-cyan.png', sha256: 'e91661ef0992eadc089bc40fdf3f26818caf22eba76c0f632903b1826a6b3438' }),
  ready({ id: 'atmosphere-02-acheron-storm', runtimeId: 'title.v79.atmosphere.acheron-storm', role: 'atmosphere', layerHint: 'terminator-glow', worldIds: ['world-01-acheron-lv-426'], src: '/assets/openai/ui/title/v79/atmosphere/atmosphere-02-acheron-storm.png', sha256: '441b710df11e886f18cd8c3312cea67b5b2e5ec4e9b3db23b808ec0ab9b0c11e' }),
  ready({ id: 'atmosphere-03-mire-9', runtimeId: 'title.v79.atmosphere.mire-9', role: 'atmosphere', layerHint: 'terminator-glow', worldIds: ['world-26-mire-9'], src: '/assets/openai/ui/title/v79/atmosphere/atmosphere-03-mire-9.png', sha256: 'cee4df004731ec0ccfdef587eb058d52de38eceb31cdb78286491b94846f6197' }),
  ready({ id: 'clouds-01-acheron-storm', runtimeId: 'title.v79.clouds.acheron-storm', role: 'clouds', layerHint: 'storm-bands', worldIds: ['world-01-acheron-lv-426'], src: '/assets/openai/ui/title/v79/clouds/clouds-01-acheron-storm.png', sha256: '701f0fedb272abdc09cbab54a1005e15de48e540906635f1c4fc862b27c17880' }),
  ready({ id: 'orbitals-01-tantalus-transport', runtimeId: 'title.v79.orbitals.tantalus-transport', role: 'orbitals', layerHint: 'high-orbit', src: '/assets/openai/ui/title/v79/orbitals/orbitals-01-tantalus-transport.png', sha256: '22fb27544fcbe3da7ea20755b8d9cc60a87187885b1b387027ce903e6a9586ef' }),
  ready({ id: 'traffic-01-utility-shuttle', runtimeId: 'title.v79.traffic.utility-shuttle', role: 'traffic', layerHint: 'near-traffic', src: '/assets/openai/ui/title/v79/traffic/traffic-01-utility-shuttle.png', sha256: 'e4027c5640cba94a0b8b743287eb4a8094baaee9e2f19bb5c975c056cf8b7a9e' }),
  ready({ id: 'debris-01-wreck-field', runtimeId: 'title.v79.debris.wreck-field', role: 'debris', layerHint: 'orbital-debris', src: '/assets/openai/ui/title/v79/debris/debris-01-wreck-field.png', sha256: '5e7b344698e62b306283dc804a74a28e887378cea94d32fc5e95a10bac922e0b' }),
  ready({ id: 'foreground-01-port-hull', runtimeId: 'title.v79.foreground.port-hull', role: 'foreground', layerHint: 'lens-foreground', src: '/assets/openai/ui/title/v79/foreground/foreground-01-port-hull.png', sha256: '9d817bd012c68cc7018bbcc70d92386e1c2124f5eaa65b8a6d31154b933f52a1' }),
  ready({ id: 'foreground-02-starboard-truss', runtimeId: 'title.v79.foreground.starboard-truss', role: 'foreground', layerHint: 'lens-foreground', src: '/assets/openai/ui/title/v79/foreground/foreground-02-starboard-truss.png', sha256: 'c477717021419e2d9826afb1db87021b9b4d749d8fc940ae6d972d85c461ce62' }),
  ready({ id: 'vfx-01-ion-exhaust', runtimeId: 'title.v79.vfx.ion-exhaust', role: 'vfx', layerHint: 'ion-pulse', src: '/assets/openai/ui/title/v79/vfx/vfx-01-ion-exhaust.png', sha256: 'c3889a6f9a3e31b00b0fb3f5e0372c4d27f0b0ad4559ab3b534690462aa076a7' }),
  ready({ id: 'vfx-03-scan-sweep', runtimeId: 'title.v79.vfx.scan-sweep', role: 'vfx', layerHint: 'sensor-sweep', src: '/assets/openai/ui/title/v79/vfx/vfx-03-scan-sweep.png', sha256: 'c993293be4a3ea73ec527fb1336e8d7765111fdc69e06ce9b128fa367f8cd86f' })
]);

// The original V79 receipt inventory stays immutable. V87 ships replace the
// generic transport at presentation time; they do not rewrite historical QA.
export const TITLE_RETIRED_ASSET_IDS_V87 = Object.freeze([
  'orbitals-01-tantalus-transport', 'traffic-01-utility-shuttle', 'vfx-01-ion-exhaust'
]);

const ship = (id, label, width, height, sha256, extra = {}) => ready({
  id: `orbitals-${id}-reference-v87`, runtimeId: `title.v87.ship.${id}`,
  role: 'orbitals', layerHint: 'high-orbit', shipId: id, label,
  src: `/assets/openai/ui/title/v87/orbitals/${id}-reference-v87.png`, sha256,
  sourceWidth: width, sourceHeight: height,
  hullRegistration: Object.freeze({ x: 0, y: 0, width, height, sourceWidth: width, sourceHeight: height }),
  ...extra
});

export const TITLE_SHIP_ASSETS_V87 = Object.freeze([
  ship('uss-sulaco', 'Classe Conestoga · Tantalus / Sulaco', 2170, 725, 'f5cb2d7e9e237721432b7ed27ff03e33819feaa670c5cffc440e1f78e1b59c75', {
    defaultShipName: 'TANTALUS', namePlate: Object.freeze({ x: 1300, y: 403, width: 275, height: 44 })
  }),
  ship('uscss-nostromo', 'USCSS Nostromo', 1507, 1044, 'ebdc19375284a7da72670df26553cf7da1cc30921ff362926505325b102cbc5d'),
  ship('narcissus', 'Narcissus', 1688, 932, 'e4b291d098a535f066793e838843f6ddc61c04baf7514e26662d319c1a3ea40c'),
  ship('ud4l-cheyenne', 'UD-4L Cheyenne', 1490, 1055, '1c3734596f13bef0117b4b3b718d09ab61333ccc417746f4c606f272e80b57e5'),
  ship('usm-auriga', 'USM Auriga', 1709, 920, 'd5997cb025b20f5e30f36b3bf322bd1355787b2455976cbc2e7e7721802b1252'),
  ship('prometheus', 'USCSS Prometheus', 1829, 860, '6e72cc1c599c08aa082622b8595bd3dc620293fea3a803bf79e6b2606d4f1c8f')
]);

export const TITLE_SCENE_READY_BY_ID_V79 = Object.freeze(Object.fromEntries(
  [...TITLE_SCENE_READY_ASSETS_V79, ...TITLE_SHIP_ASSETS_V87].map((asset) => [asset.id, asset])
));

export const titleSceneAssetsForWorldV79 = (worldId) => TITLE_SCENE_READY_ASSETS_V79.filter(
  (asset) => asset.worldIds.length === 0 || asset.worldIds.includes(worldId)
);
