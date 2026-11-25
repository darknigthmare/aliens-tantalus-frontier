
/* v0.7: authored connectors. These are original staging, not measured film plans.
   A and B are reciprocal existing doors; progress is local to a traversal, never
   an alternate quest flag or a portal bypass. Durations are simulation seconds. */
(function(G){'use strict';const D=G.AVP_DATA;
D.version='0.7.0';D.schema=7;D.releaseName='Tenir la ligne';
D.traversals=[
 {id:'relay-ladder',title:'L’échelle du relais',a:'office--tower',b:'tower--office',kind:'ladder',biome:'metal',duration:5.8,axis:'y',points:[[.34,.82],[.47,.24]],height:12,hazards:[{id:'wind',at:.52,lane:0,type:'wind',damage:10}],description:'Une échelle extérieure relie le bureau à la plate-forme du relais. Déplacez le corps sur le côté avant la rafale, ou agrippez les barreaux.'},
 {id:'thermal-rappel',title:'La dernière longueur',a:'bore--forecourt',b:'forecourt--bore',kind:'rappel',biome:'ice',duration:9,axis:'y',points:[[.35,.20],[.62,.82]],height:36,hazards:[{id:'ice-high',at:.26,lane:0,type:'ice',damage:16},{id:'ice-low',at:.67,lane:1,type:'ice',damage:16}],description:'Rappel entre le palier du tunnel thermique et le parvis. La ligne guide la descente ; la vitesse, le décalage et le frein restent sous votre contrôle.'},
 {id:'cycles-shaft',title:'Le puits des cycles',a:'glyphs--astrarium',b:'astrarium--glyphs',kind:'ladder',biome:'stone',duration:6.4,axis:'y',points:[[.36,.82],[.50,.22]],height:16,hazards:[{id:'stone',at:.55,lane:-1,type:'stone',damage:14}],description:'Des prises anciennes montent vers la chambre des cycles. La poussière annonce une chute de petits fragments, pas une dalle invisible.'},
 {id:'builders-ledge',title:'La corniche des bâtisseurs',a:'refuge--balcony',b:'balcony--refuge',kind:'ledge',biome:'stone',duration:6.8,axis:'x',points:[[.18,.76],[.81,.40]],height:9,hazards:[{id:'ledge-dust',at:.43,lane:0,type:'stone',damage:14},{id:'ledge-stone',at:.76,lane:-1,type:'stone',damage:14}],description:'Un passage étroit à flanc du monument. Avancez latéralement, arrêtez-vous ou revenez sur vos pas ; la rambarde n’est pas un téléporteur.'},
 {id:'drain-conduit',title:'Le conduit de déversement',a:'incubator--drain',b:'drain--incubator',kind:'crawl',biome:'hive',duration:5.6,axis:'x',points:[[.17,.56],[.83,.62]],height:0,hazards:[{id:'steam',at:.57,lane:0,type:'steam',damage:12}],description:'Un conduit bas rejoint le drain. Le jet condensé occupe une portion de passage ; s’immobiliser ne suspend pas son cycle.'},
 {id:'restraint-hoist',title:'Le palan des entraves',a:'nursery--gantry',b:'gantry--nursery',kind:'chain',biome:'hive',duration:7,axis:'y',points:[[.39,.82],[.54,.22]],height:18,hazards:[{id:'acid-high',at:.36,lane:1,type:'acid',damage:16},{id:'acid-low',at:.72,lane:0,type:'acid',damage:16}],description:'Le chemin d’entretien longe les chaînes du palan. Les gouttes de résine acide sont annoncées avant de traverser la ligne.'}
];
const hints=[
 ['Un passage à traverser','E près du seuil engage le franchissement. La pièce d’arrivée n’est découverte qu’une fois l’autre extrémité atteinte.'],
 ['Choisir son allure','La direction du passage commande la progression. Maj augmente la vitesse et la dépense de prise ; relâcher la direction arrête Lex.'],
 ['Se décaler','Dans une montée ou un rappel, gauche et droite déplacent Lex sur la ligne. Sur une corniche ou dans un conduit, haut et bas la décalent.'],
 ['Tenir la prise','C immobilise et fait récupérer la prise plus vite. Un choc est réduit, pas annulé. Épuiser la prise provoque un glissement et une blessure.'],
 ['Revenir au départ','La direction opposée permet de rebrousser chemin. E au tout début annule le départ, sans découvrir la destination.'],
 ['Les autres traversent aussi','Les compagnons rejoignent d’abord le même seuil à pied, puis leur franchissement prend du temps. Leur trajet engagé ne change pas si Lex se déplace.'],
 ['Du temps, pas un abri','Le compte à rebours, les cycles et les effets temporaires continuent. Seuls les menus de pause suspendent la simulation.'],
 ['Une reprise sur la ligne','Le carnet conserve le passage, la direction, la progression, le décalage, la prise et les dangers déjà déclenchés. Aucune touche ne reste maintenue au chargement.']
];
for(let i=0;i<hints.length;i++)D.codex.push({id:'crossing-rule-'+i,category:'Franchissements',title:hints[i][0],text:hints[i][1],unlockRoom:i===5?'nursery':'bore'});
for(const t of D.traversals)D.codex.push({id:'crossing-'+t.id,category:'Franchissements',title:t.title,text:t.description,unlockRoom:t.a.split('--')[0]});
})(globalThis);

