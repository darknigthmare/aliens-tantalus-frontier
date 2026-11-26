"""Authored campaign data for an original, condensed 2D fan adaptation.
No original game files, dialogue, textures or soundtrack are included.
"""
from pathlib import Path
import json, math
ROOT=Path(__file__).resolve().parents[1]
# id, name, sector, deck, view, kit, width, map column,row, architectural rationale
raw=[
('t_cryo','Torrens · Cryostase','TORRENS',1,'DEPTH','cryo',1460,0,0,"Deux alcôves de repos entourent une allée centrale ; les casiers personnels restent près de leur couchette, jamais devant le sas."),
('t_bridge','Torrens · Passerelle','TORRENS',1,'DEPTH','bridge',1540,1,0,"Le poste de pilotage fait face à la baie ; une coursive arrière relie les consoles sans traverser les sièges."),
('t_sas','Torrens · Sas de transfert','TORRENS',0,'SIDE','airlock',1260,2,0,"Le râtelier de combinaisons précède la porte extérieure ; deux seuils matérialisent la transition vers Sevastopol."),
('s_airlock','Sevastopol · Arrivée endommagée','SPATIOPORT',0,'SIDE','airlock',1560,0,1,"La déchirure de coque reste derrière une cloison ; le chemin suit le caillebotis pressurisé jusqu’au hall."),
('s_terminal','Terminal · Hall des départs','SPATIOPORT',0,'DEPTH','terminal',2060,1,1,"Le hall possède deux bandes de circulation séparées par les bancs, une façade commerciale et un accès latéral aux bagages."),
('s_shop','Terminal · Boutique fermée','SPATIOPORT',0,'DEPTH','shop',1340,1,0,"L’entrée donne sur un comptoir puis sur le stock ; les étagères forment un U ouvert, sans enfermer le joueur."),
('s_baggage','Terminal · Tri des bagages','SPATIOPORT',-1,'HYBRID','cargo',1840,2,1,"Les tapis à bagages définissent une boucle de contournement ; le passage de service est lisible derrière le chariot."),
('s_axel','Maintenance · Passage d’Axel','SPATIOPORT',-1,'SIDE','maintenance',1790,3,1,"Le passage étroit ne sert pas d’arène : les casiers alternent avec des renfoncements et la ventilation surplombe le trajet."),
('s_transit','Transit · Échangeur central','SPATIOPORT',0,'DEPTH','transit',2320,4,1,"Quais, ascenseurs et accès de service partagent une salle d’échange ; chaque destination possède une enseigne et un quai distinct."),
('y_lobby','Tour Systech · Accueil','SYSTECH',1,'DEPTH','terminal',1810,0,2,"Le comptoir d’accueil sépare les bureaux des ascenseurs ; deux voies permettent d’approcher les archives sans cul-de-sac."),
('y_archive','Systech · Enregistreur de vol','SYSTECH',1,'DEPTH','archive',1590,1,2,"Les armoires de stockage protègent l’enregistreur ; la console de lecture est devant un bureau et non au milieu d’une allée."),
('y_workshop','Systech · Atelier des accès','SYSTECH',1,'HYBRID','maintenance',1710,2,2,"L’établi occupe le fond ; un couloir profil mène au magasin de composants et un retour par conduit ferme la boucle."),
('y_duct','Systech · Conduit de retour','SYSTECH',1,'SIDE','duct',1380,2,3,"Un conduit technique bas joint l’atelier à l’accueil ; son entrée impose une posture accroupie et aucun objet de grande taille n’y apparaît."),
('c_reception','Seegson · Accueil communications','COMMUNICATIONS',2,'DEPTH','office',1640,0,3,"Le contrôle des badges précède les bureaux ; les androïdes patrouillent entre accueil et serveur, pas à travers les meubles."),
('c_control','Seegson · Salle des transmissions','COMMUNICATIONS',2,'DEPTH','comms',1960,1,3,"Une travée d’écrans fait face aux opérateurs ; les passages derrière les pupitres permettent de couper la ligne de vue."),
('c_server','Seegson · Relais de service','COMMUNICATIONS',2,'SIDE','server',1530,2,3,"Les baies occupent un seul côté ; la coursive mène au sas de l’antenne et conserve une issue visible à chaque extrémité."),
('m_reception','San Cristobal · Admission','MÉDICAL',1,'DEPTH','medical',1730,0,4,"Le triage est public, les soins sont derrière la porte contrôlée ; les bancs de visiteurs n’envahissent pas le circuit médical."),
('m_corridor','San Cristobal · Couloir des soins','MÉDICAL',1,'SIDE','hospital',2010,1,4,"Les portes des chambres, la pharmacie et le bureau médical donnent sur la même coursive ; les casiers sont de vrais refuges temporaires."),
('m_morley','San Cristobal · Bureau de Morley','MÉDICAL',1,'DEPTH','office',1420,2,4,"Le bureau, le casier du praticien et les dossiers ont des fonctions séparées ; on peut contourner la table avant de prendre la carte. Un conduit du personnel rejoint l’admission et la porte de dispensation ouvre vers la pharmacie après récupération de la carte."),
('m_pharmacy','San Cristobal · Pharmacie','MÉDICAL',1,'DEPTH','pharmacy',1480,3,4,"Les médicaments sont derrière une porte contrôlée ; les armoires sont au fond et le comptoir laisse deux accès au stockage."),
('m_coolant','San Cristobal · Refroidissement','MÉDICAL',0,'HYBRID','coolant',1880,3,5,"Le circuit de refroidissement descend vers la manutention ; les conduites suivent les murs et n’aboutissent pas dans des portes."),
('d_warehouse','Seegson · Entrepôt synthétique','LOGISTIQUE',0,'DEPTH','cargo',2230,0,5,"Deux rangées de charges créent un chemin de desserte et une voie périphérique ; les androïdes restent dans la zone de manutention."),
('d_lift','Logistique · Monte-charge','LOGISTIQUE',0,'SIDE','airlock',1210,1,5,"Le poste de commande fait face au plateau du monte-charge ; le retour vers le transit est annoncé avant le seuil."),
('w_bureau','Marshals · Poste de sécurité','MARSHALS',0,'DEPTH','marshal',1730,0,6,"Le poste réunit radios et dossiers ; une cloison sépare les cellules du refuge et une sortie rejoint le réseau de transit."),
('w_cells','Marshals · Cellules','MARSHALS',0,'SIDE','prison',1570,1,6,"La cellule de Marlow est à l’écart du poste ; son récit ouvre explicitement un souvenir, pas une porte physique vers une planète."),
('f_surface','Souvenir · Sol de LV-426','SOUVENIR',0,'SIDE','planet',2170,0,7,"La progression suit une corniche minérale ; le retour quitte le récit de Marlow et restaure Amanda au poste des Marshals."),
('f_derelict','Souvenir · Chambre des œufs','SOUVENIR',0,'DEPTH','derelict',1850,1,7,"Les courbes organiques remplacent les angles de Seegson ; l’observation reste narrative et ne transforme pas Amanda en visiteuse de LV-426."),
('g_control','Gemini · Régulation atmosphérique','GEMINI',2,'HYBRID','coolant',1980,0,8,"Le contrôle des conduites précède le laboratoire détachable ; une coursive de retour évite d’imposer deux fois la même embuscade."),
('g_lab','KG-348 · Module de confinement','GEMINI',2,'DEPTH','lab',1910,1,8,"La zone de confinement possède un poste de purge et un sas de fuite ; le détachement condamne réellement l’accès depuis Gemini."),
('g_airlock','KG-348 · Issue extérieure','GEMINI',2,'SIDE','exterior',1690,2,8,"Le sas d’évacuation mène à une traversée extérieure condensée ; une flèche distingue le retour vers la station du module abandonné."),
('a_access','APOLLO · Contrôle humain','APOLLO',-1,'SIDE','server',1600,0,9,"Le contrôle d’accès oblige à consigner le lance-flammes avant le noyau ; le dépôt peut être récupéré au retour."),
('a_labo','Seegson · Réparation des synthétiques','APOLLO',-1,'DEPTH','synthetic',1880,1,9,"Les postes de diagnostic sont rangés de part et d’autre d’une circulation de maintenance ; les unités actives ne sont pas des mannequins de décor."),
('a_samuels','Seegson · Interface de Samuels','APOLLO',-1,'DEPTH','lab',1740,2,9,"Trois disjoncteurs encadrent l’interface ; leur ordre de coupure compte et les câbles convergent vers la cabine centrale."),
('a_core','APOLLO · Noyau de consultation','APOLLO',-2,'DEPTH','apollo',2000,2,10,"Le noyau isole la consultation humaine des serveurs ; aucune apparition de Xénomorphe ne brise cette séquence centrée sur les synthétiques."),
('r_entry','Réacteur · Plateforme supérieure','RÉACTEUR',-3,'DEPTH','reactor',2140,0,10,"La plateforme distribue les branches alpha et bêta ; les escaliers du plan sont représentés par des seuils de niveau explicites."),
('r_alpha','Réacteur · Branche alpha','RÉACTEUR',-3,'HYBRID','reactor',1850,1,10,"Un disjoncteur de branche et une passerelle latérale séparent la mise sous tension du transit ; aucun saut n’est nécessaire pour l’objectif."),
('r_hive','Réacteur · Sous le nid','RÉACTEUR',-4,'DEPTH','hive',2040,1,11,"La résine suit les supports et envahit les machines existantes ; les œufs se groupent dans des alcôves, loin des seuils obligatoires."),
('r_beta','Réacteur · Branche bêta','RÉACTEUR',-3,'HYBRID','reactor',1970,2,10,"La seconde branche referme la boucle autour du réacteur ; le terminal de purge reste distinct des interrupteurs alpha et bêta."),
('n_dock','Anesidora · Sas d’embarquement','ANESIDORA',0,'SIDE','airlock',1420,0,12,"Un transfert en navette explicitement nommé remplace une fausse continuité entre deux vaisseaux ; le sas offre l’issue de retour."),
('n_bridge','Anesidora · Passerelle des archives','ANESIDORA',0,'DEPTH','bridge',1590,1,12,"L’enregistrement se consulte sur une console basse ; une issue de service rejoint directement les machines pour l’évacuation."),
('n_engine','Anesidora · Salle des machines','ANESIDORA',-1,'HYBRID','engine',1930,2,12,"Les pompes et le réacteur forment une boucle ; le danger vient d’une surcharge locale et non d’une porte arbitrairement verrouillée."),
('e_sas','Sevastopol · Préparation EVA','EXTÉRIEUR',3,'SIDE','airlock',1370,0,13,"Les combinaisons se trouvent avant le sas ; la zone extérieure ne reçoit ni bancs civils ni caches de pharmacie."),
('e_antenna','Sevastopol · Antenne de communication','EXTÉRIEUR',3,'SIDE','exterior',2220,1,13,"Le chemin est une passerelle extérieure munie de garde-corps ; les balises marquent le retour vers les communications."),
('e_clamps','Sevastopol · Verrous d’amarrage','EXTÉRIEUR',3,'SIDE','exterior',2170,2,13,"Deux attaches espacées commandent l’amarrage ; le franchissement final passe par un sas et non par le vide du décor."),
('t_return','Torrens · Le dernier sas','TORRENS',0,'SIDE','airlock',1830,3,0,"La silhouette dans le sas ferme l’adaptation ; l’éjection est une action locale et l’épilogue conserve une issue volontairement incertaine.")]
rooms=[]
for i,(id,name,sector,deck,view,kit,width,mx,my,reason) in enumerate(raw):
 rooms.append(dict(id=id,name=name,sector=sector,deck=deck,view=view,kit=kit,w=width,h=430,map=[mx,my],architecture=reason,props=[],vents=[{'x':width*.82,'y':300}],safe=sector in ['TORRENS','SOUVENIR','EXTÉRIEUR','ANESIDORA','APOLLO'],exterior=kit in ['planet','exterior'],ordinal=i))
