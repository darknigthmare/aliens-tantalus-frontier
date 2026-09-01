# Pathogen Mimic 040 production handoff

OpenAI ImageGen produced four active 1774×887 exact-2:1 RGB boards and one archived rejected attack. Exact prompts and content-addressed receipts are preserved beside this file. The sources implement an original project adaptation, remain `canonExact=false`, and do not copy an official sprite.

Active sources: `idle.png`, `move.png`, `attack.png`, `death.png` under `assets/openai/sprites/frames/v66/batch-003/enemy-040-pathogen-mimic/`. Rejected source: `rejected/attack-r1-cross-cell.png`.

No source is accepted or runtime-integrated. Idle and death pass default eight-pose extraction. Move and attack each require short-spill ownership recovery (237 and 300 pixels respectively) and therefore fail the stricter no-contact source contract. All boards use a keyable but nonuniform opaque magenta matte instead of literal uniform `#FF00FF`. Scale, physical roots and aligned playback remain pending.

Full evidence and hashes: `docs/references/V66_WORKLOT_001_PATHOGEN_MIMIC_QA.md` and the profile-local `source-review.json`. No global queue, production state, reference registry, scale/anchor registry, metadata, normalized atlas or runtime file was modified.
