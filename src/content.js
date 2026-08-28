import { RELEASE as PREVIOUS_RELEASE } from './content-core-v50.js';

export * from './content-core-v50.js';

export const RELEASE = Object.freeze({
  ...PREVIOUS_RELEASE,
  version: '60.0.0',
  subtitle: 'Asset Completion Audit, Bitmap Vehicles & Validation Gates',
  sourceVersion: '51.0.0'
});
