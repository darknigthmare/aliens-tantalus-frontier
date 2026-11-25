import json, pathlib
R=pathlib.Path(__file__).resolve().parents[1]
D=R/'src/river-of-pain'
# Positions and traversal connections are authored. Cosmetic repeats are deterministic, not random layout.
room_rows=[
('pad','Aire d’atterrissage','Périmètre',0,'exterior',2900,(0,2),'Tour de contrôle et feux d’approche','pad'),
('airlock','Sas des arrivants','Accueil',0,'side',1800,(1,2),'Double porte pressurisée, douche de décontamination','airlock'),
('concourse','Coursive centrale','Accueil',0,'depth',3000,(2,2),'Signalétique des blocs, galerie vitrée','concourse'),
('ops','Contrôle colonial','Administration',1,'depth',2400,(2,1),'Baie de supervision et consoles de communications','ops'),
('briefing','Poste de la garnison','Administration',1,'side',2200,(3,1),'Casiers individuels et table de service','barracks'),
('hab','Coursive résidentielle','Habitat',1,'side',2700,(3,2),'Portes numérotées et fenêtres des logements','hab'),
('jorden','Logement des Jorden','Habitat',1,'depth',1850,(4,2),'Table familiale, lits et dessins d’enfant','quarters'),
('mess','Réfectoire','Habitat',0,'depth',2600,(4,3),'Tables, cuisine et distributeurs','mess'),
('recreation','Centre de loisirs','Habitat',0,'depth',2250,(3,3),'Jeux, bancs et accès à la maintenance','recreation'),
('med','Infirmerie','Médical',0,'depth',2800,(2,3),'Lits isolés, vitres d’observation et moniteurs','med'),
('isolation','Chambre d’isolement','Médical',0,'side',1700,(1,3),'Lit d’observation et hublot de quarantaine','isolation'),
('science','Laboratoire de la Compagnie','Recherche',0,'depth',2400,(1,4),'Paillasses, cuves et racks de confinement','lab'),
('records','Salle des archives','Recherche',1,'side',1800,(0,4),'Bandes de données et baie réseau','records'),
('garage','Garage des prospecteurs','Logistique',0,'depth',3200,(3,4),'Tracteur de prospection sur sa voie de service','garage'),
('survey','Bureau des prospecteurs','Logistique',0,'depth',2500,(4,4),'Cartes topographiques et postes radio','survey'),
('stores','Magasin de fret','Logistique',0,'depth',3100,(4,5),'Palettes, rack de levage et allées dégagées','stores'),
('power','Distribution électrique','Maintenance',-1,'depth',2600,(3,5),'Deux banques de coupe-circuits et conduites','power'),
('pump','Station de pompage','Maintenance',-1,'depth',2400,(2,5),'Collecteurs, vannes et caniveaux protégés','pump'),
('service','Galerie technique','Maintenance',-1,'side',3000,(2,4),'Passage sous les bâtiments, conduites continues','service'),
('road','Piste du plateau','Périmètre',0,'exterior',3700,(5,4),'Piquets de balisage, roches et ravines non praticables','road'),
('plateau','Plateau des relevés','Périmètre',0,'exterior',2900,(6,4),'Tracteur arrêté au pied de formations rocheuses','plateau'),
('derelict','Seuil de l’épave','Épave',0,'derelict',2500,(7,4),'Arches biomécaniques et coque affaissée','derelict'),
('processor6','Processeur six','Terraformage',0,'depth',3000,(5,5),'Passerelle industrielle et conduites sous pression','processor'),
('approach','Accès au processeur un','Terraformage',0,'exterior',3200,(1,5),'Pylônes, sas de maintenance et énormes échangeurs','approach'),
('lift','Monte-charge du processeur','Terraformage',-1,'side',1800,(1,6),'Cabine de fret et paliers identifiés','lift'),
('hive','Soubassements envahis','Terraformage',-2,'hive',3000,(2,6),'Résine sur les structures industrielles, balises PDT','hive'),
('coolant','Galerie du refroidissement','Terraformage',-2,'hive',2700,(3,6),'Passage étroit entre les échangeurs, ruche en arrière-plan','coolant'),
('vent_hab','Conduits de l’habitat','Ventilation',1,'vent',2600,(4,1),'Jonctions basses, grilles et câbles de repérage','vent'),
('vent_med','Conduits de l’infirmerie','Ventilation',1,'vent',2400,(1,1),'Grilles d’observation et courbe de service','vent'),
('vent_survey','Conduits des prospecteurs','Ventilation',0,'vent',2350,(5,3),'Grille de secours au-dessus de la dernière barricade','vent'),
('refuge','Cache des conduits','Ventilation',0,'vent',1750,(5,2),'Petit renfoncement hors des axes de ventilation','refuge'),
('hangar','Hangar scientifique','Recherche',0,'depth',3300,(0,5),'Navette de service, passerelle et réserves de carburant','hangar'),
('shuttle','Navette de la Compagnie','Recherche',0,'side',2150,(0,6),'Sas arrière, sièges et commandes de navigation','shuttle'),
('wash','Buanderie','Habitat',0,'depth',1850,(5,1),'Machines, linge abandonné et évier de service','wash'),
('relay','Relais de communications','Administration',1,'side',1950,(0,1),'Baie relais et émetteurs directionnels','relay'),
('clinic_store','Réserve médicale','Médical',0,'side',1700,(2,0),'Tiroirs de soins et stockage réfrigéré','clinic_store'),
]
rooms=[]
for i,(id,name,building,floor,kind,width,pos,landmark,theme) in enumerate(room_rows):
    depth=kind in ['depth','exterior','hive','derelict']
    rooms.append(dict(id=id,name=name,building=building,floor=floor,kind=kind,width=width,map=list(pos),theme=theme,landmark=landmark,
      minZ=.25 if depth else .7,maxZ=.90 if depth else .7,light='cold' if i%3 else 'amber',
      dimensionsM=[round(width/42,1),9 if depth else (1.1 if kind=='vent' else 2.8),3.4],
      portals=[],props=[],objects=[],spawns=[],cover=[],layerPlan=['HORIZON','SKYLINE','FAR','MID','WALL','FIXTURES','FLOOR','ACTORS','NEAR','FOREGROUND']))
