# V66 worklot 001 — Protomorph reference review

Profile: `enemy-038-protomorph`
Batch: `batch-003`
Review date: `2026-09-01`
Scope: reference, identity, scale and animation contract only. No image was generated, accepted or integrated.

## Authority and naming decision

| Source | Authority used here | Production finding |
| --- | --- | --- |
| 20th Century Studios, *Alien: Covenant* | Official film identity and release context | Establishes the film source; it is not treated as a sprite or anatomy sheet. |
| MPC, *Alien: Covenant* | Primary VFX production account | Calls the adult creature the **Xenomorph**, separates it from the Neomorph, and describes an original-Alien-recognisable creature with deliberately non-human proportions and animal-derived motion. |
| Odd Studio / Adam Johansen interview | First-hand practical creature-effects account | Records Ridley Scott's flayed-waxwork direction: visible ribs, skin and musculature, very thin proportions, transparent-resin carapace details and an approximately nine-foot presence. |
| fxguide interviews with MPC and Framestore | First-hand VFX account | Describes thin fascia over muscle and bone, patchy wetness, a roughly 2.5 m adult, more organic/waxy anatomy, and great-cat, ape, bird and insect movement references. |
| Colin Shulver interview | First-hand concept-design account | Reports **Protomorph** as the working name used during the production design phase and that overt biomechanical additions were rejected. |

`Protomorph` is therefore retained as this project's internal profile label. It is not presented as an official on-screen taxon: the final creature is called the Xenomorph by the inspected VFX source. The V66 board must be an original project interpretation of the reviewed film anatomy, not a pixel-identical copy of film frames or published concept art.

## Existing V56 project evidence

| Asset | Technical evidence | Useful continuity | V66 limitations |
| --- | --- | --- | --- |
| `assets/openai/sprites/enemies/protomorph-action-sheet-v56.png` | 1254×1254 RGBA; SHA-256 `d11477e11b25ae4143aa3f91301e1af62dc4ed05a8222fb6a4939588a26572d2`; no embedded prompt/receipt found | Red-black flayed silhouette, right-facing presentation, tail and dorsal-process intent | Square sheet, no V66 cell contract, no generation provenance |
| `assets/openai/sprites/normalized/enemies/protomorph-action-sheet-v56.png` | 1024×1024 RGBA; 4×4; SHA-256 `103633e135b17b7f74f3e86e05dfe846c45f9a7e304a3a4d3232f9cd9bae40e4`; prior alpha audit had no finding | Four-phase idle/chase/attack/death motion anchor; clean transparent gameplay predecessor | Four poses per clip instead of eight; head can drift toward a glossy Big Chap dome; stance is sometimes too upright/humanoid; tubes, limb mass and tail connection are not sufficiently stable for a new master |

The V56 files are project history only. They may guide palette, broad silhouette and action intent, but no V56 frame is a V66 source master and none should be copied frame-for-frame.

## Locked identity

- Tall, extremely lean but powerful adult Covenant form: narrow waist, exposed ribs, sinewy arms, large clawed hands, long multi-jointed legs and a forward hunter posture.
- Exactly two arms and two legs. Eyeless elongated swept dome, hard jaw, ivory teeth and a readable secondary inner jaw.
- Thin wet fascia over visible red-black muscle, ribs and bone landmarks; dark maroon, charcoal, bone and restrained patchy highlights. Never pale ivory, uniform blue-black metal or neon pink.
- One long organic tail visibly rooted at the sacrum and ending in one sharp tip in all poses.
- Exactly four principal dorsal tubes/processes, attached to the upper back with constant count, placement and spacing across all clips.
- Strict right-facing orthographic gameplay profile. Dome, tubes, hands, feet and full tail remain inside each cell with no neighbouring-cell contact.
- No Queen crest, armor, clothing, technology, carried weapon, mechanical implant, extra limb, visible eye or magenta anatomy.

### Distinction gates

- **Neomorph:** never pale/ivory, soft-skinned or dominated by a sensory bulb and solid dorsal spikes. The 038 form is darker, ribbed, tailed, tube-bearing and more confident/heavy in motion.
- **Deacon:** never blue, tail-less or tube-less, and no pointed mitre-like skull.
- **Big Chap:** retain Alien-family recognition but avoid the 1979 creature's dominant blue-black biomechanical piping, rigid suit-like mass and cleaner mechanical surface grammar. The Covenant form stays flayed, organic, fascia-thin and red-black.

## V66 scale and physical-root contract

- Four independent source boards are required: `idle`, `move`, `attack`, `death`. Each board is 2:1, a 4×2 grid, and contains eight distinct chronological right-facing poses at one common source resolution and identity scale.
- `idle` is the inter-clip scale baseline. The approximately nine-foot / 2.5 m source impression is translated into relative gameplay scale; it is not a literal pixel-height target.
- Reserve at least 15% safe visual margin around every complete pose. No dome, dorsal process, hand, foot or tail tip may cross a cell boundary.
- Measure the same rigid anatomical invariant in two comparable poses per clip: the cranial-dome chord from the posterior dome root to the anterior hard-dome point immediately above the jaw. Do not calibrate from the global bounding box, tail arc or action reach.
- The physical body root is the ribcage centre immediately behind the front shoulder. The ground landmark is the lowest load-bearing foot or knuckle in live poses, and the load-bearing torso/limb contact in terminal death poses. The tail tip, drool and detached debris are never anchors.
- Derive any `sourceScaleByClip` only after anatomical measurements. The final silhouette should read taller, leaner and more forceful than the Neomorph, while remaining less broad and less mechanically dense than Big Chap.

## Eight-pose animation contract

| Clip | Required chronology | Main continuity risk |
| --- | --- | --- |
| `idle` | Controlled breath and weight transfer; restrained bird/insect-like head stabilisation; seamless pose 8→1 loop | Accidental locomotion, tube-count drift, tail detachment |
| `move` | One coherent ground cycle with deliberate great-cat/ape-like compression, support exchange, extension and recovery | Eight unrelated states, sliding feet, flipped facing |
| `attack` | Contained anticipation → explosive lunge/claw or inner-jaw strike → contact → readable recovery | Teleporting reach, missing recovery frames, changed identity scale |
| `death` | Lethal impact/support loss → progressive collapse → final load-bearing ground pose; no loop | Tail shortening, cropped limbs, rebound into a living stance |

All eight cells must depict the same individual, with stable dome length, jaw, tooth layout, four tubes, sacral tail root, hands, feet and surface palette. A change of pose is not permission to redesign anatomy.

## Pre-generation and review gates

1. Merge the reviewed local fragment into the global reference registry and reinitialise the queue in a later authorised step; the present `BLOCKED` queue prompts must not be used for generation.
2. Persist the exact prompt before each ImageGen call, then preserve its generation event, active source path, source SHA-256 and any rejected alternative. No CLI/API fallback or provenance invention.
3. Inspect all 32 nominal source cells for eight distinct chronological poses, strict facing, full-tail containment, correct tube count, identity continuity and cell separation before normalisation.
4. Attempt normal extraction first. Matte removal, anti-fringe cleanup or safe reassignment are opt-in corrections that require visible evidence; they must not recolour anatomy or conceal a bad board.
5. Review all 32 physical body roots and ground contacts, then complete the post-generation anatomical scale review described above. Generation alone does not confer `accepted` or runtime status.

## Review result

The reference and production contract are ready for a later registry merge. Image generation remains intentionally unstarted, and the profile remains outside runtime acceptance until the complete V66 generation, provenance, physical-anchor, scale, normalisation and visual-QA gates pass.
