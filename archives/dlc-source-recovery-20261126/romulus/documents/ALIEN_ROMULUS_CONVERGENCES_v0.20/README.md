# ALIEN : ROMULUS - CONVERGENCES 0.20

Extension non officielle autonome pour **Aliens: Tantalus Frontier**, construite sur la livraison Concordance 0.19 de cette conversation. Aucun moteur hôte, autre DLC, dépôt GitHub ou déploiement Vercel n'est remplacé.

Cette édition vise surtout la **concordance d'ensemble** : lieux, types de raccords, supports des ouvertures, matériel, apparences et ellipses sont audités ensemble. L'objectif est d'approcher le film sans transformer une hypothèse ou un concept abandonné en vérité du montage.

## Jouer

Ouvrir `ROMULUS_TOUT_EN_UN.html` dans un navigateur de bureau. Le fichier embarque le moteur, les sprites et les sons et ne télécharge aucun asset de jeu depuis un service distant.

Pour servir les sources localement avec Node :

```sh
node tools/serve.mjs
```

Le stockage local sous `file:` dépend du navigateur. Pour déplacer une progression entre fichiers, origines ou appareils, utiliser **Exporter JSON / Importer JSON**.

## Commandes principales

- Flèches ou ZQSD/WASD : déplacement.
- C : posture basse.
- E : interaction ; certaines manipulations demandent de maintenir.
- Espace : saut lorsque permis.
- V / clic droit : viser. F / clic gauche : tirer si le fusil est disponible.
- G : suivi/attente du groupe.
- L : lampe.
- R : reprise de la ligne dans la finale.
- M : carte.
- H : repères.
- I : matériel observé.
- B / **Mesurer** : lecture thermique quand Tyler possède l'appareil et reste accessible.
- Échap : pause/fermeture du panneau.
- Tab : codex en jeu ; navigation de focus quand un panneau est ouvert.

La visée libre reste facultative. Les appareils scénarisés ne sont pas transférés à Rain simplement parce qu'ils apparaissent dans le registre ou le panneau Matériel.

## La passe Convergences

### Lieux et topologie

Le contenu narratif reste : **20 chapitres, 53 états de scène, 26 lieux physiques persistants, 60 manipulations, 38 séquences animées plus le prologue**.

Le registre v0.20 distingue en plus **deux emplacements temporels du prologue** : la récupération automatisée et son laboratoire d'analyse. Ils sont documentés comme séquences temporelles, pas ajoutés comme deux faux niveaux libres.

L'audit courant dénombre **41 franchissements physiques de scène** dans le runtime audité, 30 identités de seuil partagées et 13 repères d'arrivée fermée hérités du registre Concordance. Une coupe éditoriale, un changement de point de vue et une phase dans la même pièce ne sont pas déguisés en porte.

Les seuils situés à l'intérieur d'un lieu doivent posséder un support architectural déclaré. Les arrivées physiques doivent rester dans les dimensions de leur destination. Le test v0.20 refuse également un grand prop solide posé directement sur un seuil physique.

### Jackson's Star et Andy

L'étape `S02` ne passe plus directement d'un point de la rue à Andy déjà remis sur pied. Une séquence locale originale montre maintenant deux travailleurs bloquant le passage, Andy tentant de désamorcer l'altercation, sa chute, puis Rain qui l'aide à se relever.

Cette chorégraphie respecte l'ordre narratif visé par le module mais **ne copie pas de dialogue du film** et ne prétend pas reproduire le montage plan par plan. Les dialogues du jeu restent originaux.

La rue reçoit aussi une densité de silhouettes de travail et les quatre jeunes colonistes autres qu'Andy utilisent une **couche de pluie extérieure** pendant les scènes coloniales concernées. Rain conserve sa parka rouge déjà ajoutée en 0.19 ; Andy garde sa tenue distincte.

### Manutention des capsules

La récupération en baie Remus ne se résume plus à un changement d'état instantané. Les brides se libèrent, un berceau de manutention prend la capsule et le groupe guide le chargement vers la voie du sas. **Les bâtis fixes restent dans la baie.**

Le transfert complet jusqu'au Corbelan reste une **ellipse éditoriale explicitement documentée** : cette version ne fabrique pas un couloir de manutention non confirmé pour prétendre à une continuité physique 1:1.

### Monte-charge de Kay

Kay entre toujours dans la cabine, mais la v0.20 prolonge l'action : la grille se ferme, la cabine quitte le palier puis descend jusqu'à disparaître dans la cage avant la coupe suivante. La position verticale est réellement animée et sauvegardable pendant la séquence.

La course continue entre tous les ponts n'est pas encore simulée comme un trajet libre. Le registre conserve donc cet écart au lieu de le marquer comme résolu.

### Matériel et apparences

L'audit matériel passe à **30 entrées**. Trois ajouts de contrôle sont documentés :

- berceau/chariot de manutention des capsules - équipement fixe du lieu ;
- cabine de monte-charge - infrastructure fixe ;
- équipement de récupération du prologue - représentation partielle dans la séquence temporelle, pas objet d'inventaire.

Les huit profils d'apparence restent suivis. Les couches pluie de Navarro, Kay, Bjorn et Tyler sont renforcées pour Jackson's Star. Les limites restent explicites : textiles, usure, coiffures/visages et transitions de vêtements ne sont pas certifiés plan par plan.

