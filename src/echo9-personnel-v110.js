/** Cosmetic identification only. Never changes an operator's identity or combat stats. */
export const ECHO9_MARKINGS_V110 = Object.freeze([
  { id: 'standard', label: 'Sans marquage', color: '#95b09f', accent: '#d8e5db' },
  { id: 'olive', label: 'Olive de bord', color: '#9fb978', accent: '#e0e7bc' },
  { id: 'amber', label: 'Ambre', color: '#e5ae58', accent: '#ffe2a4' },
  { id: 'ice', label: 'Bleu arctique', color: '#6bbcd0', accent: '#b8edf1' },
  { id: 'rust', label: 'Rouille', color: '#c87861', accent: '#efb49c' },
  { id: 'ivory', label: 'Ivoire', color: '#e0dfcc', accent: '#ffffff' }
].map(Object.freeze));

const markingsById = new Map(ECHO9_MARKINGS_V110.map(entry => [entry.id, entry]));
export function sanitizeEcho9AppearanceV110(raw) {
  if (!raw || raw.schema !== 110 || !markingsById.has(raw.markingId)) return null;
  return { schema: 110, markingId: raw.markingId };
}
export function getEcho9MarkingV110(member) {
  const appearance = sanitizeEcho9AppearanceV110(member?.appearanceV110);
  return markingsById.get(appearance?.markingId || 'standard');
}
export function setEcho9MarkingV110(save, crewId, markingId) {
  if (save?.strategy?.currentOperation) throw new Error('Le manifeste est verrouillé pendant une opération.');
  if (save?.needsPlayerCreationV84 || save?.onboardingV84 && save.onboardingV84.phase !== 'complete') throw new Error('Terminez votre accueil avant de modifier les tenues.');
  const member = save?.crew?.find(entry => entry.id === crewId);
  if (!member) throw new Error('Membre Echo-9 inconnu.');
  if (member.status === 'deceased') throw new Error('Le dossier du mémorial ne peut pas être modifié.');
  if (!markingsById.has(markingId)) throw new Error('Marquage inconnu.');
  // The enclosing V85 transaction owns persistence and rollback, not the UI.
  member.appearanceV110 = { schema: 110, markingId };
  return { crewId, markingId, cosmeticOnly: true };
}

/** Two small identification strips on the existing uniform, not a replacement sprite. */
export function drawEcho9MarkingV110(ctx, actor, appearance = actor?.appearanceV110) {
  const validated = sanitizeEcho9AppearanceV110(appearance);
  if (!ctx || !actor || !validated || validated.markingId === 'standard'
    || actor.inVehicle || actor.alive === false || actor.downed
    || ![actor.x, actor.y, actor.w, actor.h].every(Number.isFinite) || actor.w <= 0 || actor.h <= 0) return false;
  const marking = markingsById.get(validated.markingId);
  const width = Math.max(3, Math.min(9, actor.w * .15));
  const height = Math.max(2, Math.min(4, actor.h * .035));
  const facing = actor.facing < 0 || actor.facing == null && actor.vx < 0 ? -1 : 1;
  const x = actor.x + actor.w * (facing < 0 ? .28 : .57);
  const y = actor.y + actor.h * .30;
  ctx.save();
  ctx.fillStyle = marking.color; ctx.fillRect(x, y, width, height);
  ctx.fillStyle = marking.accent; ctx.fillRect(x, y + height + 1, width, Math.max(1, height * .45));
  ctx.restore();
  return true;
}

const fold = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr');
export function selectEcho9PersonnelV110(members = [], { query = '', species = 'all', sort = 'name' } = {}) {
  const term = fold(query).trim();
  const result = members.filter(member => member && (species === 'all' || member.species === species)
    && (!term || fold([member.name, member.callsign, member.role, member.specialty, member.background?.activity,
      member.recruitV85?.background?.summary].filter(Boolean).join(' ')).includes(term)));
  return result.sort((a, b) => {
    const byName = String(a.name || '').localeCompare(String(b.name || ''), 'fr');
    if (sort === 'health') return (Number(a.health) || 0) - (Number(b.health) || 0) || byName;
    if (sort === 'stress' || sort === 'fatigue') return (Number(b[sort]) || 0) - (Number(a[sort]) || 0) || byName;
    return byName;
  });
}

export function echo9SignalV110(member, key) {
  const value = Math.round(Math.max(0, Math.min(100, Number(member?.[key]) || 0)));
  const synthetic = member?.species === 'synthetic';
  const labels = synthetic ? { health: 'Intégrité', stress: 'Charge', fatigue: 'Usure' }
    : { health: 'Santé', stress: 'Stress', fatigue: 'Fatigue' };
  const danger = key === 'health' ? 100 - value : value;
  return { key, label: labels[key] || key, value, danger, tone: danger >= 65 ? 'critical' : danger >= 35 ? 'caution' : 'nominal',
    amplitude: Math.max(1, value * .16),
    active: member?.status !== 'deceased' && Number(member?.health ?? 100) > 0 };
}
