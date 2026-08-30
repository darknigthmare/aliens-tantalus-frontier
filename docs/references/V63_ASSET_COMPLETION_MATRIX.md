# Matrice de complétude artistique V63

## Fermeture de la dette ASSO-400

| Domaine | Entrée | État V63 | Preuve runtime |
| --- | --- | --- | --- |
| Arme | Harpoon Gun / ASSO-400 | plaque 4 × 4 dédiée, intégrée | `weapon.asso-400-harpoon-gun.action.v63` |
| Excel | `ARM-0053` | pont exact vers `weapon-024-harpoon-gun` | `src/excel-content-bridge-v63.js` |
| Animation | idle, action, reload, service | 16 cellules gardées | `src/weapon-visual-runtime-v63.js` |
| Catalogue | vignette issue de la vraie cellule idle | intégré | `src/catalog-runtime-v62.js` |
| Jeu | arme joueur, préchargement et fallback déterministe | intégré | `src/game-v51-runtime.js` |
| PWA | module, manifeste et plaque normalisée | précachés | `sw.js` |

La famille Harpoon n'est plus un bouton menant à un équipement invisible. Le pont Excel ne la bloque plus et le runtime la distingue du Sonic Harpoon.

## Manifeste V63

- 192 plaquettes ;
- 2 724 cellules ;
- 53 enemy, 29 equipment, 32 npc, 5 player, 37 vehicle et 36 weapon ;
- 192 sources et 192 normalisés présents, soit 384 chemins de production ;
- nouvelle plaque V63 : 1 atlas / 16 cellules.

## Gaps Excel encore bloqués

| Entrée | État | Condition de déblocage |
| --- | --- | --- |
| Heavy Pulse Rifle | candidats Excel `ARM-0006`, `ARM-0273`, `ARM-0292` ambigus | choisir l'identité et la continuité exactes |
| Plasma Rifle | cinq candidats Excel ambigus | trancher fusil tenu ou plasmacaster d'épaule |
| ES-4 Electroshock Pistol | aucune ligne Excel exacte | obtenir une source et un identifiant non ambigus |
| Compound Bow | aucune ligne Excel exacte | choisir la continuité canonique et l'entrée source |

Dix des quatorze gaps d'armes suivis disposent maintenant d'une plaque dédiée. Les quatre lignes ci-dessus restent désactivées ; aucune substitution visuelle silencieuse n'est autorisée.

## Dette de production non masquée

- véhicules : M570 Series APC, M292 Self-Propelled Artillery et AD-19D Bearcat restent sous `BLOCKED_EXACT_SPRITE_REQUIRED` ;
- UD-4L : remplacer la source actuellement agrandie par une source native suffisamment définie ;
- costumes : les 392 variantes ont leurs effets gameplay, mais pas encore toutes leurs couches bitmap tête/torse/jambes composables ;
- variantes ennemies : seules les différences morphologiques réellement visibles justifient une nouvelle plaque ;
- décors : terminer le kit de petits props propres à chaque salle et la revue sur fonds clair/sombre des 13 candidats halo V62 ;
- registres : races, rituels, perceptions, flore et personnages canon du classeur n'ont pas encore de registre gameplay de premier niveau.

La V63 ferme un manque réel et vérifié ; elle ne transforme pas ces dettes restantes en contenu déclaré « complet ».
