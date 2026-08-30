import { RELEASE as PREVIOUS_RELEASE } from './content-core-v50.js';

export * from './content-core-v50.js';

export const RELEASE = Object.freeze({
  ...PREVIOUS_RELEASE,
  version: '63.0.0',
  subtitle: 'ASSO-400 Harpoon Art Completion & Production Asset QA',
  sourceVersion: '51.0.0'
});
