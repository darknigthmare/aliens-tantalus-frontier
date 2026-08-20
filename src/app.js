import {
  RELEASE, CONTENT_COUNTS, WORLDS, CAMPAIGNS, WEAPONS, EQUIPMENT, ENEMIES, VEHICLES,
  CREW, COSTUMES, SHIP_MODULES, LEVEL_SEEDS, APEX_DOSSIERS, NEURO_XENO_PROFILES, validateContent
} from './content.js';
import { SaveSystem } from './save.js';
import { AudioDirector } from './audio.js';
import { GameEngine } from './game.js';
import { LevelEditor, TILE_TYPES } from './editor.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const formatNumber = (value) => new Intl.NumberFormat('fr-FR').format(value);
const formatTime = (seconds = 0) => `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
const titleCase = (value = '') => value.replace(/(^|[- ])\w/g, (letter) => letter.toUpperCase());

const memoryStorage = (() => {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) };
})();

const saveSystem = new SaveSystem(globalThis.localStorage || memoryStorage);
saveSystem.load(1);
const audio = new AudioDirector();
const engine = new GameEngine($('#game-canvas'), { audio, onEvent: handleGameEvent });
let editor;
let activeView = 'command';
let activeWorld = WORLDS[4];
let campaignLimit = 30;
let deferredInstall = null;
let sessionStart = Date.now();

const viewMeta = {
  command: ['COMMAND // OVERVIEW', 'Centre de commandement'], galaxy: ['NAV // FRONTIER MAP', 'Carte galactique'],
  operations: ['OPS // ARCHIVE', 'Opérations MIRE & Frontier'], hub: ['SHIP // USS TANTALUS', 'USS Tantalus'],
  armory: ['LOGISTICS // ARMORY', 'Armurerie'], bestiary: ['SCIENCE // XENOBIOLOGY', 'Xénobiologie tactique'],
  vehicles: ['LOGISTICS // MOTOR POOL', 'Parc de véhicules'], crew: ['PERSONNEL // ECHO-9', 'Équipe Echo-9'],
  editor: ['FORGE // WORLD AUTHORING', 'Frontier Forge'], codex: ['ARCHIVE // v1-v46', 'Codex de production'],
  settings: ['SYSTEM // CONFIGURATION', 'Système'], play: ['OPS // LIVE', 'Opération en cours']
};

function toast(message) {
  const element = document.createElement('div');
  element.className = 'toast';
  element.textContent = message;
  $('#toast-region').append(element);
  setTimeout(() => element.remove(), 3300);
}

function download(name, text, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function showView(name) {
  if (!viewMeta[name]) return;
  if (activeView === 'play' && name !== 'play') engine.stop();
  activeView = name;
  $$('.view').forEach((panel) => panel.classList.toggle('active', panel.dataset.panel === name));
  $$('.nav-button').forEach((button) => button.classList.toggle('active', button.dataset.view === name));
  $('#breadcrumb').textContent = viewMeta[name][0];
  $('#view-title').textContent = viewMeta[name][1];
  $('.rail').classList.remove('open');
  globalThis.scrollTo({ top: 0, behavior: saveSystem.data.settings.reducedMotion ? 'auto' : 'smooth' });
}

function meter(label, value, invert = false) {
  const adjusted = Math.max(0, Math.min(100, invert ? 100 - value : value));
  return `<div class="bar-row"><div class="bar-label"><span>${label}</span><b>${Math.round(value)}%</b></div><div class="bar"><i style="width:${adjusted}%"></i></div></div>`;
}

function renderCommand() {
  const headline = [
    ['CAMPAGNES', CONTENT_COUNTS.campaigns], ['MONDES', CONTENT_COUNTS.worlds], ['MENACES', CONTENT_COUNTS.enemies],
    ['ARMES', CONTENT_COUNTS.weapons], ['VÉHICULES', CONTENT_COUNTS.vehicles], ['PLANS DE NIVEAU', CONTENT_COUNTS.levelSeeds]
  ];
  $('#release-counts').innerHTML = headline.map(([label, value]) => `<div class="metric"><b>${formatNumber(value)}</b><span>${label}</span></div>`).join('');
  const threats = WORLDS.slice().sort((a, b) => (b.danger + b.infestation / 20) - (a.danger + a.infestation / 20)).slice(0, 3);
  $('#alerts').innerHTML = threats.map((world, index) => `<div class="alert-item"><span>PRIORITÉ ${index + 1}</span><div><strong>${world.name}</strong><p>${world.description}</p></div><button class="button compact" data-world-id="${world.id}">OUVRIR</button></div>`).join('');
  $('#alerts').onclick = (event) => {
    const id = event.target.dataset.worldId;
    if (!id) return;
    activeWorld = WORLDS.find((world) => world.id === id) || activeWorld;
    renderGalaxy(); showView('galaxy');
  };
  const activeCrew = saveSystem.data.crew.filter((member) => member.status === 'active');
  const avgStress = activeCrew.reduce((sum, member) => sum + member.stress, 0) / Math.max(1, activeCrew.length);
  $('#squad-summary').innerHTML = `${meter('EFFECTIF', activeCrew.length / CREW.length * 100)}${meter('STRESS MOYEN', avgStress, true)}${meter('MORAL', saveSystem.data.hub.systems.morale)}<p class="detail-copy">${activeCrew.length}/${CREW.length} opérateurs disponibles · ${saveSystem.data.memorial.length} au mémorial</p>`;
  const systems = saveSystem.data.hub.systems;
  $('#ship-summary').innerHTML = `${meter('COQUE', systems.hull)}${meter('ÉNERGIE', systems.power)}${meter('QUARANTAINE', systems.quarantine)}<p class="detail-copy">Pont ${saveSystem.data.hub.deck + 1} · ${saveSystem.data.hub.roomId.toUpperCase()}</p>`;
}

function worldPosition(index) {
  const angle = index * 2.39996;
  const radius = 8 + 5.3 * Math.sqrt(index);
  return { left: 50 + Math.cos(angle) * Math.min(45, radius), top: 50 + Math.sin(angle) * Math.min(43, radius) };
}

function renderWorldDetail(world) {
  const state = saveSystem.data.galaxy.worldState[world.id] || world;
  const campaigns = CAMPAIGNS.filter((campaign) => campaign.worldId === world.id);
  $('#world-detail').innerHTML = `<p class="eyebrow">${world.sector} // DANGER ${world.danger}</p><h3 class="detail-title">${world.name}</h3><p class="detail-copy">${world.description}</p><div class="mini-tags">${world.biomes.map((tag) => `<span>${tag}</span>`).join('')}</div><div class="data-list"><span>ATMOSPHÈRE</span><b>${world.atmosphere}</b><span>INFESTATION</span><b>${state.infestation}%</b><span>STABILITÉ</span><b>${state.stability}%</b><span>OPÉRATIONS</span><b>${campaigns.length}</b><span>PROVENANCE</span><b>${world.provenance}</b></div><button id="world-operation" class="button primary wide">PRÉPARER UNE OPÉRATION</button>`;
  $('#world-operation').onclick = () => {
    $('#campaign-search').value = world.name;
    renderCampaigns(); showView('operations');
  };
}

