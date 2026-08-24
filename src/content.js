import { RELEASE as PREVIOUS_RELEASE } from './content-core-v50.js';

export * from './content-core-v50.js';

export const RELEASE = Object.freeze({
  ...PREVIOUS_RELEASE,
  version: '56.0.0',
  subtitle: 'Runtime Art Truth & Dedicated Equipment Atlases',
  sourceVersion: '51.0.0'
});
