# Provenance OpenAI — vague sprites v47.1

Date : 20 août 2026. Mode : **ImageGen intégré OpenAI**, une génération neuve par asset. Les originaux sont conservés dans le dossier de génération OpenAI; les copies du projet ont ensuite subi uniquement une normalisation Canvas déterministe : retrait du damier connecté, mise à l’échelle 1024×1024, alpha réel, grille 4×4 et gardes transparentes.

## Fichiers et originaux

| Asset du projet | Original ImageGen |
|---|---|
| `assets/openai/echo9-classes-animation-sheet.png` | `C:\Users\chuck\.codex\generated_images\01a01e52-9788-7491-b0fc-ec4c277f25d1\exec-457afdd8-6d41-4568-ba1b-6cf4178a355a.png` |
| `assets/openai/human-factions-animation-sheet.png` | `C:\Users\chuck\.codex\generated_images\01a0202b-295a-7570-a3a9-533b1e8bc437\exec-0d5d3934-5422-4f1b-b16c-da758a8719c9.png` |
| `assets/openai/synthetic-android-animation-sheet.png` | `C:\Users\chuck\.codex\generated_images\01a0202b-295a-7570-a3a9-533b1e8bc437\exec-49324444-a3c0-4d06-87ba-40688c1ace0d.png` |
| `assets/openai/pathogen-fauna-animation-sheet.png` | `C:\Users\chuck\.codex\generated_images\01a0202b-4692-7393-b561-a03d661910eb\exec-8146cda4-e154-49b8-a7b5-abd64382529b.png` |
| `assets/openai/neuro-xeno-animation-sheet.png` | `C:\Users\chuck\.codex\generated_images\01a0202b-4692-7393-b561-a03d661910eb\exec-b919e4c0-53c2-4ed2-8e81-2a807e2e2769.png` |
| `assets/openai/vehicle-animation-sheet.png` | `C:\Users\chuck\.codex\generated_images\01a0202b-64eb-7c71-9f1e-c4728c6c7899\exec-080b22af-d361-4f92-a990-5d148aa06e2a.png` |
| `assets/openai/combat-vfx-animation-sheet.png` | `C:\Users\chuck\.codex\generated_images\01a0202b-64eb-7c71-9f1e-c4728c6c7899\exec-78ed0392-7512-4b9e-be45-e72df6939d38.png` |
| `assets/openai/interactive-props-animation-sheet.png` | `C:\Users\chuck\.codex\generated_images\01a0202b-64eb-7c71-9f1e-c4728c6c7899\exec-31e85a90-9747-43a6-beb3-32e0d0f98f26.png` |

## Prompts finaux exacts

### `echo9-classes-animation-sheet.png`

```text
Create one professional production-ready 2D side-view animation sprite sheet for an original fan-made science-fiction colonial marine squad, suitable for a dark biomechanical survival-horror Metroidvania. Transparent background with true alpha, no checkerboard, no backdrop, no floor, no shadow. Exact rigid 4 columns by 4 rows grid, sixteen isolated cells with generous transparent gutters, equal cell size, nothing crossing cell borders, full body always visible with extra head and foot clearance, consistent baseline and scale.

Each ROW depicts one coherent Echo-9 class as a four-frame sequential animation, facing right:
Row 1: squad commander in battered olive colonial armor — idle/ready sequence frames 1–4.
Row 2: smartgun heavy gunner with articulated support arm — firing/recoil sequence frames 1–4.
Row 3: combat engineer/demolitions specialist with compact tools and charges — deploy device sequence frames 1–4.
Row 4: corpsman/xenobiologist with medkit and specimen scanner — scan/treat sequence frames 1–4.

Visual style: precise hand-painted pixel-art/2D game sprite hybrid, readable silhouettes, restrained olive drab, charcoal, steel, faded unit markings, subtle cold cyan equipment lights, small safety-orange medical/tool accents. Grounded military anatomy and equipment, consistent line weight and lighting, no recognizable actor likeness, original uniform designs inspired by retro-futurist industrial military science fiction. Every adjacent frame changes pose meaningfully while preserving character identity, armor details, equipment proportions, pivot and height.

No text, labels, letters, numbers, logos, UI, frame borders, grid lines, watermark, title card, duplicated poses, cropped weapons, cropped heads, cropped feet, extra limbs, merged characters, photorealism, 3D render, isometric view, front view, perspective floor, background scenery.
```

