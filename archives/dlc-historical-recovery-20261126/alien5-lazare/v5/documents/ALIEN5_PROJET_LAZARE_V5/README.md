# ALIEN 5 — PROJET LAZARE
## V5 · Les voix de Calder — 1.4.0-candidate.1

DLC fan jouable autonome, en français. Cette archive poursuit les systèmes V1 à V4 ; elle ne remplace pas le jeu principal Tantalus et n’intègre pas son moteur natif. Aucun push GitHub ni déploiement Vercel n’a été effectué pour cette livraison.

## Jouer

Décompresser le ZIP puis ouvrir **ALIEN5_PROJET_LAZARE_JOUER.html** dans un navigateur de bureau. Le HTML inclut toutes les données, le code et les dessins du module : pas de dépendance réseau, d’images distantes, de microphone ou de compte utilisateur. Les sons synthétisés sont facultatifs, désactivés par défaut. Les contrôles tactiles sont présents ; le test mobile utilise une taille émulée, pas un téléphone physique.

La compilation séparée est dans `game/`. `python tools/build_standalone.py` reconstruit le HTML autonome. Ne pas modifier seulement le HTML compilé pour maintenir les sources : modifier les fichiers `game/`, puis reconstruire.

## Le relais de Newt

Terminer l’ouverture du refuge des transitaires (quatrième objectif principal). Au refuge, approcher la radio **RELAIS NEWT** puis E, ou utiliser le bouton **Transit → Jouer le relais de Newt**. L’intervention prend 1,1 seconde. Ce relais est facultatif et accessible **avant le lancement de la stérilisation**. Une ancienne sauvegarde déjà en fin de campagne n’est pas renvoyée arbitrairement en arrière : reprendre un enregistrement antérieur ou une nouvelle opération pour explorer le transit.

Newt est non armée et ne peut parcourir que le refuge et les six lieux civils. Ripley conserve au refuge ses propres ressources et son état de santé. Il faut revenir à cette même radio pour rendre le relais ; changer plusieurs fois ne soigne personne ni ne remplit les réserves.

Les six étapes sont : registre des passagers, filtre scellé, soufflantes, traction, embarquement, puis retour à Ripley. Dans la traction, deux départs doivent être alimentés : **VENTILATION et QUAI** ; **ATELIER doit rester isolé**. Une erreur reste corrigeable sans consommer un objet unique.

Lena Vos est au magasin des filtres. Sana Kessler et Ivo Delmas attendent dans la zone médicale. E à proximité établit le contact et les place en suivi. B regroupe les personnes recrutées présentes ; le menu Transit permet de leur demander d’attendre. Ivo est blessé et marche plus lentement. À zéro santé, un civil est au sol ; E à portée peut le relever avec un soin.

Le convoi ne sauve pas des personnes à distance. Elles doivent être recrutées, debout, dans la pièce et assez près du dispositif d’embarquement. La commande prend trois secondes. Si quelqu’un manque, une confirmation explicite permet de partir partiellement ; ce départ est définitif. Une rame vide ne peut pas partir. Les trois fins principales reprennent les noms réellement embarqués.

## Commandes

| Action | Ripley | Newt |
|---|---|---|
| Déplacement | ZQSD, WASD ou flèches | Identique |
| Interagir / interrompre | E | E ; parler, soigner un civil à portée |
| Tir / recharge | Espace ou clic gauche / R | Aucun armement |
| Arme | 1 / 2 | Pas de sélection d’arme |
| Soins personnels | H | H, dans le kit de Newt |
| Leurre | F ; carburant | F ; une des quatre charges |
| Torche | L | L |
| Détecteur | T, après récupération | Reste avec Ripley |
| Regroupement | B ; Hicks discret | B ; civils recrutés et présents |
| Ordre | C ; quatre ordres de Hicks | C ; regroupement |
| Munitions à Hicks | G à portée | Indisponible |
| Niche / sortie | X à portée | Identique |
| Renforcer une cloison | V avec outillage | Pas de découpeur |
| Carte / journal / pause | Tab / J / Échap | Identique |

Sur téléphone, **Tirer devient Leurre**, **Recharger devient Torche** pendant le relais. La carte pose un repère, jamais un déplacement instantané. Les interfaces suspendent le temps et les interventions. Les lieux latéraux ne permettent pas un déplacement en profondeur ; les grandes salles le permettent.

## Sauvegardes

La clé V5 est `atf.alien5.lazare.v5`. Le format JSON **ATF_ALIEN5_LAZARE** accepte les versions 1 à 5. Exporter depuis Pause dans l’ancienne version, puis **Pause → Importer** dans cette version. Les clés V1 à V4 ne sont pas écrasées. Le JSON V5 n’est pas rétrocompatible avec les anciens jeux.

L’import normalise les positions, les ressources, les registres et le rôle actif ; il refuse les états incohérents. Il conserve les départs partiels sans inventer des passagers. Un refus de stockage local est affiché ; l’export JSON reste disponible. La persistance native après fermeture du navigateur n’est pas certifiée dans cet environnement. Le test de stockage utilise un substitut explicite, avec un cas séparé de refus natif.

