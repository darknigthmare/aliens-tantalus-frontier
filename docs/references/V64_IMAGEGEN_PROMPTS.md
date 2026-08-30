# Prompts OpenAI ImageGen V64 — Newborn, Offspring et Predalien

Ce document conserve les prompts complets disponibles pour les images finales V64. Ils décrivent une adaptation originale source-locked et ne constituent ni une licence de redistribution des références, ni une promesse de copie pixel-identique.

Les références locales sous `.tmp/v64-references/` ont servi d'entrées de recherche temporaires. Les sorties destinées au projet sont listées dans `docs/ART_PROVENANCE_V64.md`.

## Newborn — modèle maître initial

```text
Use case: stylized-concept
Asset type: locked game-character model master for a high-definition 2D side-scrolling sprite production pipeline
Input images: the four most recent images are licensed visual references of the exact Alien Resurrection (1997) Newborn creature; use them only to lock morphology, anatomy, materials, color and identity.
Primary request: create one clean multi-view model master showing the exact same Newborn creature four times: FRONT VIEW, RIGHT-FACING STRICT SIDE PROFILE, BACK VIEW, and LEFT-FACING STRICT SIDE PROFILE. No animation and no action pose. Each view is a neutral, slightly hunched predatory standing pose with both hands relaxed and the entire body visible.
Subject invariants: extremely tall pale humanoid alien hybrid; bone-like human/alien skull and facial structure with dark eye sockets, visible nose bridge, broad exposed fleshy mouth and irregular teeth; narrow ribbed upper torso; swollen hanging ventral abdomen and visible lower-torso organic seam; extremely long thin arms and legs; enlarged distorted elbows, knees, wrists and ankles; oversized malformed long-fingered hands and broad malformed toes; translucent wet ivory-to-muted-olive skin with subtle pink flesh at mouth and abdomen. Exact same proportions, face, anatomy, coloration and surface detail in all four views.
Style/medium: production-ready HD 2D side-scroller sprite art, semi-realistic painted rendering, crisp readable silhouette, controlled texture, consistent with dark cinematic sci-fi creature sprites; NOT a photograph, NOT a 3D toy render, NOT pixel art.
Composition/framing: four evenly spaced full-body figures in one horizontal lineup, identical scale; same horizontal ground line; generous outer and inter-view margins; orthographic camera; no perspective distortion; nothing cropped or overlapping.
Scene/backdrop: perfectly flat uniform chroma-magenta #FF00FF background across every pixel not occupied by the creature.
Lighting/mood: neutral soft studio lighting from the upper front, identical across all four views, minimal subtle self-shadowing on body only; no cast shadow on ground.
Constraints: no labels, no text, no letters, no numbers, no UI, no borders, no panel dividers, no decor, no floor, no environment, no shadow, no platform, no support stand, no chains, no Ripley, no other character, no props, no watermark.
Avoid: no tail, no elongated smooth xenomorph dome, no xenomorph inner jaw, no dorsal tubes, no dreadlocks, no armor, no clothing, no weapons, no mechanical parts, no extra limbs, no mirrored anatomical redesign, no cartoon exaggeration, no black background, no gradient background.
```

## Newborn — correction du crâne

```text
Use case: precise-object-edit
Asset type: corrected locked game-character model master
Input images: Images 1-4 are the licensed Newborn references; Image 5 is the multi-view model master to edit.
Primary request: edit ONLY the skull, face and neck anatomy of all four figures in Image 5 so they match the Alien Resurrection (1997) Newborn references more faithfully.
Required correction: shorten and round the rear skull mass; remove the long classic xenomorph-style dome and the backward sweeping snout silhouette; make the face more recognizably Newborn—bone-like humanoid/alien forehead and cheeks, deeply recessed dark eyes, visible central nose bridge and nostril structure, wide fleshy lips, irregular humanlike exposed teeth, compact jaw. The head sits forward and low on a thick but not serpentine neck. Preserve the same exact head identity across the front, right profile, back, and left profile.
Invariants: preserve EVERYTHING else in Image 5 unchanged—four-view order and spacing; exact body proportions; narrow ribbed torso; swollen ventral abdomen; extremely long arms and legs; malformed hands and feet; skin palette and wet surface; identical scale, ground line, orthographic camera, neutral pose, lighting, crisp HD 2D semi-realistic sprite style; flat uniform #FF00FF chroma-magenta background.
Constraints: no text, labels, UI, borders, dividers, decor, floor, cast shadow, platform, stand, chains, props, other characters or watermark.
Avoid: no elongated smooth xenomorph dome, no inner jaw, no dorsal tubes, no tail, no dreadlocks, no armor, no extra limbs, no cropped body, no overlap, no background gradient.
```

## Newborn — verrouillage du modèle maître final

