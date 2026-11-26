# ALIEN: EARTH — intégration V12

## Provenance et périmètre

Le raccord part de la récupération des PNG dans la PR #78, commit `c3fd0cdc72c58a9a4fd89684c00dc64125cee80d`, dont le parent est `main` au commit `07ee99d56480780044c74d4f1eb11f31b07fef13`.

La base cumulative est `ALIEN_EARTH_DLC_V11_MODULE_COMPLET.zip`, conservée en trois fragments dans `archives/local-recovery-20261125/alien-earth/`, commit `6ed9b9210a097bbdf90ec3a22043a3fe5845e541`. Les fragments ont été contrôlés puis assemblés : **23 895 722 octets**, SHA-256 `c6402939c7e3085609b191848f710cd2efe84c5bfe6547a2cf95ca39494c38f3`.

Les **180 fichiers d'origine** sont repris dans `modules/alien-earth/v12`. Le reçu `modules/alien-earth/RECOVERY_V11.json`, recalculé depuis l'archive vérifiée après l'interruption, énumère leurs chemins, tailles et empreintes. Son SHA-256 est `e19aa945cb860e57503e41e81c019bb91b40e33198042ebec5c3308d387d199d`. L'ancien reçu local perdu avait un autre format ; son ancienne empreinte ne sert pas à valider ce nouveau fichier.

Les sources historiques qui restent inchangées sont vérifiées octet par octet. Les sept sources V11 autorisées à évoluer sont énumérées dans `EARTH_CHANGED_ORIGINALS_V12`. Les journaux et captures V11 restent des sources de provenance, séparément des preuves de la version courante.

La V11 apporte 70 lieux, 102 liaisons réciproques, 958 placements, 49 familles de décor, 331 règles, 25 silhouettes de référence, trois points de vue jouables, 32 tâches principales et 38 tâches annexes. Le moteur Earth reste autonome. Le raccord ne fusionne pas ses règles dans le moteur de campagne Tantalus.

La [bible V12](alien-earth-v12/BIBLE.md), le [registre](alien-earth-v12/manifest.json) et les [références](alien-earth-v12/references.md) distinguent génération, raccordement et contrôle visuel. Les images restent des adaptations avec `exact: false`.

## Parcours du joueur

Le bouton **ALIEN: EARTH** figure dans le menu principal du Tantalus, après ALIENS (1986), et dans son ordre de navigation au clavier et à la manette. Il ouvre `/dlc/alien-earth/v12/index.html`.

Le départ arrête le hub sans persistance, le moteur de mission, les sons et la boucle Forge par `stopBioforgeEngineOnlyV80()`. Cette dernière méthode est nécessaire : `stop({purge:false})` pourrait enregistrer une session Forge chargée. Le garde de déchargement propre à Earth empêche ensuite l'écriture d'un profil natif au seul motif d'avoir ouvert le DLC. Lors d'un retour navigateur qui restaure le document depuis son cache, `pageshow.persisted` réinitialise ce garde avant le redémarrage du scheduler : une partie native ultérieure retrouve ainsi sa sauvegarde de mission et de profil au déchargement.

Earth propose **Retour au Tantalus** au titre et en pause lorsqu'il est servi sous son chemin d'intégration HTTP. Une partie commencée et vivante est enregistrée avant le départ. Si cela échoue, le joueur peut exporter sa progression, rester dans Earth ou quitter explicitement sans enregistrer. Ce dernier choix protège également du handler de fin de page. Une navigation refusée restaure la protection précédente.

Le lien vers le Tantalus est absent lorsque le portable est ouvert comme fichier local.

## Sauvegardes et compatibilité

Le paquet et le titre indiquent `12.0.0`. Le schéma de sauvegarde reste **11**, avec la clé `atf.dlc.alien-earth.s1.profile-1`. Les sauvegardes V11 passent toujours par le validateur et le mécanisme de conflit existants. Aucun profil natif n'est utilisé pour stocker la progression Earth.

Le défaut de visibilité a été reproduit sur la source originale : au titre, `visibilitychange` enregistrait l'état initial et pouvait remplacer la partie existante. La sauvegarde refuse désormais toute écriture avant le début d'une partie (`!started`). Les refus pour état protégé ou personnage mort restent actifs.

Le test `tests/lifecycle-v12.test.mjs` exécute la fonction de sauvegarde et l'abonnement réels avec le vrai moteur et le vrai module de persistance, sous doubles DOM et Storage. Les deux cas de titre échouent sur l'original et passent après correction. Les cas de partie commencée, protégée et morte complètent ce contrôle.