### `human-factions-animation-sheet.png`

```text
Use case: stylized-concept
Asset type: production-ready 2D game character animation sprite sheet for a side-scrolling science-fiction survival-horror Metroidvania
Primary request: create one EXACT square 4 columns by 4 rows animation atlas. Each row is one original human faction archetype and the four cells in that row are a coherent sequential four-frame combat-walk cycle of the SAME character, facing right, maintaining identical proportions, outfit, equipment, scale, baseline and lighting from frame to frame.
Row 1: original frontier colonial marine specialist, practical olive-drab segmented armor, helmet camera, compact pulse-style rifle, battered fabric and kit, no insignia.
Row 2: original ruthless corporate expedition commando, charcoal tactical suit, sealed half-helmet, compact rifle and industrial survival gear, no logo.
Row 3: original industrial public-security trooper combining austere frontier militia and retro utility-security cues, maroon and ochre accents, utilitarian armor, no insignia.
Row 4: original scavenger colonist-raider altered by a Crucible-like biomechanical neuro-control harness, patched pressure gear, visible control collar, asymmetric salvage weapon; human silhouette remains readable.
Scene/backdrop: genuinely transparent alpha background only.
Style/medium: polished hand-painted pixel-art hybrid, crisp hard-edged silhouettes, 32-bit side-scroller game production art, grounded retro-futurist industrial realism, restrained biomechanical horror, coherent with a dark Alien-inspired universe but wholly original and not copied from any official asset.
Composition/framing: EXACTLY 16 equal square cells in a strict 4x4 grid; one centered full-body side-view sprite per cell; all face right; each sprite occupies at most 68 percent of its cell; identical foot baseline within each row; at least 12 percent empty transparent padding around every sprite; wide completely empty transparent gutters between all cells; no overlap and nothing crosses a cell boundary.
Animation continuity: columns 1-4 are contact, down, passing, and high poses of one loopable armed combat-walk cycle; limbs and coat straps move logically; weapon remains registered to hands; no subject redesign between frames.
Lighting/mood: neutral sprite lighting with subtle cold rim light; readable at small scale.
Color palette: military olive, gunmetal, charcoal, muted maroon and safety ochre; limited high-contrast game palette.
Materials/textures: worn ballistic polymer, canvas, brushed metal, dirty pressure fabric, minimal wet biomechanical detail only on row 4.
Constraints: actual transparent RGBA background; no checkerboard; no floor; no shadow plane; no frame boxes; no grid lines; no labels; no text; no letters; no numbers; no UI; no logos; no emblems; no trademarked symbols; no watermark; no extra characters; no weapons or body parts floating outside their owner; preserve exact row identity and exact scale across all four frames; square 1024x1024 if supported.
```

### `synthetic-android-animation-sheet.png`

```text
Use case: stylized-concept
Asset type: production-ready 2D game synthetic/android animation sprite sheet for a side-scrolling science-fiction survival-horror Metroidvania
Primary request: create one EXACT square 4 columns by 4 rows animation atlas. Each row is one original synthetic archetype and the four cells in that row are a coherent sequential four-frame armed or utilitarian walk cycle of the SAME android, facing right, maintaining identical proportions, costume, equipment, scale, baseline and lighting from frame to frame.
Row 1: calm advanced frontier synthetic officer with neat dark utility clothing, pale humanlike face, restrained expression, subtle white synthetic fluid detail at one temple, wholly original identity.
Row 2: retro-industrial utilitarian service android with rubberized beige hazard suit, hood, blank molded face, work gloves and maintenance tool, wholly original and without logos.
Row 3: heavy combat synthetic, dark segmented ceramic armor, exposed mechanical joints, compact carbine, small cold-white optical sensors, functional not superhero-like.
Row 4: severely damaged synthetic survivor/enemy, torn industrial clothing, exposed white polymer musculature and cables, white synthetic fluid, one compromised arm, still walking; no gore-red blood.
Scene/backdrop: genuinely transparent alpha background only.
Style/medium: polished hand-painted pixel-art hybrid, crisp hard-edged silhouettes, 32-bit side-scroller production art, grounded retro-futurist industrial realism, clinical uncanny horror, coherent with a dark Alien-inspired universe but wholly original and not copied from any official asset.
Composition/framing: EXACTLY 16 equal square cells in a strict 4x4 grid; one centered full-body side-view sprite per cell; all face right; each sprite occupies at most 68 percent of its cell; identical foot baseline within each row; at least 12 percent empty transparent padding around every sprite; wide completely empty transparent gutters between all cells; no overlap and nothing crosses a cell boundary.
Animation continuity: columns 1-4 are contact, down, passing, and high poses of one loopable walk cycle; limbs, loose cables and clothing move logically; carried tool or weapon remains registered to hands; no subject redesign between frames.
Lighting/mood: neutral sprite lighting with subtle cold rim light; highly readable at small scale.
Color palette: off-white polymer, beige rubber, charcoal, oxidized metal, cold blue-white highlights; limited high-contrast game palette.
Materials/textures: molded polymer, synthetic skin, worn rubber, ceramic armor, braided cable, tiny restrained white-fluid damage.
Constraints: actual transparent RGBA background; no checkerboard; no floor; no shadow plane; no frame boxes; no grid lines; no labels; no text; no letters; no numbers; no UI; no logos; no emblems; no trademarked symbols; no watermark; no extra characters; no floating parts; no red blood; preserve exact row identity and exact scale across all four frames; square 1024x1024 if supported.
```

