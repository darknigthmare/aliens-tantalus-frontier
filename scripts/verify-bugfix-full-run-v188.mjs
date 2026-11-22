// Regression tests for the full main-campaign browser playthrough of 2026-11-22
// (docs/development/PLAYTHROUGH_V188_20261122.md): each test pins a bug found on the
// real page, from a new game to the Saison des Reines call.
import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture, tick } from './engine-host-v188.mjs';
import { CAMPAIGNS, WORLDS } from '../src/content.js';

const campaign = id => CAMPAIGNS.find(entry => entry.id === id);

// Found in QZ-17: once the boss fell, the « containment » checkpoint was written at the
// legacy world floor (FLOOR_Y = 930) whatever the level. The QZ-17 interior floor is at
// y 868, so a marine downed after the boss respawned below the floor, fell and was downed
// again: « ENTRÉE · reprendre au checkpoint confinement » looped forever (soft-lock).
test('boss checkpoint: after the boss falls, a checkpoint restart lands on a real surface and survives (QZ-17)', async () => {
  const entry = campaign('special-narrative-qz17');
  const world = WORLDS.find(candidate => candidate.id === entry.worldId) || WORLDS[0];
  const { engine } = await fixture({ campaign: entry, options: { world }, keepEnemies: true });
  const boss = engine.enemies.find(enemy => enemy.isBoss);
  assert.ok(boss, 'QZ-17 places a boss');
  engine.enemies = [boss];
  engine.defeatEnemy(boss, engine.player);
  assert.equal(engine.checkpoint.id, 'containment');
  const feet = engine.checkpoint.y + engine.player.h;
  assert.ok(Number.isFinite(boss.groundY), 'the level boss stands on a known surface');
  assert.ok(feet <= boss.groundY + 1, `checkpoint feet ${feet} must not be under the boss surface ${boss.groundY}`);
  // The marine goes down later; ENTER resumes at the containment checkpoint.
  engine.enemies = []; engine.hostileProjectiles = [];
  engine.player.health = 0; engine.failMission('squad-down');
  assert.equal(engine.mission.state, 'failed');
  assert.equal(engine.restartFromCheckpoint(), true);
  tick(engine, 3);
  assert.equal(engine.mission.state, 'active', 'the restarted marine is not downed again by a fall');
  assert.ok(engine.player.grounded, 'the restarted marine stands on a surface');
  assert.ok(engine.player.y + engine.player.h <= boss.groundY + 1, `feet ${engine.player.y + engine.player.h} under ${boss.groundY}`);
});

// Found after QZ-18: the dossier piece « Priorité de fret à 18:43 » is held once CIN-20-ROOK
// is seen (story-dossier-v188.js), but the Command panel was drawn before that cinematic and
// never redrawn: it kept « DOSSIER QZ17 · 2/7 » while the save held 3/7, even after switching
// views. A cinematic newly recorded as seen now redraws the Command missions panel (dossier).
test('dossier panel: a newly seen story cinematic redraws the Command dossier (CIN-20-ROOK → 3/7)', async () => {
  const { readFileSync } = await import('node:fs');
  const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const body = app.slice(app.indexOf('function playStoryCinematicV188('), app.indexOf('function openPlayerCreatorV84('));
  assert.match(body, /markStoryCinematicSeenV188\(candidate, id\)\) \{ saveSystem\.commit\(candidate\); [^}]*renderCommandMissionsV110\(\)/,
    'the commit of a newly seen cinematic redraws the Command dossier');
  const { storyDossierV188 } = await import('../src/story-dossier-v188.js');
  const { createDefaultSave } = await import('../src/save.js');
  const save = createDefaultSave();
  save.archiveRelayArchivesV122 = { schema: 122, case: { verdict: 'delayed-distress' } };
  const before = storyDossierV188(save).pieces.find(piece => piece.id === 'priority-1843').held;
  save.storyCampaignV188.cinematicsSeen = [...save.storyCampaignV188.cinematicsSeen, 'cin-20-rook'];
  assert.deepEqual([before, storyDossierV188(save).pieces.find(piece => piece.id === 'priority-1843').held], [false, true], 'the piece depends on the cinematic');
});

// Found after QZ-18: the hub objective sends the marine to « Salle de briefing, table
// tactique », but the table was a weak prop (priority 10): Tamsin Velez, Mara Vega, ECHO-A
// and Maksim Orlov stand around it, and any crew member within reach always won E. No spot
// of the table offered it (the west end is the archives door). The operations table is a
// priority station, like the UD-4L: at its centre and not facing a crew member, E opens it.
test('briefing table: a priority station that crew standing around it no longer hide', async () => {
  const { HubGame, HUB_DECKS } = await import('../src/hub-game.js');
  const { HubGame: HubV52 } = await import('../src/hub-v52-runtime.js');
  const briefing = HUB_DECKS[0].rooms.find(room => room.id === 'briefing');
  const bounds = briefing.propInteractionBounds, centre = bounds.x + bounds.w / 2;
  const stub = { player: { x: centre - 21, w: 42, y: 532, h: 92, facing: 1 }, currentRoom: () => briefing };
  const table = HubGame.prototype.nearestInteraction.call(stub);
  assert.equal(table?.action, 'navigate:operations');
  assert.ok(table.interactionPriority >= 100, `briefing table priority ${table.interactionPriority}`);
  const velez = { crewId: 'crew-02-tamsin-velez', name: 'Tamsin Velez', x: centre - 60, w: 44 };
  const choose = () => HubV52.prototype.hubInteractionChoiceV188.call({ ...stub, nearestInteraction: () => table, nearestHubNpc: () => velez });
  assert.equal(choose().kind, 'physical', 'at the table centre, facing away from Velez: the table');
  stub.player.facing = -1;
  assert.equal(choose().kind, 'npc', 'facing Velez at arm’s length: talk');
  // Other rooms keep their weak props (crew first).
  const mess = HUB_DECKS[1].rooms.find(room => room.id === 'mess');
  const messProp = HubGame.prototype.nearestInteraction.call({ player: { x: mess.propInteractionBounds.x + 10, w: 42 }, currentRoom: () => mess });
  assert.equal(messProp?.interactionPriority, 10);
});