```text
Use case: precise-object-edit
Asset type: final locked Newborn multi-view model master
Input images: Image 1 is the corrected four-view Newborn model master and is the ONLY edit target. Image 2 is a derived idle strip and must be ignored.
Primary request: return Image 1 as the final production master with no redesign and no pose, anatomy, color, composition, scale, spacing, lighting or background changes. Preserve the exact four-view lineup: front, left-facing profile, back, right-facing profile. Preserve the compact bone-like Newborn skull, recessed dark eye sockets, visible nose and fleshy toothed mouth, narrow torso, swollen ventral abdomen, extremely long limbs and malformed hands/feet.
Scene/backdrop: preserve the perfectly flat uniform chroma-magenta #FF00FF background.
Constraints: exact same full bodies, same ground line and margins; no text, labels, UI, borders, dividers, decor, floor, cast shadow, stand, chains, props, other characters or watermark.
Avoid: do not add a tail, classic xenomorph dome, inner jaw, dorsal tubes, armor, clothing, weapons, extra limbs, crop, overlap or gradient.
```

## Newborn — idle

```text
Use case: identity-preserve
Asset type: Newborn idle keyframe strip for an HD 2D side-scrolling game
Input images: Image 1 is the locked final multi-view Newborn model master. Use its RIGHTMOST fourth figure as the exact right-facing profile identity anchor.
Primary request: create exactly FOUR distinct idle-breathing keyframes of that same Alien Resurrection (1997) Newborn creature, arranged left-to-right in ONE single horizontal row. Every frame is a strict lateral profile facing screen-RIGHT. Frame 1: low hunched neutral inhale; Frame 2: rib cage and hanging abdomen expand subtly, head rises slightly; Frame 3: maximum controlled inhale with shoulders lifted a little; Frame 4: exhale, shoulders and skull settle back down. Motion must loop smoothly and stay subtle.
Identity invariants: exact same compact bone-like humanoid/alien skull with recessed dark eye socket, visible nose bridge and wide fleshy toothed mouth; no elongated xenomorph dome; same narrow ribbed torso, swollen ventral abdomen, extremely long thin arms and legs, malformed long-fingered hands and broad toes, wet translucent ivory-olive skin. Same creature, anatomy, coloration and surface rendering in every frame.
Style/medium: production-ready HD 2D side-scroller sprite art, semi-realistic painted rendering, crisp readable silhouette, matching Image 1; not a photo, not a toy render, not pixel art.
Composition/framing: exactly four equal-width cells implied only by spacing; no drawn dividers; full body visible in every frame; identical scale, camera, lighting, pivot and horizontal ground line; feet remain planted at the same baseline; generous outer and inter-frame margins; orthographic profile; no perspective change; no overlap or crop.
Scene/backdrop: perfectly flat uniform chroma-magenta #FF00FF across every background pixel.
Lighting/mood: identical neutral soft studio light in all frames, no cast shadow.
Constraints: no text, labels, letters, numbers, UI, border, panel lines, decor, floor, platform, stand, chain, prop, other character, watermark or VFX.
Avoid: no tail, no inner jaw, no dorsal tubes, no dreadlocks, no armor, no clothing, no weapons, no extra limbs, no direction changes, no front/three-quarter views, no black or gradient background.
```

## Newborn — chase

```text
Use case: identity-preserve
Asset type: Newborn predatory chase/walk keyframe strip for an HD 2D side-scrolling game
Input images: Image 1 is the locked final multi-view Newborn model master; Image 2 is the validated idle strip and provides exact side-profile scale, palette and rendering consistency.
Primary request: create exactly FOUR distinct keyframes of one seamless predatory forward chase/walk cycle, arranged left-to-right in ONE single horizontal row. Every frame is the exact same Alien Resurrection (1997) Newborn in strict lateral profile facing and traveling screen-RIGHT. Frame 1: left leg extended forward, right leg pushing behind, long arms counter-swing low; Frame 2: passing pose with weight over planted foot, abdomen and shoulders compressed slightly; Frame 3: right leg extended forward, left leg pushing behind, opposite arm swing; Frame 4: second passing pose, body rising slightly before returning to frame 1. Movement is heavy, stalking and humanoid, not quadrupedal.
Identity invariants: exact compact bone-like humanoid/alien skull with recessed dark eye socket, visible nose bridge and wide fleshy toothed mouth; no elongated xenomorph dome; same narrow ribbed torso, swollen hanging ventral abdomen, extremely long thin arms and legs, enlarged joints, malformed long-fingered hands and broad toes, wet translucent ivory-olive skin. Same exact face, anatomy, proportions, coloration and surface detail in every frame.
Style/medium: production-ready HD 2D side-scroller sprite art, semi-realistic painted rendering, crisp silhouette, matching Images 1-2; not a photo, toy render or pixel art.
Composition/framing: exactly four evenly spaced full-body keyframes in one horizontal strip; equal implied cells with no drawn dividers; identical character scale, orthographic camera, lighting, pivot and horizontal ground line; the weight-bearing foot touches the same baseline in all frames; generous outer/inter-frame margins; no crop, overlap or camera shift.
Scene/backdrop: perfectly flat uniform chroma-magenta #FF00FF across every background pixel.
Lighting/mood: identical neutral soft studio light in all frames, no cast shadow.
Constraints: no text, labels, letters, numbers, UI, border, panel lines, decor, floor, platform, stand, chain, prop, other character, watermark or VFX.
Avoid: no tail, inner jaw, dorsal tubes, dreadlocks, armor, clothing, weapons, extra limbs, direction changes, front/three-quarter views, running on all fours, teleporting feet, black or gradient background.
```