## Contenu cumulé

48 lieux (19 latéraux et 29 en profondeur), 64 connexions réciproques, 12 chapitres et 27 objectifs principaux. Trois services secondaires antérieurs et un relais civil à six jalons. Trois dénouements principaux enrichis par le sort des trois civils, de Miller et de Hicks. 28 individus ennemis persistants de six familles. Dix niches, huit cloisons, 392 placements décoratifs et 52 emprises solides. Ces nombres ne correspondent pas à autant d’assets uniques.

Le code de V4 reste présent : dissimulation, dégâts d’acide, poursuites limitées, soudure finie, détecteur, caméras, compagnons et résolution environnementale de la reine. Les deux nouvelles créatures du transit ne suivent pas les portes civiles ; elles restent dans leur lieu. Le moteur simule la pièce active et les transits autorisés, pas un univers entièrement actif hors champ.

## Validation

**270 contrôles de cette passe passent** : 77 unités V5, 50 cas de régression V4 exécutés sur la pile complète V5, 20 contrôles du lanceur, quatre parcours et 119 contrôles navigateur. Les contrôles documentaires sont consignés séparément. Les compteurs historiques de V4 ne sont pas réadditionnés.

Deux parcours avec le relais, en Récit et Survie, accomplissent les objectifs, les trois services, l’évacuation des trois civils et de Miller, avec Hicks à bord. Deux autres parcours terminent la campagne sans relais. Le pilote utilise les entrées physiques du moteur, les ressources finies et les ennemis actifs, sans invulnérabilité ni téléportation injectées. Il connaît toutefois les positions et la solution des puzzles. Ce n’est pas une certification d’équilibrage humain ; les réserves finales de la campagne principale restent généreuses.

Les 48 captures de l’atlas sont des scènes préparées pour inspecter la géométrie et les placements. Les 26 captures de l’interface et du jeu indiquent leur provenance dans le rapport. Les captures de groupe et de fin partent de checkpoints de parcours automatisés ; elles ne sont pas présentées comme des parties manuelles.

`agent-browser` n’est pas installé et les ouvertures HTTP locales ont été bloquées. Les tests utilisent Chromium/Playwright `set_content` sur le HTML local possédé, sans modification de politique de navigation. Une exécution groupée a atteint la limite de durée ; les dernières phases ont été relancées séparément. Les rapports retenus indiquent les résultats complets réussis, sans considérer une interruption comme une réussite.

## Reproduire les tests

Node 20 ou supérieur pour le moteur/lanceur ; Python 3 pour la compilation et les documents. Les tests navigateur utilisent Playwright et Chromium. La génération documentaire nécessite Pillow. Aucun de ces outils n’est nécessaire pour simplement ouvrir le HTML de jeu.

```sh
npm test
npm run test:campaign
npm run test:campaign:civil
npm run test:campaign:survie
npm run test:campaign:civil:survie
npm run build
npm run test:browser
npm run docs
```

`qa/summary-v5.json` donne la liste des suites effectivement agrégées. Les fixtures historiques V1 à V4 sont présentes seulement pour contrôler la migration ; elles ne sont pas le jeu courant. Les cas unitaires et captures préparées ont leurs états explicites.

## Lanceur Tantalus facultatif

L’installation ajoute seulement un bouton et une page autonome. Elle ne transforme pas les missions en données natives du moteur hôte. Travailler sur une copie sauvegardée du projet :

```sh
node integration/install.mjs --check "CHEMIN/DU/PROJET_TANTALUS"
node integration/install.mjs --apply "CHEMIN/DU/PROJET_TANTALUS"
```

Si ce lanceur existe déjà, utiliser `--upgrade` au lieu de `--apply`. `--remove` retire une installation reconnue si aucun fichier protégé n’a changé. Les contrôles refusent les liens symboliques, les modifications inattendues et les écritures susceptibles d’écraser un autre DLC. Ils ont été exécutés sur projets minimaux, pas sur la version cumulative effective de Tantalus.

## Documents et provenance

`CODEX_ALIEN5.html` : 64 règles et 48 fiches avec accès, actions, supports, collisions et archives. `RAPPORT_VISUEL.html` : ajouts, captures, résultats, conditions et limites. `docs/CODEX_REGLES_V5.md` et les JSON détaillent les données réutilisables.

Les recherches de production Alien 5 du dossier V1 restent des inspirations. Le scénario intégral authentifié n’a pas été obtenu. Calder, Lazare, les six lieux civils, les dialogues, Lena, Sana et Ivo et leurs mécanismes sont originaux à ce jeu. Aucun nom de caste inventée n’est revendiqué comme une découverte canonique. Le rendu est vectoriel stylisé, pas photoréaliste ni une reproduction 1:1 des artworks. Les voix, cinématiques, finition artistique, tests matériels et fusion native restent à réaliser.
