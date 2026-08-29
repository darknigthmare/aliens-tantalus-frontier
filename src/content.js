import { RELEASE as PREVIOUS_RELEASE } from './content-core-v50.js';

export * from './content-core-v50.js';

export const RELEASE = Object.freeze({
  ...PREVIOUS_RELEASE,
  version: '61.0.0',
  subtitle: 'Cinematic Title, Physical Hub Stations & OpenAI Art Pass',
  sourceVersion: '51.0.0'
});
