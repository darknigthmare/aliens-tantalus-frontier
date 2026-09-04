import {
  RELEASE, CONTENT_COUNTS, WORLDS, CAMPAIGNS, WEAPONS, EQUIPMENT, ENEMIES, VEHICLES,
  CREW, COSTUMES, LEVEL_SEEDS, SHIP_MODULES, APEX_DOSSIERS, NEURO_XENO_PROFILES,
  validateContent
} from './content.js';
import {
  SaveSystem, COMMAND_ACTIONS, RESEARCH_PROJECTS, MAX_SQUAD_SIZE, canAfford,
  executeStrategicAction, completeResearchProject, getProcurementQuote, procureCatalogItem,
  equipCatalogItem, selectStrategicVehicle, assignCrewMember, treatCrewMember, applyCostume,
  getOperationBrief, beginOperation, resolveOperationDeployment, recordOperationFlag, recordOperationResumeState, resolveOperation
} from './save.js';
import {
  ensureAdvancedState, getShipModuleEffects, getModuleQuote, installShipModule, repairShipModule,
  selectNeuroProfile, clearNeuroProfile, selectApexDossier, getSelectedAdvancedLoadout,
  performDiplomacy
} from './advanced-systems.js';
import { advanceGalaxy, resolveHubCrisisEvent } from './world-crisis.js';
import { applyCampaignConsequence } from './campaign-consequences.js';
import { GameEngine } from './game-production-runtime.js';
import { buildMissionLevelV52 } from './mission-levels-v52.js';
import { HubGame, HUB_DECKS, HUB_NPC_ROSTER } from './hub-v62-runtime.js';
import { LevelEditor, TILE_TYPES } from './editor.js';
import { AudioDirector } from './audio.js';
import { resolveWeaponVisualProfileV63 } from './weapon-visual-runtime-v63.js';
import { getVehicleDeploymentGateV60 } from './vehicle-deployment-gates-v60.js';
import { TitleScreenController } from './title-screen-v61.js';
import { getExcelWeaponBridgeV63 } from './excel-content-bridge-v63.js';
import { ForgeSaveSystemV62 } from './forge-save-v62.js';
import { CatalogWorkbenchV62 } from './catalog-ui-v62.js';
import { beginNpcConversationV62, applyNpcDialogueChoiceV62 } from './npc-dialogue-v62.js';
import { createMissionInsertionV62, restoreMissionInsertionV62 } from './mission-insertion-v62.js';
import { MissionInsertionUiV62 } from './mission-insertion-ui-v62.js';
import {
  SPECIAL_OPERATIONS_V67, SPECIAL_OPERATION_COUNTS_V67, getSpecialOperationByCampaignIdV67
} from './special-operations-v67.js';
import {
  getNarrativeInvestigationV68, markNarrativeCollectableReadV68, recordNarrativeDecisionV68
} from './narrative-collectables-v68.js';
import { MissionArchiveOverlayV68, NarrativeArchivesUiV68, createOpenArchivesEventV68 } from './narrative-archives-ui-v68.js';

const byId = (id) => document.getElementById(id);
const all = (selector, root = document) => [...root.querySelectorAll(selector)];
const clone = (value) => structuredClone(value);
const clamp = (value, minimum = 0, maximum = 100) => Math.max(minimum, Math.min(maximum, Number(value) || 0));
const number = (value) => new Intl.NumberFormat('fr-FR').format(Math.round(Number(value) || 0));
const absoluteHours = (clock) => (Math.max(1, Number(clock?.day) || 1) - 1) * 24 + (Number(clock?.hour) || 0);
const title = (value = '') => String(value).replace(/(^|[- ])\w/g, (letter) => letter.toUpperCase());
const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const memoryStorage = (() => {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) };
})();

const saveSystem = new SaveSystem(globalThis.localStorage || memoryStorage);
saveSystem.load(1);
ensureAdvancedState(saveSystem.data);
const forgeSaveSystem = new ForgeSaveSystemV62(globalThis.localStorage || memoryStorage);
forgeSaveSystem.load();
const audio = new AudioDirector();
let editor = null;
let activeView = 'command';
let standaloneContext = null;
let forgePlaytest = null;
let activeWorld = WORLDS.find((world) => world.id === saveSystem.data.worldId) || WORLDS[0];
let deferredInstall = null;
let sessionStart = Date.now();
let lastHubStatus = null;
let activeHubStation = null;
let pendingHubInteraction = null;
let pendingNpcConversationV62 = null;
let armoryCatalogV62 = null;
let enemyCatalogV62 = null;
let vehicleCatalogV62 = null;
let missionInsertionUiV62 = null;
let pendingMissionLaunchV62 = null;
let narrativeArchivesUiV68 = null;
let missionNarrativeArchivesUiV68 = null;
let missionArchiveOverlayV68 = null;

const engine = new GameEngine(byId('game-canvas'), { audio, onEvent: handleGameEvent });
const hubEngine = new HubGame(byId('hub-canvas'), {
  audio,
  onAction: handleHubAction,
  onPersist: persistHub,
  onStatus: renderHubStatus
});

const VIEW_META = Object.freeze({
  command: ['COMMAND // STRATEGIE', 'Centre de commandement'],
  galaxy: ['NAV // FRONTIER MAP', 'Carte galactique'],
  operations: ['OPS // PLANIFICATION', 'Opérations'],
  archives: ['MU/TH/UR // ARCHIVES', 'Archives de mission'],
  hub: ['SHIP // USS TANTALUS', 'USS Tantalus'],
  armory: ['LOGISTICS // ARMORY', 'Armurerie'],
  bestiary: ['SCIENCE // XENOBIOLOGY', 'Xénobiologie'],
  vehicles: ['LOGISTICS // MOTOR POOL', 'Véhicules'],
  crew: ['PERSONNEL // ECHO-9', 'Echo-9'],
  editor: ['FORGE // WORLD AUTHORING', 'Frontier Forge'],
  settings: ['SYSTEM // CONFIGURATION', 'Système'],
  play: ['OPS // LIVE', 'Opération en cours']
});

const HUB_STATION_DIALOGUES_V61 = Object.freeze({
  briefing: Object.freeze({
    view: 'operations',
    speaker: 'LT. MARA VEGA',
    portrait: '/assets/openai/ui/dialogue/mara-vega-operations-v61.png',
    text: 'La table tactique est synchronisée avec MU/TH/UR. Choisissez une zone d’insertion, verrouillez Echo-9 et confirmez le manifeste avant l’embarquement.'
  }),
  'dropship-hangar': Object.freeze({
    view: 'operations',
    speaker: 'LT. MARA VEGA',
    portrait: '/assets/openai/ui/dialogue/mara-vega-operations-v61.png',
    text: 'L’UD-4L est alimenté et l’équipe attend dans la voie d’embarquement. Ouvrez le manifeste opérationnel avant de donner l’ordre de départ.'
  }),
  armory: Object.freeze({
    view: 'armory',
    speaker: 'S. DOYLE // ARMURIÈRE',
    portrait: '/assets/openai/ui/dialogue/sanaa-doyle-armory-v61.png',
    text: 'Les armes sont contrôlées par famille et par plaque visuelle. Les références encore ambiguës ou sans silhouette exacte restent verrouillées, sans substitut invisible.'
  })
});

const COST_LABELS = Object.freeze({
  credits: 'CR', alloy: 'ALLIAGE', fuel: 'CARBURANT', medical: 'MÉDICAL', research: 'R&D',
  pathogen: 'PATHOGÈNE', power: 'ÉNERGIE', supplies: 'RAVIT.'
});

function toast(message) {
  const item = document.createElement('div');
  item.className = 'toast';
  item.textContent = String(message);
  byId('toast-region').append(item);
  setTimeout(() => item.remove(), 3600);
}

function formatCost(cost = {}) {
  return Object.entries(cost).map(([key, value]) => `${number(value)} ${COST_LABELS[key] || key.toUpperCase()}`).join(' · ') || 'AUCUN COÛT';
}

function meter(label, value, invert = false) {
  const shown = clamp(value);
  const width = invert ? 100 - shown : shown;
  return `<div class="bar-row"><div class="bar-label"><span>${escapeHtml(label)}</span><b>${Math.round(shown)}%</b></div><div class="bar"><i style="width:${width}%"></i></div></div>`;
}

