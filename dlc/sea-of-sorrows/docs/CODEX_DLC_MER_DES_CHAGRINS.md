# ALIEN : LA MER DES CHAGRINS
## 0.10.0 — Les seuils de la mémoire

Cette version poursuit le prototype autonome existant. Les plans, les mécanismes détaillés et les impressions de Decker sont des créations d’adaptation, pas une transcription du roman. Aucun transfert de ressources ou de spécimens vers la campagne principale de Tantalus Frontier n’est effectué.

## Ajouts 0.10 : architecture, distribution et dotations

La version actuelle documente 50 salles, 59 liaisons et 113 seuils fonctionnels. 54 liaisons sont réciproques, cinq sont des transferts narratifs à sens unique. 98 positions de seuil ont changé depuis la v0.9. Le personnage arrive depuis la face associée au passage. Les transports, cages, escaliers, rampes et passages rocheux sont distingués. En Latérale, le point d’interaction rejoint la bande de marche, pas l’ouverture architecturale de fond ou de premier plan. Huit anciens habillages suggérant des portes ou des cages supplémentaires sont remplacés par des équipements techniques.

Deux râteliers partagent une seule dotation facultative, accessible après la remise de l’équipement : Réserve de matériel (s09, x1750) ou Atelier de chantier (s17, x1700). Approcher physiquement et interagir ; le panneau ne permet pas un retrait depuis la carte. Il fournit une seule fois le fusil à impulsions (30 cartouches chargées, 60 de réserve) et le plasma (12 tirs dans la cellule montée, deux cellules de réserve). L’attribution de ces deux armes au joueur et tous ces chiffres sont des choix d’adaptation.

Équipement → Armes permet de choisir les cinq armes possédées. Le cycle manette parcourt également les armes débloquées. Les raccourcis 1/2/3 conservent les trois armes initiales : les deux fusils n’ont pas de nouvelles touches numériques dédiées. R recharge en 1,1 seconde ; le fusil à impulsions prélève sa réserve à la fin de l’action. Le plasma remplace sa cellule uniquement à vide. Sa chaleur monte de 28 par tir, descend de 12 par seconde et bloque à 100 jusqu’au retour à 30 ou moins. La jauge /100 est une unité de jeu, pas une température physique. Le plasma n’est pas un rayon traversant les murs. Ses sons actuels réemploient un profil de tir générique de la synthèse existante.

Les anciens ravitaillements et casiers ne recréent pas les cartouches ou cellules de cette allocation. Les tirs respectent les lignes de vue, les profondeurs et les cloisons. Les nouvelles armes peuvent tuer le spécimen à capturer et faire échouer la mission. L’ancien lance-flammes reste une arme d’adaptation explicitement non authentifiée dans les sources consultées. La règle des trois attaches de la reine reste également originale.

Le menu « Fidélité et sources » est disponible au titre, dans Pause et depuis l’Équipement. Il sépare les traits sourcés et les visages interprétés, les lieux condensés et les annexes originales, les armes jouables et les références narratives. Les 16 fiches publiques comprennent une équipe médicale composite. Quatre rôles nommés n’ont encore qu’une fiche : Silas, Muller, Dave et Pritchett. Les 126 dossiers ne sont pas 126 scènes reconstituées.

Adams et Elway conservent des parasites visibles pendant le transport et dans le tableau de stase. Le parasite d’Adams reprend une variante royale indiquée par une notice secondaire ; sa taille graphique n’est pas une mesure canonique. Les tenues et visages sont interprétés, sauf traits explicitement signalés dans le registre. Les courtes interactions de figurants ne remplacent pas leurs actes et décès complets dans le livre.

### Compatibilité des nouvelles armes

Le schéma principal reste 8, avec un bloc optionnel `armory` de révision 1. Les formats 1 à 8 antérieurs sont acceptés ; une ancienne partie reçoit une allocation non retirée et aucune munition supplémentaire gratuite. Une partie contenant déjà les nouvelles armes est destinée à la v0.10 ou ultérieure. Son retour à la v0.9 n’est pas garanti : conserver l’export ancien séparément. Les armes consommées, la chaleur, le verrou thermique et la dotation partagée sont sérialisés.

## Commencer et reprendre