by={r['id']:r for r in rooms}
# Physical portal graph. Typed links explain every floor/building/plane transition.
edges=[
('pad','airlock','sas'),('airlock','concourse','porte'),('concourse','ops','escalier'),('ops','briefing','porte'),
('concourse','hab','escalier'),('hab','jorden','porte'),('hab','recreation','escalier'),('recreation','mess','porte'),
('concourse','med','porte'),('med','isolation','porte'),('med','clinic_store','porte'),('med','science','sas'),
('science','records','escalier'),('records','relay','coursive'),('concourse','garage','porte'),('garage','survey','porte'),
('survey','stores','porte'),('stores','power','escalier'),('power','pump','porte'),('pump','service','porte'),
('service','science','escalier'),('service','garage','escalier'),('garage','road','sas'),('road','plateau','piste'),
('plateau','derelict','brèche'),('road','processor6','piste'),('pump','approach','escalier'),('approach','lift','monte-charge'),
('lift','hive','monte-charge'),('hive','coolant','passerelle'),('jorden','vent_hab','conduit'),('vent_hab','vent_med','conduit'),
('vent_med','isolation','grille'),('vent_hab','vent_survey','conduit'),('vent_survey','survey','grille'),
('vent_survey','refuge','conduit'),('refuge','wash','grille'),('wash','mess','porte'),('science','hangar','sas'),
('hangar','shuttle','passerelle'),('hab','wash','escalier'),('ops','relay','coursive'),('recreation','vent_hab','grille'),
('mess','stores','porte'),('coolant','power','échelle')]
# Slots are assigned around true gateways; obstacles below never cover these arrival/interaction points.
for idx,(a,b,kind) in enumerate(edges):
    for src,dst in [(a,b),(b,a)]:
        r=by[src]; n=len(r['portals']); x=170 if n==0 else r['width']-170 if n==1 else round(r['width']*(.28+(n-2)*.2))
        z=.7 if r['kind'] in ['side','vent'] else (.69 if n<2 else .28)
        r['portals'].append(dict(id=f'{src}>{dst}',to=dst,x=x,z=z,kind=kind,childOnly=(kind in ['conduit','grille']),
         requires='scienceClearance' if {src,dst}=={'science','hangar'} else None))
for r in rooms:
    if r['kind'] in ['depth','exterior','hive','derelict']:
        # Two authored islands, not invisible lane walls; north and south paths remain connected.
        r['cover']=[dict(id=r['id']+'-cover1',x=round(r['width']*.38),z=.56,w=160,d=.13,prop='crate' if r['kind']=='exterior' else 'machine'),
                    dict(id=r['id']+'-cover2',x=round(r['width']*.67),z=.57,w=190,d=.14,prop='rock' if r['kind'] in ['exterior','derelict'] else 'cart')]
    r['spawns']=[dict(id=r['id']+'-east',x=r['width']-55,z=.72,portal='maintenance-east'),dict(id=r['id']+'-west',x=55,z=.7,portal='maintenance-west')]
