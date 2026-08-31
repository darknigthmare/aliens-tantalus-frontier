# V66 Runner ImageGen - lot batch-001

Date : 2026-08-31. Profil : `enemy-006-runner` (Runner / Dog Alien, Alien 3).

## Statut et limites

Quatre sources OpenAI selectionnees, chacune de huit poses sur une grille 4x2 :
idle, move, attack, death. Elles constituent UN ennemi a 32 poses, pas quatre
nouveaux ennemis. Statut au transfert : sources selectionnees, en attente de
normalisation commune, d'audit des cellules et de validation runtime.

Mode reel : outil integre OpenAI ImageGen, aucune API/CLI. Six images ont ete
generees au total : les quatre sources retenues, un essai a faux damier rejete,
et une revision d'attaque trop petite. Deux appels avec fichiers references
ont echoue avant generation a cause du helper Windows `apply deny-read ACLs`.

La reference NECA a ete inspectee visuellement. Le modele n'a PAS recu les
fichiers locaux : le premier appel avec les deux photos officielles et le
deuxieme appel avec idle.png comme ancre ont echoue. Les appels effectifs
utilisent les URLs dans le texte, la description anatomique verrouillee et
une inspection comparee. Aucun succes de conditionnement par image n'est
revendique. Fidelite 1:1 non certifiee ; `canonExact: false`.

Le premier essai demandait un vrai alpha. Le resultat est un PNG RGB opaque
avec damier dessine : il est rejete. Les quatre sources retenues sont des PNG
RGB sur fond magenta uniforme destine a etre retire deterministement.
Elles ne sont pas annoncees comme RGBA deja pretes pour le jeu.

## References officielles

- Page produit NECA :
  https://necaonline.com/2019/07/alien-3-7-scale-action-figure-ultimate-dog-alien/
- Vue quadrupede laterale :
  https://eadn-wc04-13179453.nxedge.io/wp-content/uploads/2019/07/5159712.jpg
- Detail anatomique :
  https://eadn-wc04-13179453.nxedge.io/wp-content/uploads/2019/07/515973.jpg

Ces photos sont des references, pas des sprites produits ni des assets runtime.
Elles sont conservees dans le sous-dossier `references/` du lot. Les vues
5159710 et 515976 ont aussi ete telechargees pour inspection exploratoire,
mais ne sont pas utilisees comme ancres ; 515976 montre un accessoire burster.

La page officielle a renvoye 403 via l'outil web, mais sa lecture directe
Invoke-WebRequest a reussi. L'inspection locale via view_image a echoue avec
le helper ACL ; la photo a ete affichee en lecture seule depuis ses octets
par le shell autorise, sans retouche ni reencodage de la source conservee.

## Fichiers selectionnes et empreintes

Racine :
`assets/openai/sprites/frames/v66/batch-001/enemy-006-runner/`

Tous les fichiers selectionnes : 1774x887 pixels, PNG RGB24, huit cellules 4x2.

| Clip | Fichier | Octets | SHA-256 |
| --- | --- | ---: | --- |
| idle | idle.png | 1524164 | 4f1124c192226d7703fcbbd07ddb5777ff1d9f12d885a56bc78bf3f0a8d3d235 |
| move | move.png | 1389506 | d1acc004e5496b9ab3eb998594fe0f5a8473027060461057d3bfff69fccf0009 |
| attack | attack.png | 1397025 | df6c5687bdce5c08dfd68d9df8fecb7557a9ad482bc579a0589020729c587b90 |
| death | death.png | 1357031 | 91a3a38c5dbc191503bf73564a0dcd924792e76c2318e44265fba1e43b3ddcaa |

Originaux ImageGen, copies sans modification depuis :
`C:/Users/chuck/.codex/generated_images/01a0573d-a076-7f31-8d9b-68e56fe93676/`

| Sortie | Nom du fichier original |
| --- | --- |
| idle retenu | exec-58f07dce-1bc2-48ae-b737-ca2bbe619c3c.png |
| move retenu | exec-47ed8a71-1972-4d89-9c06-b7c894b0035e.png |
| attack retenu | exec-0b8b6a8a-845e-4679-9259-796426d63276.png |
| death retenu | exec-e6197a20-07e9-4357-8e3b-a2e9ca70df59.png |
| idle faux damier rejete | exec-c92f938e-d6d2-4b44-a81c-dbc48396870d.png |
| attaque petite echelle rejetee | exec-e4d625e3-8c44-467d-bf90-6a6bc1000e57.png |

