# AVP-R — Les lieux et les visages

## 0.10.0-candidate.1 · audit de fidélité et de cohérence

Cette candidate prolonge les sources réelles de la 0.9. Elle contient le module autonome complet, pas un correctif vide et pas le jeu Tantalus hôte. Les modifications concernent sept lieux, la structure des accès, les silhouettes et l’équipement. Les quinze séquences et cinquante objectifs principaux sont conservés.

**Objectif 1:1 : non atteint.** La cohérence locale des passages est testée ; les dimensions, implantations et costumes exacts ne sont pas authentifiés plan par plan. L’inventaire ne certifie pas que tous les lieux, armes et personnages du film sont présents. Les trois tableaux distants ne sont pas des niveaux. Plusieurs armes ne sont encore que répertoriées ou représentées dans un décor.

Le rendu reste original, vectoriel et procédural. Il ne contient pas de photogrammes ou de voix du film. Les expressions faciales, anatomies, matériaux et costumes secondaires restent stylisés. Le choix d’un montage unique n’est pas encore verrouillé : les différences cinéma / non censuré / scènes coupées sont signalées plutôt que mélangées sous l’étiquette « canon vérifié ».

## Registre

| Définition | Nombre |
|---|---|
| Lieux au sol | 48 |
| Environnement aérien | 1 |
| Liaisons réciproques | 65 |
| Extrémités avec support déclaré | 130 |
| Nouveaux lieux au sol | 7 |
| Séquences / objectifs principaux | 15 / 50 |
| Props / détails placés | 373 / 678 |
| Observations de terrain | 48 |
| Fiches / règles héritées | 153 / 156 |
| Entrées arsenal-équipement | 30 |
| Profils visuels / placements secondaires | 11 / 8 |
| Tableaux distants non jouables | 3 |

## Contrat architectural appliqué

Les 65 connexions possèdent 130 extrémités. Chacune indique son bâtiment, son niveau de référence, sa destination, sa famille de support et sa position. Les 47 lieux au sol du réseau urbain sont liés ; la clairière finale forme le 48e lieu au sol, atteint par la séquence aérienne. Le couloir aérien est compté séparément. Les chapitres continuent de limiter les accès : une liaison réciproque n’est pas nécessairement ouverte à chaque instant.

Les routes et sentiers ne portent plus de battant magique : ils utilisent une continuité de sol et un repère de direction. Les jardins reçoivent un accès de clôture. Les entrées de bâtiment sont rattachées à des façades avec toit, retours de paroi et fenêtres ; les pièces intérieures emploient des enveloppes de coupe. Les accès descendants extérieurs sont rendus au sol comme regards ou descentes avec garde-corps, et non comme échelles dressées dans la rue. Le passage du Stryker est une rampe rattachée au véhicule.

Le raccord parking → sous-sol technique est désormais un escalier dans les deux sens. Les annexes appartiennent au bon ensemble : pharmacie et blanchisserie à l’hôpital, réserve froide au diner, atelier au shérif, relevage aux égouts. Les six props déplacés pour dégager les seuils conservent leur identité. Toutes les extrémités sont atteignables par la navigation avec les rayons 17 et 29 ; les sept nouveaux locaux ont des objets bornés et des empreintes solides sans intersection entre elles.

**Limites de la coupe :** ces parois sont des volumes de représentation, pas un maillage architectural 3D intégralement collisionné. Les meubles, limites de sol, portails et restrictions de traversée conservent la simulation du moteur. Un graphe valide ne garantit pas la correspondance à une rue réelle. Les bâtiments lointains restent en partie des motifs de décor. Les huit traversées intermédiaires de la 0.7 et leurs dangers sont conservés.

## Nouvelles armes réellement exécutées

Le Combistick ajoute une attaque rapprochée d’allonge ; cette candidate ne lui donne pas de lancer. Le shuriken produit un projectile à six lames, puis un objet physique à récupérer avec E. Wolf commence avec trois exemplaires ; aucun retour automatique à la main n’est simulé. Une sauvegarde en plein vol de l’arme la convertit en objet posé cohérent, sans dupliquer sa munition. Les objets inutilisés sont rappelés lors d’un changement de séquence valide.

Le M4A1 est acquis par une interaction immobile de 1,1 seconde au râtelier du Stryker : trente cartouches chargées et soixante en réserve. L’acquisition ne se répète pas à chaque passage. L’accès militaire est partagé par la progression ; les dotations des protagonistes concernés sont distinctes et chacune n’est accordée qu’une fois. Il s’agit d’un choix d’économie du jeu, pas de chargeurs mesurés dans le film.

Le pistolet plasma transformé de Wolf utilise son énergie, tandis que celui de Dallas conserve le système de charges hérité. Après la lecture du masque, le second canon apparaît ; après reconfiguration, les canons d’épaule sont retirés du rendu et le pistolet devient l’arme correspondante. Après la perte, cette arme disparaît. Au duel sans équipement, seules les lames sont proposées. Deux canons visibles ne signifient pas deux systèmes de ciblage indépendants.

Le Winchester remplace l’identification visuelle générique du fusil. Les pistolets de Ricky et Kelly reçoivent des silhouettes distinctes ; ils conservent cependant une mécanique commune héritée. Certains anciens accès aux armes par rôle restent adaptés au gameplay. Les trente entrées suivantes ne sont donc pas trente armes utilisables, ni une garantie d’exhaustivité.

## Personnages : repères, pas doubles numériques

Les quatre protagonistes restent Wolf, Kelly, Dallas et Ricky. Onze profils de silhouette sont définis ; huit placements de personnages secondaires sont ajoutés aux scènes autorisées. Ces placements sont des présences de scène, pas huit nouvelles intelligences de combat. Tim reste notamment un profil consultable, pas une campagne supplémentaire.

Les marqueurs de quête ne dessinent plus tous un Dallas générique : les rôles de Ricky et de Morales sont affectés aux situations correspondantes. Jesse et Molly disposent de morphologies distinctes ; la petite taille de Molly ne transforme pas le personnage en adulte miniature de même gabarit. La coiffure, les manches, le badge et le ceinturon différencient plusieurs humains. Wolf reçoit ses mèches baguées, trophées, masque gravé et états d’équipement. Les xénomorphes ordinaires reçoivent des stries crâniennes ; le Predalien conserve sa base précédente.

Les visages restent schématiques. Les vêtements ne sont pas validés sur chaque plan et les militaires utilisent encore une tenue de substitution. La table suivante est le registre des décisions de rendu, pas une certification d’identité visuelle parfaite.

## Sauvegarde, arsenal et reprise

Le namespace de campagne reste `tantalus.mire.avpr.v1`. Le bloc `v10` conserve les acquisitions, observations, ouvertures, dotations attribuées et shurikens au sol. Les états de checkpoint conservent le même bloc. Reprendre après un échec ne doit ni recharger gratuitement une acquisition, ni perdre la trace d’un projectile récupérable. Un changement de chapitre refusé ne rappelle pas les shurikens à la main.

Les anciens états sans `v10` créent seulement les valeurs documentées : M4 vide et non acquis, trois shurikens pour Wolf, aucune nouvelle observation ou ouverture validée. Ils ne reçoivent pas de soin gratuit. Les limites et identifiants incohérents sont filtrés ; il ne s’agit pas d’un système anti-triche en ligne.

La bibliothèque de chapitres 0.9, la sauvegarde de relecture séparée et le retour à la campagne sont conservés. L’atlas peut être ouvert depuis le titre ou la pause et reste consultatif : il ne téléporte pas, ne récupère pas un objet et n’ouvre pas une zone de campagne. Lorsque neuf armes sont proposées, leur roue utilise une grille responsive pour éviter les recouvrements.

Conserver l’export JSON original avant import. Le retour d’un JSON 0.10 vers une version plus ancienne n’est pas garanti. Le stockage natif local n’a pas été certifié dans cet environnement ; l’export est la méthode explicite de conservation manuelle.

## Validation réellement exécutée

603 tests Node passent, dont 97 nouveaux. Les 506 tests hérités sont conservés avec des attentes de métadonnées explicitement mises à jour. `docs/FIDELITY_CHANGES.json` énumère 225 changements de données autorisés. Le comparateur vérifie d’abord les nouvelles valeurs, puis ne retire que ces changements déclarés pour comparer les éléments hérités. Il ne remplace pas les anciens résultats par un succès supposé. Les attentes de nombre de lieux, de version et de fiches dans les contrôles navigateur ont été révisées et consignées.

698 assertions Chromium passent dans 33 séries, dont 216 nouvelles. Les 130 extrémités sont rendues dans leur pièce, les 49 environnements sont ouverts dans l’atlas, et des actions E / Attaque / import de fichier utilisent les événements navigateur. Les préparations de scènes, choix d’équipement et positions imposées aux fixtures sont déclarés dans les légendes ; elles ne sont pas présentées comme des parties naturelles.

Douze campagnes automatisées couvrent quatre profils et trois difficultés, et terminent les cinquante objectifs. Quarante-cinq relectures isolées terminent chacune leur séquence. Sept tours dédiés contrôlent les nouveaux locaux, leurs retours, observations et imports ; ils partent d’états de chapitre préparés puis utilisent les commandes de mouvement. Les cinq annexes antérieures et les huit analyses de Wolf sont aussi revérifiées. Ces bots connaissent la carte et visent précisément ; ils ne constituent ni un test humain de difficulté, ni une estimation de durée.

Le navigateur utilisé est Chromium. La navigation native locale a été essayée et refusée par l’environnement ; les tests utilisent `set_content` avec un Storage mémoire explicite. Aucun contournement du blocage, téléphone ou contrôleur physique, sauvegarde `file://` native ou écoute au casque n’est revendiqué.

Les 49 vues de l’atlas ont été examinées sous forme de planches. Cette revue a conduit aux corrections des accès extérieurs et de la signalétique médicale. Elle ne garantit pas que chaque prop de chaque cadrage est parfait : les échelles, volumes, motifs récurrents et détails hérités demandent encore une production artistique dédiée. Les vingt captures fonctionnelles et les quarante-neuf vues d’audit sont les rendus du moteur, pas des images du film.

## Installation et outils

Ouvrir `JOUER_AVPR.html` pour lancer le module autonome. `JOUER_WINDOWS.cmd` est un raccourci. Si l’ouverture locale n’est pas acceptée par le navigateur, le serveur fourni se lance avec `npm run serve` depuis le dossier ; sa compatibilité chez l’utilisateur n’est pas certifiée par les tests de cet environnement.

`npm run build` assemble les sources sans téléchargement. `npm test` exécute les tests Node. `npm run audit:fidelity` recalcule les contrôles du graphe et des seuils. Les contrôles navigateur demandent Python, Playwright et Chromium ; leur exécutable de référence est `/usr/bin/chromium` et doit être adapté sur un autre système. `npm run verify` contrôle les empreintes du pack tel que livré ; le reconstruire ou modifier un rapport peut naturellement modifier ces empreintes.

L’installateur ne fait qu’ajouter ou actualiser un lien vers `src/dlc/avpr/index.html` dans un menu hôte reconnu. La vraie charge utile 0.9 et son installateur sont conservés dans la fixture de test ; mise à niveau, copie de l’ancien HTML, absence de doublon et désinstallation sont vérifiées sur un menu temporaire. `--dry-run` n’écrit rien et les options inconnues sont refusées.

Aucune fusion au moteur GameEngine/MIRE partagé, aucun profil Frontier modifié, aucun push GitHub, déploiement Vercel ou modification de bibliothèque distante.

## Écarts encore ouverts vers le 1:1

La préparation jouable de Wolf sur son monde, le prologue intérieur du vaisseau éclaireur et son détachement orbital ne sont pas reconstitués. Le commandement de Stevens et la remise à Yutani restent des tableaux consultatifs ou des ellipses. La morgue, certains intérieurs privés tels que la maison de Jesse et les espaces associés aux personnages secondaires ne sont pas tous présents comme pièces distinctes. Le dépôt de bus et les autres pistes de scénario supprimées ne doivent pas être ajoutés au montage cinéma comme s’ils y figuraient.

Le cimetière est un détour jouable lié à une variante de montage, mais il ne rejoue pas la scène avec Karl. La pizzeria découle du travail de Ricky ; son intérieur, son plan et ses raccords sont inventés pour cette adaptation. La zone des chasseurs ne rejoue pas leur prologue. La maternité et la nurserie sont des lieux vides explorables, pas une reproduction de toutes les actions du film. Le Stryker est immobilisé : pas de conduite, de trajet routier ou de mitrailleuse pilotée dans cette candidate.

Le répertoire contient encore des armes sans gameplay : variantes militaires, Colt Python, MP5SD3, K3 et CM203 notamment. Les armes représentées sur des PNJ ne produisent pas encore toutes leurs attaques. Les objets médicaux, le dissolvant et les lasers ont des fonctions adaptées et ne reproduisent pas chaque plan de manipulation.

L’architecture, les couleurs, les habits et les gabarits restent approximatifs. Aucun pourcentage de « fidélité » n’est attribué sans une grille d’observation filmique complète. Le résultat est une progression concrète et auditable, pas une certification d’intégralité.

## Sources et qualité des éléments

