import { installShipModule as installCoreShipModule } from './advanced-systems-core.js';

export * from './advanced-systems-core.js';

export function installShipModule(save, moduleId) {
  return { ok: true, ...installCoreShipModule(save, moduleId) };
}
