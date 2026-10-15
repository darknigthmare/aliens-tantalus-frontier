const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
};

const counter = (role, x, width = 92) => ({
  kind: 'work-counter', role, x, width, height: 50, support: 'rear-floor'
});

/** Reviewed local centres for the fourteen annexes. The shared support-plane
 * owner supplies each floor height; these definitions never move a station,
 * native cargo, doorway, ladder, collider or saved player position. Unchanged
 * flight/range/through-route groups deliberately retain their clear access. */
export const HUB_FURNISHING_ANNEX_REVISIONS_V139 = freeze({
  'arrival-airlock': {
    reason: 'The existing return bench hosts clean linen beside the pressure-control service.',
    moves: {}, additions: []
  },
  logistics: {
    reason: 'Packing has a real empty counter beneath the freight reference bay.',
    moves: {}, additions: [counter('freight-packing-counter', 964, 96)]
  },
  'mire-archives': {
    reason: 'Evidence sorting uses a supported worktop beside its actual reader, rather than a closed drawer cart.',
    moves: { 'evidence-sorting-cart': counter('evidence-sorting-cart', 680, 88) },
    additions: []
  },
  'synthetic-bay': {
    reason: 'Clean electronic diagnosis has a preparation surface beside the component stock; its feed clears the raised station.',
    moves: { 'synthetic-service-feed': { y: 414 } },
    additions: [counter('synthetic-clean-preparation', 1100, 94)]
  },
  cctv: {
    reason: 'Handover desk and adult seat form one watch position beside the working camera console.',
    replaceKinds: ['chair'],
    moves: {
      'security-recording-backup': { x: 1070 },
      'security-fire-safety': { x: 960 }
    },
    additions: [
      counter('security-watch-desk', 1285, 100),
      { cell: 'seat-side', atlas: 139, role: 'security-watch-seat', x: 1205, width: 40, mirroredV139: true, support: 'rear-floor' }
    ]
  },
  'proving-ground': {
    reason: 'The firing and loader routes retain their reviewed equipment without loose work surfaces.',
    moves: {}, additions: []
  },
  morgue: {
    reason: 'A clean preparation top and a separate handwash serve the autopsy table outside the cold-storage and ladder bays.',
    moves: {},
    additions: [
      counter('forensic-clean-preparation', 835, 92),
      { cell: 'wall-handwash', atlas: 139, role: 'forensic-handwash', x: 920, width: 50,
        workSurfaceHeightV139: 44, support: 'rear-wall' }
    ]
  },
  'escape-pods': {
    reason: 'The existing readiness bench carries the evacuation reference without adding another control point.',
    moves: {}, additions: []
  },
  durandal: {
    reason: 'A low service chest supports the diagnostic meter near the computer service bay.',
    moves: {},
    additions: [{ kind: 'tool-chest', role: 'computer-service-chest', x: 1200,
      width: 78, height: 50, support: 'rear-floor' }]
  },
  bioforge: {
    reason: 'Sealed specimen staging has its own clean surface inside the existing entry-support group.',
    moves: {}, additions: [counter('biological-clean-preparation', 850, 92)]
  },
  'flight-control-cockpit': {
    reason: 'The pilot instrument panel has a complete floor pedestal beside the right-facing seat; its entire support is reserved.',
    moves: { 'pilot-forward-instrument-console': { mountKindV142: 'floor-pedestal-console' } }, additions: []
  },
  'engine-room': {
    reason: 'The drive controller belongs beside the actual pump; the inlet clears the raised physical station.',
    moves: { 'engine-drive-controller': { x: 450 }, 'engine-inlet-feed': { y: 420 } },
    additions: []
  },
  'water-recycling': {
    reason: 'The existing service chest hosts replacement filters beside the connected filtration skid.',
    moves: {}, additions: []
  },
  'maintenance-spine': {
    reason: 'The west service chest supports spare fittings while both through routes and ladders remain clear.',
    moves: {}, additions: []
  }
});

/** Apply explicit role revisions without mutating the original definition.
 * Reapplying the revision replaces its own additions instead of duplicating
 * them. Rooms outside this reviewed annex list retain their exact reference. */
export function reviseHubAnnexFurnishingsV139(room, definition) {
  const revision = Object.hasOwn(HUB_FURNISHING_ANNEX_REVISIONS_V139, room?.id)
    ? HUB_FURNISHING_ANNEX_REVISIONS_V139[room.id] : null;
  if (!revision || !definition) return definition;
  const additions = new Map(revision.additions.map(item => [item.role, item]));
  const items = (definition.items || []).map(item => {
    if (additions.has(item.role)) {
      const replacement = additions.get(item.role); additions.delete(item.role);
      return { ...replacement };
    }
    const move = revision.moves[item.role];
    if (!move) return item;
    // A full equipment replacement drops the old cell/kind description.
    return move.kind || move.cell ? { ...move } : { ...item, ...move };
  });
  return { ...definition, items: [...items, ...[...additions.values()].map(item => ({ ...item }))],
    replaceKinds: [...new Set([...(definition.replaceKinds || []), ...(revision.replaceKinds || [])])] };
}