## Audit visuel avant normalisation

- Huit poses distinctes visibles dans chaque source, quatre colonnes et deux
  lignes ; aucun collage d'une autre espece observe.
- Silhouette quadrupede fine, dome lisse allonge, palette brun/cuivre, cage
  thoracique exposee, queue segmentee, pas de tubes dorsaux hauts.
- Course : compression, appuis, detente et phase en suspension visibles.
- Attaque : anticipation, depart, detente, frappe, reception et recuperation.
- Mort : effondrement progressif ; derniere pose completement couchee et
  inerte, pas un retour au repos vivant.
- Aucun seuil de fluidite ingame ni resultat de collision n'a ete certifie
  dans cette sous-tache de generation.
- Echelle inter-clips a controler : longueur approximative du dome de la
  pose0, mesure visuelle sur les sources : idle173px, move149px,
  attack147px, death159px. Ne pas dissimuler cet ecart dans les metadonnees.
- Dans la grande attaque retenue, les extremites de deux poses franchissent
  legerement une frontiere mathematique, mais ne touchent pas le voisin :
  pose index3 pied arriere vers x1318 devant la frontiere x1330.5 ;
  pose index4 doigts vers x449 au-dela de x443.5. Ne pas couper ces pixels.
  Le coordinateur retient cette version pour extraction globale avec
  appartenance de composante prouvee et preservation des extremites.
- La revision `rejected/attack-small-scale.png` dispose de marges plus
  grandes, mais reduit excessivement le personnage (dome environ100px).
  Elle n'est pas choisie pour le runtime.
- `rejected/attack-tight-cell-margins.png` est une copie de la grande
  attaque avant arbitrage, conservee pour tracer le choix ; son classement
  ne signifie pas que ce fichier doit etre publie.
- Garde de15pourcent demandee mais non strictement respectee par la source.
  La garde technique de l'atlas normalise doit etre mesuree, pas presumee.

## Prompts effectifs

Les textes ci-dessous sont les prompts complets passes aux appels ayant
produit les quatre sources selectionnees. Aucun fichier reference ne pouvait
etre joint a ces appels a cause de la panne mentionnee plus haut.

### idle.png

```text
Use case: stylized-concept.
Asset type: production sprite-sheet source for a modern side-view pixel-art metroidvania, Runner / Dog Alien from Alien 3 (1992), profile enemy-006-runner.
Reference design: official NECA Ultimate Dog Alien from https://necaonline.com/2019/07/alien-3-7-scale-action-figure-ultimate-dog-alien/ ; quadrupedal side photo https://eadn-wc04-13179453.nxedge.io/wp-content/uploads/2019/07/5159712.jpg ; anatomy detail https://eadn-wc04-13179453.nxedge.io/wp-content/uploads/2019/07/515973.jpg . These URLs identify the requested exact creature; no local reference file is attached. Faithfully preserve the anatomical specification below.
Subject invariants: one lean quadrupedal copper-brown Alien 3 Runner repeated through eight sequential poses; very long smooth glossy dark brown banana-shaped cranial dome; eye-free biomechanical face with metallic teeth; slender exposed ribcage and narrow waist; four long clawed limbs with raised digitigrade hind hocks; long segmented tapering tail with pointed tip; low small spinal vertebrae but absolutely NO tall dorsal exhaust tubes. No queen crest, no human proportions, no armor plates, no fur.
Style/medium: tightly controlled detailed hand-authored pixel-art look, crisp pixel clusters, restrained black/umber/copper highlights, readable game silhouette. Not a 3D toy render. Neutral consistent upper-left lighting.
Camera: exact orthographic side view facing RIGHT in every cell, head at right, tail behind to left; fixed camera and unchanged subject scale, no perspective rotations or foreshortening.
Composition: a wide 2:1 image with exactly FOUR equal columns and TWO equal rows, EIGHT poses in reading order. Invisible equal square cells. Same local root position and common baseline in every cell; keep 15 percent empty margin on ALL four sides of EACH cell, including full tail and fingers. No tail or claw may cross cell boundaries. Full body and tail visible, no cropped poses. IMPORTANT: draw each entire creature including its tail SMALLER: it must occupy only the central 65 percent of its own square cell horizontally. Leave a very obvious magenta gap between every pair of creatures. Tail may curve compactly up behind the body, but never extend beyond the central 65 percent. Subject spine length and head length constant. Maintain the same scale for all eight poses. One creature per cell, no extraneous objects.
Background: absolutely uniform flat chroma key MAGENTA #FF00FF across the entire canvas, including all gaps between limbs and around every tail. The magenta is a production matte to be removed later. No transparency checkerboard, no gradients, no ground shadows, no labels or numbers, no grid or cell borders, no text, no watermark.
Animation: IDLE alert-breathing loop, eight distinct sequential drawings rather than duplicate frames. Pose1 low neutral four-foot stance;2 ribcage gently expands;3 head rises a little while front feet remain planted;4 neck reaches alert apex and tail tip lifts;5 chest eases down;6 head lowers slightly and tail tip sweeps back;7 ribcage at exhale and near forepaw flexes;8 smoothly approaches pose1 without copying it. All eight remain quadrupedal and keep the canonical proportions. Do not substitute a walking cycle. Produce only this eight-frame IDLE sheet. Exactly eight complete distinct frames, four across and two down, no close-ups.
```

