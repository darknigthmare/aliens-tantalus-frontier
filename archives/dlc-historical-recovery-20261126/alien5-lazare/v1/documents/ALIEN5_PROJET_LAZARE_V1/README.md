# ALIEN 5 — PROJET LAZARE
## 1.0.0-candidate.1 · campagne autonome pour Tantalus Frontier / MIRE

**État livré : prototype jouable à campagne complète dans ses données et sa progression, pas une version finale de production.** C’est une interprétation non officielle du projet abandonné de Neill Blomkamp. « Projet Lazare », Calder, les dialogues et les dénouements sont originaux à ce jeu. Aucun scénario intégral authentifié n’a été obtenu. Aucune reproduction exacte d’un film inexistant n’est revendiquée.

### Jouer
Ouvrir `ALIEN5_PROJET_LAZARE_JOUER.html` dans un navigateur récent, après extraction du ZIP. Tout le code et les visuels sont intégrés : pas de bibliothèque externe ni de téléchargement d’assets. Le dossier `game/` contient les mêmes sources séparées. La sauvegarde utilise uniquement `atf.alien5.lazare.v1`. Si le navigateur refuse le stockage local, utiliser **Pause → Exporter la sauvegarde** puis **Dossier de mission → Importer une sauvegarde**.

Déplacement : ZQSD, WASD ou flèches. E : agir / changer de pièce à une porte. Espace : tirer. 1/2 : fusil / incinérateur. R : recharger. H : soin. Maj : marche silencieuse. F : leurre acoustique, qui consomme du carburant. Tab : carte. J : journal. Échap : pause. Les ennemis et les tirs ont une profondeur : il faut s’aligner. Le rang « Récit » réduit les dégâts et augmente le temps d’évacuation.

### Ce qui est réellement présent
12 chapitres, 36 lieux, 47 connexions réciproques, 27 objectifs ordonnés, 36 dossiers, 6 types de menaces et 23 individus persistants. Six secteurs reliés par des portes, un escalier et des ascenseurs à destinations fixes. Les grands espaces autorisent le déplacement en profondeur ; les couloirs restent latéraux. 260 instances de décors programmatiques, avec des fonctions distinctes, sans peinture unique servant de faux niveau.

Fusil, flamme, rechargement, soins, discrétion, leurre, collisions et obstacles opaques. Recherche visuelle / sonore, préparation d’attaque, recul face au feu, réserve d’ennemis finie, sang acide persistant. Le spécimen à quatre bras peut être vaincu au combat ou neutralisé par une purge de sa cellule : aucune munition obligatoire pour cette progression. La reine exige trois charges et la rupture du bras, pas une simple barre de vie vidée.

Le joueur contrôle Ripley. Hicks, Newt et Jax interviennent à la radio ; les deux premiers apparaissent dans les scènes d’accueil / départ. Ils ne sont pas des compagnons tactiques autonomes. La libération de Miller produit une conséquence narrative ; ce n’est pas un système d’escorte physique. Trois fins et deux issues pour Miller dépendent des décisions. Les 27 transmissions et les 36 dossiers sont écrits pour ce jeu.

### Ajout à Tantalus : installateur de lanceur, pas fusion du moteur
Le dépôt a été lu au commit `496996f5ea557d970ec625aa346876f3eaed1c5f`, `package.json` 86.0.0. Le menu `title-menu` et la copie récursive de `assets` dans le build ont été inspectés. Les archives cumulatives des autres DLC n’ont pas été retrouvées par la recherche de fichiers : leur compatibilité complète n’est pas certifiée.

Sur une **copie locale** du projet Tantalus :

```sh
node integration/install.mjs --check "CHEMIN_DU_PROJET_TANTALUS"
node integration/install.mjs --apply "CHEMIN_DU_PROJET_TANTALUS"
```

L’installateur ajoute un bouton au menu titre et copie sa page autonome dans `assets/dlc/alien5-lazare/`. Il ne modifie ni les missions natives, ni les catalogues, ni les sauvegardes, ni `package.json`, ni les autres DLC. Il refuse les destinations occupées ou ambiguës. Il conserve une copie de retour et des empreintes SHA-256. Dans le projet cible, exécuter ensuite `npm run check` et `npm run build`, puis vérifier le lanceur et la gestion du service worker. **Ces deux commandes du jeu complet n’ont pas été exécutées ici.**

Retrait :
```sh
node integration/install.mjs --remove "CHEMIN_DU_PROJET_TANTALUS"
```
Le retrait automatique refuse de restaurer un menu qui a été modifié depuis l’installation, afin de ne pas écraser un autre DLC. Aucune publication GitHub ou Vercel n’a été effectuée.

### Vérifications reproductibles
```sh
node tests/core.test.cjs
node tests/installer.test.mjs
python tools/build_standalone.py
python tests/browser_qa.py
```
Les deux tests Node n’ont aucune dépendance. Le test navigateur utilise Python, Playwright et Chromium. Dans cet environnement, les navigations HTTP locales et `file:` ont été bloquées. Le code local a donc été exécuté par `page.set_content`, sans modification des restrictions. La logique de persistance a été contrôlée avec un substitut explicite de stockage ; le refus du stockage natif a aussi été testé. Ce n’est pas une validation de persistance native dans tous les navigateurs.

Le parcours automatique des 27 objectifs utilise une simulation de navigation invulnérable et un rechargement à chaque jalon. Les combats sont vérifiés séparément. Les captures des derniers niveaux chargent des états de scénario préparés par ce banc : ce sont des images réelles du moteur, pas la preuve d’un parcours manuel intégral. Consulter `RAPPORT_VISUEL.html` et `qa/*-results.json`.

### Limites à garder visibles
Visuels vectoriels programmatiques de prototype, **ni photoréalistes ni fidèles 1:1 aux concept arts**. Les artistes originaux sont crédités dans le dossier ; leurs images ne sont pas redistribuées. Les grandes salles partagent encore des kits de structure et demandent une passe artistique spécifique. Les commandes tactiles et manette existent, mais aucune session complète sur appareil tactile ou manette physique n’a été effectuée. Pas de voix enregistrées, pas de cinématiques animées finalisées, pas de certification d’équilibrage, pas de QA de régression du jeu Tantalus entier.

### Contenu documentaire
`docs/CODEX_ALIEN5.md` : sources, continuité, campagne, IA, anatomie des lieux, portails exacts et matrice de validation. `docs/campaign.json` : données de campagne lisibles par outils. `RAPPORT_VISUEL.html` : captures, tests, limites et état de livraison. `MANIFEST_SHA256.json` : empreintes de tous les fichiers du paquet, sauf le manifeste lui-même.

Fan game non officiel. Aucun droit sur Alien ou les recherches de production n’est revendiqué. Le titre « Projet Lazare » est un titre original pour ce prototype, pas un titre de production attesté.
