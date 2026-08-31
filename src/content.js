import { RELEASE as PREVIOUS_RELEASE } from './content-core-v50.js';

export * from './content-core-v50.js';

export const RELEASE = Object.freeze({
  ...PREVIOUS_RELEASE,
  version: '65.0.0',
  subtitle: 'Facehugger 32 poses — sprite streaming & progression fixes',
  sourceVersion: '51.0.0'
});
