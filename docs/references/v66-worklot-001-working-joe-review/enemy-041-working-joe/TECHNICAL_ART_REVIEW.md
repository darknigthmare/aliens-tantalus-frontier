# Enemy 041 — Working Joe — revue standalone actualisée pour death-r3

Date : 2026-09-01. Profil : `enemy-041-working-joe`. Batch : `batch-003`. Relecteur : `Codex /root/audit_profile_041`.

## Décision

Le nouveau master actif `death.png`, SHA-256 `3bbdb986cd4892c0dd3a0b14704adbaee07da3bc87566408db0e47d81838f157`, passe la revue technique 4×2 et remplace correctement l'ancienne révision qui tournait vers la caméra. Les poses terminales 6, 7 et 8 sont maintenant latérales, orientées vers la droite et réellement prone. Le blocker artistique `death` est donc **levé**.

Le profil ne reçoit néanmoins aucune acceptation automatique : le blocker artistique restant est `move r2`, dont l'alternance complète des appuis n'est toujours pas démontrée. `canonExact=false`, `accepted=false` et `runtimeIntegrated=false` restent obligatoires.

Les fragments standalone actualisés passent leurs validateurs : quinze mesures d'échelle, quarante racines physiques, huit bounds death-r3 exacts, zéro violation de garde et zéro contact de frontière death. Aucun global, metadata, normalisé, queue/state, autre profil, runtime ou état Git n'a été modifié par cette reprise.

## Provenance de la nouvelle révision

- Master actif : `assets/openai/sprites/frames/v66/batch-003/enemy-041-working-joe/death.png`, SHA `3bbdb986cd4892c0dd3a0b14704adbaee07da3bc87566408db0e47d81838f157`.
- Reçu : `death-r3.production-event.json`, SHA `e530ada70d9abd9c38b1fc01ac7ebefe4756c0144632e99d0ff9650a47f3de9a`.
- Capture ImageGen brute retenue : SHA `0c195b1563ac363fadf2f7ad6e16e510f3723586e0a0b76ea679d33883634671`.
- Prompt réellement utilisé : SHA `7ebf6d4001ebcf758ee1375f9a95bf530175c2829c65365a09484561ee4ae01a`.
- Le reçu documente ensuite un flatten déterministe du matte et une recomposition sûre par cellule. Ces réparations sont antérieures à cette revue; aucune génération ni réparation de pixels n'a été exécutée ici.
- Ancien actif préservé : `rejected/death-r1-late-camera-turn-25ca0956.png`, SHA `25ca095618ffe5c41de854ab09fab4622c8abd48cf29c23b662c99d37cf50215`.

## Masters actifs

| Clip | SHA-256 | Format | Grille |
|---|---|---|---|
| idle | `c0fa426d411febc2006b7199ca50b7f4dc27c7fa71a1f261e8366a89f564869b` | RGB 1774×887 | 4×2, 8 poses |
| move r2 | `ce25ef5e0896dc36f98ccbaed3667c91246574352cb23ed6989c79e0e8409e70` | RGB 1774×887 | 4×2, 8 poses |
| attack | `732c1570fe03663b49734f3db862f167f3d9a6ad470ef12b4fdbd68ce768d288` | RGB 1774×887 | 4×2, 8 poses |
| death r3 recomposé | `3bbdb986cd4892c0dd3a0b14704adbaee07da3bc87566408db0e47d81838f157` | RGBA 1774×887, alpha 255 partout | 4×2, 8 poses |
| hurt | `0f95a22d23dc82eb96b086e9822b44e095edc351035d39e926568430466a8d2e` | RGB 1774×887 | 4×2, 8 poses |

Le ratio est exactement 2:1. Les partitions nominales restent x `[0,444,887,1330,1774]` et y `[0,444,887]`. Le splitter de production exécuté en mémoire passe 8/8 pour death-r3 sans réassignation et sans contact de bord.

## Direction, identité et continuité

