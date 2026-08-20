# Prompts exacts v50 — joueur combat, Bishop-9, kit de traversal et drone combat

Mode : OpenAI ImageGen intégré (`image_gen` built-in). Les PNG source ont été conservés comme masters bruts ; le runtime consomme leurs dérivés normalisés RGBA quand il s'agit de plaques d'animation, et les 16 découpes indépendantes du kit de traversal.

## Sources et empreintes

| Asset workspace | Source ImageGen | SHA-256 du master workspace |
|---|---|---|
| `assets/openai/sprites/player/echo9-marine-combat-sheet.png` | `C:\Users\chuck\.codex\generated_images\01a01e52-9788-7491-b0fc-ec4c277f25d1\exec-adc04c43-253b-410d-ba10-02e4f45271a0.png` | `c1bd120c98e09c6147ad8d795b876ac9781f9b0720e8bd0321c23ae2412e996a` |
| `assets/openai/sprites/npcs/bishop-9-locomotion-sheet.png` | `C:\Users\chuck\.codex\generated_images\01a01e52-9788-7491-b0fc-ec4c277f25d1\exec-1646b8b2-25d4-4fe9-878c-1f003bc4c324.png` | `e622472160292f71f67f660451025ebbd32f555d6c2b9c1ad71c251b9ad7602b` |
| `assets/openai/metroidvania/props/tantalus-traversal-kit-atlas.png` | `C:\Users\chuck\.codex\generated_images\01a01e52-9788-7491-b0fc-ec4c277f25d1\exec-25a891c5-5c81-46a7-adf1-bf124d39e0cd.png` | `90dcf62962bb18e803e9a1c374442b01cab626552b0293f556f13f82b778dc55` |
| `assets/openai/sprites/enemies/xenomorph-drone-combat-sheet.png` | `C:\Users\chuck\.codex\generated_images\01a01e52-9788-7491-b0fc-ec4c277f25d1\exec-e43761a8-9ab0-4177-8dfb-eb431f4d6912.png` | `8abc889ab4a87aa090b99746a3487c182f9b0ca85074faaaE46c5e6253e2a227` |

Les sorties brutes ImageGen ont été normalisées par `scripts/process-v50-art-safe.py`. Le rapport `assets/openai/v50-art-normalization-report.json` certifie les plaques runtime en 1024×1024 RGBA, grille 4×4, cellules 256×256, garde interne de 16 px et masters bruts préservés.

## `echo9-marine-combat-sheet.png`

```text
Use case: stylized-concept
Asset type: production-ready 2D game sprite animation sheet
Primary request: create one coherent Echo-9 colonial space marine combat animation atlas for a modern side-scrolling metroidvania, exactly 4 columns by 4 rows, 16 equal cells, no gutters drawn and no labels.
Subject: the exact same adult marine in every cell, practical dark olive fatigues, compact chest armor, helmet, boots, pulse-rifle-like original sci-fi carbine with no branding. Keep body proportions, face, armor, weapon and palette identical in all 16 frames.
Animation layout: row 1 four frames raising weapon from low-ready to aim; row 2 four consecutive firing/recoil frames with muzzle flash only in frames 2 and 3; row 3 four consecutive reload frames; row 4 hit reaction, stagger, kneel wounded, recover.
Style/medium: detailed hand-painted 2D sprite art, crisp silhouette, retro-industrial science-fiction, side profile facing right, consistent with a polished modern metroidvania rather than concept art.
Composition/framing: strict orthographic side view; one complete full-body figure centered inside each cell; all feet on the same baseline; consistent scale; at least 18 percent empty padding around every figure; no body part, weapon or effect may cross a cell boundary.
Lighting/mood: controlled cool ship lighting, readable against dark gameplay backgrounds.
Constraints: genuinely transparent background; alpha only outside sprites; exact 4x4 layout; 16 distinct sequential frames; no grid lines; no checkerboard; no floor; no shadows outside cells; no text; no logo; no UI; no watermark; no collage framing; no cropped heads, weapons, feet, smoke or muzzle flashes.
```

## `bishop-9-locomotion-sheet.png`