# Distinct set dressing, anchored to the rear wall or safe islands. Semantic scale and purpose retained.
props={
 'pad':['beacon','antenna','fuel','beacon','cable','tractor'], 'airlock':['shower','locker','fan','panel','lamp'],
 'concourse':['bench','window','sign','vending','window','fan','bench'], 'ops':['console','screen','console','antenna','screen','map'],
 'briefing':['locker','rifle-rack','table','locker','radio','locker'], 'hab':['hab-door','window','hab-door','plant','hab-door','drawing'],
 'jorden':['bed','table','drawing','cupboard','bed','toy'], 'mess':['vending','stove','table','table','table','sink'],
 'recreation':['arcade','bench','arcade','table','drawing'], 'med':['bed','monitor','bed','sink','medicine','bed'],
 'isolation':['bed','monitor','glass','sink','specimen'], 'science':['specimen','console','specimen','sink','microscope','tank'],
 'records':['rack','rack','console','rack','screen'], 'garage':['tractor','tools','fuel','gantry','wheel'],
 'survey':['map','console','radio','tools','shelf'], 'stores':['crate','shelf','pallet','gantry','crate','shelf'],
 'power':['transformer','panel','transformer','panel','cable','coil'], 'pump':['tank','pipe','valve','tank','valve'],
 'service':['pipe','fan','pipe','cable','pipe'], 'road':['beacon','rock','rock','beacon','wreck'],
 'plateau':['tractor','rock','beacon','rock','cable'], 'derelict':['rib','rib','fossil','rib','egg'],
 'processor6':['turbine','valve','turbine','gantry','pipe'], 'approach':['tower','beacon','pipe','tower','beacon'],
 'lift':['cable','panel','gantry','lamp'], 'hive':['resin','cocoon','rib','resin','egg','cocoon'],
 'coolant':['tank','resin','cocoon','tank','rib'], 'vent_hab':['grille','cable','grille','fan','drawing'],
 'vent_med':['grille','cable','grille','pipe'], 'vent_survey':['grille','cable','grille','resin'],
 'refuge':['toy','blanket','ration','drawing'], 'hangar':['shuttle','fuel','gantry','console','pallet'],
 'shuttle':['seat','seat','console','screen','hatch'], 'wash':['washer','washer','linen','sink','washer'],
 'relay':['rack','antenna','console','rack'], 'clinic_store':['medicine','shelf','fridge','medicine']}
for r in rooms:
    pp=props[r['id']]
    for i,kind in enumerate(pp):
        r['props'].append(dict(id=f"{r['id']}-set-{i}",kind=kind,x=round(240+(r['width']-480)*(i+.5)/len(pp)),z=.22,layer='FIXTURES',collidable=False,
          purpose={'drawing':'trace de vie familiale','resin':'progression de la contamination','console':'poste de travail','beacon':'orientation du trajet'}.get(kind,'fonction propre au lieu')))
    for c in r['cover']:
        r['props'].append(dict(id=c['id'],kind=c['prop'],x=c['x'],z=c['z'],layer='ACTORS',collidable=True,purpose='obstacle contournable et cachette basse'))

def obj(room,id,label,kind='task',x=None,z=None,description='',**extra):
    r=by[room]; n=len(r['objects']); x=x if x is not None else round(r['width']*(.23+.15*(n%4)))
    z=z if z is not None else (.7 if r['kind'] in ['side','vent'] else .81)
    o=dict(id=id,label=label,kind=kind,x=x,z=z,description=description,**extra);r['objects'].append(o);return id