### `pathogen-fauna-animation-sheet.png`

```text
Use case: stylized-concept
Asset type: production-ready 2D side-view game animation sprite sheet for a science-fiction survival-horror Metroidvania
Primary request: create one square PNG sprite sheet arranged as an EXACT strict 4 columns by 4 rows grid, 16 isolated frames total. Every row is one coherent sequential animation read left-to-right. Row 1: an original pale pathogen-born neomorph-like creature, from stalking crouch through a fast predatory lunge. Row 2: an original dark deacon/protomorph lineage creature with a pointed cranial silhouette, four sequential heavy running/attack poses. Row 3: an original trilobite-echo pathogen abomination, a large pale many-limbed parasitic organism, four sequential crawl/grapple poses. Row 4: one original local Tantalus/Korari/Ceto frontier fauna quadruped, bioluminescent deep-sea/reptilian anatomy, four sequential prowl/strike poses.
Scene/backdrop: genuinely transparent background (alpha), no floor, no shadows, no checkerboard, no colored backdrop
Style/medium: polished hand-painted 2D game sprites; restrained retro pixel-art influence; crisp readable silhouettes; gritty cassette-futurist industrial survival-horror; original fan-made designs that fit the Alien-universe visual language without copying any official asset
Composition/framing: exact orthographic side profile facing right in all 16 frames; equal square cells; four equally spaced rows and columns; consistent scale, body proportions, lighting and camera per creature row; generous transparent padding inside every cell; no body part crosses a cell boundary; no grid lines
Lighting/mood: subtle cool rim light and controlled organic highlights; oppressive biomechanical horror; sprite readability prioritized
Color palette: sickly ivory and translucent gray for row 1; black-brown and bone for row 2; pale flesh and blue-gray for row 3; abyssal teal, rust and restrained cyan bioluminescence for row 4
Materials/textures: wet biological tissue, chitin, sinew, translucent membranes; clear separation of limbs and tail
Constraints: EXACTLY 16 frames in a 4x4 matrix; each row must depict the SAME creature across four sequential animation phases; transparent pixels between all cells; full creature visible in every frame including tail and limbs; consistent ground baseline per row; no captions, labels, letters, numbers, UI, logos, trademarks, watermark, border, panel dividers, environment, props, duplicates, contact-sheet annotations, or official copied key art
```

### `neuro-xeno-animation-sheet.png`

