import { setNpcPortraitSourceV164, resolveHumanSpriteDrawableV164 } from './npc-matte-apertures-v164.js';

const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
};
const head = (crewId, slug, x, y, w, h) => ({ crewId,
  source: `/assets/openai/sprites/normalized/npcs/${slug}-locomotion-sheet.png`,
  sourceWidth: 1024, sourceHeight: 1024, frame: 0,
  crop: { x, y, w, h }, framing: 'head-and-shoulders', sourcePixelsChanged: false });

/** Individually reviewed head/shoulder windows in the unchanged native idle
 * cells. None reaches a waist, leg or neighbouring atlas cell. These are the
 * physical crew identities, not portraits borrowed from another speaker. */
export const NPC_DIALOGUE_PORTRAITS_V168 = freeze([
  head('crew-01-mara-vega', 'mara-vega', 91, 16, 74, 78),
  head('crew-02-tamsin-velez', 'tamsin-velez', 94, 11, 78, 78),
  head('crew-03-idris-kwan', 'idris-kwan', 104, 11, 76, 78),
  head('crew-04-noor-okafor', 'noor-okafor', 96, 10, 82, 82),
  head('crew-05-bishop-9', 'bishop-9', 102, 26, 76, 80),
  head('crew-06-rook', 'rook', 94, 10, 78, 80),
  head('crew-07-sanaa-doyle', 'sanaa-doyle', 91, 10, 82, 82),
  head('crew-08-maksim-orlov', 'maksim-orlov', 95, 9, 80, 82),
  head('crew-09-inez-harlow', 'inez-harlow', 89, 12, 80, 82),
  head('crew-10-david-8r', 'david-8r', 96, 10, 78, 82),
  head('crew-11-jun-park', 'jun-park', 94, 11, 82, 82),
  head('crew-12-asha-mbaye', 'asha-mbaye', 94, 10, 78, 82),
  head('crew-13-pablo-reyes', 'pablo-reyes', 93, 10, 84, 84),
  head('crew-14-echo-a', 'echo-a', 89, 10, 78, 82),
  head('crew-15-leila-s-rensen', 'leila-s-rensen', 94, 10, 86, 86),
  head('crew-16-cal-mercer', 'cal-mercer', 100, 22, 84, 84)
]);
const byCrew = new Map(NPC_DIALOGUE_PORTRAITS_V168.map(profile => [profile.crewId, profile]));
const active = new WeakMap();
const sourcePath = source => {
  try { return typeof source === 'string' && source ? new URL(source, 'http://portrait.invalid').pathname : null; }
  catch { return null; }
};
const sameSource = (image, source) => sourcePath(image?.currentSrc || image?.src) === sourcePath(source);
const initials = name => String(name || '?').trim().split(/[\s·]+/u).filter(Boolean)
  .slice(0, 2).map(part => Array.from(part)[0]).join('').toLocaleUpperCase('fr');

export function getNpcDialoguePortraitV168(crewId) { return byCrew.get(crewId) || null; }

/** The canvas contains only this crop. A tall dialogue, mobile reflow or image
 * loading delay can therefore never expose the rest of the source sprite. */
export function drawNpcDialoguePortraitV168(ctx, image, profile, { width = 384, height = 384 } = {}) {
  if (!ctx || byCrew.get(profile?.crewId) !== profile || !image?.complete
    || image.naturalWidth !== profile.sourceWidth || image.naturalHeight !== profile.sourceHeight
    || !sameSource(image, profile.source) || !(width > 0 && height > 0)) return null;
  const crop = profile.crop, scale = Math.min(width / crop.w, height / crop.h);
  // Keep one uniform scale; roundoff in the limiting dimension must not
  // place its centered origin a fraction of a pixel outside the frame.
  const target = { x: Math.max(0, (width - crop.w * scale) / 2), y: Math.max(0, (height - crop.h * scale) / 2),
    w: crop.w * scale, h: crop.h * scale };
  ctx.clearRect(0, 0, width, height); ctx.imageSmoothingEnabled = false;
  ctx.drawImage(resolveHumanSpriteDrawableV164(image), crop.x, crop.y, crop.w, crop.h,
    target.x, target.y, target.w, target.h);
  return { crewId: profile.crewId, source: profile.source, crop: { ...crop }, target,
    framing: profile.framing, scaleX: scale, scaleY: scale, fullSpriteShown: false };
}

