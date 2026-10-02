/** Project transit pacing, not canon travel times or distances. Selection is free;
 * the charging sequence can be cancelled, and fuel is charged only on arrival.
 */
import { validateShipPortDepartureV87, migrateShipPortStateV87 } from './ship-port-state-v87.js';

export const JUMP_CHARGE_MS_V116 = 8000;
const pending = state => state?.phase === 'charging';
const finite = value => Number.isFinite(Number(value)) ? Number(value) : 0;

export function sanitizeJumpStateV116(candidate, worlds = []) {
  if (!candidate || candidate.schema !== 116 || !['charging', 'blocked', 'arrived', 'cancelled'].includes(candidate.phase)) return null;
  const known = id => typeof id === 'string' && worlds.some(world => world.id === id);
  if (!known(candidate.originWorldId) || !known(candidate.destinationId) || candidate.originWorldId === candidate.destinationId) return null;
  if (!Number.isSafeInteger(candidate.startedAt) || candidate.startedAt < 0 || !Number.isSafeInteger(candidate.readyAt)
    || candidate.readyAt !== candidate.startedAt + JUMP_CHARGE_MS_V116) return null;
  return { schema: 116, phase: candidate.phase, originWorldId: candidate.originWorldId, destinationId: candidate.destinationId,
    startedAt: candidate.startedAt, readyAt: candidate.readyAt,
    ...(typeof candidate.reason === 'string' ? { reason: candidate.reason.slice(0, 500) } : {}),
    ...(Number.isSafeInteger(candidate.completedAt) && candidate.completedAt >= candidate.readyAt ? { completedAt: candidate.completedAt } : {}),
    ...(candidate.phase === 'arrived' ? { fuel: Math.max(0, finite(candidate.fuel)) } : {}) };
}

export function isJumpChargingV116(save) { return pending(save.galaxy?.jumpV116); }
// worldId is also a mission theatre. A deployed squad must not silently move
// the ship: only hyperspace settlement changes its separate orbital location.
export function getShipWorldIdV116(save) { return save.galaxy?.shipWorldIdV116 ?? save.worldId; }

export function getJumpReadinessV115(save, destination, worlds, { settling = false } = {}) {
  const reasons = [];
  // Resolve the registered destination: caller metadata cannot forge a cheaper route.
  const canonical = worlds.find(world => world.id === destination?.id);
  if (!canonical) reasons.push('Destination inconnue');
  if (!worlds.some(world => world.id === getShipWorldIdV116(save))) reasons.push('Position orbitale inconnue');
  if (!save.galaxy?.unlockedWorldIds?.includes(destination?.id)) reasons.push('Route verrouillée');
  if (save.strategy?.currentOperation || save.scene === 'mission') reasons.push('Opération en cours');
  if (save.hub?.activeCrisis && save.hub.activeCrisis.resolved !== true) reasons.push('Crise à bord');
  if (save.hub?.infestationChain && save.hub.infestationChain.resolved !== true) reasons.push('Infestation à bord non résolue');
  if (save.bioforgeV80?.recovery?.purgeRequired === true
    || save.bioforgeV80?.activeSession && save.bioforgeV80.activeSession.phase !== 'return') reasons.push('Confinement Bioforge actif : retour et purge requis');
  if (finite(save.hub?.systems?.hull) < 30) reasons.push('Coque sous le seuil de sécurité');
  if (finite(save.hub?.systems?.power) < 35) reasons.push('Énergie insuffisante');
  if (save.hub?.systems?.oxygen !== undefined && finite(save.hub.systems.oxygen) < 35) reasons.push('Support-vie sous le seuil de sécurité');
  if (save.shipPortV1?.phase && !['undocked', 'departed'].includes(save.shipPortV1.phase)) reasons.push('Relais civil encore arrimé');
  const port = migrateShipPortStateV87(save.shipPortV1);
  if (port.schema !== 1 || port.quarantined.length) reasons.push('État du relais civil à vérifier');
  if (!validateShipPortDepartureV87(save).ok) reasons.push('Manifeste à bord incomplet : transferts à terminer');
  if (save.onboardingV84 && save.onboardingV84.phase !== 'complete') reasons.push('Accueil à bord incomplet');
  if (save.openingV88 && !['ready', 'complete'].includes(save.openingV88.phase)) reasons.push('Prise de poste incomplète');
  if (save.portMeridienV90 && save.openingV88?.phase === 'ready' && save.portMeridienV90.phase !== 'complete') reasons.push('Débarquement initial incomplet');
  if (!settling && isJumpChargingV116(save)) reasons.push('Préparation hyperspatiale déjà en cours');
  const fuel = 2 + Math.ceil(Math.max(0, finite(canonical?.danger)) / 3);
  if (finite(save.galaxy?.resources?.fuel) < fuel) reasons.push('Carburant insuffisant');
  if (destination?.id === getShipWorldIdV116(save)) reasons.push('Déjà en orbite');
  return { ready: reasons.length === 0, reasons, fuel };
}

