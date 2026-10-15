# Frontier Forge V136 — contrôle de compatibilité, versions et sauvegardes

Cette passe complète V135 sur la branche `feat/frontier-forge-editor-v130`. Le moteur publié reste celui du test **de la salle active**. Ni les transitions V131/V132, ni le nouvel adaptateur de correction du moteur préparé localement pendant V136 ne sont publiés ici : l’envoi de ce dernier a été bloqué. Cette livraison GitHub contient les outils et les protections décrits ci-dessous, pas cet adaptateur.

## Un défaut réel, protégé avant le lancement

Une salle Mission de 128 × 72 dont les blocs se trouvent dans les dernières lignes peut être valide dans l’éditeur puis entièrement ignorée par le compilateur natif limité à 64 × 36. Le moteur démarre alors son niveau par défaut. La régression reproduit 131 blocs source et zéro bloc compilé. Le nouveau contrôle **refuse le lancement de ces plans** avec une explication ; il ne prétend pas avoir augmenté les capacités de ce moteur.

L’édition, la construction, la sauvegarde et l’export des grands plans restent disponibles. Vaisseau conserve son propre compilateur 128 × 72. Les dimensions physiques restent 6 200 × 1 080 en Mission et 5 120 × 720 dans Vaisseau. Augmenter la grille ne change pas la taille du monde.

## Atelier « Contrôle & versions »

Le contrôle montre les volumes techniques de la salle active : insertion, surfaces, cloisons, portes et dangers. Il applique les dimensions du moteur correspondant et, pour les plans compatibles, la position native des surfaces, y compris le décalage d’une demi-case des plateformes Mission existantes. Ce n’est pas un aperçu des assets finaux.

L’insertion est contrôlée avec le rectangle de l’acteur : 42 × 92 en Mission, 44 × 92 dans Vaisseau. Les bords, obstacles, dangers et supports sous toute la largeur des pieds sont examinés. L’analyse ne simule ni la marche, ni les sauts, ni l’IA ; elle ne certifie pas l’accès à l’objectif. Sur un plan dépassant la capacité du compilateur, l’erreur bloque le test et les volumes indiquent la disposition demandée, pas un résultat de compilation réussi.

Les pertes silencieuses connues sont bloquées : dimensions Mission supérieures à 64 × 36, plus d’un objectif, plus de deux terminaux ou plus d’un véhicule en Mission ; tout véhicule en Vaisseau ; plus de 128 marqueurs de menace pour le test. Plusieurs objectifs/terminaux Vaisseau restent admis lorsque le moteur les instancie.

Les avertissements expliquent les limites restantes : calques décoratifs non chargés, autres salles non testées, conduit isolé, choix de menace dépendant du catalogue, extension des échelles Mission sur quatre cases par marqueur, ascenseurs cycliques en Mission et accès verticaux plutôt que cabines mobiles en Vaisseau. Les objectifs Vaisseau gardent leur validation par contact.

**Le scénario Mission de référence et les événements de crise du hub ne sont pas neutralisés par le code de cette PR.** Le rapport le signale explicitement. L’admission des volumes n’est donc pas une garantie que toutes les conditions de fin soient satisfaisables. Le correctif natif local traite ce point mais n’est pas intégré à cette branche.

Cliquer un diagnostic cadre son bloc. Les diagnostics se filtrent par gravité et s’exportent en JSON avec les volumes et le rapport complet. Le bouton de test existant passe par cette admission avant d’appeler le code de l’application. Un refus ouvre le panneau de contrôle sans changer le projet. Ce garde-fou est celui de l’éditeur ; un appel direct à l’ancien moteur, hors éditeur, conserve ses anciennes limites.

## Versions nommées des documents

Créer une version conserve le document entier — salles, calques, repères et liaisons — sous un nom. La liste permet de comparer, exporter les différences, supprimer après confirmation ou **restaurer en copie**. La restauration crée un projet avec un nouvel identifiant ; elle ne remplace ni la version source ni le projet courant. Le changement exige l’enregistrement du travail courant.

La comparaison se fait sur les identifiants des salles, blocs et liaisons. Elle distingue ajouts, suppressions et changements de champs, avec les anciennes et nouvelles valeurs. Ce n’est pas un rapprochement sémantique de formes : supprimer puis recréer un bloc sous le même identifiant peut être présenté comme un changement. Les versions ne contiennent **pas** la progression du test, les munitions ou l’état d’une campagne.

