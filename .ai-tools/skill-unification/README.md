# GameDev skill completion

This project already has pinned 3Dviz Pro Max, GameDev router and Spec Kit router integrations in this PR. Add-on specialized GameDev entrypoints (Codex and Claude) reuse the *existing* full GameDev submodule: `.ai-tools/upstream/awesome-gamedev-agent-skills` @ `19d93f97c9c1ea0f8b306e77aa81e0d3e352d3e9` (Apache-2.0).

Initialize only when needed: `git submodule update --init .ai-tools/upstream/awesome-gamedev-agent-skills`. Keep all prior project instructions, assets and 3Dviz/CodeGraph integrations. The new Spec Kit workflow supplements the existing router without auto-initializing missing `.specify` resources. No application dependencies, CI or rendering tests change.