```text
Use case: stylized-concept
Asset type: production-ready 2D side-view game animation sprite sheet for a science-fiction survival-horror Metroidvania
Primary request: create one square PNG sprite sheet arranged as an EXACT strict 4 columns by 4 rows grid, 16 isolated frames total. Every row is one coherent sequential animation read left-to-right. Row 1: the SAME original crimson-red xenomorphic caste across four fast stalking-to-pounce phases, with dark red translucent carapace and a clean elongated silhouette. Row 2: the SAME original yellow K-series laboratory xenomorphic caste across four agitated run/acid-strike phases, warning-yellow chitin with restrained black markings. Row 3: the SAME original xenoborg Ripper cybernetic-armored caste across four heavy advance/slash phases, black biomechanical anatomy integrated with practical gunmetal restraint armor, cables and one compact blue sensor. Row 4: the SAME original ATARAX neuro-link controlled xenomorphic caste across four commanded crouch/advance/attack phases, a visible industrial neural-control helmet, temple clamps, insulated cable spine and small amber status lights.
Scene/backdrop: genuinely transparent background (alpha), no floor, no shadows, no checkerboard, no colored backdrop
Style/medium: polished hand-painted 2D game sprites; restrained retro pixel-art influence; crisp readable silhouettes; gritty cassette-futurist industrial survival-horror; original fan-made designs faithful to Alien-universe biomechanical visual language without copying any official asset
Composition/framing: exact orthographic side profile facing right in all 16 frames; equal square cells; four equally spaced rows and columns; consistent scale, body proportions, lighting and camera per creature row; generous transparent padding inside every cell; no tail, limb, helmet or cable crosses a cell boundary; no grid lines
Lighting/mood: cold controlled rim light; oppressive laboratory and military horror; sprite readability prioritized
Color palette: deep crimson and black for row 1; ochre yellow and black for row 2; gunmetal, charcoal and tiny blue optics for row 3; black chitin, worn steel, cables and tiny amber indicators for row 4
Materials/textures: wet chitin, ribbed biomechanical tissue, brushed armor plate, rubberized cables; clear limb and tail separation
Constraints: EXACTLY 16 frames in a 4x4 matrix; each row must depict the SAME caste across four sequential animation phases; transparent pixels between all cells; full creature visible in every frame including tail, limbs and cybernetic equipment; consistent ground baseline per row; no guns, no human figures, no captions, labels, letters, numbers, UI, logos, trademarks, watermark, border, panel dividers, environment, props, duplicates, contact-sheet annotations, or official copied key art
```

### `vehicle-animation-sheet.png`

```text
Use case: stylized-concept
Asset type: production-ready 2D game vehicle animation sprite sheet
Primary request: Create one square 1024x1024 sprite sheet for a side-view science-fiction horror Metroidvania. The image must be a strict 4 columns by 4 rows grid, exactly 16 isolated frames. Each row is one original vehicle and the four columns are sequential animation states: idle, movement, action, damaged.
Scene/backdrop: genuinely transparent RGBA background only; no checkerboard, no floor, no scenery.
Subjects:
Row 1: compact industrial exosuit power loader, hazard-yellow worn machinery, operator cage, hydraulic arms; idle / heavy step / lifting-clamp action / sparks and bent panel damage.
Row 2: low armored personnel carrier, olive-drab colonial utility design, rugged wheels; idle / wheel-motion travel / roof turret firing / scorched damaged state.
Row 3: angular tactical dropship, gunmetal with muted olive panels, side profile; hover idle / thrusters engaged / missile-pod action / smoke and damaged wing.
Row 4: modular colony rover that can convert for flooded tunnels, practical orange-white industrial design; idle / wheel travel / submersible thruster action / cracked damaged state.
Style/medium: polished hand-painted pixel-art-inspired 2D sprites, crisp hard silhouettes, industrial retro-futurism, weathered metal, restrained cinematic detail, original fan-made designs evocative of late-1970s/1980s space horror without copying any official asset.
Composition/framing: exact equal 4x4 cells; every vehicle fully visible in side profile, centered inside its own cell, same scale and anchor within each row; at least 12% transparent padding around every subject; no overlap across cell boundaries; no visible grid lines.
Lighting/mood: cold industrial rim light with restrained amber hazard accents.
Color palette: gunmetal, olive drab, aged yellow, off-white, charcoal, small red warning lights.
Constraints: actual transparent alpha; exactly 16 frames; four visually distinct sequential states per row; no cropped parts; no text; no labels; no letters; no numbers; no logos; no trademarks; no UI; no border; no watermark.
Avoid: opaque or checkerboard background, contact sheet captions, isometric or front view, photorealistic render, concept-art scene, repeated identical frames, merging cells, excessive gore.
```

### `combat-vfx-animation-sheet.png`

