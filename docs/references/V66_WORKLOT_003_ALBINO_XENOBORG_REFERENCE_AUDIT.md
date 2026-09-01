# V66 — audit de référence 074 Albino Xenoborg

## Verdict

`enemy-074-albino-xenoborg` est une `PROJECT_ADAPTATION` systémique, `canonExact=false`, dérivée uniquement du verrou V66 relu `enemy-022-xenoborg` (`referenceLockSha256=db9fa6dd40e09079b9cad3814e341a10a5ff9589a246a19ef152b415627113c3`). Le Xenoborg de base appartient à la continuité crossover/licenciée d'`Aliens versus Predator` (1999/Classic 2000); aucun modèle officiel « Albino Xenoborg » n'existe. Le modificateur albinos change uniquement les tissus organiques : les greffes cybernétiques, les deux canons d'avant-bras, la visée céphalique et le module dorsal restent métalliques et structurellement identiques. Tous les futurs pixels doivent être des créations originales fan-made/projet, sans copie, recoloration automatique ni revendication 1:1.

## Contrat exact de la queue

Le snapshot reprend exactement `profileId=enemy-074-albino-xenoborg`, `name=Albino Xenoborg`, `archetype=Xenoborg`, `modifier=Albino`, `biology=xenomorph`, `caste=cybernetic`, `provenance=systemic-variant`, `animationFamily=armed`, `batchId=batch-005`, `ordinal=73`, `initialStatus=pending-reference`, `reference=null`, `referenceLockSha256=null`, le provider OpenAI, `canonExact=false`, le profil droit, la grille source 4×2, la grille atlas 4×10 en cellules 256×256 avec garde 16, le pivot `[128,240]` et les trois chemins de sortie. La queue valait `9b95a470e411104ac2fd7688687cda4613fd70eadcd9b25d69549f5413495ee5` au moment du snapshot.

| Clip | FPS | Loop | Frames | `sourcePath` | `contentHash(prompt)` de la queue |
|---|---:|:---:|---|---|---|
| `idle` | 6 | oui | 0–7 | `assets/openai/sprites/frames/v66/batch-005/enemy-074-albino-xenoborg/idle.png` | `ac69c0dd9ed6c352ecf2c69ea2cebce1ee7a944f92aca909d65ec5b99497ec7a` |
| `move` | 12 | oui | 8–15 | `assets/openai/sprites/frames/v66/batch-005/enemy-074-albino-xenoborg/move.png` | `edcdae1c6d2c1ffcf5acf1624fa01b63dffb9dcf9a92ccaf99479f93d8e26035` |
| `attack` | 12 | non | 16–23 | `assets/openai/sprites/frames/v66/batch-005/enemy-074-albino-xenoborg/attack.png` | `8e7e7be30566cd50170255bc66cfb78880b895d40218cf107681ada80f3bb04d` |
| `death` | 10 | non | 24–31 | `assets/openai/sprites/frames/v66/batch-005/enemy-074-albino-xenoborg/death.png` | `e94d11df325a6bd9eb5f1217172a9137640326436b65afe4e97e446f52799728` |
| `reload` | 10 | non | 32–39 | `assets/openai/sprites/frames/v66/batch-005/enemy-074-albino-xenoborg/reload.png` | `ffd5fa16431b10321d60f79ce863a6ac3307e339c8d3bdf11f10484b46ab7d08` |

Les motions, `frameCount`, indices de frames, `normalizedPath` et `previewPath` de chaque clip sont recopiés dans le JSON. Le cinquième clip `reload` est obligatoire et explique la grille atlas 4×10.

## Autorité officielle/licenciée et limites

Deux sources HTTPS positives seulement sont conservées :

