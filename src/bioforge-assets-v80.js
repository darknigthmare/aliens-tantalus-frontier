const freezeAsset = (asset) => Object.freeze({
  ...asset,
  status: 'ready',
  atlas: asset.atlas ? Object.freeze({
    ...asset.atlas,
    sequence: Object.freeze([...asset.atlas.sequence])
  }) : null
});

export const BIOFORGE_SCALE_REFERENCE_V80 = Object.freeze({
  viewportHeightPx: 720,
  marineHeightPx: 92,
  perspective: 'strict-side-on-orthographic'
});

export const BIOFORGE_ASSETS_V80 = Object.freeze({
  far: freezeAsset({
    id: 'bioforge-far-industrial-shell-v80',
    runtimeId: 'bioforge.v80.layer.far',
    role: 'far',
    src: '/assets/openai/bioforge/v80/far/bioforge-far-industrial-shell-v80.png',
    width: 1920,
    height: 720,
    alphaPolicy: 'opaque',
    perspective: 'strict-side-on-orthographic',
    marineHeightPx: 92,
    sha256: '9cdf6371ff690f333567522354f53ceda740667b84b8d163461bd51e9690497d'
  }),
  mid: freezeAsset({
    id: 'bioforge-mid-process-modules-v80',
    runtimeId: 'bioforge.v80.layer.mid',
    role: 'mid',
    src: '/assets/openai/bioforge/v80/mid/bioforge-mid-process-modules-v80.png',
    width: 1920,
    height: 720,
    alphaPolicy: 'transparent',
    perspective: 'strict-side-on-orthographic',
    marineHeightPx: 92,
    sha256: 'e59b737619fa4c39bd7c4c381fb390c6d30abf093a77bddb83b2331df15fa0d8'
  }),
  foreground: freezeAsset({
    id: 'bioforge-foreground-service-frame-v80',
    runtimeId: 'bioforge.v80.layer.foreground',
    role: 'foreground',
    src: '/assets/openai/bioforge/v80/foreground/bioforge-foreground-service-frame-v80.png',
    width: 1920,
    height: 720,
    alphaPolicy: 'transparent',
    perspective: 'strict-side-on-orthographic',
    marineHeightPx: 92,
    sha256: '4527da5d4884bfcae99e11eab62ef932827f8962ba746c340989b82b9b5e222d'
  }),
  printer: freezeAsset({
    id: 'bioforge-tissue-printer-v80',
    runtimeId: 'bioforge.v80.prop.tissue-printer',
    role: 'prop',
    src: '/assets/openai/bioforge/v80/props/bioforge-tissue-printer-v80.png',
    width: 1024,
    height: 1024,
    alphaPolicy: 'transparent',
    perspective: 'strict-side-on-orthographic',
    marineHeightPx: 92,
    gameplayHeightPx: Object.freeze([155, 185]),
    sha256: '17e7c5751c7bd98ae9af5b79f91ef07e5ca6ddc57a58e9c0e918205e38cb5add'
  }),
  bulkhead: freezeAsset({
    id: 'bioforge-bulkhead-cycle-v80',
    runtimeId: 'bioforge.v80.prop.bulkhead-cycle',
    role: 'prop-atlas',
    src: '/assets/openai/bioforge/v80/props/bioforge-bulkhead-cycle-v80.png',
    width: 2048,
    height: 1024,
    alphaPolicy: 'transparent',
    perspective: 'strict-side-on-orthographic',
    marineHeightPx: 92,
    sha256: 'a261312df67e995374d5caca87d328376fcf4ad7b56cbbbf611a830a5dc02d34',
    atlas: {
      columns: 4,
      rows: 2,
      frames: 8,
      frameWidth: 512,
      frameHeight: 512,
      playback: 'row-major',
      sequence: ['sealed', 'unlock', 'open-20', 'open-45', 'open', 'close-45', 'close-15', 'sealed-pulse']
    }
  }),
  purge: freezeAsset({
    id: 'bioforge-purge-cycle-v80',
    runtimeId: 'bioforge.v80.vfx.purge-cycle',
    role: 'vfx-atlas',
    src: '/assets/openai/bioforge/v80/vfx/bioforge-purge-cycle-v80.png',
    width: 2048,
    height: 1024,
    alphaPolicy: 'transparent',
    perspective: 'strict-side-on-orthographic',
    marineHeightPx: 92,
    sha256: '5416450f03e1173ec41ac330e61972d96a9920fb2253f968cc1c5e3eec6701cf',
    atlas: {
      columns: 4,
      rows: 2,
      frames: 8,
      frameWidth: 512,
      frameHeight: 512,
      playback: 'row-major',
      sequence: ['pressure-puff', 'rising-jet', 'expanding-plume', 'peak', 'wide-dissipation', 'broken-wisps', 'residual-mist', 'trace']
    }
  })
});

export const BIOFORGE_ASSET_LIST_V80 = Object.freeze(Object.values(BIOFORGE_ASSETS_V80));

export const BIOFORGE_ASSETS_BY_ID_V80 = Object.freeze(Object.fromEntries(
  BIOFORGE_ASSET_LIST_V80.map((asset) => [asset.id, asset])
));

export const getBioforgeAssetV80 = (keyOrId) => BIOFORGE_ASSETS_V80[keyOrId]
  ?? BIOFORGE_ASSETS_BY_ID_V80[keyOrId]
  ?? null;
