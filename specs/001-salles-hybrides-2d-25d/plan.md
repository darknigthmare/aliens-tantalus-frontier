# Implementation Plan: Salles hybrides 2D / 2,5D — prototype du hangar

**Branch**: `claude/nifty-shannon-qpy1hl` (spec `001-salles-hybrides-2d-25d`) | **Date**: 2026-11-13 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-salles-hybrides-2d-25d/spec.md`

## Summary

Ajouter au hub un mode de salle « profondeur » (2,5D), d'abord pour le hangar du dropship (`dropship-hangar`, pont ingénierie, x 0–1280). Le joueur et les PNJ du hangar y gagnent une coordonnée de profondeur `z`. Le principe : **la physique du rail reste intacte** (gravité, sol, portes, échelles, sauvegarde de x/y) ; `z` est une coordonnée de plus, vérifiée contre les emprises au sol, et rendue par un décalage vertical, un tri par profondeur, une ombre et un assombrissement. Le dropship et les caisses sont dessinés avec le sol ; les personnages placés derrière eux sont recouverts par une passe d'occultation masquée, propre à cette seule salle. Toutes les autres salles gardent leur comportement exact.

## Technical Context

**Language/Version**: JavaScript ES modules (navigateur), Node 22+ pour les tests

**Primary Dependencies**: aucune nouvelle ; moteur Canvas 2D du projet (chaîne `HubGame` dans `src/app.js`)

**Storage**: sauvegarde locale existante (`src/save.js`), champ additif `hub.depthV188`

**Testing**: `node --test` (suites `scripts/verify-*.mjs`), parcours Chromium (Playwright préinstallé), `npm run check`, `build`, `check:built`

**Target Platform**: navigateurs de bureau (clavier, souris, manette) et tactile

**Project Type**: jeu navigateur (application web statique avec service worker hors ligne)

**Performance Goals**: même fluidité qu'avant dans le hangar ; écart de temps d'image moyen < 10 % (SC-006), mesuré sur la même scène avant/après

**Constraints**: aucune régression des salles de profil (SC-003) ; sauvegardes existantes préservées ; pas de génération d'image ; mixin composé à l'intérieur de `withHubArmoryStorefrontV169` (qui doit rester le plus externe, test `verify-hub-armory-layering-v177`)

**Scale/Scope**: une salle (hangar), ses PNJ présents, un ascenseur, un accès latéral ; pas de combat

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` est encore le modèle vide de Spec Kit : aucun principe ratifié. Les règles du dépôt tiennent lieu de garde-fous (AGENTS.md) :

| Règle (AGENTS.md) | Application | Statut |
| --- | --- | --- |
| Moteur JS en modules ES, rendu Canvas 2D | Mixin Canvas 2D, aucun nouveau moteur | OK |
| Partir de `src/app.js`, préserver les gardes et l'ordre de composition | Nouveau mixin inséré dans la composition existante, sous l'armurerie | OK |
| Préserver identifiants de contenu et sauvegardes | Champ additif `hub.depthV188`, position x/y inchangée | OK |
| Niveau : accès logique, passage physique, arrivée, aller-retour, reprise | Couvert par US2, US4, SC-002, SC-004 | OK |
| Performances : mesurer avant/après sur la même scène | SC-006, mesure prévue dans quickstart | OK |
| Docs de dev source-only, admission précise | `specs/001-…` admis explicitement, hors build public | OK |

Re-check après Phase 1 : inchangé, aucune violation à justifier.

## Project Structure

### Documentation (this feature)

```text
specs/001-salles-hybrides-2d-25d/
├── spec.md
├── plan.md              # ce fichier
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   └── hub-depth-room.md
├── checklists/requirements.md
└── tasks.md             # Phase 2 ($speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── hub-depth-rooms-v188.js      # NOUVEAU : définitions des salles profondeur (hangar), mapping z→écran,
│                                #   emprises, règles pures (déplacement, collisions, bande d'interaction, tir futur)
├── hub-depth-runtime-v188.js    # NOUVEAU : mixin withHubDepthRoomsV188 (update, useLift, interact,
│                                #   nearestInteraction, draw trié, persist/restore, annonce de porte)
├── app.js                       # composition : withHubDepthRoomsV188 sous withHubArmoryStorefrontV169
├── save.js                      # normalisation additive hub.depthV188
styles.css / index.html          # (aucun changement attendu)
sw.js                            # coque hors ligne : deux nouveaux modules
scripts/
├── verify-hub-depth-rooms-v188.mjs   # NOUVEAU : règles pures, composition, sauvegarde
└── verify-public-release-v86.mjs     # admission des nouveaux fichiers
docs/development/PRIORITIES_P0_P1_V188.md   # rapport
src/hub-depth-presentation-v116.js, hub-room-projection-v139.js, hub-support-planes-v139.js
                                 # commentaires d'en-tête complétés (exception des salles profondeur), FR-015
```

**Structure Decision**: deux modules, comme le reste du hub. Un module pur (règles testables sans DOM) et un mixin de runtime branché dans la chaîne `HubGame` existante. Aucune modification des modules de salle de profil, hormis les commentaires d'en-tête demandés par FR-015.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --- | --- | --- |
| Passe d'occultation masquée propre au hangar (calque hors écran : objet du sol limité aux personnages placés derrière, moins ceux placés devant) | L'ordre fixe actuel (décor → PNJ → joueur → avant) ne permet pas à un objet du sol de masquer un personnage passé derrière lui | Décaler seulement `y` pendant le dessin garde l'ordre fixe ; reproduire le dessin des PNJ du pont (code en ligne, nombreuses surcharges) aurait dupliqué un rendu fragile. Un PNJ devant le joueur le masque : le joueur est alors dessiné avant l'équipage |