R={r['id']:r for r in rooms}
# Mutually anchored connections. Gates are checked on use, never by invisible map teleport.
links=[]
def link(a,b,label='Porte',minimum=0,flag=None,kind='door',deny=None):
 links.append(dict(id=f'{a}__{b}',a=a,b=b,label=label,min=minimum,flag=flag,kind=kind,deny=deny))
link('t_cryo','t_bridge');link('t_bridge','t_sas');link('t_sas','s_airlock','Traversée EVA',1,kind='transfer')
link('s_airlock','s_terminal');link('s_terminal','s_shop','Boutique');link('s_terminal','s_baggage','Escalier bagages',kind='stairs');link('s_baggage','s_axel');link('s_axel','s_transit',minimum=1,flag='axel')
link('s_transit','y_lobby','Ascenseur Systech',2,kind='lift');link('y_lobby','y_archive');link('y_archive','y_workshop');link('y_workshop','y_duct','Conduit',kind='vent');link('y_duct','y_lobby','Conduit',kind='vent')
link('y_lobby','c_reception','Ascenseur communications',3,flag='tuner',kind='lift');link('c_reception','c_control');link('c_control','c_server')
link('s_transit','m_reception','Tram San Cristobal',4,kind='tram');link('m_reception','m_corridor');link('m_corridor','m_morley');link('m_corridor','m_pharmacy','Pharmacie',4,flag='morley');link('m_pharmacy','m_coolant',minimum=5);link('m_coolant','d_warehouse','Descente logistique',6,kind='stairs');link('d_warehouse','d_lift');link('d_lift','s_transit','Monte-charge transit',6,flag='lift',kind='lift')
link('s_transit','w_bureau','Tram Marshals',7,kind='tram');link('w_bureau','w_cells');link('w_cells','f_surface','Récit de Marlow',8,kind='memory');link('f_surface','f_derelict','Corniche');
link('s_transit','g_control','Tram Gemini',9,kind='tram');link('g_control','g_lab',minimum=9,flag='gemini',deny='detached');link('g_lab','g_airlock','Sas du module');link('g_airlock','s_transit','Retour EVA',9,flag='detached',kind='transfer')
link('y_lobby','a_access','Ascenseur maintenance',11,kind='lift');link('a_access','a_labo');link('a_labo','a_samuels');link('a_samuels','a_core','Accès APOLLO',12,flag='samuels');link('a_access','a_core','Contrôle humain',12,flag='samuels');link('a_core','r_entry','Ascenseur réacteur',13,kind='lift');link('r_entry','r_alpha');link('r_alpha','r_hive','Descente sous réacteur',kind='stairs');link('r_hive','r_beta','Remontée bêta',kind='stairs');link('r_beta','r_entry')
link('s_transit','n_dock','Navette Anesidora',14,flag='purge',kind='shuttle');link('n_dock','n_bridge');link('n_bridge','n_engine');link('n_engine','n_dock','Issue de service')
link('c_server','e_sas','Sas antenne',15);link('e_sas','e_antenna','Sortie EVA');link('e_antenna','e_clamps','Passerelle amarrage',17,flag='transit');link('e_clamps','t_return','Rejoindre le Torrens',18,flag='clamps',kind='transfer')
link('m_reception','m_morley','Conduit du personnel',4,flag='hunt',kind='vent')
link('m_morley','m_pharmacy','Porte de dispensation',4,flag='morley')
# Explicit anchor allocation from room graph degrees. Entrance floor is physically consistent.
for r in rooms:
 adjacent=[e for e in links if r['id'] in (e['a'],e['b'])]
 # N doors share wall; L/R main portals. Front floor portal for high-degree transit.
 n=len(adjacent)
 for j,e in enumerate(adjacent):
  side= 'a' if e['a']==r['id'] else 'b'
  if j==0: pt={'x':80,'y':300,'wall':'L'}
  elif j==1: pt={'x':r['w']-80,'y':300,'wall':'R'}
  else: pt={'x':(j-1)*r['w']/(max(2,n-1)),'y':300 if r['view']=='SIDE' else 122,'wall':'N'}
  e[side+'Point']=pt
