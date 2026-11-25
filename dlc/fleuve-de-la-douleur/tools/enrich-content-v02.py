"""Authored additions to the inherited room graph; no canonical measurements claimed."""
def enrich(content):
    rooms=content['rooms']; by={r['id']:r for r in rooms}
    profiles={
      'pad':('exterior','approach_lights','perimeter'), 'airlock':('decontamination','double_bulkhead','habitat'),
      'concourse':('concourse','glazed_gallery','habitat'), 'ops':('command','observation_bay','research'),
      'briefing':('barracks','locker_bays','habitat'), 'hab':('residential','numbered_alcoves','habitat'),
      'jorden':('domestic','low_ceiling','habitat'), 'mess':('canteen','kitchen_pass','habitat'),
      'recreation':('leisure','recessed_arcades','habitat'), 'med':('medical','observation_partitions','medical'),
      'isolation':('medical','sealed_observation','medical'), 'science':('laboratory','containment_bays','research'),
      'records':('archive','server_aisles','research'), 'garage':('hangar','overhead_crane','industry'),
      'survey':('command','survey_wall','habitat'), 'stores':('warehouse','loading_racks','industry'),
      'power':('industrial','busbar_banks','industry'), 'pump':('industrial','collector_wall','industry'),
      'service':('maintenance','pipe_trench','industry'), 'road':('exterior','rock_cutting','perimeter'),
      'plateau':('exterior','survey_ridge','perimeter'), 'derelict':('derelict','organic_vault','perimeter'),
      'processor6':('industrial','heat_exchangers','industry'), 'approach':('exterior','processor_columns','industry'),
      'lift':('shaft','counterweights','industry'), 'hive':('hive','resin_on_steel','industry'),
      'coolant':('hive','buried_exchangers','industry'), 'vent_hab':('vent','habitat_branch','habitat'),
      'vent_med':('vent','observation_grille','medical'), 'vent_survey':('vent','survey_branch','habitat'),
      'refuge':('refuge','service_recess','habitat'), 'hangar':('hangar','shuttle_bay','research'),
      'shuttle':('shuttle','pressure_shell','research'), 'wash':('utility','laundry_racks','habitat'),
      'relay':('archive','relay_backbone','research'), 'clinic_store':('medical','cold_storage','medical')}
    coverKinds={'jorden':['table','cupboard'],'mess':['table','table'],'recreation':['arcade','bench'],
      'med':['bed','cart'],'science':['lab-bench','specimen'],'ops':['console','console'],
      'survey':['table','crate'],'stores':['crate','pallet'],'garage':['tools','wheel'],
      'power':['transformer','coil'],'pump':['tank','pump-motor'],'processor6':['turbine','pipe'],
      'hive':['resin','cocoon'],'coolant':['tank','resin'],'wash':['washer','linen'],
      'concourse':['bench','vending'],'hangar':['fuel','pallet'],'derelict':['rib','rock']}
    details={
      'concourse':['noticeboard','ceiling-light','fire-cabinet','wall-clock','pipe-elbow'],
      'domestic':['photo','mug','hanging-coat','bed-lamp','vent-cover'],
      'residential':['door-plaque','fire-cabinet','pipe-elbow','ceiling-light','noticeboard'],
      'medical':['privacy-screen','oxygen','medical-cross','wall-clock','gurney'],
      'laboratory':['glass-cabinet','lab-bench','oxygen','warning-board','vent-cover'],
      'command':['chair','noticeboard','radio-mast','wall-clock','ceiling-light'],
      'canteen':['chair','mug','kitchen-hood','tray','fire-cabinet'],
      'industrial':['gauge','pipe-elbow','pump-motor','warning-board','cable-tray'],
      'maintenance':['gauge','pipe-elbow','vent-cover','cable-tray','fire-cabinet'],
      'hangar':['chain-hoist','warning-board','hose-reel','tool-board','ceiling-light'],
      'warehouse':['hand-truck','tool-board','warning-board','fire-cabinet','cable-tray'],
      'utility':['hanging-coat','hose-reel','vent-cover','wall-clock','fire-cabinet'],
      'archive':['server','tape-reel','cable-tray','vent-cover','wall-clock'],
      'barracks':['hanging-coat','rifle-case','noticeboard','wall-clock','ceiling-light'],
      'leisure':['chair','noticeboard','mug','wall-clock','fire-cabinet'],
      'decontamination':['oxygen','hose-reel','warning-board','vent-cover','ceiling-light'],
      'exterior':['survey-stake','floodlight','cable-spool','barrier','rock-fragment'],
      'derelict':['rib','rib','rock-fragment','fossil','egg'],
      'hive':['resin','resin','cocoon','pipe-elbow','cable-tray'],
      'shaft':['chain-hoist','warning-board','cable-tray','gauge','ceiling-light'],
      'vent':['duct-junction','vent-cover','cable-tray','bolt-panel','trace-mark'],
      'refuge':['mug','photo','trace-mark','bolt-panel','vent-cover'],
      'shuttle':['hanging-coat','oxygen','warning-board','vent-cover','ceiling-light']}
    # Wall fixtures are arranged in bays; fixtures never create invisible collisions.
    mounted={'photo','medical-cross','wall-clock','noticeboard','warning-board','gauge','vent-cover','door-plaque','tool-board','trace-mark','bolt-panel','tape-reel'}
    for r in rooms:
      style,variant,circuit=profiles[r['id']]
      r['architecture']={'style':style,'variant':variant,'circuit':circuit,'ceilingRatio':.22 if style in ['domestic','vent','refuge'] else .1 if style in ['hangar','shaft','industrial'] else .16,
        'wallModules':max(3,round(r['width']/340)), 'safeFloor':[r['minZ'],r['maxZ']],
        'parallax':{'horizon':.035,'skyline':.12,'structures':.25,'wall':1.0,'foreground':1.025}}
      for i,c in enumerate(r['cover']):
        c['prop']=coverKinds.get(r['id'],[c['prop'],c['prop']])[i]
        for p in r['props']:
          if p.get('collidable') and abs(p['x']-c['x'])<5:p['kind']=c['prop'];p['footprint']={'w':c['w'],'d':c['d']}
      # Replace placeholder fallback 'machine' even in rooms outside coverKinds.
      for p in r['props']:
        if p['kind']=='machine':p['kind']='transformer' if style in ['industrial','maintenance'] else 'crate'
      for j,kind in enumerate(details[style]):
        x=round(r['width']*(.12+j*.19))
        # Keep floor-standing silhouettes clear of functional gateway bays and task objects.
        if kind not in mounted:
          for _ in range(30):
            if all(abs(x-p['x'])>150 for p in r['portals']) and all(abs(x-o['x'])>100 for o in r['objects']):break
            x=110+(x+107)%(r['width']-220)
        r['props'].append({'id':r['id']+'-detail-'+str(j),'kind':kind,'x':x,'z':.38 if r['minZ']!=r['maxZ'] else .7,'layer':'FIXTURES' if kind in mounted else 'ACTORS','collidable':False,'mount': 'wall' if kind in mounted else 'floor','purpose':'Usage quotidien, identité du lieu et orientation'})
      r['phaseDressing']=[{'id':r['id']+'-phase-'+str(n),'kind':kind,'x':round(r['width']*f),'z':.77,'fromPhase':phase}
         for n,(kind,f,phase) in enumerate([('paper-trail',.23,1),('emergency-arrow',.49,2),('broken-light',.74,2),('scorch',.88,3)])] if style not in ['exterior','vent','refuge','derelict'] else []
    # 18 hide locations: none grants invulnerability when entered under close pursuit.
    hideRooms=['airlock','briefing','hab','jorden','mess','recreation','med','isolation','records','survey','stores','service','power','wash','clinic_store','vent_hab','vent_survey','refuge']
    for rid in hideRooms:
      r=by[rid];x=round(r['width']*.87);z=.82 if r['minZ']!=r['maxZ'] else .7
      occupied=[*r['portals'],*r['objects']]
      for _ in range(50):
        if all(abs(x-v['x'])>125 for v in occupied) and all(abs(x-c['x'])>c['w']/2+65 or abs(z-c['z'])>c['d']/2+.07 for c in r['cover']):break
        x=120+(x+137)%(r['width']-240)
      r['objects'].append({'id':'hide-'+rid,'kind':'hide','label':'Se glisser dans le renfoncement' if r['kind']=='vent' else 'Se cacher dans le placard de service','x':x,'z':z,'description':'Rester silencieux. Une créature qui vous a vu entrer peut vous débusquer.'})
    # Existing circuit actions are now real switch boards with finite demand and safety interlocks.
    boards={
     'grid':dict(title='Départ du bloc habitat',kind='power',circuit='habitat',capacity=4,channels=[['Chauffage',3,True],['Éclairage des logements',1,True],['Buanderie',2,False]],hint='Alimentez le chauffage et les logements. La buanderie peut attendre.'),
     'shelter':dict(title='Tableau du refuge provisoire',kind='power',circuit='industry',capacity=3,channels=[['Éclairage du refuge',1,True],['Ventilation du refuge',2,True],['Treuil de fret',3,False]],hint='Gardez la lumière et l’air. Le treuil doit rester coupé.'),
     'emergency':dict(title='Secours de la maintenance',kind='power',circuit='industry',capacity=4,channels=[['Pompes de circulation',2,True],['Éclairage des paliers',2,True],['Atelier des prospecteurs',3,False]],hint='Répartissez la réserve entre les pompes et les paliers.'),
     'last_power':dict(title='Dernière réserve du bureau',kind='power',circuit='habitat',capacity=2,channels=[['Verrou de la porte',1,True],['Balise du conduit',1,True],['Radio générale',2,False]],hint='Le verrou et la balise. Rien d’autre ne doit tirer sur cette batterie.'),
     'pressure':dict(title='Collecteur du processeur six',kind='valve',circuit='industry',capacity=2,channels=[['Arrivée principale',1,False],['Purge protégée',1,True],['Dérivation de secours',1,True]],hint='Fermez l’arrivée principale, ouvrez la purge et la dérivation.'),
     'reroute':dict(title='Collecteur de la station de pompage',kind='valve',circuit='industry',capacity=2,channels=[['Conduite du passage',1,False],['Retour au réservoir',1,True],['Soupape de sécurité',1,True]],hint='Isolez le passage, puis ouvrez le retour et la soupape.')}
    for bid,b in boards.items():
      b['id']=bid;b['room']=next(r['id'] for r in rooms if any(o['id']==bid for o in r['objects']))
      b['initial']=[False,False,True] if b['kind']=='power' else [True,False,False]
    # Physical pressure jets; sources turn safe only once the corresponding valve task is completed.
    hazards=[{'id':'jet-processor6','room':'processor6','x':2350,'z':.82,'period':6,'activeFor':2.1,'disableFlag':'pressure','damage':12},
             {'id':'jet-pump','room':'pump','x':1870,'z':.82,'period':6.8,'activeFor':2.0,'disableFlag':'reroute','damage':10}]
    content['boards']=boards;content['hazards']=hazards
    content['circuits']={'habitat':{'label':'Habitat','minPhase':2},'medical':{'label':'Médical','minPhase':3},'research':{'label':'Recherche','minPhase':3},'industry':{'label':'Maintenance','minPhase':2},'perimeter':{'label':'Périmètre','minPhase':9}}
    content['doorTasks']={'quarantine':['isolation','med'],'barricade':['survey','garage'],'withdraw':['power','coolant'],'vent_open':['survey','vent_survey']}
    content['manifest'].update(version='0.2.0-candidate.1',subtitle='Hadley’s Hope · Les réseaux se brisent')
    content['manifest']['counts'].update(props=sum(len(r['props']) for r in rooms),hideouts=len(hideRooms),switchboards=len(boards),steamHazards=len(hazards),architectureFamilies=len(set(p[0] for p in profiles.values())),phaseDetails=sum(len(r['phaseDressing']) for r in rooms))
    return content
