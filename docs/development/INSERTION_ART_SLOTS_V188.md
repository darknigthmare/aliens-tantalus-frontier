# Emplacements d’art — insertion et extraction (V188)

Document source uniquement, exclu du build public. Spécification : [specs/003](../../specs/003-insertion-extraction-cinematiques/spec.md). Code : [`src/insertion-asset-slots-v188.js`](../../src/insertion-asset-slots-v188.js) et [`src/insertion-cinematic-v188.js`](../../src/insertion-cinematic-v188.js).

## État

- Décision du propriétaire (2026-11-15) : pas de génération d’image pour l’instant. Toute la séquence est dessinée en primitives Canvas, comme **placeholders**, et chaque visuel passe par un emplacement nommé ci-dessous.
- Aucun fichier n’est encore livré : `INSERTION_ASSET_FILES_PRESENT_V188` est vide. État de chaque emplacement : **à produire**. Une image produite ne devient pas « vérifiée » sans observation en jeu.
- Les descriptions s’appuient sur des références documentées d’*Aliens* (1986) et sur des adaptations du projet (USS Tantalus, baie de largage 2). Elles ne certifient aucune fidélité « 1:1 » ; une image générée non plus. Voir le tableau de fidélité dans la [bible §10.1](../narrative/CAMPAGNE_PRINCIPALE.md).

## Ajouter une image

1. Produire le PNG à la taille indiquée (fond transparent sauf pour les couches `background`).
2. Le déposer à `assets/insertion/v188/<id>.png`.
3. Ajouter l’`id` à `INSERTION_ASSET_FILES_PRESENT_V188`. Seuls les emplacements listés sont demandés au réseau ; le test `scripts/verify-insertion-cinematic-v188.mjs` vérifie que chaque fichier listé existe.
4. Ajouter le fichier à la liste de cache de `sw.js` s’il doit fonctionner hors ligne, puis observer le rendu dans les trois types de lieu.

Le chargeur (`InsertionAssetLoaderV188.draw`) dessine l’image quand elle est chargée, sinon la primitive. L’échelle du projet reste 1 m ≈ 51 px ; un marine debout mesure 44×92 px.

## Couches

`background` (décor plein cadre), `parallax` (couches défilantes, teintées selon le monde), `midground` (vaisseaux, coques), `actor` (UD-4L, M577, marines), `fx` (additif), `foreground` (cadre du cockpit, fenêtres transparentes), `overlay` (cadres d’écran, portrait radio).

## Liste des emplacements

Les colonnes « usage » et « brief » sont en anglais, pour le futur générateur.

