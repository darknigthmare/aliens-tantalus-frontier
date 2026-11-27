# ALIEN 5 — PROJET LAZARE
## V10 · Plans et identités · 1.9.0-candidate.1

### Jouer
Ouvrez `ALIEN5_PROJET_LAZARE_JOUER.html`. Scripts et styles sont embarqués, sans dépendance réseau. Le bouton du fichier `JOUER_WINDOWS.bat` ouvre le même document. Le dossier `game/` contient sa version modulaire. Aucun paquet n’est requis pour jouer au HTML livré.

Le rendu demeure vectoriel stylisé. La fidélité 1:1 n’est pas atteinte. Cette campagne originale conserve sa cohérence interne mais ne reproduit pas un scénario intégral de Neill Blomkamp authentifié. Le moteur natif, les sauvegardes et le registre MIRE de Tantalus ne sont pas fusionnés ; aucun push ou déploiement distant effectué.

### Architecture et circulation
60 pièces, 83 liens réciproques et 166 extrémités avec support décrit et dessiné : retours de paroi, vestibules, cages d’escalier et gaines. 29 retours possèdent une véritable emprise solide. Les passages de fret ont une ouverture dessinée de 312 unités ; portes ordinaires 124, ascenseurs 156. Ce sont des unités du jeu, pas des mètres mesurés dans la production.

La V10 conserve les 56 pièces et 76 liens V9. La galerie du hangar et son quai d’inspection sont accessibles depuis la zone industrielle après réarmement du groupe. La coque du Derelict est un volume monumental en arrière-plan : son intérieur n’est pas parcourable. Le jardin s’insère dans les bureaux après autorisation de direction ; sa composition est originale. L’armurerie de la navette relie piste et hangar, après acquisition des charges d’arrimage.

Le plan local utilise les emprises et positions du moteur. La carte globale reste un graphe, pas une carte métrique continue. Les 28 étapes successives des autorisations et les approches des dispositifs sont contrôlées automatiquement. Ces preuves ne prétendent pas établir que toutes les distances des concepts sont restituées.

### Deux équipements supplémentaires utilisables
**Combinaison thermique :** acquisition à la galerie du hangar, puis activation depuis le Registre. Le doublage fini absorbe 60 % des dégâts des jets thermiques explicitement traités. Les griffes, balles, acide et le compte à rebours ne sont pas annulés. 100 points de doublage ; aucune restauration par changement de tenue. Newt et les compagnons n’en profitent pas. Le M-4 actif et la protection thermique ne se portent pas simultanément.

**Arme lourde sur harnais :** acquisition à l’armurerie de la navette ; touche 3 pour sélectionner. Bande 40, réserve indépendante 80, rechargement 2,2 s, cadence 0,14 s, portée 900, dégâts de base 26. Vitesse de marche 78 %. Les caches ordinaires et les cartouches du fusil ne rechargent pas la réserve lourde. Le tir reprend l’interception du premier obstacle, corps, cellule ou allié ; un allié intercepte sans blessure mais la cartouche est consommée. Toutes ces statistiques sont des règles originales, pas des spécifications prouvées du film.

### Personnages et registre
`I` ouvre le Registre. Il comporte 22 entrées de matériel (portable, objet de quête ou installation fixe), leur emplacement et l’état réel de la sauvegarde ; 11 fiches de distribution ; les accès locaux ; 40 références et leurs lacunes.

Sept silhouettes utilisent le dessin des acteurs du jeu : Ripley, Hicks, Newt adulte, Miller, Lena, Sana et Ivo. Cheveux, vêtements et accessoires sont différenciés. La marque de Hicks garde son côté anatomique. Fusil, incinérateur, arme lourde, tenue thermique et intervention ont des rendus distincts. Ce ne sont pas des portraits photoréalistes ni des reproductions exactes des concepts.

Miller, technicienne de Calder, reste un personnage original : le titre « Miller pinned » d’une planche ne valide ni son identité ni son apparence. Jax reste une liaison radio ; Killson, Montero et Johnson ne sont pas implémentés comme acteurs. Parmi les 40 entrées du registre, 29 ont une interprétation partielle, dix restent non restituées et une nécessite une étude visuelle. Ce suivi n’est pas un pourcentage de fidélité.

### Commandes
ZQSD / WASD / flèches : marche. Maj : approche silencieuse. E : agir/interrompre. Espace ou clic : tir. R : recharge. 1 / 2 / 3 : armes acquises. H : soin. F : leurre. L : torche. T : détecteur acquis. B : regroupement. C : ordre de Hicks. G : transfert de cartouches. X : niche. V : renforcement d’une cloison. U : industrie. K : pinces. O : signature M-4. P : défense S-12. Y : mode de visée. I : Registre. Tab : carte. J : journal. Échap : Pause.
Les menus exposent les commandes disponibles à portée et les commandes tactiles restent sous le terrain. Le routage logiciel de manette est conservé ; aucune manette physique n’est certifiée par cette livraison.

