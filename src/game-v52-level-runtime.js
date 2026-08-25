const WORLD_WIDTH = 6200;
const WORLD_HEIGHT = 1080;
const LOGICAL_WIDTH = 1280;
const LOGICAL_HEIGHT = 720;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const asList = (value) => Array.isArray(value) ? value : [];
const entityDistance = (a, b) => Math.hypot((a.x + (a.w || 0) / 2) - (b.x + (b.w || 0) / 2), (a.y + (a.h || 0) / 2) - (b.y + (b.h || 0) / 2));
const imageReady = (image) => Boolean(image?.complete && (image.naturalWidth || image.width) > 0);

export const MISSION_LEVEL_TIMER_PROFILES = Object.freeze({
  extraction: Object.freeze({
    id: 'extraction',
    label: 'NAVETTE D’EXTRACTION EN APPROCHE',
    seconds: Object.freeze({ story: 10, standard: 14, nightmare: 18 })
  })
});

function timerDuration(profile, difficultyId) {
  return profile.seconds[difficultyId] || profile.seconds.standard;
}

function timerSnapshot(timer) {
  return {
    id: timer.id, label: timer.label, state: timer.state,
    duration: timer.duration, remaining: timer.remaining,
    startedAt: timer.startedAt, completedAt: timer.completedAt,
    sourceEventId: timer.sourceEventId,
    holdRadius: timer.holdRadius,
    holdTarget: timer.holdTarget ? { ...timer.holdTarget } : null
  };
}

export const MISSION_LEVEL_LAYER_FILES_V52 = Object.freeze({
  'ship-interior-vertical': Object.freeze({
    far: '/assets/openai/metroidvania/tantalus-mission-far.png',
    mid: '/assets/openai/metroidvania/tantalus-mission-mid.png',
    foreground: '/assets/openai/metroidvania/tantalus-mission-foreground.png'
  }),
  'colony-multiroute': Object.freeze({
    far: '/assets/openai/metroidvania/colony-multiroute-far.png',
    mid: '/assets/openai/metroidvania/colony-multiroute-mid.png',
    foreground: '/assets/openai/metroidvania/colony-multiroute-foreground.png'
  }),
  'planet-exterior': Object.freeze({
    far: '/assets/openai/metroidvania/planet-exterior-far.png',
    mid: '/assets/openai/metroidvania/planet-exterior-mid.png',
    foreground: '/assets/openai/metroidvania/planet-exterior-foreground.png'
  })
});

export const MISSION_LEVEL_ZONE_LAYER_FILES_V56 = Object.freeze({
  'ship-interior-vertical': Object.freeze({
    'ship-docking': Object.freeze({
      far: '/assets/openai/metroidvania/zones/ship-docking-far.png',
      mid: '/assets/openai/metroidvania/zones/ship-docking-mid.png',
      foreground: '/assets/openai/metroidvania/zones/ship-docking-foreground.png'
    }),
    'ship-cargo': Object.freeze({
      far: '/assets/openai/metroidvania/zones/ship-cargo-far.png',
      mid: '/assets/openai/metroidvania/zones/ship-cargo-mid.png',
      foreground: '/assets/openai/metroidvania/zones/ship-cargo-foreground.png'
    }),
    'ship-engineering': Object.freeze({
      far: '/assets/openai/metroidvania/zones/ship-engineering-far.png',
      mid: '/assets/openai/metroidvania/zones/ship-engineering-mid.png',
      foreground: '/assets/openai/metroidvania/zones/ship-engineering-foreground.png'
    }),
    'ship-habitation': Object.freeze({
      far: '/assets/openai/metroidvania/zones/ship-habitation-far.png',
      mid: '/assets/openai/metroidvania/zones/ship-habitation-mid.png',
      foreground: '/assets/openai/metroidvania/zones/ship-habitation-foreground.png'
    }),
    'ship-command': Object.freeze({
      far: '/assets/openai/metroidvania/zones/ship-command-far.png',
      mid: '/assets/openai/metroidvania/zones/ship-command-mid.png',
      foreground: '/assets/openai/metroidvania/zones/ship-command-foreground.png'
    }),
    'ship-extraction': Object.freeze({
      far: '/assets/openai/metroidvania/zones/ship-extraction-far.png',
      mid: '/assets/openai/metroidvania/zones/ship-extraction-mid.png',
      foreground: '/assets/openai/metroidvania/zones/ship-extraction-foreground.png'
    })
  })
});

export const MISSION_LEVEL_ZONE_LAYER_FILES_V57 = Object.freeze({
  ...MISSION_LEVEL_ZONE_LAYER_FILES_V56,
  'planet-exterior': Object.freeze({
    'planet-approach': Object.freeze({
      far: '/assets/openai/metroidvania/zones/planet-exterior/planet-approach-far.png',
      mid: '/assets/openai/metroidvania/zones/planet-exterior/planet-approach-mid.png',
      foreground: '/assets/openai/metroidvania/zones/planet-exterior/planet-approach-foreground.png'
    }),
    'planet-surface': Object.freeze({
      far: '/assets/openai/metroidvania/zones/planet-exterior/planet-surface-far.png',
      mid: '/assets/openai/metroidvania/zones/planet-exterior/planet-surface-mid.png',
      foreground: '/assets/openai/metroidvania/zones/planet-exterior/planet-surface-foreground.png'
    }),
    'planet-ridge': Object.freeze({
      far: '/assets/openai/metroidvania/zones/planet-exterior/planet-ridge-far.png',
      mid: '/assets/openai/metroidvania/zones/planet-exterior/planet-ridge-mid.png',
      foreground: '/assets/openai/metroidvania/zones/planet-exterior/planet-ridge-foreground.png'
    }),
    'planet-caves': Object.freeze({
      far: '/assets/openai/metroidvania/zones/planet-exterior/planet-caves-far.png',
      mid: '/assets/openai/metroidvania/zones/planet-exterior/planet-caves-mid.png',
      foreground: '/assets/openai/metroidvania/zones/planet-exterior/planet-caves-foreground.png'
    }),
    'planet-ruins': Object.freeze({
      far: '/assets/openai/metroidvania/zones/planet-exterior/planet-ruins-far.png',
      mid: '/assets/openai/metroidvania/zones/planet-exterior/planet-ruins-mid.png',
      foreground: '/assets/openai/metroidvania/zones/planet-exterior/planet-ruins-foreground.png'
    }),
    'planet-evac': Object.freeze({
      far: '/assets/openai/metroidvania/zones/planet-exterior/planet-evac-far.png',
      mid: '/assets/openai/metroidvania/zones/planet-exterior/planet-evac-mid.png',
      foreground: '/assets/openai/metroidvania/zones/planet-exterior/planet-evac-foreground.png'
    })
  })
});

export function resolveMissionLevelLayerFilesV56(templateId, zoneId) {
  const fallback = MISSION_LEVEL_LAYER_FILES_V52[templateId] || null;
  if (!fallback) return null;
  return MISSION_LEVEL_ZONE_LAYER_FILES_V56[templateId]?.[zoneId] || fallback;
}

export function resolveMissionLevelLayerFilesV57(templateId, zoneId) {
  const fallback = MISSION_LEVEL_LAYER_FILES_V52[templateId] || null;
  if (!fallback) return null;
  return MISSION_LEVEL_ZONE_LAYER_FILES_V57[templateId]?.[zoneId] || fallback;
}

function zoneForPosition(plan, actor) {
  if (!plan || !actor) return null;
  const nodes = asList(plan.graph?.nodes);
  if (!nodes.length) return asList(plan.biomeZones)[0] || null;
  const nearest = nodes.reduce((best, node) => {
    const score = Math.hypot(node.x - (actor.x + actor.w / 2), node.y - (actor.y + actor.h));
    return !best || score < best.score ? { node, score } : best;
  }, null)?.node;
  return asList(plan.biomeZones).find((zone) => zone.id === nearest?.zoneId) || null;
}

function layerKey(templateId, kind) {
  return `level:${templateId}:${kind}`;
}

function zoneLayerKey(templateId, zoneId, kind) {
  return `level:${templateId}:zone:${zoneId}:${kind}`;
}

