const freezeAssetV81 = (asset) => Object.freeze({
  ...asset,
  status: 'ready',
  atlas: asset.atlas ? Object.freeze({ ...asset.atlas, sequence: Object.freeze([...asset.atlas.sequence]) }) : null
});

export const PROVING_GROUND_SCALE_REFERENCE_V81 = Object.freeze({
  viewportHeightPx: 720,
  marineHeightPx: 92,
  perspective: 'strict-side-on-orthographic'
});

export const PROVING_GROUND_ASSETS_V81 = Object.freeze({
  target: freezeAssetV81({
    id: 'proving-ground-target-v81',
    runtimeId: 'hub.proving-ground.v81.target',
    role: 'prop-atlas',
    src: '/assets/openai/hub/proving-ground/v81/proving-ground-target-cycle-v81.png',
    width: 2048,
    height: 1024,
    alphaPolicy: 'transparent',
    perspective: 'strict-side-on-orthographic',
    marineHeightPx: 92,
    gameplayHeightPx: Object.freeze([92, 126]),
    sha256: '96d34adc91a8a5310b9cc8c57f0bc402cb1c8e04f3acde3309bc1f274a8ad8a6',
    atlas: {
      columns: 4,
      rows: 2,
      frames: 8,
      frameWidth: 512,
      frameHeight: 512,
      playback: 'row-major',
      sequence: ['stowed', 'rise-25', 'rise-50', 'ready', 'impact', 'damaged', 'fold', 'stowed-hit']
    }
  }),
  impact: freezeAssetV81({
    id: 'proving-ground-impact-v81',
    runtimeId: 'hub.proving-ground.v81.impact',
    role: 'vfx-atlas',
    src: '/assets/openai/hub/proving-ground/v81/proving-ground-impact-cycle-v81.png',
    width: 2048,
    height: 1024,
    alphaPolicy: 'transparent',
    perspective: 'strict-side-on-orthographic',
    marineHeightPx: 92,
    sha256: '1bb000c29718c54b72159d178c9a53fcf6f59149655ec7d906e826be0215df37',
    atlas: {
      columns: 4,
      rows: 2,
      frames: 8,
      frameWidth: 512,
      frameHeight: 512,
      playback: 'row-major',
      sequence: ['contact', 'spark', 'burst', 'bloom', 'fragments', 'embers', 'smoke', 'trace']
    }
  }),
  console: freezeAssetV81({
    id: 'proving-ground-console-v81',
    runtimeId: 'hub.proving-ground.v81.console',
    role: 'prop',
    src: '/assets/openai/hub/proving-ground/v81/proving-ground-range-console-v81.png',
    width: 1024,
    height: 1024,
    alphaPolicy: 'transparent',
    perspective: 'strict-side-on-orthographic',
    marineHeightPx: 92,
    gameplayHeightPx: Object.freeze([118, 148]),
    sha256: '20e3a8412f1be182198d2cf3e49f8dcb07f1a33517073fb6482404bfcd88bbe8'
  })
});

export const PROVING_GROUND_ASSET_LIST_V81 = Object.freeze(Object.values(PROVING_GROUND_ASSETS_V81));

export function getProvingGroundAssetV81(keyOrId) {
  return PROVING_GROUND_ASSETS_V81[keyOrId]
    || PROVING_GROUND_ASSET_LIST_V81.find((asset) => asset.id === keyOrId || asset.runtimeId === keyOrId)
    || null;
}