export function setDialogueSpeakerPortraitV168(image, { crewId = null, name = '', paintedSource = null } = {}) {
  const container = image?.parentElement;
  if (!image || !container?.dataset) return null;
  active.get(image)?.cleanup();
  const profile = getNpcDialoguePortraitV168(crewId), source = profile?.source || paintedSource;
  const document = image.ownerDocument || globalThis.document;
  let canvas = container.querySelector?.('canvas[data-dialogue-avatar-v168]');
  if (!canvas && document?.createElement) {
    canvas = document.createElement('canvas'); canvas.width = canvas.height = 384;
    canvas.dataset.dialogueAvatarV168 = 'head-and-shoulders';
    canvas.className = 'hub-dialogue-avatar-v168'; canvas.setAttribute('aria-hidden', 'true');
    container.appendChild(canvas);
  }
  container.classList.add('has-speaker-avatar-v168');
  container.setAttribute('role', 'img'); container.setAttribute('aria-label', `Portrait de ${name || 'l’interlocuteur'}`);
  container.dataset.dialoguePortraitCrewV168 = profile?.crewId || '';
  container.dataset.dialoguePortraitInitialsV168 = initials(name);
  container.dataset.dialoguePortraitKindV168 = profile ? profile.framing : source ? 'painted-portrait' : 'initials';
  container.dataset.dialoguePortraitStateV168 = source ? 'loading' : 'fallback';
  image.classList.remove('is-sprite-cell-v62'); image.hidden = true;
  image.alt = `Portrait de ${name || 'l’interlocuteur'}`; image.setAttribute('aria-hidden', 'true');
  if (canvas) { canvas.hidden = true; canvas.getContext?.('2d')?.clearRect(0, 0, canvas.width, canvas.height); }
  const token = { cleanup: () => {} }; active.set(image, token);
  const cleanup = () => {
    image.removeEventListener?.('load', onLoad); image.removeEventListener?.('error', onError);
  };
  const onError = () => {
    if (active.get(image) !== token) return;
    cleanup(); image.hidden = true; if (canvas) canvas.hidden = true;
    container.dataset.dialoguePortraitStateV168 = 'fallback';
  };
  const onLoad = () => {
    if (active.get(image) !== token || !image.complete || !sameSource(image, source)) return;
    if (profile) {
      try {
        const result = drawNpcDialoguePortraitV168(canvas?.getContext?.('2d'), image, profile,
          { width: canvas?.width, height: canvas?.height });
        if (!result) { onError(); return; }
        canvas.dataset.portraitSourceRectV168 = JSON.stringify(result.crop);
        canvas.hidden = false;
      } catch { onError(); return; }
    } else {
      if (!(image.naturalWidth > 0 && image.naturalHeight > 0)) { onError(); return; }
      image.hidden = false;
    }
    cleanup(); container.dataset.dialoguePortraitStateV168 = 'ready';
  };
  token.cleanup = cleanup;
  if (!source) {
    // Also invalidate the previous V164 image/mask callback. A late source
    // must not put another crew member into an unknown speaker's frame.
    setNpcPortraitSourceV164(image, ''); return { kind: 'initials', crewId, name };
  }
  image.addEventListener?.('load', onLoad); image.addEventListener?.('error', onError);
  setNpcPortraitSourceV164(image, source); onLoad();
  return { kind: profile ? profile.framing : 'painted-portrait', crewId: profile?.crewId || null,
    source, crop: profile ? { ...profile.crop } : null };
}