Le fichier `MER_DES_CHAGRINS_JOUABLE.html` contient les neuf modules du jeu, les données et les styles sans dépendance réseau. Le titre donne accès aux trois difficultés, aux présentations Hybride et Latérale, au guide et aux points de repli. Le fichier modulaire `index.html` utilise les sources séparées ; le serveur local facultatif se lance avec `python3 tools/server.py`.

Dans l’environnement de validation, Chromium refuse les navigations natives `file://` et `localhost` avec `ERR_BLOCKED_BY_ADMINISTRATOR`. Les tests exécutent le véritable HTML dans le DOM avec un stockage mémoire déclaré. Ce résultat ne certifie ni l’ouverture native ni la persistance sur un autre navigateur. Ne pas contourner une politique de sécurité.

Pour déplacer une expédition, utiliser Pause → Exporter dans l’ancienne version puis Pause → Importer dans la nouvelle. Les schémas 1 à 7 sont migrés vers le schéma 8. Le passage 7 → 8 conserve les données de l’expédition et ajoute l’état fermé des casiers aux salles déjà visitées. Les réserves dépassant un nouveau plafond de prise ne sont pas effacées. Le passage historique 6 → 7 conserve les capteurs et initialise une allure Standard et les circuits locaux allumés. La migration d’une sauvegarde de schéma 5 conserve progression, santé, armes, convoi, cloisons, lectures et poursuites ; elle ajoute trois capteurs rangés et six dossiers lorsque l’équipement est reçu. Les trois appareils ne constituent pas une récompense réclamable plusieurs fois : ils font partie du nouveau schéma de matériel.

La clé de reprise reste `tantalus.dlc.sea-of-sorrows.v1`. La commande Reprendre garde aussi une copie du format précédent sous `.backup-vN` si le stockage le permet. Les trois points de repli restent dans le même stockage du navigateur, sous une clé distincte ; ils ne remplacent pas un export externe et peuvent disparaître avec les données du site. Choisir un repli ne suffit pas à l’appliquer : une confirmation supplémentaire précède le remplacement de la partie.

## Son, légendes et commandes — 0.9.0

Réglages est accessible dès le titre et depuis Pause. Ses quatre onglets sont Son et légendes, Clavier, Affichage et Sauvegardes. Les réglages sont distincts de la sauvegarde d’expédition : un import d’une ancienne partie ne réinitialise pas vos touches ni le mixage. Leur conservation exige elle aussi un stockage autorisé.

### Entendre des événements, pas une carte secrète

Le son est désactivé au premier lancement. L’activation est volontaire ; aucune lecture n’est lancée au chargement. Quatre volumes distincts règlent le niveau général, l’ambiance, les effets et les alertes. Le bouton de test joue un bref signal puis rend le contexte audio à la pause. Ouvrir un menu, quitter la fenêtre ou désactiver l’audio coupe les voix en cours. Le lecteur limite les voix et déconnecte leurs nœuds après leur enveloppe.

Les 21 profils sonores sont synthétisés localement par oscillateurs, enveloppes et bruit déterministe. Ils couvrent tirs, rechargement, pas, esquive, roues, travail, mécanismes, impact, attaque visible, capteur, seuil, dangers et réserves faibles. L’ambiance ajoute un souffle et une vibration grave adaptés au type de lieu. Ce ne sont ni des enregistrements officiels, ni des voix, ni une bande originale. Le panoramique des effets proches est horizontal, pas un système de positionnement acoustique 3D avec réverbération calculée.

Les événements hostiles ordinaires doivent être proches (520 unités de jeu) et visibles ; la ligne de vue du moteur s’applique. Le capteur et le préavis de poursuite relaient seulement une observation que le moteur a déjà émise. Aucune localisation, identité ou nouvelle patrouille cachée n’est calculée pour produire un son. Les pas dépendent du déplacement réel ; un changement de salle ne simule pas une série de pas. Le roulement exige un brancard réellement déplacé et proche.

**Couper le son ou un volume ne change pas la discrétion.** Le bruit qui alimente l’IA, le temps, les blessures, les réserves et les objectifs sont déterminés par le moteur, pas par le mixage. Le module de présentation observe ces données sans y écrire. Des assertions d’invariance vérifient ce contrat pendant les six parcours.

### Deux légendes lisibles hors du terrain

Les légendes sont activées par défaut et indépendantes de l’audio. Elles affichent au plus deux événements récents dans le bandeau placé sous le terrain, en donnant priorité aux alertes. Leur durée est liée à 3,8 secondes de simulation : la pause ne laisse pas disparaître une alerte. Les messages répétés sont regroupés. La désactivation des légendes ne supprime ni les informations d’objectif, ni les avertissements tactiques déjà existants.

