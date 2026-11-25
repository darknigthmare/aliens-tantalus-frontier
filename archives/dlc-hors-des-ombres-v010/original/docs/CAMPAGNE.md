# Campagne et séquences — V0.8

Les seize chapitres et quarante-huit objectifs ci-dessous sont conservés. Les 38 salles, trois réparations et huit interventions des archives noyées restent disponibles selon les règles V0.7. Aucun nouveau chapitre principal dans V0.8.

Douze séquences de trois tableaux accompagnent le récit, dans une copie préparée distincte du terrain. Leurs textes, seuils et caméras exacts sont documentés dans `CODEX_LEVEL_DESIGN.html#sequences`. Elles ne modifient pas les objectifs, ressources ou pertes scénarisées. P permet aussi de reprendre une entrée réellement enregistrée dans un carnet de répétition séparé.

Les détails ci-dessous gardent les numéros de la campagne d’origine. Les plans et dialogues sont originaux à l’adaptation ; ils ne sont pas un scénario officiel.

---

# Note de version V0.6 — parcours conservé

Les 16 chapitres et leurs 48 objectifs ci-dessous sont conservés. Les trois chantiers n’ajoutent pas d’étape principale : sanitaire BeeBee’s–infirmerie dès le chapitre 1 ; manutention atelier–hangar au chapitre 4 ; décantation–trimonite au chapitre 8. Les chemins initiaux et les conditions narratives restent disponibles sans composants. Les recettes et détours sont originaux à cette adaptation et ne prétendent pas reproduire une scène supplémentaire du roman.

---

# Campagne jouable — V0.4

Plans, raccords, dialogues et manipulations originaux pour le prototype ; pas de script officiel. Les numéros restent ceux de la V0.2.

## 01 — Silence sur la ligne

Personnage : Chris « Hoop » Hooper.

### 01. Vérifier la liaison avec la mine

Lieu : Passerelle du Marion ; point a (518, 88). Action : inspect. Maintien : 0.65 s. Commande : interaction simple / sélection éventuelle.

Indice : Lisez le tableau de navigation.

Conséquence écrite : Le Marion ne reçoit plus les équipes au sol.

### 02. Rétablir le relais local

Lieu : Relais des communications ; point b (924, 88). Action : circuit. Maintien : 1.25 s. Commande : routing.

Indice : Séparez la balise de la ligne endommagée.

Conséquence écrite : La portée est courte. Quelqu’un doit encore pouvoir nous entendre.

### 03. Stabiliser le bus de secours

Lieu : Distribution électrique ; point c (2066, 88). Action : repair. Maintien : 1.25 s. Commande : sequence.

Indice : Travaillez au panneau de distribution.

Conséquence écrite : L’alimentation tient. Pour l’instant.

Événement : Baxter — Le relais tient. Il n’y a toujours personne au bout de la ligne.

## 02 — La Delilah

Personnage : Chris « Hoop » Hooper.

### 04. Isoler les conduites du quai

Lieu : Sas de confinement ; point b (935, 88). Action : valve. Maintien : 1.25 s. Commande : pressure.

Indice : Fermez la vanne, sans vider la réserve respirable.

Conséquence écrite : La conduite du quai est isolée.

### 05. Fermer la cloison d’impact

Lieu : Brèche de la Delilah ; point a (538, 88). Action : seal. Maintien : 1.25 s. Commande : interaction simple / sélection éventuelle.

Indice : Les tôles protègent du souffle, pas de la créature.

Conséquence écrite : La brèche est derrière la cloison.

Événement : Hoop — La Delilah a frappé. La passerelle ne répond plus. Jordan ne répond plus.

### 06. Vérifier l’amarrage du Samson

Lieu : Hangar des navettes ; point c (2345, 88). Action : inspect. Maintien : 0.65 s. Commande : interaction simple / sélection éventuelle.

Indice : Approchez le pupitre de fret.

Conséquence écrite : Le Samson tient encore au quai. Son intérieur n’est pas sûr.

## 03 — Une navette à la dérive

Personnage : Ellen Ripley.

### 07. Alimenter le collier d’amarrage

Lieu : Amarrage du Narcissus ; point b (1155, 88). Action : circuit. Maintien : 1.25 s. Commande : routing.

Indice : Privilégiez les verrous, pas le chargement.

Conséquence écrite : Le passage est alimenté.

### 08. Contrôler la cryostase

