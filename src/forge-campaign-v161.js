/** Local ordered Forge campaigns. Frozen authoring documents and boundary
 * progress live outside both the profile and the single playtest checkpoint. */
import { parseProject, decorative } from './forge-model-v130.js';
import { inspectForgeJourneyV141 } from './forge-journey-admission-v141.js';
import { reachableForgeRoomsV141 } from './forge-journey-v141.js';

export const FORGE_CAMPAIGN_KEY_V161 = 'atf:forge-campaign:v161';
export const FORGE_CAMPAIGN_LIMITS_V161 = Object.freeze({ stages: 16, bytes: 8 * 1024 * 1024 });
const clone = value => structuredClone(value);
const record = value => value && typeof value === 'object' && !Array.isArray(value);
const fail = message => { throw new Error(`Campagne Forge : ${message}`); };
const id = value => typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,119}$/.test(value);
const timestamp = value => Number.isSafeInteger(value) && value >= 0;
const bytes = value => new TextEncoder().encode(value).length;
const text = value => typeof value === 'string' && value.trim() && value.length <= 120 && !/[\u0000-\u001f\u007f]/.test(value);
const same = (a, b) => JSON.stringify(parseProject(a)) === JSON.stringify(parseProject(b));
function required(project) {
  const reached = new Set(reachableForgeRoomsV141(project));
  return project.rooms.filter(room => reached.has(room.id)).flatMap(room => room.cells
    .filter(cell => cell.type === 'objective' && !decorative(cell)).map(cell => cell.id));
}
function narrativeReceipt(project, states = []) {
  if (!Array.isArray(states) || states.length > 64) fail('reçu de récit invalide.');
  const seen = new Set();
  return states.map(state => {
    const cell = project.rooms.flatMap(room => room.cells).find(cell => cell.id === state?.cellId && cell.narrative);
    if (!cell || seen.has(cell.id) || !Array.isArray(state.history) || state.history.length > 8) fail('reçu de récit inconnu.');
    seen.add(cell.id);
    let next = cell.narrative.start;
    const history = state.history.map(entry => {
      const node = cell.narrative.nodes.find(node => node.id === next);
      const choice = node?.choices.find(choice => choice.id === entry?.choiceId && node.id === entry?.nodeId);
      if (!choice) fail('chemin de récit invalide.');
      next = choice.next;
      return { nodeId: node.id, choiceId: choice.id };
    });
    return { cellId: cell.id, history };
  });
}
export function parseForgeCampaignV161(raw) {
  if (typeof raw === 'string') {
    if (bytes(raw) > FORGE_CAMPAIGN_LIMITS_V161.bytes) fail('maximum 8 Mio.');
    try { raw = JSON.parse(raw); } catch { fail('données locales illisibles ; original conservé.'); }
  }
  if (!record(raw) || raw.schema !== 1 || !id(raw.id) || !text(raw.name) || !timestamp(raw.createdAt)
    || !Number.isSafeInteger(raw.revision) || raw.revision < 0 || !Array.isArray(raw.stages)
    || raw.stages.length < 2 || raw.stages.length > FORGE_CAMPAIGN_LIMITS_V161.stages) fail('séquence locale invalide.');
  let pending = false;
  const stages = raw.stages.map((stage, index) => {
    if (!record(stage) || stage.id !== `stage-${index + 1}` || !id(stage.workspaceProjectId)) fail('étape invalide.');
    const project = parseProject(stage.project), objectives = required(project);
    if (!objectives.length) fail('chaque étape exige un objectif accessible.');
    let result = null;
    if (stage.result !== null) {
      if (pending || !record(stage.result) || !timestamp(stage.result.completedAt) || stage.result.completedAt < raw.createdAt
        || !Array.isArray(stage.result.objectiveIds) || JSON.stringify(stage.result.objectiveIds) !== JSON.stringify(objectives)) fail('progression hors séquence.');
      result = { completedAt: stage.result.completedAt, objectiveIds: [...objectives], narrative: narrativeReceipt(project, stage.result.narrative) };
    } else pending = true;
    return { id: stage.id, workspaceProjectId: stage.workspaceProjectId, project, result };
  });
  const data = { schema: 1, id: raw.id, name: raw.name.trim(), createdAt: raw.createdAt, revision: raw.revision, stages };
  if (bytes(JSON.stringify(data)) > FORGE_CAMPAIGN_LIMITS_V161.bytes) fail('maximum 8 Mio.');
  return data;
}
export const forgeCampaignCursorV161 = campaign => campaign?.stages.findIndex(stage => stage.result === null) ?? -1;