Le signal d’une source hostile cachée n’est pas transformé en légende omnisciente. Le HUD a aussi été corrigé : l’annonce de préparation d’une attaque ordinaire exige désormais proximité et visibilité. Une poursuite annoncée au seuil reste un cas explicitement reçu par la simulation. Ces légendes d’événements ne sont pas une transcription de dialogues parlés : cette livraison ne contient pas de doublage.

### Reconfigurer 31 actions au clavier

Dans Clavier, choisir un groupe et l’action, puis appuyer sur la nouvelle touche. Un conflit est refusé sans effacer l’ancienne commande. Échap annule la capture ; les commandes de navigation réservées restent protégées. Les touches de mouvement conservent au départ leurs alias de positions WASD/ZQSD et flèches. Réaffecter une action remplace les alias de cette seule action. Le bouton de réinitialisation de toutes les touches demande une confirmation.

Les touches personnalisées sont utilisées pour les actions instantanées et les maintiens : ouvrir un casier, réparer, manœuvrer une cloison ou se concentrer. Les indications de terrain et le centre de la roue utilisent la touche choisie. Les références E, K, G et Espace dans les fiches de production ci-dessous désignent les valeurs par défaut. Les clics de souris, les boutons tactiles et le profil de manette ne sont pas reconfigurés par cette page.

Une touche déjà tenue à l’entrée d’une pause doit être relâchée avant de redevenir active. Les deux touches alias d’un déplacement sont suivies séparément : relâcher l’une ne coupe pas l’autre. Une répétition automatique de la touche de roue ne la referme plus aussitôt ; une nouvelle pression est nécessaire. Les réglages ne fournissent aucune assistance de visée.

### Une copie vérifiée, pas une promesse de sauvegarde absolue

Avant d’écrire l’état courant, le lecteur vérifie que le contenu est importable puis protège la dernière sauvegarde valide sous `.last-valid`. Cette copie est relue, puis l’écriture courante est elle aussi relue et comparée au contenu demandé. Une copie déjà illisible ne remplace pas un secours valide. Si le stockage refuse l’écriture, le HUD signale l’échec au lieu d’afficher un succès ; la partie reste exportable depuis la mémoire tant que la page reste ouverte.

Réglages → Sauvegardes distingue la sauvegarde courante de la copie de sécurité. Restaurer exige une sélection puis une confirmation, sans remplacement silencieux. Cette copie est distincte des trois points de repli et des copies de migration. Toutes restent pourtant dans le même stockage du navigateur : une suppression des données du site peut les effacer ensemble. Le mécanisme n’est pas une transaction atomique entre deux clés et ne garantit pas la survie à une panne matérielle, à la fermeture avant écriture ou à un effacement externe. **L’export de fichier reste la sauvegarde indépendante à conserver.**

Pour les options héritées de la v0.9, le schéma de jeu reste **8**. La v0.10 ajoute le bloc optionnel d’armurerie décrit plus haut. Les réglages portent leur propre version. Les 198 exports de la v0.8 sont importés dans les tests ; les formats 1 à 7 restent migrés par le moteur.

## Quatre annexes, deux boucles facultatives

La première boucle relie l’Atelier de chantier (s17) au Vestiaire des équipes (s47), puis à la Cour des échangeurs (s48) et à l’Alimentation de descente (s18). Elle est accessible après équipement. La seconde relie les Paliers supérieurs (s35) au Transit des blessés (s49), puis au Magasin de la remontée (s50) et à l’Infirmerie de secours (s45). Elle devient accessible après préparation des patients. Chacun des six nouveaux passages est réciproque, accepte les poursuites déjà engagées et obéit aux règles de rassemblement.

Ces lieux sont des plans originaux du prototype. Ils n’ajoutent pas de chapitre et ne remplacent pas un endroit authentifié du roman. Un adulte fini occupe la cour, un facehugger fini le magasin ; il n’y a pas de réapparition automatique des ennemis. Les mêmes portes reviennent aux mêmes emplacements, sans détour virtuel sur la carte.

## Un casier n’est pas un bonus automatique

