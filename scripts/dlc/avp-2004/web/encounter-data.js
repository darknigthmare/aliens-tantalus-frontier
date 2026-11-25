
/* v0.10 · Authored enemy tactics, not new film lore or additional species. */
(function(G){'use strict';const D=G.AVP_DATA;
D.version='0.10.0';D.schema=10;D.releaseName='Les angles morts';D.subtitle='Les angles morts.';
D.encounterRules={pounce:{min:122,max:245,windup:.72,flight:.38,recovery:1.15,cooldown:5.6,damage:19,radius:35},tail:{min:116,max:196,windup:.94,reach:196,depth:43,recovery:1.3,cooldown:5.2,damage:23},duct:{inlet:.65,travel:2.6,outlet:1.3,recovery:1.15,cooldown:18,minDistance:300,clearance:85}};
D.enemyDucts=[
 {id:'conduit-contrepoids',room:'weights',title:'Les gorges des contrepoids',after:'cycle',a:{x:1030,y:144},b:{x:1630,y:144}},
 {id:'conduit-niches',room:'cloister',title:'Les fissures des niches',after:'cycle',a:{x:940,y:144},b:{x:1540,y:144}},
 {id:'conduit-chasseur',room:'hunter',title:'Le plafond du chasseur',after:'alliance',a:{x:870,y:144},b:{x:1470,y:144}},
 {id:'conduit-nurserie',room:'nursery',title:'Les nervures de la nurserie',after:'alliance',a:{x:1070,y:144},b:{x:1670,y:144}},
 {id:'conduit-palan',room:'gantry',title:'Le revers de la passerelle',after:'sebastian',a:{x:970,y:144},b:{x:1570,y:144}},
 {id:'conduit-entraves',room:'queenhold',title:'Les joints des entraves',after:'sebastian',a:{x:1200,y:144},b:{x:1800,y:144}}
];
const notes=[
 ['Le bond verrouillé','Le facehugger se ramasse avant de bondir. Sa direction est fixée pendant cette préparation : se décaler ou esquiver permet de quitter sa trajectoire. Le bond ne suit pas une cible qui change de place.','pounce'],
 ['Après le bond','Un bond manqué est suivi d’une reprise. La créature n’enchaîne pas instantanément une autre attaque et ne vous implante pas dans cette adaptation.','pounce'],
 ['Le coup de queue','L’adulte lève sa queue et annonce une frappe plus longue que ses griffes. Il garde son axe et sa cible pendant la préparation ; reculer ou changer de profondeur permet de l’éviter.','tail'],
 ['La garde a un sens','Le bouclier protège devant Lex après l’alliance. Il réduit les dégâts sans les annuler et coûte de l’endurance ; tourner le dos reste dangereux.','tail'],
 ['Briser l’anticipation','Un coup de piolet, de lance ou de plasma qui touche pendant l’anticipation l’interrompt. Les projectiles et les frappes rencontrent toujours les obstacles.','tail'],
 ['La même créature','Un adulte peut rejoindre une ouverture, entrer dans un conduit de la salle, puis ressortir plus loin. C’est le même adversaire : ses blessures et son identité ne changent pas.','duct'],
 ['Entendre la sortie','Un frottement et de la poussière annoncent la bouche de sortie. Ce mouvement n’ouvre pas la porte d’une autre salle. Écouter la pièce voisine conserve ses règles habituelles.','duct'],
 ['Pas de corps superposés','La créature attend lorsque sa sortie est occupée. Elle ne se matérialise pas dans Lex ou dans un compagnon. Il n’y a aucun soin ni renfort créé par le conduit.','duct'],
 ['Couper le contact','Pendant une préparation, changer de pièce ou se cacher ne révèle pas votre nouvelle position. Le coup reste attaché à la pièce et à la cible d’origine.','pounce'],
 ['Un seul passage intérieur','Un seul adulte utilise un conduit à la fois dans une salle. Grid, la Reine et les facehuggers ne les empruntent pas.','duct'],
 ['Réagir sans nouvelle touche','Les flèches, l’esquive, la garde et la frappe restent les réponses à la menace. Aucun bouton de victoire instantanée n’est ajouté.','tail'],
 ['Une reprise honnête','Une sauvegarde conserve les attaques et le transit. Un rechargement n’offre ni blessure effacée ni ouverture immédiate d’une sortie encore occupée.','duct']
];
D.encounterNotes=notes.map((n,i)=>({id:'angle-'+(i+1),category:'Comportements',title:n[0],text:n[1],unlockBehavior:n[2]}));D.codex.push(...D.encounterNotes);
})(globalThis);