Stockage séparé : `atf-forge-document-versions-v136`. Format d’échange `frontier-forge-versions`, version 1. Maximum 32 versions et 8 Mio de JSON normalisé pour l’ensemble ; le quota réel du navigateur peut être inférieur. Aucune version n’est évincée automatiquement pour faire de la place. Exportez et retirez explicitement une version lorsque la limite est atteinte.

L’import ajoute des copies après validation stricte, avec de nouveaux identifiants. Il ne remplace pas les versions existantes. Une lecture devenue obsolète à cause d’une modification du projet ou de la bibliothèque est refusée. Les données illisibles sont protégées et peuvent être exportées telles quelles. Un échec de stockage conserve l’état précédent en mémoire et sur disque, sans annonce de réussite. La détection de conflit est optimiste : aucun verrou atomique entre onglets n’est annoncé.

## Sauvegarde et gestes

Une sauvegarde sans changement ne réécrit plus l’espace de travail et n’écrase pas sa copie de secours avec des données identiques. Une écriture principale échouée conserve aussi les octets de la sauvegarde secondaire. La copie secondaire reste best-effort après réussite de l’écriture principale : son échec n’annule pas une écriture principale réellement réussie.

Ctrl/Cmd + S pendant un trait annule le geste non terminé avant l’enregistrement. Cela évite de sauvegarder un demi-trait ensuite annulé seulement en mémoire. Changer d’outil au clavier interrompt également le geste avant le nouvel outil. Un pointeur explicitement secondaire ne démarre ni dessin ni pose d’assemblage. Les plateformes ne découpent plus les calques inférieurs par un effacement local du canvas. La suppression groupée utilise des ensembles d’identifiants sans modifier les verrous et l’annulation.

## Vérification reproductible

```sh
npm run test:forge
npm run test:forge:native
node --test scripts/verify-player-runtime-v124.mjs scripts/verify-player-field-actions-v124.mjs scripts/verify-player-incapacitation-v128.mjs scripts/verify-weapon-runtime-v124.mjs scripts/verify-weapon-effects-v124.mjs
python scripts/verify-forge-browser-v136.py --output /tmp/forge-v136-browser
FORGE_QA_OUTPUT=/tmp/forge-v136-shell python scripts/verify-forge-shell-v136.py
```

Avant publication : 358 tests d’édition, 8 tests de concordance avec les compilateurs natifs **inchangés**, 78 régressions ciblées ; suites Chromium de l’éditeur 39 + 56 + 44 + 52 + 40 ; scénario de l’application 23 contrôles. Les huit tests natifs reproduisent aussi la limitation de la référence et vérifient que l’admission refuse ce lancement. Ils ne doivent pas être présentés comme une réparation native ou une validation des transitions.

Les tests Node importent les vraies classes GameEngine/HubGame, avec DOM, images et RAF substitués. Les contrôles Chromium locaux utilisent le harnais hors réseau car la navigation HTTP locale est bloquée ; stockage mémoire et médias absents sont substitués. Le workflow GitHub garde son chemin HTTP et le stockage natif Chromium pour les suites de l’éditeur. Les résultats GitHub définitifs sont indiqués dans la PR après exécution.

Le scénario de l’application utilise les boutons réels, le lancement Mission/Vaisseau, E, Échap et le retour au même document. Il vérifie l’activation d’un terminal et le refus d’une grille trop grande ; il ne prétend pas terminer le scénario Mission de référence. L’acteur est placé devant le terminal pour tester E : ce n’est pas une traversée manuelle complète. Le modèle de campagne est comparé avant/après et les méthodes de gameplay ne sont pas remplacées. Les captures sont des vues techniques, pas une validation artistique.

## Chantiers ouverts

Pas de transitions natives multi-salles, de scripts de dialogue/événements, de choix libre d’assets, de cloud Forge ou de sauvegarde de progression du test. Les versions nommées sont des documents d’édition uniquement. La correction native des grands plans, échelles, ressources héritées et conditions de fin est disponible dans le candidat local séparé, non dans ce code publié.

Le build complet avec tous les médias, les régressions globales, la PWA à froid et mise à jour, les lecteurs d’écran et le matériel cible restent à vérifier. Les nouveaux fichiers sont inscrits au préchargement, sans certification d’installation PWA complète. Les archives contiennent les sources et une partie des médias, pas une livraison intégrale du jeu.
