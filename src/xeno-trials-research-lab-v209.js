const scenario = (id, title, instruction, sites, options = {}) => Object.freeze({ id, title, instruction,
  sites: Object.freeze(sites), ...options });
export const XENO_TRIALS_RESEARCH_LABS_V209 = Object.freeze([
  scenario('OVOMORPH', 'Veille Ovomorph', 'Calibrez les trois balises. Traversez rapidement la zone centrale pour maintenir la veille.',
    [205, 398, 810], { art: '/assets/openai/sprites/normalized/enemy-profiles-v66/enemy-001-ovomorph.webp' }),
  scenario('ROMULUS-COCOON', 'Lecture du Cocon', 'Rejoignez chaque capteur et maintenez Interagir pendant sa fenêtre ouverte.',
    [230, 485, 760], { art: '/assets/openai/sprites/static-import-v106/xeno-cocoon.png' }),
  scenario('TADPOLE', 'Transit Tadpole', 'Ouvrez les trois sas depuis leurs consoles, puis attendez l’arrivée de l’écho au bout du circuit.',
    [236, 516, 746], { gates: Object.freeze([300, 580, 810]) })
]);
const labs = new Map(XENO_TRIALS_RESEARCH_LABS_V209.map(entry => [entry.id, entry]));
const HERTZ = 120, STEP = 1 / HERTZ, MAX_TICKS = 70 * HERTZ;
const SCAN_PERIOD = 264, DANGER_START = 408, DANGER_END = 592;
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
export const getXenoTrialsResearchLabAssetsV209 = () => XENO_TRIALS_RESEARCH_LABS_V209.flatMap(lab => lab.art ? [lab.art] : []);
export const normalizeXenoTrialsResearchLabProgressV209 = value => XENO_TRIALS_RESEARCH_LABS_V209
  .filter(entry => Array.isArray(value) && value.includes(entry.id)).map(entry => entry.id);

export function createXenoTrialsResearchLabV209(id) {
  const entry = labs.get(id);
  if (!entry) return null;
  return { id, stage: 0, tick: 0, remainder: 0, position: 95, echo: 65, stress: 0, work: 0,
    phase: 'active', reason: null, interactHeld: false, paused: false };
}

const scannerOpen = tick => tick % SCAN_PERIOD >= 58 && tick % SCAN_PERIOD < 176;
const userInZone = position => position > DANGER_START && position < DANGER_END;
const isNearSite = (lab, entry) => Math.abs(lab.position - entry.sites[lab.stage]) <= 35;
function finish(lab, phase, reason = null) { lab.phase = phase; lab.reason = reason; }

function stepLab(lab, entry, input) {
  lab.tick++;
  lab.position = clamp(lab.position + (Number(input.right === true) - Number(input.left === true)) * 2, 26, 974);
  const operating = input.interact === true && isNearSite(lab, entry);
  const justPressed = input.interact === true && !lab.interactHeld;
  lab.interactHeld = input.interact === true;
  if (lab.id === 'TADPOLE') {
    if (operating && justPressed) lab.stage++;
    const nextGate = entry.gates[lab.stage] ?? 976;
    lab.echo = Math.min(nextGate - 17, lab.echo + 1.15);
    if (lab.echo >= 944) finish(lab, 'complete');
  } else {
    let canSample = operating;
    if (lab.id === 'OVOMORPH') {
      lab.stress = clamp(lab.stress + (userInZone(lab.position) ? .67 : -.42), 0, 100);
      if (lab.stress === 100) { finish(lab, 'retry', 'wake'); return; }
    } else canSample &&= scannerOpen(lab.tick);
    lab.work = canSample ? lab.work + 1 : 0;
    if (lab.work >= (lab.id === 'OVOMORPH' ? 54 : 72)) {
      lab.work = 0;
      if (++lab.stage === entry.sites.length) finish(lab, 'complete');
    }
  }
  if (lab.phase === 'active' && lab.tick === MAX_TICKS) finish(lab, 'retry', 'timeout');
}

export function stepXenoTrialsResearchLabV209(lab, seconds, input = {}) {
  if (!labs.has(lab?.id) || lab.paused || lab.phase !== 'active' || !Number.isFinite(seconds) || seconds <= 0) return;
  const entry = labs.get(lab.id);
  lab.remainder += Math.min(seconds, .25);
  while (lab.remainder + 1e-10 >= STEP && lab.phase === 'active') {
    lab.remainder = Math.max(0, lab.remainder - STEP);
    stepLab(lab, entry, input);
  }
}

export function setXenoTrialsResearchLabPausedV209(lab, paused) {
  if (!labs.has(lab?.id) || lab.phase !== 'active') return false;
  lab.paused = paused === true;
  lab.remainder = 0;
  lab.interactHeld = false;
  return true;
}

export function getXenoTrialsResearchLabViewV209(lab) {
  const entry = labs.get(lab?.id);
  if (!entry) return null;
  return { id: lab.id, phase: lab.phase, reason: lab.reason, paused: lab.paused,
    position: lab.position, echo: lab.echo, stress: lab.stress, inZone: userInZone(lab.position),
    gatePositions: entry.gates || null, scannerOpen: scannerOpen(lab.tick),
    stage: lab.stage, sites: entry.sites, seconds: Math.max(0, Math.ceil((MAX_TICKS - lab.tick) / HERTZ)),
    work: lab.work / (lab.id === 'OVOMORPH' ? 54 : 72) };
}
