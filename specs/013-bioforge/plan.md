# Plan : Bioforge, laboratoire de confinement

**Spec** : `013-bioforge` | **Date** : 2026-11-22

## Architecture

- `src/bioforge-lab-layout-v188.js` — données et règles pures : zones, accessoires (emplacements nommés), interactions, invites, cuves de file, rapports (stockage froid, analyse, incinérateur), cycle de décontamination de sortie, validation géométrique et d'accès. Aucune dépendance au moteur.
- `src/bioforge-lab-render-v188.js` — rendu Canvas en primitives derrière des emplacements nommés `bioforge-lab-*` : cloisons, plafonds, sols, éclairage de zone, signalétique, accessoires, passerelles, galerie, invites, HUD. Liquides, bulles, brume, givre et braises passent par le pool de `vfx-v188.js` (types `bubble`, `steam`, `ember`).
- `src/bioforge-lab-runtime-v188.js` — mixin `withBioforgeContainmentLabV188(Base)` appliqué **après** `withBioforgeRuntimeV80` (ordre de composition existant conservé, ajout en fin de chaîne) : promenade hors session, sortie après purge, interactions, décontamination, rendu.
- `src/bioforge-runtime-v80.js` — la classe exportée `BioforgeRuntimeV80` compose le nouveau mixin ; aucune autre modification de logique.
- `src/bioforge-level-v80.js` — deux stations déplacées (`bioforge-control`, `bioforge-purge`).
- `src/vfx-v188.js`, `src/vfx-slots-v188.js` — ajout du type `bubble` et de l'emplacement `liquid-bubble` (primitive).
- `src/app.js` — armement de la promenade à l'ouverture de la vue, événements `bioforge-terminal-requested` et `bioforge-egress-complete`, messages d'état.
- `bioforge-v80.css` — chevauchement du terminal à 390 px.

## Données conservées

Monde 2880×720, `arenaBounds`, portes, emplacements d'apparition, salles et leurs identifiants ; sauvegarde `bioforgeV80` sans champ nouveau. La promenade et la sortie suppriment l'écriture périodique (aucune position hors session n'est sauvegardée).

## Vérification

- `scripts/verify-bioforge-lab-v188.mjs` (Node) : couverture des zones, rattachement aux salles, portes et cadres, interactions accessibles sur le sol, invites par phase, cuves de file, rapports sans mutation, cycle de décontamination, promenade et sortie (moteur réel sans boucle), conservation des sauvegardes et des identifiants, absence de persistance périodique, textes FR/EN.
- `scripts/qa-bioforge-lab-v188.mjs` (Chromium) : entrée depuis le hub au clavier, toutes les zones, chaque interaction, session, purge, sortie physique, retour au hub, reprise ; 0 erreur ; captures avant/après.
- Performance : coût de `draw()` mesuré avant/après dans la même scène (même fixture, mêmes positions de caméra).
- Suites existantes Bioforge, joueur, VFX, accessibilité ; `npm run test:all`, `check`, `build`, `check:built`, `i18n:check`.