Lieu : Narcissus — cryostase ; point a (384, 88). Action : inspect. Maintien : 0.65 s. Commande : interaction simple / sélection éventuelle.

Indice : Le coffre de Jones reste fermé et sécurisé.

Conséquence écrite : Jones reste ici, à l’abri.

### 09. Récupérer le nécessaire de terrain

Lieu : Infirmerie ; point b (1232, 88). Action : inspect. Maintien : 0.65 s. Commande : interaction simple / sélection éventuelle.

Indice : La zone médicale donne un point de reprise.

Conséquence écrite : Nous descendrons équipés, pas armés comme une escouade.

Événement : Ripley — Avant de repartir, montrez-moi tous les accès de cette navette.

## 04 — Ce qu’il nous reste

Personnage : Chris « Hoop » Hooper.

### 10. Préparer le chalumeau

Lieu : Atelier de bord ; point a (470, 88). Action : repair. Maintien : 1.25 s. Commande : sequence.

Indice : Le jet repousse brièvement ; ce n’est pas une arme lourde.

Conséquence écrite : Le réservoir est plein. Évitez les longues rafales.

### 11. Lire le diagnostic de la navette

Lieu : Cœur informatique ; point b (1078, 88). Action : inspect. Maintien : 0.65 s. Commande : interaction simple / sélection éventuelle.

Indice : N’acceptez pas un état réseau comme une preuve physique.

Conséquence écrite : Il manque une cellule compatible.

### 12. Séparer les travées de fret

Lieu : Samson — soute ; point a (514, 88). Action : seal. Maintien : 1.25 s. Commande : interaction simple / sélection éventuelle.

Indice : Un compartiment à la fois.

Conséquence écrite : La première travée est fermée.

## 05 — Le Samson

Personnage : Ellen Ripley.

### 13. Détourner la présence dans la soute

Lieu : Samson — soute ; point b (1177, 88). Action : lure. Maintien : 0.65 s. Commande : interaction simple / sélection éventuelle.

Indice : Posez un leurre et laissez un chemin de repli.

Conséquence écrite : Le bruit l’éloigne de la rampe.

### 14. Condamner la travée arrière

Lieu : Samson — soute ; point c (1755, 88). Action : seal. Maintien : 1.25 s. Commande : interaction simple / sélection éventuelle.

Indice : Éloignez la créature avant de travailler au verrou.

Conséquence écrite : La travée reste sous quarantaine.

Événement : Kasyanov — Garcia est restée derrière nous. La travée est vide.

### 15. Réarmer la commande de vol

Lieu : Samson — cockpit ; point b (858, 88). Action : circuit. Maintien : 1.25 s. Commande : routing.

Indice : La navigation doit rester isolée du réseau du Marion.

Conséquence écrite : La commande locale répond.

## 06 — Sous la tempête

Personnage : Chris « Hoop » Hooper.

### 16. Préparer la descente

Lieu : Samson — cockpit ; point c (1279, 88). Action : repair. Maintien : 1.25 s. Commande : interaction simple / sélection éventuelle.

Indice : Contrôlez les commandes avant le transfert.

Conséquence écrite : La route vers LV-178 est ouverte.

### 17. Lire les balises de la concession

Lieu : LV-178 — aire d’atterrissage ; point b (1540, 88). Action : inspect. Maintien : 0.65 s. Commande : interaction simple / sélection éventuelle.

Indice : Cherchez le poste derrière le sas.

Conséquence écrite : Les balises dessinent encore une route.

### 18. Remettre le poste sous tension

Lieu : Poste de la concession ; point a (504, 88). Action : circuit. Maintien : 1.25 s. Commande : routing.

Indice : Alimentez le puits depuis le secours local.

Conséquence écrite : Le plan des galeries est lisible.

## 07 — Le puits principal

Personnage : Chris « Hoop » Hooper.

### 19. Déverrouiller la cage

Lieu : Puits principal — tête ; point b (935, 88). Action : repair. Maintien : 1.25 s. Commande : sequence.

Indice : Vérifiez le frein de service avant la descente.

Conséquence écrite : La cage peut descendre.

### 20. Sortir de la cage endommagée

Lieu : Puits principal — fond ; point a (485, 88). Action : inspect. Maintien : 0.65 s. Commande : interaction simple / sélection éventuelle.

Indice : Le second puits doit offrir une autre issue.

Conséquence écrite : La remontée par cette cage est compromise.