### move.png

```text
Use case: stylized-concept.
Asset type: production sprite-sheet source for a modern side-view pixel-art metroidvania, Runner / Dog Alien from Alien 3 (1992), profile enemy-006-runner.
Reference design: official NECA Ultimate Dog Alien from https://necaonline.com/2019/07/alien-3-7-scale-action-figure-ultimate-dog-alien/ ; quadrupedal side photo https://eadn-wc04-13179453.nxedge.io/wp-content/uploads/2019/07/5159712.jpg ; anatomy detail https://eadn-wc04-13179453.nxedge.io/wp-content/uploads/2019/07/515973.jpg . These URLs identify the requested exact creature; no local reference file is attached. Faithfully preserve the anatomical specification below.
Subject invariants: one lean quadrupedal copper-brown Alien 3 Runner repeated through eight sequential poses; very long smooth glossy dark brown banana-shaped cranial dome; eye-free biomechanical face with metallic teeth; slender exposed ribcage and narrow waist; four long clawed limbs with raised digitigrade hind hocks; long segmented tapering tail with pointed tip; low small spinal vertebrae but absolutely NO tall dorsal exhaust tubes. No queen crest, no human proportions, no armor plates, no fur.
Style/medium: tightly controlled detailed hand-authored pixel-art look, crisp pixel clusters, restrained black/umber/copper highlights, readable game silhouette. Not a 3D toy render. Neutral consistent upper-left lighting.
Camera: exact orthographic side view facing RIGHT in every cell, head at right, tail behind to left; fixed camera and unchanged subject scale, no perspective rotations or foreshortening.
Composition: a wide 2:1 image with exactly FOUR equal columns and TWO equal rows, EIGHT poses in reading order. Invisible equal square cells. Same local root position and common baseline in every cell; keep 15 percent empty margin on ALL four sides of EACH cell, including full tail and fingers. No tail or claw may cross cell boundaries. Full body and tail visible, no cropped poses. IMPORTANT: draw each entire creature including its tail SMALLER: it must occupy only the central 65 percent of its own square cell horizontally. Leave a very obvious magenta gap between every pair of creatures. Tail may curve compactly up behind the body, but never extend beyond the central 65 percent. Subject spine length and head length constant. Maintain the same scale for all eight poses. One creature per cell, no extraneous objects.
Background: absolutely uniform flat chroma key MAGENTA #FF00FF across the entire canvas, including all gaps between limbs and around every tail. The magenta is a production matte to be removed later. No transparency checkerboard, no gradients, no ground shadows, no labels or numbers, no grid or cell borders, no text, no watermark.
Identity anchor description: retain the immediately established Alien3 Runner design: thin copper-brown skeletal quadruped, copper edge pixels and dark umber cavities, smooth dark brown long horizontally-curved cranial dome, small exposed metallic teeth, narrow horizontal ribcage, thin forearms, very bent high hind hocks, compact upcurved segmented tail, no dorsal pipes. Fixed strict right-side orthographic camera. Generate NEW movement poses using precisely this design. No local reference file is attached due to a tooling failure.
Animation: RUN / MOVEMENT, exactly EIGHT consecutive hand-drawn poses of a fast quadruped gallop, looping smoothly. Pose1 hind legs compressed forward under narrow abdomen, leading forefoot reaches right. Pose2 near forefoot plants while far forefoot lifts. Pose3 forelegs push backward and hindquarters rise. Pose4 long airborne extension with forelegs reaching right and hind legs stretched left, body still inside cell. Pose5 leading forefoot lands and spine starts compressing. Pose6 both rear hocks swing underneath belly as forelegs tuck. Pose7 rear feet plant and push, forelegs begin next forward swing. Pose8 late takeoff approaching pose1 but visibly distinct. Root motion stays fixed in each cell; believable advancing contacts and tail counterbalance. Never stand upright; never show five limbs; claws and long tapered segmented tail complete in every cell. No motion blur, no smear trails, no duplicate pasted pose. Exactly four columns and two rows, magenta background and generous safe cell spacing. Output only this movement sheet.
```

