# Qualification locale — 0.8.0-candidate.1

Les suites ci-dessous ont été réellement achevées sur les fichiers livrés. Les anciens chiffres sous history/ ne qualifient pas cette version. Les groupes et assertions ne désignent pas autant de sessions humaines.

HTML de jeu courant : SHA-256 `53cafebbf4a43b9c2cf6d406452a7b491ac818c7f47bc5d40b21eef13dde83b7`. Le résultat QUALIFICATION_MODEL.json lie les exécutions Node à l’empreinte de chaque fichier source. Les trois sessions navigateur portent l’empreinte du HTML final.

| Suite exécutée | Résultat | Portée |
|---|---:|---|
| core.cjs | 96/96 | État, progression, collisions, codec |
| colony.cjs | 75/75 | Tableaux, cachettes, soudures, escortes |
| exploration.cjs | 149/149 | Géométrie, détours, visée, mémoire |
| passages.cjs | 118/118 | Raccords, écoute de seuil, détecteur |
| persistence.cjs | 18/18 | MemoryStorage simulé, pas stockage natif certifié |
| life.cjs | 141/141 | Habitants, coffres, ateliers, balises |
| defense.cjs | 121/121 | Volets, alarmes, contournements, tirs |
| ducts.cjs | 112/112 | Transferts et propriété unique des adultes |
| mobility.cjs | 91/91 | Conduite, volume du châssis, entretien, dégâts, restrictions et migrations |
| installer.mjs | 28/28 | Projets hôtes de test, conflits et restauration |
| upgrade-real.mjs | 4/4 | Vrais fichiers et installateur 0.7 → 0.8 sur un shell de test |
| browser-v08.py A | 13/13 | Début au clavier, vrai export 0.7, cabine et commandes |
| browser-v08.py B | 12/12 | Conduite, jonction réelle, vrai export roulant, stationnement et carte |
| browser-v08.py C | 10/10 | Entretien fini, attaque, deux vrais exports et formats à 130 % |

**Modèle : 921/921. Navigateur courant : 35/35.** Aucune erreur JavaScript de page dans les trois recettes achevées. Les 12 captures correspondent au HTML courant. Les anciens 47 contrôles navigateur 0.7 ne sont pas additionnés comme s’ils avaient été rejoués.

| Pilote depuis une nouvelle partie | Résultat | Couverture |
|---|---:|---|
| traversal.cjs | 6/6 | Campagne principale et escortes |
| traversal-exploration.cjs | 6/6 | Ajoute six détours et leurs passages aller/retour |
| traversal-life.cjs | 6/6 | Ajoute habitants, conversations, réserves et fabrication |
| traversal-defense.cjs | 6/6 | Ajoute volets et avertisseurs accessibles tôt |
| traversal-ducts.cjs | 6/6 | Ajoute les dix grilles techniques |
| traversal-mobility.cjs | 6/6 | Ajoute conduite, trois passages routiers et une recharge avant de terminer le parcours |

## Ce que les 36 parcours prouvent

Chaque famille contient les deux présentations et les trois difficultés. Les pilotes marchent et conduisent avec Simulation.update, les commandes, les ressources et les solutions disponibles dans le jeu. Ils n’injectent pas de réussite d’objectif, ne téléportent pas le personnage et ne réécrivent pas sa santé. L’assistance de début de chapitre reste active. Les minuteries du modèle sont avancées par ses pas de simulation, pas par une attente humaine.

Le nouveau tour prépare le tracteur par l’objectif existant, rejoint la piste à pied, embarque, roule vers le plateau, revient à la piste, descend et recharge à la borne, remonte et retourne au plateau. Il termine ensuite les 49 objectifs, les deux escortes, les six détours et les activités héritées. Les trois passages sont des jonctions discrètes entre deux vraies pièces, pas un monde routier continu. Le pilote connaît les itinéraires ; ses chronomètres ne donnent ni durée de découverte humaine ni difficulté finale.

Les dégâts de châssis, les collisions rapides, l’occupation de la sortie, les interdictions de Newt ou des compagnons, les pannes et les stocks finis sont éprouvés séparément dans mobility.cjs avec des états localisés préparés. Le tour précoce de conduite ne prétend pas avoir éprouvé chaque rencontre sous une menace tardive.

## Navigateur et captures

