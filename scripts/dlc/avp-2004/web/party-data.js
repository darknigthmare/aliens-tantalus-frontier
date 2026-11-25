
/* Original connective writing for this adaptation. No film dialogue is reproduced. */
(function(G){'use strict';const D=G.AVP_DATA;
D.version='0.6.0';D.schema=6;D.releaseName='Ne pas rester seule';
D.companions=[
 {id:'sebastian',name:'Sebastian',role:'Lecture du monument',asset:'sebastian',start:'facade',until:'weyland',speed:215,height:110},
 {id:'scar',name:'Scar',role:'Soutien et reconnaissance',asset:'scar',start:'alliance',until:'queen',speed:235,height:146}
];
D.encounters=[
 {id:'weyland-brief',actor:'weyland',name:'Charles Bishop Weyland',room:'brief',x:930,y:146,from:0,to:3,title:'Une fenêtre dans la glace',
  lines:[['Weyland','Le satellite a relevé une chaleur régulière. Pas une simple poussée volcanique.'],['Lex','Une image thermique ne dit rien de la solidité du terrain. Je décide du passage et du retour.']],
  choices:[{label:'Fixer la priorité au retour',reply:'Weyland acquiesce. Le relais et les ancrages seront vérifiés avant la descente.',hint:'Le groupe de la machinerie alimente les installations de l’expédition.'},{label:'Demander les relevés',reply:'Il fait glisser le dossier sur la table : les variations semblent suivre un rythme.',hint:'Consulter les relevés reste une action distincte, près de la table.'}]},
 {id:'miller-gear',actor:'miller',name:'Graeme Miller',room:'gear',x:1010,y:144,from:1,to:4,title:'Ce qu’on emporte',
  lines:[['Miller','J’ai séparé les fusées des trousses. Pas besoin de tout vider pour trouver une compresse.'],['Lex','Et aucun prélèvement avant d’avoir sécurisé la zone.']],
  choices:[{label:'Parler des réserves',reply:'Les caisses récentes portent les marques de l’expédition. Les placards anciens n’ont pas été réapprovisionnés.',hint:'Une caisse fouillée reste ouverte ; les réserves ne se renouvellent pas.'},{label:'Parler des fusées',reply:'Miller vérifie le bouchon d’une fusée puis la remet dans la caisse, sans la déclencher.',hint:'Le lancer s’arrête devant la pierre. Préparez une diversion du bon côté.'}]},
 {id:'miller-station',actor:'miller',name:'Graeme Miller',room:'station',x:1340,y:149,from:2,to:4,title:'Un relais avant de descendre',
  lines:[['Miller','La radio répond, mais pas longtemps. Le groupe tient encore le relais sous tension.'],['Lex','Il faut une liaison stable. Personne ne descend sur un grésillement.']],
  choices:[{label:'Vérifier l’itinéraire',reply:'La tour se rejoint par le haut de la station. Miller montre les portes plutôt que de donner une direction dans la tempête.',hint:'La carte distingue les niveaux ; les passages d’étage restent des seuils.'},{label:'Demander un signal de repli',reply:'Il règle une fréquence de secours. Lex note la position de l’atelier avant de repartir.',hint:'Les détours de l’atelier permettent de contourner la rue centrale.'}]},
 {id:'sebastian-parvis',actor:'sebastian',name:'Sebastian de Rosa',room:'forecourt',x:1110,y:144,from:4,to:5,title:'Plus ancien que nos cartes',
  lines:[['Sebastian','Les motifs ne racontent pas la même histoire, mais ils désignent tous ce passage.'],['Lex','Regardez la pierre. Je regarde ce qui peut tomber.']],
  choices:[{label:'Préparer des relevés ensemble',reply:'Sebastian range ses instruments. Il pourra accompagner Lex après le relevé du parvis.',hint:'Quatre relevés facultatifs demandent sa présence physique près du support.'},{label:'Se concentrer sur la sortie',reply:'Il marque le seuil extérieur sur son carnet. La route de retour doit rester lisible.',hint:'O ouvre le carnet des compagnons. Regrouper ne téléporte personne.'}]},
 {id:'verheiden-coffre',actor:'guard',name:'Verheiden',room:'weapons',x:1130,y:144,from:6,to:7,title:'Ne rien emporter',
  lines:[['Verheiden','Les logements sont intacts. Ce coffre n’a pas été pillé.'],['Lex','Ce n’est pas une autorisation. Nous ne connaissons même pas la fonction de ces armes.']],
  choices:[{label:'Observer le mécanisme',reply:'Des rainures courent du socle vers les murs. Verheiden retire sa main du bord.',hint:'Les réglages du coffre et les préparatifs restent séparés de cet échange.'},{label:'Garder le passage en vue',reply:'Lex se tourne vers la galerie. Les murs coupent déjà une partie de la lumière du parvis.',hint:'La carte conserve les chemins connus, pas la position cachée des ennemis.'}]},
 {id:'sebastian-frise',companion:'sebastian',actor:'sebastian',name:'Sebastian de Rosa',room:'glyphs',from:9,to:11,title:'Le rôle des visiteurs',
  lines:[['Sebastian','Les silhouettes reviennent d’une scène à l’autre. Les visiteurs ne sont pas les bâtisseurs.'],['Lex','Alors nous devons savoir quel rôle ils nous réservent, et trouver une autre sortie.']],
  choices:[{label:'Lire les chasseurs',reply:'Il suit les marques du doigt sans toucher les joints. Ce qui ressemble à une cérémonie est aussi une épreuve.',hint:'Le relevé principal de la frise demande que Sebastian rejoigne Lex.'},{label:'Chercher les servitudes',reply:'Sous la frise, une rainure rejoint les dispositifs latéraux. Il existe des passages destinés à l’entretien.',hint:'Les retours déverrouillés restent ouverts dans le carnet.'}]},
 {id:'weyland-refuge',actor:'weyland',name:'Charles Bishop Weyland',room:'refuge',x:540,y:144,from:10,to:11,title:'Le dernier abri',
  lines:[['Weyland','Je ne pourrai pas maintenir votre allure.'],['Lex','On ne laisse pas quelqu’un derrière pour quelques lignes dans un rapport.']],
  choices:[{label:'Chercher un passage moins exposé',reply:'Lex examine le renfoncement. Un instant de calme ne garantit pas que la pièce restera sûre.',hint:'Une porte fermée retarde les créatures sans arrêter leur recherche.'},{label:'Rester un instant',reply:'Weyland reprend son souffle. Le silence laisse entendre la pierre qui travaille au-delà du mur.',hint:'Les échanges s’interrompent lorsque le danger se rapproche.'}]},
 {id:'scar-alliance',companion:'scar',actor:'scar',name:'Scar',room:'hunter',from:12,to:15,title:'Un accord sans mots',
  lines:[['Lex','Je te rends ton arme. Nous avons un ennemi commun.'],['Observation','Scar incline la tête vers la sortie, puis vers la pointe de la lance. Aucun mot humain ne traduit ce geste.']],
  choices:[{label:'Lui demander de couvrir',reply:'Lex laisse un angle de tir dégagé. Scar remet son canon en ligne.',hint:'Soutien : Scar tire sur une menace visible à portée ; sa réserve doit se recharger.',stance:'support'},{label:'Lui demander la discrétion',reply:'Lex abaisse sa lampe et montre la galerie. Scar cesse le tir automatique.',hint:'Discret : il suit sans tirer. Les coups déjà partis continuent leur trajectoire.',stance:'silent'}]},
 {id:'scar-entraves',companion:'scar',actor:'scar',name:'Scar',room:'gantry',from:13,to:15,title:'Avant le compte à rebours',
  lines:[['Observation','Scar suit la chaîne jusqu’à son attache. Lex examine la coursive.'],['Lex','Il faudra repasser par les mêmes portes. Pas question de te perdre de l’autre côté.']],
  choices:[{label:'Préparer le regroupement',reply:'Lex désigne le chemin parcouru. Scar se remet en marche vers elle.',hint:'Pendant la fuite, garder les vantaux ouverts pour les deux compagnons.',order:'follow'},{label:'Garder la réserve de plasma',reply:'Scar relève son canon sans tirer. La réserve se régénère tant que l’expédition avance.',hint:'Le mode discret préserve l’énergie, mais ne rend pas Lex invisible.',stance:'silent'}]},
 {id:'scar-surface',companion:'scar',actor:'scar',name:'Scar',room:'tanks',from:16,to:18,title:'Ce qui doit tenir',
  lines:[['Lex','La cuve fera le travail. Il faut seulement que la ligne tienne jusque-là.'],['Observation','Scar observe les attaches, puis la silhouette qui approche sur la glace.']],
  choices:[{label:'Confirmer le piège',reply:'Lex vérifie le point de traction. Scar couvre l’espace ouvert.',hint:'Après les préparatifs, T tire le piton pendant la reprise de la Reine.'},{label:'Préparer l’esquive',reply:'Elle repère l’espace libre de part et d’autre du butoir.',hint:'La charge garde son axe annoncé. La ligne ne s’accroche pas pendant cette charge.'}]}
];
D.studies=[
 {id:'etude-logements',room:'weapons',x:1450,y:145,title:'Les logements du coffre',hold:3.2,after:'facade',before:'weyland',text:'Les trois logements se répondent sans être interchangeables. Relevé de jeu original : la disposition des armes suggère plusieurs participants à la même épreuve.'},
 {id:'etude-cycle',room:'astrarium',x:1020,y:145,title:'Les marques du cycle',hold:3.6,after:'plasma',before:'weyland',text:'Les gravures répètent les mêmes positions. Sebastian isole le motif du cycle ; Lex note les seuils utiles. Ce relevé n’interrompt pas la rotation.'},
 {id:'etude-balcon',room:'balcony',x:980,y:145,title:'Les chemins des bâtisseurs',hold:3.2,after:'plasma',before:'weyland',text:'Les ouvertures latérales desservent les mécanismes plutôt que la salle principale. Ce raccord de level design explique les boucles de service de cette adaptation.'},
 {id:'etude-niches',room:'cloister',x:1130,y:145,title:'Les signes des niches',hold:3.6,after:'plasma',before:'weyland',text:'Les renfoncements cassent les lignes de vue, pas les sons. Les marques consignées ici forment une interprétation originale pour le carnet du jeu.'}
];
D.partyBarks=[
 {id:'arrivee-station',room:'station',from:2,to:4,speaker:'Miller',text:'Le relais d’abord. Nous aurons besoin d’une réponse pour remonter.'},
 {id:'parvis-lu',room:'sacrifice',from:5,to:7,speaker:'Sebastian',companion:'sebastian',text:'Les tables sont alignées sur les ouvertures. Elles appartiennent au mécanisme.'},
 {id:'premiere-rotation',room:'pivot',from:7,to:10,speaker:'Sebastian',companion:'sebastian',text:'Regardez les marques avant le prochain mouvement. Pas les murs qui se ferment.'},
 {id:'ossuaire',room:'ossuary',from:5,to:10,speaker:'Sebastian',companion:'sebastian',text:'Ne restez pas entre les niches. Je passe derrière vous.'},
 {id:'releve-cycle',room:'astrarium',from:7,to:11,speaker:'Sebastian',companion:'sebastian',text:'Ces positions peuvent être relevées. Donnez-moi un angle dégagé.'},
 {id:'filet',room:'duel',from:8,to:10,speaker:'Lex',text:'On ne participe pas à leur combat. On attend l’ouverture.'},
 {id:'alliance',room:'service',from:12,to:15,speaker:'Lex',companion:'scar',text:'Reste à portée. Je n’ai aucune envie de te chercher dans la pierre.'},
 {id:'retour',room:'forecourt',from:14,to:15,speaker:'Lex',text:'Le parvis est là. Je veux te voir sortir avant la détonation.'},
 {id:'quai',room:'tanks',from:16,to:18,speaker:'Lex',text:'Le frein, la chaîne, la ligne. Rien ne doit manquer.'},
 {id:'banquise',room:'icebattle',from:17,to:18,speaker:'Lex',text:'Pas pendant sa charge. J’attends qu’elle reprenne appui.'}
];
for(const [id,title,text,unlockRoom] of [
 ['compagnons','Rester à portée','Les compagnons rejoignent les seuils à pied. Une porte fermée peut séparer le groupe. O ouvre les ordres sans déplacer Lex.','forecourt'],
 ['ordre-garde','Garder une position','La garde est conservée même quand Lex change de salle. Regrouper remet le compagnon en route.','hunter'],
 ['ordre-silence','Retenir le tir','Le mode discret coupe le tir automatique de Scar. Il ne supprime pas les projectiles déjà partis.','hunter'],
 ['regrouper','Se rejoindre','Le regroupement suit les connexions praticables déjà connues. Les escaliers sont des transitions, pas une escalade libre.','service'],
 ['passage-ferme','Un passage fermé','Un compagnon ne détruit pas les grilles et n’invente pas une autre entrée. Rouvrez le chemin ou revenez le chercher.','refuge'],
 ['lecture-a-deux','Lire ensemble','Un relevé facultatif demande Lex et Sebastian près du même support, sans danger immédiat.','weapons'],
 ['paroles','Échanger sur place','U ouvre un échange à proximité. Le temps continue ; une approche hostile ou une blessure l’interrompt.','brief'],
 ['transcriptions','Conserver les échanges','Le carnet des compagnons conserve les échanges terminés, la réponse choisie et les relevés. Les dialogues sont originaux.','gear'],
 ['reprise-groupe','Reprendre avec le groupe','Le carnet conserve la pièce et la position de chacun. Il ne restaure pas une touche tenue ou une phrase en cours.','sacrifice'],
 ['limites-compagnons','Des rôles scénarisés','Les compagnons ne possèdent pas de santé simulée dans cette version. Leurs sorties suivent les jalons du récit ; les ordres ne réécrivent pas leurs destins.','glyphs']])D.codex.push({id:'party-'+id,category:'Compagnons',title,text,unlockRoom});
})(globalThis);

