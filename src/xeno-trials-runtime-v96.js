import { createXenoTrialsOutroV155, advanceXenoTrialsOutroV155, skipXenoTrialsOutroV155,
 getXenoTrialsSequenceCueV155, sampleXenoTrialsSequenceV155, skipXenoTrialsIntroV155,
 createXenoTrialsTerminalV156, createXenoTrialsTauntV156, advanceXenoTrialsTauntV156, getXenoTrialsSequenceCueV156, createXenoTrialsExitV157, getXenoTrialsExitViewV157, createXenoTrialsLandingV157, getXenoTrialsLandingViewV157 } from './xeno-trials-sequences-v155.js';
import { getXenoTrialsRigV154, getXenoTrialsRigCueV154, sampleXenoTrialsRigV154, drawXenoTrialsRigV154, sampleXenoTrialsExitPoseV157 } from './xeno-trials-rig-v154.js';
import { getXenoTrialsGrappleViewV153, drawXenoTrialsGrappleV153 } from './xeno-trials-grapple-v153.js';
import { drawXenoTrialsAcidV152 } from './xeno-trials-acid-pools-v152.js';
import { getXenoTrialsSuperV148, getXenoTrialsSuperReadinessV148 } from './xeno-trials-supers-v148.js';
import { getXenoTrialsAttackV147, getXenoTrialsSpecialStyleV147, getXenoTrialsSignatureV147 } from './xeno-trials-signatures-v147.js';
import { getXenoTrialsStageMotionV147, drawXenoTrialsStageMotionV147, getXenoTrialsStageCueV149 } from './xeno-trials-stage-motion-v147.js';
import { getXenoTrialsFighterV96, getXenoTrialsArtV96, XENO_TRIALS_STAGES_V96 } from './xeno-trials-data-v96.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, setXenoTrialsPausedV96,
  getXenoTrialsSnapshotV96, nextXenoTrialsRoundV96, releaseXenoTrialsControlsV150, restoreXenoTrialsHordeMatchV180, XENO_TRIALS_ARENA_V96, XENO_TRIALS_ATTACKS_V96, XENO_TRIALS_STEP_V96 } from './xeno-trials-engine-v96.js';
import { createXenoPresentationV97, getXenoPresentationViewV97, advanceXenoPresentationV97 } from './xeno-trials-presentation-v97.js';
import { getXenoTrialsRenderMetricsV105, getXenoTrialsBodyBoundsV105 } from './xeno-trials-geometry-v105.js';
import { requestEnemyImportAnimationV107, drawEnemyImportAnimationV107,
  createEnemyImportMotionTrackerV107 } from './enemy-import-animation-v107.js';
import { requestEnemyImportAttackV109, drawEnemyImportAttackV109 } from './enemy-import-attacks-v109.js';
import { getXenoTrialsDisplayScaleV110, getXenoTrialsRenderMetricsV110, createXenoTrialsCameraV119 } from './xeno-trials-scale-v110.js';
import { drawXenoTrialsArenaLayersV119, drawXenoTrialsArenaOverlayV119 } from './xeno-trials-arena-layers-v119.js';
import { drawSynthConeV110 } from './synth-combat-v110.js';
import { getXenoTrialsCaptureAssetsV163, getXenoTrialsCaptureViewV163, getXenoTrialsCaptureReceiptV163,
 drawXenoTrialsCaptureTargetV163, sampleXenoTrialsPreparationV163 } from './xeno-trials-capture-v163.js';
import { getXenoTrialsHordeProtocolV180 } from './xeno-trials-horde-v180.js';
import { getXenoTrialsStageAssetsV180, getXenoTrialsStageDepthViewV180 } from './xeno-trials-stage-depth-v180.js';
import { getXenoTrialsStageSceneV190, getXenoTrialsStageAssetsV190 } from './xeno-trials-stage-scenes-v190.js';
import { drawXenoTrialsStageRearV190, drawXenoTrialsStageFrontV190 } from './xeno-trials-stage-scenes-render-v190.js';
import { createXenoTrialsSwarmMotionV180, drawXenoTrialsSwarmSpriteV180 } from './xeno-trials-swarm-sprites-v180.js';
import { createXenoTrialsGamepadV186 } from './xeno-trials-gamepad-v186.js';
import { createXenoTrialsHordeCheckpointV186 } from './xeno-trials-horde-checkpoint-v186.js';
import { createXenoTrialsReactionObserverV186, drawXenoTrialsReactionV186 } from './xeno-trials-reactions-v186.js';
import { getXenoTrialsHordeBossViewV186 } from './xeno-trials-horde-bosses-v186.js';
import { drawXenoTrialsOperationV188, getXenoTrialsOperationHudV188 } from './xeno-trials-operation-presentation-v188.js';
import { drawXenoTrialsStageHazardsV188 } from './xeno-trials-stage-hazards-render-v188.js';
import { createXenoTrialsAudioV189 } from './xeno-trials-audio-v189.js';
import { getXenoTrialsSpriteAtlasV189, drawXenoTrialsSpriteAtlasV189, requestXenoTrialsSpriteAtlasV189, getXenoTrialsSpriteEnvelopeV189 } from './xeno-trials-sprite-atlas-v189.js';
import { getXenoTrialsSpriteAtlasV191, drawXenoTrialsSpriteAtlasV191, requestXenoTrialsSpriteAtlasV191, getXenoTrialsSpriteEnvelopeV191 } from './xeno-trials-sprite-atlas-v191.js';
import { drawXenoTrialsSpriteAtlasV188, requestXenoTrialsSpriteAtlasV188, getXenoTrialsSpriteEnvelopeV188 } from './xeno-trials-sprite-atlas-v188.js';
import { getXenoTrialsStageHazardViewV188 } from './xeno-trials-stage-hazards-v188.js';