Le CLI agent-browser est absent. La tentative HTTP locale conservée dans SMOKE_V08.json a renvoyé net::ERR_BLOCKED_BY_ADMINISTRATOR. Playwright charge le HTML exact par set_content dans l’origine opaque autorisée, sans changement d’origine ni contournement de politique. Les boutons, le clavier et le sélecteur de fichiers ordinaires sont employés ; la simulation, la santé, les positions et les objectifs ne sont pas réécrits pendant ces interactions navigateur.

La session A commence une partie neuve puis valide le premier objectif au clavier. Les autres états ciblés sont des fixtures préparées, validées et importées par le menu. La session B conduit réellement sur la piste puis utilise le vrai seuil routier, descend, vérifie le stationnement et le mode classique. La session C répare, recharge, interrompt un service et observe un adulte attaquer la coque. Les formats 390×844 et 844×390 à 130 % sont des tailles émulées : aucun téléphone ou appareil tactile matériel, Safari/iPhone ou contrôleur physique n’est certifié.

Les attentes utilisent l’état observable ou le temps de simulation normalement écoulé. Trois sessions séparées bornent les ressources. Les anciennes recettes navigateur sont conservées comme sources d’historique, mais leurs rapports ne sont pas présentés comme les résultats courants. Les captures initiales de smoke ont été exclues de la galerie et du paquet final.

## Persistance : fichiers réels et protocole simulé

Les sept fichiers real-v01-save.json à real-v07-save.json proviennent des livraisons correspondantes, pas d’états courants renommés. La 0.7 est son véritable export d’un adulte en transfert de gaine. Ses identifiants, sa santé et la progression sont comparés après import ; les minuteries continuent normalement une fois le jeu repris.

Les véritables téléchargements browser-v08-driving.json, browser-v08-serviced.json et browser-v08-damaged-hull.json sont relus puis importés par le menu. Vitesse et conducteur persistent sans seconde montée ; les stocks d’entretien consommés et les dégâts de coque ne sont pas remis à neuf. Un travail de montée ou de réparation interrompu n’attribue aucun bénéfice ni débit.

Les deux copies locales sont vérifiées avec MemoryStorage simulé. Le stockage natif après fermeture, ses quotas, plusieurs onglets simultanés et le mode privé demeurent non qualifiés. La réussite de l’import/export ne prouve pas ces comportements.

## Corrections issues des essais

Une ancienne position à pied pouvait recouvrir le nouveau stationnement. La migration déplace désormais le nouveau tracteur vers un emplacement libre, jamais l’ancien personnage. Un coffre/borne ne prélève pas de réserve à pleine santé ou batterie. L’ancien accroupissement est effacé à la montée et C ne garde plus le frein verrouillé en cabine. Le HUD de combat s’efface pendant la conduite, puis revient après descente. Les copies décoratives de véhicule ont été remplacées et le numéro 01 ne s’inverse pas avec l’orientation.

La première assertion de test de migration cherchait à tort la propriété transfers au lieu de transits dans le format de gaines hérité : le test a été corrigé et toute la session A rejouée. Les résultats finaux des trois sessions correspondent au dernier HTML, après les corrections de commandes et de décor.

## Livraison et limites

L’installation et le retour arrière emploient des shells de test. Le vrai payload 0.7 et son installateur y sont utilisés pour la montée de version ; aucun build du Tantalus natif n’est revendiqué. Les contrôles de reconstruction et ceux du rapport sont séparés des totaux de gameplay.

Un seul véhicule, deux pièces pilotables, pas de véhicule pour Newt ou de siège compagnon. Mode classique avec stationnement arrière discret, pas stationnement latéral physique. Pas d’écrasement ni de tourelle. Panne loin d’une borne : sortie et continuation à pied, pas remorquage. Les raccords verticaux restent bornés, les gaines ne simulent pas tous les adversaires hors champ. Aucun test humain de difficulté, de durée ou de performance matérielle.

DLC autonome avec lanceur additionnel, pas le jeu Tantalus complet ni son GameEngine natif. Aucun push GitHub ni déploiement Vercel. Dessins stylisés par code provisoires, pas atlas définitifs ou reconstitution 1:1. Roman intégral non consulté : plans, dialogues, tâches et documents sont une condensation originale. L’écho Frontière 2204 et les sauvegardes du moteur hôte ne sont pas modifiés.
