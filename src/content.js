import { RELEASE as PREVIOUS_RELEASE } from './content-core-v50.js';

export * from './content-core-v50.js';

export const RELEASE = Object.freeze({
  ...PREVIOUS_RELEASE,
  version: '62.0.0',
  subtitle: 'Physical Hub, Vent Traversal, Mission Insertion & Causal Campaign',
  sourceVersion: '51.0.0'
});
