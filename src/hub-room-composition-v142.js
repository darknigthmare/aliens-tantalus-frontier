const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
};
const wall = (cell, x, y, width, role, atlas = 136) => ({ cell, x, y, width, role, atlas, support: 'rear-wall' });
const floor = (cell, x, width, role, atlas = 139, extra = {}) => ({ cell, x, width, role, atlas, support: 'rear-floor', ...extra });
const counter = (x, width, role) => ({ kind: 'work-counter', x, width, height: 46, role,
  support: 'rear-floor', cleanSurfaceV139: true });
const group = (purpose, items) => ({ purpose, items });

/** Small working groups occupy reviewed bays beside their actual service.
 * All coordinates are room-local and deterministic. Existing doors, ladders,
 * stations, equipment, vents and NPC rails retain their own exclusions.
 * The hangar and vehicle bay intentionally keep their large hull envelopes:
 * a low item count there is not an empty usable furnishing bay. */
export const HUB_ROOM_COMPOSITION_ADDITIONS_V142 = freeze({
  bridge: group('watch-reference-desk-beside-navigation', [
    counter(395, 112, 'bridge-watch-reference-counter'),
    floor('seat-side', 490, 40, 'bridge-reference-seat'),
    wall('data-cabinet', 440, 410, 66, 'bridge-watch-document-stock')
  ]),
  briefing: group('meeting-note-preparation-beside-waiting-bench', [
    counter(820, 82, 'briefing-note-preparation-counter'),
    floor('seat-side', 740, 40, 'briefing-note-preparation-seat', 139, { mirroredV139: true }),
    wall('data-cabinet', 850, 450, 60, 'briefing-distribution-records')
  ]),
  'combat-information': group('tactical-watch-reference-and-recording', [
    counter(718, 68, 'tactical-watch-reference-counter'),
    floor('seat-side', 930, 40, 'signal-backup-watch-seat'),
    wall('data-cabinet', 850, 440, 68, 'signal-catwalk-reference-stock')
  ]),
  'cryo-bay': group('clean-linen-return-and-stasis-service', [
    { kind: 'bin', x: 500, width: 34, height: 42, role: 'stasis-used-linen-return', support: 'rear-floor' },
    wall('sterile-cabinet', 530, 430, 60, 'stasis-clean-linen-stock')
  ]),
  'crew-quarters': group('shared-berth-personal-storage', [
    { kind: 'locker', x: 310, width: 70, height: 62, role: 'shared-crew-effects-locker', support: 'rear-floor' },
    wall('personal-shelf', 320, 410, 66, 'shared-crew-reading-shelf')
  ]),
  armory: group('issue-inspection-and-signed-records', [
    counter(690, 90, 'armory-issue-inspection-counter'),
    wall('data-cabinet', 690, 420, 70, 'armory-issue-record-stock')
  ]),
  workshop: group('hand-tools-and-spare-fittings-above-existing-chests', [
    wall('tool-board', 550, 420, 72, 'workshop-hand-tool-board'),
    wall('personal-shelf', 770, 440, 66, 'workshop-small-fittings-shelf')
  ]),
  reactor: group('electrical-isolation-work-and-spares', [
    wall('tool-board', 640, 415, 72, 'reactor-isolation-service-board'),
    { kind: 'tool-chest', x: 880, width: 72, height: 62, role: 'reactor-isolation-spare-chest', support: 'rear-floor' }
  ]),
  'life-support': group('filter-swap-stock-beside-service-counter', [
    { kind: 'filter-stack', x: 340, width: 42, height: 60, role: 'air-clean-filter-stock', support: 'rear-floor' },
    wall('tool-board', 430, 425, 66, 'air-filter-service-tool-board')
  ]),
  'sensor-array': group('physical-calibration-reference-beside-receiver', [
    counter(712, 62, 'array-calibration-counter')
  ]),
  'mire-archives': group('classified-evidence-stock-and-sorting-return', [
    { kind: 'archive-rack', x: 850, width: 84, height: 96, role: 'classified-evidence-return-rack', support: 'rear-floor' },
    counter(1204, 60, 'archive-classification-counter')
  ]),
  'animal-care': group('feed-preparation-and-separate-hygiene-stock', [
    wall('galley-rack', 720, 500, 80, 'habitat-feed-preparation-stock'),
    wall('sterile-cabinet', 820, 500, 72, 'habitat-clean-hygiene-stock')
  ]),
  'frontier-civil-counter': group('public-form-completion-before-service-queue', [
    counter(760, 112, 'civil-public-form-counter'),
    floor('seat-side', 854, 40, 'civil-public-form-seat'),
    wall('data-cabinet', 760, 500, 80, 'civil-public-form-stock')
  ]),
  'flight-control-cockpit': group('navigation-time-reference-and-checklist-stock-above-record-cart', [
    { kind: 'chronometers', x: 700, y: 420, width: 110, height: 42,
      role: 'flight-navigation-time-reference', support: 'rear-wall' },
    wall('personal-shelf', 560, 514, 66, 'flight-checklist-manual-stock')
  ]),
  'personal-refuge': group('reading-seat-and-personal-books-beside-existing-table', [
    floor('seat-side', 1230, 40, 'private-reading-seat'),
    wall('personal-shelf', 1230, 530, 66, 'private-reading-book-shelf')
  ])
});

/** Apply only the authored groups. No automatic socket search or filler
 * scattering is performed by the renderer. Rejected authored items remain
 * visible to the normal composition audit. */
export function extendHubRoomFurnishingsV142(definitions) {
  return Object.fromEntries(Object.entries(definitions).map(([id, definition]) => {
    const addition = Object.hasOwn(HUB_ROOM_COMPOSITION_ADDITIONS_V142, id) ? HUB_ROOM_COMPOSITION_ADDITIONS_V142[id] : null;
    return [id, addition ? { ...definition, items: [...definition.items, ...addition.items],
      functionalAdditionV142: addition.purpose } : definition];
  }));
}