Dix armoires disposent d’un vrai état fermé, partiellement déverrouillé, ouvert et vidé. Approcher après réception de l’équipement puis maintenir **E pendant 2,4 secondes** avec l’outil Interaction. La manette utilise le même outil et son bouton d’interaction. Il faut rester à moins de 92 unités avec ligne de vue. Relâcher conserve le travail ; les dégâts suspendent le geste. Le jeu ne met pas la simulation en pause pendant l’ouverture.

Quand le verrou est libéré, le panneau local met l’action en pause. **Ouvrir ne prélève rien.** Les boutons de chaque catégorie permettent de retirer ou déposer une quantité. « Prendre le disponible » prélève seulement ce qui tient sous les plafonds. « Laisser le reste et repartir » ferme l’inspection. Revenir conserve le stock exact et la porte dessinée ouverte, même après vidage complet et rechargement de sauvegarde.

| Catégorie | Plafond des nouveaux retraits |
|---|---:|
| Cartouches de réserve | 180 |
| Carburant | 180 |
| Doses de mousse | 24 |
| Soins | 4 |
| Filtres de rechange | 4 |
| Leurres | 5 |
| Renforts de châssis | 6 |

Ces limites ne sont pas un nouveau système de poids. Elles régulent uniquement les sorties des casiers. **Les récompenses et stocks antérieurs dépassant déjà une limite sont conservés.** Un total de carburant supérieur à 180 ne perd rien au chargement : la prise supplémentaire est simplement désactivée. Un dépôt peut réduire ce total, sans consommer de matériel ni soigner. La santé, le filtre actuellement porté et le chargeur restent inchangés.

Un transfert doit conserver la somme stock + réserve portée de la catégorie. Les quantités non entières, négatives ou les catégories inconnues sont refusées. L’interface ne fournit pas de saisie libre de nombre. Une inspection ouverte ne permet pas de tirer, de déplacer le joueur ou de faire avancer un ennemi en arrière-plan. Les stocks ne se reconstituent pas lors des allers-retours.

## Retrouver une réserve sans la piller à distance

Équipement → **Stocks repérés** affiche seulement les salles visitées. Pour un casier fermé, le contenu reste non inventorié. Pour un casier ouvert, la liste conserve les quantités restantes. Le panneau n’offre aucun bouton de transfert ; rejoindre le lieu et s’approcher reste obligatoire.

Le plan local reprend le numéro et l’état du casier, pas une commande d’ouverture. Les nouveaux points d’accès restent séparés des portes, vannes et commandes de cloison. Une pose de capteur trop proche d’un casier est refusée comme devant les autres dispositifs.

Les deux patients peuvent emprunter les annexes de la remontée. Leur ordre, allure et intégrité ne changent pas en passant la porte. Le moteur exige leur regroupement et un chemin libre jusqu’au seuil, y compris aux sorties des nouvelles boucles.

## Reprise des patients déjà arrimés

Une correction de chargement empêche la normalisation de profondeur de déplacer un patient déjà marqué « arrimé ». Elle ne normalise que les châssis qui suivent réellement dans la salle active. Les chemins transitoires sont recalculés, mais les positions logiques des patients en attente ou à bord sont conservées, même lorsque la présentation change.

## Éclairage de travail : choisir ce qui reste visible

Dix salles disposent d’un pupitre de circuit local : s13, s15, s17, s18, s24, s30, s34, s35, s37 et s42. Les consoles ont une position réellement joignable dans les deux présentations. La touche d’interaction **E maintenue deux secondes** coupe ou rétablit leur éclairage. En manette, choisir l’outil Interaction puis maintenir Croix / A. Interrompre le geste conserve sa progression. Relâcher après achèvement avant d’inverser empêche les cycles automatiques. Un délai d’interruption lié aux dégâts est respecté.

La coupure n’est pas une panne de toute la salle : les appareils de mission, dangers, treuil, cloisons et capteurs restent fonctionnels. Les issues conservent leur balisage d’urgence. Les témoins de plafond passent en secours, le décor est assombri et les avertissements tactiques sont tracés après cette obscurité pour rester lisibles. Le plan représente le vrai pupitre et son état ; il ne permet pas de l’activer à distance.

Lampe personnelle éteinte et éclairage de travail coupé : la portée visuelle sur Decker tombe à 48 % de sa base, avec un plancher de 90 unités. La lumière personnelle allumée ramène la portée normale. Ce paramètre de discrétion ne dépend pas du curseur de luminosité d’affichage. La détection visuelle des brancards descend de 190 à 110 unités dans cette salle. Les lignes de vue restent nécessaires.

