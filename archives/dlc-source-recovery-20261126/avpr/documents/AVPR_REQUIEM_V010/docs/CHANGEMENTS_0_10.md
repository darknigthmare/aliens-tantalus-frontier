# AVP-R — Les lieux et les visages

## 0.10.0-candidate.1 · audit de fidélité et de cohérence

Cette candidate prolonge les sources réelles de la 0.9. Elle contient le module autonome complet, pas un correctif vide et pas le jeu Tantalus hôte. Les modifications concernent sept lieux, la structure des accès, les silhouettes et l’équipement. Les quinze séquences et cinquante objectifs principaux sont conservés.

**Objectif 1:1 : non atteint.** La cohérence locale des passages est testée ; les dimensions, implantations et costumes exacts ne sont pas authentifiés plan par plan. L’inventaire ne certifie pas que tous les lieux, armes et personnages du film sont présents. Les trois tableaux distants ne sont pas des niveaux. Plusieurs armes ne sont encore que répertoriées ou représentées dans un décor.

Le rendu reste original, vectoriel et procédural. Il ne contient pas de photogrammes ou de voix du film. Les expressions faciales, anatomies, matériaux et costumes secondaires restent stylisés. Le choix d’un montage unique n’est pas encore verrouillé : les différences cinéma / non censuré / scènes coupées sont signalées plutôt que mélangées sous l’étiquette « canon vérifié ».

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

## Écarts encore ouverts vers le 1:1

La préparation jouable de Wolf sur son monde, le prologue intérieur du vaisseau éclaireur et son détachement orbital ne sont pas reconstitués. Le commandement de Stevens et la remise à Yutani restent des tableaux consultatifs ou des ellipses. La morgue, certains intérieurs privés tels que la maison de Jesse et les espaces associés aux personnages secondaires ne sont pas tous présents comme pièces distinctes. Le dépôt de bus et les autres pistes de scénario supprimées ne doivent pas être ajoutés au montage cinéma comme s’ils y figuraient.

Le cimetière est un détour jouable lié à une variante de montage, mais il ne rejoue pas la scène avec Karl. La pizzeria découle du travail de Ricky ; son intérieur, son plan et ses raccords sont inventés pour cette adaptation. La zone des chasseurs ne rejoue pas leur prologue. La maternité et la nurserie sont des lieux vides explorables, pas une reproduction de toutes les actions du film. Le Stryker est immobilisé : pas de conduite, de trajet routier ou de mitrailleuse pilotée dans cette candidate.

Le répertoire contient encore des armes sans gameplay : variantes militaires, Colt Python, MP5SD3, K3 et CM203 notamment. Les armes représentées sur des PNJ ne produisent pas encore toutes leurs attaques. Les objets médicaux, le dissolvant et les lasers ont des fonctions adaptées et ne reproduisent pas chaque plan de manipulation.

L’architecture, les couleurs, les habits et les gabarits restent approximatifs. Aucun pourcentage de « fidélité » n’est attribué sans une grille d’observation filmique complète. Le résultat est une progression concrète et auditable, pas une certification d’intégralité.