### Sauvegardes et migrations
Depuis V1 à V9, exportez votre JSON puis utilisez **Pause → Importer**. La clé V10 est `atf.alien5.lazare.v10` ; les anciennes clés ne sont pas écrasées. Les trois emplacements manuels, l’automatique relu et sa copie de secours sont conservés. Les nouveaux objets restent à récupérer, pas accordés gratuitement.

Si un ancien véhicule, cargo ou emplacement rencontre un retour ajouté en V10, l’import recherche une place libre proche dans la même pièce. Il ne restaure ni santé, ni énergie, ni cartouches et ne change pas les autorisations. L’ajustement est signalé. Sans emplacement sûr, l’import est refusé et le JSON d’origine demeure intact. Ce mécanisme de migration n’est pas un déplacement disponible en partie.

La persistance native après fermeture du navigateur n’est pas certifiée dans l’environnement de test. Conservez un export JSON séparé ; les permissions, l’origine ou un nettoyage du navigateur peuvent rendre le stockage inaccessible.

### Preuves de cette livraison
`qa/qa-summary-v10.json` : 536 contrôles fonctionnels réussis, y compris 51 tests d’équipement/migration, 373 régressions du runtime complet V10, 20 contrôles du lanceur, 88 contrôles navigateur et quatre parcours. `qa/architecture-v10.json` : 889 contrôles structurels, dont 376 approches, sur situations préparées. `qa/docs-v10.json` : 109 contrôles documentaires et de mise en page.

Les quatre parcours Récit/Survie, standard/rationné visitent les 60 lieux, franchissent 97 transitions et accomplissent les 27 objectifs principaux, les services, le relais de Newt, le P-17, le M-4 et les acquisitions V10. Les trois civils partent en convoi, Miller est prise en charge et Hicks embarque. Pas d’invulnérabilité, de ressources injectées ni d’objectifs validés directement. Le pilote connaît positions et solutions et utilise surtout le fusil historique ; le combat lourd et la protection thermique sont vérifiés séparément en cas contrôlés. Cela ne certifie ni une difficulté humaine ni une absence de tout défaut.

Le navigateur a réellement refusé une navigation `file://` avec `ERR_BLOCKED_BY_ADMINISTRATOR` (`qa/probe-v10.json`). Les vérifications utilisent Chromium, `page.set_content`, une horloge contrôlée et un stockage mémoire explicitement substitué. Pas de mesure de FPS ni de conservation native après fermeture revendiquée. Les 15 captures de scène proviennent soit de l’interface normale, soit de checkpoints du pilote ; les 120 cadrages d’atlas sont préparés. Les 60 planches assemblées réemploient ces cadrages, ce ne sont pas 60 preuves de scène supplémentaires.

### Reconstruire et vérifier
Le HTML se reconstruit avec Python 3 et sa bibliothèque standard. Les tests moteur et le lanceur nécessitent Node 20 ou supérieur. Les documents et essais visuels utilisent les bibliothèques Python listées dans `requirements-qa.txt`, ainsi qu’un Chromium local. Les scripts de QA emploient `/usr/bin/chromium` dans cet environnement ; modifier ce chemin est nécessaire sur un autre système.

```sh
npm run build
npm test
npm run test:campaign
npm run test:browser
npm run qa:summary
npm run docs
npm run test:docs
npm run package
```

Les fichiers `systems-v2.js` à `systems-v10.js` forment une seule chaîne cumulative. Les suites `current-*` conservent le nom historique des systèmes testés, mais chargent toutes la V10. Les fixtures anciennes servent aux migrations, pas au compteur des parcours actuels. `tools/upgrade_v10.py` recrée les données depuis la copie immuable `docs/base-v9-data.json` ; il n’est pas nécessaire pour lancer le jeu.

### Documents
`CODEX_ALIEN5.html` : 144 règles et 60 fiches avec portes, dispositifs, emprises, sources et captures.
`AUDIT_FIDELITE.html` : les 40 références, 11 identités, 22 matériels et 166 supports.
`RAPPORT_VISUEL.html` : changements, illustrations et limites des preuves.
`MANIFEST_SHA256.json` : empreintes individuelles des fichiers contenus dans l’archive.

### Lanceur local facultatif
Lisez `integration/README.md`. Travaillez sur une copie du projet hôte. `--check` examine sans modifier ; `--apply` ajoute le lanceur ; `--upgrade` remplace uniquement sa page reconnue ; `--remove` retire une installation inchangée. Les modifications concurrentes sont refusées. Aucun registre natif MIRE, aucune sauvegarde hôte ni mission Tantalus n’est fusionnée.

### Provenance
Le portfolio Alien 5 de Geoffroy Thoorens constitue la source primaire des légendes de concepts. Les archives publiques et le témoignage direct d’Alec Gillis sont référencés dans les documents. Les nouveaux plans métriques, interactions, statistiques et dialogues sont originaux à Calder. Aucun scénario intégral authentifié nouvellement obtenu et aucune image de production redistribuée. Consultez `LICENSE_NOTICE.md` ; cette livraison n’accorde aucun droit d’exploitation commerciale sur l’univers Alien.