# Objective chain data: every action has an actual unique physical object, no auto-complete timer.
chapter_rows=[
('La relève','brackett','pad',0, [('pad','welcome','Retrouver Paris','talk'),('ops','brief','Consulter le tableau de service','terminal'),('briefing','locker','Prendre la dotation','supply')],
 'Brackett prend ses fonctions dans une colonie qui ressemble encore à une ville.','Paris','Vous verrez la tempête plus souvent que le ciel. Les familles, elles, sont ici toute l’année.'),
('Les gens d’ici','anne','jorden',0,[('jorden','family','Préparer la tournée','talk'),('mess','provisions','Récupérer les provisions','supply'),('power','grid','Réarmer le départ habitat','power')],
 'Anne traverse les lieux ordinaires que la crise rendra bientôt méconnaissables.','Anne','On peut retarder les relevés. Pas le chauffage du bloc.'),
('Sous pression','brackett','garage',0,[('garage','rescue_kit','Prendre le matériel de secours','supply'),('processor6','pressure','Isoler la conduite endommagée','valve'),('processor6','incident','Récupérer le rapport d’intervention','terminal')],
 'Une intervention industrielle expose les tensions de la garnison. Séquence de jeu condensée autour du processeur six.','Paris','Coupez l’arrivée avant de toucher aux vannes. Ici, une mauvaise décision se propage à tout le réseau.'),
('Les coordonnées','anne','survey',0,[('survey','coordinates','Recevoir la grille de prospection','terminal'),('garage','tractor','Préparer le tracteur','vehicle'),('plateau','beacon','Poser une balise sur le plateau','beacon'),('derelict','threshold','Examiner le seuil de l’épave','scan')],
 'La sortie des Jorden rejoint le lieu désigné par la Compagnie. La découverte de Russ est traitée hors champ.','Anne','La radio passe mal. Je laisse une balise : personne ne retrouvera cette passe de nuit.'),
('La porte blanche','brackett','pad',1,[('pad','stretcher','Prendre en charge le retour des prospecteurs','talk'),('isolation','quarantine','Fermer l’isolement médical','seal'),('med','triage','Transmettre le bilan à Komiskey','terminal')],
 'Le retour des prospecteurs met l’infirmerie au centre de toutes les décisions.','Komiskey','Gardez le couloir libre. Je veux des gens qui respirent, pas une foule autour du lit.'),
('Priorité de recherche','anne','med',1,[('med','patient_log','Consulter le registre des patients','terminal'),('science','orders','Lire la directive scientifique','terminal'),('records','copy','Conserver une copie des échanges','terminal')],
 'Les priorités médicales et celles de la Compagnie divergent.','Anne','Ce n’est pas une cargaison. C’est mon mari.'),
('Derrière les grilles','newt','jorden',1,[('vent_hab','marks','Retrouver les repères de Tim','trace'),('vent_med','listen','Écouter derrière la grille','listen'),('refuge','cache','Préparer une petite cache','stash')],
 'Les jeux dans les conduits deviennent un apprentissage de la survie. Aucun combat pour Newt.','Newt','Le tuyau qui vibre revient vers la cuisine. Celui qui siffle va à l’infirmerie.'),
('Les absents','brackett','ops',2,[('ops','missing','Relever les dernières balises PDT','terminal'),('service','trail','Suivre les traces dans la galerie','scan'),('pump','reroute','Détourner la pression du passage','valve')],
 'Les disparitions ont désormais une géographie. Les itinéraires sûrs commencent à se refermer.','Brackett','On marque chaque porte derrière nous. Je refuse de perdre quelqu’un à un embranchement.'),
('Les lumières rouges','paris','med',2,[('clinic_store','medstock','Prendre les soins d’urgence','supply'),('mess','civilian','Accompagner un colon jusqu’au magasin','escort'),('stores','shelter','Mettre le refuge provisoire sous tension','power')],
 'Paris maintient une route pour les habitants. L’escorte représente une survie locale, pas une évacuation historique supplémentaire.','Paris','Restez derrière moi. Nous allons jusqu’à la lumière suivante, puis à la suivante.'),
('Fermer, tenir','anne','survey',2,[('stores','welding','Récupérer un poste à souder','supply'),('survey','barricade','Renforcer la fermeture du bureau','seal'),('power','emergency','Rétablir le circuit de secours','power')],
 'Les prospecteurs transforment leurs outils en moyens de défense.','Anne','La porte n’a pas besoin de tenir toute la nuit. Seulement assez longtemps pour les enfants.'),
('Sous le processeur','brackett','approach',3,[('lift','descent','Commander le monte-charge','terminal'),('hive','pdt','Retrouver la source des signaux','scan'),('coolant','fallback','Baliser la route de repli','beacon'),('power','withdraw','Fermer derrière le groupe','seal')],
 'Le passage dans la ruche est un échec de sauvetage, pas une chasse à la reine.','Brackett','N’approchez pas des parois. Repliez-vous par les balises ; ne tirez que pour ouvrir le passage.'),
('La dernière porte','anne','survey',3,[('survey','last_power','Alimenter le verrou une dernière fois','power'),('survey','vent_open','Dégager l’accès au conduit','seal'),('survey','newt_escape','Mettre Newt à l’abri','talk')],
 'La défense des Jorden ne change pas leur destin. Le point de vue quitte Anne au moment où Newt passe la grille.','Anne','Ne te retourne pas. Compte les virages comme quand vous jouiez.'),
('Une issue réservée','paris','science',3,[('science','hidalgo','Recevoir la transmission de Brackett','talk'),('survey','luisa','Dégager Luisa et la conduire au hangar','escort'),('hangar','clearance','Déverrouiller la navette scientifique','terminal')],
 'Brackett transmet l’indication d’Hidalgo : la Compagnie dispose d’une issue. Luisa suit Paris jusqu’au hangar.','Paris','La sortie existe. Nous allons la rendre accessible à ceux qui sont encore avec nous.'),
('La trajectoire imposée','brackett','hangar',3,[('hangar','boarding','Vérifier l’embarquement','talk'),('shuttle','autopilot','Désengager la trajectoire automatique','terminal'),('shuttle','departure','Décoller','launch')],
 'Brackett, Paris, Mori et Luisa quittent la colonie. Newt n’est pas à bord.','Brackett','Aucune trajectoire imposée. Nous choisissons où nous allons.'),
('Il reste quelqu’un','newt','refuge',3,[('wash','water','Récupérer de l’eau','supply'),('mess','ration','Trouver de quoi manger','supply'),('vent_survey','silence','Passer sans attirer la créature','listen')],
 'Le point de vue revient dans les conduits. Il faut survivre avec presque rien.','Newt','Pas la grande porte. Jamais la grande porte quand on entend les tuyaux.'),
('Jusqu’au prochain bruit','newt','refuge',3,[('vent_hab','route','Vérifier le chemin de retour','trace'),('refuge','hide','Regagner la cache','stash')],
 'La cache devient le dernier lieu habité du parcours. La suite appartient à l’arrivée du Sulaco.','Newt','Je suis là. Je suis encore là.')
]
chapters=[]
for ci,(title,char,start,phase,tasks,synopsis,speaker,line) in enumerate(chapter_rows):
    taskdata=[]
    for oi,(rid,id,label,kind) in enumerate(tasks):
        extra={}
        if id=='civilian': extra=dict(escortTo='stores',escortName='Colon du bloc C')
        if id=='luisa': extra=dict(escortTo='hangar',escortName='Luisa',grantFlag='scienceClearance')
        if id=='hidalgo':extra=dict(grantFlag='scienceClearance')
        obj(rid,id,label,kind,chapter=ci,description=line if oi==0 else 'Gardez la voie de retour ouverte.',**extra)
        taskdata.append(dict(id=id,room=rid,label=label))
    chapters.append(dict(id=f'rop-{ci+1:02}',index=ci,title=title,character=char,start=start,phase=phase,objectives=taskdata,
      synopsis=synopsis,dialogue=dict(speaker=speaker,text=line,origin='dialogue_original'),timeLabel=['Avant la crise','Premiers incidents','La colonie se ferme','La chute'][phase],
      provenance='condensation_originale_appuyee_sur_synopsis_publics',originalObjectives=True,fidelity='premise_and_selected_events_not_scene_by_scene'))