function renderGalaxy() {
  const term = ($('#world-search')?.value || '').toLowerCase();
  const visible = WORLDS.filter((world) => `${world.name} ${world.sector} ${world.description}`.toLowerCase().includes(term));
  $('#star-map').innerHTML = visible.map((world) => {
    const index = WORLDS.indexOf(world);
    const position = worldPosition(index);
    return `<button class="world-node ${world.id === activeWorld.id ? 'active' : ''}" data-world-id="${world.id}" style="left:${position.left}%;top:${position.top}%" title="${world.name}">${world.name}</button>`;
  }).join('');
  $('#star-map').onclick = (event) => {
    const id = event.target.dataset.worldId;
    if (!id) return;
    activeWorld = WORLDS.find((world) => world.id === id) || activeWorld;
    renderGalaxy();
  };
  renderWorldDetail(activeWorld);
}

function campaignCard(campaign, index) {
  const world = WORLDS.find((entry) => entry.id === campaign.worldId);
  return `<article class="catalog-card" data-index="${String(index + 1).padStart(3, '0')}"><span class="eyebrow">${campaign.mode} // ${campaign.source}</span><h3>${campaign.name}</h3><p>${campaign.summary}</p><div class="mini-tags"><span>${world?.name || 'Frontier'}</span><span>${campaign.objective}</span><span>${campaign.routes} routes</span></div><footer><span>${campaign.canon}</span><button class="button compact" data-campaign-id="${campaign.id}">DÉPLOYER</button></footer></article>`;
}

