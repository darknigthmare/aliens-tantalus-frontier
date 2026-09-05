# V73 — Ceto051 / Tunnel Vermin052: independent candidate QA

Reviewed 2026-09-05, Codex level_props_audit_fix. Four active clips and32 poses per profile were inspected, alongside both V56 project-owned identity boards, enlarged native crops, source contacts and final candidate atlases. These creatures are PROJECT_ORIGINAL, with no external1:1 canon model. No acceptance, runtime registry, STATE or shared reference file was edited by this agent.

## Current decisions

- **051 Ceto Reef Predator:** broad V56 model and authored clip chronology are retained. Its malformed attack grid was repaired technically without resizing or repainting. The final32-pose candidate atlas and --check pass. Physical aquatic-root registration, cross-clip anatomical measurements and runtime waterline/combat/death-hold remain pending; this is not a release-ready claim.
- **052 Tantalus Tunnel Vermin:** candidate only, anatomy blocked. AttackR2 fixes the split-head vertebrate mouth, but the unchanged idle still has only six independently traceable locomotor feet in pose1. AttackR2 shows additional dark feet, so stable eight-leg readability across clips is not established. Small mandibular motion is also too subtle to certify a readable attack at world scale.

## Ceto attack: actual correction and rejected approaches

Original attack:1754×897, SHA256 52a8b1cb56b2048c8b236a4341496ff55302f1fcd56dc337086e82270902affe. The strict V66 normalizer correctly rejected its non2:1 proportions.

The first rectangle-by-rectangle1794×897 padding experiment preserved all copied pixels, but visual inspection showed that it separated parts of tail4 and muzzle5 already crossing nominal cell boundaries. It is REJECTED and must not be used. A second ownership-aware1794×897 experiment preserved whole anatomy but differs from the other three clip resolutions; it is also NOT an active deliverable.

The final1794-free repair uses the existing strict connected-ownership extractor and a1774×887 output. It retains all206388 non-matte authored foreground pixels, exactly matching their original RGB values. No interpolation, resizing, repainting, anatomical pixel loss or subject overlap. Complete silhouettes are translated by whole pixels only; minimal extra translations are explicitly recorded for subjects crossing boundaries. Proven transfers:1666 tail pixels into owner pose4,48 muzzle pixels into owner pose5. All eight new cells independently extract without cross-cell ownership.

Final derived SHA256 f5d0d9f3eeefd16ca8973eafeb11a331f7baa3e97d4e9463dedfae62da314fd0. The parent independently inspected and adopted this derivative into the active attack path, archived the immutable original at assets/openai/sprites/frames/v73/enemy-051-ceto-reef-predator/attack-native-1754x897.png, and handled the repaired-generation receipt. This agent did not modify the shared production event state.

The frozen authoritative proof is enemy-051-ceto-reef-predator.attack-owned-padding-1774-proof.json. Do not overwrite it after production registration. The exploratory adapter scripts record the procedure at the time of correction; the original active path has since been replaced by the parent, so rerunning against that changed path is intentionally not a way to regenerate the frozen proof.

## 051 visual findings

Identity: flat wedge head, lateral eye, gill slits, low dorsal crest, four articulated claw/paddle limbs, restrained cyan flank dots, attached deep caudal fin, blue-black organic hide. The positive V56 model already has weight-capable claw/paddle anatomy; the new set does not introduce an unrelated animal.

Idle: subtle respiration and head/fin settling; poses are near-identical as appropriate to an idle, not proof of locomotion. Move: genuine caudal stroke (down at1/2, rising5, high6, recovering7/8) with changed paddling limb positions; no planted walking step is used as the swimming motion. Attack: neutral1, coil2, open jaw3, powered lunge4/5, close/brake6, recover7/8. The complete tail and open muzzle now remain inside their assigned cells. Death: gasp/recoil1/2, loss of support3, progressive low collapse4–8, last pose prone.

Reservations: plate highlights and exact gill/photophore placement are not pixel-identical; final death silhouettes are strongly compressed and need the runtime death-hold recipe. A body/fin bounding-box bottom is not a verified aquatic root. The candidate deliberately retains pending physical review instead of calling the lowest swimming paddle a floor contact. The32 anatomical roots and at least two comparable rigid-body measurements per clip must be annotated independently before promotion. All sourceScaleByClip values currently equal1 because they are uncalibrated defaults, NOT because a scale review has passed.

## 052 visual findings

Broad project identity survives: small pale mineral/chitin arthropod, dark segmented abdomen, overlapping dorsal armor, short antennae, cold sparse photophores and paired front hooks. Not a facehugger or mini-xenomorph.

Idle pose1 has six independently readable distal locomotor feet, marked in enemy-052.idle1-six-traceable-feet.png at native source coordinates (52,347),(96,347),(175,347),(214,347),(305,347),(339,347). These markers count legs, not the two claw prongs of one foot. This does not assert that two biological legs cannot be hidden behind the body; it proves the requested eight independently readable limbs are not satisfied by this pose. Other idle/move poses merge rear/far limbs. The move clip changes contacts and compresses/extends, but a consistent four-pair gait cannot be certified.

AttackR1 (now archived by parent) opened the whole rigid head like a vertebrate jaw at pose5. AttackR2 SHA256 1c6164a87d9aa512e3abdf5e8847a81d19565d0afb246414588e8bbe707898fa removes that error: the head remains intact with small hooked mandibles. This is a real improvement. It does not fix unchanged idle/move anatomy, and the pinch/withdraw cycle is very subtle at candidate atlas size. Do not certify clipSemantics or eight-leg continuity from32 unique hashes.

Death genuinely curls/collapses through3–6 and ends low at7/8, but limbs merge underneath the armor; roots/scale are not accepted while the model's limb continuity remains unresolved. Keyed source contacts show colored matte fringes around some small legs; the stricter final pass removes its declared magenta predicate, but that metric alone is not a blanket guarantee of every low-luminance violet edge.

## Technical result

Both candidates normalized with --safe-reassign-cell-fragments --remove-enclosed-magenta-matte --remove-enclosed-magenta-aa-fringe --remove-magenta-spill. No physical review was fabricated and --trim-transparent-padding was not used without reviewed roots.

Both final --profile <id> --check commands pass with32 poses, findings[], and acceptedAutomatically0. The Python check also verifies standalone clip pixels match their atlas slices.

| Metric | Ceto051 | Vermin052 (attackR2) |
| --- | ---: | ---: |
| Distinct authored atlas poses |32|32|
| Strict magenta pixels |0|0|
| RGB hidden beneath alpha0 |0|0|
| Atlas bytes |494114|609282|
| Source hashes current |yes|yes|
| Physical anchors |pending|pending|
| Anatomical scale review |pending|pending|
| Runtime integrated |false|false|

051 atlas SHA256 a62072b6889cfcb29283556773ce21b3d8b1851e914d2a8aa3f9bb3038da172d.
052 atlas SHA256 13caa6be79e01d9d463e2acd413a3ad5c1c4998a2895859d5abc4c40e19e057d.

candidate-qa.json records source paths, dimensions and hashes, current normalized hashes, ownership transfers and the explicit unresolved physical/scale status. Source contacts use a constant2× nearest-neighbour diagnostic magnification across every pose; they do not enlarge individual poses to fill cells. Final atlases were viewed directly. No candidate is automatically loaded into runtime by this subtask.
