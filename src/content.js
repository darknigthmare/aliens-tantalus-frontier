import { RELEASE as PREVIOUS_RELEASE } from './content-core-v50.js';

export * from './content-core-v50.js';

export const RELEASE = Object.freeze({
  ...PREVIOUS_RELEASE,
  version: '59.0.0',
  subtitle: 'Physical Vehicle Access, Secured Cabins & Progressive Damage',
  sourceVersion: '51.0.0'
});