const KEY_ACTION = Object.freeze({ ArrowLeft: 'left', KeyQ: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  ArrowUp: 'jump', KeyZ: 'jump', KeyW: 'jump', Space: 'jump', ArrowDown: 'guard', KeyS: 'guard', KeyJ: 'light', KeyK: 'heavy', KeyL: 'special', KeyI: 'super', KeyE: 'interact' });
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
  const checkpoint = options.resumeSnapshot ? createXenoTrialsHordeCheckpointV186(options.resumeSnapshot, options.config) : null;
  if (options.resumeSnapshot && !checkpoint) throw new Error('Point de reprise incompatible avec cette évaluation.');
  const restored = checkpoint ? restoreXenoTrialsHordeMatchV180(checkpoint.snapshot) : null;
  if (checkpoint && !restored) throw new Error('Point de reprise invalide.');
  const match = restored || createXenoTrialsMatchV96({ ...options.config, introSeconds: 0, holdRoundTransition: true });
  const hordeProtocol = getXenoTrialsHordeProtocolV180(match.config.hordeV180?.protocolId);
  const swarmMotion = createXenoTrialsSwarmMotionV180();
  const reactions = createXenoTrialsReactionObserverV186({ canObserve: fighter => {
    const art = getXenoTrialsArtV96(fighter?.id, fighter?.variant);
    const atlas = getXenoTrialsSpriteAtlasV191(fighter, art) || getXenoTrialsSpriteAtlasV189(fighter, art);
    return atlas?.kind === 'combat' && images.has(atlas.texture.path);
  } });
  const gamepad = createXenoTrialsGamepadV186();
  const sound = createXenoTrialsAudioV189({ audioDirector: options.audioDirector,
    AudioContextCtor: options.AudioContextCtor || host?.AudioContext || host?.webkitAudioContext,
    getSettings: options.getAudioSettings, initialSnapshot: match });
  sound.setEnabled(options.audioEnabled !== false);
  const readGamepads = options.getGamepads || host?.navigator?.getGamepads?.bind(host.navigator);
  let gamepadInput = {}, gamepadView = null, gamepadRaf = null, lastCheckpointTick = match.tick;
  let checkpointStatus = { saved: Boolean(restored), tick: restored?.tick || null, reason: restored ? 'restored' : null }, checkpointing = false;
  const displayScale = getXenoTrialsDisplayScaleV110(match.fighters);
  const camera = createXenoTrialsCameraV119(match.fighters, { width: 1000, height: 560 }, {
    envelope: fighter => (getXenoTrialsSpriteEnvelopeV191(fighter, getXenoTrialsArtV96(fighter.id, fighter.variant),
      getXenoTrialsRenderMetricsV110(fighter.id, fighter.variant, displayScale)) || getXenoTrialsSpriteEnvelopeV188(fighter, getXenoTrialsArtV96(fighter.id, fighter.variant),
      getXenoTrialsRenderMetricsV110(fighter.id, fighter.variant, displayScale))) });
  let cameraView = camera.getState(), frameDelta = 0;
  let presentation = restored ? { phase: 'active', elapsedMs: 0, round: match.round } : createXenoPresentationV97(), outroV155 = null, terminalV156 = null, tauntV156 = null, exitV157 = null, landingV157 = null;
  const outroPlaying = () => outroV155?.phase === 'playing' || terminalV156?.phase === 'playing' || exitV157?.phase === 'playing' || landingV157?.phase === 'playing';
  const isPaused = () => match.paused || outroV155?.paused === true || terminalV156?.paused === true || exitV157?.paused === true || landingV157?.paused === true;
  const presentationView = () => getXenoPresentationViewV97(presentation);
  const reduceMotion = () => options.reducedMotion === true || host?.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true
    || doc?.documentElement?.classList?.contains?.('reduced-motion') === true;
  const rigDrawsV154 = new Map();
  let captureViewV163 = null;
  let stageSceneRearV190 = null, stageSceneFrontV190 = null;
  const snapshot = () => ({ ...getXenoTrialsSnapshotV96(match), presentation: presentationView(),
    audioV189: sound.getState(),
    stageSceneV190: { rear: stageSceneRearV190, front: stageSceneFrontV190 },
    operationViewV188: getXenoTrialsOperationHudV188(match), stageHazardViewV188: getXenoTrialsStageHazardViewV188(match),
    resumedV186: Boolean(restored), checkpointV186: { ...checkpointStatus },
    gamepadV186: gamepadView ? { connected: gamepadView.connected, index: gamepadView.index, needsNeutral: gamepadView.needsNeutral } : null,
    bossV186: hordeProtocol ? getXenoTrialsHordeBossViewV186(hordeProtocol, match.hordeV180, match.fighters) : null,
    defeatedViewsV186: hordeProtocol ? defeatedBodiesV186().map(ghost => ({ id: ghost.fighter.id,
      instanceId: ghost.fighter.instanceIdV180, cue: { ...ghost.cue }, opacity: ghost.opacity })) : [],
    paused: isPaused(), outroV155: outroV155 ? JSON.parse(JSON.stringify(outroV155)) : null,
    terminalV156: terminalV156 ? JSON.parse(JSON.stringify(terminalV156)) : null,
    tauntV156: tauntV156 ? JSON.parse(JSON.stringify(tauntV156)) : null,
    exitV157: exitV157 ? JSON.parse(JSON.stringify(exitV157)) : null,
    landingV157: landingV157 ? JSON.parse(JSON.stringify(landingV157)) : null,
    landingViewsV157: match.fighters.map(f=>getXenoTrialsLandingViewV157(match,f,landingV157,reduceMotion())).filter(Boolean),
    exitViewsV157: match.fighters.map(f=>getXenoTrialsExitViewV157(match,f,exitV157,reduceMotion())).filter(Boolean),
    canTauntV156: !hordeProtocol && acceptsControls() && tauntV156?.phase !== 'playing' && Boolean(createXenoTrialsTauntV156(match,presentationView(),controls(),reduceMotion())),
    rigViewsV154: JSON.parse(JSON.stringify([...rigDrawsV154].map(([side,view])=>({side,...view})))),
    captureViewsV163: JSON.parse(JSON.stringify([...rigDrawsV154].filter(([,view])=>view.captureV163).map(([side,view])=>({side,...view.captureV163})))),
    grappleViewV153: hordeProtocol ? null : getXenoTrialsGrappleViewV153(match),
    cameraV119: { zoom: cameraView.zoom, center: cameraView.center, pixelsPerMeter: cameraView.pixelsPerMeter },
    supersV148: match.fighters.map(fighter => ({ side: fighter.side, ...getXenoTrialsSuperReadinessV148({ ...match, presentation: presentationView() }, fighter, getXenoTrialsFighterV96(fighter.id)) })),
    stageAnimationV147: getXenoTrialsStageMotionV147(stage.id, match.tick, reduceMotion()),
    stageDepthV180: (() => {
      const view = getXenoTrialsStageDepthViewV180(stage.id, cameraView, match.tick, { reducedMotion: reduceMotion(), phase: match.phase, phaseTime: match.phaseTime });
      return view ? { ...view, layers: view.layers.map(layer => ({ ...layer, loaded: images.has(layer.path) })) } : null;
    })(),
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
    gamepadInput = {}; gamepad.reset();
    releaseXenoTrialsControlsV150(match, 'player', controls());
    const captures = [...pointerOwners]; pointerOwners.clear();
    for (const [id, button] of captures) { try { button.releasePointerCapture?.(id); } catch {} }
  }
  function controls() {
    const result = { ...virtual };
    for (const action of ACTIONS) if (gamepadInput[action]) result[action] = true;
    for (const key of heldKeys) result[KEY_ACTION[key]] = true;
    for (const action of heldPointers.values()) result[action] = true;
    for (const action of buttonKeys.values()) result[action] = true;
    return result;
  }
  function checkpointNow(reason = 'periodic') {
    if (checkpointing || !hordeProtocol || !loaded || assetFailure || stopped || match.result || match.phase !== 'active'
      || presentationView().blocksSimulation || typeof options.onCheckpoint !== 'function') return false;
    if (reason === 'periodic' && match.tick - lastCheckpointTick < 5 / XENO_TRIALS_STEP_V96) return false;
    lastCheckpointTick = match.tick;
    let saved = false;
    checkpointing = true;
    try { saved = options.onCheckpoint(getXenoTrialsSnapshotV96(match), reason) !== false; } catch {}
    finally { checkpointing = false; }
    checkpointStatus = { saved, tick: match.tick, reason };
    return saved;
  }
  function defeatedBodiesV186() {
    const bodies = reactions.getDefeated(match);
    // A terminal result parks RAF. Its last image retains the supported KO
    // pose rather than freezing the first standing frame of the collapse.
    return match.result ? bodies.map(ghost => ({ ...ghost, cue: { ...ghost.cue, progress: 1 } })) : bodies;
  }
  function pollGamepad() {
    if (typeof readGamepads !== 'function' || stopped || !loaded) return;
    let pads = [];
    try { pads = readGamepads() || []; } catch {}
    gamepadView = gamepad.sample(pads, { active: acceptsControls(), paused: isPaused(), focused: windowAvailable(), allowInteract: Boolean(match.operationV188) });
    gamepadInput = gamepadView.input;
    if (gamepadView.disconnected) { clearInputs(); pause(); }
    else if (gamepadView.pauseToggle) isPaused() ? resume() : pause();
  }
  function pollPausedGamepad() {
    gamepadRaf = null;
    if (stopped || !running || !isPaused() || !windowAvailable()) return;
    pollGamepad();
    if (!stopped && running && isPaused() && gamepadView?.connected && gamepadRaf === null)
      gamepadRaf = requestFrame(pollPausedGamepad);
  }
  function armPausedGamepad() {
    if (!stopped && running && isPaused() && gamepadView?.connected && gamepadRaf === null)
      gamepadRaf = requestFrame(pollPausedGamepad);
  }
  function statusText() {
    const operation = getXenoTrialsOperationHudV188(match);
    if (operation && !presentationView().blocksSimulation) return `${match.paused ? 'PAUSE' : operation.phase} · ${operation.instruction} · ${operation.progress.label}`;
    if (assetFailure) return 'Combat suspendu : visuel dédié indisponible. Rechargez pour réessayer.';
    if (isPaused()) return 'Simulation en pause. Reprendre avec P ou le bouton Reprendre.';
    if (hordeProtocol && !presentationView().blocksSimulation) {
      if (match.result) return match.result.winner === 'player' ? 'Secteur sécurisé. Toutes les vagues neutralisées.' : 'Confinement perdu. Évaluation interrompue.';
      const horde = match.hordeV180;
      return `${horde.phase === 'intermission' ? 'Renforts en approche' : 'Contacts actifs'} · Vague ${horde.wave}/${horde.waveCount} · ${horde.alive} contacts actifs · ${horde.totalKills}/${horde.totalEnemies} neutralisés · ${Math.ceil(match.fighters[0].hp)} PV.`;
    }
    if (landingV157?.phase === 'playing') return 'Fin de simulation : retour des appuis au sol.';
    if (exitV157?.phase === 'playing') return 'Fin de simulation : sortie des spécimens.';
    if (terminalV156?.phase === 'playing') return terminalV156.kind==='draw' ? 'Égalité : récupération des spécimens.' : 'Fin de présentation : retour à la vigilance.';
    if (presentationView().fighterSlot !== null) return `Présentation : ${getXenoTrialsFighterV96(match.fighters[presentationView().fighterSlot].id).label}`;
    if (presentationView().countdown) return `Manche ${match.round} : ${presentationView().countdown}`;
    if (match.phase === 'intro') return `Manche ${match.round} : préparez-vous.`;
    if (match.phase === 'round-over') return `Manche ${match.round} : ${match.roundWinner === 'draw' ? 'égalité' : match.roundWinner === 'player' ? 'victoire' : 'défaite'}. Manche suivante en préparation.`;
    if (match.phase === 'match-over') return match.result.winner === 'player' ? 'Simulation terminée : victoire.' : match.result.winner === 'opponent' ? 'Simulation terminée : défaite.' : 'Simulation terminée : égalité.';
    return `Manche ${match.round}, ${Math.ceil(match.timeRemaining)} secondes. Santé ${Math.ceil(match.fighters[0].hp)} contre ${Math.ceil(match.fighters[1].hp)}.`;
  }
  function notify(force = false) {
    sound.observeState(match, { active: loaded && running && !stopped && !isPaused() && !presentationView().blocksSimulation, focused: windowAvailable() });
    if (stopped || !force && notifyElapsed < .12) return;
    notifyElapsed = 0;
    const status = statusText();
    if (options.statusElement && status !== lastStatus) options.statusElement.textContent = status;
    lastStatus = status;
    options.onState?.(snapshot());
    if (!stopped && match.result && !emittedResult) { emittedResult = true; options.onResult?.({ ...match.result, wins: { ...match.result.wins }, playerStats: { ...match.result.playerStats }, opponentStats: { ...match.result.opponentStats },
      ...(match.result.hordeV180 ? { hordeV180: JSON.parse(JSON.stringify(match.result.hordeV180)) } : {}),
      ...(match.result.operationV188 ? { operationV188: JSON.parse(JSON.stringify(match.result.operationV188)) } : {}),
      ...(match.result.stageHazardsV188 ? { stageHazardsV188: JSON.parse(JSON.stringify(match.result.stageHazardsV188)) } : {}) }); }
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
    if (!getXenoTrialsStageSceneV190(stage.id)?.replacesArena) {
      drawXenoTrialsArenaLayersV119(context, stage, images, cameraView, match.tick,
        { reducedMotion: reduceMotion(), phase: match.phase, phaseTime: match.phaseTime, roundWinner: match.roundWinner });
      drawXenoTrialsStageMotionV147(context, stage, cameraView, match.tick, reduceMotion(), { ...match, presentation: presentationView() });
    }
    stageSceneRearV190 = drawXenoTrialsStageRearV190(context, stage, images, cameraView, match.tick,
      { reducedMotion: reduceMotion(), phase: match.phase, phaseTime: match.phaseTime });
  }
  function drawFighter(fighter, preparedReaction = null) {
    const exitView=getXenoTrialsExitViewV157(match,fighter,exitV157,reduceMotion());
    const landingView=getXenoTrialsLandingViewV157(match,fighter,landingV157,reduceMotion());
    if(exitView&&!exitView.visible)return;
    const drawX=exitView?.x??fighter.x,drawFacing=exitView?.direction??fighter.facing;
    const definition = getXenoTrialsFighterV96(fighter.id), art = getXenoTrialsArtV96(fighter.id, fighter.variant);
    const image = images.get(art.path), ground = exitView?.ground ?? landingView?.ground ?? 450 - fighter.y;
    const body = getXenoTrialsBodyBoundsV105(fighter);
    const captive = captureViewV163?.target === fighter ? captureViewV163 : null;
    // The floor drawing follows the visible prone body. Its physical hitbox
    // stays unchanged; leaving the shadow at that hitbox stranded it beside
    // the body whenever the paired hands required a visual root offset.
    const shadowBlend = captive?.previous ? captive.mix : 1;
    const plateWidth = captive && ((captive.layout.bounds.right - captive.layout.bounds.left) * shadowBlend
      + (captive.previous ? captive.previous.bounds.right - captive.previous.bounds.left : 0) * (1 - shadowBlend));
    context.fillStyle = '#0008'; context.beginPath(); context.ellipse(captive?.layout.rootX ?? body.center+drawX-fighter.x,
      454, captive ? Math.max(12, plateWidth * .46) : body.width * .68, 11, 0, 0, Math.PI * 2); context.fill();
    if (!image) { text('Visuel indisponible', fighter.x, ground - 90, 12, '#f0b6ac', 'center'); return; }
    const { width, height, pivotX, bottom, sourceFacing } = getXenoTrialsRenderMetricsV110(fighter.id, fighter.variant, displayScale);
    const timeSeconds = match.tick * XENO_TRIALS_STEP_V96;
    const swarmView = swarmMotion(fighter, timeSeconds);
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
    let pose=exitView ? sampleXenoTrialsExitPoseV157(rig,exitView,{width,height,pivotX,bottom},reducedMotion) : cue && (sequenceCue ? sampleXenoTrialsSequenceV155(rig,cue,reducedMotion) : sampleXenoTrialsRigV154(rig,cue,reducedMotion));
    if(!exitView&&!sequenceCue)pose=sampleXenoTrialsPreparationV163(rig,pose,cue,reducedMotion);
    if(captureViewV163?.attacker===fighter&&(captureViewV163.record.phase==='capture'||captureViewV163.captorRecovery)&&!exitView&&!sequenceCue)pose=captureViewV163.captorPose;
    context.save();
    if(fighter.hitFlash>0) context.globalAlpha*=.65;
    // Native plates have no authored back-facing turn. A short, stationary
    // cross-dissolve changes facing before the first measured step.
    if(exitView&&exitView.fromFacing!==drawFacing&&exitView.turn<1){
      context.globalAlpha=1-exitView.turn;
      const flip=exitView.fromFacing===sourceFacing?1:-1;
      context.save();context.translate(drawX,ground);context.scale(flip,1);
      context.drawImage(image,-width*pivotX,-height*bottom,width,height);context.restore();
      context.globalAlpha=exitView.turn;
    }
    const atlasDrawn=captureViewV163?.target===fighter&&!exitView&&!sequenceCue
      &&drawXenoTrialsCaptureTargetV163(context,images.get(captureViewV163.atlas.path),captureViewV163);
    const reactionBlocked = Boolean(atlasDrawn || exitView || sequenceCue || captureViewV163 || presentationView().blocksSimulation);
    const reactionCue = preparedReaction || (hordeProtocol && match.result && fighter.hp <= 0 ? { state: 'ko', progress: 1 } : null) || reactions(match, fighter, {
      blocked: reactionBlocked,
      spec: fighter.attack && getXenoTrialsAttackV147(definition, fighter.attack.kind, XENO_TRIALS_ATTACKS_V96[fighter.attack.kind]) });
    const drawnSpriteV191 = !reactionBlocked && drawXenoTrialsSpriteAtlasV191(context, fighter, art, images,
      { tick: match.tick, cue: reactionCue, moving, distance: swarmView?.distance || 0, timeSeconds,
        spec: fighter.attack && getXenoTrialsAttackV147(definition, fighter.attack.kind, XENO_TRIALS_ATTACKS_V96[fighter.attack.kind]),
        metrics: { width, height, pivotX, bottom, sourceFacing }, x: drawX, y: ground, facing: drawFacing, reducedMotion });
    const drawnSpriteV189 = !drawnSpriteV191 && !reactionBlocked && drawXenoTrialsSpriteAtlasV189(context, fighter, art, images,
      { cue: reactionCue, moving, distance: swarmView?.distance || 0, timeSeconds,
        spec: fighter.attack && getXenoTrialsAttackV147(definition, fighter.attack.kind, XENO_TRIALS_ATTACKS_V96[fighter.attack.kind]),
        metrics: { width, height, pivotX, bottom, sourceFacing }, x: drawX, y: ground, facing: drawFacing, reducedMotion });
    const drawnSpriteV188 = !drawnSpriteV191 && !drawnSpriteV189 && !reactionBlocked && drawXenoTrialsSpriteAtlasV188(context, fighter, art, images,
      { cue: reactionCue, moving, distance: swarmView?.distance || 0, timeSeconds,
        spec: fighter.attack && getXenoTrialsAttackV147(definition, fighter.attack.kind, XENO_TRIALS_ATTACKS_V96[fighter.attack.kind]),
        metrics: { width, height, pivotX, bottom, sourceFacing }, x: drawX, y: ground, facing: drawFacing, reducedMotion });
    const reactionDrawn = !drawnSpriteV191 && !drawnSpriteV189 && !drawnSpriteV188 && !reactionBlocked && drawXenoTrialsReactionV186(context, fighter, art, image,
      { cue: reactionCue, metrics: { width, height, pivotX, bottom, sourceFacing }, x: drawX, y: ground, facing: drawFacing, reducedMotion });
    const swarmDrawn = !drawnSpriteV191 && !drawnSpriteV189 && !drawnSpriteV188 && !reactionDrawn && !atlasDrawn && !exitView && !sequenceCue && !captureViewV163
      && drawXenoTrialsSwarmSpriteV180(context, fighter, art, image, { ...swarmView,
        metrics: { width, height, pivotX, bottom, sourceFacing },
        spec: fighter.attack && getXenoTrialsAttackV147(definition, fighter.attack.kind, XENO_TRIALS_ATTACKS_V96[fighter.attack.kind]),
        x: drawX, y: ground, facing: drawFacing, reducedMotion,
        blocked: presentationView().blocksSimulation || match.phase !== 'active' });
    const rigDrawn=atlasDrawn||drawnSpriteV191||drawnSpriteV189||drawnSpriteV188||reactionDrawn||swarmDrawn||pose && drawXenoTrialsRigV154(context,rig,image,pose,{width,height,pivotX,bottom},drawX,ground,drawFacing);
    context.restore();
    if(rigDrawn) rigDrawsV154.set(fighter.instanceIdV180 || fighter.side,{...rigDrawn,
      ...(captureViewV163?.attacker===fighter&&(captureViewV163.record.phase==='capture'||captureViewV163.captorRecovery)?{captureV163:getXenoTrialsCaptureReceiptV163(captureViewV163,'captor')}:{}),
      ...(!drawnSpriteV191&&pose?.preparationV163?{preparationV163:{...pose.preparationV163}}:{}),
      ...(exitView?{exitV157:{...exitView,stepped:rigDrawn?.clip==='spatial-exit-v157',pose:pose?.exitPoseV157||null}}:{}),
      ...(pose?.sequenceIdV155 ? {sequenceIdV155:pose.sequenceIdV155,beatV155:pose.beatV155,animation:pose.animation,...(pose.sequenceIdV156?{sequenceIdV156:pose.sequenceIdV156}:{})} : {})});
    const attackDrawn = !rigDrawn && canShowAttack && drawEnemyImportAttackV109(context, art, images, {
      attack: fighter.attack, spec: getXenoTrialsAttackV147(definition, fighter.attack?.kind, XENO_TRIALS_ATTACKS_V96[fighter.attack?.kind]), reducedMotion,
      height, x: fighter.x, y: ground, facing: fighter.attack?.facing,
      maxHorizontalExtent: null
    });
    const animated = rigDrawn || attackDrawn || drawEnemyImportAnimationV107(context, art, images, {
      action: moving ? 'move' : 'idle', timeSeconds, height, x: drawX, y: ground, facing: drawFacing,
      maxHorizontalExtent: null,
      reducedMotion
    });
    if (!animated) {
      const flip = drawFacing === sourceFacing ? 1 : -1;
      context.save(); context.translate(drawX, ground); context.scale(flip, 1);
      if(exitView&&exitView.fromFacing!==drawFacing&&exitView.turn<1)context.globalAlpha=exitView.turn;
      if (fighter.hitFlash > 0) context.globalAlpha = .65;
      context.drawImage(image, -width * pivotX, -height * bottom, width, height); context.restore();
    }
    if(exitView)return;
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
    if (hordeProtocol && fighter.side === 'opponent' && fighter.hp > 0) {
      const x = body.center + drawX - fighter.x, y = ground - body.height - 10;
      context.fillStyle = '#061019'; context.fillRect(x - 21, y, 42, 4);
      context.fillStyle = '#dfb776'; context.fillRect(x - 21, y, 42 * clamp(fighter.hp / fighter.maxHpV180, 0, 1), 4);
    }
  }
  function render() {
    if (stopped) return;
    reactions.refresh(match);
    rigDrawsV154.clear();
    captureViewV163=(!hordeProtocol&&!exitV157&&!outroPlaying()&&!presentationView().blocksSimulation)?getXenoTrialsCaptureViewV163(match,images,reduceMotion()):null;
    if(!exitV157)cameraView = camera.update(match.fighters, frameDelta); frameDelta = 0;
    canvas.setAttribute?.('data-xeno-camera-zoom-v119', String(cameraView.zoom));
    drawArena();
    context.save(); context.translate(cameraView.translateX, cameraView.translateY); context.scale(cameraView.zoom, cameraView.zoom);
    drawXenoTrialsOperationV188(context, match, XENO_TRIALS_ARENA_V96, { plane: 'rear' });
    drawXenoTrialsStageHazardsV188(context, match, XENO_TRIALS_ARENA_V96, { plane: 'rear', reducedMotion: reduceMotion() });
    drawXenoTrialsAcidV152(context, match, XENO_TRIALS_ARENA_V96, reduceMotion());
    if (hordeProtocol && !presentationView().blocksSimulation) for (const ghost of defeatedBodiesV186()) {
      context.save(); context.globalAlpha *= ghost.opacity; drawFighter(ghost.fighter, ghost.cue); context.restore();
    }
    for (const fighter of [...match.fighters].sort((a, b) => captureViewV163
      ? Number(a===captureViewV163.attacker)-Number(b===captureViewV163.attacker) : a.y-b.y)) drawFighter(fighter);
    if (!hordeProtocol) drawXenoTrialsGrappleV153(context, match, getXenoTrialsBodyBoundsV105, XENO_TRIALS_ARENA_V96.floor,
      {showLegacyContactLine:!Boolean(captureViewV163&&rigDrawsV154.get(captureViewV163.target.side)?.captureV163)});
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
    drawXenoTrialsOperationV188(context, match, XENO_TRIALS_ARENA_V96, { plane: 'front' });
    drawXenoTrialsStageHazardsV188(context, match, XENO_TRIALS_ARENA_V96, { plane: 'front', reducedMotion: reduceMotion() });
    context.restore();
    if (!getXenoTrialsStageSceneV190(stage.id)?.replacesArena) drawXenoTrialsArenaOverlayV119(context, stage, cameraView, reduceMotion() ? 0 : match.tick,
      { images, reducedMotion: reduceMotion(), phase: match.phase, phaseTime: match.phaseTime, roundWinner: match.roundWinner });
    stageSceneFrontV190 = drawXenoTrialsStageFrontV190(context, stage, images, cameraView, match.tick,
      { reducedMotion: reduceMotion(), phase: match.phase, phaseTime: match.phaseTime });
    if (hordeProtocol && options.htmlHud !== true) {
      const player = match.fighters[0], def = getXenoTrialsFighterV96(player.id), horde = match.hordeV180;
      text(`OPÉRATEUR / ${def.label}`, 30, 31, 17); bar(30, 44, 350, player.hp / def.hp, '#6bd4c5');
      text(`PV ${Math.ceil(player.hp)} · VAGUE ${horde.wave}/${horde.waveCount}`, 30, 95, 14);
      text(`CONTACTS ${horde.alive} · NEUTRALISÉS ${horde.totalKills}/${horde.totalEnemies}`, 970, 31, 15, '#edba74', 'right');
      text(`${Math.ceil(match.timeRemaining)} s`, 970, 61, 24, '#eee3bd', 'right');
      const boss = getXenoTrialsHordeBossViewV186(hordeProtocol, horde, match.fighters);
      if (boss && ['active', 'incoming'].includes(boss.phase)) {
        const definition = getXenoTrialsFighterV96(boss.fighterId);
        text(`CONTACT MAJEUR / ${definition.label} · ${Math.ceil(boss.hp)} PV`, 970, 106, 14, '#ffb875', 'right');
        bar(585, 119, 385, boss.hp / boss.maxHp, '#ce7857');
      }
    }
    if (!hordeProtocol && options.htmlHud !== true) match.fighters.forEach((fighter, i) => {
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
    if (!hordeProtocol && options.htmlHud !== true) {
      text(`${Math.ceil(match.timeRemaining)}`, 500, 61, 32, '#eee3bd', 'center');
      text(`MANCHE ${match.round}`, 500, 96, 12, '#b4c4d2', 'center');
    }
    const intro = presentationView();
    // A short round can finish before the fight signal fades. Terminal and
    // intermission frames must never freeze that announcement over the result.
    const showPresentation = loaded && !match.paused && match.phase === 'active';
    if (showPresentation && intro.fighterSlot !== null) {
      const fighter = match.fighters[intro.fighterSlot], def = getXenoTrialsFighterV96(fighter.id);
      // Keep the introduction below the support plane: tall specimens must
      // remain visible at their native scale throughout their presentation.
      context.fillStyle = '#061019df'; context.fillRect(200, 472, 600, 72);
      text(`${intro.fighterSlot === 0 ? 'VOTRE SPÉCIMEN' : 'ADVERSAIRE'} / ${def.label.toUpperCase()}`, 500, 500, 24, stage.accent, 'center', 570);
      const family = { synthetic: 'SYNTHÉTIQUE', pathogen: 'PATHOGÈNE', xenomorph: 'XÉNOMORPHE', engineer: 'INGÉNIEUR', human: 'HUMAIN', hybrid: 'HYBRIDE' }[def.family];
      const role = { balanced: 'POLYVALENT', agile: 'MOBILE', tank: 'DÉFENSIF', ranged: 'DISTANCE' }[def.role];
      text(`${def.hp} PV  •  ${family}  •  ${role}`, 500, 528, 15, '#d4e1e7', 'center', 570);
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
    if (match.phase === 'match-over') { if(outroV155)outroV155 = {...outroV155,paused:true}; if(terminalV156)terminalV156={...terminalV156,paused:true}; if(exitV157)exitV157={...exitV157,paused:true}; if(landingV157)landingV157={...landingV157,paused:true}; }
    else setXenoTrialsPausedV96(match,true);
    previousTime = null; frameDelta = 0;
    if (raf !== null) cancelFrame(raf); raf = null;
    sound.pause();
    checkpointNow('pause'); armPausedGamepad();
    notify(true); render(); return true;
  }
  function resume() {
    if (stopped || !isPaused() || !loaded || assetFailure || !windowAvailable()
      || match.phase === 'match-over' && !outroPlaying()) return false;
    clearInputs();
    if (gamepadRaf !== null) cancelFrame(gamepadRaf); gamepadRaf = null;
    if (match.phase === 'match-over') { if(outroV155)outroV155 = {...outroV155,paused:false}; if(terminalV156)terminalV156={...terminalV156,paused:false}; if(exitV157)exitV157={...exitV157,paused:false}; if(landingV157)landingV157={...landingV157,paused:false}; }
    else setXenoTrialsPausedV96(match,false);
    sound.resume(match);
    previousTime = null; canvas.focus?.({preventScroll:true}); notify(true);
    if (!stopped && running && raf === null) raf = requestFrame(frame);
    return !stopped;
  }
  function skipSequence() {
    if (stopped || !loaded || assetFailure || isPaused() || !windowAvailable()) return false;
    let changed = false;
    if (outroPlaying()) {
      outroV155 = skipXenoTrialsOutroV155(outroV155); terminalV156=skipXenoTrialsOutroV155(terminalV156); exitV157=skipXenoTrialsOutroV155(exitV157); landingV157=skipXenoTrialsOutroV155(landingV157); running = false; changed = true;
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
    if (hordeProtocol || !acceptsControls() || tauntV156?.phase === 'playing') return false;
    const next=createXenoTrialsTauntV156(match,presentationView(),controls(),reduceMotion());
    if(!next)return false;
    tauntV156=next; render(); notify(true); return !stopped;
  }
  function keydown(event) {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
    const tag = String(event.target?.tagName || '').toLowerCase();
    if (['input', 'select', 'textarea'].includes(tag) || event.target?.isContentEditable
      || event.target?.closest?.('input, select, textarea, [contenteditable]:not([contenteditable="false"])')) return;
    if (!event.repeat && (KEY_ACTION[event.code] || ['KeyP', 'Escape', 'KeyT'].includes(event.code))) void sound.unlock(event);
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
    listen(host, 'focus', () => { if (isPaused()) { pollGamepad(); armPausedGamepad(); } });
    listen(host, 'pagehide', () => { if (!pause()) checkpointNow('pagehide'); });
    listen(host, 'gamepadconnected', () => { pollGamepad(); armPausedGamepad(); });
    listen(doc, 'visibilitychange', () => { if (doc.hidden) pause(); });
    listen(doc, 'focusin', event => {
      const target = event.target, control = target?.closest?.('[data-xeno-action]');
      const returning = target?.closest?.('[data-xt="return"]');
      if (returning) {
        // Return must remain activatable by both pointer and Tab/Enter. Drop
        // held combat inputs without inserting a modal over its own action.
        for (const key of heldKeys) blockedKeys.add(key);
        clearInputs();
      }
      // Accessible combat buttons are gameplay inputs. Pause/resume buttons
      // own their explicit click; focusing one must not toggle it twice.
      if (target === canvas || returning || control && options.controlsRoot?.contains(control)
        || target?.closest?.('[data-xt="pause"], [data-xt="resume-overlay"], [data-xt="skip-sequence"], [data-xt="taunt"]')) return;
      pause();
    });
    listen(canvas, 'pointerdown', event => { void sound.unlock(event); canvas.focus?.({ preventScroll: true }); });
    const root = options.controlsRoot;
    listen(root, 'keydown', event => {
      if (!['Space', 'Enter'].includes(event.code) || event.ctrlKey || event.metaKey || event.altKey) return;
      const button = event.target?.closest?.('[data-xeno-action]');
      const action = button?.getAttribute('data-xeno-action');
      if (!ACTIONS.has(action) || !root.contains(button)) return;
      event.preventDefault?.(); event.stopPropagation?.();
      if (!event.repeat && acceptsControls()) { void sound.unlock(event); buttonKeys.set(event.code, action); }
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
      void sound.unlock(event);
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
    pollGamepad();
    if (stopped || !running || isPaused()) return;
    // Also cover a missed browser blur event without accumulating elapsed debt.
    if (!windowAvailable()) { pause(); return; }
    if (stopped) return;
    const dt = previousTime === null ? 0 : clamp((timestamp - previousTime) / 1000, 0, .25);
    frameDelta = dt;
    previousTime = timestamp;
    if (match.phase === 'match-over' && (outroV155 || terminalV156 || exitV157 || landingV157)) {
      // A separate finite presentation clock. The completed engine/result are
      // immutable; the result callback was already delivered before this frame.
      frameDelta = 0;
      if (reduceMotion()) {
        if(outroV155)outroV155 = {...skipXenoTrialsOutroV155(outroV155),reducedMotion:true};
        if(terminalV156)terminalV156 = {...skipXenoTrialsOutroV155(terminalV156),reducedMotion:true};
        if(exitV157)exitV157={...skipXenoTrialsOutroV155(exitV157),reducedMotion:true};
        if(landingV157)landingV157={...skipXenoTrialsOutroV155(landingV157),reducedMotion:true};
      } else {
        // Landing has its own result-owned render clock and runs alongside the
        // historical grounded clips. Two airborne rigs need no fabricated V156
        // terminal: this completed V157 owner admits their spatial exit itself.
        if(landingV157?.phase==='playing')landingV157=advanceXenoTrialsOutroV155(landingV157,dt*1000);
        if(exitV157?.phase==='playing')exitV157=advanceXenoTrialsOutroV155(exitV157,dt*1000);
        else if(terminalV156?.phase==='playing'){
          terminalV156=advanceXenoTrialsOutroV155(terminalV156,dt*1000);
          if(terminalV156.phase==='complete')exitV157=createXenoTrialsExitV157(match,terminalV156,cameraView,false,landingV157);
        } else if(outroV155?.phase==='playing'){
          outroV155=advanceXenoTrialsOutroV155(outroV155,dt*1000);
          if(outroV155.phase==='complete')terminalV156=createXenoTrialsTerminalV156(match,'outro',false,outroV155);
        } else if(!outroV155&&!terminalV156&&landingV157?.phase==='complete'&&!exitV157){
          exitV157=createXenoTrialsExitV157(match,null,cameraView,false,landingV157);
        }
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
      if (match.phase === 'match-over' && !hordeProtocol) {
        outroV155 = createXenoTrialsOutroV155(match,reduceMotion()); terminalV156=createXenoTrialsTerminalV156(match,'draw',reduceMotion()); landingV157=createXenoTrialsLandingV157(match,reduceMotion()); tauntV156=null; frameDelta = 0; clearInputs();
      }
      checkpointNow();
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
      const preloadFighters = hordeProtocol ? [match.fighters[0], ...hordeProtocol.opponentIds.map(id => ({ id }))] : match.fighters;
      const paths = [...new Set(preloadFighters.map(f => getXenoTrialsArtV96(f.id, f.variant).path))];
      const allPaths = [...new Set([...paths,...(stage.backdrop?[stage.backdrop]:[]),...getXenoTrialsStageAssetsV180(stage.id),...getXenoTrialsStageAssetsV190(stage.id),
        ...(hordeProtocol ? [] : getXenoTrialsCaptureAssetsV163(match.fighters))])];
      const results = await Promise.allSettled(allPaths.map(async path => {
        const image = await loadImage(path);
        // Apply the same validation to native and injected loaders. A resolved
        // promise with no decodable fighter is not a successful admission.
        if (!(image?.naturalWidth > 0 && image?.naturalHeight > 0)) throw new Error(`Visuel vide: ${path}`);
        if (!stopped) images.set(path, image);
      }));
      if (stopped) return false;
      // Missing scenery is cosmetic; missing fighter art still suspends the duel.
      for (const fighter of preloadFighters) {
        const art = getXenoTrialsArtV96(fighter.id, fighter.variant);
        requestEnemyImportAnimationV107(images, art, loadImage, () => !stopped);
        requestEnemyImportAttackV109(images, art, loadImage, () => !stopped);
      }
      await Promise.allSettled(preloadFighters.map(fighter => requestXenoTrialsSpriteAtlasV188(images, fighter,
        getXenoTrialsArtV96(fighter.id, fighter.variant), loadImage, () => !stopped)));
      await Promise.allSettled(preloadFighters.map(fighter => requestXenoTrialsSpriteAtlasV189(images, fighter,
        getXenoTrialsArtV96(fighter.id, fighter.variant), loadImage, () => !stopped)));
      await Promise.allSettled(preloadFighters.map(fighter => requestXenoTrialsSpriteAtlasV191(images, fighter,
        getXenoTrialsArtV96(fighter.id, fighter.variant), loadImage, () => !stopped)));
      if (stopped) return false;
      loaded = true; assetFailure = results.slice(0, paths.length).some(r => r.status === 'rejected');
      if (assetFailure) { setXenoTrialsPausedV96(match, true); options.onAssetError?.(paths.filter((path, i) => results[i].status === 'rejected')); }
      if (stopped) return false;
      registerInputs(); running = true; previousTime = null;
      if (!windowAvailable()) setXenoTrialsPausedV96(match, true);
      if (windowAvailable() && !match.paused) canvas.focus?.({ preventScroll: true });
      notify(true);
      if (stopped) return false;
      render(); if (!match.paused) raf = requestFrame(frame); else { pollGamepad(); armPausedGamepad(); } return !assetFailure;
    })();
    return loading;
  }
  function stop() {
    if (stopped) return;
    checkpointNow('stop'); sound.stop();
    stopped = true; running = false; outroV155 = null; terminalV156=null; tauntV156=null; exitV157=null; landingV157=null; clearInputs(); if (raf !== null) cancelFrame(raf); raf = null;
    if (gamepadRaf !== null) cancelFrame(gamepadRaf); gamepadRaf = null; reactions.clear();
    for (const cancel of [...pendingLoads]) cancel();
    for (const remove of listeners.splice(0)) remove(); images.clear(); rigDrawsV154.clear(); captureViewV163=null;
    canvas.width = originalSize.width; canvas.height = originalSize.height;
  }
  return Object.freeze({ start, pause, resume, stop, skipSequence, taunt,
    unlockAudio(event) { return !stopped ? sound.unlock(event) : Promise.resolve(false); },
    setAudioEnabled(value) { if (!stopped) { sound.setEnabled(value); notify(true); } },
    exit() { if (exited || stopped) return; exited = true; stop(); options.onExit?.(); },
    setInput(action, pressed) {
      if (!ACTIONS.has(action)) return;
      if (pressed !== true) { virtual[action] = false; releaseXenoTrialsControlsV150(match, 'player', controls()); }
      else if (acceptsControls()) virtual[action] = true;
    },
    getState() { return snapshot(); },
    saveCheckpoint() { return checkpointNow('manual'); },
    nextRound() {
      if (stopped || match.paused) return false;
      const changed = nextXenoTrialsRoundV96(match);
      if (changed) { presentation = createXenoPresentationV97(match.round); tauntV156=null; for (const key of heldKeys) blockedKeys.add(key); clearInputs(); notify(true); render(); }
      return changed;
    }
  });
}
