import { createXenoTrialsOutroV155, advanceXenoTrialsOutroV155, skipXenoTrialsOutroV155,
 getXenoTrialsSequenceCueV155, sampleXenoTrialsSequenceV155, skipXenoTrialsIntroV155,
 createXenoTrialsTerminalV156, createXenoTrialsTauntV156, advanceXenoTrialsTauntV156, getXenoTrialsSequenceCueV156 } from './xeno-trials-sequences-v155.js';
import { getXenoTrialsRigV154, getXenoTrialsRigCueV154, sampleXenoTrialsRigV154, drawXenoTrialsRigV154 } from './xeno-trials-rig-v154.js';
import { getXenoTrialsGrappleViewV153, drawXenoTrialsGrappleV153 } from './xeno-trials-grapple-v153.js';
import { drawXenoTrialsAcidV152 } from './xeno-trials-acid-pools-v152.js';
import { getXenoTrialsSuperV148, getXenoTrialsSuperReadinessV148 } from './xeno-trials-supers-v148.js';
import { getXenoTrialsAttackV147, getXenoTrialsSpecialStyleV147, getXenoTrialsSignatureV147 } from './xeno-trials-signatures-v147.js';
import { getXenoTrialsStageMotionV147, drawXenoTrialsStageMotionV147, getXenoTrialsStageCueV149 } from './xeno-trials-stage-motion-v147.js';
import { getXenoTrialsFighterV96, getXenoTrialsArtV96, XENO_TRIALS_STAGES_V96 } from './xeno-trials-data-v96.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, setXenoTrialsPausedV96,
  getXenoTrialsSnapshotV96, nextXenoTrialsRoundV96, releaseXenoTrialsControlsV150, XENO_TRIALS_ARENA_V96, XENO_TRIALS_ATTACKS_V96, XENO_TRIALS_STEP_V96 } from './xeno-trials-engine-v96.js';
import { createXenoPresentationV97, getXenoPresentationViewV97, advanceXenoPresentationV97 } from './xeno-trials-presentation-v97.js';
import { getXenoTrialsRenderMetricsV105, getXenoTrialsBodyBoundsV105 } from './xeno-trials-geometry-v105.js';
import { requestEnemyImportAnimationV107, drawEnemyImportAnimationV107,
  createEnemyImportMotionTrackerV107 } from './enemy-import-animation-v107.js';
import { requestEnemyImportAttackV109, drawEnemyImportAttackV109 } from './enemy-import-attacks-v109.js';
import { getXenoTrialsDisplayScaleV110, getXenoTrialsRenderMetricsV110, createXenoTrialsCameraV119 } from './xeno-trials-scale-v110.js';
import { drawXenoTrialsArenaLayersV119, drawXenoTrialsArenaOverlayV119 } from './xeno-trials-arena-layers-v119.js';
import { drawSynthConeV110 } from './synth-combat-v110.js';

const KEY_ACTION = Object.freeze({ ArrowLeft: 'left', KeyQ: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  ArrowUp: 'jump', KeyZ: 'jump', KeyW: 'jump', Space: 'jump', ArrowDown: 'guard', KeyS: 'guard', KeyJ: 'light', KeyK: 'heavy', KeyL: 'special', KeyI: 'super' });
const ACTIONS = new Set(Object.values(KEY_ACTION));
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

/** Historical API now returns physical world-space metrics, never camera zoom. */
export function getXenoTrialsRenderMetricsV96(id, variant = null) {
  return getXenoTrialsRenderMetricsV105(id, variant);
}

/** Local Canvas controller. Owns only listeners/RAF/images, never progression or saves.
 * start() waits for the two dedicated images and the optional selected backdrop.
 * Fighter asset failure pauses; backdrop failure keeps the procedural arena.
 * It never substitutes a different creature. stop() is idempotent and terminal. */
