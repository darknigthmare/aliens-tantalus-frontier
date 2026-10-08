import { getXenoTrialsArtV96, getXenoTrialsFighterV96 } from './xeno-trials-data-v96.js';
import { getEnemyDisplayDimensionsV110 } from './enemy-display-scale-v110.js';
import { getEnemyPhysicalSizeV100 } from './enemy-physical-size-v100.js';

export const XENO_TRIALS_PIXELS_PER_METER_V119 = 90;
// These are simulation estimates, not newly certified canon measurements.
const referenceIds = Object.freeze({ warrior: 'enemy-005-warrior', runner: 'enemy-006-runner', queen: 'enemy-008-queen',
  'crusher-acm': 'enemy-009-crusher', predalien: 'castes-game_predalien_avp2_primal_hunt' });

/** A single world conversion. Undefined biological heights retain the existing
 * authored posture ratio, clearly identified as an unverified simulation estimate. */
export function getXenoTrialsPhysicalScaleV119(id, variant = null) {
  const definition = getXenoTrialsFighterV96(id), art = getXenoTrialsArtV96(id, variant);
  const visual = getEnemyDisplayDimensionsV110(art);
  if (!definition || !visual) return null;
  const inheritedReference = definition.importRevision === 123
    ? referenceIds[definition.tuningCounterpartFighterId] : null;
  const referenceId = referenceIds[id] || inheritedReference || art.legacyCounterpartId || art.alteredOf || definition.profileId;
  const candidate = getEnemyPhysicalSizeV100(referenceId);
  const candidateHeight = candidate?.axis?.startsWith('vertical') && candidate.targetMeters > 0 ? candidate.targetMeters : null;
  const heightMeters = candidateHeight || visual.visibleHeight / 70;
  const factor = heightMeters * XENO_TRIALS_PIXELS_PER_METER_V119 / visual.visibleHeight;
  return Object.freeze({ ...visual, width: visual.width * factor, height: visual.height * factor,
    visibleWidth: visual.visibleWidth * factor, visibleHeight: heightMeters * XENO_TRIALS_PIXELS_PER_METER_V119,
    heightMeters, lengthMeters: visual.visibleWidth * factor / XENO_TRIALS_PIXELS_PER_METER_V119,
    pixelsPerMeter: XENO_TRIALS_PIXELS_PER_METER_V119, groundPivot: visual.bottom,
    sourceConfidence: candidateHeight ? 'conversation-estimate-unverified' : 'authored-posture-estimate-unverified',
    referenceStatus: candidateHeight ? 'estimated' : 'to-define', canonStatus: 'not-certified', canonVerified: false });
}