**La mémoire, le bruit et l’empathie forte restent actifs.** Couper la lumière n’annule pas une frappe préparée et n’efface ni un poursuivant ni sa dernière position connue. Un capteur reste sensible à un déplacement réel. La simulation des silhouettes n’est pas un modèle biologique canonique des xénomorphes.

## Les roues parlent : trois allures de convoi

Depuis Pause ou Équipement, ouvrir **Ordres d’escorte**. Les deux patients, leur intégrité actuelle et l’ordre suivre/halte sont présentés séparément du choix d’allure. La console est une pause ; les nouveaux ordres seront exécutés à la reprise. Une formation indisponible reste désactivée avant la préparation des porteurs et après l’arrimage.

| Allure | Écart visé | Vitesse | Intensité de roulement |
|---|---:|---:|---:|
| Standard | 170 | 155 | 12 |
| Rapproché | 105 | 175 | 26 |
| Discret | 150 | 108 | 3 |

Ces chiffres sont des unités internes, pas des mètres réels. Le mode Rapproché réduit la longueur du groupe et accélère sa marche, mais produit davantage de bruit. Discret est plus lent et moins sonore : ce n’est pas une invisibilité. Les positions ne sont jamais remplacées lors d’un ordre, et aucun soin ou renfort n’est fourni.

Les créatures peuvent enquêter vers le brancard entendu même sans voir Decker. Le calcul utilise les roues réellement en mouvement et l’atténuation des cloisons. Une halte supprime ce signal au prochain pas de simulation, mais laisse la mémoire déjà acquise. Une créature qui voit encore une cible peut continuer à la chasser. Les capteurs de mouvement détectent les brancards dans les trois modes.

À la soute, arrimer les porteurs et maîtriser le spécimen reste prioritaire. Le premier essai automatisé qui retardait ces opérations pour couper l’éclairage a perdu Adams dans deux profils : cette défaite est conservée dans les preuves. Le parcours final effectue la manœuvre facultative après la capture, sans retirer le danger du moteur.

## Capteurs : poser une veille plutôt qu’obtenir un radar

Trois capteurs réutilisables deviennent utilisables après la remise de l’équipement. Appuyer sur **P**, choisir Capteur dans la roue ou utiliser la flèche basse de la manette pose un appareil à la position actuelle de Decker. La même commande récupère en priorité un appareil proche et visible. La pose ne déplace ni le joueur ni un ennemi. Un court délai de commande évite les basculements en rafale.

Le sol doit être praticable. La pose refuse une esquive en cours, les courses de cloison, la proximité immédiate des portes et des dispositifs, ainsi qu’un autre capteur. Il n’est pas possible de déposer un appareil à l’autre bout de la salle en cliquant la carte. La récupération exige de revenir physiquement à moins de 85 unités avec une ligne de vue ; elle n’est jamais une action distante.

Chaque appareil dispose de **180 secondes de veille**, comptées en temps de mission. Tant qu’il est posé et actif, sa batterie diminue, même hors de portée radio. Le ranger ou le mettre en veille coupée arrête cette consommation ; aucune de ces opérations ne recharge. À zéro, il reste sur place mais ne mesure plus rien. Le prototype ne fournit ni recharge ni fabrication de batterie.

La détection observe les positions effectives entre deux scans espacés d’environ 0,25 seconde. Elle exige un déplacement de plus de 1,5 unité, une distance de mesure inférieure ou égale à 650 unités (6,5 mètres dans l’échelle d’interface) et une ligne de vue. **Une caisse ou une cloison fermée coupe la mesure.** Une réouverture ne crée pas un mouvement si personne ne s’est déplacé.

Decker, Manning et les brancards actifs peuvent déclencher le même signal que les créatures vivantes. Le dispositif ne classe pas une espèce, ne distingue pas un ami et ne localise pas une cible dans le HUD. Un cadavre et le spécimen déjà capturé ne comptent pas. Le champ de mouvement périmé d’un acteur immobile hors champ ne compte pas non plus : seules les coordonnées effectivement modifiées sont comparées.