## Newborn — attack

```text
Use case: identity-preserve
Asset type: Newborn grab-and-strike attack keyframe strip for an HD 2D side-scrolling game
Input images: Image 1 is the locked final multi-view Newborn master; Image 2 is the validated idle strip; Image 3 is the validated chase strip. Use them as exact identity, right-facing profile, scale, palette and rendering anchors.
Primary request: create exactly FOUR sequential keyframes of one powerful close-range grab-and-strike attack, arranged left-to-right in ONE single horizontal row. Every frame is the exact same Alien Resurrection (1997) Newborn in strict lateral profile facing screen-RIGHT. Frame 1 anticipation: torso crouches and twists slightly back, long arms draw inward; Frame 2 grab lunge: body drives forward while both huge hands reach screen-right at chest height; Frame 3 impact: one arm fully extended in a brutal sweeping forearm/claw strike while the second hand braces close, mouth open in rage; Frame 4 recovery: striking arm retracts and weight settles toward the neutral hunched stance. Make a clear readable silhouette and strong timing without changing identity.
Identity invariants: exact compact bone-like humanoid/alien skull with recessed dark eye socket, visible nose bridge and wide fleshy toothed mouth; no elongated xenomorph dome; same narrow ribbed torso, swollen hanging ventral abdomen, extremely long thin arms and legs, enlarged joints, malformed long-fingered hands and broad toes, wet translucent ivory-olive skin. Same exact face, anatomy, proportions, coloration and surface detail in all four frames.
Style/medium: production-ready HD 2D side-scroller sprite art, semi-realistic painted rendering, crisp silhouette, matching all input strips; not a photo, toy render or pixel art.
Composition/framing: exactly four evenly spaced full-body keyframes in one horizontal strip; equal implied cells with no drawn dividers; reduce figure scale slightly if necessary so every reaching hand remains inside its own cell; identical orthographic camera, lighting, pivot and horizontal ground line; at least one foot remains planted on the same baseline in every frame; generous outer/inter-frame margins; no crop, overlap or camera shift.
Scene/backdrop: perfectly flat uniform chroma-magenta #FF00FF across every background pixel.
Lighting/mood: identical neutral soft studio light in all frames, no cast shadow.
Constraints: no victim or target, no blood, no gore spray, no detached parts, no VFX; no text, labels, letters, numbers, UI, border, panel lines, decor, floor, platform, stand, chain, prop, other character or watermark.
Avoid: no tail, inner jaw, dorsal tubes, dreadlocks, armor, clothing, weapons, extra limbs, direction changes, front/three-quarter views, quadrupedal stance, black or gradient background.
```

## Newborn — death

```text
Use case: identity-preserve
Asset type: Newborn death stagger-to-collapse keyframe strip for an HD 2D side-scrolling game
Input images: Image 1 is the locked final Newborn master; Images 2-4 are the validated idle, chase and attack strips. Use them as exact identity, profile, scale, palette and rendering anchors.
Primary request: create exactly FOUR sequential keyframes of one readable non-gory death animation, arranged left-to-right in ONE single horizontal row. The exact same Alien Resurrection (1997) Newborn remains oriented screen-RIGHT throughout. Frame 1 stagger: torso recoils backward, mouth open, arms spread low, knees beginning to fail; Frame 2 buckle: body drops, one knee reaches the ground, long arms brace; Frame 3 collapse: torso and skull fall forward-right, both hands near the ground, hips sinking; Frame 4 final: creature lies fully collapsed on its right-facing side, curled enough to remain completely inside its own cell, motionless. The progression must read clearly as stagger, kneel, fall, prone.
Identity invariants: exact compact bone-like humanoid/alien skull with recessed dark eye socket, visible nose bridge and wide fleshy toothed mouth; no elongated xenomorph dome; same narrow ribbed torso, swollen hanging ventral abdomen, extremely long thin arms and legs, enlarged joints, malformed long-fingered hands and broad toes, wet translucent ivory-olive skin. Same exact face, anatomy, proportions, coloration and surface detail in all four frames.
Style/medium: production-ready HD 2D side-scroller sprite art, semi-realistic painted rendering, crisp silhouette, matching all input strips; not a photo, toy render or pixel art.
Composition/framing: exactly four evenly spaced full-body keyframes in one horizontal strip; equal implied cells with no drawn dividers; choose a consistent figure scale small enough that even the prone final frame fits fully inside one cell; same orthographic camera and lighting; every pose contacts the same horizontal ground baseline; stable cell-centered pivots; generous outer/inter-frame margins; no crop, overlap or camera shift.
Scene/backdrop: perfectly flat uniform chroma-magenta #FF00FF across every background pixel.
Lighting/mood: identical neutral soft studio light in all frames, no cast shadow.
Constraints: no blood, gore, wounds, dismemberment, acid, detached parts or VFX; no victim or target; no text, labels, letters, numbers, UI, border, panel lines, decor, floor, platform, stand, chain, prop, other character or watermark.
Avoid: no tail, inner jaw, dorsal tubes, dreadlocks, armor, clothing, weapons, extra limbs, direction reversal, front view, black or gradient background.
```

