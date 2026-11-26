/* Reference and completion registry. A codex card is never counted as gameplay.
   Film staging beats are distinguished from authored routes and the SE additions. */
export const SOURCES=Object.freeze([
 {id:'studio',title:'20th Century Studios — Aliens',url:'https://www.20thcenturystudios.com/movies/aliens',use:'film, personnages et contexte'},
 {id:'pulse',title:'Propstore — M41A Pulse Rifle (Aliens)',url:'https://propstore.com/product/aliens-1986/m41a-pulse-rifle/',use:'silhouette et finition de l’accessoire original'},
 {id:'flame',title:'Propstore — Ripley screen-matched flamethrower',url:'https://propstore.com/product/aliens-1986/ellen-ripleys-sigourney-weaver-screen-matched-practical-special-effects-colonial-marine-flamethrower-unit/',use:'M240, emploi et assemblage avec le M41A'},
 {id:'smartgun',title:'Propstore — M56 Smartgun',url:'https://propstore.com/product/aliens-1986/lot-9-m56-smartgun/',use:'Vasquez/Drake et harnais articulé'},
 {id:'marines',title:'NECA — Aliens Series 1',url:'https://store.necaonline.com/blogs/news/first-look-aliens-series-1-action-figures-in-packaging',use:'référence secondaire sous licence : Hicks/Hudson, shotgun, tracker, lampe et soudeur'},
 {id:'hudson',title:'Propstore — Hudson USCM webbing',url:'https://propstore.com/product/aliens-1986/private-hudsons-bill-paxton-uscm-webbing/',use:'ceinture et sangles d’un accessoire de production'},
 {id:'apone',title:'Propstore — Apone screen-matched armour',url:'https://propstore.com/product/aliens-1986/sergeant-apones-al-matthews-screen-matched-u-s-colonial-marines-armor-costume/',use:'armure, construction et marquages'},
 {id:'eyepiece',title:'Propstore — Vasquez smartgun eyepiece',url:'https://propstore.com/product/aliens-1986/lot-7-pvt-vasquezs-jenette-goldstein-screen-matched-m56-smartgun-eye-piece/',use:'oculaire distinct pour les smartgunners'},
 {id:'warrior',title:'NECA — 1986 Warrior',url:'https://store.necaonline.com/blogs/news/shipping-now-aliens-1-4-scale-xenomorph-warrior-action-figure',use:'référence licenciée : silhouette striée et reflets bleus du Warrior'},
]);
const person=(id,name,role,wear,skin,hair,notes,equipment,source='studio')=>({id,name,role,wear,skin,hair,notes,equipment,source});
export const CHARACTERS=[
 person('ripley','Ellen Ripley','Civile / survivante du Nostromo','flight-blue','#bb9276','#4d3026','Cheveux bruns bouclés ; combinaison gris-bleu, pas d’armure Marine par défaut. Arme portée seulement selon l’étape.',['pulse','flame','torch']),
 person('hicks','Dwayne Hicks','Caporal USCM','marine-heart','#b58e70','#675344','Cheveux courts ; armure camouflage, cœur sur le plastron, cartouches et shotgun secondaire.',['pulse','shotgun','welder'],'marines'),
 person('hudson','William Hudson','Technicien USCM','marine-louise','#bb957a','#514437','Armure personnalisée, Louise et marquage distinct ; casque/caméra et détecteur. Ne pas le confondre avec Hicks.',['pulse','tracker','torch'],'hudson'),
 person('newt','Rebecca « Newt » Jorden','Enfant survivante','child-grey','#c8ab8c','#b59b64','Petite silhouette, cheveux blonds sales mi-longs, vêtements gris-brun, tête de poupée Casey ; jamais d’arme.',['casey']),
 person('bishop','Bishop','Synthétique de soutien','synthetic-grey','#c1aa90','#6b5440','Combinaison claire, allure mince, cheveux courts ; technicien, pas un Marine lourd.',['uplink','knife']),
 person('vasquez','Jenette Vasquez','Smartgunner USCM','smartgun-red','#ad7350','#261d17','Bandana rouge, bras nus, oculaire et support articulé de l’arme.',['smartgun','pistol'],'eyepiece'),
 person('drake','Mark Drake','Smartgunner USCM','smartgun-cap','#b99b74','#8e794f','Bandana/couvre-chef camouflé, bras nus, oculaire et harnais de smartgun.',['smartgun','flame'],'smartgun'),
 person('apone','Al Apone','Sergent USCM','marine-sergeant','#72503a','#241d17','Casquette, tenue camouflage, armure nominative et cigare au briefing ; rôle de commandement.',['pulse','flame','comms'],'apone'),
 person('gorman','Scott Gorman','Lieutenant USCM','officer','#c2a085','#564536','Uniforme de commandement ; moniteurs dans le M577 ; blessure ultérieure non permanente au briefing.',['pistol','comms']),
 person('burke','Carter Burke','Représentant Weyland-Yutani','civilian-brown','#bd977e','#35261e','Veste civile brun-gris, aucune armure USCM ni arme attribuée gratuitement.',['dossier']),
 person('ferro','Colette Ferro','Pilote du dropship','pilot','#b39378','#5e4834','Casque de vol, visière et combinaison de pilote ; pas un fantassin.',['comms','dropship']),
 person('spunkmeyer','Daniel Spunkmeyer','Équipier de vol','pilot-crew','#b79578','#42332a','Tenue de vol avec harnais ; poste dropship.',['comms','dropship']),
 person('dietrich','Cynthia Dietrich','Corpsman USCM','marine-medic','#bb9678','#6c5439','Armure et matériel médical ; fonction de soins dans la première descente.',['flame','medical']),
 person('frost','Ricco Frost','Marine USCM','marine','#806049','#30241d','Armure camouflage et équipement d’infanterie ; ne pas réapparaître après le processeur dans une campagne fidèle.',['flame','pulse']),
 person('crowe','Trevor Crowe','Marine USCM','marine','#b89a80','#635039','Équipement USCM ; présence liée à la première descente.',['pulse']),
 person('wierzbowski','Tim Wierzbowski','Marine USCM','marine','#bb997d','#564233','Équipement USCM ; présence liée à la première descente.',['pulse']),
];
// Atlas in scene-order, not inferred metric geography. null means genuinely absent.
const place=(id,name,scope,rooms,stage,link,note='')=>({id,name,scope,rooms,stage,link,note});
export const LOCATIONS=[
 place('narcissus','Narcissus / récupération','film',[],'prologue','transport','Sauvetage et navette non joués.'),
 place('gateway-medical','Gateway · chambre médicale','film',['v114-gateway-medical'],'prologue','door'),
 place('gateway-inquiry','Gateway · commission','film',['v114-gateway-inquiry'],'prologue','door'),
 place('gateway-apartment','Gateway · appartement / entretien','film',[],'prologue','door','Lieu absent, fiche de référence seulement.'),
 place('sulaco-cryo','Sulaco · cryostase','film',['v114-sulaco-cryo'],'briefing','door'),
 place('sulaco-mess','Sulaco · mess et briefing','film',['v114-sulaco-mess'],'briefing','door'),
 place('sulaco-armory','Sulaco · préparation des armes','film',['v114-sulaco-armory'],'briefing','door'),
 place('sulaco-hangar','Sulaco · hangar et P-5000','film',['v114-sulaco-cargo','v106-sulaco'],'briefing/final','door','Deux états séparés : hangar de préparation relié à l’armurerie, final isolé. Le loader du décor ne remplace pas le duel.'),
 place('dropship','UD-4L · cabine et baie','film',['v114-dropship'],'descente','vehicle','Cabine condensée ; vol non joué.'),
 place('apc','M577 · poste de commandement','film',['v114-apc'],'descente','vehicle','Habitacle condensé ; conduite non jouée.'),
 place('colony-exterior','Hadley · approche extérieure','film',[],'colonie','vehicle','Approche, route et crash pas encore joués.'),
 place('hadley-main','Hadley · bloc résidentiel','film',['v106-hadley'],'colonie','door','Plan adapté de validation, pas levé de tournage.'),
 place('colony-mess','Hadley · réfectoire','film',['v114-colony-mess'],'colonie','door','Raccord vers le bloc résidentiel interprété pour le jeu.'),
 place('ops','Hadley · Operations','film',['v107-operations'],'colonie/défense','door'),
 place('medlab','Hadley · infirmerie / quarantaine','film',['v106-medlab'],'colonie/défense','door'),
 place('sentry','Couloir des sentinelles','special-edition',['v106-sentry'],'défense','door','Scène de l’édition longue ; l’opération locale conserve une tourelle et un stock adaptés.'),
 place('ceiling','Operations · plénum / attaque plafond','film',[],'évacuation','vent','Pas de niveau de plafond traversable.'),
 place('ducts','Conduits de repli','film',[],'évacuation','vent','Ne pas assimiler la coursive originale V112 à ces conduits.'),
 place('drain','Puits de drainage / capture de Newt','film',['v114-colony-drain'],'évacuation','shaft','Le lieu est parcourable, capture et chute non rejouées.'),
 place('processor-entry','Processeur · accès','film',['v114-processor-entry'],'première descente','door'),
 place('processor-gallery','Processeur · galeries industrielles','film',['v114-processor-gallery'],'première descente','door','Verticalité/ascenseur non simulés.'),
 place('cocoons','Ruche · colons coconnés','film',['v114-hive-cocoons'],'première descente/retour','door','Inspection de décor ; colons et chestburster non animés ici.'),
 place('nursery','Nurserie · Reine / œufs / ovipositeur','film',['v114-queen-nursery'],'retour de Ripley','door','Œufs et ovipositeur procéduraux ; boss royal manquant dans cette branche.'),
 place('elevator','Ascenseurs du processeur','film',[],'extraction','lift','Pas encore de déplacement vertical jouable.'),
 place('pad','Plateforme d’extraction','film',['v114-landing-pad'],'extraction','vehicle','Pas de pilotage ni de fin chronométrée du film.'),
 place('airlock','Sulaco · sas extérieur','film',['v106-sulaco'],'final','airlock','Commande historique protégée ; expulsion de la Reine non jouée ici.'),
 place('jorden','Hadley · vie des colons / famille Jorden','special-edition',[],'avant la perte du signal','vehicle','Séquence distincte, pas de PNJ Jorden ajoutés au repli.'),
 place('derelict','Derelict · extérieur / chambre du pilote / œufs','special-edition',[],'avant la perte du signal','vehicle','Lieux absents ; pas de porte magique depuis Operations.'),
];
export const EQUIPMENT=[
 ['pulse','M41A · fusil à impulsion','jouable','pulse','pulse'],['shotgun','Fusil à pompe de Hicks','jouable','shotgun','marines'],['flame','M240 · incinerator','jouable','flame','flame'],['smartgun','M56 · smartgun et harnais','essai armurerie','smartgun','smartgun'],['pistol','Pistolet USCM','essai armurerie','pistol','studio'],['launcher','Lance-grenades sous le M41A','essai armurerie','launcher','pulse'],['grenade','Grenade USCM','essai armurerie','grenade','studio'],['knife','Couteau de service','essai armurerie','knife','studio'],
 ['tracker','Détecteur de mouvement','jouable','T','marines'],['torch','Lampe de torse / faisceau','jouable','L','marines'],['welder','Soudeur / découpe','jouable','O / U / J','marines'],['medical','Matériel médical','jouable','I','studio'],['sentry','Sentinelle automatisée','jouable (quantité adaptée)','N / Y','studio'],['beacon','Balises / fusées de secours','adaptation jouable','P','flame'],['comms','Radio / liaisons de section','ordres locaux','G / H / C / X / N','studio'],['camera','Caméra de casque / moniteurs APC','décor et fiche','pas de flux vidéo','studio'],['armor','Armure, casque et lampe USCM','apparence seulement','pas d’armure bonus implicite','apone'],['uplink','Liaison distante de Bishop','fiche seulement','pas encore de commande dédiée','studio'],['casey','Casey, tête de poupée de Newt','apparence','jamais une arme','studio'],['loader','P-5000','décor protégé','duel absent','studio'],['apc','M577 APC','habitacle inspectable','pas de conduite','studio'],['dropship','UD-4L dropship','cabine inspectable','pas de vol','studio'],['locator','Balise de localisation / bracelet','fiche seulement','pas encore de recherche associée','studio'],['specimen','Cuves à Facehuggers','décor avec volume','pas de capture/élevage','studio'],
].map(([id,name,status,command,source])=>({id,name,status,command,source}));
export const CONTINUITY=[
 {beat:'Gateway',present:['ripley','burke'],absent:['hicks','hudson','newt'],rule:'Aucune section armée dans la convalescence.'},
 {beat:'Sulaco / première descente',present:['ripley','hicks','hudson','vasquez','drake','apone','dietrich','frost','crowe','wierzbowski','bishop','gorman','burke','ferro','spunkmeyer'],absent:['newt'],rule:'Newt est rencontrée à Hadley, pas dans le réveil initial de la section.'},
 {beat:'Retour dans la ruche',present:['ripley','newt','bishop','hicks'],absent:['hudson','vasquez','drake','apone','gorman','burke','ferro','spunkmeyer'],rule:'Ripley descend seule chercher Newt ; Hicks blessé et Bishop restent associés à l’extraction, pas compagnons tireurs dans la nurserie.'},
 {beat:'Sulaco final',present:['ripley','newt','bishop','hicks'],absent:['hudson','vasquez','drake','apone','gorman','burke','ferro','spunkmeyer'],rule:'Hicks est blessé, Bishop endommagé ; aucun trio de Marines ne couvre le duel du loader.'},
];
export function appearance(id){return CHARACTERS.find(p=>p.id===id)||null;}
