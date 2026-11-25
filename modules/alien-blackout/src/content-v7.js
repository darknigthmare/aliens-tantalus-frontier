/* V7: audited construction and reference ledger. It is NOT the original game's level data. */
(()=>{'use strict';const D=BO_DATA;
 D.version='0.7.0';D.schema=7;D.edition='Mendel — plans de contrôle';D.subtitle=D.edition;
 const sources=[
  {id:'publisher',name:'Description éditeur — iTunes, conservée par MobyGames',url:'https://www.mobygames.com/game/121221/alien-blackout/',scope:'Sept niveaux, surveillance, carte, détecteur, systèmes de secours. Description consultée.',kind:'Texte éditeur'},
  {id:'writer',name:'JD Sorvari — entretien du scénariste principal',url:'https://www.avpgalaxy.net/website/interviews/jd-sorvari-alien-blackout-lead-writer/',scope:'Pharmalabs : champignons à usage médical ; développement et personnages. Texte consulté.',kind:'Témoignage développeur'},
  {id:'artist',name:'Markus Tervola — concept art Blackout',url:'https://mtervola.artstation.com/projects/gJYRLL',scope:'Auteur et existence des dessins finaux confirmés. Feuille haute définition non récupérée ; détails des tenues NON authentifiés.',kind:'Portfolio du concepteur'},
  {id:'credits',name:'Crédits du jeu — distribution et conception',url:'https://www.mobygames.com/game/121221/alien-blackout/credits/iphone/?autoplatform=true',scope:'Identité des cinq humains. Ne documente pas leurs vêtements.',kind:'Crédits transcrits'},
  {id:'screen-eng',name:'Capture du jeu — baie et habitation',url:'https://www.shacknews.com/article/109340/alien-blackout-hands-on-preview-xeno-on-the-go',scope:'F.E.M.S 23.34.7, cinq canaux, AIRLOCK E2B, caméras Control Room / Entrance / Corridor 1 / Engineering Bay / Corridor 2. Capture consultée.',kind:'Capture originale publiée'},
  {id:'screen-research',name:'Capture du jeu — recherche',url:'https://www.pocketgamer.com/alien-blackout/review/',scope:'Research Lab 2, Lab 1 et trois coursives, dialogue de mélange volatil. Capture consultée, géométrie complète non relevée.',kind:'Capture originale publiée'},
  {id:'screen-transit',name:'Capture du jeu — transit',url:'https://www.androidauthority.com/alien-blackout-review-946655/',scope:'Hall, Station, Corridor 1 et 2 ; réparation de caméra. Capture consultée.',kind:'Capture originale publiée'},
  {id:'guide',name:'AppUnwrapper — parcours et captures des quatre premiers niveaux',url:'https://www.appunwrapper.com/2019/01/24/alien-blackout-walkthrough-guide/',scope:'Engineering Bay, Administration Hub, Transit Station, Pharmalab 3 ; Farm 3A et épurateurs. Texte consulté, plans complets non extraits.',kind:'Parcours de joueur'},
  {id:'crew-roles',name:'Xenopedia — équipage et passagers du Haldin',url:'https://avp.fandom.com/wiki/USCSS_Haldin',scope:'Source secondaire pour les fonctions : Saito capitaine, Studwick ingénieur, Thorncroft scientifique, Yutani direction.',kind:'Référence secondaire'},
  {id:'survive',name:'D3 Go! — aide officielle Survive Mode',url:'https://d3go.helpshift.com/hc/en/5-alien-blackout/faq/453-what-is-survive-mode-in-alien-blackout/',scope:'Trois canaux, pas de sauvegarde entre niveaux ni de reprise. Nos difficultés ne reproduisent pas ce mode.',kind:'Aide éditeur'}
 ];
 const personnel=[
  {id:'amanda',fullName:'Amanda Ripley',role:'Opératrice de surveillance',jacket:'#9c9d7e',pants:'#53554d',hair:'#5a402b',cut:'tied',collar:'utility',build:0.9,skin:'#c6aa90',verified:'Identité et poste de surveillance.',pending:'Visage, vêtements et animation Blackout précis : non authentifiés.'},
  {id:'saito',fullName:'Miwa Saito',role:'Capitaine / navigation',jacket:'#889a94',pants:'#394745',hair:'#202622',cut:'short',collar:'utility',build:.94,skin:'#bba187',verified:'Identité ; fonction de capitaine selon la référence secondaire.',pending:'Silhouette de travail provisoire : coupe, couleurs, coiffure et visage non authentifiés.'},
  {id:'studwick',fullName:'Dougal Studwick',role:'Ingénieur du Haldin',jacket:'#637b6e',pants:'#48554e',hair:'#68584b',cut:'short',collar:'utility',build:1.09,skin:'#c1a58c',verified:'Identité ; métier d’ingénieur. Les spécialités mécaniques lui sont attribuées.',pending:'Combinaison de travail interprétée ; portrait exact non vérifié.'},
  {id:'thorncroft',fullName:'Andrew Thorncroft',role:'Scientifique / passager',jacket:'#b3b5a6',pants:'#666456',hair:'#716655',cut:'short',collar:'civilian',build:.96,skin:'#c8b399',verified:'Identité ; scientifique, et non mécanicien du Haldin.',pending:'Veste civile claire provisoire, pas un modèle officiel ni une blouse certifiée.'},
  {id:'yutani',fullName:'Naoko Yutani',role:'Direction / passagère',jacket:'#3f5456',pants:'#343f43',hair:'#282b2c',cut:'bob',collar:'civilian',build:.88,skin:'#c0a58f',verified:'Identité ; fonction de direction. Aucun pouvoir surnaturel sur les portes.',pending:'Veste et chevelure distinctes pour la lisibilité ; apparence exacte non authentifiée.'}
 ];
 for(const c of D.crew){const p=personnel.find(p=>p.id===c.id);c.fullName=p.fullName;c.role=p.role;c.description=p.verified+' '+p.pending;}
 // The earlier build had these two jobs inverted. Display names/IDs and save identity remain stable.
 for(const ch of D.chapters){for(const t of ch.tasks){if(t.specialist==='Thorncroft')t.specialist='Studwick';else if(t.specialist==='Studwick')t.specialist='Thorncroft';}for(const s of ch.services){if(['capacitor','ventlock','incident'].includes(s.kind))s.specialist='Studwick';}}
 const newProps={
  culturetray:{name:'Bac de culture mycologique',rule:'Culture médicinale en retrait dans Pharmalab. Nouvelle interprétation graphique, pas asset officiel.'},
  mycelium:{name:'Mycélium envahissant',rule:'Colonise des panneaux hors du passage ; ne remplace pas les obstacles physiques.'},
  scrubber:{name:'Épurateur de culture',rule:'Repère de l’installation de filtration. Les réglages passent par le terminal de la pièce.'},
  culturewindow:{name:'Vitre de culture',rule:'Sépare le volume de culture et la circulation ; verre fixe non traversable hors aire jouable.'}
 };
 Object.assign(D.props,newProps);
 const converted=[],dressingChanges=[];
 for(const r of D.rooms){
  r.provenance={layout:'Construction Tantalus, pas relevé 1:1',source:'publisher',coverage:'Volume original du module ; présence exacte dans le jeu mobile non certifiée'};
  r.oldView=r.view;
  if(r.view==='SIDE'&&(r.ports.N||r.ports.S)){r.view='DEPTH';converted.push(r.id);for(const p of r.props)if(p.layer==='back'&&p.y===478&&!['locker','console'].includes(p.type)){p.y=339;dressingChanges.push({room:r.id,type:p.type,change:'Recul vers la paroi arrière après ouverture de la profondeur'});}}
  const south=r.ports.S;
  r.construction={revision:1,projection:r.view==='SIDE'?'Profil sans embranchement avant/arrière':'Profondeur jouable',bounds:{x0:50,x1:950,y0:r.view==='SIDE'?478:340,y1:r.view==='SIDE'?478:502},
   thresholds:Object.entries(r.ports).map(([side,p])=>({side,edge:p.edge,to:p.room,mount:side==='W'?'paroi-gauche':side==='E'?'paroi-droite':side==='N'?'paroi-arriere':'paroi-avant-en-coupe',foot:side==='W'?[65,478]:side==='E'?[935,478]:side==='N'?[690,347]:[320,497],opening:side==='W'?[50,478]:side==='E'?[950,478]:side==='N'?[690,340]:[320,502],clearance:28})),
   southernOpening:south?{x0:258,x1:382,y:497}:null,
   floorBand:r.view==='SIDE'?'Le profil ne conserve que des passages gauche/droite.':'Les entrées avant/arrière demandent un déplacement réel dans la profondeur.',
   fixtureNote:'Casiers et console sont des postes sur façade avec accès réservé ; les volumes du mobilier central utilisent les emprises des obstacles.'};
  r.circulation=r.construction.floorBand+' x=50..950 ; '+(r.view==='DEPTH'?'y=340..502.':'y=478.');
  // Small safety fixtures must not sit on a door jamb. No functional workstation is moved.
  for(const p of r.props)if(p.layer==='wall'&&p.x>=900){p.x=868;p.w=Math.min(p.w||35,28);p.y=Math.min(p.y,250);dressingChanges.push({room:r.id,type:p.type,change:'Dégagement du jambage droit'});}
  if(r.chapter===3){
   r.purpose+=' Pharmalab cultive des champignons médicinaux ; le décor de culture remplace le laboratoire stérile générique.';
   r.provenance.source='writer';r.provenance.coverage='Fonction mycologique documentée ; géométrie et mobilier réinterprétés.';
   r.props.push({type:'mycelium',x:310,y:285,w:220,h:120,layer:'wall',role:'Surcroissance hors du passage',source:'writer'});
   if(['lab','cold'].includes(r.kit))r.props.push({type:'culturetray',x:330,y:338,w:160,h:140,layer:'back',role:'Bac sur support arrière'},{type:'culturetray',x:498,y:338,w:130,h:130,layer:'back',role:'Bac sur support arrière'});
   if(r.kit==='power')r.props.push({type:'scrubber',x:478,y:338,w:115,h:142,layer:'back',role:'Épurateur, commandes au terminal existant'});
   if(r.kit==='corridor')r.props.push({type:'culturewindow',x:340,y:316,w:230,h:105,layer:'wall',role:'Culture séparée par une vitre fixe'});
  }
 }
 const r3=D.rooms.find(r=>r.id==='pharmalab-3');r3.name='Culture 3A / formulation';r3.provenance.source='guide';r3.provenance.coverage='Farm 3A est un repère documenté ; notre salle de culture est une réinterprétation et ne certifie pas sa position originale.';
 D.rooms.find(r=>r.id==='pharmalab-4').name='Mycothèque réfrigérée';
 D.rooms.find(r=>r.id==='pharmalab-8').name='Retour d’air des cultures';
 const ph=D.chapters[3];ph.tasks[0].title='Rétablir les épurateurs';ph.tasks[0].specialist='Studwick';ph.tasks[0].detail='Régler la filtration des cultures depuis le poste. Séquence du module, non reproduction du puzzle original.';
 ph.tasks[1].title='Stabiliser les cultures';ph.tasks[1].specialist='Thorncroft';ph.tasks[1].detail='Préserver le circuit mycologique pour dégager le transfert.';
 const transfers=D.chapters.slice(0,-1).map((c,i)=>({id:'transfer-'+i,from:c.exit,to:D.chapters[i+1].entry,label:c.name+' → '+D.chapters[i+1].name,type:'transfert de secteur',continuous:false,rule:'Déverrouillé après objectifs et regroupement. Le raccord entre secteurs est une transition, pas un couloir continu modélisé.'}));
 const markers=[
  {sector:0,labels:['Control Room','Entrance','Corridor 1','Engineering Bay','Corridor 2','AIRLOCK E2B'],source:'screen-eng'},
  {sector:1,labels:['Administration Hub'],source:'guide'},
  {sector:2,labels:['Hall','Station','Corridor 1','Corridor 2'],source:'screen-transit'},
  {sector:3,labels:['Pharmalab 3','Farm 3A','Épurateurs'],source:'guide'},
  {sector:4,labels:['Habitation'],source:'screen-eng'},
  {sector:5,labels:['A.I. Core'],source:'publisher',verification:'Libellé de secteur repris ; plan complet non authentifié'},
  {sector:6,labels:['Lab 1','Research Lab 2','Corridor 1','Corridor 2','Corridor 3'],source:'screen-research'}
 ];
 const equipment=[
  ['fems','F.E.M.S / poste d’Amanda','Système station','Référence documentée','screen-eng','monitor','Gestion des canaux et de la liaison ; interfaces et coûts Tantalus.'],
  ['camera','Caméras de surveillance','Système station','Référence documentée','publisher','monitor','Flux actif, changement de caméra et réparation par un équipier.'],
  ['motion','Détecteur de mouvement','Système station','Référence documentée','publisher','sensor','Échos datés ; cadence et durée propres au module.'],
  ['map','Carte de la station','Système station','Référence documentée','publisher','atlas','Plan interactif construit sur le graphe exécuté, pas sur les plans originaux.'],
  ['doors','Cloisons télécommandées','Système station','Référence documentée','publisher','doors','Soixante-six identifiants partagés ; forçage et recharge sont des choix du module.'],
  ['refuge','Volet du refuge','Système station','Référence documentée','publisher','seal','Protection d’Amanda et coupure des ordres. Notre refuge reste simplifié.'],
  ['radio','Liaison avec le Haldin','Système station','Référence documentée','publisher','crew','Consignes de déplacement et cachette. Les files complexes sont un ajout Tantalus.'],
  ['scrubbers','Épurateurs de Pharmalab','Installation fixe','Référence partielle','guide','task','Fonction présente via les terminaux ; puzzle et emplacement non 1:1.'],
  ['reagents','Mélange volatil de recherche','Installation fixe','Référence partielle','screen-research','task','Mélange/purge représentés par les interventions ; aucune arme portative ni explosion 1:1 certifiée.'],
  ['medical','Trousses de soins','Équipement porté','Extension Tantalus','module','treat-v3','Quatre trousses partagées, soins et secours ; pas un inventaire officiel Blackout.'],
  ['beacon','Balise acoustique','Équipement déployable','Extension Tantalus','module','beacon-deploy-v6','Trois balises ; pose physique, retard et impulsions.'],
  ['interphone','Interphone de diversion','Système station','Extension Tantalus','module','lure','Stimulus sonore et habituation, sans garantie de détourner une proie visible.'],
  ['capacitor','Accumulateur de secours','Installation fixe','Extension Tantalus','module','service','Recharge facultative dans sept annexes.'],
  ['vent-isolation','Isolation des gaines','Installation fixe','Extension Tantalus','module','service','Clapets temporaires dans les annexes.'],
  ['rescue','Protocole de portage','Procédure','Extension Tantalus','module','evac-open-v6','Approche, transport, dépose et réanimation, avec ressources réelles.'],
  ['firearms','Armes à feu portatives','Non ajouté','Non documenté','publisher',null,'Aucun arsenal portatif confirmé dans les références consultées. Aucun fusil à impulsion ou équipement d’Isolation inventé comme élément de Blackout.']
 ].map(([id,name,kind,status,source,action,detail])=>({id,name,kind,status,source,action,detail}));
 const missing=[
  'Plans complets des sept niveaux, dimensions et nombre exact de volumes non relevés : 56 pièces ne signifie pas tous les lieux officiels.',
  'Feuille de personnages du concepteur repérée, détails des tenues et visages non récupérés : les cinq silhouettes restent des interprétations.',
  'Haldin : sas d’entrée et de retour présents, intérieur complet et vol de départ non modélisés.',
  'Refuge original à plusieurs accès selon le niveau : notre refuge unique et sa fuite latérale restent une adaptation.',
  'Ordre exact des objectifs, interventions simultanées, arrivée différée des personnages et timings non reproduits intégralement.',
  'Les noms de caméras relevés sont conservés dans le registre ; leur correspondance avec toutes nos pièces n’est pas affirmée.',
  'Aucun dialogue doublé original, animation officielle, texture extraite ou musique officielle livré.',
  'Notre difficulté Survie n’est pas le Survive Mode officiel à trois canaux sans reprises.',
  'Les deux côtés de la galerie basse de recherche sont au sud : raccord en U identifié, pas une porte posée entre deux pièces superposées.',
  'Les deux Aliens des derniers secteurs, soins, balises et secours sont des extensions Tantalus, pas une restitution du jeu original.',
  'Sauvegardes et moteur autonomes ; aucun raccord natif MIRE ni déploiement.'
 ];
 D.fidelity={revision:1,checkedOn:'2026-09-29',sources,personnel,equipment,markers,transfers,converted,dressingChanges,missing,claim:'Objectif de fidélité ; version non 1:1. Les validations de construction ne prouvent pas une conformité au plan officiel.'};
 const rules=[
  ['La porte appartient à une paroi','Chaque seuil est rattaché à la paroi gauche, droite, arrière ou avant en coupe. Aucun châssis autonome posé dans la circulation.'],
  ['Avant et arrière praticables','Les 23 anciens profils avec sorties N/S deviennent des salles à profondeur jouable. Les seuils avant et arrière sont atteints physiquement.'],
  ['Une porte, un état partagé','Les 66 identifiants sont réciproques. La plaque indique le numéro et la destination de l’autre côté.'],
  ['La coupe avant ne simule pas un escalier','Une issue sud est une ouverture dans une cloison de premier plan coupée pour la visibilité, pas une rampe sans destination.'],
  ['Plan et moteur partagent les données','L’atlas utilise ports, obstacles, cachettes et terminaux du moteur. Les connexions ne partent plus du centre des pièces dans cet atlas.'],
  ['Raccord en U explicite','Research-d11 relie deux accès sud par une galerie basse. Les segments extérieurs sont dessinés autour des volumes.'],
  ['Transferts de secteur annoncés','Six liaisons entre sortie et entrée suivantes sont listées. Leur chargement reste une transition ; aucun faux couloir continu.'],
  ['Débattement dégagé','Les petits équipements du jambage droit sont reculés ; la couche de décor est masquée dans les embrasures pour ne pas boucher visuellement une ouverture.'],
  ['Pharmalab est mycologique','Bacs, mycélium, vitre et épurateur évoquent la production de champignons médicinaux documentée par le scénariste.'],
  ['Studwick répare, Thorncroft analyse','Correction des deux fonctions inversées. Les bonus sont des réglages du module, pas des statistiques officielles.'],
  ['Silhouette distincte n’est pas portrait conforme','Les cinq identités ont des dessins distinguables. Les coupes, teintes et visages non vérifiés sont signalés.'],
  ['Équipement actif ou simple décor','Le registre sépare les systèmes utilisables, les ajouts Tantalus et les props non ramassables.'],
  ['Pas d’arsenal emprunté sans preuve','Les armes des autres titres Alien ne sont pas ajoutées à Blackout sous prétexte d’exhaustivité.'],
  ['Références accessibles depuis le jeu','Les documents consultés et les lacunes sont inscrits dans le registre, sans transformer une référence textuelle en preuve visuelle.'],
  ['Importer sans changer les ressources','Le schéma v7 encapsule l’état v6 ; aucun soin, balise ou objectif n’est ajouté lors du passage v6 → v7.'],
  ['Atlas en pause, commandes explicites','Consulter un autre secteur ne déplace pas les personnages. Une caméra hors secteur n’est pas actionnable.'],
  ['Exhaustivité locale contrôlée','L’atlas couvre les 56 pièces fournies et leurs 132 faces de portes. La couverture de tous les lieux officiels reste non certifiée.'],
  ['Plan schématique, métrique locale','Les unités 1000 × 560 décrivent le cadre du moteur. Ce ne sont ni des mètres ni un plan d’architecte officiel.']
 ];
 for(const [i,[name,text]]of rules.entries())D.rules.push({id:'faith-v7-'+(i+1),name,text});
})();
