const ready = (asset) => Object.freeze({ ...asset, status: 'ready', worldIds: Object.freeze(asset.worldIds ?? []) });

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

export const TITLE_SCENE_READY_BY_ID_V79 = Object.freeze(Object.fromEntries(
  TITLE_SCENE_READY_ASSETS_V79.map((asset) => [asset.id, asset])
));

export const titleSceneAssetsForWorldV79 = (worldId) => TITLE_SCENE_READY_ASSETS_V79.filter(
  (asset) => asset.worldIds.length === 0 || asset.worldIds.includes(worldId)
);