# Main objectives. Short original dialogue, no reproduced script. Stage numbers 0..18.
chapters=[]
def ch(title,desc,goals):
 ci=len(chapters); out=[]
 for gi,g in enumerate(goals):
  room,label,mode,reply,extra=g
  goal=dict(id=f'C{ci+1:02}_{gi+1:02}',chapter=ci,room=room,label=label,mode=mode,reply=reply,hold={'hold':1.8,'pickup':.7,'talk':.6,'hack':1.0,'switch':1.4,'final':2.8}.get(mode,1.4),**extra)
  out.append(goal)
 chapters.append(dict(id=ci+1,title=title,summary=desc,goals=out))
def G(room,label,reply,mode='hold',**extra):return(room,label,mode,reply,extra)
ch('Une promesse','Amanda rejoint le Torrens, en quête d’une trace de sa mère.',[
 G('t_cryo','Récupérer le dossier de mission','Amanda — Quinze ans. Je ne cherche pas une explication parfaite. Je cherche une trace.','pickup',tool='torch'),
 G('t_bridge','Rejoindre le briefing de Samuels','Samuels — L’enregistreur du Nostromo a été transféré sur Sevastopol. Nous essaierons d’y accéder ensemble.','talk'),
 G('t_sas','Préparer la traversée','Verlaine — Les communications ne répondent pas. Vérifiez votre équipement avant de sortir.','switch')])
ch('Une station silencieuse','L’arrivée sépare Amanda de ses compagnons. Axel connaît un passage.',[
 G('s_airlock','Rétablir l’alimentation du sas','Amanda — Le sas tient. Il faut trouver une voie vers le terminal.','switch'),
 G('s_terminal','Consulter le plan des départs','Journal — Le terminal dessert le transit par la manutention. La boutique possède encore un stock de dépannage.','pickup'),
 G('s_axel','Suivre les indications d’Axel','Axel — Baisse-toi près des portes. Ceux qui restent ici n’ouvrent plus aux inconnus.','talk',flag='axel'),
 G('s_transit','Remettre le transit en service','Amanda — Axel ne répond plus. Quelque chose se déplace dans les conduits.','switch')])