Événement : Hoop — Cette cage ne remontera pas. Le second puits est notre seule sortie.

### 21. Rétablir le balisage minier

Lieu : Galerie de roulage ; point b (1562, 88). Action : circuit. Maintien : 1.25 s. Commande : routing.

Indice : Le balisage ne remet pas le treuil en service.

Conséquence écrite : Les balises indiquent la galerie est.

## 08 — La roche travaille

Personnage : Chris « Hoop » Hooper.

### 22. Purger le collecteur

Lieu : Station de pompage ; point a (581, 88). Action : valve. Maintien : 1.25 s. Commande : pressure.

Indice : Le manomètre baisse seulement sur la bonne conduite.

Conséquence écrite : Le passage n’est plus sous pression.

### 23. Prendre les réserves du refuge

Lieu : Abri des mineurs ; point b (990, 88). Action : inspect. Maintien : 0.65 s. Commande : interaction simple / sélection éventuelle.

Indice : Un détour calme permet de préparer la suite.

Conséquence écrite : Des réserves. Pas assez pour rester.

### 24. Écarter le bras de la foreuse

Lieu : Front de trimonite ; point c (2181, 88). Action : repair. Maintien : 1.25 s. Commande : sequence.

Indice : La machine doit rester contre le front de taille.

Conséquence écrite : Une faille passe derrière la foreuse.

Accompagnement possible : Baxter, 22 ≤ objectifs achevés < 24. Départ physique : Abri des mineurs. Trajet refuge → front de taille. Le relais suivant reste scénarisé.

## 09 — Sous la mine

Personnage : Ellen Ripley.

### 25. Suivre l’ouverture dans la roche

Lieu : Faille d’accès ; point b (1166, 88). Action : inspect. Maintien : 0.65 s. Commande : interaction simple / sélection éventuelle.

Indice : Les étais humains s’arrêtent ici.

Conséquence écrite : La coque n’appartient pas à la concession.

### 26. Repérer les accès de l’épave

Lieu : Épave enfouie — seuil ; point a (619, 88). Action : inspect. Maintien : 0.65 s. Commande : interaction simple / sélection éventuelle.

Indice : Regardez les volumes avant d’avancer.

Conséquence écrite : Il reste un passage entre les nervures.

### 27. Documenter les vestiges

Lieu : Chambre des vestiges ; point b (1320, 88). Action : inspect. Maintien : 0.65 s. Commande : interaction simple / sélection éventuelle.

Indice : Ne donnez pas un nom certain à ce qui ne l’est pas.

Conséquence écrite : Ces restes ne sont pas humains.

Événement : Ripley — Ces restes n’étaient pas humains. Nous devons quitter cette chambre.

Accompagnement possible : Hoop, 24 ≤ objectifs achevés < 30. Départ physique : Épave enfouie — seuil. Ripley mène dans l’épave. Fin de l’accompagnement avant le changement de personnage.

## 10 — Ne les réveillez pas

Personnage : Ellen Ripley.

### 28. Dégager le passage de la chambre

Lieu : Chambre d’incubation ; point a (686, 88). Action : lure. Maintien : 0.65 s. Commande : interaction simple / sélection éventuelle.

Indice : Un leurre éloigne l’adulte, pas les œufs.

Conséquence écrite : Le couloir se libère quelques instants.

### 29. Identifier le passage de service

Lieu : Chambre d’incubation ; point c (2345, 88). Action : inspect. Maintien : 0.65 s. Commande : interaction simple / sélection éventuelle.

Indice : Contournez les niches ; économisez le feu.

Conséquence écrite : La suture de la coque mène vers la mine.

### 30. Isoler le passage derrière le groupe

Lieu : Suture de la coque ; point b (1210, 88). Action : seal. Maintien : 1.25 s. Commande : interaction simple / sélection éventuelle.

Indice : La cloison ne transforme pas la ruche en lieu sûr.

Conséquence écrite : Le passage est fermé. Il faut continuer.

Événement : Hoop — Kasyanov a le bras touché. Sneddon ne tient plus debout. On remonte ensemble.

Accompagnement possible : Hoop, 24 ≤ objectifs achevés < 30. Départ physique : Épave enfouie — seuil. Ripley mène dans l’épave. Fin de l’accompagnement avant le changement de personnage.

## 11 — La seconde cage

Personnage : Chris « Hoop » Hooper.

### 31. Remettre le frein de cage

