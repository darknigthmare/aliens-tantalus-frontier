const freezeClip = (id, frames, fps, loop, eventType) => Object.freeze({
  id,
  rows: Object.freeze([...new Set(frames.map((frame) => Math.floor(frame / 4)))]),
  frames: Object.freeze([...frames]),
  fps,
  loop,
  events: Object.freeze(eventType ? [Object.freeze({ frame: frames[0], type: eventType })] : [])
});

export const NPC_MISSION_GRID_V55 = Object.freeze({
  columns: 4,
  rows: 4,
  cellWidth: 256,
  cellHeight: 256,
  guard: 16,
  sourceFacing: 1
});

export const NPC_LEGACY_LOCOMOTION_CLIPS_V55 = Object.freeze({
  idle: freezeClip('idle', [0, 1, 2, 3], 4, true, 'body:breath'),
  walk: freezeClip('walk', [4, 5, 6, 7], 8, true, 'audio:footstep')
});

const DEFINITIONS = Object.freeze([
  Object.freeze({
    crewId: 'crew-01-mara-vega',
    slug: 'mara-vega',
    name: 'Mara Vega',
    role: 'command',
    roleAction: 'command-order',
    roleFrames: [12],
    hurtFrames: [13],
    downedFrames: [14]
  }),
  Object.freeze({
    crewId: 'crew-02-tamsin-velez',
    slug: 'tamsin-velez',
    name: 'Tamsin Velez',
    role: 'assault',
    roleAction: 'suppressive-fire',
    roleFrames: [3, 7],
    hurtFrames: [12],
    downedFrames: [13, 14]
  }),
  Object.freeze({
    crewId: 'crew-03-idris-kwan',
    slug: 'idris-kwan',
    name: 'Idris Kwan',
    role: 'engineering',
    roleAction: 'field-repair',
    roleFrames: [3, 7],
    hurtFrames: [12],
    downedFrames: [13, 14]
  }),
  Object.freeze({
    crewId: 'crew-04-noor-okafor',
    slug: 'noor-okafor',
    name: 'Noor Okafor',
    role: 'medical',
    roleAction: 'combat-medicine',
    roleFrames: [12],
    hurtFrames: [13],
    downedFrames: [14]
  }),
  Object.freeze({
    crewId: 'crew-05-bishop-9',
    slug: 'bishop-9',
    name: 'BISHOP-9',
    role: 'science',
    roleAction: 'science-analysis',
    roleFrames: [3, 7],
    hurtFrames: [12],
    downedFrames: [13, 14]
  }),
  Object.freeze({
    crewId: 'crew-06-rook',
    slug: 'rook',
    name: 'Rook',
    role: 'recon',
    roleAction: 'recon-scan',
    roleFrames: [3, 7],
    hurtFrames: [12],
    downedFrames: [13, 14]
  }),
  Object.freeze({
    crewId: 'crew-07-sanaa-doyle',
    slug: 'sanaa-doyle',
    name: 'Sanaa Doyle',
    role: 'heavy',
    roleAction: 'smartgun-burst',
    roleFrames: [3, 7],
    hurtFrames: [12],
    downedFrames: [13, 14]
  }),
  Object.freeze({
    crewId: 'crew-08-maksim-orlov',
    slug: 'maksim-orlov',
    name: 'Maksim Orlov',
    role: 'pilot',
    roleAction: 'flight-control-repair',
    roleFrames: [3, 7],
    hurtFrames: [12],
    downedFrames: [13, 14]
  })
]);

const makeMissionClipSet = (definition) => {
  const woundedDeathFrames = [...definition.hurtFrames, ...definition.downedFrames, 15];
  return Object.freeze({
    ready: freezeClip('ready', [0], 2, true, 'state:combat-ready'),
    fire: freezeClip('fire', [1, 2], 11, false, 'combat:fire'),
    'role-support': freezeClip('role-support', definition.roleFrames, 6, false, 'role:' + definition.roleAction),
    cover: freezeClip('cover', [4, 5, 6, 7], 6, true, 'stance:cover'),
    traversal: freezeClip('traversal', [8, 9, 10], 8, false, 'movement:traversal'),
    climb: freezeClip('climb', [11], 6, true, 'movement:climb-contact'),
    hurt: freezeClip('hurt', definition.hurtFrames, 7, false, 'state:hurt'),
    downed: freezeClip('downed', definition.downedFrames, 5, false, 'state:downed'),
    dead: freezeClip('dead', [15], 1, false, 'state:death-lock'),
    'wounded-death': freezeClip('wounded-death', woundedDeathFrames, 6, false, 'state:wounded-sequence')
  });
};

