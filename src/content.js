import { RELEASE as PREVIOUS_RELEASE } from './content-core-v50.js';

export * from './content-core-v50.js';

export const RELEASE = Object.freeze({
  ...PREVIOUS_RELEASE,
  version: '54.0.0',
  subtitle: 'Manifest-Driven Squad & Multiroute Frontier Worlds',
  sourceVersion: '51.0.0'
});
