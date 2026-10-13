import { buildMissionLevelV52, validateMissionTopologyV52, validateMissionPhysicalTopologyV57 } from './mission-levels-v52.js';
import { validateMissionTopologyV58 } from './topology-coherence-v58.js';
import { sweepProjectileAabbV83 } from './projectile-collision-v83.js';
import { updateEnemySupportStatusesV72 } from './gameplay-support-v72.js';
import { ECOSYSTEM_OPERATIONS_V131, SAURIA_CASTES_V131, createEcosystemStateV131,
  validateEcosystemStateV131, advancePopulationV131, biosphereIntegrityV131,
  ecosystemPhaseV131, ecosystemDossierV131 } from './ecosystem-systems-v131.js';

const clone = value => structuredClone(value);
const list = value => Array.isArray(value) ? value : [];
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const center = actor => ({ x: actor.x + actor.w / 2, y: actor.y + actor.h });
const near = (actor, prop, radius = 86) => actor && prop && Math.hypot(center(actor).x - prop.x, center(actor).y - prop.floorY) <= radius;
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const own = actor => Boolean(actor?.ecosystemActorV131);
const campaign = (id, operationId, name, summary, objective) => Object.freeze({ id, specialOperationId: operationId,
  name, summary, objective, mode: 'STORY', worldId: 'world-05-lethe', year: 2204, canon: 'project-continuity',
  source: 'Tantalus Special Operations', routes: 2, templateId: 'planet-exterior',
  description: 'Adaptation jouable originale : acteurs biologiques vectoriels provisoires. Les planches dédiées et le scénario complet restent à produire.',
  artworkStatus: 'original-vector-prototype', canonExact: false, implementationStatus: 'partial' });
export const ECOSYSTEM_CAMPAIGNS_V131 = Object.freeze([
  campaign('special-queen-mother-v131', 'queen-mother-song', 'LE CHANT DE LA REINE-MÈRE',
    'Trois Chœurs entretiennent une emprise maternelle. La nurserie et les balises déterminent le repli.', 'Rompre les Chœurs, battre la Reine-Mère en quatre phases puis défendre les balises.'),
  campaign('special-hive-world-v131', 'hive-world', 'LV-XENO · LA RUCHE-MONDE',
    'Une surface vivante relie quatre organes à un noyau. Le bruit augmente une alerte qui transforme la route basse.', 'Détruire quatre organes, neutraliser le noyau et revenir au sas avant l’effondrement.'),
  campaign('special-pangaea-v131', 'pangaea-second-extinction', 'PANGAEA · LA SECONDE EXTINCTION',
    'Préserver une population saine face à sept castes Sauria et à une infection transmise dans les biomes.', 'Contenir trois nids, sauver trois hôtes puis neutraliser le Porte-Ruche Colosse.')
]);
const targetPositions = [{ x: 950, floorY: 355 }, { x: 1720, floorY: 570 }, { x: 2460, floorY: 355 }, { x: 3100, floorY: 570 }];
const props = Object.freeze({ supply: { x: 350, floorY: 570 }, focus: { x: 570, floorY: 570 },
  nursery: [{ x: 1150, floorY: 355 }, { x: 2100, floorY: 570 }, { x: 2750, floorY: 355 }],
  beacons: [{ x: 4280, floorY: 570 }, { x: 4540, floorY: 570 }],
  extraction: { x: 4950, floorY: 570 }, insertion: { x: 180, floorY: 570 } });

export function buildEcosystemMissionV131(options = {}) {
  const selected = ECOSYSTEM_CAMPAIGNS_V131.find(entry => entry.id === options.campaign?.id
    || entry.specialOperationId === options.operationId) || ECOSYSTEM_CAMPAIGNS_V131[0];
  const base = buildMissionLevelV52({ ...options, campaign: selected, templateId: 'planet-exterior' });
  const labels = selected.specialOperationId === 'queen-mother-song'
    ? ['Approche royale', 'Chœur et nurserie', 'Artère royale', 'Chœur supérieur', 'Gardien et palais', 'Balises de repli']
    : selected.specialOperationId === 'hive-world'
      ? ['Sas orbital', 'Poumon vivant', 'Artère digestive', 'Ganglion sensoriel', 'Ventricule et noyau', 'Croûte instable']
      : ['Vallée saine', 'Voie de migration', 'Forêt infectée', 'Eaux noires', 'Cathédrale d’os', 'Porte-Ruche'];
  const biomeZones = base.biomeZones.map((zone, index) => ({ ...zone, label: labels[index] || labels.at(-1), biomeRole: `ecosystem-${index}` }));
  const zoneAt = x => biomeZones.find(zone => x >= zone.x && x < zone.x + zone.w)?.id || biomeZones.at(-1).id;
  const groundXs = [180, 650, 950, 1720, 2460, 3100, 3780, 4400, 4950];
  const nodes = groundXs.map((x, index) => ({ id: `eco-ground-${index}`, x, y: 570, zoneId: zoneAt(x), width: 240,
    ...(index === 0 ? { anchor: 'spawn' } : index === groundXs.length - 1 ? { anchor: 'extraction' } : index === 6 ? { anchor: 'boss' } : {}) }));
  const upper = groundXs.slice(1, -1).map((x, index) => ({ id: `eco-upper-${index}`, x, y: 355, zoneId: zoneAt(x), width: 240 }));
  const lowerRoute = nodes.map(node => node.id), upperRoute = [nodes[0].id, nodes[1].id, ...upper.map(node => node.id), nodes[7].id, nodes[8].id];
  const edges = [];
  const addPath = (path, id) => {
    for (let index = 1; index < path.length; index++) {
      const from = [...nodes, ...upper].find(node => node.id === path[index - 1]), to = [...nodes, ...upper].find(node => node.id === path[index]);
      if (edges.some(edge => edge.from === from.id && edge.to === to.id)) continue;
      edges.push({ id: `eco-${id}-${index}`, from: from.id, to: to.id, kind: from.y === to.y ? 'walk' : 'ladder', routeIds: [id] });
    }
  };
  addPath(lowerRoute, 'lower'); addPath(upperRoute, 'upper');
  const platforms = [{ id: 'eco-floor', x: 0, y: 570, w: 5200, h: 40, floor: true, zoneId: zoneAt(200), art: 'floor' },
    { id: 'eco-upper', x: 550, y: 355, w: 3970, h: 22, zoneId: zoneAt(950), art: 'grate' }];
  const ladders = [650, 1500, 2400, 3200, 4400].map((x, index) => ({ id: `eco-ladder-${index}`, x: x - 25, y: 355, w: 50, h: 237, top: 355, bottom: 570 }));
  for (const node of [...nodes, ...upper]) platforms.push({ id: `eco-node-${node.id}`, nodeId: node.id,
    x: node.x - 120, y: node.y, w: 240, h: 22, zoneId: node.zoneId, kind: 'template-node' });
  for (const edge of edges) {
    const from = [...nodes, ...upper].find(node => node.id === edge.from), to = [...nodes, ...upper].find(node => node.id === edge.to);
    if (edge.kind === 'walk') platforms.push({ id: `eco-span-${edge.id}`, edgeId: edge.id,
      x: Math.min(from.x, to.x), y: from.y, w: Math.max(1, Math.abs(to.x - from.x)), h: 22, kind: 'route-bridge', zoneId: from.zoneId });
    else {
      const ladder = ladders.find(ladder => Math.abs(ladder.x + ladder.w / 2 - from.x) < 1);
      Object.assign(ladder, { id: edge.id, from: from.id, to: to.id });
    }
  }
  const anchors = Object.fromEntries(nodes.filter(node => node.anchor).map(node => [node.anchor, { nodeId: node.id, x: node.x, y: node.y, zoneId: node.zoneId }]));
  const graph = { nodes: [...nodes, ...upper], edges, routes: [{ id: 'lower', role: 'direct', nodeIds: lowerRoute }, { id: 'upper', role: 'elevated', nodeIds: upperRoute }] };
  const plan = { ...base, label: selected.name, signature: `${base.signature}:ecosystem-v131:${selected.specialOperationId}`,
    geometry: { platforms, ladders, doors: [], vents: [], lifts: [] }, graph, anchors, biomeZones,
    events: [], spawns: [], hazards: [], aquaticHabitats: [],
    routeRuntime: { ...base.routeRuntime, source: 'ecosystem-authored-v131', platforms, ladders, hazards: [], biomeZones,
      routeNodes: graph.nodes.map(node => ({ ...node, routeIds: node.y === 355 ? ['upper'] : ['lower'] })), routes: 2, maxTier: 2, verticalSpan: 215 },
    verticalWorldV130: { enabled: false },
    ecosystemV131: { schema: 131, operationId: selected.specialOperationId, props: clone(props), artworkStatus: 'original-vector-prototype' },
    rearEntrancesV130: [{ id: 'eco-rear-a', x: 2070, y: 454, w: 76, h: 116, floorY: 570 },
      { id: 'eco-rear-b', x: 4180, y: 454, w: 76, h: 116, floorY: 570 }],
    destructibleSceneryV130: [{ id: 'eco-observation-glass', x: 1450, y: 464, w: 18, h: 106, hp: 24, material: 'glass', plane: 'gameplay' }] };
  const checks = [validateMissionTopologyV52(plan), validateMissionPhysicalTopologyV57(plan), validateMissionTopologyV58(plan)];
  const errors = checks.flatMap(check => check.errors || []);
  if (errors.length) throw new Error(`Ecosystem level topology: ${errors.join('; ')}`);
  plan.validation = { valid: true, errors: [], physicalValid: true, roomCoherenceValid: true, routes: 2, authoredEcosystemV131: true };
  return plan;
}