### attack.png

```text
Use case: stylized-concept.
Asset type: production sprite-sheet source for a modern side-view pixel-art metroidvania, Runner / Dog Alien from Alien 3 (1992), profile enemy-006-runner.
Reference design: official NECA Ultimate Dog Alien from https://necaonline.com/2019/07/alien-3-7-scale-action-figure-ultimate-dog-alien/ ; quadrupedal side photo https://eadn-wc04-13179453.nxedge.io/wp-content/uploads/2019/07/5159712.jpg ; anatomy detail https://eadn-wc04-13179453.nxedge.io/wp-content/uploads/2019/07/515973.jpg . These URLs identify the requested exact creature; no local reference file is attached. Faithfully preserve the anatomical specification below.
Subject invariants: one lean quadrupedal copper-brown Alien 3 Runner repeated through eight sequential poses; very long smooth glossy dark brown banana-shaped cranial dome; eye-free biomechanical face with metallic teeth; slender exposed ribcage and narrow waist; four long clawed limbs with raised digitigrade hind hocks; long segmented tapering tail with pointed tip; low small spinal vertebrae but absolutely NO tall dorsal exhaust tubes. No queen crest, no human proportions, no armor plates, no fur.
Style/medium: tightly controlled detailed hand-authored pixel-art look, crisp pixel clusters, restrained black/umber/copper highlights, readable game silhouette. Not a 3D toy render. Neutral consistent upper-left lighting.
Camera: exact orthographic side view facing RIGHT in every cell, head at right, tail behind to left; fixed camera and unchanged subject scale, no perspective rotations or foreshortening.
Composition: a wide 2:1 image with exactly FOUR equal columns and TWO equal rows, EIGHT poses in reading order. Invisible equal square cells. Same local root position and common baseline in every cell; keep 15 percent empty margin on ALL four sides of EACH cell, including full tail and fingers. No tail or claw may cross cell boundaries. Full body and tail visible, no cropped poses. IMPORTANT: draw each entire creature including its tail SMALLER: it must occupy only the central 65 percent of its own square cell horizontally. Leave a very obvious magenta gap between every pair of creatures. Tail may curve compactly up behind the body, but never extend beyond the central 65 percent. Subject spine length and head length constant. Maintain the same scale for all eight poses. One creature per cell, no extraneous objects.
Background: absolutely uniform flat chroma key MAGENTA #FF00FF across the entire canvas, including all gaps between limbs and around every tail. The magenta is a production matte to be removed later. No transparency checkerboard, no gradients, no ground shadows, no labels or numbers, no grid or cell borders, no text, no watermark.
Identity anchor description: preserve the previously established lean copper-brown skeletal Alien3 Runner, long low smooth dark chocolate dome with a narrow copper rim highlight, thin exposed ribs, high bent rear hocks, copper pixel clusters and dark umber cavities. No local reference file is attached due to a tooling failure.
Animation: POUNCE-AND-BITE ATTACK, eight sequential genuinely different poses, one attack sequence in reading order. Pose1 very low four-foot anticipation crouch, jaws closed. Pose2 compress hind legs farther and pull forepaws back. Pose3 launch diagonally forward and slightly upward, forelimbs starting reach, jaw begins open. Pose4 airborne extension with both foreclaws reaching right and hindlegs pushing back, jaw open. Pose5 the apex of bite strike, smooth long dome still recognizable, small inner jaw briefly projects right and foreclaws splay. Pose6 forefeet landing, head retracts, rear legs collect. Pose7 all feet accept weight in low crouch, jaw closes. Pose8 recovered low quadrupedal neutral stance ready to return to idle. Preserve full anatomy and tail in each cell, no victim, no projectile, no mouth effect, no gore, no trail, no extra limbs. Flight arc is only a small vertical shift inside own square cell; same drawing scale and root alignment; no change of perspective. Four columns, two rows, eight poses, uniform MAGENTA #FF00FF matte, generous margin, no grid or text.
```

