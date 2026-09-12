# V79 title scene — local final browser QA

Date: 2026-09-12
Canonical evidence set: `docs/references/v79-browser-qa/final-local/`
Server: `http://127.0.0.1:4176/` (local loopback only)
Browser: Chrome 153 headless, fresh temporary profile and isolated browser contexts
Runtime edits by QA agent: none

## Result

PASS for the V79 title scene and the covered V78 regression. The final automated report contains `issues: []` and `errors: []`.

- Release identity: `ALIENS: TANTALUS FRONTIER v79`.
- Real production bitmap loads: Acheron 14/14 ready, Ceto 13/13 ready, MIRE-9 13/13 ready; zero missing layers and `degraded=false` during normal loads.
- Every normal source is under `/assets/openai/ui/title/v79/`; no communications-relay candidate is loaded.
- No HTTP 4xx/5xx or browser console/runtime error occurred during the normal automated run. The separate fallback probe intentionally requests `qa-forced-missing.png`; that controlled 404 is not a production request.
- V78 interaction regression passes in the same isolated run: keyboard navigation, focus trap, touch layouts, simulated standard-mapping gamepad edges, new-game confirmation, continue/hub, mission canvas focus, Forge return, profile isolation, invalid import preservation, corrupt-save recovery/export, and briefing-table traversal.

## Viewports and horizontal-scroll regression

Visual captures were inspected at 1280×720, 390×844, 844×390 and 480×320. The native scrollbar is absent, the title/menu remains readable, every visible control stays in the viewport and is hit-testable, and foreground layers do not obstruct menu interaction.

The exact resize sequence that previously exposed a clipped logo/menu was replayed: 1280×720 → 390×844 → 844×390 → 480×320 → 1280×720.

| Checkpoint | `scrollLeft` | `documentScrollLeft` | `scrollWidth/clientWidth` | Continue button |
| --- | ---: | ---: | --- | --- |
| Desktop initial | 0 | 0 | 1280/1280 | fully visible |
| Portrait | 0 | 0 | 390/390 | fully visible |
| Landscape | 0 | 0 | 844/844 | fully visible |
| Compact landscape | 0 | 0 | 480/480 | fully visible |
| Desktop return | 0 | 0 | 1280/1280 | fully visible |

After the desktop return, the three full-motion presets also remain at `scrollLeft=0`, `documentScrollLeft=0`, `scrollWidth=clientWidth=1280`, with the menu fully visible:

- Acheron / `frontier-night`: 14 ready, 0 missing.
- Ceto / `storm-terminator`: 13 ready, 0 missing.
- MIRE-9 / `ember-quarantine`: 13 ready, 0 missing.

## Motion modes

Browser-computed animation state on Acheron:

| Mode | Ready bitmaps | Missing | Animated layers | Horizontal scroll |
| --- | ---: | ---: | ---: | ---: |
| `full` | 14 | 0 | 20 | 0 |
| `reduced` | 12 | 0 | 8 | 0 |
| `static` | 9 | 0 | 0 | 0 |

`static` therefore contains no active CSS animation; `reduced` materially lowers both layer and animation counts.

## Planet, halo, foreground and composition review

- Planet and atmosphere containers share the exact same rendered center for all three presets.
- Alpha-content center deltas at 1280×720 are 12.6 px for Acheron, 16.7 px for Ceto and 5.3 px for MIRE-9, each below 3% of the rendered planet diameter. No halo is visibly detached from its globe.
- The adjusted Acheron halo is substantially softer and no longer dominates the silhouette. Its irregular violet storm seam remains noticeable on the left limb; this is a low-priority art-direction note, not a geometry or loading failure.
- The orbital transport is reduced and shifted right compared with the failed review state. It remains a deliberately large hero element but no longer pushes the menu off-screen or hides the planet identity.
- The port hull and starboard truss frame the scene at desktop/landscape sizes. Responsive cropping keeps the portrait and compact menus clear.

## Controlled refusal/fallback

In the isolated QA page only, the Acheron planet URL was replaced by a guaranteed missing path. Result:

- scene `degraded=true`;
- rejected bitmap `assetStatus=missing` and hidden;
- procedural `frontier-world` fallback visible;
- full V61 backdrop remains hidden because the failed layer is optional;
- `#title-screen.scrollLeft` remains 0.

The fallback proof is `fallback-forced-planet-refusal.jpg`.

## Evidence

- `title-browser-report.json` — machine-readable full V79/V78 run.
- `desktop-idle.jpg`, `title-menu-desktop.jpg`, `title-menu-portrait.jpg`, `title-menu-landscape.jpg`, `title-menu-compact-landscape.jpg` — responsive title evidence.
- `title-preset-acheron.jpg`, `title-preset-ceto.jpg`, `title-preset-mire-9.jpg` — three production bitmap presets.
- `fallback-forced-planet-refusal.jpg` — controlled procedural fallback.
- Additional V78 flow captures are preserved by the automated report.

Earlier captures in sibling folders are superseded by this canonical set and must not be used for release review.
