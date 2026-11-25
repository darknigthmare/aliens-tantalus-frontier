# Intégration native Alien 3 / Fiorina V114

## Résultat

Le DLC Fiorina est raccordé au jeu principal : catalogue des opérations, briefing, choix du montage, construction de niveau, composition du moteur, sauvegarde et reprise. Le point de départ est `claude/nifty-shannon-qpy1hl`, commit `001a20bdc0f9f1a3c835e84d8f3c9434bc159330`. Cette intégration conserve les couches modernes du moteur et les identifiants de sauvegarde existants.

Dans les opérations spéciales, choisir **MIRE · FIORINA 161**, puis le montage **Cinéma** ou **Assembly** dans le briefing. La campagne est solo. Les armes, équipements et véhicules militaires de la campagne principale ne sont pas appliqués à Ripley.

Identifiants stables :

| Objet | Identifiant |
| --- | --- |
| Campagne | `special-alien3-fiorina-161` |
| Opération | `alien3-fiorina-161` |
| Gabarit de niveau | `fiorina-161-prison` |

## Sources récupérées

Les modules des versions V88 à V114 ont été reconstitués à partir des archives cumulatives V101, V102, V103, V113 et de l'incrément V114. Les 79 modules historiques `src/alien3-*.js` sont accompagnés de l'adaptateur natif `src/alien3-production-v114.js`.

La couche V105 utilise le fichier corrigé fourni avec V113, `support-v113/alien3-dlc-runtime-v105.patched.js`, dont l'empreinte SHA-256 est `cee35113e227bf1436504436e98eb44794ff735b5eb127a6806fdf1564a3a545`. L'ancien installateur n'est pas exécuté : sa composition de moteur précède les couches natives actuelles.

Le dossier `archives/project-recovery-20261116/fiorina/` conserve :

- les cinq ZIP originaux, sans modification : **116 206 058 octets** ;
- les onze vérifications JSON V104 à V114 ;
- neuf rapports illustrés PDF et neuf rapports HTML V104 à V112 ;
- l'inventaire de provenance et les limites de récupération.

Les 29 preuves externes représentent **157 262 362 octets**. Le manifeste commun admet exactement 42 fichiers, incluant les six fichiers Predator antérieurs préservés à l'octet près. Les archives et preuves restent disponibles dans GitHub ; elles sont exclues de la distribution publique du jeu par le contrôle d'admission existant.

Ces rapports historiques décrivent les versions auxquelles ils se rapportent. Ils ne constituent pas une certification du moteur natif actuel. Les versions intermédiaires conservées dans les ZIP cumulatifs ne sont pas présentées comme des ZIP originaux récupérés. Le corpus séparé de 2 236 livrables n'est pas déclaré entièrement récupéré par ce lot.

## Raccord au moteur

`src/fiorina-campaign-v114.js` définit la campagne et la mission, puis compile le monde d'archive dans la structure de niveau V52 attendue par le moteur. La géométrie déterministe contient **72 nœuds, 119 connexions et 177 plateformes**. Le placement des autres gabarits conserve son comportement précédent.

`src/alien3-production-v114.js` compose les 27 couches V88 à V114 dans leur ordre historique. L'adaptateur est inséré dans `src/game-production-runtime.js` sans remplacer les couches de navigation, de pause, de sauvegarde et de transition du jeu principal. Ses gardes ne s'appliquent que lorsque la campagne Fiorina est active.

La reprise est différée jusqu'à ce que les couches du DLC soient initialisées. L'état spécifique et le montage passent par la sérialisation et la migration de sauvegarde existantes. La sélection du briefing et la continuité du moteur utilisent le même montage.

La campagne principale Fiorina utilise son directeur narratif. Les scénarios locaux de traque/rabattage restent distincts afin d'éviter deux directeurs concurrents. Le basculement vers une campagne ordinaire retire l'état et les gardes propres au DLC.

Les raccourcis de l'archive **C** (codex), **M** (carte) et **I** (utilitaire) utilisent un écouteur nettoyé lors de l'arrêt de la mission. Les touches de déplacement et de pause restent celles du jeu. L'action de tir du mode Fiorina suit les fusées disponibles ; elle ne crée pas de munitions militaires, de balles ni de véhicule.

## Fidélité et portée

L'opération est marquée **partielle** avec `canonExact: false`. Cette intégration rend le contenu récupéré utilisable dans le moteur principal ; elle ne certifie pas une fidélité 1:1 au film.

Les six annexes décrites dans V114 comme salles d'inspection ne sont pas des salles traversables reliées au monde. L'adaptateur les masque dans la campagne native. La morgue reste une proposition provisoire. La géométrie exacte des décors, les annexes traversables et l'animation complète des personnages nécessitent encore du travail.

Le catalogue des personnages a été dédupliqué. Les représentations vectorielles historiques sont utilisées dans cette passe, sans prétendre reproduire exactement les visages et costumes du film. La hache de Dillon reste explicitement un élément de catalogue tant que son rendu effectif n'est pas implémenté.

## Vérification

Contrôles exécutés sur le moteur réellement composé, avec les assets du dépôt :

| Contrôle | Résultat |
| --- | --- |
| `npm run test:fiorina` | 7 tests réussis : catalogue, deux montages, mouvement/pause/codex, restrictions, sauvegarde/migration/reprise, retour à une campagne ordinaire |
| Sauvegarde V143 + opérations V131 | 65 tests réussis |
| Transition dropship V188 | 44 tests réussis |
| Admission et conservation des archives | 8 tests réussis |
| Vérification des empreintes du manifeste | 42 fichiers conformes |
| Contrôle de distribution source | Réussi |
| Build et contrôle de distribution compilée | Réussis : 2 594 fichiers, 911 entrées de cache |

Les tests Node du moteur utilisent un hôte DOM/Canvas de test pour les interfaces du navigateur et les véritables classes du jeu pour la logique. La vérification navigateur complémentaire est fournie par `scripts/qa-fiorina-native-v114.mjs`.

Commandes reproductibles :

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run check
npm run test:project-recovery
npm run test:fiorina
node --test scripts/verify-save-lifecycle-v143.mjs scripts/verify-operations-integration-v131.mjs
npm run build
npm run check:built
```

Les 81 nouveaux modules JavaScript figurent dans le cache hors ligne `sw.js`. Le contrôle du build a vérifié la fermeture des imports et leur présence dans ce cache.

Le workflow `.github/workflows/fiorina-native-v114.yml` reprend ces contrôles pour les modifications du périmètre Fiorina.