## Offspring — modèle maître initial

~~~text
Use case: stylized-concept
Asset type: canonical game-character model master for a high-definition 2D side-scrolling sprite pipeline
Input images: Image 1 is the official Legacy Effects close front identity and skin/anatomy reference; Image 2 is the official Legacy Effects full-body four-view turnaround and is the primary source for silhouette, proportions, feet, hands, and dorsal anatomy; Image 3 is the official Legacy Effects back reference and is the authority for the exposed vertebral spine and three short organic dorsal tubes; Image 4 is the official on-set scale and physical-proportions reference.
Primary request: create one clean multi-view model master of the Offspring creature from Alien: Romulus (2024), faithfully preserving the exact identifiable film design shown in all four input references. Show exactly four separate full-body orthographic-style views of the same creature, arranged left to right: true front, exact profile facing screen-right, true back, and three-quarter view facing screen-right. This is a consistency anchor, not an animation sheet.
Scene/backdrop: perfectly flat, uniform chroma magenta #FF00FF across the entire canvas; no gradient, texture, horizon, floor plane, cast shadow, ambient shadow, glow, or scenery.
Subject: the same very tall nude hairless humanoid creature repeated four times; elongated bald human-like head with high stretched cranium; narrow severe human face; deeply recessed glossy black eyes; grey-white corpse-pale skin; extremely long narrow neck; drastically emaciated asymmetrical rib cage; elongated thin arms ending in long splayed humanlike fingers; extremely long bowed legs; deformed narrow pelvis; broad splayed feet; sharply readable vertebral ridge; exactly three short truncated organic dorsal tubes visible from rear and profile as in the references; the specific scars, skin folds, exposed tendons, shoulder structure, and gaunt proportions shown in the references. Neutral anatomical stance in every view, arms held away just enough to reveal the torso silhouette.
Style/medium: polished HD 2D side-scroller sprite art, semi-realistic digital painting with crisp game-readable silhouette and controlled hand-painted texture, premium modern sci-fi metroidvania; not a photograph, not a 3D render, not pixel art, not cartoon.
Composition/framing: exactly four equally scaled, fully separated figures with generous clean spacing; each entire body fully visible from the top of the skull to the soles; identical ground line, camera height, scale, anatomy, neutral lighting, and color; no crop, overlap, perspective distortion, labels, captions, panels, cell borders, or grid lines.
Lighting/mood: neutral soft studio illumination from upper front-left, identical on every view, restrained contrast suitable for clean sprite extraction.
Color palette: faithful desaturated grey-white skin with subtle bruised mauve, raw pink scar tissue, and blue-grey anatomical undertones; black eyes and eye sockets.
Constraints: preserve the exact film creature identity and morphology from the four references; four views must unmistakably depict the same individual; front must be true front; profile must face screen-right; back must be true rear; three-quarter must face screen-right. Do not redesign or beautify. No costume, visible genitals, armor, clothing, accessories, weapons, extra limbs, tail, classic xenomorph dome, classic xenomorph outer jaw, long xenomorph dorsal pipes, horns, hair, oversized monster claws, saliva, blood splatter, gore, VFX, UI, text, logo, watermark, frame, shadow, scenery, crop, or overlap. Ignore all source-image text and logos.
~~~

## Offspring — verrouillage du modèle maître final

