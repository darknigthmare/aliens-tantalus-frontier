# Architecture v50

```text
index.html / styles.css / hub-level.css / runtime-level.css
        │
        ├── src/app.js ── navigation, catalogues, profils, services diégétiques
        ├── src/hub-game.js ── hub USS Tantalus modulaire, portes, PNJ, parallax
        ├── src/game.js ── mission Metroidvania verticale, combat et traversée
        ├── src/v50-visuals.js ── registre des 18 plaques normalisées
        ├── assets/openai/sprites/manifest.json ── clips, pivots, hitboxes et consommateurs
        ├── src/content.js ── contrat v46 et génération déterministe
        ├── src/save.js ── trois profils, migration, import/export
        ├── src/editor.js ── Frontier Forge bloc/écran
        └── src/audio.js ── signaux WebAudio procéduraux
```

Le projet est volontairement sans dépendance runtime. Le serveur de développement utilise seulement Node, le build copie une application statique dans `dist/`, et Vercel sert ce dossier avec des en-têtes de sécurité et cache long pour les assets.

## Flux persistant

SaveSystem charge un des trois profils, découvre les anciennes clés connues, fusionne toute donnée avec le schéma v50 puis conserve progression galactique, états de colonie, équipe, USS Tantalus, éditeur, paramètres et statistiques. La migration adapte notamment les positions historiques du hub à sa largeur v50 sans supprimer la progression. Les opérations écrivent l’objectif accompli, les kills et les ressources sans modifier les catalogues immuables.

## Runtime

GameEngine et HubGame dessinent dans un espace logique 1280 × 720, indépendant de la taille CSS, mais leurs mondes et leurs responsabilités sont distincts.

### HubGame

Chaque pont mesure 5120 unités horizontales et contient quatre salles de 1280 unités, soit seize salles sur quatre ponts. HubGame gère marche, course, saut, gravité, trois obstacles par salle, portes coulissantes avec collision, sept plaques de PNJ, ascenseurs et interactions de proximité. Le hub est réellement parcourable, mais reste un niveau horizontal : il ne possède pas encore les échelles, branches et retours de la mission v50.

Le rapport du hub couvre les 36 assets modulaires historiques — 16 salles, 4 far layers et 16 props — ainsi que le joueur, les 7 PNJ normalisés et le foreground, soit 45 ressources runtime suivies. Le pivot de pied utilise 240/256; le joueur est rendu en 110 × 148 pour une silhouette utile d’environ 112 px, et les PNJ en 92 × 140. Les anciens rectangles de fenêtre flottants ont été supprimés. Le foreground est limité à 220 px et alpha 0,25.

### GameEngine

La mission occupe 6200 × 1080. Sa géométrie contient 15 plateformes plus le sol, 6 échelles et 4 portes. Une porte exige la remise sous tension d’un nœud auxiliaire; un conduit forme un raccourci. La caméra suit les deux axes avec anticipation de la vitesse. GameEngine gère aussi projectiles, cinq familles visuelles ennemies ou plus, armure/santé, tracker, objectif, coop locale, arme ramassable et M577 APC.

Les couches OpenAI far, mid et foreground sont chargées séparément; le premier plan de mission utilise un alpha 0,30. Les props de sol, passerelle, rebord, plateforme, échelle, conduit, porte, couverture et danger possèdent des fichiers indépendants. Le pivot 240/256 est commun au joueur, aux ennemis, à l’arme et au véhicule.

### Contrat des plaques v50

Le manifeste et le rapport de normalisation certifient 18/18 plaques : RGBA 1024 × 1024, grille 4 × 4, 16 cellules, garde transparente sans violation. Chaque plaque a au moins un consommateur déclaré entre la mission, le hub et src/v50-visuals.js. Cela couvre deux plaques joueur, sept ennemis, sept PNJ, une arme et un véhicule.

Le readout HTML redondant est masqué pendant le jeu. En portrait, le Canvas est recentré et les contrôles tactiles sont disposés hors de la scène plutôt que sur le personnage.

Cette architecture ne signifie pas que les 436 campagnes cataloguées sont déjà toutes des niveaux artisanaux complets : elles restent majoritairement systémiques.

## Sécurité et déploiement

- aucun secret côté client;
- pas de `eval` ou `document.write`;
- chemins du serveur local normalisés;
- Content-Type nosniff, politique de référent et permissions navigateur restrictives;
- service worker versionné et cache shell limité;
- build bloqué par `validateContent()`.

## Validation

La gate finale v50 est validée : `npm run qa` contrôle 26 modules, passe 20/20 tests et produit le build `50.0.0` de 3 443 entrées. La QA navigateur confirme le hub et ses 45/45 assets; la mission et ses 31/31 assets, 16 plateformes sol compris, 6 échelles, 4 portes, escalade et verrou power; puis la galerie sprites desktop/mobile avec 71 cartes, 27 plaques et 432 cellules, dont les 18 plaques v50 normalisées.
