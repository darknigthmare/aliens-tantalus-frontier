# PROMETHEUS — Les questions qui restent
## V5 · Les traces que l’on rapporte

**5.0.0-candidate.1 · livraison locale du 29 septembre 2026.**

Cette archive est le module Prometheus complet, pas le jeu Tantalus complet. Elle poursuit réellement la V4 extraite de l’archive SHA-256 `468d0387b9014b5bd813a870c530690120f7c73ff91a5609dbfb6beb529521b8`. Aucun push GitHub ni déploiement Vercel n’est effectué.

## Jouer

Ouvrir **JOUER_PROMETHEUS_V5.html** dans un navigateur de bureau. Le code et les visuels sont inclus ; aucun téléchargement d’assets n’est nécessaire. Les sources modulaires sont sous `src/dlc-prometheus`. Les graphismes restent vectoriels provisoires, pas des assets finaux ni une reproduction 1:1 du film.

**U** : registre des prélèvements. **R maintenu** : repérer une capsule. **E maintenu** : sceller. **E**, une nouvelle fois : prendre. **Y** : déposer sur le terrain. **N** : commander le hayon près de l’arrière du RT01 arrêté. **E** au rack : transférer les capsules avec les boutons du menu local. **V** : véhicule ; hayon fermé, capsule arrimée ou déposée avant embarquement.

Q/D ou A/D : déplacement ; W/S ou Z/S : profondeur / échelle. Espace : esquive sans capsule / frein RT01. T : PUP. G : Holloway. C : discrétion / relâcher l’enrouleur. B : cloison. X : balise. I : instruments. K : sac / étude. L : torche. M : carte. J : journal. F6 : présentation. Échap : pause. Les commandes tactiles héritées peuvent ouvrir les menus de la nouvelle chaîne via E ou pause, mais la campagne tactile intégrale n’est pas qualifiée.

## Nouveaux systèmes

Trois échantillons originaux de cette adaptation : B01 dans l’alcôve basaltique, G02 dans la galerie latérale et R03 dans la chambre des résonances. Leur provenance exige 2,4 secondes de scanner, leur scellé 2,2 secondes de maintien. Un seul au harnais, vitesse de marche ×0,8 et pas d’esquive. Le harnais laisse l’échelle utilisable. Le dépôt dans la gaine du puits est refusé : rejoindre une pièce desservie.

Le RT01 dispose de deux berceaux de chargement. Son hayon change visiblement d’angle en 1,2 seconde. Il doit être complètement ouvert pour transférer, puis fermé pour conduire. Chaque objet conserve une seule localisation. Le coffre ne livre rien automatiquement au laboratoire.

La nouvelle salle de caractérisation relie **laboratoire et vestiaire sur le même pont**. Réception à gauche, chambre au centre, terminal et casier à droite. Rétablir l’alimentation auxiliaire dans l’atelier (diagnostic puis disjoncteur) avant de lancer une analyse. Consigner la capsule à la réception, puis E au terminal pour la sélectionner. Le cycle dure 3 + 5 + 2 secondes, continue en simulation si Shaw quitte la salle, et se suspend dans les menus/transitions. U reste consultatif.

Les trois résultats séparent observation et limite ; les courbes sont fictives. Une transmission locale réunit les mesures sans modifier le scénario principal ou donner de ressources natives Tantalus. Le retrait du RT01 perd son chargement oublié ; l’impact annule les opérations inachevées et perd les capsules à bord. Les mesures déjà archivées restent consultables.

20 chapitres, 41 objectifs principaux, 38 salles, 47 connexions, 42 documents, 397 placements de 69 familles statiques. Les 15 réserves, six actions auxiliaires V3, neuf cloisons, douze couverts et dix volumes PUP restent présents.

## Sauvegarde

Clé V5 : `atf.mire.prometheus.v5`, séparée des précédentes. Le menu de pause exporte un vrai fichier JSON. L’import accepte les schémas V1 à V5, limite le fichier à 2 Mo, demande confirmation, vérifie les invariants et reprend en pause. Une V4 conserve ses réserves, véhicules, PUP, escorte, câble, cabine, portes et perceptions, mais ne reçoit aucun résultat scientifique inventé. Une V1 ne peut apporter un historique qu’elle n’enregistrait pas.

La recette du navigateur utilise `set_content` : la navigation `file://` a été essayée et refusée par la politique de l’environnement. Aucun réglage de sécurité n’a été modifié et aucun mock de stockage n’a été utilisé. **La persistance native localStorage n’est donc pas qualifiée.** Le refus est affiché. Les exports/imports par véritables fichiers ont été testés, dont le hayon et la machine en cours de cycle.

## Installer le lanceur Opérations — facultatif

Node 20 minimum. Faire une copie personnelle du jeu. Conserver ce pack hors du dossier cible.

```sh
node scripts/install.mjs --root="CHEMIN_DE_LA_COPIE_DU_JEU" --dry-run
node scripts/install.mjs --root="CHEMIN_DE_LA_COPIE_DU_JEU"
node scripts/install.mjs --root="CHEMIN_DE_LA_COPIE_DU_JEU" --revert --dry-run
node scripts/install.mjs --root="CHEMIN_DE_LA_COPIE_DU_JEU" --revert
```

L’installateur ajoute 17 fichiers sources et un lanceur dans Opérations. Il refuse un dossier existant, un marqueur ambigu ou un chemin symbolique. Le retour arrière contrôle les empreintes et refuse de supprimer un fichier modifié depuis l’installation. Cette recette utilise une coque de test, pas le moteur natif complet. L’inventaire et les récompenses Tantalus ne sont pas fusionnés.

**Ancien module déjà présent :** exporter d’abord sa progression, puis utiliser l’installateur de cette ancienne version pour la retirer sur une copie du jeu. La V5 ne l’écrase jamais automatiquement. Une autre possibilité consiste à utiliser le HTML autonome séparé.

## Reproduire les contrôles

```sh
npm run build
npm run check
npm run qa:browser
python3 scripts/build-docs.py
python3 scripts/package.py
```

Les tests du modèle et de l’installateur utilisent Node sans dépendances NPM. La construction HTML utilise Python 3. Le rapport et les captures demandent Pillow, Playwright pour Python et Chromium ; adapter `CHROMIUM_PATH` si nécessaire. Les snapshots de test sont préparés et étiquetés ; les campagnes continues n’injectent ni position ni ressources. Les puzzles hérités utilisent leur API de résolution. Les résultats navigateur et modèles restent séparés.

`package.py` refuse des tests en échec ou un HTML différent de celui vérifié au navigateur, reconstruit le bundle, crée le manifeste et l’archive, extrait dans un dossier vierge puis relance le modèle et l’installateur. Les anciens scripts de patch conservés dans l’historique ne doivent pas être rejoués sur cette version.

## Limites

Rendu vectoriel provisoire ; pas de graphismes photoréalistes, plans du film 1:1, coopération, vol libre, verticalité universelle ou cinématiques complètes. Les interprétations des prélèvements sont fictionnelles. Manette, Safari/iOS, campagne tactile ou humaine intégrale au clavier non qualifiés. Aucun check/build Tantalus natif ni publication distante. Le commit hérité dans les métadonnées n’a pas été relu dans cette passe.
