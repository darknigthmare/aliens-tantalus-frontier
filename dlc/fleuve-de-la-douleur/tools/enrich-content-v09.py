"""v0.9: architecture, primary-source coverage and optional equipment.
Coordinates and balancing are authored, never sold as measurements from the novel.
"""
from copy import deepcopy
def enrich(d):
    m=d['manifest'];m['version']='0.9.0-candidate.1';m['subtitle']='Hadley’s Hope · Les lieux ont une mémoire'
    rooms={r['id']:r for r in d['rooms']}
    new_specs=[
      ('greenhouse','Serre vitrée','recreation','depth',2750,[6,1],0,'Habitat','greenhouse','Dôme vitré hémisphérique : présence attestée, culture et plan interprétés'),
      ('armory','Armurerie de la garnison','briefing','depth',2200,[3,0],1,'Administration','armory','Râteliers identifiés et dépôt séparé du poste de commandement'),
      ('derelict_gallery','Galerie biomécanique','derelict','derelict',2400,[8,4],0,'Épave','derelict','Coque nervurée ; le passage continue au-delà du seuil'),
      ('pilot_chamber','Chambre du pilote','derelict','derelict',3000,[9,4],0,'Épave','derelict','Siège fossile central, sans déplacement du pilote vers la colonie'),
      ('egg_vault','Cale aux œufs','derelict','derelict',2850,[9,5],-1,'Épave','derelict','Nappe de brume et ovoides sous la coque ; parcours d’observation original')
    ]
    for id,name,template,kind,width,xy,floor,building,theme,landmark in new_specs:
        r=deepcopy(rooms[template])
        r.update(id=id,name=name,kind=kind,width=width,map=xy,floor=floor,building=building,theme=theme,landmark=landmark,
          minZ=.25,maxZ=.9,dimensionsM=[round(width/42,1),9,5.5],portals=[],props=[],objects=[],cover=[],spawns=[],phaseDressing=[],layoutProfile='authored-v09')
        r['architecture'].update(style='garrison' if id=='armory' else 'derelict',variant='racks' if id=='armory' else 'organic_vault',circuit='habitat' if id=='armory' else 'perimeter',safeFloor=[.25,.9])
        r.pop('annex',None)
        d['rooms'].append(r);rooms[id]=r
    def link(a,b,xa,xb,za=.28,zb=.28,kind='porte'):
        for left,right,x,z in [(a,b,xa,za),(b,a,xb,zb)]:
            rooms[left]['portals'].append(dict(id=left+'>'+right,to=right,x=x,z=z,kind=kind,childOnly=False,requires=None))
    link('briefing','armory',1230,170,.7,.69)
    link('armory','ops',2030,1770,.69,.28)
    link('derelict','derelict_gallery',2330,170,.69,.69,'brèche')
    link('derelict_gallery','pilot_chamber',2230,170,.69,.69,'brèche')
    link('pilot_chamber','egg_vault',2830,170,.69,.69,'corde')
    link('recreation','greenhouse',1590,170,.81,.69,'coursive')
    link('greenhouse','wash',2580,1030,.69,.81,'coursive')
    rooms['greenhouse']['architecture'].update(style='greenhouse',variant='glass_dome',circuit='habitat')
    def prop(rid,kind,x,z=.22,**kw):
        r=rooms[rid];p=dict(id=rid+'-v09-'+str(len(r['props'])),kind=kind,x=x,z=z,layer='ACTORS' if z>.25 else 'FIXTURES',collidable=False,purpose='Implantation de jeu documentée',**kw);r['props'].append(p);return p
    for x,z in [(650,.40),(1300,.40),(1950,.40),(1260,.58)]:
        p=prop('greenhouse','planter',x,z);p.update(collidable=True,footprint=dict(w=250,d=.11))
        rooms['greenhouse']['cover'].append(dict(id=p['id'],x=x,z=z,w=250,d=.11,prop='planter'))
    for x in [460,900,1650,2180]:prop('greenhouse','planter',x,.19)
    rooms['greenhouse']['objects'].append(dict(id='greenhouse-inspection',kind='inspection',x=2240,z=.81,
      label='Observer la serre',description='La serre hémisphérique est attestée dans l’extrait de River of Pain. Les rangées, cultures et connexions sont une interprétation jouable, pas un relevé du roman.'))
    for x in [390,730,1100,1430,1800]:
        prop('armory','weapon-rack',x) if x!=1100 else None;prop('armory','case',x+28,.41)
    for rid in ['derelict_gallery','pilot_chamber','egg_vault']:
        r=rooms[rid]
        for x in range(380,r['width']-190,310):prop(rid,'rib',x)
        for x in [r['width']*.32,r['width']*.64]:
            p=prop(rid,'rock' if rid=='egg_vault' else 'rib',x,.54)
            p.update(collidable=True,footprint=dict(w=145,d=.11))
            r['cover'].append(dict(id=p['id'],x=x,z=.54,w=145,d=.11,prop=p['kind']))
        # Keep the new deep exploration quiet: no fabricated infections or queen event.
    p=prop('pilot_chamber','pilot-seat',1470,.34);p.update(collidable=True,footprint=dict(w=280,d=.17))
    rooms['pilot_chamber']['cover'].append(dict(id=p['id'],x=p['x'],z=p['z'],w=280,d=.17,prop='pilot-seat'))
    p=prop('egg_vault','egg-bed',1400,.33);p.update(collidable=True,footprint=dict(w=2060,d=.14))
    rooms['egg_vault']['cover'].append(dict(id=p['id'],x=1400,z=.33,w=2060,d=.14,prop='egg-bed'))
    for x in [510,735,1010,1260,1510,1770,2040,2260]:
        prop('egg_vault','sealed-egg',x,.30 if x%2 else .36)
    # A fossil pilot/eggs are not repeated at the *entrance*. Their place is now explicit.
    for p in rooms['derelict']['props']:
        if p['kind'] in ('egg','fossil'):p['kind']='rib';p['purpose']='Seuil : pas de pilote fossile ni d’œuf déplacé hors de sa salle'
    prop('med','natal-unit',2220,.32)
    prop('med','white-monitor',2070,.30)
    rooms['med']['objects'].append(dict(id='medical-unit-v09',kind='inspection',x=2280,z=.32,label='Examiner l’unité médicale',description='L’unité obstétricale est attestée par un extrait du roman. Son implantation ici et son état en 2179 sont interprétés ; ce poste est observable, pas une simulation de chirurgie.'))
    rooms['armory']['objects'].append(dict(id='armory-rack-v09',kind='armory',x=1080,z=.28,label='Consulter le râtelier',description='Dotation facultative de jeu. La présence de ces modèles dans Aliens ne prouve pas leur attribution exacte dans River of Pain.'))
    entries=[
      ('a31','Râtelier sous scellés','armory',580,'Les compartiments sont séparés. Inscrire le prélèvement avant de partir ; le râtelier ne sera pas réapprovisionné au prochain passage.'),
      ('a32','La courbe intérieure','derelict_gallery',1110,'Les nervures se rejoignent au-dessus de la marche. Le retour est au même seuil ; ne pas confondre un renfoncement dans la coque et un chemin.'),
      ('a33','Le poste immobile','pilot_chamber',1980,'Le relief central n’est pas une console coloniale. Observer depuis la bande dégagée ; ne rien arracher au siège.'),
      ('a34','Sous la chambre','egg_vault',2380,'La corde de reconstitution rejoint le palier supérieur. La brume cache le fond ; les ovoides de cette scène ne sont pas des objets à récolter.')
    ]
    for id,title,rid,x,text in entries:
        a=dict(id=id,title=title,room=rid,text=text,origin='texte_original_de_codex',sourceStatus='interpretation_de_game_design')
        d['archives'].append(a);rooms[rid]['objects'].append(dict(id=id,label=('Consigner : '+title) if rid!='armory' else title,kind='archive',x=x,z=.82,description=text))
    # Model the architectural support of every endpoint; route markers aren't doors.
    counters={}
    for r in d['rooms']:
        for p in r['portals']:
            dest=rooms[p['to']];k=p['kind'];side=p['x']<=230 or p['x']>=r['width']-230
            if k in ('piste','passerelle','coursive'):
                typ='track' if k=='piste' else 'gangway' if k=='passerelle' else 'corridor'
            elif k=='brèche':typ='organic'
            elif p['childOnly']:typ='duct'
            elif k=='escalier':typ='stairs'
            elif k=='échelle':typ='ladder'
            elif k=='corde':typ='rope'
            elif k=='monte-charge':typ='lift'
            else:typ='airlock' if k=='sas' else 'door'
            mount='terrain' if typ=='track' else 'organic-shell' if typ in ('organic','rope') else 'side-bulkhead' if side else 'rear-bay'
            # A central portal is an inset rear-wall bay, never a freestanding frame.
            p['architecture']=dict(type=typ,mount=mount,support='terrain' if typ=='track' else 'attached_structure',
              apertureWidth=66 if p['childOnly'] else 112,approachX=p['x'],approachZ=p['z'],
              originFloor=r['floor'],destinationFloor=dest['floor'],localRiseM=1.2 if typ=='ladder' and r['floor']==dest['floor'] else 0,
              source='authored_layout',reciprocal=p['to']+'>'+r['id'])
            counters[typ]=counters.get(typ,0)+1
        r['fidelity']={'plan':'original_non_mesure','presence':'functional_reconstruction','sourceIds':[]}
    # Profiles are separate even when their exact physiognomy is not documented.
    d['appearances']={
      'brackett':dict(name='Demian Brackett',height=87,build=1.10,skin='#c7a489',hair='#554737',hairstyle='short',wardrobe='marine',color='#7e8969',pants='#5a6251',identity='roman',visualStatus='interprétation ; visage non décrit par les sources consultées'),
      'paris':dict(name='Julisa Paris',height=82,build=.91,skin='#ac8468',hair='#302924',hairstyle='tied',wardrobe='marine',color='#83927b',pants='#515c52',identity='roman',visualStatus='interprétation ; aucune ressemblance avec une comédienne audio revendiquée'),
      'anne':dict(name='Anne Jorden',height=79,build=1.0,skin='#c6a687',hair='#6d503b',hairstyle='curls',wardrobe='workwear',color='#978366',pants='#555c54',identity='roman',visualStatus='cheveux bouclés attestés ; teinte et tenue interprétées',source='R1'),
      'newt':dict(name='Rebecca « Newt » Jorden',height=51,build=.78,skin='#cfb093',hair='#b3a076',hairstyle='long',wardrobe='overalls',color='#a79b80',pants='#4b6171',identity='roman',visualStatus='silhouette inspirée du film/licence ; pas de casque de Hicks dans cette époque',source='R3'),
      'russ':dict(name='Russ Jorden',height=86,build=1.08,skin='#bf9b80',hair='#66513a',hairstyle='scruffy',wardrobe='workwear',color='#857b62',pants='#515b55',identity='roman',visualStatus='apparence fatiguée attestée ; détails du visage interprétés',source='R1'),
      'komiskey':dict(name='Dr Theodora Komiskey',height=71,build=1.42,skin='#c9aa91',hair='#694c36',hairstyle='curls',eyes='#76a2bc',wardrobe='medical',color='#c1c8bc',pants='#717e79',identity='roman',visualStatus='silhouette petite et trapue, boucles brunes et yeux bleus attestés ; blouse interprétée',source='R1'),
      'luisa':dict(name='Luisa',height=53,build=.78,skin='#c3a282',hair='#574133',hairstyle='tied',wardrobe='child-jacket',color='#aa7870',pants='#5a625e',identity='roman',visualStatus='enfant distincte de Newt ; apparence provisoire non attestée'),
      'civilian':dict(name='Colon du bloc C',height=80,build=1,skin='#b49376',hair='#635951',hairstyle='short',wardrobe='workwear',color='#869296',pants='#555f60',identity='original',visualStatus='personnage de gameplay'),
      'mori':dict(name='Dr Mori',height=81,build=.90,skin='#bb9d82',hair='#3b3330',hairstyle='short',wardrobe='medical',color='#c1c8bd',pants='#65736f',identity='roman',visualStatus='silhouette provisoire, visage non authentifié')
    }
    for id,profile in d['appearances'].items():profile['id']=id
    actors={'welcome':'paris','family':'russ','stretcher':'komiskey','civilian':'civilian','newt_escape':'newt','luisa':'luisa','boarding':'mori'}
    for r in d['rooms']:
        for o in r['objects']:
            if o['id'] in actors:o['actorId']=actors[o['id']]
            if o['id']=='hidalgo':
                o['kind']='terminal';o['representation']='radio';o['actorId']=None
                o['description']='Transmission radio de Brackett : un poste, pas un corps de Brackett placé dans le laboratoire.'
    # These two resident places are deliberately named in the source (nonmoving observations).
    prop('med','named-doctor',1810,.38)
    d['armory']={'revision':9,'rack':{'id':'armory-rack-v09','room':'armory','x':1080,'z':.28},
      'weapons':[{'id':'pulse','name':'M41A · fusil à impulsion','status':'jouable','evidence':'référence visuelle du film ; chargeur de 30 = équilibre de jeu'},
       {'id':'flame','name':'M240 · lance-flammes','status':'jouable_facultatif','evidence':'accessoire du film attesté R4 ; attribution dans ce roman à confirmer'},
       {'id':'grenade','name':'Lance-grenades sous canon','status':'jouable_facultatif','evidence':'complément du M41A ; règles et réserve originales'}],
      'rules':{'fuel':60,'grenades':3,'issueDuration':2,'flameRange':350,'flameDamage':11,'flameInterval':.16,'grenadeRange':560,'grenadeRadius':135,'grenadeDamage':95}}
    d['sources'] += [
      {'id':'R1','title':'Titan Books / Daily Dead — extrait autorisé, chapitres Rebecca et Arrivals','url':'https://dailydead.com/read-exclusive-excerpt-alien-river-pain/','type':'texte_primaire_extrait_autorise','use':'Anne, Komiskey, matériel médical ; secteurs hors-colonie identifiés, pas roman intégral.'},
      {'id':'R2','title':'Christopher Golden — entretien auteur, 30 octobre 2014','url':'https://www.avpgalaxy.net/website/interviews/christopher-golden/','type':'entretien_primaire','use':'Intérieur de l’épave, groupes du récit ; pas de plan coté.'},
      {'id':'R3','title':'NECA — Rescuing Newt, figurines sous licence','url':'https://necaonline.com/2016/08/aliens-30th-anniversary-rescuing-newt-deluxe-action-figure-2-pack/','type':'reference_visuelle_sous_licence','use':'Silhouette filmique de Newt ; objets de scènes ultérieures exclus.'},
      {'id':'R4','title':'Propstore — accessoire M240 employé dans Aliens','url':'https://propstore.com/product/aliens-1986/19-ellen-ripleys-sigourney-weaver-practical-special-effects-m240-flamethrower/','type':'accessoire_de_production','use':'Silhouette et nom M240 ; pas une preuve de dotation de Hadley’s Hope dans le roman.'}
    ]

    supported_people=[
      ('tim','Tim Jorden','jorden',1250,.80,61,.85,'#6b805f','#62513b','short','child-jacket','Je connais les grilles près de chez nous. Je ne passe pas là où la tôle a été ressoudée.','Enfant de la famille Jorden, attesté ; tenue et visage interprétés.'),
      ('simpson','Al Simpson','ops',1040,.80,84,1.16,'#aaa18c','#706554','short','workwear','Les arrivants passent au contrôle. Le tableau ne remplace pas une présence : prévenez le poste avant de sortir.','Administrateur attesté ; dialogue, tenue et poste local interprétés.'),
      ('hansard','Greg Hansard','power',2060,.80,86,1.05,'#8b9278','#5d5042','short','workwear','Un circuit réarmé n’est pas une installation réparée. Gardez une voie sèche jusqu’au répartiteur.','Ingénieur en chef attesté ; dialogue, tenue et poste local interprétés.'),
      ('joel','Joel','med',1590,.80,86,.82,'#b8c5ba','#3e342d','short','medical','Laissez les portes du service dégagées. Une civière doit pouvoir passer sans contourner vos sacs.','Infirmier mince attesté ; visage, tenue et état en 2179 interprétés.'),
      ('bronagh','Bronagh Flaherty','mess',1670,.80,79,1.10,'#b6a386','#6a5342','tied','workwear','Les portions froides sont pour le prochain quart. Refermez les réserves et signalez ce qui manque.','Cuisinière attestée ; visage, tenue et état en 2179 interprétés.')
    ]
    d['canonicalContacts']=[]
    for id,name,rid,x,z,h,b,col,hair,style,wardrobe,text,note in supported_people:
        d['appearances'][id]=dict(id=id,name=name,height=h,build=b,skin='#be9f85',hair=hair,hairstyle=style,wardrobe=wardrobe,
            color=col,pants='#58665e',identity='roman',visualStatus=note,source='R1')
        contact=dict(id='contact-'+id,kind='lore-contact',actorId=id,room=rid,x=x,z=z,phaseMax=1,label='Parler à '+name,description=text,
            note=note+' Référence : extrait de 2173 ; cette mise en scène en 2179 reste originale.')
        rooms[rid]['objects'].append(contact);d['canonicalContacts'].append(contact)
    # A visible prop must not obscure a portal's aperture. Relocate only loose decoration;
    # never modify a collision footprint or a task to hide an architectural error.
    clear=[]
    for r in d['rooms']:
        portals=[p for p in r['portals'] if p['architecture']['type'] not in ('track','organic')]
        for p in r['props']:
            if p.get('collidable') or p['kind']=='named-doctor':continue
            def hits(x):
                return any(abs(x-q['x'])<135 and abs(p['z']-q['z'])<.19 for q in portals)
            if not hits(p['x']):continue
            old=p['x']
            for shift in [180,-180,300,-300,450,-450,620,-620]:
                nx=old+shift
                if 250<nx<r['width']-250 and not hits(nx):
                    p['x']=nx;p['purpose']='Dégagement visuel du seuil ; décoration déplacée, collision inchangée'
                    clear.append(dict(room=r['id'],id=p['id'],fromX=old,toX=nx));break
    d['portalClearanceCorrections']=clear

    cov=[]
    def entry(cat,id,title,status,note,sources=()):
        cov.append(dict(category=cat,id=id,title=title,status=status,note=note,sources=list(sources)))
    for r in d['rooms']:
        status='présent · plan original'
        ss=['R2'] if r['building']=='Épave' else ['R1'] if r['id'] in ['med','recreation','jorden','pad','greenhouse'] else []
        entry('lieu',r['id'],r['name'],status,'Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.',ss)
    for id,title in [('salvage_bay','Baie et sas du récupérateur'),('salvage_shuttle','Navette retrouvée / couchette de Ripley'),('orbital_medical','Service médical de Gateway Station'),('dropship_arrival','Cabine de descente de Brackett')]:
        entry('lieu',id,title,'manquant','Séquence extérieure au plan colonial, attestée dans l’extrait. Ne pas la relier à la colonie par une porte.',['R1'])
    for id,p in d['appearances'].items():entry('personnage',id,p['name'],'représenté · '+p['identity'],p['visualStatus'],[p['source']] if 'source' in p else [])
    for id,title in [('tim','Tim Jorden'),('simpson','Al Simpson'),('hansard','Greg Hansard'),('joel','Joel'),('bronagh','Bronagh Flaherty'),('finch','Frères Finch'),('monet','Samantha Monet'),('ripley','Ellen Ripley'),('burke','Carter Burke'),('jonesy','Jonesy'),('tressa','Tressa, pilote de descente'),('jernigan','Jernigan, Landers, Fleet et Moore')]:
        if id in d['appearances']:continue
        entry('personnage',id,title,'manquant ou non individualisé','Identité rencontrée dans l’extrait ; présence physique spécifique non livrée.',['R1'])
    gear=[
      ('pulse','M41A','tir et rechargement','silhouette retravaillée ; 30 coups = valeur de jeu'),
      ('flame','M240','tir directionnel facultatif','dotation originale depuis le râtelier ; présence exacte dans le roman non vérifiée'),
      ('grenade','Lance-grenades','projectile et explosion','munitions finies ; sans dégâts à travers un obstacle'),
      ('tracker','Détecteur','contacts locaux et échos','comportement simplifié'),
      ('light','Lampe','batterie et faisceau','règles de jeu'),
      ('weld','Poste à souder','soudures physiques','autorisation requise'),
      ('medkit','Trousse de soins','soins et partage','règle de soin simplifiée'),
      ('flare','Fusée','éclairage et repli','durée simulée'),
      ('decoy','Balise sonore','fabrication et diversion','création de gameplay'),
      ('marker','Balise de repli','repères persistants','création de gameplay'),
      ('tools','Piles, fils, boîtiers','récupération et recettes','création de gameplay'),
      ('rover','Tracteur','conduite et entretien','existence évoquée R1 ; mécanique originale'),
      ('natal','Unité obstétricale','visible et examinable','pas de chirurgie jouable ; emplacement interprété')
    ]
    for id,name,state,note in gear:entry('équipement',id,name,'présent · '+state,note,['R4'] if id=='flame' else ['R1'] if id in ['natal','rover'] else [])
    for id,name in [('cutter','Robot de découpe de récupération'),('scanner','Scanner de récupération'),('suit','Scaphandre de récupération'),('grappler','Grappin de la navette')]:
        entry('équipement',id,name,'manquant','Appartient à la récupération spatiale de l’extrait, pas à attribuer gratuitement aux Marines.',['R1'])
    for id,name in [('smartgun','Smartgun'),('sentry','Tourelle automatique'),('p5000','Power Loader P-5000'),('pistol','Pistolet de service')]:
        entry('équipement',id,name,'à vérifier','Ne pas déduire sa présence dans River of Pain du seul arsenal de la franchise.')
    d['fidelity']={'revision':9,'policy':'roman_prioritaire_puis_reference_filmique_identifiee','completeNovelConsulted':False,
        'warning':'La cible 1:1 reste une direction, pas un état certifié. Les références couvrent un extrait, des entretiens et des silhouettes du film.',
        'coverage':cov,'portalTypes':counters,'allRoomsHaveAuthoredPlans':True,'newRooms':['armory','greenhouse','derelict_gallery','pilot_chamber','egg_vault']}
    m['counts'].update(animatedConnectors=sum(p['kind'] in ('escalier','échelle','corde','monte-charge','sas') for r in d['rooms'] for p in r['portals'])//2,listeningThresholds=sum(len(r['portals']) for r in d['rooms'])//2,rooms=len(d['rooms']),links=sum(len(r['portals']) for r in d['rooms'])//2,
       archives=len(d['archives']),props=sum(len(r['props']) for r in d['rooms']),
       physicalCovers=sum(len(r['cover']) for r in d['rooms']),architecturalEndpoints=sum(len(r['portals']) for r in d['rooms']),
       characterProfiles=len(d['appearances']),fidelityEntries=len(cov),weaponModes=3)
    return d