| Id | Couche | Taille (px) | Usage | Brief |
| --- | --- | --- | --- | --- |
| `starfield-deep` | parallax | 2048×1024 | Far star layer behind every space shot; scrolled slowly for parallax. | Deep-space star field, sparse cold white and pale blue points, no nebula colours, no galaxies; tileable horizontally; black background. |
| `tantalus-drop-bay` | background | 1280×720 | Bay shot: the USS Tantalus drop bay seen from the gantry, dropship hanging from its clamp. | Project adaptation of the orbital drop-bay idea in Aliens (1986), NOT the Sulaco: industrial hangar, ribbed bulkheads, red work lights, yellow-black hazard edges, overhead rail and clamp; open bay doors at the bottom show stars; leave the dropship out (drawn on its own slot). |
| `tantalus-hull-exterior` | midground | 1600×500 | Release and return shots: the underside of the Tantalus with the bay doors open. | Long blocky military transport hull seen from below, grey-olive plating, antenna masts, a lit rectangular drop-bay opening near the bow; side view, transparent background. |
| `ud4l-side` | actor | 640×240 | The UD-4L Cheyenne in side profile (release, approach, landing, lift-off). | UD-4L Cheyenne dropship side profile as seen in Aliens (1986): angular hull, chin turret under the cockpit, stub wings with weapon pods, twin tail booms with twin fins, rear ramp; olive-drab with worn markings; transparent background; ramp closed; no APC. |
| `ud4l-front` | actor | 480×320 | Atmospheric entry shot: the dropship nose-on, the heat sheath drawn separately. | UD-4L Cheyenne seen three-quarter front, slightly from below, chin turret, cockpit glazing, stub wings; dark hull; transparent background. |
| `m577-side` | actor | 360×150 | The M577 APC carried under the dropship belly, then released at landing. | M577 armoured personnel carrier side profile as seen in Aliens (1986): long low wedge hull, four large road wheels per side, roof turret at the rear, side door; olive-drab; transparent background. |
| `ud4l-cockpit` | foreground | 1280×720 | Cockpit frame over the live screens and the canopy view. | UD-4L cockpit interior seen from behind the pilots: canopy struts, dark consoles, two seats, a central pedestal; window areas and the four screen bays fully transparent so live data shows through. |
| `crt-bezel` | overlay | 420×300 | Bezel drawn around each live CRT display. | Military CRT monitor bezel, chunky black-grey plastic, rounded screen corners, small push buttons under the glass; the screen area is transparent. |
| `ud4l-troop-bay` | background | 1280×720 | Troop bay shot: harness seats along the hull, red cabin light. | Cramped dropship troop compartment as in Aliens (1986): two rows of facing seats with drop-down harness bars, red lighting, hull ribs, stowed rifles, a small status monitor; empty seats (marines drawn separately). |
| `marine-seated` | actor | 52×80 | One marine strapped in a harness seat, repeated along the bay (1 m ≈ 51 px). | Colonial marine in armour seated with the harness bar down, side view, helmet on, rifle upright; scale matches a 44×92 px standing marine; transparent background. |
| `planet-limb` | background | 1600×900 | Orbit shot over a planet with an atmosphere; tinted per world. | Planet curvature seen from low orbit, thin glowing atmosphere limb, cloud bands; neutral grey tones so the game can tint it per world; black space above. |
| `moon-limb` | background | 1600×900 | Orbit shot over an airless moon or asteroid; tinted per world. | Airless rocky body seen from low orbit, sharp horizon with no atmosphere glow, craters and ridges, hard shadows; neutral grey. |
| `target-vessel` | midground | 1600×700 | Docking target: the ship or station of a space mission. | Large derelict-looking ship or station hull in side view, docking collar with guide lights, dark windows, scorched plating; transparent background. |
| `entry-plasma` | fx | 1280×720 | Additive plasma sheath and streaks during atmospheric entry. | Orange-white re-entry plasma streaks converging behind a shape at the centre, additive on black; no hull drawn. |
| `cloud-far` | parallax | 2048×512 | Far cloud deck, tinted per world; scrolled slowly. | Soft cloud deck seen from above at dusk, neutral grey, tileable horizontally, transparent gaps. |
| `cloud-near` | parallax | 2048×512 | Near cloud wisps crossing the frame fast during the descent. | Torn cloud wisps, neutral grey, motion-blurred horizontally, tileable, transparent background. |
| `terrain-far` | parallax | 2048×400 | Far terrain silhouette of the landing zone, tinted per world. | Far horizon silhouette of a frontier colony world: ridges, an atmosphere processor tower, pylons; neutral dark grey; tileable; transparent sky. |
| `terrain-near` | parallax | 2048×400 | Near terrain and landing pad of the landing zone, tinted per world. | Near ground silhouette: landing pad with lights, fences, crates and rocks; neutral dark grey; tileable; transparent sky. |
| `comms-pilot` | overlay | 96×96 | Pilot portrait in the comms box of the cockpit screens. | Dropship pilot in a flight helmet with the visor up and a boom microphone, monochrome green CRT rendering, head and shoulders. |

## Teintes par monde

`planet-limb`, `moon-limb`, `cloud-*` et `terrain-*` doivent rester neutres : le jeu applique le ciel, le terrain, la météo et l’heure locale tirés du monde (`insertionWorldProfileV188`). Les valeurs météo et horaires sans donnée de monde sont marquées [PROPOSÉ] dans le code.
