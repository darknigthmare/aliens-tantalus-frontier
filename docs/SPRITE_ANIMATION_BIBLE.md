# Bible sprites & animations v47.1

## Masters intégrés

| Fichier | Taille | Rôle |
|---|---:|---|
| `echo9-sprite-sheet.png` | 1254×1254 | Marine Echo-9, déplacement, visée, feu, rechargement, conduit, blessure/mort, variante synthétique |
| `xenomorph-sprite-sheet.png` | 1254×1254 | Ovomorphe, facehugger, chestburster, Drone, Warrior, castes lourdes, attaques acides, Reine |
| `arsenal-props-atlas.png` | 1402×1122 | Armes, équipements, terminaux, portes, sentry, P-5000, APC, dropship et véhicules coloniaux |
| `tantalus-base-environment.png` | 1672×941 | Décor multi-plan latéral de Tantalus Base |
| `echo9-classes-animation-sheet.png` | 1024×1024 | Commandement, smartgunner, ingénierie/démolition, corpsman/xénobiologie |
| `human-factions-animation-sheet.png` | 1024×1024 | USCM, commandos corporatistes, UPP/Seegson, survivants Crucible/ATARAX |
| `synthetic-android-animation-sheet.png` | 1024×1024 | Synthétique de terrain, utilitaire, combat et endommagé |
| `pathogen-fauna-animation-sheet.png` | 1024×1024 | Néomorphe, lignée deacon, abomination pathogène et faune locale |
| `neuro-xeno-animation-sheet.png` | 1024×1024 | Red Hive, K-Series, Xenoborg/Ripper et ATARAX |
| `vehicle-animation-sheet.png` | 1024×1024 | Power loader, APC, dropship et rover/submersible |
| `combat-vfx-animation-sheet.png` | 1024×1024 | Tirs, flammes, acide, explosions, fumée et étincelles |
| `interactive-props-animation-sheet.png` | 1024×1024 | Sas, sentry, terminal/réacteur et transit/quarantaine |

Ces images sont des **masters de production OpenAI**. Le runtime v47 utilise aussi des silhouettes Canvas paramétriques afin que les 568 variantes restent jouables sans prétendre qu’un master équivaut à 568 dessins uniques.

## Contrat d’animation

- Origine : centre bas du contact au sol; aucun changement de pivot entre frames.
- Orientation principale : profil droit; miroir autorisé seulement pour les acteurs asymétriques validés.
- Pas de frame vide. Les événements (`footstep`, `muzzle`, `mag-out`, `mag-in`, `acid`, `hit`, `death-lock`) vivent dans les métadonnées, pas dans l’image.
- Les armes et effets sont sur couches distinctes lorsque l’animation est découpée pour production.
- Chaque export runtime doit avoir une texture puissance de deux ou un atlas avec métadonnées JSON; marge minimale 4 px entre cellules.

## Cycles humains et synthétiques

| État | Frames cibles | Boucle | Événements |
|---|---:|---|---|
| Idle / respiration | 8 | oui | équipement secondaire |
| Marche | 8 | oui | pas 2/6 |
| Course | 8 | oui | pas 1/5 |
| Accroupi / visée | 8 | oui | aim-ready |
| Tir | 6–8 | non | muzzle, casing, recoil |
| Rechargement | 8–12 | non | mag-out, mag-in, chamber |
| Échelle / conduit | 8 | oui | contact alterné |
| Blessure / mort | 6–10 | non | hit, fall, death-lock |

Production complète : 8 directions pour les vues tactiques, profil gauche/droite pour le Metroidvania, variations sans casque/casque/pression/APE et synthétiques endommagés.

## Cycles xénomorphes

| Acteur | Minimum |
|---|---|
| Ovomorphe | fermé 1, frémissement 4, ouverture 8, menace 4 |
| Facehugger | idle 6, course 8, saut 8, agrippement 6, mort 6 |
| Chestburster | idle 4, crawl 8, bond 6, cri 6, mort 6 |
| Drone/Warrior | idle 8, stalk 8, course 8, mur/plafond 8, griffe 8, mâchoire 6, queue 8, blessure 6, mort 10 |
| Praetorian/Crusher | idle 8, marche 8, charge 10, impact 8, stagger 6, mort 12 |
| Spitter | idle 8, charge acide 6, tir 8, récupération 6, mort 10 |
| Reine | idle 12, marche 12, rugissement 10, griffe 10, queue 12, ovipositeur 12, blessure 8, mort 16+ |

## Découpe et alpha

Les copies v47 historiques ont un canal alpha réel vérifié par `scripts/clean-atlas-alpha.mjs`. Les huit plaques v47.1 passent par `scripts/sprite-sheet-normalize.mjs` : alpha réel, sortie RGBA 1024×1024, cellules 256 px, gardes transparentes de 8 px, contrôle des 16 cellules et des duplications.

Les originaux ImageGen restent sous le dossier de génération OpenAI et les copies normalisées sont les sources du runtime. La découpe finale peut utiliser directement la grille 4×4 déclarée dans `src/visuals.js`.
