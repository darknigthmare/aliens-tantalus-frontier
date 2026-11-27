# ALIEN 5 — PROJET LAZARE
## V7 · La peau du mensonge · 1.6.0-candidate.1

Campagne fan autonome de Tantalus Frontier. Continuation cumulative de la V6 : 56 lieux, 76 connexions, 12 chapitres, 27 objectifs principaux, trois fins. Ripley, Hicks, Miller, le relais civil de Newt et le P-17 sont conservés. Quatre pièces de recherche et cinq jalons facultatifs introduisent le M-4, trois cellules et une archive nominative.

## Jouer
Ouvrir `ALIEN5_PROJET_LAZARE_JOUER.html` dans un navigateur de bureau. Tous les scripts, styles et données sont inclus, sans téléchargement d’assets ou de sons. Les sources séparées sont sous `game/`. L’exécution locale du document complet a été testée en mémoire dans Chromium ; la navigation `file://` directe était bloquée par une règle administrative de l’environnement de test et n’est pas certifiée ici. Aucun contournement de cette règle n’est inclus.

Déplacement : ZQSD, WASD ou flèches. Maj : marche silencieuse. E : interaction. Espace : tirer. R : recharger. L : torche. T : détecteur. O : signature M-4. B : regrouper. C : ordre de Hicks. X : niche. V : soudure. U : Industrie. K : pince du P-17. Échap : pause. Les menus proposent aussi les commandes tactiles. Le jeu reste défilable sur petit écran, avec les contrôles sous le terrain.

Pour la recherche : après **Analyser la fiche des prélèvements**, la salle des prélèvements donne accès aux matrices (entrée B01). Analysez, calibrez CONTACT BAS / PHASE INVERSE / RETOUR ISOLÉ, puis revêtez le M-4 au berceau. La galerie d’épreuve, son lecteur et l’archive ouvrent des retours. Le détour est facultatif ; le masque n’est pas nécessaire pour terminer la campagne.

Le M-4 n’est pas une armure. Seuls drones et facehuggers peuvent être trompés à distance, pas les cibles qui viennent de voir Ripley. Les équipiers restent exposés. La signature consomme un réservoir et devient instable en mouvement rapide ; deux postes locaux permettent de la rincer. Tirer, allumer la torche, utiliser un leurre ou être blessée la rompt. Les cellules encore fermées se détruisent aux armes ou par la neutralisation centrale. Les individus déjà sortis ne sont pas effacés.

## Sauvegarder / reprendre V1 à V6
Pause → Exporter produit un fichier JSON. Pause → Importer reprend une opération V1 à V7. La clé V7 est `atf.alien5.lazare.v7` ; les anciennes clés ne sont pas réécrites. Gardez le JSON pour transporter une partie entre fichiers ou sites. Le refus de stockage est affiché. La persistance après fermeture du navigateur n’est pas certifiée par les tests avec substitut mémoire.

## Sources et tests
Node 20+ et Python 3 sont utilisés par les scripts fournis. La reconstruction du HTML ne demande que Python standard :

```sh
python tools/build_standalone.py
npm test
npm run test:campaign
```

Les captures et essais navigateur demandent le module Python Playwright et Chromium ; `CHROMIUM_PATH` permet de choisir l’exécutable. Les docs utilisent Pillow et BeautifulSoup pour les vérifications.

```sh
python tools/run_browser_v7.py
python tools/build_docs_v7.py
python tools/verify_docs_v7.py
python tools/check_doc_layout_v7.py
python tools/package_v7.py
```

Les fixtures historiques des versions précédentes servent uniquement aux migrations ; les rapports portant V7 concernent le runtime cumulatif courant. Les tests unitaires préparent des états isolés. Les parcours complets utilisent des entrées ordinaires, des ennemis actifs et des ressources finies, mais connaissent positions et solutions. Le trajet furtif reprend un checkpoint obtenu par le pilote. Les captures de l’atlas ne sont pas une partie humaine.

## Documentation
`RAPPORT_VISUEL.html` : bilan courant, captures et limites. `CODEX_ALIEN5.html` : 100 règles et 56 fiches de lieux. `docs/rules-v7.json` : règles éditables utilisées pour générer la documentation. `qa/` : rapports JSON, snapshots et captures. Les 441 objets décoratifs et 68 obstacles statiques sont des placements réutilisant des formes, pas des assets uniques.

## Lanceur facultatif — pas une intégration native
Le script `integration/install.mjs` ajoute ou met à jour uniquement sa page et son bouton dans une copie locale compatible de Tantalus. Commencez par `--check`. Une modification tierce du menu ou des fichiers du DLC provoque un refus plutôt qu’un écrasement.

```sh
node integration/install.mjs --check "CHEMIN/DU/PROJET_TANTALUS"
node integration/install.mjs --apply "CHEMIN/DU/PROJET_TANTALUS"
# uniquement pour son installation déjà présente et intacte :
node integration/install.mjs --upgrade "CHEMIN/DU/PROJET_TANTALUS"
```

Ce paquet n’a pas été poussé sur GitHub ni déployé sur Vercel. Aucun moteur natif, registre MIRE ou sauvegarde globale n’est fusionné. Les essais du lanceur utilisent des dossiers jetables.

## Provenance / limites
Les références artistiques et entretiens sont hérités de la V1, sans nouvelle consultation revendiquée. Aucun scénario intégral authentifié de Blomkamp n’a été obtenu. Calder, Lazare, les personnages civils, les nouveaux lieux, les fonctions du M-4 et les dialogues sont des créations du jeu, non des révélations sur le film abandonné. Les rendus vectoriels stylisés ne sont pas des artworks officiels ni une restitution 1:1. Pas de partie humaine complète, de certification d’équilibrage ou de test physique de manette ; les ressources finales restent généreuses.
