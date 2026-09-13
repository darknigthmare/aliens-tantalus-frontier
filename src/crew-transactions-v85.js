// Publish a whole recruitment transaction only after durable storage accepts it.
// UI refresh belongs to the caller: rendering failure must never repeat payment.
export function commitCrewTransactionV85({ saveSystem, owner, ownsOwner, action, args = [], advanceTime, prepare }) {
  if (!ownsOwner(owner)) throw new Error('Le dossier appartient à une autre chronologie. Rouvrez Echo-9.');
  if (typeof action !== 'function') throw new Error('Action de personnel inconnue.');
  const candidate = structuredClone(saveSystem.data);
  const before = (candidate.clock.day - 1) * 24 + candidate.clock.hour;
  const result = action(candidate, ...args);
  const elapsed = Math.max(0, (candidate.clock.day - 1) * 24 + candidate.clock.hour - before);
  if (elapsed && advanceTime) advanceTime(candidate, elapsed);
  prepare?.(candidate);
  if (!ownsOwner(owner)) throw new Error('Le profil a changé pendant cette action.');
  saveSystem.commit(candidate);
  return result;
}
