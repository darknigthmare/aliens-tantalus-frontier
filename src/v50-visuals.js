const sheet = (id, file, title, description, family, wave = 'v50') => ({
  id,
  file: `/assets/openai/sprites/normalized/${file}`,
  title,
  description,
  family,
  provider: 'OpenAI ImageGen',
  kind: 'animation',
  grid: '4×4',
  frames: 16,
  wave,
  alt: `Plaque d’animation ${title} générée par OpenAI et normalisée en RGBA`
});

export const V50_SPRITE_VISUALS = Object.freeze([
  sheet('v50-player-locomotion', 'player/echo9-marine-locomotion-sheet.png', 'Echo-9 — locomotion', 'Idle, marche/course, saut/chute, accroupissement et échelle.', 'player'),
  sheet('v50-player-combat', 'player/echo9-marine-combat-sheet.png', 'Echo-9 — combat', 'Visée, tir, rechargement, blessure et neutralisation.', 'player'),
  sheet('v50-xeno-drone-locomotion', 'enemies/xenomorph-drone-locomotion-sheet.png', 'Xénomorphe Drone — locomotion', 'Traque, course, bond et déplacement en conduit.', 'enemy'),
  sheet('v50-xeno-drone-combat', 'enemies/xenomorph-drone-combat-sheet.png', 'Xénomorphe Drone — combat', 'Menace, griffes, queue et neutralisation.', 'enemy'),
  sheet('v50-facehugger', 'enemies/facehugger-locomotion-sheet.png', 'Facehugger — locomotion', 'Tressaillement, course au sol, saut d’agrippement et mort.', 'enemy'),
  sheet('v50-neomorph', 'enemies/neomorph-locomotion-sheet.png', 'Néomorphe — locomotion', 'Idle, course, bond agressif et dégâts.', 'enemy'),
  sheet('v50-working-joe', 'enemies/working-joe-combat-sheet.png', 'Working Joe — combat', 'Marche synthétique, saisie, frappe et destruction.', 'enemy'),
  sheet('v50-xeno-warrior', 'enemies/xenomorph-warrior-combat-sheet.png', 'Xénomorphe Warrior — combat', 'Menace lourde, avance, attaques et blessures.', 'enemy'),
  sheet('v50-xeno-queen', 'enemies/xenomorph-queen-combat-sheet.png', 'Reine Xénomorphe — combat', 'Idle royal, progression, griffes/queue et rugissement.', 'enemy'),
  sheet('v50-mara-vega', 'npcs/mara-vega-locomotion-sheet.png', 'Mara Vega — PNJ', 'Idle, marche, travail de commandement et réaction d’alerte.', 'npc'),
  sheet('v50-idris-kwan', 'npcs/idris-kwan-locomotion-sheet.png', 'Idris Kwan — PNJ', 'Idle, marche, maintenance et réaction d’alerte.', 'npc'),
  sheet('v50-noor-okafor', 'npcs/noor-okafor-locomotion-sheet.png', 'Noor Okafor — PNJ', 'Idle, marche, soins et réaction d’alerte.', 'npc'),
  sheet('v50-bishop-9', 'npcs/bishop-9-locomotion-sheet.png', 'Bishop-9 — PNJ', 'Idle synthétique, marche, diagnostic et alerte.', 'npc'),
  sheet('v50-tamsin-velez', 'npcs/tamsin-velez-locomotion-sheet.png', 'Tamsin Velez — PNJ', 'Idle, marche, rôle d’assaut et réaction d’alerte.', 'npc'),
  sheet('v50-sanaa-doyle', 'npcs/sanaa-doyle-locomotion-sheet.png', 'Sanaa Doyle — PNJ', 'Idle, marche, smartgun et réaction d’alerte.', 'npc'),
  sheet('v50-maksim-orlov', 'npcs/maksim-orlov-locomotion-sheet.png', 'Maksim Orlov — PNJ', 'Idle, marche, pilotage et réaction d’alerte.', 'npc'),
  sheet('v50-m577-apc', 'vehicles/m577-apc-action-sheet.png', 'M577 APC — actions', 'Ralenti moteur, roulage, tourelle et dommages critiques.', 'vehicle'),
  sheet('v50-m41a', 'weapons/m41a-pulse-rifle-action-sheet.png', 'M41A — actions', 'Arme au repos, recul, rechargement et incident de tir.', 'weapon')
]);

export const V52_NPC_SPRITE_VISUALS = Object.freeze([
  sheet('v52-rook', 'npcs/rook-locomotion-sheet.png', 'Rook — PNJ', 'Idle de reconnaissance, marche, scan tactique et réaction d’alerte.', 'npc', 'v52'),
  sheet('v52-inez-harlow', 'npcs/inez-harlow-locomotion-sheet.png', 'Inez Harlow — PNJ', 'Idle, marche, analyse xénobiologique et réaction d’alerte.', 'npc', 'v52'),
  sheet('v52-david-8r', 'npcs/david-8r-locomotion-sheet.png', 'DAVID-8R — PNJ', 'Idle synthétique, marche, infiltration technique et réaction d’alerte.', 'npc', 'v52'),
  sheet('v52-jun-park', 'npcs/jun-park-locomotion-sheet.png', 'Jun Park — PNJ', 'Idle, marche, maintenance technique et réaction d’alarme.', 'npc', 'v52'),
  sheet('v52-asha-mbaye', 'npcs/asha-mbaye-locomotion-sheet.png', 'Asha Mbaye — PNJ', 'Idle, marche, coordination de liaison et réaction d’alerte.', 'npc', 'v52'),
  sheet('v52-pablo-reyes', 'npcs/pablo-reyes-locomotion-sheet.png', 'Pablo Reyes — PNJ', 'Idle, marche, travail de démolition et réaction de protection.', 'npc', 'v52'),
  sheet('v52-echo-a', 'npcs/echo-a-locomotion-sheet.png', 'ECHO-A — PNJ', 'Idle synthétique, marche tactique, diagnostic d’assaut et réaction d’alerte.', 'npc', 'v52'),
  sheet('v52-leila-sorensen', 'npcs/leila-s-rensen-locomotion-sheet.png', 'Leila Sørensen — PNJ', 'Idle, marche d’éclaireuse, travail Pathfinder et réaction environnementale.', 'npc', 'v52'),
  sheet('v52-cal-mercer', 'npcs/cal-mercer-locomotion-sheet.png', 'Cal Mercer — PNJ', 'Idle, marche lourde, maintenance véhicule et réaction d’alarme.', 'npc', 'v52')
]);
