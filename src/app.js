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
import { HubGame, HUB_DECKS } from './hub-v52-runtime.js';
import { LevelEditor, TILE_TYPES } from './editor.js';
import { AudioDirector } from './audio.js';

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
const audio = new AudioDirector();
let editor = null;
let activeView = 'command';
let activeWorld = WORLDS.find((world) => world.id === saveSystem.data.worldId) || WORLDS[0];
let deferredInstall = null;
let sessionStart = Date.now();
let lastHubStatus = null;

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
  hub: ['SHIP // USS TANTALUS', 'USS Tantalus'],
  armory: ['LOGISTICS // ARMORY', 'Armurerie'],
  bestiary: ['SCIENCE // XENOBIOLOGY', 'Xénobiologie'],
  vehicles: ['LOGISTICS // MOTOR POOL', 'Véhicules'],
  crew: ['PERSONNEL // ECHO-9', 'Echo-9'],
  editor: ['FORGE // WORLD AUTHORING', 'Frontier Forge'],
  codex: ['ARCHIVE // v1-v51', 'Contrat de gameplay'],
  settings: ['SYSTEM // CONFIGURATION', 'Système'],
  play: ['OPS // LIVE', 'Opération en cours']
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
  const activeId = saveSystem.data.editor.activeProjectId;
  const project = saveSystem.data.editor.projects.find((entry) => entry.id === activeId)
    || saveSystem.data.editor.projects.find((entry) => !kind || entry.kind === kind);
  if (!project || (kind && project.kind !== kind) || !project.validation?.ok) return null;
  return clone(project);
}

function showView(name) {
  if (!VIEW_META[name]) return;
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
    hubEngine.start(saveSystem.data.hub, { editorProject: currentEditorProject('ship') });
  }
  globalThis.scrollTo?.({ top: 0, behavior: saveSystem.data.settings.reducedMotion ? 'auto' : 'smooth' });
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
  renderOperationPlan();
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
  const vehicle = VEHICLES.find((entry) => entry.id === saveSystem.data.strategy.selectedVehicleId);
  const operation = saveSystem.data.strategy.currentOperation;
  byId('operation-plan').innerHTML = `<span class="eyebrow">PLAN OPÉRATIONNEL · ${escapeHtml(campaign.mode)}</span><h3>${escapeHtml(campaign.name)}</h3><p>${escapeHtml(campaign.objective)} · ${escapeHtml(world.name)}</p><div class="operation-risk"><b>${brief.risk}%</b><span>RISQUE</span></div><div class="data-list"><span>TRANSIT</span><b>${brief.hours} h</b><span>COÛT</span><b>${formatCost(brief.cost)}</b><span>RÉCOMPENSE</span><b>${formatCost(brief.reward)}</b><span>ESCOUADE</span><b>${escapeHtml(crewNames.join(', ') || 'AUCUNE')}</b><span>ARME</span><b>${escapeHtml(weapon?.name || 'AUCUNE')}</b><span>ÉQUIPEMENT</span><b>${escapeHtml(equipment.join(', ') || 'AUCUN')}</b><span>VÉHICULE</span><b>${escapeHtml(vehicle?.name || 'AUCUN')}</b></div><button id="operation-launch" class="button primary wide" ${brief.ready || operation ? '' : 'disabled'}>${operation ? 'REPRENDRE L’OPÉRATION' : 'DÉPLOYER ECHO-9'}</button>`;
  byId('operation-launch').onclick = () => launchCampaign(campaign);
}

function procurementAction(kind, item) {
  const inventoryKey = `${kind}Ids`;
  const owned = saveSystem.data.strategy.inventory[inventoryKey]?.includes(item.id);
  const loadoutLocked = Boolean(saveSystem.data.strategy.currentOperation);
  const operationLockTitle = loadoutLocked ? ' title="Opération active : manifeste verrouillé"' : '';
  const equipped = kind === 'vehicle'
    ? saveSystem.data.strategy.selectedVehicleId === item.id
    : saveSystem.data.player[inventoryKey]?.includes(item.id);
  if (!owned) {
    const quote = getProcurementQuote(saveSystem.data, kind, item);
    return `<button class="button compact" data-procure-kind="${kind}" data-procure-id="${item.id}" ${loadoutLocked || !canAfford(saveSystem.data, quote) ? 'disabled' : ''}${operationLockTitle}>${loadoutLocked ? 'OPÉRATION ACTIVE' : `ACQUÉRIR · ${formatCost(quote)}`}</button>`;
  }
  const actionAttributes = kind === 'vehicle'
    ? `data-select-vehicle="${item.id}"`
    : `data-equip-id="${item.id}" data-equip-kind="${kind}"`;
  const actionLabel = kind === 'vehicle' ? 'AFFECTER' : 'ÉQUIPER';
  return `<button class="button compact" ${actionAttributes} ${equipped || loadoutLocked ? 'disabled' : ''}${operationLockTitle}>${equipped ? 'AFFECTÉ' : loadoutLocked ? 'OPÉRATION ACTIVE' : actionLabel}</button>`;
}