~~~text
Use case: stylized-concept
Asset type: locked canonical game-character model master for a high-definition 2D side-scrolling sprite pipeline
Input images: Images 1-4 are official Legacy Effects identity, turnaround, rear anatomy, and on-set proportion references. Image 5 is the approved clean four-view model master and is the primary composition and rendering anchor.
Primary request: produce the final clean four-view model master of the same fictional Offspring creature from Alien: Romulus (2024). Preserve Image 5's creature identity, exact four-view arrangement, proportions, scale, spacing, neutral pose, lighting, and rendering style; use Images 1-4 only to reinforce the authentic high elongated bald cranium, narrow humanlike face, glossy black recessed eyes, long neck, gaunt asymmetrical rib cage, exceptionally long limbs, broad feet, vertebral ridge, and exactly three short organic dorsal tubes.
Scene/backdrop: perfectly flat uniform chroma magenta #FF00FF; no gradient, texture, floor, horizon, shadow, scenery, or glow.
Style/medium: non-graphic polished HD 2D side-scroller character art, semi-realistic hand-painted digital sprite rendering with a crisp game-readable silhouette.
Composition/framing: exactly four separate full-body views left to right: true front, profile facing screen-right, true back, three-quarter facing screen-right; identical scale, ground line, camera, and lighting; entire figure visible; generous separation.
Constraints: same fictional individual in all views; pale grey-white skin with subtle natural mauve and blue-grey variation; smooth non-explicit anatomical covering; no exposed organs, open wounds, blood, gore, violence, injury, visible genitals, costume, armor, weapon, tail, classic xenomorph dome or jaw, horns, hair, extra limbs, VFX, UI, text, logo, watermark, grid, panels, crop, overlap, or redesign. Ignore source-image captions and logos.
~~~

## Offspring — idle

~~~text
Use case: stylized-concept
Asset type: production keyframe strip for a high-definition 2D side-scrolling science-fiction game
Input images: Images 1-4 are official practical-effects creature references. Image 5 is the locked final model master and controls the exact same character identity, proportions, materials, palette, lighting, and rendering.
Primary request: draw exactly four separate full-body lateral keyframes of the same tall pale fictional alien creature from Image 5, arranged left to right on one horizontal strip, facing screen-right in every frame. Create a restrained idle loop: neutral stance, gentle upward breathing shift, highest breath with a tiny finger curl, relaxed return. Keep the motion subtle and calm.
Scene/backdrop: perfectly flat, uniform chroma magenta #FF00FF.
Style/medium: polished HD 2D side-scroller sprite art, semi-realistic hand-painted game illustration, crisp silhouette, same as Image 5.
Composition/framing: exactly four isolated frames, one complete head-to-feet creature per frame; equal spacing and scale; strict side view; fixed orthographic camera, lighting, ground line, foot baseline, and root pivot; generous clear margins; no visible cell borders.
Identity lock: preserve the high elongated bald cranium, narrow uncanny face, recessed black eyes, very long neck, emaciated rib silhouette, exceptionally long arms and legs, broad feet, vertebral ridge, three short dorsal tubes, and pale grey-white organic surface from Image 5. The creature has a continuous opaque nonhuman outer surface, designed for family-safe game presentation.
Constraints: screen-right only; exactly four frames; no redesign; no human nudity cues; no conflict, injury, graphic detail, open tissue, fluid, costume, armor, weapons, tail, classic xenomorph dome or jaw, horns, hair, extra limbs, VFX, motion trails, text, logo, watermark, UI, grid, separators, shadows, scenery, crop, or overlap. Ignore all source captions and logos.
~~~

## Offspring — chase

~~~text
Use case: stylized-concept
Asset type: production four-keyframe locomotion strip for a premium HD 2D side-scrolling science-fiction game
Input images: Image 1 is the locked Offspring V64 model master and solely controls the character's identity, proportions, pale organic material, palette, lighting, and rendering.
Primary request: create exactly one horizontal strip of exactly four separate full-body keyframes of this same tall fictional alien creature, all in strict lateral profile facing screen-right, performing its distinctive high, unnatural pursuit gait. Frame 1 long leading-leg heel contact with torso slightly forward; frame 2 very tall passing pose with rear foot lifting and long arms counter-swinging; frame 3 opposite long-stride contact; frame 4 high recovery step with raised knee and trailing foot about to pass. The sequence must read as a continuous eerie fast walk, not a human run, preserving the creature's towering posture and stilt-like limbs.
Scene/backdrop: perfectly flat uniform chroma magenta #FF00FF across the entire canvas.
Subject invariants: exact high elongated bald cranium, narrow uncanny face, recessed black eyes, very long neck, emaciated asymmetric rib silhouette, exceptionally long arms and bowed legs, broad splayed feet, vertebral ridge, exactly three short dorsal tubes, and pale grey-white continuous nonhuman organic surface from Image 1.
Style/medium: polished semi-realistic hand-painted HD 2D side-scroller sprite art; crisp game-readable silhouette; premium modern sci-fi metroidvania; identical finish to Image 1.
Composition/framing: exactly four isolated frames, one complete creature head-to-feet per frame; equal spacing and scale; screen-right in every frame; fixed orthographic side camera, camera height, lighting, ground contact line, foot baseline, and root pivot beneath the pelvis; enough margin for the longest stride; no visible cell borders, crop, overlap, perspective shift, or inter-frame contact.
Constraints: identical fictional character in every frame; exact four frames; family-safe nonsexual creature presentation; no combat, impact, injury, graphic detail, exposed tissue, fluid, costume, armor, weapons, tail, classic xenomorph dome or jaw, horns, hair, extra limbs, VFX, dust, motion trails, UI, text, logo, watermark, grid, separators, numbers, shadows, scenery, crop, or overlap.
~~~

