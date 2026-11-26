# ALIEN: ISOLATION — Sevastopol · Dernière transmission
## 0.8.0 — Une station, des chemins

Prototype jouable autonome, cumulatif. Adaptation non officielle et condensée : les plans, textes et graphismes sont originaux. Ce dossier n’est pas le jeu complet Aliens: Tantalus Frontier et n’est pas une fusion de ses moteurs.

## Jouer

Ouvrir `JOUER_ISOLATION.html` dans un navigateur de bureau. Le fichier contient les données et les 155 ressources SVG ; aucun téléchargement de ressources externes n’est nécessaire.

Pour un serveur local à adresse constante : installer Node 20 ou supérieur puis lancer `DEMARRER_WINDOWS.cmd` ou `DEMARRER_MAC_LINUX.sh`. Autre méthode : `npm run serve`, puis l’adresse indiquée par le terminal (port 8127 par défaut). Conserver la fenêtre ouverte ; Ctrl+C arrête le serveur. Il écoute uniquement sur la boucle locale. Fermer l’ancien lanceur avant d’ouvrir la nouvelle version au même port.

**Limite de l’atelier :** les essais ont chargé le HTML exact dans Chromium via Page.set_content. Les navigations `file://` et HTTP local ont été réellement refusées par une politique du navigateur ; aucune politique n’a été modifiée. Le lancement natif, l’ouverture automatique sur chaque système et la persistance après fermeture du navigateur utilisateur ne sont pas certifiés. Les tests HTTP du serveur sont distincts des tests de navigation.

## Commandes principales

ZQSD / WASD / flèches : déplacement. C : accroupissement. Maj : course. E maintenu : interaction. M : carte. I : équipement et fabrication. O : codex. J : liaisons et projets. Échap : pause.

R maintenu : détecteur ; K : couper son haut-parleur ; Y maintenu : changer sa pile. TAB : roue d’accès rapide ; flèches ou 1–4 pour prévisualiser, Entrée pour choisir, Échap/TAB pour annuler. Clic droit : utiliser l’objet choisi. G/L/X : leurre/fusée/IEM ; H : soin ; V maintenu : point de lancer. N : marche prudente du contact à portée ; U : cachette à portée. T : verrou local temporaire. Le guide intégré détaille les autres actions.

L’équipement et la roue ne suspendent pas le temps. Carte, codex, journal et pause suspendent la simulation. Une fermeture ou une blessure conserve son état à l’enregistrement.

## Ce qui change en 0.8

- 76 lieux, 112 liaisons réciproques et 224 faces de passage. Les 64 anciens lieux et les 88 anciens identifiants de liaison sont conservés.
- Une ouverture est désormais distincte de son point d’approche et de son point d’arrivée. Les façades de fond sont sur la paroi arrière ; les accès latéraux disposent de retours de cloison ; les sas extérieurs appartiennent à une enveloppe de coque.
- 9 anciens passages entre des ponts différents deviennent des escaliers visibles. Un ancien escalier au même niveau devient une porte de plain-pied. Les escaliers, transports et couloirs de liaison restent condensés : ce n’est pas une station 3D continue.
- 12 postes interactifs et 6 corridors d’arrivée sont dégagés. La carte de Morley reste nécessaire sur chaque entrée de la pharmacie. L’annexe KG-348 se verrouille avec son module. Les annexes exposées rejoignent le réseau de gaines.
- 12 nouveaux lieux : SciMed/Towerlink ; Galleria basse et haute, logements et transit supérieur de Solomons ; maintenance/morgue ; production de fluide et orientation des synthétiques ; pont de maintenance du réacteur ; laboratoires à risques ; carré du Torrens ; chambre du pilote dans le souvenir.
- 12 nouvelles tâches et 12 archives : 32 tâches et 57 archives au total. 840 placements, 246 règles ; 19 chapitres et 52 objectifs principaux, sans ajout artificiel d’étapes de campagne.
- Plan technique local inspectable pour chacun des 76 lieux, voisins et conditions d’accès. Un repère manuel peut être enregistré ou effacé, sans déplacer Amanda ni modifier l’objectif principal. La carte globale est explicitement schématique, pas métrique.
- Sols extérieurs alignés au plan de marche ; passages organiques montés dans la roche/coque du souvenir ; disparition des grilles de plafond dans le vide ; signalétique de secteur corrigée ; 23 affiches/luminaires déplacés hors des ouvertures.

Les systèmes 0.7 sont conservés : chasseur non tuable, furtivité, perception, casiers, détecteur et bips, fabrication, lancers différés, oxygène et sas, protocoles Gemini/Samuels/Anesidora, deux escortes originales Nora/Elias, refuges, services et projets.

## Sauvegardes

