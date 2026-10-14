/** Original rear-wall equipment, composed in source pixels rather than enlarged
 * into a complete room. The four panels are adaptations made for this project. */
const panel = (id, x, y, w, h) => Object.freeze({ id, source: Object.freeze({ x, y, w, h }),
  plane: 'rear-equipment', collidable: false, interactive: false });

export const HUB_ENVIRONMENT_ATLAS_V134 = Object.freeze({
  asset: '/assets/openai/hub/props/v134/rear-equipment-atlas.png',
  width: 1774, height: 887,
  sha256: '6a7451000372020311b3772b7535f98a8240b7284a82f2dfebd21836f1501605',
  sourceStatus: 'original-generated-project-environment', exact: false,
  panels: Object.freeze({
    command: panel('command', 22, 88, 846, 317),
    industrial: panel('industrial', 910, 90, 846, 314),
    habitat: panel('habitat', 24, 510, 844, 311),
    clinical: panel('clinical', 912, 507, 838, 311)
  })
});

const groups = {
  command: ['bridge', 'briefing', 'combat-information', 'sensor-array', 'cctv', 'mire-archives', 'durandal'],
  industrial: ['workshop', 'vehicle-bay', 'dropship-hangar', 'reactor', 'life-support', 'armory', 'logistics', 'proving-ground', 'escape-pods', 'arrival-airlock'],
  habitat: ['crew-quarters', 'mess', 'frontier-civil-counter', 'personal-refuge', 'animal-care'],
  clinical: ['medical', 'cryo-bay', 'science-lab', 'quarantine', 'synthetic-bay', 'morgue', 'bioforge']
};
export const HUB_ENVIRONMENT_ROOM_THEMES_V134 = Object.freeze(Object.fromEntries(
  Object.entries(groups).flatMap(([theme, rooms]) => rooms.map(id => [id, theme]))));

export function getHubEnvironmentPanelV134(room) {
  return HUB_ENVIRONMENT_ATLAS_V134.panels[HUB_ENVIRONMENT_ROOM_THEMES_V134[typeof room === 'string' ? room : room?.id]] || null;
}
