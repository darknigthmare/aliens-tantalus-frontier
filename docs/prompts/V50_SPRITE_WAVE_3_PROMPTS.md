# Prompts exacts v50 — vague 3 ennemis majeurs

Mode : OpenAI ImageGen integre. Un appel distinct a ete effectue pour chaque caste. Les sorties sont conservees comme masters bruts et ne sont pas normalisees dans cette vague.

## Sources et controles

| Asset workspace | Source ImageGen | SHA-256 | Controle brut |
|---|---|---|---|
| `assets/openai/sprites/enemies/xenomorph-warrior-combat-sheet.png` | `C:\Users\chuck\.codex\generated_images\01a0213c-59ea-7bf2-919e-3f130d10608f\exec-f453b866-ce44-460c-911a-13bd5aba3bb3.png` | `0c6cfc68934a59298ccbd54bf5a0fa3498c0f6380b61a28782580cc73d6a8aa0` | 1254x1254 RGB, damier opaque |
| `assets/openai/sprites/enemies/neomorph-locomotion-sheet.png` | `C:\Users\chuck\.codex\generated_images\01a0213c-59ea-7bf2-919e-3f130d10608f\exec-c61be461-0218-4e66-adad-3daac062b68d.png` | `8f0f29bd567add636138ba9fa1a090831c7329bfe622b29bd92ab2ab65bc3156` | 1254x1254 RGB, damier opaque |
| `assets/openai/sprites/enemies/xenomorph-queen-combat-sheet.png` | `C:\Users\chuck\.codex\generated_images\01a0213c-59ea-7bf2-919e-3f130d10608f\exec-284f1ee5-6b68-4806-8647-8991758fc0d1.png` | `061a22796b63c0adee92e1e09b9ab21e8fb378b46adeaa9e0e7e5294a15c30e4` | 1254x1254 RGB, damier opaque |

Les sorties n'ont pas de canal alpha malgre la demande. Le controle de marge sur le master brut detecte au moins un bord a moins de 22 px dans 15 cellules du Warrior, 14 cellules du Neomorph et 15 cellules de la Reine. Les poses restent lisibles, mais le normaliseur central devra isoler, reduire et recentrer chaque sujet avant de reconstruire la garde; un effacement direct des bords couperait surtout les queues et les attaques.

## `xenomorph-warrior-combat-sheet.png`

```text
Use case: stylized-concept
Asset type: production 2D side-scrolling elite enemy sprite sheet
Primary request: Create one exact 4 by 4 animation sprite sheet for one adult xenomorph Warrior. The SAME single Warrior must appear in all sixteen cells with perfectly consistent ridged elongated cranial carapace, eyeless head, heavier ribbed biomechanical exoskeleton, dorsal tubes, muscular digitigrade legs, long forearms, six-fingered claws, inner-jaw proportions, and one long segmented tail. Target canvas 1024 by 1024 pixels, four equal 256 by 256 cells.
Scene/backdrop: genuinely transparent RGBA background only.
Subject: one tall black biomechanical xenomorph Warrior, visibly heavier and more ridged than a Drone, strict full-body orthographic side profile facing right, readable as an elite enemy in a modern cinematic Metroidvania.
Style/medium: polished hand-painted 2D game sprite, cinematic biomechanical horror, crisp silhouette, wet black-chitin highlights, restrained cold rim light, animation-ready rather than unrelated concept poses.
Composition/framing: exact four columns and four rows, exactly one complete centered Warrior per cell, at least 22 fully transparent pixels of guard space inside every cell on all sides. Keep a stable center-bottom pivot for grounded frames. Curl the tail compactly behind or below the body; no crown ridge, dorsal tube, hand, foot, tail, saliva, debris or shadow crosses a cell boundary.
Animation layout, left to right:
Row 1: four-frame threatening idle loop — low neutral, subtle inhale, head lift, return toward neutral.
Row 2: four-frame predatory stalk locomotion loop — right-foot contact, passing pose, left-foot contact, passing pose; stable torso volume and deliberate heavy gait.
Row 3: claw-and-tail combat sequence — claw wind-up, sweeping claw strike, tail wind-up, tail thrust/slash; each attack remains fully inside its cell.
Row 4: hurt-to-death sequence — impact recoil, wounded stagger, collapsing posture, final readable death-lock; no dismemberment.
Color palette: near-black graphite chitin, gunmetal ridges, restrained blue-gray specular edges, tiny neutral saliva highlights.
Materials/textures: biomechanical ribs, glossy armored carapace, tendon detail, segmented tail.
Constraints: exactly sixteen cells and one complete same Warrior per cell; true transparent alpha; consistent anatomy, scale, side profile and lighting; no Drone, Queen, Praetorian, egg, facehugger, chestburster or extra creature; no acid splash; no detached anatomy; no gore; no grid lines, cell backgrounds, checkerboard, floor, scenery, text, letters, numbers, logo, UI, border, labels, captions, watermark, contact-sheet annotations, or copied key art.
Avoid: frontal or three-quarter poses, smooth Drone dome, anatomy drift, oversized subject, cropped tail, tail entering another cell, fused limbs, opaque black/white/gray background, checkerboard transparency preview.
```

## `neomorph-locomotion-sheet.png`

