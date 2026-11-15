// V188 — travel time of a hyperspace jump (bible §13.2; owner Q21: a fixed cost
// per jump, in fuel and in days, shown before departure). The fuel rule stays
// the one of `galaxy-jump-v115.js`; this module only adds the strategic days
// spent in hypersleep. They are added to the clock when the arrival is settled,
// inside the same timed mutation, so the existing elapsed-time simulation
// (`advanceGalaxy` through `simulateElapsed`) lets the worlds left behind evolve.
// A reload after arrival cannot charge the days twice: the jump receipt
// (`galaxy.jumpV116`, phase `arrived`) is the only trigger and it is read once.

const t = (fr, en) => Object.freeze({ fr, en });

// [PROPOSÉ] « un trajet entre systèmes prend des semaines » (§13.2): 14 days, the same for every jump.
export const JUMP_TRAVEL_DAYS_V188 = 14;
export const JUMP_TRAVEL_HOURS_V188 = JUMP_TRAVEL_DAYS_V188 * 24;

const TEXT = Object.freeze({
  route: t('Route calculée · {fuel} unités de carburant · {days} jours en hypersommeil · séquence de 8 secondes · annulation possible',
    'Route plotted · {fuel} fuel units · {days} days in hypersleep · 8-second sequence · can be cancelled'),
  arrived: t('{days} jours en hypersommeil : les mondes laissés derrière ont continué sans le Tantalus.',
    '{days} days in hypersleep: the worlds left behind went on without the Tantalus.')
});
const fill = (text, values) => text.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));

/** Cost shown before departure (Q21). */
export function jumpTravelCostV188(readiness) {
  return Object.freeze({ fuel: Math.max(0, Number(readiness?.fuel) || 0), days: JUMP_TRAVEL_DAYS_V188, hours: JUMP_TRAVEL_HOURS_V188 });
}
export function jumpRouteTextV188(readiness, language = 'fr') {
  const cost = jumpTravelCostV188(readiness);
  return fill(TEXT.route[language === 'en' ? 'en' : 'fr'], cost);
}
export function jumpArrivalTextV188(language = 'fr') {
  return fill(TEXT.arrived[language === 'en' ? 'en' : 'fr'], { days: JUMP_TRAVEL_DAYS_V188 });
}

/** Mutates the candidate save after `confirmJumpV115` returned 'arrived'. Returns the hours added (0 otherwise). */
export function applyJumpTravelTimeV188(save, settlement) {
  if (settlement?.status !== 'arrived' || save?.galaxy?.jumpV116?.phase !== 'arrived' || !save.clock) return 0;
  if (save.galaxy.jumpV116.travelDaysV188 !== undefined) return 0;
  const total = (save.clock.day - 1) * 24 + save.clock.hour + JUMP_TRAVEL_HOURS_V188;
  save.clock.day = Math.floor(total / 24) + 1; save.clock.hour = Math.round((total % 24) * 100) / 100;
  save.galaxy.jumpV116 = { ...save.galaxy.jumpV116, travelDaysV188: JUMP_TRAVEL_DAYS_V188 };
  return JUMP_TRAVEL_HOURS_V188;
}