| Source | Nature | Usage et limite |
|---|---|---|
| [20th Century Studios — Aliens vs. Predator: Requiem](https://www.20thcenturystudios.com/movies/aliens-vs-predator-requiem) | studio | Identité du film ; pas de plan technique. |
| [Photographies de production — AvPGalaxy](https://www.avpgalaxy.net/avp-movies/avp-requiem/gallery/production-stills/) | photographies de production hébergées par un site spécialisé | Références visuelles. Accès aux grands JPEG incomplet ; aucune reconstruction mesurée. |
| [Photogrammes Blu-ray — AvPGalaxy](https://www.avpgalaxy.net/avp-movies/avp-requiem/gallery/blu-ray-captures/) | photogrammes hébergés | Index de scènes ; aucun relevé plan par plan exhaustif effectué. |
| [Wolf — AvPGalaxy](https://www.avpgalaxy.net/predator/wolf/) | source secondaire spécialisée | Arsenal, cicatrices, collecte du second canon, transformations. |
| [Personnages — AvPGalaxy](https://www.avpgalaxy.net/avp-movies/avp-requiem/characters/) | source secondaire spécialisée | Rôles, travail de Ricky, parcours des survivants. |
| [IMFDB — AVPR](https://www.imfdb.org/wiki/Alien_vs._Predator:_Requiem) | identifications secondaires sur photogrammes | Modèles d’armes. Incertitudes GUU-5P / Colt 723, K3 et variantes signalées. |
| [Hollywood History Online — Wolf’s Plasmacaster Pistol](https://www.hollywoodhistoryonline.com/product/wolfs-plasmacaster-pistol/) | objet de production documenté par son détenteur | Transformation du canon en pistolet, poignée distincte ; pas un prix ou une offre. |
| [Montage cinéma / non censuré — AvPGalaxy](https://www.avpgalaxy.net/avp-movies/avp-requiem/theatrical-vs-unrated/) | comparatif secondaire | Ne pas assimiler scènes coupées, film cinéma et jeu PSP. |


Vérification des pages le 29 septembre 2026. Le lien historique theatrical-vs-unrated redirige vers deleted-scenes. Les fichiers sources du jeu ne contiennent pas de copies des pages ou des photographies.

## Implantation détaillée de chaque lieu

Chaque coordonnée est une unité interne, jamais un mètre. Le niveau est une référence de raccord et non la preuve d’un étage réel du film. Les décors demeurent des plans adaptés.

### Lisière de Gunnison

`arrival` · depth · 2200 × 340 · ensemble **woods**, niveau **0**.

Provenance : adapted-unmeasured. stills Plan authentifié : **non**.

Séquences autorisées : signal.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| arrival>crash | Épave du vaisseau éclaireur | trail / landscape | 2088 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| arrival>creek | Ravine et ponceau | trail / landscape | 112 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| arrival>hunters_glade | Bois — clairière des chasseurs | trail / landscape | 1570 / 284 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| arrival.prop.0 | pine | 260 / 45 | 52 × 26 | oui |
| arrival.prop.1 | rock | 472 / 287 | 52 × 26 | oui |
| arrival.prop.2 | log | 685 / 45 | 52 × 26 | oui |
| arrival.prop.3 | fern | 898 / 287 | 52 × 26 | non |
| arrival.prop.4 | pine | 1110 / 45 | 52 × 26 | oui |
| arrival.prop.5 | rock | 1322 / 287 | 52 × 26 | oui |
| arrival.prop.6 | stump | 1535 / 45 | 52 × 26 | oui |
| arrival.prop.7 | fern | 1748 / 287 | 52 × 26 | non |

Observation `note.arrival` : Lisière de Gunnison — position 594 / 220.

### Épave du vaisseau éclaireur

`crash` · side · 1800 × 340 · ensemble **scoutship**, niveau **0**.

Provenance : adapted-unmeasured. stills Plan authentifié : **non**.

Séquences autorisées : signal.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| crash>arrival | Lisière de Gunnison | trail / landscape | 1688 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| crash>creek | Ravine et ponceau | trail / landscape | 112 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| crash.prop.0 | rib | 260 / 35 | 52 × 26 | oui |
| crash.prop.1 | canister | 422 / 293 | 52 × 26 | oui |
| crash.prop.2 | console | 585 / 35 | 52 × 26 | oui |
| crash.prop.3 | rib | 748 / 293 | 52 × 26 | oui |
| crash.prop.4 | wreck | 910 / 35 | 52 × 26 | oui |
| crash.prop.5 | rib | 1072 / 293 | 52 × 26 | oui |
| crash.prop.6 | canister | 1235 / 35 | 52 × 26 | oui |
| crash.prop.7 | console | 1398 / 293 | 52 × 26 | oui |

Observation `note.crash` : Épave du vaisseau éclaireur — position 486 / 174.

### Ravine et ponceau

`creek` · depth · 2100 × 340 · ensemble **woods**, niveau **0**.

Provenance : adapted-unmeasured. stills Plan authentifié : **non**.

Séquences autorisées : signal, under.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| creek>arrival | Lisière de Gunnison | trail / landscape | 1988 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| creek>crash | Épave du vaisseau éclaireur | trail / landscape | 112 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| creek>sewer_entry | Descente du collecteur | ladder / ladder-well | 798 / 84 | 0 → -1 | Rayons 17 et 29 accessibles ; retour défini |
| creek>hunters_glade | Bois — clairière des chasseurs | trail / landscape | 1250 / 284 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| creek.prop.0 | pine | 260 / 45 | 52 × 26 | oui |
| creek.prop.1 | rock | 460 / 287 | 52 × 26 | oui |
| creek.prop.2 | log | 660 / 45 | 52 × 26 | oui |
| creek.prop.3 | fern | 860 / 287 | 52 × 26 | non |
| creek.prop.5 | rock | 1260 / 60 | 52 × 26 | oui |
| creek.prop.6 | stump | 1460 / 45 | 52 × 26 | oui |
| creek.prop.7 | fern | 1660 / 287 | 52 × 26 | non |

Observation `note.creek` : Ravine et ponceau — position 567 / 220.

### Descente du collecteur

`sewer_entry` · side · 1600 × 340 · ensemble **sewers**, niveau **-1**.

Provenance : adapted-unmeasured. stills Plan authentifié : **non**.

Séquences autorisées : under, hospitalhunt.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| sewer_entry>creek | Ravine et ponceau | ladder / ladder-well | 1488 / 174 | -1 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| sewer_entry>sewer_junction | Chambre de répartition | passage / room-shell | 112 / 174 | -1 → -1 | Rayons 17 et 29 accessibles ; retour défini |
| sewer_entry>power_yard | Enceinte de la centrale | ladder / ladder-well | 608 / 174 | -1 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| sewer_entry>homeless_camp | Collecteur — abri des sans-abri | passage / room-shell | 1050 / 174 | -1 → -1 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| sewer_entry.prop.0 | pipe | 260 / 35 | 52 × 26 | oui |
| sewer_entry.prop.1 | valve | 398 / 293 | 52 × 26 | oui |
| sewer_entry.prop.2 | grate | 535 / 35 | 52 × 26 | oui |
| sewer_entry.prop.3 | barrel | 672 / 293 | 52 × 26 | oui |
| sewer_entry.prop.4 | pipe | 810 / 35 | 52 × 26 | oui |
| sewer_entry.prop.5 | grate | 948 / 293 | 52 × 26 | oui |
| sewer_entry.prop.6 | valve | 1085 / 35 | 52 × 26 | oui |
| sewer_entry.prop.7 | barrel | 1222 / 293 | 52 × 26 | oui |

Observation `note.sewer_entry` : Descente du collecteur — position 432 / 174.

Interaction 0.10 : `gauntlet_exit` / gauntlet — 608 / 174 ; durée 1.2 seconde(s). Elle ne crée pas un objectif principal supplémentaire.

### Chambre de répartition

`sewer_junction` · depth · 2100 × 340 · ensemble **sewers**, niveau **-1**.

Provenance : adapted-unmeasured. stills Plan authentifié : **non**.

Séquences autorisées : under, hospitalhunt, climb.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| sewer_junction>sewer_entry | Descente du collecteur | passage / room-shell | 1988 / 174 | -1 → -1 | Rayons 17 et 29 accessibles ; retour défini |
| sewer_junction>sewer_nest | Bassin de rétention | passage / room-shell | 112 / 174 | -1 → -1 | Rayons 17 et 29 accessibles ; retour défini |
| sewer_junction>sewer_service | Galerie de maintenance | passage / room-shell | 798 / 84 | -1 → -1 | Rayons 17 et 29 accessibles ; retour défini |
| sewer_junction>pump_annex | Station de relevage — pompes de secours | door / room-shell | 1520 / 84 | -1 → -1 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| sewer_junction.prop.0 | pipe | 260 / 45 | 52 × 26 | oui |
| sewer_junction.prop.1 | valve | 460 / 287 | 52 × 26 | oui |
| sewer_junction.prop.2 | grate | 660 / 45 | 52 × 26 | oui |
| sewer_junction.prop.3 | barrel | 860 / 287 | 52 × 26 | oui |
| sewer_junction.prop.5 | grate | 1260 / 287 | 52 × 26 | oui |
| sewer_junction.prop.6 | valve | 1460 / 286 | 52 × 26 | oui |
| sewer_junction.prop.7 | barrel | 1660 / 287 | 52 × 26 | oui |

Observation `note.sewer_junction` : Chambre de répartition — position 567 / 220.

### Galerie de maintenance

`sewer_service` · side · 1850 × 340 · ensemble **sewers**, niveau **-1**.

Provenance : adapted-unmeasured. stills Plan authentifié : **non**.

Séquences autorisées : under, hospitalhunt, climb.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| sewer_service>sewer_junction | Chambre de répartition | passage / room-shell | 1738 / 174 | -1 → -1 | Rayons 17 et 29 accessibles ; retour défini |
| sewer_service>maintenance | Hôpital — sous-sol technique | passage / room-shell | 112 / 174 | -1 → -1 | Rayons 17 et 29 accessibles ; retour défini |
| sewer_service>pump_annex | Station de relevage — pompes de secours | door / room-shell | 700 / 174 | -1 → -1 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| sewer_service.prop.0 | pipe | 260 / 35 | 52 × 26 | oui |
| sewer_service.prop.1 | valve | 429 / 293 | 52 × 26 | oui |
| sewer_service.prop.2 | grate | 598 / 35 | 52 × 26 | oui |
| sewer_service.prop.3 | barrel | 766 / 293 | 52 × 26 | oui |
| sewer_service.prop.4 | pipe | 935 / 35 | 52 × 26 | oui |
| sewer_service.prop.5 | grate | 1104 / 293 | 52 × 26 | oui |
| sewer_service.prop.6 | valve | 1272 / 35 | 52 × 26 | oui |
| sewer_service.prop.7 | barrel | 1441 / 293 | 52 × 26 | oui |

Observation `note.sewer_service` : Galerie de maintenance — position 499 / 174.

### Bassin de rétention

`sewer_nest` · depth · 2000 × 340 · ensemble **sewers**, niveau **-1**.

Provenance : adapted-unmeasured. stills Plan authentifié : **non**.

Séquences autorisées : under, hospitalhunt.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| sewer_nest>sewer_junction | Chambre de répartition | passage / room-shell | 1888 / 174 | -1 → -1 | Rayons 17 et 29 accessibles ; retour défini |
| sewer_nest>homeless_camp | Collecteur — abri des sans-abri | passage / room-shell | 690 / 84 | -1 → -1 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| sewer_nest.prop.0 | resin | 260 / 45 | 52 × 26 | non |
| sewer_nest.prop.1 | pipe | 448 / 287 | 52 × 26 | oui |
| sewer_nest.prop.2 | cocoon | 635 / 286 | 52 × 26 | oui |
| sewer_nest.prop.3 | resin | 822 / 287 | 52 × 26 | non |
| sewer_nest.prop.4 | grate | 1010 / 45 | 52 × 26 | oui |
| sewer_nest.prop.5 | resin | 1198 / 287 | 52 × 26 | non |
| sewer_nest.prop.6 | cocoon | 1385 / 45 | 52 × 26 | oui |
| sewer_nest.prop.7 | pipe | 1572 / 287 | 52 × 26 | oui |

Observation `note.sewer_nest` : Bassin de rétention — position 540 / 220.

### Enceinte de la centrale

`power_yard` · depth · 2200 × 340 · ensemble **powerplant**, niveau **0**.

Provenance : adapted-unmeasured. stills Plan authentifié : **non**.

Séquences autorisées : blackout.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| power_yard>sewer_entry | Descente du collecteur | ladder / ladder-well | 2088 / 174 | 0 → -1 | Rayons 17 et 29 accessibles ; retour défini |
| power_yard>power_hall | Salle des turbines | door / facade | 112 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| power_yard>main_street | Centre-ville — commerces | gate / fence | 836 / 84 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| power_yard.prop.0 | transformer | 260 / 45 | 90 × 42 | oui |
| power_yard.prop.1 | cable | 472 / 287 | 52 × 26 | non |
| power_yard.prop.2 | cabinet | 685 / 45 | 52 × 26 | oui |
| power_yard.prop.3 | turbine | 898 / 287 | 110 × 48 | oui |
| power_yard.prop.4 | transformer | 1110 / 45 | 90 × 42 | oui |
| power_yard.prop.5 | barrel | 1322 / 287 | 52 × 26 | oui |
| power_yard.prop.6 | cabinet | 1535 / 45 | 52 × 26 | oui |
| power_yard.prop.7 | cable | 1748 / 287 | 52 × 26 | non |

Observation `note.power_yard` : Enceinte de la centrale — position 594 / 220.

### Salle des turbines

`power_hall` · depth · 2300 × 340 · ensemble **powerplant**, niveau **0**.

Provenance : adapted-unmeasured. stills Plan authentifié : **non**.

Séquences autorisées : blackout.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| power_hall>power_yard | Enceinte de la centrale | door / room-shell | 2188 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| power_hall>control | Poste de contrôle | door / room-shell | 112 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| power_hall.prop.0 | transformer | 260 / 45 | 90 × 42 | oui |
| power_hall.prop.1 | cable | 485 / 287 | 52 × 26 | non |
| power_hall.prop.2 | cabinet | 710 / 45 | 52 × 26 | oui |
| power_hall.prop.3 | turbine | 935 / 287 | 110 × 48 | oui |
| power_hall.prop.4 | transformer | 1160 / 45 | 90 × 42 | oui |
| power_hall.prop.5 | barrel | 1385 / 287 | 52 × 26 | oui |
| power_hall.prop.6 | cabinet | 1610 / 45 | 52 × 26 | oui |
| power_hall.prop.7 | cable | 1835 / 287 | 52 × 26 | non |

Observation `note.power_hall` : Salle des turbines — position 621 / 220.

### Poste de contrôle

`control` · side · 1600 × 340 · ensemble **powerplant**, niveau **0**.

Provenance : adapted-unmeasured. stills Plan authentifié : **non**.

Séquences autorisées : blackout.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| control>power_hall | Salle des turbines | door / room-shell | 1488 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| control.prop.0 | console | 260 / 35 | 52 × 26 | oui |
| control.prop.1 | chair | 398 / 293 | 52 × 26 | oui |
| control.prop.2 | cabinet | 535 / 35 | 52 × 26 | oui |
| control.prop.3 | console | 672 / 293 | 52 × 26 | oui |
| control.prop.4 | firebox | 810 / 35 | 52 × 26 | non |
| control.prop.5 | chair | 948 / 293 | 52 × 26 | oui |
| control.prop.6 | cabinet | 1085 / 35 | 52 × 26 | oui |
| control.prop.7 | console | 1222 / 293 | 52 × 26 | oui |

Observation `note.control` : Poste de contrôle — position 432 / 174.

### Centre-ville — commerces

`main_street` · depth · 2500 × 340 · ensemble **town**, niveau **0**.

Provenance : adapted-unmeasured. stills Plan authentifié : **non**.

Séquences autorisées : poolnight, cleanup, weapons, bait, falsehope.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| main_street>power_yard | Enceinte de la centrale | gate / fence | 2388 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| main_street>pool | Piscine du lycée | door / facade | 112 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| main_street>changing | Vestiaires du lycée | door / facade | 950 / 84 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| main_street>diner | Diner — salle | door / facade | 1700 / 250 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| main_street>home_street | Quartier des O’Brien | street / road | 1275 / 74 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| main_street>sheriff | Poste du shérif | door / facade | 2050 / 80 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| main_street>store | Magasin de sport — chasse et pêche | door / facade | 550 / 250 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| main_street>intersection | Carrefour du barrage | street / road | 1275 / 270 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| main_street>pizzeria | Pizzeria — comptoir et livraison | door / facade | 2230 / 84 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| main_street.prop.0 | car | 260 / 45 | 145 × 38 | oui |
| main_street.prop.2 | bin | 760 / 45 | 52 × 26 | oui |
| main_street.prop.3 | car | 1010 / 287 | 145 × 38 | oui |
| main_street.prop.5 | bench | 1510 / 287 | 52 × 26 | oui |
| main_street.prop.6 | car | 1760 / 45 | 145 × 38 | oui |
| main_street.prop.7 | lamp | 2010 / 287 | 52 × 26 | non |

Observation `note.main_street` : Centre-ville — commerces — position 675 / 220.

### Diner — salle

`diner` · depth · 1850 × 340 · ensemble **diner**, niveau **0**.

Provenance : adapted-unmeasured. stills Plan authentifié : **non**.

Séquences autorisées : poolnight, cleanup.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| diner>main_street | Centre-ville — commerces | door / room-shell | 1738 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| diner>kitchen | Diner — cuisine | door / room-shell | 112 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| diner.prop.0 | booth | 260 / 45 | 95 × 34 | oui |
| diner.prop.1 | table | 429 / 287 | 52 × 26 | oui |
| diner.prop.2 | stool | 598 / 45 | 52 × 26 | oui |
| diner.prop.3 | counter | 766 / 287 | 120 × 30 | oui |
| diner.prop.4 | booth | 935 / 45 | 95 × 34 | oui |
| diner.prop.5 | table | 1104 / 287 | 52 × 26 | oui |
| diner.prop.6 | stool | 1272 / 45 | 52 × 26 | oui |
| diner.prop.7 | counter | 1441 / 287 | 120 × 30 | oui |
| diner.authored.08 | medicalbox | 1280 / 70 | 76 × 40 | oui |

Observation `note.diner` : Diner — salle — position 499 / 220.

### Diner — cuisine

`kitchen` · side · 1600 × 340 · ensemble **diner**, niveau **0**.

Provenance : adapted-unmeasured. stills Plan authentifié : **non**.

Séquences autorisées : poolnight, cleanup, weapons, bait.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| kitchen>diner | Diner — salle | door / room-shell | 1488 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| kitchen>alley | Ruelle des livraisons | door / room-shell | 112 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| kitchen>cellar | Diner — réserve froide | stairs / stairwell | 660 / 174 | 0 → -1 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| kitchen.prop.0 | sink | 260 / 35 | 52 × 26 | oui |
| kitchen.prop.1 | counter | 398 / 293 | 120 × 30 | oui |
| kitchen.prop.2 | fridge | 535 / 35 | 52 × 26 | oui |
| kitchen.prop.3 | shelf | 672 / 293 | 52 × 26 | oui |
| kitchen.prop.4 | sink | 810 / 35 | 52 × 26 | oui |
| kitchen.prop.5 | counter | 948 / 293 | 120 × 30 | oui |
| kitchen.prop.6 | bin | 1085 / 35 | 52 × 26 | oui |
| kitchen.prop.7 | fridge | 1222 / 293 | 52 × 26 | oui |

Observation `note.kitchen` : Diner — cuisine — position 432 / 174.

### Piscine du lycée

`pool` · depth · 2400 × 340 · ensemble **school**, niveau **0**.

Provenance : adapted-unmeasured. stills Plan authentifié : **non**.

Séquences autorisées : poolnight, cleanup.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| pool>main_street | Centre-ville — commerces | door / room-shell | 2288 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| pool>changing | Vestiaires du lycée | door / room-shell | 112 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| pool.prop.0 | bench | 260 / 45 | 52 × 26 | oui |
| pool.prop.1 | locker | 498 / 287 | 52 × 26 | oui |
| pool.prop.2 | lifebuoy | 735 / 45 | 52 × 26 | non |
| pool.prop.3 | bench | 972 / 287 | 52 × 26 | oui |
| pool.prop.4 | locker | 1210 / 45 | 52 × 26 | oui |
| pool.prop.5 | bench | 1448 / 287 | 52 × 26 | oui |
| pool.prop.6 | lifebuoy | 1685 / 45 | 52 × 26 | non |
| pool.prop.7 | bench | 1922 / 287 | 52 × 26 | oui |
| pool.water | poolwater | 1250 / 218 | 800 × 105 | oui |

Observation `note.pool` : Piscine du lycée — position 648 / 220.

### Vestiaires du lycée

`changing` · side · 1700 × 340 · ensemble **school**, niveau **0**.

Provenance : adapted-unmeasured. stills Plan authentifié : **non**.

Séquences autorisées : poolnight, cleanup.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| changing>pool | Piscine du lycée | door / room-shell | 1588 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| changing>main_street | Centre-ville — commerces | door / room-shell | 112 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| changing.prop.0 | locker | 260 / 35 | 52 × 26 | oui |
| changing.prop.1 | bench | 410 / 293 | 52 × 26 | oui |
| changing.prop.2 | locker | 560 / 35 | 52 × 26 | oui |
| changing.prop.3 | cabinet | 710 / 293 | 52 × 26 | oui |
| changing.prop.4 | locker | 860 / 35 | 52 × 26 | oui |
| changing.prop.5 | bench | 1010 / 293 | 52 × 26 | oui |
| changing.prop.6 | locker | 1160 / 35 | 52 × 26 | oui |
| changing.prop.7 | firebox | 1310 / 293 | 52 × 26 | non |

Observation `note.changing` : Vestiaires du lycée — position 459 / 174.

### Quartier des O’Brien

`home_street` · depth · 2250 × 340 · ensemble **town**, niveau **0**.

Provenance : adapted-unmeasured. stills Plan authentifié : **non**.

Séquences autorisées : home, cleanup, weapons, bait.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| home_street>main_street | Centre-ville — commerces | street / road | 2138 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| home_street>living | Maison — séjour | door / facade | 112 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| home_street>sheriff | Poste du shérif | door / facade | 855 / 84 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| home_street>workshop | Annexe du shérif — atelier automobile | door / facade | 1370 / 250 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| home_street>cemetery | Cimetière — allée et mausolée | gate / fence | 1650 / 84 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| home_street.prop.0 | car | 260 / 45 | 145 × 38 | oui |
| home_street.prop.1 | fence | 479 / 287 | 52 × 26 | oui |
| home_street.prop.2 | bin | 698 / 45 | 52 × 26 | oui |
| home_street.prop.3 | tree | 916 / 287 | 52 × 26 | oui |
| home_street.prop.4 | mailbox | 1135 / 45 | 52 × 26 | non |
| home_street.prop.5 | fence | 1354 / 60 | 52 × 26 | oui |
| home_street.prop.6 | bench | 1572 / 45 | 52 × 26 | oui |
| home_street.prop.7 | lamp | 1791 / 287 | 52 × 26 | non |

Observation `note.home_street` : Quartier des O’Brien — position 607 / 220.

### Maison — séjour

`living` · side · 1750 × 340 · ensemble **obrien**, niveau **0**.

Provenance : adapted-unmeasured. stills Plan authentifié : **non**.

Séquences autorisées : home.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| living>home_street | Quartier des O’Brien | door / room-shell | 1638 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| living>bedroom | Maison — étage | stairs / stairwell | 112 / 174 | 0 → 1 | Rayons 17 et 29 accessibles ; retour défini |
| living>backyard | Maison — jardin arrière | door / room-shell | 665 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| living.prop.0 | sofa | 260 / 35 | 112 × 32 | oui |
| living.prop.1 | table | 416 / 293 | 52 × 26 | oui |
| living.prop.2 | lamp | 572 / 35 | 52 × 26 | non |
| living.prop.3 | cabinet | 729 / 293 | 52 × 26 | oui |
| living.prop.4 | chair | 885 / 35 | 52 × 26 | oui |
| living.prop.5 | bookshelf | 1041 / 293 | 52 × 26 | oui |
| living.prop.6 | plant | 1198 / 35 | 52 × 26 | non |
| living.prop.7 | table | 1354 / 293 | 52 × 26 | oui |

Observation `note.living` : Maison — séjour — position 472 / 174.

### Maison — étage

`bedroom` · side · 1600 × 340 · ensemble **obrien**, niveau **1**.

Provenance : adapted-unmeasured. stills Plan authentifié : **non**.

Séquences autorisées : home.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| bedroom>living | Maison — séjour | stairs / stairwell | 1488 / 174 | 1 → 0 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| bedroom.prop.0 | bed | 260 / 35 | 100 × 32 | oui |
| bedroom.prop.1 | bookshelf | 398 / 293 | 52 × 26 | oui |
| bedroom.prop.2 | cabinet | 535 / 35 | 52 × 26 | oui |
| bedroom.prop.3 | lamp | 672 / 293 | 52 × 26 | non |
| bedroom.prop.4 | bed | 810 / 35 | 100 × 32 | oui |
| bedroom.prop.5 | chair | 948 / 293 | 52 × 26 | oui |
| bedroom.prop.6 | plant | 1085 / 35 | 52 × 26 | non |
| bedroom.prop.7 | table | 1222 / 293 | 52 × 26 | oui |
| bedroom.authored.08 | servicebox | 650 / 66 | 90 × 42 | oui |
| bedroom.v10.nvg | night_goggles | 1170 / 74 | 48 × 27 | non |

Observation `note.bedroom` : Maison — étage — position 432 / 174.

### Maison — jardin arrière

`backyard` · depth · 2100 × 340 · ensemble **obrien**, niveau **0**.

Provenance : adapted-unmeasured. stills Plan authentifié : **non**.

Séquences autorisées : home.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| backyard>living | Maison — séjour | door / facade | 1988 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| backyard>alley | Ruelle des livraisons | gate / fence | 112 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| backyard.prop.0 | fence | 260 / 45 | 52 × 26 | oui |
| backyard.prop.1 | tree | 460 / 287 | 52 × 26 | oui |
| backyard.prop.2 | bench | 660 / 45 | 52 × 26 | oui |
| backyard.prop.3 | bin | 860 / 287 | 52 × 26 | oui |
| backyard.prop.4 | fence | 1060 / 45 | 52 × 26 | oui |
| backyard.prop.5 | tree | 1260 / 287 | 52 × 26 | oui |
| backyard.prop.6 | shed | 1460 / 45 | 52 × 26 | oui |
| backyard.prop.7 | fence | 1660 / 287 | 52 × 26 | oui |

Observation `note.backyard` : Maison — jardin arrière — position 567 / 220.

### Poste du shérif

`sheriff` · depth · 1700 × 340 · ensemble **sheriff**, niveau **0**.

Provenance : adapted-unmeasured. stills Plan authentifié : **non**.

Séquences autorisées : weapons.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| sheriff>home_street | Quartier des O’Brien | door / room-shell | 1588 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| sheriff>main_street | Centre-ville — commerces | door / room-shell | 112 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| sheriff>workshop | Annexe du shérif — atelier automobile | door / room-shell | 720 / 250 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| sheriff.prop.0 | desk | 260 / 45 | 100 × 36 | oui |
| sheriff.prop.1 | chair | 410 / 287 | 52 × 26 | oui |
| sheriff.prop.2 | cabinet | 560 / 45 | 52 × 26 | oui |
| sheriff.prop.3 | desk | 710 / 60 | 100 × 36 | oui |
| sheriff.prop.4 | bookshelf | 860 / 45 | 52 × 26 | oui |
| sheriff.prop.5 | chair | 1010 / 287 | 52 × 26 | oui |
| sheriff.prop.6 | radio | 1160 / 45 | 52 × 26 | oui |
| sheriff.prop.7 | cabinet | 1310 / 287 | 52 × 26 | oui |
| sheriff.authored.08 | servicebox | 1070 / 280 | 116 × 45 | oui |

Observation `note.sheriff` : Poste du shérif — position 459 / 220.

### Magasin de sport — chasse et pêche

`store` · depth · 2200 × 340 · ensemble **sports**, niveau **0**.

Provenance : adapted-unmeasured. stills Plan authentifié : **non**.

Séquences autorisées : weapons, bait.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| store>main_street | Centre-ville — commerces | door / room-shell | 2088 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| store>stockroom | Magasin de sport — réserve | door / room-shell | 112 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| store.prop.0 | gunrack | 260 / 45 | 52 × 26 | oui |
| store.prop.1 | shelf | 472 / 287 | 52 × 26 | oui |
| store.prop.2 | counter | 685 / 45 | 120 × 30 | oui |
| store.prop.3 | gunrack | 898 / 287 | 52 × 26 | oui |
| store.prop.4 | shelf | 1110 / 45 | 52 × 26 | oui |
| store.prop.5 | cabinet | 1322 / 287 | 52 × 26 | oui |
| store.prop.6 | counter | 1535 / 45 | 120 × 30 | oui |
| store.prop.7 | gunrack | 1748 / 287 | 52 × 26 | oui |

Observation `note.store` : Armurerie — surface de vente — position 594 / 220.

### Magasin de sport — réserve

`stockroom` · side · 1850 × 340 · ensemble **sports**, niveau **0**.

Provenance : adapted-unmeasured. stills Plan authentifié : **non**.

Séquences autorisées : weapons, bait.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| stockroom>store | Magasin de sport — chasse et pêche | door / room-shell | 1738 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| stockroom>alley | Ruelle des livraisons | door / room-shell | 112 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| stockroom.prop.0 | crate | 260 / 35 | 52 × 26 | oui |
| stockroom.prop.1 | shelf | 429 / 293 | 52 × 26 | oui |
| stockroom.prop.2 | barrel | 598 / 35 | 52 × 26 | oui |
| stockroom.prop.3 | crate | 766 / 293 | 52 × 26 | oui |
| stockroom.prop.4 | shelf | 935 / 35 | 52 × 26 | oui |
| stockroom.prop.5 | cabinet | 1104 / 293 | 52 × 26 | oui |
| stockroom.prop.6 | crate | 1272 / 35 | 52 × 26 | oui |
| stockroom.prop.7 | barrel | 1441 / 293 | 52 × 26 | oui |
| stockroom.authored.08 | ammolocker | 1370 / 65 | 112 × 47 | oui |

Observation `note.stockroom` : Armurerie — réserve — position 499 / 174.

### Carrefour du barrage

`intersection` · depth · 2500 × 340 · ensemble **town**, niveau **0**.

Provenance : adapted-unmeasured. stills Plan authentifié : **non**.

Séquences autorisées : falsehope.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| intersection>alley | Ruelle des livraisons | street / road | 2388 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| intersection>main_street | Centre-ville — commerces | street / road | 112 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| intersection>rally | Place de rassemblement | street / road | 950 / 84 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| intersection>roadblock | Barrage routier | street / road | 1700 / 250 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| intersection.prop.0 | car | 260 / 45 | 145 × 38 | oui |
| intersection.prop.1 | lamp | 510 / 287 | 52 × 26 | non |
| intersection.prop.2 | bin | 760 / 45 | 52 × 26 | oui |
| intersection.prop.3 | car | 1010 / 287 | 145 × 38 | oui |
| intersection.prop.4 | hydrant | 1260 / 45 | 52 × 26 | non |
| intersection.prop.5 | bench | 1510 / 287 | 52 × 26 | oui |
| intersection.prop.6 | car | 1760 / 45 | 145 × 38 | oui |
| intersection.prop.7 | lamp | 2010 / 287 | 52 × 26 | non |

Observation `note.intersection` : Carrefour du barrage — position 675 / 220.

### Place de rassemblement

`rally` · depth · 2200 × 340 · ensemble **rally**, niveau **0**.

Provenance : adapted-unmeasured. stills Plan authentifié : **non**.

Séquences autorisées : falsehope.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| rally>intersection | Carrefour du barrage | street / road | 2088 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| rally.prop.0 | bench | 260 / 45 | 52 × 26 | oui |
| rally.prop.1 | lamp | 472 / 287 | 52 × 26 | non |
| rally.prop.2 | car | 685 / 45 | 145 × 38 | oui |
| rally.prop.3 | barrier | 898 / 287 | 52 × 26 | oui |
| rally.prop.4 | bench | 1110 / 45 | 52 × 26 | oui |
| rally.prop.5 | lamp | 1322 / 287 | 52 × 26 | non |
| rally.prop.6 | barrier | 1535 / 45 | 52 × 26 | oui |
| rally.prop.7 | car | 1748 / 287 | 145 × 38 | oui |

Observation `note.rally` : Place de rassemblement — position 594 / 220.

### Barrage routier

`roadblock` · depth · 2200 × 340 · ensemble **convoy**, niveau **0**.

Provenance : adapted-unmeasured. stills Plan authentifié : **non**.

Séquences autorisées : falsehope.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| roadblock>intersection | Carrefour du barrage | street / road | 2088 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| roadblock>parking | Hôpital — parking | street / road | 112 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| roadblock>stryker | Stryker — compartiment des survivants | ramp / vehicle-ramp | 1480 / 80 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| roadblock.prop.0 | barrier | 260 / 45 | 52 × 26 | oui |
| roadblock.prop.1 | truck | 472 / 287 | 172 × 45 | oui |
| roadblock.prop.2 | crate | 685 / 45 | 52 × 26 | oui |
| roadblock.prop.3 | barrier | 898 / 287 | 52 × 26 | oui |
| roadblock.prop.4 | lamp | 1110 / 45 | 52 × 26 | non |
| roadblock.prop.5 | car | 1322 / 287 | 145 × 38 | oui |
| roadblock.prop.6 | barrier | 1535 / 286 | 52 × 26 | oui |
| roadblock.prop.7 | crate | 1748 / 287 | 52 × 26 | oui |

Observation `note.roadblock` : Barrage routier — position 594 / 220.

### Hôpital — parking

`parking` · depth · 2500 × 340 · ensemble **hospital**, niveau **0**.

Provenance : adapted-unmeasured. stills Plan authentifié : **non**.

Séquences autorisées : falsehope.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| parking>roadblock | Barrage routier | street / road | 2388 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| parking>emergency | Hôpital — accueil des urgences | door / facade | 112 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| parking>maintenance | Hôpital — sous-sol technique | stairs / stairwell | 950 / 84 | 0 → -1 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| parking.prop.0 | ambulance | 260 / 45 | 172 × 45 | oui |
| parking.prop.1 | lamp | 510 / 287 | 52 × 26 | non |
| parking.prop.2 | car | 760 / 45 | 145 × 38 | oui |
| parking.prop.3 | bench | 1010 / 287 | 52 × 26 | oui |
| parking.prop.4 | ambulance | 1260 / 45 | 172 × 45 | oui |
| parking.prop.5 | bin | 1510 / 287 | 52 × 26 | oui |
| parking.prop.6 | car | 1760 / 45 | 145 × 38 | oui |
| parking.prop.7 | lamp | 2010 / 287 | 52 × 26 | non |

Observation `note.parking` : Hôpital — parking — position 675 / 220.

### Hôpital — accueil des urgences

`emergency` · depth · 2100 × 340 · ensemble **hospital**, niveau **0**.

Provenance : adapted-unmeasured. stills Plan authentifié : **non**.

Séquences autorisées : hospitalhunt, climb.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| emergency>parking | Hôpital — parking | door / room-shell | 1988 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| emergency>triage | Hôpital — triage | door / room-shell | 112 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| emergency>stairs | Hôpital — escalier protégé | stairs / stairwell | 798 / 84 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| emergency>maintenance | Hôpital — sous-sol technique | stairs / stairwell | 1428 / 250 | 0 → -1 | Rayons 17 et 29 accessibles ; retour défini |
| emergency>pharmacy | Hôpital — pharmacie de garde | door / room-shell | 1660 / 100 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| emergency.prop.0 | gurney | 260 / 45 | 105 × 28 | oui |
| emergency.prop.1 | chair | 460 / 287 | 52 × 26 | oui |
| emergency.prop.3 | firebox | 860 / 287 | 52 × 26 | non |
| emergency.prop.4 | cabinet | 1060 / 45 | 52 × 26 | oui |
| emergency.prop.5 | wheelchair | 1260 / 287 | 52 × 26 | oui |
| emergency.prop.6 | gurney | 1460 / 45 | 105 × 28 | oui |
| emergency.prop.7 | plant | 1660 / 287 | 52 × 26 | non |

Observation `note.emergency` : Hôpital — accueil des urgences — position 567 / 220.

### Hôpital — triage

`triage` · side · 1750 × 340 · ensemble **hospital**, niveau **0**.

Provenance : adapted-unmeasured. stills Plan authentifié : **non**.

Séquences autorisées : hospitalhunt, climb.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| triage>emergency | Hôpital — accueil des urgences | door / room-shell | 1638 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| triage>corridor | Hôpital — couloir supérieur | stairs / stairwell | 112 / 174 | 0 → 1 | Rayons 17 et 29 accessibles ; retour défini |
| triage>pharmacy | Hôpital — pharmacie de garde | door / room-shell | 660 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| triage.prop.0 | bed | 260 / 35 | 100 × 32 | oui |
| triage.prop.1 | screen | 416 / 293 | 52 × 26 | oui |
| triage.prop.2 | cabinet | 572 / 35 | 52 × 26 | oui |
| triage.prop.3 | sink | 729 / 293 | 52 × 26 | oui |
| triage.prop.4 | bed | 885 / 35 | 100 × 32 | oui |
| triage.prop.5 | screen | 1041 / 293 | 52 × 26 | oui |
| triage.prop.6 | gurney | 1198 / 35 | 105 × 28 | oui |
| triage.prop.7 | cabinet | 1354 / 293 | 52 × 26 | oui |
| triage.authored.08 | medicalbox | 850 / 65 | 76 × 40 | oui |

Observation `note.triage` : Hôpital — triage — position 472 / 174.

### Hôpital — escalier protégé

`stairs` · side · 1650 × 340 · ensemble **hospital**, niveau **0**.

Provenance : adapted-unmeasured. stills Plan authentifié : **non**.

Séquences autorisées : hospitalhunt, climb, flight.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| stairs>emergency | Hôpital — accueil des urgences | stairs / stairwell | 1538 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| stairs>corridor | Hôpital — couloir supérieur | stairs / stairwell | 112 / 174 | 0 → 1 | Rayons 17 et 29 accessibles ; retour défini |
| stairs>laundry | Hôpital — blanchisserie technique | stairs / stairwell | 740 / 174 | 0 → -1 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| stairs.prop.0 | firebox | 260 / 35 | 52 × 26 | non |
| stairs.prop.1 | pipe | 404 / 293 | 52 × 26 | oui |
| stairs.prop.2 | cabinet | 548 / 35 | 52 × 26 | oui |
| stairs.prop.3 | pipe | 691 / 293 | 52 × 26 | oui |
| stairs.prop.4 | firebox | 835 / 35 | 52 × 26 | non |
| stairs.prop.5 | grate | 979 / 293 | 52 × 26 | oui |
| stairs.prop.6 | pipe | 1122 / 35 | 52 × 26 | oui |
| stairs.prop.7 | cabinet | 1266 / 293 | 52 × 26 | oui |

Observation `note.stairs` : Hôpital — escalier protégé — position 445 / 174.

### Hôpital — couloir supérieur

`corridor` · depth · 2300 × 340 · ensemble **hospital**, niveau **1**.

Provenance : adapted-unmeasured. stills Plan authentifié : **non**.

Séquences autorisées : hospitalhunt, climb, flight, duel.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| corridor>stairs | Hôpital — escalier protégé | stairs / stairwell | 2188 / 174 | 1 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| corridor>shaft | Hôpital — gaine d’ascenseur | ladder / ladder-well | 112 / 174 | 1 → -1 | Rayons 17 et 29 accessibles ; retour défini |
| corridor>roof | Hôpital — toiture technique | stairs / stairwell | 874 / 84 | 1 → 2 | Rayons 17 et 29 accessibles ; retour défini |
| corridor>triage | Hôpital — triage | stairs / stairwell | 1564 / 250 | 1 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| corridor>maternity | Hôpital — service maternité | door / room-shell | 1850 / 84 | 1 → 1 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| corridor.prop.0 | gurney | 260 / 45 | 105 × 28 | oui |
| corridor.prop.1 | chair | 485 / 287 | 52 × 26 | oui |
| corridor.prop.2 | desk | 710 / 45 | 100 × 36 | oui |
| corridor.prop.3 | firebox | 935 / 287 | 52 × 26 | non |
| corridor.prop.5 | wheelchair | 1385 / 287 | 52 × 26 | oui |
| corridor.prop.6 | gurney | 1610 / 45 | 105 × 28 | oui |
| corridor.prop.7 | plant | 1835 / 287 | 52 × 26 | non |

Observation `note.corridor` : Hôpital — couloir supérieur — position 621 / 220.

### Hôpital — sous-sol technique

`maintenance` · side · 1950 × 340 · ensemble **hospital**, niveau **-1**.

Provenance : adapted-unmeasured. stills Plan authentifié : **non**.

Séquences autorisées : hospitalhunt, climb.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| maintenance>parking | Hôpital — parking | stairs / stairwell | 1838 / 174 | -1 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| maintenance>sewer_service | Galerie de maintenance | passage / room-shell | 112 / 174 | -1 → -1 | Rayons 17 et 29 accessibles ; retour défini |
| maintenance>shaft | Hôpital — gaine d’ascenseur | ladder / ladder-well | 741 / 174 | -1 → -1 | Rayons 17 et 29 accessibles ; retour défini |
| maintenance>emergency | Hôpital — accueil des urgences | stairs / stairwell | 1326 / 174 | -1 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| maintenance>laundry | Hôpital — blanchisserie technique | door / room-shell | 370 / 174 | -1 → -1 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| maintenance.prop.0 | pipe | 260 / 35 | 52 × 26 | oui |
| maintenance.prop.1 | valve | 441 / 293 | 52 × 26 | oui |
| maintenance.prop.2 | cabinet | 622 / 35 | 52 × 26 | oui |
| maintenance.prop.3 | pump | 804 / 293 | 52 × 26 | oui |
| maintenance.prop.4 | barrel | 985 / 35 | 52 × 26 | oui |
| maintenance.prop.5 | pipe | 1166 / 293 | 52 × 26 | oui |
| maintenance.prop.6 | console | 1348 / 35 | 52 × 26 | oui |
| maintenance.prop.7 | pump | 1529 / 293 | 52 × 26 | oui |

Observation `note.maintenance` : Hôpital — sous-sol technique — position 526 / 174.

### Hôpital — gaine d’ascenseur

`shaft` · side · 1700 × 340 · ensemble **hospital**, niveau **-1**.

Provenance : adapted-unmeasured. stills Plan authentifié : **non**.

Séquences autorisées : hospitalhunt, climb, duel.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| shaft>maintenance | Hôpital — sous-sol technique | ladder / ladder-well | 1588 / 174 | -1 → -1 | Rayons 17 et 29 accessibles ; retour défini |
| shaft>corridor | Hôpital — couloir supérieur | ladder / ladder-well | 112 / 174 | -1 → 1 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| shaft.prop.0 | beam | 260 / 35 | 52 × 26 | oui |
| shaft.prop.1 | cable | 410 / 293 | 52 × 26 | non |
| shaft.prop.2 | grate | 560 / 35 | 52 × 26 | oui |
| shaft.prop.3 | beam | 710 / 293 | 52 × 26 | oui |
| shaft.prop.4 | cable | 860 / 35 | 52 × 26 | non |
| shaft.prop.5 | beam | 1010 / 293 | 52 × 26 | oui |
| shaft.prop.6 | grate | 1160 / 35 | 52 × 26 | oui |
| shaft.prop.7 | cable | 1310 / 293 | 52 × 26 | non |

Observation `note.shaft` : Hôpital — gaine d’ascenseur — position 459 / 174.

### Hôpital — toiture technique

`roof` · depth · 2400 × 340 · ensemble **hospital**, niveau **2**.

Provenance : adapted-unmeasured. stills Plan authentifié : **non**.

Séquences autorisées : climb, flight, duel.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| roof>corridor | Hôpital — couloir supérieur | stairs / stairwell | 2288 / 174 | 2 → 1 | Rayons 17 et 29 accessibles ; retour défini |
| roof>helipad | Hôpital — hélisurface | bridge / bridge-deck | 112 / 174 | 2 → 2 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| roof.prop.0 | vent | 260 / 45 | 100 × 45 | oui |
| roof.prop.1 | pipe | 498 / 287 | 52 × 26 | oui |
| roof.prop.2 | duct | 735 / 45 | 52 × 26 | oui |
| roof.prop.3 | vent | 972 / 287 | 100 × 45 | oui |
| roof.prop.4 | cabinet | 1210 / 45 | 52 × 26 | oui |
| roof.prop.5 | duct | 1448 / 287 | 52 × 26 | oui |
| roof.prop.6 | pipe | 1685 / 45 | 52 × 26 | oui |
| roof.prop.7 | vent | 1922 / 287 | 100 × 45 | oui |

Observation `note.roof` : Hôpital — toiture technique — position 648 / 220.

### Hôpital — hélisurface

`helipad` · depth · 2300 × 340 · ensemble **hospital**, niveau **2**.

Provenance : adapted-unmeasured. stills Plan authentifié : **non**.

Séquences autorisées : climb, flight, duel.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| helipad>roof | Hôpital — toiture technique | bridge / bridge-deck | 2188 / 174 | 2 → 2 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| helipad.prop.0 | vent | 260 / 45 | 100 × 45 | oui |
| helipad.prop.1 | lamp | 485 / 287 | 52 × 26 | non |
| helipad.prop.2 | crate | 710 / 45 | 52 × 26 | oui |
| helipad.prop.3 | vent | 935 / 287 | 100 × 45 | oui |
| helipad.prop.4 | lamp | 1160 / 45 | 52 × 26 | non |
| helipad.prop.5 | barrier | 1385 / 287 | 52 × 26 | oui |
| helipad.prop.6 | crate | 1610 / 45 | 52 × 26 | oui |
| helipad.prop.7 | vent | 1835 / 287 | 100 × 45 | oui |

Observation `note.helipad` : Hôpital — hélisurface — position 621 / 220.

### Ruelle des livraisons

`alley` · depth · 2350 × 340 · ensemble **town**, niveau **0**.

Provenance : adapted-unmeasured. stills Plan authentifié : **non**.

Séquences autorisées : poolnight, home, cleanup, weapons, bait, falsehope.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| alley>kitchen | Diner — cuisine | door / facade | 2238 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| alley>backyard | Maison — jardin arrière | gate / fence | 112 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| alley>stockroom | Magasin de sport — réserve | door / facade | 893 / 84 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| alley>intersection | Carrefour du barrage | street / road | 1598 / 250 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| alley>cellar | Diner — réserve froide | stairs / stairwell | 485 / 94 | 0 → -1 | Rayons 17 et 29 accessibles ; retour défini |
| alley>pizzeria | Pizzeria — comptoir et livraison | door / facade | 1890 / 84 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| alley>cemetery | Cimetière — allée et mausolée | gate / fence | 200 / 270 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| alley.prop.0 | bin | 260 / 45 | 52 × 26 | oui |
| alley.prop.1 | fireescape | 491 / 287 | 52 × 26 | oui |
| alley.prop.2 | crate | 722 / 45 | 52 × 26 | oui |
| alley.prop.3 | car | 954 / 287 | 145 × 38 | oui |
| alley.prop.4 | bin | 1185 / 45 | 52 × 26 | oui |
| alley.prop.5 | pipe | 1416 / 287 | 52 × 26 | oui |
| alley.prop.6 | crate | 1648 / 45 | 52 × 26 | oui |
| alley.prop.7 | fireescape | 1879 / 287 | 52 × 26 | oui |

Observation `note.alley` : Ruelle des livraisons — position 634 / 220.

### Clairière — périmètre militaire

`clearing` · depth · 2400 × 340 · ensemble **extraction**, niveau **0**.

Provenance : adapted-unmeasured. stills Plan authentifié : **non**.

Séquences autorisées : aftermath.

Pas de porte pédestre ; transition définie par la séquence.

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| clearing.prop.0 | pine | 260 / 45 | 52 × 26 | oui |
| clearing.prop.1 | rock | 498 / 287 | 52 × 26 | oui |
| clearing.prop.2 | truck | 735 / 45 | 172 × 45 | oui |
| clearing.prop.3 | barrier | 972 / 287 | 52 × 26 | oui |
| clearing.prop.4 | pine | 1210 / 45 | 52 × 26 | oui |
| clearing.prop.5 | crate | 1448 / 287 | 52 × 26 | oui |
| clearing.prop.6 | lamp | 1685 / 45 | 52 × 26 | non |
| clearing.prop.7 | rock | 1922 / 287 | 52 × 26 | oui |

Observation `note.clearing` : Clairière — périmètre militaire — position 648 / 220.

### Vallée — couloir de fuite

`airroute` · flight · 7500 × 340 · ensemble **airlift**, niveau **0**.

Provenance : adapted-unmeasured. stills Plan authentifié : **non**.

Séquences autorisées : airlift.

Pas de porte pédestre ; transition définie par la séquence.

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|

### Station de relevage — pompes de secours

`pump_annex` · depth · 2080 × 340 · ensemble **sewers**, niveau **-1**.

Provenance : original-gameplay-annex. stills Plan authentifié : **non**.

Séquences autorisées : under, hospitalhunt, climb.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| pump_annex>sewer_junction | Chambre de répartition | door / room-shell | 150 / 174 | -1 → -1 | Rayons 17 et 29 accessibles ; retour défini |
| pump_annex>sewer_service | Galerie de maintenance | door / room-shell | 1930 / 174 | -1 → -1 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| pump_annex.authored.00 | pumpbank | 540 / 85 | 215 × 90 | oui |
| pump_annex.authored.01 | pumpbank | 1190 / 85 | 215 × 90 | oui |
| pump_annex.authored.02 | filtertank | 860 / 63 | 140 × 70 | oui |
| pump_annex.authored.03 | toolcart | 970 / 274 | 105 × 55 | oui |
| pump_annex.authored.04 | pipe | 1450 / 35 | 60 × 25 | oui |
| pump_annex.authored.05 | workbench | 380 / 278 | 220 × 64 | oui |
| pump_annex.authored.06 | servicebox | 1520 / 80 | 112 × 48 | oui |
| pump_annex.authored.07 | medicalbox | 655 / 280 | 75 × 40 | oui |

Observation `note.pump_annex` : Le deuxième retour — position 860 / 187.

### Diner — réserve froide

`cellar` · depth · 1900 × 340 · ensemble **diner**, niveau **-1**.

Provenance : original-gameplay-annex. stills Plan authentifié : **non**.

Séquences autorisées : poolnight, cleanup, weapons, bait.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| cellar>kitchen | Diner — cuisine | stairs / stairwell | 140 / 174 | -1 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| cellar>alley | Ruelle des livraisons | stairs / stairwell | 1760 / 174 | -1 → 0 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| cellar.authored.00 | coldcabinet | 455 / 67 | 190 × 60 | oui |
| cellar.authored.01 | coldcabinet | 980 / 67 | 190 × 60 | oui |
| cellar.authored.02 | foodrack | 1230 / 70 | 195 × 60 | oui |
| cellar.authored.03 | foodrack | 450 / 283 | 210 × 60 | oui |
| cellar.authored.04 | sinkunit | 730 / 63 | 142 × 55 | oui |
| cellar.authored.05 | pallet | 1000 / 284 | 155 × 65 | oui |
| cellar.authored.06 | medicalbox | 1420 / 70 | 72 × 38 | oui |
| cellar.authored.07 | servicebox | 740 / 280 | 104 × 42 | oui |

Observation `note.cellar` : La dernière livraison — position 1170 / 198.

### Annexe du shérif — atelier automobile

`workshop` · depth · 2260 × 340 · ensemble **sheriff**, niveau **0**.

Provenance : original-gameplay-annex. stills Plan authentifié : **non**.

Séquences autorisées : weapons.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| workshop>sheriff | Poste du shérif | door / room-shell | 150 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| workshop>home_street | Quartier des O’Brien | door / room-shell | 2110 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| workshop.authored.00 | servicecar | 900 / 105 | 360 × 90 | oui |
| workshop.authored.01 | carhoist | 680 / 54 | 55 × 46 | oui |
| workshop.authored.02 | carhoist | 1120 / 54 | 55 × 46 | oui |
| workshop.authored.03 | workbench | 420 / 282 | 250 × 64 | oui |
| workshop.authored.04 | toolcart | 1240 / 278 | 118 × 53 | oui |
| workshop.authored.05 | tirerack | 1570 / 70 | 225 × 70 | oui |
| workshop.authored.06 | sinkunit | 1830 / 65 | 128 × 48 | oui |
| workshop.authored.07 | ammolocker | 375 / 74 | 104 × 46 | oui |
| workshop.authored.08 | servicebox | 1520 / 278 | 105 × 46 | oui |

Observation `note.workshop` : Une voiture qui ne partira pas — position 1760 / 202.

### Hôpital — pharmacie de garde

`pharmacy` · depth · 2120 × 340 · ensemble **hospital**, niveau **0**.

Provenance : original-gameplay-annex. stills Plan authentifié : **non**.

Séquences autorisées : hospitalhunt, climb.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| pharmacy>emergency | Hôpital — accueil des urgences | door / room-shell | 150 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| pharmacy>triage | Hôpital — triage | door / room-shell | 1970 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| pharmacy.authored.00 | medshelf | 480 / 65 | 230 × 60 | oui |
| pharmacy.authored.01 | medshelf | 1050 / 65 | 235 × 60 | oui |
| pharmacy.authored.02 | coldcabinet | 1450 / 66 | 145 × 60 | oui |
| pharmacy.authored.03 | dispensary | 920 / 250 | 375 × 62 | oui |
| pharmacy.authored.04 | sinkunit | 1720 / 64 | 125 × 45 | oui |
| pharmacy.authored.05 | chair | 1510 / 283 | 60 × 45 | oui |
| pharmacy.authored.06 | medicalbox | 460 / 280 | 82 × 42 | oui |
| pharmacy.authored.07 | medicalcabinet | 740 / 65 | 112 × 49 | oui |

Observation `note.pharmacy` : Garder un passage — position 1650 / 203.

### Hôpital — blanchisserie technique

`laundry` · depth · 2160 × 340 · ensemble **hospital**, niveau **-1**.

Provenance : original-gameplay-annex. stills Plan authentifié : **non**.

Séquences autorisées : hospitalhunt, climb.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| laundry>maintenance | Hôpital — sous-sol technique | door / room-shell | 150 / 174 | -1 → -1 | Rayons 17 et 29 accessibles ; retour défini |
| laundry>stairs | Hôpital — escalier protégé | stairs / stairwell | 2010 / 174 | -1 → 0 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| laundry.authored.00 | washer | 460 / 80 | 174 × 81 | oui |
| laundry.authored.01 | washer | 990 / 80 | 174 × 81 | oui |
| laundry.authored.02 | dryer | 1510 / 75 | 190 × 76 | oui |
| laundry.authored.03 | linenrack | 1150 / 277 | 250 × 64 | oui |
| laundry.authored.04 | linenbin | 480 / 278 | 155 × 68 | oui |
| laundry.authored.05 | sinkunit | 1740 / 70 | 129 × 53 | oui |
| laundry.authored.06 | toolcart | 745 / 280 | 110 × 46 | oui |
| laundry.authored.07 | medicalbox | 700 / 70 | 74 × 40 | oui |
| laundry.authored.08 | servicebox | 1600 / 282 | 105 × 43 | oui |

Observation `note.laundry` : Les draps attendront — position 1310 / 181.

### Bois — clairière des chasseurs

`hunters_glade` · depth · 1900 × 340 · ensemble **woods**, niveau **0**.

Provenance : film-place-adapted-layout. stills Plan authentifié : **non**.

Séquences autorisées : signal, under.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| hunters_glade>creek | Ravine et ponceau | trail / landscape | 120 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| hunters_glade>arrival | Lisière de Gunnison | trail / landscape | 1780 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| hunters_glade.prop.0 | pine | 200 / 55 | 55 × 45 | oui |
| hunters_glade.prop.1 | rock | 470 / 292 | 110 × 46 | oui |
| hunters_glade.prop.2 | hunter_rifle | 620 / 82 | 120 × 35 | non |
| hunters_glade.prop.3 | hunter_pack | 900 / 290 | 64 × 37 | oui |
| hunters_glade.prop.4 | hunter_rifle | 1230 / 75 | 120 × 35 | non |
| hunters_glade.prop.5 | log | 1470 / 283 | 180 × 42 | oui |
| hunters_glade.prop.6 | pine | 1650 / 45 | 60 × 35 | oui |

Observation `note.hunters_glade` : Bois — clairière des chasseurs — position 1020 / 174.

Interaction 0.10 : `observe_hunters` / observe — 685 / 110 ; durée 0.6 seconde(s). Elle ne crée pas un objectif principal supplémentaire.

### Collecteur — abri des sans-abri

`homeless_camp` · depth · 1900 × 340 · ensemble **sewers**, niveau **-1**.

Provenance : film-place-adapted-layout. stills Plan authentifié : **non**.

Séquences autorisées : under, hospitalhunt.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| homeless_camp>sewer_entry | Descente du collecteur | passage / room-shell | 120 / 174 | -1 → -1 | Rayons 17 et 29 accessibles ; retour défini |
| homeless_camp>sewer_nest | Bassin de rétention | passage / room-shell | 1780 / 174 | -1 → -1 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| homeless_camp.prop.0 | tarp_bed | 400 / 72 | 180 × 60 | oui |
| homeless_camp.prop.1 | barrel_fire | 660 / 277 | 54 × 54 | oui |
| homeless_camp.prop.2 | tarp_bed | 910 / 68 | 180 × 60 | oui |
| homeless_camp.prop.3 | shopping_cart | 1150 / 278 | 90 × 45 | oui |
| homeless_camp.prop.4 | pipe | 1340 / 50 | 140 × 36 | oui |
| homeless_camp.prop.5 | blanket | 1560 / 280 | 130 × 36 | non |

Observation `note.homeless_camp` : Collecteur — abri des sans-abri — position 1020 / 174.

### Pizzeria — comptoir et livraison

`pizzeria` · depth · 1900 × 340 · ensemble **pizzeria**, niveau **0**.

Provenance : inferred-workplace-adapted. Profession de Ricky établie ; intérieur et raccords non authentifiés. Plan authentifié : **non**.

Séquences autorisées : poolnight, cleanup, weapons, bait.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| pizzeria>main_street | Centre-ville — commerces | door / room-shell | 120 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| pizzeria>alley | Ruelle des livraisons | door / room-shell | 1780 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| pizzeria.prop.0 | pizza_oven | 410 / 62 | 175 × 60 | oui |
| pizzeria.prop.1 | pizza_counter | 670 / 286 | 210 × 40 | oui |
| pizzeria.prop.2 | pizza_boxes | 920 / 72 | 95 × 40 | oui |
| pizzeria.prop.3 | pizza_table | 1130 / 280 | 150 × 40 | oui |
| pizzeria.prop.4 | delivery_bag | 1290 / 72 | 70 × 34 | oui |
| pizzeria.prop.5 | fridge | 1500 / 65 | 90 × 48 | oui |

Observation `note.pizzeria` : Pizzeria — comptoir et livraison — position 1010 / 174.

Interaction 0.10 : `observe_delivery` / observe — 1260 / 150 ; durée 0.6 seconde(s). Elle ne crée pas un objectif principal supplémentaire.

### Cimetière — allée et mausolée

`cemetery` · depth · 1900 × 340 · ensemble **cemetery**, niveau **0**.

Provenance : film-place-adapted-layout. wolf Plan authentifié : **non**.

Séquences autorisées : home, cleanup, weapons, bait.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| cemetery>home_street | Quartier des O’Brien | gate / fence | 120 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |
| cemetery>alley | Ruelle des livraisons | gate / fence | 1780 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| cemetery.prop.0 | headstone | 410 / 73 | 70 × 35 | oui |
| cemetery.prop.1 | headstone | 615 / 280 | 70 × 36 | oui |
| cemetery.prop.2 | headstone | 780 / 80 | 70 × 36 | oui |
| cemetery.prop.3 | stone_bench | 1020 / 285 | 150 × 37 | oui |
| cemetery.prop.4 | mausoleum | 1320 / 56 | 205 × 75 | oui |
| cemetery.prop.5 | headstone | 1550 / 286 | 70 × 36 | oui |

Observation `note.cemetery` : Cimetière — allée et mausolée — position 990 / 174.

Interaction 0.10 : `observe_cemetery` / observe — 990 / 174 ; durée 0.65 seconde(s). Elle ne crée pas un objectif principal supplémentaire.

### Hôpital — service maternité

`maternity` · depth · 2000 × 340 · ensemble **hospital**, niveau **1**.

Provenance : film-place-adapted-layout. stills Plan authentifié : **non**.

Séquences autorisées : hospitalhunt, climb.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| maternity>corridor | Hôpital — couloir supérieur | door / room-shell | 120 / 174 | 1 → 1 | Rayons 17 et 29 accessibles ; retour défini |
| maternity>nursery | Hôpital — nurserie contaminée | door / room-shell | 1880 / 174 | 1 → 1 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| maternity.prop.0 | nurse_station | 420 / 64 | 175 × 50 | oui |
| maternity.prop.1 | hospital_bed | 670 / 284 | 180 × 54 | oui |
| maternity.prop.2 | monitor | 940 / 72 | 60 × 35 | oui |
| maternity.prop.3 | hospital_bed | 1230 / 280 | 180 × 54 | oui |
| maternity.prop.4 | resin_column | 1460 / 53 | 70 × 40 | oui |
| maternity.prop.5 | curtain | 1640 / 270 | 80 × 35 | non |

Observation `note.maternity` : Hôpital — service maternité — position 1060 / 174.

Interaction 0.10 : `observe_maternity` / observe — 880 / 174 ; durée 0.65 seconde(s). Elle ne crée pas un objectif principal supplémentaire.

### Hôpital — nurserie contaminée

`nursery` · depth · 1850 × 340 · ensemble **hospital**, niveau **1**.

Provenance : film-place-adapted-layout. stills Plan authentifié : **non**.

Séquences autorisées : hospitalhunt, climb.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| nursery>maternity | Hôpital — service maternité | door / room-shell | 120 / 174 | 1 → 1 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| nursery.prop.0 | empty_cot | 430 / 79 | 120 × 44 | oui |
| nursery.prop.1 | empty_cot | 650 / 74 | 120 × 44 | oui |
| nursery.prop.2 | resin_column | 850 / 276 | 75 × 40 | oui |
| nursery.prop.3 | empty_cot | 1080 / 280 | 120 × 44 | oui |
| nursery.prop.4 | medical_cabinet | 1290 / 67 | 104 × 44 | oui |
| nursery.prop.5 | resin_column | 1530 / 275 | 90 × 45 | oui |

Observation `note.nursery` : Hôpital — nurserie contaminée — position 1030 / 174.

Interaction 0.10 : `observe_nursery` / observe — 785 / 174 ; durée 0.65 seconde(s). Elle ne crée pas un objectif principal supplémentaire.

### Stryker — compartiment des survivants

`stryker` · depth · 1780 × 340 · ensemble **stryker**, niveau **0**.

Provenance : film-place-adapted-layout. stills Plan authentifié : **non**.

Séquences autorisées : falsehope.

| Passage | Destination | Type / support | Position x / profondeur | Niveaux | Contrôle |
|---|---|---|---|---|---|
| stryker>roadblock | Barrage routier | ramp / vehicle-ramp | 1660 / 174 | 0 → 0 | Rayons 17 et 29 accessibles ; retour défini |

| Prop | Famille | Position | Empreinte | Solide |
|---|---|---|---|---|
| stryker.prop.0 | apc_bench | 420 / 67 | 190 × 43 | oui |
| stryker.prop.1 | military_rack | 750 / 69 | 140 × 45 | oui |
| stryker.prop.2 | apc_bench | 1160 / 282 | 195 × 44 | oui |
| stryker.prop.3 | radio | 1280 / 66 | 70 × 40 | oui |
| stryker.prop.4 | apc_panel | 1500 / 68 | 150 × 45 | oui |

Observation `note.stryker` : Stryker — compartiment des survivants — position 930 / 174.

Interaction 0.10 : `military_loadout` / military — 865 / 174 ; durée 1.1 seconde(s). Elle ne crée pas un objectif principal supplémentaire.

## Campagne ordonnée conservée

### Le dernier signal

`signal` · départ Lisière de Gunnison · rôle wolf.

| Objectif | Lieu | Type | Position |
|---|---|---|---|
| mask | Épave du vaisseau éclaireur | interact | 850 / 174 |
| sample | Ravine et ponceau | interact | 1120 / 105 |
| scuttle | Épave du vaisseau éclaireur | interact | 1320 / 174 |
| leave_wreck | Lisière de Gunnison | reach | 420 / 174 |

### Sous la ville

`under` · départ Descente du collecteur · rôle wolf.

| Objectif | Lieu | Type | Position |
|---|---|---|---|
| first_track | Chambre de répartition | interact | 980 / 92 |
| sewer_hunt | Bassin de rétention | clear | 1000 / 160 |
| sewer_seal | Galerie de maintenance | interact | 1230 / 174 |

### La ville s’éteint

`blackout` · départ Enceinte de la centrale · rôle wolf.

| Objectif | Lieu | Type | Position |
|---|---|---|---|
| power_trace | Poste de contrôle | interact | 890 / 174 |
| turbines | Salle des turbines | clear | 1242 / 174 |
| blackout_event | Enceinte de la centrale | reach | 1700 / 155 |

### Le bassin noir

`poolnight` · départ Vestiaires du lycée · rôle ricky.

| Objectif | Lieu | Type | Position |
|---|---|---|---|
| pool_keys | Vestiaires du lycée | interact | 1050 / 174 |
| jesse | Piscine du lycée | interact | 850 / 125 |
| pool_escape | Centre-ville — commerces | reach | 1000 / 173 |
| diner_refuge | Diner — salle | reach | 1400 / 190 |

### Ne regarde pas derrière

`home` · départ Maison — séjour · rôle kelly.

| Objectif | Lieu | Type | Position |
|---|---|---|---|
| torch | Maison — séjour | interact | 670 / 174 |
| molly | Maison — étage | interact | 1000 / 174 |
| backdoor | Maison — séjour | interact | 1270 / 174 |
| home_escape | Ruelle des livraisons | reach | 650 / 173 |

### Effacer le passage

`cleanup` · départ Centre-ville — commerces · rôle wolf.

| Objectif | Lieu | Type | Position |
|---|---|---|---|
| pool_hunt | Piscine du lycée | clear | 1296 / 174 |
| pool_clean | Vestiaires du lycée | interact | 1000 / 174 |
| diner_trace | Diner — cuisine | interact | 1100 / 174 |

### Ce qu’il reste en rayon

`weapons` · départ Centre-ville — commerces · rôle dallas.

| Objectif | Lieu | Type | Position |
|---|---|---|---|
| store_group | Magasin de sport — chasse et pêche | interact | 730 / 170 |
| guns | Magasin de sport — chasse et pêche | interact | 1320 / 130 |
| medpack | Magasin de sport — réserve | interact | 900 / 174 |
| radio_warning | Poste du shérif | interact | 980 / 170 |

### La chasse au milieu des hommes

`bait` · départ Ruelle des livraisons · rôle wolf.

| Objectif | Lieu | Type | Position |
|---|---|---|---|
| bait_track | Magasin de sport — réserve | interact | 950 / 174 |
| store_battle | Magasin de sport — chasse et pêche | clear | 1188 / 174 |
| plasma_rebuild | Ruelle des livraisons | interact | 1430 / 180 |

### La mauvaise direction

`falsehope` · départ Ruelle des livraisons · rôle kelly.

| Objectif | Lieu | Type | Position |
|---|---|---|---|
| convoy | Carrefour du barrage | interact | 1120 / 110 |
| rally_order | Place de rassemblement | interact | 1000 / 150 |
| hospital_route | Barrage routier | interact | 1170 / 173 |
| parking_arrival | Hôpital — parking | reach | 1450 / 175 |

### La trace verticale

`hospitalhunt` · départ Hôpital — sous-sol technique · rôle wolf.

| Objectif | Lieu | Type | Position |
|---|---|---|---|
| hospital_trace | Hôpital — triage | interact | 1060 / 174 |
| hall_hunt | Hôpital — couloir supérieur | clear | 1242 / 174 |
| lost_weapon | Hôpital — gaine d’ascenseur | reach | 900 / 174 |

### L’arme abandonnée

`climb` · départ Hôpital — accueil des urgences · rôle dallas.

| Objectif | Lieu | Type | Position |
|---|---|---|---|
| auxiliary | Hôpital — sous-sol technique | puzzle | 1030 / 174 |
| plasma_pickup | Hôpital — couloir supérieur | interact | 1180 / 115 |
| ricky_help | Hôpital — triage | interact | 1150 / 174 |
| roof_clear | Hôpital — toiture technique | clear | 1296 / 174 |

### La dernière rotation

`flight` · départ Hôpital — toiture technique · rôle kelly.

| Objectif | Lieu | Type | Position |
|---|---|---|---|
| flight_pack | Hôpital — hélisurface | interact | 980 / 172 |
| boarding | Hôpital — hélisurface | defend | 1090 / 176 |
| takeoff | Hôpital — hélisurface | interact | 1350 / 178 |

### Sans masque

`duel` · départ Hôpital — toiture technique · rôle wolf.

| Objectif | Lieu | Type | Position |
|---|---|---|---|
| duel_ready | Hôpital — toiture technique | interact | 880 / 130 |
| predalien | Hôpital — toiture technique | boss | 1296 / 174 |

### La dernière voie

`airlift` · départ Vallée — couloir de fuite · rôle kelly.

| Objectif | Lieu | Type | Position |
|---|---|---|---|
| air_leave | Vallée — couloir de fuite | flight | 2200 / 174 |
| air_wave | Vallée — couloir de fuite | flight | 4600 / 174 |
| air_land | Vallée — couloir de fuite | flight | 6950 / 174 |

### La vallée silencieuse

`aftermath` · départ Clairière — périmètre militaire · rôle kelly.

| Objectif | Lieu | Type | Position |
|---|---|---|---|
| molly_after | Clairière — périmètre militaire | interact | 970 / 140 |
| ricky_after | Clairière — périmètre militaire | interact | 1410 / 172 |
| surrender | Clairière — périmètre militaire | interact | 1720 / 180 |

## Arsenal-équipement complet du registre actuel

| Entrée | Référent / détenteur | Statut dans le jeu | Implémentation | Référence |
|---|---|---|---|---|
| Lames de poignet | Wolf | jouable | Lames rapprochées, disponibles au duel. | [Wolf — AvPGalaxy](https://www.avpgalaxy.net/predator/wolf/) |
| Combistick | Wolf | jouable | Nouvelle attaque d’allonge ; pas de lancer de lance ajouté. | [Wolf — AvPGalaxy](https://www.avpgalaxy.net/predator/wolf/) |
| Shuriken à six lames | Wolf | jouable | Trois exemplaires initiaux, vol et récupération physique ; indisponible après abandon de l’équipement. | [Wolf — AvPGalaxy](https://www.avpgalaxy.net/predator/wolf/) |
| Canon(s) d’épaule | Wolf | jouable | Second canon visible après lecture du masque ; armement d’épaule retiré après reconfiguration. | [Wolf — AvPGalaxy](https://www.avpgalaxy.net/predator/wolf/) |
| Pistolet plasma transformé | Wolf / Dallas | jouable | Wolf : énergie ; Dallas : système de charges hérité, approximation explicitée. | [Hollywood History Online — Wolf’s Plasmacaster Pistol](https://www.hollywoodhistoryonline.com/product/wolfs-plasmacaster-pistol/) |
| Fouet | Wolf | jouable | Attaque longue et étourdissement conservés. | [Wolf — AvPGalaxy](https://www.avpgalaxy.net/predator/wolf/) |
| Gantelet de force | Wolf | contextuel | Rupture localisée de la dalle du collecteur, pas destruction universelle. | [Wolf — AvPGalaxy](https://www.avpgalaxy.net/predator/wolf/) |
| Mines / maillage laser | Wolf | jouable adapté | Balises de la 0.5 : faisceau unique, pas reproduction exacte de tout le maillage du film. | [Wolf — AvPGalaxy](https://www.avpgalaxy.net/predator/wolf/) |
| Liquide dissolvant | Wolf | jouable adapté | Neutralise acide et dépôts analysés, pas toutes les matières organiques du décor. | [Wolf — AvPGalaxy](https://www.avpgalaxy.net/predator/wolf/) |
| Bio-masque et visions | Wolf | jouable | État porté/retiré et visées ; reproduction graphique stylisée. | [Wolf — AvPGalaxy](https://www.avpgalaxy.net/predator/wolf/) |
| Camouflage | Wolf | jouable | Coût et détection réglés pour le jeu, pas mesures du film. | [Wolf — AvPGalaxy](https://www.avpgalaxy.net/predator/wolf/) |
| Trousse médicale | Wolf | jouable adapté | Soin immobile consommable ; procédure visuelle non reproduite intégralement. | [Wolf — AvPGalaxy](https://www.avpgalaxy.net/predator/wolf/) |
| Autodestruction du vaisseau | Wolf | objectif narratif | Interaction existante, explosion racontée ; pas destruction physique de toute la coque. | [Wolf — AvPGalaxy](https://www.avpgalaxy.net/predator/wolf/) |
| Winchester 1200 | Dallas | jouable | Ancien fusil générique renommé et redessiné ; réglages conservés. | [IMFDB — AVPR](https://www.imfdb.org/wiki/Alien_vs._Predator:_Requiem) |
| Glock 17, 2e génération | Morales / Ricky | jouable adapté | Profil visuel du pistolet de Ricky ; réserve générique conservée, non modèle balistique distinct. | [IMFDB — AVPR](https://www.imfdb.org/wiki/Alien_vs._Predator:_Requiem) |
| Beretta 92FS | Kelly | jouable adapté | Profil visuel du pistolet humain tardif ; magasin militaire, pas dotation de départ. | [IMFDB — AVPR](https://www.imfdb.org/wiki/Alien_vs._Predator:_Requiem) |
| M4A1 | Survivants / militaires | jouable | Râtelier du Stryker, chargeur de trente et réserve finie. | [IMFDB — AVPR](https://www.imfdb.org/wiki/Alien_vs._Predator:_Requiem) |
| Remington 700 | Chasseurs | décor inspectable | Deux exemplaires dans la clairière ; pas remis à Wolf comme arme utilisable. | [IMFDB — AVPR](https://www.imfdb.org/wiki/Alien_vs._Predator:_Requiem) |
| Remington 870 | Morales | représentation PNJ | Silhouette au rassemblement ; PNJ non combattant simulé. | [IMFDB — AVPR](https://www.imfdb.org/wiki/Alien_vs._Predator:_Requiem) |
| Colt Python | Survivant au cimetière | registre seulement · montage long | Présence attribuée au montage long ; personnage et tir non rejoués. | [IMFDB — AVPR](https://www.imfdb.org/wiki/Alien_vs._Predator:_Requiem) |
| MP5A3 | Forces spéciales | représentation PNJ | Périmètre final ; non offert dans la campagne. | [IMFDB — AVPR](https://www.imfdb.org/wiki/Alien_vs._Predator:_Requiem) |
| MP5SD3 | Forces spéciales | registre seulement | Variante signalée, pas un nouveau PNJ actif. | [IMFDB — AVPR](https://www.imfdb.org/wiki/Alien_vs._Predator:_Requiem) |
| GUU-5P / Colt 723 ? | Garde nationale | registre seulement · incertain | Identification secondaire ambiguë, ne pas certifier GUU-5P. | [IMFDB — AVPR](https://www.imfdb.org/wiki/Alien_vs._Predator:_Requiem) |
| Browning M2HB | Convoi / Kelly, scène coupée | décor | Tourelle fixée au Stryker ; pas de tir monté. | [IMFDB — AVPR](https://www.imfdb.org/wiki/Alien_vs._Predator:_Requiem) |
| Daewoo K3 modifiée | Garde nationale | registre seulement | Accessoire pouvant représenter une M249 ; modèle exact non revalidé ici. | [IMFDB — AVPR](https://www.imfdb.org/wiki/Alien_vs._Predator:_Requiem) |
| M249 SAW Para | Forces spéciales | représentation PNJ | Silhouette au périmètre final, pas d’arme joueur. | [IMFDB — AVPR](https://www.imfdb.org/wiki/Alien_vs._Predator:_Requiem) |
| Cobray CM203 | Garde nationale | registre seulement | Ne pas assimiler sans réserve à un M203 militaire. | [IMFDB — AVPR](https://www.imfdb.org/wiki/Alien_vs._Predator:_Requiem) |
| Jumelles de vision nocturne | Molly | décor | Posées dans la chambre ; aucun mode jouable de Molly ajouté. | [Personnages — AvPGalaxy](https://www.avpgalaxy.net/avp-movies/avp-requiem/characters/) |
| Radio de police et communication | Morales / groupe | contextuel | Ordres et dispositifs sonores existants. | [Personnages — AvPGalaxy](https://www.avpgalaxy.net/avp-movies/avp-requiem/characters/) |
| Fusées / brides / soins humains | Survivants | jouable original | Consommables de gameplay ; aucun statut d’accessoire canonique garanti. | [Personnages — AvPGalaxy](https://www.avpgalaxy.net/avp-movies/avp-requiem/characters/) |

## Profils de personnage

| Profil | Repères dessinés | Niveau de certitude | Référence |
|---|---|---|---|
| wolf | Masque gravé, longues mèches baguées, filet, trophées, armure asymétrique ; cicatrice et mandibule absente sans masque. | silhouette et équipement retravaillés ; sculpture faciale approximative | [Wolf — AvPGalaxy](https://www.avpgalaxy.net/predator/wolf/) |
| kelly | Débardeur bordeaux, jean sombre, cheveux bruns attachés. | palette du cliché de production consulté ; visage stylisé | [Photographies de production — AvPGalaxy](https://www.avpgalaxy.net/avp-movies/avp-requiem/gallery/production-stills/) |
| dallas | Veste brune ouverte sur haut sombre, cheveux courts, barbe légère. | repères de silhouette ; détails vestimentaires à vérifier plan par plan | [Photographies de production — AvPGalaxy](https://www.avpgalaxy.net/avp-movies/avp-requiem/gallery/production-stills/) |
| ricky | Cheveux clairs bouclés, vêtement gris-bleu et silhouette plus jeune. | coiffure différenciée ; tenue exacte selon séquence non certifiée | [Personnages — AvPGalaxy](https://www.avpgalaxy.net/avp-movies/avp-requiem/characters/) |
| jesse | Longs cheveux blonds, silhouette féminine et jean ; modèle adulte distinct. | tenue de fuite approximative ; pas de transformation du PNJ en homme générique | [Personnages — AvPGalaxy](https://www.avpgalaxy.net/avp-movies/avp-requiem/characters/) |
| molly | Enfant de petite taille, longs cheveux bruns, tenue domestique claire. | proportions et coiffure distinctes ; motif du vêtement non certifié | [Personnages — AvPGalaxy](https://www.avpgalaxy.net/avp-movies/avp-requiem/characters/) |
| morales | Uniforme de shérif, ceinturon, badge ; Glock et Remington identifiés au registre. | PNJ de scène ; visage approximatif | [Personnages — AvPGalaxy](https://www.avpgalaxy.net/avp-movies/avp-requiem/characters/) |
| eddie | Adulte du groupe sur la place, non substitué à Dallas. | silhouette provisoire, costume non vérifié | [Personnages — AvPGalaxy](https://www.avpgalaxy.net/avp-movies/avp-requiem/characters/) |
| dale | Adulte blond du groupe ; présence limitée aux scènes prévues. | silhouette provisoire, costume non vérifié | [Personnages — AvPGalaxy](https://www.avpgalaxy.net/avp-movies/avp-requiem/characters/) |
| tim | Père de Molly ; ne rejoint pas les survivants après la maison. | silhouette provisoire, costume non vérifié | [Personnages — AvPGalaxy](https://www.avpgalaxy.net/avp-movies/avp-requiem/characters/) |
| soldier | Casque, protection et arme militaire au périmètre final. | uniforme générique de substitution clairement déclaré | [IMFDB — AVPR](https://www.imfdb.org/wiki/Alien_vs._Predator:_Requiem) |

## Fiches du carnet

### 1. Dossier Gunnison

Un vaisseau s’est abîmé près de la ville. Les premiers indices conduisent de la forêt aux canalisations. En surface, personne ne sait encore ce qui arrive.

### 2. Wolf, le nettoyeur

Wolf est venu effacer les traces de la contamination. Les vies humaines ne sont pas le but de sa mission. Le signal du vaisseau et les résidus laissés par les créatures guident sa chasse.

### 3. Le Predalien

L’hybride associe la silhouette et la force des deux espèces. Sa portée et ses charges rendent un face-à-face prolongé extrêmement dangereux.

### 4. Une sortie, pas un refuge

Un ordre d’évacuation n’est pas une garantie. Écoutez les transmissions, observez les barrages et cherchez une issue indépendante.

### 5. Ne pas se séparer

Jesse, Ricky et Molly ne disposent pas des moyens de Wolf. Lorsqu’un compagnon vous rejoint, avancez jusqu’au prochain lieu de regroupement et gardez la sortie en vue.

### 6. Les armes du groupe

Les réserves du magasin permettent au groupe de s’armer. L’arme étrangère n’entre en possession de Dallas qu’après avoir été perdue par son propriétaire.

### 7. Reconnaître un passage

Une rue n’est pas une impasse parce qu’elle se termine à l’écran. Repérez les portes, les escaliers, les passages entre bâtiments et les accès au sous-sol. Le plan rassemble les liaisons du secteur.

### 8. Transmissions interrompues

Les radios rapportent une situation qui change vite. Atteignez les postes de communication indiqués pour savoir quelle route reste praticable.

### 9. Profondeur

Dans les zones ouvertes, haut et bas changent réellement la profondeur. Le tir, les attaques et les interactions utilisent la même position au sol.

### 10. Passages étroits

Dans une galerie latérale, les déplacements de profondeur sont verrouillés. Les portes et escaliers changent de salle sans créer un faux deuxième étage.

### 11. Acide

Une créature tuée laisse une flaque temporaire. Prenez de la distance avant de la finir au contact.

### 12. Les obstacles

Les objets massifs peuvent arrêter un projectile et obliger à contourner. Ne comptez pas sur une vitre ou un simple élément de décor pour vous protéger.

### 13. Discrétion

Marcher accroupi réduit la détection. Le camouflage de Wolf consomme de l’énergie et se coupe lorsqu’il attaque.

### 14. Vision

Wolf dispose d’une lecture thermique et d’une lecture xéno. Le masque déposé, ces filtres ne fonctionnent plus.

### 15. La traque

La proximité et les tirs attirent l’attention. Changer de pièce ne remet pas un combat à zéro : une créature blessée ou neutralisée garde son état dans la séquence en cours.

### 16. Signes du duel

Le Predalien annonce ses ruées. Quittez l’axe marqué et profitez de la récupération plutôt que de rester immobile devant lui.

### 17. Secours locaux

Le pupitre auxiliaire indique trois circuits : isolation, transfert, éclairage. La séquence indiquée sur le pupitre doit être reproduite. Elle ne répare pas la centrale.

### 18. Lampe

La lampe éclaire la direction du regard. Elle ne remplace pas la lumière ambiante : les issues restent identifiables.

### 19. Les compagnons

Un compagnon suit à distance et franchit les portes avec vous. Les objectifs de regroupement indiquent où l’attendre avant de poursuivre.

### 20. Conserver une trace

La progression se conserve sur cet appareil. Depuis la pause, vous pouvez aussi exporter une sauvegarde et la réimporter plus tard. Une copie est utile avant de recommencer la nuit.

### 21. Pause

Le menu, le plan et le codex suspendent le temps. Une perte de focus interrompt les entrées et met le jeu en pause.

### 22. Lire le terrain

Les issues restent visibles malgré l’obscurité. Le plan indique le secteur de votre objectif. Réglez la luminosité et le contraste si la pluie ou les ombres gênent la lecture.

### 23. Sous la ville

Les canalisations relient des lieux que les rues séparent. Leur étroitesse limite les esquives : vérifiez ce qui se trouve devant vous avant d’avancer.

### 24. L’hôpital

Les salles de soin, les locaux techniques et la toiture forment des itinéraires distincts. Le rétablissement d’un circuit de secours ne remet pas toute la ville sous tension.

### 25. Le bruit porte loin

Courir, tirer et déclencher une alarme ne racontent pas la même chose aux créatures. Après avoir perdu le contact visuel, elles cherchent autour du dernier bruit, pas autour de votre position actuelle.

### 26. Rompre la ligne de vue

Une voiture, un meuble ou un pilier peut vous masquer. Une créature déjà alertée vient cependant vérifier votre dernière position. Accroupissez-vous, puis changez de couvert.

### 27. Les purges de vapeur

Une vanne provoque un souffle local et un rideau de vapeur pendant quelques secondes. Les silhouettes disparaissent dans le nuage, pas les attaques déjà déclenchées. Deux utilisations par séquence.

### 28. Trois frappes

Avec Wolf, enchaînez trois coups de lames sans trop attendre pour porter une dernière frappe plus forte. Le fouet arrête brièvement un xénomorphe ordinaire, mais ne bloque pas la charge de l’hybride.

### 29. Garde et riposte

B ou clic droit prépare une courte garde de Wolf. Une frappe proche reçue au bon moment est déviée. La queue et la charge du Predalien doivent être esquivées.

### 30. Charger le plasma

Maintenez T, puis relâchez pour libérer un tir de plasma plus puissant. Il consomme davantage d’énergie. La charge est interrompue par un coup ou un changement d’arme.

### 31. Gerbe de plombs

Le fusil à pompe tire une gerbe de six plombs. À distance, la dispersion impose de se rapprocher ou de choisir le pistolet. Une cartouche est consommée par gerbe.

### 32. Ne pas se séparer

O donne à la personne accompagnée l’ordre d’attendre ou de suivre. Approchez d’une sortie ensemble : elle ne traversera plus une salle entière par magie.

### 33. Récupération prudente

Se soigner demande désormais un instant immobile. Les ennemis ne vous laissent pas ce temps automatiquement. Rechercher un couvert peut être plus sûr que consommer un soin en plein échange.

### 34. Les réserves ne reviennent pas

Les fournitures ramassées, les appareils utilisés et les adversaires vaincus restent dans cet état après un aller-retour et une sauvegarde. Les changements de séquence restent des ellipses narratives.

### 35. Le chemin jusqu’à l’objectif

Le plan peut montrer le prochain passage à emprunter. La carte ne déplace personne : il faut toujours rejoindre physiquement la porte.

### 36. La dernière toiture

La posture de l’hybride annonce son attaque. Une charge vise la position choisie au départ ; une queue balayante impose de sortir de la zone, puis de profiter de la récupération.

### 37. Poursuite au seuil

Une créature qui vous a vu franchir un passage peut suivre. Le bruit et la silhouette apparaissent au seuil annoncé ; elle ne se matérialise pas au milieu de la pièce. Les changements de chapitre ne transportent pas les poursuivants.

### 38. Verrou de proximité

Près d’une porte battante, K verrouille ou libère le battant. Un poursuivant le frappe et finit par détruire le verrou. Le verrou cassé reste cassé pour la séquence. Les échelles, rues et escaliers ne se verrouillent pas.

### 39. Réserves finies

Chaque ennemi scénarisé possède un identifiant unique. Changer de pièce ne recrée pas une créature déjà déplacée, blessée ou morte. Le Predalien reste dans son arène.

### 40. Annoncer l’arrivée

La grille, la brèche ou le parapet associé à la rencontre signale l’arrivée. Les créatures sont vulnérables pendant leur émergence mais n’attaquent qu’une fois au sol.

### 41. Les derniers passagers

Déclencher l’embarquement avec E, puis couvrir la zone. La progression avance à proximité de l’appareil. Molly doit rejoindre la porte ; les blessés montent successivement. Les renforts ennemis sont limités.

### 42. Piloter dans la vallée

Les flèches gauche et droite règlent l’allure ; haut et bas commandent l’altitude. Maintenir X freine. Il n’y a pas de tir embarqué. La séquence est une adaptation 2D, pas un simulateur aéronautique.

### 43. Tenir dans l’onde

Le choc endommage inévitablement l’appareil et le déstabilise. Garder une marge au-dessus des reliefs, corriger sans rester collé au plafond, puis préparer la descente.

### 44. Une clairière, pas une piste

Dans la zone marquée, ralentir sous la limite affichée et descendre doucement. Un contact trop brutal endommage la coque. L’atterrissage réussi conduit à l’épilogue existant ; il ne change pas le destin de Wolf.

### 45. Points de reprise

Un objectif terminé à l’abri crée un point de reprise. Les étapes du vol offrent aussi une reprise lorsque l’appareil dispose d’une marge suffisante. L’export contient ce point sans empiler indéfiniment les sauvegardes.

### 46. Continuer une ancienne sauvegarde

Les identifiants des anciennes séquences sont conservés. Une sauvegarde 0.1 ou 0.2 déjà arrivée à la clairière y reste : la nouvelle scène aérienne n’est pas imposée rétroactivement.

### 47. La porte ne soigne personne

Les PV et la position d’un poursuivant appartiennent à la même créature. Le passage ne la réinitialise pas. Une alerte locale précise le seuil menacé sans révéler un ennemi dans une autre zone.

### 48. Une scène jouable, pas un nouveau canon

La route aérienne, sa géométrie, les verrous et les séquences d’embarquement sont créés pour le gameplay. Le module conserve la trame de sa version précédente et ne prétend pas reproduire les plans du film.

### 49. Les locaux de service

Les cinq annexes se rejoignent par une vraie ouverture depuis la séquence courante. Elles ne remplacent pas les objectifs principaux. Un second raccord peut rester hors parcours pour cette séquence.

### 50. Une issue à libérer

La commande mécanique se trouve du côté intérieur. Une fois manœuvrée, l’issue reste ouverte pendant la nuit, y compris après un changement de personnage.

### 51. Prendre sans gaspiller

Les coffrets restent ouverts. Ce qui ne tient pas dans votre dotation reste dans le contenant. Repasser une porte, changer de séquence ou recharger ne reconstitue pas le stock.

### 52. Les fusées éclairantes

L lance une fusée vers votre visée, à distance limitée ; sans souris, elle part devant vous. L’impact fait du bruit. Sa lumière peut attirer une créature qui la voit, mais elle ne vous rend pas invisible.

### 53. Un stock partagé

Les survivants partagent une réserve de six fusées au maximum. Wolf n’utilise ni leurs pansements ni leurs munitions dans les nouveaux contenants.

### 54. Ne comptez pas sur la lumière seule

Une créature qui vous aperçoit donne la priorité à votre présence. La fusée attire l’attention hors de votre position ; les murs la masquent.

### 55. Le carnet des équipes de nuit

Les cinq documents des annexes sont des textes originaux de cette adaptation. Ils expliquent leurs passages et la fonction de leurs machines, sans prétendre être des accessoires du film.

### 56. Ce que le plan ne sait pas encore

Les nouvelles annexes apparaissent sur le plan après repérage de leur entrée ou visite. Leur sortie secondaire reste non tracée tant qu’elle n’a pas été libérée.

### 57. Écouter le lieu

L’ambiance change avec la pièce. Les machines, gouttes, pas et commandes ont des sons synthétiques distincts. Le son reste facultatif et aucun indice indispensable ne dépend uniquement de lui.

### 58. Conserver la nuit

Les stocks, les sorties libérées et les fusées actives sont inclus dans la sauvegarde exportée. Les anciens fichiers 0.1 à 0.3 commencent avec des contenants encore intacts.

### 59. Plans originaux

La pharmacie, la blanchisserie, la réserve froide, la station de relevage et l’atelier sont des raccords de gameplay originaux. Les coordonnées ne décrivent pas la ville réelle.

### 60. Une cache n’est pas un arsenal

Trouver des munitions ne débloque pas l’arme avant sa séquence. Les soins ne sont pas automatiquement consommés lors de la fouille.

### 61. Balises laser

Y pose une balise vers la visée ; une courte ligne de coupe traverse le sol. Huit cellules pour la campagne, trois balises actives au maximum. La pose coûte vingt-cinq points d’énergie. Elle doit avoir un trajet et un faisceau dégagés.

### 62. Récupérer une balise

U récupère la balise inactive ou armée la plus proche, à moins de cent-vingt unités et sans obstacle. Une cellule est rendue, jamais l’énergie de pose. Une balise déclenchée est consommée. Les balises restantes sont rappelées au changement de séquence.

### 63. Neutralisant

N traite les flaques d’acide proches ou un dépôt analysé. Huit doses pour la campagne ; une dose par traitement terminé, même si plusieurs flaques sont traitées ensemble. Marcher ou subir un coup interrompt l’action sans consommer la dose.

### 64. Analyse de terrain

Wolf doit sélectionner la vision des traces avec V puis rester près d’un relevé et utiliser E. Les huit observations originales sont facultatives. Elles ne déverrouillent pas une arme et ne remplissent pas les réserves.

### 65. Dépôt neutralisé

Un dépôt analysé peut être neutralisé avec N. Son état vidé reste visible et sauvegardé pour la campagne. Les dépôts ne génèrent pas de renforts ; ils ne remplacent pas les objectifs scénarisés de nettoyage.

### 66. Électricité exposée

Les boîtiers marqués d’un éclair peuvent être atteints par les projectiles. Après une courte annonce, une zone électrique apparaît. Joueur et créatures peuvent être touchés si la ligne physique est dégagée. Le boîtier reste brûlé.

### 67. Conduite rompue

Un projectile peut ouvrir une conduite marquée de pression. Le souffle initial et la vapeur qui suit modifient le combat. La vapeur coupe la vue, pas les balles. Le mécanisme est distinct des vannes à deux utilisations.

### 68. Contre-attaque du Predalien

À partir de la deuxième phase, certains enchaînements ajoutent un coup de queue annoncé au sol. La zone reste fixe pendant l’annonce. Le masque et le plasma ne sont pas réactivés pour ce duel.

### 69. Charge interrompue

Guider une charge du Predalien contre un obstacle solide peut le déséquilibrer. Une brève exposition augmente les dégâts reçus. Le bord abstrait de la carte n’est pas un obstacle destructible ni une source infinie de bonus.

### 70. Dossier tactique

P ouvre les outils, les relevés, le bilan des balises et les dispositifs de la pièce. Le dossier met la simulation en pause. Aucun bouton ne déclenche un piège ou ne téléporte le personnage depuis le dossier.

### 71. Persistance des dispositifs

Boîtiers et dépôts sont enregistrés à l’échelle de la campagne. Leur durée active vieillit avec le temps simulé, même hors de la pièce ; les victimes hors champ ne sont pas simulées. Les menus suspendent ce temps.

### 72. Limites de cette passe

Les balises, relevés, conduites et contre-attaques sont des choix de gameplay originaux. Aucun nouveau film, plan de ville ou comportement biologique réel n’est documenté par ces systèmes. Le module reste séparé du moteur hôte.

### 73. Secours facultatifs

Quatre adultes originaux peuvent être accompagnés. Leur mise à l’abri est temporaire : elle ne change ni les passagers de l’hélicoptère ni le dénouement.

### 74. Nora Bell

Cuisinière rencontrée dans la réserve froide pendant la fuite de Ricky. Elle demande à rejoindre l’arrière-cuisine.

### 75. Luis Ortega

Mécanicien réfugié dans l’atelier. Dallas peut le guider vers la réserve du magasin après avoir récupéré les armes.

### 76. Owen Price

Technicien blessé au barrage. Kelly peut le conduire au poste de premiers secours du parking une fois le passage ouvert.

### 77. Mara Reed

Aide-soignante isolée dans la pharmacie. Dallas peut l’accompagner jusqu’au local de repli de la blanchisserie.

### 78. Appui sur le décor

B ou clic droit, côté humain, sélectionne un emplacement proche autour d’un des douze supports. Le déplacement est réel, puis le personnage s’accroupit. Ni invulnérabilité ni tir à travers le meuble.

### 79. Blessure et assistance

E près d’un adulte recruté blessé lance une aide immobile. Un kit est dépensé à la fin et rend 45 points de vitalité. À zéro, la personne reste au sol, sans compte à rebours de mort.

### 80. Rassurer le groupe

Z (touche physique W sur AZERTY) ou Rassurer émet un appel, réduit le stress des adultes visibles à proximité et rappelle l’escorte principale. Le son peut attirer une créature.

### 81. Attendre avec O

Avec un adulte recruté, O lui donne priorité et alterne attendre / suivre. L’escorte principale reste accessible par l’appel de groupe. Sans adulte, O garde son fonctionnement antérieur.

### 82. Stress lisible

Un adulte exposé à un ennemi proche prend peur ; un abri géométrique, la proximité du joueur et l’absence de menace l’apaisent. La panique ralentit sans créer une immobilité irréversible.

### 83. Relais sécurisé

Le joueur et l’adulte doivent être près du point de repli et ne pas avoir de menace visible à moins de 420 unités. E effectue un relais de deux secondes. Aucun soin ou matériel gratuit n’est accordé.

### 84. Continuité des secours

Les positions, blessures, ordres et issues des rencontres facultatives passent par l’export JSON. Quitter la séquence laisse un dossier non résolu ; l’objectif principal ne se bloque pas.

### 85. Franchissements en coupe

Huit raccords possèdent une traversée pilotée. L’écran montre le support, les deux destinations et les compagnons présents. Le chemin est contraint : pas de saut libre ni de chute simulée.

### 86. Avancer et faire demi-tour

Les flèches suivent la direction visible du support. Sur une échelle verticale, utilisez haut ou bas. Relâcher arrête le mouvement ; revenir au départ annule la traversée sans compter une nouvelle porte.

### 87. Observer les cycles

Trois passages présentent une conduite ou un câble endommagé. L’avertissement précède une activation courte, puis une accalmie. Attendez en dehors de la zone annoncée. Le risque dépend du temps de jeu, pas du nombre de pressions.

### 88. Le groupe dans le passage

Une escorte qui suit doit rejoindre le seuil avant l’entrée. Elle est visible dans le raccord. Les blessures et les inventaires ne sont pas restaurés à l’arrivée. Les personnes laissées en attente restent au départ.

### 89. Porter un adulte blessé

U près d’un adulte recruté ayant au plus 40 points de vitalité engage une prise interrompable. Le transport ne coûte aucun kit et ne soigne pas. Vous pouvez également porter une personne à zéro vitalité.

### 90. Deux mains occupées

Porter réduit la vitesse à 56 %. Tir, mêlée, esquive, sprint, couvert, soins personnels et lancer de fusée sont indisponibles. Les obstacles continuent à limiter le déplacement.

### 91. Déposer sans perte

U engage une dépose sur un emplacement proche et libre. Aucun objet ni soin n’est consommé. Une personne au sol reste au sol ; une personne consciente attend. Le personnage ne disparaît pas à la porte.

### 92. Les échelles restent impraticables en portant

Un adulte ne peut pas être porté sur une échelle verticale. Les itinéraires des quatre secours offrent des portes et escaliers. Relevez la personne ou choisissez un autre raccord.

### 93. Confier un blessé au relais

Un adulte porté peut être confié directement à son abri temporaire après le délai de relais et un contrôle de menace. Aucun kit et aucun point de vitalité ne sont créés.

### 94. Sauvegarder au milieu d’un passage

La position sur le support, le sens, les personnes présentes, les cycles touchés et le portage sont exportés. La pause arrête le temps. Un raccord invalide à l’import est abandonné au seuil d’origine autorisé.

### 95. Pas de refuge instantané

L’entrée d’un franchissement attend que les abords immédiats soient dégagés. Les pièces adjacentes ne sont pas simulées pendant la traversée. Le délai d’évacuation continue néanmoins.

### 96. Une transition, une arrivée

Une traversée complète déclenche exactement une porte réciproque et conserve les restrictions du chapitre. Un demi-tour ne valide pas la destination et ne distribue aucune récompense.

### 97. Huit circuits locaux

Deux bouches d’un même lieu forment un conduit local. Il ne relie pas deux salles différentes et ne peut pas être emprunté par le joueur.

### 98. La même créature

Un xénomorphe ordinaire ou un facehugger utilise son identité et ses blessures existantes. Aucun adversaire supplémentaire ne naît dans les conduits. Le Predalien est exclu.

### 99. Approche au sol

La créature rejoint une bouche accessible en utilisant les mêmes chemins et obstacles que sur le terrain. Une bouche condamnée refuse les nouvelles entrées.

### 100. Sortie annoncée

Après son passage caché, la créature annonce sa sortie pendant 1,5 seconde sans attaquer. Elle est vulnérable pendant son entrée et son émergence, mais pas derrière la paroi.

### 101. Six brides humaines

Le groupe possède six brides sur toute la campagne. E condamne une bouche proche en 1,4 seconde. Le matériel est débité uniquement à la fin du geste. Pas de recharge au changement de salle.

### 102. Fermeture de Wolf

Wolf ferme une bouche avec 25 unités d’énergie, sans puiser dans les brides humaines. Le masque retiré interdit cette manipulation. Bouger ou subir un coup annule le geste.

### 103. Un obstacle, pas une prison

La créature en transit choisit une autre bouche libre. Si les deux sont fermées, elle frappe une fermeture pendant quatre secondes au plus, puis annonce sa sortie.

### 104. Deux traversées maximum

Chaque créature peut accomplir au plus deux parcours de conduit dans la campagne. Elle attend au moins dix-huit secondes après une sortie. Aucun circuit n’annule les objectifs de combat.

### 105. Écouter sans radar

A sur AZERTY ou Q sur QWERTY lance 1,1 seconde d’écoute immobile. Le résultat indique un côté et une proximité, jamais une position exacte, un compte ou des points de vie.

### 106. Le bruit couvre les griffes

Une alarme, un tir ou une vanne proches peuvent masquer l’écoute. Aucun signal perçu ne signifie pas que la pièce est vide. Le son facultatif n’est pas nécessaire pour lire les annonces.

### 107. Une simulation locale

Hors de la salle courante et pendant un raccord architectural, les transits des conduits sont suspendus comme l’IA locale. Au retour, l’annonce restante reprend ; aucun coup n’est infligé hors écran.

### 108. La grille se souvient

Fermetures, blessures, itinéraires et durées restantes sont exportés. Les migrations ne créent aucun trajet accompli. Un transit invalide est remis au sol sans effacer l’ennemi de son objectif.

### 109. Les gestes de la nuit

Tab ouvre une roue d’actions. Les armes, le terrain, le groupe et les carnets sont séparés. Les menus suspendent le terrain ; une sélection ne dépense rien avant l’action.

### 110. Comprendre un refus

Un outil indisponible reste lisible avec sa raison. Une main occupée, un passage en coupe, une dotation vide ou une récupération ne se contournent pas par la roue.

### 111. Préparer sans tirer

La roue peut préparer une balise ou charger le plasma. La visée reprend sur le terrain ; Attaque confirme, Échap annule sans consommer une cellule. Une charge interrompue n’est pas tirée à la fermeture d’un menu.

### 112. Les deux sticks

Une manette au mapping standard déplace avec le stick gauche et vise avec le droit. Les boutons bas, droite, gauche et haut servent à utiliser, esquiver, recharger et ouvrir la roue.

### 113. Du repos à la marche

La zone morte radiale des sticks est réglable de 12 à 38 %. L’inclinaison restante module l’allure. La gâchette gauche ralentit la marche ; pendant le vol elle freine.

### 114. Lire sans souris

La croix directionnelle parcourt les boutons, le bouton bas les active et le bouton droit revient. Les épaules changent de famille dans la roue. Les sliders et listes des réglages se modifient horizontalement.

### 115. Une liaison rompue

Déconnecter la manette utilisée met le terrain en pause. Après un menu, les commandes doivent revenir au repos avant de produire une nouvelle action. Le clavier reste disponible.

### 116. Revenir dans la nuit

Les séquences déjà atteintes dans la campagne peuvent être rejouées séparément. Une reprise ne débloque aucun chapitre suivant. La première séquence est disponible au départ.

### 117. Deux progressions séparées

La campagne et la reprise utilisent des clés locales et des points de reprise distincts. Blessures, réserves, notes et secours gagnés en reprise ne reviennent pas dans la campagne.

### 118. Mémorisée ou reconstituée

La 0.9 mémorise la première entrée de chaque chapitre. Les anciennes séquences sans cette capture reçoivent une dotation d’entraînement clairement indiquée, pas une reconstruction prétendument exacte du passé.

### 119. Emporter une reprise

L’export d’une reprise possède un format distinct, avec son chapitre, son état et son entrée initiale. Le réimport reprend ce mode isolé au lieu de remplacer la campagne principale.

### 120. Le terrain au premier plan

Le tactile compact conserve le déplacement, l’attaque, l’esquive et l’interaction à l’écran. La roue donne accès aux autres outils. Le panneau de commandes complet reste disponible dans les réglages.

### 121. Lames de poignet

Lames rapprochées, disponibles au duel. Statut : jouable

### 122. Combistick

Nouvelle attaque d’allonge ; pas de lancer de lance ajouté. Statut : jouable

### 123. Shuriken à six lames

Trois exemplaires initiaux, vol et récupération physique ; indisponible après abandon de l’équipement. Statut : jouable

### 124. Canon(s) d’épaule

Second canon visible après lecture du masque ; armement d’épaule retiré après reconfiguration. Statut : jouable

### 125. Pistolet plasma transformé

Wolf : énergie ; Dallas : système de charges hérité, approximation explicitée. Statut : jouable

### 126. Fouet

Attaque longue et étourdissement conservés. Statut : jouable

### 127. Gantelet de force

Rupture localisée de la dalle du collecteur, pas destruction universelle. Statut : contextuel

### 128. Mines / maillage laser

Balises de la 0.5 : faisceau unique, pas reproduction exacte de tout le maillage du film. Statut : jouable adapté

### 129. Liquide dissolvant

Neutralise acide et dépôts analysés, pas toutes les matières organiques du décor. Statut : jouable adapté

### 130. Bio-masque et visions

État porté/retiré et visées ; reproduction graphique stylisée. Statut : jouable

### 131. Camouflage

Coût et détection réglés pour le jeu, pas mesures du film. Statut : jouable

### 132. Trousse médicale

Soin immobile consommable ; procédure visuelle non reproduite intégralement. Statut : jouable adapté

### 133. Autodestruction du vaisseau

Interaction existante, explosion racontée ; pas destruction physique de toute la coque. Statut : objectif narratif

### 134. Winchester 1200

Ancien fusil générique renommé et redessiné ; réglages conservés. Statut : jouable

### 135. Glock 17, 2e génération

Profil visuel du pistolet de Ricky ; réserve générique conservée, non modèle balistique distinct. Statut : jouable adapté

### 136. Beretta 92FS

Profil visuel du pistolet humain tardif ; magasin militaire, pas dotation de départ. Statut : jouable adapté

### 137. M4A1

Râtelier du Stryker, chargeur de trente et réserve finie. Statut : jouable

### 138. Remington 700

Deux exemplaires dans la clairière ; pas remis à Wolf comme arme utilisable. Statut : décor inspectable

### 139. Remington 870

Silhouette au rassemblement ; PNJ non combattant simulé. Statut : représentation PNJ

### 140. Colt Python

Présence attribuée au montage long ; personnage et tir non rejoués. Statut : registre seulement · montage long

### 141. MP5A3

Périmètre final ; non offert dans la campagne. Statut : représentation PNJ

### 142. MP5SD3

Variante signalée, pas un nouveau PNJ actif. Statut : registre seulement

### 143. GUU-5P / Colt 723 ?

Identification secondaire ambiguë, ne pas certifier GUU-5P. Statut : registre seulement · incertain

### 144. Browning M2HB

Tourelle fixée au Stryker ; pas de tir monté. Statut : décor

### 145. Daewoo K3 modifiée

Accessoire pouvant représenter une M249 ; modèle exact non revalidé ici. Statut : registre seulement

### 146. M249 SAW Para

Silhouette au périmètre final, pas d’arme joueur. Statut : représentation PNJ

### 147. Cobray CM203

Ne pas assimiler sans réserve à un M203 militaire. Statut : registre seulement

### 148. Jumelles de vision nocturne

Posées dans la chambre ; aucun mode jouable de Molly ajouté. Statut : décor

### 149. Radio de police et communication

Ordres et dispositifs sonores existants. Statut : contextuel

### 150. Fusées / brides / soins humains

Consommables de gameplay ; aucun statut d’accessoire canonique garanti. Statut : jouable original

### 151. Monde des Yautja — salle de Wolf

Architecture monumentale, lumière chaude et équipement avant départ. Il manque encore la préparation jouable et le voyage. Aucun portail pédestre vers Gunnison.

### 152. Poste de commandement du colonel Stevens

Écrans et carte de confinement. Les décisions sont racontées ; aucune carte réelle militaire ou commande stratégique jouable.

### 153. Bureau de Yutani — remise du plasma

Arme déposée sur une table dans un intérieur corporatif. La remise reste un épilogue raconté, pas un niveau d’exploration.

## 156 règles de conception héritées

Les règles suivantes restent le corpus antérieur. Les contrats et contrôles spécifiques à la 0.10 sont explicités dans le présent audit, sans inventer un nouveau total.

1. {"id": "LD-001", "category": "Géographie", "rule": "Chaque porte possède un retour vers sa salle d’origine."}
2. {"id": "LD-002", "category": "Géographie", "rule": "La clairière est atteinte après le couloir aérien jouable. Aucune porte au sol ne relie directement le toit à la forêt."}
3. {"id": "LD-003", "category": "Géographie", "rule": "Un étage est atteint par un escalier ou une gaine explicitement nommée."}
4. {"id": "LD-004", "category": "Géographie", "rule": "Le sous-sol hospitalier est raccordé au réseau de maintenance."}
5. {"id": "LD-005", "category": "Géographie", "rule": "La place de rassemblement ne constitue pas une fin heureuse alternative."}
6. {"id": "LD-006", "category": "Géographie", "rule": "Les portes indiquent une destination, pas un identifiant de développement."}
7. {"id": "LD-007", "category": "Placement", "rule": "Un passage central continu reste libre dans chaque salle latérale."}
8. {"id": "LD-008", "category": "Placement", "rule": "Un volume protégé entoure chaque accès et chaque objet critique."}
9. {"id": "LD-009", "category": "Placement", "rule": "Les véhicules restent sur le parking ou la chaussée, pas dans les chambres."}
10. {"id": "LD-010", "category": "Placement", "rule": "Les équipements médicaux sont réservés aux services correspondants."}
11. {"id": "LD-011", "category": "Placement", "rule": "Le bassin empêche physiquement de traverser l’eau à pied."}
12. {"id": "LD-012", "category": "Placement", "rule": "Les meubles de premier plan ne masquent pas durablement le personnage."}
13. {"id": "LD-013", "category": "Profondeur", "rule": "La collision est calculée au pied de chaque acteur."}
14. {"id": "LD-014", "category": "Profondeur", "rule": "Les acteurs, meubles et ombres sont triés par profondeur."}
15. {"id": "LD-015", "category": "Profondeur", "rule": "Le projectile utilise les mêmes coordonnées que la cible."}
16. {"id": "LD-016", "category": "Profondeur", "rule": "Le déplacement diagonal est normalisé."}
17. {"id": "LD-017", "category": "Profondeur", "rule": "Une galerie latérale verrouille sa coordonnée de profondeur."}
18. {"id": "LD-018", "category": "Profondeur", "rule": "Le point de retour est choisi près de la porte réciproque et hors des meubles."}
19. {"id": "LD-019", "category": "Visuel", "rule": "Le ciel ou le plafond remplit le champ de jeu dès son bord supérieur."}
20. {"id": "LD-020", "category": "Visuel", "rule": "La pluie, la brume et les lumières ne couvrent pas l’objectif."}
21. {"id": "LD-021", "category": "Visuel", "rule": "Le décor lointain glisse moins vite que le premier plan."}
22. {"id": "LD-022", "category": "Visuel", "rule": "Le sol, le mur, le plafond et la signalétique sont des couches distinctes."}
23. {"id": "LD-023", "category": "Visuel", "rule": "Les props réutilisent un vocabulaire local, pas des rectangles sans fonction."}
24. {"id": "LD-024", "category": "Visuel", "rule": "Une scène nocturne conserve une luminance minimale."}
25. {"id": "LD-025", "category": "Lore", "rule": "Wolf n’est pas présenté comme un membre du groupe humain."}
26. {"id": "LD-026", "category": "Lore", "rule": "Aucune reine n’est ajoutée au duel du film."}
27. {"id": "LD-027", "category": "Lore", "rule": "Le masque est perdu avant le duel final."}
28. {"id": "LD-028", "category": "Lore", "rule": "La panne suit le combat à la centrale."}
29. {"id": "LD-029", "category": "Lore", "rule": "Le pistolet plasma humain reste verrouillé avant l’hôpital."}
30. {"id": "LD-030", "category": "Lore", "rule": "La frappe et la confiscation de l’arme restent dans la résolution."}
31. {"id": "LD-031", "category": "Interface", "rule": "Aucun panneau de production ne reste au-dessus du jeu."}
32. {"id": "LD-032", "category": "Interface", "rule": "Le plan ne téléporte pas le joueur."}
33. {"id": "LD-033", "category": "Interface", "rule": "Les objectifs affichent une action naturelle et un lieu."}
34. {"id": "LD-034", "category": "Interface", "rule": "Les modales piègent le focus et se ferment au clavier."}
35. {"id": "LD-035", "category": "Interface", "rule": "Les contrôles tactiles annulent leurs entrées au relâchement."}
36. {"id": "LD-036", "category": "Interface", "rule": "L’option audio reste muette avant activation volontaire."}
37. {"id": "LD-037", "category": "Persistance", "rule": "Aucune clé de sauvegarde du jeu principal n’est modifiée."}
38. {"id": "LD-038", "category": "Persistance", "rule": "Les données importées sont bornées et filtrées explicitement."}
39. {"id": "LD-039", "category": "Persistance", "rule": "Les blessures et les munitions ne se réinitialisent pas à chaque porte."}
40. {"id": "LD-040", "category": "Persistance", "rule": "Les rencontres ne réapparaissent pas après une mort sauvegardée."}
41. {"id": "LD-041", "category": "Persistance", "rule": "Un changement de séquence crée un point de reprise séparé."}
42. {"id": "LD-042", "category": "Persistance", "rule": "Un futur schéma de sauvegarde n’est jamais accepté silencieusement."}
43. {"id": "LD-043", "category": "QA", "rule": "Le graphe doit permettre chaque objectif de chaque séquence."}
44. {"id": "LD-044", "category": "QA", "rule": "Le retour par une porte ne doit pas déclencher une boucle de transition."}
45. {"id": "LD-045", "category": "QA", "rule": "Le boss doit rester résoluble sans arme à distance."}
46. {"id": "LD-046", "category": "QA", "rule": "Une erreur de stockage doit être signalée, pas annoncée comme une sauvegarde."}
47. {"id": "LD-047", "category": "QA", "rule": "Le rapport distingue parcours simulés et manipulation réelle du navigateur."}
48. {"id": "LD-048", "category": "QA", "rule": "Une capture de validation n’est jamais présentée comme une capture du film."}
49. {"id": "LD-049", "category": "Navigation", "rule": "Les alliés et ennemis utilisent la même géométrie de sol que le joueur."}
50. {"id": "LD-050", "category": "Navigation", "rule": "Un chemin diagonal ne peut pas couper le coin d’un obstacle."}
51. {"id": "LD-051", "category": "Navigation", "rule": "Les pas rapides sont subdivisés pour éviter de traverser un meuble."}
52. {"id": "LD-052", "category": "Perception", "rule": "Une créature ordinaire doit voir, entendre ou vérifier un souvenir de position."}
53. {"id": "LD-053", "category": "Perception", "rule": "La recherche ne suit pas la position cachée du joueur à chaque image."}
54. {"id": "LD-054", "category": "Perception", "rule": "Une alarme possède une position et une durée, pas un bonus abstrait."}
55. {"id": "LD-055", "category": "Perception", "rule": "La vapeur affecte la vision dans son volume, sans effacer les collisions."}
56. {"id": "LD-056", "category": "Combat", "rule": "Les coups de mêlée vérifient une ligne dégagée jusqu’à leur cible."}
57. {"id": "LD-057", "category": "Combat", "rule": "La charge du boss verrouille sa direction avant de partir."}
58. {"id": "LD-058", "category": "Combat", "rule": "Les états d’annonce et de récupération sont visibles."}
59. {"id": "LD-059", "category": "Combat", "rule": "Une cartouche produit six projectiles pour le fusil à pompe."}
60. {"id": "LD-060", "category": "Combat", "rule": "Les bonus de combo retombent après une interruption."}
61. {"id": "LD-061", "category": "Combat", "rule": "La parade coûte du souffle et ne remplace pas l’esquive du boss."}
62. {"id": "LD-062", "category": "Sauvegarde", "rule": "Les données 0.1 migrent par valeurs par défaut sans changer de clef de stockage."}
63. {"id": "LD-063", "category": "Sauvegarde", "rule": "Une sortie ne soigne ni ne réapprovisionne le groupe."}
64. {"id": "LD-064", "category": "Escorte", "rule": "Un allié suit un chemin physique et ne traverse pas la piscine."}
65. {"id": "LD-065", "category": "Escorte", "rule": "Attendre et suivre sont des ordres distincts, conservés dans la sauvegarde."}
66. {"id": "LD-066", "category": "Escorte", "rule": "Le changement de salle attend que le compagnon soit à proximité."}
67. {"id": "LD-067", "category": "Image", "rule": "Une porte doit être liée à un mur, un retour, un seuil ou une trémie."}
68. {"id": "LD-068", "category": "Image", "rule": "Un escalier de premier plan est une coupe, pas un panneau debout sur le sol."}
69. {"id": "LD-069", "category": "Image", "rule": "Les textures de mur et de sol sont déterministes, sans clignotement."}
70. {"id": "LD-070", "category": "Image", "rule": "Le décor reste lisible lorsque les éclairages locaux sont coupés."}
71. {"id": "LD-071", "category": "QA", "rule": "Le parcours automatisé complet utilise les déplacements et attaques du moteur."}
72. {"id": "LD-072", "category": "QA", "rule": "Les captures de test avancées sont étiquetées comme états préparés."}
73. {"id": "LD-073", "title": "Poursuite au seuil", "rule": "Une créature qui vous a vu franchir un passage peut suivre. Le bruit et la silhouette apparaissent au seuil annoncé ; elle ne se matérialise pas au milieu de la pièce. Les changements de chapitre ne transportent pas les poursuivants."}
74. {"id": "LD-074", "title": "Verrou de proximité", "rule": "Près d’une porte battante, K verrouille ou libère le battant. Un poursuivant le frappe et finit par détruire le verrou. Le verrou cassé reste cassé pour la séquence. Les échelles, rues et escaliers ne se verrouillent pas."}
75. {"id": "LD-075", "title": "Réserves finies", "rule": "Chaque ennemi scénarisé possède un identifiant unique. Changer de pièce ne recrée pas une créature déjà déplacée, blessée ou morte. Le Predalien reste dans son arène."}
76. {"id": "LD-076", "title": "Annoncer l’arrivée", "rule": "La grille, la brèche ou le parapet associé à la rencontre signale l’arrivée. Les créatures sont vulnérables pendant leur émergence mais n’attaquent qu’une fois au sol."}
77. {"id": "LD-077", "title": "Les derniers passagers", "rule": "Déclencher l’embarquement avec E, puis couvrir la zone. La progression avance à proximité de l’appareil. Molly doit rejoindre la porte ; les blessés montent successivement. Les renforts ennemis sont limités."}
78. {"id": "LD-078", "title": "Piloter dans la vallée", "rule": "Les flèches gauche et droite règlent l’allure ; haut et bas commandent l’altitude. Maintenir X freine. Il n’y a pas de tir embarqué. La séquence est une adaptation 2D, pas un simulateur aéronautique."}
79. {"id": "LD-079", "title": "Tenir dans l’onde", "rule": "Le choc endommage inévitablement l’appareil et le déstabilise. Garder une marge au-dessus des reliefs, corriger sans rester collé au plafond, puis préparer la descente."}
80. {"id": "LD-080", "title": "Une clairière, pas une piste", "rule": "Dans la zone marquée, ralentir sous la limite affichée et descendre doucement. Un contact trop brutal endommage la coque. L’atterrissage réussi conduit à l’épilogue existant ; il ne change pas le destin de Wolf."}
81. {"id": "LD-081", "title": "Points de reprise", "rule": "Un objectif terminé à l’abri crée un point de reprise. Les étapes du vol offrent aussi une reprise lorsque l’appareil dispose d’une marge suffisante. L’export contient ce point sans empiler indéfiniment les sauvegardes."}
82. {"id": "LD-082", "title": "Continuer une ancienne sauvegarde", "rule": "Les identifiants des anciennes séquences sont conservés. Une sauvegarde 0.1 ou 0.2 déjà arrivée à la clairière y reste : la nouvelle scène aérienne n’est pas imposée rétroactivement."}
83. {"id": "LD-083", "title": "La porte ne soigne personne", "rule": "Les PV et la position d’un poursuivant appartiennent à la même créature. Le passage ne la réinitialise pas. Une alerte locale précise le seuil menacé sans révéler un ennemi dans une autre zone."}
84. {"id": "LD-084", "title": "Une scène jouable, pas un nouveau canon", "rule": "La route aérienne, sa géométrie, les verrous et les séquences d’embarquement sont créés pour le gameplay. Le module conserve la trame de sa version précédente et ne prétend pas reproduire les plans du film."}
85. {"id": "LD-085", "category": "Architecture", "rule": "Une annexe porte une fonction, un niveau et deux raccords définis avant ses props."}
86. {"id": "LD-086", "category": "Architecture", "rule": "Chaque machine possède un support au sol et un raccord mural ; les passages en profondeur restent libres."}
87. {"id": "LD-087", "category": "Architecture", "rule": "Une porte de service vers un étage différent est un escalier nommé, jamais une téléportation sans raccord."}
88. {"id": "LD-088", "category": "Navigation", "rule": "La commande de raccourci est atteignable depuis l’entrée principale sans ouvrir la sortie secondaire."}
89. {"id": "LD-089", "category": "Navigation", "rule": "L’ouverture persistante ne remplace jamais les conditions de séquence d’une porte."}
90. {"id": "LD-090", "category": "Exploration", "rule": "Les nouvelles annexes et leurs liens secondaires ne sont pas révélés d’avance sur le plan."}
91. {"id": "LD-091", "category": "Objets", "rule": "La zone d’interaction d’un contenant se trouve devant son volume de collision ; les allées latérales restent accessibles."}
92. {"id": "LD-092", "category": "Objets", "rule": "Les contenus sont déterministes et liés à la fonction du lieu ; aucun réapprovisionnement par changement de pièce."}
93. {"id": "LD-093", "category": "Objets", "rule": "Une capacité pleine laisse le reliquat dans le coffret et ne détruit aucun objet."}
94. {"id": "LD-094", "category": "Perception", "rule": "La fusée est un stimulus visible local ; les obstacles empêchent sa détection et la vision du joueur conserve la priorité."}
95. {"id": "LD-095", "category": "Sauvegarde", "rule": "Un import filtre IDs, types, stocks, positions et durées ; aucun champ inconnu ne crée d’équipement."}
96. {"id": "LD-096", "category": "Validation", "rule": "La circulation, les supports, les interactions, les retours et les reprises sont audités séparément. Les tests automatisés ne sont pas une validation humaine du rythme."}
97. {"id": "V05-01", "category": "Chasse tactique", "rule": "La pose teste le trajet vers la balise et tout le faisceau contre la géométrie solide, avant toute consommation."}
98. {"id": "V05-02", "category": "Chasse tactique", "rule": "Une balise ne se déclenche qu’après son armement et une intersection physique avec une créature vivante non émergente."}
99. {"id": "V05-03", "category": "Chasse tactique", "rule": "Un déplacement rapide d’une créature est testé entre ses deux positions pour ne pas sauter le faisceau."}
100. {"id": "V05-04", "category": "Chasse tactique", "rule": "Une cellule récupérée ne rend pas l’énergie ; une cellule consommée ne réapparaît pas au chargement."}
101. {"id": "V05-05", "category": "Chasse tactique", "rule": "Le nettoyage interrompu ne consomme rien. Aucune flaque derrière un obstacle n’est neutralisée."}
102. {"id": "V05-06", "category": "Chasse tactique", "rule": "Un relevé exige Wolf, le masque, la vision des traces, la proximité et une ligne de vue."}
103. {"id": "V05-07", "category": "Chasse tactique", "rule": "Les relevés facultatifs ne remplacent ni les objectifs principaux ni leurs priorités d’interaction."}
104. {"id": "V05-08", "category": "Chasse tactique", "rule": "Un boîtier ne peut être atteint à travers un obstacle ou un ennemi placé avant lui sur le projectile."}
105. {"id": "V05-09", "category": "Chasse tactique", "rule": "Le danger d’un boîtier est annoncé avant de blesser ; la zone active cesse à son échéance."}
106. {"id": "V05-10", "category": "Chasse tactique", "rule": "Le coup de queue possède une empreinte et une orientation verrouillées, une annonce et une récupération."}
107. {"id": "V05-11", "category": "Chasse tactique", "rule": "La vulnérabilité du Predalien ne multiplie qu’une fois les dégâts, ne se cumule pas et n’efface pas la phase."}
108. {"id": "V05-12", "category": "Chasse tactique", "rule": "Les sauvegardes, points de reprise et bilans transportent le même état tactique sans écrire dans le profil Frontier."}
109. {"id": "v06.rule.01", "category": "Survivants", "rule": "Les quatre adultes sont des créations originales, jamais des victimes identifiées du film."}
110. {"id": "v06.rule.02", "category": "Survivants", "rule": "Leur sécurité est locale et temporaire : aucun passager ou dénouement supplémentaire."}
111. {"id": "v06.rule.03", "category": "Survivants", "rule": "Les quatre rencontres optionnelles ont une réserve finie et ne se déclenchent qu’après recrutement."}
112. {"id": "v06.rule.04", "category": "Survivants", "rule": "Un ennemi ne frappe pas le joueur et un adulte à la fois pendant la même annonce."}
113. {"id": "v06.rule.05", "category": "Survivants", "rule": "Les attaques contre un adulte annoncent leur point de frappe ; la géométrie reste vérifiée au contact."}
114. {"id": "v06.rule.06", "category": "Survivants", "rule": "Un adulte à terre ne marche plus ; aucune mort graphique ou échéance automatique."}
115. {"id": "v06.rule.07", "category": "Survivants", "rule": "Un soin consomme un kit après validation immobile, jamais au lancement ou à l’interruption."}
116. {"id": "v06.rule.08", "category": "Survivants", "rule": "Un seuil attend les suiveurs ; une personne laissée en attente reste dans sa pièce."}
117. {"id": "v06.rule.09", "category": "Survivants", "rule": "Un changement de séquence clôt les dossiers non résolus sans bloquer les cinquante objectifs."}
118. {"id": "v06.rule.10", "category": "Survivants", "rule": "La mise à couvert parcourt le sol réel ; aucune téléportation ni traversée de meuble."}
119. {"id": "v06.rule.11", "category": "Survivants", "rule": "Tirer ou marcher annule l’appui ; le meuble reste un obstacle pour les projectiles."}
120. {"id": "v06.rule.12", "category": "Survivants", "rule": "Un import filtre identifiants, quantités, coordonnées, doublons et états de combat facultatifs."}
121. {"id": "AVPR-TR-01", "category": "Traversées et transport", "rule": "Huit raccords possèdent une traversée pilotée. L’écran montre le support, les deux destinations et les compagnons présents. Le chemin est contraint : pas de saut libre ni de chute simulée."}
122. {"id": "AVPR-TR-02", "category": "Traversées et transport", "rule": "Les flèches suivent la direction visible du support. Sur une échelle verticale, utilisez haut ou bas. Relâcher arrête le mouvement ; revenir au départ annule la traversée sans compter une nouvelle porte."}
123. {"id": "AVPR-TR-03", "category": "Traversées et transport", "rule": "Trois passages présentent une conduite ou un câble endommagé. L’avertissement précède une activation courte, puis une accalmie. Attendez en dehors de la zone annoncée. Le risque dépend du temps de jeu, pas du nombre de pressions."}
124. {"id": "AVPR-TR-04", "category": "Traversées et transport", "rule": "Une escorte qui suit doit rejoindre le seuil avant l’entrée. Elle est visible dans le raccord. Les blessures et les inventaires ne sont pas restaurés à l’arrivée. Les personnes laissées en attente restent au départ."}
125. {"id": "AVPR-TR-05", "category": "Traversées et transport", "rule": "U près d’un adulte recruté ayant au plus 40 points de vitalité engage une prise interrompable. Le transport ne coûte aucun kit et ne soigne pas. Vous pouvez également porter une personne à zéro vitalité."}
126. {"id": "AVPR-TR-06", "category": "Traversées et transport", "rule": "Porter réduit la vitesse à 56 %. Tir, mêlée, esquive, sprint, couvert, soins personnels et lancer de fusée sont indisponibles. Les obstacles continuent à limiter le déplacement."}
127. {"id": "AVPR-TR-07", "category": "Traversées et transport", "rule": "U engage une dépose sur un emplacement proche et libre. Aucun objet ni soin n’est consommé. Une personne au sol reste au sol ; une personne consciente attend. Le personnage ne disparaît pas à la porte."}
128. {"id": "AVPR-TR-08", "category": "Traversées et transport", "rule": "Un adulte ne peut pas être porté sur une échelle verticale. Les itinéraires des quatre secours offrent des portes et escaliers. Relevez la personne ou choisissez un autre raccord."}
129. {"id": "AVPR-TR-09", "category": "Traversées et transport", "rule": "Un adulte porté peut être confié directement à son abri temporaire après le délai de relais et un contrôle de menace. Aucun kit et aucun point de vitalité ne sont créés."}
130. {"id": "AVPR-TR-10", "category": "Traversées et transport", "rule": "La position sur le support, le sens, les personnes présentes, les cycles touchés et le portage sont exportés. La pause arrête le temps. Un raccord invalide à l’import est abandonné au seuil d’origine autorisé."}
131. {"id": "AVPR-TR-11", "category": "Traversées et transport", "rule": "L’entrée d’un franchissement attend que les abords immédiats soient dégagés. Les pièces adjacentes ne sont pas simulées pendant la traversée. Le délai d’évacuation continue néanmoins."}
132. {"id": "AVPR-TR-12", "category": "Traversées et transport", "rule": "Une traversée complète déclenche exactement une porte réciproque et conserve les restrictions du chapitre. Un demi-tour ne valide pas la destination et ne distribue aucune récompense."}
133. {"id": "AVPR-DC-01", "category": "Conduits et écoute", "rule": "Deux bouches d’un même lieu forment un conduit local. Il ne relie pas deux salles différentes et ne peut pas être emprunté par le joueur."}
134. {"id": "AVPR-DC-02", "category": "Conduits et écoute", "rule": "Un xénomorphe ordinaire ou un facehugger utilise son identité et ses blessures existantes. Aucun adversaire supplémentaire ne naît dans les conduits. Le Predalien est exclu."}
135. {"id": "AVPR-DC-03", "category": "Conduits et écoute", "rule": "La créature rejoint une bouche accessible en utilisant les mêmes chemins et obstacles que sur le terrain. Une bouche condamnée refuse les nouvelles entrées."}
136. {"id": "AVPR-DC-04", "category": "Conduits et écoute", "rule": "Après son passage caché, la créature annonce sa sortie pendant 1,5 seconde sans attaquer. Elle est vulnérable pendant son entrée et son émergence, mais pas derrière la paroi."}
137. {"id": "AVPR-DC-05", "category": "Conduits et écoute", "rule": "Le groupe possède six brides sur toute la campagne. E condamne une bouche proche en 1,4 seconde. Le matériel est débité uniquement à la fin du geste. Pas de recharge au changement de salle."}
138. {"id": "AVPR-DC-06", "category": "Conduits et écoute", "rule": "Wolf ferme une bouche avec 25 unités d’énergie, sans puiser dans les brides humaines. Le masque retiré interdit cette manipulation. Bouger ou subir un coup annule le geste."}
139. {"id": "AVPR-DC-07", "category": "Conduits et écoute", "rule": "La créature en transit choisit une autre bouche libre. Si les deux sont fermées, elle frappe une fermeture pendant quatre secondes au plus, puis annonce sa sortie."}
140. {"id": "AVPR-DC-08", "category": "Conduits et écoute", "rule": "Chaque créature peut accomplir au plus deux parcours de conduit dans la campagne. Elle attend au moins dix-huit secondes après une sortie. Aucun circuit n’annule les objectifs de combat."}
141. {"id": "AVPR-DC-09", "category": "Conduits et écoute", "rule": "A sur AZERTY ou Q sur QWERTY lance 1,1 seconde d’écoute immobile. Le résultat indique un côté et une proximité, jamais une position exacte, un compte ou des points de vie."}
142. {"id": "AVPR-DC-10", "category": "Conduits et écoute", "rule": "Une alarme, un tir ou une vanne proches peuvent masquer l’écoute. Aucun signal perçu ne signifie pas que la pièce est vide. Le son facultatif n’est pas nécessaire pour lire les annonces."}
143. {"id": "AVPR-DC-11", "category": "Conduits et écoute", "rule": "Hors de la salle courante et pendant un raccord architectural, les transits des conduits sont suspendus comme l’IA locale. Au retour, l’annonce restante reprend ; aucun coup n’est infligé hors écran."}
144. {"id": "AVPR-DC-12", "category": "Conduits et écoute", "rule": "Fermetures, blessures, itinéraires et durées restantes sont exportés. Les migrations ne créent aucun trajet accompli. Un transit invalide est remis au sol sans effacer l’ennemi de son objectif."}
145. {"id": "v09.wheel", "rule": "Tab ouvre une roue d’actions. Les armes, le terrain, le groupe et les carnets sont séparés. Les menus suspendent le terrain ; une sélection ne dépense rien avant l’action.", "category": "Reprises et commandes"}
146. {"id": "v09.disabled", "rule": "Un outil indisponible reste lisible avec sa raison. Une main occupée, un passage en coupe, une dotation vide ou une récupération ne se contournent pas par la roue.", "category": "Reprises et commandes"}
147. {"id": "v09.preparation", "rule": "La roue peut préparer une balise ou charger le plasma. La visée reprend sur le terrain ; Attaque confirme, Échap annule sans consommer une cellule. Une charge interrompue n’est pas tirée à la fermeture d’un menu.", "category": "Reprises et commandes"}
148. {"id": "v09.pad", "rule": "Une manette au mapping standard déplace avec le stick gauche et vise avec le droit. Les boutons bas, droite, gauche et haut servent à utiliser, esquiver, recharger et ouvrir la roue.", "category": "Reprises et commandes"}
149. {"id": "v09.deadzones", "rule": "La zone morte radiale des sticks est réglable de 12 à 38 %. L’inclinaison restante module l’allure. La gâchette gauche ralentit la marche ; pendant le vol elle freine.", "category": "Reprises et commandes"}
150. {"id": "v09.padmenus", "rule": "La croix directionnelle parcourt les boutons, le bouton bas les active et le bouton droit revient. Les épaules changent de famille dans la roue. Les sliders et listes des réglages se modifient horizontalement.", "category": "Reprises et commandes"}
151. {"id": "v09.disconnect", "rule": "Déconnecter la manette utilisée met le terrain en pause. Après un menu, les commandes doivent revenir au repos avant de produire une nouvelle action. Le clavier reste disponible.", "category": "Reprises et commandes"}
152. {"id": "v09.library", "rule": "Les séquences déjà atteintes dans la campagne peuvent être rejouées séparément. Une reprise ne débloque aucun chapitre suivant. La première séquence est disponible au départ.", "category": "Reprises et commandes"}
153. {"id": "v09.isolated", "rule": "La campagne et la reprise utilisent des clés locales et des points de reprise distincts. Blessures, réserves, notes et secours gagnés en reprise ne reviennent pas dans la campagne.", "category": "Reprises et commandes"}
154. {"id": "v09.entries", "rule": "La 0.9 mémorise la première entrée de chaque chapitre. Les anciennes séquences sans cette capture reçoivent une dotation d’entraînement clairement indiquée, pas une reconstruction prétendument exacte du passé.", "category": "Reprises et commandes"}
155. {"id": "v09.replayexport", "rule": "L’export d’une reprise possède un format distinct, avec son chapitre, son état et son entrée initiale. Le réimport reprend ce mode isolé au lieu de remplacer la campagne principale.", "category": "Reprises et commandes"}
156. {"id": "v09.compact", "rule": "Le tactile compact conserve le déplacement, l’attaque, l’esquive et l’interaction à l’écran. La roue donne accès aux autres outils. Le panneau de commandes complet reste disponible dans les réglages.", "category": "Reprises et commandes"}

## Empreinte et données

HTML : `763ea5e2bbcbc96af648824e1dd87b0262eab64fd0298d1cc623ed0bbb46a4ec`. `CONTENT_MANIFEST.json` conserve les définitions complètes. `rapport/fidelity-audit.json` contient chaque test de seuil.