### death.png

```text
Use case: stylized-concept.
Asset type: production sprite-sheet source for a modern side-view pixel-art metroidvania, Runner / Dog Alien from Alien 3 (1992), profile enemy-006-runner.
Reference design: official NECA Ultimate Dog Alien from https://necaonline.com/2019/07/alien-3-7-scale-action-figure-ultimate-dog-alien/ ; quadrupedal side photo https://eadn-wc04-13179453.nxedge.io/wp-content/uploads/2019/07/5159712.jpg ; anatomy detail https://eadn-wc04-13179453.nxedge.io/wp-content/uploads/2019/07/515973.jpg . These URLs identify the requested exact creature; no local reference file is attached. Faithfully preserve the anatomical specification below.
Subject invariants: one lean quadrupedal copper-brown Alien 3 Runner repeated through eight sequential poses; very long smooth glossy dark brown banana-shaped cranial dome; eye-free biomechanical face with metallic teeth; slender exposed ribcage and narrow waist; four long clawed limbs with raised digitigrade hind hocks; long segmented tapering tail with pointed tip; low small spinal vertebrae but absolutely NO tall dorsal exhaust tubes. No queen crest, no human proportions, no armor plates, no fur.
Style/medium: tightly controlled detailed hand-authored pixel-art look, crisp pixel clusters, restrained black/umber/copper highlights, readable game silhouette. Not a 3D toy render. Neutral consistent upper-left lighting.
Camera: exact orthographic side view facing RIGHT in every cell, head at right, tail behind to left; fixed camera and unchanged subject scale, no perspective rotations or foreshortening.
Composition: a wide 2:1 image with exactly FOUR equal columns and TWO equal rows, EIGHT poses in reading order. Invisible equal square cells. Same local root position and common baseline in every cell; keep 15 percent empty margin on ALL four sides of EACH cell, including full tail and fingers. No tail or claw may cross cell boundaries. Full body and tail visible, no cropped poses. IMPORTANT: draw each entire creature including its tail SMALLER: it must occupy only the central 65 percent of its own square cell horizontally. Leave a very obvious magenta gap between every pair of creatures. Tail may curve compactly up behind the body, but never extend beyond the central 65 percent. Subject spine length and head length constant. Maintain the same scale for all eight poses. One creature per cell, no extraneous objects.
Background: absolutely uniform flat chroma key MAGENTA #FF00FF across the entire canvas, including all gaps between limbs and around every tail. The magenta is a production matte to be removed later. No transparency checkerboard, no gradients, no ground shadows, no labels or numbers, no grid or cell borders, no text, no watermark.
Identity anchor description: preserve the previously established lean copper-brown skeletal Alien3 Runner, long low smooth dark chocolate dome with a narrow copper rim highlight, thin exposed ribs, high bent rear hocks, copper pixel clusters and dark umber cavities. No local reference file is attached due to a tooling failure.
Animation: DEATH / COLLAPSE, eight distinct progressive side-view drawings from alive to entirely dead, NOT an attack cycle, NOT a recovery loop. Pose1 flinches with lowered shoulder and splayed foreclaws, still on four feet. Pose2 leading elbow buckles, head starts dropping. Pose3 front chest approaches ground while rear hocks fold. Pose4 ribcage falls onto side, limbs give way beneath body. Pose5 body settles sideways, dome and jaw nearly touch ground, legs fold inertly. Pose6 whole body lying flat and tail relaxes, all four limbs bent, mouth slack. Pose7 small final tail-tip uncurl and last settling of head. Pose8 fully lifeless side-lying carcass, dome and ribcage rest on ground, all limbs collapsed and relaxed tail with pointed tip; no restanding. Keep exact same side camera and rightward head orientation. Fully preserve head and tail in every cell, no detached pieces, no blood spray, no puddle, no smoke. Same size throughout; posture height naturally decreases but do not shrink the creature. Four columns, two rows, eight poses, uniform MAGENTA #FF00FF matte, generous margin, no grid or text.
```

