# Enemy 036 scale and physical-root review

Rigid landmark: posterior mitre apex to anterior fixed cranial crest tip, excluding mobile mandible and neck. Three distinct poses were marked per clip (12 total). Median lengths: idle 117.175083px, move 112.805142px, attack 112.004464px, death 117.477657px. Idle-baseline scale factors are 1.000000, 1.038739, 1.046164 and 0.997424 respectively.

All 32 pelvis landmarks were visually projected to complete extracted support/contact guards after the runtime pivot y=240 audit. Idle and move use y=431. Attack uses y=430 except frame 2 at y=429. Grounded/contact death uses y=429. Death frames 1-2 are airborne and deliberately retain the adjacent y=427 ground plane, below their source bounds at 421/415, so fall height is preserved. All 30 non-airborne records now satisfy sourceBounds[3]-anchorY=0.

Eight overlays are retained beside the two merge-compatible fragments. This review certifies physical registration evidence only, not artistic acceptance or runtime readiness.
