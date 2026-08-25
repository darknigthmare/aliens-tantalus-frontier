import { RELEASE as PREVIOUS_RELEASE } from './content-core-v50.js';

export * from './content-core-v50.js';

export const RELEASE = Object.freeze({
  ...PREVIOUS_RELEASE,
  version: '58.0.0',
  subtitle: 'Room Coherence, Reciprocal Doors & Zoned Runtime Art',
  sourceVersion: '51.0.0'
});