const makeIdentity = (definition) => {
  const clipSet = makeMissionClipSet(definition);
  return Object.freeze({
    crewId: definition.crewId,
    slug: definition.slug,
    name: definition.name,
    role: definition.role,
    roleAction: definition.roleAction,
    sourceFacing: NPC_MISSION_GRID_V55.sourceFacing,
    grid: NPC_MISSION_GRID_V55,
    missionSheetId: 'npc.' + definition.slug + '.mission',
    missionPath: '/assets/openai/sprites/normalized/npcs/' + definition.slug + '-mission-sheet.png',
    missionClipSetId: 'npc-' + definition.slug + '-mission-v55',
    missionClips: clipSet,
    locomotionSheetId: 'npc.' + definition.slug + '.locomotion',
    locomotionPath: '/assets/openai/sprites/normalized/npcs/' + definition.slug + '-locomotion-sheet.png',
    locomotionClips: NPC_LEGACY_LOCOMOTION_CLIPS_V55,
    identityVerified: true
  });
};

export const NPC_MISSION_IDENTITIES_V55 = Object.freeze(Object.fromEntries(
  DEFINITIONS.map((definition) => [definition.crewId, makeIdentity(definition)])
));

export const NPC_MISSION_CLIP_SETS_V55 = Object.freeze(Object.fromEntries(
  Object.values(NPC_MISSION_IDENTITIES_V55).map((identity) => [identity.missionClipSetId, identity.missionClips])
));

export function resolveNpcMissionIdentityV55(crewId) {
  return NPC_MISSION_IDENTITIES_V55[String(crewId || '')] || null;
}

const missionResult = (identity, clipId, state) => Object.freeze({
  crewId: identity.crewId,
  identity: identity.slug,
  state,
  source: 'mission',
  sheetId: identity.missionSheetId,
  path: identity.missionPath,
  clipSetId: identity.missionClipSetId,
  clipId,
  clip: identity.missionClips[clipId],
  sourceFacing: identity.sourceFacing,
  identityVerified: identity.identityVerified
});

const locomotionResult = (identity, clipId) => Object.freeze({
  crewId: identity.crewId,
  identity: identity.slug,
  state: clipId,
  source: 'legacy-locomotion',
  sheetId: identity.locomotionSheetId,
  path: identity.locomotionPath,
  clipSetId: 'npc-locomotion-v55-safe-subset',
  clipId,
  clip: identity.locomotionClips[clipId],
  sourceFacing: identity.sourceFacing,
  identityVerified: identity.identityVerified
});

/**
 * Resolve a mission animation without ever borrowing another crew identity.
 * Unknown crew IDs deliberately return null instead of falling back to Mara.
 */
export function resolveNpcMissionAnimationV55(actor = {}) {
  const identity = resolveNpcMissionIdentityV55(actor.crewId);
  if (!identity) return null;

  if (actor.downed) return missionResult(identity, 'downed', 'downed');
  if (actor.dead || actor.lost || actor.alive === false) return missionResult(identity, 'dead', 'dead');
  if (actor.hurt || Number(actor.hurtClock) > 0 || Number(actor.v52HurtClock) > 0) {
    return missionResult(identity, 'hurt', 'hurt');
  }
  if (actor.climbing) return missionResult(identity, 'climb', 'climbing');
  if (actor.firing || actor.attacking || Number(actor.fireClock) > 0 || Number(actor.v52FireClock) > 0) {
    return missionResult(identity, 'fire', 'fire');
  }
  if (actor.supporting || Number(actor.supportClock) > 0) {
    return missionResult(identity, 'role-support', 'support');
  }
  if (actor.working || Number(actor.workClock) > 0) {
    return missionResult(identity, 'role-support', 'work');
  }
  if (actor.crouching || actor.inCover) return missionResult(identity, 'cover', 'cover');
  if (actor.grounded === false) return missionResult(identity, 'traversal', 'traversal');
  if (actor.combatReady || actor.aiming || actor.alert || actor.alerted || Number(actor.alertClock) > 0) return missionResult(identity, 'ready', 'ready');
  if (Math.abs(Number(actor.vx) || 0) > 8) return locomotionResult(identity, 'walk');
  return locomotionResult(identity, 'idle');
}
