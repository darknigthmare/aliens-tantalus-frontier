# V78 final local browser QA

Authoritative post-correction local run: 2026-09-12. Result: **PASS** (`ok: true`, 27 check groups, 0 issues, 0 captured browser/HTTP errors).

## Scope actually exercised

- Title screen at 1280×720, 390×844, 844×390 and 480×320. Every visible menu target stayed inside the viewport and remained hittable.
- Real CDP keyboard, mouse and touch events: start/menu edge handling, arrows, Home/End, Tab containment, Escape, options focus and return.
- Standard-mapping gamepad **simulated in the isolated page**: accept, navigation, held-edge protection, cancel and back. No physical-controller claim.
- Focus hand-off: a new game and Continue both focus `#hub-canvas`; a real campaign launch focuses the insertion action, preserves that focus across a phase rerender, then focuses `#game-canvas` after tactical control starts. The insertion phases were advanced through their native DOM button after the focus assertions; this is not presented as a pointer-input test.
- Profiles 2 and 3, page reload and per-profile music persistence.
- Invalid JSON-shape import (`true`): exact feedback displayed, all three storage slots and active save unchanged, runtime flags unchanged.
- New-timeline confirmation and cancellation: controlled name/kills progression markers survived until explicit confirmation.
- Corrupt selected profile: original malformed content preserved across reload/cancel/unload; continue disabled; recovery UI visible; raw recovery export was actually downloaded as `aliens-tantalus-frontier-profile-3-original.txt` and matched the expected UTF-8 payload byte for byte (33/33 bytes).
- Physical briefing room: the actual V78 hub loop walked the marine through the one-way table foreground, landed on its top after a real Space event, then returned to deck level after walking off.

## Evidence

- `title-browser-report.json`: complete machine-readable assertions and geometry.
- `desktop-idle.jpg`, `title-menu-desktop.jpg`, `title-menu-portrait.jpg`, `title-menu-landscape.jpg`, `title-menu-compact-landscape.jpg`: title layouts.
- `mission-game-canvas-focus.jpg`: running mission immediately after insertion-to-runtime transfer.
- `briefing-pass-in-front.jpg`, `briefing-landed-on-table.jpg`: table passage and landing.
- `title-corrupt-profile.jpg`: protected corrupt-profile state.
- `downloads/aliens-tantalus-frontier-profile-3-original.txt`: browser-produced raw recovery export checked byte for byte against the malformed source string.

`title-before/` and `title-integrated/` in the parent directory are earlier diagnostic runs; this `final-local/` directory is the final V78 verdict.