export function withEcosystemMissionsV131(BaseEngine) {
  if (BaseEngine.ecosystemRuntimeV131) return BaseEngine;
  return class EcosystemMissionsV131 extends BaseEngine {
    static ecosystemRuntimeV131 = true;
    start(options = {}) {
      this.ecosystemActiveV131 = ECOSYSTEM_CAMPAIGNS_V131.some(entry => entry.id === options.campaign?.id);
      this.ecosystemV131 = this.ecosystemActiveV131 ? createEcosystemStateV131(options.campaign.specialOperationId) : null;
      this.ecosystemCheckpointV131 = null;
      if (!this.ecosystemActiveV131) return super.start(options);
      if (!options.missionLevel?.validation?.valid || options.missionLevel.ecosystemV131?.operationId !== this.ecosystemV131.operationId)
        throw new Error('An ecosystem operation requires its authored and validated mission level.');
      const result = super.start({ ...options, resumeState: undefined, userCasteCampaignV88: false });
      this.configureEcosystemWorldV131();
      if (options.resumeState) this.lastResumeResult = this.applyResumeState(options.resumeState);
      this.syncEcosystemV131();
      this.ecosystemCheckpointV131 ||= this.captureEcosystemCheckpointV131();
      this.onEvent?.({ type: 'special-operation-started', operationId: this.ecosystemV131.operationId,
        artworkStatus: 'original-vector-prototype', canonExact: false });
      return { ...result, ecosystemV131: this.ecosystemSnapshotV131() };
    }
    isEcosystemV131() { return Boolean(this.ecosystemActiveV131 && this.ecosystemV131); }
    ecosystemCanActV131(actor = this.player) {
      return Boolean(this.running && !this.paused && !this.enemyAtlasLoadingPausedV65 && !this.userCasteLoadingV88
        && this.mission?.state === 'active' && actor?.alive && !actor.downed && !actor.inVehicle && !actor.ventTransit
        && (actor === this.player || actor === this.coop && this.coopEnabled) && !actor.reloading
        && !actor.fieldActionV124 && !(actor.stunClock > 0));
    }
    configureEcosystemWorldV131() {
      this.enemies = []; this.bullets = []; this.hostileProjectiles = []; this.drops = [];
      this.objectiveNodes = []; this.collectablesV68 = []; this.narrativeCollectablesV68 = [];
      this.powerNode = null; this.archiveTerminal = null; this.ventShortcut = null;
      this.supplies = []; this.doors = []; this.vents = []; this.covers = [];
      this.missionVentNetworkV62 = null; this.missionVentActorsV62?.clear();
      this.missionLevelEvents?.clear(); this.missionLevelSpawns?.clear(); this.missionLevelTimers?.clear();
      this.missionLevelExtractionTimer = null; this.missionLevelExtractionUnlocked = false;
      if (this.weaponPickup) this.weaponPickup.taken = true;
      if (this.toolPickup) this.toolPickup.taken = true;
      if (this.vehicle) { this.vehicle.active = false; this.vehicle.occupied = false; this.vehicle.driver = null; }
      for (const [index, actor] of [this.player, this.coop, ...list(this.squadActors)].entries()) if (actor) {
        actor.x = 180 - index * 44; actor.y = 570 - actor.h; actor.vx = 0; actor.vy = 0; actor.inVehicle = false;
      }
      this.objective = { id: 'eco-extraction', x: 4910, y: 450, w: 100, h: 120, complete: false };
      this.checkpoint = { id: 'insertion', x: this.player.x, y: this.player.y };
      const state = this.ecosystemV131;
      for (let index = 0; index < state.targets.length; index++) this.ecosystemSpawnV131({
        id: `eco131-target-${index}`, role: 'target', ...targetPositions[index], targetIndex: index,
        label: state.operationId === 'queen-mother-song' ? `CHŒUR ${index + 1}` : state.operationId === 'hive-world' ? ['POUMON', 'ESTOMAC', 'GANGLION', 'VENTRICULE'][index] : `NID ${index + 1}` });
      this.ecosystemSpawnV131({ id: 'eco131-boss', role: 'boss', x: 3780, floorY: 570,
        label: state.operationId === 'queen-mother-song' ? 'REINE-MÈRE' : state.operationId === 'hive-world' ? 'NOYAU PLANÉTAIRE' : 'PORTE-RUCHE COLOSSE' });
      if (state.operationId === 'pangaea-second-extinction') {
        for (let index = 0; index < 14; index++) {
          const caste = SAURIA_CASTES_V131[index % 7], healthy = index < 7;
          const floorY = !healthy && ['leaper', 'spitter'].includes(caste.id) ? 355 : 570;
          const x = caste.id === 'swimmer' && !healthy ? 2540 : healthy ? 680 + index * 390 : 880 + (index % 7) * 420;
          const id = `eco131-population-${index}`;
          state.population.push({ id, caste: caste.id, originalHost: healthy, status: healthy ? 'healthy' : 'infected', infection: healthy ? index < 2 ? 25 : 0 : 100 });
          this.ecosystemSpawnV131({ id, role: healthy ? 'host' : 'sauria', x, floorY, caste: caste.id, label: healthy ? 'HÔTE SAIN' : `SAURIA · ${caste.label}` });
        }
        this.hazards = [{ id: 'eco-black-water', kind: 'flood', x: 2290, y: 548, w: 570, h: 22,
          active: true, damage: 0, slow: .58, surfacePlatformId: 'eco-floor' }];
      } else {
        for (let index = 0; index < 6; index++) this.ecosystemSpawnV131({ id: `eco131-guard-${index}`, role: 'guard',
          x: 800 + index * 520, floorY: index % 2 ? 355 : 570, label: state.operationId === 'queen-mother-song' ? 'GARDE ROYALE · ADAPTATION' : 'GARDE D’ORGANE' });
      }
      this.ecosystemAuthoredActorsV131 = clone(state.actors);
    }
    ecosystemSpawnV131(descriptor, recordState = true) {
      const state = this.ecosystemV131, caste = SAURIA_CASTES_V131.find(entry => entry.id === descriptor.caste);
      const member = state.population.find(entry => entry.id === descriptor.id);
      const boss = descriptor.role === 'boss', target = descriptor.role === 'target', healthy = member?.status === 'healthy';
      const health = boss ? state.operationId === 'queen-mother-song' ? 600 : 540 : target ? 110 : healthy ? 120 : caste?.health || 105;
      const actor = this.createEnemy({ id: descriptor.id, name: descriptor.label, biology: healthy ? 'animal' : 'xenomorph', health, damage: caste?.damage || 14 },
        this.enemies.length, descriptor.x, descriptor.floorY, { boss: false, keyCarrier: false });
      Object.assign(actor, { id: descriptor.id, name: descriptor.label || actor.name, ecosystemActorV131: clone(descriptor),
        w: boss ? 170 : target ? 66 : caste?.id === 'charger' || caste?.id === 'sentinel' ? 84 : 58,
        h: boss ? 210 : target ? 90 : 70, health, maxHealth: health, armor: 0, acid: 0, reward: 0,
        isBoss: boss, isRoyal: false, royalScaleV72: false, visualApproximation: true, visualIdentityStatus: 'original-vector-prototype',
        behavior: 'ecosystem-original', behaviorProfileV119: { aiProfile: 'ecosystem-original' }, alert: false,
        clock: descriptor.clock ?? 0, attackClock: descriptor.attackClock ?? .6, windup: descriptor.windup ?? 0,
        actionPhase: descriptor.actionPhase ?? 0, facing: -1 });
      actor.y = descriptor.floorY - actor.h;
      delete actor.batchCombatV66; delete actor.enemyBatchCombatV66; delete actor.userCasteCombatV89;
      this.enemies.push(actor);
      if (recordState) state.actors.push({ ...clone(descriptor), clock: actor.clock, attackClock: actor.attackClock, windup: actor.windup, actionPhase: actor.actionPhase });
      return actor;
    }
    ecosystemActorV131(id) { return this.enemies.find(actor => actor.id === id); }
    syncEcosystemV131() {
      if (!this.isEcosystemV131() || !this.mission) return;
      const state = this.ecosystemV131; state.phase = ecosystemPhaseV131(state);
      if (state.operationId === 'pangaea-second-extinction') state.integrity = biosphereIntegrityV131(state);
      this.mission.phase = state.phase;
      this.mission.objectives = { power: state.targets.every(Boolean), route: state.operationId !== 'pangaea-second-extinction' || state.rescued >= 3,
        boss: state.bossDefeated, archive: state.operationId !== 'queen-mother-song' || state.defenceElapsed >= 22, extract: state.complete };
      this.objective.complete = state.complete;
      if (state.complete && state.rewards) this.mission.rewards = clone(state.rewards);
      this.objective.x = state.operationId === 'hive-world' && state.bossDefeated ? 140 : 4910;
      if (state.operationId === 'hive-world') {
        const gate = { id: 'eco-reactive-tissue', x: 2850, y: 460, w: 28, h: 110, art: 'breakable' };
        const existing = this.walls.find(wall => wall.id === gate.id);
        if (state.pressure >= 70 && !existing && ![this.player, this.coopEnabled ? this.coop : null, ...list(this.squadActors), ...this.enemies]
          .filter(Boolean).some(actor => actor.alive && overlap(actor, gate))) this.walls.push(gate);
        else if (state.pressure < 40 && existing) this.walls = this.walls.filter(wall => wall !== existing);
      }
    }
    updateObjectiveRuntime(delta) { if (!this.isEcosystemV131()) return super.updateObjectiveRuntime(delta); }
    updateMissionPhase() { if (!this.isEcosystemV131()) return super.updateMissionPhase(); this.syncEcosystemV131(); }
    missingObjectiveRequirement(options) { return this.isEcosystemV131() ? this.missingEcosystemRequirementV131() : super.missingObjectiveRequirement(options); }
    missingExtractionRequirement() { return this.isEcosystemV131() ? this.missingEcosystemRequirementV131() : super.missingExtractionRequirement(); }
    missingEcosystemRequirementV131() {
      const state = this.ecosystemV131;
      if (!state || state.targets.some(done => !done)) return 'STRUCTURES BIOLOGIQUES ENCORE ACTIVES';
      if (state.operationId === 'pangaea-second-extinction' && state.rescued < 3) return 'TROIS HÔTES SAINS À SAUVER';
      if (!state.bossDefeated) return 'BOSS ENCORE ACTIF';
      if (state.operationId === 'queen-mother-song' && state.defenceElapsed < 22) return 'BALISES À DÉFENDRE';
      if (!near(this.player, state.operationId === 'hive-world' ? props.insertion : props.extraction, 115)) return 'REJOINDRE LE SAS';
      return state.extractionProgress >= 2 ? '' : 'MAINTENIR E DEUX SECONDES';
    }
    ecosystemInteractionV131(actor = this.player) {
      if (!this.ecosystemCanActV131(actor)) return null;
      const state = this.ecosystemV131;
      if (!state.supplyTaken && near(actor, props.supply)) return { id: 'supply', text: 'E · DÉPÔT : MUNITIONS ET VACCINS' };
      if (state.operationId === 'queen-mother-song') {
        if (state.pressure > 10 && state.focusCharges > 0 && near(actor, props.focus)) return { id: 'focus', text: 'E · ISOLEMENT : RÉDUIRE L’EMPRISE · CHARGE LIMITÉE' };
        const nursery = props.nursery.findIndex((prop, index) => !state.nursery[index] && near(actor, prop));
        if (nursery >= 0) return { id: `nursery-${nursery}`, text: 'MAINTENIR E 2 S · SAUVER LE COCON' };
        const beacon = props.beacons.findIndex((prop, index) => !state.beacons[index] && near(actor, prop));
        if (state.bossDefeated && beacon >= 0) return { id: `beacon-${beacon}`, text: 'E · ALIMENTER LA BALISE' };
      }
      if (state.operationId === 'pangaea-second-extinction' && state.vaccineCharges > 0) {
        const member = state.population.find(member => member.status === 'healthy' && near(actor,
          { x: center(this.ecosystemActorV131(member.id)).x, floorY: center(this.ecosystemActorV131(member.id)).y }, 92));
        if (member) return { id: member.id, text: 'MAINTENIR E 2 S · VACCINER ET ÉVACUER UN HÔTE SAIN' };
      }
      const exit = state.operationId === 'hive-world' ? props.insertion : props.extraction;
      if (state.bossDefeated && near(actor, exit, 115)) return { id: 'extract', text: 'MAINTENIR E 2 S · SAS D’EXTRACTION' };
      return null;
    }
    interact(actor = this.player) {
      if (!this.isEcosystemV131()) return super.interact(actor);
      const interaction = this.ecosystemInteractionV131(actor);
      if (!interaction) return false;
      const state = this.ecosystemV131;
      if (interaction.id === 'supply') {
        state.supplyTaken = true; actor.ammoReserve += 280;
        if (state.operationId === 'pangaea-second-extinction') state.vaccineCharges = Math.min(8, state.vaccineCharges + 3);
        this.onEvent?.({ type: 'ecosystem-supply-v131', operationId: state.operationId, ammo: 280 }); return true;
      }
      if (interaction.id === 'focus') { state.focusCharges--; state.pressure = Math.max(0, state.pressure - 45); return true; }
      if (interaction.id.startsWith('beacon-')) {
        state.beacons[Number(interaction.id.at(-1))] = true;
        this.ecosystemMilestoneV131(interaction.id, 'Balise alimentée. Garder le secteur jusqu’à l’ouverture du sas.');
        return true;
      }
      return true;
    }
    update(delta) {
      if (!this.isEcosystemV131()) return super.update(delta);
      if (!this.running || this.paused || this.enemyAtlasLoadingPausedV65 || this.userCasteLoadingV88 || this.mission?.state !== 'active') return;
      if (!this.player?.alive && !(this.coopEnabled && this.coop?.alive)) { this.failMission('L’équipe ne peut plus rejoindre le sas.'); return; }
      if (!Number.isFinite(delta) || delta <= 0) return;
      const dt = Math.min(delta, .1), state = this.ecosystemV131;
      const active = this.ecosystemCanActV131(this.player), interaction = active && this.keys.has('KeyE') ? this.ecosystemInteractionV131(this.player) : null;
      if (interaction && ['supply', 'focus'].includes(interaction.id) || interaction?.id.startsWith('beacon-')) this.interact();
      if (interaction && (interaction.id === 'extract' || interaction.id.startsWith('nursery-') || interaction.id.startsWith('eco131-population-'))) {
        if (state.interactionTarget !== interaction.id) { state.interactionTarget = interaction.id; state.interactionProgress = 0; }
        state.interactionProgress = Math.min(2, state.interactionProgress + dt);
        if (interaction.id === 'extract') {
          if (state.targets.every(Boolean) && state.bossDefeated && (state.operationId !== 'queen-mother-song' || state.defenceElapsed >= 22)
            && (state.operationId !== 'pangaea-second-extinction' || state.rescued >= 3)) state.extractionProgress = state.interactionProgress;
          else state.extractionProgress = 0;
          if (state.extractionProgress >= 2) this.completeMission(this.player);
        } else if (state.interactionProgress >= 2) {
          if (interaction.id.startsWith('nursery-')) { state.nursery[Number(interaction.id.at(-1))] = true; state.pressure = Math.max(0, state.pressure - 18); }
          else {
            const member = state.population.find(member => member.id === interaction.id), actor = this.ecosystemActorV131(member.id);
            if (member.status === 'healthy' && state.vaccineCharges > 0) { state.vaccineCharges--; state.rescued++; member.status = 'rescued'; actor.alive = false; actor.health = 0; }
          }
          state.interactionProgress = 0; state.interactionTarget = null;
          this.ecosystemMilestoneV131(interaction.id, 'Sauvetage confirmé : cette population ne peut plus être infectée.');
        }
      } else { state.interactionProgress = 0; state.interactionTarget = null; state.extractionProgress = 0; }
      if (this.mission?.state !== 'active') return;
      if (state.operationId === 'queen-mother-song') {
        const remaining = state.targets.filter(done => !done).length, inRoyal = center(this.player).x > 700;
        const growth = inRoyal && !state.bossDefeated ? remaining * .48 + .18 * state.bossPhase : -.7;
        state.pressure = clamp(state.pressure + growth * dt * (1 - state.nursery.filter(Boolean).length * .12), 0, 100);
        if (state.pressure >= 100) { this.failMission('L’emprise maternelle a rompu le contrôle de l’équipe.'); return; }
        if (state.bossDefeated && state.beacons.every(Boolean) && center(this.player).x >= 4160 && center(this.player).x <= 4700) {
          const before = Math.floor(state.defenceElapsed / 7);
          state.defenceElapsed = Math.min(22, state.defenceElapsed + dt);
          if (Math.floor(state.defenceElapsed / 7) > before && state.defenceElapsed < 22) this.spawnEcosystemWaveV131(`beacon-${before}`, 4680);
        }
      } else if (state.operationId === 'hive-world') {
        state.pressure = clamp(state.pressure - (center(this.player).x < 600 ? .9 : .15) * dt, 0, 100);
        if (state.bossDefeated) {
          state.collapseRemaining = Math.max(0, state.collapseRemaining - dt);
          if (state.collapseRemaining <= 0) { this.failMission('Le sas a été englouti par l’effondrement planétaire.'); return; }
        }
      } else {
        const positions = new Map(this.enemies.map(actor => [actor.id, { x: actor.x, y: actor.y + actor.h }]));
        for (const id of advancePopulationV131(state, dt, positions)) {
          const actor = this.ecosystemActorV131(id), member = state.population.find(member => member.id === id), caste = SAURIA_CASTES_V131.find(caste => caste.id === member.caste);
          actor.ecosystemActorV131.role = 'sauria'; actor.name = `SAURIA · ${caste.label}`; actor.biology = 'xenomorph';
          actor.maxHealth = caste.health; actor.health = Math.min(caste.health, Math.max(35, actor.health));
          this.onEvent?.({ type: 'ecosystem-infection-v131', actorId: id, caste: member.caste });
        }
        if (state.integrity <= 25) { this.failMission('L’intégrité de la biosphère est devenue irrécupérable.'); return; }
        if (state.rescued < 3 && state.population.filter(member => member.status === 'healthy').length + state.rescued < 3) {
          this.failMission('Il ne reste plus assez d’hôtes sains pour le protocole de sauvetage.'); return;
        }
      }
      this.syncEcosystemV131();
      super.update(dt);
      this.player.x = clamp(this.player.x, 0, 5200 - this.player.w);
      this.camera.x = clamp(this.camera.x, 0, 5200 - 1280);
      this.camera.y = 0;
    }
    fire(actor) {
      const shots = actor?.shots || 0, result = super.fire(actor);
      if (this.isEcosystemV131() && this.ecosystemV131.operationId === 'hive-world' && (actor?.shots || 0) > shots)
        this.ecosystemV131.pressure = Math.min(100, this.ecosystemV131.pressure + 1.1);
      return result;
    }
    updatePlayer(actor, delta, controls) {
      if (!this.isEcosystemV131() || this.ecosystemV131.operationId !== 'queen-mother-song'
        || this.ecosystemV131.pressure < 60 || !this.environmentStatus) return super.updatePlayer(actor, delta, controls);
      const environment = this.environmentStatus, previous = { slowUntil: environment.slowUntil, slowFactor: environment.slowFactor };
      const influenceFactor = this.ecosystemV131.pressure >= 85 ? .55 : .78;
      environment.slowFactor = Math.min(influenceFactor, this.animationTime < environment.slowUntil ? environment.slowFactor : 1);
      environment.slowUntil = Math.max(this.animationTime + delta + .01, environment.slowUntil || 0);
      try { return super.updatePlayer(actor, delta, controls); } finally { Object.assign(environment, previous); }
    }
    ecosystemLineClearV131(from, target) {
      const a = { x: from.x + from.w / 2, y: from.y + from.h * .45, w: 0, h: 0 };
      const d = { x: target.x + target.w / 2 - a.x, y: target.y + target.h * .45 - a.y };
      return ![...list(this.walls), ...list(this.covers), ...list(this.closedDoorColliders?.())]
        .filter(obstacle => !obstacle.destroyed).some(obstacle => sweepProjectileAabbV83(a, d, obstacle));
    }
    updateEnemy(actor, delta) {
      if (!this.isEcosystemV131() || !own(actor)) return super.updateEnemy(actor, delta);
      if (!actor.alive || this.paused || this.mission?.state !== 'active') return;
      const dt = Math.min(delta, .1), state = this.ecosystemV131, descriptor = actor.ecosystemActorV131;
      actor.clock = (actor.clock + dt) % 60; actor.attackClock = Math.max(0, actor.attackClock - dt);
      actor.hurtClock = Math.max(0, actor.hurtClock - dt);
      const baseSpeed = actor.speed; let speedScale = 1;
      updateEnemySupportStatusesV72(actor, dt, () => { speedScale = baseSpeed > 0 ? actor.speed / baseSpeed : 1; });
      if (actor.supportStunV72 > 0 || actor.stunClock > 0) return;
      if (descriptor.role === 'target') return;
      const member = state.population.find(member => member.id === actor.id);
      const caste = SAURIA_CASTES_V131.find(caste => caste.id === (member?.caste || descriptor.caste));
      if (member?.status === 'healthy') {
        const old = actor.x; actor.x = clamp(actor.x + Math.sin(actor.clock * .4) * 15 * dt, descriptor.x - 90, descriptor.x + 90);
        this.resolveHorizontal(actor, old); return;
      }
      const pool = [this.player, this.coopEnabled ? this.coop : null, ...list(this.squadActors)]
        .filter(target => target?.alive && !target.downed && !target.inVehicle && !target.ventTransit);
      const target = pool.sort((a, b) => Math.hypot(a.x - actor.x, a.y - actor.y) - Math.hypot(b.x - actor.x, b.y - actor.y))[0];
      if (!target) return;
      const distance = Math.abs(center(target).x - center(actor).x), sameFloor = Math.abs(center(target).y - center(actor).y) < 65;
      const direction = Math.sign(center(target).x - center(actor).x) || actor.facing;
      const boss = descriptor.role === 'boss';
      if (boss && (state.targets.some(done => !done) || state.operationId === 'pangaea-second-extinction' && state.rescued < 3)) return;
      if (distance > (boss ? 650 : 620) || !this.ecosystemLineClearV131(actor, target)) { actor.windup = 0; return; }
      actor.alert = true; actor.facing = direction;
      if (caste?.action === 'burrow') {
        actor.actionPhase = actor.clock % 5 < 2 ? 1 : 0;
        if (actor.actionPhase === 1) return;
      }
      const ranged = boss || caste?.action === 'acid';
      const charge = caste?.action === 'charge', leaper = caste?.action === 'leap';
      const speed = (boss ? state.operationId === 'pangaea-second-extinction' ? 42 : 0 : caste?.speed || 72) * speedScale;
      const mobileColossus = boss && state.operationId === 'pangaea-second-extinction' && distance > 210;
      if (sameFloor && (!ranged || mobileColossus) && distance > actor.w * .65) {
        const old = actor.x, boost = charge && actor.actionPhase === 2 ? 3.7 : 1;
        const flankX = center(target).x - (target.facing || 1) * 105;
        const movementDirection = caste?.action === 'flank' && distance < 220 ? Math.sign(flankX - center(actor).x) || direction : direction;
        actor.x = clamp(actor.x + movementDirection * speed * boost * dt, 0, 5200 - actor.w);
        if (caste?.action === 'water') actor.x = clamp(actor.x, 2300, 2820 - actor.w);
        if (actor.y + actor.h < 400) actor.x = clamp(actor.x, 552, 4518 - actor.w);
        this.resolveHorizontal(actor, old);
      }
      if (leaper && actor.actionPhase === 2) {
        const before = actor.y + actor.h; actor.y += actor.vy * dt; actor.vy += 1320 * dt; this.resolveVertical(actor, before);
        if (actor.grounded) actor.actionPhase = 0;
      }
      const reach = ranged ? boss ? 640 : 440 : charge ? 300 : leaper ? 250 : 80;
      if (actor.attackClock <= 0 && distance < reach && (sameFloor || ranged)) {
        actor.windup += dt;
        const warning = boss ? .85 : charge ? .75 : .48;
        if (actor.windup >= warning) {
          actor.windup = 0; actor.attackClock = boss ? 2.4 - state.bossPhase * .25 : charge ? 3.1 : 1.65;
          if (ranged) {
            const spreads = boss && state.bossPhase >= 3 ? [-.18, 0, .18] : [0];
            for (const angle of spreads) this.ecosystemProjectileV131(actor, target, angle, boss ? 17 + state.bossPhase * 2 : caste.damage);
            if (boss && state.bossPhase === 4) state.pressure = Math.min(99.5, state.pressure + 5);
          } else if (charge || leaper) {
            actor.actionPhase = 2;
            if (leaper) { actor.vy = -360; actor.grounded = false; }
          } else if (distance < 84 && sameFloor && this.ecosystemLineClearV131(actor, target)) {
            this.damagePlayer(target, caste?.damage || 14, { source: 'ecosystem-contact-v131', attackKind: 'melee', sourceX: actor.x, sourceY: actor.y });
          }
        }
      }
      if (charge && actor.actionPhase === 2 && actor.attackClock < 1.9) actor.actionPhase = 0;
      if ((charge || leaper) && actor.actionPhase === 2 && sameFloor && distance < 82 && this.ecosystemLineClearV131(actor, target)) {
        this.damagePlayer(target, caste.damage, { source: 'ecosystem-charge-v131', attackKind: 'melee', sourceX: actor.x, sourceY: actor.y });
        actor.actionPhase = 0; actor.attackClock = 2;
      }
    }
    ecosystemProjectileV131(actor, target, offset = 0, damage = 17) {
      const x = actor.x + actor.w / 2, y = actor.y + actor.h * .48;
      const angle = Math.atan2(target.y + target.h * .4 - y, target.x + target.w / 2 - x) + offset;
      this.hostileProjectiles.push({ x, y, sourceX: x, sourceY: y, w: 12, h: 10, vx: Math.cos(angle) * 340,
        vy: Math.sin(angle) * 340, life: 3, damage, acid: true, ownerId: actor.id, hit: false });
    }
    applyEnemyDamage(actor, amount, source = {}) {
      if (!this.isEcosystemV131() || !own(actor)) return super.applyEnemyDamage(actor, amount, source);
      if (!actor.alive || !Number.isFinite(amount) || amount <= 0 || this.paused || this.mission?.state !== 'active') return 0;
      const state = this.ecosystemV131, descriptor = actor.ecosystemActorV131, boss = descriptor.role === 'boss';
      if (boss && (state.targets.some(done => !done) || state.operationId === 'pangaea-second-extinction' && state.rescued < 3)) return 0;
      if (descriptor.caste === 'burrower' && actor.actionPhase === 1) return 0;
      let damage = amount;
      if (descriptor.caste === 'sentinel' && source.x !== undefined && Math.sign(source.x - center(actor).x) === actor.facing) damage *= .45;
      if (boss) {
        const phases = state.operationId === 'queen-mother-song' ? 4 : 3;
        const floor = actor.maxHealth * (1 - state.bossPhase / phases);
        damage = Math.min(damage, Math.max(0, actor.health - floor));
      }
      const result = super.applyEnemyDamage(actor, damage, source);
      if (state.operationId === 'hive-world' && result > 0) state.pressure = Math.min(100, state.pressure + Math.min(3, result * .02));
      if (boss && actor.alive) {
        const phases = state.operationId === 'queen-mother-song' ? 4 : 3;
        if (actor.health <= actor.maxHealth * (1 - state.bossPhase / phases) + .001 && state.bossPhase < phases) {
          state.bossPhase++; actor.attackClock = 1; actor.windup = 0;
          this.spawnEcosystemWaveV131(`boss-phase-${state.bossPhase}`, 3530);
          this.ecosystemMilestoneV131(`phase-${state.bossPhase}`, 'Nouvelle phase : signaux plus denses, renfort annoncé dans l’artère.');
        }
      }
      this.syncEcosystemV131(); return result;
    }
    defeatEnemy(actor, owner = this.player) {
      if (!this.isEcosystemV131() || !own(actor)) return super.defeatEnemy(actor, owner);
      if (!actor.alive) return;
      actor.health = 0; actor.alive = false; actor.deathClock = 1.2;
      const state = this.ecosystemV131, descriptor = actor.ecosystemActorV131;
      if (descriptor.role === 'target') {
        state.targets[descriptor.targetIndex] = true; state.pressure = Math.max(0, state.pressure - 16);
        this.ecosystemMilestoneV131(`target-${descriptor.targetIndex}`, `${actor.name} neutralisé : sa contribution au système biologique cesse.`);
      } else if (descriptor.role === 'boss') {
        state.bossDefeated = true;
        this.ecosystemMilestoneV131('boss-defeated', state.operationId === 'hive-world' ? 'Noyau rompu : cent secondes pour revenir au sas orbital.' : 'Boss neutralisé : valider le protocole de repli.');
      } else {
        const member = state.population.find(member => member.id === actor.id);
        if (member) { member.status = 'dead'; if (member.originalHost) state.deadHealthy++; state.integrity = biosphereIntegrityV131(state); }
        if (owner && descriptor.role !== 'host') owner.kills = (owner.kills || 0) + 1;
        this.onEvent?.({ type: 'kill', enemy: actor });
      }
      this.syncEcosystemV131();
    }
    spawnEcosystemWaveV131(id, x) {
      const state = this.ecosystemV131;
      if (state.journal.includes(`wave-${id}`) || state.actors.length >= 46) return;
      state.journal.push(`wave-${id}`);
      for (let index = 0; index < 2; index++) {
        const spawnX = Math.abs(x - this.player.x) < 220 ? Math.min(4880, x + 340) : x;
        this.ecosystemSpawnV131({ id: `eco131-wave-${id}-${index}`, role: 'guard', x: spawnX + index * 75,
          floorY: 570, label: 'RENFORT BIOLOGIQUE · ADAPTATION' });
      }
      this.onEvent?.({ type: 'ecosystem-wave-warning-v131', id, x });
    }
    ecosystemMilestoneV131(id, text) {
      if (!this.ecosystemV131.journal.includes(id)) this.ecosystemV131.journal.push(id);
      this.syncEcosystemV131();
      this.ecosystemCheckpointV131 = this.captureEcosystemCheckpointV131();
      this.onEvent?.({ type: 'ecosystem-radio-v131', id, text, operationId: this.ecosystemV131.operationId });
    }
    completeMission(actor = this.player) {
      if (!this.isEcosystemV131()) return super.completeMission(actor);
      const state = this.ecosystemV131;
      if (!this.ecosystemCanActV131(actor) || state.complete || this.missingEcosystemRequirementV131()) return false;
      const previous = clone(state), sink = this.onEvent;
      state.complete = true; state.rewardClaimed = true;
      state.ending = state.operationId === 'queen-mother-song' ? state.nursery.every(Boolean) ? 'nursery-preserved' : 'royal-route-broken'
        : state.operationId === 'hive-world' ? state.pressure < 50 ? 'quiet-collapse' : 'planetary-rupture'
          : state.integrity >= 75 ? 'biosphere-preserved' : 'quarantine';
      const outcome = { operationId: state.operationId, ending: state.ending,
        ecosystemIntegrity: state.integrity, nurserySaved: state.nursery.filter(Boolean).length, rescued: state.rescued };
      state.rewards = { ...outcome };
      this.syncEcosystemV131();
      this.onEvent = event => {
        if (event.type === 'mission-complete') {
          state.rewards = { ...clone(event.rewards || this.mission.rewards), ...outcome };
          this.mission.rewards = clone(state.rewards);
          sink?.({ ...event, operationId: state.operationId, rewards: clone(state.rewards) });
        } else sink?.(event);
      };
      let result;
      try { result = super.completeMission(actor); } finally { this.onEvent = sink; }
      if (!result) { Object.assign(state, previous); this.syncEcosystemV131(); return result; }
      this.syncEcosystemV131();
      this.onEvent?.({ type: 'ecosystem-ending-v131', operationId: state.operationId, ending: state.ending, rewards: clone(state.rewards) });
      return true;
    }
    captureEcosystemCheckpointV131() {
      const state = this.captureResumeState();
      if (state.specialOperation) delete state.specialOperation.ecosystemCheckpointV131;
      return clone(state);
    }
    captureResumeState() {
      const base = super.captureResumeState();
      if (!this.isEcosystemV131()) return base;
      const state = clone(this.ecosystemV131);
      for (const descriptor of state.actors) {
        const actor = this.ecosystemActorV131(descriptor.id);
        if (actor) Object.assign(descriptor, { clock: actor.clock, attackClock: actor.attackClock, windup: actor.windup, actionPhase: actor.actionPhase });
      }
      state.phase = ecosystemPhaseV131(state);
      return { ...base, specialOperation: { ...(base.specialOperation || {}), operationId: state.operationId,
        ecosystemV131: state, ecosystemCheckpointV131: this.ecosystemCheckpointV131 ? clone(this.ecosystemCheckpointV131) : null } };
    }
    validateEcosystemResumeV131(raw) {
      const checked = validateEcosystemStateV131(raw?.specialOperation?.ecosystemV131);
      if (!checked.valid) return checked;
      const state = checked.state, expected = this.resumeIdentity || {}, identity = raw?.identity || {};
      const boss = raw.enemies?.find(actor => actor.id === 'eco131-boss');
      const phases = state.operationId === 'queen-mother-song' ? 4 : 3, bossHealth = state.operationId === 'queen-mother-song' ? 600 : 540;
      const authored = list(this.ecosystemAuthoredActorsV131);
      const expectedKeys = ['id', 'role', 'x', 'floorY', 'targetIndex', 'caste'];
      const descriptorsValid = authored.every(original => state.actors.some(descriptor => expectedKeys.every(key => descriptor[key] === original[key])))
        && state.actors.every(descriptor => authored.some(original => original.id === descriptor.id) || (() => {
          const match = /^eco131-wave-(boss-phase-[234]|beacon-[012])-([01])$/.exec(descriptor.id);
          if (!match || descriptor.role !== 'guard' || descriptor.floorY !== 570 || !state.journal.includes(`wave-${match[1]}`)) return false;
          if (match[1].startsWith('boss') && state.bossPhase < Number(match[1].at(-1))) return false;
          if (match[1].startsWith('beacon') && (state.operationId !== 'queen-mother-song' || !state.bossDefeated
            || state.defenceElapsed < (Number(match[1].at(-1)) + 1) * 7)) return false;
          const index = Number(match[2]), origins = match[1].startsWith('boss') ? [3530, 3870] : [4680, 4880];
          return origins.some(x => descriptor.x === x + index * 75);
        })());
      if (raw.schema !== 1 || raw.specialOperation.operationId !== state.operationId || state.operationId !== this.ecosystemV131.operationId
        || !boss || !descriptorsValid
        || Object.keys(expected).some(key => identity[key] !== expected[key])
        || raw.missionLevel?.signature !== this.missionLevelRuntime?.signature
        || !['active', 'failed', 'complete'].includes(raw.mission?.state) || (raw.mission.state === 'complete') !== state.complete
        || !Array.isArray(raw.enemies) || raw.enemies.length !== state.actors.length
        || new Set(raw.enemies.map(actor => actor.id)).size !== state.actors.length
        || raw.enemies.some(actor => !state.actors.some(descriptor => descriptor.id === actor.id)
          || !Number.isFinite(actor.x) || actor.x < 0 || actor.x > 5150 || !Number.isFinite(actor.y) || actor.y < 0 || actor.y > 570
          || !Number.isFinite(actor.health) || actor.health < 0 || actor.health > 600 || typeof actor.alive !== 'boolean'
          || actor.alive !== (actor.health > 0))
        || state.targets.some((done, index) => done !== (raw.enemies.find(actor => actor.id === `eco131-target-${index}`)?.alive === false))
        || state.bossDefeated !== (boss?.alive === false)
        || !state.bossDefeated && (boss.health > bossHealth * (1 - (state.bossPhase - 1) / phases) + .001
          || boss.health <= bossHealth * (1 - state.bossPhase / phases) - .001)
        || state.bossDefeated && state.bossPhase !== phases
        || state.population.some(member => ['dead', 'rescued'].includes(member.status) !== (raw.enemies.find(actor => actor.id === member.id)?.alive === false))
        || !Number.isFinite(raw.player?.x) || raw.player.x < 0 || raw.player.x > 5150 || !Number.isFinite(raw.player.y) || raw.player.y < 0 || raw.player.y > 570)
        return { valid: false, reason: 'ecosystem-identity-mismatch' };
      return checked;
    }
    applyResumeState(raw) {
      if (!this.isEcosystemV131()) return super.applyResumeState(raw);
      const checked = this.validateEcosystemResumeV131(raw);
      if (!checked.valid) return { applied: false, restored: 0, reason: checked.reason };
      const previousState = this.ecosystemV131, previousEnemies = this.enemies;
      this.ecosystemV131 = checked.state; this.enemies = [];
      for (const descriptor of checked.state.actors) this.ecosystemSpawnV131(descriptor, false);
      const result = super.applyResumeState(raw);
      if (!result?.applied) { this.ecosystemV131 = previousState; this.enemies = previousEnemies; return result; }
      this.bullets = []; this.hostileProjectiles = [];
      const checkpoint = raw.specialOperation.ecosystemCheckpointV131;
      if (checkpoint && this.validateEcosystemResumeV131(checkpoint).valid) {
        this.ecosystemCheckpointV131 = clone(checkpoint); delete this.ecosystemCheckpointV131.specialOperation.ecosystemCheckpointV131;
      }
      this.syncEcosystemV131(); return { ...result, ecosystemRestoredV131: true };
    }
    restartFromCheckpoint() {
      if (!this.isEcosystemV131()) return super.restartFromCheckpoint();
      if (this.mission?.state !== 'failed' || !this.ecosystemCheckpointV131) return false;
      const raw = clone(this.ecosystemCheckpointV131);
      raw.mission.state = 'active'; raw.mission.failureReason = null; raw.mission.retries = this.mission.retries + 1;
      raw.inventory.salvage = Math.max(0, Math.min(raw.inventory.salvage, this.inventory.salvage) - 20);
      const result = this.applyResumeState(raw); if (!result.applied) return false;
      this.clearGameplayInput?.(); this.onEvent?.({ type: 'mission-restarted', operationId: this.ecosystemV131.operationId, salvagePenalty: 20 }); return true;
    }
    ecosystemSnapshotV131() {
      if (!this.isEcosystemV131()) return null;
      return { ...clone(this.ecosystemV131), phase: ecosystemPhaseV131(this.ecosystemV131), dossier: ecosystemDossierV131(this.ecosystemV131),
        influenceState: this.ecosystemV131.operationId === 'queen-mother-song'
          ? this.ecosystemV131.pressure >= 85 ? 'submission' : this.ecosystemV131.pressure >= 60 ? 'susceptible' : 'free' : null,
        actors: this.enemies.filter(own).map(actor => ({ ...clone(actor.ecosystemActorV131), id: actor.id, x: actor.x, y: actor.y,
          alive: actor.alive, health: actor.health, windup: actor.windup, actionPhase: actor.actionPhase })) };
    }
    phaseLabel() { return this.isEcosystemV131() ? ecosystemDossierV131(this.ecosystemV131).title : super.phaseLabel(); }
    objectiveProgressText() { return this.isEcosystemV131() ? ecosystemDossierV131(this.ecosystemV131).instruction : super.objectiveProgressText(); }
    getInteractionPrompt() { return this.isEcosystemV131() ? this.ecosystemInteractionV131()?.text || '' : super.getInteractionPrompt(); }
    getSnapshot() { return { ...super.getSnapshot(), ...(this.isEcosystemV131() ? { ecosystemV131: this.ecosystemSnapshotV131() } : {}) }; }
    getGameplayReport() { return { ...super.getGameplayReport(), ...(this.isEcosystemV131() ? { ecosystemV131: this.ecosystemSnapshotV131() } : {}) }; }
    getVisibleEnemyAtlasSheetsV65(enemies = this.getVisibleEnemiesV65()) {
      return super.getVisibleEnemyAtlasSheetsV65(enemies.filter(actor => !own(actor)));
    }
    drawBackdrop(ctx) {
      if (!this.isEcosystemV131()) return super.drawBackdrop(ctx);
      super.drawBackdrop(ctx);
      const state = this.ecosystemV131, prehistoric = state.operationId === 'pangaea-second-extinction';
      ctx.save();
      for (let index = 0; index < 20; index++) {
        const x = index * 110 - this.camera.x * .18 % 110;
        ctx.fillStyle = prehistoric ? '#29403288' : '#49374566';
        ctx.beginPath(); ctx.ellipse(x, 500, prehistoric ? 25 : 44, 180 + index % 3 * 40, .14, 0, Math.PI * 2); ctx.fill();
      }
      if (state.operationId === 'hive-world') {
        ctx.strokeStyle = '#a3676460'; ctx.lineWidth = 7 + Math.sin(this.animationTime * 2) * 2;
        for (let index = 0; index < 7; index++) { ctx.beginPath(); ctx.moveTo(index * 220, 720); ctx.bezierCurveTo(index * 220 + 40, 520, index * 220 - 100, 240, index * 220 + 30, 0); ctx.stroke(); }
      }
      ctx.restore();
    }
    drawWorld(ctx) {
      if (!this.isEcosystemV131()) return super.drawWorld(ctx);
      super.drawWorld(ctx);
      const state = this.ecosystemV131;
      ctx.save(); ctx.font = '11px monospace';
      const marker = (prop, label, used, color = '#a4c8b3') => {
        ctx.fillStyle = used ? '#29453a' : color; ctx.fillRect(prop.x - 16, prop.floorY - 48, 32, 48);
        ctx.fillStyle = '#d9e0ce'; ctx.fillText(label, prop.x - 50, prop.floorY - 59);
      };
      marker(props.supply, 'E · DÉPÔT', state.supplyTaken);
      if (state.operationId === 'queen-mother-song') {
        marker(props.focus, `ISOLEMENT ${state.focusCharges}`, !state.focusCharges, '#78a4c4');
        props.nursery.forEach((prop, index) => marker(prop, 'COCON · E 2 S', state.nursery[index], '#b3a083'));
        props.beacons.forEach((prop, index) => marker(prop, 'BALISE · E', state.beacons[index], '#83b6c8'));
      }
      const exit = state.operationId === 'hive-world' ? props.insertion : props.extraction;
      marker(exit, 'SAS · E 2 S', state.complete, '#9db9cb'); ctx.restore();
    }
    drawEnemy(ctx, actor) {
      if (!this.isEcosystemV131() || !own(actor)) return super.drawEnemy(ctx, actor);
      const descriptor = actor.ecosystemActorV131, member = this.ecosystemV131.population.find(member => member.id === actor.id);
      const caste = SAURIA_CASTES_V131.find(caste => caste.id === (member?.caste || descriptor.caste));
      const healthy = member?.status === 'healthy', target = descriptor.role === 'target', boss = descriptor.role === 'boss';
      ctx.save(); ctx.globalAlpha = !actor.alive ? .3 : actor.actionPhase === 1 ? .35 : 1;
      ctx.translate(actor.x + actor.w / 2, actor.y + actor.h);
      ctx.scale(actor.facing < 0 ? -1 : 1, 1);
      const w = actor.w, h = actor.h;
      ctx.fillStyle = healthy ? '#8da77b' : target ? '#b47791' : boss ? '#787089' : '#3e766e';
      ctx.strokeStyle = actor.windup > 0 ? '#ffcb68' : healthy ? '#d8dea4' : '#b8c6bf'; ctx.lineWidth = actor.windup > 0 ? 4 : 2;
      ctx.beginPath(); ctx.ellipse(0, -h * .48, w * .47, h * .39, target ? .18 : -.1, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      if (!target) {
        ctx.beginPath(); ctx.moveTo(-w * .35, -h * .6); ctx.lineTo(-w * .88, -h * .2); ctx.lineTo(-w * .35, -h * .4); ctx.fill();
        ctx.fillRect(w * .25, -h * .8, w * .35, h * .22);
        ctx.fillRect(-w * .22, -h * .3, w * .12, h * .3); ctx.fillRect(w * .12, -h * .3, w * .12, h * .3);
      }
      if (boss || caste?.shape === 'plates' || caste?.shape === 'spikes') {
        for (let index = 0; index < (boss ? 7 : 4); index++) { const x = -w * .45 + index * w * .13;
          ctx.beginPath(); ctx.moveTo(x, -h * .78); ctx.lineTo(x + w * .08, -h * .98); ctx.lineTo(x + w * .13, -h * .72); ctx.fill(); ctx.stroke(); }
      }
      if (caste?.shape === 'horns') { ctx.beginPath(); ctx.moveTo(w * .4, -h * .82); ctx.lineTo(w * .7, -h * .99); ctx.lineTo(w * .55, -h * .7); ctx.fill(); }
      if (caste?.shape === 'sail' || caste?.shape === 'wings' || caste?.shape === 'fin') {
        ctx.beginPath(); ctx.moveTo(-w * .3, -h * .5); ctx.lineTo(0, -h * 1.16); ctx.lineTo(w * .2, -h * .5); ctx.fill(); ctx.stroke();
      }
      ctx.restore(); ctx.save(); ctx.font = '10px monospace'; ctx.fillStyle = healthy ? '#d8eab5' : '#e0d3d4';
      ctx.fillText(actor.name, actor.x - 10, actor.y - 15);
      if (actor.alive) { ctx.fillStyle = '#1d2225'; ctx.fillRect(actor.x, actor.y - 8, actor.w, 4);
        ctx.fillStyle = healthy ? '#91bd78' : '#b88d9b'; ctx.fillRect(actor.x, actor.y - 8, actor.w * actor.health / actor.maxHealth, 4); }
      ctx.restore();
    }
    drawHud(ctx) {
      super.drawHud(ctx); if (!this.isEcosystemV131()) return;
      const state = this.ecosystemV131, dossier = ecosystemDossierV131(state);
      ctx.save(); ctx.fillStyle = '#091819ed'; ctx.fillRect(18, 113, 1235, 87); ctx.fillStyle = '#d0dfd4'; ctx.font = '700 13px monospace';
      ctx.fillText(`${dossier.title} · ${dossier.pressureLabel} ${Math.round(dossier.pressure)}% · ${state.phase.toUpperCase()}`, 30, 134);
      ctx.font = '11px monospace'; ctx.fillText(dossier.instruction, 30, 155);
      const extra = state.operationId === 'hive-world' ? `SAS ORBITAL : ${Math.ceil(state.collapseRemaining)} S · L’ALERTE ≥70 FERME L’ARTÈRE BASSE ; ROUTE HAUTE ACCESSIBLE`
        : state.operationId === 'queen-mother-song' ? `NURSERIE ${state.nursery.filter(Boolean).length}/3 · BALISES ${state.beacons.filter(Boolean).length}/2 · DÉFENSE ${Math.floor(state.defenceElapsed)}/22 S`
          : `HÔTES SAUVÉS ${state.rescued}/3 · VACCINS ${state.vaccineCharges} · SEPT CASTES : TRAQUEUR / BÉLIER / CRACHEUR / BOND / FOUISSEUR / NAGEUR / SENTINELLE`;
      ctx.fillText(extra, 30, 174); ctx.fillStyle = '#a5b8b5'; ctx.fillText('ADAPTATION ORIGINALE · PERSONNAGES VECTORIELS PROVISOIRES · PLANCHES DÉDIÉES À PRODUIRE', 30, 191); ctx.restore();
    }
  };
}
