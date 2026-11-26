# Reprise technique après interruption — Alien: Earth V12

## Statut de ce commit

Ce commit préserve les **huit PNG générés** et la documentation de reprise. Il ne contient pas les fichiers complets de l’intégration locale interrompue. Il ne prouve pas un build du DLC, une publication jouable ou une fusion dans `main`.

L’exécuteur a renvoyé « No usable execution environment is available » pendant la finalisation. Les étapes ci-dessous évitent de confondre les modifications déjà enregistrées localement, celles restées à faire et celles effectivement transférées dans GitHub.

## 1. Où chercher le travail local

Dépôt isolé utilisé avant l’interruption :

`/home/agent/alien-earth-9580be0a7920/aliens-tantalus-frontier`

Branche locale : `codex/alien-earth-v12-integration`.

Base : `07ee99d56480780044c74d4f1eb11f31b07fef13`.

Source V11 originale extraite :

`/home/agent/alien-earth-9580be0a7920/source-v11/ALIEN_EARTH_DLC_V11`

Le lien `/workspace/scratch/9580be0a7920/aliens-tantalus-frontier` pointait vers ce dépôt. **Vérifier l’existence réelle de ces chemins avant de s’y fier.** Ils peuvent être transitoires. Aucun commit ni push de l’intégration n’avait été réalisé au moment de la panne.

Ne pas modifier les autres checkouts actifs. En particulier, `/workspace/scratch/bf50da5d633c/aliens-tantalus-frontier` contenait un travail distinct Aliens 1986 sur `codex/aliens-v118-props-supports`.

Si le dépôt local n’est plus disponible, reconstruire à partir de l’archive V11 conservée sur GitHub et de ces notes. Les notes décrivent des décisions ; elles ne remplacent pas une copie complète des fichiers perdus.

## 2. Archive V11 récupérable

Commit d’archive fixe : `6ed9b9210a097bbdf90ec3a22043a3fe5845e541`.

Dossier : `archives/local-recovery-20261125/alien-earth/`.

| Fragment | Octets | SHA‑256 |
|---|---:|---|
| `.zip.part001` | 10 485 760 | `617b87da33c483b191d62c1fb68da5e2a8100252f11d7774f7d6016f6873785b` |
| `.zip.part002` | 10 485 760 | `22ffd1258d0ebc88b288a76fea05488dc737699f07d13fae5ee1607d5fcbe6b0` |
| `.zip.part003` | 2 924 202 | `3c73fba993587e3fef936599a8d027db43e877c1e5d5747f563f872122e7eb36` |

Le dossier parent contient `MANIFEST.json` et `reconstruct.py`. Lire leur usage avant reconstruction. L’archive assemblée doit donner 23 895 722 octets et le SHA‑256 `c6402939c7e3085609b191848f710cd2efe84c5bfe6547a2cf95ca39494c38f3`, puis 180 fichiers.