## Offspring — attack

~~~text
Use case: stylized-concept
Asset type: production four-keyframe hostile-action strip for a premium HD 2D side-scrolling science-fiction game
Input images: Image 1 is the locked Offspring V64 model master and solely controls identity, proportions, pale organic material, palette, lighting, and rendering.
Primary request: create exactly one horizontal strip of exactly four separate full-body keyframes of this same tall fictional alien creature, all in strict lateral profile facing screen-right, performing a readable non-graphic reach-and-grab threat sequence with no target present. Frame 1 anticipates by drawing the long neck and shoulders back while opening the hands; frame 2 lunges forward with one very long arm reaching and fingers spread; frame 3 reaches maximum extension with both hands prepared to grasp and the mouth open, showing the creature's short dark inner-tongue threat as a small controlled silhouette contained entirely inside this frame; frame 4 retracts the arm and closes the mouth toward guard. The action must be physically continuous and game-readable.
Scene/backdrop: perfectly flat uniform chroma magenta #FF00FF across the entire canvas.
Subject invariants: exact high elongated bald cranium, narrow uncanny face, recessed black eyes, very long neck, emaciated asymmetric rib silhouette, exceptionally long arms and bowed legs, broad splayed feet, vertebral ridge, exactly three short dorsal tubes, and pale grey-white continuous nonhuman organic surface from Image 1.
Style/medium: polished semi-realistic hand-painted HD 2D side-scroller sprite art; crisp silhouette; premium modern sci-fi metroidvania; identical finish to Image 1.
Composition/framing: exactly four isolated frames, one complete creature head-to-feet per frame; equal scale; screen-right in every frame; fixed orthographic side camera, camera height, lighting, ground contact line, foot baseline, and root pivot beneath the pelvis; generous margins around fully extended hands and inner-tongue; no visible cell borders, crop, overlap, perspective shift, or inter-frame contact.
Constraints: identical fictional character in every frame; exact four frames; no victim or second character; family-safe non-graphic presentation; no impact, injury, blood, gore, torn tissue, fluid, costume, armor, external weapon, tail, classic xenomorph dome or external secondary jaw, horns, hair, extra limbs, VFX, particles, motion trails, UI, text, logo, watermark, grid, separators, numbers, shadows, scenery, crop, or overlap. The short inner tongue appears only within frame 3 and must not cross into adjacent frames.
~~~

## Offspring — death

~~~text
Use case: stylized-concept
Asset type: production four-keyframe defeat-collapse strip for a premium HD 2D side-scrolling science-fiction game
Input images: Image 1 is the locked Offspring V64 model master and solely controls identity, proportions, pale organic material, palette, lighting, and rendering.
Primary request: create exactly one horizontal strip of exactly four separate full-body keyframes of this same tall fictional alien creature, all oriented toward screen-right, performing a non-graphic loss-of-balance and collapse sequence with no cause or opponent shown. Frame 1 staggers backward with the long torso arched and arms lifted for balance; frame 2 knees buckle and the body drops while one hand reaches toward the ground; frame 3 one knee and one hand contact the ground as the long neck folds; frame 4 the creature rests fully collapsed on its right side in a readable final still pose. Preserve a physically continuous arc and the character's extraordinary limb length.
Scene/backdrop: perfectly flat uniform chroma magenta #FF00FF across the entire canvas.
Subject invariants: exact high elongated bald cranium, narrow uncanny face, recessed black eyes, very long neck, emaciated asymmetric rib silhouette, exceptionally long arms and bowed legs, broad splayed feet, vertebral ridge, exactly three short dorsal tubes, and pale grey-white continuous nonhuman organic surface from Image 1.
Style/medium: polished semi-realistic hand-painted HD 2D side-scroller sprite art; crisp silhouette; premium modern sci-fi metroidvania; identical finish to Image 1.
Composition/framing: exactly four isolated frames, one complete creature per frame; equal character scale even as pose height changes; facing or falling toward screen-right; fixed orthographic side camera, camera height, lighting, shared floor baseline, and consistent root reference; wide margins for the full standing and horizontal collapsed silhouettes; no visible cell borders, crop, overlap, perspective shift, or inter-frame contact.
Constraints: identical fictional character in every frame; exact four frames; no attacker, weapon, impact, wound, damage mark, blood, gore, torn tissue, fluid, dismemberment, costume, armor, tail, classic xenomorph dome or jaw, horns, hair, extra limbs, VFX, particles, motion trails, UI, text, logo, watermark, grid, separators, numbers, shadows, scenery, crop, or overlap. Family-safe non-graphic creature animation.
~~~

## Predalien — master