Death-r3 conserve le Working Joe standard : crâne chauve pâle, uniforme olive/gris-brun à renforts et liserés ocre, mains pâles, pantalon sombre et bottes de travail. Aucun prop, arme, armure, masque, cheveu ou membre supplémentaire n'apparaît.

La chronologie est lisible : choc et perte de support, flexion, genou, appui mains, bascule latérale, corps prone puis immobilité. Les poses 6–8 gardent la tête et le corps en profil droit; aucune rotation frontale tardive ne subsiste. Elles sont distinctes de `hurt`, qui reste debout et récupère.

État des portes artistiques :

- `death` : **porte fermée auparavant, maintenant levée**; poses finales latérales/prones validées visuellement.
- `move r2` : **reste bloquant**; la jambe proche à couture demeure devant dans la pose 5 et le cycle n'établit pas clairement l'opposition complète.
- `attack` : lisible; occlusion de doigts à extension maximale à relire, non bloquante techniquement.
- `hurt` : transition 3→4 abrupte à relire, non bloquante techniquement.

Les références disponibles ne certifient pas les bottes entières ni la couture orange du pantalon et sont principalement frontales/trois-quarts. La vue latérale demeure une adaptation : `canonExact=false`.

## Échelle inter-clips

Repère rigide unique : corde `synthetic skull crown-to-chin chord`, du crown anatomique à l'éminence mentonnière en suivant la rotation de la tête, hors cou, col, optique et mains. Idle reste la baseline à 64,031242 px.

| Clip | Poses 0-based | Longueurs px | Médiane px | Facteur proposé |
|---|---|---|---:|---:|
| idle | 0, 3, 7 | 65,969690; 64,031242; 63,788714 | 64,031242 | 1,000000 |
| move | 0, 3, 6 | 63,063460; 65,000000; 63,788714 | 63,788714 | 1,003802 |
| attack | 0, 4, 7 | 65,000000; 64,288413; 64,031242 | 64,288413 | 0,996000 |
| death-r3 | 0, 1, 2 | **63,655322; 62,641839; 61,073726** | **62,641839** | **1,022180** |
| hurt | 0, 3, 7 | 65,969690; 64,288413; 64,761099 | 64,761099 | 0,988730 |

Endpoints death-r3, coordonnées locales : pose 1 `(134,53)→(178,99)`; pose 2 `(280,105)→(262,165)`; pose 3 `(260,170)→(257,231)`.

La correction maximale proposée devient 2,218 %, sur death-r3. Elle ne constitue pas une dérive majeure, mais elle remplace impérativement l'ancien facteur death `0,995037`. Aucun facteur n'a été appliqué ici.

## Racines et bounds physiques

Méthode : centre du bassin à la jonction proximale des jambes, projeté verticalement vers le support physique; `anchorY=sourceBounds[3]`. Les bounds ci-dessous proviennent du splitter de production actuel et incluent sa garde de trois pixels.

| Pose | Landmark bassin | Root | Source bounds | Support |
|---:|---|---|---|---|
| 1 | `[230,280]` | `[230,421]` | `[120,46,363,421]` | bottes finales |
| 2 | `[220,290]` | `[220,420]` | `[126,103,318,420]` | perte d'appui des bottes |
| 3 | `[204,319]` | `[204,421]` | `[94,168,288,421]` | genou/botte/corps |
| 4 | `[185,325]` | `[185,421]` | `[63,198,276,421]` | genou/botte/corps |
| 5 | `[190,274]` | `[190,354]` | `[67,170,371,354]` | genou/main/corps |
| 6 | `[163,310]` | `[163,367]` | `[0,241,408,367]` | corps/main prone |
| 7 | `[166,323]` | `[166,369]` | `[7,281,381,369]` | corps/avant-bras prone |
| 8 | `[170,326]` | `[170,362]` | `[4,291,376,362]` | corps terminal prone |