function renderCampaigns() {
  const mode = $('#campaign-mode').value;
  const term = $('#campaign-search').value.toLowerCase();
  const filtered = CAMPAIGNS.filter((campaign) => (mode === 'all' || campaign.mode === mode) && `${campaign.name} ${campaign.source} ${campaign.objective} ${WORLDS.find((world) => world.id === campaign.worldId)?.name}`.toLowerCase().includes(term));
  $('#campaign-list').innerHTML = filtered.slice(0, campaignLimit).map(campaignCard).join('') || '<p class="detail-copy">Aucune opération ne correspond à ces filtres.</p>';
  $('#more-campaigns').hidden = filtered.length <= campaignLimit;
}

function catalogCard(item, index, type) {
  let body = '';
  let tags = [];
  if (type === 'weapon') { body = `Dégâts ${item.damage} · cadence ${item.fireRate.toFixed(1)}/s · chargeur ${item.magazine}`; tags = [item.family, item.mark, item.rarity]; }
  if (type === 'equipment') { body = `${item.description} Charges : ${item.charges}, masse : ${item.mass.toFixed(1)} kg.`; tags = [item.utility, item.grade, item.rarity]; }
  if (type === 'enemy') { body = `PV ${item.health} · dégâts ${item.damage} · vitesse ${item.speed.toFixed(2)} · armure ${item.armor}`; tags = [item.biology, item.caste, item.frequency]; }
  if (type === 'vehicle') { body = `Coque ${item.hull} · vitesse ${item.speed} · ${item.seats.length} sièges · ${item.cargo} cargo.`; tags = [item.family, item.fit, ...item.seats.slice(0, 3).map((seat) => seat.role)]; }
  if (type === 'costume') { body = `${item.part}, palette ${item.palette}, état ${item.wear}.`; tags = [item.body, item.provenance]; }
  return `<article class="catalog-card" data-index="${String(index + 1).padStart(3, '0')}"><span class="eyebrow">${type.toUpperCase()} // ${item.provenance || item.source || 'FRONTIER'}</span><h3>${item.name}</h3><p>${body}</p><div class="mini-tags">${tags.map((tag) => `<span>${tag}</span>`).join('')}</div><footer><span>${item.id}</span></footer></article>`;
}

function renderArmory() {
  const kind = $('#armory-kind').value;
  const term = $('#armory-search').value.toLowerCase();
  const source = kind === 'weapons' ? WEAPONS : EQUIPMENT;
  const filtered = source.filter((item) => JSON.stringify(item).toLowerCase().includes(term));
  $('#armory-list').innerHTML = filtered.slice(0, 48).map((item, index) => catalogCard(item, index, kind === 'weapons' ? 'weapon' : 'equipment')).join('');
}

function renderEnemies() {
  const biology = $('#biology-filter').value;
  const term = $('#enemy-search').value.toLowerCase();
  const filtered = ENEMIES.filter((item) => (biology === 'all' || item.biology === biology) && JSON.stringify(item).toLowerCase().includes(term));
  $('#enemy-list').innerHTML = filtered.slice(0, 60).map((item, index) => catalogCard(item, index, 'enemy')).join('');
}