```text
Use case: stylized-concept
Asset type: production 2D side-scrolling pathogen enemy sprite sheet
Primary request: Create one exact 4 by 4 animation sprite sheet for one adult Neomorph. The SAME single Neomorph must appear in all sixteen cells with perfectly consistent smooth pale elongated head, eyeless face, exposed translucent gums and teeth, lean sinewy humanoid torso, long forearms, digitigrade legs, pale tendon anatomy, and one narrow whip-like tail. Target canvas 1024 by 1024 pixels, four equal 256 by 256 cells.
Scene/backdrop: genuinely transparent RGBA background only.
Subject: one gaunt ivory-white Neomorph, organic rather than mechanical, strict full-body orthographic side profile facing right, designed as a fast readable enemy for a modern cinematic survival-horror Metroidvania.
Style/medium: polished hand-painted 2D game sprite, clinical pale biological horror, crisp silhouette, moist semi-translucent tissue detail, restrained cold rim light, animation-ready rather than unrelated concept poses.
Composition/framing: exact four columns and four rows, exactly one complete centered Neomorph per cell, at least 22 fully transparent pixels of guard space inside every cell on all sides. Keep the full skull, hands, feet and tail inside each cell; curl the tail compactly when needed. Stable center-bottom pivot for grounded frames; no limb, tail, saliva, debris, fluid or shadow crosses a boundary.
Animation layout, left to right:
Row 1: four-frame alert idle loop — low neutral, subtle inhale, head lift, return toward neutral.
Row 2: four-frame rapid run locomotion loop — right-foot contact, passing pose, left-foot contact, passing pose; lean forward with stable body volume.
Row 3: leap sequence — compressed anticipation, launch, airborne apex, landing preparation; full anatomy remains visible.
Row 4: hurt-to-death sequence — recoil, wounded stagger, collapse, final curled death-lock; no dismemberment or gore.
Color palette: ivory white, bone gray, very pale flesh-pink joints, muted translucent blue-gray shadows, dark mouth only for silhouette contrast.
Materials/textures: smooth wet skin, sinews, tendon ridges, subtle translucent tissue, narrow tail.
Constraints: exactly sixteen cells and one complete same Neomorph per cell; true transparent alpha; consistent skull, anatomy, proportions, scale, side profile and lighting; no xenomorph dorsal tubes, black carapace, Deacon, Protomorph, human, host or extra creature; no blood, gore or detached body parts; no grid lines, cell backgrounds, checkerboard, floor, scenery, text, letters, numbers, logo, UI, border, labels, captions, watermark, contact-sheet annotations, or copied key art.
Avoid: frontal or three-quarter views, changing head shape, anatomy drift, oversized subject, cropped hands or tail, tail entering another cell, opaque black/white/gray background, checkerboard transparency preview.
```

## `xenomorph-queen-combat-sheet.png`

```text
Use case: stylized-concept
Asset type: production 2D side-scrolling boss sprite sheet
Primary request: Create one exact 4 by 4 animation sprite sheet for one adult xenomorph Queen in combat form. The SAME single Queen must appear in all sixteen cells with perfectly consistent enormous fan-shaped ridged cranial crown, long eyeless face, paired large arms plus smaller secondary arms, tall ribbed biomechanical torso, massive digitigrade legs, dorsal structures, inner-jaw proportions, and one very long segmented blade-tipped tail. Target canvas 1024 by 1024 pixels, four equal 256 by 256 cells.
Scene/backdrop: genuinely transparent RGBA background only.
Subject: one regal black biomechanical xenomorph Queen without egg sac or ovipositor, strict full-body orthographic side profile facing right, readable as a major boss in a modern cinematic Metroidvania.
Style/medium: polished hand-painted 2D game sprite, cinematic biomechanical horror, crisp boss silhouette, wet black-chitin highlights, restrained cold rim light, animation-ready rather than unrelated concept poses.
Composition/framing: exact four columns and four rows, exactly one complete centered Queen per cell. Scale the Queen down deliberately so the entire crown, all arms, both feet and the complete tail occupy no more than about 72 percent of each cell width and 78 percent of each cell height. Preserve at least 28 fully transparent pixels of guard space inside every cell on all sides. Curl the entire tail tightly in an S-shape behind or beneath the body; no crown point, dorsal structure, claw, foot, tail tip, saliva, debris or shadow crosses any cell boundary. Stable center-bottom pivot for grounded frames.
Animation layout, left to right:
Row 1: four-frame dominant idle loop — low neutral, subtle inhale, crown lift, return toward neutral.
Row 2: four-frame heavy advance locomotion loop — right-foot contact, passing pose, left-foot contact, passing pose; stable torso and crown volume.
Row 3: claw-and-tail combat sequence — major claw wind-up, sweeping claw strike, tail wind-up, compact tail slash/thrust; all attacks remain inside each cell.
Row 4: roar-and-hurt sequence — head and crown rise, open-jaw roar, impact recoil, angry recovery; no death pose in this row.
Color palette: near-black graphite chitin, gunmetal crown ridges, restrained blue-gray specular edges, tiny neutral saliva highlights.
Materials/textures: armored biomechanical crown, glossy ribbed carapace, tendon detail, segmented blade tail.
Constraints: exactly sixteen cells and one complete same Queen per cell; true transparent alpha; consistent crown, anatomy, scale, side profile and lighting; no egg sac, ovipositor, eggs, drones, warriors, humans or extra creatures; no acid splash, detached anatomy, blood or gore; no grid lines, cell backgrounds, checkerboard, floor, scenery, text, letters, numbers, logo, UI, border, labels, captions, watermark, contact-sheet annotations, or copied key art.
Avoid: frontal or three-quarter poses, cropped crown or tail, tail entering another cell, oversized Queen, anatomy drift, changing arm count, fused limbs, perspective changes, opaque black/white/gray background, checkerboard transparency preview.
```