~~~text
Use case: stylized-concept
Asset type: locked character reference master for a production HD 2D side-scroller sprite pipeline
Input images: the earliest image is the existing V64 multi-view model master; the following images are its approved idle, chase and attack strips. Use all four only to consolidate the exact same character identity and rendering. Do not invent another creature.
Primary request: Produce the final clean multi-view model master of the exact Predalien from Alien vs. Predator: Requiem (2007). It must NOT be the 2010 game Abomination. Preserve the approved design while emphasizing the film creature’s enormous heavy female hybrid mass, broad shoulders, thick rib cage and practical-suit proportions rather than a slim generic warrior alien.
Subject lock: broad heavy dark semi-translucent ridged Xenomorph crest/dome; visible small deep-set Predator eyes; four long articulated external mandibles framing inner jaws; dense thick black rope-like tendrils/dreadlocks from the rear and sides of the skull; massive black-brown and muted olive biomechanical torso and limbs; elongated clawed hands; segmented attached Xenomorph tail; powerful digitigrade legs and large clawed feet. No armor or technology.
Views: exactly five complete orthographic full-body views on one horizontal canvas: front, clean right-facing profile, back, clean left-facing profile, and right-facing three-quarter. Same creature, exact same scale, exact same ground line, neutral anatomical stance. Complete crest, tendrils, hands, feet and attached tail fully visible within each view.
Style/medium: production-quality HD 2D game sprite illustration matching the approved animation strips, semi-realistic dark modern metroidvania, crisp hand-painted contours, controlled material highlights.
Scene/backdrop: perfectly flat uniform chroma magenta #FF00FF only.
Lighting/mood: neutral soft studio key identical across views; no cast shadow or floor reflection.
Composition/framing: generous outer margin and equal spacing; no crop, overlap or touching between views; all feet share one ground line.
Constraints: exact AVP: Requiem 2007 Predalien identity; consistent anatomy, palette, camera, pivot and scale; no transparency.
Avoid: armor, mask, shoulder cannon, gauntlet, wrist blades, netting, straps, clothing, weapons, jewelry or Predator technology; no 2010 Abomination; no Queen crown, breasts, extra limbs, generic Predator equipment, humans, blood, gore, environment, props, rain, mist, slime, VFX, border, boxes, grid, labels, numbers, text, logo, UI, watermark, floor, cast shadow, gradient, vignette, texture, checkerboard or backdrop color variation.
~~~

## Predalien — idle

~~~text
Use case: stylized-concept
Asset type: corrected four-keyframe production idle strip
Input images: the earlier image is the FINAL LOCKED V64 Predalien master; the most recent image is the idle strip to correct. Preserve the exact creature, rendering, four breathing poses, right-facing direction, scale and magenta background.
Primary request: Regenerate the same four-frame subtle IDLE breathing strip, correcting only sprite-cell containment and root alignment.
Hard cell geometry: the canvas is divided into four equal vertical quarters at 25%, 50% and 75% width. Each complete creature—including every dreadlock, claw, foot and the entire attached tail—must remain strictly inside its own quarter with at least 6% of that quarter’s width as empty magenta padding on both left and right. Nothing crosses an imaginary quarter boundary. Make each tail a compact near-vertical S curve immediately behind its creature’s legs, never a broad horizontal sweep.
Frame order: 1 neutral hunched; 2 slight inhale; 3 slight exhale with tail tip lifting; 4 near-neutral with tiny claw flex and mandibles slightly parted.
Alignment: exactly four complete RIGHT-FACING side-profile figures; identical scale/body mass/camera/light; same foot ground line and root/pivot; center each root at 12.5%, 37.5%, 62.5%, 87.5% canvas width.
Style/backdrop: match inputs exactly; perfectly flat uniform #FF00FF; no shadow, floor, transparency or separators.
Keep unchanged: exact AVP: Requiem 2007 Predalien anatomy and palette; no armor or technology.
Avoid: cell-boundary crossing, overlap, crop, wide tails, left-facing/mirrored poses, redesign, anatomy drift, size drift, attack/running, VFX, motion blur, environment, props, grid, boxes, lines, labels, numbers, text, logo, UI, watermark, gradient, checkerboard or magenta variation.
~~~

## Predalien — chase