function renderVehicles() {
  const term = $('#vehicle-search').value.toLowerCase();
  const filtered = VEHICLES.filter((item) => JSON.stringify(item).toLowerCase().includes(term));
  $('#vehicle-list').innerHTML = filtered.slice(0, 48).map((item, index) => catalogCard(item, index, 'vehicle')).join('');
}

const roomNames = ['Bridge', 'Briefing', 'Combat Information', 'Cryo Bay', 'Crew Quarters', 'Mess', 'Medical', 'Science Lab', 'Quarantine', 'Armory', 'Workshop', 'Vehicle Bay', 'Dropship Hangar', 'Reactor', 'Life Support', 'Sensor Array'];

function renderHub(active = saveSystem.data.hub.roomId) {
  $('#ship-rooms').innerHTML = roomNames.map((name, index) => {
    const id = name.toLowerCase().replaceAll(' ', '-');
    return `<button class="room-button ${id === active ? 'active' : ''}" data-room-id="${id}" data-room-index="${index}">PONT ${Math.floor(index / 4) + 1}<br><strong>${name.toUpperCase()}</strong></button>`;
  }).join('');
  const selectedIndex = Math.max(0, roomNames.findIndex((name) => name.toLowerCase().replaceAll(' ', '-') === active));
  const modules = SHIP_MODULES.filter((module) => module.deck === Math.floor(selectedIndex / 4)).slice(0, 6);
  $('#room-detail').innerHTML = `<p class="eyebrow">PONT ${Math.floor(selectedIndex / 4) + 1} // COMPARTIMENT ${selectedIndex + 1}</p><h3 class="detail-title">${roomNames[selectedIndex]}</h3><p class="detail-copy">Compartiment navigable relié aux ascenseurs, conduits, sas et systèmes persistants du vaisseau.</p><div class="data-list">${modules.map((module) => `<span>${module.name}</span><b>NIV.${module.level}</b>`).join('')}</div><button class="button primary wide" id="visit-room">VISITER LE COMPARTIMENT</button>`;
  $('#visit-room').onclick = () => { saveSystem.data.hub.roomId = active; saveSystem.data.hub.deck = Math.floor(selectedIndex / 4); if (!saveSystem.data.hub.visited.includes(active)) saveSystem.data.hub.visited.push(active); saveSystem.commit(); toast(`${roomNames[selectedIndex]} ajouté au journal de navigation.`); };
}

function renderCrew() {
  $('#crew-list').innerHTML = CREW.map((member, index) => {
    const state = saveSystem.data.crew.find((entry) => entry.id === member.id) || member;
    return `<article class="crew-card"><div class="portrait" aria-hidden="true">${index + 1}</div><div class="crew-info"><span class="eyebrow">${member.species} // ${state.status}</span><h3>${member.name}</h3><p>${member.role} · ${member.specialty}</p>${meter('SANTÉ', state.health)}${meter('LOYALTY', state.loyalty)}</div></article>`;
  }).join('');
  $('#costume-list').innerHTML = COSTUMES.slice(0, 24).map((item, index) => catalogCard(item, index, 'costume')).join('');
}

