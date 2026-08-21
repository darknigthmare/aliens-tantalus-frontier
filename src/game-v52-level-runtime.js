const WORLD_WIDTH = 6200;
const WORLD_HEIGHT = 1080;
const FLOOR_Y = 930;
const LOGICAL_WIDTH = 1280;
const LOGICAL_HEIGHT = 720;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const asList = (value) => Array.isArray(value) ? value : [];
const entityDistance = (a, b) => Math.hypot((a.x + (a.w || 0) / 2) - (b.x + (b.w || 0) / 2), (a.y + (a.h || 0) / 2) - (b.y + (b.h || 0) / 2));
const imageReady = (image) => Boolean(image?.complete && (image.naturalWidth || image.width) > 0);

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
        overlay: plan.artLayers?.overlay || null,
        emergency: false,
        blackout: false,
        storm: false,
        bioluminescence: false,
        weatherBreak: false,
        eventFlash: 0
      };
      this.missionLevelTelemetry = { transitions: 0, events: 0, spawns: 0, artChanges: 0, doorChanges: 0, hazardChanges: 0 };
      this.loadMissionLevelArt(plan.templateId);
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

    loadMissionLevelArt(templateId) {
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
    }

    compileMissionLevelGeometry(plan) {
      const floor = { id: 'v52-safety-floor', x: -300, y: FLOOR_Y, w: WORLD_WIDTH + 600, h: WORLD_HEIGHT - FLOOR_Y + 140, art: 'floor', floor: true };
      this.platforms = [
        floor,
        ...asList(plan.geometry?.platforms).map((platform, index) => ({
          ...platform,
          art: platform.kind === 'terrain-step' ? 'ledge' : index % 3 === 0 ? 'ledge' : 'catwalk',
          floor: false
        }))
      ];
      this.lifts = [];
      this.ladders = asList(plan.geometry?.ladders).map((ladder) => ({
        id: ladder.id,
        x: ladder.x + ladder.w / 2,
        top: ladder.y,
        bottom: ladder.y + ladder.h,
        w: Math.max(42, ladder.w),
        kind: ladder.kind
      }));
      this.doors = asList(plan.geometry?.doors).map((door, index, list) => {
        const lockedBy = /aft|security/i.test(door.id) ? 'boss' : index === 0 ? 'power' : index === list.length - 1 ? 'security' : null;
        return { ...door, open: false, progress: 0, lockedBy, levelLocked: false };
      });
      this.vents = asList(plan.geometry?.vents).map((vent) => ({
        id: vent.id,
        x: vent.from.x - 42,
        y: vent.from.y - 46,
        w: 84,
        h: 64,
        open: false,
        requiresTool: true,
        targetX: vent.to.x - this.player.w / 2,
        targetY: vent.to.y - this.player.h,
        fromNodeId: vent.from.nodeId,
        toNodeId: vent.to.nodeId
      }));
      this.ventShortcut = this.vents[0] || { id: 'none', x: -1000, y: -1000, w: 0, h: 0, open: false };
      this.hazards = asList(plan.hazards).map((hazard) => ({ ...hazard }));
      const spawn = plan.anchors.spawn;
      const extraction = plan.anchors.extraction;
      const power = plan.anchors.power;
      const archive = plan.anchors.archive;
      if (spawn) {
        this.player.x = clamp(spawn.x - this.player.w / 2, 0, WORLD_WIDTH - this.player.w);
        this.player.y = clamp(spawn.y - this.player.h, 0, WORLD_HEIGHT - this.player.h);
        this.player.vx = 0;
        this.player.vy = 0;
        this.coop.x = clamp(this.player.x - 56, 0, WORLD_WIDTH - this.coop.w);
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
        art: index % 2 ? 'crates' : 'barricade',
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
      this.camera.x = clamp(this.player.x - 320, 0, WORLD_WIDTH - LOGICAL_WIDTH);
      this.camera.y = clamp(this.player.y - 360, 0, WORLD_HEIGHT - LOGICAL_HEIGHT);
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
      const boss = asList(this.enemies).find((enemy) => enemy.isBoss) || null;
      const standard = asList(this.enemies).filter((enemy) => enemy !== boss);
      while (standard.length < Math.min(28, desiredStandard)) {
        const index = standard.length;
        standard.push(this.createEnemy(sourceForSpawn(this, index), this.enemies.length + index, 700 + index * 140, FLOOR_Y, { boss: false, keyCarrier: false }));
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
          const node = nodes[index % Math.max(1, nodes.length)] || { x: (zone?.x || 600) + 120 + index * 90, y: FLOOR_Y };
          enemy.x = clamp(node.x + (index % 3 - 1) * 76, 0, WORLD_WIDTH - enemy.w);
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
          boss.x = clamp(anchor.x - boss.w / 2, 0, WORLD_WIDTH - boss.w);
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
    }

    update(delta) {
      super.update(delta);
      if (!this.missionLevelRuntime || this.mission?.state !== 'active') return;
      this.missionLevelVisualState.eventFlash = Math.max(0, this.missionLevelVisualState.eventFlash - delta * 1.8);
      this.refreshMissionLevelZone(false);
      if (this.mission?.objectives?.extract) {
        for (const event of this.missionLevelEvents.values()) if (event.trigger?.type === 'objective-complete') this.triggerMissionLevelEvent(event.id, 'objective-complete');
      }
    }

    updateEnemy(enemy, delta) {
      if (enemy?.dormant) return;
      return super.updateEnemy(enemy, delta);
    }

    refreshMissionLevelZone(initial) {
      const zone = zoneForPosition(this.missionLevelRuntime, this.player);
      if (!zone || zone.id === this.missionLevelVisualState.activeZoneId) return zone;
      this.missionLevelVisualState.previousZoneId = this.missionLevelVisualState.activeZoneId;
      this.missionLevelVisualState.activeZoneId = zone.id;
      this.missionLevelTelemetry.transitions += initial ? 0 : 1;
      if (!initial) this.onEvent({ type: 'mission-zone', zoneId: zone.id, name: zone.name, biome: zone.biome });
      for (const event of this.missionLevelEvents.values()) if (event.trigger?.type === 'enter-zone' && event.trigger.zoneId === zone.id) this.triggerMissionLevelEvent(event.id, 'enter-zone');
      return zone;
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
        this.missionLevelExtractionTimer = { id: value, startedAt: this.mission?.elapsed || 0 };
        return { action, changed: true };
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
      const templateId = plan.templateId;
      const far = this.images?.get(layerKey(templateId, 'far'));
      const mid = this.images?.get(layerKey(templateId, 'mid'));
      ctx.save();
      if (imageReady(far)) this.drawMissionLevelCover(ctx, far, 0.075, 0.94, 1.08, 0);
      if (imageReady(mid)) this.drawMissionLevelCover(ctx, mid, 0.32, 0.72, 1.08, 22);
      const zone = asList(plan.biomeZones).find((entry) => entry.id === this.missionLevelVisualState.activeZoneId);
      if (zone?.visual?.tint) {
        ctx.globalAlpha = this.missionLevelVisualState.blackout ? 0.5 : 0.2;
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
      const image = this.images?.get(layerKey(plan.templateId, 'foreground'));
      if (!imageReady(image)) return;
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
    }

    captureResumeState() {
      const state = super.captureResumeState();
      if (!this.missionLevelRuntime) return state;
      return {
        ...state,
        missionLevel: {
          schema: 1,
          signature: this.missionLevelRuntime.signature,
          activeZoneId: this.missionLevelVisualState.activeZoneId,
          events: [...this.missionLevelEvents.values()].map((event) => ({ id: event.id, triggered: Boolean(event.triggered), triggerCount: event.triggerCount })),
          spawns: [...this.missionLevelSpawns.values()].map((spawn) => ({ id: spawn.id, active: Boolean(spawn.active), activatedAt: spawn.activatedAt })),
          visualState: { ...this.missionLevelVisualState },
          telemetry: { ...this.missionLevelTelemetry }
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
      if (source.visualState && typeof source.visualState === 'object') Object.assign(this.missionLevelVisualState, source.visualState);
      if (source.telemetry && typeof source.telemetry === 'object') Object.assign(this.missionLevelTelemetry, source.telemetry);
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
        validation: plan.validation,
        routes: plan.graph.routes.map((route) => ({ id: route.id, role: route.role, nodes: route.nodeIds.length })),
        zones: plan.biomeZones.map((zone) => ({ id: zone.id, name: zone.name, biome: zone.biome, layers: { ...zone.layers } })),
        activeZoneId: this.missionLevelVisualState?.activeZoneId || null,
        events: this.missionLevelEvents ? [...this.missionLevelEvents.values()].map((event) => ({ id: event.id, triggered: event.triggered, triggerCount: event.triggerCount })) : [],
        spawns: this.missionLevelSpawns ? [...this.missionLevelSpawns.values()].map((spawn) => ({ id: spawn.id, active: spawn.active, count: spawn.count })) : [],
        artLayers: MISSION_LEVEL_LAYER_FILES_V52[plan.templateId] || null,
        telemetry: this.missionLevelTelemetry ? { ...this.missionLevelTelemetry } : null
      };
    }

    getSnapshot() {
      return { ...super.getSnapshot(), missionLevelRuntime: this.getMissionLevelSnapshot() };
    }
  };
}