Une autre bible narrative existe dans la PR de brouillon [#68](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/68), chemin `docs/narrative/dlc/alien-earth.md`. Sa base cumulative diverge de `main` ; ne pas considérer ses modifications comme fusionnées dans la base de cette reprise.

## 3. Raccord hôte écrit localement

Fichiers racine modifiés avant la panne :

- `index.html`
- `package.json`
- `scripts/audit-native-qa-resources-v187.mjs`
- `scripts/build.mjs`
- `scripts/dev.mjs`
- `scripts/qa-title-compositions-v163.py`
- `scripts/verify-aliens1986-main-succession-v116.mjs`
- `scripts/verify-public-release-v86.mjs`
- `src/app.js`
- `src/title-screen-v61.js`

Fichiers ajoutés ou copiés localement :

- `.github/workflows/alien-earth-dlc.yml`
- `docs/development/ALIEN_EARTH_GITHUB_INTEGRATION_V12.md`
- `modules/alien-earth/RECOVERY_V11.json`
- Les 180 fichiers de la source originale sous `modules/alien-earth/v12`
- `scripts/build-alien-earth-dlc.mjs`
- `scripts/public-alien-earth-dlc-admissions.mjs`
- `scripts/qa-alien-earth-integration-v12.py`
- `scripts/verify-alien-earth-integration-v12.mjs`
- `modules/alien-earth/v12/tests/lifecycle-v12.test.mjs`

Comportement prévu : septième action **ALIEN: EARTH** dans le titre du Tantalus, navigation clavier/manette/tactile, ouverture de `dlc/alien-earth/v12/index.html`, retour depuis le titre ou la pause Earth, traitement d’un échec d’enregistrement et possibilité d’exporter la sauvegarde. Les profils natifs et le stockage Earth restent distincts.

Le builder local avait été remplacé par une traversée transitive des modules ES, avec scopes isolés pour l’export HTML portable et images embarquées via `globalThis.EARTH_RASTER_INLINE_V12`. La distribution publique devait contenir uniquement le runtime admis et les huit PNG, sans les captures ou journaux documentaires.

Les admissions ont été étendues explicitement aux huit noms de fichiers, sans wildcard. Les contrôles de succession des modifications hôte ont été maintenus. Les résultats historiques Aliens/Fleuve ne doivent pas être réécrits comme preuves d’Earth.

### Correction restante obligatoire dans le callback hôte

Le callback `onAlienEarth` utilisait encore :

```js
bioforgeRuntimeV80.stop({ purge: false, reason: 'alien-earth-launch' });
```

La lecture du runtime a montré que cette méthode peut persister une session Forge chargée. La remplacer par la méthode existante :

```js
bioforgeRuntimeV80.stopBioforgeEngineOnlyV80();
```

**Cette correction n’a pas été appliquée avant la panne.**

Adapter le double de test de `scripts/verify-alien-earth-integration-v12.mjs` :

```js
bioforgeRuntimeV80: {
  stopBioforgeEngineOnlyV80: () => events.push(['bioforge-engine-only'])
}
```

Puis remplacer l’événement attendu `['bioforge', false]` par `['bioforge-engine-only']` et actualiser seulement le `currentSha256` de `src/app.js` dans `EARTH_MAIN_SUCCESSORS_V12`, fichier `scripts/audit-native-qa-resources-v187.mjs`.

### Correction de sauvegarde Earth déjà écrite et testée localement

Le handler `visibilitychange` pouvait enregistrer un état initial au titre et remplacer une sauvegarde existante. La correction garde le stockage inchangé tant que la partie n’a pas commencé (`!started`). Deux tests reproduisaient l’échec sur l’original ; quatre tests de cycle de vie ont passé après correction, avec le vrai EarthEngine et le stockage, mais des doubles DOM.

Le schéma reste 11 et la clé reste `atf.dlc.alien-earth.s1.profile-1`.

## 4. Registre raster écrit localement

Le fichier `modules/alien-earth/v12/src/alien-earth-raster-v12.js` contenait **cinq entrées** : `mcsx`, `species19-adult`, `joe-mcsx-idle`, `zoo-cylinder`, `zoo-console`.

Implémentation locale observée :

- Pas d’accès au DOM à l’import ; environnement injectable.
- Chargement différé ; résolution relative à `document.baseURI`, priorité à la carte inline.
- Contrôle des dimensions réelles.
- Fallback Canvas si indisponible, en attente, en erreur, incohérent ou si `drawImage` lève une exception.
- Découpe source à neuf arguments, aspect conservé, pivot en pixels source et retournement horizontal.
- Sauvegarde/restauration du contexte Canvas et conservation de l’alpha d’occlusion.
- Ombres au sol pour Joe et Species 19.
- Événement `earth-raster-ready-v12`, raccordé au rafraîchissement des portraits/armes du catalogue.
- Diagnostics : statut, erreur, URL inline/relative, nombre de dessins, dernière géométrie.

Interfaces à retrouver :

```text
EARTH_RASTER_ASSETS_V12
EARTH_RASTER_PROP_OVERRIDES_V12
resolveEarthRasterURLV12(id, environment)
preloadEarthRasterV12()
getEarthRasterDiagnosticsV12()
resetEarthRasterV12(environment)
getEarthRasterPlacementV12(id, options)
getEarthRasterPropPlanV12(prop, room, options)
selectEarthRasterWeaponV12(id)
selectEarthRasterHumanV12(role, pose)
selectEarthRasterCreatureV12(enemy)
selectEarthRasterPropV12(prop, room)
drawEarthRasterWeaponV12(...)
drawEarthRasterHumanV12(...)
drawEarthRasterCreatureV12(...)
drawEarthRasterPropV12(...)
```

Hooks locaux :

- `alien-earth-reference-art-v10.js` : MCS-X dans `drawReferenceWeaponV10`.
- `alien-earth-reference-art-v11.js` : sélection du personnage raster avant le Canvas historique.
- `alien-earth-renderer.js` : Species 19, props R18 et panneaux muraux.
- Le profil `eye_host` transmet explicitement `raster:false` à Arthur.

Joe est admis seulement en attente avec MCS-X, sans état accroupi, bas, portage ou costume de chapitre d’index 6. Species 19 est admise seulement pour `kind === 'tick'`. Les cylindres concernent `R18-0` et `R18-4`, les consoles `R18-wall1` et `R18-wall3`.

### Paramètres des cinq entrées locales

Ces rectangles source et pivots étaient écrits dans le registre local. Ils ne sont pas encore validés dans le navigateur.

| Asset | Source XYWH | Pivot XY |
|---|---|---|
| `mcsx` | [26,43,1729,800] | [540,390] |
| `species19-adult` | [65,72,2048,575] | [1086,639] |
| `joe-mcsx-idle` | [190,16,666,1511] | [462,1519] |
| `zoo-cylinder` | [178,45,527,1656] | [441.5,1693] |
| `zoo-console` | [399,41,778,926] | [788,959] |

Tailles maximales visibles : MCS-X 79×40 ; Species 19 78×42 ; Joe hauteur122, multipliée par l’échelle de pose. Les PNG restent inchangés.

## 5. Trois ressources restant à raccorder

Les PNG existent dans ce point de reprise. Les données suivantes sont des paramètres de départ, pas une validation visuelle finale.

| Asset | Dimensions | Bounds alpha128 XYWH | Source proposée avec marge8 | Pivot proposé |
|---|---:|---|---|---|
| `arthur-idle` | 1024×1536 | [301,11,404,1521] | [293,3,420,1533] | [506,1532] |
| `zoo-lab-table` | 1774×887 | [41,146,1691,627] | [33,138,1707,643] | [886.5,773] |
| `zoo-cabinet` | 1086×1448 | [96,82,895,1306] | [88,74,911,1322] | [543.5,1388] |

Arthur : ajouter l’entrée et activer le sélecteur déjà prévu, uniquement sain et immobile.

Table : `R18-island`, largeur195/profondeur52/hauteur75 ; support visible cohérent, collisions inchangées.

Meuble : décor mural R18, bande y235–300 centrée x450, hauteur≤65 ; ne pas recouvrir le panneau x230–460/y304–372 ni la console x530. Hook envisagé dans `drawReferenceBackdropV11`, après le fond V10 et avant le retour anticipé des tags non gérés. Aucun volume solide supplémentaire.

## 6. Tests à écrire et à exécuter

`tests/raster-v12.test.mjs` n’avait pas encore été créé. Couvrir les risques réels :

1. Import sans DOM, signature et dimensions des huit fichiers.
2. Résolution relative et inline.
3. Chargement, absence, erreur réseau/décodage, mauvaises dimensions et exception de dessin.
4. Équilibre Canvas `save/restore` et alpha.
5. Limitation des affectations aux IDs R18 prévus ; données et collisions inchangées.
6. Joe : un seul fusil ; fallback pour chaque état incompatible.
7. Arthur sain et exclusion explicite d’`eye_host`.
8. Aspect, pivot et retournement.
9. Species 19 et maintien des overlays d’état.
10. Entrée/retour hôte sans écriture involontaire des profils natifs.

Une fois le registre terminé et la correction Forge appliquée, relancer depuis le dépôt local :

```sh
npm run test:dlc:earth
node --test scripts/verify-aliens1986-main-succession-v116.mjs scripts/verify-river-of-pain-succession.mjs
ATF_BUILD_OUTPUT=/home/agent/alien-earth-9580be0a7920/earth-public npm run build:dlc:earth
```

Ces commandes correspondent au travail local décrit ci-dessus. Elles ne sont pas garanties disponibles dans la branche de récupération des seuls PNG.

## 7. Navigateur et vérification visuelle

Chrome Headless Shell **151.0.7922.34** a été téléchargé depuis la distribution publique normale de Chrome for Testing et lancé avec succès. Un vrai contexte Canvas2D a été confirmé. Cela ne constitue pas une exécution du jeu.

Chemin installé :

`/home/agent/alien-earth-9580be0a7920/browser-runtime/chrome-headless-shell-linux64/chrome-headless-shell`

Archive : 120 231 126 octets ; SHA‑256 `3cfc2bd00d1bafcf8a68dc74c9c92bb7150ddc8d26ade948a776316e1cec4f14`.

Preuves locales préparées : `browser-installation.json`, `browser-smoke.json`. Vérifier leur présence et la disponibilité du binaire après restauration.

Commande de contrôle ciblé prévue :

```sh
ATF_CHROMIUM_EXECUTABLE=/home/agent/alien-earth-9580be0a7920/browser-runtime/chrome-headless-shell-linux64/chrome-headless-shell \
python3 -B scripts/qa-alien-earth-integration-v12.py \
  --root /home/agent/alien-earth-9580be0a7920/earth-public \
  --source-root . \
  --output /home/agent/alien-earth-9580be0a7920/earth-browser \
  --skip-title
```

**La variante `--skip-title` ne vérifie pas le vrai menu hôte.** Construire et tester séparément l’hôte pour valider l’entrée et le retour. Vérifier aussi le portable avec ses huit images embarquées.

## 8. Résultats réellement observés avant interruption

| Contrôle | Résultat |
|---|---|
| Module V11 + régression de sauvegarde | 1 220 / 1 220 réussis avant les dernières modifications |
| Succession Aliens/Fleuve | 7 / 7 réussis au contrôle effectué |
| Première série d’intégration | 7 / 8 ; échec d’admission des PNG, ensuite corrigé dans le code |
| Série d’intégration renforcée | Non relancée après les corrections |
| Tests raster finaux | Non écrits / non exécutés |
| Build final huit PNG | Non exécuté |
| Jeu dans Chromium | Non exécuté |
| Navigateur réel et Canvas2D seuls | Test de lancement réussi |
| Octets, signatures PNG, IHDR et SHA‑256 des huit images sauvegardées | Vérifiés dans la reprise cloud |

Ne pas reporter une exécution antérieure comme une réussite d’un code modifié ensuite.

## 9. Avant un futur commit d’intégration

Le reçu local `modules/alien-earth/RECOVERY_V11.json` couvre les 180 fichiers originaux. Son SHA‑256 observé était `a46b5f9067119ca591e4a3555ead42b4a88a90e14ead7d4b99adac525243ac97`.

Les 30 journaux V11 historiques sont ignorés par Git mais appartiennent à l’archive récupérée. S’ils sont bien présents et concordent avec le reçu, les ajouter explicitement :

```sh
git add -f -- modules/alien-earth/v12/docs/v11/*.log
```

Ce sont des preuves historiques, pas de nouveaux résultats QA. Préserver les reçus originaux ; actualiser seulement les chaînes de succession des fichiers réellement modifiés.

Comparer la branche courante et `main` avant tout push ou fusion. La branche cumulative `claude/nifty-shannon-qpy1hl` et les PR de récupération ne sont pas automatiquement intégrées à `main`.