ch('L’enregistreur','Les archives de Systech n’offrent pas la réponse attendue.',[
 G('y_archive','Examiner l’enregistreur du Nostromo','Amanda — L’appareil est là. Mais les données ont disparu. Pourquoi le conserver vide ?','hold'),
 G('y_workshop','Réparer le syntoniseur de sécurité','Amanda — Les fréquences sont stables. Je peux ouvrir les accès Seegson.','hack',tool='tuner',flag='tuner')])
ch('Un signal humain','Les androïdes gardent les communications, même lorsque personne ne les commande.',[
 G('c_reception','Récupérer le détecteur de mouvement','Amanda — Un écho n’est pas une identité. Il faudra regarder avant de traverser.','pickup',tool='tracker'),
 G('c_control','Établir la liaison avec Samuels','Samuels — Taylor est blessée. Le centre médical est notre meilleure chance.','hack')])
ch('La salle d’attente','San Cristobal devient la première véritable zone de traque.',[
 G('m_reception','Contacter le docteur Kuhlman','Kuhlman — Les réserves sont verrouillées. Morley avait accès à la pharmacie.','talk',flag='hunt'),
 G('m_morley','Prendre la carte de Morley','Amanda — La carte est encore sur place. Ne pas rester dans cette pièce.','pickup',flag='morley'),
 G('m_pharmacy','Déverrouiller les réserves','Amanda — Le verrou a cédé. Les médicaments sont dans le compartiment médical.','hack')])
ch('Un remède, pas un refuge','Récupérer de quoi soigner Taylor et trouver une sortie technique.',[
 G('m_pharmacy','Prélever les médicaments de Taylor','Amanda — Les doses sont intactes. Il faut repartir maintenant.','pickup',flag='medicine'),
 G('m_coolant','Purger la conduite surchauffée','Amanda — Le refroidissement libère le passage inférieur.','switch')])
ch('Les machines attendent','La route de retour traverse l’entrepôt et ses Working Joes.',[
 G('d_warehouse','Réalimenter la commande logistique','Message Seegson — Une anomalie ne constitue pas une autorisation d’interrompre le service.','hack'),
 G('d_lift','Relancer le monte-charge','Amanda — Le monte-charge rejoint le transit. Je n’ai pas besoin de retourner par les soins.','switch',flag='lift')])
ch('Les survivants','Les Marshals rassemblent encore quelques rescapés.',[
 G('w_bureau','Remettre les médicaments','Samuels — Merci, Amanda. Taylor peut tenir. Les Marshals pensent avoir une piste.','talk'),
 G('w_bureau','Écouter le plan de Waits','Waits — Le capitaine de l’Anesidora sait comment cette chose est arrivée. Parlez-lui.','talk')])
ch('Ce que Marlow a trouvé','Un souvenir jouable, distinct de la géographie de la station.',[
 G('w_cells','Interroger Marlow','Marlow — Tout a commencé avec un signal. Je vais vous montrer ce que nous avons trouvé.','talk'),
 G('f_surface','Suivre le signal de l’épave','Marlow — Nous pensions avoir trouvé quelque chose à vendre. Nous aurions dû repartir.','hold'),
 G('f_derelict','Observer la chambre découverte','Marlow — Foster s’est approchée. Ensuite, nous n’avons pensé qu’à la ramener à bord.','hold',flag='memory')])
ch('Le module sacrifié','Conduire la menace vers Gemini et s’échapper du module détaché.',[
 G('w_bureau','Prendre le lance-flammes de secours','Waits — Il ne la tuera pas. Gardez juste assez de carburant pour vous ouvrir un passage.','pickup',tool='flame',fuel=110),
 G('g_control','Réorienter la circulation d’air','Amanda — Le module reçoit maintenant les flux de Gemini. La porte de confinement répond.','hack',flag='gemini'),
 G('g_lab','Lancer le leurre de confinement','Amanda — L’alarme du module couvre mes pas. Je dois atteindre le sas avant la séparation.','switch',flag='lure'),
 G('g_airlock','Détacher le module KG-348','Amanda — Waits a condamné le module avec moi à l’intérieur. Le seul retour passe dehors.','hold',flag='detached')])
ch('Le prix du silence','Le retour chez les Marshals révèle une autre menace.',[
 G('w_bureau','Répondre à Ricardo','Ricardo — Les androïdes ont attaqué le poste. Samuels est parti chercher une réponse auprès d’APOLLO.','talk'),
 G('y_lobby','Ouvrir l’accès maintenance d’APOLLO','Amanda — La voie de maintenance est ouverte. Je vais suivre Samuels.','hack')])
ch('Samuels','Interrompre les circuits avant qu’ils ne détruisent l’interface.',[
 G('a_labo','Isoler les postes de réparation','Amanda — Les diagnostics restent actifs. Je peux interrompre la ligne sans réveiller toute la salle.','hack'),
 G('a_samuels','Couper le circuit de diagnostic','Samuels — L’interface refuse ma signature. Coupez d’abord le diagnostic.','switch'),
 G('a_samuels','Couper le circuit de refroidissement','Samuels — La surcharge est contenue. Il reste la ligne principale.','switch'),
 G('a_samuels','Déconnecter la ligne principale','Samuels — L’accès humain au noyau est déverrouillé. Continuez sans moi.','switch',flag='samuels')])
ch('La priorité d’APOLLO','La survie de la station n’est pas la priorité du système.',[
 G('a_access','Consigner le lance-flammes au contrôle','Amanda — Je laisse l’arme au contrôle. Les appareils de maintenance restent autorisés.','hold',flag='weaponsDeposited'),
 G('a_core','Accéder à la consultation humaine','APOLLO — Priorité de conservation du spécimen. Consultation réacteur requise.','hack',flag='apollo')])