Après pose, activation ou chargement, le premier scan sert à établir une référence ; il ne constitue pas à lui seul une détection. Un mouvement continu actualise l’heure de dernière observation, mais ne remplit pas le journal à chaque image. Une nouvelle entrée de journal exige une interruption suffisante entre deux séries. L’absence de nouveau signal ne garantit pas que la salle est vide : la créature peut être immobile, masquée, hors portée, ou la liaison interrompue.

## Liaison radio et lecture du dernier signal

La réception fonctionne dans la salle du matériel ou dans une salle immédiatement voisine par une des **38 liaisons pédestres compatibles**. Les conditions de passage de cette liaison doivent être satisfaites. Les vols, ascenseurs et transferts narratifs n’agissent pas comme relais ; il n’existe pas de chaîne radio sur plusieurs salles.

Hors liaison, aucune nouvelle observation n’est produite pour le joueur. Le dernier signal reste une donnée historique horodatée, pas un contact actuel. La batterie d’un appareil laissé actif continue de diminuer. Lorsque la liaison revient, une référence de positions est réétablie avant de conclure à un déplacement.

Le panneau Capteurs, accessible depuis Pause, Équipement ou la page Lecture de la roue, indique l’emplacement du matériel, son état, sa charge et l’ancienneté de la dernière observation. **Couper / Réactiver** n’est possible que pour un appareil posé, encore chargé et joignable. Ce menu met l’action en pause comme les autres : il n’est pas présenté comme une interface en temps réel.

La population ordinaire d’une salle quittée n’est pas simulée intégralement. Seuls les poursuivants déjà engagés peuvent encore s’y déplacer. Un capteur laissé derrière observe ces déplacements réels, pas des patrouilles inventées pour alimenter l’écran. La carte locale dessine l’appareil posé, sans symbole supplémentaire pour un ennemi.

## Roue tactique : Équipe, Matériel, Lecture

**O**, le bouton Tactique du HUD ou **L1 / LB** ouvrent une pause tactique. Les trois pages contiennent chacune huit commandes. La souris sélectionne directement ; les flèches tournent entre les secteurs ; les chiffres 1 à 8 choisissent une entrée. Entrée ou Espace confirme. À la manette, le stick gauche sélectionne un secteur et Croix / A confirme. R1 / RB change de page. Échap, O ou Rond / B annule.

| Page | Huit entrées |
|---|---|
| Équipe | Manning suivre/halte, discipline de tir, tenir le point, convoi suivre/halte, interaction, réparation, cloison, équipement |
| Matériel | Pistolet, mousse, lance-flammes, recharger, soin, filtre, leurre, capteur |
| Lecture | Lampe, détecteur, capteurs, carte, journal, dossiers, présentation, guide manette |

Les entrées indisponibles restent visibles mais ne donnent aucune ressource. Choisir une arme non reçue, un appareil absent ou une réparation sans convoi valide n’exécute pas l’action. La pose est toujours évaluée à la position réelle de Decker, et l’ordre de position utilise le dernier point visé, pas un acteur téléporté.

**Interaction, Réparation et Cloison sont des outils de travail.** Les sélectionner ne valide pas immédiatement leur tâche. Revenu dans la scène, maintenir **E / Croix / A** exécute l’outil actif dans les conditions du moteur. Les touches directes K et G restent disponibles. Une réparation conserve ses trois secondes et son coût final en renfort ; une cloison garde ses durées de fermeture et d’ouverture. Les dégâts, la distance et l’occupation d’un passage continuent de s’appliquer.

## Manette standard : commandes livrées

Le lecteur accepte le profil `standard` exposé par le navigateur. Les légendes PlayStation / Xbox décrivent la position standard des boutons, pas une certification de modèles particuliers. Les commandes ont été éprouvées avec des données Gamepad synthétiques dans le véritable navigateur et des tests du lecteur ; **aucune manette physique n’a été branchée pendant la validation**.

| Action | Commande standard |
|---|---|
| Marche analogique | Stick gauche ; zone morte radiale de 20 % |
| Viseur | Stick droit, déplacement du véritable réticule ; pas de visée automatique |
| Tirer / empathie | R2 / RT ; L2 / LT maintenu |
| Travail sélectionné | Croix / A maintenu |
| Esquive / rechargement / arme suivante | Rond / B ; Carré / X ; Triangle / Y |
| Roue / outil suivant | L1 / LB ; R1 / RB |
| Lampe / capteur | Croix directionnelle haut / bas |
| Manning / convoi | Croix directionnelle gauche / droite |
| Courir / s’accroupir | Pression du stick gauche / droit |
| Carte / Pause | Select / Start |

