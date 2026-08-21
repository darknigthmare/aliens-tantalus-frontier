import { RELEASE as PREVIOUS_RELEASE } from './content-core-v50.js';

export * from './content-core-v50.js';

export const RELEASE = Object.freeze({
  ...PREVIOUS_RELEASE,
  version: '51.0.0',
  subtitle: 'Effective Gameplay Contract & Persistent Frontier Simulation',
  sourceVersion: '50.0.0'
});
