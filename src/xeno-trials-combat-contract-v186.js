/** Shared native attack contract. Keep simulation and checkpoint admission on
 * the same values without importing the engine from progression. */
export const XENO_TRIALS_ATTACKS_V96 = Object.freeze({
  light: Object.freeze({ cost: 12, damage: 14, reach: 60, startup: .09, active: .08, recovery: .2, stun: .13, push: 15 }),
  heavy: Object.freeze({ cost: 25, damage: 28, reach: 86, startup: .23, active: .1, recovery: .39, stun: .3, push: 38 }),
  special: Object.freeze({ cost: 38, damage: 35, reach: 124, startup: .29, active: .12, recovery: .55, stun: .36, push: 48 }),
  low: Object.freeze({ cost: 17, damage: 17, reach: 63, startup: .15, active: .08, recovery: .24, stun: .16, push: 16, groundedOnly: true, contactBandV207: 'low' }),
  'anti-air': Object.freeze({ cost: 22, damage: 23, reach: 66, startup: .125, active: .1, recovery: .3, stun: .22, push: 24, groundedOnly: true, contactBandV207: 'anti-air' }),
  advance: Object.freeze({ cost: 18, damage: 22, reach: 72, startup: .14, active: .1, recovery: .33, stun: .21, push: 27, groundedOnly: true })
});
