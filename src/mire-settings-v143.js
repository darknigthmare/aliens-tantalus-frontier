/** Settings are explicit; a correct location is NOT a complete historical campaign.
 * Stable pair IDs remain owned by the original catalogue and old operations keep
 * their frozen world/seed/loadout. This adapter only changes future catalogue reads.
 */
const setting = (source, worldId, references) => Object.freeze({
  source, worldId, references: Object.freeze(references), scope: 'setting-only', canonExact: false
});
export const MIRE_SETTINGS_V143 = Object.freeze([
  setting('Alien 1979', 'world-15-uscss-nostromo', ['Alien (1979)']),
  setting('Aliens 1986', 'world-01-acheron-lv-426', ['Aliens (1986)']),
  setting('Alien 3', 'world-03-fiorina-161', ['Alien 3 (1992)']),
  setting('Alien Resurrection', 'world-14-usm-auriga', ['Alien Resurrection (1997)']),
  setting('Prometheus', 'world-02-lv-223', ['Prometheus (2012)']),
  setting('Alien Romulus', 'world-13-renaissance-station', ['Alien: Romulus (2024)']),
  setting('Alien Isolation', 'world-04-sevastopol', ['https://www.feralinteractive.com/en/manual/alienisolation/latest/steam/']),
  setting('Aliens Colonial Marines', 'world-01-acheron-lv-426', ['Aliens: Colonial Marines (2013)']),
  setting('Aliens Dark Descent', 'world-05-lethe', ['Aliens: Dark Descent (2023)']),
  setting('Aliens Fireteam Elite', 'world-06-lv-895', ['https://www.aliensfireteamelite.com/en/community/aliens-fireteam-elite-lv-895-battle-report/']),
  setting('Aliens Rogue Incursion', 'world-09-purdan', ['https://store.steampowered.com/app/1850050/Alien_Rogue_Incursion_VR/']),
  setting('AVP 2010', 'world-21-bg-386', ['Aliens vs. Predator (2010)'])
]);
// These labels name anthologies, manufacturers, unproduced works or settings
// absent from the world registry. Never invent one canonical destination for them.
export const MIRE_PENDING_SOURCES_V143 = Object.freeze([
  'Alien Covenant', 'Alien Earth', 'AVP 2000', 'AVP Jaguar', 'AVP Arcade',
  'Aliens Armageddon', 'Alien Infestation', 'Alien RPG', 'Dark Horse',
  'Fire and Stone', 'Kenner', 'NECA', 'Alien Crucible',
  'William Gibson Alien III', 'Official Shorts', 'Alien 5 archives'
]);
const settings = new Map(MIRE_SETTINGS_V143.map(entry => [entry.source, entry]));
const pending = new Set(MIRE_PENDING_SOURCES_V143);

export function buildMireCampaignsV143(campaigns, worlds) {
  const byWorld = new Map(worlds.map(world => [world.id, world]));
  return campaigns.map(campaign => {
    if (campaign.mode !== 'MIRE') return campaign;
    const source = settings.get(campaign.source);
    if (!source && !pending.has(campaign.source)) throw new Error(`MIRE: source non examinée: ${campaign.source}`);
    const worldId = source?.worldId || campaign.worldId;
    const world = byWorld.get(worldId);
    if (!world) throw new Error(`MIRE: lieu absent: ${worldId}`);
    const number = campaign.pairId?.replace(/^pair-/, '') || campaign.id;
    return Object.freeze({ ...campaign, worldId, year: null,
      name: `${campaign.source} — ${source ? 'Adaptation MIRE' : 'Simulation originale'} ${number}`,
      canon: source ? 'source-setting-adaptation' : 'project-simulation',
      canonExact: false, historicalSettingV143: source || null,
      contentStatusV143: Object.freeze({ kind: 'generated-scenario',
        setting: source ? 'reviewed' : 'unreviewed', geometry: 'procedural',
        story: 'not-authored', cast: 'player-loadout', canonExact: false }),
      summary: source
        ? `Scénario tactique original situé dans le cadre de ${world.name}. Cartes, objectifs, équipage et dotation adaptés ; ce n’est pas la campagne historique complète.`
        : `Simulation originale sur ${world.name}, inspirée du corpus ${campaign.source}. Cette destination n’est pas présentée comme un lieu historique de cette œuvre.`
    });
  });
}

export function validateMireCampaignsV143(campaigns, worlds) {
  const failures = [], byWorld = new Set(worlds.map(world => world.id));
  for (const entry of MIRE_SETTINGS_V143) if (!byWorld.has(entry.worldId)) failures.push(`MIRE: ${entry.source}: lieu absent`);
  for (const campaign of campaigns.filter(entry => entry.mode === 'MIRE')) {
    const source = settings.get(campaign.source);
    if (!source && !pending.has(campaign.source)) failures.push(`MIRE: ${campaign.id}: source non examinée`);
    if (!byWorld.has(campaign.worldId)) failures.push(`MIRE: ${campaign.id}: monde absent`);
    if (source && campaign.worldId !== source.worldId) failures.push(`MIRE: ${campaign.id}: œuvre et lieu incompatibles`);
    if (campaign.canon !== (source ? 'source-setting-adaptation' : 'project-simulation')) failures.push(`MIRE: ${campaign.id}: statut historique incorrect`);
    if (campaign.canonExact !== false || campaign.contentStatusV143?.story !== 'not-authored') failures.push(`MIRE: ${campaign.id}: portée non déclarée`);
  }
  return Object.freeze({ ok: failures.length === 0, failures: Object.freeze(failures) });
}
