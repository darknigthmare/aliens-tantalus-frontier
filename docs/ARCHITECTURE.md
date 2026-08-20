# Architecture v47

```text
index.html / styles.css
        │
        ├── src/app.js ── navigation, catalogues, hub, profils, lancement
        ├── src/content.js ── contrat v46 et génération déterministe
        ├── src/save.js ── trois profils, migration, import/export
        ├── src/game.js ── runtime Canvas 1280×720
        ├── src/editor.js ── Frontier Forge bloc/écran
        └── src/audio.js ── signaux WebAudio procéduraux
```

Le projet est volontairement sans dépendance runtime. Le serveur de développement utilise seulement Node, le build copie une application statique dans `dist/`, et Vercel sert ce dossier avec des en-têtes de sécurité et cache long pour les assets.

## Flux persistant

`SaveSystem` charge un des trois profils, découvre les anciennes clés connues, fusionne toute donnée avec le schéma v47 puis conserve progression galactique, états de colonie, équipe, USS Tantalus, éditeur, paramètres et statistiques. Les opérations écrivent l’objectif accompli, les kills et les ressources sans modifier les catalogues immuables.

## Runtime

`GameEngine` fonctionne dans un espace logique 1280×720, indépendant de la taille CSS. Il simule gravité, plateformes, portes, projectiles, hostiles data-driven, armure/santé, tracker, objectif, coop locale et véhicule. Le décor OpenAI est chargé en parallax; des silhouettes Canvas assurent un fallback déterministe si un bitmap échoue.

## Sécurité et déploiement

- aucun secret côté client;
- pas de `eval` ou `document.write`;
- chemins du serveur local normalisés;
- Content-Type nosniff, politique de référent et permissions navigateur restrictives;
- service worker versionné et cache shell limité;
- build bloqué par `validateContent()`.
