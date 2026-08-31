# V66 — Production OpenAI Drone et Warrior, lot 001

Date : 2026-08-31. Périmètre : deux profils, huit planches sources, 64 poses demandées. Ces sources ne signifient ni huit atlas runtime ni 64 ennemis achevés. L'intégration et la validation de l'atlas relèvent du pipeline V66.

## Identités et références consultées

- `enemy-004-drone-big-chap` : Alien (1979), dôme lisse, silhouette humanoïde longiligne, biomécanique noire et reflets gris acier. Référence principale : [NECA Ultimate 40th Anniversary Big Chap](https://necaonline.com/2019/07/alien-7-scale-action-figure-ultimate-40th-anniversary-big-chap/). Photographies inspectées : [vue arrière-profil](https://eadn-wc04-13179453.nxedge.io/wp-content/uploads/2019/07/516463.jpg), [vue de côté trois-quarts](https://eadn-wc04-13179453.nxedge.io/wp-content/uploads/2019/07/516462.jpg).
- `enemy-005-warrior` : Aliens (1986), crâne nervuré sans dôme lisse, reflets bleu acier de la version NECA bleue. Référence principale : [NECA Ultimate Alien Warrior 1986](https://necaonline.com/2017/06/aliens-7-scale-action-figures-ultimate-alien-warrior-1986-assortment/). Photographies inspectées : [profil trois-quarts](https://eadn-wc04-13179453.nxedge.io/wp-content/uploads/2017/06/51647-Aliens-Ultimate-Blue-Warrior-2.jpg), [face](https://eadn-wc04-13179453.nxedge.io/wp-content/uploads/2017/06/51647-Aliens-Ultimate-Blue-Warrior-1.jpg), [détails en éclairage bleu](https://eadn-wc04-13179453.nxedge.io/wp-content/uploads/2017/06/51644-Blue3.jpg).

Les pages NECA ont répondu 403 au lecteur web mais 200 en lecture HTTP publique PowerShell. Deux photographies de comparaison sont conservées dans les sous-dossiers `references/` des profils ; elles ne sont pas des sprites générés et ne doivent pas être publiées dans les assets runtime. Les autres photographies ont été affichées directement depuis leur URL sans créer de fichier local.

Les images sont des adaptations bitmap OpenAI guidées par références sous licence ; une identité 1:1 n'est pas certifiée. Aucune variante systémique ni autre espèce n'est déclarée couverte par ces deux profils.

## Mode de génération et contraintes techniques

Compétence `imagegen` utilisée, mode intégré `image_gen` uniquement : un appel par planche ou correction. Aucun script API, aucune clé API, aucun redessin programmatique. Onze appels ont produit une image ; un essai de référence par chemin local a échoué avant génération.

Le lecteur local `view_image` et la référence `referenced_image_paths` ont échoué sur le helper ACL Windows. Les références ont donc été inspectées via lecture de leurs octets et affichage d'image, sans retouche. Les corrections et déclinaisons ont utilisé les images visibles récentes avec `num_last_images_to_include` : une ancre sprite et une photographie distante sans chemin local, ou trois entrées pour la correction des mains du Warrior. Les images ont été réaffichées dans l'ordre explicité par chaque prompt.

La première demande de transparence a produit un PNG RGB avec damier peint : ce candidat a été rejeté. Les planches suivantes demandent explicitement un fond magenta à détourer. Les huit fichiers retenus sont des PNG RGB 24 bits, 1774 × 887, grille nominale 4 × 2 ; ils ne possèdent PAS d'alpha source. Le magenta généré présente de faibles variations RGB malgré la consigne de couleur uniforme : le pipeline doit faire une clé chromatique contrôlée, pas une comparaison au seul triplet exact FF00FF.

Chaque profil prend sa propre planche `idle.png` comme ancre visuelle. La marche du Drone est bipède ; la course du Warrior est bipède ; les attaques et morts sont non bouclées. Le profil est orienté vers la droite dans toutes les planches, sans transposition automatique d'un autre ennemi.

## Fichiers retenus et provenance

Répertoire source : `assets/openai/sprites/frames/v66/batch-001/<profileId>/<clip>.png`.

Répertoire d'origine générateur : `C:/Users/chuck/.codex/generated_images/01a05742-e675-7d10-9286-d1d7304f4ce4/`. Les fichiers d'origine sont conservés et les sorties retenues ont été copiées dans le projet.

| Profil | Clip | Fichier générateur | SHA-256 source retenue |
| --- | --- | --- | --- |
| enemy-004-drone-big-chap | idle | `exec-599cffe4-89c4-4731-910f-466ca878d8ae.png` | `03d270343e12236cb33e4b0173e67f429a1c4f26b338bf0c6acdf51a501ec5f7` |
| enemy-004-drone-big-chap | move | `exec-1ea1ff66-9d07-4d6d-a145-2d47a3a4e40f.png` | `0065c633761508315c1e0bbe41305a560841dc973254417238a38e87df6de659` |
| enemy-004-drone-big-chap | attack | `exec-46c8659f-e8e2-46d6-a07d-779ae595e13e.png` | `2a57c289a9ad79ea9dd8725cfa6a70b034974131e74a32a6004f6a7ddf03f914` |
| enemy-004-drone-big-chap | death | `exec-6dac5a62-f6a7-4578-bda8-208ede302df1.png` | `bd3efd4437929b821dcb138e4929501ebcb006fbdcc3acbede5c264c7d06b494` |
| enemy-005-warrior | idle | `exec-0c85d913-97e8-4e9e-97cf-a45f825ae11a.png` | `d0a230ad54a25e8f3c1b239929e0278aacd84dbebc438ee9a479c3f710d0744d` |
| enemy-005-warrior | move | `exec-85ce674b-e668-4e4b-8cbc-68f65e22968e.png` | `cc4a12d15f4090a418976e9f35f3dfa137710f7d37ea8b12fcb10efc812ec75a` |
| enemy-005-warrior | attack | `exec-e080f21c-7047-487e-ac1c-658034e9d09d.png` | `811b6a7ec66c9dd9f457bd70c2b2d05afb4f4ab9000b507c06b9cccbdebca7fa` |
| enemy-005-warrior | death | `exec-89587a61-428f-464e-91bb-9d003088c548.png` | `c1520aed413cd3dff7dfb54643ca3ed8d5754410d835123a90f410d1ba58be1c` |

## Contrôles et décisions de sélection

- Drone : dôme lisse conservé dans les quatre séquences, proportions et longueur de crâne cohérentes visuellement, deux bras/deux jambes/une queue ; membres éloignés parfois occultés par le profil. Les poses de mort passent du recul à genoux puis au corps inerte, sans retour à la vie.
- Warrior : crâne nervuré distinct du Drone ; course articulée, attaque avec armé/frappe/récupération, mort progressive. La première attaque allongeait abusivement les doigts en lames : elle a été corrigée avec la main idle et la photographie de référence comme guides.
- Les huit poses de chaque planche sont inspectées visuellement ; l'unicité des cellules et les marges de l'atlas normalisé doivent encore être vérifiées mécaniquement par le pipeline.
- La consigne de garde source de 12 à 15 % n'est pas toujours respectée par le générateur. Il ne faut PAS découper aveuglément la grille source : l'attaque Drone, pose 5, dépasse la frontière x=443,5 jusqu'à environ x=496 (environ 53 px), avec environ 18 px libres avant le sujet voisin. Les composantes des deux créatures restent disjointes. Le pipeline doit réattribuer la composante entière puis normaliser sans couper les doigts.
- La mort Warrior pose 4 descend environ 17 px au-delà de la séparation nominale des deux rangées, sans toucher la pose de la rangée suivante. La course Warrior comporte aussi une extrémité de queue proche d'une frontière. Même exigence : extraction globale non ambiguë et contrôle des pixels avant acceptation.
- Une correction d'attaque Drone avait réduit uniformément les sprites : crâne environ 80 px contre environ 140 px dans l'ancre. Cette version a été REJETÉE pour éviter un changement de taille en combat. Après accord du responsable du pipeline, la version à crâne d'environ 140 px a été remise en `attack.png`, avec extraction par composantes et échelle commune à contrôler. Ne pas calibrer l'échelle à partir de la hauteur globale d'une pose accroupie.
- Les sources ne sont pas déclarées runtime-ready dans ce document. La transparence réelle, les empreintes d'atlas, les marges finales, l'ordre temporel, les pivots et l'intégration combat sont contrôlés séparément avant publication.

### Candidats écartés et copie de comparaison

| Fichier sous le profil | Générateur | Décision |
| --- | --- | --- |
| Drone `rejected/idle-painted-checkerboard.png` | `exec-dba614cc-2505-4e0d-8824-d4ea0f3a7309.png` | Rejet : faux alpha / damier RGB peint. Identité utilisée pour correction guidée. |
| Drone `rejected/attack-small-scale.png` | `exec-557a6c3f-a9ce-426a-815f-b259c95c2fbc.png` | Rejet : réduction inter-clip qui ferait rapetisser le personnage. |
| Drone `rejected/attack-overflow.png` | `exec-46c8659f-e8e2-46d6-a07d-779ae595e13e.png` | Copie de comparaison initialement mise de côté pour débordement ; identique au `attack.png` finalement sélectionné avec extraction globale conditionnelle. Ce doublon ne compte pas comme une nouvelle planche. |
| Warrior `rejected/attack-elongated-fingers.png` | `exec-fce8cab6-e738-4dbc-ae2f-fe0329fa4a61.png` | Rejet : doigts trop longs en lames ; remplacé par correction OpenAI. |

## Prompts réellement utilisés

Les blocs suivants conservent le texte exact envoyé. Les prompts expriment des exigences ; ils ne constituent pas une certification automatique de leur respect par le générateur.

### Drone — première ancre avec transparence demandée (rejet technique)

```text
Use case: stylized-concept.
Asset type: production 2D side-scrolling metroidvania enemy sprite sheet, 8-frame breathing idle loop.
Official identity reference visually inspected: https://eadn-wc04-13179453.nxedge.io/wp-content/uploads/2019/07/516463.jpg (NECA 1979 Alien Big Chap photograph). Match this identity as closely as possible. It faces left; the sprite output must face RIGHT in strict side profile. Do NOT redesign the creature.
Primary request: faithfully adapt this exact 1979 Big Chap creature as detailed crisp pixel-art game sprites. Preserve its very long smooth smoky translucent dome with NO dorsal skull ridges, slim humanoid biomechanical rib cage, black/charcoal glossy body with subdued steel-grey highlights, long slender plantigrade legs, two clawed arms, four dorsal tubes with central spinal spike, one long segmented tail ending in a pointed tip. No blue Warrior ridged head, no Predator features.
Layout: one 2:1 landscape image, exactly FOUR equal columns by TWO equal rows, 8 square cells in row-major chronological order. One complete creature per cell. No lines, frame labels, numbers, captions or UI. Truly transparent alpha background, not white and not a painted checkerboard.
Camera/style: fixed orthographic right-facing profile, no perspective turns, full body and entire tail visible. Pixel-art bitmap with crisp economical pixel clusters and strong silhouette suitable for 256x256 game cells. Same scale, palette and lighting across all eight drawings.
Geometry: creature occupies at most central 70% of each square cell; leave 15% completely empty padding around ALL sides including tail and fingertips. Baseline at 82% cell height. Head points right; tail curves left and stays within its OWN cell. No frame may cross a cell boundary or overlap its neighbour.
Animation: eight genuinely different successive poses of a subtle breathing idle loop. Feet remain grounded at the same baseline and position, torso gently inhales then exhales, claws open fractionally, tail tip has a restrained phase-offset sway. Frame 8 flows back to frame 1 without an identical duplicate. Do not run, attack, change species, add limbs or turn toward the viewer.
Constraints: only this ONE adult 1979 Big Chap, exactly eight complete bodies, natural anatomy consistently two arms/two legs/one tail, no floor shadow, no smoke, no motion blur, no accessories, no text, no decorative grid. Keep identity as faithful as possible to the reference.
```

### enemy-004-drone-big-chap — idle

```text
Use case: precise-object-edit. Input 1 (sprite sheet): edit target, eight right-facing 1979 Big Chap idle sprites. Input 2 (NECA photo): identity reference only, NOT output pose or background.
Keep the excellent right-facing sprite design of Input 1 exactly: smooth long charcoal-grey dome, slender 1979 humanoid biomechanics, two arms, two legs, one segmented tail, dorsal tubes. Do NOT change to a Warrior ridged skull.
Change ONLY technical sheet preparation: replace every checkerboard pixel and every backdrop pixel with perfectly flat solid #FF00FF magenta, NOT transparent and NOT a checkerboard. No magenta on the creature, no magenta fringe, no floor shadow. Every empty pixel must be uniform magenta for chroma key.
Preserve eight distinct consecutive subtle idle breathing poses, same style/identity and right-facing camera. Retain EXACTLY four equal columns and two equal rows, 2:1 canvas, no labels or grid lines. Reduce all creatures uniformly enough to leave at least 15% empty padding in every square cell on all four sides including full tail and claws; common floor baseline at 82%. Do not crop anatomy or bridge adjacent cells. Crisp detailed pixel-art bitmap, identical creature scale and lighting all frames. Output only the corrected game sprite sheet.
```

### enemy-004-drone-big-chap — move

```text
Use case: identity-preserve. Input 1 (magenta sprite sheet): strict character, camera, palette, pixel-art detail and scale anchor. Input 2 (NECA 1979 Big Chap photo): supporting canonical anatomy reference only. Output is NOT the photograph.
Produce the next separate animation sheet: exactly EIGHT consecutive poses of a complete looping RIGHT-facing bipedal stalking WALK of that SAME 1979 Big Chap. Keep smooth elongated smoky dome, no Warrior skull ridges, slim biomechanical torso, four dorsal tubes, two arms, two legs, one segmented tail. Preserve the sprite anchor character exactly, with the same low-key charcoal/steel-grey material.
2:1 landscape, FOUR equal square columns and TWO equal square rows, row-major sequence. Pure uniformly flat #FF00FF magenta background for chroma key, no checkerboard, gradient, shadow, lines, labels or text.
Walk cycle exact phase progression: 1 near heel plants forward / far foot trailing; 2 near foot supports weight and far foot lifts; 3 far knee passes supporting leg; 4 far foot extends forward and near heel lifts; 5 far heel plants forward / near foot trailing; 6 far leg supports and near foot lifts; 7 near knee passes supporting leg; 8 near foot extends forward returning toward frame1. Both arms counter-swing naturally; tail makes a continuous small counterbalancing wave. The eight poses must visibly articulate different leg states, not eight breathing poses or duplicated stills.
Fixed orthographic RIGHT-facing profile, no camera turn, no size drift, pelvis anchored consistently within each cell; common ground line at 82% cell height. Entire head, both hands, all toes and full tail entirely inside own cell, 15% empty safety padding all four sides. All sprites uniformly scaled to respect maximum extended pose. Sharp detailed pixel clusters, no blur, no floor, no scene, no accessory, no extra limbs.
```

### enemy-004-drone-big-chap — attack

```text
Use case: identity-preserve. Image1 magenta idle sprite sheet is the strict character/style/camera anchor. Image2 NECA 1979 photograph is a supporting canonical anatomy reference, not the output pose.
Generate a separate eight-frame RIGHT-facing claw-grab / inner-jaw attack animation for the SAME smooth-domed 1979 Big Chap. Preserve identity exactly: smooth translucent charcoal dome NO Warrior ridges, two arms, two long legs, single segmented tail and dorsal tubes, slim black biomechanical torso, steel-grey sparse highlights. Crisp detailed pixel-art as the anchor.
Layout EXACTLY 4 equal square columns x 2 equal square rows, 2:1 landscape, eight chronological poses. Uniform solid #FF00FF magenta background; no checkerboard, labels, grid, text, shadow or scenery. Whole body and entire tail within own square, 15% empty margin on all edges at the MOST extended pose, same anatomical scale and pelvis anchor across all cells.
Distinct poses row-major: 1 alert bent-knee windup; 2 torso coils slightly back, both claws prepare; 3 head drives forward as both arms begin reaching; 4 full forward claw reach with two hands separated clearly; 5 maximum rightward reach, outer jaws open with short inner jaw visibly projecting toward right; 6 inner jaw retracts, elbows bend; 7 torso and arms recover; 8 near-idle poised stance. Do not duplicate idle pictures; draw genuine anticipation, extension, impact and recovery.
Fixed orthographic right-facing SIDE PROFILE in every pose, no front-facing or three-quarter head, no camera movement. Feet remain tied to a shared ground line, no jumping. Preserve equal head/body dimensions. Do NOT add extra limbs, split tails, wings, teeth outside the mouth or motion trails. No dismemberment, victim or gore.
```

### enemy-004-drone-big-chap — death

```text
Use case: identity-preserve. Image1 magenta idle sprite sheet is the strict identity, rendering, camera and anatomical-size anchor. Image2 official NECA photograph supports the exact 1979 Big Chap anatomy.
Create an EIGHT FRAME non-looping DEATH / collapse sequence of this SAME creature, right-facing side view. Do not attack or respawn. Preserve the SMOOTH elongated dome, black biomechanical slim body, two arms, two legs, single segmented tail, dorsal tubes. Maintain the exact HEAD LENGTH and TORSO LENGTH of the idle anchor in every pose, including lying down. NEVER shrink the body as it collapses.
One 2:1 landscape sheet, exactly FOUR equal square columns x TWO equal square rows, 8 chronological drawings. Pure perfectly flat #FF00FF magenta backdrop for chroma key, not checkerboard or shadow. No text/grid/labels.
Frames: 1 hit recoil with head leaning backward slightly; 2 knees lose strength; 3 drops onto one knee head still to right; 4 both knees buckle torso pitches forward; 5 one forearm contacts floor; 6 torso settles onto side; 7 head rests sideways low on floor, legs folded, tail curls; 8 inert completed corpse with relaxed arms and tail, no renewed rise. Keep the body intact, no blood, dismemberment, attacker or impact FX.
IMPORTANT fit: because the prone creature is long, bend knees and curl the full tail in a compact C around its hindquarters without shortening anatomy. Keep both hands and all toes connected correctly. At least 12% clear cell margin on every edge, no tail/claw crossing a cell border. Same anatomy scale all eight frames; all poses rest on a shared floor baseline at 84% of cell height. Same crisp charcoal/steel pixel-art shading, orthographic right-facing profile with no camera rotation or three-quarter turn. Only body articulation changes.
```

### enemy-005-warrior — idle

```text
Use case: stylized-concept.
Asset type: production 2D metroidvania enemy sprite animation sheet.
Input images 1 and 2 are official NECA 1986 ALIENS Warrior identity references, not the intended camera, environment or figure-joint appearance. Adapt THIS ridged-headed 1986 Warrior faithfully, not the smooth-domed 1979 Big Chap.
Generate exactly eight consecutive RIGHT-facing SIDE-PROFILE breathing idle poses, same individual and scale throughout. Biomechanical glossy black exoskeleton with restrained blue-steel highlights matching film lighting; elongated ridged/nervured cranium with exposed patterned bony rib structure and central crest, NEVER a smooth transparent dome; angular rib cage, long two-legged humanoid stance with claws, two arms with elbow spurs, four dorsal tubes, one long vertebral segmented tail ending pointed. Keep the NECA reference proportions, no toy hinge joints, no armor/accessories added.
Medium: detailed sharp pixel-art bitmap suitable for 256px game cells, strong silhouette and coherent economical pixel clusters, not painterly concept art or a 3D render.
Layout: 2:1 landscape, exactly FOUR EQUAL square columns and TWO EQUAL square rows. Eight frames in chronological row-major order. Background perfectly uniform flat #FF00FF magenta for chroma key. No checkerboard, alpha imitation, floor shadow, grid lines, captions, numbers, text, UI or scenery.
Eight distinct subtle inhale/exhale poses: same planted foot positions at 82% cell height, chest slowly expands then settles, claws tense then relax, tail tip undulates softly. No duplicated stills and no attack or walk. Camera perfectly orthographic side profile facing RIGHT, no front or three-quarter view.
Fit: entire tail and all toes/claws visible inside each square, 15% empty safety margin ALL sides. Keep the tail curved compactly behind the body if necessary, never shorten or crop it. Identical anatomical scale, head length and lighting all eight poses. Only this ONE adult Warrior, exactly eight complete bodies, no extra limbs or tails.
```

### enemy-005-warrior — move

```text
Use case: identity-preserve.
Image1 (magenta 8-frame Warrior idle sheet) is the strict sprite identity, anatomical-size, camera and pixel-art style anchor. Image2 official NECA 1986 Warrior photo is supporting canonical reference. Preserve Image1's clearly RIDGED cranium, NOT a smooth Big Chap dome.
Generate the same Warrior in eight genuinely consecutive poses of a RIGHT-facing aggressive biped RUN loop. Keep same head length, torso length, arm and leg proportions, black/slate-blue exoskeleton, dorsal tubes, elbow spurs and segmented pointed tail. No anatomy morphing or scale drift.
4 equal square columns x 2 equal square rows, exactly 8 frames row-major, 2:1 landscape. Perfectly uniform flat #FF00FF magenta background, no checkerboard, shadow, labels or grid.
Run phases:1 near foot forward contact, opposite leg bent behind;2 near leg absorbs weight, opposite knee advances;3 passing pose with far knee lifted;4 short airborne stride far foot forward near foot backward;5 far foot forward contact;6 far leg absorbs weight and near knee advances;7 near knee passing;8 short airborne stride near foot extends forward before frame1. Counter-swing both arms and phase the tail smoothly. Eight clearly DIFFERENT articulated drawings, not idle poses repeated or just translated.
Fixed orthographic RIGHT-facing profile. No camera rotation, no front views. Root position centered consistently in each cell, common ground baseline at 84%. Keep whole body and full tail within own square with at least12% empty margins; curve tail compactly so it never crosses cell boundaries. Same anatomical SCALE as idle even if crouching makes total pose lower. Crisp pixel clusters and full detail retained, no blur, trails, extra limbs or added objects.
```

### enemy-005-warrior — attack

```text
Use case: precise-object-edit.
Image1 is the eight-frame Warrior ATTACK sheet with raised/sweeping arm; this is the EDIT TARGET.
Image2 is the Warrior IDLE sprite sheet; use it as the strict reference for HAND ANATOMY and claw LENGTH.
Image3 is the official NECA 1986 Warrior photograph supporting the anatomy.
Correct ONLY the attacking hand's fingers in frames2,3,4,5: the current fingers have incorrectly stretched into long Wolverine-like blades. Restore normal articulated, curved, multi-jointed alien fingers at the EXACT same physical length/scale as the idle sheet's hands. Fingers can spread and bend but CANNOT grow. Keep the short sharp nails, no long swordlike spikes from the wrists. Correct the hand anatomy consistently across the whole attack.
Preserve EVERYTHING else: all eight distinct anticipation, arm-rise, slash, full extension, down-sweep and recovery poses; exact character and ridged cranium; body and head sizes; tail shape; right-facing side profile; scale; 4x2 even-grid/2:1 layout; solid uniform #FF00FF background; pixel-art rendering. No text or grid, no floor shadow, no extra limbs or FX. Every complete hand remains inside its cell. Do not replace the attack with idle poses.
```

### enemy-005-warrior — death

```text
Use case: identity-preserve. Image1 is the 8-frame magenta idle sheet, strict Warrior identity, camera, anatomical-size and sprite rendering anchor. Image2 official NECA 1986 photograph is supporting anatomy reference.
Create a separate eight-frame NON-LOOPING death / collapse animation of the SAME ridged-headed ALIENS 1986 Warrior. Preserve the cranium's exact ridged/nervured rib pattern and length, slim black/slate-blue torso and full limbs, dorsal tubes and elbow spurs, two arms, two legs and one segmented pointed tail. NEVER change to Big Chap smooth dome or shrink the creature while it falls.
Exactly 4 equal square columns x2 equal square rows, 2:1 landscape, eight chronological poses. Entire background perfectly flat #FF00FF magenta, not checkerboard, gradient or shadow. No text, captions, grids or effects.
Frame1 hit recoil chest back while still standing;2 knees give way and head droops;3 one knee contacts floor;4 both knees buckle and one hand reaches down;5 upper body tips toward right with forearms catching ground;6 body settles onto its side, legs folded;7 ridged head rests low on floor, arms slack, tail curls;8 completed inert corpse, no standing or attacking again. No dismemberment or gore.
IMPORTANT: keep the exact head length and torso length of idle even when prone. Fold both legs and bend the full tail into a compact C behind the body, to fit all toes, fingers, head and tail inside each OWN square. Do not shorten anatomy to fit. Fixed common floor baseline at84%, 12% clear safety margin on every cell edge, identical anatomical scale across all frames. Orthographic RIGHT-facing side profile, no front view, no camera turn, no lighting changes. Crisp detailed pixel-art bitmap; natural progressive collapse with distinct contact poses.
```

### Drone — correction des marges réduisant trop l'échelle (rejetée)

```text
Use case: precise-object-edit. Image1 is the eight-frame magenta Big Chap attack sprite sheet to correct. Image2 is an official supporting 1979 anatomy reference only.
Keep the EXACT same creature, identity, palette, sharp pixel-art style, RIGHT-facing side-view camera and the eight chronological windup/reach/inner-jaw-strike/recovery poses.
The sole change is sheet packing: every creature is currently too wide, especially frame5 lower-left reaching into the next cell. Uniformly SHRINK ALL EIGHT complete creatures to 70 percent of their current size and center each complete anatomy inside its own square. Do NOT shorten arms, tail or dome; scale the complete drawings uniformly. Retain all eight distinct poses without clipping a fingertip, any of the two arms, two legs or tail tip. Maintain same scale between every frame. The longest left-tail-to-right-claw span must occupy at most 65 percent of cell width.
Canvas 2:1, four EXACT equal square columns, two EXACT equal square rows. Continuous even row/column spacing. Common ground baseline at 80% within each cell. All background perfectly flat #FF00FF magenta with no noise/gradient/shadow/checkerboard. No text, no grid lines, no decoration. This is a game slicing correction, not a redesign.
```

### Warrior — attaque avant correction des mains (rejetée)

```text
Use case: identity-preserve.
Image1 magenta Warrior idle sheet is the strict anatomical size, character identity and sprite style anchor. Image2 is official NECA Aliens1986 Warrior canonical reference only.
Generate eight consecutive frames of a RIGHT-facing Warrior melee CLAW-SLASH attack, with anticipation and recovery. Same ridged/nervured elongated 1986 cranium, NEVER smooth dome; exact same head length and torso proportions as idle. Black/slate blue ribbed biomechanical body, two arms, two legs, four dorsal tubes, elbow spurs, single segmented tail. No palette drift or size changes.
4 EQUAL square columns x 2 EQUAL square rows; 2:1 canvas; 8 row-major chronological full-body poses. Flat uniform #FF00FF magenta background with no checkerboard, shadows, text, motion trails, grid or FX.
Frames:1 crouched anticipation with claws ready;2 nearer elbow rises, nearer claw draws above shoulder, far arm braces;3 nearer arm sweeps forward/up into slash;4 fully extended nearer claw strikes to right at head-height, torso leans;5 claw passes downward through chest-height, outer jaw opens;6 arm pulls back and torso begins recovery;7 elbow lowers and weight centers;8 poised return toward idle. Preserve clear two-arm anatomy, never render extra arms to show motion.
IMPORTANT fitting: maintain SAME HEAD AND TORSO SIZE as idle. Curve the full tail tightly behind the hips in a compact hook to leave room for the outstretched front claw; do not shorten the tail or shrink the whole creature. Entire head, full tail, hands and feet must stay within OWN square with 12% empty safety padding. Identical anatomical scale in all8frames, consistent pelvis/ground anchor at 84% cell height. Fixed orthographic RIGHT-facing side profile; no front-facing frame, perspective turn, blur, dismemberment, victim or scenery. Crisp detailed pixel-art bitmap.
```
