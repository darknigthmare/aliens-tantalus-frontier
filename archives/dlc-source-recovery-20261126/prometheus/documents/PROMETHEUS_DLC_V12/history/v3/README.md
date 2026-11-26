# PROMETHEUS — Les questions qui restent
## V3 · Les paliers du silence
**3.0.0-candidate.1 · Livraison locale du 29 septembre 2026.**

Ouvrir `JOUER_PROMETHEUS_V3.html` sur un ordinateur. Le code, les données et les dessins du jeu sont incorporés au HTML : aucun téléchargement d’asset n’est nécessaire. Pour les sources servies sur une origine locale, le point d’entrée est `src/dlc-prometheus/index.html`.

Cette archive contient le **module Prometheus autonome mis à jour**, ses sources, son codex, son rapport et ses tests. Elle ne contient pas le jeu Tantalus complet. Le raccordement facultatif à Opérations ouvre le module dans un nouvel onglet : ce n’est pas une fusion du moteur natif, de ses récompenses ou de ses sauvegardes. Aucun push GitHub ni déploiement Vercel.

## Ce qui change
Le **puits de service** possède trois paliers physiques : soute/atelier, équipages et observation. Les hauteurs 0, 170 et 340 sont des unités de jeu, pas des dimensions du film. Les accès utilisent la hauteur des pieds. Une porte de l’étage ne s’ouvre pas depuis le sol.

La **cabine** accélère et transporte réellement Shaw. L’accès reste fermé lorsqu’elle n’est pas au palier. Il faut d’abord réarmer la distribution auxiliaire à l’atelier. L’**échelle fixe** fonctionne même sans courant : W/Z ou haut pour monter, S/bas pour descendre ; A/Q ou D quitte l’échelle seulement au contact d’un palier. Un trajet en cours peut être exporté et repris sans ramener la cabine au sol.

L’**atelier des systèmes** et la **galerie d’observation** s’ajoutent au puits : 35 lieux et 41 connexions. La campagne conserve ses 20 chapitres et ses 41 objectifs principaux. Les trois nouvelles pièces sont des aménagements de cette adaptation, pas des plans authentifiés du tournage.

**Douze réserves limitées** fournissent cartouches d’oxygène, cellules de torche, pansements de terrain et kits RT01. Un contenant ouvert reste visuellement ouvert et ne se recharge pas. Les kits nécessitent le vrai rover arrêté à proximité. Un effet impossible ou une réserve déjà pleine ne consomme pas l’objet.

La **torche** dispose d’un interrupteur et d’une batterie persistante. Le faisceau suit l’orientation. Une lumière résiduelle préserve la lecture lorsque la batterie est vide. Ce rendu directionnel n’est pas une simulation optique avec occultation par les parois.

Une **étude auxiliaire en six étapes** relie atelier, observation, alcôve et galerie latérale. Elle ne remplace pas les objectifs du récit et n’octroie pas de récompense au moteur Tantalus natif. Après l’impact, ses étapes encore dépendantes du Prometheus sont perdues pour cette expédition.

Le RT01 pilotable, le PUP, l’escorte de Holloway, l’enrouleur et les rencontres V2 sont conservés. Le puits est réservé au personnage joueur : les PNJ et le drone n’y acquièrent pas une navigation verticale universelle.

## Commandes
Q/D ou A/D et flèches : marche. Z/S ou W/S : profondeur ; dans le puits, échelle. E : interaction ou maintien. R maintenu : scanner. Espace : esquive à pied ou frein du RT01. V : monter/descendre du rover arrêté. T : déployer/rappeler le PUP. G : Holloway attend/suit. I : instruments. **K : sac et étude auxiliaire. L : torche.** M : plan de la pièce, ou coupe verticale dans le puits. J : journal. F6 : présentation latérale/hybride. Échap : pause.

Lance-flammes : F uniquement lors de la défense du hangar. Enrouleur : maintenir E pour tirer, gauche/droite pour stabiliser, C pour libérer la commande. Les menus suspendent les simulations.

## Découvrir les nouveautés depuis le début
Depuis la coursive des équipages, rejoindre l’accès au puits. Descendre l’échelle au palier bas et entrer dans l’atelier. Examiner le diagnostic, puis maintenir E sur le disjoncteur. Revenir vers la cabine : entrer lorsqu’elle est arrêtée, utiliser E à bord et choisir le palier d’observation. K affiche le prochain lieu de l’étude auxiliaire. La combinaison et le scanner s’obtiennent par la campagne normale.