ch('Sous le réacteur','Les branches du réacteur convergent vers un nid.',[
 G('r_entry','Récupérer le matériel d’entretien','Amanda — Un équipement d’urgence. Il en reste juste assez pour descendre.','pickup',flag='weaponsReturned',fuel=90),
 G('r_alpha','Armer le relais alpha','Amanda — Alpha est prêt. Il reste la seconde branche.','switch',flag='alpha'),
 G('r_hive','Traverser le nid et libérer le relais','Amanda — Ce n’était pas un seul point d’infestation. La station entière est menacée.','hold'),
 G('r_beta','Armer le relais bêta','Amanda — Les deux branches répondent. La purge doit partir de la plateforme supérieure.','switch',flag='beta'),
 G('r_entry','Déclencher la purge du réacteur','Amanda — La purge est partie. Rien ne garantit que nous avons tout éliminé.','hold',flag='purge')])
ch('Un dernier enregistrement','L’Anesidora conserve la trace qu’Amanda cherchait.',[
 G('n_bridge','Lire la copie du journal du Nostromo','Journal — Amanda découvre un message personnel de sa mère et le récit de la perte du Nostromo. Le contenu est résumé, sans voix ni transcription originale.','hold'),
 G('n_engine','Contenir la surcharge de l’Anesidora','Amanda — Marlow veut tout détruire. Taylor essaie de l’arrêter. La navette est notre seule issue.','switch',flag='anesidora'),
 G('n_dock','Préparer le retour vers Sevastopol','Amanda — Le vaisseau est perdu. Je dois encore rejoindre le Torrens.','hold')])
ch('La voix du Torrens','Rétablir un signal depuis l’antenne extérieure.',[
 G('c_control','Rechercher le canal de Verlaine','Ricardo — J’ai retrouvé la fréquence du Torrens. L’antenne doit être réalignée depuis l’extérieur.','hack'),
 G('e_sas','Vérifier la combinaison EVA','Amanda — Pression stable. J’emporte seulement ce que je peux utiliser dehors.','switch',flag='suit'),
 G('e_antenna','Aligner l’antenne sur le Torrens','Verlaine — Je vous reçois. Les attaches de la station nous empêchent encore d’approcher.','hold',flag='signal')])
ch('Le dernier transit','La station se désagrège ; le réseau d’amarrage doit être réalimenté.',[
 G('s_transit','Réarmer l’alimentation des quais','Amanda — Les quais consomment tout ce qui reste. Il faut délester la station.','switch'),
 G('c_server','Transférer l’énergie aux attaches','Amanda — Le réseau d’amarrage est alimenté. Je peux retourner sur la coque.','hack',flag='transit')])
ch('Les attaches','Détacher les derniers verrous pour rejoindre le vaisseau.',[
 G('e_clamps','Libérer l’attache avant','Verlaine — Première attache libérée. Le Torrens se stabilise.','switch'),
 G('e_clamps','Libérer l’attache arrière','Amanda — La seconde attache est ouverte. Je rejoins le sas.','switch',flag='clamps')])
ch('Pas encore seule','Le dernier sas ne contient pas le refuge espéré.',[
 G('t_return','Isoler la coursive du Torrens','Amanda — Verlaine ? Quelque chose a suivi jusque dans le sas.','switch',flag='lastThreat'),
 G('t_return','Ouvrir le sas extérieur','Le vide emporte la silhouette et Amanda. Une lumière approche dans l’obscurité. Cette adaptation s’arrête sur cette incertitude.','final',flag='ending')])
# Action stations have authored, repeatable physical anchors. Avoid passage footprints.
allgoals=[g for c in chapters for g in c['goals']]
for r in rooms:
 gs=[g for g in allgoals if g['room']==r['id']]
 for j,g in enumerate(gs):
  count=len(gs); ratio=[.62,.76,.45,.83,.56][j%5]
  # distribute slots widely enough for interactions/props; use same terminal for repeated circuits but distinct x.
  x=round(r['w']*ratio);y=300 if r['view']=='SIDE' else (318 if j%2==0 else 185)
  g.update(x=x,y=y)
  g['prop']='suit' if g.get('flag')=='suit' else 'case' if g['mode']=='pickup' else 'relay' if g['mode']=='switch' else 'terminal'