Lieu : Puits secondaire — cage ; point a (470, 88). Action : repair. Maintien : 1.25 s. Commande : sequence.

Indice : Cette cage est distincte de celle du puits principal.

Conséquence écrite : La remontée est possible par ce puits.

Événement : Hoop — Baxter ! ... La cage continue de monter. Il n’est plus avec nous.

### 32. Prendre une cellule compatible

Lieu : Réserve des cellules ; point b (1298, 88). Action : carry. Maintien : 1.25 s. Commande : interaction simple / sélection éventuelle.

Indice : Une charge portée interdit le sprint.

Conséquence écrite : La cellule est fixée au harnais.

### 33. Brancher le berceau de transport

Lieu : Poste de la concession ; point c (1722, 88). Action : install. Maintien : 1.25 s. Commande : interaction simple / sélection éventuelle.

Indice : Ne consommez pas la cellule dans le réseau du poste.

Conséquence écrite : La cellule est prête pour le retour.

Accompagnement possible : Ripley, 31 ≤ objectifs achevés < 36. Départ physique : Réserve des cellules. Retour des réserves au Samson. La scène médicale et le portage ultérieurs restent distincts.

## 12 — Quitter la concession

Personnage : Chris « Hoop » Hooper.

### 34. Isoler les réserves condamnées

Lieu : Réserve des cellules ; point a (566, 88). Action : circuit. Maintien : 1.25 s. Commande : interaction simple / sélection éventuelle.

Indice : La cellule de secours reste sur son berceau.

Conséquence écrite : La séquence d’abandon est armée.

### 35. Fermer le dernier accès au site

Lieu : LV-178 — aire d’atterrissage ; point c (2296, 88). Action : seal. Maintien : 1.25 s. Commande : interaction simple / sélection éventuelle.

Indice : La carte conserve les lieux abandonnés.

Conséquence écrite : La concession n’est plus une route de repli.

### 36. Rejoindre l’orbite

Lieu : Samson — cockpit ; point a (374, 88). Action : repair. Maintien : 1.25 s. Commande : interaction simple / sélection éventuelle.

Indice : Utilisez le passage de transfert vers le Samson.

Conséquence écrite : Le Marion dérive toujours.

Accompagnement possible : Ripley, 31 ≤ objectifs achevés < 36. Départ physique : Réserve des cellules. Retour des réserves au Samson. La scène médicale et le portage ultérieurs restent distincts.

## 13 — Le passager restant

Personnage : Chris « Hoop » Hooper.

### 37. Vérifier les traces du quai

Lieu : Hangar des navettes ; point b (1573, 88). Action : inspect. Maintien : 0.65 s. Commande : interaction simple / sélection éventuelle.

Indice : Ne prenez pas le silence pour une absence.

Conséquence écrite : Quelque chose est resté à bord.

Événement : Hoop — Lachance vient de tomber. La présence nous a suivis jusqu’au quai.

### 38. Attirer la présence dans la soute

Lieu : Soute de quarantaine ; point a (624, 88). Action : lure. Maintien : 0.65 s. Commande : interaction simple / sélection éventuelle.

Indice : Gardez la commande de cloison entre vous et elle.

Conséquence écrite : Le leurre résonne dans le fret.

### 39. Condamner la soute de quarantaine

Lieu : Soute de quarantaine ; point c (2132, 88). Action : seal. Maintien : 1.25 s. Commande : interaction simple / sélection éventuelle.

Indice : Le confinement enlève cette menace du secteur.

Conséquence écrite : La soute est perdue. La route vers l’infirmerie reste libre.

Événement : Hoop — Sneddon a condamné la soute de l’intérieur. Après l’éclair, plus aucun mouvement.

## 14 — L’infirmerie ne répond plus

Personnage : Chris « Hoop » Hooper.

### 40. Rétablir l’alimentation médicale

Lieu : Infirmerie ; point a (538, 88). Action : repair. Maintien : 1.25 s. Commande : sequence.

Indice : Le secours physique est indépendant du terminal.

Conséquence écrite : Le matériel de soin est alimenté.

### 41. Accompagner Ripley dans l’unité médicale

Lieu : Infirmerie ; point c (1837, 88). Action : inspect. Maintien : 0.65 s. Commande : sequence.

Indice : Restez auprès de l’unité jusqu’à la fin du programme.

Conséquence écrite : Le programme de l’unité est terminé. Ripley reste inconsciente.

