# ALIEN 5 — PROJET LAZARE
## V8 · Personne derrière la rampe

Version **1.7.0-candidate.1** — continuation cumulative locale de la V7.

## Jouer

Ouvrir `ALIEN5_PROJET_LAZARE_JOUER.html` dans un navigateur récent. Sous Windows, `JOUER_WINDOWS.bat` ouvre ce fichier. Le jeu autonome ne requiert aucune bibliothèque externe ni téléchargement d’images. Le dossier `game/` contient les sources séparées.

Le mode tactile conserve ses boutons sous le terrain. La page peut défiler verticalement sur un petit écran. Le plein écran n’est pas nécessaire. L’audio est facultatif, désactivé par défaut.

## Ce qui change

Le hangar existant contient quatre postes de vol. Après la rupture du bras d’amarrage, isoler le circuit, lancer l’égalisation de douze secondes et traiter l’ampoule conservée. La copie du journal dans la boîte noire reste facultative. La rampe prend quatre secondes à fermer et contrôle de nouveau la présence réelle de Hicks. L’absence d’une personne libérée mais non évacuée exige confirmation, jamais une déclaration automatique de décès.

Une scène de départ de sept secondes peut être passée ou revue. Le bilan peut être exporté en HTML ou en JSON : ce sont des rapports, distincts de la sauvegarde du jeu.

56 lieux, 76 connexions, 34 individus ennemis et 27 objectifs principaux sont conservés, avec les branches Newt, P-17 et M-4. Aucune nouvelle salle ou caste n’est ajoutée dans cette passe.

## Reprendre une partie

Exporter le JSON de la version précédente, puis utiliser **Pause → Importer**. Les formats V1 à V8 sont acceptés. Les clés antérieures ne sont pas modifiées. Une fin ancienne reste un résultat historique ; une partie encore en cours doit accomplir le nouveau protocole final.

**Sauvegardes** au titre, ou **Emplacements et secours** dans Pause, affiche l’automatique, son secours et trois emplacements manuels. Écraser un emplacement ou charger une autre partie demande confirmation. Exporter avant de changer d’origine, de fichier ou de navigateur reste prudent.

La lecture et l’écriture sont validées, mais plusieurs clés de stockage ne constituent pas une transaction atomique globale. Un quota plein, une politique privée ou le nettoyage du navigateur peut empêcher la conservation. Le jeu en mémoire reste exportable. La vraie conservation après fermeture n’a pas été certifiée dans l’environnement de production de cette livraison.

## Commandes

Déplacement : flèches, ZQSD ou WASD. `E` : agir/interrompre. Les menus Matériel, Équipe, Tactique, Transit, Industrie et Lazare donnent également accès aux systèmes précédents. **Départ et manifeste** commande les postes disponibles à proximité ; les boutons hors portée sont désactivés. Aucun menu ne téléporte un personnage.

## Sources et vérifications

`RAPPORT_VISUEL.html` décrit les ajouts et les essais ; `CODEX_ALIEN5.html` contient 112 règles et 56 fiches illustrées. `qa/captures-v8.json` distingue les exports du pilote, les états préparés et la cinématique. Les 56 vues d’atlas sont toutes préparées.

La livraison exécute 433 contrôles de jeu, d’interface, d’installation et de parcours. Les quatre pilotes de campagne connaissent les cartes, les ennemis et les solutions. Ils n’injectent ni invulnérabilité, ni ressources, ni objectifs. Les réserves finales restent généreuses ; aucun équilibrage humain complet n’est certifié.

Les tests Chromium utilisent le document en mémoire, après un refus réel de navigation HTTP locale par la politique de l’environnement. La mémoire de stockage et l’horloge des scénarios contrôlés sont explicitement substituées. Le refus natif est testé séparément. Cela ne certifie ni les performances ni la persistance native.

## Reconstruire et relancer

Le jeu se reconstruit avec Python, sans autre dépendance :

```text
python tools/build_standalone.py
npm test
npm run test:campaign
```

Les outils de documentation nécessitent Python, Pillow et BeautifulSoup ; les essais navigateur nécessitent Playwright et un exécutable Chromium. Le chemin de Chromium peut être indiqué dans `CHROMIUM_PATH` pour les vérifications de documentation ; le harnais du jeu livré utilise `/usr/bin/chromium`, chemin réellement testé ici.

```text
python tools/build_docs_v8.py
python tools/verify_docs_v8.py
python tools/check_doc_layout_v8.py
python tools/run_browser_v8.py
python tools/package_v8.py
```

Les fixtures anciennes dans `qa/` servent aux migrations. Les fichiers `v8full_*.json` sont des enregistrements obtenus par le pilote automatisé, pas des sauvegardes personnelles. Les tests sont séparés du runtime normal ; aucune API de test n’est activée par défaut.

## Lanceur Tantalus facultatif

Sur une copie locale du projet, `node integration/install.mjs --check "CHEMIN"` contrôle la structure. `--apply` ajoute uniquement sa page et son bouton ; `--upgrade` remplace sa page si elle n’a pas été modifiée ; `--remove` restaure le menu seulement si le contrat enregistré est toujours intact. L’installateur refuse les modifications ambiguës et les liens symboliques.

Ce lanceur n’est pas une fusion avec le moteur natif, MIRE ou les sauvegardes globales. Les vingt tests d’installation emploient des dossiers jetables. Aucun push GitHub ni déploiement Vercel n’a été exécuté.

## Statut artistique et narratif

Fan game non officiel, au rendu vectoriel stylisé. Les stations, la scène de départ, les dialogues et les raccords narratifs sont originaux. Les références antérieures restent créditées dans le codex, sans scénario intégral nouvellement authentifié ni restitution 1:1 des concepts. Voir `LICENSE_NOTICE.md`.
