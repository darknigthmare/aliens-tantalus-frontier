# ALIEN 5 — PROJET LAZARE
## V4 · Derrière les cloisons · 1.3.0-candidate.1
Livraison locale du 29 septembre 2026. Campagne autonome non officielle. Le scénario de Calder est original ; aucun scénario intégral authentifié de Neill Blomkamp n’est présenté comme retrouvé.

## Jouer
Décompresser le paquet puis ouvrir **ALIEN5_PROJET_LAZARE_JOUER.html** dans un navigateur de bureau récent. Aucun serveur, compte, téléchargement ou dépendance réseau n’est requis par ce fichier. Le jeu est un prototype Canvas vectoriel, pas un moteur natif Unreal ni une finition commerciale photoréaliste.

Une politique de navigateur ou un aperçu de messagerie peut bloquer JavaScript ou le stockage. Ouvrir le fichier enregistré dans un véritable navigateur. Le stockage dépend de ses autorisations ; utiliser **Pause → Exporter** pour conserver une copie transportable. Le refus de stockage est affiché et ne bloque pas le jeu.

## Cette continuation
Les 42 lieux, 56 connexions réciproques, 12 chapitres, 27 objectifs, 3 services facultatifs et 3 dénouements restent présents. Aucun ennemi n’est ajouté aux 26 individus persistants.

- 8 cloisons : fermeture partagée, soudure unique, découpe et rupture. Les boîtiers s’utilisent à proximité. Une réparation infinie par ouverture/fermeture est impossible.
- 8 niches : dissimulation de Ripley, mais pas des équipiers. La torche et le détecteur sont abaissés ; mouvement, tir, blessure et inspection rapprochée révèlent la position.
- 39 portes éligibles à la poursuite de drones ou facehuggers déjà présents. Même identifiant, santé conservée, délai au seuil. Ascenseurs, escaliers et pièces protégées exclus.
- Les six familles annoncent leurs attaques sur une cible et une position acquises. Une cible qui sort de la marque peut éviter la frappe. La reine exige toujours la résolution environnementale.
- Effets et ambiance synthétiques facultatifs, désactivés par défaut. Volume dans Pause. Pas de voix ou musique officielle ni de connexion externe.

## Commandes
Déplacement : ZQSD, WASD ou flèches. E : interaction / annuler le travail. Espace ou clic maintenu : tirer. R : recharger. 1/2 : fusil / incinérateur. Majuscule : marche discrète. H : soin. F : leurre. C : ordre de Hicks. G : transférer des cartouches. B : regroupement silencieux. L : torche. T : détecteur, après récupération des outils. **X : niche proche / sortir. V : renforcer un joint fermé à proximité**, avec le découpeur.

Tabulation ouvre la carte, J le journal, Échap la pause. Les menus Équipe, Matériel et Tactique donnent aussi accès aux commandes avec souris ou tactile. Les commandes tactiles sont sous l’image. Une manette dispose des commandes de base héritées ; pas de certification matérielle complète de son mapping.

Fermer une porte ne déclenche pas le passage : retourner au seuil et utiliser E. Un joint soudé se découpe depuis son boîtier des deux côtés ; le joint ne peut être renforcé qu’une fois. Une niche n’est pas sûre si un ennemi vous a vue entrer. Couvrir ou Attendre laisse Hicks à sa position ; Suivre en silence le déplace sans tirer.

## Reprendre les V1–V3
Exporter la sauvegarde JSON dans l’ancienne version, puis utiliser **Pause → Importer** ici. La V4 utilise `atf.alien5.lazare.v4`. Elle détecte les clés V3/V2/V1 lorsqu’aucune V4 n’est disponible, sans les réécrire. Les quatre formats sont validés. Une libération de Miller sans évacuation en V2/V3 ne reçoit pas un sauvetage gratuit à l’import. La V1 conserve le résultat narratif qu’elle avait déjà accordé.

## Fichiers utiles
`CODEX_ALIEN5.html` : 46 règles et 42 fiches, avec captures embarquées, coordonnées, obstacles, accès, dispositifs, dossiers, doctrine tactique et provenance.
`RAPPORT_VISUEL.html` : nouveautés, scènes testées, 42 lieux, comptages, preuves et limites.
`game/` : modules et données séparés. `qa/` : résultats JSON, sauvegardes de test et captures. `tests/` : fixtures et scénarios. `docs/` : registres de contenu.

## Reproduire la vérification
Le jeu HTML n’exige pas ces outils. Les scripts de développement nécessitent Node 20+, Python, Playwright avec Chromium, Pillow et BeautifulSoup pour les rapports.

```
npm run build
npm test
npm run test:campaign
npm run test:campaign:survie
npm run test:browser
npm run docs
```

377 contrôles de jeu/interface/installateur/parcours et 24 contrôles de documentation passent dans l’environnement de livraison. Les suites historiques V1/V2/V3 sont identifiées séparément des 50 contrôles isolés de la simulation V4 assemblée. Deux campagnes pilotées par des entrées du moteur terminent les objectifs et services avec les ennemis actifs et sans injection de ressources ou d’invulnérabilité. L’automate connaît les ennemis, les chemins et le puzzle ; son économie de munitions est très généreuse. Ce n’est pas un test humain de difficulté.

La poursuite dispose d’un scénario Chromium séparé : une rencontre initiale est préparée ; le joueur traverse, ferme, soude, rejoint la niche et laisse la même créature rompre la porte via les commandes normales. L’atlas de 42 salles utilise des états préparés avec menaces neutralisées pour examiner le décor. Les campagnes visitent 39 pièces, pas les 42.

Le CLI agent-browser est absent et la navigation HTTP locale a été bloquée par l’environnement. Chromium a exécuté le HTML en mémoire avec Playwright ; aucune politique n’a été changée. Les tests de stockage emploient une Map explicitement substituée et vérifient séparément le refus natif. La persistance native après fermeture du navigateur, l’écoute sur un matériel audio physique et les appareils mobiles réels restent non certifiés.

## Lanceur facultatif dans Tantalus
Uniquement sur une **copie locale** du projet. Pas de fusion native des quêtes, récompenses, inventaires ou du registre MIRE.

```
node integration/install.mjs --check "CHEMIN/DU/PROJET_TANTALUS"
node integration/install.mjs --apply "CHEMIN/DU/PROJET_TANTALUS"
```

Pour une installation reconnue intacte antérieure : `--upgrade`. Le script sauvegarde l’ancienne page et remplace seulement la page autonome du DLC. `--remove` restaure le menu initial si les fichiers protégés n’ont pas changé. Des modifications concurrentes ou fichiers inconnus font refuser l’opération plutôt que les écraser. Les tests utilisent des fixtures jetables, pas le dépôt connecté. Exécuter les vérifications du projet hôte séparément avant toute publication.

## Limites de production
Aucun push GitHub ni déploiement Vercel effectué. Graphisme stylisé et structures modulaires partagées, pas des assets 1:1. Pas de nouveau scénario de film authentifié, de doublage, de cinématiques complètes ou d’alternance de protagoniste. Le transit d’un ennemi abstrait le hors-champ ; il ne simule pas le combat permanent de toutes les pièces. Les contenus Alien et marques demeurent la propriété de leurs ayants droit ; cette étude non officielle n’inclut pas de permission de distribution commerciale.
