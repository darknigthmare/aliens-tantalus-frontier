# PROMETHEUS — Les questions qui restent
## V2 · Les chemins de l’expédition
**2.0.0-candidate.1 · livraison locale du module Prometheus, 29 septembre 2026.**

Ouvrir `JOUER_PROMETHEUS_V2.html` avec un navigateur sur ordinateur. Le code, les données et les dessins du jeu sont contenus dans ce HTML. Aucun téléchargement d’asset n’est requis.

Cette archive contient le module autonome complet, ses sources, son codex, ses preuves de test et son rapport illustré. **Ce n’est pas le jeu Tantalus complet, ni une fusion de son moteur natif. Aucun push GitHub ou déploiement Vercel.**

### Nouveautés jouables
Le RT01 possède accélération, freinage, direction en profondeur, châssis, collisions, embarquement, débarquement et stationnement persistants. Il circule entre hangar, rampe, plaine, crête et entrée ; les sas piétons restent interdits au véhicule. La campagne reste terminable à pied.

Un PUP volant suit trois positions par volume dans dix lieux. Les relevés partiels, sa position et son retour par les portes ouvertes sont conservés. Les observations complètes sont consultables dans les instruments.

Holloway suit physiquement Shaw pendant son retour. Il peut attendre, reprendre, se reposer et monter à bord du RT01. Le sas n’est validé que lorsqu’il est réellement arrivé. Ce système ne modifie pas son issue narrative ultérieure.

L’enrouleur remplace l’ancien simple maintien : tirer, stabiliser et relâcher pour limiter la tension. Le câble récupéré et l’état de la commande peuvent être sauvegardés.

La carte locale montre positions et emprises de la pièce ; le réseau global est accessible séparément. Trois lieux et six documents d’adaptation sont ajoutés ; les décors passent de 176 à 303 placements (51 familles statiques, pas 303 sprites uniques).

### Commandes
Q/D ou A/D, flèches : gauche/droite. Z/S ou W/S : profondeur dans les lieux adaptés. E : action ou maintien. R maintenu : scanner à main. Espace : esquive à pied / frein au volant. V : monter/descendre du RT01 arrêté. T : déployer/rappeler le PUP. G : Holloway attend/suit. I : instruments. M : plan local. J : journal. F6 : vue latérale/hybride. Échap : pause. F : lance-flammes uniquement pendant la défense du hangar. Enrouleur : E tirer, gauche/droite stabiliser, C relâcher la commande.

### Progression
La V2 utilise `atf.mire.prometheus.v2` et ne remplace pas la clé V1. Le bouton de reprise V1 apparaît seulement si le navigateur expose cette ancienne sauvegarde sur la même origine et qu’aucune V2 n’existe. Le moyen portable est l’import du fichier JSON V1 depuis le menu. La migration conserve la progression et les ressources, mais n’invente aucun ancien trajet ou relevé PUP. Une escorte V1 en cours reprend à son point d’origine. Le RT01 reprend à son emplacement initial, et est retiré si l’impact a déjà eu lieu.

La position du RT01, les mesures PUP, Holloway et l’enrouleur sont inclus dans l’export V2. L’import vérifie le schéma, les bornes et la cohérence avec les objectifs ; il demande confirmation puis reste en pause. Un refus d’import ne remplace pas la partie en mémoire. L’import ne constitue pas un dispositif anti-triche cryptographique.

Une sauvegarde automatique est tentée toutes les huit secondes et aux transitions significatives. Le navigateur peut interdire le stockage local. **Dans ce cas, le jeu le signale : utiliser l’export JSON. La persistance native localStorage n’a pas pu être qualifiée dans l’environnement de cette livraison.**

### Sources et recette
Node.js 20 ou supérieur, Python 3. Aucun paquet JavaScript externe nécessaire pour les tests du modèle.

```sh
python3 scripts/extend-content-v2.py
npm run build
npm run check
```

La recette navigateur requiert Playwright pour Python et Chromium. Son exécutable est choisi avec `CHROMIUM_PATH` (défaut `/usr/bin/chromium`).

```sh
npm run qa:browser
python3 scripts/build-docs.py
python3 scripts/package.py
```

`tests/browser.py` utilise volontairement `set_content`, l’environnement de livraison bloquant la navigation file/HTTP. Aucune politique de navigation n’a été modifiée. Cela exécute le vrai HTML et ses commandes, mais ne teste ni le serveur HTTP, ni le service worker, ni le stockage natif d’une origine autorisée.

### Raccordement facultatif à Opérations
Conserver le pack **hors** d’une copie du jeu cible. Le raccordement ouvre le module dans un nouvel onglet et ne touche pas à l’inventaire, aux récompenses, au combat ou aux sauvegardes Tantalus.

```sh
node scripts/install.mjs --root="CHEMIN_DU_JEU" --dry-run
node scripts/install.mjs --root="CHEMIN_DU_JEU"
node scripts/install.mjs --root="CHEMIN_DU_JEU" --revert --dry-run
node scripts/install.mjs --root="CHEMIN_DU_JEU" --revert
```

L’installateur refuse un dossier `src/dlc-prometheus` déjà présent. **Il ne met pas silencieusement à niveau une V1 installée.** Conserver les sauvegardes, désinstaller la V1 avec son propre installateur si elle est intacte, puis tester cette V2 sur une copie. Le rollback V2 protège les fichiers modifiés depuis l’installation. Le check/build natif Tantalus n’a pas été exécuté.

### Limites
Rendu vectoriel illustré provisoire : ni photoréalisme ni reproduction 1:1 du film. Les nouveaux locaux et la géométrie sont des adaptations. Ni vol libre, ni coopération, ni verticalité continue, ni jeu de plateforme. Les autres personnages restent majoritairement des rôles narratifs. Les cinématiques sont condensées et aucun doublage n’est livré. Aucune recette de manette matérielle ou Safari/iOS. L’affichage compact a été vérifié, pas une campagne tactile complète.

Le MédPod, les puzzles et les relevés sont des mécanismes fictifs de jeu, pas des instructions scientifiques ou médicales réelles. Le Deacon reste un épilogue sans rencontre de combat.