const timelineGroups = [
  ['v1–v4', 'Fondation jouable', 'Boucle d’infestation, Marines, exploration latérale, premier arsenal et premières campagnes.'],
  ['v5–v9', 'Systèmes de survie', 'Escouade persistante, stress, blessures, ressources, sauvegardes et montée en puissance du vaisseau.'],
  ['v10–v14', 'Frontière étendue', 'Colonies, planètes, complexes, extérieurs, véhicules pilotables et rôles par siège.'],
  ['v15–v18', 'Audit de production', 'Catalogues unifiés, vérification des 134 armes historiques, 267 véhicules et couverture systémique.'],
  ['v19–v23', 'Continuités Alien', 'Isolation, Colonial Marines, Fireteam Elite, synthétiques, tenues, factions et bestiaire transmedia.'],
  ['v24–v29', 'Mondes & castes', 'Centaines d’ennemis, faune locale, castes originales, Red Hive, K-Series, Kenner et NECA.'],
  ['v30–v34', 'Archives jouables', 'Dark Descent, Rogue Incursion, AVP, Armageddon, Prometheus, Covenant et Fire and Stone.'],
  ['v35–v39', 'Metroidvania moderne', 'Écrans verticaux/horizontaux, conduits, jonctions, parallax, éditeur de niveau et intérieur de vaisseau.'],
  ['v40', 'Conversion totale', 'Chaque source reçoit une mission MIRE fidèle et une conséquence intégrée dans la continuité Frontier 2204.'],
  ['v41', 'Tantalus Frontier', 'Le projet adopte son nom final : ALIENS: TANTALUS FRONTIER.'],
  ['v42–v44', 'Double canon & Neuro-Xeno', '206 paires MIRE/Frontier, contrôleurs ATARAX, Ripper, xénoarmures et profils jouables.'],
  ['v45', 'Animation Bible', '186 profils xénomorphes, guide d’animation, pivots, événements et besoins de sprites par acteur.'],
  ['v46', 'Colonial Marines & Crucible Pass', '4 mondes, 8 campagnes, 48 ennemis, 12 Apex, 48 Neuro-Link, deux factions et nouveaux équipements additifs.'],
  ['v47', 'OpenAI Art Production & Runtime', 'Implémentation web professionnelle, assets originaux de production, PWA, QA et publication continue.']
];

function renderTimeline() {
  $('#timeline').innerHTML = timelineGroups.map(([version, title, text]) => `<article class="timeline-entry"><span class="eyebrow">${version}</span><h3>${title}</h3><p>${text}</p></article>`).join('');
}

function renderProfiles() {
  $('#profile-list').innerHTML = saveSystem.listProfiles().map((profile) => `<div class="profile-row"><div><strong>PROFIL ${profile.profile}</strong><span>${profile.empty ? 'Emplacement vide' : `${profile.release} · ${formatTime(profile.playSeconds)}`}</span></div><button class="button compact" data-profile="${profile.profile}">${profile.empty ? 'CRÉER' : 'CHARGER'}</button></div>`).join('');
  $('#setting-difficulty').value = saveSystem.data.settings.difficulty;
  $('#setting-coop').checked = saveSystem.data.settings.coop;
  $('#setting-motion').checked = saveSystem.data.settings.reducedMotion;
  $('#setting-subtitles').checked = saveSystem.data.settings.subtitles;
}

function updateSaveState() {
  $('#save-state').textContent = `Profil ${saveSystem.profile} · ${RELEASE.version} · ${formatTime(saveSystem.data.statistics.playSeconds)}`;
  const { day, hour } = saveSystem.data.clock;
  $('#clock').textContent = `J${String(day).padStart(2, '0')} ${String(Math.floor(hour)).padStart(2, '0')}:${String(Math.floor((hour % 1) * 60)).padStart(2, '0')}`;
}

function launchCampaign(campaign = CAMPAIGNS.find((item) => item.mode === 'FRONTIER')) {
  const world = WORLDS.find((item) => item.id === campaign.worldId) || WORLDS[0];
  saveSystem.data.scene = 'mission';
  saveSystem.data.worldId = world.id;
  saveSystem.data.campaignId = campaign.id;
  saveSystem.data.clock.hour += 0.25;
  saveSystem.commit();
  $('#mission-title').textContent = campaign.name;
  $('#mission-log').textContent = `MU/TH/UR: ${campaign.objective.toUpperCase()} — ${world.name}. Contact Echo-9 confirmé.`;
  showView('play');
  engine.setCoop(saveSystem.data.settings.coop);
  engine.start({ seed: LEVEL_SEEDS[CAMPAIGNS.indexOf(campaign) % LEVEL_SEEDS.length].seed, world, campaign, enemyCatalog: ENEMIES, weapon: WEAPONS[0] });
}

