import { RELEASE as PREVIOUS_RELEASE } from './content-core-v50.js';

export * from './content-core-v50.js';

export const RELEASE = Object.freeze({
  ...PREVIOUS_RELEASE,
  version: '66.0.0',
  subtitle: 'Lot ennemi 001 — cinq profils, animations et éclosion physique',
  sourceVersion: '51.0.0'
});
