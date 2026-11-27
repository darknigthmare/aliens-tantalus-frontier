"""Original local residents and scarce field supplies. No canonical cast replacement."""
from math import hypot

def enrich(content):
    rooms={r['id']:r for r in content['rooms']}
    def free(r,x,z):
        return 80<x<r['width']-80 and all(abs(x-c['x'])>=c['w']/2+34 or abs(z-c['z'])>=c['d']/2+.05 for c in r['cover'])
    def spot(rid,preferred,reserved=()):
        r=rooms[rid];z=.84 if r['minZ']!=r['maxZ'] else .7
        candidates=[x for x in range(130,r['width']-130,20) if free(r,x,z) and all(abs(x-o['x'])>150 for o in r['objects']+r['portals']) and all(abs(x-p)>160 for p in reserved)]
        if not candidates: raise ValueError('No distinct interactive slot in '+rid)
        return dict(x=min(candidates,key=lambda x:abs(x-preferred)),z=z)
    rows=[
      ('vale','Iona Vale','Maintenance de l’habitat','hab','#658b89','#b48664','short','tools',
       'Le chauffage finit toujours par gagner contre les coupe-circuits. Jusqu’au prochain quart.',
       'J’ai fermé deux logements vides pour garder les autres au chaud. Je n’aime pas ce silence derrière les portes.',
       'Les plaques jaunes suivent le départ habitat. Le tableau est en bas, après le magasin de fret. Ne réarmez pas tout ensemble.',
       'L’escalier du personnel débouche près de la cuisine. Sa poignée manque : la relève l’a laissée au réfectoire.'),
      ('rhee','Malik Rhee','Cuisine collective','mess','#ab9066','#755340','cap','mug',
       'Le café est tiède, mais il est là. Aujourd’hui, c’est une réussite.',
       'Je prépare des portions froides. Quand les gens restent près de l’infirmerie, ils oublient de manger.',
       'Les rations de service sont dans la caisse grise. Prenez seulement ce qui vous manque : personne ne la remplit entre deux passages.',
       'L’office a un autre accès vers l’habitat. Regardez le mécanisme avant de partir chercher sa pièce.'),
      ('arden','Vera Arden','Soins de proximité','med','#b2c6ba','#d3ad8d','tied','tablet',
       'Posez les caisses près du mur. L’allée entre les lits doit rester libre.',
       'On nous apporte des questions à chaque porte. J’aurais préféré des couvertures propres.',
       'Une trousse emportée n’est plus disponible dans le tiroir. Les réserves de cet atelier sont limitées, même si vous revenez avec un autre uniforme.',
       'L’atelier biomédical rejoint la réserve. Le contacteur du verrou est à remplacer ; ne comptez pas sur cette porte avant la réparation.'),
      ('becker','Arun Becker','Archivage des relevés','records','#7385a0','#976b53','short','tablet',
       'La machine a perdu une ligne. La feuille papier, elle, n’a pas bougé.',
       'Je garde une copie locale de chaque message. Ce qui disparaît du réseau ne devrait pas disparaître de nos souvenirs.',
       'Les documents trouvés restent dans votre carnet. Mes échanges restent dans le registre des personnes rencontrées, pas dans le compteur des notes.',
       'Un coupleur de la terrasse a été rangé ici. Il concerne la liaison intérieure, pas un appel vers un vaisseau.'),
      ('ferris','Solène Ferris','Manutention du fret','stores','#b59258','#aa7558','cap','tools',
       'Chaque palette a sa place. C’est quand on les empile devant les issues que ça devient dangereux.',
       'J’ai dégagé les allées. Les couvertures sont sur le côté, pas sous les charges.',
       'Les coffres gardent ce que vous y laissez. Un fermoir ouvert reste ouvert ; inutile de recommencer la fouille.',
       'Le garage mène à l’atelier de manutention. Le palan est immobilisé. La chaîne de rechange n’est pas ici, elle est au garage.'),
      ('corban','Nils Corban','Relais des transmissions','relay','#648995','#c7a486','short','tablet',
       'Le vent fait chanter les haubans avant qu’on l’entende dans les fenêtres.',
       'Le réseau intérieur tient par intermittence. Je note les silences aussi soigneusement que les réponses.',
       'La terrasse sert aux liaisons de la colonie. Un voyant vert ici ne signifie pas que quelqu’un nous a entendus ailleurs.',
       'L’antenne a un palier vers le contrôle colonial. Tant que le coupleur manque, l’accès de service reste condamné.'),
      ('hale','Ezra Hale','Atelier des prospecteurs','garage','#aa7961','#83604e','cap','tools',
       'Ne passez pas sous le palan. À l’arrêt, une machine reste une machine lourde.',
       'Le tracteur est prêt, mais la piste n’a jamais été une promenade. Gardez les balises du même côté au retour.',
       'Un boîtier, un fil et une pile font une balise sonore sur un établi. Elle n’explose pas. Il faut la poser puis s’éloigner avant ses bips.',
       'Le bruit peut détourner une créature qui vous a perdu. Il ne lui fera pas oublier quelqu’un qu’elle voit déjà.'),
      ('doran','Mei Doran','Maintenance biomédicale','biomed','#85a59b','#d0ab89','tied','tablet',
       'Il manque toujours une pièce. Aujourd’hui, au moins, je sais laquelle.',
       'J’ai séparé les pièces réparables des appareils contaminés. Regardez les étiquettes avant de toucher.',
       'L’établi peut assembler une balise sonore ou utiliser une pile pour la lampe. Les composants ne sont consommés qu’à la fin de la manœuvre.',
       'Le travail au banc reste exposé. Éloignez-vous ou interrompez-vous plutôt que terminer coûte que coûte sous une attaque.'),
      ('sato','Lina Sato','Lingerie de service','wash','#958799','#bd9172','tied','linen',
       'Les draps propres sont à gauche. Ceux qui attendent leur étiquette ne partent nulle part.',
       'On demande plus de linge à l’infirmerie. J’attends qu’on me dise quelle porte garder fermée.',
       'Vous pouvez ouvrir un fermoir lentement, ou le forcer plus vite. Le bruit du second choix n’est pas seulement une animation.',
       'Les coursives mènent aux logements. Une porte de logement dessinée sur un panneau n’est pas forcément une issue praticable.'),
      ('bell','Tomas Bell','Entretien des loisirs','recreation','#82985e','#d6b99a','short','tools',
       'Le jeu de droite redémarre tout seul. Je lui accorde encore une chance.',
       'Les machines sont coupées. On entend les conversations du couloir sans avoir besoin de hausser la voix.',
       'Les pas pressés couvrent les petits bruits. Pour écouter à une porte, restez immobile et laissez retomber votre propre vacarme.',
       'Les enfants connaissent les conduits. Ce n’est pas un accès de secours pour un adulte chargé de matériel.'),
      ('kent','Rosa Kent','Accueil des arrivants','concourse','#9b8464','#8e634c','tied','tablet',
       'Les nouveaux cherchent les bureaux. Les habitués cherchent la cafetière.',
       'Je répète les dernières consignes tant que le haut-parleur répond. Après, il faudra parler aux gens un par un.',
       'Le plan vous aide à choisir une porte, pas à voyager à sa place. Les niveaux sont reliés par les vrais accès de la colonie.',
       'Les personnes du registre n’émettent pas de balise de suivi. Leur dernière position est un souvenir, pas une promesse de les y retrouver.'),
      ('voss','Anton Voss','Relevés des prospecteurs','survey','#879aa3','#c3a18a','short','tablet',
       'Le relief change de couleur à chaque éclaircie. Les coordonnées, elles, restent les mêmes.',
       'Les feuilles du secteur sont revenues couvertes de poussière. Les questions suivent plus vite que les réponses.',
       'Les caisses d’outillage contiennent des pièces utiles aux adultes. Les enfants ne prennent ni munitions ni balises sonores.',
       'Un détour reste facultatif. Avant de réparer une issue, vérifiez de quel côté se trouve votre prochain objectif.')]
    residents=[]
    for i,row in enumerate(rows):
        ident,name,role,rid,color,skin,hair,tool,normal,incident,work,route=row
        if rid not in rooms: raise ValueError(rid)
        r=rooms[rid];p=spot(rid,600+(i%3)*360)
        # Clear horizontal walks on the same accessible strip. NPCs never obstruct doors.
        xs=[p['x']]
        for offset in [240,-180,360,-300]:
            x=p['x']+offset
            if free(r,x,p['z']) and all(free(r,xx,p['z']) for xx in range(int(min(x,p['x'])),int(max(x,p['x']))+1,10)):
                xs.append(x)
                if len(xs)==3:break
        if len(xs)<2: raise ValueError('No safe resident route in '+rid)
        residents.append(dict(id=ident,name=name,role=role,room=rid,minPhase=0,maxPhase=1,height=93+(i%4)*3,color=color,skin=skin,hair=hair,tool=tool,
          points=[dict(x=x,z=p['z']) for x in xs],refuge=dict(x=xs[-1],z=p['z']),intro=[normal,incident],
          topics=[dict(id='work',label='Votre poste et votre matériel',text=work),dict(id='route',label='Les passages du secteur',text=route)],origin='original_gameplay_resident'))
    chest_rows=[
      ('arrivals','Casier de relève','concourse',1970,'locker',dict(cell=2,wire=1)),
      ('garrison','Mallette de terrain','briefing',1330,'toolcase',dict(casing=1,wire=1,ammo=18)),
      ('kitchen','Réserve de portions froides','mess',1740,'foodcase',dict(ration=2,cell=1)),
      ('habitat','Tiroir du logement','jorden',1320,'drawer',dict(ration=1,medkit=1)),
      ('medical','Coffret de soins','med',2190,'medical',dict(medkit=2,cell=1)),
      ('biomedical','Pièces de diagnostic','biomed',1580,'toolcase',dict(cell=1,wire=2,casing=1)),
      ('archive','Tiroir des transmissions','records',1110,'drawer',dict(wire=1,casing=1)),
      ('garage','Caisse des prospecteurs','garage',1840,'toolcase',dict(cell=2,wire=1,casing=2)),
      ('cargo','Coffre de dotation','stores',1880,'locker',dict(flare=2,ammo=24)),
      ('laundry','Panier de dépannage','wash',1340,'foodcase',dict(ration=1,medkit=1)),
      ('workshop','Mallette du palan','workshop',1970,'toolcase',dict(wire=2,cell=1,casing=1)),
      ('vent','Petite boîte oubliée','vent_hab',1410,'foodcase',dict(ration=2))]
    containers=[]
    for id,label,rid,x,kind,items in chest_rows:
        p=spot(rid,x,[d['points'][0]['x'] for d in residents if d['room']==rid])
        containers.append(dict(id='supply-'+id,label=label,room=rid,kind=kind,items=items,**p))
    benches=[]
    for id,label,rid,x in [('garrison','Banc de préparation','briefing',1830),('biomed','Établi biomédical','biomed',1850),('workshop','Établi de maintenance','workshop',2310)]:
        p=spot(rid,x,[c['x'] for c in containers if c['room']==rid]+[d['points'][0]['x'] for d in residents if d['room']==rid])
        benches.append(dict(id='bench-'+id,label=label,room=rid,**p))
    content['life']={'residents':residents,'containers':containers,'benches':benches,
      'items':{'cell':{'label':'Pile de service','capacity':6},'wire':{'label':'Fil de raccordement','capacity':6},'casing':{'label':'Boîtier vide','capacity':4},'decoy':{'label':'Balise sonore','capacity':2},'ration':{'label':'Portion froide','healing':25},'medkit':{'label':'Trousse de soins','capacity':8},'ammo':{'label':'Munitions M41A','capacity':150},'flare':{'label':'Fusée de détresse','capacity':8}},
      'recipes':{'decoy':{'label':'Assembler une balise sonore','cost':{'cell':1,'wire':1,'casing':1},'duration':2.4},'charge':{'label':'Recharger la lampe avec une pile','cost':{'cell':1},'duration':1.6}}}
    m=content['manifest'];m['version']='0.5.0-candidate.1';m['subtitle']='Hadley’s Hope · Ceux qui habitaient ici'
    m['counts'].update(residents=len(residents),residentTopics=sum(len(r['topics']) for r in residents),searchableContainers=len(containers),craftingBenches=len(benches),recipes=2)
    return content