function handleGameEvent(event) {
  if (!saveSystem.data) return;
  if (event.type === 'shot') saveSystem.data.statistics.shots += 1;
  if (event.type === 'kill') { saveSystem.data.statistics.kills += 1; $('#mission-log').textContent = `MENACE NEUTRALISÉE: ${event.enemy.name} · total ${saveSystem.data.statistics.kills}`; }
  if (event.type === 'vehicle') $('#mission-log').textContent = event.occupied ? 'P-5000/APC: liaison conducteur établie.' : 'Véhicule sécurisé. Progression à pied.';
  if (event.type === 'player-down') { $('#mission-log').textContent = 'MARINE À TERRE — extraction médicale requise.'; audio.alarm(); saveSystem.data.statistics.deaths += 1; }
  if (event.type === 'mission-complete') {
    const campaign = CAMPAIGNS.find((item) => item.id === saveSystem.data.campaignId);
    if (campaign && !saveSystem.data.galaxy.completedCampaignIds.includes(campaign.id)) saveSystem.data.galaxy.completedCampaignIds.push(campaign.id);
    saveSystem.data.statistics.campaigns += 1;
    saveSystem.data.galaxy.resources.credits += 480 + event.kills * 12;
    saveSystem.commit();
    $('#mission-log').textContent = `OBJECTIF ACCOMPLI · ${event.kills} éliminations · données et ressources transférées au Tantalus.`;
    toast('Opération validée et conséquences sauvegardées.');
  }
}

function bind() {
  $('#nav').addEventListener('click', (event) => { const button = event.target.closest('[data-view]'); if (button) { audio.unlock(); audio.ui(); showView(button.dataset.view); } });
  $('#menu-toggle').onclick = () => $('.rail').classList.toggle('open');
  $('#quick-save').onclick = () => { saveSystem.data.statistics.playSeconds += Math.floor((Date.now() - sessionStart) / 1000); sessionStart = Date.now(); saveSystem.commit(); updateSaveState(); toast('Profil sauvegardé localement.'); };
  $$('[data-action="continue"]').forEach((button) => { button.onclick = () => { const campaign = CAMPAIGNS.find((item) => item.id === saveSystem.data.campaignId) || CAMPAIGNS.find((item) => item.mode === 'FRONTIER'); launchCampaign(campaign); }; });
  $$('[data-action="new-operation"]').forEach((button) => { button.onclick = () => { saveSystem.newGame(saveSystem.profile); renderAll(); showView('operations'); toast('Nouvelle chronologie Frontier créée.'); }; });
  $('#world-search').addEventListener('input', renderGalaxy);
  $('#campaign-mode').addEventListener('change', () => { campaignLimit = 30; renderCampaigns(); });
  $('#campaign-search').addEventListener('input', () => { campaignLimit = 30; renderCampaigns(); });
  $('#campaign-list').addEventListener('click', (event) => { const id = event.target.dataset.campaignId; if (id) launchCampaign(CAMPAIGNS.find((item) => item.id === id)); });
  $('#more-campaigns').onclick = () => { campaignLimit += 30; renderCampaigns(); };
  $('#armory-kind').addEventListener('change', renderArmory); $('#armory-search').addEventListener('input', renderArmory);
  $('#biology-filter').addEventListener('change', renderEnemies); $('#enemy-search').addEventListener('input', renderEnemies);
  $('#vehicle-search').addEventListener('input', renderVehicles);
  $('#ship-rooms').addEventListener('click', (event) => { const button = event.target.closest('[data-room-id]'); if (button) renderHub(button.dataset.roomId); });
  $('#exit-mission').onclick = () => { engine.stop(); saveSystem.data.scene = 'hub'; saveSystem.commit(); renderCommand(); showView('command'); };
  $('#editor-mode').onchange = (event) => editor.setShipMode(event.target.value === 'ship');
  $('#editor-clear').onclick = () => editor.clear();
  $('#editor-export').onclick = () => download(`atf-${editor.shipMode ? 'ship' : 'mission'}-${Date.now()}.json`, JSON.stringify(editor.serialize(), null, 2));
  $('#editor-import').onchange = async (event) => { try { editor.load(JSON.parse(await event.target.files[0].text())); toast('Plan importé dans Frontier Forge.'); } catch (error) { toast(error.message); } };
  $('#editor-play').onclick = () => launchCampaign(CAMPAIGNS.find((campaign) => campaign.mode === 'CRUCIBLE'));
  $('#profile-list').onclick = (event) => { const profile = Number(event.target.dataset.profile); if (!profile) return; const entry = saveSystem.listProfiles().find((item) => item.profile === profile); entry.empty ? saveSystem.newGame(profile) : saveSystem.load(profile); renderAll(); toast(`Profil ${profile} actif.`); };
  $('#setting-difficulty').onchange = (event) => { saveSystem.data.settings.difficulty = event.target.value; saveSystem.commit(); };
  $('#setting-coop').onchange = (event) => { saveSystem.data.settings.coop = event.target.checked; saveSystem.commit(); engine.setCoop(event.target.checked); };
  $('#setting-motion').onchange = (event) => { saveSystem.data.settings.reducedMotion = event.target.checked; document.documentElement.classList.toggle('reduced-motion', event.target.checked); saveSystem.commit(); };
  $('#setting-subtitles').onchange = (event) => { saveSystem.data.settings.subtitles = event.target.checked; saveSystem.commit(); };
  $('#save-export').onclick = () => download(`aliens-tantalus-frontier-profile-${saveSystem.profile}.json`, saveSystem.export());
  $('#save-import').onchange = async (event) => { try { saveSystem.import(await event.target.files[0].text()); renderAll(); toast('Sauvegarde importée et migrée vers le schéma v47.'); } catch (error) { toast(error.message); } };
  globalThis.addEventListener('beforeinstallprompt', (event) => { event.preventDefault(); deferredInstall = event; $('#install-app').hidden = false; });
  $('#install-app').onclick = async () => { if (!deferredInstall) return; deferredInstall.prompt(); await deferredInstall.userChoice; deferredInstall = null; $('#install-app').hidden = true; };
  globalThis.addEventListener('beforeunload', () => { saveSystem.data.statistics.playSeconds += Math.floor((Date.now() - sessionStart) / 1000); saveSystem.commit(); });
}