```text
Use case: stylized-concept
Asset type: production-ready 2D NPC animation sprite sheet
Primary request: create BISHOP-9, one coherent field synthetic science officer for a modern side-scrolling retro-industrial science-fiction metroidvania, exactly 4 columns by 4 rows, 16 equal cells, no labels.
Subject: the exact same adult male-presenting synthetic in every frame, neat short dark hair, subtle pale synthetic complexion, dark navy service jumpsuit with light gray science vest and small practical equipment belt, no branding. Human-proportioned and recognizable as a calm ship science officer; preserve identity, costume, anatomy and palette in all frames.
Animation layout: row 1 four subtle idle/breath/scan frames; row 2 four consecutive walk frames facing right; row 3 four science-work frames using a compact handheld scanner; row 4 alert reaction, damaged synthetic with small white fluid mark, kneel to inspect, recover. No gore.
Style/medium: detailed hand-painted 2D sprite art with crisp silhouette, side-profile gameplay readability, polished modern metroidvania.
Composition/framing: strict orthographic side view; one complete full-body character centered per cell; same scale and same foot baseline; at least 20 percent empty padding around each figure; nothing crosses cell boundaries.
Lighting/mood: controlled cool ship lighting, readable on dark interiors.
Constraints: genuinely transparent background; exact 4x4 layout; 16 distinct sequential frames; no grid lines; no checkerboard; no floor or cast shadow; no text; no UI; no logo; no watermark; no cropped head, hands, tools or feet.
```

## `tantalus-traversal-kit-atlas.png`

```text
Use case: stylized-concept
Asset type: modular 2D metroidvania traversal-prop atlas
Primary request: create exactly 16 independent reusable retro-industrial spaceship level pieces in a strict 4 columns by 4 rows layout for a polished side-scrolling metroidvania.
Scene/backdrop: none, every piece isolated.
Subject and cell order: row 1 full floor segment, narrow overhead catwalk, short ledge platform, grated drop-through platform; row 2 wall ladder, climbable maintenance pipe, open ventilation entrance, sealed breakable wall panel; row 3 locked bulkhead door, open bulkhead frame, waist-high cargo cover, stacked supply crates; row 4 ceiling cable cluster, foreground pipe cluster, warning lamp fixture, acid-leak floor hazard.
Style/medium: detailed hand-painted 2D game environment sprites, original retro-industrial science-fiction, orthographic side view, consistent materials and shared scale, crisp silhouette and readable gameplay affordances.
Composition/framing: one object centered in each equal cell, full object visible, at least 16 percent empty padding on all sides, no object crosses any cell boundary. Floor and platform pieces remain perfectly horizontal with compatible edge thickness. Door scale should be approximately 1.8 times a human character.
Lighting/mood: neutral cool ship light with restrained amber hazard accents.
Constraints: genuinely transparent background; exact 4x4 layout; no perspective tilt; no characters; no vehicles; no text or readable letters; no grid lines; no checkerboard; no labels; no UI; no logo; no watermark; no cast shadows outside objects; no cropped parts.
```

## `xenomorph-drone-combat-sheet.png`

```text
Use case: stylized-concept
Asset type: production-ready 2D enemy combat animation sprite sheet
Primary request: create one coherent adult xenomorph drone combat animation atlas for a modern side-scrolling metroidvania, exactly 4 columns by 4 rows, 16 equal cells, no labels.
Subject: the exact same tall biomechanical alien drone in every frame, elongated smooth domed head, skeletal ribbed dark body, long segmented tail, digitigrade limbs, no eyes, consistent anatomy and scale in all cells. Original project rendering based on licensed franchise reference.
Animation layout: row 1 four stalk-to-attack anticipation frames; row 2 four consecutive claw/lunge attack frames; row 3 four tail-swipe and bite attack frames; row 4 bullet hit reaction, stagger, collapse, death still.
Style/medium: detailed hand-painted 2D sprite art with crisp silhouette, cold biomechanical highlights, gameplay-readable side profile, polished modern metroidvania.
Composition/framing: strict orthographic side view facing left; one complete creature centered in each cell; common foot baseline and scale; tail curled within its cell; at least 16 percent empty padding; no head, limb, claw, tail or effect may cross a cell boundary.
Lighting/mood: moody cool rim light readable over dark corridors.
Constraints: genuinely transparent background; exact 4x4 layout; 16 distinct sequential frames; no grid lines; no checkerboard; no floor; no cast shadows; no acid splashes outside cell; no text; no UI; no logo; no watermark; nothing cropped.
```
