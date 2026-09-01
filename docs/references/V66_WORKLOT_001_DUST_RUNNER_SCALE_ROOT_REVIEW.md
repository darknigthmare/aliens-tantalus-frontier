# Enemy 031 Dust Runner — revue d’échelle anatomique et de racine physique

Statut : **revue candidate terminée, rien d’appliqué**. Cette revue n’accepte pas les planches, ne normalise aucun atlas et ne modifie ni runtime, ni registre global, ni QUEUE, ni STATE.

## Décision de régénération

Aucune nouvelle génération ImageGen n’est requise à ce stade. Les quatre planches conservent la même identité de Runner quadrupède bas, long, sans tubes dorsaux, et leurs chronologies restent lisibles. L’écart visible vient surtout d’une échelle inter-clips et d’un placement au sol différents; il est mesurable et calibrable.

## Ownership des bords idle 4 et 7

Le signal conservateur `nominal-cell-border-contact-needs-ownership-review` est conservé, mais il ne correspond pas à de l’anatomie :

| Pose | Pixel local | Pixel global | RGB source | Côtés comptés | Bounds réels extraits | Marge anatomique minimale |
|---|---:|---:|---:|---|---:|---:|
| idle 4 | (0, 442) | (0, 886) | (223, 61, 212) | gauche + bas | (39, 104, 397, 254) | 39 px |
| idle 7 | (443, 442) | (1773, 886) | (228, 61, 216) | droite + bas | (47, 109, 392, 255) | 47 px |

Chaque pose ne contient qu’un seul pixel d’angle, compté sur deux côtés. Sa teinte reste un magenta lumineux; elle sort uniquement du masque diagnostic parce que son canal vert vaut 61, soit un niveau de plus que le seuil conservateur `G <= 60`. L’extracteur réel classe ces pixels comme matte connecté, extrait 8 poses distinctes sans safe reassignment et ne jette aucun pixel d’anatomie. Ni la queue ni la silhouette ne touche donc une séparation nominale; une retouche géométrique serait injustifiée.

La preuve annotée est [idle-border-ownership.jpg](v66-worklot-001-dust-runner-scale-root-review/idle-border-ownership.jpg), SHA256 `0ddb103c7640bee89ce774dc158962ea88e731055afb6303e94be1da1cdbcd1d`.

## Sources verrouillées

| Clip | SHA256 |
|---|---|
| idle | `1f4bf952f5babf39d6201fe2d51053afbc062de343eb6b530c2a2f879b206875` |
| move | `6561378231f7fa89372221922135544be5eec8728d90508c4b1b7a4c4206a664` |
| attack | `7d71c3cfa883a7efbe03770c2754d2343db09817eca4762e7d04c8ca89e69ad5` |
| death | `490d141acdf1e2a3e4fd04134c996d6292befd9ff1be16988abba1053dc168ce` |

## Invariant d’échelle

L’invariant est la corde rigide du dôme crânien dorsal : jonction postérieure du dôme lisse jusqu’à sa pointe antérieure externe. La mâchoire, la gueule ouverte, le cou, la queue et toute boîte englobante du corps sont exclus. Les coordonnées sont locales à une cellule source nominale de 444 × 444 px.

| Clip | Pose | Point 0 | Point 1 | Longueur px |
|---|---:|---:|---:|---:|
| idle | 0 | (274, 244) | (369, 260) | 96.3379 |
| idle | 1 | (269, 246) | (366, 279) | 102.4597 |
| idle | 2 | (260, 243) | (371, 276) | 115.8016 |
| move | 0 | (260, 204) | (319, 227) | 63.3246 |
| move | 1 | (258, 205) | (322, 228) | 68.0074 |
| move | 2 | (256, 204) | (319, 231) | 68.5420 |
| attack | 0 | (249, 231) | (303, 259) | 60.8276 |
| attack | 1 | (242, 230) | (306, 259) | 70.2638 |
| attack | 7 | (243, 181) | (298, 207) | 60.8358 |
| death | 0 | (275, 250) | (367, 282) | 97.4064 |
| death | 1 | (270, 270) | (351, 319) | 94.6678 |
| death | 2 | (278, 301) | (365, 354) | 101.8725 |

Incertitude manuelle : ±4 px par mesure. Les trois poses death sont prises avant la rotation au sol; les poses suivantes ne montrent plus la même corde dorsale sous un angle comparable.

| Clip | Médiane px | Facteur candidat `médiane idle / médiane clip` |
|---|---:|---:|
| idle | 102.4597 | 1.000000 |
| move | 68.0074 | 1.506596 |
| attack | 60.8358 | 1.684201 |
| death | 97.4064 | 1.051879 |

Ces facteurs sont recommandés comme **candidats post-génération**, pas comme valeurs déjà appliquées. La variation intra-clip reste visible, notamment idle (96.3379–115.8016 px) et attack (60.8276–70.2638 px); un atlas normalisé devra encore confirmer le rendu final.

## Racine physique et sol

Le landmark suivi dans chaque pose est le centre du bassin immédiatement devant la base de la queue, au niveau de l’articulation proximale de la patte arrière. La racine est sa projection verticale sur l’appui observé et inclut la borne inférieure complète extraite ainsi que son pixel de garde. Pour les poses aériennes, le plan de sol vient des poses voisines au sol afin de conserver la hauteur du saut; aucun bord de boîte englobante n’est utilisé comme landmark.

Format : `landmark → anchor`, en coordonnées nominales 444 × 444.

