# Tantalus Frontier — V160

Prépublication : corps du joueur, détecteur, armes et continuité narrative. Les quatre demandes utilisateur C160-PLAYER/TRACKER/WEAPONS/CAMPAIGN sont distinctes des 68 tâches Trials héritées et des 17 priorités conservées.

Le prédécesseur V159 reste immuable : 14 classeurs historiques, 189 identités, 40 présentations, 28 ART153, 15 contenus documentaires et 96 correspondances historiques. Sa recette réelle (2 508 tests, 4 profils, 85 contrôles, 44 captures) reste historique ; aucun compteur ne constitue un résultat V160.

## C160-PLAYER — Corps du joueur

Les pieds, le bassin, la ceinture, le thorax et les épaules de l’arme partagent le même repère de support au lieu de dissocier le haut et le bas du corps. La tête, le casque et le masque utilisent une attache réduite commune ; les hanches projetées sont resserrées. Les longueurs de cuisse/tibia restent rigides, les appuis plantés sont conservés et la cadence suit la distance réelle en marche et jogging. Les raccords de poses, d’échelle, de conduit et de chargement partiel conservent les supports natifs. La poche de recharge suit le tissu de la cuisse éloignée, y compris pendant les poses et le secours de chargement natif, au lieu de rester suspendue à un point vide. Lors d’un chargement incomplet, les sept pièces de jambes disponibles restent procédurales ; si leurs images manquent aussi, les vraies frames natives 4–7 suivent la phase de marche avec leurs propres ancres de semelle. Sur échelle, la posture entière s’écarte du montant pour que la main éloignée reste sur le vrai barreau dans l’enveloppe du coude, sans déplacer les barreaux ni changer les longueurs des membres. Pour le contact mural Jeri, l’identifiant et la face de la surface physique choisissent une posture de prise distincte de l’échelle centrée ; les mains et les pieds plantés visent la vraie face sans projection hors portée, et le plafond garde sa présentation propre.

Correction procédurale de dessins natifs conservés ; enveloppe de conception et mesures de pixels, pas calibration anatomique universelle. Le relevé CMU générique ne retargete aucun personnage de franchise. La collision native reste 42 × 92 unités ; les variantes finales des bras et les comparaisons visuelles avant/après attendent la recette du commit final. Le contact Jeri adapte le rig existant ; il ne fournit aucun nouvel art synthétique dédié ni animation de franchise certifiée.

## C160-TRACKER — Détecteur de mouvement

Q active la capacité native de détection à 900 unités du jeu : contacts de positions réellement mobiles dans le même repère/pont, balayage, échos datés et expiration. L’écran en coupe 2D ne révèle ni camp, espèce ou boss ; alliés, ennemis et conduits projetés ne sont suivis que sur mouvement mesuré. Bip et bruit tactique local suivent le temps actif après activation ; pauses, générations et changements de repère ne créent pas de dette de mouvement. Sur écran étroit, le boîtier compact se place d’après le corps et la caméra et affiche une portée relative sans attribuer des mètres aux unités du jeu.

Adaptation inspirée du manuel officiel Alien: Isolation, distincte du modèle M314 du film. Pas de portée métrique canonique, d’identification IFF ou de copie 1:1 de son écran. Consultation native de 0,7 seconde puis projection HUD de cinq secondes ; aucun appareil tenu en continu n’est déclaré. Seuls les corps admis sont observés, pas les machines ou tous les accessoires mobiles. La dotation Q native reste distincte d’un consommable personnel.

## C160-WEAPONS — Prise des armes et origine du tir

Le solveur maintient les mains dans une enveloppe de conception réalisable, avec des zones de poignée, avant-main et port de service qui évitent la singularité près de l’épaule, et une portée d’épaule mesurée depuis le vrai torse. Le corps final V129 est résolu avant le canon et l’origine du tir. Lors d’un obstacle réel, la rétraction recalcule l’arme rigide et les mains sans déplacer la poche du corps pendant la recharge. Un aperçu pur de la pose après déclenchement, blessure et recul prévoit le vrai cadrage avant de dépenser une ressource ou de lancer un cycle. La projection du curseur peut être consultée sans mutation ; les gardes de tir et de commit refusent les cycles obstrués avant leur consommation. Le guide d’obstruction suit la garde physique courante : un ancien flag de pose ne bloque plus un canon réellement dégagé après un peek, et un vrai contact au mur conserve le refus avant ressources.

Les 5°–145° du coude et −90°–150° du bras supérieur sont des enveloppes de conception projetées, pas des mesures biomécaniques ni une chorégraphie canonique. Dessins natifs conservés ; les comparaisons visuelles du corps final, de la branche de coude retenue et du retrait au mur attendent la recette exacte.

## C160-CAMPAIGN — Continuité narrative Tantalus

« Le dernier relais » approfondit QZ-18/Lethe dans l’opération special-archive-relay : cinq phases dialoguées avec portraits natifs, avec l’incident natif lorsqu’il est présent, choix de préparation technique ou de prévention à bord, six pièces persistantes et retour rattaché au même identifiant d’opération. Les retombées de recherche ou de moral exigent extraction native et dossier complet ; lecture/relecture ne récompensent jamais, et les blessures/échecs restent réels. Le déploiement emploie le même renderer QZ-18 que la mission ; les props réutilisent cinq atlas admis, au contact des vraies ancres, en 2D intégrale sans ajouter de collision. Les contrôles de sauvegarde en mission et de retour après extraction utilisent les handlers natifs ; le retour est libellé « RETOUR À BORD ».

Intrigue Tantalus originale, sans reconstruction canonique Aliens ni conclusion sur une responsabilité personnelle. Les images de préparation du vaisseau restent illustratives ; seul le déploiement reprend la scène jouable. Ce parcours borné ne termine pas les corpus des vingt autres opérations. Comparaisons natives, reprise et résultats du commit final restent à vérifier.

## Comparaisons et limites

Le protocole compare les mêmes acteurs, tenue, plan de sol, caméra et entrées natives avant/après : stature alpha, taille constante des os, liaison bassin/ceinture, genoux, appuis, mains/poignées, sortie du canon et effets ; contacts mobiles, orientation et pause du détecteur ; causalité des choix et reprise du récit. Les mesures en pixels et enveloppes articulaires sont des critères d’ingénierie. Elles ne constituent aucune certification anatomique ou artistique 1:1.

Dix enregistrements distinguent consultation héritée, illustration officielle nouvelle, art natif et sources absentes. L’image officielle Isolation est vue mais ne prouve pas un M314 exact. Un BVH CMU converti complète ensuite les neuf constats initiaux : 344 frames dont une T-pose ajoutée exclue, donc 343 frames de mouvement. Un seul performeur, vitesse et rig différents, projection latérale estimée et calibration incertaine ; aucune copie 1:1 de personnage. Terminator 2D: NO FATE, biomécanique complète, prises M41A et cycles d’œuvre précis restent sans preuve récupérée. Le récit Tantalus est une fiction originale et les campagnes étendues restent ouvertes.

Les cellules de recette restent à exécuter sur le commit final. Les preuves après validation sont conservées séparément ; aucune approbation humaine ni publication HTTP n’est inventée.
