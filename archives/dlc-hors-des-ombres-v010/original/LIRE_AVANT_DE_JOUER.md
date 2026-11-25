# ALIEN — HORS DES OMBRES · V0.10.0
## Le Marion, pièce par pièce

Livraison cumulative locale du 29 septembre 2026, à partir de la V0.9 « À bout de bras ». Ce dossier contient le DLC autonome et ses sources, pas le projet Tantalus Frontier complet. Le roman de Tim Lebbon et sa dramatique ne sont pas reproduits intégralement : la géométrie est reconstruite et les graphismes sont vectoriels procéduraux provisoires.

## Lancer

Extraire le ZIP, puis ouvrir `JOUER_HORS_DES_OMBRES.html`. Le document contient code, données et styles et ne télécharge pas de bibliothèque distante. Le lancement par double-clic est prévu, mais **non certifié dans l’environnement de livraison** : Chromium y refuse les navigations fichier et HTTP (`ERR_BLOCKED_BY_ADMINISTRATOR`).

Autre méthode : Node.js 20 ou supérieur, sans dépendances à installer.

```sh
npm run serve
```

Ouvrir `http://127.0.0.1:4173`. Le serveur écoute uniquement la boucle locale. Ce n’est pas une publication. Ses réponses sont testées séparément par Node. Les vérifications graphiques utilisent Playwright/Chromium, le HTML chargé par `set_content` et un double de `localStorage` explicitement en mémoire. La persistance native après fermeture du navigateur n’est pas certifiée. Aucun contournement des restrictions de navigation n’est fourni.

## Trois pièces pour un amarrage cohérent

Le trajet direct hangar–Samson devient : **hangar → vestibule d’embarquement → sas d’amarrage → bras du Samson → navette → cockpit**. Les trois pièces sont parcourables, les raccords réciproques et soumis à leurs conditions de chapitre. La rencontre du chapitre 5 est déplacée de la soute vers le vestibule.

L’existence de ces fonctions est attestée dans l’extrait autorisé référencé F02. Leurs dimensions, positions exactes, plans, textures et fenêtres sont des reconstructions, pas des plans officiels. Le vestibule, le sas et le bras ont des habillages distincts, respectivement salle d’accueil, chambre technique et corridor d’amarrage.

Les 104 extrémités possèdent un ancrage architectural. Les vantaux sont adossés à la paroi ; les accès avancés disposent de retours de cloison reliés au fond. Les coordonnées des seuils désignent leur point d’approche praticable devant le vantail, pas un panneau posé au milieu de la circulation. Les 182 retours physiques sont partagés par le dessin, les collisions, la vision, les détours et le plan. Les ouvertures organiques gardent leurs nervures plutôt que de recevoir des cadres métalliques.

## Les outils miniers

**U** ouvre la dotation. **1 à 5**, rangée supérieure, sélectionnent un outil récupéré. **F** l’utilise. Les touches physiques de la rangée supérieure sont reconnues aussi sur un clavier AZERTY. Le bouton U du HUD permet la sélection tactile.

| Touche | Outil | Utilisation de cette version | Provenance |
|---|---|---|---|
| 1 | Torche à plasma | Préparation narrative conservée, courte portée, recul et brûlure ; carburant limité | Présence primaire F02 ; valeurs originales |
| 2 | Pic à sable | Frappe courte, réutilisable ; une approche de l’adulte expose au sang acide | Présence primaire F02 ; maniement simplifié |
| 3 | Charge thumper | Six charges au râtelier, trois impacts pour un adulte dans cet équilibrage | Présence primaire F02 ; modèle et valeurs originaux |
| 4 | Filet à âme métallique | Deux filets, immobilisation de quatre secondes | F02 ; **lancer individuel original**, pas la chorégraphie du grand filet fixé |
| 5 | Projecteur d’acide minier | Trois charges, jet de courte portée | Attestation **secondaire** F03 ; vérification directe encore requise |

Le râtelier du vestibule se récupère avec E à partir du chapitre 4. Il donne pic, thumper et filets. Le projecteur se récupère dans les réserves de la concession à partir du chapitre 8. Les deux dotations sont finies ; le panneau ne donne pas gratuitement les outils et les casiers ne se remplissent pas à nouveau.

Un équipier dans l’axe retient le tir sans dépenser de charge. Les parois et les meubles bloquent les jets et projectiles ; le premier contact est pris en compte. Porter Ripley, une cellule ou l’enregistreur, prendre un chariot, se cacher ou lire empêche l’utilisation. Les outils autres que la torche demandent un nouvel appui F après relâchement ; maintenir F ne vide pas leurs réserves.

Les blessures d’adulte produisent une flaque corrosive temporaire de sept secondes ; marcher dedans peut blesser. Les cadavres et les réserves sont conservés à la reprise. Ces valeurs sont un équilibrage de jeu, pas une simulation de chimie ou des caractéristiques canoniques.

**Tous les équipements du roman ne sont pas déclarés présents.** Le registre externe et le panneau « Repères de fidélité » distinguent 18 éléments utilisables, contextuels, reconstruits ou non simulés. Les explosifs restent contextuels. La combinaison pressurisée détaillée et sa réserve respirable ne sont pas simulées.

## Personnages et fidélité