Dans les menus ordinaires, le stick ou les flèches déplacent le focus, Croix / A active et Rond / B annule lorsque le panneau l’autorise. Les séquences de récit qui exigent une confirmation conservent cette exigence. Il n’y a pas de vibration, de coopération, de remappage de manette ni de validation de contrôleurs non standard dans cette livraison. Les menus d’import/export utilisent toujours les interfaces du navigateur ou du système pour choisir un fichier.

À la connexion, après une pause ou après une reconnexion, les axes et boutons doivent d’abord revenir au neutre. Une gâchette maintenue ne relance donc pas un tir en fermant la roue. Débrancher pendant le jeu ouvre Pause ; rebrancher ne reprend pas automatiquement. Le clavier reste disponible sans profil reconnu. Une touche clavier maintenue avant une pause doit aussi être relâchée avant que sa répétition soit de nouveau acceptée.

## Poursuite : une créature existante

La poursuite héritée conserve l’identité, les blessures et l’immobilisation de la même créature. Elle doit être réellement engagée, rejoindre physiquement la sortie de la salle quittée puis attendre un préavis au seuil réciproque. Elle n’est pas clonée à l’arrivée. Le message « Griffes au seuil » vient du passage concerné. La créature doit repercevoir le joueur avant de prolonger la poursuite vers une autre salle.

Une porte ne transporte pas les brancards à travers une cloison. Le rassemblement contrôle distance et chemin libre ; Manning est soumis à un contrôle analogue pendant sa présence active. Les portes narratives, vols, cages, reine et capture gardent leurs exclusions. Le journal de terrain conserve les 24 derniers faits réellement émis, dont les nouvelles observations des capteurs, sans devenir un radar de positions cachées.

## Combat, convoi et travaux conservés

Les coups au contact sont préparés avant l’impact. L’esquive paie son endurance et respecte les obstacles. L’acide persiste après certains combats. Neuf sources de vapeur, gaz ou électricité alternent calme, préavis et émission ; leur consignation est conservée. Les deux brancards se déplacent physiquement, possèdent une intégrité propre, peuvent être arrêtés et doivent être arrimés avant la capture.

Pour réparer, arrêter le convoi puis maintenir K, ou sélectionner Réparation et maintenir E / Croix / A près du châssis. Trois secondes et un renfort rendent au plus 35 points d’intégrité. Le stock n’est débité qu’à l’achèvement. Les huit cloisons bloquent le passage, la vision et les tirs ; elles atténuent les sons. Une créature peut les rompre, mais leur course ne pousse pas les acteurs. L’état rompu est définitif dans cette expédition.

Les huit lectures empathiques restent facultatives et ne valident pas d’objectif principal. La reine conserve ses trois attaches originales au jeu ; la capture finale exige une cible vivante, immobilisée près du caisson. Manning refuse de tirer sur ce spécimen dans toutes ses disciplines. Aucun de ces mécanismes n’est un détail déclaré canonique du texte source.

## Guide des preuves

Le codex de salles suivant est généré à partir du JSON que lit le moteur : 50 salles, 59 liaisons, 33 objectifs, les dispositifs, obstacles et intentions de décor. Ses schémas ne sont pas des captures de gameplay ni des plans authentifiés du roman. Les 126 dossiers sont recensés ; les quatre notices de cette passe sont des créations de jeu.

Le rapport illustré distingue tests de simulation, parcours continus, commandes dans Chromium, données Gamepad synthétiques et captures figées. Les tests isolés peuvent préparer une situation pour vérifier une règle ; les six parcours nouveaux démarrent une partie et n’imposent ni santé, ressources, position ni progression. Ils utilisent cependant le planificateur du moteur : ils ne sont pas des parties humaines ni une estimation de temps de jeu. Les difficultés humaines élevées restent à équilibrer par des essais réels.

## Statut de livraison

DLC autonome, interface en français, rendu vectoriel stylisé provisoire. Les anciens champs d’intention de décor ne prouvent pas l’existence d’un sprite distinct pour chaque accessoire nommé. Pas d’assets officiels, pas d’intégration native au moteur ou à la sauvegarde hôte, aucun push GitHub et aucun déploiement Vercel. L’installateur facultatif copie seulement une route autonome avec les neuf modules nécessaires, sans modifier le menu du projet principal.
