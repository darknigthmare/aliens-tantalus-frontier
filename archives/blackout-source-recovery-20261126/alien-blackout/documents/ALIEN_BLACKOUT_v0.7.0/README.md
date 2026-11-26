# ALIEN: BLACKOUT — Mendel, plans de contrôle
## 0.7.0 · livraison locale non officielle

Module jouable autonome qui poursuit la v0.6.0. Pas une archive du jeu principal Tantalus, pas une fusion MIRE/SaveSystem et pas une reproduction 1:1. Aucun push GitHub ni déploiement Vercel effectué.

## Lancer et reprendre

Ouvrir `JOUER_ALIEN_BLACKOUT_v0.7.0.html`, ou `LANCER_BLACKOUT.cmd` sous Windows. Le HTML contient les scripts, styles et graphismes ; aucune ressource distante n’est nécessaire. L’option d’un serveur local reste possible : `python3 -m http.server 8000` depuis ce dossier, puis ouvrir `http://localhost:8000/index.html`.

Cette livraison a été exécutée dans Chromium à partir du HTML exact par `set_content`, après refus de navigation locale dans l’environnement de test. Le double-clic Windows et le stockage natif persistant ne sont pas certifiés ici. Conserver des exports JSON indépendants du navigateur.

Système → Importer JSON accepte les exports v0.1 à v0.6. Une restauration commence en pause. Les chemins locaux sont recalculés pour les nouvelles projections ; importer une v6 n’ajoute pas de ressources. Le slot courant est `tantalus.dlc.blackout.save.v7`. Effacer le slot v7 laisse les anciens intacts. Conserver l’ancien JSON pour un éventuel retour de programme : un export v7 ne se convertit pas automatiquement vers v6.

## Changements principaux

Les 56 pièces conservent leurs identifiants. Les 23 pièces avec porte avant/arrière mais projection latérale passent en profondeur physique : 4 SIDE / 52 DEPTH. Les 66 cloisons ont 132 faces testées, des parois d’appui et des seuils réciproques. Les 21 gaines restent réservées aux Aliens. Les six raccords entre secteurs restent des transitions après objectifs, pas un monde continu.

La carte du poste et l’atlas MENDEL / F3 emploient le même graphe orthogonal. Dans l’atlas, les portes de la liaison courante sont actionnables ; les autres secteurs restent en lecture. Ouvrir un plan ou consulter une caméra ne téléporte personne. Les fiches de salle montrent obstacles, seuils et postes.

Pharmalab reçoit quatre familles de culture fongique, mycélium et traitement de l’air, pour quatorze nouveaux placements. Total : 41 familles / 703 placements. Studwick est corrigé en ingénieur, Thorncroft en scientifique, avec les spécialités correspondantes. Les cinq silhouettes restent provisoires : aucun portrait officiel 1:1 revendiqué.

Le registre distingue seize entrées d’équipement, cinq identités, dix sources et onze écarts ouverts. Les armes à feu portatives ne sont pas confirmées dans les références consultées ; aucun équipement d’un autre épisode n’est ajouté en le présentant comme officiel Blackout. Soins, portage, balises et deux Aliens en fin de campagne restent des extensions Tantalus.

## Commandes et fonctionnalités conservées

Utiliser les boutons du poste ; la liste de commandes intégrée reste la référence. 1–4 sélectionnent un équipier ; les flèches déplacent le personnage en contrôle direct. Espace scelle le refuge. F2 ouvre le codex, F3 l’atlas. La préparation des files et des secours suspend la simulation. Les cloisons, soins, balises et ressources obéissent aux règles précédentes ; l’atlas ne les rend pas gratuits.

La campagne conserve 21 interventions principales avec réglage manuel ou assistance, 21 services facultatifs, mémoire des contacts, incidents, blessures, secours, casiers fouillés, trois balises pour la campagne et une fuite latérale finale d’Amanda. La durée et l’équilibrage ne reproduisent pas les niveaux originaux 1:1.

## Vérifications de cette version

3 289 invariants de construction ; 309 nouveaux tests comportementaux ; 206 contrats hérités sur le moteur v7 complet ; 27 tests d’installateur ; 343 contrôles Chromium du programme et de son atlas. Les résultats JSON sont dans `qa/`.

Matrice : 16 parcours, neuf victoires et sept défaites, 406 restaurations acceptées. Un transport puis réanimation a abouti dans une campagne Cauchemar gagnée avec trois survivants. Le parcours Chromium distinct termine en Survie avec quatre survivants, 21 réglages manuels, zéro assistance, trois balises et la fuite achevée ; aucun portage dans ce parcours navigateur. Les scènes préparées ne sont pas des victoires. Le pilote agit plus vite qu’un joueur en découverte.

## Documents

`RAPPORT_VISUEL_ALIEN_BLACKOUT_v0.7.0.html` : réalisation, 114 captures, sources et limites.

`CODEX_ALIEN_BLACKOUT_v0.7.0.html` : 271 fiches recherchables et plans des 56 pièces, plus registre documentaire complémentaire.

`docs/REGISTRE_FIDELITE_V7.json` : statut des sources, personnages, équipements et écarts. `docs/KNOWN_LIMITS.md` : travaux encore ouverts vers le 1:1.

## Installer un accès dans une copie locale de Tantalus

L’installateur requiert Node 20 ou supérieur. Il ne fusionne pas les moteurs. Depuis ce dossier :

```sh
node tools/install.mjs --target /chemin/vers/copie-tantalus
node tools/install.mjs --target /chemin/vers/copie-tantalus --apply
```

La première commande prévisualise sans écrire. Pour une ancienne installation intacte, ajouter `--upgrade` ; pour revenir à la copie précédente, `--rollback --apply`. Les fichiers modifiés, liens symboliques et dossiers contenant des fichiers non reconnus sont refusés. Voir `docs/INTEGRATION.md`.

## Reproduire les contrôles

Node >=20, Python3 ; les tests navigateur nécessitent Playwright et Chromium. Aucun `node_modules` n’est requis par le jeu.

```sh
npm run build
npm test
npm run campaign:matrix
npm run test:browser
npm run docs
npm run test:documents
npm run manifest
npm run verify
```

`qa/pilot-v6.js` est volontairement conservé : sa politique est réutilisée sur la classe finale v7. Les fichiers `compat/` contiennent de véritables anciens programmes et exports pour tester les migrations. Ils ne sont pas la version courante à lancer.
