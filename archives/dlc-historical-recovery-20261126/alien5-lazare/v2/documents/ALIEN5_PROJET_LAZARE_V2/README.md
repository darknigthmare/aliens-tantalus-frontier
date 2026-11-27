# ALIEN 5 — PROJET LAZARE
## V2 · Les survivants de Calder · 1.1.0-candidate.1

Ce paquet contient le **DLC autonome complet dans son état candidat V2**, pas tout le projet Tantalus Frontier. La campagne de la V1 est conservée ; les compagnons, les interactions techniques et les lieux ont été développés. Aucun push ni déploiement n’a été effectué.

## Jouer

Ouvrir `ALIEN5_PROJET_LAZARE_JOUER.html` dans un navigateur moderne. Tous les scripts et styles nécessaires au jeu sont incorporés : aucun téléchargement de ressource ni serveur distant n’est requis. Le dossier `game/` contient les sources séparées. Le jeu reste un prototype stylisé, non un produit fini photoréaliste.

**Commandes :** ZQSD / WASD / flèches pour se déplacer ; E pour agir ; Espace ou clic gauche sur l’image pour tirer ; R pour recharger ; 1 / 2 pour changer d’arme ; H pour un soin ; Maj pour marcher silencieusement ; F pour le leurre ; C pour les ordres de Hicks ; G pour lui donner des munitions ; L pour la torche ; Tab pour la carte ; J pour le journal ; Échap pour la pause.

E lance une intervention chronométrée. Bouger, tirer, subir un dommage ou utiliser à nouveau E l’interrompt. Les charges demandent 2,4 secondes. Les choix narratifs ouvrent une fenêtre de décision. Les menus et la perte de focus suspendent l’opération. Les commandes tactiles apparaissent sur les petits écrans. Les boutons de manette suivent le schéma standard du navigateur ; une manette physique n’a pas été validée pendant cette livraison.

## Ce qui est nouveau et réellement actif

- **Hicks sur le terrain :** suivi, couverture, attente sans tir, réserves finies, blessures, soins, recherche de chemin, position persistante et passage des portes conditionné à la proximité. Un allié laissé derrière ne se téléporte pas.
- **Miller à escorter :** libération physique au nid ; escorte jusqu’au sas médical du répartiteur de crise ; évacuation après contrôle de présence et d’état. Les bilans ne prétendent plus automatiquement que tous les compagnons sont à bord.
- **18 équipements techniques :** dix circuits de lumière qui influencent la vision des ennemis, quatre vannes de vapeur, trois dotations finies et un sas médical. La torche est sauvegardée, mais son cône n’ajoute pas un modèle de détection spécifique.
- **36 profils de lieux :** 310 placements de décor arrière/avant, 44 emprises solides, palettes et structures différenciées, signalétique fixée à des supports, proportions du petit matériel corrigées. Ce sont des instances de familles d’objets réutilisées, pas 354 sprites uniques.
- **Interface dégagée :** transmissions et travail sous l’image, informations d’équipe, carte des compagnons, journal des transmissions, import/export et migration V1.

## Reprendre une sauvegarde

La V2 écrit uniquement dans `atf.alien5.lazare.v2`. Elle peut lire `atf.alien5.lazare.v1` lorsqu’aucune partie V2 n’est présente, sans remplacer la clé originale. Le format JSON `ATF_ALIEN5_LAZARE` accepte les versions 1 et 2.

Pour transférer une partie d’un fichier ou site à l’autre : exporter la V1 depuis Pause, puis importer le JSON dans la V2. Les objectifs, réserves et décisions sont conservés. Une Miller déjà évacuée par le système narratif de la V1 reste évacuée ; une nouvelle partie V2 nécessite l’escorte.

Le navigateur peut refuser le stockage ou isoler différemment les fichiers locaux. **Exporter régulièrement une copie JSON** reste prudent. Le refus est signalé dans le jeu. Cette fabrication a testé la logique de stockage avec un substitut déclaré et le refus natif séparément, pas la persistance native après fermeture réelle du navigateur.

## Documents

`CODEX_ALIEN5.html` : codex navigable complet, 36 fiches avec placements, portes, emprises, objectifs, dossiers, équipements, menaces et captures. Texte source : `docs/CODEX_ALIEN5_V2.md`.