Événement : Ripley — Faites cesser ces images. Je ne veux plus revoir cet endroit.

### 42. Vérifier l’alerte de l’unité médicale

Lieu : Infirmerie ; point b (1232, 88). Action : inspect. Maintien : 1.25 s. Commande : interaction simple / sélection éventuelle.

Indice : Revenez au pupitre médical, près du lit.

Conséquence écrite : Le réseau a repris le contrôle. Kasyanov ne répond plus. Il faut évacuer Ripley.

Événement : Hoop — La commande vient de changer toute seule. Kasyanov ne répond plus. Je ramène Ripley au Narcissus.

## 15 — Couper Ash

Personnage : Chris « Hoop » Hooper.

### 43. Installer Ripley et la cellule de retour

Lieu : Narcissus — cryostase ; point b (880, 88). Action : install. Maintien : 1.25 s. Commande : interaction simple / sélection éventuelle.

Indice : Rejoignez le Narcissus en portant Ripley. Le sprint est indisponible.

Conséquence écrite : Ripley est en stase avec Jones. La cellule de retour est branchée.

### 44. Purger la copie d’Ash

Lieu : Narcissus — cryostase ; point c (1312, 88). Action : purge. Maintien : 1.25 s. Commande : sequence.

Indice : Le purificateur local doit être isolé du réseau avant de lancer la purge.

Conséquence écrite : Ash ne répond plus. La commande automatique des attaches ne fonctionne pas.

Événement : Hoop — La copie a disparu. Mais les attaches automatiques sont mortes avec elle. Je dois revenir au quai.

### 45. Contrôler les verrous d’amarrage

Lieu : Amarrage du Narcissus ; point c (1722, 88). Action : inspect. Maintien : 0.65 s. Commande : interaction simple / sélection éventuelle.

Indice : La commande automatique reste bloquée.

Conséquence écrite : Le largage devra être manuel.

## 16 — Dernière transmission

Personnage : Chris « Hoop » Hooper.

### 46. Libérer le Narcissus

Lieu : Amarrage du Narcissus ; point a (504, 88). Action : release. Maintien : 1.25 s. Commande : interaction simple / sélection éventuelle.

Indice : La commande est sur le Marion. Ripley et Jones restent dans la navette.

Conséquence écrite : La navette s’éloigne. Il faut rejoindre le Samson.

Événement : Hoop — Le collier est ouvert. Le Narcissus s’éloigne.

### 47. Fermer le Samson

Lieu : Samson — soute ; point b (1177, 88). Action : repair. Maintien : 1.25 s. Commande : interaction simple / sélection éventuelle.

Indice : Préparez la dernière cabine encore accessible.

Conséquence écrite : La coque tient. La radio aussi.

### 48. Émettre un appel de détresse

Lieu : Samson — cockpit ; point c (1279, 88). Action : transmit. Maintien : 1.25 s. Commande : tuning.

Indice : Aucun sauvetage futur n’est affirmé.

Conséquence écrite : Le message part. Aucune réponse, pour l’instant.

## Passe V0.4
Le scénario et ses 48 objectifs restent ceux de la V0.3. Les verrous, services locaux et trajets de traque n’ajoutent aucune nouvelle issue canonique.


## Annexe facultative V0.7 — Les archives noyées

À partir du chapitre 8, partir de la galerie de roulage vers la galerie de retour. Fermer l’arrivée, rejoindre les échangeurs, ouvrir la dérivation et lancer les pompes. Le détour retour → poste → réserve → échangeurs ne requiert pas le niveau bas ; la traverse échangeurs → front le requiert. Après 18 secondes simulées, l’armoire de la réserve se déverrouille. Récupérer le boîtier, revenir au poste et le brancher, synchroniser puis copier. Les huit gestes n’avancent pas la campagne principale. Les quatre nouvelles notes sont originales au jeu. O suit l’annexe ; T pose le boîtier pour le reprendre plus tard. Les pertes d’équipage et l’issue principale ne sont pas réécrites.


## V0.9 — manutention facultative

Les six mobiles ne remplacent aucun objectif. Leur déplacement n’ouvre pas de nouveau chapitre et ne dépense pas de composant. Les parcours restent réalisables avec leur stationnement initial ; la navigation suit désormais les détours disponibles plutôt qu’une ligne centrale imposée. X maintenu saisit les poignées, les directions déplacent, le relâchement freine. Les aires protègent portes et points de scénario.
