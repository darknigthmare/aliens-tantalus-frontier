# PROMETHEUS — Les questions qui restent

**1.0.0-candidate.1 · première campagne autonome jouable pour le projet Aliens: Tantalus Frontier.**

## Jouer

Ouvrir `JOUER_PROMETHEUS_V1.html` dans un navigateur de bureau. Le HTML contient son code, ses données, ses styles et ses dessins Canvas. Aucune installation de dépendance et aucun téléchargement de texture ne sont nécessaires. Un navigateur qui interdit les fichiers locaux peut servir le dossier avec `python -m http.server 8000`, puis ouvrir `http://localhost:8000/JOUER_PROMETHEUS_V1.html`.

La politique de ce conteneur a refusé la navigation `file://`. La recette a donc injecté ce même HTML dans Chromium avec `set_content`, sans modifier les politiques du navigateur. Le jeu et les fichiers JSON d’import/export ont été testés ; la persistance native de localStorage sur votre navigateur reste à vérifier. Si elle est indisponible, le jeu l’indique et l’export JSON reste disponible.

A/D ou Q/D et flèches : marcher. W/S ou Z/S : profondeur. R maintenu : scanner. E : interaction / porte ; maintien pour une action longue. Espace : esquive. F : lance-flammes de Janek au hangar uniquement. M : carte. J : journal. Échap : pause. F6 : vue latérale / hybride.

Au départ, rejoindre le caisson marqué et maintenir E. La carte et l’indicateur de passage aident à rejoindre l’objectif suivant. Deux difficultés : Expédition et Récit.

## Contenu réel

20 chapitres, 41 objectifs, 29 lieux, 32 connexions, 18 archives, 176 placements de props de 36 familles. Dix lieux SIDE, onze DEPTH, huit HYBRID. Les personnages et décors sont vectoriels, pas des assets réalistes définitifs. La campagne n’est pas une reproduction 1:1 de tous les plans du film. Les dialogues sont originaux et les scènes condensées.

## Installer le launcher dans une copie de Tantalus

L’installation est facultative. Elle ajoute un accès dans Opérations qui ouvre le module autonome dans un nouvel onglet. Elle ne fusionne pas les récompenses, les combats, les inventaires ou les sauvegardes avec le moteur natif.

Garder le pack hors du dossier cible. Node 20 ou supérieur. Commencer sur une copie personnelle du projet :

```sh
node scripts/install.mjs --root="CHEMIN_DU_JEU" --dry-run
node scripts/install.mjs --root="CHEMIN_DU_JEU"
```

Retour arrière :

```sh
node scripts/install.mjs --root="CHEMIN_DU_JEU" --revert --dry-run
node scripts/install.mjs --root="CHEMIN_DU_JEU" --revert
```

L’installateur crée `src/dlc-prometheus/` et ajoute un script dans index.html. Le script de build du dépôt consulté copie déjà `src`. Il ne modifie ni le build ni les données natives. Un journal et l’index d’origine sont conservés dans `.prometheus-v1`. Un index ou un module modifié après installation bloque le retour arrière. Ne pas supprimer le journal avant la désinstallation.

Le dépôt consulté est `darknigthmare/aliens-tantalus-frontier`, commit `496996f5ea557d970ec625aa346876f3eaed1c5f`. La recette de l’installateur utilise une coque de test portant les marqueurs HTML constatés. Le build/check complet du dépôt et son service worker n’ont pas été testés. Aucun fichier distant n’a été écrit et aucun déploiement n’a été effectué.

## Vérifier / reconstruire

```sh
npm run check
python scripts/bundle.py
python tests/browser.py
python tests/additional-captures.py
python scripts/build-docs.py
```

`npm run check` exécute les tests du module, pas les tests globaux de Tantalus. Les scripts navigateur nécessitent Playwright pour Python et Chromium ; ajuster `/usr/bin/chromium` en dehors de cet environnement. Aucun paquet réseau n’est installé automatiquement. Le script `create-content.py` régénère les données ; les sources de rendu et de moteur restent des fichiers indépendants.

## Lire la livraison

`RAPPORT_PROMETHEUS_V1.html` : rapport illustré autonome et portée exacte des tests.
`CODEX_PROMETHEUS_V1.md` : 48 règles, 20 chapitres, 29 fiches de lieu, comportements et limites.
`evidence/` : captures originales, résultats JSON et sauvegardes de scènes issues des parcours automatisés.
`src/dlc-prometheus/` : code et données éditables.

Ce pack est un projet de fan non officiel. Il ne contient pas de scènes vidéo, de dialogue audio ni de musique extraits du film. Aucun droit sur la franchise Prometheus/Alien n’est revendiqué.
