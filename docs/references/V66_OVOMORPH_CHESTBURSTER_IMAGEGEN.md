# V66 — sources OpenAI Ovomorph et Chestburster

Date : 2026-08-31. Mode : outil intégré OpenAI ImageGen, pas d’API/CLI.

Huit sources retenues, huit poses par source, deux profils et 64 poses. Elles ne sont pas encore déclarées intégrées avant les contrôles de normalisation et de runtime. Les fichiers sont dans `assets/openai/sprites/frames/v66/batch-001/`.

Références exactes, identité et limites : `V66_ENEMY_BATCH_REFERENCES.json`. Les photos distantes ont été inspectées et fournies dans le contexte image; pour les itérations, l’ancre générée et une référence distante sans chemin local ont été incluses ensemble. Le lecteur de fichiers Windows reste défaillant; l’affichage de lecture en mémoire utilise des miniatures, sans modifier les sources.

Le premier Chestburster demandant l’alpha a livré un damier peint et a été rejeté. Le modèle a ensuite produit des sources RGB magenta destinées à l’extraction déterministe; ce ne sont pas encore des atlas RGBA. Le premier déplacement Chestburster répétait trop le repos et a été refait; l’ouverture Ovomorph à cinq lèvres a été refaite avec quatre lèvres. Aucun essai rejeté ne compte comme terminé. Les sources choisies restent des adaptations contrôlées : fidélité 1:1 non certifiée.

## Chestburster — idle

Génération : `exec-89188495-f262-467c-9931-09702a1d6bc4`. Grille source : 4 × 2, 1774 × 887 pixels.

```text
Use case: background-extraction. Image1 is the eight-frame Chestburster pixel-art sheet to correct. Image2 is only the canonical NECA anatomy reference; do not include the photo scenery or blood. Preserve Image1's EXACT eight sprite poses, four columns two rows, canvas2:1, side-view right, limbless beige serpent identity, face, segmented tail, pixel style, scale and locations. Change ONLY the background: completely remove its painted checkerboard and replace ALL backdrop pixels with perfectly solid opaque flat RGB(255,0,255) MAGENTA #FF00FF, including holes between curves. Absolutely NO white squares, NO grey squares, NO checkerboard, NO gradient, NO ground shadows. Do not delete any part of tail or body, do not add arms or legs, do not add labels or guides. This is a keyed production source, use uniform magenta across the entire unused canvas.
```

## Chestburster — move

Génération : `exec-460cc43f-47da-445f-be59-a65e645a3125`. Grille source : 4 × 2, 1774 × 887 pixels.

```text
Use case: identity-preserve. Correct ONLY THE ACTION POSES of Image1, a Chestburster sprite sheet. Keep exact beige segmented limbless anatomy, headshape, silver teeth, pixelart texture, right-facing sideview, MAGENTA background. Image2 is canonical anatomy reference only. Image1 currently shows standing/head-bobbing; this is WRONG for this sheet. It must show a FAST LOW CATERPILLAR/INCHWORM SLITHER CYCLE. All eight heads must be low and at the SAME HEIGHT just above ground, neck almost horizontal, never standing upright. The main motion is a travelling wave of body compression and extension: frame1 stretched flat,2 middle abdomen arched,3 arch advancesrearward,4 front advanceswhiletailgathers,5 longlowextension,6 tailarches,7 wavepassesforward throughlowbody,8returnsstretchedposewithchangedtailtip. Clear strong curvature changes IN THE BODY, not a head bob. Keep the creature horizontal in allframes, no feet or limbs, no eyes. Eight unique authoredframes,4columns2rows,1774x887canvas; allspritesinsidecells with18% horizontalguards, same skullsize betweenframes andasImage1. No white/greycheckerboard, no text, no scenery, no casting shadow.
```

## Chestburster — attack

Génération : `exec-d7986dd4-a14e-476f-ab00-47e6d99e210b`. Grille source : 4 × 2, 1774 × 887 pixels.