## Prompts des essais non retenus

### idle-false-checkerboard.png

```text
Use case: stylized-concept.
Asset type: production sprite-sheet source for a modern side-view pixel-art metroidvania, Runner / Dog Alien from Alien 3 (1992), profile enemy-006-runner.
Reference design: official NECA Ultimate Dog Alien from https://necaonline.com/2019/07/alien-3-7-scale-action-figure-ultimate-dog-alien/ ; quadrupedal side photo https://eadn-wc04-13179453.nxedge.io/wp-content/uploads/2019/07/5159712.jpg ; anatomy detail https://eadn-wc04-13179453.nxedge.io/wp-content/uploads/2019/07/515973.jpg . These URLs identify the requested exact creature; no local reference file is attached. Faithfully preserve the anatomical specification below.
Subject invariants: one lean quadrupedal copper-brown Alien 3 Runner repeated through eight sequential poses; very long smooth glossy dark brown banana-shaped cranial dome; eye-free biomechanical face with metallic teeth; slender exposed ribcage and narrow waist; four long clawed limbs with raised digitigrade hind hocks; long segmented tapering tail with pointed tip; low small spinal vertebrae but absolutely NO tall dorsal exhaust tubes. No queen crest, no human proportions, no armor plates, no fur.
Style/medium: tightly controlled detailed hand-authored pixel-art look, crisp pixel clusters, restrained black/umber/copper highlights, readable game silhouette. Not a 3D toy render. Neutral consistent upper-left lighting.
Camera: exact orthographic side view facing RIGHT in every cell, head at right, tail behind to left; fixed camera and unchanged subject scale, no perspective rotations or foreshortening.
Composition: a wide 2:1 image with exactly FOUR equal columns and TWO equal rows, EIGHT poses in reading order. Invisible equal square cells. Same local root position and common baseline in every cell; keep 15 percent empty margin on ALL four sides of EACH cell, including full tail and fingers. No tail or claw may cross cell boundaries. Full body and tail visible, no cropped poses. One creature per cell, no extraneous objects.
Background: genuinely transparent alpha, no drawn checkerboard, no backdrop, no ground or cast shadow, no grid lines, no labels, no text, no numbers, no watermark.
Animation: IDLE alert-breathing loop, eight distinct sequential drawings rather than duplicate frames. Pose1 low neutral four-foot stance;2 ribcage gently expands;3 head rises a little while front feet remain planted;4 neck reaches alert apex and tail tip lifts;5 chest eases down;6 head lowers slightly and tail tip sweeps back;7 ribcage at exhale and near forepaw flexes;8 smoothly approaches pose1 without copying it. All eight remain quadrupedal and keep the canonical proportions. Do not substitute a walking cycle. Produce only this eight-frame IDLE sheet.
```

### attack-small-scale.png

