# ALIEN 5 — PROJET LAZARE
## V3 — Les chemins de repli · 1.2.0-candidate.1

Continuation réelle des sources de la V2 « Les survivants de Calder ». Fan game non officiel : campagne autonome, scénario de raccord original et rendu vectoriel stylisé. Aucun scénario intégral de Neill Blomkamp n’a été authentifié. Aucun moteur natif de Tantalus ni sauvegarde globale n’est fusionné ici. Aucun push GitHub et aucun déploiement n’ont été effectués.

## Jouer

Décompresser le paquet puis ouvrir `ALIEN5_PROJET_LAZARE_JOUER.html` dans un navigateur de bureau. Le HTML contient ses scripts et son style : aucun téléchargement d’asset n’est nécessaire. Les sons synthétiques sont facultatifs, à activer dans Pause. Les sources séparées sont dans `game/`.

La campagne propose Récit et Survie. Les 12 chapitres, 27 objectifs et trois dénouements sont conservés. Ripley est contrôlée ; Hicks accompagne physiquement l’opération ; Miller doit être escortée au sas médical après sa libération. Newt et Jax restent des liaisons narratives.

## Nouveautés V3

42 lieux au lieu de 36 et 56 liaisons réciproques au lieu de 47. Les six nouvelles pièces forment trois boucles de service sans contourner les autorisations principales :

- Soute des dépanneurs et passage D2 : récupérer le détecteur et le découpeur, puis rouvrir le retour vers les citernes.
- Local des échangeurs et galerie de retour d’eau : aligner les trois voies après drainage, ouvrir le passage sec et obtenir 120 secondes de marge lors de la stérilisation, une seule fois.
- Surveillance auxiliaire et coursive des câbles : après lecture du contrat, couper les cinq caméras locales et ouvrir le retour vers l’infirmerie. Les gardes restent présents.

Le détecteur affiche des mouvements de la pièce, alliés compris, sans identification. Il consomme une batterie qui se recharge lorsqu’il est abaissé. Les gardes tiennent compte de leur orientation et du faisceau de Ripley ; la vidéo détecte l’exposition dans son empreinte visible.

Hicks dispose d’un quatrième ordre : suivre sans tirer. Le regroupement aux portes est actif par défaut, avec un départ sans attendre explicitement accessible. Les chemins pénalisent l’acide, la vapeur active et l’eau non drainée. Ce n’est pas une garantie de protection.

La carte propose une vue topologique par niveau et un plan local fondé sur les coordonnées du moteur. Poser un repère ne téléporte pas. L’instrument et les informations sont hors du champ de jeu ; le menu Matériel permet aussi d’utiliser arme, soin, leurre et torche sans clavier.

## Commandes

| Action | Commande |
|---|---|
| Déplacement / profondeur | ZQSD, WASD ou flèches |
| Marcher discrètement | Maj |
| Interagir / interrompre | E |
| Tirer | Espace ou bouton gauche dans l’image |
| Recharger | R |
| Fusil / incinérateur | 1 / 2, ou menu Matériel |
| Soin / leurre | H / F, ou menu Matériel |
| Quatre ordres de Hicks | C, ou menu Équipe |
| Regrouper les personnes de la pièce | B |
| Donner jusqu’à 16 cartouches à Hicks | G, à proximité |
| Torche / détecteur | L / T |
| Carte / journal / pause | Tab / J / Échap |

Un appui sur E commence un travail : marcher, tirer, être touchée ou appuyer de nouveau l’interrompt. Pendant un regroupement au seuil, rester immobile laisse arriver les équipiers ; E annule, « Partir sans attendre » assume la séparation. Un équipier dans une autre pièce n’est jamais rappelé instantanément.

La reine demande toujours les trois attaches puis le pupitre de rupture. Les tirs ne suffisent pas à la tuer.

## Reprendre la V1 ou la V2

Exporter la sauvegarde JSON depuis l’ancienne version. Dans la V3, ouvrir Pause → Importer puis choisir ce fichier. Les formats 1, 2 et 3 sont acceptés et normalisés. Le registre historique est conservé et les trois nouvelles instances sont ajoutées.

La clé actuelle est `atf.alien5.lazare.v3`. Une ancienne clé visible dans la même origine peut être détectée automatiquement ; elle n’est pas réécrite. Le compartiment de stockage peut changer entre fichiers et sites : l’export/import est la méthode prudente pour transférer sa partie.