# Equipment pickups, caches and field archives, physically placed in side routes.
archive_rows=[
('pad','a01','Bordereau d’arrivée','La colonie n’est pas un théâtre d’opérations. Les bâtiments portent d’abord des noms de services et de familles.'),
('ops','a02','Grille de prospection','Des coordonnées redescendent de la Compagnie vers les services de prospection. Le dossier ne donne aucune raison rassurante à cet intérêt.'),
('briefing','a03','Ordre du jour','La garnison du roman appartient à cette reconstitution. Elle n’est pas remplacée par l’escouade du Sulaco.'),
('jorden','a04','Une table pour quatre','Les affaires de la famille restent où elles étaient. Le décor ne devient pas une caisse de ressources anonyme.'),
('recreation','a05','Les chemins de Tim','Les conduits relient des endroits réels. Une grille visible depuis une pièce rejoint le conduit situé de l’autre côté.'),
('med','a06','Priorité médicale','Observation, isolement, personnel restreint : les gestes ordinaires d’une infirmerie ne suffisent plus.'),
('isolation','a07','Le hublot','L’apparente immobilité du patient ne prouve rien sur l’organisme attaché à son visage.'),
('science','a08','Mainmise','Le laboratoire transforme une crise médicale en problème de conservation du spécimen.'),
('records','a09','Transmission conservée','Une copie peut témoigner de ce qui s’est passé. Elle ne peut pas faire revenir les disparus.'),
('garage','a10','Tracteur des prospecteurs','Un véhicule familial et professionnel, pas un APC militaire. Il reste un équipement de terrain.'),
('survey','a11','Un bureau transformé','Cartes, postes radio et outils ont été repoussés contre les accès. On reconnaît encore le travail qui se faisait ici.'),
('stores','a12','Refuge provisoire','Un refuge local ne signifie pas une évacuation de la planète. Dans ce dossier, ces deux états restent séparés.'),
('power','a13','Deux circuits','Le circuit normal et le secours alimentent des secteurs distincts. Les rétablir ne ressuscite pas les autres systèmes.'),
('pump','a14','Sous les logements','Les installations ont une continuité verticale : les habitations sont desservies par des galeries, pas posées sur le vide.'),
('processor6','a15','Intervention interrompue','L’incident industriel révèle les tensions de commandement avant que la menace soit comprise.'),
('derelict','a16','Une coque étrangère','La colonie humaine et l’épave n’obéissent pas au même langage architectural.'),
('hive','a17','Signaux immobiles','Les balises peuvent encore répondre quand leurs porteurs ne peuvent plus bouger.'),
('coolant','a18','Aucun trophée','Le but du passage est de comprendre puis de fuir. Rien ne permet de présenter la destruction de la reine comme une victoire de cette histoire.'),
('hangar','a19','Accès réservé','La navette scientifique n’est pas l’Onager d’un autre récit. Les deux voies ne sont pas fusionnées.'),
('shuttle','a20','Quatre sièges occupés','Brackett, Paris, Mori et Luisa quittent la colonie. Le départ ne résout pas le sort de Newt.'),
('refuge','a21','La petite cache','Un enfant peut disparaître dans un espace qu’un adulte ne peut pas emprunter. Aucun fusil n’est associé à ce point de vue.'),
('wash','a22','L’eau du lendemain','La survie se mesure maintenant en trajets très courts et en objets ordinaires.'),
('relay','a23','Ligne sans réponse','La panne est visible depuis l’intérieur : écrans éteints, relais muets et habitudes perdues.'),
('clinic_store','a24','Dernière réserve','Les soins sont limités. Le retour par une pièce déjà fouillée ne régénère pas son contenu.')]
archives=[]
for rid,id,title,text in archive_rows:
    r=by[rid];obj(rid,id,title,'archive',x=r['width']*.82,z=.7 if r['kind'] in ['side','vent'] else .43,description=text)
    archives.append(dict(id=id,title=title,text=text,room=rid,origin='texte_original_de_codex',sourceStatus='interpretation_de_game_design'))
