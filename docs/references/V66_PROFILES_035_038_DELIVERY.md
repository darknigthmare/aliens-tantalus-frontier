# V66 batch-003 delivery — profiles 035–038

Date: 2026-09-01

## Delivered production candidates

| Profile | Authored boards | Authored poses | Final atlas SHA-256 | Extraction / cleanup |
| --- | ---: | ---: | --- | --- |
| `enemy-035-trilobite-echo` | 4 | 32 | `30fd783390ed840fa6a5938ed9c3669d433c10cde978b7d8b9264b707423c9d6` | safe attack ownership; enclosed core + AA + strict spill cleanup |
| `enemy-036-deacon-line` | 4 | 32 | `4dff0c0c15bd06d2f8beda00d747929f594cfcd236dec37363184d0a7fa7d8f4` | corrected physical floor; enclosed core + AA + strict spill cleanup |
| `enemy-037-neomorph` | 4 | 32 | `0f6491c0d4d72a50cda9cf9ab21128f1acf20e8c73cb479867d4f6550edcfdc3` | safe attack ownership; enclosed core + AA + strict spill cleanup |
| `enemy-038-protomorph` | 4 | 32 | `448d594aeceb8eea8c46cf8e0bf82db1d6a81c46d41d8ad8867a161f73269ac8` | seven safe ownership transfers; enclosed core + AA + strict spill cleanup |

All sixteen active masters remain preserved separately from their lossless normalized atlases. Each clip contains eight distinct authored poses in a 4×2 source board. The batch review contains 128 individually reviewed physical roots and 48 rigid inter-clip measurements. All four metadata records resolve the same final scale-review SHA-256 `72e2c9eb391696e8414b6f64d880c86d3df796f9e70eee0da6d71ce695e5ec76` and physical-root review SHA-256 `25d77434a275c50803f033596d0047a713a4ff43e87256775f7973faf3128b4a`.

Generation history is explicit rather than inferred from files. Profile 035 records the selected candidate receipts while preserving all rejected candidates. Profile 036 records the original OpenAI ImageGen captures and every selected ImageGen/deterministic repair through repository-relative path/SHA-256 pairs. Profiles 037 and 038 retain their exact generation prompt receipts. The production queue reports all four profiles at `4/4`, with no provenance issue.

## Visual review

- Facing, anatomical identity, pose continuity and shared physical pivot were inspected on four rendered 32-pose contact sheets.
- Trilobite retains the reviewed seven-primary-appendage topology and rightward grapple mass.
- Deacon retains its midnight/navy mitre-cranium identity, exactly two arms/two legs, no tail and no dorsal tubes. Its first diagnostic atlas exposed magenta background pockets; strict bounded cleanup removed them before this delivery.
- Neomorph remains pale, lean, right-facing and distinct from the other lineages. Its late death transition remains readable but abrupt.
- Protomorph retains the red-black flayed silhouette, sacral tail and three profile-visible dorsal tubes; the fourth locked far-side tube remains naturally occluded. The attack clip keeps a documented internal size-breathing reservation.

These are calibrated production candidates, not false release claims. Every record remains `pending-visual-review`, `runtimeIntegrated=false`, and `canonExact=false`; no candidate is silently admitted to the runtime allowlist.

## Verified gates

- Source audit: batch-003, 55 current boards inspected; all nine default-extraction blockers recovered by the safe ownership probe, zero blocked recovery.
- Targeted Node V66 pipeline: 101 passed, 1 host-only symlink test skipped.
- Targeted Python normalizer: 36/36 passed.
- Project QA: 720 passed, 1 host-only skip; lint passed for 229 modules.
- Build: `ALIENS: TANTALUS FRONTIER 66.0.0`, 3,446 catalog entries.
- Production state: 162 verified generated boards globally, no stale evidence.
- Worklots of 202: immutable R2 membership `[202, 202, 161]`, 2,437 boards, zero membership/binding difference from the previous frozen plan.