### Fidélité : ce qui n'est toujours pas déclaré résolu

Le registre conserve notamment :

- le prologue comme séquence temporelle, non comme niveau d'exploration complet ;
- les extensions de Jackson's Star et la foule complète ;
- le transfert intégral des capsules jusqu'au Corbelan ;
- la course complète du monte-charge entre tous les ponts ;
- le **lieu exact de l'injection de Kay**, toujours non certifié ;
- l'absence de plan métrique global final de Renaissance et du Corbelan ;
- le couloir de sécurité séparé, volontairement exclu car documenté comme coupé ;
- la garde-robe, les dommages et les visages encore stylisés ;
- le second F44 de Tyler encore partiellement simulé.

Il n'existe donc **aucun pourcentage de fidélité 1:1 certifié** dans cette livraison.

## Documentation

- `REGISTRE_CONVERGENCES.html` : registre interactif avec spoilers - **26 lieux physiques, 2 lieux temporels, 30 entrées matériel, 8 profils d'apparence et 10 écarts suivis**.
- `docs/DOSSIER_CONVERGENCES_V20.pdf` : atlas des lieux, réseau, matériel, apparences, écarts et sources.
- `docs/RAPPORT_CONVERGENCES_V20.pdf` : captures et résultats avec méthode de vérification.
- `docs/CAMPAGNE_ET_DIALOGUES_V20.md` : chapitres, manipulations, séquences et dialogues originaux courants.
- `docs/ROMULUS_MANIFEST_V20.json` : export des données réellement chargées après le patch v0.20.
- `docs/REGISTRE_CONVERGENCES_V20.json` : export du registre de production.
- `GALERIE.html` : quatre captures v0.20 avec leur provenance et leurs limites.

Les documents 0.19 éventuellement conservés dans les sources sont historiques et ne décrivent pas l'état courant.

## Sauvegardes

Cette version utilise `atf.romulus.continuity.v20`. Les états 0.2 à 0.19 restent importables sans écraser leurs anciennes clés. La version 0.1 demeure incompatible.

Les trois jalons manuels de la campagne restent séparés de la sauvegarde automatique. Ils ne constituent ni une synchronisation cloud ni une preuve de persistance inter-appareils.

## Vérifications effectuées

### Suites réexécutées

`node tools/test.mjs` a été relancé après les modifications v0.20. Les suites historiques de simulation et les huit essais d'installation sur fixtures terminent sans échec.

La passe v0.20 ajoute :

- **17/17** contrôles topologiques propres à Convergences ;
- **5/5** campagnes Node complètes sur les profils prudent, action, interrompu, observateur et viseur ;
- **1/1** diagnostic navigateur du HTML courant, produisant quatre captures v0.20 sans erreur de page ;
- **5/5** contrôles navigateur du registre Convergences.

En comptant les **1 382** contrôles de simulation hérités effectivement rejoués, les **8** essais d'installation, puis les contrôles ci-dessus, cette livraison documente **1 418 vérifications réexécutées ou nouvelles**.

### Résultats des cinq campagnes v0.20

- Prudent : fin atteinte, **13 PV**, 3 tirs, 0 décès.
- Action : fin atteinte, **87 PV**, 3 tirs, 0 décès.
- Interrompu : fin atteinte, **13 PV**, **17 imports**, 0 décès.
- Observateur : fin atteinte, **65 PV**, 3 tirs, 0 décès.
- Viseur : fin atteinte, **65 PV**, **39 tirs dont 36 manuels**, 0 décès.

Chaque profil visite 57 états/retours de scène et accomplit les 60 manipulations. Ennemis, acide et dégâts restent actifs.

### Limite importante des tests navigateur

La reproduction intégrale des **cinq** campagnes dans Chromium n'est **pas** déclarée comme revalidée en 0.20 : cette passe a achevé les deux premiers replays avant d'atteindre la limite de temps de l'environnement. Les cinq campagnes complètes v0.20 sont en revanche recalculées dans le moteur Node et les nouvelles scènes sont testées dans le HTML courant par diagnostics ciblés.

Les tests navigateur utilisent un adaptateur mémoire réservé à la QA car la navigation native vers les fichiers/HTTP local est bloquée dans cet environnement. Cela ne valide pas la persistance après fermeture réelle du navigateur, Safari/iOS, une manette ou un appareil tactile physique, ni l'écoute subjective du mixage.

## Reconstruire

```sh
python tools/build-standalone.py
python tools/build-convergences-register.py
python tools/build-convergences-docs.py
node qa/verify-topology-v20.mjs
python qa/verify-convergences-register.py
```

Les générateurs historiques de personnages et de décors sont conservés comme sources de travail ; ne pas les relancer aveuglément pour écraser les assets courants.

Les PDF doivent être rendus et inspectés après toute modification documentaire. Aucune police autonome n'est distribuée.

## Lanceur facultatif - pas intégration native

`node tools/install.mjs install /chemin/vers/copie-de-tantalus` ajoute uniquement un accès indépendant sur une copie compatible. Son retour arrière est décrit dans le script. Les essais sont réalisés sur fixtures, pas sur le dépôt principal de Tantalus.

**Aucun push GitHub, déploiement Vercel, remplacement des autres DLC ou fusion native GameEngine/SaveSystem/MIRE n'est effectué par cette livraison.**
