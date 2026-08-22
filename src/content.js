import { RELEASE as PREVIOUS_RELEASE } from './content-core-v50.js';

export * from './content-core-v50.js';

export const RELEASE = Object.freeze({
  ...PREVIOUS_RELEASE,
  version: '55.0.0',
  subtitle: 'Dedicated Sprite Wave & Modular Dropship Hangar',
  sourceVersion: '51.0.0'
});
