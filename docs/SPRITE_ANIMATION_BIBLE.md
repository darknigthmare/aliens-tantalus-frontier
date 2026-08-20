# Bible sprites & animations v47

## Masters intégrés

| Fichier | Taille | Rôle |
|---|---:|---|
| `echo9-sprite-sheet.png` | 1254×1254 | Marine Echo-9, déplacement, visée, feu, rechargement, conduit, blessure/mort, variante synthétique |
| `xenomorph-sprite-sheet.png` | 1254×1254 | Ovomorphe, facehugger, chestburster, Drone, Warrior, castes lourdes, attaques acides, Reine |
| `arsenal-props-atlas.png` | 1402×1122 | Armes, équipements, terminaux, portes, sentry, P-5000, APC, dropship et véhicules coloniaux |
| `tantalus-base-environment.png` | 1672×941 | Décor multi-plan latéral de Tantalus Base |

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

Les masters sont conservés sans extraction destructive. Avant un export moteur final, la planche doit être découpée visuellement, les cellules réalignées sur le pivot, puis le fond de présentation validé ou détouré en alpha réel. Les originaux de génération restent la source de provenance.