`RAPPORT_VISUEL.html` : bilan illustré autonome, résultats des contrôles, limites et galerie des 36 lieux. Les fichiers sources des captures sont dans `qa/rooms/` et `qa/v2screens/`.

`docs/campaign.json` : données exactes de la campagne ; identique à `game/data.json`. `docs/base-audit.json` : audit historique du dépôt utilisé pour le lanceur V1, **non** une inspection répétée dans cette V2.

## Sources et reconstitution

Cette interprétation non officielle s’appuie sur le corpus de la V1, notamment les recherches de Geoffroy Thoorens et le témoignage d’Alec Gillis. Aucun scénario intégral authentifié de Neill Blomkamp n’a été obtenu. Calder, Lazare, les raccords, les dialogues, les mécaniques et les fins sont des créations de jeu. La chronologie alternative après Aliens n’efface aucune des autres campagnes. Les images de production ne sont pas redistribuées. Voir les crédits du codex et `LICENSE_NOTICE.md`.

## Installer uniquement le lanceur dans une copie de Tantalus

L’intégration fournie est un accès à ce module autonome, pas une fusion de ses missions avec la simulation native.

```sh
node integration/install.mjs --check "CHEMIN_VERS_TANTALUS"
node integration/install.mjs --apply "CHEMIN_VERS_TANTALUS"
```

Si le lanceur V1 est déjà installé et intact :

```sh
node integration/install.mjs --upgrade "CHEMIN_VERS_TANTALUS"
```

Cette commande ne modifie pas le menu installé et conserve une copie de l’ancienne page du DLC. Elle vérifie les empreintes et refuse les fichiers modifiés, inconnus ou liés symboliquement. Pour retirer le lanceur et restaurer son menu d’origine inchangé :

```sh
node integration/install.mjs --remove "CHEMIN_VERS_TANTALUS"
```

Un conflit de menu provoque un refus, pas un écrasement forcé. Les tests d’installation utilisent des cibles minimales jetables. **Une validation de l’ensemble du vrai dépôt et des autres DLC reste nécessaire** avant publication.

## Reproduire les contrôles

Node 20 ou plus récent et Python 3 sont requis pour reconstruire les livrables ; aucun gestionnaire de paquets n’est nécessaire pour jouer.

```sh
npm test
npm run build
```

Le navigateur de test requiert Playwright pour Python et Chromium (`/usr/bin/chromium` dans l’environnement de fabrication) :

```sh
python tests/browser_v2_qa.py
```

Le script charge le document en mémoire car la navigation localhost est bloquée dans l’environnement de fabrication. Il ne change pas les restrictions. L’instrumentation QA existe seulement dans le document de test ; l’HTML distribué ne montre aucun bouton de débogage. Le balayage visuel fige la simulation et neutralise les menaces dans ses seuls états préparés. Les scènes avancées sont explicitement des fixtures, non la preuve d’une campagne manuelle entière.

Le générateur documentaire utilise `mistune` et Pillow, déjà employés lors de la fabrication :

```sh
python tools/build_docs.py
```

`tools/normalize_fixture_scales.py` applique des plafonds idempotents au petit matériel ; il ne modifie ni les emprises physiques ni les objectifs. Pour changer le jeu, modifier les sources puis reconstruire l’HTML. `MANIFEST_SHA256.json` référence les octets des fichiers de la livraison et doit être régénéré après toute modification.

## Portée des résultats

**192 contrôles réussis :** 31 socle V1 conservé, 56 systèmes V2 et données visuelles, 8 lanceur de base, 12 mise à jour, 85 interface/Chromium incluant les 36 profils. Les résultats bruts sont dans `qa/*results.json`.

Le parcours des objectifs et de l’escorte dans le moteur est automatisé, avec invulnérabilité dans le parcours de navigation et menaces neutralisées pour l’escorte isolée. Les cas de combat sont testés séparément. Ce n’est ni une certification de zéro bug, ni une campagne manuelle intégrale, ni une mesure de performance sur tout appareil. Les sprites et animations finaux, la finition des lieux, la fusion native de Tantalus et l’équilibrage global avec Hicks restent des travaux de production.
