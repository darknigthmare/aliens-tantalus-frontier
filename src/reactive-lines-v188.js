// V188 — reactive crew lines after an operation (bible §53.6, rule §56.4):
// mission failed, colonist dead, returned injured. One line per trigger and
// profile (human / synthetic) in French and English; the same line is not
// repeated by the same member within 3 game days.

export const REACTIVE_TRIGGERS_V188 = Object.freeze(['mission-failed', 'colonist-dead', 'returned-injured']);
export const REACTIVE_REPEAT_DAYS_V188 = 3;
const MAX_MEMORY = 96;

export const REACTIVE_LINES_V188 = Object.freeze({
  'mission-failed': Object.freeze({
    human: Object.freeze({ fr: 'On est rentrés, pas tous entiers. La prochaine fois, on part avec un meilleur plan.',
      en: 'We made it back, not all in one piece. Next time we go out with a better plan.' }),
    synthetic: Object.freeze({ fr: 'Objectif non atteint. J’ai consigné les écarts ; ils serviront au prochain briefing.',
      en: 'Objective not met. I have logged the deviations; they will serve the next briefing.' })
  }),
  'colonist-dead': Object.freeze({
    human: Object.freeze({ fr: 'Il y avait des gens là-bas. Quelqu’un devra écrire leurs noms.',
      en: 'There were people down there. Someone has to write down their names.' }),
    synthetic: Object.freeze({ fr: 'Le registre de la colonie a perdu des entrées. Je les conserve, elles ne disparaîtront pas une seconde fois.',
      en: 'The colony register lost entries. I am keeping them; they will not vanish a second time.' })
  }),
  'returned-injured': Object.freeze({
    human: Object.freeze({ fr: 'Ça tire, mais je tiens. Gardez-moi une place à l’infirmerie.',
      en: 'It stings, but I’m holding. Save me a bed in the infirmary.' }),
    synthetic: Object.freeze({ fr: 'Dommages structurels relevés. Je reste opérationnel après contrôle technique.',
      en: 'Structural damage recorded. I remain operational after a technical check.' })
  })
});

export function createReactiveLinesV188() { return { schema: 188, said: [] }; }

export function normalizeReactiveLinesV188(raw) {
  const base = createReactiveLinesV188();
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.said)) return base;
  base.said = raw.said.filter(entry => entry && typeof entry.crewId === 'string' && REACTIVE_TRIGGERS_V188.includes(entry.trigger)
    && Number.isSafeInteger(entry.day) && entry.day >= 0).map(({ crewId, trigger, day }) => ({ crewId: crewId.slice(0, 80), trigger, day }))
    .slice(-MAX_MEMORY);
  return base;
}

/** Pure: which triggers fired, from the save before and after resolution. */
export function detectReactiveTriggersV188(before, after, operation, { success = true } = {}) {
  const triggers = [];
  const squad = new Set(Array.isArray(operation?.crewIds) ? operation.crewIds : []);
  if (!success) triggers.push({ trigger: 'mission-failed' });
  const worldId = operation?.worldId;
  const popBefore = Number(before?.galaxy?.worldState?.[worldId]?.population), popAfter = Number(after?.galaxy?.worldState?.[worldId]?.population);
  if (Number.isFinite(popBefore) && Number.isFinite(popAfter) && popAfter < popBefore) triggers.push({ trigger: 'colonist-dead' });
  for (const member of Array.isArray(after?.crew) ? after.crew : []) {
    if (!squad.has(member.id)) continue;
    const previous = before?.crew?.find?.(entry => entry.id === member.id);
    if (member.status === 'injured' && previous?.status !== 'injured') triggers.push({ trigger: 'returned-injured', crewId: member.id });
  }
  return triggers;
}

/** Mutates save.reactiveLinesV188; returns the lines to show (≤ 1 per trigger). */
export function selectReactiveLinesV188(save, triggers, { operation = null, isSynthetic = () => false, language = 'fr' } = {}) {
  const memory = normalizeReactiveLinesV188(save?.reactiveLinesV188), day = Number(save?.clock?.day) || 0, lines = [];
  const squad = (Array.isArray(operation?.crewIds) ? operation.crewIds : [])
    .map(id => save?.crew?.find?.(member => member.id === id)).filter(member => member && member.status !== 'deceased');
  for (const { trigger, crewId } of triggers) {
    const candidates = crewId ? squad.filter(member => member.id === crewId) : squad;
    const speaker = candidates.find(member => !memory.said.some(entry => entry.crewId === member.id && entry.trigger === trigger
      && day - entry.day < REACTIVE_REPEAT_DAYS_V188));
    if (!speaker) continue;
    const profile = isSynthetic(speaker) ? 'synthetic' : 'human';
    lines.push(Object.freeze({ crewId: speaker.id, trigger, profile, text: REACTIVE_LINES_V188[trigger][profile][language === 'en' ? 'en' : 'fr'] }));
    memory.said.push({ crewId: speaker.id, trigger, day }); memory.said = memory.said.slice(-MAX_MEMORY);
  }
  if (save) save.reactiveLinesV188 = memory;
  return lines;
}

/** The member's reactive line still current (within the repeat window), as
 * shown again in the mess debrief topic. Returns null when none applies. */
export function currentReactiveLineV188(save, crewId, { synthetic = false, language = 'fr' } = {}) {
  const memory = normalizeReactiveLinesV188(save?.reactiveLinesV188), day = Number(save?.clock?.day) || 0;
  const entry = [...memory.said].reverse().find(said => said.crewId === crewId && day - said.day < REACTIVE_REPEAT_DAYS_V188);
  if (!entry) return null;
  return REACTIVE_LINES_V188[entry.trigger][synthetic ? 'synthetic' : 'human'][language === 'en' ? 'en' : 'fr'];
}
