# Contract: module `src/hub-depth-rooms-v188.js` (règles pures)

Exports utilisés par le runtime et les tests :

| Export | Signature | Contrat |
| --- | --- | --- |
| `HUB_DEPTH_ROOMS_V188` | objet figé `{ [roomId]: DepthRoom }` | contient `dropship-hangar` seulement |
| `hubDepthRoomAtV188(deck, x)` | → `DepthRoom \| null` | salle profondeur contenant `x` sur ce pont |
| `depthToScreenOffsetV188(z)` | → nombre | décalage vertical à l'écran (−z) |
| `depthShadeV188(room, z)` | → nombre 0–1 | assombrissement (0 à l'avant, ≤ 0,22 au fond) |
| `stepDepthMoveV188(room, from, input, dt)` | `from = {x, z}`, `input = {dz}` → `{x, z, blocked}` | borne z, refuse un point dans une emprise (résolution axe par axe) |
| `blockedByFootprintV188(room, x, z, halfWidth)` | → booléen | emprises de la salle |
| `canLeaveDepthRoomV188(room, z)` | → booléen | `|z| ≤ doorBand` |
| `depthInteractionAllowedV188(room, playerZ, targetZ)` | → booléen | `|Δz| ≤ interactBand` |
| `npcStationDepthV188(room, crewId)` | → nombre | profondeur de poste hors emprise |
| `normalizeHubDepthV188(raw)` | → `{roomId, z} \| null` | normalisation de la sauvegarde |
| `depthShotHitsV188(shooterZ, targetZ, band?)` | → booléen | règle de tir future (non branchée) |
| `depthAnnouncementV188(lang)` | → texte | annonce de porte FR/EN |

Le mixin `withHubDepthRoomsV188(Base)` (`src/hub-depth-runtime-v188.js`) :

- est idempotent (`Base.hubDepthRoomsV188`) ;
- est composé sous `withHubArmoryStorefrontV169` ;
- ne change rien quand le joueur n'est pas sur le pont d'une salle profondeur, ni en Forge, ni en annexe, ni en conduit.