export function createForgeCampaignV161(name, projects, { now = Date.now(), campaignId = `campaign-${globalThis.crypto.randomUUID()}` } = {}) {
  if (!Array.isArray(projects) || projects.length < 2 || projects.length > 16) fail('choisissez 2 à 16 projets dans l’ordre.');
  const campaign = parseForgeCampaignV161({ schema: 1, id: campaignId, name, createdAt: now, revision: 0,
    stages: projects.map((entry, index) => ({ id: `stage-${index + 1}`, workspaceProjectId: entry.id, project: entry, result: null })) });
  // Run the actual native admission before storing a campaign; no broken stage
  // is accepted merely because the preceding stage is playable.
  for (const stage of campaign.stages) {
    const report = inspectForgeJourneyV141(stage.project);
    if (!report.ok) fail(`${stage.project.name} : ${report.errors.join(' ')}`);
  }
  return campaign;
}

export class ForgeCampaignStoreV161 {
  constructor(storage, key = FORGE_CAMPAIGN_KEY_V161) {
    try { this.storage = storage === undefined ? globalThis.localStorage : storage; } catch { this.storage = null; }
    this.key = key; this.data = null; this.expectedRaw = null; this.error = ''; this.loaded = false;
  }
  load() {
    this.error = ''; this.data = null;
    try { this.expectedRaw = this.storage?.getItem(this.key) ?? null; this.data = this.expectedRaw === null ? null : parseForgeCampaignV161(this.expectedRaw); }
    catch (error) { this.error = error.message || 'Stockage indisponible.'; }
    this.loaded = true; return this.data;
  }
  assertCurrent() {
    if (!this.loaded) fail('rechargez la progression locale.');
    if (!this.storage || typeof this.storage.setItem !== 'function') fail('stockage indisponible ; progression conservée.');
    if (this.storage.getItem(this.key) !== this.expectedRaw) fail('un autre onglet a changé la campagne ; rechargez sa progression.');
  }
  write(candidate) {
    const data = parseForgeCampaignV161(candidate), serialized = JSON.stringify(data);
    this.assertCurrent();
    this.storage.setItem(this.key, serialized); // In-memory progress changes only after a confirmed write.
    this.expectedRaw = serialized; this.data = data; this.error = ''; return clone(data);
  }
  create(name, projects, options) {
    if (this.data || this.expectedRaw !== null || this.error) fail('exportez puis effacez la campagne locale avant d’en créer une autre.');
    return this.write(createForgeCampaignV161(name, projects, options));
  }
  clear() {
    this.assertCurrent(); this.storage.removeItem(this.key); this.expectedRaw = null; this.data = null; this.error = '';
  }
  export() { return this.expectedRaw; }
}

/** The owner is an actual engine AND its exact session. A checkpoint restore,
 * new playtest, newer store revision or other tab cannot finish an old stage. */
export class ForgeCampaignControllerV161 {
  constructor(store, { launch, getEngine, onChange = () => {}, onError = () => {} } = {}) {
    this.store = store; this.launch = launch; this.getEngine = getEngine; this.onChange = onChange; this.onError = onError; this.owner = null;
  }
  detach() { this.owner = null; this.onChange(); }
  launchCurrent() {
    this.store.assertCurrent();
    const campaign = this.store.data, index = forgeCampaignCursorV161(campaign);
    if (!campaign || index < 0) fail('aucune étape à lancer.');
    const stage = campaign.stages[index], report = inspectForgeJourneyV141(stage.project);
    if (!report.ok) fail(report.errors.join(' '));
    this.owner = null;
    const engine = this.launch(clone(stage.project));
    if (!engine?.forgeSessionV141 || !same(engine.forgeSessionV141.project, stage.project) || engine !== this.getEngine()) fail('le moteur n’a pas ouvert cette étape.');
    this.owner = { engine, session: engine.forgeSessionV141, campaignId: campaign.id, revision: campaign.revision, index };
    this.onChange(); return true;
  }
  completeNative(engine = this.getEngine()) {
    const owner = this.owner, campaign = this.store.data;
    if (!owner || engine !== owner.engine || engine !== this.getEngine() || engine.forgeSessionV141 !== owner.session
      || !campaign || campaign.id !== owner.campaignId || campaign.revision !== owner.revision
      || forgeCampaignCursorV161(campaign) !== owner.index) return false;
    const stage = campaign.stages[owner.index], session = owner.session;
    const objectives = required(stage.project);
    if (!same(session.project, stage.project) || !objectives.every(id => session.completedObjectives.includes(id))
      || (stage.project.kind === 'ship' ? session.complete !== true : engine.mission?.state !== 'complete')) return false;
    const candidate = clone(campaign);
    candidate.stages[owner.index].result = { completedAt: Math.max(campaign.createdAt, Date.now()), objectiveIds: objectives,
      narrative: narrativeReceipt(stage.project, session.narrativeV156 || []) };
    candidate.revision++;
    try { this.store.write(candidate); }
    catch (error) { this.onError(error.message); throw error; }
    this.owner = null; this.onChange(); return true;
  }
}
