# Audit de level design — Bioforge (V188)

**Date** : 2026-11-22 · **Base** : `7989c757` · **Demande du propriétaire** : « dans le jeu, améliorer la Bio Forge — le level design est mal fait, regarde par toi-même ».
**Périmètre** : le laboratoire de spécimens `bioforge-experimental-level-v80` (`src/bioforge-level-v80.js`, `bioforge-runtime-v80.js`, `bioforge-session-v80.js`, `bioforge-ui-v80.js`, `bioforge-assets-v80.js`, `bioforge-physical-state-v87.js`, `bioforge-admissions-v132.js`, `bioforge-tactics-state-v132.js`) et son accès depuis le hub (annexe `bioforge` de la Quarantaine). La Frontier Forge (fichiers `forge-*` gelés par `AUDIT_DEFERRED_FORGE_SOURCES_V162/V163`) est hors périmètre : aucun fichier Bioforge ne figure dans ces listes.
**Spécification de la refonte** : `specs/013-bioforge/`.

## 1. Méthode

Parcours réel dans Chromium (Playwright existant, serveur `scripts/dev.mjs` sur un port dédié), à 1366×768 et 390×844.

- **Fixture déclarée** : `createDefaultSave()` avec `needsPlayerCreationV84 = false`, `scene = 'hub'` et `hub = { deck: 2, roomId: 'quarantine', positionX: 1500 }`, importée par le bouton d'import de sauvegarde du menu Options.
- **Entrée par le hub (entrées réelles)** : touches D/A jusqu'à la porte d'annexe de la Quarantaine, E (« ENTRER DANS ACCÈS BIOFORGE »), marche jusqu'à la station « Contrôle du sas BIOFORGE », E. La vue `bioforge` s'ouvre.
- **Entrée directe** : seul le crochet QA `__ATF_BIOFORGE_V80__.open()` existe ; le rail de navigation n'a pas d'entrée Bioforge (c'est voulu : l'accès est physique).
- **Parcours du niveau** : bouton « LANCER LE CYCLE » (composition par défaut : 1 Drone Big Chap), puis clavier uniquement : marche, E au SAS A, E à l'interlock, E à l'imprimante, entrée dans l'arène, tir maintenu (F) jusqu'au résultat, tentative de marche vers le sas de retour.
- Les globales du runtime sont **observées** (position, phase, portes) ; aucune position ni aucun état n'est injecté pendant le parcours.
- Captures conservées hors dépôt (dossier de travail de la session) ; erreurs de page et de console : **0**.

## 2. Ce qui existe

| Salle (`id`) | x (px) | Largeur | Contenu jouable | Ce qu'on voit |
| --- | --- | --- | --- | --- |
| `control-room` « SALLE DE CONTRÔLE » | 0–440 | 8,6 m | apparition de l'opérateur ; station `bioforge-control` (non interactive) | le même décor de cuves géantes que partout |
| `airlock-inner` « SAS A » | 440–670 | 4,5 m | porte `control-seal`, E | idem |
| `airlock-outer` « SAS B » | 670–920 | 4,9 m | porte `inner-interlock`, E | idem |
| `printer-bay` « BAIE D'IMPRESSION » | 920–1280 | 7,1 m | imprimante (E arme le cycle) | imprimante 180 px |
| `containment-arena` « ARÈNE DE CONFINEMENT » | 1280–2460 | 23,1 m | combat, 12 emplacements d'apparition (6 au sol, 6 sur deux passerelles à y = 470), deux échelles | décor de cuves |
| `return-lock` « SAS RETOUR » | 2460–2880 | 8,2 m | consoles `bioforge-purge` et `bioforge-return`, zone `returnTrigger` | décor |

Échelle : 1 m = 51 px, marine 44×92 (corps physique 42×92), sol à y = 620, plafond logique à y = 84 (536 px ≈ 10,5 m de hauteur partout). Monde 2880×720, caméra horizontale qui place l'opérateur au tiers gauche.

## 3. Constats (liste de contrôle d'AGENTS.md et lisibilité)