```text
Use case: stylized-concept. Production chestburster ATTACK animation. Image1 provides approved pixelart identity, exact headsize, beige palette, long segmented limbless body, side-right orthographic camera. Image2 is official1979anatomy only, no blood/scenery. Draw a NEW eight-frame consecutive QUICK BITE STRIKE with anticipation and recovery, not a locomotion/head-bob loop: 1neckcoilsbacklow withjawclosed,2neckraisespartwaystillcoiled,3headpullsbackwhilejawopenswide,4headthrustsRIGHT jawopen,5maximumforwardstrike jawSNAPSshut showingmetallicteeth,6headrecoilsleft,7necklowersandstraightens,8returns to lowreadypose. A single creature, torso/tailretainsgroundcontact, no newlimbs/wings/eyes; no extra longtongue. Keep same head dimensionsasImage1acrossframes andclip. Tail compactlycurveswithin cell duringreach, nevercuttinganatomy. Detailedarcadepixelart; accuratepaleribbedbody, smoothbeigeroundedhead. Precisely4columns2rowsequalcells,1774x887canvas. Same scaleandview everyframe. Keepallpixels insideeachcellwith15%margin. SolidopaqueMAGENTA #FF00FFwholebackgroundincludingholes. Nocheckerboard, text, guides, scene, shadows, blood, humans or othercreatures.
```

## Chestburster — death

Génération : `exec-823b4855-4cf3-42bd-a352-c47ba3903da5`. Grille source : 4 × 2, 1774 × 887 pixels.

```text
Use case: stylized-concept. New DEATH animation sheet for the SAME1979Chestburster as Image1. Image1 is approved pixelartidentity/scale, Image2officialanatomyreference. Preserve the smoothbeigehead,tinymetallicteeth,limbless pale ribbed serpentine body,longtaperingtail,right-facingorthographicsideview. NOARMS NOLEGS NOEYES NOADULTXENO. Eight successive clearly DIFFERENT poses of a non-graphic collapse:1smallrecoilneckraised,2bodycurlsinwards,3neckweakensjawslack,4headlowersontoground,5bodyuncurlsontoground,6tailtiprelaxesdown,7verylastsmallbodycontraction,8completelystilllimpdeadcreaturelyinglow. The corpse mustnotstandbackupinfinalframe. Noredwounds,noblood,nogore, no humans. Keep same skullsizeandpixeldetail asImage1, consistentlightingpaletteacross8frames. Wholebodyandtailinsideeverycell,15%garde. FOURCOLUMNS TWOROWS equalcells landscape1774x887. PerfectlyflatopaqueMAGENTA #FF00FF backdropincludingholes; no checkerboard,no groundshadow,no labels,no guides,no borders.
```

## Ovomorph — sealed

Génération : `exec-84b7708f-93bc-4cc9-86c6-d9e53f670798`. Grille source : 4 × 2, 1774 × 887 pixels.

```text
Use case: stylized-concept. Asset type: production Ovomorph SEALED-IDLE sprite animation for Aliens Tantalus Frontier. Image1 is the official NECA Aliens1986 egg reference. Faithfully reproduce the FOREGROUND CLOSED EGG only: tall rounded leathery olive-black/brown ovoid, densely pebbled wrinkled veined surface, broaderlowerbody, narrower roundedcap with FOUR closedpetals andcross-shapeddarkrustseams. No1979root-tentaclebase, nolegs, no mouth, no creatureemerging. Removephotographicsceneryandbluecastinglight; neutralmutedolivebrownpalette withsubtleslimyspecularpixels. Crisp detailed arcadePIXELART, side-onorthographicgameview, wholeegg centeredandstandingonuprightbase. New preciseFOURCOLUMNTWOROWsheet,EIGHTequalcells,landscape1774x887. Eight genuinelydistinct consecutive verysubtleclosedeggpulsationposes: gentle1–3percent inflation thenrelaxation,capstaysfirmlyclosedinALL8frames,sameheightandanchoredground, noopening. This is abreathingloop, notdifferenteggdesigns. Same texturelayout,seamidentity,scale,cameraandlightingallframes. Entireeggwithincentral70%ofeverycell,generous15%margins. UseperfectlysolidopaqueMAGENTA #FF00FFbackgroundforkeyedproduction; includingallgaps. NOcheckerboard,noUI,nolabels,nogrid,noshadow,nofacehugger,noblood,noscene,noextraobjects.
```

## Ovomorph — opening

Génération : `exec-00674e08-81e8-4a34-8f76-203031b5d273`. Grille source : 4 × 2, 1774 × 887 pixels.

