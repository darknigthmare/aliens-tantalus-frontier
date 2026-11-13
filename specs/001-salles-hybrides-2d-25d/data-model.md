# Data Model: Salles hybrides 2D / 2,5D

## DepthRoom (définition statique, `hub-depth-rooms-v188.js`)

| Champ | Type | Règle |
| --- | --- | --- |
| `roomId` | chaîne | identifiant de salle existant (`dropship-hangar`) |
| `deck` | entier | index du pont (3 pour l'ingénierie) |
| `x0`, `x1` | nombres | plage horizontale de la salle (0–1280) |
| `zMin`, `zMax` | nombres | bornes de profondeur praticables (−80, 0) ; 0 = rail le long du mur |
| `doorBand` | nombre | `|z|` maximal pour franchir un accès ou utiliser l'ascenseur (20) |
| `interactBand` | nombre | écart de profondeur maximal pour une interaction (24) |
| `footprints[]` | Footprint | emprises bloquantes |
| `props[]` | Prop | éléments dessinés et triés (dropship, caisses, chariot) |
| `npcDepths` | table | profondeur de poste par identifiant d'équipage |

## Footprint

`{ id, x0, x1, z0, z1 }`, en coordonnées du monde. Un point (x, z) est bloqué si `x0 ≤ x ≤ x1` et `z0 ≤ z ≤ z1`. Le joueur est testé sur son centre de pieds, élargi de sa demi-largeur.

## Prop

`{ id, kind: 'dropship' | 'crate' | 'cart', x, z, w, h }` ; `z` donne l'ordre de tri et le décalage vertical.

## Position en profondeur (runtime)

- Joueur : `player.depthZ` (nombre, défaut 0).
- PNJ : `npc.depthZ` et `npc.depthTargetZ`.
- Hors salle profondeur : `depthZ = 0`.

## Sauvegarde : `hub.depthV188`

`{ roomId: string, z: number } | null`. Normalisation : `roomId` doit désigner une salle profondeur connue ; `z` est borné à `[zMin, zMax]`. Toute autre forme donne `null`.

## Transitions

```text
Profil (z=0) --[x entre dans [x0,x1] sur le pont]--> Profondeur (z libre)
Profondeur --[|z| ≤ doorBand et x sort de [x0,x1]]--> Profil (z=0)
Profondeur --[E au pied de l'ascenseur, |z| ≤ doorBand]--> ascenseur (comportement existant)
```