function renderArmory() {
  const kind = byId('armory-kind').value === 'equipment' ? 'equipment' : 'weapon';
  const source = kind === 'weapon' ? WEAPONS : EQUIPMENT;
  const term = byId('armory-search').value.trim().toLowerCase();
  const items = source.filter((item) => JSON.stringify(item).toLowerCase().includes(term));
  byId('armory-list').innerHTML = items.map((item) => {
    const description = kind === 'weapon'
      ? `Dégâts ${item.damage} · cadence ${item.fireRate}/s · chargeur ${item.magazine} · pénétration ${item.penetration}`
      : `${item.description} · ${item.charges} charges · ${item.mass} kg`;
    return `<article class="catalog-card"><span class="eyebrow">${kind.toUpperCase()} · ${escapeHtml(item.rarity)}</span><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(description)}</p><div class="mini-tags"><span>${escapeHtml(item.family || item.utility)}</span><span>${escapeHtml(item.mark || item.grade)}</span></div><footer><span>${item.id}</span>${procurementAction(kind, item)}</footer></article>`;
  }).join('');
}

function renderEnemies() {
  const biology = byId('biology-filter').value;
  const term = byId('enemy-search').value.trim().toLowerCase();
  const items = ENEMIES.filter((enemy) => (biology === 'all' || enemy.biology === biology) && JSON.stringify(enemy).toLowerCase().includes(term));
  byId('enemy-list').innerHTML = items.map((enemy) => `<article class="catalog-card"><span class="eyebrow">${escapeHtml(enemy.biology)} · ${escapeHtml(enemy.frequency)}</span><h3>${escapeHtml(enemy.name)}</h3><p>PV ${enemy.health} · dégâts ${enemy.damage} · vitesse ${enemy.speed} · armure ${enemy.armor}</p><div class="mini-tags"><span>${escapeHtml(enemy.caste)}</span>${[enemy.behavior].filter(Boolean).map((behavior) => `<span>${escapeHtml(behavior)}</span>`).join('')}</div><footer><span>${enemy.id}</span><span>${escapeHtml(enemy.habitats.slice(0, 2).join(' · '))}</span></footer></article>`).join('');
}