```text
Use case: stylized-concept.
Asset type: production sprite-sheet source for a modern side-view pixel-art metroidvania, Runner / Dog Alien from Alien 3 (1992), profile enemy-006-runner.
Reference design: official NECA Ultimate Dog Alien from https://necaonline.com/2019/07/alien-3-7-scale-action-figure-ultimate-dog-alien/ ; quadrupedal side photo https://eadn-wc04-13179453.nxedge.io/wp-content/uploads/2019/07/5159712.jpg ; anatomy detail https://eadn-wc04-13179453.nxedge.io/wp-content/uploads/2019/07/515973.jpg . These URLs identify the requested exact creature; no local reference file is attached. Faithfully preserve the anatomical specification below.
Subject invariants: one lean quadrupedal copper-brown Alien 3 Runner repeated through eight sequential poses; very long smooth glossy dark brown banana-shaped cranial dome; eye-free biomechanical face with metallic teeth; slender exposed ribcage and narrow waist; four long clawed limbs with raised digitigrade hind hocks; long segmented tapering tail with pointed tip; low small spinal vertebrae but absolutely NO tall dorsal exhaust tubes. No queen crest, no human proportions, no armor plates, no fur.
Style/medium: tightly controlled detailed hand-authored pixel-art look, crisp pixel clusters, restrained black/umber/copper highlights, readable game silhouette. Not a 3D toy render. Neutral consistent upper-left lighting.
Camera: exact orthographic side view facing RIGHT in every cell, head at right, tail behind to left; fixed camera and unchanged subject scale, no perspective rotations or foreshortening.
Composition: a wide 2:1 image with exactly FOUR equal columns and TWO equal rows, EIGHT poses in reading order. Invisible equal square cells. Same local root position and common baseline in every cell; keep 15 percent empty margin on ALL four sides of EACH cell, including full tail and fingers. No tail or claw may cross cell boundaries. Full body and tail visible, no cropped poses. IMPORTANT: draw each entire creature including its tail SMALLER: it must occupy only the central 65 percent of its own square cell horizontally. Leave a very obvious magenta gap between every pair of creatures. Tail may curve compactly up behind the body, but never extend beyond the central 65 percent. Subject spine length and head length constant. Maintain the same scale for all eight poses. One creature per cell, no extraneous objects.
Background: absolutely uniform flat chroma key MAGENTA #FF00FF across the entire canvas, including all gaps between limbs and around every tail. The magenta is a production matte to be removed later. No transparency checkerboard, no gradients, no ground shadows, no labels or numbers, no grid or cell borders, no text, no watermark.
Identity anchor description: preserve the previously established lean copper-brown skeletal Alien3 Runner, long low smooth dark chocolate dome with a narrow copper rim highlight, thin exposed ribs, high bent rear hocks, copper pixel clusters and dark umber cavities. No local reference file is attached due to a tooling failure.
Animation: POUNCE-AND-BITE ATTACK, eight sequential genuinely different poses, one attack sequence in reading order. Pose1 very low four-foot anticipation crouch, jaws closed. Pose2 compress hind legs farther and pull forepaws back. Pose3 launch diagonally forward and slightly upward, forelimbs starting reach, jaw begins open. Pose4 airborne extension with both foreclaws reaching right and hindlegs pushing back, jaw open. Pose5 the apex of bite strike, smooth long dome still recognizable, small inner jaw briefly projects right and foreclaws splay. Pose6 forefeet landing, head retracts, rear legs collect. Pose7 all feet accept weight in low crouch, jaw closes. Pose8 recovered low quadrupedal neutral stance ready to return to idle. Preserve full anatomy and tail in each cell, no victim, no projectile, no mouth effect, no gore, no trail, no extra limbs. Flight arc is only a small vertical shift inside own square cell; same drawing scale and root alignment; no change of perspective. Four columns, two rows, eight poses, uniform MAGENTA #FF00FF matte, generous margin, no grid or text.
Critical layout correction for this attempt: REDUCE the drawing size of EVERY sprite to only 50 percent of the cell width, including the entire tail and outstretched claws. The empty magenta gutters must be wider than a whole head. Think tiny game sprites centered in very spacious square cells, NOT large concept-art panels. Each of four columns is one quarter of canvas width; each creature's extreme left and right must stay well inside the MIDDLE HALF of its column, including the longest airborne poses4 and5. All8 sprites have exactly the SAME smaller scale. Do not fill the cells. Compact upward C-curve for tail avoids lateral overflow. Absolute priority: all appendages contained with broad plain-magenta margins in every cell.
```

## Appels avec references bloques avant generation

Premier appel : meme base de prompt idle, avec les deux photos NECA locales
dans `referenced_image_paths`. Echec de lecture ACL, aucune image produite.
Deuxieme appel : prompt move avec idle.png comme `referenced_image_paths`.
Meme echec avant generation. Aucun usage de CLI/API de secours.