function sourceForSpawn(engine, index) {
  const selected = asList(engine.encounterSelection?.selected);
  const sources = selected.length ? selected : asList(engine.v52EnemyCatalog);
  return sources[index % Math.max(1, sources.length)] || { id: `frontier-contact-${index}`, name: 'Frontier Contact', biology: 'xenomorph', health: 80, damage: 12, speed: 1.2 };
}

export function withV52LevelRuntime(BaseEngine) {
  return class V52LevelRuntime extends BaseEngine {
    start(options = {}) {
      this.v52EnemyCatalog = asList(options.enemyCatalog);
      const snapshot = super.start(options);
      if (options.missionLevel && !this.editorMode) {
        this.applyMissionLevelV52(options.missionLevel);
        if (options.resumeState) this.lastResumeResult = this.applyResumeState(options.resumeState);
      }
      return { ...snapshot, missionLevelRuntime: this.getMissionLevelSnapshot() };
    }

    applyMissionLevelV52(plan) {
      if (!plan?.validation?.valid || plan.schemaVersion !== 52) throw new Error('Mission level v52 invalide ou non validé.');
      this.missionLevelRuntime = plan;
      this.routeRuntime = {
        ...plan.routeRuntime,
        routeNodes: asList(plan.routeRuntime.routeNodes).map((node) => ({
          ...node,
          route: Math.max(1, asList(plan.graph?.routes).findIndex((route) => asList(node.routeIds).includes(route.id)) + 1)
        }))
      };
      this.missionLevelEvents = new Map(asList(plan.events).map((event) => [event.id, { ...event, triggered: false, triggerCount: 0 }]));
      this.missionLevelSpawns = new Map(asList(plan.spawns).map((spawn) => [spawn.id, { ...spawn, active: !spawn.triggerEventId, activatedAt: null }]));
      this.missionLevelVisualState = {
        activeZoneId: null,
        previousZoneId: null,
        zoneBlend: 1,
        overlay: plan.artLayers?.overlay || null,
        emergency: false,
        blackout: false,
        storm: false,
        bioluminescence: false,
        weatherBreak: false,
        eventFlash: 0
      };
      this.missionLevelTelemetry = { transitions: 0, events: 0, spawns: 0, artChanges: 0, doorChanges: 0, hazardChanges: 0 };
      this.missionLevelTimers = new Map();
      this.missionLevelExtractionTimer = null;
      this.missionLevelExtractionUnlocked = false;
      this.loadMissionLevelArt(plan);
      this.compileMissionLevelGeometry(plan);
      this.compileMissionLevelActors(plan);
      this.refreshMissionLevelZone(true);
      for (const event of this.missionLevelEvents.values()) if (event.trigger?.type === 'mission-start') this.triggerMissionLevelEvent(event.id, 'mission-start');
      this.onEvent({
        type: 'mission-level-ready',
        templateId: plan.templateId,
        signature: plan.signature,
        routes: plan.graph.routes.length,
        zones: plan.biomeZones.length,
        events: plan.events.length,
        spawns: plan.spawns.length
      });
      return this.getMissionLevelSnapshot();
    }

    loadMissionLevelArt(plan) {
      const templateId = plan?.templateId;
      const files = MISSION_LEVEL_LAYER_FILES_V52[templateId];
      if (!files || !this.images || typeof globalThis.Image !== 'function') return;
      for (const [kind, path] of Object.entries(files)) {
        const key = layerKey(templateId, kind);
        if (this.images.has(key)) continue;
        const image = new globalThis.Image();
        image.decoding = 'async';
        image.src = path;
        this.images.set(key, image);
      }
      const declaredZoneIds = new Set(asList(plan?.biomeZones).map((zone) => zone.id));
      const zoneFiles = MISSION_LEVEL_ZONE_LAYER_FILES_V57[templateId] || {};
      for (const [zoneId, layers] of Object.entries(zoneFiles)) {
        if (!declaredZoneIds.has(zoneId)) continue;
        for (const [kind, path] of Object.entries(layers)) {
          const key = zoneLayerKey(templateId, zoneId, kind);
          if (this.images.has(key)) continue;
          const image = new globalThis.Image();
          image.decoding = 'async';
          image.src = path;
          this.images.set(key, image);
        }
      }
    }

    missionLevelLayerImage(kind, requestedZoneId = this.missionLevelVisualState?.activeZoneId) {
      const templateId = this.missionLevelRuntime?.templateId;
      const zoneId = requestedZoneId;
      const dedicated = MISSION_LEVEL_ZONE_LAYER_FILES_V57[templateId]?.[zoneId]?.[kind]
        ? this.images?.get(zoneLayerKey(templateId, zoneId, kind))
        : null;
      if (imageReady(dedicated)) return dedicated;
      return this.images?.get(layerKey(templateId, kind)) || null;
    }

    compileMissionLevelGeometry(plan) {
      this.missionLevelBounds = {
        width: Math.max(LOGICAL_WIDTH, Number(plan.dimensions?.width) || WORLD_WIDTH),
        height: Math.max(1, Number(plan.dimensions?.height) || WORLD_HEIGHT),
        voidY: Math.max(1, Number(plan.dimensions?.height) || WORLD_HEIGHT) + 100
      };
      this.platforms = asList(plan.geometry?.platforms).map((platform, index) => ({
        ...platform,
        art: platform.kind === 'terrain-step' ? 'ledge' : index % 3 === 0 ? 'ledge' : 'catwalk',
        floor: false
      }));
      const connectors = asList(plan.geometry?.ladders);
      this.ladders = connectors.filter((ladder) => ladder.kind !== 'lift').map((ladder) => ({
        id: ladder.id,
        x: ladder.x + ladder.w / 2,
        top: ladder.y,
        bottom: ladder.y + ladder.h - 22,
        w: Math.max(42, ladder.w),
        kind: ladder.kind,
        fromNodeId: ladder.from,
        toNodeId: ladder.to
      }));
      this.lifts = connectors.filter((connector) => connector.kind === 'lift').map((connector, index) => {
        const centerX = connector.x + connector.w / 2;
        const topY = connector.y;
        const baseY = connector.y + connector.h - 22;
        return {
          id: connector.id,
          x: centerX - 60,
          y: baseY,
          baseY,
          topY,
          w: 120,
          h: 24,
          art: 'drop',
          phase: index * 0.9,
          previousY: baseY,
          kind: 'lift',
          fromNodeId: connector.from,
          toNodeId: connector.to
        };
      });
      this.platforms.push(...this.lifts);
      this.doors = asList(plan.geometry?.doors).map((door, index, list) => {
        const lockedBy = /aft|security/i.test(door.id) ? 'boss' : index === 0 ? 'power' : index === list.length - 1 ? 'security' : null;
        return { ...door, open: false, progress: 0, lockedBy, levelLocked: false };
      });
      this.vents = asList(plan.geometry?.vents).flatMap((vent) => [
        { id: vent.id, pairId: vent.id, direction: 'forward', from: vent.from, to: vent.to },
        { id: `${vent.id}-return`, pairId: vent.id, direction: 'return', from: vent.to, to: vent.from }
      ].map((entry) => ({
        id: entry.id,
        pairId: entry.pairId,
        direction: entry.direction,
        x: entry.from.x - 42,
        y: entry.from.y - 64,
        w: 84,
        h: 64,
        open: false,
        requiresTool: true,
        targetX: entry.to.x - this.player.w / 2,
        targetY: entry.to.y - this.player.h,
        targetAnchorX: entry.to.x,
        targetAnchorY: entry.to.y,
        fromNodeId: entry.from.nodeId,
        toNodeId: entry.to.nodeId
      })));
      this.ventShortcut = this.vents[0] || { id: 'none', x: -1000, y: -1000, w: 0, h: 0, open: false };
      this.hazards = asList(plan.hazards).map((hazard) => ({ ...hazard }));
      const spawn = plan.anchors.spawn;
      const extraction = plan.anchors.extraction;
      const power = plan.anchors.power;
      const archive = plan.anchors.archive;
      if (spawn) {
        this.player.x = clamp(spawn.x - this.player.w / 2, 0, this.missionLevelBounds.width - this.player.w);
        this.player.y = clamp(spawn.y - this.player.h, 0, Math.max(0, this.missionLevelBounds.height - this.player.h));
        this.player.vx = 0;
        this.player.vy = 0;
        this.coop.x = clamp(this.player.x - 56, 0, this.missionLevelBounds.width - this.coop.w);
        this.coop.y = this.player.y;
        this.checkpoint = { id: 'insertion', x: this.player.x, y: this.player.y };
      }
      if (extraction) this.objective = { id: 'extraction', x: extraction.x - 34, y: extraction.y - 90, w: 68, h: 90, complete: false };
      this.powerNode = power ? { id: 'power', x: power.x - 26, y: power.y - 64, w: 52, h: 64, active: false } : null;
      this.archiveTerminal = archive ? { id: 'archive', x: archive.x - 29, y: archive.y - 76, w: 58, h: 76, recovered: false } : null;
      const nodes = asList(plan.graph?.nodes);
      const supplyNodes = nodes.filter((node, index) => index > 0 && index % 4 === 0).slice(0, 5);
      this.supplies = supplyNodes.map((node, index) => ({
        id: `v52-supply-${index + 1}`,
        type: ['ammo', 'medkit', 'armor'][index % 3],
        amount: index % 3 === 0 ? 24 : index % 3 === 1 ? 1 : 22,
        x: node.x - 28,
        y: node.y - 42,
        w: 56,
        h: 42,
        used: false,
        zoneId: node.zoneId
      }));
      const firstNode = nodes[1] || spawn;
      this.weaponPickup = firstNode ? { id: 'm41a', x: firstNode.x + 90, y: firstNode.y - 54, w: 126, h: 54, taken: false } : this.weaponPickup;
      const toolNode = nodes.find((node) => node.anchor === 'power') || nodes[Math.min(3, nodes.length - 1)];
      this.toolPickup = toolNode ? { id: 'cutter', x: toolNode.x - 100, y: toolNode.y - 48, w: 54, h: 48, taken: false } : this.toolPickup;
      this.covers = nodes.filter((node, index) => index % 3 === 1).map((node, index) => ({
        id: `v52-cover-${index + 1}`,
        x: node.x + 34,
        y: node.y - 46,
        w: 82,
        h: 46,
        art: index % 2 ? 'crates' : 'cover',
        health: 100,
        destroyed: false,
        zoneId: node.zoneId
      }));
      if (this.vehicle?.active) {
        const vehicleNode = nodes.find((node) => node.x > 3000 && node.y >= 380) || nodes.at(-3);
        if (vehicleNode) {
          this.vehicle.x = vehicleNode.x - this.vehicle.w / 2;
          this.vehicle.y = vehicleNode.y - this.vehicle.h;
        }
      }
      const objectiveAnchor = plan.anchors['objective-primary'];
      if (objectiveAnchor && this.objectiveNodes?.length) {
        const nearby = nodes.filter((node) => node.zoneId === objectiveAnchor.zoneId);
        for (const [index, objectiveNode] of this.objectiveNodes.entries()) {
          const node = nearby[index % Math.max(1, nearby.length)] || objectiveAnchor;
          objectiveNode.x = node.x - (objectiveNode.w || 44) / 2 + index * 32;
          objectiveNode.y = node.y - (objectiveNode.h || 62);
          objectiveNode.zoneId = node.zoneId;
        }
      }
      this.camera.x = clamp(this.player.x - 320, 0, Math.max(0, this.missionLevelBounds.width - LOGICAL_WIDTH));
      this.camera.y = clamp(this.player.y - 360, 0, Math.max(0, this.missionLevelBounds.height - LOGICAL_HEIGHT));
      if (this.mission) {
        const hasBoss = asList(this.enemies).some((enemy) => enemy.isBoss);
        this.mission.objectives.power = !this.powerNode;
        this.mission.objectives.route = !this.doors.some((door) => door.lockedBy === 'security');
        this.mission.objectives.boss = !hasBoss;
        this.mission.objectives.archive = !this.archiveTerminal;
        this.mission.objectives.extract = false;
      }
    }

    compileMissionLevelActors(plan) {
      const desiredStandard = asList(plan.spawns).reduce((total, spawn) => total + Number(spawn.count || spawn.baseCount || 0), 0);
      const fallbackGroundY = Number(plan.anchors?.spawn?.y) || Math.max(80, this.missionLevelBounds.height - 150);
      const boss = asList(this.enemies).find((enemy) => enemy.isBoss) || null;
      const standard = asList(this.enemies).filter((enemy) => enemy !== boss);
      while (standard.length < Math.min(28, desiredStandard)) {
        const index = standard.length;
        standard.push(this.createEnemy(sourceForSpawn(this, index), this.enemies.length + index, 700 + index * 140, fallbackGroundY, { boss: false, keyCarrier: false }));
      }
      const activeEnemies = standard.slice(0, Math.min(28, Math.max(6, desiredStandard)));
      const zones = new Map(asList(plan.biomeZones).map((zone) => [zone.id, zone]));
      const nodesByZone = new Map();
      for (const node of asList(plan.graph?.nodes)) {
        if (!nodesByZone.has(node.zoneId)) nodesByZone.set(node.zoneId, []);
        nodesByZone.get(node.zoneId).push(node);
      }
      let cursor = 0;
      for (const spawn of this.missionLevelSpawns.values()) {
        const nodes = nodesByZone.get(spawn.zoneId) || [];
        const zone = zones.get(spawn.zoneId);
        const count = Math.min(spawn.count || spawn.baseCount || 1, activeEnemies.length - cursor);
        for (let index = 0; index < count; index += 1) {
          const enemy = activeEnemies[cursor++];
          const node = nodes[index % Math.max(1, nodes.length)] || { x: (zone?.x || 600) + 120 + index * 90, y: fallbackGroundY };
          enemy.x = clamp(node.x + (index % 3 - 1) * 76, 0, this.missionLevelBounds.width - enemy.w);
          enemy.y = node.y - enemy.h;
          enemy.groundY = node.y;
          enemy.spawnX = enemy.x;
          enemy.levelSpawnId = spawn.id;
          enemy.levelZoneId = spawn.zoneId;
          enemy.dormant = !spawn.active;
          enemy.alive = spawn.active;
          enemy.deathClock = 0;
        }
      }
      const unused = activeEnemies.slice(cursor);
      for (const enemy of unused) enemy.alive = false;
      if (boss) {
        const anchor = plan.anchors.boss || plan.anchors['objective-primary'] || plan.anchors.extraction;
        if (anchor) {
          boss.x = clamp(anchor.x - boss.w / 2, 0, this.missionLevelBounds.width - boss.w);
          boss.y = anchor.y - boss.h;
          boss.groundY = anchor.y;
          boss.spawnX = boss.x;
          boss.levelZoneId = anchor.zoneId;
          boss.dormant = false;
          boss.alive = true;
        }
      }
      this.enemies = [...activeEnemies, ...(boss ? [boss] : [])];
      const keyCarrier = activeEnemies.find((enemy) => enemy.alive) || null;
      if (keyCarrier) keyCarrier.keyCarrier = true;
      for (const enemy of this.enemies.filter((candidate) => candidate.alive)) this.initializeEnemyMissionNavigation(enemy);
    }

    missionLevelSurfaceFor(entity, { tolerance = 34, includeLifts = true, preferId = null } = {}) {
      if (!entity) return null;
      const centerX = entity.x + entity.w / 2;
      const footY = entity.y + entity.h;
      const candidates = (this.platforms || []).filter((platform) => (
        (includeLifts || platform.kind !== 'lift')
        && centerX >= platform.x - 2
        && centerX <= platform.x + platform.w + 2
        && Math.abs(footY - platform.y) <= tolerance
      ));
      if (!candidates.length) return null;
      return candidates.sort((left, right) => {
        const leftPreferred = left.id === preferId ? -1 : 0;
        const rightPreferred = right.id === preferId ? -1 : 0;
        if (leftPreferred !== rightPreferred) return leftPreferred - rightPreferred;
        return Math.abs(footY - left.y) - Math.abs(footY - right.y);
      })[0];
    }

    missionLevelSurfaceNear(entity, { verticalRange = 180, includeLifts = true } = {}) {
      if (!entity) return null;
      const centerX = entity.x + entity.w / 2;
      const footY = entity.y + entity.h;
      return (this.platforms || [])
        .filter((platform) => (
          (includeLifts || platform.kind !== 'lift')
          && centerX >= platform.x - 2
          && centerX <= platform.x + platform.w + 2
          && Math.abs(footY - platform.y) <= verticalRange
        ))
        .sort((left, right) => Math.abs(footY - left.y) - Math.abs(footY - right.y))[0] || null;
    }

    initializeEnemyMissionNavigation(enemy) {
      if (!enemy) return null;
      const surface = this.missionLevelSurfaceFor(enemy, { tolerance: 48 }) || this.missionLevelSurfaceNear(enemy);
      if (surface) {
        enemy.y = surface.y - enemy.h;
        enemy.groundY = surface.y;
      }
      enemy.levelNavigation = {
        mode: 'surface',
        surfaceId: surface?.id || null,
        connectorId: null,
        destinationY: null,
        riding: false,
        lastSafeX: enemy.x,
        lastSafeY: enemy.y
      };
      return surface;
    }

    missionLevelEnemyTarget(enemy) {
      return [this.player, this.coopEnabled ? this.coop : null]
        .filter((actor) => actor?.alive)
        .sort((left, right) => Math.abs(left.x - enemy.x) - Math.abs(right.x - enemy.x))[0] || null;
    }

    missionLevelConnectorFromSurface(surfaceY, targetY, enemy, target) {
      const currentGap = Math.abs(surfaceY - targetY);
      const centerX = enemy.x + enemy.w / 2;
      const targetCenterX = target ? target.x + target.w / 2 : centerX;
      const connectors = [
        ...(this.ladders || []).map((ladder) => ({
          ...ladder,
          connectorKind: 'ladder',
          centerX: ladder.x,
          topY: ladder.top,
          bottomY: ladder.bottom
        })),
        ...(this.lifts || []).map((lift) => ({
          ...lift,
          connectorKind: 'lift',
          centerX: lift.x + lift.w / 2,
          bottomY: lift.baseY
        }))
      ];
      return connectors
        .flatMap((connector) => {
          const endpoints = [connector.topY, connector.bottomY];
          return endpoints.map((entryY, index) => ({
            connector,
            entryY,
            destinationY: endpoints[index === 0 ? 1 : 0]
          }));
        })
        .filter((entry) => Math.abs(entry.entryY - surfaceY) <= 42)
        .filter((entry) => Math.abs(entry.destinationY - targetY) + 18 < currentGap)
        .sort((left, right) => {
          const leftScore = Math.abs(left.connector.centerX - centerX) * 0.52
            + Math.abs(left.destinationY - targetY) * 3
            + Math.abs(left.connector.centerX - targetCenterX) * 0.04
            + (left.connector.connectorKind === 'lift' ? 12 : 0);
          const rightScore = Math.abs(right.connector.centerX - centerX) * 0.52
            + Math.abs(right.destinationY - targetY) * 3
            + Math.abs(right.connector.centerX - targetCenterX) * 0.04
            + (right.connector.connectorKind === 'lift' ? 12 : 0);
          return leftScore - rightScore;
        })[0] || null;
    }

    moveEnemyOnMissionSurface(enemy, destinationX, delta, speedScale = 1) {
      const navigation = enemy.levelNavigation || (this.initializeEnemyMissionNavigation(enemy), enemy.levelNavigation);
      const previousX = enemy.x;
      const previousY = enemy.y;
      const direction = Math.sign(destinationX - enemy.x);
      const maxStep = Math.max(58, Number(enemy.speed) || 80) * speedScale * Math.max(0, delta);
      enemy.x += direction * Math.min(Math.abs(destinationX - enemy.x), maxStep);
      enemy.facing = direction || enemy.facing || 1;
      this.resolveEnemyHorizontal(enemy, previousX);
      enemy.x = clamp(enemy.x, 0, Math.max(0, this.missionLevelBounds.width - enemy.w));
      const surface = this.missionLevelSurfaceFor(enemy, { tolerance: 40, preferId: navigation.surfaceId });
      if (!surface) {
        enemy.x = previousX;
        enemy.y = previousY;
        return false;
      }
      enemy.y = surface.y - enemy.h;
      enemy.groundY = surface.y;
      navigation.surfaceId = surface.id;
      navigation.lastSafeX = enemy.x;
      navigation.lastSafeY = enemy.y;
      return true;
    }

    advanceEnemyMissionNavigation(enemy, target, currentSurface, targetSurface, delta) {
      const navigation = enemy.levelNavigation || (this.initializeEnemyMissionNavigation(enemy), enemy.levelNavigation);
      if (navigation.mode === 'ladder') {
        const ladder = (this.ladders || []).find((entry) => entry.id === navigation.connectorId);
        if (!ladder) {
          navigation.mode = 'surface';
          navigation.connectorId = null;
          return false;
        }
        enemy.attacking = false;
        enemy.x += (ladder.x - enemy.w / 2 - enemy.x) * Math.min(1, Math.max(0, delta) * 14);
        const footY = enemy.y + enemy.h;
        const direction = Math.sign(navigation.destinationY - footY);
        const nextFootY = footY + direction * Math.min(Math.abs(navigation.destinationY - footY), 150 * Math.max(0, delta));
        enemy.y = nextFootY - enemy.h;
        enemy.groundY = navigation.destinationY;
        if (Math.abs(nextFootY - navigation.destinationY) <= 1) {
          const landing = this.missionLevelSurfaceFor(enemy, { tolerance: 46, includeLifts: false })
            || this.missionLevelSurfaceNear(enemy, { verticalRange: 52, includeLifts: false });
          if (landing) {
            enemy.y = landing.y - enemy.h;
            enemy.groundY = landing.y;
            navigation.surfaceId = landing.id;
          }
          navigation.mode = 'surface';
          navigation.connectorId = null;
          navigation.destinationY = null;
          navigation.lastSafeX = enemy.x;
          navigation.lastSafeY = enemy.y;
        }
        return true;
      }

      if (navigation.mode === 'lift') {
        const lift = (this.lifts || []).find((entry) => entry.id === navigation.connectorId);
        if (!lift) {
          navigation.mode = 'surface';
          navigation.connectorId = null;
          navigation.riding = false;
          return false;
        }
        const boardingX = lift.x + lift.w / 2 - enemy.w / 2;
        enemy.attacking = false;
        if (!navigation.riding) {
          this.moveEnemyOnMissionSurface(enemy, boardingX, delta, 0.9);
          const aligned = Math.abs(enemy.x - boardingX) <= 7;
          const liftAtEntry = Math.abs(lift.y - (enemy.y + enemy.h)) <= 18;
          if (aligned && liftAtEntry) {
            enemy.x = boardingX;
            enemy.y = lift.y - enemy.h;
            enemy.groundY = lift.y;
            navigation.surfaceId = lift.id;
            navigation.riding = true;
          }
          return true;
        }
        enemy.x = boardingX;
        enemy.y = lift.y - enemy.h;
        enemy.groundY = lift.y;
        navigation.surfaceId = lift.id;
        if (Math.abs(lift.y - navigation.destinationY) <= 12) {
          const landing = this.missionLevelSurfaceFor(enemy, { tolerance: 46, includeLifts: false })
            || this.missionLevelSurfaceNear(enemy, { verticalRange: 52, includeLifts: false });
          if (landing) {
            enemy.y = landing.y - enemy.h;
            enemy.groundY = landing.y;
            navigation.surfaceId = landing.id;
            navigation.mode = 'surface';
            navigation.connectorId = null;
            navigation.destinationY = null;
            navigation.riding = false;
            navigation.lastSafeX = enemy.x;
            navigation.lastSafeY = enemy.y;
          }
        }
        return true;
      }

      if (!currentSurface || !targetSurface || Math.abs(currentSurface.y - targetSurface.y) <= 42) return false;
      const route = this.missionLevelConnectorFromSurface(currentSurface.y, targetSurface.y, enemy, target);
      if (!route) return true;
      const destinationX = route.connector.centerX - enemy.w / 2;
      this.moveEnemyOnMissionSurface(enemy, destinationX, delta, enemy.isBoss ? 0.72 : 1);
      if (Math.abs(enemy.x - destinationX) > 7) return true;
      navigation.mode = route.connector.connectorKind;
      navigation.connectorId = route.connector.id;
      navigation.destinationY = route.destinationY;
      navigation.riding = false;
      return true;
    }

    enforceMissionLevelActorBounds(actor) {
      if (!actor || !this.missionLevelBounds) return false;
      actor.x = clamp(actor.x, 0, Math.max(0, this.missionLevelBounds.width - actor.w));
      if (actor.y <= this.missionLevelBounds.voidY) return false;
      this.damagePlayer(actor, 35, { bypassCover: true, source: 'fall' });
      const offset = actor === this.coop ? 52 : 0;
      actor.x = clamp((this.checkpoint?.x || 0) - offset, 0, Math.max(0, this.missionLevelBounds.width - actor.w));
      actor.y = this.checkpoint?.y || 0;
      actor.vx = 0;
      actor.vy = 0;
      actor.climbing = false;
      actor.grounded = false;
      return true;
    }

    updatePlayer(actor, delta, controls) {
      const previous = { x: actor?.x, y: actor?.y, climbing: Boolean(actor?.climbing) };
      const result = super.updatePlayer(actor, delta, controls);
      const blockedDoor = this.missionLevelRuntime && actor?.climbing
        ? (this.doors || []).find((door) => (
          !door.open
          && (Number(door.progress) || 0) < 0.82
          && actor.x < door.x + door.w
          && actor.x + actor.w > door.x
          && actor.y < door.y + door.h
          && actor.y + actor.h > door.y
        ))
        : null;
      if (blockedDoor) {
        actor.x = previous.x;
        actor.y = previous.y;
        actor.vy = 0;
        actor.climbing = false;
        actor.grounded = false;
      }
      if (this.missionLevelRuntime) this.enforceMissionLevelActorBounds(actor);
      return result;
    }

    updateLifts(delta) {
      const result = super.updateLifts(delta);
      if (!this.missionLevelRuntime) return result;
      for (const enemy of (this.enemies || []).filter((candidate) => candidate.alive && candidate.levelNavigation?.mode === 'lift' && candidate.levelNavigation.riding)) {
        const lift = (this.lifts || []).find((entry) => entry.id === enemy.levelNavigation.connectorId);
        if (!lift) continue;
        enemy.x = lift.x + lift.w / 2 - enemy.w / 2;
        enemy.y = lift.y - enemy.h;
        enemy.groundY = lift.y;
        enemy.levelNavigation.surfaceId = lift.id;
        enemy.levelNavigation.lastSafeX = enemy.x;
        enemy.levelNavigation.lastSafeY = enemy.y;
      }
      return result;
    }

    update(delta) {
      super.update(delta);
      if (!this.missionLevelRuntime || this.mission?.state !== 'active') return;
      this.camera.x = clamp(this.camera.x, 0, Math.max(0, this.missionLevelBounds.width - LOGICAL_WIDTH));
      this.camera.y = clamp(this.camera.y, 0, Math.max(0, this.missionLevelBounds.height - LOGICAL_HEIGHT));
      if (this.vehicle?.active) this.vehicle.x = clamp(this.vehicle.x, 0, Math.max(0, this.missionLevelBounds.width - this.vehicle.w));
      this.missionLevelVisualState.zoneBlend = this.accessibilityRuntime?.reducedMotion
        ? 1
        : clamp((Number(this.missionLevelVisualState.zoneBlend) || 0) + delta / 0.28, 0, 1);
      this.missionLevelVisualState.eventFlash = Math.max(0, this.missionLevelVisualState.eventFlash - delta * 1.8);
      this.updateMissionLevelTimers(delta);
      this.refreshMissionLevelZone(false);
      if (this.mission?.objectives?.extract) {
        for (const event of this.missionLevelEvents.values()) if (event.trigger?.type === 'objective-complete') this.triggerMissionLevelEvent(event.id, 'objective-complete');
      }
    }

    updateEnemy(enemy, delta) {
      if (enemy?.dormant) return;
      if (!this.missionLevelRuntime || !enemy) return super.updateEnemy(enemy, delta);
      const navigation = enemy.levelNavigation || (this.initializeEnemyMissionNavigation(enemy), enemy.levelNavigation);
      const previous = { x: enemy.x, y: enemy.y };
      const previousSurface = this.missionLevelSurfaceFor(enemy, { tolerance: 42, preferId: navigation.surfaceId })
        || this.missionLevelSurfaceNear(enemy, { verticalRange: 52 });
      const initialTarget = this.missionLevelEnemyTarget(enemy);
      if (enemy.isBoss && initialTarget && entityDistance(enemy, initialTarget) <= 640) enemy.alert = true;
      const result = super.updateEnemy(enemy, delta);
      if (!enemy.alive) return result;
      enemy.x = clamp(enemy.x, 0, Math.max(0, this.missionLevelBounds.width - enemy.w));
      const target = this.missionLevelEnemyTarget(enemy);
      const targetSurface = this.missionLevelSurfaceFor(target, { tolerance: 52 })
        || this.missionLevelSurfaceNear(target, { verticalRange: 150 });

      if (navigation.mode !== 'surface') {
        this.advanceEnemyMissionNavigation(enemy, target, previousSurface, targetSurface, delta);
        enemy.x = clamp(enemy.x, 0, Math.max(0, this.missionLevelBounds.width - enemy.w));
        return result;
      }

      if (enemy.alert && previousSurface && targetSurface && Math.abs(previousSurface.y - targetSurface.y) > 42) {
        enemy.x = previous.x;
        enemy.y = previousSurface.y - enemy.h;
        enemy.groundY = previousSurface.y;
        navigation.surfaceId = previousSurface.id;
        navigation.lastSafeX = enemy.x;
        navigation.lastSafeY = enemy.y;
        this.advanceEnemyMissionNavigation(enemy, target, previousSurface, targetSurface, delta);
        return result;
      }

      const support = this.missionLevelSurfaceFor(enemy, { tolerance: 42, preferId: navigation.surfaceId });
      if (support) {
        enemy.y = support.y - enemy.h;
        enemy.groundY = support.y;
        navigation.surfaceId = support.id;
        navigation.lastSafeX = enemy.x;
        navigation.lastSafeY = enemy.y;
      } else if (previousSurface) {
        enemy.x = previous.x;
        enemy.y = previousSurface.y - enemy.h;
        enemy.groundY = previousSurface.y;
        navigation.surfaceId = previousSurface.id;
      } else {
        enemy.x = navigation.lastSafeX;
        enemy.y = navigation.lastSafeY;
      }
      return result;
    }

    defeatEnemy(enemy, owner = this.player) {
      const wasBoss = Boolean(enemy?.isBoss && enemy.alive);
      const result = super.defeatEnemy(enemy, owner);
      if (wasBoss && !enemy.alive) {
        for (const door of this.doors.filter((candidate) => candidate.lockedBy === 'boss' && candidate.levelLocked)) {
          door.levelLocked = false;
          this.missionLevelTelemetry.doorChanges += 1;
          this.onEvent({ type: 'mission-door-unlocked', doorId: door.id, source: 'boss-defeated' });
        }
      }
      return result;
    }

    refreshMissionLevelZone(initial) {
      const zone = zoneForPosition(this.missionLevelRuntime, this.player);
      if (!zone || zone.id === this.missionLevelVisualState.activeZoneId) return zone;
      this.missionLevelVisualState.previousZoneId = this.missionLevelVisualState.activeZoneId;
      this.missionLevelVisualState.activeZoneId = zone.id;
      this.missionLevelVisualState.zoneBlend = initial || this.accessibilityRuntime?.reducedMotion ? 1 : 0;
      this.missionLevelTelemetry.transitions += initial ? 0 : 1;
      if (!initial) this.onEvent({ type: 'mission-zone', zoneId: zone.id, name: zone.label, biome: zone.biome });
      for (const event of this.missionLevelEvents.values()) if (event.trigger?.type === 'enter-zone' && event.trigger.zoneId === zone.id) this.triggerMissionLevelEvent(event.id, 'enter-zone');
      return zone;
    }

    startMissionLevelTimer(timerId, event = {}) {
      const profile = MISSION_LEVEL_TIMER_PROFILES[timerId];
      if (!profile) return { timer: null, started: false };
      const existing = this.missionLevelTimers.get(timerId);
      if (existing) return { timer: existing, started: false };
      const duration = timerDuration(profile, this.difficultyRuntime?.id || this.difficulty || 'standard');
      const timer = {
        id: profile.id,
        label: profile.label,
        state: 'running',
        duration,
        remaining: duration,
        startedAt: Number(this.mission?.elapsed) || 0,
        completedAt: null,
        sourceEventId: event.id || null,
        holdRadius: timerId === 'extraction' ? 220 : null,
        holdTarget: timerId === 'extraction' && this.objective ? {
          x: this.objective.x,
          y: this.objective.y,
          w: this.objective.w,
          h: this.objective.h
        } : null
      };
      this.missionLevelTimers.set(timer.id, timer);
      if (timer.id === 'extraction') {
        this.missionLevelExtractionTimer = timer;
        this.missionLevelExtractionUnlocked = false;
      }
      this.onEvent({ type: 'mission-timer-started', timerId: timer.id, duration: timer.duration, eventId: timer.sourceEventId });
      return { timer, started: true };
    }

    updateMissionLevelTimers(delta) {
      for (const timer of this.missionLevelTimers?.values() || []) {
        if (timer.state === 'complete') continue;
        if (timer.holdTarget && timer.holdRadius) {
          const defenders = [this.player, this.coopEnabled ? this.coop : null].filter((actor) => actor?.alive);
          const insideHoldZone = defenders.some((actor) => entityDistance(actor, timer.holdTarget) <= timer.holdRadius);
          if (!insideHoldZone) {
            if (timer.state !== 'paused') {
              timer.state = 'paused';
              this.onEvent({ type: 'mission-timer-paused', timerId: timer.id, remaining: timer.remaining, eventId: timer.sourceEventId });
            }
            continue;
          }
          if (timer.state === 'paused') {
            timer.state = 'running';
            this.onEvent({ type: 'mission-timer-resumed', timerId: timer.id, remaining: timer.remaining, eventId: timer.sourceEventId });
          }
        }
        if (timer.state !== 'running') continue;
        timer.remaining = Math.max(0, timer.remaining - Math.max(0, Number(delta) || 0));
        if (timer.remaining > 0) continue;
        timer.state = 'complete';
        timer.completedAt = Number(this.mission?.elapsed) || timer.startedAt + timer.duration;
        if (timer.id === 'extraction') this.missionLevelExtractionUnlocked = true;
        this.onEvent({ type: 'mission-timer-complete', timerId: timer.id, duration: timer.duration, eventId: timer.sourceEventId });
      }
    }

    missingExtractionRequirement() {
      const inherited = super.missingExtractionRequirement();
      if (inherited) return inherited;
      const timer = this.missionLevelTimers?.get('extraction');
      if (timer?.state === 'paused') return `REVENIR DANS LA ZONE · ${Math.max(1, Math.ceil(timer.remaining))} S`;
      if (timer?.state === 'running') return `TENIR LA ZONE · ${Math.max(1, Math.ceil(timer.remaining))} S`;
      return '';
    }

    phaseLabel() {
      const timer = this.missionLevelTimers?.get('extraction');
      if (timer?.state === 'paused') return `BALISE HORS PORTÉE · ${Math.max(1, Math.ceil(timer.remaining))} S`;
      if (timer?.state === 'running') return `TENIR LA BALISE · ${Math.max(1, Math.ceil(timer.remaining))} S`;
      return super.phaseLabel();
    }

    triggerMissionLevelEvent(eventId, source = 'runtime') {
      const event = this.missionLevelEvents?.get(eventId);
      if (!event || event.triggered) return false;
      event.triggered = true;
      event.triggerCount += 1;
      this.missionLevelTelemetry.events += 1;
      this.missionLevelVisualState.eventFlash = 1;
      const consequences = [];
      for (const action of asList(event.actions)) consequences.push(this.applyMissionLevelAction(action, event));
      this.onEvent({ type: 'mission-level-event', eventId, source, actions: [...event.actions], consequences });
      return true;
    }

    applyMissionLevelAction(action, event) {
      const [kind, value] = String(action).split(':');
      if (kind === 'spawn') {
        const spawn = this.missionLevelSpawns.get(value);
        if (spawn && !spawn.active) {
          spawn.active = true;
          spawn.activatedAt = this.mission?.elapsed || 0;
          let activated = 0;
          for (const enemy of this.enemies.filter((candidate) => candidate.levelSpawnId === spawn.id)) {
            if (!enemy.dormant) continue;
            enemy.dormant = false;
            enemy.alive = true;
            enemy.health = enemy.maxHealth;
            enemy.alert = true;
            activated += 1;
          }
          this.missionLevelTelemetry.spawns += activated;
          return { action, changed: activated };
        }
      }
      if (kind === 'activate' || kind === 'toggle') {
        const hazard = this.hazards.find((candidate) => candidate.id === value);
        if (hazard) {
          hazard.active = kind === 'toggle' ? !hazard.active : true;
          this.missionLevelTelemetry.hazardChanges += 1;
          return { action, changed: hazard.active };
        }
      }
      if (kind === 'open' || kind === 'close' || kind === 'lock') {
        const door = this.doors.find((candidate) => candidate.id === value);
        if (door) {
          if (kind === 'open') { door.open = true; door.levelLocked = false; }
          if (kind === 'close') door.open = false;
          if (kind === 'lock') { door.open = false; door.levelLocked = true; }
          this.missionLevelTelemetry.doorChanges += 1;
          return { action, changed: door.open, locked: door.levelLocked };
        }
      }
      if (kind === 'power') {
        if (this.powerNode) this.powerNode.active = value === 'restore';
        if (value === 'restore') this.mission.objectives.power = true;
        return { action, changed: Boolean(this.powerNode?.active) };
      }
      if (kind === 'art' || kind === 'weather') {
        const stateKey = String(value).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
        this.missionLevelVisualState[stateKey] = true;
        if (value === 'blackout') this.missionLevelVisualState.blackout = true;
        if (value === 'emergency') this.missionLevelVisualState.emergency = true;
        if (value === 'storm') this.missionLevelVisualState.storm = true;
        if (value === 'break') { this.missionLevelVisualState.weatherBreak = true; this.missionLevelVisualState.storm = false; }
        this.missionLevelTelemetry.artChanges += 1;
        return { action, changed: true };
      }
      if (kind === 'timer') {
        const result = this.startMissionLevelTimer(value, event);
        return { action, changed: result.started, duration: result.timer?.duration || 0 };
      }
      if (kind === 'unlock' && value === 'extraction') {
        this.missionLevelExtractionUnlocked = true;
        return { action, changed: true };
      }
      return { action, changed: false, eventId: event.id };
    }

    interact(actor = this.player) {
      const anchors = this.missionLevelRuntime?.anchors || {};
      const nearAnchor = Object.entries(anchors).find(([, anchor]) => entityDistance(actor, { x: anchor.x - 20, y: anchor.y - 60, w: 40, h: 60 }) < 150);
      const missionVent = (this.vents || []).find((vent) => entityDistance(actor, vent) < 125);
      if (missionVent && Number.isFinite(missionVent.targetAnchorX) && Number.isFinite(missionVent.targetAnchorY)) {
        if (missionVent.requiresTool && !this.inventory.cutter) return this.locked('CHALUMEAU DE MAINTENANCE REQUIS');
        this.setToolAnimation(actor, 'cutting-torch', 0.95);
        missionVent.open = true;
        actor.x = missionVent.targetAnchorX - actor.w / 2;
        actor.y = missionVent.targetAnchorY - actor.h;
        actor.vx = 0;
        actor.vy = 0;
        this.mission.objectives.route = true;
        this.setCheckpoint('vent', actor.x, actor.y);
        this.onEvent({ type: 'shortcut', ventId: missionVent.id, pairId: missionVent.pairId, direction: missionVent.direction });
        this.audio?.ui();
        return true;
      }
      const result = super.interact(actor);
      if (nearAnchor) {
        const [anchorId] = nearAnchor;
        for (const event of this.missionLevelEvents?.values() || []) if (event.trigger?.type === 'interact-anchor' && event.trigger.anchorId === anchorId) this.triggerMissionLevelEvent(event.id, 'interact-anchor');
      }
      return result;
    }

    doorRequirement(door) {
      if (door?.levelLocked) return 'ÉVÉNEMENT DE SECTEUR EN COURS';
      return super.doorRequirement(door);
    }

    drawBackdrop(ctx) {
      const plan = this.missionLevelRuntime;
      if (!plan) return super.drawBackdrop(ctx);
      const gradient = ctx.createLinearGradient(0, 0, 0, LOGICAL_HEIGHT);
      gradient.addColorStop(0, plan.palette?.sky || '#020608');
      gradient.addColorStop(0.68, plan.palette?.haze || '#101a17');
      gradient.addColorStop(1, plan.palette?.floor || '#161b17');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
      const far = this.missionLevelLayerImage('far');
      const mid = this.missionLevelLayerImage('mid');
      const blend = clamp(Number(this.missionLevelVisualState.zoneBlend) || 0, 0, 1);
      const previousZoneId = this.missionLevelVisualState.previousZoneId;
      const previousFar = blend < 1 && previousZoneId ? this.missionLevelLayerImage('far', previousZoneId) : null;
      const previousMid = blend < 1 && previousZoneId ? this.missionLevelLayerImage('mid', previousZoneId) : null;
      ctx.save();
      if (imageReady(previousFar) && previousFar !== far) this.drawMissionLevelCover(ctx, previousFar, 0.075, 0.94 * (1 - blend), 1.08, 0);
      if (imageReady(far)) this.drawMissionLevelCover(ctx, far, 0.075, previousFar && previousFar !== far ? 0.94 * blend : 0.94, 1.08, 0);
      if (imageReady(previousMid) && previousMid !== mid) this.drawMissionLevelCover(ctx, previousMid, 0.32, 0.72 * (1 - blend), 1.08, 22);
      if (imageReady(mid)) this.drawMissionLevelCover(ctx, mid, 0.32, previousMid && previousMid !== mid ? 0.72 * blend : 0.72, 1.08, 22);
      const zone = asList(plan.biomeZones).find((entry) => entry.id === this.missionLevelVisualState.activeZoneId);
      if (zone?.visual?.tint) {
        ctx.globalAlpha = this.missionLevelVisualState.blackout ? 0.5 : 0.2;
      this.drawCeilingCables(ctx);
        ctx.fillStyle = zone.visual.tint;
        ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
      }
      if (this.missionLevelVisualState.blackout) {
        ctx.globalAlpha = 0.46;
        ctx.fillStyle = '#000608';
        ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
      }
      if (this.missionLevelVisualState.eventFlash > 0) {
        ctx.globalAlpha = this.missionLevelVisualState.eventFlash * 0.16;
        ctx.fillStyle = this.missionLevelVisualState.emergency ? '#b7482f' : '#b8d8cb';
        ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
      }
      ctx.restore();
    }

    drawMissionLevelCover(ctx, image, factor, alpha, overscan, yOffset) {
      const height = LOGICAL_HEIGHT * overscan;
      const width = (image.naturalWidth || image.width) * (height / (image.naturalHeight || image.height));
      const offsetX = -((this.camera.x * factor) % Math.max(1, width));
      const offsetY = -this.camera.y * factor * 0.3 - (height - LOGICAL_HEIGHT) * 0.5 + yOffset;
      ctx.globalAlpha = alpha;
      for (let x = offsetX - width; x < LOGICAL_WIDTH + width; x += width) ctx.drawImage(image, x, offsetY, width, height);
      ctx.globalAlpha = 1;
    }

    drawWorld(ctx) {
      const plan = this.missionLevelRuntime;
      if (plan) {
        ctx.save();
        for (const zone of asList(plan.biomeZones)) {
          ctx.globalAlpha = zone.id === this.missionLevelVisualState.activeZoneId ? 0.12 : 0.045;
          ctx.fillStyle = zone.visual?.tint || plan.palette?.haze || '#243b36';
          ctx.fillRect(zone.x, 110, zone.w, 820);
          if (zone.visual?.fog) {
            ctx.globalAlpha = zone.visual.fog * 0.18;
            ctx.fillStyle = '#b8c8bf';
            for (let x = zone.x; x < zone.x + zone.w; x += 190) ctx.fillRect(x, 300 + (x % 170), 120, 14);
          }
        }
        ctx.restore();
      }
      super.drawWorld(ctx);
    }

    drawEnemy(ctx, enemy) {
      if (enemy?.dormant) return;
      return super.drawEnemy(ctx, enemy);
    }

    drawForeground(ctx) {
      const plan = this.missionLevelRuntime;
      if (!plan) return super.drawForeground(ctx);
      const image = this.missionLevelLayerImage('foreground');
      if (!imageReady(image)) {
        this.drawHazardForegroundOverlays(ctx);
        this.drawForegroundPipes(ctx);
        return;
      }
      const hasDedicatedZoneLayer = Boolean(
        MISSION_LEVEL_ZONE_LAYER_FILES_V57[plan.templateId]?.[this.missionLevelVisualState?.activeZoneId]?.foreground
      );
      if (hasDedicatedZoneLayer) {
        const blend = clamp(Number(this.missionLevelVisualState.zoneBlend) || 0, 0, 1);
        const previousZoneId = this.missionLevelVisualState.previousZoneId;
        const previousImage = blend < 1 && previousZoneId ? this.missionLevelLayerImage('foreground', previousZoneId) : null;
        ctx.save();
        const factor = this.accessibilityRuntime?.reducedMotion ? 1 : 1.12;
        const alpha = this.accessibilityRuntime?.reducedMotion ? 0.48 : 0.66;
        if (imageReady(previousImage) && previousImage !== image) this.drawMissionLevelCover(ctx, previousImage, factor, alpha * (1 - blend), 1, 0);
        this.drawMissionLevelCover(ctx, image, factor, previousImage && previousImage !== image ? alpha * blend : alpha, 1, 0);
        ctx.restore();
        this.drawHazardForegroundOverlays(ctx);
        this.drawForegroundPipes(ctx);
        return;
      }
      const height = plan.templateId === 'planet-exterior' ? 250 : 230;
      const width = (image.naturalWidth || image.width) * (height / (image.naturalHeight || image.height));
      const offset = -((this.camera.x * 1.12) % Math.max(1, width));
      ctx.save();
      ctx.globalAlpha = this.accessibilityRuntime?.reducedMotion ? 0.2 : 0.34;
      for (let x = offset - width; x < LOGICAL_WIDTH + width; x += Math.max(40, width - 12)) ctx.drawImage(image, x, LOGICAL_HEIGHT - height, width, height);
      if (this.missionLevelVisualState.storm && !this.accessibilityRuntime?.reducedMotion) {
        ctx.strokeStyle = 'rgba(190,210,196,.24)';
        ctx.lineWidth = 2;
        for (let index = 0; index < 28; index += 1) {
          const x = (index * 61 + this.animationTime * 210) % (LOGICAL_WIDTH + 140) - 70;
          const y = (index * 97) % LOGICAL_HEIGHT;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 32, y + 58); ctx.stroke();
        }
      }
      ctx.restore();
      this.drawHazardForegroundOverlays(ctx);
      this.drawForegroundPipes(ctx);
    }

    drawHud(ctx) {
      super.drawHud(ctx);
      const timer = this.missionLevelTimers?.get('extraction');
      if (!timer || timer.state === 'complete') return;
      const x = 474;
      const y = this.coopEnabled ? 94 : 48;
      const width = 332;
      const height = 42;
      const progress = clamp(1 - timer.remaining / Math.max(1, timer.duration), 0, 1);
      ctx.save();
      ctx.fillStyle = 'rgba(18, 7, 5, .9)'; ctx.fillRect(x, y, width, height);
      ctx.strokeStyle = timer.state === 'paused' ? '#dbc16e' : '#d07855'; ctx.strokeRect(x + 0.5, y + 0.5, width, height);
      ctx.fillStyle = '#f1c69b'; ctx.font = 'bold 11px monospace';
      ctx.fillText(`${timer.state === 'paused' ? 'REVENIR DANS LA ZONE' : timer.label} · ${Math.max(1, Math.ceil(timer.remaining))} S`, x + 12, y + 17);
      ctx.fillStyle = '#3b211a'; ctx.fillRect(x + 12, y + 27, width - 24, 5);
      ctx.fillStyle = '#df8059'; ctx.fillRect(x + 12, y + 27, (width - 24) * progress, 5);
      ctx.restore();
    }

    captureResumeState() {
      const state = super.captureResumeState();
      if (!this.missionLevelRuntime) return state;
      return {
        ...state,
        missionLevel: {
          schema: 2,
          signature: this.missionLevelRuntime.signature,
          activeZoneId: this.missionLevelVisualState.activeZoneId,
          events: [...this.missionLevelEvents.values()].map((event) => ({ id: event.id, triggered: Boolean(event.triggered), triggerCount: event.triggerCount })),
          spawns: [...this.missionLevelSpawns.values()].map((spawn) => ({ id: spawn.id, active: Boolean(spawn.active), activatedAt: spawn.activatedAt })),
          doors: (this.doors || []).map((door) => ({ id: door.id, open: Boolean(door.open), progress: Number(door.progress) || 0, levelLocked: Boolean(door.levelLocked) })),
          hazards: (this.hazards || []).map((hazard) => ({ id: hazard.id, active: Boolean(hazard.active) })),
          visualState: { ...this.missionLevelVisualState },
          telemetry: { ...this.missionLevelTelemetry },
          timers: [...this.missionLevelTimers.values()].map(timerSnapshot)
        }
      };
    }

    applyResumeState(rawState) {
      const result = super.applyResumeState(rawState);
      const source = rawState?.missionLevel;
      if (!source || !this.missionLevelRuntime) return result;
      if (source.signature && source.signature !== this.missionLevelRuntime.signature) return { ...result, missionLevelRestored: false, missionLevelReason: 'signature-mismatch' };
      const events = new Map(asList(source.events).map((event) => [event.id, event]));
      for (const event of this.missionLevelEvents.values()) {
        const saved = events.get(event.id);
        if (!saved) continue;
        event.triggered = Boolean(saved.triggered);
        event.triggerCount = clamp(Math.round(Number(saved.triggerCount) || 0), 0, 999);
      }
      const spawns = new Map(asList(source.spawns).map((spawn) => [spawn.id, spawn]));
      for (const spawn of this.missionLevelSpawns.values()) {
        const saved = spawns.get(spawn.id);
        if (!saved) continue;
        spawn.active = Boolean(saved.active);
        spawn.activatedAt = Number(saved.activatedAt) || null;
        for (const enemy of this.enemies.filter((candidate) => candidate.levelSpawnId === spawn.id)) {
          enemy.dormant = !spawn.active;
          if (!spawn.active) enemy.alive = false;
        }
      }
      const savedDoors = new Map(asList(source.doors).map((door) => [door.id, door]));
      for (const door of this.doors || []) {
        const saved = savedDoors.get(door.id);
        if (!saved) continue;
        door.open = Boolean(saved.open);
        door.progress = clamp(Number(saved.progress) || 0, 0, 1);
        door.levelLocked = Boolean(saved.levelLocked);
      }
      const savedHazards = new Map(asList(source.hazards).map((hazard) => [hazard.id, hazard]));
      for (const hazard of this.hazards || []) {
        const saved = savedHazards.get(hazard.id);
        if (!saved) continue;
        hazard.active = Boolean(saved.active);
      }
      if (source.visualState && typeof source.visualState === 'object') Object.assign(this.missionLevelVisualState, source.visualState);
      if (source.telemetry && typeof source.telemetry === 'object') Object.assign(this.missionLevelTelemetry, source.telemetry);
      const savedTimers = asList(source.timers);
      for (const saved of savedTimers) {
        const profile = MISSION_LEVEL_TIMER_PROFILES[saved?.id];
        if (!profile) continue;
        const savedDuration = Number(saved.duration);
        const savedRemaining = Number(saved.remaining);
        const duration = clamp(Number.isFinite(savedDuration) && savedDuration > 0 ? savedDuration : timerDuration(profile, this.difficultyRuntime?.id || this.difficulty || 'standard'), 1, 600);
        const state = saved.state === 'complete' ? 'complete' : saved.state === 'paused' ? 'paused' : 'running';
        const timer = {
          id: profile.id,
          label: profile.label,
          state,
          duration,
          remaining: state === 'complete' ? 0 : clamp(Number.isFinite(savedRemaining) ? savedRemaining : duration, 0.01, duration),
          startedAt: Math.max(0, Number(saved.startedAt) || 0),
          completedAt: state === 'complete' ? Math.max(0, Number(saved.completedAt) || Number(this.mission?.elapsed) || 0) : null,
          sourceEventId: typeof saved.sourceEventId === 'string' ? saved.sourceEventId : null,
          holdRadius: Number(saved.holdRadius) > 0 ? Number(saved.holdRadius) : profile.id === 'extraction' ? 220 : null,
          holdTarget: saved.holdTarget && typeof saved.holdTarget === 'object'
            ? { ...saved.holdTarget }
            : profile.id === 'extraction' && this.objective
              ? { x: this.objective.x, y: this.objective.y, w: this.objective.w, h: this.objective.h }
              : null
        };
        this.missionLevelTimers.set(timer.id, timer);
        if (timer.id === 'extraction') {
          this.missionLevelExtractionTimer = timer;
          this.missionLevelExtractionUnlocked = timer.state === 'complete';
        }
      }
      if (!savedTimers.length) {
        const legacyTimerEvent = [...this.missionLevelEvents.values()].find((event) => event.triggered && asList(event.actions).includes('timer:extraction'));
        if (legacyTimerEvent) {
          const profile = MISSION_LEVEL_TIMER_PROFILES.extraction;
          const duration = timerDuration(profile, this.difficultyRuntime?.id || this.difficulty || 'standard');
          const timer = { id: profile.id, label: profile.label, state: 'complete', duration, remaining: 0, startedAt: 0, completedAt: Number(this.mission?.elapsed) || 0, sourceEventId: legacyTimerEvent.id, holdRadius: 220, holdTarget: this.objective ? { x: this.objective.x, y: this.objective.y, w: this.objective.w, h: this.objective.h } : null };
          this.missionLevelTimers.set(timer.id, timer);
          this.missionLevelExtractionTimer = timer;
          this.missionLevelExtractionUnlocked = true;
        }
      }
      return { ...result, missionLevelRestored: true };
    }

    getMissionLevelSnapshot() {
      const plan = this.missionLevelRuntime;
      if (!plan) return null;
      return {
        schemaVersion: 52,
        templateId: plan.templateId,
        templateLabel: plan.templateLabel,
        signature: plan.signature,
        topologySignature: plan.topologySignature,
        dimensions: { ...plan.dimensions },
        validation: plan.validation,
        routes: plan.graph.routes.map((route) => ({ id: route.id, role: route.role, nodes: route.nodeIds.length })),
        zones: plan.biomeZones.map((zone) => ({ id: zone.id, name: zone.label, biome: zone.biome, layers: { ...zone.layers } })),
        activeZoneId: this.missionLevelVisualState?.activeZoneId || null,
        events: this.missionLevelEvents ? [...this.missionLevelEvents.values()].map((event) => ({ id: event.id, triggered: event.triggered, triggerCount: event.triggerCount })) : [],
        spawns: this.missionLevelSpawns ? [...this.missionLevelSpawns.values()].map((spawn) => ({ id: spawn.id, active: spawn.active, count: spawn.count })) : [],
        artLayers: MISSION_LEVEL_LAYER_FILES_V52[plan.templateId] || null,
        activeArtLayers: resolveMissionLevelLayerFilesV57(plan.templateId, this.missionLevelVisualState?.activeZoneId),
        telemetry: this.missionLevelTelemetry ? { ...this.missionLevelTelemetry } : null,
        timers: this.missionLevelTimers ? [...this.missionLevelTimers.values()].map(timerSnapshot) : []
      };
    }

    getSnapshot() {
      const snapshot = super.getSnapshot();
      if (!this.missionLevelBounds) return { ...snapshot, missionLevelRuntime: this.getMissionLevelSnapshot() };
      return {
        ...snapshot,
        worldWidth: this.missionLevelBounds.width,
        worldHeight: this.missionLevelBounds.height,
        missionLevelRuntime: this.getMissionLevelSnapshot()
      };
    }
  };
}
