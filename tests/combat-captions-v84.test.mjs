import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CombatCaptionDirectorV84, WEAPON_CAPTION_INTERVAL_V84 } from '../src/combat-captions-v84.js';
import { GameEngine } from '../src/game-production-runtime.js';
import { WORLDS, CAMPAIGNS, LEVEL_SEEDS, WEAPONS } from '../src/content.js';

test('une rafale continue publie au maximum un sous-titre de tir toutes les quatre secondes, sans file retardée', () => {
  const director = new CombatCaptionDirectorV84();
  const captions = [];
  for (let frame = 0; frame < 600; frame += 1) {
    const caption = director.offer('weapon', frame % 2 ? 'M41A : tir.' : 'M56 : tir.', frame / 60);
    if (caption) captions.push(caption);
  }
  assert.equal(WEAPON_CAPTION_INTERVAL_V84, 4);
  assert.equal(captions.length, 3);
  assert.deepEqual(captions.map(caption => caption.at), [0, 4, 8]);
});

test('dialogue, mission et canaux inconnus ne sont jamais supprimés par les tirs et gardent le texte exact', () => {
  const director = new CombatCaptionDirectorV84();
  assert.ok(director.offer('weapon', 'Tir.', 0));
  for (const channel of ['dialogue', 'mission', 'radio', 'neuro', 'future-narrative-channel']) {
    const text = 'MARA : « Fermez le sas. »\nNe quittez pas votre position.';
    assert.equal(director.offer(channel, text, 0.1).text, text);
    assert.equal(director.offer('weapon', 'Tir.', 0.2), null);
  }
});

test('une phrase importante bénéficie d’une fenêtre de lecture sans être écrasée par une rafale', () => {
  const director = new CombatCaptionDirectorV84();
  const sentence = 'Rétablissez le courant au relais auxiliaire puis revenez au sas de quarantaine. Ne tirez pas sur le terminal.';
  director.offer('mission', sentence, 10);
  assert.equal(director.offer('weapon', 'Tir.', 13), null);
  assert.ok(director.offer('weapon', 'Tir.', 17));
});

test('les avertissements et événements utiles restent immédiatement disponibles pendant une protection narrative', () => {
  const director = new CombatCaptionDirectorV84();
  director.offer('dialogue', 'Restez près de la porte.', 0);
  for (const channel of ['danger', 'environment', 'vehicle', 'neuro']) {
    assert.ok(director.offer(channel, `${channel} : événement utile.`, 0.1));
  }
});

test('pause et retour de checkpoint ne prolongent pas arbitrairement le cooldown de l’ancienne chronologie', () => {
  const director = new CombatCaptionDirectorV84();
  assert.ok(director.offer('weapon', 'Tir.', 20));
  for (let index = 0; index < 100; index += 1) assert.equal(director.offer('weapon', 'Tir.', 20), null);
  assert.ok(director.offer('weapon', 'Tir après reprise.', 3));
  assert.equal(director.offer('weapon', 'Tir.', Number.NaN), null);
});

test('les identifiants acceptés restent uniques après saturation de l’historique et les textes vides sont ignorés', () => {
  const director = new CombatCaptionDirectorV84();
  for (const text of ['', '  ', null, undefined]) assert.equal(director.offer('mission', text, 0), null);
  const captions = Array.from({ length: 50 }, (_, index) => director.offer('dialogue', `Phrase ${index}.`, index));
  assert.equal(new Set(captions.map(caption => caption.id)).size, 50);
  assert.ok(captions.every(Object.isFrozen));
});