```text
Use case: precise-object-edit. Fix ANATOMY ONLY in Image1 eight-frame Ovomorph opening sheet. Image2 official NECA photograph demonstrates correct FOUR-petal anatomy. Image1 wrongly has five petalsinfullyopenposes. Make exactlyFOURlobes arrangedlike4compassdirections: oneLEFT,oneRIGHT,oneBACK,oneFRONT. The FRONTlip must beONEBROADCONTINUOUS fleshytriangularflap, NEVER twoflapsseparatedbyanotch. Noextralobesbetween4cardinaldirections. The opening is a FOUR-corneredcross/square, NOTafive-pointedflowerorstar. Preserve Image1'sdarkolivebrownleatherytexture,pixelartscaleandbaseposition,1774x8874columns2rows,8sequentialopeningposesfromsealedtocompletelyopen. Onlytopfourlipshingeoutwards; lowerbodyintact,NOfacehugger,nodestruction. Maintainmatchingheight/camera/lightingforeachpose,fullpetalsvisiblewithclearcellseparation. SolidopaqueuniformMAGENTA #FF00FFbackgroundunchanged, no textorotherobjects.
```

## Ovomorph — hatch

Génération : `exec-9b150fef-14f5-4576-96b5-d6b7a62f5884`. Grille source : 4 × 2, 1774 × 887 pixels.

```text
Use case: stylized-concept. Production animation: Ovomorph HATCH/RELEASE shell clip. Image1 is approved four-lipped opening sprite sheet. Image2 is officialNECAeggdesign. Keep Image1's SAMEbodytexture/palette/scaleandgroundbase, preciseFOURmouthlips, onephysicaleggwithintactlowerbody. All8posesstartFULLYOPENandstayopen. Eightdistinctconsecutive muscularreleaseposes:1fourlipsheldopenwithdarkcavity,2innerliningcontracts,3frontlipdrawsslightlyin,4fourlipsflexoutandbodytightens,5strongreleasespasmwidenscavity,6bodyrelaxeswithlimpsidemembranes,7lipssettle,8emptyspenteggopenandstill. This is NOTopeningfromsealedandNOTdestruction. DoNOTdrawaFacehuggeranywhere: thegamewillspawnitsseparateanimatedspriteatthereleaseframe. DoNOTdrawextra petals: exactlyFOUR,nofive-lobedflower. Same olive-brownpebbledeggwall,mutedpinkbeigeflesh,no blood,noburstshell,no roots. Same sideviewcamerainallframes, crisp detailedpixelart. FOURcolumnsTWOROWS,1774x887,8equalcells, bodydimensionsmatchingImage1,noscaleshift,fullpetalswithinboundaries. FlatuniformopaqueMAGENTA #FF00FFbackgroundonly,no checkerboard,no shadows,noscenery,notext,noguides.
```

## Ovomorph — destroyed

Génération : `exec-5d658161-dda5-4e8f-8d84-e7cb7cf68423`. Grille source : 4 × 2, 1774 × 887 pixels.

```text
Use case: stylized-concept. NEW Ovomorph DESTROYED animation, eight consecutiveposes. Image1 is approvedOvomorphidentity,Image2canonicalNECAegg. Keep SAMEdarkolivebrownpebbledleatherybody and four-lipdesign, neutralpixelartpalette, fixedbasepositionandscale. Show DEFINITIVE DEATH OF THE EGG, NOTopeningandNOhatching: 1eggbodybucklesinward,2upperwallsbeginwrinklingandsagging,3onewallfoldsin,4capcollapsesontoitself,5entireeggfoldsdownintolowrupturedemptyhusk,6husksettles,7lastsmallsettlingmotion,8lifelesscollapsedhusklyingonbase. No risingbackintoanintactopenegg. No creatureemerges. No looseflyingdebris, gore, blood, splatter, fireorFX; drynon-graphiccollapsedbiologicalhusk. Eachposeclearlydifferentandprogressivelylower, finalposeunderhalfinitialheight. Samecameraorthographicsideview, samewalltexelsstyle. Fourcolumnstworowsequalcells,1774x887canvas, consistentanatomy/allpartswithinmargins, nocharacterscutbycells. FlatopaqueMAGENTA #FF00FFbackgroundonly, no checkerboard,no shadows,noscene,notext,no labels,noguides.
```

## Essais antérieurs conservés hors publication

- Chestburster idle : `exec-8d3c7bfe-6a38-4252-b500-2620c549c2a8` (damier peint).
- Chestburster move : `exec-71bc9dac-b308-4aea-bfe6-7b8f0836bcd6` (action trop proche du repos).
- Ovomorph opening : `exec-4199364b-1dda-45c2-8d18-e39f8a8e0cc4` (lèvre surnuméraire).
