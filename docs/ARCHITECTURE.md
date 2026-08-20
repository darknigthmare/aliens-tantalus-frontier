# Architecture v49

```text
index.html / styles.css / hub-level.css
        │
        ├── src/app.js ── navigation, catalogues, profils, services diégétiques
        ├── src/hub-game.js ── niveau USS Tantalus modulaire, collisions, portes, parallax
        ├── src/content.js ── contrat v46 et génération déterministe
        ├── src/save.js ── trois profils, migration, import/export
        ├── src/game.js ── runtime Canvas 1280×720
        ├── src/editor.js ── Frontier Forge bloc/écran
        └── src/audio.js ── signaux WebAudio procéduraux
```

Le projet est volontairement sans dépendance runtime. Le serveur de développement utilise seulement Node, le build copie une application statique dans `dist/`, et Vercel sert ce dossier avec des en-têtes de sécurité et cache long pour les assets.

## Flux persistant

`SaveSystem` charge un des trois profils, découvre les anciennes clés connues, fusionne toute donnée avec le schéma v49 puis conserve progression galactique, états de colonie, équipe, USS Tantalus, éditeur, paramètres et statistiques. Les opérations écrivent l’objectif accompli, les kills et les ressources sans modifier les catalogues immuables.

## Runtime

`GameEngine` et `HubGame` fonctionnent chacun dans un espace logique 1280×720, indépendant de la taille CSS. Chaque pont du hub mesure 3 840 unités horizontales et contient quatre salles, soit seize salles sur les quatre ponts. `HubGame` gère marche, course, saut, gravité, collisions, trois obstacles par salle (douze par pont), portes coulissantes, PNJ, ascenseurs et interactions limitées à la proximité. La caméra suit le joueur dans le niveau au lieu d’afficher des actions de salle sous forme de boutons.

Le rendu du hub charge **36 assets OpenAI runtime** : 16 décors de salle sous `assets/openai/hub/rooms/`, 4 far layers sous `assets/openai/hub/parallax/` et 16 props indépendants sous `assets/openai/hub/props/`. Les plans lointain, viewport et avant-plan se déplacent à des vitesses distinctes. Les quatre panoramas 16:9 de la v48 sont conservés comme masters legacy et preuves de production, mais aucun n’est utilisé par `HubGame` v49. Des formes Canvas restent disponibles comme fallback déterministe si un bitmap échoue.

`GameEngine` simule de son côté plateformes, portes, projectiles, hostiles data-driven, armure/santé, tracker, objectif, coop locale et véhicule. Cette architecture rend le hub réellement parcourable, sans prétendre que les 436 campagnes cataloguées sont déjà toutes des niveaux artisanaux complets.

## Sécurité et déploiement

- aucun secret côté client;
- pas de `eval` ou `document.write`;
- chemins du serveur local normalisés;
- Content-Type nosniff, politique de référent et permissions navigateur restrictives;
- service worker versionné et cache shell limité;
- build bloqué par `validateContent()`.

La gate v49 comprend 15 tests, le build statique et une QA navigateur du hub en viewport desktop et mobile.
