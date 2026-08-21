# Architecture runtime — v52

## Point d'entrée public

`index.html` charge `src/app.js`. L'application compose deux runtimes :

- mission : `src/game-production-runtime.js` ;
- Tantalus : `src/hub-v52-runtime.js`.

Le schéma de sauvegarde reste `51` pour préserver les trois profils existants ; la release publique passe à `52.0.0`.

## Chaîne mission

`game-production-runtime.js` expose une classe composée :

1. `game-v51-runtime.js` : physique, collisions, plateformes, portes, conduits, combat, coop, checkpoint et Canvas ;
2. `game-runtime.js` / `game-complete*.js` : contrats campagne et seize objectifs ;
3. `game-final-runtime.js` : routes, biomes, équipements, costumes, furtivité, Apex et véhicules ;
4. `game-production-base/core/resume.js` : accessibilité, rencontres contextuelles, balistique, Neuro-Xeno et reprise native ;
5. `game-v52-level-runtime.js` : topologie v52, zones, art, spawns et événements ;
6. `game-v52-runtime.js` : escouade physique et animation manifest-driven.

L'ordre est important : le niveau déterministe est généré, le plan v52 est appliqué, puis le snapshot de reprise est recoupé avec l'identité mission et réappliqué sur les entités finales.

## Compilation des niveaux v52

`src/mission-levels-v52.js` reçoit `{ campaign, world, levelSeeds, variant }` et retourne un plan validé :

- `ship-interior-vertical` ;
- `colony-multiroute` ;
- `planet-exterior`.

Chaque plan contient :

- seed corrigé monde/objectif ;
- graphe de nœuds/arêtes et routes nommées ;
- plateformes, échelles, portes, conduits et dangers ;
- zones de biome et ancres gameplay ;
- événements contextuels et groupes de spawn ;
- trois couches artistiques indépendantes ;
- signatures déterministes et rapport de validation.

Les 436 campagnes sont compilées par identité et contexte, jamais par position dans un tableau. Les 800 anciennes graines sont enrichies sans être supprimées.

## Rendu et level design

`game-v52-level-runtime.js` :

- remplace l'ancien fond générique par far/mid/foreground propre au template ;
- projette la géométrie du graphe dans le monde 6200×1080 ;
- met à jour la zone active, la lumière, les dangers et les événements ;
- évite de dessiner deux fois les couches legacy ;
- restaure événements/spawns/zones avec la signature du plan.

`game-v52-runtime.js` remplace les nœuds d'objectif rectangulaires par un prop existant (`crates`, `lamp`, `breakable` ou `cover`) et une balise compacte. Collision et interaction restent portées par le nœud logique.

## Escouade physique

Le chef sélectionné est l'acteur joueur ; jusqu'à trois autres membres deviennent `squadActors`.

Chaque acteur possède :

- identité catalogue, rôle, spécialité et feuille ;
- position, vitesse, hitbox, santé, armure, bleedout et statut ;
- état follow/cover/fire/heal/repair/scan/revive/vehicle ;
- charges de soutien, tirs, actions, kills et événements ;
- snapshot de reprise et transfert coop hot-join.

Un siège coop remplace temporairement l'acteur IA correspondant, puis lui rend son état à la déconnexion. Un équipier perdu est retiré des passagers, compte une seule casualty et déclenche la conséquence persistante dans `app.js`.

## Animation manifest-driven

`src/sprite-animation-runtime.js` charge le contrat de `assets/openai/sprites/manifest.json`.

Contrat commun :

- grille 4×4, cellules 256×256 ;
- pivot pied et hitbox séparés ;
- clips avec fps, boucle ou verrou de fin ;
- événements de frame drainés une seule fois ;
- sampling compatible reduced-motion ;
- fallback explicite lorsqu'une famille n'a pas de plaque dédiée.

La release contient 27 atlas normalisés RGBA, soit 432 cellules certifiées sans violation de garde. Le runtime résout joueur, xénomorphes, facehugger, neomorph, Working Joe, reine, M577, M41A et les 16 membres Echo-9.

## Hub v52

`src/hub-v52-runtime.js` étend le hub physique existant :

- 4 ponts, 16 salles, 16 PNJ et 16 feuilles uniques ;
- animations idle, walk, role-work et alert-reaction ;
- interactions care, repair, intel, loadout et piloting ;
- ledger `hub.npcInteractions` sérialisable ;
- priorisation des menaces pendant une crise ;
- compatibilité Forge vaisseau et reprise de l'état du hub.

L'application persiste l'interaction et traduit son action vers la surface stratégique concernée.

## Reprise native

`captureResumeState()` sérialise seulement l'état utile :

- identité seed/monde/campagne/niveau/objectif ;
- checkpoint, joueur, coop et escouade ;
- mission, objectifs, inventaire et tracker ;
- portes, conduits, alimentation, archive et supplies ;
- ennemis, drops et pickups ;
- véhicule, conducteur/passagers, coque, carburant et tourelle ;
- équipement et Neuro-Xeno ;
- signature, zone, événements et spawns v52.

Projectiles, particules, touches et interpolation ne sont jamais enregistrés. La sanitation utilise maintenant `Number.MAX_SAFE_INTEGER` : un seed 32 bits supérieur à un milliard n'est plus tronqué et ne produit plus de faux `identity-mismatch`.

## Frontière de persistance

- Le runtime émet des événements, mais n'écrit pas directement dans `localStorage`.
- Les fonctions de domaine mutent un objet de sauvegarde explicite.
- `app.js` décide quels événements exigent un snapshot/commit.
- Une opération active verrouille dotation, Neuro-Xeno et Apex.
- Les captions et tirs sans conséquence persistante ne sérialisent pas la sauvegarde à chaque frame.

## PWA et fermeture ESM

`sw.js` précache :

- shell HTML/CSS/manifeste ;
- fermeture transitive de `src/app.js` ;
- runtimes v52 niveau, escouade, sprites et hub ;
- assets nécessaires aux couches et acteurs runtime.

Le fallback `index.html` ne répond qu'aux navigations. Un module absent échoue comme module au lieu de recevoir du HTML.

## Responsive

`runtime-level.css` fournit :

- scène 16:9 centrée en desktop/paysage ;
- contrôles tactiles hors zone critique ;
- portrait mobile aligné sous l'en-tête avec readout de pont/salle/action ;
- safe areas, réduction de mouvement et cadrage sans débordement horizontal.

## Validation

Commandes :

```powershell
npm.cmd run qa
npm.cmd run qa:browser:v52
```

État de la release :

- lint : 72 modules ;
- Node : 105/105 ;
- build : v52.0.0, 3 443 entrées ;
- navigateur : 12 checkpoints, desktop/mobile/offline ;
- erreurs runtime : 0 exception, 0 erreur console, 0 requête échouée.