Les huit landmarks sont dans leurs bounds, les huit roots satisfont `sourceBounds[3]-anchorY=0`, et aucune pose n'est airborne. Avec les 32 records inchangés des autres clips, le dry-run exact renvoie **40/40**, `status=reviewed`, zéro violation et zéro écriture hors dossier temporaire.

## Ownership historique « death frame 6 »

Le terme reste zéro-based : index 6 = pose authored 7. Sur death-r3, le signal ancien a disparu :

- pixels de signal à la frontière globale x=887 : **0**;
- foreground réel de la pose 6 : fin x=849 exclusive;
- matte avant frontière : 38 colonnes;
- foreground réel de la pose 7 : début x=897;
- matte après frontière : 10 colonnes;
- séparation totale des deux foregrounds : **48 colonnes**;
- `crossCellSpill=false`, aucune réassignation requise ou disponible.

Le nouvel overlay `death-frame6-ownership-overlay.png` remplace la preuve des six pixels d'antialias de l'ancien master.

## Matte et palette death-r3

Death-r3 possède un canal alpha mais il est intégralement opaque : extrema `[255,255]`, donc aucune transparence native effective. Le matte est désormais parfaitement plat :

- ratio magenta strict : `0,871313`;
- ratio exact `#FF00FF` : `0,871312927`;
- ratio strict sur les bords : `1,0`;
- médiane/min/max des bords : `[255,0,255]`;
- couleurs de bord uniques : `1`.

La palette corporelle dominante reste cohérente avec les autres clips : olive/brun `[77,68,39]`, `[58,49,23]`, `[117,95,61]`, peau pâle `[185,179,179]`. Aucun recoloriage n'a été appliqué par l'audit.

## Validation et gate d'intégration

- `validate-working-joe-fragments.mjs` : PASS; 15 mesures, facteurs complets, 40 anchors, 8 bounds death exacts, zéro violation, ownership à zéro signal, provenance 9/9, aucun merge.
- `validate-working-joe-current-death.py` : PASS; splitter courant sur les cinq sources, 40/40 roots résolues par `reviewed_source_anchors`, huit bounds death-r3 exacts, écriture temporaire uniquement.
- Syntaxe et structure : PASS pour 4 JSON, 7 scripts Python compilés en mémoire et le validateur Node; tests de merge ciblés 20/20 PASS.
- Le check de production courant échoue exactement sur `ValueError: Scale source evidence changed for death.` C'est attendu : les globaux et la metadata contiennent encore le hash et le facteur de l'ancien death. Les fragments actualisés doivent remplacer les entrées 041 globales puis la normalisation doit être rejouée par l'agent principal.

Hashes de l'état global seulement relu au moment de l'audit : queue `48fef042eeae817e239e3d429bcdf1620beb757f36e53a12ced7cdf7d5d757ca`, scale global `903f8f61027210f7421c832222b3e59795b5a816fdf07e4fdbf4c793c0c9d3a1`, anchors global `bc70f7d90552f9ac182f5f7640d3252a08667e30d28beea5938efa1ed149d90a`, metadata 041 `28f180953c66ff1eaa7eaa6ae914844b15d4824ad8fb5bed8eb38113da974582`.

## Artefacts standalone

- `scale-review.fragment.json` : death-r3 SHA, trois mesures et facteur `1.022180`.
- `anchor-review.fragment.json` : huit roots/bounds death-r3 et couverture 40/40.
- `source-ownership.review.json` : ancien signal résolu à zéro sur la nouvelle source.
- `provenance.json` : reçu r3, actif, ancien actif rejeté, hashes et non-revendications.
- `death-scale-overlay.png`, `death-anchor-overlay.png`, `death-frame6-ownership-overlay.png`, `death-coordinate-contact.png` et `head-landmark-contact.png` : preuves visuelles dérivées.

Périmètre respecté : aucune génération par cette revue; aucun pixel source, global, metadata, normalisé, queue/state, autre profil, runtime ou état Git modifié; aucune acceptation et aucune intégration runtime.
