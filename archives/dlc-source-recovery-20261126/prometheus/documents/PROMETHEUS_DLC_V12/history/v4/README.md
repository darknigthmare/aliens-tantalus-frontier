# PROMETHEUS — Les questions qui restent
## V4 · Le poids du silence

**4.0.0-candidate.1 — livraison locale du 29 septembre 2026.**

Cette archive contient le module Prometheus autonome mis à jour depuis V3 : sources, HTML autonome, codex, rapport illustré et recettes reproductibles. Elle ne contient pas le Tantalus principal complet et ne fusionne pas ses sauvegardes, récompenses ou systèmes natifs. Aucun push GitHub ni déploiement Vercel.

## Jouer

Ouvrir `JOUER_PROMETHEUS_V4.html` sur un ordinateur. Le fichier contient son JavaScript, ses styles et ses dessins vectoriels, sans dépendance à un CDN. Lancer depuis le menu. L’export JSON dans le menu de pause permet de conserver la progression indépendamment du stockage local.

Le stockage local peut être refusé selon le navigateur ou l’origine du fichier ; le jeu l’annonce. Dans l’environnement de livraison, HTTP a été refusé et localStorage était indisponible sur l’origine opaque utilisée par la recette `set_content`. Les exports/imports JSON ont été réellement exécutés. Aucune recette HTTP ou de persistance native n’est revendiquée.

## Commandes

| Commande | Action |
|---|---|
| A/D, Q/D, flèches | Déplacement horizontal |
| W/S, Z/S | Profondeur ; échelle dans le puits |
| E | Interaction ; maintien pour action longue |
| R maintenu | Scanner, relevés |
| C maintenu | Marche discrète ; libère d’abord la commande de l’enrouleur si active |
| B | Actionner la cloison réellement proche |
| X | Déposer une balise disponible, une seule active |
| Espace | Esquive ; frein du RT01 |
| V, T, G | RT01, PUP, ordre à Holloway |
| L | Torche |
| K, I, M, J | Sac/étude, instruments, carte, journal |
| F6 | Vue hybride / classique |
| Échap | Pause |
| F | Lance-flammes pendant la défense du hangar uniquement |

Le mode classique projette la profondeur ; il n’impose pas les mêmes contournements que le mode hybride. Le puits conserve ses supports physiques dans les deux modes.

## Ce que V4 change

37 lieux, 45 connexions, 36 documents originaux, 376 placements / 62 familles statiques. Le socle reste à 20 chapitres et 41 objectifs principaux. Les six étapes auxiliaires V3, le RT01, le PUP, l’escorte, le câble, le puits et les stocks sont conservés.

Deux détours : local des filtres entre laboratoire et sas ; chambre des résonances entre galerie latérale et chambre de la tête. Douze couverts possèdent une géométrie explicite, utilisée pour les collisions et la visibilité. La torche effectue une occultation **2D dans le plan écran**, sur ces couverts et les cloisons fermées seulement ; pas une simulation volumétrique de toute la scène.

Neuf cloisons : B près du panneau lance un cycle de 1,2 ou 1,8 seconde. Rester proche. Devant un vantail fermé, E lance d’abord l’ouverture ; presser E à nouveau une fois ouvert pour passer. Les verrous du récit sont conservés. L’Ingénieur doit rejoindre le seuil et infliger de vrais dommages ; un vantail intact cède en cinq secondes de coups. Ouvrir et refermer ne le répare pas.

La marche discrète diminue vitesse et bruit. Les perceptions gardent un dernier point connu ; les signaux traversent au maximum deux liaisons, atténués par les cloisons. Une balise n’est pas un arrêt garanti de la menace : un joueur visible peut reprendre sa priorité. Six balises finies se trouvent dans trois caches. X les pose devant les pieds pour 18 secondes ; un dépôt obstrué ne consomme rien.

La filtration demande quatre secondes de maintien E à la commande avec une exposition résiduelle ; elle retire au plus 55 points d’exposition locale. Elle ne guérit pas Holloway et ne change aucune issue narrative. Le relevé de résonances prend trois secondes de R et s’enregistre une fois dans les instruments. Ce sont des mécaniques fictives, pas des procédures réelles.

## Sauvegardes V1 / V2 / V3