| Clip | Pose | Mesure | Type d’appui | Incertitude |
|---|---:|---|---|---:|
| idle | 0 | (190,286) → (190,359) | pattes au sol | ±4 px |
| idle | 1 | (188,286) → (188,359) | pattes au sol | ±4 px |
| idle | 2 | (182,291) → (182,360) | pattes au sol | ±4 px |
| idle | 3 | (218,286) → (218,358) | pattes au sol | ±4 px |
| idle | 4 | (190,190) → (190,257) | pattes au sol | ±4 px |
| idle | 5 | (220,180) → (220,257) | pattes au sol | ±4 px |
| idle | 6 | (180,190) → (180,256) | pattes au sol | ±4 px |
| idle | 7 | (196,194) → (196,255) | pattes au sol + garde source complète | ±4 px |
| move | 0 | (190,230) → (190,290) | pattes au sol | ±4 px |
| move | 1 | (190,230) → (190,290) | pattes au sol | ±4 px |
| move | 2 | (180,231) → (180,291) | pattes au sol | ±4 px |
| move | 3 | (187,235) → (187,291) | pattes au sol | ±4 px |
| move | 4 | (205,215) → (205,288) | sol projeté, aérien | ±6 px |
| move | 5 | (205,215) → (205,288) | sol projeté, aérien | ±6 px |
| move | 6 | (200,225) → (200,279) | pattes au sol | ±4 px |
| move | 7 | (190,223) → (190,279) | pattes au sol | ±4 px |
| attack | 0 | (185,265) → (185,330) | pattes au sol | ±4 px |
| attack | 1 | (185,262) → (185,330) | pattes au sol | ±4 px |
| attack | 2 | (180,260) → (180,329) | pattes au sol | ±4 px |
| attack | 3 | (195,270) → (195,330) | sol projeté, départ aérien | ±6 px |
| attack | 4 | (200,200) → (200,280) | sol projeté, apex | ±6 px |
| attack | 5 | (205,205) → (205,268) | sol projeté, descente | ±6 px |
| attack | 6 | (190,205) → (190,266) | pattes au sol | ±4 px |
| attack | 7 | (180,205) → (180,267) | pattes au sol | ±4 px |
| death | 0 | (205,300) → (205,388) | pattes au sol | ±4 px |
| death | 1 | (200,315) → (200,388) | pattes au sol | ±4 px |
| death | 2 | (190,338) → (190,388) | contact de chute | ±5 px |
| death | 3 | (180,350) → (180,389) | corps au sol | ±5 px |
| death | 4 | (205,235) → (205,282) | corps au sol | ±5 px |
| death | 5 | (200,238) → (200,284) | corps au sol | ±5 px |
| death | 6 | (195,255) → (195,285) | corps au sol | ±5 px |
| death | 7 | (190,255) → (190,285) | corps terminal au sol | ±5 px |

Les poses move 4–5 et attack 3–5 demandent une validation en lecture animée : leurs plans de sol sont volontairement projetés pour ne pas écraser le saut. Les poses death 3–7 utilisent le contact du corps, car les membres cessent progressivement d’être porteurs.

Validation corrective : la règle `sourceBounds[3] - anchorY <= 0` passe pour **32 poses sur 32**. Le maximum est `0 px`, le minimum `-23 px`, sans échec. Pour idle frame 7, `sourceBounds[3] = 255` et `anchorY = 255`, donc la différence est exactement `0 px`.

## Preuves

- [Échelle idle](v66-worklot-001-dust-runner-scale-root-review/scale-idle.jpg)
- [Échelle move](v66-worklot-001-dust-runner-scale-root-review/scale-move.jpg)
- [Échelle attack](v66-worklot-001-dust-runner-scale-root-review/scale-attack.jpg)
- [Échelle death](v66-worklot-001-dust-runner-scale-root-review/scale-death.jpg)
- [Racines idle](v66-worklot-001-dust-runner-scale-root-review/roots-idle.jpg)
- [Racines move](v66-worklot-001-dust-runner-scale-root-review/roots-move.jpg)
- [Racines attack](v66-worklot-001-dust-runner-scale-root-review/roots-attack.jpg)
- [Racines death](v66-worklot-001-dust-runner-scale-root-review/roots-death.jpg)
- [Ownership des bords idle 4/7](v66-worklot-001-dust-runner-scale-root-review/idle-border-ownership.jpg)

Le fragment machine complet est [V66_WORKLOT_001_DUST_RUNNER_SCALE_ROOT_REVIEW.json](V66_WORKLOT_001_DUST_RUNNER_SCALE_ROOT_REVIEW.json). Tous les SHA des sources et des preuves y sont verrouillés.

Les 32 racines sont aussi transcrites en objets directement compatibles avec `scripts/merge-v66-anchor-reviews.mjs` dans [V66_WORKLOT_001_DUST_RUNNER_ANCHORS.json](V66_WORKLOT_001_DUST_RUNNER_ANCHORS.json), SHA256 `6f42ca1cf8d00587aa497772f63cca138e7e6698119d2a46b42fc741cf0ee6d0`. Le fragment couvre exactement 4 clips et 32 poses, mais **aucune fusion n’a été exécutée**.

## Limites et prochaine porte

- Les facteurs et anchors sont mesurés, mais non appliqués au normaliseur, aux atlas ou au runtime.
- La revue ne certifie ni boucle parfaite, ni portée de collision, ni cleanup du matte, ni acceptation artistique.
- Après autorisation, l’étape suivante est une normalisation ciblée SHA-verrouillée du seul profil 031, suivie d’un contrôle atlas/GIF des transitions et de la hauteur du pounce.