function runtime(t, subtitles = true) {
  const previous = new Map(['Image', 'addEventListener', 'requestAnimationFrame'].map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  class TestImage {
    constructor() { this.complete = true; this.naturalWidth = this.naturalHeight = 1024; }
    set src(value) { this.currentSrc = value; }
  }
  for (const [name, value] of Object.entries({ Image: TestImage, addEventListener() {}, requestAnimationFrame: () => 0 })) {
    Object.defineProperty(globalThis, name, { configurable: true, value });
  }
  const events = [];
  const canvas = { width: 1280, height: 720, getContext: () => ({}), addEventListener() {}, focus() {} };
  const engine = new GameEngine(canvas, { onEvent: event => events.push(event) });
  const world = WORLDS.find(entry => entry.biomes.includes('industrial')) || WORLDS[0];
  const options = { world, campaign: { ...CAMPAIGNS[0], id: 'captions-v84', objective: 'Revenir au sas.', worldId: world.id },
    levelSeed: { ...LEVEL_SEEDS[0], worldId: world.id, objective: 'Revenir au sas.' },
    weapon: WEAPONS.find(weapon => weapon.id.includes('m41a')) || WEAPONS[0], enemyCatalog: [],
    accessibility: { subtitles, aimAssist: 'off', reducedMotion: true } };
  engine.start(options);
  engine.enemies = []; engine.walls = []; engine.doors = []; engine.platforms = [];
  Object.assign(engine.player, { x: 300, y: 400, facing: 1, ammo: 200, fireClock: 0, reloading: false });
  let audioShots = 0;
  engine.audio = { shot() { audioShots += 1; } };
  t.after(() => {
    engine.stop();
    for (const [name, descriptor] of previous) descriptor ? Object.defineProperty(globalThis, name, descriptor) : delete globalThis[name];
  });
  return { engine, events, options, getAudioShots: () => audioShots };
}

test('vrai runtime : les rafales gardent toutes les balles, munitions et sons mais pas 80 annonces aria-live', t => {
  const { engine, events, getAudioShots } = runtime(t);
  const ammo = engine.player.ammo;
  for (let shot = 0; shot < 80; shot += 1) {
    engine.mission.elapsed = 10 + shot * 0.13;
    engine.player.fireClock = 0;
    assert.equal(engine.fire(engine.player), true);
  }
  assert.equal(engine.player.ammo, ammo - 80);
  assert.equal(engine.bullets.length, 80);
  assert.equal(getAudioShots(), 80);
  assert.equal(events.filter(event => event.type === 'caption' && event.channel === 'weapon').length, 3);
});

test('vrai runtime : désactiver les sous-titres ne coupe ni le tir ni le son et ne peuple pas l’historique', t => {
  const { engine, events, getAudioShots } = runtime(t, false);
  assert.equal(engine.fire(engine.player), true);
  assert.equal(getAudioShots(), 1);
  assert.equal(engine.bullets.length, 1);
  assert.equal(engine.pushCaption('dialogue', 'Transmission.'), false);
  assert.equal(events.some(event => event.type === 'caption'), false);
  assert.equal(engine.getSnapshot().captions.length, 0);
});

test('vrai runtime : priorité, limite de douze, IDs uniques et remise à zéro au démarrage suivant', t => {
  const { engine, events, options } = runtime(t);
  engine.mission.elapsed = 10;
  assert.equal(engine.pushCaption('weapon', 'Tir.'), true);
  assert.equal(engine.pushCaption('dialogue', 'Mara : restez avec moi.'), true);
  engine.mission.elapsed = 11;
  assert.equal(engine.pushCaption('weapon', 'Tir.'), false);
  assert.equal(events.at(-1).text, 'Mara : restez avec moi.');
  for (let index = 0; index < 30; index += 1) engine.pushCaption('radio', `Transmission ${index}.`);
  assert.equal(engine.captions.length, 12);
  assert.equal(new Set(engine.captions.map(caption => caption.id)).size, 12);
  const previous = engine.captionDirectorV84;
  engine.start(options);
  assert.notEqual(engine.captionDirectorV84, previous);
  assert.equal(engine.captions.length, 1);
  assert.equal(engine.captions[0].channel, 'mission');
});

test('le contrat CSS conserve aria-live, activation utilisateur et texte long sans masquer les sous-titres petits écrans', async () => {
  const [css, html] = await Promise.all([readFile('runtime-level.css', 'utf8'), readFile('index.html', 'utf8')]);
  assert.match(html, /id="mission-log"[^>]*aria-live="polite"/);
  assert.match(css, /html\.mission-mode\[data-subtitles='off'\][^{]+\.mission-log\s*\{\s*display:\s*none/);
  assert.match(css, /container-type:\s*size/);
  assert.match(css, /width:\s*min\(100cqw, calc\(100cqh \* 16 \/ 9\)\)/);
  assert.match(css, /max-height:\s*min\(24svh, 10rem\)/);
  assert.match(css, /overflow-wrap:\s*anywhere/);
  const smallLandscape = css.match(/@media \(orientation: landscape\) and \(max-width: 520px\) \{([^]*?)\n\}/)?.[1];
  assert.doesNotMatch(smallLandscape || '', /mission-log[^]*display:\s*none/);
});