function renderVehicles() {
  const term = byId('vehicle-search').value.trim().toLowerCase();
  const items = VEHICLES.filter((vehicle) => JSON.stringify(vehicle).toLowerCase().includes(term));
  byId('vehicle-list').innerHTML = items.map((vehicle) => `<article class="catalog-card"><span class="eyebrow">${escapeHtml(vehicle.family)} · ${escapeHtml(vehicle.fit)}</span><h3>${escapeHtml(vehicle.name)}</h3><p>Coque ${vehicle.hull} · vitesse ${vehicle.speed} · cargo ${vehicle.cargo} · ${vehicle.seats.length} sièges</p><div class="mini-tags">${vehicle.seats.map((seat) => `<span>${escapeHtml(seat.role)}</span>`).join('')}${vehicle.actions.map((action) => `<span>${escapeHtml(action)}</span>`).join('')}</div><footer><span>${vehicle.id}</span>${procurementAction('vehicle', vehicle)}</footer></article>`).join('');
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
  const term = byId('costume-search').value.trim().toLowerCase();
  byId('costume-list').innerHTML = COSTUMES.filter((costume) => JSON.stringify(costume).toLowerCase().includes(term)).map((costume) => {
    const selected = saveSystem.data.player.costumeId === costume.id;
    return `<article class="catalog-card ${selected ? 'selected' : ''}"><span class="eyebrow">${escapeHtml(costume.body)} · ${escapeHtml(costume.wear)}</span><h3>${escapeHtml(costume.name)}</h3><p>${escapeHtml(costume.part)} · palette ${escapeHtml(costume.palette)}</p><footer><span>${costume.id}</span><button class="button compact" data-costume-id="${costume.id}" ${selected || loadoutLocked ? 'disabled' : ''}${operationLockTitle}>${selected ? 'PORTÉE' : loadoutLocked ? 'OPÉRATION ACTIVE' : 'APPLIQUER'}</button></footer></article>`;
  }).join('');
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
    ? `<span class="chip success">PLAN VALIDE</span><p>${snapshot.tiles.length} blocs · ${snapshot.kind} · prêt pour playtest.</p>`
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

function renderCodex() {
  const promises = [
    ['STRATÉGIE', 'actions, recherche, économie, temps et simulation des 64 mondes'],
    ['ESCOUADE', 'affectation, stress, fatigue, blessures, soins et mémorial persistants'],
    ['ARSENAL', `${WEAPONS.length} armes et ${EQUIPMENT.length} équipements acquérables et utilisables`],
    ['VÉHICULES', `${VEHICLES.length} châssis pilotables, familles et rôles par siège`],
    ['MISSIONS', `${CAMPAIGNS.length} campagnes, 16 objectifs physiques, checkpoints, retraite et conséquences`],
    ['TANTALUS', '4 ponts, 16 salles, verticalité, services, modules et crises combattues dans le niveau'],
    ['FORGE', 'validation, undo/redo, import/export et playtest mission ou vaisseau'],
    ['NEURO / APEX', `${NEURO_XENO_PROFILES.length} profils contrôlables et ${APEX_DOSSIERS.length} dossiers à conditions réelles`]
  ];
  byId('promise-matrix').innerHTML = promises.map(([name, proof]) => `<article class="promise-card"><span class="chip success">EXÉCUTABLE</span><h3>${name}</h3><p>${escapeHtml(proof)}</p></article>`).join('');
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
  renderCodex();
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
  const vehicle = operationLoadout.vehicle;
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
    missionLevelSignature: missionLevel.signature
  });
  Object.assign(saveSystem.data, { scene: 'mission', worldId: world.id, campaignId: campaign.id, levelSeedId: levelSeed.id });
  saveSystem.commit();
  byId('mission-title').textContent = campaign.name;
  byId('mission-log').textContent = `MU/TH/UR · ${campaign.objective.toUpperCase()} · ${world.name} · ${missionLevel.templateLabel.toUpperCase()} · RISQUE ${deployment.operation.risk}%`;
  showView('play');
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
    editorProject: currentEditorProject('mission'),
    strategicBriefing: deployment.operation,
    resumeState: operationLoadout.resumeState
  });
  if (operationLoadout.resumeState && !engine.lastResumeResult?.applied) applyMissionResumeState(operationLoadout.resumeState);
  renderMissionEquipment();
  return true;
}

function finalizeOperation(success, event = {}, reason = success ? 'objective' : 'retreat') {
  const operation = saveSystem.data.strategy.currentOperation;
  if (!operation) return null;
  const campaign = CAMPAIGNS.find((entry) => entry.id === operation.campaignId);
  const world = WORLDS.find((entry) => entry.id === operation.worldId || entry.id === campaign?.worldId);
  const outcome = resolveOperation(saveSystem.data, { success, kills: event.kills || 0, reason });
  if (campaign && world && outcome.ok) applyCampaignConsequence(saveSystem.data, campaign, world, { success });
  advanceGalaxy(saveSystem.data, { hours: success ? 4 : 8, generateCrisis: true });
  saveSystem.data.scene = 'hub';
  saveSystem.commit();
  renderAll();
  return outcome;
}

function handleGameEvent(event) {
  const log = byId('mission-log');
  if (!event?.type) return;
  if (event.type === 'caption') {
    if (saveSystem.data.settings.subtitles) log.textContent = `SOUS-TITRE · ${event.text || event.channel || ''}`;
    return;
  }
  if (event.type === 'mission-level-ready') {
    log.textContent = `NIVEAU ${String(event.templateId || '').toUpperCase()} · ${event.routes} routes · ${event.zones} zones · ${event.events} événements`;
  }
  if (event.type === 'mission-zone') {
    log.textContent = `ZONE · ${String(event.name || event.zoneId || '').toUpperCase()} · ${String(event.biome || 'inconnu').toUpperCase()}`;
  }
  if (event.type === 'mission-level-event') {
    recordOperationFlag(saveSystem.data, `level-event-${event.eventId}`);
    log.textContent = `ÉVÉNEMENT TERRAIN · ${String(event.eventId || '').toUpperCase()}`;
  }
  if (event.type === 'squad-ready') {
    log.textContent = `ESCOUADE DÉPLOYÉE · ${event.members?.length || 0} alliés IA physiques · ${event.animationSheets || 0} plaques animées`;
  }
  if (event.type === 'squad-action') {
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
    'squad-action', 'squad-down', 'squad-revived', 'squad-lost'
  ]);
  if (persistentEvents.has(event.type) && saveSystem.data.strategy.currentOperation) {
    persistMissionResumeState();
    saveSystem.commit();
  }
}