# Curated furniture kits; normalized positions are semantic slots, not RNG.
kits={
'cryo':[('cryopod',.25,190),('cryopod',.45,190),('cryopod',.65,190),('bench',.43,350),('cabinet',.86,185)],
'bridge':[('pilot',.25,180),('pilot',.44,180),('pilot',.67,180),('table',.49,300),('cabinet',.87,185)],
'airlock':[('suit',.28,195),('suit',.40,195),('pipe',.77,165),('relay',.55,185)],
' terminal':[],
 'terminal':[('bench',.23,230),('bench',.46,230),('bench',.70,360),('kiosk',.51,160),('vending',.83,175),('trolley',.30,360),('planter',.90,220)],
'shop':[('shelf',.22,175),('shelf',.40,175),('shelf',.65,175),('counter',.47,275),('case',.82,350)],
'cargo':[('container',.22,195),('container',.43,235),('forklift',.72,225),('trolley',.30,355),('crate',.63,350),('spool',.86,170)],
'maintenance':[('workbench',.30,185),('pipe',.50,145),('spool',.75,190),('fan',.88,160)],
'duct':[('fan',.37,180),('pipe',.65,170)],
 'transit':[('bench',.21,245),('bench',.43,245),('bench',.65,360),('kiosk',.74,200),('vending',.90,180),('barrier',.27,360),('trolley',.54,350)],
'archive':[('cabinet',.24,180),('cabinet',.40,180),('cabinet',.57,180),('desk',.29,280),('desk',.78,285)],
'office':[('desk',.28,230),('desk',.53,265),('chair',.48,345),('cabinet',.80,185),('water',.67,165)],
'comms':[('server',.23,175),('server',.38,175),('server',.55,175),('desk',.29,270),('desk',.74,260),('chair',.53,365)],
'server':[('server',.25,185),('server',.39,185),('server',.55,185),('server',.80,185),('pipe',.65,145)],
'medical':[('counter',.30,220),('bed',.53,240),('bench',.72,360),('cabinet',.80,165),('iv',.50,170),('water',.90,175)],
'hospital':[('bed',.27,190),('iv',.35,170),('gurney',.61,180),('cabinet',.85,185)],
'pharmacy':[('cabinet',.25,160),('cabinet',.44,160),('cabinet',.66,160),('counter',.41,275),('cart',.80,350)],
'coolant':[('tank',.25,205),('tank',.49,195),('pipe',.68,145),('pump',.75,245),('spool',.34,350)],
'marshal':[('desk',.29,245),('desk',.63,255),('cabinet',.82,185),('bench',.41,360),('radio',.43,165)],
'prison':[('bars',.28,190),('bars',.53,190),('bars',.77,190),('bench',.42,195)],
'planet':[('rock',.26,200),('rock',.57,185),('rock',.80,200)],
'derelict':[('rib',.23,180),('rib',.78,180),('egg',.33,210),('egg',.45,245),('egg',.70,230),('egg',.62,370)],
'lab':[('tank',.25,215),('table',.48,250),('cabinet',.80,175),('androidrack',.34,175),('cart',.75,355)],
'exterior':[('gantry',.28,170),('antenna',.52,170),('gantry',.77,180)],
'synthetic':[('androidrack',.23,175),('androidrack',.41,175),('androidrack',.69,175),('workbench',.30,260),('cart',.75,360)],
'apollo':[('core',.46,220),('server',.22,190),('server',.73,190),('server',.84,220),('pipe',.64,140)],
'reactor':[('turbine',.25,205),('turbine',.55,195),('pipe',.70,135),('pump',.80,240),('barrier',.37,360)],
'hive':[('rib',.23,175),('rib',.55,185),('rib',.83,195),('egg',.34,230),('egg',.50,365),('egg',.71,225),('resin',.66,175)],
'engine':[('turbine',.27,215),('pump',.49,245),('tank',.78,200),('pipe',.65,130),('barrier',.35,360)]}
# Props footprint width, depth, collision, cover. Decorations are not invisible solids.
foot={
'cryopod':(155,65,True,True),'bench':(158,42,True,True),'cabinet':(60,45,True,True),'pilot':(130,55,True,True),'table':(150,65,True,True),'suit':(55,32,False,False),'pipe':(160,20,False,False),'relay':(52,25,False,False),'kiosk':(70,40,True,True),'vending':(85,48,True,True),'trolley':(105,55,True,True),'planter':(70,42,True,True),'shelf':(112,45,True,True),'counter':(170,65,True,True),'case':(42,25,False,False),'container':(170,80,True,True),'forklift':(180,85,True,True),'crate':(80,50,True,True),'spool':(74,50,True,True),'workbench':(145,55,True,True),'fan':(95,15,False,False),'barrier':(140,24,True,True),'desk':(130,66,True,True),'chair':(46,35,True,False),'water':(40,35,True,False),'server':(90,60,True,True),'bed':(153,66,True,True),'iv':(22,20,False,False),'gurney':(141,62,True,True),'cart':(63,44,True,True),'tank':(115,80,True,True),'pump':(127,58,True,True),'radio':(58,30,False,False),'bars':(160,20,False,True),'rock':(126,35,False,True),'rib':(78,40,True,True),'egg':(51,40,True,False),'androidrack':(76,38,True,True),'gantry':(80,35,False,False),'antenna':(120,40,False,False),'core':(218,100,True,True),'turbine':(180,86,True,True),'resin':(104,24,False,False),'terminal':(78,40,False,False),'locker':(65,28,False,True),'save':(42,25,False,False),'poster':(60,2,False,False),'light':(70,2,False,False)}
for r in rooms:
 def prop(kind,x,y,semantic,interactive=None):
  fw,fd,solid,cover=foot[kind]
  if r['view']=='SIDE': solid=False
  # actions are aligned with an accessible free approach in front of prop.
  p=dict(id=f"{r['id']}.p{len(r['props']):02}",kind=kind,x=round(x),y=y,w=fw,d=fd,solid=solid,cover=cover,purpose=semantic)
  if interactive:p['interactive']=interactive
  r['props'].append(p);return p
 for kind,ratio,y in kits[r['kit']]: prop(kind,r['w']*ratio,y,{'bed':'lit de soins','bench':'attente des usagers','pipe':'réseau de service','egg':'foyer organique','core':'centre de consultation'}.get(kind,'mobilier fonctionnel de '+r['name'].split(' · ')[-1]))
 for g in [g for g in allgoals if g['room']==r['id']]:
  p=prop(g['prop'],g['x'],g['y']-42,'poste : '+g['label'],g['id']);g['propId']=p['id']
 # rest spots excluded from space and flashback; semantic placement alongside initial entrance.
 if not r['exterior'] and r['sector']!='SOUVENIR' and r['kit']!='duct':
  prop('locker',r['w']*.15,300 if r['view']=='SIDE' else 205,'cachette temporaire ; peut être inspectée','hide')
  prop('save',r['w']*.11,300 if r['view']=='SIDE' else 360,'borne d’enregistrement local','save')
  prop('case',r['w']*.86,300 if r['view']=='SIDE' else 355,'réserve unique de composants','loot')
  prop('poster',r['w']*.38,130,'signalétique du service')
  prop('light',r['w']*.60,130,'éclairage de circulation')
 if r['id']=='m_corridor':
  prop('locker',r['w']*.43,300,'alcôve des chambres ; seconde cachette de coursive','hide')
  prop('locker',r['w']*.70,300,'alcôve de sortie ; cachette avant le bureau de Morley','hide')
 # clear collision directly around doors and action interaction anchors, not cosmetically hiding a blocked goal.
 anchors=[e[s+'Point'] for e in links for s in ['a','b'] if e[s]==r['id']]+[g for g in allgoals if g['room']==r['id']]
 for p in r['props']:
  if p['solid'] and any(abs(p['x']-a['x']) < p['w']/2+45 and abs(p['y']-a['y'])<p['d']/2+42 for a in anchors):
   # move toward back wall when possible, otherwise annotate as background furniture.
   p['solid']=False;p['purpose']+=' ; placé en retrait, sans collision de circulation'