Le refus de stockage est affiché, sans empêcher de jouer et d’exporter. La persistance native après fermeture du navigateur n’est pas certifiée dans l’environnement de livraison. Les tests de logique de stockage utilisent explicitement un substitut Map ; le refus natif est testé séparément.

## Documentation et preuves

`CODEX_ALIEN5.html` contient 28 règles, la campagne, les trois interventions et 42 fiches détaillées avec captures, accès réciproques, dispositifs, emprises, supports, coordonnées, notes et menaces. `RAPPORT_VISUEL.html` présente les ajouts, captures et limites. Les données de conception lisibles sont dans `game/data.json` et `docs/campaign.json` ; la source Markdown est `docs/CODEX_ALIEN5_V3.md`.

`qa/summary-v3.json` recense 295 contrôles réussis : 31 socle V1, 56 systèmes V2 conservés, 71 systèmes/données V3, 20 contrôles du lanceur, deux parcours complets et 115 contrôles navigateur uniques. Les suites historiques utilisent les données V2 gelées de `tests/fixtures/`, pas des données V3 déguisées en V2.

Les deux parcours automatiques Récit et Survie utilisent les entrées de déplacement, les durées de travail et les ennemis actifs, sans invulnérabilité, ajout de ressources, déplacement direct de Ripley ou injection d’objectifs. Ils accomplissent les 27 étapes, les trois interventions et l’évacuation de Miller avec Hicks à bord. Chacun visite 39 lieux et franchit 60 transitions. L’automate connaît les positions et la solution du puzzle : il ne remplace pas une partie humaine ni un équilibrage commercial.

L’atlas comporte 42 captures du moteur dans des états préparés. Les menaces sont neutralisées dans cette copie destinée à examiner le décor. Les captures d’interface avancées emploient des sauvegardes issues des parcours et des mises en situation identifiées. Une vue préparée ne prouve pas une traversée manuelle.

## Reproduire les tests et le build

Le moteur et le lanceur utilisent Node.js 20 ou plus récent. Le build et les rapports utilisent Python. Les vérifications navigateur demandent Python avec Playwright et Chromium. `CHROMIUM_PATH` permet d’indiquer un exécutable ; à défaut, le script utilise Chromium système ou le navigateur installé pour Playwright.

```text
npm test
npm run build
npm run test:browser
npm run docs
```

Les tests navigateur sont répartis en sept phases avec un rapport enregistré par phase. Le document est exécuté en mémoire : les navigations locales étaient bloquées dans l’environnement de livraison et aucune restriction n’a été désactivée. Le mode normal ne présente pas de menu développeur. Le crochet de test n’est actif qu’avec le paramètre explicite `qa=1` ; les tests en mémoire activent ce crochet sur une copie du texte, sans modifier le fichier livré.

## Lanceur facultatif pour une copie de Tantalus

Ce script ajoute ou met à jour seulement le bouton de lancement et sa page HTML autonome. Ce n’est pas une fusion des campagnes, récompenses, archives ou sauvegardes dans les systèmes natifs. Il a été testé sur des dossiers minimaux de contrôle. L’ancien commit de base est un repère historique de la V1, pas une nouvelle lecture du dépôt courant.

```text
node integration/install.mjs --check "CHEMIN/DU/PROJET_TANTALUS"
node integration/install.mjs --apply "CHEMIN/DU/PROJET_TANTALUS"
```

Pour une installation précédente intacte du même lanceur :

```text
node integration/install.mjs --upgrade "CHEMIN/DU/PROJET_TANTALUS"
```

Le script refuse les fichiers inattendus, plusieurs formes de liens symboliques et les modifications concurrentes du menu. Il conserve une copie de la page antérieure lors d’une mise à jour. Exécuter ensuite les vérifications propres à la copie de Tantalus avant toute publication.

```text
node integration/install.mjs --remove "CHEMIN/DU/PROJET_TANTALUS"
```

Le retrait automatique est refusé lorsque le menu a été modifié depuis l’installation : il n’écrase pas les autres changements pour rétablir son ancienne copie. Les sauvegardes du navigateur ne sont pas effacées.

## Limites restantes

Graphismes vectoriels et silhouettes stylisées, structures encore partagées, ressources assez généreuses, pas de doublage ni d’animation cinématique complète. Aucun parcours manuel intégral, aucune validation sur manette ou téléphone physique et aucune certification de persistance après fermeture du navigateur. Le registre MIRE et le moteur natif des autres DLC ne sont pas fusionnés. Le scénario et les mécanismes de raccord sont originaux, non canoniques ; les images de production tierces ne sont pas redistribuées.