Identifiant séparé : `tantalus.dlc.alien-isolation.v1`. Avant la mise à jour, exporter un JSON depuis l’ancienne version et le conserver. **L’export représente le dernier enregistrement, pas automatiquement la position affichée.** Importer le fichier depuis la nouvelle version. Les fixtures de sauvegardes 0.1–0.7 sont testées ; les nouveaux lieux, tâches et projets ne sont pas offerts par la migration.

La charge du détecteur, les compagnons, projets, objets consommés et repère sont conservés selon leur format. Les identifiants de repère inconnus sont supprimés ; les traces anciennes du détecteur ne sont pas réintroduites. Un retour arrière de lanceur ne convertit pas une sauvegarde récente vers un ancien format.

## Documents

`docs/RAPPORT_VISUEL_ISOLATION.html` : évolution, résultats et 20 captures sélectionnées avec provenance.

`docs/CODEX_ISOLATION.html` : 76 plans, 840 placements, 224 faces, 32 tâches, 57 archives et 246 règles. Recherche des lieux et identifiants.

`docs/AUDIT_SPATIAL_ISOLATION.html` : inventaire exhaustif du module, matrice des familles condensées, registre des 112 liaisons, changements et dix planches-contact.

`qa/captures` contient 96 captures PNG des campagnes, mécaniques et menus. `qa/architecture` contient 228 JPEG préparés (2 extrémités normales + 1 centre CLASSIC par lieu). Les 10 planches sont dans `qa/contact-sheets`. Une scène préparée n’est jamais une preuve de progression naturelle.

## Validation et reproduction

```
npm test
npm run test:spatial
npm run test:campaign
npm run test:signals
npm run test:browser
npm run docs:build
npm run test:documents
python3 tools/verify_delivery.py
```

Node 20+ ; Python, Playwright et Chromium installé pour les tests visuels. Les scripts navigateur utilisent `/usr/bin/chromium` dans cet atelier ; adapter le chemin sur un autre système. Le jeu autonome n’a pas besoin de Python ou de Playwright.

Résultats de cette livraison : 536 assertions Node ; 386 contrôles navigateur ; 2 197 trajets locaux et 462 564 points échantillonnés sans échec. 9/9 campagnes principales et 6/6 campagnes détecteur aboutissent. 2/3 explorations actives exhaustives réussissent : 76 lieux, 32 tâches, deux escortes et deux projets, 158 transitions. L’autre essai meurt dans la salle de garde sur la graine 20141007 après 13 objectifs. Les deux parcours géométriques normaux/CLASSIC réussissent sans dégâts ordinaires.

Le pilote automatise les commandes mais lit l’état interne pour planifier. Ce n’est pas une validation humaine de l’équilibrage. La connectivité structurelle ignore les verrous pour détecter les nœuds isolés ; les parcours de campagne vérifient séparément les conditions de progression.

Les tests régénèrent leurs journaux. Exécuter `verify_delivery.py` sur la copie intacte avant les tests, ou conserver une extraction neuve ; ne pas recréer le manifeste pour dissimuler une modification involontaire.

Reconstruction : `python3 tools/rebuild_content.py`. Contrôle complet des données et des 155 anciens SVG : `python3 tools/verify_rebuild.py CHEMIN_ARCHIVE_V0_7.zip`. Le manifeste installable suit la version finale reconstruite.

## Installation facultative à côté d’un hôte Tantalus

L’installateur copie seulement le lanceur et le manifeste dans `public/dlc/alien-isolation`. Il ne fusionne pas GameEngine/SaveSystem/MIRE et ne modifie pas les menus hôtes.

```
node tools/install.mjs install CHEMIN_HOTE
node tools/install.mjs upgrade CHEMIN_HOTE
node tools/install.mjs rollback CHEMIN_HOTE
node tools/install.mjs uninstall CHEMIN_HOTE
```

Consulter `node tools/install.mjs` pour les actions prises en charge. Ne pas installer sur un hôte modifié sans sauvegarde indépendante. Les fichiers modifiés, supplémentaires et liens symboliques sont refusés. L’upgrade de la véritable archive 0.7 et le rollback exact sont vérifiés sur un hôte temporaire, jamais sur une production.

## Périmètre

Tous les lieux du module sont inventoriés ; les principales familles du jeu d’origine sont représentées sous une forme condensée. **Ce n’est pas chaque pièce du jeu commercial, ni un plan officiel, ni l’ensemble de ses DLC commerciaux.** Les vues sont des projections locales, les raccords inter-salles sont abstraits et la carte globale n’est pas à l’échelle.

Graphismes vectoriels stylisés, pas photoréalisme. 155 SVG précédents inchangés, façades/sols supplémentaires dessinés par le moteur. Aucune fusion au moteur Tantalus, aucun push GitHub et aucun déploiement Vercel. Aucun contenu officiel extrait ni doublage commercial fourni.
