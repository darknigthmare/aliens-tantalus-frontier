import { getXenoTrialsFighterV96, getXenoTrialsArtV96, XENO_TRIALS_STAGES_V96 } from './xeno-trials-data-v96.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, setXenoTrialsPausedV96,
  getXenoTrialsSnapshotV96, nextXenoTrialsRoundV96, XENO_TRIALS_ARENA_V96, XENO_TRIALS_ATTACKS_V96, XENO_TRIALS_STEP_V96 } from './xeno-trials-engine-v96.js';
import { createXenoPresentationV97, getXenoPresentationViewV97, advanceXenoPresentationV97 } from './xeno-trials-presentation-v97.js';
import { getXenoTrialsRenderMetricsV105, getXenoTrialsBodyBoundsV105 } from './xeno-trials-geometry-v105.js';
import { getEnemyImportAnimationV107, requestEnemyImportAnimationV107, drawEnemyImportAnimationV107,
  createEnemyImportMotionTrackerV107, isEnemyImportAnimationImageReadyV107 } from './enemy-import-animation-v107.js';
import { getEnemyImportAttackV109, requestEnemyImportAttackV109, drawEnemyImportAttackV109 } from './enemy-import-attacks-v109.js';

const KEY_ACTION = Object.freeze({ ArrowLeft: 'left', KeyQ: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  ArrowUp: 'jump', KeyZ: 'jump', KeyW: 'jump', Space: 'jump', ArrowDown: 'guard', KeyS: 'guard', KeyJ: 'light', KeyK: 'heavy', KeyL: 'special' });
const ACTIONS = new Set(Object.values(KEY_ACTION));
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