Gravité : **B** bloquant pour le level design, **M** majeur, **m** mineur.

### Accès logique, passage physique, arrivée, aller-retour, reprise

1. **B — Le sas de retour est inaccessible.** Après la purge (fin de session), le moteur s'arrête (`running = false`) : les portes `arena-return` et `hub-return` passent « ouvertes », mais l'opérateur ne peut plus bouger. La salle `return-lock`, ses deux consoles et la zone `returnTrigger` ne servent jamais. Mesuré : x = 1407 avant et après une tentative de marche de 12 s vers x = 2700.
2. **B — Aller-retour incohérent.** On entre physiquement (trois interactions et une marche), on ressort par un bouton HTML « RETOUR AU HUB ». Le parcours sortie → hub n'existe pas dans le monde.
3. **M — Arrivée inerte.** Avant « LANCER LE CYCLE », la scène est une image fixe : l'opérateur ne peut pas marcher dans la salle de contrôle ni rejoindre la console. La console de contrôle n'a aucune interaction ; tout passe par le terminal HTML.
4. **m — Téléportation au scellement.** À l'entrée de l'arène, l'opérateur est replacé à x = 1350 (saut de ~60 px) et à la hauteur du sol.
5. Reprise : une fermeture de page suspend la session (purge = false) et la reprend avec l'état physique V87 et tactique V132 ; un changement de vue purge. Correct, mais la reprise d'une session en phase `return` replace l'opérateur à l'apparition (salle de contrôle), d'où il ne peut que repartir par le terminal.

### Portes et architecture visible

6. **B — Les portes ne correspondent pas à l'architecture.** Chaque porte est un collisionneur de 40×536 px (sol → plafond logique), mais l'image du sas fait 180×180 px posée au sol. Au-dessus de 3,5 m, rien de visible ne bloque : c'est un mur invisible. Aucune cloison ne sépare les salles.
7. **M — Les salles ne se distinguent pas.** Le plan intermédiaire est une même image de 1920 px répétée sur 2880 px (raccord visible à x = 1920) : salle de contrôle, sas, baie et arène montrent les mêmes cuves géantes. Les libellés des salles (`ROOMS.label`) ne sont jamais dessinés.
8. **M — Échelle.** Toutes les salles mesurent ~10,5 m de haut : un sas de 4,5 m de large sous 10 m de vide ne se lit pas comme un sas. Seule l'imprimante (180 px ≈ 3,5 m) et le sas (3,5 m) sont à l'échelle de l'opérateur.

### Collisions, zones mortes, zones inutiles

9. **B — Passerelles et échelles invisibles.** Les deux passerelles (y = 470) et les deux échelles de l'arène ne sont dessinées qu'en mode test (`drawBioforgeProceduralQaV80`). En production, un spécimen placé sur les emplacements 07 à 12 flotte à 3 m du sol.
10. **M — Passerelles hors d'atteinte de l'opérateur.** Le saut maximal est de ~109 px (645²/2·1900) et le runtime n'a pas d'escalade : les échelles ne servent à personne, les passerelles sont réservées aux spécimens sans que rien ne l'indique.
11. **m — Espace mort.** Les 4 m à gauche de l'apparition (0–160) et les 8 m du sas retour n'ont aucune fonction jouable.

### Fonction des salles (laboratoire de confinement)

12. **M — Pas de flux d'admission visible.** La composition et la file des spécimens n'existent que dans le terminal HTML ; rien dans le monde (cuves, étiquettes) ne montre ce qui va être imprimé.
13. **M — Sas biologique sans décontamination.** Les étapes SAS A → SAS B sont instantanées (E puis E). Il n'y a ni cycle, ni brouillard, ni signal.
14. **M — Fonctions absentes** : galerie d'observation, stockage froid, baie de dissection et d'analyse, incinérateur. La purge existe comme règle (état `purging`) et comme image (atlas `bioforge-purge-cycle-v80`), mais elle est affichée sur une seule image fixe (vignette 6) après arrêt du moteur.
15. **m — Accroche narrative.** La quête `ship-bioforge` « Ce qu'on garde en vie » (bible §8.2) n'a aucun code : pas de présence d'Inez ni de BISHOP-9, pas de lien avec la conservation des spécimens.