function persistHub(patch) {
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
    showView(interaction.action.split(':')[1]);
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
  if (!saveSystem.data.strategy.currentOperation) { engine.stop(); showView('hub'); return; }
  const outcome = finalizeOperation(false, {}, 'retreat');
  engine.stop();
  toast(outcome?.result || 'Retraite enregistrée.');
  showView('hub');
}

function playtestEditor() {
  const project = editor.serialize();
  if (!project.validation.ok) { toast(project.validation.errors.join(' ')); return; }
  if (project.kind === 'ship') {
    showView('hub');
    hubEngine.stop(false);
    hubEngine.start(saveSystem.data.hub, { editorProject: project });
    return;
  }
  const campaign = CAMPAIGNS.find((entry) => entry.id === saveSystem.data.strategy.plannedCampaignId)
    || CAMPAIGNS.find((entry) => saveSystem.data.galaxy.unlockedWorldIds.includes(entry.worldId));
  launchCampaign(campaign);
}

function setupEditor() {
  editor = new LevelEditor(byId('editor-canvas'), (project) => {
    const id = `local-forge-${project.kind}`;
    const record = { ...project, id, name: `Frontier Forge ${title(project.kind)}`, updatedAt: Date.now() };
    const existing = saveSystem.data.editor.projects.find((entry) => entry.id === id);
    if (existing) Object.assign(existing, record); else saveSystem.data.editor.projects.push(record);
    saveSystem.data.editor.activeProjectId = id;
    renderEditorStatus();
  });
  byId('editor-tools').innerHTML = TILE_TYPES.map((tool, index) => `<button class="tool-button ${index ? '' : 'active'}" data-editor-tool="${tool}">${title(tool)}</button>`).join('');
  const saved = saveSystem.data.editor.projects.find((entry) => entry.id === saveSystem.data.editor.activeProjectId);
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
    saveSystem.data.statistics.playSeconds += Math.floor((Date.now() - sessionStart) / 1000);
    sessionStart = Date.now(); persistMissionResumeState(); saveSystem.commit(); renderClock(); toast('Sauvegarde locale confirmée.');
  };
  byId('continue-operation').onclick = () => launchCampaign();
  byId('new-timeline').onclick = () => { hubEngine.stop(false); engine.stop(); saveSystem.newGame(saveSystem.profile); ensureAdvancedState(saveSystem.data); applyRuntimeSettings(); renderAll(); showView('hub'); };
  ['world-search', 'campaign-search', 'armory-search', 'enemy-search', 'vehicle-search', 'costume-search', 'module-search'].forEach((id) => byId(id).addEventListener('input', () => ({
    'world-search': renderGalaxy, 'campaign-search': renderCampaigns, 'armory-search': renderArmory,
    'enemy-search': renderEnemies, 'vehicle-search': renderVehicles, 'costume-search': renderCrew, 'module-search': renderModules
  })[id]()));
  byId('campaign-mode').onchange = renderCampaigns;
  byId('armory-kind').onchange = renderArmory;
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
  byId('exit-hub').onclick = () => { hubEngine.stop(); saveSystem.commit(); showView('command'); };
  byId('retreat-mission').onclick = retreatMission;
  byId('editor-mode').onchange = (event) => { editor.setShipMode(event.target.value === 'ship'); renderEditorStatus(); };
  byId('editor-clear').onclick = () => editor.clear();
  byId('editor-undo').onclick = () => editor.undo();
  byId('editor-redo').onclick = () => editor.redo();
  byId('editor-validate').onclick = () => { renderEditorStatus(); toast(editor.validate().ok ? 'Plan valide.' : editor.validate().errors.join(' ')); };
  byId('editor-play').onclick = playtestEditor;
  byId('editor-export').onclick = () => download(`atf-v53-${editor.serialize().kind}-${Date.now()}.json`, JSON.stringify(editor.serialize(), null, 2));
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
  globalThis.addEventListener('beforeunload', () => { hubEngine.stop(); persistMissionResumeState(); engine.stop(); saveSystem.data.statistics.playSeconds += Math.floor((Date.now() - sessionStart) / 1000); saveSystem.commit(); });
  bindDelegatedActions();
}

async function boot() {
  const validation = validateContent();
  if (!validation.ok) throw new Error(`Contrat de contenu invalide : ${validation.failures.join(', ')}`);
  setupEditor();
  setupRuntimeControls();
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
  setTimeout(() => { byId('boot').remove(); byId('app').hidden = false; showView(saveSystem.data.strategy.currentOperation ? 'operations' : 'hub'); }, 500);
}

boot().catch((error) => {
  console.error(error);
  byId('boot').innerHTML = `<div class="boot-mark">ERR</div><p>${escapeHtml(error.message)}</p>`;
});

export { saveSystem, engine, hubEngine, launchCampaign, retreatMission, renderAll, showView };