export function prepareJumpV116(save, destination, worlds, now = Date.now()) {
  const readiness = getJumpReadinessV115(save, destination, worlds);
  if (!readiness.ready) throw new Error(readiness.reasons.join(' · '));
  if (!Number.isSafeInteger(now) || now < 0 || now > Number.MAX_SAFE_INTEGER - JUMP_CHARGE_MS_V116) throw new Error('Horloge de navigation invalide');
  const orbit = getShipWorldIdV116(save);
  save.galaxy.shipWorldIdV116 = orbit;
  save.galaxy.jumpV116 = { schema: 116, phase: 'charging', originWorldId: orbit,
    destinationId: destination.id, startedAt: now, readyAt: now + JUMP_CHARGE_MS_V116 };
  return { result: 'Préparation hyperspatiale lancée · départ dans 8 secondes · annulation possible.', fuel: readiness.fuel };
}

export function getJumpProgressV116(save, worlds, now = Date.now()) {
  const state = sanitizeJumpStateV116(save.galaxy?.jumpV116, worlds);
  if (!state) return null;
  const remainingMs = Math.max(0, state.readyAt - finite(now));
  return { ...state, remainingMs, progress: Math.max(0, Math.min(1, 1 - remainingMs / JUMP_CHARGE_MS_V116)) };
}

export function cancelJumpV116(save, worlds) {
  const state = sanitizeJumpStateV116(save.galaxy?.jumpV116, worlds);
  if (!state || !['charging', 'blocked'].includes(state.phase)) throw new Error('Aucun transit à annuler');
  save.galaxy.jumpV116 = { ...state, phase: 'cancelled' };
  return { result: 'Transit annulé · carburant conservé · position orbitale inchangée.' };
}

/** Settlement is called only after the persisted countdown. Recheck all gates
 * before any debit; repeat callbacks or a reload after arrival cannot spend twice.
 */
export function confirmJumpV115(save, destination, worlds, now = Date.now()) {
  const state = sanitizeJumpStateV116(save.galaxy?.jumpV116, worlds);
  if (!state || state.phase !== 'charging' || state.destinationId !== destination?.id) throw new Error('Aucune préparation active pour cette destination');
  if (!Number.isSafeInteger(now) || now < state.readyAt) throw new Error('Préparation hyperspatiale en cours');
  const readiness = getJumpReadinessV115(save, destination, worlds, { settling: true });
  if (state.originWorldId !== getShipWorldIdV116(save)) readiness.reasons.push('Position orbitale modifiée pendant la préparation');
  if (readiness.reasons.length) {
    save.galaxy.jumpV116 = { ...state, phase: 'blocked', reason: readiness.reasons.join(' · ') };
    return { result: `Transit suspendu : ${save.galaxy.jumpV116.reason}. Aucun carburant débité.`, status: 'blocked', fuel: 0 };
  }
  save.galaxy.resources.fuel -= readiness.fuel;
  save.worldId = destination.id;
  save.galaxy.shipWorldIdV116 = destination.id;
  save.galaxy.jumpV116 = { ...state, phase: 'arrived', completedAt: now, fuel: readiness.fuel };
  const canonical = worlds.find(world => world.id === destination.id);
  return { result: `Transit hyperspatial terminé : orbite de ${canonical.name}.`, status: 'arrived', fuel: readiness.fuel };
}