## Rendu et catalogue

`src/alien-earth-raster-v12.js` décrit les images réelles, leurs rectangles source, leurs pivots et les seules affectations admises. Une image absente, en cours de chargement, invalide ou impossible à dessiner laisse le rendu Canvas existant fonctionner.

Les URL sont calculées par rapport au document du DLC. Le portable donne priorité à `globalThis.EARTH_RASTER_INLINE_V12`, rempli avec les mêmes octets PNG. Aucun chemin local de développement n'est nécessaire dans le runtime.

Le renderer redessine les scènes dans sa boucle normale. Les portraits et armes du catalogue sont repeints sur `earth-raster-ready-v12`. Les aperçus de Wendy, Curly et Nibs portent le libellé **Tenue de sauvetage · aperçu** et une pose de catalogue explicite. Cette pose ne modifie ni le chapitre, ni la tenue, ni l'équipement du joueur.

Une pose immobile ne devient pas une animation de marche. Les états incompatibles, les costumes non représentés et les objets sans remplacement conservent leur dessin historique. Les mappings et limites exacts figurent dans les documents V12.

## Construction et admission

`scripts/build-alien-earth-dlc.mjs` suit les imports ES statiques depuis la véritable UI. Il refuse les modules hors liste, les cycles et les formes d'import ou d'export non prises en charge. Le graphe doit comprendre les 23 modules admis.

Le build public contient seulement `index.html`, `earth.css`, le graphe JavaScript et les PNG nommés explicitement. Il exclut archives, documentation, journaux et captures. Le builder normal du dépôt appelle ce constructeur ; le serveur de développement expose le même chemin et la même liste fermée.

La vérification exige tous les fichiers attendus, refuse les ajouts et compare les octets publics à la source. Les liens symboliques de sortie sont refusés avant écriture. La construction ne remplace que le sous-répertoire Earth généré.

```sh
ATF_BUILD_OUTPUT=../earth-public npm run build:dlc:earth
node scripts/build-alien-earth-dlc.mjs --standalone --output=../earth-export/JOUER_ALIEN_EARTH_V12.html
```

Le portable isole la portée de chaque module et relie ses imports nommés. Il embarque scripts, styles et images, et produit les mêmes octets pour les mêmes sources. Les scripts historiques `*_v11.py` restent dans la reprise d'archive ; les commandes V12 ci-dessus sont celles de cette distribution.

Le workflow `alien-earth-dlc.yml` produit également un ZIP du runtime public et conserve le HTML portable comme téléchargement. Les journaux de QA et les téléchargements jouables sont des artifacts distincts.

## Vérification

```sh
npm run test:dlc:earth
node --test scripts/verify-aliens1986-main-succession-v116.mjs scripts/verify-river-of-pain-succession.mjs
python3 -B scripts/qa-alien-earth-integration-v12.py --root ../earth-public --source-root . --output ../earth-evidence --skip-title
```

Les tests d'intégration couvrent le contrôleur réel du titre, le corps réel de son callback et du déchargement, les erreurs de retour, les admissions, les empreintes, les dérivés incomplets ou altérés, les scopes du portable et les liens symboliques. Les reçus exacts des huit fichiers hôte prolongent les endpoints Aliens et Fleuve sans réécrire leurs empreintes historiques ni transférer leurs anciens résultats à Earth.

Le harnais Chromium déclare ses fixtures et ses observations. Il utilise l'UI et les touches pour démarrer, se déplacer, franchir R01–R02 puis revenir, sauvegarder, recharger, exporter et importer. Le calcul de chemin sert à planifier les touches ; il ne déplace pas le personnage. Les vues de rendu préparées par des sauvegardes synthétiques sont signalées séparément du parcours réel.

`--skip-title` teste le DLC seul. Sans ce drapeau, le harnais contrôle aussi l'entrée depuis le vrai menu hôte et le retour, avec conservation des octets des profils natifs. Une racine préparée avec les vrais fichiers source hôte et les ressources qu'ils demandent valide ce parcours servi ; elle ne constitue pas un build de release natif intégral. Les contrôles globaux `check`, `build` et `check:built` restent des gates distincts de la CI existante.

Les résultats courants et leurs conditions sont consignés dans les documents V12. Une commande, un test présent ou un workflow configuré ne constitue pas une preuve d'exécution réussie. Le parcours ciblé ne rejoue pas tous les chapitres ni toutes les branches narratives.
