# Xeno Trials — cinquante lieux de la franchise V192

Ce lot prolonge le commit public `0e9843808823a9ce9da73e5b2effeefa1ee51f26`. Les cinquante environnements précédents sont des simulations originales de Tantalus ; ils ne remplissaient pas le manque des lieux nommés des films, de la série, des jeux, des comics et des romans.

## Périmètre du lot

La sélection comprend quinze arènes de films, cinq de la série *Alien: Earth*, quinze de jeux vidéo, huit de comics et sept de romans. Elle inclut notamment Nostromo, le Derelict et Hadley’s Hope, le Sulaco, Fiorina 161, Auriga, LV-223, la Planète 4, Renaissance et Jackson’s Star ; Maginot et Neverland ; Sevastopol, LV-1201, BG-386, Katanga, Endeavor, LV-895, Lethe, Otago et Purdan ; puis Ryushi, Charon, Innominata, Sphacteria, le monde de *Genocide*, Epsilon, Tobler-9, la Terre d’*Earth War*, LV-178, Marion, Cold Forge, Charybdis, Ataegina, Jericho 3 et Euryale. Plusieurs salles appartiennent au même lieu : ce sont cinquante arènes, pas cinquante nouvelles planètes.

Chaque ajout reçoit une illustration originale individuelle. Aucun des anciens arrière-plans n’est renommé pour compter comme un nouveau décor. Les cinquante anciens objets, IDs, images et comportements restent dans leur ordre initial. Le catalogue final visé est donc de cent arènes ; les programmes dont le lieu est imposé conservent leur environnement.

## Images, profondeur et événements

Chaque PNG contient trois plans du même environnement. Les images générées ont des dimensions et des séparateurs variables : les trois rectangles de lecture sont mesurés sur les pixels originaux, sans redimensionnement ni retouche bitmap. Les séparateurs peuvent laisser de petits espaces entre deux crops. L’admission vérifie les dimensions, le SHA, la taille réelle et les rectangles exacts de chaque image ; elle refuse les fichiers voisins et les candidats non admis.

Le rendu utilise trois plans d’image et deux profondeurs supplémentaires pour les structures et événements. Le premier plan reste sous les pieds ; le combat conserve son plan physique, ses collisions, ses attaques et ses dégâts. Deux événements cohérents sont attribués à chaque lieu parmi vingt-et-un types : circulation orbitale ou de fret, cycle de sas, refroidissement, scan, approche de navette, tempête, pluie, cendre, sable, spores, mouvement de ruche, lumière biologique, fournaise, houle, neige, projecteur, rail et gouttes. Ces événements sont des adaptations cosmétiques ; ils ne créent ni ennemi ni danger physique.

La pause conserve le tick du moteur. Le mouvement réduit immobilise les événements et le défilement prévu, sans fabriquer un faux tick de dessin. Les reçus de rendu décrivent les crops réellement soumis au Canvas et portent explicitement un SHA attendu du registre. La vérification du corps HTTP constitue une preuve distincte : le reçu de dessin ne prétend pas avoir calculé le hash du réseau.

Le loader charge le seul atlas du stage sélectionné pour le match. Les cartes d’interface sont paginées par douze, avec filtres par support, compteur, navigation et retour à la sélection. La première bande mesurée sert d’aperçu. Le sélecteur natif, les activités à lieu imposé et les tickets en attente conservent leurs identités. Le schéma principal reste 52, celui des tickets 96.

## Sources et fidélité

Le [dossier des sources](franchise-stage-sources-v192.json) distingue nom du lieu, œuvre, description, statut d’accès et portée réelle de chaque référence. Les pages officielles accessibles corroborent les œuvres seulement dans les limites de leur contenu. Les pages secondaires indisponibles sont déclarées indisponibles. Une page de présentation d’*Alien* ne prouve pas un décor de *Alien: Earth* ; les références de la série gardent cette limite explicite.

Les vues latérales, dimensions du sol, couleurs de composition et incidents de fond sont des reconstitutions originales MIRE. Pour les romans, les images sont des interprétations des descriptions, sans plan visuel primaire mesuré. Le lot ne certifie pas une fidélité 1:1. Les événements ne prétendent pas reproduire des incidents canoniques à un instant précis.

Le [dossier des illustrations](franchise-stage-art-production-v192.json) conserve les mesures et inspections publiques. Les originaux de génération, détails d’exécution et preuves de travail restent hors du build. Les screenshots de composition, visites de stages abandonnées, manches partielles et victoires complètes sont comptés séparément.

## Validation et livraison

Les cinquante PNG sont générés, inspectés et admis : **131 289 151 octets et 150 crops mesurés**, sans retouche bitmap. Les 68 contrôles catalogue/UI, les 19 tests renderer et les 103 régressions associées passent. L’admission source vérifie 2 701 fichiers, 1 505 assets et aucun document privé. Le premier build contient 2 109 fichiers et 667 entrées shell ; il sera réestampillé après le commit public.

La recette Chromium stricte termine avec **480 contrôles réussis et 63 captures natives** : dix screenshots d’interface et cinquante-trois exports des pixels Canvas. Les cinquante nouveaux stages et trois anciens stages sont visités puis abandonnés par l’interface ; ces visites ne sont pas comptées comme des victoires. Un duel distinct Queen/Boiler est réellement gagné 2–0 sur Lorenz Systech, avec 80 crédits et 60 XP, puis exporté par le vrai système de profil. Le pilote ne modifie aucun acteur, HP, position, horloge, RNG ni résultat. Sa fixture de crédits et de profil vierge est déclarée.

Les cinq supports possèdent leurs parcours représentatifs de déplacement, trois plans de parallaxe et pause. La reprise conserve le ticket, sa graine, son identifiant et son stage ; elle ne prétend pas restaurer les HP d’un duel libre qui ne possède pas de checkpoint de combat. FR/EN, filtres, douze cartes par page, mouvement réduit et interaction tactile mobile sont vérifiés. Les 661 sources du navigateur restent inchangées ; ses 61 chemins partagés correspondent au gel global. Les 56 réponses HTTP conformes comprennent les cinquante nouveaux PNG. Aucune erreur JavaScript, HTTP ou de requête n’est signalée.

Le duel complet a révélé un ancien blocage : donner le focus au bouton de manche suivante activait la pause avant `nextRound()`. Ce contrôle est maintenant reconnu dans la surface native du runtime. Une régression gagne naturellement la manche, vérifie le passage puis confirme qu’un focus réellement extérieur met toujours le jeu en pause. La victoire Chromium finale valide également ces transitions.

Le premier passage global a signalé une seule comparaison historique non relayée : le contrôle de couverture V191 exigeait encore l’ancien SHA du runtime. Le rapport V191 et ses empreintes restent conservés ; la preuve est raccordée au prédécesseur Git exact et à la succession V192 autorisée. Aucun produit, image ou pilote n’est modifié pour cette réparation. Le nouveau passage officiel de **272 fichiers uniques** termine avec **5 646 tests réussis, zéro échec et une fixture optionnelle ignorée**.

Les preuves sont conservées hors dépôt dans `/workspace/tantalus-inventory/reprise-v192/`. Les 92 fichiers du gel restent inchangés. L’audit final porte 29 successeurs, 62 nouvelles entrées et douze plaques ; sa relecture indépendante garde les six blocs historiques et les cinquante anciens objets exacts, sans transfert de verdict. Les deux seuls rapports modifiables après le gel des sources sont ce document et `franchise-stage-completion-v192.json`. Le commit public et le statut réel de la mise en ligne sont consignés dans un reçu externe ; le délai Vercel déjà reçu est respecté.
