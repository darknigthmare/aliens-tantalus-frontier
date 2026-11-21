import { XENO_TRIALS_PRIORITY_STAGES_V198 as stages } from '../src/xeno-trials-priority-stages-v198.js';
import { verifyXenoIndependentStageAdmissions } from './public-xeno-referenced-stage-admissions-v196.mjs';

export const PUBLIC_PRIORITY_STAGE_DIRECTORY_V198 = 'assets/openai/stages/xeno-trials-v198';
const assets = new Set(stages.flatMap(stage => [stage.backdrop.slice(1), stage.propsV194.path.slice(1)]));

export function publicXenoPriorityStagePathAdmissionV198(path, { directory = false } = {}) {
  if (path === PUBLIC_PRIORITY_STAGE_DIRECTORY_V198) return directory;
  if (!path.startsWith(PUBLIC_PRIORITY_STAGE_DIRECTORY_V198 + '/')) return null;
  return !directory && assets.has(path);
}

export function verifyXenoPriorityStageAdmissionsV198(root) {
  return verifyXenoIndependentStageAdmissions(root, stages, { directory: PUBLIC_PRIORITY_STAGE_DIRECTORY_V198,
    prefix: 'xt198-', count: 5 });
}