~~~text
Use case: stylized-concept
Asset type: four-keyframe production chase animation strip
Input images: the earliest included image is the FINAL LOCKED V64 Predalien master; the most recent image is the corrected approved idle strip and defines exact style, scale, right-facing profile, cell containment, magenta background and ground line. Ignore the intermediate superseded idle attempt.
Primary request: Create exactly four full-body lateral RIGHT-FACING CHASE/RUN keyframes of the same locked AVP: Requiem 2007 Predalien, reading as one powerful predatory digitigrade sprint cycle.
Frames left to right: 1 contact—forward foot planted, rear leg extended, torso pitched forward; 2 compression/down—hips low, legs gathering, arms counter-swing; 3 passing/up—trailing foot passes, torso rises slightly, tail counterbalances; 4 opposite contact—limbs exchanged, long stride and strong forward momentum. Mandibles stay threatening but stable; dense tendrils and segmented tail trail coherently.
Hard cell geometry: canvas divided into four equal vertical quarters. Each complete creature including crest, every tendril, claws, feet and entire attached tail stays strictly inside its own quarter with at least 4% internal empty magenta padding left and right. Nothing crosses the imaginary 25%, 50%, 75% boundaries. Center roots at 12.5%, 37.5%, 62.5%, 87.5%. Use a compact backward/low S-curved tail in every frame.
Alignment: locked body mass and scale; identical right-profile camera and lighting; common foot-contact ground line/root system; no overlap or crop.
Style/backdrop: production HD 2D semi-realistic dark modern metroidvania matching inputs; perfectly flat uniform #FF00FF; no shadow, floor or transparency.
Avoid: armor or Predator technology, 2010 Abomination, redesign/anatomy/palette drift, left-facing/mirrored poses, quadruped stance, cell-boundary crossing, attack impact, gore, VFX, speed lines, blur, environment, props, grid, separators, labels, text, logo, UI, watermark, gradient, checkerboard or magenta variation.
~~~

## Predalien — attack

~~~text
Use case: stylized-concept
Asset type: four-keyframe production attack animation strip
Input images: both included images depict the same locked V64 AVP: Requiem 2007 Predalien chase cycle. Preserve that exact creature identity, anatomy, palette, materials, right-facing profile, rendering and scale.
Primary request: Create exactly four separate full-body lateral RIGHT-FACING ATTACK keyframes combining signature mandible threat, claw strike and attached-tail windup without detached VFX.
Frames left to right: 1 anticipation—low wide digitigrade brace, torso twisted slightly back, near claw retracted, all four mandibles flared, tail coiled compactly; 2 mandible-and-claw lunge—head/chest thrust right, four mandibles and mouth open, near claw rakes forward, rear foot anchors; 3 follow-through—claw passes target plane, shoulders rotate, tail begins a compact low counter-sweep; 4 recovery/next tail-strike windup—stable crouch, tail raised in a compact hooked arc immediately behind the body, mandibles beginning to close.
Hard cell geometry: canvas divided into four equal vertical quarters at 25%, 50%, 75%. Each complete creature, every tendril, limb and entire attached tail remains strictly inside its own quarter with at least 4% internal magenta padding left/right. Nothing crosses boundaries. Center roots at 12.5%, 37.5%, 62.5%, 87.5%. Use tightly coiled/near-vertical tails rather than broad horizontal tails.
Alignment: same locked body mass/scale/camera/light; common foot ground line/root system; no crop or overlap.
Style/backdrop: production HD 2D semi-realistic dark modern metroidvania matching inputs; perfectly flat uniform #FF00FF only; no floor, shadow, transparency or separator.
Avoid: armor/Predator tech, 2010 Abomination, redesign or anatomy/palette drift, left-facing/mirroring, cell crossing, victims, blood/gore, acid/saliva strands, projectiles, slash trails, impact stars, VFX, blur, props, environment, grid, boxes, labels, text, logo, UI, watermark, gradient, checkerboard or magenta variation.
~~~

## Predalien — death

~~~text
Use case: stylized-concept
Asset type: four-keyframe production death animation strip
Input images: the included images show the same locked V64 AVP: Requiem 2007 Predalien in chase and attack. Preserve that exact creature identity, anatomy, palette, materials, semi-realistic rendering and rightward orientation.
Primary request: Create exactly four separate DEATH keyframes progressing clearly from stagger to complete grounded collapse. No gore, dismemberment or disappearance.
Frames left to right: 1 heavy backward stagger while still standing, chest recoils, arms spread unevenly, knees beginning to fail; 2 buckle transition, torso folds forward and one knee meets the ground, tendrils and tail lag; 3 sideways fall in progress, shoulder/hip descending, limbs losing tension, tail in a compact safe curve; 4 final motionless side-lying body fully on the ground, head/crest visible and oriented right, mandibles slack, claws relaxed, entire attached tail settled compactly.
Hard cell geometry: four equal vertical quarters. Each complete silhouette—including crest, every tendril, limb and whole attached tail—must remain strictly inside its own quarter with at least 4% internal magenta padding left/right. Nothing crosses 25%, 50%, 75% boundaries. Root centers at 12.5%, 37.5%, 62.5%, 87.5%. Final prone body must fit inside quarter 4 without crop.
Alignment: same locked body mass/scale/camera/light; shared ground line; no overlap. Lower poses naturally occupy less vertical height but do not enlarge them.
Style/backdrop: production HD 2D semi-realistic dark modern metroidvania matching inputs; perfectly flat uniform #FF00FF only; no floor, cast shadow, transparency or separators.
Avoid: armor/Predator tech, 2010 Abomination, redesign/anatomy/palette drift, left-facing/mirroring, boundary crossing, blood, gore, acid, wounds, detached limbs, VFX, blur, environment, props, floor, shadow, grid, boxes, labels, text, logo, UI, watermark, gradient, checkerboard or magenta variation.
~~~