/** Fixed-scale whole-PNG layout; no crop, stretch or fake animation frames. */
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
  let presentation = createXenoPresentationV97();
  const presentationView = () => getXenoPresentationViewV97(presentation);
  const snapshot = () => ({ ...getXenoTrialsSnapshotV96(match), presentation: presentationView(),
    stageVisual: !stage.backdrop ? 'procedural' : images.has(stage.backdrop) ? 'backdrop-ready' : loaded ? 'procedural-fallback' : 'loading' });
  const images = new Map(), heldKeys = new Set(), blockedKeys = new Set(), heldPointers = new Map(), pendingLoads = new Set(), virtual = {}, listeners = [];
  const observedMovement = createEnemyImportMotionTrackerV107();
  let running = false, stopped = false, loaded = false, loading = null, raf = null, previousTime = null;
  let emittedResult = false, notifyElapsed = 0, lastStatus = '', assetFailure = false;
  const originalSize = { width: canvas.width, height: canvas.height };
  const stage = XENO_TRIALS_STAGES_V96.find(s => s.id === match.config.stageId);
  canvas.width = XENO_TRIALS_ARENA_V96.width; canvas.height = XENO_TRIALS_ARENA_V96.height;
  canvas.tabIndex = 0; canvas.setAttribute?.('aria-label', 'Xeno Trials : duel 2D. Flèches pour se déplacer, J K L pour attaquer, S pour la garde, P pour la pause.');

  function listen(target, type, handler, settings) {
    if (!target?.addEventListener) return;
    target.addEventListener(type, handler, settings); listeners.push(() => target.removeEventListener(type, handler, settings));
  }
  function clearInputs() { heldKeys.clear(); heldPointers.clear(); for (const key of ACTIONS) virtual[key] = false; }
  function controls() {
    const result = { ...virtual };
    for (const key of heldKeys) result[KEY_ACTION[key]] = true;
    for (const action of heldPointers.values()) result[action] = true;
    return result;
  }
  function statusText() {
    if (assetFailure) return 'Combat suspendu : visuel dédié indisponible. Rechargez pour réessayer.';
    if (match.paused) return 'Simulation en pause. Reprendre avec P ou le bouton Reprendre.';
    if (presentationView().fighterSlot !== null) return `Présentation : ${getXenoTrialsFighterV96(match.fighters[presentationView().fighterSlot].id).label}`;
    if (presentationView().countdown) return `Manche ${match.round} : ${presentationView().countdown}`;
    if (match.phase === 'intro') return `Manche ${match.round} : préparez-vous.`;
    if (match.phase === 'round-over') return `Manche ${match.round} : ${match.roundWinner === 'draw' ? 'égalité' : match.roundWinner === 'player' ? 'victoire' : 'défaite'}. Manche suivante en préparation.`;
    if (match.phase === 'match-over') return match.result.winner === 'player' ? 'Simulation terminée : victoire.' : match.result.winner === 'opponent' ? 'Simulation terminée : défaite.' : 'Simulation terminée : égalité.';
    return `Manche ${match.round}, ${Math.ceil(match.timeRemaining)} secondes. Santé ${Math.ceil(match.fighters[0].hp)} contre ${Math.ceil(match.fighters[1].hp)}.`;
  }
  function notify(force = false) {
    if (!force && notifyElapsed < .12) return;
    notifyElapsed = 0;
    const status = statusText();
    if (options.statusElement && status !== lastStatus) options.statusElement.textContent = status;
    lastStatus = status;
    options.onState?.(snapshot());
    if (match.result && !emittedResult) { emittedResult = true; options.onResult?.({ ...match.result, wins: { ...match.result.wins }, playerStats: { ...match.result.playerStats }, opponentStats: { ...match.result.opponentStats } }); }
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
    context.fillStyle = stage.background; context.fillRect(0, 0, 1000, 560);
    context.fillStyle = '#0a1019'; context.fillRect(0, 135, 1000, 280);
    context.strokeStyle = stage.accent; context.globalAlpha = .28; context.lineWidth = 2;
    for (let x = 45; x < 1000; x += 130) {
      context.strokeRect(x, 136, 94, 276); context.beginPath(); context.moveTo(x, 272); context.lineTo(x + 94, 272); context.stroke();
    }
    context.globalAlpha = 1;
    const backdrop = images.get(stage.backdrop);
    if (backdrop?.naturalWidth > 0 && backdrop?.naturalHeight > 0) {
      // Fit without stretching. The shared floor and collision plane stay unchanged.
      const scale = Math.max(1000 / backdrop.naturalWidth, 450 / backdrop.naturalHeight);
      const width = backdrop.naturalWidth * scale, height = backdrop.naturalHeight * scale;
      context.drawImage(backdrop, (1000 - width) / 2, (450 - height) / 2, width, height);
      context.fillStyle = '#06101940'; context.fillRect(0, 0, 1000, 450);
    }
    context.fillStyle = stage.floor; context.fillRect(0, 450, 1000, 110);
    context.fillStyle = stage.accent; context.fillRect(0, 449, 1000, 3);
    context.strokeStyle = '#5e6972'; context.globalAlpha = .2;
    for (let x = -200; x < 1200; x += 90) { context.beginPath(); context.moveTo(x, 450); context.lineTo(x - 70, 560); context.stroke(); }
    context.globalAlpha = 1;
    text('WEYLAND-YUTANI  /  XENO TRIALS', 30, 128, 12, stage.accent);
    const hasWalk = match.fighters.some(f => {
      const animation = getEnemyImportAnimationV107(getXenoTrialsArtV96(f.id, f.variant));
      return animation && isEnemyImportAnimationImageReadyV107(images.get(animation.path), animation);
    });
    const hasAttack = match.fighters.some(f => {
      const animation = getEnemyImportAttackV109(getXenoTrialsArtV96(f.id, f.variant));
      return animation && isEnemyImportAnimationImageReadyV107(images.get(animation.path), animation);
    });
    text(hasAttack ? 'JOE : MARCHE / FRAPPE LÉGÈRE ADAPTÉES • AUTRES ACTIONS FIXES'
      : hasWalk ? 'MARCHE ADAPTÉE • AUTRES ACTIONS FIXES' : 'SIMULATION • ADAPTATION DU PROJET • POSES FIXES', 970, 535, 11, '#b6bcc5', 'right');
    text(stage.label.toUpperCase(), 500, 482, 13, '#aebec7', 'center');
    if (stage.backdrop && loaded && !backdrop) text('DÉCOR INDISPONIBLE · FOND PROCÉDURAL', 30, 513, 11, '#ddbf69');
  }
  function drawFighter(fighter) {
    const definition = getXenoTrialsFighterV96(fighter.id), art = getXenoTrialsArtV96(fighter.id, fighter.variant);
    const image = images.get(art.path), ground = 450 - fighter.y;
    const body = getXenoTrialsBodyBoundsV105(fighter);
    context.fillStyle = '#0008'; context.beginPath(); context.ellipse(body.center, 454, body.width * .68, 11, 0, 0, Math.PI * 2); context.fill();
    if (!image) { text('Visuel indisponible', fighter.x, ground - 90, 12, '#f0b6ac', 'center'); return; }
    const { width, height, pivotX, bottom, sourceFacing } = getXenoTrialsRenderMetricsV96(fighter.id, fighter.variant);
    const timeSeconds = match.tick * XENO_TRIALS_STEP_V96;
    const displaced = observedMovement(fighter, timeSeconds);
    const moving = displaced && (Boolean(fighter.previousInput?.left) !== Boolean(fighter.previousInput?.right))
      && fighter.hp > 0 && !fighter.attack && !fighter.guard && fighter.stun <= 0
      && fighter.hitFlash <= 0 && fighter.y === 0 && match.phase === 'active';
    const reducedMotion = options.reducedMotion === true || host?.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true
      || doc?.documentElement?.classList?.contains?.('reduced-motion') === true;
    // The engine owns the attack clock and locked facing. Art cannot restart an
    // attack, extend its active window or change collision/damage/save data.
    const canShowAttack = fighter.hp > 0 && fighter.y === 0 && fighter.stun <= 0
      && fighter.hitFlash <= 0 && !fighter.guard && match.phase === 'active';
    const attackDrawn = canShowAttack && drawEnemyImportAttackV109(context, art, images, {
      attack: fighter.attack, spec: XENO_TRIALS_ATTACKS_V96[fighter.attack?.kind], reducedMotion,
      height, x: fighter.x, y: ground, facing: fighter.attack?.facing,
      maxHorizontalExtent: XENO_TRIALS_ARENA_V96.left - 2
    });
    const animated = attackDrawn || drawEnemyImportAnimationV107(context, art, images, {
      action: moving ? 'move' : 'idle', timeSeconds, height, x: fighter.x, y: ground, facing: fighter.facing,
      maxHorizontalExtent: XENO_TRIALS_ARENA_V96.left - 2,
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
    if (fighter.attack) {
      const attack = fighter.attack, spec = XENO_TRIALS_ATTACKS_V96[attack.kind], windowStart = spec.startup;
      if (attack.age >= windowStart && attack.age < windowStart + .12) {
        context.strokeStyle = attack.kind === 'special' ? '#bbf280' : '#f9d5a2'; context.lineWidth = attack.kind === 'light' ? 2 : 4;
        const face = attack.facing > 0 ? body.right : body.left, reach = spec.reach * definition.reach;
        context.beginPath(); context.moveTo(face, ground - body.height * .85);
        context.quadraticCurveTo(face + attack.facing * reach, ground - body.height * .55,
          face + attack.facing * reach * .5, ground - body.height * .15); context.stroke();
      }
    }
    if (fighter.stun > .4) text('GARDE BRISÉE', fighter.x, ground - height * bottom - 12, 12, '#ffb86b', 'center');
  }
  function render() {
    if (stopped) return;
    drawArena();
    for (const fighter of [...match.fighters].sort((a, b) => a.y - b.y)) drawFighter(fighter);
    for (const projectile of match.projectiles) {
      context.fillStyle = projectile.style === 'acid' ? '#c1f078' : '#a7dafa';
      context.beginPath(); context.ellipse(projectile.x, 450 - projectile.y, 13, 7, 0, 0, Math.PI * 2); context.fill();
    }
    match.fighters.forEach((fighter, i) => {
      const def = getXenoTrialsFighterV96(fighter.id), x = i === 0 ? 30 : 585;
      text(`${i === 0 ? 'VOUS' : 'ADVERSAIRE'} / ${def.label}`, i === 0 ? 30 : 970, 31, 17, '#e4e9eb', i === 0 ? 'left' : 'right', 385);
      bar(x, 44, 385, fighter.hp / def.hp, i === 0 ? '#6bd4c5' : '#ed858e', i === 1);
      bar(x, 65, 385, fighter.stamina / def.stamina, '#ddbf69', i === 1);
      text(`PV ${Math.ceil(fighter.hp)} / ${def.hp}  •  END ${Math.floor(fighter.stamina)}`, i === 0 ? 30 : 970, 99, 12, '#bfc9d0', i === 0 ? 'left' : 'right');
      const wins = match.wins[fighter.side];
      for (let n = 0; n < match.config.roundsToWin; n++) { context.fillStyle = n < wins ? '#fae5a3' : '#424c58'; context.fillRect(i === 0 ? 426 + n * 15 : 559 - n * 15, 44, 10, 10); }
    });
    text(`${Math.ceil(match.timeRemaining)}`, 500, 61, 32, '#eee3bd', 'center');
    text(`MANCHE ${match.round}`, 500, 96, 12, '#b4c4d2', 'center');
    const intro = presentationView();
    if (loaded && !match.paused && intro.fighterSlot !== null) {
      const fighter = match.fighters[intro.fighterSlot], def = getXenoTrialsFighterV96(fighter.id);
      context.fillStyle = '#061019df'; context.fillRect(200, 150, 600, 90);
      text(`${intro.fighterSlot === 0 ? 'VOTRE SPÉCIMEN' : 'ADVERSAIRE'} / ${def.label.toUpperCase()}`, 500, 185, 24, stage.accent, 'center', 570);
      const family = { synthetic: 'SYNTHÉTIQUE', pathogen: 'PATHOGÈNE', xenomorph: 'XÉNOMORPHE', engineer: 'INGÉNIEUR', human: 'HUMAIN' }[def.family];
      const role = { balanced: 'POLYVALENT', agile: 'MOBILE', tank: 'DÉFENSIF', ranged: 'DISTANCE' }[def.role];
      text(`${def.hp} PV  •  ${family}  •  ${role}`, 500, 218, 15, '#d4e1e7', 'center', 570);
      context.strokeStyle = stage.accent; context.lineWidth = 3; context.strokeRect(fighter.x - 145, 245, 290, 210);
    } else if (loaded && !match.paused && ['countdown', 'fight'].includes(intro.phase)) {
      text(intro.countdown ? String(intro.countdown) : 'COMBAT', 500, 235, 54, '#efe8cb', 'center');
    }
    if (!loaded || match.paused || match.phase !== 'active') {
      context.fillStyle = '#061019b8'; context.fillRect(150, 216, 700, 106);
      const heading = !loaded ? 'CHARGEMENT DES SPÉCIMENS' : assetFailure ? 'VISUEL INDISPONIBLE' : match.paused ? 'SIMULATION EN PAUSE' : match.phase === 'intro' ? `MANCHE ${match.round}` : match.phase === 'round-over' ? match.roundWinner === 'draw' ? 'ÉGALITÉ' : match.roundWinner === 'player' ? 'MANCHE REMPORTÉE' : 'MANCHE PERDUE' : match.result.winner === 'player' ? 'VICTOIRE' : match.result.winner === 'opponent' ? 'DÉFAITE' : 'ÉGALITÉ';
      text(heading, 500, 255, 25, '#efe8cb', 'center');
      text(assetFailure ? 'Rechargez le module pour réessayer.' : match.paused ? 'P / Échap ou bouton Reprendre' : match.phase === 'match-over' ? 'Résultat transmis au terminal.' : 'J frappe • K lourd • L spécial • S garde', 500, 290, 15, '#b6cbd2', 'center');
    }
  }
  function pause() {
    if (stopped) return;
    for (const key of heldKeys) blockedKeys.add(key);
    clearInputs(); setXenoTrialsPausedV96(match, true); previousTime = null; notify(true); render();
  }
  function resume() {
    if (stopped || !loaded || assetFailure || doc?.hidden) return false;
    clearInputs(); setXenoTrialsPausedV96(match, false); previousTime = null; canvas.focus?.({ preventScroll: true }); notify(true); return true;
  }
  function keydown(event) {
    const tag = String(event.target?.tagName || '').toLowerCase();
    if (['input', 'select', 'textarea'].includes(tag) || event.target?.isContentEditable) return;
    if (['KeyP', 'Escape'].includes(event.code)) {
      event.preventDefault?.(); if (!event.repeat) match.paused ? resume() : pause(); return;
    }
    if (KEY_ACTION[event.code]) {
      event.preventDefault?.();
      if (match.paused || presentationView().blocksSimulation) blockedKeys.add(event.code);
      else if (!match.paused && !blockedKeys.has(event.code)) heldKeys.add(event.code);
    }
  }
  function registerInputs() {
    listen(host, 'keydown', keydown);
    listen(host, 'keyup', event => { heldKeys.delete(event.code); blockedKeys.delete(event.code); });
    listen(host, 'blur', pause);
    listen(doc, 'visibilitychange', () => { if (doc.hidden) pause(); });
    listen(canvas, 'pointerdown', () => canvas.focus?.({ preventScroll: true }));
    const root = options.controlsRoot;
    listen(root, 'keydown', event => {
      if (!['Space', 'Enter'].includes(event.code)) return;
      const button = event.target?.closest?.('[data-xeno-action]');
      const action = button?.getAttribute('data-xeno-action');
      if (!ACTIONS.has(action) || !root.contains(button)) return;
      event.preventDefault?.(); event.stopPropagation?.();
      if (!event.repeat && !match.paused && !presentationView().blocksSimulation) virtual[action] = true;
    });
    listen(root, 'keyup', event => {
      if (!['Space', 'Enter'].includes(event.code)) return;
      const action = event.target?.closest?.('[data-xeno-action]')?.getAttribute('data-xeno-action');
      if (ACTIONS.has(action)) { virtual[action] = false; event.preventDefault?.(); event.stopPropagation?.(); }
    });
    listen(root, 'focusout', () => { for (const action of ACTIONS) virtual[action] = false; });
    listen(root, 'pointerdown', event => {
      const button = event.target?.closest?.('[data-xeno-action]');
      const action = button?.getAttribute('data-xeno-action');
      if (!ACTIONS.has(action) || !root.contains(button) || match.paused || presentationView().blocksSimulation) return;
      event.preventDefault?.(); heldPointers.set(event.pointerId, action); button.setPointerCapture?.(event.pointerId);
    });
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) listen(root, type, event => heldPointers.delete(event.pointerId));
  }
  function frame(timestamp) {
    if (stopped || !running) return;
    const dt = previousTime === null ? 0 : clamp((timestamp - previousTime) / 1000, 0, .25);
    previousTime = timestamp;
    const wasBlocking = presentationView().blocksSimulation, beforeRound = match.round;
    presentation = advanceXenoPresentationV97(presentation, dt * 1000, match.paused || doc?.hidden || !loaded);
    if (wasBlocking && !presentationView().blocksSimulation) clearInputs();
    // Intro/countdown never consume simulation ticks, AI, stamina or the round timer.
    if (!wasBlocking) stepXenoTrialsMatchV96(match, dt, controls());
    if (!match.paused && match.phase === 'round-over' && match.phaseTime <= 0) nextXenoTrialsRoundV96(match);
    if (match.round !== beforeRound) { presentation = createXenoPresentationV97(match.round); for (const key of heldKeys) blockedKeys.add(key); clearInputs(); }
    notifyElapsed += dt;
    render(); notify(match.phase === 'match-over' && !emittedResult);
    if (!stopped && running) raf = requestFrame(frame);
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
        if (!(image.naturalWidth > 0)) { fail(`Image vide: ${path}`); return; }
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
      const paths = [...new Set(match.fighters.map(f => getXenoTrialsArtV96(f.id, f.variant).path))];
      const allPaths = stage.backdrop ? [...paths, stage.backdrop] : paths;
      const results = await Promise.allSettled(allPaths.map(async path => {
        const image = await loadImage(path);
        if (path === stage.backdrop && !(image?.naturalWidth > 0 && image?.naturalHeight > 0)) throw new Error('Décor vide');
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
      registerInputs(); running = true; previousTime = null;
      if (doc?.hidden) setXenoTrialsPausedV96(match, true);
      canvas.focus?.({ preventScroll: true }); notify(true); render(); raf = requestFrame(frame); return !assetFailure;
    })();
    return loading;
  }
  function stop() {
    if (stopped) return;
    stopped = true; running = false; clearInputs(); if (raf !== null) cancelFrame(raf);
    for (const cancel of [...pendingLoads]) cancel();
    for (const remove of listeners.splice(0)) remove(); images.clear();
    canvas.width = originalSize.width; canvas.height = originalSize.height;
  }
  return Object.freeze({ start, pause, resume, stop,
    exit() { stop(); options.onExit?.(); },
    setInput(action, pressed) { if (ACTIONS.has(action) && !stopped && !match.paused && !presentationView().blocksSimulation) virtual[action] = pressed === true; },
    getState() { return snapshot(); },
    nextRound() {
      if (stopped || match.paused) return false;
      const changed = nextXenoTrialsRoundV96(match);
      if (changed) { presentation = createXenoPresentationV97(match.round); for (const key of heldKeys) blockedKeys.add(key); clearInputs(); notify(true); render(); }
      return changed;
    }
  });
}
