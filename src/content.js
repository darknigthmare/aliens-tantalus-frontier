import { RELEASE as PREVIOUS_RELEASE } from './content-core-v50.js';

export * from './content-core-v50.js';

export const RELEASE = Object.freeze({
  ...PREVIOUS_RELEASE,
  version: '64.0.0',
  subtitle: 'Newborn, Offspring & Predalien — Exact Enemy Animation Completion',
  sourceVersion: '51.0.0'
});
