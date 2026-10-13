import { buildVerticalMissionV130, verticalElevationV130 } from './vertical-levels-v130.js';
import { sweepProjectileAabbV83 } from './projectile-collision-v83.js';
import { computeMissionLayerCoverCropV62, MISSION_LEVEL_ZONE_LAYER_FILES_V58 } from './game-v52-level-runtime.js';

const list = value => Array.isArray(value) ? value : [];
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const imageReady = image => Boolean(image?.complete && (image.naturalWidth || image.width) > 0);
const overlapsX = (a, b) => a.x + a.w > b.x + 0.01 && a.x < b.x + b.w - 0.01;
const activeActor = actor => Boolean(actor && (actor.alive || actor.downed) && !actor.dormant && !actor.inVehicle && !actor.ventTransit);
const EPSILON = 0.001;
export const VERTICAL_CAMERA_HEADROOM_V130 = 200;
const planRole = templateId => templateId === 'colony-multiroute' ? 'security-shutter' : 'ship-bulkhead';

export function verticalLayerOffsetV130(cameraY, factor, worldHeight = 1100) {
  const minimum = -VERTICAL_CAMERA_HEADROOM_V130;
  const maximum = Math.max(0, worldHeight - 720);
  const travel = Math.max(1, maximum - minimum);
  const position = clamp(cameraY, minimum, maximum) - minimum;
  const kind = factor < 0.2 ? 'far' : factor < 0.8 ? 'mid' : 'foreground';
  const response = { far: 0.16, mid: 0.46, foreground: 0.72 }[kind];
  return { kind, progress: position / travel, y: -position * response, response };
}

function splitDecksForShafts(platforms, shafts) {
  let output = platforms;
  for (const shaft of shafts) {
    const top = shaft.stops[0].y, bottom = shaft.stops.at(-1).y;
    output = output.flatMap(platform => {
      if (platform.kind === 'lift' || platform.y < top - 1 || platform.y > bottom + 1 || !overlapsX(platform, shaft)) return [platform];
      const pieces = [];
      if (platform.x < shaft.x) pieces.push({ ...platform, w: shaft.x - platform.x });
      if (platform.x + platform.w > shaft.x + shaft.w) pieces.push({ ...platform,
        id: pieces.length ? `${platform.id}:right:${shaft.id}` : platform.id,
        x: shaft.x + shaft.w, w: platform.x + platform.w - shaft.x - shaft.w });
      return pieces.filter(piece => piece.w > 4);
    });
  }
  return output;
}