- le [manuel officiel Steam de `Aliens Versus Predator Classic 2000`](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3730/manuals/Aliens%20Versus%20Predator%20Classic%202000%20Manual.pdf?t=1579791217), qui établit le résultat d'expériences humaines sur des Aliens capturés, leur contrôle et des cybernétiques/armes greffées;
- la [page produit Steam officielle](https://store.steampowered.com/app/3730/Aliens_versus_Predator?l=english), qui établit le titre Rebellion actuellement distribué.

Le manuel ne décrit ni albinos, ni géométrie exacte des lasers, ni marquages, ni recharge par condensateur. Ces détails proviennent du verrou 022 relu et du screenshot local licencié hashé. Les anciennes pages AVP Central et toute wiki/fan page sont exclues de ce nouveau fragment.

Le 074 conserve un biped lourd avec crâne xénomorphe courbe/ridé, mâchoires, cage thoracique organique visible, jambes augmentées et queue segmentée complète. Il garde exactement deux assemblages de canons laser greffés aux avant-bras, leurs blocs et longs tubes cylindriques, la visée céphalique, les renforts argent/gunmetal, des marques de danger restreintes et un module dorsal rectangulaire à cylindres verticaux. Les tissus organiques deviennent ivoire perlé, os pâle, gris cendre et rose-taupe; le métal ne devient jamais os ou blanc.

Le profil est strictement droit. Le canon proche et sa jonction chair-métal doivent être entièrement lisibles; le greffon éloigné reste structurellement cohérent mais peut être partiellement occulté par un vrai profil latéral. Une vue trois-quarts destinée à montrer les deux canons est interdite.

## Verrou armé, attaque et recharge

`animationFamily=armed` est impératif. L'attaque doit montrer huit états chronologiques : brace du corps, alignement/visée des canons soudés, décharge, recul et récupération. Une petite lueur de bouche peut rester entièrement dans la cellule; aucun projectile détaché, faisceau traversant les cellules, fusil tenu, arme d'épaule ou chargeur n'est permis.

Le `reload` n'est pas un rechargement balistique : les évents des canons s'ouvrent, la chaleur/charge change dans les blocs greffés, le condensateur monte en charge, les évents se referment et le Xenoborg revient en ready. L'ancien clip de base ressemble trop à idle; le futur 074 doit rendre ce changement d'état incontestable, sans retrait de chargeur, insertion de munition, manipulation de culasse ou canon détaché.

## Prédécesseurs locaux vérifiés

- action sheet V56 original 1254×1254 RGBA : `assets/openai/sprites/enemies/xenoborg-action-sheet-v56.png`, 1 148 932 octets, SHA-256 `f4c91316a1f44157dd3e9e9ad96f956add8f1875389d585423464061dd810e8d`;
- action sheet V56 normalisé 1024×1024 RGBA : `assets/openai/sprites/normalized/enemies/xenoborg-action-sheet-v56.png`, 559 815 octets, SHA-256 `2fc8648b364fa415850ec0d5243ca0224c939792436f81493775369d3baa70d0`;
- screenshot licencié 1200×800 RGB : `assets/openai/sprites/reference-masters/v66/batch-002/xenoborg-avp1999.webp`, 93 448 octets, SHA-256 `292ad5ba8223186b0433b90a8bc477096ded1409dff158b092e36eb75d15234e`;
- sources V66 1774×887 : `idle` 1 817 077 octets, `f2b4cd8e38d6c2a489e648bb53fefa1451ae8fc8fd3567665be9aae78feca068`; `move` 1 764 886, `433c64938aa71368c2a7dabf48709b11bd0b435d83ea72ff6a6855897a2d08c2`; `attack` 1 758 947, `a3ed44dc6b43b17fe4a9eb81dd0a1c904c8dd05d8d61378a7547e1007c93de95`; `death` 1 616 349, `d9fee6baa2c6aedd4cb6f63527096ea85834fbd9b4c2e5b5136f4f6af120ac40`; `reload` 1 780 036, `f5d7501012648a8b913f8ec56aac1b66c903f8577c6b690ec727e5d120a78f2f`;
- metadata V66 : 71 004 octets, SHA-256 `a67879d8bcba1c2ea93e152b4763321054ffe742aa26e80eddc9e4c0660e1dd4`;
- verrou de base `V66_BATCH_002_REFERENCES_C.json` : `cec2e0721890f58e54fa64015cfc7474ed6fd71743e78ad9285ea08f625bb47c`;
- audit source : `27e126ac9665deea0b2728164727205ffe1202fd982d8311dd88a421da899d5c`; revue atlas/root : `45ef0adf4a03e313d3fcfb492ab418b271ae5bc88dc3a0e774120a9283cc1e96`;
- registre roots : `31426022398546429ea8ad7defdfbf642c4fd854b3bb64270df0a725acd121e3`; revue scale : `dcab1772242b00106219b5a5d12f595e1452d74f524f3cab95b9bd9db235e115`.

Les seize `localPaths` existent. Les deux action sheets, le screenshot et les cinq planches actives ont été décodés et affichés en aperçus mémoire durant cette passe; aucun octet source n'a été modifié. Le screenshot reste une vue de jeu perspective et éclairée, pas un turnaround. La base reste `pending-visual-review`, `runtimeIntegrated=false` et `canonExact=false`.

## Échelle, root et défauts non hérités

La metadata 022 rapporte un ancien pack scale commun `0.502242152` et cinq valeurs nominales à `1.0`, mais `scaleCalibrationReview=null` et `scaleCalibrationEvidence=[]`. Le fragment fixe donc `inheritSourceScaleByClip=false` : aucune échelle numérique de la base n'est promue. Une calibration indépendante des 40 nouvelles poses devra employer crâne, cage thoracique, bassin, membres proximaux, jonctions des canons et module dorsal, jamais les extrémités de tubes ou de queue seules.

Le registre de roots ne contient aucune entrée 022. Les 40 placements de base restent `legacy-bounds-center-bottom` et `pending-body-root-review`; aucune coordonnée n'est transférée. Le 074 devra relier un repère bassin/bas de cage au véritable pied porteur ou au plan du corps après chute. Les tubes des canons, le module dorsal, les effets de bouche et la queue sont exclus du calcul du root.

L'audit source signale des contacts latéraux dans `idle` 6/7 (`10/10`), `move` 1/2 (`9/10`) et 2/3 (`35/37`), `attack` 6/7 (`11/11`). La mort touche toutes les frontières de ligne : 0/4 bas/haut `36/33`, 1/5 `41/38`, 2/6 `50/47`, 3/7 `71/67`; elle ajoute les contacts latéraux 1/2 `13/12`, 2/3 `22/20` et 6/7 `49/50`. `reload` ne présente aucun indice de contact. Ces indices sont techniques, ni des roots acceptés ni des continuités à recopier.

La revue atlas maintient un haut du corps partiellement trois-quarts, une perspective instable, du rose résiduel sur certains tuyaux/cou et une recharge trop proche d'idle. Le verrou impose de corriger ces défauts dans de nouveaux pixels originaux.

## Méthode de hash des prompts

Les neuf prompts 073–074 ont été recalculés avec la convention réelle du pipeline, `contentHash(prompt) = SHA-256(JSON.stringify(prompt))`; les cinq valeurs 074 correspondent exactement. Un SHA-256 appliqué directement au texte UTF-8 brut emploie un autre contrat et peut donc différer normalement : cette différence n'est ni une anomalie, ni la preuve d'un prompt invalide. Les textes `BLOCKED` restent des snapshots de queue, pas des reçus ImageGen prêts à l'emploi; ils devront être reconstruits après fusion du `designLock`.

## Simulation de fusion et limites

`assembleReferenceRegistry` a accepté en mémoire les fragments 073 et 074 contre 71 profils et le registre global SHA-256 `7dc83ee9e72a184a78ab3270ca8897f93826523d3461bb39a5c2bd8cc8b8f203`. Le registre simulé contient 73 profils et aurait le SHA-256 `6a0cf9bdbac06c3ff1d1be7f27e5077cde60af530915dfbbe7092aca7832565f`. Les identités et contrats de clips sont exacts, les neuf `contentHash` correspondent, les deux URLs utilisent HTTPS et tous les chemins locaux existent. Rien n'a été écrit dans le registre global.

Ce travail n'autorise aucune génération, acceptation ou intégration runtime et ne modifie ni global, ni queue, ni state, ni sprite, ni metadata, ni Git.