Dix profils civils possèdent leurs vêtements, gabarits et coiffures. Les portraits d’équipage appellent le même dessin humain que le terrain. Les poses de blessure se déclenchent d’après la progression. Welford et Powell sont présents dans le vestibule avant l’événement de perte ; ils ne réapparaissent pas après. Ash n’est pas ajouté comme ennemi physique et Jones conserve sa représentation distincte.

Les teints, coupes, tailles et couleurs non documentés sont **provisoires**, pas des descriptions officielles. Aucune ressemblance avec un comédien vocal n’est déduite de la distribution. Les morts individuelles, les quatre adultes et la décompression de la scène du vestibule ne sont pas intégralement chorégraphiés. Cette passe ne certifie ni tous les lieux, ni tous les objets, ni les apparences en 1:1.

Consulter `docs/AUDIT_FIDELITE_V010.json` et `docs/CODEX_LEVEL_DESIGN.html` : 41 plans, 52 liaisons et leurs conditions, 18 équipements, 10 profils, quatre sources et six domaines de manque. Les annexes originales restent explicitement distinguées du récit.

## Commandes conservées

ZQSD / WASD / flèches : marcher et changer de profondeur. Maj : courir. C : s’accroupir. E maintenu puis relâché : action. F : outil sélectionné. R : leurre sonore original au jeu. H : ressource de secours fictive. L : lampe. G : compagnon suivre / attendre. B maintenu : verrou. V maintenu : écouter sans pause. X maintenu + directions : chariot. M : plan. J : carnet. K : services. I : maintenance. N : manutention. O : relevé des échangeurs. T : poser l’enregistreur. P : chapitres et séquences. Échap : pause / fermer la lecture.

Menus et établis suspendent le monde ; réparation, manutention, pompage, action locale et écoute le laissent avancer. Les fonctions sont accessibles depuis la pause ou les boutons tactiles. Aucune manette n’est certifiée.

## Sauvegardes et mémoires

Clé principale inchangée : `atf:mire:out-of-shadows:v1`. **Schéma courant 10 ; schémas 1 à 10 acceptés.** Trente-six instantanés réellement extraits des anciennes archives V0.1–V0.9 sont inclus dans `qa/fixtures`, avec provenance et empreintes.

Exporter `CARNET_MARION.json` ou les mémoires complètes avant de déplacer ou remplacer l’ancien fichier. Un changement de chemin ou d’origine peut changer l’espace de stockage. La copie avant migration est tentée sous `:backup-before-v10`. Le point de reprise reste `:checkpoint-v2` ; répétition et entrées gardent leurs clés historiques séparées.

Les nouveaux carnets conservent dotations récupérées, sélection, charges, vie des ennemis, filets temporaires, flaques et corps. Les identifiants inconnus, durées et quantités incohérentes sont filtrés. Les touches, gestes partiels et fenêtres ne se reprennent pas automatiquement. Les positions des chariots restent indépendantes entre campagne et répétition.

`MEMOIRES_MARION_V08.json` reste le nom du format de collection, même lorsqu’il transporte un carnet de schéma 10. Ce paquet ne fabrique aucune ancienne entrée de chapitre absente. L’import complet demande confirmation et tente de restaurer l’ancien contenu en cas d’erreur d’écriture, sans garantie contre une panne permanente ou plusieurs onglets concurrents.

## Raccordement réversible à une copie du projet hôte

La cible doit être une **copie** du package `aliens-tantalus-frontier` contenant Opérations, jamais le dossier du DLC.

```sh
node tools/install.mjs "/chemin/vers/tantalus" --check
node tools/install.mjs "/chemin/vers/tantalus"
# Pour une installation enregistrée :
node tools/install.mjs "/chemin/vers/tantalus" --upgrade --check
node tools/install.mjs "/chemin/vers/tantalus" --upgrade
# Retrait :
node tools/install.mjs "/chemin/vers/tantalus" --uninstall
```

Le journal et les empreintes sont vérifiés. La copie antérieure est gardée dans `.dlc-backups/alien-out-of-shadows-v1/before-v10` ; les modifications inattendues sont refusées. Le raccord ajoute une carte Opérations et sept fichiers séparés, **sans fusion native GameEngine / SaveSystem / MIRE**. Il est vérifié sur des projets de test, pas sur le dernier hôte complet. Aucun push GitHub ni déploiement Vercel.

## Reproduire les tests

```sh
npm run build
npm run check
# Python + Playwright + Chromium :
npm run check:browser
# Après les résultats, Python :
npm run docs
python qa/verify-documents-v010.py
python tools/package-release-v010.py
```

`qa/RESULTATS_QA_V010.json` donne les totaux réellement exécutés et leurs empreintes ; les résultats nommés v02 à v09 sont des suites de non-régression réexécutées, pas des totaux anciens additionnés. L’audit des documents est séparé. `qa/EVOLUTION_TESTS_V010.md` explique les adaptations de contrats (version, nouvelles pièces, lieu du combat et copie avant migration).

Les dix parcours moteur connaissent les routes et les solutions. Les deux plus complets visitent les 41 pièces, terminent 48 objectifs, trois réparations, huit interventions et six manutentions, avec 99 transitions. Ils ne sont pas des playtests humains. Les scènes de combat spécifiques aux nouveaux outils sont des fixtures séparées, pas une mesure de difficulté de la campagne.

Les images du rapport sont des captures du jeu exécuté, avec légendes distinguant les placements préparés des commandes jouées. Art définitif, descriptions complètes du roman, chorégraphies individuelles intégrales, stockage natif et intégration au dernier hôte restent à compléter ou vérifier.