for rid in ['briefing','med','stores','pump','processor6','garage','clinic_store','hangar']:
    obj(rid,'cache-'+rid,'Réserve de terrain','pickup',x=by[rid]['width']*.53,z=.7 if by[rid]['kind']=='side' else .86,description='Soins et dotation de terrain. Une seule collecte par parcours.')
characters={
'brackett':dict(name='Demian Brackett',role='Capitaine · garnison coloniale',height=76,weapon='M41A',clip=30,reserve=90,medkits=2,flares=3,color='#8c9875',child=False),
'paris':dict(name='Julisa Paris',role='Marine · garnison coloniale',height=73,weapon='M41A',clip=30,reserve=75,medkits=3,flares=3,color='#8c9f99',child=False),
'anne':dict(name='Anne Jorden',role='Prospectrice · Hadley’s Hope',height=71,weapon=None,clip=0,reserve=0,medkits=2,flares=4,color='#b39366',child=False),
'newt':dict(name='Rebecca « Newt » Jorden',role='Habitat · conduits',height=44,weapon=None,clip=0,reserve=0,medkits=0,flares=0,color='#b49a7b',child=True)}
# In-world prose is original. Provenance is kept in metadata and production documents, not disguised as a novel quotation.
field_notes={
'a01':"Bienvenue à Hadley’s Hope. Les nouveaux arrivants doivent se présenter au contrôle colonial avant l’attribution des logements. Ne laissez pas de bagages dans le sas : les équipes de nuit y font passer le matériel lourd.",
'a02':"Secteur de relevé ajouté à la tournée des Jorden. Coordonnées transmises par liaison Compagnie. Priorité haute. L’équipe de prospection demande une raison ; aucune précision reçue à ce jour.",
'a03':"Relève du poste central à six heures. Révision des joints du garage reportée. Les patrouilles devront signaler toute conduite qui siffle : le processeur six nous a déjà coûté assez de sommeil.",
'a04':"Anne — Il reste des provisions au réfectoire. Tim a encore déplacé ses affaires dans les conduits. J’ai remis la petite couverture sur le lit de Becky. On rentrera avant que le chauffage recommence à faire du bruit.",
'a05':"Après la grille qui vibre, tourner à gauche. Ne pas poser le pied sur la plaque claire. Elle résonne jusque dans le couloir. Tim dit qu’il connaît un chemin encore plus court.",
'a06':"Couloir médical dégagé en permanence. Un seul membre de la famille admis auprès des patients. Les demandes de transfert vers le laboratoire doivent être validées par le personnel soignant.",
'a07':"L’isolement reste fermé. La vitre ne doit pas être ouverte pour faciliter une observation. Toute intervention sur le patient nécessite deux personnes et un accès libre au sas.",
'a08':"L’échantillon doit demeurer sur place. Les résultats d’observation passent par le canal scientifique avant toute transmission extérieure. Les urgences médicales ne dispensent pas de renseigner la chaîne de possession.",
'a09':"Copie locale créée. Si la liaison est coupée, garder les bandes hors de la baie principale. La suppression d’un message ne doit pas supprimer la preuve qu’il a été reçu.",
'a10':"Le tracteur revient couvert d’une poussière que les filtres n’arrêtent pas correctement. Vérifier les joints avant toute autre sortie. Ne pas déposer les bottes de prospection dans les casiers propres.",
'a11':"Des familles attendent près des cartes. Elles veulent savoir quel bâtiment tient encore. Ne pas donner une destination tant qu’une patrouille n’a pas confirmé le passage.",
'a12':"Le fret peut attendre. Dégager deux allées jusqu’à la porte et réserver les couvertures aux enfants. Les caisses contre le mur ne seront ouvertes qu’en présence d’un responsable.",
'a13':"Les départs habitat et médical partagent encore un relais. En cas de surcharge, couper les appareils non essentiels avant de réarmer. Un deuxième claquement signifie qu’il faut laisser le coupe-circuit ouvert.",
'a14':"La vanne de retour résiste à froid. Ne pas la forcer tant que le manomètre indique une différence de pression. On a besoin d’eau, pas d’une galerie noyée.",
'a15':"Balisage incomplet sur la piste. Rester du même côté des piquets au retour. La tempête efface les traces de roues en quelques minutes.",
'a16':"Le métal n’a pas la couleur du métal. Les arches se poursuivent au-delà du faisceau et la radio ne tient plus. Balise posée près du seuil. Ne pas déplacer le tracteur sans prévenir.",
'a17':"Plusieurs balises répondent sous le processeur. Aucun déplacement depuis la dernière lecture. Garder une distance avec les parois et ne pas rompre le contact radio.",
'a18':"Repli par le refroidissement. Les lampes portatives indiquent la sortie, pas les embranchements. Si une lampe s’éteint, revenir vers la précédente plutôt que suivre un bruit.",
'a19':"Embarquement scientifique réservé. Réservoirs vérifiés. Le code d’accès ne doit pas être communiqué sur le réseau général. Un officier de service conteste la restriction ; demande en attente.",
'a20':"Brackett. Paris. Mori. Luisa. Quatre présences à bord. Le sas est fermé. La liste n’est pas celle que nous espérions remplir.",
'a21':"La couverture reste au fond. On peut voir le couloir sans coller les yeux à la grille. Quand les pas s’arrêtent, attendre encore. Toujours attendre encore.",
'a22':"L’eau coule moins fort à cet évier. Ne pas ouvrir le robinet entièrement. Une bouteille pleine tient dans le passage si on la pousse devant soi.",
'a23':"Relais alimenté, aucune réponse. Les contrôles locaux sont bons. Répéter l’appel à intervalle court et conserver chaque tentative dans la mémoire de secours.",
'a24':"Dernier relevé des réserves. Les trousses emportées ne seront pas remplacées avant réapprovisionnement. Signaler un tiroir vide au lieu de le refermer comme si de rien n’était."
}
for a in archives:
    a['text']=field_notes[a['id']]
    for r in rooms:
        for o in r['objects']:
            if o['id']==a['id']:o['description']=a['text']