# distinct short environmental texts, one per room, all original.
notes=[
('s_shop','Dernier inventaire','Les cartons de retour portent tous une destination différente. L’un d’eux a été rouvert pour distribuer de l’eau.'),
('s_terminal','Départs annulés','Le tableau continue d’annoncer les départs. Quelqu’un a barré les horaires à la main pour que les voyageurs cessent d’attendre.'),
('s_baggage','Objets non réclamés','Les valises les plus lourdes sont restées sur le tapis. Les sacs ouverts ne contiennent plus que des vêtements.'),
('s_axel','Un endroit pour dormir','Une couverture est pliée derrière les conduites. Le sol autour du casier a été nettoyé avec soin.'),
('y_archive','Les boîtes vides','Le service des archives devait fermer à la fin du mois. Les supports ont été triés, mais personne n’a signé le transfert.'),
('y_workshop','Ce qui se répare','Le technicien a laissé les bons outils sur l’établi. Les pièces les plus utiles ont disparu avant le reste.'),
('c_reception','Satisfaction clientèle','Une affiche promet qu’un interlocuteur restera toujours disponible. L’accueil n’abrite plus qu’un androïde.'),
('c_control','Bruit de fond','Un opérateur a noté plusieurs appels interrompus par la même porteuse. Il cherchait une panne, pas une consigne de silence.'),
('c_server','Fil bleu','Le câble de l’antenne a été repéré à la main. Le marquage évite aux équipes de couper le dernier lien extérieur.'),
('m_reception','Les places restantes','Le registre du triage n’a plus de cases libres. Les noms continuent dans la marge, puis au dos des feuilles.'),
('m_morley','Avant de partir','Un message demande de ne pas abandonner les dossiers médicaux. Le manteau du praticien est encore au porte-manteau.'),
('m_pharmacy','Une dose de plus','La réserve a été rationnée avant le verrouillage. Quelqu’un a gardé de côté une boîte pour un patient qui n’est jamais revenu.'),
('m_coolant','Fuite basse','Le rapport de maintenance décrit une fuite ancienne. Une flèche indique le chemin sec pour éviter les brûlures.'),
('d_warehouse','En attente','Les unités de remplacement sont rangées par numéro de série. Plusieurs emballages portent encore leur étiquette d’expédition.'),
('w_bureau','Il reste une fréquence','Ricardo a scotché une liste de canaux sur le pupitre. Une seule ligne n’a pas été rayée.'),
('w_cells','Le prix de la trouvaille','Le manifeste de l’Anesidora mentionne du matériel récupéré. Aucun emplacement ne décrit ce qu’ils ont ramené avec eux.'),
('g_control','Module autonome','La documentation du service prévoit une séparation d’urgence. Elle insiste sur l’évacuation du personnel avant toute manœuvre.'),
('g_lab','La porte extérieure','Une poignée de sécurité ouvre le sas même en cas de perte du contrôle central. Son câble est indépendant du laboratoire.'),
('a_labo','Compétence certifiée','Les unités du service portent toutes le même numéro de procédure. Leurs dossiers ne contiennent aucun nom.'),
('a_samuels','Une autre signature','L’interface distingue les constructeurs avant de traiter la demande. Pour le système, une aide non autorisée reste une intrusion.'),
('a_core','Ordres contradictoires','Les protocoles d’évacuation sont disponibles mais classés sous une priorité supérieure. Le système ne manque pas d’informations.'),
('r_hive','Sous les machines','La résine entoure des équipements plus anciens. Le nid n’a pas remplacé le réacteur : il a trouvé une place dans ses entrailles.'),
('n_bridge','Une copie oubliée','Les archives du bord contiennent une copie que personne n’a pensée utile à transférer. Amanda s’arrête enfin de chercher une sortie.'),
('e_sas','Contrôle croisé','La liste de préparation exige normalement deux signatures. Une seule a été ajoutée, avec une écriture pressée.')]
logs=[dict(id=f'LOG{i+1:02}',room=r,title=t,text=text) for i,(r,t,text) in enumerate(notes)]
characters=[('Amanda Ripley','Ingénieure','Personnage principal. Ses outils ouvrent des voies et lui permettent de survivre ; ils ne la transforment pas en Marine.'),('Christopher Samuels','Émissaire synthétique','Compagnon de voyage, relais de Taylor et interlocuteur d’APOLLO. Son interface donne lieu à trois actions distinctes.'),('Nina Taylor','Représentante Weyland-Yutani','Sa blessure motive le détour par San Cristobal. Les scènes de l’Anesidora sont condensées sous forme de transmissions.'),('Diane Verlaine','Capitaine du Torrens','Voix de l’approche et de l’évacuation. Le contact se rétablit depuis l’antenne extérieure.'),('Axel','Survivant','Guide du premier passage. Présence narrative originale, pas compagnon physique autonome.'),('Dr Kuhlman','Médecin','Introduit le verrou médical et la recherche de la carte de Morley.'),('Dr Morley','Praticien absent','Sa carte matérialise la progression vers les réserves de la pharmacie.'),('Waits','Marshal','Responsable du plan Gemini. Les conséquences du détachement persistent dans le graphe.'),('Ricardo','Adjoint des Marshals','Accompagne la seconde partie par radio et donne des directions compréhensibles.'),('Henry Marlow','Capitaine de l’Anesidora','Narrateur et avatar temporaire du souvenir de LV-426.'),('Catherine Foster','Membre de l’expédition','Mentionnée dans le souvenir ; pas d’avatar jouable supplémentaire.'),('APOLLO','Contrôle central','Priorité de conservation et accès au réacteur. Une séquence non combattante distingue ses salles du nid.')]
rules=[
"Construire le graphe des pièces avant le décor ; un nom de salle ne suffit pas à créer un lieu.",
"Une liaison possède deux coordonnées d’arrivée, deux noms et un type de seuil.",
"Les navettes, trams, ascenseurs, souvenirs et traversées EVA sont signalés comme des transferts, pas comme des portes ordinaires.",
"La station représente une géographie condensée originale, et non un relevé des plans du jeu de 2014.",
"Le changement de vue se fait à un seuil ; aucun zoom arbitraire n’est déclenché par l’approche d’un ennemi.",
"SIDE est réservé aux coursives, conduits et passerelles ; le mouvement y suit une ligne.",
"DEPTH doit proposer au moins une boucle de contournement autour d’un groupe de meubles.",
"HYBRID conserve des extrémités latérales et ouvre la profondeur dans son volume central.",
"CLASSIC est une projection aplatie du même espace ; la profondeur reste commandée par haut et bas dans les pièces larges.",
"Aucun personnage ne doit naître dans l’empreinte solide d’un meuble.",
"Les meubles indiquent leur fonction, leur empreinte et leur capacité à bloquer la vision.",
"Les points d’interaction et les portes gardent un dégagement vérifié par pathfinding.",
"Les éléments de fond ne deviennent pas des obstacles invisibles.",
"Les collisions utilisent le plan de marche, pas le rectangle de l’image du sprite.",
"La profondeur de dessin dépend des pieds pour les meubles et les acteurs.",
"Le mobilier d’admission appartient au public ; les armoires de pharmacie restent dans une pièce contrôlée.",
"Les réserves de matériel sont uniques et leur ouverture persiste dans la sauvegarde.",
"Les portes ne donnent pas de ressources lors de leur utilisation.",
"Le détecteur ne révèle pas l’identité d’un écho et ne traverse pas toute la station.",
"Le détecteur possède un retour visuel même si le son est coupé.",
"La course et les interventions bruyantes produisent des événements sonores localisés.",
"L’accroupissement réduit le bruit et la portée d’acquisition, sans rendre invisible.",
"Les angles et les meubles interrompent la ligne de vue des ennemis.",
"Le Xénomorphe principal n’a pas de points de vie à vider.",
"La flamme provoque une retraite temporaire, consomme du carburant et perd en efficacité à force d’utilisation.",
"Un leurre sonore modifie la cible d’enquête, sans supprimer la menace.",
"L’ennemi conserve sa dernière information lorsqu’Amanda quitte une pièce.",
"Une traversée ennemie utilise un seuil ou un réseau de conduits annoncé ; aucun déplacement gratuit sur la position du joueur.",
"La pression de la traque n’accorde pas à l’IA les coordonnées exactes d’Amanda à travers les murs.",
"Un casier peut cacher Amanda, mais une entrée observée reste dangereuse.",
"Retenir son souffle diminue le bruit dans une cachette ; cela ne constitue pas une immunité.",
"Les Working Joes et les survivants hostiles ont des réactions et des vitesses différentes.",
"Le rayon de collision d’un acteur est distinct de sa taille dessinée.",
"Les Facehuggers sont limités au nid dans cette première version.",
"Les synthétiques restent la menace d’APOLLO ; le chasseur principal est exclu de ce secteur.",
"Les objets fabriqués utilisent une recette visible et des réserves finies.",
"La fabrication reste en temps réel ; les menus de carte et de codex font pause pour la lecture.",
"Un piratage comporte trois choix reproductibles ; une erreur crée du bruit et remet la séquence à zéro.",
"Une action maintenue s’annule lorsqu’on s’éloigne du poste.",
"Une entrée clavier ne doit pas traverser deux portes à la suite sans relâchement.",
"La pause et la perte de focus neutralisent les touches maintenues.",
"Le fichier de sauvegarde est versionné et utilise un espace de noms propre au DLC.",
"Une sauvegarde corrompue ne doit pas planter le menu principal.",
"Une sauvegarde aux coordonnées invalides rétablit une position libre connue.",
"Le mode Récit facilite les sauvegardes, mais ne supprime ni les dégâts ni les ennemis.",
"Une borne de sauvegarde n’est pas utilisable instantanément au milieu d’une poursuite.",
"Les circuits de Samuels se coupent dans un ordre déclaré, pas en cliquant sur un décor sans effet.",
"Le module de Gemini détaché ne peut plus être visité par la liaison qui l’attachait à la station.",
"Les branches alpha et bêta doivent être armées avant la purge.",
"La visite de LV-426 appartient explicitement au récit de Marlow et restitue Amanda à son retour.",
"Le matériel consigné à APOLLO est tracé et la phase du réacteur fournit un retour explicite des moyens de défense.",
"L’évacuation exige les opérations de signal et de puissance avant les attaches.",
"Aucune voix, musique ou transcription originale n’est distribuée.",
"Chaque archive environnementale est une création pour cette adaptation.",
"Les personnages secondaires présentés par radio ne sont pas comptés comme des PNJ physiques simulés.",
"Le rapport distingue captures d’un parcours et scènes préparées par le banc de test.",
"Le test de progression ne doit pas injecter les drapeaux de campagne pour prétendre avoir terminé la campagne.",
"Les tests unitaires d’IA placent explicitement des scénarios et ne remplacent pas une évaluation humaine de difficulté.",
"Un lien de lancement dans Tantalus n’est pas une fusion native des moteurs ou sauvegardes.",
"Le statut de prototype reste visible dans les livrables et le menu, sans revendiquer une adaptation exhaustive."
]
# Every solid footprint leaves two uninterrupted peripheral walking lanes.
# Coordinates are authored through per-service kits; no placement randomness.
for room in rooms:
 if room['view'] != 'SIDE':
  for prop in room['props']:
   if prop['solid']:
    prop['y']=min(344-prop['d']/2,max(154+prop['d']/2,prop['y']))
D=dict(meta=dict(id='tantalus.alien-isolation',version='0.1.0',title='ALIEN: ISOLATION',subtitle='Sevastopol · Dernière transmission',saveKey='tantalus.dlc.alien-isolation.v1',source='Adaptation condensée non officielle du jeu de 2014 ; plans, dialogues et art originaux.'),rooms=rooms,links=links,chapters=chapters,goals=allgoals,logs=logs,characters=[dict(name=n,role=r,text=t) for n,r,t in characters],rules=rules,footprints=foot)
(ROOT/'src/content.json').write_text(json.dumps(D,ensure_ascii=False,indent=2))
(ROOT/'src/content.js').write_text('export const CONTENT = '+json.dumps(D,ensure_ascii=False,separators=(',',':'))+';\n')
print('CONTENT',len(rooms),'rooms',len(links),'links',len(allgoals),'objectives',sum(len(r['props']) for r in rooms),'props',len(rules),'rules')
