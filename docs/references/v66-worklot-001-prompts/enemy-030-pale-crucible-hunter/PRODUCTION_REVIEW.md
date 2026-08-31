# Enemy 030 - Pale Crucible Hunter production review

Built-in OpenAI ImageGen only: ten real calls. Four selected candidate boards provide 32 poses; four superseded PNG candidates are preserved in `rejected/`. Two additional compact move attempts were returned in memory while the tool's archive stubs remained zero-byte, so they were not promoted to project assets. The V54 runtime master remains untouched.

## Selected sources

| Clip | Generation | Source SHA-256 | Status |
|---|---|---|---|
| idle | `exec-47ed3ad2-e0b7-4b80-a31e-67b4dec4e224` | `794883780864c17f1e0ded08eeff4cc36c2791bd8400aec3e7ecbdb47a467f14` | candidate |
| move | `exec-0df8b49b-0639-4505-a9de-a8715f5c1a17` | `6a1f39d987b4fc2f8ff29e1d9e47e988c3ea3aaa93bc9144a16f9220a069353a` | selected candidate; strict extraction pass |
| attack | `exec-ab1e33ef-118c-4635-8eb5-11db48d8f62a` | `35e58dc2f4a67081e5a28e4e3b40e4ee818ada73fc60d5a82a7eb77a9221b4e1` | selected candidate; strict extraction pass |
| death | `exec-da1d5385-2925-4615-9ed3-e89836a53bf1` | `37c0918dc93848d35a4464e8a1456f21fd2ca270612cd159131a40d4efd43270` | selected candidate; strict extraction pass |

## Review boundary

The selected boards contain four-by-two arrangements, right-facing silhouettes and clip-specific pose arcs. The read-only source audit proves RGB 1774x887, opaque magenta evidence, eight distinct cells and default extraction 8/8 for all four selected clips. Contact sheets, timing, physical roots, anatomy continuity, interclip scale and loop seams still require review. Nothing here is accepted or integrated into runtime automatically.

The V54 project master was used as a local design/provenance authority, not uploaded as an ImageGen input in this session. The first V66 board was generated from its documented textual identity lock; subsequent V66 boards used the preceding OpenAI-generated candidate as their identity reference.