function setupEditor() {
  editor = new LevelEditor($('#editor-canvas'), (project) => {
    const existing = saveSystem.data.editor.projects.find((item) => item.id === 'local-forge');
    const record = { id: 'local-forge', name: 'Frontier Forge Local', updatedAt: Date.now(), ...project };
    if (existing) Object.assign(existing, record); else saveSystem.data.editor.projects.push(record);
  });
  $('#editor-tools').innerHTML = TILE_TYPES.map((tool, index) => `<button class="tool-button ${index === 0 ? 'active' : ''}" data-tool="${tool}">${titleCase(tool)}</button>`).join('');
  $('#editor-tools').onclick = (event) => { const button = event.target.closest('[data-tool]'); if (!button) return; editor.setTool(button.dataset.tool); $$('.tool-button').forEach((item) => item.classList.toggle('active', item === button)); };
}

function renderAll() {
  renderCommand(); renderGalaxy(); renderCampaigns(); renderArmory(); renderEnemies(); renderVehicles(); renderHub(); renderCrew(); renderTimeline(); renderProfiles(); updateSaveState();
}

async function boot() {
  const validation = validateContent();
  if (!validation.ok) throw new Error(`Contrat de contenu invalide: ${validation.failures.join(', ')}`);
  setupEditor(); bind(); renderAll();
  document.documentElement.classList.toggle('reduced-motion', saveSystem.data.settings.reducedMotion);
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('/sw.js').catch(() => {});
  setTimeout(() => { $('#boot').remove(); $('#app').hidden = false; }, 650);
}

boot().catch((error) => {
  console.error(error);
  $('#boot').innerHTML = `<div class="boot-mark">ERR</div><p>${error.message}</p>`;
});

export { launchCampaign, renderAll, showView };