### Lisibilité, interface, cadrage

16. **M — Le HUD du canvas est masqué** par le terminal réduit (coin supérieur gauche) à 1366×768 : la consigne « REJOINDRE LE SAS A · E POUR OUVRIR » est presque entièrement couverte.
17. **M — Aucune invite dans le monde** : l'opérateur ne voit pas où appuyer sur E ; seule une ligne de HUD (masquée, cf. 16) l'indique.
18. **M — Mobile 390×844** : le canvas fait 390×219 px (marine ≈ 28 px de haut, HUD illisible) ; en configuration, le terminal recouvre le canvas et des textes du terminal se chevauchent (« AJOUTER UNE LIGNE », « TOTAL 1/48 » passent sous les boutons).
19. **m — Voile de premier plan** : calque `foreground` à 34 % d'opacité et parallaxe 1,08 sur toute la scène ; il ternit les acteurs sans donner de profondeur lisible.
20. **m — Éclairage uniforme** : aucune lumière propre aux salles, aucun changement en combat hormis le texte du HUD.
22. **M — Le « SAS B » n'est pas un sas.** Les deux portes du sas d'entrée sont `control-seal` (x 440) et `inner-interlock` (x 670) ; la salle `airlock-outer` (670–920) n'a pas de porte côté baie et s'ouvre directement sur l'imprimante. La seule chambre fermée est le « SAS A ».
23. **m — Battants hors échelle de collision.** L'atlas de sas est vu de face et couvre ~75 px de part et d'autre de chaque porte au sol : les stations de purge (x 2535) et de retour (x 2740) étaient en partie derrière les battants des portes `arena-return` et `hub-return`.
21. Ligne des pieds : correcte (pieds à y = 620, grille du décor à ~615–640). Proportions des créatures : conformes aux admissions V132 (corps issus des atlas, aucun redimensionnement).

## 4. Ce qui fonctionne et doit être conservé

- Le contrat de confinement : arène bornée (`arenaBounds` 1300–2440), murs physiques, projectiles filtrés, rapport d'isolation, purge atomique, reprise refusée si l'état est corrompu.
- Les identifiants (salles, portes, stations, emplacements d'apparition), le schéma de niveau 80, la sauvegarde `bioforgeV80` (schéma 80, runtime 81, physique 87, tactique 132), les 38 admissions animées V132.
- Les PNG Bioforge V80 (lointain, intermédiaire, premier plan, imprimante, cycle de sas, cycle de purge) sont de bonne qualité et réutilisables.
- La séquence d'entrée en trois étapes (`transferStage` 0–3) et ses événements.

## 5. Conséquences pour la refonte

Contraintes : le monde reste 2880×720 (les validateurs physique V87 et tactique V132 bornent x à 2880) ; l'arène, les portes et les emplacements d'apparition gardent leurs coordonnées ; les stations peuvent se déplacer (positions non sauvegardées). La refonte est donc une **réorganisation fonctionnelle** du même ruban : cloisons visibles, salles à hauteur humaine, zones nommées, interactions dans le monde, sortie physique avec décontamination. Voir `specs/013-bioforge/spec.md`.

Hors de portée de ce lot (signalé) : un étage d'observation praticable (exigerait d'agrandir le monde et de migrer les validateurs), la quête `ship-bioforge`, des images définitives (emplacements nommés en primitives Canvas).

## 6. Résultat de la refonte (spec 013)

Même fixture et même parcours clavier qu'au §1, sur la branche de la refonte. Parcours Chromium `scripts/qa-bioforge-lab-v188.mjs` : 30 contrôles réussis à 1366×768 (entrée par le hub, promenade, stockage froid, console, session, trois étapes, cellule, combat au clavier, purge, sortie physique, incinérateur, analyse, décontamination interrompue puis complète, porte, retour au hub, reprise après rechargement, purge d'urgence et retour par le terminal), 13 à 390×844 (jusqu'à l'entrée dans la cellule) ; 0 erreur de page ou de console.