Exporter depuis l’ancienne version puis importer le JSON via le menu V4. Le jeu vérifie le contenu, demande confirmation, puis reprend en pause. Une erreur d’import laisse la partie courante intacte. La clé `atf.mire.prometheus.v4` n’efface pas les anciennes clés.

La migration conserve ce qui était enregistré, sans créer de balises, de résultats ou de consommation antérieurs. Si une ancienne pose V3 tombe dans un des nouveaux couverts, elle est déplacée vers le bord libre le plus proche ; ses ressources et objectifs restent conservés. Une sauvegarde V4 incohérente dans un obstacle est refusée. Aucun système de signature antitriche n’est revendiqué.

Les portes, leur intégrité, leur cycle, la balise et ses signaux, la dernière perception, la filtration et l’écho sont sérialisés. Les touches maintenues et les fondus d’interface ne le sont pas. L’export/import d’une cloison en mouvement est éprouvé dans Chromium avec un véritable fichier JSON.

## Reproduire la livraison

Node 20 ou supérieur et Python 3. Le module n’a pas de dépendance npm à installer.

```sh
npm run build
npm run check
npm run qa:browser
python3 scripts/build-docs.py
python3 scripts/package.py
```

Les tests navigateur demandent Playwright pour Python et Chromium (`CHROMIUM_PATH`, défaut `/usr/bin/chromium`). Les rapports demandent Pillow. Le CLI agent-browser était absent dans l’environnement : la recette utilise Playwright sans modifier les politiques du navigateur.

`npm run check` exécute les suites ciblées, six campagnes historiques du modèle, deux campagnes avec étude/lift V3, deux campagnes avec détour V4 et les tests de l’installateur. Aucun parcours ne réassigne ses positions, santé ou drapeaux de progression en cours de route. Les solutions de puzzles sont soumises à l’API publique du jeu. Les tests ciblés et les recettes navigateur peuvent, eux, préparer explicitement des scènes ; leurs preuves sont étiquetées.

Le rapport sépare ces campagnes des tests clavier et souris. Il ne certifie pas dix parties humaines intégrales. Les suites Chromium doivent partager le SHA-256 du HTML avant l’empaquetage. Le script de paquet extrait le ZIP, vérifie ses empreintes et relance `npm run check` dans la copie extraite.

## Raccordement Opérations facultatif

Conserver ce pack hors de la cible et travailler sur une copie du jeu.

```sh
node scripts/install.mjs --root="CHEMIN_DU_JEU" --dry-run
node scripts/install.mjs --root="CHEMIN_DU_JEU"
node scripts/install.mjs --root="CHEMIN_DU_JEU" --revert --dry-run
node scripts/install.mjs --root="CHEMIN_DU_JEU" --revert
```

L’installateur ajoute seulement les sources du module et un lanceur dans Opérations. Il refuse tout `src/dlc-prometheus` existant : pas d’écrasement automatique V1/V2/V3. Exporter la sauvegarde, retirer l’ancienne installation avec son propre installateur si ses fichiers sont intacts, puis installer V4 sur une copie. Le retour arrière refuse d’effacer les modifications ultérieures. Les onze contrôles utilisent une structure de test, pas un build/check natif Tantalus.

## Limites

Graphismes vectoriels de travail, non photoréalistes et non 1:1 au film. Pas de coopération, vol libre, cinématiques intégrales, doublage ou verticalité universelle. La navigation des compagnons ne s’étend pas au puits. Pas de recette matérielle manette, Safari/iOS ou campagne tactile complète. Les deux lieux et les six documents V4 sont des créations de l’adaptation, pas des relevés authentifiés du tournage.

## Provenance

Base locale : `ALIENS_TANTALUS_DLC_PROMETHEUS_V3.zip`, SHA-256 `3072bd7fdd6d07061fb3e223cf0b425b7003c3a93cee0eff3d1afeac5f2f9a4d`. Les instantanés V1/V2/V3 nécessaires aux tests sont sous `history/`. Le commit Tantalus conservé dans les métadonnées est une référence historique, pas un dépôt relu ou modifié pour V4. Les références externes des anciennes versions n’ont pas été revérifiées pour cette passe de code. Les anciens scripts de patch sont archivés et ne doivent pas être rejoués.
