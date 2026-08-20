# Prompts exacts v49 — Ingénierie et props

Mode : OpenAI ImageGen intégré.

## Salles Ingénierie

Pour les quatre salles, le texte transmis est la concaténation exacte de `BASE`, d’une espace ASCII, puis du suffixe indiqué. Aucun saut de ligne n’a été ajouté.

`BASE` :

```text
Create a production-ready original 2D game environment bitmap for a cinematic side-scrolling sci-fi survival game. Strict orthographic side elevation, no perspective convergence, single continuous walkable floor line at 82 percent of image height, 16:9 landscape. Retro-futurist colonial military starship interior, dense practical industrial construction, ribbed steel, conduit bundles, hazard accents, cold blue-gray metal with restrained amber and red work lights, worn but maintained. This must be one self-contained room module with solid wall endings at left and right and clear bulkhead door recesses, suitable to tile beside other rooms. Keep the entire lower walkway readable and unobstructed for player traversal. Empty environment: absolutely no people, creatures, weapons in use, text, letters, numbers, signage, logos, UI, watermark, borders, contact sheet, split-screen or collage.
```

### `engineering-hangar.png`

```text
Room identity: a large engineering hangar with an empty dropship landing cradle, overhead gantry, folded service arms, fueling hoses and recessed maintenance bays; no ship present. Layered foreground framing and deep machinery background, but the floor remains clear.
```

### `engineering-reactor.png`

```text
Room identity: a shielded reactor chamber with one massive vertical reactor core behind protective glass and lattice, coolant pipes, magnetic housings and maintenance catwalk details; the reactor is architecture, not an isolated prop. Floor remains clear.
```

### `engineering-life-support.png`

```text
Room identity: life-support processing chamber with large air scrubber towers, replaceable filter banks, oxygen tanks, condensation pipes, pressure vessels and vent plenums behind the clear walkway.
```

### `engineering-sensors.png`

```text
Room identity: long-range sensor processing room with original analog-future console banks, equipment racks, waveform machinery without readable displays, articulated sensor gimbal housing behind glass and ceiling cable trays. Keep consoles out of the central walking lane.
```

## Couche lointaine Ingénierie

### `engineering-far.png`

```text
Create a production-ready original 2D parallax background bitmap for a cinematic side-scrolling sci-fi survival game. Wide 16:9 landscape, strict side elevation. Distant engineering depths inside a huge colonial military starship: receding structural ribs, shadowed reactor cavities, remote pipe galleries, tiny amber service lights, ventilation shafts and machinery silhouettes, atmospheric depth in cold blue-gray steel. This is only a FAR BACKGROUND LAYER intended to move slowly behind room modules: no walkable floor, no complete foreground room, no close door, no isolated prop, no people, creatures, text, letters, numbers, signage, logos, UI, watermark, borders, contact sheet or collage. Seam-friendly left and right edges, low contrast at the edges.
```

## Atlas de props

### `hub-modular-props-atlas.png`

```text
Create one production-ready 4 by 4 sprite atlas containing exactly sixteen separate original retro-futurist colonial military starship props for a 2D cinematic side-scrolling survival game. STRICT LAYOUT: four equal columns and four equal rows; exactly one complete centered object per cell; generous empty margin around every object; consistent orthographic side view; consistent scale family; no object crosses a cell boundary. TRANSPARENT RGBA background with truly empty alpha, not white, black, gray, or checkerboard. Cold blue-gray worn steel with restrained amber/red practical lights, crisp readable silhouettes, realistic painted 2D game asset style. Row 1 left to right: sealed bulkhead door module; lift/elevator door module; bridge command terminal; briefing table. Row 2: cryopod; bunk module; mess table with fixed benches; medical bed. Row 3: laboratory console; quarantine containment unit; armory equipment rack with no readable labels; engineering workbench. Row 4: vehicle maintenance lift; reactor service column; life-support scrubber; sensor console. No people, creatures, loose guns, ammunition, floor, wall, room background, scenery, cast shadow outside each object, text, letters, numbers, logos, UI, watermark, border labels, captions, perspective scene, mockup or collage beyond the required exact grid.
```
