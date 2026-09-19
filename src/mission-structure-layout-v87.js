const finiteRect = value => value && ['x', 'y', 'w', 'h'].every(key => Number.isFinite(value[key]))
  && value.w > 0 && value.h > 0 && Number.isFinite(value.x + value.w) && Number.isFinite(value.y + value.h);
const layoutCache = new WeakMap();
const snapshotKeys = Object.freeze(['x', 'y', 'w', 'h', 'art', 'floor', 'kind', 'id', 'renderHeight', 'surfaceOffset']);
const emptyLayout = Object.freeze({ decks: Object.freeze([]), supports: Object.freeze([]), lifts: Object.freeze([]) });
const snapshotValue = (platform, key) => key === 'y' && platform?.kind === 'lift' ? undefined : platform?.[key];

// Merge only coincident walking surfaces. Physics retains the original records;
// render runs remove repeated end caps without bridging an actual gap or step.
export function collectMissionDeckRunsV87(platforms = []) {
  const staticDecks = platforms.filter(platform => finiteRect(platform) && !platform.floor && platform.kind !== 'lift')
    .map(platform => ({ ...platform })).sort((a, b) => a.y - b.y || String(a.art).localeCompare(String(b.art)) || a.x - b.x);
  const runs = [];
  for (const deck of staticDecks) {
    const last = runs.at(-1);
    if (last && last.y === deck.y && last.art === deck.art && deck.x <= last.x + last.w) {
      last.w = Math.max(last.x + last.w, deck.x + deck.w) - last.x;
      last.h = Math.max(last.h, deck.h);
    } else runs.push(deck);
  }
  return runs;
}

// Rear service risers join two existing decks; never place a detached prop at
// an arbitrary height or follow the moving platform of an elevator.
export function buildMissionSupportSpansV87(platforms = []) {
  const decks = collectMissionDeckRunsV87(platforms);
  const floors = platforms.filter(platform => finiteRect(platform) && platform.floor);
  return buildSupportSpans(decks, floors);
}

function buildSupportSpans(decks, floors) {
  // Sort once, rather than allocating and sorting every possible anchor query.
  const candidates = [...decks, ...floors].sort((a, b) => a.y - b.y);
  const supports = [];
  for (const deck of decks) {
    if (deck.w < 64) continue;
    const points = [];
    const count = Math.min(256, Math.floor((deck.w - 56) / 360) + 1);
    for (let index = 0; index < count; index += 1) points.push(deck.x + 28 + index * 360);
    const end = deck.x + deck.w - 28;
    if (end - points.at(-1) > 180) points.push(end);
    for (const centerX of points) {
      const top = deck.y + deck.h;
      const lower = candidates.find(candidate => candidate.y >= top
        && centerX >= candidate.x + 10 && centerX <= candidate.x + candidate.w - 10);
      // A close landing blocks the riser; never skip it and pierce it to reach a deeper floor.
      if (!lower || lower.y - top < 28) continue;
      supports.push({ x: centerX - 9, y: top, w: 18, h: lower.y - top,
        upperId: deck.id, lowerId: lower.id });
    }
  }
  return supports;
}

function snapshotMatches(platforms, snapshot) {
  if (platforms.length !== snapshot.length) return false;
  for (let index = 0; index < platforms.length; index += 1) {
    const platform = platforms[index];
    const previous = snapshot[index];
    if (platform !== previous.platform) return false;
    for (let field = 0; field < snapshotKeys.length; field += 1) {
      if (!Object.is(snapshotValue(platform, snapshotKeys[field]), previous.values[field])) return false;
    }
  }
  return true;
}

/** Cache static structure while preserving live elevator objects and their moving height. */
export function getMissionStructureLayoutV87(platforms) {
  if (!Array.isArray(platforms)) return emptyLayout;
  const cached = layoutCache.get(platforms);
  if (cached && snapshotMatches(platforms, cached.snapshot)) return cached.layout;
  const decks = collectMissionDeckRunsV87(platforms);
  const floors = platforms.filter(platform => finiteRect(platform) && platform.floor);
  const supports = buildSupportSpans(decks, floors);
  const lifts = platforms.filter(platform => platform?.kind === 'lift');
  const layout = Object.freeze({
    decks: Object.freeze(decks.map(deck => Object.freeze(deck))),
    supports: Object.freeze(supports.map(support => Object.freeze(support))),
    // Freeze the list, not its members: physics owns and moves those exact objects.
    lifts: Object.freeze(lifts)
  });
  const snapshot = platforms.map(platform => ({
    platform,
    values: snapshotKeys.map(key => snapshotValue(platform, key))
  }));
  layoutCache.set(platforms, { snapshot, layout });
  return layout;
}
