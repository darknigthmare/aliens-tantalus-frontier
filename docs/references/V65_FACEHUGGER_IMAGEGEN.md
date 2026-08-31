# V65 - Facehugger : sources et prompts OpenAI

Mode : outil integre OpenAI ImageGen (pas de CLI/API externe).

Reference anatomique consultee : [replique NECA du Facehugger](https://necaonline.com/2016/05/aliens-foam-prop-replica-life-size-facehugger/). La photographie montre la face ventrale ; le jeu conserve une vue laterale de la creature rampante.

Quatre sources distinctes de huit poses ont ete generees : idle, scuttle, attack, death. Elles representent un seul profil Facehugger, pas 32 ennemis ni 500 plaques terminees. Les PNG sources sont conserves sous `assets/openai/sprites/frames/v65/facehugger-*-reference-v65.png`.

Statut de fidelite : adaptation pixel art de la reference, controle de silhouette ; aucune preuve d'identite pixel pour pixel avec un asset officiel. Les variantes Albino, Armored et autres restent des travaux separes.

Trois candidats anterieurs ne sont pas utilises : grille dense irreguliere, damier opaque au lieu d'alpha, puis anatomie trop bipede. La generation retenue a utilise une vraie reference anatomique image et un fond magenta pour la preparation deterministe des atlas RGBA.

## Prompt scuttle

```text
Create one NEW professional pixel-art animation sprite sheet of exactly the canonical Aliens Facehugger shown in the reference, maintaining its distinctive anatomy. The provided reference is the UNDERSIDE of the real creature, for anatomy only; draw the creature crawling LOW on the floor from a side-on gameplay camera, dorsal surface uppermost, underside downward. It must look like a low broad eight-legged spider/crab with a long tail, NOT an upright two-legged creature. There are exactly eight finger-like legs, FOUR on each SIDE of the flat body. Legs radiate laterally and fore/aft around the low body; multiple legs make simultaneous floor contacts. No legs form a fan held vertically above the front; no giant hanging round sack. The paired broad lung sacs lie flat underneath the rear of the body. Beige leathery surface, ribbed long tapering tail. Tail extends LEFT, movement toward RIGHT. Keep film anatomy and proportions faithful to the reference, no redesign.
Layout: landscape 2:1, precise FOUR COLUMNS by TWO ROWS, eight square cells, exactly one entire creature per cell. One seamless EIGHT FRAME SCUTTLE/RUN-IN-PLACE cycle, consecutive poses in reading order. Alternate the near and far four-leg groups through planted, bent, passing and extending positions while keeping torso height low and body length invariant. All poses same body root, scale, viewpoint, lighting and palette; tail makes small follow-through movements. All eight limbs remain attached to the same places. Give 15% blank padding around each entire creature; no cropping. Finely drawn 2D arcade pixel art, sharp pixel clusters, no blur, no painted realism. Solid opaque flat chroma MAGENTA background #FF00FF, including every gap between legs; no checkerboard and no rendered transparency pattern. No text, labels, grid, scenery, ground shadow or extra objects. Output must be an extractable eight-frame animation source, not a concept board.
```

## Prompt idle

```text
Use case: stylized-concept. Production Alien Tantalus Frontier Facehugger animation source. Image1 is the APPROVED pixel-art identity and gameplay viewpoint: exactly match this low crawling eight-legged Facehugger, its beige palette, flat torso, four fingers per side, long tail extending left, right-facing direction, scale and lighting. Image2 is the canonical NECA anatomical reference seen from underside, only use it to preserve limb attachments and paired lung sacs; do not change the gameplay viewpoint to match it. Create a NEW precise FOUR COLUMN TWO ROW sprite sheet, 8 equal square cells, read left-to-right then second row. Entire creature, all tail and toes inside each cell with15% padding. Single unchanging camera and scale, no redesign. Fine detailed arcade PIXEL ART matching Image1. Perfectly flat opaque MAGENTA #FF00FF background including every hole between limbs. No checkerboard, shadows, text, border, grid, props or other creatures. Not a humanoid or upright biped; low broad crab-like body with eight radial finger limbs. Eight consecutive frames of one SEAMLESS IDLE loop. All feet mostly planted, tiny organic torso breathing and alternating fingertip twitches, small tail-tip movement. Frame8 returns naturally to frame1 without copying it. The same fixed body root and ground baseline throughout; anatomy should be virtually identical across frames. This is NOT a walk cycle.
```

## Prompt attack

```text
Use case: stylized-concept. Production Alien Tantalus Frontier Facehugger animation source. Image1 is the APPROVED pixel-art identity and gameplay viewpoint: exactly match this low crawling eight-legged Facehugger, its beige palette, flat torso, four fingers per side, long tail extending left, right-facing direction, scale and lighting. Image2 is the canonical NECA anatomical reference seen from underside, only use it to preserve limb attachments and paired lung sacs; do not change the gameplay viewpoint to match it. Create a NEW precise FOUR COLUMN TWO ROW sprite sheet, 8 equal square cells, read left-to-right then second row. Entire creature, all tail and toes inside each cell with15% padding. Single unchanging camera and scale, no redesign. Fine detailed arcade PIXEL ART matching Image1. Perfectly flat opaque MAGENTA #FF00FF background including every hole between limbs. No checkerboard, shadows, text, border, grid, props or other creatures. Not a humanoid or upright biped; low broad crab-like body with eight radial finger limbs. Eight successive frames of one JUMP-AND-ATTACH ATTACK sequence: 1 low anticipation, 2 deeper finger compression, 3 pushing off, 4 low forward rise with legs reaching, 5 maximum forward reach, 6 fingers curling to clasp an INVISIBLE target, 7 releasing to descend, 8 low landing and recovery. No human victim or body. Same root x and scale; preserve intentional vertical movement inside cell. Torso remains horizontal, front points right, tail follows behind left. No camera rotation, no change to a huge upright hand. Smooth pose-to-pose progression, no duplicate frames.
```

## Prompt death

```text
Use case: stylized-concept. Production Alien Tantalus Frontier Facehugger animation source. Image1 is the APPROVED pixel-art identity and gameplay viewpoint: exactly match this low crawling eight-legged Facehugger, its beige palette, flat torso, four fingers per side, long tail extending left, right-facing direction, scale and lighting. Image2 is the canonical NECA anatomical reference seen from underside, only use it to preserve limb attachments and paired lung sacs; do not change the gameplay viewpoint to match it. Create a NEW precise FOUR COLUMN TWO ROW sprite sheet, 8 equal square cells, read left-to-right then second row. Entire creature, all tail and toes inside each cell with15% padding. Single unchanging camera and scale, no redesign. Fine detailed arcade PIXEL ART matching Image1. Perfectly flat opaque MAGENTA #FF00FF background including every hole between limbs. No checkerboard, shadows, text, border, grid, props or other creatures. Not a humanoid or upright biped; low broad crab-like body with eight radial finger limbs. Eight successive frames of one NON-GRAPHIC DEATH/COLLAPSE sequence: 1 small recoil with planted limbs, 2 body lowers, 3 near fingers begin curling inward, 4 remaining limbs curl inward, 5 torso settles onto ground, 6 tail relaxes, 7 last small finger contraction, 8 completely still dead curled body. No gore, no wounds, no blood. Keep same exact eight-legged anatomy and long tail. Body remains in side-view and faces right; do not flip it onto a different camera view, do not rotate the camera. Progressively lower silhouette; stable ground. Last frame is final corpse, no resurrection.
```

## Conditions de validation

- Grille source 4 x 2, huit poses distinctes par source.
- Une echelle commune aux 32 poses et un pivot de contact stable.
- Alpha reel apres extraction, aucune cellule vide, aucun debordement.
- Une blessure non letale ne lance pas le clip death.
- Tests du decoupage 4 x 8 dans le moteur avant declaration pret.
- Essai visuel navigateur distinct des tests automatises.