function download(name, text, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function strategyLog(titleText, result, type = 'system', risk = 0, incident = false) {
  saveSystem.data.strategy.log.unshift({
    id: `ui-${Date.now()}-${saveSystem.data.strategy.log.length}`,
    day: saveSystem.data.clock.day,
    hour: saveSystem.data.clock.hour,
    title: titleText,
    result,
    type,
    risk,
    incident
  });
  saveSystem.data.strategy.log = saveSystem.data.strategy.log.slice(0, 40);
}

function refreshActiveHubNpcRoutinesV62() {
  if (!hubEngine?.state || !hubEngine?.player) return null;
  const resolutions = hubEngine.setNpcRoutineContextV62(getHubRoutineContextV62(), { persist: false, rebuild: true });
  saveSystem.data.hub.npcRoutineState = clone(hubEngine.npcRoutineStateV62);
  return resolutions;
}

function simulateElapsed(previousHours, { generateCrisis = true, minimumCrisisScore } = {}) {
  const elapsed = Math.max(0, absoluteHours(saveSystem.data.clock) - previousHours);
  if (!elapsed) return null;
  const previousCrisis = saveSystem.data.hub.activeCrisis?.id || null;
  const simulation = advanceGalaxy(saveSystem.data, {
    hours: elapsed,
    advanceClock: false,
    generateCrisis,
    minimumCrisisScore
  });
  if (simulation.crisis && simulation.crisis.id !== previousCrisis) {
    strategyLog('ALERTE TANTALUS', `Incident ${simulation.crisis.kind} sur le pont ${simulation.crisis.deck + 1}. Neutralisation physique requise.`, 'crisis', 100, true);
  }
  refreshActiveHubNpcRoutinesV62();
  return simulation;
}

function commit(message = '') {
  ensureAdvancedState(saveSystem.data);
  saveSystem.commit();
  renderAll();
  if (message) toast(message);
}

function assertOperationMutable() {
  if (saveSystem.data.strategy.currentOperation) throw new Error('Configuration verrouillée pendant une opération active.');
}

function runTimedMutation(mutation, successMessage) {
  const before = absoluteHours(saveSystem.data.clock);
  try {
    const result = mutation();
    simulateElapsed(before);
    commit(successMessage || result?.result || 'Action confirmée.');
    return result;
  } catch (error) {
    toast(error.message);
    renderAll();
    return null;
  }
}

function applyRuntimeSettings() {
  const settings = saveSystem.data.settings;
  document.documentElement.classList.toggle('reduced-motion', Boolean(settings.reducedMotion));
  document.documentElement.dataset.quality = settings.quality || 'high';
  document.documentElement.dataset.contrast = settings.contrast || 'standard';
  document.documentElement.dataset.subtitles = settings.subtitles ? 'on' : 'off';
  hubEngine.setReducedMotion(Boolean(settings.reducedMotion));
  engine.setCoop(Boolean(settings.coop));
  audio.enabled = Number(settings.effects ?? 0.7) > 0;
  if (audio.master) audio.master.gain.value = clamp(settings.effects ?? 0.7, 0, 1) * 0.26;
}

function currentEditorProject(kind = null) {
  const snapshot = editor?.serialize?.();
  if (snapshot && (!kind || snapshot.kind === kind) && snapshot.validation?.ok) return snapshot;
  const activeId = forgeSaveSystem.data.activeProjectId;
  const project = forgeSaveSystem.data.projects.find((entry) => entry.id === activeId)
    || forgeSaveSystem.data.projects.find((entry) => !kind || entry.kind === kind);
  if (!project || (kind && project.kind !== kind) || !project.validation?.ok) return null;
  return clone(project);
}

function closeHubDialogue({ resume = true } = {}) {
  const dialogue = byId('hub-dialogue');
  if (!dialogue || dialogue.hidden) return;
  dialogue.hidden = true;
  document.documentElement.classList.remove('hub-dialogue-mode');
  pendingHubInteraction = null;
  pendingNpcConversationV62 = null;
  byId('hub-dialogue-choices').replaceChildren();
  byId('hub-dialogue-continue').hidden = false;
  byId('hub-dialogue-continue').textContent = 'OUVRIR LA STATION';
  if (resume && activeView === 'hub' && !activeHubStation) hubEngine.resume();
}

function closeHubStation({ resume = true } = {}) {
  if (!activeHubStation) return;
  const station = document.querySelector(`.view[data-panel="${activeHubStation}"]`);
  station?.classList.remove('active', 'station-overlay');
  activeHubStation = null;
  document.documentElement.classList.remove('station-mode');
  delete document.documentElement.dataset.hubStation;
  if (resume && activeView === 'hub') hubEngine.resume();
}

function openHubStation(view) {
  const station = document.querySelector(`.view[data-panel="${view}"]`);
  if (!station || !['operations', 'armory', 'crew'].includes(view)) return false;
  closeHubStation({ resume: false });
  hubEngine.pause();
  activeHubStation = view;
  station.classList.add('active', 'station-overlay');
  document.documentElement.classList.add('station-mode');
  document.documentElement.dataset.hubStation = view;
  station.querySelector('[data-close-hub-station]')?.focus({ preventScroll: true });
  return true;
}

function openHubDialogue(interaction) {
  const contract = HUB_STATION_DIALOGUES_V61[interaction?.roomId];
  if (!contract) return false;
  pendingHubInteraction = { interaction, contract };
  hubEngine.pause();
  byId('hub-dialogue-speaker').textContent = contract.speaker;
  byId('hub-dialogue-text').textContent = contract.text;
  const portrait = byId('hub-dialogue-image');
  portrait.classList.remove('is-sprite-cell-v62');
  portrait.src = contract.portrait;
  portrait.alt = `Portrait de ${contract.speaker}`;
  byId('hub-dialogue-choices').replaceChildren();
  byId('hub-dialogue-continue').hidden = false;
  byId('hub-dialogue-continue').textContent = 'OUVRIR LA STATION';
  byId('hub-dialogue').hidden = false;
  document.documentElement.classList.add('hub-dialogue-mode');
  byId('hub-dialogue-continue').focus({ preventScroll: true });
  return true;
}

function openNpcDialogueV62(interaction) {
  const conversation = beginNpcConversationV62(interaction?.crewId, {
    save: saveSystem.data,
    hub: saveSystem.data.hub,
    clock: saveSystem.data.clock,
    crew: saveSystem.data.crew,
    operation: saveSystem.data.strategy.currentOperation,
    interaction
  });
  if (!conversation) return false;
  pendingNpcConversationV62 = conversation;
  pendingHubInteraction = { interaction, conversation, npc: true };
  hubEngine.pause();
  byId('hub-dialogue-speaker').textContent = `${conversation.identity.name} · ${conversation.identity.role}`;
  byId('hub-dialogue-text').textContent = conversation.lines.map((line) => line.text).join(' ');
  const portrait = byId('hub-dialogue-image');
  const profile = HUB_NPC_ROSTER.find((entry) => entry.crewId === conversation.crewId);
  portrait.classList.add('is-sprite-cell-v62');
  portrait.src = profile?.spritePath || '/assets/openai/tantalus-hub-crew-animation-sheet.png';
  portrait.alt = `Cellule d’animation de ${conversation.identity.name}`;
  const choices = byId('hub-dialogue-choices');
  choices.innerHTML = conversation.choices.map((choice) => `<button class="hub-dialogue-choice" type="button" data-npc-dialogue-choice="${escapeHtml(choice.id)}" ${choice.available ? '' : `disabled title="${escapeHtml(choice.blockedReason)}"`}>${escapeHtml(choice.label)}</button>`).join('');
  byId('hub-dialogue-continue').hidden = true;
  byId('hub-dialogue').hidden = false;
  document.documentElement.classList.add('hub-dialogue-mode');
  choices.querySelector('button:not(:disabled)')?.focus({ preventScroll: true });
  return true;
}

function chooseNpcDialogueV62(choiceId) {
  if (!pendingNpcConversationV62) return false;
  const result = applyNpcDialogueChoiceV62(saveSystem.data.hub, pendingNpcConversationV62, choiceId);
  if (!result.applied) {
    toast(result.blockedReason || 'Cette réponse n’est plus disponible.');
    return false;
  }
  saveSystem.data.hub.dialogueMemory = clone(result.persistence.dialogueMemory);
  saveSystem.data.hub.npcRoutineState = clone(result.persistence.npcRoutineState);
  hubEngine.npcRoutineStateV62 = clone(result.persistence.npcRoutineState);
  hubEngine.setNpcRoutineContextV62(getHubRoutineContextV62(), { persist: false, rebuild: true });
  saveSystem.commit();
  byId('hub-dialogue-text').textContent = result.response;
  byId('hub-dialogue-choices').replaceChildren();
  byId('hub-dialogue-continue').hidden = false;
  byId('hub-dialogue-continue').textContent = 'TERMINER L’ÉCHANGE';
  byId('hub-dialogue-continue').focus({ preventScroll: true });
  return true;
}

function showView(name) {
  if (!VIEW_META[name]) return;
  if (name !== 'play' && missionArchiveOverlayV68?.openState) missionArchiveOverlayV68.close({ restoreFocus: false });
  closeHubDialogue({ resume: false });
  closeHubStation({ resume: false });
  if (activeView === 'play' && name !== 'play') engine.stop();
  if (activeView === 'hub' && name !== 'hub') hubEngine.stop();
  activeView = name;
  all('.view').forEach((view) => view.classList.toggle('active', view.dataset.panel === name));
  all('.nav-button').forEach((button) => button.classList.toggle('active', button.dataset.view === name));
  document.documentElement.classList.toggle('hub-mode', name === 'hub');
  document.documentElement.classList.toggle('mission-mode', name === 'play');
  byId('breadcrumb').textContent = VIEW_META[name][0];
  byId('view-title').textContent = VIEW_META[name][1];
  document.querySelector('.rail').classList.remove('open');
  if (name === 'hub') {
    hubEngine.setReducedMotion(saveSystem.data.settings.reducedMotion);
    hubEngine.start(saveSystem.data.hub, { routineContextV62: getHubRoutineContextV62() });
  }
  globalThis.scrollTo?.({ top: 0, behavior: saveSystem.data.settings.reducedMotion ? 'auto' : 'smooth' });
}

function getHubRoutineContextV62(source = saveSystem.data) {
  return {
    save: source,
    crew: source.crew,
    clock: source.clock,
    operation: source.strategy?.currentOperation || null,
    crisis: source.hub?.activeCrisis || null,
    infestation: source.hub?.infestationChain || null
  };
}

const titleScreen = new TitleScreenController({
  root: byId('title-screen'),
  app: byId('app'),
  getSave: () => saveSystem.data,
  onUnlock: () => { audio.unlock(); audio.ui(); },
  onContinue: (view) => showView(view),
  onNewTimeline: () => {
    hubEngine.stop(false);
    engine.stop();
    saveSystem.newGame(saveSystem.profile);
    ensureAdvancedState(saveSystem.data);
    activeWorld = WORLDS.find((world) => world.id === saveSystem.data.worldId) || WORLDS[0];
    applyRuntimeSettings();
    renderAll();
  },
  onForge: () => openForgeContext(),
  onOptions: () => showView('settings')
});

function openForgeContext() {
  hubEngine.stop(false);
  engine.stop();
  forgePlaytest = null;
  if (!titleScreen.root.hidden) titleScreen.hide();
  standaloneContext = 'forge';
  document.documentElement.classList.add('forge-mode');
  showView('editor');
  byId('breadcrumb').textContent = 'DEVELOPER // FRONTIER FORGE';
  byId('view-title').textContent = 'Frontier Forge';
  byId('return-title').textContent = 'FERMER FRONTIER FORGE';
}

function showTitleScreen() {
  hubEngine.stop(false);
  engine.stop();
  destroyMissionInsertionUiV62();
  forgePlaytest = null;
  standaloneContext = null;
  document.documentElement.classList.remove('hub-mode', 'mission-mode', 'forge-mode');
  byId('return-title').textContent = 'MENU PRINCIPAL';
  byId('retreat-mission').textContent = 'BATTRE EN RETRAITE';
  titleScreen.show();
}

function renderClock() {
  const { day, hour } = saveSystem.data.clock;
  const hours = Math.floor(hour);
  const minutes = Math.floor((hour % 1) * 60);
  byId('clock').textContent = `J${String(day).padStart(2, '0')} ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  byId('save-state').textContent = `Profil ${saveSystem.profile} · ${RELEASE.version} · ${number(saveSystem.data.statistics.campaigns)} opérations`;
}

function renderCommand() {
  const resources = saveSystem.data.galaxy.resources;
  const systems = saveSystem.data.hub.systems;
  byId('release-counts').innerHTML = [
    ['CAMPAGNES', CONTENT_COUNTS.campaigns], ['MONDES', CONTENT_COUNTS.worlds], ['MENACES', CONTENT_COUNTS.enemies],
    ['ARMES', CONTENT_COUNTS.weapons], ['VÉHICULES', CONTENT_COUNTS.vehicles], ['NIVEAUX', CONTENT_COUNTS.levelSeeds]
  ].map(([label, value]) => `<div class="metric"><b>${number(value)}</b><span>${label}</span></div>`).join('');
  byId('strategy-resources').innerHTML = [
    ['CR', resources.credits], ['ALLIAGE', resources.alloy], ['CARBURANT', resources.fuel], ['MÉD', resources.medical],
    ['R&D', resources.research], ['PATHOGÈNE', resources.pathogen], ['RAVIT.', systems.supplies], ['ÉNERGIE', systems.power]
  ].map(([label, value]) => `<span><b>${number(value)}</b>${label}</span>`).join('');
  byId('squad-summary').innerHTML = `${meter('MORAL', systems.morale)}${meter('QUARANTAINE', systems.quarantine)}${meter('COQUE', systems.hull)}<p class="detail-copy">${saveSystem.data.strategy.selectedCrewIds.length}/${MAX_SQUAD_SIZE} affectés · ${saveSystem.data.memorial.length} au mémorial</p>`;
  const crisis = saveSystem.data.hub.activeCrisis;
  byId('crisis-summary').innerHTML = crisis && !crisis.resolved
    ? `<span class="chip danger">INCIDENT ${escapeHtml(crisis.kind).toUpperCase()}</span><h3>Pont ${crisis.deck + 1} · ${escapeHtml(crisis.roomId)}</h3><p>${crisis.count} menaces doivent être combattues dans le niveau du Tantalus.</p><button class="button primary" data-open-hub>INTERVENIR À PIED</button>`
    : '<span class="chip success">AUCUNE CRISE ACTIVE</span><p>La simulation continue à chaque action, trajet et récupération.</p>';
  byId('frontier-alerts').innerHTML = (saveSystem.data.galaxy.alerts || []).slice(0, 6).map((alert) => `<article class="alert-item"><span>${escapeHtml(alert.severity || 'info')}</span><div><strong>${escapeHtml(alert.type || 'signal')}</strong><p>${escapeHtml(alert.message || '')}</p></div></article>`).join('') || '<p class="detail-copy">Aucune alerte stratégique.</p>';
}

function renderStrategy() {
  const locked = Boolean(saveSystem.data.strategy.currentOperation);
  byId('strategy-actions').innerHTML = COMMAND_ACTIONS.map((action) => `<article class="strategy-card"><div><span class="eyebrow">${action.hours}H · RISQUE ${action.risk}%</span><h4>${escapeHtml(action.name)}</h4><p>${escapeHtml(action.description)}</p></div><footer><span>${formatCost(action.cost)}</span><button class="button compact" data-strategy-action="${action.id}" ${!locked && canAfford(saveSystem.data, action.cost) ? '' : 'disabled'}>EXÉCUTER</button></footer></article>`).join('');
  byId('research-projects').innerHTML = RESEARCH_PROJECTS.map((project) => {
    const complete = saveSystem.data.strategy.unlockedResearchIds.includes(project.id);
    return `<article class="strategy-card ${complete ? 'completed' : ''}"><div><span class="eyebrow">R&D · ${project.hours}H</span><h4>${escapeHtml(project.name)}</h4><p>${escapeHtml(project.description)}</p></div><footer><span>${complete ? 'ACTIF' : formatCost(project.cost)}</span><button class="button compact" data-research-id="${project.id}" ${!locked && !complete && canAfford(saveSystem.data, project.cost) ? '' : 'disabled'}>${complete ? 'TERMINÉ' : 'RECHERCHER'}</button></footer></article>`;
  }).join('');
  byId('strategy-log').innerHTML = saveSystem.data.strategy.log.slice(0, 10).map((entry) => `<article class="strategy-log-entry ${entry.incident ? 'danger' : ''}"><span>J${entry.day} · ${entry.risk || 0}%</span><strong>${escapeHtml(entry.title)}</strong><p>${escapeHtml(entry.result)}</p></article>`).join('') || '<p class="detail-copy">Le journal attend votre première décision.</p>';
}

function renderModules() {
  const summary = getShipModuleEffects(saveSystem.data);
  byId('module-summary').innerHTML = `<span><b>${summary.powerLoad}/${summary.powerCapacity}</b>CHARGE</span><span><b>${summary.sparePower}</b>MARGE</span><span><b>${summary.operational}</b>ACTIFS</span>`;
  const term = byId('module-search').value.trim().toLowerCase();
  const modules = SHIP_MODULES.filter((module) => JSON.stringify(module).toLowerCase().includes(term));
  byId('module-list').innerHTML = modules.map((module) => {
    const installed = saveSystem.data.hub.moduleIds.includes(module.id);
    const integrity = Math.round(saveSystem.data.hub.moduleIntegrity?.[module.id] ?? 100);
    const quote = getModuleQuote(module);
    const available = !saveSystem.data.strategy.currentOperation && summary.sparePower >= module.power && canAfford(saveSystem.data, quote);
    const action = installed
      ? `<button class="button compact" data-module-repair="${module.id}" ${integrity >= 100 ? 'disabled' : ''}>RÉPARER</button>`
      : `<button class="button compact" data-module-install="${module.id}" ${available ? '' : 'disabled'}>INSTALLER</button>`;
    return `<article class="catalog-card"><span class="eyebrow">${escapeHtml(module.category)} · ${module.power} MW</span><h3>${escapeHtml(module.name)}</h3><p>${escapeHtml((module.effects || []).join(' · '))}</p><div class="mini-tags"><span>NIV ${module.level}</span><span>${installed ? `${integrity}% INTÉGRITÉ` : formatCost(quote)}</span></div><footer><span>${module.id}</span>${action}</footer></article>`;
  }).join('');
}

function worldPosition(index) {
  const angle = index * 2.39996;
  const radius = Math.min(44, 8 + 5.1 * Math.sqrt(index));
  return { left: 50 + Math.cos(angle) * radius, top: 50 + Math.sin(angle) * Math.min(42, radius) };
}

function renderWorldDetail(world) {
  const state = saveSystem.data.galaxy.worldState[world.id];
  const unlocked = saveSystem.data.galaxy.unlockedWorldIds.includes(world.id);
  const currentHour = absoluteHours(saveSystem.data.clock);
  const diplomacyWindow = Number(saveSystem.data.galaxy.diplomacyWindows?.[world.id]) || 0;
  const remainingHours = Math.max(0, diplomacyWindow - currentHour);
  const diplomacyReason = !unlocked
    ? 'Route verrouillée'
    : saveSystem.data.strategy.currentOperation
      ? 'Opération active : diplomatie suspendue'
      : remainingHours > 0
        ? `Relève diplomatique disponible dans ${Math.ceil(remainingHours)} h`
        : '';
  const diplomacyDisabled = diplomacyReason ? 'disabled' : '';
  const diplomacyTitle = diplomacyReason ? ` title="${escapeHtml(diplomacyReason)}"` : '';
  const diplomacyStatus = remainingHours > 0
    ? `<p class="detail-copy">Relève diplomatique : ${Math.ceil(remainingHours)} h restantes.</p>`
    : '';
  byId('world-detail').innerHTML = `<p class="eyebrow">${escapeHtml(world.sector)} · DANGER ${world.danger}</p><h3>${escapeHtml(world.name)}</h3><p>${escapeHtml(world.description)}</p><div class="mini-tags">${world.biomes.map((biome) => `<span>${escapeHtml(biome)}</span>`).join('')}</div><div class="data-list"><span>INFESTATION</span><b>${Math.round(state.infestation)}%</b><span>STABILITÉ</span><b>${Math.round(state.stability)}%</b><span>QUARANTAINE</span><b>${Math.round(state.quarantine)}%</b><span>POPULATION</span><b>${number(state.population)}</b></div>${diplomacyStatus}<div class="button-row"><button class="button compact" data-diplomacy="aid" data-world-id="${world.id}" ${diplomacyDisabled}${diplomacyTitle}>AIDE</button><button class="button compact" data-diplomacy="quarantine" data-world-id="${world.id}" ${diplomacyDisabled}${diplomacyTitle}>QUARANTAINE</button><button class="button compact" data-diplomacy="trade" data-world-id="${world.id}" ${diplomacyDisabled}${diplomacyTitle}>COMMERCE</button></div><button class="button primary wide" data-world-operations="${world.id}" ${unlocked ? '' : 'disabled'}>${unlocked ? 'PLANIFIER SUR CE MONDE' : 'ROUTE VERROUILLÉE'}</button>`;
}

function renderGalaxy() {
  const term = byId('world-search').value.trim().toLowerCase();
  const worlds = WORLDS.filter((world) => JSON.stringify(world).toLowerCase().includes(term));
  byId('star-map').innerHTML = worlds.map((world) => {
    const point = worldPosition(WORLDS.indexOf(world));
    const unlocked = saveSystem.data.galaxy.unlockedWorldIds.includes(world.id);
    return `<button class="world-node ${world.id === activeWorld.id ? 'active' : ''} ${unlocked ? '' : 'locked'}" data-world-id="${world.id}" style="left:${point.left}%;top:${point.top}%">${escapeHtml(world.name)}</button>`;
  }).join('');
  renderWorldDetail(activeWorld);
}

function renderCampaigns() {
  const mode = byId('campaign-mode').value;
  const term = byId('campaign-search').value.trim().toLowerCase();
  const campaigns = CAMPAIGNS.filter((campaign) => (mode === 'all' || campaign.mode === mode) && JSON.stringify(campaign).toLowerCase().includes(term));
  byId('campaign-list').innerHTML = campaigns.map((campaign, index) => {
    const world = WORLDS.find((entry) => entry.id === campaign.worldId);
    const unlocked = saveSystem.data.galaxy.unlockedWorldIds.includes(campaign.worldId);
    const planned = saveSystem.data.strategy.plannedCampaignId === campaign.id;
    const completed = saveSystem.data.galaxy.completedCampaignIds.includes(campaign.id);
    return `<article class="catalog-card ${planned ? 'selected' : ''}" data-index="${index + 1}"><span class="eyebrow">${escapeHtml(campaign.mode)} · ${escapeHtml(campaign.source)}</span><h3>${escapeHtml(campaign.name)}</h3><p>${escapeHtml(campaign.summary)}</p><div class="mini-tags"><span>${escapeHtml(world?.name || 'Frontier')}</span><span>${escapeHtml(campaign.objective)}</span><span>${campaign.routes} routes</span><span>${completed ? 'ACCOMPLIE' : unlocked ? 'OUVERTE' : 'VERROUILLÉE'}</span></div><footer><span>${escapeHtml(campaign.canon)}</span><button class="button compact" data-plan-campaign="${campaign.id}" ${unlocked ? '' : 'disabled'}>${planned ? 'PLANIFIÉE' : 'PLANIFIER'}</button></footer></article>`;
  }).join('');
  renderSpecialOperationsV67(term);
  renderOperationPlan();
}

function specialOperationStatusV67(operation) {
  if (operation.implementationStatus === 'effective') return { label: 'JOUABLE', action: 'PLANIFIER', tone: 'effective' };
  if (operation.implementationStatus === 'partial' && operation.playable) return { label: 'PARTIELLE · LOT JOUABLE', action: 'PLANIFIER LE LOT', tone: 'partial' };
  if (operation.implementationStatus === 'partial') return { label: 'PARTIELLE', action: 'INTÉGRATION PARTIELLE', tone: 'partial' };
  return { label: 'MANQUANTE', action: 'À PRODUIRE', tone: 'missing' };
}

function renderSpecialOperationsV67(term = '') {
  const list = byId('special-operation-list');
  const summary = byId('special-operation-summary');
  if (!list || !summary) return;
  const activeCampaignId = saveSystem.data.strategy.currentOperation?.campaignId || null;
  const operations = SPECIAL_OPERATIONS_V67
    .filter((operation) => !term || JSON.stringify(operation).toLowerCase().includes(term))
    .slice()
    .sort((left, right) => left.productionOrder - right.productionOrder);
  summary.innerHTML = `<span><b>${SPECIAL_OPERATION_COUNTS_V67.total}</b>CHATS RECENSÉS</span><span><b>${SPECIAL_OPERATION_COUNTS_V67.playable}</b>LOTS JOUABLES</span><span><b>${SPECIAL_OPERATION_COUNTS_V67.partial}</b>PARTIELS</span><span><b>${SPECIAL_OPERATION_COUNTS_V67.missing}</b>MANQUANTS</span>`;
  list.innerHTML = operations.map((operation) => {
    const status = specialOperationStatusV67(operation);
    const campaign = operation.campaignId ? CAMPAIGNS.find((entry) => entry.id === operation.campaignId) : null;
    const world = campaign ? WORLDS.find((entry) => entry.id === campaign.worldId) : null;
    const worldUnlocked = world ? saveSystem.data.galaxy.unlockedWorldIds.includes(world.id) : false;
    const planned = Boolean(campaign) && saveSystem.data.strategy.plannedCampaignId === campaign.id;
    const active = Boolean(campaign) && activeCampaignId === campaign.id;
    const blockedByOperation = Boolean(activeCampaignId) && !active;
    const canPlan = operation.playable && worldUnlocked && !blockedByOperation;
    const action = active ? 'OPÉRATION ACTIVE' : planned ? 'PLANIFIÉE' : status.action;
    const mechanics = operation.requiredMechanics.slice(0, 3).map((mechanic) => `<span>${escapeHtml(mechanic.replaceAll('-', ' '))}</span>`).join('');
    const unavailableReason = blockedByOperation ? 'Une autre opération est active.'
      : operation.playable && !worldUnlocked ? 'Route verrouillée.'
        : operation.implementationStatus === 'partial' ? 'Promesse recensée, intégration encore incomplète.'
          : operation.implementationStatus === 'missing' ? 'Promesse recensée, runtime non produit.'
            : '';
    return `<article class="special-operation-card ${status.tone} ${planned || active ? 'selected' : ''}" data-special-operation="${operation.id}"><header><span class="special-operation-order">ORDRE ${String(operation.productionOrder).padStart(2, '0')}</span><span class="special-operation-status ${status.tone}">${status.label}</span></header><p class="eyebrow">${escapeHtml(operation.kind === 'system' ? 'SYSTÈME' : 'MISSION')} · ${escapeHtml(operation.chatTitle)}</p><h3>${escapeHtml(operation.promisedTitle)}</h3><p>${escapeHtml(operation.promiseSummary)}</p><div class="mini-tags">${mechanics}</div><footer><span>${campaign ? escapeHtml(world?.name || 'Frontier') : 'CHATGPT · REGISTRE V68'}</span><button class="button compact" ${campaign ? `data-plan-campaign="${campaign.id}"` : ''} ${canPlan ? '' : 'disabled'} title="${escapeHtml(unavailableReason)}">${action}</button></footer></article>`;
  }).join('') || '<p class="special-operation-empty">Aucune directive ChatGPT ne correspond à cette recherche.</p>';
}

function neuroName(profile) {
  return ENEMIES.find((enemy) => enemy.id === profile?.enemyId)?.name || profile?.enemyId || 'Marine standard';
}

function renderAdvanced() {
  const selected = getSelectedAdvancedLoadout(saveSystem.data);
  const profiles = NEURO_XENO_PROFILES.filter((profile) => profile.playerClassCompatible);
  const locked = Boolean(saveSystem.data.strategy.currentOperation);
  const neuroSelect = byId('neuro-profile-select');
  const apexSelect = byId('apex-dossier-select');
  neuroSelect.innerHTML = '<option value="">Marine standard</option>' + profiles.map((profile) => `<option value="${profile.id}" ${selected.neuroProfile?.id === profile.id ? 'selected' : ''}>${escapeHtml(neuroName(profile))} · ${escapeHtml(profile.harness)}</option>`).join('');
  apexSelect.innerHTML = '<option value="">Aucune cible Apex</option>' + APEX_DOSSIERS.map((dossier) => `<option value="${dossier.id}" ${selected.apexDossier?.id === dossier.id ? 'selected' : ''}>${escapeHtml(dossier.name)} · ${number(dossier.reward)} CR</option>`).join('');
  neuroSelect.disabled = locked;
  apexSelect.disabled = locked;
  byId('advanced-loadout-status').innerHTML = `<span>NEURO <b>${escapeHtml(selected.neuroProfile?.id ? neuroName(selected.neuroProfile) : 'MARINE STANDARD')}</b></span><span>APEX <b>${escapeHtml(selected.apexDossier?.name || 'AUCUNE')}</b></span>${locked ? '<span>MANIFESTE VERROUILLÉ PAR OPÉRATION ACTIVE</span>' : ''}`;
}

function renderOperationPlan() {
  let campaign = CAMPAIGNS.find((entry) => entry.id === saveSystem.data.strategy.currentOperation?.campaignId)
    || CAMPAIGNS.find((entry) => entry.id === saveSystem.data.strategy.plannedCampaignId)
    || CAMPAIGNS.find((entry) => saveSystem.data.galaxy.unlockedWorldIds.includes(entry.worldId));
  if (!campaign) return;
  saveSystem.data.strategy.plannedCampaignId = campaign.id;
  const operationWorldId = saveSystem.data.strategy.currentOperation?.worldId;
  const world = WORLDS.find((entry) => entry.id === (operationWorldId || campaign.worldId)) || WORLDS[0];
  const brief = getOperationBrief(saveSystem.data, campaign, world);
  const crewNames = brief.crewIds.map((id) => CREW.find((member) => member.id === id)?.name || id);
  const weapon = WEAPONS.find((entry) => entry.id === saveSystem.data.player.weaponIds.at(-1));
  const equipment = saveSystem.data.player.equipmentIds.map((id) => EQUIPMENT.find((entry) => entry.id === id)?.name || id);
  const specialOperation = getSpecialOperationByCampaignIdV67(campaign.id);
  const issuedVehicle = specialOperation?.issuedVehicleId
    ? VEHICLES.find((entry) => entry.id === specialOperation.issuedVehicleId)
    : null;
  const vehicle = issuedVehicle || VEHICLES.find((entry) => entry.id === saveSystem.data.strategy.selectedVehicleId);
  const operation = saveSystem.data.strategy.currentOperation;
  const specialNoticeCopy = specialOperation?.id === 'cargo-brutal'
    ? `Insertion à pied · ${escapeHtml(issuedVehicle?.name || 'matériel lourd')} fourni dans la zone de mission, sans modifier l’inventaire.`
    : specialOperation?.id === 'narrative-collectables'
      ? 'Enquête QZ-17 · quatre preuves physiques à récupérer · confronter les sources pour ouvrir une vraie route.'
      : '';
  const specialNotice = specialOperation
    ? `<div class="special-operation-notice"><span>ORDRE SPÉCIAL V68</span><b>${escapeHtml(specialOperation.promisedTitle)}</b><p>${specialNoticeCopy}</p></div>`
    : '';
  byId('operation-plan').innerHTML = `<span class="eyebrow">PLAN OPÉRATIONNEL · ${escapeHtml(campaign.mode)}</span><h3>${escapeHtml(campaign.name)}</h3><p>${escapeHtml(campaign.objective)} · ${escapeHtml(world.name)}</p>${specialNotice}<div class="operation-risk"><b>${brief.risk}%</b><span>RISQUE</span></div><div class="data-list"><span>TRANSIT</span><b>${brief.hours} h</b><span>COÛT</span><b>${formatCost(brief.cost)}</b><span>RÉCOMPENSE</span><b>${formatCost(brief.reward)}</b><span>ESCOUADE</span><b>${escapeHtml(crewNames.join(', ') || 'AUCUNE')}</b><span>ARME</span><b>${escapeHtml(weapon?.name || 'AUCUNE')}</b><span>ÉQUIPEMENT</span><b>${escapeHtml(equipment.join(', ') || 'AUCUN')}</b><span>VÉHICULE</span><b>${escapeHtml(vehicle?.name || 'AUCUN')}${issuedVehicle ? ' · FOURNI SUR ZONE' : ''}</b></div><button id="operation-launch" class="button primary wide" ${brief.ready || operation ? '' : 'disabled'}>${operation ? 'REPRENDRE L’OPÉRATION' : 'DÉPLOYER ECHO-9'}</button>`;
  byId('operation-launch').onclick = () => launchCampaign(campaign);
}

function procurementActionsV62(record) {
  const kind = record.catalog === 'weapons' ? 'weapon'
    : record.catalog === 'equipment' ? 'equipment'
      : record.catalog === 'vehicles' ? 'vehicle'
        : null;
  if (!kind) return [];
  const source = kind === 'weapon' ? WEAPONS : kind === 'equipment' ? EQUIPMENT : VEHICLES;
  const item = source.find((entry) => entry.id === record.id);
  if (!item) return [];
  const inventoryKey = `${kind}Ids`;
  const owned = saveSystem.data.strategy.inventory[inventoryKey]?.includes(item.id);
  const loadoutLocked = Boolean(saveSystem.data.strategy.currentOperation);
  if (kind === 'weapon' && !resolveWeaponVisualProfileV63(item)) {
    const bridge = getExcelWeaponBridgeV63(item.id);
    const sourceLabel = bridge?.excelIds?.length ? ` · Excel ${bridge.excelIds.join(', ')}` : '';
    return [{
      id: 'visual-required',
      label: 'PLAQUETTE DÉDIÉE REQUISE',
      disabled: true,
      title: `Plaquette d’animation dédiée requise${sourceLabel}`
    }];
  }
  const vehicleGate = kind === 'vehicle' ? getVehicleDeploymentGateV60(item) : null;
  if (vehicleGate && !vehicleGate.ready) {
    return [{
      id: 'visual-required',
      label: 'CANON BLOQUÉ · PLAQUE EXACTE REQUISE',
      disabled: true,
      title: vehicleGate.reason,
      className: 'is-blocked',
      variant: 'danger',
      dataset: { deploymentStatus: vehicleGate.status }
    }];
  }
  if (!owned) {
    const quote = getProcurementQuote(saveSystem.data, kind, item);
    return [{
      id: 'procure',
      label: loadoutLocked ? 'OPÉRATION ACTIVE' : `ACQUÉRIR · ${formatCost(quote)}`,
      disabled: loadoutLocked || !canAfford(saveSystem.data, quote),
      title: loadoutLocked ? 'Opération active : manifeste verrouillé' : '',
      dataset: { procureKind: kind, procureId: item.id }
    }];
  }
  const equipped = kind === 'vehicle'
    ? saveSystem.data.strategy.selectedVehicleId === item.id
    : saveSystem.data.player[inventoryKey]?.includes(item.id);
  return [{
    id: kind === 'vehicle' ? 'select-vehicle' : 'equip',
    label: equipped ? 'AFFECTÉ' : loadoutLocked ? 'OPÉRATION ACTIVE' : kind === 'vehicle' ? 'AFFECTER' : 'ÉQUIPER',
    disabled: equipped || loadoutLocked,
    title: loadoutLocked ? 'Opération active : manifeste verrouillé' : '',
    dataset: kind === 'vehicle'
      ? { selectVehicle: item.id }
      : { equipId: item.id, equipKind: kind }
  }];
}

function setupCatalogsV62() {
  armoryCatalogV62 = new CatalogWorkbenchV62({
    root: byId('armory-catalog-v62'),
    tree: byId('armory-catalog-tree'),
    list: byId('armory-list'),
    detail: byId('armory-catalog-detail'),
    search: byId('armory-search'),
    catalogs: ['weapons'],
    getActions: procurementActionsV62,
    limit: 250
  });
  enemyCatalogV62 = new CatalogWorkbenchV62({
    root: byId('enemy-catalog-v62'),
    tree: byId('enemy-catalog-tree'),
    list: byId('enemy-list'),
    detail: byId('enemy-catalog-detail'),
    search: byId('enemy-search'),
    catalogs: ['enemies'],
    predicate: (record) => {
      const biology = byId('biology-filter').value;
      return biology === 'all' || ENEMIES.find((entry) => entry.id === record.id)?.biology === biology;
    },
    limit: 500
  });
  vehicleCatalogV62 = new CatalogWorkbenchV62({
    root: byId('vehicle-catalog-v62'),
    tree: byId('vehicle-catalog-tree'),
    list: byId('vehicle-list'),
    detail: byId('vehicle-catalog-detail'),
    search: byId('vehicle-search'),
    catalogs: ['vehicles'],
    getActions: procurementActionsV62,
    limit: 300
  });
}

function renderArmory() {
  if (!armoryCatalogV62) return;
  const catalog = byId('armory-kind').value === 'equipment' ? 'equipment' : 'weapons';
  if (armoryCatalogV62.getSnapshot().catalogs[0] !== catalog) armoryCatalogV62.setCatalogs([catalog]);
  else armoryCatalogV62.refresh();
}

function renderEnemies() {
  if (!enemyCatalogV62) return;
  enemyCatalogV62.setPredicate((record) => {
    const biology = byId('biology-filter').value;
    return biology === 'all' || ENEMIES.find((entry) => entry.id === record.id)?.biology === biology;
  });
}

function renderVehicles() {
  vehicleCatalogV62?.refresh();
}

function ensureCostumeFilterOptions(id, field) {
  const select = byId(id);
  if (!select || select.options.length > 1) return;
  const values = [...new Set(COSTUMES.map((costume) => costume[field]))].sort((a, b) => a.localeCompare(b, 'fr'));
  for (const value of values) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    select.append(option);
  }
}

function renderCrew() {
  const loadoutLocked = Boolean(saveSystem.data.strategy.currentOperation);
  const operationLockTitle = loadoutLocked ? ' title="Opération active : manifeste verrouillé"' : '';
  byId('crew-readiness').textContent = `${saveSystem.data.strategy.selectedCrewIds.length}/${MAX_SQUAD_SIZE} AFFECTÉS`;
  byId('crew-list').innerHTML = CREW.map((definition) => {
    const member = saveSystem.data.crew.find((entry) => entry.id === definition.id);
    const selected = saveSystem.data.strategy.selectedCrewIds.includes(member.id);
    return `<article class="crew-card ${selected ? 'selected' : ''}"><span class="eyebrow">${escapeHtml(definition.role)} · ${escapeHtml(member.status)}</span><h3>${escapeHtml(definition.name)}</h3>${meter('SANTÉ', member.health)}${meter('STRESS', member.stress, true)}${meter('FATIGUE', member.fatigue, true)}<div class="button-row"><button class="button compact" data-crew-assign="${member.id}" ${loadoutLocked || member.status !== 'active' && !selected ? 'disabled' : ''}${operationLockTitle}>${selected ? 'RETIRER' : 'AFFECTER'}</button><button class="button compact" data-crew-treat="${member.id}" ${loadoutLocked || member.status === 'deceased' || saveSystem.data.galaxy.resources.medical < 1 ? 'disabled' : ''}${operationLockTitle}>SOIGNER</button></div></article>`;
  }).join('');
  ensureCostumeFilterOptions('costume-part-filter', 'part');
  ensureCostumeFilterOptions('costume-body-filter', 'body');
  ensureCostumeFilterOptions('costume-palette-filter', 'palette');
  ensureCostumeFilterOptions('costume-wear-filter', 'wear');
  const filters = {
    part: byId('costume-part-filter').value,
    body: byId('costume-body-filter').value,
    palette: byId('costume-palette-filter').value,
    wear: byId('costume-wear-filter').value
  };
  const activeCostume = COSTUMES.find((costume) => costume.id === saveSystem.data.player.costumeId) || COSTUMES[0];
  byId('costume-preview-name').textContent = activeCostume.name;
  byId('costume-preview-meta').textContent = `${activeCostume.body} · ${activeCostume.palette} · ${activeCostume.wear}`.toUpperCase();
  const term = byId('costume-search').value.trim().toLowerCase();
  const costumes = COSTUMES.filter((costume) => (
    (!filters.part || costume.part === filters.part)
    && (!filters.body || costume.body === filters.body)
    && (!filters.palette || costume.palette === filters.palette)
    && (!filters.wear || costume.wear === filters.wear)
    && JSON.stringify(costume).toLowerCase().includes(term)
  ));
  byId('costume-list').innerHTML = costumes.map((costume) => {
    const selected = saveSystem.data.player.costumeId === costume.id;
    return `<article class="catalog-card ${selected ? 'selected' : ''}"><span class="eyebrow">${escapeHtml(costume.body)} · ${escapeHtml(costume.wear)}</span><h3>${escapeHtml(costume.name)}</h3><p>${escapeHtml(costume.part)} · palette ${escapeHtml(costume.palette)}</p><footer><span>${costume.id}</span><button class="button compact" data-costume-id="${costume.id}" ${selected || loadoutLocked ? 'disabled' : ''}${operationLockTitle}>${selected ? 'PORTÉE' : loadoutLocked ? 'OPÉRATION ACTIVE' : 'APPLIQUER'}</button></footer></article>`;
  }).join('') || '<article class="panel"><p>Aucune combinaison ne correspond à ces filtres.</p></article>';
}

function renderHubStatus(status = lastHubStatus) {
  lastHubStatus = status || lastHubStatus;
  const deck = status?.deck ?? saveSystem.data.hub.deck;
  const room = status?.roomName || HUB_DECKS[deck]?.rooms.find((entry) => entry.id === saveSystem.data.hub.roomId)?.name || saveSystem.data.hub.roomId;
  byId('hub-deck-label').textContent = status?.deckName || HUB_DECKS[deck]?.name || `PONT ${deck + 1}`;
  byId('hub-room-label').textContent = room;
  byId('hub-prompt').textContent = status?.prompt || 'A/D marcher · W/S grimper · C ramper · F tirer · E utiliser';
  byId('hub-system-readout').innerHTML = `<span>SANTÉ <b>${Math.round(status?.health ?? saveSystem.data.hub.playerHealth ?? 100)}%</b></span><span>MENACES <b>${status?.threats ?? saveSystem.data.hub.activeCrisis?.count ?? 0}</b></span><span>ROUTE <b>${status?.route?.source || 'TANTALUS'}</b></span>`;
}

function renderEditorStatus() {
  if (!editor) return;
  const snapshot = editor.getSnapshot();
  const validation = snapshot.validation;
  byId('editor-validation').innerHTML = validation.ok
    ? `<span class="chip success">PLAN VALIDE</span><p>${snapshot.tiles.length} blocs · ${snapshot.kind} · prêt pour playtest isolé · ${forgeSaveSystem.data.projects.length} projet(s) Forge.</p>`
    : `<span class="chip danger">PLAN INCOMPLET</span><p>${validation.errors.map(escapeHtml).join(' ')}</p>`;
  byId('editor-undo').disabled = !snapshot.canUndo;
  byId('editor-redo').disabled = !snapshot.canRedo;
  byId('editor-play').disabled = !validation.ok;
}

function renderProfiles() {
  byId('profile-list').innerHTML = saveSystem.listProfiles().map((profile) => `<article class="profile-row"><div><strong>PROFIL ${profile.profile}</strong><span>${profile.empty ? 'Emplacement vide' : escapeHtml(profile.release)}</span></div><button class="button compact" data-profile="${profile.profile}">${profile.empty ? 'CRÉER' : 'CHARGER'}</button></article>`).join('');
  byId('setting-difficulty').value = saveSystem.data.settings.difficulty;
  byId('setting-coop').checked = saveSystem.data.settings.coop;
  byId('setting-motion').checked = saveSystem.data.settings.reducedMotion;
  byId('setting-subtitles').checked = saveSystem.data.settings.subtitles;
  byId('setting-quality').value = saveSystem.data.settings.quality || 'high';
  byId('setting-contrast').value = saveSystem.data.settings.contrast || 'standard';
  byId('setting-aim-assist').value = saveSystem.data.settings.aimAssist || 'standard';
  byId('setting-screen-shake').value = saveSystem.data.settings.screenShake ?? 0.7;
  byId('setting-effects').value = saveSystem.data.settings.effects ?? 0.7;
}

function renderMissionEquipment() {
  const states = engine.getSnapshot?.().equipmentRuntime || [];
  byId('mission-equipment-controls').innerHTML = states.map((item, index) => `<button class="button compact" data-use-equipment="${item.id}" ${item.remaining < 1 ? 'disabled' : ''}>${index + 1}. ${escapeHtml(item.name)} · ${item.remaining}/${item.maxCharges}</button>`).join('') || '<span class="hint">Aucun équipement actif.</span>';
}

function renderAll() {
  renderClock();
  renderCommand();
  renderStrategy();
  renderModules();
  renderGalaxy();
  renderCampaigns();
  renderAdvanced();
  renderArmory();
  renderEnemies();
  renderVehicles();
  renderCrew();
  renderHubStatus();
  renderEditorStatus();
  renderProfiles();
  narrativeArchivesUiV68?.render();
  missionNarrativeArchivesUiV68?.render();
}

function archiveResultMessageV68(result, action) {
  if (action === 'read') {
    if (result?.applied) return 'Lecture enregistrée dans le journal permanent.';
    if (result?.reason === 'already-read') return 'Ce dossier était déjà marqué comme lu.';
    return 'Ce dossier ne peut pas encore être lu.';
  }
  if (result?.applied) return `Décision enregistrée · route ${result.routeUnlockFlag || 'QZ-17'} débloquée.`;
  if (result?.reason === 'already-applied') return 'Cette décision est déjà enregistrée.';
  if (result?.reason === 'decision-locked') return 'La décision opposée est déjà irréversiblement enregistrée.';
  return 'Les preuves nécessaires ne sont pas encore toutes récupérées.';
}

function narrativeArchivesUiOptionsV68(root, { focusFallback = null } = {}) {
  return {
    root,
    focusFallback,
    getState: () => getNarrativeInvestigationV68(saveSystem.data),
    onMarkRead: (collectableId) => {
      const result = markNarrativeCollectableReadV68(saveSystem.data, collectableId);
      if (result.applied) saveSystem.commit();
      return { ...result, message: archiveResultMessageV68(result, 'read') };
    },
    onDecision: (optionId) => {
      const result = recordNarrativeDecisionV68(saveSystem.data, optionId);
      if (result.applied) {
        saveSystem.commit();
        engine.setNarrativeArchivesV68?.(saveSystem.data.narrativeArchives);
      }
      return { ...result, message: archiveResultMessageV68(result, 'decision') };
    }
  };
}

function setupNarrativeArchivesUiV68() {
  if (narrativeArchivesUiV68) return narrativeArchivesUiV68;
  narrativeArchivesUiV68 = new NarrativeArchivesUiV68(narrativeArchivesUiOptionsV68(byId('narrative-archives-v68')));
  return narrativeArchivesUiV68;
}

function setupMissionArchiveOverlayV68() {
  if (missionArchiveOverlayV68) return missionArchiveOverlayV68;
  missionNarrativeArchivesUiV68 = new NarrativeArchivesUiV68(narrativeArchivesUiOptionsV68(byId('mission-narrative-archives-v68'), {
    focusFallback: byId('close-mission-archives-v68')
  }));
  missionArchiveOverlayV68 = new MissionArchiveOverlayV68({
    root: byId('mission-archives-overlay-v68'),
    reader: missionNarrativeArchivesUiV68,
    engine,
    canvas: byId('game-canvas'),
    closeButton: byId('close-mission-archives-v68')
  });
  return missionArchiveOverlayV68;
}

function openNarrativeArchivesV68(entryId = '', { markRead = false } = {}) {
  showView('archives');
  setupNarrativeArchivesUiV68().open(entryId, { markRead });
}

function openMissionNarrativeArchivesV68(entryId = '') {
  return setupMissionArchiveOverlayV68().open(entryId);
}

function captureMissionResumeState() {
  if (!saveSystem.data.strategy.currentOperation || !engine.mission) return null;
  const nativeState = engine.captureResumeState?.();
  if (nativeState?.schema === 1 && nativeState.identity) return nativeState;
  const snapshot = engine.getSnapshot?.() || {};
  return {
    checkpoint: engine.checkpoint ? { ...engine.checkpoint } : null,
    player: engine.player ? {
      x: engine.player.x, y: engine.player.y, health: engine.player.health, armor: engine.player.armor,
      ammo: engine.player.ammo, ammoReserve: engine.player.ammoReserve, weapon: engine.player.weaponMode,
      alive: engine.player.alive, downed: engine.player.downed, kills: engine.player.kills
    } : null,
    mission: {
      elapsed: engine.mission.elapsed, retries: engine.mission.retries, casualties: engine.mission.casualties,
      phase: engine.mission.phase
    },
    objectives: { ...engine.mission.objectives },
    inventory: { ...engine.inventory },
    doors: engine.doors.map((door) => ({ id: door.id, open: door.open, progress: door.progress })),
    vents: engine.vents.map((vent) => ({ id: vent.id, open: vent.open })),
    equipment: (snapshot.equipmentRuntime || []).map((item) => ({ id: item.id, remaining: item.remaining, uses: item.uses })),
    pickups: {
      weaponTaken: Boolean(engine.weaponPickup?.taken),
      toolTaken: Boolean(engine.toolPickup?.taken),
      archiveRecovered: Boolean(engine.archiveTerminal?.recovered),
      powerActive: Boolean(engine.powerNode?.active),
      supplies: engine.supplies.map((supply) => ({ id: supply.id, used: supply.used }))
    }
  };
}

function persistMissionResumeState() {
  const state = captureMissionResumeState();
  return state ? recordOperationResumeState(saveSystem.data, state) : false;
}

function applyMissionResumeState(state) {
  if (!state || !engine.mission || Number(state.schema) === 1) return false;
  if (state.checkpoint) engine.checkpoint = { ...engine.checkpoint, ...state.checkpoint };
  if (state.player) Object.assign(engine.player, state.player);
  if (state.mission) Object.assign(engine.mission, state.mission);
  if (state.objectives) Object.assign(engine.mission.objectives, state.objectives);
  if (state.inventory) Object.assign(engine.inventory, state.inventory);
  for (const saved of state.doors || []) {
    const door = engine.doors.find((entry) => entry.id === saved.id);
    if (door) Object.assign(door, { open: saved.open, progress: saved.progress });
  }
  for (const saved of state.vents || []) {
    const vent = engine.vents.find((entry) => entry.id === saved.id);
    if (vent) vent.open = saved.open;
  }
  for (const saved of state.equipment || []) {
    const equipment = engine.equipmentActions?.get(saved.id);
    if (equipment) Object.assign(equipment, { remaining: saved.remaining, uses: saved.uses });
  }
  if (engine.weaponPickup) engine.weaponPickup.taken = Boolean(state.pickups?.weaponTaken);
  if (engine.toolPickup) engine.toolPickup.taken = Boolean(state.pickups?.toolTaken);
  if (engine.archiveTerminal) engine.archiveTerminal.recovered = Boolean(state.pickups?.archiveRecovered);
  if (engine.powerNode) engine.powerNode.active = Boolean(state.pickups?.powerActive);
  for (const saved of state.pickups?.supplies || []) {
    const supply = engine.supplies.find((entry) => entry.id === saved.id);
    if (supply) supply.used = saved.used;
  }
  return true;
}

const MISSION_INSERTION_MEDIA_V62 = Object.freeze({
  briefing: Object.freeze({
    id: 'tantalus-command-briefing-room-v61',
    path: '/assets/openai/hub/rooms/command-briefing.png',
    alt: 'Salle de briefing physique du Tantalus avant le départ',
    provenance: 'OpenAI project bitmap'
  }),
  preparation: Object.freeze({
    id: 'tantalus-engineering-hangar-v61',
    path: '/assets/openai/hub/rooms/engineering-hangar.png',
    alt: 'Hangar physique du Tantalus pendant la préparation',
    provenance: 'OpenAI project bitmap'
  }),
  'dropship:approach': Object.freeze({
    id: 'tantalus-mission-approach-dropship-v62',
    path: '/assets/openai/mission/insertion/tantalus-dropship-approach-v62.png',
    alt: 'Dropship en approche latérale d’une colonie frontière sous la pluie',
    provenance: 'OpenAI project bitmap'
  }),
  'apc:approach': Object.freeze({
    id: 'tantalus-mission-approach-apc-v62',
    path: '/assets/openai/mission/insertion/tantalus-apc-approach-v62.png',
    alt: 'APC en approche terrestre latérale vers une colonie frontière',
    provenance: 'OpenAI project bitmap'
  }),
  'foot:approach': Object.freeze({
    id: 'tantalus-mission-approach-foot-v62',
    path: '/assets/openai/mission/insertion/tantalus-foot-approach-v62.png',
    alt: 'Escouade de quatre opérateurs en marche d’approche latérale',
    provenance: 'OpenAI project bitmap'
  }),
  deployment: Object.freeze({
    id: 'tantalus-mission-deployment-v62',
    path: '/assets/openai/metroidvania/tantalus-mission-mid.png',
    alt: 'Couche intermédiaire de la zone au point de déploiement',
    provenance: 'OpenAI project bitmap'
  }),
  'player-control': Object.freeze({
    id: 'tantalus-mission-control-transfer-v62',
    path: '/assets/openai/metroidvania/tantalus-mission-foreground.png',
    alt: 'Premier plan jouable au transfert de contrôle tactique',
    provenance: 'OpenAI project bitmap'
  })
});

function destroyMissionInsertionUiV62() {
  missionInsertionUiV62?.destroy();
  missionInsertionUiV62 = null;
  const root = byId('mission-insertion-v62');
  root.hidden = true;
  root.replaceChildren();
  byId('mission-runtime-v62').hidden = false;
}

function startMissionRuntimeV62(context) {
  destroyMissionInsertionUiV62();
  pendingMissionLaunchV62 = null;
  const {
    campaign, world, worldState, levelSeed, missionLevel,
    weapon, equipment, crew, vehicle, costume, deployment, operationLoadout
  } = context;
  engine.setCoop(saveSystem.data.settings.coop);
  engine.start({
    seed: levelSeed.seed,
    world: { ...world, ...worldState },
    campaign,
    enemyCatalog: ENEMIES,
    weapon,
    equipment,
    crew,
    vehicle,
    costume,
    levelSeed,
    missionLevel,
    apexDossier: operationLoadout.apexDossier,
    neuroProfile: operationLoadout.neuroProfile,
    difficulty: operationLoadout.difficulty,
    accessibility: {
      reducedMotion: Boolean(saveSystem.data.settings.reducedMotion),
      subtitles: Boolean(saveSystem.data.settings.subtitles),
      aimAssist: saveSystem.data.settings.aimAssist,
      screenShake: saveSystem.data.settings.screenShake
    },
    editorProject: null,
    strategicBriefing: deployment.operation,
    resumeState: operationLoadout.resumeState,
    narrativeArchiveSave: saveSystem.data,
    onNarrativeArchivesChange: () => {
      saveSystem.commit();
      narrativeArchivesUiV68?.render();
    }
  });
  if (operationLoadout.resumeState && !engine.lastResumeResult?.applied) applyMissionResumeState(operationLoadout.resumeState);
  renderMissionEquipment();
}

function handleMissionInsertionHooksV62(hooks) {
  const operation = saveSystem.data.strategy.currentOperation;
  if (!operation) return;
  for (const hook of hooks) {
    const phase = String(hook.phase || hook.approach || 'active').slice(0, 40);
    recordOperationFlag(saveSystem.data, `insertion-${hook.channel}-${phase}`);
    if (hook.channel === 'audio') audio.ui();
    if (hook.channel === 'camera') byId('mission-insertion-v62').dataset.cameraHook = String(hook.event || phase);
    if (hook.channel === 'objective') byId('mission-log').textContent = `INSERTION · ${phase.toUpperCase()} · ${campaignObjectiveLabel(operation.campaignId)}`;
  }
  saveSystem.commit();
}

function campaignObjectiveLabel(campaignId) {
  return CAMPAIGNS.find((entry) => entry.id === campaignId)?.objective || campaignId;
}

function startMissionInsertionV62(context) {
  const operation = saveSystem.data.strategy.currentOperation;
  if (!operation) {
    startMissionRuntimeV62(context);
    return;
  }
  let state = null;
  if (operation.insertionState) {
    try {
      state = restoreMissionInsertionV62(operation.insertionState);
      if (state.operationId !== operation.id) state = null;
    } catch {
      state = null;
    }
  }
  state ||= createMissionInsertionV62({
    operation,
    campaign: context.campaign,
    world: context.world,
    mission: context.missionLevel,
    vehicle: getSpecialOperationByCampaignIdV67(context.campaign?.id)?.id === 'cargo-brutal' ? null : context.vehicle,
    crew: context.crew,
    readReceipts: saveSystem.data.strategy.insertionReadReceipts,
    now: Date.now()
  });
  operation.insertionState = clone(state);
  saveSystem.commit();
  if (state.status === 'completed') {
    startMissionRuntimeV62(context);
    return;
  }
  pendingMissionLaunchV62 = context;
  missionInsertionUiV62?.destroy();
  const root = byId('mission-insertion-v62');
  root.hidden = false;
  byId('mission-runtime-v62').hidden = true;
  missionInsertionUiV62 = new MissionInsertionUiV62({
    root,
    state,
    mediaRegistry: MISSION_INSERTION_MEDIA_V62,
    returnContext: 'operations',
    onPersist: (serialized, metadata) => {
      const current = saveSystem.data.strategy.currentOperation;
      if (!current || current.id !== operation.id) return;
      current.insertionState = clone(serialized);
      saveSystem.commit();
      if (metadata.reason === 'pause') queueMicrotask(() => showView('operations'));
    },
    onHooks: handleMissionInsertionHooksV62,
    onComplete: ({ state: completedState, readReceipt }) => {
      const current = saveSystem.data.strategy.currentOperation;
      if (!current || current.id !== operation.id) return;
      current.insertionState = clone(completedState);
      if (readReceipt) {
        const receipts = saveSystem.data.strategy.insertionReadReceipts;
        const withoutDuplicate = receipts.filter((entry) => entry.key !== readReceipt.key);
        saveSystem.data.strategy.insertionReadReceipts = [...withoutDuplicate, clone(readReceipt)].slice(-128);
      }
      saveSystem.commit();
      startMissionRuntimeV62(pendingMissionLaunchV62 || context);
    }
  });
}

function launchCampaign(campaign = null) {
  const activeOperation = saveSystem.data.strategy.currentOperation;
  const resumedCampaign = activeOperation
    ? CAMPAIGNS.find((entry) => entry.id === activeOperation.campaignId)
    : null;
  campaign = resumedCampaign || campaign || CAMPAIGNS.find((entry) => entry.id === saveSystem.data.strategy.plannedCampaignId);
  if (!campaign) return false;
  const worldId = activeOperation?.worldId || campaign.worldId;
  const world = WORLDS.find((entry) => entry.id === worldId) || WORLDS[0];
  const worldState = saveSystem.data.galaxy.worldState[world.id];
  const before = absoluteHours(saveSystem.data.clock);
  let deployment;
  try {
    deployment = beginOperation(saveSystem.data, campaign, world);
  } catch (error) {
    toast(error.message);
    renderOperationPlan();
    return false;
  }
  simulateElapsed(before);
  const operationLoadout = resolveOperationDeployment(saveSystem.data, {
    crewCatalog: CREW,
    weaponCatalog: WEAPONS,
    equipmentCatalog: EQUIPMENT,
    vehicleCatalog: VEHICLES,
    costumeCatalog: COSTUMES,
    neuroProfileCatalog: NEURO_XENO_PROFILES,
    apexDossierCatalog: APEX_DOSSIERS
  });
  const crew = operationLoadout.crew;
  const weapon = operationLoadout.weapon || WEAPONS[0];
  const equipment = operationLoadout.equipment;
  const specialOperation = getSpecialOperationByCampaignIdV67(campaign.id);
  const vehicle = specialOperation?.issuedVehicleId
    ? VEHICLES.find((entry) => entry.id === specialOperation.issuedVehicleId) || operationLoadout.vehicle
    : operationLoadout.vehicle;
  const costume = operationLoadout.costume;
  const missionLevel = buildMissionLevelV52({
    campaign,
    world: { ...world, ...worldState },
    levelSeeds: LEVEL_SEEDS,
    variant: 0
  });
  const levelSeed = missionLevel.levelSeed;
  Object.assign(deployment.operation, {
    levelSeedId: levelSeed.id,
    missionTemplateId: missionLevel.templateId,
    missionLevelSignature: missionLevel.signature,
    specialOperationId: specialOperation?.id || null,
    issuedVehicleId: specialOperation?.issuedVehicleId || null
  });
  Object.assign(saveSystem.data, { scene: 'mission', worldId: world.id, campaignId: campaign.id, levelSeedId: levelSeed.id });
  saveSystem.commit();
  byId('mission-title').textContent = campaign.name;
  byId('retreat-mission').textContent = 'BATTRE EN RETRAITE';
  byId('mission-log').textContent = `MU/TH/UR · ${campaign.objective.toUpperCase()} · ${world.name} · ${missionLevel.templateLabel.toUpperCase()} · RISQUE ${deployment.operation.risk}%`;
  showView('play');
  startMissionInsertionV62({
    campaign, world, worldState, levelSeed, missionLevel,
    weapon, equipment, crew, vehicle, costume, deployment, operationLoadout
  });
  return true;
}

function finalizeOperation(success, event = {}, reason = success ? 'objective' : 'retreat') {
  const operation = saveSystem.data.strategy.currentOperation;
  if (!operation) return null;
  const campaign = CAMPAIGNS.find((entry) => entry.id === operation.campaignId);
  const world = WORLDS.find((entry) => entry.id === operation.worldId || entry.id === campaign?.worldId);
  const outcome = resolveOperation(saveSystem.data, {
    success,
    kills: event.kills || 0,
    reason,
    rewards: event.rewards || null
  });
  if (campaign && world && outcome.ok) applyCampaignConsequence(saveSystem.data, campaign, world, { success });
  advanceGalaxy(saveSystem.data, { hours: success ? 4 : 8, generateCrisis: true });
  saveSystem.data.scene = 'hub';
  saveSystem.commit();
  renderAll();
  return outcome;
}

function handleForgePlaytestEvent(event) {
  const log = byId('mission-log');
  if (!event?.type) return;
  const labels = {
    'mission-level-ready': 'NIVEAU FORGE COMPILÉ',
    'mission-level-event': 'ÉVÉNEMENT FORGE',
    'mission-zone': 'ZONE FORGE',
    'squad-ready': 'ESCOUADE PLAYTEST DÉPLOYÉE',
    'objective-action': 'OBJECTIF PLAYTEST',
    'mission-complete': 'PLAYTEST TERMINÉ — CAMPAGNE INCHANGÉE',
    'mission-failed': 'PLAYTEST ÉCHOUÉ — CAMPAGNE INCHANGÉE',
    'player-down': 'JOUEUR À TERRE — CAMPAGNE INCHANGÉE'
  };
  const label = labels[event.type];
  if (label) log.textContent = `${label}${event.eventId ? ` · ${event.eventId}` : ''}`;
  if (event.type === 'mission-complete') toast('Playtest validé dans le bac à sable Forge. Aucune progression de campagne modifiée.');
}

function handleGameEvent(event) {
  if (standaloneContext === 'forge-playtest') {
    handleForgePlaytestEvent(event);
    return;
  }
  const log = byId('mission-log');
  if (!event?.type) return;
  if (event.type === 'archive-reader-open') {
    persistMissionResumeState();
    saveSystem.commit();
    document.dispatchEvent(createOpenArchivesEventV68(event.collectableId));
    return;
  }
  if (event.type === 'caption') {
    if (saveSystem.data.settings.subtitles) {
      log.dataset.captionUntil = String(Date.now() + 1800);
      log.textContent = `SOUS-TITRE · ${event.text || event.channel || ''}`;
    }
    return;
  }
  if (event.type === 'mission-level-ready') {
    log.textContent = `NIVEAU ${String(event.templateId || '').toUpperCase()} · ${event.routes} routes · ${event.zones} zones · ${event.events} événements`;
  }
  if (event.type === 'mission-zone') {
    log.textContent = `ZONE · ${String(event.name || event.zoneId || '').toUpperCase()} · ${String(event.biome || 'inconnu').toUpperCase()}`;
  }
  if (event.type === 'narrative-collectable-discovered') {
    log.textContent = `ARCHIVE RÉCUPÉRÉE · ${String(event.collectableId || '').toUpperCase()} · preuve persistée`;
  }
  if (event.type === 'narrative-route-unlocked') {
    log.textContent = `ROUTE DÉBLOQUÉE · ${String(event.flag || event.doorId || '').toUpperCase()} · porte physique confirmée`;
  }
  if (event.type === 'mission-level-event') {
    recordOperationFlag(saveSystem.data, `level-event-${event.eventId}`);
    log.textContent = `ÉVÉNEMENT TERRAIN · ${String(event.eventId || '').toUpperCase()}`;
  }
  if (event.type === 'mission-timer-started') {
    recordOperationFlag(saveSystem.data, `timer-${event.timerId}-started`);
    log.textContent = `HOLDOUT · ${String(event.timerId || 'extraction').toUpperCase()} · ${Math.ceil(Number(event.duration) || 0)} S`;
  }
  if (event.type === 'mission-timer-complete') {
    recordOperationFlag(saveSystem.data, `timer-${event.timerId}-complete`);
    log.textContent = `HOLDOUT TERMINÉ · ${String(event.timerId || 'extraction').toUpperCase()} DÉVERROUILLÉE`;
  }
  if (event.type === 'squad-ready') {
    log.textContent = `ESCOUADE DÉPLOYÉE · ${event.members?.length || 0} alliés IA physiques · ${event.animationSheets || 0} plaques animées`;
  }
  if (event.type === 'squad-action') {
    if (Number(log.dataset.captionUntil || 0) > Date.now()) return;
    log.textContent = `ESCOUADE · ${String(event.action || 'support').toUpperCase()} · ${event.crewId || 'allié'}`;
  }
  if (event.type === 'squad-down') {
    recordOperationFlag(saveSystem.data, `squad-down-${event.crewId}`);
    log.textContent = `ALLIÉ À TERRE · ${event.crewId} · ${event.revivable ? 'réanimation possible' : 'aucun médecin disponible'}`;
  }
  if (event.type === 'squad-revived') {
    recordOperationFlag(saveSystem.data, `squad-revived-${event.targetId}`);
    log.textContent = `RÉANIMATION · ${event.crewId} a stabilisé ${event.targetId}`;
  }
  if (event.type === 'squad-lost') {
    const lost = saveSystem.data.crew.find((member) => member.id === event.crewId);
    if (lost && lost.status !== 'deceased') {
      lost.health = 0;
      lost.status = 'deceased';
      lost.injuries = Array.isArray(lost.injuries) ? lost.injuries : [];
      lost.injuries.push({ type: 'mission-casualty', day: saveSystem.data.clock.day, severity: 100 });
      if (!saveSystem.data.memorial.some((entry) => entry.crewId === lost.id && entry.campaignId === saveSystem.data.strategy.currentOperation?.campaignId)) {
        saveSystem.data.memorial.push({ crewId: lost.id, day: saveSystem.data.clock.day, campaignId: saveSystem.data.strategy.currentOperation?.campaignId, reason: 'squad-lost' });
      }
      saveSystem.data.statistics.deaths += 1;
    }
    recordOperationFlag(saveSystem.data, `squad-lost-${event.crewId}`);
    log.textContent = `PERTE CONFIRMÉE · ${event.name || event.crewId} rejoint le mémorial`;
  }
  if (event.type === 'shot') saveSystem.data.statistics.shots += 1;
  if (event.type === 'kill') {
    saveSystem.data.statistics.kills += 1;
    log.textContent = `MENACE NEUTRALISÉE · ${escapeHtml(event.enemy?.name || 'CONTACT')} · ${saveSystem.data.statistics.kills} éliminations`;
  }
  if (event.type === 'vehicle') log.textContent = event.occupied ? 'POSTE DE CONDUITE OCCUPÉ · rôles et armement actifs.' : 'PROGRESSION À PIED.';
  if (event.type === 'locked') log.textContent = `ACCÈS REFUSÉ · ${event.requirement}`;
  if (event.type === 'checkpoint') { recordOperationFlag(saveSystem.data, `checkpoint-${event.checkpoint}`); log.textContent = `CHECKPOINT ${event.checkpoint} SÉCURISÉ.`; }
  if (event.type === 'power-restored' || event.type === 'shortcut' || event.type === 'archive-recovered') recordOperationFlag(saveSystem.data, event.type);
  if (event.type === 'supply') {
    saveSystem.data.player.ammo.primary += Number(event.amount) || 60;
    recordOperationFlag(saveSystem.data, 'supply');
  }
  if (event.type === 'resource' && Object.hasOwn(saveSystem.data.galaxy.resources, event.resource)) saveSystem.data.galaxy.resources[event.resource] += Number(event.amount) || 0;
  if (event.type === 'player-down') {
    saveSystem.data.statistics.deaths += 1;
    recordOperationFlag(saveSystem.data, 'marine-down');
    log.textContent = event.revivable ? 'MARINE À TERRE · réanimation coop possible.' : 'ESCOUADE À TERRE · Entrée pour le checkpoint ou retraite.';
    audio.alarm();
  }
  if (event.type === 'mission-failed' || event.type === 'objective-failed' || event.type === 'neuro-failure') {
    recordOperationFlag(saveSystem.data, `failure-${event.reason || event.failureMode || 'unknown'}`);
    log.textContent = `OPÉRATION COMPROMISE · ${event.reason || event.failureMode || 'échec'} · reprenez au checkpoint ou battez en retraite.`;
  }
  if (event.type === 'mission-restarted') log.textContent = `REPRISE CHECKPOINT ${event.checkpoint} · pénalité de récupération appliquée.`;
  if (event.type === 'equipment-used') { log.textContent = `ÉQUIPEMENT · ${event.name || event.action || 'support terrain'}`; renderMissionEquipment(); }
  if (event.type === 'objective-action') log.textContent = `OBJECTIF · ${String(event.action || 'progression').toUpperCase()}`;
  if (event.type === 'mission-complete') {
    const outcome = finalizeOperation(true, event);
    log.textContent = outcome?.result || 'OBJECTIF ACCOMPLI · conséquences enregistrées.';
    toast('Victoire persistée : monde, équipage, économie et continuité mis à jour.');
    return;
  }
  const persistentEvents = new Set([
    'checkpoint', 'power-restored', 'shortcut', 'archive-recovered', 'supply', 'resource',
    'player-down', 'mission-failed', 'objective-failed', 'neuro-failure', 'mission-restarted',
    'equipment-used', 'objective-action', 'mission-zone', 'mission-level-event',
    'squad-action', 'squad-down', 'squad-revived', 'squad-lost',
    'mission-timer-started', 'mission-timer-complete',
    'narrative-collectable-discovered', 'narrative-route-unlocked'
  ]);
  if (persistentEvents.has(event.type) && saveSystem.data.strategy.currentOperation) {
    persistMissionResumeState();
    saveSystem.commit();
  }
}

function persistHub(patch) {
  if (standaloneContext === 'forge-playtest' && forgePlaytest) {
    forgePlaytest.hubState = { ...(forgePlaytest.hubState || {}), ...clone(patch) };
    return;
  }
  Object.assign(saveSystem.data.hub, patch);
  saveSystem.commit();
}

function applyHubService(action) {
  const windowId = Math.floor(absoluteHours(saveSystem.data.clock) / 6);
  if (saveSystem.data.hub.services[action] === windowId) throw new Error('Service déjà utilisé pendant cette relève.');
  const systems = saveSystem.data.hub.systems;
  if (action === 'service:rest') {
    if (systems.supplies < 2) throw new Error('Ravitaillement insuffisant.');
    systems.supplies -= 2;
    saveSystem.data.crew.forEach((member) => { member.stress = clamp(member.stress - 10); member.fatigue = clamp(member.fatigue - 16); });
  } else if (action === 'service:medical') {
    if (saveSystem.data.galaxy.resources.medical < 1) throw new Error('Réserves médicales insuffisantes.');
    saveSystem.data.galaxy.resources.medical -= 1;
    saveSystem.data.crew.filter((member) => member.status !== 'deceased').forEach((member) => { member.health = clamp(member.health + 14); });
    saveSystem.data.hub.playerHealth = clamp((saveSystem.data.hub.playerHealth ?? 100) + 35);
  } else if (action === 'service:quarantine') {
    if (systems.supplies < 3) throw new Error('Ravitaillement insuffisant.');
    systems.supplies -= 3; systems.quarantine = clamp(systems.quarantine + 12); systems.security = clamp(systems.security + 4);
  } else if (action === 'service:power') {
    if (saveSystem.data.galaxy.resources.fuel < 2) throw new Error('Carburant insuffisant.');
    saveSystem.data.galaxy.resources.fuel -= 2; systems.power = clamp(systems.power + 14); systems.hull = clamp(systems.hull + 2);
  } else if (action === 'service:oxygen') {
    if (systems.supplies < 2) throw new Error('Ravitaillement insuffisant.');
    systems.supplies -= 2; systems.oxygen = clamp(systems.oxygen + 18);
  } else return false;
  saveSystem.data.hub.services[action] = windowId;
  const before = absoluteHours(saveSystem.data.clock);
  saveSystem.data.clock.hour += 1;
  if (saveSystem.data.clock.hour >= 24) {
    saveSystem.data.clock.day += Math.floor(saveSystem.data.clock.hour / 24);
    saveSystem.data.clock.hour %= 24;
  }
  simulateElapsed(before);
  return true;
}

function handleHubAction(interaction) {
  if (!interaction?.action) return;
  if (standaloneContext === 'forge-playtest') {
    const status = byId('hub-status');
    if (status) status.textContent = `PLAYTEST FORGE · ${interaction.action} · CAMPAGNE INCHANGÉE`;
    return;
  }
  if (interaction.type === 'hub:npc-interaction' && openNpcDialogueV62(interaction)) return;
  if (interaction.action.startsWith('hub:vent-')) {
    const status = byId('hub-status');
    if (status) status.textContent = interaction.action === 'hub:vent-contact'
      ? `CONDUIT · ${interaction.tracker?.nodeId || interaction.tracker?.edgeId || 'CONTACT'} · ${interaction.audio?.cue || 'ÉCHO MÉTALLIQUE'}`
      : `CONDUIT · ${interaction.action.replace('hub:vent-', '').toUpperCase()}`;
    return;
  }
  if (interaction.action.startsWith('crisis:')) {
    const result = resolveHubCrisisEvent(saveSystem.data, interaction);
    if (result.handled) {
      strategyLog('CRISE DU TANTALUS', result.message || `${interaction.kind} · ${result.outcome}`, 'crisis', 100, result.outcome !== 'resolved');
      saveSystem.commit();
      renderAll();
      toast(result.outcome === 'resolved' ? 'Crise neutralisée dans le niveau.' : 'Extraction médicale : dégâts persistants appliqués.');
    }
    return;
  }
  if (interaction.action.startsWith('editor:')) {
    strategyLog('PLAYTEST FORGE', interaction.action, 'forge');
    saveSystem.commit();
    toast('Événement du plan Forge validé.');
    return;
  }
  if (interaction.action.startsWith('navigate:')) {
    if (!openHubDialogue(interaction)) showView(interaction.action.split(':')[1]);
    return;
  }
  try {
    if (applyHubService(interaction.action)) {
      saveSystem.commit();
      renderAll();
      toast('Service physique exécuté et temps stratégique avancé.');
    }
  } catch (error) {
    toast(error.message);
  }
}

function retreatMission() {
  if (standaloneContext === 'forge-playtest') {
    returnToForgeContext();
    return;
  }
  if (!saveSystem.data.strategy.currentOperation) { engine.stop(); showView('hub'); return; }
  destroyMissionInsertionUiV62();
  const outcome = finalizeOperation(false, {}, 'retreat');
  engine.stop();
  toast(outcome?.result || 'Retraite enregistrée.');
  showView('hub');
}

function returnToForgeContext() {
  engine.stop();
  hubEngine.stop(false);
  forgePlaytest = null;
  standaloneContext = 'forge';
  document.documentElement.classList.add('forge-mode');
  showView('editor');
  byId('breadcrumb').textContent = 'DEVELOPER // FRONTIER FORGE';
  byId('view-title').textContent = 'Frontier Forge';
  byId('return-title').textContent = 'FERMER FRONTIER FORGE';
  byId('retreat-mission').textContent = 'TERMINER LE PLAYTEST';
}

function launchForgeMissionPlaytest(project) {
  const sandbox = clone(saveSystem.data);
  sandbox.strategy.currentOperation = null;
  sandbox.strategy.lastOperation = null;
  const campaign = CAMPAIGNS.find((entry) => entry.id === sandbox.strategy.plannedCampaignId)
    || CAMPAIGNS.find((entry) => sandbox.galaxy.unlockedWorldIds.includes(entry.worldId));
  if (!campaign) throw new Error('Aucune campagne de référence disponible pour le playtest.');
  const world = WORLDS.find((entry) => entry.id === campaign.worldId) || WORLDS[0];
  const worldState = sandbox.galaxy.worldState[world.id];
  const deployment = beginOperation(sandbox, campaign, world);
  const operationLoadout = resolveOperationDeployment(sandbox, {
    crewCatalog: CREW,
    weaponCatalog: WEAPONS,
    equipmentCatalog: EQUIPMENT,
    vehicleCatalog: VEHICLES,
    costumeCatalog: COSTUMES,
    neuroProfileCatalog: NEURO_XENO_PROFILES,
    apexDossierCatalog: APEX_DOSSIERS
  });
  const missionLevel = buildMissionLevelV52({ campaign, world: { ...world, ...worldState }, levelSeeds: LEVEL_SEEDS, variant: 0 });
  Object.assign(deployment.operation, {
    levelSeedId: missionLevel.levelSeed.id,
    missionTemplateId: missionLevel.templateId,
    missionLevelSignature: missionLevel.signature,
    context: 'forge-playtest'
  });
  forgePlaytest = { kind: 'mission', project: clone(project), sandbox, campaignId: campaign.id };
  standaloneContext = 'forge-playtest';
  showView('play');
  byId('return-title').textContent = 'RETOUR FRONTIER FORGE';
  byId('retreat-mission').textContent = 'TERMINER LE PLAYTEST';
  byId('mission-title').textContent = `${campaign.name} · PLAYTEST FORGE`;
  byId('mission-log').textContent = 'BAC À SABLE FORGE · progression, journal et sauvegarde campagne verrouillés.';
  engine.setCoop(Boolean(sandbox.settings.coop));
  engine.start({
    seed: missionLevel.levelSeed.seed,
    world: { ...world, ...worldState },
    campaign,
    enemyCatalog: ENEMIES,
    weapon: operationLoadout.weapon || WEAPONS[0],
    equipment: operationLoadout.equipment,
    crew: operationLoadout.crew,
    vehicle: operationLoadout.vehicle,
    costume: operationLoadout.costume,
    levelSeed: missionLevel.levelSeed,
    missionLevel,
    apexDossier: operationLoadout.apexDossier,
    neuroProfile: operationLoadout.neuroProfile,
    difficulty: operationLoadout.difficulty,
    accessibility: clone(sandbox.settings),
    editorProject: project,
    strategicBriefing: deployment.operation,
    resumeState: null
  });
  renderMissionEquipment();
}

function playtestEditor() {
  const project = editor.serialize();
  if (!project.validation.ok) { toast(project.validation.errors.join(' ')); return; }
  forgeSaveSystem.upsert({ ...project, id: forgeSaveSystem.data.activeProjectId || `local-forge-${project.kind}`, name: `Frontier Forge ${title(project.kind)}` });
  if (project.kind === 'ship') {
    const sandbox = clone(saveSystem.data);
    forgePlaytest = { kind: 'ship', project: clone(project), sandbox, hubState: clone(sandbox.hub) };
    standaloneContext = 'forge-playtest';
    showView('hub');
    hubEngine.stop(false);
    hubEngine.start(forgePlaytest.hubState, {
      editorProject: project,
      routineContextV62: getHubRoutineContextV62(sandbox)
    });
    byId('return-title').textContent = 'RETOUR FRONTIER FORGE';
    return;
  }
  try { launchForgeMissionPlaytest(project); } catch (error) { toast(error.message); returnToForgeContext(); }
}

function setupEditor() {
  editor = new LevelEditor(byId('editor-canvas'), (project) => {
    const active = forgeSaveSystem.data.projects.find((entry) => entry.id === forgeSaveSystem.data.activeProjectId);
    const id = active?.kind === project.kind ? active.id : `local-forge-${project.kind}`;
    const record = { ...project, id, name: `Frontier Forge ${title(project.kind)}`, updatedAt: Date.now() };
    forgeSaveSystem.upsert(record);
    renderEditorStatus();
  });
  byId('editor-tools').innerHTML = TILE_TYPES.map((tool, index) => `<button class="tool-button ${index ? '' : 'active'}" data-editor-tool="${tool}">${title(tool)}</button>`).join('');
  const saved = forgeSaveSystem.data.projects.find((entry) => entry.id === forgeSaveSystem.data.activeProjectId);
  if (saved) editor.load(saved);
  renderEditorStatus();
}

function bindHoldControl(button, target, code) {
  const activate = (event) => { event.preventDefault(); audio.unlock(); target.keys.add(code); };
  const release = (event) => { event.preventDefault(); target.keys.delete(code); };
  button.addEventListener('pointerdown', activate);
  ['pointerup', 'pointercancel', 'pointerleave'].forEach((name) => button.addEventListener(name, release));
}

function setupRuntimeControls() {
  all('[data-hub-control]').forEach((button) => {
    const control = button.dataset.hubControl;
    const activate = (event) => { event.preventDefault(); audio.unlock(); hubEngine.setControl(control, true); };
    const release = (event) => { event.preventDefault(); hubEngine.setControl(control, false); };
    button.addEventListener('pointerdown', activate);
    ['pointerup', 'pointercancel', 'pointerleave'].forEach((name) => button.addEventListener(name, release));
  });
  all('[data-mission-key]').forEach((button) => bindHoldControl(button, engine, button.dataset.missionKey));
  byId('mission-interact').onclick = () => engine.interact(engine.player);
  byId('mission-tracker').onclick = () => engine.activateTracker(engine.player);
  byId('mission-vehicle').onclick = () => engine.toggleVehicle(engine.player);
  byId('mission-reload').onclick = () => engine.reload(engine.player);
  byId('mission-medkit').onclick = () => engine.useMedkit(engine.player);
  byId('mission-neuro-counter').onclick = () => engine.activateNeuroCountermeasure(engine.player);
  byId('mission-equipment-controls').onclick = (event) => {
    const id = event.target.closest('[data-use-equipment]')?.dataset.useEquipment;
    if (!id) return;
    try { engine.useEquipment(id); renderMissionEquipment(); } catch (error) { toast(error.message); }
  };
}

function bindDelegatedActions() {
  document.addEventListener('click', (event) => {
    const target = event.target.closest('button,[data-view]');
    if (!target) return;
    if (target.dataset.openHub !== undefined) showView('hub');
    if (target.dataset.strategyAction) runTimedMutation(() => executeStrategicAction(saveSystem.data, target.dataset.strategyAction));
    if (target.dataset.researchId) runTimedMutation(() => completeResearchProject(saveSystem.data, target.dataset.researchId));
    if (target.dataset.moduleInstall) runTimedMutation(() => installShipModule(saveSystem.data, target.dataset.moduleInstall), 'Module installé et alimenté.');
    if (target.dataset.moduleRepair) runTimedMutation(() => repairShipModule(saveSystem.data, target.dataset.moduleRepair), 'Module réparé.');
    if (target.dataset.planCampaign) {
      saveSystem.data.strategy.plannedCampaignId = target.dataset.planCampaign;
      saveSystem.commit(); renderCampaigns(); toast('Campagne ajoutée au plan opérationnel.');
    }
    if (target.dataset.procureId) {
      const kind = target.dataset.procureKind;
      const source = kind === 'weapon' ? WEAPONS : kind === 'equipment' ? EQUIPMENT : VEHICLES;
      runTimedMutation(() => procureCatalogItem(saveSystem.data, kind, source.find((item) => item.id === target.dataset.procureId)), 'Matériel acquis et persisté.');
    }
    if (target.dataset.equipId) runTimedMutation(() => equipCatalogItem(saveSystem.data, target.dataset.equipKind, target.dataset.equipId), 'Dotation active modifiée.');
    if (target.dataset.selectVehicle) runTimedMutation(() => selectStrategicVehicle(saveSystem.data, target.dataset.selectVehicle), 'Véhicule affecté à l’opération.');
    if (target.dataset.crewAssign) runTimedMutation(() => assignCrewMember(saveSystem.data, target.dataset.crewAssign), 'Affectation Echo-9 actualisée.');
    if (target.dataset.crewTreat) runTimedMutation(() => treatCrewMember(saveSystem.data, target.dataset.crewTreat), 'Soin individuel terminé.');
    if (target.dataset.costumeId) runTimedMutation(() => applyCostume(saveSystem.data, target.dataset.costumeId), 'Combinaison appliquée au runtime.');
    if (target.dataset.diplomacy) {
      const world = WORLDS.find((entry) => entry.id === target.dataset.worldId);
      runTimedMutation(() => performDiplomacy(saveSystem.data, world, target.dataset.diplomacy), 'Conséquence diplomatique appliquée.');
    }
    if (target.dataset.worldId && target.classList.contains('world-node')) {
      activeWorld = WORLDS.find((world) => world.id === target.dataset.worldId) || activeWorld;
      renderGalaxy();
    }
    if (target.dataset.worldOperations) {
      byId('campaign-search').value = activeWorld.name;
      renderCampaigns(); showView('operations');
    }
    if (target.dataset.profile) {
      const profile = Number(target.dataset.profile);
      hubEngine.stop(false); engine.stop();
      const slot = saveSystem.listProfiles().find((entry) => entry.profile === profile);
      slot?.empty ? saveSystem.newGame(profile) : saveSystem.load(profile);
      ensureAdvancedState(saveSystem.data); activeWorld = WORLDS.find((world) => world.id === saveSystem.data.worldId) || WORLDS[0];
      applyRuntimeSettings(); renderAll(); toast(`Profil ${profile} actif.`);
    }
    if (target.dataset.editorTool) {
      editor.setTool(target.dataset.editorTool);
      all('[data-editor-tool]').forEach((button) => button.classList.toggle('active', button === target));
    }
  });
}

function bind() {
  byId('nav').onclick = (event) => {
    const target = event.target.closest('[data-view]');
    if (!target) return;
    audio.unlock(); audio.ui(); showView(target.dataset.view);
  };
  byId('menu-toggle').onclick = () => document.querySelector('.rail').classList.toggle('open');
  byId('quick-save').onclick = () => {
    if (standaloneContext) { toast('La campagne est verrouillée dans Frontier Forge.'); return; }
    saveSystem.data.statistics.playSeconds += Math.floor((Date.now() - sessionStart) / 1000);
    sessionStart = Date.now(); persistMissionResumeState(); saveSystem.commit(); renderClock(); toast('Sauvegarde locale confirmée.');
  };
  byId('return-title').onclick = () => {
    if (standaloneContext === 'forge-playtest') {
      returnToForgeContext();
      return;
    }
    if (standaloneContext === 'forge') {
      showTitleScreen();
      return;
    }
    persistMissionResumeState();
    saveSystem.commit();
    showTitleScreen();
  };
  byId('hub-dialogue-cancel').onclick = () => closeHubDialogue();
  byId('hub-dialogue-continue').onclick = () => {
    if (pendingNpcConversationV62) {
      closeHubDialogue();
      return;
    }
    const view = pendingHubInteraction?.contract?.view;
    closeHubDialogue({ resume: false });
    if (!openHubStation(view)) hubEngine.resume();
  };
  byId('hub-dialogue-choices').onclick = (event) => {
    const choiceId = event.target.closest('[data-npc-dialogue-choice]')?.dataset.npcDialogueChoice;
    if (choiceId) chooseNpcDialogueV62(choiceId);
  };
  all('[data-close-hub-station]').forEach((button) => {
    button.onclick = () => closeHubStation();
  });
  globalThis.addEventListener('keydown', (event) => {
    if (event.code !== 'Escape') return;
    if (missionArchiveOverlayV68?.openState) {
      event.preventDefault();
      missionArchiveOverlayV68.close();
    } else if (!byId('hub-dialogue').hidden) {
      event.preventDefault();
      closeHubDialogue();
    } else if (activeHubStation) {
      event.preventDefault();
      closeHubStation();
    } else if (standaloneContext === 'forge-playtest') {
      event.preventDefault();
      returnToForgeContext();
    } else if (standaloneContext === 'forge') {
      event.preventDefault();
      showTitleScreen();
    }
  });
  byId('continue-operation').onclick = () => launchCampaign();
  byId('open-archives-command').onclick = () => openNarrativeArchivesV68();
  document.addEventListener('atf:open-archives', (event) => {
    const entryId = event.detail?.entryId || '';
    if (activeView === 'play' && engine.running) openMissionNarrativeArchivesV68(entryId);
    else openNarrativeArchivesV68(entryId, { markRead: Boolean(entryId) });
  });
  byId('new-timeline').onclick = () => { hubEngine.stop(false); engine.stop(); saveSystem.newGame(saveSystem.profile); ensureAdvancedState(saveSystem.data); applyRuntimeSettings(); renderAll(); showView('hub'); };
  ['world-search', 'campaign-search', 'costume-search', 'module-search'].forEach((id) => byId(id).addEventListener('input', () => ({
    'world-search': renderGalaxy, 'campaign-search': renderCampaigns, 'costume-search': renderCrew, 'module-search': renderModules
  })[id]()));
  byId('campaign-mode').onchange = renderCampaigns;
  byId('armory-kind').onchange = renderArmory;
  ['costume-part-filter', 'costume-body-filter', 'costume-palette-filter', 'costume-wear-filter'].forEach((id) => {
    byId(id).onchange = renderCrew;
  });
  byId('biology-filter').onchange = renderEnemies;
  byId('neuro-profile-select').onchange = (event) => runTimedMutation(() => {
    assertOperationMutable();
    return event.target.value ? selectNeuroProfile(saveSystem.data, event.target.value) : clearNeuroProfile(saveSystem.data);
  }, 'Classe Neuro-Xeno actualisée.');
  byId('apex-dossier-select').onchange = (event) => runTimedMutation(() => {
    assertOperationMutable();
    if (event.target.value) return selectApexDossier(saveSystem.data, event.target.value);
    saveSystem.data.strategy.selectedApexDossierId = null;
    return null;
  }, 'Cible Apex actualisée.');
  byId('exit-hub').onclick = () => {
    if (standaloneContext === 'forge-playtest') { returnToForgeContext(); return; }
    hubEngine.stop(); saveSystem.commit(); showView('command');
  };
  byId('retreat-mission').onclick = retreatMission;
  byId('editor-mode').onchange = (event) => { editor.setShipMode(event.target.value === 'ship'); renderEditorStatus(); };
  byId('editor-clear').onclick = () => editor.clear();
  byId('editor-undo').onclick = () => editor.undo();
  byId('editor-redo').onclick = () => editor.redo();
  byId('editor-validate').onclick = () => { renderEditorStatus(); toast(editor.validate().ok ? 'Plan valide.' : editor.validate().errors.join(' ')); };
  byId('editor-play').onclick = playtestEditor;
  byId('editor-export').onclick = () => download(`atf-v62-forge-${editor.serialize().kind}-${Date.now()}.json`, JSON.stringify(editor.serialize(), null, 2));
  byId('editor-import').onchange = async (event) => { try { editor.load(JSON.parse(await event.target.files[0].text())); renderEditorStatus(); toast('Plan importé.'); } catch (error) { toast(error.message); } };
  const settingBindings = {
    'setting-difficulty': ['difficulty', (element) => element.value],
    'setting-quality': ['quality', (element) => element.value],
    'setting-contrast': ['contrast', (element) => element.value],
    'setting-aim-assist': ['aimAssist', (element) => element.value],
    'setting-screen-shake': ['screenShake', (element) => Number(element.value)],
    'setting-coop': ['coop', (element) => element.checked],
    'setting-motion': ['reducedMotion', (element) => element.checked],
    'setting-subtitles': ['subtitles', (element) => element.checked],
    'setting-effects': ['effects', (element) => Number(element.value)]
  };
  for (const [id, [key, read]] of Object.entries(settingBindings)) byId(id).onchange = (event) => { saveSystem.data.settings[key] = read(event.target); applyRuntimeSettings(); saveSystem.commit(); };
  byId('save-export').onclick = () => download(`aliens-tantalus-frontier-profile-${saveSystem.profile}.json`, saveSystem.export());
  byId('save-import').onchange = async (event) => { try { hubEngine.stop(false); engine.stop(); saveSystem.import(await event.target.files[0].text()); ensureAdvancedState(saveSystem.data); applyRuntimeSettings(); renderAll(); toast('Sauvegarde importée et migrée vers le schéma v51.'); } catch (error) { toast(error.message); } };
  globalThis.addEventListener('beforeinstallprompt', (event) => { event.preventDefault(); deferredInstall = event; byId('install-app').hidden = false; });
  byId('install-app').onclick = async () => { if (!deferredInstall) return; deferredInstall.prompt(); await deferredInstall.userChoice; deferredInstall = null; byId('install-app').hidden = true; };
  globalThis.addEventListener('beforeunload', () => {
    hubEngine.stop();
    engine.stop();
    if (standaloneContext) return;
    persistMissionResumeState();
    saveSystem.data.statistics.playSeconds += Math.floor((Date.now() - sessionStart) / 1000);
    saveSystem.commit();
  });
  bindDelegatedActions();
}

async function boot() {
  const validation = validateContent();
  if (!validation.ok) throw new Error(`Contrat de contenu invalide : ${validation.failures.join(', ')}`);
  setupEditor();
  setupRuntimeControls();
  setupCatalogsV62();
  setupNarrativeArchivesUiV68();
  setupMissionArchiveOverlayV68();
  bind();
  applyRuntimeSettings();
  renderAll();
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('/sw.js').catch(() => {});
  globalThis.__ATF_GAME__ = engine;
  globalThis.__ATF_HUB__ = hubEngine;
  globalThis.__ATF_V51__ = {
    saveSystem, engine, hubEngine, get editor() { return editor; },
    renderAll, showView, launchCampaign, retreatMission,
    simulateGalaxy: (hours = 6) => { const result = advanceGalaxy(saveSystem.data, { hours }); commit(); return result; },
    snapshot: () => ({ save: clone(saveSystem.data), mission: engine.getSnapshot?.(), hub: hubEngine.getSnapshot?.(), editor: editor.getSnapshot() })
  };
  globalThis.__ATF_V61__ = {
    titleScreen,
    showTitleScreen,
    openForge: openForgeContext,
    get standaloneContext() { return standaloneContext; },
    snapshot: () => titleScreen.getSnapshot()
  };
  globalThis.__ATF_V62__ = {
    forgeSaveSystem,
    openForge: openForgeContext,
    returnToForge: returnToForgeContext,
    get playtest() { return forgePlaytest ? clone(forgePlaytest) : null; },
    snapshot: () => ({
      campaign: clone(saveSystem.data),
      forge: clone(forgeSaveSystem.data),
      context: standaloneContext
    })
  };
  globalThis.__ATF_V68__ = {
    openArchives: (entryId = '') => document.dispatchEvent(createOpenArchivesEventV68(entryId)),
    get investigation() { return getNarrativeInvestigationV68(saveSystem.data); }
  };
  setTimeout(() => {
    byId('boot').remove();
    showTitleScreen();
  }, 500);
}

boot().catch((error) => {
  console.error(error);
  byId('boot').innerHTML = `<div class="boot-mark">ERR</div><p>${escapeHtml(error.message)}</p>`;
});

export { saveSystem, forgeSaveSystem, engine, hubEngine, titleScreen, launchCampaign, retreatMission, renderAll, showView, showTitleScreen, openForgeContext, openNarrativeArchivesV68, openMissionNarrativeArchivesV68 };