```text
Use case: stylized-concept
Asset type: production-ready 2D game combat VFX animation sprite sheet
Primary request: Create one square 1024x1024 effects-only sprite sheet for a side-view science-fiction horror Metroidvania. The image must be a strict 4 columns by 4 rows grid, exactly 16 isolated frames. Each row is one coherent four-frame animation sequence progressing left to right.
Scene/backdrop: genuinely transparent RGBA background only; no checkerboard, no floor, no scenery, no characters, no weapons.
Subjects:
Row 1: compact ballistic muzzle flash and smartgun tracer burst — ignition spark / bright star flash / stretched tracer blast / fading smoke and embers.
Row 2: flamethrower plume — pilot flame / expanding orange jet / roaring long flame / dying heat haze and wisps.
Row 3: alien acid projectile and splash — glowing droplet / stretched spit trail / corrosive impact splash / smoking green residue.
Row 4: industrial combat explosion — sharp ignition / expanding fireball / smoky debris burst with electric sparks / dissipating smoke and glowing cinders.
Style/medium: polished hand-painted pixel-art-inspired 2D game VFX, crisp readable silhouette and intensity progression, restrained retro science-fiction horror aesthetic; original fan-made effects.
Composition/framing: exact equal 4x4 cells; every effect centered and fully contained inside its cell; consistent effect origin and baseline within each row; at least 15% transparent padding; no overlap across cell boundaries; no visible grid lines.
Lighting/mood: luminous energy against transparency, strong hot core and controlled falloff.
Color palette: warm white, amber, orange, soot gray; acidic yellow-green only for row 3; small cold-blue electrical sparks only in row 4.
Constraints: actual transparent alpha; exactly 16 isolated effect frames; four visually distinct chronological phases per row; alpha-friendly soft edges with no rectangular halos; no text; no labels; no letters; no numbers; no logos; no UI; no borders; no watermark.
Avoid: opaque or checkerboard background, scenery, ground shadows, contact-sheet captions, repeated identical frames, merging cells, excessive gore, photographic stock effects.
```

### `interactive-props-animation-sheet.png`

```text
Use case: stylized-concept
Asset type: production-ready 2D interactive prop animation sprite sheet
Primary request: Create one square 1024x1024 sprite sheet for a side-view science-fiction horror Metroidvania. The image must be a strict 4 columns by 4 rows grid, exactly 16 isolated frames. Each row is one original interactive prop and the four columns are sequential gameplay states.
Scene/backdrop: genuinely transparent RGBA background only; no checkerboard, no room, no floor, no scenery.
Subjects:
Row 1: heavy industrial pressure bulkhead door in side-on orthographic game view — sealed / unlocking warning light / half open / fully open.
Row 2: compact automated sentry turret on a stable tripod — folded safe / deploying / tracking with sensor light / firing with small muzzle flash.
Row 3: modular colony terminal with attached compact power-core housing — dormant / booting screens / active green diagnostics and rotating reactor glow / overload red alarms and sparks.
Row 4: square ventilation hatch leading into a short lift or quarantine access tube — closed grate / grate opening / access carriage descending / contaminated quarantine pulse with vapor.
Style/medium: polished hand-painted pixel-art-inspired 2D sprites, crisp readable silhouettes, industrial retro-futurism, worn practical materials, original fan-made designs evocative of late-1970s/1980s space horror without copying any official asset.
Composition/framing: exact equal 4x4 cells; every prop fully visible and centered in its cell; same scale, camera angle and baseline within each row; at least 12% transparent padding around each subject; no overlap across cell boundaries; no visible grid lines.
Lighting/mood: cold industrial light, restrained green terminal glow, amber hazard lighting, red only for alarm state.
Color palette: aged off-white, charcoal, gunmetal, faded olive, muted hazard yellow, small green/amber/red emissive accents.
Materials/textures: scratched steel, rubber seals, bolted panels, cables, mesh vents.
Constraints: actual transparent alpha; exactly 16 frames; four visually distinct chronological states per row; no cropped props; no text; no labels; no readable glyphs; no letters; no numbers; no logos; no trademarks; no UI overlay; no border; no watermark.
Avoid: opaque or checkerboard background, environmental scene, front-facing perspective that breaks side-view use, contact-sheet captions, repeated identical frames, merging cells, excessive gore.
```

## QA de production

`assets/openai/sprite-normalization-report.json` est le rapport machine. Les huit plaques sont en 1024×1024 RGBA, leurs 128 cellules sont occupées et distinctes, les gardes sont transparentes et aucun RGB caché n’est conservé sous l’alpha. Le contrôle navigateur vérifie aussi le chargement réel, les dimensions naturelles et l’alpha nul aux quatre coins.