| Constat | Après |
| --- | --- |
| 1, 2 sortie inaccessible, aller-retour | Après une purge réussie, D ou E reprend la marche dans la cellule ; la porte du Tantalus s'ouvre après 2,4 s de décontamination dans la cabine ; la franchir ramène à l'annexe du hub. Le terminal reste un second chemin. |
| 3 arrivée inerte | Sans session, l'opérateur marche dans la salle de contrôle et le stockage froid ; la console ouvre le terminal. |
| 6, 7, 8 architecture, salles, échelle | Cloisons pleine hauteur au-dessus des battants, plafonds à 5–5,6 m dans les salles fermées, halls ouverts, huit zones signalées, lumières propres. |
| 9, 10 passerelles | Passerelles et échelles dessinées, signalées « PASSERELLE · SPÉCIMENS ». L'opérateur n'escalade toujours pas (choix conservé). |
| 12, 13, 14 fonctions | Tableau de file, deux cuves de stase, brume au cycle d'interlock, stockage froid, baie d'analyse, incinérateur, galerie d'observation en profondeur (non praticable), cycle de purge animé. |
| 16, 17, 18, 19 lisibilité | HUD en haut à droite, invites « E — … » dans le monde, légende à droite, terminal réduit pendant la marche, terminal mobile sans chevauchement, voile de premier plan à 18 %. |
| 22, 23 | Zones renommées (sas biologique = la chambre entre deux portes ; admission ensuite) ; consoles et cabine déplacées hors des battants. |

Restent : quête `ship-bioforge` (15), lisibilité du canvas mobile (18 : le canvas reste à l'échelle 0,3), images définitives, étage d'observation praticable, reprise exacte pendant la sortie.

### Coût de rendu, même scène avant/après

Protocole : Chromium headless de l'environnement de développement (conteneur sans GPU déclaré), 1366×768, même fixture importée, entrée directe par le crochet QA `__ATF_BIOFORGE_V80__.open()` (déclaré), état préparé sans session ; caméra posée à x = 0, 1000 et 1600 ; 60 appels de chauffe puis 400 appels synchrones de `draw()` par position, 3 tours ; base `7989c757` servie sur un second port, mesures alternées base/refonte, trois passages.

| Caméra | Avant (ms par `draw()`) | Après (ms par `draw()`) |
| --- | --- | --- |
| x = 0 (salle de contrôle, scène la plus chargée) | 3,1 – 6,9 (médiane 4,1) | 4,8 – 7,4 (médiane 5,8) |
| x = 1000 (sas, admission, hall) | 0,8 – 1,7 (médiane 1,0) | 1,0 – 2,2 (médiane 1,6) |
| x = 1600 (cellule) | 0,8 – 2,5 (médiane 1,1) | 1,1 – 2,7 (médiane 1,1) |

Neuf échantillons par case. La refonte coûte environ 1,7 ms par image dans la scène la plus chargée, environ 0,5 ms au niveau du hall et rien de mesurable dans la cellule, dans cet environnement bruité (budget d'une image à 60 i/s : 16,7 ms). Mesures intermédiaires : les dégradés des cônes de lumière coûtaient ~1 ms (remplacés par deux cônes plats) ; une mise en cache du décor statique dans un canevas de 2880 px n'apportait aucun gain mesurable et a été retirée. Aucun gain n'est annoncé ; aucune mesure n'a été faite sur une machine de joueur.

## Mise à jour du 23 novembre 2026

Point 15 (accroche narrative) : la quête `ship-bioforge` « Ce qu'on garde en vie » est jouable (débat Inez Harlow / BISHOP-9 sur le système de face-à-face, bible §8.6). Le protocole décidé s'affiche au stockage froid et sous la file d'admission. Restent de ce point : la présence des deux personnages dans le laboratoire, leurs portraits définitifs et leurs voix.
