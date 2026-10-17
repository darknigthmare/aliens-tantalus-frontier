# V154 — Native rigs and reversible key poses

## Scope from the Excel

This delivery follows the 28 `ART153-*` tasks instead of adding a combat ability.
It adds four exact-ID rigs, 69 bones and 25 authored key-pose definitions on the
four existing Prowler/Commando/Guardian/Cultist plates. Original PNGs are unchanged.
These are small-amplitude native-texture mesh adaptations, **not captured canonical
clips**, separated body-part artwork or a completed floor pin. No 1:1 kit is approved.
The source plates themselves are project artwork, not proof of franchise accuracy.

Eight technical tasks (rig/contact setup and finite recovery) are implemented as
adaptations, nine tasks are partial and eleven need references, drawings or review.
The prior IDs and all V146–V153 workbooks remain intact. `XENO_TRIALS_SUIVI_V154.xlsx`
has eight sheets, seven tables and nine calculated counters. Its production states
are technical progress, not a certification of all 28 art tasks.

## Selection and motion

- Four matching ID/profile/path/dimension/orientation pairs only. Exposed source
  hashes must agree; build tests pin the PNG bytes for all four, including Prowler.
- Every visible source alpha cell is kept in a bounded triangular mesh. Closest
  bone weights are cached; pivots are authored in native image coordinates.
- Source support regions remain pinned. Carried guns use a rigid torso zone;
  their poses are not independently bent into a melee weapon.
- Hierarchical transforms drive head, torso, limbs and Prowler tail at small angles.
  Triangles must remain finite and non-inverted. Invalid geometry, wrong media,
  neutral poses and reduced-motion mode fall back to the existing native rendering.
- Intro belongs to the currently presented fighter and uses the existing presentation
  clock. Prowler windup reads the native attack age. Hold and resistance read the real
  grapple and guard escape progress. Recovery reads the latest same-round release.
- R1 win/loss expressions return to neutral at the end of the existing intermission.
  Draws and final results receive no invented death, fatality or posthumous movement.
- Receipts report what was actually drawn in that frame, including world contacts,
  clip and source hash. They are detached from internal state and cleared on stop.

The renderer never writes positions, collision sizes, health, attack windows,
resources, results, rewards or profile state. No engine change is included here.
Existing ordinary attacks and movement retain their previous render contracts.
The UI labels these meshes as adaptations rather than silently claiming full clips.
The two source modules enter the offline shell once; production documents do not.

## Verification and boundaries

`npm run test:trials:rigs` executes 32 behavioural cases and one documentary case.
It covers source hashes, all poses at 61 sample points, nonfolding triangles, fixed
supports, both orientations, exact admissions, bad inputs, reduced motion, natural
CPU capture/guard escape, pause, replay boundaries and rendering without changing
a physical match. No historical assertion is removed or relaxed.

`qa-xeno-trials-rig-v154.py` has two explicit scopes: isolated texture/pose rendering
fixtures (25 poses in both orientations), then the native controller and its real
CPU capture/keyboard escape. These are **not** menu-unlock or canonical-reference
captures. The native scenario does not inject health, positions, clocks or victory.
Both this journey and the existing full-game journeys are blocking in release CI.

Local 32-case checks passed. Local Chromium navigation was rejected by the host
policy before any assertion; the final CI reports are the browser authority. The
CPU comparison montage is only an offline inspection aid. Final counters and CI
results belong to the published evidence, not predictions in this source guide.

Remaining: reference frame/timecode review, separated artwork for hidden anatomy,
full floor capture/escape choreography, locomotion and combat sets, actual final
intros/outros, stage-specific cinematics and anatomically compatible finishers.
Application 143.0.0, save schema 52, dependency lock and prior tasks are unchanged.
