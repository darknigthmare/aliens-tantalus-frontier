# 0.9.0 — Couvertures fragiles

Suite locale de la 0.8.0. Les quinze chapitres, 85 salles, trois arènes, emplacements et 42 familles sont conservés.

## Ajouts exécutés

Module explicite environment.js ; 82 couvertures existantes (76 campagne, six Hunt) avec points de structure distincts : caisse 140, bureau 110, banc 90, débris 70. Projectiles et explosions ont un premier impact et une exposition cohérente. Corrosion par flaque au contact : 18 PV/s sans cumul. Soldier/Lurker annoncent une griffe 0,85 s / 46 dégâts ; Crusher 180 sur l’axe ; couteau 22 et pinces 125.

Fissures, jauges, résidus non solides et avertissement COUP DE GRIFFE ; navigation invalidée à la rupture. I ouvre l’inspection locale visible, à 1 000 unités maximum. Aucun butin, reconstruction de meuble, nouvelle arme ni nouvelle mission.

## Corrections

La mêlée et la charge offensives ne blessent plus une cible occultée. Soins et cartouches destinés à O’Neal demandent un accès dégagé. Une balle ou explosion arrêtée par une couverture ne profite pas de la brèche créée dans ce même impact.

## Reprises et preuve

V9 sans écrasement des clés V1 à V8. Migration 0.8 sans réinitialisation du groupe ou de la mission ; initialisation des seuls nouveaux champs de décor. Registre de structure strict. 439 tests Node, 255 contrôles Chromium de jeu répartis en six suites, 15 HTTP et 39 documentaires. Treize parcours du moteur. 64 captures de rapport, 166 règles, 88 fiches et plans, 94 cadrages au codex. Les agents ne sont pas des joueurs humains et les scènes préparées sont annoncées.

Le navigateur refuse les ouvertures locales : tests set_content et Storage Map, pas de certification de persistance native. Pas de push, déploiement ni intégration parent. Visuel vectoriel et animations provisoires.