## Sauvegardes V1, V2 et V3
La V3 utilise `atf.mire.prometheus.v3`, sans effacer les clés antérieures. L’export/import de fichiers JSON est le moyen portable. L’import valide demande confirmation et reprend en pause. Un fichier invalide laisse la partie courante intacte.

Une vraie sauvegarde V2 conserve sa progression, le rover, les relevés PUP, l’escorte et l’enrouleur. Elle ne crée ni ancien stock V3 ni ancienne étude auxiliaire. La torche et la cabine reçoivent un état initial V3 ; cela ne représente pas un historique enregistré par V2. La migration V1 conserve les champs alors disponibles et utilise les règles héritées pour les fonctionnalités apparues en V2.

La V3 sérialise les réserves ouvertes, les stocks et consommations, la batterie, les étapes auxiliaires, la hauteur/vitesse/destination de cabine et le support des pieds. Les quantités sont contrôlées par rapport aux réserves récupérées. Ce contrôle de cohérence n’est pas un dispositif anti-triche cryptographique.

Le navigateur peut interdire le stockage. Le jeu l’annonce et permet d’exporter. **La persistance native localStorage n’est pas qualifiée par cette livraison ; les imports/exports de véritables fichiers JSON ont été testés.**

## Reproduire la recette
Node.js 20 ou supérieur et Python 3. Les tests du modèle n’utilisent aucun paquet npm externe. Les sources livrées font autorité ; aucun ancien script de patch n’est à rejouer.

```sh
npm run build
npm run check
```

Les tests navigateur demandent Playwright pour Python et Chromium (`CHROMIUM_PATH`, défaut `/usr/bin/chromium`). Les rapports emploient Pillow pour incorporer une copie WebP des captures PNG originales.

```sh
npm run qa:browser
python3 scripts/build-docs.py
python3 scripts/package.py
```

Les deux recettes Chromium exécutent le HTML avec `set_content`. La navigation `file://` a été refusée dans l’environnement de livraison ; aucune politique n’a été désactivée. Cette méthode teste l’interface et ses fichiers JSON, pas le serveur HTTP, une origine persistante ou le service worker. Les étapes préparées sont explicitement distinguées du début réellement parcouru au clavier.

`npm run check` comprend les tests ciblés, six campagnes historiques du modèle, deux campagnes complètes avec l’étude auxiliaire et les tests d’installation. Les commandes de mouvement passent par la simulation ; les solutions de puzzles et choix de cabine sont soumis aux commandes publiques du modèle. Ce n’est pas une campagne humaine intégralement jouée au clavier.

## Raccordement facultatif à Opérations
Travailler sur une copie du jeu. Garder le pack hors du dossier cible.

```sh
node scripts/install.mjs --root="CHEMIN_DU_JEU" --dry-run
node scripts/install.mjs --root="CHEMIN_DU_JEU"
node scripts/install.mjs --root="CHEMIN_DU_JEU" --revert --dry-run
node scripts/install.mjs --root="CHEMIN_DU_JEU" --revert
```

L’installateur refuse `src/dlc-prometheus` s’il existe déjà : **pas d’écrasement automatique de V1/V2**. Exporter la sauvegarde, retirer l’ancien raccordement avec son propre installateur si ses fichiers sont intacts, puis installer V3 sur une copie. Les modifications effectuées après l’installation sont protégées lors du retour arrière. La recette porte sur une coque de test, pas le dépôt Tantalus complet. Aucun `check` ou build du moteur natif n’est revendiqué.

## Limites de cette version
Graphismes vectoriels de travail, non photoréalistes, non 1:1. La nouvelle verticalité est réellement continue **dans le puits construit**, pas dans les 35 lieux. Aucun saut de plateforme, vol libre, coopération, doublage ou cinématique intégrale. Les personnages autres que les agents explicitement simulés restent essentiellement narratifs. Pas de recette matérielle manette, Safari/iOS ou campagne tactile complète. Les trois nouveaux locaux et les textes auxiliaires sont propres à cette adaptation. Les instruments et soins sont des mécanismes fictifs, pas des instructions scientifiques ou médicales.

## Provenance
Base locale : `ALIENS_TANTALUS_DLC_PROMETHEUS_V2.zip`, SHA-256 `386b101c3938e08d5c58416535eda65b4fd91e0f62e497691cdcdfcf7c3e4ead`. V1/V2 originales conservées séparément. Le commit Tantalus mentionné dans les données est la référence héritée de V1, pas un dépôt relu ou modifié pour V3.
