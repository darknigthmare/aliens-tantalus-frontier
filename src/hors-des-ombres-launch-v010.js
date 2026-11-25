/** Launch the Marion only after the host has confirmed its own save. */
export const HORS_DES_OMBRES_PATH_V010 = '/dlc/alien-hors-des-ombres/index.html';
export const HORS_DES_OMBRES_EVENT_V010 = 'atf:hors-des-ombres:open';
export function launchHorsDesOmbresV010({ save, navigate = path => globalThis.location.assign(path) }) {
  if (typeof save !== 'function' || save() !== true) return false;
  navigate(HORS_DES_OMBRES_PATH_V010);
  return true;
}