export function withVerticalWorldV130(BaseEngine) {
  return class VerticalWorldV130 extends BaseEngine {
    start(options = {}) {
      this.verticalOptionsV130 = options;
      this.verticalPlanV130 = options.missionLevel ? buildVerticalMissionV130(options.missionLevel, options) : null;
      this.verticalRuntimeV130 = null;
      this.rearEntrancesV130 = [];
      const result = super.start({ ...options, missionLevel: this.verticalPlanV130 || options.missionLevel });
      return { ...result, verticalWorldV130: this.getVerticalWorldSnapshotV130() };
    }

    applyMissionLevelV52(plan) {
      const prepared = buildVerticalMissionV130(plan, this.verticalOptionsV130 || {});
      this.verticalPlanV130 = prepared;
      this.verticalRuntimeV130 = prepared.verticalWorldV130?.schema === 130
        ? { schema: 130, profileId: prepared.verticalWorldV130.profileId, calls: 0, arrivals: 0, blocks: 0, carried: 0 } : null;
      this.rearEntrancesV130 = list(prepared.rearEntrancesV130);
      return super.applyMissionLevelV52(prepared);
    }

    initializeMissionVentRuntimeV62(plan) {
      const result = super.initializeMissionVentRuntimeV62(plan);
      const profile = plan.verticalWorldV130?.originalProfile;
      if (!profile || !result) return result;
      const originals = plan.verticalWorldV130.originalPlatforms;
      const portal = entry => {
        const position = entry.worldPosition;
        const support = originals.filter(surface => position.x >= surface.x && position.x <= surface.x + surface.w)
          .sort((a, b) => Math.abs(a.y - position.y) - Math.abs(b.y - position.y))[0];
        const floorY = support ? verticalElevationV130(profile, support.y)
          : clamp(verticalElevationV130(profile, position.y), 120, plan.dimensions.height - 120);
        return { ...entry, worldPosition: { ...position, y: floorY } };
      };
      this.missionVentNetworkV62 = { ...result,
        nodes: result.nodes.map(node => ({ ...node, position: { ...node.position,
          y: clamp(verticalElevationV130(profile, node.position.y), 80, plan.dimensions.height - 80) } })),
        entrances: result.entrances.map(portal), exits: result.exits.map(portal) };
      return this.missionVentNetworkV62;
    }

    compileMissionLevelGeometry(plan) {
      const result = super.compileMissionLevelGeometry(plan);
      if (!plan.verticalWorldV130 || !this.verticalRuntimeV130) return result;
      const shafts = plan.verticalWorldV130.shafts;
      // Remove the old oscillating platform. The shaft opening is real collision
      // geometry, while each lateral landing remains an ordinary solid deck.
      this.platforms = splitDecksForShafts(this.platforms.filter(platform => platform.kind !== 'lift'), shafts);
      this.lifts = shafts.map(shaft => ({ ...shaft, kind: 'lift', controlledV130: true,
        y: shaft.stops.at(-1).y, previousY: shaft.stops.at(-1).y, baseY: shaft.stops.at(-1).y,
        topY: shaft.stops[0].y, h: 24, art: 'drop', speedV130: 142, directionV130: -1,
        targetYV130: shaft.stops.at(-1).y, stateV130: 'idle', dwellV130: 0, blockedByV130: null,
        fromNodeId: shaft.stops.at(-1).id, toNodeId: shaft.stops[0].id }));
      this.platforms.push(...this.lifts);
      for (const shaft of shafts) {
        for (const ladder of this.ladders) {
          if (ladder.x >= shaft.x - 10 && ladder.x <= shaft.x + shaft.w + 10
            && ladder.top >= shaft.stops[0].y - 1 && ladder.bottom <= shaft.stops.at(-1).y + 1) ladder.x = shaft.x - 36;
        }
        // Always expose a continuous alternative, including the colony habitat
        // tower, whose graph originally had only horizontal joins at this x.
        this.ladders.push(...shaft.stops.slice(0, -1).map((stop, index) => ({
          id: `${shaft.id}:service-ladder:${index}`, x: shaft.x - 36, w: 42, kind: 'ladder',
          top: stop.y, bottom: shaft.stops[index + 1].y, fromNodeId: stop.id, toNodeId: shaft.stops[index + 1].id
        })));
        for (const stop of shaft.stops) {
          for (const [side, x] of [['left', shaft.x - 150], ['right', shaft.x + shaft.w]]) {
            this.platforms.push({ id: `${shaft.id}:${stop.id}:${side}`, x, y: stop.y, w: 150, h: 22,
              kind: 'lift-approach', art: 'catwalk', zoneId: stop.zoneId, nodeId: stop.id, floor: false });
          }
        }
      }
      return result;
    }

    verticalActorsV130() {
      const operators = [this.player, this.coopEnabled ? this.coop : null].filter(actor => actor
        && !actor.inVehicle && !actor.ventTransit && !actor.dormant);
      const others = [...list(this.squadActors), ...list(this.enemies)].filter(actor => activeActor(actor)
        || actor && !actor.dormant && !actor.ventTransit && !actor.inVehicle && actor.deathClock > 0);
      return [...operators, ...others];
    }

    liftAtActorV130(actor, panel = true) {
      if (!this.verticalRuntimeV130 || !activeActor(actor)) return null;
      const center = actor.x + actor.w / 2, feet = actor.y + actor.h;
      return this.lifts.filter(lift => lift.controlledV130
        && center >= lift.x - (panel ? 90 : 0) && center <= lift.x + lift.w + (panel ? 90 : 0)
        && (Math.abs(feet - lift.y) < 9 || panel && lift.stops.some(stop => Math.abs(stop.y - feet) < 12)))
        .sort((a, b) => Math.abs(center - a.x - a.w / 2) - Math.abs(center - b.x - b.w / 2))[0] || null;
    }

    requestLiftV130(lift, destinationY, source = 'operator') {
      if (!lift?.controlledV130 || !Number.isFinite(destinationY) || lift.stateV130 === 'moving'
        || lift.dwellV130 > 0 || this.paused || this.mission?.state !== 'active') return false;
      const stop = lift.stops.find(candidate => Math.abs(candidate.y - destinationY) < 1);
      if (!stop || Math.abs(lift.y - stop.y) < 1) return false;
      lift.targetYV130 = stop.y; lift.stateV130 = 'moving'; lift.blockedByV130 = null;
      this.verticalRuntimeV130.calls++;
      this.onEvent?.({ type: 'lift-called-v130', liftId: lift.id, stopId: stop.id, source });
      return true;
    }

    commandLiftV130(actor, intent = 0) {
      if (!activeActor(actor) || actor.downed || actor.climbing || this.keys?.has?.(actor.coop ? 'ShiftRight' : 'ShiftLeft')
        || actor.reloading || actor.meleeClock > 0 || actor.toolUseClock > 0 || actor.interactionClock > 0
        || this.isFieldActionBusyV124?.(actor) || this.isPlaceableBusyV86?.(actor)
        || this.canPerformGameplayAction && !this.canPerformGameplayAction(actor)
        || this.paused || !this.running || this.enemyAtlasLoadingPausedV65 || this.userCasteLoadingV88
        || this.mission?.state !== 'active') return false;
      const lift = this.liftAtActorV130(actor);
      if (!lift || lift.stateV130 === 'moving' || lift.dwellV130 > 0) return false;
      const feet = actor.y + actor.h;
      if (Math.abs(feet - lift.y) > 9) {
        const stop = lift.stops.find(candidate => Math.abs(candidate.y - feet) < 12);
        return stop ? this.requestLiftV130(lift, stop.y, actor.coop ? 'coop-call' : 'player-call') : false;
      }
      let direction = intent || lift.directionV130;
      let candidates = lift.stops.filter(stop => direction < 0 ? stop.y < lift.y - 1 : stop.y > lift.y + 1);
      if (!candidates.length && !intent) {
        direction *= -1;
        candidates = lift.stops.filter(stop => direction < 0 ? stop.y < lift.y - 1 : stop.y > lift.y + 1);
      }
      const destination = candidates.sort((a, b) => Math.abs(a.y - lift.y) - Math.abs(b.y - lift.y))[0];
      if (!destination) return false;
      lift.directionV130 = direction;
      return this.requestLiftV130(lift, destination.y, actor.coop ? 'coop' : 'player');
    }

    interact(actor = this.player) {
      if (this.commandLiftV130(actor)) { this.audio?.ui?.(); return true; }
      return super.interact(actor);
    }

    updatePlayer(actor, delta, controls) {
      if (this.verticalRuntimeV130 && actor) {
        const locked = this.keys?.has?.(actor.coop ? 'ShiftRight' : 'ShiftLeft');
        const held = code => this.keys?.has?.(code);
        const up = !locked && (held(controls.up) || !actor.coop && held('ArrowUp'));
        const down = !locked && (held(controls.down) || !actor.coop && held('ArrowDown'));
        const intent = Number(Boolean(down)) - Number(Boolean(up));
        if (intent && intent !== actor.liftIntentV130) this.commandLiftV130(actor, intent);
        actor.liftIntentV130 = intent;
      }
      return super.updatePlayer(actor, delta, controls);
    }

    updateLifts(delta) {
      if (!this.verticalRuntimeV130) return super.updateLifts(delta);
      if (this.paused || !this.running || this.enemyAtlasLoadingPausedV65 || this.userCasteLoadingV88
        || this.mission?.state !== 'active' || !Number.isFinite(delta) || delta <= 0) return;
      for (const lift of this.lifts) {
        if (!lift.controlledV130) continue;
        lift.previousY = lift.y;
        lift.dwellV130 = Math.max(0, lift.dwellV130 - delta);
        if (lift.stateV130 !== 'moving' && lift.stateV130 !== 'blocked') continue;
        const actors = this.verticalActorsV130();
        const riders = actors.filter(actor => overlapsX(actor, lift)
          && Math.abs(actor.y + actor.h - lift.y) < 8 && !actor.climbing && (Number(actor.vy) || 0) >= 0);
        const requested = Math.sign(lift.targetYV130 - lift.y) * Math.min(Math.abs(lift.targetYV130 - lift.y), lift.speedV130 * delta);
        const obstacles = [...list(this.walls).filter(wall => !wall.destroyed), ...(this.closedDoorColliders?.() || []),
          ...this.platforms.filter(platform => platform !== lift && !platform.controlledV130)];
        let amount = requested, blocker = null;
        for (const body of [lift, ...riders]) {
          for (const obstacle of obstacles) {
            const hit = sweepProjectileAabbV83(body, { x: 0, y: requested }, obstacle);
            if (hit && Math.abs(requested * hit.t) < Math.abs(amount)) { amount = requested * hit.t; blocker = obstacle.id || 'structure'; }
          }
        }
        // A moving platform stops before reaching a person below it instead of
        // forcing that person through a deck or a closed door.
        for (const actor of actors.filter(candidate => !riders.includes(candidate))) {
          const hit = sweepProjectileAabbV83(lift, { x: 0, y: requested }, actor);
          if (hit && Math.abs(requested * hit.t) < Math.abs(amount)) { amount = requested * hit.t; blocker = actor.id || 'actor'; }
        }
        lift.y += amount;
        for (const actor of riders) {
          actor.y += amount; actor.vy = 0; actor.grounded = true; actor.groundY = lift.y;
          if (actor.levelNavigation) { actor.levelNavigation.surfaceId = lift.id;
            actor.levelNavigation.lastSafeY = actor.y; actor.levelNavigation.lastSafeX = actor.x; }
        }
        this.verticalRuntimeV130.carried += riders.length * Math.abs(amount);
        if (blocker) {
          if (lift.stateV130 !== 'blocked' || lift.blockedByV130 !== blocker) {
            this.verticalRuntimeV130.blocks++;
            this.onEvent?.({ type: 'lift-blocked-v130', liftId: lift.id, obstacleId: blocker });
          }
          lift.stateV130 = 'blocked'; lift.blockedByV130 = blocker;
        } else {
          lift.stateV130 = 'moving'; lift.blockedByV130 = null;
          if (Math.abs(lift.y - lift.targetYV130) < EPSILON) {
            lift.y = lift.targetYV130; lift.stateV130 = 'idle'; lift.dwellV130 = 0.35;
            this.verticalRuntimeV130.arrivals++;
            this.onEvent?.({ type: 'lift-arrived-v130', liftId: lift.id, floorY: lift.y });
          }
        }
      }
    }

    missionLevelConnectorFromSurface(surfaceY, targetY, enemy, target) {
      const original = super.missionLevelConnectorFromSurface(surfaceY, targetY, enemy, target);
      if (!this.verticalRuntimeV130) return original;
      const gap = Math.abs(surfaceY - targetY), center = enemy.x + enemy.w / 2;
      const alternatives = this.lifts.filter(lift => lift.controlledV130 && enemy.w <= lift.w - 8)
        .flatMap(lift => lift.stops.filter(stop => Math.abs(stop.y - surfaceY) <= 18).flatMap(entry =>
          lift.stops.filter(stop => Math.abs(stop.y - targetY) + 18 < gap).map(destination => ({
            connector: { ...lift, connectorKind: 'lift', centerX: lift.x + lift.w / 2 },
            entryY: entry.y, destinationY: destination.y
          }))));
      const score = route => Math.abs(route.connector.centerX - center) * 0.52 + Math.abs(route.destinationY - targetY) * 3;
      return [...alternatives, ...(original ? [original] : [])].sort((a, b) => score(a) - score(b))[0] || null;
    }

    advanceEnemyMissionNavigation(enemy, target, surface, targetSurface, delta) {
      if (this.verticalRuntimeV130 && enemy?.levelNavigation?.mode === 'lift') {
        const navigation = enemy.levelNavigation;
        const lift = this.lifts.find(candidate => candidate.id === navigation.connectorId && candidate.controlledV130);
        if (lift) {
          if (navigation.riding && Math.abs(lift.y - navigation.destinationY) <= 1 && lift.stateV130 === 'idle') {
            // The destination is an open shaft, so a rider must physically walk
            // to a lateral landing. Snapping to a deck at the shaft centre would
            // either strand it forever or silently teleport it over the gap.
            const side = target && target.x + target.w / 2 < lift.x + lift.w / 2 ? -1 : 1;
            const exitX = side < 0 ? lift.x - enemy.w - 12 : lift.x + lift.w + 12;
            enemy.attacking = false;
            this.moveEnemyOnMissionSurface(enemy, exitX, delta, 0.9);
            const landing = this.missionLevelSurfaceFor(enemy, { tolerance: 2, includeLifts: false });
            if (landing) {
              navigation.surfaceId = landing.id; navigation.mode = 'surface'; navigation.connectorId = null;
              navigation.destinationY = null; navigation.riding = false;
            }
            return true;
          }
          const entryY = enemy.y + enemy.h;
          this.requestLiftV130(lift, navigation.riding ? navigation.destinationY : surface?.y, 'enemy');
          if (!navigation.riding && (Math.abs(lift.y - entryY) > 1 || lift.stateV130 !== 'idle')) {
            const waitingX = enemy.x + enemy.w / 2 < lift.x + lift.w / 2
              ? lift.x - enemy.w - 6 : lift.x + lift.w + 6;
            enemy.attacking = false;
            this.moveEnemyOnMissionSurface(enemy, waitingX, delta, 0.9);
            return true;
          }
        }
      }
      return super.advanceEnemyMissionNavigation(enemy, target, surface, targetSurface, delta);
    }

    update(delta) {
      const beforeY = this.camera?.y || 0;
      const frozen = !this.running || this.paused || this.enemyAtlasLoadingPausedV65 || this.userCasteLoadingV88;
      const result = super.update(delta);
      if (!this.verticalRuntimeV130) return result;
      if (frozen || this.mission?.state !== 'active') {
        // Inner V52 camera clamps start at zero. Preserve the full framing when
        // simulation is frozen, including an operator on the uppermost deck.
        this.camera.y = beforeY;
        return result;
      }
      const focus = this.player.alive ? this.player : this.coopEnabled && this.coop?.alive ? this.coop : this.player;
      const target = clamp(focus.y + focus.h * 0.5 - 360 + (focus.vy || 0) * 0.07,
        -VERTICAL_CAMERA_HEADROOM_V130, Math.max(0, this.missionLevelBounds.height - 720));
      this.camera.y = beforeY + (target - beforeY) * -Math.expm1(-Math.max(0, delta) * 4.4);
      return result;
    }

    drawMissionLevelCover(ctx, image, factor, alpha, overscan, yOffset, options = {}) {
      if (!this.verticalRuntimeV130 || !imageReady(image)) return super.drawMissionLevelCover(ctx, image, factor, alpha, overscan, yOffset, options);
      const offset = verticalLayerOffsetV130(this.camera.y, factor, this.missionLevelBounds.height);
      const extra = (Math.max(0, this.missionLevelBounds.height - 720) + VERTICAL_CAMERA_HEADROOM_V130) * offset.response;
      const height = 720 * Math.max(1, overscan) + extra;
      const crop = image.missionCoverContractV62 ? computeMissionLayerCoverCropV62(image, image.missionCoverContractV62.targetAspect) : null;
      const aspect = crop?.targetAspect || (image.naturalWidth || image.width) / (image.naturalHeight || image.height);
      const width = height * aspect, y = Math.min(0, offset.y + yOffset - (720 * Math.max(1, overscan) - 720) / 2);
      const draw = x => crop ? ctx.drawImage(image, crop.sourceX, crop.sourceY, crop.sourceWidth, crop.sourceHeight, x, y, width, height)
        : ctx.drawImage(image, x, y, width, height);
      ctx.save(); ctx.globalAlpha = offset.kind === 'foreground' ? Math.min(0.14, alpha) : alpha;
      if (options.repeat === false) {
        const zone = list(this.missionLevelRuntime.biomeZones).find(candidate => candidate.id === options.zoneId);
        const progress = zone ? clamp((this.player.x + this.player.w / 2 - zone.x) / Math.max(1, zone.w), 0, 1) : 0.5;
        draw(-Math.max(0, width - 1280) * progress);
      } else {
        const xOffset = -(this.camera.x * factor % width);
        for (let x = xOffset - width; x < 1280; x += width) draw(x);
      }
      ctx.restore();
    }

    drawForeground(ctx) {
      if (!this.verticalRuntimeV130) return super.drawForeground(ctx);
      const visual = this.missionLevelVisualState, current = this.missionLevelLayerImage('foreground');
      const blend = clamp(Number(visual.zoneBlend) || 0, 0, 1);
      const previous = blend < 1 && visual.previousZoneId ? this.missionLevelLayerImage('foreground', visual.previousZoneId) : null;
      const dedicated = zoneId => Boolean(MISSION_LEVEL_ZONE_LAYER_FILES_V58[this.missionLevelRuntime.templateId]?.[zoneId]?.foreground);
      if (imageReady(previous) && previous !== current) this.drawMissionLevelCover(ctx, previous, 1.12, 0.14 * (1 - blend), 1, 0,
        { repeat: !dedicated(visual.previousZoneId), zoneId: visual.previousZoneId });
      if (imageReady(current)) this.drawMissionLevelCover(ctx, current, 1.12, previous && previous !== current ? 0.14 * blend : 0.14, 1, 0,
        { repeat: !dedicated(visual.activeZoneId), zoneId: visual.activeZoneId });
      this.drawHazardForegroundOverlays(ctx);
      this.drawForegroundPipes(ctx);
    }

    drawForegroundPipes(ctx) {
      if (!this.verticalRuntimeV130) return super.drawForegroundPipes(ctx);
      const offset = verticalLayerOffsetV130(this.camera.y, 1.18, this.missionLevelBounds.height);
      return this.drawRepeatedMissionProp(ctx, 'foregroundPipes', {
        height: 205, y: 720 - 190 + offset.y * 0.2, factor: 1.18, alpha: 0.12, gap: 112
      });
    }

    drawWorld(ctx) {
      if (this.verticalRuntimeV130) {
        ctx.save();
        for (const entrance of this.rearEntrancesV130) {
          const open = list(this.enemies).some(enemy => enemy.rearEntryV130?.entranceId === entrance.id
            && ['warning', 'approach', 'active'].includes(enemy.rearEntryV130.phase));
          const art = this.getDoorRenderState?.({ ...entrance, visualRole: planRole(this.missionLevelRuntime?.templateId),
            open, progress: open ? 1 : 0 }, { open });
          if (imageReady(art?.image)) {
            const crop = art.source;
            ctx.drawImage(art.image, crop.x, crop.y, crop.w, crop.h, entrance.x, entrance.y, entrance.w, entrance.h);
          }
          ctx.strokeStyle = '#476777'; ctx.lineWidth = 3; ctx.strokeRect(entrance.x, entrance.y, entrance.w, entrance.h);
          ctx.fillStyle = '#76aaab'; ctx.fillRect(entrance.x + 7, entrance.y + 7, entrance.w - 14, 3);
        }
        for (const lift of this.lifts.filter(candidate => candidate.controlledV130)) {
          ctx.strokeStyle = '#34505a'; ctx.lineWidth = 3;
          for (const x of [lift.x + 3, lift.x + lift.w - 3]) {
            ctx.beginPath(); ctx.moveTo(x, lift.topY - 115); ctx.lineTo(x, lift.baseY + 24); ctx.stroke();
          }
          ctx.font = '12px monospace'; ctx.textAlign = 'left';
          for (const stop of lift.stops) {
            ctx.fillStyle = '#14282c'; ctx.fillRect(lift.x - 32, stop.y - 58, 25, 48);
            ctx.fillStyle = lift.stateV130 === 'blocked' ? '#e5ac67' : '#92d3ba';
            ctx.fillText('E', lift.x - 24, stop.y - 36);
            ctx.fillText('↑↓', lift.x - 30, stop.y - 18);
          }
        }
        ctx.restore();
        this.drawRearEntranceLayerV130?.(ctx);
      }
      return super.drawWorld(ctx);
    }

    captureResumeState() {
      const result = super.captureResumeState();
      if (!this.verticalRuntimeV130) return result;
      return { ...result, verticalWorldV130: { schema: 130, profileId: this.verticalRuntimeV130.profileId,
        signature: this.missionLevelRuntime.signature, lifts: this.lifts.filter(lift => lift.controlledV130).map(lift => ({
          id: lift.id, y: lift.y, targetY: lift.targetYV130, direction: lift.directionV130, dwell: lift.dwellV130
        })) } };
    }

    migrateVerticalResumeV130(raw) {
      const profile = this.verticalPlanV130?.verticalWorldV130?.originalProfile;
      if (!profile || raw?.verticalWorldV130 || raw?.verticalMigrationV130
        || raw?.missionLevel?.signature !== this.verticalPlanV130.signature) return raw;
      const originalPlatforms = this.verticalPlanV130.verticalWorldV130.originalPlatforms;
      const move = (entry, h, w = 42) => {
        if (!entry || !Number.isFinite(entry.y) || !Number.isFinite(entry.x)) return entry;
        const feet = entry.y + h;
        const below = originalPlatforms.filter(platform => entry.x + w > platform.x && entry.x < platform.x + platform.w
          && platform.y >= feet - 12).sort((a, b) => a.y - b.y)[0];
        const oldFloor = below?.y ?? profile.elevations.map(([elevation]) => elevation)
          .sort((a, b) => Math.abs(a - feet) - Math.abs(b - feet))[0];
        // Keep jump height, suspended pickups and body dimensions in pixels.
        // Only their supporting deck moves to the new authored elevation.
        return { ...entry, y: clamp(entry.y + verticalElevationV130(profile, oldFloor) - oldFloor, 0, 1080) };
      };
      const enemies = new Map(list(this.enemies).map(enemy => [enemy.id, enemy]));
      return { ...raw, verticalMigrationV130: { schema: 130, signature: this.verticalPlanV130.signature },
        player: move(raw.player, this.player?.h || 92, this.player?.w),
        coop: move(raw.coop, this.coop?.h || 92, this.coop?.w),
        checkpoint: move(raw.checkpoint, this.player?.h || 92, this.player?.w),
        enemies: list(raw.enemies).map(enemy => move(enemy, enemies.get(enemy.id)?.h || 92, enemies.get(enemy.id)?.w)),
        drops: list(raw.drops).map(drop => move(drop, 0, drop.w || 32)),
        vehicle: move(raw.vehicle, this.vehicle?.h || 104, this.vehicle?.w || 220),
        gameplaySupportV72: raw.gameplaySupportV72 ? { ...raw.gameplaySupportV72,
          deployments: list(raw.gameplaySupportV72.deployments).map(deployment => move(deployment, deployment.h || 0, deployment.w || 32)) } : raw.gameplaySupportV72,
        missionLevel: { ...raw.missionLevel, timers: list(raw.missionLevel.timers).map(timer => ({ ...timer,
          holdTarget: move(timer.holdTarget, timer.holdTarget?.h || 0, timer.holdTarget?.w || 0) })) } };
    }

    applyResumeState(raw) {
      const previous = this.lifts?.filter(lift => lift.controlledV130).map(lift => ({ lift, y: lift.y, target: lift.targetYV130,
        direction: lift.directionV130, dwell: lift.dwellV130, state: lift.stateV130 })) || [];
      const saved = raw?.verticalWorldV130;
      if (this.verticalRuntimeV130 && saved?.schema === 130 && saved.profileId === this.verticalRuntimeV130.profileId
        && saved.signature === this.missionLevelRuntime?.signature) {
        for (const lift of this.lifts) {
          const state = list(saved.lifts).find(candidate => candidate.id === lift.id);
          if (!state || !Number.isFinite(state.y) || state.y < lift.topY || state.y > lift.baseY
            || !lift.stops.some(stop => stop.y === state.targetY)) continue;
          lift.y = lift.previousY = state.y; lift.targetYV130 = state.targetY;
          lift.directionV130 = state.direction < 0 ? -1 : 1; lift.dwellV130 = clamp(Number(state.dwell) || 0, 0, 0.35);
          lift.stateV130 = Math.abs(lift.y - lift.targetYV130) > EPSILON ? 'moving' : 'idle';
        }
      }
      // Pre-V130 saves retain their floor and offset above it; health, resources,
      // objective flags and identity continue through the production validator.
      const source = this.migrateVerticalResumeV130(raw);
      const result = super.applyResumeState(source);
      if (!result?.applied) for (const state of previous) {
        state.lift.y = state.lift.previousY = state.y; state.lift.targetYV130 = state.target;
        state.lift.directionV130 = state.direction; state.lift.dwellV130 = state.dwell; state.lift.stateV130 = state.state;
      }
      return result;
    }

    getVerticalWorldSnapshotV130() {
      if (!this.verticalRuntimeV130) return { schema: 130, active: false };
      const plan = this.missionLevelRuntime, config = plan?.verticalWorldV130;
      const supports = object => Boolean(object && this.platforms.some(surface => overlapsX(object, surface)
        && Math.abs(object.y + object.h - surface.y) <= 2));
      const shaftsClear = this.lifts.every(lift => !this.platforms.some(surface => surface !== lift && !surface.controlledV130
        && surface.y >= lift.topY && surface.y <= lift.baseY && overlapsX(lift, surface)));
      const landings = this.lifts.every(lift => lift.stops.every(stop => this.platforms.some(surface => !surface.controlledV130
        && Math.abs(surface.y - stop.y) < 1 && surface.x + surface.w >= lift.x - 40 && surface.x < lift.x)));
      return { schema: 130, active: true, profileId: config.profileId, elevations: [...config.elevations],
        verticalSpan: Math.max(...config.elevations) - Math.min(...config.elevations),
        cameraY: this.camera.y, cameraMinY: -VERTICAL_CAMERA_HEADROOM_V130,
        cameraMaxY: Math.max(0, this.missionLevelBounds.height - 720),
        cameraTravel: Math.max(0, this.missionLevelBounds.height - 720) + VERTICAL_CAMERA_HEADROOM_V130,
        playerScreenTop: this.player.y - this.camera.y,
        parallax: [0.075, 0.32, 1.12].map(factor => verticalLayerOffsetV130(this.camera.y, factor, this.missionLevelBounds.height)),
        readiness: { shaftsClear, landings, extractionSupported: supports(this.objective),
          powerSupported: !this.powerNode || supports(this.powerNode), archiveSupported: !this.archiveTerminal || supports(this.archiveTerminal) },
        lifts: this.lifts.filter(lift => lift.controlledV130).map(lift => ({ id: lift.id, x: lift.x, y: lift.y,
          w: lift.w, topY: lift.topY, baseY: lift.baseY, stops: lift.stops.map(stop => ({ ...stop })),
          targetY: lift.targetYV130, state: lift.stateV130, blockedBy: lift.blockedByV130 })),
        rearEntrances: this.rearEntrancesV130.map(entrance => ({ ...entrance })), telemetry: { ...this.verticalRuntimeV130 } };
    }

    getSnapshot() {
      return { ...super.getSnapshot(), verticalWorldV130: this.getVerticalWorldSnapshotV130() };
    }
  };
}
