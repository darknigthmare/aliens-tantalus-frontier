"""Authored annexes, optional maintenance jobs and differentiated traversable footprints.
No new event here claims to be a scene from Christopher Golden's novel.
"""
from copy import deepcopy

def enrich(d):
    rooms=d['rooms']; by={r['id']:r for r in rooms}
    # id, label, profile, theme, building, level, circuit, width, map, descriptive landmark
    defs=[
      ('pantry','Office de la cuisine','canteen','mess','Habitat',0,'habitat',2100,[6,0], 'Passe-plats, chambre froide et escalier réservé au personnel'),
      ('biomed','Atelier biomédical','medical','med','Médical',0,'medical',2450,[0,0], 'Banc de réparation, berceaux de moniteurs et porte de la réserve'),
      ('aerial','Terrasse des antennes','exterior','pad','Administration',2,'research',2700,[0,-1], 'Mâts inclinés par le vent, boîtier de synchronisation et cage d’escalier'),
      ('workshop','Atelier de manutention','hangar','garage','Logistique',0,'industry',3000,[6,6], 'Chaîne de palan, établi moteur et galerie vers le processeur six'),
      ('drain','Dérivation des eaux grises','maintenance','pump','Maintenance',-2,'industry',2850,[4,7], 'Deux vannes de purge, cuves fermées et passerelle latérale sèche'),
      ('nest','Renfoncement des câbles','refuge','refuge','Ventilation',1,'habitat',1950,[6,2], 'Rubans colorés, couverture pliée et petite grille d’observation')]
    art={
      'pantry':['fridge','stove','sink','cupboard','ration','kitchen-hood','mug','wall-clock','hanging-coat','noticeboard'],
      'biomed':['gurney','monitor','oxygen','tool-board','glass-cabinet','medicine','medical-cross','privacy-screen','bed-lamp','sink'],
      'aerial':['radio-mast','radio-mast','antenna','cable-spool','floodlight','barrier','radio','warning-board','cable-tray','beacon'],
      'workshop':['chain-hoist','tractor','wheel','tool-board','pump-motor','hand-truck','cable-spool','fuel','gantry','fire-cabinet'],
      'drain':['tank','pipe','gauge','hose-reel','pump-motor','pipe-elbow','valve','fire-cabinet','warning-board','floodlight'],
      'nest':['drawing','blanket','toy','trace-mark','duct-junction','bolt-panel','mug','vent-cover','photo','cable']}
    # Scene grouping is authored by function: work bay, supplies, exit. Not an evenly spaced prop strip.
    scenes={
      'pantry':[(1320,.27,'Chambre froide derrière la table'),(850,.27,'Cuisson sous la hotte'),(540,.27,'Point de lavage près de l’entrée'),(1500,.27,'Réserve sèche contre la paroi'),(1470,.29,'Caisses de provisions près de la réserve'),(850,.27,'Hotte alignée sur le poste de cuisson'),(950,.27,'Tasse au poste de pause'),(380,.27,'Horloge au point de prise de service'),(1790,.27,'Manteau près de la sortie du personnel'),(460,.27,'Consignes près de la poignée absente')],
      'biomed':[(540,.27,'Baie de réparation du brancard'),(655,.27,'Moniteur associé à la baie'),(465,.27,'Bouteille à côté du brancard'),(1240,.27,'Outils fixés au-dessus de l’établi'),(1570,.27,'Armoire de composants près du plan de travail'),(1520,.29,'Trousse rangée au pied du poste'),(970,.27,'Signalétique de la travée médicale'),(815,.27,'Écran de séparation de la baie'),(615,.27,'Lampe au poste du brancard'),(2090,.27,'Lavage avant retour en réserve')],
      'aerial':[(460,.27,'Premier mât fixé au parapet'),(1810,.27,'Mât principal voisin du boîtier'),(2250,.27,'Antenne secondaire près du palier'),(1710,.29,'Réserve de câble sous le mât principal'),(1150,.27,'Éclairage de la zone de passage'),(1450,.26,'Garde-corps arrière de la terrasse'),(1970,.27,'Poste de service au pied du mât'),(1400,.27,'Avertissement au changement de travée'),(2070,.27,'Chemin de câble vers le boîtier'),(2440,.27,'Balise fixée au palier de sortie')],
      'workshop':[(2140,.27,'Palan suspendu dans son portique'),(610,.27,'Véhicule immobilisé dans la baie d’entrée'),(765,.29,'Train de roue voisin du véhicule'),(1650,.27,'Panneau d’outils au poste moteur'),(1570,.27,'Moteur au poste de réparation'),(1320,.27,'Diable dans le rangement latéral'),(1860,.29,'Touret à côté du poste de maintenance'),(820,.27,'Réserve fermée à côté du véhicule'),(2140,.27,'Portique portant le palan'),(2660,.27,'Incendie à proximité de la galerie de sortie')],
      'drain':[(490,.27,'Cuve fermée côté entrée'),(550,.27,'Conduite raccordée à la cuve'),(690,.27,'Manomètre du premier circuit'),(1100,.27,'Flexible au poste de maintenance'),(1390,.27,'Groupe moteur du retour'),(1500,.27,'Coude au départ du moteur'),(1770,.27,'Volant de la dérivation'),(2450,.27,'Poste incendie près de l’échelle'),(2110,.27,'Consigne avant le retour'),(2570,.27,'Éclairage de la zone de sortie')],
      'nest':[(380,.7,'Dessin servant de repère près de l’entrée'),(560,.7,'Couverture dans le renfoncement sec'),(600,.7,'Jouet laissé près de la couverture'),(970,.7,'Trace au premier coude du conduit'),(870,.7,'Jonction fixée sur la paroi'),(1190,.7,'Plaque vissée du coffrage'),(650,.7,'Tasse au petit bivouac'),(1570,.7,'Grille alignée sur le passage de l’ombre'),(720,.7,'Photo gardée à côté du bivouac'),(1760,.7,'Câble guidant le retour vers la cache')]
    }
    for rid,name,profile,theme,bld,fl,circ,w,mp,lm in defs:
        single=rid=='nest';template=deepcopy(by['refuge' if single else 'med'])
        template.update(id=rid,name=name,building=bld,floor=fl,kind='vent' if single else 'exterior' if rid=='aerial' else 'depth',width=w,map=mp,theme=theme,landmark=lm,
            minZ=.7 if single else .25,maxZ=.7 if single else .9,dimensionsM=[round(w/42,1),1.2 if single else 9,2.2 if single else 3.4],portals=[],cover=[],objects=[],props=[],spawns=[],phaseDressing=[],annex=True)
        template['architecture'].update(style=profile,circuit=circ,variant=rid+'-service-loop',wallModules=max(3,round(w/380)),ceilingRatio=.22 if single else .10 if rid=='workshop' else .16)
        for n,kind in enumerate(art[rid]):
            px,pz,purpose=scenes[rid][n]
            template['props'].append(dict(id=f'{rid}-set-{n}',kind=kind,x=px,z=pz,layer='FIXTURES',collidable=False,mount='wall' if kind in ['photo','medical-cross','warning-board','tool-board','cable-tray','noticeboard','wall-clock'] else 'floor',purpose=purpose))
        template['phaseDressing']=[dict(id=rid+'-phase-paper',kind='paper-trail',x=w*.6,z=.77,fromPhase=2),dict(id=rid+'-phase-light',kind='broken-light',x=w*.4,z=.4,fromPhase=3)] if not single else []
        rooms.append(template);by[rid]=template
    # Safe, existing-room sockets. They deliberately avoid existing tasks and gateway arrival envelopes.
    connections=[('mess','pantry',1850,.28,'porte',False,None),('hab','pantry',1720,.7,'escalier',False,'pantry'),
      ('med','biomed',2000,.28,'porte',False,None),('clinic_store','biomed',1160,.7,'porte',False,'biomed'),
      ('relay','aerial',480,.7,'escalier',False,None),('ops','aerial',1320,.28,'escalier',False,'aerial'),
      ('garage','workshop',2580,.28,'porte',False,None),('processor6','workshop',1870,.28,'coursive',False,'workshop'),
      ('pump','drain',1200,.28,'échelle',False,None),('coolant','drain',1500,.28,'échelle',False,'drain'),
      ('vent_med','nest',1070,.7,'conduit',True,None),('refuge','nest',1180,.7,'conduit',True,'nest')]
    for i,(a,b,x,z,kind,child,gate) in enumerate(connections):
        flag='service-'+gate if gate else None
        for src,dest,xx,zz in [(a,b,x,z),(b,a,170 if i%2==0 else by[b]['width']-170,.7 if child else .81)]:
            by[src]['portals'].append(dict(id=src+'>'+dest,to=dest,x=xx,z=zz,kind=kind,childOnly=child,requires=flag,
              shortcut=gate,lockReason='Déverrouillage à effectuer dans '+by[b]['name'] if gate else None))
    # Individual obstacle footprints, not two clones at fixed proportional coordinates.
    layouts={
      'concourse':[(1030,.47,190,.12,'bench'),(1810,.53,220,.14,'vending'),(2500,.44,150,.10,'bench')],
      'ops':[(960,.49,210,.16,'console'),(1660,.55,170,.14,'console')],
      'jorden':[(760,.46,205,.14,'table'),(1190,.53,130,.16,'cupboard')],
      'mess':[(910,.48,185,.13,'table'),(1580,.49,250,.14,'table'),(2060,.53,130,.10,'table')],
      'recreation':[(810,.48,125,.17,'arcade'),(1430,.51,240,.12,'bench')],
      'med':[(1050,.48,210,.14,'bed'),(1830,.51,165,.16,'cart'),(1630,.865,140,.04,'cart')],
      'science':[(840,.51,210,.15,'lab-bench'),(1570,.45,175,.12,'specimen')],
      'garage':[(1230,.47,230,.17,'tools'),(2070,.52,240,.13,'wheel'),(2850,.48,120,.12,'crate')],
      'stores':[(1160,.48,280,.14,'pallet'),(2110,.52,180,.13,'crate'),(2430,.86,120,.04,'pallet')],
      'power':[(1000,.45,240,.16,'transformer'),(1680,.51,210,.13,'coil')],
      'pump':[(920,.48,210,.17,'tank'),(1620,.52,175,.14,'pump-motor')],
      'processor6':[(1090,.47,260,.16,'turbine'),(2080,.49,210,.14,'pipe')],
      'hangar':[(1270,.46,245,.16,'fuel'),(2130,.54,260,.14,'pallet')],
      'pantry':[(730,.44,220,.13,'table'),(1220,.53,160,.16,'fridge')],
      'biomed':[(720,.46,205,.13,'bed'),(1450,.50,190,.14,'lab-bench'),(1830,.41,135,.10,'cart')],
      'aerial':[(830,.47,240,.16,'crate'),(1670,.52,180,.13,'fuel')],
      'workshop':[(890,.45,290,.17,'wheel'),(1800,.5,210,.14,'tools'),(2370,.52,150,.12,'crate')],
      'drain':[(820,.46,280,.16,'tank'),(1620,.5,240,.13,'pump-motor'),(2180,.44,190,.10,'tank')]
    }
    for rid,rows in layouts.items():
        r=by[rid];r['props']=[p for p in r['props'] if not p.get('collidable')]
        r['cover']=[dict(id=f'{rid}-cover{i+1}',x=x,z=z,w=w,d=dp,prop=k) for i,(x,z,w,dp,k) in enumerate(rows)]
        for c in r['cover']:r['props'].append(dict(id=c['id'],kind=c['prop'],x=c['x'],z=c['z'],layer='ACTORS',collidable=True,footprint=dict(w=c['w'],d=c['d']),purpose='Emprise physique visible, contournable par le fond ou l’avant.'))
        r['layoutProfile']='authored-'+rid
    # For unchanged rooms, footprints are also made explicit in the renderer.
    for r in rooms:
        for c in r['cover']:
            p=next(p for p in r['props'] if p['id']==c['id']);p['footprint']=dict(w=c['w'],d=c['d'])
        r.setdefault('layoutProfile','inherited-'+r['id'])
    # Three steps, always a physical interaction, never a countdown completing off-screen.
    rows=[
      ('pantry','La porte du personnel','mess',390,.28,'Récupérer la poignée de rechange','Poignée de service',
       'Le passage du personnel a perdu sa poignée. Une pièce de rechange attend près de la cuisine.',
       'Ajuster la poignée et libérer l’escalier','Accès direct vers la coursive résidentielle','medkit',False,
       'Relève de cuisine','Les repas du matin restent sur le tableau, même quand le réfectoire se vide. Le personnel a laissé une poignée de rechange côté cuisine pour ne plus emprunter les couloirs publics.'),
      ('biomed','L’atelier de garde','clinic_store',720,.7,'Prendre le contacteur de réserve','Contacteur biomédical',
       'Le verrou de la porte de réserve ne répond plus. Le contacteur se trouve dans le tiroir de maintenance médicale.',
       'Remplacer le contacteur et libérer la réserve','Boucle directe vers la réserve médicale','medkit',False,
       'Pièces de rechange','Un moniteur en panne ne doit pas condamner tout un lit. Les composants compatibles sont stockés dans la réserve, à portée de l’équipe de garde.'),
      ('aerial','Une fréquence dans le vent','records',1050,.7,'Retrouver le coupleur de transmission','Coupleur radio',
       'La liaison interne de la terrasse est débranchée. Un coupleur compatible a été rangé avec les bandes du relais.',
       'Raccorder la liaison et libérer le palier','Retour vers le contrôle colonial','battery',False,
       'Ligne intérieure','L’émetteur rétabli ne porte pas au-delà de la colonie. Il ne promet ni secours ni évacuation : il remet seulement les deux cages d’escalier en communication.'),
      ('workshop','Le palan immobilisé','garage',450,.28,'Décrocher la chaîne d’entraînement','Chaîne de palan',
       'Le rideau de service bloque la galerie. Une chaîne de rechange est suspendue dans le garage des prospecteurs.',
       'Remonter la chaîne et lever le rideau','Galerie couverte vers le processeur six','flare',False,
       'Ne pas laisser sous charge','Quand le moteur de levage s’arrête, soulager le contrepoids avant toute intervention. Le passage de service reste un chemin de maintenance, pas une voie pour le tracteur.'),
      ('drain','Le retour des eaux','power',1950,.28,'Récupérer la clé du collecteur','Clé de collecteur',
       'La grille de la dérivation est verrouillée. La clé du collecteur a été déposée au tableau électrique.',
       'Ouvrir le retour et libérer la grille','Échelle vers la galerie du refroidissement','battery',False,
       'La conduite qui revient','Deux repères jaunes identifient le retour vers les cuves fermées. Cette dérivation permet d’éviter les soubassements. Ne jamais ouvrir un réservoir à l’air libre.'),
      ('nest','Le fil qui revient','vent_hab',1670,.7,'Retrouver le ruban de Tim','Ruban de repérage',
       'Un fil usé rejoint la petite grille. Un ruban neuf permettrait de la tirer sans se coincer les doigts.',
       'Nouer le ruban et soulever la petite grille','Passage direct vers la cache des conduits','food',True,
       'Le ruban noué','Un nœud au ras du sol, puis deux au prochain embranchement. On peut retrouver le passage avec les doigts quand la lumière s’éteint. Personne n’a écrit de nom sur le ruban.')]
    jobs=[]
    for idx,(rid,title,supplyRoom,sx,sz,supplyLabel,item,hint,releaseLabel,rewardLabel,reward,child,atitle,text) in enumerate(rows):
        r=by[rid];z=.7 if child else .81;aid='a'+str(25+idx)
        steps=[dict(room=rid,id='job-'+rid+'-inspect',label='Examiner · '+title,x=470,z=z,description=hint,duration=.6),
               dict(room=supplyRoom,id='job-'+rid+'-part',label=supplyLabel,x=sx,z=sz,description='Emporter '+item.lower()+'.',duration=.9),
               dict(room=rid,id='job-'+rid+'-release',label=releaseLabel,x=r['width']-470,z=z,description=rewardLabel,duration=2.0)]
        jobs.append(dict(id=rid,title=title,childOnly=child,adultOnly=not child,room=rid,item=item,steps=steps,flag='service-'+rid,reward=reward,rewardLabel=rewardLabel,archive=aid))
        for i,step in enumerate(steps):by[step['room']]['objects'].append({**step,'kind':'side-task','job':rid,'step':i,'hardware':'tools' if i==1 else 'grille' if child else 'panel'})
        r['objects'].append(dict(id='hide-'+rid,label='Se glisser dans le renfoncement' if child else 'Se cacher dans le casier de service',kind='hide',x=r['width']*.58,z=z))
        d['archives'].append(dict(id=aid,title=atitle,room=rid,text=text,source='Original — annexe de jeu, pas un extrait du roman',optionalJob=rid))
        # Distinct one-shot reading of space; mechanical and human remnants, no copied scene.
        r['annexNote']=dict(promise=rewardLabel,teaching=hint,returnReason='Le déverrouillage est conservé entre les chapitres, pour les personnages compatibles.',canon='Architecture et tâche originales pour le jeu.')
    d['jobs']=jobs
    d['encounters']=[
      dict(id='workshop-hatch',room='workshop',minPhase=2,triggerX=1400,spawnX=2800,spawnZ=.7,kind='adult',warning=3.2,label='La trappe du fond se déforme. Écartez-vous de l’axe.',type='intrusion'),
      dict(id='biomed-cabinet',room='biomed',minPhase=2,triggerX=1080,spawnX=2250,spawnZ=.7,kind='facehugger',warning=3.0,label='Un bruit sec derrière la cloison de l’atelier.',type='intrusion'),
      dict(id='drain-return',room='drain',minPhase=2,triggerX=1230,spawnX=2660,spawnZ=.7,kind='adult',warning=3.5,label='Quelque chose heurte la grille au bout de la passerelle.',type='intrusion'),
      dict(id='nest-shadow',room='nest',minPhase=1,triggerX=1030,spawnX=1570,spawnZ=.7,warning=4,label='Une ombre passe derrière la grille. Elle ne peut pas entrer ici.',type='shadow'),
      dict(id='aerial-wind',room='aerial',minPhase=0,triggerX=1150,spawnX=2150,spawnZ=.7,warning=4.2,label='Le mât grince. La passerelle tient, mais le vent couvre les pas.',type='sound'),
      dict(id='pantry-tap',room='pantry',minPhase=1,triggerX=1030,spawnX=1720,spawnZ=.7,warning=3.5,label='Dans la cuisine vide, la vaisselle vibre au rythme de la ventilation.',type='sound')]
    d['manifest'].update(version='0.3.0-candidate.1',subtitle='Hadley’s Hope · Les chemins de traverse')
    d['manifest']['counts'].update(rooms=len(rooms),links=sum(len(r['portals']) for r in rooms)//2,archives=len(d['archives']),props=sum(len(r['props']) for r in rooms),hideouts=sum(sum(o['kind']=='hide' for o in r['objects']) for r in rooms),phaseDetails=sum(len(r['phaseDressing']) for r in rooms),annexes=len(defs),optionalJobs=len(jobs),optionalSteps=sum(len(j['steps']) for j in jobs),permanentShortcuts=6,authoredEncounters=len(d['encounters']),authoredFootprintRooms=len(layouts),physicalCovers=sum(len(r['cover']) for r in rooms))
    return d