sources=[
 dict(id='S1',title='Titan Books — Alien: River of Pain',url='https://titanbooks.com/6486-alien-river-of-pain-book-3/',type='editeur',use='Auteur, prémisse, colonie, famille Jorden, garnison, épave'),
 dict(id='S2',title='Audible France — ALIEN Audible Original',url='https://www.audible.fr/series/ALIEN-Audible-Original-Livres-Audio/B07MXJYR1P',type='editeur_audio',use='Titre français Le Fleuve des souffrances ; distinguer adaptation sonore et roman'),
 dict(id='S3',title='Christopher Golden — entretien AvPGalaxy',url='https://www.avpgalaxy.net/website/interviews/christopher-golden/',type='entretien_auteur',use='Intention de prélude à Aliens et liens avec les récits préexistants'),
 dict(id='S4',title='AvP Central — Demian Brackett',url='https://www.avpcentral.com/demian-brackett',type='source_secondaire',use='Brackett, Paris, Mori, Luisa ; issue distincte du sort de Newt, navette distincte de l’Onager ; à recouper sur le roman intégral'),
 dict(id='S5',title='AvP Central — Hadley’s Hope colonists',url='https://www.avpcentral.com/hadleys-hope-colonists',type='source_secondaire',use='Identification des personnages secondaires ; ne pas fusionner médecins et Draper de continuités différentes')]