export function createXenoTrialsRuntimeV96(options = {}) {
  const canvas = options.canvas;
  if (!canvas || typeof canvas.getContext !== 'function') throw new Error('Xeno Trials requires a canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Xeno Trials requires a 2D context');
  const host = options.window || globalThis.window;
  const doc = options.document || canvas.ownerDocument || globalThis.document;
  const requestFrame = options.requestAnimationFrame || host?.requestAnimationFrame?.bind(host);
  const cancelFrame = options.cancelAnimationFrame || host?.cancelAnimationFrame?.bind(host);
  if (!requestFrame || !cancelFrame) throw new Error('Xeno Trials requires animation-frame scheduling');
  const match = createXenoTrialsMatchV96({ ...options.config, introSeconds: 0, holdRoundTransition: true });
  const displayScale = getXenoTrialsDisplayScaleV110(match.fighters);
  const camera = createXenoTrialsCameraV119(match.fighters);
  let cameraView = camera.getState(), frameDelta = 0;
  let presentation = createXenoPresentationV97(), outroV155 = null, terminalV156 = null, tauntV156 = null;
  const outroPlaying = () => outroV155?.phase === 'playing' || terminalV156?.phase === 'playing';
  const isPaused = () => match.paused || outroV155?.paused === true || terminalV156?.paused === true;
  const presentationView = () => getXenoPresentationViewV97(presentation);
  const reduceMotion = () => options.reducedMotion === true || host?.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true
    || doc?.documentElement?.classList?.contains?.('reduced-motion') === true;
  const rigDrawsV154 = new Map();
  const snapshot = () => ({ ...getXenoTrialsSnapshotV96(match), presentation: presentationView(),
    paused: isPaused(), outroV155: outroV155 ? JSON.parse(JSON.stringify(outroV155)) : null,
    terminalV156: terminalV156 ? JSON.parse(JSON.stringify(terminalV156)) : null,
    tauntV156: tauntV156 ? JSON.parse(JSON.stringify(tauntV156)) : null,
    canTauntV156: acceptsControls() && tauntV156?.phase !== 'playing' && Boolean(createXenoTrialsTauntV156(match,presentationView(),controls(),reduceMotion())),
    rigViewsV154: JSON.parse(JSON.stringify([...rigDrawsV154].map(([side,view])=>({side,...view})))),
    grappleViewV153: getXenoTrialsGrappleViewV153(match),
    cameraV119: { zoom: cameraView.zoom, center: cameraView.center, pixelsPerMeter: cameraView.pixelsPerMeter },
    supersV148: match.fighters.map(fighter => ({ side: fighter.side, ...getXenoTrialsSuperReadinessV148({ ...match, presentation: presentationView() }, fighter, getXenoTrialsFighterV96(fighter.id)) })),
    stageAnimationV147: getXenoTrialsStageMotionV147(stage.id, match.tick, reduceMotion()),
    stageCueV149: getXenoTrialsStageCueV149(stage.id, { ...match, presentation: presentationView() }, reduceMotion()),
    combatSignaturesV147: match.fighters.map(fighter => {
      const signature = getXenoTrialsSignatureV147(getXenoTrialsFighterV96(fighter.id));
      return { side: fighter.side, id: signature?.id || null, canonExact: false, animation: signature?.animation || null };
    }),
    stageVisual: !stage.backdrop ? 'procedural' : images.has(stage.backdrop) ? 'backdrop-ready' : loaded ? 'procedural-fallback' : 'loading' });
  const images = new Map(), buttonKeys = new Map(), heldKeys = new Set(), blockedKeys = new Set(), heldPointers = new Map(), pendingLoads = new Set(), virtual = {}, listeners = [];
  const observedMovement = createEnemyImportMotionTrackerV107();
  let running = false, stopped = false, loaded = false, loading = null, raf = null, previousTime = null, exited = false;
  const pointerOwners = new Map();
  const windowAvailable = () => doc?.hidden !== true && doc?.hasFocus?.() !== false;
  const acceptsControls = () => running && loaded && !stopped && !assetFailure && !match.paused
    && match.phase === 'active' && windowAvailable() && !presentationView().blocksSimulation;
  let emittedResult = false, notifyElapsed = 0, lastStatus = '', assetFailure = false;
  const originalSize = { width: canvas.width, height: canvas.height };
  const stage = XENO_TRIALS_STAGES_V96.find(s => s.id === match.config.stageId);
  canvas.width = XENO_TRIALS_ARENA_V96.width; canvas.height = XENO_TRIALS_ARENA_V96.height;
  canvas.setAttribute?.('data-xeno-display-scale-v110', String(displayScale));
  canvas.tabIndex = 0; canvas.setAttribute?.('aria-label', 'Xeno Trials : duel 2D. Flèches pour se déplacer, J K L pour attaquer, I pour le super chargé, S pour la garde, T pour un défi de présentation, P pour la pause.');

  function listen(target, type, handler, settings) {
    if (!target?.addEventListener) return;
    target.addEventListener(type, handler, settings); listeners.push(() => target.removeEventListener(type, handler, settings));
  }
  function clearInputs() {
    heldKeys.clear(); buttonKeys.clear(); heldPointers.clear(); for (const key of ACTIONS) virtual[key] = false;
    releaseXenoTrialsControlsV150(match, 'player', controls());
    const captures = [...pointerOwners]; pointerOwners.clear();
    for (const [id, button] of captures) { try { button.releasePointerCapture?.(id); } catch {} }
  }
  function controls() {
    const result = { ...virtual };
    for (const key of heldKeys) result[KEY_ACTION[key]] = true;
    for (const action of heldPointers.values()) result[action] = true;
    for (const action of buttonKeys.values()) result[action] = true;
    return result;
  }
  function statusText() {
    if (assetFailure) return 'Combat suspendu : visuel dédié indisponible. Rechargez pour réessayer.';
    if (isPaused()) return 'Simulation en pause. Reprendre avec P ou le bouton Reprendre.';
    if (terminalV156?.phase === 'playing') return terminalV156.kind==='draw' ? 'Égalité : récupération des spécimens.' : 'Fin de présentation : retour à la vigilance.';
    if (presentationView().fighterSlot !== null) return `Présentation : ${getXenoTrialsFighterV96(match.fighters[presentationView().fighterSlot].id).label}`;
    if (presentationView().countdown) return `Manche ${match.round} : ${presentationView().countdown}`;
    if (match.phase === 'intro') return `Manche ${match.round} : préparez-vous.`;
    if (match.phase === 'round-over') return `Manche ${match.round} : ${match.roundWinner === 'draw' ? 'égalité' : match.roundWinner === 'player' ? 'victoire' : 'défaite'}. Manche suivante en préparation.`;
    if (match.phase === 'match-over') return match.result.winner === 'player' ? 'Simulation terminée : victoire.' : match.result.winner === 'opponent' ? 'Simulation terminée : défaite.' : 'Simulation terminée : égalité.';
    return `Manche ${match.round}, ${Math.ceil(match.timeRemaining)} secondes. Santé ${Math.ceil(match.fighters[0].hp)} contre ${Math.ceil(match.fighters[1].hp)}.`;
  }
  function notify(force = false) {
    if (stopped || !force && notifyElapsed < .12) return;
    notifyElapsed = 0;
    const status = statusText();
    if (options.statusElement && status !== lastStatus) options.statusElement.textContent = status;
    lastStatus = status;
    options.onState?.(snapshot());
    if (!stopped && match.result && !emittedResult) { emittedResult = true; options.onResult?.({ ...match.result, wins: { ...match.result.wins }, playerStats: { ...match.result.playerStats }, opponentStats: { ...match.result.opponentStats } }); }
  }
  function text(content, x, y, size = 16, color = '#d7e9ed', align = 'left', maxWidth = null) {
    const weight = size >= 22 ? 'bold ' : '';
    context.font = `${weight}${size}px monospace`;
    if (maxWidth) {
      const measured = context.measureText(content)?.width;
      if (Number.isFinite(measured) && measured > maxWidth) {
        context.font = `${weight}${Math.max(12, Math.floor(size * maxWidth / measured))}px monospace`;
        let shortened = content;
        while (shortened.length > 1 && context.measureText(shortened + '…').width > maxWidth) shortened = shortened.slice(0, -1);
        if (shortened !== content) content = shortened + '…';
      }
    }
    context.fillStyle = color; context.textAlign = align; context.fillText(content, x, y);
  }
  function bar(x, y, width, ratio, color, reverse = false) {
    context.fillStyle = '#090f14'; context.fillRect(x, y, width, 15);
    context.fillStyle = color; const filled = width * clamp(ratio, 0, 1); context.fillRect(reverse ? x + width - filled : x, y, filled, 15);
    context.strokeStyle = '#53606a'; context.strokeRect(x, y, width, 15);
  }
  function drawArena() {
    drawXenoTrialsArenaLayersV119(context, stage, images, cameraView, match.tick);
    drawXenoTrialsStageMotionV147(context, stage, cameraView, match.tick, reduceMotion(), { ...match, presentation: presentationView() });
  }
  function drawFighter(fighter) {
    const definition = getXenoTrialsFighterV96(fighter.id), art = getXenoTrialsArtV96(fighter.id, fighter.variant);
    const image = images.get(art.path), ground = 450 - fighter.y;
    const body = getXenoTrialsBodyBoundsV105(fighter);
    context.fillStyle = '#0008'; context.beginPath(); context.ellipse(body.center, 454, body.width * .68, 11, 0, 0, Math.PI * 2); context.fill();
    if (!image) { text('Visuel indisponible', fighter.x, ground - 90, 12, '#f0b6ac', 'center'); return; }
    const { width, height, pivotX, bottom, sourceFacing } = getXenoTrialsRenderMetricsV110(fighter.id, fighter.variant, displayScale);
    const timeSeconds = match.tick * XENO_TRIALS_STEP_V96;
    const displaced = observedMovement(fighter, timeSeconds);
    const moving = displaced && (Boolean(fighter.previousInput?.left) !== Boolean(fighter.previousInput?.right))
      && fighter.hp > 0 && !fighter.attack && !fighter.guard && fighter.stun <= 0
      && fighter.hitFlash <= 0 && fighter.y === 0 && match.phase === 'active';
    const reducedMotion = reduceMotion();
    // The engine owns the attack clock and locked facing. Art cannot restart an
    // attack, extend its active window or change collision/damage/save data.
    const canShowAttack = fighter.hp > 0 && fighter.y === 0 && fighter.stun <= 0
      && fighter.hitFlash <= 0 && !fighter.guard && match.phase === 'active';
    const rig=getXenoTrialsRigV154(definition,art);
    const sequenceCue=rig && (getXenoTrialsSequenceCueV156(rig,match,fighter,presentationView(),terminalV156,tauntV156)
      || getXenoTrialsSequenceCueV155(rig,match,fighter,presentationView(),outroV155));
    const cue=sequenceCue || rig && getXenoTrialsRigCueV154(rig,match,fighter,presentationView());
    const pose=cue && (sequenceCue ? sampleXenoTrialsSequenceV155(rig,cue,reducedMotion) : sampleXenoTrialsRigV154(rig,cue,reducedMotion));
    context.save();
    if(fighter.hitFlash>0) context.globalAlpha=.65;
    const rigDrawn=pose && drawXenoTrialsRigV154(context,rig,image,pose,{width,height,pivotX,bottom},fighter.x,ground,fighter.facing);
    context.restore();
    if(rigDrawn) rigDrawsV154.set(fighter.side,{...rigDrawn,
      ...(pose.sequenceIdV155 ? {sequenceIdV155:pose.sequenceIdV155,beatV155:pose.beatV155,animation:pose.animation,...(pose.sequenceIdV156?{sequenceIdV156:pose.sequenceIdV156}:{})} : {})});
    const attackDrawn = !rigDrawn && canShowAttack && drawEnemyImportAttackV109(context, art, images, {
      attack: fighter.attack, spec: getXenoTrialsAttackV147(definition, fighter.attack?.kind, XENO_TRIALS_ATTACKS_V96[fighter.attack?.kind]), reducedMotion,
      height, x: fighter.x, y: ground, facing: fighter.attack?.facing,
      maxHorizontalExtent: null
    });
    const animated = rigDrawn || attackDrawn || drawEnemyImportAnimationV107(context, art, images, {
      action: moving ? 'move' : 'idle', timeSeconds, height, x: fighter.x, y: ground, facing: fighter.facing,
      maxHorizontalExtent: null,
      reducedMotion
    });
    if (!animated) {
      const flip = fighter.facing === sourceFacing ? 1 : -1;
      context.save(); context.translate(fighter.x, ground); context.scale(flip, 1);
      if (fighter.hitFlash > 0) context.globalAlpha = .65;
      context.drawImage(image, -width * pivotX, -height * bottom, width, height); context.restore();
    }
    if (fighter.guard) {
      context.strokeStyle = '#71e2f0'; context.lineWidth = 4;
      const face = fighter.facing > 0 ? body.right : body.left;
      context.beginPath(); context.arc(face, ground - body.height * .55, body.height * .48,
        fighter.facing > 0 ? -Math.PI / 2 : Math.PI / 2, fighter.facing > 0 ? Math.PI / 2 : Math.PI * 1.5); context.stroke();
    }
    if (fighter.attack && !(['special', 'super'].includes(fighter.attack.kind)
      && ['flame', 'detonation', 'acid', 'pulse', 'ground-wave', 'acid-cluster', 'aimed-acid'].includes(getXenoTrialsSpecialStyleV147(definition)))) {
      const attack = fighter.attack, spec = getXenoTrialsAttackV147(definition, attack.kind, XENO_TRIALS_ATTACKS_V96[attack.kind]), windowStart = spec.startup;
      if (attack.age >= windowStart && attack.age < windowStart + spec.active) {
        context.strokeStyle = ['special', 'super'].includes(attack.kind) ? '#bbf280' : '#f9d5a2'; context.lineWidth = attack.kind === 'light' ? 2 : 4;
        const face = attack.facing > 0 ? body.right : body.left, reach = spec.reach * definition.reach;
        const strikeHeight = body.height * (spec.contactHeightRatioV151 || 1);
        context.beginPath(); context.moveTo(face, ground - strikeHeight * .85);
        context.quadraticCurveTo(face + attack.facing * reach, ground - strikeHeight * .55,
          face + attack.facing * reach * .5, ground - strikeHeight * .15); context.stroke();
      }
    }
    if (fighter.guardBrokenV147 && fighter.stun > 0) text('GARDE BRISÉE', fighter.x, ground - height * bottom - 12, 12, '#ffb86b', 'center');
  }
  function render() {
    if (stopped) return;
    rigDrawsV154.clear();
    cameraView = camera.update(match.fighters, frameDelta); frameDelta = 0;
    canvas.setAttribute?.('data-xeno-camera-zoom-v119', String(cameraView.zoom));
    drawArena();
    context.save(); context.translate(cameraView.translateX, cameraView.translateY); context.scale(cameraView.zoom, cameraView.zoom);
    drawXenoTrialsAcidV152(context, match, XENO_TRIALS_ARENA_V96, reduceMotion());
    for (const fighter of [...match.fighters].sort((a, b) => a.y - b.y)) drawFighter(fighter);
    drawXenoTrialsGrappleV153(context, match, getXenoTrialsBodyBoundsV105, XENO_TRIALS_ARENA_V96.floor);
    // Feedback uses physical hitbox coordinates, not the independently scaled portrait.
    for (const fighter of match.fighters) {
      const definition = getXenoTrialsFighterV96(fighter.id), attack = fighter.attack;
      if (!['special', 'super'].includes(attack?.kind)) continue;
      const style = getXenoTrialsSpecialStyleV147(definition), signature = attack.kind === 'super' ? getXenoTrialsSuperV148(definition) : getXenoTrialsSignatureV147(definition);
      if (signature && attack.age < signature.spec.startup) {
        const body = getXenoTrialsBodyBoundsV105(fighter);
        context.strokeStyle = '#e4d397'; context.lineWidth = 2;
        context.beginPath(); context.moveTo(body.left, 450 - body.top - 8);
        context.lineTo(body.left + body.width * Math.min(1, attack.age / signature.spec.startup), 450 - body.top - 8); context.stroke();
        text(signature.label.toUpperCase(), fighter.x, 450 - body.top - 18, 12, '#e4d397', 'center');
      }
      if (!['flame', 'detonation'].includes(style)) continue;
      const body = getXenoTrialsBodyBoundsV105(fighter), spec = getXenoTrialsAttackV147(definition, attack.kind, XENO_TRIALS_ATTACKS_V96.special);
      if (style === 'flame' && attack.age >= spec.startup && attack.age < spec.startup + spec.active)
        drawSynthConeV110(context, attack.facing > 0 ? body.right : body.left, 450 - fighter.y - body.height * .55, attack.facing, spec.reach);
      if (style === 'detonation' && !attack.hit) {
        context.strokeStyle = '#ffb364'; context.lineWidth = 3;
        context.strokeRect(body.left - 5, 450 - body.top - 5, body.width + 10, body.height + 10);
        text(definition.family === 'synthetic' ? 'SURCHARGE' : 'DÉTONATION', fighter.x, 450 - body.top - 13, 12, '#ffca83', 'center');
      }
    }
    for (const effect of match.synthEffectsV110 || []) {
      context.fillStyle = effect.kind === 'acid-death-v151' ? '#c1f07833' : '#ffc56c55';
      context.strokeStyle = effect.kind === 'acid-death-v151' ? '#c1f078' : '#ffecc5'; context.lineWidth = 3; context.beginPath();
      context.arc(effect.x, 450 - effect.y, effect.radius * Math.max(effect.kind === 'acid-death-v151' ? .65 : 0, 1 - effect.life / .4), 0, Math.PI * 2); context.fill(); context.stroke();
    }
    for (const projectile of match.projectiles) {
      if (projectile.style === 'ground-wave') {
        context.strokeStyle = '#e4d397'; context.lineWidth = 3;
        context.beginPath(); context.moveTo(projectile.x - 7, 450);
        context.lineTo(projectile.x, 450 - projectile.radiusV147 * 2); context.lineTo(projectile.x + 7, 450); context.stroke();
        continue;
      }
      context.fillStyle = projectile.style === 'acid' ? '#c1f078' : '#a7dafa';
      context.beginPath(); context.ellipse(projectile.x, 450 - projectile.y, projectile.signatureIdV147 ? 7 : 13, 7, 0, 0, Math.PI * 2); context.fill();
    }
    context.restore();
    drawXenoTrialsArenaOverlayV119(context, stage, cameraView, reduceMotion() ? 0 : match.tick);
    if (options.htmlHud !== true) match.fighters.forEach((fighter, i) => {
      const def = getXenoTrialsFighterV96(fighter.id), x = i === 0 ? 30 : 585;
      text(`${i === 0 ? 'VOUS' : 'ADVERSAIRE'} / ${def.label}`, i === 0 ? 30 : 970, 31, 17, '#e4e9eb', i === 0 ? 'left' : 'right', 385);
      bar(x, 44, 385, fighter.hp / def.hp, i === 0 ? '#6bd4c5' : '#ed858e', i === 1);
      bar(x, 65, 385, fighter.stamina / def.stamina, '#ddbf69', i === 1);
      text(`PV ${Math.ceil(fighter.hp)} / ${def.hp}  •  END ${Math.floor(fighter.stamina)}`, i === 0 ? 30 : 970, 99, 12, '#bfc9d0', i === 0 ? 'left' : 'right');
      const superState = getXenoTrialsSuperReadinessV148(match, fighter, def);
      if (superState.supported) text(`SUPER ${Math.floor(superState.meter)} / 100${superState.ready ? ' · I' : ''}`, i === 0 ? 30 : 970, 115, 11, '#ddbf69', i === 0 ? 'left' : 'right');
      const wins = match.wins[fighter.side];
      for (let n = 0; n < match.config.roundsToWin; n++) { context.fillStyle = n < wins ? '#fae5a3' : '#424c58'; context.fillRect(i === 0 ? 426 + n * 15 : 559 - n * 15, 44, 10, 10); }
    });
    if (options.htmlHud !== true) {
      text(`${Math.ceil(match.timeRemaining)}`, 500, 61, 32, '#eee3bd', 'center');
      text(`MANCHE ${match.round}`, 500, 96, 12, '#b4c4d2', 'center');
    }
    const intro = presentationView();
    // A short round can finish before the fight signal fades. Terminal and
    // intermission frames must never freeze that announcement over the result.
    const showPresentation = loaded && !match.paused && match.phase === 'active';
    if (showPresentation && intro.fighterSlot !== null) {
      const fighter = match.fighters[intro.fighterSlot], def = getXenoTrialsFighterV96(fighter.id);
      context.fillStyle = '#061019df'; context.fillRect(200, 150, 600, 90);
      text(`${intro.fighterSlot === 0 ? 'VOTRE SPÉCIMEN' : 'ADVERSAIRE'} / ${def.label.toUpperCase()}`, 500, 185, 24, stage.accent, 'center', 570);
      const family = { synthetic: 'SYNTHÉTIQUE', pathogen: 'PATHOGÈNE', xenomorph: 'XÉNOMORPHE', engineer: 'INGÉNIEUR', human: 'HUMAIN' }[def.family];
      const role = { balanced: 'POLYVALENT', agile: 'MOBILE', tank: 'DÉFENSIF', ranged: 'DISTANCE' }[def.role];
      text(`${def.hp} PV  •  ${family}  •  ${role}`, 500, 218, 15, '#d4e1e7', 'center', 570);
    } else if (showPresentation && ['countdown', 'fight'].includes(intro.phase)) {
      text(intro.countdown ? String(intro.countdown) : 'COMBAT', 500, 235, 54, '#efe8cb', 'center');
    }
    // The accessible HTML pause dialog owns its text; standalone canvas
    // integrations retain the original pause instructions.
    if (!loaded || assetFailure || (isPaused() ? options.htmlHud !== true : match.phase !== 'active' && !outroPlaying())) {
      context.fillStyle = '#061019b8'; context.fillRect(150, 216, 700, 106);
      const heading = !loaded ? 'CHARGEMENT DES SPÉCIMENS' : assetFailure ? 'VISUEL INDISPONIBLE' : isPaused() ? 'SIMULATION EN PAUSE' : match.phase === 'intro' ? `MANCHE ${match.round}` : match.phase === 'round-over' ? match.roundWinner === 'draw' ? 'ÉGALITÉ' : match.roundWinner === 'player' ? 'MANCHE REMPORTÉE' : 'MANCHE PERDUE' : match.result.winner === 'player' ? 'VICTOIRE' : match.result.winner === 'opponent' ? 'DÉFAITE' : 'ÉGALITÉ';
      text(heading, 500, 255, 25, '#efe8cb', 'center');
      text(assetFailure ? 'Rechargez le module pour réessayer.' : isPaused() ? 'P / Échap ou bouton Reprendre' : match.phase === 'match-over' ? 'Résultat transmis au terminal.' : 'J frappe • K lourd • L spécial • I super • S garde', 500, 290, 15, '#b6cbd2', 'center');
    }
  }
  function pause() {
    if (stopped || isPaused() || match.phase === 'match-over' && !outroPlaying()) return false;
    for (const key of heldKeys) blockedKeys.add(key);
    clearInputs();
    if (match.phase === 'match-over') { if(outroV155)outroV155 = {...outroV155,paused:true}; if(terminalV156)terminalV156={...terminalV156,paused:true}; }
    else setXenoTrialsPausedV96(match,true);
    previousTime = null; frameDelta = 0;
    if (raf !== null) cancelFrame(raf); raf = null;
    notify(true); render(); return true;
  }
  function resume() {
    if (stopped || !isPaused() || !loaded || assetFailure || !windowAvailable()
      || match.phase === 'match-over' && !outroPlaying()) return false;
    clearInputs();
    if (match.phase === 'match-over') { if(outroV155)outroV155 = {...outroV155,paused:false}; if(terminalV156)terminalV156={...terminalV156,paused:false}; }
    else setXenoTrialsPausedV96(match,false);
    previousTime = null; canvas.focus?.({preventScroll:true}); notify(true);
    if (!stopped && running && raf === null) raf = requestFrame(frame);
    return !stopped;
  }
  function skipSequence() {
    if (stopped || !loaded || assetFailure || isPaused() || !windowAvailable()) return false;
    let changed = false;
    if (outroPlaying()) {
      outroV155 = skipXenoTrialsOutroV155(outroV155); terminalV156=skipXenoTrialsOutroV155(terminalV156); running = false; changed = true;
      if (raf !== null) cancelFrame(raf); raf = null;
    } else if (match.phase === 'active') {
      const next = skipXenoTrialsIntroV155(presentation);
      changed = next !== presentation; presentation = next;
    }
    if (!changed) return false;
    for (const key of heldKeys) blockedKeys.add(key);
    clearInputs(); previousTime = null; frameDelta = 0; render(); notify(true); return true;
  }
  function taunt() {
    if (!acceptsControls() || tauntV156?.phase === 'playing') return false;
    const next=createXenoTrialsTauntV156(match,presentationView(),controls(),reduceMotion());
    if(!next)return false;
    tauntV156=next; render(); notify(true); return !stopped;
  }
  function keydown(event) {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
    const tag = String(event.target?.tagName || '').toLowerCase();
    if (['input', 'select', 'textarea'].includes(tag) || event.target?.isContentEditable
      || event.target?.closest?.('input, select, textarea, [contenteditable]:not([contenteditable="false"])')) return;
    if (['KeyP', 'Escape'].includes(event.code)) {
      event.preventDefault?.(); if (!event.repeat) isPaused() ? resume() : pause(); return;
    }
    // Native menu buttons keep Space/Enter activation. Combat control buttons
    // have their own root handler; bubbling must never add a second jump/input.
    if (['button', 'a', 'summary'].includes(tag)
      || event.target?.closest?.('button, a[href], summary, [role="button"], [role="link"]')) return;
    if (event.code === 'KeyT') { event.preventDefault?.(); if(!event.repeat)taunt(); return; }
    if (KEY_ACTION[event.code]) {
      event.preventDefault?.();
      // Repeats originating in a menu or during an unavailable phase cannot
      // manufacture a fresh combat press after focus/countdown returns.
      if (!acceptsControls() || event.repeat && !heldKeys.has(event.code)) blockedKeys.add(event.code);
      else if (!blockedKeys.has(event.code)) heldKeys.add(event.code);
    }
  }
  function registerInputs() {
    listen(host, 'keydown', keydown);
    listen(host, 'keyup', event => { heldKeys.delete(event.code); blockedKeys.delete(event.code); buttonKeys.delete(event.code); releaseXenoTrialsControlsV150(match, 'player', controls()); });
    listen(host, 'blur', pause);
    listen(doc, 'visibilitychange', () => { if (doc.hidden) pause(); });
    listen(doc, 'focusin', event => {
      const target = event.target, control = target?.closest?.('[data-xeno-action]');
      // Accessible combat buttons are gameplay inputs. Pause/resume buttons
      // own their explicit click; focusing one must not toggle it twice.
      if (target === canvas || control && options.controlsRoot?.contains(control)
        || target?.closest?.('[data-xt="pause"], [data-xt="resume-overlay"], [data-xt="skip-sequence"], [data-xt="taunt"]')) return;
      pause();
    });
    listen(canvas, 'pointerdown', () => canvas.focus?.({ preventScroll: true }));
    const root = options.controlsRoot;
    listen(root, 'keydown', event => {
      if (!['Space', 'Enter'].includes(event.code) || event.ctrlKey || event.metaKey || event.altKey) return;
      const button = event.target?.closest?.('[data-xeno-action]');
      const action = button?.getAttribute('data-xeno-action');
      if (!ACTIONS.has(action) || !root.contains(button)) return;
      event.preventDefault?.(); event.stopPropagation?.();
      if (!event.repeat && acceptsControls()) buttonKeys.set(event.code, action);
    });
    listen(root, 'keyup', event => {
      if (!['Space', 'Enter'].includes(event.code)) return;
      // Keyup may target a different button after keyboard focus moves.
      const released = buttonKeys.delete(event.code);
      releaseXenoTrialsControlsV150(match, 'player', controls());
      if (released) { event.preventDefault?.(); event.stopPropagation?.(); }
    });
    listen(root, 'focusout', () => { buttonKeys.clear(); releaseXenoTrialsControlsV150(match, 'player', controls()); });
    listen(root, 'pointerdown', event => {
      // Secondary mouse/pen buttons retain their native meaning; multi-touch
      // contacts use button 0 and must not be rejected by isPrimary.
      if (event.button !== undefined && event.button !== 0) return;
      const button = event.target?.closest?.('[data-xeno-action]');
      const action = button?.getAttribute('data-xeno-action');
      if (!ACTIONS.has(action) || !root.contains(button) || !acceptsControls()) return;
      event.preventDefault?.(); heldPointers.set(event.pointerId, action); pointerOwners.set(event.pointerId, button);
      try { button.setPointerCapture?.(event.pointerId); } catch {}
    });
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) listen(root, type, event => {
      heldPointers.delete(event.pointerId); pointerOwners.delete(event.pointerId);
      releaseXenoTrialsControlsV150(match, 'player', controls());
    });
  }
  function frame(timestamp) {
    raf = null;
    if (stopped || !running || isPaused()) return;
    // Also cover a missed browser blur event without accumulating elapsed debt.
    if (!windowAvailable()) { pause(); return; }
    if (stopped) return;
    const dt = previousTime === null ? 0 : clamp((timestamp - previousTime) / 1000, 0, .25);
    frameDelta = dt;
    previousTime = timestamp;
    if (match.phase === 'match-over' && (outroV155 || terminalV156)) {
      // A separate finite presentation clock. The completed engine/result are
      // immutable; the result callback was already delivered before this frame.
      frameDelta = 0;
      if (reduceMotion()) {
        if(outroV155)outroV155 = {...skipXenoTrialsOutroV155(outroV155),reducedMotion:true};
        if(terminalV156)terminalV156 = {...skipXenoTrialsOutroV155(terminalV156),reducedMotion:true};
      } else if(terminalV156)terminalV156=advanceXenoTrialsOutroV155(terminalV156,dt*1000);
      else {
        outroV155 = advanceXenoTrialsOutroV155(outroV155,dt*1000);
        if(outroV155?.phase==='complete')terminalV156=createXenoTrialsTerminalV156(match,'outro',false,outroV155);
      }
      notifyElapsed += dt; render(); notify(!outroPlaying());
      if (!outroPlaying()) { running = false; clearInputs(); }
    } else {
      const wasBlocking = presentationView().blocksSimulation, beforeRound = match.round;
      presentation = advanceXenoPresentationV97(presentation,dt*1000,match.paused || doc?.hidden || !loaded);
      if (wasBlocking && !presentationView().blocksSimulation) clearInputs();
      if (!wasBlocking) stepXenoTrialsMatchV96(match,dt,controls());
      tauntV156=advanceXenoTrialsTauntV156(tauntV156,match,dt*1000,controls(),reduceMotion());
      if (!match.paused && match.phase === 'round-over' && match.phaseTime <= 0) nextXenoTrialsRoundV96(match);
      if (match.round !== beforeRound) { presentation = createXenoPresentationV97(match.round); tauntV156=null; for (const key of heldKeys) blockedKeys.add(key); clearInputs(); }
      if (match.phase === 'match-over') {
        outroV155 = createXenoTrialsOutroV155(match,reduceMotion()); terminalV156=createXenoTrialsTerminalV156(match,'draw',reduceMotion()); tauntV156=null; frameDelta = 0; clearInputs();
      }
      notifyElapsed += dt; render(); notify(match.phase === 'match-over' && !emittedResult);
      if (match.phase === 'match-over' && !outroPlaying()) { running = false; clearInputs(); }
    }
    if (!stopped && running && !isPaused() && raf === null) raf = requestFrame(frame);
  }

  function loadImage(path) {
    if (options.loadImage) return options.loadImage(path);
    return new Promise((resolve, reject) => {
      const ImageCtor = host?.Image || globalThis.Image;
      if (!ImageCtor) { reject(new Error('Image loader unavailable')); return; }
      const image = new ImageCtor();
      let settled = false;
      const cleanup = () => { clearTimeout(timer); image.onload = null; image.onerror = null; pendingLoads.delete(cancel); };
      const fail = message => { if (settled) return; settled = true; cleanup(); reject(new Error(message)); };
      const cancel = () => fail(`Chargement annulé: ${path}`);
      const timeout = Number.isFinite(options.imageTimeoutMs) ? clamp(options.imageTimeoutMs, 10, 30000) : 15000;
      const timer = setTimeout(() => fail(`Délai de chargement dépassé: ${path}`), timeout);
      pendingLoads.add(cancel);
      image.onload = () => {
        if (settled) return;
        if (!(image.naturalWidth > 0 && image.naturalHeight > 0)) { fail(`Image vide: ${path}`); return; }
        settled = true; cleanup(); resolve(image);
      };
      image.onerror = () => fail(`Visuel indisponible: ${path}`);
      image.src = path;
    });
  }
  async function start() {
    if (stopped) return false;
    if (loading) return loading;
    loading = (async () => {
      render(); notify(true);
      if (stopped) return false;
      const paths = [...new Set(match.fighters.map(f => getXenoTrialsArtV96(f.id, f.variant).path))];
      const allPaths = stage.backdrop ? [...paths, stage.backdrop] : paths;
      const results = await Promise.allSettled(allPaths.map(async path => {
        const image = await loadImage(path);
        // Apply the same validation to native and injected loaders. A resolved
        // promise with no decodable fighter is not a successful admission.
        if (!(image?.naturalWidth > 0 && image?.naturalHeight > 0)) throw new Error(`Visuel vide: ${path}`);
        if (!stopped) images.set(path, image);
      }));
      if (stopped) return false;
      // Missing scenery is cosmetic; missing fighter art still suspends the duel.
      for (const fighter of match.fighters) {
        const art = getXenoTrialsArtV96(fighter.id, fighter.variant);
        requestEnemyImportAnimationV107(images, art, loadImage, () => !stopped);
        requestEnemyImportAttackV109(images, art, loadImage, () => !stopped);
      }
      loaded = true; assetFailure = results.slice(0, paths.length).some(r => r.status === 'rejected');
      if (assetFailure) { setXenoTrialsPausedV96(match, true); options.onAssetError?.(paths.filter((path, i) => results[i].status === 'rejected')); }
      if (stopped) return false;
      registerInputs(); running = true; previousTime = null;
      if (!windowAvailable()) setXenoTrialsPausedV96(match, true);
      if (windowAvailable() && !match.paused) canvas.focus?.({ preventScroll: true });
      notify(true);
      if (stopped) return false;
      render(); if (!match.paused) raf = requestFrame(frame); return !assetFailure;
    })();
    return loading;
  }
  function stop() {
    if (stopped) return;
    stopped = true; running = false; outroV155 = null; terminalV156=null; tauntV156=null; clearInputs(); if (raf !== null) cancelFrame(raf); raf = null;
    for (const cancel of [...pendingLoads]) cancel();
    for (const remove of listeners.splice(0)) remove(); images.clear(); rigDrawsV154.clear();
    canvas.width = originalSize.width; canvas.height = originalSize.height;
  }
  return Object.freeze({ start, pause, resume, stop, skipSequence, taunt,
    exit() { if (exited || stopped) return; exited = true; stop(); options.onExit?.(); },
    setInput(action, pressed) {
      if (!ACTIONS.has(action)) return;
      if (pressed !== true) { virtual[action] = false; releaseXenoTrialsControlsV150(match, 'player', controls()); }
      else if (acceptsControls()) virtual[action] = true;
    },
    getState() { return snapshot(); },
    nextRound() {
      if (stopped || match.paused) return false;
      const changed = nextXenoTrialsRoundV96(match);
      if (changed) { presentation = createXenoPresentationV97(match.round); tauntV156=null; for (const key of heldKeys) blockedKeys.add(key); clearInputs(); notify(true); render(); }
      return changed;
    }
  });
}