manifest=dict(id='river-of-pain',version='0.1.0-candidate.1',title='ALIEN — Fleuve de la Douleur',subtitle='Hadley’s Hope · Les dernières lumières',sourceTitle='Alien: River of Pain',sourceAuthor='Christopher Golden',
 frenchAudioTitle='Alien — Le Fleuve des souffrances',year=2179,mode='MIRE',campaignId='v36_campaign_acheron_river_of_pain',pairId='pair_v36_campaign_acheron_river_of_pain',
 frontierCampaignId='frontier_v36_campaign_acheron_river_of_pain',frontierPolicy='preserved_unmodified',saveKey='atf.dlc.river-of-pain.v1.profile1',saveSchema=1,
 baseCommit='496996f5ea557d970ec625aa346876f3eaed1c5f',implementation='isolated_playable_runtime_with_host_launcher',
 limitations=['Architecture et dialogues originaux : pas de reconstruction 1:1 certifiée du roman.','Décors procéduraux et personnages articulés dessinés par code, pas les atlas finaux du jeu hôte.','Aucun roman intégral consulté ; détails secondaires appuyés sur synthèses signalées.','Lanceur additionnel : le runtime natif et les 440 campagnes du jeu hôte ne sont pas remplacés.','Pas de publication GitHub ou Vercel.'],
 counts=dict(chapters=len(chapters),rooms=len(rooms),links=len(edges),objectives=sum(len(c['objectives']) for c in chapters),archives=len(archives),props=sum(len(r['props']) for r in rooms),characters=len(characters)))
content=dict(manifest=manifest,rooms=rooms,chapters=chapters,characters=characters,archives=archives,sources=sources)
import runpy
content=runpy.run_path(str(R/'tools/enrich-content-v02.py'))['enrich'](content)
content=runpy.run_path(str(R/'tools/enrich-content-v03.py'))['enrich'](content)
content=runpy.run_path(str(R/'tools/enrich-content-v04.py'))['enrich'](content)
content=runpy.run_path(str(R/'tools/enrich-content-v05.py'))['enrich'](content)
content=runpy.run_path(str(R/'tools/enrich-content-v06.py'))['enrich'](content)
content=runpy.run_path(str(R/'tools/enrich-content-v07.py'))['enrich'](content)
content=runpy.run_path(str(R/'tools/enrich-content-v08.py'))['enrich'](content)
content=runpy.run_path(str(R/'tools/enrich-content-v09.py'))['enrich'](content)
(D/'data.js').write_text('/* Authored DLC content. See docs/SOURCES_ET_CONTINUITE.md for provenance. */\n(function(root){\nconst data = '+json.dumps(content,ensure_ascii=False,indent=2)+';\nif(typeof module!=="undefined" && module.exports)module.exports=data;\nroot.ROP_DATA=data;\n})(typeof globalThis!=="undefined"?globalThis:this);\n')
(R/'docs/CONTENT_MANIFEST.json').write_text(json.dumps(content,ensure_ascii=False,indent=2))
print(manifest['counts'])
